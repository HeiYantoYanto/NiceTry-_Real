// Theme controller: sets html[data-theme] and persists across pages
(function(){
  const THEME_KEY = 'site_theme';
  function applyTheme(theme){
    const html = document.documentElement;
    if (!theme) { html.removeAttribute('data-theme'); return; }
    // Normalize removed/unsupported themes
    if (theme === 'neon') theme = 'purple';
    html.setAttribute('data-theme', theme);
  }
  function getTheme(){
    try{ return localStorage.getItem(THEME_KEY) || 'purple'; } catch(_) { return 'purple'; }
  }
  function setTheme(theme){
    try{ localStorage.setItem(THEME_KEY, theme); } catch(_) {}
    applyTheme(theme);
  }
  // Expose API
  // Light/Dark color scheme support
  const SCHEME_KEY = 'site_colorScheme'; // 'light' | 'dark'
  function applyColorScheme(mode){
    try {
      const html = document.documentElement;
      if (!mode) { html.removeAttribute('data-color-scheme'); return; }
      html.setAttribute('data-color-scheme', mode);
    } catch(_) {}
  }
  function getColorScheme(){
    try { return localStorage.getItem(SCHEME_KEY) || 'dark'; } catch(_) { return 'dark'; }
  }
  function setColorScheme(mode){
    try { localStorage.setItem(SCHEME_KEY, mode); } catch(_) {}
    applyColorScheme(mode);
  }

  window.Theme = { applyTheme, getTheme, setTheme, applyColorScheme, getColorScheme, setColorScheme };

  // Auto-apply on load: theme + color scheme
  document.addEventListener('DOMContentLoaded', function(){
    applyTheme(getTheme());
    applyColorScheme(getColorScheme());
  });
})();
