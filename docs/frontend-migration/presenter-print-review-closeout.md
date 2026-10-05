# Presenter / Print 审核收口修复

基线为被审核提交 `8a2bc764ad987c4d7e605dfc4eac4fcbf67cf4e4`。在独立工作区修复，没有修改原工作区 SEO 分支，也没有合并或部署。

## 已修复

1. 删除重复 `.print-output` 输出及其打印 CSS；浏览器只打印 `.print-document`，测试直接核对实际页数。
2. 删除单页 JPEG PDF fallback 及旧生成器。字体、Logo、QR 或矢量 PDF 失败均明确报错，不下载残缺文件。字体及 Logo fetch 检查 HTTP 状态。
3. 动态 `@page size` 同步 A4 / Letter，浏览器打印与 PDF MediaBox 均实际检查。
4. QR 使用当前站点 origin + 当前有序打印题集的 Play URL。资源加载完成后才渲染；预览、矢量 PDF、HTML 卡片/题单使用同一题集。HTML 题单不再以 Logo 代替 QR，卡片亦包含实际 QR。
5. 增加题数控制，所有输出共享截取后的题集。移除题单 15/20 选项，提供自动容量及最大6/10题；每页选项明确为上限，长题可提前分页，避免裁字。
6. Presenter 监听标准及 WebKit fullscreenchange。使用布局阶段监听；事件到达时浏览器已退出则关闭 overlay。保留拒绝全屏时的 overlay 降级。
7. ResizeObserver 测量容器可用宽高，100% 预览同时适配两者；显式放大仍可滚动。
8. PNG 单独生成300 DPI，Letter 为2550×3300px，写入300 DPI的pHYs元数据，页外背景透明。预览仍为144 DPI，不把预览声称为高清导出。
9. 所有打印 Logo 改为现有 `/play-art/logo.png`；没有重绘或夸大原始资源清晰度。
10. lockfile 569条历史包记录与基线父提交逐字相同，新增包使用官方 Registry；新增直接依赖按项目惯例固定版本。冻结 lockfile 检查通过。原本已有的镜像来源保持原记录。

## 验证证据

- 最终 Next 生产构建、lint、typecheck、format:check、git diff --check通过。
- 全单元测试58文件311项通过；architecture、SEO、i18n通过。
- 最终生产构建浏览器测试16/16通过；覆盖真实投票/题集往返、分享/收藏、投屏边界、浏览器全屏退出、打印格式与PNG/PDF、失败不下载、容器适配。
- 24题的实际浏览器打印与矢量PDF：卡片A4/Letter均4页，题单A4/Letter均2页；没有额外重复页。
- PDF解析验证纸张尺寸及可抽取正文，未使用整页JPEG作为PDF正文。
- 注入字体HTTP503：显示明确PDF错误，下载事件为0。
- PNG解析验证2550×3300px、约300 DPI、透明角落。
- 实际截图尺寸：题单390×844、800×900、1200×900、1366×768、1440×900、1920×1080、2560×1440；Presenter390×844、1366×768、1920×1080、2560×1440。已有E2E另覆盖375、1024×768和3840×2160。

证据位于 `.artifacts/closeout/`：build.log、browser-final.log、fullscreen-repeat.log、pdf-inspection.json、实际PDF/PNG及截图。实际查看了题单1366与Presenter1366/390截图。没有旧版截图断言基线，本次为截图检查和DOM尺寸验证，不称为自动视觉回归。早期失败的结果不作为最终成功证据。

## 明确边界

保留既有视觉与矢量PDF架构，没有推倒重做。截图裁切的Logo与装饰仍受原图分辨率限制。QR URL及图像输出已验证，实体打印机和手机扫码未实测；大型题集的长URL会提高二维码密度。手机Presenter允许滚动查看完整内容，桌面/投影模式按视口适配。

未运行涉及销毁数据库schema的综合verify，也没有验证部署、生产数据或其他页面的发布链路。最终结果不能替代独立PR审核或生产验收。

本地生产构建预览：http://127.0.0.1:4203/print 和 http://127.0.0.1:4203/play 。
