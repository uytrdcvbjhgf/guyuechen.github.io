+++
title = 'SOAP 与 REST'
date = 2026-03-29T12:00:00+08:00
categories = ['dev']
tags = ['SOAP', 'http']
+++

## 1. SOAP 是什么（通俗讲解）

SOAP 可以理解为“把调用请求封装在 XML 信封里，通过 HTTP 寄送”。先从最简单的类比开始：

- REST 是“直接说一句话，放在 JSON 包里发给对方”。
- SOAP 是“一封挂号信，包好信封，写齐协议，留签收回执”。

SOAP 的基本结构：
- Envelope（信封）
- Header（报头，认证、事务信息）
- Body（请求/响应内容）
- Fault（错误结构）

示例请求：

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

## 2. 传输流程（动图式思维）

1. 客户端拼 SOAP XML
2. HTTP POST 到 `/ws/user` 等 SOAP 端点
3. 服务端解析、执行业务、返回 SOAP XML
4. 客户端解析成功结果或 `Fault` 错误

## 3. 实操指南（项目中怎么做）

- 首先使用 WSDL 定义契约。
- 服务器端：`wsdl2java` / `wsimport` 生成 stub，确保命名空间一致。
- 客户端：按命名空间和 `action` 请求，Header 中可带 WS-Security、token。
- 运行测试时，推荐用 `curl` 直接验证：

```bash
curl -X POST \
  -H "Content-Type: text/xml; charset=UTF-8" \
  -H "SOAPAction: \"http://example.com/GetUser\"" \
  -d @request.xml \
  http://localhost:8080/ws/user
```

- 重要：SOAP 的错误通常在响应体 `Fault` 里，即使 HTTP 200 也要检查。

---

## 4. REST 比对（项目选型核心）

### 4.1 共同点
- 都可以用 HTTP 作为传输协议
- 都有请求/响应语义

### 4.2 核心差异
- 数据形式：SOAP 是 XML，REST 常用 JSON
- 契约形式：SOAP 强类型 WSDL，REST 灵活约定（OpenAPI）
- 扩展：SOAP 的 WS-*（安全、事务、可靠性） vs REST 的协议零散

### 4.3 优劣对照
- SOAP 优势：企业级规范、可审计、强类型、通用安全标准
- SOAP 劣势：报文大、解析复杂、线上调试不便、对前端不友好
- REST 优势：轻量、效率高、调试方便、对Web/Mobile友好
- REST 劣势：企业级事务/安全需自建（JWT/OAuth/TLS）

### 4.4 架构选型建议
- 公共 API/前端直连：REST优先
- 供应商、银行、电信 B2B：SOAP优选或混合网关
- 兼容场景：在API网关层实现“REST->SOAP转换”保持用户体验

## 5. 结论（最关键）

- 2026 年，SOAP 仍是“遗留与高可控的企业内核”，但 REST 是“快速迭代的前端时代标配”。
- 最好把选择路径写到系统架构标准里：
  - 项目类型 + 法规要求 + 速度优先 -> REST
  - 交易重吞吐 + 签名/契约 + 可审计 -> SOAP


