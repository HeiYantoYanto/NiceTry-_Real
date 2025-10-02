function renderAchievements() {
const grid = document.getElementById('achievementsGrid');
const xpSummary = document.getElementById('xpSummary');
grid.innerHTML = '';

const api = window.Achievements;
const defs = api ? api.getDefinitions() : [];
const state = api ? api.getState() : null;

if (!state) {
    const msg = document.createElement('div');
    msg.style.color = '#bdbdbd';
    msg.textContent = 'Please log in to track achievements.';
    grid.appendChild(msg);
    if (xpSummary) xpSummary.textContent = 'XP: 0 • Pages: 0 • Clicks: 0';
    return;
}

if (xpSummary) {
    xpSummary.textContent = `XP: ${state.xp || 0} • Pages: ${state.pagesCount || 0} • Clicks: ${state.clicks || 0}`;
}

defs.forEach(def => {
    const earned = !!(state.achievements && state.achievements[def.id]);
    const card = document.createElement('div');
    card.className = 'achievement-card';

    const icon = document.createElement('div');
    icon.className = 'achievement-icon';
    icon.innerHTML = `<i class="fa-solid ${def.icon}"></i>`;

    const title = document.createElement('div');
    title.className = 'achievement-title';
    title.textContent = def.title;

    const desc = document.createElement('div');
    desc.className = 'achievement-desc';
    desc.textContent = def.desc;

    const btn = document.createElement('button');
    btn.className = earned ? 'achievement-earned' : 'achievement-locked';
    btn.textContent = earned ? 'Earned' : 'Locked';
    btn.disabled = true;

    card.appendChild(icon);
    card.appendChild(title);
    card.appendChild(desc);
    card.appendChild(btn);
    grid.appendChild(card);
});
}

document.addEventListener('DOMContentLoaded', function() {
renderAchievements();
if (window.Achievements) {
    window.Achievements.onEarned(() => {
        // Re-render to update UI when new achievements are earned elsewhere
        renderAchievements();
    });
    const resetBtn = document.getElementById('resetAchievementsBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            const ok = confirm('Reset achievements, XP, pages, and clicks for this account?');
            if (!ok) return;
            window.Achievements.resetState();
            // Also reset diagnostic test activation for this user
            try {
                const email = (window.Achievements.getState && window.Achievements.getState()?.email) || sessionStorage.getItem('currentUser');
                if (email) {
                    localStorage.removeItem('diagnostic_done_' + email);
                }
            } catch (e) {}
            renderAchievements();
        });
    }
}
});