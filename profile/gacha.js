const inputValue = document.querySelector("input"); // This will be null since input was removed
const egg = document.querySelector(".egg");
const eggColor = document.querySelector(".egg-color");
const openEggColor = document.querySelector(".open-egg-color");
let lotteryList = [];

console.log('Gacha elements found:', {
  egg: !!egg,
  eggColor: !!eggColor, 
  openEggColor: !!openEggColor,
  switch: !!document.querySelector(".switch")
});

// Weighted reward system for gacha
function initializePrizePool() {
  // Define rewards with their weights (higher weight = more common)
  // Only these rewards are available per product spec
  lotteryList = {
    // Avatar Frames
    "Ocean Frame": 6,
    "Sunset Frame": 6,
    "Matrix Frame": 5,
    "Neon Frame": 3,

    // Navbar Themes (Dark is default and not a reward)
    "Light Theme": 6,
    "Ocean Theme": 5,
    "Sunset Theme": 5,
    "Matrix Theme": 4,
    "Neon Theme": 3,

    // Site Themes (separate reward from navbar themes)
    "Ocean Site Theme": 5,
    "Sunset Site Theme": 4,
    "Matrix Site Theme": 4,

    // Special Effects
    "RGB Cycle": 3,
    "Glowing Border": 3,

    // Accent color picker unlock
    "Accent Color Picker": 4
  };
}

// Weighted random selection function
function getWeightedRandomReward() {
  const rewards = Object.keys(lotteryList);
  const weights = Object.values(lotteryList);
  
  // Calculate total weight
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  
  // Generate random number between 0 and total weight
  let random = Math.random() * totalWeight;
  
  // Find the reward based on weighted probability
  for (let i = 0; i < rewards.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return rewards[i];
    }
  }
  
  // Fallback (shouldn't reach here)
  return rewards[0];
}

// Currency System
const ROLL_COST = 50;
let userCurrency = 0;
let isRolling = false; // guard to prevent multiple concurrent rolls

// Currency Management Functions
function getUserCurrency() {
  const email = sessionStorage.getItem('currentUser');
  if (!email) return 0;
  const stored = localStorage.getItem('coins_' + email);
  const parsed = parseInt(stored, 10);
  // If never initialized, default to 100; otherwise respect 0 or any valid number
  return Number.isNaN(parsed) ? 100 : parsed;
}

function setUserCurrency(amount) {
  const email = sessionStorage.getItem('currentUser');
  if (!email) return;
  const safe = Math.max(0, Math.floor(Number(amount) || 0));
  localStorage.setItem('coins_' + email, safe.toString());
  updateCurrencyDisplay();
}

function updateCurrencyDisplay() {
  userCurrency = getUserCurrency();
  const sidebarCurrency = document.getElementById('sidebar-currency');
  const gachaCurrency = document.getElementById('gacha-currency-amount');
  
  if (sidebarCurrency) sidebarCurrency.textContent = userCurrency;
  if (gachaCurrency) gachaCurrency.textContent = userCurrency;
}

// Award currency from leveling up (called from other parts of the site)
function awardCurrency(amount, reason = '') {
  const email = sessionStorage.getItem('currentUser');
  if (!email) return;
  
  const currentAmount = getUserCurrency();
  const newAmount = currentAmount + amount;
  setUserCurrency(newAmount);
  
  // Show notification if on gacha page
  if (window.location.pathname.includes('gacha.html')) {
    showCurrencyNotification(amount, reason);
  }
}

function showCurrencyNotification(amount, reason) {
  const notification = document.createElement('div');
  notification.className = 'currency-notification';
  notification.innerHTML = `
    <i class="fa-solid fa-coins"></i>
    +${amount} Coins ${reason ? 'from ' + reason : ''}
  `;
  
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(145deg, #6B53DE, #5a47b8);
    color: white;
    padding: 15px 20px;
    border-radius: 10px;
    box-shadow: 0 5px 15px rgba(107, 83, 222, 0.4);
    z-index: 10001;
    animation: slideIn 0.5s ease-out;
    font-family: 'Kumbh Sans', sans-serif;
    font-weight: bold;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.5s ease-in forwards';
    setTimeout(() => notification.remove(), 500);
  }, 3000);
}

