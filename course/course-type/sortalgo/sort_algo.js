async function loadTopic(file) {
  try {
    const res = await fetch(file, { credentials: 'same-origin' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const main = doc.querySelector('.main__container') || doc.body;
    [...main.querySelectorAll('nav.navbar, script')].forEach(n => n.remove());
    return main.innerHTML;
  } catch (e) {
    console.error('Failed to load', file, e);
    return `<div style="color:#ff8a8a;">Failed to load content: ${file}</div>`;
  }
}

async function init() {
  const first = document.querySelector('.topic-item[aria-current="true"]');
  if (first) setContent(await loadTopic(first.dataset.file));
}

function setContent(innerHTML) {
  const container = document.getElementById('contentInner');
  container.innerHTML = innerHTML;
  const h1 = container.querySelector('h1, h2');
  if (h1) h1.setAttribute('tabindex', '-1'), h1.focus();
}

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

(function() {
  const root = document.getElementById('split-root');
  const divider = document.getElementById('divider');
  let dragging = false;

  function isVertical() {
    const cols = getComputedStyle(root).gridTemplateColumns;
    return cols && cols.includes('6px');
  }

  function setCols(px) {
    const min = 180, max = Math.max(280, window.innerWidth - 280);
    const clamped = Math.max(min, Math.min(px, max));
    root.style.gridTemplateColumns = clamped + 'px 6px 1fr';
  }

  function setRows(py) {
    const rootRect = root.getBoundingClientRect();
    const y = py - rootRect.top;
    const min = 140;
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

  divider.addEventListener('touchstart', () => { dragging = true; }, { passive: true });
  window.addEventListener('touchend', () => { dragging = false; }, { passive: true });
  window.addEventListener('touchmove', (e) => {
    if (!dragging) return;
    const t = e.touches[0];
    if (isVertical()) setCols(t.clientX); else setRows(t.clientY);
  }, { passive: true });

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
  document.addEventListener('click', (e) => {
    if (!root.classList.contains('topics-open')) return;
    const inside = topics.contains(e.target) || btn.contains(e.target);
    if (!inside) setOpen(false);
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
  document.getElementById('topicList').addEventListener('click', () => setOpen(false));
})();
