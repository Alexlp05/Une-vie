/* ============================================================
   UNE VIE v0.7 — VUE CARRIÈRE (parcours, compétences, offres)
   ============================================================ */

(function () {
  "use strict";

  function render(state) {
    var panel = document.getElementById("panel-carriere");
    if (!panel) return;

    if (!state.career) {
      panel.innerHTML = '<div class="empty"><h4>Aucune carrière</h4><p>Vous n\'avez pas encore commencé votre vie professionnelle.</p><button class="btn btn-primary" onclick="window.VIE.ui.careerView.openJobSearch()">🔍 Chercher un emploi</button></div>';
      return;
    }

    var track = window.VIE.getCareerTrack(state.career.track);
    if (!track) { panel.innerHTML = '<p class="error">Carrière inconnue</p>'; return; }
    var lvl = track.levels[state.career.level];
    var satisfaction = window.VIE.engine.career.computeSatisfaction(state);
    var lifestyle = window.VIE.engine.career.computeLifestyle(state);

    var html = '';

    // En-tête
    html += '<div class="career-header">';
    html += '<h3>' + lvl.name + '</h3>';
    html += '<span class="career-track">' + track.name + ' · Niveau ' + (state.career.level + 1) + '/' + track.levels.length + '</span>';
    html += '<div class="career-satisfaction">Satisfaction : <span class="bar"><div class="bar-fill" style="width:' + satisfaction + '%"></div></span> ' + satisfaction + '%</div>';
    html += '</div>';

    // Salaire & progression
    html += '<div class="career-grid">';
    html += '<div class="career-card"><h4>💰 Rémunération</h4>';
    html += '<p>Brut annuel : ' + window.VIE.util.formatMoney((lvl.salary[0] + lvl.salary[1]) / 2) + '</p>';
    html += '<p>Mensuel net estimé : ' + window.VIE.util.formatMoney(((lvl.salary[0] + lvl.salary[1]) / 2) * 0.78 / 12) + '</p>';
    if (state.career.level + 1 < track.levels.length) {
      var next = track.levels[state.career.level + 1];
      html += '<p class="next">Prochain niveau : ' + next.name + ' (' + window.VIE.util.formatMoney((next.salary[0] + next.salary[1]) / 2) + ')</p>';
    }
    html += '</div>';

    html += '<div class="career-card"><h4>📈 Progression</h4>';
    var req = lvl.req || {};
    if (Object.keys(req).length) {
      html += '<p>Compétences requises pour le niveau suivant :</p><ul>';
      Object.keys(req).forEach(function (k) {
        var current = state.competences[k] || 0;
        var needed = req[k];
        var pct = Math.min(100, Math.round(current / needed * 100));
        html += '<li>' + k + ' : ' + current + '/' + needed + ' <span class="bar"><div class="bar-fill" style="width:' + pct + '%"></div></span></li>';
      });
      html += '</ul>';
    } else {
      html += '<p>Aucun prérequis de compétence pour ce niveau.</p>';
    }
    html += '</div>';
    html += '</div>';

    // Compétences globales
    html += '<div class="career-section"><h4>🧠 Compétences</h4><div class="skills-grid">';
    var allSkills = ["technique", "relationnel", "management", "creativite", "rigueur", "langues", "manuel", "physique"];
    allSkills.forEach(function (s) {
      var val = state.competences[s] || 0;
      if (val > 0) {
        html += '<div class="skill"><span>' + s + '</span><span class="bar"><div class="bar-fill" style="width:' + Math.min(100, val) + '%"></div></span> ' + val + '</div>';
      }
    });
    html += '</div></div>';

    // Diplôme
    html += '<div class="career-section"><h4>🎓 Diplôme</h4>';
    var diplomes = ["aucun", "brevet", "CAP_BEP", "bac", "bac+2_3", "bac+5", "doctorat"];
    var labels = { aucun: "Aucun", brevet: "Brevet", CAP_BEP: "CAP/BEP", bac: "Baccalauréat", "bac+2_3": "Bac+2/3", "bac+5": "Master", doctorat: "Doctorat" };
    html += '<p>Niveau : <strong>' + (labels[state.diplome] || state.diplome) + '</strong></p>';
    if (state.etudes && state.etudes.enCours) {
      html += '<p class="studying">📚 Études en cours : ' + state.etudes.filiere + ' (vise ' + (state.etudes.diplomeVise || "") + ')</p>';
    }
    html += '</div>';

    // Style de vie
    var lifestyle = window.VIE.engine.career.computeLifestyle(state);
    var lifestyleLabels = {
      entrepreneur_serie: "🚀 Entrepreneur en série",
      militant: "🏛️ Militant / Politique",
      nomade_digital: "🌍 Nomade digital",
      artiste_fauche: "🎨 Artiste fauché",
      athlete_pro: "⚽ Athlète professionnel",
      enseignant_dedie: "🏫 Enseignant dévoué",
      soignant_dedie: "🏥 Soignant dévoué",
      entrepreneur: "🚀 Entrepreneur",
      freelance: "🎨 Freelance / Artiste",
      carrieriste_acharne: "💼 Carriériste acharné",
      parent_au_foyer: "👨‍👩‍👧‍👦 Parent au foyer",
      debutant: "🌱 Débutant",
      burnout_risque: "⚠️ Risque de burn-out",
      epanoui: "✨ Épanoui professionnellement",
      employe_standard: "👔 Employé standard",
      sans_emploi: "🔍 Sans emploi",
      inconnu: "❓ Inconnu"
    };
    html += '<div class="career-section"><h4>🎭 Style de vie</h4>';
    html += '<p class="lifestyle-badge">' + (lifestyleLabels[lifestyle] || lifestyle) + '</p>';
    html += '</div>';

    // Collègues clés (PNJ liés pro)
    var colleagues = Object.values(state.people).filter(function (p) {
      return p.liens.some(function (l) { return ["collegue", "superieur", "subordonne", "mentor", "associe", "client", "concurrent"].includes(l.role); });
    });
    if (colleagues.length) {
      html += '<div class="career-section"><h4>🤝 Relations professionnelles</h4><div class="people-mini">';
      colleagues.slice(0, 6).forEach(function (c) {
        var lien = c.liens.find(function (l) { return ["collegue", "superieur", "subordonne", "mentor", "associe"].includes(l.role); });
        if (lien) {
          html += '<div class="person-mini" data-person="' + c.id + '">';
          html += '<span class="avatar">' + (c.prenom || "?")[0].toUpperCase() + '</span>';
          html += '<span class="name">' + (c.prenom || "") + '</span>';
          html += '<span class="role">' + lien.role + '</span>';
          html += '<span class="affection">' + (lien.affection || 0) + '%</span>';
          html += '</div>';
        }
      });
      html += '</div></div>';
    }

    // Actions
    html += '<div class="career-actions">';
    html += '<button class="btn btn-secondary" onclick="window.VIE.ui.careerView.openJobSearch()">🔍 Chercher un emploi</button>';
    html += '<button class="btn btn-secondary" onclick="window.VIE.ui.careerView.openFormation()">📚 Formation continue</button>';
    if (window.VIE.engine.career.canReconvert(state)) html += '<button class="btn btn-warning" onclick="window.VIE.ui.careerView.openReconversion()">🔄 Reconversion</button>';
    if (state.career.level + 1 < track.levels.length) html += '<button class="btn btn-primary" onclick="window.VIE.ui.careerView.askPromotion()">⬆ Demander promotion</button>';
    html += '</div>';

    panel.innerHTML = html;

    // Bind mini fiches
    panel.querySelectorAll(".person-mini").forEach(function (el) {
      el.addEventListener("click", function () { window.VIE.ui.personCard.open(this.dataset.person); });
    });
  }

  // Stubs actions
  function openJobSearch() { alert("Recherche d'emploi : à implémenter"); }
  function openFormation() { alert("Formation continue : à implémenter"); }
  function openReconversion() { alert("Reconversion : à implémenter"); }
  function askPromotion() {
    var state = window.VIE.engine.state.get();
    if (!state.career) return;
    window.VIE.engine.career.checkPromotion(state);
    window.VIE.ui.render.renderAll();
  }

  window.VIE = window.VIE || {};
  window.VIE.ui = window.VIE.ui || {};
  window.VIE.ui.careerView = { render: render, openJobSearch: openJobSearch, openFormation: openFormation, openReconversion: openReconversion, askPromotion: askPromotion };
})();