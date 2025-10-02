// Ensure navbar reflects auth state
document.addEventListener('DOMContentLoaded', function() {
    if (window.updateNavbarState) window.updateNavbarState();
});

// Simple utilities
function getCurrentEmail() {
    return sessionStorage.getItem('currentUser') || 'guest';
}

function getPrefsKey() {
    const email = getCurrentEmail();
    return `profile_prefs_${email}`;
}

function getPrefs() {
    try {
        return JSON.parse(localStorage.getItem(getPrefsKey())) || {};
    } catch (_) {
        return {};
    }
}

function savePref(key, value) {
    const prefs = getPrefs();
    prefs[key] = value;
    localStorage.setItem(getPrefsKey(), JSON.stringify(prefs));
}

function applyPrefs() {
    const prefs = getPrefs();
    // Apply navbar theme (local preview)
    if (prefs.navbarTheme && (prefs.navbarTheme.bg || prefs.navbarTheme.gradient || prefs.navbarTheme.color)) {
        const nav = document.querySelector('.navbar');
        const wrap = document.querySelector('.navbar__container');
        const value = prefs.navbarTheme.bg || prefs.navbarTheme.gradient || prefs.navbarTheme.color;
        if (wrap) wrap.style.background = value;
        if (nav && prefs.navbarTheme.id) nav.classList.toggle('navbar--light', prefs.navbarTheme.id === 'light');
    }
    // Background theme removed; keep site default
    // Apply text style
    if (prefs.textStyle && prefs.textStyle.id) {
        document.body.style.fontWeight = prefs.textStyle.id === 'bold' ? 'bold' : '';
        document.body.style.fontStyle = prefs.textStyle.id === 'italic' ? 'italic' : '';
        if (prefs.textStyle.id === 'custom-font') {
            document.body.style.fontFamily = '"Comic Sans MS", cursive';
        } else {
            // Reset to site default Kumbh Sans if not custom
            document.body.style.fontFamily = '"Kumbh Sans", sans-serif';
        }
    }
    // Apply special effects (delegated to global applier when available)
    const hasLegacyEffect = !!(prefs.specialEffect && prefs.specialEffect.id);
    const hasMultiEffects = Array.isArray(prefs.specialEffects) && prefs.specialEffects.length > 0;
    if (window.applySpecialEffectsFromPrefs && (hasLegacyEffect || hasMultiEffects)) {
        window.applySpecialEffectsFromPrefs();
    }
}

function dataUrlFromFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function renderAvatarPreview(url) {
    const box = document.getElementById('avatarBox');
    box.innerHTML = '';
    if (url) {
        const img = document.createElement('img');
        img.src = url; box.appendChild(img);
    } else {
        const ph = document.createElement('div');
        ph.className = 'placeholder';
        ph.innerHTML = '<i class="fa-solid fa-user"></i>';
        box.appendChild(ph);
    }
}

// Apply selected avatar frame ring to the preview circle
function applyAvatarFrame(frameId) {
    const box = document.getElementById('avatarBox');
    if (!box) return;
    // Normalize legacy ids to new ones
    const id = (
        frameId === 'gold' ? 'default' :
        frameId === 'pink' ? 'sunset' :
        frameId === 'blue' ? 'ocean' :
        frameId === 'galaxy' ? 'purple' :
        frameId
    );
    const map = {
        default: {
            boxShadow: '0 0 0 6px var(--accent-color), 0 6px 22px rgba(0,0,0,0.35)',
            border: '2px solid rgba(255,255,255,0.08)'
        },
        purple: {
            boxShadow: '0 0 0 6px #9B7BFF, 0 6px 22px #9B7BFF66',
            border: '2px solid rgba(255,255,255,0.08)'
        },
        ocean: {
            boxShadow: '0 0 0 6px #2196F3, 0 6px 22px #00BCD466',
            border: '2px solid rgba(255,255,255,0.08)'
        },
        sunset: {
            boxShadow: '0 0 0 6px #FF6B6B, 0 6px 22px #FFA62B66',
            border: '2px solid rgba(255,255,255,0.08)'
        },
        matrix: {
            boxShadow: '0 0 0 6px #00FF88, 0 6px 22px #00CC6680',
            border: '2px solid rgba(255,255,255,0.08)'
        },
        neon: {
            boxShadow: '0 0 0 6px #39ff14, 0 0 18px #39ff14AA, 0 0 32px #00ffff66',
            border: '2px solid rgba(255,255,255,0.08)'
        }
    };
    const style = map[id] || { boxShadow: '', border: '2px dashed rgba(255,255,255,0.18)' };
    box.style.boxShadow = style.boxShadow;
    box.style.border = style.border;
}

