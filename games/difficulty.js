// Difficulty locking system for games tab
// Requires shared/auth.js for user level


document.addEventListener('DOMContentLoaded', function() {
    // Helper to get user level from shared/auth.js
    let userLevel = 1;
    if (window.Achievements && typeof window.Achievements.getLevelState === 'function') {
        const state = window.Achievements.getLevelState();
        if (state && state.level) userLevel = state.level;
    }

	// Difficulty requirements
	const requirements = {
		easy: 1,
		medium: 3,
		hard: 5
	};

	// Map difficulty to html id
	const diffMap = {
		easy: 'easy-difficulty',
		medium: 'medium-difficulty',
		hard: 'hard-difficulty'
	};

	Object.entries(requirements).forEach(([diff, reqLevel]) => {
		const el = document.getElementById(diffMap[diff]);
		if (!el) return;
		if (userLevel < reqLevel) {
			el.classList.add('locked');
			el.setAttribute('aria-disabled', 'true');
			el.title = `Unlocks at level ${reqLevel}`;
		} else {
			el.classList.remove('locked');
			el.removeAttribute('aria-disabled');
			el.title = '';
		}
	});

	// Click handler
	document.querySelectorAll('.difficulty-option').forEach(el => {
		el.addEventListener('click', function(e) {
			if (el.classList.contains('locked')) {
				e.preventDefault();
				// Optionally show a message
				alert(el.title || 'This difficulty is locked.');
				return false;
			}
			// Go to gamesnew.html
			window.location.href = 'gamesnew.html';
		});
	});
});