// ✅ 通用 Mermaid 配色（兼容浅色与深色背景）
window.mermaidThemes = window.mermaidThemes || {
  universal: {
    theme: "default",
    themeVariables: {
      background: "transparent",
      primaryColor: "#f8f9fa",          // 浅灰白节点背景
      nodeBkg: "#f8f9fa",
      primaryTextColor: "#222222",      // 深灰文字（在亮/暗背景都清晰）
      primaryBorderColor: "#6cace4",    // 清爽蓝边
      lineColor: "#6cace4",             // 连线颜色
      noteBkgColor: "#fdfdfd",
      clusterBkg: "#f8f9fa",
      edgeLabelBackground: "#ffffff",
      fontSize: "16px",
      fontFamily: "Segoe UI, PingFang SC, Hiragino Sans GB, Microsoft YaHei, sans-serif",
      nodePadding: "12",
    }
  }
};

// ✅ Mermaid 初始化（仅执行一次）
let mermaidAlreadyInitialized = false;
function configureMermaid() {
  if (mermaidAlreadyInitialized) return;
  const config = Object.assign({ startOnLoad: false }, mermaidThemes.unified);
  mermaid.initialize(config);
  mermaidAlreadyInitialized = true;
}

// ✅ 清除并重新渲染 Mermaid 图表
function renderAllMermaid() {
  // 1. 回退 SVG 为 code block
  document.querySelectorAll('div.mermaid').forEach(div => {
    const raw = div.dataset.rawCode || div.textContent;
    const pre = document.createElement('pre');
    const code = document.createElement('code');
    code.className = 'language-mermaid';
    code.textContent = raw;
    pre.appendChild(code);
    div.replaceWith(pre);
  });

  // 2. 替换 code block 为 div.mermaid
  document.querySelectorAll('code.language-mermaid').forEach(code => {
    const pre = code.parentElement;
    const div = document.createElement('div');
    div.className = 'mermaid';
    div.textContent = code.textContent;
    div.dataset.rawCode = code.textContent;
    pre.replaceWith(div);
  });

  // 3. Mermaid 渲染
  requestAnimationFrame(() => {
    try {
      mermaid.init();
    } catch (e) {
      console.warn("[Mermaid] render error:", e);
    }
  });
}

// ✅ 启动逻辑
function initMermaid() {
  configureMermaid();
  renderAllMermaid();
}

// ✅ 生命周期管理器
(function setupMermaidLifecycle() {
  // 首次加载
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMermaid);
  } else {
    initMermaid();
  }

  // 支持 InstantClick 页面切换
  if (window.InstantClick) {
    InstantClick.on('change', () => {
      initMermaid();
    });
  }

  // ❌ 不再监听主题变化，主题为固定风格
})();
