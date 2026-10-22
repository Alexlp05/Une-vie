/* ============================================================
   UNE VIE v0.5 — ORIGINES & LIEUX DE NAISSANCE
   12 origines familiales + villes/régions selon époque
   ============================================================ */

var ORIGINS = [
  {
    id: "populaire",
    name: "Famille populaire",
    tagline: "Des racines solides, peu de filets",
    desc: "Parents ouvriers ou employés. L'entraide compte plus que l'argent. Tu as appris la valeur du travail tôt.",
    flag: "famille_populaire",
    money: 0,
    stats: { sante: 5, energie: 5 },
    passions: {},
    traitsBoost: ["loyal", "travailleur", "solidaire"],
    lieux: ["banlieue_parisienne", "nord_pas_de_calais", "rhone_alpes", "provence", "aquitaine"],
    classeSociale: "populaire",
    culture: "francaise_traditionnelle"
  },
  {
    id: "aisee",
    name: "Famille aisée",
    tagline: "Confort sans excès, éducation soignée",
    desc: "Parents cadres moyens. Piano, cours de tennis, vacances à la mer. La réussite est attendue, pas négociable.",
    flag: "famille_aisee",
    money: 25000,
    stats: { argent: 5, bonheur: 5 },
    passions: {},
    traitsBoost: ["perfectionniste", "ambitieux", "casanier"],
    lieux: ["paris_ouest", "versailles", "lyon_ouest", "bordeaux_centre", "nantes_centre"],
    classeSociale: "moyenne_superieure",
    culture: "francaise_bourgeoise"
  },
  {
    id: "heritage",
    name: "Famille d'héritage",
    tagline: "Un nom, un domaine, une dette d'honneur",
    desc: "Vieux nom, terres, châteaux. L'argent est là mais il faut le mériter. Le poids des ancêtres sur les épaules.",
    flag: "famille_heritage",
    money: 80000,
    stats: { argent: 10 },
    passions: { peinture: 1, ecriture: 1 },
    traitsBoost: ["orgueilleux", "nostalgique", "protecteur"],
    lieux: ["loire_chateaux", "provence_domaine", "normandie_manoir", "bordelais_vignoble", "paris_16e"],
    classeSociale: "tres_elevee",
    culture: "aristocratique"
  },
  {
    id: "pouvoir",
    name: "Famille de pouvoir",
    tagline: "Le pouvoir se murmure à l'oreille",
    desc: "Parents politiques, hauts fonctionnaires, diplomates. Les dîners décident du sort du pays. Tu connais les codes.",
    flag: "famille_pouvoir",
    money: 60000,
    stats: { social: 10, intelligence: 5 },
    passions: {},
    traitsBoost: ["ambitieux", "calculateur", "diplomate"],
    lieux: ["paris_7e", "neuilly", "lyon_6e", "strasbourg_institutions", "bruxelles"],
    classeSociale: "tres_elevee",
    culture: "politique"
  },
  {
    id: "artistique",
    name: "Famille artistique",
    tagline: "La beauté avant le compte en banque",
    desc: "Peintres, musiciens, écrivains. La table du dîner est un atelier. L'argent est secondaire, l'expression vitale.",
    flag: "famille_artistique",
    money: 15000,
    stats: { bonheur: 10, social: 5 },
    passions: { musique: 1, peinture: 1, theatre: 1 },
    traitsBoost: ["creatif", "reveur", "romantique"],
    lieux: ["paris_montmartre", "paris_belleville", "marseille_vieux_port", "aix_en_provence", "nantes_ile_nantes"],
    classeSociale: "moyenne",
    culture: "boheme"
  },
  {
    id: "sportive",
    name: "Famille sportive",
    tagline: "L'effort comme seule noblesse",
    desc: "Entraînements à 6h, compétitions le week-end. La discipline forge le corps et l'esprit. L'échec n'est pas une option.",
    flag: "famille_sportive",
    money: 20000,
    stats: { sante: 10, energie: 10 },
    passions: { sport: 2 },
    traitsBoost: ["travailleur", "ambitieux", "rigide"],
    lieux: ["fontainebleau", "grenoble", "annecy", "la_rochelle", "perpignan"],
    classeSociale: "moyenne",
    culture: "sportive"
  },
  {
    id: "academique",
    name: "Famille académique",
    tagline: "Le savoir est le vrai patrimoine",
    desc: "Professeurs, chercheurs, bibliothécaires. Les murs sont des bibliothèques. La curiosité est la seule religion.",
    flag: "famille_academique",
    money: 30000,
    stats: { intelligence: 15 },
    passions: { ecriture: 1, technologie: 1, lecture: 2 },
    traitsBoost: ["curieux", "intellectuel", "perfectionniste"],
    lieux: ["paris_latin", "toulouse_universite", "montpellier", "rennes", "grenoble"],
    classeSociale: "moyenne_superieure",
    culture: "intellectuelle"
  },
  {
    id: "migrante",
    name: "Famille migrante",
    tagline: "Deux pays en soi, la force du déracinement",
    desc: "Parents venus d'ailleurs. La langue de la maison n'est pas celle de l'école. Tu jongles entre deux mondes.",
    flag: "famille_migrante",
    money: 5000,
    stats: { energie: 10, bonheur: 5 },
    passions: { cuisine: 1 },
    traitsBoost: ["loyal", "courageux", "independant"],
    lieux: ["paris_19e", "marseille_noailles", "lyon_guillotière", "lille_wazemmes", "toulouse_mira"],
    classeSociale: "populaire",
    culture: "migrante",
    cultureOrigine: ["maghreb", "afrique_subsaharienne", "asie", "europe_de_lest", "amerique_latine", "outre_mer"]
  },
  {
    id: "prestigieuse",
    name: "Famille prestigieuse",
    tagline: "Les portes s'ouvrent avant qu'on ne frappe",
    desc: "Nom connu, carnet d'adresses plein. L'excellence est la norme. L'échec est impensable, donc invisible.",
    flag: "famille_prestigieuse",
    money: 100000,
    stats: { social: 15, argent: 10 },
    passions: {},
    traitsBoost: ["ambitieux", "charmeur", "orgueilleux"],
    lieux: ["paris_8e", "neuilly_sur_seine", "saint_cloud", "le_vesinet", "geneve"],
    classeSociale: "tres_elevee",
    culture: "elite"
  },
  {
    id: "commercante",
    name: "Famille commerçante",
    tagline: "Le sens du négoce dans le sang",
    desc: "Boutique, marché, PME familiale. Tu as grandi derrière un comptoir. Client roi, marge sacrée, stock tourné.",
    flag: "famille_commercante",
    money: 40000,
    stats: { argent: 10, social: 5 },
    passions: {},
    traitsBoost: ["calculateur", "bavard", "entrepreneurs"],
    lieux: ["marseille_vieux_port", "lyon_presquile", "bordeaux_chartrons", "nantes_bouffay", "strasbourg_petite_france"],
    classeSociale: "moyenne_superieure",
    culture: "commerciale"
  },
  {
    id: "agricole",
    name: "Famille agricole",
    tagline: "La terre ne ment jamais",
    desc: "Exploitation céréalière, vigne, élevage. Le rythme des saisons dicte la vie. Fièvre aphteuse, gel, PAC : le réel est rude.",
    flag: "famille_agricole",
    money: 10000,
    stats: { sante: 10, energie: 5 },
    passions: { nature: 1, cuisine: 1 },
    traitsBoost: ["travailleur", "pragmatique", "nostalgique"],
    lieux: ["beauce", "bresse", "champagne", "languedoc", "perpignan_campagne", "dordogne"],
    classeSociale: "populaire",
    culture: "rurale"
  },
  {
    id: "eclatee",
    name: "Famille éclatée",
    tagline: "Reconstruire là où d'autres ont tout cassé",
    desc: "Divorce jeune, parents absents, foyers d'accueil. Tu as dû te faire toi-même. La résilience est ta seule famille.",
    flag: "famille_eclatee",
    money: -10000,
    stats: { bonheur: -5, social: -5 },
    passions: {},
    traitsBoost: ["independant", "rancunier", "cynique"],
    lieux: ["paris_belleville", "marseille_quartiers_nord", "lyon_mermoz", "rouen_grand_mare", "nantes_malakoff"],
    classeSociale: "precaire",
    culture: "precaire"
  }
];

