// giscus-loader.js
window.GiscusLoader = (() => {
  const containerId = 'giscus-container';
  const mountedClass = 'giscus-mounted';

  function getTheme() {
    return localStorage.getItem('pref-theme') === 'light'
      ? window.GIT_PARAMS.giscus_lightTheme
      : window.GIT_PARAMS.giscus_darkTheme;
  }

  function render() {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';
    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.async = true;
    script.setAttribute('data-repo', window.GIT_PARAMS.giscus_repo);
    script.setAttribute('data-repo-id', window.GIT_PARAMS.giscus_repoId);
    script.setAttribute('data-category', window.GIT_PARAMS.giscus_category);
    script.setAttribute('data-category-id', window.GIT_PARAMS.giscus_categoryId);
    script.setAttribute('data-mapping', window.GIT_PARAMS.giscus_mapping);
    script.setAttribute('data-strict', window.GIT_PARAMS.giscus_strict);
    script.setAttribute('data-reactions-enabled', window.GIT_PARAMS.giscus_reactionsEnabled);
    script.setAttribute('data-emit-metadata', window.GIT_PARAMS.giscus_emitMetadata);
    script.setAttribute('data-input-position', window.GIT_PARAMS.giscus_inputPosition);
    script.setAttribute('data-theme', getTheme());
    script.setAttribute('data-lang', window.GIT_PARAMS.giscus_lang);
    script.setAttribute('data-loading', 'lazy');
    script.crossOrigin = 'anonymous';

    container.appendChild(script);
    container.classList.add(mountedClass);
  }

  function setTheme() {
    const iframe = document.querySelector('iframe.giscus-frame');
    if (!iframe) return;
    iframe.contentWindow.postMessage({
      giscus: { setConfig: { theme: getTheme() } }
    }, 'https://giscus.app');
  }

  function initSPA() {
    render();
    if (window.InstantClick) {
      InstantClick.on('change', () => setTimeout(render, 50));
    }
  }

  function bindThemeToggle() {
    const btns = [
      document.getElementById('theme-toggle'),
      document.getElementById('theme-toggle-float')
    ];
    btns.forEach(b => {
      if (b) b.addEventListener('click', () => setTheme());
    });
  }

  return { initSPA, bindThemeToggle };
})();
