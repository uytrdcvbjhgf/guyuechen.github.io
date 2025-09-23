+++
title = 'SpringBatch 中的错误处理'
date = 2025-02-25T20:06:02+08:00
categories = ['java']
tags = ['java', "spring", "springboot", "springbatch"]
+++

## 5. 错误处理

### 5.1 错误处理概述

> 默认情况下，当任务出现异常时，SpringBatch 会结束任务。

> 当使用相同的参数重启任务时，SpringBatch 会执行未被执行的剩余任务。

ErrorDemo.java（模拟上述情况，留意 ! 的部分）

```java
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.StepContribution;
import org.springframework.batch.core.configuration.annotation.EnableBatchProcessing;
import org.springframework.batch.core.configuration.annotation.JobBuilderFactory;
import org.springframework.batch.core.configuration.annotation.StepBuilderFactory;
import org.springframework.batch.core.configuration.annotation.StepScope;
import org.springframework.batch.core.scope.context.ChunkContext;
import org.springframework.batch.core.step.tasklet.Tasklet;
import org.springframework.batch.repeat.RepeatStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Map;

@Configuration
@EnableBatchProcessing
public class ErrorDemo {

    @Autowired
    private JobBuilderFactory jobBuilderFactory;
    @Autowired
    private StepBuilderFactory stepBuilderFactory;

    @Bean
    public Job errorDemoJob() {
        return jobBuilderFactory.get("errorDemoJob")
                .start(errorStep1())
                .next(errorStep2())
                .build();
    }

    @Bean
    public Step errorStep1() {
        return stepBuilderFactory.get("errorStep1")
                .tasklet(null)
                .build();
    }

    @Bean
    public Step errorStep2() {
        return stepBuilderFactory.get("errorStep2")
                .tasklet(null)
                .build();
    }

    @Bean
    @StepScope
    public Tasklet errorHandling() {
        return new Tasklet() {
            @Override
            public RepeatStatus execute(StepContribution stepContribution, ChunkContext chunkContext) throws Exception {
                Map<String, Object> stepExecutionContext =
                        chunkContext.getStepContext().getStepExecutionContext();

                // (!)
                if (stepExecutionContext.containsKey("SUCCESS")) {
                    System.out.println("The next run will succeed");
                    return RepeatStatus.FINISHED;
                } else {
                    System.out.println("The first run will fail");
                    chunkContext.getStepContext().getStepExecution().getExecutionContext()
                            .put("SUCCESS", true);
                    throw new RuntimeException("Oops! Error!");
                }
            }
        };
    }
}
```

控制台结果（第 1 次执行）

```perl
2023-04-06 16:55:20.554  INFO 1068 --- [           main] o.s.b.c.l.support.SimpleJobLauncher      : Job: [SimpleJob: [name=errorDemoJob]] launched with the following parameters: [{}]
2023-04-06 16:55:20.582  INFO 1068 --- [           main] o.s.batch.core.job.SimpleStepHandler     : Executing step: [errorStep1]
The first run will fail
2023-04-06 16:55:20.599 ERROR 1068 --- [           main] o.s.batch.core.step.AbstractStep         : Encountered an error executing step errorStep1 in job errorDemoJob

java.lang.RuntimeException: Oops! Error!
	at com.sb.error.ErrorDemo$1.execute(ErrorDemo.java:67) ~[classes/:na]
	at ...

2023-04-06 16:55:20.605  INFO 1068 --- [           main] o.s.batch.core.step.AbstractStep         : Step: [errorStep1] executed in 22ms
2023-04-06 16:55:20.615  INFO 1068 --- [           main] o.s.b.c.l.support.SimpleJobLauncher      : Job: [SimpleJob: [name=errorDemoJob]] completed with the following parameters: [{}] and the following status: [FAILED] in 46ms
2023-04-06 16:55:20.618  INFO 1068 --- [ionShutdownHook] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Shutdown initiated...
2023-04-06 16:55:20.623  INFO 1068 --- [ionShutdownHook] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Shutdown completed.
```

控制台结果（第 2 次执行）

