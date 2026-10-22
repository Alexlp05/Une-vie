/* ============================================================
   UNE VIE v0.5 — INTERACTIONS (catalogue + résolution unifiée)
   ============================================================ */

(function () {
  "use strict";

  // Le catalogue est dans relations.js (INTERACTIONS_CATALOG)
  // Ce fichier fournit l'API unifiée pour l'UI

  function getInteractionCatalog() {
    return window.VIE.engine.relations.INTERACTIONS_CATALOG || {};
  }

  function getInteractionsForPerson(state, personId) {
    return window.VIE.engine.relations.getInteractions(state, personId);
  }

  function executeInteraction(state, interactionId, personId) {
    var catalog = getInteractionCatalog();
    var interaction = catalog[interactionId];
    if (!interaction) return { success: false, text: "Interaction inconnue" };
    return window.VIE.engine.relations.resolveInteraction(state, interaction, personId);
  }

  // Temps social disponible par an
  function calculateSocialTime(state) {
    var base = 3;
    var socialBonus = Math.floor((state.stats.social || 50) / 25);
    var eBonus = 0;
    if (state.personality.E > 70) eBonus = 2;
    else if (state.personality.E > 50) eBonus = 1;
    else if (state.personality.E < 30) eBonus = -1;

    var charges = 0;
    // Enfants du joueur
    var nbEnfants = Object.values(state.people).filter(function (p) {
      return p.liens.some(function (l) { return l.role === "enfant" && l.affection > 0; });
    }).length;
    charges += nbEnfants * 0.8;

    // Travail
    if (state.career) {
      var track = window.VIE.getCareerTrack(state.career.track);
      if (track && track.levels[state.career.level]) {
        var stress = track.levels[state.career.level].stress || 50;
        if (stress > 70) charges += 1;
        else if (stress > 50) charges += 0.5;
      }
    }

    var temps = base + socialBonus + eBonus - charges;
    return clamp(temps, 1, 10);
  }

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  window.VIE = window.VIE || {};
  window.VIE.engine = window.VIE.engine || {};
  window.VIE.engine.interactions = {
    catalog: getInteractionCatalog,
    forPerson: getInteractionsForPerson,
    execute: executeInteraction,
    calculateSocialTime: calculateSocialTime
  };
})();