

const game = {
  boba: 0,
  perSecond: 0,
  
  upgrades: {
    spoon: { cost: 10, owned: 0, perSecond: 1, name: "Spoon" },
    mixer: { cost: 100, owned: 0, perSecond: 5, name: "Mixer" },
    machine: { cost: 1000, owned: 0, perSecond: 25, name: "Machine" },
    robot: { cost: 10000, owned: 0, perSecond: 100, name: "Robot" }
  },

  loadGame() {
    const saved = localStorage.getItem("bobaGame");
    if (saved) {
      const data = JSON.parse(saved);
      this.boba = data.boba || 0;
      this.upgrades = data.upgrades || this.upgrades;
      this.updatePerSecond();
    }
  },

  saveGame() {
    localStorage.setItem("bobaGame", JSON.stringify({
      boba: this.boba,
      upgrades: this.upgrades
    }));
  },

  updatePerSecond() {
    this.perSecond = 0;
    for (let upgrade in this.upgrades) {
      this.perSecond += this.upgrades[upgrade].owned * this.upgrades[upgrade].perSecond;
    }
  },

  addBoba(amount = 1) {
    this.boba += amount;
    this.saveGame();
    this.updateDisplay();
  },

  buyUpgrade(upgradeName) {
    const upgrade = this.upgrades[upgradeName];
    if (this.boba >= upgrade.cost) {
      this.boba -= upgrade.cost;
      upgrade.owned += 1;
      this.updatePerSecond();
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
      const btn = document.getElementById(`buy${upgrade.charAt(0).toUpperCase() + upgrade.slice(1)}`);
      if (btn) {
        btn.innerHTML = `${u.name}<br>Cost: ${u.cost}<br>Owned: ${u.owned}`;
        btn.disabled = this.boba < u.cost;
      }
    }
  }
};


document.addEventListener("DOMContentLoaded", function() {
  game.loadGame();
  setupUI();
  game.updateDisplay();

 
  setInterval(() => {
    if (game.perSecond > 0) {
      game.addBoba(game.perSecond);
    }
  }, 1000);
});

function setupUI() {
 
  const leftSection = document.querySelector(".left");
  const centerSection = document.querySelector(".center");
  const rightSection = document.querySelector(".right");

 
  leftSection.innerHTML = `
    <div style="text-align: center; position: relative;">
      <button id="clickBtn" style="font-size: 100px; border: none; background: none; cursor: pointer; transition: transform 0.1s; margin-bottom: 10px;">🧋</button>
      <img id="clickImg" src="imgs/boba-drinking-1.png" style="position: relative; width: 150px; height: 150px; pointer-events: none; display: block; margin: 0 auto;">
      <div style="margin-top: 15px; font-size: 24px; font-weight: bold;" id="bobaCount">0</div>
      <div style="font-size: 14px; opacity: 0.8;">Boba Pearls</div>
    </div>
  `;

 
  centerSection.innerHTML = `
    <div style="text-align: center; width: 100%;">
      <div style="font-size: 12px; opacity: 0.9; margin-bottom: 15px;">STATS</div>
      <div style="font-size: 32px; font-weight: bold; margin-bottom: 20px;" id="perSecond">0</div>
      <div style="font-size: 14px; opacity: 0.8;">Per Second</div>
    </div>
  `;


  rightSection.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 10px; width: 100%;">
      <div style="font-size: 12px; opacity: 0.9; text-align: center; margin-bottom: 5px;">STORE</div>
      <button id="buySpoon" onclick="game.buyUpgrade('spoon')" style="padding: 10px; font-size: 12px; border-radius: 10px; background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.4); cursor: pointer; transition: all 0.2s;">Spoon</button>
      <button id="buyMixer" onclick="game.buyUpgrade('mixer')" style="padding: 10px; font-size: 12px; border-radius: 10px; background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.4); cursor: pointer; transition: all 0.2s;">Mixer</button>
      <button id="buyMachine" onclick="game.buyUpgrade('machine')" style="padding: 10px; font-size: 12px; border-radius: 10px; background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.4); cursor: pointer; transition: all 0.2s;">Machine</button>
      <button id="buyRobot" onclick="game.buyUpgrade('robot')" style="padding: 10px; font-size: 12px; border-radius: 10px; background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.4); cursor: pointer; transition: all 0.2s;">Robot</button>
    </div>
  `;

 
  const clickBtn = document.getElementById("clickBtn");
  clickBtn.addEventListener("click", function() {
    game.addBoba(1);
    this.style.transform = "scale(0.9)";
    setTimeout(() => this.style.transform = "scale(1)", 100);

    
    const img = document.getElementById("clickImg");
    img.src = "imgs/boba-drinking-1.gif";
    setTimeout(() => {
      img.src = "imgs/boba-drinking-1.png";
    }, 500);
  });


  document.querySelectorAll("button[onclick]").forEach(btn => {
    btn.addEventListener("mouseover", function() {
      if (!this.disabled) this.style.background = "rgba(255,255,255,0.3)";
    });
    btn.addEventListener("mouseout", function() {
      if (!this.disabled) this.style.background = "rgba(255,255,255,0.2)";
    });
  });
}
