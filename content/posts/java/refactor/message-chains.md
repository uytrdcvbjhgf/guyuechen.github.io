+++
title = '代码坏味道之过长的消息链 (Message Chains)'
date = 2024-10-13T18:31:35+08:00
categories = ['java']
tags = ['refactor']
+++

**定义**

如果你看到用户向一个对象请求另一个对象，然后再向后者请求另一个对象， 然后再请求另一个对象……这就是消息链。在实际代码中你看到的可能是一长串取值函数或一长串临时变量。

**影响**

- 客户端代码将与查找过程中的调用结构紧密耦合。一旦对象间的关系发生任何变化，客户端就不得不做出相应修改。

**改进目标**

- 针对过长消息链，可以用这时候应该使用隐藏委托关系，把调用链这种耦合关系放在中间人中。

**方法**

- 观察清楚消息链的调用业务逻辑；
- 通过提炼函数把所有相同调用放在一个函数中；
- 搬移函数到对应的中间人类中（新增或者使用以前的类）；
- 替换这个函数到之前调用链，隐藏委托关系。

> 案例：问题代码

**代码背景**

- 一个客户端期望能访问一个人的部门地址的门牌号和具体地址 。普通实现如果采用消息链调用的方式，调用方式为 ： person.getDepartment().getAddress().getStreet() .getStreetName()

**症状/问题**

- InformationClient会知道整个Person依赖关系和组织实现，形成耦合关系。
- 消息链太长导致代码不易重构，不易修改。如果Person内部依赖关系或数据结构进行调整 、重构，那么外部调用链同时被修改。

**重构目标**

- InformationClient直接访问Person就能得出Street对象（这里是部门对象）
- 人、部门、地址、街道整个依赖关系对client透明
- 后面如果发生变化和重构，外部无感知
  ![](https://raw.githubusercontent.com/guyuechen/gallery/main/img/518b5b6521f9fa87ef2d7ae43ef81223.svg)
  
```java
/**
 * 信息服务类，作为代理解决
 */
public class InformationClient {
  /**
    * 获取员工所在的部门地址街道名称
    *
    * @param person 当前员工
    * @return 街道名称
    */
  public String getServerStreetName(Person person) {
    return person.getDepartment().getAddress().getStreet().getStreetName();
  }

  /**
    * 获取员工所在的部门地址街道编号
    *
    * @param person 当前员工
    * @return 街道编号
    */
  public Integer getServerStreetNo(Person person) {
    return person.getDepartment().getAddress().getStreet().getStreetNo();
  }
}

/**
 * 一个员工个人信息， 包含部门{@link Department}信息。
 */
public class Person {
    /** 部门信息 */
    private Department department;

    public Person(Department department) {
        this.department = department;
    }

    public Department getDepartment() {
        return department;
    }
}
```

> 改进手法：提炼/搬移函数、隐藏委托关系

改进前：Client感知到了整个内部逻辑，形成依赖
改进后：隐藏了内部数据结构依赖关系，使用Person作为“中间人”，为Client屏蔽委托关系

```java
/**
 * 信息服务类，作为代理解决
 */
public class InformationClient {
    /**
     * 获取员工所在的部门地址街道名称
     *
     * @param person 当前员工
     * @return 街道名称
     */
    public String getServerStreetName(Person person) {
        return person.getDepartmentStreet().getStreetName();
    }

    /**
     * 获取员工所在的部门地址街道编号
     *
     * @param person 当前员工
     * @return 街道编号
     */
    public Integer getServerStreetNo(Person person) {
        return person.getDepartmentStreet().getStreetNo();
    }
}

/**
 * 一个员工个人信息， 包含部门{@link Department}信息。
 */
public class Person {
    /** 部门信息 */
    private Department department;

    public Person(Department department) {
        this.department = department;
    }

    public Department getDepartment() {
        return department;
    }

    public Street getDepartmentStreet() {
        return getDepartment().getAddress().getStreet();
    }
}
```

> 操作手法

| 操作     | 快捷键（推荐） | Ctrl+Alt+Shift+T（或：鼠标右键“Refactor”） |
| -------- | -------------- | ------------------------------------------ |
| 提炼函数 | Ctrl + Alt + M | Extract Method                             |
| 移动函数 | F6             | Move Method                                |
| 重命名   | Shift + F6     | Rename                                     |


> 引申

过长的消息链到底是在说什么？到底有什么问题，为什么需要修改？**深模块 VS 浅模块**？

**深模块：**
最好的模块提供了强大的功能，又有着简单的接口。术语“深”可以用于描述这种模块。
可以从成本与收益的角度思考模块深度。模块提供的收益是它的功能。
模块的成本（从系统复杂度的角度考虑）是它的接口。接口代表了模块施加给系统其余部分的复杂度。接口越小而简单，它引入的复杂度就越少。 好的模块就是那些成本低收益高的模块。

**浅模块：**
就是模块内部暴露给外部调用或者使用，内部没有隐藏太多的逻辑，外部都能感知到内部的具体逻辑或者结构组织，或调用关系。
上述修改前的代码就是一个典型的浅模块的暴露和外部调用，外部是可以感知到内部实现的，是一种典型的不好的代码设计。

**最后：Classitis**
当今，深模块的价值并没有被广为接受。一般常识是类需要小，而不是深。学生被告知：类设计中最重要的事情是把大类拆分成更小的类。
相似建议还包括：“要把方法行数大于N的方法分成多个方法”，有时候N甚至只有10这么小。这会导致大量的浅模块，增加系统的总复杂度。
极端的“类应该小”的做法是一种综合症的表现，这种症状可以被称为Classitis。
它源于一种错误思维：“类是好的，所以越多类越好”。
这种思想最终会导致系统层面积累了巨大的复杂度，程序风格也会变得啰嗦。
