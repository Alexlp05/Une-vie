/* ============================================================
   UNE VIE v0.5 — CONFIGURATION CENTRALE D'ÉQUILIBRAGE
   Toutes les valeurs numériques du jeu vivent ici.
   ============================================================ */

var CONFIG = {
  // ── VERSION ──────────────────────────────────────────────
  version: "0.5.0",
  saveKey: "une_vie_save_v05",

  // ── RNG ──────────────────────────────────────────────────
  rng: {
    defaultSeed: null,           // null = aléatoire (Date.now)
    algorithm: "mulberry32"
  },

  // ── TEMPS & ÂGES ─────────────────────────────────────────
  time: {
    startYearMin: 1970,
    startYearMax: 2010,
    maxAge: 120,
    // Actions par an selon l'âge (remplace STAGE_SLOTS)
    actionsPerYear: [
      { ageMax: 2,   actions: 1 },
      { ageMax: 11,  actions: 1 },
      { ageMax: 14,  actions: 2 },
      { ageMax: 17,  actions: 3 },
      { ageMax: 24,  actions: 5 },  // pic jeunesse
      { ageMax: 30,  actions: 5 },  // pic jeune adulte
      { ageMax: 39,  actions: 3 },
      { ageMax: 49,  actions: 3 },
      { ageMax: 64,  actions: 2 },
      { ageMax: 79,  actions: 2 },
      { ageMax: 120, actions: 1 }
    ],
    // Probabilité d'événement passif par an (sans choix)
    passiveEventChance: [
      { ageMax: 11,  chance: 0.15 },
      { ageMax: 17,  chance: 0.35 },
      { ageMax: 24,  chance: 0.70 },  // 2-4/an
      { ageMax: 30,  chance: 0.65 },
      { ageMax: 49,  chance: 0.40 },
      { ageMax: 64,  chance: 0.30 },
      { ageMax: 120, chance: 0.20 }
    ]
  },

  // ── STATS JOUEUR ─────────────────────────────────────────
  stats: {
    keys: ["sante", "energie", "argent", "intelligence", "social", "bonheur", "stress", "apparence", "reputation", "confiance"],
    labels: {
      sante: "Santé", energie: "Énergie", argent: "Niveau de vie",
      intelligence: "Intelligence", social: "Social", bonheur: "Bonheur",
      stress: "Stress", apparence: "Apparence", reputation: "Réputation",
      confiance: "Confiance en soi"
    },
    min: 0, max: 100,
    // Décomposition du bonheur pour l'onglet "Moi"
    bonheurDomains: ["amour", "amis", "famille", "travail", "sante", "argent", "sens"],
    // Productivité (utilisée par finance.js)
    productivity: {
      high:    { bonheurMin: 70, energieMin: 60, mult: 1.15 },
      normal:  { bonheurMin: 50, energieMin: 40, mult: 1.05 },
      low:     { bonheurMax: 30, energieMax: 20, mult: 0.85 },
      base:    1.0
    }
  },

  // ── PERSONNALITÉ (BIG FIVE + TRAITS DISCRETS) ───────────
  personality: {
    dimensions: ["O", "C", "E", "A", "N"],
    labels: { O: "Ouverture", C: "Conscience", E: "Extraversion", A: "Agréabilité", N: "Névrosisme" },
    // Hérédité à la naissance
    heredity: { parentsWeight: 0.40, originWeight: 0.15, randomWeight: 0.45, randomSigma: 15 },
    // Plasticité selon l'âge (max delta par an par dimension)
    plasticity: [
      { ageMax: 25,  maxDelta: 3 },
      { ageMax: 50,  maxDelta: 2 },
      { ageMax: 120, maxDelta: 1 }
    ],
    // Maturation naturelle par an (si pas d'événement marquant)
    maturation: { C: +0.3, A: +0.2, N: -0.2 },
    // Trauma / événement marquant : delta max
    traumaMaxDelta: 10,
    // Traits discrets : max par personne
    maxTraits: 6,
    // Seuil d'acquisition par répétition (ex: 5 fois même comportement)
    traitAcquisitionThreshold: 5,
    // Introspection : âge où le joueur voit sa vraie personnalité
    introspection: { baseAge: 18, therapyBoost: 5, traumaBoost: 3 }
  },

  // ── VALEURS ET PROJETS DE VIE ───────────────────────────
  values: {
    keys: ["famille", "carriere", "aventure", "argent", "fidelite", "creativite", "stabilite", "spiritualite"],
    desirEnfants: ["veut", "ne_veut_pas", "indecis"]
  },

  // ── RELATIONS ────────────────────────────────────────────
  relations: {
    // Capacité sociale max (liens détaillés simultanés)
    baseSocialCapacity: 3,
    socialStatFactor: 0.04,      // +1 capacité par 25 social
    extraversionFactor: 0.5,     // +0.5 par point E (0-100)
    energyFactor: 0.02,          // +1 par 50 énergie
    timeCosts: { enfant: 0.8, travail: 0.5, vieillesse: 0.3 },
    maxDetailedPeople: 30,       // plafond simulation détaillée
    maxTotalPeople: 150,         // plafond génération
    // Érosion annuelle d'affection si pas de contact
    erosion: {
      base: 1.5,
      loyalReduction: 0.5,
      childhoodBondReduction: 0.3,
      distanceFactor: 1.5,
      busyFactor: 1.2
    },
    // Contact spontané PNJ → joueur
    spontaneousContactChance: 0.30,
    // Densification annuelle d'un lien, par type de relation
    linkGrowth: {
      famille: 3.0,
      enfant: 3.0,
      amour: 2.5,
      ami: 2.5,
      pro: 1.2
    },
    // Rencontres nouvelles : nombre maximal de nouvelles personnes par an
    // selon l'âge, et poids par type de relation
    encounters: {
      maxNewPerYear: 2,
      byAge: [
        { ageMax: 4,   chance: 0.15, types: { ami: 1, famille: 0.4 } },
        { ageMax: 11,  chance: 0.45, types: { ami: 1, pro: 0.1 } },
        { ageMax: 17,  chance: 0.55, types: { ami: 1, amour: 0.5, pro: 0.2 } },
        { ageMax: 24,  chance: 0.70, types: { ami: 1, amour: 1.0, pro: 0.8 } },
        { ageMax: 39,  chance: 0.60, types: { ami: 0.9, amour: 0.8, pro: 0.9 } },
        { ageMax: 59,  chance: 0.45, types: { ami: 0.8, amour: 0.4, pro: 0.7 } },
        { ageMax: 74,  chance: 0.35, types: { ami: 1, amour: 0.15, pro: 0.3 } },
        { ageMax: 120, chance: 0.25, types: { ami: 1, pro: 0.1 } }
      ]
    },
    // Tension seuil rupture
    tensionBreakupThreshold: 70,
    // Compatibilité : poids par type de relation
    compatibilityWeights: {
      amitie:   { O: 0.20, C: 0.10, E: 0.25, A: 0.25, N: 0.10, valeurs: 0.10 },
      amour:    { O: 0.10, C: 0.15, E: 0.10, A: 0.20, N: 0.20, valeurs: 0.25, desirEnfants: 0.15 },
      famille:  { O: 0.05, C: 0.10, E: 0.05, A: 0.30, N: 0.20, valeurs: 0.30 },
      pro:      { O: 0.15, C: 0.30, E: 0.15, A: 0.20, N: 0.10, valeurs: 0.10 }
    }
  },

  // ── FINANCES ─────────────────────────────────────────────
  finance: {
    // Monnaie interne : euros entiers (pas k€)
    currency: "EUR",
    // Inflation annuelle de base (pourcent)
    baseInflation: 1.5,
    // Coût de vie annuel de base selon l'âge (€)
    // L'enfance et l'adolescence sont prises en charge par la famille.
    baseLifeByAge: [
      { ageMax: 5,   cost: 0 },      // la famille prend en charge
      { ageMax: 17,  cost: 1200 },   // argent de poche, fournitures
      { ageMax: 24,  cost: 6500 },   // études, semi-indépendant
      { ageMax: 120, cost: 12500 }   // adulte autonome
    ],
    // Soutien familial mensuel versé à un mineur (€)
    familySupportPerMonth: 150,
    // Barème IRPP simplifié (tranches : [plafond, taux%])
    irppBrackets: [
      { max: 11294,  rate: 0 },
      { max: 28797,  rate: 0.11 },
      { max: 82341,  rate: 0.30 },
      { max: 177106, rate: 0.41 },
      { max: Infinity, rate: 0.45 }
    ],
    // Cotisations sociales (part salariale ~22%)
    socialContributionsRate: 0.22,
    // Foyer fiscal : parts (1 adulte = 1, enfant = 0.5)
    fiscalShares: { adulte: 1, enfant: 0.5 },
    // Allocations familiales mensuelles (€)
    allocations: { enfant: 140, handicap: 200 },
    // Aide au logement (APL) max mensuel
    aplMax: 300,
    // Chômage : % du salaire antérieur, durée max mois
    chômage: { taux: 0.57, dureeMax: 24, plancher: 900, plafond: 7500 },
    // Coût enfant par an selon âge (€)
    enfantCost: [
      { ageMax: 2,   cost: 6000 },  // garde, couches
      { ageMax: 5,   cost: 4500 },  // école maternelle
      { ageMax: 11,  cost: 3500 },  // primaire
      { ageMax: 17,  cost: 5000 },  // secondaire, activités
      { ageMax: 24,  cost: 8000 },  // études sup
      { ageMax: 120, cost: 2000 }   // aide occasionnelle
    ],
    // Logement
    housing: {
      colocation:       { loyer: 450,  charges: 80,  apportPct: 0 },
      location:         { loyer: 750,  charges: 120, apportPct: 0 },
      proprio_appart:   { prix: 180000, tauxDefaut: 0.035, duree: 20, apportMin: 0.10, charges: 200, taxeFonciere: 1200 },
      proprio_maison:   { prix: 280000, tauxDefaut: 0.035, duree: 20, apportMin: 0.10, charges: 300, taxeFonciere: 1800 },
      grande_maison:    { prix: 450000, tauxDefaut: 0.035, duree: 20, apportMin: 0.15, charges: 500, taxeFonciere: 3000 }
    },
    // Marchés financiers (rendements annuels moyens + volatilité)
    markets: {
      actions_etf:   { rendement: 0.07, volatilite: 0.15, correlationEconomie: 0.8 },
      crypto:        { rendement: 0.12, volatilite: 0.60, correlationEconomie: 0.3 },
      immobilier_loc:{ rendement: 0.04, volatilite: 0.08, correlationEconomie: 0.6 },
      entreprise:    { rendement: 0.09, volatilite: 0.25, correlationEconomie: 0.7 },
      livret:        { rendement: 0.03, volatilite: 0.00, correlationEconomie: 0.1 },
      assurance_vie: { rendement: 0.04, volatilite: 0.02, correlationEconomie: 0.4 },
      plan_retraite: { rendement: 0.05, volatilite: 0.05, correlationEconomie: 0.5 }
    },
    // Profil de risque selon personnalité
    riskProfile: {
      prudent:      { actions: 0.10, crypto: 0.00, immo: 0.30, entreprise: 0.05, livret: 0.35, av: 0.15, retraite: 0.05 },
      equilibre:    { actions: 0.30, crypto: 0.02, immo: 0.25, entreprise: 0.10, livret: 0.15, av: 0.13, retraite: 0.05 },
      dynamique:    { actions: 0.50, crypto: 0.05, immo: 0.15, entreprise: 0.15, livret: 0.05, av: 0.08, retraite: 0.02 },
      agressif:     { actions: 0.60, crypto: 0.15, immo: 0.10, entreprise: 0.10, livret: 0.00, av: 0.03, retraite: 0.02 }
    },
    // Retraite
    retraite: {
      ageLegal: 64,
      tauxRemplacement: 0.50,      // % dernier salaire
      plafondMensuel: 3500,
      dependanceEHPAD: 2500        // coût mensuel fin de vie
    },
    // Score crédit (0-100)
    creditScore: { base: 50, revenuFactor: 0.3, patrimoineFactor: 0.2, dettesFactor: -0.4 }
  },

  // ── CARRIÈRE & COMPÉTENCES ───────────────────────────────
  career: {
    // Diplômes
    diplomes: ["aucun", "brevet", "CAP_BEP", "bac", "bac+2_3", "bac+5", "doctorat"],
    // Compétences (0-100)
    competences: ["technique", "relationnel", "management", "creativite", "rigueur", "langues", "manuel", "physique"],
    // Progression compétence par an selon activité
    xpPerYear: { etudes: 8, travail: 5, formation: 10, projet: 7 },
    // Seuil promotion
    promotionThreshold: 70,
    // Reconnaissance
    reconnaissance: { base: 0.15, mentorBoost: 0.10, rivalMalus: -0.08 }
  },

  // ── SANTÉ & MORTALITÉ ────────────────────────────────────
  health: {
    // Mortalité Gompertz : q(age) = a * exp(b * age)
    // Calibré pour une espérance de vie e(0) = (1/b)*ln(1 + b/a)
    //   homme : ~81 ans, femme : ~84 ans (ordre de grandeur FR)
    gompertz: {
      homme: { a: 0.000047, b: 0.0925 },
      femme: { a: 0.000040, b: 0.0925 }
    },
    // Facteurs multiplicateurs mortalité
    mortalityFactors: {
      sante:      { 0: 5.0, 20: 3.0, 40: 1.5, 60: 1.0, 80: 0.8, 100: 0.6 },
      tabagisme:  1.8,
      alcoolFort: 1.5,
      obesite:    1.3,
      stressChronique: 1.4,
      depression: 1.3,
      activitePhysique: 0.85
    },
    // Accidents (bosses 15-30 ans)
    accidentRate: { age15_30: 0.0015, other: 0.0004 },
    // Santé mentale
    mentalHealth: {
      depressionThreshold: { N: 70, stress: 60, bonheur: 30 },
      burnoutThreshold:    { energie: 20, stress: 70, C: 30 },
      anxieteThreshold:    { N: 65, stress: 55 }
    }
  },

  // ── MONDE & ÉPOQUE ───────────────────────────────────────
  world: {
    // Économie
    economyStates: {
      boom:      { mult: 1.15, inflation: 2.0, weight: 10, label: "Expansion" },
      normal:    { mult: 1.00, inflation: 1.5, weight: 60, label: "Stable" },
      recession: { mult: 0.85, inflation: 2.5, weight: 20, label: "Ralentissement" },
      crisis:    { mult: 0.70, inflation: 4.0, weight: 10, label: "Crise" }
    },
    // Transition économie (probabilités)
    economyTransition: {
      boom:      { normal: 0.30 },
      normal:    { boom: 0.12, recession: 0.10 },
      recession: { normal: 0.35, crisis: 0.15 },
      crisis:    { recession: 0.40 }
    },
    // Événements réels ancrés (année → eventId)
    realEvents: {
      2001: "attentats_11sept",
      2008: "crise_financiere",
      2015: "attentats_paris",
      2020: "pandemie_covid",
      2022: "inflation_guerre_ukraine",
      2023: "greves_retraites"
    },
    // Époque technologique (change les possibilités)
    techEra: [
      { yearStart: 1990, yearEnd: 1999, label: "Pré-internet",    reseauxSociaux: false, appliRencontre: false, teletravail: false, ia: false },
      { yearStart: 2000, yearEnd: 2009, label: "Internet naissant", reseauxSociaux: false, appliRencontre: false, teletravail: false, ia: false },
      { yearStart: 2010, yearEnd: 2019, label: "Smartphone & RS",   reseauxSociaux: true,  appliRencontre: true,  teletravail: false, ia: false },
      { yearStart: 2020, yearEnd: 2029, label: "Post-Covid",        reseauxSociaux: true,  appliRencontre: true,  teletravail: true,  ia: false },
      { yearStart: 2030, yearEnd: 2099, label: "Ère IA",            reseauxSociaux: true,  appliRencontre: true,  teletravail: true,  ia: true }
    ]
  },

  // ── ÉPOQUES DU XXe SIÈCLE (contexte à la naissance) ───────────
  eraContext: {
    1970: { label: "1970", title: "Les années 70", desc: "Trente Glorieuses qui s'achèvent, premiers chocs pétroliers, naissance de l'informatique personnelle." },
    1971: { label: "1971", title: "Les années 70", desc: "Trente Glorieuses qui s'achèvent, premiers chocs pétroliers, naissance de l'informatique personnelle." },
    1972: { label: "1972", title: "Les années 70", desc: "Trente Glorieuses qui s'achèvent, premiers chocs pétroliers, naissance de l'informatique personnelle." },
    1973: { label: "1973", title: "Les années 70", desc: "Premier choc pétrolier, fin de la croissance d'après-guerre, montée des crises." },
    1974: { label: "1974", title: "Les années 70", desc: "Premier choc pétrolier, fin de la croissance d'après-guerre, montée des crises." },
    1975: { label: "1975", title: "Les années 70", desc: "Fin de la croissance d'après-guerre, montée des crises économiques et sociales." },
    1976: { label: "1976", title: "Les années 70", desc: "Fin de la croissance d'après-guerre, montée des crises économiques et sociales." },
    1977: { label: "1977", title: "Les années 70", desc: "Montée des crises économiques, émergence des mouvements sociaux et écologiques." },
    1978: { label: "1978", title: "Les années 70", desc: "Montée des crises économiques, émergence des mouvements sociaux et écologiques." },
    1979: { label: "1979", title: "Les années 70", desc: "Second choc pétrolier, instabilité économique mondiale." },
    1980: { label: "1980", title: "Les années 80", desc: "Émergence de l'informatique personnelle, premier Minitel, culture punk et new wave." },
    1981: { label: "1981", title: "Les années 80", desc: "Émergence de l'informatique personnelle, premier Minitel, culture punk et new wave." },
    1982: { label: "1982", title: "Les années 80", desc: "Émergence de l'informatique personnelle, premier Minitel, culture punk et new wave." },
    1983: { label: "1983", title: "Les années 80", desc: "Premier téléphone mobile, naissance d'Internet (TCP/IP), société de consommation." },
    1984: { label: "1984", title: "Les années 80", desc: "Premier téléphone mobile, naissance d'Internet (TCP/IP), société de consommation." },
    1985: { label: "1985", title: "Les années 80", desc: "Windows 1.0, premier Mac,essor de la culture de consommation et des médias." },
    1986: { label: "1986", title: "Les années 80", desc: "Tchernobyl, mondialisation des marchés financiers, émergence du sida." },
    1987: { label: "1987", title: "Les années 80", desc: "Krach boursier de 1987, mondialisation, émergence du sida." },
    1988: { label: "1988", title: "Les années 80", desc: "Mondialisation, émergence du sida, premiers ordinateurs personnels dans les foyers." },
    1989: { label: "1989", title: "Les années 80", desc: "Chute du mur de Berlin, fin de la guerre froide, émergence du World Wide Web." },
    1990: { label: "1990", title: "Les années 90", desc: "Chute du mur de Berlin, émergence du Web, mondialisation accélérée." },
    1991: { label: "1991", title: "Les années 90", desc: "Guerre du Golfe, dissolution de l'URSS, premier navigateur web." },
    1992: { label: "1992", title: "Les années 90", desc: "Traité de Maastricht, emergence d'Internet grand public." },
    1993: { label: "1993", title: "Les années 90", desc: "Naissance du navigateur Mosaic, émergence du Web grand public." },
    1994: { label: "1994", title: "Les années 90", desc: "Netscape, Amazon, émergence du commerce en ligne." },
    1995: { label: "1995", title: "Les années 90", desc: "Windows 95, explosion d'Internet, émergence des premiers portails web." },
    1996: { label: "1996", title: "Les années 90", desc: "Téléphone portable démocratisé, émergence des premiers sites web personnels." },
    1997: { label: "1997", title: "Les années 90", desc: "Asie en crise financière, émergence du web 1.0 et des premiers emails." },
    1998: { label: "1998", title: "Les années 90", desc: "Fondation de Google, krach des marchés émergents, boom d'Internet." },
    1999: { label: "1999", title: "Les années 90", desc: "Effet an 2000, bulle Internet, émergence du commerce électronique." },
    2000: { label: "2000", title: "Les années 2000", desc: "An 2000, bulle Internet qui éclate, émergence du haut débit." },
    2001: { label: "2001", title: "Les années 2000", desc: "Attentats du 11 septembre, iPod, émergence du haut débit." },
    2002: { label: "2002", title: "Les années 2000", desc: "Euro monnaie, émergence du haut débit et des premiers forums web." },
    2003: { label: "2003", title: "Les années 2000", desc: "Guerre d'Iraq, emergence du haut débit et des premiers forums web." },
    2004: { label: "2004", title: "Les années 2000", desc: "Facebook, emergence des réseaux sociaux, bulle Internet terminée." },
    2005: { label: "2005", title: "Les années 2000", desc: "YouTube, émergence des réseaux sociaux et du web 2.0." },
    2006: { label: "2006", title: "Les années 2000", desc: "Twitter, émergence des réseaux sociaux et du web 2.0." },
    2007: { label: "2007", title: "Les années 2000", desc: "Premier iPhone, émergence du smartphone et du web mobile." },
    2008: { label: "2008", title: "Les années 2000", desc: "Crise financière mondiale, premier iPhone 3G, émergence du web mobile." },
    2009: { label: "2009", title: "Les années 2000", desc: "Après-crise financière, émergence du smartphone et du web mobile." },
    2010: { label: "2010", title: "Les années 2010", desc: "Instagram, émergence du smartphone dominant et du web social." }
  },
  events: {
    // Anti-répétition
    recentMemorySize: 30,              // ~5-6 ans avec 5 actions/an
    categoryCooldowns: {               // années min entre 2 événements même catégorie
      rupture: 3, deuil: 2, argent: 2, sante: 2, promotion: 3, grossesse: 2
    },
    // Poids dynamiques : multiplicateurs selon état joueur
    dynamicWeights: {
      fêtard:       { soiree: 2.0, rencontre: 1.5 },
      casanier:     { soiree: 0.3,  lecture: 1.5 },
      anxieux:      { sante: 1.5,   drame: 1.3 },
      ambitieux:    { carriere: 1.5, promotion: 1.4 },
      solitaire:    { rencontre: 1.5, amitie: 1.3 },
      joueur:       { argent: 1.5,  jeu: 2.0 },
      depensier:    { argent: 1.3,  achat: 1.5 }
    }
  },

  // ── GENRE (effets réalistes, optionnels) ────────────────
  gender: {
    realisticEffects: true,           // peut être désactivé
    // Espérance de vie
    lifeExpectancy: { homme: 79, femme: 85 },
    // Carrière (écarts salariaux & progression)
    career: {
      wageGap: 0.12,                  // femmes -12% salaire même poste
      promotionGap: 0.08,             // -8% prob promotion
      maternitePause: { dureeMois: 6, carriereMalus: 0.15 },  // congé maternité
      paternitePause: { dureeMois: 1, carriereMalus: 0.02 }   // congé paternité
    },
    // Santé
    health: {
      grossesseRisque: { age35plus: 1.5, age40plus: 3.0 },
      cancersSpecifiques: { homme: ["prostate"], femme: ["sein", "ovaire", "col_uterus"] },
      cardiovasculaire: { hommeMult: 1.2, femmeMult: 0.9 }
    },
    // Charge parentale (temps + énergie)
    parentalLoad: { mere: 1.5, pere: 1.0 }
  },

  // ── UI / UX ──────────────────────────────────────────────
  ui: {
    animationSpeed: 300,             // ms pour transitions
    deltaAnimationDuration: 800,     // ms pour +5 santé etc.
    maxTimelineEntries: 500,
    familyTreeMaxDepth: 5
  }
};

// Helper pour accéder aux configs par chemin pointé
function cfg(path) {
  return path.split(".").reduce((o, k) => (o || {})[k], CONFIG);
}

// Exposer la config sur le namespace VIE (utilisé par engine/* et ui/*)
window.VIE = window.VIE || {};
window.VIE.config = CONFIG;
window.VIE.cfg = cfg;