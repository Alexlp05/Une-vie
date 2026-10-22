/* ============================================================
   UNE VIE v0.8 — SYSTÈME D'ONGLETS
   ============================================================ */

(function () {
  "use strict";

  var _activeTab = "vie";
  var _tabs = ["vie", "moi", "proches", "argent", "carriere", "journal", "arbre"];

  function initTabs() {
    var container = document.getElementById("tabs-container");
    if (!container) return;

    container.innerHTML = _tabs.map(function (t) {
      var labels = { vie: "📖 Vie", moi: "👤 Moi", proches: "👥 Proches", argent: "💰 Argent", carriere: "💼 Carrière", journal: "📔 Journal", arbre: "🌳 Arbre" };
      return '<button class="tab-btn ' + (t === _activeTab ? "active" : "") + '" data-tab="' + t + '" role="tab" aria-selected="' + (t === _activeTab) + '">' + labels[t] + '</button>';
    }).join("");

    container.querySelectorAll(".tab-btn").forEach(function (btn) {
      btn.addEventListener("click", function () { switchTab(this.dataset.tab); });
      // Keyboard navigation
      btn.addEventListener("keydown", function (e) {
        var idx = _tabs.indexOf(this.dataset.tab);
        if (e.key === "ArrowRight") { e.preventDefault(); switchTab(_tabs[(idx + 1) % _tabs.length]); }
        else if (e.key === "ArrowLeft") { e.preventDefault(); switchTab(_tabs[(idx - 1 + _tabs.length) % _tabs.length]); }
      });
    });
  }

  function switchTab(tab) {
    if (!_tabs.includes(tab)) return;
    _activeTab = tab;
    document.querySelectorAll(".tab-btn").forEach(function (b) { 
      b.classList.toggle("active", b.dataset.tab === tab);
      b.setAttribute("aria-selected", b.dataset.tab === tab);
    });
    document.querySelectorAll(".tab-panel").forEach(function (p) { p.classList.toggle("hidden", p.id !== "panel-" + tab); });
    renderActiveTab(tab);
  }

  function renderActiveTab(tab) {
    var state = window.VIE.engine.state.get();
    if (!state) return;

    switch (tab) {
      case "moi": window.VIE.ui.statsView?.render(state); break;
      case "proches": window.VIE.ui.personCard?.renderList(state); break;
      case "argent": window.VIE.ui.financeView?.render(state); break;
      case "carriere": window.VIE.ui.careerView?.render(state); break;
      case "journal": window.VIE.ui.timeline?.render(state); break;
      case "arbre": window.VIE.ui.familyTree?.render(state); break;
      default: break;
    }
  }

  function getActiveTab() { return _activeTab; }

  window.VIE = window.VIE || {};
  window.VIE.ui = window.VIE.ui || {};
  window.VIE.ui.tabs = {
    init: initTabs,
    switch: switchTab,
    getActive: getActiveTab,
    renderActive: renderActiveTab,
    renderActiveTab: renderActiveTab
  };
})();