/* ============================================================
   UNE VIE v0.5 — SIMULATION HEADLESS
   Lance N vies complètes avec graine, stats agrégées
   Usage: node tools/sim.js [nombre_vies] [seed]
   ============================================================ */

// Charge tout le moteur via require (nécessite que les modules soient CommonJS)
// Pour l'instant, on simule une version simplifiée standalone
// La vraie sim utilisera les modules engine/* via un bundler ou require direct

const fs = require("fs");
const path = require("path");

// ── RNG MULBERRY32 ─────────────────────────────────────────
function mulberry32(a) {
  return function() {
    var t = a += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function createRNG(seed) {
  return mulberry32(seed || Date.now());
}

// ── CONFIG SIMPLIFIÉE POUR SIM ─────────────────────────────
const SIM_CONFIG = {
  stages: [
    { key: "bebe", min: 0, max: 5, actions: 1 },
    { key: "enfance", min: 6, max: 12, actions: 1 },
    { key: "ado", min: 13, max: 18, actions: 2 },
    { key: "jeune", min: 19, max: 29, actions: 5 },
    { key: "adulte", min: 30, max: 49, actions: 5 },
    { key: "maturite", min: 50, max: 64, actions: 3 },
    { key: "retraite", min: 65, max: 79, actions: 2 },
    { key: "vieillesse", min: 80, max: 120, actions: 1 }
  ],
  statKeys: ["sante", "energie", "argent", "intelligence", "social", "bonheur", "stress", "apparence", "reputation", "confiance"],
  mortalityGompertz: {
    homme: { a: 0.00012, b: 0.095 },
    femme: { a: 0.00008, b: 0.095 }
  }
};

// ── SIMULATION D'UNE VIE ───────────────────────────────────
function simulateLife(rng, seed) {
  var state = {
    age: 0,
    year: 1990 + Math.floor(rng() * 20),
    stats: { sante: 85, energie: 80, argent: 42, intelligence: 20, social: 20, bonheur: 60, stress: 10, apparence: 50, reputation: 50, confiance: 50 },
    money: 8000,
    career: null,
    housing: "parents",
    relations: [],
    flags: [],
    life: null,
    rngSeed: seed
  };

  var eventsPlayed = 0;
  var destin = null;
  var deathReason = "vieux";
  var deathAge = 0;

  function stageForAge(age) {
    for (var i = 0; i < SIM_CONFIG.stages.length; i++) {
      var s = SIM_CONFIG.stages[i];
      if (age >= s.min && age <= s.max) return s;
    }
    return SIM_CONFIG.stages[SIM_CONFIG.stages.length - 1];
  }

  function actionsForAge(age) {
    var st = stageForAge(age);
    return st.actions;
  }

  function mortalityProb(age, sexe, sante) {
    var g = SIM_CONFIG.mortalityGompertz[sexe === "femme" ? "femme" : "homme"];
    var base = g.a * Math.exp(g.b * age);
    var mult = 1;
    if (sante < 40) mult *= 1.5;
    else if (sante < 60) mult *= 1.0;
    else if (sante < 80) mult *= 0.8;
    else mult *= 0.6;
    if (age >= 15 && age <= 30) base += 0.0015;
    else base += 0.0004;
    return Math.min(0.99, base * mult);
  }

  function applyAnnualEffects() {
    // Finances simplifiées
    var income = state.career ? 30000 + state.career.level * 10000 : 0;
    var expenses = state.housing === "parents" ? 0 : 12000;
    state.money += income - expenses;
    if (state.money < -30000) state.money = -30000;
    if (state.money > 600000) state.money = 600000;

    // Vieillissement stats
    var decay = 0.5;
    state.stats.sante = Math.max(0, state.stats.sante - decay);
    state.stats.energie = Math.max(0, state.stats.energie - decay * 2);
    state.stats.intelligence = Math.min(100, state.stats.intelligence + 0.2);
    state.stats.social = Math.min(100, state.stats.social + 0.1);
  }

  function checkDestin() {
    if (state.life) return;
    var s = state.stats;
    // Politique
    if (state.age >= 32 && state.age <= 52 && s.social >= 85 && s.intelligence >= 75 && state.flags.includes("associatif") && state.career && state.career.level >= 2) {
      if (rng() < 0.10) { state.life = "politique"; return; }
    }
    // Mécène
    if (state.age >= 35 && state.age <= 60 && s.argent >= 88 && s.social >= 60 && state.money >= 220000) {
      if (rng() < 0.10) { state.life = "mecene"; return; }
    }
    // Génie
    if (state.age >= 30 && state.age <= 55 && s.social >= 50 && s.intelligence >= 80 && (state.passions?.count || 0) >= 4) {
      if (rng() < 0.10) { state.life = "genie"; return; }
    }
    // Artiste
    if (state.age >= 24 && state.age <= 40 && s.social >= 50 && s.bonheur >= 45 && (state.passions?.count || 0) >= 4) {
      if (rng() < 0.10) { state.life = "artiste"; return; }
    }
    // Explorateur
    if (state.age >= 25 && state.age <= 55 && s.energie >= 75 && s.sante >= 70 && s.argent >= 40) {
      if (rng() < 0.10) { state.life = "explorateur"; return; }
    }
    // Célébrité
    if (state.age >= 22 && state.age <= 35 && s.social >= 60) {
      if (rng() < 0.10) { state.life = "celebrite"; return; }
    }
  }

  // Boucle de vie
  while (state.age < 120) {
    var actions = actionsForAge(state.age);
    for (var a = 0; a < actions; a++) {
      eventsPlayed++;
      // Événement aléatoire simplifié
      if (rng() < 0.3) {
        // Petit effet aléatoire
        var stat = SIM_CONFIG.statKeys[Math.floor(rng() * SIM_CONFIG.statKeys.length)];
        var delta = Math.floor((rng() - 0.5) * 10);
        state.stats[stat] = Math.max(0, Math.min(100, state.stats[stat] + delta));
      }
    }

    // Destin
    checkDestin();

    // Mortalité
    var sexe = "homme"; // simplifié
    if (rng() < mortalityProb(state.age, sexe, state.stats.sante)) {
      deathReason = state.stats.sante < 20 ? "maladie" : "vieux";
      deathAge = state.age;
      break;
    }

    applyAnnualEffects();
    state.age++;
    state.year++;

    if (state.age >= 100) { deathReason = "vieux"; deathAge = state.age; break; }
  }

  return {
    seed: seed,
    age: deathAge,
    reason: deathReason,
    stats: state.stats,
    money: state.money,
    life: state.life,
    eventsPlayed: eventsPlayed,
    career: state.career ? state.career.level : 0
  };
}

// ── MAIN ───────────────────────────────────────────────────
function main() {
  var args = process.argv.slice(2);
  var N = parseInt(args[0]) || 3000;
  var baseSeed = args[1] ? parseInt(args[1]) : Date.now();

  console.log("=== SIMULATION " + N + " VIES (seed base: " + baseSeed + ") ===");

  var results = [];
  var startTime = Date.now();

  for (var i = 0; i < N; i++) {
    var seed = baseSeed + i;
    var rng = createRNG(seed);
    var life = simulateLife(rng, seed);
    results.push(life);

    if ((i + 1) % 500 === 0) {
      var elapsed = (Date.now() - startTime) / 1000;
      console.log("  " + (i + 1) + "/" + N + " (" + elapsed.toFixed(1) + "s)");
    }
  }

  // Agrégation
  var avgAge = results.reduce((s, r) => s + r.age, 0) / N;
  var reasons = {};
  results.forEach(r => { reasons[r.reason] = (reasons[r.reason] || 0) + 1; });
  var destinCount = {};
  results.forEach(r => { if (r.life) destinCount[r.life] = (destinCount[r.life] || 0) + 1; });
  var avgStats = {};
  SIM_CONFIG.statKeys.forEach(k => { avgStats[k] = results.reduce((s, r) => s + (r.stats[k] || 0), 0) / N; });
  var avgMoney = results.reduce((s, r) => s + r.money, 0) / N;
  var avgEvents = results.reduce((s, r) => s + r.eventsPlayed, 0) / N;

  console.log("\n=== RÉSULTATS ===");
  console.log("Âge moyen: " + avgAge.toFixed(1) + " | Raisons: " + JSON.stringify(reasons));
  console.log("Stats moyennes: " + JSON.stringify(Object.fromEntries(Object.entries(avgStats).map(([k,v])=>[k,Math.round(v)]))));
  console.log("Destins: " + JSON.stringify(destinCount) + " | Total: " + Object.values(destinCount).reduce((a,b)=>a+b,0) + " (" + (Object.values(destinCount).reduce((a,b)=>a+b,0)/N*100).toFixed(1) + "%)");
  console.log("Épargne moyenne: " + Math.round(avgMoney/1000) + "k€");
  console.log("Événements/jour de vie moyen: " + (avgEvents / avgAge).toFixed(2));
  console.log("Temps total: " + ((Date.now() - startTime)/1000).toFixed(1) + "s");
}

main();