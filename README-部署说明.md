# YBB DESIGN HOME · 2026-09-16

完整网页在 `dist` 文件夹内，入口是 `dist/index.html`。图片、PDF、视频、字体和脚本均已包含，不要只上传 index，也不要直接把 ZIP 上传到 GitHub。

## GitHub + Render

1. 解压本压缩包。使用 GitHub Desktop 打开或创建你的网页仓库，把本文件夹中的 `dist`、`render.yaml`、本说明放到仓库根目录；提交并推送。更新原仓库时，应先备份旧版本，再用本包替换整个 dist，避免残留旧作品资源。
2. 在 Render 选择 New → Static Site，连接该 GitHub 仓库。已有 Render 网站则更新它原来连接的仓库。
3. Branch 选择你的实际分支（通常 main）；Root Directory 留空；Build Command 填 `echo "Static portfolio ready"`；Publish Directory 填 `dist`。
4. 点击部署。部署成功后，用手机移动网络和其他人的电脑打开 Render 返回的链接验证。以后提交更新至关联分支即可自动部署。

不要把 `.git`、`.openai`、临时文件或整个 ZIP 传入网站；本包不包含这些内容。
GitHub 网页上传单文件限制为 25 MiB、每批最多 100 个文件，完整项目文件较多，建议使用 GitHub Desktop。

官方说明：
- https://render.com/docs/static-sites
- https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository

Render 提供海外托管和 CDN，不保证中国大陆所有运营商、地区均能稳定访问。本包兼容 Render，但是否能在面试官网络顺畅打开，仍需要实际访问确认。此次发布的在线链接是原 ChatGPT Sites 地址，并未代为更新你的 Render 账户。

## 本次更新

- MY WORK 顺序：商业 A、商业 B、UX作品、其他、获奖作品。
- UX 更新为 7 页《乐心健康 V5.0》作品；首页用图片修复方式改善灰色背景的不均匀区域，保留文案和构图。其余六页保留原图像素，无损 WebP 分段、按需加载，另有手机小尺寸图片。
- VIEW FULL PDF 对应本次封面修复后的完整 7 页 PDF：`dist/public/works/ux-20260916/ux.pdf`。
- 手机/平板增加可见的“放大阅读 / 恢复全宽”，按整份作品统一放大；顶部作品栏可横向滑动，切换时显示当前选中作品。
- 手机场景入口采用清晰的中文标签；视频保留全屏并增大进度条触摸区域，支持分段请求的服务器可直接跳转播放位置，不支持时保留原有完整下载备用方式。
- 小屏幕或较矮的窗口隐藏右下角装饰机器人，避免遮住 VIEW WORK；热点随背景缩放与窗口大小变化重新定位。

## 验证与素材说明

已完成脚本语法、作品顺序、资源引用、PDF 页数、长图完整高度和无损图片像素校验。环境不支持此静态项目的浏览器预览，本次未进行真实手机/浏览器视觉验收；发布成功也不代表已在所有设备实测。

封面修复使用内置图片工具。编辑要求：仅修复中右侧灰色颗粒背景的接缝与斑块，保持所有文字、布局、色块和黑色页脚。网页使用的修复封面为 `dist/public/works/ux-20260916/01-01.webp`。如需保留完全未修复的封面，请使用你原上传 PDF。
