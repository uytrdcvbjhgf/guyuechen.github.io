+++
title = 'Design a Log Aggregation System'
date = 2025-02-23T14:18:46+08:00
categories = ["system-design"]
tags = ["system-design"]
+++

Implement a **Log Aggregation System** which aggregates logs from various services in a datacenter and provides search APIs.

Design the `LogAggregator` class:

- `LogAggregator(int machines, int services)` Initializes the object with `machines` and `services` representing the number of machines and services in the datacenter, respectively.
- `void pushLog(int logId, int machineId, int serviceId, String message)` Adds a log with id `logId` notifying that the machine `machineId` sent a string `message` while executing the service `serviceId`.
- `List<Integer> getLogsFromMachine(int machineId)` Returns a list of ids of all logs added by machine `machineId`.
- `List<Integer> getLogsOfService(int serviceId)` Returns a list of ids of all logs added while running service `serviceId` on any machine.
- `List<String> search(int serviceId, String searchString)` Returns a list of messages of all logs added while running service `serviceId` where the message of the log contains `searchString` as a substring.

**Note** that:

- The entries in each list should be in the order they were added, i.e., the older logs should precede the newer logs.
- A machine can run multiple services more than once. Similarly, a service can be run on multiple machines.
- All `logId` may **not** be ordered.
- A **substring** is a contiguous sequence of characters within a string.

 

### Example 1:

```
Input
["LogAggregator", "pushLog", "pushLog", "pushLog", "pushLog", "pushLog", "pushLog", "pushLog", "pushLog", "pushLog", "pushLog", "pushLog", "pushLog", "getLogsFromMachine", "getLogsOfService", "search", "search"]
[[3, 3], [2322, 1, 1, "Machine 1 Service 1 Log 1"], [2312, 1, 1, "Machine 1 Service 1 Log 2"], [2352, 1, 1, "Machine 1 Service 1 Log 3"], [2298, 1, 1, "Machine 1 Service 1 Log 4"], [23221, 1, 2, "Machine 1 Service 2 Log 1"], [23121, 1, 2, "Machine 1 Service 2 Log 2"], [23222, 2, 2, "Machine 2 Service 2 Log 1"], [23122, 2, 2, "Machine 2 Service 2 Log 2"], [23521, 1, 2, "Machine 1 Service 2 Log 3"], [22981, 1, 2, "Machine 1 Service 2 Log 4"], [23522, 2, 2, "Machine 2 Service 2 Log 3"], [22982, 2, 2, "Machine 2 Service 2 Log 4"], [2], [2], [1, "Log 1"], [2, "Log 3"]]
Output
[null, null, null, null, null, null, null, null, null, null, null, null, null, [23222, 23122, 23522, 22982], [23221, 23121, 23222, 23122, 23521, 22981, 23522, 22982], ["Machine 1 Service 1 Log 1"], ["Machine 1 Service 2 Log 3", "Machine 2 Service 2 Log 3"]]

Explanation
LogAggregator logAggregator = new LogAggregator(3, 3); // There are 3 machines and 3 services
logAggregator.pushLog(2322, 1, 1, "Machine 1 Service 1 Log 1");
logAggregator.pushLog(2312, 1, 1, "Machine 1 Service 1 Log 2");
logAggregator.pushLog(2352, 1, 1, "Machine 1 Service 1 Log 3");
logAggregator.pushLog(2298, 1, 1, "Machine 1 Service 1 Log 4");
logAggregator.pushLog(23221, 1, 2, "Machine 1 Service 2 Log 1");
logAggregator.pushLog(23121, 1, 2, "Machine 1 Service 2 Log 2");
logAggregator.pushLog(23222, 2, 2, "Machine 2 Service 2 Log 1");
logAggregator.pushLog(23122, 2, 2, "Machine 2 Service 2 Log 2");
logAggregator.pushLog(23521, 1, 2, "Machine 1 Service 2 Log 3");
logAggregator.pushLog(22981, 1, 2, "Machine 1 Service 2 Log 4");
logAggregator.pushLog(23522, 2, 2, "Machine 2 Service 2 Log 3");
logAggregator.pushLog(22982, 2, 2, "Machine 2 Service 2 Log 4");
logAggregator.getLogsFromMachine(2); // return [23222, 23122, 23522, 22982]
                                     // Machine 2 added 4 logs, so we return them in the order
                                     // they were added.
logAggregator.getLogsOfService(2); // return [23221, 23121, 23222, 23122, 23521, 22981, 23522, 22982]
                                   // 8 logs were added while running service 2 on a machine.
logAggregator.search(1, "Log 1"); // return ["Machine 1 Service 1 Log 1"]
                                  // There is only one log that was added while running service 1
                                  // and contains "Log 1".
logAggregator.search(2, "Log 3"); // return ["Machine 1 Service 2 Log 3", "Machine 2 Service 2 Log 3"]
                                  // 2 logs were added while running service 2 that contain "Log 3".
```

 

