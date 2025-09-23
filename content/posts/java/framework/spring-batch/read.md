+++
title = 'SpringBatch 中的 I/O（数据输入）'
date = 2025-02-25T19:56:09+08:00
categories = ['java']
tags = ['java', "spring", "springboot", "springbatch"]
+++

## 3. 数据输入

### 3.1 `ItemReader` 概述

写个 MyReader

```java
import org.springframework.batch.item.ItemReader;
import org.springframework.batch.item.NonTransientResourceException;
import org.springframework.batch.item.ParseException;
import org.springframework.batch.item.UnexpectedInputException;

import java.util.Iterator;
import java.util.List;

public class MyReader implements ItemReader<String> {

    private Iterator<String> iterator;

    public MyReader(List<String> list) {
        this.iterator = list.iterator();
    }

    @Override
    public String read() throws Exception, UnexpectedInputException, ParseException, NonTransientResourceException {
        // 默认一个一个读数据
        if (iterator.hasNext()) {
            return this.iterator.next();
        } else {
            return null;
        }
    }

}
```

在 Step 使用 `reader()` 和 `writer()`

```java
import com.sb.springbatch.listener.MyJobListener;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.configuration.annotation.JobBuilderFactory;
import org.springframework.batch.core.configuration.annotation.StepBuilderFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;
import java.util.List;

@Configuration
public class ItemReaderDemo {

    @Autowired
    private JobBuilderFactory jobBuilderFactory;

    @Autowired
    private StepBuilderFactory stepBuilderFactory;

    @Bean
    public Job itemReaderDemoJob() {
        return jobBuilderFactory.get("itemReaderDemoJob")
                .start(itemReaderDemoStep())
                .listener(new MyJobListener())
                .build();
    }

    @Bean
    public Step itemReaderDemoStep() {
        return stepBuilderFactory.get("itemReaderDemoStep")
                .chunk(2) // 每读2个才处理
                .reader(itemReaderDemoRead())
                .writer(list -> {
                    for (Object item : list) {
                        System.out.println(item + "...");
                    }
                }).build();
    }

    @Bean
    public MyReader itemReaderDemoRead() {
        List<String> data = Arrays.asList("鼠", "牛", "虎", "兔");
        return new MyReader(data);
    }

}
```

console（鼠牛一批输出，虎兔一批输出）

```perl
2023-03-30 16:20:50.224  INFO 5740 --- [           main] o.s.b.c.l.support.SimpleJobLauncher      : Job: [SimpleJob: [name=itemReaderDemoJob]] launched with the following parameters: [{}]
itemReaderDemoJob>before<
2023-03-30 16:20:50.249  INFO 5740 --- [           main] o.s.batch.core.job.SimpleStepHandler     : Executing step: [itemReaderDemoStep]
鼠...
牛...
虎...
兔...
2023-03-30 16:20:50.274  INFO 5740 --- [           main] o.s.batch.core.step.AbstractStep         : Step: [itemReaderDemoStep] executed in 25ms
itemReaderDemoJob>after<
2023-03-30 16:20:50.282  INFO 5740 --- [           main] o.s.b.c.l.support.SimpleJobLauncher      : Job: [SimpleJob: [name=itemReaderDemoJob]] completed with the following parameters: [{}] and the following status: [COMPLETED] in 45ms
2023-03-30 16:20:50.286  INFO 5740 --- [ionShutdownHook] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Shutdown initiated...
2023-03-30 16:20:50.289  INFO 5740 --- [ionShutdownHook] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Shutdown completed.

Process finished with exit code 0
```



### 3.2 从数据库中读取数据

> 用 `JdbcPagingltemReader` 类

先在数据库中建个 user 表

```sql
CREATE TABLE USER (
`id` INT PRIMARY KEY AUTO_INCREMENT,
`username` VARCHAR(30),
`password` VARCHAR(20),
`age` INT
) ENGINE = INNODB CHARSET = utf8mb4 COMMENT '用户表';
```

mock 点假数据

```sql
INSERT INTO USER
( `id`, `username`, `password`, `age` )
VALUES
( 1, "lisi", "123", 23 );

INSERT INTO USER
( `username`, `password`, `age` )
VALUES
( "wangwu", "456", 21 ),
( "zhaoliu", "666", 26 ),
( "xiaohong", "777", 24 ),
( "xiaoming", "999", 27 );
```

User.java

```java
import lombok.Data;

@Data
public class User {
    private Integer id;
    private String username;
    private String password;
    private int age;
}
```

ItemReaderDbDemo.java

