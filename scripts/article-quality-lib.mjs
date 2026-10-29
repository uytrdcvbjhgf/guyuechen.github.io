import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import { parse as parseToml } from 'smol-toml';

const parser = unified().use(remarkParse).use(remarkFrontmatter, ['toml'])
  .use(remarkGfm).use(remarkMath);
const excluded = new Set(['toml', 'code', 'inlineCode', 'html', 'math', 'inlineMath',
  'link', 'linkReference', 'image', 'imageReference', 'definition']);
const han = /\p{Script=Han}/u;
const ascii = /[A-Za-z0-9]/;
const skip = '<!-- article-quality: skip -->';

function walk(node, visit) {
  visit(node);
  for (const child of node.children ?? []) walk(child, visit);
}

export function textRanges(source) {
  if (source.includes(skip)) return [];
  const ranges = [];
  function visit(node) {
    if (excluded.has(node.type)) return;
    if (node.type === 'text') {
      const { start, end } = node.position;
      const raw = source.slice(start.offset, end.offset);
      // Escapes, entities and Hugo shortcodes need their original spelling.
      if (!/[\\&]|\{\{[<%]/u.test(raw)) ranges.push([start.offset, end.offset]);
    }
    for (const child of node.children ?? []) visit(child);
  }
  visit(parser.parse(source));
  return ranges;
}

export function applyEdits(source, edits) {
  for (const { start, end, value } of edits.sort((a, b) => b.start - a.start)) {
    source = source.slice(0, start) + value + source.slice(end);
  }
  return source;
}

export function validateArticle(source) {
  const errors = [];
  const match = source.match(/^\+\+\+\r?\n([\s\S]*?)\r?\n\+\+\+(?:\r?\n|$)/u);
  if (!match) return ['文章必须以闭合的 +++ TOML front matter 开头。'];
  try {
    const meta = parseToml(match[1]);
    if (typeof meta.title !== 'string' || !meta.title.trim()) errors.push('title 必须为非空字符串。');
    if (!(meta.date instanceof Date) && !(typeof meta.date === 'string' && !Number.isNaN(Date.parse(meta.date)))) {
      errors.push('date 必须为有效日期。');
    }
    for (const key of ['categories', 'tags']) {
      if (!Array.isArray(meta[key]) || !meta[key].length || meta[key].some(x => typeof x !== 'string' || !x.trim())) {
        errors.push(`${key} 必须为非空字符串数组。`);
      }
    }
    if (meta.draft !== undefined && typeof meta.draft !== 'boolean') errors.push('draft 必须为布尔值。');
    if (meta.description !== undefined && typeof meta.description !== 'string') errors.push('description 必须为字符串。');
  } catch (error) {
    errors.push(`TOML 无效：${error.message}`);
  }
  walk(parser.parse(source), node => {
    if (node.type !== 'code') return;
    const raw = source.slice(node.position.start.offset, node.position.end.offset);
    const lines = raw.split(/\r?\n/u);
    const fence = lines[0].match(/^ {0,3}(`{3,}|~{3,})/u)?.[1];
    if (fence && (lines.length < 2 || !new RegExp(`^ {0,3}${fence[0]}{${fence.length},}\\s*$`, 'u').test(lines.at(-1)))) {
      errors.push(`第 ${node.position.start.line} 行代码围栏未闭合。`);
    }
  });
  return errors;
}

export function formatArticle(source) {
  if (source.includes(skip)) return source;
  const edits = textRanges(source).map(([start, end]) => ({ start, end,
    value: source.slice(start, end)
      .replace(/(\p{Script=Han})([A-Za-z0-9])/gu, '$1 $2')
      .replace(/([A-Za-z0-9])(\p{Script=Han})/gu, '$1 $2')
  }));
  function visit(node) {
    if (excluded.has(node.type)) return;
    // Keep emphasis delimiters in place; put spacing outside them.
    if (node.type === 'strong' || node.type === 'emphasis') {
      const start = node.position.start.offset;
      const end = node.position.end.offset;
      const text = node.children.map(x => x.value ?? '').join('');
      const boundary = (a, b) => a && b && ((han.test(a) && ascii.test(b)) || (ascii.test(a) && han.test(b)));
      if (boundary(source[start - 1], text[0])) edits.push({ start, end: start, value: ' ' });
      if (boundary(text.at(-1), source[end])) edits.push({ start: end, end, value: ' ' });
    }
    for (const child of node.children ?? []) visit(child);
  }
  visit(parser.parse(source));
  const spaced = applyEdits(source, edits);
  const tree = parser.parse(spaced);
  const protectedLines = new Set();
  walk(tree, node => {
    if (excluded.has(node.type) || ['list', 'table', 'blockquote'].includes(node.type)) {
      for (let line = node.position.start.line; line <= node.position.end.line; line++) protectedLines.add(line - 1);
    }
  });
  const eol = source.includes('\r\n') ? '\r\n' : '\n';
  const lines = spaced.split(/\r?\n/u);
  const headings = new Set(tree.children.filter(x => x.type === 'heading').map(x => x.position.start.line - 1));
  const headingEnds = new Set(tree.children.filter(x => x.type === 'heading').map(x => x.position.end.line - 1));
  const output = [];
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    if (!protectedLines.has(i)) {
      // Two trailing spaces are Markdown's intentional hard line break.
      if (!/ {2,}$/u.test(line)) line = line.replace(/[\t ]+$/u, '');
      if (!line.trim() && !output.at(-1)?.trim()) continue;
    }
    if (headings.has(i) && output.length && output.at(-1).trim()) output.push('');
    output.push(line);
    if (headingEnds.has(i) && lines[i + 1]?.trim()) output.push('');
  }
  // Do not trim EOF inside an unclosed protected construct (validation rejects fences).
  if (!protectedLines.has(lines.length - 1)) {
    while (output.length && !output.at(-1).trim()) output.pop();
  }
  return output.join(eol).replace(/(?:\r?\n)*$/u, '') + eol;
}

export function proseOnly(source) {
  const chars = source.split('').map(x => x === '\n' || x === '\r' ? x : ' ');
  for (const [start, end] of textRanges(source)) {
    for (let i = start; i < end; i++) chars[i] = source[i];
  }
  return chars.join('');
}

export function chineseSuggestions(source, rules) {
  const prose = proseOnly(source);
  const suggestions = [];
  for (const rule of rules) {
    if (!rule.from || !rule.to || rule.from === rule.to) throw new Error('中文校对词典存在无效条目。');
    let start = prose.indexOf(rule.from);
    while (start !== -1) {
      suggestions.push({ start, end: start + rule.from.length, value: rule.to,
        text: rule.from, reason: rule.reason, line: source.slice(0, start).split('\n').length });
      start = prose.indexOf(rule.from, start + rule.from.length);
    }
  }
  const ordered = suggestions.sort((a, b) => a.start - b.start);
  for (let i = 1; i < ordered.length; i++) {
    if (ordered[i].start < ordered[i - 1].end) throw new Error('中文词典产生重叠替换，请先修正词典。');
  }
  return ordered;
}
