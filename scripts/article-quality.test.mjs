import assert from 'node:assert/strict';
import test from 'node:test';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { applyEdits, chineseSuggestions, formatArticle, proseOnly, validateArticle } from './article-quality-lib.mjs';
import { articlePaths, requireCleanStaging } from './article-quality.mjs';

const front = "+++\ntitle = '测试'\ndate = 2026-10-29T09:28:11+09:00\ncategories = ['diary']\ntags = ['diary']\ndraft = false\n+++\n\n";
const rules = [{ from: '再接再励', to: '再接再厉', reason: '成语' }];

test('spacing, headings, blank lines and idempotence; no number or word rewrite', () => {
  const input = front + '## 标题\n测试AI与11月。五年以后。\n\n\n正文**AI**测试。\n\n\n';
  const result = formatArticle(input);
  assert.equal(result, front + '## 标题\n\n测试 AI 与 11 月。五年以后。\n\n正文 **AI** 测试。\n');
  assert.equal(formatArticle(result), result);
  assert.ok(result.startsWith(front));
  assert.deepEqual(validateArticle(result), []);
});

test('code, math, links, TOML, HTML, escapes, shortcodes, tables and hard breaks survive', () => {
  const protectedBody = '```js\nconst x = "中文AI";  \n\n\n```\n\n' +
    '`中文AI` 与 $中文AI$\n\n$$中文AI+1$$\n\n' +
    '[中文AI](https://example.com/中文AI) ![中文AI](a.png)\n\n' +
    '<div title="中文AI">中文AI</div>\n\n{{< note title="中文AI" >}}\n\n' +
    '中文\\*AI &amp;中文AI\n\n| 中文AI | test |\n| --- | --- |\n| a | b |\n\n两字  \n换行\n';
  // Table cell prose is formatted, but its Markdown structure is preserved.
  const result = formatArticle(front + protectedBody);
  assert.equal(result, front + protectedBody.replace('| 中文AI |', '| 中文 AI |'));
  assert.equal(formatArticle(result), result);
  const prose = proseOnly(front + protectedBody);
  assert.ok(!prose.includes('const x'));
  assert.ok(!prose.includes('https'));
  assert.ok(!prose.includes('title='));
});

test('CRLF is preserved; opt-out leaves deliberate poetry/quotations untouched', () => {
  const crlf = (front + '中文AI\n').replaceAll('\n', '\r\n');
  assert.equal(formatArticle(crlf), crlf.replace('中文AI', '中文 AI'));
  const optedOut = front + '<!-- article-quality: skip -->\n中文AI再接再励\n\n\n';
  assert.equal(formatArticle(optedOut), optedOut);
  assert.deepEqual(chineseSuggestions(optedOut, rules), []);
});

test('metadata and fences fail safely; legacy optional description remains supported', () => {
  assert.deepEqual(validateArticle(front + '正文\n'), []);
  assert.ok(validateArticle(front.replace("tags = ['diary']", "tags = 'diary'"))[0].includes('tags'));
  assert.ok(validateArticle(front.replace('+++\n', '++\n')).length);
  assert.ok(validateArticle(front + '```js\nlet x;\n').some(x => x.includes('围栏未闭合')));
  assert.deepEqual(validateArticle(front + '~~~\n```\n~~~\n'), []);
});

test('proofreading keeps original offsets and never replaces protected content', () => {
  const input = front + '再接再励。\n\n`再接再励` [再接再励](https://a.com) $再接再励$\n';
  const suggestions = chineseSuggestions(input, rules);
  assert.equal(suggestions.length, 1);
  assert.equal(suggestions[0].line, 9);
  assert.equal(applyEdits(input, suggestions), input.replace('再接再励。', '再接再厉。'));
  assert.throws(() => chineseSuggestions(input, [...rules, ...rules]), /重叠/u);
  assert.equal(proseOnly(input).length, input.length);
});

test('only article paths are selected; partially staged files are rejected', () => {
  assert.deepEqual(articlePaths(['README.md', 'content/posts/一 篇.md', 'themes/a.md', 'content/posts/a.md', 'content/posts/a.md']),
    ['content/posts/a.md', 'content/posts/一 篇.md']);
  assert.throws(() => requireCleanStaging(['a.md'], ['a.md']), /同时/u);
  requireCleanStaging(['a.md'], ['b.md']);
});

