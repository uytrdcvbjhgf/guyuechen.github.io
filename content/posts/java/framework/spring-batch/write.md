+++
title = 'SpringBatch中的I/O（数据输出）'
date = 2025-02-25T20:03:01+08:00
categories = ['java']
tags = ['java', "spring", "springboot", "springbatch"]

+++

## 4. 数据输出

### 4.1 `ItemWriter` 概述

- `ItemReader`是一个数据一个数据的读
- `ItemWriter`是一批一批的输出

写个MyWriter：MyWriter.java（实现了ItemWriter接口）

```java
import org.springframework.batch.item.ItemWriter;
import org.springframework.stereotype.Component;

import java.util.List;

@Component("myWriter")
public class MyWriter implements ItemWriter<String> {
    @Override
    public void write(List<? extends String> list) throws Exception {
        // 输出一批的数量, 即chunk的size参数
        System.out.println("chunk size: " + list.size());
        list.forEach(System.out::println);
    }
}
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.configuration.annotation.EnableBatchProcessing;
import org.springframework.batch.core.configuration.annotation.JobBuilderFactory;
import org.springframework.batch.core.configuration.annotation.StepBuilderFactory;
import org.springframework.batch.item.ItemReader;
import org.springframework.batch.item.ItemWriter;
import org.springframework.batch.item.support.ListItemReader;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.ArrayList;
import java.util.List;

@Configuration
@EnableBatchProcessing
public class ItemWriterDemo {

    @Autowired
    private JobBuilderFactory jobBuilderFactory;
    @Autowired
    private StepBuilderFactory stepBuilderFactory;

    @Autowired
    @Qualifier("myWriter")
    private ItemWriter<? super String> myWriter;

    @Bean
    public Job ItemWriterDemoJob() {
        return jobBuilderFactory.get("ItemWriterDemoJob")
                .start(ItemWriterDemoStep())
                .build();
    }

    @Bean
    public Step ItemWriterDemoStep() {
        return stepBuilderFactory.get("ItemWriterDemoStep")
                .<String, String>chunk(5)
                .reader(myReader())
                .writer(myWriter).build();
    }

    @Bean
    public ItemReader<String> myReader() {
        List<String> items = new ArrayList<>();
        for (int i = 0; i < 30; i++) {
            items.add("ITEM_" + i);
        }
        return new ListItemReader<String>(items);
    }

}
```

console

```perl
2023-04-04 16:16:32.007  INFO 20320 --- [           main] o.s.b.c.l.support.SimpleJobLauncher      : Job: [SimpleJob: [name=ItemWriterDemoJob]] launched with the following parameters: [{}]
2023-04-04 16:16:32.053  INFO 20320 --- [           main] o.s.batch.core.job.SimpleStepHandler     : Executing step: [ItemWriterDemoStep]
chunk size: 5
ITEM_0
ITEM_1
ITEM_2
ITEM_3
ITEM_4
chunk size: 5
ITEM_5
ITEM_6
ITEM_7
ITEM_8
ITEM_9
chunk size: 5
ITEM_10
ITEM_11
ITEM_12
ITEM_13
ITEM_14
chunk size: 5
ITEM_15
ITEM_16
ITEM_17
ITEM_18
ITEM_19
chunk size: 5
ITEM_20
ITEM_21
ITEM_22
ITEM_23
ITEM_24
chunk size: 5
ITEM_25
ITEM_26
ITEM_27
ITEM_28
ITEM_29
2023-04-04 16:16:32.100  INFO 20320 --- [           main] o.s.batch.core.step.AbstractStep         : Step: [ItemWriterDemoStep] executed in 46ms
2023-04-04 16:16:32.110  INFO 20320 --- [           main] o.s.b.c.l.support.SimpleJobLauncher      : Job: [SimpleJob: [name=ItemWriterDemoJob]] completed with the following parameters: [{}] and the following status: [COMPLETED] in 85ms
2023-04-04 16:16:32.114  INFO 20320 --- [ionShutdownHook] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Shutdown initiated...
2023-04-04 16:16:32.119  INFO 20320 --- [ionShutdownHook] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Shutdown completed.
```



### 4.2 数据输出到数据库

针对不同的db用如下不同的类：

`Neo4jltemWriter`、`MongoltemWriter`、`RepositoryltemWriter`、`HibernateltemWriter`、`JdbcBatchltemWriter`、`JpaltemWriter`、`GemfireltemWriter`...

对于mysql，这里使用`JdbcBatchltemWriter`

先在数据库中建个customer表

```sql
CREATE TABLE customer (
`id` BIGINT PRIMARY KEY,
`firstname` VARCHAR(30),
`lastname` VARCHAR(20),
`birthday` VARCHAR(30)
) ENGINE = INNODB CHARSET = utf8mb4 COMMENT 'customer表';
```

Customer.java（提取出的实体类）

```sql
import lombok.Data;

@Data
public class Customer {
    private Long id;
    private String firstName;
    private String lastName;
    private String birthday;
}
```

FileItemReaderConfig.java（配置reader）

```java
import org.springframework.batch.item.file.FlatFileItemReader;
import org.springframework.batch.item.file.mapping.DefaultLineMapper;
import org.springframework.batch.item.file.transform.DelimitedLineTokenizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

@Configuration
public class FileItemReaderConfig {

    @Bean
    public FlatFileItemReader<Customer> fileItemReader() {
        FlatFileItemReader<Customer> reader = new FlatFileItemReader<>();
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

ItemWriterDbConfig.java（配置writer）

```java
import org.springframework.batch.item.database.BeanPropertyItemSqlParameterSourceProvider;
import org.springframework.batch.item.database.JdbcBatchItemWriter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;

@Configuration
public class ItemWriterDbConfig {
    @Autowired
    private DataSource dataSource;

