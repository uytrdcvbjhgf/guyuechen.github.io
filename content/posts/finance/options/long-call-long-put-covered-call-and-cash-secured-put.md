+++
title = 'Long Call、Long Put、Covered Call、Cash-Secured Put'
date = 2026-08-14T07:43:34+09:00
draft = false
categories = ['finance']
tags = ['options', 'derivatives']
description = '从方向、时间、波动率和持股意图出发，比较 Long Call、Long Put、Covered Call 与 Cash-Secured Put 的收益边界、风险和管理方式。'
+++

前置阅读：[《期权：从“买一项权利”开始理解》](/posts/finance/options/options-intro/)介绍了 Call、Put 与四种基础头寸；[《权利金、内在价值与定价模型》](/posts/finance/options/option-premium-intrinsic-value-and-pricing-models/)介绍了时间价值和定价因素；[《Greeks、隐含波动率与期限结构》](/posts/finance/options/option-greeks-implied-volatility-and-term-structure/)介绍了 Delta、Gamma、Theta 与 Vega；[《开仓、平仓、行权、指派与到期结算》](/posts/finance/options/open-close-exercise-assignment-and-settlement/)说明了期权到期后可能形成的股票仓位。如果已经熟悉这些概念，也可以直接从本文开始。

Long Call、Long Put、Covered Call 和 Cash-Secured Put 经常被放在同一张“常见期权策略”表里，但它们并不处在完全相同的层次。

- Long Call 和 Long Put 是买入单腿期权，用有限权利金表达方向观点；
- Covered Call 从持有股票出发，卖出一部分上涨空间换取权利金；
- Cash-Secured Put 从持有现金出发，收取权利金并承担按约定价格买入股票的义务。

所以，选择策略不能只问“看涨还是看跌”。还要问：预期行情什么时候发生、幅度多大，是否愿意持有股票，以及能否接受行权和指派带来的仓位变化。

## 先用同一组数字看四种形状

为了让四种策略可以直接比较，全文使用一组简化参数：

- 标的当前价格为 100 刀；
- 行权价为 100 刀；
- Call 和 Put 的权利金都假设为 5 刀；
- 每份期权暂按 1 单位标的计算；
- 忽略利率、股息、手续费、税费和买卖价差。

真实市场中的 Call 和 Put 权利金通常不会刚好相同，这里只是为了把四条到期盈亏线放在同一个坐标系里。

