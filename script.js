// Authors: Ivy & Aneek

const game = {
  boba: 0,
  perSecond: 0,
  clickMultiplier: 1, 
  mixerMultiplier: 1,   
  upgrades: {
    spoon: { cost: 10, owned: 0, perSecond: 1, name: "Spoon" },
    mixer: { cost: 100, owned: 0, perSecond: 5, name: "Mixer" },
    machine: { cost: 10000, owned: 0, perSecond: 25, name: "Machine" },
    robot: { cost: 1000000, owned: 0, perSecond: 100, name: "Robot" },
    clickBoost: { cost: 50, owned: 0, name: "Click Boost" },    
    mixerBoost: { cost: 1000, owned: 0, name: "Mixer Boost" },
    machineBoost: { cost: 100000, owned: 0, name: "Machine Boost" } 
  },

  // ------------------------------
  // Load saved data but keep default costs/names
  // ------------------------------
  loadGame() {
    const saved = localStorage.getItem("bobaGame");
    if (saved) {
      const data = JSON.parse(saved);

      this.boba = data.boba || 0;

      // Only restore 'owned' and multipliers, keep costs and names
      if (data.upgrades) {
        for (let upgrade in this.upgrades) {
          if (data.upgrades[upgrade] && typeof data.upgrades[upgrade].owned === "number") {
            this.upgrades[upgrade].owned = data.upgrades[upgrade].owned;
          }
        }
      }

      // Restore multipliers if saved
      if (data.clickMultiplier) this.clickMultiplier = data.clickMultiplier;
      if (data.mixerMultiplier) this.mixerMultiplier = data.mixerMultiplier;

      this.updatePerSecond();
    }
  },

  saveGame() {
    localStorage.setItem("bobaGame", JSON.stringify({
      boba: this.boba,
      upgrades: this.upgrades,
      clickMultiplier: this.clickMultiplier,
      mixerMultiplier: this.mixerMultiplier
    }));
  },

  updatePerSecond() {
    this.perSecond = 0;

    for (let upgrade in this.upgrades) {
      const u = this.upgrades[upgrade];
      let perSecond = u.owned * (u.perSecond || 0);

      // Apply mixer multiplier only to mixer
      if (upgrade === "mixer") perSecond *= this.mixerMultiplier;

      this.perSecond += perSecond;
    }

    updateAnimationSpeed();
  },

  addBoba(amount = 1) {
    // Apply click multiplier
    amount *= this.clickMultiplier;
    this.boba += amount;

    this.saveGame();
    this.updateDisplay();
  },

  buyUpgrade(upgradeName) {
    const upgrade = this.upgrades[upgradeName];

    // If the upgrade is a one-time purchase and already owned, do nothing
    if ((upgradeName === "clickBoost" || upgradeName === "mixerBoost") && upgrade.owned >= 1) {
        alert(`${upgrade.name} can only be purchased once!`);
        return;
    }

    if (this.boba >= upgrade.cost) {
        this.boba -= upgrade.cost;
        upgrade.owned += 1;

        // Special effects for new upgrades
        if (upgradeName === "clickBoost") this.clickMultiplier *= 2;
        if (upgradeName === "mixerBoost") this.mixerMultiplier *= 2;
        if (upgradeName === "machineBoost") this.machineMultiplier *= 2;

        this.updatePerSecond();
        this.saveGame();
        this.updateDisplay();
    } else {
        alert(`Need ${upgrade.cost - this.boba} more boba!`);
    }
  },

  updateDisplay() {
    // Update numbers
    document.getElementById("bobaCount").textContent = this.boba.toLocaleString();
    document.getElementById("perSecond").textContent = this.perSecond.toLocaleString();

    // Update store buttons
    for (let upgrade in this.upgrades) {
        const u = this.upgrades[upgrade];
        const btn = document.getElementById(`buy${upgrade.charAt(0).toUpperCase() + upgrade.slice(1)}`);
        if (btn) {
            btn.innerHTML = `${u.name}<br>Cost: ${u.cost}<br>Owned: ${u.owned}`;

            // Hide button for one-time upgrades if already owned
            if ((upgrade === "clickBoost" || upgrade === "mixerBoost" || upgrade === "machineBoost") && u.owned >= 1) {
                btn.style.display = "none";
            } else {
                btn.style.display = "block";
                btn.disabled = this.boba < u.cost;
            }
        }
    }

    // Swap image for idle vs producing
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

// ------------------------------
// 🔥 Animation Speed Controller
// ------------------------------
let animationInterval = null;

function updateAnimationSpeed() {
  const img = document.getElementById("clickImg");
  if (!img) return;

  // Always clear previous interval
  if (animationInterval) {
    clearInterval(animationInterval);
    animationInterval = null;
  }

  if (game.perSecond > 0) {
    const baseSpeed = 2000;

    // 0.1% faster per 1 perSecond
    const speedMultiplier = 1 - (game.perSecond * 0.001);
    const newSpeed = Math.max(300, baseSpeed * speedMultiplier);

    animationInterval = setInterval(() => {
      img.src = "imgs/boba-drinking-1.gif";
    }, newSpeed);
  } else {
    img.src = "imgs/boba-drinking-1.png";
  }
}

// ------------------------------
// UI Setup
// ------------------------------
document.addEventListener("DOMContentLoaded", function () {
  setupUI();

  // Store buttons
  document.getElementById("buySpoon").addEventListener("click", () => game.buyUpgrade("spoon"));
  document.getElementById("buyMixer").addEventListener("click", () => game.buyUpgrade("mixer"));
  document.getElementById("buyMachine").addEventListener("click", () => game.buyUpgrade("machine"));
  document.getElementById("buyRobot").addEventListener("click", () => game.buyUpgrade("robot"));
  document.getElementById("buyClickBoost").addEventListener("click", () => game.buyUpgrade("clickBoost"));
  document.getElementById("buyMixerBoost").addEventListener("click", () => game.buyUpgrade("mixerBoost"));
  document.getElementById("buyMachineBoost").addEventListener("click", () => game.buyUpgrade("machineBoost"));

  // Load previous save
  game.loadGame();
  game.updateDisplay();

  // Add passive Boba per second
  setInterval(() => {
    if (game.perSecond > 0) {
      game.addBoba(game.perSecond);
    }
  }, 1000);
});

function setupUI() {
  const clickImg = document.getElementById("clickImg");
  if (!clickImg) return;

  // Clicking GIF gives Boba
  clickImg.addEventListener("click", function () {
    game.addBoba(1);

    // Press animation
    this.style.transform = "scale(0.95)";
    setTimeout(() => this.style.transform = "scale(1)", 100);

    // Swap to GIF briefly
    this.src = "imgs/boba-drinking-1.gif";
    setTimeout(() => {
      if (game.perSecond === 0) {
        this.src = "imgs/boba-drinking-1.png";
      }
    }, 500);
  });
}
