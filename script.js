// Authors: Ivy & Aneek

const game = {
  boba: 0,
  perSecond: 0,
  clickMultiplier: 1,
  mixerMultiplier: 1,
  machineMultiplier: 1,
  upgrades: {
    spoon: { cost: 10, owned: 0, perSecond: 1, name: "Spoon" },
    mixer: { cost: 100, owned: 0, perSecond: 5, name: "Mixer" },
    machine: { cost: 10000, owned: 0, perSecond: 25, name: "Machine" },
    robot: { cost: 1000000, owned: 0, perSecond: 100, name: "Robot" },
    clickBoost: { cost: 50, owned: 0, name: "Click Boost" },
    clickMultiply: { cost: 500, owned: 0, name: "Click Multiplier" },
    mixerBoost: { cost: 1000, owned: 0, name: "Mixer Boost" },
    machineBoost: { cost: 100000, owned: 0, name: "Machine Boost" }
  },
  achievementsUnlocked: {}, 
  lastBobaMilestone: 0,


  loadGame() {
    const saved = localStorage.getItem("bobaGame");
    if (saved) {
      const data = JSON.parse(saved);

      this.boba = data.boba || 0;

      
      if (data.upgrades) {
        for (let upgrade in this.upgrades) {
          if (
            data.upgrades[upgrade] &&
            typeof data.upgrades[upgrade].owned === "number"
          ) {
            this.upgrades[upgrade].owned = data.upgrades[upgrade].owned;
          }
        }
      }

      
      if (data.clickMultiplier) this.clickMultiplier = data.clickMultiplier;
      if (data.mixerMultiplier) this.mixerMultiplier = data.mixerMultiplier;
      if (data.machineMultiplier) this.machineMultiplier = data.machineMultiplier;

     
      this.achievementsUnlocked = data.achievementsUnlocked || {};
      this.lastBobaMilestone = data.lastBobaMilestone ?? 1;

      this.updatePerSecond();
    }
  },

  saveGame() {
    localStorage.setItem(
      "bobaGame",
      JSON.stringify({
        boba: this.boba,
        upgrades: this.upgrades,
        clickMultiplier: this.clickMultiplier,
        mixerMultiplier: this.mixerMultiplier,
        machineMultiplier: this.machineMultiplier,
        achievementsUnlocked: this.achievementsUnlocked,
        lastBobaMilestone: this.lastBobaMilestone
      })
    );
  },

  updatePerSecond() {
    this.perSecond = 0;

    for (let upgrade in this.upgrades) {
      const u = this.upgrades[upgrade];
      let perSecond = u.owned * (u.perSecond || 0);

      
      if (upgrade === "mixer") perSecond *= this.mixerMultiplier;
      if (upgrade === "machine") perSecond *= this.machineMultiplier;

      this.perSecond += perSecond;
    }

    updateAnimationSpeed();
  },

  addBoba(amount = null) {
   
    if (amount !== null) {
      this.boba += amount;
    } else {

      let clickValue = 1;

      
      clickValue += this.upgrades.clickBoost.owned;

      clickValue *= this.clickMultiplier;

      this.boba += clickValue;
    }

    checkAchievements();
    this.saveGame();
    this.updateDisplay();
  },

  buyUpgrade(upgradeName) {
    const upgrade = this.upgrades[upgradeName];

    // If the upgrade is a one-time purchase and already owned, do nothing
    if (
      (upgradeName === "clickBoost" ||
        upgradeName === "clickMultiply" ||
        upgradeName === "mixerBoost" ||
        upgradeName === "machineBoost") &&
      upgrade.owned >= 1
    ) {
      alert(`${upgrade.name} can only be purchased once!`);
      return;
    }

    if (this.boba >= upgrade.cost) {
      this.boba -= upgrade.cost;
      upgrade.owned += 1;

    
      if (upgradeName === "clickMultiply") this.clickMultiplier *= 2; 
      if (upgradeName === "mixerBoost") this.mixerMultiplier *= 2;
      if (upgradeName === "machineBoost") this.machineMultiplier *= 2;

      this.updatePerSecond();
      checkAchievements();
      this.saveGame();
      this.updateDisplay();
    } else {
      alert(`Need ${upgrade.cost - this.boba} more boba!`);
    }
  },

  updateDisplay() {
    
    document.getElementById("bobaCount").textContent = this.boba.toLocaleString();
    document.getElementById("perSecond").textContent = this.perSecond.toLocaleString();

   
    for (let upgrade in this.upgrades) {
      const u = this.upgrades[upgrade];
      const btn = document.getElementById(
        `buy${upgrade.charAt(0).toUpperCase() + upgrade.slice(1)}`
      );
      if (btn) {
        btn.innerHTML = `${u.name}<br>Cost: ${u.cost}<br>Owned: ${u.owned}`;

        
        if (
          (upgrade === "clickBoost" ||
            upgrade === "clickMultiply" ||
            upgrade === "mixerBoost" ||
            upgrade === "machineBoost") &&
          u.owned >= 1
        ) {
          btn.style.display = "none";
        } else {
          btn.style.display = "block";
          btn.disabled = this.boba < u.cost;
        }
      }
    }

   
    const img = document.getElementById("clickImg");
    if (!img) return;

    if (this.perSecond > 0) {
      if (!img.src.includes(".gif")) {
        img.src = "imgs/boba-drinking-1.gif";
      }
    } else {
      if (!img.src.includes(".png")) {
        img.src = "imgs/boba-drinking-1.png";
      }
    }
  }
};

