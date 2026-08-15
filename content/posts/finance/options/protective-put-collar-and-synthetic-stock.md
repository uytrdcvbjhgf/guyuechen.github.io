+++
title = 'Protective Put、Collar 与合成股票'
date = 2026-08-15T08:55:14+09:00
draft = false
categories = ['finance']
tags = ['options', 'derivatives']
description = '从股票持仓的下限、上限与合成关系出发，理解 Protective Put、Collar 和 Synthetic Stock 如何重新切割方向风险。'
+++

前置阅读：[《Long Call、Long Put、Covered Call、Cash-Secured Put》](/posts/finance/options/long-call-long-put-covered-call-and-cash-secured-put/)介绍了单腿买方策略与股票配合 short option 的风险；[《权利金、内在价值与定价模型》](/posts/finance/options/option-premium-intrinsic-value-and-pricing-models/)介绍了 Put-Call Parity；[《Greeks、隐含波动率与期限结构》](/posts/finance/options/option-greeks-implied-volatility-and-term-structure/)介绍了 Delta、Gamma、Theta 与 Vega。如果已经熟悉这些概念，也可以直接从本文开始。

持有股票意味着接受一条近似直线的盈亏：上涨 1 元，大约多赚 1 元；下跌 1 元，也大约多亏 1 元。

期权可以把这条直线重新切割：

- Protective Put 保留股票上涨空间，同时为下跌设置期限内的价格下限；
- Collar 在下限之外再设置上限，用放弃部分上涨空间来补贴保护成本；
- Synthetic Stock 不直接持有股票，而是用 Call 和 Put 重新拼出近似相同的线性敞口。

三者表面上分别属于保险、对冲和合成策略，底层却是同一件事：把权利与义务组合起来，决定自己愿意保留哪一段收益，又愿意承担哪一段风险。

## 先确定本文的共同参数

为了让数字可以直接比较，先设定一组简化参数：

- 股票当前价格与买入成本均为 100 元；
- 95 Put 的权利金为 3 元；
- 110 Call 的权利金为 2 元；
- 100 Call 与 100 Put 的权利金都假设为 5 元；
- 每份期权暂按 1 单位标的计算；
- 忽略利率、股息、手续费、税费和买卖价差。

真实市场中的 Call 与 Put 权利金会受到利率、股息、skew 和供需影响，不会总是刚好符合这些数字。本文使用它们，是为了把结构而不是报价放在最前面。

## Protective Put：给股票买一段有期限的下限

**Protective Put** 由股票与 Put 组成：

> 持有 1 单位股票，成本 100 元
>
> 买入 1 份 95 Put，支付权利金 3 元

股票上涨时，Put 可以失效，持仓仍保留上涨收益；股票跌破 95 元时，Put 提供按 95 元卖出的权利，使组合的到期价值不再继续随股票下跌。

在本文例子中：

> 到期盈亏平衡点 = 股票成本 + Put 权利金 = 103 元

> 最大损失 = 股票成本 - Put 行权价 + Put 权利金 = 8 元

> 最大收益 = 理论上没有上限，但始终比同期单独持股少 3 元保险成本

如果到期价格为 70 元，股票亏损 30 元，95 Put 的内在价值为 25 元，再扣除 3 元权利金，组合最终亏损 8 元。价格继续跌到 40 元，最大损失仍然是 8 元。

这就是保护下限的含义：不是股票不再下跌，而是 Put 的收益开始抵消股票进一步产生的亏损。

