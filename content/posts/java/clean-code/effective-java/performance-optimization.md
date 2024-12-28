+++
title = '《Effective Java》精读之性能优化'
date = 2024-12-28T21:49:57+08:00
categories = ['java']
tags = ['java','effective-java']
+++

在《Effective Java》第3版中，**性能优化**是提高程序效率和响应速度的关键部分。虽然性能优化通常需要权衡其他因素（如可维护性、可读性等），但通过遵循最佳实践，我们可以在不牺牲代码质量的情况下提升性能。本篇文章将探讨一些关于性能优化的重要实践，帮助你写出更加高效的Java代码。

## 34. **优先使用基本类型而不是包装类型**

**总结：**

基本类型（如`int`、`long`、`boolean`等）比包装类型（如`Integer`、`Long`、`Boolean`）更高效，因为包装类型不仅在内存中占用更多空间，还涉及到拆箱和装箱操作，这会带来性能开销。因此，应该优先使用基本类型，尤其是在性能要求较高的代码中。

**代码示例：**

```java
// 错误：使用包装类型
public class PerformanceTest {
    public int sum(List<Integer> numbers) {
        int total = 0;
        for (Integer number : numbers) {
            total += number; // 拆箱操作
        }
        return total;
    }
}

// 正确：使用基本类型
public class PerformanceTest {
    public int sum(int[] numbers) {
        int total = 0;
        for (int number : numbers) {
            total += number; // 没有拆箱操作
        }
        return total;
    }
}
```

通过使用基本类型数组，我们消除了装箱和拆箱带来的额外开销。

## 35. **避免不必要的对象创建**

**总结：**

频繁地创建和销毁对象会给系统带来额外的内存消耗和垃圾回收压力。在性能敏感的场景中，尽量避免不必要的对象创建。可以使用对象池、缓存或者复用对象来减少对象的创建频率，从而提高性能。

**代码示例：**

```java
// 错误：频繁创建临时对象
public class PerformanceTest {
    public void processData(String[] data) {
        for (String str : data) {
            String trimmedStr = new String(str.trim()); // 创建不必要的临时对象
            // 处理trimmedStr
        }
    }
}

// 正确：复用对象
public class PerformanceTest {
    public void processData(String[] data) {
        for (String str : data) {
            String trimmedStr = str.trim(); // 直接使用原对象
            // 处理trimmedStr
        }
    }
}
```

通过避免在循环中创建不必要的对象，我们可以降低内存消耗并减少GC的负担。

## 36. **使用合适的数据结构**

**总结：**

选择合适的数据结构对于程序性能至关重要。例如，`ArrayList`适用于随机访问，但`LinkedList`适用于频繁插入和删除操作。如果选择不当，可能会导致不必要的性能瓶颈。熟悉不同数据结构的时间复杂度，并根据实际需求选择最合适的结构。

**代码示例：**

```java
// 错误：使用ArrayList进行频繁插入操作
public class PerformanceTest {
    public void addElements(List<Integer> list) {
        for (int i = 0; i < 100000; i++) {
            list.add(0, i); // 频繁在开头插入元素，效率低
        }
    }
}

// 正确：使用LinkedList进行频繁插入操作
public class PerformanceTest {
    public void addElements(List<Integer> list) {
        for (int i = 0; i < 100000; i++) {
            list.add(0, i); // 使用LinkedList，效率较高
        }
    }
}
```

在进行频繁插入操作时，使用`LinkedList`能显著提升性能，因为它的插入操作时间复杂度为O(1)，而`ArrayList`为O(n)。

## 37. **减少方法调用的开销**

**总结：**

虽然方法调用是非常常见的操作，但每次方法调用都会涉及到一些开销（如栈操作、参数传递等）。在性能敏感的代码中，尽量避免频繁的深层嵌套方法调用，尤其是在循环中，尽量将计算逻辑内联或提取到外部。

**代码示例：**

```java
// 错误：频繁调用方法，导致开销较大
public class PerformanceTest {
    public int calculateSum(int[] numbers) {
        int sum = 0;
        for (int number : numbers) {
            sum += add(number); // 每次调用方法
        }
        return sum;
    }

    private int add(int number) {
        return number; // 简单的加法操作
    }
}

// 正确：将逻辑内联，减少方法调用开销
public class PerformanceTest {
    public int calculateSum(int[] numbers) {
        int sum = 0;
        for (int number : numbers) {
            sum += number; // 直接在循环中执行
        }
        return sum;
    }
}
```

通过将加法操作内联到循环中，避免了每次迭代时的`add`方法调用，从而减少了不必要的开销。

## 38. **使用`StringBuilder`进行字符串拼接**

**总结：**

在Java中，`String`是不可变的，每次拼接字符串时都会生成新的`String`对象。如果在循环中进行大量字符串拼接，会造成大量临时对象的创建，影响性能。因此，应该使用`StringBuilder`来进行字符串拼接，它避免了不必要的对象创建。

**代码示例：**

```java
// 错误：在循环中使用字符串拼接
public class PerformanceTest {
    public String concatenate(String[] words) {
        String result = "";
        for (String word : words) {
            result += word; // 每次拼接都会创建新的String对象
        }
        return result;
    }
}

// 正确：使用StringBuilder拼接字符串
public class PerformanceTest {
    public String concatenate(String[] words) {
        StringBuilder result = new StringBuilder();
        for (String word : words) {
            result.append(word); // 使用StringBuilder拼接
        }
        return result.toString();
    }
}
```

`StringBuilder`在拼接字符串时不会创建新的对象，而是修改原有的字符序列，因此在性能敏感的场景中非常有用。

## 39. **缓存常用的计算结果**

**总结：**

对于一些耗时的计算，可以考虑将计算结果缓存起来，以便在后续需要时直接使用，避免重复计算。这种优化方式称为“缓存”或“记忆化”。使用合适的缓存策略可以显著提高程序的响应速度。

**代码示例：**

```java
// 错误：每次计算结果时都重新计算
public class PerformanceTest {
    public int expensiveCalculation(int input) {
        // 模拟昂贵的计算
        return input * input; // 计算平方
    }
}

// 正确：缓存计算结果
public class PerformanceTest {
    private Map<Integer, Integer> cache = new HashMap<>();

    public int expensiveCalculation(int input) {
        if (!cache.containsKey(input)) {
            cache.put(input, input * input); // 缓存计算结果
        }
        return cache.get(input);
    }
}
```

通过缓存已经计算过的结果，后续相同的计算可以直接返回缓存的值，避免重复的昂贵计算。

------

通过遵循这些性能优化的最佳实践，你可以显著提升Java应用程序的效率和响应速度。优先使用基本类型、避免不必要的对象创建、选择合适的数据结构，以及减少方法调用的开销，都是提升性能的有效手段。此外，合理使用`StringBuilder`、缓存计算结果等技术，能够帮助你优化性能瓶颈。