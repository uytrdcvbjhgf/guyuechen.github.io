+++
title = 'Git手册'
date = 2024-08-30T21:50:21+08:00
categories = ["git"]
tags = ["git"]
+++

## 实际工作中的常见情况

### `git rebase`

`git rebase` 的文档描述是 `Reapply commits on top of another base tip`，从字面上理解是「在另一个基端之上重新应用提交」，这个定义听起来有点抽象。

换个角度可以理解为「将分支的基础从一个提交改成另一个提交，使其看起来就像是从另一个提交中创建了分支一样」，如下图：

<img src="https://raw.githubusercontent.com/guyuechen/gallery/main/img/git-rebase-visual.png" alt="git-rebase.png" style="zoom: 50%;" />

假设我们从 `Master` 的提交 A 创建了 `Feature` 分支进行新的功能开发，这时 A 就是 `Feature` 的基端。

接着 `Matser` 新增了两个提交 B 和 C， `Feature` 新增了两个提交 D 和 E。

现在我们出于某种原因，比如新功能的开发依赖 B、C 提交，需要将 `Master` 的两个新提交整合到 `Feature` 分支，为了保持提交历史的整洁，我们可以切换到 `Feature` 分支执行 `rebase` 操作：

```shell
git rebase master
```

`rebase` 的执行过程是首先找到这两个分支（即当前分支 `Feature`、变基操作的base分支 `Master`） 的最近共同祖先提交 A，然后对比当前分支相对于该祖先提交的历次提交（D 和 E），提取相应的修改并存为临时文件，然后将当前分支指向目标基底 `Master` 所指向的提交 C, 最后以此作为新的基端将之前另存为临时文件的修改依序应用。

我们也可以按上文理解成将 `Feature` 分支的base从提交 A 改成了提交 C，看起来就像是从提交 C 创建了该分支，并提交了 D 和 E。但实际上这只是「看起来」，在内部 Git 复制了提交 D 和 E 的内容，创建新的提交 D' 和 E' 并将其应用到特定基础上（A→B→C）。尽管新的 `Feature` 分支和之前看起来是一样的，但==它是由全新的提交组成的==。

`rebase` 操作的实质是丢弃一些现有的提交，然后相应地新建一些「内容一样但实际不同」的提交。

#### 获得远程主干的最新修改到开发分支

下面的使用场景在大多数 Git 工作流中十分常见：

- 我们从 `master` 分支拉取了一条 `feature` 分支在本地进行功能开发
- 远程的 `master` 分支在之后又合并了一些新的提交
- 我们想在 `feature` 分支集成 `master` 的最新更改

> 通过上述需求，谈谈 rebase 和 merge 的区别

以上场景同样可以使用 `merge` 来达成目的，但使用 `rebase` 可以使我们保持一个线性且更加整洁的提交历史。

假设我们有如下分支：

```perl
  D---E feature
 /
A---B---C master
```

> 使用 `merge`

1.  `git checkout feature`：切换到 `feature` 分支
2.  `git merge master`：合并 `master` 分支的更新
3.  `git add . && git commit -m "commit F"` ：新增一个提交 F
4.  `git chekcout master && git merge feature`：切回 `master` 分支并执行快进合并

执行过程如下图所示：

