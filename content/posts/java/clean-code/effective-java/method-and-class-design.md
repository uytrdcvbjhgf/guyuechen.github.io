+++
title = '《Effective Java》精读之方法和类设计'
date = 2024-12-28T21:33:29+08:00
categories = ['java']
tags = ['java','effective-java']
+++

在《Effective Java》第3版中，**方法和类设计**部分涵盖了如何通过合理的设计提升代码的可读性、可维护性和性能。优秀的方法设计和类设计能够使系统更加清晰、高效，并且易于扩展。本篇文章将围绕方法和类设计的最佳实践展开，帮助你写出更加健壮的代码。

## 14. **方法参数要小心设计**

**总结：**

方法的参数设计应尽量简洁，避免过多的参数传递。若方法需要的参数过多，可以考虑将它们封装成对象或者使用可选参数（如使用`varargs`或构建者模式）。方法参数过多会影响代码的可读性和可维护性。

**代码示例：**

```java
// 参数过多，代码不清晰
public class Order {
    public Order(String customerName, String product, int quantity, String shippingAddress) {
        // 初始化
    }
}

// 使用构建者模式简化参数
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

通过使用构建者模式，避免了构造函数参数过多，增加了代码的可读性和可维护性。

## 15. **方法的返回值应该是尽可能的简单**

**总结：**

方法的返回值应尽可能简单且易于理解。复杂的返回值可能导致调用者理解困难，增加代码的复杂性。尽量避免返回集合或复杂对象，特别是当它们的状态可能发生变化时。尽量保持方法的返回值一致性和简单性。

**代码示例：**

```java
// 复杂的返回值，增加了不必要的复杂性
public List<String> getEmployeeNames() {
    List<String> names = new ArrayList<>();
    // 复杂逻辑填充names
    return names;
}

// 简单的返回值，保持方法清晰
public String getEmployeeName() {
    return "John Doe";
}
```

尽量避免返回复杂的数据结构，而是返回简单的、明确的值，有助于提高代码的清晰度。

## 16. **类应当是高度内聚的，功能相关的方法应放在同一个类中**

**总结：**

一个类应当尽可能地高内聚，功能相关的方法和属性应当集中在同一个类中。这样有助于提高代码的可读性、可维护性以及可重用性。避免创建承担多个责任的类，违背单一职责原则（SRP）。

**代码示例：**

```java
// 不符合单一职责原则
public class OrderProcessor {
    public void processOrder(Order order) {
        // 处理订单逻辑
    }

    public void saveOrderToDatabase(Order order) {
        // 保存订单到数据库
    }

    public void sendConfirmationEmail(Order order) {
        // 发送确认邮件
    }
}

// 符合单一职责原则：每个类只承担一个责任
public class OrderProcessor {
    public void processOrder(Order order) {
        // 处理订单逻辑
    }
}

public class OrderDatabase {
    public void saveOrder(Order order) {
        // 保存订单到数据库
    }
}

public class OrderEmailSender {
    public void sendConfirmationEmail(Order order) {
        // 发送确认邮件
    }
}
```

通过将不同的责任分配给不同的类，我们提高了代码的内聚性和可维护性。

## 17. **避免过多的公共方法和字段**

**总结：**

类的公共方法和字段应当精简，只暴露必要的功能。过多的公共方法和字段会增加类的复杂度，使得代码的维护变得更加困难。通过控制访问权限，可以有效地减少对类内部实现的依赖，提高封装性。

**代码示例：**

```java
// 公开不必要的字段和方法
public class User {
    public String name;
    public String email;

    public void updateEmail(String email) {
        this.email = email;
    }
}

// 封装字段，提供必要的公共方法
public class User {
    private String name;
    private String email;

    public void updateEmail(String email) {
        this.email = email;
    }

    public String getEmail() {
        return email;
    }
}
```

通过将字段封装成私有，减少了外部类对内部数据的直接访问，提高了类的封装性。

## 18. **避免暴露不必要的构造器**

**总结：**

类的构造器应当仅在需要时暴露给外部，如果不需要直接实例化某个类，应该避免提供公开的构造器。通过使用工厂方法或静态初始化块，可以有效地控制类的实例化过程，避免不必要的对象创建。

**代码示例：**

```java
// 公开不必要的构造器
public class Configuration {
    public Configuration() {
        // 不必要的构造器
    }
}

// 使用工厂方法避免直接暴露构造器
public class Configuration {
    private Configuration() {
        // 私有构造器
    }

    public static Configuration getInstance() {
        return new Configuration();
    }
}
```

通过将构造器私有化，只提供工厂方法来实例化`Configuration`类，可以控制类的实例化过程。

------

通过遵循这些关于**方法和类设计**的最佳实践，你将能够编写出更加清晰、简洁和易于维护的代码。保持方法的简洁性、类的内聚性以及封装性，能够有效地提升系统的可扩展性和可维护性。