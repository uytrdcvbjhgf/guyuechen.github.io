+++
title = '代码坏味道之过长函数 (Long Function)'
date = 2024-09-18T21:08:56+08:00
categories = ['java']
tags = ['refactor']
+++

**定义**

一个函数包含了过多的逻辑功能或过分体现逻辑功能的实现细节，导致函数产生过长的代码块

**影响**

- 过长函数往往意味着函数功能不单一或过分呈现细节未进行抽象，造成可读性差和增加代码维护成本；
- 过长函数还容易发生资源未释放等编码问题

**改进目标**

- 抽象待重构函数流程，分解出子函数，最大化精简出可读性强、功能单一的函数

**方法**

- 提炼函数：找到函数中适合集中在一起的部分，将他们提炼出来形成一个新函数，并用函数“做什么”来命名新的函数

> 案例1


**代码背景**

下述是一个打印发票的函数，发票的内容包含三块：

- 打印发票头。发票头包含买方、卖方姓名；
- 打印产品明细列表。每包含行产品号、名称、数量和价格信息；
- 打印发票汇总。输出总金额。

**症状/问题**

函数功能逻辑实现过于呈现细节，导致函数过长，理解难度大：

- 函数较长且过分呈现实现细节，理解函数意图困难
- 代码实现解耦性差，for循环复杂，包含两个功能
- 代码实现语句理解难，if条件复杂，不能够快速理解条件含义
- 临时变量过多，for循环中使用了过多的不必要临时变量
- 类功能未内聚，属于Invoice和InvoiceLine的函数未内聚。例如计算总价不应属于打印器的能力

**重构目标**

- 简化print函数实现流程，提高可读性

```java
public class InvoicePrinter {
    public static void print(Invoice invoice, PrintStream printStream) {
        printStream.println("====== INVOICE ======");
        printStream.println("Buyer: " + invoice.getBuyer());
        printStream.println("Seller: " + invoice.getSeller());

        printStream.println("------ Detail ------");
        printStream.println("ln\tProduct\tPrice\tQt\tAmount");
        float total = 0;
        for (int lineId = 0; lineId < invoice.getLines().size(); ++lineId) {
            final InvoiceLine line = invoice.getLines().get(lineId);
            String product = line.getProduct();
            float price = line.getPrice();
            float quantity = line.getQuantity();
            float amount = price * quantity;
            if (product == null || "".equals(product.trim())
                    || price <= 0 || quantity <= 0) {
                printStream.println(lineId + "\tInvalid");
            } else {
                printStream.println(lineId + "\t" + product + "\t" + price
                        + "\t" + quantity + "\t" + amount);
            }
            total += amount;
        }
        printStream.println("------ Total ------");
        printStream.println(total);
    }
}
```

> 改进手法1：理解长函数功能意图，归纳功能流程，提炼功能步骤


**理解函数意图**

- 寻找注释：注释间的代码块可能表明了代码可以分块提炼。同时注释通常能指出代码意图，帮助提炼函数的命名
- 若无注释，阅读理解长函数实现功能，归纳长函数的执行步骤

**归纳功能流程**

将属于同一逻辑功能的代码通过移动语句聚合到一起

- printHeader
- printDetail 
  - printTableHeader
  - printInvoiceLines
- printFooter

**功能逻辑分割**

可以看出printDetail步骤中夹杂了计算所有商品总价的功能，为帮助提炼函数， 必须解耦函数算法的逻辑

**for功能逻辑分割**

for循环包含功能：

- 打印发票正文的每行信息
- 计算所有产品总价

注：产品总价实际服务于最后的Total打印，分割出的for循环需要移动语句到对应位置

**提炼函数抽象主函数流程**

以“做什么”命名提炼的函数，而不是“怎么做”

> 改进手法2：复杂语句下沉到子函数，对复杂子函数递归重构


printDetail函数