// Help system for gacha chances
function showGachaHelp() {
  // Build dynamic help content from current prize pool
  initializePrizePool();
  const rewards = Object.entries(lotteryList);
  const totalWeight = rewards.reduce((sum, [, w]) => sum + w, 0);

  // Categorize rewards
  const categories = {
    '�️ Avatar Frames': (name) => / Frame$/.test(name),
    '�️ Navbar Themes': (name) => / Theme$/.test(name) && !/ Site Theme$/.test(name),
    '🖌️ Site Themes': (name) => / Site Theme$/.test(name),
    '⚡ Special Effects': (name) => name === 'RGB Cycle' || name === 'Glowing Border',
    '🎨 Accent Color Picker': (name) => name === 'Accent Color Picker'
  };

  // Rarity class heuristic by percent
  const rarityClass = (pct) => pct >= 10 ? 'common' : pct >= 5 ? 'uncommon' : pct >= 2 ? 'rare' : pct >= 0.5 ? 'legendary' : 'mythic';

  const helpModal = document.createElement('div');
  helpModal.className = 'gacha-help-modal';
  const content = document.createElement('div');
  content.className = 'help-content';

  const header = document.createElement('div');
  header.className = 'help-header';
  header.innerHTML = '<h3>🎰 Gacha Reward Chances</h3>';
  const close = document.createElement('button');
  close.className = 'close-help';
  close.textContent = '×';
  close.addEventListener('click', () => helpModal.remove());
  header.appendChild(close);
  content.appendChild(header);

  const body = document.createElement('div');
  body.className = 'help-body';

  Object.entries(categories).forEach(([title, matcher]) => {
    // Collect entries for this category
    const items = rewards
      .filter(([name]) => matcher(name))
      .map(([name, weight]) => {
        const pct = (weight / totalWeight) * 100;
        return { name, pct };
      })
      .sort((a, b) => b.pct - a.pct);
    if (!items.length) return;

    const section = document.createElement('div');
    section.className = 'chance-category';
    const h4 = document.createElement('h4');
    h4.textContent = title;
    section.appendChild(h4);

    items.forEach(({ name, pct }) => {
      const row = document.createElement('div');
      row.className = 'chance-item';
      const span = document.createElement('span');
      const cls = rarityClass(pct);
      span.className = cls;
      span.textContent = `${cls.charAt(0).toUpperCase()}${cls.slice(1)} (${pct.toFixed(1)}%)`;
      row.innerHTML = `${name} - `;
      row.appendChild(span);
      section.appendChild(row);
    });

    body.appendChild(section);
  });

  const footer = document.createElement('div');
  footer.className = 'help-footer';
  footer.innerHTML = `
    <p><strong>💡 Tip:</strong> Higher rarity items have lower chances but better rewards!</p>
    <p><strong>🎯 Strategy:</strong> Save up coins for multiple spins to increase your chances!</p>
  `;
  body.appendChild(footer);

  content.appendChild(body);
  helpModal.appendChild(content);
  document.body.appendChild(helpModal);
}

