+++
title = 'Java开发之编码格式'
date = 2024-09-10T21:09:37+08:00
categories = ['java']
tags = ['java']
+++

## 1 概述

### 1.1 背景 

优秀的代码不仅仅是正确的，还应该是简洁、可维护、可靠、可测试、高效、可移植的。 编程是一种创造性的工作。本规范用于引导软件开发人员形成好的编程习惯，编写出风格一致、容易阅读、高质量的 Clean Code，从而提升产品竞争力、软件研发效率。 

### 1.2 目标和适用范围 

本规范参考业界标准及实践，通过编程实践总结，为提高代码的可读性，可维护性和安全性，提供编程指南，力争系统化、易使用、易检查。 本规范适用于使用Java语言（Java 8+）编写的代码。 

### 1.3 总体原则 

程序需要在保证功能正确的前提下，满足可读、可维护、安全、可靠、可测试、高效、可移植的特征要求。 

### 1.4 条款组织方式   

 每个条款一般包含如下标题、级别、描述等组成部分。条款内容中的“正例”表示符合该条款要求的代码片段，“反例”表示不符合该条款要求的代码片段，但不一定造成程序错误的结果。 

#### 1.4.1 标题

描述本条款的内容。 

规范条款分为原则和规则两个类别，原则可以评价规则内容制定的好坏并引导规则进行相应的调整；规则是需要遵从或参考的实践。通过标题前的编号标识出条款的类别为原则或者规则。

标题前的编号规则，其中'P'为单词Principle首字母，'G'为单词 Guideline的首字母。原则条款的编号规则为P.Number。规则的编号方式为G.Element.Number，其中Element为领域知识中关键元素（本规范中对应的二级目录）的3位英文字母缩略语。Number是从1开始递增的两位阿拉伯数字，不足两位时高位补0。  

| **Element** | **目录**               | **Element** | **目录**       |
| ----------- | ---------------------- | ----------- | -------------- |
| NAM         | 命名                   | CON         | 并发与多线程   |
| CMT         | 注释                   | COL         | 泛型和集合     |
| FMT         | 格式                   | FIO         | 输入输出       |
| DCL         | 声明和初始化           | SER         | 序列化         |
| TYP         | 数据类型               | EDV         | 外部数据校验   |
| EXP         | 表达式                 | LOG         | 日志           |
| CTL         | 控制语句               | PRM         | 性能和资源管理 |
| MET         | 方法                   | SEC         | 平台安全       |
| OBJ         | 类、接口与面向对象编程 | OTH         | 其他           |
| ERR         | 异常处理               |             |                |

#### 1.4.2 描述 

对条款的进一步描述，描述条款的原理，配合正确和错误的代码例子作为示范。有的条款还包含一些规则不适用的例外场景。  

#### 1.4.3 级别 

规则类条款分为两个级别：要求、建议。 

- 要求：表示产品原则上应该遵从，但可以按照具体的产品版本计划和节奏分期实现。
- 建议：表示该条款属于最佳实践，有助于进一步消解风险，产品可结合业务情况考虑是否纳入，但要保证实施一致的代码风格。  



## 2 代码风格

代码风格一般包含标识符的命名风格、注释风格及排版风格。一致的编码习惯与风格，会使代码更容易阅读、理解，更容易维护。 

下列情况，应风格一致性原则优先：  

- 修改开源代码、第三方代码时，应该遵守开源代码、第三方代码已有规范，保持风格统一。
- 直接基于Android原生操作系统接口界面的软件，如Android Framework，保持与安卓风格统一。  

### 2.1 命名 

标识符的命名要清晰、明了，有明确含义，使代码更容易理解。  

#### 2.1.1 标识符 

> G.NAM.01 标识符应由不超过64字符的字母、数字和下划线组成 

【级别】 建议 

【描述】 

变量名的长度应正比于它的生命范围及承担的职责。  

标识符中不建议使用特殊前缀或后缀。对于Android代码，允许使用s或m作为前缀，其中s应表示静态属性，m应表示非公共且非静态属性。 

为了实现代码自注释的目的，命名时应尽量使用完整的单词组合，禁止使用非约定俗成的缩写，但常见词以及业务线的领域词汇是允许的，例如 response：resp，request：req，message：msg。特别是对于处理敏感信息的变量，变量名应该体现所包含的敏感信息，例如处理密码的变量命名为 password/passwd/pwd等。这样既能方便通过变量名识别代码中对敏感数据的处理，也便于集中处理将要记录到日志中的敏感数据，最终可以有效避免敏感信息泄露的问题。 

标识符命名时不要使用java标准库中的public标识符（如公共类、接口、package等）。 

**Java的命名风格以驼峰命名为主，缩写词也按单个单词处理，以提高代码的可读性**，例如 `XmlHttpRequest` ， `newCustomerId` ， `supportsIpv6OnIos()` 。 

【表1 常用标识符类型的命名风格列表】

| **类别**                            | **命名风格**                                                 |
| ----------------------------------- | ------------------------------------------------------------ |
| 接口，类，注解，枚举类型            | 大驼峰，测试类加Test后缀，文件名为 `顶层类名.java`           |
| 类的属性，局部变量， 方法，方法参数 | 小驼峰，测试方法可有下划线 _                                 |
| 静态常量，枚举值                    | 全大写，下划线分割                                           |
| 泛型类型变量                        | 单个大写字母，可接一个数字或者接下划线加若干大写字母，例如 E、T、T2、E_IN、E_OUT、T_CONS |
| 异常                                | 加后缀 `Exception` 或 `Error` ，例如 `AccessException`       |

 【反例】

