+++
title = '代码坏味道之数据泥团 (Data Clumps)'
date = 2024-10-13T18:21:13+08:00
categories = ['java']
tags = ['refactor']
+++

**定义**

总是成块出现的相同数据项，包括多个类中相同的字段、多个方法签名中相同的参数等

**影响**

- 成块出现的重复参数过多，影响阅读和理解，难维护

**改进目标**

- 减少相同的字段及入参，缩短入参列，简化函数调用

**方法**

- 提炼类
- 引入参数对象
- 保持对象完整性

> 案例：问题代码


**代码背景**

- 一个人员信息管理类，包含了人员的姓名 、性别 、地址 等信息，以及人员的信息获取 、地址更新 、位置移动等相关处理方法

**症状/问题**

- 用户的名字 (firstName , lastName ) 和所在的位置 (provice , city, street) 是没有直接关联的数据，但都以基本类型罗列在一起，导致参数过长
- 成块的参数总是重复出现 (provice, city, street )

**重构目标**

- 简化函数调用
- 数据拆解成不同的类，并将各自行为与数据封装在一起

```java
/**
 * 用户信息
 *
 * @author l00631077
 * @since 2021-11-03
 */
public class PersonInfoManage {
    private String firstName;

    private String lastName;

    private Gender gender;

    private String province;

    private String city;

    private String street;

    public PersonInfoManage(String firstName, String lastName, Gender gender, String province, String city,
        String street) {
        // …… do something. eg:check is legal
        this.firstName = firstName;
        this.lastName = lastName;
        this.gender = gender;
        this.province = province;
        this.city = city;
        this.street = street;
    }

    /**
     * 按打印格式获取姓名
     * 
     * @return 打印格式的姓名
     */
    public String getName() {
        // …… do something. eg: auth
        return "First Name: " + firstName + Constant.LINE_SEPARATOR
            + "Last Name: " + lastName;
    }

    /**
     * 按打印格式获取性别
     *
     * @return 性别
     */
    public Gender getGender() {
        return gender;
    }

    /**
     * 按打印格式获取地址信息
     * 
     * @return 地址信息
     */
    public String getAddress() {
        // …… do something. eg: auth
        return "Province: " + province + Constant.LINE_SEPARATOR
            + "City: " + city + Constant.LINE_SEPARATOR
            + "Street: " + street;
    }

    /**
     * 更新地址
     * 
     * @param province 省
     * @param city 市
     * @param street 街道
     */
    public void updateAddress(String province, String city, String street) {
        // …… do something. eg: auth, check……
        this.province = province;
        this.city = city;
        this.street = street;

        doNotify(province, city);
    }

    private void doNotify(String province, String city) {
        // …… do something. eg: notify others
        System.out.println("do something notify " + province + " " + city);
    }

    /**
     * 按打印格式获取搬移记录
     * 
     * @param newProvince 新省份
     * @param newCity 新城市
     * @param newStreet 新街道
     * @return 搬移记录
     */
    public String moveToAnotherPlace(String newProvince, String newCity, String newStreet) {
        // …… do something. eg: some business……
        return "move from: " + Constant.LINE_SEPARATOR
            + "\t" + this.province + " " + this.city + " " + this.street + Constant.LINE_SEPARATOR
            + "to: " + Constant.LINE_SEPARATOR
            + "\t" + newProvince + " " + newCity + " " + newStreet;
    }
}
```

> 改进手法：提炼类


将名字和地址抽取为独立的类，拆解不同领域；通过搬移方法将函数组合成类，使不同领域的数据与各自行为封装在一起

> 改进手法：引入参数对象


通过引入参数对象、保持对象完整性，简化方法的入参，简化调用

> 改进手法：保持对象完整性


通过搬移方法将函数组合成类，使不同领域的数据与各自行为封装在一起

```java
/**
 * 用户信息
 *
 * @author l00631077
 * @since 2021-11-03
 */
public class PersonInfoManage {

    private final Name name;

    private final Gender gender;

    private final Address address = new Address();

    public PersonInfoManage(Name name, Gender gender, Address address) {
        // …… do something. eg:check is legal
        this.name = name;
        this.gender = gender;
        this.address.update(address);
    }

    /**
     * 按打印格式获取姓名
     * 
     * @return 打印格式的姓名
     */
    public String getName() {
        // …… do something. eg: auth
        return name.printName();
    }

    /**
     * 按打印格式获取性别
     *
     * @return 性别
     */
    public Gender getGender() {
        return gender;
    }

    /**
     * 按打印格式获取地址信息
     * 
     * @return 地址信息
     */
    public String getAddress() {
        // …… do something. eg: auth
        return address.printAddress();
    }

    /**
     * 更新地址
     *
     * @param newAddress
     */
    public void updateAddress(Address newAddress) {
        // …… do something. eg: auth, check……
        address.update(newAddress);

        newAddress.doNotify();
    }

    /**
     * 按打印格式获取搬移记录
     *
     * @param newAddress@return 搬移记录
     */
    public String moveToAnotherPlace(Address newAddress) {
        // …… do something. eg: some business……
        return address.printMoveInfo(newAddress);
    }

}
```

```java
// 提取出的新类
public class Name {
    private final String firstName;

    private final String lastName;

    public Name(String firstName, String lastName) {
        this.firstName = firstName;
        this.lastName = lastName;
    }

    public String printName() {
        return "First Name: " + firstName + Constant.LINE_SEPARATOR + "Last Name: "
            + lastName;
    }
}
```

```java
// 提取出的新类
public class Address {
    private String province;

    private String city;

    private String street;

    public Address() {
    }

    /**
     * @param province 省
     * @param city 市
     * @param street 街道
     */
    public Address(String province, String city, String street) {
        this.province = province;
        this.city = city;
        this.street = street;
    }

    public String printAddress() {
        return "Province: " + province + Constant.LINE_SEPARATOR + "City: " + city
            + Constant.LINE_SEPARATOR + "Street: " + street;
    }

    public String printMoveInfo(Address newAddress) {
        return "move from: " + Constant.LINE_SEPARATOR + "\t" + province + " "
            + city + " " + street + Constant.LINE_SEPARATOR + "to: "
            + Constant.LINE_SEPARATOR + "\t" + newAddress.province + " " + newAddress.city + " "
            + newAddress.street;
    }

    public void update(Address newAddress) {
        this.province = newAddress.province;
        this.city = newAddress.city;
        this.street = newAddress.street;
    }

    public void doNotify() {
        // …… do something. eg: notify others
        System.out.println("do something notify " + province + " " + city);
    }
}
```

> 操作手法

| 操作                       | 快捷键（推荐） | Ctrl+Alt+Shift+T（或：鼠标右键“Refactor”） |
| -------------------------- | -------------- | ------------------------------------------ |
| 提炼类                     |                | Extract Delegate                           |
| 引入参数对象               |                | Introduce Parameter Object                 |
| 保持对象完整性（提炼函数） | Ctrl+Alt+M     | Extract Method                             |
| 保持对象完整性（内联）     | Ctrl+Alt+N     | Inline XXX                                 |
| 实例方法搬移               | F6             | Move Instance Method                       |
| 抽取变量/字段/参数         | Ctrl+Alt+V/F/P | Introduce Variable/Field/Parameter         |
