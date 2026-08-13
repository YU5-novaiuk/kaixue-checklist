# GitHub Pages 发布说明

项目已经支持发布到 GitHub Pages，并会自动适配以下两种地址：

- 项目网站：`https://用户名.github.io/仓库名/`
- 用户网站（仓库名为 `用户名.github.io`）：`https://用户名.github.io/`

## 首次发布

1. 在 GitHub 新建一个公开仓库，建议命名为 `kaixue-checklist`。
2. 将本项目推送到仓库的 `main` 分支。
3. 打开仓库的 **Settings → Pages**。
4. 在 **Build and deployment → Source** 中选择 **GitHub Actions**。
5. 打开仓库的 **Actions** 页面，等待 `Deploy to GitHub Pages` 显示绿色成功标记。

以后每次推送到 `main` 分支，网站都会自动重新发布。

## 数据说明

清单数据保存在访问者当前浏览器的本地存储中，不会上传到 GitHub，也不会在不同用户之间共享。同一用户更换浏览器、清除浏览器数据或更换设备后，原数据不会自动出现，需要使用网站内的导出和导入功能迁移备份。
