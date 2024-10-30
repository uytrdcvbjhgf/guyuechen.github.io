+++
title = '代码坏味道之过大的类 (Large Class)'
date = 2024-10-13T18:35:51+08:00
categories = ['java']
tags = ['refactor']
+++

**定义**

由于属性未分组和职责不单一而包含过多属性、方法和代码行的类

**影响**

- 随着属性、方法和代码行数的不断增加，重复代码接踵而至，最终走向混乱

**改进目标**

- 拆分过大的类，确保类职责单一

**方法**

- 提取类
- 提取子类
- 提取接口/超类

> 案例1：问题代码


**代码背景**

- 描述了一个打工人的数据模型
- Workman有姓名、性别、电话、邮件、微信、QQ等属性

**症状/问题**

- phoneNumber、email、weChat、QQ等联系方式种类可能会经常调整，容易对Workman造成侵入式修改

**重构目标**

- 将phoneNumber、email、weChat、QQ等属性提取出Contacts类

```java
/**
 * 工作人员信息
 */
public class Workman {
    private final String name;

    private final Gender gender;

    private final String phoneNumber;

    private final String email;

    private final String weChat;

    private final String QQ;

    private final CareerInfo careerInfo;

    public Workman(String name, Gender gender, String phoneNumber, String email, CareerInfo careerInfo,
        String weChat, String QQ) {
        this.name = name;
        this.gender = gender;
        this.phoneNumber = phoneNumber;
        this.email = email;
        this.careerInfo = careerInfo;
        this.weChat = weChat;
        this.QQ = QQ;
    }

    /**
     * 生成人员信息
     *
     * @return 人员信息
     */
    public String generatePersonInfo() {
        if (Career.TEACHER.equals(this.careerInfo.getCareer())) {
            return generateTeacherInfo();
        }

        if (Career.DOCTOR.equals(this.careerInfo.getCareer())) {
            return generateDoctorInfo();
        }

        return "invalidPersonInfo";
    }

    private String generateDoctorInfo() {
        return generateBasicInfo()
            + "hospital: " + this.careerInfo.getWorkplace() + LINE_SEPARATOR
            + "doctors' duties: " + showDoctorsDuty() + LINE_SEPARATOR
            + "Salary after 3 years: " + getDoctorSalaryAfterThreeYears();
    }

    private String generateTeacherInfo() {
        return generateBasicInfo()
            + "teachers' hopes: " + showTeachersHope() + LINE_SEPARATOR
            + "school: " + this.careerInfo.getWorkplace() + LINE_SEPARATOR
            + "Salary after 2 years: " + getTeacherSalaryAfterTwoYears();
    }

    private String generateBasicInfo() {
        return "basic info: " + getBasicInfo() + LINE_SEPARATOR
            + "contact info: " + getContactInfo() + LINE_SEPARATOR;
    }

    private String getBasicInfo() {
        return LINE_SEPARATOR
            + "\tname: " + name + LINE_SEPARATOR
            + "\tgender: " + gender.name();
    }

    private String getContactInfo() {
        return LINE_SEPARATOR
            + "\tphoneNumber: " + phoneNumber + LINE_SEPARATOR
            + "\temail: " + email + LINE_SEPARATOR
            + "\tweChat: " + weChat + LINE_SEPARATOR
            + "\tQQ: " + QQ;
    }

    private double getDoctorSalaryAfterThreeYears() {
        final double increaseRate = 0.1;
        double salaryAfterYears = this.careerInfo.getSalary() * Math.pow(1 + increaseRate, 3);
        return BigDecimal.valueOf(salaryAfterYears).setScale(1, RoundingMode.HALF_UP).doubleValue();
    }

    private double getTeacherSalaryAfterTwoYears() {
        final double increaseRate = 0.08;
        double salaryAfterYears = this.careerInfo.getSalary() * Math.pow(1 + increaseRate, 2);
        return BigDecimal.valueOf(salaryAfterYears).setScale(1, RoundingMode.HALF_UP).doubleValue();
    }

    private String showDoctorsDuty() {
        return "A doctor's work is to heal and save lives";
    }

    private String showTeachersHope() {
        return "Every student can grow sturdily and get good grades";
    }
}
```

> 改进手法：提取类


