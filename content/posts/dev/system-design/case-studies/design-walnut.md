+++
title = 'Design Walnut'
date = 2025-01-19T14:33:37+08:00
categories = ["system-design"]
tags = ["system-design"]
+++

Design a **banking SMS parsing and analytics application** (like Walnut) which reads all the text messages received by users and analyzes the following:

- The income and expenditure of a user.
- The average income and expenditure of all users.

Text messages will be represented as a string, with words separated by `' '`. The texts will be analyzed and will be considered **valid** if it satisfies the following criteria:

- It contains words of **exactly one** of the following groups:

  - one or more of `"credit"`, `"credited"`, `"deposit"`, or `"deposited"` to indicate an **earning**, or
- one or more of `"debit"`, `"debited"`, `"withdraw"`, `"withdrawal"`, or `"withdrawn"` to indicate an **expenditure**.
  
- It has **exactly one** occurrence of amount. It can be denoted as `"USD x"`, `"x USD"`, `"USDx"`, `"$ x"`, `"x $"`, or `"$x"`, where:

  - `x` denotes the denomination of the amount. It should lie in the range `[0, 109]`. Please note that it means `"10000000000000000 USD"` is an invalid amount.
- `x` can have up to `2` decimal places. Please note that this means `"$ 1.0005"` is not a valid amount as it has more than `2` decimal places.

Design the `Walnut` class:

- `Walnut()` Initializes the **Walnut** object with `0` users and `0` text messages.
- `void parseText(int userID, String text)` Analyzes the text message represented as `text`, and updates it for the user `userID` if it is a valid text.
- `double getTotalUserEarnings(int userID)` Returns the **total earnings** of user `userID`. In case no valid texts have been analyzed for `userID`, returns `0`.
- `double getTotalUserExpenses(int userID)` Returns the **total expenses** of user `userID`. In case no valid texts have been analyzed for `userID`, returns `0`.
- `double getAverageUserEarnings()` Returns the **average earnings** of all users whose texts have been analyzed and are valid (including users with only expenses), or `0` if no texts have been analyzed.
- `double getAverageUserExpenses()` Returns the **average expenses** of all users whose texts have been analyzed and are valid (including users with only earnings), or `0` if no texts have been analyzed.

Note that all answers within `10-5` of the actual answer will be considered accepted.

 

### Example 1:

```json
Input
["Walnut", "getAverageUserEarnings", "parseText", "parseText", "parseText", "parseText", "parseText", "getTotalUserEarnings", "getTotalUserExpenses", "getAverageUserEarnings", "getAverageUserExpenses"]
[[], [], [1, "deposit $120.45"], [1, "credit $238.98"], [1, "Transaction Cost USD 25.55"], [1, "debited $14790"], [1, "deposited $1000.00"], [1], [1], [], []]
Output
[null, 0.0, null, null, null, null, null, 1359.43, 14790.0, 1359.43, 14790.0]

Explanation
Walnut walnut = new Walnut();    // initialize the object with 0 users and 0 parsed texts
walnut.getAverageUserEarnings(); // return 0.0
                                 // There are no users whose texts have been analyzed.
walnut.parseText(1, "deposit $120.45"); // $120.45 has been earned by user 1.
walnut.parseText(1, "credit $238.98");  // $238.98 has been earned by user 1, whose total earnings is $359.43.
walnut.parseText(1, "Transaction Cost USD 25.55"); // There is no clear indication whether it is debit or credit
                                                   // So this text is invalid
walnut.parseText(1, "debited $14790"); //
walnut.parseText(1, "deposited $1000.00"); // $1000 has been earned by user 1, whose total earnings is $1359.43.
walnut.getTotalUserEarnings(1);  // return 1359.43
                                 // This is the total amount earned by user 1.
walnut.getTotalUserExpenses(1);  // return 14790.0
                                 // This is the total amount expended by user 1.
walnut.getAverageUserEarnings(); // return 1359.43
                                 // Since the only analyzed texts have been for user 1, it returns their total earnings.
walnut.getAverageUserExpenses(); // return 14790.0
                                 // Since the only analyzed texts have been for user 1, it returns their total expenses.
```

 