### Constraints:

- `1 <= machines, services <= 20`
- `1 <= logId <= 105`
- All `logId` are **unique**.
- `0 <= machineId <= machines - 1`
- `0 <= serviceId <= services - 1`
- `1 <= message.length, searchString.length <= 500`
- `message` and `searchString` consist of letters, digits, and `' '` only.
- At most `100` calls **in total** will be made.
- At least **one** call **in total** will be made to `getLogsFromMachine`, `getLogsOfService`, and `search`.



### Hint #1

For each machine, keep a track of the logs added by it. Also for each service, keep a track of the logs added while running it.



### Hint #2

For the functions getLogsFromMachine and getLogsOfService, you can return the list of logs already stored.



### Hint #3

For search, check each message sent while serviceId was running to find the ones containing stringSearch as a substring.



### Solution #1

```java
/**
 * Your LogAggregator object will be instantiated and called as such:
 * LogAggregator obj = new LogAggregator(machines, services);
 * obj.pushLog(logId,machineId,serviceId,message);
 * List<Integer> param_2 = obj.getLogsFromMachine(machineId);
 * List<Integer> param_3 = obj.getLogsOfService(serviceId);
 * List<String> param_4 = obj.search(serviceId,searchString);
 */
public class LogAggregator {

    Map<Integer, List<Integer>> logsForMachines;
    Map<Integer, List<Integer>> logsForServices;
    Map<Integer, String> logs;

    public LogAggregator(int machines, int services) {
        logsForMachines = new ConcurrentHashMap<>();
        logsForServices = new ConcurrentHashMap<>();
        logs = new ConcurrentHashMap<Integer, String>();
    }

    public void pushLog(int logId, int machineId, int serviceId, String message) {
        // Creating the mapping between machineId and LogIds
        List<Integer> logsForMachine = logsForMachines.get(machineId);
        if (logsForMachine == null) {
            logsForMachine = new ArrayList<>();
        }
        logsForMachine.add(logId);
        logsForMachines.put(machineId, logsForMachine);

        // Creating the mapping between serviceId and LogIds
        List<Integer> logsForService = logsForServices.get(serviceId);
        if (logsForService == null) {
            logsForService = new ArrayList<>();
        }
        logsForService.add(logId);
        logsForServices.put(serviceId, logsForService);

        // Creating the mapping between logId and message
        logs.put(logId, message);
    }

    public List<Integer> getLogsFromMachine(int machineId) {
        List<Integer> result = logsForMachines.get(machineId);
        return result != null ? result : new ArrayList<>();
    }

    public List<Integer> getLogsOfService(int serviceId) {
        List<Integer> result = logsForServices.get(serviceId);
        return result != null ? result : new ArrayList<>();
    }

    public List<String> search(int serviceId, String stringSearch) {
        List<Integer> logsForService = logsForServices.get(serviceId);
        List<String> result = new ArrayList<>();
        if (logsForService != null) {
            for (Integer logId : logsForService) {
                String log = logs.get(logId);
                if (log.contains(stringSearch)) {
                    result.add(log);
                }
            }
        }
        return result;
    }
}
```

