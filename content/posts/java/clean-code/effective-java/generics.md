+++
title = '《Effective Java》精读之泛型'
date = 2024-12-28T21:52:31+08:00
categories = ['java']
tags = ['java','effective-java']
+++

在《Effective Java》第3版中，**泛型**是提高代码重用性和类型安全性的重要工具。泛型允许你编写与类型无关的代码，减少了代码的重复性，同时也能避免在运行时出现类型错误。然而，滥用泛型可能会导致代码的复杂性增加，甚至带来性能问题。通过掌握泛型的正确使用方式，我们可以编写出既安全又高效的代码。

## 40. **优先使用泛型而非原生类型**

**总结：**

使用泛型而非原生类型，可以增强类型安全性，避免类型转换的错误。在集合类和容器类中，使用泛型能够在编译时就捕获类型错误，减少了运行时的错误概率。

**代码示例：**

```java
// 错误：使用原生类型
List list = new ArrayList();
list.add("Hello");
String str = (String) list.get(0); // 强制类型转换

// 正确：使用泛型
List<String> list = new ArrayList<>();
list.add("Hello");
String str = list.get(0); // 不需要强制类型转换
```

使用泛型后，编译器会强制检查类型，从而避免了运行时的类型转换错误。

## 41. **优先考虑泛型方法而非通配符**

**总结：**

虽然通配符（如`? extends T`或`? super T`）在一些复杂场景中非常有用，但在大多数情况下，使用泛型方法能够提高代码的可读性和类型安全性。泛型方法使得你可以灵活地指定类型，同时避免了类型擦除和复杂的边界限制。

**代码示例：**

```java
// 错误：使用通配符
public void printList(List<?> list) {
    for (Object item : list) {
        System.out.println(item);
    }
}

// 正确：使用泛型方法
public <T> void printList(List<T> list) {
    for (T item : list) {
        System.out.println(item);
    }
}
```

通过使用泛型方法，我们可以保持类型的灵活性，同时增强类型安全性和可读性。

## 42. **避免使用过于宽泛的类型参数**

**总结：**

尽量避免使用过于宽泛的类型参数（例如`Object`），因为这样会使得泛型失去类型约束，导致类型安全性降低。通过使用适当的上界或下界来限定类型参数，可以提高代码的安全性和可维护性。

**代码示例：**

```java
// 错误：使用过于宽泛的类型
public class Box<T> {
    private T value;

    public void setValue(T value) {
        this.value = value;
    }
}

// 正确：使用更合适的上界
public class Box<T extends Number> {
    private T value;

    public void setValue(T value) {
        this.value = value;
    }
}
```

通过限制`T`的类型为`Number`及其子类，我们确保了`Box`类只能存储数值类型，避免了不必要的类型错误。

## 43. **使用边界限制来增加泛型的灵活性**

**总结：**

通过使用类型边界，泛型可以变得更具灵活性，同时保持类型安全性。例如，`? extends T`表示接受`T`及其子类，`? super T`表示接受`T`及其父类。合理使用边界限制可以使代码在处理不同类型时更加灵活。

**代码示例：**

```java
// 错误：没有使用适当的边界限制
public void printNumbers(List<Number> list) {
    for (Number number : list) {
        System.out.println(number);
    }
}

// 正确：使用适当的边界限制
public <T extends Number> void printNumbers(List<T> list) {
    for (T number : list) {
        System.out.println(number);
    }
}
```

通过使用类型边界`T extends Number`，我们使得方法能够接收`Number`及其子类的类型，从而增强了灵活性。

## 44. **谨慎使用泛型的类型擦除**

**总结：**

泛型在Java中使用类型擦除，这意味着在运行时，所有泛型类型都会被替换为原始类型。这可能导致某些意料之外的问题，例如在运行时无法获取泛型类型信息。通过适当使用`instanceof`和`getClass()`等工具，可以在运行时检查类型。

**代码示例：**

```java
// 错误：依赖泛型的类型信息
public <T> void printClassType(T object) {
    System.out.println(object.getClass().getName()); // 类型擦除后无法获得泛型类型
}

// 正确：使用反射检查类型
public void printClassType(Object object) {
    System.out.println(object.getClass().getName()); // 通过反射检查类型
}
```

通过避免在泛型方法中直接依赖类型信息，我们可以避免类型擦除带来的问题。

## 45. **避免使用原始类型的泛型类**

**总结：**

使用原始类型的泛型类会导致编译时无法检查类型安全，容易引发`ClassCastException`。应该始终使用具体的泛型类型，而不是原始类型。这样可以在编译时捕获类型错误。

**代码示例：**

```java
// 错误：使用原始类型
List list = new ArrayList();
list.add("Hello");
String str = (String) list.get(0); // 强制类型转换

// 正确：使用具体的泛型类型
List<String> list = new ArrayList<>();
list.add("Hello");
String str = list.get(0); // 无需强制类型转换
```

通过使用`List<String>`，编译器可以在编译阶段检查类型安全，避免了运行时的错误。

## 46. **为泛型类提供类型安全的构造函数**

**总结：**

对于泛型类，构造函数中的类型应当尽可能确保类型安全。避免使用未经检查的类型转换，而是通过构造函数的类型参数来限制对象的创建。

**代码示例：**

```java
// 错误：构造函数中使用了不安全的类型转换
public class Box<T> {
    private T value;

    public Box(Object value) {  // 传入Object类型，不安全
        this.value = (T) value;  // 可能导致ClassCastException
    }
}

// 正确：确保类型安全
public class Box<T> {
    private T value;

    public Box(T value) {  // 使用泛型类型来保证类型安全
        this.value = value;
    }
}
```

通过使用泛型类型来创建对象，可以确保类型安全，避免不必要的类型转换。

------

通过遵循这些关于泛型的最佳实践，我们可以编写出既类型安全又高效的代码。使用泛型时，要尽量避免使用原始类型和过于宽泛的类型参数，合理利用类型边界和类型擦除的特性，可以提升代码的灵活性和可维护性。正确使用泛型方法和构造函数，使得代码不仅更加清晰，还能有效避免运行时的类型错误。