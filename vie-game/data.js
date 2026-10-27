/* ============================================================
   UNE VIE — Données du jeu (contenu narratif, en français)
   ============================================================ */

var STAGES = [
  { key: "bebe",      name: "Petite enfance",  min: 0,  max: 5 },
  { key: "enfance",   name: "Enfance",         min: 6,  max: 12 },
  { key: "ado",       name: "Adolescence",     min: 13, max: 18 },
  { key: "jeune",     name: "Jeune adulte",    min: 19, max: 29 },
  { key: "adulte",    name: "Âge adulte",      min: 30, max: 49 },
  { key: "maturite",  name: "Maturité",        min: 50, max: 65 },
  { key: "retraite",  name: "Retraite",        min: 66, max: 79 },
  { key: "vieillesse", name: "Vieillesse",     min: 80, max: 120 }
];

function stageForAge(age) {
  for (var i = 0; i < STAGES.length; i++) {
    if (age >= STAGES[i].min && age <= STAGES[i].max) return STAGES[i].key;
  }
  return "vieillesse";
}

function ageStep(age) {
  if (age < 6) return 1;
  if (age < 13) return 1 + Math.floor(Math.random() * 2);
  if (age < 19) return 1 + Math.floor(Math.random() * 2);
  if (age < 30) return 2 + Math.floor(Math.random() * 2);
  if (age < 50) return 2 + Math.floor(Math.random() * 3);
  if (age < 66) return 2 + Math.floor(Math.random() * 3);
  if (age < 80) return 2 + Math.floor(Math.random() * 3);
  return 1 + Math.floor(Math.random() * 2);
}

/* ------------------------------------------------------------
   Tempéraments
   ------------------------------------------------------------ */
var TRAITS = [
  {
    id: "aventurier",
    name: "L'Aventurier",
    desc: "+10 Énergie, envie de tout tenter.",
    effects: { energie: 10 }
  },
  {
    id: "intellectuel",
    name: "L'Intellectuel",
    desc: "+15 Intelligence, une soif de savoir.",
    effects: { intelligence: 15, social: -5 }
  },
  {
    id: "sociable",
    name: "Le Sociable",
    desc: "+15 Social, le charme comme arme.",
    effects: { social: 15 }
  },
  {
    id: "courageux",
    name: "Le Courageux",
    desc: "+10 Santé, +5 Bonheur, cœur de lion.",
    effects: { sante: 10, bonheur: 5 }
  },
  {
    id: "reveur",
    name: "Le Rêveur",
    desc: "+10 Bonheur, +5 Intelligence, tête dans les étoiles.",
    effects: { bonheur: 10, intelligence: 5 }
  },
  {
    id: "travailleur",
    name: "Le Travailleur",
    desc: "+10 Énergie, +5 Santé, la persévérance pour boussole.",
    effects: { energie: 10, sante: 5 }
  },
  {
    id: "rebelle",
    name: "Le Rebelle",
    desc: "+12 Énergie, +5 Bonheur, mais -5 Social.",
    effects: { energie: 12, bonheur: 5, social: -5 }
  },
  {
    id: "diplomate",
    name: "Le Diplomate",
    desc: "+10 Social, +5 Intelligence, l'art du compromis.",
    effects: { social: 10, intelligence: 5 }
  },
  {
    id: "passionne",
    name: "Le Passionné",
    desc: "+10 Bonheur, +8 Santé, tout est vécu intensément.",
    effects: { bonheur: 10, sante: 8 }
  }
];

/* ------------------------------------------------------------
   FAMILLES D'ORIGINE — le point de départ
   (tirées au hasard à la création : plus ou moins favorisées,
    elles donnent des bases et teintent toute la vie)
   ------------------------------------------------------------ */
var ORIGINS = [
  {
    id: "populaire",
    name: "Famille ouvrière",
    tagline: "L'effort et la solidarité",
    desc: "Un appartement modeste, des horaires à rallonge, et une fierté du travail bien fait. L'argent manque, mais la chaleur du quartier compense.",
    effects: { sante: 5, energie: 5 },
    money: 2,
    passions: {},
    flag: "famille_populaire"
  },
  {
    id: "aisee",
    name: "Famille aisée",
    tagline: "Le confort et les études",
    desc: "Une maison avec jardin, des vacances au ski, et des parents qui vous poussent vers les meilleures écoles.",
    effects: { intelligence: 5, social: 5 },
    money: 45,
    passions: {},
    flag: "famille_aisee"
  },
  {
    id: "heritage",
    name: "Ancienne fortune",
    tagline: "Le poids de l'héritage",
    desc: "Une vieille demeure pleine de portraits, un patrimoine familial transmis depuis des générations. Un héritage vous attend, quelque part.",
    effects: { social: 5, intelligence: 3 },
    money: 120,
    passions: {},
    flag: "famille_heritage"
  },
  {
    id: "pouvoir",
    name: "Famille en vue",
    tagline: "Le nom et l'influence",
    desc: "On vous appelle par votre nom de famille dans les dîners. Les parents serrent des mains importantes. Le pouvoir a une odeur de salon.",
    effects: { social: 10, intelligence: 3 },
    money: 35,
    passions: {},
    flag: "famille_pouvoir"
  },
  {
    id: "artistique",
    name: "Famille d'artistes",
    tagline: "La sensibilité en héritage",
    desc: "Des toiles sur les murs, un piano qui grince, des débats passionnés sur la beauté. L'art est une seconde langue à la maison.",
    effects: { bonheur: 8, intelligence: 3 },
    money: 12,
    passions: { peinture: 1, musique: 1 },
    flag: "famille_artistique"
  },
  {
    id: "sportive",
    name: "Famille de sportifs",
    tagline: "Le corps d'abord",
    desc: "Le week-end se passe sur les terrains. Vos parents ont connu le haut niveau, et votre sang bouillonne de courses et de victoires.",
    effects: { sante: 8, energie: 8 },
    money: 6,
    passions: { sport: 1 },
    flag: "famille_sportive"
  },
  {
    id: "academique",
    name: "Famille d'enseignants",
    tagline: "La raison et les livres",
    desc: "Des bibliothèques pleines, des repas qui tournent en débats, des parents qui corrigent vos copies à table. Le savoir est un trésor de famille.",
    effects: { intelligence: 10 },
    money: 22,
    passions: {},
    flag: "famille_academique"
  },
  {
    id: "migrante",
    name: "Famille venue d'ailleurs",
    tagline: "Deux cultures, une force",
    desc: "Une histoire de valises, de langues entremêlées, de recettes venues d'ailleurs. Vous grandissez entre deux mondes, et c'est une richesse.",
    effects: { social: 6, bonheur: 4 },
    money: 0,
    passions: { cuisine: 1 },
    flag: "famille_migrante"
  },
  {
    id: "prestigieuse",
    name: "Une histoire de famille",
    tagline: "Des héros dans le sang",
    desc: "Un aïeul résistant, une grand-mère engagée, un nom cité dans les livres d'histoire. Vous portez la mémoire de leurs combats.",
    effects: { social: 10, bonheur: 5 },
    money: 25,
    passions: {},
    flag: "famille_prestigieuse"
  },
  {
    id: "commercante",
    name: "Famille de commerçants",
    tagline: "Le commerce dans le sang",
    desc: "La boutique au rez-de-chaussée, les clients, les comptes le soir. Vous apprenez tôt que tout se négocie — sauf la famille.",
    effects: { social: 5, intelligence: 3 },
    money: 20,
    passions: {},
    flag: "famille_commercante"
  },
  {
    id: "agricole",
    name: "Famille paysanne",
    tagline: "La terre et la patience",
    desc: "Une ferme, des réveils à l'aube, les saisons comme maîtresses. Les mains dans la terre apprennent le prix des choses.",
    effects: { sante: 6, energie: 6, intelligence: -3 },
    money: 4,
    passions: { nature: 1 },
    flag: "famille_agricole"
  },
  {
    id: "eclatee",
    name: "Famille éclatée",
    tagline: "Des débris et une résilience",
    desc: "Deux maisons, des parents séparés, des week-ends en valise. L'instabilité vous a forgé un cœur en acier — et des défenses hautes.",
    effects: { energie: 6, bonheur: -8, social: -3 },
    money: 2,
    passions: {},
    flag: "famille_eclatee"
  }
];

function randomOrigins(n) {
  var pool = ORIGINS.slice();
  var out = [];
  while (out.length < n && pool.length) {
    var i = Math.floor(Math.random() * pool.length);
    out.push(pool[i]);
    pool.splice(i, 1);
  }
  return out;
}

/* ------------------------------------------------------------
   Événements
   ------------------------------------------------------------ */
var EVENTS = [];

function ev(stage, id, title, text, choices, opts) {
  opts = opts || {};
  EVENTS.push({
    stage: stage,
    id: id,
    title: title,
    text: text,
    choices: choices,
    type: opts.type || "vie",
    category: opts.category || null,
    weight: opts.weight || 1,
    once: opts.once !== false,
    minAge: opts.minAge || null,
    maxAge: opts.maxAge || null,
    requiresFlag: opts.requiresFlag || null,
    notFlag: opts.notFlag || null,
    minStat: opts.minStat || null,
    requiresCareer: opts.requiresCareer || null,
    requiresRelation: opts.requiresRelation || null,
    notRelation: opts.notRelation || null,
    crisisCond: opts.crisisCond || null,
    requiresPassion: opts.requiresPassion || null,
    requiresLife: opts.requiresLife || null,
    requiresWorld: opts.requiresWorld || null,
    requiresFamily: opts.requiresFamily || null,
    theme: opts.theme || null,
    special: opts.special || false
  });
}

/* ---------- PETITE ENFANCE (0-5) ---------- */

ev("bebe", "naissance", "La première respiration",
  "Vous ouvrez les yeux sur un monde immense. Une lumière douce, une voix qui murmure votre prénom. Tout commence ici.",
  [
    { text: "Saisir le doigt tendu vers vous, curieux.",
      effects: { intelligence: 5, bonheur: 5 }, result: "Vous attrapez le doigt de votre mère. Le monde se met à sourire." },
    { text: "S'endormir paisiblement, confiant.",
      effects: { sante: 5, bonheur: 5 }, result: "Un sommeil profond, sans peur. La vie peut attendre." }
  ]);

ev("bebe", "jardin", "Le jardin des merveilles",
  "Dans le jardin familial, vous découvrez une coccinelle posée sur une feuille. Ses points rouges brillent comme des braises.",
  [
    { text: "L'observer longuement, fasciné.",
      effects: { intelligence: 8, bonheur: 3 }, result: "Vous restez immobile des minutes entières. La coccinelle finit par s'envoler." },
    { text: "Courir la montrer à vos parents.",
      effects: { social: 8, bonheur: 3 }, result: "Toute la maison vient admirer la petite bête. Vous êtes le héros du jour." }
  ]);

ev("bebe", "maladie", "La fièvre du soir",
  "Une forte fièvre vous cloue au lit. Votre front est brûlant, et la nuit semble interminable.",
  [
    { text: "Vous blottir et vous laisser soigner.",
      effects: { sante: 5, social: 5 }, result: "Des mains douces, une tisane tiède. Vous guérissez, aimé." },
    { text: "Râler et refuser le remède amer.",
      effects: { sante: -5, energie: 5 }, result: "Le remède a fini par passer de force. Vous gardez la leçon." }
  ]);

ev("bebe", "chaton", "Le chaton perdu",
  "Un chaton minuscule miaule sous le porche, trempé par la pluie. Ses yeux supplient.",
  [
    { text: "Le recueillir et le cacher dans votre chambre.",
      effects: { bonheur: 10, social: -5 }, result: "Il devient votre complice secret. La maison a un nouveau roi." },
    { text: "Appeler vos parents pour l'aider.",
      effects: { social: 8, bonheur: 5 }, result: "Toute la famille se mobilise. Le chaton a trouvé un foyer." }
  ]);

ev("bebe", "construction", "La tour impossible",
  "Avec vos cubes, vous bâtissez une tour qui tangente déjà. Une dernière pièce au sommet, ou tout s'écroule ?",
  [
    { text: "Poser la pièce avec un immense soin.",
      effects: { intelligence: 8 }, result: "Elle tient ! Vous contemplez votre œuvre, fier comme un roi." },
    { text: "La faire tomber volontairement, pour le bruit.",
      effects: { bonheur: 5, sante: -3 }, result: "L'effondrement vous fait rire aux éclats. On reconstruit, c'est encore plus drôle." }
  ]);

ev("bebe", "recre", "La bagarre du bac à sable",
  "Un camarade vous arrache votre seau dans le bac à sable. Les larmes montent.",
  [
    { text: "Reprendre votre seau, déterminé.",
      effects: { sante: 3, social: -3 }, result: "Vous récupérez votre seau. On ne vous le reprendra plus." },
    { text: "Proposer de jouer ensemble.",
      effects: { social: 8, bonheur: 5 }, result: "Vous partagez le sable et le seau. Une amitié naît dans les pâtés." }
  ]);

/* ---------- ENFANCE (6-12) ---------- */

ev("enfance", "ecole", "Le premier jour d'école",
  "La cloche sonne. Un cartable neuf, une salle qui sent la craie, et des dizaines de regards inconnus.",
  [
    { text: "Vous asseoir au premier rang, attentif.",
      effects: { intelligence: 10, social: 3 }, result: "La maîtresse remarque votre sérieux. Les lettres se mettent à danser sur le tableau, et vous les attrapez." },
    { text: "Chercher un ami avant tout.",
      effects: { social: 10, intelligence: 3 }, result: "Vous trouvez un complice pour la récré. Les leçons suivront." }
  ]);

ev("enfance", "lecture", "Le concours de lecture",
  "La bibliothèque de l'école lance un grand concours de lecture. Cent pages vous séparent de la victoire.",
  [
    { text: "Relever le défi, un livre sous le bras.",
      effects: { intelligence: 12 }, result: "Vous dévorez les chapitres. Votre esprit s'ouvre à des mondes entiers." },
    { text: "Préférer le terrain de jeu.",
      effects: { sante: 6, social: 4 }, result: "Les copains et les courses remplacent les mots. La sueur est votre seul roman." }
  ]);

ev("enfance", "sport", "Le club de sport",
  "On affiche une affiche colorée : le club de football (ou de basket) recrute. L'entraînement commence le mercredi.",
  [
    { text: "Rejoindre le club et donner tout.",
      effects: { sante: 10, social: 5, energie: -5 }, result: "Les passes, les buts, la sueur. Vous appartenez à une équipe." },
    { text: "Rester spectateur sur le banc.",
      effects: { intelligence: 5, bonheur: -5 }, result: "Regarder ne fatigue pas, mais les autres s'amusent beaucoup." }
  ]);

ev("enfance", "musique", "La leçon de musique",
  "Chez un voisin, un piano résonne. Vos doigts s'agitent, comme attirés par les notes.",
  [
    { text: "Demander à apprendre le piano.",
      effects: { intelligence: 8, bonheur: 5 }, result: "Des semaines de gammes. Un jour, une vraie mélodie sort de vos mains." },
    { text: "Vous contenter d'écouter.",
      effects: { bonheur: 5 }, result: "Vous fermez les yeux et laissez la musique vous porter." }
  ]);

ev("enfance", "harcelement", "Les moqueries du fond de classe",
  "Un groupe d'élèves se moque de vous chaque jour. Leurs rires vous suivent dans les couloirs.",
  [
    { text: "En parler à vos parents.",
      effects: { social: 6, bonheur: 5 }, result: "Les adultes s'en mêlent. La menace se dissout, vous respirez." },
    { text: "Garder le silence, serrer les dents.",
      effects: { sante: -5, bonheur: -5 }, result: "Vous endurez seul. La plaie met des années à cicatriser." }
  ]);

ev("enfance", "grands-parents", "L'été chez les grands-parents",
  "Une maison à la campagne, une tarte qui cuit, et un grand-père qui raconte ses histoires d'avant.",
  [
    { text: "Écouter les récits d'autrefois.",
      effects: { intelligence: 8, bonheur: 5 }, result: "Vous apprenez le passé, grain par grain, comme on cueille des cerises." },
    { text: "Explorer le grenier et le jardin.",
      effects: { energie: 8, sante: 4 }, result: "Vous découvrez des trésors poussiéreux et le goût des tomates encore chaudes." }
  ]);

ev("enfance", "accident", "La chute à vélo",
  "Le vélo file, le vent dans les cheveux… puis une pierre, et le trottoir qui monte vers vous.",
  [
    { text: "Se relever et remonter aussitôt.",
      effects: { sante: -3, courage: 8, bonheur: 5 }, result: "Le genou écorché, mais le sourire. Vous domptez la machine." },
    { text: "Ranger le vélo pour un moment.",
      effects: { sante: 5, bonheur: -3 }, result: "Vous marchez quelques jours. La peur a besoin de repos." }
  ]);

ev("enfance", "collection", "La collection mystérieuse",
  "Dans une brocante, vous trouvez un vieux carnet rempli de timbres du monde entier.",
  [
    { text: "Commencer votre propre collection.",
      effects: { intelligence: 8 }, result: "Chaque timbre devient une fenêtre sur un pays lointain." },
    { text: "Le revendre à un libraire du coin.",
      effects: { argent: 15 }, result: "Quelques pièces tintent dans votre poche. La première leçon d'économie." }
  ]);

/* ---------- ADOLESCENCE (13-18) ---------- */

ev("ado", "premier-amour", "Le premier battement de cœur",
  "Dans la cour, son regard croise le vôtre. Une chaleur monte, un mot reste bloqué dans la gorge.",
  [
    { text: "Oser lui parler, en bafouillant.",
      effects: { social: 10, bonheur: 8 }, result: "Vous échangez quelques phrases maladroites. Un sourire, et tout s'illumine." },
    { text: "Garder vos distances, par pudeur.",
      effects: { bonheur: -5, intelligence: 5 }, result: "Vous écrivez des poèmes en cachette. L'amour vous apprend le secret." }
  ]);

ev("ado", "lycee", "Le choix des filières",
  "L'orientation approche. Sciences, littérature, technique… les portes se dessinent à l'horizon.",
  [
    { text: "Choisir ce qui vous passionne vraiment.",
      effects: { intelligence: 10, bonheur: 5 }, result: "Vous suivez votre cœur. Les matières deviennent des alliées." },
    { text: "Choisir ce qui 'assure' un métier.",
      effects: { intelligence: 5, argent: 5 }, result: "Un choix raisonnable. Vos résultats s'améliorent, sans flamme." }
  ]);

ev("ado", "fete", "La fête interdite",
  "Des amis organisent une soirée chez un grand absent. L'alcool circule, et vos parents croient que vous dormez.",
  [
    { text: "S'amuser, l'air de rien.",
      effects: { social: 8, sante: -8, bonheur: 8 }, result: "Une nuit d'insouciance, au prix d'une gueule de bois et d'un estomac en feu." },
    { text: "Rentrer tôt, avec une excuse.",
      effects: { sante: 5, social: -3 }, result: "Certains vous trouvent ennuyeux. Vous, vous dormez paisiblement." },
    { text: "Veiller sur vos amis un peu ivres.",
      effects: { social: 10, energie: -5 }, result: "Vous raccompagnez tout le monde. Le rôle du sage vous va bien." }
  ]);

ev("ado", "travail-ete", "Le premier job d'été",
  "Un restaurant du coin cherche un plongeur. Des pièces en échange de vos heures, et une promesse d'autonomie.",
  [
    { text: "Accepter, les manches retroussées.",
      effects: { argent: 30, energie: -8, sante: -3 }, result: "La vapeur, l'eau, la vaisselle. Votre premier salaire pèse lourd dans la poche." },
    { text: "Profiter de l'été, plus tard on verra.",
      effects: { bonheur: 8, argent: -5 }, result: "Des journées dorées, des amis, des nuits étoilées. La vie est un long été." }
  ]);

ev("ado", "musique-ado", "Le groupe du garage",
  "Trois copains, une guitare cabossée et l'idée folle de monter un groupe. Le garage sent la poussière et la liberté.",
  [
    { text: "Répéter tous les soirs.",
      effects: { social: 10, intelligence: 5, energie: -5 }, result: "Des fausses notes, puis un vrai riff. Vous sentez enfin le rock." },
    { text: "Regarder de loin, sans vous engager.",
      effects: { bonheur: -3 }, result: "Vous écoutez depuis la fenêtre, le cœur un peu serré." }
  ]);

ev("ado", "notes", "La pression des notes",
  "Le bulletin approche. Les moyennes sont lourdes, et les regards de vos parents plus lourds encore.",
  [
    { text: "Rentrer dans le rang, bachoter dur.",
      effects: { intelligence: 10, bonheur: -5, energie: -5 }, result: "Le bulletin s'améliore. La satisfaction est brève, la fatigue réelle." },
    { text: "Défendre vos autres talents.",
      effects: { social: 8, bonheur: 8, intelligence: -5 }, result: "Vous rappelez à tous vos victoires ailleurs. Le bulletin, lui, pâlit." }
  ]);

ev("ado", "permis", "Le permis de conduire",
  "Le moniteur vous passe les clés. Le moteur gronde, vos mains tremblent un peu.",
  [
    { text: "Vous jeter sur la route, courageux.",
      effects: { argent: -20, energie: 5 }, result: "Des créneaux ratés, des embardées. Mais au bout : la liberté sur quatre roues." },
    { text: "Reporter ça à plus tard.",
      effects: { argent: 10 }, result: "Vous économisez. La route attendra votre majorité." }
  ]);

ev("ado", "defi", "Le défi de la cour",
  "On vous tend une cigarette ou un verre : 'Allez, sois pas un môme.' Les regards sont braqués sur vous.",
  [
    { text: "Refuser, sans explication.",
      effects: { sante: 8, social: -5, courage: 8 }, result: "Quelques regards se détournent. Vous, vous restez entier." },
    { text: "Essayer, pour voir.",
      effects: { social: 5, sante: -8 }, result: "Une toux, un goût amer. Le besoin d'appartenir a un prix." }
  ]);

ev("ado", "voyage-scolaire", "Le voyage de fin d'année",
  "Trois jours à l'étranger avec la classe, loin des parents. Les bus, les auberges, les nuits sans sommeil.",
  [
    { text: "Explorer chaque recoin du pays.",
      effects: { intelligence: 8, bonheur: 8, energie: -5 }, result: "Des monuments, des langues, des marchés. Le monde devient grand." },
    { text: "Rester avec la bande, fidèle au groupe.",
      effects: { social: 10 }, result: "Des fous rires jusqu'à l'aube. Les souvenirs se tissent entre amis." }
  ]);

ev("ado", "reorientation", "Le doute sur la voie",
  "Vous vous demandez si la filière choisie est vraiment la vôtre. Les nuits deviennent blanches.",
  [
    { text: "Changer de cap, coûte que coûte.",
      effects: { bonheur: 10, intelligence: 3 }, result: "Un nouveau départ, effrayant et libérateur. Le droit de se tromper." },
    { text: "Tenir bon, terminer ce qui est commencé.",
      effects: { intelligence: 8, bonheur: -3 }, result: "Vous obtenez le diplôme, sans certitude. L'endurance forge aussi." }
  ]);

/* ---------- JEUNE ADULTE (19-29) ---------- */

ev("jeune", "premier-appart", "Le premier chez-soi",
  "Quatre murs, une odeur de peinture neuve, et une liberté totale. La clé de votre premier appartement tinte dans votre main.",
  [
    { text: "Le décorer avec soin, comme un nid.",
      effects: { argent: -15, bonheur: 10 }, result: "Des plantes, des photos, un coussin moelleux. Votre refuge prend vie." },
    { text: "Y vivre simplement, sans fioritures.",
      effects: { argent: 15 }, result: "Les économies s'amoncellent. Le confort matériel viendra plus tard." }
  ]);

ev("jeune", "entretien", "L'entretien décisif",
  "Un costume trop serré, une salle de réunion, et des questions qui fusent. Le poste est à portée de main.",
  [
    { text: "Répondre avec sincérité et chaleur.",
      effects: { social: 8, argent: 20 }, result: "Votre franchise désarme. On vous rappelle le soir même : engagé." },
    { text: "Enchaîner les blagues pour détendre l'air.",
      effects: { social: 5, argent: 10 }, result: "Quelques sourires, mais le verdict est timide. On retient votre numéro." },
    { text: "La jouer très sérieux, carré.",
      effects: { intelligence: 5, argent: 15 }, result: "Le CV parle pour vous. La rigueur paie, mais le climat reste froid." }
  ]);

ev("jeune", "amour-serieux", "Une rencontre qui compte",
  "Autour d'un café, la conversation ne s'arrête plus. Les heures filent, et quelque chose s'installe.",
  [
    { text: "Laisser la relation grandir.",
      effects: { bonheur: 12, social: 8 }, result: "Des rendez-vous, des confidences. L'amour s'enracine doucement." },
    { text: "Prendre vos distances, par peur.",
      effects: { bonheur: -8 }, result: "Vous laissez passer la vague. Parfois, le cœur se protège trop." }
  ]);

ev("jeune", "sac-a-dos", "Le voyage sac à dos",
  "Un billet d'avion, un sac trop lourd, et un continent entier à l'autre bout du ciel.",
  [
    { text: "Partir un an, à l'aventure.",
      effects: { argent: -30, bonheur: 15, intelligence: 8 }, result: "Des rencontres, des tempêtes, des levers de soleil. Vous rentrez transformé." },
    { text: "Annuler et sécuriser votre carrière.",
      effects: { argent: 20, bonheur: -5 }, result: "Le compte en banque vous sourit. Le rêve, lui, attend au placard." }
  ]);

ev("jeune", "investissement", "L'opportunité à saisir",
  "Un ami vous propose une idée d'investissement. Ça sent le risque, mais aussi le gros gain.",
  [
    { text: "Tenter le tout pour le tout.",
      effects: { argent: 40, sante: -5 }, result: "La réussite au premier rendez-vous : vos fonds fructifient au-delà du rêve." },
    { text: "Investir une petite somme, prudemment.",
      effects: { argent: 15 }, result: "Gain modeste mais sûr. La prudence est une forme de courage." },
    { text: "Refuser, trop dangereux.",
      effects: { argent: -5 }, result: "Vous gardez vos billes. L'ami encaisse le gros lot, avec un sourire gêné." }
  ]);

ev("jeune", "bourse_debuter", "Premiers pas en bourse",
  "Vous avez un peu d'épargne. Un collègue vous parle d'actions, d'ETF, de dividendes. Et si vous faisiez travailler votre argent ?",
  [
    { text: "Investir prudemment dans des fonds indiciels.",
      effects: { invest_stocks: 20 }, result: "Vous placez 10 k€ en bourse. Le temps fera le reste.", flag: "investisseur" },
    { text: "Acheter quelques actions à risque, pour l'adrénaline.",
      effects: { invest_stocks: 20 }, result: "10 k€ sur des valeurs volatiles. Ça peut doubler, ou fondre.", flag: "investisseur" },
    { text: "Garder votre argent sur le livret, sécurité avant tout.",
      effects: { argent: 2 }, result: "Le taux est bas, mais le capital est là. La tranquillité a un prix." }
  ], { type: "argent", once: false });

