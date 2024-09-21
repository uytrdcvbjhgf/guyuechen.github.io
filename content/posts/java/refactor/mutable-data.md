+++
title = '代码坏味道之可变数据 (Mutable Data)'
date = 2024-09-21T13:37:43+08:00
categories = ['java']
tags = ['refactor']
+++

**定义**

对数据的修改经常导致出乎意料的结果和难以发现的Bug

**影响**

- 影响可维护性，在一处修改数据，却在另一处造成难以发现的破坏

**改进目标**

- 应用“数据不可变”：不可变性是强大的代码防腐

**方法**

- 封装变量
- 拆分变量
- 提炼函数
- 移除设值函数
- 查询取代派生
- Builder模式创建不可变对象
- 引用对象改为值对象
- 函数式编程

> 案例

**代码背景**

- 描述了发票的数据模型；
- 发票有买方、卖方、还有多个明细行；
- 每个明细行有商品名称、单价、数量、税率；
- 发票还有总价、税额的概念

**症状/问题**

数据应有明确含义，“可变”会引入不确定性，“可变”包括：

- 同一变量用作不同目的： 如InvoiceLine.setQuantity()方法中的sum变量
- 用public修饰非final成员
- 有set方法（或其它改变数据的方法）
- 一个字段的值可通过其他字段计算得到
- 对外暴露内部字段的可变引用

```java
public class Invoice {
    private final String buyer;

    private final String seller;

    private final List<InvoiceLine> lines;

    public Invoice(String buyer, String seller) {
        this.buyer = buyer;
        this.seller = seller;
        this.lines = new ArrayList<>();
    }

    // 修改了Invoice内部数据
    public void putLine(InvoiceLine line) {
        this.lines.add(line);
    }

    // 此方法返回了集合引用，外部可通过操作这个引用来改变Invoice对象
    public List<InvoiceLine> getLines() {
        return lines;
    }

    public BigDecimal getAmount() {
        return lines.stream().map(line -> line.amount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public BigDecimal getTaxAmount() {
        return lines.stream().map(line -> line.taxAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public BigDecimal getTotal() {
        return getAmount().add(getTaxAmount());
    }
}
```

```java
public class InvoiceLine {
    public String product;
    public BigDecimal quantity = BigDecimal.ZERO;
    public BigDecimal price = BigDecimal.ZERO;
    public BigDecimal taxRate = BigDecimal.ZERO;

    // 冗余字段，可通过其它字段计算得
    public BigDecimal amount = BigDecimal.ZERO;
    // 冗余字段，可通过其它字段计算得
    public BigDecimal taxAmount = BigDecimal.ZERO;

    public InvoiceLine(String product) {
        this.product = product;
    }

    public InvoiceLine(String product, BigDecimal quantity, BigDecimal price, BigDecimal taxRate) {
        this.product = product;
        this.quantity = quantity;
        this.price = price;
        this.taxRate = taxRate;
        this.amount = this.quantity.multiply(price);
        this.taxAmount = this.amount.multiply(taxRate);
    }

    public void setQuantity(BigDecimal quantity) {
        this.quantity = quantity;
        // sum职责1：计算总额
        BigDecimal sum = this.quantity.multiply(price);
        this.amount = sum;
        // sum职责2：计算税额
        sum = this.amount.multiply(taxRate);
        this.taxAmount = sum;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
        this.amount = this.quantity.multiply(price);
        this.taxAmount = this.amount.multiply(taxRate);
    }

    public void setTaxRate(BigDecimal taxRate) {
        if (taxRate.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Tax rate should >= 0");
        }
        this.taxRate = taxRate;
        this.amount = this.quantity.multiply(price);
        this.taxAmount = this.amount.multiply(taxRate);
    }
}
```

> 改进手法

```java
public class Invoice {
    private final String buyer;

    private final String seller;

    private final List<InvoiceLine> lines;

    public Invoice(String buyer, String seller, List<InvoiceLine> lines) {
        this.buyer = buyer;
        this.seller = seller;
        this.lines = new ArrayList<>(lines);
    }

    // 此方法返回了集合引用，外部可通过操作这个引用来改变Invoice对象
    public List<InvoiceLine> getLines() {
        return Collections.unmodifiableList(lines);
    }

    public BigDecimal getAmount() {
        return lines.stream().map(line -> line.getAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public BigDecimal getTaxAmount() {
        return lines.stream().map(line -> line.getTaxAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public BigDecimal getTotal() {
        return getAmount().add(getTaxAmount());
    }
}
```

```java
public class InvoiceLine {
    private final String product;
    private final BigDecimal quantity;
    private final BigDecimal price;
    private final BigDecimal taxRate;

    public InvoiceLine(String product, BigDecimal quantity, BigDecimal price, BigDecimal taxRate) {
        this.product = product;
        this.quantity = quantity;
        this.price = price;
        if (taxRate.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Tax rate should >= 0");
        }
        this.taxRate = taxRate;
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

    public BigDecimal getTaxRate() {
        return taxRate;
    }

    public BigDecimal getAmount() {
        return this.getQuantity().multiply(getPrice());
    }

    public BigDecimal getTaxAmount() {
        return this.getAmount().multiply(getTaxRate());
    }
}
```

```java
public class InvoiceLineBuilder {
    private String product;

    private BigDecimal quantity;

    private BigDecimal price;

    private BigDecimal taxRate;

    public InvoiceLineBuilder setProduct(String product) {
        this.product = product;
        return this;
    }

    public InvoiceLineBuilder setQuantity(BigDecimal quantity) {
        this.quantity = quantity;
        return this;
    }

    public InvoiceLineBuilder setPrice(BigDecimal price) {
        this.price = price;
        return this;
    }

    public InvoiceLineBuilder setTaxRate(BigDecimal taxRate) {
        this.taxRate = taxRate;
        return this;
    }

    public InvoiceLine createInvoiceLine() {
        return new InvoiceLine(product, quantity, price, taxRate);
    }
}
```

> 操作手法

| 操作                       | 快捷键（推荐） | Ctrl+Alt+Shift+T（或：鼠标右键“Refactor”） |
| -------------------------- | -------------- | ------------------------------------------ |
| 提封装变量                 |                | Encapsulate Fields                         |
| 拆分变量（用提取函数）     | Ctrl+Atl+M     | Extract Method                             |
| 移除设值函数（用内联移除） | Ctrl+Alt+N     | Inline Method                              |
| 移除设值函数（直接删除）   | Alt+Del        | Safe Delete                                |
| Builder模式创建不可变对象  |                | Replace Constructor as Builder             |
