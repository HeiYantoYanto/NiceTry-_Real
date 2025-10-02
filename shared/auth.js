// Ensure global theme assets are loaded on every page that includes this script
(function ensureGlobalTheme(){
    try {
        var path = (window.location.pathname || '').replace(/\\/g, '/');
        var idx = path.lastIndexOf('/ray/');
        if (idx === -1) return; // Not under /ray/, skip
        var baseRay = path.slice(0, idx + 5); // includes trailing '/'
        var baseRoot = path.slice(0, idx + 1); // path up to and including the '/' before 'ray'

        // Add <link> to theme.css if missing
        if (!document.querySelector('link[data-theme-base]') && !document.querySelector('link[rel="stylesheet"][href$="theme.css"]')) {
            var link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = baseRoot + 'theme.css';
            link.setAttribute('data-theme-base', 'true');
            // Insert as first stylesheet for early variable availability when possible
            var head = document.head || document.getElementsByTagName('head')[0];
            if (head.firstChild) head.insertBefore(link, head.firstChild); else head.appendChild(link);
        }

        // Load theme.js if Theme API not present
        if (!(window.Theme && typeof window.Theme.applyTheme === 'function')) {
            var s = document.createElement('script');
            s.src = baseRay + 'shared/theme.js';
            s.async = false; // preserve order
            s.onload = function(){
                try { if (window.Theme && window.Theme.applyTheme && window.Theme.getTheme) { window.Theme.applyTheme(window.Theme.getTheme()); } } catch(_){}
            };
            (document.head || document.body).appendChild(s);
        } else {
            // Apply immediately if available
            try { window.Theme.applyTheme(window.Theme.getTheme()); } catch(_){}
        }
    } catch (e) { /* no-op */ }
})();

// Core auth helpers
function __auth_isLoggedIn() {
    return sessionStorage.getItem('isLoggedIn') === 'true' && !!sessionStorage.getItem('currentUser');
}

// Ensure a default admin account exists (idempotent)
function __auth_ensureDefaultAdmin() {
    try {
        const key = 'userAccounts';
        const raw = localStorage.getItem(key);
        const users = raw ? JSON.parse(raw) : {};
        if (!users['admin@gmail.com']) {
            users['admin@gmail.com'] = {
                password: 'admin',
                role: 'admin',
                signupDate: new Date().toISOString()
            };
            localStorage.setItem(key, JSON.stringify(users));
        }
    } catch (e) {
        // no-op
    }
}

// Grant admin perks: unlock all customizations and ensure 500 coins
function __auth_grantAdminPerks(email) {
    try {
        if (email !== 'admin@gmail.com') return;
        // Unlock all customizations
        const key = `customizations_${email}`;
        const current = JSON.parse(localStorage.getItem(key) || '{}');

        const mergeUnique = (arr, add) => Array.from(new Set([...(arr || []), ...add]));

        const frames = [
            'Gold Frame','Pink Frame','Blue Frame','Purple Frame','Galaxy Frame','Neon Frame'
        ];
        const textColors = [
            'Red Text Color','Blue Text Color','Green Text Color','Purple Text Color','Gold Text Color'
        ];
        const navbarThemes = [
            'Dark Theme','Light Theme','Purple Theme','Blue Theme','Green Theme'
        ];
        const backgrounds = [
            'Dark Background','Light Background'
        ];
        const textStyles = [
            'Bold Text Style','Italic Text Style','Custom Font Style'
        ];
        const specialEffects = [
            'RGB Cycle','Glowing Border'
        ];

        const updated = {
            frame: mergeUnique(current.frame, frames),
            textColor: mergeUnique(current.textColor, textColors),
            navbarTheme: mergeUnique(current.navbarTheme, navbarThemes),
            background: mergeUnique(current.background, backgrounds),
            textStyle: mergeUnique(current.textStyle, textStyles),
            specialEffect: mergeUnique(current.specialEffect, specialEffects)
        };
        localStorage.setItem(key, JSON.stringify(updated));

        // Ensure 500 coins minimum
        const coinsKey = 'coins_' + email;
        const existingCoins = parseInt(localStorage.getItem(coinsKey) || '0', 10);
        if (isNaN(existingCoins) || existingCoins < 500) {
            localStorage.setItem(coinsKey, '500');
        }
    } catch (e) {
        // no-op
    }
}

// Auto-login from remembered credentials has been disabled intentionally.

// Helper function to get correct login path based on current location
function getLoginPath() {
    var path = window.location.pathname;
    if (path.includes('/games/')) return '../login_signup/signup/signup.html';
    if (path.includes('/login_signup/')) return '../signup/signup.html';
    if (path.includes('/team_info/')) return '../../login_signup/signup/signup.html';
    if (path.includes('/course/')) return '../../../login_signup/signup/signup.html';
    return 'login_signup/signup/signup.html';
}

// Helper function to get correct home path based on current location
function getHomePath() {
    var path = window.location.pathname;
    if (path.includes('/games/')) return '../index.html';
    if (path.includes('/login_signup/')) return '../../index.html';
    if (path.includes('/team_info/')) return '../../index.html';
    if (path.includes('/course/')) return '../../../index.html';
    return 'index.html';
}

// Create UI functions but resolve DOM lazily
function createLogoutLi() {
    var li = document.createElement('li');
    li.className = 'navbar__btn';
    var a = document.createElement('a');
    a.href = '#';
    a.className = 'button';
    // Build avatar/icon with optional frame ring
    try {
        var u = (window.UserProfile && window.UserProfile.get) ? window.UserProfile.get() : null;
        var avatarData = u ? u.avatar : null;
        var flags = (u && u.flags) ? u.flags : {};

        // Wrapper to normalize size and allow ring shadow
        var wrap = document.createElement('span');
        wrap.style.display = 'inline-flex';
        wrap.style.alignItems = 'center';
        wrap.style.justifyContent = 'center';
        wrap.style.width = '38px';
        wrap.style.height = '38px';
        wrap.style.borderRadius = '50%';
        wrap.style.lineHeight = '0';

        // Support new frame ids + legacy mapping (gold->default, pink->sunset, blue->ocean, galaxy->purple)
        var shadowMap = {
            // New set
            'default': '0 0 0 3px var(--accent-color), 0 0 12px color-mix(in srgb, var(--accent-color) 55%, transparent)',
            'purple': '0 0 0 3px #9B7BFF, 0 0 12px #9B7BFF66',
            'ocean': '0 0 0 3px #2196F3, 0 0 12px #00BCD466',
            'sunset': '0 0 0 3px #FF6B6B, 0 0 12px #FFA62B66',
            'matrix': '0 0 0 3px #00FF88, 0 0 12px #00CC6680',
            'neon': '0 0 0 3px #39ff14, 0 0 18px #39ff14AA',
            // Legacy
            'gold': '0 0 0 3px var(--accent-color), 0 0 12px color-mix(in srgb, var(--accent-color) 55%, transparent)',
            'pink': '0 0 0 3px #FF6B6B, 0 0 12px #FFA62B66',
            'blue': '0 0 0 3px #2196F3, 0 0 12px #00BCD466',
            'galaxy': '0 0 0 3px #9B7BFF, 0 0 12px #9B7BFF66'
        };

        if (avatarData) {
            var img = document.createElement('img');
            img.src = avatarData;
            img.alt = 'Profile';
            img.style.width = '38px';
            img.style.height = '38px';
            img.style.objectFit = 'cover';
            img.style.borderRadius = '50%';
            img.style.boxShadow = shadowMap[flags.selectedFrame] || '';
            wrap.appendChild(img);
        } else {
            // No avatar: render fallback icon inside a circular chip and apply ring on the chip
            var chip = document.createElement('span');
            chip.style.display = 'inline-flex';
            chip.style.alignItems = 'center';
            chip.style.justifyContent = 'center';
            chip.style.width = '38px';
            chip.style.height = '38px';
            chip.style.borderRadius = '50%';
            chip.style.background = 'var(--alpha-white-05)';
            chip.style.boxShadow = shadowMap[flags.selectedFrame] || '';

            var icon = document.createElement('i');
            icon.className = 'fa-solid fa-circle-user';
            icon.style.fontSize = '1.9rem';
            icon.style.color = 'var(--color-white)';
            icon.style.marginRight = '0';
            chip.appendChild(icon);
            wrap.appendChild(chip);
        }
        a.appendChild(wrap);
    } catch (e) {
        // Fallback to simple icon
        a.innerHTML = '<i class="fa-solid fa-circle-user"></i>';
    }
    a.addEventListener('click', function(e) {
        e.preventDefault();
        // Show sidebar instead of immediate logout
        if (window.showSidebar) {
            window.showSidebar();
        }
    });
    li.appendChild(a);
    return li;
}