ev("adulte", "investir_bourse", "Bourse : renforcer ou alléger",
  "Votre portefeuille boursier évolue. Le marché offre des opportunités, ou des signes d'alerte.",
  [
    { text: "Investir davantage, le marché est bas.",
      effects: { invest_stocks: 40 }, result: "Vous renforcez vos positions. L'histoire montre que la patience paie." },
    { text: "Vendre une partie, sécuriser les gains.",
      effects: { argent: 15 }, result: "Vous encaissez des plus-values. La prudence protège l'avenir." },
    { text: "Ne rien faire, laisser le temps travailler.",
      effects: {}, result: "La meilleure action est parfois l'inaction. Votre portefeuille suit son cours." }
  ], { type: "argent", requiresFlag: "investisseur", once: false });

ev("adulte", "immobilier_locatif", "L'immobilier locatif",
  "Un appartement se libère dans votre quartier. Loyer attractif, quartier en devenir. Un placement tangible.",
  [
    { text: "Acheter pour louer, endettement maîtrisé.",
      effects: { invest_realestate: 60 }, result: "Vous devenez propriétaire bailleur. Le loyer couvre une bonne part du crédit.", flag: "proprietaire_bailleur" },
    { text: "Investir via une SCPI, sans gestion.",
      effects: { invest_realestate: 30 }, result: "Parts de société civile. Vous percevez des dividendes sans gérer les locataires." },
    { text: "Laisser passer, la gestion vous rebute.",
      effects: {}, result: "L'opportunité file. D'autres viendront, ou pas." }
  ], { type: "argent", once: false });

ev("adulte", "entreprise_developpement", "Développement de votre entreprise",
  "Votre activité décolle. De nouveaux clients, des commandes. Il faut structurer, embaucher, investir.",
  [
    { text: "Embaucher, déléguer, grandir.",
      effects: { invest_business: 50, bonheur: 5, social: 5 }, result: "Première équipe, premiers bureaux. Vous êtes devenu(e) patron(ne).", flag: "entreprise_en_croissance" },
    { text: "Externaliser, garder la main légère.",
      effects: { argent: -10, energie: 5 }, result: "Freelances, sous-traitants. Vous gardez le cap sans le poids des RH." },
    { text: "Refuser la croissance, choisir la niche.",
      effects: { bonheur: 3 }, result: "Vous restez seul(e) aux commandes. La qualité prime sur le volume." }
  ], { type: "carriere", requiresFlag: "entreprise", once: false });

ev("maturite", "entreprise_strategie", "Stratégie d'entreprise : le grand virage",
  "Votre groupe est solide. Mais le marché change : digitalisation, concurrence, écologie. Il faut décider de l'avenir.",
  [
    { text: "Acquérir un concurrent, consolider la position.",
      effects: { invest_business: 120, intelligence: 5, social: 3 }, result: "Fusion réussie. Votre groupe domine le secteur.", flag: "entreprise_leader" },
    { text: "Investir massivement dans l'innovation verte.",
      effects: { invest_business: 80, bonheur: 8, intelligence: 5 }, result: "Votre entreprise devient une référence éthique. Les clients suivent." },
    { text: "Réorganiser, réduire les coûts, maximiser le dividende.",
      effects: { argent: 30, bonheur: -10, social: -5 }, result: "Les actionnaires sourient. Les salariés, moins. L'efficacité a un visage dur." },
    { text: "Préparer la cession, vendre au bon prix.",
      effects: { argent: 120, bonheur: 5 }, result: "L'entreprise change de mains. Vous repartez avec le fruit de décennies." }
  ], { type: "carriere", requiresFlag: "entreprise_en_croissance", requiresCareer: true, once: false });

ev("maturite", "rachat_concurrent", "Opportunité de rachat",
  "Un concurrent en difficulté vous propose ses actifs à prix bradé. Clientèle, brevets, équipe clé.",
  [
    { text: "Racheter, intégrer, dominer.",
      effects: { invest_business: 90, intelligence: 5, social: 3 }, result: "L'intégration est rude mais le marché vous appartient désormais.", flag: "rachat_reussi" },
    { text: "Ne prendre que les brevets et les meilleurs talents.",
      effects: { argent: -20, intelligence: 8 }, result: "Chirurgical. Vous récupérez l'essentiel sans le poids du reste." },
    { text: "Laisser faire, ce n'est pas votre affaire.",
      effects: {}, result: "Un autre rachètera. Vous gardez votre cap, votre trésorerie, votre liberté." }
  ], { type: "carriere", requiresFlag: "entreprise_leader", once: false });

ev("retraite", "gestion_patrimoine", "Gérer votre patrimoine",
  "L'activité professionnelle s'efface. Place à la gestion : actions, immobilier, liquidités. Comment faire fructifier sans risquer ?",
  [
    { text: "Rééquilibrer vers le sécuritaire, vivre des revenus.",
      effects: { argent: 5, bonheur: 5 }, result: "Obligations, SCPI, livrets. Les revenus couvrent vos dépenses. Sérénité." },
    { text: "Gard une part d'actions, pour la croissance et les petits-enfants.",
      effects: { invest_stocks: 10, bonheur: 3 }, result: "Le patrimoine continue de grandir. Vos héritiers vous en sauront gré." },
    { text: "Donner, transmettre de votre vivant.",
      effects: { argent: -30, bonheur: 12, social: 8 }, result: "Donations, aides aux enfants, création d'une fondation. L'argent redevient sens." }
  ], { type: "argent" });

/* ------------------------------------------------------------
   GESTION D'ENTREPRISE — événements annuels pour entrepreneurs confirmés
   ------------------------------------------------------------ */
ev("maturite", "biz_embauche", "Campagne de recrutement",
  "Votre entreprise a besoin de talents. Développeurs, commerciaux, managers : les CV affluent, mais le choix est stratégique.",
  [
    { text: "Recruter des seniors, expertise immédiate.",
      effects: { invest_business: 40, intelligence: 3, bonheur: 2 }, result: "Coût élevé, mais productivité instantanée. L'équipe monte en puissance." },
    { text: "Former des juniors, investir dans l'avenir.",
      effects: { invest_business: 20, bonheur: 5, social: 3 }, result: "Moins cher, mais du temps. La culture d'entreprise se forge avec eux." },
    { text: "Automatiser, réduire les besoins en effectifs.",
      effects: { invest_business: 60, bonheur: -5, social: -3 }, result: "IA, process, robots. La marge grimpe, l'humain s'efface." }
  ], { type: "business_mgmt", requiresCareerLevel: 2, once: false });

ev("maturite", "biz_nouveau_marche", "Nouveau marché à conquérir",
  "Une opportunité à l'international ou sur un segment adjacent. Le potentiel est là, le risque aussi.",
  [
    { text: "Lancer une filiale, investir massivement.",
      effects: { invest_business: 80, intelligence: 5, bonheur: 3 }, result: "Premiers bureaux à l'étranger. L'aventure mondiale commence." },
    { text: "Partenariat local, partager le risque.",
      effects: { invest_business: 30, social: 5, bonheur: 3 }, result: "Un allié sur place. La croissance est plus lente, mais plus sûre." },
    { text: "Rester sur le cœur de métier, ne pas disperser.",
      effects: { bonheur: 2 }, result: "La discipline paie. Vous connaissez votre terrain, vous y restez maître." }
  ], { type: "business_mgmt", requiresCareerLevel: 3, once: false });

ev("maturite", "biz_crise_interne", "Crise interne : climat social",
  "Grèves, démissions, rumeurs. L'ambiance se dégrade. Il faut agir vite avant que l'entreprise ne se fissure.",
  [
    { text: "Négocier, augmenter les salaires, écouter.",
      effects: { argent: -25, bonheur: 10, social: 8 }, result: "Le dialogue paie. La confiance revient, l'équipe se ressoude." },
    { text: "Sanctionner les meneurs, durcir la ligne.",
      effects: { argent: -10, bonheur: -10, social: -5 }, result: "L'ordre revient. Mais la peur remplace l'engagement. Pour combien de temps ?" },
    { text: "Externaliser les postes conflictuels.",
      effects: { argent: -15, bonheur: -5, social: -3 }, result: "Le problème part chez un sous-traitant. La paix revient, précaire." }
  ], { type: "business_mgmt", requiresCareerLevel: 2, once: false });

ev("maturite", "biz_innovation", "Pari sur l'innovation",
  "Une technologie émergente (IA, biotech, énergie) pourrait révolutionner votre secteur. Investir maintenant ?",
  [
    { text: "Créer un labo interne, tout miser sur la R&D.",
      effects: { invest_business: 100, intelligence: 8, bonheur: 5 }, result: "Des chercheurs, des prototypes. L'avenir se construit ici, dans le secret." },
    { text: "Acquérir une startup prometteuse.",
      effects: { invest_business: 60, intelligence: 5, social: 3 }, result: "L'équipe, la tech, le marché. L'intégration sera le vrai défi." },
    { text: "Observer, attendre la maturité du marché.",
      effects: { intelligence: 3 }, result: "La prudence a ses vertus. Mais les pionniers prennent parfois tout le gâteau." }
  ], { type: "business_mgmt", requiresCareerLevel: 3, once: false });

ev("maturite", "biz_transmission", "Préparer la succession",
  "Vous approchez de la retraite. Qui prendra la relève ? Enfants, cadres dirigeants, repreneur externe ?",
  [
    { text: "Former votre dauphin(e) interne, transition douce.",
      effects: { bonheur: 8, social: 5, intelligence: 3 }, result: "La transmission se prépare sur des années. L'héritage est entre de bonnes mains.", flag: "succession_preparee" },
    { text: "Vendre à un fonds, maximiser la valeur.",
      effects: { argent: 150, bonheur: -3 }, result: "Le chèque est exceptionnel. L'entreprise change de dimension, pas toujours pour le mieux." },
    { text: "Laisser le conseil d'administration décider.",
      effects: { bonheur: 2 }, result: "Vous avez bâti, d'autres gouverneront. La vie continue hors du bureau." }
  ], { type: "business_mgmt", requiresCareerLevel: 4, once: true });

ev("jeune", "cours-soir", "Les cours du soir",
  "Après le travail, vous reprenez le chemin de l'école pour vous former à un nouveau métier.",
  [
    { text: "Persévérer, même épuisé.",
      effects: { intelligence: 12, energie: -10 }, result: "Des mois de double vie. Le diplôme arrive, et avec lui des portes ouvertes." },
    { text: "Abandonner, trop de fatigue.",
      effects: { bonheur: 3, intelligence: -5 }, result: "Le sommeil reprend ses droits. Une occasion rangée dans un tiroir." }
  ]);

ev("jeune", "coloc", "La colocation",
  "Un appartement à partager, trois caractères, une seule salle de bain. La cohabitation est une école.",
  [
    { text: "Créer des règles claires dès le début.",
      effects: { social: 8, bonheur: 5 }, result: "Un planning sur le frigo, des tours de vaisselle. La paix règne." },
    { text: "Laisser couler, l'amitié avant tout.",
      effects: { social: 5, bonheur: 8 }, result: "Des soirées, des désordres, des rires. La vie de famille choisie." }
  ]);

ev("jeune", "expatriation", "L'offre à l'étranger",
  "On vous propose un poste dans un autre pays. Une langue inconnue, une culture nouvelle, et un salaire alléchant.",
  [
    { text: "Sauter le pas de l'expatriation.",
      effects: { argent: 25, intelligence: 10, social: 5, bonheur: -5 }, result: "La solitude des débuts, puis l'ivresse d'un monde nouveau." },
    { text: "Rester près des vôtres.",
      effects: { social: 8, bonheur: 8 }, result: "La stabilité des visages aimés. Les racines ont leur propre richesse." }
  ]);

ev("jeune", "entreprise", "L'étincelle entrepreneuriale",
  "Une idée vous taraude depuis des mois. Quitter le salariat pour monter votre boîte ?",
  [
    { text: "Tout quitter et vous lancer.",
      effects: { argent: 35, energie: -10, sante: -5 }, result: "Des nuits blanches, des doutes, puis le premier client. C'est votre empire." },
    { text: "Garder le job et mûrir l'idée.",
      effects: { argent: 10, intelligence: 5 }, result: "Le projet mûrit dans le secret. Le risque est différé, pas éteint." }
  ]);

ev("jeune", "pépin", "Le pépin de santé",
  "Un mal de dos persistant, des nuits agitées. Le corps envoie ses premiers signaux.",
  [
    { text: "Consulter, changer votre hygiène de vie.",
      effects: { sante: 10, argent: -10 }, result: "Sport, sommeil, alimentation. Vous reprenez les rênes du corps." },
    { text: "Ignorer les signaux, ça passera.",
      effects: { sante: -10 }, result: "Les semaines passent, la douleur s'installe. Le corps n'oublie pas." }
  ]);

ev("jeune", "vieux-ami", "L'ami d'enfance qui rappelle",
  "Votre meilleur ami d'école, perdu de vue depuis des années, vous laisse un message vocal.",
  [
    { text: "Rappeler, retrouver le fil.",
      effects: { social: 10, bonheur: 8 }, result: "Deux heures au téléphone, comme si rien n'avait changé. Les vrais liens survivent." },
    { text: "Laisser le message sans réponse.",
      effects: { bonheur: -5 }, result: "Le silence s'installe. Certaines routes se séparent pour de bon." }
  ]);

/* ---------- ÂGE ADULTE (30-49) ---------- */

ev("adulte", "mariage", "Le jour de la cérémonie",
  "Des fleurs blanches, des proches émus, et la personne qui vous tient la main. L'engagement est une promesse.",
  [
    { text: "Dire oui, sans hésiter.",
      effects: { bonheur: 12, social: 8 }, result: "Des larmes de joie, un baiser sous les confettis. Une nouvelle famille naît." },
    { text: "Reporter, par peur de l'engagement.",
      effects: { bonheur: -8, social: -5 }, result: "Une ombre plane sur la relation. Les mots restent en suspens." }
  ]);

ev("adulte", "naissance", "La naissance",
  "Une minuscule main serre votre doigt. Le monde entier tient dans ce berceau.",
  [
    { text: "Être présent à chaque instant.",
      effects: { bonheur: 15, energie: -10 }, result: "Les nuits courtes, les rires immenses. Vous découvrez l'amour sans condition." },
    { text: "Vous investir dans le travail, pour subvenir.",
      effects: { argent: 10, bonheur: 3, social: -5 }, result: "Le portefeuille s'épaissit, mais le petit lit vide à l'heure du coucher pèse." }
  ]);

ev("adulte", "promotion", "La promotion ou le rêve",
  "Votre patron vous propose une promotion. Mais un vieux rêve (album, atelier, voyage) demande du temps.",
  [
    { text: "Accepter la promotion.",
      effects: { argent: 20, energie: -10, bonheur: -5 }, result: "Des responsabilités, des primes. Le costume s'élargit, le rêve s'amincit." },
    { text: "Refuser et nourrir votre passion.",
      effects: { bonheur: 12, argent: -10 }, result: "Le projet prend vie lentement. Un autre chemin s'ouvre, plus doux." }
  ]);

ev("adulte", "maison", "Le premier achat",
  "Une maison avec un jardin, un toit qui n'est pas à vous… pas encore. La banque étudie votre dossier.",
  [
    { text: "Signer, poser les fondations.",
      effects: { argent: -35, bonheur: 10 }, result: "Des clés, des murs à repeindre, un potager. La racine s'installe." },
    { text: "Rester locataire, rester mobile.",
      effects: { argent: 15, bonheur: 3 }, result: "La liberté de partir vite. Mais le mur à repeindre n'est jamais le vôtre." }
  ]);

ev("adulte", "quarantaine", "La crise de la quarantaine",
  "Quarante ans, un miroir, et une question : est-ce vraiment la vie que j'ai choisie ?",
  [
    { text: "Tout remettre en question, en profondeur.",
      effects: { bonheur: 10, argent: -15 }, result: "Vous changez de route, de coupe de cheveux, de regard. L'essentiel ressort." },
    { text: "Compter vos bénédictions et avancer.",
      effects: { bonheur: 8, sante: 5 }, result: "La gratitude devient une boussole. Vous apprenez à aimer ce qui est." }
  ]);

ev("adulte", "parent-âge", "Le parent qui vieillit",
  "Votre père ou mère a besoin d'aide. Le rôle s'inverse doucement, et c'est étrange.",
  [
    { text: "Vous organiser pour être présent.",
      effects: { bonheur: 8, energie: -10 }, result: "Des repas partagés, des mains tenues. Le temps devient un cadeau." },
    { text: "Déléguer à des aides professionnelles.",
      effects: { argent: -15, bonheur: -3 }, result: "Les bons soins, mais une distance qui pince le cœur." }
  ]);

ev("adulte", "changement-carriere", "Le virage professionnel",
  "Votre secteur s'effondre. Il faut se réinventer, ou couler avec le navire.",
  [
    { text: "Apprendre un nouveau métier de fond en comble.",
      effects: { intelligence: 10, argent: 15 }, result: "Des nuits d'étude à 40 ans. Le vent tourne, vous aussi." },
    { text: "Tenir la barre, coûte que coûte.",
      effects: { argent: -15, sante: -5 }, result: "Le navire tangue. Vous serrez les dents jusqu'au dernier rivage." }
  ]);

ev("adulte", "licenciement", "La porte qui claque",
  "Vendredi, 17h. Une enveloppe, un rendez-vous, et le monde qui s'effondre.",
  [
    { text: "Rebondir avec une idée neuve.",
      effects: { argent: 20, energie: 5 }, result: "L'obligation vous a libéré. Le chômage devient un tremplin." },
    { text: "Vous effondrer dans la spirale du doute.",
      effects: { bonheur: -10, sante: -8 }, result: "Des semaines sombres. Le canapé devient un refuge qui vous enferme." }
  ]);

ev("adulte", "voyage-famille", "Les vacances en famille",
  "Une voiture pleine, un road-trip, et des enfants qui chantent faux à tue-tête.",
  [
    { text: "Rire et profiter du chaos.",
      effects: { bonheur: 12, social: 8 }, result: "Des souvenirs à raconter pendant des décennies. Le bonheur est une autoroute." },
    { text: "Stresser sur l'itinéraire et l'horaire.",
      effects: { bonheur: -8, energie: -5 }, result: "Tout est minuté. Le voyage s'achève épuisé, sans paysage." }
  ]);

ev("adulte", "association", "L'élan du cœur",
  "Une association du quartier cherche des bénévoles. Des mains se tendent vers des causes qui vous touchent.",
  [
    { text: "Vous engager régulièrement.",
      effects: { social: 12, bonheur: 10 }, result: "Votre temps change des vies. Le cœur se réchauffe à chaque geste.", flag: "associatif" },
    { text: "Faire un don ponctuel.",
      effects: { argent: -10, bonheur: 5 }, result: "Un chèque, une conscience tranquille. Mais l'engagement reste à distance." }
  ]);

ev("adulte", "surmenage", "Le surmenage",
  "Réveils à 5h, couchers à minuit. Le travail vous dévore, et le lit devient un champ de bataille.",
  [
    { text: "Faire une pause, voir un médecin.",
      effects: { sante: 10, argent: -5 }, result: "Des semaines de repos. Le corps a gagné ce match contre l'épuisement." },
    { text: "Continuer, envers et contre tout.",
      effects: { sante: -12, energie: -10 }, result: "Le verre finit par déborder. Un jour, le corps impose un arrêt brutal." }
  ]);

/* ---------- MATURITÉ (50-65) ---------- */

ev("maturite", "nid-vide", "Le nid qui se vide",
  "Les enfants quittent la maison. Les couloirs résonnent du silence, et le frigo semble trop grand.",
  [
    { text: "Renouer avec vos passions oubliées.",
      effects: { bonheur: 10, energie: 5 }, result: "Peinture, randonnée, lecture. La maison se remplit de vous." },
    { text: "Vous sentir soudainement vide.",
      effects: { bonheur: -10, sante: -5 }, result: "Le silence pèse. Il faudra du temps pour se retrouver." }
  ]);

ev("maturite", "retour-etudes", "Le retour sur les bancs",
  "L'université accepte les étudiants de tout âge. Une inscription vous tend les bras.",
  [
    { text: "Reprendre les études, épanoui.",
      effects: { intelligence: 12, bonheur: 8 }, result: "Des amphis, des jeunes, des idées neuves. L'esprit reste vivant." },
    { text: "Préférer les chantiers et les mains.",
      effects: { argent: 5, sante: 5 }, result: "Construire, réparer, transformer. Le savoir se lit dans vos doigts." }
  ]);

ev("maturite", "demi-siecle", "Le voyage du demi-siècle",
  "Cinquante ans. Pour célébrer, vous rêvez d'un voyage hors du commun.",
  [
    { text: "Partir seul, vers l'inconnu.",
      effects: { bonheur: 12, argent: -15 }, result: "Des déserts, des mers, des étoiles. La solitude devient une amie." },
    { text: "Organiser une grande fête entouré des vôtres.",
      effects: { social: 12, bonheur: 10, argent: -15 }, result: "Des centaines de sourires et un gâteau immense. La vie bien remplie se contemple." }
  ]);

ev("maturite", "pépin-sante", "L'avertissement du corps",
  "Le cœur se rappelle à vous : des palpitations, un souffle court dans les escaliers.",
  [
    { text: "Adopter une vraie discipline physique.",
      effects: { sante: 12, energie: 10 }, result: "Marche, natation, renoncement aux excès. Le second souffle arrive." },
    { text: "Minimiser, reporter les examens.",
      effects: { sante: -12 }, result: "Le corps insiste, la peur aussi. Certains signaux n'attendent pas." }
  ]);

ev("maturite", "vieux-amis-retrouvailles", "Les retrouvailles",
  "Une classe entière se réunit trente ans après. Des visages ridés, des rires identiques.",
  [
    { text: "Revivre les souvenirs, ému.",
      effects: { social: 10, bonheur: 10 }, result: "Des photos jaunies, des anecdotes croustillantes. Le temps a bon goût." },
    { text: "Rester en retrait, nostalgique.",
      effects: { bonheur: -5 }, result: "Les visages changés vous renvoient vos propres années. La mélancolie l'emporte." }
  ]);

ev("maturite", "grand-projet", "Le grand projet",
  "Cultiver un jardin, écrire un livre, construire un bateau dans le garage : un rêve de longue date vous appelle.",
  [
    { text: "Vous y consacrer chaque semaine.",
      effects: { bonheur: 12, energie: -5 }, result: "Des mois de travail patient. L'œuvre prend forme, comme une promesse tenue." },
    { text: "Le laisser dans un coin, en projet.",
      effects: { bonheur: -5 }, result: "Le garage reste plein de rêves en attente. Le 'un jour' n'arrive jamais." }
  ]);

ev("maturite", "heritage", "La transmission",
  "Il faut organiser l'héritage familial. Des biens, des terres, et des tensions qui affleurent.",
  [
    { text: "Partager équitablement, dans la clarté.",
      effects: { social: 8, bonheur: 5 }, result: "Des discussions franches, des embrassades. La famille sort soudée." },
    { text: "Décider seul, sans discuter.",
      effects: { social: -8, bonheur: -5 }, result: "Le silence se fissure. La rancœur s'installe pour des années." }
  ]);

ev("maturite", "grand-parent", "Le rôle de grand-parent",
  "Un petit être vous appelle 'papi' ou 'mamie'. Un lien nouveau, tendre et léger.",
  [
    { text: "Gâter et partager vos histoires.",
      effects: { bonheur: 15, social: 5 }, result: "Des gâteaux, des contes, des mains qui se serrent. La transmission continue." },
    { text: "Respecter les distances, sereinement.",
      effects: { bonheur: 5 }, result: "Vous observez la nouvelle génération de loin, avec un sourire tranquille." }
  ]);

ev("maturite", "campagne", "Le déménagement à la campagne",
  "Un village, un potager, le chant des oiseaux. La ville vous fatigue de plus en plus.",
  [
    { text: "S'installer à la campagne.",
      effects: { sante: 8, bonheur: 10, argent: -10 }, result: "L'air est pur, les voisins saluent. Le temps ralentit enfin." },
    { text: "Rester en ville, près des commerces.",
      effects: { sante: 5, social: 5 }, result: "Le confort urbain, les cinémas, les cafés. Le rythme reste soutenu." }
  ]);

ev("maturite", "bien-etre", "La quête du bien-être",
  "Méditation, yoga, randonnées : une envie de douceur s'impose à vous.",
  [
    { text: "Adopter ces rituels apaisants.",
      effects: { sante: 10, bonheur: 10, energie: 5 }, result: "Votre souffle ralentit, votre esprit s'apaise. La paix devient une habitude." },
    { text: "Rester sceptique, trop occupé.",
      effects: { sante: -5 }, result: "Le tumulte continue. La paix, elle, attend dans un coin du calendrier." }
  ]);

/* ---------- RETRAITE (66-79) ---------- */

ev("retraite", "retraite", "Le dernier jour de travail",
  "Vous rangez vos affaires pour la dernière fois. Des collègues, des gâteaux, des discours. Et puis, le silence.",
  [
    { text: "Savourer cette liberté retrouvée.",
      effects: { bonheur: 12, energie: 5 }, result: "Les matins sans réveil, les après-midis sans échéance. Un long été commence." },
    { text: "Vous sentir soudainement perdu.",
      effects: { bonheur: -8 }, result: "Les habitudes s'effondrent. Il faudra réinventer les jours." }
  ]);

ev("retraite", "tour-du-monde", "Le tour du monde",
  "Le passeport est à jour, l'épargne aussi. Partir, enfin, voir ce qu'il reste à voir.",
  [
    { text: "Partir trois mois à l'aventure.",
      effects: { bonheur: 15, argent: -20, sante: -3 }, result: "Des temples, des marchés, des trains de nuit. Le monde défile sous vos yeux émerveillés." },
    { text: "Préférer des séjours doux et courts.",
      effects: { bonheur: 8, sante: 5 }, result: "Des thalassos, des villages, des terrasses. La douceur avant l'effort." }
  ]);

ev("retraite", "benevolat", "Le bénévolat",
  "Un centre social cherche des mains. Transmettre son savoir, offrir son temps, donner un sens.",
  [
    { text: "Devenir bénévole assidu.",
      effects: { social: 12, bonheur: 12 }, result: "Des jeunes, des anciens, des rires. Votre présence fait une différence." },
    { text: "Rester chez soi, au calme.",
      effects: { bonheur: 5, sante: 5 }, result: "Le jardin et les livres vous suffisent. La solitude vous est douce." }
  ]);

ev("retraite", "maison-famille", "La maison de famille",
  "Cette vieille maison qu'on n'ose pas quitter, pleine de souvenirs dans chaque fissure.",
  [
    { text: "La rénover, pièce par pièce.",
      effects: { argent: -15, bonheur: 10 }, result: "Des couches de peinture, des histoires retrouvées. La maison redevient vivante." },
    { text: "La vendre et alléger la vie.",
      effects: { argent: 25, bonheur: -3 }, result: "Des clés rendues, des adieux. La mémoire, elle, ne se vend pas." }
  ]);

ev("retraite", "journal", "Le journal de bord",
  "Vous commencez à écrire vos souvenirs. Les mots coulent, parfois plus vite que les larmes.",
  [
    { text: "Écrire chaque jour, sans retenue.",
      effects: { intelligence: 8, bonheur: 8 }, result: "Des centaines de pages. Votre vie devient un récit que vous offrirez aux vôtres." },
    { text: "Préférer raconter de vive voix.",
      effects: { social: 10 }, result: "Autour de la table, vos histoires font briller les yeux des plus jeunes." }
  ]);

