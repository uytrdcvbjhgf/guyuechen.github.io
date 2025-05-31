+++
title = '深入理解 package-lock.json 的用途与适用场景'
date = 2025-05-31T12:38:34+09:00
categories = ["front"]
tags = ["front"]

+++

## `package.json` 与 `package-lock.json` 的区别

任何 Node.js 应用程序一般都有一个 `package.json` 文件，用来描述项目基本信息、依赖包名称和版本、脚本等内容。

当执行 `npm install` 时，npm 会根据 `package.json` 中的依赖信息安装相应的依赖包及版本。

而 `package-lock.json` 是 npm 生成的一个锁定文件，主要用于精确记录项目中安装的所有依赖包及其具体版本。这个文件在执行 `npm install` 时自动创建，确保不同环境安装依赖包的一致性，避免因版本不一致而导致问题。

### 两者的差异

- 在 `package.json` 中，通常使用“语义化版本（Semantic Versioning）”的方式定义版本范围，例如：
  
  ```json
  {
    "devDependencies": {
      "@angular/cli": "^9.1.14",
      "@angular-devkit/build-angular": "~0.901.14",
      "@angular/compiler-cli": "9.1.13"
    }
  }
  ```

这种方式允许安装范围内的最新版本（例如 `^9.1.14` 表示可以安装 `9.x.x` 最新版），优点是便于及时获得更新，缺点则是**容易导致项目依赖不稳定**。

- 而 `package-lock.json` 则记录了执行 `npm install` 时实际安装的所有依赖包的精确版本，作用是：
  - 确保各个环境（如开发团队、持续集成环境、部署环境）安装相同版本的依赖。
  - 加快安装过程，无需每次重新解析依赖关系。
  - 便于版本控制工具（如Git）清晰地追踪版本变动。

### 依赖定义方式

- **`package.json` 中的定义方式示例**：

  ```json
  {
    "dependencies": {
      "lodash": "^4.17.21",
      "express": "~4.18.2",
      "moment": "2.29.1"
    }
  }
  ```

  以上定义意味着：

  - `lodash` 可安装 `4.x.x` 中的最新版本。
  - `express` 可安装 `4.18.x` 中的最新版本。
  - `moment` 必须安装精确的 `2.29.1` 版本。

  这种灵活的定义方法便于更新，但可能导致不同环境安装的版本差异。

- **`package-lock.json` 中的精确版本示例**：

  ```json
  {
    "name": "example-project",
    "version": "1.0.0",
    "lockfileVersion": 2,
    "requires": true,
    "packages": {
      "": {
        "name": "example-project",
        "version": "1.0.0",
        "dependencies": {
          "lodash": "^4.17.21",
          "express": "~4.18.2",
          "moment": "2.29.1"
        }
      },
      "node_modules/lodash": {
        "version": "4.17.21",
        "resolved": "https://registry.npmjs.org/lodash/-/lodash-4.17.21.tgz",
        "integrity": "sha512-v2kDE8ks..."
      },
      "node_modules/express": {
        "version": "4.18.2",
        "resolved": "https://registry.npmjs.org/express/-/express-4.18.2.tgz",
        "integrity": "sha512-qC..."
      },
      "node_modules/moment": {
        "version": "2.29.1",
        "resolved": "https://registry.npmjs.org/moment/-/moment-2.29.1.tgz",
        "integrity": "sha512-qTX..."
      }
    },
    "dependencies": {
      "lodash": {
        "version": "4.17.21",
        "resolved": "https://registry.npmjs.org/lodash/-/lodash-4.17.21.tgz",
        "integrity": "sha512-v2kDE8ks..."
      },
      "express": {
        "version": "4.18.2",
        "resolved": "https://registry.npmjs.org/express/-/express-4.18.2.tgz",
        "integrity": "sha512-qC..."
      },
      "moment": {
        "version": "2.29.1",
        "resolved": "https://registry.npmjs.org/moment/-/moment-2.29.1.tgz",
        "integrity": "sha512-qTX..."
      }
    }
  }
  ```

  在此文件中，每个依赖项都有确定的 `version`、`resolved` 下载地址以及用于校验下载内容的 `integrity` 校验码，从而确保依赖的一致性与安全性。

### 两者在安装上的关系

- 执行 `npm install` 时：
  - 如果存在 `package-lock.json`，npm 将根据其中的精确版本安装依赖。
  - 如果不存在该文件，npm 则根据 `package.json` 自动解析依赖关系、安装最新符合版本范围的包并生成新的 `package-lock.json`。
