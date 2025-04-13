+++
title = '"Effective Java"精读之Lambda和Streams'
date = 2025-01-12T22:56:54+08:00
categories = ['java']
tags = ['java','effective-java']
+++

### 1. 偏好使用 Lambda 表达式代替匿名类

Lambda 表达式提供了简洁且功能强大的方式来表示行为。它比匿名类更加简洁，并能有效减少冗余代码。

**总结：** Lambda 表达式使得代码更加简洁、清晰，并且提升了可维护性。

**代码示例：**

```java
// 错误做法：使用匿名类
List<String> names = Arrays.asList("Alice", "Bob", "Charlie");
Collections.sort(names, new Comparator<String>() {
    public int compare(String s1, String s2) {
        return s1.length() - s2.length();
    }
});

// 正确做法：使用 Lambda 表达式
Collections.sort(names, (s1, s2) -> s1.length() - s2.length());
```

核心点：Lambda 表达式简化了代码，减少了不必要的类定义。

------

### 2. 偏好使用方法引用代替 Lambda 表达式

当 Lambda 表达式只是调用现有方法时，优先使用方法引用。方法引用具有更好的可读性。

**总结：** 方法引用使代码更简洁，且更加可读，适用于直接引用现有方法的场景。

**代码示例：**

```java
// 错误做法：使用 Lambda 表达式
List<String> names = Arrays.asList("Alice", "Bob", "Charlie");
names.forEach(name -> System.out.println(name));

// 正确做法：使用方法引用
names.forEach(System.out::println);
```

核心点：方法引用更简洁且易于理解。

------

### 3. 偏好使用标准的函数式接口

Java 8 提供了许多标准的函数式接口，如 `Predicate`, `Function`, `Consumer` 等。优先使用这些标准接口，而不是自定义接口。

**总结：** 使用标准的函数式接口能够提高代码的一致性，减少不必要的自定义。

**代码示例：**

```java
// 错误做法：自定义函数式接口
@FunctionalInterface
interface MyPredicate {
    boolean test(String s);
}

// 正确做法：使用标准的 Predicate 接口
List<String> names = Arrays.asList("Alice", "Bob", "Charlie");
names.removeIf(name -> name.length() > 4);
```

核心点：使用标准函数式接口减少了不必要的自定义，且与其他 Java 8 特性更加兼容。

------

### 4. 明智地使用 Streams

Stream API 是处理集合的强大工具，但它并不总是适用于所有场景。对于简单的操作，传统的迭代方式可能更为高效。

**总结：** 在性能敏感的场合，应谨慎使用 Stream，因为其引入的开销可能不适合简单操作。

**代码示例：**

```java
// 错误做法：过度使用 Stream 进行简单迭代
List<String> names = Arrays.asList("Alice", "Bob", "Charlie");
names.stream().filter(name -> name.length() > 3).forEach(System.out::println);

// 正确做法：直接使用 forEach 循环
for (String name : names) {
    if (name.length() > 3) {
        System.out.println(name);
    }
}
```

核心点：对于简单的集合操作，传统迭代方式可能更加高效。

------

### 5. 偏好使用无副作用的函数

在使用 Stream 时，尽量避免使用会产生副作用的操作。无副作用的函数可以使程序更加稳定、可预测。

**总结：** 无副作用的函数更易于理解和调试，避免了状态共享问题。

**代码示例：**

```java
// 错误做法：带有副作用
List<String> names = Arrays.asList("Alice", "Bob", "Charlie");
names.stream().forEach(name -> {
    System.out.println(name);
    // 这里修改了外部变量
    count++;
});

// 正确做法：避免副作用
names.stream().forEach(System.out::println);
```

核心点：避免在 Stream 中引入副作用，可以确保代码更加简洁和易于维护。

------

### 6. 偏好使用 Collection 而非 Stream 作为返回类型

虽然 Stream 是一种强大的数据处理工具，但它并不适用于所有的场景。对于返回多次使用的数据，使用 Collection 类型作为返回值更加合适。

**总结：** 在需要多次访问数据时，返回 Collection 比 Stream 更加合适，Stream 更适合于一次性操作。

**代码示例：**

```java
// 错误做法：返回 Stream
public Stream<String> getNames() {
    return names.stream().filter(name -> name.length() > 3);
}

// 正确做法：返回 Collection
public List<String> getNames() {
    return names.stream().filter(name -> name.length() > 3).collect(Collectors.toList());
}
```

核心点：返回 Collection 类型能使数据的使用更加灵活和高效。

------

### 7. 使用并行流时要小心

虽然并行流可以显著提高性能，但它适用于数据量较大且操作无副作用的场景。在并行处理时，应谨慎使用，以避免不必要的复杂性和开销。

**总结：** 并行流提高性能的前提是适当使用，过度使用可能会导致性能下降和调试困难。

**代码示例：**

```java
// 错误做法：在简单场景下使用并行流
List<String> names = Arrays.asList("Alice", "Bob", "Charlie");
names.parallelStream().forEach(System.out::println);

// 正确做法：使用普通流
names.stream().forEach(System.out::println);
```

核心点：并行流适用于数据量大且操作无副作用的情况，简单场景下使用普通流更高效。

------

### 8. 避免在流中使用共享可变状态

Stream 的并行特性要求所有流操作都必须无副作用。如果流操作使用了共享可变状态，可能导致线程安全问题，因此需要避免。

**总结：** 在流操作中避免使用共享可变状态可以保证程序的线程安全性。

**代码示例：**

```java
// 错误做法：在流中使用共享可变状态
List<String> names = Arrays.asList("Alice", "Bob", "Charlie");
int[] count = {0};  // 共享可变状态
names.stream().forEach(name -> {
    if (name.length() > 3) {
        count[0]++;
    }
});
System.out.println(count[0]);

// 正确做法：避免共享可变状态
final int[] count = {0};
names.stream().forEach(name -> {
    if (name.length() > 3) {
        count[0]++;
    }
});
System.out.println(count[0]);
```

核心点：共享可变状态可能导致线程安全问题，应尽量避免。