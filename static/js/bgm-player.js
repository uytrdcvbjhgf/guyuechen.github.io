(() => {
  if (document.getElementById('bgm-container')) {
    console.log('🎵 Player already exists. Skipping injection.');
    return;
  }

  const playlist = [
    "https://raw.githubusercontent.com/guyuechen/gallery/main/music/sos_Live_At_Hammersmith_Odeon.mp3",
    "https://raw.githubusercontent.com/guyuechen/gallery/main/music/sos.mp3",
    // 🔽 可以继续添加更多曲目
  ];

  let currentTrackIndex = 0;
  let isPlaying = localStorage.getItem("bgm-playing") === "true";

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

  const loadCurrentTrack = () => {
    bgm.src = playlist[currentTrackIndex];
    bgm.load();
  };

  const updateButtonUI = () => {
    if (isPlaying) {
      btn.textContent = '🙉';
      btn.classList.add('playing');
    } else {
      btn.textContent = '🎸';
      btn.classList.remove('playing');
    }
  };

  // 自动下一首
  bgm.addEventListener('ended', () => {
    currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
    loadCurrentTrack();
    if (isPlaying) {
      bgm.play().catch(() => {
        isPlaying = false;
        updateButtonUI();
      });
    }
  });

  // 初始化加载音轨
  loadCurrentTrack();

  window.addEventListener('load', () => {
    if (isPlaying) {
      bgm.play().then(updateButtonUI).catch(() => {
        isPlaying = false;
        updateButtonUI();
      });
    } else {
      updateButtonUI();
    }
  });

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

  document.addEventListener('instantclick:change', () => {
    updateButtonUI();
  });
})();
