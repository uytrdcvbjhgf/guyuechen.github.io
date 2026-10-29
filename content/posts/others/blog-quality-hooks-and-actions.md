+++
title = '给博客加两道检查'
date = 2026-10-29T12:55:53+09:00
draft = false
categories = ['diary']
tags = ['diary']
description = '在 Git 提交前修格式，在 GitHub Actions 里查漏，再把文字修改交给人审阅。顺便让这篇文章自己参加一次测试。'
+++

这个博客早就能自动部署了。文章推到 GitHub，后面的构建、发布便不用再管。以前觉得这就很省事，如今和 AI 一起写文章，才发现还有些小事没安排明白：中英文之间的空格，标题前后的空行，以及那些明明认识、打出来却不认识的字。

自动发布有个好处，也有个脾气：提交什么，就认真发布什么。作者敲错一个字，它也不嫌弃。

于是又给博客添了两道检查。想法很朴素：提交前修格式，推送后查漏；涉及文字意思的修改，先提建议，让作者过目。

## 先把格式修在提交之前

Git 有一种机制叫 hook，可以在特定操作发生时运行脚本。这次用的是 `pre-commit`，运行在本地创建提交之前。脚本返回失败，提交就会停下来。它的执行时机和行为，可以在 [Git 官方文档](https://git-scm.com/docs/githooks#_pre_commit)中查到。

这里有个容易混淆的先后关系：`git commit` 在本地形成一个提交，`git push` 再把这个提交送到远端。希望格式干净，最好在前一件事完成之前就修好。

比如，原稿里故意写成：

```text
这个博客使用Hugo，也接入了GitHub Actions。
```

钩子会把它整理成：

```text
这个博客使用 Hugo，也接入了 GitHub Actions。
```

随后，把修复后的文章重新放入暂存区，再让 Git 完成提交。暂存区可以理解为本次提交的候选清单；最终 commit 记下的是这份清单里的内容。

对应到仓库，入口就是 [`.githooks/pre-commit`](https://github.com/uytrdcvbjhgf/guyuechen.github.io/blob/669b62b/.githooks/pre-commit)，完整内容只有两行：

```sh
#!/bin/sh
exec node scripts/article-quality.mjs staged
```

本地执行 `npm ci` 时，`package.json` 的 `prepare` 会调用 `scripts/install-hooks.mjs`，为当前仓库设置 `core.hooksPath = .githooks`。所以，真正顺序是安装依赖并接好钩子，然后在每次 `git commit` 时执行它。仅仅把钩子文件推到 GitHub，不会替另一台电脑自动完成安装。

[`scripts/article-quality.mjs`](https://github.com/uytrdcvbjhgf/guyuechen.github.io/blob/669b62b/scripts/article-quality.mjs) 中，`staged` 模式先取得暂存区的文章，再比较修复前后的内容。下面是文件中负责写回的片段：

```js
if (mode !== 'check') {
  for (const { file, result } of changed) writeFileSync(file, result);
  if (mode === 'staged' && changed.length) git(['--literal-pathspecs', 'add', '--', ...changed.map(x => x.file)]);
}
```

这里的 `git add` 只针对实际修过的文章，不是把整个工作目录重新暂存。Git 的提交过程会等钩子退出；这一轮修复和重新暂存完成后，才继续形成 commit。

这样，本地 commit 从诞生时就已经带着正确格式。推到 GitHub 的还是同一个提交，不用等远端机器人修完空格，再多造一个提交，催本地把它拉回来。

这次没有给格式工具太多发挥空间。中英文、数字之间的空格，顶层标题前后的空行，正文多余空行和末尾换行，这些比较确定的事情可以交给它。代码、公式、链接等内容保守跳过，文章发布日期和其他元数据也不自动重写。

至于“五年”要不要写成“5 年”，这已经涉及作者的表达习惯，暂时不让格式脚本替人做主。

还有个细节：同一篇文章如果只暂存了一半，另一半仍在编辑，钩子会停下来，提示先处理暂存范围。否则一句“自动修复”，很容易顺手把原本不准备提交的段落也带上。方便到这里，反而给人添乱。

## 本地检查以后，为什么还要上云再查一次

本地钩子有一个很朴素的弱点：它得先装好。

Mac 装了，Windows 未必装；这台电脑运行过 `npm ci`，下一台未必记得。有人从网页上编辑文章，本机的钩子也管不到。Git 本身还允许跳过某些本地钩子，所以不能把它当作远端仓库的强制门槛。

因此，GitHub Actions 再接一层检查。它在 GitHub 的运行环境里执行工作流，不依赖写文章的那台电脑继续开着。

这次几部分的分工如下：

| 位置 | 做什么 | 发现问题以后 |
| --- | --- | --- |
| 本地 `pre-commit` | 检查本次暂存的文章，修确定的格式问题 | 修好再提交；元数据或代码围栏有问题就停止 |
| `Article checks` | 在推送和 PR 上检查变动文章的格式，并运行工具测试 | 检查失败，给出需要修复的文件 |
| Hugo 发布工作流 | 在构建前再次执行同样的检查 | 失败就不继续发布 |
| `Article proofreading` | 检查常见中文错字和英文拼写 | 生成报告，有中文候选修正时提出 PR |

这里所谓“后置”，是相对于本地提交而言。推送以后，几条工作流可以分别开始，并不是先把网站发出去，再检查文章合不合格。真正负责发布的工作流，自己也带着格式门槛，不能指望另一条工作流晚些时候亮红灯，已经上线的错格式就会自动撤回。

同样，PR 上检查失败会显示红灯；若希望它成为禁止合入的硬条件，还需要在仓库规则里要求 `Article format` 通过。检查结果与强制规则，是两件相关却不同的事。

### 先看触发条件，再看执行内容

Actions 列表容易让人误以为“上一行启动了下一行”。理解这套机制，要先区分四个名字：workflow 是一份工作流配置；run 是它某一次运行的记录；job 是一份工作流内部的任务；step 是任务里的具体步骤。

这次新增的两个 workflow 分别是 `Article checks` 和 `Article proofreading`。前者里面的 job 叫 `Article format`；后者有 `select` 和 `proofread` 两类 job。左侧栏列的是 workflow，右侧历史列表列的是 run。

[`article-check.yml`](https://github.com/uytrdcvbjhgf/guyuechen.github.io/blob/669b62b/.github/workflows/article-check.yml) 的触发条件如下，只省略了手动运行的输入参数：

```yaml
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  workflow_dispatch:
```

两个 `branches: [main]` 看起来一样，指向却不同。`push` 这里要求被推送的分支是 `main`；`pull_request` 这里要求 PR 的目标分支是 `main`，来源分支可以叫 `bot/...`，也可以叫 `test/...`。因此，列表上显示一个 bot 分支，完全不妨碍它触发检查。

没有显式填写 `types` 时，`pull_request` 默认响应 `opened`、`synchronize`、`reopened`：创建 PR、来源分支更新、重新打开 PR。`synchronize` 在这里表示 PR 的代码版本更新，和本地执行 `git pull` 不是一回事。触发规则见 [GitHub 事件文档](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#pull_request)。

这份 workflow 真正执行的核心步骤是：

```yaml
- run: npm ci --ignore-scripts
- run: npm test
- run: npm run articles:check
```

第一步装依赖，第二步测试检查工具本身，第三步检查这次变动的文章。CI 安装时使用 `--ignore-scripts`，不会像本地安装那样再安装 hook。`check` 模式只比较和报错，不写回文章，不创建分支，也不发 PR。

它检查哪几篇文章，由下面这组环境变量确定：

```yaml
env:
  ARTICLE_BASE: ${{ github.event.pull_request.base.sha || github.event.before }}
  ARTICLE_HEAD: ${{ github.sha }}
  ARTICLE_FILE: ${{ inputs.article }}
```

普通 push 比较推送前后的版本；PR 则以目标分支版本为基准，检查 GitHub 为这次 PR 生成的试合并结果。这里的试合并供 CI 测试使用，不表示 PR 已经真正合入 `main`。手动运行时，还可以指定单篇文章路径。脚本只从差异中挑出 `content/posts/` 下新增或变动的 Markdown，不把全站旧文章都翻修一遍。

另一个文件 [`article-proofread.yml`](https://github.com/uytrdcvbjhgf/guyuechen.github.io/blob/669b62b/.github/workflows/article-proofread.yml) 的触发范围更窄：

```yaml
on:
  push:
    branches: [main]
    paths: ['content/posts/**/*.md']
  workflow_dispatch:
```

自动运行时，需要同时满足“推到 main”和“改到了文章路径”。它没有监听 PR 事件。因此，创建或更新校对 PR，不会又执行一轮校对来给校对结果再发一个 PR。

三份配置的触发关系可以直接对照：

| 发生的事情 | Article checks | Article proofreading | Hugo 发布 |
| --- | --- | --- | --- |
| 向 `main` 推送文章改动，包括合入文章 PR | 运行 | 运行 | 运行 |
| 向 `main` 只推送配置改动 | 运行，可能没有文章可检查 | 不因这次 push 运行 | 运行 |
| 创建、重新打开或更新一个目标为 `main` 的 PR | 产生 PR 检查记录；bot 事件可能等待运行审批 | 不运行 | 不运行 |
| 仅向其他分支推送，且没有触发对应 PR 事件 | 不运行 | 不运行 | 不运行 |
| 在 Actions 页手动运行某一份 workflow | 只触发所选 workflow，按其配置执行 | 同左；校对任务还限定在 `main` 执行 | 同左 |

这三份 workflow 没有用 `workflow_run` 串联，也没有跨文件的 `needs` 关系。它们是分别响应事件，可以并行开始。Hugo 配置里 `deploy` 的 `needs: build` 只表示同一份发布工作流内部要先完成构建。

发布配置同时保留了自己的 `npm test` 与 `npm run articles:check`，通过后才构建和部署。所以，独立的 `Article checks` 负责提供可见的检查结果；发布工作流自己的检查负责挡住不合格版本上线。后者不会等待前者的绿勾。

## 格式可以自动修，文字先商量

空格和错别字看着都小，处理起来却不宜混在一起。

补一个中英文空格，通常没有多少争议。改一个字，就可能改到引用、术语，甚至作者故意写的别扭话。文章写得不规矩，也未必全是错字造成的。

所以，这次把文字校对做成了建议流程：工作流从 `main` 拉出一条 bot 分支，把候选修改放进去，再发起 Pull Request，简称 PR。它相当于拿着一份改稿问一句：“这几处要不要改？”在合入以前，这份改稿不会改变 `main` 上的原文。

这个分支由 `Article proofreading` 创建，不能因为后来在 `Article checks` 的运行记录上看见了它，就把创建分支的功劳记给检查工作流。

校对工作流内部，`select` 先列出变动文章；`proofread` 通过 `needs: select` 等待这个结果，再用 matrix 按文章分开处理。它先运行：

```yaml
- name: Generate proofreading report and candidate corrections
  id: proof
  run: npm run articles:proofread -- --apply
  env:
    ARTICLE_FILE: ${{ matrix.article }}
```

`--apply` 在这里把中文词典命中的候选修正写到 runner 的工作目录，尚未修改远端 `main`。报告上传后，再由下面这一步把这些改动提交到 bot 分支，并创建或更新 PR。这里同样只截取相关参数，action 的 SHA 与仓库一致：

```yaml
- name: Create a manually reviewed correction PR
  uses: peter-evans/create-pull-request@98357b18bf14b5342f975ff684046ec3b2a07725
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
    base: main
    branch: ${{ steps.proof.outputs.branch }}
    add-paths: ':(literal)${{ matrix.article }}'
    delete-branch: true
```

分支名由文章路径的 SHA-256 摘要生成，同一篇文章始终得到同一个名字：

```js
branch = `bot/proofread-${createHash('sha256').update(file).digest('hex').slice(0, 16)}`;
```

所以，这篇文章对应 `bot/proofread-4b5626b4e8fd7049`。原文再更新，工作流重算候选修正、更新这条分支和同一个 PR；不是每跑一次就另开一个校对分支。没有新差异时，也不会为了刷存在感再造一个空 PR。

当前版本也没有调用大模型。中文靠一份明确列出的常见错字词典，英文靠 CSpell 给出疑似拼写和候选词。中文词典命中的候选修正进入 PR，英文建议留在报告里，暂不自动选择某个词替换。

这套办法能抓到一些错误，抓不到的也不少。没有 warning，只能说明这些规则没有发现问题，不能给整篇文章颁发“绝无错字”的证书。它也不负责判断事实是否可靠，更不会因为文章通过检查，就证明里面的观点比较高明。

校对工作流与发布分开，正是因为这层区别。格式不合格要拦住；文字建议则留给作者处理，不让一个可疑的英文专名堵住整个博客。

## PR 到了以后，作者要干什么

首先得允许机器人发改稿。GitHub 仓库的 **Settings → Actions → General → Workflow permissions** 里，有一个 **Allow GitHub Actions to create and approve pull requests** 开关，需要开启。

默认 token 权限可以继续只读，创建校对 PR 的 job 单独声明 `contents: write` 与 `pull-requests: write` 即可。这套流程不需要另存一个长期个人令牌，也没有替作者自动批准、自动合入的步骤。

PR 出来以后，先看说明里的原文、建议和理由，再打开 **Files changed** 看逐行差异。红色是删除，绿色是新增。确认这几刀没有切到不该切的地方，再决定接受全部、只接受一部分，还是直接关闭。

如果出现 **Approve workflows to run**，需要先允许运行 PR 检查，再等检查通过。这与批准文章内容是两回事。GitHub 对默认 `GITHUB_TOKEN` 创建或更新的 PR 有相应的工作流审批机制，具体以 [GitHub 官方说明](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow#triggering-a-workflow-from-a-workflow)为准。

内容认可以后，可以留下 Approve review，再执行 **Squash and merge**。前者表示审阅意见，后者才把修改合进 `main`。仓库没强制 review 时，作者也可以直接决定合入；无论按钮点了几个，最后还是得有人看过文字。

## 远端多了一个提交，本地怎么办

校对 PR 合入以后，远端领先本地一个或多个提交，很正常。此前没有新建本地提交、工作区也干净时，拉下来就行：

```sh
git switch main
git status
git pull --ff-only origin main
```

`--ff-only` 要求只做快进：能够直接把本地分支向前挪就挪，已经分叉就停下来，不悄悄替人再造一个合并提交。这个行为见 [Git pull 官方文档](https://git-scm.com/docs/git-pull)。

这次 PR #19 实际采用了普通 merge，而非前面介绍的 squash。远端历史因此多了 bot 的修正提交 `9243f33` 和合并提交 `669b62b`。本地当时停在 `2a407f5`，检查结果为落后 2 个提交；执行上述命令后正常快进，两边重新对齐，没有因此再制造一个本地合并提交。

如果本地还有未提交的修改，先保存；若已经有尚未 push 的新提交，则先 fetch，再根据情况 rebase。最省事的习惯，是每次换设备、开始写作以前先同步。否则 Windows 改半篇，Mac 又改半篇，最后花在解释冲突上的字，可能比文章本身还多。

## 让这篇文章自己试一次

配置写得再像回事，也得故意放点错误进去，看看它究竟会不会响。

这篇文章准备了两种样本：一处正文里的中英文空格遗漏，以及一处常见中文错字。代码块里的错误示例只是供读者比较，它们应当原样保留，不能被工具悄悄修成正确示例。

| 样本 | 预期行为 |
| --- | --- |
| 正文里的 `给博客接上GitHub Actions` | 本地提交时自动补空格，commit 里留下修复后的版本 |
| 正文里故意留的一处成语错字 | 本地格式钩子不改文字，Actions 生成候选修正 PR，等待人工审阅 |

这次给博客接上 GitHub Actions，也想顺便检验一下：省掉重复劳动以后，自己能不能把文章写得再清楚一点。

工具还得慢慢磨，往后再接再厉。先让这句话参加校对，看看机器会不会认真读到最后。

### 这次实测的结果

2026 年 10 月 29 日，实际跑了一遍，结果如下：

| 实测项目 | 结果 |
| --- | --- |
| 带着漏空格的原稿执行真实 `git commit` | 钩子提示修复 1 篇文章；核对后，提交内容只多了预期的那个空格，错字和代码示例都没动 |
| 修复后的文章推到 `main` | [格式检查通过](https://github.com/uytrdcvbjhgf/guyuechen.github.io/actions/runs/40815060842)，[Hugo 发布成功](https://github.com/uytrdcvbjhgf/guyuechen.github.io/actions/runs/40815060786) |
| 单独建测试分支，一次性绕过本地钩子，重新留下同一个空格错误 | [云端格式检查失败](https://github.com/uytrdcvbjhgf/guyuechen.github.io/actions/runs/40815124851)，准确停在文章检查步骤；[反例 PR](https://github.com/uytrdcvbjhgf/guyuechen.github.io/pull/20) 随后关闭，没有合入主分支 |
| 正文故意留下的成语错字 | [机器人生成了校对 PR #19](https://github.com/uytrdcvbjhgf/guyuechen.github.io/pull/19)，候选差异只有 1 个字；作者后来手动合入，正文已改正 |

这个 bot PR 的检查还确实遇到了前面提到的运行审批。不过，本次记录里并没有完成 PR 检查后再合入的完整顺序：检查等待审批，随后过期；作者实际合入以后，另一次针对 `main` 的检查才成功。下面把这些记录拆开。

## 把 Actions 历史记录逐条还原

历史页默认从新到旧排列。每一行的大标题可能是提交信息，也可能是 PR 标题；下面的小字才写着 workflow 名称、运行序号、事件和操作者。先看大标题，很容易以为是同一件事不断重跑。

还要注意三个编号各算各的：`Article checks #6` 是格式检查 workflow 的第 6 次运行；`Article proofreading #3` 是校对 workflow 的第 3 次运行；`PR #19` 是仓库里的第 19 号拉取请求。它们不需要对齐，也不是互相引用的任务编号。

以下按发生顺序排列，时间全部换算为 2026 年 10 月 29 日的日本时间。

| 时间（JST） | 实际发生的事情 | 对应的运行记录 |
| --- | --- | --- |
| 12:40 左右 | 推送 `0786998`，新增工具和工作流配置，但未改文章；之后另做一次手动校对试跑 | checks #1、发布 #480；proofreading #1 为手动运行 |
| 12:57:56 | 首次推送本文，提交为 `267c86b` | checks #2、proofreading #2、发布 #481，均成功 |
| 12:58:20—12:58:24 | proofreading #2 创建 bot 分支与 PR #19，产生 `pull_request: opened` | checks #3，显示 `action_required`，等待批准运行 |
| 12:58:38—12:58:56 | 单独创建反例 PR #20，来源为测试分支，目标为 `main` | checks #4 真正运行，并在文章格式检查步骤失败 |
| 12:59:43 | 为本文补入实测结果，再次推送 `main`，提交为 `2a407f5` | checks #5、proofreading #3、发布 #482，均成功 |
| 13:00:14—13:00:17 | proofreading #3 按新版正文更新原 bot 分支，PR #19 产生 `synchronize` | checks #6 再次等待审批；最终记录为失败 |
| 13:18:19—13:18:22 | 作者手动合入 PR #19，`main` 前移到 `669b62b`，触发新的 push 事件 | checks #7、proofreading #4、发布 #483，均成功 |

### PR #19 的感叹号：检查还没有开始

[checks #3](https://github.com/uytrdcvbjhgf/guyuechen.github.io/actions/runs/40815101615) 的事件是 PR `opened`，操作者为 `github-actions[bot]`，结论为 `action_required`。运行页明确显示等待维护者批准；jobs 接口返回空列表。

这表示 GitHub 知道有一轮检查需要进行，但还没有放行执行。既不能把感叹号读成“发现错别字”，也不能读成“检查通过但有一点小提醒”。它没有运行到 `npm test` 或文章检查。

原因是这个 PR 使用默认 `GITHUB_TOKEN` 创建。按照 [GitHub 对机器人事件的规则](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow#triggering-a-workflow-from-a-workflow)，这类 PR 的创建和更新可以产生需要人工批准的检查记录。

仓库设置里的“允许 Actions 创建和批准 PR”，解决的是机器人能否发起这些操作；PR 页的 **Approve workflows to run**，解决的是某一轮检查能否运行；Approve review 表达内容审阅意见；Merge 则改变主分支。它们各管一段，开启第一个开关不会把后面几步一起办完。

### PR #20 的红叉：确实抓到了格式错误

测试分支 `test/article-format-gate-20261029` 是本次验证时专门创建的，PR #20 也是手动发起的反例，不是任何检查 workflow 自己创造出来的。

为了让错误能够到达远端，这一次测试提交临时跳过了本地钩子，重新写入同一个漏空格问题。没有改持久 hook 配置，主分支里的正确空格也没有撤销。

虽然来源分支不叫 `main`，但 PR 的目标是 `main`，所以仍匹配 `article-check.yml` 的 `pull_request.branches`，触发 [checks #4](https://github.com/uytrdcvbjhgf/guyuechen.github.io/actions/runs/40815124851)。日志显示依赖安装成功、9 项工具测试通过，最后在 `npm run articles:check` 步骤输出：

```text
文章格式检查未通过。先运行 npm run articles:format -- <文章路径> 并提交：
content/posts/others/blog-quality-hooks-and-actions.md
Process completed with exit code 1.
```

这是一次真正执行检查、发现错误并返回非零退出码的失败。验证后 PR #20 被关闭，未合入 `main`。PR 事件本身也不满足另外两份 workflow 的触发条件，因此没有跟着校对或部署这个错误版本。

### 中间又出现三条绿勾：因为确实又推送了一次

标题为 `Record live hook and Actions verification results` 的三条记录，对应提交 `2a407f5`。这是把刚才的验证结果补进文章后，另做的一次真实 push。

文章变了、`main` 也前移了，所以三份 workflow 各运行一次，分别是 checks #5、proofreading #3 和发布 #482。它们不是前一次任务无缘无故重启，也不是定时任务轮询。

这轮校对看到的正文比创建 PR #19 时多了实测记录。它重新以最新 `main` 为基础生成那 1 个字的修正，更新同一个 bot 分支。PR 时间线记录了 13:00:14 由 bot 更新来源分支，提交从 `61dabc3` 变成 `9243f33`；13:00:17 随即产生了 `synchronize` 检查，也就是 checks #6。

即便候选差异始终只有 1 个字，只要 PR 的来源版本更新，就需要针对新版重新检查。已经存在一条 PR，并不意味着它只在创建时检查一次。

### PR #19 后来的红叉：审批过期，不是格式又错了

[checks #6 的运行页](https://github.com/uytrdcvbjhgf/guyuechen.github.io/actions/runs/40815268093)给出了明确的失败原因：

```text
This workflow run required approval but was not approved before it expired.
```

意思是：这轮工作流要求运行审批，但到过期时仍未获批准。jobs 接口同样为空，没有 runner 上的安装、测试或格式检查记录。

截图里的 `18m 3s` 对应 13:00:17 到 13:18:20 这段等待到结束的时间，不能解释成脚本检查文章用了 18 分钟，也不能因此说“修正后的文章没有通过格式校验”。这次记录显示审批过期，不应据此推导 GitHub 有一个通用的 18 分钟固定审批期限。

同样是红叉，#4 有实际执行并报错的检查步骤，#6 则连检查 job 都没有开始。排查时必须点进运行页，区分平台审批问题与脚本检查失败，不能只看图标。

### 合入后再出现三条绿勾：检查的是合入后的 main

13:18:19，作者手动合入 PR #19，形成合并提交 `669b62b`。合并使 `main` 更新，相当于产生一次新的 push；本次又确实改到了文章，所以三份 workflow 都匹配。

这次跑的是 checks #7、proofreading #4 和发布 #483。它们检查、校对和部署的是合入后的主分支，不能替之前没执行的 PR 检查补发一张“当时已通过”的证明。

proofreading #4 还验证了一个细节：合入后错字已改正，日志显示“候选修正：无”，没有再开 PR #21。action 比较后确认原 bot 分支已不再相对 `main` 提供新差异，执行收尾，而非不断给自己的修正再发修正。

这次还读取了仓库的分支保护状态：`main` 的 `protected` 为 `false`，required status checks 处于关闭状态。因此，失败或未执行的 PR 检查没有成为禁止本次合入的条件。检查出现在列表里，与仓库要求它必须通过，确实不是一回事。若将来要强制先检查再合入，需要另设相应分支规则；本次只核对和记录，没有更改这些设置。

这样，整段历史就能接起来：本地钩子先修空格，主分支 push 同时启动三份工作流；校对工作流提出改稿，PR 事件产生待批准的格式检查；更新原文会再次更新改稿并触发新版检查；人工合入以后，再对新的主分支执行检查、校对和发布。每一行都有具体的事件来源，每一个状态也有各自的证据。
