+++
title = '浏览器存储'
date = 2024-09-01T10:17:54+08:00
categories = ["front"]
tags = ["front","javascript"]
+++

## 前言

通常我们认为只有服务器端才涉及到数据持久化，才会和数据库打交道，实际上，随着现代浏览器的功能不断增强，以及HTML5 的普及，越来越多的网站开始考虑，将大量数据储临时或永久地存储在客户端，这样可以减少网络开销，提升交互速度。

对于我们的日常开发，尤其是前端程序员来说，尤为重要。

本次，我就将包括HTML5的新特性的一些，关于浏览器端的本地存储相关的常用解决方案或策略做一下梳理，帮助大家对其概念的理解以及使用方法的掌握。



## 请考虑以下功能需求

- 开发一个基于Session的认证模块
- 开发一个基于token的认证模块
- 在各个Web页面之间实现数据的临时传递
- 当网络在Offline的情况下，依旧能够通过我们的系统录入/保存数据，并在Online的时候同步到DB中



## 何为“本地”存储

这里所说本地存储特指浏览器端存数据持久化，即将数据临时或永久保存到浏览器端的能力，说白了就是将数据存储到本地，在需要的时候进行调用。

比如我们熟知的Cookie，在HTML5标准中，又新加入了WebStorage的特性，另外还有IndexedDB，它们一起强化了浏览器端的存储能力。



## 发展历程

