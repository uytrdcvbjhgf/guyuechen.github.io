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

// ✅ 初始化 Mermaid 配置（只调用一次）
function configureMermaid() {
  const config = Object.assign({ startOnLoad: false }, getMermaidTheme());
  mermaid.initialize(config);
}

// ✅ 重新挂载 Mermaid 图表
function renderAllMermaid() {
  // Step 1: 回退渲染过的 SVG 图为 code block
  document.querySelectorAll('div.mermaid').forEach(div => {
    const rawCode = div.getAttribute('data-processed') === 'true' ? div.dataset.rawCode : div.textContent;
    const pre = document.createElement('pre');
    const code = document.createElement('code');
    code.className = 'language-mermaid';
    code.textContent = rawCode;
    pre.appendChild(code);
    div.replaceWith(pre);
  });

  // Step 2: 将 code block 转换为 Mermaid div
  document.querySelectorAll('code.language-mermaid').forEach(code => {
    const pre = code.parentElement;
    const div = document.createElement('div');
    div.className = 'mermaid';
    div.textContent = code.textContent;
    div.dataset.rawCode = code.textContent;
    div.dataset.processed = 'true';
    pre.replaceWith(div);
  });

  // Step 3: 真正渲染
  requestAnimationFrame(() => {
    try {
      mermaid.init();
    } catch (e) {
      console.warn("[Mermaid] render error:", e);
    }
  });
}

// ✅ 主初始化函数
function initMermaid() {
  configureMermaid();
  renderAllMermaid();
}

// ✅ 生命周期管理器
function setupMermaidLifecycle() {
  // 页面初次加载
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMermaid);
  } else {
    initMermaid();
  }

  // 支持 InstantClick 的 SPA 页面切换
  if (window.InstantClick) {
    InstantClick.on('change', () => {
      initMermaid();
    });
  }

  // DOM class 变化触发（用于 dark/light 切换）
  if (!window._mermaidThemeObserverAttached) {
    window._mermaidThemeObserverAttached = true;
    const observer = new MutationObserver(() => {
      initMermaid();
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  }
}

setupMermaidLifecycle();