ev("retraite", "conjoint-malade", "Le compagnon qui faiblit",
  "La personne qui partage votre vie depuis tant d'années a besoin de soins constants.",
  [
    { text: "Être là, jour et nuit, sans compter.",
      effects: { bonheur: 5, energie: -12, sante: -3 }, result: "L'épuisement et l'amour. Dans les gestes simples, tout se dit." },
    { text: "Partager la charge avec des aides.",
      effects: { argent: -10, sante: 5 }, result: "Des mains professionnelles vous soutiennent. La tendresse, elle, reste vôtre." }
  ]);

ev("retraite", "club", "Le club du matin",
  "Un café de quartier, un club de marche ou de cartes : des visages familiers vous attendent.",
  [
    { text: "Rejoindre le groupe, régulièrement.",
      effects: { social: 12, bonheur: 8 }, result: "Des parties, des marches, des confidences. La semaine a des rendez-vous." },
    { text: "Rester solitaire, par habitude.",
      effects: { bonheur: -5, sante: -3 }, result: "Les jours se ressemblent. La solitude s'installe en douce." }
  ]);

ev("retraite", "simplicite", "Le bonheur simple",
  "Un matin ordinaire, un café, un rayon de soleil. Et soudain, une évidence : c'est bien, là.",
  [
    { text: "Savourer l'instant présent.",
      effects: { bonheur: 12, sante: 5 }, result: "La gratitude vous habite. Le bonheur était là, discret, tout du long." },
    { text: "Chercher encore du plus, ailleurs.",
      effects: { bonheur: -5 }, result: "Le regard reste tourné vers l'horizon. Le présent, lui, file sans être vu." }
  ]);

/* ---------- VIEILLESSE (80+) ---------- */

ev("vieillesse", "petits-enfants", "Les petits-enfants",
  "Une main ridée tient une main minuscule. Les générations se rencontrent.",
  [
    { text: "Leur transmettre vos secrets et histoires.",
      effects: { bonheur: 15, social: 5 }, result: "Des contes, des recettes, des rires. Un pont fragile et précieux s'élève." },
    { text: "Les laisser vivre leur temps.",
      effects: { bonheur: 5 }, result: "Vous les observez depuis votre fauteuil, l'œil tendre." }
  ]);

ev("vieillesse", "sagesse", "La sagesse partagée",
  "Des étudiants vous interviewent sur votre vie. Vos mots pèsent soudain très lourd.",
  [
    { text: "Parler à cœur ouvert.",
      effects: { social: 10, bonheur: 8 }, result: "Vos échecs et vos joies inspirent. Vous devenez une leçon vivante." },
    { text: "Garder vos pensées pour vous.",
      effects: { bonheur: -3 }, result: "La discrétion d'une vie. Le savoir reste dans votre fauteuil." }
  ]);

ev("vieillesse", "sante-fragile", "Le corps qui s'use",
  "Les marches sont plus hautes, les nuits plus courtes. Le corps rappelle ses limites.",
  [
    { text: "Vous adapter, avec grâce et humour.",
      effects: { sante: 5, bonheur: 8 }, result: "Une canne élégante, des pauses savantes. La dignité reste entière." },
    { text: "Lutter, refuser de ralentir.",
      effects: { sante: -8, energie: -5 }, result: "Le refus épuise. La course s'achève à la première chute." }
  ]);

ev("vieillesse", "adieux", "Les adieux",
  "Un être cher vous quitte. Le deuil frappe à la porte de votre vieillesse.",
  [
    { text: "Laisser couler les larmes, honnêtement.",
      effects: { bonheur: 5, sante: 3 }, result: "La peine se vide, puis s'apaise. Le souvenir reste, lumineux." },
    { text: "Rentrer dans le silence et la douleur.",
      effects: { bonheur: -10, sante: -5 }, result: "Le chagrin se mure. Les jours s'allongent, gris et lourds." }
  ]);

ev("vieillesse", "intergenerationnel", "La rencontre intergénérationnelle",
  "Un programme de quartier vous fait rencontrer des lycéens curieux de votre époque.",
  [
    { text: "Échanger, jouer, danser avec eux.",
      effects: { bonheur: 12, energie: 5 }, result: "Des rires, des découvertes. L'âge devient un simple nombre." },
    { text: "Refuser, trop loin de leur monde.",
      effects: { bonheur: -5 }, result: "Le fossé des générations reste ouvert. La mélancolie gagne." }
  ]);

ev("vieillesse", "dernier-projet", "Le dernier projet",
  "Une envie brûlante et absurde : planter un arbre, écrire une lettre, cuisiner une dernière tarte.",
  [
    { text: "Le faire, sans attendre.",
      effects: { bonheur: 12, energie: -5 }, result: "L'arbre poussera après vous, la lettre sera lue, la tarte partagée. Vous avez laissé une trace." },
    { text: "Remettre à plus tard.",
      effects: { bonheur: -5 }, result: "Le projet reste en suspens. Le 'plus tard' devient une promesse au vent." }
  ]);

/* ------------------------------------------------------------
   CARRIÈRES
   ------------------------------------------------------------ */
var CAREER_TRACKS = {
  etudes: {
    name: "Voie des études",
    levels: [
      { name: "Étudiant(e)", minAge: 18, salary: [6, 12] },
      { name: "Jeune diplômé(e)", minAge: 23, salary: [22, 30], req: { intelligence: 55 } },
      { name: "Cadre", minAge: 28, salary: [38, 52], req: { intelligence: 68 } },
      { name: "Expert(e) reconnu(e)", minAge: 38, salary: [58, 80], req: { intelligence: 82 } },
      { name: "Sommité du domaine", minAge: 50, salary: [85, 120], req: { intelligence: 92 } }
    ]
  },
  travail: {
    name: "Voie professionnelle",
    levels: [
      { name: "Employé(e) / ouvrier(e)", minAge: 18, salary: [14, 19] },
      { name: "Technicien(ne) qualifié(e)", minAge: 24, salary: [22, 30], req: { intelligence: 45 } },
      { name: "Chef(fe) d'équipe", minAge: 32, salary: [30, 42], req: { social: 50, intelligence: 55 } },
      { name: "Responsable de service", minAge: 42, salary: [44, 60], req: { social: 65 } },
      { name: "Directeur(trice)", minAge: 52, salary: [62, 85], req: { social: 78, intelligence: 68 } }
    ]
  },
  entreprise: {
    name: "Entrepreneur(e)",
    levels: [
      { name: "Fondateur(trice) à l'étroit", minAge: 18, salary: [0, 10] },
      { name: "Petit business", minAge: 24, salary: [16, 34], req: { argent: 30 } },
      { name: "Entreprise solide", minAge: 32, salary: [38, 62], req: { argent: 55 } },
      { name: "Groupe florissant", minAge: 42, salary: [65, 105], req: { argent: 75 } },
      { name: "Empire", minAge: 52, salary: [100, 180], req: { argent: 88 } }
    ]
  },
  retraite: {
    name: "Retraite",
    levels: [
      { name: "Retraité(e)", minAge: 66, salary: [18, 30], pension: true }
    ]
  }
};

function careerNext(state) {
  if (!state.career) return null;
  var track = CAREER_TRACKS[state.career.track];
  if (!track) return null;
  var lvl = track.levels[state.career.level];
  var idx = track.levels.indexOf(lvl);
  if (idx < track.levels.length - 1) return track.levels[idx + 1];
  return null;
}

function careerCanAdvance(state) {
  var next = careerNext(state);
  if (!next) return false;
  if (state.age < next.minAge) return false;
  if (next.req) {
    for (var k in next.req) {
      if (state.stats[k] < next.req[k]) return false;
    }
  }
  return true;
}

/* ------------------------------------------------------------
   RENCONTRES — banques de noms et tempéraments
   ------------------------------------------------------------ */
var NPC_NAMES = [
  "Léa", "Noah", "Emma", "Liam", "Chloé", "Hugo", "Inès", "Gabriel",
  "Louise", "Arthur", "Mila", "Raphaël", "Jade", "Louis", "Alice",
  "Nathan", "Zoé", "Tom", "Eva", "Adam", "Camille", "Sacha", "Lina",
  "Eden", "Rose", "Paul", "Lucie", "Marc", "Julia", "Nino"
];

var NPC_AMOUR_TRAITS = [
  "le regard chaleureux", "l'humour piquant", "la douceur désarmante",
  "l'énergie débordante", "la mélancolie fascinante", "le franc-parler",
  "la générosité sans fin", "l'esprit vif et taquin"
];

var NPC_AMI_TRAITS = [
  "toujours partant(e) pour l'aventure", "d'une loyauté à toute épreuve",
  "le rire contagieux", "l'écoute attentive", "l'optimisme béat",
  "le franc-parler rassurant", "la folie douce", "la sagesse tranquille"
];

function randomName() { return NPC_NAMES[Math.floor(Math.random() * NPC_NAMES.length)]; }
function randomTrait(type) {
  var pool = type === "amour" ? NPC_AMOUR_TRAITS : NPC_AMI_TRAITS;
  return pool[Math.floor(Math.random() * pool.length)];
}

var FAMILY_SURNAMES = [
  "Martin", "Bernard", "Dubois", "Moreau", "Laurent", "Girard", "Lambert",
  "Fontaine", "Rousseau", "Caron", "Marchand", "Duval", "Gauthier", "Perrin",
  "Lefèvre", "Chevalier", "Renaud", "Vasseur", "Bonnard", "Aubert", "Garnier",
  "Boucher", "Legrand", "Mercier", "Blondel", "Sauvage", "Valentin", "Robin"
];
var FAMILY_FIRST = [
  "Jean", "Pierre", "André", "Claude", "Marc", "René", "Louis", "Georges",
  "Julien", "François", "Étienne", "Antoine", "Michel", "Jacques", "Vincent"
];
function randomSurname() { return FAMILY_SURNAMES[Math.floor(Math.random() * FAMILY_SURNAMES.length)]; }
function randomParentName(gender) {
  var m = ["Jean", "Pierre", "André", "Claude", "Marc", "René", "Louis", "Georges", "Julien", "François", "Antoine", "Michel"];
  var f = ["Marie", "Anne", "Jeanne", "Louise", "Marguerite", "Françoise", "Catherine", "Sylvie", "Brigitte", "Monique", "Élise", "Hélène"];
  return gender === "f" ? f[Math.floor(Math.random() * f.length)] : m[Math.floor(Math.random() * m.length)];
}

/* ------------------------------------------------------------
   THÈMES VISUELS — un habillage différent selon la nature
   de l'événement (social, carrière, société, drame, famille…)
   ------------------------------------------------------------ */
var THEMES = {
  vie:       { label: "Quotidien",   icon: "🕊️" },
  carriere:  { label: "Carrière",    icon: "💼" },
  relation:  { label: "Relation",    icon: "💞" },
  social:    { label: "Social",      icon: "👥" },
  societe:   { label: "Société",     icon: "🏛️" },
  drame:     { label: "Drame",       icon: "⚡" },
  passion:   { label: "Passion",     icon: "✨" },
  argent:    { label: "Argent",      icon: "🪙" },
  sante:     { label: "Santé",       icon: "🩺" },
  famille:   { label: "Famille",     icon: "🏡" },
  aleatoire: { label: "Hasard",      icon: "🎲" }
};

function themeOf(e) {
  if (e.theme && THEMES[e.theme]) return e.theme;
  if (e.type === "carriere") return "carriere";
  if (e.type === "relation") return "relation";
  if (e.type === "crise") return "drame";
  if (e.type === "passion") return "passion";
  if (e.type === "aleatoire") return "aleatoire";
  if (e.type === "sante") return "sante";
  if (e.type === "famille") return "famille";
  if (e.type === "argent") return "argent";
  if (e.type === "social") return "social";
  if (e.type === "societe") return "societe";
  return "vie";
}

/* ------------------------------------------------------------
   ÉVÉNEMENTS DE CARRIÈRE
   ------------------------------------------------------------ */
ev("jeune", "negociation", "La négociation de salaire",
  "Votre patron vous fait asseoir. L'entretien annuel est l'occasion de peser vos arguments, et votre porte-monnaie vous souffle d'oser.",
  [
    { text: "Demander une augmentation, en toute franchise.",
      chance: 0.55, note: "Risque : le refus est possible.",
      goodEffects: { argent: [15, 30], bonheur: 5 },
      goodResult: "Vos arguments convainquent. Une belle hausse s'ajoute à votre paye.",
      badEffects: { social: -3, bonheur: -3 },
      badResult: "Le budget est serré, vous dit-on poliment. Vous ressortez déçu mais digne." },
    { text: "Garder vos ambitions pour plus tard.",
      effects: { bonheur: 2 }, result: "Vous prenez patience. Les murs écoutent mieux quand on revient plus fort." }
  ], { type: "carriere", requiresCareer: true });

ev("jeune", "formation", "La formation proposée",
  "Votre entreprise propose une formation coûteuse qui pourrait ouvrir des portes. Le temps, l'énergie, et l'argent en jeu.",
  [
    { text: "Saisir la formation, quitte à vous épuiser.",
      effects: { intelligence: 12, energie: -8, argent: -10, bonheur: 3 },
      result: "Des week-ends entiers à étudier. À la clé : de nouvelles compétences qui font briller votre CV.",
      careerBoost: true },
    { text: "Refuser, préserver votre équilibre.",
      effects: { bonheur: 5, energie: 5 }, result: "Vous gardez vos soirées. D'autres occasions viendront." }
  ], { type: "carriere", requiresCareer: true, once: false });

ev("adulte", "collegue-toxique", "Le collègue toxique",
  "Chaque réunion tourne au règlement de comptes. Un collègue vous sabote en douce, et l'ambiance devient étouffante.",
  [
    { text: "Affronter la situation, calmement et frontalement.",
      effects: { social: 8, sante: 3, bonheur: 5 },
      result: "Une conversation difficile, mais le poison s'évapore. On vous respecte davantage." },
    { text: "Changer d'équipe, sans faire de vagues.",
      effects: { argent: -5, energie: 5 }, result: "Vous glissez vers un autre pôle. Le soulagement vaut quelques économies." },
    { text: "Subir en silence, encaisser.",
      effects: { sante: -8, bonheur: -8 }, result: "Les nuits deviennent courtes. Le corps encaisse ce que la bouche tait." }
  ], { type: "carriere", requiresCareer: true });

ev("adulte", "promotion-carriere", "La promotion en vue",
  "Un poste supérieur se libère. Vos collègues murmurent votre nom, mais l'étape est haute.",
  [
    { text: "Postuler, toutes voiles dehors.",
      careerAdvance: true,
      goodEffects: { argent: [10, 20], bonheur: 10 },
      goodResult: "La direction tranche : promotion accordée. Vous grimpez d'un échelon.",
      badEffects: { bonheur: -5, energie: -5 },
      badResult: "Le poste échoit à quelqu'un d'autre. La déception pique, mais vous gardez la tête haute." },
    { text: "Rester à votre poste, l'équilibre avant tout.",
      effects: { bonheur: 5, energie: 5 }, result: "Vous préférez la paix aux galons. La sérénité est aussi une carrière." }
  ], { type: "carriere", requiresCareer: true, once: false });

ev("adulte", "opportunite-entrepreneur", "L'opportunité en or",
  "Un gros client se présente enfin. Mais il exige des garanties, des stocks, et une avance de trésorerie.",
  [
    { text: "Miser gros sur ce contrat.",
      chance: 0.5, note: "Gain potentiel important, risque de perte.",
      goodEffects: { argent: [35, 60], bonheur: 12 },
      goodResult: "Le contrat est signé. Vos comptes explosent, et la boîte décolle.",
      badEffects: { argent: -20, sante: -5, bonheur: -5 },
      badResult: "Le client se rétracte au dernier moment. La trésorerie saigne, vous resserrez la ceinture." },
    { text: "Négocier des garanties plus légères.",
      chance: 0.75, note: "Gain modéré, risque limité.",
      goodEffects: { argent: [15, 30], bonheur: 5 },
      goodResult: "Un accord plus prudent se dessine. La confiance, c'est bien, le contrat signé, c'est mieux.",
      badEffects: { argent: -8 },
      badResult: "Le client boude un peu, mais la boîte tient le coup." }
  ], { type: "carriere", requiresFlag: "entreprise" });

ev("adulte", "periode-creuse", "La période creuse",
  "Les commandes se tarissent. L'entreprise traverse une mauvaise passe, et la peur s'installe.",
  [
    { text: "Diversifier, trouver de nouveaux clients.",
      effects: { energie: -10, intelligence: 5, argent: [5, 15] },
      result: "Vous arpentez le marché, démarchant sans relâche. Les premières commandes reviennent." },
    { text: "Réduire les coûts, attendre la reprise.",
      effects: { argent: 5, bonheur: -5 }, result: "Chaque euro est compté. L'hiver sera long, mais la boîte respire." }
  ], { type: "carriere", requiresFlag: "entreprise" });

ev("maturite", "reconversion-carriere", "Le doute professionnel",
  "Après des années de routine, une question revient : est-ce vraiment là que vous vouliez finir ?",
  [
    { text: "Amorcer une reconversion progressive.",
      effects: { bonheur: 10, argent: -10, energie: -5 },
      result: "Des cours du soir, un nouveau réseau. Lentement, vous changez de cap sans sombrer.",
      careerBoost: true },
    { text: "Tenir jusqu'à la retraite, raisonnablement.",
      effects: { argent: 10, bonheur: -5 }, result: "La sécurité avant tout. Le costume reste, le rêve aussi." }
  ], { type: "carriere", requiresCareer: true });

/* ------------------------------------------------------------
   ÉVÉNEMENTS DE COUPLE — divorce, infidélité, profondeur des liens
   ------------------------------------------------------------ */
ev("adulte", "divorce", "La séparation",
  "Les mots ont cessé de se répondre. Les silences se sont installés, puis ont pris toute la place. Ce matin, vous avez parlé de la maison — et de tout le reste.",
  [
    { text: "Tenter de sauver ce qui peut l'être.",
      effects: { bonheur: -5, stress: 12, argent: -8 },
      result: "Vous essayez. Les mots restent prudents, mais quelque chose survit. Pas tout." },
    { text: "Prendre de la distance, doucement.",
      effects: { stress: 5, bonheur: 3 },
      result: "Vous prenez de la hauteur. La maison se vide doucement, sans bruit." },
    { text: "Signer la séparation, et recommencer ailleurs.",
      flag: "divorce", relation: { type: "amour", delta: -60 },
      effects: { stress: 10, bonheur: -12, argent: -15, social: -5 },
      result: "C'est signé. Vous êtes deux, à nouveau. La liberté a un goût de liberté amère." }
  ], { type: "relation", category: "divorce", requiresFlag: "marie", once: false });

ev("adulte", "tentation", "La tentation",
  "Quelqu'un croise votre route un soir un peu trop tard. Les yeux se posent, un peu trop longtemps. Vous savez comment cela se termine — et ce que cela vous coûtera.",
  [
    { text: "Ne rien dire. Laisser la porte entrouverte.",
      flag: "infidelite", relation: { type: "amour", delta: 5 },
      effects: { bonheur: 8, stress: 6 },
      result: "C'est arrivé. Le silence pèse plus lourd que la faute." },
    { text: "Repartir. Rester fidèle à ce que vous avez choisi.",
      relation: { type: "amour", delta: 12 },
      effects: { bonheur: 3, confiance: 8 },
      result: "Vous rentrez chez vous. Le soulagement est plus fort que le regret." },
    { text: "En parler, avant que cela n'éclate.",
      effects: { stress: 10, bonheur: -4, social: 4 },
      result: "La vérité, dite à moitié. Le couple vacille, mais il ne s'effondre pas." }
  ], { type: "relation", category: "infidelite", requiresRelation: { type: "amour", minBond: 30 }, once: false });

ev("jeune", "ami-proche", "L'ami que l'on garde",
  "Un message à 2 h du matin, une blague sortie au mauvais moment, un coup de main sans rien attendre. Vous comprenez que certaines présences ne se rattrapent pas.",
  [
    { text: "Lui rendre la pareille, sans compter.",
      relation: { type: "ami", delta: 25 },
      effects: { bonheur: 10, social: 6 },
      result: "L'amitié se densifie. Vous avez un roc, et il sait que vous êtes son appui aussi." },
    { text: "Laisser la relation se diluer, doucement.",
      relation: { type: "ami", delta: -12 },
      effects: { bonheur: -3 },
      result: "Les messages s'espacent. L'amitié reste, mais elle ne bat plus." }
  ], { type: "relation", category: "amitie", requiresRelation: { type: "ami", minBond: 25 }, once: false });

ev("adulte", "retour-aux-sources", "Les retrouvailles",
  "Un prénom sur une liste d'anciens élèves. Un café, puis un autre. Vous avancez, et pourtant ce sont les mêmes ponts, les mêmes histoires.",
  [
    { text: "Retrouver le chemin de l'amitié.",
      relation: { type: "ami", delta: 20 },
      effects: { bonheur: 8, social: 5 },
      result: "Le temps reprend ses marques. Vous repartez avec des rires et un numéro." },
    { text: "Rester sur une note agréable, sans plus.",
      effects: { bonheur: 3 },
      result: "C'était bien. Assez pour refermer la porte." }
  ], { type: "relation", once: false });

/* ------------------------------------------------------------
   ÉVÉNEMENTS DE RENCONTRE & RELATIONS
   ------------------------------------------------------------ */
ev("jeune", "rencontre", "Une rencontre inattendue",
  "Un événement anodin — un café renversé, un train partagé — et soudain, un échange qui accroche votre regard.",
  [
    { text: "Entamer la conversation, sans détour.",
      relation: { type: "amour", create: true, delta: 25 }, effects: { social: 8, bonheur: 5 },
      result: "Les mots se bousculent, puis s'apaisent. Quelque chose vient de naître." },
    { text: "Échanger quelques mots, rester léger.",
      relation: { type: "ami", create: true, delta: 12 }, effects: { social: 6 },
      result: "Une complicité s'esquisse, sans promesse. Peut-être un ami, peut-être plus." }
  ], { type: "relation", once: false });

ev("adulte", "rencontre-tardive", "Un regard au comptoir",
  "Trente ans, la routine bien installée. Et puis ce soir-là, à ce comptoir de bar, un regard qui déraille vos plans.",
  [
    { text: "Saisir l'occasion, coûte que coûte.",
      relation: { type: "amour", create: true, delta: 30 }, effects: { bonheur: 10, social: 6 },
      result: "Une discussion jusqu'à la fermeture. Certaines rencontres arrivent quand on ne les attend plus." },
    { text: "Sourire et passer votre chemin.",
      effects: { bonheur: -3 }, result: "Le souvenir de ce regard vous poursuivra un moment. Peut-être était-ce pour le mieux." }
  ], { type: "relation", once: false });

ev("jeune", "rencontre-soiree", "La soirée entre amis",
  "Une soirée improvisée, des verres, de la musique. Et soudain, vos regards se croisent au milieu des rires.",
  [
    { text: "Oser engager la conversation.",
      relation: { type: "amour", create: true, delta: 22 }, effects: { social: 8, bonheur: 6 },
      result: "Les mots s'enchaînent comme des notes. La soirée n'est plus comme les autres." },
    { text: "Laisser un ami faire le premier pas.",
      relation: { type: "ami", create: true, delta: 8 }, effects: { social: 5 },
      result: "Les présentations se font par procuration. La suite vous appartient." },
    { text: "Rester en retrait, observer.",
      effects: { bonheur: -2 }, result: "Le regard était là, mais l'audace est restée dans votre poche." }
  ], { type: "relation", notRelation: { type: "amour" }, once: false });

ev("jeune", "dating-app", "L'application de rencontres",
  "Un profil, des photos, des messages qui hésitent. Le dating moderne a ses codes et ses maladresses.",
  [
    { text: "Engager de vraies conversations, sincères.",
      relation: { type: "amour", create: true, delta: 18 }, effects: { social: 6, bonheur: 5 },
      result: "Une étincelle se dessine dans le flux des messages. Un café est envisagé." },
    { text: "Tester plusieurs rendez-vous, légèrement.",
      relation: { type: "ami", create: true, delta: 10 }, effects: { social: 6, bonheur: 4 },
      result: "Des cafés, des sourires, des silences. Vous apprenez ce que vous voulez." },
    { text: "Désinstaller, préférer le réel.",
      effects: { bonheur: 3 }, result: "Le vrai monde vous attend. Les rencontres se font parfois au marché." }
  ], { type: "relation", notRelation: { type: "amour" }, once: false });

ev("adulte", "rencontre-sport", "Le club de sport",
  "Au club, un(e) autre habitué(e) court sur le même tapis. Les foulées se synchronisent, les regards s'accrochent.",
  [
    { text: "S'entraîner ensemble, régulièrement.",
      relation: { type: "amour", create: true, delta: 20 }, effects: { sante: 8, social: 5 },
      result: "Les sessions deviennent des rendez-vous. L'effort rapproche." },
    { text: "Se lier d'amitié autour du sport.",
      relation: { type: "ami", create: true, delta: 15 }, effects: { sante: 6, social: 6 },
      result: "Des courses, des brunchs, des défis. Une complicité de vestiaire naît." },
    { text: "Garder votre routine, seul(e).",
      effects: { sante: 4 }, result: "Chacun son rythme. Les tapis restent parallèles." }
  ], { type: "relation", notRelation: { type: "amour" }, once: false });

ev("maturite", "amour-tardif", "L'amour à maturité",
  "Le célibat est installé, confortable. Et puis quelqu'un traverse votre route, sans crier gare.",
  [
    { text: "Ouvrir la porte à cette nouvelle chance.",
      relation: { type: "amour", create: true, delta: 30 }, effects: { bonheur: 12, social: 6 },
      result: "Les habitudes se bousculent. L'amour n'a pas d'âge, seulement du courage." },
    { text: "Apprécier la rencontre, sans plus.",
      relation: { type: "ami", create: true, delta: 15 }, effects: { bonheur: 6 },
      result: "Une belle amitié, un regard complice. Le cœur choisit ses batailles." },
    { text: "Fuir par peur de déranger vos habitudes.",
      effects: { bonheur: -5 }, result: "La solitude est une vieille amie. Elle vous rappelle à elle." }
  ], { type: "relation", notRelation: { type: "amour" }, once: false });

ev("jeune", "premier-rdv", "Le premier rendez-vous",
  "Un café, deux mains qui ne savent pas où se poser, et des silences qui parlent autant que les mots.",
  [
    { text: "Vous livrer à cœur ouvert.",
      relation: { type: "amour", delta: 25 }, effects: { bonheur: 8, social: 5 },
      result: "La confiance s'installe. Les heures filent sans qu'on les voie passer." },
    { text: "Garder une part de mystère.",
      relation: { type: "amour", delta: 10 }, effects: { social: 3 },
      result: "Un jeu subtil s'engage. L'envie de se revoir est là, intacte." }
  ], { type: "relation", requiresRelation: { type: "amour", minBond: 15 }, once: false });