![image-20240901102457285](https://gyc-pic-for-typora.oss-cn-shanghai.aliyuncs.com/img_for_typora/202409011025394.png)

本次我将介绍以下几本种常见的解决方案：

- Cookie
- WebStorage
- IndexedDB



## Cookie

Cookie，即HTTP Cookie，是服务器发送到用户浏览器（或使用JS在浏览器端做成）的一小块数据。浏览器会存储 cookie 并在下次向同一服务器再发起请求时携带并发送到服务器上。通常，它用于告知服务端两个请求是否来自同一浏览器（保持用户的登录状态）。Cookie 使基于无状态[1]的 HTTP 协议记录稳定的状态信息成为了可能。

[1] : http的每一次请求都是一次全新的，独立的请求,服务器不保存该客户端已经登录过的状态。

![image-20240901102523940](https://gyc-pic-for-typora.oss-cn-shanghai.aliyuncs.com/img_for_typora/202409011025000.png)

- Cookie只适合存储很小的数据（最大为4KB）；
- Cookie数据**始终**在同源的请求中携带（即使不需要）；
- Cookie可以设置过期时间，其在过期时间之前一直有效，即使窗口或浏览器关闭；
- Cookie受同源策略的限制；
- Cookie通常用于保存用户登录状态，跟踪用户行为，创建购物车；

如何查看Cookie？以Chrome为例如下所示：

![image-20240901102546826](https://gyc-pic-for-typora.oss-cn-shanghai.aliyuncs.com/img_for_typora/202409011025873.png)

------

```javascript
// 设置cookie
function setCookie(name, value, exdays) {
	var d = new Date();
	d.setTime(d.getTime() + (exdays*24*60*60*1000));
	var expires = "expires="+d.toUTCString();
	document.cookie = name + "=" + value + "; " + expires;
}

// 获取cookie
function getCookie(name) {
	var cookies = document.cookie.split("; ");
	for ( var i = 0; i < cookies.length; i++) {
		var str = cookies[i].split("=");
		if (str[0] != name)
			continue;
		return unescape(str[1]);
	}
	return "";
}

// 清除cookie  
function clearCookie(name) {  
	setCookie(name, "", -1);  
} 
```



## WebStorage

Web Storage API 使浏览器能以一种比使用 Cookie 更直观的方式存储键值对。

- WebStorage 包含两种机制：**sessionStorage** 和 **localStorage**，他们拥有相同的API；
- sessionStorage 为每一个给定的源提供一个独立的存储区域，该存储区域**在会话结束前即浏览器（也包括Tab页）关闭前可用**（即只要浏览器处于打开状态，包括页面刷新），当页面被关闭时，存储在 sessionStorage 的数据会被清除；
- localStorage 拥有和sessionStorage同样的功能，但是比起sessionStorage，**它的数据是永久保存的，即使关闭浏览器**，下次打开同源窗口（也包括Tab页）依然可用；
- WebStorage 在不同的浏览器之间无法共享，即使是同一个页面；
- `a target="_blank"`, `window.location.href`，`window.open` 打开新的页面时，新页面会复制父页面的 sessionStorage，但它们是相互独立的，不互相影响；
- **键值对总是以字符串的形式存储**（JSON需要转换成字符串）；
- WebStorage的api调用是**同步**的，对其他的操作，如画面渲染会造成阻塞；
- 受同源策略的限制；
- 相较Cookie，WebStorage的API接口使用更方便；
- sessionStorage适用于同源页面直接的数据传递；
- 相较于sessionId存放到Cookie，Token信息更多的时候是放在WebStorage中的；

------

```javascript
 // 增,改
 sessionStorage.setItem('key','value');
 sessionStorage.key = 'value';
 sessionStorage['key'] = 'value';

 // 查
 sessionStorage.getItem('key');
 sessionStorage.key;
 sessionStorage['key'];
 // 如果存在的话返回true，不存在返回false
 sessionStorage.hasOwnProperty("key")

 // 删
 sessionStorage.removeItem('key');
 delete sessionStorage.key;
 delete sessionStorage['key'];
 sessionStorage.clear()
```



## IndexedDB

IndexedDB是HTML5规范里新加入的一组底层 API，用于在浏览器端存储大量的结构化数据。

- 通俗的讲，IndexedDB就是浏览器提供的一个本地数据库，可以被网页脚本创建和操作；
- 它更接近于NoSQL数据库，与关系型数据库比较，NoSQL数据库适用于数据模型简单，高并发的读写需求；
- IndexedDB的存储空间是没有限制的(取决于本地硬盘的容量)，可以解决localStorage存储空间受限的问题；
- IndexedDB API大部分都是异步的，在使用异步方法的时候，API不会立马返回要查询的数据，而是返回一个callback，减少了阻塞，提升了用户体验；
- IndexedDB 内部采用对象仓库（object store）存放数据，相当于表的概念。包括 JavaScript 对象，所有类型的数据都可以直接存入。对象仓库中，数据以"键值对"的形式保存；
- 支持事务（transaction），事务的提交时自动完成的，无需手动提交；
- 支持二进制数据的存储；
- 支持基于索引的高性能查询；
- IndexedDB受同源策略的限制，每个源都会关联到不同的数据库集合，不同源之间无法互访数据；
- IndexedDB 使得数据的保存不受网络的限制，适用于Offline期间的数据保存；



### 基本的使用模式

```javascript
var request = window.indexedDB.open(dbInfo.name, dbInfo.version);
request.onupgradeneeded = function () {
	db = event.target.result;
	if (!db.objectStoreNames.contains('task')) {
		objectStore = db.createObjectStore('task', { keyPath: 'id' });
	}
	objectStore.createIndex('idxName', 'name', { unique: false });
}
var request = db.transaction(['task'], 'readwrite')
	.objectStore('task')
	.add(getData());
request.onsuccess = function () {
	console.log('插入数据成功');
}
request.onerror = function () {
	console.log('插入数据失败');
};
request.onsuccess = function () {
	if (request.result) {
		console.table(request.result);
		for (let item of request.result) {
			render(item);
		}

	} else {
		console.log('没有你想要的数据');
	}
};
```



### 常用的第三方库

- localForage：一个简单的 Polyfill，提供了简单的客户端数据存储的值语法。它在后台使用 IndexedDB，并在不支持 IndexedDB 的浏览器中回退到 WebSQL 或 localStorage。
- Dexie.js：IndexedDB 的包装，通过简单的语法，可以更快地进行代码开发。
- ZangoDB：类似 MongoDB 的 IndexedDB 接口，支持 MongoDB 的大多数熟悉的过滤、投影、排序、更新和聚合功能。
- JsStore：一个带有 SQL 语法的 IndexedDB 包装器。
- MiniMongo：由 localstorage 支持的客户端内存中的 mongodb，通过 http 进行服务器同步。MeteorJS 使用 MiniMongo。

参考网站：[IndexedDB API - Web APIs | MDN](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)



### Demo

```html
<!doctype html>
<html>

	<head>
		<meta charset="utf-8">
		<title>IndexedDB DEMO</title>
		<script>
			var db;
			/**
		     * 打开或新建数据库
		     *
		     * @param
		     * @return
		     */
			function openDB() {
				var dbInfo = { name: 'localDB', version: 1 };
				var request = window.indexedDB.open(dbInfo.name, dbInfo.version);
				request.onerror = function () {
					console.log('数据库打开失败');
				};
				request.onsuccess = function () {
					db = request.result;
					console.log('成功打开数据库');
				};
				// 当数据库版本升级的时候触发
				request.onupgradeneeded = function () {
					debugger;
					db = event.target.result;
					if (!db.objectStoreNames.contains('task')) {
						// 创建名叫task的数据仓库，并设id为主键
						objectStore = db.createObjectStore('task', { keyPath: 'id' });
					}
					// 在name属性上创建索引，unique标识该索引是否可以重复
					objectStore.createIndex('idxName', 'name', { unique: false });

				}
			}
			/**
		     * 关闭数据库
		     *
		     * @param
		     * @return
		     */
			function closeDB() {
				db.close();
			}
			/**
		     * 删除数据库
		     *
		     * @param
		     * @return
		     */
			function deleteDB() {
				indexedDB.deleteDatabase('localDB');
			}
			/**
		     * 插入新数据，使用add方法
		     *
		     * @param
		     * @return
		     */
			function add() {
				// 创建事务
				var request = db.transaction(['task'], 'readwrite')
					.objectStore('task')
					.add(getData());
				request.onsuccess = function () {
					console.log('插入数据成功');
				}
				request.onerror = function () {
					console.log('插入数据失败');
				};
			}
			function read() {
				document.getElementById('dataArea').innerHTML = '';
				var id = document.getElementById('id').value;
				queryData(id);
			}
			/**
		     * 按主键查询新数据，使用get方法
		     *
		     * @param
		     * @return
		     */
			function queryData(condition) {
				var request = db.transaction(['task'], 'readonly')
					.objectStore('task')
					.get(condition);
				request.onerror = function () {
					console.log('读取数据失败');
				};
				request.onsuccess = function () {
					if (request.result) {
						render(request.result);
					} else {
						console.log('没有你想要的数据');
					}
				};
			}
			function readByIndex() {
				document.getElementById('dataArea').innerHTML = '';
				var name = document.getElementById('name').value;
				queryDataByIndex(name);
			}
			/**
		     * 按索引查询新数据，使用getAll方法
		     *
		     * @param
		     * @return
		     */
			function queryDataByIndex(condition) {
				var request = db.transaction(['task'], 'readonly')
					.objectStore('task')
					// 指定索引
					.index('idxName')
					.getAll(condition);
				request.onerror = function () {
					console.log('读取数据失败');
				};
				request.onsuccess = function () {
					if (request.result) {
						console.table(request.result);
						for (let item of request.result) {
							render(item);
						}

					} else {
						console.log('没有你想要的数据');
					}
				};
			}
			/**
		     * 使用游标，读取所有数据
		     *
		     * @param
		     * @return
		     */
			function readAll() {
				document.getElementById('dataArea').innerHTML = '';
				var request = db.transaction(['task'], 'readonly')
					.objectStore('task')
					// .objectStore('task').getAll();
					// request.onsuccess = function () {
					// if (request.result) {
					//   console.table(request.result);
					//   for (let item of request.result) {
					//     render(item);
					//   }

					// } else {
					//   console.log('没有你想要的数据');
					// }
					// };
					.openCursor().onsuccess = function () {
						var cursor = event.target.result;
						if (cursor) {
							console.table(cursor.value);
							render(cursor.value);
							cursor.continue();
						} else {
							console.log('没有数据了');
						}
					};
			}
			/**
		     * 更新数据，使用put方法
		     *
		     * @param
		     * @return
		     */
			function updateData() {
				var request = db.transaction(['task'], 'readwrite')
					.objectStore('task')
					.put(getData());
				request.onsuccess = function () {
					console.log('数据更新成功');
				};
				request.onerror = function () {
					console.log('数据更新失败');
				}
			}
			function remove() {
				var id = document.getElementById('id').value;
				deleteData(id);
			}
			/**
		     * 删除数据，使用delete方法
		     *
		     * @param
		     * @return
		     */
			function deleteData(id) {
				var request = db.transaction(['task'], 'readwrite')
					.objectStore('task')
					.delete(id);
				request.onsuccess = function () {
					console.log('数据删除成功');
				};
				request.onerror = function () {
					console.log('数据删除失败');
				}
			}
			function getData() {
				return {
					id: document.getElementById('id').value,
					name: document.getElementById('name').value,
					content: document.getElementById('content').value,
				}
			}
			function render(obj) {
				var li = document.createElement('li');
				li.style.margin = '12px';
				li.style.borderBottom = '1px black solid'
				li.innerHTML = '&nbsp编号：' + obj.id + '&nbsp&nbsp名称：' + obj.name + '&nbsp&nbsp内容：' + obj.content;
				document.getElementById('dataArea').appendChild(li);
			}
		</script>
	</head>

	<body>
		<h2>IndexedDB DEMO</h2>
		<div style="margin:20px 0; padding: 20px;">
			<label>编号 :</label><input type="text" id="id" style="width: 100px; height: 20px;" />
			<label>名称 :</label><input type="text" id="name" style="width: 100px; height: 20px;" />
			<label>内容 :</label><input type="text" id="content" style="width: 100px; height: 20px;" />
		</div>
		<div><input type="button" value="打开/新建数据库" onclick="openDB()"
				 style="margin:10px 0 0 0; width: 120px; height: 30px;" /></div>
		<div><input type="button" value="关闭数据库" onclick="closeDB()" style="margin:10px 0 0 0; width: 120px;height: 30px;" />
		</div>
		<div><input type="button" value="删除数据库" onclick="deleteDB()" style="margin:10px 0 0 0; width: 120px;height: 30px;" />
		</div>
		<div><input type="button" value="插入数据" onclick="add()" style="margin:10px 0 0 0; width: 120px;height: 30px;" /></div>
		<div><input type="button" value="更新数据" onclick="updateData()" style="margin:10px 0 0 0; width: 120px;height: 30px;" />
		</div>
		<div><input type="button" value="删除数据" onclick="remove()" style="margin:10px 0 0 0; width: 120px;height: 30px;" />
		</div>
		<div><input type="button" value="检索数据" onclick="read()" style="margin:10px 0 0 0; width: 120px;height: 30px;" /></div>
		<div><input type="button" value="索引检索数据" onclick="readByIndex()"
				 style="margin:10px 0 0 0; width: 120px;height: 30px;" /></div>
		<div><input type="button" value="列出所有数据" onclick="readAll()"
				 style="margin:10px 0 10px 0; width: 120px;height: 30px;" /></div>

		<ul id="dataArea" style="margin:10px 0; border: 1px black solid; border-radius:5px; padding: 20px; width:600px"></ul>
	</body>

</html>
```

[📎DEMO_IndexededDB.html](https://www.yuque.com/attachments/yuque/0/2023/html/28570332/1681025641955-9d8c2777-ddf5-4052-996b-09dd15c865ce.html)



## 比较

![image-20240901102610375](https://gyc-pic-for-typora.oss-cn-shanghai.aliyuncs.com/img_for_typora/202409011026423.png)



## 案例介绍

![image-20240901102635012](https://gyc-pic-for-typora.oss-cn-shanghai.aliyuncs.com/img_for_typora/202409011026075.png)