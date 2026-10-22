/* ============================================================
   UNE VIE v0.5 — SMOKE TEST (stub DOM via harness)
   Joue des vies complètes via le vrai moteur, vérifie 0 exception
   Usage: node tools/smoke.js [nombre_vies]
   ============================================================ */

const { loadGame, playLife } = require("./harness");

function main() {
  const args = process.argv.slice(2);
  const N = parseInt(args[0], 10) || 50;

  console.log("=== SMOKE TEST " + N + " VIES ===");

  const results = { success: 0, failed: 0, errors: [], destinies: {} };
  const startTime = Date.now();

  for (let i = 0; i < N; i++) {
    const seed = Date.now() + i * 1000;
    const h = loadGame({ silent: true, store: {} });
    const w = h.sandbox.window;

    w.VIE.rng.init(seed);
    const trait = w.VIE.getArchetype("equilibre") || w.VIE.getArchetype("social");
    const origin = (w.VIE.data.origins && w.VIE.data.origins[0]) || { name: "Classe moyenne", id: "moyenne" };

    // Démarrer la vie
    w.VIE.engine.startGame("Smoke" + i, trait, origin, i % 2 === 0 ? "femme" : "homme", 1990);

    const res = playLife(h, { maxActions: 1500 });

    if (res.error) {
      results.failed++;
      results.errors.push("Vie " + (i + 1) + ": " + res.error.message);
    } else {
      results.success++;
      const reason = res.reason || "Fin naturelle";
      results.destinies[reason] = (results.destinies[reason] || 0) + 1;
    }

    if ((i + 1) % 10 === 0 || i + 1 === N) {
      const elapsed = (Date.now() - startTime) / 1000;
      console.log("  " + (i + 1) + "/" + N + " (" + elapsed.toFixed(1) + "s) - OK: " + results.success + " Err: " + results.failed);
    }
  }

  console.log("\n=== RÉSULTATS SMOKE TEST ===");
  console.log("Vies complètes: " + results.success + " / " + N);
  console.log("Échecs: " + results.failed);
  if (results.errors.length) {
    console.log("Erreurs:", results.errors.slice(0, 5));
  }
  console.log("Temps total: " + ((Date.now() - startTime) / 1000).toFixed(1) + "s");

  if (results.failed > 0) process.exit(1);
}

main();
