// Analyseur de balance des accolades pour trouver les erreurs de syntaxe
const fs = require('fs');
const path = require('path');

const files = process.argv.slice(2);
if (!files.length) {
  const dir = 'C:/Users/alexa/Documents/Default Project/vie-game';
  files.push('ui/statsView.js', 'engine/interactions.js', 'game.js', 'ui/tabs.js', 'ui/render.js', 'ui/personCard.js', 'ui/familyTree.js', 'ui/timeline.js', 'ui/financeView.js', 'ui/careerView.js');
}

for (const f of files) {
  const full = path.join('C:/Users/alexa/Documents/Default Project/vie-game', f);
  if (!fs.existsSync(full)) { console.log(f + ' : INTROUVABLE'); continue; }
  const code = fs.readFileSync(full, 'utf8');
  const lines = code.split('\n');

  let depth = 0;
  let inStr = null;
  let inTpl = false;
  let inLine = false;
  let inBlock = false;
  const stack = [];
  let report = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (let j = 0; j < line.length; j++) {
      const c = line[j];
      const nx = line[j + 1];

      if (inLine) break;
      if (inBlock) { if (c === '*' && nx === '/') { inBlock = false; j++; } continue; }
      if (inStr) {
        if (c === '\\') { j++; continue; }
        if (c === inStr) inStr = null;
        continue;
      }
      if (inTpl) {
        if (c === '\\') { j++; continue; }
        if (c === '`') inTpl = false;
        continue;
      }
      if (c === '/' && nx === '/') { inLine = true; break; }
      if (c === '/' && nx === '*') { inBlock = true; j++; continue; }
      if (c === '"' || c === "'") { inStr = c; continue; }
      if (c === '`') { inTpl = true; continue; }
      if (c === '{' || c === '(' || c === '[') { depth++; stack.push({ c, line: i + 1 }); continue; }
      if (c === '}' || c === ')' || c === ']') {
        depth--;
        const open = stack.pop();
        if (!open) {
          report.push('Ligne ' + (i + 1) + ' : fermeture "' + c + '" sans ouverture');
        } else {
          const pairs = { '{': '}', '(': ')', '[': ']' };
          if (pairs[open.c] !== c) {
            report.push('Ligne ' + (i + 1) + ' : "' + c + '" ne correspond pas à "' + open.c + '" ouvert ligne ' + open.line);
          }
        }
      }
    }
    inLine = false;
  }

  console.log('=== ' + f + ' ===');
  if (report.length) report.forEach(r => console.log('  ' + r));
  else console.log('  Pas de mismatch d\'accolades');
  console.log('  Profondeur finale: ' + depth + (stack.length ? ' | ' + stack.length + ' bloc(s) non fermé(s): lignes ' + stack.map(s => s.line + '(' + s.c + ')').join(', ') : ''));
}
