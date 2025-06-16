// ✅ 通用 Mermaid 配色（兼容浅色与深色背景）
const mermaidThemes = {
  neutral: {
    theme: "base",
    themeVariables: {
      background: "transparent", // 保持与站点背景一致
      primaryColor: "#ffffff",   // 节点背景（高亮）
      nodeBkg: "#ffffff",        // 同上
      primaryTextColor: "#111111", // 黑色文字，在亮暗背景都清晰
      primaryBorderColor: "#7aa2f7", // 柔和蓝边框
      lineColor: "#7aa2f7",         // 同上
      fontSize: "16px",
      fontFamily: "Segoe UI, PingFang SC, Hiragino Sans GB, Microsoft YaHei, sans-serif",
    }
  }
};

// ✅ Mermaid 初始化（仅执行一次）
let mermaidAlreadyInitialized = false;
function configureMermaid() {
  if (mermaidAlreadyInitialized) return;
  mermaid.initialize({
    startOnLoad: false,
    ...universalMermaidTheme
  });
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
