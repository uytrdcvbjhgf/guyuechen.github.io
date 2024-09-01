+++
title = 'Promise'
date = 2024-09-01T10:20:13+08:00
categories = ["front"]
tags = ["front", "javascript", "Promise"]
+++
---
title: Promise
description: 
published: true
date: 2024-01-04T05:08:04.348Z
tags: javascript, promise
editor: markdown
dateCreated: 2024-01-04T05:08:04.348Z
---

# Promise

## 1. Promises API Reference

### 1.1. Promise#then

```javascript
promise.then(onFulfilled, onRejected);
```

then代码示例

```javascript
var promise = new Promise((resolve, reject) => {
    resolve("传递给then的值");
});
promise.then((value) => {
    console.log(value);
}, (error) => {
    console.error(error);
});
```

这段代码创建一个promise对象，定义了处理onFulfilled和onRejected的函数（handler），然后返回这个promise对象。

这个promise对象会在变为resolve或者reject的时候分别调用相应注册的回调函数。

- 当handler返回一个正常值的时候，这个值会传递给promise对象的onFulfilled方法。
- 定义的handler中产生异常的时候，这个值则会传递给promise对象的onRejected方法。

### 1.2. Promise#catch

```javascript
promise.catch(onRejected);
```

catch代码示例

```javascript
var promise = new Promise((resolve, reject) => {
    resolve("传递给then的值");
});
promise.then((value) => {
    console.log(value);
}).catch((error) => {
    console.error(error);
});
```

这是一个等价于`promise.then(undefined, onRejected)` 的语法糖。

### 1.3. Promise.resolve

```javascript
Promise.resolve(promise);
Promise.resolve(thenable);
Promise.resolve(object);
```

Promise.resolve代码示例

```javascript
var taskName = "task 1"
asyncTask(taskName).then((value) => {
    console.log(value);
}).catch((error) => {
    console.error(error);
});
function asyncTask(name){
    return Promise.resolve(name).then((value) => {
        return "Done! "+ value;
    });
}
```

根据接收到的参数不同，返回不同的promise对象。

虽然每种情况都会返回promise对象，但是大体来说主要分为下面3类。

- 接收到promise对象参数的时候

  返回的还是接收到的promise对象

- 接收到thenable类型的对象的时候

  返回一个新的promise对象，这个对象具有一个 `then` 方法

- 接收的参数为其他类型的时候（包括JavaScript对或null等）

  返回一个将该对象作为值的新promise对象

### 1.4. Promise.reject

```javascript
Promise.reject(object)
```

Promise.reject代码示例

```javascript
var failureStub = sinon.stub(xhr, "request").returns(Promise.reject(new Error("bad!")));
```

返回一个使用接收到的值进行了reject的新的promise对象。

而传给Promise.reject的值也应该是一个 `Error` 类型的对象。

另外，和 Promise.resolve不同的是，即使Promise.reject接收到的参数是一个promise对象，该函数也还是会返回一个全新的promise对象。

```javascript
var r = Promise.reject(new Error("error"));
console.log(r === Promise.reject(r));// false
```

### 1.5. Promise.all

```javascript
Promise.all(promiseArray);
```

Promise.all代码示例

```javascript
var p1 = Promise.resolve(1),
    p2 = Promise.resolve(2),
    p3 = Promise.resolve(3);
Promise.all([p1, p2, p3]).then((results) => {
    console.log(results);  // [1, 2, 3]
});
```

生成并返回一个新的promise对象。

参数传递promise数组中所有的promise对象都变为resolve的时候，该方法才会返回， 新创建的promise则会使用这些promise的值。

如果参数中的任何一个promise为reject的话，则整个Promise.all调用会立即终止，并返回一个reject的新的promise对象。

由于参数数组中的每个元素都是由 `Promise.resolve` 包装（wrap）的，所以Paomise.all可以处理不同类型的promose对象。

### 1.6. Promise.race

```javascript
Promise.race(promiseArray);
```

Promise.race代码示例

```javascript
var p1 = Promise.resolve(1),
    p2 = Promise.resolve(2),
    p3 = Promise.resolve(3);
Promise.race([p1, p2, p3]).then((value) => {
    console.log(value);  // 1
});
```

生成并返回一个新的promise对象。

参数 promise 数组中的任何一个promise对象如果变为resolve或者reject的话， 该函数就会返回，并使用这个promise对象的值进行resolve或者reject。

> 参考文献

[JavaScript Promise迷你书](http://liubin.org/promises-book)



## 2. `async`、`await`

> 参考文献

[异步编程: 一次性搞懂 Promise, async, await (#js #javascript)](https://www.bilibili.com/video/BV1WP4y187Tu/?spm_id_from=333.337.search-card.all.click&vd_source=6f178e5bb1d1bb35491b6cee8bc840e8)