const ACHIEVEMENTS = [
  { id: "first_100", title: "Pearl Beginner", desc: "Reach 100 boba.", threshold: 100, icon: "🧋" },
  { id: "first_10000", title: "Boba Hoarder", desc: "Reach 10,000 boba.", threshold: 10000, icon: "💎" },
  { id: "first_1m", title: "Boba Millionaire", desc: "Reach 1,000,000 boba.", threshold: 1000000, icon: "🏆" },
  { id: "double", dynamic: true, title: "Double Trouble!", desc: "Double your boba total!", icon: "⚡" }
];


let animationInterval = null;

function updateAnimationSpeed() {
  const img = document.getElementById("clickImg");
  if (!img) return;

  
  if (animationInterval) {
    clearInterval(animationInterval);
    animationInterval = null;
  }

  if (game.perSecond > 0) {
    const baseSpeed = 2000;

    
    const speedMultiplier = 1 - game.perSecond * 0.001;
    const newSpeed = Math.max(300, baseSpeed * speedMultiplier);

    animationInterval = setInterval(() => {
      img.src = "imgs/boba-drinking-1.gif";
    }, newSpeed);
  } else {
    img.src = "imgs/boba-drinking-1.png";
  }
}


document.addEventListener("DOMContentLoaded", function () {
  setupUI();

  
  document.getElementById("buySpoon").addEventListener("click", () => game.buyUpgrade("spoon"));
  document.getElementById("buyMixer").addEventListener("click", () => game.buyUpgrade("mixer"));
  document.getElementById("buyMachine").addEventListener("click", () => game.buyUpgrade("machine"));
  document.getElementById("buyRobot").addEventListener("click", () => game.buyUpgrade("robot"));
  document.getElementById("buyClickBoost").addEventListener("click", () => game.buyUpgrade("clickBoost"));
  document.getElementById("buyClickMultiply").addEventListener("click", () => game.buyUpgrade("clickMultiply"));
  document.getElementById("buyMixerBoost").addEventListener("click", () => game.buyUpgrade("mixerBoost"));
  document.getElementById("buyMachineBoost").addEventListener("click", () => game.buyUpgrade("machineBoost"));

  
  game.loadGame();
  game.updateDisplay();
  renderAchievementBadges();
  checkAchievements();

  
  setInterval(() => {
    if (game.perSecond > 0) {
      game.addBoba(game.perSecond);
    }
  }, 1000);
});

function setupUI() {
  const clickImg = document.getElementById("clickImg");
  if (!clickImg) return;

  
  clickImg.addEventListener("click", function () {
    game.addBoba(1);

    
    this.style.transform = "scale(0.95)";
    setTimeout(() => (this.style.transform = "scale(1)"), 100);

    
    this.src = "imgs/boba-drinking-1.gif";
    setTimeout(() => {
      if (game.perSecond === 0) {
        this.src = "imgs/boba-drinking-1.png";
      }
    }, 500);
  });
}


function showHelp() {
  alert(
`🧋 BOBA SHAKER HELP 🧋

HOW TO PLAY:
• Click the boba image to earn boba
• Buy upgrades to earn boba per second
• Buy boosts to double specific production
• As your boba per second increases, the animation gets faster

UPGRADES:
• Spoon: +1 boba/sec
• Mixer: +5 boba/sec (affected by Mixer Boost)
• Machine: +25 boba/sec (affected by Machine Boost)
• Robot: +100 boba/sec

BOOSTS:
• Click Boost: +1 click power
• Click Multiplier: doubles click power (one-time)
• Mixer Boost: doubles mixer output (one-time)
• Machine Boost: doubles machine output (one-time)

ACHIEVEMENTS:
• Pearl Beginner: reach 100 boba
• Boba Hoarder: reach 10,000 boba
• Boba Millionaire: reach 1,000,000 boba
• Double Trouble: reach 2, 4, 8, 16, 32, ... boba (doubling milestones)`
  );
}
  
  const helpBtn = document.getElementById("helpButton");
  if (helpBtn) {
    helpBtn.addEventListener("click", showHelp);
  }

