// Test fonctionnel : simule un clic complet sur "Commencer" → création → "Naître" → jeu
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const dir = 'C:/Users/alexa/Documents/Default Project/vie-game';

const files = [
  'data.js', 'config.js',
  'lib/rng.js', 'lib/fmt.js', 'lib/util.js',
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
      // Sérialiser les enfants (le DOM a été modifié après innerHTML)
      return el.children.map(c => {
        const tag = c._tag || 'div';
        const attrs = Object.keys(c._attrs || {}).map(k => ' ' + k + '="' + c._attrs[k] + '"').join('');
        const inner = c._dirty ? c.innerHTML : (c._html || c.textContent || '');
        return '<' + tag + attrs + '>' + inner + '</' + tag + '>';
      }).join('');
    },
    set(v){
      el._html = v;
      el._dirty = false;
      el.children = [];
      if (!v) return;
      // Parser simple : extraire les balises de premier niveau
      const tagRe = /<(\w+)([^>]*)>([\s\S]*?)<\/\1>/g;
      let m;
      while ((m = tagRe.exec(v)) !== null) {
        const child = makeEl();
        child._tag = m[1];
        child._attrs = {};
        const attrRe = /(\w[\w-]*)="([^"]*)"/g; let a;
        while ((a = attrRe.exec(m[2])) !== null) { child._attrs[a[1]] = a[2]; }
        child.textContent = m[3].replace(/<[^>]*>/g, '').trim();
        child._html = m[3];
        child.dataset = {};
        Object.keys(child._attrs).forEach(k => {
          if (k.startsWith('data-')) child.dataset[k.slice(5).replace(/-(\w)/g, (_,c)=>c.toUpperCase())] = child._attrs[k];
          else child._attrs[k] = child._attrs[k];
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

//.querySelector('.story-card') doit retourner le même élément à chaque fois
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
  createElement(){ return makeEl(); },
  createElementNS(){ return makeEl(); },
  addEventListener(t, fn){ if(t==='DOMContentLoaded') this._dc=fn; },
  head: makeEl('head'), body: makeEl('body')
};

const sandbox = {
  document: documentStub,
  window: { scrollTo(){}, VIE: {} },
  console,
  Math, JSON, Date, Object, Array, String, Number, Boolean, Set, Map, WeakSet, Error, parseInt, parseFloat, isNaN, isFinite,
  setTimeout: (fn)=>{ try{fn();}catch(e){ console.error('TIMEOUT ERR:', e.message); } },
  clearTimeout(){},
  setInterval(){ return 1; },
  clearInterval(){},
  requestAnimationFrame: (fn)=>{ try{fn(0);}catch(e){} return 1; },
  localStorage: { _d:{}, getItem(k){return this._d[k]||null;}, setItem(k,v){this._d[k]=v;}, removeItem(k){delete this._d[k];} }
};
sandbox.window.document = documentStub;
sandbox.globalThis = sandbox;
sandbox.self = sandbox;
vm.createContext(sandbox);

for (const f of files) {
  const full = path.join(dir, f);
  const code = fs.readFileSync(full, 'utf8');
  try { vm.runInContext(code, sandbox, { filename: f }); }
  catch (e) { console.log('✗ ' + f + ' → ' + e.message); process.exit(1); }
}

console.log('=== TOUS LES FICHIERS CHARGÉS ===\n');

// Reproduire l'état initial du HTML (classes "hidden")
['screen-creation', 'screen-game', 'screen-end'].forEach(id => {
  const e = documentStub.getElementById(id);
  e.classList.add('hidden');
});
['panel-moi','panel-proches','panel-argent','panel-carriere','panel-journal','panel-arbre'].forEach(id => {
  documentStub.getElementById(id).classList.add('hidden');
});

// ── TEST 1 : clic sur "Commencer" ──────────────────────────
console.log('--- TEST 1 : bouton Commencer ---');
els['btn-start'].click();
console.log('Écran création visible :', !els['screen-creation'].classList.contains('hidden'));
console.log('Nombre de traits proposés :', els['trait-list'].children.length);
console.log('Nombre de sexes proposés :', els['sex-list'].children.length);
console.log('Nombre d\'origines proposées :', els['origin-list'].children.length);

// ── TEST 2 : sélection ────────────────────────────────────
console.log('\n--- TEST 2 : sélection nom/sexe/trait/origine ---');
const nameInput = documentStub.getElementById('input-name');
nameInput.value = 'Camille';
nameInput.dispatchEvent({ type: 'input' });
els['sex-list'].children[1].click();
els['trait-list'].children[0].click();
els['origin-list'].children[0].click();
console.log('Bouton Naître désactivé ?', els['btn-create'].disabled, '(attendu: false)');

// ── TEST 3 : clic sur "Naître" ────────────────────────────
console.log('\n--- TEST 3 : bouton Naître ---');
els['btn-create'].click();
const st = sandbox.window.VIE.engine.getState();
console.log('État créé :', st ? 'OUI' : 'NON');
if (st) {
  console.log('  Nom :', st.name, '| Sexe :', st.sexe, '| Âge :', st.age, '| Année :', st.year);
  console.log('  Personnalité :', JSON.stringify(st.personality));
  console.log('  Traits :', (st.traits || []).join(', '));
  console.log('  Personnes :', Object.keys(st.people || {}).length);
  console.log('  Écran jeu visible :', !els['screen-game'].classList.contains('hidden'));
  console.log('  Choix affichés :', els['choices'].children.length);
  console.log('  Titre événement :', els['story-title'].textContent);
  console.log('  Texte événement :', (els['story-text'].textContent || '').slice(0, 60) + '...');
  console.log('  Stats rendues :', els['stats-grid'].innerHTML.length, 'car. HTML');
  console.log('  Famille rendue :', els['family-card'].innerHTML.length > 0);
  console.log('  Finances rendues :', els['finances-card'].innerHTML.length > 0);
  console.log('  Monde rendu :', els['world-card'].innerHTML.length > 0);
  console.log('  Passions rendues :', els['passions-card'].innerHTML.length > 0);
  console.log('  Relations rendues :', els['relations-card'].innerHTML.length > 0);
  console.log('  Timeline rendue :', els['timeline'].innerHTML.length, 'car. HTML');
  const tabsEl = documentStub.getElementById('tabs-container');
  console.log('  Onglets :', tabsEl.children.length, tabsEl.children.map(c => c.dataset && c.dataset.tab).join(', '));
}

// ── TEST 4 : boucle de jeu (50 actions) ───────────────────
console.log('\n--- TEST 4 : boucle de jeu (vie complète) ---');
let actions = 0, errors = 0, ended = false;
for (let i = 0; i < 900; i++) {
  try {
    const choices = els['choices'].children;
    if (!choices.length) { console.log('  Aucun choix disponible'); ended = true; break; }
    // Bouton de choix (sans "next-btn") ou bouton "Continuer"
    const nextBtn = choices.find(c => (c.className || '').includes('next-btn'));
    const choiceBtn = choices.find(c => (c.className || '') === 'choice-btn');
    const btn = choiceBtn || nextBtn;
    if (!btn) {
      console.log('  Aucun bouton. Classes: ' + choices.map(c => JSON.stringify(c.className)).join(', '));
      ended = true; break;
    }
    btn.click();
    actions++;

    // Si on est sur l'écran de fin, rejouer
    if (!documentStub.getElementById('screen-end').classList.contains('hidden')) {
      ended = true;
      const st2 = sandbox.window.VIE.engine.getState();
      console.log('  Partie terminée à', st2?.age, 'ans, destin :', st2?.life || 'aucun');
      console.log('  Raison (kicker) :', documentStub.getElementById('end-kicker').textContent);
      console.log('  Titre de fin :', documentStub.getElementById('end-title').textContent);
      console.log('  Épitaphe :', documentStub.getElementById('end-epitaph').textContent);
      console.log('  Score :', documentStub.getElementById('end-score').textContent);
      console.log('  Statistiques finales :', documentStub.getElementById('end-stats').innerHTML.length, 'car.');
      console.log('  Entourage :', documentStub.getElementById('end-relations').innerHTML.length, 'car.');
      console.log('  Carrière :', st2 && st2.career ? (st2.career.track + ' niveau ' + st2.career.level) : 'AUCUNE');
      console.log('  Destin :', st2 && st2.life ? st2.life : 'aucun');
      console.log('  Personnes :', st2 && st2.people ? Object.keys(st2.people).length : 0);
      console.log('  Finances :', st2 && st2.finance ? st2.finance.compte + ' €' : '—');
      break;
    }

    // Continuer (relire les choix après le clic)
    const choices2 = els['choices'].children;
    const cont = choices2.find(c => (c.className || '').includes('next-btn')) || choices2.find(c => (c.className || '') === 'choice-btn');
    if (cont && cont !== btn) cont.click();
  } catch (e) {
    errors++;
    console.log('  ERREUR action ' + actions + ' : ' + e.message);
    console.log('    stack: ' + (e.stack || '').split('\n').slice(0, 4).join('\n           '));
    if (errors > 3) break;
  }
}
console.log('  Actions jouées :', actions, '| Erreurs :', errors, '| Finie :', ended);

// ── TEST 4b : sauvegarde / chargement ──────────────────────
console.log('\n--- TEST 4b : sauvegarde / chargement ---');
try {
  // Le stub localStorage simule le stockage
  const store = {};
  sandbox.localStorage = {
    getItem(k){ return store[k] === undefined ? null : store[k]; },
    setItem(k, v){ store[k] = String(v); },
    removeItem(k){ delete store[k]; }
  };
  const sv = sandbox.window.VIE.engine.save;
  const before = sandbox.window.VIE.engine.getState();
  const resSave = sandbox.window.VIE.game.saveGame('auto');
  console.log('  Sauvegarde :', resSave.ok ? 'OK' : 'ÉCHEC ' + resSave.reason);
  console.log('  Clé présente :', Object.keys(store).length > 0);

  // On modifie l'état, puis on recharge
  before.age = 999;
  const resLoad = sandbox.window.VIE.game.loadGame('auto');
  const after = sandbox.window.VIE.engine.getState();
  console.log('  Chargement :', resLoad.ok ? 'OK' : 'ÉCHEC ' + resLoad.reason);
  console.log('  Âge restauré :', after.age, '(attendu: différent de 999)');
} catch (e) {
  console.log('  ERREUR sauvegarde/chargement : ' + e.message);
}
console.log('\n--- TEST 4c : bouton Rejouer ---');
if (ended) {
  try {
    const replay = documentStub.getElementById('btn-replay');
    const restart = documentStub.getElementById('btn-restart');
    const btnReplay = replay || restart;
    if (btnReplay) {
      btnReplay.click();
      const st3 = sandbox.window.VIE.engine.getState();
      console.log('  Rejouer cliqué → état age =', st3?.age, '| en jeu =', !sandbox.window.VIE.game.isOver());
      console.log('  Écran de création visible :', !documentStub.getElementById('screen-creation').classList.contains('hidden'));
    } else {
      console.log('  Bouton Rejouer INTROUVABLE');
    }
  } catch (e) {
    console.log('  ERREUR Rejouer : ' + e.message);
  }
} else {
  console.log('  (partie non terminée, test ignoré)');
}

// ── TEST 5 : onglets ──────────────────────────────────────
console.log('\n--- TEST 5 : navigation onglets ---');
const tabsEl2 = documentStub.getElementById('tabs-container');
['moi','proches','argent','carriere','journal','arbre'].forEach(tab => {
  try {
    const btn = tabsEl2.children.find(c => c && c.dataset && c.dataset.tab === tab);
    if (btn) {
      btn.click();
      const panel = documentStub.getElementById('panel-' + tab);
      console.log('  Onglet ' + tab + ' : visible=' + !panel.classList.contains('hidden') + ', contenu=' + panel.innerHTML.length + ' car. HTML');
    } else {
      console.log('  Onglet ' + tab + ' : BOUTON INTROUVABLE (classes: ' + tabsEl2.children.map(c=>c.dataset&&c.dataset.tab).join(',') + ')');
    }
  } catch (e) {
    console.log('  Onglet ' + tab + ' : ERREUR ' + e.message);
  }
});

console.log('\n=== FIN DES TESTS ===');
