+++
title = '《Effective Java》精读之枚举和注解'
date = 2025-01-12T22:53:25+08:00
categories = ['java']
tags = ['java','effective-java']
+++

### 1. 使用枚举代替整数常量

枚举比整数常量更加类型安全且可读性更强，能够为每个常量提供额外的功能。通过枚举类型替代整数常量，可以减少代码中的错误并提高可维护性。

**总结：** 使用枚举类型代替整数常量可以使代码更具可读性和类型安全，避免了常量之间的错误使用。

**代码示例：**

```java
// 错误做法：使用整数常量
public class Operation {
    public static final int ADD = 1;
    public static final int SUBTRACT = 2;

    public int apply(int a, int b, int operation) {
        switch (operation) {
            case ADD: return a + b;
            case SUBTRACT: return a - b;
            default: throw new IllegalArgumentException("Unknown operation");
        }
    }
}

// 正确做法：使用枚举代替整数常量
public enum Operation {
    ADD, SUBTRACT;

    public int apply(int a, int b) {
        switch (this) {
            case ADD: return a + b;
            case SUBTRACT: return a - b;
            default: throw new IllegalArgumentException("Unknown operation");
        }
    }
}
```

核心点：枚举为常量提供了更强的类型安全和易于维护的代码结构。

------

### 2. 使用实例字段代替序号

如果枚举的每个实例都需要一个额外的值（如序号或字符串值），应使用实例字段而不是依赖枚举的 `ordinal()` 方法。这样可以避免使用 `ordinal()` 带来的不稳定性和错误。

**总结：** 使用实例字段代替 `ordinal()` 方法，可以确保枚举的灵活性和可扩展性，不依赖于枚举的顺序。

**代码示例：**

```java
// 错误做法：依赖 ordinal() 方法
public enum Operation {
    ADD, SUBTRACT;

    public int apply(int a, int b) {
        switch (this.ordinal()) {
            case 0: return a + b;
            case 1: return a - b;
            default: throw new IllegalArgumentException("Unknown operation");
        }
    }
}

// 正确做法：使用实例字段
public enum Operation {
    ADD(1), SUBTRACT(2);

    private final int value;

    Operation(int value) {
        this.value = value;
    }

    public int getValue() {
        return value;
    }

    public int apply(int a, int b) {
        switch (this) {
            case ADD: return a + b;
            case SUBTRACT: return a - b;
            default: throw new IllegalArgumentException("Unknown operation");
        }
    }
}
```

核心点：实例字段提供了比 `ordinal()` 方法更强的灵活性和稳定性。

------

### 3. 使用 EnumSet 代替位域

如果枚举类型表示的值是位域，则应使用 `EnumSet` 代替位字段。`EnumSet` 提供更好的性能和类型安全，尤其是在多元素集合的操作中。

**总结：** 使用 `EnumSet` 代替位域，使得代码更具可读性并提高性能，避免了位域带来的维护问题。

**代码示例：**

```java
// 错误做法：使用位域
public class OperationFlags {
    public static final int ADD = 1;
    public static final int SUBTRACT = 2;
    public static final int MULTIPLY = 4;

    private int flags;

    public void addFlag(int flag) {
        flags |= flag;
    }

    public boolean hasFlag(int flag) {
        return (flags & flag) != 0;
    }
}

// 正确做法：使用 EnumSet
public enum Operation {
    ADD, SUBTRACT, MULTIPLY;
}

public class OperationFlags {
    private EnumSet<Operation> flags = EnumSet.noneOf(Operation.class);

    public void addFlag(Operation flag) {
        flags.add(flag);
    }

    public boolean hasFlag(Operation flag) {
        return flags.contains(flag);
    }
}
```

核心点：`EnumSet` 提供比位域更具类型安全和高效的操作。

------

### 4. 使用 EnumMap 代替序号索引

如果需要使用枚举类型作为键来映射值，优先使用 `EnumMap`。它比 `HashMap` 更具性能优势，尤其是在键是枚举类型时。

**总结：** 使用 `EnumMap` 代替序号索引能够提高性能，并且使代码更加简洁和清晰。

**代码示例：**

```java
// 错误做法：使用序号作为索引
public class OperationValue {
    private static final int[] values = { 1, 2 };

    public int getValue(Operation operation) {
        return values[operation.ordinal()];
    }
}

// 正确做法：使用 EnumMap
public class OperationValue {
    private static final EnumMap<Operation, Integer> values = new EnumMap<>(Operation.class);

    static {
        values.put(Operation.ADD, 1);
        values.put(Operation.SUBTRACT, 2);
    }

    public int getValue(Operation operation) {
        return values.get(operation);
    }
}
```

核心点：`EnumMap` 提供比 `HashMap` 更高效且易于维护的枚举映射。

------

### 5. 模拟可扩展枚举使用接口

如果需要扩展枚举类型的行为，考虑为枚举实现接口，而不是依赖于继承。在设计时，可以为每个枚举实例提供具体实现。

**总结：** 为枚举实现接口能够使其行为更加灵活，并支持扩展。

**代码示例：**

```java
// 使用接口模拟扩展
public interface OperationHandler {
    int apply(int a, int b);
}

public enum Operation implements OperationHandler {
    ADD {
        public int apply(int a, int b) {
            return a + b;
        }
    },
    SUBTRACT {
        public int apply(int a, int b) {
            return a - b;
        }
    };
}
```

核心点：通过接口模拟扩展，可以使枚举具有可扩展的行为，增强代码的灵活性。

------

### 6. 偏好注解代替命名模式

在需要标识类或方法时，使用注解代替传统的命名模式。注解为代码提供了更强的表达能力，并能更好地与编译器和工具集成。

**总结：** 注解比命名模式更加灵活且易于自动化处理，适用于标记和约束代码。

**代码示例：**

```java
// 错误做法：使用命名模式
public class User {
    public static final String ROLE_ADMIN = "admin";
    public static final String ROLE_USER = "user";

    private String role;

    public User(String role) {
        this.role = role;
    }
}

// 正确做法：使用注解
public @interface Role {
    String value();
}

@Role("admin")
public class User {
    private String role;

    public User(String role) {
        this.role = role;
    }
}
```

核心点：注解提供了一种更简洁、更自动化的方式来定义和标记角色等信息。

------

### 7. 始终使用 `@Override` 注解

始终在重写父类方法时使用 `@Override` 注解，以避免方法签名错误。`@Override` 能帮助编译器检查是否正确重写了父类方法。

**总结：** 使用 `@Override` 注解可以减少编程错误，并提高代码的可读性和可维护性。

**代码示例：**

```java
public class MyClass {
    @Override
    public String toString() {
        return "MyClass instance";
    }
}
```

核心点：`@Override` 注解是防止方法签名错误的有效工具。

------

### 8. 使用标记接口定义类型

在某些情况下，可以使用标记接口（没有方法的接口）来定义特定类型，以便区分不同的类。

**总结：** 标记接口是一种轻量级的类型定义方式，适用于需要对类型进行分类和约束的场景。

**代码示例：**

```java
// 使用标记接口
public interface Validatable {}

public class User implements Validatable {}

public class Admin implements Validatable {}

public class NonValidUser {}
```

核心点：标记接口提供了一种方式来标识特定类型。