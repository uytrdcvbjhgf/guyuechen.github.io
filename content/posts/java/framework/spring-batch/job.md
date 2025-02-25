+++
title = 'SpringBatch中的作业流'
date = 2025-02-25T19:50:55+08:00
categories = ['java']
tags = ['java', "spring", "springboot", "springbatch"]
+++

## 2. 作业流

### 2.1 Job 的创建和使用

`Job`：批处理中的核心概念，是 Batch操作的基础单元。每个`Job`有1个或多个`Step`。

```java
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.StepContribution;
import org.springframework.batch.core.configuration.annotation.EnableBatchProcessing;
import org.springframework.batch.core.configuration.annotation.JobBuilderFactory;
import org.springframework.batch.core.configuration.annotation.StepBuilderFactory;
import org.springframework.batch.core.scope.context.ChunkContext;
import org.springframework.batch.core.step.tasklet.Tasklet;
import org.springframework.batch.repeat.RepeatStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableBatchProcessing
public class JobDemo {

    @Autowired
    private JobBuilderFactory jobBuilderFactory;

    @Autowired
    private StepBuilderFactory stepBuilderFactory;

    @Bean
    public Job jobDemoJob() {
        return jobBuilderFactory.get("jobDemoJob")
                .start(step1())
                .on("COMPLETED").to(step2())
                .from(step2()).on("COMPLETED").to(step3()) // fail(), stopAndRestart(step1())
                .from(step3()).end()
                .build();
    }

    @Bean
    public Step step1() {
        return stepBuilderFactory.get("step1")
                .tasklet(new Tasklet() {
                    @Override
                    public RepeatStatus execute(StepContribution stepContribution, ChunkContext chunkContext) throws Exception {
                        System.out.println("My second job!");
                        return RepeatStatus.FINISHED;
                    }
                }).build();
    }

    @Bean
    public Step step2() {
        return stepBuilderFactory.get("step2")
                .tasklet(new Tasklet() {
                    @Override
                    public RepeatStatus execute(StepContribution stepContribution, ChunkContext chunkContext) throws Exception {
                        System.out.println("This is step#2");
                        return RepeatStatus.FINISHED;
                    }
                }).build();
    }

    @Bean
    public Step step3() {
        return stepBuilderFactory.get("step3")
                .tasklet(new Tasklet() {
                    @Override
                    public RepeatStatus execute(StepContribution stepContribution, ChunkContext chunkContext) throws Exception {
                        System.out.println("This is step#3, the last one");
                        return RepeatStatus.FINISHED;
                    }
                }).build();
    }
}
```



### 2.2 Flow 的创建和使用

1. `Flow`是多个`Step`的集合
2. 可以被多个`Job`复用
3. 使用`FlowBuilder`来创建

```java
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.StepContribution;
import org.springframework.batch.core.configuration.annotation.EnableBatchProcessing;
import org.springframework.batch.core.configuration.annotation.JobBuilderFactory;
import org.springframework.batch.core.configuration.annotation.StepBuilderFactory;
import org.springframework.batch.core.job.builder.FlowBuilder;
import org.springframework.batch.core.job.flow.Flow;
import org.springframework.batch.core.scope.context.ChunkContext;
import org.springframework.batch.core.step.tasklet.Tasklet;
import org.springframework.batch.repeat.RepeatStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableBatchProcessing
public class JobDemo {

    @Autowired
    private JobBuilderFactory jobBuilderFactory;

    @Autowired
    private StepBuilderFactory stepBuilderFactory;

    @Bean
    public Job jobDemoJob() {
        return jobBuilderFactory.get("jobDemoJob")
                .start(step1())
                .on("COMPLETED").to(step2())
                .from(step2()).on("COMPLETED").to(step3()) // fail(), stopAndRestart(step1())
                .from(step3()).end()
                .build();
    }

    @Bean
    public Step step1() {
        return stepBuilderFactory.get("step1")
                .tasklet(new Tasklet() {
                    @Override
                    public RepeatStatus execute(StepContribution stepContribution, ChunkContext chunkContext) throws Exception {
                        System.out.println("My second job!");
                        return RepeatStatus.FINISHED;
                    }
                }).build();
    }

    @Bean
    public Step step2() {
        return stepBuilderFactory.get("step2")
                .tasklet(new Tasklet() {
                    @Override
                    public RepeatStatus execute(StepContribution stepContribution, ChunkContext chunkContext) throws Exception {
                        System.out.println("This is step#2");
                        return RepeatStatus.FINISHED;
                    }
                }).build();
    }

    @Bean
    public Step step3() {
        return stepBuilderFactory.get("step3")
                .tasklet(new Tasklet() {
                    @Override
                    public RepeatStatus execute(StepContribution stepContribution, ChunkContext chunkContext) throws Exception {
                        System.out.println("This is step#3, the last one");
                        return RepeatStatus.FINISHED;
                    }
                }).build();
    }
}
```