```java
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.configuration.annotation.EnableBatchProcessing;
import org.springframework.batch.core.configuration.annotation.JobBuilderFactory;
import org.springframework.batch.core.configuration.annotation.StepBuilderFactory;
import org.springframework.batch.core.configuration.annotation.StepScope;
import org.springframework.batch.item.ItemWriter;
import org.springframework.batch.item.database.JdbcPagingItemReader;
import org.springframework.batch.item.database.Order;
import org.springframework.batch.item.database.support.MySqlPagingQueryProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.RowMapper;

import javax.sql.DataSource;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;

@Configuration
@EnableBatchProcessing
public class ItemReaderDbDemo {

    @Autowired
    private JobBuilderFactory jobBuilderFactory;
    @Autowired
    private StepBuilderFactory stepBuilderFactory;

    @Autowired
    private DataSource dataSource;

    @Autowired
    @Qualifier("dbJdbcWriter")
    private ItemWriter<? super User> dbJdbcWriter;

    @Bean
    public Job ItemReaderDbDemoJob() {
        return jobBuilderFactory.get("itemReaderDbDemoJob")
                .start(itemReaderDbStep())
                .build();
    }

    @Bean
    public Step itemReaderDbStep() {
        return stepBuilderFactory.get("itemReaderDemoStep")
                .<User, User>chunk(2)
                .reader(dbJdbcReader())
                .writer(dbJdbcWriter)
                .build();
    }

    @Bean
    @StepScope
    public JdbcPagingItemReader<User> dbJdbcReader() {
        JdbcPagingItemReader<User> reader = new JdbcPagingItemReader<User>();
        reader.setDataSource(dataSource);
        reader.setFetchSize(2);
        // 把读取到的记录 转换成 User对象
        reader.setRowMapper(new RowMapper<User>() {
            // 结果集的映射
            @Override
            public User mapRow(ResultSet resultSet, int rowNum) throws SQLException {
                User user = new User();
                user.setId(resultSet.getInt("id"));
                user.setUsername(resultSet.getString("username"));
                user.setPassword(resultSet.getString("password"));
                user.setAge(resultSet.getInt("age"));
                return user;
            }
        });

        // 指定 sq1语句
        MySqlPagingQueryProvider provider = new MySqlPagingQueryProvider();
        provider.setSelectClause("id,username,password,age");
        provider.setFromClause("from user");
        // 指定 根据哪个字段排序
        Map<String, Order> sort = new HashMap<>(1);
        sort.put("id", Order.ASCENDING);
        provider.setSortKeys(sort);

        reader.setQueryProvider(provider);
        return reader;
    }
}
```

DbJdbcWriter.java（自定义的 ItemWriter）

```java
import org.springframework.batch.item.ItemWriter;
import org.springframework.stereotype.Component;

import java.util.List;

@Component("dbJdbcWriter")
public class DbJdbcWriter implements ItemWriter<User> {
    @Override
    public void write(List<? extends User> list) throws Exception {
        System.out.println("FUCK");
        list.forEach(System.out::println);
    }
}
```

console

```perl
2023-04-02 13:06:03.452  INFO 23480 --- [           main] o.s.b.c.l.support.SimpleJobLauncher      : Job: [SimpleJob: [name=itemReaderDbDemoJob]] launched with the following parameters: [{}]
2023-04-02 13:06:03.477  INFO 23480 --- [           main] o.s.batch.core.job.SimpleStepHandler     : Executing step: [itemReaderDemoStep]
FUCK
User(id=1, username=lisi, password=123, age=23)
User(id=2, username=wangwu, password=456, age=21)
FUCK
User(id=3, username=zhaoliu, password=666, age=26)
User(id=4, username=xiaohong, password=777, age=24)
FUCK
User(id=5, username=xiaoming, password=999, age=27)
2023-04-02 13:06:03.517  INFO 23480 --- [           main] o.s.batch.core.step.AbstractStep         : Step: [itemReaderDemoStep] executed in 40ms
2023-04-02 13:06:03.525  INFO 23480 --- [           main] o.s.b.c.l.support.SimpleJobLauncher      : Job: [SimpleJob: [name=itemReaderDbDemoJob]] completed with the following parameters: [{}] and the following status: [COMPLETED] in 60ms
2023-04-02 13:06:03.529  INFO 23480 --- [ionShutdownHook] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Shutdown initiated...
2023-04-02 13:06:03.532  INFO 23480 --- [ionShutdownHook] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Shutdown completed.
```



### 3.3 从普通文件中读取数据

> 用 `FlatFileItemReader` 类

customer.txt（/resources 下）

```
id,firstName,lastName,birthday
1,Stone,Barrett,1964-10-19 14:11:03
2,Raymond,Pace,1977-12-11 21 :44:30
3,Armando,Logan,1986-12-25 11:54:28
4,Latifah,Barnett,1959-07-24 06:00:16
5,Cassandra,Moses,1956-09-14 06:49:28
6,Audra,Hopkins,1984-08-30 04:18:10
7,Upton,Morrow,1973-82-04 05:26:05
8,Melodie,Velasquez,1953-04-26 11:16:26
9,Sybill,Nolan,1951-06-24 14:56:51
10,Glenna,Little,1953-08-27 13:15:08
11,Ingrid,Jackson,1957-09-05 21:36:47
12,Duncan,Castaneda,1979-01 21 18:31:27
13,Xaviera,Gillespie,1965-07-18 15:05:22
14,Rhoda,Lancaster,1990-09-11 15:52:54
15,Fatima,Combs,1979-06-01 06: 58: 54
```

Customer.java（提取出的实体类）

```java
import lombok.Data;

@Data
public class Customer {
    private Long id;
    private String firstName;
    private String lastName;
    private String birthday;
}
```

FileItemReaderDemo.java

