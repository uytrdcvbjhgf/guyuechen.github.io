import { execFileSync } from 'node:child_process';
import { appendFileSync, existsSync, lstatSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { applyEdits, chineseSuggestions, formatArticle, proseOnly, validateArticle } from './article-quality-lib.mjs';

function git(args, options = {}) {
  return execFileSync('git', args, { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024, ...options });
}
export function articlePaths(names) {
  return [...new Set(names)].filter(name => /^content\/posts\/.+\.md$/u.test(name)).sort();
}
export function requireCleanStaging(staged, unstaged) {
  const partial = staged.filter(name => unstaged.includes(name));
  if (partial.length) throw new Error(`以下文章同时有已暂存和未暂存修改。请先分别提交，或完整 git add 后重试；未自动暂存你的其他修改：\n${partial.join('\n')}`);
}
function pathsFromDiff(args) {
  return articlePaths(git(['diff', '--name-only', '-z', '--diff-filter=ACMR', ...args]).split('\0').filter(Boolean));
}
function selectedFiles(mode, args) {
  if (mode === 'staged') return pathsFromDiff(['--cached']);
  if (args.length) return articlePaths(args.map(name => name.replaceAll('\\', '/')));
  if (process.env.ARTICLE_FILE) {
    const names = articlePaths([process.env.ARTICLE_FILE]);
    if (names.length !== 1) throw new Error('ARTICLE_FILE 必须为 content/posts/ 下的单篇 .md 文章。');
    return names;
  }
  if (mode === 'list' || process.env.GITHUB_ACTIONS) {
    const head = process.env.ARTICLE_HEAD || 'HEAD';
    let base = process.env.ARTICLE_BASE;
    if (!base || /^0+$/u.test(base)) {
      try { base = git(['rev-parse', `${head}^`]).trim(); }
      catch { base = git(['hash-object', '-t', 'tree', '--stdin'], { input: '' }).trim(); }
    }
    return pathsFromDiff([base, head]);
  }
  return pathsFromDiff(['--cached']);
}
function readArticle(name) {
  if (!articlePaths([name]).length || name.split('/').includes('..') || /[\r\n]/u.test(name)) throw new Error(`不允许的文章路径：${name}`);
  const root = realpathSync('content/posts');
  if (lstatSync(name).isSymbolicLink()) throw new Error(`不处理符号链接：${name}`);
  const resolved = realpathSync(name);
  if (!resolved.startsWith(root + path.sep)) throw new Error(`文章必须位于 content/posts/ 内：${name}`);
  const source = readFileSync(name, 'utf8');
  const errors = validateArticle(source);
  if (errors.length) throw new Error(`${name}\n${errors.join('\n')}`);
  return source;
}
const md = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('|', '&#124;').replaceAll('`', '&#96;').replace(/[\r\n]+/gu, ' ');
const commandEscape = value => String(value).replaceAll('%', '%25').replaceAll('\r', '%0D').replaceAll('\n', '%0A');
const propertyEscape = value => commandEscape(value).replaceAll(':', '%3A').replaceAll(',', '%2C');
function warning(file, line, message) {
  if (process.env.GITHUB_ACTIONS) console.log(`::warning file=${propertyEscape(file)},line=${line}::${commandEscape(message)}`);
}
async function proofread(files, apply) {
  if (apply && files.length !== 1) throw new Error('生成校对 PR 时必须指定单篇文章。');
  const config = JSON.parse(readFileSync('.article-quality.json', 'utf8'));
  const { spellCheckDocument } = await import('cspell-lib');
  const report = ['# 文章校对建议', '', '这是规则词典与英文拼写检查，不是 AI 语义校对。建议可能误报，请结合上下文审阅；不自动合入。', ''];
  let hasFixes = false;
  let branch = '';
  for (const file of files) {
    const source = readArticle(file);
    const chinese = chineseSuggestions(source, config.chineseTypos);
    const spelling = await spellCheckDocument({ uri: pathToFileURL(path.resolve(file)).href,
      text: proseOnly(source), languageId: 'plaintext', locale: 'en' },
    { generateSuggestions: true, noConfigSearch: true },
    { words: config.words, numSuggestions: 3, allowCompoundWords: true, loadDefaultConfiguration: true });
    if (spelling.errors?.length || spelling.dictionaryErrors?.size || spelling.configErrors?.length) {
      throw new Error(`英文词典加载失败：${file}，请查看依赖安装与词典配置。`);
    }
    report.push(`## ${md(file)}`, '', '| 行 | 原文 | 建议 | 说明 |', '| --- | --- | --- | --- |');
    for (const issue of chinese) {
      report.push(`| ${issue.line} | ${md(issue.text)} | ${md(issue.value)} | ${md(issue.reason)} |`);
      warning(file, issue.line, `${issue.text} → ${issue.value}；${issue.reason}`);
    }
    for (const issue of spelling.issues) {
      const line = source.slice(0, issue.offset).split('\n').length;
      const suggestions = issue.suggestions?.join(' / ') || '请人工核对，或加入项目词表';
      report.push(`| ${line} | ${md(issue.text)} | ${md(suggestions)} | 英文疑似拼写问题，仅建议，不自动替换 |`);
      warning(file, line, `英文拼写：${issue.text}；${suggestions}`);
    }
    if (!chinese.length && !spelling.issues.length) report.push('| — | — | 无词典命中 | 不代表全文绝无错误 |');
    report.push('');
    if (apply && chinese.length) {
      const result = formatArticle(applyEdits(source, chinese));
      const errors = validateArticle(result);
      if (errors.length) throw new Error(errors.join('\n'));
      writeFileSync(file, result);
      hasFixes = true;
    }
    branch = `bot/proofread-${createHash('sha256').update(file).digest('hex').slice(0, 16)}`;
  }
  report.push('仅中文词典命中的候选替换会进入 PR；英文建议保留在此报告。代码、公式、链接、元数据及带 skip 标记的文章不校对。', '',
    '如不接受建议，可关闭 PR；如为常用专名，可修改 .article-quality.json 的 words；中文词典可按写作习惯删改。', '');
  mkdirSync('.article-quality', { recursive: true });
  const reportPath = `.article-quality/${branch.replace('bot/', '') || 'report'}.md`;
  writeFileSync(reportPath, report.join('\n'));
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, report.join('\n'));
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT,
    `has_fixes=${hasFixes}\nbranch=${branch}\nreport_path=${reportPath}\n`);
  console.log(`校对报告：${reportPath}；候选修正：${hasFixes ? '有' : '无'}。`);
}

