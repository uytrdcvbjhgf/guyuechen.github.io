+++
title = '前端异步编程指南'
date = 2024-09-01T10:20:13+08:00
categories = ["front"]
tags = ["front", "javascript", "Promise", "async"]

+++

## 背景：为什么需要异步？

首先谈一谈前端异步编程的历史背景。

JavaScript 是单线程执行的。这意味着一次只能做一件事，如果一段代码运行时间过长，整个页面就会“卡死”。为了保证**页面流畅**，大多数 I/O 操作（如网络请求、定时器、文件读取等）都采用**异步**方式执行。

### 最初的异步之回调(callback)

早期，异步主要通过**回调函数**来实现。例如：

```js
setTimeout(function() {
    console.log('1秒后执行');
}, 1000);

$.ajax({
    url: '/api/data',
    success: function(data) {
        // 处理数据
    },
    error: function(err) {
        // 处理错误
    }
});
```

**问题**：

- 多重回调嵌套后，代码难以维护，出现 **“回调地狱”（Callback Hell）**
- 错误捕获和流程控制变得复杂



## 1. Promise 的由来与用法

### 1.1. Promise 的由来

Promise 最初由社区提出，并在 ES6 标准中正式纳入。它本质上是**异步操作的状态机**，解决了回调地狱、异步流程难以组合、异常捕获困难等痛点。

#### Promise 三种状态

- **Pending**（进行中）
- **Fulfilled**（已成功）
- **Rejected**（已失败）

状态不可逆，且只能改变一次。

### 1.2. Promise 基础用法

#### 创建 `Promise` 实例

```js
const promise = new Promise((resolve, reject) => {
    // 异步操作
    if (/* 成功 */) {
        resolve('成功结果');
    } else {
        reject('失败原因');
    }
});
```

#### `then` 与 `catch`

```js
promise
    .then(result => {
        console.log('成功', result);
    })
    .catch(error => {
        console.error('失败', error);
    });
```

#### 链式调用与异常捕获

```js
doSomething()
    .then(result => doAnotherThing(result))
    .then(finalResult => {
        // 对最终结果进行操作
    })
    .catch(error => {
        // 捕捉任意环节的异常
    });
```

####  `promise.then(onFulfilled, onRejected);`

```js
var promise = new Promise((resolve, reject) => {
    resolve("传递给then的值");
});
```

创建一个promise对象。

```javascript
promise.then((value) => {
    console.log(value);
}, (error) => {
    console.error(error);
});
```

对这个promise对象定义了处理onFulfilled和onRejected的函数（handler）。

这个promise对象会在变为resolve或者reject的时候分别调用相应注册的回调函数。

- 当handler返回一个正常值的时候，这个值会传递给promise对象的onFulfilled方法。
- 定义的handler中产生异常的时候，这个值则会传递给promise对象的onRejected方法。

#### `promise.catch(onRejected);`

```javascript
promise
    .then(value => console.log(value))
    .catch(error => console.error(error));
```

这是一个等价于`promise.then(undefined, onRejected)` 的语法糖。

####  `Promise.resolve` 与 `Promise.reject`

```js
Promise.resolve(42).then(console.log);
// 控制台打印 42

Promise.reject(new Error("err")).catch(console.error);
// 这还是一个 promise 对象且是 rejected 的
```

- `Promise.resolve(p)` 直接返回 p
- `Promise.reject(p)` 总是返回一个新的 rejected promise

####  `Promise.all` 与 `Promise.race`

```js
Promise.all([p1, p2, p3]).then(values => {
    // 所有成功后返回 [v1, v2, v3]
});

Promise.race([p1, p2, p3]).then(value => {
    // 第一个 settle 的值
});
```



## 2. `async` / `await` 的由来与用法

### 2.1. `async` / `await` 的出现

随着 Promise 普及，虽然回调地狱缓解了，但**复杂的异步流程链式调用依然冗长**，且不够直观。2017 年 ES8（ES2017）引入了 `async` / `await`，让异步代码书写方式**几乎与同步一致**，极大提升可读性。