function loadProfileUI() {
    try {
        const s = (window.Achievements && window.Achievements.getState && window.Achievements.getState()) || null;
        const prof = (s && s.profile) || { avatar: null, accentColor: null, flags: {} };
        renderAvatarPreview(prof.avatar);
        applyAvatarFrame((prof.flags && prof.flags.selectedFrame) || '');
        const picker = document.getElementById('accentPicker');
        if (prof.accentColor) picker.value = prof.accentColor;
        document.getElementById('accentPreview').style.setProperty('--accent-color', picker.value);
        if (window.UserProfile && window.UserProfile.applyAccent) window.UserProfile.applyAccent();
        buildFrames(prof.flags || {});
        buildNavbarThemes();
        // Background theme removed
        buildSpecialEffects();
        buildSiteThemes();
        // Apply saved preferences to the UI
        applyPrefs();

        // Gate accent color picker by gacha unlock
        try {
            const email = sessionStorage.getItem('currentUser');
            const customizations = email ? JSON.parse(localStorage.getItem(`customizations_${email}`)) || {} : {};
            const unlocked = Array.isArray(customizations.accentPicker) ? customizations.accentPicker.includes('unlocked') : (customizations.accentPicker === 'unlocked');
            const labelEl = picker && picker.closest('.field')?.querySelector('label');
            if (picker) {
                picker.disabled = !unlocked;
                picker.title = unlocked ? '' : 'Unlock via Gacha to enable the accent color picker';
            }
            if (labelEl && !unlocked) {
                labelEl.innerHTML = 'Accent color (Locked 🔒)';
            }
        } catch(_) {}
    } catch (e) {}
}

function buildSiteThemes() {
    const grid = document.getElementById('siteThemeGrid');
    if (!grid) return;
    grid.innerHTML = '';
    const prefs = getPrefs();
    const current = (prefs.siteTheme && prefs.siteTheme.id) || (window.Theme && window.Theme.getTheme && window.Theme.getTheme()) || 'purple';

    const THEMES = [
        { id: 'purple', label: 'Purple', bg: 'linear-gradient(90deg, #6B53DE, #9B7BFF)' },
        { id: 'ocean', label: 'Ocean', bg: 'linear-gradient(90deg, #00BCD4, #2196F3)' },
        { id: 'sunset', label: 'Sunset', bg: 'linear-gradient(90deg, #FF6B6B, #FFA62B)' },
        { id: 'matrix', label: 'Matrix', bg: 'linear-gradient(90deg, #00FF88, #00CC66)' }
    ];

    // Read unlocked site themes from customizations; purple is always unlocked
    const email = sessionStorage.getItem('currentUser');
    const customizations = email ? JSON.parse(localStorage.getItem(`customizations_${email}`)) || {} : {};
    const unlockedSiteThemes = new Set([ 'Purple', ...(customizations.siteTheme || []) ]);

    THEMES.forEach(theme => {
        const chip = document.createElement('button');
        const unlocked = unlockedSiteThemes.has(theme.label);
        chip.className = 'customization-option' + (unlocked ? '' : ' locked');
        chip.style.background = unlocked ? theme.bg : 'rgba(255,255,255,0.1)';
        chip.style.color = unlocked ? '#000' : '#888';
        chip.textContent = unlocked ? theme.label : `${theme.label} 🔒`;
        chip.disabled = !unlocked;
        // If previously saved theme was removed (e.g., 'neon'), coerce to default
        const effectiveCurrent = (current === 'neon') ? 'purple' : current;
        if (unlocked && effectiveCurrent === theme.id) chip.classList.add('selected');

        chip.addEventListener('click', () => {
            if (!unlocked) return;
            // Update chip selection visuals
            document.querySelectorAll('#siteThemeGrid .customization-option').forEach(el => el.classList.remove('selected'));
            chip.classList.add('selected');
            // Apply and persist the global theme
            if (window.Theme && typeof window.Theme.setTheme === 'function') {
                window.Theme.setTheme(theme.id);
            }
            // Save in per-user prefs as well for UI state
            savePref('siteTheme', { id: theme.id, label: theme.label });
        });

        grid.appendChild(chip);
    });
}

