(() => {
  if (document.getElementById('bgm-container')) {
    console.log('🎵 Player already exists. Skipping injection.');
    return;
  }

  // === 创建容器 ===
  const container = document.createElement('div');
  container.id = 'bgm-container';
  container.innerHTML = `
    <style>
      #play-music {
        position: fixed;
        top: 64px;
        right: 30px;
        width: 42px;
        height: 42px;
        border: none;
        border-radius: 50%;
        background-color: rgba(255, 255, 255, 0.12);
        backdrop-filter: blur(6px);
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        font-size: 18px;
        cursor: pointer;
        z-index: 10000;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      #play-music:hover {
        background-color: rgba(255, 255, 255, 0.2);
        transform: scale(1.1);
      }

      #play-music.playing {
        color: #a179dc;
        animation: pulse 1.2s infinite ease-in-out;
      }

      #play-music:not(.playing) {
        color: #3399ff;
        animation: none;
      }

      @keyframes pulse {
        0%   { transform: scale(1); }
        50%  { transform: scale(1.15); }
        100% { transform: scale(1); }
      }
    </style>

    <button id="play-music" title="背景音乐">🎸</button>
    <audio id="bgm" loop preload="auto">
      <source src="https://raw.githubusercontent.com/guyuechen/gallery/main/music/sos.mp3" type="audio/mpeg">
    </audio>
  `;

  // === 插入到 <html> 内但 <body> 外（防止被替换） ===
  document.documentElement.appendChild(container);

  const btn = container.querySelector('#play-music');
  const bgm = container.querySelector('#bgm');

  // 状态恢复
  let isPlaying = localStorage.getItem("bgm-playing") === "true";

  const updateButtonUI = () => {
    if (isPlaying) {
      btn.textContent = '⏸️';
      btn.classList.add('playing');
    } else {
      btn.textContent = '▶️';
      btn.classList.remove('playing');
    }
  };

  // 初始化时尝试恢复播放
  window.addEventListener('load', () => {
    if (isPlaying) {
      bgm.play().then(() => {
        updateButtonUI();
      }).catch(() => {
        isPlaying = false;
        updateButtonUI();
      });
    } else {
      updateButtonUI();
    }
  });

  // 点击按钮播放/暂停
  btn.addEventListener('click', () => {
    if (isPlaying) {
      bgm.pause();
    } else {
      bgm.play().catch(err => console.error("播放失败", err));
    }
    isPlaying = !isPlaying;
    localStorage.setItem("bgm-playing", String(isPlaying));
    updateButtonUI();
  });

  // 页面切换后刷新按钮状态
  document.addEventListener('instantclick:change', () => {
    updateButtonUI();
  });
})();