```java
String name_; 
String mName; 
String s_name; 
String kName; 
String newCustomerID; 
String XMLData; 
```

 【正例】 

```java
String fileName; 
String newCustomerId; 
String xmlData;  
```

#### 2.1.2 包名 

> G.NAM.02 包名中的字母应小写，包名以点号分隔层级 

【级别】 建议 

【描述】 

包名仅能使用小写字母、数字、下划线，下划线只能在一些特殊情况使用，如包名以数字开头或是java中保留关键字时，如： `int_.example` 、 `com.example._123name`。一层包路径可以是多个单词的简单连接（不用下划线连接）。 

所有的源文件都要设置一个具体的package。自研代码推荐优先以 `com.hw` 开头，进一步按项目、 模块划分子包，做好package的合理规划。产品线也可以根据实际情况，合理规划包名称，如终端芯片业务部以 `com.hisilicon` 开头、云以 `com.hwcloud` 开头等。

 【正例】

```java
package com.ali.mobilecontrol.views; 
package xxx.yyy.v2;  
```

#### 2.1.3 类、枚举和接口 

> G.NAM.03 类、枚举和接口名应采用大驼峰命名 

【级别】 建议 

【描述】 类名、接口名通常是名词或名词短语，接口名还可以是形容词或形容词短语，都应采用大驼峰命名。例 如： `ArrayList （类）`、 `Collection （接口）`、 `Comparable （接口）`等。类名不应使用动词，也应该避免类似 `Data`，`Info` 这样的模糊词。 

测试类命名时推荐以被测类名开头，并以Test结尾，例如： `ClickjackFilterTest` 。 

抽象类命名时推荐以`Abstract`或`Base`开头。 

【反例】 

```java
class marcoPolo {} 
interface TAPromotion {} 
class info {}  
```

【正例】 

```java
class MarcoPolo {} 
interface TaPromotion {} 
class OrderInfo {}  
```

#### 2.1.4 方法 

> G.NAM.04 方法名应采用小驼峰命名 

【级别】 建议 

【描述】 方法名通常是动词或动词短语，采用小驼峰命名，具体格式如下： get + 非布尔属性名()； is + 布尔属性名()； set + 属性名()； has + 名词/形容词()； 动词()； 动词 + 宾语()； 回调方法（callback）允许介词+动词形式命名，如: onCreate() 、 onDestroy() 、 toString() ； 对于不修改系统状态的布尔型查询方法，应该以表达是非意义的动词如 is 、 has 、 can 、 should 等 开头。 

> G.NAM.04 方法名应采用小驼峰命名 

【级别】 建议 

【描述】 方法名通常是动词或动词短语，采用小驼峰命名，具体格式如下： 

- get + 非布尔属性名()； 
- is + 布尔属性名()； 
- set + 属性名()； 
- has + 名词/形容词()； 
- 动词()； 
- 动词 + 宾语()； 
- 回调方法（callback）允许介词+动词形式命名，如: `onCreate()` 、 `onDestroy() `、 `toString()`； 

对于不修改系统状态的布尔型查询方法，应该以表达是非意义的动词如`is` 、 `has` 、 `can` 、 `should` 等开头。  

【反例】

```java
public boolean Finished()
public void visible(boolean)
public void DRAW()
public void KeyListener(Listener)
boolean next()
```

【正例】

```java
public boolean isFinished()
public void setVisible(boolean)
public void draw()
public void addKeyListener(Listener)
boolean hasNext()
```

【例外】

单元测试方法的命名可采用多种形式，本规范不做限制，同一项目建议采用统一的命名风格。

#### 2.1.5 常量

本规范中的常量是指不可被修改静态的field和枚举常量。“不可被修改”需要同时满足以下两个条件：

- field的值/对象不可被修改为其他的值/对象；
- field为对象类型时，对象在初始化完成后其属性不能被修改。

常量定义的一般格式为：`[访问修饰符] static final 类型 常量名 = 常量值;`

常见的常量定义如下所示：

```java
class MyClass {
	public static final int TIME_INTERVAL = 1000;
	public static final String APPLICATION_NAME = "Launcher";
}
interface Moveable {
	String APPLICATION_NAME = "Launcher";
}
enum Size {SMALL, MEDIUM, LARGE};
```

> G.NAM.05 常量名采用全大写单词，单词间以下划线分隔

【级别】 建议

【描述】

1. 常量命名，应该由全大写单词与下划线组成，单词间用下划线分隔，如CONSTANT_CASE。常量命
   名要尽量表达完整的语义。
2. 不要使用魔鬼数字（难以理解的数字或字符串)，用有意义的常量代替。SQL或日志的字符串，不
   应视为魔鬼数字，不需定义为字符串常量；
   可通过如下方式避免使用魔鬼数字：
   \- 如果有现成的API，不要定义数字，比如判断集合内元素是否为空时，`不应该使用 size() ==0`，应使用` isEmpty() `方法；比如时间的比较判断，用 `java.time`中的API。
   \- 有命名模式的可以用枚举类型，参见G.FMT.15的枚举的使用场景。
3. 不建议将所有的常量定义到一个常量类中，而是按功能对常量进行管理，或就近定义常量。

 【反例】  

```java
static int MAXUSERNUM = 200;
static String sL = "Launcher";
static final int NUM_FIVE = 5;
static final int NUM_5 = 5;
```

