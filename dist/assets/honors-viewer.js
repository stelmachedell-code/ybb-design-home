(() => {
  'use strict';

  const data = window.honorsData;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const duration = value => reduced.matches ? 0 : value;

  const dialog = document.createElement('dialog');
  dialog.className = 'honors-dialog';
  dialog.setAttribute('aria-labelledby', 'honors-title');
  dialog.innerHTML = `
    <div class="honors-panel">
      <header class="honors-header">
        <span class="honors-archive">HONOR<br>ARCHIVE / 06</span>
        <button class="honors-close" aria-label="关闭荣誉证书弹窗">×</button>
      </header>
      <div class="honors-meta">
        <div><h2 id="honors-title">荣誉证书</h2><p id="honors-subtitle">HONORS &amp; AWARDS · CREATIVE ACHIEVEMENTS</p></div>
      </div>
      <div class="honors-scroll" tabindex="0" aria-label="荣誉证书列表">
        <div class="honors-grid"></div>
      </div>
      <div class="honors-scroll-hint">还可以向下滑~</div>
      <footer class="honors-footer">
        <button class="honors-done" data-close>CLOSE</button>
      </footer>
    </div>`;
  document.body.append(dialog);

  const panel = dialog.querySelector('.honors-panel');
  const grid = dialog.querySelector('.honors-grid');
  const closeBtn = dialog.querySelector('.honors-close');
  const doneBtn = dialog.querySelector('.honors-done');
  const titleEl = dialog.querySelector('#honors-title');
  const subtitleEl = dialog.querySelector('#honors-subtitle');

  const meta = {
    all: {title: '荣誉证书', subtitle: 'HONORS & AWARDS · CREATIVE ACHIEVEMENTS'},
    national: {title: '国奖荣誉', subtitle: 'NATIONAL AWARDS'},
    province: {title: '省奖荣誉', subtitle: 'PROVINCIAL AWARDS'},
    school: {title: '校奖荣誉', subtitle: 'SCHOOL AWARDS'}
  };

  function preloadNormalImages(items = data) {
    items.forEach(honor => {
      const image = new Image();
      image.decoding = 'async';
      image.src = honor.img;
    });
  }

  const honorTrigger = document.querySelector('.hs-trophy-sticker');
  ['pointerenter', 'focusin', 'touchstart'].forEach(type => {
    honorTrigger?.addEventListener(type, () => preloadNormalImages(), {once: true, passive: true});
  });

  function renderGrid(items) {
    grid.innerHTML = items.map((honor, i) => {
      const hover = honor.hover ? `<img class="honor-img-hover" data-src="${honor.hover}" alt="" decoding="async" />` : '';
      return `<button class="honor-card" data-index="${i}" aria-label="${honor.title}" style="aspect-ratio: ${honor.ratio || '1082 / 1504'}">
        <img class="honor-img-normal" src="${honor.img}" alt="" loading="eager" decoding="async" fetchpriority="high" />
        ${hover}
      </button>`;
    }).join('');
    grid.querySelectorAll('.honor-card').forEach(card => {
      const hoverImage = card.querySelector('.honor-img-hover[data-src]');
      if (!hoverImage) return;
      const loadHover = () => {
        if (!hoverImage.src) hoverImage.src = hoverImage.dataset.src;
      };
      card.addEventListener('pointerenter', loadHover, {once: true});
      card.addEventListener('focusin', loadHover, {once: true});
    });
  }

  let open = false;
  let closing = false;
  let savedFocus = null;
  let savedScroll = {x: 0, y: 0};
  let savedStyle = null;

  function openModal(category = 'all') {
    if (open) return;
    const linkedWork = window.worksData.find(work => work.id === category);
    const currentMeta = linkedWork ? {title: '《荆楚传》获奖证书', subtitle: 'AWARD-WINNING WORK · CERTIFICATES'} : (meta[category] || meta.all);
    const items = linkedWork ? data.filter(honor => honor.workId === category) : category === 'all' ? data : data.filter(honor => honor.category === category);
    titleEl.textContent = currentMeta.title;
    subtitleEl.textContent = currentMeta.subtitle;
    renderGrid(items);
    dialog.querySelectorAll('.honors-work-link').forEach(link => link.remove());
    [...new Set(items.map(item => item.workId).filter(Boolean))].forEach(id => {
      const link = document.createElement('button');
      link.className = 'honors-work-link';
      link.textContent = '《荆楚传》· 查看获奖作品 →';
      link.onclick = () => closeModal(() => window.openWorkModal(id));
      dialog.querySelector('.honors-footer').prepend(link);
    });
    savedFocus = document.activeElement;
    savedScroll = {x: window.scrollX, y: window.scrollY};
    savedStyle = document.body.getAttribute('style');
    open = true;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${savedScroll.y}px`;
    document.body.style.left = `-${savedScroll.x}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
    dialog.showModal();
    gsap.fromTo(panel, {opacity: 0, scale: 0.97, y: 8}, {opacity: 1, scale: 1, y: 0, duration: duration(0.4), ease: 'power2.out', overwrite: true});
    closeBtn.focus({preventScroll: true});
  }

  function closeModal(afterClose) {
    if (!open || closing) return;
    closing = true;
    gsap.to(panel, {opacity: 0, scale: 0.97, y: 8, duration: duration(0.22), ease: 'power2.in', overwrite: true, onComplete: () => {
      dialog.close();
      if (savedStyle === null) document.body.removeAttribute('style'); else document.body.setAttribute('style', savedStyle);
      window.scrollTo(savedScroll.x, savedScroll.y);
      open = false;
      closing = false;
      if (savedFocus) savedFocus.focus({preventScroll: true});
      if (typeof afterClose === 'function') afterClose();
    }});
  }

  window.openHonorsModal = openModal;

  closeBtn.addEventListener('click', closeModal);
  doneBtn.addEventListener('click', closeModal);
  dialog.addEventListener('cancel', event => { event.preventDefault(); closeModal(); });

  let overlayDown = false;
  dialog.addEventListener('pointerdown', event => { overlayDown = event.target === dialog; });
  dialog.addEventListener('pointerup', event => {
    if (overlayDown && event.target === dialog) closeModal();
    overlayDown = false;
  });
})();
