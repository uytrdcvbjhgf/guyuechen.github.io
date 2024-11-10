+++
title = '代码坏味道之内幕交易 (Insider Trading)'
date = 2024-10-13T18:34:28+08:00
categories = ['java']
tags = ['refactor']
+++

**定义**

模块之间互相引用，私下直接进行大量的数据访问和交换

**影响**

- 增大模块间的耦合，容易导致循环依赖，加快架构腐化，甚至会朝着大泥球式的架构发展，严重影响可维护性

**改进目标**

- 消除模块间不合理的依赖关系（特别是循环依赖），将私下的数据访问和交换放到明面上，使模块间解耦，提高可维护性

**方法**

- 搬移函数
- 搬移字段
- 隐藏委托关系
- 以委托取代子类/超类

> 案例：问题代码

**代码背景**
简化的学生选课系统，主要功能包括：

- 添加学生信息
- 添加课程信息
- 添加学生选课信息（课程和学生之间的映射，多对多关系）
- 学生选课信息查询

Student维护了单门课程和单个学生的个人信息；
两个Manager包含了多个Student和Course对象，负责学生和 课程信息的添加、映射关系的创建、以及选课信息的查询；
CourseSelectionManager负责内部Manager的统一创建和管理；
CourseSelectionSystemApi包含了对外提供的接口。

```java
/**
 * 选课系统管理
 */
public class CourseSelectionManager {
    /**
     * 学生信息管理
     */
    protected final StudentManager studentManager = new StudentManager();

    /**
     * 课程信息管理
     */
    protected final CourseManager courseManager = new CourseManager();
}
```

```java
/**
 * 选课管理系统对外api
 */
public class CourseSelectionSystemApi extends CourseSelectionManager {
    /**
     * 批量导入学生信息
     * 
     * @param students 学生
     */
    public void importStudents(List<Student> students) {
        studentManager.importStudents(students);
    }

    /**
     * 批量导入课程信息
     * 
     * @param courses 课程信息
     */
    public void importCourses(List<Course> courses) {
        courseManager.importCourses(courses);
    }

    /**
     * 学生选课
     * 
     * @param studentId 学生ID
     * @param courseNames 课程名称
     */
    public void assignCourses(int studentId, List<String> courseNames) {
        studentManager.assignCourses(courseManager, studentId, courseNames);
    }

    /**
     * 查询学生所选课程
     * 
     * @param studentId 学生ID
     * @return 学生所选课程
     */
    public List<Course> queryStudentSelectCourses(int studentId) {
        return studentManager.queryStudentSelectCourses(studentId);
    }

    /**
     * 查询某学生某门课程的老师
     * 
     * @param studentId 学生ID
     * @param courseName 课程名称
     * @return 老师名
     */
    public String queryStudentCourseTeacher(int studentId, String courseName) {
        return courseManager.queryStudentCourseTeacher(studentManager, studentId, courseName);
    }

    /**
     * 统计指定课程某性别学生数量
     * 
     * @param courseName 课程名称
     * @param gender 性别
     * @return 学生数目
     */
    public long statisticStudentByGender(String courseName, Gender gender) {
        return courseManager.statisticStudentByGender(courseName, gender);
    }
}
```

**症状/问题**

不合理的继承体系常会造成“密谋”，子类直接操作父类中的属性、字段等，加重了两个模块之间的耦合

- CourseSelectionSystemApi中封装的是对外暴露的接口，而CourseSelectionManager负责的是内部数据的操作和管理，二者不在一个层次，不应该直接通过继承来实现数据的访问和传递。

**重构目标**

- 消除不合理的继承体系，合理封装属性、字段、方法等，使用委托进行对象间的访问和调用

> 改进手法：
> 以委托取代子类/超类，消除CourseSelectionSystemApi和CourseSelectionManager之间不合理的继承关系
> 隐藏委托关系，将内部的manager隐藏起来，不对api层体现

注：继承是最常见的关系之一，这里提出的问题和重构手法，仅针对的是业务上不合理的继承关系