不应定义NUM_FIVE或NUM_5这样无意义的常量，如果NUM_5被粗心大意地改为50或55等，将导致 NUM_5常量预期是5而实际是50或55。 

【正例】  

```java
static final int MAX_USER_NUM = 200;
static final String APPLICATION_NAME = "Launcher";
static final int MAX_FILE_NUM = 5;
```

【例外】 

对于Logger，Lock等类型的常量，不强制要求全大写字母。  

#### 2.1.6 变量 

变量包括局部变量、除了常量外的类成员变量。 

> G.NAM.06 变量采用小驼峰命名

【级别】 建议 

【描述】 

变量的名字通常是名词或名词短语，应采用小驼峰命名。有集合意义的变量，命名时尽量采用复数形 式。 

即使局部变量是final或不可改变（immutable）的，也不应该把它视为常量，应采用小驼峰命名。 该建议也适用于方法参数。

【反例】  

```java
String customername;
List<String> user = new ArrayList<>(DEFAULT_CAPACITY);
```

【正例】  

```java
String customerName;
List<String> users = new ArrayList<>(DEFAULT_CAPACITY);
```

> G.NAM.07 避免使用具有否定含义布尔变量名 

【级别】 建议 

【描述】 对具有否定含义的布尔型变量进行逻辑非运算，会导致代码不好理解，如 `!isNotError` 。 

【反例】  

```java
boolean isNoError;
boolean isNotFound;
```

> G.NAM.08 布尔型变量建议以表达是非意义的动词开头

【级别】 建议 

【描述】 

布尔型的变量建议以表达是非意义的动词开头，如` is `（JavaBeans经常被使用）、` has `、 `can `、`should `等。

JavaBeans规范会对布尔型的类属性自动生成` isXxx()` 的getter，例如类属性isCompleted可能会生成方法 `isIsCompleted()` 。为避免部分自动化处理工具（如Spring，IDE，Lombok等）对布尔型的类属 性的意外处理，**类似场景下，不强制要求布尔型类属性名以**` **is** `**开头**。对于这样的问题，也可以通过在 IDE中定制getter/setter代码生成模版，例如常用序列化框架可通过注解的方式设置序列化属性名。

```java
// Gson中
@SerializedName(value = "emailAddress", alternate = {"email", "email_address"})
protected String emailAddress;

// Fastjson中
@JSONField(name = "isGranted", alternateNames = {"is_granted", "is-granted", "granted"})
protected Boolean isGranted;
```

 【正例】  

```java
boolean isError;
boolean hasLicense;
boolean canEvaluate;
boolean shouldAbort = false;
```

### 2.2 注释 

Java中有3种标记注释的方式： `//` （注释单行内容）、 `/* */` （注释连续多行内容）、` /** */` （Javadoc注释）。 

> P.01 注释跟代码一样重要，应按需注释  

【描述】 

尽量通过清晰的软件架构、良好的标识符命名来提高代码可读性；在需要的时候，才辅以注释说明。对 晦涩难懂的代码、命名，应该进行重构而不是添加注释。 

注释是为了帮助阅读者快速读懂代码，所以要从读者的角度出发，按需注释。注释内容要简洁、明了、 无歧义，信息全面且不冗余，不应简单地复制类/接口/方法的名字。 

需要注释的地方没有注释，代码则难以被读懂；而包含无用、重复信息的冗余注释不仅浪费维护成本， 还会弱化真正有用的注释，最终让所有注释都不可信。 

修改代码时，也要保证其相关注释的一致性。只改代码不改注释是一种非专业的编程习惯，破坏了代码 与注释的一致性，影响程序代码的阅读、理解、修改、测试与维护。 

使用通顺的中文或英文进行注释。为降低沟通成本，应使用团队内最擅长、沟通效率最高的语言写注 释；注释语言由开发团队统一决定。 

#### 2.2.1 Javadoc 

Javadoc注释是指代码中使用 `/** */` 进行的注释，对这些注释可以使用Javadoc工具生成一个HTML文档。这类注释一般用于：  

- 包；
- 公有类和接口；
- 类的公有和受保护的属性；
- 类的公有和受保护的方法（含构造方法）。

Javadoc工具详细使用说明可参见Javadoc官方文档。

> G.CMT.01 public或protected修饰的元素应添加Javadoc注释

【级别】建议

【描述】

最低限度要为每个public或protected修饰的类、接口、枚举、类方法和类属性添加注释，这些注释的格式应该采用Javadoc注释格式（即使用 `/** */ `进行注释），除此之外按需添加Javadoc注释。实现接口方法时，其Javadoc允许使用{@inheritDoc}。

【例外】

1. 对于单个成员变量的setter/getter方法、构造方法等“简单，明显”的方法，不强制要求添加Javadoc注释，例如 `getXxx()` 、` isXxx()` ，如果无需注释可以省略，也可以简单注释“返回xxx”。
2. 对于override覆盖超类的方法可以不添加Javadoc注释。
3. 已使用JUnit框架默认的BeforeClass、 AfterClass等注解，无需Javadoc。

> G.CMT.02 顶层public类的Javadoc应该包含功能说明和创建日期/版本信息

【级别】 建议

【描述】
顶层public类的Javadoc中应该有功能说明、 `@since` 信息。产品自主决定是否添加 `@author` （作者信 息），其中名字（拼音或英文）可选，工号与邮箱不推荐添加到注释中；对外开源的代码不推荐添加`@author`。日期格式为Java 8 time包中的ISO_DATE，例如“2011-12-03”或者“2011-12-03+01:00”。 

