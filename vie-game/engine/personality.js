/* ============================================================
   UNE VIE v0.5 — PERSONNALITÉ (Big Five + traits + évolution)
   ============================================================ */

(function () {
  "use strict";

  // ── TIREAGE NAISSANCE ────────────────────────────────────
  function generatePersonalityAtBirth(opts) {
    opts = opts || {};
    var parents = opts.parents || [];           // array de {personality:{O,C,E,A,N}}
    var origin = opts.origin || null;           // id origine
    var archetype = opts.archetype || null;     // id archétype
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
        // Convertir traits en biais Big Five approximatif
        var traitToBigFive = {
          loyal: {A:+10}, travailleur: {C:+10}, solidaire: {A:+10},
          perfectionniste: {C:+10}, ambitieux: {C:+10, E:+5}, casanier: {E:-10},
          orgeilleux: {A:-10, N:+5}, nostalgique: {O:-5, N:+5}, protecteur: {A:+10, C:+5},
          creatif: {O:+15}, reveur: {O:+10, N:+5}, romantique: {A:+10, N:+5},
          loyal: {A:+10}, courageux: {N:-10}, independant: {A:-5, C:+5},
          curieux: {O:+15}, intellectuel: {O:+15}, rigide: {C:+10, O:-10},
          manuel: {C:+5}, Bavard: {E:+10, A:-5}, charmeur: {E:+10, A:-5},
          fidele: {A:+15}
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
    // 1-2 traits aléatoires cohérents
    var allTraits = window.VIE.getAllDiscreteTraits ? window.VIE.getAllDiscreteTraits() : [];
    var compatible = allTraits.filter(function (t) {
      var def = window.VIE.getTrait(t);
      return def && isCompatibleWithPersonality(def, personality);
    });
    rng.shuffle(compatible).slice(0, 1 + Math.floor(Math.random() * 2)).forEach(function (t) {
      if (!traits.includes(t)) traits.push(t);
    });

    return { personality: personality, traits: traits };
  }

  function isCompatibleWithPersonality(traitDef, personality) {
    if (!traitDef.compat) return true;
    var score = 0;
    Object.keys(traitDef.compat).forEach(function (dim) {
      var target = traitDef.compat[dim];
      var actual = personality[dim] || 50;
      // Plus la personnalité est proche de la cible, plus compatible
      score -= Math.abs(actual - 50 - target) * 0.1;
    });
    return score > -15; // seuil arbitraire
  }

  // ── ÉVOLUTION ANNUELLE ───────────────────────────────────
  function evolvePersonality(state) {
    var age = state.age;
    var cfg = window.VIE.config.personality;

    // Plasticité selon âge
    var plasticity = cfg.plasticity.find(function (p) { return age <= p.ageMax; }) || cfg.plasticity[cfg.plasticity.length - 1];
    var maxDelta = plasticity.maxDelta;

    // Maturation naturelle
    var maturation = cfg.maturation;
    var deltas = { O: 0, C: 0, E: 0, A: 0, N: 0 };
    Object.keys(maturation).forEach(function (d) {
      deltas[d] += maturation[d];
    });

    // Événements marquants (via flags mémoire)
    if (state.narrativeMemory) {
      if (state.narrativeMemory.traumaRecente) {
        deltas.N += cfg.traumaMaxDelta * 0.5;
        deltas.C -= cfg.traumaMaxDelta * 0.3;
        deltas.A -= cfg.traumaMaxDelta * 0.2;
      }
      if (state.narrativeMemory.succesMajeur) {
        deltas.C += 2; deltas.confiance += 3;
      }
      if (state.narrativeMemory.therapie) {
        deltas.N -= 3; deltas.A += 2; deltas.C += 1;
      }
    }

    // Stress chronique inverse la maturation
    if (state.stats && state.stats.stress > 70) {
      deltas.N += 1; deltas.C -= 1; deltas.A -= 1;
    }

    // Appliquer avec clamp + maxDelta
    Object.keys(deltas).forEach(function (d) {
      var dlt = clamp(deltas[d], -maxDelta, maxDelta);
      state.personality[d] = clamp(state.personality[d] + dlt, 0, 100);
    });

    // Acquisition / perte traits discrets par répétition
    evolveDiscreteTraits(state);
  }

  function evolveDiscreteTraits(state) {
    // Logique simplifiée : si un comportement répété 5 fois → trait
    // Sera implémenté via interactions.js qui track les comportements
  }

  // ── INTROSPECTION (ce que le joueur voit de lui-même) ────
  function getVisiblePersonality(state) {
    var age = state.age;
    var lucidity = Math.min(100, (age - 14) * 3); // 0 à 14 ans, +3/an
    if (state.flags.includes("therapie")) lucidity += 20;
    if (state.narrativeMemory && state.narrativeMemory.traumaRecente) lucidity += 15;

    var visible = {};
    Object.keys(state.personality).forEach(function (d) {
      var real = state.personality[d];
      if (lucidity >= 80) visible[d] = real;
      else if (lucidity >= 50) visible[d] = Math.round(real * 0.7 + 50 * 0.3); // flou vers moyenne
      else visible[d] = 50; // inconnu
    });
    visible.lucidity = lucidity;
    return visible;
  }

  function getVisibleTraits(state) {
    var lucidity = getVisiblePersonality(state).lucidity;
    if (lucidity >= 70) return state.traits.slice();
    if (lucidity >= 40) return state.traits.slice(0, Math.ceil(state.traits.length * 0.6));
    return []; // "Vous ne vous connaissez pas encore bien"
  }

  // ── DESCRIPTION QUALITATIVE ──────────────────────────────
  function describePersonality(personality, traits) {
    var parts = [];
    var dims = { O: "curieux", C: "organisé", E: "sociable", A: "bienveillant", N: "anxieux" };
    Object.keys(personality).forEach(function (d) {
      var v = personality[d];
      if (v >= 70) parts.push("très " + dims[d]);
      else if (v >= 60) parts.push("assez " + dims[d]);
      else if (v <= 30) parts.push("peu " + dims[d]);
      else if (v <= 40) parts.push("plutôt " + (d === "N" ? "stable" : "réservé"));
    });
    if (traits.length) parts.push("(" + traits.slice(0, 3).join(", ") + ")");
    return parts.join(", ") || "équilibré";
  }

  // Helpers
  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  // Export
  window.VIE = window.VIE || {};
  window.VIE.engine = window.VIE.engine || {};
  window.VIE.engine.personality = {
    generateAtBirth: generatePersonalityAtBirth,
    evolve: evolvePersonality,
    getVisible: getVisiblePersonality,
    getVisibleTraits: getVisibleTraits,
    describe: describePersonality
  };
})();