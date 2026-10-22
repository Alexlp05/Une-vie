// Débogage de la mortalité
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const dir = 'C:/Users/alexa/Documents/Default Project/vie-game';
const files = [
  'data.js', 'config.js', 'lib/rng.js', 'lib/fmt.js', 'lib/util.js',
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
  Object.defineProperty(el, 'innerHTML', {
    get(){ return el._html; },
    set(v){
      el._html = v; el.children = [];
      if (!v) return;
      const tagRe = /<(\w+)([^>]*)>([\s\S]*?)<\/\1>/g;
      let m;
      while ((m = tagRe.exec(v)) !== null) {
        const child = makeEl(); child._tag = m[1]; child._attrs = {};
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
  querySelector(sel){ if(sel==='.story-card') return storyCard; if(sel[0]==='#') return this.getElementById(sel.slice(1)); return makeEl(); },
  querySelectorAll(sel){
    if (sel === '.screen') {
      return ['screen-title','screen-creation','screen-game','screen-end'].map(id => this.getElementById(id));
    }
    if (sel === '.tab-btn') return [];
    return [makeEl(), makeEl()];
  },
  createElement(){ return makeEl(); }, createElementNS(){ return makeEl(); },
  addEventListener(t, fn){ if(t==='DOMContentLoaded') this._dc=fn; },
  head: makeEl('head'), body: makeEl('body')
};

const sandbox = {
  document: documentStub, window: { scrollTo(){}, VIE: {} }, console,
  Math, JSON, Date, Object, Array, String, Number, Boolean, Set, Map, WeakSet, Error, parseInt, parseFloat, isNaN, isFinite,
  setTimeout: (fn)=>{ try{fn();}catch(e){ console.error('TIMEOUT:', e.message); } },
  clearTimeout(){}, setInterval(){ return 1; }, clearInterval(){},
  requestAnimationFrame: (fn)=>{ try{fn(0);}catch(e){} return 1; },
  localStorage: { _d:{}, getItem(k){return this._d[k]||null;}, setItem(k,v){this._d[k]=v;}, removeItem(k){delete this._d[k];} }
};
sandbox.window.document = documentStub;
sandbox.globalThis = sandbox; sandbox.self = sandbox;
vm.createContext(sandbox);
files.forEach(f => vm.runInContext(fs.readFileSync(path.join(dir, f), 'utf8'), sandbox, { filename: f }));

// Démarrer une vie
els['btn-start'].click();
const nameIn = documentStub.getElementById('input-name');
nameIn.value = 'Test';
nameIn.dispatchEvent({ type: 'input' });
els['sex-list'].children[0].click();
els['trait-list'].children[0].click();
els['origin-list'].children[0].click();
els['btn-create'].click();

const st = sandbox.window.VIE.engine.getState();
const me = st.people['self'];
console.log('État age :', st.age, '| année :', st.year);
console.log('self existe ?', !!me);
if (me) {
  console.log('  naissance :', me.naissance, '| sexe :', me.sexe, '| sante :', me.sante);
  const hp = sandbox.window.VIE.engine.health;
  console.log('  probabilité de mort :', hp.mortalityProb(me, st).toExponential(3));
  console.log('  shouldDie :', hp.shouldDie(me, st));
}
console.log('\nEvents joués, test de 5 tours :');
const ev = sandbox.window.VIE.engine.events;
console.log('getAllEvents().length =', ev.getAll().length);
const stNow = sandbox.window.VIE.engine.getState();
console.log('age =', stNow.age);
const chosen = ev.chooseForAction(stNow);
console.log('chooseForAction →', chosen ? (chosen.id + ' / stage=' + chosen.stage + ' / type=' + chosen.type) : 'NULL');

// Tester l'état après passage d'une année
const st2test = sandbox.window.VIE.engine.getState();
console.log('\nTest à age=1 (après avance) :');
const all = ev.getAll();
const bebe = all.filter(e => e.stage === 'bebe');
console.log('  événements stage=bebe :', bebe.length, '→', bebe.slice(0,10).map(e=>e.id).join(', '));
const cand = all.filter(e => e.stage === 'bebe' && ev.baseFilters(e, st2test));
console.log('  passent baseFilters :', cand.length, '→', cand.slice(0,8).map(e=>e.id + '(' + e.type + ')').join(', '));
const mainPool = all.filter(e => e.stage === 'bebe' && e.type !== 'aleatoire' && e.type !== 'crise' && e.type !== 'passif' && ev.baseFilters(e, st2test));
console.log('  pool principal (type=vie) :', mainPool.length, '→', mainPool.map(e=>e.id + '/once=' + e.once).join(', '));
// Vérifier les filtres internes de l'engine
console.log('  engine._recentEvents :', JSON.stringify(ev._recentEvents));
console.log('  engine._usedEvents (clés) :', Object.keys(ev._usedEvents).join(', ') || 'aucun');
// Test isolé : forcer un état neuf à age=1
const fresh = sandbox.window.VIE.engine.state.create();
fresh.age = 1; fresh.year = 2010;
fresh.people = st2test.people; fresh.flags = st2test.flags; fresh.passions = st2test.passions;
fresh.traits = st2test.traits; fresh.personality = st2test.personality;
try {
  const iso = ev.chooseForAction(fresh);
  console.log('  chooseForAction (état neuf age=1) :', iso ? iso.id : 'NULL');
} catch (e) {
  console.log('  chooseForAction EXCEPTION :', e.message);
}
// Tester chaque candidat avec diagnostic
console.log('\n  Diagnostic par événement (état neuf age=1) :');
all.filter(e => e.stage === 'bebe').forEach(e => {
  const reasons = [];
  if (e.once !== false && ev._usedEvents[e.id]) reasons.push('déjà joué');
  if (ev._recentEvents.includes(e.id)) reasons.push('récence');
  if (e.requiresFlag && !fresh.flags.includes(e.requiresFlag)) reasons.push('requiresFlag=' + e.requiresFlag);
  if (e.notFlag && fresh.flags.includes(e.notFlag)) reasons.push('notFlag');
  if (e.requiresFamily && fresh.origin && fresh.origin.flag !== e.requiresFamily) reasons.push('requiresFamily=' + e.requiresFamily);
  if (e.requiresRelation) reasons.push('requiresRelation');
  if (e.requiresPassion) reasons.push('requiresPassion=' + e.requiresPassion);
  if (e.minAge !== undefined && fresh.age < e.minAge) reasons.push('minAge=' + e.minAge);
  if (e.maxAge !== undefined && fresh.age > e.maxAge) reasons.push('maxAge=' + e.maxAge);
  if (e.customCond) { try { if (!e.customCond(fresh)) reasons.push('customCond=false'); } catch(err) { reasons.push('customCond ERREUR: ' + err.message); } }
  if (e.bind) reasons.push('bind');
  console.log('    ' + e.id.padEnd(16) + ' → ' + (reasons.length ? reasons.join(', ') : 'OK') + ' | baseFilters=' + ev.baseFilters(e, fresh));
});
// Tester manuellement
if (bebe.length) {
  const test = bebe[0];
  console.log('  test event:', test.id, 'once=', test.once, 'type=', test.type);
  console.log('    baseFilters →', ev.baseFilters(test, st2test));
  console.log('    flags requis:', test.requiresFlag, '| notFlag:', test.notFlag, '| requiresFamily:', test.requiresFamily);
}
let n = 0;for (let i = 0; i < 5; i++) {
  const stNow = sandbox.window.VIE.engine.getState();
  if (!stNow) break;
  const c = els['choices'].children;
  const btn = c.find(x => (x.className||'') === 'choice-btn') || c.find(x => (x.className||'').includes('next-btn'));
  if (!btn) break;
  btn.click();
  n++;
  const c2 = els['choices'].children;
  const cont = c2.find(x => (x.className||'').includes('next-btn')) || c2.find(x => (x.className||'') === 'choice-btn');
  if (cont) cont.click();
  const s2 = sandbox.window.VIE.engine.getState();
  const over = sandbox.window.VIE.game.isOver();
  console.log('  Tour ' + n + ' : âge=' + (s2?.age) + ' année=' + (s2?.year) + ' sante=' + (s2?.stats.sante) + ' en jeu=' + !over);
  if (over) {
    console.log('  → FIN DE PARTIE');
    console.log('  Raison (kicker):', documentStub.getElementById('end-kicker').textContent);
    console.log('  end-stats HTML:', documentStub.getElementById('end-stats').innerHTML.slice(0, 200));
    break;
  }
}