### 2.3 split 实现并发执行

实现任务中的多个step或多个flow并发执行，案例步骤如下：

1. 创建若干个step
2. 创建2个flow
3. 创建1个任务包含以上2个flow，并让这2个flow并发执行

```java
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.StepContribution;
import org.springframework.batch.core.configuration.annotation.EnableBatchProcessing;
import org.springframework.batch.core.configuration.annotation.JobBuilderFactory;
import org.springframework.batch.core.configuration.annotation.StepBuilderFactory;
import org.springframework.batch.core.job.builder.FlowBuilder;
import org.springframework.batch.core.job.flow.Flow;
import org.springframework.batch.core.scope.context.ChunkContext;
import org.springframework.batch.core.step.tasklet.Tasklet;
import org.springframework.batch.repeat.RepeatStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.task.SimpleAsyncTaskExecutor;

@Configuration
@EnableBatchProcessing
public class FlowDemo {

    @Autowired
    private JobBuilderFactory jobBuilderFactory;

    @Autowired
    private StepBuilderFactory stepBuilderFactory;

    @Bean
    public Step flowDemoStep1() {
        return stepBuilderFactory.get("flowDemoStep1")
                .tasklet(new Tasklet() {
                    @Override
                    public RepeatStatus execute(StepContribution stepContribution, ChunkContext chunkContext) throws Exception {
                        System.out.println("My third job!");
                        return RepeatStatus.FINISHED;
                    }
                }).build();
    }

    @Bean
    public Step flowDemoStep2() {
        return stepBuilderFactory.get("flowDemoStep2")
                .tasklet(new Tasklet() {
                    @Override
                    public RepeatStatus execute(StepContribution stepContribution, ChunkContext chunkContext) throws Exception {
                        System.out.println("This is step#2");
                        return RepeatStatus.FINISHED;
                    }
                }).build();
    }

    @Bean
    public Step flowDemoStep3() {
        return stepBuilderFactory.get("flowDemoStep3")
                .tasklet(new Tasklet() {
                    @Override
                    public RepeatStatus execute(StepContribution stepContribution, ChunkContext chunkContext) throws Exception {
                        System.out.println("This is step#3, the last step");
                        return RepeatStatus.FINISHED;
                    }
                }).build();
    }

    // 创建 Flow对象
    @Bean
    public Flow flowDemoFlow() {
        return new FlowBuilder<Flow>("flowDemoFlow")
                .start(flowDemoStep1())
                .next(flowDemoStep2())
                .build();
    }

    // 创建 Job对象
    @Bean
    public Job flowDemoJob() {
        return jobBuilderFactory.get("flowDemoJob")
                .start(flowDemoFlow())
                .next(flowDemoStep3())
                .end()
                .build();
    }
    
}
```

