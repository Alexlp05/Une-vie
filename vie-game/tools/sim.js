/* ============================================================
   UNE VIE v0.8 — SIMULATION HEADLESS (moteur réel)
   Joue N vies complètes via le vrai moteur, vérifie les
   invariants à chaque année et calcule les métriques cibles.

   Usage : node tools/sim.js [nombre_vies] [seed]
   ============================================================ */

const { loadGame, playLife } = require("./harness");

// ── INVARIANTS (§13.2) ──────────────────────────────────────
const STAT_KEYS = ["sante", "energie", "argent", "intelligence", "social",
                   "bonheur", "stress", "apparence", "reputation", "confiance"];

function checkInvariants(state, violations) {
  if (!state) { violations.push("état nul"); return; }

  // 1. Aucune valeur NaN/undefined dans les stats
  STAT_KEYS.forEach(k => {
    const v = state.stats[k];
    if (v === undefined || v === null || Number.isNaN(v)) {
      violations.push("stat " + k + " invalide (" + v + ")");
    } else if (v < 0 || v > 100) {
      violations.push("stat " + k + " hors [0,100] (" + v + ")");
    }
  });

  // 2. Personnalité dans [0,100]
  Object.keys(state.personality || {}).forEach(k => {
    const v = state.personality[k];
    if (Number.isNaN(v) || v < 0 || v > 100) {
      violations.push("personnalité " + k + " hors [0,100] (" + v + ")");
    }
  });

  // 3. Argent cohérent (nombre fini)
  if (state.finance && (Number.isNaN(state.finance.compte) || !Number.isFinite(state.finance.compte))) {
    violations.push("finance.compte invalide (" + state.finance.compte + ")");
  }

  // 4. Aucun id de personne orphelin dans famille / liens
  const people = state.people || {};
  Object.keys(people).forEach(pid => {
    const p = people[pid];
    (p.famille || []).forEach(f => {
      if (f.id !== "self" && !people[f.id]) {
        violations.push("lien familial orphelin : " + pid + " → " + f.id);
      }
    });
    (p.liens || []).forEach(l => {
      if (l.id !== "self" && !people[l.id]) {
        violations.push("lien orphelin : " + pid + " → " + l.id);
      }
    });
  });

  // 5. Âge cohérent : un parent a au moins 16 ans de plus que son enfant
  Object.keys(people).forEach(pid => {
    const p = people[pid];
    (p.famille || []).forEach(f => {
      if (f.relation !== "enfant" && f.relation !== "frere" && f.relation !== "soeur") return;
      const other = people[f.id];
      if (!other) return;
      const diff = other.naissance - p.naissance;
      if (f.relation === "enfant" && diff < 16) {
        violations.push("parent trop jeune : " + pid + " (" + p.naissance + ") / enfant " + f.id + " (" + other.naissance + ")");
      }
    });
  });

  // 6. Aucun mort qui agit (liens d'un mort modifiés par le joueur = interdit)
  Object.keys(people).forEach(pid => {
    const p = people[pid];
    if (p.vivant === false) {
      (p.liens || []).forEach(l => {
        if (l.contactsParAn > 0 && l.dernierContact >= state.year && pid !== "self") {
          violations.push("personne morte avec contact récent : " + pid);
        }
      });
    }
  });

  // 7. Âge cohérent avec l'année
  if (state.birthYear && state.year && state.age !== undefined) {
    const expected = state.year - state.birthYear;
    if (Math.abs(expected - state.age) > 1) {
      violations.push("âge incohérent : " + state.age + " vs " + expected + " (année " + state.year + ")");
    }
  }
}

// ── MESURES D'UNE VIE ──────────────────────────────────────
function measureLife(state, played, snapshot30) {
  const people = state.people || {};
  const self = people["self"] || {};
  const liens = self.liens || [];

  const amisProches = liens.filter(l => l.role === "ami" && (l.affection || 0) >= 60).length;
  const amours = liens.filter(l => l.role === "amour" && (l.affection || 0) >= 45).length;
  const enfants = liens.filter(l => l.role === "enfant").length;
  const marie = liens.some(l => l.role === "amour" && ["marie", "fiances"].includes(l.statut));
  const divorce = !!(state.flags || []).includes("divorce");
  const dependance = Object.keys(state.dependances || {}).length > 0;
  const infidelite = (state.flags || []).includes("infidelite") ||
    Object.values(people).some(p => (p.memoire && p.memoire.infidelite) || (p.memoire && p.memoire.infidelite_subie));
  const nonFumeur = !!(state.flags || []).includes("non_fumeur");

  return {
    age: state.age,
    amisProches,
    amisProches30: snapshot30 ? snapshot30.amisProches : 0,
    amours,
    amours30: snapshot30 ? snapshot30.amours : 0,
    enfants,
    marie,
    divorce,
    dependance,
    infidelite,
    nonFumeur: nonFumeur,
    patrimoine: state.finance ? state.finance.compte : 0,
    destin: state.life || null,
    events: played
  };
}

