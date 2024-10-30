+++
title = '代码坏味道之中间人 (Middle Man)'
date = 2024-10-13T18:32:55+08:00
categories = ['java']
tags = ['refactor']
+++

**定义**

一种过度使用委托（某类中一半以上方 法都委托给其他类）的代码

**影响**

- 当需求发生某些变化的时候，作为中间人的代码总会被牵连一并修改，代码越发臃肿

**改进目标**

- 减少委托

**方法**

- 移除中间人
- 内联

> 案例1：问题代码

**代码背景**

- 描述了部门及员工的数据模型
- 员工和部门信息，以员工为入口可以获取 当前部门信息

**症状/问题**

- 通过中间人委托调用department里面的方法，且占department类中方法数目超过一半。
- 如果这里增加一个字段，则需要在 employee类中一并添加委托，修改成本较 大。同时employee类会越来越臃肿。

**重构目标**

- 减少Employee中的委托

```java
/**
 * 员工个人信息
 */
public class Employee {
    private String name;

    private int age;

    private Department department;

    /**
     * 获取人员姓名
     *
     * @return String
     */
    public String getName() {
        return name;
    }

    /**
     * 获取年龄信息
     *
     * @return int
     */
    public int getAge() {
        return age;
    }

    /**
     * 获取部门ID
     *
     * @return String
     */
    public String getDepartmentId() {
        return department.getId();
    }

    /**
     * 获取部门交易编号
     *
     * @return String
     */
    public String getDepartmentChargeCode() {
        return department.getChargeCode();
    }

    /**
     * 获取部门领导信息
     * 
     * @return String
     */
    public String getDepartmentManager() {
        return department.getManager();
    }

    /**
     * 获取部门类型
     *
     * @return String
     */
    public String getDepartmentType() {
        return department.getType();
    }

    /**
     * 获取部门人数
     * 
     * @return String
     */
    public String getDepartmentTotalEmployee() {
        return department.getTotalEmployee();
    }

    /**
     * 获取部门职能信息
     *
     * @return String
     */
    public String getDepartmentFunction() {
        return department.getFunction();
    }

    /**
     * 获取部门位置
     *
     * @return String
     */
    public String getDepartmentLocation() {
        return department.getLocation();
    }

    public void setDepartment(Department department) {
        this.department = department;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setAge(int age) {
        this.age = age;
    }
}
```

```java
/**
 * 部门信息
 */
public class Department {
    private String id;

    private String chargeCode;

    private String manager;

    private String type;

    private String totalEmployee;

    private String function;

    private String location;

    /**
     * 获取部门ID
     *
     * @return String
     */
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    /**
     * 获取部门交易编号
     *
     * @return String
     */
    public String getChargeCode() {
        return chargeCode;
    }

    public void setChargeCode(String chargeCode) {
        this.chargeCode = chargeCode;
    }

    /**
     * 获取部门领导
     *
     * @return String
     */
    public String getManager() {
        return manager;
    }

    public void setManager(String manager) {
        this.manager = manager;
    }

    /**
     * 获取部门类型
     *
     * @return String
     */
    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    /**
     * 获取部门人数
     *
     * @return String
     */
    public String getTotalEmployee() {
        return totalEmployee;
    }

    public void setTotalEmployee(String totalEmployee) {
        this.totalEmployee = totalEmployee;
    }

    /**
     * 获取部门职能
     *
     * @return String
     */
    public String getFunction() {
        return function;
    }

    public void setFunction(String function) {
        this.function = function;
    }

    /**
     * 获取部门位置
     *
     * @return String
     */
    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }
}
```

> 改进手法

```java
/**
 * 员工个人信息
 */
public class Employee {
    private String name;

    private int age;

    private Department department;

    /**
     * 获取人员姓名
     *
     * @return String
     */
    public String getName() {
        return name;
    }

    /**
     * 获取年龄信息
     *
     * @return int
     */
    public int getAge() {
        return age;
    }

    public void setDepartment(Department department) {
        this.department = department;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setAge(int age) {
        this.age = age;
    }

    public Department getDepartment() {
        return department;
    }
}
```

> 案例2：问题代码

**代码背景**

- 一个快递披萨的场景，当运送时间大于30分钟则需要赔付2元钱，小于30分钟，不赔付

**症状/问题**

- “不干实事”的方法：只返回属性，可以inline

**重构目标**

- inline

```java
/**
 * 披萨配送赔付信息
 */
public class PizzaDelivery {
    private int timeOfLateDeliveries;

    /**
     * 获取赔付费用
     *
     * @return int
     */
    public int getCompensation() {
        return getTimeOfLateDeliveries() > 30 ? 2 : 0;
    }

    public void setTimeOfLateDeliveries(int timeOfLateDeliveries) {
        this.timeOfLateDeliveries = timeOfLateDeliveries;
    }

    /**
     * 获取延迟时间
     *
     * @return int
     */
    private int getTimeOfLateDeliveries() {
        return timeOfLateDeliveries;
    }
}
```

> 改进手法

```java
/**
 * 披萨配送赔付信息
 */
public class PizzaDelivery {
    private int timeOfLateDeliveries;

    /**
     * 获取赔付费用
     *
     * @return int
     */
    public int getCompensation() {
        return timeOfLateDeliveries > 30 ? 2 : 0;
    }

    public void setTimeOfLateDeliveries(int timeOfLateDeliveries) {
        this.timeOfLateDeliveries = timeOfLateDeliveries;
    }

}
```

> 操作手法

| 操作                                                       | 快捷键（推荐） | Ctrl+Alt+Shift+T（或：鼠标右键“Refactor”） |
| ---------------------------------------------------------- | -------------- | ------------------------------------------ |
| 移除中间人（需要安装Idea插件Additional Java Refactorings） |                | Remove Middleman                           |
| 内联                                                       | Ctrl+Alt+N     | Inline Method                              |

补充：IDEA-Analyze-Inspect Code 可辅助识别中间人问题
