// Vérifie quelles globals sont définies dans data.js et les autres fichiers data/
const fs = require('fs');
const path = require('path');

const dir = 'C:/Users/alexa/Documents/Default Project/vie-game';
const files = ['data.js', 'config.js'].concat(
  fs.readdirSync(path.join(dir, 'data')).filter(f => f.endsWith('.js')).map(f => 'data/' + f)
);

const names = ['EVENTS','STAGES','HOUSING','THEMES','OPPORTUNITIES','MILESTONES','WORLD_EVENTS',
  'PASSION_DEFS','TRAITS','ORIGINS','CAREER_TRACKS','ECONOMY_STATES','ENDINGS','STAGE_SLOTS',
  'randomOrigins','randomSurname','randomParentName','randomName','uniqueId',
  'worldStart','syncArgent','economyEvolve','stageForAge','addHistory','relationStatus',
  'findRelation','applyRelation','themeOf','eventTypeLabel','lifeTitle','getCareerTrack'];

const sources = {};
for (const f of files) {
  const p = path.join(dir, f);
  if (!fs.existsSync(p)) continue;
  sources[f] = fs.readFileSync(p, 'utf8');
}

console.log('=== DEFINITION DES GLOBALS ===');
for (const n of names) {
  const found = [];
  for (const [f, code] of Object.entries(sources)) {
    const patterns = [
      new RegExp('var\\s+' + n + '\\s*='),
      new RegExp('function\\s+' + n + '\\s*\\('),
      new RegExp('const\\s+' + n + '\\s*='),
      new RegExp('let\\s+' + n + '\\s*=')
    ];
    if (patterns.some(re => re.test(code))) found.push(f);
  }
  console.log((found.length ? '✓ ' : '✗ MANQUANT  ') + n.padEnd(18) + (found.join(', ')));
}

// Vérifier ce que data.js exporte réellement
console.log('\n=== TOPS-LEVEL dans data.js ===');
const dataCode = sources['data.js'] || '';
const decls = [...dataCode.matchAll(/^(?:var|const|let|function)\s+([A-Za-z_$][\w$]*)/gm)].map(m => m[1]);
console.log([...new Set(decls)].join(', '));

// Vérifier les exports window.VIE.data
console.log('\n=== window.VIE.data dans data/*.js ===');
for (const [f, code] of Object.entries(sources)) {
  if (!f.startsWith('data/')) continue;
  const exps = [...code.matchAll(/window\.VIE\.data\.(\w+)\s*=/g)].map(m => m[1]);
  if (exps.length) console.log(f + ' → ' + exps.join(', '));
}
