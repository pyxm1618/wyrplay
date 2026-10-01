# 找题库页迁移验收

本轮把已批准的 finder 高保真原型接入真实项目 `/find-questions`，不是首页重构。路由通过项目 config 和产品模块公共入口组装；样式与字体仅作用于 `.finder-page`。首页只补充找题库导航入口。工作区存在其他任务的首页、登录和榜单变更，本报告不将其计为本轮产出。

## 保留与接入

- 使用现有 116 道审核题及原有筛选规则，每页10道，最后一页6道。搜索与筛选提交后生效。
- 复用 `/api/wyr/vote`、DuelArena、PresenterModal；投票、改票及键盘操作仍走原后端。没有更改接口、数据库结构或依赖。
- 收藏为本机浏览器 localStorage，支持刷新恢复；选题跨页保留。演示和打印使用所选题，无选择时使用当前筛选池。
- 统计为真实接口结果，零票显示 No votes yet，失败显示 Retry。没有沿用原型虚构的人数、热门度或百分比。
- 工具路由登记 public_noindex，保留现有6个可索引页面；五个分类入口均接原页面。登录遵循现有 auth 开关。
- 原图裁切素材和原型字体复制到 public/finder，正文和操作均为可编辑代码；本轮没有调用图片生成。

## 验证

- `bun run format:check`、`bun run lint`：通过。
- `bun run typecheck`：通过；先用 `next typegen` 刷新了此前删除的旧 /leaderboard 路由缓存。
- `bun run test:unit`：57个文件，296项通过；找题库/产品相关34项通过。
- `bun run verify:architecture`、`verify:seo`、`verify:i18n`：通过。
- 当前源码的独立 Next 生产构建：通过，包含 /find-questions。源码副本位于 `.artifacts/finder-integration/final-runtime`，找题库源码逐文件校验与主项目一致。使用隔离构建目录避免干扰其他任务开发服务。
- `node node_modules/@playwright/test/cli.js test --config .artifacts/finder-integration/playwright.config.ts`：4/4通过，在上述生产构建验证真实投票/改票/键盘、失败状态、分页、收藏、搜索筛选、打印、演示、首页往返和375/700/849/1280px无横向溢出。
- 投票验证只使用新建本地隔离数据库 `wyrplay_finder_ui_20261001_1018`，已运行原有迁移；不使用或清理现有业务数据。未执行会重建数据库的整套 verify。
- `git diff --check`：通过。未部署或合并。

## 视觉证据与差异

849px桌面截图、375px窄屏截图及17区域DOM采集保存在 `.artifacts/finder-integration/round-final`。采集身份与渲染条件通过，脚本错误为空。导航与筛选栏外框一致；列表和底部操作栏比参考多10px高度。真实题文、标签、统计、功能开关和尾部分类/页脚与设计稿有明确差异，实际全页高2175px，参考1852px。没有宣称像素完全一致或量化还原率。

预览：http://127.0.0.1:4201/find-questions

覆盖台账：`find-questions-coverage.json`（8=8通过+0等待+0删除+0未知）；`coverage.json`保留首页13区域的原位置，不代表其他任务不能更新首页。

独立原型已从主项目的 TypeScript、lint 和格式化扫描中排除，原型保留各自配置；未改变包管理器、运行时或环境变量要求。
