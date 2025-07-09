(function () {

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

    if (!bestBuilding || Game.cookies < bestBuilding.getPrice()) return null;
    return bestBuilding;
  }

  function toggleAutoBuy() {
    const building = findBestAffordableBuilding();
    if (!building) return;

    building.buy(1);
    setTimeout(toggleAutoBuy, 1000);
  }

  function monitorButtonAvailability() {
    setInterval(() => {
      const bestBuilding = findBestAffordableBuilding();
      if (bestBuilding) {
        btn.style.backgroundColor = "#28a745"; 
        btn.style.cursor = "pointer";
      } else {
        btn.style.backgroundColor = "#888"; 
        btn.style.cursor = "not-allowed";
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

  // CPS/Cost ratio display below cost, left-aligned, full width
  function injectRatioDisplay() {
    setInterval(() => {
      const buildings = Game.ObjectsById;

      let bestRatio = -Infinity;
      let bestId = -1;

      buildings.forEach((building) => {
        const cost = building.getPrice();
        const cps = building.storedCps;
        const ratio = cps / cost;

        if (ratio > bestRatio) {
          bestRatio = ratio;
          bestId = building.id;
        }
      });

      buildings.forEach((building) => {
        const cost = building.getPrice();
        const cps = building.storedCps;
        const ratio = cps / cost;
        const id = building.id;

        const buildingEl = document.getElementById(`product${id}`);
        if (!buildingEl) return;

        const priceEl = buildingEl.querySelector(".price");
        if (!priceEl) return;

        let ratioDiv = buildingEl.querySelector(".cps-ratio-div");
        if (!ratioDiv) {
          ratioDiv = document.createElement("div");
          ratioDiv.className = "cps-ratio-div";

          // Style for left alignment and full width
          ratioDiv.style.fontSize = "10px";
          ratioDiv.style.color = "#ccc";
          ratioDiv.style.marginTop = "2px";
          ratioDiv.style.textAlign = "left";
          ratioDiv.style.whiteSpace = "nowrap";
          ratioDiv.style.width = "100%";

          // Insert after the price element (as sibling)
          priceEl.insertAdjacentElement("afterend", ratioDiv);
        }

        ratioDiv.textContent = `CPS/Cost: ${ratio.toFixed(6)}`;
        ratioDiv.style.color = id === bestId ? "#00ff00" : "#ccc";

        buildingEl.style.minHeight = "70px";
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