ev("jeune", "dispute", "La dispute",
  "Un mot de trop, une rancune qui remonte, et la conversation tourne à l'aigre.",
  [
    { text: "Prendre du recul, puis revenir en douceur.",
      relation: { type: "amour", delta: 5 }, effects: { bonheur: 3 },
      result: "Le silence fait son œuvre. Au matin, la main se tend à nouveau." },
    { text: "Dire ce qui doit être dit, même si ça fait mal.",
      relation: { type: "amour", delta: 12 }, effects: { social: 6, bonheur: -3 },
      result: "Les non-dits s'évaporent. La relation ressort plus solide, plus vraie." },
    { text: "Claquer la porte et couper les ponts.",
      relation: { type: "amour", delta: -40 }, effects: { bonheur: -8 },
      result: "La porte claque. Le silence qui suit est lourd de tout ce qui aurait pu être." }
  ], { type: "relation", requiresRelation: { type: "amour", minBond: 15 }, once: false });

ev("adulte", "demande-mariage", "La grande demande",
  "L'idée fait son chemin depuis des mois. Une bague, un genou à terre, ou une simple phrase au coin du feu.",
  [
    { text: "Faire la demande, le cœur battant.",
      flag: "marie", relation: { type: "amour", delta: 30 }, effects: { bonheur: 15, social: 8 },
      result: "Un oui, des larmes, et des embrassades. Deux vies s'écrivent désormais à quatre mains." },
    { text: "Reporter encore, par prudence.",
      relation: { type: "amour", delta: -5 }, effects: { bonheur: -5 },
      result: "La question flotte dans l'air, sans réponse. Certains oui attendent leur heure." }
  ], { type: "relation", requiresRelation: { type: "amour", minBond: 30 }, notFlag: "marie", once: false });

ev("adulte", "naissance-enfant", "L'enfant tant attendu",
  "Une minuscule main serre votre doigt. Le monde entier tient dans ce berceau.",
  [
    { text: "Être présent à chaque instant.",
      relation: { type: "enfant", create: true, delta: 20 }, effects: { bonheur: 15, energie: -10 },
      result: "Les nuits courtes, les rires immenses. Vous découvrez l'amour sans condition." },
    { text: "Vous organiser, entre travail et maison.",
      relation: { type: "enfant", create: true, delta: 10 }, effects: { argent: 5, bonheur: 5 },
      result: "Une organisation millimétrée. L'enfant grandit, entouré, aimé." }
  ], { type: "relation", requiresFlag: "marie", once: false });

ev("adulte", "weekend-ensemble", "Le week-end à deux",
  "Un petit village, un hôtel au coin du feu, et le temps qui ralentit.",
  [
    { text: "Profiter de chaque minute, sans téléphone.",
      relation: { type: "amour", delta: 15 }, effects: { bonheur: 10, energie: 5 },
      result: "Des balades, des fous rires, des silences doux. L'amour se recharge." },
    { text: "Emporter vos dossiers, juste au cas où.",
      relation: { type: "amour", delta: 5 }, effects: { bonheur: 3, argent: 3 },
      result: "Le travail glisse entre les couvertures. Une ombre au tableau, mais l'instant reste." }
  ], { type: "relation", requiresRelation: { type: "amour", minBond: 25 }, once: false });

ev("maturite", "ami-retrouvailles", "Le vieil ami refait surface",
  "Un message inattendu : votre ami d'enfance passe en ville. Des décennies vous séparent de la dernière fois.",
  [
    { text: "Tout laisser tomber pour le retrouver.",
      relation: { type: "ami", create: true, delta: 25 }, effects: { bonheur: 12, social: 8 },
      result: "Deux heures plus tard, le temps n'existe plus. Les vrais liens survivent à tout." },
    { text: "Promettre de se voir, sans fixer de date.",
      effects: { bonheur: -3 }, result: "Les promesses s'envolent. Le rendez-vous reste un rêve de calendrier." }
  ], { type: "relation" });

ev("maturite", "defi-conjoint", "Le couple à l'épreuve",
  "Le quotidien s'est installé, avec ses habitudes et ses silences. Une complicité à raviver, ou un fossé qui se creuse.",
  [
    { text: "Réinventer des rituels à deux.",
      relation: { type: "amour", delta: 15 }, effects: { bonheur: 8 },
      result: "Un dîner aux chandelles, un cours de danse. L'étincelle se rallume doucement." },
    { text: "Accepter la routine, sereinement.",
      relation: { type: "amour", delta: 3 }, effects: { bonheur: 3 },
      result: "La tendresse tranquille des habitudes. Parfois, la paix vaut la flamme." }
  ], { type: "relation", requiresRelation: { type: "amour", minBond: 20 }, once: false });

/* ------------------------------------------------------------
   ÉVÉNEMENTS ALÉATOIRES
   ------------------------------------------------------------ */
ev("bebe", "al_etonnement", "La première neige",
  "Des flocons silencieux tombent sur le jardin. Vous tendez la main, émerveillé.",
  [
    { text: "Attraper un flocon, les yeux ronds.",
      effects: { bonheur: 8, intelligence: 3 }, result: "Le flocon fond dans votre main. Un mystère glacé et délicieux." }
  ], { type: "aleatoire", once: false, weight: 3 });

ev("enfance", "al_pluie", "L'orage",
  "Le ciel gronde, les gouttes martèlent les vitres. Le monde entier semble retenir son souffle.",
  [
    { text: "Compter les éclairs, fasciné.",
      effects: { intelligence: 5, bonheur: 3 }, result: "Un, deux, trois... le tonnerre roule. La peur devient spectacle." },
    { text: "Vous cacher sous la couverture.",
      effects: { sante: 3, bonheur: -3 }, result: "Blotti dans le cocon, vous attendez que le ciel se calme." }
  ], { type: "aleatoire", once: false, weight: 3 });

ev("ado", "al_loterie", "Le ticket de loterie",
  "Un ticket de grattage offert par un proche. Une pièce, un espoir, presque rien.",
  [
    { text: "Gratter, le cœur qui palpite.",
      chance: 0.2, note: "Gain rare, souvent nul.",
      goodEffects: { argent: [25, 60], bonheur: 10 },
      goodResult: "Incroyable : vous raflez la mise ! Le hasard vous sourit vraiment.",
      badEffects: { bonheur: -2 },
      badResult: "« Perdu » s'affiche. On grattait surtout pour le rêve." }
  ], { type: "aleatoire", once: false, weight: 2 });

ev("ado", "al_malentendu", "Le malentendu",
  "Une rumeur circule sur votre compte, déformée par les bouches à oreilles.",
  [
    { text: "Rétablir la vérité, calmement.",
      effects: { social: 5, bonheur: 3 }, result: "Les langues se dénouent. La vérité, dite sans colère, l'emporte." },
    { text: "Laisser dire, mépriser le bruit.",
      effects: { social: -5, bonheur: -3 }, result: "Le silence laisse la rumeur grossir. Elle finira par s'essouffler." }
  ], { type: "aleatoire", once: false, weight: 2 });

ev("jeune", "al_trouvaille", "Le trésor des puces",
  "Au marché aux puces, un bric-à-brac attire votre œil. Une vieille horloge, peut-être précieuse.",
  [
    { text: "L'acheter pour une bouchée de pain.",
      chance: 0.7, note: "Gain variable.",
      goodEffects: { argent: [10, 35], bonheur: 5 },
      goodResult: "Un expert la convoite : la pièce vaut bien plus que son prix. Belle prise !",
      badEffects: { argent: -10 },
      badResult: "L'horloge est un tas de rouille. Une leçon sur les apparences." }
  ], { type: "aleatoire", once: false, weight: 2 });

ev("jeune", "al_coup-mou", "Le coup de mou",
  "Une fatigue sourde vous tombe dessus en plein après-midi. Les paupières pèsent une tonne.",
  [
    { text: "Écouter votre corps et vous reposer.",
      effects: { energie: 10, sante: 3 }, result: "Une sieste salvatrice. Le corps dit merci en silence." },
    { text: "Enchaîner malgré tout, à la force du café.",
      effects: { energie: -5, sante: -3, argent: 3 }, result: "La journée s'achève en sursis. Le café a ses limites." }
  ], { type: "aleatoire", once: false, weight: 3 });

ev("jeune", "al_voisin", "Le nouveau voisin",
  "Un carton à la main, un inconnu emménage dans l'appartement d'à côté. Un sourire à lancer.",
  [
    { text: "Proposer un coup de main pour les cartons.",
      relation: { type: "ami", create: true, delta: 15 }, effects: { social: 8, bonheur: 5 },
      result: "Une conversation, un café, une amitié de palier qui s'installe." },
    { text: "Fermer la porte, sourire poli.",
      effects: { social: -2 }, result: "L'inconnu restera un visage de couloir. La politesse a des limites." }
  ], { type: "aleatoire", once: false, weight: 2 });

ev("adulte", "al_bonne-nouvelle", "La bonne nouvelle",
  "Un appel, un courrier, une nouvelle qui tombe à pic : quelque chose se passe bien, pour une fois.",
  [
    { text: "Célébrer, partager la joie.",
      effects: { bonheur: 10, social: 5 }, result: "Vous savourez l'instant, en bonne compagnie. La vie a de ces cadeaux." },
    { text: "L'encaisser, sobrement, en silence.",
      effects: { bonheur: 4 }, result: "Une satisfaction discrète. Vous la gardez comme un trésor secret." }
  ], { type: "aleatoire", once: false, weight: 3 });

ev("adulte", "al_panne", "La panne de transport",
  "Bloqué(e) sur le quai, le train annoncé en retard. Le temps s'étire, et l'agacement monte.",
  [
    { text: "Changer vos plans, en improvisant.",
      effects: { energie: -3, intelligence: 4 }, result: "Un autre itinéraire, une découverte au passage. Le détour a du bon." },
    { text: "Ronger votre frein, énervé(e).",
      effects: { bonheur: -5, energie: -3 }, result: "L'attente pèse. Vous arrivez avec une heure de retard et de mauvaise humeur." }
  ], { type: "aleatoire", once: false, weight: 2 });

ev("maturite", "al_inspiration", "L'éclair d'inspiration",
  "Sous la douche, pendant une promenade, une idée surgit, limpide et lumineuse.",
  [
    { text: "La noter immédiatement, où que vous soyez.",
      effects: { intelligence: 8, bonheur: 5 }, result: "Un bout de papier, une note vocale. L'idée est sauvée, et peut-être le projet avec." },
    { text: "Vous dire que vous vous en souviendrez.",
      effects: { intelligence: 2 }, result: "Bien sûr, vous ne vous en souvenez plus. L'inspiration a horreur de l'attente." }
  ], { type: "aleatoire", once: false, weight: 2 });

ev("retraite", "al_santepetite", "Le petit bobo",
  "Une douleur au dos, un genou qui grince. Les années rappellent leur présence en douceur.",
  [
    { text: "Consulter, sans attendre.",
      effects: { sante: 8, argent: -3 }, result: "Des soins, des étirements, un diagnostic clair. Le corps vous remercie." },
    { text: "Laisser passer, ça ira mieux demain.",
      effects: { sante: -6 }, result: "La douleur s'accroche. Certains maux attendent qu'on les prenne au sérieux." }
  ], { type: "aleatoire", once: false, weight: 3 });

ev("vieillesse", "al_souvenir", "Le souvenir qui remonte",
  "Une odeur de tarte, une chanson à la radio, et soudain trente ans vous tombent dessus.",
  [
    { text: "Partager ce souvenir à voix haute.",
      effects: { bonheur: 8, social: 5 }, result: "Le récit s'illumine devant un auditeur ému. Le passé devient un cadeau." },
    { text: "Le garder pour vous, comme une photographie.",
      effects: { bonheur: 3 }, result: "Vous souriez seul(e). Le souvenir reste intact, hors de portée du temps." }
  ], { type: "aleatoire", once: false, weight: 3 });

/* ------------------------------------------------------------
   CRISES (déclenchées quand une stat est critique)
   ------------------------------------------------------------ */
ev("ado", "crise_sante", "L'alerte du corps",
  "Votre corps tire la sonnette d'alarme. Les nuits sont courtes, les efforts deviennent des épreuves.",
  [
    { text: "Changer radicalement d'hygiène de vie.",
      effects: { sante: 15, energie: 8, argent: -5 }, result: "Sport, sommeil, assiette équilibrée. La remontée est lente mais certaine." },
    { text: "Consulter un médecin, sérieusement.",
      effects: { sante: 10, argent: -8 }, result: "Des examens, un traitement, un suivi. Le corps retrouve des couleurs." }
  ], { type: "crise", crisisCond: function (s) { return s.stats.sante < 25; }, once: false });

ev("ado", "crise_argent", "Le fond du porte-monnaie",
  "Les comptes sont au plus bas. Chaque dépense devient une décision douloureuse.",
  [
    { text: "Trouver une source de revenu supplémentaire.",
      effects: { argent: [10, 25], energie: -8 }, result: "Un job, une vente, un service rendu. La poche se regonfle petit à petit." },
    { text: "Réduire drastiquement vos dépenses.",
      effects: { argent: 8, bonheur: -5 }, result: "On coupe dans le superflu. La rigueur a un goût de survie." }
  ], { type: "crise", crisisCond: function (s) { return s.stats.argent < 10; }, once: false });

ev("ado", "crise_moral", "La grisaille intérieure",
  "Une tristesse sans nom vous enveloppe. Tout semble terne, lourd, inutile.",
  [
    { text: "En parler, à un proche, à un professionnel.",
      effects: { bonheur: 12, social: 5 }, result: "Les mots posés sur la peine l'allègent. Vous n'êtes plus seul(e) dans le noir." },
    { text: "S'occuper, se forcer à bouger.",
      effects: { bonheur: 8, energie: -5 }, result: "Le mouvement chasse un peu l'ombre. La lumière revient par fragments." }
  ], { type: "crise", crisisCond: function (s) { return s.stats.bonheur < 20; }, once: false });

ev("ado", "crise_energie", "L'épuisement",
  "Plus aucune étincelle. Le lit est votre seul horizon, et chaque matin semble un mur.",
  [
    { text: "Vous accorder une vraie pause.",
      effects: { energie: 15, sante: 5, argent: -3 }, result: "Quelques jours au ralenti. Le moteur se recharge en silence." },
    { text: "Pousser encore, encore un peu.",
      effects: { energie: -10, sante: -5 }, result: "Le corps finit par trancher : un arrêt brutal s'imposera de lui-même." }
  ], { type: "crise", crisisCond: function (s) { return s.stats.energie < 20; }, once: false });

ev("ado", "crise_social", "La solitude",
  "Les rendez-vous s'espacent, les messages restent sans réponse. Vous flottez dans une ville trop grande.",
  [
    { text: "Tendre la main, même maladroitement.",
      effects: { social: 10, bonheur: 5 }, result: "Un appel, une invitation. Le lien se retisse, maille par maille." },
    { text: "Vous replier sur vous-même.",
      effects: { social: -8, bonheur: -5 }, result: "Le silence s'épaissit. La solitude, à force, devient une habitude." }
  ], { type: "crise", crisisCond: function (s) { return s.stats.social < 12; }, once: false });

ev("adulte", "crise_burnout", "L'effondrement silencieux",
  "Vous qui teniez tout, vous ne tenez plus rien. Le travail, la maison, les autres — tout devient insurmontable.",
  [
    { text: "Demander un arrêt maladie, tout arrêter.",
      effects: { energie: 20, sante: 10, bonheur: -8, argent: -10 }, result: "Le médecin signe. Vous rentrez chez vous, vide. La reconstruction commence là." },
    { text: "En parler à votre direction, négocier.",
      effects: { energie: 8, bonheur: 5, social: 5 }, flag: "burnout_survivor", result: "Votre hiérarchie vous entend. Aménagement, télétravail, soutien. Vous tenez bon." },
    { text: "Tenir encore, par fierté ou peur.",
      effects: { energie: -15, sante: -10, bonheur: -10 }, result: "Le corps finit par casser net. L'arrêt sera plus long, la chute plus dure." }
  ], { type: "crise", crisisCond: function (s) { return s.stats.energie < 25 && s.stats.bonheur < 30 && s.career && s.career.level >= 2; }, once: false });

ev("adulte", "crise_deuil_amour", "Le cœur en miettes",
  "La personne qui partageait votre vie n'est plus là. Le silence de la maison vous assourdit.",
  [
    { text: "Traverser le deuil, un jour après l'autre.",
      effects: { bonheur: -5, social: -5 }, flag: "deuil_amour", result: "Les larmes, les photos, les silences. Le temps fait son œuvre, imperceptiblement." },
    { text: "Vous jeter dans le travail, l'action.",
      effects: { bonheur: -8, energie: -5, argent: 5, intelligence: 3 }, result: "L'activité noie la peine. Mais au fond, l'absence attend votre retour." },
    { text: "Chercher du sens ailleurs, partir.",
      effects: { bonheur: -3, social: 3, argent: -10 }, result: "Un voyage, un déménagement, une nouvelle vie. La fuite n'efface pas, elle déplace." }
  ], { type: "crise", crisisCond: function (s) { return s.stats.bonheur < 25 && s.relations.some(function(r){return r.type==="amour" && r.bond>50;}); }, once: false });

ev("maturite", "crise_sens", "Le vide du sens",
  "Réussite, confort, famille — tout est là. Et pourtant, une question persiste : tout ça, pour quoi ?",
  [
    { text: "Vous engager pour une cause qui vous dépasse.",
      effects: { bonheur: 8, social: 8 }, flag: "engage_cause", result: "Bénévolat, association, militantisme. Le sens revient par l'action donnée aux autres." },
    { text: "Explorer une passion oubliée, un rêve d'enfance.",
      effects: { bonheur: 10, energie: 5 }, result: "Peinture, musique, écriture, voyage. L'étincelle ravive la flamme." },
    { text: "Accepter le questionnement sans réponse immédiate.",
      effects: { bonheur: 3, intelligence: 3 }, result: "Parfois, ne pas savoir est la seule honnêteté. La vie continue de s'écrire." }
  ], { type: "crise", crisisCond: function (s) { return s.stats.bonheur < 40 && s.stats.intelligence > 60 && s.age > 45 && s.money > 50; }, once: false });

/* ------------------------------------------------------------
   LE MONDE PARALLÈLE — économie, société, climat
   ------------------------------------------------------------ */
var ECONOMY_STATES = {
  boom:      { name: "Expansion",   mult: 1.15, desc: "Le pays prospère, l'argent circule." },
  normal:    { name: "Stable",      mult: 1.0,  desc: "Une économie équilibrée." },
  recession: { name: "Ralentissement", mult: 0.85, desc: "Les affaires se contractent." },
  crisis:    { name: "Crise",       mult: 0.7,  desc: "La récession frappe durement." }
};

function worldStart() {
  var r = Math.random();
  var economy = r < 0.15 ? "boom" : (r < 0.8 ? "normal" : "recession");
  return {
    economy: economy,
    inflation: 1 + Math.floor(Math.random() * 5),
    event: null,
    eventHistory: []
  };
}

function economyEvolve(world) {
  var r = Math.random();
  if (world.economy === "boom") { if (r < 0.3) world.economy = "normal"; }
  else if (world.economy === "normal") {
    if (r < 0.12) world.economy = "boom";
    else if (r < 0.22) world.economy = "recession";
  }
  else if (world.economy === "recession") {
    if (r < 0.35) world.economy = "normal";
    else if (r < 0.5) world.economy = "crisis";
  }
  else { if (r < 0.45) world.economy = "recession"; }
  world.inflation = clampInt(world.inflation + Math.floor(Math.random() * 5) - 2, 0, 10);
}

function clampInt(v, min, max) { return Math.max(min, Math.min(max, Math.round(v))); }

var WORLD_EVENTS = [
  { id: "pandemie", title: "Une pandémie frappe", kind: "Société",
    text: "Un virus se propage. Confinements, hôpitaux saturés, et une économie à l'arrêt pendant des mois.",
    effects: { sante: -8, bonheur: -5 }, incomeMult: 0.75, expenses: 0, weight: 2, once: true, minAge: 8 },
  { id: "canicule", title: "La canicule", kind: "Climat",
    text: "Des semaines de chaleur écrasante. La ville suffoque, les coûts de climatisation explosent.",
    effects: { sante: -5, energie: -6 }, incomeMult: 1, expenses: 2, weight: 8, once: false, minAge: 4 },
  { id: "inondations", title: "Les inondations", kind: "Climat",
    text: "Des fleuves en crue, des quartiers sous l'eau. La reconstruction coûte cher.",
    effects: { sante: -3, bonheur: -4 }, incomeMult: 0.95, expenses: 3, weight: 6, once: false, minAge: 5 },
  { id: "boom-tech", title: "L'explosion technologique", kind: "Économie",
    text: "Une vague d'innovations déferle. Les entreprises embauchent, les salaires montent.",
    effects: { intelligence: 4 }, incomeMult: 1.2, expenses: 0, weight: 6, once: false, minAge: 12 },
  { id: "elections", title: "Des élections historiques", kind: "Politique",
    text: "Le pays entier se passionne pour le scrutin. On ne parle que de ça au travail comme à la maison.",
    effects: { social: 4, bonheur: 2 }, incomeMult: 1, expenses: 0, weight: 8, once: false, minAge: 10 },
  { id: "greve", title: "La grève générale", kind: "Société",
    text: "Les transports s'arrêtent, les usines tournent au ralenti. La solidarité se réveille.",
    effects: { social: 3, energie: -4 }, incomeMult: 0.9, expenses: 1, weight: 7, once: false, minAge: 8 },
  { id: "renouveau-culturel", title: "Un renouveau culturel", kind: "Culture",
    text: "Galerie, concerts, théâtres : une effervescence créative s'empare de la ville.",
    effects: { bonheur: 6, social: 4 }, incomeMult: 1, expenses: 0, weight: 6, once: false, minAge: 10 },
  { id: "crise-immobiliere", title: "La bulle immobilière éclate", kind: "Économie",
    text: "Les prix de l'immobilier s'effondrent. Ceux qui avaient acheté perdent gros, les locataires soufflent.",
    effects: { bonheur: -3 }, incomeMult: 0.9, expenses: -2, weight: 5, once: false, minAge: 18 },
  { id: "maree-noire", title: "La marée noire", kind: "Climat",
    text: "Une catastrophe écologique souille les côtes. Le tourisme et la pêche s'effondrent.",
    effects: { sante: -3, bonheur: -4 }, incomeMult: 0.95, expenses: 1, weight: 4, once: false, minAge: 6 },
  { id: "hiver-centenaire", title: "L'hiver centenaire", kind: "Climat",
    text: "Un froid record, des routes bloquées, des factures d'énergie en flèche.",
    effects: { energie: -5, sante: -2 }, incomeMult: 1, expenses: 2, weight: 6, once: false, minAge: 4 },
  { id: "festival", title: "Un festival international", kind: "Culture",
    text: "La ville accueille un grand festival. Les rues vibrent de musique et de rencontres.",
    effects: { bonheur: 6, social: 5 }, incomeMult: 1, expenses: 0, weight: 6, once: false, minAge: 12 },
  { id: "greve-transports", title: "La grève des transports", kind: "Société",
    text: "Métros et bus à l'arrêt. Chaque trajet devient une expédition.",
    effects: { energie: -4 }, incomeMult: 1, expenses: 1, weight: 7, once: false, minAge: 8 },
  { id: "episode-pollution", title: "La grande alerte à la pollution", kind: "Climat",
    text: "Un pic de pollution asphyxie la ville. Masques, alertes, et rues désertes.",
    effects: { sante: -4, bonheur: -3 }, incomeMult: 0.97, expenses: 1, weight: 6, once: false, minAge: 4 },
  { id: "nouvelle-mine", title: "Une découverte qui change tout", kind: "Économie",
    text: "Une ressource rare est découverte dans la région. La région s'enrichit, les salaires suivent.",
    effects: { argent: 6 }, incomeMult: 1.1, expenses: 0, weight: 5, once: false, minAge: 14 }
];

/* ------------------------------------------------------------
   LOGEMENT — coûts de vie
   ------------------------------------------------------------ */
var HOUSING = {
  parents:        { name: "Chez les parents",   cost: 0,  buy: 0 },
  coloc:          { name: "Colocation",         cost: 4,  buy: 0 },
  location:       { name: "Location (T2)",      cost: 7,  buy: 0 },
  proprio_appart: { name: "Appartement acheté", cost: 9,  buy: -45 },
  proprio_maison: { name: "Maison achetée",     cost: 13, buy: -90 },
  grande_maison:  { name: "Grande maison",      cost: 18, buy: -150 }
};

/* ------------------------------------------------------------
   RYTHME DE VIE — nombre d'actions par an
   ------------------------------------------------------------ */
var STAGE_SLOTS = {
  bebe: 1, enfance: 1, ado: 2, jeune: 3, adulte: 3, maturite: 2, retraite: 2, vieillesse: 1
};

function slotsForAge(age) {
  return STAGE_SLOTS[stageForAge(age)] || 1;
}

/* ------------------------------------------------------------
   PASSIONS
   ------------------------------------------------------------ */
var PASSION_DEFS = {
  peinture: { name: "Peinture", icon: "🎨" },
  musique:  { name: "Musique",  icon: "🎵" },
  ecriture: { name: "Écriture", icon: "✒️" },
  sport:    { name: "Sport",    icon: "🏃" },
  cuisine:  { name: "Cuisine",  icon: "🍳" },
  technologie: { name: "Technologie", icon: "💻" },
  nature:   { name: "Nature",   icon: "🌲" },
  theatre:  { name: "Théâtre",  icon: "🎭" }
};

/* ------------------------------------------------------------
   DESTINS EXTRAORDINAIRES — opportunités émergentes
   (ne se choisissent pas au départ : elles se débloquent
    en franchissant des seuils de compétences / appétences)
   ------------------------------------------------------------ */
