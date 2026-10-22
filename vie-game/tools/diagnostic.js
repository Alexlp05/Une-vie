// Diagnostic : simule un chargement navigateur et rapporte les erreurs
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const dir = 'C:/Users/alexa/Documents/Default Project/vie-game';

const files = [
  'data.js',
  'config.js',
  'lib/rng.js', 'lib/fmt.js', 'lib/util.js',
  'data/traits.js', 'data/origins.js', 'data/names.js', 'data/careers.js', 'data/milestones.js', 'data/opportunities.js',
  'data/events_famille.js', 'data/events_amour.js', 'data/events_amitie.js',
  'data/events_pro.js', 'data/events_vices.js', 'data/events_sante.js',
  'data/events_monde.js', 'data/events_passifs.js', 'data/config_events.js',
  'engine/state.js', 'engine/personality.js', 'engine/people.js',
  'engine/relations.js', 'engine/encounters.js', 'engine/interactions.js', 'engine/events.js',
  'engine/finance.js', 'engine/career.js', 'engine/health.js',
  'engine/world.js', 'engine/save.js',
  'ui/tabs.js', 'ui/personCard.js', 'ui/familyTree.js', 'ui/timeline.js',
  'ui/financeView.js', 'ui/careerView.js', 'ui/statsView.js', 'ui/render.js',
  'game.js'
];

// DOM minimal
const els = {};
function makeEl(id) {
  const el = {
    _id: id, textContent: '', className: '', style: {}, children: [], listeners: {}, _html: '', _attrs: {},
    classList: { _s: new Set(), add(c){this._s.add(c);}, remove(c){this._s.delete(c);}, contains(c){return this._s.has(c);} },
    appendChild(ch){ el.children.push(ch); return ch; },
    addEventListener(t, fn){ (el.listeners[t] = el.listeners[t]||[]).push(fn); },
    removeEventListener(){},
    scrollIntoView(){}, querySelector(){ return makeEl(); }, querySelectorAll(){ return el.children.slice(); },
    setAttribute(k,v){ el._attrs[k]=v; }, getAttribute(k){ return el._attrs[k]; },
    focus(){}, blur(){}, remove(){}, click(){ (el.listeners.click||[]).forEach(fn=>fn()); },
    dispatchEvent(e){ (el.listeners[e.type]||[]).forEach(fn=>fn(e)); }
  };
  Object.defineProperty(el, 'innerHTML', { get(){return el._html;}, set(v){ el._html=v; if(v==='') el.children=[]; } });
  Object.defineProperty(el, 'disabled', { get(){return el._disabled;}, set(v){ el._disabled=v; } });
  Object.defineProperty(el, 'id', { get(){return el._id;}, set(v){ el._id=v; } });
  el.value = '';
  return el;
}

const documentStub = {
  getElementById(id){ if(!els[id]) els[id]=makeEl(id); return els[id]; },
  querySelector(sel){ return sel[0]==='#' ? this.getElementById(sel.slice(1)) : makeEl(); },
  querySelectorAll(){ return [makeEl(), makeEl()]; },
  createElement(){ return makeEl(); },
  createElementNS(){ return makeEl(); },
  addEventListener(t, fn){ if(t==='DOMContentLoaded') this._dc=fn; },
  head: makeEl('head'), body: makeEl('body')
};

const sandbox = {
  document: documentStub,
  window: { scrollTo(){}, VIE: {} },
  console,
  Math, JSON, Date, Object, Array, String, Number, Boolean, Set, Map, WeakSet, Error, parseInt, parseFloat, isNaN,
  setTimeout: (fn)=>{ try{fn();}catch(e){ console.error('setTimeout error:', e.message); } },
  clearTimeout(){},
  setInterval(){ return 1; },
  clearInterval(){},
  requestAnimationFrame: (fn)=>{ try{fn(0);}catch(e){} return 1; },
  localStorage: {
    _d:{}, getItem(k){return this._d[k]||null;}, setItem(k,v){this._d[k]=v;}, removeItem(k){delete this._d[k];}
  }
};
sandbox.window.document = documentStub;
sandbox.globalThis = sandbox;
sandbox.self = sandbox;
vm.createContext(sandbox);

let failed = false;
for (const f of files) {
  const full = path.join(dir, f);
  if (!fs.existsSync(full)) { console.log('✗ MANQUANT: ' + f); failed = true; continue; }
  const code = fs.readFileSync(full, 'utf8');
  try {
    vm.runInContext(code, sandbox, { filename: f });
    console.log('✓ ' + f);
  } catch (e) {
    console.log('✗ ERREUR ' + f + ' → ' + e.message);
    failed = true;
  }
}

if (failed) { console.log('\n=== CHARGEMENT ÉCHOUÉ ==='); process.exit(1); }

console.log('\n=== CHARGEMENT OK ===');
console.log('VIE keys:', Object.keys(sandbox.window.VIE || {}).join(', '));
console.log('VIE.engine keys:', Object.keys(sandbox.window.VIE?.engine || {}).join(', '));
console.log('VIE.data keys:', Object.keys(sandbox.window.VIE?.data || {}).join(', '));
console.log('EVENTS count:', sandbox.EVENTS ? sandbox.EVENTS.length : 'undefined (global)');
console.log('TRAITS:', sandbox.TRAITS ? sandbox.TRAITS.length : 'undefined (global)');
console.log('ORIGINS:', sandbox.ORIGINS ? sandbox.ORIGINS.length : 'undefined (global)');
console.log('CAREER_TRACKS:', sandbox.CAREER_TRACKS ? Object.keys(sandbox.CAREER_TRACKS).length : 'undefined (global)');
console.log('STAGES:', sandbox.STAGES ? sandbox.STAGES.length : 'undefined (global)');
console.log('HOUSING:', sandbox.HOUSING ? Object.keys(sandbox.HOUSING).length : 'undefined (global)');
console.log('THEMES:', sandbox.THEMES ? Object.keys(sandbox.THEMES).length : 'undefined (global)');
