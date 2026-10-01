# Leaderboards 前端迁移

目标：将批准的 Leaderboard 原型迁入真实 Next.js 项目，路由 `/leaderboards`。没有重写投票服务、题库、认证或数据库 schema。其他页面的并行修改不属于这份迁移。

## 数据与交互

- 服务端单次只读聚合现有 `wyr_votes`，仅统计已批准题目。116 个已批准题目来自项目题库，不复制原型题目或虚拟票数。
- 全部、月、周分别按累计票数、UTC 自然月、UTC 周一开始的自然周排序。计时使用第一次投票的 `created_at`；同一匿名身份改选 A/B 不增加票数。
- 前三名排列为 2/1/3。第一页列表显示第 4–10 名，后续页每页十题，不重复前三名。搜索保留原排名。
- 点开题目复用原来的 DuelArena 与 `/api/wyr/vote`。关闭投票弹窗刷新榜单；下题、随机、键盘 A/B、刷新恢复选择保留。
- 统计为票数、已上榜题目数、不同匿名身份数、已批准题目数。匿名身份不是验证过的真实人数。
- 查询失败显示 unavailable、重试和破折号。成功查询无票显示空榜，不用示例题目或示例票数补齐。
- 缺少服务的 Trending、Most Discussed、Editor's Picks、Hall of Fame、收藏和创建明确不可用；认证入口遵循已有 feature flag。对应 12 项覆盖清单中 9 项实施、3 项业务能力等待，未知和删除均为 0。
- 排行榜路由 `public_noindex`；原有六条可索引 SEO 页面和 sitemap 保留。

## 视觉

复用批准原型的字体、Logo、Hero、边缘装饰、奖牌、灯泡和奖杯裁图；布局、文字、图标与控件仍由代码渲染。没有调用新生图服务。原图的动物/旅游/披萨插画与正式题库不一致，使用中性 A/B SVG 示意图；真实题目长标题允许截断，但完整标题可通过按钮名称和投票弹窗读取。

按 draw-ui 的测量、实际 DOM 采集和截图校准执行。868px 视口下，导航、Hero、分类、前三名和 Top10 外框与批准原型一致；统计和 CTA 起点经过第二轮修正。真实页数导致分页宽度变化。原稿和原型本身已有字体/图标差异，不宣称原稿像素完全一致。

## 验证证据

证据目录：`.artifacts/leaderboard-integration/`。

- `bun run typecheck`：通过。
- `bun run lint`：通过。
- `bun run test:unit`：57 个文件、296 项通过。
- 排行榜真实 PostgreSQL 集成测试：3 项通过，隔离随机 schema，不改已有 schema。
- `bun run verify:seo`、`bun run verify:i18n`、改动文件 Prettier 和 `git diff --check`：通过。
- 独立源码验证副本的 Next.js 生产构建：通过。
- `browser-results.json`：11 组浏览器检查，真实投票、改票、刷新、筛选、分页、搜索、功能禁用、投票失败、数据库不可用/重试、390/768/868/1280 视口无横向溢出。
- `round-02/report/verification.json`、`geometry.md`、`candidate.png`：draw-ui 校准，实际字体、视口、DPR、页面身份、图片解码及 DOM 元数据。
- `final-*.png` 是独立测试 schema 中的 300 个测试票和浏览器新增 1 个测试票，不是生产社区数据。测试票只用于验证，不写入正式 schema。

本次不部署、不合并、不执行生产迁移，也不证明生产数据库或登录配置已可用。

## 构建后本地预览

独立生产构建验证副本运行于 `http://localhost:4197/leaderboards`，读取原有本地 `creat_web_test` 的 public schema。只读冒烟检查观测到 4 票、1 道上榜题目、4 个匿名身份、116 道批准题目；这是本地数据，不是生产数据。

`built-results.json` 确认排行榜、首页、五条 SEO 页面、查找页共八条路由均为 200，无浏览器运行错误。其他路由没有排行榜根节点。`cleanup-ledger.json` 和 `cleanup-results.json` 记录浏览器测试 schema 的 301 行逐项范围及清理结果，public schema 保留。

预览副本不跟随其他聊天的后续代码修改；正式实现已保存到原项目 `src/app/(leaderboard)` 和 `src/modules/would-you-rather/ui/leaderboard`，正常项目启动也可访问 `/leaderboards`。验证副本没有改动正式项目运行配置。端口 4195 后被其他进程占用，因此保留该进程，使用 4197 展示构建结果。
