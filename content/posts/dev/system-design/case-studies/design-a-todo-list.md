+++
title = 'Design a Todo List'
date = 2025-02-16T13:55:51+08:00
categories = ["system-design"]
tags = ["system-design"]
+++

Design a Todo List Where users can add **tasks**, mark them as **complete**, or get a list of pending tasks. Users can also add **tags** to tasks and can filter the tasks by certain tags.

Implement the `TodoList` class:

- `TodoList()` Initializes the object.
- `int addTask(int userId, String taskDescription, int dueDate, List<String> tags)` Adds a task for the user with the ID `userId` with a due date equal to `dueDate` and a list of tags attached to the task. The return value is the ID of the task. This ID starts at `1` and is **sequentially** increasing. That is, the first task's id should be `1`, the second task's id should be `2`, and so on.
- `List<String> getAllTasks(int userId)` Returns a list of all the tasks not marked as complete for the user with ID `userId`, ordered by the due date. You should return an empty list if the user has no uncompleted tasks.
- `List<String> getTasksForTag(int userId, String tag)` Returns a list of all the tasks that are not marked as complete for the user with the ID `userId` and have `tag` as one of their tags, ordered by their due date. Return an empty list if no such task exists.
- `void completeTask(int userId, int taskId)` Marks the task with the ID `taskId` as completed only if the task exists and the user with the ID `userId` has this task, and it is uncompleted.

 

### Example 1:

```json
Input
["TodoList", "addTask", "addTask", "getAllTasks", "getAllTasks", "addTask", "getTasksForTag", "completeTask", "completeTask", "getTasksForTag", "getAllTasks"]
[[], [1, "Task1", 50, []], [1, "Task2", 100, ["P1"]], [1], [5], [1, "Task3", 30, ["P1"]], [1, "P1"], [5, 1], [1, 2], [1, "P1"], [1]]
Output
[null, 1, 2, ["Task1", "Task2"], [], 3, ["Task3", "Task2"], null, null, ["Task3"], ["Task3", "Task1"]]

Explanation
TodoList todoList = new TodoList();
todoList.addTask(1, "Task1", 50, []); // return 1. This adds a new task for the user with id 1.
todoList.addTask(1, "Task2", 100, ["P1"]); // return 2. This adds another task for the user with id 1.
todoList.getAllTasks(1); // return ["Task1", "Task2"]. User 1 has two uncompleted tasks so far.
todoList.getAllTasks(5); // return []. User 5 does not have any tasks so far.
todoList.addTask(1, "Task3", 30, ["P1"]); // return 3. This adds another task for the user with id 1.
todoList.getTasksForTag(1, "P1"); // return ["Task3", "Task2"]. This returns the uncompleted tasks that have the tag "P1" for the user with id 1.
todoList.completeTask(5, 1); // This does nothing, since task 1 does not belong to user 5.
todoList.completeTask(1, 2); // This marks task 2 as completed.
todoList.getTasksForTag(1, "P1"); // return ["Task3"]. This returns the uncompleted tasks that have the tag "P1" for the user with id 1.
                                  // Notice that we did not include "Task2" because it is completed now.
todoList.getAllTasks(1); // return ["Task3", "Task1"]. User 1 now has 2 uncompleted tasks.
```

 

### Constraints:

- `1 <= userId, taskId, dueDate <= 100`
- `0 <= tags.length <= 100`
- `1 <= taskDescription.length <= 50`
- `1 <= tags[i].length, tag.length <= 20`
- All `dueDate` values are unique.
- All the strings consist of lowercase and uppercase English letters and digits.
- At most `100` calls will be made for each method.



### Solution

