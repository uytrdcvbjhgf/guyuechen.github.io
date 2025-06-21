(() => {
  if (document.getElementById('bgm-container')) {
    console.log('🎵 Player already exists. Skipping injection.');
    return;
  }

  // === 歌单列表 ===
  const playlist = [
    'https://raw.githubusercontent.com/guyuechen/gallery/main/music/sos.mp3',
    'https://raw.githubusercontent.com/guyuechen/gallery/main/music/sos_Live_At_Hammersmith_Odeon.mp3',
    // 可继续添加更多歌曲...
  ];

  let currentTrackIndex = 0;

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

    <button id="play-music" title="Sleepy? Music!">🎸</button>
    <audio id="bgm" preload="auto"></audio>
  `;

  document.documentElement.appendChild(container);

  const btn = container.querySelector('#play-music');
  const bgm = container.querySelector('#bgm');

  // === 播放状态管理 ===
  let isPlaying = localStorage.getItem("bgm-playing") === "true";

  const updateButtonUI = () => {
    btn.textContent = isPlaying ? '🙉' : '🎸';
    btn.classList.toggle('playing', isPlaying);
  };

  const loadCurrentTrack = () => {
    bgm.src = playlist[currentTrackIndex];
    bgm.load(); // 强制刷新资源
  };

  const preloadNextTrack = () => {
    const nextIndex = (currentTrackIndex + 1) % playlist.length;
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "audio";
    link.href = playlist[nextIndex];
    document.head.appendChild(link);
  };

  const playCurrent = () => {
    loadCurrentTrack();
    bgm.play().catch(err => {
      console.warn("🎧 播放失败:", err);
      isPlaying = false;
      updateButtonUI();
    });
  };

  // === 初始化恢复播放状态 ===
  window.addEventListener('load', () => {
    if (isPlaying) {
      playCurrent();
    }
    updateButtonUI();
  });

  // === 播放结束，切换下一首 ===
  bgm.addEventListener("ended", () => {
    currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
    playCurrent();
  });

  // === 每次播放时预加载下一首 ===
  bgm.addEventListener("playing", preloadNextTrack);

  // === 点击切换播放状态 ===
  btn.addEventListener("click", () => {
    if (isPlaying) {
      bgm.pause();
    } else {
      playCurrent();
    }
    isPlaying = !isPlaying;
    localStorage.setItem("bgm-playing", String(isPlaying));
    updateButtonUI();
  });

  // === SPA 页面切换时刷新按钮状态 ===
  document.addEventListener('instantclick:change', updateButtonUI);
})();
