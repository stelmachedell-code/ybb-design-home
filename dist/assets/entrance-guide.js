(() => {
  const scene = document.getElementById('scene-01');
  const title = document.getElementById('scene-title');
  const guide = document.createElement('aside');
  guide.id = 'entrance-guide';
  guide.className = 'entrance-guide';
  guide.setAttribute('aria-label', '欢迎来到 DESIGN HOME');
  guide.innerHTML = `
    <div class="entrance-guide-paper">
      <span class="entrance-guide-kicker">SCENE 01 · WELCOME HOME</span>
      <p>点击<strong>门把手</strong>进入 <strong class="entrance-guide-name">DESIGN HOME</strong>，也可以点击右下角区域直接查看 DESIGN。</p>
      <button class="entrance-guide-close" type="button" aria-label="关闭欢迎提示">×</button>
    </div>
    <div class="entrance-guide-robot-wrap"><img class="entrance-guide-robot" src="弹窗/机器人ip/机器人打招呼.png" alt="蓝色小机器人向你打招呼" width="1435" height="1077" /><span class="entrance-guide-hi" aria-hidden="true">HI</span></div>`;
  scene.append(guide);
  let visible = false;
  let timer;
  let autoTimer;
  let dismissTimer;
  let leaveTimer;
  let dismissed = false;
  let mode = 'hover';
  function setVisible(value) {
    clearTimeout(timer);
    visible = value;
    guide.classList.toggle('is-visible', value);
    if (value) guide.classList.remove('is-leaving');
    guide.inert = !value;
    guide.setAttribute('aria-hidden', String(!value));
    title.setAttribute('aria-expanded', String(value));
  }
  function slideOut() {
    if (!visible) return;
    clearTimeout(dismissTimer);
    visible = false;
    guide.classList.remove('is-visible');
    guide.classList.add('is-leaving');
    guide.inert = true;
    guide.setAttribute('aria-hidden', 'true');
    title.setAttribute('aria-expanded', 'false');
    dismissed = true;
    mode = 'hover';
    clearTimeout(leaveTimer);
    leaveTimer = setTimeout(() => guide.classList.remove('is-leaving'), 650);
  }
  setVisible(false);
  const near = (x, y, r, gap) => x >= r.left-gap && x <= r.right+gap && y >= r.top-gap && y <= r.bottom+gap;
  scene.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || !scene.classList.contains('active')) return;
    if (mode === 'auto') return;
    const a = title.getBoundingClientRect();
    const onTitle = near(event.clientX, event.clientY, a, 32);
    if (!onTitle) dismissed = false;
    if (onTitle && !dismissed) { setVisible(true); return; }
    if (!visible) return;
    const b = guide.getBoundingClientRect();
    const zone = {left: Math.min(a.left,b.left), right: Math.max(a.right,b.right), top: Math.min(a.top,b.top), bottom: Math.max(a.bottom,b.bottom)};
    if (near(event.clientX,event.clientY,zone,24) || guide.contains(document.activeElement)) clearTimeout(timer);
    else { clearTimeout(timer); timer = setTimeout(() => setVisible(false), 250); }
  });
  title.addEventListener('click', event => {
    if (mode === 'auto') {
      slideOut();
      return;
    }
    const next = event.pointerType === 'touch' ? !visible : true;
    dismissed = !next; setVisible(next);
  });
  title.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); title.click(); }
  });
  title.addEventListener('focus', () => {
    if (mode !== 'auto' && title.matches(':focus-visible')) setVisible(true);
  });
  guide.querySelector('button').addEventListener('click', () => {
    title.focus({preventScroll:true});
    slideOut();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && visible) {
      if (guide.contains(document.activeElement)) title.focus({preventScroll:true});
      slideOut();
    }
  });
  document.addEventListener('pointerdown', event => {
    if (mode === 'auto') return;
    if (!title.contains(event.target) && !guide.contains(event.target)) setVisible(false);
  });
  function showAuto() {
    clearTimeout(autoTimer);
    autoTimer = setTimeout(() => {
      if (!scene.classList.contains('active')) return;
      dismissed = false;
      mode = 'auto';
      guide.classList.remove('is-leaving');
      setVisible(true);
      clearTimeout(dismissTimer);
      dismissTimer = setTimeout(slideOut, 6500);
    }, 250);
  }
  new MutationObserver(() => {
    if (!scene.classList.contains('active')) {
      clearTimeout(autoTimer);
      clearTimeout(dismissTimer);
      setVisible(false);
      guide.classList.remove('is-leaving');
      mode = 'hover';
      dismissed = false;
    } else {
      showAuto();
    }
  }).observe(scene, {attributes:true,attributeFilter:['class']});
})();