![Long Call、Long Put、Covered Call 与 Cash-Secured Put 的到期盈亏比较：标的初始价格和行权价均为100刀，权利金为5刀](https://raw.githubusercontent.com/uytrdcvbjhgf/gallery/main/img/options-four-foundational-strategies-payoff.png)

图中最值得先注意的不是哪条线更陡，而是风险交换的方向：

- Long Call 和 Long Put 先支付权利金，换取正 Gamma 与有限损失；
- Covered Call 和 Cash-Secured Put 先收取权利金，换来的不是免费收益，而是负 Gamma 和接近持股的下跌风险。

## Long Call：买上涨方向，也买发生的时间

**Long Call** 是买入一份看涨期权。它适合这样的观点：标的会在期权到期前上涨，而且上涨幅度足以覆盖已经支付的权利金。

沿用例子：

> 买入 1 份 100 Call，支付权利金 5 刀

到期盈亏可以分成三段：

- 标的价格不高于 100 刀：Call 没有内在价值，最大损失为 5 刀；
- 标的价格位于 100 到 105 刀：Call 有内在价值，但还不足以收回权利金；
- 标的价格高于 105 刀：策略开始盈利，之后保留继续上涨的收益。

因此：

> 到期盈亏平衡点 = 行权价 + 权利金 = 105 刀

> 最大损失 = 已付权利金 = 5 刀

> 最大收益 = 理论上没有上限

“最大损失有限”很重要，但不能直接推导出“风险很低”。如果连续买入虚值 Call，每次只损失一小笔权利金，却频繁到期归零，累计损失同样可能很大。有限损失描述的是单笔头寸的边界，不评价这笔交易是否划算。

### 方向看对，期权仍可能亏钱

Long Call 同时需要回答三个问题：

1. **方向**：标的是否上涨？
2. **幅度**：涨幅能否覆盖权利金？
3. **时间**：上涨是否发生在到期前？

到期盈亏图只展示最终价格，却没有展示路径。到期前，Call 价格还受到 IV 与剩余期限影响。即使标的上涨，Theta 流失或 IV 下降也可能抵消部分 Delta 收益；如果上涨来得太晚，策略也可能没有足够时间越过盈亏平衡点。

### 行权价和到期日不是越便宜越好

在其他条件相近时：

- 实值 Call 权利金较高、Delta 通常较大，更接近股票的方向表现；
- 平值 Call 往往同时具有较明显的 Gamma、Theta 和 Vega；
- 深度虚值 Call 金额较低，但需要更大行情才能产生内在价值，归零风险也更高；
- 较长期限给观点更多实现时间，却通常需要支付更多权利金并承担更高 Vega；
- 较短期限权利金较低，但时间窗口更窄，临近到期时 Gamma 与 Theta 都可能更剧烈。

便宜的合约只是每份价格更低，不代表胜率更高，也不代表单位风险回报更好。

## Long Put：有限成本的下跌方向

**Long Put** 是买入一份看跌期权。作为独立头寸时，它表达的是标的会在到期前明显下跌；如果同时持有股票，Long Put 则成为 Protective Put 的保护腿，那是另一种组合结构。

沿用例子：

> 买入 1 份 100 Put，支付权利金 5 刀

到期时：

- 标的价格不低于 100 刀：Put 没有内在价值，最大损失为 5 刀；
- 标的价格位于 95 到 100 刀：Put 有内在价值，但整体仍亏损；
- 标的价格低于 95 刀：策略开始盈利，价格越低，Put 的到期价值越高。

因此：

> 到期盈亏平衡点 = 行权价 - 权利金 = 95 刀

> 最大损失 = 已付权利金 = 5 刀

> 理论最大收益 = 行权价 - 权利金 = 95 刀

普通股票价格最低为 0，因此 Long Put 的最大收益很大，但并不是无限的。

### Long Put 不等于做空股票

Long Put 和 short stock 都可以从下跌中获利，但风险形态不同：

| 比较项     | Long Put       | Short Stock                  |
| ---------- | -------------- | ---------------------------- |
| 最大损失   | 已付权利金     | 股价上涨时理论上没有上限     |
| 时间限制   | 有到期日       | 通常没有固定到期日           |
| 时间价值   | 通常为负 Theta | 没有期权时间价值             |
| 波动率     | 通常为正 Vega  | 不直接暴露于 IV              |
| 资金与操作 | 支付权利金     | 涉及借券、保证金与召回等问题 |

Long Put 用权利金把最坏结果提前锁定，但也给方向观点加上了截止日期。标的只是缓慢下跌，或者跌幅不足以覆盖权利金，都可能让判断方向正确却没有获得利润。

### 到期前不要忽略行权处理

独立持有 Long Put 到期时，如果期权实值并按 exercise by exception 或券商规则进入行权处理，账户可能形成 short stock。这个过程常被口语化地称为“自动行权”，但实际阈值、相反指令截止时间以及账户能否持有空头股票，取决于产品和券商规则。

如果目标只是交易 Put 的价格变化，通常应在到期前明确选择平仓、行权还是继续持有，而不是把到期处理交给默认设置。完整流程可以参见[《开仓、平仓、行权、指派与到期结算》](/posts/finance/options/open-close-exercise-assignment-and-settlement/)。

## Covered Call：收取权利金，同时给股票设置上限

**Covered Call** 由两条腿组成：

> 持有 1 单位股票
>
> 卖出 1 份对应的 Call

标准股票期权通常要按合约乘数匹配股票数量。例如一张合约对应 100 股时，需要 100 股股票覆盖一张 short Call。具体乘数仍应以合约规格为准。

沿用例子，假设股票买入成本为 100 刀，再卖出 100 Call 收取 5 刀：

- 到期价格低于 100 刀：Call 失效，但股票产生亏损，5 刀权利金只提供有限缓冲；
- 到期价格等于或高于 100 刀：整体最大收益被锁定在 5 刀；
- 如果 Call 被指派，股票将按 100 刀卖出。

因此：

> 到期盈亏平衡点 = 股票成本 - Call 权利金 = 95 刀

> 最大收益 = 行权价 - 股票成本 + 权利金 = 5 刀

> 最大损失 = 股票成本 - 权利金 = 95 刀

这里最大的误解是把 Covered Call 当成“有股票担保，所以没有风险”。股票只是覆盖了 short Call 的交付义务，使上涨时不会形成裸卖 Call 的无限损失；股票本身仍然可以跌到接近 0。

### 权利金只是缓冲，不是保险

在这个例子中，股票从 100 刀跌到 70 刀：

> 股票亏损 = -30 刀
>
> Call 权利金 = +5 刀
>
> 组合亏损 = -25 刀

收到的 5 刀确实让结果比单独持股好一些，却没有阻止主要亏损。Covered Call 更像是用部分上行空间换取一层有限缓冲，而不是为股票设置止损线。

### 真正卖掉的是上涨机会

假设股票到期涨到 130 刀。单独持股可以获得 30 刀收益，Covered Call 却仍然只有 5 刀最大收益。少赚的 25 刀不是账户上的亏损，却是真实的机会成本。

因此，卖出 Call 前最关键的问题不是“权利金有多少”，而是：

> 如果股票真的涨过行权价，我是否愿意按这个价格卖出？

如果答案是否定的，那么这份 Call 从一开始就没有与持股目标对齐。后续为了避免指派而高价买回或不断向上展期，可能实现 short Call 的亏损，并把风险带到新的到期日。

### 已持有股票与 Buy/Write 要分开看

已经持有很久的股票可能有不同的账面成本，但是否在今天卖出 Call，仍应基于当前股票价值、可接受卖价和未来风险来判断。

如果股票与 short Call 同时建立，这种做法常被称为 **Buy/Write**。它和传统 Covered Call 的到期结构相同，区别只是股票原本就在账户里，还是与 Call 一起买入。

## Cash-Secured Put：收取权利金，并为接货准备现金

**Cash-Secured Put** 由下面两部分组成：

> 卖出 1 份 Put
>
> 预留足够现金，以便被指派时按行权价买入标的

沿用例子，卖出 100 Put 收取 5 刀，同时为可能的买入义务预留 100 刀：

- 到期价格不低于 100 刀：Put 失效，最大收益为 5 刀；
- 到期价格低于 100 刀：Put 可能被指派，需要按 100 刀买入；
- 扣除权利金后，实际盈亏平衡价格为 95 刀。

因此：

> 到期盈亏平衡点 = 行权价 - 权利金 = 95 刀

> 最大收益 = 已收权利金 = 5 刀

> 最大损失 = 行权价 - 权利金 = 95 刀

预留现金解决的是履约资金问题，并没有消除标的下跌风险。股票跌到 60 刀时，按 100 刀接货、扣除 5 刀权利金后的有效成本仍是 95 刀，账户立即面对 35 刀浮亏。

### “以更低价格买入”需要加上条件

Cash-Secured Put 经常被描述为“一边收租，一边等低价买股票”。这个说法只有在几个条件同时成立时才完整：

- 你确实愿意长期持有这个标的；
- 行权价减去权利金后，仍是可以接受的买入成本；
- 即使价格远低于行权价，也有意愿和能力承担持仓；
- 如果股票一路上涨、Put 没有被指派，也能接受错过上涨。

权利金带来的“折扣”只相对于行权价成立，不保证比未来市场价格便宜。市场跌到 60 刀时，95 刀的有效成本并不会因为开仓时看起来合理而变成好价格。

### 现金担保与裸卖 Put 的区别

两者在期权腿上都是 short Put，区别在于资金安排和交易意图：

- Cash-Secured Put 已为指派准备现金，通常把接收股票视为可接受结果；
- Naked Put 没有预留全部现金，更依赖保证金与后续资金调度，杠杆和强制处置风险可能更高。

现金担保让仓位更容易履约，却不让 short Put 本身变成有限小风险策略。

## Covered Call 与 Cash-Secured Put 为什么如此相像

使用相同标的、行权价和到期日，并适当考虑利率与股息后，Covered Call 和 Cash-Secured Put 属于可比较的合成头寸。Put-Call Parity 可以把两者联系起来。

在本文忽略利率和股息、Call 与 Put 权利金同为 5 刀的简化例子中，两者到期盈亏完全相同：

![Covered Call 与 Cash-Secured Put 的等价关系：前者由股票加空头Call构成，后者由现金加空头Put构成，在相同简化参数下到期盈亏一致](https://raw.githubusercontent.com/uytrdcvbjhgf/gallery/main/img/options-covered-call-cash-secured-put-equivalence.png)

| 到期价格 | Covered Call 盈亏 | Cash-Secured Put 盈亏 |
| -------: | ----------------: | --------------------: |
|    80 刀 |            -15 刀 |                -15 刀 |
|   100 刀 |             +5 刀 |                 +5 刀 |
|   120 刀 |             +5 刀 |                 +5 刀 |

两者都表现为：上涨收益有限，下跌风险接近持股，通常是正 Delta、负 Gamma、正 Theta、负 Vega。

但“到期盈亏等价”不代表实际操作完全相同：

- Covered Call 从已经持有股票开始，期间可能获得股息，也可能提前失去股票；
- Cash-Secured Put 从现金开始，资金可以产生利息，但在指派前没有股票和股息；
- 美式期权的提前行权、除息日、融资成本、税务和交易摩擦会造成差异；
- 两种策略对投资者的持仓路径和心理感受也不同。

理解等价关系的意义，是避免被策略名称误导。Covered Call 看起来像“持股增收”，Cash-Secured Put 看起来像“等待抄底”，但它们承担的核心下跌风险非常接近。

## 把四种策略放进 Greeks

开仓时常见的风险倾向可以概括为：

| 策略             | Delta              | Gamma | Theta    | Vega | 主要交换                         |
| ---------------- | ------------------ | ----- | -------- | ---- | -------------------------------- |
| Long Call        | 正                 | 正    | 通常为负 | 正   | 支付时间价值，保留上涨凸性       |
| Long Put         | 负                 | 正    | 通常为负 | 正   | 支付时间价值，保留下跌凸性       |
| Covered Call     | 正，但低于单独持股 | 负    | 通常为正 | 负   | 收取权利金，放弃部分上涨空间     |
| Cash-Secured Put | 正                 | 负    | 通常为正 | 负   | 收取权利金，承担接货后的下跌风险 |

这些符号只是当前市场状态下的常见形态。标的价格接近行权价、到期日临近或 IV 改变后，数值会持续移动。

一个实用的记忆方式是：

- 买入期权通常拥有正 Gamma，但要支付 Theta；
- 卖出期权通常收取 Theta，但承担负 Gamma；
- Covered Call 和 Cash-Secured Put 的正 Delta 不等于无限看涨，因为上方收益已经被 short option 限制。

## 如何在四种策略之间选择

可以先从持仓意图而不是策略名称出发。

| 当前状态与观点                 | 更接近的策略     | 需要接受的代价                           |
| ------------------------------ | ---------------- | ---------------------------------------- |
| 没有股票，预期到期前明显上涨   | Long Call        | 权利金可能全部损失，且方向有时间限制     |
| 没有股票，预期到期前明显下跌   | Long Put         | 权利金可能全部损失，股票下跌幅度有限     |
| 已持有股票，愿意在目标价卖出   | Covered Call     | 上涨超过行权价后不再继续受益             |
| 持有现金，愿意在目标价买入股票 | Cash-Secured Put | 大跌时仍须按行权价接货，可能错过一路上涨 |

如果观点只是“温和看涨”，也不能机械地在 Covered Call 和 Cash-Secured Put 中二选一。还要比较当前是否已经持股、行权价是否可接受、Call/Put skew、股息、利率、税务和流动性。

## 开仓前的共同检查清单

无论选择哪一种策略，都可以先回答：

1. 观点是方向、波动率，还是持股与现金管理？
2. 预期行情需要在什么时间内发生？
3. 行权价对应的盈亏平衡点是多少？
4. 这笔交易的最大损失，换算合约乘数后是多少？
5. IV 上升或下降会怎样影响持仓？
6. 是否愿意接受自动行权或提前指派后的股票仓位？
7. 到期前在哪些价格、日期或假设失效条件下退出？
8. Bid / Ask、手续费和税费是否会明显改变理论结果？

对于 Covered Call 和 Cash-Secured Put，还应额外问一句：如果今天只能以行权价完成股票交易，我是否真的愿意？

## 展期不会抹掉已经发生的盈亏

当 short Call 或 short Put 变得不利时，常见做法是买回旧合约，再卖出更远到期日或不同行权价的新合约，也就是 roll。

展期本质上包含两笔交易：旧仓平仓并实现盈亏，新仓按当前市场价格重新建立。即使新仓能收到净权利金，也不能说明旧仓亏损已经消失。

每次展期都应重新检查：

- 新行权价仍然是可接受的股票卖价或买价吗？
- 延长持仓时间是否仍符合原来的资金计划？
- 为了避免一次指派，是否正在累积更大的方向风险？
- 新合约的 IV 和买卖价差是否值得交易？

如果答案已经改变，平掉仓位可能比为了维持策略名称而继续展期更诚实。

## 小结

Long Call 与 Long Put 用确定的权利金换取方向凸性：最大损失有限，但方向必须在有限期限内以足够幅度实现。Covered Call 与 Cash-Secured Put 则收取权利金，通常获得正 Theta，却承担负 Gamma 和接近持股的下跌风险。

Covered Call 不是给股票买保险，而是给上涨空间设置售价；Cash-Secured Put 也不是保证低价买入，而是承诺在价格可能已经大跌时仍按行权价接货。

如果只记住一个原则，可以记住：

> 先说明自己愿意持有什么、愿意放弃什么，再选择策略；不要先被“权利金收入”或“有限损失”吸引，再倒推交易理由。

本文用于金融知识整理，不构成投资建议。期权涉及权利金全部损失、提前行权、指派、流动性和大额标的敞口，真实交易前应核对交易所、清算机构和券商规则。

## 参考与延伸阅读

1. Options Industry Council, [Long Call](https://www.optionseducation.org/strategies/all-strategies/long-call) 与 [Long Put](https://www.optionseducation.org/strategies/all-strategies/long-put)。单腿买入期权的收益边界、时间、波动率和到期处理。
2. Options Industry Council, [Covered Call (Buy/Write)](https://www.optionseducation.org/strategies/all-strategies/covered-call-buy-write)。Covered Call 的持股结构、上行限制、下跌风险和指派问题。
3. Options Industry Council, [Cash-Secured Put](https://www.optionseducation.org/strategies/all-strategies/cash-secured-put)。现金担保、有效买入成本、接货意图与下跌风险。
4. Options Clearing Corporation, [Characteristics and Risks of Standardized Options](https://www.theocc.com/company-information/documents-and-archives/options-disclosure-document)。标准化期权、行权、指派与风险披露。
5. Lawrence G. McMillan, [Options as a Strategic Investment, Fifth Edition](https://www.penguinrandomhouse.com/books/310812/options-as-a-strategic-investment-by-lawrence-g-mcmillan/)。股票与期权组合、备兑策略及仓位管理的经典参考。
6. Sheldon Natenberg, [Option Volatility and Pricing, 2nd Edition](https://www.mheducation.com/highered/mhp/product/option-volatility-pricing-advanced-trading-strategies-techniques-2nd-edition.html)。从波动率与 Greeks 理解策略风险，而不只观察到期盈亏图。
