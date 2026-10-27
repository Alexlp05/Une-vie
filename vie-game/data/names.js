/* ============================================================
   UNE VIE v0.5 — PRÉNOMS & NOMS PAR ÉPOQUE, CULTURE, SEXE
   Pour générer des PNJ cohérents historiquement.
   ============================================================ */

// ── PRÉNOMS FRANÇAIS PAR DÉCENNIE ( INSEE tendances ) ──────
var PRENOMS_FR_H = {
  1940: ["Jean", "Michel", "Pierre", "André", "Philippe", "Alain", "Patrick", "Bernard", "Daniel", "Christian", "Henri", "Robert", "Louis", "Charles", "Henri", "Jacques", "Raymond", "Roger", "Albert", "Marcel"],
  1950: ["Philippe", "Christophe", "Patrick", "Stéphane", "Laurent", "Thierry", "Pascal", "Eric", "Bruno", "Olivier", "Gérard", "Serge", "Yves", "Guy", "Jacques", "Henri", "René", "Jean-Pierre", "Michel-Ange", "Franck"],
  1960: ["Stéphane", "Christophe", "David", "Frédéric", "Sébastien", "Nicolas", "Laurent", "Olivier", "Thierry", "Guillaume", "Régis", "Fabrice", "Cyril", "Anthony", "Vincent", "Gilles", "Denis", "Didier", "Luc", "Christian"],
  1970: ["Nicolas", "Thomas", "Alexandre", "Antoine", "Julien", "Kevin", "Maxime", "Jérémy", "Guillaume", "Aurélien", "Raphaël", "Victor", "Bastien", "Lucas", "Quentin", "Arnaud", "Sylvain", "Bruno", "Fabien", "Damien"],
  1980: ["Thomas", "Nicolas", "Alexandre", "Antoine", "Kevin", "Maxime", "Jérémy", "Julien", "Guillaume", "Romain", "Xavier", "Robin", "Mathieu", "Fabien", "Adrien", "Simon", "Florian", "Yoann", "Clément", "Lucas"],
  1990: ["Lucas", "Hugo", "Nathan", "Enzo", "Léo", "Louis", "Théo", "Tom", "Noah", "Gabriel", "Clément", "Ethan", "Mathis", "Rayan", "Adam", "Samuel", "Titouan", "Oscar", "Victor", "Martin"],
  2000: ["Léo", "Lucas", "Hugo", "Nathan", "Enzo", "Gabriel", "Louis", "Raphaël", "Arthur", "Jules", "Adam", "Aaron", "Maël", "Noa", "Sacha", "Victor", "Ethan", "Oscar", "Raphaël", "Julien"],
  2010: ["Gabriel", "Léo", "Louis", "Raphaël", "Arthur", "Jules", "Adam", "Hugo", "Noah", "Maël", "Naël", "Sacha", "Ethan", "Oscar", "Victor", "Eliott", "Adam", "Arthur", "Louis", "Gabriel"],
  2020: ["Gabriel", "Léo", "Louis", "Maël", "Raphaël", "Jules", "Adam", "Noah", "Arthur", "Sacha", "Noa", "Liam", "Oscar", "Victor", "Eliott", "Adam", "Gabriel", "Louis", "Léo", "Maël"]
};

