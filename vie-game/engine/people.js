/* ============================================================
   UNE VIE v0.5 — PEOPLE MANAGER
   Génération, requêtes, vieillissement, mortalité des PNJ
   Schéma complet selon specs Phase 2
   ============================================================ */

(function () {
  "use strict";

  // ── GÉNÉRATION D'UNE PERSONNE ────────────────────────────
  function generatePerson(opts) {
    opts = opts || {};
    var rng = window.VIE && window.VIE.rng ? window.VIE.rng : Math;

    var currentYear = opts.currentYear || (window.VIE.engine.state && window.VIE.engine.state.getPath ? window.VIE.engine.state.getPath("year") : 2024);
    var ageMin = opts.ageMin || 0;
    var ageMax = opts.ageMax || 100;
    var sexe = opts.sexe || (rng.chance ? rng.chance(0.5) : Math.random() < 0.5) ? "homme" : "femme";
    var culture = opts.culture || "francaise";
    var contexte = opts.contexte || "hasard";
    var classe = opts.classe || "moyenne";
    var ville = opts.ville || "";

    // Âge cohérent
    var age = rng.int(ageMin, ageMax);
    var naissance = currentYear - age;

    // Identité
    var identity = window.VIE.data.names.generateIdentity ?
      window.VIE.data.names.generateIdentity(naissance, sexe, culture) :
      { prenom: "Inconnu", nom: "Inconnu", sexe: sexe, culture: culture };

    // Personnalité (héritée si parents fournis)
    var parents = opts.parents || [];
    var personalityResult = window.VIE.engine.personality.generateAtBirth({
      parents: parents,
      origin: opts.origin,
      archetype: null
    });

    // Métier / niveau de vie selon contexte et âge
    var metier = "";
    var niveauVie = 50;
    if (age >= 18 && age < 65) {
      metier = pickMetierForContext(contexte, classe, age);
      niveauVie = pickNiveauVieForMetier(metier, age);
    } else if (age >= 65) {
      metier = "Retraité(e)";
      niveauVie = 40 + Math.random() * 30;
    }

    // Ville
    if (!ville && window.VIE.pickLieuNaissance) {
      var lieu = window.VIE.pickLieuNaissance();
      ville = lieu.ville;
    }

    var person = {
      id: window.VIE.util.uniqueId("p"),
      prenom: identity.prenom,
      nom: identity.nom,
      sexe: identity.sexe,
      orientation: pickOrientation(),
      naissance: naissance,
      vivant: true,
      deces: null,
      personnalite: personalityResult.personality,
      traits: personalityResult.traits,
      valeurs: generateValues(personalityResult.personality),
      desirEnfants: pickDesirEnfants(personalityResult.personality),
      apparence: rng.gaussianClamped ? rng.gaussianClamped(50, 15, 20, 90) : 50,
      sante: rng.gaussianClamped ? rng.gaussianClamped(75, 15, 30, 100) : 75,
      metier: metier,
      niveauVie: Math.round(niveauVie),
      ville: ville,
      passions: generatePassions(personalityResult),
      habitudes: generateHabitudes(personalityResult),
      humeur: 50,
      liens: [],              // liens vers le JOUEUR (affection, confiance, respect, attirance, tension, connaissance, depuis, dernierContact, contactsParAn)
      famille: [],            // liens vers AUTRES PNJ (ids + relation: pere, mere, frere, soeur, enfant, conjoint, ex, grand_parent, oncle_tante, cousin, beau_parent, beau_frere_soeur)
      histoire: [],           // journal interactions: [{annee, age, type, texte, delta}]
      secrets: [],            // ce qu'elle cache / ce que le joueur lui cache
      memoire: { trahison: false, dette: 0, service_rendu: 0 },
      niveauDetail: "fond"    // "fond" | "connu" | "proche"
    };

    // Promouvoir si contexte proche
    if (["famille", "ecole", "travail", "voisinage", "amoureux"].includes(contexte)) {
      person.niveauDetail = "connu";
    }

    return person;
  }

  function pickMetierForContext(contexte, classe, age) {
    var metiers = {
      ecole: ["Étudiant(e)", "Lycéen(ne)", "Apprenti(e)"],
      travail: ["Employé(e)", "Ouvrier(ère)", "Technicien(ne)", "Cadre junior"],
      voisinage: ["Voisin(e)", "Commerçant(e)", "Retraité(e)"],
      soiree: ["Freelance", "Artiste", "Étudiant(e)", "Cadre"],
      passion: ["Artisan(e)", "Musicien(ne)", "Écrivain(e)", "Développeur(se)"],
      appli_rencontre: ["Cadre", "Profession libéral", "Enseignant(e)", "Infirmier(ère)"],
      amis_d_amis: ["Employé(e)", "Cadre", "Artisan(e)", "Freelance"],
      famille: ["Agriculteur(trice)", "Commerçant(e)", "Retraité(e)", "Fonctionnaire"],
      voyage: ["Guide", "Photographe", "Humanitaire", "Nomade numérique"],
      hasard: ["Employé(e)", "Ouvrier(ère)", "Cadre", "Commerçant(e)", "Artisan(e)"]
    };
    var pool = metiers[contexte] || metiers.hasard;
    // Biais selon classe
    if (classe === "tres_elevee" && age > 30) pool = ["Cadre dirigeant", "Profession libéral", "Entrepreneur(se)", "Politique"];
    if (classe === "precaire") pool = ["Ouvrier(ère)", "Employé(e) précaire", "Sans emploi", "Étudiant(e)"];
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function pickNiveauVieForMetier(metier, age) {
    var base = {
      "Étudiant(e)": 20, "Lycéen(ne)": 15, "Apprenti(e)": 18,
      "Employé(e)": 45, "Ouvrier(ère)": 45, "Technicien(ne)": 55, "Cadre junior": 60,
      "Cadre": 70, "Cadre dirigeant": 85, "Profession libéral": 75,
      "Entrepreneur(se)": 60, "Politique": 70,
      "Artisan(e)": 50, "Commerçant(e)": 55, "Retraité(e)": 40,
      "Agriculteur(trice)": 40, "Fonctionnaire": 55,
      "Freelance": 45, "Artiste": 35, "Musicien(ne)": 30, "Écrivain(e)": 35,
      "Développeur(se)": 65, "Guide": 40, "Photographe": 40, "Humanitaire": 35,
      "Nomade numérique": 55, "Infirmier(ère)": 50, "Enseignant(e)": 50,
      "Sans emploi": 20
    };
    var v = base[metier] || 50;
    if (age > 30) v += Math.min(20, (age - 30) * 0.5);
    if (age > 50) v += Math.min(15, (age - 50) * 0.3);
    return clamp(v + (Math.random() - 0.5) * 20, 10, 100);
  }

  function pickOrientation() {
    var r = Math.random();
    if (r < 0.85) return "hetero";
    if (r < 0.92) return "homo";
    if (r < 0.97) return "bi";
    return "aero";
  }

  function generateValues(personality) {
    var base = { famille: 50, carriere: 50, aventure: 50, argent: 50, fidelite: 50, creativite: 50, stabilite: 50, spiritualite: 50 };
    if (personality.A > 60) base.famille += 10, base.fidelite += 10;
    if (personality.C > 60) base.carriere += 10, base.stabilite += 10;
    if (personality.O > 60) base.aventure += 10, base.creativite += 10;
    if (personality.E > 60) base.aventure += 5;
    if (personality.N > 60) base.stabilite += 10, base.argent += 5;
    Object.keys(base).forEach(function (k) { base[k] = clamp(base[k] + (Math.random() - 0.5) * 20, 0, 100); });
    return base;
  }

  function pickDesirEnfants(personality) {
    var score = personality.A * 0.4 + (100 - personality.N) * 0.2 + (personality.C > 50 ? 10 : 0) + (Math.random() - 0.5) * 30;
    if (score > 70) return "veut";
    if (score < 35) return "ne_veut_pas";
    return "indecis";
  }

  function generatePassions(personality) {
    var passions = {};
    var passionList = ["peinture", "musique", "ecriture", "sport", "cuisine", "technologie", "nature", "theatre", "lecture", "photo", "voyage", "jardinage", "bricolage", "collection"];
    var num = Math.floor(Math.random() * 3) + 1;
    var shuffled = passionList.sort(function () { return Math.random() - 0.5; });
    for (var i = 0; i < num; i++) {
      var p = shuffled[i];
      var level = Math.floor(Math.random() * 3) + 1;
      if (personality.O > 70 && ["peinture", "musique", "ecriture", "photo"].includes(p)) level++;
      passions[p] = clamp(level, 1, 5);
    }
    return passions;
  }

  function generateHabitudes(personality) {
    var hab = { alcool: 0, tabac: 0, cannabis: 0, jeu: 0, sport: 0, alimentation: 50, sommeil: 50, ecrans: 0, soirees: 0, voyages: 0 };
    if (personality.N > 70) { hab.alcool += 10; hab.tabac += 10; }
    if (personality.E > 70) { hab.soirees += 20; hab.alcool += 10; }
    if (personality.C > 70) { hab.sport += 15; hab.alimentation += 10; hab.sommeil += 10; }
    if (personality.O > 70) { hab.voyages += 15; }
    Object.keys(hab).forEach(function (k) { hab[k] = clamp(hab[k] + (Math.random() - 0.5) * 20, 0, 100); });
    return hab;
  }

  // ── REQUÊTES PERSONNES ───────────────────────────────────
  function queryPeople(state, filters) {
    filters = filters || {};
    var results = [];
    Object.values(state.people || {}).forEach(function (p) {
      if (!p.vivant && filters.vivant !== false) return;
      if (filters.role) {
        var hasRole = p.liens.some(function (l) { return l.role === filters.role; });
        if (!hasRole) return;
      }
      if (filters.statut) {
        var hasStatut = p.liens.some(function (l) { return l.statut === filters.statut; });
        if (!hasStatut) return;
      }
      if (filters.minAffection) {
        var ok = p.liens.some(function (l) { return l.affection >= filters.minAffection; });
        if (!ok) return;
      }
      if (filters.trait) {
        if (!p.traits.includes(filters.trait)) return;
      }
      if (filters.ageRange) {
        var age = currentYear(state) - p.naissance;
        if (age < filters.ageRange.min || age > filters.ageRange.max) return;
      }
      if (filters.sexe && p.sexe !== filters.sexe) return;
      if (filters.ville && p.ville !== filters.ville) return;
      results.push(p);
    });
    return results;
  }

  function currentYear(state) { return state.year || 2024; }

  // ── VIEILLISSEMENT & MORTALITÉ PNJ ──────────────────────
  function agePeople(state) {
    var currentY = state.year;
    Object.values(state.people).forEach(function (p) {
      if (!p.vivant) return;
      var age = currentY - p.naissance;

      // Le joueur n'est pas vieilli ici : sa santé et sa mortalité sont
      // gérées par les stats du joueur (game.js). Le traiter ici appliquait
      // une seconde rolled mort par an.
      if (p.id === "self") return;

      // Mortalité — déléguée au module santé (source unique de vérité)
      if (window.VIE.engine.health && window.VIE.engine.health.shouldDie) {
        if (window.VIE.engine.health.shouldDie(p, state)) {
          killPerson(p, state, age);
          return;
        }
      } else if (shouldDie(p, age, state)) {
        killPerson(p, state, age);
        return;
      }

      // Évolution naturelle (vieillissement progressif, pas `age * x` par an)
      var decay = 0.4 + Math.max(0, age - 30) * 0.02;
      p.sante = clamp(p.sante + (Math.random() - 0.5) * 3 - decay, 0, 100);
      p.apparence = clamp(p.apparence - 0.3 + Math.random() * 0.5, 0, 100);
      p.niveauVie = clamp(p.niveauVie + (Math.random() - 0.5) * 5, 10, 100);
      p.humeur = clamp(p.humeur + (Math.random() - 0.5) * 10, 0, 100);

      // Événements autonomes (probabilistes)
      if (Math.random() < 0.15) autonomousEvent(p, state);
    });
  }

  function shouldDie(person, age, state) {
    // Source unique de vérité : le module santé.
    if (window.VIE.engine.health && window.VIE.engine.health.mortalityProb) {
      return Math.random() < window.VIE.engine.health.mortalityProb(person, state);
    }
    var cfg = window.VIE.config.health.gompertz;
    var g = cfg[person.sexe === "femme" ? "femme" : "homme"];
    var baseProb = g.a * Math.exp(g.b * age);

    var mult = 1;
    var healthCfg = window.VIE.config.health.mortalityFactors;
    if (person.sante < 40) mult *= healthCfg.sante[40] || 1.5;
    if (person.habitudes && person.habitudes.tabac > 50) mult *= healthCfg.tabagisme;
    if (person.habitudes && person.habitudes.alcool > 70) mult *= healthCfg.alcoolFort;
    if (person.habitudes && person.habitudes.alimentation < 30) mult *= healthCfg.obesite;
    if (person.habitudes && person.habitudes.stress > 70) mult *= healthCfg.stressChronique;
    if (person.conditions && person.conditions.includes("depression")) mult *= healthCfg.depression;
    if (person.habitudes && person.habitudes.sport > 50) mult *= healthCfg.activitePhysique;

    if (age >= 15 && age <= 30) baseProb += window.VIE.config.health.accidentRate.age15_30;
    else baseProb += window.VIE.config.health.accidentRate.other;

    return Math.random() < baseProb * mult;
  }

  function killPerson(person, state, age) {
    person.vivant = false;
    person.deces = { annee: state.year, age: age, cause: pickCauseOfDeath(person, age) };
    var lien = person.liens.find(function (l) { return l.affection > 40; });
    if (lien) {
      state.history.push({
        age: state.age, year: state.year,
        title: "Deuil : " + person.prenom,
        result: person.prenom + " " + person.nom + " nous a quittés à " + age + " ans (" + person.deces.cause + ").",
        type: "deuil", peopleIds: [person.id]
      });
    }
  }

  function pickCauseOfDeath(person, age) {
    var causes = ["vieillesse", "maladie", "accident", "crise cardiaque", "cancer", "suicide", "maladie neurodégénérative"];
    if (age < 40) return ["accident", "suicide", "maladie"][Math.floor(Math.random() * 3)];
    if (age < 65) return ["cancer", "crise cardiaque", "accident", "maladie"][Math.floor(Math.random() * 4)];
    return ["vieillesse", "maladie neurodégénérative", "cancer"][Math.floor(Math.random() * 3)];
  }

  function autonomousEvent(person, state) {
    var events = [
      { type: "changement_metier", prob: 0.05, text: "Change de travail" },
      { type: "demenagement", prob: 0.03, text: "Déménage à " + (window.VIE.pickLieuNaissance ? window.VIE.pickLieuNaissance().ville : "une autre ville") },
      { type: "rencontre", prob: 0.04, text: "Fait une nouvelle rencontre" },
      { type: "mariage", prob: 0.02, text: "Se marie / se pacse" },
      { type: "naissance", prob: 0.02, text: "A un enfant" },
      { type: "separation", prob: 0.015, text: "Se sépare / divorce" },
      { type: "maladie", prob: 0.02, text: "Traverse une période de maladie" },
      { type: "depression", prob: 0.01, text: "Traverse une dépression" },
      { type: "succes", prob: 0.01, text: "Connaît un succès professionnel" },
      { type: "faillite", prob: 0.005, text: "Fait faillite / perd son emploi" },
      { type: "addiction", prob: 0.005, text: "Développe une dépendance" }
    ];
    var evt = events.find(function (e) { return Math.random() < e.prob; });
    if (evt) {
      person.histoire.push({ annee: state.year, age: state.year - person.naissance, type: evt.type, texte: evt.text });
      var lien = person.liens.find(function (l) { return l.affection > 50; });
      if (lien) state.yearLog.push("Nouvelles de " + person.prenom + " : " + evt.text);
    }
  }

  // ── LIENS FAMILIAUX (graphe cohérent) ────────────────────
  function linkFamily(parent, enfant) {
    if (!parent.famille) parent.famille = [];
    if (!enfant.famille) enfant.famille = [];
    parent.famille.push({ id: enfant.id, relation: "enfant" });
    enfant.famille.push({ id: parent.id, relation: parent.sexe === "femme" ? "mere" : "pere" });
  }

  function linkPartenaire(p1, p2) {
    p1.famille.push({ id: p2.id, relation: "conjoint" });
    p2.famille.push({ id: p1.id, relation: "conjoint" });
  }

  function linkEx(p1, p2) {
    p1.famille = p1.famille.map(function (f) { return f.id === p2.id ? { id: p2.id, relation: "ex" } : f; });
    p2.famille = p2.famille.map(function (f) { return f.id === p1.id ? { id: p1.id, relation: "ex" } : f; });
  }

  function linkGrandParent(grandParent, petitEnfant) {
    if (!grandParent.famille) grandParent.famille = [];
    if (!petitEnfant.famille) petitEnfant.famille = [];
    grandParent.famille.push({ id: petitEnfant.id, relation: "petit_enfant" });
    petitEnfant.famille.push({ id: grandParent.id, relation: grandParent.sexe === "femme" ? "grand_mere" : "grand_pere" });
  }

  function linkOncleTante(oncle, neveu) {
    if (!oncle.famille) oncle.famille = [];
    if (!neveu.famille) neveu.famille = [];
    oncle.famille.push({ id: neveu.id, relation: "neveu_niece" });
    neveu.famille.push({ id: oncle.id, relation: oncle.sexe === "femme" ? "tante" : "oncle" });
  }

  function linkBeauParent(beauParent, enfantConjoint) {
    if (!beauParent.famille) beauParent.famille = [];
    if (!enfantConjoint.famille) enfantConjoint.famille = [];
    beauParent.famille.push({ id: enfantConjoint.id, relation: "beau_enfant" });
    enfantConjoint.famille.push({ id: beauParent.id, relation: beauParent.sexe === "femme" ? "belle_mere" : "beau_pere" });
  }

  // Helpers
  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  // Export
  window.VIE = window.VIE || {};
  window.VIE.engine = window.VIE.engine || {};
  window.VIE.engine.people = {
    generate: generatePerson,
    query: queryPeople,
    ageAll: agePeople,
    linkFamily: linkFamily,
    linkPartenaire: linkPartenaire,
    linkEx: linkEx,
    linkGrandParent: linkGrandParent,
    linkOncleTante: linkOncleTante,
    linkBeauParent: linkBeauParent,
    currentYear: currentYear
  };
})();