```perl
2023-04-06 16:56:25.923  INFO 10748 --- [           main] o.s.b.c.l.support.SimpleJobLauncher      : Job: [SimpleJob: [name=errorDemoJob]] launched with the following parameters: [{}]
2023-04-06 16:56:25.952  INFO 10748 --- [           main] o.s.batch.core.job.SimpleStepHandler     : Executing step: [errorStep1]
The next run will succeed
2023-04-06 16:56:25.967  INFO 10748 --- [           main] o.s.batch.core.step.AbstractStep         : Step: [errorStep1] executed in 15ms
2023-04-06 16:56:25.978  INFO 10748 --- [           main] o.s.batch.core.job.SimpleStepHandler     : Executing step: [errorStep2]
The first run will fail
2023-04-06 16:56:25.988 ERROR 10748 --- [           main] o.s.batch.core.step.AbstractStep         : Encountered an error executing step errorStep2 in job errorDemoJob

java.lang.RuntimeException: Oops! Error!
	at com.sb.error.ErrorDemo$1.execute(ErrorDemo.java:67) ~[classes/:na]
	at ...

2023-04-06 16:56:25.991  INFO 10748 --- [           main] o.s.batch.core.step.AbstractStep         : Step: [errorStep2] executed in 12ms
2023-04-06 16:56:26.000  INFO 10748 --- [           main] o.s.b.c.l.support.SimpleJobLauncher      : Job: [SimpleJob: [name=errorDemoJob]] completed with the following parameters: [{}] and the following status: [FAILED] in 63ms
2023-04-06 16:56:26.004  INFO 10748 --- [ionShutdownHook] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Shutdown initiated...
2023-04-06 16:56:26.007  INFO 10748 --- [ionShutdownHook] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Shutdown completed.
```

控制台结果（第 3 次执行）

```perl
2023-04-06 16:57:33.584  INFO 13492 --- [           main] o.s.b.c.l.support.SimpleJobLauncher      : Job: [SimpleJob: [name=errorDemoJob]] launched with the following parameters: [{}]
2023-04-06 16:57:33.603  INFO 13492 --- [           main] o.s.batch.core.job.SimpleStepHandler     : Step already complete or not restartable, so no action to execute: StepExecution: id=59, version=3, name=errorStep1, status=COMPLETED, exitStatus=COMPLETED, readCount=0, filterCount=0, writeCount=0 readSkipCount=0, writeSkipCount=0, processSkipCount=0, commitCount=1, rollbackCount=0, exitDescription=
2023-04-06 16:57:33.614  INFO 13492 --- [           main] o.s.batch.core.job.SimpleStepHandler     : Executing step: [errorStep2]
The next run will succeed
2023-04-06 16:57:33.630  INFO 13492 --- [           main] o.s.batch.core.step.AbstractStep         : Step: [errorStep2] executed in 16ms
2023-04-06 16:57:33.637  INFO 13492 --- [           main] o.s.b.c.l.support.SimpleJobLauncher      : Job: [SimpleJob: [name=errorDemoJob]] completed with the following parameters: [{}] and the following status: [COMPLETED] in 40ms
2023-04-06 16:57:33.641  INFO 13492 --- [ionShutdownHook] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Shutdown initiated...
2023-04-06 16:57:33.644  INFO 13492 --- [ionShutdownHook] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Shutdown completed.
```


稍微解释一下：

1. 第 1 次执行的时候
    在 errorStep1 执行的过程中抛出了异常（但在抛异常之前会把上下文的键值对设置正确）
2. 第 2 次执行的时候
    因为 errorStep1 的上下文的键值对是正确的，所以 errorStep1 的 “next run” 会被成功执行
    但是 errorStep2 的 “first run” 依然会失败，原因还是一样：上下文的键值对没有设置（但在抛异常之前会把上下文的键值对设置正确）
3. 第 3 次执行的时候
    因为 errorStep2 的上下文的键值对是正确的，所以 errorStep2 的 “next run” 会被成功执行




### 5.2 错误重试（Retry）

> 如果不想 Job 在被执行过程中像上述例子中一样停止，我们可以使用 retry


RetryItemWriter.java

```java
import org.springframework.batch.item.ItemWriter;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class RetryItemWriter implements ItemWriter<String> {
    @Override
    public void write(List<? extends String> list) throws Exception {
        list.forEach(System.out::println);
    }
}

public class CustomRetryException extends Exception {
    public CustomRetryException() {
        super();
    }

    public CustomRetryException(String message) {
        super(message);
    }
}
```


RetryItemProcessor.java（到 ITEM_13 的时候会抛异常）

