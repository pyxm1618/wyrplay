# WYRPLAY 首页还原

独立的 Next.js 16 + React 19 + TypeScript 纯前端项目，只实现 `home.png` 首页。所有问题、票数、分类、评价和统计均写死在 `app/page.tsx`，没有 API、数据库或认证接入。构建使用 `output: "export"`，产物是完整静态网站。

## 查看与运行

```sh
cd /Users/milushangdi/Projects/wyrplay/home-reconstruction
bun install --frozen-lockfile
bun run dev
```

打开 http://127.0.0.1:4187/ 。

生产静态预览：先运行 `bun run build`，再运行 `bun run start`。`start` 只提供 `out/` 静态文件，不包含业务接口。端口被占用时保留原进程；可通过 `PORT=4188 bun run start` 更换静态预览端口。

## 实现边界

- 完整还原首页的导航、主视觉、宠物选择、分类、精选问题、玩法、热门问题、创建区、统计、社区评价和使用场景。
- 常规文字、卡片、按钮、比例条与评价均为真实 HTML/CSS；没有把整张截图作为页面背景。
- PNG 中的照片、插画、头像及特殊品牌字样通过 SVG 视口裁切复用，原始图只加载一次；人物轮廓通过 SVG 路径选择，保留原稿表情。复制此项目时应保留 `public/assets/reference-art.png`。
- 首屏净背景和透明灯泡为内置生图工具重建，分别为 1462×1076 和 1122×1402。当前工具未提供可指定的 “image 2.5” 型号，未将其冒称为该型号。
- 问题选择、搜索、分类弹窗和创建问题预览仅使用浏览器状态；选择后显示的是写死的设计稿百分比，不增加票数，不宣称提交到服务器。登录和注册按钮保留外观并禁用，账户页面不属于本次首页范围。
- 778px 视口对应原图 778×2021；桌面等比例放大，窄屏重新排版。原稿只有一个视口，移动布局属于实现推断。

## 验证

```sh
bun run verify
bun run format:check
# 浏览器验证要求静态预览服务已启动在 4187。
# 首次使用且本机没有 Chromium 时：bunx playwright install chromium
bun run verify:browser
```

浏览器验证覆盖 778、1280、390px，真实字体渲染、图片加载、弹窗、键盘关闭、本地搜索、创建预览、无横向溢出和零 API 请求，并检查 DPR 2 的 Logo、灯泡边缘及深浅底透明度。每次默认验证写入新的 `evidence/browser-check-*` 目录，保留历史记录。

原图测量、标注、逐轮截图、DOM 采集、几何报告和素材来源保存于 `evidence/`。最终校准证据见 `evidence/round-07/`，实际截图见 `evidence/round-07/candidate.png`。

## 视觉差异

已按 draw-ui 流程进行真实浏览器截图校准，主要容器的位置与尺寸对齐测量基线。不能把几何对齐称为 100% 逐像素一致：原 PNG 未提供字体和图层，正文采用近似的本地 Roboto Condensed，手写文案采用 Kalam；重建的净背景、灯泡、渐变、云朵接缝与曲线仍有局部差异。特殊品牌字样沿用原稿像素，不声称具有原始矢量或新增细节。

字体来自 Google Fonts，许可证随文件保存在 `public/fonts/`。原图与生成素材来源及尺寸详见 `evidence/assets.json`。
