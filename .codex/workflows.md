# Writing Workflows

## New Article

1. Identify the target path under `content/posts/`.
2. Choose a category and tags using `.codex/taxonomy.md`.
3. Create a Markdown file with TOML front matter from `.codex/post-frontmatter.md`.
4. Set `draft = false` unless the user explicitly asks to keep the new article as a draft.
5. Write the article body in Chinese by default.
6. Keep structure readable in Hugo/PaperMod: headings, short paragraphs, lists, and fenced code blocks.

## Revise Existing Article

1. Read the whole article before editing.
2. Check the draft status before editing: refresh `date` to the exact current local timestamp for a draft, but preserve the original publication `date` for a published article.
3. Improve clarity, structure, and flow without changing the author's intended meaning.
4. Keep any working examples, diagrams, image links, and code blocks valid.
5. Avoid broad rewrites unless the user asks for a full rewrite.

## Turn Notes Into Article

1. Extract the main thesis or learning goal.
2. Group raw notes into sections.
3. Fill missing transitions and definitions.
4. Mark uncertain facts with comments or ask for confirmation.
5. Produce a publish-ready post by default; use draft status only when the user explicitly requests it.

## Publish Article

1. Change `draft = true` to `draft = false`, or remove the draft field if the user explicitly prefers that style.
2. At the same time, rewrite `date` to the exact publication time in the author's current timezone, normally `+09:00`.
3. Treat this moment as the article's publication timestamp even if the Markdown file was created earlier.
4. Recheck the title, description, links, images, and front matter before publishing.

## Final Check

Before considering an article ready, check:

- front matter is valid TOML
- `title`, `date`, `categories`, `tags`, and `description` exist
- draft status matches the user's intent
- a revised draft's `date` matches its latest content revision time
- a newly published article's `date` matches the time its draft status was cancelled
- an already-published article keeps its original first-publication `date` after later revisions
- headings are in a logical order
- code fences are closed
- links and image syntax are not obviously broken

## Article Quality Automation

- Run `npm ci` once on each device to install dependencies and the repository-local pre-commit hook. See `docs/article-quality.md` for setup and GitHub administrator steps.
- Before staging an article, run `npm run articles:format -- content/posts/<path>.md`, then review its diff. The pre-commit hook also formats fully staged articles automatically.
- A partially staged article is rejected instead of silently adding the author's unstaged changes. Complete or separate its staging before committing.
- Only deterministic whitespace/layout is fixed locally. Preserve publication dates, wording, code, math, links and front matter.
- `Article format` checks changed articles in Actions; the deployment workflow repeats this gate before Hugo publishes.
- `Article proofreading` produces advisory reports and opens a separate bot PR per article for Chinese dictionary corrections. English spelling suggestions remain in the report. Never automatically merge a proofreading PR.
- Before writing on another device, fetch/pull main with a clean working tree. After a reviewed PR is merged, use `git pull --ff-only origin main`; if there are local unpublished commits, fetch then rebase explicitly as documented.
