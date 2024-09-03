+++
title = 'Idea快捷键汇总'
date = 2024-09-03T22:11:48+08:00
categories = ["java"]
tags = ["java", "idea"]
+++

## 1 前言

正确使用快捷键可以明显提高编码效率。本文对Idea常用快捷键进行了分类汇总。

文中汇总的快捷键均为 Intellij IDEA 默认的快捷键。快捷键的搜索、配置、常见冲突等，可以查看附录。

## 2 涉及的快捷键汇总

IDEA 中使用重构功能，主要包括以下 4 种方式：

1. 直接使用快捷键，如 `Ctrl+Alt+M`
2. `Alt+Enter`，根据 IDEA 的提示进行重构
3. `Ctrl+Alt+Shift+T` 打开重构面板进行重构，如：`Ctrl+Alt+Shift+T->Extract Method`
4. 鼠标右键，利用 Refactor 面板进行重构，如：`鼠标右键->Refactor->Extract Method`

这里会对 4 种方式都进行介绍，
但建议优先使用 1）和 2）；
无对应的直接快捷键或快捷 键冲突时，优先使用 3）

（注：在不同版本的 IDEA 中，Ctrl+Alt+Shift+T 或鼠标打开重构面板中，操作名称略有区 别，如 2019 版本提炼方法是："Extract Method"，而在最新版中是："Method"）

### 2.1 测试相关

| 快捷键           | 功能描述                                 |
| ---------------- | ---------------------------------------- |
| `Ctrl+Shift+F10` | 执行当前光标所在位置的类/方法            |
| `Shift+F10`      | 执行上次运行的类/方法                    |
| `Ctrl+Shift+T`   | 类和测试类之间切换，或创建当前类的测试类 |

| `Alt+Enter` | 功能描述   |
| ----------- | ---------- |
| Create Test | 创建测试类 |


### 2.2 格式化

| 快捷键       | 功能描述    |
| ------------ | ----------- |
| `Ctrl+Alt+L` | 代码格式化  |
| `Ctrl+Alt+O` | 优化 import |


### 2.3 常用抽取

| 快捷键 | `Ctrl+Alt+Shift+T`或`鼠标右键->Refactor` | 功能描述 | 备注 |
| --- | --- | --- | --- |
| Ctrl+Alt+M | Extract Method | 提炼方法 | M是 Method 的首字母 |
| Ctrl+Alt+P | Introduce Parameter | 抽取为方法参数 | P是 Parameter 的首字母 |
| Ctrl+Alt+F | Introduce Field | 提取属性字段 | F 是 Field 的首字母 |
| Ctrl+Alt+C | Introduce Constant | 提炼常量 | C 是 Constant 的首字母 |
| Ctrl+Alt+V | Introduce Variable | 抽取变量 | V 是 Variable 的首字母 |


### 2.4 常用修改/封装

| 快捷键 | `Ctrl+Alt+Shift+T`或`鼠标右键->Refactor` | 功能描述 |
| --- | --- | --- |
| Shift+F6 | Rename | 重命名 |
| Ctrl+F6 | Change Signature | 修改方法签名，如调整参数名、参数顺序等 |
| Ctrl+Shift+F6 | Type Migration | 类型迁移 |


| `Ctrl+Alt+Shift+T`或`鼠标右键->Refactor` | 功能描述 |
| --- | --- |
| Encapsulate Fields | 封装字段 |


| `Alt+Enter`            | 功能描述          | 备注                                                         |
| ---------------------- | ----------------- | ------------------------------------------------------------ |
| Cleanup code           | clean 代码        |                                                              |
| Make xxx Final         | 把 xxx 变为 final | final 提示：settings->Editor->Inspections->Code style issues->勾选 field may be final |
| Change access modifier | 修改访问权限      |                                                              |


### 2.5 提炼/引入类

| `Ctrl+Alt+Shift+T`或`鼠标右键->Refactor` | 功能描述 |
| --- | --- |
| Introduce Parameter Object | 将方法参数提取为类 |
| Extract Delegate | 创建委托（将成员抽取到其他类中，并委托调用） |


### 2.6 类间的继承、实现、委托

| `Ctrl+Alt+Shift+T`或`鼠标右键->Refactor` | 功能描述 |
| --- | --- |
| Extract Interface | 提炼接口 |
| Extract Superclass | 提炼超类 |
| Pull Members Up | 将子类成员上提到父类中 |
| Push Members Down | 将父类成员下推到子类中 |
| Use Interface Where Possible | 在可能的地方使用接口替换实现类 |
| Replace Inheritance with Delegation | 使用委托取代继承 |
| Remove Middleman | 移除中间人 |

| `Alt+Enter`         | 功能描述         |
| ------------------- | ---------------- |
| Create subclass     | 创建当前类的子类 |
| Implement interface | 实现接口         |


### 2.7 搬移

| 快捷键 | `Ctrl+Alt+Shift+T`或`鼠标右键->Refactor` | 功能描述 |
| --- | --- | --- |
| `F6` | Move (Static) Members | 搬移静态成员 |
| `F6` | Move Instance Method | 搬移实例方法 |
| `F6` | Move Inner Class | 搬移内部类 |


### 2.8 实例/静态方法转换

| `Ctrl+Alt+Shift+T`或`鼠标右键->Refactor` | 功能描述 |
| --- | --- |
| Make Static | 实例方法变为静态方法 |
| Convert To Instance Method | 转换为实例方法 |


