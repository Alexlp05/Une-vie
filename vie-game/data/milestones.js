/* ============================================================
   UNE VIE v0.5 — JALONS D'ÂGE
   Les jalons sont définis dans data.js (MILESTONES legacy).
   On les expose au moteur via window.VIE.data.milestones.
   NE PAS déclarer `var MILESTONES` ici : cela écraserait le
   global legacy (même portée de script classique).
   ============================================================ */

window.VIE = window.VIE || {};
window.VIE.data = window.VIE.data || {};
window.VIE.data.milestones = (typeof MILESTONES !== "undefined" && MILESTONES)
  ? MILESTONES
  : {};
