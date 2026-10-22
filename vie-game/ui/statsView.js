/* ============================================================
   UNE VIE v0.5 — VUE STATS & PERSONNALITÉ (onglet Moi)
   ============================================================ */

(function () {
  "use strict";

  function render(state) {
    var panel = document.getElementById("panel-moi");
    if (!panel) return;

    var html = '';

    // 1. Stats principales (6 + 4 étendues)
    html += '<div class="stats-section"><h4>📊 Statistiques</h4><div class="stats-grid-2">';
    var statKeys = ["sante", "energie", "argent", "intelligence", "social", "bonheur", "stress", "apparence", "reputation", "confiance"];
    var labels = window.VIE.config.stats.labels;
    statKeys.forEach(function (k) {
      var val = state.stats[k] || 0;
      var cls = val >= 70 ? "good" : (val >= 40 ? "mid" : "low");
      html += '<div class="stat">';
      html += '<div class="stat-top"><span>' + labels[k] + '</span><b>' + val + '</b></div>';
      html += '<div class="stat-bar"><div class="stat-fill ' + cls + '" style="width:' + val + '%"></div></div>';
      html += '</div>';
    });
    html += '</div></div>';

    // 2. Décomposition du bonheur
    html += '<div class="stats-section"><h4>😊 Bonheur par domaine</h4><div class="happiness-breakdown">';
    var domains = ["amour", "amis", "famille", "travail", "sante", "argent", "sens"];
    var domainLabels = { amour: "❤️ Amour", amis: "🤝 Amis", famille: "👨‍👩‍👧‍👦 Famille", travail: "💼 Travail", sante: "🩺 Santé", argent: "💰 Argent", sens: "✨ Sens" };
    domains.forEach(function (d) {
      // Calcul simplifié basé sur relations/stats
      var score = computeHappinessDomain(state, d);
      html += '<div class="happiness-item">';
      html += '<span class="h-label">' + domainLabels[d] + '</span>';
      html += '<div class="h-bar"><div class="bar-fill" style="width:' + score + '%"></div></div>';
      html += '<span class="h-val">' + score + '%</span>';
      html += '</div>';
    });
    html += '</div></div>';

    // 3. Personnalité (Big Five + traits)
    html += '<div class="stats-section"><h4>🧠 Personnalité</h4>';
    var visible = window.VIE.engine.personality.getVisible(state);
    html += '<div class="personality-radar" id="personality-radar"></div>';
    html += '<div class="personality-details">';
    Object.keys(visible).forEach(function (k) {
      if (k === "lucidity") return;
      var label = window.VIE.config.personality.labels[k];
      html += '<div class="trait-row"><span>' + label + '</span><span class="bar"><div class="bar-fill" style="width:' + visible[k] + '%"></div></span> ' + visible[k] + '</div>';
    });
    html += '<p class="lucidity">Lucidité : ' + visible.lucidity + '%</p>';
    html += '</div>';

    // Traits discrets visibles
    var visibleTraits = window.VIE.engine.personality.getVisibleTraits(state);
    if (visibleTraits.length) {
      html += '<div class="personality-traits"><h5>Traits connus</h5><div class="traits-cloud">';
      visibleTraits.forEach(function (t) {
        var def = window.VIE.getTrait(t);
        html += '<span class="trait-tag" title="' + (def?.desc || "") + '">' + t + '</span>';
      });
      html += '</div></div>';
    } else {
      html += '<p class="empty">Vous ne vous connaissez pas encore assez bien. L\'introspection vient avec l\'âge, la thérapie, les épreuves.</p>';
    }
    html += '</div>';

    // 4. Habitudes
    html += '<div class="stats-section"><h4>🍷 Habitudes & Dépendances</h4><div class="habits-grid">';
    var habitLabels = { alcool: "🍷 Alcool", tabac: "🚬 Tabac", cannabis: "🌿 Cannabis", jeu: "🎰 Jeu", sport: "🏃 Sport", alimentation: "🍎 Alimentation", sommeil: "😴 Sommeil", ecrans: "📱 Écrans", soirees: "🎉 Soirées", voyages: "✈️ Voyages" };
    Object.keys(state.habitudes || {}).forEach(function (h) {
      var val = state.habitudes[h];
      var dep = state.dependances && state.dependances[h];
      var cls = val > 70 ? "high" : (val > 40 ? "mid" : "low");
      if (dep) cls = "addiction";
      html += '<div class="habit ' + cls + '">';
      html += '<span class="h-label">' + (habitLabels[h] || h) + '</span>';
      html += '<div class="h-bar"><div class="bar-fill ' + cls + '" style="width:' + val + '%"></div></div>';
      html += '<span class="h-val">' + val + (dep ? ' ⚠️' : '') + '</span>';
      html += '</div>';
    });
    html += '</div></div>';

    // 5. Santé
    var me = null;
    if (state.people) {
      me = Object.values(state.people).find(function (p) {
        return p.liens.some(function (l) { return l.role === "self"; });
      });
    }
    var humeur = me && typeof me.humeur === "number" ? me.humeur : 50;

    html += '<div class="stats-section"><h4>🩺 Santé</h4>';
    html += '<div class="health-grid">';
    html += '<div class="health-card"><h5>Physique</h5><p>Santé : ' + state.stats.sante + '/100</p>';
    if (me) {
      html += '<p>Conditions : ' + ((me.conditions && me.conditions.length) ? me.conditions.join(", ") : "Aucune") + '</p>';
      html += '<p>Autonomie : ' + Math.round(window.VIE.engine.health.computeAutonomy(me)) + '%</p>';
    }
    html += '</div>';
    html += '<div class="health-card"><h5>Mental</h5>';
    html += '<p>Stress : ' + (state.stats.stress || 0) + '/100</p>';
    html += '<p>Humeur : ' + Math.round(humeur) + '/100</p>';
    if (state.flags.indexOf("therapie") !== -1) html += '<p>🧠 En thérapie</p>';
    html += '</div>';
    html += '</div></div>';

    panel.innerHTML = html;

    // Dessiner radar personnalité
    drawPersonalityRadar(visible);
  }

  function computeHappinessDomain(state, domain) {
    var base = 50;
    switch (domain) {
      case "amour":
        var love = Object.values(state.people).find(function (p) { return p.liens.some(function (l) { return l.role === "amour" && l.affection > 50; }); });
        if (love) base = love.liens.find(function (l) { return l.role === "amour"; }).affection;
        break;
      case "amis":
        var friends = Object.values(state.people).filter(function (p) { return p.liens.some(function (l) { return ["ami", "ami_proche", "meilleur_ami"].includes(l.role); }); });
        base = friends.length ? Math.round(friends.reduce(function (s, p) { return s + (p.liens.find(function(l){return l.role==="ami";})?.affection || 0); }, 0) / friends.length) : 20;
        break;
      case "famille":
        var fam = Object.values(state.people).filter(function (p) { return p.liens.some(function (l) { return ["parent", "mere", "pere", "frere", "soeur", "enfant"].includes(l.role); }); });
        base = fam.length ? Math.round(fam.reduce(function (s, p) { return s + (p.liens.find(function(l){return ["parent","mere","pere","frere","soeur","enfant"].includes(l.role);})?.affection || 0); }, 0) / fam.length) : 30;
        break;
      case "travail":
        base = window.VIE.engine.career.computeSatisfaction(state);
        break;
      case "sante":
        base = state.stats.sante;
        break;
      case "argent":
        base = state.stats.argent;
        break;
      case "sens":
        base = Math.round((state.stats.bonheur + state.stats.confiance) / 2);
        break;
    }
    return clamp(base, 0, 100);
  }

  function drawPersonalityRadar(personality) {
    var container = document.getElementById("personality-radar");
    if (!container) return;
    var dims = ["O", "C", "E", "A", "N"];
    var w = 200, h = 200, cx = w/2, cy = h/2, r = 80;
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", w); svg.setAttribute("height", h);
    svg.style.margin = "0 auto";

    // Grilles
    for (var i = 1; i <= 4; i++) {
      var rr = r * i / 4;
      var circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("cx", cx); circle.setAttribute("cy", cy); circle.setAttribute("r", rr);
      circle.setAttribute("fill", "none"); circle.setAttribute("stroke", "#eee");
      svg.appendChild(circle);
    }

    // Axes + labels
    dims.forEach(function (d, i) {
      var angle = -Math.PI/2 + i * 2*Math.PI/dims.length;
      var lx = cx + (r + 15) * Math.cos(angle);
      var ly = cy + (r + 15) * Math.sin(angle);
      var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", cx); line.setAttribute("y1", cy);
      line.setAttribute("x2", cx + r * Math.cos(angle)); line.setAttribute("y2", cy + r * Math.sin(angle));
      line.setAttribute("stroke", "#ddd"); svg.appendChild(line);
      var text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute("x", lx); text.setAttribute("y", ly); text.setAttribute("text-anchor", "middle"); text.setAttribute("font-size", "11"); text.setAttribute("fill", "var(--ink-soft)");
      text.textContent = window.VIE.config.personality.labels[d]; svg.appendChild(text);
    });

    // Polygone
    var points = dims.map(function (d, i) {
      var angle = -Math.PI/2 + i * 2*Math.PI/dims.length;
      var val = personality[d] || 50;
      var rr = r * val / 100;
      return (cx + rr * Math.cos(angle)) + "," + (cy + rr * Math.sin(angle));
    }).join(" ");

    var poly = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    poly.setAttribute("points", points);
    poly.setAttribute("fill", "rgba(184,134,11,0.2)");
    poly.setAttribute("stroke", "var(--gold)");
    poly.setAttribute("stroke-width", "2");
    svg.appendChild(poly);

    container.innerHTML = "";
    container.appendChild(svg);
  }

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  window.VIE = window.VIE || {};
  window.VIE.ui = window.VIE.ui || {};
  window.VIE.ui.statsView = { render: render };
})();