```java
import java.util.*;
import java.util.stream.Collectors;

/**
 * Your TodoList object will be instantiated and called as such:
 * TodoList obj = new TodoList();
 * int param_1 = obj.addTask(userId,taskDescription,dueDate,tags);
 * List<String> param_2 = obj.getAllTasks(userId);
 * List<String> param_3 = obj.getTasksForTag(userId,tag);
 * obj.completeTask(userId,taskId);
 */
class TodoList {
    
    private int id;
    private Map<Integer, List<Task>> map;
    
    public TodoList() {
        this.id = 0;
        this.map = new HashMap<>();
    }
    
    public int addTask(int userId, String taskDescription, int dueDate, List<String> tags) {
        map.computeIfAbsent(userId, k -> new ArrayList<>())
           .add(new Task(userId, dueDate, tags, ++id, taskDescription));
        return id;
    }
    
    public List<String> getAllTasks(int userId) {
        return map.getOrDefault(userId, Collections.emptyList())
                  .stream()
                  .sorted(Comparator.comparingInt(Task::getDue))
                  .map(Task::getDesc)
                  .collect(Collectors.toList());
    }
    
    public List<String> getTasksForTag(int userId, String tag) {
    	return map.getOrDefault(userId, Collections.emptyList())
                  .stream()
                  .filter(task -> task.getTags().contains(tag))
                  .sorted(Comparator.comparingInt(Task::getDue))
                  .map(Task::getDesc)
                  .collect(Collectors.toList());
    }
    
    public void completeTask(int userId, int taskId) {
        List<Task> tasks = map.get(userId);
        if (tasks != null) {
            tasks.removeIf(task -> task.getId() == taskId);
        }
    }
}

class Task {
    private int userId;
    private int due;
    private int id;
    private List<String> tags;
    private String desc;

    public Task(int userId, int due, List<String> tags, int id, String desc) {
        this.userId = userId;
        this.due = due;
        this.tags = tags;
        this.id = id;
        this.desc = desc;
    }

    public int getUserId() {
        return userId;
    }

    public int getDue() {
        return due;
    }

    public int getId() {
        return id;
    }

    public List<String> getTags() {
        return tags;
    }

    public String getDesc() {
        return desc;
    }
}
```



### Highlights

#### 1. **良好的封装性**

- **`Task` 类的字段均为 `private`**：所有字段都被封装在类内部，外部只能通过 `getter` 方法访问，符合面向对象编程的封装原则。
- **`TodoList` 类的字段也是 `private`**：`id` 和 `map` 都被封装在类内部，避免了外部直接修改内部状态的风险。

#### 2. **使用 `Stream` API 简化集合操作**

- **`getAllTasks` 和 `getTasksForTag` 方法**：通过 `Stream` API 实现了任务列表的过滤、排序和映射操作，代码简洁且可读性强。
  - 例如：`sorted(Comparator.comparingInt(Task::getDue))` 按截止日期排序。
  - 例如：`map(Task::getDesc)` 提取任务描述。
- **`filter` 和 `collect` 方法**：通过 `filter` 过滤符合条件的任务，通过 `collect` 将结果收集到列表中，逻辑清晰。

#### 3. **使用 `computeIfAbsent` 简化 Map 操作**

- **`addTask` 方法**：使用了 `Map.computeIfAbsent` 方法，避免了手动检查 `Map` 中是否存在某个键的冗余代码。
  - 例如：`map.computeIfAbsent(userId, k -> new ArrayList<>())` 自动为不存在的 `userId` 创建任务列表。

#### 4. **使用 `getOrDefault` 避免空指针异常**

- **`getAllTasks` 和 `getTasksForTag` 方法**：使用了 `Map.getOrDefault` 方法，避免了直接调用 `get` 方法可能导致的 `NullPointerException`。
  - 例如：`map.getOrDefault(userId, Collections.emptyList())` 在用户没有任务时返回空列表。

#### 5. **使用 `removeIf` 简化集合删除操作**

- **`completeTask` 方法**：使用了 `List.removeIf` 方法，简化了任务的删除逻辑。
  - 例如：`tasks.removeIf(task -> task.getId() == taskId)` 直接移除符合条件的任务。

#### 6. **支持多用户任务管理**

- **使用 `Map<Integer, List<Task>>` 存储任务**：通过 `userId` 将任务分组存储，支持多用户的任务管理，设计合理且扩展性强。



### Attentions

1. **任务状态**：目前任务只有“未完成”状态，可以增加“已完成”状态，并支持查询已完成任务。
2. **线程安全性**：如果需要在多线程环境下使用，可以考虑使用线程安全的集合（如 `ConcurrentHashMap`）或同步机制。
3. **任务ID生成**：`id` 的生成是单线程的，如果需要在多线程环境下使用，可以使用 `AtomicInteger` 来保证线程安全。
4. **任务描述和标签的不可变性**：`Task` 类中的 `desc` 和 `tags` 是可变对象，可以考虑使用不可变对象（如 `Collections.unmodifiableList`）来避免外部修改。