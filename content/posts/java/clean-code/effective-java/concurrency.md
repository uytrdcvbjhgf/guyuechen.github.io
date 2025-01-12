+++
title = '《Effective Java》精读之并发'
date = 2025-01-12T23:09:15+08:00
categories = ['java']
tags = ['java','effective-java']
+++

### 1. 同步访问共享可变数据

当多个线程访问共享可变数据时，必须进行同步，以防止数据竞争和一致性问题。

**总结：** 为了确保线程安全，必须在访问共享可变数据时使用同步机制。

**代码示例：**

```java
// 错误做法：未同步的多线程访问
public class Counter {
    private int count = 0;

    public void increment() {
        count++;
    }

    public int getCount() {
        return count;
    }
}

// 正确做法：使用同步来确保线程安全
public class Counter {
    private int count = 0;

    public synchronized void increment() {
        count++;
    }

    public synchronized int getCount() {
        return count;
    }
}
```

核心点：通过 `synchronized` 关键字确保对共享可变数据的线程安全访问。

------

### 2. 避免过度同步

过度同步会导致性能问题，尤其是在高并发场景下。应尽量减少不必要的同步。

**总结：** 应仅在必要时进行同步，避免过度同步影响性能。

**代码示例：**

```java
// 错误做法：不必要的同步
public synchronized void updateCounter() {
    // 执行一些操作
    counter.increment();
    // 执行更多操作
}

// 正确做法：仅在访问共享资源时同步
public void updateCounter() {
    counter.increment();
    // 执行其他操作时无需同步
}
```

核心点：只对需要同步的部分进行同步，以提高程序的性能。

------

### 3. 偏向于使用 Executor、任务和流而不是线程

直接操作线程可能导致复杂性增加，应该使用更高级的并发工具，如 `Executor` 和任务，而不是直接使用线程。

**总结：** 使用 `Executor` 和其他并发工具可以减少直接操作线程的复杂度。

**代码示例：**

```java
// 错误做法：直接创建线程
Thread thread = new Thread(() -> {
    // 执行任务
});
thread.start();

// 正确做法：使用 Executor 服务管理线程池
Executor executor = Executors.newFixedThreadPool(10);
executor.submit(() -> {
    // 执行任务
});
```

核心点：通过使用 `Executor` 提供的线程池可以简化并发编程的复杂度。

------

### 4. 偏向于使用并发工具类而不是 `wait` 和 `notify`

`wait` 和 `notify` 是较低级的同步机制，通常容易出错。应优先使用 `java.util.concurrent` 包中的工具类（如 `ReentrantLock`、`CountDownLatch` 等）。

**总结：** 使用高层次的并发工具类可以减少错误并提高代码可读性。

**代码示例：**

```java
// 错误做法：使用 wait 和 notify
public synchronized void processData() {
    while (dataAvailable) {
        wait();  // 等待数据
    }
    // 处理数据
    notify();
}

// 正确做法：使用 CountDownLatch 等并发工具类
public void processData() throws InterruptedException {
    CountDownLatch latch = new CountDownLatch(1);
    // 等待任务完成
    latch.await();
    // 处理数据
}
```

核心点：`java.util.concurrent` 中的工具类提供了更为安全和高效的并发处理机制。

------

### 5. 文档化线程安全性

线程安全性是并发程序设计中的一个重要特性，应在代码中清楚地文档化，以帮助其他开发者理解如何正确地使用。

**总结：** 文档化线程安全性有助于其他开发者理解代码的使用方法和并发限制。

**代码示例：**

```java
// 错误做法：没有文档化线程安全性
public class Counter {
    private int count = 0;

    public synchronized void increment() {
        count++;
    }
}

// 正确做法：文档化线程安全性
/**
 * This class is thread-safe.
 * The increment() method is synchronized to ensure atomicity.
 */
public class Counter {
    private int count = 0;

    public synchronized void increment() {
        count++;
    }
}
```

核心点：清晰的线程安全文档可以帮助其他开发者理解如何正确使用类和方法。

------

### 6. 谨慎使用延迟初始化

延迟初始化可以有效地延后资源的创建，但它需要小心使用，特别是在多线程环境中。

**总结：** 延迟初始化能有效优化性能，但要避免线程安全问题。

**代码示例：**

```java
// 错误做法：延迟初始化没有同步
public class Singleton {
    private static Singleton instance;

    public static Singleton getInstance() {
        if (instance == null) {
            instance = new Singleton();  // 延迟初始化
        }
        return instance;
    }
}

// 正确做法：使用双重检查锁定模式进行线程安全的延迟初始化
public class Singleton {
    private static volatile Singleton instance;

    public static Singleton getInstance() {
        if (instance == null) {
            synchronized (Singleton.class) {
                if (instance == null) {
                    instance = new Singleton();
                }
            }
        }
        return instance;
    }
}
```

核心点：延迟初始化时，确保使用线程安全机制以避免出现并发问题。

------

### 7. 不要依赖线程调度器

线程调度器的行为不可预测，不能依赖它来保证任务的执行顺序。应通过适当的同步机制来控制线程间的交互。

**总结：** 不要依赖线程调度器的行为，必须通过明确的同步机制来控制线程的执行顺序。

**代码示例：**

```java
// 错误做法：依赖线程调度器
public void execute() {
    Thread t1 = new Thread(() -> task1());
    Thread t2 = new Thread(() -> task2());
    t1.start();
    t2.start();
    // 假设线程调度器会保证任务顺序
}

// 正确做法：使用同步机制确保任务顺序
public synchronized void execute() {
    task1();
    task2();
}
```

核心点：应通过明确的同步机制来控制任务的执行顺序，而不是依赖调度器的随机性。

------

### 8. 避免使用线程组

线程组已经被弃用，应该避免使用它们，改用更现代的线程池或其他并发工具。

**总结：** 线程组已经过时，现代并发编程应该使用线程池或 `java.util.concurrent` 中的其他工具类。

**代码示例：**

```java
// 错误做法：使用线程组
ThreadGroup group = new ThreadGroup("group");
Thread t = new Thread(group, () -> task());
t.start();

// 正确做法：使用线程池
Executor executor = Executors.newFixedThreadPool(10);
executor.submit(() -> task());
```

核心点：使用现代的线程池和并发工具来替代过时的线程组。