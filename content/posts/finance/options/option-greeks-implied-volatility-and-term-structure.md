+++
title = 'Greeks、隐含波动率与期限结构'
date = 2026-08-13T10:04:11+09:00
draft = false
categories = ['finance']
tags = ['options', 'derivatives']
description = '把 Greeks 当作期权风险的局部刻度，并从隐含波动率、偏斜和期限结构读懂市场如何为不确定性定价。'
+++

前置阅读：[《权利金、内在价值与定价模型》](/posts/finance/options/option-premium-intrinsic-value-and-pricing-models/)介绍了期权价格的主要输入以及 Black-Scholes-Merton 模型；[《读懂期权合约与期权链》](/posts/finance/options/option-contracts-and-chains/)介绍了期权链中的报价字段。如果已经熟悉这些概念，也可以直接从本文开始。

期权价格会同时受到标的价格、时间、波动率、利率和股息影响。只看一笔盈亏，很难知道究竟是哪一种风险在起作用。

Greeks 所做的，就是把这团变化拆成几条可以观察的轴：方向由 Delta 描述，方向敏感度的变化由 Gamma 描述，时间由 Theta 描述，隐含波动率由 Vega 描述，利率则由 Rho 描述。

它们不是对未来的预言，而是一张会持续变化的风险快照。

## Greeks 是局部刻度，不是固定常数

假设期权理论价值可以写成：

$$
V=f(S,T,\sigma,r,q)
$$

其中 $S$ 是标的价格，$T$ 是剩余期限，$\sigma$ 是波动率，$r$ 是利率，$q$ 是股息率。Greeks 衡量的是：当其中一个输入发生很小的变化、其他条件暂时不变时，理论价值大约会变化多少。

“很小的变化”和“其他条件不变”非常重要。真实市场里，股价、时间和隐含波动率会一起变化，Greeks 自身也会跟着变化。因此，用开仓时的 Delta 去预测几天后的精确盈亏，往往会得到一种看起来严谨、实际已经过期的答案。

不同平台对单位和正负号的展示也可能略有差异。阅读数值前应先确认：

- Greek 是按每股还是每张合约显示；
- Theta 是按一个自然日还是其他时间口径计算；
- Vega 和 Rho 是按 1 个百分点还是按小数 0.01 计算；
- 组合页面显示的是单腿数值还是整个持仓的净值。

## Delta：当前的方向暴露

**Delta** 估算标的价格变化 1 个单位时，期权理论价值大约变化多少。

例如，一份 Call 的 Delta 为 0.52。标的上涨 1 元，在其他条件不变且变动足够小时，期权理论价值大约上涨 0.52 元；标的下跌 1 元，则大约下降 0.52 元。

标准期权的 Delta 通常落在以下区间：

- Long Call：0 到 1；
- Long Put：-1 到 0；
- Short Call：-1 到 0；
- Short Put：0 到 1。

Call 的 Delta 为正，是因为标的上涨通常有利于 Call；Put 的 Delta 为负，是因为标的上涨通常不利于 Put。卖出期权后，方向符号与对应的买入期权相反。

Delta 也常被换算成 **标的等价敞口**。如果一张股票 Call 的 Delta 为 0.52，合约乘数为 100，那么它当前大约相当于：

> 0.52 × 100 = 52 股的正向 Delta

这不代表你真的持有 52 股，也不保证它会一直等价于 52 股。只要标的价格、时间或波动率发生变化，Delta 就会移动。

有时人们也把 Delta 当作期权到期成为实值的粗略概率。这个说法在特定模型和假设下有一定直觉价值，但 Delta 首先是价格敏感度，并不是经过保证的真实概率。

## Gamma：Delta 会变得多快

**Gamma** 估算标的价格变化 1 个单位时，Delta 大约变化多少。

假设一份 Call 的 Delta 为 0.52，Gamma 为 0.06：

- 标的上涨 1 元后，Delta 可能从 0.52 增加到约 0.58；
- 标的下跌 1 元后，Delta 可能从 0.52 降低到约 0.46。

Gamma 解释了为什么期权盈亏不是直线变化。标的越向有利方向移动，Long Call 的 Delta 越可能接近 1；标的越向不利方向移动，它的 Delta 越可能接近 0。

