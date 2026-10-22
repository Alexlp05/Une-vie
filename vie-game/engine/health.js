/* ============================================================
   UNE VIE v0.8 — HEALTH MANAGER
   Physique, mental, conditions chroniques, mortalité Gompertz
   ============================================================ */

(function () {
  "use strict";

  // ── MORTALITÉ GOMPERTZ ───────────────────────────────────
  function mortalityProbability(person, state) {
    var cfg = window.VIE.config.health.gompertz;
    var g = cfg[person.sexe === "femme" ? "femme" : "homme"];
    var age = state.year - person.naissance;
    var baseProb = g.a * Math.exp(g.b * age);

    // Facteurs multiplicateurs
    var mult = 1;
    var factors = window.VIE.config.health.mortalityFactors;

    if (person.sante < 40) mult *= factors.sante[40] || 1.5;
    else if (person.sante < 60) mult *= factors.sante[60] || 1.0;
    else if (person.sante < 80) mult *= factors.sante[80] || 0.8;
    else mult *= factors.sante[100] || 0.6;

    if (person.habitudes && person.habitudes.tabac > 50) mult *= factors.tabagisme;
    if (person.habitudes && person.habitudes.alcool > 70) mult *= factors.alcoolFort;
    if (person.habitudes && person.habitudes.alimentation < 30) mult *= factors.obesite;
    if (person.habitudes && person.habitudes.stress > 70) mult *= factors.stressChronique;
    if (person.conditions && person.conditions.includes("depression")) mult *= factors.depression;
    if (person.habitudes && person.habitudes.sport > 50) mult *= factors.activitePhysique;

    // Conditions chroniques
    if (person.conditions) {
      person.conditions.forEach(function (c) {
        if (c === "cancer") mult *= 3;
        else if (c === "maladie_cardiaque") mult *= 2.5;
        else if (c === "diabete") mult *= 1.8;
        else if (c === "hypertension") mult *= 1.3;
        else if (c === "bpco") mult *= 2;
      });
    }

    // Accidents jeunes (15-30 ans)
    if (age >= 15 && age <= 30) baseProb += window.VIE.config.health.accidentRate.age15_30;
    else baseProb += window.VIE.config.health.accidentRate.other;

    return Math.min(0.99, baseProb * mult);
  }

  function shouldDieThisYear(person, state) {
    return Math.random() < mortalityProbability(person, state);
  }

  // ── SANTÉ PHYSIQUE ────────────────────────────────────────
  function updatePhysicalHealth(person, state) {
    if (!person.vivant) return;
    var age = state.year - person.naissance;

    // Vieillissement naturel : ~0,4 pt/an jusqu'à 30 ans,
    // puis +0,2 pt par décennie au-delà (et non `age * x` par an,
    // ce qui effondrait la santé bien trop vite).
    var decay = 0.4 + Math.max(0, age - 30) * 0.02;
    person.sante = clamp(person.sante - decay + (Math.random() - 0.5) * 3, 0, 100);

    // Facteurs positifs
    if (person.habitudes) {
      if (person.habitudes.sport > 50) person.sante = clamp(person.sante + 2, 0, 100);
      if (person.habitudes.alimentation > 60) person.sante = clamp(person.sante + 1, 0, 100);
      if (person.habitudes.sommeil > 60) person.sante = clamp(person.sante + 1, 0, 100);
    }

    // Facteurs négatifs
    if (person.habitudes) {
      if (person.habitudes.tabac > 50) person.sante = clamp(person.sante - 3, 0, 100);
      if (person.habitudes.alcool > 70) person.sante = clamp(person.sante - 2, 0, 100);
      if (person.habitudes.alimentation < 30) person.sante = clamp(person.sante - 2, 0, 100);
    }

    // Stress
    if (person.habitudes && person.habitudes.stress > 70) person.sante = clamp(person.sante - 2, 0, 100);

    // Conditions chroniques : dégradation
    if (person.conditions) {
      person.conditions.forEach(function (c) {
        if (c === "diabete" && person.habitudes.alimentation < 40) person.sante -= 2;
        if (c === "hypertension" && person.habitudes.stress > 60) person.sante -= 1;
        if (c === "maladie_cardiaque") person.sante -= 1;
      });
    }

    person.sante = clamp(person.sante, 0, 100);

    // Apparence
    person.apparence = clamp(person.apparence - 0.3 + Math.random() * 0.5, 0, 100);
    if (person.habitudes && person.habitudes.sport > 60) person.apparence = clamp(person.apparence + 0.5, 0, 100);
  }

  // ── SANTÉ MENTALE ─────────────────────────────────────────
  function updateMentalHealth(person, state) {
    if (!person.vivant) return;

    var cfg = window.VIE.config.health.mentalHealth;

    // Dépression
    var depressionRisk = 0;
    if (person.personality.N > cfg.depressionThreshold.N) depressionRisk += 0.02;
    if ((person.habitudes?.stress || 0) > cfg.depressionThreshold.stress) depressionRisk += 0.03;
    if ((person.stats?.bonheur || person.humeur || 50) < cfg.depressionThreshold.bonheur) depressionRisk += 0.02;
    if (person.conditions && person.conditions.includes("depression")) depressionRisk += 0.05; // rechute

    if (!person.conditions?.includes("depression") && Math.random() < depressionRisk) {
      addCondition(person, "depression");
      person.humeur = clamp(person.humeur - 20, 0, 100);
      if (person === state) state.history.push({ age: state.age, year: state.year, title: "Dépression", result: "Une dépression s'installe.", type: "sante" });
    } else if (person.conditions?.includes("depression") && Math.random() < 0.15) {
      // Rémission possible
      removeCondition(person, "depression");
      person.humeur = clamp(person.humeur + 15, 0, 100);
    }

    // Burnout (joueur uniquement via career)
    // Anxiété
    var anxieteRisk = 0;
    if (person.personality.N > cfg.anxieteThreshold.N) anxieteRisk += 0.02;
    if ((person.habitudes?.stress || 0) > cfg.anxieteThreshold.stress) anxieteRisk += 0.02;
    if (!person.conditions?.includes("anxiete") && Math.random() < anxieteRisk) {
      addCondition(person, "anxiete");
    }

    // Humeur fluctuante
    person.humeur = clamp(person.humeur + (Math.random() - 0.5) * 10 - (person.habitudes?.stress || 0) * 0.05, 0, 100);
  }

  function addCondition(person, condition) {
    person.conditions = person.conditions || [];
    if (!person.conditions.includes(condition)) person.conditions.push(condition);
  }

  function removeCondition(person, condition) {
    if (person.conditions) person.conditions = person.conditions.filter(function (c) { return c !== condition; });
  }

  // ── CONDITIONS CHRONIQUES (héréditaires + mode de vie) ───
  function checkChronicConditions(person, state) {
    if (!person.vivant) return;
    var age = state.year - person.naissance;

    // Hérédité (si parents connus)
    var geneticRisk = {};
    if (person.famille) {
      person.famille.forEach(function (f) {
        var parent = state.people[f.id];
        if (parent && parent.conditions) {
          parent.conditions.forEach(function (c) {
            geneticRisk[c] = (geneticRisk[c] || 0) + 0.15;
          });
        }
      });
    }

    // Diabète type 2
    if (age > 40 && (person.habitudes?.alimentation || 50) < 40 && (person.habitudes?.sport || 50) < 30) {
      var risk = 0.01 + (geneticRisk.diabete || 0) + (age - 40) * 0.002;
      if (Math.random() < risk) addCondition(person, "diabete");
    }

    // Hypertension
    if (age > 45 && (person.habitudes?.stress || 50) > 60) {
      var risk = 0.015 + (geneticRisk.hypertension || 0) + (age - 45) * 0.003;
      if (Math.random() < risk) addCondition(person, "hypertension");
    }

    // Maladie cardiaque
    if (age > 50 && (person.habitudes?.tabac || 0) > 40) {
      var risk = 0.01 + (geneticRisk.maladie_cardiaque || 0) + (person.habitudes.tabac - 40) * 0.001;
      if (Math.random() < risk) addCondition(person, "maladie_cardiaque");
    }

    // Cancer (aléatoire + facteurs)
    if (age > 40) {
      var risk = 0.003 * Math.exp((age - 40) * 0.05);
      if (person.habitudes?.tabac > 50) risk *= 3;
      if (person.habitudes?.alcool > 70) risk *= 1.5;
      if (geneticRisk.cancer) risk *= 2;
      if (Math.random() < risk) addCondition(person, "cancer");
    }

    // BPCO (bronchite chronique)
    if (age > 50 && person.habitudes?.tabac > 60) {
      if (Math.random() < 0.02) addCondition(person, "bpco");
    }

    // Arthrose
    if (age > 55) {
      if (Math.random() < 0.03) addCondition(person, "arthrose");
    }

    // Maladies neurodégénératives
    if (age > 70) {
      if (Math.random() < 0.01 * Math.exp((age - 70) * 0.1)) addCondition(person, "alzheimer");
    }
  }

  // ── SOINS / TRAITEMENTS ───────────────────────────────────
  function applyTreatment(person, condition) {
    var treatments = {
      depression: { effet: "humeur", valeur: 10, duree: 12, cout: 2000 },
      anxiete: { effet: "humeur", valeur: 8, duree: 6, cout: 1500 },
      diabete: { effet: "sante", valeur: 5, duree: 12, cout: 3000 },
      hypertension: { effet: "sante", valeur: 8, duree: 12, cout: 1000 },
      maladie_cardiaque: { effet: "sante", valeur: 10, duree: 12, cout: 5000 },
      cancer: { effet: "sante", valeur: -10, duree: 12, cout: 20000 }, // chimiothérapie
      bpco: { effet: "sante", valeur: 3, duree: 12, cout: 2000 },
      arthrose: { effet: "sante", valeur: 2, duree: 12, cout: 1500 }
    };
    return treatments[condition];
  }

  // ── HANDICAP / DÉPENDANCE (fin de vie) ────────────────────
  function computeAutonomy(person) {
    // 0 = dépendant total, 100 = autonome
    var auto = person.sante * 0.6 + (person.habitudes?.sport || 0) * 0.2 + (100 - person.personality.N) * 0.2;
    if (person.conditions?.includes("alzheimer")) auto *= 0.3;
    if (person.conditions?.includes("maladie_cardiaque")) auto *= 0.8;
    return clamp(auto, 0, 100);
  }

  function needsEHPAD(person) {
    return person.vivant && computeAutonomy(person) < 30 && (state.year - person.naissance) > 75;
  }

  function ehpadCost(state) {
    return window.VIE.config.finance.retraite.dependanceEHPAD * 12;
  }

  // Helpers
  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  // Export
  window.VIE = window.VIE || {};
  window.VIE.engine = window.VIE.engine || {};
  window.VIE.engine.health = {
    mortalityProb: mortalityProbability,
    shouldDie: shouldDieThisYear,
    updatePhysical: updatePhysicalHealth,
    updateMental: updateMentalHealth,
    checkChronic: checkChronicConditions,
    applyTreatment: applyTreatment,
    computeAutonomy: computeAutonomy,
    needsEHPAD: needsEHPAD,
    ehpadCost: ehpadCost,
    addCondition: addCondition,
    removeCondition: removeCondition
  };
})();