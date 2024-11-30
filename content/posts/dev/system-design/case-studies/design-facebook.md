+++
title = 'Design Facebook'
date = 2024-11-30T22:32:01+08:00
categories = ["system-design"]
tags = ["system-design"]

+++

Design a system like **Facebook** with the following features:

1. A user can write a **post**.
2. Two users can become **friends** with each other.
3. Users can see all the posts written by their friends.

Implement the `Facebook` class:

- `Facebook()` Initializes the object.
- `void writePost(int userId, String postContent)` The user with id `userId` writes a post with the content `postContent`.
- `void addFriend(int user1, int user2)` `user1` and `user2` become friends with each other. This call should be **ignored** if `user1` and `user2` are already friends.
- `List<String> showPosts(int userId)` Returns all the posts made by the friends of the user with id `userId` ordered by the **latest** ones first, including ones made before they became friends. **Note** that the posts made by user `userId` should **not** be returned.



### Example 1:

```
Input
["Facebook", "addFriend", "writePost", "writePost", "writePost", "writePost", "showPosts", "showPosts", "addFriend", "showPosts", "showPosts", "showPosts"]
[[], [1, 2], [1, "postone"], [2, "posttwo"], [3, "postthree"], [2, "postfour"], [2], [3], [2, 3], [1], [2], [3]]
Output
[null, null, null, null, null, null, ["postone"], [], null, ["postfour", "posttwo"], ["postthree", "postone"], ["postfour", "posttwo"]]

Explanation
Facebook facebook = new Facebook();
facebook.addFriend(1, 2); // Users 1 and 2 become friends.
facebook.writePost(1, "postone"); // "postone" is posted by user 1.
facebook.writePost(2, "posttwo"); // "posttwo" is posted by user 2.
facebook.writePost(3, "postthree"); // "postthree" is posted by user 3.
facebook.writePost(2, "postfour"); // "postfour" is posted by user 2.
facebook.showPosts(2); // return ["postone"]
                       // User 2 has only one friend, which is user 1 who has posted one time so far.
facebook.showPosts(3); // return []
                       // User 3 does not have any friends yet, so we return [].
facebook.addFriend(2, 3); // Users 2 and 3 become friends.
facebook.showPosts(1); // return ["postfour", "posttwo"]
                       // The only friend of user 1 is user 2 who has two posts, so we return them.
facebook.showPosts(2); // return ["postthree", "postone"]
                       // Users 1 and 3 are the friends of user 2.
                       // Both users 1 and 3 have one post each, but user 3 posted last,
                       // so we return user 3's post first.
facebook.showPosts(3); // return ["postfour", "posttwo"]
                       // The only friend of user 3 is user 2 who has two posts.
```

 

### Constraints:

- `1 <= userId <= 1000`
- `1 <= postContent.length <= 100`
- `user1 != user2`
- `postContent` consists of lowercase English letters.
- At most `100` calls will be made to `writePost`.
- At most `1000` calls will be made to `addFriend`.
- At most `100` calls will be made to `showPosts`.



### Hint #1

Keep track of the posts and the list of friends of each user.



### Hint #2

Iterate over the friends of the user and their posts.



### Solution

```java
/**
 * Your Facebook object will be instantiated and called as such:
 * Facebook obj = new Facebook();
 * obj.writePost(userId,postContent);
 * obj.addFriend(user1,user2);
 * List<String> param_3 = obj.showPosts(userId);
 */
class Facebook {

    private final Map<Integer, Set<Integer>> friends;
    private final Map<Integer, List<Pair<Integer, String>>> posts;
    private int count;
    
    public Facebook() {
        this.friends = new HashMap<>();
        this.posts = new HashMap<>();
        this.count = 0;
    }
    
    public void writePost(int userId, String postContent) {
        friends.putIfAbsent(userId, new HashSet<>());
        posts.putIfAbsent(userId, new ArrayList<>());

        posts.get(userId).add(new Pair<>(++count, postContent));
    }
    
    public void addFriend(int user1, int user2) {
        friends.putIfAbsent(user1, new HashSet<>());
        friends.putIfAbsent(user2, new HashSet<>());
        posts.putIfAbsent(user1, new ArrayList<>());
        posts.putIfAbsent(user2, new ArrayList<>());
        
        friends.get(user1).add(user2);
        friends.get(user2).add(user1);
    }
    
    public List<String> showPosts(int userId) {
        // 如果用户不存在或没有好友，直接返回空列表
        if (!posts.containsKey(userId) || !friends.containsKey(userId)) {
            return Collections.emptyList();
        }

        return friends.get(userId).stream() // 遍历用户的好友
                .flatMap(friend -> posts.getOrDefault(friend, Collections.emptyList()).stream()) // 展开好友的帖子
                .sorted((p1, p2) -> Integer.compare(p2.getKey(), p1.getKey())) // 按时间戳倒序排列
                .map(Pair::getValue) // 提取帖子的内容
                .collect(Collectors.toList()); // 收集为列表
    }
}
```

