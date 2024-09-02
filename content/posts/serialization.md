+++
title = '序列化和反序列化的概念'
date = 2024-09-02T11:41:14+08:00
categories = ["java"]
tags = ["java"]
+++

**序列化（Serialization）** 可以简单理解为：**将对象转换为字节流** 的过程。想象你有一个玩具积木（对象），你想把它通过邮寄的方式发送给一个朋友（传输）。但是，你无法直接把这个立体的积木放进信封里（内存中），于是你把积木拆成一块块小的平面（字节），然后把这些小块按顺序放入信封中。这就是序列化的过程。

**反序列化（Deserialization）** 则是 **将字节流重新转换回对象** 的过程。现在，当你的朋友收到了这些积木块（字节流），他会按照你原本的积木形状（对象的结构）把它们重新拼装成原来的积木。这就是反序列化的过程。

### 在 Java 中的序列化和反序列化

在 Java 中，序列化和反序列化通常是通过 `Serializable` 接口和 `ObjectInputStream`、`ObjectOutputStream` 来实现的。

1. **实现 `Serializable` 接口**：为了使一个对象可以被序列化，该对象所属的类必须实现 `Serializable` 接口。这个接口是一个**标记接口**，它不包含任何方法，只是告诉 Java 运行时这个类的对象是可被序列化的。
2. **序列化对象**：可以使用 `ObjectOutputStream` 类的 `writeObject()` 方法将对象写入到输出流中，从而实现序列化。
3. **反序列化对象**：可以使用 `ObjectInputStream` 类的 `readObject()` 方法从输入流中读取对象，从而实现反序列化。

#### 示例代码

```java
import java.io.*;

// 一个简单的类实现了 Serializable 接口
class Person implements Serializable {
    private String name;
    private int age;

    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }

    @Override
    public String toString() {
        return "Person{name='" + name + "', age=" + age + "}";
    }
}

public class SerializationExample {
    public static void main(String[] args) {
        Person person = new Person("Alice", 30);

        // 序列化过程
        try (FileOutputStream fileOut = new FileOutputStream("person.ser");
             ObjectOutputStream out = new ObjectOutputStream(fileOut)) {
            out.writeObject(person);
            System.out.println("Serialized data is saved in person.ser");
        } catch (IOException i) {
            i.printStackTrace();
        }

        // 反序列化过程
        Person deserializedPerson = null;
        try (FileInputStream fileIn = new FileInputStream("person.ser");
             ObjectInputStream in = new ObjectInputStream(fileIn)) {
            deserializedPerson = (Person) in.readObject();
        } catch (IOException | ClassNotFoundException i) {
            i.printStackTrace();
        }

        System.out.println("Deserialized Person:");
        System.out.println(deserializedPerson);
    }
}
```

#### 解释

- **序列化过程**：`ObjectOutputStream` 将 `Person` 对象写入到文件 `person.ser` 中。
- **反序列化过程**：`ObjectInputStream` 从文件 `person.ser` 中读取数据，并重新构建成一个 `Person` 对象。

通过这种方式，Java 对象可以被保存到文件中、通过网络传输、或者存储到数据库中，并在需要的时候恢复为原始的对象。