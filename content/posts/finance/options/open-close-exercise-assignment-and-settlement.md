+++
title = '开仓、平仓、行权、指派与到期结算'
date = 2026-08-12T11:20:00+09:00
draft = true
categories = ['finance']
tags = ['options', 'derivatives']
description = '沿着一份期权从建立头寸到退出或结算的生命周期，分清开仓、平仓、行权、指派、实物交割与现金结算。'
+++

前置阅读：[《期权：从“买一项权利”开始理解》](/posts/finance/options/options-intro/)介绍了买方权利与卖方义务；[《读懂期权合约与期权链》](/posts/finance/options/option-contracts-and-chains/)介绍了到期日、行权价、合约乘数和报价。如果已经熟悉这些概念，也可以直接从本文开始。

期权最容易混乱的地方，往往不是 Call 和 Put，而是下面几句话看起来像在说同一件事：

- 买入一份 Call；
- 卖出手里的 Call；
- 行权买入股票；
- short Call 被指派卖出股票。

它们其实发生在两个不同层面。**开仓与平仓** 是在市场上交易期权合约，**行权与指派** 是把合约中的权利和义务变成股票或现金。

只要先把这两个层面分开，到期处理就不会再像一组零散规则。

## 一份期权有两条常见的结束路径

建立头寸以后，通常有两种思路：

1. 在到期前做一笔相反的期权交易，把头寸平掉；
2. 保留头寸，让它进入行权、指派、到期失效或现金结算。

