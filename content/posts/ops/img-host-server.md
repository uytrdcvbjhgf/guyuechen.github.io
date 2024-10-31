+++
title = '图床服务器搭建'
date = 2024-10-31T11:24:42+08:00
categories = ["cloud"]
tags = ["cloud"]
+++

### GitHub Pages 图床使用教程

GitHub Pages 可以作为图床使用，适合存储静态文件（如 .jpg、.png、.gif 格式）。

1. **创建 GitHub 账户**： 如果还没有账户，访问 [GitHub](https://github.com/) 注册一个。
2. **创建新仓库**：
   - 登录后，点击右上角的 “+” 符号，选择 “New repository”。
   - 输入仓库名称，确保选择 “Public”，然后点击 “Create repository”。
3. **上传图片**：
   - 进入新创建的仓库，点击 “Add file” > “Upload files”。
   - 将你的图片文件拖拽到页面中，或者选择文件上传。
   - 上传完成后，点击 “Commit changes”。
4. **启用 GitHub Pages**：
   - 在仓库主页，点击 “Settings”。
   - 滚动到 “Pages” 部分，选择 “main” 分支作为源，点击 “Save”。
   - 页面刷新后，GitHub 会提供一个链接，通常是 `https://<your_username>.github.io/<repository_name>/`。
5. **获取图片链接**：
   - 找到上传的图片，点击打开，右键选择 “复制图片地址”。
   - 这个链接可以在任何地方使用。

### 注意事项

- 确保图片文件不违反 GitHub 的使用条款。
- GitHub Pages 对于流量和请求有一定限制，适合低频率的使用。

要在 Typora 中实现自动将图片上传到 GitHub Pages 作为图床，可以通过以下步骤设置：

### 设置 Typora 自动上传图片到 GitHub Pages

1. **安装 Git**： 确保你的电脑上安装了 Git，可以从 [Git 官网](https://git-scm.com/) 下载并安装。

2. **配置 GitHub 仓库**：

   - 在本地创建一个文件夹作为你的仓库，并将其与 GitHub 的图床仓库关联。

   - 使用命令行进入该文件夹，并执行以下命令：

     ```bash
     git init
     git remote add origin https://github.com/<your_username>/<repository_name>.git
     ```

3. **设置 Typora**：

   - 打开 Typora，进入 `Preferences`（偏好设置）。

   - 在 `Markdown` 选项卡中，找到 `Image Upload`（图片上传）。

   - 选择 `Custom`，并填写上传命令。可以使用以下命令（假设你已在终端中配置了 git）：

     ``` bash
     git add . && git commit -m "Update images" && git push origin main
     ```

4. **测试上传**：

   - 在 Typora 中插入图片，使用 `Ctrl + V` 粘贴，Typora 会自动上传到 GitHub 仓库。
   - 上传成功后，复制图片链接到你的文档中。

### 注意事项

- 确保 GitHub 的 Personal Access Token 权限正确，以避免权限问题。
- 可能需要在终端中进行一些配置，以保证 Git 提交和推送的顺利进行。