// Lieux de naissance par époque (pour générer PNJ cohérents)
var LIEUX_NAISSANCE = {
  // Par région, avec poids démographiques
  "ile_de_france": { weight: 18, villes: ["Paris", "Boulogne-Billancourt", "Saint-Denis", "Argenteuil", "Montreuil", "Nanterre", "Vitry-sur-Seine", "Créteil", "Aubervilliers", "Asnières"] },
  "auvergne_rhone_alpes": { weight: 12, villes: ["Lyon", "Villeurbanne", "Saint-Étienne", "Grenoble", "Clermont-Ferrand", "Annecy", "Chambéry", "Valence", "Roanne", "Thonon"] },
  "hauts_de_france": { weight: 9, villes: ["Lille", "Roubaix", "Tourcoing", "Dunkerque", "Calais", "Boulogne", "Valenciennes", "Lens", "Douai", "Maubeuge"] },
  "nouvelle_aquitaine": { weight: 9, villes: ["Bordeaux", "Bayonne", "Pau", "La Rochelle", "Limoges", "Poitiers", "Périgueux", "Agen", "Niort", "Angoulême"] },
  "occitanie": { weight: 9, villes: ["Toulouse", "Montpellier", "Nîmes", "Perpignan", "Béziers", "Montauban", "Albi", "Carcassonne", "Sète", "Rodez"] },
  "provence_alpes_cote_azur": { weight: 8, villes: ["Marseille", "Nice", "Toulon", "Aix-en-Provence", "Avignon", "Cannes", "Antibes", "Arles", "Martigues", "Aubagne"] },
  "grand_est": { weight: 8, villes: ["Strasbourg", "Reims", "Metz", "Mulhouse", "Nancy", "Colmar", "Troyes", "Chaumont", "Épinal", "Saint-Dié"] },
  "pays_de_la_loire": { weight: 6, villes: ["Nantes", "Angers", "Le Mans", "Saint-Nazaire", "Laval", "La Roche-sur-Yon", "Cholet", "Saumur", "Châteaubriant", "Fontenay"] },
  "bretagne": { weight: 5, villes: ["Rennes", "Brest", "Quimper", "Lorient", "Vannes", "Saint-Malo", "Saint-Brieuc", "Lannion", "Morlaix", "Pontivy"] },
  "normandie": { weight: 5, villes: ["Rouen", "Caen", "Le Havre", "Cherbourg", "Évreux", "Dieppe", "Alençon", "Lisieux", "Saint-Lô", "Granville"] },
  "centre_val_de_loire": { weight: 4, villes: ["Tours", "Orléans", "Bourges", "Blois", "Chartres", "Châteauroux", "Issoudun", "Romorantin", "Vendôme", "Loches"] },
  "bourgogne_franche_comte": { weight: 4, villes: ["Dijon", "Besançon", "Nevers", "Auxerre", "Chalon-sur-Saône", "Mâcon", "Montbéliard", "Sens", "Autun", "Lons-le-Saunier"] },
  "corse": { weight: 1, villes: ["Ajaccio", "Bastia", "Porto-Vecchio", "Corte", "Calvi", "Propriano", "Sartène", "Ghisonaccia", "L'Île-Rousse", "Bonifacio"] },
  "outre_mer": { weight: 3, villes: ["Saint-Denis (974)", "Fort-de-France", "Pointe-à-Pitre", "Cayenne", "Mamoudzou", "Saint-Pierre", "Le Lamentin", "Le Robert", "Sainte-Marie", "Le Tampon"] }
};

