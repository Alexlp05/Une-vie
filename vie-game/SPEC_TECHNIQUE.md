# UNE VIE — Spécification Technique Complète v0.4

## 1. Architecture Générale

### 1.1 Structure des Fichiers
```
vie-game/
├── index.html      # Structure DOM, écrans, overlays
├── style.css       # Styles, thèmes visuels, animations
├── data.js         # Données statiques : EVENTS, ORIGINS, TRAITS, CAREER_TRACKS, HOUSING, OPPORTUNITIES, MILESTONES, WORLD_EVENTS
└── game.js         # Moteur : état, boucles, sélection événements, résolution, rendu, finances, carrière, relations
```

### 1.2 Pattern d'Exécution
- **IIFE** (Immediately Invoked Function Expression) dans `game.js` → scope privé, pas de pollution globale
- **Bootstrap** : `DOMContentLoaded` → `initTitle()` → écran titre
- **Aucune dépendance externe** : vanilla JS, HTML, CSS

### 1.3 Écrans (index.html)
| ID | Description |
|----|-------------|
| `screen-title` | Écran d'accueil, bouton "Commencer" |
| `screen-creation` | Nom, trait (9 choix), origine (3 tirées au sort par `randomOrigins(3)`, reroll possible) |
| `screen-game` | Jeu principal : stats, finances, famille, carrière, carte d'événement, choix |
| `screen-end` | Fin de vie : titre, épitaphe, stats, carrière/finances, entourage, synopsis |