var OPPORTUNITIES = [
  {
    id: "artiste", path: "Artiste reconnu", ageMin: 24, ageMax: 40,
    cond: function (s) {
      return (s.passions.peinture >= 4 || s.passions.musique >= 4 || s.passions.ecriture >= 4) && s.stats.social >= 50 && s.stats.bonheur >= 45;
    },
    intro: "Vos créations circulent, votre nom revient dans les conversations. Une galerie de la capitale demande à vous rencontrer.",
    choices: [
      { text: "Accepter de vous exposer et franchir le pas.", effects: { bonheur: 12, social: 8 }, result: "Le vernissage est un triomphe. Votre nom s'écrit désormais en lettres de lumière." },
      { text: "Rester discret, créer pour le plaisir.", effects: { bonheur: 8 }, result: "L'atelier reste votre royaume. Certains talents aiment l'ombre." }
    ]
  },
  {
    id: "explorateur", path: "Grand explorateur", ageMin: 26, ageMax: 45,
    cond: function (s) {
      return s.stats.energie >= 75 && s.stats.sante >= 70 && s.passions.nature >= 3 && s.stats.argent >= 40;
    },
    intro: "Vous avez marché là où d'autres n'osent pas. Une fondation d'expéditions cherche un(e) chef(fe) pour une mission au bout du monde.",
    choices: [
      { text: "Accepter la mission, le sac prêt.", effects: { bonheur: 12, energie: 8, sante: -3 }, result: "Des mois hors du monde, des sommets, des rencontres. Vous rentrez avec une carte dessinée de vos propres mains." },
      { text: "Refuser : vos racines sont ici.", effects: { bonheur: 5 }, result: "Le grand départ reste un rêve. Vous accompagnez d'autres explorateurs de loin." }
    ]
  },
  {
    id: "politique", path: "Voix politique", ageMin: 32, ageMax: 52,
    cond: function (s) {
      if (s.flags.indexOf("associatif") === -1) return false;
      if (s.stats.social < 85 || s.stats.intelligence < 75) return false;
      if (!s.career) return false;
      if (s.career.level < 2 && !(s.origin && s.origin.flag === "famille_pouvoir")) return false;
      return true;
    },
    intro: "Votre engagement associatif est remarqué. Un parti vous propose de mener une liste aux prochaines élections locales.",
    choices: [
      { text: "Accepter de vous lancer en politique.", effects: { social: 12, energie: -8, bonheur: 5 }, result: "Campagne, tribunes, débats. Le pouvoir s'effleure, la responsabilité s'installe." },
      { text: "Décliner : agir dans l'ombre suffit.", effects: { social: 5 }, result: "Vous continuez votre combat de terrain, loin des estrades." }
    ]
  },
  {
    id: "celebrite", path: "Célébrité", ageMin: 22, ageMax: 35,
    cond: function (s) {
      return (s.passions.theatre >= 4 || s.passions.musique >= 4) && s.stats.social >= 60;
    },
    intro: "Un casting, une scène, et le public en veut plus. Des producteurs vous proposent un contrat qui pourrait tout changer.",
    choices: [
      { text: "Signer et entrer dans la lumière.", effects: { bonheur: 10, social: 10, sante: -5 }, result: "Le succès arrive vite, les paparazzis plus vite encore. La vie change de dimension." },
      { text: "Garder la scène pour le plaisir.", effects: { bonheur: 8 }, result: "Vous refusez la machine à célébrité. L'art reste pur, et la vie tranquille." }
    ]
  },
  {
    id: "philanthrope", path: "Mécène", ageMin: 40, ageMax: 60,
    cond: function (s) {
      return s.stats.argent >= 88 && s.stats.social >= 60 && s.money >= 220;
    },
    intro: "Votre fortune est faite. Des projets solidaires frappent à votre porte, cherchant une main généreuse et un nom qui compte.",
    choices: [
      { text: "Créer votre fondation, donner un sens à l'argent.", effects: { bonheur: 15, argent: -20, social: 10 }, result: "Votre nom devient un levier pour des causes qui vous dépassent. L'argent trouve enfin sa raison d'être." },
      { text: "Profiter de votre richesse en privé.", effects: { bonheur: 5 }, result: "Le coffre est plein, l'âme un peu moins. Le confort a ses limites." }
    ]
  },
  {
    id: "genie", path: "Génie du domaine", ageMin: 30, ageMax: 55,
    cond: function (s) {
      return s.stats.intelligence >= 85 && s.career && s.career.track === "etudes";
    },
    intro: "Vos travaux font date. Une institution de premier plan vous propose une chaire, et vos recherches attirent l'attention du monde entier.",
    choices: [
      { text: "Accepter la chaire et pousser la recherche.", effects: { intelligence: 10, bonheur: 10, energie: -8 }, result: "Des prix, des colloques, des étudiants admiratifs. Vous devenez une référence." },
      { text: "Rester au laboratoire, humble et curieux.", effects: { intelligence: 6, bonheur: 6 }, result: "La lumière vous dérange. La science avance aussi dans l'ombre." }
    ]
  }
];

/* ------------------------------------------------------------
   ÉVÉNEMENTS DE PASSION
   ------------------------------------------------------------ */
ev("enfance", "passion-peinture", "Les couleurs s'éveillent",
  "Une boîte de peinture traîne au grenier. Vous ouvrez les pots, et le monde devient soudain plus lumineux.",
  [
    { text: "Peindre toute la journée, mains tachées.",
      passion: "peinture", passionDelta: 2, effects: { bonheur: 6, intelligence: 3 },
      result: "Des gribouillis, puis des formes. La peinture vous parle, et vous lui répondez." },
    { text: "Préférer le vélo et le plein air.",
      passion: "sport", passionDelta: 2, effects: { sante: 5, bonheur: 4 },
      result: "Le vent dans les cheveux, les jambes qui pédalent. Le corps s'exprime à sa façon." }
  ], { type: "passion", once: false });

ev("ado", "passion-musique-2", "Une partition trouvée",
  "Dans une brocante, une vieille partition attire votre œil. Des notes qui attendent des doigts.",
  [
    { text: "Apprendre à la déchiffrer, note après note.",
      passion: "musique", passionDelta: 2, effects: { intelligence: 5, bonheur: 5 },
      result: "Le solfège devient une langue. Une mélodie s'élève enfin de vos mains." },
    { text: "L'offrir à quelqu'un qui en jouera.",
      passion: "musique", passionDelta: 1, effects: { social: 5 },
      result: "Votre geste touche. La musique voyage aussi par les cadeaux." }
  ], { type: "passion", once: false });

ev("ado", "passion-ecriture", "Le carnet secret",
  "Un cahier vierge, un stylo, et des histoires qui se bousculent dans votre tête.",
  [
    { text: "Écrire chaque soir, en secret.",
      passion: "ecriture", passionDelta: 2, effects: { intelligence: 5, bonheur: 6 },
      result: "Des pages remplies de mondes. Votre imagination trouve sa voix." },
    { text: "Partager vos textes avec un ami.",
      passion: "ecriture", passionDelta: 1, effects: { social: 6 },
      result: "Il en redemande. Vos mots trouvent un premier lecteur." }
  ], { type: "passion", once: false });

ev("jeune", "passion-aventure", "L'appel du lointain",
  "Une carte du monde au mur, un documentaire à la télé. Quelque chose vous tire vers l'horizon.",
  [
    { text: "Réserver un trek aventureux.",
      passion: "nature", passionDelta: 2, effects: { energie: 8, sante: 5, argent: -8 },
      result: "Des sommets, des nuits à la belle étoile. Le monde vous tend les bras." },
    { text: "Mettre de côté pour un grand voyage.",
      passion: "nature", passionDelta: 1, effects: { argent: 5 },
      result: "La tirelire gonfle. L'horizon attend son heure." }
  ], { type: "passion", once: false });

ev("adulte", "passion-cuisine", "Le soufflé qui ne retombe pas",
  "Un livre de recettes hérité, une envie soudaine. La cuisine devient un laboratoire de bonheur.",
  [
    { text: "Cuisiner pour les autres, sans compter.",
      passion: "cuisine", passionDelta: 2, effects: { social: 7, bonheur: 6 },
      result: "Des tablées se réunissent autour de vos plats. Vous régalez les cœurs et les estomacs." },
    { text: "Expérimenter seul(e), sans témoin.",
      passion: "cuisine", passionDelta: 1, effects: { bonheur: 4 },
      result: "Des échecs fumants, des réussites parfaites. Votre palais est le seul juge." }
  ], { type: "passion", once: false });

ev("jeune", "passion-tech", "Le code qui prend vie",
  "Un terminal noir, quelques lignes, et une page web apparaît. La magie de l'ordinateur vous happe.",
  [
    { text: "Apprendre à coder en autodidacte.",
      passion: "technologie", passionDelta: 2, effects: { intelligence: 8, energie: -5 },
      result: "Des nuits entières sur des bugs. Chaque programme qui marche est une petite victoire." },
    { text: "S'informer sur les nouvelles technologies.",
      passion: "technologie", passionDelta: 1, effects: { intelligence: 5 },
      result: "Vous suivez l'actualité, fasciné. Le futur vous intéresse autant qu'il vous amuse." }
  ], { type: "passion", once: false });

ev("ado", "passion-theatre", "Les planches appellent",
  "Une pièce à monter au lycée. Des rôles à distribuer, un texte à faire vivre.",
  [
    { text: "Monter sur scène, cœur battant.",
      passion: "theatre", passionDelta: 2, effects: { social: 8, bonheur: 5 },
      result: "Le trac, puis l'ivresse. Les applaudissements vous portent, vous êtes ailleurs." },
    { text: "Écrire la pièce plutôt que la jouer.",
      passion: "theatre", passionDelta: 1, effects: { intelligence: 5 },
      result: "Les dialogues naissent de votre plume. La scène se joue dans vos mots." }
  ], { type: "passion", once: false });

ev("enfance", "passion-sport", "Les baskets neuves",
  "Des chaussures neuves, un stade qui sent l'herbe coupée. Votre corps demande à courir.",
  [
    { text: "Courir, sauter, vous dépasser.",
      passion: "sport", passionDelta: 2, effects: { sante: 6, energie: 6 },
      result: "Le souffle court, le cœur qui cogne. Votre corps devient votre terrain de jeu." },
    { text: "Regarder les autres jouer, rêveur(se).",
      passion: "sport", passionDelta: 1, effects: { bonheur: 3 },
      result: "Sur le banc, vous vivez les matchs par procuration. Un jour, peut-être." }
  ], { type: "passion", once: false });

/* Moments forts d'une passion (débloqués par paliers) */
ev("jeune", "passion-expo-locale", "La première expo",
  "Votre passion pour la peinture vous a mené plus loin que prévu. Une petite galerie accepte vos toiles.",
  [
    { text: "Exposer, même si la salle est vide.",
      effects: { bonheur: 10, social: 6 }, result: "Trois visiteurs, dont un acheteur. Le premier accrochage de votre vie." },
    { text: "Reporter : les toiles ne sont pas prêtes.",
      effects: { bonheur: -3 }, result: "La galerie patiente. Les toiles finiront par être prêtes, un jour." }
  ], { type: "passion", requiresPassion: { peinture: 3 } });

ev("adulte", "passion-concert", "Le concert du quartier",
  "Votre pratique musicale devient publique : une scène de quartier vous invite à jouer.",
  [
    { text: "Jouer, les mains un peu tremblantes.",
      effects: { bonheur: 10, social: 8 }, result: "Les premières notes, puis la confiance. Le public applaudit votre courage." },
    { text: "Préférer écouter les autres jouer.",
      effects: { bonheur: 4 }, result: "Vous applaudissez les autres. La scène vous attendra." }
  ], { type: "passion", requiresPassion: { musique: 4 } });

ev("adulte", "passion-roman", "Le manuscrit terminé",
  "Des années d'écriture, et voilà : le manuscrit est fini. Qu'en faire maintenant ?",
  [
    { text: "L'envoyer à un éditeur.",
      effects: { bonheur: 8, intelligence: 5 }, result: "Une réponse, un oui, un contrat. Votre roman trouvera des lecteurs." },
    { text: "Le garder dans le tiroir, comme un trésor.",
      effects: { bonheur: 4 }, result: "Le manuscrit dort. Écrire était l'essentiel." }
  ], { type: "passion", requiresPassion: { ecriture: 5 } });

/* ------------------------------------------------------------
   VIES EXTRAORDINAIRES — événements selon le destin choisi
   ------------------------------------------------------------ */
ev("adulte", "extra-artiste", "Sous les projecteurs",
  "Depuis que votre art est reconnu, chaque semaine apporte son lot de vernissages et d'entretiens.",
  [
    { text: "Savourer la reconnaissance, modestement.",
      effects: { bonheur: 10, social: 5 }, result: "Le public aime votre œuvre, et vous restez l'artisan que vous étiez." },
    { text: "Laisser la notoriété monter à la tête.",
      effects: { social: 8, sante: -4, bonheur: 2 }, result: "Les soirées s'enchaînent, l'art s'étiole. La gloire a un coût." }
  ], { type: "vie", requiresLife: "Artiste reconnu", once: false });

ev("adulte", "extra-explorateur", "La mission des confins",
  "Chaque expédition repousse vos limites. Un sommet jamais gravi vous appelle, même si le risque est réel.",
  [
    { text: "Tenter le sommet, prudence en poche.",
      effects: { bonheur: 12, sante: -5, argent: 8 }, result: "L'ascension est rude, la vue inoubliable. Vous gravissez des sommets que peu ont vus." },
    { text: "Dresser la carte pour les autres.",
      effects: { intelligence: 6, bonheur: 5 }, result: "Vos relevés guident les prochains. L'exploration est aussi une science." }
  ], { type: "vie", requiresLife: "Grand explorateur", once: false });

ev("adulte", "extra-politique", "Le grand débat",
  "Un débat public se prépare. Vos idées vont être portées devant des centaines de citoyens.",
  [
    { text: "Affronter le débat, arguments en main.",
      effects: { social: 10, intelligence: 5, energie: -5 }, result: "Les micros, les attaques, les applaudissements. Vous tenez votre place, et vos idées avancent." },
    { text: "Préparer une allocution soignée.",
      effects: { intelligence: 6, social: 6 }, result: "Un discours mesuré, qui porte. Parfois, les mots calmes font le plus de chemin." }
  ], { type: "vie", requiresLife: "Voix politique", once: false });

ev("adulte", "extra-celebrite", "Dans la lumière des projecteurs",
  "Votre notoriété s'étend. Les invitations pleuvent, le public vous réclame.",
  [
    { text: "Accepter la célébrité, avec ses excès.",
      effects: { social: 8, argent: 10, sante: -5 }, result: "Des paillettes, des contrats, des journées sans fin. La vie est une scène continue." },
    { text: "Protéger votre vie privée, fermement.",
      effects: { bonheur: 8, social: -3 }, result: "Vous gardez votre jardin secret. La star brille, la personne respire." }
  ], { type: "vie", requiresLife: "Célébrité", once: false });

ev("maturite", "extra-philanthrope", "La fondation grandit",
  "Votre fondation finance des projets dans le monde entier. Chaque choix de don change des vies.",
  [
    { text: "Soutenir l'éducation, pour les générations futures.",
      effects: { bonheur: 12, argent: -15, social: 5 }, result: "Des écoles ouvrent, des enfants apprennent. Votre nom devient une porte." },
    { text: "Financer la recherche médicale.",
      effects: { bonheur: 10, argent: -15 }, result: "Des laboratoires avancent grâce à vous. La science vous doit une part de ses progrès." }
  ], { type: "vie", requiresLife: "Mécène", once: false });

ev("maturite", "extra-genie", "Le prix du savoir",
  "Vos travaux sont cités dans le monde entier. Une cérémonie prestigieuse vous honore.",
  [
    { text: "Recevoir la distinction, émotion gardée.",
      effects: { bonheur: 12, intelligence: 6 }, result: "Le trophée est lourd, les applaudissements immenses. Une vie de curiosité récompensée." },
    { text: "Dédier le prix à vos étudiants.",
      effects: { bonheur: 10, social: 8 }, result: "La reconnaissance retombe sur les autres. Votre école rayonne de votre lumière." }
  ], { type: "vie", requiresLife: "Génie du domaine", once: false });

/* ------------------------------------------------------------
   LOGEMENT — choix
   ------------------------------------------------------------ */
ev("jeune", "choix-logement", "Trouver un toit",
  "Le moment est venu de quitter le nid familial. Les options se comptent en mètres carrés et en loyers.",
  [
    { text: "Partager une colocation, pour les économies.",
      housing: "coloc", effects: { social: 6, argent: 4 }, result: "Trois chambres, un frigo partagé. La vie en communauté a ses codes." },
    { text: "Louer un petit studio, tout à vous.",
      housing: "location", effects: { argent: -4, bonheur: 4 }, result: "Quatre murs, une liberté totale. Le loyer pèse, la liberté aussi." },
    { text: "Rester chez vos parents pour économiser.",
      housing: "parents", effects: { argent: 6, social: -3 }, result: "Le portefeuille respire, l'autonomie patiente." }
  ], { type: "vie" });

ev("adulte", "acheter-logement", "Acheter, louer, ou continuer ?",
  "Les prix immobiliers s'affichent en vitrine. La banque étudie votre dossier, et votre épargne parle.",
  [
    { text: "Acheter un appartement, poser vos fondations.",
      housing: "proprio_appart", effects: { argent: -20, bonheur: 8 }, result: "Les clés, les murs, l'emprunt. Vous posez enfin vos valises pour de bon." },
    { text: "Acheter une maison avec jardin.",
      housing: "proprio_maison", effects: { argent: -35, bonheur: 10 }, result: "Un potager, des étages, des projets de travaux. La grande étape de la vie adulte." },
    { text: "Rester locataire, garder de la mobilité.",
      housing: "location", effects: { argent: 8, bonheur: 2 }, result: "Partir vite est un luxe. Mais le mur à repeindre n'est jamais le vôtre." }
  ], { type: "vie", requiresCareer: true });

ev("maturite", "reduire-logement", "Le nid devenu trop grand",
  "La maison résonne. Les pièces sont vides, et l'entretien coûte de plus en plus cher.",
  [
    { text: "Vendre et réduire la surface.",
      housing: "location", effects: { argent: 20, bonheur: 4 }, result: "Plus léger, plus simple. La vie se range dans moins de mètres carrés." },
    { text: "Garder la maison, coûte que coûte.",
      effects: { argent: -8, bonheur: 6 }, result: "Les souvenirs valent bien quelques travaux. La maison garde son âme." }
  ], { type: "vie", requiresCareer: true });

/* ------------------------------------------------------------
   RELATIONS — plus de liberté
   ------------------------------------------------------------ */
ev("jeune", "rupture", "La rupture",
  "La flamme s'éteint. Les projets communs se fissurent, et la question devient : rester ou partir ?",
  [
    { text: "Rompre proprement, sans rancune.",
      relation: { type: "amour", delta: -100 }, effects: { bonheur: -6, social: 3 },
      result: "Un dernier café, des mots sincères. La page se tourne, sans déchirure." },
    { text: "S'éloigner doucement, laisser glisser.",
      relation: { type: "amour", delta: -60 }, effects: { bonheur: -4 },
      result: "Les appels s'espacent, les silences s'allongent. L'histoire s'éteint comme une braise." },
    { text: "Retrouver la flamme, ensemble.",
      relation: { type: "amour", delta: 15 }, effects: { bonheur: 8 },
      result: "Une conversation à cœur ouvert. Vous choisissez de vous réinventer à deux." }
  ], { type: "relation", requiresRelation: { type: "amour", minBond: 20 }, once: false });

ev("adulte", "second-amour", "Un autre regard",
  "Le couple bat de l'aile, et quelqu'un d'autre croise votre chemin. Les sentiments se brouillent.",
  [
    { text: "Explorer cette nouvelle attirance.",
      relation: { type: "amour", create: true, delta: 25 }, effects: { bonheur: 10, social: -5 },
      result: "Un tourbillon nouveau s'engage. Mais le cœur a maintenant deux poids." },
    { text: "Rester fidèle à votre engagement.",
      relation: { type: "amour", delta: 8 }, effects: { bonheur: 5 },
      result: "Vous choisissez la stabilité. La tentation s'éloigne, la confiance grandit." }
  ], { type: "relation", requiresRelation: { type: "amour", minBond: 20 }, once: false });

ev("ado", "ami-complice", "Le complice du banc",
  "Dans la cour, un regard complice. Vous n'êtes pas encore amis, mais ça s'entend déjà.",
  [
    { text: "Lancer une blague pour briser la glace.",
      relation: { type: "ami", create: true, delta: 20 }, effects: { social: 7, bonheur: 5 },
      result: "Le fou rire s'installe. Un ami pour la vie vient de naître." },
    { text: "Saluer d'un geste, garder vos distances.",
      effects: { social: -2 }, result: "Le geste reste en suspens. Les amitiés, parfois, passent à côté." }
  ], { type: "relation", once: false });

/* ------------------------------------------------------------
   ÉVÉNEMENTS GÉNÉRIQUES (répétables — remplissent les années)
   ------------------------------------------------------------ */
ev("jeune", "gen_cafe", "Le café du matin",
  "Un café au comptoir, le journal qui s'ouvre, la journée qui commence. Rien d'extraordinaire, et pourtant tout.",
  [
    { text: "Prendre le temps, savourer l'instant.",
      effects: { bonheur: 4 }, result: "Le café est chaud, la matinée douce. Le bonheur se cache dans les petits gestes." },
    { text: "Avaler en courant, la journée presse.",
      effects: { energie: 3 }, result: "Le café file, le monde aussi. Vous rattrapez votre retard." },
    { text: "Appeler un proche pendant la pause.",
      relation: { type: "ami", delta: 4 }, effects: { social: 4, bonheur: 3 },
      result: "Dix minutes de nouvelles, de rires. La distance s'efface au fil des mots." }
  ], { type: "vie", once: false });

ev("jeune", "gen_marche", "La promenade du soir",
  "Une rue, un parc, le ciel qui rosit. Votre tête tourne, vos jambes marchent toutes seules.",
  [
    { text: "Marcher longtemps, sans destination.",
      effects: { bonheur: 5, sante: 3 }, result: "Les pensées se rangent au fil des pas. Le soir vous apaise." },
    { text: "Rentrer vite, profiter du canapé.",
      effects: { bonheur: 3 }, result: "Le canapé vous attend, la télé aussi. Le repos a ses vertus." }
  ], { type: "vie", once: false });

ev("retraite", "gen_jardin", "Le jardin du matin",
  "Le jardin demande ses soins quotidiens. Les mains dans la terre, le temps n'existe plus.",
  [
    { text: "Planter, arroser, biner avec patience.",
      passion: "nature", passionDelta: 1, effects: { bonheur: 6, sante: 4 },
      result: "Les tomates mûrissent, les fleurs s'ouvrent. Votre jardin est un petit royaume." },
    { text: "Juste regarder depuis la chaise longue.",
      effects: { bonheur: 3 }, result: "Le jardin se débrouille bien tout seul, merci pour lui." }
  ], { type: "vie", once: false });

ev("vieillesse", "gen_photographies", "Les photographies",
  "Un album ressort du placard. Des visages jeunes, des lieux disparus, des heures heureuses.",
  [
    { text: "Raconter chaque photo à un proche.",
      effects: { bonheur: 8, social: 6 }, result: "Les histoires s'animent, les rires résonnent. Le passé devient présent." },
    { text: "Feuilleter seul(e), en silence.",
      effects: { bonheur: 5 }, result: "Les souvenirs défilent. Un sourire monte, mélancolique et doux." }
  ], { type: "vie", once: false });

ev("ado", "gen_fenetre", "La pluie à la fenêtre",
  "Dehors il pleut. Vous, à la fenêtre, avec une tasse chaude et mille pensées.",
  [
    { text: "Rêvasser en regardant tomber l'eau.",
      effects: { bonheur: 4, intelligence: 3 }, result: "Les idées voyagent loin, portées par la pluie." },
    { text: "Sortir quand même, défier le temps.",
      effects: { energie: 4, sante: 2 }, result: "Trempé(e), mais vivant(e). La pluie lave aussi l'esprit." }
  ], { type: "vie", once: false });

ev("enfance", "gen_cartable", "Le chemin de l'école",
  "Chaque matin, le même chemin. Les trottoirs, les copains, les cris de récréation.",
  [
    { text: "Rejoindre la bande, courir ensemble.",
      effects: { social: 5, sante: 3 }, result: "Les jeux, les éclats de rire. La journée commence bien." },
    { text: "Marcher seul(e), observer le monde.",
      effects: { intelligence: 4, bonheur: 2 }, result: "Vous regardez les maisons, les oiseaux, les gens. Le monde est un spectacle." }
  ], { type: "vie", once: false });

/* ------------------------------------------------------------
   V0.4 — NOUVEAUX ÉVÉNEMENTS
   familles d'origine, amitiés, quotidien démultiplié, exotique
   ------------------------------------------------------------ */

/* ----- Événements de famille (fil rouge selon l'origine) ----- */
ev("enfance", "fam-atelier", "L'atelier familial",
  "Chez vous, la peinture sèche sur les chevalets et un piano attend ses doigts. Ce soir, la famille crée.",
  [
    { text: "Peindre à côté de votre mère, sans un mot.",
      passion: "peinture", passionDelta: 2, effects: { bonheur: 8, intelligence: 4 },
      result: "Deux heures de silence complice. Votre tableau est raté, votre bonheur immense." },
    { text: "Improviser une mélodie au piano.",
      passion: "musique", passionDelta: 2, effects: { bonheur: 7, social: 4 },
      result: "Les fausses notes font rire tout le monde. La musique est une langue de famille." },
    { text: "Écrire une histoire pour la raconter au dîner.",
      passion: "ecriture", passionDelta: 2, effects: { intelligence: 6, bonheur: 5 },
      result: "À table, tout le monde écoute. Vous sentez pour la première fois le pouvoir des mots." }
  ], { type: "passion", requiresFamily: "famille_artistique" });

ev("enfance", "fam-stade", "Le champion de la famille",
  "Vos parents vous emmènent au stade. Les crampons sont trop grands, mais l'envie est déjà là.",
  [
    { text: "Vous entraîner dur avec votre aîné.",
      passion: "sport", passionDelta: 2, effects: { sante: 7, energie: 7 },
      result: "Des courses, des passes, des courbatures. Le sport est un héritage vivant." },
    { text: "Observer les gestes des pros, noter tout.",
      effects: { intelligence: 5, sante: 3 }, result: "Vous apprenez les stratégies. Le corps suivra, plus tard." },
    { text: "Préférer le public et les cris.",
      effects: { social: 6, bonheur: 4 }, result: "La tribune est votre terrain. L'ambiance vous électrise." }
  ], { type: "passion", requiresFamily: "famille_sportive" });

ev("enfance", "fam-debats", "La table des débats",
  "Au dîner, la discussion s'emballe : un sujet d'école, une question du monde. Chacun doit défendre son avis.",
  [
    { text: "Entrer dans le débat, arguments en vrac.",
      effects: { intelligence: 8, social: 5 }, result: "Vous apprenez à défendre vos idées. Les contradicteurs vous forgent." },
    { text: "Écouter et mémoriser ce qui se dit.",
      effects: { intelligence: 7 }, result: "Vous buvez les paroles des grands. Le savoir s'infiltre sans bruit." },
    { text: "Détourner la conversation avec une blague.",
      effects: { bonheur: 6, social: 4 }, result: "Tout le monde rit. L'art de désamorcer, vous l'avez déjà." }
  ], { type: "vie", requiresFamily: "famille_academique" });

ev("enfance", "fam-deux-mondes", "Les deux langues",
  "À la maison, on parle une autre langue que dans la cour de récré. Deux mondes, deux identités, un même cœur.",
  [
    { text: "Apprendre la langue de vos parents avec fierté.",
      effects: { intelligence: 8, social: 4 }, result: "Les mots de votre famille deviennent vos mots. Une richesse invisible et immense." },
    { text: "Partager votre culture à l'école, fièrement.",
      effects: { social: 8, bonheur: 6 }, result: "Les copains découvrent vos recettes et vos fêtes. La différence rassemble." },
    { text: "Cacher cette autre part de vous, par peur.",
      effects: { bonheur: -5, social: -3 }, result: "Une moitié de vous reste dans l'ombre. Le poids du regard des autres." }
  ], { type: "vie", requiresFamily: "famille_migrante" });

ev("enfance", "fam-ferme", "Les mains dans la terre",
  "L'aube se lève sur la ferme. Les poules s'agitent, et vos mains apprennent la patience des saisons.",
  [
    { text: "Aider aux travaux, sans rechigner.",
      passion: "nature", passionDelta: 2, effects: { sante: 7, energie: 7 },
      result: "La fatigue du corps, la fierté du travail. La terre ne ment jamais." },
    { text: "Observer les animaux, fasciné(e).",
      passion: "nature", passionDelta: 1, effects: { intelligence: 5, bonheur: 5 },
      result: "Chaque bête a ses manies. Le vivant est un livre ouvert." },
    { text: "Rêver d'ailleurs, loin des champs.",
      effects: { intelligence: 4, bonheur: -3 }, result: "Vous regardez l'horizon. Le monde vous appelle ailleurs." }
  ], { type: "passion", requiresFamily: "famille_agricole" });

