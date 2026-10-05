# Account 体系收口报告 — 2026-10-03

最终工作目录：`/Users/milushangdi/.codex/worktrees/account-system-closeout/wyrplay`。
分支：`codex/account-system-closeout`。基线：`origin/main` `6b3434cb63522311849f86a1d3058ba5449e9075`。
原目录在执行中被外部重置并切换到其他分支；本轮文件从保留的 stash 恢复到独立工作树，未覆盖原目录的 Legal、Presenter、首页或分类页工作。以下结果均来自独立工作树的最终代码。

## 1. 改了什么

- **Account 架构与导航**：保留并重构服务端 `AccountShell`。Overview/Settings 使用现有主页面布局，Security/Billing/Credits 使用更紧凑的管理布局，共享米白背景、品牌 Header、圆角卡片、按钮和字体。一级导航为 Overview、Saved Questions、My Questions、Recent Activity、Settings；二级管理导航直接展示 Security、Billing、Credits，Commerce 链接继续受既有功能开关控制。
- **Logo 与图片**：检查首页与各新版页面后，选择首页正式品牌组合（现有 SVG 图标加 WYRPLAY 字标），不放大排行榜的 129×46 PNG。重新制作 bulb、travel-sign、default-avatar 的透明 WebP；三个 Alpha 通道均有 0 和 255 的像素。删除临时 mask 和 multiply，保留旧原图。
- **Security**：保留独立完整 Session 页面和全部撤销/退出操作。删除重复的 Delete Account 表单，删除入口仅留在 Settings `#delete`。过期的新鲜登录状态显示重新登录提示。
- **Billing**：保留全部订单、支付、退款、订阅查询与 cancel/resume API；补充已有 current-period-start 字段展示，保留 period end、past due、grace 与退款权益回滚状态。
- **Credits 与 Checkout**：Available/Reserved/Consumed/Expired/Revoked 和 Ledger 查询保持原语义。Return 参数不代表支付成功，只展示所属账户的服务端订单状态；非 UUID order 参数不再触发数据库 500。
- **Saved Questions**：账户级持久化；Finder、Play、Account 共用同一同步逻辑。游客继续用本地收藏；登录后将本地 ID 加法合并到服务器，唯一键去重；服务器确认后才清理本地已确认集合。失败、损坏数据和未知题目 ID 保留；退出后不把账户收藏复制到游客存储。收藏 API 按现有 registry 登记为 system 路由；写入限制当前账户，验证 Origin、JSON、命令和题目；与账户删除的 subject 锁协调，用户删除时级联清理收藏。
- **未开放功能**：接通 Better Auth 真实 Display Name 更新。移除灰色 Create/Edit Profile/投稿按钮、用户名与 Bio 假表单，以及 Published/Pending/Draft/Rejected 统计、Search、Sort 等无后端的管理界面。My Questions、照片/邮箱、通知与 Recent Activity 保留必要的真实功能边界说明。资料未修改、请求处理中和收藏尚未加载时的 disabled 属于真实状态。
- **响应式**：移动 Tabs 横向滚动，窄屏 Saved grid 单列，长邮箱、Session 信息、Billing 产品标识和 Ledger 内容允许换行，主要按钮触屏区域至少 44px。保留既有 1024/1440 宽度体系。
- **Deleted**：采用无需 Profile 的品牌生命周期页面，不展示账户操作菜单，可安全返回首页。

## 2. 已确认并修复的问题

旧 AccountShell 的暗色断层、重复删除表单、隐藏的重要管理导航、低清 Logo 放大、无 Alpha 截图和 CSS 掩盖、大量 disabled 假功能，以及账户收藏只在当前浏览器保存，均已修复。

复验另修复了 Checkout 非法 order 参数与“本地导入失败误报账户收藏不可用”的真实问题。未知收藏数据未被当作垃圾删除。

## 3. 不成立的旧判断与未修改项

奇数字号不是字体模糊证据；TTF 不等于模糊；已有 body font smoothing 不需重复添加；背景的 `translateX(-50%)` 不属于文本锐度问题；1440 最大宽度、大屏留白和 1024–1199 不铺满均不构成 bug。

这些项目均未机械修改。浏览器实际加载并验证 AccountBody 400/700、AccountChewy 400、AccountCondensed 700 四个字体，截图已复核。

## 4. 数据库变化

新增正式迁移：[`0015_account_saved_questions.sql`](../../drizzle/0015_account_saved_questions.sql)，配套 Drizzle snapshot 与 journal。
Schema：[`saved-question-schema.ts`](../../src/platform/database/saved-question-schema.ts)，表 `saved_questions`：`user_id`、`question_id`、`saved_at`。