![期权合约的生命周期：买入或卖出开仓后，可以通过相反交易平仓，也可能进入行权、指派、到期失效或现金结算](https://raw.githubusercontent.com/uytrdcvbjhgf/gallery/main/img/options-position-lifecycle.png)

大多数时候，“卖出期权”并不等于“成为期权卖方”。如果原来持有一份 Long Call，现在把它卖掉，这叫卖出平仓，卖出后权利也随之结束；只有在没有对应多头、通过卖出建立 short option 时，才是在承担新的履约义务。

## Open 与 Close：说的是头寸增加还是减少

交易软件常把买卖方向与开平方向组合成四种指令。

| 指令          | 对头寸的影响 | 交易后通常得到什么      |
| ------------- | ------------ | ----------------------- |
| Buy to Open   | 买入开仓     | 增加 Long Option        |
| Sell to Close | 卖出平仓     | 减少或结束 Long Option  |
| Sell to Open  | 卖出开仓     | 增加 Short Option       |
| Buy to Close  | 买入平仓     | 减少或结束 Short Option |

假设先用 3 元买入一份 Call，后来以 5 元卖出同一合约：

> 3 元买入是 Buy to Open
>
> 5 元卖出是 Sell to Close
>
> 忽略费用后的期权交易利润为 2 元

这笔交易没有发生股票交割，也不需要等到期。期权本身可以像其他市场合约一样，在有流动性的前提下通过反向交易退出。

同理，先卖出一份 Put，再买回同一标的、到期日、类型与行权价的 Put，是先 Sell to Open、再 Buy to Close。买回之后，已经关闭的数量不再承担后续指派义务。

### 必须是同一份合约才能直接抵消

期权头寸由标的、到期日、Call 或 Put、行权价共同识别。卖出另一到期日或另一行权价的 Call，不是在平掉原来的 Long Call，而是在账户里增加第二条腿。

这也是多腿策略产生的方式：看起来都叫 Call，合约身份只要有一项不同，就不会自动互相消失。

## Exercise：买方主动使用合约权利

**行权（exercise）** 由期权持有人发起。

- Long Call 行权：按行权价买入标的；
- Long Put 行权：按行权价卖出标的。

以标准股票期权的一张 100 Call 为例，如果合约乘数为 100，行权 Call 通常意味着支付 10,000 元并取得 100 股股票，而不是只支付当初买 Call 的权利金。

Long Put 也一样需要考虑交割能力。如果没有 100 股股票却行权一张实物交割 Put，账户可能形成 100 股 short stock；券商是否允许、需要多少保证金，取决于账户与产品规则。

### 有内在价值，也不一定适合提前行权

期权市场价格可能同时包含内在价值和时间价值。提前行权通常只能兑现内在价值，剩余时间价值可能被放弃。

假设一份 Call 的内在价值为 8 元，市场上仍能以 9.20 元卖出：

> 直接行权只实现约 8 元内在价值
>
> 卖出平仓则可能同时保留 1.20 元剩余时间价值

因此，想结束 Long Option 时，应先比较卖出平仓与行权后的实际结果，而不是看到实值就立即行权。深度实值、流动性很差、股息或融资因素明显时，结论可能不同，但比较不能省略。

## Assignment：卖方收到履约通知

**指派（assignment）** 发生在 short option 一侧。某位持有人提交行权后，清算体系会把对应义务分配给仍持有该系列 short position 的账户。

- Short Call 被指派：按行权价卖出或交付标的；
- Short Put 被指派：按行权价买入标的。

卖方并不是和最初成交的那位买方永久绑定。买方可以早已平仓，期权仍会在市场参与者之间流转；只要 short position 仍然存在，就可能被分配到行权义务。

对于美式期权，指派不只发生在到期日。深度实值、剩余时间价值很少时，提前指派概率通常会上升；short Call 临近除息日、short Put 的融资收益变得重要时，也值得额外检查。

一旦收到指派，原来的 short option 会变成合约约定的股票或现金结果，不能再通过第二天买回那份期权撤销已经完成的指派。

## American 与 European 只决定何时可以行权

美式和欧式描述的是行权时间，不是交易地点：

- American-style：持有人通常可以在到期日及此前规定时间内行权；
- European-style：持有人通常只能在到期日行权。

这不影响持有人在到期前通过市场交易平仓。即使一份 European-style option 不能提前行权，只要市场仍在交易，Long Option 仍可以卖出平仓，Short Option 也仍可以买入平仓。

不同产品还可能有不同的最后交易日。不能把“到期日”“最后交易日”和“最终结算值确定时间”默认当作同一时刻。

## 实物交割与现金结算会留下不同东西

行权或指派以后，账户到底发生什么，取决于结算方式。

| 合约结果 | Long Call          | Long Put          | Short Call         | Short Put         |
| -------- | ------------------ | ----------------- | ------------------ | ----------------- |
| 实物交割 | 按行权价买入标的   | 按行权价卖出标的  | 按行权价交付标的   | 按行权价买入标的  |
| 现金结算 | 收到 Call 结算差额 | 收到 Put 结算差额 | 支付 Call 结算差额 | 支付 Put 结算差额 |

美国标准股票期权通常实物交割股票；许多指数期权则使用现金结算，但具体产品的行权方式、AM 或 PM 结算、最后交易时间和结算值算法可能不同。

现金结算并不代表风险更小。它只是不会留下股票仓位，最终现金差额仍可能很大；AM-settled 产品还可能在停止交易后才根据成分股开盘价确定结算值，期间无法再用原期权调整。

## 到期实值不等于账户结果已经确定

美国市场常见的 exercise by exception 是一种到期处理程序：达到规定实值阈值的合约，在没有相反指令时会进入行权处理。它经常被口语化地叫作“自动行权”，但客户仍需要核对券商自己的阈值、截止时间与资金处理规则。

到期前后还有几个容易忽略的风险：

- 收盘后标的价格仍可能变化，持有人可能据此提交行权或不行权指令；
- 标的恰好在行权价附近时，short option 是否被指派可能难以预先确定；
- 账户资金不足时，券商可能提前平仓、拒绝行权或采取其他风险控制措施；
- 多腿组合的一条腿进入行权或指派，不保证其他腿会被自动同步处理。

因此，到期盈亏图只能解释价格结构，不能替代账户操作。尤其是价差、Calendar、Covered Call 和 Collar，某一条腿变化后，留下的仓位可能与开仓策略完全不同。

## 一个到期前检查例子

假设账户持有一张 100 / 105 Bull Call Spread：Long 100 Call，Short 105 Call，合约乘数为 100。临近到期时标的价格为 104.80 元。

表面上看，两条腿之间还有 0.20 元距离，但真正需要检查的是：

1. Long 100 Call 是否会进入行权处理，需要准备多少资金？
2. 收盘后价格如果涨过 105 元，Short Call 是否可能被指派？
3. 如果只有 Long Call 行权，账户会留下多少股票？
4. 如果两条腿都被处理，最终股票交易价格分别是什么？
5. 是否更适合在市场仍有流动性时直接平掉整个价差？

这类接近行权价的到期不确定性常被称为 pin risk。它提醒我们，最大盈亏公式默认两条腿按照到期价值结算，真实账户还需要处理指令、资金、股票与时间差。

## 到期前的操作清单

持有任何即将到期的期权时，可以依次确认：

1. 这是 Long 还是 Short，准备平仓还是进入结算？
2. 合约是 American-style 还是 European-style？
3. 最后交易日、到期日和券商指令截止时间分别是什么？
4. 是实物交割还是现金结算，结算值如何确定？
5. 行权或指派后会留下多少股票或现金义务？
6. 账户是否有足够现金、股票、保证金和交易权限？
7. 期权是否还有值得保留的时间价值？
8. 多腿组合如果只处理一条腿，剩余风险是什么？
9. 收盘后行情变化会不会改变行权决定？

检查这些问题不是为了预测指派，而是确保任何一种结果发生时，账户都不会出现完全意外的仓位。

## 小结

开仓和平仓发生在期权市场，决定的是合约头寸增加还是减少；行权和指派执行合约条款，决定的是股票或现金如何交割。

Long Option 可以卖出平仓，也可以在规则允许时行权；Short Option 可以买入平仓，只要仍保持开仓状态，就要承担被指派的可能。美式与欧式决定何时可以行权，实物与现金结算决定行权后账户里留下什么。

如果只记住一个原则，可以记住：

> 不要只问期权到期赚多少，还要问它到期后会在账户里变成什么。

理解这条生命周期以后，可以继续阅读[《权利金、内在价值与定价模型》](/posts/finance/options/option-premium-intrinsic-value-and-pricing-models/)，把合约操作与价格结构连接起来。

本文用于金融知识整理，不构成投资建议。券商对行权阈值、指令截止时间、资金不足账户和到期风险的处理可能不同，真实交易前应核对产品规格、账户协议与最新规则。

## 参考与延伸阅读

1. Options Industry Council, [General Information FAQ](https://www.optionseducation.org/referencelibrary/faq/general-information)。Buy/Sell to Open、Buy/Sell to Close 与关闭头寸后的权利义务。
2. Options Industry Council, [Exercising Options](https://www.optionseducation.org/optionsoverview/exercising-options) 与 [Options Exercise FAQ](https://www.optionseducation.org/referencelibrary/faq/options-exercise)。行权、指派、提前行权和 exercise by exception。
3. Options Industry Council, [Equity vs. Index Options](https://www.optionseducation.org/advancedconcepts/equity-vs-index-options)。实物交割、现金结算以及 AM/PM settlement 的区别。
4. Options Clearing Corporation, [Equity Options Product Specifications](https://www.theocc.com/clearance-and-settlement/clearing/equity-options-product-specifications)。标准股票期权的合约单位、行权方式与交割规则。
5. Options Clearing Corporation, [Characteristics and Risks of Standardized Options](https://www.theocc.com/company-information/documents-and-archives/options-disclosure-document)。标准化期权的行权、指派、到期与风险披露。