```java
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.configuration.annotation.EnableBatchProcessing;
import org.springframework.batch.core.configuration.annotation.JobBuilderFactory;
import org.springframework.batch.core.configuration.annotation.StepBuilderFactory;
import org.springframework.batch.core.configuration.annotation.StepScope;
import org.springframework.batch.item.ItemWriter;
import org.springframework.batch.item.file.FlatFileItemReader;
import org.springframework.batch.item.file.mapping.DefaultLineMapper;
import org.springframework.batch.item.file.mapping.FieldSetMapper;
import org.springframework.batch.item.file.transform.DelimitedLineTokenizer;
import org.springframework.batch.item.file.transform.FieldSet;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.validation.BindException;

@Configuration
@EnableBatchProcessing
public class FileItemReaderDemo {

    @Autowired
    private JobBuilderFactory jobBuilderFactory;
    @Autowired
    private StepBuilderFactory stepBuilderFactory;

    @Autowired
    @Qualifier("fileItemWriter")
    private ItemWriter<? super Customer> fileItemWriter;

    @Bean
    public Job FileItemReaderDemo() {
        return jobBuilderFactory.get("FileItemReaderDemo")
                .start(FileItemReaderDemoStep())
                .build();
    }

    @Bean
    public Step FileItemReaderDemoStep() {
        return stepBuilderFactory.get("FileItemReaderDemoStep")
                .<Customer, Customer>chunk(5)
                .reader(fileItemReader())
                .writer(fileItemWriter)
                .build();
    }

    @Bean
    @StepScope
    public FlatFileItemReader<Customer> fileItemReader() {
        FlatFileItemReader<Customer> reader = new FlatFileItemReader<Customer>();
        reader.setResource(new ClassPathResource("customer.txt"));
        reader.setLinesToSkip(1); // 跳过第一行

        // 数据解析 使用 DelimitedLineTokenizer （这个类用 "," 作为分隔符）
        DelimitedLineTokenizer tokenizer = new DelimitedLineTokenizer();
        tokenizer.setNames(new String[]{"id","firstName","lastName","birthday"});
        // 把解析出的一个数据 映射为 Customer对象
        DefaultLineMapper<Customer> mapper = new DefaultLineMapper<>();
        mapper.setLineTokenizer(tokenizer);
        // 映射
        mapper.setFieldSetMapper(fieldSet -> {
            Customer customer = new Customer();
            customer.setId(fieldSet.readLong("id"));
            customer.setFirstName(fieldSet.readString("firstName"));
            customer.setLastName(fieldSet.readString("lastName"));
            customer.setBirthday(fieldSet.readString("birthday"));
            return customer;
        });

        mapper.afterPropertiesSet();
        reader.setLineMapper(mapper);
        return reader;
    }
}
```

FileFileItemWriter.java（自定义的 ItemWriter）

```java
import org.springframework.batch.item.ItemWriter;
import org.springframework.stereotype.Component;

import java.util.List;

@Component("fileItemWriter")
public class fileItemWriter implements ItemWriter<Customer> {
    @Override
    public void write(List<? extends Customer> list) throws Exception {
        list.forEach(System.out::println);
    }
}
```

console

```perl
2023-04-02 13:41:08.956  INFO 22752 --- [           main] o.s.b.c.l.support.SimpleJobLauncher      : Job: [SimpleJob: [name=FileItemReaderDemo]] launched with the following parameters: [{}]
2023-04-02 13:41:08.976  INFO 22752 --- [           main] o.s.batch.core.job.SimpleStepHandler     : Executing step: [FileItemReaderDemoStep]
Customer(id=1, firstName=Stone, lastName=Barrett, birthday=1964-10-19 14:11:03)
Customer(id=2, firstName=Raymond, lastName=Pace, birthday=1977-12-11 21 :44:30)
Customer(id=3, firstName=Armando, lastName=Logan, birthday=1986-12-25 11:54:28)
Customer(id=4, firstName=Latifah, lastName=Barnett, birthday=1959-07-24 06:00:16)
Customer(id=5, firstName=Cassandra, lastName=Moses, birthday=1956-09-14 06:49:28)
Customer(id=6, firstName=Audra, lastName=Hopkins, birthday=1984-08-30 04:18:10)
Customer(id=7, firstName=Upton, lastName=Morrow, birthday=1973-82-04 05:26:05)
Customer(id=8, firstName=Melodie, lastName=Velasquez, birthday=1953-04-26 11:16:26)
Customer(id=9, firstName=Sybill, lastName=Nolan, birthday=1951-06-24 14:56:51)
Customer(id=10, firstName=Glenna, lastName=Little, birthday=1953-08-27 13:15:08)
Customer(id=11, firstName=Ingrid, lastName=Jackson, birthday=1957-09-05 21:36:47)
Customer(id=12, firstName=Duncan, lastName=Castaneda, birthday=1979-01 21 18:31:27)
Customer(id=13, firstName=Xaviera, lastName=Gillespie, birthday=1965-07-18 15:05:22)
Customer(id=14, firstName=Rhoda, lastName=Lancaster, birthday=1990-09-11 15:52:54)
Customer(id=15, firstName=Fatima, lastName=Combs, birthday=1979-06-01 06: 58: 54)
2023-04-02 13:41:09.043  INFO 22752 --- [           main] o.s.batch.core.step.AbstractStep         : Step: [FileItemReaderDemoStep] executed in 66ms
2023-04-02 13:41:09.059  INFO 22752 --- [           main] o.s.b.c.l.support.SimpleJobLauncher      : Job: [SimpleJob: [name=FileItemReaderDemo]] completed with the following parameters: [{}] and the following status: [COMPLETED] in 100ms
2023-04-02 13:41:09.064  INFO 22752 --- [ionShutdownHook] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Shutdown initiated...
2023-04-02 13:41:09.068  INFO 22752 --- [ionShutdownHook] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Shutdown completed.
```



### 3.4 从 `.xml` 文件中读取数据

> 使用 `StaxEvenItemReader` 类