    @Bean
    public JdbcBatchItemWriter<Customer> itemWriterDb() {
        JdbcBatchItemWriter<Customer> writer = new JdbcBatchItemWriter<>();
        writer.setDataSource(dataSource);
        String sql =
                "insert into customer (id,firstName,lastName,birthday) " +
                "values " +
                "(:id,:firstName,:lastName,:birthday)";
        writer.setSql(sql);
        // 将 Customer中对应属性的值 与 Sql语句中的四个值 进行替换
        writer.setItemSqlParameterSourceProvider(new BeanPropertyItemSqlParameterSourceProvider<Customer>());
        return writer;
    }
}
```

ItemWriterDbDemo.java

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
public class ItemWriterDbDemo {

    @Autowired
    private JobBuilderFactory jobBuilderFactory;
    @Autowired
    private StepBuilderFactory stepBuilderFactory;

    @Autowired
    @Qualifier("itemWriterDb")
    private ItemWriter<? super Customer> itemWriterDb;

    @Autowired
    @Qualifier("fileItemReader")
    private ItemReader<? extends Customer> fileItemReader;

    @Bean
    public Job ItemWriterDbDemoJob() {
        return jobBuilderFactory.get("ItemWriterDbDemoJob")
                .start(ItemWriterDbDemoStep())
                .build();
    }

    @Bean
    public Step ItemWriterDbDemoStep() {
        return stepBuilderFactory.get("ItemWriterDbDemoStep")
                .<Customer, Customer>chunk(5)
                .reader(fileItemReader)
                .writer(itemWriterDb)
                .build();
    }

}
```

console

```perl
2023-04-04 17:08:05.440  INFO 2668 --- [           main] o.s.b.c.l.support.SimpleJobLauncher      : Job: [SimpleJob: [name=ItemWriterDbDemoJob]] launched with the following parameters: [{}]
2023-04-04 17:08:05.455  INFO 2668 --- [           main] o.s.batch.core.job.SimpleStepHandler     : Executing step: [ItemWriterDbDemoStep]
2023-04-04 17:08:05.490  INFO 2668 --- [           main] o.s.batch.core.step.AbstractStep         : Step: [ItemWriterDbDemoStep] executed in 34ms
2023-04-04 17:08:05.498  INFO 2668 --- [           main] o.s.b.c.l.support.SimpleJobLauncher      : Job: [SimpleJob: [name=ItemWriterDbDemoJob]] completed with the following parameters: [{}] and the following status: [COMPLETED] in 54ms
2023-04-04 17:08:05.502  INFO 2668 --- [ionShutdownHook] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Shutdown initiated...
2023-04-04 17:08:05.505  INFO 2668 --- [ionShutdownHook] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Shutdown completed.
```

