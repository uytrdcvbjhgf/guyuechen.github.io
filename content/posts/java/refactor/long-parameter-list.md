+++
title = '代码坏味道之过长参数列表 (Long Parameter List)'
date = 2024-09-19T18:54:54+08:00
categories = ['java']
tags = ['refactor']
+++

**定义**

方法的入参过多，或存在不必要的参数

**影响**

- 方法不易被理解、使用，方法签名容易不稳定，不易维护

**改进目标**

- 去除多余参数，合并部分参数，提升方法签名稳定性

**方法**

- 以查询取代参数
- 保持对象完整
- 引入参数对象
- 函数组合成类
- 移除标记参数

> 案例


**代码背景**

- 计算某表演项目的票价；
- 只有符合年龄要求才可以购买；
- 儿童票5折，学生可以打9折，二者取最小；

**症状/问题**

方法入参过多，该问题的具体情况有：

- 某几个入参有关联性
- 某几个入参是一个对象的部分字段
- 某些入参可通过其他入参计算得到
- 函数逻辑都是针对某个入参对象属性的加工
- 某些入参属于标记，用于控制代码逻辑

```java
public class TicketInfo {
    private final double baseDiscount;

    public TicketInfo(double baseDiscount) {
        this.baseDiscount = baseDiscount;
    }

    /**
     * 获取票据信息
     * 
     * @param name 姓名
     * @param age 年龄
     * @param isChild 是否儿童
     * @param isStudent 是否学生
     * @param ageFloor 年龄上限
     * @param ageCeiling 年龄下限
     * @param performance 演出信息
     * @param basicPrice 基本票价
     * @return 票据信息
     */
    public String getTicketInfo(String name, int age, boolean isChild, boolean isStudent, int ageFloor, int ageCeiling,
        Performance performance, double basicPrice) {
        if ((age < ageFloor || age > ageCeiling)) {
            throw new IllegalArgumentException("age is out of valid range, cannot buy ticket!");
        }

        return getPerformanceInfo(performance)
            + getConsumerInfo(name, age, isStudent, isChild)
            + getPriceInfo(isChild, isStudent, basicPrice);
    }

    private String getPriceInfo(boolean isChild, boolean isStudent, double basicPrice) {
        final double discount = getDiscount(isStudent, isChild);
        final double ticketPrice = getTicketPrice(discount, basicPrice);
        return "priceInfo" + Constant.LINE_SEPARATOR
            + "\tprice: " + ticketPrice + Constant.LINE_SEPARATOR
            + "\tdiscount: " + discount + Constant.LINE_SEPARATOR;
    }

    private double getDiscount(boolean isStudent, boolean isChild) {
        double childDiscount = calculateDiscount("Child", isChild, isStudent);
        double studentDiscount = calculateDiscount("Student", isChild, isStudent);
        return BigDecimal.valueOf(Math.min(childDiscount, studentDiscount))
            .setScale(2, BigDecimal.ROUND_HALF_UP)
            .doubleValue();
    }

    private double calculateDiscount(String discountType, boolean isChild, boolean isStudent) {
        if ("Child".equals(discountType) && isChild) {
            return 0.5;
        }
        if ("Student".equals(discountType) && isStudent) {
            return 0.9 * baseDiscount;
        }
        return baseDiscount;
    }

    private double getTicketPrice(double discount, double basicPrice) {
        return BigDecimal.valueOf(discount * basicPrice).setScale(2, BigDecimal.ROUND_HALF_UP).doubleValue();
    }

    private String getConsumerInfo(String name, int age, boolean isStudent, boolean isChild) {
        return "consumerInfo" + Constant.LINE_SEPARATOR
            + "\tname: " + name + Constant.LINE_SEPARATOR
            + "\tage: " + age + Constant.LINE_SEPARATOR
            + "\tisStudent: " + isStudent + Constant.LINE_SEPARATOR
            + "\tisChild: " + isChild + Constant.LINE_SEPARATOR;
    }

    private String getPerformanceInfo(Performance performance) {
        return "playInfo" + Constant.LINE_SEPARATOR
            + "\tplayName: " + performance.getPlayName() + Constant.LINE_SEPARATOR
            + "\tplayType: " + performance.getPlayType() + Constant.LINE_SEPARATOR
            + "\tdate: " + performance.getPlayDate() + Constant.LINE_SEPARATOR;
    }
}
```

> 改进手法：移动函数至适合的类、移除标记参数


```java
public class TicketInfo {
    private final double baseDiscount;

    public TicketInfo(double baseDiscount) {
        this.baseDiscount = baseDiscount;
    }

    /**
     * 获取票据信息
     *
     * @param consumer 客户信息
     * @param performance 演出信息
     * @param ageLimit 年龄限制
     * @return 票据信息
     */
    public String getTicketInfo(Consumer consumer, Performance performance, AgeLimit ageLimit) {
        ageLimit.checkAge(consumer.getAge());

        return performance.getPerformanceInfo()
            + consumer.getConsumerInfo()
            + getPriceInfo(consumer, performance);
    }

    private String getPriceInfo(Consumer consumer, Performance performance) {
        final double discount = getDiscount(consumer);
        final double ticketPrice = getTicketPrice(discount, performance.getBasicPrice());
        return "priceInfo" + Constant.LINE_SEPARATOR
            + "\tprice: " + ticketPrice + Constant.LINE_SEPARATOR
            + "\tdiscount: " + discount + Constant.LINE_SEPARATOR;
    }

    private double getDiscount(Consumer consumer) {
        double childDiscount = calculateChildDiscount(consumer);
        double studentDiscount = calculateStudentDiscount(consumer);
        return BigDecimal.valueOf(Math.min(childDiscount, studentDiscount))
            .setScale(2, BigDecimal.ROUND_HALF_UP)
            .doubleValue();
    }

    private double calculateChildDiscount(Consumer consumer) {
        return consumer.isChild() ? 0.5 : baseDiscount;
    }

    private double calculateStudentDiscount(Consumer consumer) {
        return consumer.isStudent() ? 0.9 * baseDiscount : baseDiscount;
    }

    private double getTicketPrice(double discount, double basicPrice) {
        return BigDecimal.valueOf(discount * basicPrice).setScale(2, BigDecimal.ROUND_HALF_UP).doubleValue();
    }
}
```

> 操作手法

| 操作         | 快捷键（推荐）      | Ctrl+Alt+Shift+T（或：鼠标右键“Refactor”） | 注意                     |
| ------------ | ------------------- | ------------------------------------------ | ------------------------ |
| 提炼函数     | Ctrl+Alt+M          | Extract Method                             |                          |
| 搬移函数     | F6                  | Move Instance Method                       | 需要先将方法变为静态方法 |
| 内联方法     | Ctrl+Atl+N          | Inline Method                              |                          |
| 提取参数对象 | Ctrl+Alt+P          | Parameter Object                           |                          |
| 添加入参     | Ctrl+F6/ Alt+Enter  | Change Signature                           |                          |
| 删除无用入参 | Alt+Del / Alt+Enter |                                            |                          |
