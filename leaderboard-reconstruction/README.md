# WYRPLAY leaderboard frontend

独立 Next.js 16 / React 19 静态首页原型，参考 `leadboard.png`，不调用业务接口。页面采用可编辑 HTML、CSS、SVG 图标和独立插画素材，没有将整张设计稿作为页面背景。

```bash
cd /Users/milushangdi/Projects/wyrplay/leaderboard-reconstruction
bun install --frozen-lockfile
bun run dev
```

浏览器地址：http://127.0.0.1:4188/ 。已有独立生产构建由 `bun run start` 提供预览。当前验证复用了旁边原型的 node_modules；复制本目录后按上述安装命令安装即可。

```bash
bun run verify
bun run format:check
bun run build
bun run start
bun run verify:browser -- round-04
```

`build` 生成可独立托管的 `out/`，`start` 仅提供该目录的静态文件。

## 范围与操作

完整覆盖参考稿的导航、英雄区、分类、侧栏、Top 3、Top 10、分页、统计、Hall of Fame 和底部创建入口。收藏、点赞、搜索、问题选择、创建问题预览均为浏览器内状态，刷新后重置。

分类和时间筛选使用明确的静态演示排序，不代表真实社区排行。登录、注册、额外分页和提交发布没有接入服务，相应入口提供清楚的范围提示，不伪造成功。样稿的投票和评论数字是写死的设计数据。

## 视觉基线与素材

参考图为 868 × 1812px。校准基线为 868 × 900 CSS 视口、DPR 1、完整长页截图。390 / 768 / 1280px 为另行设计的响应式延展，参考图没有提供这些设备的布局。

`evidence/regions.json`、`measurement-01/` 保存测量基线；`round-01` 至 `round-04` 保存迭代截图、真实浏览器采集和偏差报告。`assets.json` 保存每件图片的裁切坐标、来源和覆盖台账。

Logo、人物、奖杯、灯泡、题目插画和边缘装饰来自原稿裁切。奖牌通过边缘连通背景分离获得 alpha；底部奖杯使用人工轮廓蒙版。它们不是原始矢量素材，也没有经 AI 高清重绘。高 DPR 或放大显示的素材锐度仍受参考图分辨率限制。

字体采用本地 Chewy、Roboto、Roboto Condensed；Google Fonts 的下载来源保存在 `evidence/*-source.css`。原稿未提供字体信息，不能确认是原字体。SVG 普通图标和部分背景装饰有细节差异。因此几何对齐不等于逐像素一致，没有宣称百分比还原度。