Long Call 和 Long Put 通常都是正 Gamma，Short Call 和 Short Put 通常都是负 Gamma：

- **正 Gamma** 会让方向暴露随有利行情增强、随不利行情减弱；
- **负 Gamma** 则相反，行情越向不利方向移动，风险敞口越容易继续扩大。

Gamma 往往在接近平值、临近到期时较高。这也是短期期权看起来金额不大，却可能在标的小幅波动后迅速改变风险形态的原因。

## Theta：时间经过一天的理论影响

**Theta** 估算剩余期限减少一个时间单位时，期权理论价值如何变化。平台上最常见的口径是一天。

一份期权 Theta 为 -0.08，可以粗略理解为：如果其他输入不变，经过一天，其理论价值减少约 0.08 元。

标准 Long Call 和 Long Put 的 Theta 通常为负，因为买方持有的选择权会随着到期临近而失去时间价值；相应的 Short Call 和 Short Put 通常为正。

但“正 Theta”绝不等于每天稳定收钱：

- 标的价格变化带来的 Delta 和 Gamma 盈亏可能远大于一天的时间收益；
- 隐含波动率上升可能推高期权价格，使空头亏损；
- 临近到期时，Theta 和 Gamma 经常同时升高，赚取时间价值的同时也在承担更剧烈的方向风险；
- Theta 是模型在当前时点给出的局部估算，不是一笔会自动进入账户的利息。

时间价值最终会在到期时归零，但衰减过程并不是一条匀速直线。

## Vega：隐含波动率变化的价格敏感度

**Vega** 估算隐含波动率变化 1 个百分点时，期权理论价值大约变化多少。虽然它并不是一个希腊字母，却被习惯性地归入 Greeks。

假设一份期权的 Vega 为 0.11：

- IV 从 25% 上升到 26%，理论价值大约增加 0.11 元；
- IV 从 25% 下降到 24%，理论价值大约减少 0.11 元。

这里的“1 个百分点”是 25% 到 26%，不是在 25% 的基础上增加 1%。

Long Call 和 Long Put 通常为正 Vega，Short Call 和 Short Put 通常为负 Vega。因为更高的预期波动会增加期权买方选择权的价值，而卖方承担的尾部风险也随之变大。

在其他条件相近时，长期期权通常比短期期权拥有更高的 Vega。不过，Vega 也会随行权价、期限和市场状态变化，不能只凭“长期”两个字判断整个组合的波动率风险。

## Rho：利率变化的影响

**Rho** 估算利率变化 1 个百分点时，期权理论价值大约变化多少。

在常见模型下：

- Long Call 的 Rho 通常为正；
- Long Put 的 Rho 通常为负。

短期期权对利率通常没有长期期权那么敏感，因此 Rho 在日常观察中经常排在 Delta、Gamma、Theta 和 Vega 之后。但对于 LEAPS、利率期权或利率快速变化的环境，它不能被完全忽略。

## 把五个指标放在一起看

下面是标准单腿期权的一般符号。实际数值仍取决于具体合约。

| 头寸       | Delta | Gamma | Theta    | Vega | Rho      |
| ---------- | ----- | ----- | -------- | ---- | -------- |
| Long Call  | 正    | 正    | 通常为负 | 正   | 通常为正 |
| Short Call | 负    | 负    | 通常为正 | 负   | 通常为负 |
| Long Put   | 负    | 正    | 通常为负 | 正   | 通常为负 |
| Short Put  | 正    | 负    | 通常为正 | 负   | 通常为正 |

Greeks 不是互相独立的标签。Long option 常见的结构是：付出 Theta，换取正 Gamma 与正 Vega；short option 则常常收取 Theta，同时承担负 Gamma 与负 Vega。

这比“买方亏时间、卖方赚时间”更接近真实风险交换。

## 用一组数字拆解期权价格变化

假设一份 Call 当前具有以下数值：

- 权利金：4.00 元；
- Delta：0.52；
- Gamma：0.06；
- Theta：-0.08，每天；
- Vega：0.11，每 1 个 IV 百分点。

接下来一天里，标的上涨 2 元，IV 从 25% 上升到 28%。暂时忽略利率、股息和更高阶影响，可以做一个近似分解：

