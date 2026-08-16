+++
title = 'Calendar、Diagonal 与 LEAPS'
date = 2026-08-13T13:04:07+09:00
draft = false
categories = ['finance']
tags = ['options', 'derivatives']
description = '从跨到期日的相对定价出发，理解 Calendar、Diagonal 和 LEAPS 的结构、风险来源、展期与指派问题。'
+++

前置阅读：[《Greeks、隐含波动率与期限结构》](/posts/finance/options/option-greeks-implied-volatility-and-term-structure/)介绍了 Theta、Vega、skew 与期限结构；[《权利金、内在价值与定价模型》](/posts/finance/options/option-premium-intrinsic-value-and-pricing-models/)介绍了时间价值和期权定价因素；[《开仓、平仓、行权、指派与到期结算》](/posts/finance/options/open-close-exercise-assignment-and-settlement/)解释了多腿组合到期后可能留下的仓位。如果已经熟悉这些概念，也可以直接从本文开始。

所谓垂直价差，是在同一个到期日组合不同行权价，主要沿着价格轴切分风险；即使还没有系统学习四种方向性价差，先记住这一定义就够了。Calendar 和 Diagonal 则把另一条轴也引入组合：**到期时间**。

一旦两条腿不在同一天到期，策略就不再只有一张固定的最终盈亏图。近月腿到期时，远月腿仍有剩余时间价值；它值多少钱，取决于当时的标的价格、隐含波动率和剩余期限。

所以，跨期策略交易的不是“时间一定会流逝”这件事，而是不同期限的时间价值、波动率和方向风险如何相对变化。

## 先分清三组概念

### Calendar：到期日不同，行权价相同

**Calendar Spread** 也叫 Time Spread 或 Horizontal Spread。常见的 long calendar 由两条同类型、同行权价、不同到期日的期权组成：

- 卖出近月期权；
- 买入远月期权。

例如：

> 卖出 1 张 30 天后到期的 100 Call
>
> 买入 1 张 90 天后到期的 100 Call

两条腿都是 Call，行权价都是 100，只有到期日不同。使用 Put 也可以构造 Calendar。

如果方向反过来，买入近月、卖出远月，则通常被称为 reverse calendar。它的 Theta、Vega 和风险结构与常见 long calendar 明显不同，本文主要讨论前者。

### Diagonal：到期日与行权价都不同

**Diagonal Spread** 同时改变两个维度：

- 到期日不同；
- 行权价也不同。

例如：

> 买入 1 张 180 天后到期的 95 Call
>
> 卖出 1 张 30 天后到期的 105 Call

这个组合既包含期限差，也包含行权价差，因此通常比 Calendar 带有更明确的方向倾向。

### LEAPS：长期期权，不是一种独立策略

**LEAPS** 是 Long-Term Equity AnticiPation Securities 的缩写，指期限较长的交易所挂牌期权。OIC 当前资料显示，LEAPS 可挂牌到最长约两年八个月以后；一份 LEAPS 随着时间经过也会逐渐变成剩余期限不足一年的普通长期期权。具体可用期限、行权方式和合约规格仍取决于产品与交易所。

LEAPS 仍然是 Call 或 Put，也仍然有 Delta、Gamma、Theta 和 Vega。它可以被单独买入作为长期方向敞口或保护工具，也可以成为 Diagonal 的远月腿。

把一份期权换成长到期日，不会自动产生新策略，更不会消除方向和波动率风险。

下图把到期日放在横轴、行权价放在纵轴。Calendar 的两条腿水平排列，Diagonal 的两条腿斜向排列，而 LEAPS 只是落在更远到期日上的一份长期合约。

