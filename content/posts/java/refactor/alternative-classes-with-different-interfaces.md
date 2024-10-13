+++
title = '代码坏味道之异曲同工的类 (Alternative Classes With Different Interfaces)'
date = 2024-10-13T18:37:04+08:00
categories = ['java']
tags = ['refactor']
+++

**定义**

两个类功能一致，却有不同的定义(方法/接口)

**影响**

- 相关的业务逻辑可能会重复实现，或分布到不同类中，代码难维护

**改进目标**

- 统一接口、相同的功能只实现一份

**方法**

- 函数改名
- 搬移函数
- 添加参数
- 函数参数化
- 提炼超类
- 移除 子类

> 案例1：问题代码


**代码背景**

- 有个制造工厂（ManufactureService）
- 它雇用了雇员（Employee）把原料（Material）加工成产品 （Product）
- 它也雇用了工人（Worker）把原料（Material）加工成产品 （Product）
- 其实，雇员（Employee）和工人（Worker）逻辑上等价

**症状/问题**

“异曲同工的类”让人困惑。从局部看，它们有着不同的函数接口；从整体看，它们像是同样的东西。分别看Employee和Worker的函数：

- ID：identity vs id
- 性别：boolean vs Sex枚举
- 某方法：setValues vs setProperties
- 加工产品的方法：ManufactureService.createProductUsingEmployee() vs Worker.produce()

**重构目标**

- 相同的类只留一个（本例中留Worker）

```java
/**
 * 雇员
 *
 * @author 00618893
 * @since 2021-11-15
 */
public class Employee {
    private String identity;

    private String name;

    private boolean isMale;

    public void setValues(String name, boolean isMale) {
        this.name = name;
        this.isMale = isMale;
    }

    public void setIdentity(String identity) {
        this.identity = identity;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setMale(boolean male) {
        isMale = male;
    }

    public String getIdentity() {
        return identity;
    }

    public String getName() {
        return name;
    }

    public boolean isMale() {
        return isMale;
    }
}
```

```java
/**
 * 工人
 *
 * @author 00618893
 * @since 2021-11-15
 */
public class Worker {
    private String id;

    private String name;

    private Sex sex;

    public Worker setProperties(Sex sex, String name, String id) {
        this.id = id;
        this.name = name;
        this.sex = sex;
        return this;
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public Worker setSex(Sex sex) {
        this.sex = sex;
        return this;
    }

    public Sex getSex() {
        return sex;
    }

    public Product produce(Material material) {
        return new Product(new StringBuilder(material.getName()).reverse().toString(), id);
    }
}
```

```java
/**
 * 制造服务
 *
 * @author 00618893
 * @since 2021-11-15
 */
public class ManufactureService {
    private String workerName;
    private String workerId;
    private Sex workerSex;

    public ManufactureService(String workerName, String workerId, Sex workerSex) {
        this.workerName = workerName;
        this.workerId = workerId;
        this.workerSex = workerSex;
    }

    public Product produceUsingWorker(Material material) {
        Worker worker = new Worker().setProperties(workerSex, workerName, workerId);
        return worker.produce(material);
    }

    public Product produceUsingEmployee(Material material) {
        Employee employee = new Employee();
        employee.setValues(workerName, workerSex.equals(Sex.MALE));
        employee.setIdentity(workerId);

        return createProductUsingEmployee(employee, material);
    }

    private Product createProductUsingEmployee(Employee employee, Material material) {
        return new Product(new StringBuilder(material.getName()).reverse().toString(), employee.getIdentity());
    }
}
```

> 改进手法


- 统一Employee和Worker的函数签名（含：函数名、参数列表、 返回值、异常申明），使两个类等价
- 查漏补缺类功能（如：Employee中不含加工产品的函数）
- 把Employee全部用Worker替代
- 删除Employee类

```java
/**
 * 工人
 *
 * @author 00618893
 * @since 2021-11-15
 */
public class Worker {

    private String id;

    private String name;

    private Sex sex;

    public void setId(String id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public Worker setProperties(Sex sex, String name, String id) {
        this.id = id;
        this.name = name;
        this.sex = sex;
        return this;
    }

    public String getId() {
        return id;
    }

    public Worker setSex(Sex sex) {
        this.sex = sex;
        return this;
    }

    public Sex getSex() {
        return sex;
    }

    public Product produce(Material material) {
        return new Product(new StringBuilder(material.getName()).reverse().toString(), id);
    }
}
```

```java
/**
 * 制造服务
 *
 * @author 00618893
 * @since 2021-11-15
 */
public class ManufactureService {
    private String workerName;
    private String workerId;
    private Sex workerSex;

    public ManufactureService(String workerName, String workerId, Sex workerSex) {
        this.workerName = workerName;
        this.workerId = workerId;
        this.workerSex = workerSex;
    }

    public Product produceUsingWorker(Material material) {
        Worker worker = new Worker().setProperties(workerSex, workerName, workerId);
        return worker.produce(material);
    }

    public Product produceUsingEmployee(Material material) {
        Worker employee = new Worker();
        employee.setProperties(workerSex, workerName, workerId);

        return employee.produce(material);
    }
}
```

> 案例2：问题代码


**代码背景**

有个销售管理系统，其中有：

- 报价单Quotation，含：序列号、买家、创建时间、报价明细、 报价有效期、并能转化为订单、重新报价……
- 销售订单SalesOrder，含：序列号、买家、创建时间、价格明 细、收货地址、支付信息、并能创建出库单……

**症状/问题**

Quotation和SalesOrder共享了一些功能，但没有共同的基类/接口：

