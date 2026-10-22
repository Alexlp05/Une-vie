// Vérifie que chaque module définit les helpers qu'il utilise
const fs = require('fs');
const path = require('path');

const dir = 'C:/Users/alexa/Documents/Default Project/vie-game';
const files = [
  'data.js', 'config.js',
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

const HELPERS = ['clamp', 'rand', 'weightedPick', 'uniqueId', 'deepClone'];

let problems = 0;
for (const f of files) {
  const p = path.join(dir, f);
  if (!fs.existsSync(p)) continue;
  const code = fs.readFileSync(p, 'utf8');

  for (const h of HELPERS) {
    // Utilisé ?
    const used = new RegExp('(?<![.\\w])' + h + '\\s*\\(').test(code);
    if (!used) continue;
    // Défini localement ?
    const definedLocal = new RegExp('function\\s+' + h + '\\s*\\(').test(code)
      || new RegExp('var\\s+' + h + '\\s*=').test(code)
      || new RegExp('(?:const|let)\\s+' + h + '\\s*=').test(code);
    // Défini globalement (data.js) et pas masqué par un local ?
    const definedGlobal = definedLocal || fs.readFileSync(path.join(dir, 'data.js'), 'utf8').includes('function ' + h)
      || fs.readFileSync(path.join(dir, 'data.js'), 'utf8').includes('var ' + h + ' =')
      || fs.readFileSync(path.join(dir, 'lib/util.js'), 'utf8').includes(h + ':');
    if (!definedLocal && !definedGlobal) {
      console.log('✗ ' + f + ' : ' + h + '() utilisé mais non défini');
      problems++;
    }
  }
}
console.log(problems === 0 ? '\n✓ Aucun helper manquant' : '\n' + problems + ' problème(s)');
