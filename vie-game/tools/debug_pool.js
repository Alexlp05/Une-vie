// Diagnostic du pool d'événements : joue une partie et trace les pool vides
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const dir = 'C:/Users/alexa/Documents/Default Project/vie-game';
const files = [
  'data.js', 'config.js', 'lib/rng.js', 'lib/fmt.js', 'lib/util.js',
  'data/traits.js', 'data/origins.js', 'data/names.js', 'data/careers.js',
  'data/milestones.js', 'data/opportunities.js',
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

const els = {};
function makeEl(id) {
  const el = {
    _id: id, textContent: '', className: '', style: {}, children: [], listeners: {}, _html: '', _attrs: {}, _dirty: false,
    classList: { _s: new Set(), add(c){this._s.add(c);}, remove(c){this._s.delete(c);}, contains(c){return this._s.has(c);}, toggle(c,force){ if(force===undefined){ if(this._s.has(c)) this._s.delete(c); else this._s.add(c);} else if(force) this._s.add(c); else this._s.delete(c);} },
    dataset: {},
    appendChild(ch){ el.children.push(ch); el._dirty = true; return ch; },
    insertBefore(ch, ref){ const i = ref ? el.children.indexOf(ref) : -1; if (i < 0) el.children.unshift(ch); else el.children.splice(i, 0, ch); el._dirty = true; return ch; },
    removeChild(ch){ const i = el.children.indexOf(ch); if (i >= 0) el.children.splice(i, 1); el._dirty = true; return ch; },
    addEventListener(t, fn){ (el.listeners[t] = el.listeners[t]||[]).push(fn); },
    removeEventListener(){},
    scrollIntoView(){}, querySelector(){ return makeEl(); }, querySelectorAll(){ return el.children.slice(); },
    setAttribute(k,v){ el._attrs[k]=v; }, getAttribute(k){ return el._attrs[k]; },
    focus(){}, blur(){}, remove(){}, click(){ (el.listeners.click||[]).forEach(fn=>fn.call(el)); },
    dispatchEvent(e){ (el.listeners[e.type]||[]).forEach(fn=>fn.call(el,e)); }
  };
  Object.defineProperty(el, 'innerHTML', {
    get(){
      if (!el._dirty) return el._html;
      return el.children.map(c => {
        const tag = c._tag || 'div';
        const attrs = Object.keys(c._attrs || {}).map(k => ' ' + k + '="' + c._attrs[k] + '"').join('');
        const inner = c._dirty ? c.innerHTML : (c._html || c.textContent || '');
        return '<' + tag + attrs + '>' + inner + '</' + tag + '>';
      }).join('');
    },
    set(v){
      el._html = v; el._dirty = false; el.children = [];
      if (!v) return;
      const tagRe = /<(\w+)([^>]*)>([\s\S]*?)<\/\1>/g;
      let m;
      while ((m = tagRe.exec(v)) !== null) {
        const child = makeEl();
        child._tag = m[1]; child._attrs = {};
        const attrRe = /(\w[\w-]*)="([^"]*)"/g; let a;
        while ((a = attrRe.exec(m[2])) !== null) { child._attrs[a[1]] = a[2]; }
        child.textContent = m[3].replace(/<[^>]*>/g, '').trim();
        child._html = m[3]; child.dataset = {};
        Object.keys(child._attrs).forEach(k => {
          if (k.startsWith('data-')) child.dataset[k.slice(5).replace(/-(\w)/g, (_,c)=>c.toUpperCase())] = child._attrs[k];
        });
        el.children.push(child);
      }
    }
  });
  Object.defineProperty(el, 'disabled', { get(){return el._disabled;}, set(v){ el._disabled=v; } });
  Object.defineProperty(el, 'id', { get(){return el._id;}, set(v){ el._id=v; } });
  el.value = '';
  return el;
}

