+++
title = '《Effective Java》精读之方法'
date = 2025-01-12T23:00:05+08:00
categories = ['java']
tags = ['java','effective-java']
+++

### 1. 检查参数的有效性

方法中的参数是不可忽视的，确保每个参数的有效性是非常重要的。在方法开始时进行有效性检查能够帮助及时捕捉潜在的错误。

**总结：** 及时验证输入参数可以提前发现错误，减少程序运行时的问题。

**代码示例：**

```java
public void setAge(int age) {
    if (age < 0 || age > 150) {
        throw new IllegalArgumentException("Age out of range: " + age);
    }
    this.age = age;
}
```

核心点：对方法的输入进行有效性检查，避免传入非法参数。

------

### 2. 在必要时做防御性拷贝

当方法接受可变对象作为参数时，确保防御性地拷贝对象，以防外部代码修改传入的对象。

**总结：** 防御性拷贝能够防止外部代码意外修改对象的状态，从而保障对象的封装性。

**代码示例：**

```java
public void setDates(List<Date> dates) {
    this.dates = new ArrayList<>(dates); // 创建新的副本以防止修改
}
```

核心点：防止外部修改传入的对象，确保类的状态不会被意外破坏。

------

### 3. 小心设计方法签名

方法签名应该简洁、易于理解，避免引入不必要的复杂性。方法名和参数应能准确表达其功能。

**总结：** 清晰的设计方法签名能提升代码的可读性和可维护性。

**代码示例：**

```java
// 错误做法：方法签名含混不清
public boolean validateInput(String input, String rule, int maxLength) {
    // 方法名不清晰，无法表达具体功能
    return true;
}

// 正确做法：清晰明了
public boolean isValidEmail(String email) {
    // 方法名清晰，明确是验证邮箱
    return email.contains("@");
}
```

核心点：方法签名应尽量简洁且能准确描述其功能。

------

### 4. 明智地使用方法重载

方法重载是指在同一个类中定义多个具有相同方法名但参数不同的方法。然而，方法重载应适量使用，以避免混淆。

**总结：** 适度使用方法重载可以提升代码的灵活性，但过度重载会使代码变得难以理解和维护。

**代码示例：**

```java
// 错误做法：方法重载过多
public void setName(String name) { /* ... */ }
public void setName(String firstName, String lastName) { /* ... */ }
public void setName(String name, String middleName, String lastName) { /* ... */ }

// 正确做法：方法签名简洁且清晰
public void setFullName(String fullName) {
    this.name = fullName;
}
```

核心点：重载方法时应注意清晰和简洁，避免产生歧义。

------

### 5. 返回空集合或数组，而不是 null

返回 `null` 时可能引发空指针异常，因此，应该优先考虑返回空集合或空数组。

**总结：** 返回空集合或数组比返回 `null` 更安全，能减少空指针异常的发生。

**代码示例：**

```java
// 错误做法：返回 null
public List<String> getNames() {
    return null; // 可能会引发空指针异常
}

// 正确做法：返回空集合
public List<String> getNames() {
    return Collections.emptyList(); // 更安全
}
```

核心点：尽量避免返回 `null`，使用空集合或空数组作为替代。

------

### 6. 明智地使用 Optional

`Optional` 可以帮助我们显式地表达一个值可能不存在，但应当谨慎使用，避免不必要的性能损失。

**总结：** `Optional` 应该用于方法的返回类型，以表达值可能缺失，但不适用于所有场景。

**代码示例：**

```java
// 错误做法：使用 Optional 包裹所有返回值
public Optional<String> getName() {
    return Optional.ofNullable(name);
}

// 正确做法：仅在返回值可能为 null 时使用 Optional
public Optional<String> findNameById(int id) {
    return Optional.ofNullable(database.getName(id));
}
```

核心点：`Optional` 适用于可能返回 `null` 的场景，但滥用可能导致性能问题。

------

### 7. 为所有公开的 API 元素编写文档注释

编写清晰、简洁的文档注释对于理解和使用方法非常重要，特别是对公共 API 元素来说。

**总结：** 为每个公开的方法、类和字段编写文档注释，能够大大提高代码的可理解性和可维护性。

**代码示例：**

```java
/**
 * Sets the age of the person.
 * 
 * @param age the age to set
 * @throws IllegalArgumentException if the age is negative or too large
 */
public void setAge(int age) {
    if (age < 0 || age > 150) {
        throw new IllegalArgumentException("Age out of range");
    }
    this.age = age;
}
```

核心点：文档注释可以帮助其他开发者快速理解方法的功能和使用限制。