+++
title = 'SOAP と REST'
date = 2026-03-29T12:00:00+09:00
draft = false
categories = ['dev']
tags = ['SOAP', 'http']
+++

## 1. SOAP の 超かんたん解説

SOAP は 「XML で 値を書いた重たい封筒」 を HTTP で送る仕組みです。読者を完全に初心者と想定し、まずは郵便のたとえで理解します。

- REST は 「普通の手紙（JSON）を直にやりとり」
- SOAP は 「書留郵便（XML + Envelope）に ID 付け、証拠も残る」

### SOAP の 4つの 箱
- Envelope：全体構造。"これから SOAP だよ"という開始シグナル
- Header：認証やセッション、ルーティング情報
- Body：呼び出す操作名と引数、結果
- Fault：異常発生時のエラー構造

### 具体イメージ
```
Envelope（封筒）
  Header（宛先＋鍵）
  Body（どの処理を、どんなデータで実行するか）
```

例：ユーザーID 123 の名前を取る

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

## 2. SOAP の 基本通信フロー

1. クライアントが `Action` と `Body` を XML で生成
2. HTTP POST で SOAP エンドポイント送信
3. サーバーが解析して業務呼び出し
4. SOAP レスポンス（正常 / FAULT）で応答

## 3. 実践：簡易 SOAP サーバーとクライアント

### 実装概要（Java + Spring Boot想定）
- `wsdl2java` でスタブ生成
- `cxf-rt-frontend-jaxws` / `cxf-rt-transports-http`
- `soapAction`、名前空間、型が一致しないと即エラー

### curlでの手動検証

```bash
curl -X POST \
  -H "Content-Type: text/xml; charset=UTF-8" \
  -H "SOAPAction: \"http://example.com/GetUser\"" \
  -d @request.xml \
  http://localhost:8080/ws/user
```

### エラーに注意
- HTTP 200でも `Fault` が含まれる場合あり
- `faultcode` / `faultstring` を必ずパース

---

## 4. RESTとの比較 (アーキテクチャ選定向け深掘り)

### NGT方式
- SOAP：契約重視（WSDL）
- REST：リソース指向（URI + メソッド）

### データ形式
- SOAP：XML（xsd型付け、構造厳格）
- REST：JSON/ほか（可変柔軟）

### セキュリティ＆トランザクション
- SOAP：WS-Security/WS-ReliableMessagingで企業連携に強い
- REST：OAuth2+TLSで軽量だが、同等の細かな仕様は追加工が必要

### 運用負荷
- SOAP：メッセージサイズ大、パース負荷高、テストに WSDL 管理必要
- REST：デバッグしやすい、ブラウザ・Postmanで即確認

### 限定ケース
- 既存レガシー、金融/行政の B2B は SOAP優勢
- モダンWebアプリ公開APIは REST優勢
- 結論：観点は「相手先要件」「トラストレベル」「開発速度」

## 5. 選定アクション

- B2B契約があれば SOAP 検討
- 新規APIはまず RESTで設計、必要ならSOAPブリッジを挟む
- 技術負債抑制＋モニタリング可視化を最優先

## 6. まとめ

SOAPは「重厚な企業契約の土台」、RESTは「俊敏で軽量なフロントライン」。
2026年のプロジェクトでは、両者を並列評価して「要件と運用コストに応じて共存戦略」をとるのが実情。
