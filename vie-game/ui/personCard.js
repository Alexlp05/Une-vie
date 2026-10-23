/* ============================================================
   UNE VIE v0.5 — FICHE PERSONNE & LISTE PROCHES
   ============================================================ */

(function () {
  "use strict";

  var _selectedPersonId = null;

  // ── LISTE GROUPÉE (onglet Proches) ────────────────────────
  function renderList(state) {
    var panel = document.getElementById("panel-proches");
    if (!panel) return;

    var people = Object.values(state.people || {}).filter(function (p) { return p.vivant && p.id !== "self"; });

    // Sous-catégories par statut pour plus de granularité
    var statutAmour = ["crush", "flirt", "aventure", "relation", "couple_installe", "fiances", "marie", "ex", "separe", "divorce"];
    var statutAmi = ["connaissance", "copain", "ami", "ami_proche", "meilleur_ami", "ami_poison", "ex_ami", "rival"];
    var statutFamille = ["proche", "distants", "brouilles", "coupes", "reconcilles", "en_deuil"];

    var statutLabel = {
      // Amour
      crush: "💘 Crush", flirt: "😘 Flirt", aventure: "🔥 Aventure", relation: "💞 Relation",
      couple_installe: "💍 Couple installé", fiances: "💍 Fiançailles", marie: "👰 Marié(e)",
      ex: "💔 Ex", separe: "💔 Séparé(e)", divorce: "⚖️ Divorcé(e)",
      // Amitié
      connaissance: "👋 Connaissance", copain: "👥 Copain", ami: "🤝 Ami",
      ami_proche: "❤️ Ami proche", meilleur_ami: "💎 Meilleur ami",
      ami_poison: "☠️ Ami toxique", ex_ami: "💔 Ex-ami", rival: "⚔️ Rival",
      // Famille
      proche: "❤️ Proche", distants: "📏 Distant", brouilles: "⚡ Brouillé",
      coupes: "✂️ Coupé", reconcilles: "✨ Réconcilié", en_deuil: "🕯️ En deuil"
    };

    // Grouper par catégorie principale puis par statut
    var groups = {};

    people.forEach(function (p) {
      var lien = p.liens.find(function (l) { return l.id === "self"; }) || {};
      var role = lien.role || "";
      var statut = lien.statut || "";

      var cat = "autres";
      if (role === "famille" || ["parent", "mere", "pere", "frere", "soeur", "enfant", "conjoint", "ex", "grand_parent"].includes(role)) cat = "famille";
      else if (role === "amour") cat = "amour";
      else if (["ami", "ami_proche", "meilleur_ami", "connaissance", "copain"].includes(role)) cat = "amis";
      else if (["collegue", "superieur", "subordonne", "mentor", "associe", "client", "concurrent"].includes(role)) cat = "pro";

      if (!groups[cat]) groups[cat] = {};
      if (!groups[cat][statut]) groups[cat][statut] = [];
      groups[cat][statut].push({ p: p, lien: lien });
    });

    var groupLabels = { famille: "👨‍👩‍👧‍👦 Famille", amour: "💕 Amour", amis: "🤝 Amis", pro: "💼 Pro", autres: "🌐 Autres" };

    var html = "";

    // Ordre d'affichage des catégories
    var catOrder = ["famille", "amour", "amis", "pro", "autres"];

    catOrder.forEach(function (key) {
      var catGroups = groups[key];
      if (!catGroups) return;

      html += '<div class="people-group"><h4>' + groupLabels[key] + '</h4><div class="people-list">';

      // Ordre des statuts pour chaque catégorie
      var statutOrder = [];
      if (key === "amour") statutOrder = statutAmour;
      else if (key === "amis") statutOrder = statutAmi;
      else if (key === "famille") statutOrder = statutFamille;

      // Afficher les statuts dans l'ordre, puis les restants
      var displayedStatuts = [];
      statutOrder.forEach(function (s) {
        if (catGroups[s]) {
          displayedStatuts.push(s);
          html += renderStatutBlock(state, catGroups[s], s, statutLabel[s] || s);
        }
      });
      // Statuts non classés
      Object.keys(catGroups).forEach(function (s) {
        if (displayedStatuts.indexOf(s) < 0) {
          html += renderStatutBlock(state, catGroups[s], s, statutLabel[s] || s);
        }
      });

      html += '</div></div>';
    });

    panel.innerHTML = html || '<p class="empty">Aucune relation pour l\'instant.</p>';

    // Clic → fiche
    panel.querySelectorAll(".person-row").forEach(function (row) {
      row.addEventListener("click", function () { openPersonCard(this.dataset.personId); });
    });
  }

  function renderStatutBlock(state, items, statut, label) {
    if (!items || !items.length) return "";

    // Trier par affection décroissante
    items.sort(function (a, b) {
      return (b.lien.affection || 0) - (a.lien.affection || 0);
    });

    var html = "";
    html += '<div class="statut-block">';
    html += '<div class="statut-header"><span class="statut-title">' + label + '</span><span class="statut-count">(' + items.length + ')</span></div>';
    html += '<div class="people-list">';
    items.forEach(function (item) {
      var p = item.p;
      var lien = item.lien;
      var age = state.year - p.naissance;
      var affection = lien.affection || 0;
      var tension = lien.tension || 0;
      var traits = (p.traits || []).slice(0, 3).map(function (t) { return '<span class="trait-tag">' + t + '</span>'; }).join("");
      var alertClass = tension > 50 ? "alert" : (p.humeur < 30 ? "low-mood" : "");
      html += '<div class="person-row ' + alertClass + '" data-person-id="' + p.id + '">';
      html += '<span class="person-avatar">' + (p.prenom || "?")[0].toUpperCase() + '</span>';
      html += '<div class="person-info">';
      html += '<span class="person-name">' + (p.prenom || "") + ' ' + (p.nom || "") + '</span>';
      html += '<span class="person-meta">' + age + ' ans · ' + (p.metier || "") + ' · ' + (statut || "") + '</span>';
      html += '<div class="person-bars">';
      html += '<div class="bar"><div class="bar-fill affection" style="width:' + affection + '%"></div></div>';
      if (lien.attraction) html += '<div class="bar"><div class="bar-fill attraction" style="width:' + lien.attraction + '%"></div></div>';
      if (tension > 30) html += '<div class="bar"><div class="bar-fill tension" style="width:' + tension + '%"></div></div>';
      html += '</div>';
      html += '<div class="person-traits">' + traits + '</div>';
      html += '</div></div>';
    });
    html += '</div></div>';
    return html;
  }

  // ── FICHE PERSONNE (modale détaillée) ───────────────────────
  function openPersonCard(personId) {
    _selectedPersonId = personId;
    var state = window.VIE.engine.state.get();
    var person = state.people[personId];
    if (!person) return;

    var modal = document.getElementById("person-modal");
    if (!modal) { createModal(); modal = document.getElementById("person-modal"); }

    renderDetailedPersonCard(person, state);
    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  }

  function closePersonCard() {
    var modal = document.getElementById("person-modal");
    if (modal) modal.classList.add("hidden");
    document.body.style.overflow = "";
    _selectedPersonId = null;
  }

  function createModal() {
    var modal = document.createElement("div");
    modal.id = "person-modal";
    modal.className = "modal hidden";
    modal.innerHTML = '<div class="modal-backdrop" onclick="window.VIE.ui.personCard.close()"></div><div class="modal-content" id="person-card-content"></div>';
    document.body.appendChild(modal);
    // Styles injectés si pas dans CSS
    if (!document.getElementById("person-modal-styles")) {
      var style = document.createElement("style");
      style.id = "person-modal-styles";
      style.textContent = `
        .modal { position: fixed; inset: 0; z-index: 100; display: flex; align-items: center; justify-content: center; }
        .modal.hidden { display: none; }
        .modal-backdrop { position: absolute; inset: 0; background: rgba(0,0,0,0.5); }
        .modal-content { background: var(--card); border: 1px solid #e2d5b6; border-radius: var(--radius); box-shadow: var(--shadow); max-width: 500px; width: 90%; max-height: 85vh; overflow-y: auto; position: relative; z-index: 1; padding: 24px; }
        .person-header { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
        .person-avatar-large { width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, var(--gold), var(--gold-soft)); display: flex; align-items: center; justify-content: center; font-size: 2rem; color: #fff; font-weight: bold; }
        .person-title h3 { font-size: 1.3rem; color: var(--ink); }
        .person-title .meta { font-size: 0.85rem; color: var(--ink-soft); }
        .person-status { display: flex; gap: 8px; flex-wrap: wrap; margin: 8px 0; }
        .status-badge { font-size: 0.7rem; padding: 2px 8px; border-radius: 999px; background: var(--paper-2); color: var(--ink-soft); }
        .status-badge.amour { background: #f7e3ec; color: #b3547a; }
        .status-badge.famille { background: #e3efe6; color: var(--green); }
        .person-bars { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin: 12px 0; }
        .bar { height: 8px; background: var(--paper-2); border-radius: 999px; overflow: hidden; }
        .bar-fill { height: 100%; border-radius: 999px; transition: width 0.3s; }
        .bar-fill.affection { background: var(--green); }
        .bar-fill.confiance { background: var(--blue); }
        .bar-fill.respect { background: var(--gold); }
        .bar-fill.attraction { background: #b3547a; }
        .bar-fill.tension { background: var(--blood); }
        .bar-label { font-size: 0.7rem; color: var(--ink-soft); margin-bottom: 2px; display: flex; justify-content: space-between; }
        .person-section { margin: 16px 0; }
        .person-section h4 { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; color: var(--gold); margin-bottom: 8px; }
        .trait-tag { display: inline-block; font-size: 0.65rem; padding: 2px 6px; border-radius: 999px; background: var(--paper-2); color: var(--ink-soft); margin: 2px; }
        .interaction-btn { width: 100%; text-align: left; padding: 10px 12px; margin: 4px 0; background: var(--paper); border: 1px solid #d8c9a8; border-radius: 8px; cursor: pointer; font-family: inherit; font-size: 0.9rem; }
        .interaction-btn:hover { border-color: var(--gold); background: #fff8e6; }
        .interaction-btn.disabled { opacity: 0.5; cursor: not-allowed; }
        .person-family { font-size: 0.85rem; color: var(--ink-soft); }
        .person-family a { color: var(--gold); text-decoration: none; }
        .person-history { max-height: 150px; overflow-y: auto; font-size: 0.8rem; color: var(--ink-soft); }
        .person-history .entry { padding: 4px 0; border-bottom: 1px dashed #e2d5b6; }
        .modal-close { position: absolute; top: 12px; right: 16px; background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--ink-soft); }
      `;
      document.head.appendChild(style);
    }
  }

  function renderPersonCard(person, state) {
    var content = document.getElementById("person-card-content");
    if (!content) return;

    var lien = person.liens.find(function (l) { return l.affection > 0; }) || {};
    var age = state.year - person.naissance;
    var compat = window.VIE.engine.relations.compatibility(state, person, lien.role === "amour" ? "amour" : "amitie");

    var html = '<button class="modal-close" onclick="window.VIE.ui.personCard.close()">&times;</button>';
    html += '<div class="person-header">';
    html += '<div class="person-avatar-large">' + (person.prenom || "?")[0].toUpperCase() + '</div>';
    html += '<div class="person-title"><h3>' + (person.prenom || "") + ' ' + (person.nom || "") + '</h3>';
    html += '<div class="meta">' + age + ' ans · ' + (person.sexe === "femme" ? "♀" : "♂") + ' · ' + (person.metier || "—") + ' · ' + (person.ville || "—") + '</div></div>';
    html += '<div class="person-status">';
    var statusLabels = { famille: "Famille", amour: "Amour", ami: "Ami", ami_proche: "Ami proche", meilleur_ami: "Meilleur ami", collegue: "Collègue", superieur: "Supérieur", conjoint: "Conjoint", ex: "Ex" };
    (person.liens || []).forEach(function (l) {
      if (l.affection > 0) html += '<span class="status-badge ' + (l.role === "amour" ? "amour" : l.role === "famille" ? "famille" : "") + '">' + (statusLabels[l.role] || l.role) + ' · ' + l.statut + '</span>';
    });
    html += '</div></div>';

    // Jauges
    html += '<div class="person-section"><h4>Relation</h4><div class="person-bars">';
    var bars = [
      { key: "affection", label: "Affection", val: lien.affection || 0, class: "affection" },
      { key: "confiance", label: "Confiance", val: lien.confiance || 0, class: "confiance" },
      { key: "respect", label: "Respect", val: lien.respect || 0, class: "respect" }
    ];
    if (lien.attraction) bars.push({ key: "attraction", label: "Attirance", val: lien.attraction, class: "attraction" });
    if (lien.tension > 0) bars.push({ key: "tension", label: "Tension", val: lien.tension, class: "tension" });
    bars.forEach(function (b) {
      html += '<div class="bar"><div class="bar-label"><span>' + b.label + '</span><span>' + b.val + '%</span></div>';
      html += '<div class="bar-fill ' + b.class + '" style="width:' + b.val + '%"></div></div>';
    });
    html += '</div></div>';

    // Compatibilité détaillée
    html += '<div class="person-section"><h4>Compatibilité (' + compat.score + '%)</h4>';
    compat.details.forEach(function (d) {
      var cls = d.type === "dealbreaker" ? "style='color:var(--blood)'" : (d.type.includes("commun") || d.type === "similarite" ? "style='color:var(--green)'" : d.type === "difference" ? "style='color:var(--blood)'" : "");
      html += '<div ' + cls + '>• ' + d.txt + '</div>';
    });
    html += '</div>';

    // Radar de compatibilité mini
    if (window.VIE.engine.relations.compatibility) {
      html += '<div class="person-section"><h4>Profil comparé</h4><div class="mini-radar" id="compat-radar-' + person.id + '"></div></div>';
    }

    // Personnalité connue
    var knownTraits = (person.traits || []).slice(0, window.VIE.engine.personality.getVisibleTraits(state).length || person.traits.length);
    html += '<div class="person-section"><h4>Personnalité</h4>';
    html += '<div class="traits">' + knownTraits.map(function (t) { return '<span class="trait-tag">' + t + '</span>'; }).join("") + '</div>';
    if (knownTraits.length < (person.traits || []).length) html += '<span class="trait-tag" style="opacity:0.5">???</span>';
    html += '</div>';

    // Famille (mini-arbre cliquable)
    html += '<div class="person-section"><h4>Famille</h4><div class="person-family">';
    (person.famille || []).forEach(function (f) {
      var fp = state.people[f.id];
      if (fp) html += '<a href="#" onclick="event.stopPropagation(); window.VIE.ui.personCard.open(\'' + fp.id + '\')">' + fp.prenom + '</a> (' + f.relation + ')<br>';
    });
    html += '</div></div>';

    // Actions disponibles
    var interactions = window.VIE.engine.interactions.forPerson(state, person.id);
    if (interactions.length) {
      html += '<div class="person-section"><h4>Actions</h4>';
      interactions.forEach(function (i) {
        var disabled = (state.tempsSocial || 0) < (i.cout || 1) ? "disabled" : "";
        var cost = i.coutArgent ? ' (💰 ' + Math.round((i.coutArgent[0] + i.coutArgent[1]) / 2) + '€)' : '';
        html += '<button class="interaction-btn ' + disabled + '" data-action="' + i.id + '" data-person="' + person.id + '" ' + (disabled ? 'disabled' : '') + '>' + i.text + cost + '</button>';
      });
      html += '</div>';
    }

    // Historique
    html += '<div class="person-section"><h4>Historique</h4><div class="person-history">';
    (person.histoire || []).slice(-10).reverse().forEach(function (h) {
      html += '<div class="entry"><span class="age">[' + h.age + ' ans]</span> ' + h.texte + '</div>';
    });
    html += '</div></div>';

    content.innerHTML = html;

    // Dessiner mini-radar de compatibilité
    if (window.VIE.engine.relations.compatibility) {
      var compatMini = window.VIE.engine.relations.compatibility(state, person, lien.role === "amour" ? "amour" : "amitie");
      drawMiniRadar("compat-radar-" + person.id, compatMini);
    }

    // Bind actions
    content.querySelectorAll(".interaction-btn:not(.disabled)").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var res = window.VIE.engine.interactions.execute(this.dataset.action, this.dataset.person);
        if (res.success) {
          window.VIE.ui.render.renderAll();
          renderPersonCard(person, state); // refresh
        } else {
          alert(res.text);
        }
      });
    });
  }

  function drawMiniRadar(containerId, compat) {
    var container = document.getElementById(containerId);
    if (!container) return;
    var dims = ["O", "C", "E", "A", "N"];
    var w = 150, h = 150, cx = w/2, cy = h/2, r = 50;
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", w); svg.setAttribute("height", h);
    svg.style.margin = "0 auto";

    // Grilles
    for (var i = 1; i <= 3; i++) {
      var rr = r * i / 3;
      var circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("cx", cx); circle.setAttribute("cy", cy); circle.setAttribute("r", rr);
      circle.setAttribute("fill", "none"); circle.setAttribute("stroke", "#eee");
      svg.appendChild(circle);
    }

    // Axes
    dims.forEach(function (d, i) {
      var angle = -Math.PI/2 + i * 2*Math.PI/dims.length;
      var lx = cx + (r + 12) * Math.cos(angle);
      var ly = cy + (r + 12) * Math.sin(angle);
      var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", cx); line.setAttribute("y1", cy);
      line.setAttribute("x2", cx + r * Math.cos(angle)); line.setAttribute("y2", cy + r * Math.sin(angle));
      line.setAttribute("stroke", "#ddd"); svg.appendChild(line);
      var text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute("x", lx); text.setAttribute("y", ly); text.setAttribute("text-anchor", "middle"); text.setAttribute("font-size", "9"); text.setAttribute("fill", "var(--ink-soft)");
      text.textContent = window.VIE.config.personality.labels[d]; svg.appendChild(text);
    });

    // Polygone joueur
    var player = { O: 50, C: 50, E: 50, A: 50, N: 50 }; // simplified
    var pointsP = dims.map(function (d, i) {
      var angle = -Math.PI/2 + i * 2*Math.PI/dims.length;
      var val = 50; // placeholder
      var rr = r * val / 100;
      return (cx + rr * Math.cos(angle)) + "," + (cy + rr * Math.sin(angle));
    }).join(" ");

    var polyP = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    polyP.setAttribute("points", pointsP);
    polyP.setAttribute("fill", "rgba(184,134,11,0.2)");
    polyP.setAttribute("stroke", "var(--gold)");
    polyP.setAttribute("stroke-width", "1.5");
    svg.appendChild(polyP);

    // Polygone personne
    var pointsPe = dims.map(function (d, i) {
      var angle = -Math.PI/2 + i * 2*Math.PI/5;
      var val = 50; // simplified
      var rr = r * val / 100;
      return (cx + rr * Math.cos(angle)) + "," + (cy + rr * Math.sin(angle));
    }).join(" ");

    var polyPe = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    polyPe.setAttribute("points", pointsPe);
    polyPe.setAttribute("fill", "rgba(179,84,122,0.2)");
    polyPe.setAttribute("stroke", "#b3547a");
    polyPe.setAttribute("stroke-width", "1.5");
    svg.appendChild(polyPe);

    container.innerHTML = "";
    container.appendChild(svg);
  }

  window.VIE = window.VIE || {};
  window.VIE.ui = window.VIE.ui || {};
  window.VIE.ui.personCard = { renderList: renderList, open: openPersonCard, close: closePersonCard, render: renderPersonCard };
})();