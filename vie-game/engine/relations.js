/* ============================================================
   UNE VIE v0.5 — MOTEUR DE RELATIONS
   Compatibilité, érosion, seuils, interactions micro
   ============================================================ */

(function () {
  "use strict";

  // ── TEMPS SOCIAL (capacité d'interactions par an) ───────────
  function calculateSocialTime(state) {
    var base = 3;
    var socialBonus = Math.floor((state.stats.social || 50) / 25);        // +1 par 25 social
    var eBonus = (state.personality.E > 70) ? 2 : ((state.personality.E > 50) ? 1 : (state.personality.E < 30) ? -1 : 0);
    var cBonus = (state.personality.C > 70) ? 1 : ((state.personality.C < 30) ? -1 : 0);

    var charges = 0;
    // Enfants
    var nbEnfants = Object.values(state.people).filter(function (p) {
      return p.liens.some(function (l) { return l.role === "enfant" && l.affection > 0; });
    }).length;
    charges += nbEnfants * 0.8;

    // Travail
    if (state.career) {
      var track = window.VIE.getCareerTrack(state.career.track);
      if (track && track.levels[state.career.level]) {
        var stress = track.levels[state.career.level].stress || 50;
        if (stress > 70) charges += 1.5;
        else if (stress > 50) charges += 0.8;
        else if (stress > 30) charges += 0.3;
      }
    }

    // Conjoint (soutien ou charge)
    var conjoint = Object.values(state.people).find(function (p) {
      return p.liens.some(function (l) { return l.role === "amour" && (l.statut === "marie" || l.statut === "pacs" || l.statut === "couple_installe"); });
    });
    if (conjoint) {
      var cLien = conjoint.liens.find(function (l) { return l.id === "self"; });
      if (cLien && cLien.affection > 60) charges -= 0.5; // soutien
      else if (cLien && cLien.tension > 40) charges += 0.5; // friction
    }

    var temps = base + socialBonus + eBonus + cBonus - charges;
    return Math.max(1, Math.floor(Math.min(temps, 10))); // 1 à 10/an
  }

  // ── COMPATIBILITÉ ────────────────────────────────────────
  function compatibility(a, b, kind) {
    kind = kind || "amitie";
    var weights = window.VIE.config.relations.compatibilityWeights[kind] ||
                  window.VIE.config.relations.compatibilityWeights.amitie;

    var details = [];
    var score = 50; // base

    // Similarité Big Five (poids selon kind)
    var dims = ["O", "C", "E", "A", "N"];
    dims.forEach(function (d) {
      var diff = Math.abs((a.personality[d] || 50) - (b.personality[d] || 50));
      var contrib = (100 - diff) / 100 * (weights[d] * 100);
      score += contrib - (weights[d] * 50); // centré sur 50
      if (diff < 15) details.push({ dim: d, type: "similarite", txt: "Similaires sur " + d });
      else if (diff > 40) details.push({ dim: d, type: "difference", txt: "Différents sur " + d });
    });

    // Valeurs
    var valScore = 0;
    var valCount = 0;
    Object.keys(a.valeurs || {}).forEach(function (v) {
      if (b.valeurs && b.valeurs[v] !== undefined) {
        var diff = Math.abs(a.valeurs[v] - b.valeurs[v]);
        valScore += (100 - diff);
        valCount++;
        if (diff < 15) details.push({ dim: "valeurs." + v, type: "valeur_commune", txt: "Même vision sur " + v });
        else if (diff > 50) details.push({ dim: "valeurs." + v, type: "valeur_opposee", txt: "Vision opposée sur " + v });
      }
    });
    if (valCount > 0) score += (valScore / valCount - 50) * (weights.valeurs || 0.2) * 2;

    // Désir d'enfants (dealbreaker potentiel)
    if (kind === "amour") {
      var deA = a.desirEnfants, deB = b.desirEnfants;
      if (deA === "veut" && deB === "ne_veut_pas" || deA === "ne_veut_pas" && deB === "veut") {
        score -= 40;
        details.push({ dim: "enfants", type: "dealbreaker", txt: "Désir d'enfants incompatible" });
      } else if (deA === deB && deA !== "indecis") {
        score += 10;
        details.push({ dim: "enfants", type: "accord", txt: "Même souhait côté enfants" });
      }
    }

    // Fidélité
    if (kind === "amour") {
      var fA = a.valeurs.fidelite || 50, fB = b.valeurs.fidelite || 50;
      if (Math.abs(fA - fB) > 40) {
        score -= 15;
        details.push({ dim: "fidelite", type: "risque", txt: "Conceptions de la fidélité différentes" });
      }
    }

    // Passions partagées
    var passionsA = Object.keys(a.passions || {});
    var passionsB = Object.keys(b.passions || {});
    var commonPassions = passionsA.filter(function (p) { return passionsB.includes(p); });
    if (commonPassions.length > 0) {
      score += commonPassions.length * 3;
      details.push({ dim: "passions", type: "communes", txt: "Passions communes : " + commonPassions.join(", ") });
    }

    // Écart d'âge
    var ageA = a.age || 30, ageB = b.age || 30;
    var ageDiff = Math.abs(ageA - ageB);
    if (ageDiff > 15) { score -= 10; details.push({ dim: "age", type: "ecart", txt: "Écart d'âge important (" + ageDiff + " ans)" }); }
    else if (ageDiff > 8) { score -= 3; details.push({ dim: "age", type: "ecart_modere", txt: "Écart d'âge modéré" }); }

    // Attirance (pour amour)
    if (kind === "amour") {
      // Basée sur apparence + charme + E + hasard
      var attraction = (b.apparence || 50) * 0.3 + (b.traits.includes("charmeur") ? 15 : 0) + (b.personality.E || 50) * 0.2 + Math.random() * 20;
      score += (attraction - 50) * 0.3;
    }

    // Traits spéciaux
    if (a.traits.includes("manipulateur") || b.traits.includes("manipulateur")) { score -= 10; }
    if (a.traits.includes("altruiste") && b.traits.includes("altruiste")) { score += 5; }

    // Clamp final
    score = clamp(score, 0, 100);

    return { score: Math.round(score), details: details };
  }

  // ── ÉROSION ANNUELLE ─────────────────────────────────────
  function erodeRelations(state) {
    var cfg = window.VIE.config.relations;
    var currentY = state.year;

    Object.values(state.people).forEach(function (p) {
      if (!p.vivant) return;
      p.liens.forEach(function (lien) {
        var yearsSinceContact = currentY - (lien.dernierContact || currentY);
        if (yearsSinceContact === 0) return; // contact cette année

        var erosion = cfg.erosion.base;
        // Réductions
        if (p.traits.includes("loyal")) erosion *= cfg.erosion.loyalReduction;
        if (lien.statut === "enfant" || lien.statut === "ami_d_enfance") erosion *= cfg.erosion.childhoodBondReduction;
        if (p.ville && state.ville && p.ville !== state.ville) erosion *= cfg.erosion.distanceFactor;
        if (state.career && state.career.level >= 3) erosion *= cfg.erosion.busyFactor;

        lien.affection = clamp(lien.affection - erosion * yearsSinceContact, 0, 100);
        lien.confiance = clamp(lien.confiance - erosion * 0.5 * yearsSinceContact, 0, 100);

        // Seuils de changement de statut
        checkRelationThresholds(p, lien, state);
      });
    });
  }

  function checkRelationThresholds(person, lien, state) {
    var oldStatut = lien.statut;
    var newStatut = oldStatut;

    // Amitié
    if (lien.role === "ami") {
      if (lien.affection >= 80 && lien.statut !== "ami_proche") newStatut = "ami_proche";
      else if (lien.affection >= 95 && lien.statut !== "meilleur_ami") newStatut = "meilleur_ami";
      else if (lien.affection < 30 && lien.statut !== "connaissance") newStatut = "connaissance";
      else if (lien.affection < 15) newStatut = "perdu_de_vue";
    }

    // Amour
    if (lien.role === "amour") {
      if (lien.affection >= 85 && lien.statut === "relation") newStatut = "couple_installe";
      else if (lien.affection >= 70 && lien.statut === "flirt") newStatut = "relation";
      else if (lien.affection < 25 && (lien.statut === "relation" || lien.statut === "couple_installe")) newStatut = "crise";
      else if (lien.affection < 10) newStatut = "rupture";
    }

    // Tension
    if (lien.tension >= window.VIE.config.relations.tensionBreakupThreshold) {
      if (lien.role === "amour") newStatut = "rupture";
      else if (lien.role === "ami") newStatut = "brouille";
    }

    if (newStatut !== oldStatut) {
      lien.statut = newStatut;
      person.histoire.push({ annee: state.year, age: state.year - person.naissance, type: "statut_change", texte: "Lien devenu : " + newStatut });
      // Notifier joueur si proche
      var playerLien = person.liens.find(function (l) { return l.affection > 50; });
      if (playerLien) {
        state.yearLog.push("Votre lien avec " + person.prenom + " a changé : " + newStatut);
      }
    }
  }

  // ── CONTACT SPONTANÉ PNJ → JOUEUR ────────────────────────
  function spontaneousContacts(state) {
    var cfg = window.VIE.config.relations;
    Object.values(state.people).forEach(function (p) {
      if (!p.vivant) return;
      var playerLien = p.liens.find(function (l) { return l.affection > 30; });
      if (!playerLien) return;

      var chance = cfg.spontaneousContactChance;
      // Biais selon traits PNJ
      if (p.traits.includes("bavard") || p.traits.includes("extraverti")) chance *= 2;
      if (p.traits.includes("timide") || p.traits.includes("solitaire")) chance *= 0.3;
      if (p.traits.includes("loyal")) chance *= 1.5;

      if (Math.random() < chance) {
        triggerSpontaneousEvent(p, playerLien, state);
      }
    });
  }

  function triggerSpontaneousEvent(person, lien, state) {
    var events = [
      { type: "appel", texte: person.prenom + " t'appelle pour prendre des nouvelles.", delta: { affection: 3, confiance: 2 } },
      { type: "message", texte: "Un message de " + person.prenom + " : \"Ça va ?\"", delta: { affection: 2 } },
      { type: "invitation", texte: person.prenom + " t'invite à boire un verre.", delta: { affection: 5, social: 3 } },
      { type: "confidence", texte: person.prenom + " se confie sur un souci.", delta: { confiance: 5, affection: 2 } },
      { type: "aide", texte: person.prenom + " a besoin d'un coup de main.", delta: { affection: 4, tension: -2 } },
      { type: "nouvelle", texte: person.prenom + " t'annonce une grande nouvelle !", delta: { affection: 3 } }
    ];
    var evt = events[Math.floor(Math.random() * events.length)];
    // Appliquer
    Object.keys(evt.delta).forEach(function (k) {
      if (lien[k] !== undefined) lien[k] = clamp(lien[k] + evt.delta[k], 0, 100);
      else if (state.stats[k] !== undefined) state.stats[k] = clamp(state.stats[k] + evt.delta[k], 0, 100);
    });
    lien.dernierContact = state.year;
    lien.contactsParAn = (lien.contactsParAn || 0) + 1;
    person.histoire.push({ annee: state.year, age: state.year - person.naissance, type: "contact_spontane", texte: evt.texte });
    state.yearLog.push(evt.texte);
  }

  // ── INTERACTIONS MICRO (depuis fiche personne) ───────────
  var INTERACTIONS_CATALOG = {
    // Générales
    appeler: { cout: 1, roles: ["ami", "amour", "famille", "pro"], minAffection: 10, effets: { affection: [2,5], confiance: [1,3] } },
    message: { cout: 1, roles: ["ami", "amour", "famille", "pro"], minAffection: 5, effets: { affection: [1,3] } },
    voir: { cout: 2, roles: ["ami", "amour", "famille"], minAffection: 20, effets: { affection: [5,10], confiance: [2,5], tension: [-3,0] } },
    sortie: { cout: 2, roles: ["ami", "amour"], minAffection: 30, effets: { affection: [5,12], bonheur: [3,8], tension: [-2,0] } },
    repas: { cout: 2, roles: ["ami", "amour", "famille"], minAffection: 25, effets: { affection: [5,10], bonheur: [2,6] } },
    cadeau: { cout: 1, roles: ["ami", "amour", "famille"], minAffection: 20, coutArgent: [20,100], effets: { affection: [5,15], confiance: [2,5] } },
    aider: { cout: 2, roles: ["ami", "amour", "famille", "pro"], minAffection: 15, effets: { affection: [3,8], confiance: [5,10], tension: [-2,0] } },
    service: { cout: 1, roles: ["ami", "amour", "famille", "pro"], minAffection: 20, effets: { confiance: [2,5], tension: [0,3] } },
    confidence: { cout: 2, roles: ["ami", "amour"], minAffection: 40, effets: { confiance: [8,15], affection: [3,6] } },
    conseil: { cout: 1, roles: ["ami", "amour", "famille", "pro"], minAffection: 15, effets: { respect: [3,8] } },
    sexcuser: { cout: 1, roles: ["ami", "amour", "famille"], minAffection: 10, pre: "tension>10", effets: { tension: [-10,-5], affection: [2,5], confiance: [2,5] } },
    disputer: { cout: 1, roles: ["ami", "amour", "famille"], minAffection: 5, effets: { tension: [10,25], affection: [-10,-3], confiance: [-5,-1] } },
    pardonner: { cout: 2, roles: ["ami", "amour", "famille"], minAffection: 5, pre: "tension>20", effets: { tension: [-20,-10], affection: [5,10], confiance: [3,8] } },
    couper: { cout: 2, roles: ["ami", "amour", "famille", "pro"], minAffection: 0, effets: { affection: -100, tension: 0, statut: "coupe" } },
    presenter: { cout: 1, roles: ["ami", "amour"], minAffection: 40, effets: { social: [3,6] } },

    // Amour spécifiques
    draguer: { cout: 1, roles: ["connaissance"], minAffection: 0, minAttraction: 20, effets: { attirance: [5,15], affection: [2,8] } },
    flirter: { cout: 1, roles: ["ami", "connaissance"], minAffection: 15, minAttraction: 30, effets: { attirance: [8,20], affection: [3,8] } },
    rdv: { cout: 2, roles: ["amour"], minAffection: 20, minAttraction: 30, effets: { affection: [5,12], attirance: [5,10], tension: [-2,0] } },
    declarer: { cout: 2, roles: ["amour"], minAffection: 40, minAttraction: 50, effets: { affection: [10,25], attirance: [10,20], statut: "relation" } },
    embrasser: { cout: 1, roles: ["amour"], minAffection: 30, minAttraction: 40, effets: { attirance: [10,20], affection: [5,10] } },
    exclusif: { cout: 2, roles: ["amour"], minAffection: 60, minAttraction: 50, effets: { affection: [10,20], confiance: [10,20], statut: "couple", exclusivite: "exclusive" } },
    presenter_parents: { cout: 2, roles: ["amour"], minAffection: 70, minStatut: "couple", effets: { affection: [5,10], famille_bonus: 10 } },
    emmenager: { cout: 3, roles: ["amour"], minAffection: 75, minStatut: "couple_installe", effets: { affection: [5,10], stress: 10, argent: -5000 } },
    fiancailles: { cout: 2, roles: ["amour"], minAffection: 80, minStatut: "couple_installe", effets: { affection: [5,10], bonheur: [10,20], statut: "fiances" } },
    mariage: { cout: 3, roles: ["amour"], minAffection: 85, minStatut: "fiances", effets: { affection: [5,10], bonheur: [15,30], statut: "marie", exclusivite: "exclusive" } },
    projet_enfant: { cout: 2, roles: ["amour"], minAffection: 70, minStatut: "couple_installe", pre: "desirEnfants!=ne_veut_pas", effets: { affection: [5,10], tension: [5,15] } },
    therapie_couple: { cout: 3, roles: ["amour"], minStatut: "crise", effets: { tension: [-15,-5], affection: [5,15], confiance: [5,15] } },
    pause: { cout: 2, roles: ["amour"], minStatut: "couple", effets: { tension: [5,15], affection: [-5,-1], statut: "pause" } },
    rompre: { cout: 2, roles: ["amour"], minStatut: "relation", effets: { affection: -50, tension: 30, bonheur: -15, statut: "ex" } },
    tromper: { cout: 2, roles: ["amour"], minStatut: "couple", secret: true, effets: { tension: 30, confiance: -30, secret: "infidelite" } },
    avouer: { cout: 2, roles: ["amour"], pre: "secret:infidelite", effets: { tension: 40, confiance: -50, affection: -30, secret: "revelee" } },
    mentir: { cout: 1, roles: ["amour", "ami"], pre: "trait:menteur", effets: { tension: 5, secret: "mensonge" } },

    // Famille
    visiter_parent: { cout: 2, roles: ["famille"], relationType: "parent", minAffection: 20, effets: { affection: [3,8], bonheur: [2,5] } },
    soigner_parent: { cout: 3, roles: ["famille"], relationType: "parent", minAffection: 30, effets: { affection: [5,10], energie: -10, stress: 5 } },
    reconciliation_famille: { cout: 2, roles: ["famille"], pre: "tension>30", effets: { tension: [-20,-10], affection: [10,20] } },
    heritage: { cout: 1, roles: ["famille"], relationType: "parent", pre: "deces", effets: { argent: [10000,100000], tension: [0,10] } },

    // Pro
    demander_promotion: { cout: 2, roles: ["pro"], relationType: "superieur", minAffection: 40, effets: { respect: [5,15], tension: [0,5] } },
    mentorat: { cout: 2, roles: ["pro"], relationType: "superieur", minAffection: 30, effets: { competence: [5,10], respect: [5,10] } },
    denoncer: { cout: 2, roles: ["pro"], minAffection: 10, effets: { tension: 30, reputation: -10, respect: -10 } },
    alliance: { cout: 2, roles: ["pro"], minAffection: 40, effets: { respect: [5,10], confiance: [5,10] } },
    saboter: { cout: 2, roles: ["pro"], relationType: "concurrent", secret: true, effets: { tension: 40, reputation: -20, secret: "sabotage" } }
  };

  function getAvailableInteractions(state, personId) {
    var person = state.people[personId];
    if (!person) return [];
    var lien = person.liens.find(function (l) { return l.role && l.affection > 0; });
    if (!lien) return [];

    var available = [];
    Object.keys(INTERACTIONS_CATALOG).forEach(function (key) {
      var inter = INTERACTIONS_CATALOG[key];
      // Vérifier rôle
      if (inter.roles && !inter.roles.includes(lien.role)) return;
      if (inter.relationType && lien.role !== inter.relationType) return;
      // Affection min
      if (inter.minAffection && lien.affection < inter.minAffection) return;
      // Attraction min
      if (inter.minAttraction && lien.attraction < inter.minAttraction) return;
      // Statut min
      if (inter.minStatut) {
        var order = ["connaissance", "flirt", "relation", "couple", "couple_installe", "fiances", "marie"];
        if (order.indexOf(lien.statut) < order.indexOf(inter.minStatut)) return;
      }
      // Prérequis
      if (inter.pre) {
        var ok = evalPrecondition(inter.pre, person, lien, state);
        if (!ok) return;
      }
      // Secret
      if (inter.secret && person.memoire && person.memoire[inter.secret]) return;

      available.push({ id: key, ...inter, personId: personId });
    });
    return available;
  }

  function evalPrecondition(pre, person, lien, state) {
    // Format simple: "tension>10", "trait:menteur", "desirEnfants!=ne_veut_pas", "secret:infidelite"
    if (pre.includes(">")) {
      var parts = pre.split(">");
      var val = lien[parts[0]] || 0;
      return val > parseInt(parts[1], 10);
    }
    if (pre.includes("!=")) {
      var parts = pre.split("!=");
      return person[parts[0]] !== parts[1];
    }
    if (pre.startsWith("trait:")) {
      return person.traits.includes(pre.substr(6));
    }
    if (pre.startsWith("secret:")) {
      return person.memoire && person.memoire[pre.substr(7)];
    }
    if (pre.startsWith("statut:")) {
      return lien.statut === pre.substr(7);
    }
    return true;
  }

  function resolveInteraction(state, interaction, personId) {
    var person = state.people[personId];
    var lien = person.liens.find(function (l) { return l.affection > 0; });
    if (!person || !lien) return { success: false, text: "Lien introuvable" };

    var cout = interaction.cout || 1;
    if (state.tempsSocial < cout) return { success: false, text: "Pas assez de temps social" };
    state.tempsSocial -= cout;

    // Coût argent
    if (interaction.coutArgent) {
      var cost = interaction.coutArgent[0] + Math.random() * (interaction.coutArgent[1] - interaction.coutArgent[0]);
      if (state.finance.compte < cost) return { success: false, text: "Pas assez d'argent" };
      state.finance.compte -= Math.round(cost);
    }

    // Effets probabilistes basés sur compatibilité + traits
    var compat = compatibility(state, person, lien.role === "amour" ? "amour" : "amitie");
    var mod = (compat.score - 50) / 100 * 0.5; // -0.25 à +0.25

    var results = { deltas: {}, text: "", events: [] };

    // Appliquer effets
    Object.keys(interaction.effets).forEach(function (k) {
      var val = interaction.effets[k];
      var delta = 0;
      if (Array.isArray(val)) {
        delta = val[0] + Math.random() * (val[1] - val[0]);
      } else {
        delta = val;
      }
      delta = Math.round(delta * (1 + mod));

      if (k === "statut") {
        lien.statut = val;
        results.text += "Votre relation devient : " + val + ". ";
      } else if (k === "exclusivite") {
        lien.exclusivite = val;
      } else if (k === "secret") {
        person.memoire = person.memoire || {};
        person.memoire[val] = true;
        results.text += "Un secret est né. ";
      } else if (lien[k] !== undefined) {
        lien[k] = clamp(lien[k] + delta, 0, 100);
        results.deltas[k] = delta;
      } else if (state.stats[k] !== undefined) {
        state.stats[k] = clamp(state.stats[k] + delta, 0, 100);
        results.deltas[k] = delta;
      } else if (k === "famille_bonus") {
        // Bonus sur liens famille
        person.liens.forEach(function (l) { if (l.role === "famille") l.affection = clamp(l.affection + delta, 0, 100); });
      } else if (k === "competence") {
        state.competences = state.competences || {};
        state.competences[interaction.competence || "relationnel"] = (state.competences[interaction.competence || "relationnel"] || 0) + delta;
      }
    });

    // Texte narratif
    results.text += generateInteractionText(interaction.id, person, lien, results.deltas);

    // Histoire
    person.histoire.push({ annee: state.year, age: state.year - person.naissance, type: "interaction", texte: results.text, interaction: interaction.id, deltas: results.deltas });
    lien.dernierContact = state.year;
    lien.contactsParAn = (lien.contactsParAn || 0) + 1;
    lien.connaissance = clamp(lien.connaissance + 5, 0, 100);

    // Conséquences en chaîne (jalousie, rumeur, etc.)
    triggerChainConsequences(state, person, interaction, results);

    return { success: true, ...results };
  }

  function generateInteractionText(interId, person, lien, deltas) {
    var templates = {
      appeler: ["Vous appelez {p1.prenom}. La conversation dure {duree} minutes.", "{p1.prenom} était ravi(e) d'avoir de vos nouvelles."],
      voir: ["Vous passez du temps avec {p1.prenom}.", "Une belle après-midi ensemble."],
      dispute: ["Les mots fusent avec {p1.prenom}.", "La tension monte."],
      pardonner: ["Vous pardonnez à {p1.prenom}.", "L'air se dégage."],
      rompre: ["Vous mettez fin à votre relation avec {p1.prenom}.", "C'est fini."],
      declarer: ["Vous déclarez votre flamme à {p1.prenom}.", "{p1.prenom} vous répond..."],
      tromper: ["Vous trahissez {p1.prenom}.", "Le secret pèse lourd."]
    };
    var tpl = templates[interId] || ["Vous interagissez avec {p1.prenom}."];
    var text = tpl[Math.floor(Math.random() * tpl.length)];
    // Remplacer jetons simples
    text = text.replace("{p1.prenom}", person.prenom);
    if (deltas.affection > 0) text += " (+affection)";
    if (deltas.affection < 0) text += " (affection en baisse)";
    if (deltas.tension > 0) text += " (tension)";
    if (deltas.confiance > 0) text += " (+confiance)";
    return text;
  }

  function triggerChainConsequences(state, person, interaction, results) {
    // Jalousie partenaire
    if (["tromper", "flirter", "draguer", "rdv", "embrasser"].includes(interaction.id)) {
      var loveLien = person.liens.find(function (l) { return l.role === "amour" && (l.statut === "couple" || l.statut === "marie"); });
      if (loveLien) {
        var partner = state.people[loveLien.id];
        if (partner && partner.traits.includes("jaloux")) {
          var partnerLien = partner.liens.find(function (l) { return l.id === person.id; });
          if (partnerLien) {
            partnerLien.tension = clamp(partnerLien.tension + 25, 0, 100);
            partnerLien.confiance = clamp(partnerLien.confiance - 20, 0, 100);
            results.events.push({ type: "jalousie", target: partner.id, text: partner.prenom + " se doute de quelque chose..." });
          }
        }
      }
    }

    // Rumeur
    if (interaction.secret && Math.random() < 0.1) {
      results.events.push({ type: "rumor", text: "Une rumeur commence à circuler..." });
    }
  }

  // ── TENSION ACCUMULATIVE (problèmes non résolus) ──────────────
  function accumulateTension(state) {
    Object.values(state.people).forEach(function (p) {
      if (!p.vivant) return;
      p.liens.forEach(function (lien) {
        if (lien.affection === 0) return;
        // Tension accumulée : promesses non tenues, dettes, conflits non résolus
        if (lien.memoire) {
          if (lien.memoire.promesse_non_tenue) lien.tension = Math.min(100, lien.tension + 3);
          if (lien.memoire.dette_impayee) lien.tension = Math.min(100, lien.tension + 5);
          if (lien.memoire.conflit_non_resolu) lien.tension = Math.min(100, lien.tension + 8);
        }
        // Jalousie latente si partenaire a attirance pour d'autres
        if (lien.role === "amour" && lien.statut === "couple") {
          var otherAttraction = p.liens.some(function (l) {
            return l.role === "amour" && l.id !== lien.id && l.attraction > 50;
          });
          if (otherAttraction) lien.tension = Math.min(100, lien.tension + 2);
        }
        // Décroissance naturelle si relation apaisée
        if (lien.tension > 0 && lien.affection > 70 && !lien.memoire?.conflit_non_resolu) {
          lien.tension = Math.max(0, lien.tension - 1);
        }
      });
    });
  }

  // ── SEUILS ÉTENDUS (réconciliation ex, ami perdu de vue) ──────
  function checkExtendedThresholds(person, lien, state) {
    var oldStatut = lien.statut;
    var newStatut = oldStatut;

    // ... existing thresholds ...
    // Réconciliation ex
    if (lien.role === "amour" && lien.statut === "ex") {
      if (lien.affection >= 60 && lien.tension < 20) newStatut = "ami";
      else if (lien.affection >= 80 && lien.tension < 10) newStatut = "flirt";
    }
    // Ami perdu de vue → retrouvailles
    if (lien.role === "ami" && lien.statut === "perdu_de_vue") {
      if (lien.affection >= 40) newStatut = "connaissance";
    }
    // Rupture → ex
    if (lien.role === "amour" && (lien.statut === "rupture" || lien.statut === "crise")) {
      if (lien.affection < 10) newStatut = "ex";
    }

    if (newStatut !== oldStatut) {
      lien.statut = newStatut;
      person.histoire.push({ annee: state.year, age: state.year - person.naissance, type: "statut_change", texte: "Lien devenu : " + newStatut });
      var playerLien = person.liens.find(function (l) { return l.affection > 50; });
      if (playerLien) state.yearLog.push("Votre lien avec " + person.prenom + " a changé : " + newStatut);
    }
  }

  // ── INFIDÉLITÉ : DÉCOUVERTE AMÉLIORÉE ────────────────────────
  function checkSecretDiscovery(state) {
    Object.values(state.people).forEach(function (p) {
      if (!p.vivant) return;
      Object.keys(p.memoire || {}).forEach(function (secret) {
        var entry = p.memoire[secret];
        // On ne traite que les secrets structurés ({ decouvert: bool })
        if (!entry || typeof entry !== "object") return;
        if (entry.decouvert) return;
        var chance = 0.05;
        if (secret === "infidelite") {
          var loveLien = p.liens.find(function (l) { return l.role === "amour" && (l.statut === "couple" || l.statut === "marie"); });
          if (loveLien) {
            var partner = state.people[loveLien.id];
            chance += 0.1;
            if (partner && partner.traits.includes("jaloux")) chance += 0.15;
            if (partner && partner.traits.includes("possessif")) chance += 0.1;
            if (partner && partner.traits.includes("manipulateur")) chance += 0.05;
            // Réseaux sociaux post-2012
            if (state.year > 2012) chance += 0.08;
            // Témoins (amis communs)
            var commonFriends = partner ? Object.values(state.people).filter(function (o) {
              return o.liens.some(function (l) { return l.id === p.id && l.affection > 40; }) &&
                     o.liens.some(function (l) { return l.id === partner.id && l.affection > 40; });
            }).length : 0;
            chance += commonFriends * 0.03;
            // Indices numériques
            if (state.year > 2010 && Math.random() < 0.3) chance += 0.05;
          }
        }
        if (Math.random() < chance) {
          p.memoire[secret].decouvert = true;
          if (secret === "infidelite") {
            var loveLien = p.liens.find(function (l) { return l.role === "amour" && (l.statut === "couple" || l.statut === "marie"); });
            if (loveLien) {
              var partner = state.people[loveLien.id];
              var partnerLien = partner ? partner.liens.find(function (l) { return l.id === p.id; }) : null;
              if (partnerLien) {
                partnerLien.tension = clamp(partnerLien.tension + 40, 0, 100);
                partnerLien.confiance = clamp(partnerLien.confiance - 50, 0, 100);
                partnerLien.affection = clamp(partnerLien.affection - 30, 0, 100);
                partnerLien.memoire = partnerLien.memoire || {};
                partnerLien.memoire.infidelite_subie = true;
                state.history.push({ age: state.age, year: state.year, title: "Infidélité découverte", result: p.prenom + " a découvert votre infidélité. La confiance est brisée.", type: "crise" });
              }
            }
          }
        }
      });
    });
  }

  // ── PROGRESSION DES HABITUDES & DÉPENDANCES ─────────────────
  function progressHabits(state) {
    // Évolution naturelle des habitudes selon personnalité, événements, âge
    var hab = state.habitudes || {};
    var pers = state.personality || {};

    // Alcool : augmentation si stress, soirées, traits fêtard/impulsif ; diminution si thérapie, âge, trait travailleur
    var alcoolDelta = 0;
    if (hab.alcool > 0) {
      alcoolDelta += (hab.alcool / 100) * 0.5; // tolérance naturelle
      if (state.flags.includes("en_therapie")) alcoolDelta -= 2;
      if (state.personality.C > 60) alcoolDelta -= 1;
      if (state.personality.N > 70) alcoolDelta += 1;
      if (hab.soirees > 50) alcoolDelta += 1;
      if (state.age > 60) alcoolDelta -= 1;
    }
    hab.alcool = clamp(hab.alcool + alcoolDelta, 0, 100);

    // Tabac : très difficile à réduire sans flag non_fumeur
    var tabacDelta = 0;
    if (hab.tabac > 0) {
      tabacDelta += 0.3; // dépendance physique
      if (state.flags.includes("non_fumeur")) tabacDelta -= 5;
      if (state.personality.C > 70) tabacDelta -= 1;
      if (state.age > 60) tabacDelta -= 0.5;
    }
    hab.tabac = clamp(hab.tabac + tabacDelta, 0, 100);

    // Cannabis
    var cannabisDelta = 0;
    if (hab.cannabis > 0) {
      cannabisDelta += 0.2;
      if (state.flags.includes("en_therapie")) cannabisDelta -= 1;
      if (state.personality.C > 60) cannabisDelta -= 1;
    }
    hab.cannabis = clamp(hab.cannabis + cannabisDelta, 0, 100);

    // Jeu : très volatile, dépend de l'argent et de l'impulsivité
    var jeuDelta = 0;
    if (hab.jeu > 0) {
      jeuDelta += (hab.jeu / 100) * 2;
      if (state.personality.C < 30) jeuDelta += 1;
      if (state.personality.N > 60) jeuDelta += 1;
      if (state.finance.compte < 0) jeuDelta += 2; // désespérance
      if (state.flags.includes("jeu_aide")) jeuDelta -= 3;
    }
    hab.jeu = clamp(hab.jeu + jeuDelta, 0, 100);

    // Sport : baisse naturelle avec l'âge, augmente si santé, conscience
    var sportDelta = 0;
    if (hab.sport > 0) {
      sportDelta -= state.age * 0.02;
      if (state.personality.C > 60) sportDelta += 1;
      if (state.stats.sante > 70) sportDelta += 0.5;
      if (hab.alcool > 50) sportDelta -= 1;
    }
    hab.sport = clamp(hab.sport + sportDelta, 0, 100);

    // Alimentation : se dégrade avec stress, alcool, âge ; s'améliore avec conscience, thérapie
    var alimDelta = 0;
    if (hab.alimentation < 100) {
      alimDelta += 0.2;
      if (state.personality.C > 60) alimDelta += 0.5;
      if (state.flags.includes("en_therapie")) alimDelta += 1;
      if (state.stats.stress > 60) alimDelta -= 1;
      if (hab.alcool > 50) alimDelta -= 1;
    }
    hab.alimentation = clamp(hab.alimentation + alimDelta, 0, 100);

    // Sommeil : se dégrade avec stress, écrans, alcool ; s'améliore avec sport, routine
    var sommeilDelta = 0;
    if (hab.sommeil < 100) {
      sommeilDelta += 0.1;
      if (hab.sport > 50) sommeilDelta += 0.5;
      if (state.stats.stress > 60) sommeilDelta -= 1;
      if (hab.ecrans > 70) sommeilDelta -= 1;
      if (hab.alcool > 50) sommeilDelta -= 1;
    }
    hab.sommeil = clamp(hab.sommeil + sommeilDelta, 0, 100);

    // Écrans : augmente naturellement avec l'époque, diminue avec conscience
    var ecransDelta = 0;
    if (hab.ecrans < 100) {
      ecransDelta += 0.5;
      if (state.year > 2010) ecransDelta += 0.3; // smartphones
      if (state.personality.C > 60) ecransDelta -= 0.5;
      if (state.flags.includes("en_therapie")) ecransDelta -= 0.5;
    }
    hab.ecrans = clamp(hab.ecrans + ecransDelta, 0, 100);

    // Soirées : liées à extraversion, alcool, âge
    var soireesDelta = 0;
    if (hab.soirees > 0) {
      soireesDelta += (hab.soirees / 100) * 0.5;
      if (state.personality.E > 60) soireesDelta += 1;
      if (hab.alcool > 50) soireesDelta += 1;
      if (state.age > 40) soireesDelta -= 1;
    }
    hab.soirees = clamp(hab.soirees + soireesDelta, 0, 100);

    // Voyages : liés à ouverture, argent, âge
    var voyagesDelta = 0;
    if (hab.voyages > 0) {
      voyagesDelta += 0.2;
      if (state.personality.O > 60) voyagesDelta += 0.5;
      if (state.finance.compte > 10000) voyagesDelta += 0.5;
      if (state.age > 60) voyagesDelta -= 0.5;
    }
    hab.voyages = clamp(hab.voyages + voyagesDelta, 0, 100);

    // Détection dépendances (seuil 70)
    state.dependances = state.dependances || {};
    ["alcool", "tabac", "cannabis", "jeu"].forEach(function (h) {
      if (hab[h] >= 70 && !state.dependances[h]) {
        state.dependances[h] = { niveau: hab[h], depuis: state.year, enCure: false };
        state.history.push({ age: state.age, year: state.year, title: "Dépendance détectée : " + h, result: "Le seuil de dépendance est franchi pour " + h + ". Une aide peut être nécessaire.", type: "sante" });
      }
    });

    // Guérison dépendances si en cure et niveau bas
    Object.keys(state.dependances || {}).forEach(function (h) {
      if (state.dependances[h].enCure && hab[h] < 30) {
        delete state.dependances[h];
        state.history.push({ age: state.age, year: state.year, title: "Guérison : " + h, result: "La dépendance à " + h + " est maîtrisée. Une victoire silencieuse.", type: "sante" });
      }
    });

    state.habitudes = hab;
  }

  // ── RÉDEMPTION : PROGRESSION VERS LA GUÉRISON ────────────────
  function progressRedemption(state) {
    // Thérapie : réduit stress, améliore habitudes, augmente lucidité
    if (state.flags.includes("en_therapie")) {
      state.stats.stress = Math.max(0, state.stats.stress - 1);
      state.stats.confiance = Math.min(100, state.stats.confiance + 0.5);
      if (state.personality.N > 50) state.personality.N = Math.max(0, state.personality.N - 0.2);
      state.habitudes.alcool = Math.max(0, state.habitudes.alcool - 0.5);
      state.habitudes.tabac = Math.max(0, state.habitudes.tabac - 0.3);
      state.habitudes.cannabis = Math.max(0, state.habitudes.cannabis - 0.3);
      state.habitudes.jeu = Math.max(0, state.habitudes.jeu - 0.5);
      state.habitudes.sport = Math.min(100, state.habitudes.sport + 0.3);
    }

    // Pardon / réconciliation : réduit tension, améliore relations
    if (state.flags.includes("pardon_offert") || state.flags.includes("pardon_recu")) {
      Object.values(state.people).forEach(function (p) {
        if (!p.vivant) return;
        p.liens.forEach(function (l) {
          if (l.tension > 0) l.tension = Math.max(0, l.tension - 2);
          if (l.affection < 100) l.affection = Math.min(100, l.affection + 1);
        });
      });
      state.flags = state.flags.filter(function (f) { return f !== "pardon_offert" && f !== "pardon_recu"; });
    }

    // Rédemption financière : si budget positif, réduit stress
    if (state.finance.compte > 0 && state.stats.stress > 30) {
      state.stats.stress = Math.max(0, state.stats.stress - 0.5);
    }

    // Guérison dépendances si niveau bas prolongé
    Object.keys(state.dependances || {}).forEach(function (h) {
      var dep = state.dependances[h];
      if (dep.niveau < 30 && state.year - dep.depuis > 2) {
        dep.enCure = true;
      }
      if (dep.enCure && state.habitudes[h] < 20 && state.year - dep.depuis > 3) {
        delete state.dependances[h];
        state.history.push({ age: state.age, year: state.year, title: "Guérison : " + h, result: "La dépendance à " + h + " est derrière vous. Une victoire silencieuse.", type: "sante" });
      }
    });
  }

  // Helper : borner une valeur entre min et max
  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  // Export
  window.VIE = window.VIE || {};
  window.VIE.engine = window.VIE.engine || {};
  window.VIE.engine.relations = {
    compatibility: compatibility,
    erodeAll: erodeRelations,
    spontaneousContacts: spontaneousContacts,
    getInteractions: getAvailableInteractions,
    resolveInteraction: resolveInteraction,
    checkSecrets: checkSecretDiscovery,
    calculateSocialTime: calculateSocialTime,
    accumulateTension: accumulateTension,
    checkExtendedThresholds: checkExtendedThresholds,
    progressHabits: progressHabits,
    progressRedemption: progressRedemption,
    INTERACTIONS_CATALOG: INTERACTIONS_CATALOG
  };
})();