ev("enfance", "fam-quartier", "La solidarité du quartier",
  "Chez vous, les voisins passent la porte sans frapper. Une soupe pour les uns, un coup de main pour les autres.",
  [
    { text: "Aider votre mère à tenir la marmite commune.",
      effects: { social: 8, bonheur: 6 }, result: "Des portions servies, des sourires échangés. La solidarité s'apprend par les mains." },
    { text: "Aider le voisin à porter ses courses.",
      effects: { social: 7, sante: 3 }, result: "Des remerciements, un bonbon offert. Le quartier est une grande famille." },
    { text: "Rester à la fenêtre, observateur.",
      effects: { intelligence: 4 }, result: "Vous regardez la vie s'organiser. Chacun sa place, chacun sa route." }
  ], { type: "vie", requiresFamily: "famille_populaire" });

ev("enfance", "fam-portraits", "Les portraits de famille",
  "Dans la grande demeure, une galerie de portraits vous fixe. Des visages qui vous ressemblent, d'un autre siècle.",
  [
    { text: "Demander qui étaient ces ancêtres.",
      effects: { intelligence: 8, bonheur: 4 }, result: "Des histoires de voyages, de fortunes et de chutes. Votre nom a un passé." },
    { text: "Sentir le poids de ce patrimoine.",
      effects: { social: 5, bonheur: -3 }, result: "Une responsabilité pèse sur vos épaules. Tout cela vous attend, un jour." },
    { text: "Rêver de le quitter pour inventer votre vie.",
      effects: { bonheur: 6 }, result: "Le nom est un point de départ, pas une prison. Vous voulez tracer votre route." }
  ], { type: "vie", requiresFamily: "famille_heritage" });

ev("enfance", "fam-heros", "Le souvenir de l'aïeul",
  "Au mur, une médaille et une lettre jaunie. Votre grand-père raconte l'histoire du grand-oncle qui a dit non.",
  [
    { text: "Boire ses paroles, graver chaque détail.",
      effects: { bonheur: 8, intelligence: 6 }, result: "L'histoire devient votre histoire. La mémoire est une flamme qu'on passe." },
    { text: "Vouloir être digne de ce nom.",
      effects: { social: 6, bonheur: 5 }, result: "Un idéal s'installe. Vous voulez mériter votre lignée." },
    { text: "Lire par vous-même les lettres d'époque.",
      effects: { intelligence: 8 }, result: "Des mots écrits à la main vous parlent à travers le temps." }
  ], { type: "vie", requiresFamily: "famille_prestigieuse" });

ev("enfance", "fam-valise", "La valise du week-end",
  "Entre deux maisons, votre valise fait le trajet. Samedi chez l'un, dimanche chez l'autre.",
  [
    { text: "S'adapter aux deux foyers, souplement.",
      effects: { social: 7, bonheur: 5 }, result: "Deux maisons, deux façons d'être aimé. Vous apprenez à naviguer." },
    { text: "Garder vos distances, protéger votre cœur.",
      effects: { bonheur: -4, energie: 4 }, result: "L'instabilité vous endurcit. Certains liens restent en suspens." },
    { text: "Rêver du jour où vous aurez une vraie maison.",
      effects: { bonheur: 5, intelligence: 3 }, result: "Le rêve devient un moteur. Vous construirez, plus tard, votre propre nid." }
  ], { type: "vie", requiresFamily: "famille_eclatee" });

ev("ado", "fam-boutique", "La boutique familiale",
  "Derrière le comptoir, vos parents s'activent. La clientèle défile, et les doigts comptent les pièces.",
  [
    { text: "Apprendre le métier du commerce.",
      effects: { social: 8, argent: 8 }, result: "Servir, négocier, fidéliser. Le commerce s'apprend sur le tas." },
    { text: "Proposer une idée pour moderniser la boutique.",
      effects: { intelligence: 6, argent: 5 }, result: "Une vitrine repensée, des réseaux sociaux. La boutique s'ouvre au monde." },
    { text: "Refuser de vous engager dans cette voie.",
      effects: { bonheur: 5 }, result: "Le comptoir n'est pas votre destin. Vous le savez, même si ça déçoit." }
  ], { type: "vie", requiresFamily: "famille_commercante" });

ev("ado", "fam-diner", "Le dîner des puissants",
  "Ce soir, des noms importants sont à table. Les conversations volent haut, et chaque mot semble pesé.",
  [
    { text: "Briller par votre aisance, répondre aux questions.",
      effects: { social: 10, intelligence: 4 }, result: "Les adultes s'arrêtent de parler quand vous prenez la parole. Vous marquez les esprits." },
    { text: "Écouter, apprendre qui est qui.",
      effects: { intelligence: 7, social: 4 }, result: "Vous cartographiez les relations de pouvoir. Un réseau se dessine sous vos yeux." },
    { text: "Détester ces mondanités et le dire.",
      effects: { bonheur: 4, social: -4 }, result: "Votre franchise fait grincer des dents. Les salons, ce n'est pas pour vous." }
  ], { type: "vie", requiresFamily: "famille_pouvoir" });

ev("ado", "fam-montagne", "Les vacances au ski",
  "Les valises dans le coffre, la route vers les sommets. Le chalet vous attend avec son odeur de bois.",
  [
    { text: "Apprendre à skier, chute après chute.",
      effects: { sante: 8, energie: 8, bonheur: 6 }, result: "Les genoux bleus, la neige dans les yeux. La piste devient votre terrain." },
    { text: "Profiter du chalet, au coin du feu.",
      effects: { bonheur: 6, social: 5 }, result: "Des jeux de société, des discussions tardives. La douceur a son charme." },
    { text: "Randonner pour admirer les paysages.",
      passion: "nature", passionDelta: 1, effects: { sante: 6, bonheur: 5 },
      result: "Des sommets immobiles et un silence immense. La montagne vous appelle." }
  ], { type: "vie", requiresFamily: "famille_aisee" });

ev("jeune", "fam-testament", "La lecture du testament",
  "Le notaire ouvre l'enveloppe. L'héritage familial vous revient — avec sa part d'obligations et de souvenirs.",
  [
    { text: "Accepter l'héritage et en faire bon usage.",
      effects: { argent: 60, bonheur: 8 }, result: "Les comptes gonflent, le nom se perpétue. Une responsabilité s'ajoute aux biens." },
    { text: "N'accepter qu'une partie, garder la tête froide.",
      effects: { argent: 30, bonheur: 6 }, result: "La famille sourit de votre sagesse. L'argent n'est pas toute l'histoire." },
    { text: "Refuser, pour tracer votre propre chemin.",
      effects: { argent: -5, bonheur: 10 }, result: "Vous tournez le dos au patrimoine. Votre vie n'appartient qu'à vous." }
  ], { type: "argent", requiresFamily: "famille_heritage" });

ev("jeune", "fam-premier-etudes", "Le premier de la famille",
  "Une admission en poche, et tout le quartier le sait : vous êtes le premier à poursuivre des études supérieures.",
  [
    { text: "Y aller, fier de porter le nom du quartier.",
      effects: { intelligence: 10, bonheur: 8, argent: -10 }, result: "Les amphis vous attendent. Vos proches sont votre force silencieuse." },
    { text: "Hésiter : vos proches ont besoin de vous.",
      effects: { social: 6, bonheur: -5 }, result: "Le poids des attentes vous freine. Choisir sa vie est un luxe étrange." },
    { text: "Étudier tout en travaillant à côté.",
      effects: { intelligence: 7, argent: 10, energie: -10 }, result: "La double vie est épuisante, mais chaque diplôme est une revanche." }
  ], { type: "carriere", requiresFamily: "famille_populaire" });

/* ----- Interactions avec les membres de la famille ----- */
ev("jeune", "fam-diner-parents", "Le dîner chez les parents",
  "Vous repassez la porte de l'enfance. Le plat préféré fume sur la table, et les questions fusent.",
  [
    { text: "Partager votre vie à cœur ouvert.",
      relation: { type: "parent", delta: 12 }, effects: { bonheur: 8, social: 5 },
      result: "Des confidences, des silences heureux. Les liens se resserrent." },
    { text: "Filtrer les sujets, garder la paix.",
      relation: { type: "parent", delta: 3 }, effects: { bonheur: 3 },
      result: "La conversation reste en surface. Personne ne dérange l'harmonie." },
    { text: "Écourter, le passé vous encombre.",
      relation: { type: "parent", delta: -8 }, effects: { bonheur: -4 },
      result: "Vous partez tôt, l'impression d'avoir fui. Les non-dits restent assis à table." }
  ], { type: "famille", requiresRelation: { type: "parent", minBond: 10 }, once: false });

ev("jeune", "fam-conseil", "Le conseil d'un parent",
  "Une décision importante vous taraude. Vous pourriez demander l'avis de vos parents, ou trancher seul.",
  [
    { text: "Demander leur avis, avec sincérité.",
      relation: { type: "parent", delta: 10 }, effects: { social: 6, intelligence: 3 },
      result: "Leur expérience éclaire la vôtre. La confiance se renforce." },
    { text: "Suivre votre instinct, sans rien dire.",
      effects: { bonheur: 5, argent: 3 }, result: "Vous avancez seul. Leur fierté, plus tard, vous le rendra." },
    { text: "Refuser leur aide, par orgueil.",
      relation: { type: "parent", delta: -10 }, effects: { bonheur: -4 },
      result: "Vous claquez la porte du conseil. L'orgueil a son prix." }
  ], { type: "famille", requiresRelation: { type: "parent", minBond: 10 }, once: false });

ev("adulte", "fam-fratrie", "La fratrie se retrouve",
  "Les frères et sœurs se réunissent. Les souvenirs d'enfance ressurgissent, et les vieilles rivalités aussi.",
  [
    { text: "Organiser une grande fête de famille.",
      relation: { type: "fratrie", delta: 12 }, effects: { social: 8, bonheur: 8 },
      result: "Des rires, des photos, des secrets déterrés. Le clan ressort soudé." },
    { text: "Régler une vieille rancune, face à face.",
      relation: { type: "fratrie", delta: 15 }, effects: { bonheur: 6, social: 4 },
      result: "Des mots durs, puis des larmes et des excuses. La plaie se referme." },
    { text: "Participer poliment, sans vous investir.",
      relation: { type: "fratrie", delta: -5 }, effects: { bonheur: -3 },
      result: "La distance s'installe. La famille, parfois, se protège en s'éloignant." }
  ], { type: "famille", requiresRelation: { type: "fratrie", minBond: 10 }, once: false });

ev("maturite", "fam-parent-vieillit", "Le parent qui vieillit",
  "Votre père ou votre mère ralentit. Les escaliers se font hauts, la mémoire parfois hésite.",
  [
    { text: "Vous organiser pour être plus présent.",
      relation: { type: "parent", delta: 10 }, effects: { bonheur: 8, energie: -10 },
      result: "Des visites régulières, des repas partagés. Le temps devient un trésor." },
    { text: "Prévoir des aides à domicile.",
      effects: { argent: -10, sante: 4 }, result: "Des mains professionnelles le soir. La tendresse, elle, reste vôtre." },
    { text: "Refuser de voir le temps passer.",
      relation: { type: "parent", delta: -8 }, effects: { bonheur: -6 },
      result: "Vous vous croyez plus fort que les années. Le regret attend au tournant." }
  ], { type: "famille", requiresRelation: { type: "parent", minBond: 10 }, once: false });

ev("maturite", "fam-deuil-parent", "L'adieu à un parent",
  "Le téléphone sonne à l'aube. Un parent vient de s'éteindre, emportant un morceau de votre enfance.",
  [
    { text: "Vivre le deuil entouré, laisser parler les larmes.",
      relation: { type: "parent", delta: -100 }, effects: { bonheur: -6, social: 5 },
      result: "Des veillées, des souvenirs partagés. La peine se tisse avec les autres." },
    { text: "Se réfugier dans le travail et l'action.",
      relation: { type: "parent", delta: -100 }, effects: { bonheur: -8, energie: -5 },
      result: "Le chagrin attend dans un tiroir. Il ressortira, un jour." },
    { text: "Honorer sa mémoire par un geste symbolique.",
      relation: { type: "parent", delta: -100 }, effects: { bonheur: 5, social: 5 },
      result: "Une étoile plantée, une lettre écrite. L'absence trouve un sanctuaire." }
  ], { type: "drame", requiresRelation: { type: "parent", minBond: 20 } });

/* ----- Amitiés : de vraies relations nommées ----- */
ev("enfance", "ami-premier", "Le premier ami",
  "Dans la cour, un enfant s'approche. Un regard, une proposition de jeu, et le monde se met à deux.",
  [
    { text: "Accepter de jouer, immédiatement.",
      relation: { type: "ami", create: true, delta: 25 }, effects: { social: 8, bonheur: 8 },
      result: "Des courses, des secrets, des éclats de rire. Une amitié naît, sincère." },
    { text: "Se dire oui, mais garder vos distances.",
      relation: { type: "ami", create: true, delta: 8 }, effects: { social: 4 },
      result: "Des parties partagées, sans trop s'ouvrir. La confiance viendra, ou pas." }
  ], { type: "relation", once: false });

ev("ado", "ami-bande", "La bande du quartier",
  "Un groupe se forme autour des mêmes goûts, des mêmes rires. Votre place est à trouver.",
  [
    { text: "Intégrer la bande, pleinement.",
      relation: { type: "ami", create: true, delta: 20 }, effects: { social: 8, bonheur: 6 },
      result: "Des rendez-vous après les cours, des codes secrets. Vous n'êtes plus seul." },
    { text: "En fréquenter quelques-uns, prudemment.",
      relation: { type: "ami", create: true, delta: 10 }, effects: { social: 5 },
      result: "Des liens choisis, sans dépendance au groupe. La liberté avant tout." },
    { text: "Rester en marge, observer.",
      effects: { intelligence: 4, bonheur: -3 }, result: "La bande vous intrigue. Votre solitude est un choix, pour l'instant." }
  ], { type: "relation", once: false });

ev("ado", "ami-secret", "Le secret partagé",
  "Un ami vous confie quelque chose de lourd. Le silence devient un contrat de confiance.",
  [
    { text: "Garder le secret, quoi qu'il arrive.",
      relation: { type: "ami", delta: 15 }, effects: { social: 6, bonheur: 4 },
      result: "La confiance devient du béton. Vous savez garder les mots des autres." },
    { text: "En parler à un adulte, pour aider.",
      relation: { type: "ami", delta: 5 }, effects: { social: 4, intelligence: 3 },
      result: "La situation se dénoue. L'ami boude un peu, puis comprend." },
    { text: "Laisser filer la confidence.",
      relation: { type: "ami", delta: -20 }, effects: { social: -4 },
      result: "La rumeur court. L'amitié ne survit pas à ce genre de trahison." }
  ], { type: "relation", requiresRelation: { type: "ami", minBond: 20 }, once: false });

ev("jeune", "ami-confidences", "Les confidences du soir",
  "Tard dans la nuit, un ami vous appelle. Sa voix tremble, et les mots ne viennent pas tout de suite.",
  [
    { text: "Écouter, sans juger, jusqu'au bout.",
      relation: { type: "ami", delta: 15 }, effects: { social: 7, bonheur: 5 },
      result: "Au matin, il vous remercie. Certaines nuits changent des vies." },
    { text: "Proposer des solutions, à chaud.",
      relation: { type: "ami", delta: 6 }, effects: { intelligence: 4 },
      result: "Il dit merci, même si les conseils étaient trop rapides. La présence a compté." },
    { text: "Raccourcir, fatigué, remettre à demain.",
      relation: { type: "ami", delta: -10 }, effects: { bonheur: -3 },
      result: "Le lendemain, l'occasion est passée. L'amitié demande parfois des nuits blanches." }
  ], { type: "relation", requiresRelation: { type: "ami", minBond: 20 }, once: false });

ev("jeune", "ami-weekend", "Le week-end entre amis",
  "Un week-end improvisé : une voiture, des sacs, et une destination qui n'existe que sur une carte froissée.",
  [
    { text: "Tout partager, jusqu'aux imprévus.",
      relation: { type: "ami", delta: 12 }, effects: { bonheur: 10, social: 6 },
      result: "Une panne, un détour, un fou rire. Les imprévus deviennent des légendes." },
    { text: "Partir mais garder votre indépendance.",
      relation: { type: "ami", delta: 5 }, effects: { bonheur: 5 },
      result: "Des moments ensemble, d'autres solitaires. Un équilibre à trouver." },
    { text: "Annuler au dernier moment.",
      relation: { type: "ami", delta: -12 }, effects: { bonheur: -5 },
      result: "Les messages s'espacent après ça. La confiance se remet, mais lentement." }
  ], { type: "relation", requiresRelation: { type: "ami", minBond: 15 }, once: false });

ev("adulte", "ami-depannage", "Le coup de main",
  "Un ami traverse une mauvaise passe. Une question simple mais lourde : que pouvez-vous faire ?",
  [
    { text: "Proposer votre temps, concrètement.",
      relation: { type: "ami", delta: 15 }, effects: { social: 7, bonheur: 6 },
      result: "Des cartons portés, un dossier relu, une oreille tendue. L'amitié, c'est des actes." },
    { text: "Proposer une aide financière discrète.",
      relation: { type: "ami", delta: 12 }, effects: { argent: -10, bonheur: 6 },
      result: "Il hésite, puis accepte. Votre geste a plus de poids que le billet." },
    { text: "Promettre de l'aide, sans donner suite.",
      relation: { type: "ami", delta: -15 }, effects: { bonheur: -4 },
      result: "Les semaines passent, rien ne vient. Les paroles s'envolent, les actes restent." }
  ], { type: "relation", requiresRelation: { type: "ami", minBond: 20 }, once: false });

ev("adulte", "ami-dispute", "La dispute entre amis",
  "Une remarque de trop, une fierté blessée. L'amitié vacille sur un malentendu.",
  [
    { text: "Appeler, s'excuser, rétablir le lien.",
      relation: { type: "ami", delta: 12 }, effects: { social: 6, bonheur: 5 },
      result: "Deux minutes de gêne, puis tout redevient. Les vrais amis savent demander pardon." },
    { text: "Laisser retomber la poussière, en silence.",
      relation: { type: "ami", delta: -5 }, effects: { bonheur: -3 },
      result: "Le temps adoucit. Mais un coin du lien reste ébréché." },
    { text: "Couper les ponts, définitivement.",
      relation: { type: "ami", delta: -80 }, effects: { bonheur: -8 },
      result: "Le numéro est effacé. Certaines amitiés finissent en point final." }
  ], { type: "relation", requiresRelation: { type: "ami", minBond: 25 }, once: false });

ev("adulte", "ami-boost", "L'ami qui ouvre des portes",
  "Un ami influent vous recommande pour une belle opportunité. Son nom pèse dans la balance.",
  [
    { text: "Saisir l'opportunité, avec gratitude.",
      relation: { type: "ami", delta: 10 }, effects: { argent: 20, intelligence: 6 },
      result: "La porte s'ouvre grâce à lui. Le réseau est une monnaie d'amitié." },
    { text: "Refuser poliment : pas le bon moment.",
      relation: { type: "ami", delta: 5 }, effects: { bonheur: 3 },
      result: "Il comprend, même s'il insiste. L'amitié ne se mesure pas aux faveurs." }
  ], { type: "relation", requiresRelation: { type: "ami", minBond: 40 }, once: false });

ev("maturite", "ami-deuil", "Soutenir un ami en deuil",
  "Un ami perd un proche. Les mots semblent vides, et pourtant, il faut être là.",
  [
    { text: "Être présent, dans la simplicité.",
      relation: { type: "ami", delta: 15 }, effects: { bonheur: 5, social: 6 },
      result: "Un café bu en silence, une main posée. La présence vaut tous les discours." },
    { text: "Aider concrètement : courses, papiers, logistique.",
      relation: { type: "ami", delta: 12 }, effects: { sante: 4, social: 4 },
      result: "Vous gérez l'ordinaire pour qu'il vive l'essentiel. L'amitié se tait et agit." },
    { text: "Éviter, ne pas savoir quoi dire.",
      relation: { type: "ami", delta: -15 }, effects: { bonheur: -5 },
      result: "Le silence s'installe de votre côté. La distance se creuse au pire moment." }
  ], { type: "relation", requiresRelation: { type: "ami", minBond: 30 }, once: false });

/* ----- Quotidien démultiplié : plus de choix (3 à 6) ----- */
ev("bebe", "premier-mot", "Le premier mot",
  "Votre bouche s'ouvre, un son se forme. Tout le monde retient son souffle autour de votre berceau.",
  [
    { text: "Dire « maman », dans un souffle.",
      effects: { social: 6, bonheur: 6 }, result: "Un cri de joie, des larmes. Vous venez d'offrir le premier cadeau." },
    { text: "Dire « papa », triomphant.",
      effects: { social: 6, bonheur: 6 }, result: "Le visage de votre père s'illumine. Une légende de famille est née." },
    { text: "Inventer un mot qui n'existe pas.",
      effects: { intelligence: 6, bonheur: 5 }, result: "« Babou » devient le mot secret de la maison. La créativité, déjà." }
  ], { type: "vie", once: false });

ev("bebe", "premiers-pas", "Les premiers pas",
  "Vous vous hissez le long du canapé. Le vide devant vous, les bras tendus de vos parents au bout.",
  [
    { text: "Lâcher prise et marcher vers eux.",
      effects: { sante: 6, bonheur: 6 }, result: "Trois pas, puis des applaudissements. Le monde s'ouvre à la verticale." },
    { text: "Tomber, rire, et recommencer.",
      effects: { sante: 5, courage: 6 }, result: "Les chutes font partie de l'apprentissage. Vous êtes déjà coriace." }
  ], { type: "vie", once: false });

ev("enfance", "expose", "L'exposé de classe",
  "À vous de présenter devant toute la classe. Le ventre se noue, les fiches tremblent.",
  [
    { text: "Préparer sérieusement, répéter devant le miroir.",
      effects: { intelligence: 8, social: 4 }, result: "Le jour J, les mots sortent clairs. Les applaudissements vous surprennent." },
    { text: "Improviser avec votre humour habituel.",
      effects: { social: 7, bonheur: 5 }, result: "La classe rit, la maîtresse sourit. Vous avez survécu par le charme." },
    { text: "Le faire à deux avec un camarade.",
      relation: { type: "ami", create: true, delta: 12 }, effects: { social: 6 },
      result: "Le stress se partage, l'amitié aussi. Vous formez une bonne équipe." }
  ], { type: "vie", once: false });

ev("enfance", "cantine", "La cantine",
  "Le bruit, les plateaux, les plats qu'on aime ou qu'on déteste. La cantine est une petite société.",
  [
    { text: "Rejoindre la grande table des copains.",
      effects: { social: 6, bonheur: 5 }, result: "Des rires, des échanges de desserts. La vie sociale se joue aussi ici." },
    { text: "S'asseoir avec quelqu'un de seul.",
      relation: { type: "ami", create: true, delta: 15 }, effects: { social: 7, bonheur: 6 },
      result: "Un sourire timide, une conversation. Vous venez de vous faire un ami." },
    { text: "Manger vite pour aller jouer.",
      effects: { sante: 3, bonheur: 4 }, result: "La cour vous attend. L'équilibre viendra plus tard." }
  ], { type: "vie", once: false });

ev("enfance", "devoirs", "Les devoirs du soir",
  "La table est dressée, le cahier ouvert. Entre l'envie de jouer et la consigne de travailler.",
  [
    { text: "Faire les devoirs d'abord, jouer ensuite.",
      effects: { intelligence: 8, bonheur: 3 }, result: "La discipline paie. Le jeu a meilleur goût une fois libéré." },
    { text: "Bâcler pour filer jouer.",
      effects: { bonheur: 5, intelligence: -4 }, result: "La cour est géniale, la leçon oubliée. Ça se paiera au prochain contrôle." },
    { text: "Demander de l'aide à vos parents.",
      relation: { type: "parent", delta: 6 }, effects: { intelligence: 6 },
      result: "Ensemble, le problème devient clair. Les devoirs rapprochent." }
  ], { type: "vie", once: false });

ev("enfance", "anniversaire", "L'anniversaire surprise",
  "Lumières éteintes, gâteau qui flambe, et des voix qui entonnent la chanson. Tout le monde pense à vous.",
  [
    { text: "Souffler les bougies en faisant un vœu.",
      effects: { bonheur: 8, social: 5 }, result: "Une flamme, un vœu, des applaudissements. L'enfance a un goût sucré." },
    { text: "Partager le gâteau avec tout le monde, généreux.",
      effects: { social: 8, bonheur: 6 }, result: "Chacun repart avec une part. Le partage rend la fête plus grande." },
    { text: "Être intimidé par tous ces regards.",
      effects: { bonheur: 3, social: -3 }, result: "La fête vous submerge. Vous préférez le calme, finalement." }
  ], { type: "vie", once: false });

ev("ado", "telephone", "Le premier téléphone",
  "Le précieux sésame arrive dans vos mains. Un monde de messages et de réseaux s'ouvre.",
  [
    { text: "L'utiliser pour rester proche de vos amis.",
      effects: { social: 8, bonheur: 5 }, result: "Des conversations infinies. La distance s'estompe, la complicité demeure." },
    { text: "En limiter l'usage, rester maître.",
      effects: { intelligence: 5, sante: 3 }, result: "Le téléphone est un outil, pas un maître. Vous gardez la main." },
    { text: "Y passer vos nuits, happé.",
      effects: { social: 4, sante: -6, energie: -5 }, result: "Les écrans brillent, le sommeil fuit. L'engrenage est doux et sournois." }
  ], { type: "vie", once: false });

ev("ado", "reseaux", "Les réseaux sociaux",
  "Des photos, des likes, des regards invisibles. Votre image se construit aussi en ligne.",
  [
    { text: "Partager votre vraie vie, avec sincérité.",
      effects: { social: 6, bonheur: 5 }, result: "Les vrais amis vous suivent. L'authenticité attire." },
    { text: "Se mettre en scène, façonner une image.",
      effects: { social: 7, bonheur: 3, sante: -3 }, result: "Les followers montent, le sommeil baisse. Le masque a un coût." },
    { text: "S'en tenir éloigné, préférer le réel.",
      effects: { intelligence: 5, bonheur: 4 }, result: "Votre vie se vit hors ligne. Vous respirez mieux, à votre rythme." }
  ], { type: "vie", once: false });

ev("ado", "declaration", "La déclaration",
  "Le cœur bat si fort qu'il fait du bruit. Dire ce que vous ressentez, ou garder tout à l'intérieur.",
  [
    { text: "Oser déclarer votre flamme.",
      relation: { type: "amour", create: true, delta: 20 }, effects: { social: 7, bonheur: 8 },
      result: "Un silence, puis un sourire. Les mots ont changé quelque chose." },
    { text: "Écrire une lettre, la glisser discrètement.",
      relation: { type: "amour", create: true, delta: 12 }, effects: { intelligence: 4, bonheur: 5 },
      result: "La lettre fait son chemin. Les mots écrits ont leur propre courage." },
    { text: "Refouler, changer de sujet.",
      effects: { bonheur: -5, intelligence: 3 }, result: "Le sentiment reste en suspens. Les non-dits pèsent leur poids." }
  ], { type: "relation", once: false });