可参考：

```java
/**
* 功能描述
*
* @author 王二
* @since 2012-12-22（或版本号）
*/
```

可增加其他的Javadoc tag标签（例如 `@param` 类型参数、 `@see` 等），包含了 `@apiNote` 的顶层类头格式如下：  

```java
/**
* 功能描述
*
* @apiNote: 特别需要注意的信息
*
* @author 王二
* @since 2012-12-22（或版本号）
*/
```

 编写文件头或顶层类头注释应注意： 

- 禁止空有格式，无内容。 

如上述例子，如果选项 @apiNote 后面无内容，则应整行删除。  

-  业界Java源码中一般没有History信息，History在配置库里面可以查询，不建议在Java源码的注释中包含History。 
- 顶层public类头中创建日期的 @since 标签中的年份应该与版权中的起始年份相同。  

> G.CMT.03 方法的Javadoc中应该包含功能说明，根据实际需要按顺序使用 @param、@return、@throws标签对参数、返回值、异常进行注释 

【级别】 建议 

【描述】 

书写方法的Javadoc时，推荐用Java 8新增的`@implSpec`，`@apiNote`和`@implNote`对注释内容进行分类 描述（不强制要求对存量代码进行修改）。各标签的排列顺序如下： 

- 功能描述，说明API的原理、意图、契约（前置与后置条件）等。功能描述与后面的各种标签之间 **需要空1行。** 
- `@implSpec`：特定于API实现的规格说明，让实现者决定是否覆盖。 
- `@apiNote`：说明API的注意事项，包括是否允许null、是否线程安全、算法复杂度、输入输出范 围、非受检异常等。 
- `@implNote`：特定于API实现的备注，让实现者参考。 
- `@param`：注释方法的参数。
- `@return`：注释方法的返回值。 
- `@throws`：注释方法抛出的所有类型的异常，包括受检异常和运行时异常。将运行时异常文档 化，可有效描述方法被成功执行的前提条件。 
- `@Deprecated`：如果方法被废弃，添加该标签。 

上述标签中，除了`@Deprecated`，不允许空的描述出现。某标签中的内容需多行显示时，新行内容应从@位置缩进**4个空格**来对齐。 `@implSpec`|`@apiNote`|`@implNote`与`@param`|`@return`|`@throws`这两组标签之间**需要空1行**。 

【正例】  

```java
/**
 * 对示例接口的概述介绍
 *
 * @since 2019-01-01
 */
protected abstract class Sample {
    /**
     * 这是一段长注释，要根据注释内容进行合理拆分为多行注释...
     * 这是第二行注释。
     * 符合： 功能说明要与下面的@标签之间保留一个空行
     *
     * @param fox 参数fox的说明，例如：与懒狗进行挑战的狐狸对象
     * @return 方法返回值的说明，例如：返回狐狸与狗的交战结果
     */
    protected abstract int foo(Fox fox);

    /**
     * 函数的功能说明，例如：实现狐狸与懒狗的对战过程。
     * 符合： 功能说明要与下面的@标签之间保留一个空行
     *
     * @return 方法返回值的说明，例如：返回狐狸与狗的交战结果
     * @throws ProblemException 异常说明，例如：懒狗死亡抛出该异常
     */
    protected int bar() throws ProblemException {
        // 变量注释
        var aVar = ...;
        // 方法注释 符合：注释要与前面的代码之间保留一个空行
        doSomething();
    }
}
```

【例外】

1. 公司ETS单元测试代码对javadoc注释已有专门的tag要求；
2. 某些系统API设计为对外隐藏时，允许使用tag `@hide`；
3. 业界流行工具Android Studio(查看是否去选Settings - Align parameter descriptions)，IDEA等，对一个tag中的描述文字过长而进行换行是，缩进与上一行描述文字对齐，也是可以的。多个tag的描述文字不用对齐，参见G.FMT.14 不应插入多余空格使代码垂直对齐。

> G.CMT.04 不写空有格式的方法头注释

【级别】 建议 

【描述】 

前面的条款中已经对需要添加注释的方法给出了明确的范围，对于不需要添加注释的方法无需添加空有格式的注释，这样代码更整洁。

#### 2.2.2 文件头注释

> G.CMT.05 文件头注释应该包含版权许可信息

【级别】 建议 

【描述】

文件头注释应该放在package和import之前，应该包含版权许可信息，如果需要在文件头注释中增加其他内容，可以在后面以相同格式补充。版权许可不应该使用javadoc样式或单行样式的注释，应该从文件顶头开始。如果包含“关键资产说明”类注释，则应紧随其后。

版权许可内容及格式**必须**如下：

中文版：

```java
/*
*版权所有（c）HW技术有限公司 2012-2020
*/
```

英文版：

```java
/*
*Copyright（c）HW Technologies Co., Ltd. 2012-2023. All rights reserved
*/
```

关于版本说明，应该注意：

- 2012-2023根据实际情况需要可以修改。

2012是文件首次创建年份，而2023是最后文件修改年份。二者可以一样，如“2023-2023”。对文件有重大修改的时候，必须更新后面年份，如特性扩展，重大重构等。

- 版权说明可以使用HW子公司。

如：版权所有（c）HW旗下XX 2012-2023

或英文*Copyright（c）XX Technologies Co., Ltd. 2012-2023. All rights reserved

#### 2.2.3 代码注释

> G.CMT.05 注释与代码直接应该有空行或空格，注释符与注释内容之间应该有空格

【级别】 建议

【描述】

