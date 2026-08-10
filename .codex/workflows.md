# Writing Workflows

## New Article

1. Identify the target path under `content/posts/`.
2. Choose a category and tags using `.codex/taxonomy.md`.
3. Create a Markdown file with TOML front matter from `.codex/post-frontmatter.md`.
4. Set `draft = true` unless the user explicitly asks for a publish-ready post.
5. Write the article body in Chinese by default.
6. Keep structure readable in Hugo/PaperMod: headings, short paragraphs, lists, and fenced code blocks.

## Revise Existing Article

1. Read the whole article before editing.
2. Preserve front matter unless a metadata change is part of the request.
3. Improve clarity, structure, and flow without changing the author's intended meaning.
4. Keep any working examples, diagrams, image links, and code blocks valid.
5. Avoid broad rewrites unless the user asks for a full rewrite.

## Turn Notes Into Article

1. Extract the main thesis or learning goal.
2. Group raw notes into sections.
3. Fill missing transitions and definitions.
4. Mark uncertain facts with comments or ask for confirmation.
5. Produce a draft post first; publishing can be a separate step.

## Final Check

Before considering an article ready, check:

- front matter is valid TOML
- `title`, `date`, `categories`, `tags`, and `description` exist
- draft status matches the user's intent
- headings are in a logical order
- code fences are closed
- links and image syntax are not obviously broken
