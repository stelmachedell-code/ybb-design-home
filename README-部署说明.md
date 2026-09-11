# YBB Design Home｜GitHub + Render 部署

## 上传 GitHub

1. 解压本压缩包。
2. 在 GitHub 新建一个仓库。
3. 把解压后的全部内容上传到仓库根目录。请确保 `dist`、`render.yaml` 和本说明文件直接位于仓库根目录，不要只上传 `dist` 里面的内容。

当前视频和 PDF 单文件均未超过 GitHub 的 100 MB 单文件限制，不需要 Git LFS。

## 在 Render 部署

1. 登录 Render，选择 **New → Blueprint**。
2. 连接刚才的 GitHub 仓库。
3. Render 会读取根目录的 `render.yaml`，创建名为 `ybb-design-home` 的静态站点。
4. 点击部署，完成后即可获得公开网址；以后向同一 GitHub 仓库提交修改，Render 会自动重新部署。

也可以手动创建 **Static Site**：Build Command 填 `echo "Static portfolio ready"`，Publish Directory 填 `dist`。

## 注意

- GitHub 和 Render 都是国际服务；网页可以公开访问，但在中国大陆不同网络中的连接速度和稳定性无法由代码保证。
- 不要删除 `dist/public/works`、`dist/assets`、`dist/scenes`、`dist/弹窗`、`dist/简历` 或 `dist/荣誉`，这些目录包含作品、视频和交互素材。