类级成员（一般是类或接口中的属性、方法，嵌套类/内部类依此类推），注释与上面的代码之间加一 个空行，但是如果上面已经是本范围（一般是个大括号），则不用加空行。 非public非protected的方法，命名无法表达的信息，应该加注释辅助说明，方法头注释统一放在方法 声明或定义上方。

1. 在方法内部（语句级），注释与上面的代码之间可以考虑加一个空行，以便更加清晰。对于本范围 内的最开始位置的注释，注释前不需要空行。

【正例】

```java
/**
 * 对示例接口的概述介绍
 *
 * @since 2019-01-01
 */
public interface Example {
    /**
     * 成员变量注释 符合：接口中的第一行代码注释前不需要空行
     */
    String SOME_FIELD = ...;
    /**
     * 成员变量注释 符合：注释要与前面的代码之间保留一个空行
     */
    String OTHER_FIELD = ...;
    /**
     * 这是一段长注释，要根据注释内容进行合理拆分为多行注释...
     * 这是第二行注释。
     * 符合： 功能说明要与下面的@标签之间保留一个空行
     *
     * @param fox 参数fox的说明，例如：与懒狗进行挑战的狐狸对象
     * @return 方法返回值的说明，例如：返回狐狸与狗的交战结果
     */
    int foo(Fox fox);
    /**
     * 函数的功能说明，例如：实现狐狸与懒狗的对战过程。
     * 符合： 功能说明要与下面的@标签之间保留一个空行
     *
     * @return 方法返回值的说明，例如：返回狐狸与狗的交战结果
     * @throws ProblemException 异常说明，例如：懒狗死亡抛出该异常
     */
    default int bar() throws ProblemException {
        // 变量注释 符合：函数的首行代码注释前不需要空行
        var aVar = ...;
        // 方法注释 符合：注释要与前面的代码之间保留一个空行
        doSomething();
    }
}
```

代码右边的注释，与代码之间，至少留1空格。

通常使用扩展后的TAB键即可实现1-4空格的缩进。 多条 if else if 或 switch/case 场景下的条件注释，为了更清晰，考虑注释放在 else if 同行或者 在块内都行，但不是在 else if 之前，避免以为注释是关于它所在块的。 针对单个条件注释时，考虑选择并统一使用在block的右边注释或者上方注释的风格之一，不应该在单个条件block的底部对本条件注释，这样会有歧义。

【反例】

```java
if (nr % 15 == 0) {
    System.out.println("fizzbuzz");
    // 当nr只能被3整除，不能被5整除 不符合：该注释是当前条件还是下个条件?易误解
} else if (nr % 3 == 0) {
    System.out.println("fizz");
}
```

【正例】

```java
int foo = 100; // 变量注释
int bar = 200; // 变量注释
if (nr % 15 == 0) { // 当nr可被3和5同时整除
    System.out.println("fizzbuzz");
} else if (nr % 3 == 0) { // 当nr只能被3整除，不能被5整除
    System.out.println("fizz");
} else if (nr % 5 == 0) { // 当nr只能被5整除，不能被3整除
    System.out.println("buzz");
} else {
    // 其他场景会打印数值nr
    System.out.println(nr);
}
```

> G.CMT.07 正式交付给客户的代码不应包含TODO/FIXME注释

【级别】 建议

【描述】

TODO注释一般用来描述已知待改进、待补充的修改点。
FIXME注释一般用来描述已知缺陷。
它们都应该有统一风格，方便文本搜索统一处理。如：

```java
// TODO(<author-name>): 补充XX处理
// FIXME: XX缺陷
```

在版本开发阶段，可以使用此类注释用于突出标注；交付前应该全部处理掉。

### 2.3  格式

#### 2.3.1 源文件

> G.FMT.01 源文件编码格式（包括注释）应该是UTF-8

【级别】 建议

【描述】

对于源文件，应统一采用UTF-8进行编码。另外，对于资源文件（如xml、yml、properties等配置文 件）等也应该采用UTF-8进行编码。

> G.FMT.02 一个源文件按顺序包含版权、package、import、顶层类，且用空行分隔

【级别】 建议

【描述】

一个源文件中应按顺序包含以下信息：

1. 许可证或版权信息；
2. package语句，且语句内不换行；
3. import语句，且语句内不换行，不能用通配符*；
4. 顶级类（只有一个），所在.java源文件与它同名。

以上每个部分之间用一个空行隔开。

【例外】

package-info.java，是一种特殊的源文件，允许有注解。它有三个作用：

- 为标注在包上Annotation提供便利，注解应用于整个包；
- 声明包的私有类和常量；
- 提供应用于整个包的整体注释说明。

```java
/**
* 将包中所有方法参数默认设置为@NonNull
*/
@ParametersAreNonnullByDefault
package com.huawei.mydomain.myproduct.mymodule;

import javax.annotation.ParametersAreNonnullByDefault;
...
```

> G.FMT.03 import包应该按照先安卓、HW公司、其他商业组织、其他开源第三方、net/org开源组织、最后java的分类顺序出现，并用一个空行分组

【级别】 建议

【描述】

静态导入置于所有其他导入之上（与常规导入一样的排序方式）。

从上往下，大致分类是：import static、安卓、com.hw.*、其他商业组织com.*、其他开 源第三方xxx.yyy.*、net/org开源组织、javacard、Java最基础的包、Java的其他包、Java的扩展包。

