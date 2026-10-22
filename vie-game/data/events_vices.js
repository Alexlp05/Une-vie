/* ============================================================
   UNE VIE v0.5 — ÉVÉNEMENTS VICES, HABITUDES, ERREURS, RÉDEMPTION
   ============================================================ */

var EVENTS_VICES = [
  // ── ALCOOL ────────────────────────────────────────────────
  {
    id: "vice_premiere_biere", stage: "ado", type: "vices", category: "alcool",
    title: "La première bière",
    text: "Une soirée entre potes. On vous tend une canette. \"Goûte, c'est pas si mal.\" L'amertume vous surprend, mais l'effet vous plaît.",
    choices: [
      { text: "Boire, pour faire comme les autres.", effects: { habit: "alcool", habitDelta: 5 }, result: "La première gorgée passe. La suivante viendra plus facilement." },
      { text: "Refuser poliment.", effects: { bonheur: 2 }, result: "Vos amis haussent les épaules. Vous gardez la tête claire." },
      { text: "Boire, mais modérément.", effects: { habit: "alcool", habitDelta: 2 }, result: "Une gorgée, deux. Vous savez où est la limite. Pour l'instant." }
    ], weight: 3
  },
  {
    id: "vice_soiree_arrose", stage: "jeune", type: "vices", category: "alcool",
    title: "La soirée trop arrosée",
    text: "Les verres s'enchaînent, les rires montent. Vous ne comptez plus. Le lendemain, le brouillard mental et la nausée vous rappellent la réalité.",
    choices: [
      { text: "Jurer de ne plus jamais boire autant.", effects: { habit: "alcool", habitDelta: -5 }, result: "La promesse est sincère. Mais les occasions reviennent." },
      { text: "Prendre un cachet, boire de l'eau, continuer.", effects: { habit: "alcool", habitDelta: 3, sante: -5 }, result: "Le corps encaisse. L'habitude s'installe, sournoise." },
      { text: "Rire de votre état, raconter l'anecdote.", effects: { habit: "alcool", habitDelta: 2, social: 3 }, result: "C'est devenu une histoire drôle. Jusqu'à la prochaine fois." }
    ], weight: 4,
    bind: { p1: { role: "ami", minAffection: 20, trait: ["fêtard"] } }
  },
  {
    id: "vice_apero_quotidien", stage: "adulte", type: "vices", category: "alcool",
    title: "L'apéro qui devient routine",
    text: "Un verre de vin pour décompresser après le travail. Puis deux. Puis chaque soir. La frontière entre plaisir et besoin s'efface.",
    choices: [
      { text: "Arrêter net pendant un mois.", effects: { habit: "alcool", habitDelta: -10, stress: 5 }, result: "Les premiers jours sont durs. Le sommeil revient. La tête s'éclaircit." },
      { text: "Réduire aux weekends seulement.", effects: { habit: "alcool", habitDelta: -5 }, result: "Un compromis fragile. La tentation guette chaque vendredi." },
      { text: "Continuer, ça vous détend.", effects: { habit: "alcool", habitDelta: 5, sante: -3 }, result: "Le foie travaille en silence. La tolérance monte. Le piège se referme." }
    ], weight: 3,
    bind: { p1: { role: "conjoint", minAffection: 40 } }
  },
  {
    id: "vice_alcool_dependance", stage: "adulte", type: "vices", category: "alcool",
    title: "Quand l'alcool devient nécessaire",
    text: "Vous ne buvez plus pour le plaisir, mais pour ne pas trembler. Le matin, un verre pour démarrer. Le secret pèse sur chaque interaction.",
    choices: [
      { text: "Appeler une ligne d'aide / voir un médecin.", effects: { habit: "alcool", habitDelta: -15, stress: 10 }, flag: "alcool_cure", result: "Le premier pas est le plus dur. Le chemin sera long, mais vous n'êtes plus seul(e)." },
      { text: "Cacher, minimiser, continuer.", effects: { habit: "alcool", habitDelta: 10, sante: -10, reputation: -5 }, result: "Le mensonge devient une seconde nature. L'effondrement approche." },
      { text: "Essayer de contrôler seul(e).", effects: { habit: "alcool", habitDelta: -5, stress: 8 }, result: "La volonté vacille. La rechute guette au premier stress." }
    ], weight: 2,
    requiresFlag: "alcool_cure"
  },

  // ── TABAC ────────────────────────────────────────────────
  {
    id: "vice_premiere_cigarette", stage: "ado", type: "vices", category: "tabac",
    title: "La première cigarette",
    text: "Derrière le lycée, un ami vous tend une clope. \"Tire, c'est pas si terrible.\" La fumée brûle la gorge, la tête tourne. Vous toussez, mais vous en reprenez une.",
    choices: [
      { text: "Continuer, pour l'image.", effects: { habit: "tabac", habitDelta: 10 }, result: "Le paquet devient un accessoire. L'addiction commence en silence." },
      { text: "Essayer une fois, arrêter là.", effects: { habit: "tabac", habitDelta: 2 }, result: "Le goût reste sur les doigts. La curiosité est satisfaite." },
      { text: "Refuser, même sous la pression.", effects: { social: -2, confiance: 3 }, result: "Vos amis rient. Vous gardez vos poumons intacts." }
    ], weight: 3
  },
  {
    id: "vice_arret_tabac", stage: "adulte", type: "vices", category: "tabac",
    title: "La décision d'arrêter de fumer",
    text: "Votre toux matinale s'aggrave. Votre compte en banque saigne. Votre entourage vous supplie. C'est maintenant ou jamais.",
    choices: [
      { text: "Patchs, application, soutien médical.", effects: { habit: "tabac", habitDelta: -20, stress: 5, argent: 10 }, flag: "non_fumeur", result: "Les premiers jours sont une guerre. Mais chaque jour sans cigarette est une victoire." },
      { text: "La méthode 'à froid', sheer willpower.", effects: { habit: "tabac", habitDelta: -15, stress: 15 }, result: "L'irritabilité explose. L'entourage trinque. Mais vous tenez bon." },
      { text: "Réduire progressivement, puis arrêter.", effects: { habit: "tabac", habitDelta: -10, stress: 5 }, result: "Moins violent, mais le risque de rechute est plus grand." }
    ], weight: 3
  },

  // ── CANNABIS / AUTRES SUBSTANCES ────────────────────────
  {
    id: "vice_premier_joint", stage: "ado", type: "vices", category: "cannabis",
    title: "Le premier joint",
    text: "Une soirée chill, de la musique, un joint qui circule. \"T'inquiète, c'est naturel.\" La détente arrive, le temps se dilate. Vous riez sans raison.",
    choices: [
      { text: "Essayer, par curiosité.", effects: { habit: "cannabis", habitDelta: 8 }, result: "La sensation est agréable. La frontière entre occasionnel et régulier est mince." },
      { text: "Refuser, observer les autres.", effects: { social: -1, confiance: 2 }, result: "Vous restez lucide. Les regards se posent sur vous, mais vous assumez." },
      { text: "Essayer une fois, pour voir.", effects: { habit: "cannabis", habitDelta: 5 }, result: "L'expérience est faite. La porte est entrouverte." }
    ], weight: 3
  },
  {
    id: "vice_cannabis_habituel", stage: "jeune", type: "vices", category: "cannabis",
    title: "Quand le joint devient quotidien",
    text: "Le soir venu, le rituel s'impose. Sans, l'anxiété monte, le sommeil fuit. La motivation s'effrite, les projets s'enlisent.",
    choices: [
      { text: "Arrêter net, reprendre le contrôle.", effects: { habit: "cannabis", habitDelta: -15, stress: 8, motivation: 5 }, result: "Les nuits sont agitées les premiers temps. Puis la clarté revient." },
      { text: "Ne fumer que le weekend.", effects: { habit: "cannabis", habitDelta: -8 }, result: "Une discipline fragile. L'envie guette chaque vendredi soir." },
      { text: "Continuer, ça vous apaise.", effects: { habit: "cannabis", habitDelta: 5, intelligence: -3, motivation: -3 }, result: "Le brouillard s'épaissit. Les rêves s'effacent dans la fumée." }
    ], weight: 3
  },

  // ── JEU D'ARGENT ─────────────────────────────────────────
  {
    id: "vice_premier_pari", stage: "jeune", type: "vices", category: "jeu",
    title: "Le premier pari sportif",
    text: "Un match, une cote alléchante, 20€ misés \"pour voir\". La victoire rapporte 80€. L'adrénaline, le sentiment de maîtrise. Le piège se referme.",
    choices: [
      { text: "Encaisser et arrêter là.", effects: { argent: 80, habit: "jeu", habitDelta: 2 }, result: "La chance a souri. Vous partez gagnant. Le jeu s'arrête là." },
      { text: "Remiser la mise, tenter le double.", effects: { habit: "jeu", habitDelta: 10, argent: [20, 160] }, result: "La spirale commence. La perte est plus douloureuse que le gain n'est doux." },
      { text: "Miser petit, régulièrement.", effects: { habit: "jeu", habitDelta: 5, argent: -20 }, result: "L'habitude s'installe. Les petites pertes s'additionnent en silence." }
    ], weight: 3
  },
  {
    id: "vice_chute_jeu", stage: "adulte", type: "vices", category: "jeu",
    title: "La spirale du jeu",
    text: "Les dettes s'accumulent. Vous mentez à vos proches. Chaque gain est remis en jeu. Chaque perte appelle une mise plus grosse. Le fond du gouffre approche.",
    choices: [
      { text: "Tout avouer à votre conjoint, demander aide.", effects: { habit: "jeu", habitDelta: -15, tension: 30, confiance: -20 }, flag: "jeu_aide", result: "La honte est immense. Mais le soutien arrive. La reconstruction commence." },
      { text: "Emprunter aux amis, aux parents, aux organismes.", effects: { habit: "jeu", habitDelta: 10, argent: -5000, reputation: -15 }, result: "La dette monte. Les relations se brisent. La fuite en avant continue." },
      { text: "Croire au gros coup qui tout effacera.", effects: { habit: "jeu", habitDelta: 15, argent: -10000 }, result: "L'illusion du sauveur. La ruine est au bout du chemin." }
    ], weight: 2
  },

  // ── SOIRÉES / VIE NOCTURNE ──────────────────────────────
  {
    id: "vice_soiree_exces", stage: "jeune", type: "vices", category: "soirees",
    title: "La nuit qui dérape",
    text: "Alcool, musique, rencontres. Vous vous réveillez chez un(e) inconnu(e), le téléphone plein de messages que vous ne vous souvenez pas d'avoir envoyés. La honte, les bleus, les regrets.",
    choices: [
      { text: "Fuir, ne plus jamais revoir cette personne.", effects: { habit: "soirees", habitDelta: -5, reputation: -5, stress: 5 }, result: "La fuite ne gomme pas le souvenir. La leçon reste gravée." },
      { text: "Assumer, présenter des excuses si besoin.", effects: { habit: "soirees", habitDelta: -3, reputation: -3 }, result: "L'honnêteté coûte cher. Mais la dignité reste intacte." },
      { text: "Rire de l'anecdote, recommencer le weekend suivant.", effects: { habit: "soirees", habitDelta: 5, reputation: -5, risque_accident: 1 }, result: "Le cycle se répète. La prochaine fois sera peut-être pire." }
    ], weight: 4,
    bind: { p1: { role: "ami", minAffection: 15, trait: ["fêtard", "impulsif"] } }
  },
  {
    id: "vice_rdv_tinder_alcool", stage: "jeune", type: "vices", category: "soirees",
    title: "Le rendez-vous Tinder trop arrosé",
    text: "Deux verres pour le courage, trois pour la conversation, quatre pour l'oubli. La chimie s'évapore avec l'alcool. Le matin, le vague à l'âme.",
    choices: [
      { text: "Ne plus jamais boire avant un premier rendez-vous.", effects: { habit: "soirees", habitDelta: -5, habit: "alcool", habitDelta: -5 }, result: "Une règle de vie s'installe. La lucidité devient votre allié." },
      { text: "Assumer, rire de l'échec, passer au suivant.", effects: { habit: "soirees", habitDelta: 3, social: 2 }, result: "La légèreté masque la solitude. Le suivant sera pareil." },
      { text: "Blamer l'application, la société, l'époque.", effects: { habit: "soirees", habitDelta: 2, cynisme: 1 }, result: "La responsabilité glisse. Le schéma se répète." }
    ], weight: 3
  },

  // ── DÉPENSES IMPULSIVES / ARGENT ────────────────────────
  {
    id: "vice_achat_compulsif", stage: "jeune", type: "vices", category: "argent",
    title: "L'achat compulsif de minuit",
    text: "Insomnie, téléphone à la main, un clic. 300€ pour un gadget dont vous n'avez pas besoin. Le lendemain, la boîte arrive. Vous ne l'ouvrez même pas.",
    choices: [
      { text: "Renvoyer, se faire rembourser.", effects: { argent: 0, habit: "achat_compulsif", habitDelta: -5 }, result: "La discipline l'emporte. La dopamine du clic ne trompe plus." },
      { text: "Garder, se dire que ça servira.", effects: { habit: "achat_compulsif", habitDelta: 5, argent: -300 }, result: "L'objet rejoint la pile des achats inutiles. Le vide se remplit d'objets." },
      { text: "Cacher l'achat au conjoint.", effects: { habit: "achat_compulsif", habitDelta: 5, secret: { key: "achat_cache", target: "conjoint" }, tension: 5 }, result: "Le secret pourrit la relation. La prochaine fois sera plus facile." }
    ], weight: 3
  },
  {
    id: "vice_decouvert_bancaire", stage: "adulte", type: "vices", category: "argent",
    title: "Le découvert qui s'installe",
    text: "Les fins de mois sont rouges. Les agios s'empilent. Chaque dépense est un calcul. La liberté financière s'évapore.",
    choices: [
      { text: "Faire un budget strict, tout noter.", effects: { habit: "budget", habitDelta: 10, argent: 5 }, result: "La visibilité revient. Le contrôle revient. La paix financière se construit." },
      { text: "Demander un prêt pour combler.", effects: { argent: 2000, dette: 2000, habit: "dette", habitDelta: 5 }, result: "Le trou se rebouche. Mais la dette appelle la dette. Le cycle continue." },
      { text: "Ignorer, espérer que ça s'arrange.", effects: { habit: "budget", habitDelta: -5, stress: 10, argent: -200 }, result: "L'espoir n'est pas une stratégie. La banque finit par appeler." }
    ], weight: 3
  },

  // ── MENSONGES / TRAHISONS / ERREURS MORALES ─────────────
  {
    id: "vice_mensonge_conjoint", stage: "adulte", type: "vices", category: "mensonge",
    title: "Le mensonge qui protège (ou détruit)",
    text: "Une dépense cachée, une rencontre omise, un sentiment tu. \"C'est pour ne pas l'inquiéter.\" Le mensonge grandit, la vérité s'éloigne.",
    choices: [
      { text: "Tout avouer, maintenant.", effects: { tension: 20, confiance: -15, affection: -10 }, result: "L'aveu fait mal. Mais la vérité, aussi douloureuse, est le seul socle possible." },
      { text: "Enterrer le secret, jure de ne plus recommencer.", effects: { secret: { key: "mensonge_cache", target: "conjoint" }, stress: 5 }, result: "Le secret pourrit en silence. La prochaine fois sera plus facile." },
      { text: "Minimiser, détourner, gagner du temps.", effects: { secret: { key: "mensonge_cache", target: "conjoint" }, stress: 3, reputation: -2 }, result: "Le temps ne joue pas en votre faveur. La vérité finit par éclater." }
    ], weight: 4,
    bind: { p1: { role: "amour", minAffection: 50, statut: "couple" } }
  },
  {
    id: "vice_infidelite_impulsive", stage: "adulte", type: "vices", category: "infidelite",
    title: "L'infidélité d'un soir",
    text: "Une soirée, de l'alcool, une attirance mutuelle. La ligne est franchie en quelques minutes. L'euphorie laisse place à la culpabilité immédiate.",
    choices: [
      { text: "Tout avouer immédiatement.", effects: { tension: 40, confiance: -50, affection: -30, bonheur: -20 }, flag: "infidelite_aveu", result: "L'onde de choc est violente. Mais l'honnêteté laisse une porte ouverte." },
      { text: "Enterrer ce secret à jamais.", effects: { secret: { key: "infidelite", target: "conjoint" }, stress: 10, culpabilite: 15 }, result: "Le secret pourrit. La peur de la découverte empoisonne chaque jour." },
      { text: "Dire que ça n'a pas compté, que c'était l'alcool.", effects: { tension: 30, confiance: -30, affection: -20 }, result: "L'excuse aggrave la blessure. La minimisation blesse plus que l'acte." }
    ], weight: 3,
    bind: { p1: { role: "amour", minAffection: 40, statut: "couple" } }
  },
  {
    id: "vice_vol_mineur", stage: "ado", type: "vices", category: "vol",
    title: "Le vol à l'étalage",
    text: "Un objet petit, facile à glisser dans la poche. L'adrénaline, le sentiment de toute-puissance. Puis la peur, au sortir du magasin.",
    choices: [
      { text: "Remettre l'objet, ne plus jamais recommencer.", effects: { culpabilite: 5, moral: 3 }, result: "La peur a été un bon professeur. La ligne rouge est tracée." },
      { text: "Garder l'objet, ressentir la fierté du 'coup'.", effects: { habit: "vol", habitDelta: 5, reputation: -5 }, result: "Le frisson du vol. La prochaine fois, ce sera plus gros." },
      { text: "Se faire prendre, assumer les conséquences.", effects: { reputation: -15, stress: 10, legal: 1 }, result: "La leçon est brutale. Le casier, même léger, suit longtemps." }
    ], weight: 2
  },

  // ── THÉRAPIE / RÉDEMPTION / RÉPARATION ──────────────────
  {
    id: "redemption_therapie", stage: "adulte", type: "vices", category: "redemption",
    title: "La décision de consulter",
    text: "Vous sentez que quelque chose ne va pas. L'anxiété, les excès, les relations abîmées. Franchir la porte du psy est un acte de courage.",
    choices: [
      { text: "S'engager dans une thérapie régulière.", effects: { stress: -15, habit: "therapie", habitDelta: 10 }, flag: "en_therapie", result: "Le chemin est long. Mais chaque séance éclaire un peu plus le chemin." },
      { text: "Essayer quelques séances, voir si ça aide.", effects: { stress: -5, habit: "therapie", habitDelta: 5 }, result: "Un pas en avant. La porte reste ouverte pour plus tard." },
      { text: "Préférer s'en sortir seul(e).", effects: { stress: 5, orgueil: 2 }, result: "La solitude est un lourd fardeau. Mais certains la portent toute leur vie." }
    ], weight: 3
  },
  {
    id: "redemption_excuses_sinceres", stage: "adulte", type: "vices", category: "redemption",
    title: "Présenter des excuses sincères",
    text: "Vous avez blessé quelqu'un. Le temps a passé, mais la blessure reste ouverte. Vous décidez d'aller vers l'autre, sans excuse, sans 'mais'.",
    choices: [
      { text: "Aller le/la voir en face, tout assumer.", effects: { tension: -20, confiance: 15, affection: 10 }, result: "L'autre est surpris(e), touché(e). La porte s'entrouvre. La guérison commence." },
      { text: "Écrire une lettre, laisser le temps.", effects: { tension: -10, confiance: 8, affection: 5 }, result: "Les mots écrits ont un poids différent. L'autre peut lire, relire, digérer." },
      { text: "Envoyer un message, rester prudent(e).", effects: { tension: -5, confiance: 3 }, result: "C'est un début. L'écriture protège, mais la voix aurait plus de poids." }
    ], weight: 3,
    bind: { p1: { role: "ami", minAffection: 30, tension: 20 } }
  },
  {
    id: "redemption_reparation_argent", stage: "adulte", type: "vices", category: "redemption",
    title: "Réparer une dette morale ou financière",
    text: "Vous devez de l'argent à un ami, à la famille. Ou vous avez causé un préjudice. Le poids de la dette vous suit partout.",
    choices: [
      { text: "Rembourser progressivement, même petit à petit.", effects: { argent: -200, tension: -10, confiance: 10 }, result: "Chaque versement allège la conscience. La relation se reconstruit par actes." },
      { text: "Proposer un service, du temps, en échange.", effects: { tension: -8, social: 5 }, result: "L'argent n'est pas la seule monnaie. Le don de soi vaut parfois plus." },
      { text: "Espérer qu'on l'oublie.", effects: { tension: 5, reputation: -5 }, result: "L'oubli ne vient pas. La rancœur, si." }
    ], weight: 3,
    bind: { p1: { role: "ami", minAffection: 20 } }
  },
  {
    id: "redemption_pardonner_soi", stage: "maturite", type: "vices", category: "redemption",
    title: "Apprendre à se pardonner",
    text: "Des années après, la faute résonne encore. Vous avez changé, réparé, grandi. Mais une voix intérieure continue de vous juger. Il est temps de faire la paix.",
    choices: [
      { text: "Écrire une lettre à votre 'vous' du passé, la brûler.", effects: { bonheur: 10, stress: -10, sagesse: 5 }, result: "Le feu consume le papier. La cendre emporte le poids. Vous respirez." },
      { text: "Partager votre histoire pour aider d'autres.", effects: { reputation: 5, altruisme: 5, sens: 5 }, result: "Votre faute devient utile. La lumière traverse la faille." },
      { text: "Accepter que la cicatrice reste, mais ne saigne plus.", effects: { bonheur: 5, acceptance: 5 }, result: "La perfection n'existe pas. L'humain est fait d'ombres et de lumières." }
    ], weight: 2
  },

  // ── VIEILLISSEMENT DES VICES ────────────────────────────
  {
    id: "vice_vieillesse_alcool", stage: "retraite", type: "vices", category: "alcool",
    title: "L'alcool et l'âge",
    text: "Votre corps ne supporte plus comme avant. Un verre suffit pour être ivre. Le médecin a été clair : \"À votre âge, l'alcool tue plus vite.\"",
    choices: [
      { text: "Arrêter complètement, profiter des années qui restent.", effects: { habit: "alcool", habitDelta: -20, sante: 5 }, result: "La clarté revient. Les matins sont nets. Les économies s'accumulent." },
      { text: "Un verre de vin au repas, pour le plaisir.", effects: { habit: "alcool", habitDelta: -10 }, result: "La modération retrouvée. Le vin redevient un accompagnement, pas une béquille." },
      { text: "Continuer, la vie est courte de toute façon.", effects: { habit: "alcool", habitDelta: 5, sante: -5 }, result: "Le corps paiera l'addition. Mais c'est votre choix." }
    ], weight: 2
  },
  {
    id: "vice_vieillesse_tabac", stage: "retraite", type: "vices", category: "tabac",
    title: "La toux du matin qui ne part plus",
    text: "Quarante ans de cigarettes. Le souffle court, l'essoufflement à l'effort. Vos petits-enfants vous disent : \"Papy/Mamie, arrête.\"",
    choices: [
      { text: "Arrêter pour eux, pour vous.", effects: { habit: "tabac", habitDelta: -20, sante: 3 }, result: "La toux s'atténue. L'odeur disparaît. L'argent économisé finance des cadeaux." },
      { text: "Passer à la cigarette électronique.", effects: { habit: "tabac", habitDelta: -10, sante: 1 }, result: "Moins nocif, dit-on. La dépendance à la nicotine persiste." },
      { text: "Continuer, c'est votre dernier plaisir.", effects: { habit: "tabac", habitDelta: 2, sante: -3 }, result: "Le temps file. Chaque cigarette en vole un peu plus." }
    ], weight: 2
  }
];

// Export global pour compatibilité
window.VIE = window.VIE || {};
window.VIE.data = window.VIE.data || {};
window.VIE.data.events_vices = EVENTS_VICES;