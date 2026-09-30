/**
 * wyrplay Dual Polarity Tension System - Prototype Controller V2
 * 纯原生交互引擎，驱动 8 大页面与三大通用模板切换、真实题库渲染、真实账户体系与法律模板
 */

(function () {
  "use strict";

  // 全局原型运行态
  const state = {
    currentView: "view-home",
    currentQuestionIndex: 0,
    hasVoted: false,
    userPick: null, // "A" | "B" | null
    theme: "dark",
    isPresenterOpen: false,
    currentCollection: "kids",
    currentLegalDoc: "privacy",
    currentAccountTab: "overview",
  };

  const data = window.WYR_DATA;

  // 1. 初始化入口
  function init() {
    // 检查并恢复 URL hash
    const hash = window.location.hash.replace("#", "");
    const hashMap = {
      home: "view-home",
      category: "view-collection-template",
      "collection-template": "view-collection-template",
      play: "view-play",
      results: "view-results",
      auth: "view-auth",
      account: "view-account",
      legal: "view-legal-template",
      "legal-template": "view-legal-template",
      "design-system": "view-design-system",
    };

    if (hash && hashMap[hash]) {
      switchView(hashMap[hash], false);
    } else {
      switchView("view-home", false);
    }

    renderTaxonomy("scenarios");
    renderCollections();
    renderCurrentQuestion();
    loadCollectionTemplate("kids");
    renderAccountData();
    loadLegalDocument("privacy");
    setupKeyboardListeners();

    // 监听浏览器前进后退 hash 变化
    window.addEventListener("hashchange", () => {
      const currentHash = window.location.hash.replace("#", "");
      if (currentHash && hashMap[currentHash]) {
        switchView(hashMap[currentHash], false);
      }
    });
  }

  // 2. 视图切换控制器
  window.switchView = function (viewId, updateHash = true) {
    state.currentView = viewId;

    // 隐藏所有视图
    const views = document.querySelectorAll(".prototype-view");
    views.forEach((v) => (v.style.display = "none"));

    // 显示目标视图
    const target = document.getElementById(viewId);
    if (target) {
      target.style.display = "block";
    }

    // 更新顶部工具条 Tab 高亮
    const tabs = document.querySelectorAll(".preview-tab-btn");
    tabs.forEach((tab) => {
      if (tab.getAttribute("data-view") === viewId) {
        tab.classList.add("active");
        const pill = document.getElementById("currentViewName");
        const spanText = tab.querySelector("span:last-child");
        if (pill && spanText)
          pill.textContent = spanText.textContent.replace(/Concept.*/, "").trim();
      } else {
        tab.classList.remove("active");
      }
    });

    // 同步浏览器 Hash
    if (updateHash) {
      const viewToHash = {
        "view-home": "home",
        "view-collection-template": "collection-template",
        "view-play": "play",
        "view-results": "results",
        "view-auth": "auth",
        "view-account": "account",
        "view-legal-template": "legal",
        "view-design-system": "design-system",
      };
      if (viewToHash[viewId]) {
        window.location.hash = viewToHash[viewId];
      }
    }

    // 平滑滚回顶端
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 3. 题目与对决渲染 (真实题库 questions.json 驱动)
  function renderCurrentQuestion() {
    if (!data || !data.questions || data.questions.length === 0) return;
    const q = data.questions[state.currentQuestionIndex];
    if (!q) return;

    // --- Home Arena 元素渲染 ---
    const homeQ = document.getElementById("homeQuestionText");
    const homeOptA = document.getElementById("homeOptionAText");
    const homeOptB = document.getElementById("homeOptionBText");
    const homeBadge = document.getElementById("homeDeckBadge");
    const homeProgress = document.getElementById("homeProgressIndicator");

    if (homeQ) homeQ.textContent = q.question;
    if (homeOptA) homeOptA.textContent = q.optionA;
    if (homeOptB) homeOptB.textContent = q.optionB;
    if (homeBadge)
      homeBadge.textContent = `${(q.primaryCollection || "KIDS").toUpperCase()} · ${(q.moods?.[0] || "FUNNY").toUpperCase()}`;
    if (homeProgress)
      homeProgress.textContent = `#${state.currentQuestionIndex + 1} of ${data.questions.length}`;

    // --- Play Arena 元素渲染 ---
    const playQ = document.getElementById("playQuestionText");
    const playOptA = document.getElementById("playOptionAText");
    const playOptB = document.getElementById("playOptionBText");
    const playBadge = document.getElementById("playDeckBadge");
    const playCounter = document.getElementById("playCounter");
    const playProgressBar = document.getElementById("playProgressBar");
    const playTagsRow = document.getElementById("playTagsRow");

    if (playQ) playQ.textContent = q.question;
    if (playOptA) playOptA.textContent = q.optionA;
    if (playOptB) playOptB.textContent = q.optionB;
    if (playBadge)
      playBadge.textContent = `${(q.primaryCollection || "KIDS").toUpperCase()} · ${(q.moods?.[0] || "FUNNY").toUpperCase()} & ${(q.moods?.[1] || "LIGHT").toUpperCase()}`;
    if (playCounter)
      playCounter.textContent = `Question #${state.currentQuestionIndex + 1} of ${data.questions.length}`;
    if (playProgressBar) {
      const progressPct = ((state.currentQuestionIndex + 1) / data.questions.length) * 100;
      playProgressBar.style.width = `${progressPct}%`;
    }

    if (playTagsRow) {
      const ageStr = q.ageBands ? q.ageBands.join(", ") : "All Ages";
      const scnStr = q.scenarios ? q.scenarios.join(", ") : "General";
      const moodStr = q.moods ? q.moods.join(", ") : "Funny";
      const diffStr = q.difficulty ? q.difficulty : "Medium";

      playTagsRow.innerHTML = `
        <span class="arena-meta-chip">Age: ${ageStr}</span>
        <span class="arena-meta-chip">Scenario: ${scnStr}</span>
        <span class="arena-meta-chip">Mood: ${moodStr}</span>
        <span class="arena-meta-chip">Difficulty: ${diffStr}</span>
      `;
    }

    // --- Results View 元素同步 (带有 Concept 演示标注) ---
    const resQ = document.getElementById("resQuestionText");
    const resOptAText = document.getElementById("resOptionAText");
    const resOptBText = document.getElementById("resOptionBText");
    const resOptALabel = document.getElementById("resOptALabel");
    const resOptBLabel = document.getElementById("resOptBLabel");

    if (resQ) resQ.textContent = q.question;
    if (resOptAText) resOptAText.textContent = q.optionA;
    if (resOptBText) resOptBText.textContent = q.optionB;
    if (resOptALabel) resOptALabel.textContent = `Option A: ${q.optionA}`;
    if (resOptBLabel) resOptBLabel.textContent = `Option B: ${q.optionB}`;

    // --- Presenter 元素同步 ---
    const presQ = document.getElementById("presenterQuestion");
    const presA = document.getElementById("presenterOptionA");
    const presB = document.getElementById("presenterOptionB");
    const presDeck = document.getElementById("presenterDeckInfo");

    if (presQ) presQ.textContent = q.question;
    if (presA) presA.textContent = q.optionA;
    if (presB) presB.textContent = q.optionB;
    if (presDeck)
      presDeck.textContent = `wyrplay · ${(q.primaryCollection || "KIDS").toUpperCase()} #${state.currentQuestionIndex + 1}`;

    // 同步立足点已选状态
    updateVoteUI();
  }

  // 4. 用户选择立足点 (A / B)
  window.handleVote = function (option, context = "home") {
    state.hasVoted = true;
    state.userPick = option;
    updateVoteUI();
  };

  function updateVoteUI() {
    const isVoted = state.hasVoted;
    const pick = state.userPick;
    const q = data.questions[state.currentQuestionIndex];
    if (!q) return;

    const cardsA = [document.getElementById("homeCardA"), document.getElementById("playCardA")];
    const cardsB = [document.getElementById("homeCardB"), document.getElementById("playCardB")];
    const statusA = [
      document.getElementById("homeStatusA"),
      document.getElementById("playStatusA"),
    ];
    const statusB = [
      document.getElementById("homeStatusB"),
      document.getElementById("playStatusB"),
    ];

    // Card A 状态
    cardsA.forEach((c) => {
      if (!c) return;
      if (pick === "A") {
        c.classList.add("selected");
      } else {
        c.classList.remove("selected");
      }
    });

    // Card B 状态
    cardsB.forEach((c) => {
      if (!c) return;
      if (pick === "B") {
        c.classList.add("selected");
      } else {
        c.classList.remove("selected");
      }
    });

    // 状态提示更新 (不捏造社区投票数)
    statusA.forEach((s) => {
      if (!s) return;
      if (pick === "A") s.innerHTML = "<b>✓ Your Stance Chosen</b>";
      else if (isVoted) s.textContent = "Click to switch to A";
      else s.textContent = "Click to choose A";
    });

    statusB.forEach((s) => {
      if (!s) return;
      if (pick === "B") s.innerHTML = "<b>✓ Your Stance Chosen</b>";
      else if (isVoted) s.textContent = "Click to switch to B";
      else s.textContent = "Click to choose B";
    });

    // 反馈横幅提示 (真实思辨引导)
    const feedbackEls = [
      document.getElementById("homeFeedbackNotice"),
      document.getElementById("playFeedbackNotice"),
    ];

    feedbackEls.forEach((el) => {
      if (!el) return;
      if (isVoted) {
        const chosenText = pick === "A" ? q.optionA : q.optionB;
        el.innerHTML = `You chose <b>"${chosenText}"</b>. Now turn to your friends/group and defend your reasoning!`;
      } else {
        el.textContent =
          "Select Option A or B above to choose your stance and begin your group debate!";
      }
    });
  }

  // 5. 换题与随机
  window.nextQuestion = function () {
    state.hasVoted = false;
    state.userPick = null;
    state.currentQuestionIndex = (state.currentQuestionIndex + 1) % data.questions.length;
    renderCurrentQuestion();
  };

  window.randomQuestion = function () {
    state.hasVoted = false;
    state.userPick = null;
    let nextIdx = Math.floor(Math.random() * data.questions.length);
    if (nextIdx === state.currentQuestionIndex) {
      nextIdx = (nextIdx + 1) % data.questions.length;
    }
    state.currentQuestionIndex = nextIdx;
    renderCurrentQuestion();
  };

  window.resetPrototypeState = function () {
    state.hasVoted = false;
    state.userPick = null;
    updateVoteUI();
    alert("Selection state reset! You can test fresh interaction now.");
  };

  // 6. Presenter Mode 全屏投影演示
  window.openPresenter = function () {
    state.isPresenterOpen = true;
    const overlay = document.getElementById("presenterOverlay");
    if (overlay) overlay.classList.add("active");
    renderCurrentQuestion();
  };

  window.closePresenter = function () {
    state.isPresenterOpen = false;
    const overlay = document.getElementById("presenterOverlay");
    if (overlay) overlay.classList.remove("active");
  };

  window.handlePresenterVote = function (opt) {
    handleVote(opt, "presenter");
    const elA = document.getElementById("presenterPctA");
    const elB = document.getElementById("presenterPctB");
    if (elA) {
      elA.style.display = "block";
      elA.textContent = opt === "A" ? "✓ Picked" : "";
    }
    if (elB) {
      elB.style.display = "block";
      elB.textContent = opt === "B" ? "✓ Picked" : "";
    }
  };

  // 7. 登录提交模拟 (Magic Link)
  window.handleAuthSubmit = function (e) {
    e.preventDefault();
    const emailInput = document.getElementById("authEmailInput");
    const email = emailInput ? emailInput.value : "alex@wyrplay.com";

    const form = document.getElementById("authForm");
    const success = document.getElementById("authSuccessState");
    const sentEmail = document.getElementById("authSentEmail");

    if (form) form.style.display = "none";
    if (sentEmail) sentEmail.textContent = email;
    if (success) success.style.display = "block";
  };

  // 8. 主题切换
  window.toggleTheme = function () {
    const html = document.documentElement;
    const current = html.getAttribute("data-theme") || "dark";
    const next = current === "dark" ? "light" : "dark";
    html.setAttribute("data-theme", next);
    state.theme = next;

    const icon = document.getElementById("themeIcon");
    const label = document.getElementById("themeLabel");
    if (next === "light") {
      if (icon) icon.textContent = "🌙";
      if (label) label.textContent = "Dark";
    } else {
      if (icon) icon.textContent = "☀️";
      if (label) label.textContent = "Light";
    }
  };

  // 9. 正交分类矩阵 (Orthogonal Faceted Taxonomy)
  window.filterTaxonomy = function (dimensionKey) {
    const tabs = document.querySelectorAll("#taxonomyTabs .tax-tab-btn");
    tabs.forEach((t) => t.classList.remove("active"));
    if (event && event.target) event.target.classList.add("active");
    renderTaxonomy(dimensionKey);
  };

  function renderTaxonomy(key) {
    const container = document.getElementById("taxonomyGrid");
    if (!container) return;

    const items = data.facets[key] || [];
    container.innerHTML = items
      .map(
        (it) => `
        <div class="tax-card" onclick="loadCollectionTemplate('${it.id}'); switchView('view-collection-template');">
          <div class="tax-card-top">
            <span class="tax-card-title">${it.icon ? it.icon + " " : ""}${it.label}</span>
            <span class="tax-card-count">Explore →</span>
          </div>
          <p class="tax-card-desc">${it.desc || "Curated dilemma facet ready to filter"}</p>
        </div>
      `,
      )
      .join("");
  }

  // 10. 渲染精选专题卡片集合 (Primary Curated Collections)
  function renderCollections() {
    const container = document.getElementById("collectionsGrid");
    if (!container) return;

    container.innerHTML = data.collections
      .map(
        (c) => `
        <div class="collection-card" onclick="loadCollectionTemplate('${c.id}'); switchView('view-collection-template');">
          <div>
            <div class="collection-card-top">
              <span class="collection-icon">${c.icon}</span>
              <span class="collection-badge">${c.badge}</span>
            </div>
            <h3 class="collection-title">${c.name}</h3>
            <p class="collection-desc">${c.subtitle}</p>
          </div>
          <div class="collection-card-bottom">
            <span>${c.count} Handcrafted Questions</span>
            <span>Play Deck →</span>
          </div>
        </div>
      `,
      )
      .join("");
  }

  // 11. 通用模板 1: SEO Collection Template 动态加载器
  window.loadCollectionTemplate = function (key) {
    state.currentCollection = key;

    // 预置 Collection 元数据与映射
    const collectionMetaMap = {
      kids: {
        categoryType: "Age Collection",
        name: "Kids",
        eyebrow: "Age Band · Clean & Wholesome",
        h1: "Would You Rather Questions for Kids",
        subtitle:
          "Wholesome, creative dilemmas designed for elementary students, morning meetings, and family car trips.",
        filterFn: (q) =>
          q.primaryCollection === "kids" ||
          (q.ageBands && q.ageBands.some((a) => ["4-6", "7-9", "10-12"].includes(a))),
      },
      friends: {
        categoryType: "Relationship Collection",
        name: "Friends",
        eyebrow: "Relationship · Hilarious & Social",
        h1: "Would You Rather Questions for Friends",
        subtitle:
          "Unfiltered, ridiculous, and high-energy scenarios engineered to test your loyalty and spark friendly debates.",
        filterFn: (q) =>
          q.primaryCollection === "friends" ||
          (q.relationships && q.relationships.includes("friends")),
      },
      classroom: {
        categoryType: "Scenario Collection",
        name: "Classroom",
        eyebrow: "Scenario · Morning Meeting & Bellringer",
        h1: "Would You Rather Questions for Classroom",
        subtitle:
          "Engaging, school-safe icebreakers to warm up student participation, critical thinking, and structured debate.",
        filterFn: (q) =>
          q.primaryCollection === "classroom" || (q.scenarios && q.scenarios.includes("classroom")),
      },
      couples: {
        categoryType: "Relationship Collection",
        name: "Couples",
        eyebrow: "Relationship · Romantic & Date Night",
        h1: "Would You Rather Questions for Couples",
        subtitle:
          "Playful choices and introspective questions for cozy evenings, first dates, and relationship check-ins.",
        filterFn: (q) =>
          q.primaryCollection === "couples" ||
          (q.relationships && q.relationships.includes("couples")),
      },
      party: {
        categoryType: "Scenario Collection",
        name: "Party",
        eyebrow: "Scenario · High Stakes & Rapid Fire",
        h1: "Would You Rather Questions for Parties",
        subtitle:
          "Fast-paced group showdowns and laugh-out-loud dilemmas to keep the room buzzing all night.",
        filterFn: (q) =>
          q.primaryCollection === "party" || (q.scenarios && q.scenarios.includes("party")),
      },
    };

    const meta = collectionMetaMap[key] || collectionMetaMap.kids;

    // 更新 DOM 元素
    const breadcrumbCat = document.getElementById("tplBreadcrumbCategory");
    const breadcrumbName = document.getElementById("tplBreadcrumbName");
    const eyebrowText = document.getElementById("tplEyebrowText");
    const h1El = document.getElementById("tplH1");
    const subEl = document.getElementById("tplSubtitle");
    const qListEl = document.getElementById("tplQuestionList");

    if (breadcrumbCat) breadcrumbCat.textContent = meta.categoryType;
    if (breadcrumbName) breadcrumbName.textContent = meta.name;
    if (eyebrowText) eyebrowText.textContent = meta.eyebrow;
    if (h1El) h1El.textContent = meta.h1;
    if (subEl) subEl.textContent = meta.subtitle;

    // 过滤匹配题目
    if (qListEl) {
      let filtered = data.questions.filter(meta.filterFn);
      if (filtered.length === 0) {
        filtered = data.questions.slice(0, 5); // 兜底保底
      }

      qListEl.innerHTML = filtered
        .map(
          (q, idx) => `
          <div class="question-row-card">
            <div class="question-row-header">
              <span class="question-row-num">#${idx + 1}</span>
              <div class="question-row-tags">
                <span class="badge-official">${(q.primaryCollection || "KIDS").toUpperCase()}</span>
                <span class="arena-meta-chip">Age: ${(q.ageBands || ["All"]).join(", ")}</span>
                <span class="arena-meta-chip">Mood: ${(q.moods || ["Light"]).join(", ")}</span>
              </div>
            </div>
            <h4 class="question-row-title">${q.question}</h4>
            <div class="question-row-choices">
              <div class="question-row-choice choice-a" onclick="playQuestionDirectly('${q.id}')">
                <span class="option-tag-a">A</span>
                <span>${q.optionA}</span>
              </div>
              <div class="question-row-choice choice-b" onclick="playQuestionDirectly('${q.id}')">
                <span class="option-tag-b">B</span>
                <span>${q.optionB}</span>
              </div>
            </div>
          </div>
        `,
        )
        .join("");
    }
  };

  // 点击题目直接进入对决
  window.playQuestionDirectly = function (qid) {
    const idx = data.questions.findIndex((q) => q.id === qid);
    if (idx !== -1) {
      state.currentQuestionIndex = idx;
    }
    state.hasVoted = false;
    state.userPick = null;
    renderCurrentQuestion();
    switchView("view-play");
  };

  // 12. 通用模板 2: Account Subpage Template 动态渲染与切换
  window.switchAccountSubTab = function (tabKey) {
    state.currentAccountTab = tabKey;
    const tabButtons = document.querySelectorAll("#accountSubNav .account-tab-btn");
    const subtabs = ["overview", "credits", "billing", "security"];

    subtabs.forEach((key, i) => {
      const el = document.getElementById(`accTab-${key}`);
      if (el) el.style.display = key === tabKey ? "block" : "none";
      if (tabButtons[i]) {
        if (key === tabKey) tabButtons[i].classList.add("active");
        else tabButtons[i].classList.remove("active");
      }
    });
  };

  function renderAccountData() {
    const acc = data.accountData;
    if (!acc) return;

    // Credits 流水表格渲染
    const creditsBody = document.getElementById("creditsLedgerBody");
    if (creditsBody && acc.credits && acc.credits.ledger) {
      creditsBody.innerHTML = acc.credits.ledger
        .map(
          (entry) => `
          <tr>
            <td style="font-family: monospace; font-size: 0.75rem">${entry.id}</td>
            <td><span class="badge-official">${entry.type}</span></td>
            <td><strong>${entry.action}</strong></td>
            <td style="color: ${entry.amount > 0 ? "var(--accent-emerald)" : "var(--color-a)"}; font-weight: 700">
              ${entry.amount > 0 ? "+" + entry.amount : entry.amount}
            </td>
            <td style="color: var(--text-muted); font-size: 0.75rem">${entry.createdAt}</td>
          </tr>
        `,
        )
        .join("");
    }

    // Billing 订单历史表格渲染
    const billingBody = document.getElementById("billingOrdersBody");
    if (billingBody && acc.billing && acc.billing.orders) {
      billingBody.innerHTML = acc.billing.orders
        .map(
          (order) => `
          <tr>
            <td style="font-family: monospace; font-size: 0.75rem">${order.id}</td>
            <td>${order.item}</td>
            <td style="font-weight: 700">${order.amount}</td>
            <td><span class="badge-official" style="background: rgba(16, 185, 129, 0.15); color: var(--accent-emerald)">${order.status}</span></td>
            <td style="color: var(--text-muted); font-size: 0.75rem">${order.date}</td>
          </tr>
        `,
        )
        .join("");
    }

    // Security 会话列表渲染
    const sessionsList = document.getElementById("securitySessionsList");
    if (sessionsList && acc.security && acc.security.activeSessions) {
      sessionsList.innerHTML = acc.security.activeSessions
        .map(
          (s) => `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: var(--bg-surface-elevated); border-radius: var(--radius-md); border: 1px solid var(--border-subtle); margin-bottom: 8px;">
            <div>
              <div style="font-weight: 700; color: var(--text-primary); font-size: 0.88rem">
                ${s.device} ${s.current ? '<span class="badge-official" style="margin-left: 6px;">Current Device</span>' : ""}
              </div>
              <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 2px">
                IP: ${s.ip} · Location: ${s.location} · Last Active: ${s.lastActive}
              </div>
            </div>
            ${
              !s.current
                ? `<button class="btn-secondary-action" style="padding: 4px 10px; font-size: 0.75rem" onclick="alert('Session revoked')">Revoke</button>`
                : '<span style="font-size: 0.75rem; color: var(--accent-emerald); font-weight: 600">● Active</span>'
            }
          </div>
        `,
        )
        .join("");
    }
  }

  // 13. 通用模板 3: Legal / Utility Template 动态加载器
  window.loadLegalDocument = function (docId) {
    state.currentLegalDoc = docId;
    const doc =
      data.legalDocsMap?.[docId] ||
      (Array.isArray(data.legal) ? data.legal.find((d) => d.id === docId) : data.legal?.[docId]);
    if (!doc) return;

    const breadcrumb = document.getElementById("legalDocBreadcrumb");
    const titleEl = document.getElementById("legalDocTitle");
    const metaEl = document.getElementById("legalDocMeta");
    const sectionsEl = document.getElementById("legalDocSections");

    if (breadcrumb) breadcrumb.textContent = doc.title;
    if (titleEl) titleEl.textContent = doc.title;
    if (metaEl)
      metaEl.textContent = `Version ${doc.version} · Effective ${doc.effectiveDate} · Source: Official wyrplay Compliance Policy`;

    if (sectionsEl && doc.sections) {
      sectionsEl.innerHTML = doc.sections
        .map(
          (sec) => `
          <section class="legal-section">
            <h2 class="legal-heading">${sec.heading}</h2>
            <div class="legal-body">${sec.content || sec.body}</div>
          </section>
        `,
        )
        .join("");
    }
  };

  // 14. 键盘快捷键监听
  function setupKeyboardListeners() {
    window.addEventListener("keydown", (e) => {
      // 忽略输入框
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target.isContentEditable
      ) {
        return;
      }

      if (e.metaKey || e.ctrlKey || e.altKey) return;

      // Presenter 模式处理
      if (state.isPresenterOpen) {
        if (e.key === "Escape") {
          closePresenter();
          return;
        }
        if (e.key === "a" || e.key === "A") {
          handlePresenterVote("A");
          return;
        }
        if (e.key === "b" || e.key === "B") {
          handlePresenterVote("B");
          return;
        }
        if (e.key === " " || e.key === "ArrowRight") {
          nextQuestion();
          return;
        }
        if (e.key === "ArrowLeft") {
          // 上一题
          state.currentQuestionIndex =
            (state.currentQuestionIndex - 1 + data.questions.length) % data.questions.length;
          renderCurrentQuestion();
          return;
        }
      }

      // 普通模式快捷键
      if (e.key === "a" || e.key === "A" || e.key === "ArrowLeft") {
        handleVote("A", state.currentView);
      } else if (e.key === "b" || e.key === "B" || e.key === "ArrowRight") {
        handleVote("B", state.currentView);
      } else if (e.key === "n" || e.key === "N") {
        nextQuestion();
      } else if (e.key === "p" || e.key === "P") {
        // [Optional UX improvement] 快捷打开 Presenter Mode
        openPresenter();
      }
    });
  }

  // 启动初始化
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
