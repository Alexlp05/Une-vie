/* ============================================================
   UNE VIE v0.5 — UTILITAIRES COMMUNS
   ============================================================ */

(function () {
  "use strict";

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  // Choix pondéré (utilise VIE.rng.pick si dispo, sinon Math.random)
  function weightedPick(arr) {
    if (window.VIE && window.VIE.rng && window.VIE.rng.pick) {
      return window.VIE.rng.pick(arr);
    }
    var total = 0;
    var weighted = arr.map(function (e) {
      var w = (e && e.weight !== undefined) ? e.weight : 1;
      var item = e && e.item !== undefined ? e.item : e;
      total += w;
      return { item: item, weight: w, cum: total };
    });
    var r = Math.random() * total;
    for (var i = 0; i < weighted.length; i++) {
      if (r < weighted[i].cum) return weighted[i].item;
    }
    return weighted[weighted.length - 1].item;
  }

  // Moyenne d'un tableau de nombres
  function mean(arr) {
    if (!arr || !arr.length) return 0;
    return arr.reduce(function (a, b) { return a + b; }, 0) / arr.length;
  }

  // Écart-type
  function stdDev(arr) {
    if (!arr || arr.length < 2) return 0;
    var m = mean(arr);
    return Math.sqrt(arr.reduce(function (s, v) { return s + Math.pow(v - m, 2); }, 0) / arr.length);
  }

  // Format nombre avec espaces (12 345 €)
  function formatNumber(n) {
    return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  }

  function formatMoney(n) {
    return formatNumber(n) + " €";
  }

  // Âge depuis année naissance
  function calcAge(birthYear, currentYear) {
    return currentYear - birthYear;
  }

  // Génère un ID unique simple
  var _idCounter = 0;
  function uniqueId(prefix) {
    return (prefix || "id") + "_" + Date.now().toString(36) + "_" + (_idCounter++).toString(36);
  }

  // Capitalize première lettre
  function capitalize(str) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
  }

  // Pluriel simple français
  function plural(n, singular, pluralForm) {
    return n > 1 ? (pluralForm || singular + "s") : singular;
  }

  // Pourcentage
  function pct(n, total) {
    if (!total) return "0%";
    return Math.round(n * 100 / total) + "%";
  }

  // Délai aléatoire pour animations
  function randomDelay(min, max) {
    return Math.floor((window.VIE && window.VIE.rng ? window.VIE.rng.float(min, max) : Math.random() * (max - min) + min));
  }

  // Débounce
  function debounce(fn, ms) {
    var timer = null;
    return function () {
      var args = arguments;
      var self = this;
      clearTimeout(timer);
      timer = setTimeout(function () { fn.apply(self, args); }, ms);
    };
  }

  // Merge profond (shallow pour arrays)
  function mergeDeep(target, source) {
    var out = deepClone(target);
    if (!source) return out;
    Object.keys(source).forEach(function (k) {
      if (source[k] && typeof source[k] === "object" && !Array.isArray(source[k])) {
        out[k] = mergeDeep(out[k] || {}, source[k]);
      } else {
        out[k] = source[k];
      }
    });
    return out;
  }

  // Trouver dans un tableau d'objets
  function findBy(arr, key, value) {
    return arr.find(function (o) { return o[key] === value; });
  }

  function filterBy(arr, key, value) {
    return arr.filter(function (o) { return o[key] === value; });
  }

  // Grouper par clé
  function groupBy(arr, key) {
    return arr.reduce(function (acc, o) {
      var k = o[key];
      (acc[k] = acc[k] || []).push(o);
      return acc;
    }, {});
  }

  window.VIE = window.VIE || {};
  window.VIE.util = {
    clamp: clamp,
    deepClone: deepClone,
    weightedPick: weightedPick,
    mean: mean,
    stdDev: stdDev,
    formatNumber: formatNumber,
    formatMoney: formatMoney,
    calcAge: calcAge,
    uniqueId: uniqueId,
    capitalize: capitalize,
    plural: plural,
    pct: pct,
    randomDelay: randomDelay,
    debounce: debounce,
    mergeDeep: mergeDeep,
    findBy: findBy,
    filterBy: filterBy,
    groupBy: groupBy
  };
})();