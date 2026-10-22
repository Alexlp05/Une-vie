/* ============================================================
   UNE VIE v0.8 — HARNESS DE TEST PARTAGÉ
   Charge le jeu réel (index.html) dans un contexte VM avec un
   stub DOM, pour les simulations headless (sim.js, smoke.js).

   Usage :
     const { loadGame, makeEl } = require('./harness');
     const h = loadGame();
     h.sandbox.window.VIE.game.startGame('Test', 'solitaire', 'Classe moyenne', 'homme');
   ============================================================ */

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const DIR = path.resolve(__dirname, "..");

// Ordre de chargement : legacy d'abord, puis modules v0.5.
const FILES = [
  "data.js", "config.js",
  "lib/rng.js", "lib/fmt.js", "lib/util.js",
  "data/traits.js", "data/origins.js", "data/names.js", "data/careers.js",
  "data/milestones.js", "data/opportunities.js",
  "data/events_famille.js", "data/events_amour.js", "data/events_amitie.js",
  "data/events_pro.js", "data/events_vices.js", "data/events_sante.js",
  "data/events_monde.js", "data/events_passifs.js", "data/config_events.js",
  "engine/state.js", "engine/personality.js", "engine/people.js",
  "engine/relations.js", "engine/encounters.js", "engine/interactions.js",
  "engine/events.js", "engine/finance.js", "engine/career.js",
  "engine/health.js", "engine/world.js", "engine/save.js",
  "ui/tabs.js", "ui/personCard.js", "ui/familyTree.js", "ui/timeline.js",
  "ui/financeView.js", "ui/careerView.js", "ui/statsView.js", "ui/render.js",
  "game.js"
];

// ── STUB DOM ───────────────────────────────────────────────
function makeEl(id) {
  const el = {
    _id: id, textContent: "", className: "", style: {}, children: [],
    listeners: {}, _html: "", _attrs: {}, _dirty: false, dataset: {},
    classList: {
      _s: new Set(),
      add(c) { this._s.add(c); },
      remove(c) { this._s.delete(c); },
      contains(c) { return this._s.has(c); },
      toggle(c, force) {
        if (force === undefined) { if (this._s.has(c)) this._s.delete(c); else this._s.add(c); }
        else if (force) this._s.add(c); else this._s.delete(c);
      }
    },
    appendChild(ch) { el.children.push(ch); el._dirty = true; return ch; },
    insertBefore(ch, ref) {
      const i = ref ? el.children.indexOf(ref) : -1;
      if (i < 0) el.children.unshift(ch); else el.children.splice(i, 0, ch);
      el._dirty = true; return ch;
    },
    removeChild(ch) {
      const i = el.children.indexOf(ch);
      if (i >= 0) el.children.splice(i, 1);
      el._dirty = true; return ch;
    },
    addEventListener(t, fn) { (el.listeners[t] = el.listeners[t] || []).push(fn); },
    removeEventListener() {},
    scrollIntoView() {},
    querySelector() { return makeEl(); },
    querySelectorAll() { return el.children.slice(); },
    setAttribute(k, v) { el._attrs[k] = v; },
    getAttribute(k) { return el._attrs[k]; },
    focus() {}, blur() {}, remove() {},
    click() { (el.listeners.click || []).forEach(fn => fn.call(el)); },
    dispatchEvent(e) { (el.listeners[e.type] || []).forEach(fn => fn.call(el, e)); }
  };

  Object.defineProperty(el, "innerHTML", {
    get() {
      if (!el._dirty) return el._html;
      return el.children.map(c => {
        const tag = c._tag || "div";
        const attrs = Object.keys(c._attrs || {}).map(k => " " + k + '="' + c._attrs[k] + '"').join("");
        const inner = c._dirty ? c.innerHTML : (c._html || c.textContent || "");
        return "<" + tag + attrs + ">" + inner + "</" + tag + ">";
      }).join("");
    },
    set(v) {
      el._html = v; el._dirty = false; el.children = [];
      if (!v) return;
      const tagRe = /<(\w+)([^>]*)>([\s\S]*?)<\/\1>/g;
      let m;
      while ((m = tagRe.exec(v)) !== null) {
        const child = makeEl();
        child._tag = m[1];
        child._attrs = {};
        const attrRe = /(\w[\w-]*)="([^"]*)"/g;
        let a;
        while ((a = attrRe.exec(m[2])) !== null) child._attrs[a[1]] = a[2];
        child.textContent = m[3].replace(/<[^>]*>/g, "").trim();
        child._html = m[3];
        child.dataset = {};
        Object.keys(child._attrs).forEach(k => {
          if (k.startsWith("data-")) {
            child.dataset[k.slice(5).replace(/-(\w)/g, (_, c) => c.toUpperCase())] = child._attrs[k];
          }
        });
        el.children.push(child);
      }
    }
  });

  Object.defineProperty(el, "disabled", { get() { return el._disabled; }, set(v) { el._disabled = v; } });
  Object.defineProperty(el, "id", { get() { return el._id; }, set(v) { el._id = v; } });
  el.value = "";
  return el;
}

