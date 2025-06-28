(() => {
  // ✅ 只声明一次 Mermaid 配色
  if (!window.mermaidThemes) {
    window.mermaidThemes = {
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
  }

  // ✅ 初始化锁，避免重复执行
  window.mermaidAlreadyInitialized = window.mermaidAlreadyInitialized || false;

  // ✅ Mermaid 初始化配置
  function configureMermaid() {
    if (window.mermaidAlreadyInitialized) return;
    const config = Object.assign({ startOnLoad: false }, window.mermaidThemes.universal);
    mermaid.initialize(config);
    window.mermaidAlreadyInitialized = true;
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

  // ✅ 主入口函数（提供全局访问）
  window.initMermaid = function () {
    configureMermaid();
    renderAllMermaid();
  };

  // ✅ 生命周期挂载：首次加载 & InstantClick 支持
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", window.initMermaid);
  } else {
    window.initMermaid();
  }

  if (window.InstantClick) {
    InstantClick.on('change', () => {
      window.initMermaid();
    });
  }
})();
