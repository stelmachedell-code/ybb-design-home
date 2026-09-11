(() => {
  'use strict';
  const worksData = window.worksData;
  const scene = document.getElementById('scene-03');
  const hotspot = scene.querySelector('.hs-work-poster');
  const sticker = document.getElementById('work-poster-sticker');
  const stickerImage = sticker.querySelector('img');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const touch = matchMedia('(hover: none), (pointer: coarse)');
  const duration = value => reduced.matches ? 0 : value;
  const selector = document.createElement('nav');
  selector.className = 'work-selector';
  selector.id = 'work-selector';
  selector.setAttribute('aria-label', '选择作品');
  selector.setAttribute('aria-hidden', 'true');
  selector.inert = true;
  selector.innerHTML = worksData.map((work, i) => `<div class="work-entry"><button class="work-circle" data-work="${i}" data-work-id="${work.id}" aria-label="打开${work.title}">${work.circleLines ? work.circleLines.join('<br>') : work.shortLabel}</button><span class="work-entry-name">${work.englishTitle}</span></div>`).join('');
  scene.append(selector);
  hotspot.tabIndex = 0;
  hotspot.setAttribute('role', 'button');
  hotspot.setAttribute('aria-label', '展开作品入口');
  hotspot.setAttribute('aria-expanded', 'false');
  hotspot.setAttribute('aria-controls', selector.id);
  const entries = [...selector.children];
  let expanded = false, hideTimer, modalOpen = false;
  let stickerBounds;
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  function positionSelector() {
    const h = hotspot.getBoundingClientRect();
    const width = h.width * 1.3;
    const height = width * (stickerImage.naturalHeight / stickerImage.naturalWidth || 1);
    stickerBounds = {left: h.left + h.width * .55 - width / 2, right: h.left + h.width * .55 + width / 2,
      top: h.top + h.height * .45 - height / 2, bottom: h.top + h.height * .45 + height / 2};
    const mobile = innerWidth <= 600;
    const x = mobile ? (innerWidth - selector.offsetWidth) / 2 : clamp(stickerBounds.right + 22, 16, innerWidth - selector.offsetWidth - 20);
    const y = mobile ? clamp(stickerBounds.bottom + 24, 110, innerHeight - selector.offsetHeight - 104) : clamp(h.top + h.height * .35, 80, innerHeight - selector.offsetHeight - 24);
    selector.style.left = `${x}px`;
    selector.style.top = `${y}px`;
    const labelWidth = Math.max(...[...selector.querySelectorAll('.work-entry-name')].map(label => label.offsetWidth));
    selector.classList.toggle('labels-left', x + selector.offsetWidth + labelWidth + 20 > innerWidth - 16);
  }
  function showSelector() {
    clearTimeout(hideTimer); hideTimer = null;
    if (expanded || modalOpen) return;
    expanded = true;
    selector.inert = false;
    selector.setAttribute('aria-hidden', 'false');
    hotspot.setAttribute('aria-expanded', 'true');
    selector.style.visibility = 'visible';
    sticker.style.pointerEvents = 'auto';
    sticker.style.cursor = 'pointer';
    positionSelector();
    gsap.to(sticker, {scale: 1, rotation: 0, opacity: 1, duration: duration(.45), ease: 'back.out(1.7)', overwrite: true});
    gsap.fromTo(entries, {autoAlpha: 0, scale: .85, x: -8, y: 6}, {autoAlpha: 1, scale: 1, x: 0, y: 0, duration: duration(.32), stagger: reduced.matches ? 0 : .04, ease: 'power2.out', overwrite: true});
  }
  function hideSelector() {
    clearTimeout(hideTimer); hideTimer = null;
    if (!expanded || modalOpen) return;
    expanded = false;
    sticker.style.pointerEvents = 'none';
    selector.inert = true;
    selector.setAttribute('aria-hidden', 'true');
    hotspot.setAttribute('aria-expanded', 'false');
    gsap.to(sticker, {scale: 0, rotation: -14, opacity: 0, duration: duration(.3), ease: 'back.in(1.7)', overwrite: true});
    gsap.to(entries, {autoAlpha: 0, scale: .9, x: -6, y: 4, duration: duration(.2), overwrite: true, onComplete: () => { if (!expanded) selector.style.visibility = 'hidden'; }});
  }
  function scheduleHide() {
    clearTimeout(hideTimer); hideTimer = null;
    hideTimer = setTimeout(() => { hideTimer = null; const focus = document.activeElement; if (!(focus.matches(':focus-visible') && (selector.contains(focus) || focus === hotspot))) hideSelector(); }, 250);
  }
  const inside = (event, r, pad = 0) => event.clientX >= r.left - pad && event.clientX <= r.right + pad && event.clientY >= r.top - pad && event.clientY <= r.bottom + pad;
  scene.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch' || touch.matches || modalOpen) return;
    const h = hotspot.getBoundingClientRect();
    if (!expanded) { if (inside(event, h, 140)) showSelector(); return; }
    const s = selector.getBoundingClientRect();
    const zone = {left: Math.min(h.left, stickerBounds.left, s.left), right: Math.max(h.right, stickerBounds.right, s.right), top: Math.min(h.top, stickerBounds.top, s.top), bottom: Math.max(h.bottom, stickerBounds.bottom, s.bottom)};
    if (inside(event, zone, 18)) { clearTimeout(hideTimer); hideTimer = null; } else if (!hideTimer) scheduleHide();
  });
  scene.addEventListener('pointerleave', () => { if (!touch.matches) scheduleHide(); });
  hotspot.addEventListener('click', showSelector);
  hotspot.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); expanded ? hideSelector() : showSelector(); } });
  hotspot.addEventListener('focus', showSelector);
  hotspot.addEventListener('blur', scheduleHide);
  selector.addEventListener('focusin', () => { clearTimeout(hideTimer); hideTimer = null; });
  selector.addEventListener('focusout', scheduleHide);
  
  // Cover-cropped portrait screens: accept a tap on the actual visible poster too.
  scene.addEventListener('click', event => {
    if (!touch.matches || hotspot.contains(event.target) || selector.contains(event.target) || event.target.closest('button')) return;
    const bg = document.getElementById('bg-03');
    const scale = Math.max(innerWidth / bg.naturalWidth, innerHeight / bg.naturalHeight) * 1.06;
    const w = bg.naturalWidth * scale, h = bg.naturalHeight * scale;
    const rect = {left: (innerWidth-w)/2+w*.46, right: (innerWidth-w)/2+w*.72, top: (innerHeight-h)/2+h*.06, bottom: (innerHeight-h)/2+h*.74};
    if (innerWidth <= 600 && inside(event, rect)) { expanded ? hideSelector() : showSelector(); } else hideSelector();
  });
  window.addEventListener('resize', positionSelector);
  scene.addEventListener('scenehotspotlayout', positionSelector);
  stickerImage.addEventListener('load', positionSelector);
  positionSelector();
  new MutationObserver(() => { if (!scene.classList.contains('active')) hideSelector(); }).observe(scene, {attributes: true, attributeFilter: ['class']});

  // WorkModal: one native dialog keeps focus contained and the background inert.
  const dialog = document.createElement('dialog');
  dialog.className = 'work-dialog';
  dialog.setAttribute('aria-labelledby', 'work-title');
  dialog.innerHTML = `<div class="work-panel"><header class="work-header"><span class="work-archive">WORK<br>ARCHIVE / 03</span><nav class="work-tabs" aria-label="切换作品">${worksData.map((w,i) => `<button class="work-tab" data-work="${i}" aria-pressed="false">${w.shortLabel}</button>`).join('')}</nav><button class="work-close" aria-label="关闭作品浏览">×</button></header><div class="work-scroll" tabindex="0" aria-label="作品内容，向下滚动浏览"><div class="work-content"></div></div><footer class="work-footer"><button data-step="-1">← PREVIOUS PROJECT</button><button data-step="1">NEXT PROJECT →</button></footer></div>`;
  document.body.append(dialog);
  const panel = dialog.querySelector('.work-panel');
  const scroll = dialog.querySelector('.work-scroll');
  const content = dialog.querySelector('.work-content');
  const tabs = [...dialog.querySelectorAll('.work-tab')];
  const close = dialog.querySelector('.work-close');
  let current = 0, requested = 0, savedFocus, savedScroll, savedStyle, closing = false, observer;
  function loadImage(figure) {
    const img = figure.querySelector('img');
    img.onload = () => figure.classList.remove('is-loading');
    img.onerror = () => {
      figure.classList.remove('is-loading');
      if (figure.querySelector('.work-image-error')) return;
      const error = document.createElement('div');
      error.className = 'work-image-error';
      error.innerHTML = '<span>图片暂未加载成功</span><button type="button">重新加载</button>';
      error.querySelector('button').onclick = () => { error.remove(); figure.classList.add('is-loading'); img.src = img.dataset.src; };
      figure.append(error);
    };
    img.srcset = img.dataset.srcset;
    img.src = img.dataset.src;
  }
  // WorkViewer: long PDF pages are seamless image strips; only nearby strips load.
  function renderWork(index) {
    current = index;
    const work = worksData[index];
    observer?.disconnect();
    tabs.forEach((tab,i) => tab.setAttribute('aria-pressed', String(i === index)));
    if (work.layout === 'gallery') { window.renderWorkGallery(work, content); scroll.scrollTop = 0; return; }
    content.innerHTML = `<div class="work-meta"><div><h2 id="work-title">${work.title}</h2><p>${work.englishTitle} / ${String(work.pageCount).padStart(2,'0')} PAGES</p><span class="work-mobile-tip">轻触作品放大，左右滑动查看细节</span></div><a class="work-pdf" href="${work.pdfUrl}" target="_blank" rel="noopener">VIEW FULL PDF ↗</a></div>`;
    observer = new IntersectionObserver(items => items.forEach(item => { if (item.isIntersecting) { loadImage(item.target); observer.unobserve(item.target); } }), {root: scroll, rootMargin: '600px 0px'});
    work.pages.forEach((page, i) => {
      const figure = document.createElement('figure');
      figure.className = 'work-image is-loading';
      figure.style.aspectRatio = `${page.width} / ${page.height}`;
      const img = document.createElement('img');
      img.alt = `${work.title} · 第 ${page.page} 页${page.part > 1 ? '（续）' : ''}`;
      img.width = page.width; img.height = page.height;
      img.loading = i === 0 ? 'eager' : 'lazy'; img.decoding = 'async';
      img.sizes = '(max-width: 600px) calc(100vw - 16px), (max-width: 900px) calc(100vw - 28px), 90vw';
      img.dataset.src = page.src;
      img.dataset.srcset = `${page.small} 960w, ${page.src} ${page.width}w`;
      figure.append(img); content.append(figure);
      if (i === 0) loadImage(figure); else observer.observe(figure);
    });
    scroll.scrollTop = 0;
    scroll.scrollLeft = 0;
  }

  content.addEventListener('click', event => {
    if (!touch.matches && innerWidth > 600) return;
    const figure = event.target.closest('.work-image');
    if (!figure || event.target.closest('button, a')) return;
    const image = figure.querySelector('img');
    const zoomIn = !figure.classList.contains('is-zoomed');
    content.querySelectorAll('.work-image.is-zoomed').forEach(item => {
      item.classList.remove('is-zoomed');
      item.querySelector('img')?.setAttribute('sizes', 'calc(100vw - 16px)');
    });
    figure.classList.toggle('is-zoomed', zoomIn);
    if (image) image.sizes = zoomIn ? '200vw' : 'calc(100vw - 16px)';
    requestAnimationFrame(() => { scroll.scrollLeft = zoomIn ? Math.max(0, (figure.scrollWidth - scroll.clientWidth) / 2) : 0; });
  });
  function switchWork(index) {
    if (closing) return;
    requested = (index + worksData.length) % worksData.length;
    if (requested === current) { gsap.to(content, {opacity: 1, y: 0, duration: duration(.15), overwrite: true}); return; }
    gsap.to(content, {opacity: 0, y: 8, duration: duration(.14), ease: 'power1.in', overwrite: true, onComplete: () => {
      renderWork(requested);
      gsap.fromTo(content, {opacity: 0, y: 8}, {opacity: 1, y: 0, duration: duration(.18), ease: 'power2.out', overwrite: true});
    }});
  }
  sticker.addEventListener('click', event => {
    if (!expanded || modalOpen) return;
    event.stopPropagation();
    openWork(0);
  });

  function openWork(index) {
    if (modalOpen) return;
    clearTimeout(hideTimer); hideTimer = null;
    savedFocus = document.activeElement;
    savedScroll = {x: window.scrollX, y: window.scrollY};
    savedStyle = document.body.getAttribute('style');
    requested = index;
    renderWork(index);
    modalOpen = true;
    document.body.style.position = 'fixed'; document.body.style.top = `-${savedScroll.y}px`;
    document.body.style.left = `-${savedScroll.x}px`; document.body.style.width = '100%'; document.body.style.overflow = 'hidden';
    dialog.showModal();
    window.showLoadingToast(panel);
    gsap.set(content, {opacity: 1, y: 0});
    gsap.fromTo(panel, {opacity: 0, scale: .97, y: 8}, {opacity: 1, scale: 1, y: 0, duration: duration(.4), ease: 'power2.out', overwrite: true});
    close.focus({preventScroll: true});
  }
  function closeWork(afterClose) {
    if (!modalOpen || closing) return;
    closing = true;
    gsap.killTweensOf(content);
    gsap.to(panel, {opacity: 0, scale: .97, y: 8, duration: duration(.22), ease: 'power2.in', overwrite: true, onComplete: () => {
      dialog.close(); observer?.disconnect(); content.replaceChildren();
      if (savedStyle === null) document.body.removeAttribute('style'); else document.body.setAttribute('style', savedStyle);
      window.scrollTo(savedScroll.x, savedScroll.y);
      modalOpen = false; closing = false;
      savedFocus?.focus({preventScroll: true});
      scheduleHide();
      if (typeof afterClose === 'function') afterClose();if (window.__returnToAbout){window.__returnToAbout=false;if(window.openAboutModal)window.openAboutModal();}
    }});
  }
  window.openWorkModal = id => {
    const index = worksData.findIndex(work => work.id === id);
    if (index >= 0) { if (modalOpen) switchWork(index); else openWork(index); }
  };
  window.closeWorkModal = closeWork;
  selector.addEventListener('click', event => { const button = event.target.closest('[data-work]'); if (button) openWork(Number(button.dataset.work)); });
  dialog.addEventListener('click', event => {
    const tab = event.target.closest('[data-work]');
    const step = event.target.closest('[data-step]');
    if (tab) switchWork(Number(tab.dataset.work));
    if (step) switchWork(requested + Number(step.dataset.step));
  });
  let overlayDown = false;
  dialog.addEventListener('pointerdown', event => { overlayDown = event.target === dialog; });
  dialog.addEventListener('pointerup', event => { if (overlayDown && event.target === dialog) closeWork(); overlayDown = false; });
  close.addEventListener('click', closeWork);
  dialog.addEventListener('cancel', event => { event.preventDefault(); closeWork(); });
})();
