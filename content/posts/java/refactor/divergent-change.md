+++
title = '代码坏味道之发散式变化 (Divergent Change)'
date = 2024-09-25T20:03:27+08:00
categories = ['java']
tags = ['refactor']
+++

**定义**

某个模块经常因为不同的原因在不同的方向上发生变化

**影响**

- 通常，发散式变化是由于多个变化方向之间有较多的来回调用或者函数内部混合了多类处理逻辑。当处于多个不同上下文的外部行为发生变化时候，都 会引起对同一个类或模块的修改，影响了代码的可读和可维护性。

**改进目标**

- 提高代码组织结构、 职责单一提升代码可读性、可维护性

**方法**

- 拆分阶段
- 搬移函数
- 提炼函数
- 提炼类

> 案例

**代码背景**

- TheatricalPlayers为戏剧演员类，拥有戏剧类型，开取发票信息，演出业务信息等相关逻辑数据存取处理
- 在getInvoiceData方法中，开取发票信息，会首先从数据库拿到演出信息，再计算演出场次、薪酬、积分等信息

**症状/问题**

- PlayType 在TheatricalPlayers 类中定义使用，同时被 TheatricalPlayers类中引入的Performance类使用，造成循环引用。
- 外部三方数据库组件，在变更配置，创建操作修改时都会导致TheatricalPlayers类中发散式变化。
- getInvoiceData函数职责不单一，当从数据库获取Performance信息的方式以及totalAmout 和volumeCerdits的计算方式和打印格式发生变化时，都会导致TheatricalPlayers类中发散式变化。

```java
/**
 * 戏剧演员
 *
 * @author y00512616 yangchanglin
 * @since 2021-10-30
 */
public class TheatricalPlayers {
    private static MysqlConnection mysqlConnection;

    /**
     * 创建数据库连接
     * 
     * @param mysqlConfig 数据库配置信息
     */
    public static void createConnection(MysqlConfig mysqlConfig) {
        if (mysqlConnection != null) {
            return;
        }
        mysqlConnection = new MysqlConnection();
        mysqlConnection.connect(mysqlConfig);
    }

    /**
     * 剧种类别
     */
    public enum PlayType {
        COMEDY,
        TRAGEDY
    }

    /**
     * 获取发票信息
     * 
     * @param playerId 演员id
     * @return 发票信息
     */
    public String getInvoiceData(long playerId) {
        List<Performance> performances = getPerformances(playerId);

        int totalAmount = 0;
        int volumeCredits = 0;

        NumberFormat format = NumberFormat.getCurrencyInstance(Locale.US);
        String result = String.format("Statement for %s\n", playerId);
        result += String.format("Performances you've participated in :%s\n",
            performances.stream().map(Performance::getName).collect(Collectors.toList()));

        for (Performance perf : performances) {
            int thisAmount = 40000;
            if (perf.getAudienceNum() > 30) {
                thisAmount += 1000 * (perf.getAudienceNum() - 30);
            }
            totalAmount += thisAmount;

            int thisCredits = Math.max(perf.getAudienceNum() - 30, 0);
            if (PlayType.COMEDY.equals(perf.getType())) {
                thisCredits += Math.floor((double) perf.getAudienceNum() / 5);
            }
            volumeCredits += thisCredits;
        }

        result += String.format("You earned %s\n", format.format(totalAmount / 100));
        result += String.format("You earned %s credits\n", volumeCredits);
        return result;
    }

    /**
     * 某类涉及数据库操作的业务处理
     * 
     * @param someParam 某参数
     * @param performances 演出信息
     */
    public void someBusinessProcess(long someParam, List<Performance> performances) {
        // do some business
        addPerformances(someParam, performances);
        // do some business
        updatePerformances(performances);
    }

    /**
     * 更新演出信息（具体sql略）
     * 
     * @param performances 演出信息
     */
    public void updatePerformances(List<Performance> performances) {
        String sql = "update xxx set xxxx …… " + performances;
        mysqlConnection.update(sql);
    }

    /**
     * 查询演出信息（具体sql略）
     *
     * @param playerId id
     * @return 演出信息
     */
    public List<Performance> getPerformances(long playerId) {
        String sql = "select xxx where playerId = " + playerId;
        return mysqlConnection.queryList(sql, Performance.class);
    }

    /**
     * 添加演出（具体略）
     * 
     * @param someId 某id
     * @param performances 演出
     */
    public void addPerformances(long someId, List<Performance> performances) {
        String sql = "insert into xxx …… " + performances + "xxx" + someId;
        mysqlConnection.update(sql);
    }
}
```

> 改进手法

**案例的改进路线**

- 将独立的枚举类PlayType提炼为公共类，避免循环引用
- 对于数据库连接的操作运用提炼函数和搬移函数手法，提炼出接口和实现类
- 对于先后发生变化的totalAmount，voluemCredits，InvoiceData打印，通过拆分阶段和提炼函数进行解耦，职责单一

```java
/**
 * 剧种类别
 */
public enum PlayType {
    COMEDY,
    TRAGEDY
}
```

