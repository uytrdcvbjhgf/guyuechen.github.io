+++
title = 'Design Twitter'
date = 2024-12-14T11:34:28+08:00
categories = ["system-design"]
tags = ["system-design"]
+++

Design a simplified version of Twitter where users can post tweets, follow/unfollow another user, and is able to see the `10` most recent tweets in the user's news feed.

Implement the `Twitter` class:

- `Twitter()` Initializes your twitter object.
- `void postTweet(int userId, int tweetId)` Composes a new tweet with ID `tweetId` by the user `userId`. Each call to this function will be made with a unique `tweetId`.
- `List<Integer> getNewsFeed(int userId)` Retrieves the `10` most recent tweet IDs in the user's news feed. Each item in the news feed must be posted by users who the user followed or by the user themself. Tweets must be **ordered from most recent to least recent**.
- `void follow(int followerId, int followeeId)` The user with ID `followerId` started following the user with ID `followeeId`.
- `void unfollow(int followerId, int followeeId)` The user with ID `followerId` started unfollowing the user with ID `followeeId`.

 

### Example 1:

```
Input
["Twitter", "postTweet", "getNewsFeed", "follow", "postTweet", "getNewsFeed", "unfollow", "getNewsFeed"]
[[], [1, 5], [1], [1, 2], [2, 6], [1], [1, 2], [1]]
Output
[null, null, [5], null, null, [6, 5], null, [5]]

Explanation
Twitter twitter = new Twitter();
twitter.postTweet(1, 5); // User 1 posts a new tweet (id = 5).
twitter.getNewsFeed(1);  // User 1's news feed should return a list with 1 tweet id -> [5]. return [5]
twitter.follow(1, 2);    // User 1 follows user 2.
twitter.postTweet(2, 6); // User 2 posts a new tweet (id = 6).
twitter.getNewsFeed(1);  // User 1's news feed should return a list with 2 tweet ids -> [6, 5]. Tweet id 6 should precede tweet id 5 because it is posted after tweet id 5.
twitter.unfollow(1, 2);  // User 1 unfollows user 2.
twitter.getNewsFeed(1);  // User 1's news feed should return a list with 1 tweet id -> [5], since user 1 is no longer following user 2.
```

 

### Constraints:

- `1 <= userId, followerId, followeeId <= 500`
- `0 <= tweetId <= 104`
- All the tweets have **unique** IDs.
- At most `3 * 104` calls will be made to `postTweet`, `getNewsFeed`, `follow`, and `unfollow`.
- A user cannot follow himself.



### Solution

```java
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

/**
 * Your Twitter object will be instantiated and called as such:
 * Twitter obj = new Twitter();
 * obj.postTweet(userId,tweetId);
 * List<Integer> param_2 = obj.getNewsFeed(userId);
 * obj.follow(followerId,followeeId);
 * obj.unfollow(followerId,followeeId);
 */
public class Twitter {

    private static final AtomicInteger timeStamp = new AtomicInteger(0);
    private final Map<Integer, User> userMap;

    // 推文类
    private static class Tweet {
        private final int id;
        private final int time;
        private final Tweet next;

        private Tweet(int id, int time, Tweet next) {
            this.id = id;
            this.time = time;
            this.next = next;
        }

        // 使用 Builder 构建 Tweet
        public static class Builder {
            private int id;
            private int time;
            private Tweet next;

            public Builder id(int id) {
                this.id = id;
                return this;
            }

            public Builder time(int time) {
                this.time = time;
                return this;
            }

            public Builder next(Tweet next) {
                this.next = next;
                return this;
            }

            public Tweet build() {
                return new Tweet(id, time, next);
            }
        }
    }

    // 用户类
    private static class User {
        private final int id;
        private final Set<Integer> followed;
        private Tweet tweetHead;

        public User(int id) {
            this.id = id;
            this.followed = new HashSet<>();
            follow(id); // 自己默认关注自己
        }

        public void follow(int userId) {
            followed.add(userId);
        }

        public void unfollow(int userId) {
            if (userId != this.id) {
                followed.remove(userId);
            }
        }

        public void post(int tweetId) {
            tweetHead = new Tweet.Builder()
                    .id(tweetId)
                    .time(timeStamp.getAndIncrement())
                    .next(tweetHead)
                    .build();
        }
    }

    public Twitter() {
        this.userMap = new HashMap<>();
    }

    private User getOrCreateUser(int userId) {
        return userMap.computeIfAbsent(userId, User::new);
    }

    public void postTweet(int userId, int tweetId) {
        getOrCreateUser(userId).post(tweetId);
    }

    public List<Integer> getNewsFeed(int userId) {
        if (!userMap.containsKey(userId)) {
            return Collections.emptyList();
        }

        // 获取用户自己和其关注用户的所有推文头
        List<Tweet> tweets = userMap.get(userId).followed.stream()
                .map(userMap::get)
                .filter(Objects::nonNull)
                .map(user -> user.tweetHead)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        // 使用优先队列（最大堆）获取最近的 10 条推文
        PriorityQueue<Tweet> maxHeap = new PriorityQueue<>(
                Comparator.comparingInt((Tweet t) -> t.time).reversed());
        maxHeap.addAll(tweets);

        List<Integer> result = new ArrayList<>();
        while (!maxHeap.isEmpty() && result.size() < 10) {
            Tweet top = maxHeap.poll();
            result.add(top.id);
            if (top.next != null) {
                maxHeap.add(top.next);
            }
        }
        return result;
    }

    public void follow(int followerId, int followeeId) {
        getOrCreateUser(followerId).follow(followeeId);
        getOrCreateUser(followeeId); // 确保被关注用户存在
    }

    public void unfollow(int followerId, int followeeId) {
        User follower = userMap.get(followerId);
        if (follower != null) {
            follower.unfollow(followeeId);
        }
    }
}

```



