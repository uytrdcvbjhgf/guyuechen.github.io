+++
title = '代码坏味道之基本类型偏执 (Primitive Obsession)'
date = 2024-10-13T18:23:07+08:00
categories = ['java']
tags = ['refactor']
+++
---

**定义**

对于具有意义的业务概念如钱、坐标、范围等，不愿意进行建模，而是使用基本数据类型进行表示

**影响**

- 暴露较多细节
- 代码内聚性差
- 可读性差

**改进目标**

- 消除基本类型
- 提升代码可修改性、内聚性、可读性

**方法**

- 对象取代基本类型
- 子类取代类型
- 多态取代条件表达式
- 提炼类
- 引入参数对象

> 案例：基本类型偏执对可维护性、可读性的影响


**代码背景**

- 描述了飞机按照航线类型飞行的业务；
- 航线包含坐标集合、类型；
- 航线坐标包含2个int数值；
- 飞行前需要校验航线，不同航线类型校验内容不同

**症状/问题**

- 内聚性、可读性差，对外暴露了内部细节，如坐标的数据结构、航线校验逻辑，代码层次不清晰
- 通过航线类型字符串区分不同航班执行不同校验逻辑， 后续增加航线类型时需要修改fly方法，方法会越来越复杂，可维护性差

**重构目标**

- 提炼坐标、航线对象代替基本类型，并封装相关逻辑
- 消除航线类型的字符串条件表达式

```java
/**
 * 飞机航线
 */
public class Plane {
    private final Logger logger;

    public Plane(Logger logger) {
        this.logger = logger;
    }

    public void fly(List<int[]> airLine, String airLineType) {
        for (int[] coordinate : airLine) {
            if (coordinate.length != 2) {
                throw new IllegalArgumentException("Air line is invalid.");
            }
            if ("domestic".equals(airLineType)) { // 国内航班
                if (coordinate[0] < 0 || coordinate[0] >= 100) {
                    throw new IllegalArgumentException("Air line is invalid.");
                }
                if (coordinate[1] < 0 || coordinate[1] >= 100) {
                    throw new IllegalArgumentException("Air line is invalid.");
                }
            }
            if ("international".equals(airLineType)) { // 国际航班
                if (coordinate[0] < 100) {
                    throw new IllegalArgumentException("Air line is invalid.");
                }
                if (coordinate[1] < 100) {
                    throw new IllegalArgumentException("Air line is invalid.");
                }
            }
        }
        airLine.forEach(this::fly);
    }

    private void fly(int[] coordinate) {
        logger.info(MessageFormat.format("Fly to ({0},{1})", coordinate[0], coordinate[1]));
    }
}
```

> 改进手法：提炼航线对象、提炼航线接口并用多态取代表达式、提炼坐标对象并封装入参细节


```java
/**
 * 飞机航线
 */
public class Plane {
    private final Logger logger;

    public Plane(Logger logger) {
        this.logger = logger;
    }

    public void fly(AirLine airLine) {
        airLine.validate();
        airLine.getCoordinates().forEach(this::fly);
    }

    private void fly(Coordinate coordinate) {
        logger.info(MessageFormat.format("Fly to ({0},{1})", coordinate.getX(), coordinate.getY()));
    }
}
```

```java
public interface AirLine {
    String DOMESTIC = "domestic";
    String INTERNATIONAL = "international";

    String getAirLineType();

    List<Coordinate> getCoordinates();

    void validate();
}
```

```java
public abstract class AbstractAirLine implements AirLine {

    private final String airLineType;

    private final List<Coordinate> coordinates;

    AbstractAirLine(String airLineType, List<Coordinate> coordinates) {
        this.airLineType = airLineType;
        this.coordinates = coordinates;
    }

    @Override
    public String getAirLineType() {
        return airLineType;
    }

    @Override
    public List<Coordinate> getCoordinates() {
        return coordinates;
    }

    @Override
    public void validate() {
        for (Coordinate coordinate : getCoordinates()) {
            coordinate.validateLength();
            validateCoordinate(coordinate);
        }
    }

    protected abstract void validateCoordinate(Coordinate coordinate);
}
```

```java
public class DomesticAirLine extends AbstractAirLine {
    public DomesticAirLine(List<Coordinate> coordinates) {
        super(DOMESTIC, coordinates);
    }

    @Override
    protected void validateCoordinate(Coordinate coordinate) {
        if (coordinate.getX() < 0 || coordinate.getX() >= 100) {
            throw new IllegalArgumentException("Air line is invalid.");
        }
        if (coordinate.getY() < 0 || coordinate.getY() >= 100) {
            throw new IllegalArgumentException("Air line is invalid.");
        }
    }
}
```

```java
public class InternationalAirLine extends AbstractAirLine {
    public InternationalAirLine(List<Coordinate> coordinates) {
        super(INTERNATIONAL, coordinates);
    }

    @Override
    protected void validateCoordinate(Coordinate coordinate) {
        if (coordinate.getX() < 100) {
            throw new IllegalArgumentException("Air line is invalid.");
        }
        if (coordinate.getY() < 100) {
            throw new IllegalArgumentException("Air line is invalid.");
        }
    }
}
```

```java
public class AirLineFactory {
    public static AbstractAirLine createAbstractAirLine(String airLineType, List<Coordinate> coordinates) {
        if (AirLine.DOMESTIC.equals(airLineType)) {
            return new DomesticAirLine(coordinates);
        }
        if (AirLine.INTERNATIONAL.equals(airLineType)) {
            return new InternationalAirLine(coordinates);
        }
        return null;
    }
}
```

```java
public class Coordinate {
    private final int[] coordinate;

    public Coordinate(int[] coordinate) {
        this.coordinate = coordinate;
    }

    public int[] getCoordinate() {
        return coordinate;
    }

    void validateLength() {
        if (getCoordinate().length != 2) {
            throw new IllegalArgumentException("Air line is invalid.");
        }
    }

    int getX() {
        return getCoordinate()[0];
    }

    int getY() {
        return getCoordinate()[1];
    }
}
```

![](https://gyc-pic-for-typora.oss-cn-shanghai.aliyuncs.com/img_for_typora/846b31af98bce11bdf12a3dee2e7e2df.svg)

> 操作手法

| 操作                                   | 快捷键（推荐）               | Ctrl+Alt+Shift+T（或：鼠标右键“Refactor”） |
| -------------------------------------- | ---------------------------- | ------------------------------------------ |
| 引入参数对象                           |                              | Introduce Parameter Object                 |
| 子类取代类型码（创建子类）             | Alt+Enter -> Create subclass | Move Static Members                        |
| 子类取代类型码（工厂方法代替构造方法） |                              | Replace Constructor With Factory Method    |
| 多态取代表达式（提取接口）             |                              | Extract Interface                          |
| 多态取代表达式（上推成员方法、变量）   |                              | Pull Member Up                             |
| 多态取代表达式（下推成员方法、变量）   |                              | Push Member Down                           |
