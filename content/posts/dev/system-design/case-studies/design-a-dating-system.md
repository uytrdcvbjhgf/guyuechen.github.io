+++
title = 'Design a Dating System'
date = 2024-12-07T11:25:01+08:00
categories = ["system-design"]
tags = ["system-design"]
+++

Design a simple dating system like Tinder with the following features:

1. Register a user with their gender, age, preferences, and interests.
2. Find **matching** users according to their preferred gender, preferred age range, and common interests.

Implement the `Tinder` class:

- `Tinder()` Initializes the object.

- `void signup(int userId, int gender, int preferredGender, int age, int minPreferredAge, int maxPreferredAge, List<String> interests)` Registers a user with the given attributes.

- `List<Integer> getMatches(int userId)` Returns the top `5` matches for the given user. The returned matches should satisfy the following:
  - The returned user's gender should **equal** the given user's `preferredGender`.
  - The returned user's age should be **between** the given user's `minPreferredAge` and `maxPreferredAge` (inclusive).
- There should be **at least** `1` common interest between the returned user and the given user.
  - The results should be sorted in **decreasing** order by the number of common interests. If there is a tie, it should be sorted in **increasing** order by `userId`.
- If there are fewer than `5` matches, return as many as possible.
  - Note that the given user might not necessarily be a match for the returned users.

 

### Example 1:

```json
Input
["Tinder", "getMatches", "signup", "getMatches", "signup", "getMatches", "getMatches", "signup", "signup", "getMatches", "signup", "getMatches", "getMatches", "signup", "getMatches", "getMatches"]
[[], [1], [1, 0, 1, 25, 20, 30, ["Singing", "Dancing", "Reading", "Skating"]], [1], [2, 1, 0, 27, 23, 30, ["Painting", "Basketball"]], [1], [2], [3, 1, 0, 25, 20, 30, ["Singing", "Skating"]], [4, 1, 0, 25, 20, 30, ["Singing", "Writing", "Coding"]], [1], [5, 1, 0, 31, 24, 37, ["Singing", "Dancing", "Reading", "Skating"]], [1], [5], [6, 0, 1, 30, 25, 33, ["Volleyball", "Skating"]], [5], [6]]
Output
[null, [], null, [], null, [], [], null, null, [3, 4], null, [3, 4], [1], null, [1, 6], [3, 5]]

Explanation
Tinder tinder = new Tinder();
tinder.getMatches(1); // return [], there is no user with userId 1.
tinder.signup(1, 0, 1, 25, 20, 30, ["Singing", "Dancing", "Reading", "Skating"]);
tinder.getMatches(1); // return [], no users besides user 1 have signed up yet.
tinder.signup(2, 1, 0, 27, 23, 30, ["Painting", "Basketball"]);
tinder.getMatches(1); // return [], user 2 has no common interests with user 1, so there are no matches.
tinder.getMatches(2); // return [], similarly, user 1 has no common interests with user 2.
tinder.signup(3, 1, 0, 25, 20, 30, ["Singing", "Skating"]);
tinder.signup(4, 1, 0, 25, 20, 30, ["Singing", "Writing", "Coding"]);
tinder.getMatches(1); // return [3, 4], both users 3 and 4 are in the age range for user 1 and
                      // are the preferred gender of user 1. Since user 3 has 2 common interests
                      // and user 4 has 1 common interest, user 3 is returned before user 4.
tinder.signup(5, 1, 0, 31, 24, 37, ["Singing", "Dancing", "Reading", "Skating"]);
tinder.getMatches(1); // return [3, 4], user 5 has an age larger than the maxPreferredAge of user 1.
tinder.getMatches(5); // return [1], user 1 has the preferred age, gender, and has 4 common interests.
tinder.signup(6, 0, 1, 30, 25, 33, ["Volleyball", "Skating"]);
tinder.getMatches(5); // return [1, 6], user 6 has the preferred age, gender, and has 1 common interest.
tinder.getMatches(6); // return [3, 5], users 3 and 5 both have the preferred age, gender,
                      // and have 1 common interest. Since they both have 1 common interest
                      // and 3 < 5, user 3 is returned before user 5.
```

 

### Constraints:

- `1 <= userId <= 104`
- `0 <= gender, preferredGender <= 1`
- `18 <= age <= 90`
- `18 <= minPreferredAge <= maxPreferredAge <= 90`
- `1 <= interests.length <= 5`
- `1 <= interests[i].length <= 20`
- `interests[i]` consists of lowercase and uppercase English letters and `' '`.
- All strings in `interests` are unique.
- At most `1000` calls will be made to `signup` and `getMatches`.
- `userId` will be **unique** across all calls made to `signup`.