### 2.9 代码生成

| `Alt+Insert`  | 功能描述          |
| ------------- | ----------------- |
| Constructor   | 创建构造方法      |
| Getter/Setter | 创建 get/set 方法 |
| Test          | 创建测试类        |


### 2.10 代码简化

| 场景     | `Alt+Enter`                          | 功能描述                     |
| -------- | ------------------------------------ | ---------------------------- |
| for 循环 | Replace with collect                 | 用 collect 替代 for 循环     |
| for 循环 | Replace with Map.forEach             | 用 Map.forEach 替代 for 循环 |
| for 循环 | Replace with sum()                   | 用 sum 求和函数替代 for 循环 |
| if-else  | Replace 'if else' with '?:'          | 使用三目运算替代 if          |
| lambda   | Replace lambda with method reference | 使用方法引用简化 lambda      |
| lambda   | Replace with expression lambda       | 简化 lambda 语句             |
| 删除冗余 | Safe Delete XXX                      | 安全删除冗余、废弃代码       |
| 删除冗余 | Remove redundant initializer         | 删除冗余的初始化             |

| 快捷键 | `Ctrl+Alt+Shift+T`或`鼠标右键->Refactor` | 功能描述 |
| --- | --- | --- |
| `Ctrl+Alt+N` | Inline XXX | 内联 |
| `Alt+Delete` | Safe Delete | 安全删除冗余、废弃代码 |


### 2.11 构造方法改造

| `Ctrl+Alt+Shift+T`或`鼠标右键->Refactor` | 功能描述 |
| --- | --- |
| Replace Constructor with Builder | 用 builder 模式替代构造方法 |
| Replace Constructor with Factory Method | 使用工厂替代构造方法 |


### 2.12 修复编译错误

IDEA 编译错误，会以显著的波浪线（一般为红色）提示。这类问题都可以尝试 `Alt+Enter`，看 是否能交给 IDEA 自动修复。除了下面提到的，日常工作中自动添加依赖、添加 classpath、 类型、访问权限修复等，一般都可以解决。

| `Alt+Enter`                 | 功能描述           |
| --------------------------- | ------------------ |
| Add xxx as parameter…       | 添加方法参数       |
| Add constructor parameters  | 添加为构造方法参数 |
| Initialize In constructor   | 在构造方法中初始化 |
| Migrate xxx type to xxx     | 类型迁移           |
| Make xxx public/protected/… | 自动修改访问权限   |
| ……                          | ……                 |


### 2.13 代码的跳转、移动、删除等

| 快捷键           | 功能描述             |
| ---------------- | -------------------- |
| `Alt+F7`         | 查看引用位置         |
| `Ctrl+E`         | 切换到近期编辑的文件 |
| `Ctrl+W`         | 选中代码块           |
| `Alt+J`          | 选中相邻的相同字符串 |
| `Ctrl+Shift+↑/↓` | 移动语句             |
| `Ctrl+Y`         | 整行删除             |


### 2.14 VCS 操作

| 快捷键   | 功能描述                           | 备注                                                         |
| -------- | ---------------------------------- | ------------------------------------------------------------ |
| Ctrl+K   | VCS 中 git commit 代码             |                                                              |
| Alt+9    | 打开 git log 面板                  | View->Tool Windows->Version Control                          |
| Ctrl+D   | 打开 commit 记录中某文件 diff 明细 | 需要在打开 git log 面板后，选中某次 commit 中修改的文件后操作 |
| F7       | diff 明细中跳转到下一处修改        | 同上                                                         |
| Shift+F7 | diff 明细中跳转到上一处修改        | 同上                                                         |
| F4       | 从 diff 明细跳转到对应代码         | 同上                                                         |


### 2.15 各面板/弹窗中跳转、选择

| 快捷键                 | 功能描述                                   |
| ---------------------- | ------------------------------------------ |
| `Alt+下划线标注的字母` | 打开、跳转到各面板中指定的输入框、勾选框等 |
| `Tab键`                | 跳转到下一个输入框、勾选框等               |
| `空格`                 | 勾选或取消勾选                             |


## 3 快捷键扩展

### 3.1 IDEA 直接导出所有快捷键

在 IDEA 的 Help->Keyboard Shortcuts PDF 中，可以导出所有的快捷键

![image-20230623214908815](https://gyc-pic-for-typora.oss-cn-shanghai.aliyuncs.com/img_for_typora/image-20230623214908815.png)



## 4 附录

### 4.1 IDEA 中快捷键的查找与修改

> Step1. File->Settings->Keymap


> Step2.1 输入功能描述查找快捷键


eg：搜索框输入功能描述：Extract Method，查找对应快捷键

> Step2.2 输入快捷键查找对应功能描述


eg：点击放大镜图标弹出”find Shortcut”搜索框->按住键盘上的”Ctrl+Alt+N”（注意不是输入这 个字符串，是同时按住键盘上的 3 个键）->得到搜索结果

> Step3 修改快捷键


在快捷键上右键->面板中增加、删除快捷键

### 4.2 常见的快捷键冲突、失效原因

> 快捷键未配置或曾经修改过


参考 4.1，查看快捷键是否存在即可。

> `Ctrl+Shift+F`等搜索与输入法冲突


默认的全局搜索等容易与输入法默认快捷键冲突，处理方式有：

- 方法一：切换输入法 不生效时候切换输入法即可
- 方法二：更换输入法快捷键