组合主键 `(user_id, question_id)`；外键到 Better Auth `user.id`，`ON DELETE CASCADE`。只新增表，不迁走或覆盖旧业务记录。最终验收使用本工作树新建、仅绑定 localhost:55440 的独立 PostgreSQL；未使用其他任务的数据库。本地独立测试数据库已应用迁移，空库升级与既有主迁移链升级检查通过；实际 PostgreSQL PK/FK 对象也已核对。尚未应用到生产。

## 5. 验收结果

| 验收 | 结果 | 证据 |
| --- | --- | --- |
| `bun run lint` | PASS | 全工作树，无错误 |
| `bun run typecheck` | PASS | 完整 TypeScript 检查 |
| Unit | PASS | 59 文件，308 项 |
| Integration | PASS | 38 文件，247 项；真实隔离 PostgreSQL |
| Contract | PASS | 1 文件，31 项 |
| Migration | PASS | empty-to-latest、main-chain-to-latest 与 PK/FK |
| Standard build | PASS | 按既有 `.env.example` 配置 APP_ENV=local、APP_ORIGIN 和隔离 DATABASE_URL，执行 `bun run build` |
| Enabled-feature test build | PASS | 既有 E2E 启动脚本构建；Auth/Commerce/Credits 测试功能启用 |
| Browser | PASS | Account/Auth/Finder/Play 8 个测试文件，36/36 |
| Security/Commerce/Credits/Subscription/Secrets | PASS | 既有验证脚本全部执行 |
| Diff | PASS | 暂存和未暂存 diff check |

浏览器覆盖 320/360/375/390/768/1024/1120/1200/1440/1920。十个 Account 路由/视图状态和带数据库记录的 Billing/Credits 均验证无页面横向溢出；主要 Account 页面无 console/hydration error。Auth 对伪造当前 Session 撤销的拒绝会产生预期错误日志，不属于正常路由 runtime failure。

覆盖登录 guard、真实资料保存、单 Session 撤销、旧登录状态 Billing 拒绝、Settings 删除确认 UI、Deleted 无账户菜单、第二设备收藏、明确 unsave、未知 ID、损坏本地存储、失败导入保留本地、退出后隔离、外站 Origin 拒绝、非法命令，以及伪造支付成功参数不改变 server ledger。

早期磁盘空间不足、原工作树外部切换、以及隔夜 PostgreSQL 5432 停止引起的失败记录已保留；最终结果在恢复的独立工作树及独立数据库中重新取得。浏览器测试正常处理既有 Analytics consent（点击 Decline），不强制点击穿透。异步保存断言等待服务端确认；测试账户使用独立测试 IP，既有限流规则没有放宽。

日志与截图保存在本工作树 `.artifacts/account/`，不含真实商户付款凭证：

- [最终浏览器日志](../../.artifacts/account/browser.log)
- [Build 日志](../../.artifacts/account/build.log)
- [迁移日志](../../.artifacts/account/migrations.log)
- [Overview 1440px](../../.artifacts/account/browser-release-evidence/account-system-all-account-96337-duce-clean-browser-evidence-chromium/-account-1440.png)
- [Settings 375px](../../.artifacts/account/browser-release-evidence/account-system-all-account-96337-duce-clean-browser-evidence-chromium/-account-settings-375.png)
- [Security 375px](../../.artifacts/account/browser-release-evidence/account-system-all-account-96337-duce-clean-browser-evidence-chromium/-account-security-375.png)
- [Billing 375px，隔离测试记录](../../.artifacts/account/browser-release-evidence/account-commerce-dense-bil-9df02--readable-at-real-viewports-chromium/billing-records-375.jpg)
- [Credits 1440px，隔离测试记录](../../.artifacts/account/browser-release-evidence/account-commerce-dense-bil-9df02--readable-at-real-viewports-chromium/credits-records-1440.jpg)
- [Deleted 375px](../../.artifacts/account/browser-release-evidence/account-system-all-account-96337-duce-clean-browser-evidence-chromium/-account-deleted-375.png)

## 6. 剩余问题与发布边界

本轮 Account 范围没有已知未解决的验收失败。新 migration、分支合并和生产部署尚未执行；发布时必须先应用正式迁移。未进行真实商户付款/退款，因此这些测试不构成 provider 侧生产交易成功证据。现有 Commerce 功能开关与商户激活门禁保持原样。

未开放的投稿、头像上传、邮箱变更、通知和账户活动历史均明确说明或隐藏，没有用假后台、假统计填充。