const storyCard = makeEl('story-card');
const documentStub = {
  getElementById(id){ if(!els[id]) els[id]=makeEl(id); return els[id]; },
  querySelector(sel){
    if (sel === '.story-card') return storyCard;
    if (sel[0] === '#') return this.getElementById(sel.slice(1));
    return makeEl();
  },
  querySelectorAll(sel){
    if (sel === '.tab-btn') {
      const c = els['tabs-container'];
      return c ? c.children.filter(ch => ch && ch.dataset && ch.dataset.tab) : [];
    }
    if (sel === '.tab-panel') {
      return ['vie','moi','proches','argent','carriere','journal','arbre'].map(id => this.getElementById('panel-' + id));
    }
    if (sel === '.screen') {
      return ['screen-title','screen-creation','screen-game','screen-end'].map(id => this.getElementById(id));
    }
    return [makeEl(), makeEl()];
  },
  createElement(){ return makeEl(); }, createElementNS(){ return makeEl(); },
  addEventListener(t, fn){ if(t==='DOMContentLoaded') this._dc=fn; },
  head: makeEl('head'), body: makeEl('body')
};

const sandbox = {
  document: documentStub,
  window: { scrollTo(){}, VIE: {} },
  console,
  Math, JSON, Date, Object, Array, String, Number, Boolean, Set, Map, WeakSet, Error, parseInt, parseFloat, isNaN, isFinite,
  setTimeout: (fn)=>{ try{fn();}catch(e){} },
  clearTimeout(){}, setInterval(){ return 1; }, clearInterval(){},
  requestAnimationFrame: () => 1,
  localStorage: { getItem(){ return null; }, setItem(){}, removeItem(){} }
};
sandbox.window.document = documentStub;
sandbox.globalThis = sandbox; sandbox.self = sandbox;
vm.createContext(sandbox);
files.forEach(f => vm.runInContext(fs.readFileSync(path.join(dir, f), 'utf8'), sandbox, { filename: f }));

sandbox.window.__TRACE_EV = true;
sandbox.window.__TRACE_END = true;
sandbox.window.VIE.game.startGame('Test', 'solitaire', 'Classe moyenne', 'homme');

let n = 0;
for (let i = 0; i < 1500; i++) {
  const st = sandbox.window.VIE.engine.getState();
  if (!st || sandbox.window.VIE.game.isOver()) break;
  const choices = els['choices'].children;
  const nextBtn = choices.find(c => (c.className || '').includes('next-btn'));
  const choiceBtn = choices.find(c => (c.className || '') === 'choice-btn');
  const btn = choiceBtn || nextBtn;
  if (!btn) { console.log('Pas de bouton à l\'action', n, 'âge', st.age); break; }
  btn.click(); n++;
  const stNow2 = sandbox.window.VIE.engine.getState();
  if (process.env.LOG) {
    console.log('  act', n, '| âge', stNow2.age, '| slot', stNow2.slot, '| event:', els['story-title'].textContent, '| passif:', /Continuer/.test(els['choices'].children.map(c=>c.textContent).join('|')));
  }
  if (sandbox.window.VIE.game.isOver()) {
    console.log('FIN à', st.age, 'ans après', n, 'actions | kicker:', els['end-kicker'].textContent);
    break;
  }
}
const fin = sandbox.window.VIE.engine.getState();
console.log('Age final :', fin && fin.age, '| ans, actions:', n, '| over:', sandbox.window.VIE.game.isOver(), '| kicker:', els['end-kicker'].textContent);
console.log('Carrière :', fin && fin.career ? (fin.career.track + ' niveau ' + fin.career.level) : 'AUCUNE');
console.log('Destin :', fin && fin.life ? fin.life : 'aucun');
console.log('Flags :', fin && fin.flags ? fin.flags.join(',') : '—');
console.log('Passions :', fin && fin.passions ? Object.keys(fin.passions).filter(k => fin.passions[k] > 0).join(',') : '—');
console.log('Personnes :', fin && fin.people ? Object.keys(fin.people).length : 0);
console.log('Finances :', fin && fin.finance ? (fin.finance.compte + ' € / épargne ' + fin.finance.epargne.livret) : '—');