```java
import org.springframework.batch.item.ItemProcessor;
import org.springframework.stereotype.Component;

@Component
public class RetryItemProcessor implements ItemProcessor<String, String> {
    private int attemptCount = 0;

    @Override
    public String process(String item) throws Exception {
    System.out.println("processing item: " + item);
    if ("ITEM_13".equals(item)) {
            attemptCount++;
            if (attemptCount >= 3) {
                System.out.println("Retried " + attemptCount + " times and finally succeeded.");
                return "ITEM_" + (Integer.parseInt(item.substring(5)) * -1);
            } else {
                System.out.println("Process failure * " + attemptCount + ".");
                throw new CustomRetryException("Process failed and attempts: " + attemptCount);
            }
        } else {
            return "ITEM_" + (Integer.parseInt(item.substring(5)) * -1);
        }
    }
}
```

CustomRetryException.java

```java
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.configuration.annotation.JobBuilderFactory;
import org.springframework.batch.core.configuration.annotation.StepBuilderFactory;
import org.springframework.batch.core.configuration.annotation.StepScope;
import org.springframework.batch.item.ItemProcessor;
import org.springframework.batch.item.ItemWriter;
import org.springframework.batch.item.support.ListItemReader;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.ArrayList;
import java.util.List;

@Configuration
public class RetryDemo {

    @Autowired
    private JobBuilderFactory jobBuilderFactory;
    @Autowired
    private StepBuilderFactory stepBuilderFactory;

    @Autowired
    private ItemWriter<String> retryItemWriter;
    @Autowired
    private ItemProcessor<String, String> retryItemProcessor;

    @Bean
    public Job retryDemoJob() {
        return jobBuilderFactory.get("retryDemoJob")
                .start(retryDemoStep())
                .build();
    }

    @Bean
    public Step retryDemoStep() {
        return stepBuilderFactory.get("retryDemoStep")
                .<String, String>chunk(5)
                .reader(reader())
                .processor(retryItemProcessor)
                .writer(retryItemWriter)
                // (!)
                .faultTolerant()
                .retry(CustomRetryException.class)
                .retryLimit(5)
                .build();
    }

    @Bean
    @StepScope
    public ListItemReader<String> reader() {
        List<String> items = new ArrayList<>();
        for (int i = 0; i < 30; i++) {
            items.add("ITEM_" + String.valueOf(i));
        }
        ListItemReader<String> reader = new ListItemReader<>(items);
        return reader;
    }
}
```

console

```perl
2023-04-06 17:49:42.619  INFO 25584 --- [           main] o.s.b.c.l.support.SimpleJobLauncher      : Job: [SimpleJob: [name=retryDemoJob]] launched with the following parameters: [{}]
2023-04-06 17:49:42.646  INFO 25584 --- [           main] o.s.batch.core.job.SimpleStepHandler     : Executing step: [retryDemoStep]
processing item: ITEM_0
processing item: ITEM_1
processing item: ITEM_2
processing item: ITEM_3
processing item: ITEM_4
ITEM_0
ITEM_-1
ITEM_-2
ITEM_-3
ITEM_-4
processing item: ITEM_5
processing item: ITEM_6
processing item: ITEM_7
processing item: ITEM_8
processing item: ITEM_9
ITEM_-5
ITEM_-6
ITEM_-7
ITEM_-8
ITEM_-9
processing item: ITEM_10
processing item: ITEM_11
processing item: ITEM_12
processing item: ITEM_13
Process failure * 1.
processing item: ITEM_10
processing item: ITEM_11
processing item: ITEM_12
processing item: ITEM_13
Process failure * 2.
processing item: ITEM_10
processing item: ITEM_11
processing item: ITEM_12
processing item: ITEM_13
Retried 3 times and finally succeeded.
processing item: ITEM_14
ITEM_-10
ITEM_-11
ITEM_-12
ITEM_-13
ITEM_-14
processing item: ITEM_15
processing item: ITEM_16
processing item: ITEM_17
processing item: ITEM_18
processing item: ITEM_19
ITEM_-15
ITEM_-16
ITEM_-17
ITEM_-18
ITEM_-19
processing item: ITEM_20
processing item: ITEM_21
processing item: ITEM_22
processing item: ITEM_23
processing item: ITEM_24
ITEM_-20
ITEM_-21
ITEM_-22
ITEM_-23
ITEM_-24
processing item: ITEM_25
processing item: ITEM_26
processing item: ITEM_27
processing item: ITEM_28
processing item: ITEM_29
ITEM_-25
ITEM_-26
ITEM_-27
ITEM_-28
ITEM_-29
2023-04-06 17:49:42.697  INFO 25584 --- [           main] o.s.batch.core.step.AbstractStep         : Step: [retryDemoStep] executed in 50ms
2023-04-06 17:49:42.704  INFO 25584 --- [           main] o.s.b.c.l.support.SimpleJobLauncher      : Job: [SimpleJob: [name=retryDemoJob]] completed with the following parameters: [{}] and the following status: [COMPLETED] in 71ms
2023-04-06 17:49:42.709  INFO 25584 --- [ionShutdownHook] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Shutdown initiated...
2023-04-06 17:49:42.712  INFO 25584 --- [ionShutdownHook] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Shutdown completed.
```

