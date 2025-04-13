+++
title = '"Effective Java"精读之类和接口'
date = 2025-01-12T22:48:07+08:00
categories = ['java']
tags = ['java','effective-java']
+++

### 1. 尽量减少类和成员的可访问性

类和成员的可访问性应根据实际需求进行设置。将它们的可访问性限制为最小化可以有效减少系统的复杂度并提高安全性。

**总结：** 除非有明确需求，否则应将类和成员的访问权限设置为 `private` 或 `protected`，仅暴露必要的接口。

**代码示例：**

```java
public class Example {
    private String name;  // 限制访问性，防止不必要的外部访问
    public Example(String name) {
        this.name = name;
    }
}
```

核心点：通过将类和成员设为 `private` 或 `protected`，减少不必要的暴露，提升封装性。

------

### 2. 在公共类中使用访问器方法，而不是公共字段

直接访问公共字段会暴露类的实现细节，违背了面向对象设计中的封装原则。应通过访问器方法来间接访问字段。

**总结：** 使用访问器方法（getter）代替公共字段，以确保类的内部实现不被外界直接访问，增强封装性。

**代码示例：**

```java
public class Person {
    private String name;

    public String getName() {  // 使用访问器方法
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
```

核心点：通过 getter 和 setter 方法控制字段的访问，确保灵活性和封装性。

------

### 3. 最小化可变性

可变对象比不可变对象更容易出现错误，因此在设计类时应尽量避免可变性，尤其是对于那些需要被共享或传递的对象。

**总结：** 优先使用不可变类，尤其是当对象需要在多个线程之间共享时。

**代码示例：**

```java
public final class Person {
    private final String name;

    public Person(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }
}
```

核心点：通过将类定义为 `final`，并将字段声明为 `final`，确保对象在创建后不可变，避免线程安全问题。

------

### 4. 优先使用组合而不是继承

继承会导致类之间强耦合，使用组合可以使类之间保持松耦合，便于扩展和维护。

**总结：** 在设计时，优先考虑使用组合来构建功能，而不是通过继承来扩展类的功能。

**代码示例：**

```java
public class Engine {
    public void start() {
        System.out.println("Engine starting...");
    }
}

public class Car {
    private final Engine engine;  // 组合关系，而非继承

    public Car(Engine engine) {
        this.engine = engine;
    }

    public void start() {
        engine.start();
    }
}
```

核心点：通过组合实现功能扩展，避免继承导致的类之间紧密耦合。

------

### 5. 设计和文档化继承，或禁止继承

当设计类时，如果希望它被继承，必须明确定义继承的接口和行为。如果不希望类被继承，可以使用 `final` 关键字禁止继承。

**总结：** 清晰地定义继承关系，或者使用 `final` 禁止继承，避免不明确的继承导致的问题。

**代码示例：**

```java
public final class ImmutableClass {  // 禁止继承

    private final String value;

    public ImmutableClass(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}
```

核心点：通过 `final` 类来禁止继承，明确设计继承关系。

------

### 6. 优先使用接口而不是抽象类

接口比抽象类更加灵活，允许实现多继承，而抽象类则只能单继承。在需要设计规范而非实现时，应该使用接口。

**总结：** 优先使用接口定义行为规范，避免限制类的继承结构。

**代码示例：**

```java
public interface Drivable {
    void drive();
}

public class Car implements Drivable {
    @Override
    public void drive() {
        System.out.println("Car is driving...");
    }
}
```

核心点：接口提供更灵活的行为规范，避免类继承的单一限制。

------

### 7. 为后代设计接口

当设计接口时，应考虑它的扩展性，避免在将来无法满足需求的设计。

**总结：** 设计接口时考虑其未来可能的扩展性，避免过于具体或局限的接口设计。

**代码示例：**

```java
public interface Payment {
    void pay(double amount);
}

public class CreditCardPayment implements Payment {
    @Override
    public void pay(double amount) {
        System.out.println("Paid with credit card: " + amount);
    }
}
```

核心点：为接口提供未来扩展的空间，避免设计过于专一的接口。

------

### 8. 仅将接口用于定义类型

接口的设计目标是定义对象的行为，而不是实现的细节。只应将接口用于抽象定义，避免滥用接口来定义实现。

**总结：** 接口应专注于定义对象的行为，而不应被用来定义具体实现。

**代码示例：**

```java
public interface Printer {
    void print(String content);
}

public class LaserPrinter implements Printer {
    @Override
    public void print(String content) {
        System.out.println("Laser printer printing: " + content);
    }
}
```

核心点：接口仅定义类型，确保类的实现保持灵活和可替换。

------

### 9. 优先使用类层次结构而不是标记类

标记类（仅有标识作用的类）通常不如类层次结构直观，使用类继承能够提供更多的扩展性和清晰的结构。

**总结：** 使用类层次结构来表示不同类型或行为，避免使用无意义的标记类。

**代码示例：**

```java
public class Animal {
    public void makeSound() {
        System.out.println("Some generic sound");
    }
}

public class Dog extends Animal {
    @Override
    public void makeSound() {
        System.out.println("Bark");
    }
}
```

核心点：使用类继承来提供明确的类型区分和行为扩展，避免标记类的冗余。

------

### 10. 优先使用静态成员类而不是非静态成员类

静态内部类避免了对外部类实例的依赖，提供了更清晰的结构，并有助于避免潜在的内存泄漏问题。

**总结：** 优先使用静态内部类，它避免了不必要的外部类实例依赖，增强了代码的可维护性。

**代码示例：**

```java
public class OuterClass {
    private static String staticValue = "Static Value";

    public static class StaticNestedClass {
        public void display() {
            System.out.println(staticValue);
        }
    }
}
```

核心点：使用静态内部类可以避免不必要的外部类实例引用，提高代码的清晰度和性能。

------

### 11. 限制源文件只包含一个顶级类

为了保持代码结构清晰，最好每个源文件只包含一个顶级类。

**总结：** 限制每个源文件只包含一个顶级类，避免源文件过于庞大或混乱。

**代码示例：**

```java
// 每个文件应仅有一个顶级类，避免文件复杂化
public class TopLevelClass {
    // 逻辑代码
}
```

核心点：每个源文件保持单一顶级类，增强代码可读性和可维护性。