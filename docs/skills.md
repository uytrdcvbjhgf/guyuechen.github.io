# MyNote 项目技能

技能随仓库版本保存到 `.agents/skills/`，无需在每个新任务中重新安装。先取得包含技能的提交；
新技能的菜单发现可能需要新任务或重新加载，不能因文件存在就声称 `$` 菜单已刷新。
菜单未显示时，可要求助手直接读取对应的 `SKILL.md` 并执行。

## 当前技能

- `handoff-in`：项目自定义的 Daywise 接收流程。入口为 `.agents/skills/handoff-in/SKILL.md`，
  复用 AGENTS.md、写作规范及交接协议；不因收到素材自动获得发布授权。
- `find-skills`：上游 `vercel-labs/skills` 的开源技能发现指南。
  入口为 `.agents/skills/find-skills/SKILL.md`；安装记录位于仓库根的 `skills-lock.json`。
  它指导搜索与安装，不会替代项目规则，也不会增加工具权限。

## 使用和维护

在博客根目录执行 `npx skills list --agent codex` 可检查安装状态。
搜索示例：`npx skills find writing`。首次使用 CLI 需要 npm 下载权限；技能正文已随仓库保存。
安装新技能前核实来源、内容、依赖和兼容性，只安装用户授权的技能。
项目级安装使用 `npx skills add <owner/repo> --skill <name> --agent codex -y`，不加 `-g`。

更新开源技能时，可针对单一名称执行 `npx skills update find-skills -p -y`，先检查 CLI 帮助，
审阅技能与锁文件的差异，验证后只提交相关文件；不批量覆盖自定义技能。
锁文件记录来源和内容哈希，不等于客户端自动刷新，也不保证上游依赖全部可运行。

## 云端网络与多环境

搜索服务使用 `https://skills.sh/api/search`，应在云环境允许域名中包含 `skills.sh`。
GitHub、npm 下载及可能的跳转目标按实际请求和环境策略核实，不关闭 TLS 验证、不绕过平台代理。
当前 CLI 会把部分网络失败显示为“没有结果”；结果为空时检查实际 HTTP 响应，不能直接认定不存在技能。
环境配置草稿保存后仍需用户在设置中保存/发布并实际重试，不能把草稿当作运行配置已生效。

MyNote 与 Daywise 是独立云环境。用户级 `-g` 只影响当前机器，并非 Codex 账号全局安装。
两边可使用同一上游来源和一致版本，但各自需要取得技能文件。优先将项目所需技能与锁文件提交到各自仓库，
后续任务复用仓库内容；需要集中维护时再考虑共享技能仓库或统一安装脚本，不假定两个环境共享文件系统。

## 文章插图与信息图

- `baoyu-article-illustrator`：为文章规划并生成情境插图；项目偏好见 `.baoyu-skills/baoyu-article-illustrator/EXTEND.md` 和同目录 `visual-guide.md`。
- `baoyu-infographic`：表达流程、架构与关系，不能用漫画替代必要的结构概览。按内容选择版式；以语义和连接正确为先。
- 两者均来自 `jimliu/baoyu-skills`；安装记录保存于 `skills-lock.json`。使用当前原生图像工具，不能只因安装就假定上游 CLI 后端可用。
- 最终配图与提示词由 Gallery 管理，核验后使用固定提交公开链接；不把本地候选图路径直接当作线上地址。