$$
\Delta V \approx
\Delta \times \Delta S
+ \frac{1}{2}\Gamma \times (\Delta S)^2
+ \Theta \times \Delta t
+ Vega \times \Delta IV
$$

代入数字：

> Delta 影响：0.52 × 2 = 1.04 元
>
> Gamma 修正：0.5 × 0.06 × 2² = 0.12 元
>
> Theta 影响：-0.08 × 1 = -0.08 元
>
> Vega 影响：0.11 × 3 = 0.33 元
>
> 估算变化：1.04 + 0.12 - 0.08 + 0.33 = 1.41 元

于是理论价值大约从 4.00 元变成 5.41 元。

真实结果不会刚好等于 5.41 元。因为标的上涨过程中 Delta、Gamma 和 Vega 都在改变，IV 也未必一次跳到 28%，模型还省略了 Vanna、Charm、Volga 等更高阶交互项。这个计算的价值不在于精确预测，而在于解释“钱大致从哪里来”。

## 单腿 Greeks 要合并成持仓 Greeks

多腿策略真正承担的是各腿相加后的 **净 Greeks**。

例如，同时持有一份 Vega 为 0.20 的长期 Call，并卖出一份 Vega 为 0.08 的短期 Call，组合净 Vega 约为：

> 0.20 - 0.08 = 0.12

如果合约乘数为 100，平台又按每股显示，那么整张组合对 1 个 IV 百分点的理论敏感度约为 12 元。

同样的方法也适用于 Delta、Gamma 和 Theta。只盯着空头腿的正 Theta，而忽略多头腿、合约数量与乘数，容易对组合风险产生完全错误的认识。

## 隐含波动率不是历史波动率

**历史波动率（historical volatility）** 或 **已实现波动率（realized volatility）** 来自标的过去真实发生的价格变化。计算窗口和取样方法不同，结果也会不同。

**隐含波动率（implied volatility，IV）** 则是把期权市场价格代回定价模型后，反推出的波动率输入。它表达市场当前愿意用什么波动率水平解释这份期权价格。

因此，IV 有几个重要边界：

- IV 是年化数字，不是标的在该期限内一定会波动的百分比；
- IV 描述波动幅度，不直接表达上涨或下跌方向；
- IV 不是对未来已实现波动率的保证；
- 同一个标的并不存在唯一 IV，不同行权价与到期日都有自己的隐含波动率。

一个常见的粗略换算是：

$$
\text{期限内一倍标准差波动幅度} \approx S \times IV \times \sqrt{T}
$$

如果标的为 100 元，30 天 IV 为 25%，那么估算幅度约为：

> 100 × 25% × √(30 / 365) ≈ 7.17 元

这只是基于模型分布的尺度估算，不是“价格必定落在 92.83 到 107.17 元”的承诺，更不是止盈止损建议。

## 波动率偏斜：同一到期日横着看

经典 Black-Scholes-Merton 模型把波动率视为固定输入，但真实期权链中，不同行权价反推出的 IV 往往不同。

**波动率偏斜（volatility skew）** 观察的是：在同一个到期日下，IV 如何随行权价或 Delta 变化。

例如，某个股指期权可能出现这样的虚构结构：

| 行权价 | Put/Call 位置 |  IV |
| -----: | ------------- | --: |
|     90 | 低行权价一侧  | 31% |
|     95 | 低行权价一侧  | 27% |
|    100 | 平值附近      | 23% |
|    105 | 高行权价一侧  | 22% |
|    110 | 高行权价一侧  | 23% |

低行权价一侧的 IV 更高，常见解释包括下跌保护需求、跳跃风险、标的与波动率的负相关，以及做市商承接尾部风险所要求的补偿。

偏斜是供需和风险定价共同形成的结果，不等于低行权价 Put 一定被错误高估。比较 skew 时，使用相近 Delta 的合约通常比机械比较固定行权价更有意义。

## 期限结构：同一位置竖着看

**隐含波动率期限结构（term structure）** 观察的是：在相近 moneyness（标的价格与行权价的相对位置）或 Delta 下，IV 如何随到期日变化。实践中常用各期限的平值 IV 作为一条简化曲线。

