+++
title = '《Effective Java》精读之类设计与继承'
date = 2025-01-12T22:02:19+08:00
categories = ['java']
tags = ['java','effective-java']
+++

类设计与继承是面向对象编程的核心，合理的类设计可以提高代码的可维护性、复用性和可扩展性。在《Effective Java》第3版中，关于类设计与继承的最佳实践为开发者提供了关于如何组织类、如何继承以及如何避免常见设计陷阱的重要指导。

------

## 75. **优先使用组合而非继承**

**总结：**

继承提供了类之间的强耦合，可能导致代码难以扩展和维护。相比之下，组合（将对象作为成员变量）提供了更灵活、更松耦合的设计，是避免继承层次复杂化的更优选择。

**代码示例：**

```java
// 继承（不推荐）
class Engine {
    public void start() {
        System.out.println("Engine is starting.");
    }
}

class Car extends Engine {
    public void drive() {
        System.out.println("Car is driving.");
    }
}

// 组合（推荐）
class Engine {
    public void start() {
        System.out.println("Engine is starting.");
    }
}

class Car {
    private Engine engine;

    public Car(Engine engine) {
        this.engine = engine;
    }

    public void drive() {
        engine.start();
        System.out.println("Car is driving.");
    }
}
```

组合提供了更好的灵活性，类之间的耦合度较低，便于扩展和修改。

------

## 76. **避免在类中提供“破坏封装”的方法**

**总结：**

类应尽可能保持封装性。直接暴露类内部的状态或实现细节（如公开setter、getter方法等）破坏了封装性，降低了类的灵活性和可维护性。应仅暴露必要的操作接口。

**代码示例：**

```java
// 错误：暴露内部细节
class Car {
    private Engine engine;

    public Engine getEngine() {
        return engine;
    }

    public void setEngine(Engine engine) {
        this.engine = engine;
    }
}

// 正确：隐藏内部实现细节
class Car {
    private Engine engine;

    public void start() {
        engine.start();
    }

    // 只暴露操作接口，而非直接暴露内部成员
}
```

封装是面向对象设计的核心，良好的封装性有助于提升类的灵活性和安全性。

------

## 77. **尽量避免继承的深度**

**总结：**

继承树深度过大会导致系统变得复杂且难以理解。每多一级继承，就增加了子类对父类实现的依赖，从而降低了系统的灵活性和可维护性。尽量保持继承树的扁平化，避免过度继承。

**代码示例：**

```java
// 深度继承（不推荐）
class Vehicle {}
class Car extends Vehicle {}
class ElectricCar extends Car {}
class SportsCar extends ElectricCar {}

// 扁平继承（推荐）
class Vehicle {}
class Car extends Vehicle {}
class SportsCar extends Car {}
```

较浅的继承层次使得类层次更加清晰，且易于理解和扩展。

------

## 78. **避免使用 public 构造函数来扩展类**

**总结：**

当子类需要使用父类的构造函数时，可能会暴露父类的构造函数，导致外部代码不小心调用不适当的构造函数。应避免在类的构造函数中做过多的操作，尽量使用工厂方法代替构造函数。

**代码示例：**

```java
// 错误：暴露了构造函数
class Parent {
    public Parent(String name) {
        // 构造函数内容
    }
}

class Child extends Parent {
    public Child(String name) {
        super(name); // 子类调用父类构造函数
    }
}

// 推荐：使用工厂方法
class Parent {
    private Parent(String name) {
        // 构造函数内容
    }

    public static Parent createInstance(String name) {
        return new Parent(name);
    }
}

class Child {
    private Parent parent;

    public Child(String name) {
        this.parent = Parent.createInstance(name);
    }
}
```

通过使用工厂方法，我们可以将构造函数的使用限制在内部，避免外部直接调用，增强了灵活性。

------

## 79. **避免使用不必要的继承层次**

**总结：**

如果类没有明显的通用功能需求，继承的设计可能会增加系统复杂度并降低代码的可理解性。在某些情况下，使用接口或组合可以代替继承，从而减少不必要的层次结构。

**代码示例：**

```java
// 错误：过度使用继承
class Animal {}
class Mammal extends Animal {}
class Human extends Mammal {}

// 推荐：使用接口代替继承
interface Mammal {}
class Human implements Mammal {}
```

过度的继承可能会增加不必要的复杂性，使用接口或组合提供了更多的灵活性。

------

## 80. **避免使用“神类”**

**总结：**

“神类”是指拥有过多功能的类，这类类通常难以理解和维护。每个类应专注于自己的职责，不应承担过多责任。

**代码示例：**

```java
// 错误：神类设计
class Vehicle {
    void start() {}
    void stop() {}
    void refuel() {}
    void calculateFuelEfficiency() {}
    void calculateSpeed() {}
}

// 推荐：单一职责原则
class Vehicle {
    void start() {}
    void stop() {}
}

class FuelManager {
    void refuel() {}
    void calculateFuelEfficiency() {}
}

class SpeedCalculator {
    void calculateSpeed() {}
}
```

将职责分解到多个类中，可以提高代码的可维护性和可理解性。

------

类设计和继承的正确使用是实现良好面向对象设计的关键。通过避免不必要的继承、破坏封装以及神类等设计问题，我们能够构建出更加清晰、可扩展且易于维护的系统。优先使用组合而非继承，并注意继承层次的深度，从而确保系统的灵活性和可维护性。