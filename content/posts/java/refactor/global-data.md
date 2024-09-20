+++
title = '代码坏味道之全局数据 (Global Data)'
date = 2024-09-20T13:39:34+08:00
categories = ['java']
tags = ['refactor']
+++

**定义**

类变量和单例等可以在代码库的任何一个角落修改的数据

**影响**

- 可以在任何位置进行修改，在使用过程中可能出现意想不到的值，并且没有任何机制可以探测出哪段代码进行了修改，导致定位困难

**改进目标**

- 降低代码耦合性，保持代码清晰，维护简单，降低由于对全局数据随意的改变引发bug的风险

**方法**

- 封装变量
- 提炼函数

> 案例：类的静态属性

**代码背景**

- ClassStudentsInfo类有两个public静态变量，ClassStudentsInfo用于存放班级和学生信息；ClassNumUpLimit用于保存班级的数量上限；
- ClassManage类主要是用于管理班级信息；

**症状/问题**

- 虽然我们的意图是想要通过ClassManage类来对这两个变量进行统一管理，但是由于是全局变量，我们可以在系统中的任何位置对其访问并修改。

```java
/**
 * 班级学生信息
 *
 * @author q00521996
 * @since 2021-11-04
 */
public class ClassStudentsInfo {
    /**
     * 班级、学生信息Map，key为班级名称，value为班级中的学生
     */
    public static Map<String, Students> classStudentsInfo = new HashMap<>();

    /**
     * 班级总数上限
     */
    public static int classNumUpLimit = 3;
}
```

```java
/***
 * class信息管理类
 * 
 * @author q00521996
 * @since 2021-11-01
 */
public class ClassManage {
    private final ClassOtherInfoProcessor classOtherInfoProcessor = new ClassOtherInfoProcessor();

    /**
     * 添加班级
     * 
     * @param className 班级名称
     */
    public void addClassInfo(String className) {
        if (className == null) {
            throw new IllegalArgumentException("className is null");
        }

        if (classStudentsInfo.containsKey(className)) {
            throw new IllegalArgumentException("class already exist");
        }

        if (classStudentsInfo.size() >= classNumUpLimit) {
            throw new IllegalArgumentException("the number of classes has reached upLimit");
        }

        classStudentsInfo.put(className, new Students(new ArrayList<>()));
        classOtherInfoProcessor.someProcess(className);
    }

    /**
     * 为班级添加学生
     *
     * @param className 班级名称
     * @param studentNames 学生姓名
     */
    public void addStudentsInfo(String className, List<String> studentNames) {
        if (className == null || studentNames == null) {
            throw new IllegalArgumentException("className or studentNames is null");
        }

        if (!classStudentsInfo.containsKey(className)) {
            throw new IllegalArgumentException("class not exist");
        }

        classStudentsInfo.get(className).addStudents(studentNames);
        classOtherInfoProcessor.someProcess(studentNames);
    }

    /**
     * 获取某班级的学生
     * 
     * @param className 班级名称
     * @return 班上的学生
     */
    public List<String> getStudentsInfo(String className) {
        if (className == null) {
            throw new IllegalArgumentException("className is null");
        }

        return classStudentsInfo.containsKey(className)
            ? classStudentsInfo.get(className).getStudentNames()
            : new ArrayList<>();
    }
}
```

**坏味道影响**

- 在main函数中无意间修改了全局变量ClassNumUplimit的值，这将导致后续添加操作失败。
- 在someProcess函数中本意是要调用局部变量classStudentInfo，由于和全局变量 classStudentsInfo过于相似，无意间调用全局变量，最终导致了意想不到的错误。

```java
/**
 * 模拟Client端调用
 *
 * @author q00521996
 * @since 2021-11-02
 */
public class Client {
    public static void main(String[] args) {
        ClassManage classManage = new ClassManage();

        classManage.addClassInfo("class1");
        classManage.addStudentsInfo("class1", Arrays.asList("ZhangSan", "LiSi"));
        classManage.addStudentsInfo("class1", Arrays.asList("WangWu", "ZhaoLiu"));
        System.out.println(classManage.getStudentsInfo("class1"));

        // classNumUpLimit = 0; // 客户端任意位置都可以随意改变系统行为和功能，
        classManage.addClassInfo("class2");
        classManage.addStudentsInfo("class2", Arrays.asList("XiaoMing", "XiaoZhang"));
        System.out.println(classManage.getStudentsInfo("class2"));
    }
}
```

