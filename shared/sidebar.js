// Ensure global theme assets are loaded on every page that includes this script
(function ensureGlobalTheme(){
    try {
        var path = (window.location.pathname || '').replace(/\\/g, '/');
        var idx = path.lastIndexOf('/ray/');
        if (idx === -1) return; // Not under /ray/
        var baseRay = path.slice(0, idx + 5);
        var baseRoot = path.slice(0, idx + 1);

        if (!document.querySelector('link[data-theme-base]') && !document.querySelector('link[rel="stylesheet"][href$="theme.css"]')) {
            var link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = baseRoot + 'theme.css';
            link.setAttribute('data-theme-base', 'true');
            var head = document.head || document.getElementsByTagName('head')[0];
            if (head.firstChild) head.insertBefore(link, head.firstChild); else head.appendChild(link);
        }
        if (!(window.Theme && typeof window.Theme.applyTheme === 'function')) {
            var s = document.createElement('script');
            s.src = baseRay + 'shared/theme.js';
            s.async = false;
            s.onload = function(){
                try { if (window.Theme && window.Theme.applyTheme && window.Theme.getTheme) { window.Theme.applyTheme(window.Theme.getTheme()); } } catch(_){}
            };
            (document.head || document.body).appendChild(s);
        } else {
            try { window.Theme.applyTheme(window.Theme.getTheme()); } catch(_){}
        }
    } catch (e) { /* no-op */ }
})();

