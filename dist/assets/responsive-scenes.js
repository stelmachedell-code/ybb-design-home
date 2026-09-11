(() => {
  'use strict';

  const scenes = [...document.querySelectorAll('.scene')];

  function syncScene(scene) {
    const bg = scene.querySelector('.room-bg');
    if (!bg || !bg.naturalWidth || !bg.naturalHeight) return;

    const sceneBox = scene.getBoundingClientRect();
    const bgBox = bg.getBoundingClientRect();
    const scale = Math.max(bgBox.width / bg.naturalWidth, bgBox.height / bg.naturalHeight);
    const imageWidth = bg.naturalWidth * scale;
    const imageHeight = bg.naturalHeight * scale;
    const imageLeft = bgBox.left + (bgBox.width - imageWidth) / 2 - sceneBox.left;
    const imageTop = bgBox.top + (bgBox.height - imageHeight) / 2 - sceneBox.top;

    scene.querySelectorAll('[data-scene-rect]').forEach(element => {
      const values = element.dataset.sceneRect.split(/\s+/).map(Number);
      if (values.length !== 4 || values.some(value => !Number.isFinite(value))) return;
      const [x, y, width, height] = values;
      Object.assign(element.style, {
        left: `${imageLeft + imageWidth * x / 100}px`,
        top: `${imageTop + imageHeight * y / 100}px`,
        width: `${imageWidth * width / 100}px`,
        height: `${imageHeight * height / 100}px`,
        right: 'auto'
      });
    });
    scene.dispatchEvent(new CustomEvent('scenehotspotlayout'));
  }

  function syncAll() { scenes.forEach(syncScene); }

  scenes.forEach(scene => {
    const bg = scene.querySelector('.room-bg');
    if (bg) bg.addEventListener('load', () => syncScene(scene));
    new MutationObserver(() => {
      if (scene.classList.contains('active')) requestAnimationFrame(() => syncScene(scene));
    }).observe(scene, {attributes: true, attributeFilter: ['class']});
  });

  const navs = [
    ['scene-02', [['ABOUT ME', () => window.openAboutModal?.()], ['MY WORK', () => document.querySelector('.hs-work')?.click()], ['WITH AI', () => document.querySelector('.hs-studio')?.click()]]],
    ['scene-03', [['查看作品', () => document.querySelector('.hs-work-poster')?.click()]]],
    ['scene-04', [['查看 AI 作品', () => document.querySelector('.hs-computer')?.click()], ['查看荣誉', () => document.querySelector('.hs-trophy')?.click()]]],
    ['scene-05', [['查看证书', () => window.openHonorsModal?.()]]]
  ];

  navs.forEach(([sceneId, actions]) => {
    const scene = document.getElementById(sceneId);
    if (!scene) return;
    const nav = document.createElement('nav');
    nav.className = 'mobile-scene-actions';
    nav.setAttribute('aria-label', '当前场景快捷入口');
    actions.forEach(([label, action]) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = label;
      button.addEventListener('click', event => {
        event.stopPropagation();
        action();
      });
      nav.append(button);
    });
    scene.append(nav);
  });

  window.addEventListener('resize', syncAll, {passive: true});
  window.addEventListener('orientationchange', () => setTimeout(syncAll, 120), {passive: true});
  requestAnimationFrame(syncAll);
})();