- 子函数进行流程分析和提炼
- 临时变量过多：以查询取代变量
- 功能内聚到合适的位置，并以查询取代变量
- 分解条件语句：复杂的条件表达式
- 分解条件语句：复杂的条件分支语句（如果条件分支语也有过长语句的坏味道，可继续进行递归重构）

printFooter函数

- 内聚功能到合适位置，并以查询取代变量
- 复用能力，减少函数代码

```java
public class InvoicePrinter {
    public static void print(Invoice invoice, PrintStream printStream) {
        printHeader(invoice, printStream);

        printDetails(invoice, printStream);

        printFooter(invoice, printStream);
    }

    private static void printHeader(Invoice invoice, PrintStream printStream) {
        printStream.println("====== INVOICE ======");
        printStream.println("Buyer: " + invoice.getBuyer());
        printStream.println("Seller: " + invoice.getSeller());
    }

    private static void printInvoiceHeader(PrintStream printStream) {
        printStream.println("------ Detail ------");
        printStream.println("ln\tProduct\tPrice\tQt\tAmount");
    }

    private static void printInvoiceLines(Invoice invoice, PrintStream printStream) {
        for (int lineId = 0; lineId < invoice.getLines().size(); ++lineId) {
            final InvoiceLine line = invoice.getLines().get(lineId);
            printInvoiceLine(printStream, lineId, line);
        }
    }

    private static void printInvoiceLine(PrintStream printStream, int lineId, InvoiceLine line) {
        if (line.isValid()) {
            printStream.println(lineId + "\tInvalid");
        } else {
            printStream.println(lineId + "\t" + line.getProduct() + "\t" + line.getPrice()
                + "\t" + line.getQuantity() + "\t" + line.getAmount());
        }
    }

    private static void printDetails(Invoice invoice, PrintStream printStream) {
        printInvoiceHeader(printStream);
        printInvoiceLines(invoice, printStream);
    }

    private static void printFooter(Invoice invoice, PrintStream printStream) {
        printStream.println("------ Total ------");
        float total = 0;
        for (int lineId = 0; lineId < invoice.getLines().size(); ++lineId) {
            final InvoiceLine line = invoice.getLines().get(lineId);
            total += line.getAmount();
        }
        printStream.println(total);
    }
}
```

> 案例2


**代码背景**

- 这是一个保存数据的方法，根据用户指定的保存方式和保存目的地址进行文件的上传或保存。
- 保存方式包括：本地保存、SFTP上传、EMAIL发送、华为云、 百度云方式

**症状/问题**

函数功能不单一且实现过于呈现细节，导致函数过长且需翻页阅读

- 函数过于呈现实现细节，导致功能不单一：包含分类工作和具体的 保存/上传操作
- 函数太长，导致显示屏不能一屏显示，造成阅读和理解的困难
- 后续的维护将使该函数不断增大，例如增加保存/上传类型

**重构目标**

- 简少save函数代码行，方便用户一页显示，提高可读性

```java
public class StreamSaver {
    public long save(InputStream stream, String destination, StorageType storageType) throws IOException {
        switch (storageType) {
            case LOCAL:
                // pseudocode
                File localFile = new File(destination);
                try (FileOutputStream fileOutputStream = new FileOutputStream(localFile)) {
                    byte[] buffer = new byte[4096];
                    long total = 0;
                    int len = 0;
                    while ((len = stream.read(buffer)) >= 0) {
                        total += len;
                        fileOutputStream.write(buffer, 0, len);
                    }
                    return total;
                }
            case SFTP:
                // pseudocode
                try (SftpConnection sftpConnection = new SftpConnection(destination)) {
                    return sftpConnection.upload(stream);
                }
            case EMAIL:
                // pseudocode
                EmailDraft emailDraft = new EmailDraft();
                emailDraft.setRecipient(destination);
                long size = emailDraft.attach("filename", stream);
                EmailSender.send(emailDraft);
                return size;
            case HUAWEI_CLOUD:
                // pseudocode
                File tempFile = File.createTempFile("prefix", "tmp");
                try (FileOutputStream fileOutputStream = new FileOutputStream(tempFile)) {
                    byte[] buffer = new byte[4096];
                    int len = 0;
                    while ((len = stream.read(buffer)) >= 0) {
                        fileOutputStream.write(buffer, 0, len);
                    }
                }
                HuaweiCloudClient huaweiCloudClient = new HuaweiCloudClient();
                long total = huaweiCloudClient.upload(destination, tempFile);
                tempFile.delete();
                return total;
            case BAIDU_CLOUD:
                // pseudocode
                BaiduCloudClient baiduCloudClient = new BaiduCloudClient();
                long uploadedTotal = baiduCloudClient.upload(destination, stream);
                return uploadedTotal;
            default:
                throw new NotImplementedException();
        }
    }
}
```

