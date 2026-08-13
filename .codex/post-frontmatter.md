# Post Front Matter

Blog posts use Hugo TOML front matter surrounded by `+++`.

Default template:

```toml
+++
title = '文章标题'
date = 2026-08-10T00:00:00+09:00
draft = true
categories = ['category']
tags = ['tag']
description = '一句话说明文章解决什么问题'
+++
```

Required fields for new posts:

- `title`: Chinese article title unless the article is intentionally English
- `date`: latest content revision time while drafting; once published, the permanent first-publication time
- `draft`: use `true` while drafting, change to `false` or remove before publishing
- `categories`: one primary topic category, normally one item
- `tags`: stable searchable labels; prefer one existing topic tag and add another only when it has clear reuse value
- `description`: short summary used for search, cards, or future reuse

Date and timezone:

- The author currently works from Japan, so new posts should default to `+09:00`.
- If a post belongs to older China-based notes or imported material, keeping `+08:00` is acceptable.
- While an article is a draft, `date` should reflect its latest content revision time. Refresh it to the exact current local timestamp whenever the draft article is edited.
- When changing `draft = true` to `draft = false`, or removing the draft field to publish, always rewrite `date` to the current publication timestamp.
- For this blog, the publication timestamp means the moment the draft marker is cancelled, not the time the Markdown file was first created.
- Once an article has been published, its `date` becomes the permanent first-publication timestamp. Never rewrite it for later content revisions unless the user explicitly asks to change the publication date.

Style rules:

- Preserve TOML front matter rather than converting to YAML.
- Prefer single quotes for string values to match the existing posts.
- Keep category and tag names short and stable.
- Avoid creating article-specific tags that would cause the tag list to grow without bound.
- Use `draft = true` for generated drafts unless the user explicitly asks to publish.
- For a publish-ready post, use `draft = false` and set `date` to the current local time with the correct timezone.

Publishing note:

- The Hugo config has `buildDrafts: false`, so draft posts are not included in production builds by default.