#### Highlights

1. **高效查询**：
   - 使用`Map`结构存储日志数据，能够快速根据`machineId`或`serviceId`查询对应的日志ID列表。
   - 通过`logs`映射直接根据`logId`获取日志内容，查询效率高。
2. **线程安全**：
   - 使用`ConcurrentHashMap`存储数据，支持多线程环境下的并发访问，适合分布式系统中的日志聚合场景。
3. **空间效率**：
   - 通过`logsForMachines`和`logsForServices`分别存储机器和服务的日志ID列表，避免了重复存储日志内容。
4. **灵活性**：
   - 支持根据`machineId`、`serviceId`和搜索字符串进行灵活的日志查询。
5. **清晰的逻辑**：
   - 代码逻辑清晰，模块化设计，易于理解和维护。



### Solution #2

```java
/**
 * Your LogAggregator object will be instantiated and called as such:
 * LogAggregator obj = new LogAggregator(machines, services);
 * obj.pushLog(logId,machineId,serviceId,message);
 * List<Integer> param_2 = obj.getLogsFromMachine(machineId);
 * List<Integer> param_3 = obj.getLogsOfService(serviceId);
 * List<String> param_4 = obj.search(serviceId,searchString);
 */
class LogAggregator {

    private List<Log> logs = new ArrayList<>();
    private final int machines;
    private final int services;

    public LogAggregator(int machines, int services) {
        this.machines = machines;
        this.services = services;
    }

    public void pushLog(int logId, int machineId, int serviceId, String message) {
        Log log = new Log(machineId, serviceId, logId, message);
        logs.add(log);
    }

    public List<Integer> getLogsFromMachine(int machineId) {
        return logs.stream()
                .filter(log -> log.machineId == machineId)
                .map(log -> log.logId)
                .toList();
    }

    public List<Integer> getLogsOfService(int serviceId) {
        return logs.stream()
                .filter(log -> log.serviceId == serviceId)
                .map(log -> log.logId)
                .toList();
    }

    public List<String> search(int serviceId, String searchString) {
        return logs.stream()
                .filter(log -> log.serviceId == serviceId && log.message.contains(searchString))
                .map(log -> log.message)
                .toList();
    }

    protected static class Log {
        private final int machineId;
        private final int serviceId;
        private final int logId;
        private final String message;

        public Log(int machineId, int serviceId, int logId, String message) {
            this.machineId = machineId;
            this.serviceId = serviceId;
            this.logId = logId;
            this.message = message;
        }
    }
}
```

#### Highlights

1. **简洁性**：
   - 使用`List`存储日志对象，代码结构简单直观，易于理解。
   - 通过`Log`类封装日志数据，提高了代码的可读性和可维护性。
2. **流式处理**：
   - 使用Stream API进行日志查询，代码简洁且功能强大。
   - 支持链式调用，方便扩展和修改查询逻辑。
3. **面向对象设计**：
   - 将日志数据封装为`Log`对象，符合面向对象的设计原则，便于扩展日志字段或功能。
4. **灵活性**：
   - 支持根据`machineId`、`serviceId`和搜索字符串进行灵活的日志查询。
   - 流式处理使得查询逻辑可以轻松扩展。
5. **适合小规模数据**：
   - 对于小规模日志数据，这种实现方式简单高效，适合单机或非高并发场景。



### Summary

- **Solution #1** 的优势在于高效查询和线程安全，适合分布式系统或高并发场景。
- **Solution #2** 的优势在于简洁性和面向对象设计，适合小规模数据或单机场景。

选择哪一个实现方案取决于具体的应用场景和需求：

- 如果需要高性能和线程安全，Solution #1 是更好的选择。
- 如果更注重代码简洁性和可读性，Solution #2 则更为合适。



