+++
title = 'SOAP 開發手冊'
date = 2026-03-29T12:00:00+08:00
draft = false
categories = ['dev']
tags = ['SOAP', 'http']
+++

## 1. SOAP 是什麼（通俗講解）

SOAP 可以理解爲“把調用請求封裝在 XML 信封裏，通過 HTTP 寄送”。先從最簡單的類比開始：

- REST 是“直接說一句話，放在 JSON 包裏發給對方”。
- SOAP 是“一封掛號信，包好信封，寫齊協議，留簽收回執”。

SOAP 的基本結構：
- Envelope（信封）
- Header（報頭，認證、事務信息）
- Body（請求/響應內容）
- Fault（錯誤結構）

示例請求：

```xml
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ex="http://example.com">
  <soapenv:Header/>
  <soapenv:Body>
    <ex:GetUser>
      <ex:id>123</ex:id>
    </ex:GetUser>
  </soapenv:Body>
</soapenv:Envelope>
```

## 2. 傳輸流程（動圖式思維）

1. 客戶端拼 SOAP XML
2. HTTP POST 到 `/ws/user` 等 SOAP 端點
3. 服務端解析、執行業務、返回 SOAP XML
4. 客戶端解析成功結果或 `Fault` 錯誤

## 3. 實操指南（項目中怎麼做）

- 首先使用 WSDL 定義契約。
- 服務器端：`wsdl2java` / `wsimport` 生成 stub，確保命名空間一致。
- 客戶端：按命名空間和 `action` 請求，Header 中可帶 WS-Security、token。
- 運行測試時，推薦用 `curl` 直接驗證：

```bash
curl -X POST \
  -H "Content-Type: text/xml; charset=UTF-8" \
  -H "SOAPAction: \"http://example.com/GetUser\"" \
  -d @request.xml \
  http://localhost:8080/ws/user
```

- 重要：SOAP 的錯誤通常在響應體 `Fault` 裏，即使 HTTP 200 也要檢查。

---

## 4. REST 比對（項目選型核心）

### 4.1 共同點
- 都可以用 HTTP 作爲傳輸協議
- 都有請求/響應語義

### 4.2 核心差異
- 數據形式：SOAP 是 XML，REST 常用 JSON
- 契約形式：SOAP 強類型 WSDL，REST 靈活約定（OpenAPI）
- 擴展：SOAP 的 WS-*（安全、事務、可靠性） vs REST 的協議零散

### 4.3 優劣對照
- SOAP 優勢：企業級規範、可審計、強類型、通用安全標準
- SOAP 劣勢：報文大、解析複雜、線上調試不便、對前端不友好
- REST 優勢：輕量、效率高、調試方便、對Web/Mobile友好
- REST 劣勢：企業級事務/安全需自建（JWT/OAuth/TLS）

### 4.4 架構選型建議
- 公共 API/前端直連：REST優先
- 供應商、銀行、電信 B2B：SOAP優選或混合網關
- 兼容場景：在API網關層實現“REST->SOAP轉換”保持用戶體驗

## 5. 結論（最關鍵）

- 2026 年，SOAP 仍是“遺留與高可控的企業內核”，但 REST 是“快速迭代的前端時代標配”。
- 最好把選擇路徑寫到系統架構標準裏：
  - 項目類型 + 法規要求 + 速度優先 -> REST
  - 交易重吞吐 + 簽名/契約 + 可審計 -> SOAP


