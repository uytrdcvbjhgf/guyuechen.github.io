import { execFileSync } from 'node:child_process';
if (!process.env.CI && !process.env.GITHUB_ACTIONS) {
  try {
    let existing = '';
    try { existing = execFileSync('git', ['config', '--get', 'core.hooksPath'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch {}
    if (existing && existing !== '.githooks') {
      console.warn(`已有 hooksPath=${existing}，未覆盖。请按 docs/article-quality.md 手工整合 pre-commit。`);
    } else {
      execFileSync('git', ['config', '--local', 'core.hooksPath', '.githooks']);
      console.log('已为当前仓库安装文章格式 pre-commit hook。');
    }
  } catch (error) {
    console.error(`Git hook 安装失败：${error.message}`);
    process.exitCode = 1;
  }
}
