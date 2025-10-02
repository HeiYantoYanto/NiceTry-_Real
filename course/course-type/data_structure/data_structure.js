// Utilities: fetch a file and extract the main content inside .main__container
  async function loadTopic(file) {
    try {
      const res = await fetch(file, { credentials: 'same-origin' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const html = await res.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      // Grab the "main__container" area if present, else body
      const main = doc.querySelector('.main__container') || doc.body;
      // Remove original navbars or scripts from snippet
      [...main.querySelectorAll('nav.navbar, script')].forEach(n => n.remove());
      return main.innerHTML;
    } catch (e) {
      console.error('Failed to load', file, e);
      return `<div style="color:#ff8a8a;">Failed to load content: ${file}</div>`;
    }
  }

  // Populate initial content
  async function init() {
    const first = document.querySelector('.topic-item[aria-current="true"]');
    if (first) setContent(await loadTopic(first.dataset.file));
  }

  function setContent(innerHTML) {
    const container = document.getElementById('contentInner');
    container.innerHTML = innerHTML;
    // Focus heading if exists
    const h1 = container.querySelector('h1, h2');
    if (h1) h1.setAttribute('tabindex', '-1'), h1.focus();
  }

  // Topic click handling
  document.getElementById('topicList').addEventListener('click', async (e) => {
    const a = e.target.closest('a.topic-item');
    if (!a) return;
    e.preventDefault();
    document.querySelectorAll('.topic-item[aria-current="true"]').forEach(n => n.removeAttribute('aria-current'));
    a.setAttribute('aria-current', 'true');
    setContent('<p>Loading…</p>');
    const html = await loadTopic(a.dataset.file);
    setContent(html);
  });

  // Draggable divider (vertical on desktop, horizontal on mobile)
  (function() {
    const root = document.getElementById('split-root');
    const divider = document.getElementById('divider');
    let dragging = false;

    function isVertical() {
      // If template columns include the 6px divider, it's vertical (3 columns: topics | divider | content)
      const cols = getComputedStyle(root).gridTemplateColumns;
      return cols && cols.includes('6px');
    }

    function setCols(px) {
      // Prevent shrinking too small
      const min = 180, max = Math.max(280, window.innerWidth - 280);
      const clamped = Math.max(min, Math.min(px, max));
      root.style.gridTemplateColumns = clamped + 'px 6px 1fr';
    }

    function setRows(py) {
      const rootRect = root.getBoundingClientRect();
      const y = py - rootRect.top; // position within root
      const min = 140; // min height for topics
      const max = Math.max(180, rootRect.height - 220);
      const clamped = Math.max(min, Math.min(y, max));
      root.style.gridTemplateRows = clamped + 'px 6px 1fr';
    }

    divider.addEventListener('mousedown', (e) => { dragging = true; e.preventDefault(); });
    window.addEventListener('mouseup', () => dragging = false);
    window.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      if (isVertical()) setCols(e.clientX); else setRows(e.clientY);
    });

    // Touch
    divider.addEventListener('touchstart', () => { dragging = true; }, { passive: true });
    window.addEventListener('touchend', () => { dragging = false; }, { passive: true });
    window.addEventListener('touchmove', (e) => {
      if (!dragging) return;
      const t = e.touches[0];
      if (isVertical()) setCols(t.clientX); else setRows(t.clientY);
    }, { passive: true });

    // Keyboard resize (accessibility)
    divider.tabIndex = 0;
    divider.addEventListener('keydown', (e) => {
      const step = 20;
      if (isVertical()) {
        if (e.key === 'ArrowLeft') {
          const current = parseFloat(getComputedStyle(root).gridTemplateColumns.split('px')[0]);
          setCols(current - step);
        }
        if (e.key === 'ArrowRight') {
          const current = parseFloat(getComputedStyle(root).gridTemplateColumns.split('px')[0]);
          setCols(current + step);
        }
      } else {
        if (e.key === 'ArrowUp') {
          const current = parseFloat(getComputedStyle(root).gridTemplateRows.split('px')[0]);
          setRows((root.getBoundingClientRect().top || 0) + current - step);
        }
        if (e.key === 'ArrowDown') {
          const current = parseFloat(getComputedStyle(root).gridTemplateRows.split('px')[0]);
          setRows((root.getBoundingClientRect().top || 0) + current + step);
        }
      }
    });
  })();

  // Light/Dark mode toggle (disabled in DS section)
  (function(){
    const modeToggle = document.getElementById('mode-toggle');
    if (!modeToggle) return; // toggle removed from DS navbar
    function setMode(dark) {
      document.body.classList.toggle('dark-mode', dark);
      modeToggle.innerHTML = dark ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
      localStorage.setItem('ds_mode', dark ? 'dark' : 'light');
    }
    modeToggle.addEventListener('click', () => setMode(!document.body.classList.contains('dark-mode')));
    // On load, restore mode
    setMode(localStorage.getItem('ds_mode') === 'dark');
  })();

  // Initialize
  init();

  // Mobile topics toggle
  (function(){
    const root = document.getElementById('split-root');
    const btn = document.getElementById('topics-toggle');
    const topics = document.getElementById('topics');
    if (!btn || !root || !topics) return;
    function setOpen(open){
      root.classList.toggle('topics-open', open);
      btn.setAttribute('aria-expanded', String(open));
    }
    btn.addEventListener('click', () => setOpen(!root.classList.contains('topics-open')));
    // Close when clicking outside on mobile
    document.addEventListener('click', (e) => {
      if (!root.classList.contains('topics-open')) return;
      const inside = topics.contains(e.target) || btn.contains(e.target);
      if (!inside) setOpen(false);
    });
    // Close on ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') setOpen(false);
    });
    // When a topic is chosen, close the panel on mobile
    document.getElementById('topicList').addEventListener('click', () => setOpen(false));
  })();