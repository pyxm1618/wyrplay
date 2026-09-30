/**
 * wyrplay Dual Polarity Tension System - Prototype Controller
 * 纯原生交互引擎，驱动 7 大页面切换、投票动效、键盘事件与主题切换
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
  };

  const data = window.WYR_DATA;

  // 1. 初始化入口
  function init() {
    // 检查并恢复 URL hash
    const hash = window.location.hash.replace("#", "");
    const hashMap = {
      home: "view-home",
      category: "view-category",
      play: "view-play",
      results: "view-results",
      auth: "view-auth",
      account: "view-account",
      "design-system": "view-design-system",
    };

    if (hash && hashMap[hash]) {
      switchView(hashMap[hash], false);
    } else {
      switchView("view-home", false);
    }

    renderTaxonomy("occasions");
    renderCollections();
    renderCurrentQuestion();
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
        if (pill) pill.textContent = tab.querySelector("span:last-child").textContent;
      } else {
        tab.classList.remove("active");
      }
    });

    // 同步浏览器 Hash
    if (updateHash) {
      const viewToHash = {
        "view-home": "home",
        "view-category": "category",
        "view-play": "play",
        "view-results": "results",
        "view-auth": "auth",
        "view-account": "account",
        "view-design-system": "design-system",
      };
      if (viewToHash[viewId]) {
        window.location.hash = viewToHash[viewId];
      }
    }

    // 平滑滚回顶端
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 3. 题目与对决渲染
  function renderCurrentQuestion() {
    const q = data.questions[state.currentQuestionIndex];
    if (!q) return;

    // 计算百分比
    const pctA = Math.round((q.votesA / q.totalVotes) * 100);
    const pctB = 100 - pctA;

    // --- Home Arena 元素渲染 ---
    const homeQ = document.getElementById("homeQuestionText");
    const homeOptA = document.getElementById("homeOptionAText");
    const homeOptB = document.getElementById("homeOptionBText");
    const homeBadge = document.getElementById("homeDeckBadge");
    const homeProgress = document.getElementById("homeProgressIndicator");

    if (homeQ) homeQ.textContent = q.question;
    if (homeOptA) homeOptA.textContent = q.optionA;
    if (homeOptB) homeOptB.textContent = q.optionB;
    if (homeBadge) homeBadge.textContent = q.categoryBadge;
    if (homeProgress)
      homeProgress.textContent = `#${state.currentQuestionIndex + 1} of ${data.questions.length}`;

    const homePctAEl = document.getElementById("homePctA");
    const homePctBEl = document.getElementById("homePctB");
    const homeVotesAEl = document.getElementById("homeVotesA");
    const homeVotesBEl = document.getElementById("homeVotesB");
    const homeFillAEl = document.getElementById("homeFillA");
    const homeFillBEl = document.getElementById("homeFillB");

    if (homePctAEl) homePctAEl.textContent = `${pctA}%`;
    if (homePctBEl) homePctBEl.textContent = `${pctB}%`;
    if (homeVotesAEl) homeVotesAEl.textContent = `${q.votesA.toLocaleString()} votes`;
    if (homeVotesBEl) homeVotesBEl.textContent = `${q.votesB.toLocaleString()} votes`;
    if (homeFillAEl) homeFillAEl.style.width = `${pctA}%`;
    if (homeFillBEl) homeFillBEl.style.width = `${pctB}%`;

    // --- Play Arena 元素渲染 ---
    const playQ = document.getElementById("playQuestionText");
    const playOptA = document.getElementById("playOptionAText");
    const playOptB = document.getElementById("playOptionBText");
    const playBadge = document.getElementById("playDeckBadge");
    const playCounter = document.getElementById("playCounter");
    const playProgressBar = document.getElementById("playProgressBar");

    if (playQ) playQ.textContent = q.question;
    if (playOptA) playOptA.textContent = q.optionA;
    if (playOptB) playOptB.textContent = q.optionB;
    if (playBadge) playBadge.textContent = `${q.collection.toUpperCase()} · ${q.tone}`;
    if (playCounter)
      playCounter.textContent = `Question #${state.currentQuestionIndex + 1} of ${data.questions.length}`;
    if (playProgressBar) {
      const progressPct = ((state.currentQuestionIndex + 1) / data.questions.length) * 100;
      playProgressBar.style.width = `${progressPct}%`;
    }

    const playPctAEl = document.getElementById("playPctA");
    const playPctBEl = document.getElementById("playPctB");
    const playVotesAEl = document.getElementById("playVotesA");
    const playVotesBEl = document.getElementById("playVotesB");
    const playFillAEl = document.getElementById("playFillA");
    const playFillBEl = document.getElementById("playFillB");

    if (playPctAEl) playPctAEl.textContent = `${pctA}%`;
    if (playPctBEl) playPctBEl.textContent = `${pctB}%`;
    if (playVotesAEl) playVotesAEl.textContent = `${q.votesA.toLocaleString()} votes`;
    if (playVotesBEl) playVotesBEl.textContent = `${q.votesB.toLocaleString()} votes`;
    if (playFillAEl) playFillAEl.style.width = `${pctA}%`;
    if (playFillBEl) playFillBEl.style.width = `${pctB}%`;

    // Presenter 元素同步
    const presQ = document.getElementById("presenterQuestion");
    const presA = document.getElementById("presenterOptionA");
    const presB = document.getElementById("presenterOptionB");
    const presDeck = document.getElementById("presenterDeckInfo");

    if (presQ) presQ.textContent = q.question;
    if (presA) presA.textContent = q.optionA;
    if (presB) presB.textContent = q.optionB;
    if (presDeck)
      presDeck.textContent = `wyrplay · ${q.categoryBadge} #${state.currentQuestionIndex + 1}`;

    // 同步或重置已选状态
    updateVoteUI();
  }

  // 4. 投票处理 (A / B)
  window.handleVote = function (option, context = "home") {
    state.hasVoted = true;
    state.userPick = option;

    const q = data.questions[state.currentQuestionIndex];
    if (option === "A") {
      q.votesA += 1;
    } else {
      q.votesB += 1;
    }
    q.totalVotes += 1;

    updateVoteUI();
  };

  function updateVoteUI() {
    const isVoted = state.hasVoted;
    const pick = state.userPick;
    const q = data.questions[state.currentQuestionIndex];

    const cardsA = [document.getElementById("homeCardA"), document.getElementById("playCardA")];
    const cardsB = [document.getElementById("homeCardB"), document.getElementById("playCardB")];
    const resultsA = [
      document.getElementById("homeResultA"),
      document.getElementById("playResultA"),
    ];
    const resultsB = [
      document.getElementById("homeResultB"),
      document.getElementById("playResultB"),
    ];
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

    // 统计显示
    [...resultsA, ...resultsB].forEach((r) => {
      if (!r) return;
      if (isVoted) {
        r.classList.add("show");
      } else {
        r.classList.remove("show");
      }
    });

    // 底部文字提示
    statusA.forEach((s) => {
      if (!s) return;
      if (pick === "A") s.innerHTML = "<b>✓ Your Choice</b>";
      else if (isVoted) s.textContent = "Click to switch to A";
      else s.textContent = "Click to choose A";
    });

    statusB.forEach((s) => {
      if (!s) return;
      if (pick === "B") s.innerHTML = "<b>✓ Your Choice</b>";
      else if (isVoted) s.textContent = "Click to switch to B";
      else s.textContent = "Click to choose B";
    });

    // 反馈横幅提示
    const feedbackEls = [
      document.getElementById("homeFeedbackNotice"),
      document.getElementById("playFeedbackNotice"),
    ];

    feedbackEls.forEach((el) => {
      if (!el) return;
      if (isVoted) {
        const chosenText = pick === "A" ? q.optionA : q.optionB;
        el.innerHTML = `You chose <b>"${chosenText}"</b>. Total <b>${q.totalVotes.toLocaleString()}</b> community votes. Click the opposing card to switch anytime!`;
      } else {
        el.textContent =
          "Select Option A or B above to cast your vote and reveal the community stance.";
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
    alert("Vote state reset! You can now test the pre-vote state again.");
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
    const q = data.questions[state.currentQuestionIndex];
    const pctA = Math.round((q.votesA / q.totalVotes) * 100);
    const pctB = 100 - pctA;

    const elA = document.getElementById("presenterPctA");
    const elB = document.getElementById("presenterPctB");
    if (elA) {
      elA.style.display = "block";
      elA.textContent = `${pctA}%`;
    }
    if (elB) {
      elB.style.display = "block";
      elB.textContent = `${pctB}%`;
    }
  };

  // 7. 登录提交模拟
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

  // 9. 渲染 3D Taxonomy 矩阵
  window.filterTaxonomy = function (dimensionKey) {
    const tabs = document.querySelectorAll("#taxonomyTabs .tax-tab-btn");
    tabs.forEach((t) => t.classList.remove("active"));
    if (event && event.target) event.target.classList.add("active");
    renderTaxonomy(dimensionKey);
  };

  function renderTaxonomy(key) {
    const container = document.getElementById("taxonomyGrid");
    if (!container) return;

    const items = data.dimensions[key] || [];
    container.innerHTML = items
      .map(
        (it) => `
        <div class="tax-card" onclick="switchView('view-category')">
          <div class="tax-card-top">
            <span class="tax-card-title">${it.icon ? it.icon + " " : ""}${it.label}</span>
            <span class="tax-card-count">Explore →</span>
          </div>
          <p class="tax-card-desc">${it.desc || "Curated dilemma deck ready to play"}</p>
        </div>
      `,
      )
      .join("");
  }

  // 10. 渲染精选专题卡片集合
  function renderCollections() {
    const container = document.getElementById("collectionsGrid");
    if (!container) return;

    container.innerHTML = data.collections
      .map(
        (c) => `
        <div class="collection-card" onclick="switchView('view-category')">
          <div>
            <div class="collection-card-top">
              <span class="collection-icon">${c.icon}</span>
              <span class="collection-badge">${c.badge}</span>
            </div>
            <h3 class="collection-title">${c.name}</h3>
            <p class="collection-desc">${c.subtitle}</p>
          </div>
          <div class="collection-card-bottom">
            <span>${c.count} Handcrafted Dilemmas</span>
            <span>Play Deck →</span>
          </div>
        </div>
      `,
      )
      .join("");
  }

  // 11. 键盘快捷键监听
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
      }

      // 普通模式快捷键
      if (e.key === "a" || e.key === "A" || e.key === "ArrowLeft") {
        handleVote("A", state.currentView);
      } else if (e.key === "b" || e.key === "B" || e.key === "ArrowRight") {
        handleVote("B", state.currentView);
      } else if (e.key === "n" || e.key === "N") {
        nextQuestion();
      } else if (e.key === "p" || e.key === "P") {
        openPresenter();
      }
    });
  }

  // 启动
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