![img](https://raw.githubusercontent.com/guyuechen/gallery/main/img/1680599334120-cbed07ec-ee3b-4ea1-a816-f3909f87332a.png)



### 4.3 数据输出到普通文件

> 用`FlatFileltemWriter`类

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

DbJdbcReaderConfig.java（配置reader）

```java
import org.springframework.batch.item.database.JdbcPagingItemReader;
import org.springframework.batch.item.database.Order;
import org.springframework.batch.item.database.support.MySqlPagingQueryProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.RowMapper;

import javax.sql.DataSource;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;

@Configuration
public class DbJdbcReaderConfig {
    @Autowired
    private DataSource dataSource;

    @Bean
    public JdbcPagingItemReader<Customer> dbJdbcReader() {
        JdbcPagingItemReader<Customer> reader = new JdbcPagingItemReader<Customer>();
        reader.setDataSource(dataSource);
        // 设置读取缓存, 每次取5个
        reader.setFetchSize(5);
        // 把读取到的记录转换成 Customer对象
        reader.setRowMapper(new RowMapper<Customer>() {
            // 结果集的映射
            @Override
            public Customer mapRow(ResultSet resultSet, int rowNum) throws SQLException {
                Customer customer = new Customer();
                customer.setId(resultSet.getLong(1));
                customer.setFirstName(resultSet.getString(2));
                customer.setLastName(resultSet.getString(3));
                customer.setBirthday(resultSet.getString(4));
                return customer;
            }
        });
        // 指定sq1语句
        MySqlPagingQueryProvider provider = new MySqlPagingQueryProvider();
        provider.setSelectClause("id,firstName,lastName,birthday");
        provider.setFromClause("from customer");
        // 指定根据哪个字段进行排序
        Map<String, Order> sort = new HashMap<>(1);
        sort.put("id", Order.ASCENDING);
        provider.setSortKeys(sort);
        reader.setQueryProvider(provider);
        return reader;
    }
}
```

FileItemWriterConfig.java（配置writer）

```java
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.batch.item.file.FlatFileItemWriter;
import org.springframework.batch.item.file.transform.LineAggregator;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.FileSystemResource;

@Configuration
public class FileItemWriterConfig {
    @Bean
    public FlatFileItemWriter<Customer> fileItemWriter() {
        // 把Customer对象 转成 字符串 输出到文件
        FlatFileItemWriter<Customer> writer = new FlatFileItemWriter<>();
        String path = "D:\\StudyProjects/springbatch/src/main/resources/output.txt";
        writer.setResource(new FileSystemResource(path));
        // 把Customer对象 转成 字符串
        writer.setLineAggregator(new LineAggregator<Customer>() {
            ObjectMapper mapper = new ObjectMapper();
            @Override
            public String aggregate(Customer customer) {
                String str = null;
                try {
                    str = mapper.writeValueAsString(customer);
                } catch (JsonProcessingException e) {
                    e.printStackTrace();
                }
                return str;
            }
        });
        try {
            writer.afterPropertiesSet();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return writer;
    }
}
```

FileItemWriterDemo.java

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
public class FileItemWriterDemo {

    @Autowired
    private JobBuilderFactory jobBuilderFactory;
    @Autowired
    private StepBuilderFactory stepBuilderFactory;

    @Autowired
    @Qualifier("dbJdbcReader")
    private ItemReader<? extends Customer> dbJdbcReader;
    @Autowired
    @Qualifier("fileItemWriter")
    private ItemWriter<? super Customer> fileItemWriter;

    @Bean
    public Job fileItemWriterDemoJob() {
        return jobBuilderFactory.get("fileItemWriterDemoJob")
                .start(fileItemWriterDemoStep())
                .build();
    }

    @Bean
    public Step fileItemWriterDemoStep() {
        return stepBuilderFactory.get("fileItemWriterDemoStep")
                .<Customer, Customer>chunk(5)
                .reader(dbJdbcReader)
                .writer(fileItemWriter)
                .build();
    }
}
```

console

```perl
2023-04-04 18:17:59.907  INFO 2000 --- [           main] o.s.b.c.l.support.SimpleJobLauncher      : Job: [SimpleJob: [name=fileItemWriterDemoJob]] launched with the following parameters: [{}]
2023-04-04 18:17:59.924  INFO 2000 --- [           main] o.s.batch.core.job.SimpleStepHandler     : Executing step: [fileItemWriterDemoStep]
2023-04-04 18:17:59.999  INFO 2000 --- [           main] o.s.batch.core.step.AbstractStep         : Step: [fileItemWriterDemoStep] executed in 75ms
2023-04-04 18:18:00.011  INFO 2000 --- [           main] o.s.b.c.l.support.SimpleJobLauncher      : Job: [SimpleJob: [name=fileItemWriterDemoJob]] completed with the following parameters: [{}] and the following status: [COMPLETED] in 98ms
2023-04-04 18:18:00.016  INFO 2000 --- [ionShutdownHook] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Shutdown initiated...
2023-04-04 18:18:00.024  INFO 2000 --- [ionShutdownHook] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Shutdown completed.
{"id":1,"firstName":"Stone","lastName":"Barrett","birthday":"1964-10-19 14:11:03"}
{"id":2,"firstName":"Raymond","lastName":"Pace","birthday":"1977-12-11 21 :44:30"}
{"id":3,"firstName":"Armando","lastName":"Logan","birthday":"1986-12-25 11:54:28"}
{"id":4,"firstName":"Latifah","lastName":"Barnett","birthday":"1959-07-24 06:00:16"}
{"id":5,"firstName":"Cassandra","lastName":"Moses","birthday":"1956-09-14 06:49:28"}
{"id":6,"firstName":"Audra","lastName":"Hopkins","birthday":"1984-08-30 04:18:10"}
{"id":7,"firstName":"Upton","lastName":"Morrow","birthday":"1973-82-04 05:26:05"}
{"id":8,"firstName":"Melodie","lastName":"Velasquez","birthday":"1953-04-26 11:16:26"}
{"id":9,"firstName":"Sybill","lastName":"Nolan","birthday":"1951-06-24 14:56:51"}
{"id":10,"firstName":"Glenna","lastName":"Little","birthday":"1953-08-27 13:15:08"}
{"id":11,"firstName":"Ingrid","lastName":"Jackson","birthday":"1957-09-05 21:36:47"}
{"id":12,"firstName":"Duncan","lastName":"Castaneda","birthday":"1979-01 21 18:31:27"}
{"id":13,"firstName":"Xaviera","lastName":"Gillespie","birthday":"1965-07-18 15:05:22"}
{"id":14,"firstName":"Rhoda","lastName":"Lancaster","birthday":"1990-09-11 15:52:54"}
{"id":15,"firstName":"Fatima","lastName":"Combs","birthday":"1979-06-01 06: 58: 54"}
```



### 4.4 数据输出到`.xml`文件

> 使用`StaxEvenltemWriter`类

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

DbJdbcReaderConfig.java（配置reader）

```java
import org.springframework.batch.item.database.JdbcPagingItemReader;
import org.springframework.batch.item.database.Order;
import org.springframework.batch.item.database.support.MySqlPagingQueryProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.RowMapper;

import javax.sql.DataSource;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;

@Configuration
public class DbJdbcReaderConfig {
    @Autowired
    private DataSource dataSource;

    @Bean
    public JdbcPagingItemReader<Customer> dbJdbcReader() {
        JdbcPagingItemReader<Customer> reader = new JdbcPagingItemReader<>();
        reader.setDataSource(dataSource);
        // 设置读取缓存, 每次取5个
        reader.setFetchSize(5);
        // 把读取到的记录转换成 Customer对象
        reader.setRowMapper(new RowMapper<Customer>() {
            // 结果集的映射
            @Override
            public Customer mapRow(ResultSet resultSet, int rowNum) throws SQLException {
                Customer customer = new Customer();
                customer.setId(resultSet.getLong(1));
                customer.setFirstName(resultSet.getString(2));
                customer.setLastName(resultSet.getString(3));
                customer.setBirthday(resultSet.getString(4));
                return customer;
            }
        });
        // 指定sq1语句
        MySqlPagingQueryProvider provider = new MySqlPagingQueryProvider();
        provider.setSelectClause("id,firstName,lastName,birthday");
        provider.setFromClause("from customer");
        // 指定根据哪个字段进行排序
        Map<String, Order> sort = new HashMap<>(1);
        sort.put("id", Order.ASCENDING);
        provider.setSortKeys(sort);
        reader.setQueryProvider(provider);
        return reader;
    }
}
```

XmlItemWriterConfig.java（配置writer）

```java
import org.springframework.batch.item.xml.StaxEventItemWriter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.FileSystemResource;
import org.springframework.oxm.xstream.XStreamMarshaller;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class XmlItemWriterConfig {
    @Bean
    public StaxEventItemWriter<Customer> xmlItemWriter() {
        StaxEventItemWriter<Customer> writer = new StaxEventItemWriter<>();
        XStreamMarshaller marshaller = new XStreamMarshaller();
        // 告诉marshaller 把数据转成什么类型
        Map<String, Class> map = new HashMap<>();
        map.put("customer", Customer.class);
        marshaller.setAliases(map);

        writer.setRootTagName("customers");
        writer.setMarshaller(marshaller);

        String path = "D:\\StudyProjects/springbatch/src/main/resources/output.xml";
        writer.setResource(new FileSystemResource(path));
        try {
            writer.afterPropertiesSet();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return writer;
    }
}
```

XmlItemWriterDemo.java

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
public class XmlItemWriterDemo {

    @Autowired
    private JobBuilderFactory jobBuilderFactory;
    @Autowired
    private StepBuilderFactory stepBuilderFactory;

    @Autowired
    @Qualifier("dbJdbcReader")
    private ItemReader<? extends Customer> dbJdbcReader;
    @Autowired
    @Qualifier("xmlItemWriter")
    private ItemWriter<? super Customer> xmlItemWriter;

    @Bean
    public Job xmlItemWriterDemoJob() {
        return jobBuilderFactory.get("xmlItemWriterDemoJob")
                .start(xmlItemWriterDemoStep())
                .build();
    }

    @Bean
    public Step xmlItemWriterDemoStep() {
        return stepBuilderFactory.get("xmlItemWriterDemoStep")
                .<Customer, Customer>chunk(5)
                .reader(dbJdbcReader)
                .writer(xmlItemWriter)
                .build();
    }

}
```

console

```perl
2023-04-04 19:06:12.061  INFO 21004 --- [           main] o.s.b.c.l.support.SimpleJobLauncher      : Job: [SimpleJob: [name=xmlItemWriterDemoJob]] launched with the following parameters: [{}]
2023-04-04 19:06:12.085  INFO 21004 --- [           main] o.s.batch.core.job.SimpleStepHandler     : Executing step: [xmlItemWriterDemoStep]
2023-04-04 19:06:12.170  INFO 21004 --- [           main] o.s.batch.core.step.AbstractStep         : Step: [xmlItemWriterDemoStep] executed in 85ms
2023-04-04 19:06:12.178  INFO 21004 --- [           main] o.s.b.c.l.support.SimpleJobLauncher      : Job: [SimpleJob: [name=xmlItemWriterDemoJob]] completed with the following parameters: [{}] and the following status: [COMPLETED] in 104ms
2023-04-04 19:06:12.182  WARN 21004 --- [ionShutdownHook] o.s.b.f.support.DisposableBeanAdapter    : Custom destroy method 'close' on bean with name 'xmlItemWriter' threw an exception: java.lang.NullPointerException
2023-04-04 19:06:12.183  INFO 21004 --- [ionShutdownHook] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Shutdown initiated...
2023-04-04 19:06:12.186  INFO 21004 --- [ionShutdownHook] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Shutdown completed.
```

src/main/resources/output.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<customers>
    <customer>
        <id>1</id>
        <firstName>Stone</firstName>
        <lastName>Barrett</lastName>
        <birthday>1964-10-19 14:11:03</birthday>
    </customer>
    <customer>
        <id>2</id>
        <firstName>Raymond</firstName>
        <lastName>Pace</lastName>
        <birthday>1977-12-11 21 :44:30</birthday>
    </customer>
    <customer>
        <id>3</id>
        <firstName>Armando</firstName>
        <lastName>Logan</lastName>
        <birthday>1986-12-25 11:54:28</birthday>
    </customer>
    <customer>
        <id>4</id>
        <firstName>Latifah</firstName>
        <lastName>Barnett</lastName>
        <birthday>1959-07-24 06:00:16</birthday>
    </customer>
    <customer>
        <id>5</id>
        <firstName>Cassandra</firstName>
        <lastName>Moses</lastName>
        <birthday>1956-09-14 06:49:28</birthday>
    </customer>
    <customer>
        <id>6</id>
        <firstName>Audra</firstName>
        <lastName>Hopkins</lastName>
        <birthday>1984-08-30 04:18:10</birthday>
    </customer>
    <customer>
        <id>7</id>
        <firstName>Upton</firstName>
        <lastName>Morrow</lastName>
        <birthday>1973-82-04 05:26:05</birthday>
    </customer>
    <customer>
        <id>8</id>
        <firstName>Melodie</firstName>
        <lastName>Velasquez</lastName>
        <birthday>1953-04-26 11:16:26</birthday>
    </customer>
    <customer>
        <id>9</id>
        <firstName>Sybill</firstName>
        <lastName>Nolan</lastName>
        <birthday>1951-06-24 14:56:51</birthday>
    </customer>
    <customer>
        <id>10</id>
        <firstName>Glenna</firstName>
        <lastName>Little</lastName>
        <birthday>1953-08-27 13:15:08</birthday>
    </customer>
    <customer>
        <id>11</id>
        <firstName>Ingrid</firstName>
        <lastName>Jackson</lastName>
        <birthday>1957-09-05 21:36:47</birthday>
    </customer>
    <customer>
        <id>12</id>
        <firstName>Duncan</firstName>
        <lastName>Castaneda</lastName>
        <birthday>1979-01 21 18:31:27</birthday>
    </customer>
    <customer>
        <id>13</id>
        <firstName>Xaviera</firstName>
        <lastName>Gillespie</lastName>
        <birthday>1965-07-18 15:05:22</birthday>
    </customer>
    <customer>
        <id>14</id>
        <firstName>Rhoda</firstName>
        <lastName>Lancaster</lastName>
        <birthday>1990-09-11 15:52:54</birthday>
    </customer>
    <customer>
        <id>15</id>
        <firstName>Fatima</firstName>
        <lastName>Combs</lastName>
        <birthday>1979-06-01 06: 58: 54</birthday>
    </customer>
</customers>
```



### 4.5 数据输出到多个文件

> `CompositeltemWriter`类：写入多个文件

> `CassifireCompositeltemWriter`类：根据分类写入不同文件

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

DbJdbcReaderConfig.java

```java
import org.springframework.batch.item.database.JdbcPagingItemReader;
import org.springframework.batch.item.database.Order;
import org.springframework.batch.item.database.support.MySqlPagingQueryProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.RowMapper;

import javax.sql.DataSource;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;

@Configuration
public class DbJdbcReaderConfig {
    @Autowired
    private DataSource dataSource;

    @Bean
    public JdbcPagingItemReader<Customer> dbJdbcReader() {
        JdbcPagingItemReader<Customer> reader = new JdbcPagingItemReader<>();
        reader.setDataSource(dataSource);
        // 设置读取缓存, 每次取5个
        reader.setFetchSize(5);
        // 把读取到的记录转换成 Customer对象
        reader.setRowMapper(new RowMapper<Customer>() {
            // 结果集的映射
            @Override
            public Customer mapRow(ResultSet resultSet, int rowNum) throws SQLException {
                Customer customer = new Customer();
                customer.setId(resultSet.getLong(1));
                customer.setFirstName(resultSet.getString(2));
                customer.setLastName(resultSet.getString(3));
                customer.setBirthday(resultSet.getString(4));
                return customer;
            }
        });
        // 指定sq1语句
        MySqlPagingQueryProvider provider = new MySqlPagingQueryProvider();
        provider.setSelectClause("id,firstName,lastName,birthday");
        provider.setFromClause("from customer");
        // 指定根据哪个字段进行排序
        Map<String, Order> sort = new HashMap<>(1);
        sort.put("id", Order.ASCENDING);
        provider.setSortKeys(sort);
        reader.setQueryProvider(provider);
        return reader;
    }
}
```

MultiFIleWriterConfig.java（配置writer）

```java
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.batch.item.file.FlatFileItemWriter;
import org.springframework.batch.item.file.transform.LineAggregator;
import org.springframework.batch.item.support.CompositeItemWriter;
import org.springframework.batch.item.xml.StaxEventItemWriter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.FileSystemResource;
import org.springframework.oxm.xstream.XStreamMarshaller;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

@Configuration
public class MultiFIleWriterConfig {
    @Bean
    public FlatFileItemWriter<Customer> fileWriter() {
        // 把Customer对象 转成 字符串 输出到文件
        FlatFileItemWriter<Customer> writer = new FlatFileItemWriter<>();
        String path = "D:\\StudyProjects/springbatch/src/main/resources/res.txt";
        writer.setResource(new FileSystemResource(path));
        // 把Customer对象 转成 字符串
        writer.setLineAggregator(new LineAggregator<Customer>() {
            ObjectMapper mapper = new ObjectMapper();

            @Override
            public String aggregate(Customer customer) {
                String str = null;
                try {
                    str = mapper.writeValueAsString(customer);
                } catch (JsonProcessingException e) {
                    e.printStackTrace();
                }

                return str;
            }
        });
        try {
            writer.afterPropertiesSet();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return writer;
    }

    @Bean
    public StaxEventItemWriter<Customer> xmlWriter() {
        StaxEventItemWriter writer = new StaxEventItemWriter<Customer>();
        XStreamMarshaller marshaller = new XStreamMarshaller();
        // 告诉marshaller 把数据转成什么类型
        Map<String, Class> map = new HashMap<>();
        map.put("customer", Customer.class);
        marshaller.setAliases(map);

        writer.setRootTagName("customers");
        writer.setMarshaller(marshaller);

        String path = "D:\\StudyProjects/springbatch/src/main/resources/res.xml";
        writer.setResource(new FileSystemResource(path));
        try {
            writer.afterPropertiesSet();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return writer;

    }

    // (!)
    @Bean
    public CompositeItemWriter<Customer> multiFileItemWriter() {
        CompositeItemWriter<Customer> writer = new CompositeItemWriter<>();
        // 输出到 2个不同的文件中
        writer.setDelegates(Arrays.asList(fileWriter(), xmlWriter()));
        try {
            writer.afterPropertiesSet();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return writer;
    }
}
```

MultiFileItemWriterDemo.java

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
public class MultiFileItemWriterDemo {

    @Autowired
    private JobBuilderFactory jobBuilderFactory;
    @Autowired
    private StepBuilderFactory stepBuilderFactory;

    @Autowired
    @Qualifier("dbJdbcReader")
    private ItemReader<? extends Customer> dbJdbcReader;
    @Autowired
    @Qualifier("multiFileItemWriter")
    private ItemWriter<? super Customer> multiFileItemWriter;

    @Bean
    public Job multiFileItemWriterDemoJob() {
        return jobBuilderFactory.get("multiFileItemWriterDemoJob")
                .start(multiFileItemWriterDemoStep())
                .build();
    }

    @Bean
    public Step multiFileItemWriterDemoStep() {
        return stepBuilderFactory.get("multiFileItemWriterDemoStep")
                .<Customer,Customer>chunk(5)
                .reader(dbJdbcReader)
                .writer(multiFileItemWriter)
                .build();
    }

}
```

console

```perl
2023-04-04 19:27:19.186  INFO 23680 --- [           main] o.s.b.c.l.support.SimpleJobLauncher      : Job: [SimpleJob: [name=multiFileItemWriterDemoJob]] launched with the following parameters: [{}]
2023-04-04 19:27:19.196  INFO 23680 --- [           main] o.s.batch.core.job.SimpleStepHandler     : Executing step: [multiFileItemWriterDemoStep]
2023-04-04 19:27:19.290  INFO 23680 --- [           main] o.s.batch.core.step.AbstractStep         : Step: [multiFileItemWriterDemoStep] executed in 94ms
2023-04-04 19:27:19.297  INFO 23680 --- [           main] o.s.b.c.l.support.SimpleJobLauncher      : Job: [SimpleJob: [name=multiFileItemWriterDemoJob]] completed with the following parameters: [{}] and the following status: [COMPLETED] in 108ms
2023-04-04 19:27:19.300  WARN 23680 --- [ionShutdownHook] o.s.b.f.support.DisposableBeanAdapter    : Custom destroy method 'close' on bean with name 'xmlItemWriter' threw an exception: java.lang.NullPointerException
2023-04-04 19:27:19.301  WARN 23680 --- [ionShutdownHook] o.s.b.f.support.DisposableBeanAdapter    : Custom destroy method 'close' on bean with name 'multiFileItemWriter' threw an exception: java.lang.NullPointerException
2023-04-04 19:27:19.301  WARN 23680 --- [ionShutdownHook] o.s.b.f.support.DisposableBeanAdapter    : Custom destroy method 'close' on bean with name 'xmlWriter' threw an exception: java.lang.NullPointerException
2023-04-04 19:27:19.301  INFO 23680 --- [ionShutdownHook] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Shutdown initiated...
2023-04-04 19:27:19.304  INFO 23680 --- [ionShutdownHook] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Shutdown completed.
```

src/main/resources/res.txt

```
{"id":1,"firstName":"Stone","lastName":"Barrett","birthday":"1964-10-19 14:11:03"}
{"id":2,"firstName":"Raymond","lastName":"Pace","birthday":"1977-12-11 21 :44:30"}
{"id":3,"firstName":"Armando","lastName":"Logan","birthday":"1986-12-25 11:54:28"}
{"id":4,"firstName":"Latifah","lastName":"Barnett","birthday":"1959-07-24 06:00:16"}
{"id":5,"firstName":"Cassandra","lastName":"Moses","birthday":"1956-09-14 06:49:28"}
{"id":6,"firstName":"Audra","lastName":"Hopkins","birthday":"1984-08-30 04:18:10"}
{"id":7,"firstName":"Upton","lastName":"Morrow","birthday":"1973-82-04 05:26:05"}
{"id":8,"firstName":"Melodie","lastName":"Velasquez","birthday":"1953-04-26 11:16:26"}
{"id":9,"firstName":"Sybill","lastName":"Nolan","birthday":"1951-06-24 14:56:51"}
{"id":10,"firstName":"Glenna","lastName":"Little","birthday":"1953-08-27 13:15:08"}
{"id":11,"firstName":"Ingrid","lastName":"Jackson","birthday":"1957-09-05 21:36:47"}
{"id":12,"firstName":"Duncan","lastName":"Castaneda","birthday":"1979-01 21 18:31:27"}
{"id":13,"firstName":"Xaviera","lastName":"Gillespie","birthday":"1965-07-18 15:05:22"}
{"id":14,"firstName":"Rhoda","lastName":"Lancaster","birthday":"1990-09-11 15:52:54"}
{"id":15,"firstName":"Fatima","lastName":"Combs","birthday":"1979-06-01 06: 58: 54"}
```

src/main/resources/res.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<customers>
    <customer>
        <id>1</id>
        <firstName>Stone</firstName>
        <lastName>Barrett</lastName>
        <birthday>1964-10-19 14:11:03</birthday>
    </customer>
    <customer>
        <id>2</id>
        <firstName>Raymond</firstName>
        <lastName>Pace</lastName>
        <birthday>1977-12-11 21 :44:30</birthday>
    </customer>
    <customer>
        <id>3</id>
        <firstName>Armando</firstName>
        <lastName>Logan</lastName>
        <birthday>1986-12-25 11:54:28</birthday>
    </customer>
    <customer>
        <id>4</id>
        <firstName>Latifah</firstName>
        <lastName>Barnett</lastName>
        <birthday>1959-07-24 06:00:16</birthday>
    </customer>
    <customer>
        <id>5</id>
        <firstName>Cassandra</firstName>
        <lastName>Moses</lastName>
        <birthday>1956-09-14 06:49:28</birthday>
    </customer>
    <customer>
        <id>6</id>
        <firstName>Audra</firstName>
        <lastName>Hopkins</lastName>
        <birthday>1984-08-30 04:18:10</birthday>
    </customer>
    <customer>
        <id>7</id>
        <firstName>Upton</firstName>
        <lastName>Morrow</lastName>
        <birthday>1973-82-04 05:26:05</birthday>
    </customer>
    <customer>
        <id>8</id>
        <firstName>Melodie</firstName>
        <lastName>Velasquez</lastName>
        <birthday>1953-04-26 11:16:26</birthday>
    </customer>
    <customer>
        <id>9</id>
        <firstName>Sybill</firstName>
        <lastName>Nolan</lastName>
        <birthday>1951-06-24 14:56:51</birthday>
    </customer>
    <customer>
        <id>10</id>
        <firstName>Glenna</firstName>
        <lastName>Little</lastName>
        <birthday>1953-08-27 13:15:08</birthday>
    </customer>
    <customer>
        <id>11</id>
        <firstName>Ingrid</firstName>
        <lastName>Jackson</lastName>
        <birthday>1957-09-05 21:36:47</birthday>
    </customer>
    <customer>
        <id>12</id>
        <firstName>Duncan</firstName>
        <lastName>Castaneda</lastName>
        <birthday>1979-01 21 18:31:27</birthday>
    </customer>
    <customer>
        <id>13</id>
        <firstName>Xaviera</firstName>
        <lastName>Gillespie</lastName>
        <birthday>1965-07-18 15:05:22</birthday>
    </customer>
    <customer>
        <id>14</id>
        <firstName>Rhoda</firstName>
        <lastName>Lancaster</lastName>
        <birthday>1990-09-11 15:52:54</birthday>
    </customer>
    <customer>
        <id>15</id>
        <firstName>Fatima</firstName>
        <lastName>Combs</lastName>
        <birthday>1979-06-01 06: 58: 54</birthday>
    </customer>
</customers>
```

以上只是给多个文件传递数据，不分类的实现。


------

> 如果使用`CassifireCompositeltemWriter`，就可以实现根据分类写入不同文件。

在以下几处地方做下变动

MultiFIleWriterConfig.java（配置writer）

```java
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.batch.item.ItemWriter;
import org.springframework.batch.item.file.FlatFileItemWriter;
import org.springframework.batch.item.file.transform.LineAggregator;
import org.springframework.batch.item.support.ClassifierCompositeItemWriter;
import org.springframework.batch.item.support.CompositeItemWriter;
import org.springframework.batch.item.xml.StaxEventItemWriter;
import org.springframework.classify.Classifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.FileSystemResource;
import org.springframework.oxm.xstream.XStreamMarshaller;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

@Configuration
public class MultiFIleWriterConfig {
    // 1. 类似于jsonWriter
    @Bean
    public FlatFileItemWriter<Customer> fileWriter() {
        // 把Customer对象 转成 字符串 输出到文件
        FlatFileItemWriter<Customer> writer = new FlatFileItemWriter<>();
        String path = "D:\\StudyProjects/springbatch/src/main/resources/res.txt";
        writer.setResource(new FileSystemResource(path));
        // 把Customer对象 转成 字符串
        writer.setLineAggregator(new LineAggregator<Customer>() {
            ObjectMapper mapper = new ObjectMapper();

            @Override
            public String aggregate(Customer customer) {
                String str = null;
                try {
                    str = mapper.writeValueAsString(customer);
                } catch (JsonProcessingException e) {
                    e.printStackTrace();
                }

                return str;
            }
        });
        try {
            writer.afterPropertiesSet();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return writer;
    }

    // 2. xmlWriter
    @Bean
    public StaxEventItemWriter<Customer> xmlWriter() {
        StaxEventItemWriter writer = new StaxEventItemWriter<Customer>();
        XStreamMarshaller marshaller = new XStreamMarshaller();
        // 告诉marshaller 把数据转成什么类型
        Map<String, Class> map = new HashMap<>();
        map.put("customer", Customer.class);
        marshaller.setAliases(map);

        writer.setRootTagName("customers");
        writer.setMarshaller(marshaller);

        String path = "D:\\StudyProjects/springbatch/src/main/resources/res.xml";
        writer.setResource(new FileSystemResource(path));
        try {
            writer.afterPropertiesSet();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return writer;

    }

    // (!) 之前的CompositeItemWriter: 调用输出到单个文件操作 来实现输出数据到多个文件
    @Bean
    public CompositeItemWriter<Customer> multiFileItemWriter() {
        CompositeItemWriter<Customer> writer = new CompositeItemWriter<>();
        // 输出到 2个不同的文件中
        writer.setDelegates(Arrays.asList(fileWriter(), xmlWriter()));
        try {
            writer.afterPropertiesSet();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return writer;
    }

    // (!) ClassifierCompositeItemWriter: 按照某种条件对数据进行分类存储不同文件
    @Bean
    public ClassifierCompositeItemWriter<Customer> multiFileItemWriter2() {
        ClassifierCompositeItemWriter<Customer> writer = new ClassifierCompositeItemWriter<>();
        writer.setClassifier(new Classifier<Customer, ItemWriter<? super Customer>>() {
            @Override
            public ItemWriter<? super Customer> classify(Customer customer) {
                ItemWriter<Customer> itemWriter =
                        customer.getId() % 2 == 0 ? fileWriter() : xmlWriter();
                return itemWriter;
            }
        });
        return writer;
    }
}
```

MultiFileItemWriterDemo.java（注意 ! 的地方）

```java
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.configuration.annotation.EnableBatchProcessing;
import org.springframework.batch.core.configuration.annotation.JobBuilderFactory;
import org.springframework.batch.core.configuration.annotation.StepBuilderFactory;
import org.springframework.batch.item.ItemReader;
import org.springframework.batch.item.ItemStreamWriter;
import org.springframework.batch.item.ItemWriter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableBatchProcessing
public class MultiFileItemWriterDemo {

    @Autowired
    private JobBuilderFactory jobBuilderFactory;
    @Autowired
    private StepBuilderFactory stepBuilderFactory;

    @Autowired
    @Qualifier("dbJdbcReader")
    private ItemReader<? extends Customer> dbJdbcReader;
    @Autowired
    @Qualifier("multiFileItemWriter2")
    private ItemWriter<? super Customer> multiFileItemWriter; // (!)
    @Autowired
    @Qualifier("fileWriter")
    private ItemStreamWriter<? extends Customer> jsonWriter; // (!)
    @Autowired
    @Qualifier("xmlWriter")
    private ItemStreamWriter<? extends Customer> xmlWriter; // (!)

    @Bean
    public Job multiFileItemWriterDemoJob2() {
        return jobBuilderFactory.get("multiFileItemWriterDemoJob2")
                .start(multiFileItemWriterDemoStep())
                .build();
    }

    @Bean
    public Step multiFileItemWriterDemoStep() {
        return stepBuilderFactory.get("multiFileItemWriterDemoStep")
                .<Customer,Customer>chunk(5)
                .reader(dbJdbcReader)
                .writer(multiFileItemWriter)
                .stream(jsonWriter)
                .stream(xmlWriter) // (!)
                .build();
    }

}
```

console

```perl
2023-04-04 22:21:25.574  INFO 15384 --- [           main] o.s.b.c.l.support.SimpleJobLauncher      : Job: [SimpleJob: [name=multiFileItemWriterDemoJob2]] launched with the following parameters: [{}]
2023-04-04 22:21:25.584  INFO 15384 --- [           main] o.s.batch.core.job.SimpleStepHandler     : Executing step: [multiFileItemWriterDemoStep]
2023-04-04 22:21:25.679  INFO 15384 --- [           main] o.s.batch.core.step.AbstractStep         : Step: [multiFileItemWriterDemoStep] executed in 95ms
2023-04-04 22:21:25.686  INFO 15384 --- [           main] o.s.b.c.l.support.SimpleJobLauncher      : Job: [SimpleJob: [name=multiFileItemWriterDemoJob2]] completed with the following parameters: [{}] and the following status: [COMPLETED] in 109ms
2023-04-04 22:21:25.689  WARN 15384 --- [ionShutdownHook] o.s.b.f.support.DisposableBeanAdapter    : Custom destroy method 'close' on bean with name 'xmlItemWriter' threw an exception: java.lang.NullPointerException
2023-04-04 22:21:25.689  WARN 15384 --- [ionShutdownHook] o.s.b.f.support.DisposableBeanAdapter    : Custom destroy method 'close' on bean with name 'multiFileItemWriter' threw an exception: java.lang.NullPointerException
2023-04-04 22:21:25.690  WARN 15384 --- [ionShutdownHook] o.s.b.f.support.DisposableBeanAdapter    : Custom destroy method 'close' on bean with name 'xmlWriter' threw an exception: java.lang.NullPointerException
2023-04-04 22:21:25.690  INFO 15384 --- [ionShutdownHook] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Shutdown initiated...
2023-04-04 22:21:25.693  INFO 15384 --- [ionShutdownHook] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Shutdown completed.
```

src/main/resources/res.txt（仅含ID双数的）

```
{"id":2,"firstName":"Raymond","lastName":"Pace","birthday":"1977-12-11 21 :44:30"}
{"id":4,"firstName":"Latifah","lastName":"Barnett","birthday":"1959-07-24 06:00:16"}
{"id":6,"firstName":"Audra","lastName":"Hopkins","birthday":"1984-08-30 04:18:10"}
{"id":8,"firstName":"Melodie","lastName":"Velasquez","birthday":"1953-04-26 11:16:26"}
{"id":10,"firstName":"Glenna","lastName":"Little","birthday":"1953-08-27 13:15:08"}
{"id":12,"firstName":"Duncan","lastName":"Castaneda","birthday":"1979-01 21 18:31:27"}
{"id":14,"firstName":"Rhoda","lastName":"Lancaster","birthday":"1990-09-11 15:52:54"}
```

src/main/resources/res.xml（仅含ID单数的）

```xml
<?xml version="1.0" encoding="UTF-8"?>
<customers>
    <customer>
        <id>1</id>
        <firstName>Stone</firstName>
        <lastName>Barrett</lastName>
        <birthday>1964-10-19 14:11:03</birthday>
    </customer>
    <customer>
        <id>3</id>
        <firstName>Armando</firstName>
        <lastName>Logan</lastName>
        <birthday>1986-12-25 11:54:28</birthday>
    </customer>
    <customer>
        <id>5</id>
        <firstName>Cassandra</firstName>
        <lastName>Moses</lastName>
        <birthday>1956-09-14 06:49:28</birthday>
    </customer>
    <customer>
        <id>7</id>
        <firstName>Upton</firstName>
        <lastName>Morrow</lastName>
        <birthday>1973-82-04 05:26:05</birthday>
    </customer>
    <customer>
        <id>9</id>
        <firstName>Sybill</firstName>
        <lastName>Nolan</lastName>
        <birthday>1951-06-24 14:56:51</birthday>
    </customer>
    <customer>
        <id>11</id>
        <firstName>Ingrid</firstName>
        <lastName>Jackson</lastName>
        <birthday>1957-09-05 21:36:47</birthday>
    </customer>
    <customer>
        <id>13</id>
        <firstName>Xaviera</firstName>
        <lastName>Gillespie</lastName>
        <birthday>1965-07-18 15:05:22</birthday>
    </customer>
    <customer>
        <id>15</id>
        <firstName>Fatima</firstName>
        <lastName>Combs</lastName>
        <birthday>1979-06-01 06: 58: 54</birthday>
    </customer>
</customers>
```



### 4.6 `ItemProcessor` 的使用

> `ItemProcessor<I,O>` 用于处理业务逻辑，验证，过滤等功能 
> （`CompositeltemProcessor`类：处理多种`ItemProcessor`处理方式）

案例：从数据库中读取数据，然对数据进行处理，最后输出到普通文件

自定义ItemProcessor（firstName转大写）

```java
import org.springframework.batch.item.ItemProcessor;
import org.springframework.stereotype.Component;

@Component
public class FirstNameUpperProcessor implements ItemProcessor<Customer, Customer> {
    @Override
    public Customer process(Customer customer) throws Exception {
        Customer customer1 = new Customer();
        customer1.setId(customer.getId());
        customer1.setLastName(customer.getLastName());
        customer1.setFirstName(customer.getFirstName().toUpperCase());
        customer1.setBirthday(customer.getBirthday());
        return customer1;
    }
}
```

自定义ItemProcessor（过滤id为单数的）

```java
import org.springframework.batch.item.ItemProcessor;
import org.springframework.stereotype.Component;

@Component
public class IdFilterProcessor implements ItemProcessor<Customer, Customer> {
    @Override
    public Customer process(Customer customer) throws Exception {
        if (customer.getId() % 2 == 0) {
            return customer;
        } else {
            return null;
        }
    }
}
```

ItemProcessorDemo.java

```java
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.configuration.annotation.EnableBatchProcessing;
import org.springframework.batch.core.configuration.annotation.JobBuilderFactory;
import org.springframework.batch.core.configuration.annotation.StepBuilderFactory;
import org.springframework.batch.item.ItemProcessor;
import org.springframework.batch.item.ItemReader;
import org.springframework.batch.item.ItemWriter;
import org.springframework.batch.item.support.CompositeItemProcessor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.ArrayList;
import java.util.List;

@Configuration
@EnableBatchProcessing
public class ItemProcessorDemo {

    @Autowired
    private JobBuilderFactory jobBuilderFactory;
    @Autowired
    private StepBuilderFactory stepBuilderFactory;

    @Autowired
    @Qualifier("dbJdbcReader")
    private ItemReader<? extends Customer> dbJdbcReader;
    @Autowired
    @Qualifier("fileItemWriter")
    private ItemWriter<? super Customer> fileItemWriter;

    @Autowired
    private ItemProcessor<Customer, Customer> firstNameUpperProcessor;
    @Autowired
    private ItemProcessor<Customer, Customer> idFilterProcessor;

    @Bean
    public Job itemProcessorDemoJob() {
        return jobBuilderFactory.get("itemProcessorDemoJob")
                .start(itemProcessorDemoStep())
                .build();
    }

    @Bean
    public Step itemProcessorDemoStep() {
        return stepBuilderFactory.get("itemProcessorDemoStep")
                .<Customer, Customer>chunk(5)
                .reader(dbJdbcReader)
                //.processor(firstNameUpperProcessor) // 这样只能有一种处理方式
                .processor(process()) // 这样可以有多种处理方式
                .writer(fileItemWriter)
                .build();
    }

    @Bean
    public CompositeItemProcessor<Customer, Customer> process() {
        CompositeItemProcessor<Customer, Customer> processor = new CompositeItemProcessor<Customer, Customer>();
        List<ItemProcessor<Customer, Customer>> delegates = new ArrayList<>();
        delegates.add(firstNameUpperProcessor);
        delegates.add(idFilterProcessor);
        processor.setDelegates(delegates);
        return processor;
    }

}
```

console

```perl
2023-04-05 20:41:35.087  INFO 19504 --- [           main] o.s.b.c.l.support.SimpleJobLauncher      : Job: [SimpleJob: [name=itemProcessorDemoJob]] launched with the following parameters: [{}]
2023-04-05 20:41:35.148  INFO 19504 --- [           main] o.s.batch.core.job.SimpleStepHandler     : Executing step: [itemProcessorDemoStep]
2023-04-05 20:41:35.237  INFO 19504 --- [           main] o.s.batch.core.step.AbstractStep         : Step: [itemProcessorDemoStep] executed in 89ms
2023-04-05 20:41:35.250  INFO 19504 --- [           main] o.s.b.c.l.support.SimpleJobLauncher      : Job: [SimpleJob: [name=itemProcessorDemoJob]] completed with the following parameters: [{}] and the following status: [COMPLETED] in 141ms
2023-04-05 20:41:35.256  INFO 19504 --- [ionShutdownHook] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Shutdown initiated...
2023-04-05 20:41:35.261  INFO 19504 --- [ionShutdownHook] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Shutdown completed.
```

src/main/resources/output.txt

```
{"id":2,"firstName":"RAYMOND","lastName":"Pace","birthday":"1977-12-11 21 :44:30"}
{"id":4,"firstName":"LATIFAH","lastName":"Barnett","birthday":"1959-07-24 06:00:16"}
{"id":6,"firstName":"AUDRA","lastName":"Hopkins","birthday":"1984-08-30 04:18:10"}
{"id":8,"firstName":"MELODIE","lastName":"Velasquez","birthday":"1953-04-26 11:16:26"}
{"id":10,"firstName":"GLENNA","lastName":"Little","birthday":"1953-08-27 13:15:08"}
{"id":12,"firstName":"DUNCAN","lastName":"Castaneda","birthday":"1979-01 21 18:31:27"}
{"id":14,"firstName":"RHODA","lastName":"Lancaster","birthday":"1990-09-11 15:52:54"}
```