稍微解释一下：

核心处是
`stepBuilderFactory.get("retryDemoStep")<String,String>chunk(5).reader(reader()).processor(retryItemProcessor).writer(retryItemWriter).faultTolerant().retry(CustomRetryException.class).retryLimit(5).build();`

先把默认修改成可以容忍抛出异常，再设定会对特定的异常进行retry，最后设置retry的次数



### 5.3 错误跳过（Skip）

> 如果不想Job在被执行过程中遇到异常像上述例子中一样retry，我们还可以skip

SkipItemWriter.java

```java
import org.springframework.batch.item.ItemWriter;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class SkipItemWriter implements ItemWriter<String> {
    @Override
    public void write(List<? extends String> list) throws Exception {
        list.forEach(System.out::println);
    }
}
```


SkipItemProcessor.java（到 ITEM_13 的时候会抛异常）

```java
import com.sb.error.retry.CustomRetryException;
import org.springframework.batch.item.ItemProcessor;
import org.springframework.stereotype.Component;

@Component
public class SkipItemProcessor implements ItemProcessor<String, String> {
    private int attemptCount = 0;

    @Override
    public String process(String item) throws Exception {
    System.out.println("processing item: " + item);
    if ("ITEM_13".equals(item)) {
            attemptCount++;
            if (attemptCount >= 3) {
                System.out.println("Retried " + attemptCount + " times and finally succeeded.");
                return "ITEM_" + (Integer.parseInt(item.substring(5)) * -1);
            } else {
                System.out.println("Process failure * " + attemptCount + ".");
                throw new CustomRetryException("Process failed and attempts: " + attemptCount);
            }
        } else {
            return "ITEM_" + (Integer.parseInt(item.substring(5)) * -1);
        }
    }
}
```

CustomRetryException.java

```java
public class CustomRetryException extends Exception {
    public CustomRetryException() {
        super();
    }

    public CustomRetryException(String message) {
        super(message);
    }
}
```

SkipDemo.java

```java
import com.sb.error.retry.CustomRetryException;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.configuration.annotation.EnableBatchProcessing;
import org.springframework.batch.core.configuration.annotation.JobBuilderFactory;
import org.springframework.batch.core.configuration.annotation.StepBuilderFactory;
import org.springframework.batch.core.configuration.annotation.StepScope;
import org.springframework.batch.item.ItemProcessor;
import org.springframework.batch.item.ItemWriter;
import org.springframework.batch.item.support.ListItemReader;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.ArrayList;
import java.util.List;

@Configuration
@EnableBatchProcessing
public class SkipDemo {

    @Autowired
    private JobBuilderFactory jobBuilderFactory;
    @Autowired
    private StepBuilderFactory stepBuilderFactory;

    @Autowired
    private ItemWriter<String> skipItemWriter;
    @Autowired
    private ItemProcessor<String, String> skipItemProcessor;

    @Bean
    public Job skipDemoJob() {
        return jobBuilderFactory.get("skipDemoJob")
                .start(skipDemoStep())
                .build();
    }

    @Bean
    public Step skipDemoStep() {
        return stepBuilderFactory.get("skipDemoStep")
                .<String, String>chunk(5)
                .reader(reader())
                .processor(skipItemProcessor)
                .writer(skipItemWriter)
                // (!)
                .faultTolerant()
                .skip(CustomRetryException.class)
                .skipLimit(5)
                .build();
    }

    @Bean
    @StepScope
    public ListItemReader<String> reader() {
        List<String> items = new ArrayList<>();
        for (int i = 0; i < 30; i++) {
            items.add("ITEM_" + String.valueOf(i));
        }
        ListItemReader<String> reader = new ListItemReader<>(items);
        return reader;
    }
}
```

