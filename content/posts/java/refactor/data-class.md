+++
title = '代码坏味道之纯稚的数据类 (Data Class)'
date = 2024-10-13T18:38:34+08:00
categories = ['java']
tags = ['refactor']
+++

**定义**

DataClass是指：它们拥有一些字段，以及用于访问（读写）这些字段的函数，除此之外一无长物。
这样的类只是一种不会说话的数据容器。

**影响**

- DataClass将数据与行为间的关系割裂，破坏了面向对象的精髓。特定数据的操作分散在代码各处，可能造成代码霰弹式修改

**改进目标**

- 将特定数据的操作集中在一个地方，提高代码的可读性、可维护性、可扩展性等

**方法**

- 封装变量
- 封装集合
- 搬移函数
- 抽取方法
- 移除设值函数

> 案例


**代码背景**
部门及员工信息管理
![](https://raw.githubusercontent.com/guyuechen/gallery/main/img/80e5aeb9a1713a51a6f440532e8ad2ff.svg)

- Staff类为员工原始信息，属于数据模型， 存储于数据库中 
  - 部长minister、部门名称name为部门Department固有属性，在业务代码中一旦设置后不会更改
    员工staffs在部门department运作过程中可能会有新增和删除的情况
  - Audit类中的auditGenderRatio(Department department)为员工男女比例审计方法
  - Hrbp类中的getStaffNumOfGender(Gender gender)为获取指定性别的员工数量

**症状/问题**

- 在Hrbp和Audit类中，都存在调用Department的staffs， 统计部门里男女员工数量的代码片段，属于功能重复
- 人数统计功能，用的都是Department内部属性，应该放在Department中，功能更内聚

**重构目标/步骤**

- 修改public属性访问修饰符为private
- 不需要设值的属性删除set方法，提供构造方法
- 集合属性删除设值函数，并提供add/delete方法
- 集合属性的get，返回不可变集合，避免外部修改

```java
/**
 * 部门信息
 */
public class Department {
    public String minister; // 部长

    private String name; // 部门名称

    private List<Staff> staffs; // 部门员工列表

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<Staff> getStaffs() {
        return staffs;
    }

    public void setStaffs(List<Staff> staffs) {
        this.staffs = staffs;
    }
}
```

```java
/**
 * 审计部门审计
 *
 * 男女比例与Hrbp里面计算存在重复代码，如果统计规则变化则需要同时修改两处
 *
 * demo中代码中没有考虑空指针相关等异常，实际项目请充分考虑异常场景处理
 */
public class Audit {
    /**
     * 审计男女比率
     *
     * @param department 部门信息
     * @return 男女比例 (没有女员工返回-1.0)
     */
    public double auditGenderRatio(Department department) {
        long maleNums = department.getStaffs().stream()
            .filter(staff -> Gender.MALE.equals(staff.getGender()))
            .count();
        long femaleNums = department.getStaffs().stream()
            .filter(staff ->  Gender.FEMALE.equals(staff.getGender()))
            .count();

        // 女员工数为0时 返回-1
        if (femaleNums == 0) {
            return -1.0;
        }
        return maleNums / (femaleNums * 1.0);
    }
}
```

```java
/**
 * hrbp管理
 */
public class Hrbp {
    private final List<Department> departments; // 部门列表

    public Hrbp(List<Department> departments) {
        this.departments = departments;
    }

    /**
     * 统计所有部门下(男/女)性别员工数量
     *
     * @return (男/女)性别员工总数
     */
    public long getStaffNumOfGender(Gender gender) {
        long sum = 0L;
        for (Department department : departments) {
            long genderStaffNums = department.getStaffs().stream()
                .filter(staff -> staff.getGender().equals(gender))
                .count();
            sum += genderStaffNums;
        }
        return sum;
    }
}
```

> 改进手法：抽取方法


```java
/**
 * 部门信息
 */
public class Department {
    private final String minister; // 部长

    private final String name; // 部门名称

    private List<Staff> staffs = new ArrayList<>(); // 部门员工列表

    public Department(String minister, String name) {
        this.minister = minister;
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public List<Staff> getStaffs() {
        return Collections.unmodifiableList(staffs);
    }

    public void addStaffs(List<Staff> staffs) {
        this.staffs.addAll(staffs);
    }

    public void deleteStaffs(List<Staff> staffs) {
        this.staffs.removeAll(staffs);
    }

    public String getMinister() {
        return minister;
    }
}
```

> 改进手法：函数搬移


```java
/**
 * 部门信息
 */
public class Department {
    private final String minister; // 部长

    private final String name; // 部门名称

    private List<Staff> staffs = new ArrayList<>(); // 部门员工列表

    public Department(String minister, String name) {
        this.minister = minister;
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public List<Staff> getStaffs() {
        return Collections.unmodifiableList(staffs);
    }

    public void addStaffs(List<Staff> staffs) {
        this.staffs.addAll(staffs);
    }

    public void deleteStaffs(List<Staff> staffs) {
        this.staffs.removeAll(staffs);
    }

    public String getMinister() {
        return minister;
    }

    public long getStaffNumOfGender(Gender male) {
        return getStaffs().stream().filter(staff -> male.equals(staff.getGender())).count();
    }
}
```

```java
public class Audit {
    /**
     * 审计男女比率
     *
     * @param department 部门信息
     * @return 男女比例 (没有女员工返回-1.0)
     */
    public double auditGenderRatio(Department department) {
        long maleNums = department.getStaffNumOfGender(Gender.MALE);
        long femaleNums = department.getStaffNumOfGender(Gender.FEMALE);

        // 女员工数为0时 返回-1
        if (femaleNums == 0) {
            return -1.0;
        }
        return maleNums / (femaleNums * 1.0);
    }
}
```

```java
/**
 * hrbp管理
 */
public class Hrbp {
    private final List<Department> departments; // 部门列表

    public Hrbp(List<Department> departments) {
        this.departments = departments;
    }

    /**
     * 统计所有部门下(男/女)性别员工数量
     *
     * @return (男/女)性别员工总数
     */
    public long getStaffNumOfGender(Gender gender) {
        return departments.stream().mapToLong(department -> department.getStaffNumOfGender(gender)).sum();
    }
}
```

> 纯数据类必须要重构吗？找遍所有「取值/设值」函数没有发现可搬移的行为，怎么办？


并非所有纯稚的数据类都需要重构，先分析其被调用点的行为特点！纯稚的数据类有其使用场景，比如DTO这种贫血模型。

> 操作手法

| 操作                       | 快捷键（推荐） | Ctrl+Alt+Shift+T（或：鼠标右键“Refactor”） |
| -------------------------- | -------------- | ------------------------------------------ |
| 封装变量                   |                | Encapsulate Fields                         |
| 提取函数                   | Ctrl+Atl+M     | Extract Method                             |
| 移除设值函数（用内联移除） | Ctrl+Alt+N     | Inline Method                              |
| 移除设值函数（直接删除）   | Alt+Del        | Safe Delete                                |
| 搬移函数                   | F6             | Move Instance Method                       |
