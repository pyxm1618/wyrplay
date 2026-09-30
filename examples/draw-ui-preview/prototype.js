(() => {
  "use strict";

  const questions = [
    {
      id: "wyr-004",
      text: "Would you rather have a pet dragon the size of a cat or a pet dinosaur the size of a dog?",
      a: "A cat-sized pet dragon",
      b: "A dog-sized pet velociraptor",
      collections: ["kids", "funny"],
      audience: "kids",
      occasion: "classroom",
      style: "funny",
    },
    {
      id: "wyr-k01",
      text: "Would you rather have a personal slide from your bedroom to the kitchen or a trampoline floor in your room?",
      a: "A fast slide into the kitchen",
      b: "A bouncy trampoline floor",
      collections: ["kids"],
      audience: "kids",
      occasion: "classroom",
      style: "clean",
    },
    {
      id: "wyr-k02",
      text: "Would you rather attend school on a pirate ship or in a giant treehouse?",
      a: "A floating pirate ship school",
      b: "A magical high treehouse school",
      collections: ["kids"],
      audience: "kids",
      occasion: "classroom",
      style: "clean",
    },
    {
      id: "wyr-k03",
      text: "Would you rather have super speed like a cheetah or night vision like an owl?",
      a: "Run as fast as a cheetah",
      b: "See clearly in pitch darkness",
      collections: ["kids"],
      audience: "kids",
      occasion: "road-trip",
      style: "easy",
    },
    {
      id: "wyr-001",
      text: "Would you rather be able to pause time or rewind time?",
      a: "Pause time whenever you want",
      b: "Rewind time up to 10 minutes",
      collections: ["hard", "friends"],
      audience: "adults",
      occasion: "party",
      style: "deep",
    },
    {
      id: "wyr-002",
      text: "Would you rather explore the deepest ocean or visit outer space?",
      a: "Explore the uncharted ocean trench",
      b: "Journey to deep outer space",
      collections: ["hard", "kids"],
      audience: "teens",
      occasion: "road-trip",
      style: "deep",
    },
    {
      id: "wyr-003",
      text: "Would you rather always know when someone is lying or never be lied to again?",
      a: "Always detect any lie instantly",
      b: "Live in a world where everyone tells you the truth",
      collections: ["hard"],
      audience: "adults",
      occasion: "dinner",
      style: "hard",
    },
    {
      id: "wyr-005",
      text: "Would you rather only be able to speak in rhymes or shout everything you say?",
      a: "Speak strictly in rhymes",
      b: "Shout at top volume forever",
      collections: ["funny", "friends"],
      audience: "friends",
      occasion: "party",
      style: "funny",
    },
    {
      id: "wyr-006",
      text: "Would you rather always arrive 20 minutes early or 15 minutes late?",
      a: "Always arrive 20 minutes early",
      b: "Always arrive 15 minutes late",
      collections: ["friends"],
      audience: "coworkers",
      occasion: "icebreaker",
      style: "easy",
    },
    {
      id: "wyr-007",
      text: "Would you rather know the date of your death or know the cause of your death?",
      a: "Know the exact date",
      b: "Know the exact cause",
      collections: ["hard"],
      audience: "adults",
      occasion: "dinner",
      style: "hard",
    },
    {
      id: "wyr-008",
      text: "Would you rather be able to talk to all animals or speak every human language fluently?",
      a: "Talk to and understand all animals",
      b: "Speak every human language on Earth",
      collections: ["kids", "hard"],
      audience: "kids",
      occasion: "road-trip",
      style: "deep",
    },
    {
      id: "wyr-009",
      text: "Would you rather have unlimited free flights forever or unlimited free five-star dining forever?",
      a: "Unlimited free international flights",
      b: "Unlimited free gourmet meals anywhere",
      collections: ["couples", "friends"],
      audience: "couples",
      occasion: "date-night",
      style: "easy",
    },
    {
      id: "wyr-010",
      text: "Would you rather sweat maple syrup or cry carbonated soda?",
      a: "Sweat pure maple syrup",
      b: "Cry fizzy lemon soda",
      collections: ["funny"],
      audience: "friends",
      occasion: "sleepover",
      style: "weird",
    },
    {
      id: "wyr-k05",
      text: "Would you rather have hair that changes color with your mood or shoes that light up when you jump?",
      a: "Mood-changing hair",
      b: "Light-up shoes when you jump",
      collections: ["kids", "funny"],
      audience: "kids",
      occasion: "birthday-party",
      style: "clean",
    },
    {
      id: "wyr-h10",
      text: "Would you rather sacrifice your career to support your partner's dream or have them sacrifice theirs for yours?",
      a: "Step back and support their dream",
      b: "Ask them to step back for your ambition",
      collections: ["hard", "couples"],
      audience: "couples",
      occasion: "date-night",
      style: "hard",
    },
    {
      id: "wyr-cp01",
      text: "Would you rather have a lavish destination wedding with 10 people or a modest hometown wedding with 300 people?",
      a: "Intimate luxury tropical elopement",
      b: "A big hometown celebration with everyone",
      collections: ["couples"],
      audience: "couples",
      occasion: "date-night",
      style: "easy",
    },
    {
      id: "wyr-cp02",
      text: "Would you rather receive spontaneous romantic surprises every month or have one massive planned vacation each year?",
      a: "Monthly unexpected sweet surprises",
      b: "One unforgettable dream annual getaway",
      collections: ["couples"],
      audience: "couples",
      occasion: "date-night",
      style: "easy",
    },
  ];

  const categories = {
    kids: {
      title: "Would You Rather Questions for Kids",
      eyebrow: "Featured SEO collection · /would-you-rather-questions-for-kids",
      intro: "A wholesome, imaginative collection of Would You Rather questions designed specifically for children, elementary students, and family car trips.",
      count: "29 collection-tagged drafts",
      ids: ["wyr-004", "wyr-k01", "wyr-k02"],
    },
    funny: {
      title: "Funny Would You Rather Questions",
      eyebrow: "Featured SEO collection · /funny-would-you-rather-questions",
      intro: "A wildly hilarious collection of bizarre superpowers, embarrassing mishaps, and ridiculous trade-offs.",
      count: "30 collection-tagged drafts",
      ids: ["wyr-004", "wyr-005", "wyr-010"],
    },
    hard: {
      title: "Hard Would You Rather Questions",
      eyebrow: "Featured SEO collection · /hard-would-you-rather-questions",
      intro: "Tough moral crossroads and impossible trade-offs with no easy answers.",
      count: "28 collection-tagged drafts",
      ids: ["wyr-001", "wyr-002", "wyr-003"],
    },
    friends: {
      title: "Would You Rather Questions for Friends",
      eyebrow: "Featured SEO collection · /would-you-rather-questions-for-friends",
      intro: "Spicy banter, secrets, and friendly roasts for game nights and weekend hangouts.",
      count: "28 collection-tagged drafts",
      ids: ["wyr-001", "wyr-005", "wyr-006"],
    },
    couples: {
      title: "Would You Rather Questions for Couples",
      eyebrow: "Featured SEO collection · /would-you-rather-questions-for-couples",
      intro: "Sweet, insightful, and intriguing conversation starters for date night.",
      count: "26 collection-tagged drafts",
      ids: ["wyr-009", "wyr-cp01", "wyr-cp02"],
    },
    "age-4-6": {
      title: "Questions for ages 4–6",
      eyebrow: "Age-group browse · filter preview",
      intro: "Ages 4–6 is a value in the current question contract. No reviewed questions carry this age tag in the source snapshot.",
      count: "No reviewed age tags",
      ids: [],
    },
    "age-7-9": {
      title: "Questions for ages 7–9",
      eyebrow: "Age-group browse · filter preview",
      intro: "Ages 7–9 is a value in the current question contract. No reviewed questions carry this age tag in the source snapshot.",
      count: "No reviewed age tags",
      ids: [],
    },
    "age-10-12": {
      title: "Questions for ages 10–12",
      eyebrow: "Age-group browse · filter preview",
      intro: "Ages 10–12 is a value in the current question contract. No reviewed questions carry this age tag in the source snapshot.",
      count: "No reviewed age tags",
      ids: [],
    },
    teens: {
      title: "Questions for teens",
      eyebrow: "Audience browse · filter preview",
      intro: "Teens is a configured audience. Current draft rows have not been assigned reviewed age groups.",
      count: "No reviewed age tags",
      ids: ["wyr-002"],
    },
    adults: {
      title: "Questions for adults",
      eyebrow: "Audience browse · filter preview",
      intro: "Adults is a configured audience. Current draft rows have not been assigned reviewed age groups.",
      count: "No reviewed age tags",
      ids: ["wyr-001", "wyr-003", "wyr-007"],
    },
    family: {
      title: "Would You Rather questions for family",
      eyebrow: "Relationship browse · filter preview",
      intro: "Family is a configured relationship category. Its question suitability and relationship tags are still unreviewed.",
      count: "No reviewed relationship tags",
      ids: [],
    },
    coworkers: {
      title: "Would You Rather questions for coworkers",
      eyebrow: "Relationship browse · filter preview",
      intro: "Coworkers is a configured relationship category. Its question suitability and relationship tags are still unreviewed.",
      count: "No reviewed relationship tags",
      ids: ["wyr-006"],
    },
    classroom: {
      title: "Would You Rather questions for classroom",
      eyebrow: "Occasion browse · filter preview",
      intro: "Classroom appears as a configured browse category. The question rows below carry legacy draft labels and have not passed suitability review.",
      count: "Legacy draft tags only",
      ids: ["wyr-004", "wyr-k01", "wyr-k02"],
    },
    party: {
      title: "Would You Rather questions for party",
      eyebrow: "Occasion browse · filter preview",
      intro: "Party is a configured use occasion. These examples use older source labels; they are not approved for play.",
      count: "Legacy draft tags only",
      ids: ["wyr-001", "wyr-005"],
    },
    "road-trip": {
      title: "Would You Rather questions for road trip",
      eyebrow: "Occasion browse · filter preview",
      intro: "Road Trip is a configured use occasion. These examples use older source labels; they are not approved for play.",
      count: "Legacy draft tags only",
      ids: ["wyr-002", "wyr-008"],
    },
    dinner: {
      title: "Would You Rather questions for dinner",
      eyebrow: "Occasion browse · filter preview",
      intro: "Dinner is a configured use occasion. These examples use older source labels; they are not approved for play.",
      count: "Legacy draft tags only",
      ids: ["wyr-003", "wyr-007"],
    },
    "date-night": {
      title: "Would You Rather questions for date night",
      eyebrow: "Occasion browse · filter preview",
      intro: "Date Night is a configured use occasion. The examples shown remain unreviewed drafts.",
      count: "Legacy draft tags only",
      ids: ["wyr-009", "wyr-cp01", "wyr-cp02"],
    },
    icebreakers: {
      title: "Would You Rather questions for icebreakers",
      eyebrow: "Occasion browse · filter preview",
      intro: "Icebreakers appears in the browse categories. It is not part of the current canonical Occasion type.",
      count: "Legacy draft tags only",
      ids: ["wyr-006"],
    },
    "birthday-party": {
      title: "Would You Rather questions for birthday parties",
      eyebrow: "Occasion browse · filter preview",
      intro: "Birthday Party appears in the browse categories. It is not part of the current canonical Occasion type.",
      count: "Legacy draft tags only",
      ids: ["wyr-k05"],
    },
    sleepover: {
      title: "Would You Rather questions for sleepovers",
      eyebrow: "Occasion browse · filter preview",
      intro: "Sleepover appears in the browse categories. It is not part of the current canonical Occasion type.",
      count: "Legacy draft tags only",
      ids: ["wyr-010"],
    },
    deep: {
      title: "Deep Would You Rather questions",
      eyebrow: "Tone browse · filter preview",
      intro: "Deep is a configured question tone. Draft rows have not passed editorial review.",
      count: "Unreviewed draft labels",
      ids: ["wyr-001", "wyr-002", "wyr-008"],
    },
    weird: {
      title: "Weird Would You Rather questions",
      eyebrow: "Tone browse · filter preview",
      intro: "Weird appears in the browse categories. Draft rows have not passed editorial review.",
      count: "Unreviewed draft labels",
      ids: ["wyr-010"],
    },
    easy: {
      title: "Easy Would You Rather questions",
      eyebrow: "Difficulty browse · filter preview",
      intro: "Easy is a configured difficulty value. Draft rows have not passed editorial review.",
      count: "Unreviewed draft labels",
      ids: ["wyr-006", "wyr-009"],
    },
    clean: {
      title: "Clean Would You Rather questions",
      eyebrow: "Style browse · filter preview",
      intro: "Clean appears in the browse categories. It is not a canonical Tone value, and suitability is still unreviewed.",
      count: "Unreviewed draft labels",
      ids: ["wyr-k01", "wyr-k02"],
    },
  };

  const byId = (id) => document.getElementById(id);
  const root = document.documentElement;
  let activeQuestionIndex = 0;
  let lastChoice = null;

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
      state: params.get("state") || "",
      anchor,
    };
  }

  function updatePageTitle(page, key) {
    const category = categories[key];
    if (page === "category" && category) {
      document.title = category.title + " — wyrplay Preview";
      return;
    }
    const titles = {
      home: "wyrplay — UI Preview",
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

  function renderQuestionRow(question, index) {
    const article = make("article", "draft-question");
    const top = make("div", "draft-question__top");
    const id = make("span", "draft-question__id", question.id);
    const review = make("span", "review-label", "Editorial review pending");
    top.append(id, review);
    const heading = make("h3", "draft-question__text", question.text);
    const options = make("div", "draft-question__options");
    const optionA = make("p", "draft-option draft-option--a");
    const keyA = make("b", "", "A");
    const textA = make("span", "", question.a);
    optionA.append(keyA, textA);
    const optionB = make("p", "draft-option draft-option--b");
    const keyB = make("b", "", "B");
    const textB = make("span", "", question.b);
    optionB.append(keyB, textB);
    options.append(optionA, optionB);
    const tags = make("p", "draft-question__tags", "Draft collection tags: " + question.collections.join(" · "));
    const action = make("a", "text-link draft-question__action", "Preview this question →");
    action.href = "#/play?question=" + encodeURIComponent(question.id);
    action.setAttribute("aria-label", "Preview question " + question.id + " in the local play screen");
    article.setAttribute("data-search", (question.text + " " + question.a + " " + question.b).toLowerCase());
    article.setAttribute("data-order", String(index + 1));
    article.append(top, heading, options, tags, action);
    return article;
  }

  function renderCategory(key) {
    const category = categories[key] || categories.kids;
    const questionsForCategory = category.ids
      .map((id) => questions.find((question) => question.id === id))
      .filter(Boolean);

    byId("category-title").textContent = category.title;
    byId("category-eyebrow").textContent = category.eyebrow;
    byId("category-intro").textContent = category.intro;
    byId("category-breadcrumb").textContent = key === "road-trip" ? "Road Trip" : key.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
    byId("category-draft-count").textContent = category.count;
    byId("category-result-count").textContent = questionsForCategory.length + " examples shown";
    byId("category-list-title").textContent = questionsForCategory.length ? "Questions in this view" : "No approved questions yet";
    byId("category-review-note").textContent =
      "Examples are real rows from the current question source. Their reviewStatus is unreviewed; any older collection, audience, or occasion label shown is draft-only. None can be treated as suitable or playable.";

    const list = byId("draft-question-list");
    list.replaceChildren(...questionsForCategory.map(renderQuestionRow));
    byId("category-empty").hidden = questionsForCategory.length > 0;
    byId("question-search").value = "";
    filterDraftRows("");
  }

  function filterDraftRows(searchValue) {
    const query = searchValue.trim().toLowerCase();
    const rows = Array.from(document.querySelectorAll(".draft-question"));
    let visible = 0;
    rows.forEach((row) => {
      const matches = row.dataset.search.includes(query);
      row.hidden = !matches;
      if (matches) visible += 1;
    });
    const empty = byId("category-empty");
    if (empty) empty.hidden = visible > 0;
    const count = byId("category-result-count");
    if (count) count.textContent = visible + (visible === 1 ? " example shown" : " examples shown");
  }

  function renderPlayQuestion() {
    const question = questions[activeQuestionIndex];
    byId("play-source-id").textContent = question.id;
    byId("play-question-title").textContent = question.text;
    byId("play-option-a").textContent = question.a;
    byId("play-option-b").textContent = question.b;
    byId("play-category").textContent = "Draft tags · " + question.collections.join(" / ");
    byId("presenter-title").textContent = question.text;
    byId("presenter-option-a").textContent = question.a;
    byId("presenter-option-b").textContent = question.b;
    byId("presenter-status").textContent = "Draft question · " + question.id;
    lastChoice = null;
    setChoiceState(byId("play-view"), null);
    byId("play-results").hidden = true;
    byId("pre-vote-prompt").hidden = false;
    byId("play-status").textContent = "Choose A or B. This prototype does not call the voting API.";
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
    if (scope.matches('[data-arena="home"]')) {
      setChoiceState(scope, option);
      const result = scope.querySelector("[data-result-panel]");
      result.hidden = false;
      const pick = scope.querySelector("[data-your-choice]");
      pick.textContent = "You chose " + option;
      const message = scope.querySelector("[data-arena-message]");
      message.textContent = "Local preview · no vote was sent or stored.";
      return;
    }
    lastChoice = option;
    setChoiceState(scope, option);
    byId("pre-vote-prompt").hidden = true;
    byId("play-results").hidden = false;
    byId("play-your-choice").textContent = "Your choice: Option " + option;
    byId("play-status").textContent = "You picked Option " + option + ". The displayed percentages and total are illustrative, not live votes.";
  }

  function moveQuestion(step) {
    activeQuestionIndex = (activeQuestionIndex + step + questions.length) % questions.length;
    renderPlayQuestion();
  }

  function chooseRandomQuestion() {
    if (questions.length < 2) return;
    const currentIndex = activeQuestionIndex;
    while (activeQuestionIndex === currentIndex) {
      activeQuestionIndex = Math.floor(Math.random() * questions.length);
    }
    renderPlayQuestion();
  }

  function showPlayResult(option) {
    const scope = byId("play-view");
    chooseOption(scope, option);
    byId("play-status").textContent = "Illustrative result state · no vote was sent or stored.";
  }

  function openPresenter() {
    const dialog = byId("presenter-dialog");
    if (!dialog.open) dialog.showModal();
  }

  function sharePreview(button) {
    const localMessage = button.closest("[data-arena]");
    const status = localMessage ? localMessage.querySelector("[data-arena-message]") : byId("play-status");
    const message = "Preview link copied.";
    if (!navigator.clipboard || !window.isSecureContext) {
      if (status) status.textContent = "Copy the local preview URL from the address bar to share this screen.";
      return;
    }
    navigator.clipboard.writeText(window.location.href).then(
      () => {
        if (status) status.textContent = message + " This link opens the local preview only.";
      },
      () => {
        if (status) status.textContent = "Clipboard access was unavailable. Copy the local URL from the address bar.";
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
    const page = state.page === "result" ? "play" : state.page;
    const validPages = ["home", "category", "play", "sign-in", "account", "design-system"];
    const visiblePage = validPages.includes(page) ? page : "home";
    document.querySelectorAll("[data-page]").forEach((section) => {
      section.hidden = section.dataset.page !== visiblePage;
    });
    updatePageTitle(state.page, state.key);
    closeMobileMenu();

    if (visiblePage === "category") renderCategory(state.key || "kids");
    if (visiblePage === "play") {
      if (state.question) {
        const requestedIndex = questions.findIndex((question) => question.id === state.question);
        if (requestedIndex >= 0) activeQuestionIndex = requestedIndex;
      }
      renderPlayQuestion();
      if (state.page === "result" || state.state === "result") showPlayResult("A");
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

  document.addEventListener("click", (event) => {
    const target = event.target.closest("[data-option]");
    if (target) {
      const arena = target.closest("[data-arena]");
      if (arena) chooseOption(arena, target.dataset.option);
    }
    const shareButton = event.target.closest("[data-share]");
    if (shareButton) sharePreview(shareButton);
  });

  byId("menu-toggle").addEventListener("click", () => {
    const menu = byId("mobile-menu");
    const toggle = byId("menu-toggle");
    const open = menu.hidden;
    menu.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  });

  document.querySelectorAll("#mobile-menu a").forEach((link) => {
    link.addEventListener("click", closeMobileMenu);
  });

  byId("theme-toggle").addEventListener("click", (event) => {
    const current = root.dataset.theme || "dark";
    const next = current === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    event.currentTarget.setAttribute("aria-label", next === "dark" ? "Switch to light theme" : "Switch to dark theme");
  });

  byId("question-search").addEventListener("input", (event) => filterDraftRows(event.currentTarget.value));
  byId("clear-search").addEventListener("click", () => {
    byId("question-search").value = "";
    filterDraftRows("");
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
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    byId("signin-feedback").textContent = "Preview only: no email was sent and no account session was created. The live flow uses a single-use email link.";
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