var PRENOMS_FR_F = {
  1940: ["Marie", "Monique", "Martine", "Nicole", "Françoise", "Christiane", "Michèle", "Catherine", "Sylvie", "Isabelle", "Jeanne", "Lucienne", "Renée", "Paulette", "Yvonne", "Andrée", "Simone", "Germaine", "Julienne", "Danièle"],
  1950: ["Catherine", "Nathalie", "Isabelle", "Sylvie", "Véronique", "Christine", "Sandrine", "Patricia", "Laurence", "Caroline", "Françoise", "Hélène", "Colette", "Simone", "Geneviève", "Danièle", "Monique", "Jeanne", "Yvette", "Micheline"],
  1960: ["Sandrine", "Stéphanie", "Nathalie", "Céline", "Caroline", "Laurence", "Virginie", "Sophie", "Audrey", "Emilie", "Valérie", "Coralie", "Delphine", "Karine", "Estelle", "Nathalie", "Chantal", "Béatrice", "Florence", "Patricia"],
  1970: ["Marie", "Aurélie", "Emilie", "Elodie", "Céline", "Laura", "Marine", "Justine", "Pauline", "Jennifer", "Stéphanie", "Karine", "Vanessa", "Audrey", "Coralie", "Laetitia", "Delphine", "Sophie", "Agnès", "Françoise"],
  1980: ["Marie", "Laura", "Emilie", "Julie", "Elodie", "Camille", "Manon", "Pauline", "Morgane", "Charlotte", "Sophie", "Claire", "Fanny", "Delphine", "Audrey", "Sophie", "Céline", "Delphine", "Audrey", "Isabelle"],
  1990: ["Marie", "Manon", "Camille", "Océane", "Laura", "Clara", "Léa", "Chloé", "Manon", "Emma", "Julie", "Amandine", "Justine", "Virginie", "Elise", "Marion", "Pauline", "Claire", "Audrey", "Laura"],
  2000: ["Emma", "Chloé", "Léa", "Manon", "Inès", "Lola", "Jade", "Louise", "Zoé", "Chloé", "Charlotte", "Anaïs", "Clémence", "Pauline", "Lucie", "Manon", "Léa", "Emma", "Inès", "Lola"],
  2010: ["Emma", "Louise", "Jade", "Chloé", "Alice", "Léa", "Manon", "Lina", "Rose", "Anna", "Mila", "Inès", "Rose", "Lina", "Agathe", "Zoé", "Léa", "Emma", "Chloé", "Jade"],
  2020: ["Jade", "Emma", "Louise", "Alice", "Lina", "Rose", "Chloé", "Léa", "Anna", "Mia", "Anna", "Lina", "Rose", "Chloé", "Emma", "Lina", "Emma", "Louise", "Alice", "Lina"]
};

// ── NOMS FRANÇAIS (top 100) ───────────────────────────────
var NOMS_FR = [
  "Martin", "Bernard", "Dubois", "Thomas", "Robert", "Richard", "Petit", "Durand", "Leroy", "Moreau",
  "Simon", "Laurent", "Lefebvre", "Michel", "Garcia", "David", "Bertrand", "Roux", "Vincent", "Fournier",
  "Morel", "Girard", "Andre", "Lefevre", "Mercier", "Dupont", "Lambert", "Bonnet", "Francois", "Martinez",
  "Legrand", "Garnier", "Faure", "Rousseau", "Blanc", "Guerin", "Muller", "Henry", "Roussel", "Nicolas",
  "Perrin", "Morin", "Mathieu", "Clement", "Gauthier", "Dumont", "Lopez", "Fontaine", "Chevalier", "Robin",
  "Masson", "Sanchez", "Gerard", "Nguyen", "Noel", "Meyer", "Lucas", "Meunier", "Jean", "Denis",
  "Martel", "Rolland", "Marie", "Gillet", "Lemaire", "Duval", "Colin", "Barbier", "Brun", "Roy",
  "Picard", "Roger", "Vidal", "Martinez", "Lacroix", "Olivier", "Leblanc", "Leclercq", "Vial", "Collet",
  "Fabre", "Clement", "Dumas", "Duval", "Leroux", "Bertrand", "Guillaume", "Schmitt", "Henry", "Bois",
  "Fabre", "Rousseau", "Dupont", "Leroy", "Moreau", "Simon", "Laurent", "Lefebvre", "Michel", "Garcia",
  "David", "Bertrand", "Roux", "Vincent", "Fournier", "Morel", "Girard", "Dupont", "Lambert", "Bonnet"
];

