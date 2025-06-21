(() => {
  if (document.getElementById('bgm-container')) {
    console.log('🎵 Player already exists. Skipping injection.');
    return;
  }

  // ✅ 歌单定义（顺序播放）
  const playlist = [
    "https://raw.githubusercontent.com/guyuechen/gallery/main/music/sos.mp3",
    "https://raw.githubusercontent.com/guyuechen/gallery/main/music/sos_Live_At_Hammersmith_Odeon.mp3"
  ];
  let currentTrackIndex = 0;

  // ✅ 创建 HTML 结构
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

    <button id="play-music" title="Sleepy? Music!">🎸</button>
    <audio id="bgm" preload="auto" loop></audio>
  `;
  document.documentElement.appendChild(container);

  const btn = container.querySelector('#play-music');
  const bgm = container.querySelector('#bgm');

  // ✅ 当前状态标记
  let isPlaying = localStorage.getItem("bgm-playing") === "true";

  // ✅ 仅当 src 未设置或变化时才重新加载
  const loadCurrentTrack = () => {
    const expected = playlist[currentTrackIndex];
    if (!bgm.src.includes(expected)) {
      bgm.src = expected;
      bgm.load();
    }
  };

  // ✅ 播放当前曲目（不强制 reload）
  const playCurrent = () => {
    loadCurrentTrack();
    bgm.play().catch((err) => {
      console.warn("⛔ 播放失败:", err);
    });
  };

  // ✅ UI 状态更新
  const updateButtonUI = () => {
    if (isPlaying) {
      btn.textContent = '🙉';
      btn.classList.add('playing');
    } else {
      btn.textContent = '🎸';
      btn.classList.remove('playing');
    }
  };

  // ✅ 自动切换下一曲
  bgm.addEventListener('ended', () => {
    currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
    loadCurrentTrack();
    bgm.play();
  });

  // ✅ 初始尝试恢复播放
  window.addEventListener('load', () => {
    if (isPlaying) {
      playCurrent();
    }
    updateButtonUI();
  });

  // ✅ 按钮点击事件（切换播放/暂停）
  btn.addEventListener('click', () => {
    if (isPlaying) {
      bgm.pause();
    } else {
      playCurrent();
    }
    isPlaying = !isPlaying;
    localStorage.setItem("bgm-playing", String(isPlaying));
    updateButtonUI();
  });

  // ✅ 页面切换后刷新按钮状态（支持 SPA）
  document.addEventListener('instantclick:change', () => {
    updateButtonUI();
  });
})();
