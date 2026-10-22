/* ============================================================
   UNE VIE v0.8 — RENCONTRES
   Création de nouveaux PNJ et liens réciproques avec le joueur.
   Complète engine/people.js (génération) et engine/relations.js (liens).
   ============================================================ */

(function () {
  "use strict";

  var PLAYER_ID = "self";

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  // ── LIEN VERS LE JOUEUR (côté PNJ) ───────────────────────
  function makePlayerLink(role, statut, affection, confiance, extra) {
    var l = {
      id: PLAYER_ID,
      role: role,
      statut: statut || "connaissance",
      affection: affection,
      confiance: confiance,
      respect: 50,
      attirance: 0,
      tension: 0,
      connaissance: 60,
      depuis: extra && extra.depuis ? extra.depuis : 0,
      dernierContact: extra && extra.dernierContact ? extra.dernierContact : 0,
      contactsParAn: 0
    };
    if (extra) Object.keys(extra).forEach(function (k) { l[k] = extra[k]; });
    return l;
  }

  // ── LIEN VERS LE PNJ (côté joueur) ───────────────────────
  function makePlayerSideLink(person, role, statut, affection, confiance, year) {
    return {
      id: person.id,
      role: role,
      relation: relationLabel(role, person.sexe),
      statut: statut || "connaissance",
      affection: affection,
      confiance: confiance,
      respect: 50,
      attirance: role === "amour" ? Math.round(affection / 2) : 0,
      tension: 0,
      connaissance: 60,
      depuis: year,
      dernierContact: year,
      contactsParAn: 0
    };
  }

  function relationLabel(role, sexe) {
    if (role === "amour") return sexe === "femme" ? "amie" : "ami";
    if (role === "ami") return "ami";
    if (role === "pro") return "collègue";
    return "famille";
  }

  function statutFor(type, affection) {
    // L'échelle de statuts est gérée par le module relations (source unique)
    if (window.VIE.engine.relations && window.VIE.engine.relations.statutFromAffection) {
      return window.VIE.engine.relations.statutFromAffection(type, affection);
    }
    if (type === "amour") {
      if (affection >= 70) return "couple";
      if (affection >= 45) return "partenaire";
      if (affection >= 20) return "amoureux";
      return "flirt";
    }
    if (type === "ami") {
      if (affection >= 60) return "proche";
      if (affection >= 30) return "ami";
      return "connaissance";
    }
    if (type === "pro") return "collègue";
    return "connaissance";
  }

  // ── RENCONTRE D'UNE NOUVELLE PERSONNE ─────────────────────
  /**
   * Crée un PNJ et l'attache au joueur.
   * @param {object} state
   * @param {string} type  "ami" | "amour" | "pro" | "famille"
   * @param {object} opts  { ageMin, ageMax, affection, confiance, contexte }
   * @returns {object|null} la personne créée
   */
  function meet(state, type, opts) {
    opts = opts || {};
    var people = window.VIE.engine && window.VIE.engine.people;
    if (!people || !people.generate) return null;
    if (!state.people) state.people = {};

    var cfg = window.VIE.config.relations;
    if (Object.keys(state.people).length >= (cfg.maxTotalPeople || 150)) return null;

    var ageJoueur = state.age || 0;
    var ageMin = opts.ageMin, ageMax = opts.ageMax, contexte = opts.contexte;

    if (ageMin === undefined || ageMax === undefined) {
      if (type === "ami") {
        ageMin = Math.max(3, ageJoueur - 4); ageMax = ageJoueur + 3; contexte = "ecole";
      } else if (type === "amour") {
        ageMin = Math.max(16, ageJoueur - 6); ageMax = ageJoueur + 4; contexte = "amoureux";
      } else if (type === "pro") {
        ageMin = Math.max(20, ageJoueur - 10); ageMax = ageJoueur + 3; contexte = "travail";
      } else {
        ageMin = Math.max(18, ageJoueur - 30); ageMax = ageJoueur + 5; contexte = "voisinage";
      }
    }
    contexte = contexte || "hasard";

    var person = people.generate({
      currentYear: state.year,
      ageMin: ageMin,
      ageMax: ageMax,
      contexte: contexte,
      classe: state.origin && state.origin.classe ? state.origin.classe : "moyenne",
      ville: state.birthPlace ? state.birthPlace.ville : ""
    });
    if (!person) return null;

    var affection = opts.affection !== undefined ? opts.affection
      : (type === "amour" ? 30 + Math.floor(Math.random() * 20)   // un coup de foudre marque plus
                         : 20 + Math.floor(Math.random() * 20));
    var confiance = opts.confiance !== undefined ? opts.confiance : Math.round(affection * 0.7);
    var statut = opts.statut || statutFor(type, affection);

    // Lien côté PNJ
    person.liens = person.liens || [];
    person.liens.push(makePlayerLink(type, statut, affection, confiance, {
      depuis: state.year,
      dernierContact: state.year,
      connaissance: 60
    }));

    // Lien réciproque côté joueur
    if (!state.people[PLAYER_ID]) state.people[PLAYER_ID] = { id: PLAYER_ID, liens: [] };
    state.people[PLAYER_ID].liens = state.people[PLAYER_ID].liens || [];
    var sideLink = makePlayerSideLink(person, type, statut, affection, confiance, state.year);
    sideLink.connaissance = 60;
    state.people[PLAYER_ID].liens.push(sideLink);

    state.people[person.id] = person;

    // Journal
    state.history = state.history || [];
    state.history.push({
      age: state.age, year: state.year,
      title: "Rencontre",
      result: "Vous rencontrez " + person.prenom + " " + person.nom +
              (person.metier ? ", " + person.metier.toLowerCase() : "") + ".",
      type: "rencontre",
      peopleIds: [person.id]
    });
    state.yearLog = state.yearLog || [];
    state.yearLog.push("Rencontre : " + person.prenom);

    return person;
  }

  // ── CHERCHER UNE PERSONNE EXISTANTE D'UN TYPE DONNÉ ───────
  function findByType(state, type) {
    if (!state.people) return null;
    var self = state.people[PLAYER_ID];
    if (!self || !self.liens) return null;
    var candidates = self.liens.filter(function (l) { return l.role === type; });
    if (!candidates.length) return null;
    // On privilégie les liens les plus récents et les plus forts
    candidates.sort(function (a, b) { return (b.affection || 0) - (a.affection || 0); });
    return state.people[candidates[0].id] || null;
  }

  /**
   * Retrouve le PNJ lié au joueur pour un rôle donné.
   * @param {object} state
   * @param {string} role       "ami" | "amour" | "pro" | "enfant" | "famille"
   * @param {number} minAffection  affection minimale requise
   */
  function findByRole(state, role, minAffection) {
    if (!state.people) return null;
    var self = state.people[PLAYER_ID];
    if (!self || !self.liens) return null;
    var best = null, bestAff = -1;
    self.liens.forEach(function (l) {
      if (l.role !== role) return;
      if (minAffection && (l.affection || 0) < minAffection) return;
      if ((l.affection || 0) > bestAff) { bestAff = l.affection || 0; best = l; }
    });
    if (!best) return null;
    return state.people[best.id] || null;
  }

  /**
   * Change le statut d'un lien (côté joueur et côté PNJ).
   * @param {string} status "connaissance" | "flirt" | "couple" | "fiances" | "marie" | "ex" ...
   */
  function setStatus(state, personId, status) {
    var self = state.people && state.people[PLAYER_ID];
    if (self && self.liens) {
      var l = self.liens.find(function (x) { return x.id === personId; });
      if (l) l.statut = status;
    }
    var p = state.people && state.people[personId];
    if (p && p.liens) {
      var pl = p.liens.find(function (x) { return x.id === PLAYER_ID; });
      if (pl) pl.statut = status;
    }
    return true;
  }

  // ── RENCONTRES ANNUELLES SPONTANÉES ──────────────────────
  /**
   * Appelée une fois par an : de nouvelles personnes entrent dans la vie
   * du joueur (école, boulot, voisinage, rencontres amoureuses).
   */
  function annual(state) {
    var cfg = window.VIE.config.relations;
    var enc = cfg.encounters;
    if (!enc) return [];

    var bracket = (enc.byAge || []).find(function (b) { return state.age <= b.ageMax; });
    if (!bracket) return [];

    var chance = bracket.chance;
    // Le caractère du joueur influe sur les rencontres
    var pers = state.personality || {};
    if (pers.E !== undefined) chance *= (0.6 + pers.E / 100);
    if (pers.A !== undefined) chance *= (0.8 + pers.A / 200);
    if (state.stats && state.stats.social !== undefined) chance *= (0.7 + state.stats.social / 200);
    if (state.flags && state.flags.includes("introverti")) chance *= 0.7;

    if (Math.random() > chance) return [];

    var max = enc.maxNewPerYear || 1;
    var nb = 1 + (Math.random() < 0.35 ? 1 : 0);
    if (nb > max) nb = max;

    // Tirage des types selon les poids de l'âge
    var types = bracket.types || { ami: 1 };
    var pool = [];
    Object.keys(types).forEach(function (t) {
      var w = types[t];
      for (var i = 0; i < Math.round(w * 4); i++) pool.push(t);
    });
    if (!pool.length) return [];

    var created = [];
    for (var k = 0; k < nb; k++) {
      var type = pool[Math.floor(Math.random() * pool.length)];
      var p = meet(state, type);
      if (p) created.push(p);
    }
    return created;
  }

  // ── EXPORT ────────────────────────────────────────────────
  window.VIE = window.VIE || {};
  window.VIE.engine = window.VIE.engine || {};
  window.VIE.engine.encounters = {
    meet: meet,
    annual: annual,
    findByType: findByType,
    findByRole: findByRole,
    setStatus: setStatus,
    makePlayerLink: makePlayerLink,
    makePlayerSideLink: makePlayerSideLink
  };
})();
