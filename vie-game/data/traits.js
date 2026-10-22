/* ============================================================
   UNE VIE v0.5 — TRAITS & PERSONNALITÉ
   Big Five + 40 traits discrets avec effets mécaniques
   ============================================================ */

var TRAITS_DEFINITIONS = {
  // ── BIG FIVE DIMENSIONS ─────────────────────────────────
  dimensions: {
    O: { key: "O", name: "Ouverture",     low: "Routinier",     high: "Curieux/Créatif" },
    C: { key: "C", name: "Conscience",    low: "Spontané",      high: "Organisé/Persévérant" },
    E: { key: "E", name: "Extraversion",  low: "Réservé",       high: "Sociable/Énergique" },
    A: { key: "A", name: "Agréabilité",   low: "Compétitif",    high: "Empathique/Conciliant" },
    N: { key: "N", name: "Névrosisme",    low: "Stable/Calme",  high: "Anxieux/Irritable" }
  },

  // ── ARCHÉTYPES DE DÉPART (remplacent anciens TRAITS) ───────
  // Chaque archétype biaise les tirages Big Five + donne 1 trait discret garanti
  archetypes: [
    { id: "equilibre",     name: "Équilibré",     desc: "Aucun biais marqué, adaptable.",     bias: {},                    trait: null },
    { id: "intellectuel",  name: "Intellectuel",  desc: "Curieux, analytique.",               bias: { O: +15, C: +5 },     trait: "curieux" },
    { id: "social",        name: "Social",        desc: "Extraverti, chaleureux.",            bias: { E: +15, A: +5 },     trait: "bavard" },
    { id: "sportif",       name: "Sportif",       desc: "Énergique, endurant.",               bias: { C: +10, E: +5, N: -10 }, trait: "travailleur" },
    { id: "artiste",       name: "Artiste",       desc: "Créatif, sensible.",                 bias: { O: +15, N: +5 },     trait: "creatif" },
    { id: "reveur",        name: "Rêveur",        desc: "Imaginatif, tête dans les étoiles.", bias: { O: +10, C: -5, N: +5 }, trait: "nostalgique" },
    { id: "travailleur",   name: "Travailleur",   desc: "Consciencieux, persévérant.",         bias: { C: +15, N: -5 },     trait: "perfectionniste" },
    { id: "rebelle",       name: "Rebelle",       desc: "Indépendant, impulsif.",             bias: { A: -10, E: +5, N: +5 }, trait: "impulsif" },
    { id: "diplomate",     name: "Diplomate",     desc: "Conciliant, empathique.",            bias: { A: +15, C: +5 },     trait: "loyal" },
    { id: "passionne",     name: "Passionné",     desc: "Intense, tout ou rien.",             bias: { E: +10, N: +10 },    trait: "romantique" }
  ],

  // ── TRAITS DISCRETS (étiquettes) ────────────────────────
  // Chaque trait a : description, effets mécaniques (modificateurs), compatibilité
  discreteTraits: {
    // --- Sociaux / Relationnels ---
    loyal:         { desc: "Fidèle en amitié comme en amour.",  effects: { relationErosion: -0.5, confianceGain: +10 }, compat: { A: +10 } },
    jaloux:        { desc: "Possessif, craint la perte.",       effects: { tensionGain: +15, suspicionGain: +10 }, compat: { A: -15, N: +15 } },
    charmeur:      { desc: "Sait séduire sans effort.",         effects: { attractionBonus: +15, socialBonus: +5 }, compat: { E: +10, A: -5 } },
    romantique:    { desc: "Croit au grand amour.",             effects: { affectionGain: +10, ruptureMalus: -10 }, compat: { A: +10, N: +5 } },
    volage:        { desc: "Difficile de s'engager.",           effects: { exclusiviteMalus: -20, ruptureFacile: true }, compat: { A: -15, E: +5 } },
    protecteur:    { desc: "Veille sur les siens.",             effects: { familleBonus: +10, stressProcheMalus: -5 }, compat: { A: +10, C: +5 } },
    possessif:     { desc: "Veut tout contrôler.",              effects: { tensionGain: +10, liberteMalus: -10 }, compat: { A: -15, N: +10 } },
    altruiste:     { desc: "Donne sans compter.",               effects: { generositeBonus: +15, argentMalus: -5 }, compat: { A: +15, C: -5 } },
    manipulateur:  { desc: "Utilise les autres.",               effects: { confianceMalus: -15, relationGain: +5 }, compat: { A: -20, C: +5 } },
    bavard:        { desc: "Parle beaucoup, écoute peu.",       effects: { connaissanceGain: +5, secretRisque: +10 }, compat: { E: +10, A: -5 } },
    timide:        { desc: "Difficile d'aborder les autres.",   effects: { rencontreMalus: -15, socialMalus: -5 }, compat: { E: -15, N: +5 } },
    solitaire:     { desc: "Préfère sa propre compagnie.",      effects: { capaciteSocialeMalus: -2, stressSocialMalus: -5 }, compat: { E: -15, A: -5 } },
    drole:         { desc: "L'humour comme armure.",            effects: { tensionReduction: -10, socialBonus: +5 }, compat: { E: +5, N: -5 } },
    cynique:       { desc: "Attend le pire des gens.",          effects: { confianceMalus: -10, deceptionReduction: -5 }, compat: { A: -10, N: +5 } },
    independant:   { desc: "Refuse la dépendance.",             effects: { coupleMalus: -10, autonomieBonus: +10 }, compat: { A: -5, C: +5 } },
    rancunier:     { desc: "N'oublie jamais une offense.",      effects: { tensionPersist: true, pardonMalus: -20 }, compat: { A: -15, N: +10 } },

    // --- Travail / Ambition ---
    ambitieux:     { desc: "Vise haut, toujours plus.",         effects: { promotionBonus: +15, stressGain: +5 }, compat: { C: +10, E: +5 } },
    travailleur:   { desc: "L'effort ne lui fait pas peur.",    effects: { competenceGain: +10, energieMalus: -5 }, compat: { C: +15, N: -5 } },
    perfectionniste:{ desc: "Rien n'est jamais assez bien.",    effects: { qualiteBonus: +10, stressGain: +10, delaiMalus: +5 }, compat: { C: +15, N: +10 } },
    paresseux:     { desc: "Fait le minimum syndical.",         effects: { competenceMalus: -10, energieBonus: +5 }, compat: { C: -15, N: -5 } },
    rigide:        { desc: "Suit les règles à la lettre.",      effects: { managementBonus: +5, creativiteMalus: -10 }, compat: { C: +10, O: -10 } },
    calculateur:   { desc: "Pèse le pour et le contre.",        effects: { risqueMalus: -15, gainFinancierBonus: +10 }, compat: { C: +10, A: -5 } },
    entrepreneurs: { desc: "Crée ses propres opportunités.",    effects: { entrepriseBonus: +15, risqueTolere: +10 }, compat: { O: +10, C: +5, E: +5 } },

    // --- Personnalité / Tempérament ---
    impulsif:      { desc: "Agit avant de réfléchir.",          effects: { decisionRapide: true, regretRisque: +15 }, compat: { C: -15, E: +5, N: +5 } },
    têtu:          { desc: "Ne change pas d'avis.",             effects: { opinionFixee: true, conflitGain: +10 }, compat: { A: -10, C: +5 } },
    curieux:       { desc: "Veut tout comprendre.",             effects: { apprentissageBonus: +10, distractionGain: +5 }, compat: { O: +15, C: -5 } },
    nostalgique:   { desc: "Vit dans le passé.",                effects: { regretGain: +5, bonheurPasseBonus: +5 }, compat: { O: -5, N: +5 } },
    optimiste:     { desc: "Voit le bon côté.",                 effects: { bonheurBonus: +5, stressMalus: -10 }, compat: { N: -15, E: +5 } },
    pessimiste:    { desc: "Attend le pire.",                   effects: { stressGain: +10, surpriseMalus: -5 }, compat: { N: +15, A: -5 } },
    aventurier:    { desc: "Cherche l'inconnu.",                effects: { voyageBonus: +15, securiteMalus: -10 }, compat: { O: +10, E: +10, N: -5 } },
    casanier:      { desc: "Aime son chez-soi.",                effects: { socialMalus: -5, economieBonus: +5 }, compat: { E: -10, C: +5 } },
    fêtard:        { desc: "La nuit lui appartient.",           effects: { socialBonus: +10, santeMalus: -5, argentMalus: -5 }, compat: { E: +15, C: -10, N: -5 } },
    dépensier:     { desc: "L'argent file entre les doigts.",   effects: { argentMalus: -15, bonheurCourtBonus: +5 }, compat: { C: -10, E: +5 } },
    radin:         { desc: "Compte chaque centime.",            effects: { epargneBonus: +10, generositeMalus: -15 }, compat: { C: +10, A: -10 } },
    joueur:        { desc: "Mise sur le hasard.",               effects: { risqueBonus: +20, perteRisque: +20 }, compat: { C: -10, N: +5 } },

    // --- Vertus / Défauts moraux ---
    menteur:       { desc: "La vérité est flexible.",           effects: { secretGain: +10, confianceMalus: -15 }, compat: { A: -15, C: -5 } },
    courageux:     { desc: "Affronte ses peurs.",               effects: { risqueMalus: -10, stressMalus: -10 }, compat: { N: -10, C: +5 } },
    orgueilleux:   { desc: "Ne demande jamais d'aide.",         effects: { aideMalus: -20, autonomieBonus: +10 }, compat: { A: -10, N: +5 } },
    anxieux:       { desc: "L'inquiétude est constante.",       effects: { stressGain: +15, prevoyanceBonus: +5 }, compat: { N: +20, C: +5 } },
    créatif:       { desc: "L'imagination au pouvoir.",         effects: { passionBonus: +10, organisationMalus: -5 }, compat: { O: +15, C: -5 } }
  },

  // ── VALEURS ET PROJETS DE VIE ───────────────────────────
  values: {
    keys: ["famille", "carriere", "aventure", "argent", "fidelite", "creativite", "stabilite", "spiritualite"],
    labels: {
      famille: "Famille", carriere: "Carrière", aventure: "Aventure",
      argent: "Argent", fidelite: "Fidélité", creativite: "Créativité",
      stabilite: "Stabilité", spiritualite: "Spiritualité"
    },
    desirEnfants: { keys: ["veut", "ne_veut_pas", "indecis"], labels: { veut: "Veut des enfants", ne_veut_pas: "Ne veut pas d'enfants", indecis: "Indécis" } }
  }
};

// Helpers
function getTrait(traitId) {
  return TRAITS_DEFINITIONS.discreteTraits[traitId];
}

function getArchetype(id) {
  return TRAITS_DEFINITIONS.archetypes.find(function (a) { return a.id === id; });
}

function getAllDiscreteTraits() {
  return Object.keys(TRAITS_DEFINITIONS.discreteTraits);
}

window.VIE = window.VIE || {};
window.VIE.data = window.VIE.data || {};
window.VIE.data.traits = TRAITS_DEFINITIONS;
window.VIE.getTrait = getTrait;
window.VIE.getArchetype = getArchetype;
window.VIE.getAllDiscreteTraits = getAllDiscreteTraits;