console

```perl
2023-04-06 19:41:19.547  INFO 15484 --- [           main] o.s.b.c.l.support.SimpleJobLauncher      : Job: [SimpleJob: [name=skipDemoJob]] launched with the following parameters: [{}]
2023-04-06 19:41:19.558  INFO 15484 --- [           main] o.s.batch.core.job.SimpleStepHandler     : Executing step: [skipDemoStep]
processing item: ITEM_0
processing item: ITEM_1
processing item: ITEM_2
processing item: ITEM_3
processing item: ITEM_4
ITEM_0
ITEM_-1
ITEM_-2
ITEM_-3
ITEM_-4
processing item: ITEM_5
processing item: ITEM_6
processing item: ITEM_7
processing item: ITEM_8
processing item: ITEM_9
ITEM_-5
ITEM_-6
ITEM_-7
ITEM_-8
ITEM_-9
processing item: ITEM_10
processing item: ITEM_11
processing item: ITEM_12
processing item: ITEM_13
Process failure * 1.
processing item: ITEM_10
processing item: ITEM_11
processing item: ITEM_12
processing item: ITEM_14
ITEM_-10
ITEM_-11
ITEM_-12
ITEM_-14
processing item: ITEM_15
processing item: ITEM_16
processing item: ITEM_17
processing item: ITEM_18
processing item: ITEM_19
ITEM_-15
ITEM_-16
ITEM_-17
ITEM_-18
ITEM_-19
processing item: ITEM_20
processing item: ITEM_21
processing item: ITEM_22
processing item: ITEM_23
processing item: ITEM_24
ITEM_-20
ITEM_-21
ITEM_-22
ITEM_-23
ITEM_-24
processing item: ITEM_25
processing item: ITEM_26
processing item: ITEM_27
processing item: ITEM_28
processing item: ITEM_29
ITEM_-25
ITEM_-26
ITEM_-27
ITEM_-28
ITEM_-29
2023-04-06 19:41:19.608  INFO 15484 --- [           main] o.s.batch.core.step.AbstractStep         : Step: [skipDemoStep] executed in 50ms
2023-04-06 19:41:19.616  INFO 15484 --- [           main] o.s.b.c.l.support.SimpleJobLauncher      : Job: [SimpleJob: [name=skipDemoJob]] completed with the following parameters: [{}] and the following status: [COMPLETED] in 65ms
2023-04-06 19:41:19.621  INFO 15484 --- [ionShutdownHook] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Shutdown initiated...
2023-04-06 19:41:19.625  INFO 15484 --- [ionShutdownHook] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Shutdown completed.
```

稍微解释一下：

核心处是
`stepBuilderFactory.get("retryDemoStep")<String,String>chunk(5).reader(reader()).processor(retryItemProcessor).writer(retryItemWriter).faultTolerant().skip(CustomRetryException.class).skipLimit(5).build();`

先把默认修改成可以容忍抛出异常，再设定会对特定的异常进行skip，最后设置skip的次数



### 5.4 错误跳过监听器（Skip Listener）

> 其他都与5.3中的一样，只是当我们需要监听skip时，需要用到`SkipListener<T, S>`

MySkipListener.java

```java
import org.springframework.batch.core.SkipListener;
import org.springframework.stereotype.Component;

@Component
public class MySkipListener implements SkipListener<String, String> {
    @Override
    public void onSkipInRead(Throwable throwable) {

    }

    @Override
    public void onSkipInWrite(String s, Throwable throwable) {

    }

    @Override
    public void onSkipInProcess(String item, Throwable throwable) {
        System.out.println(item + "occurs exception: " + throwable);
    }
}
```

SkipListenerDemo.java