![Protective Put 与 Collar 的到期盈亏：Protective Put 保留上涨并在95元以下形成损失下限，Collar 再通过110 Call 封顶上涨收益](https://raw.githubusercontent.com/uytrdcvbjhgf/gallery/main/img/options-protective-put-and-collar-payoff.png)

### Protective Put 与 Long Put 的目标不同

单独买入 Long Put，通常希望 Put 本身因股票下跌而盈利；Protective Put 则应从整个股票持仓出发理解。

如果股票一路上涨，Put 到期归零并不表示保护策略“做错了”。就像保险没有理赔不代表保险毫无意义，Put 的作用是把事先不能接受的尾部损失换成一笔确定成本。

反过来，如果 Put 获得很大收益，通常意味着股票本身正在遭受损失。只展示 Put 的盈利而不合并股票，就会高估对冲效果。

### 下限只在保护期限内有效

Put 有到期日。今天买入一份三个月 Put，只保证这三个月内拥有按行权价卖出的权利，不保证三个月以后仍有保护。

到期时常见结果包括：

- 股票高于 95 元：Put 可能失效，继续持股就重新暴露于完整下跌风险；
- 股票低于 95 元：Put 可能被自动行权，股票按行权价卖出；
- 仍想持股并延续保护：需要卖出或处理旧 Put，再购买新的期限。

每次续保都要支付当时市场给出的价格。长期反复买 Put 的累计成本可能明显拖累收益，不能只看单期 3 元权利金。

### Put 行权价决定免赔区间

Put strike 越接近当前股价，保护开始得越早，权利金通常也越高；strike 越低，保险价格可能更便宜，但股票要先承担更大的下跌，Put 才开始发挥主要作用。

选择 strike 的核心问题不是“哪一档 Put 最便宜”，而是：

> 在保护期限内，我最多愿意让这笔股票持仓损失多少？

然后再把可接受损失、Put 权利金、期限和流动性放在一起比较。

### Protective Put 不等于止损单

两者都试图限制损失，但机制不同：

| 比较项       | Protective Put                         | 止损单                             |
| ------------ | -------------------------------------- | ---------------------------------- |
| 执行价格     | Put 提供约定行权价的权利               | 触发后按市场条件成交，可能滑点     |
| 跳空风险     | 期限内仍保留下限结构                   | 跳空可能远离触发价格成交           |
| 是否继续持股 | 可以保留股票并卖出 Put，也可以行权退出 | 成交通常直接卖出股票               |
| 成本         | 预先支付权利金                         | 没有期权权利金，但有成交和机会成本 |
| 有效期限     | 到期前有效                             | 取决于订单类型和券商规则           |

Protective Put 的价格下限更明确，但这份确定性需要付费；止损单成本较低，却不能保证成交价格。

## Collar：用上涨上限补贴下跌保护

如果 Put 保护成本太高，可以在 Protective Put 的基础上卖出 Call：

> 持有 1 单位股票，成本 100 元
>
> 买入 1 份 95 Put，支付 3 元
>
> 卖出 1 份 110 Call，收入 2 元

这就是常见的 **Protective Collar**。Put strike 形成 floor，Call strike 形成 ceiling，股票的到期结果被限制在两者之间。

这组 Collar 的期权净支出为 1 元：

> 净权利金 = Put 支出 3 - Call 收入 2 = 1 元

因此：

> 到期盈亏平衡点 = 股票成本 + 净支出 = 101 元

> 最大损失 = 股票成本 - Put 行权价 + 净支出 = 6 元

> 最大收益 = Call 行权价 - 股票成本 - 净支出 = 9 元

股票跌到 95 元以下时，Put 把损失限制在 6 元；股票涨到 110 元以上时，short Call 把收益限制在 9 元。

与 Protective Put 相比，Collar 少支付了 2 元保护成本，却放弃了 110 元以上的股票收益。它不是凭空降低保险价格，而是拿另一段价值交换。

### Zero-Cost Collar 不等于没有代价

如果卖出 Call 收到的权利金刚好覆盖买入 Put 的支出，这种组合常被称为 **Zero-Cost Collar**。这里的 zero 只表示开仓时期权净权利金接近 0，不代表：

- 没有交易成本；
- 没有股票下跌风险；
- 没有上涨机会成本；
- 不需要保证金或持仓权限；
- 提前行权和税务没有影响。

即使开仓没有净支出，Put strike 与 Call strike 仍然把股票未来的结果限制在一条走廊里。真正支付的价格，可能主要体现在被封住的上涨空间。

### 两个 strike 是一组风险预算

选择 Collar 时，可以把两个行权价分别看成两个决定：

- Put strike：愿意为多高的下限付费；
- Call strike：愿意用多低的卖出上限换取权利金。

提高 Put strike 通常增强保护、增加成本；降低 Call strike 通常收到更多权利金，却更早放弃上涨。

“Put 与 Call 距离现价相同”只是常见构造，不是规则。合理的 strike 应来自账户的风险预算与卖出意愿，而不是为了让图形看起来对称。

### Short Call 带来指派问题

Collar 中的 Put 由持有人控制，short Call 却可能被提前指派。对于美式股票期权，Call 深度实值、剩余时间价值很少或临近除息日时，提前指派尤其值得关注。

指派后，股票可能按 Call strike 被卖出，只剩 Long Put。那时原来的三腿 Collar 已经不存在，账户风险也完全改变。

如果本来就不愿意按 Call strike 交出股票，那么这个上限从开仓时就没有与目标一致。

## 合成股票：用 Call 与 Put 拼出一条直线

Protective Put 和 Collar 都从股票出发。Put-Call Parity 还告诉我们，Call、Put、股票与现金之间可以互相复制。

使用相同标的、相同行权价与相同到期日：

> Synthetic Long Stock = Long Call + Short Put

> Synthetic Short Stock = Long Put + Short Call

沿用本文简化参数，100 Call 与 100 Put 权利金都为 5 元，因此两种组合的期权净权利金为 0。

![Synthetic Long Stock 与 Synthetic Short Stock 的构造和到期盈亏：相同行权价及到期日的Long Call加Short Put复制多头股票，Long Put加Short Call复制空头股票](https://raw.githubusercontent.com/uytrdcvbjhgf/gallery/main/img/options-synthetic-long-and-short-stock.png)

### Synthetic Long Stock

组合为：

> 买入 100 Call，支付 5 元
>
> 卖出 100 Put，收入 5 元

到期时：

- 股票高于 100 元：Call 产生与上涨幅度相同的内在价值，Put 失效；
- 股票低于 100 元：Call 失效，short Put 产生与下跌幅度相同的亏损；
- 股票等于 100 元：两份期权都可能失效，盈亏为 0。

所以它的到期盈亏是 `到期价格 - 100`，与按 100 元买入股票相同：上涨收益理论上没有上限，股票跌到 0 时最大损失为 100 元。

### Synthetic Short Stock

组合方向反过来：

> 买入 100 Put，支付 5 元
>
> 卖出 100 Call，收入 5 元

到期盈亏为 `100 - 到期价格`，与按 100 元做空股票相同。股票下跌带来收益，股票上涨则产生理论上没有上限的亏损。

这里的 short Call 不是 Covered Call，因为账户没有股票用于交付。它与 Long Put 组合后虽然复制 short stock，但仍然包含 short option 的指派和保证金风险。

## 等价的是到期现金流，不是账户体验

Synthetic Long Stock 的图形像股票，不代表它在现实中就是股票。两者至少存在这些差异：

- **期限**：合成头寸会到期，股票没有固定到期日；
- **股息**：股票持有人可能收到股息，合成多头不会直接获得股息；
- **投票权**：期权持有人不是股东；
- **融资**：Put-Call Parity 会把行权价的现值、利率与股息计入价格；
- **保证金**：short Put 或 short Call 需要权限和资金，实际占用不一定低；
- **提前行权**：美式期权可能在到期前改变仓位；
- **流动性**：两条期权腿各有 Bid / Ask，退出成本可能高于股票；
- **公司行动与税务**：分红、拆股、并购和税务规则都可能改变操作结果。

因此，“不用买股票就能获得同样敞口”不能被简化成“用更少资金获得无成本杠杆”。合成头寸只是换了一组现金流与操作约束，方向风险并没有消失。

### Put-Call Parity 解释的是价格约束

对于欧洲式期权，在一致的模型假设下，股票、Call、Put 和现金组合如果到期现金流相同，今天的价格也应保持对应，否则可能出现套利空间。

真实美式股票期权受到提前行权、股息、融资和交易摩擦影响，实际报价不会永远精确贴合最简等式。合成关系仍然提供重要基准，但不能忽略产品规则直接照搬。

## 三种结构放进 Greeks

在开仓附近，常见风险倾向可以概括为：

| 结构                  | Delta                | Gamma          | Theta      | Vega       | 主要特征                             |
| --------------------- | -------------------- | -------------- | ---------- | ---------- | ------------------------------------ |
| Protective Put        | 正，且低于单独持股   | 正             | 通常为负   | 正         | 支付保险成本，保留下跌凸性           |
| Collar                | 正，但被上下两端限制 | 取决于两腿位置 | 常接近中性 | 常接近中性 | Put 与 Call 部分抵消时间和波动率风险 |
| Synthetic Long Stock  | 接近 +1              | 接近 0         | 接近 0     | 接近 0     | 复制股票多头的线性方向敞口           |
| Synthetic Short Stock | 接近 -1              | 接近 0         | 接近 0     | 接近 0     | 复制股票空头的线性方向敞口           |

“接近 0”不等于每条腿没有风险。它表示在相同 strike、期限和定价条件下，两条期权的局部敏感度大体抵消。

在 skew 明显、Call 与 Put 流动性不同或提前行权可能性上升时，实际组合仍可能表现出残余 Gamma、Theta、Vega 与基差风险。

## 如何在三种思路之间选择

可以先问自己究竟想解决哪一种问题：

| 需求                                   | 更接近的结构          | 主要代价                          |
| -------------------------------------- | --------------------- | --------------------------------- |
| 已持有股票，希望保留上涨并明确最大损失 | Protective Put        | 持续支付 Put 权利金               |
| 已持有股票，希望低成本锁定一段价格区间 | Collar                | 放弃 Call strike 以上的上涨       |
| 没有股票，希望用期权复制长期方向       | Synthetic Long Stock  | short Put 资金、期限与指派风险    |
| 希望复制做空股票的方向                 | Synthetic Short Stock | short Call 的无限上涨风险与保证金 |

如果已经不再相信股票的长期价值，买 Put 保护未必比直接减仓更合理。保护策略适合“仍想持有，但暂时不能接受某段下跌风险”的情况，而不是替一个已经失效的持股理由续命。

## 到期与调整检查清单

建立或管理这些组合时，可以依次检查：

1. 股票数量与期权合约乘数是否完全匹配？
2. Put 的保护期限是否覆盖真正担心的时间窗口？
3. Put strike 对应的最大账户损失是多少？
4. Collar 的 Call strike 是否真的是可接受卖价？
5. 两条期权的 IV、skew 和 Bid / Ask 是否让保护成本合理？
6. short option 被提前指派后，账户会剩下什么仓位？
7. 到期时是准备卖出股票、继续持有，还是重新建立保护？
8. 展期会实现多少旧仓盈亏，又会引入什么新风险？
9. 合成头寸的保证金和现金需求是否在极端行情下仍可承受？
10. 股息、利率、税务与公司行动是否会破坏简化假设？

这些问题的共同目标，是把策略名称还原成真实现金流。只有知道每条腿到期、行权或被指派后会变成什么，才算真正理解组合。

## 小结

Protective Put 用确定的权利金为股票设置期限内的下限，同时保留上涨空间；Collar 再卖出 Call，用上涨上限补贴 Put 成本，把股票结果限制在 floor 与 ceiling 之间。

Synthetic Long Stock 用 Long Call 与 Short Put 复制股票多头，Synthetic Short Stock 则用 Long Put 与 Short Call 复制股票空头。它们重现的是到期现金流与主要方向风险，不会复制股东权利，也不会消除期限、保证金、指派与流动性问题。

如果只记住一个原则，可以记住：

> 期权可以改变风险的形状，却不能让风险凭空消失；下限需要成本，上限可以补贴成本，合成关系则把同一风险换成另一组现金流。

本文用于金融知识整理，不构成投资建议。多腿策略涉及权利金、自动行权、提前指派、保证金、税务与公司行动，真实交易前应核对交易所、清算机构和券商规则。

## 参考与延伸阅读

1. Options Industry Council, [Protective Put (Married Put)](https://www.optionseducation.org/strategies/all-strategies/protective-put-married-put)。股票加 Long Put 的保护下限、保险成本与到期处理。
2. Options Industry Council, [Collar (Protective Collar)](https://www.optionseducation.org/strategies/all-strategies/collar-protective-collar)。Put floor、Call ceiling、净权利金与 short Call 指派风险。
3. Options Industry Council, [Synthetic Long Stock](https://www.optionseducation.org/strategies/all-strategies/synthetic-long-stock) 与 [Synthetic Short Stock](https://www.optionseducation.org/strategies/all-strategies/synthetic-short-stock)。相同 strike 和到期日的 Call/Put 如何复制股票方向。
4. Options Clearing Corporation, [Characteristics and Risks of Standardized Options](https://www.theocc.com/company-information/documents-and-archives/options-disclosure-document)。标准化期权、多腿组合、行权、指派与风险披露。
5. Lawrence G. McMillan, [Options as a Strategic Investment, Fifth Edition](https://www.penguinrandomhouse.com/books/310812/options-as-a-strategic-investment-by-lawrence-g-mcmillan/)。保护性策略、Collar、合成关系与调整方法的经典参考。
6. John C. Hull, [Options, Futures, and Other Derivatives, 11th Edition](https://www.pearson.com/en-gb/subject-catalog/p/options-futures-and-other-derivatives-global-edition/P200000004519/9781292410654)。Put-Call Parity、复制组合与无套利定价的系统参考。