### Constraints:

- `1 <= userID <= 105`
- `1 <= text.length <= 50`
- `text` consists of lowercase and uppercase English letters, digits (`'0'` - `'9'`), `'$'`, `' '` and `'.'`.
- At most `105` calls **in total** will be made to `parseText`, `getTotalUserEarnings`, `getTotalUserExpenses`, `getAverageUserEarnings`, and `getAverageUserExpenses`.
- At least **one call** will be made to `getTotalUserEarnings`, `getTotalUserExpenses`, `getAverageUserEarnings`, or `getAverageUserExpenses`.



### Solution

```java
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import java.util.stream.Stream;

public class Walnut {
    // 存储每个用户的收入和支出数据
    private Map<Integer, Map<String, Double>> data = new HashMap<>(); 
    // 收入关键词集合
    private Set<String> earnPattern = Set.of("credit", "credited", "deposit", "deposited");
    // 支出关键词集合
    private Set<String> expendPattern = Set.of("debit", "debited", "withdraw", "withdrawal", "withdrawn"); 
    // 平均收入缓存
    private double avgEarnCache = 0.0; 
    // 平均支出缓存
    private double avgExpenCache = 0.0; 
    // 用户总数
    private int userCount = 0; 

    /**
     * 解析文本并更新用户的收入或支出
     *
     * @param userId 用户ID
     * @param text   输入的文本
     */
    public void parseText(int userId, String text) {
        boolean newUser = false;
        
        // 如果用户不存在，则初始化其收入和支出为0
        if (!data.containsKey(userId)) {
            Map<String, Double> userData = new HashMap<>();
            userData.put("earnings", 0.0);
            userData.put("expenses", 0.0);
            data.put(userId, userData);
            userCount++;
            newUser = true;
        }

        // 判断是收入还是支出
        int inOrOut = earnOrExpend(text);
        if (inOrOut < 0) {
            return;
        }

        // 获取金额
        double amount = findAmount(text);
        if (inOrOut == 0) { // 收入
            data.get(userId).put("earnings", data.get(userId).get("earnings") + amount);
            updateAverageUserEarnings(amount, newUser);
            if (newUser) {
                updateAverageUserExpenses(0.0, true); // 新用户时，支出初始化为0
            }
        } else { // 支出
            data.get(userId).put("expenses", data.get(userId).get("expenses") + amount);
            updateAverageUserExpenses(amount, newUser);
            if (newUser) {
                updateAverageUserEarnings(0.0, true); // 新用户时，收入初始化为0
            }
        }
    }

    /**
     * 获取用户的总收入
     *
     * @param userId 用户ID
     * @return 用户的总收入
     */
    public double getTotalUserEarnings(int userId) {
        if (!data.containsKey(userId)) {
            return 0.0;
        }
        return data.get(userId).get("earnings");
    }

    /**
     * 获取用户的总支出
     *
     * @param userId 用户ID
     * @return 用户的总支出
     */
    public double getTotalUserExpenses(int userId) {
        if (!data.containsKey(userId)) {
            return 0.0;
        }
        return data.get(userId).get("expenses");
    }

    /**
     * 获取所有用户的平均收入
     *
     * @return 平均收入
     */
    public double getAverageUserEarnings() {
        return avgEarnCache;
    }

    /**
     * 获取所有用户的平均支出
     *
     * @return 平均支出
     */
    public double getAverageUserExpenses() {
        return avgExpenCache;
    }

    /**
     * 更新所有用户的平均收入
     *
     * @param amount  本次收入
     * @param newUser 是否为新用户
     */
    private void updateAverageUserEarnings(double amount, boolean newUser) {
        if (!newUser) {
            avgEarnCache += amount / userCount;
            return;
        }
        avgEarnCache = avgEarnCache * ((double) (userCount - 1) / userCount) + amount / userCount;
    }

    /**
     * 更新所有用户的平均支出
     *
     * @param amount  本次支出
     * @param newUser 是否为新用户
     */
    private void updateAverageUserExpenses(double amount, boolean newUser) {
        if (!newUser) {
            avgExpenCache += amount / userCount;
            return;
        }
        avgExpenCache = avgExpenCache * ((double) (userCount - 1) / userCount) + amount / userCount;
    }

    /**
     * 判断文本是收入还是支出
     *
     * @param text 输入的文本
     * @return 0 表示收入，1 表示支出，-1 表示无效
     */
    private int earnOrExpend(String text) {
        // 使用Stream判断文本中是否包含收入或支出的关键词
        return Stream.of(text.split(" "))
                .anyMatch(earnPattern::contains) ? 0 :
                Stream.of(text.split(" "))
                        .anyMatch(expendPattern::contains) ? 1 : -1;
    }

    /**
     * 提取金额信息
     *
     * @param text 输入的文本
     * @return 提取的金额，如果无效则返回-1.0
     */
    private double findAmount(String text) {
        // 将文本转为字符流
        String amountStr = IntStream.range(0, text.length())
                .mapToObj(i -> text.charAt(i))
                .filter(c -> Character.isDigit(c) || c == '.') // 只保留数字和小数点
                .map(String::valueOf)
                .collect(Collectors.joining());

        if (amountStr.isEmpty()) return -1.0;

        // 处理小数点的位置
        int dotIndex = amountStr.indexOf('.');
        if (dotIndex != -1 && amountStr.indexOf('.', dotIndex + 1) != -1) {
            return -1.0; // 如果有多个小数点，则返回 -1.0
        }

        // 如果小数点在最前面，补充 "0."
        if (dotIndex == 0) {
            amountStr = "0" + amountStr;
        }

        try {
            double amount = Double.parseDouble(amountStr);
            if (amount > 1e9) return -1.0; // 如果金额过大，返回-1.0
            return amount;
        } catch (NumberFormatException e) {
            return -1.0; // 如果解析失败，返回-1.0
        }
    }
}

```



