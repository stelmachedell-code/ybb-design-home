(() => {
  // The detail viewer stays above MY WORK; closing it preserves gallery scroll and focus.
  const detail = document.createElement('dialog');
  detail.className = 'award-detail';
  detail.setAttribute('aria-labelledby', 'award-detail-title');
  detail.innerHTML = `<div class="award-detail-panel">
    <header><h3 id="award-detail-title"></h3><button class="award-detail-close" aria-label="返回作品总览">×</button></header>
    <div class="award-detail-stage" tabindex="0" aria-label="作品大图，可滚动查看细节"><div class="award-detail-canvas"><img alt="" /></div></div>
    <footer><button data-image-step="-1" aria-label="上一张作品">← 上一张</button><button class="award-zoom" aria-pressed="false">原图细节 ＋</button><span class="award-count"></span><button data-image-step="1" aria-label="下一张作品">下一张 →</button></footer>
    <p class="award-detail-status" role="status"></p>
  </div>`;
  document.body.append(detail);
  const image = detail.querySelector('img');
  const stage = detail.querySelector('.award-detail-stage');
  const zoom = detail.querySelector('.award-zoom');
  const status = detail.querySelector('.award-detail-status');
  let pages = [], index = 0, zoomed = false, origin;
  function renderDetail() {
    const page = pages[index];
    zoomed = false;
    stage.classList.remove('is-zoomed');
    zoom.setAttribute('aria-pressed', 'false');
    zoom.textContent = '原图细节 ＋';
    detail.querySelector('h3').textContent = page.title;
    detail.querySelector('.award-count').textContent = `${index + 1} / ${pages.length}`;
    image.alt = page.title;
    image.style.setProperty('--original-width', `${page.width}px`);
    image.width = page.width; image.height = page.height;
    image.src = page.src;
    status.textContent = '正在加载高清作品…';
    stage.scrollTo(0, 0);
  }
  image.onload = () => { status.textContent = ''; };
  image.onerror = () => { status.textContent = '图片暂未加载成功，请切换后重试。'; };
  function dismiss() { detail.close(); image.removeAttribute('src'); origin?.focus({preventScroll:true}); }
  detail.querySelector('.award-detail-close').onclick = dismiss;
  detail.addEventListener('cancel', event => { event.preventDefault(); dismiss(); });
  let overlayDown = false;
  detail.addEventListener('pointerdown', event => { overlayDown = event.target === detail; });
  detail.addEventListener('pointerup', event => { if (overlayDown && event.target === detail) dismiss(); overlayDown = false; });
  function step(amount) { index = (index + amount + pages.length) % pages.length; renderDetail(); }
  detail.querySelectorAll('[data-image-step]').forEach(button => { button.onclick = () => step(Number(button.dataset.imageStep)); });
  detail.addEventListener('keydown', event => {
    if (!zoomed && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
      event.preventDefault(); step(event.key === 'ArrowLeft' ? -1 : 1);
    }
  });
  zoom.onclick = () => {
    zoomed = !zoomed;
    stage.classList.toggle('is-zoomed', zoomed);
    zoom.setAttribute('aria-pressed', String(zoomed));
    zoom.textContent = zoomed ? '适应窗口 −' : '原图细节 ＋';
    if (zoomed && !image.src.endsWith(pages[index].original)) {
      status.textContent = '正在加载原图，可横向、纵向滚动…';
      image.src = pages[index].original;
    }
    stage.scrollTo(0, 0);
  };
  function positionCaption(card) {
    const caption = card.querySelector('.award-caption');
    const rect = card.getBoundingClientRect();
    const viewport = card.closest('.work-scroll').getBoundingClientRect();
    caption.style.top = `${Math.max(12, Math.min(card.clientHeight - caption.offsetHeight - 12, viewport.top - rect.top + 12))}px`;
  }
  document.addEventListener('scroll', event => {
    if (!event.target.matches?.('.work-scroll')) return;
    const card = event.target.querySelector('.award-card:hover, .award-card:focus-visible');
    if (card) positionCaption(card);
  }, true);
  window.renderWorkGallery = (work, content) => {
    content.innerHTML = `<section class="award-gallery-content">
      <div class="work-meta award-meta"><div><h2 id="work-title">${work.title}</h2><p>${work.englishTitle} / ${String(work.pages.length).padStart(2, '0')} BOARDS</p></div></div>
      <div class="award-recognition"><ul>${work.awards.map(award => `<li>${award}</li>`).join('')}</ul><button class="award-honors-link">查看获奖证书 ↗</button></div>
      <p class="award-gallery-hint">点击作品放大查看 · 支持原图细节</p>
      <div class="award-grid"></div>
    </section>`;
    const grid = content.querySelector('.award-grid');
    work.pages.forEach((page, i) => {
      const card = document.createElement('button');
      card.className = 'award-card is-loading';
      card.setAttribute('aria-label', `${page.title}，点击放大`);
      card.innerHTML = `<img src="${page.thumb}" alt="${page.title}" width="${page.width}" height="${page.height}" loading="lazy" decoding="async" /><span class="award-caption">${page.title}<small>查看大图 ↗</small></span>`;
      card.onpointerenter = () => positionCaption(card);
      card.onfocus = () => positionCaption(card);
      const thumb = card.querySelector('img');
      thumb.onload = () => card.classList.remove('is-loading');
      thumb.onerror = () => { card.classList.remove('is-loading'); card.classList.add('has-error'); };
      card.onclick = () => { pages = work.pages; index = i; origin = card; renderDetail(); detail.showModal(); detail.querySelector('.award-detail-close').focus(); };
      grid.append(card);
    });
    content.querySelector('.award-honors-link').onclick = () => {
      window.closeWorkModal(() => window.openHonorsModal(work.id));
    };
  };
})();
