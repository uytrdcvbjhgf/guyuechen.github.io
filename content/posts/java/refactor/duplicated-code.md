+++
title = '代码坏味道之重复代码 (Duplicated Code)'
date = 2024-09-17T13:56:40+08:00
categories = ['java']
tags = ['refactor']
+++

**定义**

在一个以上的地点看到相同或相似的代码结构

**影响**

- 想要修改其中一段代码逻辑需要修改多次
- 易遗漏， 难维护

**改进目标**

- 消除重复，提升可维护性的目标

**方法**

- 提炼函数
- 移动语句
- 函数上移

> 案例1：同一个类的多个方法间代码重复


**代码背景**

- 两个函数根据水果类型获得单价并计算水果费用；
- 其中一个函数全价购买，一个函数打折购买；

**症状/问题**

- 两个函数在获得水果单价的代码是一致的，如果其中一种水果单价出现变化，则需要同时修改两处

```java
public class FruitsCost {
    public double computeMoneyWithoutPrivileges(String type, int numbers) {
        double prices;
        switch (type) {
            case "apple":
                prices = 5.5;
                break;
            case "banana":
                prices = 4.0;
                break;
            case "strawberry":
                prices = 10.5;
                break;
            default:
                throw new IllegalArgumentException("Illegal type : " + type);
        }
        return prices * numbers;
    }

    public double computeMoneyWithPrivileges(String type, double numbers, double discount) {
        double prices;
        switch (type) {
            case "apple":
                prices = 5.5;
                break;
            case "banana":
                prices = 4.0;
                break;
            case "strawberry":
                prices = 10.5;
                break;
            default:
                throw new IllegalArgumentException("Illegal type : " + type);
        }
        return prices * numbers * discount;
    }
}
```

> 改进手法：抽取公共方法


```java
public class FruitsCost {
    private static double getPrices(String type) {
        double prices;
        switch (type) {
            case "apple":
                prices = 5.5;
                break;
            case "banana":
                prices = 4.0;
                break;
            case "strawberry":
                prices = 10.5;
                break;
            default:
                throw new IllegalArgumentException("Illegal type : " + type);
        }
        return prices;
    }

    public double computeMoneyWithoutPrivileges(String type, int numbers) {
        double prices = getPrices(type);
        return prices * numbers;
    }

    public double computeMoneyWithPrivileges(String type, double numbers, double discount) {
        double prices = getPrices(type);
        return prices * numbers * discount;
    }
}
```

> 案例2：互为兄弟的子类间代码重复


**代码背景**

- 代码由水果父类，以及苹果香蕉两个子类组成。
- 计算每种水果的销售利润
- 考虑运费，存储，破损等成本，计算毛利润时，需要从销量中减去最小出货量

**症状**

- 两个子类计算利润的方法完全一致，如果计算利润方式出现变化，则需要修改多个子类

```java
class Fruits {
    // 成本单价
    public double costPrices;

    // 出售单价
    public double prices;

    // 最小出货量
    public double minSaleableNum;
}
```

```java
class Apple extends Fruits {
    public Apple(double costPrices, double prices, double minSaleableNum) {
        this.costPrices = costPrices;
        this.minSaleableNum = minSaleableNum;
        this.prices = prices;
    }

    public double profitMoney(int number) {
        return Math.max(0, number - minSaleableNum) * this.prices - this.costPrices * number;
    }
}
```

```java
class Banana extends Fruits {
    public Banana(double costPrices, double prices, double minSaleableNum) {
        this.costPrices = costPrices;
        this.minSaleableNum = minSaleableNum;
        this.prices = prices;
    }

    public double profitMoney(int number) {
        return Math.max(0, number - minSaleableNum) * this.prices - this.costPrices * number;
    }
}
```

> 改进手法：函数上移


```java
class Fruits {
    // 成本单价
    public double costPrices;

    // 出售单价
    public double prices;

    // 最小出货量
    public double minSaleableNum;

    public double profitMoney(int number) {
        return Math.max(0, number - minSaleableNum) * this.prices - this.costPrices * number;
    }
}
```

```java
class Apple extends Fruits {
    public Apple(double costPrices, double prices, double minSaleableNum) {
        this.costPrices = costPrices;
        this.minSaleableNum = minSaleableNum;
        this.prices = prices;
    }
}
```

```java
class Banana extends Fruits {
    public Banana(double costPrices, double prices, double minSaleableNum) {
        this.costPrices = costPrices;
        this.minSaleableNum = minSaleableNum;
        this.prices = prices;
    }
}
```

> 案例3：不同类间的代码重复


代码背景

- 重复代码出现在不同的类中
- 代码逻辑不完全一致，变量名不同分别为time和timeState，judgeYear多了一条打印语句

症状

- 两个类中函数judgeMonth和judgeYear函数逻辑基本上是一致，只是个别不相同的地方，如果修改修改时间格式， 需要同时修改两处

```java
class MonthJudgement {
    public boolean judgeMonth() {
        Long timeStamp = System.currentTimeMillis();  // 获取当前时间戳
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        String date = sdf.format(new Date(Long.parseLong(String.valueOf(timeStamp))));
        String month = date.split(" ")[0].split("-")[1];
        return "12".equals(month);
    }
}
```

```java
class YearJudgement {
    public boolean judgeYear() {
        Long time = System.currentTimeMillis();  // 获取当前时间戳
        System.out.println("获得当前时间戳");
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        String date = dateFormat.format(new Date(Long.parseLong(String.valueOf(time))));
        return date.startsWith("2021");
    }
}
```

> 改进手法：语句移动+抽取公共方法


```java
class MonthJudgement {
    public boolean judgeMonth() {
        String date = DateFormatter.getDate();
        String month = date.split(" ")[0].split("-")[1];
        return "12".equals(month);
    }
}
```

```java
class YearJudgement {
    public boolean judgeYear() {
        System.out.println("获得当前时间戳");
        String date = DateFormatter.getDate();
        return date.startsWith("2021");
    }
}
```

```java
public class DateFormatter {
    public static String getDate() {
        Long time = System.currentTimeMillis();  // 获取当前时间戳
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        return dateFormat.format(new Date(Long.parseLong(String.valueOf(time))));
    }
}
```

> 操作方法

| 操作     | 快捷键（推荐） | Ctrl+Alt+Shift+T（或：鼠标右键“Refactor”） | 注意                               |
| -------- | -------------- | ------------------------------------------ | ---------------------------------- |
| 提炼函数 | Ctrl+Alt+M     | Extract Method                             |                                    |
| 移动语句 | Ctrl+Shift+↑/↓ |                                            |                                    |
| 函数上移 |                | Pull Members Up                            |                                    |
| 搬移函数 | F6             | Move Instance Method                       | 使用快捷键需要先将方法变为静态方法 |