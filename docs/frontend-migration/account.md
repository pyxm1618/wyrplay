# Account 概览页 UI 迁移

正式入口 `/account`，修改 `src/app/(account)/account/page.tsx`，视图位于 `src/components/account/account-overview.tsx`。没有修改认证后端、账户安全操作、题库、投票服务、数据库 schema 或正式功能开关。账户子页继续使用原 AccountShell。

## 数据与操作

- 真实登录用户的姓名、邮箱、头像、注册月份来自原 `getAccountContext`。姓名为空显示界面标签 “Your Account”，不生成虚构用户名。没有 username 字段，因此不伪造 `@alex_wyr`。
- 无头像或头像加载失败使用设计稿裁出的默认头像，明确默认头像的 alt。
- Settings 进入原 `/account/security`，保留会话、注销及账户删除操作。Account menu 保留账户安全入口，Credits/Billing 入口随原 commerce 开关显示；不绕过禁用能力。
- Saved Questions 读取 Finder 原来的 `wyrplay:saved-questions:v1` 本机收藏，展示批准题库中的真实题目。Overview 最多显示三题，Saved Questions 标签显示全部。收藏不是跨设备账户同步，不展示虚构票数。
- 移除时重新读取当前存储，仅删除用户选中题目的 ID，无法识别的 ID 保留。JSON 错误、存储访问或写入失败显示明确错误，不覆盖损坏数据、不假装已删除。
- 收藏题目打开原 DuelArena，使用原 `/api/wyr/vote`；支持投票、改票、键盘 A/B、刷新恢复选择、下题和随机。
- 没有持久化游戏进度、账户活动、个人投稿和编辑资料的已验证流程。这些区域保留设计结构，使用明确状态；不补入图中的 3/20、活动时间、投稿记录、审核状态和虚拟票数。Overview/My Questions/Recent Activity 标签实际可切换。

## 视觉与素材

设计基线 `/Users/milushangdi/Desktop/wyr设计稿/account.png`，1024×1536 像素按 1024 CSS px 桌面宽度建立测量，不把竖图当作手机设计。

复用项目 Logo 和本地字体；从用户设计稿裁出 `default-avatar.png`、`travel-sign.png`、`bulb.png`。这些是截图裁图，保留背景，不冒称原始透明素材或矢量素材。底部灯泡用 CSS 渐变遮罩柔化边缘。普通图标、文字、标签、按钮、云彩和布局由代码实现，未整页图片化，未使用新生图服务。

云彩采用 CSS 近似，字体采用现有 Chewy/Roboto/Roboto Condensed，装饰手写字与原稿有差异。数据缺失区域使用状态说明，因此不宣称设计稿像素完全一致。

证据 `.artifacts/account-integration/`：标注图、实际 DOM 采集、各轮 geometry、真实页面截图和操作结果。标题超长允许三行省略，完整标题仍在按钮名称、title 和题目弹窗中可读。页面样式限定 `.account-overview`，弹窗与其他账户子页保持原组件行为。

## 验证

- Root `bun run typecheck`、`bun run lint`、相关文件 Prettier、`git diff --check` 通过。
- 全部单元测试 58 个文件、303 项通过。
- `verify:seo`、`verify:i18n` 通过，原六条 SEO 页面保留。
- 独立验证副本的 Next.js 生产构建通过，测试环境开启原认证开关，没有改项目默认开关。
- `browser-results.json`：9 组真实浏览器检查通过，包括登录资料、空收藏、共享收藏、未知 ID 保留、写入失败、标签、真实投票/改票、损坏数据、Settings、长身份与头像失败、四种宽度。
- `tests/e2e/account-ui.spec.ts` 新增 3 项测试，真实邮件链接登录保护、收藏精准移除、损坏存储不被覆盖；在隔离测试服务通过。
- 390、768、1024、1280 CSS px 截图无横向溢出。字体、图片、DPR 和页面身份由真实采集确认。

截图的 Alex 是本次创建的隔离测试账户，展示真实测试登录 session 返回的数据；收藏是本机测试数据，不是生产用户记录。浏览器写票只进入本次随机 test schema。未部署、未合并、未执行生产迁移。

## 验证环境中遇到的问题

开发服务器首次缺少测试 analytics 配置，补齐验证进程环境后恢复，没有修改项目环境要求。现有 MagicLinkConfirmation 的 effect 在开发 StrictMode 下会重复读取已移除的 token fragment；本次没有改认证组件，登录验证采用生产构建，不宣称开发模式确认页已通过。

磁盘空间不足时，只删除本次账户与排行榜验证副本中的可重新生成 Next cache（逐文件范围和核对记录见 cache-cleanup.json）。随后系统 Playwright 浏览器缓存不可用，改用已安装 Chrome 的独立自动化上下文；没有安装依赖或改正式测试配置。

## 清理与交付

验证服务已停止。`cleanup-ledger.json` 与 `cleanup-results.json` 核对并清理本次 schema 的 9 个表、59 条测试记录及临时 session 文件，共 69 项；剩余 schema 为 0。正式 public 数据和用户数据未更改。截图、DOM 测量、源文件 SHA 及操作记录保留。

最终校准 `round-03/report/geometry.md`：Profile 外框与参考一致；Header/Continue/Activity/Create 外框主要偏差不超过 1.25px；标签宽度差约 4.4px；真实内容使 Saved/My Questions 下移约 5.2px。Explore 高度增加 30px。最终截图已实际打开检查，标题三行省略正常，没有切掉字形。

正式项目仍遵循原认证开关和登录保护，未开启认证的环境继续保持原有不可访问行为。查看最终效果使用 `final-1024.png`、`final-390.png`，这些是已注明测试身份的验证截图。