### Highlights

#### **1. 面向对象的设计**

- 模块化设计：
  - `Twitter`、`User` 和 `Tweet` 分别封装了不同的职责：
    - `Twitter` 负责整体逻辑，包含用户管理、推文管理和关注操作。
    - `User` 处理用户的推文和关注关系。
    - `Tweet` 通过链表的形式记录推文历史，提供了高效的时间线操作。
  - 这种清晰的模块化设计便于扩展和维护。
- Builder 模式：
  - 使用 Builder 模式构建 `Tweet` 对象，提升了代码的可读性和灵活性，特别是在对象初始化中清晰地描述了每个字段的含义。

#### **2. 灵活且高效的功能实现**

- **优先队列（最大堆）解决获取最新推文：**
  - 时间线查询通过优先队列（`PriorityQueue`）实现，利用堆排序的特性高效获取最近的推文，避免了遍历所有推文的低效操作。
- **链表存储历史推文：**
  - 每个用户的推文用链表存储，追加推文时直接指向 `tweetHead`，这一方式节省了内存，并简化了时间线的操作。
- **时间戳的全局管理：**
  - 使用线程安全的 `AtomicInteger` 管理时间戳，确保在多线程场景下的安全性，同时提供了全局唯一的时间戳值，方便时间线排序。

#### **3. 现代化编程风格**

- 使用 Stream API：
  - 利用 Java 8 的 `Stream API`简化了集合操作：
    - 例如获取关注用户的推文头时，通过流的方式筛选非空用户和非空推文，使代码更简洁清晰。
- 使用 `computeIfAbsent` 简化用户管理：
  - 在用户不存在时动态创建用户的逻辑通过 `computeIfAbsent` 完成，减少了代码冗余，提升了代码简洁度。

#### **4. 健壮性和边界条件处理**

- **避免空指针异常：**
  - 多处使用 `Objects::nonNull` 和 `filter` 对用户或推文列表进行非空校验，有效提升了代码的健壮性。
- **无效操作的处理：**
  - 例如，`unfollow` 方法中明确禁止用户取消关注自己，避免了无效或不合理的操作。

#### **5. 可扩展性**

- **支持新增功能：**
  - 该设计易于扩展，例如：
    - 增加推文的点赞或评论功能。
    - 增加对用户信息的扩展（例如用户名、头像等）。
    - 优化时间线算法以支持分页。
- **清晰的逻辑分层：**
  - 用户的推文和关注关系由 `User` 管理，整体系统逻辑由 `Twitter` 管理。这种分层设计使得功能扩展时可以聚焦于具体的模块，而不会影响整个系统。

#### **6. 性能和内存效率**

- **减少冗余存储：**
  - 用户的推文链表只记录推文本身，无需重复存储冗余数据。
  - 使用 `Set` 存储关注用户，快速判断用户是否已关注其他用户。
- **按需加载：**
  - 时间线的推文加载采取了懒加载方式（动态获取推文链表），避免了一次性加载大量无用数据。

#### **7. API 设计符合直觉**

- 简单易用：
  - 提供的 `postTweet`、`getNewsFeed`、`follow` 和 `unfollow` 方法设计直观，符合真实场景中的用户操作。
  - 函数命名清晰，能够直观反映功能，便于理解和使用。

#### **8. 实际场景贴合度**

- 模拟真实社交网络场景：
  - 时间线推文展示包含自己和关注的用户，这一逻辑贴近真实的社交网络需求。
  - 默认关注自己，使得用户可以直接查看自己的推文。



### Summary

1. **面向对象编程的模块化设计**，职责划分明确。
2. **利用现代化 Java 特性（Stream API 和 Builder 模式）** 提高代码简洁性和可维护性。
3. **高效的数据结构和算法设计**，例如优先队列和链表的结合。
4. **对边界条件的全面考虑**，避免了潜在的异常和错误。
5. **注重代码的扩展性和灵活性**，为未来功能扩展留有余地。
6. **直观且贴近实际场景的 API 设计**，便于使用者理解和调用。