customer.xml（/resources 下）

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<customers>
	<customer>
		<id>1</id>
		<firstName>Mufutau</firstName>
		<lastName>Maddox</lastName>
		<birthday>2017-06-05 19:43:51PM</birthday>
	</customer>
	<customer>
		<id>2</id>
		<firstName>Brenden</firstName>
		<lastName>Cobb</lastName>
		<birthday>2017-01-06 13:18:17PM</birthday>
	</customer>
	<customer>
		<id>3</id>
		<firstName>Kerry</firstName>
		<lastName>Joseph</lastName>
		<birthday>2016-09-15 18:32:33PM</birthday>
	</customer>
	<customer>
		<id>4</id>
		<firstName>asdasd</firstName>
		<lastName>Joseph</lastName>
		<birthday>2016-09-15 18:32:33PM</birthday>
	</customer>
	<customer>
		<id>5</id>
		<firstName>JOJO5</firstName>
		<lastName>Jobana</lastName>
		<birthday>2016-09-15 18:32:33PM</birthday>
	</customer>
	<customer>
		<id>6</id>
		<firstName>XuLun</firstName>
		<lastName>JoTaiLang</lastName>
		<birthday>2046-09-15 18:32:33PM</birthday>
	</customer>
	<customer>
		<id>7</id>
		<firstName>JaiLuo</firstName>
		<lastName>JieBeiLing</lastName>
		<birthday>2077-09-15 18:32:33PM</birthday>
	</customer>
</customers>
```

pom.xml 中添加如下依赖

```xml
<!-- xml相关 -->
<dependency>
	<groupId>org.springframework</groupId>
	<artifactId>spring-oxm</artifactId>
</dependency>
<dependency>
	<groupId>com.thoughtworks.xstream</groupId>
	<artifactId>xstream</artifactId>
	<version>1.4.7</version>
</dependency>
```

Customer.java（提取出的实体类）

```java
import lombok.Data;

@Data
public class Customer {
    private Long id;
    private String firstName;
    private String lastName;
    private String birthday;
}
```

XmlItemReaderDemo.java

```java
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.configuration.annotation.EnableBatchProcessing;
import org.springframework.batch.core.configuration.annotation.JobBuilderFactory;
import org.springframework.batch.core.configuration.annotation.StepBuilderFactory;
import org.springframework.batch.core.configuration.annotation.StepScope;
import org.springframework.batch.item.ItemWriter;
import org.springframework.batch.item.xml.StaxEventItemReader;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.oxm.xstream.XStreamMarshaller;

import java.util.HashMap;
import java.util.Map;

@Configuration
@EnableBatchProcessing
public class XmlItemReaderDemo {

    @Autowired
    private JobBuilderFactory jobBuilderFactory;
    @Autowired
    private StepBuilderFactory stepBuilderFactory;

    @Autowired
    @Qualifier("xmlItemWriter")
    private ItemWriter<? super Customer> xmlItemWriter;

    @Bean
    public Job xmlItemReaderDemoJob() {
        return jobBuilderFactory.get("xmlItemReaderDemoJob")
                .start(xmlItemReaderDemoStep())
                .build();
    }

    @Bean
    public Step xmlItemReaderDemoStep() {
        return stepBuilderFactory.get("xmlItemReaderDemoStep")
                .<Customer, Customer>chunk(5)
                .reader(xmlItemReader())
                .writer(xmlItemWriter)
                .build();
    }

    @Bean
    @StepScope
    public StaxEventItemReader<Customer> xmlItemReader() {
        StaxEventItemReader<Customer> reader = new StaxEventItemReader<Customer>();
        reader.setResource(new ClassPathResource("customer.xml")); // 指定文件位置

        // 指定需要处理的根标签
        reader.setFragmentRootElementName("customer");
        // 把xml转成 对象
        XStreamMarshaller unmarshaller = new XStreamMarshaller();
        // 告诉unmarshaller 把xml转成什么类型
        Map<String, Class> map = new HashMap<>();
        map.put("customer", Customer.class);
        unmarshaller.setAliases(map);

        reader.setUnmarshaller(unmarshaller);
        return reader;
    }
}
```

XmlItemWriter.java（自定义的 ItemWriter）

```java
import org.springframework.batch.item.ItemWriter;
import org.springframework.stereotype.Component;

import java.util.List;

