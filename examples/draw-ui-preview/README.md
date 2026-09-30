# wyrplay UI Preview 原型说明文档

本目录（`examples/draw-ui-preview/`）为 `wyrplay` 独立的前端高保真交互原型，采用 `$draw-ui` 体系重新设计的 **Dual Polarity Tension System 2.0 (双极性对决张力系统)**。

> ⚠️ **严正声明**：本目录完全独立于正式应用代码，**wyrplay 正式生产前端代码（`src/app`、`src/components`、`src/config` 等）目前尚未做任何修改**。

---

## 1. 快速启动与访问

### 本地启动
在项目根目录运行任意静态 HTTP 服务（推荐端口 `8089`）：

```bash
# 方式一：Python 静态服务
python3 -m http.server 8089 --directory examples/draw-ui-preview

# 方式二：或使用 Node serve
npx serve examples/draw-ui-preview -p 8089
```

### 所有预览页面 URL 列表

| 页面名称 | 访问 URL (带 Hash 路由) | 核心展示重点 |
| :--- | :--- | :--- |
| **🏠 首页 (Homepage)** | `http://localhost:8089/#home` | 核心品牌 Wordmark、对决张力 Hero、嵌入式 Live Arena、3D 分类矩阵、精选专题、产品价值说明、FAQ 与 SEO 富底栏 |
| **🏷️ 分类落地页 (Category: Kids)** | `http://localhost:8089/#category` | 专为儿童/教室打造的干净绿标氛围、SEO 导言、题库卡片列表、原地直接对战、相关分类联结 |
| **🎮 核心对战页 (Play: Duel Arena)** | `http://localhost:8089/#play` | 纯净剧场式 A/B 极性卡片、单题序号进度条、键盘快捷键监听 (`A`/`B`/`N`/`P`)、全屏 Presenter 模式入口 |
| **📊 投票结果态 (Vote Results State)** | `http://localhost:8089/#results` | 投票后实时双色占比对撞条（Option A 56% vs Option B 44%）、胜利方高亮徽章、用户选择印记、随手改选机制、社交分享弹窗 |
| **🔑 登录 / 注册 (Magic Link Auth)** | `http://localhost:8089/#auth` | 与全站黑曜石电影感视觉统一的免密登录卡片、动态发送成功状态机、一键模拟跳入个人中心 |
| **👤 个人中心 (Account & Profile)** | `http://localhost:8089/#account` | 用户身份卡片、Dilemma 投票足迹、胜率统计（多数派吻合率 68%）、可用 Credits 积分流水、会话安全管理 |
| **🎨 设计系统展台 (Design System)** | `http://localhost:8089/#design-system` | Logo 矢量资产规范、Dual Polarity 极性色盘、文字排版阶梯、Button 族群、Chips 芯片、卡片构架 |

---

## 2. 交互特性与验证清单

1. **A/B 极性张力**：Option A（暖光火红/琥珀）与 Option B（极地冰川蓝），悬停微发光抬升，点击后平滑展开百分比与票数。
2. **多端自适应响应式**：
   - 桌面端 (1440px)：双栏对立对决、居中 VS Nexus 能量碰撞徽章。
   - 移动端 (390px)：单栏竖直流式堆叠，符合拇指热区与单手操作习惯。
3. **明暗双模支持**：支持 Obsidian Dark（深邃电影感）与 Parchment Light（羊皮纸暖白）。
4. **大屏 Presenter 模式**：点击工具条 `Presenter` 或按 `P`，立即进入专为投影仪、电视和教室白板优化的全屏沉浸模式。
5. **完整无报错**：通过 Playwright 自动化检查，全页面 0 Console Error，无水平布局溢出。

---

## 3. 生产代码组件映射与重构建议

待设计方案获得批准后，建议的生产组件重构路径如下：

| 现有生产组件路径 | 推荐重构方式 | 说明 |
| :--- | :--- | :--- |
| `src/modules/would-you-rather/ui/duel-arena.tsx` | **样式与结构重构** | 保留已有投票 API 状态机与键盘监听，将卡片外框升级为极性发光与平滑结果展开条。 |
| `src/components/navigation/site-header.tsx` | **直接调整样式** | 保留既有响应式折叠逻辑，引入 `素材/logo.svg` 作为品牌核心资产，统一文字阴影。 |
| `src/modules/would-you-rather/ui/category-explorer.tsx` | **增强交互并调整样式** | 由目前的单一筛选升级为 3D Taxonomy 矩阵（Occasions / Relationships / Age / Tone）。 |
| `src/modules/would-you-rather/ui/presenter-modal.tsx` | **直接保留并升级样式** | 现存全屏架构完备，只需适配新的极性卡片字体与大字号百分比。 |
| `src/app/globals.css` | **微调 Design Tokens** | 将 `--polarity-a`、`--polarity-b` 及相关 glow/border tokens 校准为当前确立的色值。 |
| `src/app/(account)/sign-in/page.tsx` | **直接保留逻辑，替换样式** | 保留 Better Auth 与 Turnstile 逻辑，将表单卡片包装为当前黑曜石流光样式。 |
