(() => {
  if (!window.mermaidThemes) {
    window.mermaidThemes = {
      universal: {
        theme: "default",
        themeVariables: {
          background: "transparent",
          primaryColor: "#2e3440",
          nodeBkg: "#2e3440",
          clusterBkg: "#2e3440",
          primaryTextColor: "#d8dee9",
          primaryBorderColor: "#81a1c1",
          lineColor: "#81a1c1",
          edgeLabelBackground: "#3b4252",
          fontSize: "16px",
          fontFamily: "Segoe UI, PingFang SC, Hiragino Sans GB, Microsoft YaHei, sans-serif",
          nodePadding: "12",
        }
      }
    };
  }

  window.mermaidAlreadyInitialized = window.mermaidAlreadyInitialized || false;

  function configureMermaid() {
    if (window.mermaidAlreadyInitialized) return;
    const config = Object.assign({ startOnLoad: false }, window.mermaidThemes.universal);
    mermaid.initialize(config);
    window.mermaidAlreadyInitialized = true;
  }

  function renderAllMermaid() {
    document.querySelectorAll('div.mermaid').forEach(div => {
      const raw = div.dataset.rawCode || div.textContent;
      const pre = document.createElement('pre');
      const code = document.createElement('code');
      code.className = 'language-mermaid';
      code.textContent = raw;
      pre.appendChild(code);
      div.replaceWith(pre);
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

  window.initMermaid = function () {
    configureMermaid();
    renderAllMermaid();
  };

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
