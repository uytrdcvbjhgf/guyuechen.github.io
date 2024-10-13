+++
title = '代码坏味道之循环语句 (Loops)'
date = 2024-10-13T18:25:36+08:00
categories = ['java']
tags = ['refactor']
+++

**定义**

针对集合或数组进行简单过滤、分组、映 射、遍历操作，采用传统for循环语句进行遍历

**影响**

- 影响代码复杂度，代码不够简洁、直观，不容易理解代码意图

**改进目标**

- 针对可以使用stream替代的for循环，使用stream替代，简化代码

**方法**

- 针对集合或数组过滤、 映射、去重、查找、统计使用stream替代

> 案例：问题代码

**代码背景**

- 现有一堆苹果，需要调查不同种类的苹果的平均重量。

**症状/问题**

- 采用传统循环方法：第1次循环进行分组，第2次循环求平均重量
- 代码复杂度高，需要多次循环嵌套完成，需要10+行代码完成

**重构目标**

- 采用Stream方法使代码更简洁

```java
public class Apple {
    private int id;

    // 苹果颜色
    private String color;

    // 苹果重量
    private int weight;

    private String origin;

    public Apple(int id, String color, int weight, String origin) {
        this.id = id;
        this.color = color;
        this.weight = weight;
        this.origin = origin;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public int getWeight() {
        return weight;
    }

    public void setWeight(int weight) {
        this.weight = weight;
    }

    public String getOrigin() {
        return origin;
    }

    public void setOrigin(String origin) {
        this.origin = origin;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }
}
```

```java
/**
 * 统计苹果信息
 *
 * @author l00266403
 * @since 2021-09-02
 */
public class AppleStatistics {
    /**
     * 求每种颜色苹果的平均重量
     * 
     * @param appleStore 苹果信息
     * @return 每种颜色苹果的平均重量
     */
    public Map<String, Integer> averageWeightByColor(List<Apple> appleStore) {
        Map<String, Integer> result = new HashMap<>();
        // 按颜色分组.
        Map<String, List<Apple>> applesMap = new HashMap<>();
        for (Apple apple : appleStore) {
            List<Apple> apples = applesMap.computeIfAbsent(apple.getColor(), key -> new ArrayList<>());
            apples.add(apple);
        }

        // 求平均重量
        for (Map.Entry<String, List<Apple>> entry : applesMap.entrySet()) {
            int weights = 0;
            for (Apple apple : entry.getValue()) {
                weights += apple.getWeight();
            }
            // get average
            result.put(entry.getKey(), weights / entry.getValue().size());
        }
        return result;
    }
}
```

```java
/**
 * 苹果信息统计client方调用
 *
 * @author l00266403
 * @since 2021-09-02
 */
public class Client {
    public static void main(String[] args) {
        List<Apple> appleStore = new ArrayList<>();
        appleStore.add(new Apple(1, "red", 500, "河南"));
        appleStore.add(new Apple(2, "red", 400, "河南"));
        appleStore.add(new Apple(3, "green", 300, "河南"));
        appleStore.add(new Apple(4, "green", 200, "天津"));
        appleStore.add(new Apple(5, "green", 100, "天津"));

        AppleStatistics appleStatistics = new AppleStatistics();
        appleStatistics.averageWeightByColor(appleStore).forEach((key, value) -> {
            System.out.print(key + ":");
            System.out.println(value);
        });
    }
}
```

> 改进手法：采用stream

```java
/**
 * 统计苹果信息
 *
 * @author l00266403
 * @since 2021-09-02
 */
public class AppleStatistics {
    /**
     * 求每种颜色苹果的平均重量
     *
     * @param appleStore 苹果信息
     * @return 每种颜色苹果的平均重量
     */
    public Map<String, Integer> averageWeightByColor(List<Apple> appleStore) {
        Map<String, Integer> result = new HashMap<>();
        // 按颜色分组.

        // 求平均重量
        appleStore.stream()
            .collect(Collectors.groupingBy(Apple::getColor, Collectors.averagingInt(Apple::getWeight)))
            .forEach((key, value) -> result.put(key, value.intValue()));
        return result;
    }
}
```

> 操作手法

| 操作                 | 快捷键（推荐）                                               | Ctrl+Alt+Shift+T（或：鼠标右键“Refactor”） |
| -------------------- | ------------------------------------------------------------ | ------------------------------------------ |
| 基于IDEA能力重构     | ALT+ENTER——根据提示选 择替换方法（如Replace with sum()、Replace with collect()等） |                                            |
| 内联                 | Ctrl+Alt+N                                                   | Inline xxx                                 |
| 调整代码格式和换行   | Ctrl+Alt+L                                                   |                                            |
| 执行当前代码         | Ctrl+Shift+F10                                               |                                            |
| 执行上一次运行的代码 | Shift+F10                                                    |                                            |

补充：并非所有for循环都是坏味道。for循环作为极其常见的语法，本身没有问题，只是有些对集合、数组遍历的操作，for循环实现比较复杂，可以使用更简洁的stream表达式进行替换。
