+++
title = 'SpringBoot整合NoSQL'
date = 2025-06-15T15:47:45+09:00
categories = ["java"]
tags = ["java", "spring", "springboot", "nosql", "redis", "mongodb"]
+++

## 一、NoSQL 的兴起背景

传统的关系型数据库（RDBMS）如 MySQL、PostgreSQL 一直是企业数据存储的主力，但随着互联网业务的发展，数据特征与系统需求也发生了变化：

- **结构灵活性需求提升**：业务数据结构快速变化，RDBMS 模式限制灵活性。
- **高并发与大数据吞吐压力**：RDBMS 在高并发写入、海量数据处理上存在性能瓶颈。
- **横向扩展能力不足**：传统数据库的扩展多数基于纵向扩展，成本高昂。

NoSQL（Not Only SQL）应运而生，代表了一类支持非关系结构的数据存储方式，包括键值型、文档型、列族型和图数据库等。



## 二、NoSQL 代表产品及应用场景

| 类型     | 代表产品       | 适用场景                             |
|----------|----------------|--------------------------------------|
| 键值型   | Redis, Memcached | 缓存、会话存储、排行榜、分布式锁等 |
| 文档型   | MongoDB, Couchbase | 内容管理、商品目录、灵活数据结构   |
| 列族型   | Cassandra, HBase | 日志存储、大数据分析                 |
| 图数据库 | Neo4j, ArangoDB  | 社交图谱、推荐系统、路径搜索         |

下文聚焦于 Spring Boot 项目中广泛使用的 Redis（键值型）与 MongoDB（文档型）。



## 三、NoSQL 使用注意事项

### 1. Redis 使用注意事项

- **线程安全性**：使用 Jedis 时需注意非线程安全问题，建议使用 Lettuce。
- **缓存穿透/雪崩/击穿**：需通过布隆过滤器、热点数据预热、互斥锁等机制防御。
- **键设计规范**：避免过长、动态拼接频繁的键。
- **数据过期策略**：必须设置 TTL，防止内存泄露。
- **连接池配置合理性**：如最大连接数、最大空闲等。

### 2. MongoDB 使用注意事项

- **字段未定义问题**：MongoDB 文档结构灵活，需约定字段与索引规范。
- **索引策略**：不合理索引会导致性能急剧下降，应有选择性地创建索引。
- **写入策略**：MongoDB 写入可以配置为确认/异步，需根据场景权衡可靠性与性能。
- **分片机制**：海量数据场景下建议开启分片策略。



## 四、真实业务中的 NoSQL 最佳实践

### Redis 最佳实践

1. **统一缓存命名规范**：如 `业务模块:实体类型:主键`。
2. **结合 Spring Cache 抽象**：通过 `@Cacheable` 等注解简化逻辑。
3. **热点数据缓存预热**：系统启动后预填充缓存，降低首次访问延迟。
4. **分布式锁使用 Redisson**：简化并发控制。
5. **限制缓存对象大小**：建议避免大对象直接缓存，尤其是集合类。
6. **使用 Hash 存储对象字段**：便于字段级别更新与过期控制。

### MongoDB 最佳实践

1. **统一数据模型定义**：使用 Java Bean 与 `@Document` 注解标准化结构。
2. **优先使用 Repository 查询**：简洁并具备分页、排序等能力。
3. **审慎使用 MongoTemplate**：复杂查询或原生语法时使用。
4. **合理设计嵌套与引用**：大文档建议拆分为引用结构，避免超出 BSON 限制（16MB）。
5. **定期评估索引有效性**：通过 `db.collection.getIndexes()` 与 `explain()` 分析慢查询。
6. **备份与容灾**：开启复制集或使用云厂商提供的持久化机制。

NoSQL 并非替代关系型数据库，而是作为其补充解决特定场景下的性能与灵活性问题。在 Spring Boot 项目中通过 Spring Data 的统一抽象可以轻松整合 MongoDB 与 Redis，提升开发效率。配合缓存注解与 Template 编程模型，更可快速落地高性能数据访问逻辑。

开发者在实践中应深入理解每类 NoSQL 的特性，结合业务特点进行合理建模、索引优化与资源配置，才能发挥其最大价值。



## 五、动手实践

### Docker准备工作

> https://www.docker.com

访问Docker的官方网站或国内的镜像站，根据网站导航菜单，下载Docker社区版。

Docker 常用命令

```dockerfile
# 镜像相关
docker pull <image>
docker search <image>
# 容器相关
docker run
docker start/stop <容器名>
docker ps <容器名>
docker logs <容器名>
```

`docker run` 的常用选项

```dockerfile
-d # 后台运⾏容器
-e # 设置环境变量
--expose / -p 宿主端⼝:容器端⼝
--name # 指定容器名称
--link # 链接不同容器
-v 宿主⽬录:容器⽬录 # 挂载磁盘卷
```

