+++
title = '代码坏味道之临时字段 (Temporary Field)'
date = 2024-10-13T18:30:10+08:00
categories = ['java']
tags = ['refactor']
+++

**定义**

某个实例变量仅为代码中一小部分功能临时所用而创建

**影响**

- 通常一个对象会需要它的全部的变量。当一个变量看上去没什么用，却要试图了解他为什么在哪里时，会使类的作用变得更难理解，影响了代码的可读性和可维护性。

**改进目标**

- 消除临时字段，提升代码可读性、可维护性

**方法**

- 提取类
- 引入特例

> 案例1：问题代码

**代码背景**

- Account为用户账户类，包含用户名、卡号、余额等信息，以及一些未列举出来的账户信息
- 日常消费中会频繁调用addToBalance、deductBalance、以及其他一些未列举的账户信息处理方法，更新账户信息
- 每半年会调用evaluateAccount和evaluateConsumptionLevel方法，对账户进行一次评估

**症状/问题**

- name、cardId、balance以及一些未列举的账户信息字段， 在账户对象创建后，频繁会被使用。与对象绑定在一起， 属于Account中的正常字段。
- maxAsset、usageFrequency、overdueTimes，每半年才被 赋值并使用一次。账户对象创建后，多数情况下是空值， 毫无用处，属于临时字段

```java
/**
 * 账户信息5
 */
public class Account {
    private final String name;

    private final String cardId;

    private int balance;

    // other account info ……

    private int maxAsset;

    private double usageFrequency;

    private int overdueTimes;

    public Account(String name, String cardId, int balance) {
        this.name = name;
        this.cardId = cardId;
        this.balance = balance;
    }

    public String getName() {
        return name;
    }

    public String getCardId() {
        return cardId;
    }

    /**
     * 增加到余额
     * 
     * @param money 增加金额
     */
    public void addToBalance(int money) {
        balance += money;
    }

    /**
     * 扣除余额
     * 
     * @param money 扣除金额
     */
    public void deductBalance(int money) {
        balance -= money;
    }

    public int getBalance() {
        return balance;
    }

    // other account info process

    /**
     * 整体评估
     * 
     * @return 评估结果
     */
    public int evaluateAccount() {
        int evaluatePoint = 60;
        int usageTimes = (int) (usageFrequency * 365) + 1;
        double overdueRate = (double) overdueTimes / usageTimes;
        evaluatePoint -= 10 * overdueRate;
        evaluatePoint += (maxAsset / 100);
        return evaluatePoint;
    }

    /**
     * 消费水平评估
     * 
     * @return 评估结果
     */
    public int evaluateConsumptionLevel() {
        return (int) (usageFrequency * 365) - overdueTimes * 3;
    }

    public void setMaxAsset(int maxAsset) {
        this.maxAsset = maxAsset;
    }

    public void setUsageFrequency(double usageFrequency) {
        this.usageFrequency = usageFrequency;
    }

    public void setOverdueTimes(int overdueTimes) {
        this.overdueTimes = overdueTimes;
    }
}
```

> 改进手法

```java
/**
 * 账户信息5
 */
public class Account {
    private final String name;

    private final String cardId;

    private int balance;

    // other account info ……

    public Account(String name, String cardId, int balance) {
        this.name = name;
        this.cardId = cardId;
        this.balance = balance;
    }

    public String getName() {
        return name;
    }

    public String getCardId() {
        return cardId;
    }

    /**
     * 增加到余额
     * 
     * @param money 增加金额
     */
    public void addToBalance(int money) {
        balance += money;
    }

    /**
     * 扣除余额
     * 
     * @param money 扣除金额
     */
    public void deductBalance(int money) {
        balance -= money;
    }

    public int getBalance() {
        return balance;
    }

    // other account info process
}
```

