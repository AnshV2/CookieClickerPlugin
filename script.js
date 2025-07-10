(function () {
  let autoBuyActive = false;

  function findBestAffordableBuilding() {
    const buildings = Game.ObjectsById;
    let bestRatio = -Infinity;
    let bestBuilding = null;

    buildings.forEach((building) => {
      const cost = building.getPrice();
      const cps = building.storedCps;
      const ratio = cps / cost;

      if (ratio > bestRatio) {
        bestRatio = ratio;
        bestBuilding = building;
      }
    });

    if (Game.cookies < bestBuilding.getPrice()) return null;
    return bestBuilding;
  }

  function continueAutoBuy(price, building) {
    const newPrice = building.getPrice();

    if (newPrice !== price) {
        toggleAutoBuy();
    } else {
        setTimeout(() => continueAutoBuy(price, building), 500);
    }
  }

  function toggleAutoBuy() {
    const building = findBestAffordableBuilding();
    if (!building) {
        autoBuyActive = false;
      btn.disabled = false;
      btn.innerHTML = `<span style="margin-right: 8px;">🍪</span>Start Auto Buy`;
      btn.style.backgroundColor = "#28a745";
        btn.style.cursor = "pointer";
      return;
    }

    autoBuyActive = true;
    btn.disabled = true;
    btn.innerHTML = `<span style="margin-right: 8px;">🍪</span>Auto-buying...`;
    btn.style.backgroundColor = "#888";
    btn.style.cursor = "not-allowed";

    building.buy(1);
    setTimeout(() => toggleAutoBuy(), 1000);
  }

  function monitorButtonAvailability() {
    setInterval(() => {
      if (autoBuyActive) return;

      const bestBuilding = findBestAffordableBuilding();
      if (bestBuilding) {
        btn.style.backgroundColor = "#28a745";
        btn.style.cursor = "pointer";
        btn.disabled = false;
      } else {
        btn.style.backgroundColor = "#888";
        btn.style.cursor = "not-allowed";
        btn.disabled = true;
      }
    }, 500);
  }

  // Create and insert the auto-buy button
  const btn = document.createElement("button");
  btn.id = "autoBuyBtn";
  btn.innerHTML = `<span style="margin-right: 8px;">🍪</span>Start Auto Buy`;
  btn.style.position = "fixed";
  btn.style.bottom = "20px";
  btn.style.right = "20px";
  btn.style.padding = "10px 20px";
  btn.style.backgroundColor = "#888";
  btn.style.color = "#fff";
  btn.style.border = "none";
  btn.style.borderRadius = "8px";
  btn.style.cursor = "not-allowed";
  btn.style.fontSize = "16px";
  btn.style.fontWeight = "bold";
  btn.style.display = "flex";
  btn.style.alignItems = "center";
  btn.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";
  btn.style.zIndex = 10000;
  btn.style.transition = "background-color 0.2s ease";

  btn.onclick = toggleAutoBuy;
  document.body.appendChild(btn);

  // CPS/Cost ratio displayed inline next to cost using common exponent
  function injectRatioDisplay() {
    setInterval(() => {
      const buildings = Game.ObjectsById;

      let bestRatio = -Infinity;
      let bestId = -1;
      let maxRatio = 0;

      const ratios = buildings.map((building) => {
        const cost = building.getPrice();
        const cps = building.storedCps;
        const ratio = cps / cost;

        if (ratio > bestRatio) {
          bestRatio = ratio;
          bestId = building.id;
        }

        if (ratio > maxRatio) {
          maxRatio = ratio;
        }

        return {
          id: building.id,
          ratio,
        };
      });

      const commonExponent = Math.floor(Math.log10(maxRatio));

      ratios.forEach(({ id, ratio }) => {
        const mantissa = ratio / Math.pow(10, commonExponent);

        const buildingEl = document.getElementById(`product${id}`);
        if (!buildingEl) return;

        const priceEl = buildingEl.querySelector(".price");
        if (!priceEl) return;

        let ratioSpan = priceEl.querySelector(".cps-ratio-span");
        if (!ratioSpan) {
          ratioSpan = document.createElement("span");
          ratioSpan.className = "cps-ratio-span";
          ratioSpan.style.fontSize = "10px";
          ratioSpan.style.color = "#ccc";
          ratioSpan.style.marginLeft = "6px";
          priceEl.appendChild(ratioSpan);
        }

        ratioSpan.textContent = `(${mantissa.toFixed(2)}e${commonExponent})`;
        ratioSpan.style.color = id === bestId ? "#00ff00" : "#ccc";
      });
    }, 1000);
  }

  const waitForGame = setInterval(() => {
    if (typeof Game !== "undefined" && Game.ready) {
      clearInterval(waitForGame);
      injectRatioDisplay();
      monitorButtonAvailability();
    }
  }, 500);
})();
