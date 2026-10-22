/* ============================================================
   UNE VIE v0.5 — SMOKE TEST (stub DOM)
   Joue des vies complètes via le vrai moteur, vérifie 0 exception
   Usage: node tools/smoke.js [nombre_vies]
   ============================================================ */

// Stub DOM minimal pour faire tourner game.js dans Node
const fs = require("fs");
const path = require("path");

function makeEl() {
  const el = {
    textContent: '', className: '', style: {}, children: [], listeners: {}, _html: '', _attrs: {},
    classList: { _s: new Set(), add(c){this._s.add(c);}, remove(c){this._s.delete(c);}, contains(c){return this._s.has(c);} },
    appendChild(ch) { this.children.push(ch); return ch; },
    removeChild(ch) { const i = this.children.indexOf(ch); if (i >= 0) this.children.splice(i, 1); },
    addEventListener(type, fn) { (this.listeners[type] = this.listeners[type] || []).push(fn); },
    dispatchEvent(evt) { (this.listeners[evt.type] || []).forEach(fn => fn(evt)); },
    scrollIntoView() {},
    querySelector(sel) { return sel.startsWith("#") ? this.getElementById(sel.slice(1)) : makeEl(); },
    querySelectorAll(sel) { return this.children; },
    getElementById(id) { return this.children.find(c => c.id === id) || makeEl(); },
    setAttribute(k, v) { this._attrs[k] = v; },
    getAttribute(k) { return this._attrs[k]; },
    click() { (this.listeners.click || []).forEach(fn => fn()); },
    focus() {},
    blur() {}
  };
  Object.defineProperty(el, 'innerHTML', { get() { return this._html; }, set(v) { this._html = v; if (v === '') this.children = []; } });
  Object.defineProperty(el, 'id', { get() { return this._attrs?.id || ''; }, set(v) { this._attrs.id = v; } });
  Object.defineProperty(el, 'value', { get() { return this._attrs?.value || ''; }, set(v) { this._attrs.value = v; } });
  Object.defineProperty(el, 'disabled', { get() { return !!this._attrs?.disabled; }, set(v) { this._attrs.disabled = v; } });
  Object.defineProperty(el, 'checked', { get() { return !!this._attrs?.checked; }, set(v) { this._attrs.checked = v; } });
  Object.defineProperty(el, 'dataset', { get() { return this._attrs?.data || {}; } });
  return el;
}

// Stub document global
const els = {};
const document = {
  getElementById(id) { if (!els[id]) els[id] = makeEl(); els[id].id = id; return els[id]; },
  querySelector(sel) { return sel.startsWith("#") ? this.getElementById(sel.slice(1)) : makeEl(); },
  querySelectorAll(sel) { return [makeEl(), makeEl()]; },
  createElement(tag) { const el = makeEl(); el.tagName = tag.toUpperCase(); return el; },
  createElementNS(ns, tag) { const el = makeEl(); el.tagName = tag; return el; },
  addEventListener(type, fn) { if (type === "DOMContentLoaded") this._dc = fn; },
  body: makeEl(),
  head: makeEl()
};
document.body.appendChild(document.getElementById("app") || makeEl());

// window stub
global.window = {
  scrollTo() {},
  addEventListener() {},
  location: { href: "" },
  innerWidth: 1024,
  innerHeight: 768
};

// Timer stubs
global.setTimeout = (fn, ms) => { try { fn(); } catch (e) { console.error("setTimeout error:", e); } };
global.clearTimeout = () => {};
global.setInterval = () => {};
global.clearInterval = () => {};
global.requestAnimationFrame = (fn) => { try { fn(0); } catch (e) {} return 1; };
global.Math = Math;

// Charge le jeu
const gamePath = path.join(__dirname, "..", "game.js");
const gameCode = fs.readFileSync(gamePath, "utf8");

// Remplace les require/imports par nos stubs (game.js est IIFE, pas de imports)
// On évalue directement
eval(gameCode);

// Lance le bootstrap (DOMContentLoaded)
if (document._dc) document._dc();

function newLife(rngSeed) {
  // Reset seed si fourni
  if (rngSeed && window.VIE?.rng) window.VIE.rng.init(rngSeed);

  // Click "Commencer"
  els["btn-start"]?.click?.();

  // Remplir nom
  if (els["input-name"]) { els["input-name"].value = "Test"; els["input-name"].dispatchEvent?.({type:"input"}); }

  // Choisir trait (premier)
  if (els["trait-list"]?.children?.[0]) els["trait-list"].children[0].click();

  // Choisir origine (premier)
  if (els["origin-list"]?.children?.[0]) els["origin-list"].children[0].click();

  // Cliquer Naître
  els["btn-create"]?.click?.();
}

function playOneLife(seed) {
  newLife(seed);
  var actions = 0, maxActions = 5000;
  var lastTitle = "";

  while (actions < maxActions) {
    actions++;
    // Trouver bouton choix
    var choices = els["choices"]?.children || [];
    var choiceBtn = choices.find(c => c.className?.includes("choice-btn"));
    if (!choiceBtn) {
      // Peut-être fin de vie
      if (els["end-title"]?.textContent && els["end-title"].textContent !== lastTitle) {
        lastTitle = els["end-title"].textContent;
        return { success: true, age: els["char-age"]?.textContent, title: lastTitle };
      }
      // Peut-être pas d'événement (fin)
      break;
    }
    choiceBtn.click();

    // Cliquer "Suivant"
    var nextBtn = choices.find(c => c.className?.includes("next-btn"));
    if (nextBtn) nextBtn.click();

    // Vérifier fin
    if (els["end-title"]?.textContent && els["end-title"].textContent !== lastTitle) {
      lastTitle = els["end-title"].textContent;
      return { success: true, age: els["char-age"]?.textContent, title: lastTitle };
    }
  }

  return { success: false, reason: "max actions reached", actions };
}

function main() {
  var args = process.argv.slice(2);
  var N = parseInt(args[0]) || 200;

  console.log("=== SMOKE TEST " + N + " VIES ===");

  var results = { success: 0, failed: 0, errors: [], destinies: {} };
  var startTime = Date.now();

  for (var i = 0; i < N; i++) {
    var res = playOneLife(Date.now() + i);
    if (res.success) {
      results.success++;
      var kicker = res.title.split("·").pop()?.trim() || res.title;
      results.destinies[kicker] = (results.destinies[kicker] || 0) + 1;
    } else {
      results.failed++;
      results.errors.push("Vie " + (i+1) + ": " + res.reason);
    }

    // Reset pour vie suivante
    els["btn-replay"]?.click?.();
    els["end-title"].textContent = "";
    // Nettoyer un peu
    Object.keys(els).forEach(k => { els[k].textContent = ""; els[k].innerHTML = ""; els[k].children = []; });
    document._dc?.();

    if ((i + 1) % 50 === 0) {
      var elapsed = (Date.now() - startTime) / 1000;
      console.log("  " + (i + 1) + "/" + N + " (" + elapsed.toFixed(1) + "s) - OK: " + results.success + " Err: " + results.failed);
    }
  }

  console.log("\n=== RÉSULTATS SMOKE TEST ===");
  console.log("Vies complètes: " + results.success + " / " + N);
  console.log("Échecs: " + results.failed);
  console.log("Destins: " + JSON.stringify(results.destinies));
  if (results.errors.length) {
    console.log("Erreurs:", results.errors.slice(0, 5));
  }
  console.log("Temps: " + ((Date.now() - startTime)/1000).toFixed(1) + "s");

  if (results.failed > 0) process.exit(1);
}

main();