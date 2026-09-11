(function () {
  'use strict';
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ROBOT = '弹窗/机器人ip/跪姿.png';
  var layer, card, robot, main, beg, hideTimer;

  function ensure() {
    if (layer) return;
    layer = document.createElement('div');
    layer.className = 'load-toast-layer';
    layer.setAttribute('aria-hidden', 'true');
    layer.innerHTML =
      '<div class="load-toast-card">' +
      '<img class="load-toast-robot" src="' + ROBOT + '" alt="小机器人正在加载" />' +
      '<div class="load-toast-texts">' +
      '<p class="load-toast-main">初次加载可能需要一点时间，您喝口水稍等一下下^^</p>' +
      '<p class="load-toast-beg">谢谢您的时间~</p>' +
      '</div>' +
      '</div>';
    card = layer.querySelector('.load-toast-card');
    robot = layer.querySelector('.load-toast-robot');
    main = layer.querySelector('.load-toast-main');
    beg = layer.querySelector('.load-toast-beg');
    var style = document.createElement('style');
    style.textContent = [
      '.load-toast-layer{position:absolute;inset:0;z-index:60;display:flex;align-items:flex-end;justify-content:flex-start;padding:0 0 68px 30px;pointer-events:none}',
      '.load-toast-card{display:flex;flex-direction:row;align-items:center;gap:18px;width:max-content;max-width:min(90vw,580px);background:#F3EBDD;border:2px solid #1a1a1a;box-shadow:8px 8px 0 rgba(22,74,168,.65);padding:15px 26px 15px 14px;text-align:left}',
      '.load-toast-robot{width:100px;height:auto;display:block;flex:0 0 auto;filter:drop-shadow(3px 4px 5px rgba(0,0,0,.15))}',
      '.load-toast-texts{display:flex;flex-direction:column;gap:7px;min-width:0}',
      '.load-toast-main{margin:0;display:inline-flex;align-items:center;gap:9px;font:700 16px/1.7 "Microsoft YaHei","PingFang SC",sans-serif;color:#FFFFFF;background:#111111;padding:9px 14px 8px;border-radius:2px;white-space:nowrap}',
      '.load-toast-main::before{content:"";width:9px;height:9px;background:#F1D52F;flex:0 0 auto}',
      '.load-toast-beg{margin:0;font:700 15px/1.4 "Microsoft YaHei","PingFang SC",sans-serif;color:#1a1a1a;background:#F1D52F;padding:5px 12px 4px;border:2px solid #1a1a1a;width:max-content}',
      '@media (max-width:600px){.load-toast-layer{padding:0 0 22px 14px}.load-toast-card{gap:12px;padding:12px 16px 12px 10px}.load-toast-robot{width:78px}.load-toast-main{font-size:14px}.load-toast-beg{font-size:13px}}'
    ].join('\n');
    document.head.append(style);
  }

  function show(container, duration) {
    ensure();
    if (container && layer.parentElement !== container) container.append(layer);
    var ms = duration || 5000;
    clearTimeout(hideTimer);
    gsap.killTweensOf([card, robot, main, beg]);
    layer.setAttribute('aria-hidden', 'false');
    gsap.set(card, {autoAlpha: 0, y: 24, scale: 0.96});
    gsap.set(main, {autoAlpha: 0, y: 8});
    gsap.set(beg, {autoAlpha: 0, y: 4, scale: 0.6, rotation: -2});
    if (reduced) {
      gsap.set([card, main, beg], {autoAlpha: 1, y: 0, scale: 1, rotation: -2});
      hideTimer = setTimeout(hide, ms);
      return;
    }
    gsap.to(card, {autoAlpha: 1, y: 0, scale: 1, duration: 0.38, ease: 'power2.out', overwrite: true});
    gsap.to(main, {autoAlpha: 1, y: 0, duration: 0.3, delay: 0.15, ease: 'power2.out', overwrite: true});
    gsap.to(robot, {y: -7, duration: 0.9, ease: 'sine.inOut', yoyo: true, repeat: -1, overwrite: true});
    gsap.to(beg, {autoAlpha: 1, y: 0, scale: 1, rotation: -2, duration: 0.34, delay: 0.25, ease: 'back.out(2.2)', overwrite: true});
    hideTimer = setTimeout(hide, ms);
  }

  function hide() {
    if (!layer) return;
    clearTimeout(hideTimer);
    gsap.killTweensOf([card, robot, main, beg]);
    gsap.to(card, {autoAlpha: 0, y: -14, scale: 0.97, duration: 0.3, ease: 'power2.in', overwrite: true, onComplete: function () { layer.setAttribute('aria-hidden', 'true'); }});
  }

  window.showLoadingToast = show;
})();