@Component("xmlItemWriter")
public class XmlItemWriter implements ItemWriter<Customer> {
    @Override
    public void write(List<? extends Customer> list) throws Exception {
        System.out.println("--each chunk--");
        list.forEach(System.out::println);
    }
}
```

console

```perl
2023-04-02 21:57:31.013  INFO 11360 --- [           main] o.s.b.c.l.support.SimpleJobLauncher      : Job: [SimpleJob: [name=xmlItemReaderDemoJob]] launched with the following parameters: [{}]
2023-04-02 21:57:31.026  INFO 11360 --- [           main] o.s.batch.core.job.SimpleStepHandler     : Executing step: [xmlItemReaderDemoStep]
--each chunk--
Customer(id=1, firstName=Mufutau, lastName=Maddox, birthday=2017-06-05 19:43:51PM)
Customer(id=2, firstName=Brenden, lastName=Cobb, birthday=2017-01-06 13:18:17PM)
Customer(id=3, firstName=Kerry, lastName=Joseph, birthday=2016-09-15 18:32:33PM)
Customer(id=4, firstName=asdasd, lastName=Joseph, birthday=2016-09-15 18:32:33PM)
Customer(id=5, firstName=JOJO5, lastName=Jobana, birthday=2016-09-15 18:32:33PM)
--each chunk--
Customer(id=6, firstName=XuLun, lastName=JoTaiLang, birthday=2046-09-15 18:32:33PM)
Customer(id=7, firstName=JaiLuo, lastName=JieBeiLing, birthday=2077-09-15 18:32:33PM)
2023-04-02 21:57:31.115  INFO 11360 --- [           main] o.s.batch.core.step.AbstractStep         : Step: [xmlItemReaderDemoStep] executed in 89ms
2023-04-02 21:57:31.124  INFO 11360 --- [           main] o.s.b.c.l.support.SimpleJobLauncher      : Job: [SimpleJob: [name=xmlItemReaderDemoJob]] completed with the following parameters: [{}] and the following status: [COMPLETED] in 107ms
2023-04-02 21:57:31.127  INFO 11360 --- [ionShutdownHook] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Shutdown initiated...
2023-04-02 21:57:31.130  INFO 11360 --- [ionShutdownHook] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Shutdown completed.
```



### 3.5 从多个文件中读取数据

> 使用 `MultiResourceItemReader` 类

file1.txt（/resources 下）

```plain
1,Stone, Barrett, 1964-10-19 14:11:03
2,Raymond, Pace,1977-12-11 21:44:30
3,Armando, Logan,1986-12-25 11:54:28
4,Latifah, Barnett,1959-07-24 06:00:16
5,Cassandra, Moses,1956-09-14 06:49:28
6,Audra, Hopkins,1984-08-30 04:18:10
7,Upton, Morrow,1973-02-04 05:26:05
8,Melodie, Velasquez,1953-04-26 11:16:26
9,sybill, Nolan,1951-06-24 14:56:51
10,Glenna, Little, 1953-08-27 13:15:08
```

file2.txt（/resources 下）

```
11,Ingrid, Jackson,1957-09-05 21:36:47.
12,Duncan, Castaneda,1979-01-21 18:31:27
13,Xaviera, Gillespie,1965-07-18 15:05:22
14,Rhoda, Lancaster,1990-09-11 15:52:54
15,Fatima, Combs,1979-06-01 06:58:54
16,Merri1l, Hopkins ,1990-07-02 17:36:35
17,Felicia, Vinson,1959-12-19 20:23:12
18,Hanae , Harvey, 1984-12-27 10:36:49
19,Ramona, Acosta,1962-06-23 20:03:40
20,Katelyn, Hammond ,1988-11-12 19:05:13
```

Customer.java（提取出的实体类）

```java
import lombok.Data;

@Data
public class Customer {
    private Long id;
    private String firstName;
    private String lastName;
    private String birthday;
}
```

MultiFileItemReaderDemo.java

```java
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.configuration.annotation.EnableBatchProcessing;
import org.springframework.batch.core.configuration.annotation.JobBuilderFactory;
import org.springframework.batch.core.configuration.annotation.StepBuilderFactory;
import org.springframework.batch.core.configuration.annotation.StepScope;
import org.springframework.batch.item.ItemWriter;
import org.springframework.batch.item.file.FlatFileItemReader;
import org.springframework.batch.item.file.MultiResourceItemReader;
import org.springframework.batch.item.file.mapping.DefaultLineMapper;
import org.springframework.batch.item.file.mapping.FieldSetMapper;
import org.springframework.batch.item.file.transform.DelimitedLineTokenizer;
import org.springframework.batch.item.file.transform.FieldSet;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.validation.BindException;

@Configuration
@EnableBatchProcessing
public class MultiFileItemReaderDemo {

    @Autowired
    private JobBuilderFactory jobBuilderFactory;
    @Autowired
    private StepBuilderFactory stepBuilderFactory;

    @Autowired
    @Qualifier("multiFileWriter")
    private ItemWriter<? super Customer> multiFileWriter;

    @Value("classpath:/file*.txt")
    private Resource[] fileResources;

    @Bean
    public Job multiFileItemReaderDemoJob() {
        return jobBuilderFactory.get("multiFileItemReaderDemoJob")
                .start(multiFileItemReaderDemoStep())
                .build();
    }

    @Bean
    public Step multiFileItemReaderDemoStep() {
        return stepBuilderFactory.get("multiFileItemReaderDemoStep")
                .<Customer,Customer>chunk(5)
                .reader(multiFileReader())
                .writer(multiFileWriter)
                .build();
    }

    // multiFileReader 虽说是多文件读取 但其实是逐个读取单个文件
    @Bean
    @StepScope
    public MultiResourceItemReader<Customer> multiFileReader() {
        MultiResourceItemReader <Customer> reader = new MultiResourceItemReader<>();
        reader.setDelegate(fileItemReaderDemoReader());
        reader.setResources(fileResources);
        return reader;
    }

