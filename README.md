# 苏普军的个人网站

基于 al-folio 1.2 / Jekyll，线上域名：https://supujun.top 。

## 发布到 Cloudflare Pages

发布链路：编辑 `main` → GitHub Actions 构建和检查 → 生成 `gh-pages` → Cloudflare Pages 自动发布。

Cloudflare 项目 `myweb-fux` 使用以下设置：

- 生产分支：`gh-pages`
- 构建命令：留空
- 构建输出目录：留空（分支根目录）
- 根目录：留空

`main` 是源码，不含可直接托管的首页。不要把它当作静态输出发布。
`gh-pages` 已包含 `index.html`、`cv/index.html` 和完整 `assets/`，无需 Cloudflare 再构建。
更改生产分支后，在 Cloudflare 中为 `gh-pages` 创建一次新生产部署；不必修改域名或 DNS。
以后只修改 `main`，不要手动编辑 `gh-pages`。

## 修改内容

- `_pages/about.md`：首页简介
- `_pages/cv.md`：教育经历
- `_data/socials.yml`：邮箱和 GitHub
- `_config.yml`：标题、域名和功能设置
- `assets/img/prof_pic.webp`：头像

## 本地构建和预览

使用 Ruby 3.3、Bundler 2.4.22 和 Node 22。`jekyll-sass-converter` 必须为 3.x：旧版 Sass 不支持主题的 `@use`，会生成无效 CSS。

在本项目目录打开 WSL Ubuntu-22.04 后执行：

```bash
export PATH="$HOME/.local/ruby-3.3.5/bin:$PATH"
export BUNDLE_PATH="$HOME/.bundle/myweb"
bundle install
JEKYLL_ENV=production bundle exec jekyll build
```

回到 Windows 项目目录，执行：

```powershell
npm ci
node test/check-site.cjs
powershell -File .\preview.ps1
```

访问 http://127.0.0.1:4000/ 。停止预览按 Ctrl+C。

不要双击 `_site/index.html`：页面中的 `/assets/...` 是站点根路径，`file://` 无法正确解析它。

需要验证桌面和手机显示时，在预览服务运行期间执行：

```powershell
npx playwright install chromium
node test/check-browser.cjs
```

截图保存在 `output/playwright/`（不会上传）。

## 历史版本

旧网站已保存于提交 `c930805`，原目录 `D:\个人信息与简历\个人网站` 仍然保留。
模板使用 MIT License，详见 `LICENSE`。
