/* ============================================================
   UNE VIE v0.5 — JOURNAL / TIMELINE FILTRABLE
   ============================================================ */

(function () {
  "use strict";

  var _currentFilter = "all";

  function render(state) {
    var panel = document.getElementById("panel-journal");
    if (!panel) return;

    var entries = (state.history || []).slice().reverse();
    var maxEntries = window.VIE.config.ui.maxTimelineEntries || 500;
    if (entries.length > maxEntries) entries = entries.slice(0, maxEntries);

    // Filtres disponibles
    var types = [...new Set(entries.map(function (e) { return e.type || "vie"; }))].sort();

    var html = '<div class="timeline-filters">';
    html += '<button class="filter-btn active" data-filter="all">Tout</button>';
    types.forEach(function (t) {
      var label = t.charAt(0).toUpperCase() + t.slice(1);
      var icons = { vie: "📖", carriere: "💼", relation: "🤝", aleatoire: "🎲", crise: "⚡", passion: "🔥", sante: "🩺", famille: "👨‍👩‍👧‍👦", argent: "💰", social: "🎉", societe: "🌍", deuil: "🕯️", formation: "📚", monde: "🌍", faute: "⚠️", vice: "🍷", redemption: "🙏" };
      html += '<button class="filter-btn" data-filter="' + t + '">' + (icons[t] || "📝") + ' ' + label + '</button>';
    });
    html += '</div>';

    html += '<div class="timeline-entries" id="timeline-entries">';
    html += renderEntries(entries);
    html += '</div>';

    panel.innerHTML = html;

    panel.querySelectorAll(".filter-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        _currentFilter = this.dataset.filter;
        panel.querySelectorAll(".filter-btn").forEach(function (b) { b.classList.toggle("active", b.dataset.filter === _currentFilter); });
        var container = panel.querySelector("#timeline-entries");
        container.innerHTML = renderEntries(entries);
      });
    });
  }

  function renderEntries(entries) {
    var filtered = _currentFilter === "all" ? entries : entries.filter(function (e) { return e.type === _currentFilter; });
    if (!filtered.length) return '<p class="empty">Aucun événement pour ce filtre.</p>';

    return filtered.map(function (e) {
      var typeIcons = { vie: "📖", carriere: "💼", relation: "🤝", aleatoire: "🎲", crise: "⚡", passion: "🔥", sante: "🩺", famille: "👨‍👩‍👧‍👦", argent: "💰", social: "🎉", societe: "🌍", deuil: "🕯️", formation: "📚", monde: "🌍", faute: "⚠️", vice: "🍷", redemption: "🙏" };
      var eType = e.type || "vie";
      var icon = typeIcons[eType] || "📝";
      var date = e.year ? e.year + " (âge " + e.age + ")" : "âge " + e.age;
      var typeLabel = eType.charAt(0).toUpperCase() + eType.slice(1);
      return '<div class="timeline-entry" data-type="' + eType + '">' +
        '<span class="tl-icon">' + icon + '</span>' +
        '<span class="tl-date">' + date + '</span>' +
        '<span class="tl-type-badge">' + typeLabel + '</span>' +
        '<span class="tl-title">' + (e.title || "") + '</span>' +
        '<span class="tl-result">' + (e.result || "") + '</span>' +
        '</div>';
    }).join("");
  }

  window.VIE = window.VIE || {};
  window.VIE.ui = window.VIE.ui || {};
  window.VIE.ui.timeline = { render: render };
})();