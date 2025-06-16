window.GiscusLoader = (function () {
  const containerId = "giscus-container";
  const themeAttr = () =>
    localStorage.getItem("pref-theme") === "light"
      ? window.giscusLightTheme || "light"
      : window.giscusDarkTheme || "dark";

  function injectGiscus() {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = ""; // 清除旧内容

    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.setAttribute("data-repo", window.giscusRepo);
    script.setAttribute("data-repo-id", window.giscusRepoId);
    script.setAttribute("data-category", window.giscusCategory);
    script.setAttribute("data-category-id", window.giscusCategoryId);
    script.setAttribute("data-mapping", window.giscusMapping || "pathname");
    script.setAttribute("data-strict", "0");
    script.setAttribute("data-reactions-enabled", "1");
    script.setAttribute("data-emit-metadata", "0");
    script.setAttribute("data-input-position", "bottom");
    script.setAttribute("data-theme", themeAttr());
    script.setAttribute("data-lang", "zh-CN");
    script.setAttribute("crossorigin", "anonymous");
    script.setAttribute("data-loading", "lazy");

    container.appendChild(script);
  }

  function setTheme() {
    const iframe = document.querySelector("iframe.giscus-frame");
    if (!iframe) return;
    const message = {
      giscus: {
        setConfig: {
          theme: themeAttr(),
        },
      },
    };
    iframe.contentWindow.postMessage(message, "https://giscus.app");
  }

  function bindThemeToggle() {
    const toggles = document.querySelectorAll("#theme-toggle, #theme-toggle-float");
    toggles.forEach((toggle) => {
      if (!toggle.dataset.giscusBound) {
        toggle.addEventListener("click", () => {
          setTimeout(setTheme, 100); // 确保 iframe 已渲染
        });
        toggle.dataset.giscusBound = "true";
      }
    });
  }

  function initSPA() {
    // 页面加载或 InstantClick 切换时触发
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", injectGiscus);
    } else {
      injectGiscus();
    }

    if (window.InstantClick) {
      InstantClick.on("change", () => {
        injectGiscus();
        bindThemeToggle();
      });
    }
  }

  return {
    initSPA,
    bindThemeToggle,
  };
})();
