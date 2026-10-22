/* ============================================================
   UNE VIE v0.5 — CONFIG ÉVÉNEMENTS : COOLDOWNS, POIDS, ANTI-RÉPÉTITION
   ============================================================ */

var EVENTS_CONFIG = {
  // ── ANTI-RÉPÉTITION ──────────────────────────────────────
  // Taille mémoire événements récents (en nombre d'événements)
  recentMemorySize: 30,

  // Cooldowns par catégorie (années minimum entre 2 événements même catégorie)
  categoryCooldowns: {
    rupture: 3,
    deuil: 2,
    argent: 2,
    sante: 2,
    promotion: 3,
    grossesse: 2,
    demenagement: 3,
    licenciement: 3,
    accident: 2,
    heritage: 5,
    mariage: 3,
    naissance: 2,
    dispute: 2,
    reconciliation: 2,
    infidelite: 3,
    infidelite: 15,
    divorce: 10,
    amitie: 2,
    secret_revele: 3
  },

  // ── POIDS DYNAMIQUES ─────────────────────────────────────
  // Multiplicateurs selon traits joueur (appliqués au weight de base)
  dynamicWeights: {
    fêtard:       { soiree: 2.0, rencontre: 1.5, evenement_social: 1.3 },
    casanier:     { soiree: 0.3,  lecture: 1.5, maison: 1.3, evenement_social: 0.5 },
    anxieux:      { sante: 1.5,   drame: 1.3, stress: 1.4, evenement_negatif: 1.2 },
    ambitieux:    { carriere: 1.5, promotion: 1.4, formation: 1.3, evenement_pro: 1.2 },
    solitaire:    { rencontre: 1.5, amitie: 1.3, evenement_social: 0.6 },
    joueur:       { argent: 1.5,  jeu: 2.0, risque: 1.5, evenement_financier: 1.3 },
    depensier:    { argent: 1.3,  achat: 1.5, evenement_financier: 1.2 },
    altruiste:    { humanitaire: 1.5, aide: 1.4, evenement_social: 1.2 },
    ambitieux:    { carriere: 1.5, promotion: 1.4 },
    romantique:   { amour: 1.5, rencontre: 1.3, evenement_relationnel: 1.2 },
    volage:       { infidelite: 2.0, rencontre: 1.3, evenement_relationnel: 1.1 },
    protecteur:   { famille: 1.3, aide: 1.2, evenement_famille: 1.2 },
    curieux:      { apprentissage: 1.4, evenement_decouverte: 1.3 },
    impulsif:     { risque: 1.5, decision_rapide: 1.3, evenement_imprevu: 1.2 },
    perfectionniste: { travail: 1.3, rigueur: 1.2, evenement_pro: 1.1 },
    nostalgique:  { retour_passe: 1.5, souvenir: 1.3, evenement_memoire: 1.2 }
  },

  // ── POIDS DE BASE PAR TYPE ───────────────────────────────
  baseWeights: {
    vie: 10,
    carriere: 8,
    relation: 8,
    passion: 5,
    sante: 6,
    famille: 7,
    argent: 7,
    social: 6,
    societe: 5,
    aleatoire: 4,
    crise: 3,
    business_mgmt: 4,
    passif: 1
  },

  // ── ÉVÉNEMENTS PASSIFS (sans choix) ──────────────────────
  passiveEvents: {
    // Probabilité de base par an (sera multipliée par age factor)
    baseChancePerYear: 0.4,
    // Types d'événements passifs possibles
    types: [
      "rencontre_fortuite", "appel_ancien_ami", "voisin_demenage",
      "deces_lointain", "naissance_famille", "coup_chance",
      "accident_benin", "rumeur", "invitation_mariage",
      "maladie_parent", "message_ex", "crise_economique",
      "panne_voiture", "heritage_inattendu", "evenement_monde"
    ]
  },

  // ── BIND (liaison aux personnes) ────────────────────────
  // Configuration pour bind: { p1: { role, minAffection, trait, ... } }
  bindDefaults: {
    maxCandidates: 5,           // max personnes candidates à tester
    fallbackToGeneric: true,    // si pas de match, événement devient générique
    requireLiving: true         // seulement personnes vivantes
  },

  // ── RÉPARTITION CIBLE DES NOUVEAUX ÉVÉNEMENTS ────────────
  // Pour guider l'écriture (600+ total)
  targetDistribution: {
    amour_couple_rupture: 120,
    amitie: 80,
    famille_parents_fratrie_enfants: 80,
    vie_sociale_fete_vices: 70,
    etudes_carriere: 70,
    sante_mental: 50,
    argent_logement: 40,
    passifs_hasard: 40,
    monde_epoque: 30,
    business_mgmt: 20
  },

  // ── VALIDATION SCHÉMA (pour lint_events.js) ──────────────
  requiredFields: ["id", "stage", "title", "text", "choices"],
  choiceRequiredFields: ["text"],
  knownEffectKeys: [
    "sante", "energie", "argent", "intelligence", "social", "bonheur",
    "stress", "apparence", "reputation", "confiance",
    "invest_stocks", "invest_realestate", "invest_business"
  ],
  knownMetaKeys: [
    "type", "once", "weight", "requiresRelation", "notRelation",
    "requiresPassion", "requiresFlag", "notFlag", "requiresFamily",
    "requiresCareer", "requiresCareerLevel", "crisisCond",
    "theme", "bind", "passive", "category"
  ]
};

window.VIE = window.VIE || {};
window.VIE.data = window.VIE.data || {};
window.VIE.data.eventsConfig = EVENTS_CONFIG;