+++
title = '"Effective Java"精读之创建和销毁对象'
date = 2024-12-28T21:13:59+08:00
categories = ['java']
tags = ['java','effective-java']
+++

### 1. 考虑使用构造器代替可变参数的工厂方法

在面对多个构造参数时，工厂方法提供了一种灵活的选择，但若可变参数的数量和类型太多时，会使得代码变得难以理解和使用。使用构造器更简洁明了，特别是在参数数量较少时。

**总结：** 使用构造器代替可变参数的工厂方法，能提高代码的简洁性和可维护性。工厂方法更适用于有多个选项的构造，而构造器则适合简单的对象创建。

**代码示例：**

```java
public class NutritionFacts {
    private final int servingSize;  // 每份的量
    private final int servings;     // 每个包装的份数
    private final int calories;     // 每份的卡路里
    private final int fat;          // 每份的脂肪

    // 构造器代替了可变参数的工厂方法
    public NutritionFacts(int servingSize, int servings, int calories, int fat) {
        this.servingSize = servingSize;
        this.servings = servings;
        this.calories = calories;
        this.fat = fat;
    }
}
```

核心点：通过构造器传递每个参数，避免了使用工厂方法时可能带来的复杂性和可变参数问题。

---

### 2. 考虑使用构建器模式

当构造方法需要传入大量参数时，构建器模式是一种非常好的解决方案，它将构建过程分解成多个步骤，让代码更加清晰。

**总结：** 构建器模式特别适合参数多且不可选的构造函数，可以逐步设置参数，提高代码可读性和可维护性。

**代码示例：**

```java
public class NutritionFacts {
    private final int servingSize;
    private final int servings;
    private final int calories;
    private final int fat;
    
    public static class Builder {
        // 这是构建器的成员变量
        private final int servingSize;
        private final int servings;
        private int calories = 0; // 默认值
        private int fat = 0;      // 默认值

        // 构建器的构造函数，接受必须的参数
        public Builder(int servingSize, int servings) {
            this.servingSize = servingSize;
            this.servings = servings;
        }

        // 方法链式设置可选参数
        public Builder calories(int calories) {
            this.calories = calories;
            return this;
        }

        public Builder fat(int fat) {
            this.fat = fat;
            return this;
        }

        // 构建方法
        public NutritionFacts build() {
            return new NutritionFacts(this);
        }
    }

    // 使用构建器的构造函数来初始化 NutritionFacts 对象
    private NutritionFacts(Builder builder) {
        this.servingSize = builder.servingSize;
        this.servings = builder.servings;
        this.calories = builder.calories;
        this.fat = builder.fat;
    }
}
```

核心点：通过Builder模式分步初始化对象，避免了构造函数参数过多的复杂性，并允许灵活设置参数。

---

### 3. 强制单例属性，通过私有构造器或枚举类型

确保类只有一个实例时，可以使用私有构造器或枚举类型来实现单例模式。枚举类型是实现单例模式最简单且线程安全的方式。

**总结：** 单例模式确保类只有一个实例，并且防止通过构造器创建其他实例。枚举类型是实现单例的最佳选择。

**代码示例：**

```java
public enum Singleton {
    INSTANCE;

    public void doSomething() {
        System.out.println("Doing something...");
    }
}
```

核心点：通过`enum`类型来实现单例模式，它本身就是线程安全的，且由JVM保证只会存在一个实例。

---

### 4. 强制不可实例化，通过私有构造器

如果类不应该被实例化，可以通过私有构造器禁止外部代码实例化该类，确保只有静态方法可以访问。

**总结：** 使用私有构造器来防止类被实例化，这通常适用于工具类或只需要静态方法的类。

**代码示例：**

```java
public class UtilityClass {
    // 私有构造器确保不能实例化
    private UtilityClass() {
        throw new AssertionError("Cannot instantiate UtilityClass");
    }

    public static void utilityMethod() {
        System.out.println("Utility method invoked");
    }
}
```

核心点：通过私有构造器，类变得不可实例化，确保工具类只提供静态方法，不会被误用。

---

### 5. 优先使用依赖注入，而非硬编码资源

依赖注入（DI）是一种常用的设计模式，通过外部注入依赖，而不是在类内部硬编码资源，这有助于提高代码的可测试性和灵活性。

**总结：** 依赖注入有助于降低类之间的耦合度，使得代码更易于测试和维护。

**代码示例：**

```java
public class DatabaseService {
    private final DatabaseConnection connection;

    // 通过构造器注入依赖
    public DatabaseService(DatabaseConnection connection) {
        this.connection = connection;
    }

    public void queryDatabase() {
        connection.connect();
        // 执行数据库查询
    }
}
```

核心点：通过构造器注入数据库连接对象，避免了硬编码的依赖，增加了灵活性和可测试性。



### 6. 避免创建不必要的对象

避免无意义的对象创建，尤其是当对象的生命周期很短或重复创建时，这会带来不必要的性能开销。

**总结：** 在可能的情况下，尽量避免不必要的对象创建，可以通过共享对象或缓存策略来减少对象创建的次数。

**代码示例：**

```java
public class StringPool {
    public static void main(String[] args) {
        // 使用String池机制避免创建不必要的对象
        String s1 = "Hello";
        String s2 = "Hello";

        System.out.println(s1 == s2);  // 输出 true，表示共享了同一个对象
    }
}
```

核心点：通过Java的String池机制来避免不必要的对象创建。

---

### 7. 消除过时的对象引用

如果某个对象不再被使用，及时将其引用设置为`null`或通过其他方式释放引用，以便垃圾回收器可以回收资源。

**总结：** 对象的引用需要及时清理，以防止内存泄漏。

**代码示例：**

```java
public class MemoryManager {
    private SomeResource resource;

    public void releaseResource() {
        resource = null;  // 释放对资源的引用，允许GC回收
    }
}
```

核心点：通过将不再需要的对象引用设为`null`，帮助垃圾回收器回收资源，避免内存泄漏。

---

### 8. 避免使用finalizer和清理方法

`finalize`方法已被废弃，尽量避免使用它来清理资源。应该使用`try-with-resources`或显式的关闭方法来释放资源。

**总结：** 避免使用`finalize`方法，优先使用`try-with-resources`来管理资源，确保资源及时释放。

**代码示例：**

```java
public class ResourceHandler implements AutoCloseable {
    @Override
    public void close() {
        // 清理资源
    }
}
```

核心点：`try-with-resources`确保资源自动关闭，避免了使用`finalize`带来的问题。

---

### 9. 优先使用try-with-resources，而非try-finally

**总结：** `try-with-resources`语句是处理资源的最佳方式，能自动关闭资源，减少了代码复杂度，并且避免资源泄漏。

**代码示例：**

```java
try (BufferedReader br = new BufferedReader(new FileReader("file.txt"))) {
    String line = br.readLine();
    System.out.println(line);
} catch (IOException e) {
    e.printStackTrace();
}
```

