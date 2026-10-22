/* ============================================================
   UNE VIE v0.6 — VUE FINANCES (budget, patrimoine, dettes, courbe)
   ============================================================ */

(function () {
  "use strict";

  function render(state) {
    var panel = document.getElementById("panel-argent");
    if (!panel) return;

    var budget = window.VIE.engine.finance.getMonthlyBudget(state);
    var netWorth = window.VIE.engine.finance.getNetWorth(state);
    var history = state.finance.historiquePatrimoine || [];
    var creditScore = state.finance.scoreCredit || 50;

    var html = '';

    // 1. En-tête : patrimoine net + score crédit
    html += '<div class="finance-header">';
    html += '<div class="fin-kpi"><span class="label">Patrimoine net</span><span class="value ' + (netWorth >= 0 ? "pos" : "neg") + '">' + window.VIE.util.formatMoney(netWorth) + '</span></div>';
    html += '<div class="fin-kpi"><span class="label">Score crédit</span><span class="value">' + creditScore + '/100</span></div>';
    html += '<div class="fin-kpi"><span class="label">Solde mensuel</span><span class="value ' + (budget.soldeMensuel >= 0 ? "pos" : "neg") + '">' + (budget.soldeMensuel >= 0 ? "+" : "") + window.VIE.util.formatMoney(budget.soldeMensuel) + '/mois</span></div>';
    html += '</div>';

    // 2. Budget mensuel détaillé
    html += '<div class="fin-section"><h4>Budget mensuel</h4>';
    html += '<div class="budget-grid">';
    html += '<div class="budget-col revenus"><h5>Revenus</h5>';
    html += '<div class="budget-line"><span>Salaire</span><span>' + window.VIE.util.formatMoney(budget.detail.salaire) + '</span></div>';
    html += '<div class="budget-line"><span>Capital</span><span>' + window.VIE.util.formatMoney(budget.detail.capital) + '</span></div>';
    html += '<div class="budget-line"><span>Aides</span><span>' + window.VIE.util.formatMoney(budget.detail.aides) + '</span></div>';
    html += '<div class="budget-line total"><span>Total</span><span>+' + window.VIE.util.formatMoney(budget.revenusMensuels) + '</span></div>';
    html += '</div>';

    html += '<div class="budget-col charges"><h5>Charges</h5>';
    html += '<div class="budget-line"><span>Logement</span><span>' + window.VIE.util.formatMoney(budget.detail.logement) + '</span></div>';
    html += '<div class="budget-line"><span>Vie courante</span><span>' + window.VIE.util.formatMoney(budget.detail.vie) + '</span></div>';
    html += '<div class="budget-line"><span>Habitudes</span><span>' + window.VIE.util.formatMoney(budget.detail.habitudes) + '</span></div>';
    html += '<div class="budget-line"><span>Impôts</span><span>' + window.VIE.util.formatMoney(budget.detail.impots) + '</span></div>';
    html += '<div class="budget-line"><span>Dettes</span><span>' + window.VIE.util.formatMoney(budget.detail.dettes) + '</span></div>';
    html += '<div class="budget-line total"><span>Total</span><span>-' + window.VIE.util.formatMoney(budget.chargesMensuelles) + '</span></div>';
    html += '</div>';
    html += '</div></div>';

    // 3. Investissements
    var inv = state.finance.placements || {};
    html += '<div class="fin-section"><h4>Investissements</h4><div class="invest-grid">';
    Object.keys(inv).forEach(function (k) {
      var v = inv[k];
      if (v > 0) {
        var labels = { actions_etf: "Actions/ETF", crypto: "Crypto", immobilier_locatif: "Immo locatif", entreprise: "Entreprise" };
        html += '<div class="invest-card"><span class="inv-label">' + (labels[k] || k) + '</span><span class="inv-value">' + window.VIE.util.formatMoney(v) + '</span></div>';
      }
    });
    html += '</div></div>';

    // 4. Épargne
    var epargne = state.finance.epargne || {};
    html += '<div class="fin-section"><h4>Épargne</h4><div class="invest-grid">';
    Object.keys(epargne).forEach(function (k) {
      var v = epargne[k];
      if (v > 0) {
        var labels = { livret: "Livret A", assuranceVie: "Assurance vie", plan_retraite: "Plan retraite" };
        html += '<div class="invest-card"><span class="inv-label">' + (labels[k] || k) + '</span><span class="inv-value">' + window.VIE.util.formatMoney(v) + '</span></div>';
      }
    });
    html += '</div></div>';

    // 5. Dettes
    var dettes = state.finance.dettes || [];
    if (dettes.length) {
      html += '<div class="fin-section"><h4>Dettes en cours</h4><table class="debt-table"><thead><tr><th>Type</th><th>Capital</th><th>Taux</th><th>Mensualité</th><th>Fin</th></tr></thead><tbody>';
      dettes.forEach(function (d) {
        html += '<tr><td>' + d.type + '</td><td>' + window.VIE.util.formatMoney(d.capital) + '</td><td>' + (d.taux * 100).toFixed(2) + '%</td><td>' + window.VIE.util.formatMoney(d.mensualite) + '/mois</td><td>' + d.finAnnee + '</td></tr>';
      });
      html += '</tbody></table></div>';
    }

    // 6. Courbe patrimoine (SVG simple)
    if (history.length >= 2) {
      html += '<div class="fin-section"><h4>Évolution du patrimoine</h4><div class="chart-container" id="networth-chart"></div>';
    }

    // 7. Actions rapides
    html += '<div class="fin-actions">';
    html += '<button class="btn btn-secondary" onclick="window.VIE.ui.financeView.openHousing()">🏠 Logement</button>';
    html += '<button class="btn btn-secondary" onclick="window.VIE.ui.financeView.openInvest()">📈 Investir</button>';
    html += '<button class="btn btn-secondary" onclick="window.VIE.ui.financeView.openBudget()">📊 Budget détaillé</button>';
    html += '</div>';

    panel.innerHTML = html;

    // Dessiner courbe
    if (history.length >= 2) drawNetWorthChart(history);
  }

  // ── MODALE LOGEMENT ─────────────────────────────────────────
  function openHousing() {
    var state = window.VIE.engine.state.get();
    var cfg = window.VIE.config.finance.housing;
    var current = state.finance.residence.type || "parents";

    var html = '<div class="modal-content-large"><h3>🏠 Changer de logement</h3><p class="modal-desc">Logement actuel : <strong>' + (cfg[current]?.label || current) + '</strong></p>';
    html += '<div class="housing-options">';

    Object.keys(cfg).forEach(function (type) {
      if (type === "parents") return;
      var opt = cfg[type];
      var canBuy = window.VIE.engine.finance.canBuyHousing(window.VIE.engine.state.get(), type);
      var disabled = canBuy.ok ? "" : "disabled";
      var reason = canBuy.ok ? "" : ' title="' + canBuy.reason + '"';
      html += '<button class="housing-option ' + (type === state.finance.residence.type ? "current" : "") + '" ' + disabled + reason + ' onclick="window.VIE.ui.financeView.buyHousing(\'' + type + '\')">';
      html += '<strong>' + opt.label + '</strong><br>';
      html += '<small>Prix: ' + window.VIE.util.formatMoney(opt.prix) + ' | Apport min: ' + window.VIE.util.formatMoney(opt.prix * opt.apportMin) + '</small><br>';
      html += '<small>Mensualité: ~' + window.VIE.util.formatMoney(opt.prix * (1 - opt.apportMin) * (cfg.tauxDefaut/12) / (1 - Math.pow(1 + cfg.tauxDefaut/12, -opt.duree*12))) + ' | Charges: ' + window.VIE.util.formatMoney(opt.charges || 0) + '/mois</small>';
      if (!canBuy.ok) html += '<br><small style="color:var(--blood)">' + canBuy.reason + '</small>';
      html += '</button>';
    });
    html += '</div></div>';

    openModal("Modal Logement", html);
  }

  function buyHousing(type) {
    var res = window.VIE.engine.finance.buyHousing(window.VIE.engine.state.get(), type);
    if (res.success) {
      closeModal();
      window.VIE.ui.financeView.render(window.VIE.engine.state.get());
    } else {
      alert(res.reason);
    }
  }

  // ── MODALE INVESTISSEMENT ───────────────────────────────────
  function openInvest() {
    var state = window.VIE.engine.state.get();
    var cfg = window.VIE.config.finance.markets;

    var html = '<div class="modal-content-large"><h3>📈 Investir</h3><p class="modal-desc">Compte dispo: <strong>' + window.VIE.util.formatMoney(window.VIE.engine.state.get().finance.compte) + '</strong></p>';
    html += '<div class="invest-options">';

    Object.keys(cfg).forEach(function (k) {
      var m = cfg[k];
      html += '<div class="invest-option-card">';
      html += '<h4>' + ({actions_etf:"📈 Actions/ETF", crypto:"₿ Crypto", immobilier_locatif:"🏘️ Immo locatif", entreprise:"🏢 Entreprise", livret:"📘 Livret A", assurance_vie:"📗 Assurance vie", plan_retraite:"🏦 Plan retraite"}[k] || k) + '</h4>';
      html += '<p>Rendement: ~' + (m.rendement*100).toFixed(1) + '% | Volatilité: ' + (m.volatilite*100).toFixed(0) + '%</p>';
      html += '<input type="number" id="invest-' + k + '" placeholder="Montant (€)" min="100" step="100">';
      html += '<button class="btn btn-primary" onclick="window.VIE.ui.financeView.doInvest(\'' + k + '\')">Investir</button>';
      html += '</div>';
    });
    html += '</div></div>';

    openModal("Modal Investissement", html);
  }

  function doInvest(assetClass) {
    var amount = parseInt(document.getElementById("invest-" + assetClass).value);
    if (!amount || amount < 100) return alert("Montant invalide");
    var res = window.VIE.engine.finance.invest(window.VIE.engine.state.get(), assetClass, amount);
    if (res.ok) {
      closeModal();
      window.VIE.ui.financeView.render(window.VIE.engine.state.get());
    } else {
      alert(res.reason);
    }
  }

  // ── MODALES GÉNÉRIQUES ──────────────────────────────────────
  function openModal(title, html) {
    closeModal();
    var modal = document.createElement("div");
    modal.id = "finance-modal";
    modal.className = "modal";
    modal.innerHTML = '<div class="modal-backdrop" onclick="window.VIE.ui.financeView.closeModal()"></div><div class="modal-content modal-content-large"><button class="modal-close" onclick="window.VIE.ui.financeView.closeModal()">&times;</button><h3>' + title + '</h3>' + html + '</div>';
    document.body.appendChild(modal);
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    var modal = document.getElementById("finance-modal");
    if (modal) modal.remove();
    document.body.style.overflow = "";
  }

  // 6. Courbe patrimoine (SVG simple)
  function drawNetWorthChart(history) {
    var container = document.getElementById("networth-chart");
    if (!container) return;
    var w = container.clientWidth || 400;
    var h = 200;
    var margin = { top: 20, right: 20, bottom: 30, left: 60 };
    var innerW = w - margin.left - margin.right;
    var innerH = h - margin.top - margin.bottom;

    var values = history.map(function (d) { return d.net; });
    var minV = Math.min(...values);
    var maxV = Math.max(...values);
    var range = maxV - minV || 1;

    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", w);
    svg.setAttribute("height", h);
    svg.style.width = "100%";
    svg.style.height = "auto";

    // Axes
    var xScale = function (i) { return margin.left + (i / (history.length - 1)) * innerW; };
    var yScale = function (v) { return margin.top + innerH - ((v - minV) / range) * innerH; };

    // Ligne
    var path = "M";
    history.forEach(function (d, i) {
      path += (i === 0 ? "" : " L") + xScale(i) + " " + yScale(d.net);
    });

    var line = document.createElementNS("http://www.w3.org/2000/svg", "path");
    line.setAttribute("d", path);
    line.setAttribute("fill", "none");
    line.setAttribute("stroke", "var(--green)");
    line.setAttribute("stroke-width", "2");
    svg.appendChild(line);

    // Points
    history.forEach(function (d, i) {
      var circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("cx", xScale(i));
      circle.setAttribute("cy", yScale(d.net));
      circle.setAttribute("r", 3);
      circle.setAttribute("fill", "var(--green)");
      circle.setAttribute("stroke", "#fff");
      circle.setAttribute("stroke-width", "1.5");
      var title = document.createElementNS("http://www.w3.org/2000/svg", "title");
      title.textContent = d.annee + " : " + window.VIE.util.formatMoney(d.net);
      circle.appendChild(title);
      svg.appendChild(circle);
    });

    // Axes Y (labels)
    for (var t = 0; t <= 4; t++) {
      var v = minV + (t / 4) * range;
      var y = yScale(v);
      var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", margin.left - 5);
      line.setAttribute("y1", y);
      line.setAttribute("x2", margin.left);
      line.setAttribute("y2", y);
      line.setAttribute("stroke", "#ccc");
      svg.appendChild(line);
      var text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute("x", margin.left - 10);
      text.setAttribute("y", y + 4);
      text.setAttribute("text-anchor", "end");
      text.setAttribute("font-size", "10");
      text.setAttribute("fill", "var(--ink-soft)");
      text.textContent = window.VIE.util.formatMoney(v);
      svg.appendChild(text);
    }

    // Axes X (années)
    var step = Math.max(1, Math.floor(history.length / 6));
    for (var i = 0; i < history.length; i += step) {
      var x = xScale(i);
      var text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute("x", x);
      text.setAttribute("y", h - margin.bottom + 16);
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("font-size", "10");
      text.setAttribute("fill", "var(--ink-soft)");
      text.textContent = history[i].annee;
      svg.appendChild(text);
    }

    container.innerHTML = "";
    container.appendChild(svg);
  }

  // Actions (ouvrir modales)
  function openBudget() { alert("Budget détaillé : à implémenter"); }

  window.VIE = window.VIE || {};
  window.VIE.ui = window.VIE.ui || {};
  window.VIE.ui.financeView = {
    render: render,
    openHousing: openHousing,
    openInvest: openInvest,
    openBudget: openBudget,
    buyHousing: buyHousing,
    doInvest: doInvest,
    openModal: openModal,
    closeModal: closeModal
  };
})();