function handleLogout() {
    var email = sessionStorage.getItem('currentUser');
    // Always clear any stored remembered credentials (auto-login disabled)
    localStorage.removeItem('rememberedEmail');
    localStorage.removeItem('rememberedPassword');
    // Clear session
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem('isAdmin');

    // Hide sidebar if open
    if (window.hideSidebar) {
        window.hideSidebar();
    }

    // Emit logout event so all listeners (and other tabs via storage sync) can react
    try { window.dispatchEvent(new CustomEvent('auth:logout', { detail: { email: email } })); } catch(e) {}
    try { localStorage.setItem('auth:signal', JSON.stringify({ type: 'logout', email: email, ts: Date.now() })); } catch(e) {}

    // Update navbar immediately
    updateNavbarState();
}

// Make handleLogout globally accessible
window.handleLogout = handleLogout;

// Function to update navbar based on login state
function updateNavbarState() {
    var navbarMenu = document.querySelector('.navbar__menu');
    var rightActions = document.getElementById('navbar-right-actions');
    if (!navbarMenu && !rightActions) return; // No navbar on this page

    // Find login/signup buttons fresh each time to avoid stale refs
    var loginBtnLi = null;
    var signupBtnLi = null;
    var items = navbarMenu.querySelectorAll('.navbar__btn');
    items.forEach(function(li) {
        var link = li.querySelector('a');
        if (!link) return;
        var href = link.getAttribute('href') || '';
        var text = (link.textContent || '').toLowerCase();
        if (href.includes('/login/') || text.includes('log in')) {
            loginBtnLi = li;
        } else if (href.includes('/signup/') || text.includes('sign up')) {
            signupBtnLi = li;
        }
    });

    var isLoggedIn = __auth_isLoggedIn();

    if (isLoggedIn) {
        // Show profile icon, hide login/signup
        if (loginBtnLi) loginBtnLi.style.display = 'none';
        if (signupBtnLi) signupBtnLi.style.display = 'none';
        // Remove existing profile node from both possible containers
        if (navbarMenu) {
            var existingProfile = navbarMenu.querySelector('li.__logout');
            if (existingProfile) existingProfile.remove();
        }
        if (rightActions) {
            var existingProfileRight = rightActions.querySelector('li.__logout');
            if (existingProfileRight) existingProfileRight.remove();
        }
        // Add profile icon (prefer right actions container if present)
        var profileLi = createLogoutLi();
        profileLi.classList.add('__logout');
        if (rightActions) rightActions.appendChild(profileLi); else if (navbarMenu) navbarMenu.appendChild(profileLi);
    } else {
        // Show login/signup, hide profile icon
        if (navbarMenu) {
            var existingProfile2 = navbarMenu.querySelector('li.__logout');
            if (existingProfile2) existingProfile2.remove();
        }
        if (rightActions) {
            var existingProfile3 = rightActions.querySelector('li.__logout');
            if (existingProfile3) existingProfile3.remove();
        }
        if (loginBtnLi) loginBtnLi.style.display = '';
        if (signupBtnLi) signupBtnLi.style.display = '';
    }
}

// Make updateNavbarState globally accessible
window.updateNavbarState = updateNavbarState;

// Simple admin check helper (can be used anywhere)
window.isAdmin = function() {
    try { return sessionStorage.getItem('isAdmin') === 'true'; } catch (_) { return false; }
};

// --- Navbar Theme (per-user) ---
function __applyNavbarThemeFromPrefs() {
    try {
        const email = sessionStorage.getItem('currentUser');
        if (!email) { __resetNavbarTheme(); return; }
        const prefsKey = `profile_prefs_${email}`;
        const prefs = JSON.parse(localStorage.getItem(prefsKey) || '{}');
        const nav = document.querySelector('.navbar');
        const wrap = document.querySelector('.navbar__container');
        if (!nav || !wrap) return;

        // Clear previous class list changes; keep existing classes
        nav.classList.remove('navbar--light');
        wrap.style.background = 'var(--color-bg-deep)';

        const theme = prefs.navbarTheme;
        if (!theme || !theme.id) return;

        // Apply background on container to match site structure
        const value = theme.bg || theme.gradient || theme.color;
        if (value) {
            wrap.style.background = value;
        }
        // Light mode helper for contrast
        if (theme.id === 'light') {
            nav.classList.add('navbar--light');
        }
    } catch (e) { /* no-op */ }
}

function __resetNavbarTheme() {
    const nav = document.querySelector('.navbar');
    const wrap = document.querySelector('.navbar__container');
    if (nav) nav.classList.remove('navbar--light');
    if (wrap) wrap.style.background = 'var(--color-bg-deep)';
}
window.applyNavbarThemeFromPrefs = __applyNavbarThemeFromPrefs;

// --- Background Theme (per-user) ---
function __applyBackgroundThemeFromPrefs() {
    try {
        const email = sessionStorage.getItem('currentUser');
        const body = document.body;
        if (!body) return;
        if (!email) { __resetBackgroundTheme(); return; }
        const prefsKey = `profile_prefs_${email}`;
        const prefs = JSON.parse(localStorage.getItem(prefsKey) || '{}');
        let bg = prefs.background;
        // If background UI was removed, default to dark when any stale value exists
        if (!bg) {
            return; // use site default (dark)
        }
        const value = bg.gradient || bg.color;
        if (value) {
            body.style.background = value;
            body.classList.add('custom-bg-applied');
            // Toggle helper classes for styling on light vs dark backgrounds
            body.classList.remove('bg-light', 'bg-dark');
            // Also set the hero top gradient to match dark/light background
            const root = document.documentElement;
            if (bg.id === 'light') {
                body.classList.add('bg-light');
                // Light top gradient variant: soft light panel fading to transparent
                root.style.setProperty('--hero-top-gradient', 'linear-gradient(to bottom, #f4f6f9 0%, #f4f6f9 28%, rgba(244,246,249,0.92) 32%, rgba(244,246,249,0.65) 38%, rgba(244,246,249,0.25) 60%, transparent 100%)');
            } else {
                body.classList.add('bg-dark');
                // Dark default
                root.style.setProperty('--hero-top-gradient', 'linear-gradient(to bottom, var(--color-bg-deep) 0%, var(--color-bg-deep) 28%, rgba(14,14,32,0.95) 32%, rgba(14,14,32,0.7) 38%, rgba(14,14,32,0.2) 60%, transparent 100%)');
            }
        }
    } catch (e) { /* no-op */ }
}

