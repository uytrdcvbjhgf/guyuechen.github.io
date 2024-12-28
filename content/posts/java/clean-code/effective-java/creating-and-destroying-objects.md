+++
title = '《Effective Java》精读之创建和销毁对象'
date = 2024-12-28T21:13:59+08:00
categories = ['java']
tags = ['java','effective-java']

+++

在《Effective Java》第3版中，创建和销毁对象是一个非常基础且重要的主题。本篇文章将深入讨论关于如何高效、安全地创建和销毁对象的最佳实践，从而帮助你在编写Java代码时做出更好的决策，提升代码质量和性能。

## 1. **考虑使用构造器代替可变参数的工厂方法**

**总结：**

Java提供了可变参数（Varargs）作为一种方便的方法来处理多个参数。然而，过度依赖可变参数会导致代码在可读性和类型安全上出现问题。工厂方法（Factory Method）通常比可变参数方法更易于理解和使用，尤其是在需要更多控制时。

**代码示例：**

```java
// 使用可变参数的方法
public class Product {
    private String name;
    private double price;

    public Product(String... params) {
        if (params.length == 2) {
            this.name = params[0];
            this.price = Double.parseDouble(params[1]);
        }
    }
}

// 使用工厂方法
public class Product {
    private String name;
    private double price;

    private Product(String name, double price) {
        this.name = name;
        this.price = price;
    }

    public static Product createProduct(String name, double price) {
        return new Product(name, price);
    }
}
```

在此示例中，使用工厂方法`createProduct()`代替了带有可变参数的构造器，使得代码更加明确和类型安全。

## 2. **避免创建不必要的对象**

**总结：**

每个对象的创建都有一定的性能开销，尤其是在高频操作中。避免不必要的对象创建可以提高程序的性能。在Java中，如果多个地方使用相同的数据，最好复用对象而不是每次都创建新对象。

**代码示例：**

```java
// 不必要的对象创建
public class DataProcessor {
    public void process() {
        String temp = new String("Hello");
        System.out.println(temp);
    }
}

// 更好的做法，复用现有对象
public class DataProcessor {
    private static final String HELLO = "Hello";

    public void process() {
        System.out.println(HELLO);
    }
}
```

在这个例子中，避免了每次调用`process()`方法时都创建一个新的`String`对象，而是复用了常量`HELLO`，提高了性能。

## 3. **使对象不可变**

**总结：**

不可变对象是设计良好的对象，它们的状态在对象创建后无法改变。这种设计不仅可以避免并发问题，还能使得代码更加简洁和安全。在设计不可变对象时，应避免提供任何修改对象状态的方法。

**代码示例：**

```java
// 可变对象
public class User {
    private String name;

    public void setName(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }
}

// 不可变对象
public final class User {
    private final String name;

    public User(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }
}
```

不可变对象`User`的状态一旦设定就不可改变，确保了线程安全和数据的一致性。

## 4. **考虑使用静态工厂方法**

**总结：**

静态工厂方法相比于构造器有几个优点：它们允许命名创建方法，能够返回父类类型（即灵活的多态），以及可以缓存对象以提高性能（例如单例模式）。静态工厂方法可以使得代码更加清晰和可维护。

**代码示例：**

```java
// 构造器
public class DatabaseConnection {
    public DatabaseConnection() {
        // 初始化数据库连接
    }
}

// 静态工厂方法
public class DatabaseConnection {
    private static final DatabaseConnection INSTANCE = new DatabaseConnection();

    private DatabaseConnection() {
        // 初始化数据库连接
    }

    public static DatabaseConnection getInstance() {
        return INSTANCE;
    }
}
```

静态工厂方法`getInstance()`可以确保`DatabaseConnection`对象的唯一性，这样的设计能够提高性能并减少资源消耗。

## 5. **避免使用“清理”方法，如`finalize`**

**总结：**

`finalize()`方法曾经用于清理对象占用的资源，但其不确定的调用时机和垃圾回收的不可预测性使得它难以使用。Java 9及以后版本已经废弃了`finalize()`方法，因此不推荐使用它来处理资源的释放。更好的做法是使用`try-with-resources`语句或显式的清理方法。

**代码示例：**

```java
// 使用finalize方法
public class Resource {
    @Override
    protected void finalize() throws Throwable {
        // 释放资源
        System.out.println("Cleaning up resources...");
    }
}

// 使用try-with-resources
public class Resource implements AutoCloseable {
    @Override
    public void close() {
        // 释放资源
        System.out.println("Cleaning up resources...");
    }
}

// 在使用时
try (Resource resource = new Resource()) {
    // 使用资源
}
```

使用`AutoCloseable`接口和`try-with-resources`确保了资源能够在使用完毕后及时释放，避免了`finalize()`的不确定性和性能问题。

------

在《Effective Java》第3版中，关于创建和销毁对象的最佳实践为我们提供了很多有用的指导。通过避免不必要的对象创建、使用不可变对象、合理使用工厂方法以及避免`finalize()`等不稳定的清理方法，我们可以写出更高效、可维护且易于理解的Java代码。在日常开发中，掌握这些最佳实践，不仅能提高程序的性能，还能减少因错误使用对象生命周期管理带来的问题。