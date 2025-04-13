+++
title = '"Effective Java"精读之泛型'
date = 2024-12-28T21:52:31+08:00
categories = ['java']
tags = ['java','effective-java']
+++

### 1. 不要使用原始类型

原始类型无法充分利用泛型的类型安全性和可读性，因此应避免使用原始类型。始终使用参数化类型，以确保类型检查的正确性。

**总结：** 使用泛型类型代替原始类型，这样可以避免类型不匹配和潜在的 ClassCastException 错误。

**代码示例：**

```java
// 错误做法：使用原始类型
List list = new ArrayList();
list.add("Hello");
String str = (String) list.get(0);  // 需要强制类型转换

// 正确做法：使用泛型类型
List<String> list = new ArrayList<>();
list.add("Hello");
String str = list.get(0);  // 编译器自动检查类型
```

核心点：泛型可以提高类型安全，避免运行时错误和强制类型转换。

------

### 2. 消除未检查的警告

泛型类型可能会导致编译时产生警告，尤其是在涉及非泛型方法时。通过使用泛型来减少这些警告，并确保类型的正确性。

**总结：** 使用泛型时应消除编译器产生的未检查警告，以确保代码的类型安全。

**代码示例：**

```java
// 错误做法：原始类型使用未检查的警告
List list = new ArrayList();

// 正确做法：使用泛型类型，消除警告
List<String> list = new ArrayList<>();
```

核心点：通过正确使用泛型，消除未检查警告，确保代码类型安全。

------

### 3. 优先使用 List 而不是数组

在 Java 中，使用 `List` 比使用数组更具灵活性，特别是当你需要动态添加元素时。`List` 是泛型化的，能自动处理类型安全。

**总结：** 优先使用 `List` 而非数组，能够提供更好的灵活性和可维护性。

**代码示例：**

```java
// 使用数组
String[] array = new String[10];
array[0] = "Hello";

// 使用 List
List<String> list = new ArrayList<>();
list.add("Hello");
```

核心点：`List` 提供更大的灵活性，并且具有自动类型检查的优势。

------

### 4. 偏好使用泛型类型

在设计 API 时，优先使用泛型类型而不是 `Object` 类型，以提高类型安全和代码的可维护性。

**总结：** 优先使用泛型类型，这样可以增强代码的类型安全性，避免类型转换错误。

**代码示例：**

```java
// 错误做法：使用 Object 类型
public void printList(List<Object> list) {
    for (Object obj : list) {
        System.out.println(obj);
    }
}

// 正确做法：使用泛型类型
public void printList(List<String> list) {
    for (String str : list) {
        System.out.println(str);
    }
}
```

核心点：使用泛型类型提高代码的可读性和类型安全性，避免转换错误。

------

### 5. 偏好使用泛型方法

泛型方法能够提供比普通方法更多的灵活性，并且支持更强的类型检查。通过泛型方法，代码的复用性和安全性得到提高。

**总结：** 在需要处理不同类型时，使用泛型方法比普通方法更灵活且安全。

**代码示例：**

```java
// 泛型方法：接受任何类型的 List
public <T> void printList(List<T> list) {
    for (T element : list) {
        System.out.println(element);
    }
}
```

核心点：泛型方法提供了更灵活的类型支持，并允许代码复用。

------

### 6. 使用有界通配符提高 API 的灵活性

通过使用有界通配符，您可以在方法中允许更多类型的传递，从而增强 API 的灵活性。

**总结：** 使用有界通配符可以让泛型类型更具灵活性，支持更广泛的类型范围。

**代码示例：**

```java
// 使用有界通配符
public static <T extends Number> void printNumbers(List<T> list) {
    for (T number : list) {
        System.out.println(number);
    }
}
```

核心点：有界通配符允许更广泛的类型传递，提高了 API 的灵活性。

------

### 7. 谨慎结合泛型和可变参数

泛型和可变参数的结合使用可能会引发类型擦除问题，因此在设计 API 时要小心，避免混用两者。

**总结：** 在使用可变参数时应谨慎，避免与泛型一起使用，可能会导致类型擦除和运行时错误。

**代码示例：**

```java
// 错误做法：泛型与可变参数结合可能导致类型擦除问题
public static <T> void printItems(T... items) {
    for (T item : items) {
        System.out.println(item);
    }
}

// 正确做法：避免泛型与可变参数的结合
public static <T> void printItems(List<T> items) {
    for (T item : items) {
        System.out.println(item);
    }
}
```

核心点：避免在泛型方法中使用可变参数，减少潜在的类型擦除问题。

------

### 8. 考虑类型安全的异构容器

有时需要存储不同类型的对象，可以考虑使用类型安全的异构容器，避免使用不安全的类型转换。

**总结：** 使用类型安全的容器可以存储不同类型的对象，同时保持类型安全性。

**代码示例：**

```java
// 使用类型安全的容器
public class Box<T> {
    private T item;

    public void setItem(T item) {
        this.item = item;
    }

    public T getItem() {
        return item;
    }
}
```

核心点：类型安全的容器允许存储不同类型的对象，同时保持类型安全。

------

### 9. 使用通配符时要清楚界限

使用通配符时，要明确其使用的边界，否则可能会导致类型不匹配或操作限制。

**总结：** 使用通配符时应明确界限，避免不必要的类型不匹配。

**代码示例：**

```java
// 使用限制通配符
public static void addNumbers(List<? extends Number> list) {
    for (Number num : list) {
        System.out.println(num);
    }
}
```

核心点：通过明确通配符的边界，确保传递类型的正确性。

------

### 10. 使用泛型时注意类型擦除

类型擦除是泛型的一个重要概念，它意味着在编译时会移除泛型类型，因此在运行时无法获取泛型类型信息。

**总结：** 理解并利用类型擦除的机制，避免对泛型类型的误解和错误使用。

**代码示例：**

```java
// 注意类型擦除
public static <T> void printClassName(T item) {
    System.out.println(item.getClass().getName());
}

// 实际运行时会打印 Item 类型而非泛型参数的实际类型
```

核心点：类型擦除是泛型的基础特性，了解它有助于避免误用泛型。