> 改进手法：Switch分支语句的提炼


```java
public class StreamSaver {
    public long save(InputStream stream, String destination, StorageType storageType) throws IOException {
        switch (storageType) {
            case LOCAL:
                return saveToLocal(stream, destination);
            case SFTP:
                return saveToSFTP(stream, destination);
            case EMAIL:
                return saveToEmail(stream, destination);
            case HUAWEI_CLOUD:
                return saveToHuaweiCloud(stream, destination);
            case BAIDU_CLOUD:
                return saveToBaiduCloud(stream, destination);
            default:
                throw new NotImplementedException();
        }
    }

    private long saveToBaiduCloud(InputStream stream, String destination) {
        // pseudocode
        BaiduCloudClient baiduCloudClient = new BaiduCloudClient();
        return baiduCloudClient.upload(destination, stream);
    }

    private long saveToHuaweiCloud(InputStream stream, String destination) throws IOException {
        // pseudocode
        File tempFile = File.createTempFile("prefix", "tmp");
        try (FileOutputStream fileOutputStream = new FileOutputStream(tempFile)) {
            byte[] buffer = new byte[4096];
            int len = 0;
            while ((len = stream.read(buffer)) >= 0) {
                fileOutputStream.write(buffer, 0, len);
            }
        }
        HuaweiCloudClient huaweiCloudClient = new HuaweiCloudClient();
        long total = huaweiCloudClient.upload(destination, tempFile);
        tempFile.delete();
        return total;
    }

    private long saveToEmail(InputStream stream, String destination) {
        // pseudocode
        EmailDraft emailDraft = new EmailDraft();
        emailDraft.setRecipient(destination);
        long size = emailDraft.attach("filename", stream);
        EmailSender.send(emailDraft);
        return size;
    }

    private long saveToSFTP(InputStream stream, String destination) throws IOException {
        // pseudocode
        try (SftpConnection sftpConnection = new SftpConnection(destination)) {
            return sftpConnection.upload(stream);
        }
    }

    private long saveToLocal(InputStream stream, String destination) throws IOException {
        // pseudocode
        File localFile = new File(destination);
        try (FileOutputStream fileOutputStream = new FileOutputStream(localFile)) {
            byte[] buffer = new byte[4096];
            long total = 0;
            int len = 0;
            while ((len = stream.read(buffer)) >= 0) {
                total += len;
                fileOutputStream.write(buffer, 0, len);
            }
            return total;
        }
    }
}
```

特别地，如果统一Switch分支条件模式出现了多次，可使用多态取代重复的switch进行重构。请参考 [12 重复的Switch](#12 重复的Switch（Repeated Switches）)

> 操作手法

| 操作           | 快捷键（推荐） | Ctrl+Alt+Shift+T（或：鼠标右键“Refactor”） | 注意                     |
| -------------- | -------------- | ------------------------------------------ | ------------------------ |
| 提炼函数       | Ctrl+Alt+M     | Extract Method                             |                          |
| 搬移函数       | F6             | Move Instance Method                       | 需要先将方法变为静态方法 |
| 以查询取代变量 | Ctrl+Atl+N     | Inline Variable                            |                          |