/* ============================================================
   UNE VIE v0.8 — VUE "MOI" : FICHE PERSONNELLE COMPLÈTE
   Connectée à toutes les données du joueur : identité, carrière,
   finances, relations, passions, santé, vœux, conditions.
   ============================================================ */

(function () {
  "use strict";

  function render(state) {
    var panel = document.getElementById("panel-moi");
    if (!panel) return;

    var html = '';

    // ── 1. IDENTITÉ PERSONNELLE ─────────────────────────────
    var me = null;
    if (state.people) {
      me = Object.values(state.people).find(function (p) {
        return p.liens.some(function (l) { return l.role === "self"; });
      });
    }
    var age = state.age || 0;
    var sexeLabel = state.sexe === "femme" ? "Femme" : "Homme";
    var traitLabel = state.trait ? (state.trait.name || state.trait.label || state.trait.id) : "—";
    var originLabel = state.origin ? state.origin.name : "—";

    html += '<div class="stats-section identity-card">';
    html += '<h4>👤 Identité</h4>';
    html += '<div class="identity-grid">';
    html += '<div class="id-item"><span class="id-label">Prénom</span><span class="id-value">' + (state.name || "—") + '</span></div>';
    html += '<div class="id-item"><span class="id-label">Nom de famille</span><span class="id-value">' + (state.surname || "—") + '</span></div>';
    html += '<div class="id-item"><span class="id-label">Âge</span><span class="id-value">' + age + ' ans</span></div>';
    html += '<div class="id-item"><span class="id-label">Année</span><span class="id-value">' + state.year + ' · ' + (state.birthYear || state.year) + '</span></div>';
    html += '<div class="id-item"><span class="id-label">Sexe</span><span class="id-value">' + sexeLabel + '</span></div>';
    html += '<div class="id-item"><span class="id-label">Tempérament</span><span class="id-value">' + traitLabel + '</span></div>';
    html += '<div class="id-item"><span class="id-label">Origine</span><span class="id-value">' + originLabel + '</span></div>';
    if (state.life) {
      html += '<div class="id-item"><span class="id-label">Destin</span><span class="id-value destiny">' + state.life + '</span></div>';
    }
    html += '</div></div>';

    // ── 2. STATISTIQUES PRINCIPALES ─────────────────────────
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

    // ── 3. CARRIÈRE & ÉTUDES ────────────────────────────────
    html += '<div class="stats-section"><h4>💼 Carrière & Études</h4>';
    if (state.career) {
      var track = window.VIE.getCareerTrack ? window.VIE.getCareerTrack(state.career.track) : null;
      if (track) {
        var lvl = track.levels[state.career.level];
        var satisfaction = window.VIE.engine.career ? window.VIE.engine.career.computeSatisfaction(state) : 0;
        html += '<div class="career-summary">';
        html += '<div class="career-role">' + lvl.name + '</div>';
        html += '<div class="career-track">' + track.name + ' · Niveau ' + (state.career.level + 1) + '/' + track.levels.length + '</div>';
        html += '<div class="career-satisfaction">Satisfaction : <span class="bar"><div class="bar-fill" style="width:' + satisfaction + '%"></div></span> ' + satisfaction + '%</div>';
        html += '<div class="career-money">Revenus estimés : ~' + window.VIE.util.formatMoney((lvl.salary[0] + lvl.salary[1]) / 2) + '/an</div>';
        html += '</div>';
      }
    } else {
      html += '<p class="empty">Aucune carrière pour l\'instant.</p>';
    }
    // Diplôme
    if (state.diplome) {
      var diplomes = { aucun: "Aucun", brevet: "Brevet", CAP_BEP: "CAP/BEP", bac: "Baccalauréat", "bac+2_3": "Bac+2/3", "bac+5": "Master", doctorat: "Doctorat" };
      html += '<p class="diplome">Diplôme : <strong>' + (diplomes[state.diplome] || state.diplome) + '</strong></p>';
    }
    // Compétences
    if (state.competences) {
      var compKeys = Object.keys(state.competences);
      if (compKeys.length) {
        html += '<div class="competences">';
        html += '<h5>Compétences</h5>';
        compKeys.forEach(function (c) {
          var v = state.competences[c] || 0;
          html += '<div class="skill"><span>' + c + '</span><span class="bar"><div class="bar-fill" style="width:' + Math.min(100, v) + '%"></div></span> ' + v + '</div>';
        });
        html += '</div>';
      }
    }
    html += '</div>';

    // ── 4. FINANCES PERSONNELLES ────────────────────────────
    html += '<div class="stats-section"><h4>💰 Finances</h4>';
    if (state.finance) {
      var netWorth = window.VIE.engine.finance ? window.VIE.engine.finance.getNetWorth(state) : (state.finance.compte || 0);
      var scoreCredit = state.finance.scoreCredit || 50;
      html += '<div class="fin-summary">';
      html += '<div class="fin-kpi"><span class="label">Épargne</span><span class="value">' + window.VIE.util.formatMoney(state.finance.compte || 0) + '</span></div>';
      html += '<div class="fin-kpi"><span class="label">Patrimoine net</span><span class="value ' + (netWorth >= 0 ? "pos" : "neg") + '">' + window.VIE.util.formatMoney(netWorth) + '</span></div>';
      html += '<div class="fin-kpi"><span class="label">Score crédit</span><span class="value">' + scoreCredit + '/100</span></div>';
      html += '</div>';
      // Dettes
      var dettes = state.finance.dettes || [];
      if (dettes.length) {
        html += '<p class="det-warning">⚠️ ' + dettes.length + ' dette(s) en cours</p>';
      }
      // Placements
      var inv = state.finance.placements || {};
      var hasInv = Object.keys(inv).some(function (k) { return inv[k] > 0; });
      if (hasInv) {
        html += '<div class="inv-summary">';
        Object.keys(inv).forEach(function (k) {
          if (inv[k] > 0) {
            var labels = { actions_etf: "Actions/ETF", crypto: "Crypto", immobilier_locatif: "Immo locatif", entreprise: "Entreprise" };
            html += '<span class="inv-chip">' + (labels[k] || k) + ' : ' + window.VIE.util.formatMoney(inv[k]) + '</span>';
          }
        });
        html += '</div>';
      }
    } else {
      html += '<p class="empty">Aucune donnée financière.</p>';
    }
    html += '</div>';

    // ── 5. RELATIONS PERSONNELLES ───────────────────────────
    html += '<div class="stats-section"><h4>👥 Relations</h4>';
    var people = Object.values(state.people || {}).filter(function (p) { return p.id !== "self" && p.vivant; });
    var liensSelf = [];
    people.forEach(function (p) {
      var lien = p.liens.find(function (l) { return l.id === "self"; });
      if (lien && lien.affection > 0) {
        liensSelf.push({ p: p, lien: lien });
      }
    });
    var nbAmis = liensSelf.filter(function (x) { return ["ami", "ami_proche", "meilleur_ami", "connaissance", "copain"].includes(x.lien.role); }).length;
    var nbAmour = liensSelf.filter(function (x) { return x.lien.role === "amour"; }).length;
    var nbFamille = liensSelf.filter(function (x) { return ["parent", "mere", "pere", "frere", "soeur", "enfant", "conjoint"].includes(x.lien.role); }).length;
    html += '<div class="rel-summary">';
    html += '<span class="rel-chip"><span class="rel-count">' + nbAmis + '</span> amis</span>';
    html += '<span class="rel-chip"><span class="rel-count">' + nbAmour + '</span> amour(s)</span>';
    html += '<span class="rel-chip"><span class="rel-count">' + nbFamille + '</span> famille</span>';
    html += '<span class="rel-chip"><span class="rel-count">' + liensSelf.length + '</span> proches</span>';
    html += '</div>';
    // Détail des 3 plus proches
    var topLiens = liensSelf.sort(function (a, b) { return (b.lien.affection || 0) - (a.lien.affection || 0); }).slice(0, 3);
    if (topLiens.length) {
      html += '<div class="top-relations">';
      topLiens.forEach(function (r) {
        html += '<div class="top-relation">';
        html += '<span class="rel-avatar">' + (r.p.prenom || "?")[0].toUpperCase() + '</span>';
        html += '<span class="rel-name">' + (r.p.prenom || "") + ' ' + (r.p.nom || "") + '</span>';
        html += '<span class="rel-affection">' + (r.lien.affection || 0) + '%</span>';
        html += '</div>';
      });
      html += '</div>';
    }
    html += '</div>';

    // ── 6. PASSIONS ─────────────────────────────────────────
    html += '<div class="stats-section"><h4>❤️ Passions</h4>';
    var passions = state.passions || {};
    var passionKeys = Object.keys(passions);
    if (passionKeys.length) {
      html += '<div class="passions-cloud">';
      passionKeys.forEach(function (k) {
        var v = passions[k];
        var cls = v >= 7 ? "high" : (v >= 4 ? "mid" : "low");
        var icons = { peinture: "🎨", musique: "🎵", ecriture: "✒️", sport: "🏃", cuisine: "🍳", technologie: "💻", nature: "🌲", theatre: "🎭", lecture: "📖", photo: "📸", voyage: "✈️", jardinage: "🌱", bricolage: "🔧", collection: "🗃️" };
        html += '<div class="passion-chip ' + cls + '"><span>' + (icons[k] || "⭐") + ' ' + k + '</span><span class="passion-lvl">Niv. ' + v + '</span></div>';
      });
      html += '</div>';
    } else {
      html += '<p class="empty">Aucune passion déclarée pour l\'instant.</p>';
    }
    html += '</div>';

    // ── 7. SANTÉ DÉTAILLÉE ──────────────────────────────────
    html += '<div class="stats-section"><h4>🩺 Santé</h4>';
    html += '<div class="health-grid">';
    html += '<div class="health-card"><h5>Physique</h5>';
    html += '<p>Santé : <span class="stat-val ' + (state.stats.sante >= 70 ? "good" : state.stats.sante >= 40 ? "mid" : "low") + '">' + state.stats.sante + '/100</span></p>';
    html += '<p>Énergie : <span class="stat-val ' + (state.stats.energie >= 70 ? "good" : state.stats.energie >= 40 ? "mid" : "low") + '">' + state.stats.energie + '/100</span></p>';
    if (me) {
      html += '<p>Conditions : ' + ((me.conditions && me.conditions.length) ? me.conditions.join(", ") : "Aucune") + '</p>';
      html += '<p>Autonomie : ' + Math.round(window.VIE.engine.health.computeAutonomy(me)) + '%</p>';
    }
    html += '</div>';
    html += '<div class="health-card"><h5>Mental</h5>';
    html += '<p>Stress : ' + (state.stats.stress || 0) + '/100</p>';
    html += '<p>Humeur : ' + Math.round((me && typeof me.humeur === "number" ? me.humeur : 50)) + '/100</p>';
    html += '<p>Réputation : ' + (state.stats.reputation || 0) + '/100</p>';
    html += '<p>Confiance en soi : ' + (state.stats.confiance || 0) + '/100</p>';
    if (state.flags.indexOf("therapie") !== -1) html += '<p>🧠 En thérapie</p>';
    html += '</div>';
    html += '</div></div>';

    // ── 8. HABITUDES & DÉPENDANCES ──────────────────────────
    html += '<div class="stats-section"><h4>🍷 Habitudes & Dépendances</h4><div class="habits-grid">';
    var habitLabels = { alcool: "🍷 Alcool", tabac: "🚬 Tabac", cannabis: "🌿 Cannabis", jeu: "🎰 Jeu", sport: "🏃 Sport", alimentation: "🍎 Alimentation", sommeil: "😴 Sommeil", ecrans: "📱 Écrans", soirees: "🎉 Soirées", voyages: "✈️ Voyages" };
    var habitKeys = Object.keys(state.habitudes || {});
    if (habitKeys.length) {
      habitKeys.forEach(function (h) {
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
    } else {
      html += '<p class="empty">Aucune donnée.</p>';
    }
    html += '</div></div>';

    // ── 9. PERSONNALITÉ (Big Five) ──────────────────────────
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
      html += '<p class="empty">Vous ne vous connaissez pas encore assez bien.</p>';
    }
    html += '</div>';

    // ── 10. VŒUX ACTIFS ─────────────────────────────────────
    if (state.wishes && state.wishes.length) {
      html += '<div class="stats-section"><h4>🎯 Vœux actifs</h4>';
      state.wishes.forEach(function (w) {
        html += '<div class="wish-card">';
        html += '<span class="wish-icon">🎯</span>';
        html += '<div class="wish-info">';
        html += '<span class="wish-title">' + w.label + '</span>';
        html += '<span class="wish-dur">Actif jusqu\'à l\'année ' + (w.yearStart + w.duration) + '</span>';
        html += '</div>';
        html += '</div>';
      });
      html += '</div>';
    }

    panel.innerHTML = html;

    // Dessiner radar personnalité
    var visible2 = window.VIE.engine.personality.getVisible(state);
    drawPersonalityRadar(visible2);
  }

  function drawPersonalityRadar(personality) {
    var container = document.getElementById("personality-radar");
    if (!container) return;
    var dims = ["O", "C", "E", "A", "N"];
    var w = 200, h = 200, cx = w/2, cy = h/2, r = 70;
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", w); svg.setAttribute("height", h);
    svg.style.margin = "0 auto";

    // Grilles concentriques
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
      var lx = cx + (r + 18) * Math.cos(angle);
      var ly = cy + (r + 18) * Math.sin(angle);
      var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", cx); line.setAttribute("y1", cy);
      line.setAttribute("x2", cx + r * Math.cos(angle)); line.setAttribute("y2", cy + r * Math.sin(angle));
      line.setAttribute("stroke", "#ddd"); svg.appendChild(line);
      var text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute("x", lx); text.setAttribute("y", ly);
      text.setAttribute("text-anchor", "middle"); text.setAttribute("font-size", "11"); text.setAttribute("fill", "var(--ink-soft)");
      text.textContent = window.VIE.config.personality.labels[d]; svg.appendChild(text);
    });

    // Polygone de la personnalité
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

  window.VIE = window.VIE || {};
  window.VIE.ui = window.VIE.ui || {};
  window.VIE.ui.statsView = { render: render };
})();