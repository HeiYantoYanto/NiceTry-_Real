// Rocket trigger logic with randomized interval (8–15s) and one-shot CSS animation
window.addEventListener('DOMContentLoaded', () => {
  const rocket = document.querySelector('.rocket');
  if (!rocket) return;

  let runCount = 0;
  let forceNextPath = 'path-spiral-loose'; // preview the loose spiral once

  function pickPathClass() {
    // Every 2–3 runs, do a special path (loop/arc/spirals)
    if (forceNextPath) {
      const p = forceNextPath; forceNextPath = '';
      return p;
    }
    if (runCount >= 2 && Math.random() < 0.5) {
      runCount = 0; // reset after special
      const specials = ['path-loop','path-arc','path-spiral','path-spiral-loose'];
      return specials[Math.floor(Math.random()*specials.length)];
    }
    // Mostly normal paths
    runCount++;
    return Math.random() < 0.5 ? 'path-normal' : 'path-normal-b';
  }

  function pickDurationClass() {
    const options = ['dur-5','dur-7','dur-8'];
    return options[Math.floor(Math.random() * options.length)];
  }

  function runRocketOnce() {
    const pathClass = pickPathClass();
    const durClass = pickDurationClass();

    // Reset classes and animation state to guarantee restart
    rocket.classList.remove('is-flying','path-normal','path-normal-b','path-arc','path-loop','dur-5','dur-7','dur-8');
    rocket.style.animation = 'none';
    rocket.style.offsetDistance = '0%';
    // Force reflow to flush the removal so animation can restart
    void rocket.offsetWidth;
    // Clear inline animation to allow class-based animation to take over
    rocket.style.animation = '';
    // Apply new path and duration and start
    rocket.classList.add(pathClass, 'is-flying', durClass);
  }

  function scheduleNext() {
    const delay = Math.floor(6000 + Math.random() * 3000); // 6000-9000ms (6-9 seconds)
    setTimeout(() => {
      runRocketOnce();
      scheduleNext();
    }, delay);
  }

  // First flight shortly after load
  setTimeout(runRocketOnce, 1000);
  scheduleNext();
});
