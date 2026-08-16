+++
title = 'Straddle、Strangle、Iron Condor 与 Butterfly'
date = 2026-08-16T15:54:21+09:00
draft = false
categories = ['finance']
tags = ['options', 'derivatives']
description = '用同一组到期盈亏图比较Straddle、Strangle、Iron Condor与Butterfly，理解买入大波动、卖出价格区间和押注到期位置的区别。'
+++

前置阅读：[《Greeks、隐含波动率与期限结构》](/posts/finance/options/option-greeks-implied-volatility-and-term-structure/)说明了 Gamma、Theta 与 Vega；[《四种方向性价差策略》](/posts/finance/options/four-directional-vertical-spreads/)介绍了垂直价差的有限盈亏；[《开仓、平仓、行权、指派与到期结算》](/posts/finance/options/open-close-exercise-assignment-and-settlement/)讨论了多腿组合在到期附近的实际处理。如果已经熟悉这些概念，也可以直接从本文开始。

方向性策略主要回答“会上涨还是下跌”。本文的四种策略换了一组问题：价格会不会大幅离开当前位置，会不会停留在一个区间，又或者会不会在到期时靠近某个目标价？

为了避免名称背后的多种变体混在一起，本文只讨论最常见的四个版本：

- Long Straddle：买入同一行权价的 Call 和 Put；
- Long Strangle：买入较高行权价 Call 和较低行权价 Put；
- Short Iron Condor：卖出内侧 Strangle，并买入外侧保护翼；
- Long Call Butterfly：买一份低行权价 Call、卖两份中间 Call、再买一份高行权价 Call。

Short Straddle、Short Strangle、Reverse Iron Condor 和 Short Butterfly 都是有效结构，但它们是上述盈亏形状的反面。本文会稍作提及，不展开成另一套记忆负担。

## 先把四种策略放进同一张表

全文使用虚构报价，只观察到期盈亏：

- 标的现价为 100 元；
- 所有期权拥有相同到期日；
- 每份期权按 1 单位标的计算；
- 忽略利率、股息、手续费、税费和买卖价差。

| 策略 | 组合 | 净权利金 | 主要判断 | 最大收益区域 |
| --- | --- | ---: | --- | --- |
| Long Straddle | Long 100 Call + Long 100 Put | 支付 9 | 会发生足够大的移动 | 低于 91 或高于 109 后开始盈利 |
| Long Strangle | Long 105 Call + Long 95 Put | 支付 5 | 会发生更大的移动 | 低于 90 或高于 110 后开始盈利 |
| Short Iron Condor | Long 90 Put + Short 95 Put + Short 105 Call + Long 110 Call | 收到 2 | 到期留在一个区间 | 95 到 105 之间获得最大收益 |
| Long Call Butterfly | Long 95 Call - 2 × 100 Call + Long 105 Call | 支付 2 | 到期靠近一个目标价 | 正好在 100 时获得最大收益 |

这些数字是为了让形状容易比较，不代表四种组合在真实期权链中必然出现这样的报价。

## Long Straddle：不知道方向，但要求移动足够大

Long Straddle 同时买入相同行权价、相同到期日的一份 Call 和一份 Put。本文例子是：

> 买入 100 Call
>
> 买入 100 Put
>
> 合计支付 9 元

到期时，两份期权不会同时拥有内在价值：标的高于 100 时由 Call 工作，低于 100 时由 Put 工作。组合的到期盈亏可以写成：

> 到期盈亏 = |到期标的价格 - 100| - 9

因此：

- 最大损失为 9 元，发生在标的到期正好为 100 元时；
- 上方盈亏平衡点为 100 + 9 = 109 元；
- 下方盈亏平衡点为 100 - 9 = 91 元；
- 上涨一侧的潜在收益理论上没有上限；下跌一侧收益很大但有上限，因为标的价格最低只能到 0。

Straddle 交易的不是“我不知道方向，所以两边都买”这么简单。它真正要求的是：最终移动幅度足以覆盖两份期权的权利金，以及真实交易中的价差和费用。

## Long Strangle：成本更低，代价是中间多了一段空白

Long Strangle 把 Call 和 Put 分别移到虚值位置：

> 买入 105 Call
>
> 买入 95 Put
>
> 合计支付 5 元

它的到期结果分为三段：

- 标的位于 95 到 105 元：两份期权都失效，损失全部 5 元；
- 标的高于 105 元：Call 开始产生内在价值，超过 110 元后整体盈利；
- 标的低于 95 元：Put 开始产生内在价值，跌破 90 元后整体盈利。