**Overlays** : `#year-fade` (transition d'année + récap), `#year-fade-num`, `#year-fade-recap`

---

## 2. État Global (`state` dans game.js)

```javascript
state = {
  // Identité
  name: String,           // Nom du joueur
  trait: Object,          // Référence vers TRAITS[...]
  origin: Object,         // Référence vers ORIGINS[...]
  surname: String,        // Nom de famille (généré à la création)

  // Temps
  age: Number,            // Âge courant (0-100)
  year: Number,           // Année civile (1990-2010 + age)
  slot: Number,           // Index d'action dans l'année (0 à slots-1)

  // Stats 0-100 (clé = STAT_KEYS)
  stats: {
    sante: 85,
    energie: 80,
    argent: 42,           // Niveau de vie perçu (dérivé de money)
    intelligence: 20,
    social: 20,
    bonheur: 60
  },

  // Économie réelle (k€)
  money: 8,               // Épargne liquide, clamp [-30, 600]
  investments: {          // Portefeuille d'investissements
    stocks: 0,            // Actions / ETF
    realEstate: 0,        // Immobilier locatif / SCPI
    business: 0           // Capital entreprise
  },

  // Carrière
  career: null || {
    track: String,        // Clé CAREER_TRACKS
    level: Number,        // 0 = entrée, max = track.levels.length-1
    sinceAge: Number
  },

  // Logement
  housing: "parents",     // Clé HOUSING

  // Relations (famille, amis, amour, enfants, fratrie, parent)
  relations: [
    { name, type, bond: 0-100, compat: 0-100, sinceAge }
  ],

  // Passions (niveau 0-5+)
  passions: { peinture: 1, musique: 2, ... },

  // Flags narratifs (strings)
  flags: ["famille_populaire", "associatif", "investisseur", ...],

  // Destin extraordinaire
  life: null,             // Clé OPPORTUNITIES (ex: "politique")
  pendingOpp: null,       // Opportunité en attente d'affichage

  // Historique
  lastCrisisAge: -10,
  history: [ {age, title, result} ],
  yearLog: [ "Titre événement" ],  // Pour récap annuel

  // Monde parallèle
  world: { economy, inflation, event, eventHistory },
  worldMods: { incomeMult, expenses, title, kind, text },

  // Système anti-répétition & mémoire
  // (gérés en variables globales du module, pas dans state)
}
```

### 2.1 Constantes Globales (game.js)
```javascript
STAT_KEYS = ["sante","energie","argent","intelligence","social","bonheur"]
STAT_LABELS = { sante:"Santé", ... }
STAGE_SLOTS = { bebe:1, enfance:1, ado:2, jeune:3, adulte:3, maturite:2, retraite:2, vieillesse:1 }
```

---

## 3. Système d'Événements (data.js)

### 3.1 Structure d'un Événement
```javascript
{
  id: "unique_id",
  stage: "bebe|enfance|ado|jeune|adulte|maturite|retraite|vieillesse",
  title: "Titre affiché",
  text: "Description narrative",
  choices: [
    {
      text: "Texte du bouton",
      note: "Indice optionnel (ex: 'Nécessite 20 k€')",
      // Effets directs
      effects: { stat: delta | [min,max], argent: delta | [min,max],
                 invest_stocks: k€, invest_realestate: k€, invest_business: k€ },
      // Effets probabilistes
      chance: 0.7,
      goodEffects: { ... }, goodResult: "...",
      badEffects: { ... },  badResult: "...",
      // Flags
      flag: "flag_id", unflag: "flag_id",
      // Relations
      relation: { type: "amour|ami|enfant|parent|fratrie", create: true, delta: 20 },
      // Logement
      housing: "coloc|location|proprio_appart|proprio_maison|grande_maison",
      // Passion
      passion: "peinture", passionDelta: 2,
      // Carrière
      career: "etudes|travail|entreprise",
      retire: true,
      careerAdvance: true,
      careerBoost: true,
      // Résultat narratif
      result: "Texte affiché après choix"
    }
  ],
  // Métadonnées de filtrage
  type: "vie|carriere|relation|aleatoire|crise|passion|sante|famille|argent|social|societe|business_mgmt",
  once: true|false,                    // false = répétable
  weight: 1,                           // Pour rollRandomEvent (aléatoires)
  requiresRelation: { type, minBond }, // Relation requise
  notRelation: { type },               // Bloque si relation existe
  requiresPassion: "peinture" | 2,     // Passion requise (nom ou niveau min)
  requiresFlag: "flag_id",
  notFlag: "flag_id",
  requiresFamily: "famille_populaire", // Flag origine requis
  requiresCareer: true,                // Carrière quelconque requise
  requiresCareerLevel: 3,              // Niveau carrière min (business_mgmt)
  crisisCond: function(state) { return bool }, // Pour type="crise"
  theme: "social|carriere|..."         // Thème visuel (override auto)
}
```

### 3.2 Collections d'Événements
| Variable | Contenu | Sélection |
|----------|---------|-----------|
| `EVENTS` | ~200 événements de vie | `pickEvent`, `rollRandomEvent`, `crisisEvent`, `genericEvent`, `findBusinessEvent` |
| `MILESTONES` | Jalons forcés par âge (18, 66) | `pendingMilestone()` priorité absolue |
| `OPPORTUNITIES` | 6 destins extraordinaires | `checkOpportunity()` annuel, chance 0.10/an dans fenêtre d'âge |
| `WORLD_EVENTS` | Événements monde (économie, climat) | `worldTick()` 40% chance/an |

### 3.3 Helper `ev()` (data.js)
```javascript
function ev(stage, id, title, text, choices, meta) {
  EVENTS.push({ id, stage, title, text, choices, ...meta, weight: meta.weight||1 });
}
```

---

## 4. Boucle de Jeu Principale

### 4.1 Actions par An (`STAGE_SLOTS`)
| Stage | Âge | Slots |
|-------|-----|-------|
| bebe | 0-2 | 1 |
| enfance | 3-11 | 1 |
| ado | 12-17 | 2 |
| jeune | 18-29 | 3 |
| adulte | 30-49 | 3 |
| maturite | 50-64 | 2 |
| retraite | 65-79 | 2 |
| vieillesse | 80+ | 1 |

### 4.2 `nextAction()` → `chooseEventForAction()`
**Ordre de priorité :**
1. **Milestone** (âge 18, 66) — forcé
2. **Opportunité** (destin extraordinaire) — si `pendingOpp`
3. **Aléatoire 25%** — `rollRandomEvent()` (type="aleatoire", pondéré)
4. **Crise** — `crisisEvent()` (type="crise", `crisisCond` + cooldown 3 ans)
5. **Événement de stage** — `pickEvent()` (filtre stage + `baseFilters` + anti-répétition)
6. **Générique** — `genericEvent()` (type="vie", once:false, fallback)

### 4.3 `advanceYear()`
1. `state.age++`, `state.year++`, `state.slot=0`
2. Vérifie milestones d'âge exact
3. `worldTick()` — événement monde
4. `applyAnnualFinances()` — revenus/charges
5. `checkOpportunity()` — destins
6. **Business events** (si carrière entreprise level≥2, 30% chance) → `findBusinessEvent()`
7. Dérive relation amour (18% chance, biais compatibilité)
8. Gestion endettement critique (< -30 k€)
9. `renderAll()` + `showYearChange()` (overlay + récap 6 derniers titres)

---

## 5. Système de Finances

### 5.1 `computeFinances()` → `{income, expenses, balance}`
**Revenus :**
- Salaire carrière × `econMult` × `productivity()` × `worldMods.incomeMult`
- **Investissements** :
  - Actions : `stocks × (5% ± 7.5%) × econMult`
  - Immobilier : `realEstate × 3% × econMult`
  - Entreprise : `business × (8% ± 10%) × econMult`

**Charges :**
- `HOUSING[housing].cost` (0 si "parents")
- Base vie : 8 k€ (sauf "parents" = 0)
- Enfants : 5 k€/enfant/an
- Inflation : `× (1 + inflation/100)`
- Modificateurs monde : `+ worldMods.expenses`
- Santé < 40 : +3 k€
- Richesse > 150 k€ : +5% (impôts/lifestyle)

**Plafonds :** `money` clamp [-30, 600] ; `argent` stat = `clamp(40 + money/3, 5, 100)`

### 5.2 `applyAnnualFinances()`
`state.money += balance` + clamp + `syncArgent()`

### 5.3 `productivity()`
Basé on seuils cachés `bonheur` & `energie` :
```
bonheur≥70 & energie≥60 → 1.15
bonheur≥50 & energie≥40 → 1.05
bonheur<30 | energie<20 → 0.85
sinon → 1.0
```

---

## 6. Système de Carrière

### 6.1 `CAREER_TRACKS` (data.js)
```javascript
CAREER_TRACKS = {
  etudes: { name: "Études supérieures", levels: [
    {name:"Étudiant", minAge:18, salary:[0,5], req:{intelligence:30}},
    {name:"Master/Doctorat", minAge:22, salary:[0,8], req:{intelligence:50}},
    {name:"Chercheur junior", minAge:25, salary:[18,30], req:{intelligence:70}},
    {name:"Chercheur confirmé", minAge:30, salary:[30,50], req:{intelligence:80}},
    {name:"Directeur de recherche", minAge:40, salary:[50,80], req:{intelligence:90}}
  ]},
  travail: { name: "Salariat", levels: [
    {name:"Employé", minAge:18, salary:[14,22], req:{}},
    {name:"Cadre junior", minAge:24, salary:[24,38], req:{intelligence:40}},
    {name:"Cadre confirmé", minAge:30, salary:[38,55], req:{intelligence:55}},
    {name:"Directeur", minAge:40, salary:[55,90], req:{intelligence:65, social:50}},
    {name:"PDG / Dirigeant", minAge:50, salary:[90,150], req:{intelligence:75, social:70}}
  ]},
  entreprise: { name: "Entrepreneuriat", levels: [
    {name:"Auto-entrepreneur", minAge:18, salary:[8,20], req:{argent:30}},
    {name:"Petit patron", minAge:24, salary:[16,34], req:{argent:50}},
    {name:"Entrepreneur établi", minAge:30, salary:[34,60], req:{argent:80}},
    {name:"Dirigeant de PME", minAge:40, salary:[60,110], req:{argent:120, social:50}},
    {name:"Tête de groupe", minAge:50, salary:[110,200], req:{argent:200, social:70}}
  ]}
}
```

### 6.2 Fonctions Clés
- `careerLevel(state)` → objet niveau courant
- `careerIncome(state)` → salaire de base (moyenne fourchette)
- `careerNext(state)` → niveau suivant ou null
- `careerCanAdvance(state)` → bool (âge + stats requises)
- `setCareer(trackId)` → initialise `state.career`
- `retire: true` → `state.career = null`

### 6.3 Avancement
- `careerAdvance: true` → +1 niveau si `careerCanAdvance`
- `careerBoost: true` → +1 niveau forcé (formation)
- Événements `business_mgmt` annuels pour level≥2

---

## 7. Système de Relations

### 7.1 Structure Relation
```javascript
{ name, type: "amour|ami|enfant|parent|fratrie", bond: 0-100, compat: 0-100, sinceAge }
```

### 7.2 Création Famille Initiale (`createFamily()`)
- Père : `bond=62`, nom aléatoire
- Mère : `bond=68`, nom aléatoire
- 0-3 frères/sœurs : `bond=45-65`, rôle "Aîné/Cadet/Milieu"

### 7.3 `applyRelation(effet)`
```javascript
{ type: "amour", create: true, delta: 20 }
```
- Si `create` et n'existe pas → nouvelle relation `bond=delta`, `compat=40-80`
- Si existe → `bond += delta` (clamp 0-100)
- Si `bond ≤ 0` → suppression + histoire "Rupture"

### 7.4 `findRelation(type)` → premier match
### 7.5 `relationStatus(rel)` → label "Proche / Distant / Rompu" + emoji

### 7.6 Dérive Annuelle (amour seulement)
- 18% chance/an
- Biais : `P(+3) = 0.5 + (compat-55)/150` sinon -2

---

## 8. Origines & Traits (Création)

### 8.1 `TRAITS` (9)
| Trait | Effets Stats | Description |
|-------|--------------|-------------|
| equilibre | +5 tous | Polyvalent |
| intellectuel | +15 int, -5 soc | Cerveau avant tout |
| social | +15 soc, -5 int | Cœur avant tout |
| sportif | +15 san, +10 en, -5 int | Corps sain |
| artiste | +15 bon, +5 soc, -5 arg | Sensible |
| **reveur** | +10 bon, +5 int, -5 arg | Tête dans les nuages |
| **travailleur** | +10 arg, +5 en, -5 bon | Acharné |
| **rebelle** | +10 soc, +5 en, -5 arg | Contre-courant |
| **diplomate** | +10 soc, +5 int, -5 en | Médiateur |
| **passionne** | +5 toutes passions | Flamme intérieure |

### 8.2 `ORIGINS` (12)
| Origine | Flag | Money | Stats | Passions | Tagline |
|---------|------|-------|-------|----------|---------|
| populaire | famille_populaire | 0 | san+5, en+5 | - | "Des racines solides, peu de filets" |
| aisee | famille_aisee | 25 | arg+5, bon+5 | - | "Confort sans excès, éducation soignée" |
| heritage | famille_heritage | 80 | arg+10 | peinture:1 | "Un nom, un domaine, une dette d'honneur" |
| pouvoir | famille_pouvoir | 60 | soc+10, int+5 | - | "Le pouvoir se murmure à l'oreille" |
| artistique | famille_artistique | 15 | bon+10, soc+5 | musique:1, peinture:1 | "La beauté avant le compte en banque" |
| sportive | famille_sportive | 20 | san+10, en+10 | sport:2 | "L'effort comme seule noblesse" |
| academique | famille_academique | 30 | int+15 | ecriture:1, technologie:1 | "Le savoir est le vrai patrimoine" |
| migrante | famille_migrante | 5 | en+10, bon+5 | cuisine:1 | "Deux pays en soi, la force du déracinement" |
| prestigieuse | famille_prestigieuse | 100 | soc+15, arg+10 | - | "Les portes s'ouvrent avant qu'on ne frappe" |
| commercante | famille_commercante | 40 | arg+10, soc+5 | - | "Le sens du négoce dans le sang" |
| agricole | famille_agricole | 10 | san+10, en+5 | nature:1 | "La terre ne ment jamais" |
| eclatee | famille_eclatee | -10 | bon-5, soc-5 | - | "Reconstruire là où d'autres ont tout cassé" |

### 8.3 Application à la Création (`startGame`)
1. Stats de base + trait.effects + origin.effects (clamp 0-100)
2. `money = origin.money` (clamp 600)
3. Passions d'origine → `state.passions`
4. Flag d'origine → `state.flags`
5. `createFamily()` + `state.surname`

---

## 9. Destins Extraordinaires (OPPORTUNITIES)

| Destin | Âges | Conditions | Chemin |
|--------|------|------------|--------|
| Artiste reconnu | 24-40 | passion≥4 (peinture/musique/écriture) + social≥50 + bonheur≥45 | "L'œuvre" |
| Grand explorateur | 25-55 | energie≥75 + sante≥70 + nature≥3 + argent≥40 | "L'horizon" |
| **Voix politique** | 32-52 | **associatif + social≥85 + intelligence≥75 + (career.level≥2 OU famille_pouvoir)** | "L'agora" |
| Célébrité | 22-35 | (théâtre≥4 OU musique≥4) + social≥60 | "La scène" |
| Mécène | 35-60 | argent≥88 + social≥60 + money≥220 | "Le don" |
| Génie du domaine | 30-55 | social≥50 + passion≥4 + intelligence≥80 | "La découverte" |

**Mécanique** : `checkOpportunity()` annuel → si `cond(state)` && `Math.random()<0.10` → `pendingOpp` → affiché au prochain tour via `opportunityEvent()`. Une fois proposée (`usedOpp`), plus jamais.

---

## 10. Monde Parallèle

### 10.1 États Économiques
| État | Mult Revenus | Description |
|------|-------------|-------------|
| boom | 1.15 | Expansion |
| normal | 1.0 | Stable |
| recession | 0.85 | Ralentissement |
| crisis | 0.7 | Crise |

### 10.2 `worldTick()` (annuel)
- Évolution économie (Markov)
- 40% chance : événement `WORLD_EVENTS` (pondéré, once)
- Applique `incomeMult`, `expenses`, ajoute à `worldMods` + histoire

---

## 11. Thèmes Visuels & Rendu

### 11.1 `THEMES` (data.js)
```javascript
{ vie:{label:"Vie",icon:"📖"}, carriere:"💼", relation:"🤝", aleatoire:"🎲",
  crise:"⚡", passion:"🔥", sante:"🩺", famille:"👨‍👩‍👧‍👦",
  argent:"💰", social:"🎉", societe:"🌍", business_mgmt:"🏢" }
```

### 11.2 `themeOf(event)` → détermine thème
- Explicite `event.theme` sinon mapping par `event.type`
- Appliqué via `data-theme` sur `.story-card` + icône dans `#story-stage`

### 11.3 CSS Thèmes
```css
.story-card[data-theme="famille"] { border-color: var(--rose); }
.story-stage[data-theme="famille"] { background: linear-gradient(...rose...); }
```

---

## 12. Fonctions Clés (game.js) — Référence Rapide

| Fonction | Rôle |
|----------|------|
| `startGame(name,trait,origin)` | Initialise `state`, lance partie |
| `createFamily()` | Génère parents + fratrie |
| `pickEvent()` | Événement de stage principal (filtres + anti-répétition) |
| `rollRandomEvent()` | Événement aléatoire pondéré |
| `crisisEvent()` | Crise stat-critique (cooldown 3 ans) |
| `genericEvent()` | Fallback répétable |
| `checkOpportunity()` | Test destins extraordinaires |
| `chooseEventForAction()` | Orchestrateur priorité événements |
| `playEvent(event)` | Affiche carte, build choix, `recentEvents.push()` |
| `resolveChoice(event,choice,idx)` | Applique effets, flags, relations, logement, passion, carrière |
| `applyEffects(fx,opts)` | Applique deltas stats/argent/investissements |
| `applyRelation(rel)` | Crée/modifie/supprime relation |
| `computeFinances()` | Calcule revenus/charges/solde |
| `applyAnnualFinances()` | Applique solde à `money` |
| `advanceYear()` | Incrémente âge, monde, finances, opportunités, business, dérive |
| `showYearChange()` | Overlay animation + récap |
| `renderAll()` | `renderStats` + `renderFinances` + `renderFamily` + `renderCareer` + `renderPassions` + `renderTimeline` |
| `endGame(reason)` | Écran fin, titre vie, épitaphe, stats, carrière, entourage, synopsis |
| `lifeTitle(state)` | Génère titre selon stats/flags/destin |
| `setMemory/getMemory/hasMemory` | Mémoire narrative long-terme |
| `wasRecent(eid)` | Anti-répétition (12 derniers) |

---

## 13. Mémoire Narrative & Cohérence

### 13.1 Variables Globales (module scope)
```javascript
var recentEvents = [];      // IDs derniers 12 événements joués
var narrativeMemory = {};   // Clé → valeur (flags, choix marquants)
```

### 13.2 Utilisation dans Événements
- `requiresFlag` / `notFlag` — gates événements
- `requiresFamily` — events spécifiques à l'origine
- `requiresPassion` — events passion
- `requiresCareerLevel` — business_mgmt
- `notRelation` — évite doublons (ex: nouvelle rencontre si déjà en couple)
- `setMemory("clé", valeur)` dans `resolveChoice` via flag ou effet custom
- `getMemory("clé")` dans `crisisCond` ou `baseFilters` pour conséquences différées

### 13.3 Exemples de Chaînes Causales
- Origine `famille_pouvoir` → flag → `retour_racines` (adulte) → `crise_sens` (maturité) → `héritage_invisible` (retraite)
- Choix "Investir en bourse" → flag `investisseur` → `investir_bourse` (adulte) → `gestion_patrimoine` (retraite)
- Carrière `entreprise` level≥2 → `entreprise_developpement` → `entreprise_strategie` → `rachat_concurrent` → `biz_*` annuels

---

## 14. Comment Modifier / Étendre

### 14.1 Ajouter un Événement
```javascript
// Dans data.js, avant MILESTONES
ev("adulte", "mon_evenement", "Titre", "Texte narratif",
  [
    { text: "Choix A", effects: { bonheur: 10 }, result: "Résultat A" },
    { text: "Choix B", effects: { argent: [5,20] }, chance: 0.6,
      goodEffects: { intelligence: 5 }, goodResult: "Réussi",
      badEffects: { bonheur: -5 }, badResult: "Échoué" }
  ],
  { type: "vie", once: false, weight: 2, requiresFlag: "mon_flag" }
);
```

### 14.2 Ajouter un Type d'Effet Custom
Dans `applyEffects()` (game.js), ajouter un `if (k === "mon_effet") { ... continue; }`

### 14.3 Ajouter une Carrière
Dans `CAREER_TRACKS` (data.js) : même structure, niveaux avec `minAge`, `salary:[min,max]`, `req:{stat:val}`

### 14.4 Ajouter un Destin (Opportunité)
Dans `OPPORTUNITIES` (data.js) :
```javascript
{ id: "mon_destin", path: "Nom affiché", ageMin: 30, ageMax: 55,
  cond: function(s){ return s.stats.intelligence>80 && s.flags.includes("mon_flag"); },
  intro: "Texte d'intro", choices: [ {text:"Accepter", effects:{...}, result:"..."} ] }
```

### 14.5 Ajouter un Thème Visuel
1. `THEMES` dans data.js : `{mon_theme:{label:"...",icon:"🎯"}}`
2. CSS : `.story-card[data-theme="mon_theme"]`, `.story-stage[data-theme="mon_theme"]`
3. `themeOf()` mapping ou `theme:"mon_theme"` dans l'événement

### 14.6 Modifier l'Économie
- `ECONOMY_STATES` multiplicateurs
- `computeFinances()` formules revenus/charges
- `productivity()` seuils bonheur/énergie

### 14.7 Ajouter un Event Mondial
Dans `WORLD_EVENTS` (data.js) : `{id, title, text, weight, minAge, once, incomeMult, expenses, effects}`

---

## 15. Points d'Attention / Bugs Connus

1. **`courage` dans effets** : Certains événements historiques ont `effects: { courage: 8 }` — ignoré silencieusement (pas dans `STAT_KEYS`)
2. **`once: false` par défaut** : Si absent, événement ne se joue qu'une fois. Bien mettre `once: false` pour répétables.
3. **`careerBoost` vs `careerAdvance`** : Boost = forcé, Advance = si éligible
4. **Anti-répétition** : `recentEvents` max 12 ≈ 3-4 ans. Ajustable ligne `if (recentEvents.length > 12)`
5. **Dette plancher -30** : `advanceYear` remet +8/an si < -30
6. **Smoke test** : `C:\Users\alexa\AppData\Local\Temp\opencode\smoke_game_v04.js` (200 vies, stub DOM)
7. **Sim headless** : `C:\Users\alexa\AppData\Local\Temp\opencode\sim_v03.js` (3000+ vies, stats agrégées)

---

## 16. Commandes de Test
```bash
# Vérification syntaxe
node --check vie-game/data.js
node --check vie-game/game.js

# Simulation headless (3000 vies)
node "C:\Users\alexa\AppData\Local\Temp\opencode\sim_v03.js" 3000

# Smoke test vrai game.js (stub DOM, 200 vies)
node "C:\Users\alexa\AppData\Local\Temp\opencode\smoke_game_v04.js"

# Lancer dans navigateur
Start-Process "C:\Users\alexa\Documents\Default Project\vie-game\index.html"
```

---

## 17. Flux de Données Résumé

```
startGame()
  → state init + trait + origin + createFamily()
  → show("screen-game") + renderAll()

Boucle action (nextAction → chooseEventForAction → playEvent)
  → pickEvent / rollRandomEvent / crisisEvent / genericEvent / opportunityEvent
  → playEvent() → recentEvents.push() + renderAll()

Choix joueur (resolveChoice)
  → applyEffects() → stats/argent/investissements
  → applyRelation() → relations
  → flag/unflag/passion/housing/career/retire/advance/boost
  → setMemory() si flag custom
  → nextAction()

Fin d'année (advanceYear)
  → worldTick() + applyAnnualFinances() + checkOpportunity()
  → business events (entrepreneur level≥2)
  → relation drift (amour)
  → showYearChange() (overlay + récap)

Fin de vie (endGame)
  → lifeTitle() + ENDINGS[reason] + stats + carrière/investissements + entourage + synopsis
```

---

*Document généré pour la version 0.4 — Tous systèmes validés par simulation (3000 vies) et smoke test (200 vies complètes).*