// Sidebar functionality for all pages
function showSidebar() {
    const sidebar = document.getElementById('user-sidebar');
    if (!sidebar) return;
    
    // Ensure a Profile button exists in sidebar options (insert dynamically so all pages get it)
    try {
        const options = sidebar.querySelector('.sidebar-options');
        if (options && !options.querySelector('#profile-btn')) {
            const profileLink = document.createElement('a');
            profileLink.href = '#';
            profileLink.className = 'sidebar-btn';
            profileLink.id = 'profile-btn';
            profileLink.innerHTML = '<i class="fa-solid fa-user"></i> Profile';
            // Insert at the top of options list
            options.insertBefore(profileLink, options.firstChild);
        }
        // Inject a Gacha button if missing
        if (options && !options.querySelector('#gacha-btn')) {
            const gachaLink = document.createElement('a');
            gachaLink.href = '#';
            gachaLink.className = 'sidebar-btn';
            gachaLink.id = 'gacha-btn';
            gachaLink.innerHTML = '<i class="fa-solid fa-dice"></i> Gacha';
            const after = options.querySelector('#profile-btn');
            if (after && after.nextSibling) options.insertBefore(gachaLink, after.nextSibling);
            else if (after) options.appendChild(gachaLink);
            else options.insertBefore(gachaLink, options.firstChild);
        }
    } catch (e) {}

    // Update username if available
    const currentUser = sessionStorage.getItem('currentUser');
    const usernameElement = document.getElementById('sidebar-username');
    if (usernameElement && currentUser) {
        usernameElement.textContent = currentUser;
    }
    // Show user's avatar if available
    try {
        const info = sidebar.querySelector('.user-info');
        if (info) {
            const u = (window.UserProfile && window.UserProfile.get && window.UserProfile.get()) ? window.UserProfile.get() : null;
            const avatarData = u ? u.avatar : null;
            const flags = u ? (u.flags || {}) : {};
            let iconEl = info.querySelector('.sidebar-user-icon');
            let imgEl = info.querySelector('img.sidebar-user-avatar');
            if (avatarData) {
                if (!imgEl) {
                    imgEl = document.createElement('img');
                    imgEl.className = 'sidebar-user-avatar';
                    imgEl.style.width = '48px';
                    imgEl.style.height = '48px';
                    imgEl.style.borderRadius = '50%';
                    imgEl.style.objectFit = 'cover';
                    // Replace icon with image
                    if (iconEl) iconEl.replaceWith(imgEl);
                    else info.insertBefore(imgEl, info.firstChild);
                }
                imgEl.src = avatarData;
                const shadowMap = {
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
                imgEl.style.boxShadow = shadowMap[flags.selectedFrame] || '';
            } else {
                // Render a ringed fallback chip when no avatar
                let chip = info.querySelector('.sidebar-user-chip');
                if (!chip) {
                    chip = document.createElement('span');
                    chip.className = 'sidebar-user-chip';
                    chip.style.display = 'inline-flex';
                    chip.style.alignItems = 'center';
                    chip.style.justifyContent = 'center';
                    chip.style.width = '48px';
                    chip.style.height = '48px';
                    chip.style.borderRadius = '50%';
                    chip.style.background = 'var(--alpha-white-05)';

                    const icon = document.createElement('i');
                    icon.className = 'fa-solid fa-circle-user';
                    icon.style.fontSize = '2.4rem';
                    icon.style.color = 'var(--color-white)';
                    icon.style.marginRight = '0';
                    chip.appendChild(icon);

                    if (imgEl) imgEl.replaceWith(chip);
                    else if (iconEl) iconEl.replaceWith(chip);
                    else info.insertBefore(chip, info.firstChild);
                }
                const shadowMap = {
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
                chip.style.boxShadow = shadowMap[flags.selectedFrame] || '';
            }
        }
    } catch(e) {}
    
    // Insert/Update level display under username
    try {
        const info = sidebar.querySelector('.user-info');
        if (info) {
            let levelEl = sidebar.querySelector('#sidebar-user-level');
            if (!levelEl) {
                levelEl = document.createElement('div');
                levelEl.id = 'sidebar-user-level';
                levelEl.style.color = 'var(--accent-color)';
                levelEl.style.fontWeight = '700';
                levelEl.style.marginTop = '6px';
                info.appendChild(levelEl);
            }
            if (window.Achievements && typeof window.Achievements.getLevelState === 'function') {
                const lv = window.Achievements.getLevelState();
                if (lv) {
                    levelEl.textContent = `Level ${lv.level} • ${lv.xpInLevel}/${lv.reqForLevel} XP`;
                    levelEl.style.display = '';
                } else {
                    levelEl.textContent = '';
                    levelEl.style.display = 'none';
                }
            }
        }
    } catch (e) {}

    sidebar.classList.add('show');
    document.body.classList.add('sidebar-open');
    
    // Remove Settings button if present (page removed)
    try {
        const toRemove = sidebar.querySelectorAll('#settings-btn');
        toRemove.forEach(el => el && el.remove());
    } catch(_) {}

    // Add event listeners
    const closeBtn = document.getElementById('close-sidebar');
    const profileBtn = document.getElementById('profile-btn');
    const gachaBtn = document.getElementById('gacha-btn');
    const achievementsBtn = document.getElementById('achievements-btn');
    const logoutBtn = document.getElementById('logout-btn');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', hideSidebar);
    }
    
    // Intentionally no Settings navigation; page removed
    if (profileBtn) {
        profileBtn.addEventListener('click', function(e) {
            e.preventDefault();
            hideSidebar();
            // Navigate with correct relative path. If not logged in, send to Login.
            const loggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
            const target = loggedIn ? 'profile/profile.html' : 'login_signup/login/login.html';
            const path = getCorrectPath(target);
            window.location.href = path;
        });
    }
    if (gachaBtn) {
        gachaBtn.addEventListener('click', function(e) {
            e.preventDefault();
            hideSidebar();
            const path = getCorrectPath('profile/gacha.html');
            window.location.href = path;
        });
    }
    
    if (achievementsBtn) {
        achievementsBtn.addEventListener('click', function(e) {
            e.preventDefault();
            hideSidebar();
            const path = getCorrectPath('profile/achivements.html');
            window.location.href = path;
        });
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            hideSidebar();
            // Trigger logout from auth.js
            if (window.handleLogout) {
                window.handleLogout();
            }
        });
    }
    
    // Close sidebar when clicking outside
    setTimeout(() => {
        document.addEventListener('click', closeSidebarOnClickOutside);
    }, 100);
}

// Make showSidebar globally accessible
window.showSidebar = showSidebar;

function hideSidebar() {
    const sidebar = document.getElementById('user-sidebar');
    if (sidebar) {
        sidebar.classList.remove('show');
        document.body.classList.remove('sidebar-open');
    }
    document.removeEventListener('click', closeSidebarOnClickOutside);
}

// Make hideSidebar globally accessible
window.hideSidebar = hideSidebar;

function closeSidebarOnClickOutside(event) {
    const sidebar = document.getElementById('user-sidebar');
    const profileIcon = document.querySelector('.fa-circle-user');
    
    if (sidebar && !sidebar.contains(event.target) && profileIcon && !profileIcon.contains(event.target)) {
        hideSidebar();
    }
}

