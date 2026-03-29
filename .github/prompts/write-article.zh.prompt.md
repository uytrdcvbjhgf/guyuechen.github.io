# 文章生成规范

- 使用 `hugo new posts/{分类}/{子分类（可选）}/{主题-title}.md` 命令创建新文章。

- 文章路径按技术领域分类，建议目录结构示例：`/dev/protocol/http`、`/dev/protocol/ftp` 等，层级不宜超过 4 级，方便长期维护和快速定位。

- 文件名采用英文小写，单词间用连字符分隔，结尾统一为 `.md`。

- 如需多语言版本，建议文件名后加语言后缀如 `_zh` / `_ja`，例如：`soap_zh.md`、`soap_ja.md`。

- 标签（tags）建议不超过 3 个，且全部使用英文小写（关键技术词可保持大写，如 SOAP、HTTP）。例如：`tags = ['SOAP', 'http']`。

- 文章内容需包含清晰段落、代码块注明语言。

- 内容中中文、日文、英文、数字之间建议保留半角空格，避免视觉拥挤。例如：
  - 正确：Java 是一种面向对象的编程语言。
  - 正确：版本为 1.8。
  - 错误：Java是一种面向对象的编程语言。
  - 错误：版本为1.8。

- 正文不需要和 title 重复的一级标题，直接从二级标题开始写。

- 在正文的各级标题和内容中出现类名（如 SecurityFilterChain），需使用行内代码格式（如 `SecurityFilterChain`）。

- Front Matter 必须采用 TOML 格式，字段包括：
  - `title` 文章标题，单引号包裹
  - `date` 采用 `2025-02-25T19:34:24+08:00` 格式，表示文章创建时间，注意自动生成时确保时间早于当前系统时间
  - `categories`、`tags` 为数组，单引号包裹元素

  示例：
  ```toml
  +++
  title = 'SpringBatch 简介'
  date = 2025-02-25T19:34:24+08:00
  categories = ['java']
  tags = ['java', 'spring', 'springboot', 'springbatch']
  +++
  ```
