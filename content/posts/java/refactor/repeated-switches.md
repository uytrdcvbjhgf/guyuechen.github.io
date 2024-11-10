+++
title = '代码坏味道之重复的Switch (Repeated Switches)'
date = 2024-10-13T18:24:22+08:00
categories = ['java']
tags = ['refactor']
+++

**定义**

在不同的地方反复使用同样的switch逻辑

**影响**

- 影响可维护性：每当需要增加一个选择分支时，必须找到所有switch，并逐一更新

**改进目标**

- 消除重复switch，提升代码可修改/可扩展能力

**方法**

- 多态取代条件表达式

> 案例：重复Switch对可维护性的影响


**代码背景**

- 某同学退休后养了些宠物，现在想用代码得出每天需要再各种宠物上付出的金钱和精力。
- 其中client为客户端，在Main方法中传递Pet对象到server端的KeepPetCosts方法，并获取返回的Cost对象。

**症状/问题**

- 在样例类PetCosts的不同的方法里，重复的switch反复出现
- 实际业务代码中，相同或相似的switch可能散落在多个类文件中
- 假设该同学家里又新增了鸟类宠物Bird，那 么我们就需要在所有switch位置新增一个case分支
- 实际业务代码中，每增加一个新分类，就要修改散落在多个文件的switch，造成散弹式修改，代码难扩展，可维护性较差

```java
/**
 * 饲养宠物耗费精力
 */
public class PetCosts {
    private final Pet pet;

    public PetCosts(Pet pet) {
        this.pet = pet;
    }

    /**
     * 每天需要陪伴的时间
     * 
     * @return 每天需要陪伴的时间
     */
    public String getDailyCompanyTime() {
        switch (pet.getSpecies()) {
            case "Dog":
                return 90 + 60 * pet.getQuantity() + " minutes";
            case "Cat":
                return 60 * pet.getQuantity() + " minutes";
            case "Fish":
                return "20 minutes";
            default:
                return "unknown";
        }
    }

    /**
     * 每天需要花费的金钱
     * 
     * @return 每天需要花费的金钱
     */
    public double getDailyPay() {
        switch (pet.getSpecies()) {
            case "Dog":
                return pet.getDailyFeedingPay() * pet.getQuantity() * 1.5;
            case "Cat":
                return pet.getDailyFeedingPay() * pet.getQuantity() * 1.2;
            case "Fish":
                return pet.getDailyFeedingPay() * pet.getQuantity() + 2;
            default:
                return -1;
        }
    }

    /**
     * 清理频率
     * 
     * @return 清理频率
     */
    public String getCleanFrequency() {
        switch (pet.getSpecies()) {
            case "Dog":
                return "wash every 2 weeks";
            case "Cat":
                return "wash every 6 weeks";
            case "Fish":
                return "change the water every 10 days";
            default:
                return "unknown";
        }
    }
}
```

```java
/**
 * 饲养宠物耗费的精力
 */
public class KeepPetCosts {
    /**
     * 获取饲养宠物耗费的精力
     * 
     * @param pet 宠物信息
     * @return 耗费的精力
     */
    public Costs getKeepPetCosts(Pet pet) {
        PetCosts petCosts = new PetCosts(pet);
        return new Costs(pet.getSpecies(), petCosts.getDailyPay(),
            petCosts.getDailyCompanyTime(), petCosts.getCleanFrequency());
    }
}
```

> 改进手法：用多态取代重复switch


```java
/**
 * 饲养宠物耗费精力
 */
public abstract class PetCosts {
    protected final Pet pet;

    protected PetCosts(Pet pet) {
        this.pet = pet;
    }

    /**
     * 每天需要陪伴的时间
     * 
     * @return 每天需要陪伴的时间
     */
    public abstract String getDailyCompanyTime();

    /**
     * 每天需要花费的金钱
     * 
     * @return 每天需要花费的金钱
     */
    public abstract double getDailyPay();

    /**
     * 清理频率
     * 
     * @return 清理频率
     */
    public abstract String getCleanFrequency();
}
```

```java
public class CatCosts extends PetCosts {
    public CatCosts(Pet pet) {
        super(pet);
    }

    @Override
    public String getDailyCompanyTime() {
        return 60 * pet.getQuantity() + " minutes";
    }

    @Override
    public double getDailyPay() {
        return pet.getDailyFeedingPay() * pet.getQuantity() * 1.2;
    }

    @Override
    public String getCleanFrequency() {
        return "wash every 6 weeks";
    }
}
```

```java
public class DogCosts extends PetCosts {
    public DogCosts(Pet pet) {
        super(pet);
    }

    @Override
    public String getDailyCompanyTime() {
        return 90 + 60 * pet.getQuantity() + " minutes";
    }

    @Override
    public double getDailyPay() {
        return pet.getDailyFeedingPay() * pet.getQuantity() * 1.5;
    }

    @Override
    public String getCleanFrequency() {
        return "wash every 2 weeks";
    }
}
```

```java
public class FishCosts extends PetCosts {
    public FishCosts(Pet pet) {
        super(pet);
    }

    @Override
    public String getDailyCompanyTime() {
        return "20 minutes";
    }

    @Override
    public double getDailyPay() {
        return pet.getDailyFeedingPay() * pet.getQuantity() + 2;
    }

    @Override
    public String getCleanFrequency() {
        return "change the water every 10 days";
    }
}
```

```java
public class UnknownPetCosts extends PetCosts {
    public UnknownPetCosts(Pet pet) {
        super(pet);
    }

    @Override
    public String getDailyCompanyTime() {
        return "unknown";
    }

    @Override
    public double getDailyPay() {
        return -1;
    }

    @Override
    public String getCleanFrequency() {
        return "unknown";
    }
}
```

```java
public class PetCostsFactory {
    public PetCosts createPetCosts(Pet pet) {
        switch (pet.getSpecies()) {
            case "Dog":
                return new DogCosts(pet);
            case "Cat":
                return new CatCosts(pet);
            case "Fish":
                return new FishCosts(pet);
            default:
                return new UnknownPetCosts(pet);
        }
    }
}
```

```java
/**
 * 饲养宠物耗费的精力
 */
public class KeepPetCosts {
    /**
     * 获取饲养宠物耗费的精力
     * 
     * @param pet 宠物信息
     * @return 耗费的精力
     */
    public Costs getKeepPetCosts(Pet pet) {
        PetCosts petCosts = new PetCostsFactory().createPetCosts(pet);
        return new Costs(pet.getSpecies(), petCosts.getDailyPay(),
            petCosts.getDailyCompanyTime(), petCosts.getCleanFrequency());
    }
}
```


![](https://raw.githubusercontent.com/guyuechen/gallery/main/img/a8e699132676ecd53af6716cd901c0ff.svg)> 操作手法

| 操作                   | 快捷键（推荐）                            | Ctrl+Alt+Shift+T（或：鼠标右键“Refactor”） |
| ---------------------- | ----------------------------------------- | ------------------------------------------ |
| 创建子类               | Alt+Enter -> Create SubClass              |                                            |
| 用工厂替换构造方法     |                                           | Replace Constructor With Factory Method    |
| 多态返回子类对象       | （需手动编写）                            | （需手动编写）                             |
| 方法搬移               | F6                                        | Extract Method                             |
| 静态方法转换为实例方法 |                                           | Convert To Instance Method                 |
| 方法下移到子类         |                                           | Push Members down                          |
| 修改visibility         | Alt+Enter -> Make xxx protected/public/…… |                                            |


补充：全局搜索switch，看重复的判断条件是否反复出现（有时switch会以if-else形态出现，也需要关注）
