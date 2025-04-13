+++
title = '"Effective Java"精读之异常'
date = 2025-01-12T23:05:37+08:00
categories = ['java']
tags = ['java','effective-java']
+++

### 1. 仅在异常条件下使用异常

异常应仅用于表示程序中的异常情况，而不是作为正常控制流的一部分。异常的使用不当会使代码复杂且效率低下。

**总结：** 异常应仅用于处理不正常的情况，而不是作为常规控制流程的一部分。

**代码示例：**

```java
// 错误做法：使用异常来控制正常流程
try {
    processData();  // 正常逻辑
} catch (Exception e) {
    // 异常逻辑
}

// 正确做法：仅在出现异常时处理
try {
    processData();  // 处理正常逻辑
} catch (DataProcessingException e) {
    // 处理数据处理失败的逻辑
}
```

核心点：避免滥用异常来控制正常流程，应该仅用于处理异常情况。

------

### 2. 对于可恢复的条件使用检查型异常，对于编程错误使用运行时异常

可恢复的异常条件应使用检查型异常（如 `IOException`），而编程错误应使用运行时异常（如 `NullPointerException`）。检查型异常要求调用者处理，而运行时异常则是程序错误，调用者无需特别处理。

**总结：** 区分检查型异常和运行时异常，明确哪些异常是可恢复的，哪些是不可恢复的。

**代码示例：**

```java
// 错误做法：用运行时异常表示可恢复的条件
public void readFile(String filename) {
    if (filename == null) {
        throw new RuntimeException("Filename cannot be null");
    }
    // 读取文件的逻辑
}

// 正确做法：用检查型异常表示可恢复的条件
public void readFile(String filename) throws IllegalArgumentException {
    if (filename == null) {
        throw new IllegalArgumentException("Filename cannot be null");
    }
    // 读取文件的逻辑
}
```

核心点：使用合适类型的异常来明确异常的性质和处理方式。

------

### 3. 避免不必要的使用检查型异常

检查型异常应谨慎使用，过多的检查型异常会增加代码复杂性，使代码难以维护。仅在确实需要时使用它们。

**总结：** 使用检查型异常时要小心，避免它们过多干扰代码逻辑。

**代码示例：**

```java
// 错误做法：滥用检查型异常
public void processFile(String file) throws IOException {
    // 如果文件为空就抛出异常
    if (file == null) {
        throw new IOException("File cannot be null");
    }
}

// 正确做法：避免不必要的检查型异常
public void processFile(String file) {
    if (file == null) {
        // 提供默认值或其他处理方式，而非抛出异常
    }
}
```

核心点：检查型异常应该用在必要的地方，避免增加额外的复杂度。

------

### 4. 使用标准异常

使用标准异常类型（如 `IOException`、`IllegalArgumentException` 等）可以使代码的意图更加清晰。

**总结：** 标准异常类型具有广泛的理解和处理方式，应优先使用标准异常类型。

**代码示例：**

```java
// 错误做法：使用自定义异常
public class CustomException extends Exception {
    public CustomException(String message) {
        super(message);
    }
}

// 正确做法：使用标准异常类型
public void processInput(String input) throws IllegalArgumentException {
    if (input == null) {
        throw new IllegalArgumentException("Input cannot be null");
    }
}
```

核心点：使用标准异常类型来增强代码的可读性和一致性。

------

### 5. 抛出适当的异常类型

根据异常的性质抛出适当的异常类型，避免过于泛化的异常，确保调用者可以捕获并处理相应的异常。

**总结：** 为每个异常选择合适的类型，增强异常信息的准确性。

**代码示例：**

```java
// 错误做法：抛出泛化异常
public void process(String data) throws Exception {
    if (data == null) {
        throw new Exception("Data cannot be null");
    }
}

// 正确做法：抛出具体的异常
public void process(String data) throws IllegalArgumentException {
    if (data == null) {
        throw new IllegalArgumentException("Data cannot be null");
    }
}
```

核心点：使用合适的异常类型，可以帮助开发者更清晰地理解异常的背景和处理方式。

------

### 6. 在每个方法中都要声明抛出的异常

如果方法可能抛出异常，确保在方法签名中声明这些异常。这可以帮助调用者处理异常。

**总结：** 每个方法应在签名中声明其抛出的异常，确保异常处理的明确性。

**代码示例：**

```java
// 错误做法：不声明抛出的异常
public void readFile(String file) {
    if (file == null) {
        throw new IOException("File cannot be null");
    }
}

// 正确做法：声明抛出的异常
public void readFile(String file) throws IOException {
    if (file == null) {
        throw new IOException("File cannot be null");
    }
}
```

核心点：通过方法签名声明异常，使调用者可以预见并妥善处理异常。

------

### 7. 在异常中包含详细的失败信息

异常信息应该详细描述失败的上下文，以便调试和理解发生错误的原因。

**总结：** 提供详细的异常信息，以帮助开发者更快速地定位和解决问题。

**代码示例：**

```java
// 错误做法：信息过于简略
throw new Exception("Error");

// 正确做法：提供详细的错误信息
throw new IOException("File read error: file not found: " + fileName);
```

核心点：异常信息应包含足够的上下文，帮助快速定位问题。

------

### 8. 确保异常的原子性

尽量使异常的处理保持原子性，不要在抛出异常之后继续处理可能会导致不一致状态的操作。

**总结：** 发生异常时应尽可能保证数据的一致性和完整性，避免中途插入其他操作。

**代码示例：**

```java
// 错误做法：在抛出异常后继续进行可能导致不一致的操作
public void updateUser(User user) throws SQLException {
    connection.beginTransaction();
    userDao.update(user);
    if (somethingWentWrong()) {
        throw new SQLException("Update failed");
    }
    // 异常发生后仍然继续进行其他操作
}

// 正确做法：确保抛出异常后不再执行后续操作
public void updateUser(User user) throws SQLException {
    connection.beginTransaction();
    userDao.update(user);
    if (somethingWentWrong()) {
        connection.rollback(); // 确保事务回滚
        throw new SQLException("Update failed");
    }
}
```

核心点：异常处理时应保证操作的原子性，确保系统处于一致状态。

------

### 9. 不要忽略异常

忽略异常可能会导致程序错误无法被及时发现，甚至可能在不经意间造成严重的后果。异常应当被适当处理或记录。

**总结：** 不要简单地捕获异常而忽略它，必须进行合理的处理或者记录。

**代码示例：**

```java
// 错误做法：捕获异常但不做任何处理
try {
    processData();
} catch (IOException e) {
    // 什么都不做，忽略异常
}

// 正确做法：记录异常
try {
    processData();
} catch (IOException e) {
    log.error("IOException occurred while processing data", e);
    throw e; // 重新抛出异常或者进行适当处理
}
```

核心点：忽略异常会掩盖问题，必须在发生异常时做适当的处理。