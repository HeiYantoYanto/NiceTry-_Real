document.addEventListener('DOMContentLoaded', () => {
    const img = document.querySelector('.main__image img');
    if(!img) return;

    // Part 1 configuration
    const PART1_TOTAL = 5000; // ms
    const PHASE1_END = 1500;  // 10 rps
    const PHASE2_START = 2850; // resume at 5 rps

    // Audio elements
    const audio1 = new Audio('oiia.mp3');
    const audio2 = new Audio('oiiav2.mp3');
    audio1.loop = false; // enforce stop at 5s
    audio2.loop = false;

    let part1Active = false;
    let completedPart1 = false;
    let resetTimeouts = [];
    let audio1StopTO = null;

    // Part 2 state
    let part2Active = false;
    let motionInterval = null;
    let skipBtn = null;
    let flashEl = null;
    let rafId = null;
    let dx = 0, dy = 0, angle = 0;

    function clearTimeouts(){
        resetTimeouts.forEach(t=>clearTimeout(t));
        resetTimeouts = [];
        if(audio1StopTO){ clearTimeout(audio1StopTO); audio1StopTO = null; }
    }

    function showPopup(msg, className='egg-popup', duration=1500){
        const existing = document.querySelector('.egg-popup');
        if(existing) existing.remove();
        const div = document.createElement('div');
        div.className = className;
        div.textContent = msg;
        document.body.appendChild(div);
        if(duration){
            setTimeout(()=>{ div.remove(); }, duration);
        }
    }

    function applySpin(className){
        img.classList.remove('spin-10rps','spin-5rps');
        if(className) img.classList.add(className);
    }

    function resetImagePosition(){
        img.style.position = '';
        img.style.left = '';
        img.style.top = '';
        img.style.transform = '';
        img.classList.remove('no-transition');
    }

    function resetPart1(){
        part1Active = false;
        applySpin(null);
        audio1.pause();
        audio1.currentTime = 0;
        clearTimeouts();
        img.classList.remove('no-transition');
    }

    function endPart1Success(){
        part1Active = false;
        applySpin(null);
        startPart2();
    }

    function startPart1(){
        if(part2Active) return;
        completedPart1 = false;
        resetPart1();
        part1Active = true;
        img.classList.add('no-transition');
        audio1.currentTime = 0;
        audio1.play().catch(()=>{});
        // Enforce audio1 stops at exactly 5s
        audio1StopTO = setTimeout(()=>{ audio1.pause(); audio1.currentTime = 0; }, PART1_TOTAL);
        // schedule phases
        applySpin('spin-10rps'); // 0 - 1.5s
        resetTimeouts.push(setTimeout(()=>{ if(part1Active){ applySpin(null); } }, PHASE1_END)); // stop spin
        resetTimeouts.push(setTimeout(()=>{ if(part1Active){ applySpin('spin-5rps'); } }, PHASE2_START)); // resume slow
        resetTimeouts.push(setTimeout(()=>{ if(part1Active){ endPart1Success(); } }, PART1_TOTAL)); // success at 5s
    }

    function createFlashOverlay(){
        flashEl = document.createElement('div');
        flashEl.className = 'flash-overlay';
        document.body.appendChild(flashEl);
        // Force reflow to start animation and reveal
        void flashEl.offsetWidth;
        flashEl.style.opacity = '1';
    }

    function removeFlashOverlay(){
        if(flashEl){ flashEl.remove(); flashEl=null; }
    }

    function startPart2(){
        if(part2Active) return;
        part2Active = true;
        // stop part1 audio if any
        audio1.pause();
        audio1.currentTime = 0;

        // center the image and remove transitions for crisp erratic motion
        img.classList.add('no-transition');
        img.style.position = 'fixed';
        img.style.left = '50%';
        img.style.top = '50%';
        img.style.transform = 'translate(-50%, -50%)';
        img.style.zIndex = '2001'; // Ensure image is above flash overlay

        createFlashOverlay();

        // rotation + erratic motion via JS to avoid transform conflicts with CSS animations
        angle = 0; dx = 0; dy = 0;
        // change offset rapidly
        motionInterval = setInterval(()=>{
            const maxOffset = 160; // px radius
            dx = (Math.random()*2-1)*maxOffset;
            dy = (Math.random()*2-1)*maxOffset;
        }, 60);

        // animate rotation and compose with current jitter offset
        const tick = () => {
            angle = (angle + 40) % 360; // fast rotation
            img.style.transform = `translate(-50%, -50%) translate(${dx}px, ${dy}px) rotate(${angle}deg)`;
            if(part2Active){ rafId = requestAnimationFrame(tick); }
        };
        rafId = requestAnimationFrame(tick);

        // start audio2
        audio2.currentTime = 0;
        audio2.play().catch(()=>{});
        audio2.addEventListener('ended', onPart2EndedOnce, { once: true });

        // show skip after 1s
        setTimeout(()=>{ if(part2Active) showSkip(); }, 1000);
    }

    function showSkip(){
        if(skipBtn) return;
        skipBtn = document.createElement('div');
        skipBtn.className = 'skip-btn';
        skipBtn.textContent = 'Skip';
        skipBtn.addEventListener('click', ()=>{ endPart2(); });
        document.body.appendChild(skipBtn);
    }

    function endPart2(){
        if(!part2Active) return;
        part2Active = false;
        // stop animation loops
        if(rafId){ cancelAnimationFrame(rafId); rafId = null; }
        if(motionInterval){ clearInterval(motionInterval); motionInterval = null; }
        // stop audio2
        audio2.pause();
        audio2.currentTime = 0;
        // cleanup UI
        if(skipBtn){ skipBtn.remove(); skipBtn=null; }
        removeFlashOverlay();
        // reset image
        applySpin(null);
        resetImagePosition();
        // allow replay
        completedPart1 = false;
    }

    function onPart2EndedOnce(){
        endPart2();
    }

    // Hover logic for part1
    img.addEventListener('mouseenter', ()=>{
        if(!completedPart1 && !part1Active){
            startPart1();
        }
    });

    img.addEventListener('mouseleave', ()=>{
        if(part1Active){
            showPopup('keep hovering');
            resetPart1();
        }
    });

    // Prevent image drag ghost
    img.addEventListener('dragstart', e=> e.preventDefault());
});