### 2.2. 基本用法

#### async 函数

`async` 修饰的函数默认返回一个 Promise：

```js
async function foo() {
    return 1; // 等价于 return Promise.resolve(1)
}
```

#### await 表达式

`await` **只能在 async 函数中使用**，等待一个 Promise resolve，拿到 resolve 的值：

```js
async function getData() {
    const res = await fetch('/api/data');
    const json = await res.json();
    return json;
}
```

#### 错误捕获

结合 try / catch，可优雅处理异常：

```js
async function safeRequest() {
    try {
        const res = await fetch('/api/data');
        const data = await res.json();
        return data;
    } catch (err) {
        console.error('请求失败:', err);
        // 可以选择继续 throw
    }
}
```



### 2.3. 串行与并行

#### 串行异步（等待上一步结果）

```js
async function serial() {
    const a = await fetch('/api/a');
    const b = await fetch('/api/b?ref=' + (await a).id);
    return [a, b];
}
```

#### 并行异步（互不依赖，效率更高）

```js
async function parallel() {
    const [a, b] = await Promise.all([
        fetch('/api/a'),
        fetch('/api/b'),
    ]);
    return [a, b];
}
```

**最佳实践**：

- 不依赖的异步任务尽量用 `Promise.all` 提高效率
- 只要 await 写在赋值左侧，就是并行，否则就是串行



### 2.4. for 循环异步与最佳实践

#### 错误写法（全部串行，性能差）

```js
async function wrongLoop(arr) {
    for (let item of arr) {
        await doAsync(item);
    }
}
```

#### 最佳写法（并行批量发起）

```js
async function rightLoop(arr) {
    await Promise.all(arr.map(item => doAsync(item)));
}
```

**补充说明**：

- 如果顺序强依赖，必须串行 await
- 如果只需全部完成，Promise.all 并行即可



### 2.5. `async` / `await` 的局限

- 不能直接捕获顶层未处理的 promise reject（需 try / catch 或 catch）
- 多层 await 串行会有性能损失
- 并发控制、超时处理需要手动实现



## 3. `Promise` 与 `async` / `await` 的实践建议

- **推荐优先用 `async` / `await`**，搭配 try / catch，使异步逻辑结构清晰
- 多个异步任务可用 `Promise.all` 批量并行，提高效率
- 针对异步异常，**务必捕获处理**，避免“未捕获 Promise 错误”导致页面崩溃
- 注意 async 函数返回值始终是 Promise，调用方要用 await 或 then 获取结果



## 4. 代码示例

### 回调地狱

```js
getData(function(res1) {
    getMore(res1, function(res2) {
        getFinal(res2, function(res3) {
            // do something
        });
    });
});
```

### `Promise` 优化

```js
getData()
    .then(res1 => getMore(res1))
    .then(res2 => getFinal(res2))
    .then(res3 => {
        // do something
    })
    .catch(err => {
        // 错误集中处理
    });
```

### `async` / `await` 极简重写

```js
async function main() {
    try {
        const res1 = await getData();
        const res2 = await getMore(res1);
        const res3 = await getFinal(res2);
        // do something
    } catch (err) {
        // 错误处理
    }
}
```



## 5. 参考文献

- [JavaScript Promise迷你书](http://liubin.org/promises-book)
- [MDN - Promise](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise)
- [MDN - async/await](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/async_function)
- [异步编程: 一次性搞懂 Promise, async, await (#js #javascript) - Bilibili 视频](https://www.bilibili.com/video/BV1WP4y187Tu/?spm_id_from=333.337.search-card.all.click&vd_source=6f178e5bb1d1bb35491b6cee8bc840e8)
- [You Don’t Know JS - Async & Performance](https://github.com/getify/You-Dont-Know-JS/blob/2nd-ed/async %26 performance/ch2.md)