    // 单个文件读取
    @Bean
    public FlatFileItemReader<Customer> fileItemReaderDemoReader() {
        FlatFileItemReader<Customer> reader = new FlatFileItemReader<Customer>();
        reader.setResource(new ClassPathResource("file1.txt"));

        // 数据解析
        DelimitedLineTokenizer tokenizer = new DelimitedLineTokenizer();
        tokenizer.setNames(new String[]{"id","firstName","lastName","birthday"});
        // 把解析出的一个数据映射为 Customer对象
        DefaultLineMapper<Customer> mapper = new DefaultLineMapper<>();
        mapper.setLineTokenizer(tokenizer);
        // 映射
        mapper.setFieldSetMapper(fieldSet -> {
            Customer customer = new Customer();
            customer.setId(fieldSet.readLong("id"));
            customer.setFirstName(fieldSet.readString("firstName"));
            customer.setLastName(fieldSet.readString("lastName"));
            customer.setBirthday(fieldSet.readString("birthday"));
            return customer;
        });
        mapper.afterPropertiesSet();

        reader.setLineMapper(mapper);
        return reader;
    }
}
```

MultiFileWriter.java（自定义的 ItemWriter）

```java
import org.springframework.batch.item.ItemWriter;
import org.springframework.stereotype.Component;

import java.util.List;

@Component("multiFileWriter")
public class MultiFileWriter implements ItemWriter<Customer> {
    @Override
    public void write(List<? extends Customer> list) throws Exception {
        System.out.println("--each chunk--");
        list.forEach(System.out::println);
    }
}
```

console

```perl
2023-04-02 22:37:04.224  INFO 22736 --- [           main] o.s.b.c.l.support.SimpleJobLauncher      : Job: [SimpleJob: [name=multiFileItemReaderDemoJob]] launched with the following parameters: [{}]
2023-04-02 22:37:04.237  INFO 22736 --- [           main] o.s.batch.core.job.SimpleStepHandler     : Executing step: [multiFileItemReaderDemoStep]
--each chunk--
Customer(id=1, firstName=Stone, lastName=Barrett, birthday=1964-10-19 14:11:03)
Customer(id=2, firstName=Raymond, lastName=Pace, birthday=1977-12-11 21 :44:30)
Customer(id=3, firstName=Armando, lastName=Logan, birthday=1986-12-25 11:54:28)
Customer(id=4, firstName=Latifah, lastName=Barnett, birthday=1959-07-24 06:00:16)
Customer(id=5, firstName=Cassandra, lastName=Moses, birthday=1956-09-14 06:49:28)
--each chunk--
Customer(id=6, firstName=Audra, lastName=Hopkins, birthday=1984-08-30 04:18:10)
Customer(id=7, firstName=Upton, lastName=Morrow, birthday=1973-82-04 05:26:05)
Customer(id=8, firstName=Melodie, lastName=Velasquez, birthday=1953-04-26 11:16:26)
Customer(id=9, firstName=Sybill, lastName=Nolan, birthday=1951-06-24 14:56:51)
Customer(id=10, firstName=Glenna, lastName=Little, birthday=1953-08-27 13:15:08)
--each chunk--
Customer(id=11, firstName=Ingrid, lastName=Jackson, birthday=1957-09-05 21:36:47)
Customer(id=12, firstName=Duncan, lastName=Castaneda, birthday=1979-01 21 18:31:27)
Customer(id=13, firstName=Xaviera, lastName=Gillespie, birthday=1965-07-18 15:05:22)
Customer(id=14, firstName=Rhoda, lastName=Lancaster, birthday=1990-09-11 15:52:54)
Customer(id=15, firstName=Fatima, lastName=Combs, birthday=1979-06-01 06: 58: 54)
--each chunk--
Customer(id=16, firstName=Merri1l, lastName=Hopkins, birthday=1990-07-02 17:36:35)
Customer(id=17, firstName=Felicia, lastName=Vinson, birthday=1959-12-19 20:23:12)
Customer(id=18, firstName=Hanae, lastName=Harvey, birthday=1984-12-27 10:36:49)
Customer(id=19, firstName=Ramona, lastName=Acosta, birthday=1962-06-23 20:03:40)
Customer(id=20, firstName=Katelyn, lastName=Hammond, birthday=1988-11-12 19:05:13)
2023-04-02 22:37:04.274  INFO 22736 --- [           main] o.s.batch.core.step.AbstractStep         : Step: [multiFileItemReaderDemoStep] executed in 37ms
2023-04-02 22:37:04.282  INFO 22736 --- [           main] o.s.b.c.l.support.SimpleJobLauncher      : Job: [SimpleJob: [name=multiFileItemReaderDemoJob]] completed with the following parameters: [{}] and the following status: [COMPLETED] in 53ms
2023-04-02 22:37:04.307  INFO 22736 --- [ionShutdownHook] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Shutdown initiated...
2023-04-02 22:37:04.311  INFO 22736 --- [ionShutdownHook] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Shutdown completed.
```



### 3.6 `ItemReader` 的异常处理和重启

[千锋Java教程：18.ItemReader的异常处理和重启_哔哩哔哩_bilibili](https://www.bilibili.com/video/BV1FJ411m7d5?p=18&vd_source=a70746a5c85caf677b0099914be3c8ff)

> 用 `ItemStreamReader` 取代原先的 `ItemReader` 作为 reader 的实现接口

如此一来就要实现其中的 3 个抽象方法：

- `open()` 在每个 ItemReader/ItemStream 开启之前
- `update()` 在每个 chunk 写数据之后（即每批更新之后）
- `close()` 在每个 ItemReader/ItemStream 关闭之后

![img](https://raw.githubusercontent.com/guyuechen/gallery/main/img/1680527442218-172d00bc-6ea2-47b9-92b7-ce0b6559ca0d.png)

（补充：`ItemWriter` 也有类似的扩充接口即 `ItemStreamWriter`）

restart.txt（/resources 下）※注意 Wrongname 在第 11 行

```perl
1,Stone,Barrett,1964-10-19 14:11:03
2,Raymond,Pace,1977-12-11 21 :44:30
3,Armando,Logan,1986-12-25 11:54:28
4,Latifah,Barnett,1959-07-24 06:00:16
5,Cassandra,Moses,1956-09-14 06:49:28
6,Audra,Hopkins,1984-08-30 04:18:10
7,Upton,Morrow,1973-82-04 05:26:05
8,Melodie,Velasquez,1953-04-26 11:16:26
9,Sybill,Nolan,1951-06-24 14:56:51
10,Glenna,Little,1953-08-27 13:15:08
11,Wrongname,Jackson,1957-09-05 21:36:47
12,Duncan,Castaneda,1979-01 21 18:31:27
13,Xaviera,Gillespie,1965-07-18 15:05:22
14,Rhoda,Lancaster,1990-09-11 15:52:54
15,Fatima,Combs,1979-06-01 06: 58: 54
16,Merri1l,Hopkins,1990-07-02 17:36:35
17,Felicia,Vinson,1959-12-19 20:23:12
18,Hanae,Harvey,1984-12-27 10:36:49
19,Ramona,Acosta,1962-06-23 20:03:40
20,Katelyn,Hammond,1988-11-12 19:05:13
```

Customer.java（提取出的实体类）

```java
import lombok.Data;