```java
/**
 * 课程管理
 */
public class CourseManager {
    private static final List<Course> COURSES = new ArrayList<>();

    private static final Map<String, List<Student>> COURSE_STUDENTS_MAP = new HashMap<>();

    /**
     * 批量导入课程
     * 
     * @param courses 课程名称
     */
    public void importCourses(List<Course> courses) {
        courses.stream()
            .filter(course -> COURSES.stream().noneMatch(c -> c.getName().equals(course.getName())))
            .forEachOrdered(COURSES::add);
    }

    /**
     * 查询课程信息
     * 
     * @param courseName 课程名称
     * @return 课程信息
     */
    public Course queryCourse(String courseName) {
        return COURSES.stream()
            .filter(course -> course.getName().equals(courseName))
            .findFirst()
            .orElse(null);
    }

    /**
     * 查询某学生某课程的老师
     * 
     * @param studentManager 学生信息管理
     * @param studentId 学生id
     * @param courseName 课程名称
     * @return 某学生某课程的老师
     */
    public String queryStudentCourseTeacher(StudentManager studentManager, int studentId, String courseName) {
        Optional<Course> course =
            studentManager
                .queryStudentSelectCourses(studentId)
                .stream()
                .filter(selectedCourse -> selectedCourse.getName().equals(courseName))
                .findFirst();
        return course.isPresent() ? course.get().getTeacher() : "no teacher info";
    }

    /**
     * 为某课程增加一位学生
     * 
     * @param courseName 课程名称
     * @param student 学生
     */
    public void addStudentInCourse(String courseName, Student student) {
        COURSE_STUDENTS_MAP.computeIfAbsent(courseName, k -> new ArrayList<>()).add(student);
    }

    /**
     * 统计指定课程某性别学生数量
     *
     * @param courseName 课程名称
     * @param gender 性别
     * @return 学生数目
     */
    public long statisticStudentByGender(String courseName, Gender gender) {
        return COURSE_STUDENTS_MAP.getOrDefault(courseName, new ArrayList<>())
            .stream()
            .filter(student -> student.getGender().equals(gender))
            .count();
    }
}
```

```java
/**
 * 学生管理类
 */
public class StudentManager {
    private static final List<Student> STUDENTS = new ArrayList<>();

    private static final Map<Integer, List<Course>> STUDENT_COURSE_MAP = new HashMap<>();

    /**
     * 批量导入学生信息
     *
     * @param students 学生
     */
    public void importStudents(List<Student> students) {
        students.stream()
            .filter(student -> STUDENTS.stream().noneMatch(s -> s.getId() == student.getId()))
            .forEachOrdered(STUDENTS::add);
    }

    /**
     * 学生信息查询
     * 
     * @param studentId 学生ID
     * @return 学生信息
     */
    public Student queryStudent(int studentId) {
        return STUDENTS.stream()
            .filter(student -> student.getId() == studentId)
            .findFirst()
            .orElse(null);
    }

    /**
     * 查询某学生选择的课程
     * 
     * @param studentId 学生ID
     * @return 选择的课程
     */
    public List<Course> queryStudentSelectCourses(int studentId) {
        return STUDENT_COURSE_MAP.getOrDefault(studentId, new ArrayList<>());
    }

    /**
     * 学生选课
     *
     * @param courseManager 课程信息管理
     * @param studentId 学生ID
     * @param courseNames 课程名称
     */
    public void assignCourses(CourseManager courseManager, int studentId, List<String> courseNames) {
        if (courseNames == null || courseNames.isEmpty()) {
            return;
        }
        selectCourse(courseManager, studentId, courseNames);
        courseNames.forEach(courseName -> courseManager.addStudentInCourse(courseName, queryStudent(studentId)));
    }

    private void selectCourse(CourseManager courseManager, int studentId, List<String> courseNames) {
        courseNames.stream()
            .map(courseManager::queryCourse)
            .filter(Objects::nonNull)
            .forEachOrdered(
                course -> STUDENT_COURSE_MAP.computeIfAbsent(studentId, k -> new ArrayList<>()).add(course));
    }
}
```

