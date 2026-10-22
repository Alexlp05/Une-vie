/* ============================================================
   UNE VIE v0.8 — WORLD MANAGER
   Économie, époque techno, lieu de vie, événements réels/procéduraux
   ============================================================ */

(function () {
  "use strict";

  // ── LIEUX DE VIE ───────────────────────────────────────────
  var LOCATIONS = {
    rural: {
      label: "Zone rurale",
      population: "faible",
      rencontres: 0.5,      // multiplicateur rencontres
      salaires: 0.8,        // multiplicateur salaires
      loyers: 0.5,          // multiplicateur loyers
      sante: 1.1,           // qualité santé
      culture: "traditionnelle",
      description: "Calme, nature, communauté soudée. Moins d'opportunités professionnelles."
    },
    ville_moyenne: {
      label: "Ville moyenne (50-200k hab)",
      population: "moyenne",
      rencontres: 1.0,
      salaires: 1.0,
      loyers: 1.0,
      sante: 1.0,
      culture: "mixte",
      description: "Équilibre ville/campagne. Commerces, services, vie associative."
    },
    metropole: {
      label: "Métropole (>200k hab)",
      population: "forte",
      rencontres: 1.5,
      salaires: 1.3,
      loyers: 1.8,
      sante: 0.9,
      culture: "cosmopolite",
      description: "Opportunités max, vie intense, coûts élevés, anonymat."
    },
    etranger: {
      label: "À l'étranger",
      population: "variable",
      rencontres: 1.2,
      salaires: 1.5,
      loyers: 1.3,
      sante: 1.0,
      culture: "exotique",
      description: "Nouvelle culture, langue, défis d'intégration, horizons élargis."
    }
  };

  function locationMultipliers(locId) {
    return LOCATIONS[locId] || LOCATIONS.ville_moyenne;
  }

  function getLocationMultipliers(state) {
    var locId = (state && state.world && state.world.location) || "ville_moyenne";
    return locationMultipliers(locId);
  }

  function describeLocation(locationId) {
    var loc = LOCATIONS[locationId];
    return loc ? loc.description : "";
  }

  function getTechEra(year) {
    var eras = window.VIE.config.world.techEra;
    for (var i = 0; i < eras.length; i++) {
      if (year >= eras[i].yearStart && year <= eras[i].yearEnd) return eras[i];
    }
    return eras[eras.length - 1];
  }

  // ── CRÉATION MONDE INITIAL ───────────────────────────────
  function createWorld() {
    var r = Math.random();
    var economy = r < 0.15 ? "boom" : (r < 0.8 ? "normal" : "recession");
    var startLocation = "ville_moyenne";
    var startYear = 1990 + Math.floor(Math.random() * 20);
    return {
      economy: economy,
      inflation: 1 + Math.floor(Math.random() * 5),
      event: null,
      eventHistory: [],
      techEra: getTechEra(startYear),
      location: startLocation,
      locationHistory: [{ year: startYear, location: startLocation }]
    };
  }

  // ── CHANGEMENT DE LIEU ────────────────────────────────────
  function changeLocation(state, newLocationId) {
    if (!state.world) state.world = createWorld();
    var oldLoc = state.world.location;
    if (oldLoc === newLocationId) return { success: false, reason: "Déjà à cet endroit" };
    if (!LOCATIONS[newLocationId]) return { success: false, reason: "Lieu inconnu" };

    var mult = locationMultipliers(newLocationId);
    state.world.location = newLocationId;
    state.world.locationHistory = state.world.locationHistory || [];
    state.world.locationHistory.push({ year: state.year, location: newLocationId });

    // Impact sur salaires/loyers/rencontres appliqué via finance/relations
    state.history = state.history || [];
    state.history.push({
      age: state.age, year: state.year,
      title: "Déménagement",
      result: "Vous déménagez en " + LOCATIONS[newLocationId].label + ". " + mult.description,
      type: "lieu"
    });

    return { success: true, multipliers: mult };
  }

  // ── TICK ANNUEL ──────────────────────────────────────────
  function worldTick(state) {
    if (!state.world) state.world = createWorld();
    state.world.locationHistory = state.world.locationHistory || [];
    state.world.eventHistory = state.world.eventHistory || [];
    state.history = state.history || [];

    // 1. Économie
    evolveEconomy(state.world);

    // 2. Inflation (corrélée à économie)
    var econCfg = window.VIE.config.world.economyStates[state.world.economy];
    if (econCfg) {
      state.world.inflation = Math.max(0, econCfg.inflation + (Math.random() - 0.5) * 2);
    }

    // 3. Événement monde (40% chance)
    state.worldMods = { incomeMult: 1, expenses: 0, title: null, kind: null, text: null };
    if (Math.random() < 0.4) {
      var evt = pickWorldEvent(state);
      if (evt) applyWorldEvent(state, evt);
    }

    // 4. Événements réels ancrés
    checkRealEvents(state);

    // 5. Mise à jour époque techno
    state.world.techEra = getTechEra(state.year);

    // 6. Événements politiques/sociaux (10% chance)
    maybePoliticalEvent(state);

    // 7. Migration possible (2% chance/an si insatisfaction)
    checkMigration(state);
  }

  function checkMigration(state) {
    if (Math.random() > 0.02) return;
    var currentLoc = state.world.location;
    var satisfaction = (state.stats.bonheur || 50) / 100;
    var social = (state.stats.social || 50) / 100;
    if (satisfaction < 0.3 || social < 0.3) {
      var destinations = Object.keys(LOCATIONS).filter(function (k) { return k !== currentLoc; });
      if (!destinations.length) return;
      var newLoc = destinations[Math.floor(Math.random() * destinations.length)];
      changeLocation(state, newLoc);
    }
  }

  function evolveEconomy(world) {
    var trans = window.VIE.config.world.economyTransition[world.economy];
    if (!trans) return;
    var r = Math.random();
    var cum = 0;
    for (var next in trans) {
      cum += trans[next];
      if (r < cum) { world.economy = next; break; }
    }
  }

  function pickWorldEvent(state) {
    var pool = (window.VIE.data.worldEvents || []).filter(function (e) {
      if (e.once && state.usedWorldEvents && state.usedWorldEvents[e.id]) return false;
      if (e.minAge !== undefined && e.minAge !== null && state.age < e.minAge) return false;
      return true;
    });
    if (!pool.length) return null;

    var total = pool.reduce(function (s, e) { return s + (e.weight || 1); }, 0);
    var r = Math.random() * total;
    for (var i = 0; i < pool.length; i++) {
      r -= pool[i].weight || 1;
      if (r <= 0) return pool[i];
    }
    return pool[pool.length - 1];
  }

  function applyWorldEvent(state, evt) {
    if (evt.effects && window.VIE.engine.events && window.VIE.engine.events.applyEffects) {
      // Les événements monde utilisent une map plate { sante: -8, ... }
      window.VIE.engine.events.applyEffects(state, { effects: evt.effects, result: evt.text }, null);
    }
    state.worldMods = state.worldMods || { incomeMult: 1, expenses: 0 };
    state.worldMods.incomeMult = evt.incomeMult || 1;
    state.worldMods.expenses = evt.expenses || 0;
    state.worldMods.title = evt.title;
    state.worldMods.kind = evt.kind;
    state.worldMods.text = evt.text;
    state.world.event = evt;
    state.world.eventHistory.push({ annee: state.year, event: evt.id });
    state.history.push({ age: state.age, year: state.year, title: "Monde : " + evt.title, result: evt.text, type: "monde" });
  }

  function checkRealEvents(state) {
    var realEvents = window.VIE.config.world.realEvents || {};
    var evtId = realEvents[state.year];
    if (!evtId) return;
    var already = state.world.eventHistory.some(function (h) { return h.event === evtId; });
    if (already) return;
    var evt = (window.VIE.data.worldEvents || []).find(function (e) { return e.id === evtId; });
    if (evt) {
      evt._isReal = true;
      applyWorldEvent(state, evt);
    }
  }

  // ── DISPONIBILITÉS TECHNO ────────────────────────────────
  function hasTech(state, feature) {
    var era = state.world && state.world.techEra;
    return era && era[feature] === true;
  }

  // ── ÉVÉNEMENTS POLITIQUES/SOCIAUX ────────────────────────
  function maybePoliticalEvent(state) {
    if (Math.random() >= 0.1) return;
    var events = [
      { title: "Élection présidentielle", text: "Le pays vote. L'ambiance est électrique.", kind: "politique" },
      { title: "Grève générale", text: "Transports paralysés, manifestations.", kind: "social" },
      { title: "Réforme des retraites", text: "Débats houleux, incertitude pour l'avenir.", kind: "politique" },
      { title: "Loi sociétale majeure", text: "La société évolue, pas sans heurts.", kind: "societe" },
      { title: "Crise environnementale", text: "Canicule, inondations, débats climatiques.", kind: "environnement" }
    ];
    var evt = events[Math.floor(Math.random() * events.length)];
    state.worldMods = { incomeMult: 1, expenses: 0, title: evt.title, kind: evt.kind, text: evt.text };
    state.history.push({ age: state.age, year: state.year, title: "Société : " + evt.title, result: evt.text, type: "societe" });
  }

  // Export
  window.VIE = window.VIE || {};
  window.VIE.engine = window.VIE.engine || {};
  window.VIE.engine.world = {
    create: createWorld,
    tick: worldTick,
    getTechEra: getTechEra,
    hasTech: hasTech,
    maybePolitical: maybePoliticalEvent,
    changeLocation: changeLocation,
    describeLocation: describeLocation,
    getLocationMultipliers: getLocationMultipliers,
    locationMultipliers: locationMultipliers,
    LOCATIONS: LOCATIONS
  };
})();
