// ✅ Mermaid 主题配置
const mermaidThemes = {
  light: {
    theme: "default",
    themeVariables: {
      background: '#fff',
      primaryColor: '#f3f6fa',
      primaryTextColor: '#24292f',
      primaryBorderColor: '#b2becd',
      lineColor: '#90a4ae',
      nodeBkg: '#f3f6fa',
      fontFamily: 'Segoe UI, PingFang SC, Hiragino Sans GB, Microsoft YaHei, sans-serif',
      fontSize: '16px',
      nodePadding: '12',
    }
  },
  dark: {
    theme: "dark",
    themeVariables: {
      background: '#23272e',
      primaryColor: '#293042',
      primaryTextColor: '#e9eef6',
      primaryBorderColor: '#70b3ff',
      lineColor: '#7bb7ff',
      nodeBkg: '#293042',
      fontFamily: 'Segoe UI, PingFang SC, Hiragino Sans GB, Microsoft YaHei, sans-serif',
      fontSize: '16px',
      nodePadding: '12',
    }
  }
};

// ✅ 获取当前主题配置
function getMermaidTheme() {
  const theme = localStorage.getItem("pref-theme") || "light";
  return theme === "dark" ? mermaidThemes.dark : mermaidThemes.light;
}

// ✅ 初始化 Mermaid，只执行一次 mermaid.initialize
let mermaidAlreadyInitialized = false;
function configureMermaid() {
  if (mermaidAlreadyInitialized) return;
  const config = Object.assign({ startOnLoad: false }, getMermaidTheme());
  mermaid.initialize(config);
  mermaidAlreadyInitialized = true;
}

// ✅ 清除并重新渲染所有 Mermaid 图
function renderAllMermaid() {
  // 回退已渲染的 SVG 为 code block
  document.querySelectorAll('div.mermaid').forEach(div => {
    const raw = div.dataset.rawCode || div.textContent;
    const pre = document.createElement('pre');
    const code = document.createElement('code');
    code.className = 'language-mermaid';
    code.textContent = raw;
    pre.appendChild(code);
    div.replaceWith(pre);
  });

  // 替换 code block 为 div.mermaid
  document.querySelectorAll('code.language-mermaid').forEach(code => {
    const pre = code.parentElement;
    const div = document.createElement('div');
    div.className = 'mermaid';
    div.textContent = code.textContent;
    div.dataset.rawCode = code.textContent;
    pre.replaceWith(div);
  });

  requestAnimationFrame(() => {
    try {
      mermaid.init();
    } catch (e) {
      console.warn("[Mermaid] render error:", e);
    }
  });
}

// ✅ 总初始化逻辑（一次性设置）
function initMermaid() {
  configureMermaid();
  renderAllMermaid();
}

// ✅ 自动挂载（支持 SPA + 主题切换）
(function setupMermaidLifecycle() {
  // 页面初次加载
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMermaid);
  } else {
    initMermaid();
  }

  // SPA 页面切换（支持 InstantClick）
  if (window.InstantClick) {
    InstantClick.on('change', initMermaid);
  }

  // 主题切换自动监听（body.class 变化）
  if (!window._mermaidThemeObserverAttached) {
    window._mermaidThemeObserverAttached = true;
    const observer = new MutationObserver(() => {
      renderAllMermaid(); // ⚠️ 仅重新渲染，不再重新 initialize
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  }
})();
