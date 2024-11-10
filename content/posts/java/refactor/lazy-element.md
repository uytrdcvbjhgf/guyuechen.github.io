+++
title = '代码坏味道之冗赘的元素 (Lazy Element)'
date = 2024-10-13T18:27:10+08:00
categories = ['java']
tags = ['refactor']
+++

**定义**

冗赘的元素主要包括：由于过度设计或在代码演进过程中，产生的冗余、废弃或不足以独立承担其职责的类、方法、变量等

**影响**

- 代码不简洁，存在多余的元素，造成在维护时无用修改，难以维护，影响代码的可读性。

**改进目标**

- 消除冗赘的程序元素，提高代码的可读性、可维护性。

**方法**

- 内联函数或内联类
- 如果这个类处于一个 继承体系中，可以使用折叠继承体系
- 安全删除冗余元素

> 案例：问题代码

**代码背景**

- 简化的房屋信息处理模型，可为购房者提供房屋面积、单价、总价、首付款、房龄等相关信息
- 旧版本系统使用的房屋数据模型，当前业务中未使用
- 当前系统使用的房屋数据模型，包含单价、面积、竣工时间，以及对应的get方法
- 封装了房屋数据处理方法的类
- 专门处理大房子信息的类，设计之初曾拥有很多职责，演进过程中其他功能逐渐删除，当前只剩判断是否是大房子的方法
  ![](https://raw.githubusercontent.com/guyuechen/gallery/main/img/32a3667cf4ce4cfd804efe5ec45ce255.svg)

**症状/问题**

- 存在废弃或冗余的代码，会增大阅读和维护成本，包括： 
  - 存在旧版系统中使用的类、方法、字段，当前版本既然已确定不再使用，就应当及时删除；
  - 出于对“未来可能使用”的考虑引入的参数，但当前实际代码中并不会使用，应当删除，避免歧义。
- 类/方法过于简单，不足以独立承担业务所需的职责，使不必要的调用链变长，业务不内聚，包括： 
  - 单纯的数据类HouseData，无状态信息，除了给House提供需要操作的完整数据外，无其他任何用途；
  - 方法名和方法体几乎一模一样，没有存在的价值。
- 设计之初的继承体系，在演进过程中逐渐退化，当前仅剩的父类或子类不再有独立的价值，仅会增加维护负担： 
  - House仅存在BigHouse一个实现类，且BigHouse中除了一个简单的bool方法外，没有其他任何业务特性，没有体现出继承体系的价值。

**重构目标**

- 删除冗余的代码，降低维护成本
- 使用内联，消除不足以独立承担职责的类/方法等，减少委托，使代码更简洁，对象更富血，功能更内聚
- 合并子类和父类，消除继承关系，降低维护成本

```java
/**
 * 房屋信息处理
 */
public class House {
    private static final double FIRST_HOUSE_PAY_RATE = 0.35;

    private static final double NOT_FIRST_HOUSE_PAY_RATE = 0.7;

    /**
     * 房屋信息数据
     */
    protected final HouseData houseData;

    // private HouseDataOld houseDataOld;

    public House(HouseData houseData) {
        this.houseData = houseData;
    }

    /**
     * 计算房屋总价
     * 
     * @param tax 税率
     * @return 总价
     */
    public double getTotalPrice(double tax) {
        return houseData.getSquare() * houseData.getUnitPrice() * (1 + tax);
    }

    /**
     * 计算购房首付款
     * 
     * @param isFirstHouse 是否首套房
     * @param tax 税率
     * @param buyerSalary 购房者工资
     * @return 购房首付款
     */
    public double getDownPayment(boolean isFirstHouse, double tax, double buyerSalary) {
        return isFirstHouse ? FIRST_HOUSE_PAY_RATE * getTotalPrice(tax) : NOT_FIRST_HOUSE_PAY_RATE * getTotalPrice(tax);
    }

    /**
     * 计算房龄
     * 
     * @return 房龄
     */
    public int calculateHouseAge() {
        // return doCalculateHouseAgeOld();
        return doCalculateHouseAge();
    }

    /**
     * 获取房屋面积
     * 
     * @return 房屋面积
     */
    public double getSquare() {
        return houseData.getSquare();
    }

    /**
     * 获取房屋单价
     * 
     * @return 单价
     */
    public double getUnitPrice() {
        return houseData.getUnitPrice();
    }

    private int doCalculateHouseAge() {
        final int currentYear = Calendar.getInstance().get(Calendar.YEAR);
        return currentYear - houseData.getCompletionDate().get(Calendar.YEAR);
    }

    private int doCalculateHouseAgeOld() {
        int currentYear = new Date().getYear();
        // 以前曾经使用过下面的方式计算房龄，未来需要时可取用
        // return currentYear - houseDataOld.getBuildYear();
        return 0;
    }
}
```

```java
/**
 * 大户型
 */
public class BigHouse extends House {
    private static final int BIG_HOUSE_AREA = 140;

    public BigHouse(HouseData houseData) {
        super(houseData);
    }

    /**
     * 是否是大户型
     * 
     * @return 是否是大户型
     */
    public boolean isBigHouse() {
        return houseData.getSquare() > BIG_HOUSE_AREA;
    }
}
```

```java
/**
 * 房屋信息数据模型
 */
public class HouseData {
    private final double square;

    private final double unitPrice;

    private final Calendar completionDate;

    public HouseData(double square, double unitPrice, Calendar completionDate) {
        this.square = square;
        this.unitPrice = unitPrice;
        this.completionDate = completionDate;
    }

    public double getSquare() {
        return square;
    }

    public double getUnitPrice() {
        return unitPrice;
    }

    public Calendar getCompletionDate() {
        return completionDate;
    }
}
```

```java
/**
 * 旧版本使用的房屋信息数据模型
 */
public class HouseDataOld {
    private final double square;

    private final double unitPrice;

    private final int buildYear;

    public HouseDataOld(double square, double unitPrice, int buildYear) {
        this.square = square;
        this.unitPrice = unitPrice;
        this.buildYear = buildYear;
    }

    public double getSquare() {
        return square;
    }

    public double getUnitPrice() {
        return unitPrice;
    }

    public int getBuildYear() {
        return buildYear;
    }
}
```

> 改进手法：安全删除、内联类/函数、折叠继承体系

```java
public class House {
    private static final int BIG_HOUSE_AREA = 140;

    private static final double FIRST_HOUSE_PAY_RATE = 0.35;

    private static final double NOT_FIRST_HOUSE_PAY_RATE = 0.7;

    private final double square;

    private final double unitPrice;

    private final Calendar completionDate;

    public House(double square, double unitPrice, Calendar completionDate) {
        this.square = square;
        this.unitPrice = unitPrice;
        this.completionDate = completionDate;
    }

    /**
     * 是否是大户型
     * 
     * @return 是否是大户型
     */
    public boolean isBigHouse() {
        return square > BIG_HOUSE_AREA;
    }

    /**
     * 计算房屋总价
     *
     * @param tax 税率
     * @return 总价
     */
    public double getTotalPrice(double tax) {
        return square * unitPrice * (1 + tax);
    }

    /**
     * 计算购房首付款
     *
     * @param isFirstHouse 是否首套房
     * @param tax 税率
     * @return 购房首付款
     */
    public double getDownPayment(boolean isFirstHouse, double tax) {
        return isFirstHouse ? FIRST_HOUSE_PAY_RATE * getTotalPrice(tax) : NOT_FIRST_HOUSE_PAY_RATE * getTotalPrice(tax);
    }

    /**
     * 计算房龄
     *
     * @return 房龄
     */
    public int calculateHouseAge() {
        // return doCalculateHouseAgeOld();
        final int currentYear = Calendar.getInstance().get(Calendar.YEAR);
        return currentYear - completionDate.get(Calendar.YEAR);
    }

    /**
     * 获取房屋面积
     *
     * @return 房屋面积
     */
    public double getSquare() {
        return square;
    }

    /**
     * 获取房屋单价
     *
     * @return 单价
     */
    public double getUnitPrice() {
        return unitPrice;
    }
}
```

> 操作手法

| 操作       | 快捷键（推荐） | Ctrl+Alt+Shift+T（或：鼠标右键“Refactor”） |
| ---------- | -------------- | ------------------------------------------ |
| 封装变量   |                | Encapsulate Fields                         |
| 提炼参数   | Ctrl+Atl+P     | Introduce Parameter                        |
| 提炼字段   | Ctrl+Atl+F     | Introduce Field                            |
| 用内联移除 | Ctrl+Shift+N   | Inline xxx                                 |
| 安全删除   | Alt+Del        | Safe Delete                                |

补充：
代码上的废弃和冗余，IDEA-Analyze-Inspect Code 可辅助识别未使用的类、函数、变量、参数
设计上的冗赘元素，需要结合人工经验进行排查
