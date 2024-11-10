+++
title = '一道sql面试题'
date = 2024-08-31T11:50:13+08:00
categories = ["sql"]
tags = ["sql"]
+++

> 假设有以下3张表

```sql
create table course (
  `id` integer primary key,
  `name` text not null
);

create table student (
  `id` integer primary key,
  `name` text not null
);

create table score (
  `id` integer primary key,
  `course_id` integer not null,
  `student_id` integer not null,
  `score` integer not null
);
```

> 初始化以下数据

```sql
-- insert
insert into course
values
(1, '语文'),
(2, '数学'),
(3, '外语');

insert into student
values
(1, '张三'),
(2, '李四'),
(3, '王二麻子');

insert into score
values
(1, 1, 1, 80),
(2, 2, 1, 90),
(3, 3, 1, 70),
(4, 1, 2, 70),
(5, 2, 2, 90),
(6, 3, 2, 80),
(7, 1, 3, 80),
(8, 2, 3, 60),
(9, 3, 3, 70);
```

> 求总分最高的学生的名字以及他（们）的分数

```sql
-- 先求出最高总分
select sum(score) from score
group by student_id
order by sum(score) desc
limit 1
```

![image-20231004144944663](https://raw.githubusercontent.com/guyuechen/gallery/main/img/image-20231004144944663.png)

```sql
-- 查出分数为最高分的所有学生id
select distinct(student_id), sum(score) from score
group by student_id
having sum(score) = 
(
  select sum(score) from score
  group by student_id
  order by sum(score) desc
  limit 1
)
```

![image-20231004145042418](https://raw.githubusercontent.com/guyuechen/gallery/main/img/image-20231004145042418.png)

```sql
-- 两表连接得到其他需要的信息
select s.name, t.score
from student s
right join 
(
  select distinct(student_id), sum(score) as score from score
  group by student_id
  having sum(score) = 
  (
    select sum(score) from score
    group by student_id
    order by sum(score) desc
    limit 1
  )
) t
ON
s.id = t.student_id
```

![image-20231004145258381](https://raw.githubusercontent.com/guyuechen/gallery/main/img/image-20231004145258381.png)

> 求单科最高的学生的名字以及他们的分数

```sql
-- 先求出单科最高分
select max(score) max_score, course_id
from score
group by course_id
```

![image-20231004152115447](https://raw.githubusercontent.com/guyuechen/gallery/main/img/image-20231004152115447.png)

```sql
-- 查出得到单科最高分的所有学生（单表自连接）
select s1.student_id, s1.course_id, s2.max_score
from score s1
right join 
(
  select max(score) max_score, course_id
  from score
  group by course_id
) s2
ON
s1.course_id = s2.course_id
and
s1.score = s2.max_score
```

![image-20231004152156889](https://raw.githubusercontent.com/guyuechen/gallery/main/img/image-20231004152156889.png)

```sql
-- 最后再两表连接得到其他需要的信息（最后2个left join就是让id转成对应释义）
select st.name, c.name, s2.max_score
from score s1
right join 
(
  select max(score) max_score, course_id
  from score
  group by course_id
) s2
ON s1.course_id = s2.course_id and s1.score = s2.max_score
left join course c on c.id = s1.course_id
left join student st on st.id = s1.student_id
```

![image-20231004152226326](https://raw.githubusercontent.com/guyuechen/gallery/main/img/image-20231004152226326.png)
