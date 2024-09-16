+++
title = '代码坏味道之神秘命名 (Mysterious Name)'
date = 2024-09-16T20:09:40+08:00
categories = ['java']
tags = ['refactor']
+++

**定义**

在阅读代码时，一些会影响我们的阅读体验的神秘文字（不知其意的命名）

**影响**

- 未来在“猜谜”上可能浪费大把时间，影响可读性
- 如果代码难以命名，其背后可能潜藏更深的设计问题

**改进目标**

- 代码直观明了
- 函数、模块、变量和类命名能清晰地表名自己的功能和用法

**方法**

- 改变函数声明（用于给函数改名）、变量改名、字段改名等

> 案例：命名对代码理解的影响


**问题代码：**

一段充满神秘命名的代码，我们先来根据代码猜测其业务含义。

```java
public class MysteriousExample {
    public int amont(Perf perf, Type type) {
        switch (type) {
            case TYPE1:
                return resfortype1(perf);
            case TYPE2:
                return resfortype2(perf);
            default:
                throw new IllegalArgumentException("Illegal type : " + type);
        }
    }

    private int resfortype1(Perf perf) {
        int s = 40000;
        if (perf.getAud() > 30) {
            s += 1000 * (perf.getAud() - 30);
        }
        return s;
    }

    private int resfortype2(Perf perf) {
        int s = 30000;
        if (perf.getAud() > 20) {
            s += 1000 + 500 * (perf.getAud() - 20);
        }
        return s;
    }
}
```

**猜测：**

- amont应该是amount拼写错误，同时方法命名以动词或动词+名词形式更合适。
- 可以看出是根据输入type走不同分支，到底是什么type，以及TYPE1、TYPE2含义，完全无法理解。
- Perf是？performance 、performer、perfect、perfume还是其他？结合方法名，猜测可能是要做性能计算？资源占用计算？
- resfortype1(Perf perf)大概是根据type算一个 int类型result，但不管是方法名还是方法体，都猜测不出计算结果到底是什么含义；同时命名没有使用小驼峰，使其更难以理解。
- 结合方法名及上下文，看的出来s就代表待返回的result，但看不出是什么result
- getAud()的Aud含义？可能是业务专用词缩写？或 许 Audit 、Auditor、Audience、Audio等等？如果前面资源计算猜的没错，这里可能是审单数量？操作数……？

**实际：**

剧院包场总金额结算系统，有悲剧、喜剧两种类型：1）悲剧场——不大于30人算40000，超过30人，超出部分每人加1000；2）喜剧场——不大于20人算30000，超过20人总价加1000，且超出部分每人加500。

**按照如下修改建议修改之后：**

1. 方法名使用动词或动词+名词
2. 变量名使用名词
3. 避免拼写错误
4. 方法、变量、枚举等等，都使用有具体含义的命名方式，不要使用含义模糊的词
5. 避免随意的缩写

```java
public class MysteriousExample {
    public int calculateAmount(Performance performance, PlayType playType) {
        switch (playType) {
            case TRAGEDY:
                return calculateTragedyAmount(performance);
            case COMEDY:
                return calculateComedyAmount(performance);
            default:
                throw new IllegalArgumentException("Illegal type : " + playType);
        }
    }

    private int calculateTragedyAmount(Performance performance) {
        int totalAmount = 40000;
        if (performance.getAudienceNum() > 30) {
            totalAmount += 1000 * (performance.getAudienceNum() - 30);
        }
        return totalAmount;
    }

    private int calculateComedyAmount(Performance performance) {
        int totalAmount = 30000;
        if (performance.getAudienceNum() > 20) {
            totalAmount += 1000 + 500 * (performance.getAudienceNum() - 20);
        }
        return totalAmount;
    }
}
```

`calculateAmount(Performance performance, PlayType playType)`

`calculateTragedyAmount(Performance performance)`

- 参考建议3，修改明显拼写错误；参考建议1，使用动词+名词
- 参考建议5，用全称改掉有歧义的简写perf；
- 参考建议4，type虽然无拼写或歧义问题，但为了更一目了然体现剧本类型含义，重命名为 playType

`TRAGEDY`、`COMEDY`

- 参考建议4，TYPE1、TYPE2实在无法理解，根据实际功能，指明枚举具体类型（悲喜剧）

`totalAmount`、`performance.getAudienceNum()`

- s不符合规范的命名。参考建议4， 命名为totalAmount，可指明是某种金钱计算；
- 参考建议5，存在难以理解含义的Aud简写，根据描述，这里指的是观众数量 。用 AudienceNum代替，注意Num也是缩写，但由于是业界约定俗成，可在此应用。

> 操作手法

| 操作                         | 快捷键（推荐） | Ctrl+Alt+Shift+T（或：鼠标右键“Refactor”） |
| ---------------------------- | -------------- | ------------------------------------------ |
| 重命名                       | Shift+F6       | Rename                                     |
| 执行当前光标所在的可执行代码 | Ctrl+Shift+F10 |                                            |
| 执行上次运行的代码           | Shift+F10      |                                            |


补充：IDEA-Code-Inspect Code可辅助识别拼写错误、不当缩写