- 相同点：序列号、买家、创建时间、价格明细……
- 差异点： 
  - Quotation：报价有效期、转化为订单、重新报价……
  - SalesOrder：收货地址、支付信息、创建出库单……
- 逻辑重复、代码重复

**重构目标**

- 消除重复、消除混淆

```java
/**
 * 报价单
 *
 * @author 00618893
 * @since 2021-11-15
 */
public class Quotation {
    /**
     * 序列号
     */
    private final String serialNumber;

    /**
     * 买家
     */
    private final String buyer;

    /**
     * 创建时间
     */
    private final long createTime = System.currentTimeMillis();

    /**
     * 明细行
     */
    protected final List<ProductLine> lines = new ArrayList<>();

    // 报价有效的终止时间
    private long expiryTime;

    public Quotation(String serialNumber, String buyer) {
        this.serialNumber = serialNumber;
        this.buyer = buyer;
    }

    public List<ProductLine> getLines() {
        return Collections.unmodifiableList(lines);
    }

    public String getSerialNumber() {
        return serialNumber;
    }

    public String getBuyer() {
        return buyer;
    }

    public long getCreateTime() {
        return createTime;
    }

    public BigDecimal getAmount() {
        return lines.stream()
            .map(ProductLine::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    // 根据报价单创建销售订单
    public SalesOrder createOrder() {
        throw new NotImplementedException();
    }

    // 创建一个新的报价单，并使用新的折扣率
    public Quotation cloneWithNewDiscount(BigDecimal discount) {
        throw new NotImplementedException();
    }
}
```

```java
/**
 * 销售订单
 *
 * @author 00618893
 * @since 2021-11-15
 */
public class SalesOrder {
    /**
     * 序列号
     */
    private final String serialNumber;

    /**
     * 买家
     */
    private final String buyer;

    /**
     * 创建时间
     */
    private final long createTime = System.currentTimeMillis();

    /**
     * 明细行
     */
    protected final List<ProductLine> lines = new ArrayList<>();

    // 收货地址
    private String shippingAddress;

    // 支付信息
    private String paymentReference;

    public SalesOrder(String serialNumber, String buyer) {

        this.serialNumber = serialNumber;
        this.buyer = buyer;
    }

    public List<ProductLine> getLines() {
        return Collections.unmodifiableList(lines);
    }

    public String getSerialNumber() {
        return serialNumber;
    }

    public String getBuyer() {
        return buyer;
    }

    public long getCreateTime() {
        return createTime;
    }

    public BigDecimal getAmount() {
        return lines.stream()
            .map(ProductLine::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    // 创建出库单
    public DeliveryVoucher createDeliveryVoucher() {
        return new DeliveryVoucher();
    }
}
```

> 改进手法


```java
public class AbstractDocument {
    /**
     * 序列号
     */
    protected final String serialNumber;

    /**
     * 买家
     */
    protected final String buyer;

    /**
     * 明细行
     */
    protected final List<ProductLine> lines = new ArrayList<>();

    /**
     * 创建时间
     */
    private final long createTime = System.currentTimeMillis();

    public AbstractDocument(String serialNumber, String buyer) {
        this.serialNumber = serialNumber;
        this.buyer = buyer;
    }

    public List<ProductLine> getLines() {
        return Collections.unmodifiableList(lines);
    }

    public String getSerialNumber() {
        return serialNumber;
    }

    public String getBuyer() {
        return buyer;
    }

    public long getCreateTime() {
        return createTime;
    }
}
```

```java
/**
 * 销售订单
 *
 * @author 00618893
 * @since 2021-11-15
 */
public class SalesOrder extends AbstractDocument {

    // 收货地址
    private String shippingAddress;

    // 支付信息
    private String paymentReference;

    public SalesOrder(String serialNumber, String buyer) {
        super(serialNumber, buyer);
    }

    public BigDecimal getAmount() {
        return lines.stream()
            .map(ProductLine::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    // 创建出库单
    public DeliveryVoucher createDeliveryVoucher() {
        return new DeliveryVoucher();
    }
}
```

```java
/**
 * 报价单
 *
 * @author 00618893
 * @since 2021-11-15
 */
public class Quotation extends AbstractDocument {

    // 报价有效的终止时间
    private long expiryTime;

    public Quotation(String serialNumber, String buyer) {
        super(serialNumber, buyer);
    }

    public BigDecimal getAmount() {
        return lines.stream()
            .map(ProductLine::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    // 根据报价单创建销售订单
    public AbstractDocument createOrder() {
        throw new NotImplementedException();
    }

    // 创建一个新的报价单，并使用新的折扣率
    public Quotation cloneWithNewDiscount(BigDecimal discount) {
        throw new NotImplementedException();
    }
}
```

> 操作手法

| 操作                                     | 快捷键（推荐） | Ctrl+Alt+Shift+T（或：鼠标右键“Refactor”） |
| ---------------------------------------- | -------------- | ------------------------------------------ |
| 改函数名                                 | Shift+F6       | Rename                                     |
| 改函数签名（含：改名、改参数类型与顺序） | Ctrl+F6        | Change Signature                           |
| 搬移函数                                 | F6             | Move Instance Method                       |
| 提取超类                                 |                | Extract Superclass                         |
| 上移函数、下移函数                       |                | Pull Members Up / Push Members Down        |
| 内联函数                                 | Ctrl+Shift+N   | Inline Method                              |
| 删除函数                                 | Alt+Del        | Safe Delete                                |


补充：

部分代码片段可能出现重复的，可以用重复代码工具识别出来，大部分时间需要人工判断
