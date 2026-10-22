/* ============================================================
   UNE VIE v0.5 — ÉVÉNEMENTS PASSIFS (sans choix, interludes)
   Type "passif", choices: [] ou passive: true
   ============================================================ */

var EVENTS_PASSIFS = [
  // ── ENFANCE / ADO ─────────────────────────────────────────
  {
    id: "passif_amis_ecole", stage: "enfance", type: "passif", category: "amitie",
    title: "Un nouveau camarade de classe",
    text: "À la récréation, un enfant vous propose de jouer. Vous échangez vos prénoms, et une amitié naissante se dessine.",
    choices: [], passive: true, weight: 3,
    bind: { p1: { role: "ami", minAffection: 0, trait: ["bavard", "timide"] } }
  },
  {
    id: "passif_rencontre_parc", stage: "enfance", type: "passif", category: "rencontre",
    title: "L'après-midi au square",
    text: "Vous jouez dans le bac à sable quand un autre enfant vous prête sa pelle. Un petit geste qui illumine l'après-midi.",
    choices: [], passive: true, weight: 2,
    bind: { p1: { role: "ami", minAffection: 0 } }
  },
  {
    id: "passif_premier_baiser", stage: "ado", type: "passif", category: "amour",
    title: "Le premier baiser",
    text: "Derrière le gymnase, lors de la fête de fin d'année, vos lèvres se frôlent pour la première fois. Le cœur bat la chamade, le monde s'arrête un instant.",
    choices: [], passive: true, weight: 2,
    bind: { p1: { role: "amour", minAffection: 40, trait: ["romantique", "timide"] } }
  },
  {
    id: "appel_vieux_ami", stage: "ado", type: "passif", category: "amitie",
    title: "Le coup de fil inattendu",
    text: "Votre téléphone vibre. Un vieux camarade de primaire, perdu de vue depuis des années, vous laisse un message vocal : \"Salut, ça fait longtemps...\"",
    choices: [], passive: true, weight: 2,
    bind: { p1: { role: "ami", minAffection: 30 } }
  },
  {
    id: "passif_dispute_fratrie", stage: "ado", type: "passif", category: "famille",
    title: "La dispute avec votre frère/sœur",
    text: "Une remarque anodine déclenche une tempête. Les portes claquent, les mots blessent. Mais au fond, vous savez que ça passera.",
    choices: [], passive: true, weight: 2,
    bind: { p1: { role: "frere_soeur", minAffection: 20 } }
  },

  // ── JEUNE ADULTE (18-29) — PIC D'ÉVÉNEMENTS ────────────────
  {
    id: "passif_soiree_rencontre", stage: "jeune", type: "passif", category: "rencontre",
    title: "La soirée qui change tout",
    text: "Une fête chez des amis, de la musique trop forte, un verre à la main. Soudain, un regard croise le vôtre à l'autre bout de la pièce. L'alchimie est immédiate.",
    choices: [], passive: true, weight: 4,
    bind: { p1: { role: "amour", minAffection: 0, trait: ["charmeur", "fêtard"] } }
  },
  {
    id: "passif_appli_rencontre", stage: "jeune", type: "passif", category: "rencontre",
    title: "Un match sur l'appli",
    text: "Une notification : \"Vous avez un match !\" La photo vous plaît, la bio vous intrigue. Vous osez le premier message.",
    choices: [], passive: true, weight: 3,
    bind: { p1: { role: "amour", minAffection: 0 } }
  },
  {
    id: "passif_soiree_entre_potes", stage: "jeune", type: "passif", category: "amitie",
    title: "La soirée qui dérape (en bien)",
    text: "Une sortie prévue pour un verre se transforme en nuit blanche. Rires, confidences, projets fous. Ces amis-là, vous ne les oublierez pas.",
    choices: [], passive: true, weight: 3,
    bind: { p1: { role: "ami", minAffection: 20, trait: ["fêtard", "bavard"] } }
  },
  {
    id: "passif_voisin_sympa", stage: "jeune", type: "passif", category: "voisinage",
    title: "Le voisin qui dépanne",
    text: "Votre clé casse dans la serrure à 2h du matin. Votre voisin, en pyjama, vous offre son canapé et un thé. La solidarité existe encore.",
    choices: [], passive: true, weight: 2,
    bind: { p1: { role: "ami", minAffection: 10 } }
  },
  {
    id: "passif_premier_salaire", stage: "jeune", type: "passif", category: "argent",
    title: "Le premier vrai salaire",
    text: "La notification bancaire tombe. Vous fixez le montant, incrédule. La fierté se mêle à l'angoisse : comment gérer cet argent ?",
    choices: [], passive: true, weight: 2
  },
  {
    id: "passif_coloc_fete", stage: "jeune", type: "passif", category: "amitie",
    title: "La pendaison de crémaillère",
    text: "Vos colocataires organisent une fête surprise pour votre emménagement. Des gens que vous connaissez à peine deviennent des amis pour la vie.",
    choices: [], passive: true, weight: 2,
    bind: { p1: { role: "ami", minAffection: 15, trait: ["fêtard", "bavard"] } }
  },
  {
    id: "passif_ex_reapparait", stage: "jeune", type: "passif", category: "amour",
    title: "Le message de l'ex",
    text: "Une notification tardive. Votre ex vous écrit : \"Je pensais à toi. Comment tu vas ?\" Le passé ressurgit, inattendu.",
    choices: [], passive: true, weight: 2,
    bind: { p1: { role: "ex", minAffection: 0 } }
  },

  // ── ADULTE (30-49) ────────────────────────────────────────
  {
    id: "passif_mariage_ami", stage: "adulte", type: "passif", category: "amitie",
    title: "Le mariage de votre meilleur ami",
    text: "Vous êtes témoin. L'émotion vous prend à la gorge quand il/elle dit \"oui\". Vous réalisez que le temps file, que vous vieillissez ensemble.",
    choices: [], passive: true, weight: 3,
    bind: { p1: { role: "ami_proche", minAffection: 70 } }
  },
  {
    id: "passif_naissance_neveu", stage: "adulte", type: "passif", category: "famille",
    title: "La naissance du premier neveu/nièce",
    text: "Ce petit être fragile dans vos bras. Vous comprenez soudain ce que vos parents ont ressenti. Une nouvelle génération arrive.",
    choices: [], passive: true, weight: 3,
    bind: { p1: { role: "frere_soeur", minAffection: 50 } }
  },
  {
    id: "passif_promotion_inattendue", stage: "adulte", type: "passif", category: "carriere",
    title: "La promotion qu'on n'attendait plus",
    text: "Votre patron vous appelle dans son bureau. Pas pour une réprimande, mais pour vous annoncer une promotion. Le travail finit par payer.",
    choices: [], passive: true, weight: 2
  },
  {
    id: "passif_deces_grand_parent", stage: "adulte", type: "passif", category: "deuil",
    title: "Le dernier adieu à grand-mère",
    text: "Elle s'en est allée dans son sommeil. Vous retrouvez sa vieille lettre dans votre boîte aux lettres : \"Sois heureux, mon enfant.\" Les larmes coulent, apaisantes.",
    choices: [], passive: true, weight: 3,
    bind: { p1: { role: "grand_parent", minAffection: 60 } }
  },
  {
    id: "passif_crise_conjugale", stage: "adulte", type: "passif", category: "amour",
    title: "La nuit où tout a failli basculer",
    text: "Un silence lourd à table. Des mots non dits depuis des mois. L'un de vous deux pose la question : \"Est-ce qu'on continue ?\" La réponse attendra le matin.",
    choices: [], passive: true, weight: 2,
    bind: { p1: { role: "amour", minAffection: 40, statut: "crise" } }
  },

  // ── MATURITÉ / RETRAITE (50+) ─────────────────────────────
  {
    id: "passif_depart_enfants", stage: "maturite", type: "passif", category: "famille",
    title: "Le nid se vide",
    text: "Le dernier carton est posé dans le coffre. La maison fait écho. Vous regardez votre conjoint : \"Et maintenant, on fait quoi ?\"",
    choices: [], passive: true, weight: 3,
    bind: { p1: { role: "amour", minAffection: 60, statut: "couple_installe" } }
  },
  {
    id: "passif_premier_petit_enfant", stage: "retraite", type: "passif", category: "famille",
    title: "Premier petit-enfant",
    text: "Vous tenez ce bébé qui a vos yeux et le sourire de votre enfant. Le cycle continue. Une fierté immense, silencieuse, vous envahit.",
    choices: [], passive: true, weight: 3,
    bind: { p1: { role: "enfant", minAffection: 70 } }
  },
  {
    id: "passif_retraite_conjoint", stage: "retraite", type: "passif", category: "amour",
    title: "La retraite à deux",
    text: "Les réveils matinaux cessent. Vous redécouvrez le luxe de prendre le temps. Petits déjeuners au lit, promenades sans but, siestes partagées.",
    choices: [], passive: true, weight: 3,
    bind: { p1: { role: "conjoint", minAffection: 80, statut: "marie" } }
  },
  {
    id: "passif_reunion_lycee", stage: "retraite", type: "passif", category: "amitie",
    title: "Les retrouvailles du lycée",
    text: "Quarante ans après, vous vous retrouvez. Les rides racontent des vies, mais les rires sont restés les mêmes. Le temps n'a pas tout effacé.",
    choices: [], passive: true, weight: 2,
    bind: { p1: { role: "ami_d_enfance", minAffection: 50 } }
  },
  {
    id: "passif_dernier_anniversaire", stage: "vieillesse", type: "passif", category: "famille",
    title: "L'anniversaire des 90 ans",
    text: "Quatre générations autour de la table. Vos arrière-petits-enfants vous grimpent sur les genoux. Vous pensez : \"J'ai eu une belle vie.\"",
    choices: [], passive: true, weight: 2,
    bind: { p1: { role: "arriere_petit_enfant", minAffection: 30 } }
  },

  // ── UNIVERSELS (TOUS ÂGES) ────────────────────────────────
  {
    id: "passif_coup_de_foudre", stage: "jeune", type: "passif", category: "rencontre",
    title: "Le coup de foudre dans le métro",
    text: "Vous lisez, elle/il monte. Vos yeux se croisent. Une fraction de seconde. Le train repart, mais l'image reste gravée.",
    choices: [], passive: true, weight: 2,
    bind: { p1: { role: "amour", minAffection: 0, trait: ["romantique"] } }
  },
  {
    id: "passif_reve_bizarre", stage: "jeune", type: "passif", category: "hasard",
    title: "Le rêve qui hante la journée",
    text: "Vous vous réveillez en sueur. Un rêve si vif qu'il vous hante toute la journée. Vous cherchez un sens, mais il n'y en a peut-être pas.",
    choices: [], passive: true, weight: 1
  },
  {
    id: "passif_trouver_argent", stage: "jeune", type: "passif", category: "hasard",
    title: "Le billet retrouvé",
    text: "Dans la poche d'un vieux manteau, un billet de 50€. La petite joie gratuite qui illumine la semaine.",
    choices: [], passive: true, weight: 1
  },
  {
    id: "passif_chanson_radio", stage: "jeune", type: "passif", category: "hasard",
    title: "La chanson au bon moment",
    text: "La radio passe *cette* chanson. Celle qui vous rappelle cet été, cette personne, ce moment parfait. Vous souriez en conduisant.",
    choices: [], passive: true, weight: 2
  },
  {
    id: "passif_orage_nuit", stage: "adulte", type: "passif", category: "hasard",
    title: "L'orage de la nuit",
    text: "Le tonnerre gronde, la pluie fouette les vitres. Blotti(e) sous la couette, vous vous sentez infiniment petit(e) et infiniment en sécurité.",
    choices: [], passive: true, weight: 1
  },
  {
    id: "passif_lettre_inattendue", stage: "maturite", type: "passif", category: "hasard",
    title: "Une lettre manuscrite",
    text: "Dans la boîte aux lettres, parmi les factures, une enveloppe manuscrite. Une amie d'enfance vous écrit. L'encre a le goût du temps retrouvé.",
    choices: [], passive: true, weight: 2,
    bind: { p1: { role: "ami_d_enfance", minAffection: 40 } }
  }
];

// Export global pour compatibilité
window.VIE = window.VIE || {};
window.VIE.data = window.VIE.data || {};
window.VIE.data.events_passifs = EVENTS_PASSIFS;