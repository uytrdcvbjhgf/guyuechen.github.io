+++
title = '《Effective Java》精读之并发编程'
date = 2024-12-28T21:38:04+08:00
categories = ['java']
tags = ['java','effective-java']
+++

在《Effective Java》第3版中，**并发编程**是一个至关重要的主题，尤其是在多核处理器和分布式系统日益普及的今天。正确使用并发机制可以显著提升应用的性能和响应速度。本文将围绕并发编程的最佳实践展开，帮助你避免常见的并发问题，提高代码的可靠性和可维护性。

## 19. **优先使用高层次的并发API，而不是自己创建线程**

**总结：**
Java提供了丰富的高层次并发API（如`Executor`、`ExecutorService`、`CountDownLatch`等），它们比手动创建和管理线程更加高效和安全。手动管理线程容易导致资源泄漏、线程池过多、线程竞争等问题。应优先使用高层次API，它们为常见的并发任务提供了更高效的解决方案。

**代码示例：**

```java
// 使用手动创建线程
public class Task implements Runnable {
    @Override
    public void run() {
        System.out.println("Task is running...");
    }

    public static void main(String[] args) {
        new Thread(new Task()).start(); // 手动创建线程
    }
}

// 使用ExecutorService创建线程池
public class Task implements Runnable {
    @Override
    public void run() {
        System.out.println("Task is running...");
    }

    public static void main(String[] args) {
        ExecutorService executorService = Executors.newFixedThreadPool(10);
        executorService.submit(new Task()); // 使用线程池执行任务
        executorService.shutdown();
    }
}
```

通过使用`ExecutorService`来管理线程池，我们避免了手动创建和管理线程，确保了线程资源的有效利用和管理。

## 20. **避免共享可变数据**

**总结：**
并发程序中共享可变数据会导致数据竞争和不一致性。为了避免并发问题，最好使用不可变对象或者使用合适的同步机制来保护共享数据。共享不可变数据不需要额外的同步，可以保证线程安全。若必须共享可变数据，使用适当的同步机制，如`ReentrantLock`或`synchronized`。

**代码示例：**

```java
// 错误：多个线程共享可变数据
public class Counter {
    private int count = 0;

    public void increment() {
        count++; // 可能导致并发问题
    }

    public int getCount() {
        return count;
    }
}

// 正确：使用同步方法保证线程安全
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

在这个示例中，`increment()`和`getCount()`方法被同步，以确保对`count`变量的操作是线程安全的。

## 21. **避免死锁**

**总结：**
死锁发生在多个线程互相等待对方释放资源，导致程序无法继续执行。为了避免死锁，可以采取以下措施：尽量按固定顺序获取多个锁、使用`tryLock`方法尝试获取锁、避免不必要的锁等。使用适当的锁策略可以避免死锁的发生。

**代码示例：**

```java
// 死锁示例：线程A和线程B相互等待对方的锁
public class DeadlockExample {
    private final Object lock1 = new Object();
    private final Object lock2 = new Object();

    public void method1() {
        synchronized (lock1) {
            System.out.println("Thread 1: holding lock 1...");
            try { Thread.sleep(100); } catch (InterruptedException e) {}
            synchronized (lock2) {
                System.out.println("Thread 1: holding lock 2...");
            }
        }
    }

    public void method2() {
        synchronized (lock2) {
            System.out.println("Thread 2: holding lock 2...");
            try { Thread.sleep(100); } catch (InterruptedException e) {}
            synchronized (lock1) {
                System.out.println("Thread 2: holding lock 1...");
            }
        }
    }

    public static void main(String[] args) {
        DeadlockExample deadlock = new DeadlockExample();
        Thread thread1 = new Thread(deadlock::method1);
        Thread thread2 = new Thread(deadlock::method2);
        thread1.start();
        thread2.start();
    }
}
```

在此示例中，`method1()`和`method2()`可能导致死锁。为了避免死锁，应该避免两个线程持有两个锁并相互等待。

## 22. **考虑使用`volatile`关键字来保证可见性**

**总结：**
`volatile`关键字用于保证变量的可见性，即当一个线程修改了`volatile`变量的值，其他线程能够立即看到修改结果。`volatile`并不保证操作的原子性，但在一些简单的共享数据场景下，它可以有效地解决可见性问题。

**代码示例：**

```java
// 错误：多个线程访问非volatile变量，可能导致可见性问题
public class VisibilityExample {
    private boolean flag = false;

    public void toggleFlag() {
        flag = !flag;
    }

    public boolean isFlag() {
        return flag;
    }
}

// 正确：使用volatile保证变量的可见性
public class VisibilityExample {
    private volatile boolean flag = false;

    public void toggleFlag() {
        flag = !flag;
    }

    public boolean isFlag() {
        return flag;
    }
}
```

通过将`flag`声明为`volatile`，我们确保了对`flag`变量的写操作在所有线程之间是可见的。

## 23. **避免使用`Thread.stop()`和`Thread.suspend()`**

**总结：**
`Thread.stop()`和`Thread.suspend()`方法已经被弃用，因为它们在操作线程时会引发严重的并发问题，如线程不安全、资源泄漏等。推荐使用更为安全的方式，如使用标志位来控制线程的停止，或者使用`ExecutorService`来管理线程的生命周期。

**代码示例：**

```java
// 错误：使用stop()和suspend()会引发并发问题
public class UnsafeStopExample {
    private Thread thread;

    public void startThread() {
        thread = new Thread(() -> {
            while (true) {
                // 模拟某个任务
            }
        });
        thread.start();
    }

    public void stopThread() {
        thread.stop(); // 不安全的停止线程
    }
}

// 正确：使用标志位来安全停止线程
public class SafeStopExample {
    private Thread thread;
    private volatile boolean running = true;

    public void startThread() {
        thread = new Thread(() -> {
            while (running) {
                // 模拟某个任务
            }
        });
        thread.start();
    }

    public void stopThread() {
        running = false; // 使用标志位来安全停止线程
    }
}
```

在这个例子中，通过使用`running`标志位来安全地停止线程，而不是直接调用已弃用的`Thread.stop()`方法。

------

通过掌握并发编程的最佳实践，你能够写出更加安全、可靠和高效的并发代码。优先使用高层次并发API，避免共享可变数据，注意死锁和线程的停止方法等，能够帮助你有效管理并发任务，提升应用的并发性能和稳定性。