function buildFrames(flags) {
    const grid = document.getElementById('frameGrid');
    if (!grid) return;
    grid.innerHTML = '';
    const FRAMES = [
        { id: 'default', color: 'var(--accent-color)', label: 'Default' },
        { id: 'purple', color: '#9B7BFF', label: 'Purple' },
        { id: 'ocean', color: 'linear-gradient(45deg, #00BCD4, #2196F3)', label: 'Ocean' },
        { id: 'sunset', color: 'linear-gradient(45deg, #FF6B6B, #FFA62B)', label: 'Sunset' },
        { id: 'matrix', color: 'linear-gradient(45deg, #00FF88, #00CC66)', label: 'Matrix' },
        { id: 'neon', color: '#39ff14', label: 'Neon' }
    ];
    
    // Get unlocked customizations from gacha
    const email = sessionStorage.getItem('currentUser');
    const customizations = email ? JSON.parse(localStorage.getItem(`customizations_${email}`)) || {} : {};
    const unlockedFrames = new Set([ 'Default', ...(customizations.frame || []) ]);
    
    const selectedRaw = flags.selectedFrame || '';
    const selected = selectedRaw === 'gold' ? 'default'
        : selectedRaw === 'pink' ? 'sunset'
        : selectedRaw === 'blue' ? 'ocean'
        : selectedRaw === 'galaxy' ? 'purple'
        : selectedRaw;
    FRAMES.forEach(f => {
        // Determine if frame is unlocked (Default always unlocked)
        const unlocked = unlockedFrames.has(f.label);
        const chip = document.createElement('button');
        chip.className = 'customization-option' + (unlocked ? '' : ' locked');
        if (unlocked && selected === f.id) chip.classList.add('selected');
        
        chip.style.background = unlocked ? f.color : 'rgba(255,255,255,0.1)';
        chip.textContent = unlocked ? f.label : `${f.label} 🔒`;
        chip.disabled = !unlocked;
        
        chip.addEventListener('click', () => {
            if (!unlocked) return;
            document.querySelectorAll('#frameGrid .customization-option').forEach(el => el.classList.remove('selected'));
            chip.classList.add('selected');
            if (window.UserProfile && window.UserProfile.setFlag) {
                window.UserProfile.setFlag('selectedFrame', f.id);
            }
            applyAvatarFrame(f.id);
        });
        grid.appendChild(chip);
    });
}

function buildNavbarThemes() {
    const grid = document.getElementById('navbarThemeGrid');
    if (!grid) return;
    grid.innerHTML = '';
    const prefs = getPrefs();
    
    const NAVBAR_THEMES = [
        { id: 'dark', bg: 'var(--color-bg-deep)', label: 'Dark' },
        { id: 'light', bg: 'linear-gradient(90deg, #f4f6f9, #e9eef5)', label: 'Light' },
        { id: 'ocean', bg: 'linear-gradient(90deg, #00BCD4, #2196F3)', label: 'Ocean' },
        { id: 'sunset', bg: 'linear-gradient(90deg, #FF6B6B, #FFA62B)', label: 'Sunset' },
        { id: 'matrix', bg: 'linear-gradient(90deg, #00FF88, #00CC66)', label: 'Matrix' },
        { id: 'neon', bg: 'linear-gradient(90deg, #39ff14, #00ffff66)', label: 'Neon' }
    ];
    
    const email = sessionStorage.getItem('currentUser');
    const customizations = email ? JSON.parse(localStorage.getItem(`customizations_${email}`)) || {} : {};
    // Dark is always unlocked; others require unlock. Allow Light if explicitly unlocked.
    const unlockedThemes = new Set([ 'Dark Theme', ...(customizations.navbarTheme || []) ]);
    
    NAVBAR_THEMES.forEach(theme => {
        const humanLabel = theme.label + ' Theme';
        const unlocked = theme.id === 'dark' ? true : unlockedThemes.has(humanLabel);
        const chip = document.createElement('button');
        chip.className = 'customization-option' + (unlocked ? '' : ' locked');
        chip.style.background = unlocked ? (theme.bg || theme.color) : 'rgba(255,255,255,0.1)';
        chip.style.color = '#fff';
        chip.textContent = unlocked ? theme.label : `${theme.label} 🔒`;
        chip.disabled = !unlocked;
        if (prefs.navbarTheme && prefs.navbarTheme.id === theme.id) chip.classList.add('selected');
        
        chip.addEventListener('click', () => {
            if (!unlocked) return;
            document.querySelectorAll('#navbarThemeGrid .customization-option').forEach(el => el.classList.remove('selected'));
            chip.classList.add('selected');
            // Apply navbar theme via container bg and light class toggle
            const nav = document.querySelector('.navbar');
            const wrap = document.querySelector('.navbar__container');
            if (nav && wrap) {
                wrap.style.background = theme.bg || theme.color;
                nav.classList.toggle('navbar--light', theme.id === 'light');
            }
            // Persist only needed fields to prefs
            savePref('navbarTheme', { id: theme.id, label: theme.label, bg: theme.bg || theme.color });
            // Trigger global applier (same tab)
            if (window.applyNavbarThemeFromPrefs) window.applyNavbarThemeFromPrefs();
            // Notify other tabs
            try { localStorage.setItem('profile_prefs_signal', String(Date.now())); } catch (_) {}
        });
        grid.appendChild(chip);
    });
}