// Add help modal CSS dynamically
function addHelpModalStyles() {
  if (document.getElementById('gacha-help-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'gacha-help-styles';
  style.textContent = `
    .gacha-help-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      animation: fadeIn 0.3s ease-out;
    }
    
    .help-content {
      background: linear-gradient(145deg, #1a1a2e, #16213e);
      border-radius: 20px;
      max-width: 600px;
      max-height: 80vh;
      overflow-y: auto;
      border: 2px solid #6B53DE;
      box-shadow: 0 20px 60px rgba(107, 83, 222, 0.4);
    }
    
    .help-header {
      padding: 20px 25px 15px;
      border-bottom: 1px solid rgba(107, 83, 222, 0.3);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .help-header h3 {
      color: #fff;
      margin: 0;
      font-size: 1.5rem;
    }
    
    .close-help {
      background: none;
      border: none;
      color: #fff;
      font-size: 2rem;
      cursor: pointer;
      padding: 0;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: background 0.3s ease;
    }
    
    .close-help:hover {
      background: rgba(255, 255, 255, 0.1);
    }
    
    .help-body {
      padding: 20px 25px;
    }
    
    .chance-category {
      margin-bottom: 20px;
    }
    
    .chance-category h4 {
      color: #6B53DE;
      margin: 0 0 10px 0;
      font-size: 1.2rem;
    }
    
    .chance-item {
      color: #fff;
      padding: 5px 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .common { color: #95e1d3; }
    .uncommon { color: #4ecdc4; }
    .rare { color: #ffd93d; }
    .legendary { color: #ff6b6b; }
    .mythic { color: #e056fd; }
    
    .help-footer {
      margin-top: 20px;
      padding-top: 15px;
      border-top: 1px solid rgba(107, 83, 222, 0.3);
    }
    
    .help-footer p {
      color: #cfcfcf;
      margin: 8px 0;
      font-size: 0.95rem;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: scale(0.9); }
      to { opacity: 1; transform: scale(1); }
    }
    
    @media (max-width: 768px) {
      .help-content {
        margin: 20px;
        max-height: 90vh;
      }
      
      .help-header, .help-body {
        padding: 15px 20px;
      }
    }
  `;
  
  document.head.appendChild(style);
}

// Initialize help system
addHelpModalStyles();

// Weighted random selection function
function getWeightedRandomReward() {
  const rewards = Object.keys(lotteryList);
  const weights = Object.values(lotteryList);
  
  // Calculate total weight
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  
  // Generate random number between 0 and total weight
  let random = Math.random() * totalWeight;
  
  // Find the reward based on weighted probability
  for (let i = 0; i < rewards.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return rewards[i];
    }
  }
  
  // Fallback (shouldn't reach here)
  return rewards[0];
}

// Initialize currency display on page load
document.addEventListener('DOMContentLoaded', function() {
  initializePrizePool();
  updateCurrencyDisplay();
  
  // Update sidebar username if element exists
  const email = sessionStorage.getItem('currentUser');
  const sidebarUsername = document.getElementById('sidebar-username');
  if (email && sidebarUsername) {
    sidebarUsername.textContent = email.split('@')[0];
  }
});

function performGachaRoll() {
  if (isRolling) return; // prevent concurrent rolls
  const current = getUserCurrency();
  if (current < ROLL_COST) {
    // Not enough funds; show message and exit
    document.querySelector(".winner").innerHTML = `<span>Need ${ROLL_COST} Coins to Spin!</span>`;
    document.querySelector(".mask").classList.add("active");
    return;
  }

  console.log('Performing gacha roll. Currency before:', current);
  isRolling = true;

  // Deduct currency using fresh balance and clamp
  setUserCurrency(current - ROLL_COST);
  
  // Initialize prize pool if needed
  initializePrizePool();
  
  // Use weighted random selection instead of simple random
  const winner = getWeightedRandomReward();
  
  console.log('Won:', winner, 'with proper weighted chances');
  
  // Handle special Double Coins reward
  if (winner === "Double Coins") {
    const coinAmount = 20; // Double coins gives 20
    setUserCurrency(userCurrency + coinAmount);
    document.querySelector(".winner").innerHTML = `<span class="reward-rare">💰💰 <strong>DOUBLE COINS!</strong> 💰💰<br>Won ${coinAmount} Coins!<br><small class="rarity-text">Rare Reward (2%)</small></span>`;
  } else if (winner.includes("Coins")) {
    // Handle coin rewards
    const coinAmount = parseInt(winner.match(/\d+/)[0]);
    setUserCurrency(userCurrency + coinAmount);
    let rarityClass = "reward-common";
    let rarityText = "Common";
    
    if (coinAmount <= 10) { 
      rarityClass = "reward-common"; 
      rarityText = "Common"; 
    } else if (coinAmount <= 25) { 
      rarityClass = "reward-uncommon"; 
      rarityText = "Uncommon"; 
    } else { 
      rarityClass = "reward-rare"; 
      rarityText = "Rare"; 
    }
    
    document.querySelector(".winner").innerHTML = `<span class="${rarityClass}">💰 <strong>WON ${coinAmount} COINS!</strong> 💰<br><small class="rarity-text">${rarityText} Reward</small></span>`;
  } else if (winner.includes("XP Boost") || winner.includes("Study Guide") || winner.includes("Course Notes")) {
    // Common educational items
    document.querySelector(".winner").innerHTML = `<span class="reward-common">📚 <strong>${winner.toUpperCase()}</strong> 📚<br><small class="rarity-text">Common Item</small></span>`;
  } else if (winner.includes("Quiz Answers") || winner.includes("Assignment Hints")) {
    // Uncommon educational items  
    document.querySelector(".winner").innerHTML = `<span class="reward-uncommon">💡 <strong>${winner.toUpperCase()}</strong> 💡<br><small class="rarity-text">Uncommon Item</small></span>`;
  } else if (/ Frame$/.test(winner)) {
    // Avatar frame rewards
    const frameName = winner.replace(/ Frame$/, '');
    saveCustomization('frame', frameName);
    document.querySelector(".winner").innerHTML = `<span class="reward-uncommon">🖼️ <strong>UNLOCKED FRAME!</strong><br>${frameName}<br><small>Check your profile to apply it!</small></span>`;
  } else if (winner === "RGB Cycle" || winner === "Glowing Border") {
    // Special Effects rewards
    saveCustomization('specialEffect', winner);
    document.querySelector(".winner").innerHTML = `<span class="reward-rare">⚡ <strong>UNLOCKED SPECIAL EFFECT!</strong> ⚡<br>${winner}<br><small class="rarity-text">Rare Effect</small><br><small>Apply it in your profile.</small></span>`;
  } else if (/ Site Theme$/.test(winner)) {
    // Site Theme rewards only (Ocean/Sunset/Matrix)
    const base = winner.replace(/ Site Theme$/, '');
    if (["Ocean","Sunset","Matrix"].includes(base)) {
      saveCustomization('siteTheme', base);
    }
    document.querySelector(".winner").innerHTML = `<span class="reward-rare">🖌️ <strong>UNLOCKED SITE THEME!</strong><br>${base}<br><small>Apply it in your profile.</small></span>`;
  } else if (/ Theme$/.test(winner)) {
    // Navbar Theme rewards only
    saveCustomization('navbarTheme', winner);
    document.querySelector(".winner").innerHTML = `<span class="reward-rare">🎯 <strong>UNLOCKED NAVBAR THEME!</strong><br>${winner}<br><small>Check your profile to apply it!</small></span>`;
  } else if (winner === 'Accent Color Picker') {
    // Unlock accent color picker
    saveCustomization('accentPicker', 'unlocked');
    document.querySelector(".winner").innerHTML = `<span class="reward-uncommon">🎨 <strong>ACCENT PICKER UNLOCKED!</strong><br><small>Customize your accent color in Profile.</small></span>`;
  } else if (winner.includes("Support") || winner.includes("Tutorial") || winner.includes("Credit") || winner.includes("Materials")) {
    // Legendary educational rewards
    document.querySelector(".winner").innerHTML = `<span class="reward-legendary">⭐ <strong>LEGENDARY!</strong> ⭐<br>${winner}<br><small class="rarity-text">Legendary Reward</small><br><small>Amazing educational benefit!</small></span>`;
  } else if (winner.includes("Tutoring") || winner.includes("Premium") || winner.includes("VIP")) {
    // Mythic rewards
    document.querySelector(".winner").innerHTML = `<span class="reward-mythic">🔮 <strong>MYTHIC!</strong> 🔮<br>${winner}<br><small class="rarity-text">MYTHIC REWARD</small><br><small>Ultimate educational experience!</small></span>`;
  } else {
    // Fallback (shouldn't occur with limited pool)
    document.querySelector(".winner").innerHTML = `<span class="reward-common">🎁 <strong>${winner}</strong></span>`;
  }
  
  // Award XP based on the reward rarity
  let xpReward = 5; // Default XP
  let rarityBonus = "";
  
  if (winner.includes("Tutoring") || winner.includes("Premium") || winner.includes("VIP")) {
    xpReward = 50; // Mythic
    rarityBonus = " (Mythic Bonus!)";
  } else if (winner.includes("Support") || winner.includes("Tutorial") || winner.includes("Credit") || winner.includes("Materials")) {
    xpReward = 25; // Legendary
    rarityBonus = " (Legendary Bonus!)";
  } else if (/ Theme$/.test(winner) || / Site Theme$/.test(winner)) {
    xpReward = 15; // Rare
    rarityBonus = " (Rare Bonus!)";
  } else if (/ Frame$/.test(winner) || winner === 'Accent Color Picker') {
    xpReward = 10; // Uncommon-ish
    rarityBonus = " (Uncommon Bonus!)";
  } else if (winner === 'RGB Cycle' || winner === 'Glowing Border') {
    xpReward = 15; // Rare
    rarityBonus = " (Rare Bonus!)";
  } else {
    xpReward = 10; // Default to mid-tier since pool is cosmetics only
    rarityBonus = "";
  }
  
  // Award the XP
  try { 
    window.Achievements && window.Achievements.awardXP && window.Achievements.awardXP(xpReward, 'gacha_reward'); 
    // Track that a gacha pull occurred
    try { window.Achievements && window.Achievements.incrementGachaPulls && window.Achievements.incrementGachaPulls(); } catch(_) {}
    
    // Add XP notification to the winner display
    const currentContent = document.querySelector(".winner").innerHTML;
  document.querySelector(".winner").innerHTML = currentContent + `<br><div style="margin-top: 10px; color: var(--accent-color); font-size: 14px;">⭐ +${xpReward} XP${rarityBonus}</div>`;
  } catch(_) {}
  
  // Unlock a cosmetic frame and give XP
  try { unlockRandomCosmetic(); } catch(_) {}
  
  // Trigger machine animation
  document.querySelector(".mask").classList.add("active");
  
  console.log('Currency after roll:', getUserCurrency());
  // Release roll guard shortly after UI updates
  setTimeout(() => { isRolling = false; }, 800);
}

// Function to save customization rewards
function saveCustomization(type, item) {
  const email = sessionStorage.getItem('currentUser');
  if (!email) return;
  
  const storageKey = `customizations_${email}`;
  let customizations = JSON.parse(localStorage.getItem(storageKey)) || {};
  
  if (!customizations[type]) {
    customizations[type] = [];
  }
  
  if (!customizations[type].includes(item)) {
    customizations[type].push(item);
    localStorage.setItem(storageKey, JSON.stringify(customizations));
  }
}

function listRender() {
  // Function kept for compatibility but updated for weighted system
  const rewards = Object.keys(lotteryList);
  console.log('Current prize pool:', rewards);
  console.log('Reward weights:', lotteryList);
}

// Remove old event listeners for elements that no longer exist
// Note: inputValue and listBtn elements were removed with the sidebar

if (inputValue) {
  inputValue.addEventListener("keyup", function (e) {
    if (e.key === "Enter" && inputValue.value.trim() !== "") {
      console.log(inputValue.value);
      const lottery = inputValue.value.trim().split(" ");
      lotteryList = lotteryList.concat(lottery);
      inputValue.value = "";
      listRender();
    }
  });
}

// Removed duplicate egg click handler to avoid double-charging and race conditions

const colors = ["#E5A0B9", "#F3D478", "#9DCFE0", "#B9AED4"];
let currentColor = "#E5A0B9";

document.querySelector(".switch").addEventListener("click", function () {
  console.log('Switch clicked! Current currency:', userCurrency);
  
  // Check if user has enough coins
  if (getUserCurrency() < ROLL_COST) {
    // Show insufficient funds message
    document.querySelector(".winner").innerHTML = `<span>Need ${ROLL_COST} Coins to Spin!</span>`;
    document.querySelector(".mask").classList.add("active");
    return;
  }
  
  currentColor = colors[Math.floor(Math.random() * colors.length)];
  console.log('Setting egg colors to:', currentColor);
  
  if (eggColor) eggColor.style.fill = currentColor;
  if (openEggColor) openEggColor.style.fill = currentColor;
  
  this.classList.toggle("active");
  setTimeout(() => this.classList.remove("active"), 700);
  egg.classList.toggle("active");
  
  console.log('Egg should now be visible and clickable');
});

egg.addEventListener("click", function () {
  console.log('Egg clicked! Performing gacha roll...');
  this.classList.remove("active");
  // Perform the gacha roll when egg is clicked
  if (getUserCurrency() >= ROLL_COST) {
    performGachaRoll();
  } else {
    document.querySelector(".winner").innerHTML = `<span>Need ${ROLL_COST} Coins to Spin!</span>`;
    document.querySelector(".mask").classList.add("active");
  }
});

document.querySelector(".mask").addEventListener("click", function () {
  this.classList.toggle("active");
});

// --- Integration with site profile/achievements ---
// Record page view for the actual current path
try {
  if (window.Achievements && typeof window.Achievements.recordPageView === 'function') {
    window.Achievements.recordPageView(window.location.pathname);
  }
} catch(_) {}

// Enhanced cosmetic unlocking system using full prize pool
function unlockRandomCosmetic() {
  if (!window.UserProfile || !window.UserProfile.get) return;
  const prof = window.UserProfile.get();
  if (!prof) return;
  const flags = prof.flags || {};
  
  // Use the weighted random system to get a cosmetic reward
  initializePrizePool();
  const cosmetic = getWeightedRandomReward();
  
  // Generate a unique key for this cosmetic
  const key = `cosmetic_${cosmetic.replace(/\s+/g, '_').toLowerCase()}`;
  const box = document.querySelector('.winner');
  
  if (!flags[key]) {
    // Unlock new cosmetic
    window.UserProfile.setFlag && window.UserProfile.setFlag(key, true);
    
    // Determine XP reward based on rarity
    let xpReward = 5; // Default
    if (cosmetic.includes("Tutoring") || cosmetic.includes("Premium") || cosmetic.includes("VIP")) {
      xpReward = 50; // Mythic
    } else if (cosmetic.includes("Support") || cosmetic.includes("Tutorial") || cosmetic.includes("Credit") || cosmetic.includes("Materials")) {
      xpReward = 25; // Legendary
    } else if (cosmetic.includes("Theme") || cosmetic.includes("Gold") || cosmetic.includes("Purple")) {
      xpReward = 15; // Rare
    } else if (cosmetic.includes("Text Color") || cosmetic.includes("Quiz") || cosmetic.includes("Assignment")) {
      xpReward = 10; // Uncommon
    }
    
    // Award XP based on rarity
    try { 
      window.Achievements && window.Achievements.awardXP && window.Achievements.awardXP(xpReward, 'gacha_cosmetic'); 
    } catch(_) {}
    
    // Set as selected cosmetic if it's a frame or theme
    if (cosmetic.includes("Frame")) {
      const frameType = cosmetic.toLowerCase().replace(/\s+/g, '_');
      window.UserProfile.setFlag('selectedFrame', frameType);
    } else if (cosmetic.includes("Theme")) {
      const themeType = cosmetic.toLowerCase().replace(/\s+/g, '_');
      window.UserProfile.setFlag('selectedTheme', themeType);
    } else if (cosmetic.includes("Text Color")) {
      const colorType = cosmetic.toLowerCase().replace(/\s+/g, '_');
      window.UserProfile.setFlag('selectedTextColor', colorType);
    }
    
    console.log(`Unlocked cosmetic: ${cosmetic} (+${xpReward} XP)`);
  } else {
    console.log(`Already owned: ${cosmetic}`);
  }
}
