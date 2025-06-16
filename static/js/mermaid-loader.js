// ✅ Mermaid 配置主题
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

// ✅ 获取主题配置
function getMermaidTheme() {
  const theme = localStorage.getItem("pref-theme") || "light";
  return theme === "dark" ? mermaidThemes.dark : mermaidThemes.light;
}

// ✅ 初始化并渲染 Mermaid
function initMermaid() {
  // 💡 先清除已有 mermaid SVG（回退为 <pre><code>）
  renderAllMermaid(); // 先回退为 <pre><code>
  
  const config = Object.assign({ startOnLoad: false }, getMermaidTheme());
  mermaid.initialize(config);

  // ✅ 重新挂载
  requestAnimationFrame(() => {
    try {
      mermaid.init();
    } catch (e) {
      console.warn("[Mermaid] render error:", e);
    }
  });
}

// ✅ 将 code block 渲染为 div.mermaid
function renderAllMermaid() {
  document.querySelectorAll('div.mermaid').forEach(div => {
    if (div.dataset.rawCode) {
      const pre = document.createElement('pre');
      const code = document.createElement('code');
      code.className = 'language-mermaid';
      code.textContent = div.dataset.rawCode;
      pre.appendChild(code);
      div.replaceWith(pre);
    }
  });

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

// ✅ 自动重新挂载逻辑（SPA 支持 + DOM 监听）
function setupMermaidLifecycle() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMermaid);
  } else {
    initMermaid();
  }

  if (window.InstantClick) {
    InstantClick.on('change', () => initMermaid());
  }

  if (!window._mermaidThemeObserverAttached) {
    window._mermaidThemeObserverAttached = true;
    const observer = new MutationObserver(() => {
      requestAnimationFrame(() => initMermaid());
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  }
}

setupMermaidLifecycle();