// Background theme UI removed


function buildSpecialEffects() {
    const grid = document.getElementById('specialEffectsGrid');
    if (!grid) return;
    grid.innerHTML = '';
    const prefs = getPrefs();
    
    const SPECIAL_EFFECTS = [
        { id: 'rgb', label: 'RGB Cycle' },
        { id: 'glow', label: 'Glowing Border' },
        // Removed unused effects: particles, shifter
    ];
    
    const email = sessionStorage.getItem('currentUser');
    const customizations = email ? JSON.parse(localStorage.getItem(`customizations_${email}`)) || {} : {};
    const unlockedEffects = new Set(customizations.specialEffect || []);
    
    // Build a set of selected effect ids (supports legacy + new array)
    const selectedIds = new Set(Array.isArray(prefs.specialEffects) ? prefs.specialEffects : []);
    if (prefs.specialEffect && prefs.specialEffect.id) selectedIds.add(prefs.specialEffect.id);

    SPECIAL_EFFECTS.forEach(effect => {
        const unlocked = unlockedEffects.has(effect.label);
        const chip = document.createElement('button');
        chip.className = 'customization-option' + (unlocked ? '' : ' locked');
        chip.textContent = unlocked ? effect.label : `${effect.label} 🔒`;
        chip.disabled = !unlocked;
        if (selectedIds.has(effect.id)) chip.classList.add('selected');
        
        chip.addEventListener('click', () => {
            if (!unlocked) return;
            // Recompute selection set from prefs for safety
            const p = getPrefs();
            const set = new Set(Array.isArray(p.specialEffects) ? p.specialEffects : []);
            const isSelected = set.has(effect.id) || (p.specialEffect && p.specialEffect.id === effect.id);
            if (isSelected) {
                // Toggle OFF
                set.delete(effect.id);
                chip.classList.remove('selected');
            } else {
                // Toggle ON
                set.add(effect.id);
                chip.classList.add('selected');
            }
            // Persist new array and clear legacy single-selection to avoid confusion
            savePref('specialEffects', Array.from(set));
            savePref('specialEffect', { id: '', label: '' });
            // Apply special effects via global applier
            if (window.applySpecialEffectsFromPrefs) window.applySpecialEffectsFromPrefs();
            try { localStorage.setItem('profile_prefs_signal', String(Date.now())); } catch (_) {}
        });
        grid.appendChild(chip);
    });

    // Speed control for RGB Cycle
    const speedBtn = document.getElementById('rgbSpeedBtn');
    if (speedBtn) {
        const getRgbSpeed = () => {
            const p = getPrefs();
            const s = p.specialEffectSpeed;
            return (s && s.id) || 'normal';
        };
        const setRgbSpeed = (id) => {
            savePref('specialEffectSpeed', { id, label: id === 'slow' ? 'Slow' : id === 'fast' ? 'Fast' : 'Normal' });
        };
        const updateLabel = () => {
            const cur = getRgbSpeed();
            speedBtn.textContent = 'Speed: ' + (cur === 'slow' ? 'Slow' : cur === 'fast' ? 'Fast' : 'Normal');
        };
        updateLabel();
        speedBtn.addEventListener('click', () => {
            const cur = getRgbSpeed();
            const next = cur === 'slow' ? 'normal' : (cur === 'normal' ? 'fast' : 'slow');
            setRgbSpeed(next);
            updateLabel();
            if (window.applySpecialEffectsFromPrefs) window.applySpecialEffectsFromPrefs();
            try { localStorage.setItem('profile_prefs_signal', String(Date.now())); } catch (_) {}
        });
    }
}