### Hint #1

Create a User class to more easily store each user.



### Hint #2

Could you use a data structure to easily map a userId to the class instance?



### Hint #3

Find all users that satisfy the conditions before sorting for the top 5.



### Solution

```java
import java.util.*;
import java.util.stream.Collectors;

/**
 * Your Tinder object will be instantiated and called as such:
 * Tinder obj = new Tinder();
 * obj.signup(userId,gender,preferredGender,age,minPreferredAge,maxPreferredAge,interests);
 * List<Integer> param_2 = obj.getMatches(userId);
 */
public class Tinder {

    private static final class User {
        private final int userId;
        private final int gender;
        private final int preferredGender;
        private final int age;
        private final int minPreferredAge;
        private final int maxPreferredAge;
        private final List<String> interests;

        // 私有构造器，通过 Builder 创建
        private User(Builder builder) {
            this.userId = builder.userId;
            this.gender = builder.gender;
            this.preferredGender = builder.preferredGender;
            this.age = builder.age;
            this.minPreferredAge = builder.minPreferredAge;
            this.maxPreferredAge = builder.maxPreferredAge;
            this.interests = builder.interests;
        }

        // Builder 静态内部类
        public static class Builder {
            private int userId = -1; // 默认值
            private int gender = -1; // 默认值
            private int preferredGender = -1; // 默认值
            private int age = -1; // 默认值
            private int minPreferredAge = -1; // 默认值
            private int maxPreferredAge = -1; // 默认值
            private List<String> interests = new ArrayList<>();

            // 构造器无参数，所有字段通过链式调用设置
            public Builder() {}

            public Builder userId(int userId) {
                this.userId = userId;
                return this;
            }

            public Builder gender(int gender) {
                this.gender = gender;
                return this;
            }

            public Builder preferredGender(int preferredGender) {
                this.preferredGender = preferredGender;
                return this;
            }

            public Builder age(int age) {
                this.age = age;
                return this;
            }

            public Builder minPreferredAge(int minPreferredAge) {
                this.minPreferredAge = minPreferredAge;
                return this;
            }

            public Builder maxPreferredAge(int maxPreferredAge) {
                this.maxPreferredAge = maxPreferredAge;
                return this;
            }

            public Builder interests(List<String> interests) {
                this.interests = interests;
                return this;
            }

            // 构建 User 实例
            public User build() {
                if (userId == -1 || gender == -1) {
                    throw new IllegalArgumentException("userId and gender are required");
                }
                return new User(this);
            }
        }
    }

    private final Map<Integer, User> userMap;

    public Tinder() {
        userMap = new HashMap<>();
    }

    public void signup(int userId, int gender, int preferredGender, int age,
                       int minPreferredAge, int maxPreferredAge, List<String> interests) {
        userMap.putIfAbsent(userId, new User.Builder()
                .userId(userId)
                .gender(gender)
                .preferredGender(preferredGender)
                .age(age)
                .minPreferredAge(minPreferredAge)
                .maxPreferredAge(maxPreferredAge)
                .interests(interests)
                .build());
    }

    public List<Integer> getMatches(int userId) {
        if (!userMap.containsKey(userId)) {
            return Collections.emptyList();
        }

        User user = userMap.get(userId);

        return userMap.values().stream()
                .filter(candidate -> candidate.userId != userId) // 排除自己
                .filter(candidate -> candidate.gender == user.preferredGender) // 性别匹配
                .filter(candidate -> candidate.age >= user.minPreferredAge && candidate.age <= user.maxPreferredAge) // 年龄匹配
                .map(candidate -> new AbstractMap.SimpleEntry<>(candidate.userId,
                        (int) user.interests.stream().filter(candidate.interests::contains).count())) // 统计共同兴趣数量
                .filter(pair -> pair.getValue() > 0) // 至少有一个共同兴趣
                .sorted((a, b) -> {
                    int cmp = Integer.compare(b.getValue(), a.getValue());
                    return cmp != 0 ? cmp : Integer.compare(a.getKey(), b.getKey());
                })
                .limit(5) // 最多返回 5 个匹配
                .map(AbstractMap.SimpleEntry::getKey) // 提取用户 ID
                .collect(Collectors.toList());
    }
}
```

