(() => {
  if (document.getElementById('bgm-container')) {
    console.log('🎵 Player already exists. Skipping injection.');
    return;
  }

  const playlist = [
    "https://raw.githubusercontent.com/guyuechen/gallery/main/music/sos.mp3",
    "https://raw.githubusercontent.com/guyuechen/gallery/main/music/LadyWriter.mp3",
  ];
  let currentTrackIndex = 0;

  const container = document.createElement('div');
  container.id = 'bgm-container';
  container.innerHTML = `
    <style>
      #play-music {
        position: fixed;
        top: 20px;
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
    <audio id="bgm" preload="auto"></audio>
  `;
  document.documentElement.appendChild(container);

  const btn = container.querySelector('#play-music');
  const bgm = container.querySelector('#bgm');

  // 🔁 新 session 检查
  const isNewSession = sessionStorage.getItem("bgm-session") !== "1";
  sessionStorage.setItem("bgm-session", "1");

  // 🎵 用户播放偏好（localStorage）
  let userPreferred = localStorage.getItem("bgm-autoplay-enabled") === "true";

  // ▶️ 当前 session 播放状态
  let isPlaying = sessionStorage.getItem("bgm-is-playing") === "true";

  // 🧹 如果是新 session 且状态异常，强制重置
  if (isNewSession && isPlaying) {
    isPlaying = false;
    sessionStorage.setItem("bgm-is-playing", "false");
  }

  const updateButtonUI = () => {
    if (isPlaying) {
      btn.textContent = '🙉';
      btn.classList.add('playing');
    } else {
      btn.textContent = '🎸';
      btn.classList.remove('playing');
    }
  };

  const loadCurrentTrack = () => {
    const expected = playlist[currentTrackIndex];
    if (!bgm.src.includes(expected)) {
      bgm.src = expected;
      bgm.load();
    }
  };

  const playCurrent = () => {
    loadCurrentTrack();
    bgm.play().catch(err => {
      console.warn("播放失败", err);
    });
  };

  // ⏭ 自动切换下一首
  bgm.addEventListener('ended', () => {
    currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
    playCurrent();
  });

  // 🚀 页面加载后检查是否需要自动播放
  window.addEventListener('load', () => {
    if (isPlaying) {
      playCurrent();
      // 确认播放状态是否真实成功
      setTimeout(() => {
        if (bgm.paused) {
          isPlaying = false;
          sessionStorage.setItem("bgm-is-playing", "false");
          updateButtonUI();
          console.log("🎵 Reset the status of Audio playback");
        }
      }, 500);
    }
    updateButtonUI();
  });

  // 🖱️ 用户点击按钮播放/暂停
  btn.addEventListener('click', () => {
    if (isPlaying) {
      bgm.pause();
      isPlaying = false;
    } else {
      playCurrent();
      isPlaying = true;
      localStorage.setItem("bgm-autoplay-enabled", "true"); // 标记用户已主动播放
    }
    sessionStorage.setItem("bgm-is-playing", String(isPlaying));
    updateButtonUI();
  });

  // SPA 页面切换时同步状态
  document.addEventListener('instantclick:change', () => {
    updateButtonUI();
  });
})();
