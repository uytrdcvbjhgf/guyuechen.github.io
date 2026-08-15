+++
title = '四种方向性价差策略'
date = 2026-08-15T16:26:16+09:00
draft = false
categories = ['finance']
tags = ['options', 'derivatives']
description = '用同一组行权价比较 Bull Call、Bull Put、Bear Put 与 Bear Call，理解方向性垂直价差的有限盈亏、debit与credit及到期风险。'
+++

前置阅读：[《Long Call、Long Put、Covered Call、Cash-Secured Put》](/posts/finance/options/long-call-long-put-covered-call-and-cash-secured-put/)介绍了四种基础方向头寸；[《权利金、内在价值与定价模型》](/posts/finance/options/option-premium-intrinsic-value-and-pricing-models/)介绍了 Put-Call Parity；[《开仓、平仓、行权、指派与到期结算》](/posts/finance/options/open-close-exercise-assignment-and-settlement/)说明了多腿组合到期后可能留下的股票或现金义务。如果已经熟悉这些概念，也可以直接从本文开始。

单独买入 Call 或 Put，最大损失可以限制在权利金内，但为了得到这份凸性，需要支付全部时间价值。单独卖出期权可以先收到权利金，却可能承担很大的尾部风险。

方向性价差在两者之间做了一次切割：买入一份期权，同时卖出另一份相同类型、相同到期日但不同行权价的期权，用一条腿限制另一条腿的成本或风险。

最常见的四种结构是：

- Bull Call Spread：看涨，开仓支付净权利金；
- Bull Put Spread：看涨，开仓收到净权利金；
- Bear Put Spread：看跌，开仓支付净权利金；
- Bear Call Spread：看跌，开仓收到净权利金。

名字有四个，真正需要理解的形状只有两种：有限看涨与有限看跌。

## Vertical Spread 到底“垂直”在哪里

一组标准的 **Vertical Spread（垂直价差）** 通常满足：

- 标的相同；
- Call 或 Put 类型相同；
- 到期日相同；
- 合约数量相同；
- 行权价不同。

“垂直”来自传统期权链的排版：同一个到期日下，行权价纵向排列，两条腿沿行权价方向上下组合。它不是在形容盈亏线一定竖直。

两个行权价之间的距离叫作 **spread width**。如果使用 95 和 105 两个 strike，宽度就是：

> Spread Width = 105 - 95 = 10 元

只要两条腿始终完整存在，这个宽度会为组合的到期价值设置上限，从而把四种策略都变成有限收益、有限损失。

## 先确定共同参数

为了直接比较，全文使用一组符合简化 Put-Call Parity 的虚构报价：

- 标的现价为 100 元；
- 95 Call 权利金为 7.50 元；
- 105 Call 权利金为 2.50 元；
- 95 Put 权利金为 2.50 元；
- 105 Put 权利金为 7.50 元；
- 每份期权暂按 1 单位标的计算；
- 忽略利率、股息、手续费、税费和买卖价差。

因此，四种组合的净 debit 或 credit 都恰好为 5 元，盈亏平衡点都落在 100 元。这种对称是为了看清结构，真实报价不会总是如此整齐。

| 策略      | 买入腿        | 卖出腿         | 开仓现金流 | 方向     |
| --------- | ------------- | -------------- | ---------: | -------- |
| Bull Call | Long 95 Call  | Short 105 Call |     支付 5 | 有限看涨 |
| Bull Put  | Long 95 Put   | Short 105 Put  |     收到 5 | 有限看涨 |
| Bear Put  | Long 105 Put  | Short 95 Put   |     支付 5 | 有限看跌 |
| Bear Call | Long 105 Call | Short 95 Call  |     收到 5 | 有限看跌 |