> 配置镜像

![image-20250615160213025](https://raw.githubusercontent.com/guyuechen/gallery/main/img/202506151602097.png)

```json
{
  "builder": {
    "features": {
      "buildkit": true
    },
    "gc": {
      "defaultKeepStorage": "20GB",
      "enabled": true
    }
  },
  "experimental": false,
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://registry.docker-cn.com",
    "http://hub-mirror.c.163.com",
    "https://mirror.ccs.tencentyun.com"
  ]
}
```

> cmd/powershell中测试

```powershell
wsl -l -v

docker version

docker run hello-world
```

### 启动MongoDB

> 下载镜像

```powershell
docker pull mongo
```

> 运行实例

==Linux==环境的命令：

```sh
docker run --name mongo -p 27017:27017 -v ~/docker-data/mongo:/data/db -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=admin -d mongo
```

如果在==Windows==上，我们需要修改后再执行，主要是修改-v后面的映射目录。理论上我们改成下面这样即可执行（需提前在C盘dev创建两层文件夹docker-data和mongo）。

```sh
docker run --name mongo -p 27017:27017 -v c:/dev/docker-data/mongo:/data/db -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=admin -d mongo
```

然而，在Windows 10环境下这可能是一个巨坑，实际会==出现权限问题==，无法正常启动。

解决办法是，不使用具体的本地目录，而是用Docker的数据卷（Volume），可以理解为虚拟磁盘。

首先，创建数据卷：

```powershell
docker volume create --name mongodata
```

然后，新建并启动容器：

```powershell
docker run --name mongo -p 27017:27017 -v mongodata:/data/db -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=admin -d mongo
```

可用ps命令查看是否启动成功：

```powershell
docker ps
```

登录到 MongoDB 容器中：

```powershell
docker exec -it mongo bash
```

通过 Shell 连接 MongoDB：

```powershell
mongosh -u admin -p admin
```

### 启动Redis

> 下载镜像

```powershell
docker pull redis
```

> 运行实例

```powershell
docker run --name redis -d -p 6379:6379 redis
```

登录到 Redis 容器中：

```powershell
docker exec -it redis bash
```

启动 redis 服务器，打开终端并输入命令`redis-cli`，该命令会连接本地的 redis 服务。

![image-20230716193931328](https://gyc-pic-for-typora.oss-cn-shanghai.aliyuncs.com/img_for_typora/image-20230716193931328.png)

如果需要在远程 redis 服务上执行命令，同样我们使用的也是 `redis-cli` 命令。

```powershell
redis-cli -h host -p port -a password
```

以下实例演示了如何连接到主机为 127.0.0.1，端口为 6379 ，密码为 mypass 的 redis 服务上。

```perl
$redis-cli -h 127.0.0.1 -p 6379 -a "mypass"
redis 127.0.0.1:6379>
redis 127.0.0.1:6379> PING
PONG
```

### 在Spring中访问MongoDB

> 建库

```
use springbucks;
```

> 创建用户

```json
db.createUser(
	{
        user: "springbucks",
        pwd: "springbucks",
        roles: [
            { role: "readWrite", db: "springbucks" }
        ]
    }
);
```

![image-20250615160244697](https://raw.githubusercontent.com/guyuechen/gallery/main/img/202506151602750.png)

> Spring 对 MongoDB 的支持

- Spring Data MongoDB
  - MongoTemplate
  - Repository 支持

> Spring Data MongoDB 的基本用法

注解

- `@Document`
- `@Id`

MongoTemplate

- `save` / `remove`
- `Criteria` / `Query` / `Update`

> Spring Data MongoDB 的 Repository

`@EnableMongoRepositories`

对应接口

- `MongoRepository<T, ID>`
- `PagingAndSortingRepository<T, ID>`
- `CrudRepository<T, ID>`

### 在Spring中访问Redis

> Spring 对 Redis 的支持

- Spring Data Redis
  - 支持的客户端 Jedis / Lettuce
  - RedisTemplate
  - Repository 支持

> Jedis 客户端的简单使用

- Jedis 不是线程安全的
- 通过 JedisPool 获得 Jedis 实例 
- 直接使用 Jedis 中的方法

```java
@Slf4j
@EnableTransactionManagement
@SpringBootApplication
@EnableJpaRepositories
public class SpringBucksApplication implements ApplicationRunner {
	@Autowired
	private CoffeeService coffeeService;
	@Autowired
	private JedisPool jedisPool;
	@Autowired
	private JedisPoolConfig jedisPoolConfig;

	public static void main(String[] args) {
		SpringApplication.run(SpringBucksApplication.class, args);
	}

	@Bean
	@ConfigurationProperties("redis")
	public JedisPoolConfig jedisPoolConfig() {
		return new JedisPoolConfig();
	}

	@Bean(destroyMethod = "close")
	public JedisPool jedisPool(@Value("${redis.host}") String host) {
		return new JedisPool(jedisPoolConfig(), host);
	}

	@Override
	public void run(ApplicationArguments args) throws Exception {
		log.info(jedisPoolConfig.toString());

		try (Jedis jedis = jedisPool.getResource()) {
			coffeeService.findAllCoffee().forEach(c -> {
				jedis.hset("springbucks-menu",
						c.getName(),
						Long.toString(c.getPrice().getAmountMinorLong()));
			});

			Map<String, String> menu = jedis.hgetAll("springbucks-menu");
			log.info("Menu: {}", menu);

			String price = jedis.hget("springbucks-menu", "espresso");
			log.info("espresso - {}",
					Money.ofMinor(CurrencyUnit.of("CNY"), Long.parseLong(price)));
		}
	}
}
```

### Spring的缓存抽象

为不同的缓存提供一层抽象

- 为 Java 方法增加缓存，缓存执行结果
- 支持`ConcurrentMap`、`EhCache`、`Caffeine`、`JCache`（JSR-107）

- 接口
  - `org.springframework.cache.Cache`
  - `org.springframework.cache.CacheManager`

> 基于注解的缓存

`@EnableCaching`

- `@Cacheable`
- `@CacheEvict`
- `@CachePut`
- `@Caching`
- `@CacheConfig`

在 CoffeeService 这层加入缓存

```java
@Slf4j
@Service
@CacheConfig(cacheNames = "coffee")
public class CoffeeService {
    @Autowired
    private CoffeeRepository coffeeRepository;

    @Cacheable
    public List<Coffee> findAllCoffee() {
        return coffeeRepository.findAll();
    }

    @CacheEvict
    public void reloadCoffee() {
    }

    public Optional<Coffee> findOneCoffee(String name) {
        ExampleMatcher matcher = ExampleMatcher.matching()
                .withMatcher("name", exact().ignoreCase());
        Optional<Coffee> coffee = coffeeRepository.findOne(
                Example.of(Coffee.builder().name(name).build(), matcher));
        log.info("Coffee Found: {}", coffee);
        return coffee;
    }
}
```

查看主入口的运行效果

```java
@Slf4j
@EnableTransactionManagement
@SpringBootApplication
@EnableJpaRepositories
@EnableCaching(proxyTargetClass = true)
public class SpringBucksApplication implements ApplicationRunner {
	@Autowired
	private CoffeeService coffeeService;

	public static void main(String[] args) {
		SpringApplication.run(SpringBucksApplication.class, args);
	}

	@Override
	public void run(ApplicationArguments args) throws Exception {
		log.info("Count: {}", coffeeService.findAllCoffee().size());
		for (int i = 0; i < 10; i++) {
			log.info("Reading from cache.");
			coffeeService.findAllCoffee();
		}
		coffeeService.reloadCoffee();
		log.info("Reading after refresh.");
		coffeeService.findAllCoffee().forEach(c -> log.info("Coffee {}", c.getName()));
	}
}
```

```perl
2023-07-23 22:08:08.616  INFO 11920 --- [           main] g.s.springbucks.SpringBucksApplication   : Started SpringBucksApplication in 1.768 seconds (JVM running for 2.221)
2023-07-23 22:08:08.639  INFO 11920 --- [           main] o.h.h.i.QueryTranslatorFactoryInitiator  : HHH000397: Using ASTQueryTranslatorFactory
Hibernate: 
    select
        coffee0_.id as id1_0_,
        coffee0_.create_time as create_t2_0_,
        coffee0_.update_time as update_t3_0_,
        coffee0_.name as name4_0_,
        coffee0_.price as price5_0_ 
    from
        t_coffee coffee0_
2023-07-23 22:08:08.686  INFO 11920 --- [           main] g.s.springbucks.SpringBucksApplication   : Count: 5
2023-07-23 22:08:08.686  INFO 11920 --- [           main] g.s.springbucks.SpringBucksApplication   : Reading from cache.
2023-07-23 22:08:08.686  INFO 11920 --- [           main] g.s.springbucks.SpringBucksApplication   : Reading from cache.
2023-07-23 22:08:08.686  INFO 11920 --- [           main] g.s.springbucks.SpringBucksApplication   : Reading from cache.
2023-07-23 22:08:08.686  INFO 11920 --- [           main] g.s.springbucks.SpringBucksApplication   : Reading from cache.
2023-07-23 22:08:08.686  INFO 11920 --- [           main] g.s.springbucks.SpringBucksApplication   : Reading from cache.
2023-07-23 22:08:08.686  INFO 11920 --- [           main] g.s.springbucks.SpringBucksApplication   : Reading from cache.
2023-07-23 22:08:08.686  INFO 11920 --- [           main] g.s.springbucks.SpringBucksApplication   : Reading from cache.
2023-07-23 22:08:08.686  INFO 11920 --- [           main] g.s.springbucks.SpringBucksApplication   : Reading from cache.
2023-07-23 22:08:08.686  INFO 11920 --- [           main] g.s.springbucks.SpringBucksApplication   : Reading from cache.
2023-07-23 22:08:08.686  INFO 11920 --- [           main] g.s.springbucks.SpringBucksApplication   : Reading from cache.
2023-07-23 22:08:08.686  INFO 11920 --- [           main] g.s.springbucks.SpringBucksApplication   : Reading after refresh.
Hibernate: 
    select
        coffee0_.id as id1_0_,
        coffee0_.create_time as create_t2_0_,
        coffee0_.update_time as update_t3_0_,
        coffee0_.name as name4_0_,
        coffee0_.price as price5_0_ 
    from
        t_coffee coffee0_
2023-07-23 22:08:08.689  INFO 11920 --- [           main] g.s.springbucks.SpringBucksApplication   : Coffee espresso
2023-07-23 22:08:08.689  INFO 11920 --- [           main] g.s.springbucks.SpringBucksApplication   : Coffee latte
2023-07-23 22:08:08.689  INFO 11920 --- [           main] g.s.springbucks.SpringBucksApplication   : Coffee capuccino
2023-07-23 22:08:08.689  INFO 11920 --- [           main] g.s.springbucks.SpringBucksApplication   : Coffee mocha
2023-07-23 22:08:08.689  INFO 11920 --- [           main] g.s.springbucks.SpringBucksApplication   : Coffee macchiato
2023-07-23 22:08:08.690  INFO 11920 --- [       Thread-2] j.LocalContainerEntityManagerFactoryBean : Closing JPA EntityManagerFactory for persistence unit 'default'
2023-07-23 22:08:08.691  INFO 11920 --- [       Thread-2] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Shutdown initiated...
2023-07-23 22:08:08.692  INFO 11920 --- [       Thread-2] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Shutdown completed.
```

> 通过 Spring Boot 配置 Redis 缓存

pom.xml 中引入下面两个依赖

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-cache</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
```

application.properties 中加入如下配置

```properties
spring.cache.type=redis
spring.cache.cache-names=coffee
spring.cache.redis.time-to-live=5000
spring.cache.redis.cache-null-values=false

spring.redis.host=localhost
```

> 通过 Spring Boot 配置 Redis 缓存

在 CoffeeService 这层加入缓存

```java
@Slf4j
@Service
@CacheConfig(cacheNames = "coffee")
public class CoffeeService {
    @Autowired
    private CoffeeRepository coffeeRepository;

    @Cacheable
    public List<Coffee> findAllCoffee() {
        return coffeeRepository.findAll();
    }

    @CacheEvict
    public void reloadCoffee() {
    }

    public Optional<Coffee> findOneCoffee(String name) {
        ExampleMatcher matcher = ExampleMatcher.matching()
                .withMatcher("name", exact().ignoreCase());
        Optional<Coffee> coffee = coffeeRepository.findOne(
                Example.of(Coffee.builder().name(name).build(), matcher));
        log.info("Coffee Found: {}", coffee);
        return coffee;
    }
}
```

查看主入口的运行效果

```java
@Slf4j
@EnableTransactionManagement
@SpringBootApplication
@EnableJpaRepositories
@EnableCaching(proxyTargetClass = true)
public class SpringBucksApplication implements ApplicationRunner {
	@Autowired
	private CoffeeService coffeeService;

	public static void main(String[] args) {
		SpringApplication.run(SpringBucksApplication.class, args);
	}

	@Override
	public void run(ApplicationArguments args) throws Exception {
		log.info("Count: {}", coffeeService.findAllCoffee().size());
		for (int i = 0; i < 5; i++) {
			log.info("Reading from cache.");
			coffeeService.findAllCoffee();
		}
		Thread.sleep(5_000);
		log.info("Reading after refresh.");
		coffeeService.findAllCoffee().forEach(c -> log.info("Coffee {}", c.getName()));
	}
}
```

```perl
2023-07-23 22:17:36.528  INFO 12892 --- [           main] g.s.springbucks.SpringBucksApplication   : Started SpringBucksApplication in 1.827 seconds (JVM running for 2.276)
2023-07-23 22:17:36.576  INFO 12892 --- [           main] io.lettuce.core.EpollProvider            : Starting without optional epoll library
2023-07-23 22:17:36.576  INFO 12892 --- [           main] io.lettuce.core.KqueueProvider           : Starting without optional kqueue library
2023-07-23 22:17:36.823  INFO 12892 --- [           main] o.h.h.i.QueryTranslatorFactoryInitiator  : HHH000397: Using ASTQueryTranslatorFactory
Hibernate: 
    select
        coffee0_.id as id1_0_,
        coffee0_.create_time as create_t2_0_,
        coffee0_.update_time as update_t3_0_,
        coffee0_.name as name4_0_,
        coffee0_.price as price5_0_ 
    from
        t_coffee coffee0_
2023-07-23 22:17:36.880  INFO 12892 --- [           main] g.s.springbucks.SpringBucksApplication   : Count: 5
2023-07-23 22:17:36.881  INFO 12892 --- [           main] g.s.springbucks.SpringBucksApplication   : Reading from cache.
2023-07-23 22:17:36.885  INFO 12892 --- [           main] g.s.springbucks.SpringBucksApplication   : Reading from cache.
2023-07-23 22:17:36.888  INFO 12892 --- [           main] g.s.springbucks.SpringBucksApplication   : Reading from cache.
2023-07-23 22:17:36.889  INFO 12892 --- [           main] g.s.springbucks.SpringBucksApplication   : Reading from cache.
2023-07-23 22:17:36.891  INFO 12892 --- [           main] g.s.springbucks.SpringBucksApplication   : Reading from cache.
2023-07-23 22:17:41.899  INFO 12892 --- [           main] g.s.springbucks.SpringBucksApplication   : Reading after refresh.
Hibernate: 
    select
        coffee0_.id as id1_0_,
        coffee0_.create_time as create_t2_0_,
        coffee0_.update_time as update_t3_0_,
        coffee0_.name as name4_0_,
        coffee0_.price as price5_0_ 
    from
        t_coffee coffee0_
2023-07-23 22:17:41.904  INFO 12892 --- [           main] g.s.springbucks.SpringBucksApplication   : Coffee espresso
2023-07-23 22:17:41.904  INFO 12892 --- [           main] g.s.springbucks.SpringBucksApplication   : Coffee latte
2023-07-23 22:17:41.904  INFO 12892 --- [           main] g.s.springbucks.SpringBucksApplication   : Coffee capuccino
2023-07-23 22:17:41.904  INFO 12892 --- [           main] g.s.springbucks.SpringBucksApplication   : Coffee mocha
2023-07-23 22:17:41.904  INFO 12892 --- [           main] g.s.springbucks.SpringBucksApplication   : Coffee macchiato
2023-07-23 22:17:41.906  INFO 12892 --- [       Thread-2] j.LocalContainerEntityManagerFactoryBean : Closing JPA EntityManagerFactory for persistence unit 'default'
2023-07-23 22:17:41.907  INFO 12892 --- [       Thread-2] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Shutdown initiated...
2023-07-23 22:17:41.908  INFO 12892 --- [       Thread-2] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Shutdown completed.
```

### Redis在Spring中的其他用法

> 与 Redis 建立连接

配置连接工厂

- `LettuceConnectionFactory`（新版本默认） 与 `JedisConnectionFactory`
  - `RedisStandaloneConfiguration`（针对单节点的配置）
  - `RedisSentinelConfiguration`（针对哨兵节点的配置）
  - `RedisClusterConfiguration`（针对集群的配置）

> 读写分离

Lettuce 内置==支持读写分离==

- 只读主、只读从
- 优先读主、优先读从

`LettuceClientConfiguration`（配置 LettuceClient）

`LettucePoolingClientConfiguration`（配置带有池的 LettuceClient）

`LettuceClientConfigurationBuilderCustomizer`

### RedisTemplate（⼀定注意设置过期时间！！！）

`RedisTemplate<K, V>`

- `opsForXxx()`

`StringRedisTemplate`（k/v 都是 String）

> redis-demo 项目实践（沿用了之前第三章的 springbucks）

pom.xml 中引入下面两个依赖

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>

<dependency>
    <groupId>org.apache.commons</groupId>
    <artifactId>commons-pool2</artifactId>
</dependency>
```

application.properties 中加入如下配置

```properties
spring.redis.host=localhost
spring.redis.lettuce.pool.maxActive=5
spring.redis.lettuce.pool.maxIdle=5
```

整个工程里跟之前区别比较大的地方是在 CoffeeService：

```java
@Slf4j
@Service
public class CoffeeService {
    private static final String CACHE = "springbucks-coffee";
    @Autowired
    private CoffeeRepository coffeeRepository;
    @Autowired
    private RedisTemplate<String, Coffee> redisTemplate;

    public List<Coffee> findAllCoffee() {
        return coffeeRepository.findAll();
    }

    public Optional<Coffee> findOneCoffee(String name) {
        HashOperations<String, String, Coffee> hashOperations = redisTemplate.opsForHash();
        if (redisTemplate.hasKey(CACHE) && hashOperations.hasKey(CACHE, name)) {
            log.info("Get coffee {} from Redis.", name);
            return Optional.of(hashOperations.get(CACHE, name));
        }
        ExampleMatcher matcher = ExampleMatcher.matching()
                .withMatcher("name", exact().ignoreCase());
        Optional<Coffee> coffee = coffeeRepository.findOne(
                Example.of(Coffee.builder().name(name).build(), matcher));
        log.info("Coffee Found: {}", coffee);
        if (coffee.isPresent()) {
            log.info("Put coffee {} to Redis.", name);
            hashOperations.put(CACHE, name, coffee.get());
            redisTemplate.expire(CACHE, 1, TimeUnit.MINUTES);
        }
        return coffee;
    }
}
```

查看主入口的运行效果

```java
@Slf4j
@EnableTransactionManagement
@SpringBootApplication
@EnableJpaRepositories
public class SpringBucksApplication implements ApplicationRunner {
	@Autowired
	private CoffeeService coffeeService;

	public static void main(String[] args) {
		SpringApplication.run(SpringBucksApplication.class, args);
	}

	@Bean
	public RedisTemplate<String, Coffee> redisTemplate(RedisConnectionFactory redisConnectionFactory) {
		RedisTemplate<String, Coffee> template = new RedisTemplate<>();
		template.setConnectionFactory(redisConnectionFactory);
		return template;
	}

	@Bean
	public LettuceClientConfigurationBuilderCustomizer customizer() {
		return builder -> builder.readFrom(ReadFrom.MASTER_PREFERRED);
	}

	@Override
	public void run(ApplicationArguments args) throws Exception {
		Optional<Coffee> c = coffeeService.findOneCoffee("mocha");
		log.info("Coffee {}", c);

		for (int i = 0; i < 5; i++) {
			c = coffeeService.findOneCoffee("mocha");
		}

		log.info("Value from Redis: {}", c);
	}
}
```

```perl
2023-07-23 22:29:26.152  INFO 16088 --- [           main] g.s.springbucks.SpringBucksApplication   : Started SpringBucksApplication in 1.888 seconds (JVM running for 2.136)
2023-07-23 22:29:26.203  INFO 16088 --- [           main] io.lettuce.core.EpollProvider            : Starting without optional epoll library
2023-07-23 22:29:26.203  INFO 16088 --- [           main] io.lettuce.core.KqueueProvider           : Starting without optional kqueue library
2023-07-23 22:29:26.539  INFO 16088 --- [           main] o.h.h.i.QueryTranslatorFactoryInitiator  : HHH000397: Using ASTQueryTranslatorFactory
Hibernate: 
    select
        coffee0_.id as id1_0_,
        coffee0_.create_time as create_t2_0_,
        coffee0_.update_time as update_t3_0_,
        coffee0_.name as name4_0_,
        coffee0_.price as price5_0_ 
    from
        t_coffee coffee0_ 
    where
        lower(coffee0_.name)=?
2023-07-23 22:29:26.601  INFO 16088 --- [           main] g.s.springbucks.service.CoffeeService    : Coffee Found: Optional[Coffee(super=BaseEntity(id=4, createTime=2023-07-23 22:29:25.152, updateTime=2023-07-23 22:29:25.152), name=mocha, price=CNY 30.00)]
2023-07-23 22:29:26.601  INFO 16088 --- [           main] g.s.springbucks.service.CoffeeService    : Put coffee mocha to Redis.
2023-07-23 22:29:26.609  INFO 16088 --- [           main] g.s.springbucks.SpringBucksApplication   : Coffee Optional[Coffee(super=BaseEntity(id=4, createTime=2023-07-23 22:29:25.152, updateTime=2023-07-23 22:29:25.152), name=mocha, price=CNY 30.00)]
2023-07-23 22:29:26.611  INFO 16088 --- [           main] g.s.springbucks.service.CoffeeService    : Get coffee mocha from Redis.
2023-07-23 22:29:26.617  INFO 16088 --- [           main] g.s.springbucks.service.CoffeeService    : Get coffee mocha from Redis.
2023-07-23 22:29:26.621  INFO 16088 --- [           main] g.s.springbucks.service.CoffeeService    : Get coffee mocha from Redis.
2023-07-23 22:29:26.625  INFO 16088 --- [           main] g.s.springbucks.service.CoffeeService    : Get coffee mocha from Redis.
2023-07-23 22:29:26.627  INFO 16088 --- [           main] g.s.springbucks.service.CoffeeService    : Get coffee mocha from Redis.
2023-07-23 22:29:26.629  INFO 16088 --- [           main] g.s.springbucks.SpringBucksApplication   : Value from Redis: Optional[Coffee(super=BaseEntity(id=4, createTime=2023-07-23 22:29:25.152, updateTime=2023-07-23 22:29:25.152), name=mocha, price=CNY 30.00)]
2023-07-23 22:29:27.753  INFO 16088 --- [       Thread-2] j.LocalContainerEntityManagerFactoryBean : Closing JPA EntityManagerFactory for persistence unit 'default'
2023-07-23 22:29:27.754  INFO 16088 --- [       Thread-2] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Shutdown initiated...
2023-07-23 22:29:27.755  INFO 16088 --- [       Thread-2] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Shutdown completed.
```

> 运行期间查看 redis 进程

![image-20250615160937028](https://raw.githubusercontent.com/guyuechen/gallery/main/img/202506151609114.png)

### Redis Repository

实体注解

- `@RedisHash`
- `@Id`
- `@Indexed`

> 处理不同类型数据源的 Repository

如何区分这些 Repository？

- 根据实体的注解
- 根据继承的接口类型
- 扫描不同的包

> redis-repository-demo 项目实践（沿用了之前第三章的 springbucks）

pom.xml 中还是引入下面两个依赖

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>

<dependency>
    <groupId>org.apache.commons</groupId>
    <artifactId>commons-pool2</artifactId>
</dependency>
```

application.properties 中还是加入如下配置

```properties
spring.redis.host=localhost
spring.redis.lettuce.pool.maxActive=5
spring.redis.lettuce.pool.maxIdle=5
```

新加入的 CoffeeCache 类

```java
@RedisHash(value = "springbucks-coffee", timeToLive = 60)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CoffeeCache {
    @Id
    private Long id;
    @Indexed
    private String name;
    private Money price;
}
```

新加入的 CoffeeCacheRepository 类

```java
public interface CoffeeCacheRepository extends CrudRepository<CoffeeCache, Long> {
    Optional<CoffeeCache> findOneByName(String name);
}
```

新加入的 2 个 Converter

```java
@ReadingConverter
public class BytesToMoneyConverter implements Converter<byte[], Money> {
    @Override
    public Money convert(byte[] source) {
        String value = new String(source, StandardCharsets.UTF_8);
        return Money.ofMinor(CurrencyUnit.of("CNY"), Long.parseLong(value));
    }
}
```

```java
@WritingConverter
public class MoneyToBytesConverter implements Converter<Money, byte[]> {
    @Override
    public byte[] convert(Money source) {
        String value = Long.toString(source.getAmountMinorLong());
        return value.getBytes(StandardCharsets.UTF_8);
    }
}
```

查看主入口

- 自定义了这个 Bean：RedisCustomConversions
- 记得要加上 @EnableRedisRepositories

```java
@Slf4j
@EnableTransactionManagement
@SpringBootApplication
@EnableJpaRepositories
@EnableRedisRepositories
public class SpringBucksApplication implements ApplicationRunner {
	@Autowired
	private CoffeeService coffeeService;

	public static void main(String[] args) {
		SpringApplication.run(SpringBucksApplication.class, args);
	}

	@Bean
	public LettuceClientConfigurationBuilderCustomizer customizer() {
		return builder -> builder.readFrom(ReadFrom.MASTER_PREFERRED);
	}

	@Bean
	public RedisCustomConversions redisCustomConversions() {
		return new RedisCustomConversions(
				Arrays.asList(new MoneyToBytesConverter(), new BytesToMoneyConverter()));
	}

	@Override
	public void run(ApplicationArguments args) throws Exception {
		Optional<Coffee> c = coffeeService.findSimpleCoffeeFromCache("mocha");
		log.info("Coffee {}", c);

		for (int i = 0; i < 5; i++) {
			c = coffeeService.findSimpleCoffeeFromCache("mocha");
		}

		log.info("Value from Redis: {}", c);
	}
}
```

整个工程里加入缓存的核心位置 CoffeeService：

```java
@Slf4j
@Service
public class CoffeeService {
    @Autowired
    private CoffeeRepository coffeeRepository;
    @Autowired
    private CoffeeCacheRepository cacheRepository;

    public List<Coffee> findAllCoffee() {
        return coffeeRepository.findAll();
    }

    public Optional<Coffee> findSimpleCoffeeFromCache(String name) {
        Optional<CoffeeCache> cached = cacheRepository.findOneByName(name);
        if (cached.isPresent()) {
            CoffeeCache coffeeCache = cached.get();
            Coffee coffee = Coffee.builder()
                    .name(coffeeCache.getName())
                    .price(coffeeCache.getPrice())
                    .build();
            log.info("Coffee {} found in cache.", coffeeCache);
            return Optional.of(coffee);
        } else {
            Optional<Coffee> raw = findOneCoffee(name);
            raw.ifPresent(c -> {
                CoffeeCache coffeeCache = CoffeeCache.builder()
                        .id(c.getId())
                        .name(c.getName())
                        .price(c.getPrice())
                        .build();
                log.info("Save Coffee {} to cache.", coffeeCache);
                cacheRepository.save(coffeeCache);
            });
            return raw;
        }
    }

    public Optional<Coffee> findOneCoffee(String name) {
        ExampleMatcher matcher = ExampleMatcher.matching()
                .withMatcher("name", exact().ignoreCase());
        Optional<Coffee> coffee = coffeeRepository.findOne(
                Example.of(Coffee.builder().name(name).build(), matcher));
        log.info("Coffee Found: {}", coffee);
        return coffee;
    }
}
```

运行效果

```perl
2023-07-23 22:49:48.971  INFO 17676 --- [           main] g.s.springbucks.SpringBucksApplication   : Started SpringBucksApplication in 1.794 seconds (JVM running for 2.182)
2023-07-23 22:49:49.028  INFO 17676 --- [           main] io.lettuce.core.EpollProvider            : Starting without optional epoll library
2023-07-23 22:49:49.029  INFO 17676 --- [           main] io.lettuce.core.KqueueProvider           : Starting without optional kqueue library
2023-07-23 22:49:49.354  INFO 17676 --- [           main] o.h.h.i.QueryTranslatorFactoryInitiator  : HHH000397: Using ASTQueryTranslatorFactory
Hibernate: 
    select
        coffee0_.id as id1_0_,
        coffee0_.create_time as create_t2_0_,
        coffee0_.update_time as update_t3_0_,
        coffee0_.name as name4_0_,
        coffee0_.price as price5_0_ 
    from
        t_coffee coffee0_ 
    where
        lower(coffee0_.name)=?
2023-07-23 22:49:49.411  INFO 17676 --- [           main] g.s.springbucks.service.CoffeeService    : Coffee Found: Optional[Coffee(super=BaseEntity(id=4, createTime=2023-07-23 22:49:48.087, updateTime=2023-07-23 22:49:48.087), name=mocha, price=CNY 30.00)]
2023-07-23 22:49:49.412  INFO 17676 --- [           main] g.s.springbucks.service.CoffeeService    : Save Coffee CoffeeCache(id=4, name=mocha, price=CNY 30.00) to cache.
2023-07-23 22:49:49.444  INFO 17676 --- [           main] g.s.springbucks.SpringBucksApplication   : Coffee Optional[Coffee(super=BaseEntity(id=4, createTime=2023-07-23 22:49:48.087, updateTime=2023-07-23 22:49:48.087), name=mocha, price=CNY 30.00)]
2023-07-23 22:49:49.451  INFO 17676 --- [           main] g.s.springbucks.service.CoffeeService    : Coffee CoffeeCache(id=4, name=mocha, price=CNY 30.00) found in cache.
2023-07-23 22:49:49.454  INFO 17676 --- [           main] g.s.springbucks.service.CoffeeService    : Coffee CoffeeCache(id=4, name=mocha, price=CNY 30.00) found in cache.
2023-07-23 22:49:49.457  INFO 17676 --- [           main] g.s.springbucks.service.CoffeeService    : Coffee CoffeeCache(id=4, name=mocha, price=CNY 30.00) found in cache.
2023-07-23 22:49:49.459  INFO 17676 --- [           main] g.s.springbucks.service.CoffeeService    : Coffee CoffeeCache(id=4, name=mocha, price=CNY 30.00) found in cache.
2023-07-23 22:49:49.461  INFO 17676 --- [           main] g.s.springbucks.service.CoffeeService    : Coffee CoffeeCache(id=4, name=mocha, price=CNY 30.00) found in cache.
2023-07-23 22:49:49.461  INFO 17676 --- [           main] g.s.springbucks.SpringBucksApplication   : Value from Redis: Optional[Coffee(super=BaseEntity(id=null, createTime=null, updateTime=null), name=mocha, price=CNY 30.00)]
2023-07-23 22:49:50.581  INFO 17676 --- [       Thread-2] j.LocalContainerEntityManagerFactoryBean : Closing JPA EntityManagerFactory for persistence unit 'default'
2023-07-23 22:49:50.582  INFO 17676 --- [       Thread-2] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Shutdown initiated...
2023-07-23 22:49:50.583  INFO 17676 --- [       Thread-2] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Shutdown completed.
```

> 运行期间查看 redis 进程

![image-20250615160330728](https://raw.githubusercontent.com/guyuechen/gallery/main/img/202506151603763.png)