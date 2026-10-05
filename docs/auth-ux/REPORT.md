# WYRPlay 认证 UI/UX 修复验收

验收日期：2026-10-03（Asia/Shanghai）。分支：`codex/auth-responsive-ux`。

本轮在独立工作树实现，原工作区的首页修改保留。开始时联网核实 main 为 `ea93a6fa37d6aa5bc7ce387623c5fa43769473d7`；收尾接到本地已更新的 `origin/main`：`6b3434cb63522311849f86a1d3058ba5449e9075`，认证代码没有上游变化。10 月 3 日再次 fetch 遇到 GitHub 连接失败，因此后者是本地可核实基线，不能声称是此时服务器上的最新提交。

## 1. 修改文件

| 文件 | 修改目的 |
| --- | --- |
| `src/components/auth/auth-surface.tsx` | 官方 SVG 品牌、精简 Header、共享 login/signup/confirm 外壳、清晰的价值说明层级 |
| `src/components/auth/auth-surface.css` | 从 1590 行重写为 509 行，合并基础／状态／平板／移动／短桌面规则 |
| `src/components/auth/auth-form.tsx` | 错误状态添加 alert 语义，品牌拼写一致 |
| `src/components/auth/auth-icons.tsx` | 删除不再使用的 Search 和 Crown |
| `src/components/security/turnstile-widget.tsx` | 官方 flexible/compact 按容器宽度切换，尺寸切换清除旧 token，命名 group |
| `src/app/(account)/auth/magic-link/confirm/page.tsx` | 用 AuthSurface 替换 AccountShell；保留 noindex/no-referrer |
| `src/app/(account)/auth/magic-link/confirm/magic-link-confirmation.tsx` | 安全警告、明确操作、可访问状态与重新获取链接入口；网络失败进入 error |
| `tests/e2e/auth-ui.spec.ts` | 正确限定导航区域，消除重复 Log in 文案带来的定位歧义 |
| `tests/e2e/auth-responsive.spec.ts` | 14 个视口 × 3 个页面、展开状态、验证码尺寸／过期／错误、确认状态、axe AA、窄屏按钮文字回归 |
| `public/brand/auth/login-hero.webp`, `signup-hero.webp`, `clouds.svg` | 透明人物源资产与完整 viewport 云层 |
| `docs/auth-ux/*` | 资产账本、浏览器测量、验证记录与截图 |

没有修改 Better Auth、OAuth 配置、Magic Link 服务端 token/returnTo、HTTP API、session、rate limit、数据库 schema、依赖、构建或部署配置。AccountShell、SiteHeader、登录／注册路由元数据本身无需改动。

## 2. 删除旧代码与资产

删除 Speech DOM、WyrHand/WyrNote 相关运行样式、整套主导航／搜索／disabled 未来功能、自链接、登录营销 Benefits、将价值说明误作认证方式的 `or`、固定海报坐标、历史测量 overrides、scaleX、裁切/mask、`--auth-unit`、强制长页面及按高度隐藏核心文案规则。

删除线上目录的 22 个 PNG：两张旧 Logo、两张旧 Hero、六张 Benefits，以及两组各六张云朵／切图。每个文件的 SHA、尺寸、真实 Alpha 和删除原因见 [asset-ledger.json](asset-ledger.json)。原始 29 项 = 7 保留字体/许可 + 22 明确删除 + 0 等待 + 0 未审查；执行后再次对账一致。相同字节的历史源资产保留在 `auth-reconstruction/public/assets`，没有删除重建历史目录。

Hero 通过 imagegen 编辑：保留人物、姿态、服装、表情与气泡文案，清除米色背景、白色卡片残片和截断文字，补齐自然衣服轮廓。接入真实 Alpha WebP，未使用 CSS 掩盖脏源图。优化后两张资产约 316/328 KiB。云朵为原生 SVG，横跨 viewport，无固定设计稿边界。

## 3. 真实问题与修复

- 三个页面统一插画、字体、配色、卡片、Header 和状态体系；安全确认仍明确表示尚未登录。
- 登录卡片专注认证；注册 Benefits 是标题下的单列价值清单，Terms/Privacy 在初始卡片即可访问。
- 手机按内容自然增长，不再强制 1150px 高度；桌面内容有合理最大宽度，装饰始终覆盖整个视口。
- 短桌面调整字号、图片和间距，保留 Hero 问候／说明。
- 修复基础 button 字体规则覆盖移动端字号的优先级问题，320px Magic Link 标签完整单行。
- 验证码按实际可用宽度选尺寸；切换尺寸后旧 token 不再可提交。
- 错误反馈保持 alert/live-region；验证码 group 有合法可访问名称；email 展开自动聚焦；键盘首个 Tab 到 Home Logo。
- 确认请求网络失败不再永久卡在 submitting；安全确认警告、fragment 移除、单次使用、返回路径验证和服务器安全逻辑保持。

## 4. 旧报告误判

未将小数 auth-unit、缺少 font-smoothing、固定卡片高度、所谓无 Home 入口、PNG 无 Alpha 等同 JPEG、WyrHand 字体缺失、95px 图标必然溢出当成当前故障。当前问题是重复规则、语义关系、整套小屏布局及脏切图。清除 auth-unit/scaleX 是结构治理；没有添加 font-smoothing 或不存在的手写字体。

## 5. 浏览器视口验收