// ── MAIN ────────────────────────────────────────────────────
function main() {
  const args = process.argv.slice(2);
  const N = parseInt(args[0]) || 3000;
  const baseSeed = args[1] ? parseInt(args[1]) : 20260101;

  console.log("=== SIMULATION " + N + " VIES (seed de base : " + baseSeed + ") ===");

  const results = [];
  const violations = [];
  const errors = [];
  const startTime = Date.now();

  for (let i = 0; i < N; i++) {
    const seed = baseSeed + i;
    const h = loadGame({ silent: true, store: {} });

    // Graine déterministe pour toute la vie
    const w = h.sandbox.window;
    w.VIE.rng.init(seed);

    // Démarrage via l'API du jeu
    const game = w.VIE.game;
    game.startGame("Sim" + i, "solitaire", "Classe moyenne", "homme");
    // La graine doit survivre au startGame
    w.VIE.rng.init(seed);

    const before = game.getState();
    if (before) { before.rngSeed = seed; before.birthYear = before.year - before.age; }

    const res = playLife(h, { maxActions: 1500 });

    if (res.error) {
      errors.push("vie " + i + " : " + res.error.message + "\n" +
        (res.error.stack || "").split("\n").slice(1, 4).join("\n"));
    }

    const st = res.state;
    if (st) {
      const v = [];
      checkInvariants(st, v);
      v.forEach(x => violations.push("vie " + i + " (âge " + st.age + ") : " + x));
      const m = measureLife(st, res.events, res.snapshot);
      m.reason = h.sandbox.window.VIE.game.getEndReason();
      m.santeFinale = st.stats.sante;
      results.push(m);
    }

    if ((i + 1) % 500 === 0) {
      const elapsed = (Date.now() - startTime) / 1000;
      process.stdout.write("  " + (i + 1) + "/" + N + " (" + elapsed.toFixed(1) + "s)\n");
    }
  }

  // ── AGRÉGATION ────────────────────────────────────────────
  const n = results.length || 1;
  const avg = f => (results.reduce((s, r) => s + f(r), 0) / n);
  const pct = f => (results.filter(f).length / n * 100);
  const median = arr => {
    if (!arr.length) return 0;
    const s = arr.slice().sort((a, b) => a - b);
    const m = Math.floor(s.length / 2);
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
  };

  const ages = results.map(r => r.age);
  const patrimoine = results.map(r => r.patrimoine);
  const destins = {};
  results.forEach(r => { if (r.destin) destins[r.destin] = (destins[r.destin] || 0) + 1; });

  const stdAge = Math.sqrt(avg(r => Math.pow(r.age - avg(x => x.age), 2)));

  console.log("\n=== RÉSULTATS ===");
  console.log("Vies simulées            : " + results.length);
  console.log("Espérance de vie          : " + avg(r => r.age).toFixed(1) + " ans (σ " + stdAge.toFixed(1) + ")");
  console.log("Médiane                   : " + median(ages) + " ans");
  console.log("Âge min / max             : " + Math.min(...ages) + " / " + Math.max(...ages));
  const reasons = {};
  results.forEach(r => { const k = r.reason || "?"; reasons[k] = (reasons[k] || 0) + 1; });
  console.log("Causes de décès           : " + JSON.stringify(reasons));
  console.log("Santé finale (moyenne)    : " + avg(r => r.santeFinale || 0).toFixed(1));
  console.log("");
  console.log("Amis proches (médiane)    : " + median(results.map(r => r.amisProches)) + "   [cible 3-5]");
  console.log("  → à 30 ans              : " + median(results.map(r => r.amisProches30)) + "   [cible 3-5]");
  console.log("Amours significatifs      : " + median(results.map(r => r.amours)) + "   [cible 2-4]");
  console.log("  → à 30 ans              : " + median(results.map(r => r.amours30)) + "   [cible 2-4]");
  console.log("Vies avec ≥ 1 enfant      : " + pct(r => r.enfants > 0).toFixed(1) + "%   [cible 65-75%]");
  console.log("Vies avec mariage         : " + pct(r => r.marie).toFixed(1) + "%");
  console.log("Vies avec divorce         : " + pct(r => r.divorce).toFixed(1) + "%   [cible 30-40% des mariés]");
  console.log("Vies avec dépendance      : " + pct(r => r.dependance).toFixed(1) + "%   [cible 10-20%]");
  console.log("Vies avec infidélité      : " + pct(r => r.infidelite).toFixed(1) + "%   [cible 25-40%]");
  console.log("");
  console.log("Patrimoine médian (60+)   : " + Math.round(median(patrimoine)) + " €");
  console.log("Destins                   : " + JSON.stringify(destins));
  console.log("Vies avec destin          : " + pct(r => !!r.destin).toFixed(1) + "%");
  console.log("Événements joués (moyenne) : " + avg(r => r.events).toFixed(0));
  console.log("");
  console.log("Erreurs d'exécution       : " + errors.length);
  if (errors.length) console.log("  première : " + errors[0]);
  console.log("Violations d'invariants    : " + violations.length);
  if (violations.length) {
    const counts = {};
    violations.forEach(v => {
      const key = v.replace(/vie \d+[^\n]*?:\s*/, "").replace(/\(âge \d+\)/, "").replace(/\d+/g, "N");
      counts[key] = (counts[key] || 0) + 1;
    });
    Object.keys(counts).sort((a, b) => counts[b] - counts[a]).slice(0, 12)
      .forEach(k => console.log("  " + counts[k] + "× " + k));
  }
  console.log("Temps total               : " + ((Date.now() - startTime) / 1000).toFixed(1) + "s");

  if (errors.length || violations.length) process.exitCode = 1;
}

main();