function __resetBackgroundTheme() {
    const body = document.body;
    if (!body) return;
    // Remove inline customizations and marker class; page CSS will take over
    body.style.background = '';
    body.classList.remove('custom-bg-applied', 'bg-light', 'bg-dark');
    // Reset hero gradient to dark default
    try {
        document.documentElement.style.setProperty('--hero-top-gradient', 'linear-gradient(to bottom, var(--color-bg-deep) 0%, var(--color-bg-deep) 28%, rgba(14,14,32,0.95) 32%, rgba(14,14,32,0.7) 38%, rgba(14,14,32,0.2) 60%, transparent 100%)');
    } catch(_) {}
}
window.applyBackgroundThemeFromPrefs = __applyBackgroundThemeFromPrefs;

// --- Special Effects (per-user) ---
let __rgbCycleTimer = null;
let __rgbCycleBase = null; // starting HSL of accent color

function __hexToHsl(hex) {
    try {
        hex = hex.replace('#','');
        if (hex.length === 3) hex = hex.split('').map(c=>c+c).join('');
        const r = parseInt(hex.substr(0,2),16)/255;
        const g = parseInt(hex.substr(2,2),16)/255;
        const b = parseInt(hex.substr(4,2),16)/255;
        const max = Math.max(r,g,b), min = Math.min(r,g,b);
        let h,s,l = (max+min)/2;
        if (max===min) { h=0; s=0; }
        else {
            const d = max-min;
            s = l>0.5 ? d/(2-max-min) : d/(max+min);
            switch(max){
                case r: h=(g-b)/d + (g<b?6:0); break;
                case g: h=(b-r)/d + 2; break;
                case b: h=(r-g)/d + 4; break;
            }
            h/=6;
        }
        return { h: Math.round(h*360), s: Math.round(s*100), l: Math.round(l*100) };
    } catch(_) { return { h: 48, s: 86, l: 65 }; }
}

