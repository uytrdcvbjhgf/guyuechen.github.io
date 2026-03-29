# 文章生成規範

- 使用 `hugo new posts/{分類}/{子分類（可選）}/{主題-title}.md` 命令創建新文章。

- 文章路徑按技術領域分類，建議目錄結構示例：`/dev/protocol/http`、`/dev/protocol/ftp` 等，層級不宜超過 4 級，方便長期維護和快速定位。

- 文件名採用英文小寫，單詞間用連字符分隔，結尾統一爲 `.md`。

- 如需多語言版本，建議文件名後加語言後綴如 `_zh` / `_ja`，例如：`soap_zh.md`、`soap_ja.md`。

- 文章最好使用 `hugo new posts/dev/protocol/http/xxx_zh.md` 或 `hugo new posts/dev/protocol/http/xxx_ja.md` 生成，然後編輯內容，確保 `draft = false`（否則CI通常不會發布）。

- 標籤（tags）建議不超過 3 個，且全部使用英文小寫（關鍵技術詞可保持大寫，如 SOAP、HTTP）。例如：`tags = ['SOAP', 'http']`。

- 文章內容需包含清晰段落、代碼塊註明語言。

- 內容中中文、日文、英文、數字之間建議保留半角空格，避免視覺擁擠。例如：
  - 正確：Java 是一種面向對象的編程語言。
  - 正確：版本爲 1.8。
  - 錯誤：Java是一種面向對象的編程語言。
  - 錯誤：版本爲1.8。

- 標題和正文中所有簡體中文字符需轉換爲繁體中文，以避免在日語系統上顯示亂碼。

- 正文不需要和 title 重複的一級標題，直接從二級標題開始寫。

- 在正文的各級標題和內容中出現類名（如 SecurityFilterChain），需使用行內代碼格式（如 `SecurityFilterChain`）。

- Front Matter 必須採用 TOML 格式，字段包括：
  - `title` 文章標題，單引號包裹
  - `date` 採用 `2025-02-25T19:34:24+08:00` 格式，表示文章創建時間，注意自動生成時確保時間早於當前系統時間
  - `categories`、`tags` 爲數組，單引號包裹元素

  示例：
  ```toml
  +++
  title = 'SpringBatch 簡介'
  date = 2025-02-25T19:34:24+08:00
  categories = ['java']
  tags = ['java', 'spring', 'springboot', 'springbatch']
  +++
  ```
