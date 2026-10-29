# 文章格式与校对：管理员手顺

仓库：[`uytrdcvbjhgf/guyuechen.github.io`](https://github.com/uytrdcvbjhgf/guyuechen.github.io)。本机 `origin` 的旧地址会由 GitHub 重定向到这里。

## 1. 已接好的流程

```text
本地编辑 → git add → git commit
                        └─ pre-commit 修格式并更新本次暂存内容
                  → git push main
                        ├─ Article checks：检查格式和工具测试
                        ├─ Deploy Hugo site to Pages：同样检查通过后才发布
                        └─ Article proofreading：校对报告；有中文候选修正时开 bot PR
                                              → 你审阅并合入 → 检查与发布
```

格式工具只处理 `content/posts/**/*.md` 的本次变动，不批量重写旧文章。自动修复范围为正文中汉字与英文/数字之间的空格、顶层标题前后空行、正文多余空行和末尾换行。保留 CRLF/LF 习惯，不把“五年”改成“5 年”，不改措辞、发布日期与 TOML 字段，也不重新序列化整篇 Markdown。

代码、公式、链接与图片、HTML、Hugo shortcode 和转义内容会保守跳过；不重新缩进表格/列表，不去掉 Markdown 的双空格硬换行。特殊诗歌或刻意引用可在正文单独加 `<!-- article-quality: skip -->`，跳过该文章的格式及文字校对；TOML 和代码围栏检查仍保留。

当前校对**不调用大模型，不需要 OpenAI API Key、PAT 或额外付费服务**：

- 中文：`.article-quality.json` 中明确列出的常见错字词典。候选替换写入 bot 分支，由你判断上下文是否适用。
- 英文：CSpell 给出疑似拼写与候选词，写入报告，不擅自选一个替换。专有名词可加入配置的 `words`。
- 不判断语义、事实、语气，也不自动改“的/地/得”。没有命中不代表全文没有错别字。正文以外的标题、描述等元数据不做文字替换。

同一篇文章使用固定 bot 分支，多次运行更新同一个未合入 PR；不同文章各有独立分支。原文更新后已无候选修正时，工作流会关闭过时 PR。你主动关闭的建议，若原文和词典均未改变，之后再次校对可能重新提出；永久忽略应调整词典或 skip 标记。不会自动合入。

## 2. 你需要在 GitHub 点什么

### 必须：允许 Actions 创建 PR

1. 打开 [Settings → Actions → General](https://github.com/uytrdcvbjhgf/guyuechen.github.io/settings/actions)。
2. 在 **Actions permissions** 确认允许当前工作流用到的 Actions。个人仓库最方便的是 **Allow all actions and reusable workflows**。若采用 allowlist，需要允许已有 Pages 发布 Actions，以及 `actions/checkout`、`actions/setup-node`、`actions/upload-artifact`、`peter-evans/create-pull-request`。新引入的 Actions 已固定到完整 commit SHA。
3. 拉到 **Workflow permissions**。默认权限可以继续选择 **Read repository contents and packages permissions**；校对 job 已在 YAML 中单独声明 `contents: write` 与 `pull-requests: write`，无需为所有工作流打开默认写权限。
4. 勾选 **Allow GitHub Actions to create and approve pull requests**，点击 **Save**。这个设置文字虽包含 approve，本项目只创建 PR，不执行自动批准或合入。
5. 若复选框灰色不可选，检查上级组织/企业的 Actions 策略；仓库级权限不能覆盖上级限制。

不需要创建 Repository Secret；`GITHUB_TOKEN` 由 GitHub 自动提供。现有 **Settings → Pages → Source: GitHub Actions** 继续沿用。

### 建议：确认合并选项

打开 [Settings → General](https://github.com/uytrdcvbjhgf/guyuechen.github.io/settings)，找到 **Pull Requests**：

- 可以启用 **Allow squash merging**，让一轮校对在 main 上保留一个清楚的提交。
- 可以启用 **Automatically delete head branches**，合入后清理 bot 分支。
- 本项目不启用自动合并。校对 PR 仍由你决定是否接受。

### 可选：把格式检查设为合入门槛

首次 `Article checks` 成功运行后，可在 **Settings → Rules → Rulesets** 为 `main` 建立分支规则，启用 **Require status checks to pass** 并选择 **Article format**。不要把 `Article proofreading` 设为必过：它给建议，不应阻断文章发布。

个人仓库不必强制“至少另一人批准”，否则自己发起的普通 PR 可能因为不能批准自己的 PR 而卡住。如果进一步启用“所有变更都必须经 PR”或禁止直接 push，今后写文章也要走分支/PR；这不是当前流程的必需设置。管理员绕过规则时，格式不合格的 main 仍会被部署工作流挡住。

## 3. 首次启用与验证

Windows、Mac **分别执行一次**，在各自仓库根目录运行：

```sh
node --version
npm ci
git config --get core.hooksPath
```

Node.js 要求 `>=22.18.0`，推荐 24。最后一行应输出 `.githooks`。`npm ci` 的 prepare 脚本只设置当前仓库的 hook，不改全局 Git 设置。若已有其他 `core.hooksPath`，安装器会提示并保留它；需要将 `node scripts/article-quality.mjs staged` 接入原 pre-commit，或手工决定切换到 `.githooks`。不要在本地用 `npm ci --ignore-scripts` 安装后忘记 hook；这种情况下补跑 `node scripts/install-hooks.mjs`。

之后正常 `git add`、`git commit` 即可。hook 会在创建 commit **之前**修好格式，并把修复后的同篇文章重新暂存，因此本地与远端仍然是同一个 commit。

若同一篇文章既有已暂存修改又有未暂存修改，hook 会停止，不会擅自把未暂存的段落带进提交。可以完整 `git add` 该文章后重试，或者拆分编辑后分别提交。

手动检查单篇文章：

```sh
npm run articles:format -- content/posts/others/a-year-with-ai.md
npm run articles:check -- content/posts/others/a-year-with-ai.md
npm run articles:proofread -- content/posts/others/a-year-with-ai.md
```

最后一条只生成本地 `.article-quality/` 报告，不修改文章。省略路径时，本地默认处理暂存区文章；不会自动扫全站。格式校验同时检查 TOML 必要字段、字段类型和代码围栏；兼容旧文章缺少 description/draft 的情况，新增文章仍按写作模板补齐字段。

GitHub 首次试跑：打开 [Actions → Article proofreading](https://github.com/uytrdcvbjhgf/guyuechen.github.io/actions/workflows/article-proofread.yml) → **Run workflow** → 选择 `main` → article 填 `content/posts/others/a-year-with-ai.md` → **Run workflow**。不填 article 时，校对该次运行对应提交与其父提交之间变动的文章。若只有配置文件变化，则没有文章需要校对，这是正常结果。

无中文词典命中就不会制造空 PR。打开该次 run 的 **Summary** 可看校对表，**Artifacts** 可下载 `proofreading-*` 报告（保留 30 天）。英文疑似拼写问题也以 warning 展示。日后需要更完整的中文语义校对，可以另接模型，届时再单独配置 API 和费用边界。

## 4. 如何审阅、批准和合入 PR

1. 打开仓库 **Pull requests**，进入标题为“文章校对建议：…”的 PR。作者应为 `github-actions[bot]`，目标分支为 `main`。
2. 先看 PR 描述的“原文 → 建议 → 说明”，再打开 **Files changed** 逐行看红色删除、绿色新增。核实含义、引用、代码和发布日期没有被误改。
3. 若 merge 区显示 **Approve workflows to run**，先检查改动内容，然后点击它，允许运行 PR 检查。GitHub 对 `GITHUB_TOKEN` 创建/更新 PR 的检查可能要求这一步，和批准文章内容是两件事。
4. 等 **Article format** 绿色。若没有出现检查入口，可关闭后重新打开 PR 触发检查；不要以为“没跑”就是“通过”。
5. 接受全部改动：在 **Files changed → Review changes → Approve → Submit review** 留下批准，再回到 **Conversation → Squash and merge → Confirm squash and merge**。仓库没要求 review 时也可以直接执行合入；真正把改动写到 main 的动作是 merge。
6. 只接受一部分：可以在 bot 分支上改好再合入，或关闭 PR，在本地手动改需要的几处再正常提交。如果让工作流重跑，它会重新按词典生成候选内容，可能覆盖你在 bot 分支上的人工调整。
7. 完全不接受：**Close pull request**。不合入就不会把这些候选修正发布到网站。
8. 合入后，main 的检查和 Hugo 发布由你这次人工 merge 触发。在 Actions 中确认发布成功，再查看网站。

关于机器人 PR 的检查审批，以 [GitHub 当前官方说明](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow#triggering-a-workflow-from-a-workflow) 为准。无需为了省这一步先创建长期 PAT。

## 5. 合入以后，优雅同步回本地

### 本地干净，没有自己的新提交

```sh
git switch main
git status
git pull --ff-only origin main
```

`--ff-only` 只前移本地 main，不额外制造 merge commit。合入 PR 之后远端领先是正常情况；拉取后本地和远端重新对齐。Mac、Windows 各拉一次。

### 有尚未提交的修改

```sh
git stash push -u -m "before syncing proofreading PR"
git switch main
git pull --ff-only origin main
git stash pop
```

先确认 stash 成功。`stash pop` 若冲突，保留的 stash 可用于核对，不要急着删。解决冲突并检查内容后，再 `git add`、`git commit`。

### 本地 main 已有尚未 push 的提交，两端分叉

在工作区干净的前提下：

```sh
git fetch origin
git rebase origin/main
git push origin main
```

rebase 会重写你这些**尚未共享**的本地提交 SHA，把它们放到远端校对提交之后。若提示冲突，编辑解决后 `git add <文件>`、`git rebase --continue`；需要放弃本次同步可 `git rebase --abort`。不要靠 `push --force` 覆盖已合入的校对提交。

更省事的习惯是每次开始写作前先 pull。若已在自己的写作分支上工作，先提交/保存修改，再同步 main，然后在写作分支 rebase main。

## 6. 故障排查

| 现象 | 处理 |
| --- | --- |
| `GitHub Actions is not permitted to create or approve pull requests` | 开启第 2 节的复选框；随后在失败 run 右上角 **Re-run jobs → Re-run failed jobs**，或手动重新校对该文章。报告在 PR 创建之前已上传。 |
| `Resource not accessible by integration` / 403 | 检查仓库/组织策略、允许的 Actions 与 job 的 contents/pull-requests 写权限。无需直接给所有工作流管理员权限。 |
| PR 创建后检查等待批准 | 在该 PR 点 **Approve workflows to run**，再等待检查。 |
| PR 与 main 冲突，或原文已有新版本 | 更新 main 后，手动重新运行该篇文章的校对。合入前重新核对最新 diff。 |
| 英文术语反复误报 | 加入 `.article-quality.json` 的 `words`。不为消除 warning 自动改技术名词。 |
| 网站没更新，`Article format` 失败 | 根据日志指定的文章本地运行 format、核对 diff、提交并 push；发布不会越过失败的格式门槛。 |
| 本地提交提示找不到 Node/模块 | 安装合适 Node 并在仓库运行 `npm ci`。不要依赖跳过 hook 维持日常流程。 |

格式门槛与校对工作流独立：校对服务或创建 PR 失败不阻断本次正常发布；格式、元数据或工具测试失败会阻断发布。若要临时停止自动校对，可在 Actions 选中 **Article proofreading → … → Disable workflow**；不用删除代码。
