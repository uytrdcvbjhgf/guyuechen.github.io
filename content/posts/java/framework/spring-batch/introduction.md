+++
title = 'SpringBatch简介'
date = 2025-02-25T19:34:24+08:00
categories = ['java']
tags = ['java', "spring", "springboot", "springbatch"]
+++

## 1. 简介

Spring Batch是一个基于Spring框架的批处理框架，它提供了一组完整的API和工具，用于处理大量数据操作，例如读取、处理和写入数据。Spring Batch具有高度可扩展性，允许处理从小型到大型、复杂的批处理作业。

- Spring Batch支持各种各样的数据源，例如文件、数据库、JMS等，它还提供了一组丰富的工具和组件，用于处理各种批处理场景，例如异常处理、分片处理、事务管理、并发处理等。
- 此外，Spring Batch还提供了作业调度和监控等功能，使得管理和运行批处理作业变得更加方便。

Spring Batch是一个开源框架，非常适合处理数据量大、处理逻辑复杂的批处理任务。
它的灵活性和可扩展性使得它成为企业级应用程序中常用的批处理框架之一。

Spring Batch是一个批处理**应用框架**，**不是调度框架**，但需要和调度框架合作来构建完成的批处理任务。它只关注批处理任务相关的问题，如事务、并发、监控、执行等。并不提供相应的调度功能。如果需要使用调用框架，在商业开源软件中已经有很多优秀的企业级调度框架（如Quartz、Tivoli、Control-M、Cron等）可以使用。

> Gitee 代码仓（后文例子）

https://gitee.com/gu-yuechen/spring-batch-study



### 1.1 学习资源与概述