function __hslToHex(h,s,l){
    s/=100; l/=100;
    const k = n => (n + h/30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n => l - a * Math.max(-1, Math.min(k(n)-3, Math.min(9-k(n), 1)));
    const toHex = x => Math.round(x*255).toString(16).padStart(2,'0');
    return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}

function __startRgbCycle(fromHex, speedId) {
    try {
        const root = document.documentElement;
        const base = __hexToHsl(fromHex || getComputedStyle(root).getPropertyValue('--accent-color').trim() || '#EFC554');
        __rgbCycleBase = base;
        let t = 0;
        if (__rgbCycleTimer) clearInterval(__rgbCycleTimer);
        // Determine speed based on preference: slow, normal, fast
        const stepDeg = 2; // hue step per tick
        let intervalMs = 90; // default normal
        if (speedId === 'slow') intervalMs = 180; else if (speedId === 'fast') intervalMs = 45;
        __rgbCycleTimer = setInterval(() => {
            t = (t + 2) % 360; // step degrees
            const h = (base.h + t) % 360;
            const hex = __hslToHex(h, base.s, base.l);
            root.style.setProperty('--accent-color', hex);
        }, intervalMs);
    } catch(_) {}
}

function __stopRgbCycle() {
    if (__rgbCycleTimer) { clearInterval(__rgbCycleTimer); __rgbCycleTimer = null; }
}

function __applySpecialEffectsFromPrefs() {
    try {
        const email = sessionStorage.getItem('currentUser');
        const root = document.documentElement;
        if (!email) { __stopRgbCycle(); return; }
        const prefsKey = `profile_prefs_${email}`;
        const prefs = JSON.parse(localStorage.getItem(prefsKey) || '{}');
        const eff = prefs.specialEffect; // legacy single
        const effArray = Array.isArray(prefs.specialEffects) ? prefs.specialEffects : [];
        const speed = (prefs.specialEffectSpeed && prefs.specialEffectSpeed.id) || 'normal';
        // reset any local-only artifacts
        const navbar = document.querySelector('.navbar');
        if (navbar) navbar.style.boxShadow = '';
        __stopRgbCycle();
        // Determine active effects from either array or legacy
        const active = new Set(effArray);
        if (eff && eff.id) active.add(eff.id);
        if (active.size === 0) return;
        // Apply each active effect; harmless to apply in any order
        if (active.has('glow')) {
            if (navbar) {
                // Glow follows current site accent; if RGB is active, this will auto-update as --accent-color changes
                navbar.style.boxShadow = '0 0 16px color-mix(in srgb, var(--accent-color) 70%, transparent), 0 0 6px color-mix(in srgb, var(--accent-color) 80%, transparent)';
            }
        }
        if (active.has('rgb')) {
            const currentAccent = getComputedStyle(root).getPropertyValue('--accent-color').trim() || '#EFC554';
            __startRgbCycle(currentAccent, speed);
        }
        // Future effects like 'particles' and 'shifter' can be handled here concurrently
    } catch (e) { /* no-op */ }
}
window.applySpecialEffectsFromPrefs = __applySpecialEffectsFromPrefs;

// Initial wiring after DOM ready: ensure session, then update navbar and set listeners
document.addEventListener('DOMContentLoaded', function() {
    // Seed default admin
    __auth_ensureDefaultAdmin();
    // If already logged in as admin, grant perks
    try {
        if (sessionStorage.getItem('isLoggedIn') === 'true') {
            const email = sessionStorage.getItem('currentUser');
            if (email === 'admin@gmail.com') __auth_grantAdminPerks(email);
        }
    } catch(e) {}
    // Update navbar based on current state and apply user's themes
    updateNavbarState();
    __applyNavbarThemeFromPrefs();
    __applyBackgroundThemeFromPrefs();
    __applySpecialEffectsFromPrefs();

    // React to auth events in-page
    window.addEventListener('auth:login', function(){
        updateNavbarState();
        try { window.UserProfile && window.UserProfile.applyAccent && window.UserProfile.applyAccent(); } catch(e) {}
    __applyNavbarThemeFromPrefs();
    __applyBackgroundThemeFromPrefs();
    __applySpecialEffectsFromPrefs();
    });
    // Grant admin perks on login event
    window.addEventListener('auth:login', function(e){
        try {
            const email = (e && e.detail && e.detail.email) || sessionStorage.getItem('currentUser');
            if (email === 'admin@gmail.com') __auth_grantAdminPerks(email);
        } catch(_) {}
    });
    window.addEventListener('auth:logout', function(){
        updateNavbarState();
        try { window.UserProfile && window.UserProfile.applyAccent && window.UserProfile.applyAccent(); } catch(e) {}
    __resetNavbarTheme();
    __resetBackgroundTheme();
    __applySpecialEffectsFromPrefs();
    });

    // React to changes from other tabs (storage event only fires in other tabs)
    window.addEventListener('storage', function(e) {
        if (e.key === 'isLoggedIn' || e.key === 'currentUser' || e.key === 'auth:signal' || (e.key && (e.key.startsWith('userProfile_') || e.key.startsWith('profile_prefs_')))) {
            // Update UI to reflect new session state
            updateNavbarState();
            // Re-apply accent if profile changed cross-tab
            try { window.UserProfile && window.UserProfile.applyAccent && window.UserProfile.applyAccent(); } catch(err) {}
            __applyNavbarThemeFromPrefs();
            __applyBackgroundThemeFromPrefs();
            __applySpecialEffectsFromPrefs();
        }
    });

    // Refresh navbar/icon and accent on in-tab profile changes
    window.addEventListener('userprofile:change', function(){
        try { window.UserProfile && window.UserProfile.applyAccent && window.UserProfile.applyAccent(); } catch(e) {}
        updateNavbarState();
        __applyNavbarThemeFromPrefs();
        __applyBackgroundThemeFromPrefs();
        __applySpecialEffectsFromPrefs();
    });

});

// =========================
// Achievements & XP Manager
// =========================
// Centralized system for: earning XP, tracking page navigation, and screen clicks.
(function() {
    // Lightweight event emitter for achievement-earned notifications
    const listeners = { earned: [] };
    function onEarned(cb) { if (typeof cb === 'function') listeners.earned.push(cb); }
    function emitEarned(payload) { listeners.earned.forEach(cb => { try { cb(payload); } catch(e) {} }); }

    // Helpers
    function __getLevel(profile) {
        try { return computeLevelState(profile?.xp || 0).level; } catch (_) { return 1; }
    }
    function __getCustomizations(email) {
        try { return JSON.parse(localStorage.getItem(`customizations_${email}`)) || {}; } catch (_) { return {}; }
    }

    const SINGLE_ICON = 'fa-trophy';
    const ACH_UNLOCK_XP = 15;

    const ACH_DEFS = [
        // Click based
        { id: 'first_click', title: 'First Click', desc: 'Make your first click on the site', icon: SINGLE_ICON, condition: s => s.clicks >= 1 },
        { id: 'clicker_100', title: 'Clicker', desc: 'Click 100 times', icon: SINGLE_ICON, condition: s => s.clicks >= 100 },
        { id: 'clicker_32768', title: 'Voluntary Clicker', desc: 'Click 32768 times', icon: SINGLE_ICON, condition: s => s.clicks >= 32768 },

        // Pages visited
        { id: 'first_page', title: 'Getting Started', desc: 'Visit first page', icon: SINGLE_ICON, condition: s => s.pagesCount >= 1 },
        { id: 'explorer_10', title: 'Explorer', desc: 'Visit 10 pages', icon: SINGLE_ICON, condition: s => s.pagesCount >= 10 },

        // Level milestones
        { id: 'level_2', title: 'Leveling Up', desc: 'Level up to level 2', icon: SINGLE_ICON, condition: s => __getLevel(s) >= 2 },
        { id: 'level_3', title: 'On a Roll', desc: 'Level up to level 3', icon: SINGLE_ICON, condition: s => __getLevel(s) >= 3 },
        { id: 'level_10', title: 'It’s Over 10000!', desc: 'Get to level 10', icon: SINGLE_ICON, condition: s => __getLevel(s) >= 10 },

        // Time spent (ms) including live session time
        { id: 'time_30m', title: 'Higher Level Concentration', desc: 'Spend 30 minutes in the website', icon: SINGLE_ICON, condition: s => {
            const live = s._sessionStart ? Math.max(0, Date.now() - s._sessionStart) : 0; return (s.timeSpentMs || 0) + live >= 30 * 60 * 1000;
        }},
        { id: 'time_1h', title: 'Wae Are Yo Stil Here?', desc: 'Spend 1 hour in the website', icon: SINGLE_ICON, condition: s => {
            const live = s._sessionStart ? Math.max(0, Date.now() - s._sessionStart) : 0; return (s.timeSpentMs || 0) + live >= 60 * 60 * 1000;
        }},
        { id: 'time_5h', title: 'The Most Serious Table', desc: 'Spend 5 hours in the website', icon: SINGLE_ICON, condition: s => {
            const live = s._sessionStart ? Math.max(0, Date.now() - s._sessionStart) : 0; return (s.timeSpentMs || 0) + live >= 5 * 60 * 60 * 1000;
        }},
        { id: 'time_48h', title: 'Serious Dedication', desc: 'Spend 48 hours in the website', icon: SINGLE_ICON, condition: s => {
            const live = s._sessionStart ? Math.max(0, Date.now() - s._sessionStart) : 0; return (s.timeSpentMs || 0) + live >= 48 * 60 * 60 * 1000;
        }},

        // Quizzes
        { id: 'quiz_all_correct', title: 'All Perfect Combo', desc: 'Get all questions right on a quiz', icon: SINGLE_ICON, condition: s => {
            const q = s.quizResults || {}; return Object.values(q).some(r => r && r.passed === true);
        }},
        { id: 'final_exam_perfect', title: 'Fus Ro Quiz', desc: 'Get all questions right on the final exam', icon: SINGLE_ICON, condition: s => {
            const q = s.quizResults || {}; return Object.entries(q).some(([k, r]) => r && r.passed === true && /finalexam|final_exam|\/FinalExam\//i.test(k));
        }},

        // Colors via Gacha/customizations
        { id: 'color_obtained', title: 'Bring Home the Color', desc: 'Get a color from the gacha', icon: SINGLE_ICON, condition: (s, email) => {
            const cz = __getCustomizations(email);
            const arr = Array.isArray(cz.textColor) ? cz.textColor : [];
            return arr.length > 0 || !!(s.profile?.flags?.selectedTextColor);
        }},
        { id: 'all_colors', title: 'How Did We Get Here', desc: 'Have every color unlocked', icon: SINGLE_ICON, condition: (s, email) => {
            const need = ['Blue Text Color','Green Text Color','Red Text Color','Purple Text Color','Gold Text Color'];
            const cz = __getCustomizations(email);
            const got = new Set((cz.textColor || []).map(x => String(x)));
            return need.every(n => got.has(n));
        }},

        // Courses
        { id: 'course_any_complete', title: 'Star Learner', desc: 'Complete a course', icon: SINGLE_ICON, condition: s => {
            const cp = s.courseProgress || {}; return !!(cp.data_structure?.completed || cp.searchalgo?.completed || cp.sortalgo?.completed);
        }},
        { id: 'courses_all_complete', title: 'Big Brain Power!', desc: 'Read and complete all courses', icon: SINGLE_ICON, condition: s => {
            const cp = s.courseProgress || {}; return !!(cp.data_structure?.completed && cp.searchalgo?.completed && cp.sortalgo?.completed);
        }},

        // Secret code
        { id: 'secret_code', title: 'Up Down Left Right Start', desc: 'Use a secret code', icon: SINGLE_ICON, condition: s => !!(s.profile?.flags?.secretCodeUsed) }
    ];

    const keyFor = (email) => `userProfile_${email}`;

    // Helper to initialize extended tracking fields with defaults
    function ensureExtendedFields(profile) {
        // cumulative time in ms across sessions
        if (typeof profile.timeSpentMs !== 'number') profile.timeSpentMs = 0;
        // last session start timestamp (ms) for live accumulation
        if (typeof profile._sessionStart !== 'number') profile._sessionStart = 0;
        // quiz results: { [quizId]: { passed: boolean, score?: number, attempts: number, lastAt: ms } }
        if (!profile.quizResults || typeof profile.quizResults !== 'object') profile.quizResults = {};
        // course progress: { data_structure: { openedPages: number, completed: boolean }, searchalgo: {...}, sortalgo: {...} }
        if (!profile.courseProgress || typeof profile.courseProgress !== 'object') {
            profile.courseProgress = {
                data_structure: { openedPages: 0, completed: false },
                searchalgo: { openedPages: 0, completed: false },
                sortalgo: { openedPages: 0, completed: false }
            };
        } else {
            const ensureCourse = (k) => {
                if (!profile.courseProgress[k] || typeof profile.courseProgress[k] !== 'object') profile.courseProgress[k] = { openedPages: 0, completed: false };
                if (typeof profile.courseProgress[k].openedPages !== 'number') profile.courseProgress[k].openedPages = 0;
                if (typeof profile.courseProgress[k].completed !== 'boolean') profile.courseProgress[k].completed = false;
            };
            ['data_structure','searchalgo','sortalgo'].forEach(ensureCourse);
        }
        // Track unique pages visited per course
        if (!profile.coursePagesVisited || typeof profile.coursePagesVisited !== 'object') profile.coursePagesVisited = { data_structure: {}, searchalgo: {}, sortalgo: {} };
        ['data_structure','searchalgo','sortalgo'].forEach(key => {
            if (!profile.coursePagesVisited[key] || typeof profile.coursePagesVisited[key] !== 'object') profile.coursePagesVisited[key] = {};
        });
        // gacha pulls counter
        if (typeof profile.gachaPulls !== 'number') profile.gachaPulls = 0;
        return profile;
    }

    function loadProfile(email) {
        if (!email) return null;
        let raw = localStorage.getItem(keyFor(email));
        let profile = raw ? JSON.parse(raw) : null;
        if (!profile) {
            profile = { xp: 0, clicks: 0, pagesVisited: {}, pagesCount: 0, achievements: {}, lastUpdated: Date.now(), profile: { avatar: null, accentColor: null, flags: {} } };
            ensureExtendedFields(profile);
            localStorage.setItem(keyFor(email), JSON.stringify(profile));
        } else {
            // Ensure new nested profile shape exists
            if (!profile.profile) profile.profile = { avatar: null, accentColor: null, flags: {} };
            if (typeof profile.profile.flags !== 'object' || profile.profile.flags === null) profile.profile.flags = {};
            ensureExtendedFields(profile);
        }
        return profile;
    }

    function saveProfile(email, profile) {
        localStorage.setItem(keyFor(email), JSON.stringify(profile));
    }

    function getCurrentUserEmail() {
        const loggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
        const email = sessionStorage.getItem('currentUser');
        return loggedIn && email ? email : null;
    }

    function evaluateAchievements(email, profile) {
        let earnedNow = [];
        for (const def of ACH_DEFS) {
            const already = !!profile.achievements[def.id];
            const ok = def.condition.length >= 2 ? def.condition(profile, email) : def.condition(profile);
            if (!already && ok) {
                profile.achievements[def.id] = Date.now();
                earnedNow.push(def);
            }
        }
        if (earnedNow.length) {
            // Add XP reward per achievement unlocked in this pass
            const gain = earnedNow.reduce((acc, d) => acc + (d.xpReward || ACH_UNLOCK_XP), 0);
            profile.xp = Math.max(0, (profile.xp || 0) + gain);
            profile.lastUpdated = Date.now();
            saveProfile(email, profile);
            earnedNow.forEach(def => emitEarned({ id: def.id, title: def.title, icon: def.icon, desc: def.desc }));
            try { window.dispatchEvent(new CustomEvent('xp:award', { detail: { amount: gain, reason: 'achievement' } })); } catch(e) {}
        }
        return earnedNow;
    }

    function awardXP(amount, reason) {
        const email = getCurrentUserEmail();
        if (!email || !amount) return;
        const profile = loadProfile(email);
        profile.xp = Math.max(0, (profile.xp || 0) + Number(amount));
        profile.lastUpdated = Date.now();
        saveProfile(email, profile);
        evaluateAchievements(email, profile);
        // Optional: bubble event for other UI parts
        window.dispatchEvent(new CustomEvent('xp:award', { detail: { amount, reason } }));
    }

    function recordPageView(path) {
        const email = getCurrentUserEmail();
        if (!email) return;
        const p = loadProfile(email);
        const key = path || window.location.pathname + (window.location.search || '');

        if (!p.pagesVisited[key]) {
            p.pagesVisited[key] = Date.now();
            p.pagesCount = Object.keys(p.pagesVisited).length;
            // Award small XP on first visit to this page per account
            const delta = 10;
            p.xp = (p.xp || 0) + delta;
            try { window.dispatchEvent(new CustomEvent('xp:award', { detail: { amount: delta, reason: 'page-view' } })); } catch (e) {}
        }
        // Auto-adjust course page counters for the three courses
        try {
            const pathname = key || '';
            const normalize = (s) => (s || '').toLowerCase();
            const np = normalize(pathname);
            const markCoursePage = (courseKey) => {
                const pages = p.coursePagesVisited[courseKey];
                if (!pages[key]) {
                    pages[key] = Date.now();
                    p.courseProgress[courseKey].openedPages = Object.keys(p.coursePagesVisited[courseKey]).length;
                }
                // Fallback completion: mark complete if all known pages in course were opened
                try {
                    const TOTALS = { data_structure: 5, searchalgo: 5, sortalgo: 5 };
                    const total = TOTALS[courseKey] || 0;
                    if (total && p.courseProgress[courseKey].openedPages >= total) {
                        p.courseProgress[courseKey].completed = true;
                    }
                } catch(_) {}
            };
            if (np.includes('/course/course-type/data_structure/')) markCoursePage('data_structure');
            if (np.includes('/course/course-type/searchalgo/')) markCoursePage('searchalgo');
            if (np.includes('/course/course-type/sortalgo/')) markCoursePage('sortalgo');
            // Heuristic completion: when visiting the *_last.html page, mark completed
            if (np.includes('/course/course-type/data_structure/datalast.html')) p.courseProgress.data_structure.completed = true;
            if (np.includes('/course/course-type/searchalgo/searchlast.html')) p.courseProgress.searchalgo.completed = true;
            if (np.includes('/course/course-type/sortalgo/sortlast.html')) p.courseProgress.sortalgo.completed = true;
        } catch(_) {}

        p.lastUpdated = Date.now();
        saveProfile(email, p);
        evaluateAchievements(email, p);
    }

    function recordClick() {
        const email = getCurrentUserEmail();
        if (!email) return;
        const p = loadProfile(email);
        p.clicks = (p.clicks || 0) + 1;
        p.lastUpdated = Date.now();
        saveProfile(email, p);
        evaluateAchievements(email, p);
    }

    // Attach global API
    window.Achievements = {
        getDefinitions: () => ACH_DEFS.slice(),
        getState: (email) => {
            const e = email || getCurrentUserEmail();
            if (!e) return null;
            return loadProfile(e);
        },
        getLevelState: () => {
            const email = getCurrentUserEmail();
            if (!email) return null;
            const s = loadProfile(email);
            return computeLevelState(s?.xp || 0);
        },
        // Force achievement re-evaluation
        recheck: () => {
            const email = getCurrentUserEmail();
            if (!email) return false;
            const s = loadProfile(email);
            const res = evaluateAchievements(email, s);
            return !!res.length;
        },
        // Extended getters
        getTimeSpentMs: () => {
            const email = getCurrentUserEmail();
            if (!email) return 0;
            const s = loadProfile(email);
            // Include current active session time if running
            const now = Date.now();
            const live = s._sessionStart ? Math.max(0, now - s._sessionStart) : 0;
            return (s.timeSpentMs || 0) + live;
        },
        getCourseProgress: () => {
            const email = getCurrentUserEmail();
            if (!email) return null;
            const s = loadProfile(email);
            return JSON.parse(JSON.stringify(s.courseProgress));
        },
        getQuizResults: () => {
            const email = getCurrentUserEmail();
            if (!email) return {};
            const s = loadProfile(email);
            return JSON.parse(JSON.stringify(s.quizResults || {}));
        },
        getGachaPulls: () => {
            const email = getCurrentUserEmail();
            if (!email) return 0;
            const s = loadProfile(email);
            return s.gachaPulls || 0;
        },
        awardXP,
        recordPageView,
        recordClick,
        onEarned,
        resetState: (opts = {}) => {
            const email = opts.email || getCurrentUserEmail();
            if (!email) return false;
            const defaults = ensureExtendedFields({ xp: 0, clicks: 0, pagesVisited: {}, pagesCount: 0, achievements: {}, lastUpdated: Date.now(), profile: { avatar: null, accentColor: null, flags: {} } });
            saveProfile(email, defaults);
            // Clear session page-view flags for this user so first-visit XP can be re-earned
            try {
                const prefix = `pv_session_${email}_`;
                const toRemove = [];
                for (let i = 0; i < sessionStorage.length; i++) {
                    const key = sessionStorage.key(i);
                    if (key && key.startsWith(prefix)) toRemove.push(key);
                }
                toRemove.forEach(k => sessionStorage.removeItem(k));
            } catch (e) {}
            return true;
             },
        // Extended mutators
        recordQuizResult: (quizId, passed, score) => {
            const email = getCurrentUserEmail();
            if (!email || !quizId) return false;
            const s = loadProfile(email);
            const q = s.quizResults[quizId] || { attempts: 0 };
            q.attempts = (q.attempts || 0) + 1;
            q.passed = !!passed;
            if (typeof score === 'number') q.score = score;
            q.lastAt = Date.now();
            s.quizResults[quizId] = q;
            s.lastUpdated = Date.now();
            saveProfile(email, s);
            evaluateAchievements(email, s);
            return true;
        },
        incrementGachaPulls: () => {
            const email = getCurrentUserEmail();
            if (!email) return false;
            const s = loadProfile(email);
            s.gachaPulls = (s.gachaPulls || 0) + 1;
            s.lastUpdated = Date.now();
            saveProfile(email, s);
            evaluateAchievements(email, s);
            return true;
        }
    };

    // --- User Profile API (avatar & accent color) ---
    function ensureAccentStyle() {
        let style = document.getElementById('user-accent-style');
        if (!style) {
            style = document.createElement('style');
            style.id = 'user-accent-style';
            style.textContent = `:root { --accent-color: #ffaf1bff; } .button, .btn { accent-color: var(--accent-color); }`;
            document.head.appendChild(style);
        }
        return style;
    }

    window.UserProfile = {
        get() {
            const email = getCurrentUserEmail();
            if (!email) return null;
            return loadProfile(email).profile;
        },
        setAvatar(dataUrl) {
            const email = getCurrentUserEmail();
            if (!email) return false;
            const p = loadProfile(email);
            p.profile.avatar = dataUrl || null;
            saveProfile(email, p);
            try { window.dispatchEvent(new CustomEvent('userprofile:change', { detail: { email, kind: 'avatar' } })); } catch(e) {}
            return true;
        },
        clearAvatar() { return this.setAvatar(null); },
        setAccentColor(color) {
            const email = getCurrentUserEmail();
            if (!email) return false;
            const p = loadProfile(email);
            p.profile.accentColor = color || null;
            saveProfile(email, p);
            try { window.dispatchEvent(new CustomEvent('userprofile:change', { detail: { email, kind: 'accent' } })); } catch(e) {}
            return true;
        },
        setFlag(key, val) {
            const email = getCurrentUserEmail();
            if (!email) return false;
            const p = loadProfile(email);
            p.profile.flags[key] = val;
            saveProfile(email, p);
            try { window.dispatchEvent(new CustomEvent('userprofile:change', { detail: { email, kind: 'flag', key } })); } catch(e) {}
            return true;
        },
        applyAccent() {
            try {
                const email = getCurrentUserEmail();
                const color = email ? (loadProfile(email).profile.accentColor || '#ffaf1bff') : '#ffaf1bff';
                ensureAccentStyle();
                document.documentElement.style.setProperty('--accent-color', color);
            } catch(e) {}
        }
    };

    // --- UI: Bottom-right toast for earned achievements ---
    let toastCssInjected = false;
    function ensureToastCss() {
        if (toastCssInjected) return;
        const style = document.createElement('style');
        style.id = 'achievement-toast-css';
        style.textContent = `
            #achievement-toast-container { position: fixed; right: 16px; bottom: 16px; display: flex; flex-direction: column; gap: 10px; z-index: 9999; pointer-events: none; }
            .achievement-toast { pointer-events: auto; display: flex; align-items: center; gap: 12px; background: rgba(17,17,26,0.92); border: 1px solid rgba(255,255,255,0.12); color:#fff; border-radius: 14px; padding: 14px 16px; min-width: 300px; max-width: 420px; box-shadow: 0 10px 26px rgba(0,0,0,0.35); opacity: 0; transform: translateY(12px); transition: opacity 180ms ease, transform 180ms ease; }
            .achievement-toast.show { opacity: 1; transform: translateY(0); }
            .achievement-toast .icon { font-size: 1.5rem; color: var(--accent-color); display:flex; align-items:center; }
            .achievement-toast .content { display:flex; flex-direction:column; line-height:1.2; }
            .achievement-toast .title { font-weight: 800; font-size: 1.05rem; }
            .achievement-toast .subtitle { font-size: 0.9rem; color: #cfcfcf; }
            @media (max-width: 480px) { #achievement-toast-container { right: 8px; bottom: 8px; } .achievement-toast { min-width: 240px; } }
        `;
        document.head.appendChild(style);
        toastCssInjected = true;
    }

    let toastContainer = null;
    function getToastContainer() {
        if (!toastContainer) {
            toastContainer = document.getElementById('achievement-toast-container');
            if (!toastContainer) {
                toastContainer = document.createElement('div');
                toastContainer.id = 'achievement-toast-container';
                document.body.appendChild(toastContainer);
            }
        }
        return toastContainer;
    }

    const MAX_TOASTS = 3;
    function showAchievementToast({ title, icon, desc }) {
        ensureToastCss();
        const container = getToastContainer();
        // Cap concurrent toasts
        while (container.children.length >= MAX_TOASTS) {
            container.removeChild(container.firstChild);
        }

        const toast = document.createElement('div');
        toast.className = 'achievement-toast';
        toast.innerHTML = `
            <div class="icon"><i class="fa-solid ${icon || 'fa-trophy'}"></i></div>
            <div class="content">
               <div class="title">Achievement Unlocked</div>
               <div class="subtitle">${title || 'New achievement!'}</div>
            </div>
        `;
        container.appendChild(toast);

        // Animate in
        requestAnimationFrame(() => toast.classList.add('show'));

        // Auto-dismiss
        const ttl = 3600;
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) toast.parentNode.removeChild(toast);
            }, 220);
        }, ttl);

        // Optional click to dismiss sooner
        toast.addEventListener('click', () => {
            toast.classList.remove('show');
            setTimeout(() => { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 180);
        });
    }

    // Subscribe to earned events to show toasts
    onEarned((payload) => {
        // Only show toasts when a user is logged in to avoid noise
        if (!getCurrentUserEmail()) return;
        // Ensure DOM is ready enough to inject
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => showAchievementToast(payload), { once: true });
        } else {
            showAchievementToast(payload);
        }
    });

    // --- Level system: compute level from XP and show a level bar widget ---
    function requiredForLevel(level) {
        // Simple linear growth: 100, 150, 200, ...
        return 100;
    }
    // for now make it 100 each level

    function computeLevelState(xp) {
        let level = 1;
        let remaining = Math.max(0, Math.floor(xp || 0));
        let req = requiredForLevel(level);
        // Prevent excessive loops
        let guard = 0;
        while (remaining >= req && guard++ < 1000) {
            remaining -= req;
            level += 1;
            req = requiredForLevel(level);
        }
        const percent = req > 0 ? Math.min(1, remaining / req) : 1;
        return { level, xpInLevel: remaining, reqForLevel: req, percent };
    }

    // UI for level widget
    let levelCssInjected = false;
    function ensureLevelCss() {
        if (levelCssInjected) return;
        const style = document.createElement('style');
        style.id = 'level-widget-css';
        style.textContent = `
            #level-widget { position: fixed; right: 16px; bottom: 36px; z-index: 9998; display: none; }
            .lw-card { background: rgba(17,17,26,0.92); border: 1px solid rgba(255,255,255,0.12); color:#fff; border-radius: 14px; padding: 12px 14px; min-width: 220px; max-width: 320px; box-shadow: 0 8px 24px rgba(0,0,0,0.35); }
            .lw-header { position: relative; display:flex; align-items:baseline; gap: 8px; margin-bottom: 6px; }
            .lw-title { font-size: 0.8rem; color: #cfcfcf; letter-spacing: .02em; }
            .lw-level { font-size: 1.1rem; font-weight: 800; color: var(--accent-color); position: relative; }
            .lw-badge { position: absolute; right: 0; top: -14px; background: rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.18); color: #8be38b; padding: 2px 6px; border-radius: 999px; font-size: 0.72rem; opacity: 0; transform: translateY(4px); transition: opacity 200ms ease, transform 200ms ease; pointer-events: none; }
            .lw-badge.show { opacity: 1; transform: translateY(0); }
            .lw-bar { position: relative; width: 100%; height: 10px; background: rgba(255,255,255,0.08); border-radius: 999px; overflow: hidden; }
            .lw-fill { position:absolute; left:0; top:0; bottom:0; width:0%; background: linear-gradient(90deg,#6B53DE,#9B7BFF); border-radius: 999px; transition: width 300ms ease; }
            .lw-xp { margin-top: 6px; font-size: 0.8rem; color: #dcdcdc; text-align: right; }
            @media (max-width: 480px) { #level-widget { right: 8px; bottom: 28px; } }
        `;
        document.head.appendChild(style);
        levelCssInjected = true;
    }

    let levelWidget = null;
    function ensureLevelWidget() {
        ensureLevelCss();
        if (!levelWidget) {
            levelWidget = document.getElementById('level-widget');
            if (!levelWidget) {
                levelWidget = document.createElement('div');
                levelWidget.id = 'level-widget';
                levelWidget.innerHTML = `
                    <div class="lw-card">
                        <div class="lw-header">
                            <span class="lw-title">Level</span>
                            <span class="lw-level" id="lw-level">1</span>
                            <span class="lw-badge" id="lw-badge">+0 XP</span>
                        </div>
                        <div class="lw-bar"><div class="lw-fill" id="lw-fill"></div></div>
                        <div class="lw-xp" id="lw-xp">0/100 XP</div>
                    </div>
                `;
                document.body.appendChild(levelWidget);
            }
        }
        return levelWidget;
    }

    function updateLevelWidget() {
        const email = getCurrentUserEmail();
        const widget = ensureLevelWidget();
        if (!email) {
            widget.style.display = 'none';
            return;
        }
        const state = loadProfile(email);
        const lv = computeLevelState(state.xp || 0);
        const lvlEl = widget.querySelector('#lw-level');
        const fillEl = widget.querySelector('#lw-fill');
        const xpEl = widget.querySelector('#lw-xp');
        if (lvlEl) lvlEl.textContent = String(lv.level);
        if (fillEl) fillEl.style.width = Math.round(lv.percent * 100) + '%';
        if (xpEl) xpEl.textContent = `${lv.xpInLevel}/${lv.reqForLevel} XP`;
        widget.style.display = 'block';
    }

    function showLevelGain(amount) {
        const widget = ensureLevelWidget();
        const badge = widget.querySelector('#lw-badge');
        if (!badge) return;
        badge.textContent = (amount > 0 ? '+' : '') + amount + ' XP';
        badge.classList.add('show');
        setTimeout(() => badge.classList.remove('show'), 1000);
    }

    // Wire level widget updates
    document.addEventListener('DOMContentLoaded', updateLevelWidget);
    window.addEventListener('auth:login', updateLevelWidget);
    window.addEventListener('auth:logout', updateLevelWidget);
    window.addEventListener('xp:award', (e) => {
        updateLevelWidget();
        if (e && e.detail && typeof e.detail.amount === 'number') {
            showLevelGain(e.detail.amount);
            
            // Check for level up and award currency
            checkForLevelUpCurrency();
        }
    });

    // Track last known level for currency rewards
    let lastKnownLevel = null;

    function checkForLevelUpCurrency() {
        if (!window.Achievements || typeof window.Achievements.getLevelState !== 'function') return;
        
        const lv = window.Achievements.getLevelState();
        if (lastKnownLevel !== null && lv.level > lastKnownLevel) {
            // User leveled up! Award coins
            const levelsGained = lv.level - lastKnownLevel;
            const coinsAwarded = levelsGained * 50; // 50 coins per level
            
            if (typeof window.awardCurrency === 'function') {
                window.awardCurrency(coinsAwarded, `Level ${lv.level}`);
            } else {
                // Store currency if gacha page isn't loaded
                const email = getCurrentUserEmail();
                if (email) {
                    const stored = localStorage.getItem('coins_' + email);
                    const parsed = parseInt(stored, 10);
                    const currentCoins = Number.isNaN(parsed) ? 100 : parsed;
                    localStorage.setItem('coins_' + email, (currentCoins + coinsAwarded).toString());
                }
            }
        }
        lastKnownLevel = lv.level;
    }

    // Initialize last known level when page loads
    function initializeLevelTracking() {
        if (getCurrentUserEmail() && window.Achievements && typeof window.Achievements.getLevelState === 'function') {
            const lv = window.Achievements.getLevelState();
            lastKnownLevel = lv.level;
        }
    }

    // Wire base triggers when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        // Only track when logged in
        const email = getCurrentUserEmail();
        // Apply accent for current user if any
        try { window.UserProfile && window.UserProfile.applyAccent && window.UserProfile.applyAccent(); } catch(e) {}
        if (!email) return;

        // Initialize level tracking for currency rewards
        initializeLevelTracking();

        // Start live time tracking
        try {
            const prof = loadProfile(email);
            if (!prof._sessionStart) {
                prof._sessionStart = Date.now();
                saveProfile(email, prof);
            }
            // Recalculate course completion on load in case pages were visited before this rule existed
            try {
                const TOTALS = { data_structure: 5, searchalgo: 5, sortalgo: 5 };
                ['data_structure','searchalgo','sortalgo'].forEach(k => {
                    const opened = Object.keys(prof.coursePagesVisited[k] || {}).length;
                    prof.courseProgress[k].openedPages = opened;
                    if (TOTALS[k] && opened >= TOTALS[k]) prof.courseProgress[k].completed = true;
                });
                saveProfile(email, prof);
                evaluateAchievements(email, prof);
            } catch(_) {}
        } catch(_) {}

        // Periodically evaluate time-based achievements while user stays on the page
        try {
            if (!window.__ach_time_eval_timer) {
                window.__ach_time_eval_timer = setInterval(() => {
                    const e = getCurrentUserEmail();
                    if (!e) return;
                    const s = loadProfile(e);
                    evaluateAchievements(e, s);
                }, 60000); // 1 minute
            }
        } catch(_) {}

        // Record page view once per session to avoid XP farm on refresh
        const sessionKey = `pv_session_${email}_${window.location.pathname}${window.location.search || ''}`;
        if (!sessionStorage.getItem(sessionKey)) {
            recordPageView();
            sessionStorage.setItem(sessionKey, '1');
        }

        // Listen globally for clicks (won't interfere with visual click.js)
        // Debounce micro-bursts by batching within same animation frame
        let clickQueued = false;
        document.addEventListener('click', function() {
            if (clickQueued) return;
            clickQueued = true;
            requestAnimationFrame(() => {
                clickQueued = false;
                recordClick();
            });
        }, true); // capture to ensure we always hear it
    });

    // Ensure accent updates on auth events
    window.addEventListener('auth:login', function(){ try { window.UserProfile && window.UserProfile.applyAccent && window.UserProfile.applyAccent(); } catch(e) {} });
    window.addEventListener('auth:logout', function(){ try { window.UserProfile && window.UserProfile.applyAccent && window.UserProfile.applyAccent(); } catch(e) {} });

    // Accumulate time on visibility changes and before unload
    function __accumulateTime() {
        const email = (sessionStorage.getItem('isLoggedIn') === 'true') && sessionStorage.getItem('currentUser');
        if (!email) return;
        try {
            const prof = loadProfile(email);
            const now = Date.now();
            if (prof._sessionStart && prof._sessionStart <= now) {
                const delta = now - prof._sessionStart;
                prof.timeSpentMs = Math.max(0, (prof.timeSpentMs || 0) + delta);
                prof._sessionStart = 0; // paused
                prof.lastUpdated = now;
                saveProfile(email, prof);
                evaluateAchievements(email, prof);
            }
        } catch(_) {}
    }
    function __resumeTime() {
        const email = (sessionStorage.getItem('isLoggedIn') === 'true') && sessionStorage.getItem('currentUser');
        if (!email) return;
        try {
            const prof = loadProfile(email);
            if (!prof._sessionStart) {
                prof._sessionStart = Date.now();
                saveProfile(email, prof);
            }
        } catch(_) {}
    }
    document.addEventListener('visibilitychange', function(){
        if (document.hidden) __accumulateTime(); else __resumeTime();
    });
    window.addEventListener('beforeunload', function(){ __accumulateTime(); });

    // --- Secret code: Up, Down, Left, Right, Enter ---
    (function(){
        const seq = ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Enter'];
        let idx = 0;
        window.addEventListener('keydown', function(e){
            const key = e.key;
            if (key === seq[idx]) {
                idx += 1;
                if (idx === seq.length) {
                    idx = 0;
                    try {
                        if (window.UserProfile && typeof window.UserProfile.setFlag === 'function') {
                            window.UserProfile.setFlag('secretCodeUsed', true);
                        }
                        if (window.Achievements && typeof window.Achievements.recheck === 'function') {
                            window.Achievements.recheck();
                        }
                    } catch(_) {}
                }
            } else {
                idx = 0;
            }
        }, true);
    })();
})();