```java
/**
 * 戏剧演员
 *
 * @author y00512616 yangchanglin
 * @since 2021-10-30
 */
public class TheatricalPlayers {
    private static MysqlConnection mysqlConnection;

    /**
     * 创建数据库连接
     * 
     * @param mysqlConfig 数据库配置信息
     */
    public static void createConnection(MysqlConfig mysqlConfig) {
        if (mysqlConnection != null) {
            return;
        }
        mysqlConnection = new MysqlConnection();
        mysqlConnection.connect(mysqlConfig);
    }



    /**
     * 剧种类别
     */
    public enum PlayType {
        COMEDY,
        TRAGEDY;
    }
    /**
     * 获取发票信息
     *
     * @param playerId 演员id
     * @return 发票信息
     */
    public String getInvoiceData(long playerId) {
        List<Performance> performances = getPerformances(playerId);

        return new InVoice(playerId, performances).getInvoiceDetail();
    }

    /**
     * 某类涉及数据库操作的业务处理
     * 
     * @param someParam 某参数
     * @param performances 演出信息
     */
    public void someBusinessProcess(long someParam, List<Performance> performances) {
        // do some business
        addPerformances(someParam, performances);
        // do some business
        updatePerformances(performances);
    }

    /**
     * 更新演出信息（具体sql略）
     * 
     * @param performances 演出信息
     */
    public void updatePerformances(List<Performance> performances) {
        String sql = "update xxx set xxxx …… " + performances;
        mysqlConnection.update(sql);
    }

    /**
     * 查询演出信息（具体sql略）
     *
     * @param playerId id
     * @return 演出信息
     */
    public List<Performance> getPerformances(long playerId) {
        String sql = "select xxx where playerId = " + playerId;
        return mysqlConnection.queryList(sql, Performance.class);
    }

    /**
     * 添加演出（具体略）
     * 
     * @param someId 某id
     * @param performances 演出
     */
    public void addPerformances(long someId, List<Performance> performances) {
        String sql = "insert into xxx …… " + performances + "xxx" + someId;
        mysqlConnection.update(sql);
    }
}
```

```java
public interface PerformanceRepository {
    void updatePerformances(List<Performance> performances);

    void addPerformances(long someId, List<Performance> performances);

    List<Performance> getPerformances(long playerId);
}
```

```java
public class PerformanceRepositoryImpl implements PerformanceRepository {
    private static MysqlConnection mysqlConnection;

    /**
     * 创建数据库连接
     *
     * @param mysqlConfig 数据库配置信息
     */
    public static void createConnection(MysqlConfig mysqlConfig) {
        if (mysqlConnection != null) {
            return;
        }
        mysqlConnection = new MysqlConnection();
        mysqlConnection.connect(mysqlConfig);
    }

    /**
     * 更新演出信息（具体sql略）
     *
     * @param performances 演出信息
     */
    @Override
    public void updatePerformances(List<Performance> performances) {
        String sql = "update xxx set xxxx …… " + performances;
        mysqlConnection.update(sql);
    }

    /**
     * 添加演出（具体略）
     *
     * @param someId 某id
     * @param performances 演出
     */
    @Override
    public void addPerformances(long someId, List<Performance> performances) {
        String sql = "insert into xxx …… " + performances + "xxx" + someId;
        mysqlConnection.update(sql);
    }

    /**
     * 查询演出信息（具体sql略）
     *
     * @param playerId id
     * @return 演出信息
     */
    @Override
    public List<Performance> getPerformances(long playerId) {
        String sql = "select xxx where playerId = " + playerId;
        return mysqlConnection.queryList(sql, Performance.class);
    }
}
```

```java
public class InVoice {
    private final long playerId;

    private final List<Performance> performances;

    public InVoice(long playerId, List<Performance> performances) {
        this.playerId = playerId;
        this.performances = performances;
    }

    public long getPlayerId() {
        return playerId;
    }

    public List<Performance> getPerformances() {
        return performances;
    }

    public String getInvoiceDetail() {
        int totalAmount = getPerformances().stream().mapToInt(Performance::getThisAmount).sum();

        int volumeCredits = getPerformances().stream().mapToInt(Performance::getThisCredits).sum();

        return printInvoiceData(totalAmount, volumeCredits);
    }

    public String printInvoiceData(int totalAmount, int volumeCredits) {
        NumberFormat format = NumberFormat.getCurrencyInstance(Locale.US);
        String result = String.format("Statement for %s\n", getPlayerId());
        result += String.format("Performances you've participated in :%s\n",
            getPerformances().stream().map(Performance::getName).collect(Collectors.toList()));
        result += String.format("You earned %s\n", format.format(totalAmount / 100));
        result += String.format("You earned %s credits\n", volumeCredits);
        return result;
    }
}
```

> 操作手法

| 操作                 | 快捷键（推荐）      | Ctrl+Alt+Shift+T（或：鼠标右键“Refactor”） |
| -------------------- | ------------------- | ------------------------------------------ |
| 提炼函数             | Ctrl+Alt+M          | Extract Method                             |
| 实例 / 静态方法搬移  | F6                  | Move Instance Method / Move Static Members |
| 内联                 | Ctrl+Atl+N          | Inline Method                              |
| 实例方法变为静态方法 |                     | Make Static                                |
| 静态方法变为实例方法 | Ctrl+F6 / Alt+Enter | Convert To Instance Method                 |
| 引入参数对象         |                     | Introduce Parameter Object                 |
| 提取字段/参数/变量   | Ctrl+Alt+F/P/V      | Introduce Field/Parameter/Variable         |
| 提炼接口             |                     | Extract Interface                          |