期限结构常见三种形态：

- **向上倾斜**：长期 IV 高于短期 IV，常见于较平静的环境；
- **倒挂**：短期 IV 高于长期 IV，可能出现在市场压力或短期风险集中时；
- **局部凸起**：某个到期日附近存在财报、议息会议、选举等已知事件。

要注意，IV 是年化值。短期 IV 为 40%、长期 IV 为 25%，并不自动意味着短期期权包含的绝对价格波动更大，还要结合期限的平方根进行换算。

期限结构也不是一条静止曲线。事件过去、市场恐慌缓解或新的信息进入后，各个期限可能以不同速度变化。

## 波动率曲面：把行权价和期限放在一起

同一到期日横向观察得到 skew，同一位置跨到期日观察得到 term structure。把所有行权价与到期日的 IV 放在一起，就形成了 **波动率曲面（volatility surface）**。

一张虚构的简化表可能是：

| 到期日 \ 行权价 |  90 | 100 | 110 |
| --------------- | --: | --: | --: |
| 7 天            | 36% | 30% | 29% |
| 30 天           | 31% | 25% | 24% |
| 90 天           | 28% | 24% | 24% |

这张表同时包含两个信息：低行权价一侧存在 skew，短期期限也比长期期限更昂贵。

对于单腿交易，曲面决定所选合约处在怎样的相对价格位置；对于 Calendar、Diagonal 等跨期限组合，风险来自曲面上两个点的相对变化，而不只是“整体 IV 上升或下降”。

## 阅读 Greeks 与波动率时的检查顺序

面对一份期权或一个组合，可以依次问：

1. Greeks 的单位是每股、每张合约还是整个持仓？
2. 当前净 Delta 表达多大的方向敞口？
3. Gamma 是否会让 Delta 在小幅行情后迅速变化？
4. Theta 收益或成本是否足以覆盖 Gamma 风险？
5. Vega 对应的是曲面上的哪个行权价和到期日？
6. 当前 IV 相对自身历史、同到期日 skew 和其他期限处于什么位置？
7. 未来是否有可能改变局部期限结构的已知事件？

这套顺序不会给出自动交易答案，但能把“我看涨”“IV 很高”这类模糊判断拆成可检查的风险假设。

## 小结

Greeks 是定价模型在当前市场状态下给出的局部敏感度：Delta 看方向，Gamma 看方向暴露变化的速度，Theta 看时间，Vega 看隐含波动率，Rho 看利率。

IV 则是市场价格通过模型反推出的波动率语言。同一到期日的不同行权价构成 skew，相同位置的不同到期日构成期限结构，两者合起来形成波动率曲面。

如果只记住一个原则，可以记住：

> Greeks 描述的是此刻的风险形状，不是未来盈亏的保证；IV 描述的是市场如何定价不确定性，不是方向预测。

本文用于金融知识整理，不构成投资建议。不同平台的模型、单位和数据口径可能不同，真实交易前应核对产品规则与风险披露。

## 参考与延伸阅读

1. Options Industry Council, [Understanding Options Greeks](https://www.optionseducation.org/advancedconcepts/understanding-options-greeks)。Delta、Gamma、Theta、Vega 与 Rho 的定义及使用边界。
2. Options Industry Council, [Volatility & the Greeks](https://www.optionseducation.org/advancedconcepts/volatility-the-greeks)。波动率与各项 Greeks 的数值示例。
3. Options Industry Council, [Volatility Skew and Options: An Overview](https://www.optionseducation.org/news/volatility-skew-and-options-an-overview-1)。从 flat、smile 与 smirk 理解不同行权价的 IV 差异。
4. Sheldon Natenberg, [Option Volatility and Pricing, 2nd Edition](https://www.mheducation.com/highered/mhp/product/option-volatility-pricing-advanced-trading-strategies-techniques-2nd-edition.html)。从交易视角系统理解波动率、Greeks 与风险管理。
5. John C. Hull, [Options, Futures, and Other Derivatives, 11th Edition](https://www.pearson.com/en-gb/subject-catalog/p/options-futures-and-other-derivatives-global-edition/P200000004519/9781292410654)。定价模型、波动率曲面与衍生品风险管理的系统参考。