![四种方向性垂直价差的到期盈亏：Bull Call与Bull Put在标的上涨时获利，Bear Put与Bear Call在标的下跌时获利；共同使用95和105行权价](https://raw.githubusercontent.com/uytrdcvbjhgf/gallery/main/img/options-four-directional-vertical-spreads-payoff.png)

## Bull Call Spread：降低 Long Call 成本，同时封住上方

Bull Call Spread 由一低一高两份 Call 组成：

> 买入 95 Call，支付 7.50 元
>
> 卖出 105 Call，收入 2.50 元
>
> 初始净支出 = 5 元

Long 95 Call 提供上涨收益，Short 105 Call 补贴 2.50 元成本，却也让 105 元以上的收益不再增加。

到期结果可以分成三段：

- 标的不高于 95 元：两份 Call 都失效，最大损失为净支出 5 元；
- 标的位于 95 到 105 元：只有 Long Call 产生内在价值，盈亏随标的上涨；
- 标的不低于 105 元：两份 Call 的价差固定为 10 元，扣除净支出后最大收益为 5 元。

因此：

> 最大损失 = Net Debit = 5 元

> 最大收益 = Spread Width - Net Debit = 10 - 5 = 5 元

> 到期盈亏平衡点 = Long Call Strike + Net Debit = 95 + 5 = 100 元

与单独买入 95 Call 相比，Bull Call 少支付了 2.50 元，但放弃了 105 元以上的上涨收益。Short Call strike 本质上是给自己的上涨预测设置目标价：超过这个位置继续看对，也不会继续增加到期利润。

## Bull Put Spread：收到 credit，并承担有限下跌风险

Bull Put Spread 使用相同的两个 strike，但换成 Put：

> 卖出 105 Put，收入 7.50 元
>
> 买入 95 Put，支付 2.50 元
>
> 初始净收入 = 5 元

Short 105 Put 是主要收益与风险来源；Long 95 Put 则在标的大幅下跌时接过风险，使组合损失不再继续扩大。

到期时：

- 标的不低于 105 元：两份 Put 都失效，保留全部 5 元 credit；
- 标的位于 95 到 105 元：Short Put 逐渐产生亏损，Long Put 仍无内在价值；
- 标的不高于 95 元：两份 Put 的价差固定为 10 元，扣除已收 credit 后最大损失为 5 元。

因此：

> 最大收益 = Net Credit = 5 元

> 最大损失 = Spread Width - Net Credit = 10 - 5 = 5 元

> 到期盈亏平衡点 = Short Put Strike - Net Credit = 105 - 5 = 100 元

“开仓收到 5 元”不表示交易已经赚到 5 元。这笔 credit 是承担 105 Put 义务的补偿，只有义务消失或组合平仓后，才能确认最终盈亏。

## Bear Put Spread：降低 Long Put 成本，同时封住下方

Bear Put Spread 是 Bull Call 的向下版本：

> 买入 105 Put，支付 7.50 元
>
> 卖出 95 Put，收入 2.50 元
>
> 初始净支出 = 5 元

Long 105 Put 从下跌中获利，Short 95 Put 补贴成本，并把 95 元以下的继续下跌收益封住。

到期结果为：

- 标的不低于 105 元：两份 Put 都失效，最大损失为净支出 5 元；
- 标的位于 95 到 105 元：Long Put 产生内在价值，盈亏随标的下跌改善；
- 标的不高于 95 元：两份 Put 的价差固定为 10 元，最大收益为 5 元。

对应公式是：

> 最大损失 = Net Debit = 5 元

> 最大收益 = Spread Width - Net Debit = 5 元

> 到期盈亏平衡点 = Long Put Strike - Net Debit = 105 - 5 = 100 元

如果认为标的会下跌，但不认为它会跌得远低于 95 元，卖出 95 Put 可以减少 Long Put 的初始成本。代价是即使标的跌到 70 元，组合最大收益仍停在 5 元。

## Bear Call Spread：收到 credit，并承担有限上涨风险

Bear Call Spread 由一空一多两份 Call 组成：

> 卖出 95 Call，收入 7.50 元
>
> 买入 105 Call，支付 2.50 元
>
> 初始净收入 = 5 元

Short 95 Call 希望标的维持在较低位置，Long 105 Call 则为意外上涨设置风险上限。

到期时：

- 标的不高于 95 元：两份 Call 都失效，最大收益为 5 元 credit；
- 标的位于 95 到 105 元：Short Call 逐渐产生亏损；
- 标的不低于 105 元：两份 Call 的价差固定为 10 元，最大损失为 5 元。

因此：

> 最大收益 = Net Credit = 5 元

> 最大损失 = Spread Width - Net Credit = 5 元

> 到期盈亏平衡点 = Short Call Strike + Net Credit = 95 + 5 = 100 元

它不像裸卖 Call 那样拥有理论上无限的上涨损失，但“defined risk”只在两条腿数量匹配且 Long Call 仍然存在时成立。平掉保护腿、保护腿提前到期或 short leg 被单独指派后，账户风险会改变。

## 同一个方向，debit 与 credit 可以得到同一条到期线

在本文忽略利率和股息的对称例子中：

- Bull Call 与 Bull Put 的到期盈亏完全相同；
- Bear Put 与 Bear Call 的到期盈亏完全相同。

![方向相同的debit与credit垂直价差在简化条件下具有相同到期盈亏：Bull Call对应Bull Put，Bear Put对应Bear Call；区别主要在现金流时点和持仓路径](https://raw.githubusercontent.com/uytrdcvbjhgf/gallery/main/img/options-vertical-spreads-debit-credit-equivalence.png)

这不是巧合，而是 Put-Call Parity 在两个 strike 上的结果。忽略 carry 时，同方向组合通常满足：

> Bull Call Debit + Bull Put Credit = Spread Width

> Bear Put Debit + Bear Call Credit = Spread Width

本文中 debit 与 credit 都是 5 元，宽度为 10 元，因此方向相同的组合拥有相同的最大收益、最大损失和盈亏平衡点。

真实市场需要考虑行权价现金的折现、股息与交易摩擦，两组价格不会永远精确相加为名义宽度。但如果差异大到无法用 carry 和成本解释，就值得重新检查报价、合约身份与流动性。

### 到期等价，不等于交易过程相同

| 比较项         | Debit Spread           | Credit Spread                      |
| -------------- | ---------------------- | ---------------------------------- |
| 初始现金流     | 先支付净权利金         | 先收到净权利金                     |
| 常见最大损失   | 已付 debit             | width 减去 credit                  |
| 资金处理       | 通常需要支付全部 debit | 通常需要为最大风险保留资金或保证金 |
| 主要 short leg | 远离有利方向的封顶腿   | 更接近主要风险来源的收款腿         |
| 指派风险       | 仍有 short option      | 仍有 short option                  |
| 心理误区       | 认为“付钱所以胜率低”   | 认为“收钱所以已经盈利”             |

Credit 不是免费优势，Debit 也不天然更激进。真正应该比较的是相同到期现金流需要占用多少资金、承担什么行权路径，以及用怎样的成交价格进入和退出。

## Greeks：两条腿会抵消，但不会永远中性

[《Greeks、隐含波动率与期限结构》](/posts/finance/options/option-greeks-implied-volatility-and-term-structure/)中提到，多腿策略应观察净 Greeks，而不是只看其中一条腿。

方向性价差通常具有这些倾向：

| 方向                 | Delta         | Gamma、Theta 与 Vega                                   |
| -------------------- | ------------- | ------------------------------------------------------ |
| Bull Call / Bull Put | 净 Delta 为正 | 两腿部分抵消，符号和大小会随标的相对 strike 的位置变化 |
| Bear Put / Bear Call | 净 Delta 为负 | 两腿部分抵消，符号和大小会随标的相对 strike 的位置变化 |

不要机械地把 debit spread 记成负 Theta、credit spread 记成正 Theta。当标的穿过两个 strike，哪条腿更接近平值会发生变化，净 Gamma、Theta 与 Vega 也可能改变符号。

相比单独 Long Call 或 Long Put，debit spread 通常支付更少时间价值，却也拥有更少正 Gamma 与正 Vega；credit spread 的 Long Option 限制尾部风险，同时也抵消一部分 short leg 的 Theta 与 Vega。

## Strike Width 决定形状，不单独决定仓位大小

把 95 / 105 的宽度从 10 元扩大到 20 元，通常会扩大最大潜在收益和损失，但不能只看到“defined risk”就忽略账户金额。

如果合约乘数为 100，本文 5 元的最大损失对应：

> 5 × 100 = 500 元 / 组

交易 10 组就变成 5,000 元。宽度、净权利金、乘数和组合数量必须一起换算。

选择 strike 时可以从两个问题出发：

1. 到期时，自己的方向判断在哪个价格附近基本兑现？
2. 如果判断错误，账户最多愿意损失多少？

对于 debit spread，short strike 往往接近愿意停止继续购买上涨或下跌收益的位置；对于 credit spread，short strike 则是开始承担主要内在价值损失的位置。把 short strike 机械等同于“不会被碰到的安全线”，通常会低估风险。

## 到期前，盈亏不会只按三段直线移动

到期盈亏图假设时间价值已经归零。到期前，两条腿仍然受到标的价格、剩余期限、IV、skew 和 Bid / Ask 影响。

即使标的还没有越过盈亏平衡点，价差也可能因为有利的方向变化提前盈利；反过来，即使标的已经位于到期盈利区，剩余时间价值和波动率变化也可能让组合尚未达到最大收益。

因此：

- 盈亏平衡点主要描述到期结果，不是盘中必须触及的止盈线；
- 最大收益和最大损失是完整组合的到期边界，不保证任何时刻都能按该价格成交；
- 两条腿的买卖价差会同时影响进出场；
- 分腿成交会暂时暴露为单腿风险，使用组合限价单通常更容易控制净 debit 或 credit。

## 指派、到期与 Pin Risk

四种策略都包含一条 short option，因此都存在指派问题。

如果 short leg 被提前指派，而 long leg 仍在账户中，组合可能暂时变成股票加 Long Option。Long leg 提供经济上的风险边界，不代表券商一定会自动替你行权或立即完成另一条腿。

临近到期时，如果标的正好在某个 strike 附近，还会出现 pin risk：

- 一条腿可能进入行权或指派，另一条腿失效；
- 收盘后价格变化可能影响持有人的最终指令；
- 原本的 defined-risk spread 可能在结算后留下意外股票仓位。

如果不准备接受股票、现金或保证金变化，应在市场仍有流动性时明确决定平仓、进入行权处理还是接受指派，而不是只看盈亏图等待系统自动收尾。

## 四种策略如何选择

| 判断                                   | 更接近的结构 | 放弃了什么                           |
| -------------------------------------- | ------------ | ------------------------------------ |
| 预期上涨，愿意先支付确定成本           | Bull Call    | 高 strike 以上的上涨收益             |
| 预期维持或上涨，愿意为下跌风险保留资金 | Bull Put     | 大跌时仍可能承担 width-credit 的损失 |
| 预期下跌，愿意先支付确定成本           | Bear Put     | 低 strike 以下的继续下跌收益         |
| 预期维持或下跌，愿意承担上涨风险       | Bear Call    | 大涨时仍可能承担 width-credit 的损失 |

如果两种同方向结构的到期盈亏接近，可以继续比较：

- 哪一侧的 Bid / Ask 更窄？
- Put skew 是否让某一组报价明显更贵？
- 是否愿意承担对应 short leg 的提前指派？
- debit 与 credit 的资金占用和券商权限有何差异？
- 股息、税务与结算方式是否会改变实际路径？

策略名称不能替这些问题做决定。

## 常见误区

### Credit 越大越好

更高 credit 往往意味着 short strike 更接近现价、spread 更宽，或者市场给这段风险标出了更高价格。收入增加时，承担的概率、幅度或流动性风险也可能同步增加。

### Defined Risk 不需要管理

最大损失有限，只说明完整组合在简化到期场景中的边界明确。分腿、指派、流动性、合约乘数和账户强制处置仍可能让实际过程偏离一张干净的盈亏图。

### 方向看对就一定达到最大收益

Bull Spread 需要标的到期达到或超过高 strike，Bear Spread 需要标的到期达到或低于低 strike，才进入最大收益区域。只是小幅看对方向，可能仍未越过盈亏平衡点。

### Long Leg 会自动处理 Short Leg

Long Option 提供权利，Short Option 带来义务。券商与清算流程不会因为两条腿在策略页面里显示成一组，就保证它们总在同一时刻被处理。

## 开仓前检查清单

建立方向性垂直价差前，可以逐项确认：

1. 两条腿是否属于相同标的、类型和到期日？
2. Long 与 Short 数量是否完全匹配？
3. Spread width、net debit 或 credit 分别是多少？
4. 最大收益、最大损失和到期盈亏平衡点是多少？
5. 乘以合约乘数和数量后，真实账户风险是多少？
6. Short strike 是否与方向目标和风险预算一致？
7. 两条腿的 Bid / Ask 是否适合用组合限价单成交？
8. Short leg 被提前指派后，账户会留下什么？
9. 到期前在哪些价格、日期或假设失效条件下退出？

## 小结

四种方向性价差可以压缩成两条主线：Bull Call 与 Bull Put 是有限看涨，Bear Put 与 Bear Call 是有限看跌。Debit Spread 先支付权利金，Credit Spread 先收取权利金；在相同 strike、到期日和简化 carry 条件下，同方向的两种结构可以拥有相同到期盈亏。

Vertical Spread 用另一条期权降低成本或限制尾部风险，同时也主动放弃一段潜在收益。它不是把单腿策略变得“更安全”这么简单，而是把无限或较大的方向空间切成一个事先定义的价格区间。

如果只记住一个原则，可以记住：

> 先决定自己真正要交易哪一段价格，再选择用 debit 还是 credit 为这段风险安排现金流。

本文用于金融知识整理，不构成投资建议。多腿策略涉及成交、保证金、提前指派、到期行权与流动性风险，真实交易前应核对交易所、清算机构和券商规则。

## 参考与延伸阅读

1. Options Industry Council, [Bull Call Spread (Debit Call Spread)](https://www.optionseducation.org/strategies/all-strategies/bull-call-spread-debit-call-spread)。Bull Call 的结构、最大盈亏、盈亏平衡与到期风险。
2. Options Industry Council, [Bull Put Spread (Credit Put Spread)](https://www.optionseducation.org/strategies/all-strategies/bull-put-spread-credit-put-spread)。Bull Put 的 credit、有限下跌风险与指派问题。
3. Options Industry Council, [Bear Put Spread](https://www.optionseducation.org/strategies/all-strategies/bear-put-spread)。Bear Put 的成本补贴、有限收益与 short Put 风险。
4. Options Industry Council, [Bear Call Spread (Credit Call Spread)](https://www.optionseducation.org/strategies/all-strategies/bear-call-spread-credit-call-spread)。Bear Call 的有限上涨风险、credit 与到期处理。
5. Options Industry Council, [Understanding Credit Spreads: Mechanics and Applications](https://www.optionseducation.org/news/june-key-takeaways-the-wheel-strategy-and-credit-spreads)。Credit Spread 的风险边界、strike 选择与完整组合假设。
6. Options Clearing Corporation, [Characteristics and Risks of Standardized Options](https://www.theocc.com/company-information/documents-and-archives/options-disclosure-document)。标准化期权、多腿组合、行权与指派风险披露。
7. Lawrence G. McMillan, [Options as a Strategic Investment, Fifth Edition](https://www.penguinrandomhouse.com/books/310812/options-as-a-strategic-investment-by-lawrence-g-mcmillan/)；Sheldon Natenberg, [Option Volatility and Pricing, 2nd Edition](https://www.mheducation.com/highered/mhp/product/option-volatility-pricing-advanced-trading-strategies-techniques-2nd-edition.html)。方向性价差、波动率与风险管理的经典参考。