![Calendar、Diagonal 与 LEAPS 的结构差异：Calendar 同行权价不同到期日，Diagonal 的行权价和到期日都不同，LEAPS 位于长期期限](https://raw.githubusercontent.com/uytrdcvbjhgf/gallery/main/img/options-calendar-diagonal-leaps-structure.png)

## Long Calendar 在表达什么观点

以 Call Calendar 为例：卖出近月 100 Call，同时买入远月 100 Call。

在开仓初期，它通常具有以下倾向：

- 希望近月期权的时间价值较快衰减；
- 希望远月期权保留更多时间价值；
- 希望近月到期时，标的价格位于行权价附近；
- 通常偏正 Vega，希望远月波动率不要大幅下降；
- 对短期方向的容忍区间有限，不适合把它简单理解为“随便涨跌都行”。

常见 long calendar 往往需要支付净权利金，因为远月期权通常比近月期权更贵。

假设标的现价为 100 刀：

| 头寸                |    权利金 |
| ------------------- | --------: |
| 卖出 30 天 100 Call | 收入 2.40 |
| 买入 90 天 100 Call | 支出 5.80 |
| 初始净支出          |      3.40 |

这 3.40 刀是用近月 Call 的收入抵扣部分远月 Call 成本后的净支出。

在两条腿始终按组合管理、没有提前指派并忽略交易费用的简化分析中，这笔净支出通常也是 long calendar 的主要最大损失：如果标的大幅偏离行权价，两条腿可能同时趋近无价值，或变得深度实值并接近同等内在价值，价差就可能收敛到接近 0。

现实中的损失边界还取决于如何处理近月到期、指派和后续展期。short leg 被指派后若留下股票仓位，或者近月到期后继续单独持有远月腿，持仓已经不再是原来的 Calendar，不能继续沿用同一条最大损失结论。

## 为什么 Calendar 没有一条固定的到期盈亏线

垂直价差的两条腿同时到期，所以到期价值只取决于标的最终价格。Calendar 的两条腿到期日不同，近月腿到期时，远月腿仍然活着。

下图沿用前面的 100 行权价 Call Calendar，并用 Black-Scholes-Merton 模型估算近月到期时远月 Call 的剩余价值。只改变远月 IV，整条盈亏曲线就会移动，因此图中展示的是场景切片，而不是一条已经锁死的最终收益曲线。

![Long Call Calendar 在近月到期时的示意盈亏：远月隐含波动率分别为20%、25%和30%时，盈亏曲线并不相同](https://raw.githubusercontent.com/uytrdcvbjhgf/gallery/main/img/options-calendar-near-expiry-profile.png)

沿用前面的例子，在近月到期日可能出现三种情况。

### 标的接近 100 刀

近月 100 Call 可能接近无价值到期，而远月 100 Call 仍保留约 60 天期限。只要远月腿仍有足够时间价值，这通常是 long calendar 较有利的区域。

但“最大收益发生在 100 刀”只能作为当前模型下的形状描述。远月 IV、买卖价差和剩余时间都会改变实际结果，因此开仓时通常无法像普通垂直价差那样精确锁定最大收益与两个盈亏平衡点。

如果近月 Call 到期后继续持有远月 Call，后续上涨收益在理论上可以继续增加，但那时账户里只剩一份 long Call，其盈亏已经属于新的单腿持仓，而不是开仓时那组 Calendar 的静态到期结果。

### 标的大幅跌到 85 刀

近月 Call 会失效，但远月 Call 也可能变得深度虚值。它还有剩余时间，不一定归零，可是价值可能不足以覆盖初始净支出。

“卖出的近月腿赚了 100%”不代表组合赚钱，因为远月腿可能亏得更多。

### 标的大幅涨到 115 刀

近月 Call 变成深度实值，远月 Call 也会上涨。两条腿的 Delta 可能都接近 1，价格差逐渐接近两者剩余时间价值之差，Calendar 的相对价值反而可能收窄。

同时，近月 short Call 面临被指派的可能。若处理不当，组合会变成 short stock 加 long far-dated Call，风险、保证金和现金需求都会改变。

因此，Calendar 不是单纯押注“不涨不跌”，而是在押注标的路径与期限结构共同落入适合组合的位置。

## Calendar 的 Greeks 是相对值

Calendar 的 Greeks 等于两条腿相加后的净值。

一个典型的平值 long calendar 在开仓初期可能表现为：

- **Delta 接近中性**：两条 Call 的 Delta 部分抵消；
- **Theta 为正**：近月 short option 的衰减可能快于远月 long option；
- **Vega 为正**：远月 long option 的 Vega 通常大于近月 short option；
- **Gamma 为负或接近中性**：临近近月到期时，short leg 的 Gamma 可能迅速升高。

这些只是常见形态，不是固定属性。标的离开行权价、近月到期临近、两段 IV 分别变化后，符号和大小都可能改变。

特别要警惕“正 Theta + 正 Vega = 两头都赚”的误解。Theta 假设其他输入不变，Vega 又常把整条曲面的变化压缩成单一数字；真实 Calendar 同时暴露于近月 IV 和远月 IV 两个点，它们完全可能朝不同方向移动。

## 期限结构才是 Calendar 的底层价格背景

如果近月 IV 为 35%，远月 IV 为 25%，不能只看两个年化数字就断言“卖近月、买远月一定划算”。还要问：

- 近月是否包含财报、议息会议或诉讼结果等事件？
- 远月是否同样包含该事件，只是被更长时间稀释？
- 事件过去后，两条腿的 IV 预计分别变化多少？
- 近月的高 IV 是否足以补偿跳空与负 Gamma 风险？
- 两个期限的 Bid / Ask 是否会吞掉理论优势？

Calendar 实际表达的是期限曲线上两个点的 **相对价值判断**。如果只知道“近月衰减快”，却不知道为什么近月更贵，交易逻辑就少了一半。

## Put Calendar 与 Call Calendar 有什么不同

Put Calendar 的结构与 Call Calendar 相同，只是两条腿都换成 Put：卖出近月 Put，买入远月 Put，行权价相同。

在忽略股息、利率、提前行权和市场摩擦的简化情况下，同一行权价的 Call Calendar 与 Put Calendar 可能呈现相近的到期形状。但现实中两者会受到以下因素影响：

- Call 与 Put 的 skew 不同；
- 深度实值美式期权可能出现提前行权；
- 股息和融资成本影响 Call、Put 的相对价格；
- 市场对下跌保护的需求可能让 Put 一侧流动性和 IV 结构不同。

选择 Call 还是 Put，不应只根据“看涨用 Call、看跌用 Put”的单腿直觉，而要比较对应位置的期限结构、价差和行权风险。

## Diagonal 在 Calendar 上增加方向

Diagonal 把远近月份与不同行权价组合在一起，因此可以同时调整：

- 净 Delta，也就是方向暴露；
- 净 Theta，也就是时间价值衰减；
- 净 Vega，也就是期限曲面变化的敏感度；
- short leg 与标的现价之间的距离。

例如：

> 买入 180 天 95 Call
>
> 卖出 30 天 105 Call

远月 Call 的行权价更低，Delta 通常更高；近月 Call 的行权价更高，初始收到一笔权利金。这个 call diagonal 通常带有正 Delta，希望标的温和上涨，但又不希望在近月期限内过早、过快突破 short strike。

如果标的缓慢上涨到 105 刀附近，近月 Call 的时间价值逐渐减少，远月 95 Call 仍保留方向价值和剩余期限，组合可能处在较有利的位置。

如果标的迅速涨过 105 刀，short Call 的负 Gamma 和指派风险会上升；如果标的大幅下跌，远月 Call 的损失也可能超过近月收入。

## 用 LEAPS 构造 Diagonal

一种常见做法是：

- 买入较长期、较深度实值的 LEAPS Call；
- 持续卖出较短期、较高行权价的 Call。

这类组合常被称为 **Poor Man's Covered Call**。名字容易让人误以为它只是“更便宜的 Covered Call”，但 long LEAPS Call 并不等于股票：

- 它有到期日，股票没有；
- 它不支付股息，也没有股东投票权；
- 它的 Delta 小于或接近 1，并会继续变化；
- 它包含时间价值和 Vega 风险；
- short Call 被提前指派后，账户可能形成 short stock；
- 为了交付股票而提前行使 long Call，可能放弃其剩余时间价值。

因此，Diagonal 的远月腿应当按期权管理，而不是在风险系统里假装成 100 股现货。

## LEAPS 的风险形态

与较短期限的同类期权相比，LEAPS 通常具有以下特点：

- **权利金更高**：更多剩余时间意味着更多时间价值；
- **Vega 更高**：长期波动率假设变化会显著影响价格；
- **每天的 Theta 绝对值通常较低**：早期时间衰减相对缓慢，但不会消失；
- **Gamma 通常较低**：Delta 对小幅标的变化往往没有短期期权那么剧烈；
- **利率与股息更重要**：预测区间更长，carry 假设的影响会累积；
- **流动性可能较弱**：部分远月、远行权价合约的买卖价差较宽。

下图固定标的价格与 IV，用一份初始期限为 730 天的平值 Call 展示时间价值的理论变化。长期阶段的曲线较平，进入最后几个月后逐渐变陡；它说明的是 Theta 的非线性，不代表真实持仓会沿着这条线移动。

![LEAPS 时间价值衰减示意：长期阶段变化较缓，临近到期时曲线明显变陡](https://raw.githubusercontent.com/uytrdcvbjhgf/gallery/main/img/options-leaps-time-decay.png)

“衰减较慢”不等于“持有成本很低”。LEAPS 买方通常在开仓时支付更多绝对权利金，也承担更长时间的波动率和方向风险。即使最终看对方向，如果上涨幅度不足以覆盖权利金，也可能亏损。

## LEAPS 常见的三种用途

### 长期方向敞口

买入 LEAPS Call 可以用少于直接购买股票的初始资金取得长期正 Delta；买入 LEAPS Put 可以表达长期看跌观点。

代价是期权有期限、可能归零，而且方向发生的时间同样重要。

### 长期保护

持有股票并买入 LEAPS Put，可以为较长时期设置下行保护。保护期限越长，通常支付的绝对权利金越高，也要考虑 Put skew 是否让保险价格偏贵。

这类组合会在后续 Protective Put 与 Collar 中详细讨论。

### Diagonal 的远月基础腿

使用高 Delta 的 LEAPS Call 配合近月 short Call，可以降低相对于直接持股的初始资金需求，并通过反复卖出近月期权尝试回收部分成本。

但每次卖出新一期 short Call，都是一笔新的价格、波动率与上方空间决策，并不存在“滚动几次就必然收回 LEAPS 成本”的保证。

## 展期不是延期按钮

近月 short option 接近到期时，常见处理包括：

- 买回平仓；
- 让其到期，但持续监控是否实值以及自动行权风险；
- 买回当前合约，同时卖出更远到期日的合约，也就是 roll；
- 平掉整个 Calendar 或 Diagonal。

所谓展期，本质上是关闭旧仓并建立新仓。它会实现旧仓盈亏，同时把新的权利金、行权价、到期日和 Greeks 带入组合。

因此，展期前应重新判断：

1. 原来的方向与波动率假设是否仍然成立？
2. 新期限的 IV 是否值得卖出？
3. 新 short strike 是否留下足够的方向空间？
4. 交易成本和买卖价差是否过高？
5. 继续持有远月腿是否仍优于直接平仓？

不能因为一次 roll 能收到净收入，就把已经发生的亏损视为消失。它只是把持仓换成了新的风险结构。

## 提前指派与到期处理

跨期组合尤其需要关注 short leg，因为它先到期，也可能在到期前被指派。

对于美式股票期权，以下情况值得额外检查：

- short option 已经深度实值；
- 剩余时间价值很少；
- Call 临近除息日；
- Put 的融资收益使提前行权更有吸引力；
- 到期时标的价格非常接近 short strike。

被指派并不等于策略自动失败，但持仓会发生变化。short Call 指派可能形成 short stock，short Put 指派可能买入股票。账户需要有足够资金与权限处理新仓位。

不要未经比较就通过行使远月 long option 来应对指派，因为提前行权可能舍弃剩余时间价值。很多情况下，分别交易股票与远月期权更能保留价值，但实际处理仍取决于流动性、税务、保证金和券商规则。

## 跨期策略检查清单

建立 Calendar、Diagonal 或 LEAPS 组合前，可以依次检查：

1. 两条腿的到期日是否跨越同一个已知事件？
2. 近月与远月 IV 的差异来自什么？
3. 当前净 Delta、Gamma、Theta 和 Vega 分别是多少？
4. 标的大幅上涨或下跌时，两条腿的 Delta 会如何靠拢？
5. 近月到期时，希望标的落在哪个区域？
6. short leg 被提前指派后，账户会形成什么仓位？
7. 远月腿的 Bid / Ask 是否足以支持退出？
8. 何时平仓、展期或停止继续卖出近月期权？

这套检查的重点，是把策略从“卖短买长”还原成一组会随时间变化的风险敞口。

## 小结

Calendar 使用相同行权价和不同到期日，主要交易期限之间的相对时间价值与波动率；Diagonal 再加入行权价差，因此通常带有更明确的方向暴露；LEAPS 则只是长期期权，可以作为方向、保护或 Diagonal 的远月腿。

跨期策略的难点在于两条腿不会同时到期。近月腿到期时，远月腿仍有时间价值，因此实际盈亏取决于标的路径、期限结构、skew、指派和退出价格，不能只看一张静态到期图。

如果只记住一个原则，可以记住：

> Calendar 与 Diagonal 交易的是两个期限的相对变化；时间流逝是确定的，但时间价值如何变化并不确定。

本文用于金融知识整理，不构成投资建议。跨期组合涉及多腿成交、提前指派、流动性和保证金风险，真实交易前应核对交易所、清算机构和券商规则。

## 参考与延伸阅读

1. Options Industry Council, [Long Call Calendar Spread](https://www.optionseducation.org/strategies/all-strategies/long-call-calendar-spread-call-horizontal)。Calendar 的结构、常见市场观点以及时间和波动率影响。
2. Options Industry Council, [Calendar Spreads](https://www.optionseducation.org/videolibrary/calendar-spreads-1)。从 Theta 与 Vega 理解跨期价差。
3. Options Industry Council, [How LEAPS Work](https://www.optionseducation.org/optionsoverview/how-leaps-work) 与 [LEAPS Pricing](https://www.optionseducation.org/optionsoverview/leaps-pricing)。LEAPS 的期限、交易机制和长期定价因素。
4. Options Clearing Corporation, [Characteristics and Risks of Standardized Options](https://www.theocc.com/company-information/documents-and-archives/options-disclosure-document)。标准化期权、多腿组合、行权、指派与流动性风险披露。
5. Lawrence G. McMillan, [Options as a Strategic Investment, Fifth Edition](https://www.penguinrandomhouse.com/books/310812/options-as-a-strategic-investment-by-lawrence-g-mcmillan/)；Sheldon Natenberg, [Option Volatility and Pricing, 2nd Edition](https://www.mheducation.com/highered/mhp/product/option-volatility-pricing-advanced-trading-strategies-techniques-2nd-edition.html)。策略结构、波动率与风险管理的经典参考。
