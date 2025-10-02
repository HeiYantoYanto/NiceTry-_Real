// Shared JS file for progress bar
// Ensure theme base is present so progress colors follow the current theme
(function ensureThemeLoaded(){
    try {
        var hasLink = document.querySelector('link[rel="stylesheet"][href$="theme.css"], link[data-theme-base]');
        if (!hasLink) {
            var base = document.createElement('link');
            base.rel = 'stylesheet';
            // Compute root path relative to /ray/
            var baseRoot = window.location.pathname.includes('/ray/') ? window.location.pathname.split('/ray/')[0] + '/ray/../' : '../';
            base.href = baseRoot + 'theme.css';
            base.setAttribute('data-theme-base', 'true');
            document.head.appendChild(base);
        }
        // Apply saved theme asap
        var THEME_KEY = 'site_theme';
        var theme = (window.Theme && window.Theme.getTheme) ? window.Theme.getTheme() : (function(){ try { return localStorage.getItem(THEME_KEY) || 'purple'; } catch(_) { return 'purple'; } })();
        if (theme) { document.documentElement.setAttribute('data-theme', theme); }
    } catch (_) {}
})();

document.addEventListener('DOMContentLoaded', function() {
    // Only show if logged in
    if (sessionStorage.getItem('isLoggedIn') === 'true') {
        var progressContainer = document.getElementById('progress-container');
        if (progressContainer) progressContainer.style.display = 'block';

        // Get current user
        const email = sessionStorage.getItem('currentUser');
        if (!email) return;

        // Load progress
        let progress = parseInt(localStorage.getItem('progress_' + email)) || 0;

        // Award 20 XP for opening a course (only once per user per course)
        const courseXPKey = 'xp_course_' + email + '_' + window.location.pathname;
        if (!localStorage.getItem(courseXPKey)) {
            if (window.Achievements && typeof window.Achievements.awardXP === 'function') {
                window.Achievements.awardXP(20, 'course-open');
            }
            localStorage.setItem(courseXPKey, '1');
        }

        // (Optional) Keep old progress logic if needed
        // Increase by 4 for opening a course (only once per session per course)
        const courseKey = 'visited_' + email + '_' + window.location.pathname;
        if (!sessionStorage.getItem(courseKey)) {
            progress += 4;
            if (progress > 100) progress = 100;
            localStorage.setItem('progress_' + email, progress);
            sessionStorage.setItem('showProgressGain', '4');
            sessionStorage.setItem(courseKey, 'true');
        }

        // Update progress bar
        var progressBar = document.getElementById('progress-bar');
        var progressValue = document.getElementById('progress-value');
        if (progressBar) progressBar.value = progress;
        // Fallback: if progress styling not applied, render a custom themed bar
        try {
            var hasCustom = document.getElementById('custom-progress');
            if (!hasCustom && progressBar && getComputedStyle(progressBar).color === 'rgb(0, 0, 0)') {
                var wrapper = document.getElementById('progress-bar-bg') || progressBar.parentElement;
                var div = document.createElement('div');
                div.id = 'custom-progress';
                var fill = document.createElement('div');
                fill.className = 'fill';
                div.appendChild(fill);
                wrapper.insertBefore(div, progressBar);
                progressBar.style.display = 'none';
            }
            var fillEl = document.querySelector('#custom-progress .fill');
            if (fillEl) {
                fillEl.style.width = Math.max(0, Math.min(100, progress)) + '%';
            }
        } catch(_) {}
        if (progressValue) progressValue.textContent = progress + '%';
    }
});

// Helper: Call this when a quiz is passed to award 50 XP (only once per user per quiz page)
function awardQuizPassXP() {
    const email = sessionStorage.getItem('currentUser');
    console.log('[awardQuizPassXP] called, email:', email);
    if (!email) {
        console.warn('[awardQuizPassXP] No user logged in.');
        return;
    }
    const quizXPKey = 'xp_quiz_' + email + '_' + window.location.pathname;
    if (!localStorage.getItem(quizXPKey)) {
        if (window.Achievements && typeof window.Achievements.awardXP === 'function') {
            console.log('[awardQuizPassXP] Awarding 50 XP for quiz pass.');
            window.Achievements.awardXP(50, 'quiz-pass');
            try {
                // Also record quiz result for achievements tracker
                if (typeof window.Achievements.recordQuizResult === 'function') {
                    const quizId = window.location.pathname; // use path as identifier
                    window.Achievements.recordQuizResult(quizId, true);
                }
            } catch(_) {}
        } else {
            console.warn('[awardQuizPassXP] window.Achievements.awardXP not available.');
        }
        localStorage.setItem(quizXPKey, '1');
    } else {
        console.log('[awardQuizPassXP] XP already awarded for this quiz and user.');
    }
}
window.awardQuizPassXP = awardQuizPassXP;