@Data
public class Customer {
    private Long id;
    private String firstName;
    private String lastName;
    private String birthday;
}
```

RestartReader.java

```java
import org.springframework.batch.item.*;
import org.springframework.batch.item.file.FlatFileItemReader;
import org.springframework.batch.item.file.mapping.DefaultLineMapper;
import org.springframework.batch.item.file.mapping.FieldSetMapper;
import org.springframework.batch.item.file.transform.DelimitedLineTokenizer;
import org.springframework.batch.item.file.transform.FieldSet;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.validation.BindException;

@Component("restartReader")
public class RestartReader implements ItemStreamReader<Customer> {

    private FlatFileItemReader<Customer> customerFlatFileItemReader = new FlatFileItemReader<>();
    private Long curLine = 0L;
    private boolean restart = false;
    private ExecutionContext executionContext;

    public RestartReader() {
        customerFlatFileItemReader.setResource(new ClassPathResource("restart.txt"));
        DelimitedLineTokenizer tokenizer = new DelimitedLineTokenizer();
        tokenizer.setNames(new String[]{"id","firstName","lastName","birthday"});
        DefaultLineMapper<Customer> mapper = new DefaultLineMapper<>();
        mapper.setLineTokenizer(tokenizer);
        mapper.setFieldSetMapper(new FieldSetMapper<Customer>() {
            @Override
            public Customer mapFieldSet(FieldSet fieldSet) throws BindException {
                Customer customer = new Customer();
                customer.setId(fieldSet.readLong("id"));
                customer.setFirstName(fieldSet.readString("firstName"));
                customer.setLastName(fieldSet.readString("lastName"));
                customer.setBirthday(fieldSet.readString("birthday"));
                return customer;
            }
        });

        mapper.afterPropertiesSet();
        customerFlatFileItemReader.setLineMapper(mapper);
    }

    @Override
    public Customer read() throws Exception, UnexpectedInputException, ParseException, NonTransientResourceException {
        Customer customer = null;
        this.curLine++;

        if (restart) {
            customerFlatFileItemReader.setLinesToSkip(this.curLine.intValue() - 1);
            restart = false;
            System.out.println("Start reading from line: " + this.curLine);
        }

        customerFlatFileItemReader.open(this.executionContext);
        customer = customerFlatFileItemReader.read();

        // 制造的异常: 当读到某一行的firstName是"Wrongname" 抛出一个异常
        if (customer != null && customer.getFirstName().equals("Wrongname")) {
            throw new RuntimeException("Something went wrong. Customer ID: " + customer.getId());
        }

        return customer;
    }


    @Override
    public void open(ExecutionContext executionContext) throws ItemStreamException {
        this.executionContext = executionContext;
        if (executionContext.containsKey("curLine")) {
            this.curLine = executionContext.getLong("curLine");
            this.restart = true;
        } else {
            this.curLine = 0L;
            executionContext.put("curLine", this.curLine);
            System.out.println("Start reading from line " + (this.curLine + 1));
        }
    }

    @Override
    public void update(ExecutionContext executionContext) throws ItemStreamException {
        executionContext.put("curLine", this.curLine);
        System.out.println("Up to currentLine: " + this.curLine + " were done");
    }

    @Override
    public void close() throws ItemStreamException {

    }
}
```

RestartWriter.java

```java
import org.springframework.batch.item.ItemWriter;
import org.springframework.stereotype.Component;

import java.util.List;

@Component("restartWriter")
public class RestartWriter implements ItemWriter<Customer> {
    @Override
    public void write(List<? extends Customer> list) throws Exception {
        list.forEach(System.out::println);
    }
}
```

RestartDemo.java

```java
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.configuration.annotation.EnableBatchProcessing;
import org.springframework.batch.core.configuration.annotation.JobBuilderFactory;
import org.springframework.batch.core.configuration.annotation.StepBuilderFactory;
import org.springframework.batch.item.ItemReader;
import org.springframework.batch.item.ItemWriter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableBatchProcessing
public class RestartDemo {

    @Autowired
    private JobBuilderFactory jobBuilderFactory;
    @Autowired
    private StepBuilderFactory stepBuilderFactory;

    @Autowired
    @Qualifier("restartReader")
    private ItemReader<? extends Customer> restartReader;

