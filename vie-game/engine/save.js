/* ============================================================
   UNE VIE v0.5 — SAVE MANAGER
   Sauvegarde locale, migration, seed, export/import
   ============================================================ */

(function () {
  "use strict";

  var SAVE_KEY = "une_vie_save_v05";
  var SAVE_SLOTS_KEY = "une_vie_slots_v05";
  var MAX_SLOTS = 10;

  // ── SAUVEGARDE ───────────────────────────────────────────
  function save(slot) {
    slot = slot || "auto";
    var state = window.VIE.engine.state.get();
    if (!state) return { ok: false, reason: "Pas d'état à sauvegarder" };

    // Nettoyage avant sauvegarde (circular refs, fonctions, etc.)
    var clean = sanitizeForSave(state);

    var data = {
      version: window.VIE.engine.state.version,
      timestamp: Date.now(),
      slot: slot,
      seed: state.rngSeed,
      data: clean
    };

    try {
      if (slot === "auto") {
        localStorage.setItem(SAVE_KEY, JSON.stringify(data));
      } else {
        var slots = getSlots();
        slots[slot] = data;
        if (Object.keys(slots).length > MAX_SLOTS) {
          // Supprimer le plus ancien
          var oldest = Object.keys(slots).sort(function (a, b) { return slots[a].timestamp - slots[b].timestamp; })[0];
          delete slots[oldest];
        }
        localStorage.setItem(SAVE_SLOTS_KEY, JSON.stringify(slots));
      }
      return { ok: true, slot: slot };
    } catch (e) {
      console.error("Erreur sauvegarde:", e);
      return { ok: false, reason: e.message };
    }
  }

  function sanitizeForSave(state) {
    // Supprimer les références circulaires et fonctions
    var seen = new WeakSet();
    function clean(obj) {
      if (obj === null || typeof obj !== "object") return obj;
      if (seen.has(obj)) return "[Circular]";
      seen.add(obj);

      if (Array.isArray(obj)) return obj.map(clean);
      var out = {};
      for (var k in obj) {
        var v = obj[k];
        if (typeof v === "function") continue;
        if (k === "_rngState" || k === "_gaussSpare") continue; // RNG interne
        out[k] = clean(v);
      }
      return out;
    }
    return clean(state);
  }

  // ── CHARGEMENT ───────────────────────────────────────────
  function load(slot) {
    slot = slot || "auto";
    try {
      var raw = slot === "auto" ? localStorage.getItem(SAVE_KEY) : getSlots()[slot];
      if (!raw) return { ok: false, reason: "Aucune sauvegarde trouvée" };
      var data = typeof raw === "string" ? JSON.parse(raw) : raw;
      var state = data.data;

      // Migration si version différente
      if (data.version !== window.VIE.engine.state.version) {
        state = window.VIE.engine.state.migrate(state);
      }

      // Restaurer seed RNG
      if (data.seed) {
        window.VIE.rng.init(data.seed);
      } else if (state.rngSeed) {
        window.VIE.rng.init(state.rngSeed);
      }

      window.VIE.engine.state.set(state);
      return { ok: true, state: state };
    } catch (e) {
      console.error("Erreur chargement:", e);
      return { ok: false, reason: e.message };
    }
  }

  function getSlots() {
    try {
      var raw = localStorage.getItem(SAVE_SLOTS_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) { return {}; }
  }

  // ── LISTE SLOTS ──────────────────────────────────────────
  function listSlots() {
    var slots = getSlots();
    return Object.keys(slots).map(function (k) {
      var s = slots[k];
      return {
        slot: k,
        timestamp: s.timestamp,
        age: s.data?.age,
        name: s.data?.name,
        year: s.data?.year,
        seed: s.seed
      };
    }).sort(function (a, b) { return b.timestamp - a.timestamp; });
  }

  function deleteSlot(slot) {
    var slots = getSlots();
    delete slots[slot];
    localStorage.setItem(SAVE_SLOTS_KEY, JSON.stringify(slots));
  }

  // ── EXPORT / IMPORT (texte) ──────────────────────────────
  function exportSave() {
    var state = window.VIE.engine.state.get();
    if (!state) return null;
    var clean = sanitizeForSave(state);
    return JSON.stringify({ version: window.VIE.engine.state.version, seed: state.rngSeed, data: clean });
  }

  function importSave(json) {
    try {
      var data = JSON.parse(json);
      var state = data.data;
      if (data.version !== window.VIE.engine.state.version) {
        state = window.VIE.engine.state.migrate(state);
      }
      if (data.seed) window.VIE.rng.init(data.seed);
      window.VIE.engine.state.set(state);
      save("auto");
      return { ok: true };
    } catch (e) {
      return { ok: false, reason: e.message };
    }
  }

  // ── SEED DE PARTIE ───────────────────────────────────────
  function newGameWithSeed(seed) {
    window.VIE.rng.init(seed);
    var state = window.VIE.engine.state.create();
    state.rngSeed = seed;
    window.VIE.engine.state.set(state);
    return state;
  }

  function getCurrentSeed() {
    var state = window.VIE.engine.state.get();
    return state?.rngSeed || null;
  }

  // ── AUTOSAVE ─────────────────────────────────────────────
  var _autosaveTimer = null;
  function enableAutosave(intervalMs) {
    intervalMs = intervalMs || 30000; // 30s
    disableAutosave();
    _autosaveTimer = setInterval(function () { save("auto"); }, intervalMs);
  }
  function disableAutosave() { if (_autosaveTimer) clearInterval(_autosaveTimer); _autosaveTimer = null; }

  // Export
  window.VIE = window.VIE || {};
  window.VIE.engine = window.VIE.engine || {};
  window.VIE.engine.save = {
    save: save,
    load: load,
    listSlots: listSlots,
    deleteSlot: deleteSlot,
    export: exportSave,
    import: importSave,
    newGameWithSeed: newGameWithSeed,
    getSeed: getCurrentSeed,
    enableAutosave: enableAutosave,
    disableAutosave: disableAutosave
  };
})();