ev("ado", "bac", "La pression du bac",
  "Le compte à rebours est lancé. Révisions, angoisses, et la famille qui retient son souffle.",
  [
    { text: "S'organiser, réviser méthodiquement.",
      effects: { intelligence: 10, energie: -6 }, result: "Des fiches, des plannings, des nuits courtes. Vous arrivez prêt." },
    { text: "Étudier en groupe, se motiver ensemble.",
      relation: { type: "ami", create: true, delta: 10 }, effects: { intelligence: 7, social: 6 },
      result: "La pression se partage, les progrès aussi. Le groupe porte." },
    { text: "Relativiser : ce n'est qu'un examen.",
      effects: { bonheur: 6, intelligence: 3 }, result: "La sérénité paie parfois mieux que la panique." },
    { text: "Paniquer, procrastiner, accumuler.",
      effects: { sante: -5, bonheur: -6 }, result: "La montagne grandit. Le bac se rapproche comme une vague." }
  ], { type: "vie" });

ev("ado", "postbac", "Les vœux d'orientation",
  "Le dossier d'orientation se remplit. Des choix, des cases à cocher, et un avenir à dessiner.",
  [
    { text: "Viser l'excellence, sans filet.",
      effects: { intelligence: 8, bonheur: 3 }, result: "Les meilleures écoles vous tentent. Le risque fait partie du jeu." },
    { text: "Choisir une voie réaliste et solide.",
      effects: { intelligence: 5, argent: 5 }, result: "Un choix prudent. Les portes restent ouvertes, même modestes." },
    { text: "Suivre votre passion, coûte que coûte.",
      effects: { bonheur: 10, intelligence: 3 }, result: "La filière de vos rêves. L'avenir dira si le cœur avait raison." },
    { text: "Laisser vos parents choisir pour vous.",
      effects: { social: 5, bonheur: -3 }, result: "Leur sagesse vous guide. Mais la voie n'est pas encore la vôtre." }
  ], { type: "vie" });

ev("jeune", "bilan-sante", "Le bilan de santé",
  "Le médecin vous examine. C'est l'occasion de faire le point, ou de repousser l'échéance.",
  [
    { text: "Faire un bilan complet, sans tricher.",
      effects: { sante: 10, argent: -6 }, result: "Des chiffres, des conseils, un plan. Votre corps vous remercie." },
    { text: "Dire que tout va bien, vite fait.",
      effects: { sante: -4 }, result: "Le bilan reste un papier vide. Le corps, lui, sait compter." },
    { text: "En profiter pour adopter un rythme sain.",
      effects: { sante: 8, energie: 6 }, result: "Sommeil, sport, assiette. Le changement s'installe en douceur." }
  ], { type: "sante", once: false });

ev("jeune", "premiere-paye", "La première paye",
  "Le virement tombe enfin. Des chiffres à eux seuls, et des envies qui s'entrechoquent.",
  [
    { text: "Épargner une part, savourer le reste.",
      effects: { argent: 15, bonheur: 5 }, result: "Une tirelire sérieuse et un petit plaisir. La maturité commence ici." },
    { text: "Tout dépenser en plaisirs, sans compter.",
      effects: { argent: -10, bonheur: 10 }, result: "Des sorties, des achats, des soirées. Le portefeuille maigrit, le moral fleurit." },
    { text: "Investir dans une formation.",
      effects: { intelligence: 8, argent: -15 }, result: "Les compétences s'ajoutent au CV. Le savoir est un placement." },
    { text: "Envoyer une part à vos proches.",
      relation: { type: "parent", delta: 8 }, effects: { argent: -8, social: 6 },
      result: "Un geste qui fait chaud au cœur. L'argent circule mieux que la gratitude." }
  ], { type: "argent", once: false });

ev("jeune", "meuble", "Le meuble en kit",
  "Une boîte énorme, des vis sans fin, et une notice en six langues. L'assemblage devient une épreuve.",
  [
    { text: "Suivre la notice, pièce par pièce.",
      effects: { intelligence: 5, bonheur: 4 }, result: "Quatre heures plus tard, le meuble tient. La fierté du bricoleur." },
    { text: "Improviser, la notice aux oubliettes.",
      effects: { intelligence: -2, bonheur: 6 }, result: "Il reste trois vis, mais le meuble a un charme bancal." },
    { text: "Appeler un ami pour l'aide (et la bière).",
      relation: { type: "ami", delta: 6 }, effects: { social: 6, bonheur: 6 },
      result: "Deux paires de mains, beaucoup de rires. Le meuble est une aventure partagée." }
  ], { type: "vie", once: false });

ev("adulte", "check-up", "Le rendez-vous préventif",
  "Vous avez l'âge des bilans. Le corps mérite une visite, même quand tout semble aller.",
  [
    { text: "Tout vérifier : sang, cœur, dents.",
      effects: { sante: 10, argent: -8 }, result: "Tout est en ordre, ou corrigé à temps. La prévention est une forme de sagesse." },
    { text: "Faire le minimum syndical.",
      effects: { sante: 2 }, result: "Un passage éclair. Le reste suivra, un jour, peut-être." },
    { text: "Ignorer les courriers de rappel.",
      effects: { sante: -6 }, result: "Les rappels s'empilent. Le corps attendra que vous décidiez." }
  ], { type: "sante", once: false });

ev("adulte", "voisins", "Les nouveaux voisins",
  "Des cartons dans le couloir, une porte qui s'ouvre, et des visages inconnus qui emménagent.",
  [
    { text: "Accueillir avec un gâteau maison.",
      relation: { type: "ami", create: true, delta: 15 }, effects: { social: 7, bonheur: 5 },
      result: "Un café, une conversation. Le palier se transforme en lien." },
    { text: "Proposer votre aide pour les cartons.",
      effects: { social: 6, sante: 4 }, result: "Des bras en plus, des mercis en cascade. Le quartier s'agrandit." },
    { text: "Rester chez vous, sourire poli.",
      effects: { social: -2 }, result: "Les voisins resteront des silhouettes. Chacun chez soi." }
  ], { type: "social", once: false });

ev("adulte", "ecologie", "L'engagement écologique",
  "Une prise de conscience vous taraude : le quotidien peut changer, à votre échelle.",
  [
    { text: "Réduire vos déchets et consommer autrement.",
      effects: { bonheur: 6, argent: -5 }, result: "Le compost, le vélo, le vrac. Une satisfaction profonde s'installe." },
    { text: "Vous engager dans une association locale.",
      flag: "associatif", effects: { social: 8, bonheur: 8 },
      result: "Des plantations, des collectes, des bénévoles. Vous êtes une petite goutte dans un grand océan." },
    { text: "Changer de vie : à la campagne !",
      effects: { sante: 6, bonheur: 8, argent: -10 }, result: "L'air pur, le potager, le silence. La reconversion totale." },
    { text: "Penser que c'est trop tard, continuer.",
      effects: { bonheur: -3 }, result: "Le pessimisme est confortable. Le monde, lui, continue d'avancer sans vous." }
  ], { type: "social", once: false });

ev("adulte", "reunion-profs", "La réunion parents-profs",
  "Les petits carnets, les couloirs d'école, et la maîtresse qui dresse le portrait de votre enfant.",
  [
    { text: "Écouter, noter, soutenir votre enfant.",
      relation: { type: "enfant", delta: 10 }, effects: { bonheur: 6, intelligence: 4 },
      result: "Un plan se dessine pour l'aider. L'école devient une équipe." },
    { text: "Défendre votre enfant, quoi qu'on dise.",
      relation: { type: "enfant", delta: 8 }, effects: { social: 4 },
      result: "La maîtresse nuance, vous insiste. L'amour parental a ses angles morts." },
    { text: "Envoyer un autre membre de la famille.",
      effects: { sante: 2 }, result: "Le compte-rendu arrive de seconde main. Un peu de distance, beaucoup de confiance." }
  ], { type: "famille", requiresRelation: { type: "enfant", minBond: 5 }, once: false });

ev("maturite", "depistage", "Le dépistage",
  "La campagne de dépistage vous invite. Un examen qui peut tout changer, ou rien.",
  [
    { text: "Y aller, le cœur serré.",
      effects: { sante: 10, argent: -5 }, result: "Des résultats rassurants, ou une alerte à temps. Le courage a payé." },
    { text: "Repousser, la peur l'emporte.",
      effects: { sante: -6 }, result: "Le courrier dort sur la table. Savoir, parfois, fait plus peur que ne pas savoir." },
    { text: "Y aller accompagné, par solidarité.",
      effects: { sante: 8, social: 4 }, result: "Deux mains sur la poignée de porte. Les épreuves se partagent aussi." }
  ], { type: "sante", once: false });

ev("retraite", "atelier-art", "L'atelier du dimanche",
  "Un atelier d'art dans le quartier ouvre ses portes. Les pinceaux, l'argile, ou simplement l'envie.",
  [
    { text: "Rejoindre l'atelier, sans jugement.",
      passion: "peinture", passionDelta: 2, effects: { bonheur: 10, social: 6 },
      result: "Des toiles naïves, des rires de potier. La création est un élixir de jeunesse." },
    { text: "Encourager les autres, spectateur éclairé.",
      effects: { social: 6, bonheur: 5 }, result: "Vous applaudissez les talents naissants. L'art se vit aussi par les yeux." },
    { text: "Y penser chaque dimanche, sans y aller.",
      effects: { bonheur: -3 }, result: "L'atelier vous attend. Le « un jour » a la vie dure." }
  ], { type: "passion", once: false });

ev("vieillesse", "lettre-enfants", "La lettre aux enfants",
  "Une envie d'écrire ce qui n'a jamais été dit. Des mots pour ceux qui viendront après.",
  [
    { text: "Écrire une longue lettre, sans retenue.",
      effects: { bonheur: 12, intelligence: 4 }, result: "Des pages entières de vérités et de tendresse. Votre voix traversera le temps." },
    { text: "Enregistrer vos souvenirs à voix haute.",
      effects: { bonheur: 8, social: 4 }, result: "Une voix, des silences, des rires. Ils pourront vous réécouter." },
    { text: "Le faire ensemble, en famille.",
      relation: { type: "enfant", delta: 8 }, effects: { bonheur: 10, social: 6 },
      result: "Des anecdotes, des corrections, des fous rires. La transmission devient un moment." }
  ], { type: "famille", once: false });

ev("vieillesse", "maison-retraite", "La question du chez-soi",
  "L'entretien de la maison devient lourd. La question se pose : rester, ou se faire aider.",
  [
    { text: "Rester chez vous, avec des aides.",
      effects: { bonheur: 8, argent: -8 }, result: "Vos murs, vos souvenirs, votre indépendance. Des mains viennent vous seconder." },
    { text: "Rejoindre vos enfants, partager leur vie.",
      relation: { type: "enfant", delta: 10 }, effects: { bonheur: 6, social: 5 },
      result: "Des rires d'enfants, une chambre qui vous attend. La vie continue, entourée." },
    { text: "Envisager une maison adaptée.",
      effects: { sante: 5, argent: -15, bonheur: -5 }, result: "Une décision difficile, une sécurité retrouvée. Les compromis ont leur dignité." }
  ], { type: "famille", once: false });

/* ----- Événements exotiques & de société ----- */
ev("enfance", "eclipse", "L'éclipse totale",
  "Le ciel s'assombrit en plein jour. Les oiseaux se taisent, les lampadaires s'allument, et le monde retient son souffle.",
  [
    { text: "Observer le phénomène, protégé des yeux.",
      effects: { intelligence: 8, bonheur: 6 }, result: "La couronne solaire apparaît. Vous venez de voir la plus belle horloge du ciel." },
    { text: "Partager ce moment avec toute la classe.",
      effects: { social: 7, bonheur: 5 }, result: "Des exclamations, des lunettes partagées. Un souvenir collectif se grave." },
    { text: "En profiter pour apprendre le système solaire.",
      effects: { intelligence: 8 }, result: "Soleil, lune, orbites : l'éclipse devient une leçon vivante." }
  ], { type: "societe", once: true });

ev("ado", "meteores", "La pluie de météores",
  "Des étoiles filantes s'embrasent une à une. Un ciel qui offre son spectacle, et des vœux qui n'attendent que vous.",
  [
    { text: "Formuler un vœu pour chaque étoile.",
      effects: { bonheur: 8 }, result: "Des vœux plein la tête. Le ciel a promis d'y réfléchir." },
    { text: "Rêver de devenir astronome.",
      effects: { intelligence: 8, bonheur: 5 }, result: "La voûte céleste devient une passion. L'infini vous appelle." },
    { text: "Regarder avec un ami, émerveillés.",
      relation: { type: "ami", create: true, delta: 10 }, effects: { social: 6, bonheur: 6 },
      result: "Des étoiles partagées, un lien qui se tisse. La nuit a scellé quelque chose." }
  ], { type: "aleatoire", once: false, weight: 1 });

ev("jeune", "aurores", "Les aurores boréales",
  "Au nord, le ciel se drape de vert et de violet. Un phénomène qui semble venu d'un autre monde.",
  [
    { text: "Partir les voir, coûte que coûte.",
      effects: { argent: -15, bonheur: 15, sante: -3 }, result: "Des nuits dehors dans le froid. La danse des lumières vous fait oublier le reste." },
    { text: "Les regarder en direct sur internet.",
      effects: { bonheur: 5, intelligence: 4 }, result: "Le spectacle est beau, même à distance. L'envie de partir, elle, grandit." },
    { text: "Planifier ce voyage pour plus tard.",
      effects: { argent: 5, bonheur: 3 }, result: "Une liste de rêves s'allonge. Le nord vous attendra." }
  ], { type: "aleatoire", once: false, weight: 1 });

ev("jeune", "celebre", "La rencontre célèbre",
  "Dans un train, un café, un salon : un visage connu s'assoit près de vous. Banalité surréaliste.",
  [
    { text: "Engager la conversation, simplement.",
      effects: { social: 8, bonheur: 8 }, result: "Une discussion normale avec une vie pas banale. Le souvenir restera." },
    { text: "Demander un souvenir signé.",
      effects: { social: 4, bonheur: 4 }, result: "Une dédicace, un selfie, une anecdote. Les proches en douteront." },
    { text: "Respecter son anonymat, rester discret.",
      effects: { bonheur: 4, intelligence: 3 }, result: "Vous le laissez vivre. La discrétion a son élégance." }
  ], { type: "aleatoire", once: false, weight: 1 });

ev("adulte", "noel", "Le réveillon de Noël",
  "La table s'allonge, la dinde attend, et toute la famille se bouscule sous le même toit.",
  [
    { text: "Prendre part aux préparatifs, joyeusement.",
      effects: { bonheur: 10, social: 6 }, result: "Des épluchages, des rires, des disputes sur la cuisson. La magie opère." },
    { text: "Profiter des retrouvailles, simple invité.",
      effects: { bonheur: 8, social: 5 }, result: "Vous observez les visages éclairés par les guirlandes. C'est beau, une famille." },
    { text: "Organiser une fête qui change des habitudes.",
      effects: { bonheur: 8, argent: -8 }, result: "Un réveillon pas comme les autres. Les traditions aiment les surprises." },
    { text: "Passer Noël loin, volontairement.",
      effects: { bonheur: -5, social: -4 }, result: "Le réveillon est une obligation, parfois. Certains choisissent la solitude." }
  ], { type: "famille", once: false, weight: 2 });

ev("adulte", "14-juillet", "Le 14 juillet",
  "Les guirlandes, le bal populaire, le feu d'artifice qui embrase le ciel. La fête nationale vous happe.",
  [
    { text: "Assister au feu d'artifice, émerveillé.",
      effects: { bonheur: 8, social: 5 }, result: "Des couleurs qui éclatent, des « oh » et des « ah ». Un grand spectacle gratuit." },
    { text: "Danser au bal, jusqu'au bout de la nuit.",
      effects: { social: 8, bonheur: 7 }, result: "Des pas hésitants, des rires. La musique vous porte jusqu'à l'aube." },
    { text: "Voir les pompiers, la tradition respectée.",
      effects: { social: 5, bonheur: 4 }, result: "Les ballons, les enfants, l'ambiance bon enfant. Un rendez-vous national." }
  ], { type: "societe", once: false, weight: 2 });

ev("adulte", "municipales", "Les élections municipales",
  "Le maire sortant affronte un challenger. Le débat divise les voisins et anime les repas de famille.",
  [
    { text: "Vous renseigner et voter, sérieusement.",
      effects: { social: 5, intelligence: 5 }, result: "Le bulletin pèse peu, mais l'acte compte. La démocratie se joue aussi au coin de la rue." },
    { text: "Vous engager dans une liste locale.",
      flag: "associatif", effects: { social: 8, bonheur: 5 },
      result: "Des tracts, des réunions, des rencontres. La politique commence par le terrain." },
    { text: "Vous abstenir, dégoûté.",
      effects: { bonheur: -3 }, result: "Le bureau de vote reste vide. Le mécontentement, lui, vote à sa façon." }
  ], { type: "societe", once: false, weight: 2 });

ev("retraite", "tierce", "Le tiercé du dimanche",
  "Un ticket, des chevaux, un pronostic hésitant. Le pari du dimanche est un petit frisson.",
  [
    { text: "Tenter un petit pari, pour le frisson.",
      chance: 0.15, note: "Gain rare.",
      goodEffects: { argent: [30, 80], bonheur: 12 },
      goodResult: "Votre cheval crève l'écran ! Le café ne parle plus que de votre coup de maître.",
      badEffects: { argent: -5, bonheur: -2 },
      badResult: "Le cheval finit dans le peloton. Le dimanche garde son mystère." },
    { text: "Se contenter de regarder la course.",
      effects: { bonheur: 4 }, result: "Le spectacle est gratuit et palpitant. Vos pronostics restent des secrets." }
  ], { type: "aleatoire", once: false, weight: 1 });

/* ----- Découvertes de passion dès l'enfance ----- */
ev("enfance", "passion-nature", "Le trésor des bois",
  "Une cabane dans les arbres, un ruisseau, une coccinelle sur la main. La nature vous tend les bras.",
  [
    { text: "Explorer les bois, chaque recoin.",
      passion: "nature", passionDelta: 2, effects: { sante: 6, bonheur: 6 },
      result: "Des branches cassées, des secrets découverts. La forêt devient votre royaume." },
    { text: "Créer un herbier de feuilles trouvées.",
      passion: "nature", passionDelta: 1, effects: { intelligence: 6 },
      result: "Des pages collées, des noms appris. La nature se laisse aussi collectionner." },
    { text: "Rentrer vite, préférer le canapé.",
      effects: { bonheur: 2 }, result: "La nature peut attendre. Le canapé, lui, est toujours là." }
  ], { type: "passion", once: false });

ev("ado", "passion-cuisine", "Le premier gâteau",
  "La farine vole, les œufs tombent, et une odeur de vanille envahit la cuisine. L'aventure commence.",
  [
    { text: "Suivre la recette, pas à pas.",
      passion: "cuisine", passionDelta: 2, effects: { intelligence: 5, bonheur: 6 },
      result: "Un gâteau pas parfait, mais dévoré. La cuisine est une science douce." },
    { text: "Improviser avec ce qui traîne.",
      passion: "cuisine", passionDelta: 1, effects: { bonheur: 5, intelligence: 2 },
      result: "Le résultat est... surprenant. Mais la créativité, elle, est au four." },
    { text: "Cuisiner pour la famille, fièrement.",
      passion: "cuisine", passionDelta: 2, effects: { social: 6, bonheur: 6 },
      result: "Tout le monde réclame le dessert. Vos mains créent la joie." }
  ], { type: "passion", once: false });

ev("enfance", "passion-theatre", "La matinée spectacle",
  "Une troupe joue dans le gymnase. Les costumes, les répliques, et une envie soudaine de monter sur scène.",
  [
    { text: "Rêver de jouer la comédie.",
      passion: "theatre", passionDelta: 2, effects: { social: 6, bonheur: 6 },
      result: "Vous répétez les répliques dans le miroir. La scène vous appelle déjà." },
    { text: "Écrire une pièce pour vos amis.",
      passion: "theatre", passionDelta: 1, effects: { intelligence: 6 },
      result: "Un scénario improvisé, des rôles distribués. Vous tenez les ficelles." },
    { text: "Regarder, admiratif, sans oser.",
      effects: { bonheur: 3 }, result: "Le spectacle vous émerveille. L'audace viendra, peut-être." }
  ], { type: "passion", once: false });

ev("ado", "passion-tech", "La machine qui calcule",
  "Un vieil ordinateur au fond d'un placard. Vous appuyez sur la touche, et un monde s'allume.",
  [
    { text: "Essayer de comprendre, en autodidacte.",
      passion: "technologie", passionDelta: 2, effects: { intelligence: 7 },
      result: "Des essais, des erreurs, des victoires. La machine devient votre terrain de jeu." },
    { text: "Inventer un petit jeu pour vos amis.",
      passion: "technologie", passionDelta: 2, effects: { social: 6, intelligence: 5 },
      result: "Vos amis testent votre création. L'idée d'en faire plus germe." },
    { text: "Vous contenter de l'utiliser pour jouer.",
      effects: { bonheur: 4 }, result: "Le temps file devant l'écran. La magie, pour l'instant, reste passive." }
  ], { type: "passion", once: false });

ev("enfance", "passion-lecture", "Le roman trop épais",
  "Un livre paraît bien trop gros pour votre âge. Mais la couverture vous nargue, et la première page vous happe.",
  [
    { text: "Vous lancer, page après page.",
      passion: "ecriture", passionDelta: 1, effects: { intelligence: 8, bonheur: 5 },
      result: "Le monde du livre vous avale tout entier. La lecture devient une habitude." },
    { text: "Inventer la suite de l'histoire.",
      passion: "ecriture", passionDelta: 2, effects: { intelligence: 6, bonheur: 5 },
      result: "Le stylo court plus vite que la peur. Écrire devient votre secret." },
    { text: "Le ranger, trop intimidant.",
      effects: { bonheur: 2 }, result: "Le roman patiente dans la bibliothèque. Il vous rattrapera, un jour." }
  ], { type: "passion", once: false });

/* ------------------------------------------------------------
   ÉVÉNEMENTS À MÉMOIRE NARRATIVE — conséquences à long terme
   ------------------------------------------------------------ */
ev("adulte", "revanche_etudes", "La revanche du savoir",
  "Ce projet professionnel vous tend les bras, mais il exige ce diplôme que vous n'avez pas pris le temps d'obtenir.",
  [
    { text: "Reprendre des études à temps partiel.",
      effects: { intelligence: 10, argent: -15, energie: -5, bonheur: 5 }, result: "Soirs de révision, week-ends en bibliothèque. Le diplôme arrive, la porte s'ouvre.", flag: "etudes_reprise" },
    { text: "Miser sur l'expérience, prouver par les faits.",
      effects: { intelligence: 5, bonheur: 3 }, result: "Vos résultats parlent pour vous. La promotion vient par la compétence, pas le papier." },
    { text: "Laisser filer, ce n'est plus l'âge.",
      effects: { bonheur: -5 }, result: "L'opportunité passe. Parfois, on choisit sa paix plutôt que la gloire." }
  ], { type: "carriere", requiresFlag: "travail", notFlag: "etudes" });

ev("adulte", "retour_racines", "L'appel des origines",
  "Une lettre, un coup de fil, une nouvelle : là d'où vous venez a besoin de vous, ou vous appelle.",
  [
    { text: "Y aller, passer du temps, aider.",
      effects: { bonheur: 8, social: 5, argent: -8 }, result: "Retour aux sources. Les visages familiers, les paysages d'enfance. Vous repartez plus ancré(e).", flag: "retour_racines" },
    { text: "Envoyer de l'argent, garder vos distances.",
      effects: { argent: -15, bonheur: 2 }, result: "Le virement part. Le lien tient par le fil, sans s'effilocher." },
    { text: "Ne pas répondre. Votre vie est ici maintenant.",
      effects: { bonheur: -3 }, result: "Le passé reste au passé. Mais la nuit, parfois, une voix connue résonne." }
  ], { type: "famille", requiresFlag: "famille_populaire" });

ev("maturite", "transmission_entreprise", "La relève",
  "Votre entreprise a grandi. Vos enfants, ou de jeunes collègues, frappent à la porte : et si c'était à eux de porter le flambeau ?",
  [
    { text: "Leur transmettre progressivement, les former.",
      effects: { bonheur: 10, social: 8, argent: 10 }, result: "La transmission se fait dans la confiance. L'héritage continue, différent mais vivant.", flag: "entreprise_transmise" },
    { text: "Vendre au meilleur prix, profiter de la vie.",
      effects: { argent: 80, bonheur: 5 }, result: "Le chèque est gros. La liberté aussi. Mais l'histoire s'arrête avec vous." },
    { text: "Refuser de lâcher, garder la main.",
      effects: { bonheur: -5, energie: -5 }, result: "Le pouvoir ne se partage pas. Mais l'entreprise vieillit avec son patron." }
  ], { type: "carriere", requiresFlag: "entreprise", requiresCareer: true });

ev("maturite", "regret_passion", "L'inachevé",
  "Vous retrouvez un vieux carnet, une guitare dans son étui, une toile inachevée. Ce que vous avez aimé, puis laissé tomber.",
  [
    { text: "Reprendre, sans pression, pour le plaisir.",
      effects: { bonheur: 8, energie: 3 }, result: "Les doigts retrouvent leurs marques. La passion ne vous a pas oublié(e).", flag: "passion_renouee" },
    { text: "La transmettre à un petit-enfant, un jeune.",
      effects: { bonheur: 10, social: 5 }, result: "Les yeux brillent devant vous. La flamme passe de main en main." },
    { text: "Refermer le carnet. Ce temps est passé.",
      effects: { bonheur: -2 }, result: "La nostalgie a son charme, mais l'avenir ne se construit pas dans le rétroviseur." }
  ], { type: "passion", requiresPassion: 2 });

ev("retraite", "héritage_invisible", "Ce que vous laissez",
  "Autour de vous, on parle de vous. Pas de votre argent, mais de ce que vous avez été : juste, dur, drôle, absent, présent.",
  [
    { text: "Écouter, accepter, ne rien corriger.",
      effects: { bonheur: 5 }, result: "L'image que les autres ont de vous leur appartient. Vous, vous savez." },
    { text: "Raconter votre version, pour la postérité.",
      effects: { bonheur: 3, intelligence: 2 }, result: "Mémoires, lettres, enregistrements. Votre voix traversera le temps." },
    { text: "Penser que l'essentiel n'est pas dans les mots.",
      effects: { bonheur: 4 }, result: "Ce qui reste, ce sont les gestes, les silences, l'amour donné. Le reste est bruit." }
  ], { type: "famille" });

/* ============================================================
   ÉVÉNEMENTS DE PERSONNALITÉ (30 nouveaux)
   Liés aux traits Big Five et aux personnes existantes
   ============================================================ */

// ── PETITE ENFANCE (0-5) : Personnalité émergente ──