    @Autowired
    @Qualifier("restartWriter")
    private ItemWriter<? super Customer> restartWriter;

    @Bean
    public Job restartJob() {
        return jobBuilderFactory.get("restartJob")
                .start(restartStep())
                .build();
    }

    @Bean
    public Step restartStep() {
        return stepBuilderFactory.get("restartStep")
                .<Customer, Customer>chunk(5)
                .reader(restartReader)
                .writer(restartWriter)
                .build();
    }
}
```

控制台结果（遇到 Wrongname 即抛出异常）

```perl
2023-04-03 22:01:32.557  INFO 19784 --- [           main] o.s.b.c.l.support.SimpleJobLauncher      : Job: [SimpleJob: [name=restartJob]] launched with the following parameters: [{}]
2023-04-03 22:01:32.567  INFO 19784 --- [           main] o.s.batch.core.job.SimpleStepHandler     : Executing step: [restartStep]
Start reading from line 1
Up to currentLine: 0 were done
Customer(id=1, firstName=Stone, lastName=Barrett, birthday=1964-10-19 14:11:03)
Customer(id=2, firstName=Raymond, lastName=Pace, birthday=1977-12-11 21 :44:30)
Customer(id=3, firstName=Armando, lastName=Logan, birthday=1986-12-25 11:54:28)
Customer(id=4, firstName=Latifah, lastName=Barnett, birthday=1959-07-24 06:00:16)
Customer(id=5, firstName=Cassandra, lastName=Moses, birthday=1956-09-14 06:49:28)
Up to currentLine: 5 were done
Customer(id=6, firstName=Audra, lastName=Hopkins, birthday=1984-08-30 04:18:10)
Customer(id=7, firstName=Upton, lastName=Morrow, birthday=1973-82-04 05:26:05)
Customer(id=8, firstName=Melodie, lastName=Velasquez, birthday=1953-04-26 11:16:26)
Customer(id=9, firstName=Sybill, lastName=Nolan, birthday=1951-06-24 14:56:51)
Customer(id=10, firstName=Glenna, lastName=Little, birthday=1953-08-27 13:15:08)
Up to currentLine: 10 were done
2023-04-03 22:01:32.597 ERROR 19784 --- [           main] o.s.batch.core.step.AbstractStep         : Encountered an error executing step restartStep in job restartJob

java.lang.RuntimeException: Something went wrong. Customer ID: 11
...
2023-04-03 22:01:32.599  INFO 19784 --- [           main] o.s.batch.core.step.AbstractStep         : Step: [restartStep] executed in 31ms
2023-04-03 22:01:32.609  INFO 19784 --- [           main] o.s.b.c.l.support.SimpleJobLauncher      : Job: [SimpleJob: [name=restartJob]] completed with the following parameters: [{}] and the following status: [FAILED] in 47ms
2023-04-03 22:01:32.613  INFO 19784 --- [ionShutdownHook] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Shutdown initiated...
2023-04-03 22:01:32.616  INFO 19784 --- [ionShutdownHook] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Shutdown completed.
```

控制台结果（把问题行 Wrongname 修正之后再跑）

```perl
2023-04-03 22:05:06.084  INFO 20748 --- [           main] o.s.b.c.l.support.SimpleJobLauncher      : Job: [SimpleJob: [name=restartJob]] launched with the following parameters: [{}]
2023-04-03 22:05:06.097  INFO 20748 --- [           main] o.s.batch.core.job.SimpleStepHandler     : Executing step: [restartStep]
Up to currentLine: 10 were done
Start reading from line: 11
Customer(id=11, firstName=Gu, lastName=Jackson, birthday=1957-09-05 21:36:47)
Customer(id=12, firstName=Duncan, lastName=Castaneda, birthday=1979-01 21 18:31:27)
Customer(id=13, firstName=Xaviera, lastName=Gillespie, birthday=1965-07-18 15:05:22)
Customer(id=14, firstName=Rhoda, lastName=Lancaster, birthday=1990-09-11 15:52:54)
Customer(id=15, firstName=Fatima, lastName=Combs, birthday=1979-06-01 06: 58: 54)
Up to currentLine: 15 were done
Customer(id=16, firstName=Merri1l, lastName=Hopkins, birthday=1990-07-02 17:36:35)
Customer(id=17, firstName=Felicia, lastName=Vinson, birthday=1959-12-19 20:23:12)
Customer(id=18, firstName=Hanae, lastName=Harvey, birthday=1984-12-27 10:36:49)
Customer(id=19, firstName=Ramona, lastName=Acosta, birthday=1962-06-23 20:03:40)
Customer(id=20, firstName=Katelyn, lastName=Hammond, birthday=1988-11-12 19:05:13)
Up to currentLine: 20 were done
Up to currentLine: 21 were done
2023-04-03 22:05:06.122  INFO 20748 --- [           main] o.s.batch.core.step.AbstractStep         : Step: [restartStep] executed in 25ms
2023-04-03 22:05:06.130  INFO 20748 --- [           main] o.s.b.c.l.support.SimpleJobLauncher      : Job: [SimpleJob: [name=restartJob]] completed with the following parameters: [{}] and the following status: [COMPLETED] in 43ms
2023-04-03 22:05:06.133  INFO 20748 --- [ionShutdownHook] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Shutdown initiated...
2023-04-03 22:05:06.135  INFO 20748 --- [ionShutdownHook] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Shutdown completed.
```
