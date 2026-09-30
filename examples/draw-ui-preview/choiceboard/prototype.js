(() => {
  "use strict";

  const source = window.WYR_PREVIEW_DATA;
  if (!source?.questions?.length) {
    throw new Error("The local wyrplay question snapshot did not load.");
  }

  const collectionKeys = Object.keys(source.featuredCollections);
  const questions = source.questions.map((question) => ({
    id: question.id,
    text: question.question,
    a: question.optionA,
    b: question.optionB,
    ageGroups: question.ageGroups,
    relationships: question.relationships,
    occasions: question.occasions,
    scenarios: question.scenarios ?? [],
    tones: question.tones,
    difficulty: question.difficulty,
    topics: question.topics,
    suitability: question.suitability,
    reviewStatus: question.reviewStatus,
    primaryCollection: question.primaryCollection,
    collections: collectionKeys.filter((key) => isInCollection(question, key)),
  }));

  const canonicalAges = ["4-6", "7-9", "10-12", "13-17", "18+"];
  const relationships = ["friends", "family", "couples", "coworkers"];
  const canonicalOccasions = ["classroom", "party", "road-trip", "dinner", "date-night"];
  const tones = ["funny", "weird", "deep"];
  const difficulties = ["easy", "hard"];
  const occasionRoutes = {
    classroom: "classroom",
    party: "party",
    "road-trip": "road-trip",
    dinner: "dinner",
    "date-night": "date-night",
    icebreakers: "icebreakers",
    "birthday-party": "birthday-party",
    sleepover: "sleepover",
  };
  const byId = (id) => document.getElementById(id);
  const root = document.documentElement;
  let activeCategoryKey = "kids";
  let activeQuestionPool = questions;
  let activeQuestionIndex = 0;

  function isInCollection(question, key) {
    switch (key) {
      case "kids":
        return (
          question.suitability.kids === "suitable" &&
          question.ageGroups.some((age) => ["4-6", "7-9", "10-12"].includes(age))
        );
      case "funny":
        return question.tones.includes("funny");
      case "hard":
        return question.difficulty === "hard";
      case "friends":
        return question.relationships.includes("friends");
      case "couples":
        return question.relationships.includes("couples");
      default:
        return false;
    }
  }

  function titleCase(value) {
    return value.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  function categoryConfig(key) {
    const featured = source.featuredCollections[key];
    if (featured) {
      return {
        key,
        title: featured.h1,
        eyebrow: `Featured SEO collection · ${featured.route}`,
        intro: featured.subtitle,
        kind: "collection",
        value: key,
      };
    }

    const ageAliases = { teens: "13-17", adults: "18+" };
    const ageKey = key.startsWith("age-") ? key.slice(4) : (ageAliases[key] ?? key);
    if (canonicalAges.includes(ageKey)) {
      const audienceName =
        ageKey === "13-17" ? "Teens" : ageKey === "18+" ? "Adults" : `Ages ${ageKey}`;
      return {
        key,
        title: `Would You Rather Questions for ${audienceName}`,
        eyebrow: "Age group · approved source questions",
        intro: `Browse approved questions tagged for ages ${ageKey}. The examples and counts come from this checkout's question source.`,
        kind: "age",
        value: ageKey,
      };
    }

    if (relationships.includes(key)) {
      const audience = source.audiences.find((item) => item.id === key);
      return {
        key,
        title: `Would You Rather Questions for ${titleCase(key)}`,
        eyebrow: "Relationship group · question collection",
        intro: audience?.description ?? `Questions tagged for ${titleCase(key)}.`,
        kind: "relationship",
        value: key,
      };
    }

    const occasionId = key === "icebreakers" ? "icebreaker" : key;
    const occasion = source.occasions.find((item) => item.id === occasionId);
    const scenario = occasionRoutes[key];
    if (occasion && scenario) {
      return {
        key,
        title: `Would You Rather Questions for ${occasion.name}`,
        eyebrow: "Occasion · question collection",
        intro: occasion.description,
        kind: "scenario",
        value: scenario,
      };
    }

    const style = source.styles.find((item) => item.id === key);
    if (style) {
      return {
        key,
        title: `${style.name} Would You Rather Questions`,
        eyebrow: "Style · question collection",
        intro: style.description,
        kind: "style",
        value: key,
      };
    }

    return {
      key,
      title: "Question collection",
      eyebrow: "Browse questions",
      intro: "Choose a question collection.",
      kind: "unknown",
      value: key,
    };
  }

  function isKnownCategory(key) {
    const occasionKeys = Object.keys(occasionRoutes);
    const ageKeys = canonicalAges.map((age) => `age-${age}`);
    return Boolean(
      source.featuredCollections[key] ||
      ageKeys.includes(key) ||
      ["teens", "adults", "family", "coworkers"].includes(key) ||
      occasionKeys.includes(key) ||
      source.styles.some((style) => style.id === key),
    );
  }

  function matchesCategory(question, category) {
    switch (category.kind) {
      case "collection":
        return question.collections.includes(category.value);
      case "age":
        return question.ageGroups.includes(category.value);
      case "relationship":
        return question.relationships.includes(category.value);
      case "scenario":
        return question.scenarios.includes(category.value);
      case "style":
        if (category.value === "hard" || category.value === "easy") {
          return question.difficulty === category.value;
        }
        if (category.value === "clean") {
          return question.suitability.classroom === "suitable";
        }
        return question.tones.includes(category.value);
      default:
        return false;
    }
  }

  function categoryQuestions(key) {
    const category = categoryConfig(key);
    return questions.filter(
      (question) => question.reviewStatus === "approved" && matchesCategory(question, category),
    );
  }

  function readRoute() {
    const raw = window.location.hash.slice(1) || "/home";
    const anchorIndex = raw.indexOf("#");
    const withoutAnchor = anchorIndex >= 0 ? raw.slice(0, anchorIndex) : raw;
    const anchor = anchorIndex >= 0 ? raw.slice(anchorIndex + 1) : "";
    const queryIndex = withoutAnchor.indexOf("?");
    const path = queryIndex >= 0 ? withoutAnchor.slice(0, queryIndex) : withoutAnchor;
    const query = queryIndex >= 0 ? withoutAnchor.slice(queryIndex + 1) : "";
    const parts = path.split("/").filter(Boolean);
    const params = new URLSearchParams(query);
    return {
      page: parts[0] || "home",
      key: parts[1] || params.get("group") || "",
      question: params.get("question") || "",
      group: params.get("group") || "",
      anchor,
    };
  }

  function updatePageTitle(page, key) {
    const category = categoryConfig(key);
    if (page === "category") {
      document.title = category.title + " — wyrplay Preview";
      return;
    }
    const titles = {
      home: "wyrplay — Choiceboard UI Preview",
      play: "Play a Question — wyrplay Preview",
      result: "Vote Result — wyrplay Preview",
      "sign-in": "Sign in — wyrplay Preview",
      account: "Account — wyrplay Preview",
      "design-system": "Design System — wyrplay Preview",
    };
    document.title = titles[page] || titles.home;
  }

  function make(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function questionTags(question) {
    const labels = [
      ...question.ageGroups.map((age) => `Ages ${age}`),
      ...question.relationships.map(titleCase),
      ...question.occasions.map(titleCase),
      ...question.tones.map(titleCase),
      question.difficulty ? titleCase(question.difficulty) : "",
    ];
    return [...new Set(labels.filter(Boolean))].slice(0, 5).join(" · ") || "Approved question";
  }

  function playLink(question, group) {
    const query = new URLSearchParams({ question: question.id });
    if (group) query.set("group", group);
    return "#/play?" + query.toString();
  }

  function renderQuestionRow(question, index) {
    const article = make("article", "draft-question");
    const top = make("div", "draft-question__top");
    top.append(
      make("span", "draft-question__id", question.id),
      make("span", "review-label", "Approved source row"),
    );
    const heading = make("h3", "draft-question__text", question.text);
    const options = make("div", "draft-question__options");
    const optionA = make("p", "draft-option draft-option--a");
    optionA.append(make("b", "", "A"), make("span", "", question.a));
    const optionB = make("p", "draft-option draft-option--b");
    optionB.append(make("b", "", "B"), make("span", "", question.b));
    options.append(optionA, optionB);
    const tags = make("p", "draft-question__tags", questionTags(question));
    const action = make("a", "text-link draft-question__action", "Play this question →");
    action.href = playLink(question, activeCategoryKey);
    action.setAttribute("aria-label", `Play approved question ${question.id} in the local preview`);
    article.dataset.search = (
      question.text +
      " " +
      question.a +
      " " +
      question.b +
      " " +
      question.topics.join(" ")
    ).toLowerCase();
    article.dataset.order = String(index + 1);
    article.append(top, heading, options, tags, action);
    return article;
  }

  function renderCategory(key) {
    if (!isKnownCategory(key)) key = "kids";
    activeCategoryKey = key;
    const category = categoryConfig(key);
    const matches = categoryQuestions(key);
    const name = key.startsWith("age-") ? key.slice(4) : key;

    byId("category-title").textContent = category.title;
    byId("category-eyebrow").textContent = category.eyebrow;
    byId("category-intro").textContent = category.intro;
    byId("category-breadcrumb").textContent = titleCase(name);
    byId("category-draft-count").textContent = `${matches.length} approved questions`;
    byId("category-result-count").textContent = `${matches.length} questions`;
    byId("category-list-title").textContent = matches.length
      ? `Approved questions for ${titleCase(name)}`
      : "No approved questions in this category";
    byId("category-review-note").textContent =
      "Every row below comes from the checked-out question source and is marked approved. Category labels and filters use the source metadata; votes in this prototype stay local.";
    byId("category-primary-play").href = matches.length ? playLink(matches[0], key) : "#/play";
    byId("category-empty").hidden = matches.length > 0;
    byId("question-search").value = "";

    const list = byId("draft-question-list");
    list.replaceChildren(...matches.map(renderQuestionRow));
    resetCategoryFilters();
    filterDraftRows();
  }

  function resetCategoryFilters() {
    byId("question-search").value = "";
    document.querySelectorAll("[data-category-filter]").forEach((select) => {
      select.value = "";
    });
  }

  function filterDraftRows() {
    const query = byId("question-search").value.trim().toLowerCase();
    const selected = Object.fromEntries(
      Array.from(document.querySelectorAll("[data-category-filter]")).map((select) => [
        select.dataset.categoryFilter,
        select.value,
      ]),
    );
    const rows = Array.from(document.querySelectorAll(".draft-question"));
    let visible = 0;
    for (const row of rows) {
      const question = questions.find(
        (item) => item.id === row.querySelector(".draft-question__id").textContent,
      );
      const matchesSearch = row.dataset.search.includes(query);
      const matchesAge = !selected.age || question.ageGroups.includes(selected.age);
      const matchesRelationship =
        !selected.relationship || question.relationships.includes(selected.relationship);
      const matchesOccasion = !selected.occasion || question.occasions.includes(selected.occasion);
      const matchesTone = !selected.tone || question.tones.includes(selected.tone);
      const matchesDifficulty = !selected.difficulty || question.difficulty === selected.difficulty;
      const matches =
        matchesSearch &&
        matchesAge &&
        matchesRelationship &&
        matchesOccasion &&
        matchesTone &&
        matchesDifficulty;
      row.hidden = !matches;
      if (matches) visible += 1;
    }
    byId("category-empty").hidden = visible > 0;
    byId("category-result-count").textContent = `${visible} of ${rows.length} questions`;
    byId("filter-status").textContent =
      `${visible} approved source questions match these filters. Occasion filters use the five canonical values in the current question contract.`;
  }

  function renderHomeQuestion() {
    const question = questions[0];
    byId("home-source-id").textContent = question.id;
    byId("home-arena-title").textContent = question.text;
    byId("home-option-a").textContent = question.a;
    byId("home-option-b").textContent = question.b;
    byId("home-question-link").href = playLink(question);
    byId("home-choice-a").setAttribute("aria-pressed", "false");
    byId("home-choice-b").setAttribute("aria-pressed", "false");
    byId("home-choice-a").classList.remove("is-selected");
    byId("home-choice-b").classList.remove("is-selected");
    byId("home-result").hidden = true;
    byId("home-arena-message").textContent = "Local preview · your click stays in this browser.";
  }

  function renderHomeContent() {
    const approvedCount = questions.filter(
      (question) => question.reviewStatus === "approved",
    ).length;
    byId("source-summary").textContent =
      `Source snapshot: ${approvedCount} approved questions · local interactions only`;
    byId("source-note-copy").textContent =
      `The question examples come from this checkout. ${approvedCount} rows are marked approved; this preview never submits a vote.`;
    byId("editorial-filter-note").textContent =
      `This checkout contains ${approvedCount} approved question rows. Age, relationship, occasion, tone, and difficulty filters use the current question metadata.`;
    byId("design-source-count").textContent =
      `${approvedCount} approved source rows are available to the live question flow. The empty state below represents a filter with no matches.`;
    const systemQuestion = questions[0];
    byId("system-source-label").textContent = `${systemQuestion.id.toUpperCase()} · APPROVED`;
    byId("system-question-title").textContent = systemQuestion.text;
    byId("system-option-a").textContent = systemQuestion.a;
    byId("system-option-b").textContent = systemQuestion.b;

    document.querySelectorAll(".featured-card").forEach((card) => {
      const key = card.dataset.collection;
      const meta = source.featuredCollections[key];
      if (!meta) return;
      const count = questions.filter((question) => question.collections.includes(key)).length;
      const subtitle = card.querySelector("p");
      if (subtitle) subtitle.textContent = meta.subtitle;
      const index = card.querySelector(".featured-card__index");
      if (index) index.textContent = `${titleCase(key)} · ${count} questions`;
      const title = card.querySelector("h3");
      if (title) title.textContent = titleCase(key);
      const link = card.querySelector(".featured-card__link");
      if (link) link.childNodes[0].textContent = meta.h1 + " ";
      card.href = `#/category/${key}`;
    });

    const picks = [
      questions.find((question) => question.collections.includes("funny")),
      questions.find((question) => question.collections.includes("friends")),
      questions.find((question) => question.collections.includes("couples")),
    ].filter(
      (question, index, all) =>
        question && all.findIndex((item) => item.id === question.id) === index,
    );
    const list = byId("home-question-list");
    list.replaceChildren(
      ...picks.map((question) => {
        const row = make("article", "question-pick");
        row.append(make("span", "question-pick__id", question.id));
        const content = make("div");
        content.append(
          make("p", "question-pick__text", question.text),
          make("p", "question-pick__meta", questionTags(question)),
        );
        const status = make("span", "review-label", "Approved");
        const link = make("a", "", "↗");
        link.href = playLink(question);
        link.setAttribute("aria-label", `Play question ${question.id}`);
        row.append(content, status, link);
        return row;
      }),
    );
    renderHomeQuestion();
  }

  function renderPlayQuestion() {
    const question = activeQuestionPool[activeQuestionIndex];
    if (!question) return;
    byId("play-progress").textContent =
      `Question ${String(activeQuestionIndex + 1).padStart(2, "0")} / ${activeQuestionPool.length}`;
    byId("play-source-id").textContent = question.id;
    byId("play-question-title").textContent = question.text;
    byId("play-option-a").textContent = question.a;
    byId("play-option-b").textContent = question.b;
    byId("play-category").textContent = questionTags(question);
    byId("play-review-label").textContent = "Approved source row";
    byId("presenter-title").textContent = question.text;
    byId("presenter-option-a").textContent = question.a;
    byId("presenter-option-b").textContent = question.b;
    byId("presenter-status").textContent =
      `${question.id} · Question ${activeQuestionIndex + 1} of ${activeQuestionPool.length}`;
    byId("play-view").dataset.questionId = question.id;
    byId("pre-vote-prompt").hidden = false;
    byId("play-results").hidden = true;
    byId("play-status").textContent =
      "Choose A or B. This local preview does not call the voting API.";
    setChoiceState(byId("play-view"), null);
  }

  function setChoiceState(scope, option) {
    if (!scope) return;
    scope.querySelectorAll("[data-option]").forEach((button) => {
      const selected = button.dataset.option === option;
      button.setAttribute("aria-pressed", selected ? "true" : "false");
      button.classList.toggle("is-selected", selected);
    });
  }

  function chooseOption(scope, option) {
    setChoiceState(scope, option);
    if (scope.dataset.arena === "home") {
      const result = byId("home-result");
      result.hidden = false;
      result.querySelector("[data-your-choice]").textContent = `You chose Option ${option}`;
      byId("home-arena-message").textContent = "Local preview · no vote was sent or stored.";
      return;
    }
    byId("pre-vote-prompt").hidden = true;
    byId("play-results").hidden = false;
    byId("play-your-choice").textContent = `Your choice: Option ${option}`;
    byId("play-status").textContent =
      `You picked Option ${option}. The displayed percentages and total are illustrative, not live votes.`;
  }

  function moveQuestion(step) {
    activeQuestionIndex =
      (activeQuestionIndex + step + activeQuestionPool.length) % activeQuestionPool.length;
    renderPlayQuestion();
  }

  function chooseRandomQuestion() {
    if (activeQuestionPool.length < 2) return;
    const current = activeQuestionIndex;
    while (activeQuestionIndex === current) {
      activeQuestionIndex = Math.floor(Math.random() * activeQuestionPool.length);
    }
    renderPlayQuestion();
  }

  function showPlayResult(option) {
    chooseOption(byId("play-view"), option);
    byId("play-status").textContent = "Illustrative result state · no vote was sent or stored.";
  }

  function openPresenter() {
    const dialog = byId("presenter-dialog");
    if (!dialog.open) dialog.showModal();
  }

  function sharePreview(button) {
    const arena = button.closest("[data-arena]");
    const status = arena?.querySelector("[data-arena-message]") ?? byId("play-status");
    if (!navigator.clipboard || !window.isSecureContext) {
      if (status)
        status.textContent =
          "Copy the local preview URL from the address bar to share this screen.";
      return;
    }
    navigator.clipboard.writeText(window.location.href).then(
      () => {
        if (status)
          status.textContent = "Preview link copied. This link opens the local preview only.";
      },
      () => {
        if (status)
          status.textContent =
            "Clipboard access was unavailable. Copy the local URL from the address bar.";
      },
    );
  }

  function closeMobileMenu() {
    const menu = byId("mobile-menu");
    const toggle = byId("menu-toggle");
    menu.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open navigation");
  }

  function route() {
    const state = readRoute();
    const visiblePage = [
      "home",
      "category",
      "play",
      "result",
      "sign-in",
      "account",
      "design-system",
    ].includes(state.page)
      ? state.page === "result"
        ? "play"
        : state.page
      : "home";
    document.querySelectorAll("[data-page]").forEach((section) => {
      section.hidden = section.dataset.page !== visiblePage;
    });
    updatePageTitle(state.page, state.key);
    closeMobileMenu();

    if (visiblePage === "home") renderHomeQuestion();
    if (visiblePage === "category") renderCategory(state.key || "kids");
    if (visiblePage === "play") {
      const group = state.group && isKnownCategory(state.group) ? state.group : "";
      activeQuestionPool = group
        ? categoryQuestions(group)
        : questions.filter((question) => question.reviewStatus === "approved");
      const requestedIndex = state.question
        ? activeQuestionPool.findIndex((question) => question.id === state.question)
        : -1;
      if (requestedIndex >= 0) activeQuestionIndex = requestedIndex;
      else if (activeQuestionIndex >= activeQuestionPool.length) activeQuestionIndex = 0;
      renderPlayQuestion();
      if (state.page === "result") showPlayResult("A");
    }

    window.requestAnimationFrame(() => {
      if (state.anchor) {
        const target = document.getElementById(state.anchor);
        if (target) {
          target.scrollIntoView({ block: "start" });
          return;
        }
      }
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      byId("main-content").focus({ preventScroll: true });
    });
  }

  function handleCategoryFilterChange() {
    filterDraftRows();
  }

  renderHomeContent();
  byId("menu-toggle").addEventListener("click", () => {
    const menu = byId("mobile-menu");
    const toggle = byId("menu-toggle");
    const open = menu.hidden;
    menu.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  });
  document
    .querySelectorAll("#mobile-menu a")
    .forEach((link) => link.addEventListener("click", closeMobileMenu));
  byId("theme-toggle").addEventListener("click", (event) => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    event.currentTarget.setAttribute(
      "aria-label",
      next === "dark" ? "Switch to light theme" : "Switch to dark theme",
    );
  });
  document.addEventListener("click", (event) => {
    const option = event.target.closest("[data-option]");
    if (option) {
      const arena = option.closest("[data-arena]");
      if (arena) chooseOption(arena, option.dataset.option);
    }
    const shareButton = event.target.closest("[data-share]");
    if (shareButton) sharePreview(shareButton);
  });
  byId("question-search").addEventListener("input", filterDraftRows);
  document.querySelectorAll("[data-category-filter]").forEach((select) => {
    select.addEventListener("change", handleCategoryFilterChange);
  });
  byId("clear-search").addEventListener("click", () => {
    resetCategoryFilters();
    filterDraftRows();
    byId("question-search").focus();
  });
  byId("next-question").addEventListener("click", () => moveQuestion(1));
  byId("random-question").addEventListener("click", chooseRandomQuestion);
  byId("presenter-open").addEventListener("click", openPresenter);
  byId("presenter-open-sample").addEventListener("click", openPresenter);
  byId("presenter-close").addEventListener("click", () => byId("presenter-dialog").close());
  byId("presenter-next").addEventListener("click", () => moveQuestion(1));
  byId("presenter-prev").addEventListener("click", () => moveQuestion(-1));
  byId("presenter-dialog").addEventListener("click", (event) => {
    if (event.target === byId("presenter-dialog")) byId("presenter-dialog").close();
  });
  byId("presenter-dialog").addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      moveQuestion(1);
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      moveQuestion(-1);
    }
  });
  byId("signin-form").addEventListener("submit", (event) => {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) return;
    byId("signin-feedback").textContent =
      "Preview only: no email was sent and no account session was created. The live flow uses a single-use email link.";
  });
  window.addEventListener("keydown", (event) => {
    if (byId("presenter-dialog").open || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.target.matches("input, textarea, select, button, a")) return;
    if (document.querySelector('[data-page="play"]:not([hidden])')) {
      if (event.key.toLowerCase() === "a") chooseOption(byId("play-view"), "A");
      if (event.key.toLowerCase() === "b") chooseOption(byId("play-view"), "B");
      if (event.key === "ArrowRight") moveQuestion(1);
      if (event.key === "ArrowLeft") moveQuestion(-1);
    }
  });
  window.addEventListener("hashchange", route);
  route();
})();
