/* ============================================================
   UNE VIE v0.5 — ÉVÉNEMENTS MONDE (économie, société, climat)
   Le contenu actuel est défini dans data.js (WORLD_EVENTS legacy).
   On l'expose au moteur sans écraser le global legacy.
   ============================================================ */

window.VIE = window.VIE || {};
window.VIE.data = window.VIE.data || {};
window.VIE.data.worldEvents = (typeof WORLD_EVENTS !== "undefined" && WORLD_EVENTS)
  ? WORLD_EVENTS
  : [];
