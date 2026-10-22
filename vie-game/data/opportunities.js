/* ============================================================
   UNE VIE v0.5 — OPPORTUNITÉS / DESTINS EXTRAORDINAIRES
   Le contenu actuel est défini dans data.js (OPPORTUNITIES legacy).
   On l'expose au moteur sans écraser le global legacy.
   ============================================================ */

window.VIE = window.VIE || {};
window.VIE.data = window.VIE.data || {};
window.VIE.data.opportunities = (typeof OPPORTUNITIES !== "undefined" && OPPORTUNITIES)
  ? OPPORTUNITIES
  : [];