export async function main(args) {
  const [mode = 'check', ...rest] = args;
  if (!['list', 'check', 'format', 'staged', 'proofread'].includes(mode)) throw new Error('未知命令。');
  const apply = rest.includes('--apply');
  const files = selectedFiles(mode, rest.filter(arg => arg !== '--apply'));
  if (mode === 'list') {
    console.log(JSON.stringify(files));
    if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `files=${JSON.stringify(files)}\ncount=${files.length}\n`);
    return;
  }
  if (!files.length) { console.log('本次没有需要处理的文章。'); return; }
  if (mode === 'proofread') { await proofread(files, apply); return; }
  if (mode === 'staged') requireCleanStaging(files, pathsFromDiff([]));
  // Validate everything before writing anything. A bad second file cannot half-format a commit.
  const results = files.map(file => {
    const source = readArticle(file);
    return { file, source, result: formatArticle(source) };
  });
  const changed = results.filter(x => x.source !== x.result);
  if (mode === 'check' && changed.length) {
    throw new Error(`文章格式检查未通过。先运行 npm run articles:format -- <文章路径> 并提交：\n${changed.map(x => x.file).join('\n')}`);
  }
  if (mode !== 'check') {
    for (const { file, result } of changed) writeFileSync(file, result);
    if (mode === 'staged' && changed.length) git(['--literal-pathspecs', 'add', '--', ...changed.map(x => x.file)]);
  }
  console.log(`已${mode === 'check' ? '检查' : '处理'} ${files.length} 篇文章，${changed.length} 篇需要格式修复。`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { await main(process.argv.slice(2)); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