**症状/问题**

模块间私下、频繁的数据交换，会导致循环依赖的产生，使软件可维护性变差，架构迅速腐化，最终演变为大泥球架构

- CourseManager中引入了student包下的Student对象，StudentManager中引入了course包下的Course对象，产生了 包级别的循环依赖
- CourseManage方法里直接引入了StudentManager对象，而StudentManager也直接引入了CourseManager，两个类之间循环依赖

**重构目标**

- 解除循环依赖，提升可读、可维护性。通过搬移函数和字段，将属于各自模块的功能搬移到一起，减少私下的数据访问和交换；对于无法避免的依赖，可引入新的模块作为中介，将访问和交换放到明面上。

> 改进手法：搬移函数/段
> 通过转换为static（便于搬移）、搬移字段、函数等手法，将各自模块的数据尽可能移动到一起，消除模块间的循环依赖
> 继续通过搬移字段、搬移函数、转换为instance方法等重构手法，将 student 、course 两个模 块共同的行为搬移到新的模块CourseSelectionManager中，消除潜在的循环依赖风险，且将student和course完全解耦

![](https://raw.githubusercontent.com/guyuechen/gallery/main/img/4e1b54f68b81f7acc4bbc6dbe3176b2f.svg)![](https://raw.githubusercontent.com/guyuechen/gallery/main/img/eddaa382b3a43433d6d20d5e96b3cabf.svg)

> 改进后

```java
/**
 * 选课管理系统对外api
 *
 * @author l00266403
 * @since 2021-11-11
 */
public class CourseSelectionSystemApi {
    private final CourseSelectionManager courseSelectionManager = new CourseSelectionManager();;

    /**
     * 批量导入学生信息
     * 
     * @param students 学生
     */
    public void importStudents(List<Student> students) {
        courseSelectionManager.importStudents(students);
    }

    /**
     * 批量导入课程信息
     * 
     * @param courses 课程信息
     */
    public void importCourses(List<Course> courses) {
        courseSelectionManager.importCourses(courses);
    }

    /**
     * 学生选课
     * 
     * @param studentId 学生ID
     * @param courseNames 课程名称
     */
    public void assignCourses(int studentId, List<String> courseNames) {
        courseSelectionManager.assignCourses(studentId, courseNames);
    }

    /**
     * 查询学生所选课程
     * 
     * @param studentId 学生ID
     * @return 学生所选课程
     */
    public List<Course> queryStudentSelectCourses(int studentId) {
        return CourseSelectionManager.queryStudentSelectCourses(studentId);
    }

    /**
     * 查询某学生某门课程的老师
     * 
     * @param studentId 学生ID
     * @param courseName 课程名称
     * @return 老师名
     */
    public String queryStudentCourseTeacher(int studentId, String courseName) {
        return courseSelectionManager
            .queryStudentCourseTeacher(studentId, courseName);
    }

    /**
     * 统计指定课程某性别学生数量
     * 
     * @param courseName 课程名称
     * @param gender 性别
     * @return 学生数目
     */
    public long statisticStudentByGender(String courseName, Gender gender) {
        return courseSelectionManager.statisticStudentByGender(courseName, gender);
    }

}
```

```java
/**
 * 选课系统管理
 *
 * @author l00266403
 * @since 2021-11-12
 */
public class CourseSelectionManager {
    private static final Map<Integer, List<Course>> STUDENT_COURSE_MAP = new HashMap<>();

    private static final Map<String, List<Student>> COURSE_STUDENTS_MAP = new HashMap<>();

    private final StudentManager studentManager = new StudentManager();

    private final CourseManager courseManager = new CourseManager();

    /**
     * 查询某学生选择的课程
     *
     * @param studentId 学生ID
     * @return 选择的课程
     */
    public static List<Course> queryStudentSelectCourses(int studentId) {
        return STUDENT_COURSE_MAP.getOrDefault(studentId, new ArrayList<>());
    }

    /**
     * 学生选课
     *
     * @param studentId 学生ID
     * @param courseNames 课程名称
     */
    public void assignCourses(int studentId,
        List<String> courseNames) {
        if (courseNames == null || courseNames.isEmpty()) {
            return;
        }
        new CourseSelectionManager().selectCourse(studentId, courseNames);
        courseNames.forEach(courseName -> new CourseSelectionManager().addStudentInCourse(courseName, this.studentManager.queryStudent(studentId)));
    }

    private void selectCourse(int studentId, List<String> courseNames) {
        courseNames.stream()
            .map(this.courseManager::queryCourse)
            .filter(Objects::nonNull)
            .forEachOrdered(
                course -> STUDENT_COURSE_MAP.computeIfAbsent(studentId, k -> new ArrayList<>()).add(course));
    }

    /**
     * 查询某学生某课程的老师
     *
     * @param studentId 学生id
     * @param courseName 课程名称
     * @return 某学生某课程的老师
     */
    public String queryStudentCourseTeacher(int studentId, String courseName) {
        Optional<Course> course =
            queryStudentSelectCourses(studentId)
                .stream()
                .filter(selectedCourse -> selectedCourse.getName().equals(courseName))
                .findFirst();
        return course.isPresent() ? course.get().getTeacher() : "no teacher info";
    }

    /**
     * 为某课程增加一位学生
     *
     * @param courseName 课程名称
     * @param student 学生
     */
    public void addStudentInCourse(String courseName, Student student) {
        COURSE_STUDENTS_MAP.computeIfAbsent(courseName, k -> new ArrayList<>()).add(student);
    }

    /**
     * 统计指定课程某性别学生数量
     *
     * @param courseName 课程名称
     * @param gender 性别
     * @return 学生数目
     */
    public long statisticStudentByGender(String courseName, Gender gender) {
        return COURSE_STUDENTS_MAP.getOrDefault(courseName, new ArrayList<>())
            .stream()
            .filter(student -> student.getGender().equals(gender))
            .count();
    }

    public void importStudents(List<Student> students) {
        studentManager.importStudents(students);
    }

    public void importCourses(List<Course> courses) {
        courseManager.importCourses(courses);
    }

}
```

```java
/**
 * 课程管理
 */
public class CourseManager {
    private static final List<Course> COURSES = new ArrayList<>();

    /**
     * 批量导入课程
     * 
     * @param courses 课程名称
     */
    public void importCourses(List<Course> courses) {
        courses.stream()
            .filter(course -> COURSES.stream().noneMatch(c -> c.getName().equals(course.getName())))
            .forEachOrdered(COURSES::add);
    }

    /**
     * 查询课程信息
     * 
     * @param courseName 课程名称
     * @return 课程信息
     */
    public Course queryCourse(String courseName) {
        return COURSES.stream()
            .filter(course -> course.getName().equals(courseName))
            .findFirst()
            .orElse(null);
    }

}
```

```java
/**
 * 学生管理类
 */
public class StudentManager {
    private static final List<Student> STUDENTS = new ArrayList<>();

    /**
     * 批量导入学生信息
     *
     * @param students 学生
     */
    public void importStudents(List<Student> students) {
        students.stream()
            .filter(student -> STUDENTS.stream().noneMatch(s -> s.getId() == student.getId()))
            .forEachOrdered(STUDENTS::add);
    }

    /**
     * 学生信息查询
     * 
     * @param studentId 学生ID
     * @return 学生信息
     */
    public Student queryStudent(int studentId) {
        return STUDENTS.stream()
            .filter(student -> student.getId() == studentId)
            .findFirst()
            .orElse(null);
    }

}
```

```java
/**
 * 案例入口类
 */
public class Client {
    private static final CourseSelectionSystemApi COURSE_SELECTION_SYSTEM_API = new CourseSelectionSystemApi();

    public static void main(String[] args) {
        initStudents();
        initCourses();

        // 完成学生选课，根据学生爱好，模拟选课
        simulationSelect();

        printStudentCourseInfo();
        printCourseStatistic();
    }

    private static void simulationSelect() {
        COURSE_SELECTION_SYSTEM_API.assignCourses(1, Arrays.asList("history", "music"));
        COURSE_SELECTION_SYSTEM_API.assignCourses(2, Arrays.asList("history", "literature"));
    }

    private static void initStudents() {
        COURSE_SELECTION_SYSTEM_API.importStudents(Arrays.asList(
            new Student(1, "zhangsan", BOY),
            new Student(2, "lisi", GIRL)));
    }

    /**
     * 初始化一些课程
     */
    private static void initCourses() {
        COURSE_SELECTION_SYSTEM_API.importCourses(Arrays.asList(
            new Course("history", "teacher1"),
            new Course("literature", "teacher2"),
            new Course("music", "teacher3")));
    }

    private static void printStudentCourseInfo() {
        // 查询1号学生的某个课程的上课老师
        String teacher = COURSE_SELECTION_SYSTEM_API.queryStudentCourseTeacher(1, "history");
        System.out.println(String.format("student 1 Monday course: %s, teacher name: %s", "history", teacher));
    }

    private static void printCourseStatistic() {
        // 统计文学课女生选择的人数
        long literatureCount = COURSE_SELECTION_SYSTEM_API.statisticStudentByGender("literature", GIRL);
        System.out.println(String.format("grils select literature : %d", literatureCount));
    }
}
```

```java
/**
 * 课程信息
 */
public class Course {
    private final String name; // history, literature, music ..

    private final String teacher;

    public Course(String name, String teacher) {
        this.name = name;
        this.teacher = teacher;
    }

    public String getName() {
        return name;
    }

    public String getTeacher() {
        return teacher;
    }
}

/**
 * 性别
 *
 * @author l00266403
 * @since 2021-11-08
 */
public enum Gender {
    BOY,
    GIRL
}

/**
 * 学生信息
 */
public class Student {
    private final int id;

    private final String name;

    private final Gender gender;

    public Student(int id, String name, Gender gender) {
        this.id = id;
        this.name = name;
        this.gender = gender;
    }

    public int getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public Gender getGender() {
        return gender;
    }
}
```

> 操作手法

| 操作                 | 快捷键（推荐） | Ctrl+Alt+Shift+T（或：鼠标右键“Refactor”） |
| -------------------- | -------------- | ------------------------------------------ |
| 封装字段             |                | Excapsulate Fields                         |
| 委托取代继承         |                | Replace Inheritance with Delegation        |
| 移除中间人           |                | Remove Middleman                           |
| 实例方法变为静态方法 |                | Make Static                                |
| 静态方法变为实例方法 |                | Convert To Instance Method                 |
| 搬移实例/静态成员    | F6             | Move Instance Method/Move Static Members   |
| 内联                 | Ctrl+Alt+N     | Inline XXX                                 |
| 提炼方法             | Ctrl+Alt+M     | Extract Method                             |

补充：通过UML类图辅助分析，选中文件或package——右键——Diagrams——show Diagram，生成类图

> 通过图形化展示内幕交易引发的循环依赖

-  类图可以看到Course和Student都分别与StudentManager、CourseManager有组合关系 
-  IDEA自带的依赖关系矩阵，出现在对角线右上角的元素，即为不合理的反向依赖
   （IDEA——Analyze——Analyze dependency Matrix Scope分析依赖矩阵）

修改前

<img src="https://raw.githubusercontent.com/guyuechen/gallery/main/img/1687342674490-a91a51eb-62af-46a4-917b-3c76bafcca62.png" alt="image.png" style="zoom:80%;" />

修改后

<img src="https://raw.githubusercontent.com/guyuechen/gallery/main/img/1687342699851-e0bf0bdb-4587-4595-aca2-b3512ec704d1.png" alt="image.png" style="zoom:80%;" />
