/* ============================================================
   UNE VIE v0.8 — PERSONNALITÉ (Big Five + traits + évolution)
   Système complet : naissance, évolution annuelle, événements,
   introspection, descriptions qualitatives, historique.
   ============================================================ */

(function () {
  "use strict";

  // ── TIREAGE NAISSANCE ────────────────────────────────────
  function generatePersonalityAtBirth(opts) {
    opts = opts || {};
    var parents = opts.parents || [];
    var origin = opts.origin || null;
    var archetype = opts.archetype || null;
    var rng = window.VIE && window.VIE.rng ? window.VIE.rng : Math;

    var cfg = window.VIE.config.personality;
    var heredity = cfg.heredity;

    // 1. Moyenne parents
    var parentMean = { O: 50, C: 50, E: 50, A: 50, N: 50 };
    if (parents.length > 0) {
      var dims = ["O", "C", "E", "A", "N"];
      dims.forEach(function (d) {
        var sum = 0;
        parents.forEach(function (p) { sum += (p.personality && p.personality[d]) || 50; });
        parentMean[d] = sum / parents.length;
      });
    }

    // 2. Biais origine
    var originBias = { O: 0, C: 0, E: 0, A: 0, N: 0 };
    if (origin && window.VIE.data.origins) {
      var o = window.VIE.data.origins.find(function (x) { return x.id === origin; });
      if (o && o.traitsBoost) {
        var traitToBigFive = {
          loyal: {A:+10}, travailleur: {C:+10}, solidaire: {A:+10},
          perfectionniste: {C:+10}, ambitieux: {C:+10, E:+5}, casanier: {E:-10},
          orgeilleux: {A:-10, N:+5}, nostalgique: {O:-5, N:+5}, protecteur: {A:+10, C:+5},
          creatif: {O:+15}, reveur: {O:+10, N:+5}, romantique: {A:+10, N:+5},
          courageux: {N:-10}, independant: {A:-5, C:+5},
          curieux: {O:+15}, intellectuel: {O:+15}, rigide: {C:+10, O:-10},
          manuel: {C:+5}, bavard: {E:+10, A:-5}, charmeur: {E:+10, A:-5},
          fidele: {A:+15}, anxieux: {N:+15}, extraverti: {E:+15},
          calme: {N:-10}, generueux: {A:+10}, orgueilleux: {N:+5, A:-5}
        };
        o.traitsBoost.forEach(function (t) {
          var bias = traitToBigFive[t];
          if (bias) Object.keys(bias).forEach(function (k) { originBias[k] = (originBias[k] || 0) + bias[k]; });
        });
      }
    }

    // 3. Biais archétype
    var archetypeBias = { O: 0, C: 0, E: 0, A: 0, N: 0 };
    if (archetype && window.VIE.getArchetype) {
      var arch = window.VIE.getArchetype(archetype);
      if (arch && arch.bias) Object.assign(archetypeBias, arch.bias);
    }

    // 4. Tirage final
    var personality = { O: 50, C: 50, E: 50, A: 50, N: 50 };
    var dims = ["O", "C", "E", "A", "N"];
    dims.forEach(function (d) {
      var val = clamp(
        heredity.parentsWeight * parentMean[d] +
        heredity.originWeight * originBias[d] +
        heredity.randomWeight * (rng.gaussian ? rng.gaussian(50, heredity.randomSigma) : (50 + (Math.random()-0.5)*2*heredity.randomSigma)) +
        archetypeBias[d],
        0, 100
      );
      personality[d] = Math.round(val);
    });

    // 5. Traits discrets initiaux
    var traits = [];
    if (archetype && window.VIE.getArchetype) {
      var arch = window.VIE.getArchetype(archetype);
      if (arch && arch.trait) traits.push(arch.trait);
    }
    var allTraits = window.VIE.getAllDiscreteTraits ? window.VIE.getAllDiscreteTraits() : [];
    var compatible = allTraits.filter(function (t) {
      var def = window.VIE.getTrait(t);
      return def && isCompatibleWithPersonality(def, personality);
    });
    rng.shuffle(compatible).slice(0, 1 + Math.floor(Math.random() * 2)).forEach(function (t) {
      if (!traits.includes(t)) traits.push(t);
    });

    // 6. Historique de personnalité pour suivi
    var history = [{
      age: 0,
      personality: JSON.parse(JSON.stringify(personality)),
      traits: traits.slice(),
      reason: "Naissance",
      description: describePersonality(personality, traits)
    }];

    return {
      personality: personality,
      traits: traits,
      history: history,
      archetype: archetype || null,
      origin: origin || null
    };
  }

  function isCompatibleWithPersonality(traitDef, personality) {
    if (!traitDef.compat) return true;
    var score = 0;
    Object.keys(traitDef.compat).forEach(function (dim) {
      var target = traitDef.compat[dim];
      var actual = personality[dim] || 50;
      score -= Math.abs(actual - 50 - target) * 0.1;
    });
    return score > -15;
  }

  // ── ÉVOLUTION ANNUELLE ───────────────────────────────────
  function evolvePersonality(state) {
    var age = state.age;
    var cfg = window.VIE.config.personality;

    var plasticity = cfg.plasticity.find(function (p) { return age <= p.ageMax; }) || cfg.plasticity[cfg.plasticity.length - 1];
    var maxDelta = plasticity.maxDelta;

    var maturation = cfg.maturation;
    var deltas = { O: 0, C: 0, E: 0, A: 0, N: 0 };
    Object.keys(maturation).forEach(function (d) {
      deltas[d] += maturation[d];
    });

    if (state.narrativeMemory) {
      if (state.narrativeMemory.traumaRecente) {
        deltas.N += cfg.traumaMaxDelta * 0.5;
        deltas.C -= cfg.traumaMaxDelta * 0.3;
        deltas.A -= cfg.traumaMaxDelta * 0.2;
      }
      if (state.narrativeMemory.succesMajeur) {
        deltas.C += 2; deltas.A += 1;
      }
      if (state.narrativeMemory.therapie) {
        deltas.N -= 3; deltas.A += 2; deltas.C += 1;
      }
      if (state.narrativeMemory.mariage) {
        deltas.A += 2; deltas.N -= 2;
      }
      if (state.narrativeMemory.divorce) {
        deltas.N += 3; deltas.A -= 2; deltas.C -= 1;
      }
      if (state.narrativeMemory.naissance_enfant) {
        deltas.A += 2; deltas.N -= 1;
      }
      if (state.narrativeMemory.deces_proche) {
        deltas.N += 2; deltas.A -= 1;
      }
    }

    if (state.stats && state.stats.stress > 70) {
      deltas.N += 1; deltas.C -= 1; deltas.A -= 1;
    }
    if (state.stats && state.stats.stress < 30) {
      deltas.N -= 1; deltas.C += 1;
    }

    if (state.stats && state.stats.bonheur >= 70) {
      deltas.N -= 1; deltas.A += 1;
    }
    if (state.stats && state.stats.bonheur <= 30) {
      deltas.N += 1; deltas.A -= 1;
    }

    if (state.stats && state.stats.energie >= 70) {
      deltas.E += 1;
    }
    if (state.stats && state.stats.energie <= 30) {
      deltas.E -= 1;
    }

    var changes = [];
    Object.keys(deltas).forEach(function (d) {
      var dlt = clamp(deltas[d], -maxDelta, maxDelta);
      if (dlt !== 0) {
        var oldVal = state.personality[d];
        state.personality[d] = clamp(state.personality[d] + dlt, 0, 100);
        changes.push({ dim: d, old: oldVal, new: state.personality[d], delta: dlt });
      }
    });

    var significantChange = changes.some(function (c) { return Math.abs(c.delta) >= 2; });
    if (significantChange || age % 5 === 0) {
      state.personalityHistory = state.personalityHistory || [];
      state.personalityHistory.push({
        age: age,
        personality: JSON.parse(JSON.stringify(state.personality)),
        traits: (state.traits || []).slice(),
        changes: changes,
        description: describePersonality(state.personality, state.traits || [])
      });
    }

    evolveDiscreteTraits(state);
  }

  function evolveDiscreteTraits(state) {
    var cfg = window.VIE.config.personality;
    var traits = state.traits || [];
    var allTraits = window.VIE.getAllDiscreteTraits ? window.VIE.getAllDiscreteTraits() : [];
    var age = state.age;
    var baseChance = 0.02;

    if (age < 25) baseChance = 0.05;
    else if (age < 40) baseChance = 0.03;
    else if (age < 60) baseChance = 0.02;
    else baseChance = 0.01;

    var personality = state.personality || { O: 50, C: 50, E: 50, A: 50, N: 50 };
    var candidateTraits = [];

    allTraits.forEach(function (t) {
      if (traits.includes(t)) return;
      var def = window.VIE.getTrait(t);
      if (!def) return;
      if (!isCompatibleWithPersonality(def, personality)) return;

      var chance = baseChance;
      if (def.compat) {
        Object.keys(def.compat).forEach(function (dim) {
          var target = def.compat[dim];
          var actual = personality[dim] || 50;
          if (Math.abs(actual - 50) >= Math.abs(target)) {
            chance += 0.02;
          }
        });
      }

      if (Math.random() < chance) {
        candidateTraits.push(t);
      }
    });

    if (candidateTraits.length > 0) {
      var newTrait = candidateTraits[Math.floor(Math.random() * candidateTraits.length)];
      traits.push(newTrait);
      state.traits = traits;

      state.personalityHistory = state.personalityHistory || [];
      var lastEntry = state.personalityHistory[state.personalityHistory.length - 1];
      if (lastEntry && lastEntry.age === state.age) {
        lastEntry.newTraits = lastEntry.newTraits || [];
        lastEntry.newTraits.push(newTrait);
      }
    }

    if (age > 60 && traits.length > 3 && Math.random() < 0.01) {
      var loseTrait = traits[Math.floor(Math.random() * traits.length)];
      var arch = state.archetype ? window.VIE.getArchetype(state.archetype) : null;
      if (arch && arch.trait === loseTrait) return;
      var idx = traits.indexOf(loseTrait);
      if (idx >= 0) {
        traits.splice(idx, 1);
        state.traits = traits;
      }
    }
  }

  // ── INTROSPECTION ────
  function getVisiblePersonality(state) {
    var age = state.age;
    var lucidity = Math.min(100, Math.max(0, (age - 14) * 3));
    if (state.flags && state.flags.includes("therapie")) lucidity += 20;
    if (state.narrativeMemory && state.narrativeMemory.traumaRecente) lucidity += 15;
    if (age >= 60) lucidity = Math.min(100, lucidity + 10);

    var visible = {};
    Object.keys(state.personality).forEach(function (d) {
      var real = state.personality[d];
      if (lucidity >= 85) visible[d] = real;
      else if (lucidity >= 65) visible[d] = Math.round(real * 0.8 + 50 * 0.2);
      else if (lucidity >= 45) visible[d] = Math.round(real * 0.6 + 50 * 0.4);
      else if (lucidity >= 25) visible[d] = Math.round(real * 0.4 + 50 * 0.6);
      else visible[d] = 50;
    });
    visible.lucidity = lucidity;
    return visible;
  }

  function getVisibleTraits(state) {
    var lucidity = getVisiblePersonality(state).lucidity;
    if (lucidity >= 80) return (state.traits || []).slice();
    if (lucidity >= 60) return (state.traits || []).slice(0, Math.ceil((state.traits || []).length * 0.75));
    if (lucidity >= 40) return (state.traits || []).slice(0, Math.ceil((state.traits || []).length * 0.5));
    if (lucidity >= 25) return (state.traits || []).slice(0, 1);
    return [];
  }

  // ── DESCRIPTION QUALITATIVE ──────────────────────────────
  function describePersonality(personality, traits) {
    var parts = [];
    var dims = { O: "curieux", C: "organisé", E: "sociable", A: "bienveillant", N: "anxieux" };
    var dimNames = { O: "Ouverture", C: "Conscience", E: "Extraversion", A: "Agréabilité", N: "Névrosisme" };
    Object.keys(personality).forEach(function (d) {
      var v = personality[d];
      var label = dimNames[d] || d;
      if (v >= 85) parts.push("très " + dims[d] + " (" + label + ")");
      else if (v >= 70) parts.push("assez " + dims[d] + " (" + label + ")");
      else if (v >= 60) parts.push("plutôt " + dims[d] + " (" + label + ")");
      else if (v <= 15) parts.push("très peu " + dims[d] + " (" + label + ")");
      else if (v <= 25) parts.push("peu " + dims[d] + " (" + label + ")");
      else if (v <= 35) parts.push("moins " + dims[d] + " (" + label + ")");
      else if (v <= 45) parts.push("plutôt " + (d === "N" ? "stable" : "réservé") + " (" + label + ")");
    });
    if (traits.length) parts.push("Traits : " + traits.slice(0, 4).join(", "));
    return parts.length ? parts.join(", ") : "équilibré";
  }

  function getPersonalityHistory(state) {
    return state.personalityHistory || [];
  }

  function getPersonalitySummary(state) {
    var pers = state.personality || { O: 50, C: 50, E: 50, A: 50, N: 50 };
    var traits = state.traits || [];
    var visible = getVisiblePersonality(state);
    var dominant = [];
    Object.keys(pers).forEach(function (d) {
      var v = pers[d];
      if (v >= 75) dominant.push({ dim: d, val: v, name: dimNames[d] || d });
      else if (v <= 25) dominant.push({ dim: d, val: v, name: dimNames[d] || d, inverse: true });
    });
    dominant.sort(function (a, b) { return Math.abs(b.val - 50) - Math.abs(a.val - 50); });
    return {
      personality: pers,
      visible: visible,
      traits: traits,
      dominant: dominant.slice(0, 3),
      description: describePersonality(pers, traits),
      history: getPersonalityHistory(state)
    };
  }

  var dimNames = { O: "Ouverture", C: "Conscience", E: "Extraversion", A: "Agréabilité", N: "Névrosisme" };

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  window.VIE = window.VIE || {};
  window.VIE.engine = window.VIE.engine || {};
  window.VIE.engine.personality = {
    generateAtBirth: generatePersonalityAtBirth,
    evolve: evolvePersonality,
    getVisible: getVisiblePersonality,
    getVisibleTraits: getVisibleTraits,
    describe: describePersonality,
    getPersonalityHistory: getPersonalityHistory,
    getPersonalitySummary: getPersonalitySummary
  };
})();