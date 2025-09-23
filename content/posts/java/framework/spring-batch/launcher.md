+++
title = 'SpringBatch 中的作业调度'
date = 2025-02-25T20:07:44+08:00
categories = ['java']
tags = ['java', "spring", "springboot", "springbatch"]
+++

## 6. 作业调度


### 6.1 `JobLauncher` 的使用

> 控制任务什么时候启动


pom.xml 引入 web 依赖

```xml
<!-- 引入web依赖 -->
<dependency>
	<groupId>org.springframework.boot</groupId>
	<artifactId>spring-boot-starter-web</artifactId>
</dependency>
```


application.properties（spring.batch.job.enabled=false）

```properties
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.datasource.url=jdbc:mysql://localhost:3306/springbatch?serverTimezone=UTC&characterEncoding=utf8&useUnicode=true&useSSL=true
spring.datasource.username=root
spring.datasource.password=1234

spring.sql.init.schema-locations=classpath:/org/springframework/batch/core/schema-mysql.sql
spring.batch.jdbc.initialize-schema=always

## (!)
spring.batch.job.enabled=false 

#spring.batch.job.names=parentJob
```

index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Spring Batch Demo</title>
</head>
<body>

<input type="text" id="msg">
<button onclick="runJob1()">Run Job#1</button>

<script type="text/javascript">
    const baseurl = "http://localhost:8080";
    const xhttp = new XMLHttpRequest();

    function runJob1() {
        let msg = document.getElementById('msg').value;
        let url = baseurl + '/job/' + msg;
        xhttp.open('GET', url, true);
        xhttp.send();

        xhttp.onreadystatechange = () => {
            if (this.readyState == 4 && this.status == 200) {
                console.log('Job status: ' + this.responseText);
            }
        };
    }
</script>

</body>
</html>
```


JobLauncherController.java

```java
import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.JobParametersBuilder;
import org.springframework.batch.core.JobParametersInvalidException;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.batch.core.repository.JobExecutionAlreadyRunningException;
import org.springframework.batch.core.repository.JobInstanceAlreadyCompleteException;
import org.springframework.batch.core.repository.JobRestartException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class JobLauncherController {

    @Autowired
    private JobLauncher jobLauncher;

    @Autowired
    private Job jobLauncherDemoJob;

    @RequestMapping("/job/{msg}")
    public String run1(@PathVariable String msg) throws JobInstanceAlreadyCompleteException, JobExecutionAlreadyRunningException, JobParametersInvalidException, JobRestartException {
        // 把接收到的参数 传给Job
        JobParameters parameters = new JobParametersBuilder()
                .addString("msg", msg)
                .toJobParameters();

        // 启动任务 (任务的参数的传递进来的参数)
        jobLauncher.run(jobLauncherDemoJob, parameters);

        return "Job launched successfully";
    }
}
```


JobLauncherDemo.java（此 job 仅把接收到的参数打印到控制台）

```java
import org.springframework.batch.core.*;
import org.springframework.batch.core.configuration.annotation.EnableBatchProcessing;
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
@EnableBatchProcessing
public class JobLauncherDemo implements StepExecutionListener {

    @Autowired
    private JobBuilderFactory jobBuilderFactory;

    @Autowired
    private StepBuilderFactory stepBuilderFactory;

    private Map<String, JobParameter> parameterMap;

    @Bean
    public Job jobLauncherDemoJob() {
        return jobBuilderFactory.get("jobLauncherDemoJob")
                .start(jobLauncherDemoStep())
                .build();
    }

    @Bean
    public Step jobLauncherDemoStep() {
        return stepBuilderFactory.get("jobLauncherDemoStep")
                .listener(this)
                .tasklet(new Tasklet() {
                    @Override
                    public RepeatStatus execute(StepContribution stepContribution, ChunkContext chunkContext) throws Exception {
                        System.out.println(parameterMap.get("msg").getValue());
                        return RepeatStatus.FINISHED;
                    }
                }).build();
    }

    @Override
    public void beforeStep(StepExecution stepExecution) {
        parameterMap = stepExecution.getJobParameters().getParameters();
    }

