import Fuse from './fuse.basic.min.js';
import * as params from '@params';

let fuse;
let first, last, current_elem = null;
let resultsAvailable = false;

function attachSearch(sInput, resList) {
  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      const data = JSON.parse(xhr.responseText);
      if (data) {
        let options = {
          distance: 100,
          threshold: 0.4,
          ignoreLocation: true,
          keys: ['title', 'permalink', 'summary', 'content']
        };
        if (params.fuseOpts) {
          options = {
            isCaseSensitive: params.fuseOpts.iscasesensitive ?? false,
            includeScore: params.fuseOpts.includescore ?? false,
            includeMatches: params.fuseOpts.includematches ?? false,
            minMatchCharLength: params.fuseOpts.minmatchcharlength ?? 1,
            shouldSort: params.fuseOpts.shouldsort ?? true,
            findAllMatches: params.fuseOpts.findallmatches ?? false,
            keys: params.fuseOpts.keys ?? ['title', 'permalink', 'summary', 'content'],
            location: params.fuseOpts.location ?? 0,
            threshold: params.fuseOpts.threshold ?? 0.4,
            distance: params.fuseOpts.distance ?? 100,
            ignoreLocation: params.fuseOpts.ignorelocation ?? true
          };
        }
        fuse = new Fuse(data, options);
      }
    }
  };
  xhr.open('GET', "../index.json");
  xhr.send();

  function activeToggle(ae) {
    document.querySelectorAll('.focus').forEach(el => el.classList.remove("focus"));
    if (ae) {
      ae.focus();
      current_elem = ae;
      ae.parentElement.classList.add("focus");
    } else {
      document.activeElement?.parentElement?.classList.add("focus");
    }
  }

  function reset() {
    resultsAvailable = false;
    resList.innerHTML = sInput.value = '';
    sInput.focus();
  }

  sInput.onkeyup = function () {
    if (!fuse) return;
    const value = sInput.value.trim();
    const results = params.fuseOpts
      ? fuse.search(value, { limit: params.fuseOpts.limit })
      : fuse.search(value);

    if (results.length > 0) {
      let resultSet = '';
      for (let item of results) {
        resultSet += `<li class="post-entry"><header class="entry-header">${item.item.title}&nbsp;»</header>` +
                     `<a href="${item.item.permalink}" aria-label="${item.item.title}"></a></li>`;
      }
      resList.innerHTML = resultSet;
      resultsAvailable = true;
      first = resList.firstChild;
      last = resList.lastChild;
    } else {
      resultsAvailable = false;
      resList.innerHTML = '';
    }
  };

  sInput.addEventListener('search', () => {
    if (!sInput.value) reset();
  });

  document.onkeydown = function (e) {
    const key = e.key;
    let ae = document.activeElement;
    const inbox = document.getElementById("searchbox")?.contains(ae);

    if (ae === sInput) {
      document.querySelectorAll('.focus').forEach(el => el.classList.remove("focus"));
    } else if (current_elem) {
      ae = current_elem;
    }

    if (key === "Escape") {
      reset();
    } else if (!resultsAvailable || !inbox) {
      return;
    } else if (key === "ArrowDown") {
      e.preventDefault();
      if (ae === sInput) {
        activeToggle(resList.firstChild?.lastChild);
      } else if (ae?.parentElement !== last) {
        activeToggle(ae?.parentElement?.nextSibling?.lastChild);
      }
    } else if (key === "ArrowUp") {
      e.preventDefault();
      if (ae?.parentElement === first) {
        activeToggle(sInput);
      } else if (ae !== sInput) {
        activeToggle(ae?.parentElement?.previousSibling?.lastChild);
      }
    } else if (key === "ArrowRight") {
      ae?.click();
    }
  };
}

function loadSearch() {
  // DOM可能还没插入，等待直到找到 input 和 result DOM
  const retry = () => {
    const sInput = document.getElementById('searchInput');
    const resList = document.getElementById('searchResults');
    if (sInput && resList) {
      attachSearch(sInput, resList);
      console.log('🔍 fastsearch loaded');
    } else {
      setTimeout(retry, 30); // 每隔30ms重试一次直到找到
    }
  };
  retry();
}

if (typeof window !== 'undefined') {
  window.loadSearch = loadSearch;
  window.addEventListener('DOMContentLoaded', loadSearch);
}

// 🧩 支持 InstantClick 页面切换后重新初始化
document.addEventListener('instantclick:change', () => {
  // 只有在路径包含 search 或 #searchInput 存在时再尝试绑定
  if (
    location.pathname.includes('/search') ||
    document.getElementById('searchInput')
  ) {
    loadSearch();
  }
});