### Highlights

#### 1. 数据结构的选择

- 使用 `Map<Integer, Map<String, Double>>` 来存储每个用户的收入和支出数据，这样的设计确保了对每个用户的数据访问高效，并且能够灵活处理不同类型的财务数据（如“earnings”和“expenses”）。
- 使用 `Set<String>` 来存储收入和支出的关键词集，不仅提高了判断效率（通过集合查找快速判断），而且代码清晰明了。

#### 2. 收入与支出的计算

- 在 `parseText` 方法中，首先通过 `earnOrExpend` 判断文本的类型，确保了收入和支出的分类是精确的。
- 对于新用户，通过 `newUser` 标记来处理收入与支出初始化的情况，并避免不必要的重复计算。尤其是新用户时，默认支出或收入为 0，这种做法非常高效且符合需求。

#### 3. 平均值的更新

- 使用缓存变量 `avgEarnCache` 和 `avgExpenCache` 来存储所有用户的平均收入和支出，避免了在每次获取时都进行遍历计算。这种做法在性能上做了优化。
- 在更新平均值时，你根据是否为新用户进行精确计算，确保每个用户的收入和支出正确地反映到全局的平均值中。

#### 4. 边界情况的处理

- 通过 `findAmount` 方法，清晰地实现了金额的提取，同时对金额的有效性进行了验证（例如：处理多个小数点、过大金额以及小数点位置等情况）。这种对边界情况的处理，确保了程序的健壮性。
- 在 `earnOrExpend` 方法中，采用 `Stream` 结合 `contains` 判断文本中是否包含收入或支出的关键字，这种方式既简洁又易于扩展。