// Cultures pour PNJ migrants
var CULTURES_MIGRANTES = [
  { id: "maghreb", label: "Maghrébine", prenomsH: ["Mohamed", "Karim", "Youssef", "Samir", "Rachid", "Mehdi", "Amine", "Bilal", "Yanis", "Adam"], prenomsF: ["Fatima", "Aicha", "Leila", "Sarah", "Ines", "Yasmina", "Malika", "Nadia", "Sofia", "Amina"], noms: ["Benali", "Bennani", "Cherif", "Douibi", "El Amrani", "Fassi", "Guedira", "Haddad", "Idrissi", "Jabri", "Khalfallah", "Lamrani", "Marrakchi", "Naciri", "Ouazzani"] },
  { id: "afrique_subsaharienne", label: "Africaine (subsaharienne)", prenomsH: ["Mamadou", "Ibrahima", "Ousmane", "Amadou", "Cheikh", "Moussa", "Abdoulaye", "Seydou", "Boubacar", "Modibo"], prenomsF: ["Aminata", "Fatou", "Awa", "Mariama", "Kadiatou", "Hawa", "Ramatoulaye", "Ndeye", "Sokhna", "Coumba"], noms: ["Diallo", "Sow", "Ba", "Diop", "Ndiaye", "Fall", "Camara", "Traore", "Keita", "Konate", "Sylla", "Toure", "Coulibaly", "Cisse", "Kone"] },
  { id: "asie", label: "Asiatique", prenomsH: ["Wei", "Chen", "Li", "Zhang", "Wang", "Liu", "Yang", "Huang", "Zhao", "Wu", "Minh", "Duc", "Anh", "Tuan", "Vinh"], prenomsF: ["Mei", "Xiu", "Lan", "Yan", "Jing", "Li", "Wei", "Xin", "Yan", "Fang", "Lan", "Mai", "Hoa", "Thao", "Phuong"], noms: ["Nguyen", "Tran", "Le", "Pham", "Hoang", "Vu", "Dang", "Bui", "Do", "Ho", "Ngo", "Duong", "Ly", "Kim", "Park", "Lee", "Kim", "Choi", "Jung", "Kang"] },
  { id: "europe_de_lest", label: "Européenne de l'Est", prenomsH: ["Ivan", "Dimitri", "Alexei", "Sergei", "Andrei", "Vladimir", "Mikhail", "Nikolai", "Pavel", "Oleg"], prenomsF: ["Elena", "Natalia", "Olga", "Svetlana", "Irina", "Maria", "Anna", "Tatiana", "Yulia", "Ekaterina"], noms: ["Petrov", "Ivanov", "Smirnov", "Kuznetsov", "Popov", "Sokolov", "Lebedev", "Kozlov", "Novikov", "Morozov", "Volkov", "Soloviev", "Vasilev", "Zaitsev", "Pavlov"] },
  { id: "amerique_latine", label: "Latino-américaine", prenomsH: ["Carlos", "Juan", "Luis", "Miguel", "Jorge", "Pedro", "Alejandro", "Manuel", "Roberto", "Fernando"], prenomsF: ["Maria", "Ana", "Laura", "Sofia", "Isabel", "Carmen", "Lucia", "Valentina", "Camila", "Gabriela"], noms: ["Garcia", "Rodriguez", "Gonzalez", "Fernandez", "Lopez", "Martinez", "Sanchez", "Perez", "Gomez", "Martin", "Jimenez", "Ruiz", "Hernandez", "Diaz", "Moreno"] },
  { id: "outre_mer", label: "Ultra-marine", prenomsH: ["Jean", "Marie", "Pierre", "Louis", "Andre", "Michel", "Paul", "Jacques", "Nicolas", "Alexandre"], prenomsF: ["Marie", "Nathalie", "Sylvie", "Catherine", "Isabelle", "Christine", "Sandrine", "Veronique", "Patricia", "Laurence"], noms: ["Jean-Baptiste", "Joseph", "Louis", "Pierre", "Andre", "Michel", "Paul", "Louis", "Simon", "Robert", "Henry", "Noel", "Blanc", "Petit", "Bernard"] }
];

