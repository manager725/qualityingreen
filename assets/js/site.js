/* Quality Inn & Suites Downtown, Green Bay. Concept interactions v2. */
(() => {
  'use strict';
  const d = document;
  const root = d.documentElement;
  root.classList.add('js');
  window.__siteReady = true;

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const isSheet = () => matchMedia('(max-width: 720px)').matches;
  const $ = (s, c = d) => c.querySelector(s);
  const $$ = (s, c = d) => Array.from(c.querySelectorAll(s));
  const store = {
    get(k) { try { return JSON.parse(sessionStorage.getItem(k)); } catch (e) { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage blocked */ } }
  };
  /* Measurement: the hotel's GA4 and Google Ads IDs (taken from the current live site). Add a Microsoft Clarity project id
     to get heatmaps. Nothing loads until a visitor agrees in the cookie banner, and only on the hotel's own domain,
     so previews and local copies never send data. Every interaction below is already reported through track(). */
  const TAGS = { ga4: 'G-GPC6Z25GBE', ads: 'AW-16462876178', clarity: '' };
  const TAGS_ON = /(^|\.)qualityinngreenbaywi\.com$/.test(location.hostname);
  const track = (name, data) => {
    if (Array.isArray(window.dataLayer)) window.dataLayer.push(Object.assign({ event: name }, data || {}));
    if (TAGS.ga4 && typeof window.gtag === 'function') window.gtag('event', name, data || {});
    if (TAGS.clarity && typeof window.clarity === 'function') window.clarity('event', name);
  };
  const keep = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage blocked */ } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* storage blocked */ } }
  };
  /* Sections far down the page are only laid out as they come near. Before any jump to a section,
     lay the whole page out once so the browser lands exactly on it. */
  const cvOff = () => root.classList.add('cv-off');
  d.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('a[href*="#"]'); if (!a) return;
    try { const u = new URL(a.href, location.href); if (u.pathname === location.pathname && u.hash.length > 1) cvOff(); } catch (err) { /* not a URL */ }
  }, true);
  addEventListener('hashchange', cvOff);

  /* ---------- Scroll lock shared by drawer and sheets ---------- */
  let locks = 0;
  const lock = () => { if (locks++ === 0) d.body.classList.add('is-locked'); };
  const unlock = () => { locks = Math.max(0, locks - 1); if (locks === 0) d.body.classList.remove('is-locked'); };

  /* ---------- Theme: light or dark, remembered, circular reveal ---------- */
  const themeMeta = $('meta[name="theme-color"]');
  const applyTheme = t => {
    root.setAttribute('data-theme', t);
    try { localStorage.setItem('qi-theme', t); } catch (e) { /* storage blocked */ }
    if (themeMeta) themeMeta.setAttribute('content', t === 'dark' ? '#0B1210' : '#FAFAF7');
    $$('[data-theme-toggle]').forEach(b => { b.setAttribute('aria-label', t === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'); b.setAttribute('aria-pressed', String(t === 'dark')); });
  };
  applyTheme(root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');
  requestAnimationFrame(() => root.classList.add('theme-ready'));
  let switching = false;
  /* Colour transitions stay frozen through the switch so nothing fades element by element. Unfreezing costs a
     full style pass, so it waits until the reveal is over and the browser is idle. */
  const unfreeze = () => { const go = () => root.classList.remove('theme-switching'); if (window.requestIdleCallback) requestIdleCallback(go, { timeout: 500 }); else setTimeout(go, 60); };
  $$('[data-theme-toggle]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (switching) return;
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      track('theme_toggle', { theme: next });
      const flip = () => { root.classList.add('theme-switching'); applyTheme(next); void root.offsetWidth; };
      if (reduce || !d.startViewTransition) { flip(); unfreeze(); return; }
      switching = true;
      const r = btn.getBoundingClientRect(), x = Math.round(r.left + r.width / 2), y = Math.round(r.top + r.height / 2);
      const rad = Math.ceil(Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)));
      let vt;
      try { vt = d.startViewTransition(flip); } catch (e) { flip(); unfreeze(); switching = false; return; }
      /* The new theme opens as a circle from the toggle while the old one holds still underneath */
      vt.ready.then(() => root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${rad}px at ${x}px ${y}px)`] },
        { duration: 680, easing: 'cubic-bezier(.28, .62, .26, 1)', pseudoElement: '::view-transition-new(root)' }
      )).catch(() => {});
      vt.finished.catch(() => {}).then(() => { switching = false; unfreeze(); });
    });
  });

  /* ---------- Images fade in when loaded ---------- */
  $$('img.fade').forEach(img => {
    const done = () => img.classList.add('is-loaded');
    if (img.complete && img.naturalWidth) done();
    else { img.addEventListener('load', done, { once: true }); img.addEventListener('error', done, { once: true }); }
  });

  /* ---------- Button text roll ---------- */
  $$('.btn .btn__text').forEach(t => {
    const roll = d.createElement('span'); roll.className = 'btn__roll';
    const a = d.createElement('span'); a.textContent = t.textContent;
    const b = d.createElement('span'); b.textContent = t.textContent; b.setAttribute('aria-hidden', 'true');
    roll.append(a, b); t.replaceWith(roll);
  });

  /* ---------- Header state ---------- */
  const header = $('.site-header');
  if (header) {
    const s = d.createElement('div');
    s.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:48px;pointer-events:none';
    s.setAttribute('aria-hidden', 'true');
    d.body.prepend(s);
    new IntersectionObserver(([e]) => header.classList.toggle('is-scrolled', !e.isIntersecting)).observe(s);
    /* Phones and short screens: the header slides away while scrolling down and comes back on the way up */
    const compact = matchMedia('(max-width: 900px), (max-height: 520px)');
    let lastY = scrollY, ticking = false;
    const tuck = on => { header.classList.toggle('is-tucked', on); root.classList.toggle('hdr-tucked', on); };
    addEventListener('scroll', () => {
      if (ticking) return; ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const y = scrollY, dy = y - lastY;
        if (!compact.matches || y < 160 || d.body.classList.contains('is-locked')) tuck(false);
        else if (dy > 8) tuck(true);
        else if (dy < -8) tuck(false);
        lastY = y;
      });
    }, { passive: true });
    header.addEventListener('focusin', () => tuck(false));
  }

  /* ---------- Nav hover pill ---------- */
  const nav = $('.nav');
  if (nav && fine) {
    const pill = d.createElement('span'); pill.className = 'nav__pill'; pill.setAttribute('aria-hidden', 'true');
    nav.prepend(pill);
    $$('a', nav).forEach(a => a.addEventListener('pointerenter', () => {
      pill.style.width = a.offsetWidth + 'px';
      pill.style.transform = `translateX(${a.offsetLeft}px)`;
      pill.classList.add('is-on');
    }));
    nav.addEventListener('pointerleave', () => pill.classList.remove('is-on'));
  }

  /* ---------- Focus trap helper ---------- */
  const focusables = el => $$('a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])', el).filter(x => x.offsetParent !== null || x === d.activeElement);
  const trap = (el, e) => {
    if (e.key !== 'Tab') return;
    const f = focusables(el); if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && d.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && d.activeElement === last) { e.preventDefault(); first.focus(); }
  };

  /* ---------- Mobile drawer ---------- */
  const drawer = $('#drawer');
  const menuBtn = $('[data-menu-open]');
  if (drawer && menuBtn) {
    const panel = $('.drawer__panel', drawer);
    const open = () => { drawer.classList.add('is-open'); drawer.removeAttribute('aria-hidden'); drawer.inert = false; menuBtn.setAttribute('aria-expanded', 'true'); lock(); setTimeout(() => $('.drawer__close', drawer).focus(), 60); };
    const close = (restore = true) => { drawer.classList.remove('is-open'); drawer.setAttribute('aria-hidden', 'true'); drawer.inert = true; menuBtn.setAttribute('aria-expanded', 'false'); unlock(); if (restore) menuBtn.focus(); };
    drawer.inert = true;
    menuBtn.addEventListener('click', open);
    $$('[data-menu-close]', drawer).forEach(b => b.addEventListener('click', () => close()));
    $$('a', panel).forEach(a => a.addEventListener('click', () => close(false)));
    drawer.addEventListener('keydown', e => { if (e.key === 'Escape') close(); trap(panel, e); });
  }

  /* ---------- Reveal on scroll ---------- */
  $$('[data-stagger]').forEach(group => { $$('[data-reveal]', group).forEach((el, i) => el.style.setProperty('--d', Math.min(i, 5))); });
  const revealIO = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); revealIO.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: .12 });
  /* Section headings: each word rises from behind its own mask as the heading scrolls in */
  if (!reduce) $$('main h2').forEach(el => {
    if (el.closest('.hero, .tile, .score, .ask, dialog') || el.classList.contains('is-split')) return;
    let wi = 0;
    const walk = node => [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = d.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(d.createTextNode(part)); return; }
          const outer = d.createElement('span'), inner = d.createElement('span');
          outer.className = 'mw'; inner.textContent = part; inner.style.setProperty('--wi', wi++);
          outer.appendChild(inner); frag.appendChild(outer);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
    });
    walk(el); el.classList.add('is-split');
    if (!el.closest('[data-reveal]')) el.setAttribute('data-reveal', '');
  });
  $$('.eyebrow--n').forEach(e => { if (!e.closest('[data-reveal]')) e.setAttribute('data-reveal', ''); });
  /* Photos open with a soft mask as they scroll in */
  if (!reduce) $$('.tile--photo, .g-item, .pc__media').forEach(el => el.setAttribute('data-mask', ''));
  $$('[data-reveal], [data-clip], [data-mask], .footer__giant').forEach(el => revealIO.observe(el));
  /* Footer wordmark: the water only flows while it is on screen */
  $$('.footer__giant').forEach(el => new IntersectionObserver(([e]) => el.classList.toggle('is-flowing', e.isIntersecting)).observe(el));

  /* ---------- Counters ---------- */
  const fmt = n => n.toLocaleString('en-US');
  const countIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      countIO.unobserve(e.target);
      const el = e.target, to = parseFloat(el.dataset.count), dec = (el.dataset.count.split('.')[1] || '').length;
      if (reduce) { el.textContent = dec ? to.toFixed(dec) : fmt(to); return; }
      const t0 = performance.now(), dur = 1500;
      const step = t => {
        const p = Math.min(1, (t - t0) / dur), v = to * (1 - Math.pow(2, -10 * p));
        el.textContent = dec ? (p === 1 ? to : v).toFixed(dec) : fmt(p === 1 ? to : Math.round(v));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }, { threshold: .6 });
  $$('[data-count]').forEach(el => { if (!reduce) el.textContent = el.dataset.count.includes('.') ? '0.0' : '0'; countIO.observe(el); });

  /* ---------- Disclosure and accordions ---------- */
  $$('[data-toggle]').forEach(btn => {
    const panel = d.getElementById(btn.getAttribute('aria-controls'));
    if (!panel) return;
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      panel.classList.toggle('is-open', open);
      panel.inert = !open;
    });
    panel.inert = btn.getAttribute('aria-expanded') !== 'true';
  });

  /* ---------- Tabs ---------- */
  $$('[data-tabs]').forEach(wrap => {
    const list = $('[role="tablist"]', wrap);
    const tabs = $$('[role="tab"]', list);
    const pill = d.createElement('span'); pill.className = 'tabs__pill'; pill.setAttribute('aria-hidden', 'true'); list.prepend(pill);
    const place = t => { pill.style.width = t.offsetWidth + 'px'; pill.style.transform = `translateX(${t.offsetLeft}px)`; };
    const select = (t, focus) => {
      tabs.forEach(x => {
        const on = x === t;
        x.setAttribute('aria-selected', String(on)); x.tabIndex = on ? 0 : -1;
        const p = d.getElementById(x.getAttribute('aria-controls'));
        p.hidden = !on;
        if (on && !reduce) { p.classList.remove('is-entering'); void p.offsetWidth; p.classList.add('is-entering'); }
      });
      place(t); if (focus) t.focus();
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(t));
      t.addEventListener('keydown', e => {
        let n = null;
        if (e.key === 'ArrowRight') n = tabs[(i + 1) % tabs.length];
        if (e.key === 'ArrowLeft') n = tabs[(i - 1 + tabs.length) % tabs.length];
        if (e.key === 'Home') n = tabs[0];
        if (e.key === 'End') n = tabs[tabs.length - 1];
        if (n) { e.preventDefault(); select(n, true); }
      });
    });
    const cur = tabs.find(t => t.getAttribute('aria-selected') === 'true') || tabs[0];
    const current = () => tabs.find(t => t.getAttribute('aria-selected') === 'true') || cur;
    if ('ResizeObserver' in window) new ResizeObserver(() => place(current())).observe(list);
    else requestAnimationFrame(() => place(cur));
  });

  /* ---------- Hero photo stage ---------- */
  const stage = $('[data-stage]');
  if (stage) {
    const imgs = $$('.stage__img', stage), tabs = $$('.stage__tab', stage);
    const title = $('[data-stage-title]', stage), sub = $('[data-stage-sub]', stage), pauseBtn = $('[data-stage-pause]', stage);
    const DUR = 6000; stage.style.setProperty('--slide-dur', DUR + 'ms');
    const hydrate = im => { if (im.dataset.src) { im.srcset = im.dataset.srcset; im.src = im.dataset.src; delete im.dataset.src; } };
    const warm = () => { const go = () => imgs.forEach(hydrate); if ('requestIdleCallback' in window) requestIdleCallback(go, { timeout: 4500 }); else setTimeout(go, 3000); };
    if (d.readyState === 'complete') warm(); else addEventListener('load', warm, { once: true });
    let idx = 0, timer = null, paused = reduce, hover = false, visible = true;
    const words = $$('[data-slide]'), caption = $('.stage__caption', stage);
    let swapT = 0;
    const show = i => {
      if (i === idx) return;
      const next = imgs[i];
      hydrate(next);
      imgs.forEach((im, k) => { if (k !== i) im.classList.remove('is-entering'); });
      next.classList.add('is-entering');
      clearTimeout(swapT);
      swapT = setTimeout(() => imgs.forEach((im, k) => { im.classList.toggle('is-active', k === i); if (k === i) im.classList.remove('is-entering'); }), reduce ? 0 : 1100);
      tabs.forEach((t, j) => t.setAttribute('aria-selected', String(j === i)));
      words.forEach(w => w.classList.toggle('is-lit', +w.dataset.slide === i));
      title.textContent = next.dataset.title; sub.textContent = next.dataset.sub;
      if (caption && !reduce) { caption.classList.remove('is-swap'); void caption.offsetWidth; caption.classList.add('is-swap'); }
      idx = i; schedule();
    };
    const schedule = () => { clearTimeout(timer); if (!paused && !hover && visible) timer = setTimeout(() => show((idx + 1) % imgs.length), DUR); };
    const setPaused = p => { paused = p; stage.classList.toggle('is-paused', p || hover); pauseBtn.setAttribute('aria-label', p ? 'Play slideshow' : 'Pause slideshow'); pauseBtn.dataset.tip = p ? 'Play' : 'Pause'; $('use', pauseBtn).setAttribute('href', p ? '#i-play' : '#i-pause'); schedule(); };
    tabs.forEach((t, i) => t.addEventListener('click', () => { show(i); track('hero_photo', { i }); }));
    /* Hover (desktop) or tap a headline word to see that part of the stay */
    words.forEach(w => {
      const i = +w.dataset.slide;
      w.addEventListener('click', () => { show(i); track('hero_word', { i }); });
      if (fine) w.addEventListener('pointerenter', () => show(i));
    });
    /* Swipe the photo on phones */
    let sx = null, sy = 0;
    stage.addEventListener('touchstart', e => { if (e.target.closest('a, button')) { sx = null; return; } sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    stage.addEventListener('touchend', e => {
      if (sx === null) return;
      const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy; sx = null;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4) { show((idx + (dx < 0 ? 1 : -1) + imgs.length) % imgs.length); track('hero_swipe'); }
    }, { passive: true });
    pauseBtn.addEventListener('click', () => setPaused(!paused));
    stage.addEventListener('pointerenter', () => { hover = true; stage.classList.add('is-paused'); clearTimeout(timer); });
    stage.addEventListener('pointerleave', () => { hover = false; stage.classList.toggle('is-paused', paused); schedule(); });
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; schedule(); }).observe(stage);
    d.addEventListener('visibilitychange', () => { visible = !d.hidden; schedule(); });
    if (reduce) setPaused(true); else setTimeout(schedule, 1200);
    if (fine && !reduce) {
      let raf = 0;
      stage.addEventListener('pointermove', e => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          const r = stage.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
          const active = imgs[idx]; active.style.translate = `${x * -14}px ${y * -10}px`; raf = 0;
        });
      });
      stage.addEventListener('pointerleave', () => imgs.forEach(im => { im.style.translate = ''; }));
    }
  }

  /* ---------- Story: sticky steps follow the photos ---------- */
  const steps = $$('[data-story-steps] .story__step');
  if (steps.length) {
    const panels = $$('[data-story-panel]');
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { const i = +e.target.dataset.storyPanel; steps.forEach((s, j) => s.classList.toggle('is-active', j === i)); } });
    }, { rootMargin: '-45% 0px -45% 0px' });
    panels.forEach(p => io.observe(p));
    steps.forEach((s, i) => {
      s.tabIndex = 0;
      const go = () => panels[i].scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
      s.addEventListener('click', go);
      s.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    });
  }

  /* ---------- Rooms: expanding panels ---------- */
  const panelWrap = $('[data-panels]');
  if (panelWrap) {
    const panels = $$('[data-panel]', panelWrap);
    const openPanel = p => panels.forEach(x => { const on = x === p; x.classList.toggle('is-open', on); x.setAttribute('aria-expanded', String(on)); $$('a', x).forEach(a => { a.tabIndex = on ? 0 : -1; }); });
    panels.forEach(p => {
      p.tabIndex = 0;
      p.addEventListener('click', e => { if (!p.classList.contains('is-open')) { e.preventDefault(); openPanel(p); } });
      p.addEventListener('focus', () => openPanel(p));
      p.addEventListener('keydown', e => { if (e.key === 'Enter' && !p.classList.contains('is-open')) openPanel(p); });
      if (fine) { let t; p.addEventListener('pointerenter', () => { t = setTimeout(() => openPanel(p), 140); }); p.addEventListener('pointerleave', () => clearTimeout(t)); }
    });
    if (matchMedia('(min-width: 901px)').matches) openPanel(panels.find(p => p.classList.contains('is-open')) || panels[0]);
  }

  /* ---------- Postcards: arrows, drag and progress ---------- */
  const pcTrack = $('[data-pc-track]');
  if (pcTrack) {
    const prev = $('[data-pc-prev]'), next = $('[data-pc-next]'), bar = $('[data-pc-progress]');
    const stepW = () => { const c = pcTrack.firstElementChild; return c ? c.getBoundingClientRect().width + 18 : 300; };
    const update = () => {
      const max = pcTrack.scrollWidth - pcTrack.clientWidth;
      const p = max > 0 ? pcTrack.scrollLeft / max : 1;
      bar.style.setProperty('--p', Math.max(.12, Math.min(1, p * .88 + .12)));
      prev.disabled = pcTrack.scrollLeft < 8; next.disabled = pcTrack.scrollLeft > max - 8;
    };
    prev.addEventListener('click', () => pcTrack.scrollBy({ left: -stepW(), behavior: reduce ? 'auto' : 'smooth' }));
    next.addEventListener('click', () => pcTrack.scrollBy({ left: stepW(), behavior: reduce ? 'auto' : 'smooth' }));
    let raf = 0; pcTrack.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(() => { update(); raf = 0; }); }, { passive: true });
    /* measured once the carousel comes near, so page load never has to lay out this section early */
    new IntersectionObserver(([e], o) => { if (e.isIntersecting) { update(); o.disconnect(); } }, { rootMargin: '300px' }).observe(pcTrack);
    addEventListener('resize', update, { passive: true });
    let down = false, sx = 0, sl = 0, moved = false;
    pcTrack.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = pcTrack.scrollLeft; });
    addEventListener('pointermove', e => { if (!down) return; const dx = e.clientX - sx; if (Math.abs(dx) > 5) { moved = true; pcTrack.classList.add('is-dragging'); } pcTrack.scrollLeft = sl - dx; });
    addEventListener('pointerup', () => { if (!down) return; down = false; pcTrack.classList.remove('is-dragging'); });
    pcTrack.addEventListener('click', e => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
    pcTrack.addEventListener('keydown', e => { if (e.key === 'ArrowRight') { e.preventDefault(); next.click(); } if (e.key === 'ArrowLeft') { e.preventDefault(); prev.click(); } });
  }

  /* ---------- Pointer effects: spotlight, magnetic, cursor label ---------- */
  if (fine && !reduce) {
    $$('.spot').forEach(el => {
      let raf = 0;
      el.addEventListener('pointermove', e => {
        if (raf) return;
        raf = requestAnimationFrame(() => { const r = el.getBoundingClientRect(); el.style.setProperty('--mx', (e.clientX - r.left) + 'px'); el.style.setProperty('--my', (e.clientY - r.top) + 'px'); raf = 0; });
      });
    });
    $$('[data-magnetic]').forEach(el => {
      el.classList.add('magnetic');
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * .22, y = (e.clientY - r.top - r.height / 2) * .32;
        el.style.transform = `translate(${Math.max(-12, Math.min(12, x))}px, ${Math.max(-10, Math.min(10, y))}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
    const cursor = d.createElement('div'); cursor.className = 'cursor'; cursor.setAttribute('aria-hidden', 'true'); d.body.appendChild(cursor);
    let cx = -200, cy = -200, raf = 0;
    addEventListener('pointermove', e => { cx = e.clientX; cy = e.clientY; if (!raf) raf = requestAnimationFrame(() => { cursor.style.setProperty('--cx', cx + 'px'); cursor.style.setProperty('--cy', cy + 'px'); raf = 0; }); }, { passive: true });
    $$('[data-cursor]').forEach(el => {
      el.addEventListener('pointerenter', () => { cursor.textContent = el.dataset.cursor; cursor.classList.add('is-on'); });
      el.addEventListener('pointerleave', () => cursor.classList.remove('is-on'));
    });
  }

  /* ---------- Booking ---------- */
  const BASE = 'https://www.choicehotels.com/wisconsin/green-bay/quality-inn-hotels/wi111/rates';
  const DAY = 864e5;
  const startOf = dt => new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
  const today = startOf(new Date());
  const maxDate = new Date(today.getFullYear(), today.getMonth() + 12, today.getDate());
  const iso = dt => `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
  const fromIso = s => { if (!s) return null; const [y, m, dd] = s.split('-').map(Number); return new Date(y, m - 1, dd); };
  const fShort = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const fLong = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const fMonth = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' });
  const short = dt => fShort.format(dt);
  const long = dt => fLong.format(dt);
  const addDays = (dt, n) => new Date(dt.getFullYear(), dt.getMonth(), dt.getDate() + n);
  const nights = (a, b) => Math.round((b - a) / DAY);
  const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
  /* Packers home games at Lambeau Field, from the official schedule on packers.com (checked 12 Nov 2026).
     Week 18 against the Lions has no date yet. Add next season's dates when the NFL publishes them in May. */
  const HOME_GAMES = { '2026-09-24': 'Falcons', '2026-10-11': 'Bears', '2026-10-18': 'Cowboys', '2026-10-29': 'Panthers', '2026-11-15': 'Vikings', '2026-12-13': 'Bills', '2026-12-20': 'Dolphins', '2027-01-04': 'Texans' };
  const nextGame = () => { const k = Object.keys(HOME_GAMES).sort().find(s => fromIso(s) >= today); return k ? fromIso(k) : null; };

  const saved = store.get('qi-stay') || {};
  const state = { ci: fromIso(saved.ci), co: fromIso(saved.co), adults: saved.adults || 2, minors: saved.minors || 0, rooms: saved.rooms || 1 };
  if (state.ci && state.ci < today) { state.ci = null; state.co = null; }
  /* Welcome back: a returning visitor finds the dates they chose last time (kept on this device only, for up to 60 days) */
  let welcome = null;
  if (!state.ci) {
    const k = keep.get('qi-dates');
    if (k && k.ci && k.co && fromIso(k.ci) >= today && Date.now() - (k.at || 0) < 60 * DAY) {
      state.ci = fromIso(k.ci); state.co = fromIso(k.co); state.adults = k.adults || 2; state.minors = k.minors || 0; state.rooms = k.rooms || 1;
      welcome = { ci: +state.ci, co: +state.co };
    } else if (k) keep.del('qi-dates');
  }
  const isWelcome = () => !!(welcome && state.ci && state.co && +state.ci === welcome.ci && +state.co === welcome.co);
  const LIMITS = { adults: [1, 5], minors: [0, 4], rooms: [1, 5] };
  const subs = new Set();
  const url = () => {
    if (!state.ci || !state.co) return BASE;
    const q = new URLSearchParams({ checkInDate: iso(state.ci), checkOutDate: iso(state.co), adults: state.adults, rooms: state.rooms, minors: state.minors });
    return `${BASE}?${q}`;
  };
  const commit = () => {
    store.set('qi-stay', { ci: state.ci && iso(state.ci), co: state.co && iso(state.co), adults: state.adults, minors: state.minors, rooms: state.rooms });
    if (state.ci && state.co) keep.set('qi-dates', { ci: iso(state.ci), co: iso(state.co), adults: state.adults, minors: state.minors, rooms: state.rooms, at: Date.now() }); else keep.del('qi-dates');
    $$('[data-book-link]').forEach(a => { a.href = url(); });
    subs.forEach(fn => fn());
  };
  const guestText = () => `${plural(state.adults, 'adult')}${state.minors ? ', ' + (state.minors === 1 ? '1 child' : state.minors + ' children') : ''} · ${plural(state.rooms, 'room')}`;

  /* Hand-off: warm up the connection to Choice Hotels as soon as someone shows booking intent */
  let warmed = false;
  const warm = () => {
    if (warmed) return; warmed = true;
    ['dns-prefetch', 'preconnect'].forEach(rel => { const l = d.createElement('link'); l.rel = rel; l.href = 'https://www.choicehotels.com'; d.head.appendChild(l); });
  };
  const intent = e => { if (e.target.closest && e.target.closest('[data-booking], [data-book-link], .pop, [data-promo-dates]')) warm(); };
  d.addEventListener('pointerover', intent, { passive: true });
  d.addEventListener('focusin', intent);
  d.addEventListener('touchstart', intent, { passive: true });

  const handoff = $('#handoff');
  const fDay = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
  let hoTimers = [], hoOpener = null;
  const hoReset = () => {
    hoTimers.forEach(clearTimeout); hoTimers = [];
    if (!handoff || handoff.hidden) return;
    handoff.classList.remove('is-on', 'is-going');
    handoff.hidden = true; unlock(); root.classList.remove('ho-open');
  };
  const handOff = href => {
    track('handoff', { nights: state.ci && state.co ? nights(state.ci, state.co) : 0 });
    if (!handoff) { location.assign(href); return; }
    warm();
    const set = (k, v) => { const el = $(`[data-ho="${k}"]`, handoff); if (el) el.textContent = v; };
    const dates = $('[data-ho-dates]', handoff);
    if (state.ci && state.co) {
      dates.hidden = false;
      set('ci', fDay.format(state.ci)); set('co', fDay.format(state.co));
      set('meta', `${plural(nights(state.ci, state.co), 'night')} · ${plural(state.adults, 'adult')}${state.minors ? ' · ' + plural(state.minors, 'child').replace('childs', 'children') : ''}`);
    } else { dates.hidden = true; set('meta', ''); }
    hoOpener = d.activeElement;
    const total = reduce ? 400 : 900;
    handoff.style.setProperty('--ho-time', total + 'ms');
    handoff.hidden = false; lock(); root.classList.add('ho-open');
    requestAnimationFrame(() => requestAnimationFrame(() => { handoff.classList.add('is-on'); $('.handoff__card', handoff).focus({ preventScroll: true }); }));
    hoTimers.push(setTimeout(() => { handoff.classList.add('is-going'); location.assign(href); }, total));
  };
  if (handoff) {
    const cancel = () => { const was = !handoff.hidden; hoReset(); if (was) { track('handoff_cancel'); if (hoOpener && hoOpener.focus) hoOpener.focus({ preventScroll: true }); } };
    $('[data-handoff-cancel]', handoff).addEventListener('click', cancel);
    handoff.addEventListener('keydown', e => { if (e.key === 'Escape') { e.preventDefault(); cancel(); } trap($('.handoff__card', handoff), e); });
  }
  /* Back button from Choice Hotels restores this page from cache: put it back as it was */
  addEventListener('pageshow', e => { if (e.persisted) hoReset(); });
  addEventListener('pagehide', () => { hoTimers.forEach(clearTimeout); hoTimers = []; });

  const backdrop = d.createElement('div'); backdrop.className = 'sheet-backdrop'; d.body.appendChild(backdrop);
  let openPop = null;
  const closePop = restore => {
    if (!openPop) return;
    const { pop, trigger } = openPop;
    pop.classList.remove('is-open'); trigger.setAttribute('aria-expanded', 'false');
    backdrop.classList.remove('is-open');
    if (openPop.locked) unlock();
    const p = pop; setTimeout(() => { if (!p.classList.contains('is-open')) p.hidden = true; }, 320);
    if (restore) trigger.focus();
    openPop = null;
  };
  const showPop = (pop, trigger, onOpen) => {
    if (openPop && openPop.pop === pop) { closePop(true); return; }
    closePop(false);
    pop.hidden = false;
    requestAnimationFrame(() => requestAnimationFrame(() => pop.classList.add('is-open')));
    trigger.setAttribute('aria-expanded', 'true');
    backdrop.classList.add('is-open'); lock();
    openPop = { pop, trigger, locked: true };
    if (onOpen) onOpen();
  };
  backdrop.addEventListener('click', () => closePop(true));
  d.addEventListener('pointerdown', e => { if (openPop && !openPop.pop.contains(e.target) && !openPop.trigger.contains(e.target) && e.target !== backdrop) closePop(false); });
  d.addEventListener('keydown', e => { if (e.key === 'Escape' && openPop) { e.preventDefault(); closePop(true); } });

  const forms = $$('[data-booking]');
  forms.forEach(form => {
    const calBtn = $('[data-cal-open]', form), cal = $('.cal', form);
    const gBtn = $('[data-guests-open]', form), guests = $('.guests', form);
    const ciL = $('[data-ci-label]', form), coL = $('[data-co-label]', form), gL = $('[data-guests-label]', form);
    const note = $('[data-booking-note]', form);
    const noteDefault = note ? note.innerHTML : '';
    const hidden = name => $(`input[name="${name}"]`, form);
    let view = new Date((state.ci || today).getFullYear(), (state.ci || today).getMonth(), 1);
    let focusDate = null;

    cal.innerHTML = `
      <div class="pop__top"><div><p class="pop__title">When are you staying?</p><p class="pop__sub">Check-in from 3 PM, check-out by 11 AM</p></div><button type="button" class="pop__x" data-done aria-label="Close date picker"><svg class="icon" aria-hidden="true"><use href="#i-x"/></svg></button></div>
      <div class="cal__head">
        <button type="button" class="cal__nav" data-prev aria-label="Previous month" data-tip="Previous month"><svg class="icon" aria-hidden="true"><use href="#i-chev-left"/></svg></button>
        <p class="sr-only" aria-live="polite" data-cal-live></p>
        <button type="button" class="cal__nav" data-next aria-label="Next month" data-tip="Next month"><svg class="icon" aria-hidden="true"><use href="#i-chev-right"/></svg></button>
      </div>
      <div class="cal__months"><div class="cal__month cal__month--1"></div><div class="cal__month cal__month--2"></div></div>
      <p class="cal__legend" data-game-legend hidden><i aria-hidden="true"></i>Packers home game at Lambeau Field</p>
      <div class="cal__foot">
        <div class="cal__quick" role="group" aria-label="Quick picks">
          <button type="button" class="qchip" data-quick="tonight">Tonight</button>
          <button type="button" class="qchip" data-quick="weekend">This weekend</button>
          <button type="button" class="qchip" data-quick="next">Next weekend</button>
          <button type="button" class="qchip qchip--game" data-quick="game" hidden><i aria-hidden="true"></i>Home game</button>
        </div>
        <p class="cal__summary" data-cal-summary>Choose a check-in date</p>
        <div class="cal__actions">
          <button type="button" class="text-btn" data-clear>Clear</button>
          <button type="button" class="btn btn--dark btn--sm" data-done>Done</button>
        </div>
      </div>`;
    const m1 = $('.cal__month--1', cal), m2 = $('.cal__month--2', cal);
    const live = $('[data-cal-live]', cal), summary = $('[data-cal-summary]', cal);
    const legend = $('[data-game-legend]', cal), gChip = $('[data-quick="game"]', cal), ng = nextGame();
    if (gChip && ng) { gChip.hidden = false; gChip.title = `Packers vs ${HOME_GAMES[iso(ng)]}, ${short(ng)}`; gChip.setAttribute('aria-label', `Packers home game: ${short(ng)} vs ${HOME_GAMES[iso(ng)]}`); }

    const monthHTML = first => {
      const y = first.getFullYear(), m = first.getMonth();
      const days = new Date(y, m + 1, 0).getDate(), lead = new Date(y, m, 1).getDay();
      let h = `<p class="cal__month-title">${fMonth.format(first)}</p><div class="cal__grid">`;
      ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].forEach(w => { h += `<span class="cal__dow" aria-hidden="true">${w}</span>`; });
      for (let i = 0; i < lead; i++) h += '<span></span>';
      for (let day = 1; day <= days; day++) {
        const dt = new Date(y, m, day), t = +dt, gm = HOME_GAMES[iso(dt)];
        const dis = dt < today || dt > maxDate;
        const isS = state.ci && t === +state.ci, isE = state.co && t === +state.co;
        const inR = state.ci && state.co && dt > state.ci && dt < state.co;
        const cls = ['cal__day', +dt === +today ? 'is-today' : '', isS ? 'is-start' : '', isE ? 'is-end' : '', inR ? 'in-range' : '', isS && !state.co ? 'no-range' : '', gm ? 'is-game' : ''].filter(Boolean).join(' ');
        const label = long(dt) + (isS ? ', check-in' : '') + (isE ? ', check-out' : '') + (gm ? `, Packers home game vs ${gm}` : '') + (dis ? ', unavailable' : '');
        h += `<button type="button" class="${cls}" data-date="${iso(dt)}"${gm ? ` title="Packers vs ${gm}"` : ''} aria-label="${label}" aria-pressed="${isS || isE ? 'true' : 'false'}" ${dis ? 'disabled' : ''} tabindex="-1"><span>${day}</span></button>`;
      }
      return h + '</div>';
    };
    const render = () => {
      const second = new Date(view.getFullYear(), view.getMonth() + 1, 1);
      m1.innerHTML = monthHTML(view); m2.innerHTML = monthHTML(second);
      if (legend) legend.hidden = !$('.is-game', m1) && !$('.is-game', m2);
      $('[data-prev]', cal).disabled = view <= new Date(today.getFullYear(), today.getMonth(), 1);
      $('[data-next]', cal).disabled = second >= new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
      if (state.ci && state.co) summary.innerHTML = `<strong>${plural(nights(state.ci, state.co), 'night')}</strong> · ${short(state.ci)} to ${short(state.co)}`;
      else if (state.ci) summary.innerHTML = `Check-in <strong>${short(state.ci)}</strong>. Now choose check-out`;
      else summary.textContent = 'Choose a check-in date';
      const target = focusDate || state.ci || (today >= view ? today : view);
      const btn = $(`[data-date="${iso(target)}"]`, cal) || $('.cal__day:not(:disabled)', cal);
      if (btn) btn.tabIndex = 0;
    };
    const syncSteppers = () => {
      $$('[data-step]', guests).forEach(row => {
        const k = row.dataset.step, [min, max] = LIMITS[k];
        const cap = k === 'rooms' ? Math.min(max, state.adults) : max;
        $('output', row).textContent = state[k];
        $('[data-dec]', row).disabled = state[k] <= min;
        $('[data-inc]', row).disabled = state[k] >= cap;
      });
    };
    const paint = () => {
      if (state.ci && state.co) { ciL.textContent = short(state.ci); coL.textContent = short(state.co); }
      else if (state.ci) { ciL.textContent = short(state.ci); coL.textContent = 'Add date'; }
      else { ciL.textContent = 'Add date'; coL.textContent = 'Add date'; }
      ciL.classList.toggle('is-empty', !state.ci); coL.classList.toggle('is-empty', !state.co);
      gL.textContent = guestText();
      hidden('checkInDate').value = state.ci ? iso(state.ci) : '';
      hidden('checkOutDate').value = state.co ? iso(state.co) : '';
      hidden('adults').value = state.adults; hidden('minors').value = state.minors; hidden('rooms').value = state.rooms;
      if (note && !note.classList.contains('is-alert')) {
        note.innerHTML = isWelcome()
          ? `<svg class="icon" aria-hidden="true"><use href="#i-check"/></svg>Welcome back. We kept your dates: ${short(state.ci)} to ${short(state.co)}. <button type="button" class="note-clear" data-forget-dates>Clear</button>`
          : state.ci && state.co
          ? `<svg class="icon" aria-hidden="true"><use href="#i-check"/></svg>${plural(nights(state.ci, state.co), 'night')}, ${short(state.ci)} to ${short(state.co)}. Next: live rates on choicehotels.com.`
          : noteDefault;
      }
      if (!cal.hidden) render();
      syncSteppers();
    };
    subs.add(paint);

    const pick = dt => {
      if (!state.ci || state.co || dt <= state.ci) { state.ci = dt; state.co = null; live.textContent = `Check-in ${long(dt)}. Choose check-out.`; }
      else { state.co = dt; live.textContent = `Check-out ${long(dt)}. ${plural(nights(state.ci, dt), 'night')}.`; }
      focusDate = dt;
      if (note) note.classList.remove('is-alert');
      commit();
      if (state.ci && state.co) { track('booking_dates', { nights: nights(state.ci, state.co) }); setTimeout(() => closePop(true), isSheet() ? 450 : 280); }
      else { const b = $(`[data-date="${iso(dt)}"]`, cal); if (b) b.focus(); }
    };

    cal.addEventListener('click', e => {
      const day = e.target.closest('.cal__day');
      if (day && !day.disabled) { pick(fromIso(day.dataset.date)); return; }
      if (e.target.closest('[data-prev]')) { view = new Date(view.getFullYear(), view.getMonth() - 1, 1); focusDate = null; render(); return; }
      if (e.target.closest('[data-next]')) { view = new Date(view.getFullYear(), view.getMonth() + 1, 1); focusDate = null; render(); return; }
      if (e.target.closest('[data-clear]')) { state.ci = null; state.co = null; focusDate = null; commit(); return; }
      if (e.target.closest('[data-done]')) { closePop(true); return; }
      const q = e.target.closest('[data-quick]');
      if (q) {
        const [a, b] = quickRange(q.dataset.quick);
        if (!a) return;
        state.ci = a; state.co = b; view = new Date(a.getFullYear(), a.getMonth(), 1); focusDate = a;
        if (note) note.classList.remove('is-alert');
        commit(); track('booking_quick_pick', { pick: q.dataset.quick });
        setTimeout(() => closePop(true), 280);
      }
    });
    cal.addEventListener('pointerover', e => {
      const day = e.target.closest('.cal__day');
      if (!state.ci || state.co) return;
      $$('.in-preview', cal).forEach(x => x.classList.remove('in-preview'));
      if (!day || day.disabled) return;
      const h = fromIso(day.dataset.date);
      if (h <= state.ci) return;
      $$('.cal__day', cal).forEach(b => { const t = fromIso(b.dataset.date); if (t > state.ci && t <= h) b.classList.add('in-preview'); });
    });
    cal.addEventListener('keydown', e => {
      const day = e.target.closest('.cal__day'); if (!day) { if (e.key === 'Tab') trap(cal, e); return; }
      const cur = fromIso(day.dataset.date); let n = null;
      if (e.key === 'ArrowRight') n = addDays(cur, 1);
      if (e.key === 'ArrowLeft') n = addDays(cur, -1);
      if (e.key === 'ArrowDown') n = addDays(cur, 7);
      if (e.key === 'ArrowUp') n = addDays(cur, -7);
      if (e.key === 'Home') n = addDays(cur, -cur.getDay());
      if (e.key === 'End') n = addDays(cur, 6 - cur.getDay());
      if (e.key === 'PageDown') n = new Date(cur.getFullYear(), cur.getMonth() + 1, cur.getDate());
      if (e.key === 'PageUp') n = new Date(cur.getFullYear(), cur.getMonth() - 1, cur.getDate());
      if (e.key === 'Tab') { trap(cal, e); return; }
      if (!n) return;
      e.preventDefault();
      if (n < today) n = today; if (n > maxDate) n = maxDate;
      const lastShown = new Date(view.getFullYear(), view.getMonth() + (isSheet() ? 1 : 2), 0);
      if (n < view || n > lastShown) view = new Date(n.getFullYear(), n.getMonth(), 1);
      focusDate = n; render();
      const b = $(`[data-date="${iso(n)}"]`, cal); if (b) b.focus();
    });
    calBtn.addEventListener('click', () => showPop(cal, calBtn, () => { render(); setTimeout(() => { const b = $('.cal__day[tabindex="0"]', cal); if (b) b.focus({ preventScroll: true }); }, 60); }));

    guests.addEventListener('click', e => {
      const row = e.target.closest('[data-step]');
      if (row && e.target.closest('[data-inc], [data-dec]')) {
        const k = row.dataset.step, [min, max] = LIMITS[k];
        const cap = k === 'rooms' ? Math.min(max, state.adults) : max;
        state[k] = Math.max(min, Math.min(cap, state[k] + (e.target.closest('[data-inc]') ? 1 : -1)));
        if (state.rooms > state.adults) state.rooms = state.adults;
        commit();
      }
      if (e.target.closest('[data-done]')) closePop(true);
    });
    guests.addEventListener('keydown', e => trap(guests, e));
    gBtn.addEventListener('click', () => showPop(guests, gBtn, () => setTimeout(() => { const b = $('button:not(:disabled)', guests); if (b) b.focus({ preventScroll: true }); }, 60)));

    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!state.ci || !state.co) {
        if (note) { note.classList.add('is-alert'); note.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#i-calendar"/></svg>Choose your check-in and check-out dates to see rates.'; }
        if (!reduce) { form.classList.remove('is-shake'); void form.offsetWidth; form.classList.add('is-shake'); }
        calBtn.click();
        return;
      }
      track('booking_submit', { nights: nights(state.ci, state.co), adults: state.adults, rooms: state.rooms });
      handOff(url());
    });
    guests.insertAdjacentHTML('afterbegin', '<div class="pop__top"><div><p class="pop__title">Who\'s coming?</p><p class="pop__sub">Up to 5 rooms per booking</p></div><button type="button" class="pop__x" data-done aria-label="Close guest picker"><svg class="icon" aria-hidden="true"><use href="#i-x"/></svg></button></div>');
    d.body.append(cal, guests);
    paint();
  });

  /* ---------- Booking panel (floating "Book a room"): inline calendar, guests, check rates ---------- */
  const bk = $('#book-panel');
  let bkOpen = null;
  if (bk) {
    const panel = $('.bk__panel', bk), grid = $('[data-bk-grid]', bk), monthEl = $('[data-bk-month]', bk);
    const prevB = $('[data-bk-prev]', bk), nextB = $('[data-bk-next]', bk), datesEl = $('[data-bk-dates]', bk);
    const noteEl = $('[data-bk-note]', bk), noteHTML = noteEl.innerHTML;
    const tabs = $$('[data-bk-tab]', bk), panes = $$('[data-bk-pane]', bk);
    const bkLegend = d.createElement('p'); bkLegend.className = 'cal__legend'; bkLegend.hidden = true; bkLegend.innerHTML = '<i aria-hidden="true"></i>Packers home game at Lambeau Field'; grid.after(bkLegend);
    const firstMonth = new Date(today.getFullYear(), today.getMonth(), 1), lastMonth = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
    let view = firstMonth, focusD = null, opener = null, closeT = 0;
    const draw = () => {
      const y = view.getFullYear(), m = view.getMonth(), days = new Date(y, m + 1, 0).getDate(), lead = new Date(y, m, 1).getDay();
      const inView = dt => dt && dt.getMonth() === m && dt.getFullYear() === y;
      const target = inView(focusD) ? focusD : inView(state.ci) ? state.ci : null;
      let html = '', tabSet = false;
      ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].forEach(w => { html += `<span class="cal__dow" aria-hidden="true">${w}</span>`; });
      for (let i = 0; i < lead; i++) html += '<span></span>';
      for (let day = 1; day <= days; day++) {
        const dt = new Date(y, m, day), t = +dt, dis = dt < today || dt > maxDate, gm = HOME_GAMES[iso(dt)];
        const isS = state.ci && t === +state.ci, isE = state.co && t === +state.co, inR = state.ci && state.co && dt > state.ci && dt < state.co;
        const cls = ['cal__day', t === +today ? 'is-today' : '', isS ? 'is-start' : '', isE ? 'is-end' : '', inR ? 'in-range' : '', isS && !state.co ? 'no-range' : '', gm ? 'is-game' : ''].filter(Boolean).join(' ');
        let tab = -1;
        if (!tabSet && !dis && (!target || t === +target)) { tab = 0; tabSet = true; }
        html += `<button type="button" class="${cls}" data-date="${iso(dt)}"${gm ? ` title="Packers vs ${gm}"` : ''} aria-label="${long(dt)}${isS ? ', check-in' : ''}${isE ? ', check-out' : ''}${gm ? `, Packers home game vs ${gm}` : ''}" aria-pressed="${isS || isE ? 'true' : 'false'}" ${dis ? 'disabled' : ''} tabindex="${tab}"><span>${day}</span></button>`;
      }
      grid.innerHTML = html;
      bkLegend.hidden = !$('.is-game', grid);
      monthEl.textContent = fMonth.format(view);
      prevB.disabled = view <= firstMonth; nextB.disabled = view >= lastMonth;
      datesEl.innerHTML = state.ci && state.co ? `<strong>${short(state.ci)} to ${short(state.co)}</strong> · ${plural(nights(state.ci, state.co), 'night')}`
        : state.ci ? `Check-in <strong>${short(state.ci)}</strong>. Now choose check-out.` : 'Choose your check-in date';
      $$('[data-bk-step]', bk).forEach(row => {
        const k = row.dataset.bkStep, [min, max] = LIMITS[k], cap = k === 'rooms' ? Math.min(max, state.adults) : max;
        $('output', row).textContent = state[k];
        $('[data-dec]', row).disabled = state[k] <= min;
        $('[data-inc]', row).disabled = state[k] >= cap;
      });
    };
    subs.add(() => { if (!bk.hidden) draw(); });
    const clearAlert = () => { noteEl.classList.remove('is-alert'); noteEl.innerHTML = noteHTML; };
    grid.addEventListener('click', e => {
      const b = e.target.closest('.cal__day'); if (!b || b.disabled) return;
      const dt = fromIso(b.dataset.date);
      if (!state.ci || state.co || dt <= state.ci) { state.ci = dt; state.co = null; } else state.co = dt;
      focusD = dt; clearAlert(); commit();
      const nb = $(`[data-date="${iso(dt)}"]`, grid); if (nb) nb.focus({ preventScroll: true });
      if (state.ci && state.co) track('booking_dates', { nights: nights(state.ci, state.co), from: 'panel' });
    });
    grid.addEventListener('pointerover', e => {
      if (!state.ci || state.co) return;
      $$('.in-preview', grid).forEach(x => x.classList.remove('in-preview'));
      const b = e.target.closest('.cal__day'); if (!b || b.disabled) return;
      const hov = fromIso(b.dataset.date); if (hov <= state.ci) return;
      $$('.cal__day', grid).forEach(x => { const t = fromIso(x.dataset.date); if (t > state.ci && t <= hov) x.classList.add('in-preview'); });
    });
    grid.addEventListener('pointerleave', () => $$('.in-preview', grid).forEach(x => x.classList.remove('in-preview')));
    grid.addEventListener('keydown', e => {
      const b = e.target.closest('.cal__day'); if (!b) return;
      const step = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 7, ArrowUp: -7 }[e.key];
      if (step === undefined) return;
      e.preventDefault();
      let n = addDays(fromIso(b.dataset.date), step);
      if (n < today) n = today; if (n > maxDate) n = maxDate;
      focusD = n;
      if (n.getMonth() !== view.getMonth() || n.getFullYear() !== view.getFullYear()) view = new Date(n.getFullYear(), n.getMonth(), 1);
      draw();
      const nb = $(`[data-date="${iso(n)}"]`, grid); if (nb) nb.focus();
    });
    prevB.addEventListener('click', () => { view = new Date(view.getFullYear(), view.getMonth() - 1, 1); focusD = null; draw(); });
    nextB.addEventListener('click', () => { view = new Date(view.getFullYear(), view.getMonth() + 1, 1); focusD = null; draw(); });
    bk.addEventListener('click', e => {
      const row = e.target.closest('[data-bk-step]');
      if (!row || !e.target.closest('[data-inc], [data-dec]')) return;
      const k = row.dataset.bkStep, [min, max] = LIMITS[k], cap = k === 'rooms' ? Math.min(max, state.adults) : max;
      state[k] = Math.max(min, Math.min(cap, state[k] + (e.target.closest('[data-inc]') ? 1 : -1)));
      if (state.rooms > state.adults) state.rooms = state.adults;
      commit();
    });
    const setTab = name => {
      tabs.forEach(t => { const on = t.dataset.bkTab === name; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; });
      panes.forEach(p => { p.hidden = p.dataset.bkPane !== name; });
    };
    tabs.forEach(t => t.addEventListener('click', () => setTab(t.dataset.bkTab)));
    $('[role="tablist"]', bk).addEventListener('keydown', e => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const i = tabs.findIndex(t => t.getAttribute('aria-selected') === 'true');
      const n = tabs[(i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
      setTab(n.dataset.bkTab); n.focus();
    });
    const close = (restore = true) => {
      if (bk.hidden || !bk.classList.contains('is-open')) return;
      bk.classList.remove('is-open'); root.classList.remove('bk-open'); unlock();
      clearTimeout(closeT); closeT = setTimeout(() => { if (!bk.classList.contains('is-open')) bk.hidden = true; }, 560);
      if (restore && opener && opener.focus) opener.focus({ preventScroll: true });
    };
    const open = (tab = 'stay') => {
      clearTimeout(closeT); closePop(false);
      if (bk.classList.contains('is-open')) { setTab(tab); return; }
      opener = d.activeElement;
      view = new Date((state.ci || today).getFullYear(), (state.ci || today).getMonth(), 1); focusD = null;
      setTab(tab); clearAlert(); draw();
      bk.hidden = false; lock(); root.classList.add('bk-open');
      requestAnimationFrame(() => requestAnimationFrame(() => bk.classList.add('is-open')));
      setTimeout(() => { const b = tab === 'stay' ? $('.cal__day[tabindex="0"]', grid) : null; (b || panel).focus({ preventScroll: true }); }, 90);
      track('book_panel_open', { tab });
    };
    $$('[data-bk-close]', bk).forEach(b => b.addEventListener('click', () => close(!b.hasAttribute('data-open-modal'))));
    bk.addEventListener('keydown', e => { if (e.key === 'Escape') { e.preventDefault(); close(); } trap(panel, e); });
    $('[data-bk-go]', bk).addEventListener('click', () => {
      if (!state.ci || !state.co) {
        noteEl.classList.add('is-alert');
        noteEl.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#i-calendar"/></svg>Choose your check-in and check-out dates first.';
        const b = $('.cal__day[tabindex="0"]', grid); if (b) b.focus({ preventScroll: true });
        return;
      }
      track('booking_submit', { nights: nights(state.ci, state.co), adults: state.adults, rooms: state.rooms, from: 'panel' });
      close(false); handOff(url());
    });
    $$('[data-bk-open]').forEach(b => b.addEventListener('click', () => open(b.dataset.bkOpen || 'stay')));
    bkOpen = open;
  }

  /* One-tap dates under the booking bar (same rules as the calendar's quick picks) */
  const quickRange = kind => {
    const dow = today.getDay(); let a, b;
    if (kind === 'game') { const g = nextGame(); if (!g) return [null, null]; return [+g <= +today ? today : addDays(g, -1), addDays(g, 1)]; }
    if (kind === 'tonight') { a = today; b = addDays(today, 1); }
    else {
      const toFri = dow === 6 ? -1 : (5 - dow + 7) % 7;
      a = dow === 6 ? today : addDays(today, dow === 0 ? 5 : toFri);
      if (kind === 'next') a = addDays(dow === 6 ? addDays(today, -1) : a, 7);
      b = addDays(a, a.getDay() === 6 ? 1 : 2);
    }
    return [a, b];
  };
  const syncQuick = () => $$('[data-quick-date]').forEach(x => { const [a, b] = quickRange(x.dataset.quickDate); x.setAttribute('aria-pressed', String(!!(state.ci && state.co && +state.ci === +a && +state.co === +b))); });
  subs.add(syncQuick);
  d.addEventListener('click', e => {
    const q = e.target.closest('[data-quick-date]'); if (!q) return;
    const [a, b] = quickRange(q.dataset.quickDate);
    if (!a) return;
    state.ci = a; state.co = b; welcome = null;
    const f = q.closest('[data-booking]'), note = f && $('[data-booking-note]', f);
    if (note) note.classList.remove('is-alert');
    commit(); track('booking_quick_pick', { pick: q.dataset.quickDate, from: 'bar' });
  });
  /* Packers home game: one tap picks the night before to the morning after the next home game */
  const ngame = nextGame();
  if (ngame) $$('.booking__quick').forEach(row => {
    const b = d.createElement('button'); b.type = 'button'; b.className = 'qd-game'; b.dataset.quickDate = 'game'; b.setAttribute('aria-pressed', 'false');
    b.title = `Packers vs ${HOME_GAMES[iso(ngame)]}, ${short(ngame)}`; b.setAttribute('aria-label', `Packers home game: ${short(ngame)} vs ${HOME_GAMES[iso(ngame)]}`);
    b.innerHTML = '<i aria-hidden="true"></i>Home game'; row.appendChild(b);
  });
  /* Welcome back: clear the kept dates */
  d.addEventListener('click', e => { if (!e.target.closest('[data-forget-dates]')) return; welcome = null; state.ci = null; state.co = null; commit(); track('welcome_clear'); });
  syncQuick();

  /* Links that book: deep link when dates exist, otherwise open the date picker on this page */
  const openDates = () => {
    if (bkOpen) { bkOpen('stay'); return true; }
    const form = forms[0]; if (!form) return false;
    const rect = form.getBoundingClientRect();
    const go = () => { const b = $('[data-cal-open]', form); if (b) b.click(); };
    if (rect.top < 80 || rect.bottom > innerHeight) { form.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' }); setTimeout(go, reduce ? 0 : 650); }
    else go();
    return true;
  };
  commit();
  d.addEventListener('click', e => {
    const a = e.target.closest('[data-book-link]');
    if (!a) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    track('book_click', { from: a.dataset.from || 'link' });
    if (state.ci && state.co) { e.preventDefault(); handOff(url()); return; }
    if (forms[0]) { e.preventDefault(); openDates(); }
  });
  /* Game day planner: pick the next home game weekend, then show it in the date picker */
  const gdBtn = $('[data-from="gameday_planner"]');
  if (gdBtn && ngame) gdBtn.addEventListener('click', e => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault(); e.stopPropagation();
    const [a, b] = quickRange('game'); state.ci = a; state.co = b; welcome = null; commit();
    track('booking_quick_pick', { pick: 'game', from: 'gameday' });
    if (!openDates()) handOff(url());
  });

  /* ---------- Gallery: filters with view transitions, lightbox ---------- */
  const gallery = $('[data-gallery]');
  if (gallery) {
    const items = $$('.g-item', gallery);
    const small = matchMedia('(max-width: 900px)');
    let allShown = false, curF = 'all';
    const moreWrap = d.createElement('div'); moreWrap.className = 'gallery-more';
    moreWrap.innerHTML = `<button type="button" class="btn btn--ghost btn--sm"><span class="btn__text">Show all ${items.length} photos</span></button>`;
    gallery.after(moreWrap);
    const fold = () => { const on = small.matches && !allShown && curF === 'all'; items.forEach((it, i) => it.classList.toggle('is-folded', on && i >= 6)); moreWrap.hidden = !on; };
    $('button', moreWrap).addEventListener('click', () => { allShown = true; fold(); if (items[6]) items[6].focus({ preventScroll: true }); track('gallery_more'); });
    if (small.addEventListener) small.addEventListener('change', fold);
    fold();
    $$('[data-filter]').forEach(btn => btn.addEventListener('click', () => {
      const f = btn.dataset.filter;
      const apply = () => {
        $$('[data-filter]').forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
        items.forEach(it => { it.hidden = f !== 'all' && !it.dataset.cat.split(' ').includes(f); });
        curF = f; fold();
      };
      apply();
      if (!reduce) { gallery.classList.remove('is-filtering'); void gallery.offsetWidth; gallery.classList.add('is-filtering'); }
      track('gallery_filter', { filter: f });
    }));
    const lb = $('#lightbox');
    const lbImg = $('img', lb), lbCap = $('.lightbox__cap', lb), lbCount = $('[data-lb-count]', lb);
    let list = [], idx = 0, opener = null;
    const show = i => {
      idx = (i + list.length) % list.length;
      const it = list[idx], im = $('img', it);
      lbImg.classList.remove('is-ready'); lbImg.alt = im.alt; lbImg.decoding = 'async';
      const src = it.dataset.full; lbImg.src = src;
      (lbImg.decode ? lbImg.decode() : Promise.resolve()).catch(() => {}).then(() => { if (lbImg.getAttribute('src') === src) lbImg.classList.add('is-ready'); });
      [list[(idx + 1) % list.length], list[(idx - 1 + list.length) % list.length]].forEach(n => { if (n) { const pre = new Image(); pre.decoding = 'async'; pre.src = n.dataset.full; } });
      lbCap.textContent = it.dataset.caption || im.alt;
      lbCount.textContent = `${idx + 1} / ${list.length}`;
    };
    items.forEach(it => it.addEventListener('click', () => { list = items.filter(x => !x.hidden); opener = it; show(list.indexOf(it)); lb.show(); lock(); setTimeout(() => $('[data-lb-close]', lb).focus({ preventScroll: true }), 30); track('gallery_open'); }));
    $('[data-lb-prev]', lb).addEventListener('click', () => show(idx - 1));
    $('[data-lb-next]', lb).addEventListener('click', () => show(idx + 1));
    $('[data-lb-close]', lb).addEventListener('click', () => lb.close());
    lb.addEventListener('close', () => { unlock(); if (opener) opener.focus({ preventScroll: true }); });
    lb.addEventListener('keydown', e => { if (e.key === 'ArrowRight') show(idx + 1); if (e.key === 'ArrowLeft') show(idx - 1); if (e.key === 'Escape') { e.preventDefault(); lb.close(); } trap(lb, e); });
    let sx = null; const stageEl = $('.lightbox__stage', lb);
    stageEl.addEventListener('pointerdown', e => { sx = e.clientX; });
    stageEl.addEventListener('pointerup', e => { if (sx === null) return; const dx = e.clientX - sx; if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1)); sx = null; });
    stageEl.addEventListener('click', e => { if (e.target === stageEl) lb.close(); });
  }

  /* ---------- Modal + forms (demo only) ---------- */
  const openModal = id => { const dlg = d.getElementById(id); if (dlg && !dlg.open) { dlg.showModal(); track('modal_open', { id }); } };
  $$('[data-open-modal]').forEach(btn => {
    const dlg = d.getElementById(btn.dataset.openModal);
    if (!dlg) return;
    btn.addEventListener('click', () => openModal(dlg.id));
    if (!dlg.dataset.bound) {
      dlg.dataset.bound = '1';
      dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
      $$('[data-modal-close]', dlg).forEach(c => c.addEventListener('click', () => dlg.close()));
    }
  });
  $$('[data-validate]').forEach(form => {
    const rules = {
      name: v => v.trim().length >= 2 || 'Please enter your name.',
      email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || 'Please enter an email address like name@example.com.',
      phone: v => v.replace(/\D/g, '').length >= 10 || 'Please enter a 10 digit phone number.',
      guests: v => !v || (+v >= 1 && +v <= 240) || 'Our banquet hall seats up to 240 guests.'
    };
    const check = input => {
      const field = input.closest('.field'), err = $('.field__error', field);
      const rule = rules[input.dataset.rule];
      let res = true;
      if (input.required && !input.value.trim()) res = input.dataset.empty || 'This field is required.';
      else if (rule) res = rule(input.value);
      const bad = res !== true;
      field.classList.toggle('is-invalid', bad);
      input.setAttribute('aria-invalid', String(bad));
      if (err) err.textContent = bad ? res : '';
      return !bad;
    };
    const inputs = $$('input:not([type="hidden"]), select, textarea', form).filter(i => !i.closest('.hp'));
    inputs.forEach(i => {
      i.addEventListener('blur', () => { if (i.value || i.closest('.field').classList.contains('is-invalid')) check(i); });
      i.addEventListener('input', () => { if (i.closest('.field').classList.contains('is-invalid')) check(i); });
    });
    const tel = $('input[type="tel"]', form);
    if (tel) tel.addEventListener('input', () => {
      const dg = tel.value.replace(/\D/g, '').replace(/^1(?=\d{10})/, '').slice(0, 10);
      if (!dg) return;
      tel.value = dg.length < 4 ? dg : dg.length < 7 ? `(${dg.slice(0, 3)}) ${dg.slice(3)}` : `(${dg.slice(0, 3)}) ${dg.slice(3, 6)}-${dg.slice(6)}`;
    });
    form.addEventListener('submit', e => {
      e.preventDefault();
      if ($('.hp input', form).value) return;
      const bad = inputs.filter(i => !check(i));
      const status = $('[data-form-status]', form);
      if (bad.length) { bad[0].focus(); if (status) status.textContent = `Please fix ${plural(bad.length, 'field')} before sending.`; return; }
      const submit = $('[type="submit"]', form);
      submit.classList.add('is-loading'); submit.disabled = true; submit.setAttribute('aria-busy', 'true');
      track('form_submit', { form: form.dataset.validate });
      setTimeout(() => {
        const first = ($('[name="name"]', form).value.trim().split(' ')[0]) || 'there';
        const inDialog = !!form.closest('dialog');
        const box = d.createElement('div'); box.className = 'form-success'; box.setAttribute('role', 'status'); box.tabIndex = -1;
        box.innerHTML = `<span class="form-success__icon"><svg class="icon" aria-hidden="true"><use href="#i-check"/></svg></span><h3>Thanks, ${first.replace(/[<>&"]/g, '')}. ${inDialog ? 'Your enquiry is in.' : 'Your question is on its way.'}</h3><p class="muted">On the live site this goes straight to the front desk. To talk now, call <a href="tel:+19207856864">+1 (920) 785-6864</a>.</p>${inDialog ? '<button type="button" class="btn btn--dark btn--sm" data-modal-close><span class="btn__text">Close</span></button>' : ''}`;
        if (form.dataset.validate.indexOf('newsletter') === 0) box.innerHTML = `<span class="form-success__icon"><svg class="icon" aria-hidden="true"><use href="#i-check"/></svg></span><h3>You're on the list, ${first.replace(/[<>&"]/g, '')}.</h3><p class="muted">This is a demo form. On the live site it adds you to the hotel's email list.</p>`;
        const askCard = form.closest('.ask'); if (askCard) askCard.classList.add('is-done');
        form.replaceWith(box); box.focus({ preventScroll: true });
        const dlg = box.closest('dialog'), closeBtn = $('[data-modal-close]', box);
        if (closeBtn && dlg) closeBtn.addEventListener('click', () => dlg.close());
      }, 900);
    });
  });

  /* ---------- Front desk chat (scripted answers from verified hotel facts) ---------- */
  const chat = $('#chat'), launch = $('[data-chat-open]');
  if (chat && launch) {
    const log = $('[data-chat-log]', chat), chips = $('[data-chat-chips]', chat), cform = $('[data-chat-form]', chat), input = $('#chat-input', chat);
    const CALL = { label: 'Call the front desk', href: 'tel:+19207856864' };
    const DIRS = { label: 'Get directions', href: 'https://maps.app.goo.gl/7YpgLfPSgtXeDnzF8', ext: true };
    const intents = [
      { k: 'checkin', re: /check.?in|check.?out|what time|arriv|early|late|leave/i, a: 'Check-in is from 3:00 PM and check-out is by 11:00 AM. For early check-in or late check-out, give the front desk a call.', acts: [CALL] },
      { k: 'breakfast', re: /breakfast|morning|coffee|food|eat in/i, a: 'A free hot breakfast is served every morning in the breakfast area, included with every stay. Free coffee too.' },
      { k: 'pool', re: /pool|swim|whirlpool|hot ?tub|jacuzzi|spa/i, a: 'The indoor heated pool and whirlpool are in the hotel\'s skylit atrium, so they work in any weather. The front desk can confirm today\'s pool hours.', acts: [CALL] },
      { k: 'pets', re: /pet|dog|cat|puppy/i, a: 'Yes, the hotel is pet-friendly and pet-friendly rooms are available. Please call ahead for the pet policy and any fees.', acts: [CALL] },
      { k: 'parking', re: /park|car\b|bus|\bev\b|charg|tesla/i, a: 'There\'s outdoor parking on site, bus parking for groups and an electric vehicle charging station.' },
      { k: 'wifi', re: /wi.?fi|internet|wireless/i, a: 'WiFi is free throughout the hotel.' },
      { k: 'access', re: /accessib|wheelchair|roll.?in|\bada\b|disab|mobility/i, a: 'Accessible rooms with a roll-in shower and grab bars are available, with elevators and interior corridors. Call the front desk to match the room to your needs.', acts: [CALL] },
      { k: 'book', re: /book|rate|price|cost|how much|per night|nightly|\$|availab|reserv|cheap|deal|vacan/i, a: 'Live rates and booking are on choicehotels.com, the hotel\'s official booking site. Pick your dates and I\'ll take you there.', acts: [{ label: 'Choose dates', action: 'dates' }, CALL] },
      { k: 'rooms', re: /room|suite|king|queen|double|bed|kitchen|sofa/i, a: 'Choose from King rooms, Double Beds rooms, Suites with a separate living area (select suites have a kitchenette) and accessible rooms. Every room has a fridge, microwave, coffee maker and flat-screen TV.', acts: [{ label: 'Compare rooms', href: 'rooms.html' }] },
      { k: 'lambeau', re: /lambeau|packers|game|stadium|football/i, a: 'Lambeau Field is a short drive from the hotel. Book early for Packers home weekends, and there\'s bus parking for group trips.', acts: [{ label: 'Directions to Lambeau', href: 'https://www.google.com/maps/dir/?api=1&origin=321+S+Washington+St,+Green+Bay,+WI+54301&destination=Lambeau+Field,+Green+Bay,+WI', ext: true }] },
      { k: 'where', re: /where|address|direction|locat|map|airport|downtown|how (do|to) get/i, a: 'We\'re at 321 S Washington St, Green Bay, WI 54301, downtown by the Fox River. Austin Straubel International Airport is the nearest airport.', acts: [DIRS] },
      { k: 'events', re: /event|banquet|meeting|wedding|party|conference|reception|group/i, a: 'The banquet hall seats up to 240 guests, and a smaller space suits meetings and gatherings of up to 40. Kids pool parties are popular too.', acts: [{ label: 'Plan an event', action: 'event' }] },
      { k: 'id', re: /\bage\b|\bid\b|identif|18|license/i, a: 'All guests registering must be at least 18 years of age and must present valid picture identification.' },
      { k: 'human', re: /human|person|someone|call|phone|talk|agent|staff|desk/i, a: 'The front desk is open 24 hours. Call +1 (920) 785-6864 and they\'ll help right away.', acts: [CALL] },
      { k: 'thanks', re: /thank|great|perfect|awesome/i, a: 'You\'re welcome. Anything else I can help with?' },
      { k: 'hi', re: /^(hi|hey|hello|yo|good (morning|afternoon|evening))\b/i, a: 'Hi there. Ask me about check-in, breakfast, the pool, pets, parking, rooms or booking.' }
    ];
    const CHIPS = [['Check-in times', 'What time is check-in?'], ['Breakfast', 'Is breakfast included?'], ['Pool', 'Tell me about the pool'], ['Pets', 'Can I bring my dog?'], ['Parking', 'Is there parking?'], ['Game day', 'How far is Lambeau Field?'], ['Book a room', 'I want to book a room'], ['Talk to a person', 'Can I talk to someone?']];
    const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const scrollDown = () => { log.scrollTop = log.scrollHeight; };
    const add = (who, text, acts) => {
      const m = d.createElement('div'); m.className = `msg msg--${who}`;
      m.innerHTML = esc(text);
      if (acts && acts.length) {
        const row = d.createElement('div'); row.className = 'msg__actions';
        acts.forEach(a => {
          if (a.action) { const b = d.createElement('button'); b.type = 'button'; b.textContent = a.label; b.dataset.action = a.action; row.appendChild(b); }
          else { const l = d.createElement('a'); l.href = a.href; l.textContent = a.label; if (a.ext) { l.target = '_blank'; l.rel = 'noopener'; } row.appendChild(l); }
        });
        m.appendChild(row);
      }
      log.appendChild(m); scrollDown();
    };
    const reply = q => {
      const hit = intents.find(it => it.re.test(q));
      const typing = d.createElement('div'); typing.className = 'typing'; typing.innerHTML = '<span></span><span></span><span></span>'; typing.setAttribute('aria-label', 'Typing');
      log.appendChild(typing); scrollDown();
      setTimeout(() => {
        typing.remove();
        if (hit) add('bot', hit.a, hit.acts);
        else add('bot', 'I don\'t have an answer for that one yet. The front desk can help 24 hours a day.', [CALL]);
        track('chat_answer', { intent: hit ? hit.k : 'fallback' });
      }, reduce ? 0 : 650 + Math.min(600, q.length * 12));
    };
    const ask = q => { q = q.trim(); if (!q) return; add('me', q); reply(q); };
    CHIPS.forEach(([label, q]) => { const b = d.createElement('button'); b.type = 'button'; b.textContent = label; b.addEventListener('click', () => ask(q)); chips.appendChild(b); });
    let started = false;
    const open = () => {
      chat.classList.add('is-open'); chat.setAttribute('aria-hidden', 'false'); chat.inert = false; launch.setAttribute('aria-expanded', 'true');
      if (!started) { started = true; add('bot', 'Hi, I\'m the front desk assistant for Quality Inn & Suites Downtown. Ask me anything about your stay, or tap a question below.'); }
      setTimeout(() => input.focus({ preventScroll: true }), 120);
      if (isSheet()) lock();
      track('chat_open');
    };
    const close = (restore = true) => {
      if (!chat.classList.contains('is-open')) return;
      chat.classList.remove('is-open'); chat.setAttribute('aria-hidden', 'true'); chat.inert = true; launch.setAttribute('aria-expanded', 'false');
      if (isSheet()) unlock();
      if (restore) launch.focus();
    };
    chat.inert = true;
    launch.addEventListener('click', () => (chat.classList.contains('is-open') ? close() : open()));
    $$('[data-chat-open-inline]').forEach(b => b.addEventListener('click', open));
    $('[data-chat-close]', chat).addEventListener('click', () => close());
    chat.addEventListener('keydown', e => { if (e.key === 'Escape') { e.stopPropagation(); close(); } });
    cform.addEventListener('submit', e => { e.preventDefault(); ask(input.value); input.value = ''; });
    log.addEventListener('click', e => {
      const b = e.target.closest('[data-action]'); if (!b) return;
      if (b.dataset.action === 'dates') { close(false); if (!openDates()) location.href = BASE; }
      if (b.dataset.action === 'event') { close(false); if (d.getElementById('event-modal')) openModal('event-modal'); else location.href = 'index.html#events'; }
    });
    /* After 10 seconds, once per visit: a short message from the front desk beside the chat button. It waits until the
       chat button itself is on screen (so it never covers the booking bar), waits while anything else is open, shows
       typing dots first, and tucks itself away again after a while unless the visitor is reading it. */
    if (!store.get('qi-chat-greeted')) {
      const avatar = $('.chat__avatar img', chat);
      const nudge = d.createElement('aside');
      nudge.className = 'chat-nudge'; nudge.hidden = true; nudge.setAttribute('aria-label', 'Message from the front desk');
      nudge.innerHTML = '<button class="chat-nudge__x" type="button" aria-label="Dismiss message"><svg class="icon" aria-hidden="true"><use href="#i-x"/></svg></button>'
        + '<div class="chat-nudge__head"><span class="chat-nudge__av"><img src="' + (avatar ? avatar.getAttribute('src') : 'assets/brand/q-mark.svg') + '" alt="" width="22" height="19"></span><span class="chat-nudge__who"><b>Front desk</b><span>Quick answers about your stay</span></span></div>'
        + '<div class="chat-nudge__body"><span class="chat-nudge__dots" aria-hidden="true"><span></span><span></span><span></span></span><p class="chat-nudge__msg" aria-live="polite"></p>'
        + '<div class="chat-nudge__chips" role="group" aria-label="Suggested questions"><button type="button" data-nudge-q="What time is check-in?">Check-in time</button><button type="button" data-nudge-q="Is breakfast included?">Breakfast</button><button type="button" data-nudge-q="Is there parking?">Parking</button></div></div>';
      d.body.appendChild(nudge);
      const msg = $('.chat-nudge__msg', nudge);
      let due = false, shown = false, tries = 0, hideT = 0, reading = false, timer = 0, lastBusy = 0;
      const later = ms => { clearTimeout(timer); timer = setTimeout(showN, ms); };
      /* remember when the last pop-up, panel or cookie banner closed, so the message never lands right on top of it */
      let wasBusy = false;
      const watchBusy = () => { const b = d.body.classList.contains('is-locked') || root.classList.contains('consent-open'); if (b || wasBusy) lastBusy = Date.now(); wasBusy = b; };
      const busyObs = new MutationObserver(watchBusy);
      busyObs.observe(d.body, { attributes: true, attributeFilter: ['class'] }); busyObs.observe(root, { attributes: true, attributeFilter: ['class'] });
      watchBusy();
      const busyN = () => d.querySelector('.pop.is-open, .chat.is-open, .drawer.is-open, dialog[open], .handoff.is-on, .promo.is-open, .bk.is-open, .news.is-open') || root.classList.contains('consent-open') || d.body.classList.contains('is-locked') || d.hidden;
      const hideN = why => {
        if (!nudge.classList.contains('is-on')) return;
        clearTimeout(hideT); nudge.classList.remove('is-on');
        setTimeout(() => { if (!nudge.classList.contains('is-on')) nudge.hidden = true; }, 450);
        if (why) track('chat_nudge', { result: why });
      };
      const armHide = ms => { clearTimeout(hideT); hideT = setTimeout(() => { if (reading) armHide(2500); else hideN('timeout'); }, ms); };
      const showN = () => {
        if (shown || !due || chat.classList.contains('is-open') || !launch.classList.contains('is-on')) return;
        /* while something else is open, check again each second; once it closes, leave four seconds of breathing room */
        if (busyN()) { lastBusy = Date.now(); if (++tries < 180) later(1000); return; }
        const rest = lastBusy ? 4000 - (Date.now() - lastBusy) : 0;
        if (rest > 0) { later(rest); return; }
        shown = true; store.set('qi-chat-greeted', 1); busyObs.disconnect();
        nudge.hidden = false;
        requestAnimationFrame(() => requestAnimationFrame(() => nudge.classList.add('is-on')));
        const type = () => {
          msg.textContent = 'Hi there. Planning a stay? Ask me about check-in, breakfast, parking or the pool.';
          nudge.classList.add('is-typed');
          launch.classList.add('is-pinged'); setTimeout(() => launch.classList.remove('is-pinged'), 700);
        };
        if (reduce) type(); else setTimeout(type, 1100);
        armHide(12000);
        track('chat_nudge', { result: 'shown' });
        if (matchMedia('(max-width: 900px)').matches) {
          const y0 = scrollY;
          const away = () => { if (Math.abs(scrollY - y0) > innerHeight * .9) { removeEventListener('scroll', away); hideN('scrolled'); } };
          addEventListener('scroll', away, { passive: true });
        }
      };
      setTimeout(() => { due = true; showN(); }, 10000);
      new MutationObserver(() => {
        if (launch.getAttribute('aria-expanded') === 'true') { hideN(); return; }
        if (!shown) { if (due && launch.classList.contains('is-on')) later(800); }
        else if (!launch.classList.contains('is-on')) hideN();
      }).observe(launch, { attributes: true, attributeFilter: ['class', 'aria-expanded'] });
      $('.chat-nudge__x', nudge).addEventListener('click', () => { hideN('dismissed'); launch.focus({ preventScroll: true }); });
      $$('[data-nudge-q]', nudge).forEach(b => b.addEventListener('click', () => { hideN('asked'); open(); ask(b.dataset.nudgeQ); }));
      $('.chat-nudge__body', nudge).addEventListener('click', e => { if (e.target.closest('button')) return; hideN('opened'); open(); });
      nudge.addEventListener('pointerenter', () => { reading = true; });
      nudge.addEventListener('pointerleave', () => { reading = false; });
      nudge.addEventListener('focusin', () => { reading = true; });
      nudge.addEventListener('focusout', () => { reading = false; });
      nudge.addEventListener('keydown', e => { if (e.key === 'Escape') { hideN('dismissed'); launch.focus({ preventScroll: true }); } });
    }
  }

  /* ---------- Rooms page: per-room gallery and sub-nav ---------- */
  $$('[data-room-gallery]').forEach(g => {
    const imgs = $$('.room__stage img', g), thumbs = $$('.room__thumbs button', g), count = $('.room__count', g);
    const set = i => {
      imgs.forEach((im, j) => im.classList.toggle('is-active', j === i));
      thumbs.forEach((t, j) => t.setAttribute('aria-pressed', String(j === i)));
      if (count) count.textContent = `${i + 1} / ${imgs.length}`;
      if (imgs[i].loading === 'lazy') imgs[i].loading = 'eager';
    };
    thumbs.forEach((t, i) => t.addEventListener('click', () => set(i)));
  });
  const subnav = $('[data-subnav]');
  if (subnav) {
    const links = $$('a', subnav);
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        links.forEach(l => l.classList.toggle('is-active', l.getAttribute('href') === '#' + e.target.id));
        const act = links.find(l => l.classList.contains('is-active'));
        /* slide only the bar sideways: scrollIntoView would also re-aim the page and stop a jump halfway */
        const bar = $('.subnav__inner', subnav);
        if (act && bar && bar.scrollWidth > bar.clientWidth) {
          const dx = act.getBoundingClientRect().left - bar.getBoundingClientRect().left - (bar.clientWidth - act.offsetWidth) / 2;
          bar.scrollBy({ left: dx, behavior: reduce ? 'auto' : 'smooth' });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    links.forEach(l => { const s = d.querySelector(l.getAttribute('href')); if (s) io.observe(s); });
  }

  /* ---------- Mobile action bar and back to top ---------- */
  const bar = $('.mobile-bar');
  const firstBooking = forms[0];
  const launchBtn = $('[data-chat-open]');
  const fab = $('.fab-book');
  /* The centered button steps aside while the footer's own Check rates button is in view */
  const footTop = $('.footer');
  if (fab && footTop) new IntersectionObserver(([e]) => fab.classList.toggle('is-off', e.isIntersecting)).observe(footTop);
  if (bar && firstBooking) {
    /* measured on scroll, so a jump past the booking bar (a nav link with reduced motion, the End key, a restored scroll position) still brings them in */
    let bt = false;
    const bUpd = () => { bt = false; const on = firstBooking.getBoundingClientRect().bottom < 0; bar.classList.toggle('is-on', on); if (launchBtn) launchBtn.classList.toggle('is-on', on); if (fab) fab.classList.toggle('is-on', on); };
    addEventListener('scroll', () => { if (!bt) { bt = true; requestAnimationFrame(bUpd); } }, { passive: true });
    addEventListener('resize', bUpd); requestAnimationFrame(bUpd); /* first reading after the first frame, when layout is already done */
  }
  else { if (bar) bar.classList.add('is-on'); if (launchBtn) launchBtn.classList.add('is-on'); if (fab) fab.classList.add('is-on'); }
  const toTop = $('.to-top');
  if (toTop) {
    /* shown by scroll position, so a jump, the End key or a restored scroll position cannot skip it */
    let tt = false;
    const ttUpd = () => { tt = false; toTop.classList.toggle('is-on', scrollY > innerHeight * 1.5); };
    addEventListener('scroll', () => { if (!tt) { tt = true; requestAnimationFrame(ttUpd); } }, { passive: true });
    addEventListener('resize', ttUpd); ttUpd();
    toTop.addEventListener('click', () => { scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); const sk = $('.skip-link'); if (sk) sk.focus({ preventScroll: true }); });
  }

  /* ---------- Cookie consent (remembered on this device; analytics and ads load only after consent) ---------- */
  const consent = $('#consent');
  if (consent) {
    const lget = k => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } };
    const lset = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage blocked */ } };
    let gtagOn = false;
    const loadScript = src => { const s = d.createElement('script'); s.async = true; s.src = src; d.head.appendChild(s); };
    const loadTags = c => {
      if (!c || !TAGS_ON) return;
      const g = v => (v ? 'granted' : 'denied');
      const consentState = { analytics_storage: g(c.analytics), ad_storage: g(c.marketing), ad_user_data: g(c.marketing), ad_personalization: g(c.marketing) };
      if (gtagOn) window.gtag('consent', 'update', consentState);
      else if ((TAGS.ga4 && c.analytics) || (TAGS.ads && c.marketing)) {
        window.dataLayer = window.dataLayer || [];
        window.gtag = function () { window.dataLayer.push(arguments); };
        window.gtag('consent', 'default', consentState);
        window.gtag('js', new Date());
        if (TAGS.ga4) window.gtag('config', TAGS.ga4);
        if (TAGS.ads) window.gtag('config', TAGS.ads);
        loadScript('https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(TAGS.ga4 || TAGS.ads));
        gtagOn = true;
      }
      if (TAGS.clarity && c.analytics && typeof window.clarity !== 'function') {
        window.clarity = function () { (window.clarity.q = window.clarity.q || []).push(arguments); };
        loadScript('https://www.clarity.ms/tag/' + encodeURIComponent(TAGS.clarity));
      }
    };
    loadTags(lget('qi-consent'));
    const prefs = $('#consent-prefs'), prefBtn = $('[data-consent-prefs]', consent), tA = $('#c-analytics'), tM = $('#c-marketing');
    const setPrefs = on => { prefs.hidden = !on; prefBtn.setAttribute('aria-expanded', String(on)); prefBtn.textContent = on ? 'Save my choices' : 'Preferences'; };
    const show = withPrefs => {
      const cur = lget('qi-consent') || {};
      tA.checked = !!cur.analytics; tM.checked = !!cur.marketing;
      setPrefs(!!withPrefs);
      consent.hidden = false; root.classList.add('consent-open');
      requestAnimationFrame(() => requestAnimationFrame(() => consent.classList.add('is-on')));
      if (withPrefs) setTimeout(() => tA.focus({ preventScroll: true }), 120);
    };
    const hide = () => {
      consent.classList.remove('is-on'); root.classList.remove('consent-open');
      setTimeout(() => { if (!consent.classList.contains('is-on')) consent.hidden = true; }, 450);
    };
    const save = (analytics, marketing) => {
      lset('qi-consent', { analytics, marketing, at: new Date().toISOString() });
      hide(); track('consent', { analytics, marketing });
      loadTags({ analytics, marketing });
    };
    $$('[data-consent]', consent).forEach(b => b.addEventListener('click', () => (b.dataset.consent === 'all' ? save(true, true) : save(false, false))));
    prefBtn.addEventListener('click', () => { if (prefs.hidden) { setPrefs(true); tA.focus(); } else save(tA.checked, tM.checked); });
    $$('[data-consent-open]').forEach(b => b.addEventListener('click', () => show(true)));
    if (!lget('qi-consent')) {
      if (firstBooking) {
        const io = new IntersectionObserver(([e]) => { if (!e.isIntersecting && e.boundingClientRect.top < 0) { show(false); io.disconnect(); } });
        io.observe(firstBooking);
      } else setTimeout(() => show(false), 1400);
    }
  }

  /* ---------- Atrium tour: hotspots on the pool photo ---------- */
  const tour = $('[data-tour]');
  if (tour) {
    const spots = $$('.hotspot', tour), cards = $$('.hs-card', tour), chips = $$('[data-tour-chip]');
    let cur = -1, hoverAt = 0;
    const set = (i, keep) => {
      cur = i === cur && !keep ? -1 : i;
      spots.forEach((s, j) => s.setAttribute('aria-expanded', String(j === cur)));
      cards.forEach((c, j) => c.classList.toggle('is-open', j === cur));
      chips.forEach((c, j) => c.setAttribute('aria-pressed', String(j === cur)));
      if (cur >= 0) track('atrium_spot', { i: cur });
    };
    spots.forEach((s, i) => { s.style.setProperty('--i', i); s.addEventListener('click', e => { e.stopPropagation(); set(i, Date.now() - hoverAt < 700); }); if (fine) s.addEventListener('pointerenter', () => { if (cur !== i) { hoverAt = Date.now(); set(i, true); } }); });
    chips.forEach((c, i) => c.addEventListener('click', () => set(i)));
    tour.addEventListener('click', e => { if (!e.target.closest('.hotspot, .hs-card') && cur >= 0) set(cur); });
    tour.addEventListener('keydown', e => { if (e.key === 'Escape' && cur >= 0) set(cur); });
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { tour.classList.add('is-in'); io.disconnect(); if (!fine) return; setTimeout(() => { if (cur < 0) set(0); }, 900); } }, { threshold: .45 });
    io.observe(tour);
  }

  /* ---------- 3D tilt with glare on photo cards ---------- */
  if (fine && !reduce) {
    $$('[data-tilt]').forEach(el => {
      const glare = d.createElement('span'); glare.className = 'tilt-glare'; glare.setAttribute('aria-hidden', 'true'); el.appendChild(glare);
      const lift = el.dataset.tilt === 'lift' ? ' translateY(-6px)' : '';
      let raf = 0;
      el.addEventListener('pointermove', e => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
          el.style.transition = 'transform .12s linear';
          el.style.transform = `perspective(900px) rotateX(${(.5 - y) * 7}deg) rotateY(${(x - .5) * 9}deg)${lift}`;
          glare.style.setProperty('--gx', x * 100 + '%'); glare.style.setProperty('--gy', y * 100 + '%');
          raf = 0;
        });
      });
      el.addEventListener('pointerleave', () => { el.style.transition = 'transform .7s cubic-bezier(.22,1,.36,1)'; el.style.transform = ''; });
    });
  }

  /* ---------- Stay prompt: once per session, after 11 s, only when nothing else is open ---------- */
  const promo = $('#promo');
  if (promo && !store.get('qi-promo')) {
    const card = $('.promo__card', promo);
    let opener = null;
    const busy = () => d.querySelector('.pop.is-open, .chat.is-open, .drawer.is-open, dialog[open], .handoff.is-on, .bk.is-open, .news.is-open, .chat-nudge.is-on') || (state.ci && state.co) || ['INPUT', 'TEXTAREA', 'SELECT'].includes((d.activeElement || {}).tagName) || d.hidden;
    const close = () => {
      promo.classList.remove('is-open'); unlock();
      setTimeout(() => { promo.hidden = true; }, 420);
      if (opener && opener.focus) opener.focus({ preventScroll: true });
    };
    const open = () => {
      if (busy()) { setTimeout(tryOpen, 4000); return; }
      store.set('qi-promo', 1); opener = d.activeElement;
      promo.hidden = false; lock();
      requestAnimationFrame(() => requestAnimationFrame(() => promo.classList.add('is-open')));
      setTimeout(() => card.focus({ preventScroll: true }), 120);
      track('promo_open');
    };
    let tries = 0;
    const tryOpen = () => { if (++tries > 6 || store.get('qi-promo') === 2) return; open(); };
    setTimeout(tryOpen, 11000);
    $$('[data-promo-close]', promo).forEach(b => b.addEventListener('click', () => { close(); track('promo_dismiss'); }));
    promo.addEventListener('click', e => { if (!card.contains(e.target)) close(); });
    promo.addEventListener('keydown', e => { if (e.key === 'Escape') { e.preventDefault(); close(); } trap(card, e); });
    const go = $('[data-promo-go]', promo), goLabel = $('[data-promo-go-label]', promo);
    const fGo = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    subs.add(() => {
      const has = state.ci && state.co;
      goLabel.textContent = has ? `See rates · ${fGo.format(state.ci)} to ${fGo.format(state.co)}` : 'Choose your dates';
      if (has && promo.classList.contains('is-open')) { go.classList.remove('is-ready'); void go.offsetWidth; go.classList.add('is-ready'); }
    });
    go.addEventListener('click', () => {
      if (state.ci && state.co) { track('promo_rates'); close(); handOff(url()); return; }
      close(); track('promo_dates'); setTimeout(() => { if (!openDates()) location.href = BASE; }, 300);
    });
    /* Anyone who already opened the booking widget does not need the prompt */
    $$('[data-cal-open], [data-guests-open]').forEach(b => b.addEventListener('click', () => { if (!promo.classList.contains('is-open')) store.set('qi-promo', 2); }, { once: true }));
  }

  /* ---------- Events: each use swaps the photo ---------- */
  const evRoot = $('[data-ev-root]');
  if (evRoot) {
    const rows = $$('.ev__row', evRoot), pics = $$('.ev__stage img', evRoot), cap = $('[data-ev-cap]', evRoot), num = $('[data-ev-n]', evRoot);
    let cur = 0;
    const setEv = i => {
      if (i === cur) return; cur = i;
      rows.forEach((r, k) => r.setAttribute('aria-pressed', String(k === i)));
      pics.forEach((p, k) => p.classList.toggle('is-on', k === i));
      if (cap) cap.textContent = rows[i].dataset.title;
      if (num) num.textContent = String(i + 1).padStart(2, '0');
      track('event_use', { i });
    };
    rows.forEach((r, i) => { r.addEventListener('click', () => setEv(i)); r.addEventListener('focus', () => setEv(i)); if (fine) r.addEventListener('pointerenter', () => setEv(i)); });
    /* Warm the other photos once the section is near, so a swap never shows an empty frame */
    new IntersectionObserver(([e], o) => { if (e.isIntersecting) { pics.forEach(p => { p.loading = 'eager'; }); o.disconnect(); } }, { rootMargin: '400px' }).observe(evRoot);
  }

  /* ---------- Newsletter card: once per session, only after 30 s, on a deep scroll or when the pointer leaves the page ---------- */
  const news = $('#news');
  if (news) {
    const card = $('.news__card', news), t0 = Date.now();
    let opener = null, ticking = false;
    const busy = () => d.querySelector('.pop.is-open, .chat.is-open, .drawer.is-open, dialog[open], .handoff.is-on, .promo.is-open, .bk.is-open, .chat-nudge.is-on') || d.hidden;
    const close = () => {
      if (!news.classList.contains('is-open')) return;
      news.classList.remove('is-open'); unlock();
      setTimeout(() => { if (!news.classList.contains('is-open')) news.hidden = true; }, 420);
      if (opener && opener.focus) opener.focus({ preventScroll: true });
    };
    const onScroll = () => {
      if (ticking) return; ticking = true;
      requestAnimationFrame(() => { ticking = false; const span = d.documentElement.scrollHeight - innerHeight; if (span > 0 && scrollY / span > .6) open('scroll'); });
    };
    const onLeave = e => { if (!e.relatedTarget && e.clientY <= 0) open('exit'); };
    const off = () => { removeEventListener('scroll', onScroll); d.removeEventListener('mouseout', onLeave); };
    function open(why) {
      if (store.get('qi-news')) { off(); return; }
      if (busy() || Date.now() - t0 < 30000) return;
      store.set('qi-news', 1); off(); opener = d.activeElement;
      news.hidden = false; lock();
      requestAnimationFrame(() => requestAnimationFrame(() => news.classList.add('is-open')));
      setTimeout(() => { const i = $('input', card); (fine && i ? i : card).focus({ preventScroll: true }); }, 160);
      track('news_open', { why });
    }
    if (!store.get('qi-news')) { addEventListener('scroll', onScroll, { passive: true }); if (fine) d.addEventListener('mouseout', onLeave); }
    $$('[data-news-close]', news).forEach(b => b.addEventListener('click', close));
    news.addEventListener('click', e => { if (!card.contains(e.target)) close(); });
    news.addEventListener('keydown', e => { if (e.key === 'Escape') { e.preventDefault(); close(); } trap(card, e); });
    /* Someone who signs up in the footer never sees the card */
    $$('form[data-validate^="newsletter"]').forEach(f => f.addEventListener('submit', () => store.set('qi-news', 1)));
  }

  /* ---------- Live local time in the hero ---------- */
  const clockEl = $('[data-clock-time]');
  if (clockEl) {
    const fClock = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/Chicago' });
    const tickClock = () => { clockEl.textContent = fClock.format(new Date()); };
    tickClock(); setInterval(tickClock, 20000);
  }

  /* ---------- The stay: steps advance on their own, hover or tap to choose ---------- */
  const story2 = $('[data-story2]');
  if (story2) {
    const sBtns = $$('.story2__step', story2), sPics = $$('.story2__stage img', story2), sCap = $('[data-story-cap]', story2), sStage = $('#story-stage');
    const DUR = 5500; story2.style.setProperty('--story-dur', DUR + 'ms');
    let sCur = 0, sT = 0, sVis = false, sHover = false;
    const sPlan = () => { clearTimeout(sT); if (sVis && !sHover && !reduce) sT = setTimeout(() => sSet((sCur + 1) % sBtns.length), DUR); };
    const sSet = (i, user) => {
      sCur = i;
      sBtns.forEach((b, k) => { b.setAttribute('aria-selected', String(k === i)); b.tabIndex = k === i ? 0 : -1; });
      sPics.forEach((p, k) => p.classList.toggle('is-on', k === i));
      if (sCap) sCap.textContent = sBtns[i].dataset.cap;
      if (sStage) sStage.setAttribute('aria-labelledby', sBtns[i].id);
      const bar = $('.story2__bar i', sBtns[i]); if (bar) { bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = ''; }
      if (user) track('story_step', { i });
      sPlan();
    };
    sBtns.forEach((b, i) => { b.addEventListener('click', () => sSet(i, true)); if (fine) b.addEventListener('pointerenter', () => { if (sCur !== i) sSet(i, true); }); });
    story2.addEventListener('pointerenter', () => { sHover = true; story2.classList.add('is-paused'); clearTimeout(sT); });
    story2.addEventListener('pointerleave', () => { sHover = false; story2.classList.remove('is-paused'); sSet(sCur); });
    $('[role="tablist"]', story2).addEventListener('keydown', e => {
      const k = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key]; if (!k) return;
      e.preventDefault(); const n = (sCur + k + sBtns.length) % sBtns.length; sSet(n, true); sBtns[n].focus();
    });
    new IntersectionObserver(([e]) => { sVis = e.isIntersecting; if (sVis) sPlan(); else clearTimeout(sT); }, { threshold: .35 }).observe(story2);
  }

  /* ---------- Game day planner tabs ---------- */
  const gw = $('[data-gw]');
  if (gw) {
    const gTabs = $$('[role="tab"]', gw), gPanels = $$('[data-gw-panel]', gw);
    const gSet = i => { gTabs.forEach((t, k) => { t.setAttribute('aria-selected', String(k === i)); t.tabIndex = k === i ? 0 : -1; }); gPanels.forEach((p, k) => { p.hidden = k !== i; }); };
    gTabs.forEach((t, i) => t.addEventListener('click', () => { gSet(i); track('gameday_plan', { i }); }));
    $('[role="tablist"]', gw).addEventListener('keydown', e => {
      const k = { ArrowRight: 1, ArrowLeft: -1 }[e.key]; if (!k) return;
      const i = gTabs.findIndex(t => t.getAttribute('aria-selected') === 'true'), n = (i + k + gTabs.length) % gTabs.length; gSet(n); gTabs[n].focus();
    });
  }

  /* ---------- Back to top shows how far down the page you are ---------- */
  const topBtn = $('.to-top');
  if (topBtn && $('.to-top__ring', topBtn)) {
    let rt = false;
    const ringUpd = () => { rt = false; const span = d.documentElement.scrollHeight - innerHeight; topBtn.style.setProperty('--p', span > 0 ? Math.min(1, scrollY / span).toFixed(3) : 0); };
    addEventListener('scroll', () => { if (!rt) { rt = true; requestAnimationFrame(ringUpd); } }, { passive: true });
    requestAnimationFrame(ringUpd);
  }


  /* ---------- Room finder: three quick questions, one recommended room ---------- */
  const slots = $$('[data-finder]');
  if (slots.length) {
    const ic = id => `<svg class="icon" aria-hidden="true"><use href="#i-${id}"/></svg>`;
    const onRoomsPage = !!$('section.room#king');
    const ROOMS = {
      king: { name: 'King Room', img: 'assets/img/room-king-window-960.webp', w: 1280, h: 853, alt: 'King room with the bed facing the window', why: ['1 king bed', 'Best for business trips', 'Flat-screen TV, fridge and microwave'] },
      double: { name: 'Double Beds', img: 'assets/img/room-double-960.webp', w: 1440, h: 809, alt: 'Guest room with two beds and an armchair', why: ['2 beds', 'Room for the family', 'Best for game-day crews'] },
      suites: { name: 'Suite', img: 'assets/img/suite-king-bed-960.webp', w: 1280, h: 853, alt: 'Suite bedroom with a king bed', why: ['King bed plus a living area', 'Sofa and sitting area', 'Kitchenette in select suites'] },
      accessible: { name: 'Accessible room', img: 'assets/img/room-accessible-king-960.webp', w: 1280, h: 853, alt: 'Accessible guest room with a king bed', why: ['Roll-in shower', 'Grab bars', 'Elevator access'] }
    };
    slots.forEach((slot, n) => {
      const uid = 'finder-' + n;
      slot.innerHTML = `<div class="finder">
        <div class="finder__bar">
          <span class="finder__icon" aria-hidden="true">${ic('target')}</span>
          <p class="finder__ask"><strong>Not sure which room fits?</strong> <span>Three quick questions and we'll point you to the right one.</span></p>
          <button type="button" class="btn btn--dark btn--sm finder__go" aria-expanded="false" aria-controls="${uid}"><span class="btn__text">Find my room</span></button>
        </div>
        <div class="finder__body" id="${uid}" hidden>
          <ol class="finder__progress" aria-hidden="true"><li></li><li></li><li></li></ol>
          <p class="sr-only" aria-live="polite" data-f-live></p>
          <fieldset class="finder__step" data-f-step="who"><legend class="finder__q"><span>1 of 3</span>Who's coming?</legend>
            <div class="finder__opts"><button type="button" data-k="who" data-v="pair" aria-pressed="false">${ic('bed')}Just me, or two of us</button><button type="button" data-k="who" data-v="family" aria-pressed="false">${ic('users')}Family or friends</button><button type="button" data-k="who" data-v="group" aria-pressed="false">${ic('bus')}A team or a group</button></div>
          </fieldset>
          <fieldset class="finder__step" data-f-step="nights" hidden><legend class="finder__q"><span>2 of 3</span>How many nights?</legend>
            <div class="finder__opts"><button type="button" data-k="nights" data-v="short" aria-pressed="false">${ic('calendar')}1 or 2 nights</button><button type="button" data-k="nights" data-v="long" aria-pressed="false">${ic('clock')}3 nights or more</button></div>
            <button type="button" class="text-btn finder__back" data-f-back="who">Back</button>
          </fieldset>
          <fieldset class="finder__step" data-f-step="extra" hidden><legend class="finder__q"><span>3 of 3</span>Anything else? <small class="sr-only">Choose any that apply</small></legend>
            <div class="finder__opts"><button type="button" data-t="pet" aria-pressed="false">${ic('paw')}Bringing a pet</button><button type="button" data-t="access" aria-pressed="false">${ic('access')}Need an accessible room</button></div>
            <div class="finder__row"><button type="button" class="text-btn finder__back" data-f-back="nights">Back</button><button type="button" class="btn btn--dark btn--sm" data-f-show><span class="btn__text">Show my room</span></button></div>
          </fieldset>
          <div class="finder__result" data-f-result hidden></div>
        </div>
      </div>`;
      const f = $('.finder', slot), go = $('.finder__go', f), body = $('.finder__body', f), live = $('[data-f-live]', f), result = $('[data-f-result]', f);
      const steps = $$('[data-f-step]', f), bars = $$('.finder__progress li', f);
      const ans = { who: null, nights: null, pet: false, access: false };
      const order = ['who', 'nights', 'extra', 'result'];
      const show = name => {
        steps.forEach(s => { s.hidden = s.dataset.fStep !== name; });
        result.hidden = name !== 'result';
        bars.forEach((b, i) => b.classList.toggle('is-done', i < order.indexOf(name)));
        const step = steps.find(s => s.dataset.fStep === name);
        if (step) { live.textContent = $('legend', step).textContent; const first = $('.finder__opts button', step); if (first) first.focus({ preventScroll: true }); }
      };
      const reset = () => { ans.who = ans.nights = null; ans.pet = ans.access = false; $$('[aria-pressed]', f).forEach(b => b.setAttribute('aria-pressed', 'false')); };
      go.addEventListener('click', () => {
        const open = body.hidden; body.hidden = !open; go.setAttribute('aria-expanded', String(open));
        $('.btn__text', go).textContent = open ? 'Close' : 'Find my room';
        if (open) { reset(); show('who'); track('finder_open', { page: onRoomsPage ? 'rooms' : 'home' }); }
      });
      $$('[data-k]', f).forEach(b => b.addEventListener('click', () => {
        ans[b.dataset.k] = b.dataset.v;
        $$(`[data-k="${b.dataset.k}"]`, f).forEach(x => x.setAttribute('aria-pressed', String(x === b)));
        show(b.dataset.k === 'who' ? 'nights' : 'extra');
      }));
      $$('[data-t]', f).forEach(b => b.addEventListener('click', () => { ans[b.dataset.t] = !ans[b.dataset.t]; b.setAttribute('aria-pressed', String(ans[b.dataset.t])); }));
      $$('[data-f-back]', f).forEach(b => b.addEventListener('click', () => show(b.dataset.fBack)));
      $('[data-f-show]', f).addEventListener('click', () => {
        const key = ans.access ? 'accessible' : ans.nights === 'long' ? 'suites' : (ans.who === 'family' || ans.who === 'group') ? 'double' : 'king';
        const r = ROOMS[key], notes = [];
        if (key === 'accessible') notes.push('Accessible rooms are booked by phone, so the front desk can match the room to your needs.');
        if (ans.pet) notes.push('Pet-friendly rooms are available. Please call ahead for the pet policy and any fees.');
        if (ans.who === 'group') notes.push('Booking several rooms? The front desk can help on +1 (920) 785-6864, and there is bus parking on site.');
        if (key === 'double' && ans.who === 'family') notes.push('Want more space? Suites add a separate living area.');
        const details = onRoomsPage ? '#' + key : 'rooms.html#' + key;
        const primary = key === 'accessible'
          ? '<a class="btn btn--dark btn--sm" href="tel:+19207856864" data-event="call_finder"><span class="btn__text">Call to book</span></a>'
          : `<a class="btn btn--dark btn--sm" href="${url()}" target="_blank" rel="noopener" data-book-link data-from="finder_${key}"><span class="btn__text">Check rates</span></a>`;
        result.innerHTML = `<figure class="finder__media"><img src="${r.img}" width="${r.w}" height="${r.h}" alt="${r.alt}" decoding="async"></figure>
          <div class="finder__copy">
            <p class="finder__kicker">Your best fit</p>
            <h3 class="finder__name" tabindex="-1">${r.name}</h3>
            <ul class="finder__why">${r.why.map(w => `<li>${ic('check')}${w}</li>`).join('')}</ul>
            ${notes.map(t => `<p class="finder__note">${ic('info')}<span>${t}</span></p>`).join('')}
            <p class="finder__foot">Every stay includes a free hot breakfast and free WiFi.</p>
            <div class="finder__actions">${primary}<a class="link-arrow" href="${details}">Room details ${ic('arrow')}</a><button type="button" class="text-btn" data-f-restart>Start over</button></div>
          </div>`;
        show('result');
        live.textContent = `Your best fit: ${r.name}`;
        $('.finder__name', result).focus({ preventScroll: true });
        $('[data-f-restart]', result).addEventListener('click', () => { reset(); show('who'); });
        track('finder_result', { room: key, who: ans.who, nights: ans.nights, pet: ans.pet, access: ans.access });
      });
    });
  }

  /* ---------- Analytics hooks ---------- */
  d.addEventListener('click', e => { const t = e.target.closest('[data-event]'); if (t) track(t.dataset.event); });
})();