    @Override
    public ExitStatus afterStep(StepExecution stepExecution) {
        return null;
    }
}
```

browser

![image-20250225201043160](https://raw.githubusercontent.com/guyuechen/gallery/main/img/202502252010221.png)

console

```perl
2023-04-06 20:37:32.376  INFO 1724 --- [           main] o.s.b.c.l.support.SimpleJobLauncher      : No TaskExecutor has been set, defaulting to synchronous executor.
2023-04-06 20:37:32.451  INFO 1724 --- [           main] o.s.b.w.embedded.tomcat.TomcatWebServer  : Tomcat started on port(s): 8080 (http) with context path ''
2023-04-06 20:37:32.460  INFO 1724 --- [           main] c.sb.joblauncher.SpringbatchApplication  : Started SpringbatchApplication in 2.497 seconds (JVM running for 3.618)
2023-04-06 20:37:45.268  INFO 1724 --- [nio-8080-exec-1] o.a.c.c.C.[Tomcat].[localhost].[/]       : Initializing Spring DispatcherServlet 'dispatcherServlet'
2023-04-06 20:37:45.268  INFO 1724 --- [nio-8080-exec-1] o.s.web.servlet.DispatcherServlet        : Initializing Servlet 'dispatcherServlet'
2023-04-06 20:37:45.269  INFO 1724 --- [nio-8080-exec-1] o.s.web.servlet.DispatcherServlet        : Completed initialization in 1 ms
2023-04-06 20:38:41.909  INFO 1724 --- [nio-8080-exec-3] o.s.b.c.l.support.SimpleJobLauncher      : Job: [SimpleJob: [name=jobLauncherDemoJob]] launched with the following parameters: [{msg=fuck you!!!}]
2023-04-06 20:38:41.942  INFO 1724 --- [nio-8080-exec-3] o.s.batch.core.job.SimpleStepHandler     : Executing step: [jobLauncherDemoStep]
fuck you!!!
2023-04-06 20:38:41.962  INFO 1724 --- [nio-8080-exec-3] o.s.batch.core.step.AbstractStep         : Step: [jobLauncherDemoStep] executed in 19ms
2023-04-06 20:38:41.973  INFO 1724 --- [nio-8080-exec-3] o.s.b.c.l.support.SimpleJobLauncher      : Job: [SimpleJob: [name=jobLauncherDemoJob]] completed with the following parameters: [{msg=fuck you!!!}] and the following status: [COMPLETED] in 46ms
```




### 6.2 `JobOperator` 的使用

> 本质上是对 `JobLauncher` 的封装，功能更强大的同时使用起来也更复杂

index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Spring Batch Demo</title>
</head>
<body>

<input type="text" id="msg">
<button onclick="runJob1()">Run Job#1</button>

<input type="text" id="msg2">
<button onclick="runJob2()">Run Job#2</button>

<script type="text/javascript">
    const baseurl = "http://localhost:8080";
    const xhttp = new XMLHttpRequest();

    function runJob1() {
        let msg = document.getElementById('msg').value;
        let url = baseurl + '/job/' + msg;
        xhttp.open('GET', url, true);
        xhttp.send();

        xhttp.onreadystatechange = () => {
            if (this.readyState == 4 && this.status == 200) {
                console.log('Job status: ' + this.responseText);
            }
        };
    }

    function runJob2() {
        let msg = document.getElementById('msg2').value;
        let url = baseurl + '/job2/' + msg;
        xhttp.open('GET', url, true);
        xhttp.send();

        xhttp.onreadystatechange = () => {
            if (this.readyState == 4 && this.status == 200) {
                console.log('Job status: ' + this.responseText);
            }
        };
    }

</script>

</body>
</html>
```


JobOperatorController.java

```java
import org.springframework.batch.core.JobParametersInvalidException;
import org.springframework.batch.core.launch.JobInstanceAlreadyExistsException;
import org.springframework.batch.core.launch.JobOperator;
import org.springframework.batch.core.launch.NoSuchJobException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("job2")
public class JobOperatorController {

    @Autowired
    private JobOperator jobOperator;

    @GetMapping("/{msg}")
    public String run2(@PathVariable String msg) throws JobInstanceAlreadyExistsException, NoSuchJobException, JobParametersInvalidException {
        // 启动任务: 传入任务名(而不是对象) 参数是键值对的形式
        jobOperator.start("jobOperatorDemoJob", "msg=" + msg);
        return "Job operated successfully";
    }
}
```


JobOperatorDemo