```java
import com.sb.error.retry.CustomRetryException;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.configuration.annotation.EnableBatchProcessing;
import org.springframework.batch.core.configuration.annotation.JobBuilderFactory;
import org.springframework.batch.core.configuration.annotation.StepBuilderFactory;
import org.springframework.batch.core.configuration.annotation.StepScope;
import org.springframework.batch.item.ItemProcessor;
import org.springframework.batch.item.ItemWriter;
import org.springframework.batch.item.support.ListItemReader;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.ArrayList;
import java.util.List;

@Configuration
@EnableBatchProcessing
public class SkipListenerDemo {

    @Autowired
    private JobBuilderFactory jobBuilderFactory;
    @Autowired
    private StepBuilderFactory stepBuilderFactory;

    @Autowired
    private ItemWriter<String> skipItemWriter;
    @Autowired
    private ItemProcessor<String, String> skipItemProcessor;

    @Autowired
    private MySkipListener mySkipListener;

    @Bean
    public Job skipListenerDemoJob() {
        return jobBuilderFactory.get("skipListenerDemoJob")
                .start(skipListenerDemoStep())
                .build();
    }

    @Bean
    public Step skipListenerDemoStep() {
        return stepBuilderFactory.get("skipListenerDemoStep")
                .<String, String>chunk(5)
                .reader(reader())
                .processor(skipItemProcessor)
                .writer(skipItemWriter)
                // (!)
                .faultTolerant()
                .skip(CustomRetryException.class)
                .skipLimit(5)
                // (!)
                .listener(mySkipListener)
                .build();
    }

    @Bean
    @StepScope
    public ListItemReader<String> reader() {
        List<String> items = new ArrayList<>();
        for (int i = 0; i < 30; i++) {
            items.add("ITEM_" + String.valueOf(i));
        }
        ListItemReader<String> reader = new ListItemReader<>(items);
        return reader;
    }
}
```

console

```perl
2023-04-06 19:52:20.280  INFO 11568 --- [           main] o.s.b.c.l.support.SimpleJobLauncher      : Job: [SimpleJob: [name=skipListenerDemoJob]] launched with the following parameters: [{}]
2023-04-06 19:52:20.293  INFO 11568 --- [           main] o.s.batch.core.job.SimpleStepHandler     : Executing step: [skipListenerDemoStep]
processing item: ITEM_0
processing item: ITEM_1
processing item: ITEM_2
processing item: ITEM_3
processing item: ITEM_4
ITEM_0
ITEM_-1
ITEM_-2
ITEM_-3
ITEM_-4
processing item: ITEM_5
processing item: ITEM_6
processing item: ITEM_7
processing item: ITEM_8
processing item: ITEM_9
ITEM_-5
ITEM_-6
ITEM_-7
ITEM_-8
ITEM_-9
processing item: ITEM_10
processing item: ITEM_11
processing item: ITEM_12
processing item: ITEM_13
Process failure * 1.
processing item: ITEM_10
processing item: ITEM_11
processing item: ITEM_12
processing item: ITEM_14
ITEM_-10
ITEM_-11
ITEM_-12
ITEM_-14
ITEM_13occurs exception: com.sb.error.retry.CustomRetryException: Process failed and attempts: 1
processing item: ITEM_15
processing item: ITEM_16
processing item: ITEM_17
processing item: ITEM_18
processing item: ITEM_19
ITEM_-15
ITEM_-16
ITEM_-17
ITEM_-18
ITEM_-19
processing item: ITEM_20
processing item: ITEM_21
processing item: ITEM_22
processing item: ITEM_23
processing item: ITEM_24
ITEM_-20
ITEM_-21
ITEM_-22
ITEM_-23
ITEM_-24
processing item: ITEM_25
processing item: ITEM_26
processing item: ITEM_27
processing item: ITEM_28
processing item: ITEM_29
ITEM_-25
ITEM_-26
ITEM_-27
ITEM_-28
ITEM_-29
2023-04-06 19:52:20.349  INFO 11568 --- [           main] o.s.batch.core.step.AbstractStep         : Step: [skipListenerDemoStep] executed in 56ms
2023-04-06 19:52:20.356  INFO 11568 --- [           main] o.s.b.c.l.support.SimpleJobLauncher      : Job: [SimpleJob: [name=skipListenerDemoJob]] completed with the following parameters: [{}] and the following status: [COMPLETED] in 72ms
2023-04-06 19:52:20.360  INFO 11568 --- [ionShutdownHook] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Shutdown initiated...
2023-04-06 19:52:20.365  INFO 11568 --- [ionShutdownHook] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Shutdown completed.
```