```java
public class Evaluator {
    int maxAsset;

    double usageFrequency;

    int overdueTimes;

    /**
     * 整体评估
     *
     * @return 评估结果
     */
    public int evaluateAccount() {
        int evaluatePoint = 60;
        int usageTimes = (int) (usageFrequency * 365) + 1;
        double overdueRate = (double) overdueTimes / usageTimes;
        evaluatePoint -= 10 * overdueRate;
        evaluatePoint += (maxAsset / 100);
        return evaluatePoint;
    }

    public Evaluator(int maxAsset, double usageFrequency, int overdueTimes) {
        this.maxAsset = maxAsset;
        this.usageFrequency = usageFrequency;
        this.overdueTimes = overdueTimes;
    }

    /**
     * 消费水平评估
     *
     * @return 评估结果
     */
    public int evaluateConsumptionLevel() {
        return (int) (usageFrequency * 365) - overdueTimes * 3;
    }
}
```

> 案例2：问题代码

**代码背景**

- RoutingHandler对消息进行路由处理，即我们关注的核心类
- Message为消息体
- 路由的目标对象，通过工厂RouterFactory进行创建
- RouterFactory创建Router接口的实例，即具体的路由对象

**症状/问题**

- 在handle方法中，我们需要反复对msg.getPriority()是否为空进行判断，priority为空是一种特例，对空的处理少数情况下的处理逻辑，也可归属于临时字段范畴

```java
/**
 * 路由消息处理5
 */
public class RoutingHandler {
    /**
     * 消息处理
     * 
     * @param messages 消息内容
     * @return 处理结果
     */
    public List<String> handle(Iterable<Message> messages) {
        List<String> handleResults = new ArrayList<>();
        for (Message msg : messages) {
            String handleResult;
            if (msg.getPriority() == null) {
                handleResult = "priority is null, handle failed";
            } else {
                Router router = RouterFactory.getRouterForMessage(msg);
                handleResult = router.route(msg);
            }
            handleResults.add(handleResult);
        }
        return handleResults;
    }
}
```

```java
/**
 * 路由接口5
 */
public interface Router {
    /**
     * 发送消息
     * 
     * @param body 消息体
     * @return 路由结果
     */
    String route(Message body);
}
```

> 改进手法：
> 我们可以使用“引入特例”的方法，为Router加入一个 新的实现类，用来专门处理这种少见的逻辑。
> 此时便可将这种“临时的处理”搬移到类外面去。

```java
/**
 * 路由消息处理5
 */
public class RoutingHandler {
    /**
     * 消息处理
     * 
     * @param messages 消息内容
     * @return 处理结果
     */
    public List<String> handle(Iterable<Message> messages) {
        List<String> handleResults = new ArrayList<>();
        for (Message msg : messages) {
            Router router = RouterFactory.getRouterForMessage(msg);
            handleResults.add(router.route(msg));
        }
        return handleResults;
    }
}
```

```java
/**
 * 路由接口5
 */
public interface Router {
    /**
     * 发送消息
     * 
     * @param body 消息体
     * @return 路由结果
     */
    String route(Message body);
}
```

```java
public class NullRouter implements Router {
    @Override
    public String route(Message body) {
        return "priority is null, handle failed";
    }
}
```

```java
/**
 * 路由方式工厂5
 */
public class RouterFactory {
    /**
     * 获取路由消息的方法
     * 
     * @param msg 消息体
     * @return 路由方法实例
     */
    public static Router getRouterForMessage(Message msg) {
        switch (String.valueOf(msg.getPriority())) {
            case "high":
                return new SmsRouter();
            case "medium":
                return new JmsRouter();
            case "null":
                return new NullRouter();
            default:
                return new DefaultRouter();
        }
    }
}
```

> 操作手法

| 操作       | 快捷键（推荐） | Ctrl+Alt+Shift+T（或：鼠标右键“Refactor”） |
| ---------- | -------------- | ------------------------------------------ |
| 提取类     |                | Extract Delegate                           |
| 提取方法   | Ctrl+Alt+M     | Extract Method                             |
| 移除中间人 |                | Remove Middleman                           |
| 安全删除   | Alt+Delete     | Safe Delete                                |
| 内联       | Ctrl+Alt+N     | Inline xxx                                 |

补充：时常需要人工判断，分析变量或字段的生命周期。
