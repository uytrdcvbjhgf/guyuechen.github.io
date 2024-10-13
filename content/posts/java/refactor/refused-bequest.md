+++
title = '代码坏味道之被拒绝的遗赠 (Refused Bequest)'
date = 2024-10-13T18:40:05+08:00
categories = ['java']
tags = ['refactor']
+++

**定义**

对于某个子类，它只想继承基类的部分函数和数据，不需要基类提供的全部内容， 这些不需要的内容就成为了子类的负担

**影响**

- 这种坏味道通常影响并不大，但如果子类拒绝实现部分接口或者基类的方法只适用于某个子类特定的方法，就会对可维护、可扩展性等造成较大影响

**改进目标**

- 改进不合理的继承体系，使代码结构清晰、可控

**方法**

- 函数/字段下移，让超类只持有子类共享的东西
- 以委托取代超类/子类

> 案例1：问题代码


**代码背景**
![](https://gyc-pic-for-typora.oss-cn-shanghai.aliyuncs.com/img_for_typora/7ca64f57cc2a87fa6ef7d7ade9040876.svg)

- 描述了个人信息的数据模型
- 包含人员信息基类，以及老人、成人、孩子三个子类。老人、成 人、孩子类通过继承人员信息类获取相关信息，并实现、重写、 调用对应接口、方法等 
  - PersonInfo类的字段：人员相关信息，包括年龄、性别、身高、体重、基础退休工资、 退休了多少年、上班通勤时间等
  - PersonInfo类的calculateMonthlyPensionWage()、isReachSchoolAge() 计算每个月的养老金、以及是否达到上学年龄的接口
  - PersonInfo类的getXXXInfo() 分别获取儿童、成年人、老年人相关个人信息的方法
- 儿童Children、成年Adult和老年人Old子类，都实现了养老金计算、是否达到入学 年龄判断接口

**症状/问题**

子类通过继承父类，了解了过多超出自身需要的方法，也被迫实现了对自己无用的接口， 后续其他子类的扩展也都需要了解这些多余信息，严重影响了可扩展 、可维护性

- 父类中提供了isObese实现，但子类中都进行了重写，同时子类通过super，在父类方法中进行调用，导致调用关系复杂，理解难度较大，可读性较差
- Old类不需要PersonInfo中孩子和成年人信息，也不该实现isReachSchoolAge接口。
- Children不需要PersonInfo中成年人和老年 人的信息，也不应该实现calculateMonthlyPensionWage接口

**重构目标**

- 将每个子类特有的方法移到相应子类中（比如getChildInfo方法应该移到child中）
- 公共的行为统一抽取到父类中

```java
/**
 * @filename: PersonalInformation
 * @author: h30008445
 * @description: 用户个人信息
 * @remark: created by 黄刚/h30008445 at 2021/11/1
 */
public abstract class PersonInfo {
    /**
     * 姓名
     */
    protected final String name;

    /**
     * 年龄
     */
    protected final int age;

    /**
     * 身高
     */
    protected final double height;

    /**
     * 体重
     */
    protected final double weight;

    /**
     * 基本退休工资
     */
    protected final int basePensionWage;

    /**
     * 退休时间
     */
    protected final int retiredYears;

    /**
     * 通勤时间
     */
    protected final int commutingTimeEveryDay;

    public PersonInfo(String name, int age, double height, double weight, int basePensionWage, int retiredYears,
        int commutingTimeEveryDay) {
        this.name = name;
        this.age = age;
        this.height = height;
        this.weight = weight;
        this.basePensionWage = basePensionWage;
        this.retiredYears = retiredYears;
        this.commutingTimeEveryDay = commutingTimeEveryDay;
    }

    /**
     * 打印格式输出人员信息
     * 
     * @return 人员信息
     */
    public abstract String printInfo();

    /**
     * 计算每月养老工资
     *
     * @return 每月养老工资
     */
    public abstract int calculateMonthlyPensionWage();

    /**
     * 是否达到入学年龄
     * 
     * @return 是否达到入学年龄
     */
    public abstract boolean isReachSchoolAge();

    /**
     * 获取儿童信息
     * 
     * @return 儿童信息
     */
    protected String getChildInfo() {
        return "Name: " + name + Constant.LINE_SEPARATOR
            + "IsObese: " + isObese() + Constant.LINE_SEPARATOR
            + "IsReachSchoolAge: " + isReachSchoolAge();
    }

    /**
     * 获取成年人信息
     * 
     * @return 成年人信息
     */
    protected String getAdultInfo() {
        return "Name: " + name + Constant.LINE_SEPARATOR
            + "CommutingTimeEveryWeek: " + getCommutingTimeEveryWeek() + Constant.LINE_SEPARATOR
            + "IsObese: " + isObese();
    }

    /**
     * 获取老年人信息
     * 
     * @return 老年人信息
     */
    protected String getOldInfo() {
        return "Name: " + name + Constant.LINE_SEPARATOR
            + "IsObese: " + isObese() + Constant.LINE_SEPARATOR
            + "MonthlyPensionWage: " + calculateMonthlyPensionWage();
    }

    /**
     * 是否肥胖
     * 
     * @return 是否肥胖
     */
    protected boolean isObese() {
        return weight / (height * height) >= 25.0;
    }

    private int getCommutingTimeEveryWeek() {
        return commutingTimeEveryDay * 5;
    }
}
```

```java
/**
 * @filename: Children
 * @author: h30008445
 * @description: 儿童信息
 * @remark: created by 黄刚/h30008445 at 2021/11/1
 */
public class Children extends PersonInfo {
    public Children(String name, int age, double height, double weight, int basePensionWage, int retiredYears,
        int commutingTimeEveryDay) {
        super(name, age, height, weight, basePensionWage, retiredYears, commutingTimeEveryDay);
    }

    @Override
    public String printInfo() {
        return super.getChildInfo();
    }

    @Override
    public boolean isObese() {
        return weight / (height * height) >= 28.0;
    }

    @Override
    public int calculateMonthlyPensionWage() {
        return 0;
    }

    @Override
    public boolean isReachSchoolAge() {
        return age >= 6;
    }
}
```

```java
/**
 * @filename: Adult
 * @author: h30008445
 * @description: 成年人信息
 * @remark: created by 黄刚/h30008445 at 2021/11/1
 */
public class Adult extends PersonInfo {
    public Adult(String name, int age, double height, double weight, int basePensionWage, int retiredYears,
        int commutingTimeEveryDay) {
        super(name, age, height, weight, basePensionWage, retiredYears, commutingTimeEveryDay);
    }

    @Override
    public String printInfo() {
        return super.getAdultInfo();
    }

    @Override
    public boolean isObese() {
        return weight / (height * height) >= 25.0;
    }

    @Override
    public int calculateMonthlyPensionWage() {
        return 0;
    }

    @Override
    public boolean isReachSchoolAge() {
        return false;
    }
}
```

```java
/**
 * @filename: Old
 * @author: h30008445
 * @description: 老年人信息
 * @remark: created by 黄刚/h30008445 at 2021/11/1
 */
public class Old extends PersonInfo {
    public Old(String name, int age, double height, double weight, int basePensionWage, int retiredYears,
        int commutingTimeEveryDay) {
        super(name, age, height, weight, basePensionWage, retiredYears, commutingTimeEveryDay);
    }

    @Override
    public String printInfo() {
        return super.getOldInfo();
    }

    @Override
    public boolean isObese() {
        return weight / (height * height) >= 24.0;
    }

    @Override
    public int calculateMonthlyPensionWage() {
        return (int) (basePensionWage * Math.pow(1.1, retiredYears));
    }

    @Override
    public boolean isReachSchoolAge() {
        return false;
    }
}
```

> 改进手法：函数/字段下移


```java
/**
 * @filename: PersonalInformation
 * @author: h30008445
 * @description: 用户个人信息
 * @remark: created by 黄刚/h30008445 at 2021/11/1
 */
public abstract class PersonInfo {
    /**
     * 姓名
     */
    protected final String name;

    /**
     * 身高
     */
    protected final double height;

    /**
     * 体重
     */
    protected final double weight;

    public PersonInfo(String name, double height, double weight) {
        this.name = name;
        this.height = height;
        this.weight = weight;
    }

    /**
     * 打印格式输出人员信息
     * 
     * @return 人员信息
     */
    public abstract String printInfo();

    protected boolean isObese(double rate) {
        return weight / (height * height) >= rate;
    }
}
```

```java
/**
 * @filename: Children
 * @author: h30008445
 * @description: 儿童信息
 * @remark: created by 黄刚/h30008445 at 2021/11/1
 */
public class Children extends PersonInfo {
    /**
     * 年龄
     */
    protected final int age;

    public Children(String name, int age, double height, double weight) {
        super(name, height, weight);
        this.age = age;
    }

    @Override
    public String printInfo() {
        return "Name: " + name + Constant.LINE_SEPARATOR
            + "IsObese: " + isObese(28) + Constant.LINE_SEPARATOR
            + "IsReachSchoolAge: " + isReachSchoolAge();
    }

    public boolean isReachSchoolAge() {
        return age >= 6;
    }
}
```

```java
/**
 * @filename: Adult
 * @author: h30008445
 * @description: 成年人信息
 * @remark: created by 黄刚/h30008445 at 2021/11/1
 */
public class Adult extends PersonInfo {

    /**
     * 通勤时间
     */
    protected final int commutingTimeEveryDay;

    public Adult(String name, double height, double weight, int commutingTimeEveryDay) {
        super(name, height, weight);
        this.commutingTimeEveryDay = commutingTimeEveryDay;
    }

    @Override
    public String printInfo() {
        return "Name: " + name + Constant.LINE_SEPARATOR
            + "CommutingTimeEveryWeek: " + getCommutingTimeEveryWeek() + Constant.LINE_SEPARATOR
            + "IsObese: " + isObese(25);
    }

    private int getCommutingTimeEveryWeek() {
        return commutingTimeEveryDay * 5;
    }
}
```

```java
/**
 * @filename: Old
 * @author: h30008445
 * @description: 老年人信息
 * @remark: created by 黄刚/h30008445 at 2021/11/1
 */
public class Old extends PersonInfo {
    /**
     * 基本退休工资
     */
    protected final int basePensionWage;

    /**
     * 退休时间
     */
    protected final int retiredYears;

    public Old(String name, int age, double height, double weight, int basePensionWage, int retiredYears,
        int commutingTimeEveryDay) {
        super(name, height, weight);
        this.basePensionWage = basePensionWage;
        this.retiredYears = retiredYears;
    }

    @Override
    public String printInfo() {
        return "Name: " + name + Constant.LINE_SEPARATOR
            + "IsObese: " + isObese(24) + Constant.LINE_SEPARATOR
            + "MonthlyPensionWage: " + calculateMonthlyPensionWage();
    }

    public int calculateMonthlyPensionWage() {
        return (int) (basePensionWage * Math.pow(1.1, retiredYears));
    }
}
```

> 案例2：问题代码


**代码背景**

- 案例包含个人信息和平台账户信息两个类， 用于对外提供账户相关信息
- 案例中平台账户信息类和个人信息类是继承关系。且分别提供了平台账户类作为子类和超类的两种情况。

**症状/问题**

- Person和Platform应当属于两个体系，之间不应该通过继承来进行信息的访问和交换

**重构目标**

- 以委托取代子类或超类，消除被拒绝的遗赠

```java
/**
 * @filename: PersonalInformation
 * @author: h30008445
 * @description: 用户个人信息
 * @remark: created by 黄刚/h30008445 at 2021/11/1
 */
public class PersonalInformation extends PlatAccountInformation {
    private String name;

    private int age;

    private String mobile;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }

    public String getMobile() {
        return mobile;
    }

    public void setMobile(String mobile) {
        this.mobile = mobile;
    }
}
```

```java
/**
 * @filename: UserInformation
 * @author: h30008445
 * @description: 平台用户所需信息
 * @remark: created by 黄刚/h30008445 at 2021/11/1
 */
public class PlatAccountInformation {
    private String account;

    private String password;

    private Timestamp loginTime;

    public String getAccount() {
        return account;
    }

    public void setAccount(String account) {
        this.account = account;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Timestamp getLoginTime() {
        return loginTime;
    }

    public void setLoginTime(Timestamp loginTime) {
        this.loginTime = loginTime;
    }
}
```

```java
/**
 * @filename: ClientView
 * @author: h30008445
 * @description: 用户平台展示类
 * @remark: created by 黄刚/h30008445 at 2021/11/1
 */
public class PublicPlatView {
    /**
     * 获取平台所需信息
     *
     * @param personalInformation 平台用户信息
     * @return map 平台用户view信息
     */
    public Map<String, Object> getPublicPlatView(PersonalInformation personalInformation) {
        Map<String, Object> viewMap = new HashMap<>();
        viewMap.put("Account", personalInformation.getAccount());
        viewMap.put("Name", personalInformation.getName());
        viewMap.put("Mobile", personalInformation.getMobile());
        viewMap.put("LoginTime", personalInformation.getLoginTime());
        return viewMap;
    }
}
```

> 改进手法：委托


```java
public class PersonalInformation {
    String name;

    int age;

    String mobile;

    public PersonalInformation() {
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }

    public String getMobile() {
        return mobile;
    }

    public void setMobile(String mobile) {
        this.mobile = mobile;
    }
}
```

```java
/**
 * @filename: PersonalInformation
 * @author: h30008445
 * @description: 用户个人信息
 * @remark: created by 黄刚/h30008445 at 2021/11/1
 */
public class PlatAccountInformation {
    private final PersonalInformation personalInformation = new PersonalInformation();

    private String account;

    private String password;

    private Timestamp loginTime;

    public String getName() {
        return personalInformation.getName();
    }

    public void setName(String name) {
        personalInformation.setName(name);
    }

    public int getAge() {
        return personalInformation.getAge();
    }

    public void setAge(int age) {
        personalInformation.setAge(age);
    }

    public String getMobile() {
        return personalInformation.getMobile();
    }

    public void setMobile(String mobile) {
        personalInformation.setMobile(mobile);
    }

    public String getAccount() {
        return account;
    }

    public void setAccount(String account) {
        this.account = account;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Timestamp getLoginTime() {
        return loginTime;
    }

    public void setLoginTime(Timestamp loginTime) {
        this.loginTime = loginTime;
    }
}
```

```java
/**
 * @filename: ClientView
 * @author: h30008445
 * @description: 用户平台展示类
 * @remark: created by 黄刚/h30008445 at 2021/11/1
 */
public class PublicPlatView {
    /**
     * 获取平台所需信息
     *
     * @param platAccountInformation 平台用户信息
     * @return map 平台用户view信息
     */
    public Map<String, Object> getPublicPlatView(PlatAccountInformation platAccountInformation) {
        Map<String, Object> viewMap = new HashMap<>();
        viewMap.put("Account", platAccountInformation.getAccount());
        viewMap.put("Name", platAccountInformation.getName());
        viewMap.put("Mobile", platAccountInformation.getMobile());
        viewMap.put("LoginTime", platAccountInformation.getLoginTime());
        return viewMap;
    }
}
```

> 操作手法

| 操作               | 快捷键（推荐） | Ctrl+Alt+Shift+T（或：鼠标右键“Refactor”） |
| ------------------ | -------------- | ------------------------------------------ |
| 接口/函数/字段下移 |                | Push members down                          |
| 内联               | Ctrl+Alt+N     | Inline xxx                                 |
| 引入变量           | Ctrl+Alt+V     | Introduce Variable                         |
| 引入参数           | Ctrl+Alt+P     | Introduce Parameter                        |
| 以委托取代继承     |                | Replace inheritance with delegation        |


补充：并不建议对所有存在“被拒绝的遗赠”的代码都进行修改，我们经常使用继承复用一些行为，可以很好的应对日常工作，所以修改的成本和收益还是需要开发者自己权衡。但是当“被拒绝的遗赠” 使开发人员困惑时，就建议及时处理掉。
