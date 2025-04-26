+++
title = 'Design Uber'
date = 2024-12-28T15:36:25+08:00
categories = ["system-design"]
tags = ["system-design"]
+++

Implement a **Cab Booking Application** (like Uber) which facilitates:

- **Addition** of new cabs to the system.
- **Updating** the trips of various customers.
- Finding the **nearest** cabs to a location.

Design the `Uber` class:

- `Uber()` Initializes the **Uber** object with `0` cabs and `0` running trips.
- `void addCab(int cabX, int cabY)` Adds a cab located at point `(cabX, cabY)` to the system. **Note** that multiple cabs can be at the same location.
- `int[] startTrip(int customerID, int customerX, int customerY)` Returns an integer array `[nearX, nearY]` where `nearX` and `nearY` represent the X-coordinate and Y-coordinate (**respectively**) of the closest available cab to customer `customerID`, present at `(customerX, customerY)`. In case there are **multiple** such cabs, it returns the location of the cab with the smallest X-coordinate, and if there are still multiple choices, it chooses the cab with the smallest Y-coordinate. In case there are **no** available cabs, returns `[-1, -1]`. The cab is then **assigned** to the customer, who starts their trip.
- `void endTrip(int customerID, int customerX, int customerY)` The customer `customerID` ends their trip at `(customerX, customerY)`. In case a cab was assigned to them **by the system**, re-adds it back to the system at `(customerX, customerY)`, otherwise ignores the call.
- `List<List<Integer>> getNearestCabs(int k, int x, int y)` Returns a list of locations of the `k` closest **available** cabs to `(x, y)`, **sorted** in non-decreasing order by X-coordinate and subsequently by Y-coordinate. In case there are **multiple** choices, it chooses the cab with the smaller X-coordinate, and if there are still multiple choices, it chooses the one with the smaller Y-coordinate. In case there are **less than** `k` cabs available, it returns the locations of all of them.

**Note:** The distance between two points on the **X-Y** plane is the Euclidean distance (i.e., `√(x1 - x2)2 + (y1 - y2)2`).

 

### Example 1:

```json
Input
["Uber", "startTrip", "addCab", "addCab", "getNearestCabs", "startTrip", "endTrip", "endTrip", "getNearestCabs"]
[[], [5, 10, 15], [10, 10], [30, 30], [1, 12, 15], [1, 5, 5], [5, 0, 0], [1, 0, 0], [5, 30, 30]]
Output
[null, [-1, -1], null, null, [[10, 10]], [10, 10], null, null, [[0, 0], [30, 30]]]

Explanation
Uber uber = new Uber();    // initialize the object with 0 cabs and 0 running trips.
uber.startTrip(5, 10, 15); // return [-1, -1]
                           // there are no cabs available.
uber.addCab(10, 10);       // a new cab at (10, 10) is added to the system.
uber.addCab(30, 30);       // another cab at (30, 30) is added to the system.
uber.getNearestCabs(1, 12, 15); // return [[10, 10]]
                               // (10, 10) is the nearest cab to (12, 15).
uber.startTrip(1, 5, 5); // return [10, 10]
                         // customer 1 present at (5, 5) books the nearest cab at (10, 10).
uber.endTrip(5, 0, 0);   // customer 5 was not assigned a cab by the system, so the request is ignored.
uber.endTrip(1, 0, 0);   // customer 1 ends their trip, so their cab is re-added to the system at (0, 0).
uber.getNearestCabs(5, 30, 30); // return [[0, 0], [30, 30]]
                                // since there are only 2 available cabs, both their locations are returned.
                                // Note how they are sorted by their X-coordinates. 
```

 

### Constraints:

- `-1000 <= cabX, cabY, customerX, customerY, x, y <= 1000`
- `1 <= customerID <= 106`
- A customer currently in a trip **cannot** start a new trip.
- `1 <= k <= 5`
- At most `5000` calls will be made **in total** to `addCab`, `startTrip`, `endTrip`, `getNearestCabs`.
- At least **one** call will be made to `getNearestCabs`.



### Solution