// Helper function to get correct path based on current location
function getCorrectPath(relativePath) {
    // Build a robust absolute URL from the app root using full href and known base markers
    var href = (window.location.href || '').replace(/\\/g, '/');
    var marker = href.indexOf('/codebevan/') !== -1 ? '/codebevan/' : (href.indexOf('/coderay/') !== -1 ? '/coderay/' : null);
    if (!marker) return relativePath; // Fallback if not in a known app base
    var idx = href.indexOf(marker);
    var appBase = href.slice(0, idx + marker.length); // includes trailing '/'
    if (relativePath.startsWith('/')) relativePath = relativePath.slice(1);
    return appBase + relativePath;
}

// Initialize sidebar functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Make sure the sidebar functionality is available globally
    window.showSidebar = showSidebar;
    window.hideSidebar = hideSidebar;

    // Keep sidebar level text updated when XP or auth changes
    function updateSidebarLevel() {
        const sidebar = document.getElementById('user-sidebar');
        if (!sidebar) return;
        const levelEl = document.getElementById('sidebar-user-level');
        if (!levelEl) return;
        if (window.Achievements && typeof window.Achievements.getLevelState === 'function') {
            const lv = window.Achievements.getLevelState();
            if (lv) {
                levelEl.textContent = `Level ${lv.level} • ${lv.xpInLevel}/${lv.reqForLevel} XP`;
                levelEl.style.display = '';
            } else {
                levelEl.textContent = '';
                levelEl.style.display = 'none';
            }
        }
    }
    window.addEventListener('xp:award', updateSidebarLevel);
    window.addEventListener('auth:login', updateSidebarLevel);
    window.addEventListener('auth:logout', updateSidebarLevel);

    // Update avatar/ring live when profile changes
    function updateSidebarAvatar() {
        const sidebar = document.getElementById('user-sidebar');
        if (!sidebar) return;
        const info = sidebar.querySelector('.user-info');
        if (!info) return;
        try {
            const u = (window.UserProfile && window.UserProfile.get && window.UserProfile.get());
            const avatarData = u ? u.avatar : null;
            const flags = u ? (u.flags || {}) : {};
            let iconEl = info.querySelector('.sidebar-user-icon');
            let imgEl = info.querySelector('img.sidebar-user-avatar');
            if (avatarData) {
                if (!imgEl) {
                    imgEl = document.createElement('img');
                    imgEl.className = 'sidebar-user-avatar';
                    imgEl.style.width = '48px';
                    imgEl.style.height = '48px';
                    imgEl.style.borderRadius = '50%';
                    imgEl.style.objectFit = 'cover';
                    if (iconEl) iconEl.replaceWith(imgEl); else info.insertBefore(imgEl, info.firstChild);
                }
                imgEl.src = avatarData;
                const shadowMap = {
                    gold: '0 0 0 3px var(--accent-color), 0 0 12px color-mix(in srgb, var(--accent-color) 55%, transparent)',
                    pink: '0 0 0 3px #E5A0B9, 0 0 12px #E5A0B9AA',
                    blue: '0 0 0 3px #9DCFE0, 0 0 12px #9DCFE0AA',
                    purple: '0 0 0 3px #B9AED4, 0 0 12px #B9AED4AA'
                };
                imgEl.style.boxShadow = shadowMap[flags.selectedFrame] || '';
            } else {
                // Revert to icon
                if (!iconEl) {
                    const i = document.createElement('i');
                    i.className = 'fa-solid fa-circle-user sidebar-user-icon';
                    if (imgEl) imgEl.replaceWith(i); else info.insertBefore(i, info.firstChild);
                } else {
                    // Ensure icon visible if present
                    if (imgEl) imgEl.remove();
                }
            }
        } catch (_) {}
    }
    window.addEventListener('userprofile:change', updateSidebarAvatar);
    
    // Ensure mobile navbar toggle works on all pages
    try {
        const menu = document.getElementById('mobile-menu');
        const menuLinks = document.querySelector('.navbar__menu');
        if (menu && menuLinks && !menu.dataset.navToggleBound) {
            menu.addEventListener('click', function() {
                menu.classList.toggle('is-active');
                menuLinks.classList.toggle('active');
            });
            menu.dataset.navToggleBound = 'true';
        }
    } catch (_) {}
});