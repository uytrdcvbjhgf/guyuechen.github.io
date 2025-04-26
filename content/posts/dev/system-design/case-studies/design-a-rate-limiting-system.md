+++
title = 'Design a Rate Limiting System'
date = 2025-02-22T13:10:14+08:00
categories = ["system-design"]
tags = ["system-design"]
+++

A **Rate Limiting System** can allow a maximum of `n` requests every `t` seconds, using an implementation similar to **the sliding window algorithm**.

Given two positive integers `n` and `t`, and a **non-decreasing** stream of integers representing the timestamps of requests, implement a data structure that can check if each request is allowed or not.

Implement the **RateLimiter** class:

- `RateLimiter(int n, int t)` Initializes the RateLimiter object with an empty stream and two integers `n` and `t`.
- `boolean shouldAllow(int timestamp)` Returns `true` if the current request with timestamp `timestamp` is allowed, otherwise returns `false`. **Note** that while checking if the current request should be allowed, only the timestamps of requests **previously allowed** are considered.

 

### Example 1:

```json
Input
["RateLimiter", "shouldAllow", "shouldAllow", "shouldAllow", "shouldAllow", "shouldAllow"]
[[3, 5], [1], [1], [2], [3], [8]]
Output
[null, true, true, true, false, true]

Explanation
RateLimiter rateLimiter = new RateLimiter(3, 5);
rateLimiter.shouldAllow(1); // returns True
                            // There are no previous requests, so this request is allowed.
rateLimiter.shouldAllow(1); // returns True
                            // We can allow 3 requests every 5 seconds, so this request is allowed.
                            // Timestamps of allowed requests are [1,1].
rateLimiter.shouldAllow(2); // returns True
                            // Timestamps of allowed requests are [1,1,2].
rateLimiter.shouldAllow(3); // returns False
                            // This request is not allowed because
                            // the time range [1,3] already has 3 allowed requests.
rateLimiter.shouldAllow(8); // returns True
                            // This request is allowed because
                            // the time range [4,8] does not have any allowed requests.
```

 

### Constraints:

- `1 <= n <= 10^5`
- `1 <= t, timestamp <= 10^5`
- At most `10^5` calls will be made to `shouldAllow`.
- `timestamp` values will be **non-decreasing** over all calls made to `shouldAllow`.



### Hint #1

How can we store the number of accepted requests in a time range of size t?



### Hint #2

Since timestamps of requests will be given in non-decreasing order, which requests should we store for future reference?



### Solution #1

```java
/**
 * Your RateLimiter object will be instantiated and called as such:
 * RateLimiter obj = new RateLimiter(n, t);
 * boolean param_1 = obj.shouldAllow(timestamp);
 */
public class RateLimiter {

    Deque<Integer> queue;
    private final int capacity;
    private final int time;

    public RateLimiter(int n, int t) {
        queue = new ArrayDeque<>();
        this.capacity = n;
        this.time = t;
    }

    public boolean shouldAllow(int timestamp) {
        while (!queue.isEmpty() && isOutside(timestamp)) {
            queue.pollFirst();
        }
        if (queue.size() < capacity) {
            queue.offerLast(timestamp);
            return true;
        }
        return false;
    }

    private boolean isOutside(int timestamp) {
        return timestamp >= queue.peekFirst() + time;
    }
}
```

#### Highlights

**分析**

- **滑动窗口的实现**：通过一个队列（`Deque`）来存储时间戳，队列中的时间戳代表当前时间窗口内的请求。
- **窗口的动态调整**：在每次请求时，通过`isOutside`方法检查队列头部的时间戳是否已经超出时间窗口（`timestamp >= queue.peekFirst() + time`），如果超出则移除该时间戳。
- **请求数量的控制**：如果队列中的请求数量小于容量（`capacity`），则允许新的请求并记录时间戳；否则拒绝请求。

**特点**

- **精确的时间窗口管理**：通过动态移除过期的时间戳，确保统计的请求数量始终在当前时间窗口内。
- **高效的空间利用**：队列中只存储当前时间窗口内的请求时间戳，避免了无效数据的存储。



### Solution #2

```java
/**
 * Your RateLimiter object will be instantiated and called as such:
 * RateLimiter obj = new RateLimiter(n, t);
 * boolean param_1 = obj.shouldAllow(timestamp);
 */
class RateLimiter {
    
    int limit;
    int timeWindow;
    LinkedList<Integer> allowedRequests = new LinkedList<>();
    public RateLimiter(int N, int T) {
        limit = N;
        timeWindow = T;
	}

    public boolean shouldAllow(int timestamp) {
        int minAllowedTime = timestamp - timeWindow+1 ;
		while(allowedRequests.size() > 0 && allowedRequests.getFirst() < minAllowedTime) {
            allowedRequests.removeFirst();
        }
        if(allowedRequests.size() < limit) {
            allowedRequests.add(timestamp);
			return true;
        }
        return false;
    }
}
```

#### Highlights

**分析**

- **滑动窗口的实现**：通过一个链表（`LinkedList`）来存储时间戳，链表中的时间戳代表当前时间窗口内的请求。
- **窗口的动态调整**：在每次请求时，计算当前时间窗口的最小允许时间（`minAllowedTime = timestamp - timeWindow + 1`），并移除所有小于该时间的时间戳。
- **请求数量的控制**：如果链表中的请求数量小于限制（`limit`），则允许新的请求并记录时间戳；否则拒绝请求。

**特点**

- **直观的时间窗口计算**：通过`minAllowedTime`明确计算了时间窗口的起点，逻辑清晰易懂。
- **灵活性**：使用`LinkedList`实现，虽然在某些操作上可能不如`Deque`高效，但代码结构简单，易于扩展。



### More Info

限流的实现方式多种多样，常见的有以下几种：

- **计数器算法**：记录单位时间内的请求数量，超过阈值则拒绝请求。
- **滑动窗口算法**：在固定时间窗口内动态统计请求数量，比计数器算法更精确。
- **漏桶算法（Leaky Bucket）**：以固定的速率处理请求，超出速率的请求会被缓存或丢弃。
- **令牌桶算法（Token Bucket）**：系统以固定速率生成令牌，请求需要消耗令牌，没有令牌时拒绝请求。
- **分布式限流**：在分布式系统中，通过共享存储（如Redis）实现全局限流。

而上面两个解决方案都属于**滑动窗口算法**的变体。

- 滑动窗口算法的核心思想是动态统计一个时间窗口内的请求数量，并根据当前时间窗口内的请求数量决定是否允许新的请求。

- **Solution #1 和 Solution #2 都属于滑动窗口算法**，它们通过动态维护一个时间窗口内的请求时间戳，来控制请求速率。
- **区别**：
  - Solution #1 使用`Deque`实现，代码更简洁，性能可能更高。
  - Solution #2 使用`LinkedList`实现，逻辑更直观，易于理解和扩展。

滑动窗口算法的优势在于它能够精确地统计当前时间窗口内的请求数量，避免了固定窗口算法的边界问题（如时间窗口切换时的请求突增），同时实现相对简单，适合大多数限流场景。