ev("bebe", "pers_curiosite", "La curiosité de bébé",
  "Une boîte s'ouvre, un objet roulote. Vous regardez avec des yeux émerveillés.",
  [
    { text: "Toucher tout, goûter, explorer.",
      effects: { intelligence: 5, bonheur: 3 },
      result: "Le monde est une merveille à déchirer, goûter, sentir." },
    { text: "Observer, prudemment, depuis les bras.",
      effects: { sante: 5, bonheur: 3 },
      result: "La prudence, déjà, garde le cœur tranquille." }
  ], { type: "perso", once: false, weight: 2 });

ev("bebe", "pers_colere", "Le premier caprice",
  "La faim, la fatigue, ou rien du tout. Vous pleurez, fort.",
  [
    { text: "Pleurer jusqu'à être entendu.",
      effects: { bonheur: 3, stress: 3 },
      result: "On vient. On console. On cède." },
    { text: "Se blottir, se calmer, attendre.",
      effects: { sante: 5, bonheur: 2 },
      result: "Le calme revient. Vous savez déjà attendre." }
  ], { type: "perso", once: false, weight: 2 });

// ── ENFANCE (6-12) : Premiers traits sociaux ──

ev("enfance", "pers_timide", "La peur de parler en public",
  "La maîtresse demande qui veut réciter devant la classe. La main se lève... puis retombe.",
  [
    { text: "Se lever, malgré la peur.",
      effects: { intelligence: 6, social: 4 },
      result: "La voix tremble. Mais les mots sortent. On applaudit." },
    { text: "Rester assis, regarder les autres.",
      effects: { bonheur: 3 },
      result: "Le soulagement. Et un petit regret, peut-être." }
  ], { type: "perso", once: false, weight: 3 });

ev("enfance", "pers_generosite", "Le goûter partagé",
  "Vous avez une pomme. Un camarade n'en a pas. Son regard est discret, mais insistant.",
  [
    { text: "Couper en deux, offrir la moitié.",
      effects: { social: 8, bonheur: 5 },
      result: "Le goûter est meilleur à deux. Une amitié commence." },
    { text: "Le garder, tout simplement.",
      effects: { bonheur: 2 },
      result: "La pomme est bonne. Mais le regard de l'autre vous suit." }
  ], { type: "perso", once: false, weight: 3 });

ev("enfance", "pers_menteur", "Le vase cassé",
  "Le vase de maman est en morceaux sur le sol. Personne n'a rien vu. Personne sauf vous.",
  [
    { text: "Dire la vérité, prendre la punition.",
      effects: { intelligence: 5, bonheur: 3 },
      result: "La punition est légère. La confiance de maman, elle, grandit." },
    { text: "Dire que c'est le chat.",
      effects: { bonheur: 5 },
      result: "Le chat est puni. Vous, vous savez." }
  ], { type: "perso", once: false, weight: 2 });

ev("enfance", "pers_competitif", "La course à l'école",
  "La course de vitesse. Les autres enfants sont rapides. Vous êtes rapide aussi.",
  [
    { text: "Courir pour gagner, vraiment.",
      effects: { sante: 6, bonheur: 4 },
      result: "Vous arrivez premier. Ou deuxième. Peu importe, vous avez tout donné." },
    { text: "Laisser gagner l'autre, pour la paix.",
      effects: { social: 6, bonheur: 4 },
      result: "L'autre sourit. Vous, vous savez ce que vous avez choisi." }
  ], { type: "perso", once: false, weight: 2 });

// ── ADOLESCENCE (13-17) : Identité et passions ──

ev("ado", "pers_rebellion", "L'heure de couvre-feu",
  "Il est 22h. Vos parents dorment. Une fête vous attend dehors, avec des amis.",
  [
    { text: "Sortir, en silence, prendre le risque.",
      effects: { social: 8, bonheur: 8, energie: -5 },
      result: "La nuit est belle. Les amis, la musique. Le risque, aussi." },
    { text: "Rester, dormir, obéir.",
      effects: { sante: 5, bonheur: 3 },
      result: "Le matin, tout est calme. Mais une envie reste, quelque part." }
  ], { type: "perso", once: false, weight: 3 });

ev("ado", "pers_amitie_tendue", "La dispute avec ton meilleur ami",
  "Une parole blessante. Un silence qui dure depuis trois jours. Vous vous manquez, mais l'orgueil résiste.",
  [
    { text: "Aller vers lui, présenter des excuses.",
      effects: { social: 10, bonheur: 7 },
      result: "L'amitié reprend, plus forte. La colère s'est évaporée." },
    { text: "Attendre qu'il vienne, lui.",
      effects: { bonheur: -3 },
      result: "Les jours passent. L'ami aussi s'éloigne, peut-être pour toujours." }
  ], { type: "relation", once: false, weight: 4 });

ev("ado", "pers_confiance", "Le secret de l'autre",
  "Votre meilleure amie vous confie un secret grave. Vous promettez de ne rien dire. Un autre ami le demande.",
  [
    { text: "Garder le secret, coûte que coûte.",
      effects: { confiance: 8, bonheur: 5 },
      result: "Le secret reste entre vous deux. La confiance, c'est ça." },
    { text: "Le révéler, pour être compris.",
      effects: { social: 5, confiance: -8 },
      result: "On vous comprend. Mais votre amie ne vous regarde plus de la même façon." }
  ], { type: "relation", once: false, weight: 2 });

ev("ado", "pers_ambitieux", "Le projet d'avenir",
  "Le conseiller d'orientation vous demande : « Et après le lycée, qu'est-ce que vous voulez faire ? »",
  [
    { text: "Avoir un projet précis, ambitieux.",
      effects: { intelligence: 8, bonheur: 5 },
      result: "Vous savez où vous allez. Le chemin sera long, mais tracé." },
    { text: "Avouer que vous ne savez pas, encore.",
      effects: { bonheur: 4 },
      result: "L'incertitude est lourde. Mais elle laisse place à toutes les possibilités." }
  ], { type: "carriere", once: false, weight: 3 });

ev("ado", "pers_anxieux", "L'examen qui approche",
  "Demain, l'examen. Vous avez révisé. Ou pas assez. Le cœur bat trop fort.",
  [
    { text: "Réviser toute la nuit.",
      effects: { intelligence: 5, sante: -3 },
      result: "Vous connaissez tout. Ou presque. La fatigue, elle, est là." },
    { text: "Dormir, faire confiance au hasard.",
      effects: { sante: 5, bonheur: 3 },
      result: "Le sommeil revient. Le risque, aussi." }
  ], { type: "perso", once: false, weight: 3 });

// ── JEUNESSE (18-24) : Choix de vie ──

ev("jeune", "pers_individualiste", "Le premier appartement",
  "Vous emménagez seul(e). Le silence est nouveau. La liberté, aussi.",
  [
    { text: "Profiter de cette solitude, s'y épanouir.",
      effects: { bonheur: 8, intelligence: 4 },
      result: "Vous apprenez à vivre avec vous-même. Et c'est bon." },
    { text: "Appeler des amis, remplir l'espace.",
      effects: { social: 8, bonheur: 6 },
      result: "L'appartement se remplit de rires. La solitude attendra." }
  ], { type: "perso", once: false, weight: 3 });

ev("jeune", "pers_volontaire", "Le premier échec professionnel",
  "Le refus est dans l'email. « Votre candidature n'a pas été retenue. »",
  [
    { text: "Revenir encore, postuler ailleurs.",
      effects: { intelligence: 5, bonheur: -3 },
      result: "Le refus fait mal. Mais vous avancez. Toujours." },
    { text: "Se demander si c'était le bon chemin.",
      effects: { bonheur: -5 },
      result: "Le doute s'installe. Et si vous vous trompiez de route ?" }
  ], { type: "carriere", once: false, weight: 3 });

ev("jeune", "pers_romantique", "La première histoire sérieuse",
  "Les regards se prolongent. Les mains se cherchent. Vous sentez que c'est différent, cette fois.",
  [
    { text: "S'engager, totalement, sans filet.",
      effects: { social: 8, bonheur: 10, confiance: 5 },
      result: "Vous dites « je t'aime » sans compter. Le risque fait partie du jeu." },
    { text: "Prendre son temps, se protéger.",
      effects: { confiance: 5, bonheur: 4 },
      result: "L'amour avance, doucement. Vous gardez une porte de sortie." }
  ], { type: "amour", once: false, weight: 4 });

// ── ÂGE ADULTE (25-40) : Responsabilités ──

ev("adulte", "pers_genereux", "Le sans-abri dans la rue",
  "Il est assis sur le trottoir, une main tendue, les yeux las. Vous passez devant.",
  [
    { text: "Donner ce que vous avez dans la poche.",
      effects: { social: 6, bonheur: 6 },
      result: "Il vous remercie, les larmes aux yeux. Vous partez plus léger." },
    { text: "Passer votre chemin, vite.",
      effects: { bonheur: -3 },
      result: "Le regard vous suit. Vous marcherez vite, ce soir." }
  ], { type: "perso", once: false, weight: 3 });

ev("adulte", "pers_ambitieux_carriere", "La promotion qui divise",
  "Une promotion arrive. Mais elle implique de déménager, loin de vos proches.",
  [
    { text: "Accepter, saisir l'opportunité.",
      effects: { intelligence: 8, argent: 10, social: -5 },
      result: "Vous partez. La carrière avance. Les visages familiers s'effacent un peu." },
    { text: "Refuser, rester près des vôtres.",
      effects: { social: 8, bonheur: 5 },
      result: "Vous restez. La carrière attendra. Les proches, eux, sont là." }
  ], { type: "carriere", once: false, weight: 3 });

ev("adulte", "pers_patient", "L'attente du résultat médical",
  "Le cabinet médical. L'enveloppe est fermée. Vous ne savez pas encore ce qu'elle contient.",
  [
    { text: "L'ouvrir, faire face, quoi qu'il arrive.",
      effects: { sante: 3, confiance: 5 },
      result: "Vous savez. Quoi qu'il en soit, vous affrontez." },
    { text: "Laisser un proche l'ouvrir, pour vous.",
      effects: { confiance: 3, bonheur: 4 },
      result: "Quelqu'un de confiance lit pour vous. Vous n'êtes pas seul(e)." }
  ], { type: "sante", once: false, weight: 2 });

ev("adulte", "pers_sociable", "La soirée chez des inconnus",
  "Une fête. Vous ne connaissez presque personne. La musique est forte, les rires sont forts.",
  [
    { text: "Aller vers les inconnus, lancer la conversation.",
      effects: { social: 10, bonheur: 6 },
      result: "De nouvelles têtes, de nouvelles histoires. La soirée est belle." },
    { text: "Rester dans un coin, observer.",
      effects: { bonheur: 3 },
      result: "Vous regardez les autres s'amuser. C'est doux, aussi, d'être en retrait." }
  ], { type: "social", once: false, weight: 3 });

// ── MATURITÉ (40-60) : Bilans et choix ──

ev("maturite", "pers_pardon", "La lettre d'excuses",
  "Vous retrouvez une vieille lettre, non envoyée. Quelqu'un que vous avez blessé, il y a longtemps.",
  [
    { text: "L'envoyer, enfin.",
      effects: { confiance: 8, bonheur: 7, social: 5 },
      result: "La réponse vient. Le pardon aussi, peut-être." },
    { text: "La déchirer, laisser le passé.",
      effects: { bonheur: 3 },
      result: "Certaines blessures se referment mieux sans mots." }
  ], { type: "relation", once: false, weight: 2 });

ev("maturite", "pers_financier", "L'achat impulsif",
  "Une publicité, un objet qui brille, une carte de crédit. Vous n'en avez pas besoin. Vous le voulez.",
  [
    { text: "L'acheter, profiter maintenant.",
      effects: { bonheur: 8, argent: -30 },
      result: "L'objet est chez vous. Le plaisir dure quelques jours." },
    { text: "Reporter, réfléchir, économiser.",
      effects: { argent: 5, confiance: 3 },
      result: "L'argent reste. La satisfaction, aussi, d'avoir attendu." }
  ], { type: "argent", once: false, weight: 3 });

ev("maturite", "pers_equilibre", "Le burn-out qui guette",
  "Les semaines s'enchaînent, les nuits raccourcissent. Votre corps vous envoie des signaux.",
  [
    { text: "Prendre du repos, ralentir le rythme.",
      effects: { sante: 8, bonheur: 6, energie: 5 },
      result: "Vous vous écoutez. Le corps vous remercie." },
    { text: "Continuer, coûte que coûte.",
      effects: { energie: 5, sante: -5 },
      result: "Vous tenez. Jusqu'à quand ?" }
  ], { type: "sante", once: false, weight: 2 });

ev("maturite", "pers_transmission", "L'enfant qui pose des questions",
  "Votre enfant vous demande : « Qu'est-ce qui est vraiment important dans la vie ? »",
  [
    { text: "Lui répondre avec honnêteté, cœur ouvert.",
      effects: { bonheur: 8, social: 6 },
      result: "La conversation dure longtemps. Vous avez transmis quelque chose." },
    { text: "Répondre par une phrase toute faite.",
      effects: { bonheur: 2 },
      result: "L'enfant accepte. Mais son regard cherche autre chose." }
  ], { type: "famille", once: false, weight: 2 });

// ── RETRAITE (60+) : Héritage et sagesse ──

ev("retraite", "pers_sagesse", "Le petit-enfant qui demande conseil",
  "Votre petit-enfant vous regarde, les yeux pleins de questions sur la vie.",
  [
    { text: "Raconter vos erreurs, pas seulement vos succès.",
      effects: { bonheur: 8, social: 6 },
      result: "L'enfant écoute, fasciné. Vous avez transmis quelque chose de vrai." },
    { text: "Lui dire de suivre son propre chemin.",
      effects: { bonheur: 6, confiance: 5 },
      result: "L'enfant hoche la tête. Il fera ses propres erreurs, et ses propres victoires." }
  ], { type: "famille", once: false, weight: 3 });

ev("retraite", "pers_legue", "La lettre d'adieu",
  "Vous écrivez ce que vous voulez laisser derrière vous. Pas des biens, mais des mots.",
  [
    { text: "L'écrire pour vos proches.",
      effects: { bonheur: 8, social: 5 },
      result: "Les mots restent. Ils porteront, après vous." },
    { text: "Décider que rien n'est nécessaire.",
      effects: { bonheur: 4 },
      result: "Vous avez vécu. Cela suffit." }
  ], { type: "famille", once: false, weight: 2 });

// ── ÉVÉNEMENTS FINANCIERS RÉALISTES ──

ev("jeune", "fin_depense_impulsion", "L'achat compulsif",
  "Une publicité en ligne, un objet qui brille. Vous n'en avez pas besoin. Vous le voulez.",
  [
    { text: "L'acheter, profiter maintenant.",
      effects: { bonheur: 6, argent: -15 },
      result: "L'objet est chez vous. Le plaisir dure quelques jours." },
    { text: "Reporter, réfléchir, économiser.",
      effects: { argent: 5, confiance: 3 },
      result: "L'argent reste. La satisfaction, aussi, d'avoir attendu." }
  ], { type: "argent", once: false, weight: 4 });

ev("jeune", "fin_premier_salaire", "Le premier vrai salaire",
  "Le premier bulletin de paie tombe. L'argent est à vous. Vraiment.",
  [
    { text: "Tout dépenser, célébrer.",
      effects: { bonheur: 8, argent: -20 },
      result: "Une soirée mémorable. Le portefeuille est vide, le cœur est plein." },
    { text: "Économiser, construire l'avenir.",
      effects: { argent: 10, confiance: 5 },
      result: "L'argent travaille pour vous. La sécurité grandit." }
  ], { type: "argent", once: false, weight: 3 });

ev("adulte", "fin_depense_medicale", "La facture médicale inattendue",
  "Une douleur, un rendez-vous, une facture qui tombe. L'assurance ne couvre pas tout.",
  [
    { text: "Payer, sans discuter.",
      effects: { argent: -25, sante: 5 },
      result: "La santé n'a pas de prix. Mais elle a un coût." },
    { text: "Reporter les soins, pour l'instant.",
      effects: { argent: 5, sante: -5 },
      result: "L'argent reste. La douleur, elle, attend." }
  ], { type: "argent", once: false, weight: 3 });

ev("adulte", "fin_investissement", "L'opportunité d'investissement",
  "Un ami vous parle d'une affaire. Rentable, dit-il. Risquée, ajoute-t-il.",
  [
    { text: "Investir une partie de vos économies.",
      effects: { argent: [10, 50], bonheur: 5 },
      result: "L'investissement porte ses fruits. Votre argent travaille." },
    { text: "Refuser, garder votre épargne en sécurité.",
      effects: { argent: 5, confiance: 3 },
      result: "L'argent dort. Mais il est là, quand vous en aurez besoin." }
  ], { type: "argent", once: false, weight: 3 });

ev("maturite", "fin_divorce_lien", "La séparation financière",
  "Une séparation. Les comptes se séparent. Le patrimoine, aussi.",
  [
    { text: "Accepter le partage, tourner la page.",
      effects: { argent: -40, bonheur: -5 },
      result: "Vous repartez avec moins. Mais vous repartez libre." },
    { text: "Se battre pour chaque euro.",
      effects: { argent: 10, bonheur: -10, tension: 20 },
      result: "Vous gardez plus. Mais la blessure est plus profonde." }
  ], { type: "argent", once: false, weight: 2 });

ev("retraite", "fin_retraite_reduite", "La retraite qui baisse",
  "La caisse de retraite vous informe : votre pension sera plus faible que prévu.",
  [
    { text: "Ajuster votre style de vie.",
      effects: { argent: -5, bonheur: 3 },
      result: "Vous vivez avec moins. Mais vous vivez." },
    { text: "Trouver un petit boulot, rester actif.",
      effects: { argent: 15, energie: -3 },
      result: "Vous travaillez encore. Mais à votre rythme." }
  ], { type: "argent", once: false, weight: 2 });

// ── ÉVÉNEMENTS LIÉS À DES PERSONNES EXISTANTES ──

ev("ado", "pers_ami_loyal", "L'ami qui reste",
  "Votre ami d'enfance est toujours là, même quand les autres sont partis. Il vous appelle ce soir.",
  [
    { text: "Lui répondre, passer du temps avec lui.",
      effects: { social: 8, bonheur: 7, confiance: 5 },
      result: "Vous revivez vos souvenirs d'enfance. L'amitié résiste au temps." },
    { text: "Dire que vous êtes occupé, reporter.",
      effects: { social: -3, bonheur: -2 },
      result: "L'ami comprend. Mais l'éloignement s'installe, doucement." }
  ], { type: "relation", once: false, weight: 3 });

ev("ado", "pers_ami_toxique", "L'ami qui tire vers le bas",
  "Cet ami vous entraîne dans des bêtises. Des ennuis. Vous commencez à douter de cette amitié.",
  [
    { text: "Continuer avec lui, par loyauté.",
      effects: { social: 5, bonheur: -3, stress: 5 },
      result: "Vous restez dans le groupe. Mais le malaise grandit." },
    { text: "S'éloigner, doucement, définitivement.",
      effects: { social: -5, bonheur: 5, confiance: 3 },
      result: "Vous dites au revoir. Le poids s'allège, mais la solitude vient." }
  ], { type: "relation", once: false, weight: 2 });

ev("jeune", "pers_coloc", "Le colocataire qui change tout",
  "Votre nouveau colocataire est différent de vous. Plus rangé. Plus bruyant. Plus tout.",
  [
    { text: "Apprendre à vivre avec ses différences.",
      effects: { social: 6, intelligence: 4, bonheur: 4 },
      result: "Vous apprenez de lui. Il apprend de vous. La colocation fonctionne." },
    { text: "Lui demander de partir, trouver un autre.",
      effects: { social: -5, argent: -10, bonheur: 3 },
      result: "Vous vivez seul(e). Plus cher. Mais plus calme." }
  ], { type: "relation", once: false, weight: 2 });

ev("adulte", "pers_collegue_mentor", "Le mentor au travail",
  "Un collègue plus âgé vous prend sous son aile. Il voit votre potentiel.",
  [
    { text: "Accepter son aide, apprendre de lui.",
      effects: { intelligence: 8, respect: 8, bonheur: 6 },
      result: "Vous progressez vite. Il devient une référence pour vous." },
    { text: "Refuser, faire seul.",
      effects: { intelligence: 3, confiance: 5 },
      result: "Vous avancez à votre rythme. Mais plus lentement." }
  ], { type: "carriere", once: false, weight: 3 });

ev("adulte", "pers_conjoint_soutien", "Le conjoint dans l'épreuve",
  "Vous traversez une période difficile. Votre conjoint est là, chaque jour, sans rien demander.",
  [
    { text: "Lui ouvrir votre cœur, tout lui dire.",
      effects: { confiance: 10, bonheur: 8, social: 5 },
      result: "Il écoute. Il comprend. Vous ne serez plus seul(e) dans l'épreuve." },
    { text: "Garder pour vous, le protéger.",
      effects: { confiance: 3, bonheur: -3 },
      result: "Vous portez le fardeau seul(e). Il le sent, mais ne dit rien." }
  ], { type: "amour", once: false, weight: 4 });

ev("maturite", "pers_parent_age", "Le parent qui vieillit",
  "Votre parent a du mal à se déplacer. Vous remarquez qu'il a besoin d'aide, de plus en plus souvent.",
  [
    { text: "Lui consacrer du temps, régulièrement.",
      effects: { social: 8, bonheur: 6, energie: -3 },
      result: "Vous passez des après-midis avec lui. Vous créez de nouveaux souvenirs." },
    { text: "Lui proposer une aide extérieure, garder vos distances.",
      effects: { social: 3, bonheur: -2 },
      result: "Il est aidé. Mais vous sentez que quelque chose se brise, doucement." }
  ], { type: "famille", once: false, weight: 3 });

ev("maturite", "pers_enfant_adulte", "L'enfant qui part",
  "Votre enfant quitte la maison pour ses études ou son travail. La maison est plus vide.",
  [
    { text: "Lui envoyer des messages, l'appeler souvent.",
      effects: { social: 6, bonheur: 5 },
      result: "Le lien reste fort, malgré la distance." },
    { text: "Laisser son indépendance, ne pas le déranger.",
      effects: { bonheur: -2 },
      result: "La maison est silencieuse. Vous vous habituez, lentement." }
  ], { type: "famille", once: false, weight: 3 });

ev("retraite", "pers_ami_retraite", "L'ami qui prend sa retraite aussi",
  "Votre meilleur ami prend sa retraite, lui aussi. Vous avez maintenant tout votre temps, tous les deux.",
  [
    { text: "Voyager ensemble, réaliser vos projets d'enfance.",
      effects: { bonheur: 10, social: 8 },
      result: "Vous partez à l'aventure. La vie reprend, différemment." },
    { text: "Chacun chez soi, se voir parfois.",
      effects: { social: 5, bonheur: 4 },
      result: "Vous vous voyez de temps en temps. C'est suffisant, ainsi." }
  ], { type: "relation", once: false, weight: 2 });

ev("retraite", "pers_legende", "L'héritage des histoires",
  "Vos petits-enfants vous demandent de raconter votre vie. Vous avez tant à leur dire.",
  [
    { text: "Raconter tout, les réussites comme les échecs.",
      effects: { bonheur: 8, social: 6 },
      result: "Ils écoutent, les yeux brillants. Votre histoire les inspire." },
    { text: "Raconter seulement les beaux moments.",
      effects: { bonheur: 6 },
      result: "Ils rient, émerveillés. Mais vous savez qu'il y a plus, sous le récit." }
  ], { type: "famille", once: false, weight: 2 });

ev("retraite", "pers_deces_ami", "La perte d'un ami d'enfance",
  "Un ami d'enfance est parti. Vous vous rendez compte à quel point il comptait pour vous.",
  [
    { text: "Aller à ses funérailles, honorer sa mémoire.",
      effects: { social: 5, bonheur: -5 },
      result: "Vous pleurez. Vous vous souvenez. Vous ne l'oublierez pas." },
    { text: "Ne pas y aller, garder vos souvenirs.",
      effects: { bonheur: -8 },
      result: "Vous ne dites pas au revoir. Mais le vide reste, tout pareil." }
  ], { type: "famille", once: false, weight: 3 });

/* ------------------------------------------------------------
   ÉVÉNEMENTS JALONS (forcés à certains âges)
   ------------------------------------------------------------ */
var MILESTONES = {
  18: {
    id: "grand_choix",
    stage: "ado",
    title: "Le grand choix",
    text: "La majorité s'annonce. Devant vous, des routes se séparent : les études supérieures, le monde du travail, ou l'audace de créer votre propre chemin.",
    choices: [
      { text: "Poursuivre de longues études.",
        effects: { intelligence: 12, argent: -15, bonheur: 3 }, result: "Les amphis vous attendent. Vous plongez dans le savoir.", flag: "etudes", career: "etudes" },
      { text: "Entrer directement dans la vie active.",
        effects: { argent: 20, energie: -5, intelligence: 3 }, result: "Premier bulletin de salaire, premières responsabilités.", flag: "travail", career: "travail" },
      { text: "Monter votre propre projet.",
        effects: { argent: -10, bonheur: 10, energie: 10 }, result: "Risque et liberté : votre aventure commence.", flag: "entreprise", career: "entreprise" }
    ]
  },
  66: {
    id: "grande_retraite",
    stage: "maturite",
    title: "La retraite s'annonce",
    text: "Après des décennies de travail, la porte de la retraite s'ouvre. Les jours sans réveil, les semaines sans échéance... et un grand vide à remplir, ou à savourer.",
    choices: [
      { text: "Savourer cette liberté retrouvée.",
        effects: { bonheur: 12, energie: 5 }, result: "Les matins sans réveil, les après-midis sans contrainte. Un long été commence.", retire: true },
      { text: "Vous sentir soudainement perdu.",
        effects: { bonheur: -8 }, result: "Les habitudes s'effondrent. Il faudra réinventer les jours.", retire: true }
    ]
  }
};

/* ------------------------------------------------------------
   Fins de vie
   ------------------------------------------------------------ */
var ENDINGS = {
  vieux: {
    kicker: "Après une longue vie",
    title: "La dernière lumière",
    epitaph: "Les années ont filé comme un fleuve, et le fleuve rejoint la mer."
  },
  maladie: {
    kicker: "Une vie trop courte",
    title: "Le chemin s'arrête",
    epitaph: "Le corps a lâché avant le rêve. Mais chaque jour vécu a compté."
  },
  accident: {
    kicker: "Le destin s'emballe",
    title: "Le dernier tournant",
    epitaph: "Un tournant imprévu, un chemin interrompu. Les vivants se souviennent."
  }
};

/* Helper : titre de vie selon les stats dominantes */
function lifeTitle(state) {
  var t = [];
  if (state.stats.argent >= 80) t.push("Bâtisseur de fortune");
  if (state.stats.intelligence >= 80) t.push("Esprit éclairé");
  if (state.stats.social >= 80) t.push("Cœur de la communauté");
  if (state.stats.bonheur >= 80) t.push("Âme heureuse");
  if (state.stats.sante >= 80) t.push("Chêne robuste");
  if (t.length === 0) {
    if (state.stats.bonheur < 30) t.push("Vie tourmentée");
    else t.push("Vie équilibrée");
  }
  return t.slice(0, 2).join(" et ");
}