/* ============================================================
   UNE VIE v0.5 — STATE MANAGER
   Initialisation, migration v0.4→v0.5, getters/setters, sauvegarde
   ============================================================ */

(function () {
  "use strict";

  var _state = null;
  var _version = "0.5.0";

  // ── INITIALISATION ÉTAT NEUF ─────────────────────────────
  function createInitialState() {
    return {
      // Version
      version: _version,

      // Identité
      name: "",
      sexe: "homme",                    // "homme" | "femme"
      orientation: null,                // "hetero" | "homo" | "bi" | "aero" (découverte ado)
      trait: null,                      // archétype de départ (id)
      archetypeBias: {},                // biais Big Five de l'archétype
      origin: null,                     // origine familiale (id)
      surname: "",                      // nom de famille
      birthYear: 0,
      birthPlace: { region: "", ville: "" },

      // Temps
      age: 0,
      year: 0,
      slot: 0,
      actionsThisYear: 0,
      maxActionsThisYear: 1,

      // Stats joueur (0-100)
      stats: {
        sante: 85, energie: 80, argent: 42,
        intelligence: 20, social: 20, bonheur: 60,
        stress: 10, apparence: 50, reputation: 50, confiance: 50
      },

      // Big Five (0-100)
      personality: { O: 50, C: 50, E: 50, A: 50, N: 50 },
      // Traits discrets (array d'ids)
      traits: [],
      // Valeurs (0-100)
      values: { famille: 50, carriere: 50, aventure: 50, argent: 50, fidelite: 50, creativite: 50, stabilite: 50, spiritualite: 50 },
      desirEnfants: "indecis",          // "veut" | "ne_veut_pas" | "indecis"

      // Économie (euros entiers)
      finance: {
        compte: 0,                      // liquidités (peut être négatif)
        epargne: { livret: 0, assuranceVie: 0, plan_retraite: 0 },
        placements: { actions_etf: 0, crypto: 0, immobilier_locatif: 0, entreprise: 0 },
        residence: { type: "parents", valeur: 0, capitalRestantDu: 0, loyer: 0 },
        dettes: [],                     // [{type, capital, taux, mensualite, finAnnee}]
        historiquePatrimoine: [],       // [{annee, net}]
        scoreCredit: 50
      },

      // Carrière
      career: null,                     // { trackId, level, sinceAge, diplome, competences{}, satisfaction }
      diplome: "aucun",
      competences: {},                  // { technique: 10, relationnel: 5, ... }
      etudes: { anneeDebut: null, filiere: null, enCours: false },

      // Logement
      housing: "parents",

      // Personnes (dictionnaire id -> personne)
      people: {},

      // Passions (0-5+)
      passions: {},

      // Habitudes (0-100 + dépendance)
      habitudes: {
        alcool: 0, tabac: 0, cannabis: 0, jeu: 0,
        sport: 0, alimentation: 50, sommeil: 50, ecrans: 0, soirees: 0, voyages: 0
      },
      dependances: {},                  // { alcool: { niveau: 0, depuis: 0, enCure: false } }

      // Flags narratifs
      flags: [],

      // Destin extraordinaire
      life: null,
      pendingOpp: null,

      // Historique
      lastCrisisAge: -10,
      history: [],                      // [{age, year, title, result, type, peopleIds[]}]
      yearLog: [],

      // Monde
      world: null,                      // WorldManager.createWorld()
      worldMods: { incomeMult: 1, expenses: 0, title: null, kind: null, text: null },

      // Mémoire narrative
      narrativeMemory: {},

      // RNG seed pour reproductibilité
      rngSeed: null
    };
  }

  // ── MIGRATION v0.4 → v0.5 ────────────────────────────────
  function migrateV04ToV05(oldState) {
    if (!oldState) return createInitialState();
    if (oldState.version && oldState.version.startsWith("0.5")) return oldState;

    var s = deepClone(oldState);
    s.version = _version;

    // 1. Sexe (par défaut homme, sera demandé à la création)
    s.sexe = s.sexe || "homme";

    // 2. Orientation (à découvrir)
    s.orientation = null;

    // 3. Big Five depuis archétype + tirage
    if (s.trait && window.VIE && window.VIE.getArchetype) {
      var arch = window.VIE.getArchetype(s.trait.id || s.trait);
      if (arch && arch.bias) {
        s.archetypeBias = arch.bias;
        // On recalculera personality dans personality.js
      }
    }
    s.personality = s.personality || { O: 50, C: 50, E: 50, A: 50, N: 50 };
    s.traits = s.traits || (arch && arch.trait ? [arch.trait] : []);

    // 4. Valeurs & désir enfants
    s.values = s.values || { famille: 50, carriere: 50, aventure: 50, argent: 50, fidelite: 50, creativite: 50, stabilite: 50, spiritualite: 50 };
    s.desirEnfants = s.desirEnfants || "indecis";

    // 5. Stats étendues
    s.stats = s.stats || {};
    s.stats.stress = s.stats.stress || 10;
    s.stats.apparence = s.stats.apparence || 50;
    s.stats.reputation = s.stats.reputation || 50;
    s.stats.confiance = s.stats.confiance || 50;
    // argent stat devient niveau de vie (sera recalculé)
    s.stats.argent = s.stats.argent || 42;

    // 6. Finance : conversion k€ → €
    var oldMoney = s.money !== undefined ? s.money * 1000 : 0;
    s.finance = s.finance || {};
    s.finance.compte = s.finance.compte || oldMoney;
    s.finance.epargne = s.finance.epargne || { livret: 0, assuranceVie: 0, plan_retraite: 0 };
    s.finance.placements = s.finance.placements || { actions_etf: 0, crypto: 0, immobilier_locatif: 0, entreprise: 0 };
    s.finance.residence = s.finance.residence || { type: s.housing || "parents", valeur: 0, capitalRestantDu: 0, loyer: 0 };
    s.finance.dettes = s.finance.dettes || [];
    s.finance.historiquePatrimoine = s.finance.historiquePatrimoine || [];
    s.finance.scoreCredit = s.finance.scoreCredit || 50;

    // 7. Carrière : mapping ancien → nouveau
    if (s.career && s.career.track) {
      s.career.track = window.VIE.mapLegacyCareer ? window.VIE.mapLegacyCareer(s.career.track) : s.career.track;
      s.career.diplome = s.career.diplome || "aucun";
      s.career.competences = s.career.competences || {};
      s.career.satisfaction = s.career.satisfaction || 50;
    }
    s.diplome = s.diplome || "aucun";
    s.competences = s.competences || {};

    // 8. Habitudes
    s.habitudes = s.habitudes || { alcool: 0, tabac: 0, cannabis: 0, jeu: 0, sport: 0, alimentation: 50, sommeil: 50, ecrans: 0, soirees: 0, voyages: 0 };
    s.dependances = s.dependances || {};

    // 9. People : migration relations[] → people{}
    s.people = s.people || {};
    if (s.relations && Array.isArray(s.relations)) {
      s.relations.forEach(function (rel, idx) {
        var pid = "p_migrated_" + idx;
        var birthYear = s.year - (rel.age || 30);
        s.people[pid] = {
          id: pid,
          prenom: rel.name || "Inconnu",
          nom: s.surname || "",
          sexe: rel.type === "mere" ? "femme" : (rel.type === "pere" ? "homme" : (Math.random() < 0.5 ? "homme" : "femme")),
          orientation: "hetero",
          naissance: birthYear,
          vivant: true,
          deces: null,
          personnalite: { O: 50, C: 50, E: 50, A: 50, N: 50 },
          traits: [],
          valeurs: { famille: 50, carriere: 50, aventure: 50, argent: 50, fidelite: 50, creativite: 50, stabilite: 50, spiritualite: 50 },
          desirEnfants: "indecis",
          apparence: 50, sante: 70, metier: "", niveauVie: 50, ville: "",
          passions: {},
          habitudes: {},
          humeur: 50,
          liens: [{
            role: rel.type || "ami",
            statut: "proche",
            affection: rel.bond || 50,
            confiance: (rel.compat || 70),
            respect: 50,
            attirance: rel.type === "amour" ? 60 : 0,
            tension: 0,
            connaissance: 50,
            depuis: rel.sinceAge ? s.year - rel.sinceAge : s.year - 5,
            dernierContact: s.year,
            contactsParAn: 6
          }],
          famille: [],
          histoire: [],
          secrets: [],
          memoire: {},
          niveauDetail: "proche"
        };
      });
    }
    // Nettoyer ancien champ
    delete s.relations;

    // 10. Flags : conserver + ajouter flags origine
    s.flags = s.flags || [];
    if (s.origin && s.origin.flag && !s.flags.includes(s.origin.flag)) {
      s.flags.push(s.origin.flag);
    }

    // 11. RNG seed
    s.rngSeed = s.rngSeed || Math.floor(Math.random() * 0x100000000);

    // 12. Naissance / lieu
    s.birthYear = s.birthYear || (s.year - s.age);
    s.birthPlace = s.birthPlace || { region: "ile_de_france", ville: "Paris" };

    return s;
  }

  // ── GETTERS / SETTERS ────────────────────────────────────
  function getState() { return _state; }
  function setState(s) { _state = s; }

  function get(key) {
    return key.split(".").reduce(function (o, k) { return (o || {})[k]; }, _state);
  }

  function set(key, value) {
    var parts = key.split(".");
    var obj = _state;
    for (var i = 0; i < parts.length - 1; i++) {
      obj = obj[parts[i]];
    }
    obj[parts[parts.length - 1]] = value;
  }

  // ── SAUVEGARDE / CHARGEMENT ──────────────────────────────
  function save() {
    if (!_state) return false;
    try {
      _state.version = _version;
      localStorage.setItem("une_vie_save_v05", JSON.stringify(_state));
      return true;
    } catch (e) {
      console.error("Erreur sauvegarde:", e);
      return false;
    }
  }

  function load() {
    try {
      var data = localStorage.getItem("une_vie_save_v05");
      if (!data) return null;
      var s = JSON.parse(data);
      _state = migrateV04ToV05(s);
      return _state;
    } catch (e) {
      console.error("Erreur chargement:", e);
      return null;
    }
  }

  function exportSave() {
    return _state ? JSON.stringify(_state) : null;
  }

  function importSave(json) {
    try {
      var s = JSON.parse(json);
      _state = migrateV04ToV05(s);
      save();
      return true;
    } catch (e) {
      console.error("Erreur import:", e);
      return false;
    }
  }

  // Helpers
  function deepClone(obj) { return JSON.parse(JSON.stringify(obj)); }

  // Export
  window.VIE = window.VIE || {};
  window.VIE.engine = window.VIE.engine || {};
  window.VIE.engine.state = {
    create: createInitialState,
    migrate: migrateV04ToV05,
    get: getState,
    set: setState,
    getPath: get,
    setPath: set,
    save: save,
    load: load,
    export: exportSave,
    import: importSave,
    version: _version
  };
})();