function showAchievementToast({ title, desc, icon }) {
  const wrap = document.getElementById("achievementToasts");
  if (!wrap) return;

  const toast = document.createElement("div");
  toast.className = "achievement-toast";
  toast.innerHTML = `
    <div class="toast-title">${icon || "✨"} ${title}</div>
    <div class="toast-desc">${desc}</div>
    <button class="toast-close" aria-label="Close">×</button>
  `;

  const closeBtn = toast.querySelector(".toast-close");
  closeBtn.addEventListener("click", () => dismissToast(toast));

  wrap.appendChild(toast);

  
  setTimeout(() => dismissToast(toast), 3500);
}

function dismissToast(toastEl) {
  if (!toastEl || toastEl.classList.contains("fade-out")) return;
  toastEl.classList.add("fade-out");
  setTimeout(() => toastEl.remove(), 300);
}

function renderAchievementBadges() {
  const badgeWrap = document.getElementById("achievementBadges");
  if (!badgeWrap) return;

  badgeWrap.innerHTML = "";

  const unlockedIds = Object.keys(game.achievementsUnlocked || {}).filter(
    (id) => game.achievementsUnlocked[id]
  );

  if (unlockedIds.length === 0) {
    badgeWrap.innerHTML = `
      <div style="grid-column: 1 / -1; text-align:center; opacity:0.85; font-size: 12px;">
        No achievements yet — keep clicking 🧋
      </div>`;
    return;
  }

  for (const id of unlockedIds) {
    const meta = getAchievementMeta(id);
    if (!meta) continue;

    const badge = document.createElement("div");
    badge.className = "badge";
    badge.innerHTML = `
      <div class="badge-icon">${meta.icon || "✨"}</div>
      <div class="badge-name">${meta.title}</div>
      <div class="badge-sub">${meta.badgeSub || ""}</div>
    `;

    badgeWrap.appendChild(badge);
  }
}

function getAchievementMeta(id) {
  
  const staticMap = {
    first_100: { title: "Pearl Beginner", icon: "🧋", badgeSub: "100 boba" },
    first_10000: { title: "Boba Hoarder", icon: "💎", badgeSub: "10k boba" },
    first_1m: { title: "Boba Millionaire", icon: "🏆", badgeSub: "1M boba" }
  };

  if (staticMap[id]) return staticMap[id];

  
  if (id.startsWith("double_")) {
    const val = id.split("_")[1];
    return {
      title: "Double Trouble!",
      icon: "⚡",
      badgeSub: `Reached ${Number(val).toLocaleString()}`
    };
  }

  return null;
}

function unlockAchievement(id, toastInfo) {
  if (!game.achievementsUnlocked) game.achievementsUnlocked = {};
  if (game.achievementsUnlocked[id]) return;

  game.achievementsUnlocked[id] = true;
  game.saveGame();
  showAchievementToast(toastInfo);
  renderAchievementBadges();
}


function checkAchievements() {
  const b = game.boba;

  
  if (b >= 100)
    unlockAchievement("first_100", {
      title: "Pearl Beginner",
      desc: "You reached 100 boba!",
      icon: "🧋"
    });
  if (b >= 10000)
    unlockAchievement("first_10000", {
      title: "Boba Hoarder",
      desc: "You reached 10,000 boba!",
      icon: "💎"
    });
  if (b >= 1000000)
    unlockAchievement("first_1m", {
      title: "Boba Millionaire",
      desc: "You reached 1,000,000 boba!",
      icon: "🏆"
    });

  
  if (!game.lastBobaMilestone || game.lastBobaMilestone < 1)
    game.lastBobaMilestone = 1;

  while (b >= game.lastBobaMilestone * 2) {
    game.lastBobaMilestone *= 2;
    const id = `double_${game.lastBobaMilestone}`;
    unlockAchievement(id, {
      title: "Double Trouble!",
      desc: `You doubled your boba to ${game.lastBobaMilestone.toLocaleString()}!`,
      icon: "⚡"
    });
  }

  game.saveGame();
}
