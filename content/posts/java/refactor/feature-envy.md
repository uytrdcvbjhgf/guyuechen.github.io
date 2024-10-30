+++
title = '代码坏味道之依恋情节 (Feature Envy)'
date = 2024-10-06T14:20:11+08:00
categories = ['java']
tags = ['refactor']
+++

**定义**

一个函数跟另一个模块中的函数或数据交流格外频繁，远胜于在自己所处模块内部的交流

**影响**

- 可读性、可维护性低：调用另一模块功能时往往需要打一套组合拳才能完成，需要知道过多的细节；往往会伴随有“内幕交易、 重复代码、霰弹式修 改……”

**改进目标**

- 将函数搬移到对应的类，解除跨模块的过多交流

**方法**

- 提炼函数
- 搬移函数

> 案例：问题代码


**代码背景**

- 发票（Invoice）有买方、卖方、还有多个明细行；
- 明细行（InvoiceLine）有商品名称、单价、数量；
- 发票打印器（InvoiceFormatter）将发票信息格式化后输出， 其中将包含总金额和各明细行金额。

**症状/问题**

InvoiceFormatter知道了过多关于Invoice和InvoiceLine的细节。 通过Invoice/InvoiceLine提供的属性，自行计算了金额：

- 计算了InvoiceLine的总额（利用了InvoiceLine的2个方法，并带入了multiply方法的使用）
- 计算了Invoice的总额（利用了Invoice/InvoiceLine的3个方法）
- 万一，今后Invoice加上个折扣率，那么这些地方很难支持

```java
/**
 * 发票信息
 */
public class Invoice {
    private final String buyer;

    private final String seller;

    private final List<InvoiceLine> lines;

    public Invoice(String buyer, String seller, List<InvoiceLine> lines) {
        this.buyer = buyer;
        this.seller = seller;
        this.lines = new ArrayList<>(lines);
    }

    public String getBuyer() {
        return buyer;
    }

    public String getSeller() {
        return seller;
    }

    public List<InvoiceLine> getLines() {
        return Collections.unmodifiableList(lines);
    }
}
```

```java
/**
 * 发票单行明细
 */
public class InvoiceLine {
    private final String product;

    private final BigDecimal quantity;

    private final BigDecimal price;

    public InvoiceLine(String product, BigDecimal quantity, BigDecimal price) {
        this.product = product;
        this.quantity = quantity;
        this.price = price;
    }

    public String getProduct() {
        return product;
    }

    public BigDecimal getQuantity() {
        return quantity;
    }

    public BigDecimal getPrice() {
        return price;
    }
}
```

```java
/**
 * 发票格式化
 */
public class InvoiceFormatter {
    /**
     * 数值格式化
     */
    private final DecimalFormat decimalFormat;

    private final String lineSeparator;

    /**
     * @param precision 格式化精度，即小数点后位数（大于等于0）
     * @param lineSeparator 换行符
     */
    public InvoiceFormatter(int precision, String lineSeparator) {
        if (precision < 0) {
            throw new IllegalArgumentException();
        }
        StringBuilder pattern = new StringBuilder("0.");
        for (int p = 0; p < precision; p++) {
            pattern.append("0");
        }

        this.decimalFormat = new DecimalFormat(pattern.toString());
        this.lineSeparator = lineSeparator;
    }

    /**
     * 格式化发票信息
     * 
     * @param invoice 发票
     * @return 格式化结果
     */
    public final String format(Invoice invoice) {
        StringBuilder stringBuilder = new StringBuilder();

        // header:
        stringBuilder.append("Seller: ")
            .append(invoice.getSeller())
            .append(lineSeparator)
            .append("Buyer: ")
            .append(invoice.getBuyer())
            .append(lineSeparator);

        // body:
        stringBuilder.append("Details:(line,product,price,quantity,amount)").append(lineSeparator);
        int lineIndex = 1;
        for (InvoiceLine line : invoice.getLines()) {
            stringBuilder.append(lineIndex++)
                .append(". ")
                .append(line.getProduct())
                .append(" ")
                .append("$")
                .append(decimalFormat.format(line.getPrice()))
                .append(" ")
                .append(decimalFormat.format(line.getQuantity()))
                .append(" ")
                .append("$")
                .append(decimalFormat.format(line.getQuantity().multiply(line.getPrice())))
                .append(lineSeparator);
        }

        // footer
        BigDecimal total = BigDecimal.ZERO;
        for (InvoiceLine line : invoice.getLines()) {
            BigDecimal lineTotal = line.getQuantity().multiply(line.getPrice());
            total = total.add(lineTotal);
        }
        stringBuilder.append("Total: $").append(decimalFormat.format(total)).append(lineSeparator);

        return stringBuilder.toString();
    }
}
```