```java
/**
 * 工作人员信息
 */
public class Workman {
    private final String name;

    private final Gender gender;

    private final CareerInfo careerInfo;

    private final Contacts contacts;

    public Workman(String name, Gender gender, CareerInfo careerInfo, Contacts contacts) {
        this.name = name;
        this.gender = gender;
        this.careerInfo = careerInfo;
        this.contacts = contacts;
    }

    /**
     * 生成人员信息
     *
     * @return 人员信息
     */
    public String generatePersonInfo() {
        if (Career.TEACHER.equals(this.careerInfo.getCareer())) {
            return generateTeacherInfo();
        }

        if (Career.DOCTOR.equals(this.careerInfo.getCareer())) {
            return generateDoctorInfo();
        }

        return "invalidPersonInfo";
    }

    private String generateDoctorInfo() {
        return generateBasicInfo()
            + "hospital: " + this.careerInfo.getWorkplace() + LINE_SEPARATOR
            + "doctors' duties: " + showDoctorsDuty() + LINE_SEPARATOR
            + "Salary after 3 years: " + getDoctorSalaryAfterThreeYears();
    }

    private String generateTeacherInfo() {
        return generateBasicInfo()
            + "teachers' hopes: " + showTeachersHope() + LINE_SEPARATOR
            + "school: " + this.careerInfo.getWorkplace() + LINE_SEPARATOR
            + "Salary after 2 years: " + getTeacherSalaryAfterTwoYears();
    }

    private String generateBasicInfo() {
        return "basic info: " + getBasicInfo() + LINE_SEPARATOR
            + "contact info: " + contacts.getContactInfo() + LINE_SEPARATOR;
    }

    private String getBasicInfo() {
        return LINE_SEPARATOR
            + "\tname: " + name + LINE_SEPARATOR
            + "\tgender: " + gender.name();
    }

    private double getDoctorSalaryAfterThreeYears() {
        final double increaseRate = 0.1;
        double salaryAfterYears = this.careerInfo.getSalary() * Math.pow(1 + increaseRate, 3);
        return BigDecimal.valueOf(salaryAfterYears).setScale(1, RoundingMode.HALF_UP).doubleValue();
    }

    private double getTeacherSalaryAfterTwoYears() {
        final double increaseRate = 0.08;
        double salaryAfterYears = this.careerInfo.getSalary() * Math.pow(1 + increaseRate, 2);
        return BigDecimal.valueOf(salaryAfterYears).setScale(1, RoundingMode.HALF_UP).doubleValue();
    }

    private String showDoctorsDuty() {
        return "A doctor's work is to heal and save lives";
    }

    private String showTeachersHope() {
        return "Every student can grow sturdily and get good grades";
    }
}
```

```java
public class Contacts {
    private final String phoneNumber;

    private final String email;

    private final String weChat;

    private final String QQ;

    public Contacts(String phoneNumber, String email, String weChat, String QQ) {
        this.phoneNumber = phoneNumber;
        this.email = email;
        this.weChat = weChat;
        this.QQ = QQ;
    }

    public String getContactInfo() {
        return LINE_SEPARATOR
            + "\tphoneNumber: " + phoneNumber + LINE_SEPARATOR
            + "\temail: " + email + LINE_SEPARATOR
            + "\tweChat: " + weChat + LINE_SEPARATOR
            + "\tQQ: " + QQ;
    }
}
```

> 案例2：问题代码


**代码背景**

- 上述改进后的代码还是有问题：Workman有生成人员信息的方法，根据不同的职业调用各自的相关方法

**症状/问题**

- 类功能职责不单一，获取医生工作信息和获取教师工作信息属于不同的功能子集

**重构目标**

- 根据不同职业提取子类，保证类功能职责单一

> 改进手法：提取子类


```java
/**
 * 工作人员信息
 */
public abstract class Workman {
    private final String name;

    private final Gender gender;

    protected final CareerInfo careerInfo;

    private final Contacts contacts;

    protected Workman(String name, Gender gender, CareerInfo careerInfo, Contacts contacts) {
        this.name = name;
        this.gender = gender;
        this.careerInfo = careerInfo;
        this.contacts = contacts;
    }

    /**
     * 生成人员信息
     *
     * @return 人员信息
     */
    public abstract String generatePersonInfo();

    protected String generateBasicInfo() {
        return "basic info: " + getBasicInfo() + LINE_SEPARATOR
            + "contact info: " + contacts.getContactInfo() + LINE_SEPARATOR;
    }

    private String getBasicInfo() {
        return LINE_SEPARATOR
            + "\tname: " + name + LINE_SEPARATOR
            + "\tgender: " + gender.name();
    }
}
```

```java
public class WorkmanFactory {
    public Workman createWorkman(String name, Gender gender, CareerInfo careerInfo, Contacts contacts) {
        switch (careerInfo.getCareer()) {
            case DOCTOR:
                return new Doctor(name, gender, careerInfo, contacts);
            case TEACHER:
                return new Teacher(name, gender, careerInfo, contacts);
            default:
                return new InvalidWorkman(name, gender, careerInfo, contacts);
        }
    }
}
```

```java
public class Doctor extends Workman {
    public Doctor(String name, Gender gender, CareerInfo careerInfo, Contacts contacts) {
        super(name, gender, careerInfo, contacts);
    }

    @Override
    public String generatePersonInfo() {
        return generateDoctorInfo();
    }

    private String generateDoctorInfo() {
        return generateBasicInfo() + "hospital: " + this.careerInfo.getWorkplace() + LINE_SEPARATOR
            + "doctors' duties: " + showDoctorsDuty() + LINE_SEPARATOR + "Salary after 3 years: "
            + getDoctorSalaryAfterThreeYears();
    }

    private double getDoctorSalaryAfterThreeYears() {
        final double increaseRate = 0.1;
        double salaryAfterYears = this.careerInfo.getSalary() * Math.pow(1 + increaseRate, 3);
        return BigDecimal.valueOf(salaryAfterYears).setScale(1, RoundingMode.HALF_UP).doubleValue();
    }

    private String showDoctorsDuty() {
        return "A doctor's work is to heal and save lives";
    }
}
```