每一类内部按照字母顺序排序。几大分类也大致是按字母排序（android、com、net、org），只是 java/javax在最后。
Java最基础的包，是指java.base模块中的包，参照java.base中的包清单。Java的其他包，是指 java.base模块之外的其他SE模块的包。
三方开源，包含了商业公司的开源，例如com.alibaba.fastjson，com.intellij.openapi等，与非盈利组织的开源，例如net/org组织的。这里，“其他”，就是指除了前缀为com、net、org之外的其他三方开源，例如下面示例中的lombok、maven。

这个风格兼容于安卓的import顺序，如果没有最上面的安卓包，也适用于非安卓。

【正例】

```java
import static all.statics.imports; // 静态导入
import android.xx.Xyz; // 安卓
import androidx.xx.Xyz; // 安卓
import com.android.xx.Xyz; // 安卓
import com.hisilicon.xx.Xyz; // 海思
import com.hw.xx.Xyz; // hw公司
import com.google.common.io.Files; // 其他商业组织
import hm.xx.Xyz; // 开源第三方 hm
import ohos.xx.Xyz; // 开源第三方 鸿蒙
import lombok.extern.slf4j.Sl4j; // 开源第三方
import maple.xx.Xyz; // 开源第三方
import maven.xx.Xyz; // 开源第三方
import net.sf.json.xx.Xyz; // net/org开源组织
import org.linux.apache.server.SoapServer; // net/org开源组织
import javacard.xx.Xyz;
import java.io.IOException; // Java最基础的包
import java.net.URL;
import java.rmi.RmiServer; // Java的其他包
import java.rmi.server.Server;
import javax.swing.JPanel; // Java的扩展包
import javax.swing.event.ActionEvent;
```

> G.FMT.04 一个类或接口的声明部分应该按照类变量、静态初始化块、实例变量、实例初始化块、构造器、方法的顺序出现，且用空行分隔

【级别】 建议

【描述】

一个类或接口的声明部分应该按照以下顺序排列：

- 类（静态）变量
- 静态初始化块
- 实例变量
- 实例初始化块
- 构造器
- 方法或嵌套类，嵌套类可以与成员方法根据业务逻辑交替出现，把概念上相近的放在一起，无需把所有嵌套类都下移至文件底部
- 类（静态）变量、实例变量、构造器，均按访问修饰符从大到小排列：public、protected、 package（default）、private

**说明：**

1. 对于自注释成员变量之间可以不加空行；
2. 非自注释成员变量应该加注释且成员变量间以空行分隔。

【例外】

类中的LOG控制开关和TAG的声明，修饰符定义为 `private static final` ，允许放在类中的最前面。 包括TAG、mTAG、STAG、DBG、DEBUG、logger、xxxLogger，不以名字的大小写区分。

#### 2.3.2 大括号

> G.FMT.05 在条件语句和循环块中应该使用大括号

【级别】 建议

【描述】 

在 if ， else ， switch ， for ， do 和 while 等语句中，即使程序体是空的或只包含一个语句，也 应该使用大括号。对 switch 里面的 case 和 default ，大括号是可选的。

> G.FMT.06 对于非空块状结构，左大括号应该放在行尾，右大括号应该另起一行

【级别】 建议

【描述】 

对于非空块状结构（含初始化块），大括号应该遵循K&R风格： 左大括号不换行； 右大括号自己单独一行； 右大括号后，可以跟逗号、分号等，也可以跟随 else 、 catch 、 finally 等关键字语句。

【反例】 （多块语句）

```java
try {
	doSomething();
} catch (MyException ex) { handleException(ex); } // 不符合： 代码块应该换行
```

【正例】

```java
try {
    if (condition()) {
        doSomething();
    } else {
        doSomethingElse();
    }
} catch (MyException ex) {
    handleException(ex);
}
```

对于枚举类的例外，可参考枚举。

> G.FMT.07 应该避免空块，必须使用空块时，应采用统一的大括号换行风格

【级别】 建议

【描述】 

程序中应避免空块，但对于工具自动生成的、用于被覆盖的场景（例如UI监听器），可能需要定义空的 方法体；忽略异常时也可能使用空的catch块。

空块状结构既可遵循前面的大括号排版格式要求，也可以在大括号打开后立即关闭，产品应考虑使用统 一的风格。

【正例】

```java
void doNothing() {} // 产品这样统一可以

void doNothingElse() { // 产品这样统一也可以
}
```

#### 2.3.3 缩进

> G.FMT.08 使用空格进行缩进，每次缩进4个空格

【级别】 建议

【描述】 

只允许使用空格（space）进行缩进，每次缩进为4个空格。不允许插入制表符tab、换页符等。 当前几乎所有的集成开发环境（IDE）和代码编辑器都支持配置将Tab键自动扩展为4空格输入，应在代 码编辑器中配置使用空格进行缩进。

【例外】 

方法参数换行、字符串+语句换行、方法连续操作符.调用，这些特殊场景，业界流行工具Eclipse、 IntelliJ IDEA，默认缩进8个空格，也是可以的。

#### 2.3.4 行内容

> G.FMT.09 每行不超过一个语句 

【级别】 建议 

【描述】 一行应只写一条语句。

#### 2.3.5 行宽

> G.FMT.10 行宽不超过120个窄字符

【级别】 建议

【描述】 

