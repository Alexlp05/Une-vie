/* ============================================================
   UNE VIE v0.5 — EVENT ENGINE
   Sélection, bind, résolution probabiliste, événements passifs
   ============================================================ */

(function () {
  "use strict";

  var _recentEvents = [];           // IDs récents (anti-répétition)
  var _categoryLastPlayed = {};     // catégorie -> dernière année jouée
  var _usedEvents = {};             // événements once:true déjà joués
  var _usedOpp = {};                // opportunités déjà proposées
  var _usedWorldEvents = {};        // événements monde once:true

  // ── RÉCUPÉRATION TOUS ÉVÉNEMENTS ─────────────────────────
  function getAllEvents() {
    var all = [];
    // 1. Événements legacy (data.js) — tableau global EVENTS
    if (typeof EVENTS !== "undefined" && Array.isArray(EVENTS)) {
      EVENTS.forEach(function (e) { all.push(e); });
    }
    // 2. Événements modulaires (window.VIE.data.events_*)
    var keys = Object.keys(window.VIE.data || {}).filter(function (k) { return k.startsWith("events_"); });
    keys.forEach(function (k) {
      if (Array.isArray(window.VIE.data[k])) all.push.apply(all, window.VIE.data[k]);
    });
    // 3. Dédupliquer par id (le legacy gagne en cas de doublon)
    var seen = {};
    var unique = [];
    for (var i = 0; i < all.length; i++) {
      var id = all[i].id;
      if (id && seen[id]) continue;
      if (id) seen[id] = true;
      unique.push(all[i]);
    }
    return unique;
  }

  function getEventsByType(type) {
    return getAllEvents().filter(function (e) { return e.type === type; });
  }

  function getMilestones() {
    return window.VIE.data.milestones || {};
  }

  function getOpportunities() {
    return window.VIE.data.opportunities || [];
  }

  function getWorldEvents() {
    return window.VIE.data.worldEvents || [];
  }

  // ── FILTRAGE DE BASE ─────────────────────────────────────
  function baseFilters(event, state, opts) {
    opts = opts || {};
    // Stage
    var stage = stageForAge(state.age);
    if (!opts.ignoreStage && event.stage && event.stage !== stage) return false;

    // Once
    if (!opts.ignoreUsed && event.once !== false && _usedEvents[event.id]) return false;

    // Récence
    if (!opts.ignoreRecent && _recentEvents.includes(event.id)) return false;

    // Cooldown catégorie
    var cfg = window.VIE.data.eventsConfig;
    if (cfg && event.category && cfg.categoryCooldowns[event.category]) {
      var last = _categoryLastPlayed[event.category] || -100;
      if (state.year - last < cfg.categoryCooldowns[event.category]) return false;
    }

    // Requiert relation
    if (event.requiresRelation) {
      var req = event.requiresRelation;
      var found = Object.values(state.people).some(function (p) {
        return p.liens.some(function (l) {
          return l.role === req.type && (req.minBond ? l.affection >= req.minBond : true);
        });
      });
      if (!found) return false;
    }

    // NotRelation (remplacé par requêtes)
    if (event.notRelation) {
      var has = Object.values(state.people).some(function (p) {
        return p.liens.some(function (l) { return l.role === event.notRelation.type; });
      });
      if (has) return false;
    }

    // Requiert passion
    if (event.requiresPassion) {
      var pass = event.requiresPassion;
      var level = typeof pass === "number" ? pass : 1;
      var has = Object.keys(state.passions || {}).some(function (p) {
        return (typeof pass === "string" ? p === pass : true) && (state.passions[p] || 0) >= level;
      });
      if (!has) return false;
    }

    // Flags
    if (event.requiresFlag && !state.flags.includes(event.requiresFlag)) return false;
    if (event.notFlag && state.flags.includes(event.notFlag)) return false;

    // Origine familiale
    if (event.requiresFamily && state.origin && state.origin.flag !== event.requiresFamily) return false;

    // Carrière
    if (event.requiresCareer && !state.career) return false;
    if (event.requiresCareerLevel && state.career && state.career.level < event.requiresCareerLevel) return false;

    // Sexe joueur
    if (event.requiresSexe && state.sexe !== event.requiresSexe) return false;

    // Destin de vie requis (vies extraordinaires)
    if (event.requiresLife && state.life !== event.requiresLife) return false;

    // Âge min/max (null = pas de limite)
    if (event.minAge !== undefined && event.minAge !== null && state.age < event.minAge) return false;
    if (event.maxAge !== undefined && event.maxAge !== null && state.age > event.maxAge) return false;

    // Condition custom (fonction)
    if (event.customCond && !event.customCond(state)) return false;

    // BIND : liaison à des personnes spécifiques
    if (event.bind) {
      if (!resolveBind(event.bind, state)) return false;
    }

    return true;
  }

  // ── STAGE PAR ÂGE ────────────────────────────────────────
  function stageForAge(age) {
    if (age <= 5) return "bebe";
    if (age <= 12) return "enfance";
    if (age <= 18) return "ado";
    if (age <= 29) return "jeune";
    if (age <= 49) return "adulte";
    if (age <= 65) return "maturite";
    if (age <= 79) return "retraite";
    return "vieillesse";
  }

  // ── RÉSOLUTION BIND ──────────────────────────────────────
  // event.bind = { p1: { role:"ami", minAffection:50, trait:["anxieux"] }, p2: { role:"amour", ... } }
  // Retourne { p1: personObj, p2: personObj } ou false
  function resolveBind(bindSpec, state) {
    var bound = {};
    for (var key in bindSpec) {
      var spec = bindSpec[key];
      var candidates = window.VIE.engine.people.query(state, {
        role: spec.role,
        minAffection: spec.minAffection,
        trait: spec.trait,
        ageRange: spec.ageRange,
        vivant: spec.vivant !== false
      });
      if (!candidates.length) return false;
      // Choisir le plus pertinent (affection max)
      var chosen = candidates.reduce(function (best, p) {
        var lien = p.liens.find(function (l) { return l.role === spec.role; });
        var aff = lien ? lien.affection : 0;
        return aff > (best._aff || -1) ? (best._aff = aff, best) : best;
      });
      bound[key] = chosen;
    }
    return bound;
  }

  // ── SÉLECTION ÉVÉNEMENT PRINCIPAL ────────────────────────
  function pickMainEvent(state) {
    // 1. Milestone (âge forcé)
    var ms = pickMilestone(state);
    if (ms) return ms;

    // 2. Opportunité en attente
    if (state.pendingOpp) {
      var opp = state.pendingOpp;
      state.pendingOpp = null;
      return makeOpportunityEvent(opp, state);
    }

    // 3. Événement de stage (pool principal)
    var stageKey = stageForAge(state.age);
    var pool = getAllEvents().filter(function (e) {
      return e.type !== "aleatoire" && e.type !== "crise" && e.type !== "passif" &&
             e.stage === stageKey && baseFilters(e, state);
    });

    if (pool.length) {
      // Poids dynamiques
      var weighted = applyDynamicWeights(pool, state);
      return weightedPick(weighted);
    }

    return null;
  }

  function applyDynamicWeights(pool, state) {
    var cfg = window.VIE.data.eventsConfig;
    if (!cfg) return pool.map(function (e) { return { item: e, weight: e.weight || 1 }; });

    // Bonus des vœux de fin d'année (active pour 1 an)
    // Calcul direct depuis state.wishes pour éviter toute dépendance à window.VIE.game
    var wishBonuses = {};
    if (state && state.wishes) {
      var now = state.year || 0;
      state.wishes.forEach(function (w) {
        if (now < w.yearStart + w.duration) {
          wishBonuses[w.stat] = (wishBonuses[w.stat] || 0) + (w.bonus || 0.20);
        }
      });
    }

    return pool.map(function (e) {
      var weight = e.weight || 1;
      // Traits joueur
      (state.traits || []).forEach(function (trait) {
        var mults = cfg.dynamicWeights[trait];
        if (mults) {
          Object.keys(mults).forEach(function (cat) {
            if (e.category === cat || e.type === cat) weight *= mults[cat];
          });
        }
      });
      // Stats
      if (state.stats.social < 30 && e.category === "rencontre") weight *= 1.5;
      if (state.stats.argent < 20 && e.category === "argent") weight *= 1.5;
      if (state.stats.sante < 30 && e.category === "sante") weight *= 1.5;
      // Bonus vœux : booste les catégories/types correspondant au vœu
      Object.keys(wishBonuses).forEach(function (wishStat) {
        var mult = 1 + wishBonuses[wishStat];
        if (e.category === wishStat || e.type === wishStat || e.stat === wishStat || e.id === wishStat) weight *= mult;
        // Bonus spécial "tranquillite" : réduit les crises
        if (wishStat === "tranquillite" && e.type === "crise") weight *= 0.5;
      });
      return { item: e, weight: Math.max(0.1, weight) };
    });
  }

  // ── ÉVÉNEMENTS ALÉATOIRES (pondérés) ─────────────────────
  function pickRandomEvent(state) {
    var pool = getEventsByType("aleatoire").filter(function (e) { return baseFilters(e, state); });
    if (!pool.length) return null;
    var weighted = applyDynamicWeights(pool, state);
    return weightedPick(weighted);
  }

  // ── CRISES ───────────────────────────────────────────────
  function pickCrisisEvent(state) {
    // Cooldown 3 ans
    if (state.age - (state.lastCrisisAge || -10) < 3) return null;

    var pool = getEventsByType("crise").filter(function (e) {
      return baseFilters(e, state) && (!e.crisisCond || e.crisisCond(state));
    });
    if (!pool.length) return null;

    // Priorité : crise la plus sévère (condition la plus restrictive)
    var triggered = null;
    var bestScore = -1;
    pool.forEach(function (e) {
      var score = e.severity || e.weight || 1;
      if (score > bestScore) { bestScore = score; triggered = e; }
    });

    if (triggered) {
      state.lastCrisisAge = state.age;
      return triggered;
    }
    return null;
  }

  // ── ÉVÉNEMENTS PASSIFS (sans choix) ──────────────────────
  function pickPassiveEvents(state, count) {
    count = count || 1;
    var cfg = window.VIE.data.eventsConfig;
    if (!cfg) return [];

    // Calcul chance selon âge
    var ageFactor = cfg.passiveEvents.baseChancePerYear;
    var ageChances = cfg.passiveEvents.ageChances || {};
    for (var i = 0; i < ageChances.length; i++) {
      if (state.age <= ageChances[i].ageMax) { ageFactor = ageChances[i].chance; break; }
    }

    var passivePool = getEventsByType("passif").filter(function (e) { return baseFilters(e, state); });
    var results = [];
    for (var i = 0; i < count; i++) {
      if (Math.random() > ageFactor) break;
      if (!passivePool.length) break;
      var weighted = applyDynamicWeights(passivePool, state);
      var evt = weightedPick(weighted);
      if (evt) {
        results.push(evt);
        // Retirer du pool pour cette année
        passivePool = passivePool.filter(function (e) { return e.id !== evt.id; });
      }
    }
    return results;
  }

  // ── OPPORTUNITÉS (DESTINS EXTRAORDINAIRES) ───────────────
  function checkOpportunities(state) {
    if (state.life || state.pendingOpp) return;
    var opps = getOpportunities();
    for (var i = 0; i < opps.length; i++) {
      var opp = opps[i];
      if (_usedOpp[opp.id]) continue;
      if (state.age < opp.ageMin) continue;
      if (opp.ageMax && state.age > opp.ageMax) continue;
      if (opp.cond(state) && Math.random() < 0.10) {
        state.pendingOpp = opp;
        _usedOpp[opp.id] = true;
        return;
      }
    }
  }

  function makeOpportunityEvent(opp, state) {
    return {
      id: "opp_" + opp.id,
      stage: stageForAge(state.age),
      title: "Une grande opportunité",
      text: opp.intro + "\n\n[Chemin : " + opp.path + "]",
      choices: opp.choices,
      isOpportunity: true,
      oppPath: opp.path,
      type: "vie"
    };
  }

  // ── ÉVÉNEMENTS MONDE ─────────────────────────────────────
  function pickWorldEvent(state) {
    var pool = getWorldEvents().filter(function (e) {
      if (e.once && _usedWorldEvents[e.id]) return false;
      if (e.minAge !== undefined && e.minAge !== null && state.age < e.minAge) return false;
      return true;
    });
    if (!pool.length) return null;
    var weighted = pool.map(function (e) { return { item: e, weight: e.weight || 1 }; });
    var evt = weightedPick(weighted);
    if (evt && evt.once) _usedWorldEvents[evt.id] = true;
    return evt;
  }

  // ── ORCHESTRATEUR TOUR ───────────────────────────────────
  function chooseEventForAction(state) {
    // Priorité : Milestone > Opportunité > Aléatoire 20% > Crise > Stage > Générique > Passif
    var ms = pickMilestone(state);
    if (ms) return ms;

    var opp = state.pendingOpp ? makeOpportunityEvent(state.pendingOpp, state) : null;
    if (opp) { state.pendingOpp = null; return opp; }

    if (Math.random() < 0.20) {
      var rnd = pickRandomEvent(state);
      if (rnd) return rnd;
    }

    var cr = pickCrisisEvent(state);
    if (cr) return cr;

    var main = pickMainEvent(state);
    if (main) return main;

    // Fallback générique (type "vie" rejouable, même stage)
    var generic = getAllEvents().filter(function (e) {
      return e.type === "vie" && e.once === false && baseFilters(e, state);
    });
    if (generic.length) return generic[Math.floor(Math.random() * generic.length)];

    // Fallback 2 : événement rejouable d'un stage voisin (stade ignoré)
    var neighbours = getAllEvents().filter(function (e) {
      return e.type === "vie" && e.once === false &&
             baseFilters(e, state, { ignoreStage: true, ignoreRecent: true });
    });
    if (neighbours.length) {
      var near = neighbours.filter(function (e) {
        return e.stage === stageForAge(state.age) || e.stage === null || e.stage === undefined;
      });
      var pool2 = near.length ? near : neighbours;
      return pool2[Math.floor(Math.random() * pool2.length)];
    }

    // Fallback 3 : n'importe quel événement rejouable, en ignorant les filtres de récence
    var anyEvent = getAllEvents().filter(function (e) {
      return e.once === false && e.type !== "passif" &&
             baseFilters(e, state, { ignoreStage: true, ignoreRecent: true, ignoreUsed: true });
    });
    if (anyEvent.length) return anyEvent[Math.floor(Math.random() * anyEvent.length)];

    // Fallback 4 : événement procédural (le jeu ne doit jamais s'arrêter faute de contenu)
    if (window.__TRACE_EV) console.log("[engine] Pool épuisé → événement procédural à l'âge " + state.age);
    return makeRoutineEvent(state);
  }

  // ── ÉVÉNEMENT PROCÉDURAL DE SECOURS ─────────────────────
  var ROUTINE_TEXTS = [
    "Une journée comme les autres. Vous avancez, un pas après l'autre.",
    "Le temps passe, discret et régulier, comme un filet d'eau.",
    "Rien de notable aujourd'hui. Et c'est très bien ainsi.",
    "Les heures s'écoulent. Le monde continue autour de vous.",
    "Une journée ordinaire, cédée à la routine et aux petites choses."
  ];

  function makeRoutineEvent(state) {
    var flavour = ROUTINE_TEXTS[Math.floor(Math.random() * ROUTINE_TEXTS.length)];
    return {
      id: "routine_" + state.age + "_" + Math.floor(Math.random() * 1000),
      stage: stageForAge(state.age),
      type: "vie",
      category: "quotidien",
      once: false,
      title: "Le quotidien",
      text: flavour,
      choices: [
        {
          text: "Continuer à avancer",
          effects: { sante: 1, bonheur: 1 },
          result: "Vous avancez. Un peu plus loin, un peu plus léger."
        },
        {
          text: "Prendre le temps de souffler",
          effects: { energie: 3, bonheur: 2 },
          result: "Vous soufflez. Le temps, parfois, se laisse rattraper."
        }
      ]
    };
  }

  function pickMilestone(state) {
    var ms = getMilestones();
    for (var age in ms) {
      if (state.age >= parseInt(age, 10) && !_usedEvents[ms[age].id]) return ms[age];
    }
    return null;
  }

  // ── RÉSOLUTION CHOIX ─────────────────────────────────────
  function resolveChoice(state, event, choice, choiceIdx, boundPeople) {
    // Effet probabiliste
    var effective = choice;
    if (typeof choice.chance === "number") {
      var roll = Math.random();
      var success = roll < choice.chance;
      // Modificateur compatibilité si bind people
      if (boundPeople && choice.compatMod) {
        // TODO: calculer mod depuis compatibilité
      }
      effective = success ? {
        effects: choice.goodEffects || {},
        result: choice.goodResult || choice.result,
        flag: choice.flag, unflag: choice.unflag,
        relation: choice.relation, housing: choice.housing,
        passion: choice.passion, passionDelta: choice.passionDelta,
        career: choice.career, retire: choice.retire,
        careerAdvance: choice.careerAdvance, careerBoost: choice.careerBoost,
        personality: choice.personality, traitGain: choice.traitGain,
        habit: choice.habit, habitDelta: choice.habitDelta,
        secret: choice.secret, invest: choice.invest
      } : {
        effects: choice.badEffects || {},
        result: choice.badResult || choice.result,
        flag: choice.flag, unflag: choice.unflag,
        relation: choice.relation, housing: choice.housing,
        passion: choice.passion, passionDelta: choice.passionDelta,
        career: choice.career, retire: choice.retire,
        careerAdvance: choice.careerAdvance, careerBoost: choice.careerBoost
      };
    }

    // Appliquer effets via engine centralisé
    var results = applyEffects(state, effective, boundPeople);

    // Un destin (opportunité) fixe le parcours de vie
    if (event.isOpportunity && event.oppPath && !state.life) {
      state.life = event.oppPath;
      state.history = state.history || [];
      state.history.push({
        age: state.age, year: state.year,
        title: "Un destin s'ouvre : " + event.oppPath,
        result: "Votre vie prend une direction inattendue.",
        type: "destin"
      });
    }

    // Marquer événement joué
    if (event.once !== false) _usedEvents[event.id] = true;
    _recentEvents.push(event.id);
    if (_recentEvents.length > (window.VIE.data.eventsConfig?.recentMemorySize || 30)) _recentEvents.shift();

    // Catégorie cooldown
    if (event.category) _categoryLastPlayed[event.category] = state.year;

    // Mémoire narrative
    if (event.memory) {
      state.narrativeMemory = state.narrativeMemory || {};
      Object.assign(state.narrativeMemory, event.memory);
    }

    return { ...results, event: event, choice: choice, boundPeople: boundPeople };
  }

  // ── MARQUER UN ÉVÉNEMENT COMME JOUÉ ───────────────────────
  // Utilisé pour les événements passifs (sans choix) : ils ne passent
  // pas par resolveChoice, il faut donc les enregistrer ici.
  function markPlayed(event) {
    if (!event || !event.id) return;
    if (event.once !== false) _usedEvents[event.id] = true;
    _recentEvents.push(event.id);
    if (_recentEvents.length > (window.VIE.data.eventsConfig?.recentMemorySize || 30)) _recentEvents.shift();
  }

  // ── APPLICATION EFFETS ───────────────────────────────────
  function applyEffects(state, fx, boundPeople) {
    var deltas = [];
    var notes = [];

    // Stats
    var statKeys = ["sante", "energie", "argent", "intelligence", "social", "bonheur", "stress", "apparence", "reputation", "confiance"];
    Object.keys(fx.effects || {}).forEach(function (k) {
      var v = fx.effects[k];
      if (statKeys.includes(k)) {
        var delta = Array.isArray(v) ? (v[0] + Math.random() * (v[1] - v[0])) : v;
        delta = Math.round(delta);
        var old = state.stats[k];
        state.stats[k] = clamp(state.stats[k] + delta, 0, 100);
        if (state.stats[k] !== old) deltas.push({ stat: k, delta: delta, label: window.VIE.config.stats.labels[k] });
      } else if (k === "invest_stocks" || k === "invest_realestate" || k === "invest_business") {
        var delta = Math.round(Array.isArray(v) ? (v[0] + Math.random() * (v[1] - v[0])) : v);
        state.finance.placements[k.replace("invest_", "")] += delta;
        state.finance.compte -= delta;
        deltas.push({ finance: k, delta: delta });
      }
    });

    // Flags
    if (fx.flag) { if (!state.flags.includes(fx.flag)) state.flags.push(fx.flag); }
    if (fx.unflag) { var i = state.flags.indexOf(fx.unflag); if (i >= 0) state.flags.splice(i, 1); }

    // Relation
    if (fx.relation) {
      var targetKey = fx.relation.target || "p1";
      var person = boundPeople ? boundPeople[targetKey] : null;

      // Événement qui crée une nouvelle relation : on génère le PNJ
      if (!person && fx.relation.create && window.VIE.engine.encounters) {
        person = window.VIE.engine.encounters.meet(state, fx.relation.type || "ami", {
          affection: fx.relation.delta,
          confiance: fx.relation.delta
        });
        if (person) notes.push("Nouvelle rencontre : " + person.prenom);
      }

      // Sinon : on vise le partenaire existant du bon type
      if (!person && window.VIE.engine.encounters) {
        person = window.VIE.engine.encounters.findByRole(state, fx.relation.type || "amour");
      }

      if (person) {
        applyRelationToPerson(state, person, fx.relation);
        notes.push("Lien avec " + person.prenom + " mis à jour");

        // Le mariage est un statut de lien, pas seulement un flag
        if (fx.flag === "marie") {
          window.VIE.engine.encounters.setStatus(state, person.id, "marie");
          state.history = state.history || [];
          state.history.push({
            age: state.age, year: state.year,
            title: "Mariage avec " + person.prenom,
            result: "Vous vous mariez. Deux vies, un même chemin.",
            type: "relation", peopleIds: [person.id]
          });
        }
        if (fx.flag === "divorce") {
          window.VIE.engine.encounters.setStatus(state, person.id, "ex");
          state.history = state.history || [];
          state.history.push({
            age: state.age, year: state.year,
            title: "Divorce avec " + person.prenom,
            result: "Vous prenez vos chemins séparés.",
            type: "relation", peopleIds: [person.id]
          });
        }
        // Infidélité : un secret est enfoui chez le partenaire
        if (fx.flag === "infidelite") {
          person.memoire = person.memoire || {};
          person.memoire.infidelite = { decouvert: false, depuis: state.year };
          person.secrets = person.secrets || [];
          if (person.secrets.indexOf("infidelite") < 0) person.secrets.push("infidelite");
        }
      }
    }

    // Logement
    if (fx.housing) applyHousing(state, fx.housing);

    // Passion
    if (fx.passion) {
      var delta = fx.passionDelta || 1;
      state.passions[fx.passion] = clamp((state.passions[fx.passion] || 0) + delta, 0, 10);
      notes.push("Passion " + fx.passion + " " + (delta > 0 ? "+" : "") + delta);
    }

    // Carrière
    if (fx.career) setCareer(state, fx.career);
    if (fx.retire) { state.career = null; notes.push("Retraite prise"); }
    if (fx.careerAdvance) advanceCareer(state);
    if (fx.careerBoost) boostCareer(state);

    // Personnalité
    if (fx.personality) {
      Object.keys(fx.personality).forEach(function (d) {
        state.personality[d] = clamp(state.personality[d] + fx.personality[d], 0, 100);
      });
      notes.push("Personnalité évoluée");
    }
    if (fx.traitGain) {
      if (!state.traits.includes(fx.traitGain)) state.traits.push(fx.traitGain);
      notes.push("Nouveau trait : " + fx.traitGain);
    }

    // Habitudes
    // Le champ peut être au premier niveau (`fx.habit`) ou imbriqué dans
    // `effects` (format utilisé par les événements « vices »).
    var habitKey = fx.habit || (fx.effects && fx.effects.habit);
    if (habitKey) {
      var h = habitKey;
      var d = fx.habitDelta !== undefined ? fx.habitDelta
            : (fx.effects && fx.effects.habitDelta !== undefined ? fx.effects.habitDelta : 5);
      state.habitudes = state.habitudes || {};
      state.habitudes[h] = clamp((state.habitudes[h] || 0) + d, 0, 100);
      notes.push("Habitude " + h + " " + (d > 0 ? "+" : "") + d);
    }

    // Secret
    if (fx.secret) {
      var targetKey = fx.secret.target || "p1";
      var person = boundPeople?.[targetKey];
      if (person) {
        person.memoire = person.memoire || {};
        person.memoire[fx.secret.key] = { decouvert: false, depuis: state.year };
        notes.push("Secret partagé avec " + person.prenom);
      }
    }

    // Investissements (raccourci)
    if (fx.invest) {
      Object.keys(fx.invest).forEach(function (k) {
        var delta = Math.round(fx.invest[k]);
        state.finance.placements[k] += delta;
        state.finance.compte -= delta;
        deltas.push({ finance: k, delta: delta });
      });
    }

    // Résultat narratif
    var resultText = fx.result || "Vous avancez dans la vie.";

    return { deltas: deltas, notes: notes, resultText: resultText, result: fx.result };
  }

  // ── HELPERS RELATION / LOGEMENT / CARRIÈRE ───────────────
  function applyRelationToPerson(state, person, rel) {
    var PLAYER_ID = "self";
    var role = rel.type || "ami";

    // Lien du PNJ vers le joueur
    person.liens = person.liens || [];
    var playerLien = person.liens.find(function (l) { return l.id === PLAYER_ID; });
    if (!playerLien) {
      playerLien = {
        id: PLAYER_ID, role: role, statut: "connaissance",
        affection: 0, confiance: 0, respect: 50, attirance: 0, tension: 0,
        connaissance: 40, depuis: state.year, dernierContact: state.year, contactsParAn: 0
      };
      person.liens.push(playerLien);
    }

    if (rel.create) {
      playerLien.role = role;
      playerLien.affection = rel.delta || 20;
      playerLien.confiance = rel.delta || 20;
      playerLien.attirance = role === "amour" ? (rel.delta || 20) : 0;
    } else {
      playerLien.affection = clamp(playerLien.affection + (rel.delta || 0), 0, 100);
    }

    // Lien réciproque côté joueur (pour l'onglet « Proches »)
    if (!state.people) state.people = {};
    if (!state.people[PLAYER_ID]) state.people[PLAYER_ID] = { id: PLAYER_ID, liens: [] };
    var self = state.people[PLAYER_ID];
    self.liens = self.liens || [];
    var sideLien = self.liens.find(function (l) { return l.id === person.id; });
    if (!sideLien) {
      sideLien = {
        id: person.id, role: role, relation: person.sexe === "femme" && role === "amour" ? "amie" : role,
        statut: "connaissance",
        affection: playerLien.affection, confiance: playerLien.confiance, respect: 50,
        attirance: playerLien.attirance || 0, tension: 0, connaissance: 40,
        depuis: state.year, dernierContact: state.year, contactsParAn: 0
      };
      self.liens.push(sideLien);
    } else {
      sideLien.affection = playerLien.affection;
      sideLien.confiance = playerLien.confiance;
      sideLien.role = role;
    }
  }

  function applyHousing(state, housingId) {
    // TODO: implémenter via finance.js
  }

  function setCareer(state, trackId) {
    var track = window.VIE.getCareerTrack(trackId);
    if (!track) return;
    var canonical = window.VIE.mapLegacyCareer ? window.VIE.mapLegacyCareer(trackId) : trackId;
    state.career = { track: canonical, level: 0, sinceAge: state.age, diplome: state.diplome, competences: {}, satisfaction: 50 };
  }

  function advanceCareer(state) {
    if (!state.career) return;
    var track = window.VIE.getCareerTrack(state.career.track);
    if (!track) return;
    var nextLevel = state.career.level + 1;
    if (nextLevel < track.levels.length) {
      var req = track.levels[nextLevel].req || {};
      var ok = Object.keys(req).every(function (k) { return (state.competences[k] || 0) >= req[k]; });
      if (ok) { state.career.level = nextLevel; }
    }
  }

  function boostCareer(state) {
    if (state.career) {
      var track = window.VIE.getCareerTrack(state.career.track);
      if (track && state.career.level + 1 < track.levels.length) {
        state.career.level++;
      }
    }
  }

  // ── CHOIX PONDÉRÉ ────────────────────────────────────────
  function weightedPick(arr) {
    if (!arr || !arr.length) return null;
    var total = arr.reduce(function (s, e) { return s + e.weight; }, 0);
    var r = Math.random() * total;
    for (var i = 0; i < arr.length; i++) {
      r -= arr[i].weight;
      if (r <= 0) return arr[i].item;
    }
    return arr[arr.length - 1].item;
  }

  // Helpers
  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  // Export
  window.VIE = window.VIE || {};
  window.VIE.engine = window.VIE.engine || {};
  window.VIE.engine.events = {
    pickMain: pickMainEvent,
    pickRandom: pickRandomEvent,
    pickCrisis: pickCrisisEvent,
    pickPassive: pickPassiveEvents,
    pickWorld: pickWorldEvent,
    chooseForAction: chooseEventForAction,
    checkOpportunities: checkOpportunities,
    resolveChoice: resolveChoice,
    markPlayed: markPlayed,
    applyEffects: applyEffects,
    baseFilters: baseFilters,
    getAll: getAllEvents,
    getMilestones: getMilestones,
    getOpportunities: getOpportunities,
    _recentEvents: _recentEvents,
    _usedEvents: _usedEvents,
    _usedOpp: _usedOpp,
    _usedWorldEvents: _usedWorldEvents,
    _categoryLastPlayed: _categoryLastPlayed
  };
})();