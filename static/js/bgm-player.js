(() => {
  if (document.getElementById('bgm-container')) {
    console.log('🎵 Player already exists. Skipping injection.');
    return;
  }

  const playlist = [
    "https://raw.githubusercontent.com/guyuechen/gallery/main/music/sos.mp3",
    "https://raw.githubusercontent.com/guyuechen/gallery/main/music/LadyWriter.mp3"
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

  let isPlaying = localStorage.getItem("bgm-playing") === "true";

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
    if (isPlaying) {
      playCurrent();
    }
    updateButtonUI();
  });

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

  document.addEventListener('instantclick:change', () => {
    updateButtonUI();
  });
})();
