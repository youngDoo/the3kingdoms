/* 《三国里的一天》放映页引擎 —— 所有故事共用
   每本故事的 index.html 只需在加载本文件之前定义 window.STORY：
     STORY = {
       slug:  'liubei',
       title: '大耳朵刘玄德',
       bgm:   [{from:1,to:3,src:'audio/bgm-1.mp3',vol:0.35}, ...],
       home:  '../../',            // 返回书架的地址
       homeLabel: '三国里的一天'
     }
   图/音/下载一律用相对本页的路径，站点与本地 file:// 都能跑。 */

(function () {
  const S = window.STORY || {};
  const HOME = S.home || '../../';
  const HOME_LABEL = S.homeLabel || '返回书架';

  const slides = [...document.querySelectorAll('.slide')];
  const rail   = document.getElementById('rail');
  const hint   = document.getElementById('hint');
  const dl     = document.getElementById('dl');
  let i = 0, hideTimer;

  slides.forEach((_, n) => {
    const b = document.createElement('button');
    b.className = 'dot'; b.title = '第 ' + (n + 1) + ' 页';
    b.onclick = e => { e.stopPropagation(); go(n); };
    rail.appendChild(b);
  });
  const dots = [...rail.children];

  /* ---- 资料下载：由 STORY.downloads 渲染（只在封面显示，见 go()） ---- */
  (function renderDownloads() {
    if (!dl) return;
    const items = S.downloads || [];
    if (!items.length) { dl.style.display = 'none'; return; }
    items.forEach(d => {
      const a = document.createElement('a');
      a.href = d.file;
      a.textContent = d.label;
      a.setAttribute('download', '');
      dl.appendChild(a);
    });
  })();

  /* ---- 背景音乐：分段，默认开启，翻页自动交叉淡入淡出 ----
     浏览器要求首次播放需有人工交互：被拦时自动进入“待开启”，任意点击/按键后立即起播。 */
  const BGM = S.bgm || [];
  const bgmEls = BGM.map(s => {
    const a = new Audio(s.src); a.loop = true; a.preload = 'auto'; a.volume = 0; return a;
  });
  let bgmOn = true;        // 默认打开
  let bgmPending = false;  // 已请求播放但被浏览器拦下，等首次交互

  function bgmSeg(n) {                       // n = 1-based 页码
    const k = BGM.findIndex(s => n >= s.from && n <= s.to);
    return k < 0 ? 0 : k;
  }
  function bgmLabel() {
    const tag = document.getElementById('bgm');
    if (!bgmEls.length) { tag.style.display = 'none'; return; }
    tag.classList.toggle('on', bgmOn);
    tag.textContent = !bgmOn ? '♪ 配乐：关（点这里或按 M 开启）'
                    : bgmPending ? '♪ 配乐：待开启（按任意键或点一下）'
                    : '♪ 配乐：开（按 M 关）';
  }
  function bgmArm() {                        // 首次交互后立刻起播
    if (bgmPending) return;
    bgmPending = true; bgmLabel();
    const kick = () => {
      bgmPending = false;
      ['pointerdown', 'keydown', 'touchstart', 'click'].forEach(t =>
        window.removeEventListener(t, kick, true));
      bgmLabel();          // 起播后立刻把标签从“待开启”改回“开”
      bgmApply();
    };
    ['pointerdown', 'keydown', 'touchstart', 'click'].forEach(t =>
      window.addEventListener(t, kick, true));
  }
  function bgmFade(el, to, ms) {             // 手动音量渐变（比 Web Audio 更不容易被策略拦）
    clearInterval(el._fade);
    const steps = Math.max(1, Math.round(ms / 40));
    const from = el.volume, d = (to - from) / steps;
    let n = 0;
    el._fade = setInterval(() => {
      n++;
      el.volume = (to > 0 && el.paused) ? 0 : Math.max(0, Math.min(1, from + d * n));
      if (n >= steps) { clearInterval(el._fade); if (to === 0) el.pause(); }
    }, 40);
  }
  function bgmApply() {
    if (!bgmEls.length) return;
    const k = bgmSeg(i + 1);
    bgmEls.forEach((el, j) => {
      if (!bgmOn) { bgmFade(el, 0, 700); return; }
      if (j === k) {
        if (el.paused) {
          el.volume = 0;
          const p = el.play();
          if (p && p.catch) p.catch(() => bgmArm());
        }
        bgmFade(el, BGM[j].vol, 1400);
      } else {
        bgmFade(el, 0, 1000);
      }
    });
  }
  function bgmToggle() {
    bgmOn = !bgmOn;
    if (bgmOn) bgmPending = false;
    bgmLabel();
    bgmApply();
  }
  document.getElementById('bgm').addEventListener('click', e => { e.stopPropagation(); bgmToggle(); });
  bgmLabel();

  function go(n) {
    i = Math.max(0, Math.min(slides.length - 1, n));
    slides.forEach((s, k) => s.classList.toggle('on', k === i));
    dots.forEach((d, k) => d.classList.toggle('on', k === i));
    history.replaceState(null, '', '#' + (i + 1));
    if (dl) dl.classList.toggle('on', i === 0);   // 资料下载只在封面出现
    bgmApply();
    preload();
  }
  function preload() {
    [i + 1, i + 2].forEach(k => {
      if (slides[k]) {
        const im = slides[k].querySelector('img');
        if (im) { const p = new Image(); p.src = im.src; }
      }
    });
  }
  function toggleNotes() {
    const on = document.body.classList.toggle('notes-on');
    document.body.classList.toggle('notes-off', !on);
    const n = slides[i].querySelector('.notes');
    if (n) n.classList.toggle('on', on);
  }

  document.addEventListener('keydown', e => {
    const k = e.key;
    if (k === 'ArrowRight' || k === 'ArrowDown' || k === ' ' || k === 'PageDown') { e.preventDefault(); go(i + 1); }
    else if (k === 'ArrowLeft' || k === 'ArrowUp' || k === 'PageUp') { e.preventDefault(); go(i - 1); }
    else if (k === 'Home') go(0);
    else if (k === 'End') go(slides.length - 1);
    else if (k === 'n' || k === 'N') toggleNotes();
    else if (k === 'm' || k === 'M') bgmToggle();
    else if (k === 'Escape') location.href = HOME;      // 回书架
    else if (k === 'f' || k === 'F') { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen(); }
  });

  // 点击/触摸：右半边翻到下一页，左侧 35% 回上一页
  document.getElementById('stage').addEventListener('click', e => {
    go(e.clientX < window.innerWidth * 0.35 ? i - 1 : i + 1);
  });

  // 滑动
  let x0 = null;
  addEventListener('touchstart', e => x0 = e.touches[0].clientX, { passive: true });
  addEventListener('touchend', e => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 45) go(dx < 0 ? i + 1 : i - 1);
    x0 = null;
  }, { passive: true });

  // 提示条：开头显示，任何翻页后短暂出现再淡出
  function flash() {
    hint.classList.add('show');
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => hint.classList.remove('show'), 2600);
  }
  addEventListener('load', () => { go(parseInt(location.hash.slice(1), 10) - 1 || 0); flash(); });
  addEventListener('mousemove', () => {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => hint.classList.remove('show'), 1800);
  });

  // 顶部进度条
  addEventListener('mousemove', () => rail.classList.add('show'));
  addEventListener('touchstart', () => { rail.classList.add('show'); }, { passive: true });

  // 返回书架的链接（若页面里没有 .home 就自动插入一个）
  let homeLink = document.querySelector('.home');
  if (!homeLink) {
    homeLink = document.createElement('a');
    homeLink.className = 'home';
    document.body.appendChild(homeLink);
  }
  homeLink.href = HOME;
  homeLink.textContent = '← ' + HOME_LABEL;
})();
