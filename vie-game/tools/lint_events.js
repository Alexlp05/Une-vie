/* ============================================================
   UNE VIE v0.5 — LINTER ÉVÉNEMENTS
   Valide le schéma de tous les fichiers events_*.js
   Usage: node tools/lint_events.js
   ============================================================ */

const fs = require("fs");
const path = require("path");

const EVENTS_DIR = path.join(__dirname, "..", "data");
const CONFIG = require("../data/config_events.js"); // sera dispo si on charge via node avec VM

// Schéma attendu
const REQUIRED_FIELDS = ["id", "stage", "title", "text", "choices"];
const CHOICE_REQUIRED = ["text"];
const KNOWN_EFFECT_KEYS = [
  "sante", "energie", "argent", "intelligence", "social", "bonheur",
  "stress", "apparence", "reputation", "confiance",
  "invest_stocks", "invest_realestate", "invest_business"
];
const KNOWN_META_KEYS = [
  "type", "once", "weight", "requiresRelation", "notRelation",
  "requiresPassion", "requiresFlag", "notFlag", "requiresFamily",
  "requiresCareer", "requiresCareerLevel", "crisisCond",
  "theme", "bind", "passive", "category", "memory", "customCond",
  "requiresSexe", "minAge", "maxAge"
];

function loadAllEvents() {
  const files = fs.readdirSync(EVENTS_DIR).filter(f => f.startsWith("events_") && f.endsWith(".js"));
  let allEvents = [];
  files.forEach(file => {
    const content = fs.readFileSync(path.join(EVENTS_DIR, file), "utf8");
    // Exécute le fichier dans un contexte isolé pour récupérer EVENTS array
    const ctx = { EVENTS: [], ev: function(stage, id, title, text, choices, meta) {
      EVENTS.push({ id, stage, title, text, choices, ...meta, weight: meta?.weight || 1 });
    }};
    // On ne peut pas facilement exécuter le code JS ici sans vm, on fait du parsing basique
    // Pour l'instant, on lit les appels ev() via regex
    const evCalls = content.match(/ev\([\s\S]*?\);/g) || [];
    evCalls.forEach(call => {
      // Parsing très simplifié - en prod utiliser un vrai parser
      console.warn("Parsing basique uniquement - utiliser node --check pour syntaxe");
    });
  });
  return allEvents;
}

function validateEvent(event, filename) {
  const errors = [];
  const warnings = [];

  // Champs requis
  REQUIRED_FIELDS.forEach(f => {
    if (!event[f]) errors.push(`Champ manquant: ${f}`);
  });

  // Choices
  if (event.choices && Array.isArray(event.choices)) {
    event.choices.forEach((ch, i) => {
      CHOICE_REQUIRED.forEach(f => { if (!ch[f]) errors.push(`Choice ${i}: champ manquant ${f}`); });
      // Effets connus
      if (ch.effects) {
        Object.keys(ch.effects).forEach(k => {
          if (!KNOWN_EFFECT_KEYS.includes(k)) warnings.push(`Choice ${i}: effet inconnu "${k}"`);
        });
      }
      // Meta choice
      ["goodEffects", "badEffects", "goodResult", "badResult", "flag", "unflag", "relation", "housing", "passion", "passionDelta", "career", "retire", "careerAdvance", "careerBoost", "personality", "traitGain", "habit", "habitDelta", "secret", "invest", "compatMod"].forEach(k => {
        if (ch[k] !== undefined && !["text", "note", "chance"].includes(k)) {
          // connu
        }
      });
    });
  }

  // Meta event
  Object.keys(event).forEach(k => {
    if (!REQUIRED_FIELDS.includes(k) && k !== "choices" && !KNOWN_META_KEYS.includes(k)) {
      warnings.push(`Clé méta inconnue: ${k}`);
    }
  });

  // once: true/false explicite recommandé
  if (event.once === undefined) warnings.push("`once` non défini (défaut=false recommandé pour répétables)");

  // bind validation
  if (event.bind) {
    Object.keys(event.bind).forEach(key => {
      var spec = event.bind[key];
      if (!spec.role) errors.push(`bind.${key}: role manquant`);
      if (spec.trait && !Array.isArray(spec.trait)) warnings.push(`bind.${key}.trait devrait être un tableau`);
    });
  }

  return { errors, warnings };
}

function main() {
  console.log("=== LINTER ÉVÉNEMENTS v0.5 ===");
  // Note: pour validation complète, charger les fichiers via require après build
  // Ici on fait juste un check syntaxique de base
  const files = fs.readdirSync(EVENTS_DIR).filter(f => f.startsWith("events_") && f.endsWith(".js"));
  let totalErrors = 0, totalWarnings = 0;

  files.forEach(file => {
    try {
      require(path.join(EVENTS_DIR, file));
      console.log(`✓ ${file}: syntaxe OK`);
    } catch (e) {
      console.error(`✗ ${file}: ${e.message}`);
      totalErrors++;
    }
  });

  console.log(`\nTotal: ${files.length} fichiers, ${totalErrors} erreurs, ${totalWarnings} avertissements`);
  process.exit(totalErrors > 0 ? 1 : 0);
}

main();