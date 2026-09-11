(() => {
  'use strict';
  const AUTO_DISMISS_MS = 6500;
  const LEAVE_MS = 650;
  const configs = [
    {
      id: 'scene-02',
      kicker: 'SCENE 02 · LIVING ROOM',
      main: '这个房间藏着3个交互点，可以探索了解',
      note: '透露一下秘密：交互点分别藏在机器人、海报、电脑中',
      robot: '弹窗/机器人ip/机器人和电脑.png',
      alt: '蓝色小机器人介绍客厅交互点',
      delay: 300
    },
    {
      id: 'scene-03',
      kicker: 'SCENE 03 · MY WORK',
      main: '点击海报，浏览「商业作品」「获奖作品」',
      note: '',
      robot: '弹窗/机器人ip/机器人画画.png',
      alt: '蓝色小机器人介绍作品海报交互点',
      delay: 300
    },
    {
      id: 'scene-04',
      kicker: 'SCENE 04 · WITH AI',
      main: '点击电脑查看 WITH AI 项目；点击右上角奖杯进入荣誉陈列墙',
      note: '',
      robot: '弹窗/机器人ip/with AI.png',
      alt: '蓝色小机器人介绍电脑和奖杯交互点',
      delay: 300
    },
    {
      id: 'scene-05',
      kicker: 'SCENE 05 · MY HONORS',
      main: '点击奖杯浏览荣誉',
      note: '',
      robot: '弹窗/机器人ip/机器人打招呼.png',
      alt: '蓝色小机器人介绍荣誉陈列墙交互点',
      delay: 300
    }
  ];

  configs.forEach(cfg => {
    const scene = document.getElementById(cfg.id);
    if (!scene) return;

    const guide = document.createElement('aside');
    guide.id = 'guide-' + cfg.id;
    guide.className = 'entrance-guide scene-guide';
    guide.setAttribute('aria-label', cfg.kicker + '交互引导');
    guide.innerHTML = `
      <div class="entrance-guide-paper">
        <span class="entrance-guide-kicker">${cfg.kicker}</span>
        <p class="scene-guide-main">${cfg.main}</p>
        ${cfg.note ? '<p class="scene-guide-note">' + cfg.note + '</p>' : ''}
        <button class="entrance-guide-close" type="button" aria-label="关闭交互引导">×</button>
      </div>
      <div class="entrance-guide-robot-wrap"><img class="entrance-guide-robot" src="${cfg.robot}" alt="${cfg.alt}" width="1435" height="1077" /><span class="entrance-guide-hi" aria-hidden="true">HI</span></div>`;
    scene.append(guide);

    let visible = false;
    let showTimer;
    let dismissTimer;
    let leaveTimer;

    function setVisible(value) {
      visible = value;
      guide.classList.toggle('is-visible', value);
      if (value) guide.classList.remove('is-leaving');
      guide.inert = !value;
      guide.setAttribute('aria-hidden', String(!value));
    }

    function slideOut() {
      if (!visible) return;
      clearTimeout(dismissTimer);
      visible = false;
      guide.classList.remove('is-visible');
      guide.classList.add('is-leaving');
      guide.inert = true;
      guide.setAttribute('aria-hidden', 'true');
      clearTimeout(leaveTimer);
      leaveTimer = setTimeout(() => guide.classList.remove('is-leaving'), LEAVE_MS);
    }

    setVisible(false);

    guide.querySelector('.entrance-guide-close').addEventListener('click', slideOut);

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && visible) slideOut();
    });

    new MutationObserver(() => {
      const active = scene.classList.contains('active');
      clearTimeout(showTimer);
      clearTimeout(dismissTimer);
      if (!active) {
        clearTimeout(leaveTimer);
        visible = false;
        guide.classList.remove('is-visible', 'is-leaving');
        guide.inert = true;
        guide.setAttribute('aria-hidden', 'true');
        return;
      }
      showTimer = setTimeout(() => {
        if (!scene.classList.contains('active')) return;
        guide.classList.remove('is-leaving');
        setVisible(true);
        dismissTimer = setTimeout(slideOut, AUTO_DISMISS_MS);
      }, cfg.delay || 300);
    }).observe(scene, {attributes: true, attributeFilter: ['class']});
  });
})();