以下每组均实际运行 Sign In、Sign Up、Magic Link Confirmation，检查宽度／卡片溢出／Hero 与卡片重叠／字体及核心文案；前两页同时展开 Magic Link。42 组通过。截图逐组检查云层、人物透明边缘和信息层级，宽屏装饰没有垂直截断。移动端的正常纵向滚动由实际内容产生。

| 视口 | Sign In | Sign Up | Confirmation |
| --- | --- | --- | --- |
| 320×568 | PASS | PASS | PASS |
| 360×800 | PASS | PASS | PASS |
| 375×667 | PASS | PASS | PASS |
| 390×844 | PASS | PASS | PASS |
| 430×932 | PASS | PASS | PASS |
| 768×1024 | PASS | PASS | PASS |
| 1024×768 | PASS | PASS | PASS |
| 1280×800 | PASS | PASS | PASS |
| 1440×800 | PASS | PASS | PASS |
| 1440×900 | PASS | PASS | PASS |
| 1680×900 | PASS | PASS | PASS |
| 1920×900 | PASS | PASS | PASS |
| 1920×1080 | PASS | PASS | PASS |
| 2560×1080 | PASS | PASS | PASS |

机器测量见 [browser-evidence.json](browser-evidence.json)，验证摘要见 [verification.json](verification.json)。另外检查了 [390px / DPR 2 Retina 截图](evidence/signup-retina-390x844.png)，真实字体与插画清晰加载。状态测试明确区分 mocked provider 回应、真实测试邮件／数据库链路及真实 Cloudflare 脚本，不将 stub 成功当生产账号证明。

## 6. 截图

| 页面 | 桌面 | 手机 |
| --- | --- | --- |
| Sign In | [1440×900](evidence/sign-in-1440x900.png) | [390×844](evidence/sign-in-390x844.png) |
| Sign Up | [1440×900](evidence/sign-up-1440x900.png) | [390×844](evidence/sign-up-390x844.png) |
| Confirmation，无 token 的安全错误状态 | [1440×900](evidence/confirm-1440x900.png) | [390×844](evidence/confirm-390x844.png) |

[Confirmation ready](evidence/confirm-ready-1440x900.png) 使用未提交的 UI 测试 token，展示待用户确认的界面；截图本身不证明 token 合法或已登录。真实请求／邮件／确认／session 成功由独立 E2E 覆盖。

## 7. Turnstile 320px

Cloudflare 官方 [尺寸文档](https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/widget-configurations/) 明确 flexible 至少 300px、compact 为 150×140px。不能把 flexible 当成任意小容器都可缩放。

真实 Cloudflare 脚本、官方测试 site key 的浏览器记录：iframe 150×140，x=34…184，页面 scrollWidth=320，验证完成后发送按钮启用，iframe title 和 tabindex 保留。没有通过 overflow-x:auto、缩放或裁切解决。见 [真实控件视口截图](evidence/turnstile-real-320-viewport.png) 和完整页面截图。官方控件内部 style 自带 overflow:hidden，与应用裁切不同；尺寸测量证实 iframe 完整在卡片内。

最终真实 provider 与 UI 测量均在 2026-10-03 重跑通过；浏览器证据记录了日期。E2E 的尺寸 fixture 仅用于离线回归，测试 viewport 切换后旧 token 清除和宽度边界。

## 8. 验证结果与复现

| 检查 | 最终结果 |
| --- | --- |
| lint | PASS |
| typecheck | PASS |
| unit | 58 文件，305 测试通过 |
| auth UI / auth security / Turnstile / responsive E2E | 28/28 通过 |
| axe WCAG 2/2.1 AA | 三页及展开表单无 violations |
| production 参数下 build | PASS；既有 neutral feature profile |
| auth-enabled test build | PASS；用于浏览器认证 UI 与真实测试链路 |
| git diff --check | PASS |

未删除安全测试。安全 E2E 包含非公开 Better Auth mutation、session 撤销与当前 session 保护、fresh session、scanner-safe、single-use、无验证码 fail closed、合法 challenge 后限流及账户保护路由。

初次无 APP_ENV 的 build 按项目原校验失败；提供既有环境后通过。开发服务器与 build/typecheck 同时操作 `.next/types` 曾造成生成文件缺失；最终在 build 完成后独立重跑 typecheck。复用上一日测试数据库曾触发真实 429；最终使用本轮隔离 PostgreSQL 55416 的全新数据库，28 项全过，未删除历史限流记录或放松策略。磁盘不足时只清理本工作树可生成缓存，账本见 [cache-cleanup.json](cache-cleanup.json)。

项目标准命令：`bun run lint`、`bun run typecheck`、`bun run test:unit`、`bun run build`；E2E 运行本报告所列五个 spec。此机器 Playwright Chromium 下载未完成，实际采用已安装 Google Chrome 与原 Playwright runner；仅本地 ignored config 指定 channel，项目配置和依赖未变。标准 CI 仍采用原 Chromium 配置。

## 9. 已知限制

已覆盖矩阵中未发现遗留 UI 阻塞。没有执行生产部署或 Google 真实账号 OAuth；测试 profile 的 Google 原本 disabled，已覆盖可见禁用状态与 Google error callback。默认 neutral feature profile 原本关闭 auth，未擅自开启；生产认证仍需要项目既有的上线配置。真实 Cloudflare 使用官方测试 key，不等同生产域名的 live challenge／Siteverify 验收。

## 10. 交付提交

修复在 `codex/auth-responsive-ux` 独立分支提交，最终 SHA 在交付回复中提供；可用 `git log -1 --format=%H` 核对。没有合并 main 或部署。原工作区未用于本轮编辑。
