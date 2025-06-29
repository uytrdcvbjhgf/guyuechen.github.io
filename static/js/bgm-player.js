(() => {
  if (document.getElementById('bgm-container')) {
    console.log('🎵 Player already exists. Skipping injection.');
    return;
  }

  const playlist = [
    "https://raw.githubusercontent.com/guyuechen/gallery/main/music/LadyWriter.mp3",
    "https://raw.githubusercontent.com/guyuechen/gallery/main/music/sos.mp3",
  ];
  let currentTrackIndex = 0;

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

  // 是否是新 session（标签页）
  const isNewSession = sessionStorage.getItem("bgm-session") !== "1";
  sessionStorage.setItem("bgm-session", "1");

  // localStorage 表示用户偏好（曾经点击播放）
  let userPreferred = localStorage.getItem("bgm-playing") === "true";

  // sessionStorage 表示当前 session 中是否正在播放
  let isPlaying = sessionStorage.getItem("bgm-playing") === "true";

  // 如果是新 session 且之前播放状态是 true，重置为 false
  if (isNewSession && isPlaying) {
    isPlaying = false;
    sessionStorage.setItem("bgm-playing", "false");
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

  bgm.addEventListener('ended', () => {
    currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
    playCurrent();
  });

  window.addEventListener('load', () => {
    // 实际 audio 状态优先于 sessionStorage
    if (isPlaying) {
      playCurrent();
      // 等待一点时间后确认 audio 是否真的在播放
      setTimeout(() => {
        if (bgm.paused) {
          isPlaying = false;
          sessionStorage.setItem("bgm-playing", "false");
          updateButtonUI();
          console.log("🎵 Reset the status of Audio playback");
        }
      }, 500);
    } else {
      updateButtonUI();
    }
  });

  btn.addEventListener('click', () => {
    if (isPlaying) {
      bgm.pause();
      isPlaying = false;
    } else {
      playCurrent();
      isPlaying = true;
      // 设置偏好（表示用户曾经点击播放）
      localStorage.setItem("bgm-playing", "true");
    }
    sessionStorage.setItem("bgm-playing", String(isPlaying));
    updateButtonUI();
  });

  // SPA 页面切换后按钮状态保持
  document.addEventListener('instantclick:change', () => {
    updateButtonUI();
  });
})();