对于 Spring Batch 的学习资料，[Spring的官方文档](https://docs.spring.io/spring-batch/docs/current/api/) 是最好的起点。

此外，还有一些在线课程可以帮助您深入了解 Spring Batch，例如在 Udemy 和 Coursera 上都有一些优秀的 Spring Batch 在线课程，您可以选择其中的一门或多门课程学习。

无论您选择哪种学习方式，建议您通过实践来巩固所学知识。编写一些简单的 Spring Batch 作业，并尝试在其中使用 Spring Batch 的各种功能。

言归正传，Spring Batch 这个框架主要有以下功能：

- Transaction management (事务管理) 
- Chunk based processing (基于块的处理) 
- Declarative I/O (声明式的输入输出) 
- Start/Stop/Restart (启动/停止/再启动) 
- Retry/Skip (重试/跳过)

![image-20250225194609740](https://raw.githubusercontent.com/guyuechen/gallery/main/img/202502251946862.png)

该框架一共有**4个主要角色**：

- **JobLauncher** 是任务启动器，通过它来启动任务，可以看做是程序的入口。
- **Job** 代表着一个具体的任务。
- **Step** 代表着一个具体的步骤，一个Job可以包含多个Step (想象把大象放进冰箱这个任务需要多少个步骤) 
- **JobRepository** 是存储数据的地方，**可以看做是一个数据库的接口**，在任务执行的时候需要通过它来记录任务状态等等信息。



### 1.2 搭建 SpringBatch 项目

> https://start.spring.io/

![img](https://raw.githubusercontent.com/guyuechen/gallery/main/img/1679996881167-f18e59e0-becb-43a3-bc4d-cd99c12b216e.png)

pom.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
	<modelVersion>4.0.0</modelVersion>
	<parent>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-starter-parent</artifactId>
		<version>2.7.10</version>
		<relativePath/> <!-- lookup parent from repository -->
	</parent>
	<groupId>com.sb</groupId>
	<artifactId>springbatch</artifactId>
	<version>0.0.1-SNAPSHOT</version>
	<name>springbatch</name>
	<description>Demo project for Spring Batch</description>
	<properties>
		<java.version>1.8</java.version>
	</properties>
	<dependencies>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-batch</artifactId>
		</dependency>

		<!-- 给定一个数据库的依赖, 不然项目会无法成功启动 -->
		<dependency>
			<groupId>com.h2database</groupId>
			<artifactId>h2</artifactId>
			<scope>runtime</scope>
		</dependency>

		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-test</artifactId>
			<scope>test</scope>
		</dependency>
		<dependency>
			<groupId>org.springframework.batch</groupId>
			<artifactId>spring-batch-test</artifactId>
			<scope>test</scope>
		</dependency>
	</dependencies>

	<build>
		<plugins>
			<plugin>
				<groupId>org.springframework.boot</groupId>
				<artifactId>spring-boot-maven-plugin</artifactId>
			</plugin>
		</plugins>
	</build>

</project>
```



### 1.3 SpringBatch 入门级程序

JobConfiguration.java

```java
package com.sb.springbatch.config;

import org.springframework.batch.core.*;
import org.springframework.batch.repeat.RepeatStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableBatchProcessing
public class JobConfiguration {

    // 注入 创建任务对象的 对象
    @Autowired
    private JobBuilderFactory jobBuilderFactory;

    // 注入 创建Step对象的 对象 (任务的执行由若干Step组成)
    @Autowired
    private StepBuilderFactory stepBuilderFactory;

    // 创建 任务对象
    @Bean
    public Job helloWorldJob() {
        return jobBuilderFactory.get("helloWorldJob")
                .start(step1())
                .next(step2())
                .build();
    }

    // Step#1
    @Bean
    public Step step1() {
        return stepBuilderFactory.get("step1")
                .tasklet(new Tasklet() {
                    @Override
                    public RepeatStatus execute(StepContribution stepContribution, ChunkContext chunkContext) throws Exception {
                        System.out.println("Hello World!");
                        return RepeatStatus.FINISHED;
                    }
                }).build();
    }

    // Step#2
    @Bean
    public Step step2() {
        return stepBuilderFactory.get("step2")
                .tasklet(new Tasklet() {
                    @Override
                    public RepeatStatus execute(StepContribution stepContribution, ChunkContext chunkContext) throws Exception {
                        System.out.println("My first job!");
                        return RepeatStatus.FINISHED;
                    }
                }).build();
    }
}
```



### 1.4 DB 替换为 MySQL

pom.xml

```xml
<!-- 给定一个数据库的依赖, 不然项目会无法成功启动 -->
<!--
<dependency>
	<groupId>com.h2database</groupId>
	<artifactId>h2</artifactId>
	<scope>runtime</scope>
</dependency>
-->

<dependency>
	<groupId>mysql</groupId>
	<artifactId>mysql-connector-java</artifactId>
	<version>8.0.17</version>
</dependency>

<dependency>
	<groupId>org.springframework.boot</groupId>
	<artifactId>spring-boot-starter-jdbc</artifactId>
	<version>2.6.3</version>
</dependency>
```

application.properties

```properties
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.datasource.url=jdbc:mysql://localhost:3306/springbatch?serverTimezone=UTC&characterEncoding=utf8&useUnicode=true&useSSL=true
spring.datasource.username=root
spring.datasource.password=1234

spring.sql.init.schema-locations=classpath:/org/springframework/batch/core/schema-mysql.sql
spring.batch.jdbc.initialize-schema=always
```

再次启动刚才的任务后，会发现我们在mysql中建的库springbatch中多了很多张表，如下：

![img](https://raw.githubusercontent.com/guyuechen/gallery/main/img/1680014419027-21c3094e-1e2c-482f-b9d6-812a075d3a4e.png)
![img](https://raw.githubusercontent.com/guyuechen/gallery/main/img/1680014793410-50302ce3-84cb-4cc4-9d83-172981bd3430.png)



### 1.5 核心 API 介绍

![image-20250225194814909](https://raw.githubusercontent.com/guyuechen/gallery/main/img/202502251948989.png)



#### `JobInstance` 

该概念与`Job`的关系和 Java 中实例和类的关系一样。
`Job`定义了一个工作流程，`JobInstance`就是该工作流程的一个具体实例。
一个`Job`可以有多个`JobInstance`。
多个`JobInstance`的区别其实就是下述`JobParameters`的不同导致的。

#### `JobParameters `

是组可以贯穿整`Job`的运行时配置参数。
不同的配置将产生不同的`JobInstance`。
如果你是使用相同的`JobParameters`运行同一个`Job`，那么这次运行会重用上次的参数。

#### `JobExecution `

该概念表示`JobInstance`的一次运行。 
`JobInstance`运行时可能会成功或者失败。
每次`JobInstance`的运行都会产生 1个`JobExecution`。（即便每次的参数都一样）

![img](https://raw.githubusercontent.com/guyuechen/gallery/main/img/1680057296693-dab38cc7-ff8d-4952-936d-0893610d8f21.png)

#### `StepExecution` 

类似于`JobExecution`，该对象表示`Step`的运行。
`Step`是`Job`的一部分，因此一个`StepExecution`会关联到一个`JobExecution`。
另外，该对象还会存储如下`Step`运行相关的所有信息。

![img](https://raw.githubusercontent.com/guyuechen/gallery/main/img/1680057534057-292bb6b7-46ef-49bf-ab96-39b9b669a751.png)

#### `ExecutionContext` 

即上下文，有`JobExecutionContext`和`StepExecutionContext`两种分别对应前面的Job/Step。
从前面的`JobExecution`、`StepExecution`的属性介绍中已经提到该概念。
说穿了，该概念就是指一个容器。（类似于 Spring 中的 ApplicationContext）
该容器由 Batch框架 控制，框架会对该容器持久化。
开发者可以使用该容器保存一些信息，以支持在整个`Job`或`Step`中共享这些数据。（依赖注入）