- 执行 `npm ci` 时：
  - npm 会严格按照已有的 `package-lock.json` 安装精确版本，忽略 `package.json` 的版本范围定义。
  - 如果 `package-lock.json` 和 `package.json` 存在冲突（如锁定版本超出 `package.json` 允许的范围），则直接报错。

### 为什么需要同时维护两个文件？

- **版本稳定性**
   依靠 `package-lock.json` 保证项目在不同机器、不同环境上的依赖一致性，避免依赖版本波动带来的风险。
- **版本灵活性**
   通过 `package.json` 的版本范围定义，使项目能轻松更新非核心依赖，从而便于项目维护与迭代。



## 示例：`npm ci` 后生成的 `package-lock.json`

例如，`package.json` 如下：

```json
{
  "dependencies": {
    "axios": "^1.6.5",
    "chalk": "~5.3.0"
  }
}
```

在初次执行 `npm install` 后生成的 `package-lock.json` 可能如下：

```json
{
  "name": "example-app",
  "lockfileVersion": 3,
  "requires": true,
  "packages": {
    "": {
      "dependencies": {
        "axios": "^1.6.5",
        "chalk": "~5.3.0"
      }
    },
    "node_modules/axios": {
      "version": "1.6.7",
      "resolved": "https://registry.npmjs.org/axios/-/axios-1.6.7.tgz",
      "integrity": "sha512-abc123..."
    },
    "node_modules/chalk": {
      "version": "5.3.0",
      "resolved": "https://registry.npmjs.org/chalk/-/chalk-5.3.0.tgz",
      "integrity": "sha512-xyz456..."
    }
  },
  "dependencies": {
    "axios": {
      "version": "1.6.7",
      "resolved": "https://registry.npmjs.org/axios/-/axios-1.6.7.tgz",
      "integrity": "sha512-abc123..."
    },
    "chalk": {
      "version": "5.3.0",
      "resolved": "https://registry.npmjs.org/chalk/-/chalk-5.3.0.tgz",
      "integrity": "sha512-xyz456..."
    }
  }
}
```

通过此示例可以清楚地看到，`package-lock.json` 明确指定了安装的具体版本（如 `axios` 的 `1.6.7` 而非模糊的范围），使项目的依赖环境明确稳定。



## `npm install` 与 `npm ci` 的差异与使用场景

- **`npm install`** 通常用于日常开发，会参考已有的 `package-lock.json` 文件安装指定版本的依赖包。如果文件不存在，则自动生成新的 `package-lock.json`。
- **`npm ci`** 通常用于持续集成（CI）环境，严格根据 `package-lock.json` 安装精确的版本。它安装速度更快，并确保环境间版本完全一致。但要求 `package.json` 与 `package-lock.json` 内容相容，否则会导致安装失败。



## 最佳实践

1. 应避免直接人工编辑 `package.json` 中的版本范围，而是通过 `npm install [package-name]@[version]` 或 `npm update` 命令进行更新，确保 `package-lock.json` 与之对应。
2. 应将 `package-lock.json` 纳入 Git 版本控制，并通过版本控制工具的保护机制避免随意变动。
3. 持续集成环境（CI/CD）应尽量使用 `npm ci` 命令安装依赖包。
4. 项目拉取代码后，应首先尝试用 `npm ci` 验证环境的一致性。
5. 在团队中应明确由少数成员负责维护 `package-lock.json` 文件，并进行相应培训。
6. 仅当依赖有新增或移除时才执行 `npm install`，并及时提交变更后的 `package-lock.json`。
7. 如果开发的是库或工具类项目，则通常不建议提交 `package-lock.json` 至版本控制系统，以避免使用者安装时出现依赖版本冲突。



## 参考文献

- [package-lock.json | npm Docs](https://docs.npmjs.com/cli/v9/configuring-npm/package-lock-json)
- [npm-update | npm Docs](https://docs.npmjs.com/cli/v11/commands/npm-update)
- [npm-shrinkwrap | npm Docs](https://docs.npmjs.com/cli/v11/commands/npm-shrinkwrap)
- [The Complete Guide to package-lock.json | Pavesoft](https://medium.com/pavesoft/package-lock-json-the-complete-guide-2ae40175ebdd)
- [Predefined variables - Azure Pipelines | Microsoft Learn](https://learn.microsoft.com/en-us/azure/devops/pipelines/build/variables?view=azure-devops&WT.mc_id=DT-MVP-4015686&tabs=yaml)