一个宽字符占用两个窄字符的宽度。除非另有说明，否则任何超出此限制的行都应该换行，如换行一节 中所述。 每个Unicode代码点都计为一个字符，即使其显示宽度大于或小于一个字符。如果使用全角字符，可以 选择比此规则建议的位置更早地换行。 字符的“宽”与“窄”由它的east asian width Unicode属性定义。通常，窄字符也称“半角”字符，ASCII字符 集中的所有字符，包括字母（如： `a`、 `A` ）、数字（如： `0` 、 `3` ）、标点（如 `,`、 `{` ）、空格，都是窄 字符；宽字符也称“全角”字符，汉字（如： `中` 、 `文` ）、中文标点（ `，` 、`、` ）、全角字母和数字（如 `Ａ` 、 `３` ）等都是宽字符，算2个窄字符。

【例外】

1. 对于换行导致内容截断，不方便查找、拷贝的字符串（如长URL、命令行等）可以不换行。
2. 较长的package可以不换行。

#### 2.3.6 换行

> G.FMT.11 建议换行起点在操作符之前

【级别】 建议

【描述】 

当语句过长，或者可读性不佳时，需要在合适的地方换行。换行时建议将操作符、连接符放在新的一 行。新行应按照缩进章节的要求进行缩进。

【正例】

```java
// 链式方法调用
Student student = Student.builder()
    .setName("zhangsan")
    .setAge(14)
    .setGrade("5年级")
    .setMajor("软件工程")
    .setNum("123456789")
    .build();
```

【例外】

1. 函数的参数列表换行时，左括号应跟函数名在同一行，右括号应跟最后一个参数在同一行。
2. 在lambda表达式中，如果箭头后是单个表达式，建议在箭头后面换行，如果箭头后是程序块，建 议在大括号后换行。
3. 对于逗号(,)、赋值运算(=)，换行点应该出现在运算符之后。

#### 2.3.7 空行

> G.FMT.12 减少不必要的空行，保持代码紧凑

【级别】 建议

【描述】

减少不必要的空行，可以显示更多的代码，方便代码阅读。建议： 根据上下内容的相关程度，合理安排空行：空行出现在属性，构造方法，方法，嵌套类，静态初始 化块之间； 方法内部、类型定义内部、初始化表达式内部，不使用连续空行； 不使用连续3个或更多空行； 大括号内的代码块行首之前和行尾之后不要加空行，包括类型和方法定义、语句代码块。

【反例】

```java
int foo() {
	...
}
// 空行
// 空行
// 空行
int bar() { // 不推荐：最多使用连续2个空行
	...
}
int baz() {
    doSomething(); // 不推荐：大括号内部首尾，不需要空行
    ...
}
```

#### 2.3.8 水平空格

> G.FMT.13 用空格突出关键字和重要信息

【级别】 建议

【描述】 

水平空格应该突出关键字和重要信息。

单个空格应该分隔关键字与其后的左括号、与其前面的右大括号，出现在任何二元/三元运算符/类似运算符的两侧 `,` | `:` | `;` 或类型转换结束括号 ) 之后使用空格。

行尾和空行不应有空格space。

【总体规则】

必须加空格的场景： 
赋值运算符前后（包括复合），例如 `=` 、 `*=` 等； 
逗号 `,` 、非for-in的冒号 `:` 、for循环等分隔的 `;` 符号之后加空格；
二元运算符、类型并交的 `|` 和 `&` 符号、for-in的冒号 `:` 的前后两侧，例如 `base + offset` ； 
lambda表达式中的箭头前后，例如 `str -> str.length()` ； 
方法声明、条件判断语句、循环语句等场景下的 `)` 与 `{` 之间加空格，例如： `void func() {...}` 。

禁止加空格的场景：
`super` 、 `this` 等少数关键字之后（多数关键字之后自然地须加空格）； 
成员访问操作符前后，例如 `instance.member` ； 
圆括号、方括号、注解或数组等非换行的大括号内两侧； 
一元运算符前后，例如 `cnt++` ； 
方法声明或者方法调用的左括号之前。

> G.FMT.14 不应插入多余空格使代码垂直对齐

【级别】 建议

【描述】 

不应通过插入空格的方式使代码垂直对齐，包括在Javadoc的注释性描述内容前。原因是： 如果参数/变量名长短差异较大，无规律插入的空白呈凹凸状，并不美观； 如果某个参数/变量名较长，例如 `gardenPlantingDetailViewModel` ，对应的描述内容也较长的 话，就可能不得不换行，又可能会有换行对齐的顾忌； 后续的维护者可能会困扰是否在整个module/package都刻意追求对齐。 因此，代码垂直对齐的弊大于利；为了减少维护成本，不造成困扰，不对齐是最好的选择。

【反例】

```java
private int    size; // 维护者可能不得不修改这些对齐空格数
private String name; // 不必与上行对齐注释
```

【正例】

```java
private int size;
private String name;
```

【例外】

如果数据位对齐可提升代码的可读性（如用一组16进制数来表示不同的状态等含义时），可以通过插入 空格保持数据位垂直对齐，使代码更可读。例如：

```java
static final int BRIDGE     = 0x00000040;
static final int VARARGS    = 0x00000080;
static final int SYNTHETIC  = 0x00001000;
static final int ANNOTATION = 0x00002000;
```

#### 2.3.9 枚举

> G.FMT.15 枚举常量间用逗号隔开，换行可选

【级别】 建议

【描述】 下面是一个典型的枚举类声明示例：

```java
private enum Size {SMALL, MEDIUM, LARGE}
```

由于不涉及方法及常量的注释，采用的是数组初始化的格式。枚举常量之间使用逗号进行分隔。 在枚举常量后面的逗号之后，换行符是可选的。还允许额外的空白行（通常只有一行）。例如：

