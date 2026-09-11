(() => {
  'use strict';

  const data = window.withAIData;
  const scene = document.getElementById('scene-04');
  const hotspot = scene.querySelector('.hs-computer');
  const sticker = document.getElementById('computer-sticker');
  const stickerImage = sticker.querySelector('img');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const touch = matchMedia('(hover: none), (pointer: coarse)');
  const duration = value => reduced.matches ? 0 : value;
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const fmt = seconds => {
    if (!isFinite(seconds)) seconds = 0;
    seconds = Math.max(0, Math.floor(seconds));
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return h > 0
      ? `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // ---- Hotspot selector ----
  const selector = document.createElement('nav');
  selector.className = 'with-ai-selector';
  selector.id = 'with-ai-selector';
  selector.setAttribute('aria-label', '选择 WITH AI 作品');
  selector.setAttribute('aria-hidden', 'true');
  selector.inert = true;
  selector.innerHTML = data.map((item, i) => {
    const circleText = item.shortLabel === 'CODE'
      ? '<span>CODE</span>'
      : `<span>${item.shortLabel.split(' ')[0]}</span><span>${item.shortLabel.split(' ')[1]}</span>`;
    return `<div class="with-ai-entry"><button class="with-ai-circle" data-with-ai="${i}" aria-label="打开${item.title}">${circleText}</button><span class="with-ai-entry-name"><span>${item.title}</span><small>${item.englishTitle}</small></span></div>`;
  }).join('');
  scene.append(selector);

  hotspot.tabIndex = 0;
  hotspot.setAttribute('role', 'button');
  hotspot.setAttribute('aria-label', '展开 WITH AI 作品入口');
  hotspot.setAttribute('aria-expanded', 'false');
  hotspot.setAttribute('aria-controls', selector.id);

  const entries = [...selector.children];
  let expanded = false;
  let hideTimer;
  let modalOpen = false;
  let stickerBounds = {left: 0, right: 0, top: 0, bottom: 0};

  gsap.set(entries, {autoAlpha: 0, scale: 0.82, x: 8});

  function positionSelector() {
    const h = hotspot.getBoundingClientRect();
    const stickerWidth = h.width * 1.52;
    const stickerHeight = stickerWidth * (stickerImage.naturalHeight / stickerImage.naturalWidth || 1);
    const cx = h.left + h.width * 0.62;
    const cy = h.top + h.height * 0.65;
    stickerBounds = {
      left: cx - stickerWidth / 2,
      right: cx + stickerWidth / 2,
      top: cy - stickerHeight / 2,
      bottom: cy + stickerHeight / 2
    };
    const mobile = innerWidth <= 600;
    const x = mobile
      ? (innerWidth - selector.offsetWidth) / 2
      : clamp(stickerBounds.right + 22, 16, innerWidth - selector.offsetWidth - 20);
    const y = mobile
      ? clamp(stickerBounds.bottom + 24, 110, innerHeight - selector.offsetHeight - 104)
      : clamp(cy - selector.offsetHeight / 2, 80, innerHeight - selector.offsetHeight - 24);
    selector.style.left = `${x}px`;
    selector.style.top = `${y}px`;
    selector.classList.toggle('labels-left', x + 300 > innerWidth);
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
    gsap.killTweensOf(sticker);
    gsap.killTweensOf(entries);
    gsap.fromTo(sticker, {opacity: 0, scale: 0.96, y: 6, rotation: 0}, {opacity: 1, scale: 1, y: 0, rotation: 0, duration: duration(0.36), ease: 'power2.out', overwrite: true});
    gsap.to(entries, {autoAlpha: 1, scale: 1, x: 0, y: 0, duration: duration(0.38), delay: duration(0.1), stagger: reduced.matches ? 0 : 0.08, ease: 'power2.out', overwrite: true});
  }

  function hideSelector() {
    clearTimeout(hideTimer); hideTimer = null;
    if (!expanded || modalOpen) return;
    expanded = false;
    sticker.style.pointerEvents = 'none';
    selector.inert = true;
    selector.setAttribute('aria-hidden', 'true');
    hotspot.setAttribute('aria-expanded', 'false');
    gsap.killTweensOf(sticker);
    gsap.killTweensOf(entries);
    gsap.to(sticker, {opacity: 0, scale: 0.96, y: 6, rotation: 0, duration: duration(0.25), ease: 'power2.in', overwrite: true});
    gsap.to(entries, {autoAlpha: 0, scale: 0.9, x: 6, duration: duration(0.2), overwrite: true, onComplete: () => { if (!expanded) selector.style.visibility = 'hidden'; }});
  }

  function scheduleHide() {
    clearTimeout(hideTimer); hideTimer = null;
    hideTimer = setTimeout(() => {
      hideTimer = null;
      const focus = document.activeElement;
      if (!(focus && (selector.contains(focus) || focus === hotspot))) hideSelector();
    }, 250);
  }

  const inside = (event, rect, pad = 0) =>
    event.clientX >= rect.left - pad && event.clientX <= rect.right + pad &&
    event.clientY >= rect.top - pad && event.clientY <= rect.bottom + pad;

  scene.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch' || touch.matches || modalOpen) return;
    const h = hotspot.getBoundingClientRect();
    if (!expanded) {
      if (inside(event, h, 160)) showSelector();
      return;
    }
    const s = selector.getBoundingClientRect();
    const zone = {
      left: Math.min(h.left, stickerBounds.left, s.left),
      right: Math.max(h.right, stickerBounds.right, s.right),
      top: Math.min(h.top, stickerBounds.top, s.top),
      bottom: Math.max(h.bottom, stickerBounds.bottom, s.bottom)
    };
    if (inside(event, zone, 18)) {
      clearTimeout(hideTimer); hideTimer = null;
    } else if (!hideTimer) {
      scheduleHide();
    }
  });

  scene.addEventListener('pointerleave', () => { if (!touch.matches) scheduleHide(); });

  hotspot.addEventListener('click', () => {
    if (touch.matches) { expanded ? hideSelector() : showSelector(); }
    else if (!expanded) showSelector();
  });
  hotspot.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      expanded ? hideSelector() : showSelector();
    }
  });
  hotspot.addEventListener('focus', () => { if (hotspot.matches(':focus-visible')) showSelector(); });
  hotspot.addEventListener('blur', scheduleHide);
  selector.addEventListener('focusin', () => { clearTimeout(hideTimer); hideTimer = null; });
  selector.addEventListener('focusout', scheduleHide);

  window.addEventListener('resize', positionSelector);
  scene.addEventListener('scenehotspotlayout', positionSelector);
  stickerImage.addEventListener('load', positionSelector);
  positionSelector();
  new MutationObserver(() => { if (!scene.classList.contains('active')) hideSelector(); }).observe(scene, {attributes: true, attributeFilter: ['class']});

  // ---- WITH AI modal ----
  const dialog = document.createElement('dialog');
  dialog.className = 'with-ai-dialog';
  dialog.setAttribute('aria-labelledby', 'with-ai-title');
  dialog.innerHTML = `
    <div class="with-ai-panel">
      <header class="with-ai-header">
        <span class="with-ai-archive">WITH AI<br>ARCHIVE / 03</span>
        <nav class="with-ai-tabs" aria-label="切换 WITH AI 作品">
          ${data.map((item, i) => `<button class="with-ai-tab" data-with-ai="${i}" aria-pressed="false"><span>${item.shortLabel}</span><small>${item.englishTitle}</small></button>`).join('')}
        </nav>
        <button class="with-ai-close" aria-label="关闭 WITH AI 作品">×</button>
      </header>
      <div class="with-ai-viewer" id="with-ai-viewer">
        <div class="with-ai-meta">
          <div class="with-ai-meta-titles"><h2 id="with-ai-title"></h2><p id="with-ai-english"></p></div>
          <p class="with-ai-desc" id="with-ai-desc"></p>
        </div>
        <div class="with-ai-video-shell">
          <div class="with-ai-stage is-loading">
            <video class="with-ai-video" id="with-ai-video" playsinline preload="metadata"></video><div class="with-ai-tap-hint" id="with-ai-tap-hint">轻触屏幕播放 →</div>
            <div class="with-ai-loading">LOADING...</div>
          </div>
          <div class="with-ai-controls">
            <button class="with-ai-play" aria-label="播放">▶</button>
            <span class="with-ai-time">00:00 / 00:00</span>
            <input class="with-ai-progress" type="range" min="0" max="1000" step="0.1" value="0" aria-label="播放进度" />
            <button class="with-ai-mute" aria-label="静音">🔊</button>
            <div class="with-ai-speed">
              <button class="with-ai-speed-btn" aria-label="播放速度">1×</button>
              <div class="with-ai-speed-menu">${[1, 1.25, 1.5, 2].map(s => `<button data-speed="${s}">${s}×</button>`).join('')}</div>
            </div>
            <button class="with-ai-fullscreen" aria-label="全屏">⛶</button>
          </div>
        </div>
        <div class="with-ai-coding">
          <div class="with-ai-coding-row"><span>ROLE</span><b id="with-ai-role"></b></div>
          <div class="with-ai-coding-row"><span>TOOLS</span><b id="with-ai-tools"></b></div>
          <a class="with-ai-project-link" id="with-ai-project-link" target="_blank" rel="noopener">VIEW PROJECT ↗</a>
        </div>
      </div>
      <footer class="with-ai-footer">
        <button data-step="-1">← PREVIOUS PROJECT</button>
        <button data-step="1">NEXT PROJECT →</button>
      </footer>
    </div>`;
  document.body.append(dialog);

  const panel = dialog.querySelector('.with-ai-panel');
  const viewer = dialog.querySelector('.with-ai-viewer');
  const tabs = [...dialog.querySelectorAll('.with-ai-tab')];
  const close = dialog.querySelector('.with-ai-close');
  const titleEl = dialog.querySelector('#with-ai-title');
  const englishEl = dialog.querySelector('#with-ai-english');
  const descEl = dialog.querySelector('#with-ai-desc');
  const roleEl = dialog.querySelector('#with-ai-role');
  const toolsEl = dialog.querySelector('#with-ai-tools');
  const projectLink = dialog.querySelector('#with-ai-project-link');
  const video = dialog.querySelector('#with-ai-video');
  const stage = dialog.querySelector('.with-ai-stage');
  const playBtn = dialog.querySelector('.with-ai-play');
  const timeEl = dialog.querySelector('.with-ai-time');
  const progress = dialog.querySelector('.with-ai-progress');
  const muteBtn = dialog.querySelector('.with-ai-mute');
  const speedBtn = dialog.querySelector('.with-ai-speed-btn');
  const speedMenu = dialog.querySelector('.with-ai-speed-menu');
  const fullscreenBtn = dialog.querySelector('.with-ai-fullscreen');
  const shell = dialog.querySelector('.with-ai-video-shell');
  const tapHint = dialog.querySelector('.with-ai-tap-hint');

  let current = -1;
  let requested = 0;
  let savedFocus;
  let savedScroll;
  let savedStyle;
  let closing = false;
  let seeking = false;
  let seekTarget = null;
  let sourceUrl = '';
  let objectUrl = '';
  let fetchController = null;
  let sourceToken = 0;

  function setLoading(on) { stage.classList.toggle('is-loading', on); updateTapHint(); }

  function updateTapHint() { if (tapHint) tapHint.classList.toggle('is-hidden', !(video.paused && !stage.classList.contains('is-loading'))); }

  function updateTime() {
    if (!isFinite(video.duration)) { timeEl.textContent = `00:00 / 00:00`; return; }
    const shownTime = seekTarget === null ? video.currentTime : seekTarget;
    if (!seeking && seekTarget === null) progress.value = String(video.duration ? (video.currentTime / video.duration) * 1000 : 0);
    timeEl.textContent = `${fmt(shownTime)} / ${fmt(video.duration)}`;
  }

  function clearVideoSource() {
    sourceToken += 1;
    if (fetchController) fetchController.abort();
    fetchController = null;
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = '';
    seekTarget = null;
    seeking = false;
  }

  function isBuffered(target) {
    for (let i = 0; i < video.buffered.length; i += 1) {
      if (target >= video.buffered.start(i) - 0.25 && target <= video.buffered.end(i) + 0.25) return true;
    }
    return false;
  }

  async function seekTo(target) {
    if (!isFinite(video.duration) || !sourceUrl) return;
    target = clamp(target, 0, Math.max(0, video.duration - 0.05));
    seekTarget = target;
    seeking = false;
    progress.value = String(video.duration ? (target / video.duration) * 1000 : 0);
    updateTime();

    // Keep one full-file request in flight; later drags only update the final target.
    if (fetchController) return;

    if (objectUrl || isBuffered(target)) {
      video.currentTime = target;
      seekTarget = null;
      updateTime();
      return;
    }

    const wasPlaying = !video.paused;
    const token = sourceToken;
    video.pause();
    setLoading(true);
    if (fetchController) fetchController.abort();
    fetchController = new AbortController();

    try {
      const response = await fetch(sourceUrl, {signal: fetchController.signal});
      if (!response.ok) throw new Error(`Video request failed: ${response.status}`);
      const blob = await response.blob();
      if (token !== sourceToken) return;

      objectUrl = URL.createObjectURL(blob);
      video.src = objectUrl;
      video.load();
      await new Promise((resolve, reject) => {
        const ready = () => { cleanup(); resolve(); };
        const failed = () => { cleanup(); reject(new Error('Video metadata failed')); };
        const cleanup = () => {
          video.removeEventListener('loadedmetadata', ready);
          video.removeEventListener('error', failed);
        };
        video.addEventListener('loadedmetadata', ready, {once: true});
        video.addEventListener('error', failed, {once: true});
      });
      if (token !== sourceToken) return;
      target = seekTarget === null ? target : seekTarget;
      video.currentTime = clamp(target, 0, Math.max(0, video.duration - 0.05));
      seekTarget = null;
      setLoading(false);
      updateTime();
      if (wasPlaying) {
        const p = video.play();
        if (p && p.catch) p.catch(() => {});
      }
    } catch (error) {
      if (error.name === 'AbortError' || token !== sourceToken) return;
      seekTarget = null;
      setLoading(false);
      video.currentTime = target;
      updateTime();
    } finally {
      if (token === sourceToken) fetchController = null;
    }
  }

  function updateMute() { muteBtn.textContent = video.muted ? '🔇' : '🔊'; }
  function updateFullscreen() { fullscreenBtn.textContent = document.fullscreenElement ? '⛶' : '⛶'; }

  function updateSpeedMenu() {
    [...speedMenu.children].forEach(btn => btn.classList.toggle('active', Number(btn.dataset.speed) === video.playbackRate));
  }

  function togglePlay() {
    if (video.paused) {
      const p = video.play();
      if (p && p.catch) p.catch(() => {});
    } else {
      video.pause();
    }
  }

  function renderWithAI(index) {
    current = index;
    const item = data[index];
    tabs.forEach((tab, i) => tab.setAttribute('aria-pressed', String(i === index)));
    titleEl.textContent = item.title;
    englishEl.textContent = item.englishTitle;
    descEl.textContent = item.description || '';
    viewer.classList.toggle('is-coding', item.type === 'project');
    viewer.classList.toggle('has-link', Boolean(item.projectUrl));
    roleEl.textContent = item.role || '';
    toolsEl.textContent = Array.isArray(item.tools) ? item.tools.join(' / ') : (item.tools || '');
    projectLink.href = item.projectUrl || '#';
    projectLink.style.display = item.projectUrl ? '' : 'none';

    video.pause();
    clearVideoSource();
    setLoading(true);
    video.poster = item.poster;
    sourceUrl = item.videoUrl;
    video.src = sourceUrl;
    video.load();

    progress.value = '0';
    playBtn.textContent = '▶';
    speedBtn.textContent = '1×';
    video.playbackRate = 1;
    video.muted = false;
    updateMute();
    updateTime();
    updateSpeedMenu();
    speedMenu.classList.remove('open');
  }

  function switchWithAI(index) {
    if (closing) return;
    requested = (index + data.length) % data.length;
    if (requested === current) return;
    video.pause();
    gsap.to(viewer, {opacity: 0, y: 8, duration: duration(0.15), ease: 'power1.in', overwrite: true, onComplete: () => {
      renderWithAI(requested);
      gsap.fromTo(viewer, {opacity: 0, y: 8}, {opacity: 1, y: 0, duration: duration(0.22), ease: 'power2.out', overwrite: true});
    }});
  }

  sticker.addEventListener('click', event => {
    if (!expanded || modalOpen) return;
    event.stopPropagation();
    openWithAI(0);
  });

  function openWithAI(index) {
    if (modalOpen) return;
    clearTimeout(hideTimer); hideTimer = null;
    savedFocus = document.activeElement;
    savedScroll = {x: window.scrollX, y: window.scrollY};
    savedStyle = document.body.getAttribute('style');
    requested = index;
    renderWithAI(index);
    modalOpen = true;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${savedScroll.y}px`;
    document.body.style.left = `-${savedScroll.x}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
    dialog.showModal();
    window.showLoadingToast(panel);
    gsap.set(viewer, {opacity: 1, y: 0});
    gsap.fromTo(panel, {opacity: 0, scale: 0.97, y: 8}, {opacity: 1, scale: 1, y: 0, duration: duration(0.4), ease: 'power2.out', overwrite: true});
    close.focus({preventScroll: true});
  }

  function closeWithAI() {
    if (!modalOpen || closing) return;
    closing = true;
    video.pause();
    gsap.killTweensOf(viewer);
    gsap.to(panel, {opacity: 0, scale: 0.97, y: 8, duration: duration(0.22), ease: 'power2.in', overwrite: true, onComplete: () => {
      clearVideoSource();
      video.removeAttribute('src');
      video.load();
      dialog.close();
      if (savedStyle === null) document.body.removeAttribute('style'); else document.body.setAttribute('style', savedStyle);
      window.scrollTo(savedScroll.x, savedScroll.y);
      modalOpen = false;
      closing = false;
      if (savedFocus) savedFocus.focus({preventScroll: true});if (window.__returnToAbout){window.__returnToAbout=false;if(window.openAboutModal)window.openAboutModal();}
      scheduleHide();
    }});
  }

  window.openWithAiModal = id => {
    const index = data.findIndex(item => item.id === id);
    if (index >= 0) { if (modalOpen) switchWithAI(index); else openWithAI(index); }
  };
  window.closeWithAiModal = closeWithAI;

  selector.addEventListener('click', event => {
    const button = event.target.closest('[data-with-ai]');
    if (button) openWithAI(Number(button.dataset.withAi));
  });

  dialog.addEventListener('click', event => {
    const tab = event.target.closest('[data-with-ai]');
    const step = event.target.closest('[data-step]');
    if (tab) switchWithAI(Number(tab.dataset.withAi));
    if (step) switchWithAI(requested + Number(step.dataset.step));
  });

  let overlayDown = false;
  dialog.addEventListener('pointerdown', event => { overlayDown = event.target === dialog; });
  dialog.addEventListener('pointerup', event => {
    if (overlayDown && event.target === dialog) closeWithAI();
    overlayDown = false;
  });
  close.addEventListener('click', closeWithAI);
  dialog.addEventListener('cancel', event => { event.preventDefault(); closeWithAI(); });

  playBtn.addEventListener('click', togglePlay);
  video.addEventListener('play', () => { playBtn.textContent = '❚❚'; setLoading(false); });
  video.addEventListener('pause', () => { playBtn.textContent = '▶'; updateTapHint(); });
  video.addEventListener('ended', () => { playBtn.textContent = '▶'; updateTapHint(); });
  video.addEventListener('loadedmetadata', () => { setLoading(false); updateTime(); });
  video.addEventListener('canplay', () => { setLoading(false); updateTime(); });
  video.addEventListener('waiting', () => { setLoading(true); });
  video.addEventListener('timeupdate', updateTime);
  video.addEventListener('durationchange', updateTime);

  progress.addEventListener('pointerdown', () => { seeking = true; });
  progress.addEventListener('pointercancel', () => { seeking = false; seekTarget = null; updateTime(); });
  progress.addEventListener('input', () => {
    if (video.duration) {
      seeking = true;
      seekTarget = (Number(progress.value) / 1000) * video.duration;
      updateTime();
    }
  });
  progress.addEventListener('change', () => {
    const target = video.duration ? (Number(progress.value) / 1000) * video.duration : 0;
    seekTo(target);
  });

  muteBtn.addEventListener('click', () => { video.muted = !video.muted; updateMute(); });
  speedBtn.addEventListener('click', event => {
    event.stopPropagation();
    speedMenu.classList.toggle('open');
    updateSpeedMenu();
  });
  speedMenu.addEventListener('click', event => {
    const btn = event.target.closest('[data-speed]');
    if (btn) {
      video.playbackRate = Number(btn.dataset.speed);
      speedBtn.textContent = `${btn.dataset.speed}×`;
      updateSpeedMenu();
      speedMenu.classList.remove('open');
    }
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.with-ai-speed')) speedMenu.classList.remove('open');
  });

  fullscreenBtn.addEventListener('click', () => {
    const active = document.fullscreenElement || document.webkitFullscreenElement;
    if (active) {
      const p = document.exitFullscreen?.() || document.webkitExitFullscreen?.();
      if (p && p.catch) p.catch(() => {});
    } else if (shell.requestFullscreen) {
      const p = shell.requestFullscreen();
      if (p && p.catch) p.catch(() => {});
    } else if (shell.webkitRequestFullscreen) {
      shell.webkitRequestFullscreen();
    } else if (video.webkitEnterFullscreen) {
      video.webkitEnterFullscreen();
    }
  });
  const syncFullscreenButton = () => {
    const active = Boolean(document.fullscreenElement || document.webkitFullscreenElement);
    fullscreenBtn.textContent = active ? '✕' : '⛶';
    fullscreenBtn.classList.toggle('is-fullscreen', active);
    fullscreenBtn.setAttribute('aria-label', active ? '退出全屏' : '全屏观看');
  };
  document.addEventListener('fullscreenchange', syncFullscreenButton);
  document.addEventListener('webkitfullscreenchange', syncFullscreenButton);

  stage.addEventListener('click', event => {
    if (event.target === video || event.target === stage) togglePlay();
  });

  dialog.addEventListener('keydown', event => {
    const target = event.target;
    if (target.closest('input, textarea, select, [contenteditable="true"]')) return;
    if (event.key === 'ArrowLeft') { event.preventDefault(); switchWithAI(requested - 1); }
    else if (event.key === 'ArrowRight') { event.preventDefault(); switchWithAI(requested + 1); }
    else if (event.key === ' ') {
      event.preventDefault();
      togglePlay();
    }
  });
})();
