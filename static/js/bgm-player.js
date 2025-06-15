// 动态注入播放器元素
const playerHTML = `
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
      z-index: 1000;
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
  <div id="bgm-container">
    <button id="play-music" title="背景音乐">🎸</button>
    <audio id="bgm" loop>
      <source src="https://raw.githubusercontent.com/guyuechen/gallery/main/music/sos.mp3" type="audio/mpeg">
    </audio>
  </div>
`;

document.body.insertAdjacentHTML("beforeend", playerHTML);

const btn = document.getElementById('play-music');
const bgm = document.getElementById('bgm');
let isPlaying = false;

const updateButtonUI = () => {
  if (isPlaying) {
    btn.textContent = '⏸️';
    btn.classList.add('playing');
  } else {
    btn.textContent = '▶️';
    btn.classList.remove('playing');
  }
};

btn.addEventListener('click', () => {
  if (isPlaying) {
    bgm.pause();
  } else {
    bgm.play().catch((e) => console.error("播放失败", e));
  }
  isPlaying = !isPlaying;
  updateButtonUI();
});

// 页面切换后仍保持按钮状态
document.addEventListener('instantclick:change', () => {
  updateButtonUI();
});