```java
private enum Encoding {
    UTF8 {
        @Override
        public String toString() {
            return "UTF-8";
        }
    },
    UTF16,
    US_ASCII
}
```

Java的枚举比较灵活强大，而且与 `switch` / `case` 结合较好，应优先使用。

枚举的使用场景：

- 布尔型的两元素值，例如 `isCelsius = true | false` 来表示摄氏|华氏可用；

```java
public enum TemperatureScale {CELSIUS, FAHRENHEIT}
```

- 变量值仅在一个固定范围内变化用 enum 类型来定义。例如G.DCL.04的Keyboard例子；
- 整数或字符串的枚举模式，蕴含有某种命名空间的，例如上面的 Size 例子，或者其他语言的 `ComparisonResult` ，避免-1、0、1的数字比较。

```java
public enum ComparisonResult {
    ORDERED_ASCENDING,
    ORDERED_SAME,
    ORDERED_DESCENDING
}
```

#### 2.3.10 switch语句（FIXME)

当switch括号内的变量类型为String时，确保变量非空。

> G.FMT.16 case语句块结束时如果不加break，需要有注释说明（fall-through）

【级别】 建议 

【描述】

switch语句中，当没有终止语句（break，return或抛出异常）时会执行到switch语句的结束处。

当 case语句块中没有终止语句时，需要添加注释，表明会继续执行到下一个case语句块。任何符合fallthrough概念的注释都可以（通常是 `fallthrough`  ）。 Eclipse和IntelliJ IDEA支持 `fallthrough` 这种特殊的注释来suppress缺少 break 的告警。尽管这不 是Java的标准，但它被主流的IDE支持，推荐优先使用。

注意： 当javac开启 -Xlint:fallthrough 选项编译时 ，加与不加 `fallthrough` ，可能都会告警；修 复此告警可以考虑改用 if else if 写法替代 switch case 。 continue不能单独用于switch中，可用于循环中的switch中，continue的作用是跳出本次循环， 所以case语句中使用continue时，还会影响循环代码块中后续代码的执行。 如果 case 语句是空语句，则可以不用加注释特别说明。

【正例】

```java
switch (label) {
    case 0:
    case 1:
        System.out.println("1");
        // $FALL-THROUGH$
    case 2:
        System.out.println("2");
        // $FALL-THROUGH$
    case 3:
        System.out.println("3");
        break;
    default:
        System.out.println("Default case!");
}
```

#### 2.3.11 注解

> G.FMT.17 应用于类、方法、类属性的每个注解独占一行

【级别】 建议

【描述】 应用于类、方法（含构造方法）、类属性的注解应在其上部，且每个注解独占一行。

【正例】

```java
@Partial
@Mock
DataLoader loader;

@Override
@Nullable
public String doSomething() {
	...
}

@Override
public int hashCode() {
	...
}
```

#### 2.3.12 注释排版

> G.FMT.18 块注释的缩进级别应与上下文代码相同

【级别】 建议

【描述】 

块注释的缩进级别应该与被注释代码相同。可以采用单行注释（ `// ...` ）风格或多行注释（ `/* ... */ `）风格，对于多行注释风格，每行注释要以 `*` 开头且保持前后对齐。

【正例】

下面两种块注释都是可以的。

```java
public void doSomething() {
    ...
    if(condition()) {
        /*
         * 第一行注释
         * 第二行注释
         */
        int value = 0;
    }
    ...
}
public void doSomething() {
    ...
    if(condition()) {
        // 第一行注释
        // 第二行注释
        int value = 0;
    }
    ...
}
```

提示：编写多行注释时，如果希望自动代码格式化程序在必要时重新换行（段落样式），应使用 `/* ... */` 。

#### 2.3.13 修饰符

> G.FMT.19 类和成员修饰符（如果存在）按Java语言规范建议的顺序显示

【级别】 建议

【描述】 推荐的顺序（如果存在）：

```java
public protected private abstract default static final transient volatile synchronized native strictfp
```

> G.FMT.20 数字字面量应该设置合适的后缀， long 类型应该使用L作为后缀

【级别】 建议 

【描述】 

对于 long 、 float 、 double 类型的数字要使用合理的后缀指定数值的类型。Java 10增加了局部类型推断[LVTI](https://juejin.cn/post/6844903856145432583)，一些字面量如果不加后缀，类型推断时可能与预期不符。为了形成良好的习惯，写出更健壮的代码，应参考LVTI的Style Guidelines。

如果不加后缀，数值推断为 int ， float 可能会推断为 double 。因此，应该在字面量后面加上后缀。 long 值必须使用 L 后缀，不能使用 l 做后缀。例如，使用 500000L 而不是 500000l 。对于较大数值， 可以使用Java 7新增的数字下划线分隔符，增强代码的可读性，如 30_000_000_000L 。 d、f后缀不易引起混淆的，不强制采用大写字母。

【反例】

```java
byte flags = 0;
short mask = 0x7fff;

// 不符合: 如下两个声明的变量被推断为int
var flags = 0;
var mask = 0x7fff;

static final float INITIAL = 3.0f;
double amount = INITIAL;
var amount = INITIAL; // 不符合: 推断为float
```

【正例】

```java
var idx = 0; // 符合
long sum = 0L; // 符合
var sum = 0L; // 符合：若不加后缀则会推断为int

var isReady = true; // 符合: boolean
var chr = '\ufffd'; // 符合: char
var str = "wombat"; // 符合: String
var flt = 1.0f; // 符合: float
var dbl = 2.0d; // 符合: double
```