```java
import java.util.*;
import java.util.stream.Collectors;

/**
 * Your Uber object will be instantiated and called as such:
 * Uber obj = new Uber();
 * obj.addCab(cabX,cabY);
 * int[] param_2 = obj.startTrip(customerID,customerX,customerY);
 * obj.endTrip(customerID,customerX,customerY);
 * List<List<Integer>> param_4 = obj.getNearestCabs(k,x,y);
 */
public class Uber {
    public static CabServiceUber cab;
    public static LocationServiceUber loc;
    public static DatabaseUber db;

    public Uber() {
        db = new DatabaseUber();
        cab = new CabServiceUber();
        loc = new LocationServiceUber();
    }

    public void addCab(int cabX, int cabY) {
        cab.addCab(cabX, cabY);
    }

    public int[] startTrip(int customerID, int customerX, int customerY) {
        return cab.assignCab(customerID, customerX, customerY);
    }

    public void endTrip(int customerID, int customerX, int customerY) {
        cab.reAddCab(customerID, customerX, customerY);
    }

    public List<List<Integer>> getNearestCabs(int k, int x, int y) {
        return loc.getNearestCabs(k, x, y).stream()
                .map(cab -> List.of(cab.loc[0], cab.loc[1]))
                .collect(Collectors.toList());
    }
}

class CabServiceUber {
    private static int counter = 1;

    public void addCab(int x, int y) {
        CabUber cab = new CabUber(counter++, new int[]{x, y});
        Uber.db.cabMap.put(cab.id, cab);
    }

    public void reAddCab(int userId, int x, int y) {
        if (!Uber.db.userCabMap.containsKey(userId)) return;
        Integer cabId = Uber.db.userCabMap.remove(userId);
        Uber.db.cabMap.put(cabId, new CabUber(cabId, new int[]{x, y}));
    }

    public int[] assignCab(Integer userId, Integer userX, Integer userY) {
        int[] cabLoc = {-1, -1};
        CabUber cab = Uber.loc.getNearestCab(userX, userY);
        if (cab != null) {
            Uber.db.userCabMap.put(userId, cab.id);
            Uber.db.cabMap.remove(cab.id);
            cabLoc[0] = cab.loc[0];
            cabLoc[1] = cab.loc[1];
        }
        return cabLoc;
    }
}

class LocationServiceUber {
    public CabUber getNearestCab(int x, int y) {
        List<CabUber> nearestCabs = getNearestCabs(1, x, y);
        return nearestCabs.isEmpty() ? null : nearestCabs.get(0);
    }

    public List<CabUber> getNearestCabs(int k, int x, int y) {
		int[] loc = {x, y};
		PriorityQueue<CabUber> heap = new PriorityQueue<>((c2, c1) -> {
			int d1 = (int) distance(c1.loc, loc);
			int d2 = (int) distance(c2.loc, loc);
			if(d1==d2) return c1.loc[0]!=c2.loc[0]? c1.loc[0]-c2.loc[0]: c1.loc[1]-c2.loc[1];
			return d1-d2;
		});
		for(CabUber c: Uber.db.cabMap.values()) {
			heap.add(c);
			if(heap.size()>k) heap.poll();
		}
		List<CabUber> result = new ArrayList<>();
		while(heap.size() > 0) {
            result.add(heap.poll());
        }
		result.sort((c1, c2) -> c1.loc[0] != c2.loc[0] ? c1.loc[0] - c2.loc[0] : c1.loc[1] - c2.loc[1]);
		return result;
	}

    public static double distance(int[] i1, int[] i2) {
        return Math.pow(i1[0] - i2[0], 2) + Math.pow(i1[1] - i2[1], 2);
    }
}

class DatabaseUber {
    public Map<Integer, CabUber> cabMap;
    public Map<Integer, Integer> userCabMap;

    public DatabaseUber() {
        cabMap = new HashMap<>();
        userCabMap = new HashMap<>();
    }
}

class CabUber {
    public int id;
    public int[] loc;

    public CabUber(int id, int[] loc) {
        this.id = id;
        this.loc = loc;
    }
}
```

实现了一个简单的模拟 **Uber** 系统，包含了对出租车的管理、用户的打车请求以及位置服务。整个系统主要由几个模块组成，每个模块都处理特定的任务：