```java
import org.springframework.batch.core.*;
import org.springframework.batch.core.configuration.JobRegistry;
import org.springframework.batch.core.configuration.annotation.EnableBatchProcessing;
import org.springframework.batch.core.configuration.annotation.JobBuilderFactory;
import org.springframework.batch.core.configuration.annotation.StepBuilderFactory;
import org.springframework.batch.core.configuration.support.JobRegistryBeanPostProcessor;
import org.springframework.batch.core.converter.DefaultJobParametersConverter;
import org.springframework.batch.core.explore.JobExplorer;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.batch.core.launch.JobOperator;
import org.springframework.batch.core.launch.support.SimpleJobOperator;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.scope.context.ChunkContext;
import org.springframework.batch.core.step.tasklet.Tasklet;
import org.springframework.batch.repeat.RepeatStatus;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Map;

@Configuration
@EnableBatchProcessing
public class JobOperatorDemo implements StepExecutionListener, ApplicationContextAware {

    @Autowired
    private JobBuilderFactory jobBuilderFactory;
    @Autowired
    private StepBuilderFactory stepBuilderFactory;

    private Map<String, JobParameter> parameterMap;

    // (!)
    @Autowired
    private JobLauncher jobLauncher;
    @Autowired
    private JobRepository jobRepository;
    @Autowired
    private JobExplorer jobExplorer;
    @Autowired
    private JobRegistry jobRegistry;

    private ApplicationContext applicationContext;

    @Bean
    public JobRegistryBeanPostProcessor jobRegistryBeanPostProcessor() throws Exception {
        JobRegistryBeanPostProcessor postProcessor = new JobRegistryBeanPostProcessor();
        postProcessor.setJobRegistry(jobRegistry);
        postProcessor.setBeanFactory(applicationContext.getAutowireCapableBeanFactory());
        postProcessor.afterPropertiesSet();
        return postProcessor;
    }

    // (!)
    @Bean
    public JobOperator jobOperator() {
        SimpleJobOperator operator = new SimpleJobOperator();
        operator.setJobLauncher(jobLauncher);
        operator.setJobParametersConverter(new DefaultJobParametersConverter());
        operator.setJobRepository(jobRepository);
        operator.setJobExplorer(jobExplorer);
        operator.setJobRegistry(jobRegistry);
        return operator;
    }

    @Bean
    public Job jobOperatorDemoJob() {
        return jobBuilderFactory.get("jobOperatorDemoJob")
                .start(jobOperatorDemoStep())
                .build();
    }

    @Bean
    public Step jobOperatorDemoStep() {
        return stepBuilderFactory.get("jobOperatorDemoStep")
                .listener(this)
                .tasklet(new Tasklet() {
                    @Override
                    public RepeatStatus execute(StepContribution stepContribution, ChunkContext chunkContext) throws Exception {
                        System.out.println(parameterMap.get("msg").getValue());
                        return RepeatStatus.FINISHED;
                    }
                }).build();
    }

    @Override
    public void beforeStep(StepExecution stepExecution) {
        parameterMap = stepExecution.getJobParameters().getParameters();
    }

    @Override
    public ExitStatus afterStep(StepExecution stepExecution) {
        return null;
    }

    @Override
    public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
        this.applicationContext = applicationContext;
    }
}
```

browser

![image-20250225201123884](https://raw.githubusercontent.com/guyuechen/gallery/main/img/202502252011949.png)

console

```perl
2023-04-06 21:12:23.395  INFO 15452 --- [           main] o.s.b.a.w.s.WelcomePageHandlerMapping    : Adding welcome page: class path resource [static/index.html]
2023-04-06 21:12:23.497  INFO 15452 --- [           main] o.s.b.w.embedded.tomcat.TomcatWebServer  : Tomcat started on port(s): 8080 (http) with context path ''
2023-04-06 21:12:23.504  INFO 15452 --- [           main] c.sb.joblauncher.SpringbatchApplication  : Started SpringbatchApplication in 1.76 seconds (JVM running for 2.292)
2023-04-06 21:12:28.793  INFO 15452 --- [nio-8080-exec-1] o.a.c.c.C.[Tomcat].[localhost].[/]       : Initializing Spring DispatcherServlet 'dispatcherServlet'
2023-04-06 21:12:28.794  INFO 15452 --- [nio-8080-exec-1] o.s.web.servlet.DispatcherServlet        : Initializing Servlet 'dispatcherServlet'
2023-04-06 21:12:28.795  INFO 15452 --- [nio-8080-exec-1] o.s.web.servlet.DispatcherServlet        : Completed initialization in 1 ms
2023-04-06 21:12:45.598  INFO 15452 --- [nio-8080-exec-2] o.s.b.c.l.support.SimpleJobOperator      : Checking status of job with name=jobOperatorDemoJob
2023-04-06 21:12:45.617  INFO 15452 --- [nio-8080-exec-2] o.s.b.c.l.support.SimpleJobOperator      : Attempting to launch job with name=jobOperatorDemoJob and parameters=msg=cao ni ma bi
2023-04-06 21:12:45.646  INFO 15452 --- [nio-8080-exec-2] o.s.b.c.l.support.SimpleJobLauncher      : Job: [SimpleJob: [name=jobOperatorDemoJob]] launched with the following parameters: [{msg=cao ni ma bi}]
2023-04-06 21:12:45.668  INFO 15452 --- [nio-8080-exec-2] o.s.batch.core.job.SimpleStepHandler     : Executing step: [jobOperatorDemoStep]
cao ni ma bi
2023-04-06 21:12:45.683  INFO 15452 --- [nio-8080-exec-2] o.s.batch.core.step.AbstractStep         : Step: [jobOperatorDemoStep] executed in 15ms
2023-04-06 21:12:45.690  INFO 15452 --- [nio-8080-exec-2] o.s.b.c.l.support.SimpleJobLauncher      : Job: [SimpleJob: [name=jobOperatorDemoJob]] completed with the following parameters: [{msg=cao ni ma bi}] and the following status: [COMPLETED] in 31ms
```