// Helper : tirage lieu selon poids
function pickLieuNaissance() {
  var total = 0;
  Object.values(LIEUX_NAISSANCE).forEach(function (r) { total += r.weight; });
  var r = Math.random() * total;
  var region = null;
  for (var k in LIEUX_NAISSANCE) {
    r -= LIEUX_NAISSANCE[k].weight;
    if (r <= 0) { region = k; break; }
  }
  region = region || "ile_de_france";
  var villes = LIEUX_NAISSANCE[region].villes;
  return { region: region, ville: villes[Math.floor(Math.random() * villes.length)] };
}

function pickCultureMigrante() {
  return CULTURES_MIGRANTES[Math.floor(Math.random() * CULTURES_MIGRANTES.length)];
}

function randomOrigins(n) {
  var shuffled = ORIGINS.slice().sort(function () { return Math.random() - 0.5; });
  return shuffled.slice(0, Math.min(n, ORIGINS.length));
}

window.VIE = window.VIE || {};
window.VIE.data = window.VIE.data || {};
window.VIE.data.origins = ORIGINS;
window.VIE.data.lieuxNaissance = LIEUX_NAISSANCE;
window.VIE.data.culturesMigrantes = CULTURES_MIGRANTES;
window.VIE.pickLieuNaissance = pickLieuNaissance;
window.VIE.pickCultureMigrante = pickCultureMigrante;
window.VIE.randomOrigins = randomOrigins;