#### 1. **Uber类 (Uber)**

`Uber` 类是系统的主入口类。它实例化了三个子系统：

- **CabServiceUber**: 处理与出租车相关的操作，比如添加出租车、分配出租车和重新添加出租车。
- **LocationServiceUber**: 处理与位置相关的操作，主要是获取最近的出租车。
- **DatabaseUber**: 作为数据库存储的模拟类，管理出租车和用户的相关数据。

`Uber` 类提供了以下方法：

- `addCab(int cabX, int cabY)`: 添加一辆新的出租车，指定其位置。
- `startTrip(int customerID, int customerX, int customerY)`: 启动一次旅行，为给定的用户分配最近的出租车，并返回该出租车的位置。
- `endTrip(int customerID, int customerX, int customerY)`: 结束一次旅行，将出租车的位置更新并重新放回数据库中。
- `getNearestCabs(int k, int x, int y)`: 获取距离给定坐标 `(x, y)` 最近的 `k` 辆出租车的位置列表。

#### 2. **CabServiceUber类 (CabServiceUber)**

负责管理出租车的添加、分配以及更新。主要方法如下：

- `addCab(int x, int y)`: 添加一辆新的出租车到数据库，并赋予一个唯一的ID。
- `reAddCab(int userId, int x, int y)`: 将已分配给用户的出租车重新放回数据库，并更新其位置。
- `assignCab(Integer userId, Integer userX, Integer userY)`: 根据用户的位置，分配一辆最近的出租车，并返回该出租车的位置。

#### 3. **LocationServiceUber类 (LocationServiceUber)**

负责根据用户的位置，寻找最近的出租车。主要方法：

- `getNearestCab(int x, int y)`: 获取离给定位置 `(x, y)` 最近的出租车。
- `getNearestCabs(int k, int x, int y)`: 获取离给定位置 `(x, y)` 最近的 `k` 辆出租车，并按距离从近到远排序。

通过使用优先队列（`PriorityQueue`），实现了基于位置距离的排序和筛选，确保选出的出租车是最近的。

#### 4. **DatabaseUber类 (DatabaseUber)**

这个类模拟了一个数据库，存储出租车和用户与出租车之间的关系：

- `cabMap`: 用于存储所有出租车（`CabUber`对象），键是出租车的ID，值是出租车对象。
- `userCabMap`: 用于存储用户和他们所使用的出租车的映射关系，键是用户的ID，值是出租车的ID。

#### 5. **CabUber类 (CabUber)**

这个类表示一辆出租车，包含两个属性：

- `id`: 出租车的唯一标识。
- `loc`: 出租车的位置，用一个二维数组表示 `[x, y]`。

#### 6. **辅助功能**

- **distance方法**: 计算两点之间的平方距离，用来衡量出租车与用户之间的接近程度。
- **排序和队列**: 在 `LocationServiceUber` 中使用了优先队列来从所有出租车中找出距离最近的 `k` 辆出租车。优先队列会根据出租车与用户的距离进行排序。还会根据坐标的顺序进行二次排序（如果两个出租车距离相同，则按照横坐标和纵坐标的顺序排序）。

#### 总结：

**整体流程：**

1. **添加出租车**: 使用 `addCab` 方法可以添加出租车，并将其位置存入 `DatabaseUber` 中。
2. **分配出租车**: 用户调用 `startTrip` 方法请求出租车，系统会根据用户的坐标，选择距离最近的出租车，并返回该出租车的位置。此时，出租车会从数据库中移除，并与该用户进行绑定。
3. **结束行程**: 用户调用 `endTrip` 方法结束行程，出租车的位置信息会更新并重新加入到数据库中，供其他用户继续调用。
4. **查询最近出租车**: 使用 `getNearestCabs` 方法可以查询到距离某个位置最近的 `k` 辆出租车，并返回其位置。

这个系统模拟了一个简化的 Uber 打车服务的核心逻辑，主要涉及出租车的管理、用户请求出租车的分配、出租车位置的更新以及查询最近出租车的功能。代码使用了面向对象的设计，结合了队列和排序算法来高效地处理最近出租车的查询。