function makeDocument(els) {
  const storyCard = makeEl("story-card");
  return {
    getElementById(id) { if (!els[id]) els[id] = makeEl(id); return els[id]; },
    querySelector(sel) {
      if (sel === ".story-card") return storyCard;
      if (sel[0] === "#") return this.getElementById(sel.slice(1));
      return makeEl();
    },
    querySelectorAll(sel) {
      if (sel === ".tab-btn") {
        const c = els["tabs-container"];
        return c ? c.children.filter(ch => ch && ch.dataset && ch.dataset.tab) : [];
      }
      if (sel === ".tab-panel") {
        return ["vie", "moi", "proches", "argent", "carriere", "journal", "arbre"]
          .map(id => this.getElementById("panel-" + id));
      }
      if (sel === ".screen") {
        return ["screen-title", "screen-creation", "screen-game", "screen-end"]
          .map(id => this.getElementById(id));
      }
      return [makeEl(), makeEl()];
    },
    createElement() { return makeEl(); },
    createElementNS() { return makeEl(); },
    addEventListener(t, fn) { if (t === "DOMContentLoaded") this._dc = fn; },
    head: makeEl("head"),
    body: makeEl("body")
  };
}

// ── CHARGEMENT ──────────────────────────────────────────────
/**
 * Charge le jeu dans un sandbox VM.
 * @param {object} opts { silent, store } — store : faux localStorage
 */
function loadGame(opts) {
  opts = opts || {};
  const els = {};
  const documentStub = makeDocument(els);
  const store = opts.store || {};

  const sandbox = {
    document: documentStub,
    window: { scrollTo() {}, VIE: {} },
    console: opts.silent ? { log() {}, warn() {}, error() {} } : console,
    Math, JSON, Date, Object, Array, String, Number, Boolean, Set, Map,
    WeakSet, Error, parseInt, parseFloat, isNaN, isFinite, RegExp,
    setTimeout: (fn) => { try { fn(); } catch (e) { if (!opts.silent) console.error("TIMEOUT:", e.message); } },
    clearTimeout() {},
    setInterval() { return 1; },
    clearInterval() {},
    requestAnimationFrame: () => 1,
    localStorage: {
      getItem(k) { return store[k] === undefined ? null : store[k]; },
      setItem(k, v) { store[k] = String(v); },
      removeItem(k) { delete store[k]; }
    }
  };
  sandbox.window.document = documentStub;
  sandbox.globalThis = sandbox;
  sandbox.self = sandbox;
  vm.createContext(sandbox);

  FILES.forEach(f => {
    vm.runInContext(fs.readFileSync(path.join(DIR, f), "utf8"), sandbox, { filename: f });
  });

  return { sandbox, els, documentStub, store };
}

/**
 * Joue une vie complète de façon automatique (choix par défaut = premier choix).
 * @returns {{ age, reason, state, events, error }}
 */
function playLife(h, opts) {
  opts = opts || {};
  const maxActions = opts.maxActions || 1200;
  const snapshotAge = opts.snapshotAge || 30;
  const game = h.sandbox.window.VIE.game;
  const els = h.els;
  const rng = h.sandbox.window.VIE.rng;

  // Stratégie de choix : "premier" (déterministe) ou "aleatoire" (graine)
  const strategy = opts.choiceStrategy || "aleatoire";
  const pickIndex = (n) => {
    if (strategy === "premier" || n <= 1) return 0;
    return rng && rng.int ? rng.int(0, n - 1) : Math.floor(Math.random() * n);
  };

  let events = 0;
  let error = null;
  let snapshot = null;

  for (let i = 0; i < maxActions; i++) {
    try {
      const choices = els["choices"].children;
      if (!choices.length) break;
      const nextBtn = choices.find(c => (c.className || "").includes("next-btn"));
      const choiceBtns = choices.filter(c => (c.className || "") === "choice-btn");
      let btn;
      if (choiceBtns.length) {
        btn = choiceBtns[pickIndex(choiceBtns.length)];
      } else {
        btn = nextBtn;
      }
      if (!btn) break;
      btn.click();
      events++;

      if (game.isOver()) break;

      const choices2 = els["choices"].children;
      const cont = choices2.find(c => (c.className || "").includes("next-btn")) ||
                   choices2.find(c => (c.className || "") === "choice-btn");
      if (cont && cont !== btn) cont.click();

      // Instantané à l'âge demandé (métriques « vers 30 ans »)
      if (!snapshot) {
        const st = h.sandbox.window.VIE.engine.getState();
        if (st && st.age >= snapshotAge) {
          const liens = (st.people && st.people["self"] && st.people["self"].liens) || [];
          snapshot = {
            age: st.age,
            amisProches: liens.filter(l => l.role === "ami" && (l.affection || 0) >= 60).length,
            amours: liens.filter(l => l.role === "amour" && (l.affection || 0) >= 45).length,
            enfants: liens.filter(l => l.role === "enfant").length
          };
        }
      }
    } catch (e) {
      error = e;
      break;
    }
  }

  const state = h.sandbox.window.VIE.engine.getState();
  return {
    age: state ? state.age : 0,
    reason: h.els["end-kicker"].textContent,
    state,
    events,
    snapshot,
    error
  };
}

module.exports = { loadGame, playLife, makeEl, FILES, DIR };
