// Mouse click effect
document.addEventListener('click', function(e) {
	const effect = document.createElement('span');
	effect.className = 'click-effect';
	effect.style.left = e.clientX + 'px';
	effect.style.top = e.clientY + 'px';
	document.body.appendChild(effect);
	setTimeout(() => {
		effect.remove();
	}, 700);
});