![img](https://raw.githubusercontent.com/guyuechen/gallery/main/img/1680085846897-41a96d28-1d7c-4359-a812-a754ec7e6486.png)



### 2.4 决策器 的使用

接口：`JobExecutionDecider`

```java
import org.springframework.batch.core.JobExecution;
import org.springframework.batch.core.StepExecution;
import org.springframework.batch.core.job.flow.FlowExecutionStatus;
import org.springframework.batch.core.job.flow.JobExecutionDecider;

// 自定义的 决策器
public class MyDecider implements JobExecutionDecider {

    private int count; // 计数器, 初始为 0

    @Override
    public FlowExecutionStatus decide(JobExecution jobExecution, StepExecution stepExecution) {
        count++;
        if (count % 2 == 0) {
            return new FlowExecutionStatus("EVEN偶数");
        } else {
            return new FlowExecutionStatus("ODD奇数");
        }
    }
}
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.StepContribution;
import org.springframework.batch.core.configuration.annotation.EnableBatchProcessing;
import org.springframework.batch.core.configuration.annotation.JobBuilderFactory;
import org.springframework.batch.core.configuration.annotation.StepBuilderFactory;
import org.springframework.batch.core.job.flow.JobExecutionDecider;
import org.springframework.batch.core.scope.context.ChunkContext;
import org.springframework.batch.core.step.tasklet.Tasklet;
import org.springframework.batch.repeat.RepeatStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableBatchProcessing
public class DeciderDemo {

    @Autowired
    private JobBuilderFactory jobBuilderFactory;

    @Autowired
    private StepBuilderFactory stepBuilderFactory;

    @Bean
    public Step deciderDemoStep1() {
        return stepBuilderFactory.get("deciderDemoStep1")
                .tasklet(new Tasklet() {
                    @Override
                    public RepeatStatus execute(StepContribution stepContribution, ChunkContext chunkContext) throws Exception {
                        System.out.println("This is step#1!");
                        return RepeatStatus.FINISHED;
                    }
                }).build();
    }

    @Bean
    public Step deciderDemoStep2() {
        return stepBuilderFactory.get("deciderDemoStep2")
                .tasklet(new Tasklet() {
                    @Override
                    public RepeatStatus execute(StepContribution stepContribution, ChunkContext chunkContext) throws Exception {
                        System.out.println("This is step#2");
                        return RepeatStatus.FINISHED;
                    }
                }).build();
    }

    @Bean
    public Step deciderDemoStep3() {
        return stepBuilderFactory.get("deciderDemoStep3")
                .tasklet(new Tasklet() {
                    @Override
                    public RepeatStatus execute(StepContribution stepContribution, ChunkContext chunkContext) throws Exception {
                        System.out.println("This is step#3");
                        return RepeatStatus.FINISHED;
                    }
                }).build();
    }

    // 把自定义的 MyDecider 注册到容器中
    @Bean
    public JobExecutionDecider myDecider(){
        return new MyDecider();
    }

    // 创建任务: 会按照 step#1 -> myDecider -> step#3 -> myDecider -> step#2 的顺序执行
    @Bean
    public Job deciderDemoJob(){
        return jobBuilderFactory.get("deciderDemoJob")
                .start(deciderDemoStep1())
                .next(myDecider())
                .from(myDecider()).on("EVEN偶数").to(deciderDemoStep2())
                .from(myDecider()).on("ODD奇数").to(deciderDemoStep3())
                .from(deciderDemoStep3()).on("*").to(myDecider()) // 无论返回什么都回到决策器 ↑next(myDecider())
                .end()
                .build();
    }

}
```



### 2.5 Job 的嵌套

一个Job可以嵌套在另一个Job中。
被嵌赛的Job称为子Job，外部Job称为父Jb。
子job不能单独执行， 需要由父Job来启动。

Tips：
`@EnableBatchProcessing`可以放在主启动类上，节省了单个配置类上方使用该注解的重复操作。

```java
import org.springframework.batch.core.configuration.annotation.EnableBatchProcessing;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@EnableBatchProcessing
public class SpringbatchApplication {
	public static void main(String[] args) {
		SpringApplication.run(SpringbatchApplication.class, args);
	}
}
```

案例：创建一对父子Job

```java
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.StepContribution;
import org.springframework.batch.core.configuration.annotation.JobBuilderFactory;
import org.springframework.batch.core.configuration.annotation.StepBuilderFactory;
import org.springframework.batch.core.scope.context.ChunkContext;
import org.springframework.batch.core.step.tasklet.Tasklet;
import org.springframework.batch.repeat.RepeatStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ChildJobOne {

    @Autowired
    private JobBuilderFactory jobBuilderFactory;

    @Autowired
    private StepBuilderFactory stepBuilderFactory;

    @Bean
    public Step childJob1Step1() {
        return stepBuilderFactory.get("childJob1Step1")
                .tasklet(new Tasklet() {
                    @Override
                    public RepeatStatus execute(StepContribution stepContribution, ChunkContext chunkContext) throws Exception {
                        System.out.println("This is step#1 in Job#1!");
                        return RepeatStatus.FINISHED;
                    }
                }).build();
    }

    @Bean
    public Job childJob1() {
        return jobBuilderFactory.get("childJob1")
                .start(childJob1Step1())
                .build();
    }
}
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.StepContribution;
import org.springframework.batch.core.configuration.annotation.JobBuilderFactory;
import org.springframework.batch.core.configuration.annotation.StepBuilderFactory;
import org.springframework.batch.core.scope.context.ChunkContext;
import org.springframework.batch.core.step.tasklet.Tasklet;
import org.springframework.batch.repeat.RepeatStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ChildJobTwo {

    @Autowired
    private JobBuilderFactory jobBuilderFactory;

    @Autowired
    private StepBuilderFactory stepBuilderFactory;

    @Bean
    public Step childJob2Step1() {
        return stepBuilderFactory.get("childJob2Step1")
                .tasklet(new Tasklet() {
                    @Override
                    public RepeatStatus execute(StepContribution stepContribution, ChunkContext chunkContext) throws Exception {
                        System.out.println("This is step#1 in Job#2!");
                        return RepeatStatus.FINISHED;
                    }
                }).build();
    }

    @Bean
    public Step childJob2Step2() {
        return stepBuilderFactory.get("childJob2Step2")
                .tasklet(new Tasklet() {
                    @Override
                    public RepeatStatus execute(StepContribution stepContribution, ChunkContext chunkContext) throws Exception {
                        System.out.println("This is step#2 in Job#2!");
                        return RepeatStatus.FINISHED;
                    }
                }).build();
    }

    @Bean
    public Job childJob2() {
        return jobBuilderFactory.get("childJob2")
                .start(childJob2Step1())
                .next(childJob2Step2())
                .build();
    }

}
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.configuration.annotation.JobBuilderFactory;
import org.springframework.batch.core.configuration.annotation.StepBuilderFactory;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.step.builder.JobStepBuilder;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.PlatformTransactionManager;

@Configuration
public class NestedDemo {

    @Autowired
    private JobBuilderFactory jobBuilderFactory;
    @Autowired
    private StepBuilderFactory stepBuilderFactory;

    @Autowired
    private Job childJob1;
    @Autowired
    private Job childJob2;

    @Autowired
    private JobLauncher launcher;

    @Bean
    public Job parentJob(JobRepository jobRepository, PlatformTransactionManager transactionManager){
        return jobBuilderFactory.get("parentJob")
                .start(jobStep1(jobRepository, transactionManager))
                .next(jobStep2(jobRepository, transactionManager))
                .build();
    }

    // 返回的是 Job类型的 Step (特殊的Step)
    private Step jobStep1(JobRepository jobRepository, PlatformTransactionManager transactionManager) {
        return new JobStepBuilder(new StepBuilder("jobStep1"))
                .job(childJob1)
                .launcher(launcher) // 使用 启动父Job的 启动对象
                .repository(jobRepository)
                .transactionManager(transactionManager)
                .build();
    }

    private Step jobStep2(JobRepository jobRepository, PlatformTransactionManager transactionManager) {
        return new JobStepBuilder(new StepBuilder("jobStep2"))
                .job(childJob2)
                .launcher(launcher) // 使用 启动父Job的 启动对象
                .repository(jobRepository)
                .transactionManager(transactionManager)
                .build();
    }

}
```

console

```perl
spring.batch.job.names=parentJob
2023-03-29 21:32:46.530  INFO 15588 --- [           main] o.s.batch.core.job.SimpleStepHandler     : Executing step: [childJob1Step1]
This is step#1 in Job#1!
2023-03-29 21:32:46.547  INFO 15588 --- [           main] o.s.batch.core.step.AbstractStep         : Step: [childJob1Step1] executed in 16ms
2023-03-29 21:32:46.556  INFO 15588 --- [           main] o.s.b.c.l.support.SimpleJobLauncher      : Job: [SimpleJob: [name=childJob1]] completed with the following parameters: [{}] and the following status: [COMPLETED] in 32ms
2023-03-29 21:32:46.583  INFO 15588 --- [           main] o.s.batch.core.step.AbstractStep         : Step: [jobStep1] executed in 77ms
2023-03-29 21:32:46.597  INFO 15588 --- [           main] o.s.batch.core.job.SimpleStepHandler     : Executing step: [jobStep2]
2023-03-29 21:32:46.611  INFO 15588 --- [           main] o.s.b.c.l.support.SimpleJobLauncher      : Job: [SimpleJob: [name=childJob2]] launched with the following parameters: [{}]
2023-03-29 21:32:46.622  INFO 15588 --- [           main] o.s.batch.core.job.SimpleStepHandler     : Executing step: [childJob2Step1]
This is step#1 in Job#2!
2023-03-29 21:32:46.632  INFO 15588 --- [           main] o.s.batch.core.step.AbstractStep         : Step: [childJob2Step1] executed in 9ms
2023-03-29 21:32:46.644  INFO 15588 --- [           main] o.s.batch.core.job.SimpleStepHandler     : Executing step: [childJob2Step2]
This is step#2 in Job#2!
2023-03-29 21:32:46.656  INFO 15588 --- [           main] o.s.batch.core.step.AbstractStep         : Step: [childJob2Step2] executed in 11ms
```



### 2.6 监听器 的使用

监听器用来监听批处理作业的执行情况
创建监听可以通过 实现接口 或 使用注解

- `JobExecutionListener(before, after)`
- `StepExecutionListener(before, after)`
- `ChunkListener(before, after, error)`
- `ItemReadListener / ItemProcessListener / ItemWriteListener(before, after, error)`

```java
package com.sb.springbatch.listener;

import org.springframework.batch.core.JobExecution;
import org.springframework.batch.core.JobExecutionListener;

public class MyJobListener implements JobExecutionListener {
    @Override
    public void beforeJob(JobExecution jobExecution) {
        System.out.println(jobExecution.getJobInstance().getJobName() + ">before<");
    }

    @Override
    public void afterJob(JobExecution jobExecution) {
        System.out.println(jobExecution.getJobInstance().getJobName() + ">after<");
    }
}
package com.sb.springbatch.listener;

import org.springframework.batch.core.annotation.AfterChunk;
import org.springframework.batch.core.annotation.BeforeChunk;
import org.springframework.batch.core.scope.context.ChunkContext;

public class MyChunkListener {
    @BeforeChunk
    public void beforeChunk(ChunkContext chunkContext) {
        System.out.println(chunkContext.getStepContext().getStepName() + "...before...");
    }

    @AfterChunk
    public void afterChunk(ChunkContext chunkContext) {
        System.out.println(chunkContext.getStepContext().getStepName() + "...after...");
    }
}
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.configuration.annotation.JobBuilderFactory;
import org.springframework.batch.core.configuration.annotation.StepBuilderFactory;
import org.springframework.batch.item.ItemReader;
import org.springframework.batch.item.ItemWriter;
import org.springframework.batch.item.support.ListItemReader;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.sb.springbatch.listener.MyJobListener;
import com.sb.springbatch.listener.MyChunkListener;

import java.util.Arrays;
import java.util.List;

@Configuration
public class ListenerDemo {

    @Autowired
    private JobBuilderFactory jobBuilderFactory;
    @Autowired
    private StepBuilderFactory stepBuilderFactory;

    @Bean
    public Job listenerJob() {
        return jobBuilderFactory.get("listenerJob")
                .start(step1())
                .listener(new MyJobListener())
                .build();
    }

    // step1 Chunk 使用方式
    @Bean
    public Step step1() {
        return stepBuilderFactory.get("step1")
                // 数据的读取, <String,String> 规定I/O的数据类型
                .<String, String>chunk(2) // 每读完2个数据进行1次输出处理
                // 容错
                .faultTolerant()
                .listener(new MyChunkListener())
                // 数据的读取
                .reader(read())
                // 数据的写入
                .writer(write())
                .build();
    }

    @Bean
    public ItemWriter<String> write() {
        return new ItemWriter<String>() {
            @Override
            public void write(List<? extends String> list) throws Exception {
                list.forEach(System.out::println);
            }
        };
    }

    @Bean
    public ItemReader<String> read() {
        return new ListItemReader<>(Arrays.asList("item#1", "item#2", "item#3"));
    }
}
```

console

```perl
2023-03-29 22:04:02.304  INFO 10752 --- [           main] o.s.b.c.l.support.SimpleJobLauncher      : Job: [SimpleJob: [name=listenerJob]] launched with the following parameters: [{}]
listenerJob>before<
2023-03-29 22:04:02.316  INFO 10752 --- [           main] o.s.batch.core.job.SimpleStepHandler     : Executing step: [step1]
step1...before...
item#1
item#2
step1...after...
step1...before...
item#3
step1...after...
2023-03-29 22:04:02.339  INFO 10752 --- [           main] o.s.batch.core.step.AbstractStep         : Step: [step1] executed in 23ms
listenerJob>after<
2023-03-29 22:04:02.346  INFO 10752 --- [           main] o.s.b.c.l.support.SimpleJobLauncher      : Job: [SimpleJob: [name=listenerJob]] completed with the following parameters: [{}] and the following status: [COMPLETED] in 39ms
```



### 2.7 Job 参数

- 在Job运行时可以以key=value形式传递参数
- 使用监听 可以拿到主启动类运行时候的参数

```java
import org.springframework.batch.core.*;
import org.springframework.batch.core.configuration.annotation.JobBuilderFactory;
import org.springframework.batch.core.configuration.annotation.StepBuilderFactory;
import org.springframework.batch.core.scope.context.ChunkContext;
import org.springframework.batch.core.step.tasklet.Tasklet;
import org.springframework.batch.repeat.RepeatStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Map;

@Configuration
public class ParametersDemo implements StepExecutionListener {

    @Autowired
    private JobBuilderFactory jobBuilderFactory;
    @Autowired
    private StepBuilderFactory stepBuilderFactory;

    private Map<String, JobParameter> params;

    @Bean
    public Job parameterJob() {
        return jobBuilderFactory.get("parameterJob")
                .start(paramStep())
                .build();
    }

    // Job执行的是 Step, 故 Job使用的参数本质就是 Step使用的参数
    // 那么如何 向Step 传递参数呢?
    // 可以使用 监听, 如 Step级别的监听来实现
    @Bean
    public Step paramStep() {
        return stepBuilderFactory.get("paramStep")
                .listener(this)
                .tasklet(new Tasklet() {
                    @Override
                    public RepeatStatus execute(StepContribution stepContribution, ChunkContext chunkContext) throws Exception {
                        // 打印 接收到的参数
                        System.out.println(params.get("key1"));
                        return RepeatStatus.FINISHED;
                    }
                }).build();
    }

    @Override
    public void beforeStep(StepExecution stepExecution) {
        params = stepExecution.getJobParameters().getParameters();
    }

    @Override
    public ExitStatus afterStep(StepExecution stepExecution) {
        return null;
    }
}
```

![img](https://raw.githubusercontent.com/guyuechen/gallery/main/img/1680160488603-305fa15f-b2db-4a71-a762-5c68502c8050.png)

```perl
2023-03-30 15:15:53.632  INFO 12204 --- [           main] o.s.b.c.l.support.SimpleJobLauncher      : Job: [SimpleJob: [name=parameterJob]] launched with the following parameters: [{key1=MY_VALUE_1}]
2023-03-30 15:15:53.640  INFO 12204 --- [           main] o.s.batch.core.job.SimpleStepHandler     : Executing step: [paramStep]
MY_VALUE_1
2023-03-30 15:15:53.649  INFO 12204 --- [           main] o.s.batch.core.step.AbstractStep         : Step: [paramStep] executed in 9ms
```