```java
public class Teacher extends Workman {
    public Teacher(String name, Gender gender, CareerInfo careerInfo, Contacts contacts) {
        super(name, gender, careerInfo, contacts);
    }

    @Override
    public String generatePersonInfo() {
        return generateTeacherInfo();
    }

    private String generateTeacherInfo() {
        return generateBasicInfo() + "teachers' hopes: " + showTeachersHope() + LINE_SEPARATOR + "school: "
            + this.careerInfo.getWorkplace() + LINE_SEPARATOR + "Salary after 2 years: "
            + getTeacherSalaryAfterTwoYears();
    }

    private double getTeacherSalaryAfterTwoYears() {
        final double increaseRate = 0.08;
        double salaryAfterYears = this.careerInfo.getSalary() * Math.pow(1 + increaseRate, 2);
        return BigDecimal.valueOf(salaryAfterYears).setScale(1, RoundingMode.HALF_UP).doubleValue();
    }

    private String showTeachersHope() {
        return "Every student can grow sturdily and get good grades";
    }
}
```

```java
public class InvalidWorkman extends Workman {
    public InvalidWorkman(String name, Gender gender, CareerInfo careerInfo, Contacts contacts) {
        super(name, gender, careerInfo, contacts);
    }

    @Override
    public String generatePersonInfo() {
        return "invalidPersonInfo";
    }
}
```

> 案例3：问题代码


**代码背景**

- 上述改进后的代码还是有问题...

**症状/问题**

- 医生和教师类中有一系列相似的行为，调用方调用此类行为会随着职业增加而不断增加代码分支

**重构目标**

- 提取为(到)接口或超类，对功能进行封装

> 改进手法：提取接口/超类


```java
/**
 * 工作人员信息
 */
public abstract class Workman {
    private final String name;

    private final Gender gender;

    protected final CareerInfo careerInfo;

    private final Contacts contacts;

    protected Workman(String name, Gender gender, CareerInfo careerInfo, Contacts contacts) {
        this.name = name;
        this.gender = gender;
        this.careerInfo = careerInfo;
        this.contacts = contacts;
    }

    /**
     * 生成人员信息
     *
     * @return 人员信息
     */
    public abstract String generatePersonInfo();

    protected String generateBasicInfo() {
        return "basic info: " + getBasicInfo() + LINE_SEPARATOR
            + "contact info: " + contacts.getContactInfo() + LINE_SEPARATOR;
    }

    private String getBasicInfo() {
        return LINE_SEPARATOR
            + "\tname: " + name + LINE_SEPARATOR
            + "\tgender: " + gender.name();
    }

    protected double getSalaryAfterYears(double increaseRate, int years) {
        double salaryAfterYears = this.careerInfo.getSalary() * Math.pow(1 + increaseRate, years);
        return BigDecimal.valueOf(salaryAfterYears).setScale(1, RoundingMode.HALF_UP).doubleValue();
    }
}
```

```java
public class Teacher extends Workman {
    public Teacher(String name, Gender gender, CareerInfo careerInfo, Contacts contacts) {
        super(name, gender, careerInfo, contacts);
    }

    @Override
    public String generatePersonInfo() {
        return generateTeacherInfo();
    }

    private String generateTeacherInfo() {
        return generateBasicInfo() + "teachers' hopes: " + showTeachersHope() + LINE_SEPARATOR + "school: "
            + this.careerInfo.getWorkplace() + LINE_SEPARATOR + "Salary after 2 years: "
            + getSalaryAfterYears(0.08, 2);
    }

    private String showTeachersHope() {
        return "Every student can grow sturdily and get good grades";
    }
}
```

```java
public class Doctor extends Workman {
    public Doctor(String name, Gender gender, CareerInfo careerInfo, Contacts contacts) {
        super(name, gender, careerInfo, contacts);
    }

    @Override
    public String generatePersonInfo() {
        return generateDoctorInfo();
    }

    private String generateDoctorInfo() {
        return generateBasicInfo() + "hospital: " + this.careerInfo.getWorkplace() + LINE_SEPARATOR
            + "doctors' duties: " + showDoctorsDuty() + LINE_SEPARATOR + "Salary after 3 years: "
            + getSalaryAfterYears(0.1, 3);
    }

    private String showDoctorsDuty() {
        return "A doctor's work is to heal and save lives";
    }
}
```

> 操作手法

| 操作             | 快捷键（推荐） | Ctrl+Alt+Shift+T（或：鼠标右键“Refactor”） |
| ---------------- | -------------- | ------------------------------------------ |
| 将参数提取为类   |                | Introduce Parameter Object                 |
| 提取属性         | Ctrl+Alt+F     | Introduce Field                            |
| 提取函数         | Ctrl+Alt+M     | Extract Method                             |
| 方法下移         |                | Push Members Down                          |
| 方法上移         |                | Push Members Up                            |
| 提取接口         |                | Extract Interface                          |
| 提取超类         |                | Extract Superclass                         |
| 工厂替换构造函数 |                | Replace Constructor With Factory Method    |
