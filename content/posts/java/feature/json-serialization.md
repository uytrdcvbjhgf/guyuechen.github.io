+++
title = '如何在 Java 中操作 json'
date = 2024-09-02T11:26:49+08:00
categories = ["java"]
tags = ["java", "json"]
+++

## 1 简介

> **json** : JavaScript Object Notation，JS 对象简谱。

官网：https://www.json.org/json-zh.html

## 2 使用场景

* 网络传输

  描述同样的信息，json 相比 xml 占用更少的空间，如：

  ```xml
  <?xml version="1.0" encoding="UTF-8"?>
  <person>
  <id>1</id>
  <name>张三</name>
  <age>30</age>
  </person>
  ```

  json 表示：

  ```json
  {
    "id":1,
    "name":"张三",
    "age":30
  }
  ```

* 序列化存储

## 3 java 里面操作 json 有哪些技术?

* 所谓的操作指的是什么？

  把 java 里面的 bean、map、collection 等转为 json 字符串（序列化）或反向操作（反序列化）。

* java 里操作 json 的技术一览

  ![image-20210816004456117](https://raw.githubusercontent.com/guyuechen/gallery/main/img/image-20210816004456117.png)

## 4 `fastjson`

```xml
<!-- https://mvnrepository.com/artifact/com.alibaba/fastjson -->
<dependency>
  <groupId>com.alibaba</groupId>
  <artifactId>fastjson</artifactId>
  <version>1.2.73</version>
</dependency>
```

### 4.1 序列化

拿一个Person类为例

```java
import com.alibaba.fastjson.annotation.JSONField;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Date;

@Data
public class Person {
    /**
     * 用户id
     */
    private Long id;
    private String name;
    @JSONField(serialize = false, deserialize = false)
    private String pwd;
    /**
     * 地址
     * name = "address":指定属性名和json字符串key的对应关系 addr---address
     */
    @JSONField(name = "address")
    private String addr;
    /**
     * 网站
     */
    private String websiteUrl;
    private Date registerDate;
    private LocalDateTime birthDay;
}
```



* 包含null

  ```java
  /**
   * 测试序列化：
   * 把bean转为json字符串
   */
  @Test
  public void test1(){
      Person person = new Person();
      person.setId(1L);
      // person.setName("王二麻子");
      person.setPwd("123456");
      person.setAddr("河南");
      person.setWebsiteUrl("http://www.roadjava.com");
      person.setRegisterDate(new Date());
      person.setBirthDay(LocalDateTime.now());
      // 序列化
      /*
       WriteMapNullValue:指定序列化时包含null
       */
      String string = JSON.toJSONString(person, SerializerFeature.WriteMapNullValue);
      System.out.println(string);
  }
  ```

  ```PERL
  {"address":"河南","birthDay":"2023-07-04T21:17:19.662","id":1,"name":null,"registerDate":1688476639629,"websiteUrl":"http://www.roadjava.com"}
  ```

  

* 日期时间格式化

  ```java
  import com.alibaba.fastjson.annotation.JSONField;
  import lombok.Data;
  
  import java.time.LocalDateTime;
  import java.util.Date;
  
  @Data
  public class Person {
      /**
       * 用户id
       */
      private Long id;
      private String name;
      @JSONField(serialize = false, deserialize = false)
      private String pwd;
      /**
       * 地址
       * name = "address":指定属性名和json字符串key的对应关系 addr---address
       */
      @JSONField(name = "address")
      private String addr;
      /**
       * 网站
       */
      private String websiteUrl;
      @JSONField(format = "yyyy-MM-dd HH:mm:ss")
      private Date registerDate;
      @JSONField(format = "yyyy-MM-dd HH:mm:ss")
      private LocalDateTime birthDay;
  }
  ```

  ```java
  {"address":"河南","birthDay":"2023-07-04 21:14:26","id":1,"name":null,"registerDate":"2023-07-04 21:14:26","websiteUrl":"http://www.roadjava.com"}
  ```

  

* 奇怪的"$ref"

  ```java
  /**
   * 测试fastjson的引用探测
   * $ref:对象中多次引用了同一个其他对象的时候，序列化就会出现$ref
   */
  @Test
  public void test$Ref() {
      List<Person> list = new ArrayList<>();
      Person person = new Person();
      person.setId(33L);
      person.setName("王二麻子");
      list.add(person);
      list.add(person);
      list.add(person);
      String string = JSON.toJSONString(list);
      System.out.println(string);
  }
  ```

  ```perl
  [{"id":33,"name":"王二麻子"},{"$ref":"$[0]"},{"$ref":"$[0]"}]
  ```

  ```java
  /**
   * 测试fastjson的引用探测
   * $ref:对象中多次引用了同一个其他对象的时候，序列化就会出现$ref
   */
  @Test
  public void test$Ref() {
      List<Person> list = new ArrayList<>();
      Person person = new Person();
      person.setId(33L);
      person.setName("王二麻子");
      list.add(person);
      list.add(person);
      list.add(person);
      // DisableCircularReferenceDetect 禁用引用探测功能
      String string = JSON.toJSONString(list,SerializerFeature.DisableCircularReferenceDetect);
      System.out.println(string);
  }
  ```

  ```perl
  [{"id":33,"name":"王二麻子"},{"id":33,"name":"王二麻子"},{"id":33,"name":"王二麻子"}]
  ```

  

* SerializeFilter定制处理

  对属性或属性值在序列化前做定制化处理

  ```java
  /**
   * SerializeFilter定制处理.要求:
   * 输出的json字符串的key是大写的、驼峰转下划线
   */
  @Test
  public void testSerializeFilter() {
      Person person = new Person();
      person.setId(1L);
      person.setName("王二麻子");
      person.setPwd("123");
      person.setAddr("河南");
      person.setWebsiteUrl("http://www.roadjava.com");
      person.setRegisterDate(new Date());
      person.setBirthDay(LocalDateTime.now());
      /*
       object: person对象
       name: 属性
       value: name属性对应的值
       */
      NameFilter nameFilter = (object, name, value) -> name.toUpperCase();
      String string = JSON.toJSONString(person, nameFilter);
      System.out.println(string);
  }
  ```

  ```perl
  {"ADDRESS":"河南","BIRTHDAY":"2023-07-04T21:25:08.527","ID":1,"NAME":"王二麻子","REGISTERDATE":1688477108492,"WEBSITEURL":"http://www.roadjava.com"}
  ```

  

* 美化输出

  ```java
  // 美化格式输出方式1
  String string = JSON.toJSONString(person, true);
  // 美化格式输出方式2
  String string = JSON.toJSONString(person, 
                  SerializerFeature.WriteMapNullValue, 
                  SerializerFeature.PrettyFormat);
  ```

  ```perl
  {
  	"address":"河南",
  	"birthDay":"2023-07-04 21:30:38",
  	"id":1,
  	"name":null,
  	"registerDate":"2023-07-04 21:30:38",
  	"websiteUrl":"http://www.roadjava.com"
  }
  ```

  

### 4.2 反序列化

假设返回给前端的是`ResultVO<T>`

```java
import lombok.Data;

@Data
public class ResultVO<T> {
    private Boolean success = Boolean.TRUE;
    private T data;

    private ResultVO() {
    }

    public static <T> ResultVO<T> buildSuccess(T t) {
        ResultVO<T> resultVO = new ResultVO<>();
        resultVO.setData(t);
        return resultVO;
    }
}
```



* 泛型处理

  ==fastjson对于json中多的key默认的处理就是忽略==

  ```java
  /**
   * 测试反序列化
   * json字符串-->bean
   */
  @Test
  public void testDeSerialize() {
      String jsonStr = "{\"address\":\"河南\",\"birthDay\":\"2021-08-17 03:38:09\",\"id\":1,\"name\":null,\"pwd\":\"123\",\"registerDate\":\"2021-08-17 03:38:09\",\"websiteUrl\":\"http://www.roadjava.com\"}";
      // 反序列化为 person对象
      Person person = JSON.parseObject(jsonStr, Person.class);
      System.out.println(person);
      // 返回给调用端 ResultVO
      ResultVO<Person> personResultVO = ResultVO.buildSuccess(person);
      String voJsonStr = JSON.toJSONString(personResultVO);
      
      // 调用端需要把 voJsonStr 反序列化为对象
      // 反序列化后不能够获取到泛型类型
      ResultVO resultVO = JSON.parseObject(voJsonStr, ResultVO.class);
      System.out.println("resultVO: " + resultVO);
      Object data = resultVO.getData();
  }
  ```

  ```perl
  Person(id=1, name=null, pwd=null, addr=河南, websiteUrl=http://www.roadjava.com, registerDate=Tue Aug 17 03:38:09 CST 2021, birthDay=2021-08-17T03:38:09)
  resultVO: ResultVO(success=true, data={"birthDay":"2021-08-17 03:38:09","address":"河南","websiteUrl":"http://www.roadjava.com","id":1,"registerDate":"2021-08-17 03:38:09"})
  ```

  这样的话就无法体现出==泛型==（反序列化后不能够获取到泛型类型）

  ```java
  /**
   * 测试反序列化
   * json字符串-->bean
   */
  @Test
  public void testDeSerialize() {
      String jsonStr = "{\"address\":\"河南\",\"birthDay\":\"2021-08-17 03:38:09\",\"id\":1,\"name\":null,\"pwd\":\"123\",\"registerDate\":\"2021-08-17 03:38:09\",\"websiteUrl\":\"http://www.roadjava.com\"}";
      // 反序列化为 person对象
      Person person = JSON.parseObject(jsonStr, Person.class);
      System.out.println(person);
      // 返回给调用端 ResultVO
      ResultVO<Person> personResultVO = ResultVO.buildSuccess(person);
      String voJsonStr = JSON.toJSONString(personResultVO);
  
  
      // 需要反序列化为什么类型，就给TypeReference传入什么类型即可
      ResultVO<Person> deSerializedVo = JSON.parseObject(voJsonStr, new TypeReference<ResultVO<Person>>() {
      });
      System.out.println("deSerializedVo: " + deSerializedVo);
      Person data = deSerializedVo.getData();
      System.out.println("data: " + data);
  }
  ```

  ```perl
  Person(id=1, name=null, pwd=null, addr=河南, websiteUrl=http://www.roadjava.com, registerDate=Tue Aug 17 03:38:09 CST 2021, birthDay=2021-08-17T03:38:09)
  deSerializedVo: ResultVO(success=true, data=Person(id=1, name=null, pwd=null, addr=河南, websiteUrl=http://www.roadjava.com, registerDate=Tue Aug 17 03:38:09 CST 2021, birthDay=2021-08-17T03:38:09))
  data: Person(id=1, name=null, pwd=null, addr=河南, websiteUrl=http://www.roadjava.com, registerDate=Tue Aug 17 03:38:09 CST 2021, birthDay=2021-08-17T03:38:09)
  ```

  

### 4.3 通用配置

* 指定属性名和json字符串key的对应关系

  ```java
  /**
   * 地址
   * name = "address":指定属性名和json字符串key的对应关系 addr---address
   */
  @JSONField(name = "address")
  private String addr;
  ```

  

* 忽略指定属性

  ```java
  @JSONField(serialize = false, deserialize = false)
  private String pwd;
  ```

  

## 5 `jackson`

```xml
<dependency>
   <groupId>com.fasterxml.jackson.core</groupId>
   <artifactId>jackson-databind</artifactId>
   <version>2.10.1</version>
</dependency>
<!--对LocalDateTime等jdk8时间日期api的转化支持-->
<dependency>
  <groupId>com.fasterxml.jackson.datatype</groupId>
  <artifactId>jackson-datatype-jsr310</artifactId>
  <version>2.10.1</version>
</dependency>
```

拿一个User类为例

```java
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Date;

@Data
public class User {
    /**
     * 用户id
     */
    private Long id;
    private String name;
    private String pwd;
    /**
     * 地址
     */
    private String addr;
    /**
     * 网站
     */
    private String websiteUrl;
    private Date registerDate;
    private LocalDateTime birthDay;
}
```

```java
private static ObjectMapper objectMapper = new ObjectMapper();

static {     
}

/**
 * 序列化
 */
@Test
public void test1() throws JsonProcessingException {
    User user = new User();
    user.setId(1L);
    // user.setName("王二麻子");
    user.setPwd("123");
    user.setAddr("河南");
    user.setWebsiteUrl("http://www.roadjava.com");
    user.setRegisterDate(new Date());
    user.setBirthDay(LocalDateTime.now());
    String string = objectMapper.writeValueAsString(user);
    System.out.println(string);
}
```

```perl
{"id":1,"name":null,"pwd":"123","addr":"河南","websiteUrl":"http://www.roadjava.com","registerDate":1688479431825,"birthDay":{"dayOfWeek":"TUESDAY","dayOfYear":185,"month":"JULY","year":2023,"dayOfMonth":4,"hour":22,"minute":3,"monthValue":7,"nano":860000000,"second":51,"chronology":{"id":"ISO","calendarType":"iso8601"}}}
```



### 5.1 序列化

* 只包含非null属性

  * 全局配置

    ```java
    private static ObjectMapper objectMapper = new ObjectMapper();
    
    static {
        // 全局配置: 配置序列化时只包含非空属性
        objectMapper.setSerializationInclusion(JsonInclude.Include.NON_NULL);
    }
    
    /**
     * 序列化
     */
    @Test
    public void test1() throws JsonProcessingException {
        User user = new User();
        user.setId(1L);
        // user.setName("王二麻子");
        user.setPwd("123");
        user.setAddr("河南");
        user.setWebsiteUrl("http://www.roadjava.com");
        user.setRegisterDate(new Date());
        user.setBirthDay(LocalDateTime.now());
        String string = objectMapper.writeValueAsString(user);
        System.out.println(string);
    }
    ```

    ```perl
    {"id":1,"pwd":"123","addr":"河南","websiteUrl":"http://www.roadjava.com","registerDate":1688479507149,"birthDay":{"month":"JULY","year":2023,"dayOfMonth":4,"hour":22,"minute":5,"monthValue":7,"nano":179000000,"second":7,"dayOfWeek":"TUESDAY","dayOfYear":185,"chronology":{"id":"ISO","calendarType":"iso8601"}}}
    ```

    

  * 单个的bean配置

    ```java
    import com.fasterxml.jackson.annotation.JsonInclude;
    import lombok.Data;
    
    import java.time.LocalDateTime;
    import java.util.Date;
    
    /**
     * @author zhaodaowen
     * @see <a href="http://www.roadjava.com">王二麻子</a>
     */
    @Data
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public class User {
        /**
         * 用户id
         */
        private Long id;
        private String name;
        private String pwd;
        /**
         * 地址
         */
        private String addr;
        /**
         * 网站
         */
        private String websiteUrl;
        private Date registerDate;
        private LocalDateTime birthDay;
    }
    ```

    

* 日期时间格式化

  * 全局配置

    ```java
    private static final String DATE_TIME_FORMAT = "yyyy-MM-dd HH:mm:ss";
    private static ObjectMapper objectMapper = new ObjectMapper();
    
    static {
        // 全局配置: 配置序列化时只包含非空属性
        objectMapper.setSerializationInclusion(JsonInclude.Include.NON_NULL);
        // 手动配置JavaTimeModule并注册
        JavaTimeModule javaTimeModule = new JavaTimeModule();
        javaTimeModule.addSerializer(LocalDateTime.class, new LocalDateTimeSerializer(DateTimeFormatter.ofPattern(DATE_TIME_FORMAT)));
        javaTimeModule.addDeserializer(LocalDateTime.class, new LocalDateTimeDeserializer(DateTimeFormatter.ofPattern(DATE_TIME_FORMAT)));
        objectMapper.registerModule(javaTimeModule);
    }
    
    /**
     * 序列化
     */
    @Test
    public void test1() throws JsonProcessingException {
        User user = new User();
        user.setId(1L);
        // user.setName("王二麻子");
        user.setPwd("123");
        user.setAddr("河南");
        user.setWebsiteUrl("http://www.roadjava.com");
        user.setRegisterDate(new Date());
        user.setBirthDay(LocalDateTime.now());
        String string = objectMapper.writeValueAsString(user);
        System.out.println(string);
    }
    ```

    ```java
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8") // 建议单个bean配置
    private Date registerDate;
    private LocalDateTime birthDay;
    ```

    ```perl
    {"id":1,"pwd":"123","addr":"河南","websiteUrl":"http://www.roadjava.com","registerDate":"2023-07-04 22:18:03","birthDay":"2023-07-04 22:18:03"}
    ```

    

  * 单个bean的配置

    ```java
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private Date registerDate;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime birthDay;
    ```

    ```perl
    {"id":1,"pwd":"123","addr":"河南","websiteUrl":"http://www.roadjava.com","registerDate":"2023-07-04 22:09:28","birthDay":{"month":"JULY","year":2023,"dayOfMonth":4,"hour":22,"minute":9,"monthValue":7,"nano":124000000,"second":28,"dayOfWeek":"TUESDAY","dayOfYear":185,"chronology":{"id":"ISO","calendarType":"iso8601"}}}
    ```

    可以发现registerDate格式化生效了，但birthDay还是没有格式化成想要的样子

    我们依然要做一个全局配置然后才能生效

    ```java
    private static ObjectMapper objectMapper = new ObjectMapper();
    
    static {
        // 全局配置: 配置序列化时只包含非空属性
        objectMapper.setSerializationInclusion(JsonInclude.Include.NON_NULL);
        // 自动通过spi发现jackson的module并注册
        objectMapper.findAndRegisterModules();
    }
    
    /**
     * 序列化
     */
    @Test
    public void test1() throws JsonProcessingException {
        User user = new User();
        user.setId(1L);
        // user.setName("王二麻子");
        user.setPwd("123");
        user.setAddr("河南");
        user.setWebsiteUrl("http://www.roadjava.com");
        user.setRegisterDate(new Date());
        user.setBirthDay(LocalDateTime.now());
        String string = objectMapper.writeValueAsString(user);
        System.out.println(string);
    }
    ```

    ```perl
    {"id":1,"pwd":"123","addr":"河南","websiteUrl":"http://www.roadjava.com","registerDate":"2023-07-04 22:13:11","birthDay":"2023-07-04 22:13:11"}
    ```

    

* 美化输出

  ```java
  static {
      // 全局配置: 配置序列化时只包含非空属性
      objectMapper.setSerializationInclusion(JsonInclude.Include.NON_NULL);
      // 美化输出
      objectMapper.configure(SerializationFeature.INDENT_OUTPUT, true);
  }
  ```

  ```perl
  {
    "id" : 1,
    "pwd" : "123",
    "addr" : "河南",
    "websiteUrl" : "http://www.roadjava.com",
    "registerDate" : "2023-07-04 22:20:38",
    "birthDay" : "2023-07-04 22:20:38"
  }
  ```

  

### 5.2 反序列化

* 忽略不存在的key（fastjson中默认，但jackson中需要手动配置）

  ```java
  /**
   * 反序列化
   */
  @Test
  public void test2() throws Exception {
      String str = "{\"id\":1,\"pwd\":\"123\",\"address\":\"河南\",\"websiteUrl\":\"http://www.roadjava.com\",\"registerDate\":\"2021-08-17 04:29:42\",\"birthDay\":\"2021-08-17 04:29:42\"}";
      User user = objectMapper.readValue(str, User.class);
      System.out.println(user);
  }
  ```

  ```java
  static {
      // 两种写法一样
      objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
      // objectMapper.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
  }
  ```

  ```perl
  User(id=1, name=null, pwd=123, addr=null, websiteUrl=http://www.roadjava.com, registerDate=Tue Aug 17 04:29:42 CST 2021, birthDay=2021-08-17T04:29:42)
  ```

  

* 泛型处理

  假设有这样一个DTO类

  ```java
  import lombok.Data;
  
  @Data
  public class ResultDTO<T> {
      private Boolean success = Boolean.TRUE;
      private T data;
  
      private ResultDTO() {
      }
  
      public static <T> ResultDTO<T> buildSuccess(T t) {
          ResultDTO<T> resultDTO = new ResultDTO<>();
          resultDTO.setData(t);
          return resultDTO;
      }
  }
  ```

  先序列化，再反序列化这个bean

  ```java
  /**
   * 泛型的处理
   */
  @Test
  public void test3() throws Exception {
      User user = new User();
      user.setName("王二麻子");
      user.setWebsiteUrl("http://www.roadjava.com");
      ResultDTO<User> userResultDTO = ResultDTO.buildSuccess(user);
      String dtoSerializationResult = objectMapper.writeValueAsString(userResultDTO);
      // 反序列化为 ResultDTO<User>
      ResultDTO<User> dataResult = objectMapper.readValue(dtoSerializationResult, new TypeReference<ResultDTO<User>>() {
      });
      System.out.println("dataResult: " + dataResult);
      System.out.println("data: " + dataResult.getData());
  }
  ```

  ```perl
  dataResult: ResultDTO(success=true, data=User(id=null, name=王二麻子, pwd=null, addr=null, websiteUrl=http://www.roadjava.com, registerDate=null, birthDay=null))
  data: User(id=null, name=王二麻子, pwd=null, addr=null, websiteUrl=http://www.roadjava.com, registerDate=null, birthDay=null)
  ```

  

### 5.3 通用配置

* 序列化：驼峰转下划线 / 反序列化：下划线转驼峰

  ```java
  static {
      // 驼峰转下划线  userName -- user_name
      objectMapper.setPropertyNamingStrategy(PropertyNamingStrategy.SNAKE_CASE);
  }
  ```

  ```java
  /**
   * 反序列化
   */
  @Test
  public void test2() throws Exception {
      String str = "{\"id\":1,\"pwd\":\"123\",\"address\":\"河南\",\"website_url\":\"http://www.roadjava.com\",\"register_date\":\"2021-08-17 04:29:42\",\"birth_day\":\"2021-08-17 04:29:42\"}";
      User user = objectMapper.readValue(str, User.class);
      System.out.println(user);
  }
  ```

  ```java
  User(id=1, name=null, pwd=123, addr=null, websiteUrl=http://www.roadjava.com, registerDate=Tue Aug 17 04:29:42 CST 2021, birthDay=2021-08-17T04:29:42)
  ```

  

* 指定属性名和json字符串key的对应关系

  ```java
  /**
   * 地址
   */
  @JsonProperty("address")
  private String addr;
  ```

  

* 忽略指定属性（不参与序列化）

  ```java
  @JsonIgnore
  private String pwd;
  ```

  

### 5.4 其他应用

* 对象更新

  ```java
  /**
   * objectMapper.updateValue(对象更新, 对象的重写)
   * 如果后者的属性有值，则用后者，否则前者的值不变
   */
  @Test
  public void test4() throws Exception {
      User originalUser = new User();
      originalUser.setId(1L);
      originalUser.setName("王二麻子");
      originalUser.setWebsiteUrl("http://www.baidu.com");
  
      User newUser = new User();
      newUser.setId(2L);
      newUser.setWebsiteUrl("http://www.roadjava.com");
      // 让我们省去了很多判断
      User updatedUser = objectMapper.updateValue(originalUser, newUser);
      // id:2 name:乐之者; java websiteUrl:http://www.roadjava.com
      System.out.println(updatedUser);
  }
  ```

  ```perl
  User(id=2, name=王二麻子, pwd=null, addr=null, websiteUrl=http://www.roadjava.com, registerDate=null, birthDay=null)
  ```