![Dec-30-2020-merge-example](https://raw.githubusercontent.com/guyuechen/gallery/main/img/Dec-30-2020-merge-example.gif)

提交历史如下：

```perl
* 6fa5484 (HEAD -> master, feature) commit F
*   875906b Merge branch 'master' into feature
|\  
| | 5b05585 commit E
| | f5b0fc0 commit D
* * d017dff commit C
* * 9df916f commit B
|/  
* cb932a6 commit A

```

> 使用 `rebase`

1.  `git checkout feature`：切换到 `feature` 分支
2.  `git rebase master`：合并 `master` 分支的更新
3.  `git add . && git commit -m "commit F"` ：新增一个提交 F
4.  `git chekcout master && git merge feature`：切回 `master` 分支并执行快进合并

步骤与使用 `merge` 基本相同，唯一的区别是第 2 步的命令替换成了： `git rebase master`。

执行过程如下图所示：

![Dec-30-2020-rebase-example](https://raw.githubusercontent.com/guyuechen/gallery/main/img/Dec-30-2020-rebase-example.gif)

提交历史如下：

```perl
* 74199ce (HEAD -> master, feature) commit F
* e7c7111 commit E
* d9623b0 commit D
* 73deeed commit C
* c50221f commit B
* ef13725 commit A
```

可以看到，使用 `rebase` 方法形成的==提交历史是完全线性的==，同时相比 `merge` 方法少了一次 `merge` 提交，看上去更加整洁。

#### 合并多个本地commit为一个

> 要准备提交MR了，改了半天搞了很多个commit，都push上去了，但是提交MR的时候要合成一个commit，咋搞呢？

我期望的结果是：

- 合并commit之前

  比如我现在有4个 commit ID，从新到旧分别为：

  ```perl
  85d5d8fa468b06bb9a62fafde01d80cbb7396682 # 我改的
  621ca4121f971d9604e395556763551427d799d9 # 我改的
  f744d2e91916ab7831f3a7695d1d1825916db164 # 我改的
  5c135e49e683563fa470d7f5c281050ec1d73af9 # 我改的
  295ac3b842b4ecb6eff1c9954a281a4606a8bc84 # 别人改的
  ```
  
- 合并commit之后

  我想把我改的 commit ID 全部合成一个新的 commit ID ：

  ```perl
  8403afe13664d6bb7f5a5557716a030e9389a944 # 我改的
  295ac3b842b4ecb6eff1c9954a281a4606a8bc84 # 别人改的
  ```

> 这种时候就需要`git rebase`了！

```perl
# 查看前10个commit
git log -10
# 将4个commit压缩成一个commit
git rebase -i HEAD~4	
# add已经跟踪的文件
git add -u
# 提交
git commit -m "msg (this time only 1 commit)"
# 强制push以替换远程仓的commitID
git push --force
```

注意：`git rebase` 会临时创建一个新分支进行，如果弄着出错了，可以 `git checkout 原分支名` 切换回原分支之后重新 `git rebase`。

> `git rebase`压缩commit的演示

![image-20230715215554644](https://raw.githubusercontent.com/guyuechen/gallery/main/img/image-20230715215554644.png)

```perl
git rebase -i HEAD~n
```

使用 `git rebase -i HEAD~4` 压缩4个commit为1个；

或者 `git rebase -i 797b2c6dd915fd819f81002e01c94863aaf17985` （第一个commit的id）

然后会跳出vim编辑器，按`i`进入insert模式，将后4个commit的`pick`修改为`fixup`，保留第一个`pick`。修改后按`esc`键，输入`:wq`保存退出。

```perl
# 拓展一下各个参数的含义
pick # 使用该commit
reword # 使用该commit，修改commit信息
squash # 使用该commit，将commit信息合入上一个commit
fixup # 使用该commit，丢弃commit信息
```

![image-20230715222035981](https://raw.githubusercontent.com/guyuechen/gallery/main/img/image-20230715222035981.png)

操作完之后，发现commit都合并成了一个。

![image-20230715222355031](https://raw.githubusercontent.com/guyuechen/gallery/main/img/image-20230715222355031.png)

`git push --force` 强行提交！

#### 重写提交历史

上述合并本地commit的进阶版。

假设我们在 `feature` 分支有如下提交：

```perl
74199cebdd34d107bb67b6da5533a2e405f4c330 (HEAD -> feature) commit F
e7c7111d807c1d5209b97a9c75b09da5cd2810d4 commit E
d9623b0ef9d722b4a83d58a334e1ce85545ea524 commit D
73deeedaa944ef459b17d42601677c2fcc4c4703 commit C
c50221f93a39f3474ac59228d69732402556c93b commit B
ef1372522cdad136ce7e6dc3e02aab4d6ad73f79 commit A
```

接下来我们将要执行的操作是：

- 将 B、C 合并为一个新的提交 ，并仅保留原提交 C 的提交信息
- 删除提交 D
- 将提交 E 移动到提交 F 之后并重新命名（即修改提交信息）为提交 H
- 在提交 F 中加入一个新的文件更改，并重新命名为提交 G

由于我们需要修改的提交是 B→C→D→E，因此我们需要将提交 A 作为新的「基端」，提交 A 之后的所有提交会被重新应用：

```sh
git rebase -i ef1372522cdad136ce7e6dc3e02aab4d6ad73f79 # A的commitID
```

接下来会进入到如下的初始vim编辑器界面：

```sh
pick c50221f commit B
pick 73deeed commit C
pick d9623b0 commit D
pick e7c7111 commit E
pick 74199ce commit F

# 变基 ef13725..74199ce 到 ef13725（5 个提交）
#
# 命令:
# p, pick <提交> = 使用提交
# r, reword <提交> = 使用提交，但修改提交说明
# e, edit <提交> = 使用提交，进入 shell 以便进行提交修补
# s, squash <提交> = 使用提交，但融合到前一个提交
# f, fixup <提交> = 类似于 "squash"，但丢弃提交说明日志
# x, exec <命令> = 使用 shell 运行命令（此行剩余部分）
# b, break = 在此处停止（使用 'git rebase --continue' 继续变基）
# d, drop <提交> = 删除提交
......
```

具体的操作命令在编辑器的注释中已解释的相当详细，所以我们直接进行如下操作：

- 对提交 B、C 作如下修改：

  ```sh
  pick c50221f commit B 
  f 73deeed commit C
  ```

  由于提交 B 是这些提交中的第一个，因此我们无法对其执行 `squash` 或者 `fixup` 命令（没有前一个提交了），我们也不需要对提交 B 执行 `reword` 命令以修改其提交信息，因为之后在将提交 C 融合到提交 B 中时，会允许我们对融合之后的提交信息进行修改。

  注意该界面提交的展示顺序是从上到下由旧到新，因此我们将提交 C 的命令改为 `s（或 squash）` 或者 `f（或 fixup）` 会将其融合到（上方的）前一个提交 B，两个命令的区别为是否保留 C 的提交信息。

- 删除提交 D：

  ```sh
  d d9623b0 commit D
  ```

- 移动提交 E 到提交 F 之后并修改其提交信息：

  ```sh
  pick 74199ce commit F 
  r e7c7111 commit E
  ```

- 在提交 F 中加入一个新的文件更改：

  ```sh
  e 74199ce commit F
  ```

- `:wq` 保存退出

接下来会按照从上到下的顺序依次执行我们对每一个提交所修改或保留的命令：

1. 对提交 B 的 `pick` 命令会自动执行，因此不需要交互。

2. 接着执行对提交 C 的 `fixup` 命令，丢弃C 的提交信息并讲C融合进B。

3. 对提交 D 的 `drop` 操作也会自动执行，没有交互。

4. 执行 `rebase` 的过程中可能会发生冲突，这时候 `rebase` 会暂时中止，需要我们编辑冲突的文件去手动合并冲突。

   解决冲突后通过 `git add/rm <conflicted_files>` 将其标记为已解决，然后执行 `git rebase --continue` 可以继续之后的 `rebase` 步骤；

   或者也可以执行 `git rebase --abort` 放弃 `rebase` 操作并恢复到操作之前的状态。

5. 由于我们上移了提交 F 的位置，因此接下来将执行对 F 的 `edit` 操作。这时将进入一个新的 Shell 会话：

   ```sh
   停止在 74199ce... commit F
   您现在可以修补这个提交，使用
     git commit --amend 
   
   当您对变更感到满意，执行
     git rebase --continue
   ```

   我们添加一个新的代码文件并执行 `git commit --amend` 将其合并到当前的上一个提交（即 F），然后在编辑器界面中将其提交信息修改，产生为 `commit G`，最后执行 `git rebase --continue` 继续 `rebase` 操作。

6. 最后执行对提交 E 的 `reword` 操作，在编辑器界面中将其提交信息修改，产生为 `commit H` 。

大功告成！最后让我们确认一下 `rebase` 之后的提交历史：

```perl
64710dc88ef4fbe8fe7aac206ec2e3ef12e7bca9 (HEAD -> feature) commit H
8ab4506a672dac5c1a55db34779a185f045d7dd3 commit G
1e186f890710291aab5b508a4999134044f6f846 commit C
ef1372522cdad136ce7e6dc3e02aab4d6ad73f79 commit A
```

#### 通过 rebase 策略执行 `git pull`

Git 在最近的某个版本起，直接运行 `git pull` 会有如下提示消息：

```sh
warning: 不建议在没有为偏离分支指定合并策略时执行 pull 操作。 
您可以在执行下一次 pull 操作之前执行下面一条命令来抑制本消息：

  git config pull.rebase false  # 合并（缺省策略）
  git config pull.rebase true   # 变基
  git config pull.ff only       # 仅快进
......
```

因为 `git pull` 实际上等于 `git fetch` + `git merge` ，我们可以在第二步直接用 `git rebase` 替换 `git merge`来合并 `fetch` 取得的变更，作用同样是避免额外的 `merge` 提交以保持线性的提交历史。

两者的区别在上文中已进行过对比，可以把对比示例中的 `Matser` 分支当成远程分支，把 `Feature` 分支当成本地分支，当我们在本地执行 `git pull` 时，其实就是拉取 `Master` 的更改然后合并到 `Feature` 分支。

如果两个分支都有不同的提交，默认的 `git merge` 方式会生成一个单独的 merge 提交以整合这些提交；而使用 `git rebase` 则相当于基于远程分支的最新提交重新创建本地分支，然后再重新应用本地所添加的提交。

具体的使用方式有多种：

- 每次执行 pull 命令时添加特定选项： `git pull --rebase` 
- 为当前仓库设定配置： `git config pull.rebase true`，在 `git config` 后添加 `--global` 选项可以使该配置项对所有仓库生效

### `git reflog`

reflogs 是 Git 用来记录本地仓库分支顶端的更新的一种机制，它会记录所有分支顶端曾经指向过的提交，因此 reflogs 允许我们找到并切换到一个当前没有被任何分支或标签引用的提交。

每当分支顶端由于任何原因被更新（通过切换分支、拉取新的变更、重写历史或者添加新的提交），一条新的记录将被添加到 reflogs 中。

如此一来，我们在本地所创建过的每一次提交都一定会被记录在 reflogs 中。==即使在重写了提交历史之后， reflogs 也会包含关于分支的旧状态的信息，并允许我们在需要时恢复到该状态==。

（注意：reflogs 并不会永久保存，它有 90 天的过期时间。）

#### 还原提交历史

从上一个例子继续，假设我们想恢复 `feature` 分支在 `rebase` 之前的 A→B→C→D→E→F 提交历史，但这时候的 `git log` 中已经没有后面 5 个提交，所以需要从 reflogs 中寻找，运行 `git reflog` 结果如下：

```perl
64710dc (HEAD -> feature) HEAD@{0}: rebase (continue) (finish): returning to refs/heads/feature
64710dc (HEAD -> feature) HEAD@{1}: rebase (continue): commit H
8ab4506 HEAD@{2}: rebase (continue): commit G
1e186f8 HEAD@{3}: rebase (squash): commit C
c50221f HEAD@{4}: rebase (start): checkout ef1372522cdad136ce7e6dc3e02aab4d6ad73f79
74199ce HEAD@{5}: checkout: moving from master to feature
......
```

`reflogs` 完整的记录了我们切换分支并进行 `rebase` 的全过程，继续向下检索，我们找到了从 `git log` 中消失的提交 F：

```
74199ce HEAD@{15}: commit: commit F
```

接下来我们通过 `git reset` 将 `feature` 分支的顶端重新指向原来的提交 F：

```sh
git reset --hard 74199ce # 我们想将工作区中的文件也一并还原，因此使用了--hard选项 
```

```
HEAD 现在位于 74199ce commit F
```

再运行 `git log` 会发现一切又回到了从前：

```perl
74199cebdd34d107bb67b6da5533a2e405f4c330 (HEAD -> feature) commit F
e7c7111d807c1d5209b97a9c75b09da5cd2810d4 commit E
d9623b0ef9d722b4a83d58a334e1ce85545ea524 commit D
73deeedaa944ef459b17d42601677c2fcc4c4703 commit C
c50221f93a39f3474ac59228d69732402556c93b commit B
ef1372522cdad136ce7e6dc3e02aab4d6ad73f79 commit A
```

### `git merge`

合并在 Git 中是一个十分常见的操作：整合不同分支之间的更改，或者对远程分支执行 `pull` 及 `push` 操作，都需要进行合并。

但对新手来说， `git merge` 这一命令有些令人生畏，因为在不同情况下，执行 `merge` 可能会得到不同的结果。这种对于结果的不确定性，项目中往往是依赖 GitHub 的 `Pull Request` 或者 GitLab 的 `Merge Request` 等可视化界面手动合并。

> 理解合并

在版本控制系统中，合并是将一组文件中所发生的不同更改进行整合的基础操作。

通常来说，我们在使用 Git 时会建立不同的分支，由不同的人对同一组文件执行新增、编辑等操作，最终我们需要合并这些协作的分支，整合所有的更改形成一份文件版本。

合并一般由 Git 根据算法自动执行，但如果发生了冲突，比如==对同一文件的同一处内容执行了不同的更改==，则需要我们手动合并。

> 递归三路合并算法

Git 在自动合并时会使用「[递归三路合并](https://en.wikipedia.org/wiki/Merge_(version_control)#Recursive_three-way_merge)」算法对不同文件进行差异分析，接下来简单了解一下该算法。

先从「三路合并」算法开始，假设我们有以下提交历史：

![Dec-29-2020 22-40-46](https://raw.githubusercontent.com/guyuechen/gallery/main/img/Dec-29-2020-merge.gif)

上图中我们在 `master` 合并了 `feature` 分支，现在我们回溯一下合并的过程：

此时 `master` 正指向提交 C，Git 首先找到两个分支最近的唯一共同祖先提交 A，然后分别对 A、C、F 提交的文件快照进行对比，我们称呼它们为 A、C、F 文件。接下来 Git 将逐行对三个文件的内容进行比较，如果三个文件中有两个文件该行的内容一致，则丢弃 A 文件中该行的内容，保留与 A 文件中不同的内容放到结果文件中。

具体来说，
假如 A、C 内容一致，说明这是在 F 中更改的内容，需要保留该更改；
假如 A、F 内容一致，说明这是在 C 中更改的内容，需要保留该更改；
假如 C、F 内容一致，说明 C 和 F 都相对于 A 做了同样的更改，同样需要保留。

除此之外的内容差异仅剩两种情况：
如果 A、C、F 的内容都一致，说明什么都没有发生；
==如果该行在 A、C、F 的内容都不一致，说明发生了冲突，需要我们手动合并选择需要保留的内容==。

结束对比后 Git 会以最终的结果文件快照创建一个新的 Merge 提交并指向它。

三路合并算法的基础是找到被合并文件的共同祖先，在一些简单的场景中这还能行的通，但在遇到[十字交叉合并（criss-cross merge）](https://zh.wikipedia.org/wiki/合并_(版本控制)#cite_note-2)时，不存在唯一的最近共同祖先，如下图：

<img src="https://raw.githubusercontent.com/guyuechen/gallery/main/img/20201229152228-criss-cross-merge.png" alt="20201229152228-criss-cross-merge" style="zoom: 33%;" />

现在我们需要从 `main` 分支合并 `feature` 分支，即把 C7 合并到 C8，会发现 C8 和 C7 有两个共同祖先，这下怎么办呢？

Git 采取的是递归三路合并（Recursive three-way merge），会先合并 C3 和 C5 这两个共同祖先创建一个虚拟的唯一最近祖先（假设为 C9），接着在 C9、C7、C8 之间执行三路合并，如果在合并 C3 和 C5 的过程中又发生没有唯一共同祖先的情况，则递归执行上述过程。

关于递归三路合并算法我们就了解到这里。

#### 合并冲突

如果你在两个不同的分支中，对同一个文件的同一个部分进行了不同的修改，Git 就无法自动地合并它们，而是会暂停合并过程，等待你去手动解决冲突。

首先我们需要找到这些需要解决冲突的文件，使用 `git status` 可以查看这些因包含合并冲突而处于未合并状态的文件：

```sh
git status
```

```
On branch master
You have unmerged paths.
  (fix conflicts and run "git commit")

Unmerged paths:
  (use "git add <file>..." to mark resolution)

    both modified:      main.py

no changes added to commit (use "git add" and/or "git commit -a")
```

手动解决冲突类似于二选一的过程，Git 会在有冲突的文件中加入特殊的标记，看起来像下面这样：

```
<<<<<<< HEAD:main.py
print("Hello World")
=======
print("Fuck World")
>>>>>>> feature:main.py
```

通过 `=======` 进行分割，
以 `<<<<<<< HEAD:main.py` 标记为上界的上半部分是当前分支 `master` 所做的更改，
以 `>>>>>>> feature:main.py` 标记为下界的下半部分是要合并的 `feature` 对同一内容所做的不同更改。

我们需要编辑文件删除这些标记，仅保留我们需要的内容：

```
print("Fuck World")
```

（当然也可以不从中选择，而是用一段全新的内容去替换它。）

在解决了所有文件里的冲突之后，需要使用 `git add` 暂存这些文件来将其标记为冲突已解决。
然后再执行 `git commit` 来完成合并提交。 
Git 会将解决的这些冲突，加入到上文提到的新增的 Merge 提交里。

#### 快进合并

也有些时候，我们在执行了合并操作后，会发现并没有增加一个新的 Merge 提交。这种情况我们称之为快进（fast-forward）合并。

假设我们基于 `master` 创建了 `feature` 分支，并新增了一些提交。现在我们将 `feature` 的更改合入 `master` 分支：

```sh
git checkout master
git merge feature
```

```perl
Updating f42c576..3a0874c
Fast-forward
 main.py | 2 ++
 task.py | 3 ++
 worker.py | 1 ++
 3 file changed, 6 insertions(+)
```

过程如下：

![Dec-29-2020 22-50-28](https://raw.githubusercontent.com/guyuechen/gallery/main/img/Dec-29-2020-fast-forward.gif)

由于我们想要合并的分支 `feature` 所指向的提交 D 是 `master` 的直接后继， 因此 Git 会直接将 `HEAD` 指针向前移动。

换句话说，如果顺着一个分支走下去一定能够到达另一个分支，那么 Git 在合并两者时只会简单的将指针向前推进（右移），因为这种情况下的合并操作没有需要解决的分歧。这就叫做快进（fast-forward）。

### `git cherry-pick` 

Git 命令文档对 `git cherry-pick` 描述是： Apply the changes introduced by some existing commits，应用某些已有提交所引入的更改。

通常我们说 cherry-pick 是将某个（些）提交从一个分支移动到另一个分支，这更加容易理解，但后面会解释为何文档的描述才是最准确的。

假设我们有如下提交：

```perl
a - b - c - d   master
         \
           e - f - g   feature
```

现在我们想把 `f` 和 `g` 两个提交移动到 `master` 分支，首先需要切换到 `master` :

```shell
git checkout master
```

`cherry-pick` 命令的用法简单明了，对需要移动的一个或多个提交执行 `cherry-pick` 即可，这里用字母指代实际提交的 `SHA-1` ID：

```shell
git cherry-pick f g
```

执行后的提交历史如下：

```perl
a - b - c - d - f' - g'   master
         \
           e - f - g   feature
```

实际的结果是在 `master` 分支创建了 `f'` 和 `g'` 两个新的提交，它们拥有和 `f` 、`g` 不同的 ID 。

#### 紧急 bug 修复

举个例子，比如我们发布了一个版本并已经开始开发一些新的功能，在新功能开发过程中，又发现了一个已经存在的 bug。

我们创建了一个紧急修复提交对这个错误进行修复，并在开发主分支进行集成测试。

这个新的补丁提交在合入开发主分支后可以直接 `cherry-pick` 到发布分支，在影响更多用户之前修复这个 bug。

过程示意如下：

![Jan-26-2021-git-cherry-pick](https://raw.githubusercontent.com/guyuechen/gallery/main/img/Jan-26-2021-git-cherry-pick.gif)

在动图中，我们在开发主分支 `master` 添加了一些新的功能提交，修复了一些 bug 并合入了两个 `bugfix` 分支，然后又将 `bugfix` 分支中的所有提交 `cherry-pick` 到了 `release` 分支。

#### 从放弃的分支中挑出个别提交

有时因为需求的变化一个功能分支可能会过时，而不会被合并到主分支中。

有时，一个 `Pull Request` 可能会在没有合并的情况下被关闭。

我们可以通过 `git log` 和 `git reflog` 等命令，从中找出一些有用的提交，并把它们 `cherry-pick` 到主分支。

#### 想从别处拿到commit的场景

比如你在没有意识到的情况下在一个错误的分支上创建了一个提交，你可以使用 `cherry-pick` 将其移动到正确的分支上去。

或者出于某些原因你想将团队成员在另一个分支开发的某个提交拿到你自己的分支，诸如此类。

从以上有限的场景来看，我们使用 `rebase` 或者 `merge` 配合 `reset` 等命令也能实现同样的效果。

但是 `cherry-pick` 的优势在于==它足够地简单直接==，一条命令就能实现原本需要一系列命令来实现的操作。

### 撤销提交

> 先上结论

| 命令           | 作用对象 | 常用场景                                                   |
| :------------- | -------- | ---------------------------------------------------------- |
| `git reset`    | 提交     | 放弃私人分支上的提交或者还未提交的本地更改                 |
| `git reset`    | 文件     | 将一个文件取消暂存                                         |
| `git checkout` | 提交     | 切换分支或者查看一个之前的提交                             |
| `git checkout` | 文件     | 将文件恢复到指定提交时的状态并丢弃在工作区中对该文件的更改 |
| `git revert`   | 提交     | 在公共分支上撤销一个提交                                   |

> Git 中的撤销

我们将使用如下的 Git 仓库作为基准示例，介绍一些常见的「撤销」命令。

假设工作区中已存在这些文件，且开始介绍每个命令时示例仓库都会回到初始状态：

```sh
git init
git add README.md && git commit -m "first commit"
git add .gitignore && git commit -m "add ignore file"
git add main.py && git commit -m "add main file"
git log --pretty=oneline
```

```perl
ea4c48a (HEAD -> master) add main file
b15cc74 add ignore file
e137e9b first commit
```

为了方便展示我们将只取 SHA-1 ID 的前 7 位，但 Git 依然能准确的找到对应的提交。

#### `git checkout`

`checkout` 有两种工作方式：在命令参数中带文件路径与不带。两种方式的具体行为有很大区别。

> 不带路径

不带路径的`git checkout [commit or branch]` 用于「检出」某个提交或分支，检出可以理解为「拿出来查看」，因此这个操作对工作区是安全的。

`git checkout [commit]` 会更新所有的三棵树，使其和 `[commit]` 的状态保持一致，但保留工作区和暂存区所做的更改。

假如我们在工作区新增了 `tests/test.py` 文件，并加入到了暂存区中，然后 `checkout` 到上一个提交：

```sh
git add tests/test.py
git checkout b15cc74
```

`checkout` 命令的执行过程如以下动图所示：

![Jan-11-2021-git-checkout](https://raw.githubusercontent.com/guyuechen/gallery/main/img/Jan-11-2021-git-checkout.gif)

1. 首先 HEAD 会直接指向 `b15cc74` 提交，进入分离 HEAD 状态，即不再指向分支引用：

   ```sh
   cat .git/HEAD
   ```

   ```
   b15cc74
   ```

2. 然后将提取 `b15cc74` 提交的文件快照依次更新到暂存区以及工作区。

3. 若工作区与暂存区存在未提交的本地更改，`checkout` 还会尝试将文件快照与本地更改做简单的合并，若合并失败，将会中止操作并恢复到 `checkout` 之前的状态。因此`checkout` 对工作区是安全的，它不会丢弃工作区所做的更改。

`git checkout [branch]` 的执行过程与上面类似，但是 HEAD 会指向 `[branch]` 这个分支引用。

> 带路径

当 `git checkout` 像下面这样在命令参数中带文件路径时：

```sh
git checkout b15cc74 README.md
```

执行过程如如以下动图所示：

![Jan-11-2021-git-checkout-file](https://raw.githubusercontent.com/guyuechen/gallery/main/img/Jan-11-2021-git-checkout-file.gif)

1. 它会找到该提交，并在该提交的文件快照中匹配文件路径对应的文件，但并**不会移动** HEAD：

   ```sh
   cat .git/HEAD
   ```

   ```
   ref: refs/heads/master
   ```

2. 将匹配到的文件快照覆盖到暂存区以及工作区。

3. 若工作区与暂存区存在对该文件的本地更改，该更改将会丢失。因此`checkout` 带文件路径时对工作区是不安全的，它会丢弃工作区对该文件所做的更改。

#### `git reset`

`git reset` 的主要作用是将 HEAD 重置为指定的提交。与 `checkout` 的区别在于，它对提交历史的更改并不仅仅只是更新 HEAD 本身，如果 HEAD 原来指向某个分支引用，则会将分支引用也更新为指向新的提交。

它的工作方式更多了，有 `—soft`、 `--mixed`、`--hard` 三种主要的命令选项，分别对应更新不同数量的树：

<img src="https://raw.githubusercontent.com/guyuechen/gallery/main/img/iShot2021-01-07-git-reset.png" alt="iShot2021-01-07 22.21.30" style="zoom: 33%;" />

> `--soft`

当命令行选项为 `--soft` 时，`git reset` 只会对提交历史进行重置：

```sh
git checkout master && cat .git/refs/heads/master
```

```perl
已经位于 'master'
ea4c48a
```

```sh
git reset --soft b15cc74
git status
```

```perl
位于分支 master
要提交的变更：
  （使用 "git restore --staged <文件>..." 以取消暂存）
         新文件：   main.py
```

执行过程如以下动图所示：

![Jan-11-2021-git-reset-soft](https://raw.githubusercontent.com/guyuechen/gallery/main/img/Jan-11-2021-git-reset-soft.gif)

1. 首先将 HEAD 及其指向的分支引用指向 `b15cc74` 提交，本示例中 HEAD 原本指向 `master` ，执行操作之后依然指向 `master`：

   ```sh
   cat .git/HEAD
   ```

   ```
   ref: refs/heads/master
   ```

   但 `master` 分支引用却从原来指向 `ea4c48a` 变成了指向 `b15cc74`：

   ```sh
   cat .git/refs/heads/master
   ```

   ```
   b15cc74
   ```

   若 HEAD 原本处于分离 HEAD 状态，则只会更新 HEAD 本身。

2. `reset --soft` 到此就已经结束了，它不会再对暂存区以及工作区进行任何更改，暂存区和工作区依然保留着原来的 `ea4c48a` 提交之后的文件快照与文件，因此运行 `git status` 我们将看到暂存区中有待提交的变更，工作区和暂存区中的本地更改也都会得到保留。

> `--mixed`

`--mixed` 选项是 `git reset` 命令的默认选项，`git reset [commit]` 即等同于 `git reset --mixed [commit]`。它除了重置提交历史，还会更新暂存区：

```sh
git checkout master && cat .git/refs/heads/master
```

```
已经位于 'master'
ea4c48a
```

```sh
git reset --mixed b15cc74
git status
```

```perl
位于分支 master
未跟踪的文件:
  （使用 "git add <文件>..." 以包含要提交的内容）
        main.py

提交为空，但是存在尚未跟踪的文件（使用 "git add" 建立跟踪）
```

执行过程如以下动图所示：

![Jan-11-2021-git-reset-mixed](https://raw.githubusercontent.com/guyuechen/gallery/main/img/Jan-11-2021-git-reset-mixed.gif)

1. 更新 HEAD 指向 `b15cc74` 提交，重置提交历史的过程与 `--soft` 完全相同。
2. 之后还会更新暂存区，将其填充为 `b15cc74` 提交的文件快照，暂存区中的原有内容将会丢失。
3. 不会对工作区进行任何更改，工作区依然保留着原来的 `ea4c48a` 提交之后的文件，因此运行 `git status` 我们将看到有未跟踪的文件待加入暂存区，工作区中的本地更改也会得到保留。

> `--hard`

`--hard` 是 `reset` 最**直接**、最**危险**以及最**常用**的选项。 `git reset —hard [commit]` 会将所有的三棵树都更新为指定提交的状态，工作区和暂存区中所有未提交的更改都会永久丢失，但被重置的提交仍有办法找回。

我们同样执行如下操作：

```sh
git checkout master && cat .git/refs/heads/master
```

```perl
已经位于 'master'
ea4c48a
```

```sh
git reset --hard b15cc74
```

```perl
HEAD 现在位于 b15cc74 add gitignore file
```

```sh
git status
```

```perl
位于分支 master
无文件要提交，干净的工作区
```

执行过程如以下动图所示：

![Jan-11-2021-git-reset-hard](https://raw.githubusercontent.com/guyuechen/gallery/main/img/Jan-11-2021-git-reset-hard.gif)

1. 更新 HEAD 指向 `b15cc74` 提交，重置提交历史的过程与 `--soft` 及 `--mixed` 选项相同。
2. 更新暂存区，将其填充为 `b15cc74` 提交的文件快照，暂存区中的原有内容将会丢失。
3. 更新工作区，将其填充为 `b15cc74` 提交的文件快照，工作区中的原有内容将会丢失。

正如上面所说，`reset —hard` 会将工作区、暂存区和提交历史都重置为刚刚新增了 `b15cc74` 提交时的状态，并简单粗暴地覆盖掉工作区和暂存区的原有内容。这是一个非常危险的操作，因为工作区和暂存区的未提交更改丢失后无法再通过 Git 找回。

> 找回提交历史

`reset` 后丢失的提交历史仍然能够恢复，因为我们只是更新了 HEAD 指向的提交，而没有对实际的提交对象做任何更改。我们可以通过 `git reflog` 找到 HEAD 曾经指向过的提交：

```sh
git reflog
```

```perl
b15cc74 (HEAD -> master) HEAD@{0}: reset: moving to b15cc74
ea4c48a HEAD@{1}: checkout: moving from master to master
......
```

从中可以找到 `master` 原来所指向的 `ea4c48a` 提交，再执行 `git reset --hard ea4c48a` 就能恢复原来的提交历史。

> 取消暂存文件

和 `checkout` 一样，`git reset` 也能对文件路径执行，常用于将已加入暂存区的指定文件或文件集合取消暂存。

假设我们在工作区新增了 `hello.py` 和 `world.py` 两个文件，并同时加入了暂存区：

```sh
git add . 
```

现在我们意识到这两个文件不应该放在一个提交中，因此需要将其中一个文件取消暂存：

```sh
git reset world.py
git status
```

```perl
位于分支 master
您的分支与上游分支 'origin/master' 一致。

要提交的变更：
  （使用 "git restore --staged <文件>..." 以取消暂存）
        新文件：   hello.py

未跟踪的文件:
  （使用 "git add <文件>..." 以包含要提交的内容）
        world.py
```

此时暂存区中只有 `hello.py` 文件了，我们可以分别提交它们：

```sh
git commit -m "add hello.py" 
# 在另一个提交中提交 world.py
git add world.py 
git commit -m "add world.py"
```

实际上 `reset` 带文件路径命令的完整形式是下面这样的：

```sh
git reset [<tree-ish>] <pathspec>…
```

该操作的实质，是从 `<tree-ish>` 提取 `<pathspec>` 对应的文件快照更新到暂存区，`<tree-ish>`可以是提交或分支，默认值为 HEAD，因此默认会将暂存区的指定路径恢复到 HEAD 提交的状态。

 `git reset world.py` 命令的实际过程是：

1. 从 HEAD 提交中匹配 `world.py` 对应的文件快照。
2. 将匹配到的文件快照复制到暂存区。

因此，当我们修改了某个文件添加到暂存区，`reset` 后会被替换成原本的文件版本；
新增的文件会从暂存区中移除（因为上一次提交中没有该文件），实际实现了将文件取消暂存的效果。

#### `git revert`

`git revert` 命令用于回滚某一个（或多个）提交引入的更改。

其他的「撤销」命令如 `git checkout` 和 `git reset`，会将 HEAD 或分支引用重新指向到指定的提交，`git revert` 命令也可以接受一个指定的提交，但并不会将任何引用移动到这个提交上。

`revert` 操作会接收指定的提交，反转该提交引入的更改，并创建一个新的「回滚提交」记录反转更改，然后更新分支引用，使其指向该提交。如以下动图所示：

![Jan-11-2021-git-revert](https://raw.githubusercontent.com/guyuechen/gallery/main/img/Jan-11-2021-git-revert.gif)

相比 `reset` ，`revert` 会在提交历史中增加一个新的提交，而不会对之前的提交进行任何更改。 默认情况下 `revert` 会自动执行如下步骤：

- 将反转指定提交的更改合并到工作区
- 将更改添加到暂存区
- 创建新的提交

因此它要求我们提供一个干净的暂存区（即和 HEAD 提交状态一致），且要求工作区的本地更改不会被合并操作覆盖，否则回滚会失败。我们可以添加 `--no-commit` 命令选项来进入交互模式手动执行「创建新的提交」，此时 `revert` 操作会将反转的更改应用到工作区和暂存区等待提交，且不要求暂存区与 HEAD 一致。

我们通过示例来演示这一过程，现在我们想回滚 `b15cc74` 这个提交，这个提交中加入了 `.gitignore` 文件，预期的结果是会新增一个删除该文件的提交：

```sh
git revert b15cc74
```

在终端执行该命令后将直接跳转到一个编辑器界面，可以修改新提交的提交信息：

```perl
Revert "add gitignore file"

This reverts commit b15cc74d6d85435660fcacce1305a54273880479.

# 请为您的变更输入提交说明。以 '#' 开始的行将被忽略，而一个空的提交
# 说明将会终止提交。
......
```

保存后 `revert` 命令执行结束，并输出以下结果：

```perl
删除 .gitignore
[master 6bb25da] Revert "add gitignore file"
 1 file changed, 1 deletion(-)
 delete mode 100644 .gitignore
```

结果符合预期，新增了一个删除 `.gitignore` 文件的 `6bb25da` 提交，并且 `master` 当前指向了该提交。

但如果我们在一开始对工作区中的文件做过更改且加入到了暂存区，执行 `revert` 的结果如下：

```sh
git revert b15cc74
```

```perl
error: 您的本地修改将被还原覆盖。
提示：提交您的修改或贮藏后再继续。
fatal: 还原失败
```

> revert 的优势

虽然效果与 `reset` 相似，但使用 `revert` 有以下优势：

- 它不会改变之前的提交历史，这使得 `revert` 对于已经推送到共享仓库的提交是一个「安全」的操作，它会完整的记录某个提交被加入及回滚的过程。
- 它可以回滚提交历史上任意一个（或多个）点的提交，而 `reset` 只能重置从指定提交起之后的所有历史。

#### 撤销本地分支提交

使用 `git reset` ，取决于你是否需要保留该提交之后的更改，添加 `--soft` 、`—hard` 等选项。

#### 回滚远程主干分支上的提交

使用 `git revert`。

#### 修改上一次提交的内容

如果该提交还未进入公共分支，最直接的方式是使用 `git commit --amend`。

如果该提交已经位于公共分支，应该使用 `git revert`。

#### 暂存更改后再恢复

一个很常见的场景是，我们在当前分支修改了一些文件，但还不足以组织成提交或者包含了多个提交的内容，突然有紧急情况需要开始一项新的任务，此时我们希望可以将工作区和暂存区的本地更改暂时保存起来，以备在其他工作完成后可以从这里继续。

我们当然可以创建一个临时的分支然后重置或合并来实现目的，但那样复杂而繁琐。而 `git stash` 命令则可以很好的满足需求，它会将本地更改保存起来，并将工作区和暂存区恢复到与 HEAD 提交相匹配的状态。此时我们可以切换到其他分支或者继续在当前分支完成其他任务，之后再将暂存的内容取回。

`git stash` 的基本用法如下：

```sh
# 保存当前更改（添加 -u 选项以包括未跟踪的新文件）
$ git stash -u
# 完成其他任务......
# 恢复暂存的更改
$ git stash pop
```

`stash` 的实质也是将本地更改保存为一次新的提交，然后再将该提交恢复到工作区和暂存区，但它不会影响当前的提交历史。`stash` 还有更多进阶用法，比如指定暂存的文件路径、暂存多次并择一恢复等。

### 配置公私钥

#### 本地单用户配置

> 设置用户名和邮箱


```perl
git config --global user.name yuechengu
git config --global user.email gyc822@qq.com
```

> 为账户生成`ssh-key`公私钥


直接回车，默认生成`id_rsa`和`id_rsa.pub`。（非默认参见[本地多用户配置](# 5.2 本地多用户配置)）

> 将`ssh-key`添加到`ssh-agent`信任列表


```perl
C:\Users\g30047555\.ssh>ssh-add id_rsa_github
Identity added: id_rsa_github (gyc822@qq.com)
```

> 添加公钥到自己的对应的git仓库中

#### 本地多用户配置（TO DO）

为同一个电脑，配置多个 git 账号，其整体流程如下：

- 清空默认的全局 `user.name` 和 `user.email`
- 为不同的 `git` 账户生成不同的 `ssh-key`
- 将以上的 `ssh-key` 分别添加到 `ssh-agent` 信任列表
- 添加以上的公钥到自己的 `git` 账户中
- 在 `config` 文件配置多个 `ssh-key`
- 测试

> 清空默认的全局`user.name`和`user.email`


```perl
git config --global --unset user.name
git config --global --unset user.email
```

> 为不同的git账户生成不同的`ssh-key`


平时我们都是直接回车，默认生成`id_rsa`和`id_rsa.pub`。

这里特别需要注意，出现提示输入文件名的时候要输入与默认配置不一样的文件名，比如：`id_rsa_github`、`id_rsa_company`。

`id_rsa` 是默认的文件名称，我们现在需要生成不同的 `ssh-key`，所以要设置不同的文件存储对应的公钥，比如：自己的GitHub账户，使用 `id_ras_github` 命名；公司的账户，使用 `id_ras_company` 来命名

```perl
ssh-keygen -t rsa -C "gyc822@qq.com"
ssh-keygen -t rsa -C "guyuechen@huawei.com"
```

> 将`ssh-key`分别添加到`ssh-agent`信任列表


```perl
C:\Users\g30047555\.ssh>ssh-add id_rsa_github
Identity added: id_rsa_github (gyc822@qq.com)
C:\Users\g30047555\.ssh>ssh-add id_rsa_company
Identity added: id_rsa_company (guyuechen@huawei.com)
```

> 添加公钥到自己的各个对应的git仓库中


使用下面的命令或者手动copy公钥到git账户中粘贴即可

```perl
pbcopy < ~/.ssh/id_rsa_github.pub
pbcopy < ~/.ssh/id_rsa_company.pub
```

> 在`config`文件配置多个`ssh-key`（没成功）


在`.ssh/`目录下，进入`config`文件（没有的话新建一个）

- Host 就是每个 SSH 连接的单独代号，IdentityFile 告诉 SSH 连接去读取哪个私钥。
- HostName 填写 IP Address（或者域名也可）

```perl
# Personal
Host personalgit
HostName github.com
IdentityFile ~/.ssh/id_rsa_company
User me

# Company
Host companygit
HostName codehub-y.huawei.com
IdentityFile ~/.ssh/id_rsa_github
User company
```

> 测试（没成功）


```perl
# ssh -T git@{config里面的user}.xxx主机名
ssh -T git@company.codehub-y.huawei.com
```

出现以下，则说明成功！

```perl
Hi user.name！ You've successfully authenticated.but GITEE.COM does not provide shell acess
```

> 最后，在不同的代码仓库进行代码提交时，记得检查用户名和邮箱，以免混淆。
> 设置用户名和邮箱的命令如下：
> （只能暂时用`--global`来切用户）


```perl
# Personal
git config --global user.name yuechengu
git config --global user.email gyc822@qq.com

# Company
git config --global user.name "guyuechen 30047555"
git config --global user.email guyuechen@huawei.com
```

> 用不同额账号clone项目（没成功）


```perl
# git clone git@personalgit:xxx.git 公司禁了
# 用https协议克隆前要先设置两条配置命令（亲测无法push）
git config --global http.proxy 'http://g30047555:gyc228059!@proxy.huawei.com:8080'
git config --global http.sslVerify false
git clone https://github.com/yuechengu/wikijs-repo.git
```

```perl
# git clone git@companygit:xxx.git
git clone git@companygit:szv-y.codehub.huawei.com:2222/om/fsm.git
```



# 拓展

### `Pull Request` 与 `Merge Request` 的区别

> 使用场景

- 如果用 Github，对 Pull Request 应该有一定的了解。
- 如果用 Gitlab / Codehub，对 Merge Request 应该有一定的了解。

> 一般的 Github 工作流程

Github 一般是公开库，当然没有人愿意别人直接在自己的仓库上面修改代码。当然当其他人想要给自己合并代码时，一般是要 fork 一个仓库，然后在开发者自己的仓库开发，开发完成后给原创仓库提交PR合并请求，请求原仓库主人把你的代码拉（pull）回去。

<img src="https://raw.githubusercontent.com/guyuechen/gallery/main/img/image-20230716195851143.png" alt="image-20230716195851143" style="zoom: 25%;" />

> 一般的 Gitlab 工作流程

Gitlab 一般是公司的私有库，一个工作团队维护一个仓库，通常大家会新建自己的开发分支，开发完成后，把代码合并到主分支。

<img src="https://raw.githubusercontent.com/guyuechen/gallery/main/img/image-20230716200013551.png" alt="image-20230716200013551" style="zoom: 25%;" />

> BUT

-  Github 上也可以玩分支模式，提交合并请求同样用 Pull Request。
-  Gitlab 上也可以玩 fork 模式，提交合并请求还是 Merge Request。

> 结论

Pull Request 和 Merge Request 是一个东西。

### Git 的3种合并策略

我们在使用 Git 时，通常会基于主分支拉出若干条功能分支进行开发，开发完毕后再将功能分支合入主分支。

分支合并策略有以下3种：

- 通过 `merge` 显式合并
- 通过 `rebase` 或 `fast-forward` 隐式合并
- `squash` 后隐式合并

> 通过 `merge` 显式合并

这是最常见和最直接的合并方式，也是 GitHub 和 GitLab 等代码托管平台的默认实现方式。

![Dec-29-2020 22-40-46](https://raw.githubusercontent.com/guyuechen/gallery/main/img/Dec-29-2020-merge.gif)

当我们将功能分支合入主分支时，Git 会对两个分支进行递归三路合并，并以合并结果创建一个新的 Merge 提交。

这个 Merge 提交和普通的提交本质上是一样的，但是它有两个父提交：

```sh
git cat-file -p 44ba027
```

```perl
tree 5a1692ba62ef346b59e65e4aa441c731bebc51ff
parent 75bf5c59c2e7e493c98e026a415f16b8f0445e4a
parent bbbe6a4c02aa709299ac891779448daf8203df53
author xx <xx@xx.com> 1609141855 +0800
committer xx <xx@xx.com> 1609141855 +0800

Merge branch 'feature' into 'master'
```

我们能在提交历史中，很明了地根据 Merge 提交查看发生的合并事件。

但另一方面，大量的 Merge 提交会使你的提交历史有很多分叉，甚至十分凌乱，有些开发团队可能会想要一个更整洁的线性提交历史。

（需要注意的是，默认情况下 Git 不会在快进合并的情况下创建单独的 Merge 提交。假如我们想在所有情况下都创建一个 Merge 提交，需要在执行 `git merge` 命令时添加 `--no-ff` 选项。）

> 通过 `rebase` 或 `fast-forward` 隐式合并

我们可以用 `rebase` 替换 `merge` 进行合并，简单来说 `rebase` 操作会找到两个分支的最近的祖先提交，并基于目标分支按顺序重新应用当前分支在祖先提交之后的更改。假设我们有如下图的 `master` 和 `feature` 两个分支，执行下列操作：

```sh
git checkout feature
git rebase master
git checkout master
git merge feature
```

过程如下图所示：

![Dec-31-2020-rebase&fast-forfward](https://raw.githubusercontent.com/guyuechen/gallery/main/img/Dec-31-2020-rebase&fast-forfward.gif)

我们首先用 `rebase` 将 `master` 合并到了 `feature`，即使两个分支都有不同的提交，也得到了一条完全线性的 `feature` 分支。

接着切换到 `master` 分支合并 `feature`。`rebase` 之后的 `feature` 分支上，所有提交都是 `master` 的后继提交，因此等于直接执行快进合并。快进合并只有在 `master` 分支中没有比 `feature` 更新的提交时才会发生（使用 `rebase` 就是能够确保该结果），在这种情况下，`master` 的 `HEAD` 可以直接右移到 `feature` 分支的最新提交。这样合并也不会生成单独的 Merge 提交，它只是将分支标签快速指向了新的提交。

通过 `rebase` 和 `fast-forward` 的隐式合并，我们能够得到一条整洁线性的提交历史。

> `squash` 后隐式合并

还有一种合并变更的策略，这种策略是上面第二种隐式合并的一种补充。

在执行快进合并或者 `rebase` 之前，将所有功能分支的提交通过 `rebase` 交互模式的 `squash` 命令压缩成一个提交。

这样可以进一步保持主分支提交历史的线性和整洁。它将一个完整的功能单独保存在一次提交中，但也失去了之前的整个记录和细节。

具体的操作方法可参考[重写提交历史](#重写提交历史)。



## 教程

### 1 版本控制工具简介

-  版本控制工具的发展历史经过：原始人工维护状态，本地RCS，集中式如CVS、SVN和分布式如Git。 
-  版本控制工具提供了协作开发的能力，借助它们我们可以回到任何时间的代码状态。 
-  **集中式**版本控制工具，几乎所有的动作都需要服务器参与，并且数据安全性与服务器关系很大。 
-  Git 是**分布式**版本控制工具，除了与服务器之前进行按需同步之外，所有的提交操作都不需要服务器。 

### 2 Git安装与配置

#### Linux 下安装Git

> Linux 系统: Ubuntu 10.10(maverick)或更新版本，Debian(squeeze)或更新版本

```bash
$ sudo aptitude install git
$ sudo aptitude install git-doc git-svn git-email gitk
```

其中git软件包包含了大部分Git命令，是必装的软件包。
软件包git-svn、git-email、gitk本来也是Git软件包的一部分，但是因为有着不一样的软件包依赖（如更多perl模组，tk等），所以单独作为软件包发布。

> Linux 系统:  RHEL、Fedora、CentOS 等版本

```bash
$ yum install git
$ yum install git-svn git-email gitk
```

> 从源代码开始安装（另一种方式）

访问Git的官方网站：http://git-scm.com/。下载Git源码包，例如：git-2.19.0.tar.gz。

展开源码包，并进入到相应的目录中。

```bash
$ tar -jxvf git-2.19.0.tar.bz2
$ cd git-2.19.0
```

安装方法写在INSTALL文件当中，参照其中的指示完成安装。下面的命令将Git安装在 `/usr/local/bin` 中。

```bash
$ make prefix=/usr/local all
$ sudo make prefix=/usr/local install
```

安装Git文档（可选）

```bash
$ make prefix=/usr/local doc info
$ sudo make prefix=/usr/local install-doc install-html install-info
```

命令补齐（可选）

Linux的shell环境（bash）通过bash-completion软件包提供命令补齐功能，能够实现在录入命令参数时按一下或两下TAB键，实现参数的自动补齐或提示。例如输入 `git com` 后按下TAB键，会自动补齐为 `git commit`。

将Git源码包中的命令补齐脚本复制到bash-completion对应的目录中：

```bash
$ cp contrib/completion/git-completion.bash /etc/bash_completion.d/
```

重新加载自动补齐脚本，使之在当前shell中生效：

```bash
$ . /etc/bash_completion
```

为了能够在终端开启时自动加载bash_completion脚本，需要在本地配置文件 `~/.bash_profile` 或全局文件`/etc/bashrc` 文件中添加下面的内容：

```shell
if [ -f /etc/bash_completion ]; then
. /etc/bash_completion
fi
```

#### Windows 下安装Git

> 安装 Git

目前 Git 提供的 Windows 安装包自带 MinGW (Minimalist GNU for Windows，最简GNU工具集)， 在安装后MinGW 提供了一个bash提供的shell环境 (Git Bash) 以及其他相关工具软件，组成了一个最简系统（Minimal SYStem），这样在 Git Bash 中，Git的使用和在Linux下使用完全一致。

Step1：到 [https://git-scm.com/download/win ](https://git-scm.com/download/win)下载 Windows 安装包，例如: Git-2.19.0-64-bit.exe

Step2：选择一些必要的组件，开源的 git-lfs 存在一些问题，建议把勾选去掉

Step3：Git 默认的编辑器是Vim，建议保持默认，当然你也可以选择其它的，例如 Notepad++。

Step4：在安装过程中会询问是否修改环境变量。建议选择“Use Git Bash Only”，即只在 MinGW 提供的shell环境中使用Git，不修改 PATH 环境变量，避免 Git 自带的工具与 Windows 下已有的产生冲突。

Step5：其它后续提示可以都采用缺省配置，进行安装过程。安装完成后，我们可以在 Windows 任意目录下，右键单击选中 "Git Bash" 启动 Git Bash：`git version`，查看安装的 git 版本信息

> 安装 TortoiseGit

在Windows下安装和使用Git有两个不同的方案, 除了刚刚的 Git 安装包，再有一个就是基于msysGit的图形界面工具——TortoiseGit。

Step1：安装TortoiseGit非常简单，访问网站 http://code.google.com/p/tortoisegit/ ，下载安装包，然后根据提示完成安装。

Step2：安装过程中会询问要使用的SSH客户端，默认使用内置的TortoisePLink（来自PuTTY项目）做为SSH客户端。（TortoisePLink和TortoiseGit的整合性更好，可以直接通过对话框设置SSH私钥（PuTTY格式），而无需再到字符界面去配置SSH私钥和其他配置文件。）

Step3：Settings > Network > SSH Client 里设置本地的`~\Git\usr\bin\ssh.exe`。如果你的本地同时安装了命令行的 Git 版本，可以通过TortoiseGit的设置对话框选中 Git 提供的 ssh 客户端，这样在下载 ssh 协议的代码仓库的时候，通过命令行与 TortoiseGit 图形界面都可以使用同一套公钥和密钥。

> 使用前的基本配置

Git有三种配置，分别以文件的形式存放在三个不同的地方。可以在命令行中使用git config工具查看这些变量。

**系统配置（对所有用户都适用）**

存放在git的安装目录下：`%Git%/etc/gitconfig`；若使用 `git config` 时用 `--system` 选项，读写的就是这个文件：

```bash
git config --system core.autocrlf
```

**用户配置（只适用于该用户）**

存放在用户目录下。例如linux存放在：`~/.gitconfig`；若使用 `git config` 时用 `--global` 选项，读写的就是这个文件：

```bash
git config --global user.name
```

**仓库配置（只对当前项目有效）**

当前仓库的配置文件（也就是工作目录中的 `.git/config` 文件）；若使用`git config` 时用 `--local` 选项，读写的就是这个文件：

```bash
git config --local remote.origin.url
```

注：上述每一个级别的配置都会覆盖上层的相同配置，例如 `.git/config` 里的配置会覆盖 `%Git%/etc/gitconfig` 中的同名变量。

> Step1：配置个人身份

首次的 Git 设定（设定身份，自己做主）

```bash
git config --global user.name “zhangsan”
git config --global user.email  zhangsan@hw.com
```

这个配置信息会在 Git 仓库中提交的修改信息中体现，但和Git服务器认证使用的密码或者公钥密码无关。

> Step2：文本换行符配置（可选）

假如你正在Windows上写程序，又或者你正在和其他人合作，他们在Windows上编程，而你却在其他系统上，在这些情况下，你可能会遇到行尾 结束符问题。 这是因为Windows使用回车和换行两个字符来结束一行，而Mac和Linux只使用换行一个字符。 虽然这是小问题，但它会极大地扰乱跨平台协作。

Git可以在你提交时自动地把行结束符CRLF转换成LF，而在签出代码时把LF转换成CRLF。用`core.autocrlf`来打开此项功能， 如果是在Windows系统上，把它设置成true，这样当签出代码时，LF会被转换成CRLF：

```bash
$ git config --global core.autocrlf true
```

Linux或Mac系统使用LF作为行结束符，因此你不想Git在签出文件时进行自动的转换；当一个以CRLF为行结束符的文件不小心被引入时你肯定想进行修正， 把`core.autocrlf`设置成input来告诉Git在提交时把CRLF转换成LF，签出时不转换。这样会在Windows系统上的签出文件中保留CRLF，会在Mac和Linux系统上，包括仓库中保留LF：

```bash
$ git config --global core.autocrlf input
```

如果你是Windows程序员，且正在开发仅运行在Windows上的项目，可以设置false取消此功能，把回车符记录在库中：

```bash
$ git config --global core.autocrlf false
```

> Step3：文本编码配置

- i18n.commitEncoding 选项：用来让`git commit log`存储时，采用的编码，默认UTF-8.
- i18n.logOutputEncoding 选项：查看`git log`时，显示采用的编码，建议设置为UTF-8.

```bash
# 中文编码支持
git config --global gui.encoding utf-8
git config --global i18n.commitencoding utf-8
git config --global i18n.logoutputencoding utf-8

# 显示路径中的中文：
git config --global core.quotepath false
```

> Step4：与服务器的认证配置

**http/https 协议认证**

```bash
# 设置口令缓存：
git config --global credential.helper store

# 添加 HTTPS 证书信任：
git config http.sslverify false
```

**ssh 协议认证**

SSH协议是一种非常常用的Git仓库访问协议，使用公钥认证、无需输入密码，加密传输，操作便利又保证安全性

Git工具安装成功后运行 Git Bash，在弹出的客户端命令行界面中输入下面提示的命令。
（比如你的邮箱是 [zhangsan@hw.com](mailto:zhangsan@hw.com)）

```bash
$ ssh-keygen -t rsa –C zhangsan@hw.com
```

然后添加公钥到代码平台：

1. 登录代码平台
2. 进入“Profile Settings”，点击左侧栏的“SSH Keys”
3. 点击“Add SSH Key”，将刚生成的公钥文件的内容，复制到“Public Key”栏，保存即可。

### 3 Git的三棵树

> Git版本控制下的文件状态只有三种

- 已提交（committed）
  该文件已经被安全地保存在本地数据库中了；
- 已修改（modified）
  修改了某个文件，但还没有提交保存；
- 已暂存（staged）
  把已修改的文件放在下次提交时要保存的清单中。

> Git 的三棵树

这三棵树分别是：

- 工作区（Working Directory）

  日常工作的代码文件或者文档所在的文件夹，就是你在电脑里能看到的目录。

- 暂存区（Staging Index）

  暂存区保存着下一次执行 `git commit` 时将加入到提交历史中的内容。

  Git 把它作为工作区与提交历史之间的中间区域，方便我们对提交内容进行组织：我们可能会在工作区同时更改多个完全不相干的文件，这时可以将它们分别放入暂存区，并在不同的提交中加入提交历史。此外暂存区还用于合并冲突时存放文件的不同版本。

  当我们基于最近一次提交在工作区做了一些修改之后，`git status` 会将工作区的文件与暂存区的文件快照进行对比， 并提示我们有哪些做了修改的文件尚未加入暂存区。

  一般存放在工程根目录 `.git/index`文件中，所以我们也可以把暂存区叫作索引（index）。

- 提交历史（Commit History） / 版本库（Repository）

  提交历史是工作区文件在不同时间的文件快照（快照即文件或文件夹在特定时间点的状态，包括内容和元信息）。

  我们可以通过 `git log` 命令查看当前分支的提交历史。

虽然我们用树来形容它们，但需要先明确的一点是，树并不代表它们真实的数据结构。「树」在这里的实际意思是「文件的集合」，而不是指特定的数据结构。我们不会去深入探究它们的底层实现，重点了解它们的概念及相互关系。

> Index详解

暂存区并不像工作区有可见的文件系统目录，或者像提交历史一样通过 `.git/objects` 目录保存着所有提交对象，它没有实际存在的目录或文件夹，它的实体是位于 `.git` 目录的 `index` 文件。 `index` 是一个二进制文件，包含着一个由路径名称、权限和 `blob` 对象的 SHA-1 值组成的有序列表。

我们可以通过 `git ls-files` 命令查看 `index` 中的内容：

```sh
git ls-files --stage
```

```perl
100644 30d74d258442c7c65512eafab474568dd706c430 0       README.md
100644 9c1cab9a57432098de869e202ed73161af33d182 0       main.py
```

`index` 中记录了暂存区文件的路径名称和 SHA-1 ID，文件内容已经作为 `blob` 对象保存到了 `.git/objects` 目录中：

```sh
tree .git/objects -L 2
```

```
.git/objects
├── 30
│   └── d74d258442c7c65512eafab474568dd706c430
├── 9c
│   └── 1cab9a57432098de869e202ed73161af33d182
├── info
└── pack

4 directories, 2 files
```

`blob` 对象是 Git 用来保存文件数据的二进制对象，我们可以通过 ID 取得对应的 `blob` 对象，用 `git cat-file` 命令打印其内容：

```sh
git cat-file -p 30d74d258442c7c65512eafab474568dd706c430
```

```
This is a README file.
```

当我们将一个修改过的文件加入暂存区后，如果又在工作区对文件进行了新的修改，需要重新将其加入暂存区，因为暂存区以 `blob` 对象保存的只是文件加入时的内容。

在 `index` 文件中，还记录了每一个文件的创建时间和最后修改时间等元信息，它通过引用实际的数据对象包含了一份完整的文件快照，因此可以通过对比 SHA-1 校验和实现与工作区文件之间的快速比较。

> 提交历史详解

提交历史是工作区文件在不同时间的文件快照（快照即文件或文件夹在特定时间点的状态，包括内容和元信息）。

我们可以通过 `git log` 命令查看当前分支的提交历史：

```sh
git log
```

```perl
commit ea4c48a0984880bda4031f0713229229c12793e4 (HEAD -> master)
Author: gyc <gyc822@notmyemail.com>
Date:   Wed Jan 6 21:05:44 2021 +0800

    add main file

commit b15cc74d6d85435660fcacce1305a54273880479
Author: gyc <gyc822@notmyemail.com>
Date:   Wed Jan 6 21:05:06 2021 +0800

    add ignore file

commit e137e9b81cc5dfc5b1c9c7d06b861553d5c42491
Author: gyc <gyc822@notmyemail.com>
Date:   Wed Jan 6 21:04:39 2021 +0800

    first commit
```

每一个提交都会有一个 40 位的「ID」：

```
ea4c48a0984880bda4031f0713229229c12793e4
```

Git 通过「提交对象」来储存每一次提交。这个 ID 是以对象内容进行 SHA-1 计算得到的哈希值，不同的内容一定会得到不同的结果，Git 既把它作为每一个对象（不仅仅是提交对象）的唯一标识符，也用作 `.git/objects` 目录中的地址（其中存储着实际的二进制文件），我们可以用 ID 找到对应的对象并打印其内容：

```sh
git cat-file -p ea4c48a0984880bda4031f0713229229c12793e4
```

```perl
tree 9e761342b98484aac2d8734f45fc2d0fde3e29db
parent b15cc74d6d85435660fcacce1305a54273880479
author gyc <gyc822@notmyemail.com> 1609938344 +0800
committer gyc <gyc822@notmyemail.com> 1609938344 +0800

add main application file
```

这个提交对象的内容包含三部分：

- 对应的 `tree` 对象的 ID
- 父提交对象的 ID
- 作者、提交者及提交信息等元信息

`tree` 对象主要由其他 `tree` 对象和 `blob` 对象的 ID 以及路径名称组成：

```sh
git ls-tree 9e761342b98484aac2d8734f45fc2d0fde3e29db
```

```perl
100644 blob 723ef36f4e4f32c4560383aa5987c575a30c6535    .gitignore
100644 blob 30d74d258442c7c65512eafab474568dd706c430    README.md
100644 blob 9c1cab9a57432098de869e202ed73161af33d182    main.py
040000 tree 556af47de72b597f532f63b63983be433f137e57    tests
```

就像目录递归地包含其他目录和文件一样，一个 `tree` 对象即可表示整个工作区中所有已提交目录及文件的内容，也就是说提交历史中的每一个提交都包含着一份完整的某一时刻的文件快照，并通过保存上一次提交的引用形成连续的文件快照历史。

> 分支和 HEAD

简单了解下分支和 HEAD。

在 Git 中我们将 SHA-1 值用做提交对象（以及 `tree` 和 `blob` 对象）的 ID，通过 ID 操作提交对象以及提交对象引用的文件快照。但大部分时候，记住一个 ID 是非常困难的，因此 Git 用一个文件来保存 SHA-1 值，这个文件的名字即作为「引用（refs）」来替代原始的 SHA-1 值。

这类包含 SHA-1 值的文件保存在 `.git/refs` 目录下，我们可以在 `.git/refs/heads` 目录中找到代表各个分支引用的文件，尝试打印 `master` 文件的内容：

```sh
cat .git/refs/heads/master
```

```perl
ea4c48a0984880bda4031f0713229229c12793e4
```

这基本就是 Git 分支的本质：一个指向某一系列提交之首的指针或引用。

我们还用 HEAD 来指向最近的一次提交，HEAD 文件通常是一个符号引用（symbolic reference），指向目前所在的分支。 所谓符号引用，表示它是一个指向其他引用的引用：

```sh
cat .git/HEAD
```

```perl
ref: refs/heads/master
```

但在某些情况下，HEAD 文件可能会包含一个 git 对象的 SHA-1 值。 当你在检出一个标签、提交或远程分支，让你的仓库变成 「[分离 HEAD](https://git-scm.com/docs/git-checkout#_detached_head)」状态时，就会出现这种情况。

```sh
git checkout ea4c48a0984880bda4031f0713229229c12793e4
cat .git/HEAD
```

```perl
ea4c48a0984880bda4031f0713229229c12793e4
```

> 工作流程

最后，让我们来看一下三棵树之间的工作流程：

<img src="https://raw.githubusercontent.com/guyuechen/gallery/main/img/git-three-trees.png" alt="Untitled" style="zoom:25%;" />

1. 假设我们进入到一个新目录，其中有一个 `README` 文件。此时暂存区为空，提交历史为空，HEAD 引用指向未创建的 `master` 分支。
2. 现在我们想提交该文件，首先需要通过 `git add` 将其添加到暂存区。此时 Git 将在 `.git/objects` 目录中以该文件的内容生成一个 `blob` 对象，并将 `blob` 对象的信息添加到 `.git/index` 文件中。
3. 接着运行 `git commit` ，它会取得暂存区中的内容生成一个 `tree` 对象，该 `tree` 对象即为工作区文件的永久快照，然后创建一个指向该 `tree` 对象的提交对象，最后更新 `master` 指向本次提交。
4. 假如我们在工作区编辑了文件，Git 会将其与暂存区现有文件快照进行比较，在 `git add` 了更改的文件后，根据文件当前内容生成新的 `blob` 对象并更新 `.git/index` 文件中的引用 ID。`git commit` 的过程与之前类似，但是新的提交对象会以 HEAD 引用指向的提交作为父提交，然后更新其引用的 `master` 指向新创建的提交。
5. 当我们 `git checkout` 一个分支或提交时，它会修改 HEAD 指向新的分支引用或提交，将暂存区填充为该次提交的文件快照，然后将暂存区的内容解包复制到工作区中。

### 4 Git常用命令

#### 工程准备

`git clone`：工程克隆

`git init`：工程新建

-  `git init`用于在本地目录下新建git项目仓库。
  执行`git init`后，当前目录下自动生成一个名为`.git`的目录，这代表当前项目所在目录已纳入Git管理。`.git`目录下存放着本项目的Git版本库，在此强烈不建议初学者改动`.git`目录下的文件内容。Git仓库下的`.git`目录默认是不可见的，有一定程度上是出于防止用户误操作考虑。 
-  `git clone`用于克隆远端工程到本地磁盘。
  如果想从远端服务器获取某个工程，那么：
  1）确定自己Git账号拥有访问、下载该工程的权限
  2）获取该工程的Git仓库URL
  3）本地命令行执行 `git clone [URL]`或 `git lfs clone [URL]`
  注：如果你所在的项目git服务器已支持`git-lfs`，对二进制文件进行了区别管理，那么克隆工程的时候务必使用`git lfs clone`。否则克隆操作无法下载到工程中的二进制文件，工程内容不完整。 

#### 文件修改后提交推送

`git add` / `git rm` / `git mv`：新增 / 删除 / 移动文件到暂存区

`git commit`：提交更改的文件

`git push`：推送远端仓库

-  在提交你修改的文件之前，需要`git add`把文件添加到暂存区。
  如果该文件是新创建，尚未被git跟踪的，需要先执行 `git add` 将该文件添加到暂存区，再执行提交。
  如果文件已经被git追踪，即曾经提交过的 。
  在早期版本的git中，需要`git add`再提交；在较新版本的git中，不需要`git add`即可提交。 
-  `git rm` 将指定文件彻底从当前分支的缓存区删除，因此它从当前分支的下一个提交快照中被删除。
  如果一个文件被`git rm`后进行了提交，那么它将脱离git跟踪，这个文件在之后的节点中不再受git工程的管理。
  执行`git rm`后，该文件会在缓存区消失。
  你也可以直接从硬盘上删除文件，然后对该文件执行 `git commit`，git会自动将删除的文件从索引中移除，效果一样。 
-  `git mv` 命令用于移动文件，也可以用于重命名文件。

例1：需要将文件 codehunter_nginx.conf 从当前目录移动到 config 目录下，可执行： 

```bash
git mv codehunter_nginx.conf config
```

例2：需要将文件 codehunter_nginx.conf 重命名为 new_nginx.conf ，可执行：  

-  `git commit` 主要是将暂存区里的文件改动提交到本地的版本库。
  在此强调，提交这个动作是本地动作，是往本地的版本库中记录改动，不影响远端服务器。
  `git commit`一般需要附带提交描述信息，所以常见用法是：`git commit file_name -m “commit message”`
  提交成功后，`git log`可查到此次提交的id和提交描述信息。
  如果要一次性提交所有在暂存区改动的文件到版本库，可以执行：`git commit -am “commit message”` 
-  `git push` 将本地版本库的分支推送到远程服务器上对应的分支。
  （在使用`git commit`命令将自己的修改从暂存区提交到本地版本库后）
  成功推动远端仓库后，其他开发人员可以获取到你新提交的内容。
  常用的推送命令格式： `git push origin branch_name`
  `branch_name`决定了你的本地分支推送成功后，在远端服务器上的分支名，其他人据此可以获取该分支上的改动内容。
  （你的本地分支名可以与推送到远端的分支名不同： `git push origin branch_name:new_branch_name`） 

#### 查看工作区

`git diff`：查看工作区的修改内容

`git status`：查看工作区文件状态

-  `git diff`用于比较项目中任意两个版本（分支）的差异，也可以用来比较当前的索引和上次提交间的差异。 

```bash
git diff 423b7e8 f2efb8f # 比较两个节点之间的差异
git diff --cached # 当前的索引和上次提交间的差异
git diff master..lin/develop/framework # 比较两个分支之间的差异
git diff master..lin/develop/framework --name-status # 在diff后面加--name-status参数，只看文件列表
```

-  `git status` 命令用于显示工作目录和暂存区的状态。
  使用此命令能看到修改的git文件是否已被暂存，新增的文件是否纳入了git版本库的管理。
  下例中的信息表明：
  `modeules/__init__.py`已被修改并暂存，
  `LICENSE`已被修改但未暂存，`README.md`已被删除但未暂存，
  `extend.txt`已被新建但未跟踪。 

```bash
$ git status
On branch master
Your branch is up-to-date with 'origin/master'.
Changes to be committed:
  (use "git reset HEAD <file>..." to unstage)

        modified:	modeules/__init__.py
        
Changes not staged for commit:
  (use "git add/rm <file>..." to update what will be committed)
  (use "git checkout -- <file>..." to discard changes in working directory)

        modified:	LICENSE
        deleted:	README.md

Untracked files:
  (use "git add <file>..." to include in what will be committed)

        .extend.txt
```

注意，请保证能理解`git status`回显的每一行文字含义。 

#### 查看日志

`git log`：查看当前分支上的提交日志

`git log`用于查看提交历史。

默认不加其他参数的话，`git log` 会按提交时间由近到远列出所有的历史提交日志。每个日志基本包含提交节点、作者信息、提交时间、提交说明等。

`git log`配合不同参数具有相当灵活的展示功能，
常见的如`--name-status` / `-p` / `--pretty` / `--graph`等等，有兴趣的自行了解。

`git log -2`表示查看最新的2条日志，当然2可以改成其他数字。

#### 分支管理

`git branch`：列出本地分支

`git branch [new_branch_name]` / `git checkout –b [new_branch_name]`：新建分支

`git branch -d`：删除分支

`git checkout`：切换分支

`git pull` / `git fetch`：更新分支

`git merge`：合并分支

-  `git branch`命令即可查看本地工程的所有git分支名称。
  下面可见，git返回了当前本地工程所有的分支名称，其中master分支前面的“*”表示——当前工作区所在的分支是master。 

```bash
$ git branch
  develop_haotian_200
* master
```

如果想查看远端服务器上拥有哪些分支，那么执行`git branch –r`即可，返回的分支名带origin前缀，表示在远端；
如果想查看远端服务器和本地工程所有的分支，那么执行`git branch –a`即可。 

-  `git branch`和`git checkout –b` 新建分支的异同：
  相同点：
  `git branch`和`git checkout –b`都可以用于新建分支（默认基于当前分支节点创建）。
  区别点：
  `git branch`新建分支后并不会切换到新分支；
  `git checkout –b`新建分支后会自动切换到新分支。
  常用的新建分支命令格式：
  `git branch new_branch_name` / `git checkout –b new_branch_name` 
-  `git branch –d`和`git branch –D`都可以用来删除本地分支，后者大写表示强制删除。
  有时候当事分支上包含了未合并的改动，或者当事分支是当前所在分支，则`-d`无法删除，需要使用强制删除来达到目的。
  常用的删除分支命令格式：`git branch –d branch_name` / `git branch –D branch_name`
  删除服务器上的远程分支可以使用`git branch -d -r branch_name`，其中`branch_name`为本地分支名。
  删除后，还要推送到服务器上才行，即`git push origin -d branch_name`
  （或者直接 `git push origin -d remote_branch_name`） 
-  `git checkout` 命令除了创建分支，还用来切换分支，当然比较官方的叫法是“检出”。
  有时候，当前分支工作区存在修改而未提交的文件，与目的分支上的内容冲突，会导致checkout切换失败，这时候，可以使用`git checkout –f`进行强制切换。
  常用的切换分支命令格式：`git checkout branch_name`
  `git checkout`的对象可以是分支，也可以是某个提交节点或者节点下的某个文件。建议自行按需了解。 
-  `git pull`的作用是，从远端服务器中获取某个分支的更新，再与本地指定的分支进行自动合并。
  常用的更新分支命令格式：`git pull origin remote_branch:local_branch`
  如果远程指定的分支与本地指定的分支相同，则可直接执行`git pull origin remote_branch`（**通常如此**，**不建议**使用这条命令在不同名的远程和本地分支） 
-  `git fetch`的作用是，从远端服务器中获取某个分支的更新到本地仓库（不会自动合并）。
  注意，与`git pull`不同，`git fetch`在获取到更新后，并不会进行合并（即后面介绍的`git merge`）操作，这样能留给用户一个操作空间，确认`git fetch`内容符合预期后，再决定是否手动合并节点。
  常用的获取远端分支更新命令格式：`git fetch origin remote_branch:local_branch`
  如果远程指定的分支与本地指定的分支相同，则可直接执行`git fetch origin remote_branch`
  ※补充：实际操作中，会把本地没有但是远端有的分支以fetch的方式拿到本地，但不会对本地分支的commit节点产生影响。后续讲这个新本地分支merge不merge到你当前的分支，取决于你。 

#### 分支合并

`git merge` / `git rebase`：合并目标分支内容到当前分支

-  `git merge`命令是用于从指定的分支（节点）合并到当前分支的操作。
  git会将指定的分支与当前分支进行比较，找出二者最近的一个共同节点base，之后将指定分支在base之后分离的节点合并到当前分支上。分支合并，实际上是分支间差异提交节点的合并。
  
  常用的合并分支命令格式：
  `git merge branch_name`，`branch_name`即为源分支，后面一个参数不写默认是当前分支
  `git merge from_branch_name to_branch_name`，如上图所示即为`git merge master feature` 
-  `git rebase`用于合并目标分支内容到当前分支。
  `git rebase`这条命令用于分支合并，`git merge`也是用于分支合并。如果你要将其他分支的提交节点合并到当前分支，那么`git rebase`和`git merge`都可以达到目的。
  
  常用的合并命令格式：
  `git rebase branch_name`，`branch_name`即为源分支，后面一个参数不写默认是当前分支
  `git rebase from_branch_name to_branch_name`，如上图所示即为`git rebase master feature`
  BUT，`git merge`、`git rebase`背后的实现机制和对合并后节点造成的影响有很大差异，有各自的风险存在。`git rebase`的风险更大，一般不建议使用；而`git merge`相对而言更安全，log更有追溯性。 

#### 撤销操作

`git reset`：强制回退到历史节点

`git checkout .`：回退本地所有修改而未提交的

-  `git reset`通常用于撤销当前工作区中的某些`git add/commit`操作，可将工作区内容回退到历史提交节点。
  常用的工作区回退命令格式：`git reset commit_id`
  注：`git reset --mixed/hard/soft`有三种参数模式。
  `git reset --hard [rollback_commit_id]`会直接回退到rollback_commit_id这个commit节点，无任何提示信息，所以谨慎使用。 
-  `git checkout .`用于回退本地所有修改而未提交的文件内容。
  `git checkout .` 这是条**有风险**的命令，因为**它会取消本地工作区的修改（相对于暂存区）**，用暂存区的所有文件直接覆盖本地文件，达到回退内容的目的。但它不给用户任何确认机会，所以谨慎使用。
  ※如果仅仅想回退某个文件的未提交改动，可以使用`git checkout [filename]`来达到目的。
  如果想将工具区回退（检出）到某个提交版本，可以使用`git checkout commit_id`。 