// ── PRÉNOMS PAR CULTURE MIGRANTE ──────────────────────────
var PRENOMS_MIGRANTS = {
  maghreb: {
    H: ["Mohamed", "Karim", "Youssef", "Samir", "Rachid", "Mehdi", "Amine", "Bilal", "Yanis", "Adam", "Anis", "Rayane", "Ilan", "Nael", "Sami"],
    F: ["Fatima", "Aicha", "Leila", "Sarah", "Ines", "Yasmina", "Malika", "Nadia", "Sofia", "Amina", "Lina", "Maya", "Salma", "Rania", "Inaya"],
    noms: ["Benali", "Bennani", "Cherif", "Douibi", "El Amrani", "Fassi", "Guedira", "Haddad", "Idrissi", "Jabri", "Khalfallah", "Lamrani", "Marrakchi", "Naciri", "Ouazzani"]
  },
  afrique_subsaharienne: {
    H: ["Mamadou", "Ibrahima", "Ousmane", "Amadou", "Cheikh", "Moussa", "Abdoulaye", "Seydou", "Boubacar", "Modibo", "Alassane", "Sekou", "Moussa", "Karim", "Issa"],
    F: ["Aminata", "Fatou", "Awa", "Mariama", "Kadiatou", "Hawa", "Ramatoulaye", "Ndeye", "Sokhna", "Coumba", "Adama", "Aissatou", "Bintou", "Djeneba", "Kadija"],
    noms: ["Diallo", "Sow", "Ba", "Diop", "Ndiaye", "Fall", "Camara", "Traore", "Keita", "Konate", "Sylla", "Toure", "Coulibaly", "Cisse", "Kone"]
  },
  asie: {
    H: ["Wei", "Chen", "Li", "Zhang", "Wang", "Liu", "Yang", "Huang", "Zhao", "Wu", "Minh", "Duc", "Anh", "Tuan", "Vinh", "Hao", "Jun", "Ming"],
    F: ["Mei", "Xiu", "Lan", "Yan", "Jing", "Li", "Wei", "Xin", "Yan", "Fang", "Lan", "Mai", "Hoa", "Thao", "Phuong", "Linh", "Ngoc", "Thu"],
    noms: ["Nguyen", "Tran", "Le", "Pham", "Hoang", "Vu", "Dang", "Bui", "Do", "Ho", "Ngo", "Duong", "Ly", "Kim", "Park", "Lee", "Choi", "Jung", "Kang", "Wang"]
  },
  europe_de_lest: {
    H: ["Ivan", "Dimitri", "Alexei", "Sergei", "Andrei", "Vladimir", "Mikhail", "Nikolai", "Pavel", "Oleg", "Viktor", "Roman", "Anton", "Maxim", "Dmitri"],
    F: ["Elena", "Natalia", "Olga", "Svetlana", "Irina", "Maria", "Anna", "Tatiana", "Yulia", "Ekaterina", "Anastasia", "Daria", "Ksenia", "Polina", "Alina"],
    noms: ["Petrov", "Ivanov", "Smirnov", "Kuznetsov", "Popov", "Sokolov", "Lebedev", "Kozlov", "Novikov", "Morozov", "Volkov", "Soloviev", "Vasilev", "Zaitsev", "Pavlov"]
  },
  amerique_latine: {
    H: ["Carlos", "Juan", "Luis", "Miguel", "Jorge", "Pedro", "Alejandro", "Manuel", "Roberto", "Fernando", "Diego", "Pablo", "Rafael", "Andres", "Santiago"],
    F: ["Maria", "Ana", "Laura", "Sofia", "Isabel", "Carmen", "Lucia", "Valentina", "Camila", "Gabriela", "Daniela", "Paula", "Martina", "Jimena", "Renata"],
    noms: ["Garcia", "Rodriguez", "Gonzalez", "Fernandez", "Lopez", "Martinez", "Sanchez", "Perez", "Gomez", "Martin", "Jimenez", "Ruiz", "Hernandez", "Diaz", "Moreno"]
  },
  outre_mer: {
    H: ["Jean", "Marie", "Pierre", "Louis", "Andre", "Michel", "Paul", "Jacques", "Nicolas", "Alexandre", "Kevin", "Bryan", "Jordan", "Mickael", "Rudy"],
    F: ["Marie", "Nathalie", "Sylvie", "Catherine", "Isabelle", "Christine", "Sandrine", "Veronique", "Patricia", "Laurence", "Jessica", "Jennifer", "Cindy", "Stephanie", "Melanie"],
    noms: ["Jean-Baptiste", "Joseph", "Louis", "Pierre", "Andre", "Michel", "Paul", "Simon", "Robert", "Henry", "Noel", "Blanc", "Petit", "Bernard", "Lambert"]
  },
  asie_du_sud: {
    H: ["Rajesh", "Amit", "Sanjay", "Rahul", "Vikram", "Arjun", "Karan", "Rohan", "Siddharth", "Varun", "Kabir", "Aryan", "Dev", "Ishaan", "Krishna"],
    F: ["Priya", "Anjali", "Pooja", "Kavya", "Diya", "Anika", "Sana", "Zara", "Alisha", "Tara", "Meera", "Kavya", "Diya", "Anika", "Sana"],
    noms: ["Sharma", "Singh", "Kumar", "Patel", "Shah", "Desai", "Joshi", "Mishra", "Tiwari", "Gupta", "Yadav", "Verma", "Reddy", "Naidu", "Iyer"]
  },
  moyen_orient: {
    H: ["Omar", "Karim", "Samir", "Amir", "Karim", "Yasser", "Tarek", "Nabil", "Rami", "Walid", "Hassan", "Ali", "Khaled", "Samir", "Tariq"],
    F: ["Layla", "Amira", "Leila", "Noor", "Salma", "Yasmin", "Fatima", "Zahra", "Mariam", "Khadija", "Safiya", "Huda", "Sana", "Hala", "Dalal"],
    noms: ["Al-Farsi", "Al-Mansouri", "Al-Hamad", "Al-Sayed", "Al-Ghamdi", "Al-Zahrani", "Al-Qahtani", "Al-Dosari", "Al-Harbi", "Al-Otaibi"]
  }
};