与 Straddle 相比，Strangle 少支付了 4 元，但上、下盈亏平衡点反而从 109 / 91 推远到 110 / 90。便宜并没有消灭成本，只是把成本换成了对更大价格移动的要求。

![Long Straddle与Long Strangle的到期盈亏比较：Straddle成本更高但较早越过盈亏平衡，Strangle成本较低但拥有更宽的最大亏损区间](https://raw.githubusercontent.com/uytrdcvbjhgf/gallery/main/img/options-long-straddle-strangle-payoff.png)

## 买入大波动，不等于看到 IV 高就买

Long Straddle 和 Long Strangle 通常具有正 Gamma、正 Vega 与负 Theta。直觉上，它们希望行情尽快移动，或者希望 IV 在平仓前上升。

但“未来会很热闹”并不足以决定交易是否盈利。事件前的高 IV 可能已经把预期移动计入两份权利金。即使财报后股价明显跳空，只要跳幅没有超过期权价格隐含的门槛，或者事件落地后 IV 快速回落，Long Straddle 仍可能亏损。

反过来，价格尚未越过到期盈亏平衡点，组合也不一定处于亏损。到期前仍有时间价值；如果标的很快移动或 IV 上升，两份期权的合计市价可能先于到期曲线改善。

因此，需要分开观察三个问题：

1. 预期的实际移动有多大？
2. 当前权利金已经为这个移动收了多少钱？
3. 移动会在什么时候发生，事件后 IV 又可能怎样变化？

到期盈亏平衡点是最终结算边界，不是整个持仓期间唯一有效的价格线。

## Straddle 还是 Strangle

两者都买入双向凸性，选择差异主要来自成本、移动门槛与所处的波动率曲面。

| 比较项 | Long Straddle | Long Strangle |
| --- | --- | --- |
| 初始成本 | 通常较高 | 通常较低 |
| 最大亏损位置 | 集中在共同 strike | 覆盖两个 strike 之间的区间 |
| 到期盈利所需移动 | 通常较小 | 通常较大 |
| 近平值 Gamma / Theta | 通常更集中 | 风险分散在两个 strike 附近 |
| skew 影响 | 主要看近平值 Call / Put | 两侧虚值期权的 IV 与偏斜更重要 |

现实中的 Put skew 还可能让下方 Put 比对称位置的 Call 更贵，导致上下盈亏平衡点并不对称。不能只看两个 strike 离现价各有多远，还要看每条腿实际支付了多少权利金。

## Short Iron Condor：给 Short Strangle 加上保护翼

日常语境中的 Iron Condor 多半指 Short Iron Condor。它可以拆成一组 Bull Put Spread 加一组 Bear Call Spread：

> 买入 90 Put
>
> 卖出 95 Put
>
> 卖出 105 Call
>
> 买入 110 Call
>
> 合计收到 2 元 credit

95 Put 与 105 Call 是内侧 short legs，90 Put 与 110 Call 是外侧保护翼。到期时：

- 标的位于 95 到 105 元：四条腿都没有内在价值，保留全部 2 元 credit；
- 标的低于 95 或高于 105 元：组合开始回吐 credit；
- 标的低于 90 或高于 110 元：一侧垂直价差达到完整宽度，损失不再扩大。

在左右翼宽度都为 5 元的例子中：

> 最大收益 = Net Credit = 2 元

> 最大损失 = Wing Width - Net Credit = 5 - 2 = 3 元

> 下方盈亏平衡点 = Short Put Strike - Credit = 95 - 2 = 93 元

> 上方盈亏平衡点 = Short Call Strike + Credit = 105 + 2 = 107 元

Iron Condor 不是“只要不碰 short strike 就赚钱”。到期前，标的靠近某一侧、IV 上升或流动性变差，都可能让平仓成本显著增加。Credit 也不是已经实现的利润，而是承担区间外风险的预收补偿。

## Long Call Butterfly：不是押一个宽区间，而是押一个到期落点

本文的对称 Long Call Butterfly 使用三个 strike 和 `1 : -2 : 1` 的数量：

> 买入 1 份 95 Call
>
> 卖出 2 份 100 Call
>
> 买入 1 份 105 Call
>
> 合计支付 2 元 debit

95 和 105 是两侧 wings，100 是中间 body。到期时：

- 标的不高于 95 元：所有 Call 都失效，损失 2 元 debit；
- 标的从 95 向 100 元靠近：组合价值逐渐上升；
- 标的正好为 100 元：组合价值为 5 元，扣除 debit 后最大收益为 3 元；
- 标的从 100 向 105 元移动：组合价值逐渐下降；
- 标的不低于 105 元：三组 Call 的 Delta 相互抵消，组合到期价值回到 0，损失 2 元 debit。

所以：

> 最大收益 = Wing Width - Net Debit = 5 - 2 = 3 元

> 最大损失 = Net Debit = 2 元

> 下方盈亏平衡点 = 95 + 2 = 97 元

> 上方盈亏平衡点 = 105 - 2 = 103 元

Long Call Butterfly 与使用相同行权价的 Long Put Butterfly，在忽略 carry 后可以拥有相同到期盈亏，但开仓现金流、成交和提前行权路径可能不同。

![Short Iron Condor与Long Call Butterfly的到期盈亏比较：Iron Condor在95至105形成宽收益平台，Butterfly在100形成尖峰收益](https://raw.githubusercontent.com/uytrdcvbjhgf/gallery/main/img/options-iron-condor-butterfly-payoff.png)

## 宽平台与尖峰，不是同一种“震荡”

Iron Condor 和 Butterfly 都可能从标的没有大幅离开中心区域中获益，但它们表达的判断精度不同。

Short Iron Condor 的最大收益是一个区间：本文例子中，只要到期位于 95 到 105 元，结果都是 +2 元。Long Butterfly 的最大收益只有一个点：越接近 100 元越好，偏离 body 后收益会线性减少。

这也解释了为什么不能把 Butterfly 简单当成“更便宜的 Iron Condor”。Butterfly 更像对到期落点的集中下注；Iron Condor 则出售一段价格走廊外的尾部空间，换取较宽的容忍区间。

## Greeks 会随价格位置改变

四种策略的常见风险倾向可以这样概括：

| 策略 | Gamma | Theta | Vega | 需要警惕的变化 |
| --- | --- | --- | --- | --- |
| Long Straddle / Strangle | 通常为正 | 通常为负 | 通常为正 | 时间流逝与 IV 回落侵蚀两份 Long Option |
| Short Iron Condor | 区间内通常为负 | 区间内通常为正 | 通常为负 | 靠近 short strike 后方向风险加速 |
| Long Butterfly | 随标的相对 body / wings 的位置变化 | body 近平值时常为正 | body 近平值时常偏负 | 离开中心后净 Greeks 可能改变符号 |

“正 Theta 策略”并不表示每天稳定收钱。Short Iron Condor 用负 Gamma 和负 Vega 换取时间价值，一次足够快的跳空就可能覆盖很多天的 Theta。

Butterfly 的 Greeks 更不能只贴一个固定标签。标的位于 body 附近、靠近 wing 或已经越过 wing 时，哪几条腿近平值完全不同，组合的 Delta、Gamma 与 Theta 也会随之重排。

## 多腿越多，成交摩擦越不能忽略

Straddle 和 Strangle 有两条腿，Iron Condor 有四条腿，Call Butterfly 虽然只有三个 strike，却包含四份合约。每一条 Bid / Ask 都会进入组合价格。

例如，理论上可收到 2 元的 Iron Condor，如果实际只能按 1.70 元成交，那么最大收益减少到 1.70 元，最大损失增加到 3.30 元，上下盈亏平衡点也会一起向内移动。

实盘计算至少应使用准备成交的组合限价，而不是把期权链中四个 Mid Price 相加后当成必然成交价。分腿成交还会暂时暴露单腿或不完整价差风险。

## 到期与指派：收益中心往往也是操作最敏感的位置

Long Straddle 和 Long Strangle 没有 short leg，因此不存在提前被指派的问题。但到期进入实值的 Long Call 或 Long Put 仍可能被自动行权，并在账户里留下股票或现金结算结果。

Iron Condor 有两条 short legs，Butterfly 的 body 有两份 Short Call。临近到期且标的靠近这些 strike 时，可能出现：

- 一条 short leg 被指派，另一条腿没有按预期处理；
- 收盘后价格变化影响最终行权指令；
- 原本有限风险的组合在结算后留下意外股票仓位；
- 为处理一侧而拆开组合后，另一侧继续暴露风险。

Butterfly 的理论最大收益恰好位于中间 short strike，这也是到期处理最不确定的位置之一。图上最漂亮的尖峰，不等于操作上最轻松的结算点。

如果不准备接受股票、融资或结算变化，应在市场仍有流动性时决定整体平仓、部分调整还是接受到期结果。

## 选择策略前，先说清楚自己在预测什么

可以把策略选择压缩成三个问题：

1. **预测移动**：认为实际波动会明显超过当前权利金隐含的门槛，更接近 Long Straddle 或 Long Strangle。
2. **预测区间**：认为价格大概率留在一段走廊内，并愿意承担有限的区间外损失，更接近 Short Iron Condor。
3. **预测落点**：认为到期价格会靠近一个具体目标，同时接受离目标不远也可能亏损，更接近 Long Butterfly。

接下来再比较：

- 当前 IV、skew 与期限结构是否已经计入事件风险？
- 需要持有到什么时候，Theta 和 Gamma 是否与时间判断匹配？
- 最大损失乘以合约乘数和数量后是多少？
- 多腿组合能否按合理 Bid / Ask 成交？
- 到期附近准备怎样处理 short legs 和潜在股票仓位？

策略名称描述的是风险形状，不会替代这些交易假设。

## 常见误区

### Long Straddle 两个方向都能赚，所以方向不重要

方向可以不预判，但移动幅度和发生时间仍然重要。价格缓慢移动、移动不足或 IV 下跌，都可能让两边的总权利金无法收回。

### Strangle 更便宜，所以性价比一定更高

更低 debit 对应更远的盈亏平衡点。是否划算取决于实际移动相对市场定价有多大，而不是只看开仓金额。

### Iron Condor 风险有限，所以可以一直等到期

Defined risk 只描述完整组合的理论边界。流动性、提前指派、pin risk、账户融资和拆腿处理仍会影响实际结果。

### Butterfly 的盈亏比很高，所以命中率也高

较小 debit 可以对应较大的尖峰收益，但最大收益要求到期价格非常靠近 body。盈亏比和落在窄区域内的概率是两件事。

## 小结

Long Straddle 与 Long Strangle 买入双向凸性，支付 Theta，希望价格快速移动或 IV 上升。Straddle 成本通常更高、盈利门槛更近；Strangle 成本更低，却需要越过更宽的中间亏损区。

Short Iron Condor 和 Long Butterfly 都是有限收益、有限损失的多腿结构，但前者交易一段到期区间，后者交易一个到期目标。Iron Condor 的收益顶部是平台，Butterfly 的收益顶部是尖峰。

如果只记住一个原则，可以记住：

> 先判断自己交易的是移动幅度、价格区间还是到期落点，再去选择对应的多腿形状。

本文用于金融知识整理，不构成投资建议。期权多腿策略涉及波动率、成交、保证金、提前指派和到期结算风险，真实交易前应核对交易所、清算机构与券商规则。

## 参考与延伸阅读

1. Options Industry Council, [Long Straddle](https://www.optionseducation.org/strategies/all-strategies/long-straddle)。Long Straddle 的结构、双向盈亏平衡、Theta 与 IV 风险。
2. Options Industry Council, [Long Strangle (Long Combination)](https://www.optionseducation.org/strategies/all-strategies/long-strangle-long-combination)。Long Strangle 的双虚值结构、最大损失区间与到期盈亏平衡。
3. Options Industry Council, [Short Condor (Iron Condor)](https://www.optionseducation.org/strategies/all-strategies/short-condor)。Iron Condor 的四条腿、有限风险、指派与到期处理。
4. Options Industry Council, [Long Call Butterfly](https://www.optionseducation.org/strategies/all-strategies/long-call-butterfly)。Long Call Butterfly 的 `1 : -2 : 1` 结构、目标价与到期风险。
5. Options Clearing Corporation, [Characteristics and Risks of Standardized Options](https://www.theocc.com/company-information/documents-and-archives/options-disclosure-document)。标准化期权、组合头寸、行权和指派的风险披露。
6. Lawrence G. McMillan, [Options as a Strategic Investment, Fifth Edition](https://www.penguinrandomhouse.com/books/310812/options-as-a-strategic-investment-by-lawrence-g-mcmillan/)；Sheldon Natenberg, [Option Volatility and Pricing, 2nd Edition](https://www.mheducation.com/highered/mhp/product/option-volatility-pricing-advanced-trading-strategies-techniques-2nd-edition.html)。波动率交易、多腿组合与风险管理的经典参考。
