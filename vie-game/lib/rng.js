/* ============================================================
   UNE VIE v0.5 — RNG AVEC GRAINE (mulberry32)
   Toutes les valeurs aléatoires passent par ici.
   ============================================================ */

(function () {
  "use strict";

  var _seed = null;
  var _state = 0;
  var _initialized = false;

  // mulberry32 : rapide, période 2^32, bon pour simulations
  function mulberry32(a) {
    var t = a += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  function initRNG(seed) {
    if (seed === undefined || seed === null) {
      seed = Date.now() ^ (Math.random() * 0x100000000);
    }
    _seed = Math.floor(seed);
    _state = _seed;
    _initialized = true;
    // warm-up
    for (var i = 0; i < 10; i++) mulberry32(_state++);
    return _seed;
  }

  function getSeed() { return _seed; }

  // [0, 1)
  function rng() {
    if (!_initialized) initRNG();
    return mulberry32(_state++);
  }

  // [min, max] entier
  function rngInt(min, max) {
    return Math.floor(rng() * (max - min + 1)) + min;
  }

  // [min, max) flottant
  function rngFloat(min, max) {
    return rng() * (max - min) + min;
  }

  // Choix pondéré : arr = [{item, weight}, ...] ou [item, item...] (poids=1)
  function rngPick(arr) {
    if (!arr || !arr.length) return null;
    var total = 0;
    var weighted = arr.map(function (e) {
      var w = (e && e.weight !== undefined) ? e.weight : 1;
      var item = e && e.item !== undefined ? e.item : e;
      total += w;
      return { item: item, weight: w, cum: total };
    });
    var r = rng() * total;
    for (var i = 0; i < weighted.length; i++) {
      if (r < weighted[i].cum) return weighted[i].item;
    }
    return weighted[weighted.length - 1].item;
  }

  // Gaussien (Box-Muller) — moyenne 0, écart-type 1
  var _gaussSpare = null;
  function rngGaussian(mean, stdDev) {
    mean = mean || 0;
    stdDev = stdDev || 1;
    if (_gaussSpare !== null) {
      var s = _gaussSpare;
      _gaussSpare = null;
      return mean + s * stdDev;
    }
    var u1 = 0, u2 = 0;
    while (u1 === 0) u1 = rng();
    while (u2 === 0) u2 = rng();
    var mag = Math.sqrt(-2 * Math.log(u1));
    var z0 = mag * Math.cos(2 * Math.PI * u2);
    var z1 = mag * Math.sin(2 * Math.PI * u2);
    _gaussSpare = z1;
    return mean + z0 * stdDev;
  }

  // Clamp gaussien dans [min, max]
  function rngGaussianClamped(mean, stdDev, min, max) {
    var v = rngGaussian(mean, stdDev);
    return Math.max(min, Math.min(max, v));
  }

  // Shuffle (Fisher-Yates)
  function rngShuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = rngInt(0, i);
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  // Sample n éléments sans remplacement
  function rngSample(arr, n) {
    var a = rngShuffle(arr);
    return a.slice(0, Math.min(n, a.length));
  }

  // Booléen avec probabilité p
  function rngChance(p) {
    return rng() < p;
  }

  // Export global
  window.VIE = window.VIE || {};
  window.VIE.rng = {
    init: initRNG,
    getSeed: getSeed,
    rng: rng,
    int: rngInt,
    float: rngFloat,
    pick: rngPick,
    gaussian: rngGaussian,
    gaussianClamped: rngGaussianClamped,
    shuffle: rngShuffle,
    sample: rngSample,
    chance: rngChance
  };
})();