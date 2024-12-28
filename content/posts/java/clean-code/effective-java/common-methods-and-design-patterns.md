+++
title = 'Common Methods and Design Patterns'
date = 2024-12-28T21:27:34+08:00
categories = ['java']
tags = ['java','effective-java']
+++

在《Effective Java》第3版中，**通用方法和设计模式**是一个非常关键的部分，它帮助开发者设计出更加灵活、可维护和可扩展的系统。无论是常见的设计模式还是一些通用方法，掌握这些技巧都能够显著提升代码质量和开发效率。本篇文章将讨论如何使用设计模式和一些通用方法来编写更好的Java代码。

## 9. **优先考虑使用接口而不是抽象类**

**总结：**
接口和抽象类都可以用来定义类的模板，但它们在使用时有不同的侧重点。接口应该优先于抽象类，因为接口提供了更大的灵活性，允许多个实现类并行开发，并且可以避免“多重继承”的问题。抽象类主要适用于共享代码的情景，但接口则更加轻量和解耦。

**代码示例：**

```java
// 使用接口
public interface Drawable {
    void draw();
}

public class Circle implements Drawable {
    @Override
    public void draw() {
        System.out.println("Drawing a circle.");
    }
}

// 使用抽象类
public abstract class Shape {
    abstract void draw();
}

public class Circle extends Shape {
    @Override
    void draw() {
        System.out.println("Drawing a circle.");
    }
}
```

在此示例中，`Drawable`接口提供了更灵活的设计，而`Shape`抽象类则不如接口灵活，因为它只能单继承。

## 10. **使用组合而不是继承**

**总结：**
继承是一种紧耦合的关系，使用继承容易导致类的功能耦合过多，增加了代码的复杂性和维护难度。相反，组合（即将对象作为另一个对象的成员）提供了更好的灵活性和可扩展性，能够避免“继承地狱”问题，是更推荐的设计方式。

**代码示例：**

```java
// 使用继承
public class Animal {
    void eat() {
        System.out.println("Eating...");
    }
}

public class Dog extends Animal {
    void bark() {
        System.out.println("Barking...");
    }
}

// 使用组合
public class Dog {
    private Animal animal;

    public Dog() {
        animal = new Animal();
    }

    void eat() {
        animal.eat();
    }

    void bark() {
        System.out.println("Barking...");
    }
}
```

在这个例子中，使用组合代替继承，`Dog`类通过持有`Animal`对象来实现`eat()`方法，而不是继承自`Animal`类。

## 11. **使用工厂方法代替直接构造对象**

**总结：**
工厂方法是创建对象的一种方式，它能够将对象的创建过程封装起来，从而使得客户端代码与对象的具体实现解耦。使用工厂方法能够让代码更加灵活，便于扩展和维护，并且在需要时可以使用不同的实现类。

**代码示例：**

```java
// 直接使用构造器
public class Car {
    public Car() {
        // 创建Car对象
    }
}

// 使用工厂方法
public class Car {
    private Car() {
        // 创建Car对象
    }

    public static Car createCar() {
        return new Car();
    }
}
```

在这个例子中，通过`createCar()`工厂方法创建`Car`对象，而不是直接调用构造器，这样做能让对象的创建更加灵活。

## 12. **使用单例模式管理共享资源**

**总结：**
单例模式是一种确保某个类只有一个实例并提供全局访问点的设计模式。适用于那些需要全局共享资源的场景，如数据库连接池、线程池等。通过单例模式，可以避免重复创建实例，减少系统的资源消耗。

**代码示例：**

```
java复制代码// 单例模式实现
public class Singleton {
    private static final Singleton instance = new Singleton();

    private Singleton() {
        // 私有构造器，防止外部实例化
    }

    public static Singleton getInstance() {
        return instance;
    }
}
```

`Singleton`类通过私有构造器保证了只有一个实例，外部代码只能通过`getInstance()`方法访问该实例。

## 13. **尽量避免使用过多的参数**

**总结：**
方法参数过多会导致代码难以理解和维护，也容易引发错误。应尽量避免方法参数过多，如果需要传递大量数据，可以考虑使用对象封装数据，或者采用构建者模式（Builder Pattern）来简化方法参数。

**代码示例：**

```java
// 参数过多的构造器
public class Order {
    public Order(String customerName, String product, int quantity, String shippingAddress) {
        // 初始化
    }
}

// 使用构建者模式简化
public class Order {
    private String customerName;
    private String product;
    private int quantity;
    private String shippingAddress;

    private Order(Builder builder) {
        this.customerName = builder.customerName;
        this.product = builder.product;
        this.quantity = builder.quantity;
        this.shippingAddress = builder.shippingAddress;
    }

    public static class Builder {
        private String customerName;
        private String product;
        private int quantity;
        private String shippingAddress;

        public Builder customerName(String customerName) {
            this.customerName = customerName;
            return this;
        }

        public Builder product(String product) {
            this.product = product;
            return this;
        }

        public Builder quantity(int quantity) {
            this.quantity = quantity;
            return this;
        }

        public Builder shippingAddress(String shippingAddress) {
            this.shippingAddress = shippingAddress;
            return this;
        }

        public Order build() {
            return new Order(this);
        }
    }
}
```

通过使用构建者模式（`Builder`类），我们简化了`Order`类的构造器，避免了过多参数导致的复杂性。

------

通过掌握这些常见的设计模式和通用方法，你可以编写出更加灵活、可维护和可扩展的代码。尤其是工厂方法、单例模式、组合代替继承等设计技巧，在实际开发中极为重要，能够帮助你构建更加健壮和易于维护的系统。