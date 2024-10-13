+++
title = '代码坏味道之注释 (Comments)'
date = 2024-10-13T18:41:35+08:00
categories = ['java']
tags = ['refactor']
+++

**定义**

- 某段代码有大段的注释，这些注释之所以存在是因为代码很糟糕
- 代码注释错误，或者缺少必要的注释

**影响**

- 以注释掩盖了代码坏味道，或者没有正确的注释，不便阅读。影响了代码的可读、可维护性。

**改进目标**

- 消除不必要的注释，补充必要的注释，提升代码可读可维护性

**方法**

- 提取变量（代码段注释）
- 提取方法（代码段注释）
- 方法/变量改名（方法/变量注释）
- 补充/修改必要的注释

> 案例1：通过注释隐藏坏味道


**代码背景**

```java
public class Render {
    private static final String LINE_SEPARATOR = System.lineSeparator();

    public String renderBanner(String browser, String platform, int resize) {
        if (canRender(browser, platform, resize)) {
            return doRender(browser, platform, resize);
        }
        return "can not render";
    }

    private boolean canRender(String browser, String platform, int resize) {
        return browser.toUpperCase().contains("IE") // 浏览器中是否为"IE"
            && platform.toUpperCase().contains("MAC") // 操作系统是否是MAC
            && resize > 0;
    }

    private String doRender(String browser, String platform, int resize) {
        return "browser: " + browser + LINE_SEPARATOR
            + "platform: " + platform + LINE_SEPARATOR
            + "resize: " + resize;
    }
}
```

```java
/**
 * 待支付信息
 *
 * @author z00378401
 * @since 2021-09-06
 */
public class Owing {
    private static final String LINE_SEPARATOR = System.lineSeparator();

    /**
     * 获取待支付信息
     * 
     * @param name 物品名称
     * @return 待支付信息
     */
    public String getOwingInfo(String name) {
        someProcess();
        // 生成明细信息并返回
        return "name: " + name + LINE_SEPARATOR
            + "amount: " + getAmnt() + LINE_SEPARATOR
            + "someOwingInfo: " + getSomeOwingInfo();
    }

    private String getSomeOwingInfo() {
        return "someOwingInfo";
    }

    /**
     * 获取数量
     * 
     * @return 数量
     */
    private int getAmnt() {
        return 10;
    }

    private void someProcess() {
    }
}
```

**症状/问题**

- 试图通过注释来解释不易理解的代码

**重构目标**

- 抽取变量、方法，并用合理的命名，实现代码的自注释

> 改进手法：提取变量、提取方法、方法/变量改名


```java
public class Render {
    private static final String LINE_SEPARATOR = System.lineSeparator();

    public String renderBanner(String browser, String platform, int resize) {
        if (canRender(browser, platform, resize)) {
            return doRender(browser, platform, resize);
        }
        return "can not render";
    }

    private boolean canRender(String browser, String platform, int resize) {
        boolean isIE = browser.toUpperCase().contains("IE");
        boolean isMacOs = platform.toUpperCase().contains("MAC");
        return isIE && isMacOs && resize > 0;
    }

    private String doRender(String browser, String platform, int resize) {
        return "browser: " + browser + LINE_SEPARATOR + "platform: " + platform + LINE_SEPARATOR + "resize: " + resize;
    }
}
```

```java
/**
 * 待支付信息
 *
 * @author z00378401
 * @since 2021-09-06
 */
public class Owing {
    private static final String LINE_SEPARATOR = System.lineSeparator();

    /**
     * 获取待支付信息
     * 
     * @param name 物品名称
     * @return 待支付信息
     */
    public String getOwingInfo(String name) {
        someProcess();
        return createDetails(name);
    }

    private String createDetails(String name) {
        return "name: " + name + LINE_SEPARATOR + "amount: " + getAmount() + LINE_SEPARATOR + "someOwingInfo: "
            + getSomeOwingInfo();
    }

    private String getSomeOwingInfo() {
        return "someOwingInfo";
    }

    private int getAmount() {
        return 10;
    }

    private void someProcess() {
    }
}
```

> 其他案例：业务代码中其他一些常见注释问题


**症状/问题**

- 缺少必要的注释，包括缺少Javadoc或空有格式，算法代码缺少注释等
- 注释错误，注释与方法、参数、功能等不匹配

**重构目标**

- 补充或修改注释

> 操作手法

| 操作          | 快捷键（推荐） | Ctrl+Alt+Shift+T（或：鼠标右键“Refactor”） |
| ------------- | -------------- | ------------------------------------------ |
| 提取变量      | Ctrl+Alt+V     | Introduce Variable                         |
| 提取方法      | Ctrl+Alt+M     | Extract Method                             |
| 方法/变量改名 | Shift+F6       |                                            |


补充：注释本身非坏味道，只是不合理的使用注释，会隐藏代码潜在的问题，掩盖了代码的坏味道。
