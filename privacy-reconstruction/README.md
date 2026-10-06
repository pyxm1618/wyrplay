# Privacy Notice Reconstruction

## 1. 范围与基线
- **还原目标**：按提供的 1024×1536 设计图，完成 `/privacy` 页面的像素级 UI 重构。
- **基线尺寸**：桌面参考图 1024×1536、CSS 视口 1024×1536、DPR 1。
- **页面架构与业务约束**：
  - 复用全局 `SiteHeader`（65px 高）与 `SiteFooter`，不复制或侵入全局组件。
  - 保留项目真实的 17 章节合法合规条款（`legalConfig.content.privacy`），包括未开放公开注册与结账的相关法定表述，绝不使用假数据替换。
  - 不新增冗余复杂的 ScrollSpy、Drawer 或数据模型，保持轻量高效的锚点跳转导航。
  - 仅替换 `/privacy` 的展示 UI，其他法律页面（`/terms`, `/acceptable-use`, `/refund-policy`, `/account-deletion`）不受任何影响。

## 2. 素材与视觉资产
- **Hero 3D 护盾插画**：使用连通区域背景去除算法从 1024×1536 原图高保真去底，输出 `public/hero-shield.webp`，通过 `check_asset_alpha.py` 严格验证（透明度检查通过率 100%）。
- **涂鸦与装饰**：手绘皇冠（`public/hero-crown.webp`）、手绘信封（`public/contact-envelope.webp`）、四角浮云（`public/privacy-cloud-*.webp`）均提取为透明矢量/WebP 资产。
- **字体系统**：复用项目已有开源字体 `Chewy`（卡通大标题）与 `Roboto`（正文），无需引入外部闭源字体。

## 3. 验证与比对证据
- **1024×1536 比对产物**：
  - 并排比对图：`privacy-reconstruction/round-01/report/side-by-side-1024x1536.png`
  - 50% 半透明叠加图：`privacy-reconstruction/round-01/report/overlay-1024x1536.png`
  - 绝对像素差异图：`privacy-reconstruction/round-01/report/diff-1024x1536.png`
- **几何与 DOM 测量报告**：
  - `privacy-reconstruction/round-01/report/geometry.md`
  - `privacy-reconstruction/round-01/report/verification.json`
- **响应式视口无横向溢出**：
  - `desktop-1280`：clientWidth = 1280, scrollWidth = 1280, overflow = false
  - `desktop-1440`：clientWidth = 1440, scrollWidth = 1440, overflow = false
  - `mobile-390`：clientWidth = 390, scrollWidth = 390, overflow = false
- **测试结果**：
  - TypeScript 类型检查：PASS (`tsc --noEmit`)
  - ESLint 检查：PASS (`eslint src/components/legal/ src/app/(legal)/privacy/`)
  - Vitest 单元测试：PASS (60 test files, 324 passed)
  - Playwright 法规 E2E 测试：PASS (10 passed in 20.2s)
