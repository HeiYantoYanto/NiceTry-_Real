
// Moon animation and drag logic
window.addEventListener('DOMContentLoaded', function() {
	const moon = document.getElementById('moon');
	if (!moon) return;
	let moonX = 0;
	let moonY = 80;
	let dragging = false;
	let offsetX = 0;
	let offsetY = 0;
	let autoMove = true;
	const moonWidth = 100;
	const moonHeight = 100;

	function setMoonPos(x, y) {
		moon.style.left = x + 'px';
		moon.style.top = y + 'px';
	}

	function animateMoon() {
		if (autoMove && !dragging) {
			moonX += 0.5;
			if (moonX > window.innerWidth) moonX = -moonWidth;
			setMoonPos(moonX, moonY);
		}
		requestAnimationFrame(animateMoon);
	}

	moon.addEventListener('mousedown', function(e) {
		dragging = true;
		autoMove = false;
		offsetX = e.clientX - moonX;
		offsetY = e.clientY - moonY;
	});
	document.addEventListener('mousemove', function(e) {
		if (dragging) {
			moonX = e.clientX - offsetX;
			moonY = e.clientY - offsetY;
			setMoonPos(moonX, moonY);
		}
	});
	document.addEventListener('mouseup', function() {
		if (dragging) {
			dragging = false;
			setTimeout(() => { autoMove = true; }, 2000);
		}
	});

	// Touch support
	moon.addEventListener('touchstart', function(e) {
		dragging = true;
		autoMove = false;
		const touch = e.touches[0];
		offsetX = touch.clientX - moonX;
		offsetY = touch.clientY - moonY;
	});
	document.addEventListener('touchmove', function(e) {
		if (dragging) {
			const touch = e.touches[0];
			moonX = touch.clientX - offsetX;
			moonY = touch.clientY - offsetY;
			setMoonPos(moonX, moonY);
		}
	});
	document.addEventListener('touchend', function() {
		if (dragging) {
			dragging = false;
			setTimeout(() => { autoMove = true; }, 2000);
		}
	});

	// Initial position and start animation
	setMoonPos(moonX, moonY);
	animateMoon();
});
