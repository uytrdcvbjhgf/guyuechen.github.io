+++
title = '《Effective Java》精读之一般编程'
date = 2025-01-12T23:02:49+08:00
categories = ['java']
tags = ['java','effective-java']
+++

### 1. 遵循通用命名约定

命名对于代码的可读性和可维护性至关重要，遵循常见的命名约定有助于提高代码的质量。

**总结：** 采用一致且具有描述性的命名方式，使代码易于理解和扩展。

**代码示例：**

```java
// 错误做法：命名不规范
public void doIt() { /* ... */ }

// 正确做法：命名清晰，能够反映方法的功能
public void calculateTotalPrice() { /* ... */ }
```

核心点：良好的命名约定能够使代码更加清晰和易于理解。

------

### 2. 使用局部变量代替实例变量

局部变量的作用域更小，能够减少错误发生的机会。对于不需要跨方法使用的数据，应该使用局部变量而不是实例变量。

**总结：** 局部变量能够减少类的复杂性，避免不必要的状态保存。

**代码示例：**

```java
// 错误做法：使用实例变量
public class Invoice {
    private double price; // 多次使用

    public void calculateTotal() {
        double total = price * 1.1; // 在方法内使用实例变量
    }
}

// 正确做法：使用局部变量
public void calculateTotal() {
    double price = 100.0; // 在方法内部使用局部变量
    double total = price * 1.1;
}
```

核心点：尽量减少实例变量的使用，优先使用局部变量。

------

### 3. 优先使用增强的 for 循环代替传统的 for 循环

增强的 `for` 循环使代码更加简洁，且避免了手动管理索引。

**总结：** 使用增强的 `for` 循环能够提高代码的可读性，减少潜在的错误。

**代码示例：**

```java
// 错误做法：传统 for 循环
for (int i = 0; i < list.length; i++) {
    System.out.println(list[i]);
}

// 正确做法：使用增强的 for 循环
for (String item : list) {
    System.out.println(item);
}
```

核心点：增强的 `for` 循环使得代码更简洁，减少了手动管理循环变量的需求。

------

### 4. 熟悉并使用库

Java 提供了丰富的标准库，善用这些库能够减少重复造轮子，提高开发效率。

**总结：** 利用 Java 的标准库而不是重新发明轮子，可以提高代码质量和开发效率。

**代码示例：**

```java
// 错误做法：手动实现字符串拼接
String result = "";
for (String word : words) {
    result += word; // 每次循环都创建新的字符串，效率低
}

// 正确做法：使用 StringBuilder
StringBuilder result = new StringBuilder();
for (String word : words) {
    result.append(word); // 使用 StringBuilder，效率更高
}
```

核心点：标准库为常见问题提供了高效的解决方案，应当充分利用。

------

### 5. 如果需要精确的结果，避免使用 float 和 double

`float` 和 `double` 类型的数值运算可能会因为精度问题产生误差，因此在需要精确计算的场景中，应避免使用这些类型。

**总结：** 对于需要精确数值的场合，避免使用浮点类型，考虑使用 `BigDecimal` 或整数类型。

**代码示例：**

```java
// 错误做法：使用 float 或 double 进行精确计算
double result = 0.1 + 0.2; // 会产生精度误差

// 正确做法：使用 BigDecimal 进行精确计算
BigDecimal result = new BigDecimal("0.1").add(new BigDecimal("0.2"));
```

核心点：浮点数运算会导致精度问题，对于高精度计算应使用 `BigDecimal`。

------

### 6. 优先使用原始类型而不是包装类型

包装类型（如 `Integer`、`Double`）通常会引入额外的性能开销。在不需要对象特性时，应优先使用原始类型。

**总结：** 在性能敏感的场合，应使用原始类型，避免不必要的性能损失。

**代码示例：**

```java
// 错误做法：使用包装类型
Integer number = 10;  // 会自动装箱

// 正确做法：使用原始类型
int number = 10;  // 使用原始类型，避免装箱带来的开销
```

核心点：避免不必要的装箱和拆箱操作，使用原始类型可以提高效率。

------

### 7. 避免使用字符串，除非必须

字符串拼接操作通常是低效的，尤其是在循环中频繁操作时。可以考虑使用 `StringBuilder` 或其他数据类型来处理。

**总结：** 在需要频繁拼接字符串的场合，使用 `StringBuilder` 比直接使用字符串连接更高效。

**代码示例：**

```java
// 错误做法：直接拼接字符串
String result = "";
for (String word : words) {
    result += word; // 字符串拼接效率低
}

// 正确做法：使用 StringBuilder
StringBuilder result = new StringBuilder();
for (String word : words) {
    result.append(word); // 使用 StringBuilder，性能更好
}
```

核心点：字符串的拼接操作应该尽量使用 `StringBuilder`，避免性能瓶颈。

------

### 8. 通过接口引用对象，而非通过实现类引用

尽量通过接口引用对象，而不是直接通过具体的实现类引用。这样做能够减少耦合，使代码更加灵活。

**总结：** 使用接口引用可以使代码更具可扩展性，减少对具体实现的依赖。

**代码示例：**

```java
// 错误做法：直接引用实现类
ArrayList<String> list = new ArrayList<>();

// 正确做法：通过接口引用
List<String> list = new ArrayList<>();
```

核心点：通过接口引用来减少对具体实现类的依赖，提高代码的灵活性。

------

### 9. 小心使用反射

反射是一个强大的工具，但它的使用可能导致性能下降和代码可维护性差。应避免滥用反射。

**总结：** 使用反射时应当谨慎，避免影响性能和代码的可维护性。

**代码示例：**

```java
// 错误做法：滥用反射
Method method = obj.getClass().getMethod("someMethod");
method.invoke(obj);

// 正确做法：避免不必要的反射使用
someMethod();
```

核心点：反射性能较差，使用时要确保其必要性。

------

### 10. 优化应谨慎

在优化代码时，首先要确保代码正确、可读和可维护，过早的优化可能会导致复杂性增加，反而得不偿失。

**总结：** 优化应当基于实际的性能瓶颈，避免过早优化，浪费资源。

**代码示例：**

```java
// 错误做法：过早优化
public int calculateTotal(int[] values) {
    int total = 0;
    for (int i = 0; i < values.length; i++) {
        total += values[i];
    }
    return total;
}

// 正确做法：先确保代码可读和正确，再基于性能瓶颈进行优化
public int calculateTotal(List<Integer> values) {
    int total = 0;
    for (int value : values) {
        total += value;
    }
    return total;
}
```

核心点：优化应当基于实际情况，过早优化可能引发新的问题。

------

### 11. 遵循最小特权原则

尽量使用最小的权限访问类和方法，以减少潜在的安全隐患。

**总结：** 通过遵循最小特权原则，降低系统的攻击面，提升安全性。

**代码示例：**

```java
// 错误做法：公开不必要的方法
public class Account {
    public void resetPassword() { /* ... */ }
}

// 正确做法：只暴露必要的方法
public class Account {
    private void resetPassword() { /* ... */ }  // 限制访问权限
}
```

核心点：尽量限制方法和类的访问范围，减少不必要的暴露。