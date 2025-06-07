+++
title = 'JavaScript的单线程与异步的本质'
date = 2025-06-07T13:34:06+09:00
categories = ["front"]
tags = ["front","javascript"]

+++

### 为什么 JavaScript 是单线程？

JavaScript 的设计初衷是操作网页（DOM），单线程可以避免多个线程同时操作页面导致的竞态和一致性问题。
 这也决定了 JS**只能同时做一件事**。

### 异步的本质：事件循环（Event Loop）

JavaScript 通过**事件循环机制**实现异步。JS 引擎本身只有一个主线程（执行栈），但浏览器（或 Node.js）环境在底层配合有任务队列与事件触发：

- **主线程**：执行同步代码
- **任务队列**（Task Queue）：存放待执行的异步回调（如 setTimeout、Promise.then、I/O 完成等）
- **事件循环**（Event Loop）：主线程空闲时，不断检查任务队列，将回调取出并执行

#### 直观图示（伪代码流程）

```mermaid
graph LR
A[主线程执行同步代码] --> B{遇到异步任务?}
B --是--> C[注册回调, 放入任务队列]
B --否--> D[继续执行主线程]
C --> D
D --> E{主线程空闲?}
E --是--> F[事件循环取队列回调, 推入主线程]
E --否--> D
```

### 与 Java 多线程的本质区别

|          | JavaScript                    | Java 多线程                    |
| -------- | ----------------------------- | ------------------------------ |
| 并发方式 | 单线程 + 事件循环             | 多线程 (多CPU核心并行)         |
| 任务调度 | 由事件循环与任务队列驱动      | 由 OS 线程调度（抢占/协作式）  |
| 内存隔离 | 单线程无并发共享问题          | 线程间需同步/锁                |
| 常见异步 | I/O、定时器、Promise          | 线程、线程池、Future、Executor |
| 并行能力 | 真正**并行**需借助 Web Worker | 多线程可并行                   |
| 编码模式 | Promise、async/await、回调    | synchronized、Future、Lock     |

**结论**：

- **JavaScript 异步=“伪并发”，单线程保证安全，事件循环负责调度。**
- **Java 真正多线程=“真并发”，线程间数据同步复杂。**






## 并发控制、超时处理 —— 为什么要“手动实现”？如何写？

### 1. 并发控制

比如有 100 个任务要处理，但只允许最多并发 5 个：

```js
async function asyncPool(limit, arr, iteratorFn) {
    const ret = [];
    const executing = [];
    for (const item of arr) {
        const p = Promise.resolve().then(() => iteratorFn(item));
        ret.push(p);

        if (limit <= arr.length) {
            const e = p.then(() => executing.splice(executing.indexOf(e), 1));
            executing.push(e);
            if (executing.length >= limit) {
                await Promise.race(executing);
            }
        }
    }
    return Promise.all(ret);
}

// 使用示例
await asyncPool(5, tasks, task => fetchTask(task));
```

**解释**：

- `executing` 数组记录当前并发中的 Promise
- 超过最大数量时，`await Promise.race(executing)` 等待最早完成的一个
- **这样 JS 代码手动控制最大并发数**



### 2. 超时处理

Promise 本身没有内置超时。需要结合 `Promise.race` 手动实现：

```js
function fetchWithTimeout(promise, ms) {
    const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), ms)
    );
    return Promise.race([promise, timeout]);
}

// 用法
try {
    const data = await fetchWithTimeout(fetch('/api/data'), 1000);
    console.log(data);
} catch (err) {
    console.error('请求超时或失败:', err);
}
```

**原理**：

- `Promise.race` 谁先完成用谁，fetch 超时就会抛错
- 这是“手动实现”超时



## 总结性补充

- **JavaScript 的异步本质是单线程事件循环**，与 Java 多线程“真并发”完全不同
- **await 在赋值左侧**（即“同时获取 Promise，再 await”）就是并发，否则就是串行
- **并发控制和超时**是实际开发中非常常见但需自己实现的技巧