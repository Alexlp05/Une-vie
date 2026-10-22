/* ============================================================
   UNE VIE v0.5 — RENDU CENTRALISÉ
   Orchestre tous les panneaux UI + animations deltas
   ============================================================ */

(function () {
  "use strict";

  var _lastStats = {};

  function renderAll() {
    var state = window.VIE.engine.state.get();
    if (!state) return;

    // 1. Header (nom, âge, trait)
    renderHeader(state);

    // 2. Stats (grille)
    renderStats(state);

    // 3. Panneaux infos (famille, carrière, finances, monde, passions, relations)
    renderFamilyCard(state);
    renderCareerCard(state);
    renderFinancesCard(state);
    renderWorldCard(state);
    renderPassionsCard(state);
    renderRelationsCard(state);

    // 4. Onglets (si visibles)
    if (window.VIE.ui.tabs.getActive) {
      window.VIE.ui.tabs.renderActiveTab(window.VIE.ui.tabs.getActive());
    }

    // 5. Chronique (timeline)
    renderTimeline(state);

    // 6. Deltas animés (stats qui ont changé)
    animateDeltas(state);

    _lastStats = cloneStats(state.stats);
  }

  function renderHeader(state) {
    document.getElementById("char-name").textContent = state.name || "—";
    document.getElementById("char-age").textContent = "Âge " + state.age;
    var traitLabel = state.trait ? state.trait.name : (state.archetypeBias ? "Personnalité unique" : "—");
    document.getElementById("char-trait").textContent = traitLabel;
  }

  function renderStats(state) {
    var grid = document.getElementById("stats-grid");
    if (!grid) return;
    var keys = ["sante", "energie", "argent", "intelligence", "social", "bonheur", "stress", "apparence", "reputation", "confiance"];
    var labels = window.VIE.config.stats.labels;
    grid.innerHTML = keys.map(function (k) {
      var val = state.stats[k] || 0;
      var cls = val >= 70 ? "good" : (val >= 40 ? "mid" : "low");
      return '<div class="stat"><div class="stat-top"><span>' + labels[k] + '</span><b>' + val + '</b></div><div class="stat-bar"><div class="stat-fill ' + cls + '" style="width:' + val + '%"></div></div></div>';
    }).join("");
  }

  function renderFamilyCard(state) {
    var card = document.getElementById("family-card");
    if (!card) return;
    var html = '<h4>Famille</h4>';
    if (state.origin) {
      html += '<p class="fam-origin">' + state.origin.name + '</p>';
      html += '<p class="fam-tagline">' + state.origin.tagline + '</p>';
    }
    if (state.surname) html += '<p class="fam-tagline">Nom : ' + state.surname + '</p>';
    // Parents
    var parents = Object.values(state.people).filter(function (p) {
      return p.famille.some(function (f) { return f.relation === "enfant" && f.id === getPlayerId(state); });
    });
    parents.forEach(function (p) {
      var rel = p.famille.find(function (f) { return f.relation === "enfant" && f.id === getPlayerId(state); });
      var lien = p.liens.find(function (l) { return l.id === getPlayerId(state); });
      html += '<div class="fam-item"><span class="rel-name">' + p.prenom + ' ' + p.nom + '</span> <span class="rel-status">(' + (rel?.relation || "parent") + ' · ' + (lien?.affection || 0) + '%)</span></div>';
    });
    // Fratrie
    var sibs = Object.values(state.people).filter(function (p) {
      return p.famille.some(function (f) { return f.relation === "frere" || f.relation === "soeur"; });
    });
    sibs.forEach(function (s) {
      var lien = s.liens.find(function (l) { return l.id === getPlayerId(state); });
      html += '<div class="fam-item"><span class="rel-name">' + s.prenom + ' ' + s.nom + '</span> <span class="rel-status">(frère/sœur · ' + (lien?.affection || 0) + '%)</span></div>';
    });
    // Conjoint + enfants
    var conjoint = Object.values(state.people).find(function (p) { return p.famille.some(function (f) { return f.relation === "conjoint"; }); });
    if (conjoint) {
      var lien = conjoint.liens.find(function (l) { return l.id === getPlayerId(state); });
      html += '<div class="fam-item"><span class="rel-name">' + conjoint.prenom + ' ' + conjoint.nom + '</span> <span class="rel-status">(conjoint · ' + (lien?.affection || 0) + '%)</span></div>';
    }
    var enfants = Object.values(state.people).filter(function (p) { return p.famille.some(function (f) { return f.relation === "enfant" && f.id === getPlayerId(state); }); });
    enfants.forEach(function (e) {
      var lien = e.liens.find(function (l) { return l.id === getPlayerId(state); });
      html += '<div class="fam-item"><span class="rel-name">' + e.prenom + ' ' + e.nom + '</span> <span class="rel-status">(enfant · ' + (lien?.affection || 0) + '%)</span></div>';
    });
    if (!parents.length && !sibs.length && !conjoint && !enfants.length) html += '<p class="info-empty">Seul(e) pour l\'instant.</p>';
    card.innerHTML = html;
  }

  function getPlayerId(state) {
    return Object.keys(state.people).find(function (k) {
      return state.people[k].liens.some(function (l) { return l.role === "self"; });
    });
  }

  function renderCareerCard(state) {
    var card = document.getElementById("career-card");
    if (!card) return;
    if (!state.career) { card.innerHTML = '<h4>Carrière</h4><p class="info-empty">Aucune carrière pour l\'instant.</p>'; return; }
    var track = window.VIE.getCareerTrack(state.career.track);
    if (!track) { card.innerHTML = '<h4>Carrière</h4><p class="info-empty">Carrière inconnue.</p>'; return; }
    var lvl = track.levels[state.career.level];
    var html = '<h4>Carrière</h4>';
    html += '<p class="career-role">' + lvl.name + '</p>';
    html += '<p class="career-track">' + track.name + ' · Niveau ' + (state.career.level + 1) + '/' + track.levels.length + '</p>';
    var income = window.VIE.engine.finance.computeAnnualIncome(state).brutTotal;
    html += '<p class="career-salary">Revenus ~' + window.VIE.util.formatMoney(income) + '/an (brut)</p>';
    var next = track.levels[state.career.level + 1];
    if (next) html += '<p class="career-progress">Prochain : ' + next.name + ' (' + window.VIE.util.formatMoney((next.salary[0] + next.salary[1]) / 2) + ')</p>';
    card.innerHTML = html;
  }

  function renderFinancesCard(state) {
    window.VIE.engine.finance.getMonthlyBudget(state); // assure sync
    var f = window.VIE.engine.finance.computeAnnualBalance(state);
    var card = document.getElementById("finances-card");
    if (!card) return;
    var html = "<h4>Finances</h4>";
    html += '<p class="fin-line"><span>Épargne</span><b>' + (state.finance.compte >= 0 ? "+" : "") + window.VIE.util.formatMoney(state.finance.compte) + '</b></p>';
    var inv = state.finance.placements;
    if (inv.actions_etf || inv.realEstate || inv.business) {
      html += '<p class="fin-line"><span>Investissements</span><b>' +
        (inv.actions_etf ? 'Actions: ' + window.VIE.util.formatMoney(inv.actions_etf) + ' ' : '') +
        (inv.realEstate ? 'Immo: ' + window.VIE.util.formatMoney(inv.realEstate) + ' ' : '') +
        (inv.business ? 'Entreprise: ' + window.VIE.util.formatMoney(inv.business) : '') +
        '</b></p>';
    }
    html += '<p class="fin-line"><span>Revenus/an</span><b>~' + window.VIE.util.formatMoney(f.income) + '</b></p>';
    html += '<p class="fin-line"><span>Charges/an</span><b>~' + window.VIE.util.formatMoney(f.expenses) + '</b></p>';
    html += '<p class="fin-line ' + (f.balance >= 0 ? "pos" : "neg") + '"><span>Solde</span><b>' + (f.balance >= 0 ? "+" : "") + window.VIE.util.formatMoney(f.balance) + '</b></p>';
    var housing = state.finance.residence;
    html += '<p class="fin-sub">Logement : ' + (housing.type || "parents") + ' · ' + (housing.valeur ? window.VIE.util.formatMoney(housing.valeur) : "—") + '</p>';
    card.innerHTML = html;
  }

  function renderWorldCard(state) {
    var card = document.getElementById("world-card");
    if (!card) return;
    var w = state.world;
    var econ = window.VIE.config.world.economyStates[w.economy];
    var html = "<h4>Monde</h4>";
    html += '<p>Économie : <b>' + econ.label + '</b> (×' + econ.mult + ')</p>';
    html += '<p>Inflation : <b>' + w.inflation.toFixed(1) + '%</b></p>';
    html += '<p>Année : <b>' + state.year + '</b></p>';
    html += '<p>Époque : <b>' + w.techEra.label + '</b></p>';
    if (w.event) html += '<p class="world-event">🌍 ' + w.event.title + ' : ' + w.event.text + '</p>';
    card.innerHTML = html;
  }

  function renderPassionsCard(state) {
    var card = document.getElementById("passions-card");
    if (!card) return;
    var passions = state.passions || {};
    var keys = Object.keys(passions);
    if (!keys.length) { card.innerHTML = '<h4>Passions</h4><p class="info-empty">Aucune passion pour l\'instant.</p>'; return; }
    var icons = { peinture: "🎨", musique: "🎵", ecriture: "✒️", sport: "🏃", cuisine: "🍳", technologie: "💻", nature: "🌲", theatre: "🎭", lecture: "📖", photo: "📸", voyage: "✈️", jardinage: "🌱", bricolage: "🔧", collection: "🗃️" };
    var html = "<h4>Passions</h4>";
    keys.forEach(function (k) {
      html += '<div class="passion-item"><span>' + (icons[k] || "⭐") + ' ' + k + '</span><span class="passion-level">Niv. ' + passions[k] + '</span></div>';
    });
    card.innerHTML = html;
  }

  function renderRelationsCard(state) {
    var card = document.getElementById("relations-card");
    if (!card) return;
    var people = Object.values(state.people).filter(function (p) { return p.vivant && p.liens.some(function (l) { return l.affection > 0; }); });
    if (!people.length) { card.innerHTML = '<h4>Relations</h4><p class="info-empty">Aucune relation significative.</p>'; return; }
    var html = "<h4>Relations (" + people.length + ")</h4>";
    people.slice(0, 6).forEach(function (p) {
      var lien = p.liens.find(function (l) { return l.affection > 0; });
      if (!lien) return;
      html += '<div class="relation-item"><span class="rel-name">' + p.prenom + ' ' + p.nom + '</span>';
      html += '<span class="rel-status">' + lien.role + ' · ' + lien.statut + '</span>';
      html += '<div class="rel-bar"><div class="rel-fill ' + (lien.affection >= 70 ? "strong" : "") + '" style="width:' + lien.affection + '%"></div></div>';
      html += '</div>';
    });
    if (people.length > 6) html += '<p class="info-empty">… et ' + (people.length - 6) + ' autres</p>';
    card.innerHTML = html;
  }

  function renderTimeline(state) {
    var tl = document.getElementById("timeline");
    if (!tl) return;
    var entries = (state.history || []).slice(-20).reverse();
    tl.innerHTML = entries.map(function (e) {
      var typeIcons = { vie: "📖", carriere: "💼", relation: "🤝", aleatoire: "🎲", crise: "⚡", passion: "🔥", sante: "🩺", famille: "👨‍👩‍👧‍👦", argent: "💰", social: "🎉", societe: "🌍", deuil: "🕯️", formation: "📚", monde: "🌍" };
      return '<li><span class="tl-age">' + e.age + ' ans (' + e.year + ')</span> <span class="tl-icon">' + (typeIcons[e.type] || "📝") + '</span> ' + (e.title || "") + '<span class="tl-result">' + (e.result || "") + '</span></li>';
    }).join("");
  }

  // ── ANIMATION DELTAS ─────────────────────────────────────
  function animateDeltas(state) {
    var keys = ["sante", "energie", "argent", "intelligence", "social", "bonheur", "stress", "apparence", "reputation", "confiance"];
    keys.forEach(function (k) {
      var old = _lastStats[k];
      var neu = state.stats[k];
      if (old !== undefined && neu !== old) {
        var diff = neu - old;
        var idx = ["sante","energie","argent","intelligence","social","bonheur","stress","apparence","reputation","confiance"].indexOf(k);
        var fill = document.querySelector("#stats-grid .stat:nth-child(" + (idx + 1) + ") .stat-fill");
        if (fill) {
          fill.style.transition = "width 0.8s cubic-bezier(0.4,0,0.2,1)";
          fill.style.width = neu + "%";
          // Flash couleur
          fill.style.background = diff > 0 ? "var(--green)" : "var(--blood)";
          setTimeout(function () {
            var cls = neu >= 70 ? "good" : (neu >= 40 ? "mid" : "low");
            fill.style.background = "";
            fill.className = "stat-fill " + cls;
          }, 800);
        }
      }
    });
  }

  function cloneStats(stats) {
    var o = {};
    for (var k in stats) o[k] = stats[k];
    return o;
  }

  // Export
  window.VIE = window.VIE || {};
  window.VIE.ui = window.VIE.ui || {};
  window.VIE.ui.render = { renderAll: renderAll };
})();