```java
/**
 * 模拟其他模块对班级相关信息的处理逻辑
 *
 * @author q00521996
 * @since 2021-11-02
 */
public class ClassOtherInfoProcessor {
    private Map<String, String> classStudentInfo;

    /**
     * 表示对班级信息的某些处理，具体略
     * 
     * @param className 班级名称
     */
    public void someProcess(String className) {
        // process……
        // classStudentsInfo = new HashMap<>(); // 程序其他位置可能无意中引入令人迷惑的修改
        // process……
    }

    /**
     * 表示对学生的某些处理，具体略
     * 
     * @param studentNames 学生姓名
     */
    public void someProcess(List<String> studentNames) {
        // process……
        // classStudentsInfo.put("class1", null); // 程序其他位置可能无意中引入令人迷惑的修改
        // process……
    }
}
```

> 改进手法：封装变量

先把对全局变量的操作搬移到一个类中，然后把全局变 量变为private，将对静态变量的访问都封装在一个类中，从而消除全局变量；
对于外部不需要访问的全局数据可以直接封装成private或常量。

```java
/**
 * 班级学生信息
 *
 * @author q00521996
 * @since 2021-11-04
 */
public class ClassStudentsInfo {
    /**
     * 班级、学生信息Map，key为班级名称，value为班级中的学生
     */
    private static final Map<String, Students> CLASS_STUDENTS_INFO = new HashMap<>();

    /**
     * 班级总数上限
     */
    private static final int CLASS_NUM_UP_LIMIT = 3;

    public List<String> getStudents(String className) {
        return CLASS_STUDENTS_INFO.containsKey(className)
            ? CLASS_STUDENTS_INFO.get(className).getStudentNames()
            : new ArrayList<>();
    }

    public void addStudents(String className, List<String> studentNames) {
        if (!CLASS_STUDENTS_INFO.containsKey(className)) {
            throw new IllegalArgumentException("class not exist");
        }

        CLASS_STUDENTS_INFO.get(className).addStudents(studentNames);
    }

    public void addOneClass(String className) {
        if (CLASS_STUDENTS_INFO.containsKey(className)) {
            throw new IllegalArgumentException("class already exist");
        }

        if (CLASS_STUDENTS_INFO.size() >= CLASS_NUM_UP_LIMIT) {
            throw new IllegalArgumentException("the number of classes has reached upLimit");
        }

        CLASS_STUDENTS_INFO.put(className, new Students(new ArrayList<>()));
    }
}
```

```java
/***
 * class信息管理类
 * 
 * @author q00521996
 * @since 2021-11-01
 */
public class ClassManage {
    private final ClassOtherInfoProcessor classOtherInfoProcessor = new ClassOtherInfoProcessor();

    private final ClassStudentsInfo classStudentsInfo = new ClassStudentsInfo();

    /**
     * 添加班级
     * 
     * @param className 班级名称
     */
    public void addClassInfo(String className) {
        if (className == null) {
            throw new IllegalArgumentException("className is null");
        }

        classStudentsInfo.addOneClass(className);
        classOtherInfoProcessor.someProcess(className);
    }

    /**
     * 为班级添加学生
     *
     * @param className 班级名称
     * @param studentNames 学生姓名
     */
    public void addStudentsInfo(String className, List<String> studentNames) {
        if (className == null || studentNames == null) {
            throw new IllegalArgumentException("className or studentNames is null");
        }

        classStudentsInfo.addStudents(className, studentNames);
        classOtherInfoProcessor.someProcess(studentNames);
    }

    /**
     * 获取某班级的学生
     * 
     * @param className 班级名称
     * @return 班上的学生
     */
    public List<String> getStudentsInfo(String className) {
        if (className == null) {
            throw new IllegalArgumentException("className is null");
        }

        return classStudentsInfo.getStudents(className);
    }
}
```

> 操作手法

| 操作           | 快捷键（推荐） | Ctrl+Alt+Shift+T（或：鼠标右键“Refactor”） |
| -------------- | -------------- | ------------------------------------------ |
| 提炼函数       | Ctrl+Alt+M     | Extract Method                             |
| 搬移静态成员   | F6             | Move Static Members                        |
| 转换为实例方法 |                | Convert To Instance Method                 |
| 抽取字段       | Ctrl+Alt+F     | Introduce Field                            |