> 改进手法：提炼函数并搬移


```java
/**
 * 发票信息
 */
public class Invoice {
    private final String buyer;

    private final String seller;

    private final List<InvoiceLine> lines;

    public Invoice(String buyer, String seller, List<InvoiceLine> lines) {
        this.buyer = buyer;
        this.seller = seller;
        this.lines = new ArrayList<>(lines);
    }

    public String getBuyer() {
        return buyer;
    }

    public String getSeller() {
        return seller;
    }

    public List<InvoiceLine> getLines() {
        return Collections.unmodifiableList(lines);
    }

    BigDecimal getAmount() {
        BigDecimal total = BigDecimal.ZERO;
        for (InvoiceLine line : getLines()) {
            BigDecimal lineTotal = line.getAmount();
            total = total.add(lineTotal);
        }
        return total;
    }
}
```

```java
/**
 * 发票单行明细
 */
public class InvoiceLine {
    private final String product;

    private final BigDecimal quantity;

    private final BigDecimal price;

    public InvoiceLine(String product, BigDecimal quantity, BigDecimal price) {
        this.product = product;
        this.quantity = quantity;
        this.price = price;
    }

    public String getProduct() {
        return product;
    }

    public BigDecimal getQuantity() {
        return quantity;
    }

    public BigDecimal getPrice() {
        return price;
    }

    BigDecimal getAmount() {
        return getQuantity().multiply(getPrice());
    }
}
```

```java
/**
 * 发票格式化
 */
public class InvoiceFormatter {
    /**
     * 数值格式化
     */
    private final DecimalFormat decimalFormat;

    private final String lineSeparator;

    /**
     * @param precision 格式化精度，即小数点后位数（大于等于0）
     * @param lineSeparator 换行符
     */
    public InvoiceFormatter(int precision, String lineSeparator) {
        if (precision < 0) {
            throw new IllegalArgumentException();
        }
        StringBuilder pattern = new StringBuilder("0.");
        for (int p = 0; p < precision; p++) {
            pattern.append("0");
        }

        this.decimalFormat = new DecimalFormat(pattern.toString());
        this.lineSeparator = lineSeparator;
    }

    /**
     * 格式化发票信息
     * 
     * @param invoice 发票
     * @return 格式化结果
     */
    public final String format(Invoice invoice) {
        StringBuilder stringBuilder = new StringBuilder();

        // header:
        stringBuilder.append("Seller: ")
            .append(invoice.getSeller())
            .append(lineSeparator)
            .append("Buyer: ")
            .append(invoice.getBuyer())
            .append(lineSeparator);

        // body:
        stringBuilder.append("Details:(line,product,price,quantity,amount)").append(lineSeparator);
        int lineIndex = 1;
        for (InvoiceLine line : invoice.getLines()) {
            stringBuilder.append(lineIndex++)
                .append(". ")
                .append(line.getProduct())
                .append(" ")
                .append("$")
                .append(decimalFormat.format(line.getPrice()))
                .append(" ")
                .append(decimalFormat.format(line.getQuantity()))
                .append(" ")
                .append("$")
                .append(decimalFormat.format(line.getAmount()))
                .append(lineSeparator);
        }

        // footer
        BigDecimal total = invoice.getAmount();
        stringBuilder.append("Total: $").append(decimalFormat.format(total)).append(lineSeparator);

        return stringBuilder.toString();
    }
}
```

> 操作手法

| 操作     | 快捷键（推荐） | Ctrl+Alt+Shift+T（或：鼠标右键“Refactor”） |
| -------- | -------------- | ------------------------------------------ |
| 提炼函数 | Ctrl+Alt+M     | Extract Method                             |
| 移动函数 | F6             | Move Instance Method                       |

补充：
IDEA “Inspect Code”
需勾选配置项： Setting -> Editor -> Inspections -> Java -> Abstraction issues -> Feature envy
功能入口： IDEA -> Analyze -> Inspect Code