test('actual Git index: format only staged article; partial staging leaves both versions intact', () => {
  const parent = realpathSync(os.tmpdir());
  const dir = mkdtempSync(path.join(parent, 'blog-quality-test-'));
  const script = fileURLToPath(new URL('./article-quality.mjs', import.meta.url));
  const git = args => execFileSync('git', args, { cwd: dir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  try {
    git(['init', '-q']);
    mkdirSync(path.join(dir, 'content/posts'), { recursive: true });
    const file = 'content/posts/一 篇.md';
    writeFileSync(path.join(dir, file), front + '中文AI\n');
    git(['add', '--', file]);
    execFileSync(process.execPath, [script, 'staged'], { cwd: dir });
    assert.equal(git(['show', `:${file}`]), front + '中文 AI\n');
    const index = git(['show', `:${file}`]);
    writeFileSync(path.join(dir, file), front + '另有未暂存的修改AI\n');
    assert.throws(() => execFileSync(process.execPath, [script, 'staged'], { cwd: dir, stdio: 'pipe' }));
    assert.equal(git(['show', `:${file}`]), index);
    assert.equal(readFileSync(path.join(dir, file), 'utf8'), front + '另有未暂存的修改AI\n');
  } finally {
    // Only remove the disposable directory created by this test, after checking its absolute parent.
    if (path.dirname(realpathSync(dir)) !== parent || !path.basename(dir).startsWith('blog-quality-test-')) throw new Error('Unexpected test path');
    rmSync(dir, { recursive: true, force: true });
  }
});

test('English spelling checker returns suggestions without editing text', async () => {
  const { spellCheckDocument } = await import('cspell-lib');
  const input = front + '这是speling，Codex。\n\n`speling`\n';
  const result = await spellCheckDocument({ uri: 'file:///test.txt', text: proseOnly(input), languageId: 'plaintext', locale: 'en' },
    { noConfigSearch: true, generateSuggestions: true }, { words: ['Codex'], numSuggestions: 3 });
  assert.equal(result.issues.length, 1);
  assert.equal(result.issues[0].text, 'speling');
  assert.ok(result.issues[0].suggestions.includes('spelling'));
  assert.equal(input.slice(result.issues[0].offset, result.issues[0].offset + 7), 'speling');
});

test('proofreading CLI generates a candidate, report and stable per-article branch; second run is empty', () => {
  const parent = realpathSync(os.tmpdir());
  const dir = mkdtempSync(path.join(parent, 'blog-quality-test-'));
  const script = fileURLToPath(new URL('./article-quality.mjs', import.meta.url));
  const file = 'content/posts/校对.md';
  try {
    mkdirSync(path.join(dir, 'content/posts'), { recursive: true });
    writeFileSync(path.join(dir, '.article-quality.json'), JSON.stringify({ words: ['Codex'], chineseTypos: rules }));
    writeFileSync(path.join(dir, file), front + '再接再励，speling。\n\n`再接再励`\n');
    const output = path.join(dir, 'outputs.txt');
    const summary = path.join(dir, 'summary.md');
    const env = { ...process.env, GITHUB_OUTPUT: output, GITHUB_STEP_SUMMARY: summary };
    execFileSync(process.execPath, [script, 'proofread', '--apply', file], { cwd: dir, env });
    const result = readFileSync(path.join(dir, file), 'utf8');
    assert.equal(result, front + '再接再厉，speling。\n\n`再接再励`\n');
    const first = readFileSync(output, 'utf8');
    assert.match(first, /has_fixes=true/u);
    assert.match(first, /branch=bot\/proofread-[a-f0-9]{16}/u);
    assert.match(readFileSync(summary, 'utf8'), /spelling/u);
    assert.ok(!first.includes('\n' + file));
    writeFileSync(output, '');
    execFileSync(process.execPath, [script, 'proofread', '--apply', file], { cwd: dir, env });
    const second = readFileSync(output, 'utf8');
    assert.match(second, /has_fixes=false/u);
    assert.equal(first.match(/branch=(.*)/u)[1], second.match(/branch=(.*)/u)[1]);
  } finally {
    if (path.dirname(realpathSync(dir)) !== parent || !path.basename(dir).startsWith('blog-quality-test-')) throw new Error('Unexpected test path');
    rmSync(dir, { recursive: true, force: true });
  }
});