// Helper : décennie la plus proche
function getDecade(year) {
  return Math.floor(year / 10) * 10;
}

// Prénom français selon année naissance et sexe
function pickPrenomFr(year, sexe) {
  var decade = getDecade(year);
  var pool = sexe === "femme" ? PRENOMS_FR_F[decade] : PRENOMS_FR_H[decade];
  if (!pool) {
    // Fallback sur décennie la plus proche disponible
    var decades = Object.keys(sexe === "femme" ? PRENOMS_FR_F : PRENOMS_FR_H).map(Number).sort(function(a,b){return a-b;});
    var closest = decades.reduce(function(prev, curr) { return Math.abs(curr - decade) < Math.abs(prev - decade) ? curr : prev; });
    pool = sexe === "femme" ? PRENOMS_FR_F[closest] : PRENOMS_FR_H[closest];
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

// Prénom selon culture migrante
function pickPrenomMigrante(culture, sexe) {
  var data = PRENOMS_MIGRANTS[culture];
  if (!data) return pickPrenomFr(2000, sexe);
  var pool = sexe === "femme" ? data.F : data.H;
  return pool[Math.floor(Math.random() * pool.length)];
}

// Nom selon culture
function pickNom(culture) {
  if (culture && PRENOMS_MIGRANTS[culture] && PRENOMS_MIGRANTS[culture].noms) {
    var noms = PRENOMS_MIGRANTS[culture].noms;
    return noms[Math.floor(Math.random() * noms.length)];
  }
  return NOMS_FR[Math.floor(Math.random() * NOMS_FR.length)];
}

// Nom composé (double nom)
function pickNomCompose(culture) {
  if (Math.random() < 0.15) { // 15% noms composés
    return pickNom(culture) + "-" + pickNom(culture);
  }
  return pickNom(culture);
}

// Génère identité complète
function generateIdentity(birthYear, sexe, culture) {
  var prenom = culture && PRENOMS_MIGRANTS[culture] ? pickPrenomMigrante(culture, sexe) : pickPrenomFr(birthYear, sexe);
  var nom = pickNomCompose(culture);
  return { prenom: prenom, nom: nom, sexe: sexe, culture: culture || "francaise" };
}

window.VIE = window.VIE || {};
window.VIE.data = window.VIE.data || {};
window.VIE.data.names = {
  PRENOMS_FR_H: PRENOMS_FR_H,
  PRENOMS_FR_F: PRENOMS_FR_F,
  NOMS_FR: NOMS_FR,
  PRENOMS_MIGRANTS: PRENOMS_MIGRANTS,
  pickPrenomFr: pickPrenomFr,
  pickPrenomMigrante: pickPrenomMigrante,
  pickNom: pickNom,
  pickNomCompose: pickNomCompose,
  generateIdentity: generateIdentity,
  getDecade: getDecade
};