function bindAdminPanelHandlers() {
    const panel = document.getElementById('adminPanel');
    if (!panel) return;
    if (panel.dataset.bound === '1') return; // prevent double-binding
    panel.dataset.bound = '1';
    const status = document.getElementById('adminStatus');
    const resetBtn = document.getElementById('adminReset');
    const coinsBtn = document.getElementById('adminCoins');
    if (resetBtn) {
        resetBtn.addEventListener('click', function(){
            if (!confirm('Reset your XP and achievements?')) return;
            try {
                if (window.Achievements && typeof window.Achievements.resetState === 'function') {
                    window.Achievements.resetState();
                }
                if (status) status.textContent = 'XP and achievements reset.';
                // Refresh the level widget numbers directly (avoid +0 XP toast)
                try {
                    if (window.Achievements && typeof window.Achievements.getLevelState === 'function') {
                        const lv = window.Achievements.getLevelState();
                        const lvlEl = document.getElementById('lw-level');
                        const fillEl = document.getElementById('lw-fill');
                        const xpEl = document.getElementById('lw-xp');
                        if (lvlEl) lvlEl.textContent = String(lv.level);
                        if (fillEl) fillEl.style.width = Math.round(lv.percent * 100) + '%';
                        if (xpEl) xpEl.textContent = `${lv.xpInLevel}/${lv.reqForLevel} XP`;
                    }
                } catch (e) {}
            } catch(e) {}
        });
    }
    if (coinsBtn) {
        coinsBtn.addEventListener('click', function(){
            try {
                const email = sessionStorage.getItem('currentUser');
                if (email) localStorage.setItem('coins_' + email, '500');
                if (status) status.textContent = 'Coins set to 500.';
            } catch(e) {}
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const chooseBtn = document.getElementById('chooseAvatarBtn');
    const clearBtn = document.getElementById('clearAvatarBtn');
    const input = document.getElementById('avatarInput');
    const picker = document.getElementById('accentPicker');
    const preview = document.getElementById('accentPreview');
    const saveBtn = document.getElementById('saveCustomize');
    const resetBtn = document.getElementById('resetCustomize');

    // Load existing
    loadProfileUI();

    chooseBtn.addEventListener('click', () => input.click());
    input.addEventListener('change', async (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) { alert('Please choose an image under 2MB.'); return; }
        const url = await dataUrlFromFile(file);
        renderAvatarPreview(url);
        if (window.UserProfile && window.UserProfile.setAvatar) window.UserProfile.setAvatar(url);
    });
    clearBtn.addEventListener('click', () => {
        renderAvatarPreview(null);
        if (window.UserProfile && window.UserProfile.clearAvatar) window.UserProfile.clearAvatar();
    });

    picker.addEventListener('input', () => {
        preview.style.setProperty('--accent-color', picker.value);
    });

    saveBtn.addEventListener('click', () => {
        if (window.UserProfile && window.UserProfile.setAccentColor) {
            window.UserProfile.setAccentColor(picker.value);
        }
        if (window.UserProfile && window.UserProfile.applyAccent) window.UserProfile.applyAccent();
        alert('Profile saved');
    });

    resetBtn.addEventListener('click', () => {
        if (!confirm('Reset your appearance to the default theme?')) return;
        // Global reset across avatar, accent, navbar/background prefs
        if (window.resetUserAppearanceDefaults) window.resetUserAppearanceDefaults();
        // Refresh local UI
        renderAvatarPreview(null);
        applyAvatarFrame('');
        picker.value = '#EFC554';
        preview.style.setProperty('--accent-color', picker.value);
        buildFrames({});
        // Refresh chip selections for navbar/background/site themes
        try { buildNavbarThemes(); } catch(_) {}
        // Background theme removed
        try { buildSiteThemes(); } catch(_) {}
    });

    // Admin panel wiring
    try {
        const isAdmin = (sessionStorage.getItem('isAdmin') === 'true') || (sessionStorage.getItem('currentUser') === 'admin@gmail.com');
        const panel = document.getElementById('adminPanel');
        if (panel) panel.style.display = isAdmin ? '' : 'none';
        if (isAdmin && panel) bindAdminPanelHandlers();
    } catch(_) {}

    window.addEventListener('auth:login', () => { 
        loadProfileUI(); 
        // re-evaluate admin panel and bind handlers if necessary
        try { 
            const panel = document.getElementById('adminPanel'); 
            if (panel) {
                const isAdmin = (sessionStorage.getItem('isAdmin') === 'true') || (sessionStorage.getItem('currentUser') === 'admin@gmail.com');
                panel.style.display = isAdmin ? '' : 'none';
                if (isAdmin) bindAdminPanelHandlers();
            }
        } catch(_) {} 
    });
    window.addEventListener('auth:logout', () => { loadProfileUI(); try { const panel = document.getElementById('adminPanel'); if (panel) panel.style.display = 'none'; } catch(_) {} });
});