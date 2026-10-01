(/* 由 prepare_capture.py 绑定测量基线。只读取主文档，不导航、不操作页面。 */
(plan) => {
  const elements = plan.targets.map(({name, selector}) => {
    let matches;
    try { matches = document.querySelectorAll(selector); }
    catch { return {name, selector, status: 'invalid_selector', count: 0}; }
    if (matches.length !== 1) return {name, selector, count: matches.length, status: matches.length ? 'ambiguous' : 'missing'};
    const el = matches[0];
    const rect = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    let hidden = ['hidden', 'collapse'].includes(style.visibility);
    for (let parent = el; parent; parent = parent.parentElement) {
      const s = getComputedStyle(parent);
      if (s.display === 'none' || Number(s.opacity) === 0) hidden = true;
    }
    const hasBox = el.getClientRects().length > 0 && rect.width > 0 && rect.height > 0;
    const result = {
      name, selector, count: 1,
      status: hidden ? 'hidden' : hasBox ? 'measured' : 'unmeasurable',
      box: [rect.left + scrollX, rect.top + scrollY, rect.width, rect.height],
      text: (el.textContent || '').trim().slice(0, 300),
      computed: {display: style.display, visibility: style.visibility, opacity: style.opacity, fontFamily: style.fontFamily, fontSize: style.fontSize, lineHeight: style.lineHeight, fontWeight: style.fontWeight, color: style.color, backgroundColor: style.backgroundColor},
      viewport_intersects: rect.bottom > 0 && rect.right > 0 && rect.top < innerHeight && rect.left < innerWidth
    };
    if (el instanceof HTMLImageElement) result.asset = {src: el.currentSrc, natural_width: el.naturalWidth, natural_height: el.naturalHeight, version: el.dataset.version || null};
    return result;
  });
  return {
    measurement_sha256: plan.measurement_sha256,
    url: location.href, title: document.title,
    viewport: {width: innerWidth, height: innerHeight}, dpr: devicePixelRatio,
    scroll: {x: scrollX, y: scrollY}, document_height: document.documentElement.scrollHeight,
    fonts_ready: document.fonts.status === 'loaded',
    images_ready: [...document.images].every(im => im.complete && im.naturalWidth > 0),
    document_overflow_x: document.documentElement.scrollWidth > innerWidth,
    captured_at: new Date().toISOString(), elements,
    assets: Object.fromEntries(elements.filter(el => el.asset).map(el => [el.name, el.asset]))
  };
}
)({"measurement_sha256": "7ce1ddb5176817f0e3b69c995f31068f101c80d0454495913cc8466f4ec20b9a", "targets": [{"name": "header", "selector": ".site-header"}, {"name": "search", "selector": ".search-form"}, {"name": "popular-searches", "selector": ".popular-searches"}, {"name": "filters", "selector": ".filters"}, {"name": "question-panel", "selector": ".question-panel"}, {"name": "selection-bar", "selector": ".selection-bar"}, {"name": "category-banner", "selector": ".category-banner"}, {"name": "card-1", "selector": ".question-card:nth-child(1)"}, {"name": "card-2", "selector": ".question-card:nth-child(2)"}, {"name": "card-3", "selector": ".question-card:nth-child(3)"}, {"name": "card-4", "selector": ".question-card:nth-child(4)"}, {"name": "card-5", "selector": ".question-card:nth-child(5)"}, {"name": "card-6", "selector": ".question-card:nth-child(6)"}, {"name": "card-7", "selector": ".question-card:nth-child(7)"}, {"name": "card-8", "selector": ".question-card:nth-child(8)"}, {"name": "card-9", "selector": ".question-card:nth-child(9)"}, {"name": "card-10", "selector": ".question-card:nth-child(10)"}]})