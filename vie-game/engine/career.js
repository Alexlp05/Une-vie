/* ============================================================
   UNE VIE v0.7 — CAREER MANAGER
   Études, diplômes, compétences, reconversion, événements pro
   ============================================================ */

(function () {
  "use strict";

  // ── PARCOURS SCOLAIRE ────────────────────────────────────
  function startEducation(state, filiere) {
    // filiere: "general", "techno", "pro", "apprentissage"
    state.etudes = {
      enCours: true,
      filiere: filiere,
      anneeDebut: state.year,
      niveau: "secondaire",
      notes: generateNotes(state, filiere),
      redoublements: 0
    };
    // Ajuste actions/an pendant études
    state.maxActionsThisYear = 2; // moins de temps libre
  }

  function generateNotes(state, filiere) {
    var base = 10 + (state.stats.intelligence || 50) * 0.1;
    var mod = state.personality.C * 0.05;
    var notes = {};
    ["maths", "francais", "langues", "sciences", "specialite"].forEach(function (m) {
      notes[m] = Math.round(clamp(base + mod + (Math.random() - 0.5) * 4, 0, 20));
    });
    return notes;
  }

  function advanceEducation(state) {
    if (!state.etudes || !state.etudes.enCours) return;

    var age = state.age;
    var filiere = state.etudes.filiere;

    // Orientation post-bac (18 ans)
    if (age === 18) {
      var bacReussi = passBac(state);
      if (bacReussi) {
        state.diplome = "bac";
        chooseHigherEducation(state);
      } else {
        state.diplome = state.etudes.redoublements > 0 ? "brevet" : "aucun";
        state.etudes.enCours = false;
        enterWorkforce(state);
      }
    }
    // Études supérieures
    else if (age > 18 && age < 26 && state.etudes.niveau === "superieur") {
      if (Math.random() < 0.15) { // abandon
        state.etudes.enCours = false;
        enterWorkforce(state);
      } else if (age >= 22 && Math.random() < 0.3) { // diplomation
        graduateHigherEducation(state);
      }
    }
  }

  function passBac(state) {
    var notes = state.etudes.notes || {};
    var moy = Object.values(notes).reduce(function (a, b) { return a + b; }, 0) / Object.keys(notes).length;
    return moy >= 10 || Math.random() < 0.1; // 10% rattrapage
  }

  function chooseHigherEducation(state) {
    var intelligence = state.stats.intelligence || 50;
    var personality = state.personality;
    var argent = state.finance.compte;

    var choices = [
      { filiere: "universite", diplome: "bac+2_3", cout: 2000, reqInt: 40 },
      { filiere: "ecole_commerce", diplome: "bac+5", cout: 15000, reqInt: 60 },
      { filiere: "ecole_ingenieur", diplome: "bac+5", cout: 8000, reqInt: 70 },
      { filiere: "medecine", diplome: "doctorat", cout: 5000, reqInt: 75 },
      { filiere: "droit", diplome: "bac+5", cout: 3000, reqInt: 55 },
      { filiere: "art", diplome: "bac+5", cout: 4000, reqInt: 40 },
      { filiere: "bts_iut", diplome: "bac+2_3", cout: 1000, reqInt: 35 }
    ];

    var available = choices.filter(function (c) {
      return intelligence >= c.reqInt && (argent >= c.cout || Math.random() < 0.7); // bourse possible
    });

    if (!available.length) { enterWorkforce(state); return; }

    // Choix pondéré par personnalité
    var weights = available.map(function (c) {
      var w = 1;
      if (c.filiere.includes("ingenieur") && personality.O > 60) w *= 2;
      if (c.filiere === "medecine" && personality.A > 60) w *= 2;
      if (c.filiere === "art" && personality.O > 70) w *= 2;
      if (c.filiere === "ecole_commerce" && personality.E > 60) w *= 1.5;
      return { item: c, weight: w };
    });
    var chosen = weightedPick(weights);
    state.etudes = {
      enCours: true,
      filiere: chosen.filiere,
      niveau: "superieur",
      anneeDebut: state.year,
      diplomeVise: chosen.diplome,
      coutAnnuel: chosen.cout
    };
    state.finance.compte -= chosen.cout;
    state.maxActionsThisYear = 1; // études = peu de temps libre
  }

  function graduateHigherEducation(state) {
    var dip = state.etudes.diplomeVise || "bac+2_3";
    state.diplome = dip;
    state.etudes.enCours = false;
    state.maxActionsThisYear = getActionsForAge(state.age);

    // Bonus compétences selon filière
    var competences = {
      universite: { technique: 10, rigueur: 10 },
      ecole_commerce: { relationnel: 15, management: 10, langues: 10 },
      ecole_ingenieur: { technique: 20, rigueur: 15, creativite: 5 },
      medecine: { technique: 25, rigueur: 20, relationnel: 10 },
      droit: { rigueur: 20, relationnel: 10 },
      art: { creativite: 20, relationnel: 10 },
      bts_iut: { technique: 15, manuel: 10 }
    };
    var boost = competences[state.etudes.filiere] || {};
    Object.keys(boost).forEach(function (k) {
      state.competences[k] = (state.competences[k] || 0) + boost[k];
    });
  }

  function enterWorkforce(state) {
    state.etudes.enCours = false;
    state.maxActionsThisYear = getActionsForAge(state.age);
    // Premier job selon diplôme
    var firstJobs = {
      aucun: ["Ouvrier(ère)", "Employé(e) commerce", "Serveur(se)", "Aide à domicile"],
      brevet: ["Ouvrier(ère) qualifié(e)", "Secrétaire", "Agent d'entretien"],
      CAP_BEP: ["Artisan", "Technicien(ne) maintenance", "Cuisinier(ère)", "Électricien(ne)"],
      bac: ["Agent administratif", "Vendeur(se)", "Assistant(e) RH", "Développeur(se) junior"],
      "bac+2_3": ["Technicien(ne) supérieur(e)", "Chargé(e) clientèle", "Infirmier(ère)", "Développeur(se)"],
      "bac+5": ["Cadre junior", "Ingénieur(e)", "Avocat(e) collaborateur(trice)", "Consultant(e)"],
      doctorat: ["Chercheur(se)", "Enseignant(e)-chercheur(se)", "Médecin interne"]
    };
    var jobs = firstJobs[state.diplome] || firstJobs.bac;
    var job = jobs[Math.floor(Math.random() * jobs.length)];
    // Mapper vers carrière
    var careerMap = {
      "Ingénieur(e)": "tech", "Développeur(se)": "tech", "Développeur(se) junior": "tech",
      "Cadre junior": "finance", "Consultant(e)": "finance",
      "Infirmier(ère)": "sante", "Médecin interne": "sante",
      "Avocat(e) collaborateur(trice)": "droit",
      "Enseignant(e)-chercheur(se)": "education", "Chercheur(se)": "recherche",
      "Artisan": "artisanat_btp", "Cuisinier(ère)": "restauration",
      "Serveur(se)": "restauration", "Vendeur(se)": "commerce",
      "Agent administratif": "fonction_publique", "Assistant(e) RH": "fonction_publique"
    };
    var track = careerMap[job] || "commerce";
    startCareer(state, track, 0);
  }

  // ── DÉMARRAGE CARRIÈRE ───────────────────────────────────
  function startCareer(state, trackId, level) {
    var track = window.VIE.getCareerTrack(trackId);
    if (!track) return false;
    state.career = {
      track: trackId,
      level: level || 0,
      sinceAge: state.age,
      diplome: state.diplome,
      competences: {},
      satisfaction: 50
    };
    // Compétences de base selon track
    var baseComp = track.levels[0].req || {};
    Object.keys(baseComp).forEach(function (k) {
      state.competences[k] = Math.max(state.competences[k] || 0, baseComp[k]);
    });
    return true;
  }

  // ── PROMOTION / AVANCEMENT ───────────────────────────────
  function checkPromotion(state) {
    if (!state.career) return;
    var track = window.VIE.getCareerTrack(state.career.track);
    if (!track) return;
    var nextLevel = state.career.level + 1;
    if (nextLevel >= track.levels.length) return; // max level

    var req = track.levels[nextLevel].req || {};
    var ok = Object.keys(req).every(function (k) {
      return (state.competences[k] || 0) >= req[k];
    });

    // Âge minimum
    var minAge = track.levels[nextLevel].minAge || 0;
    if (state.age < minAge) ok = false;

    // aléa + relation avec supérieur
    var superior = getSuperieur(state);
    var relationBonus = superior ? (superior.liens.find(function(l){return l.id===state.name;})?.respect || 0) / 100 * 0.3 : 0;
    var chance = ok ? 0.4 + relationBonus : 0.05;

    if (Math.random() < chance) {
      state.career.level = nextLevel;
      state.career.satisfaction = Math.min(100, state.career.satisfaction + 10);
      state.history.push({ age: state.age, year: state.year, title: "Promotion !", result: "Vous devenez " + track.levels[nextLevel].name, type: "carriere" });
    }
  }

  function getSuperieur(state) {
    // Trouver un PNJ supérieur dans la même carrière
    return Object.values(state.people).find(function (p) {
      return p.liens.some(function (l) { return l.role === "superieur" && l.id === state.name; });
    });
  }

  // ── RECONVERSION ─────────────────────────────────────────
  function canReconvert(state) {
    return state.age >= 30 && state.age <= 50 && state.career && state.career.level >= 1;
  }

  function reconvert(state, newTrackId) {
    var track = window.VIE.getCareerTrack(newTrackId);
    if (!track) return false;
    // Coût : perte niveau, formation
    var lostLevels = Math.min(2, state.career.level);
    state.career.track = newTrackId;
    state.career.level = Math.max(0, state.career.level - lostLevels);
    state.career.sinceAge = state.age;
    state.career.satisfaction = 40;
    state.flags.push("reconversion");
    state.finance.compte -= 5000; // coût formation
    state.history.push({ age: state.age, year: state.year, title: "Reconversion", result: "Vous changez de voie pour " + track.name, type: "carriere" });
    return true;
  }

  // ── FORMATION CONTINUE ───────────────────────────────────
  function formationContinue(state, competence, dureeMois) {
    if (state.finance.compte < dureeMois * 500) return false;
    state.finance.compte -= dureeMois * 500;
    var gain = dureeMois * 2;
    state.competences[competence] = (state.competences[competence] || 0) + gain;
    state.history.push({ age: state.age, year: state.year, title: "Formation", result: "Vous vous formez en " + competence + " (+ " + gain + ")", type: "formation" });
    return true;
  }

  // ── SATISFACTION AU TRAVAIL ──────────────────────────────
  function computeJobSatisfaction(state) {
    if (!state.career) return 50;
    var track = window.VIE.getCareerTrack(state.career.track);
    if (!track) return 50;
    var lvl = track.levels[state.career.level];
    var base = lvl.satisfaction || 50;
    // Ajustements
    var stress = lvl.stress || 50;
    var workload = (state.personality.C > 60 ? -5 : 0) + (state.personality.N > 60 ? -10 : 0);
    var relationSuperieur = getSuperieur(state);
    var relBonus = relationSuperieur ? (relationSuperieur.liens.find(function(l){return l.id===state.name;})?.respect || 0) / 10 : 0;
    return clamp(base - stress * 0.3 + workload + relBonus, 0, 100);
  }

  // ── STYLE DE VIE ─────────────────────────────────────────
  function computeLifestyle(state) {
    if (!state.career) return "sans_emploi";

    var track = window.VIE.getCareerTrack(state.career.track);
    if (!track) return "inconnu";

    var lvl = track.levels[state.career.level] || track.levels[0];
    var stress = lvl.stress || 50;
    var satisfaction = lvl.satisfaction || 50;
    var salary = (lvl.salary[0] + lvl.salary[1]) / 2;

    // Détermination du style
    if (state.career.track === "entrepreneuriat" && state.career.level >= 2) return "entrepreneur_serie";
    if (state.career.track === "politique" && state.career.level >= 2) return "militant";
    if (state.career.track === "freelance" && state.career.level >= 2) return "nomade_digital";
    if (state.career.track === "sport_pro" && state.career.level >= 1) return "athlete_pro";
    if (state.career.track === "arts_culture" && state.career.level >= 1) return "artiste_fauche";
    if (state.career.track === "education" && state.career.level >= 2) return "enseignant_dedie";
    if (state.career.track === "sante" && state.career.level >= 2) return "soignant_dedie";
    if (state.career.track === "entrepreneuriat" && state.career.level >= 1) return "entrepreneur";
    if (state.career.track === "freelance") return "freelance";
    if (salary > 80000 && state.career.level >= 3) return "carrieriste_acharne";
    if (state.people && Object.values(state.people).some(function(p){return p.liens.some(function(l){return l.role==="enfant"&&l.affection>50;});})) {
      if (state.career.level <= 1) return "parent_au_foyer";
    }
    if (state.career.level === 0) return "debutant";
    if (stress > 70 && satisfaction < 50) return "burnout_risque";
    if (satisfaction > 75) return "epanoui";
    return "employe_standard";
  }

  // ── ÉVÉNEMENTS PROFESSIONNELS ANNUELS ────────────────────
  function triggerCareerEvents(state) {
    if (!state.career) return;
    var track = window.VIE.getCareerTrack(state.career.track);
    if (!track || !track.events) return;

    // Probabilité d'événement pro selon niveau
    var prob = 0.15 + state.career.level * 0.05;
    if (Math.random() > prob) return;

    var evtId = track.events[Math.floor(Math.random() * track.events.length)];
    var evt = window.VIE.data.events_pro?.find(function(e) { return e.id === evtId; }) ||
              window.VIE.data.events_carriere?.find(function(e) { return e.id === evtId; });
    if (evt) playEvent(evt);
  }

  // ── HELPERS ──────────────────────────────────────────────
  function getActionsForAge(age) {
    if (age <= 5) return 1;
    if (age <= 12) return 1;
    if (age <= 14) return 2;
    if (age <= 17) return 3;
    if (age <= 24) return 5;
    if (age <= 30) return 5;
    if (age <= 39) return 3;
    if (age <= 49) return 3;
    if (age <= 64) return 2;
    if (age <= 79) return 2;
    return 1;
  }

  function weightedPick(arr) {
    var total = arr.reduce(function (s, e) { return s + e.weight; }, 0);
    var r = Math.random() * total;
    for (var i = 0; i < arr.length; i++) { r -= arr[i].weight; if (r <= 0) return arr[i].item; }
    return arr[arr.length - 1].item;
  }

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  // Export
  window.VIE = window.VIE || {};
  window.VIE.engine = window.VIE.engine || {};
  window.VIE.engine.career = {
    startEducation: startEducation,
    advanceEducation: advanceEducation,
    startCareer: startCareer,
    checkPromotion: checkPromotion,
    canReconvert: canReconvert,
    reconvert: reconvert,
    formationContinue: formationContinue,
    computeSatisfaction: computeJobSatisfaction,
    computeLifestyle: computeLifestyle,
    triggerCareerEvents: triggerCareerEvents
  };
})();