// --- Global reset to default appearance ---
window.resetUserAppearanceDefaults = function() {
    try {
        const email = sessionStorage.getItem('currentUser');
        // Reset profile fields (avatar, accent, frame)
        if (window.UserProfile) {
            try { window.UserProfile.clearAvatar && window.UserProfile.clearAvatar(); } catch(_) {}
            try { window.UserProfile.setAccentColor && window.UserProfile.setAccentColor(null); } catch(_) {}
            try { window.UserProfile.setFlag && window.UserProfile.setFlag('selectedFrame', ''); } catch(_) {}
        }
        // Reset per-user prefs bucket
        if (email) {
            const prefsKey = `profile_prefs_${email}`;
            const prefs = JSON.parse(localStorage.getItem(prefsKey) || '{}');
            delete prefs.navbarTheme;
            delete prefs.background;
            delete prefs.textColor; // legacy cleanup
            delete prefs.textStyle; // legacy cleanup
            localStorage.setItem(prefsKey, JSON.stringify(prefs));
        }
        // Reset applied UI appearance
        try { __resetNavbarTheme(); } catch(_) {}
        try { __resetBackgroundTheme(); } catch(_) {}
        try { if (window.Theme && typeof window.Theme.setTheme === 'function') window.Theme.setTheme('purple'); } catch(_) {}
        try { window.UserProfile && window.UserProfile.applyAccent && window.UserProfile.applyAccent(); } catch(_) {}
        try { __applyNavbarThemeFromPrefs(); } catch(_) {}
        try { __applyBackgroundThemeFromPrefs(); } catch(_) {}
        // Notify other tabs to refresh
        try { localStorage.setItem('profile_prefs_signal', String(Date.now())); } catch(_) {}
        // In-page consumers update
        try { window.dispatchEvent(new CustomEvent('userprofile:change', { detail: { kind: 'reset' } })); } catch(_) {}
        return true;
    } catch (e) { return false; }
};
