# 文章生成规范

- 使用 `hugo new posts/{分类}/{子分类（可选）}/{主题-title}.md` 命令创建新文章。

- 文章路径按技术领域分类，必要时增加二级目录。

- 文件名采用英文小写，单词间用连字符分隔，结尾统一为 `.md`。

- 文章内容需包含清晰段落、代码块注明语言。

- 正文不需要和 title 重复的一级标题，直接从二级标题开始写。

- 在正文的各级标题和内容中出现类名（如 SecurityFilterChain），需使用行内代码格式（如 `SecurityFilterChain`）。

- Front Matter 必须采用 TOML 格式，字段包括：
  - `title` 文章标题，单引号包裹
  - `date` 采用 `2025-02-25T19:34:24+08:00` 格式
  - `categories`、`tags` 为数组，单引号包裹元素

  示例：
  ```toml
  title = 'SpringBatch简介'
  date = 2025-02-25T19:34:24+08:00
  categories = ['java']
  tags = ['java', 'spring', 'springboot', 'springbatch']
  ```
