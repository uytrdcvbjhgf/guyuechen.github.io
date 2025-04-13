+++
title = '"Effective Java"精读之序列化'
date = 2025-01-12T23:11:27+08:00
categories = ['java']
tags = ['java','effective-java']
+++

### 1. 避免序列化

序列化是一种强大的功能，但也会带来许多问题，特别是在版本控制和安全性方面。应避免不必要的序列化。

**总结：** 如果不需要对象的序列化能力，应该避免实现 `Serializable` 接口。

**代码示例：**

```java
// 错误做法：实现了 Serializable，但没有真正需要序列化的需求
public class User implements Serializable {
    private String username;
    private String password;
}

// 正确做法：不实现 Serializable
public class User {
    private String username;
    private String password;
}
```

核心点：避免不必要的序列化接口实现，减少潜在的安全风险和版本兼容性问题。

------

### 2. 考虑使用自定义序列化形式

如果需要序列化，但标准的序列化机制无法满足需求，可以考虑使用自定义的序列化方法。

**总结：** 自定义序列化方法可以更好地控制序列化过程，确保对象的兼容性和安全性。

**代码示例：**

```java
// 错误做法：直接使用默认序列化
public class Employee implements Serializable {
    private String name;
    private int salary;
    private transient String password; // 忽略敏感字段
}

// 正确做法：自定义序列化和反序列化
public class Employee implements Serializable {
    private String name;
    private int salary;
    private transient String password;

    // 自定义写入方法
    private void writeObject(ObjectOutputStream out) throws IOException {
        out.defaultWriteObject();
        out.writeObject(password); // 加密存储密码
    }

    // 自定义读取方法
    private void readObject(ObjectInputStream in) throws IOException, ClassNotFoundException {
        in.defaultReadObject();
        password = (String) in.readObject(); // 解密密码
    }
}
```

核心点：使用 `writeObject` 和 `readObject` 方法来定制序列化和反序列化过程。

------

### 3. 为实例控制选择枚举类型

在某些情况下，使用枚举类型来代替普通类进行序列化，可以增强类型安全性并简化控制。

**总结：** 如果需要控制实例的序列化形式，枚举类型提供了一个高效且安全的替代方案。

**代码示例：**

```java
// 错误做法：使用普通类实现序列化
public class Singleton implements Serializable {
    private static final Singleton instance = new Singleton();
    private Singleton() {}
    public static Singleton getInstance() {
        return instance;
    }
}

// 正确做法：使用枚举类型实现单例
public enum Singleton {
    INSTANCE;
}
```

核心点：使用枚举类型来控制实例的序列化，它能自动提供单例功能且避免序列化问题。

------

### 4. 写 `readObject` 方法时要小心

在自定义反序列化方法时，需要特别小心，确保反序列化后的对象状态是一致的。

**总结：** 自定义反序列化时要确保对象的完整性和一致性，避免可能的安全漏洞。

**代码示例：**

```java
// 错误做法：readObject 方法中没有正确处理反序列化
public class Employee implements Serializable {
    private String name;
    private int salary;

    // 自定义反序列化
    private void readObject(ObjectInputStream in) throws IOException, ClassNotFoundException {
        in.defaultReadObject();
        // 假设没有验证薪水是否合法
    }
}

// 正确做法：反序列化时验证数据的完整性
public class Employee implements Serializable {
    private String name;
    private int salary;

    private void readObject(ObjectInputStream in) throws IOException, ClassNotFoundException {
        in.defaultReadObject();
        if (salary < 0) {
            throw new InvalidObjectException("Invalid salary");
        }
    }
}
```

核心点：确保 `readObject` 方法的安全性，验证反序列化的数据是否合法。

------

### 5. 考虑序列化代理

如果对对象的序列化格式有复杂的需求，可以使用序列化代理模式来代替直接序列化对象。

**总结：** 序列化代理可以提供更高的灵活性和控制权，避免直接暴露对象的内部实现。

**代码示例：**

```java
// 错误做法：直接序列化对象
public class User implements Serializable {
    private String username;
    private String password;
}

// 正确做法：使用序列化代理
public class User implements Serializable {
    private String username;
    private String password;

    private Object writeReplace() throws ObjectStreamException {
        return new UserSerializationProxy(username); // 使用代理类进行序列化
    }

    private static class UserSerializationProxy implements Serializable {
        private String username;

        public UserSerializationProxy(String username) {
            this.username = username;
        }

        private Object readResolve() throws ObjectStreamException {
            return new User(username); // 在反序列化时恢复对象
        }
    }
}
```

核心点：使用序列化代理可以控制对象的序列化过程，简化复杂逻辑。

------

### 6. 考虑序列化实例替代

对于不可变对象或枚举类型的序列化，使用 `readResolve` 方法可以避免反序列化时创建多个实例。

**总结：** `readResolve` 方法可用于避免序列化时的对象创建问题，尤其适用于枚举类型和单例模式。

**代码示例：**

```java
// 错误做法：序列化后恢复对象时可能创建多个实例
public enum Singleton {
    INSTANCE;
}

// 正确做法：使用 readResolve 确保反序列化时只创建一个实例
public enum Singleton {
    INSTANCE;

    private Object readResolve() throws ObjectStreamException {
        return INSTANCE;  // 始终返回唯一实例
    }
}
```

核心点：`readResolve` 方法确保序列化和反序列化过程中对象实例的唯一性。

------

### 7. 注意版本控制

序列化机制依赖于类的 `serialVersionUID` 版本号。确保类的版本控制可以避免反序列化时的问题。

**总结：** 显式声明 `serialVersionUID` 可以保证类版本的一致性，避免不兼容问题。

**代码示例：**

```java
// 错误做法：没有显式声明 serialVersionUID
public class User implements Serializable {
    private String name;
    private int age;
}

// 正确做法：显式声明 serialVersionUID
public class User implements Serializable {
    private static final long serialVersionUID = 1L; // 声明版本号
    private String name;
    private int age;
}
```

核心点：显式声明 `serialVersionUID` 以避免反序列化时出现版本兼容性问题。