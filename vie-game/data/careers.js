/* ============================================================
   UNE VIE v0.5 — CARRIÈRES, ÉTUDES, COMPÉTENCES
   ~20 filières, 5-7 niveaux chacune, compétences, événements pro
   ============================================================ */

// ── COMPÉTENCES ───────────────────────────────────────────
var COMPETENCES_DEFS = [
  { id: "technique",     name: "Technique",      desc: "Savoir-faire technique, outils, code, machines" },
  { id: "relationnel",   name: "Relationnel",    desc: "Communication, négociation, gestion d'équipe" },
  { id: "management",    name: "Management",     desc: "Organisation, stratégie, leadership, RH" },
  { id: "creativite",    name: "Créativité",     desc: "Innovation, design, art, résolution créative" },
  { id: "rigueur",       name: "Rigueur",        desc: "Précision, conformité, audit, qualité" },
  { id: "langues",       name: "Langues",        desc: "Anglais, autres langues, communication internationale" },
  { id: "manuel",        name: "Manuel",         desc: "Gestes techniques, artisanat, construction, soin" },
  { id: "physique",      name: "Physique",       desc: "Endurance, force, coordination, sport" }
];

// ── DIPLÔMES ──────────────────────────────────────────────
var DIPLOMES = [
  { id: "aucun",        label: "Aucun",          level: 0,  ageMin: 16 },
  { id: "brevet",       label: "Brevet",         level: 1,  ageMin: 15 },
  { id: "CAP_BEP",      label: "CAP / BEP",      level: 2,  ageMin: 17 },
  { id: "bac",          label: "Baccalauréat",   level: 3,  ageMin: 18 },
  { id: "bac+2_3",      label: "Bac+2/3",        level: 4,  ageMin: 20 },
  { id: "bac+5",        label: "Bac+5 (Master)", level: 5,  ageMin: 22 },
  { id: "doctorat",     label: "Doctorat",       level: 6,  ageMin: 25 }
];

function getDiplome(id) { return DIPLOMES.find(function(d){return d.id===id;}); }
function diplomeLevel(id) { var d=getDiplome(id); return d?d.level:0; }

// ── FILIÈRES CARRIÈRE ─────────────────────────────────────
// Structure : levels[] = {name, minAge, salaryMin, salaryMax, reqDiplome, reqCompetences{}, stress, satisfaction, events[]}
var CAREER_TRACKS = {

  // 1. SANTÉ
  sante: {
    id: "sante", name: "Santé", icon: "🏥",
    levels: [
      { name: "Aide-soignant(e)",     minAge: 18, salary: [20000, 26000], reqDiplome: "CAP_BEP", req: { manuel: 30, relationnel: 20 }, stress: 60, satisfaction: 65 },
      { name: "Infirmier(ère)",       minAge: 21, salary: [26000, 35000], reqDiplome: "bac+2_3", req: { manuel: 40, relationnel: 35, rigueur: 30 }, stress: 70, satisfaction: 70 },
      { name: "Cadre de santé",       minAge: 30, salary: [35000, 48000], reqDiplome: "bac+5", req: { management: 40, relationnel: 40, rigueur: 35 }, stress: 75, satisfaction: 70 },
      { name: "Médecin généraliste",   minAge: 28, salary: [50000, 85000], reqDiplome: "doctorat", req: { technique: 60, relationnel: 45, rigueur: 50 }, stress: 80, satisfaction: 75 },
      { name: "Médecin spécialiste",   minAge: 32, salary: [70000, 130000], reqDiplome: "doctorat", req: { technique: 80, relationnel: 40, rigueur: 60 }, stress: 75, satisfaction: 80 },
      { name: "Chef de service / Directeur", minAge: 45, salary: [90000, 160000], reqDiplome: "doctorat", req: { management: 70, technique: 60, relationnel: 50 }, stress: 85, satisfaction: 70 }
    ],
    events: ["urgence_vitale", "erreur_medicale", "recherche_clinique", "greve_hopital", "burnout_soignant"]
  },

  // 2. ÉDUCATION
  education: {
    id: "education", name: "Éducation", icon: "🏫",
    levels: [
      { name: "ATSEM / Surveillant", minAge: 18, salary: [18000, 23000], reqDiplome: "CAP_BEP", req: { relationnel: 30, rigueur: 20 }, stress: 40, satisfaction: 60 },
      { name: "Professeur des écoles", minAge: 23, salary: [26000, 38000], reqDiplome: "bac+5", req: { relationnel: 50, rigueur: 35, creativite: 30 }, stress: 55, satisfaction: 70 },
      { name: "Professeur secondaire", minAge: 24, salary: [28000, 42000], reqDiplome: "bac+5", req: { technique: 40, relationnel: 45, rigueur: 40 }, stress: 60, satisfaction: 65 },
      { name: "Formateur adultes",    minAge: 28, salary: [30000, 45000], reqDiplome: "bac+5", req: { relationnel: 55, creativite: 40, technique: 35 }, stress: 50, satisfaction: 75 },
      { name: "Directeur d'établissement", minAge: 40, salary: [45000, 65000], reqDiplome: "bac+5", req: { management: 60, relationnel: 50, rigueur: 45 }, stress: 70, satisfaction: 70 },
      { name: "Inspecteur / Recteur", minAge: 50, salary: [60000, 90000], reqDiplome: "bac+5", req: { management: 80, rigueur: 60, relationnel: 50 }, stress: 75, satisfaction: 65 }
    ],
    events: ["eleve_difficile", "inspection", "projet_innovant", "greve_enseignants", "reconversion_adulte"]
  },

  // 3. TECH / NUMÉRIQUE
  tech: {
    id: "tech", name: "Tech / Numérique", icon: "💻",
    levels: [
      { name: "Développeur junior",   minAge: 20, salary: [30000, 42000], reqDiplome: "bac+2_3", req: { technique: 50, rigueur: 30, creativite: 25 }, stress: 55, satisfaction: 75 },
      { name: "Développeur confirmé", minAge: 24, salary: [42000, 60000], reqDiplome: "bac+5", req: { technique: 70, rigueur: 45, creativite: 40 }, stress: 60, satisfaction: 80 },
      { name: "Lead Dev / Architecte", minAge: 30, salary: [60000, 85000], reqDiplome: "bac+5", req: { technique: 80, management: 40, creativite: 50 }, stress: 65, satisfaction: 80 },
      { name: "CTO / Directeur technique", minAge: 38, salary: [80000, 140000], reqDiplome: "bac+5", req: { management: 70, technique: 70, relationnel: 50 }, stress: 80, satisfaction: 75 },
      { name: "Expert / Chercheur IA", minAge: 30, salary: [65000, 120000], reqDiplome: "doctorat", req: { technique: 90, creativite: 70, rigueur: 60 }, stress: 70, satisfaction: 85 }
    ],
    events: ["bug_critique", "hackathon", "nouvelle_techno", "startup_rachat", "burnout_dev"]
  },

  // 4. ARTISANAT / BTP
  artisanat_btp: {
    id: "artisanat_btp", name: "Artisanat / BTP", icon: "🔨",
    levels: [
      { name: "Apprenti / Ouvrier",   minAge: 16, salary: [18000, 24000], reqDiplome: "CAP_BEP", req: { manuel: 40, physique: 35 }, stress: 50, satisfaction: 65 },
      { name: "Compagnon / Qualifié", minAge: 22, salary: [26000, 35000], reqDiplome: "CAP_BEP", req: { manuel: 65, rigueur: 35 }, stress: 55, satisfaction: 75 },
      { name: "Chef d'équipe",        minAge: 30, salary: [35000, 48000], reqDiplome: "bac", req: { management: 40, manuel: 60, rigueur: 45 }, stress: 65, satisfaction: 70 },
      { name: "Artisan / Chef d'entreprise", minAge: 32, salary: [35000, 70000], reqDiplome: "bac", req: { management: 50, manuel: 70, relationnel: 40 }, stress: 70, satisfaction: 80 },
      { name: "Maître d'œuvre / Expert", minAge: 45, salary: [50000, 90000], reqDiplome: "bac+2_3", req: { technique: 80, management: 60, relationnel: 50 }, stress: 70, satisfaction: 75 }
    ],
    events: ["chantier_retard", "client_difficile", "accident_travail", "projet_prestige", "reconversion_energetique"]
  },

  // 5. COMMERCE / VENTE
  commerce: {
    id: "commerce", name: "Commerce / Vente", icon: "🛍️",
    levels: [
      { name: "Vendeur / Caissier",   minAge: 18, salary: [18000, 23000], reqDiplome: "aucun", req: { relationnel: 40 }, stress: 45, satisfaction: 55 },
      { name: "Responsable rayon",    minAge: 24, salary: [25000, 33000], reqDiplome: "bac", req: { management: 35, relationnel: 50, rigueur: 35 }, stress: 60, satisfaction: 60 },
      { name: "Directeur de magasin", minAge: 30, salary: [33000, 48000], reqDiplome: "bac+2_3", req: { management: 55, relationnel: 55, rigueur: 45 }, stress: 70, satisfaction: 65 },
      { name: "Chef de secteur / Régional", minAge: 38, salary: [48000, 75000], reqDiplome: "bac+5", req: { management: 70, relationnel: 60, rigueur: 50 }, stress: 75, satisfaction: 70 },
      { name: "Directeur commercial national", minAge: 45, salary: [75000, 130000], reqDiplome: "bac+5", req: { management: 80, relationnel: 70, creativite: 40 }, stress: 80, satisfaction: 70 }
    ],
    events: ["objectifs_atteints", "concurrents_agressifs", "nouveau_produit", "fermeture_magasin", "ecommerce_transition"]
  },

  // 6. RESTAURATION / HÔTELLERIE
  restauration: {
    id: "restauration", name: "Restauration / Hôtellerie", icon: "🍽️",
    levels: [
      { name: "Serveur / Commis",     minAge: 18, salary: [18000, 22000], reqDiplome: "aucun", req: { relationnel: 35, physique: 40 }, stress: 60, satisfaction: 50 },
      { name: "Chef de partie",       minAge: 22, salary: [24000, 30000], reqDiplome: "CAP_BEP", req: { technique: 50, manuel: 45, rigueur: 40 }, stress: 70, satisfaction: 65 },
      { name: "Second de cuisine",    minAge: 26, salary: [30000, 38000], reqDiplome: "bac", req: { technique: 65, management: 35, creativite: 45 }, stress: 75, satisfaction: 70 },
      { name: "Chef cuisinier / Directeur hôtel", minAge: 32, salary: [38000, 65000], reqDiplome: "bac+2_3", req: { management: 60, creativite: 55, technique: 60 }, stress: 80, satisfaction: 75 },
      { name: "Restaurateur étoilé / Groupe", minAge: 40, salary: [60000, 150000], reqDiplome: "bac+2_3", req: { management: 75, creativite: 70, relationnel: 55 }, stress: 85, satisfaction: 80 }
    ],
    events: ["critique_gastronomique", "penurie_personnel", "incendie_cuisine", "emission_tv", "reconversion_bio"]
  },

  // 7. ARTS & CULTURE
  arts_culture: {
    id: "arts_culture", name: "Arts & Culture", icon: "🎭",
    levels: [
      { name: "Intermittent / Artiste émergent", minAge: 18, salary: [8000, 20000], reqDiplome: "aucun", req: { creativite: 60, relationnel: 30 }, stress: 50, satisfaction: 70 },
      { name: "Artiste reconnu / Régisseur", minAge: 28, salary: [20000, 40000], reqDiplome: "bac+2_3", req: { creativite: 75, technique: 40, relationnel: 45 }, stress: 60, satisfaction: 80 },
      { name: "Directeur artistique / Conservateur", minAge: 38, salary: [35000, 55000], reqDiplome: "bac+5", req: { management: 55, creativite: 70, relationnel: 55 }, stress: 65, satisfaction: 75 },
      { name: "Directeur d'institution culturelle", minAge: 45, salary: [55000, 90000], reqDiplome: "bac+5", req: { management: 75, relationnel: 70, rigueur: 50 }, stress: 70, satisfaction: 70 }
    ],
    events: ["exposition_reussie", "subvention_refusee", "censure", "prix_artistique", "burnout_createur"]
  },

  // 8. MÉDIAS / COMMUNICATION
  medias: {
    id: "medias", name: "Médias / Communication", icon: "📰",
    levels: [
      { name: "Journaliste pigiste / Assistant", minAge: 22, salary: [20000, 30000], reqDiplome: "bac+2_3", req: { creativite: 45, relationnel: 40, rigueur: 35 }, stress: 60, satisfaction: 65 },
      { name: "Journaliste / Rédacteur", minAge: 26, salary: [30000, 45000], reqDiplome: "bac+5", req: { creativite: 55, relationnel: 50, rigueur: 45 }, stress: 70, satisfaction: 70 },
      { name: "Rédacteur en chef / Chef de projet", minAge: 35, salary: [45000, 70000], reqDiplome: "bac+5", req: { management: 55, creativite: 60, relationnel: 55 }, stress: 75, satisfaction: 70 },
      { name: "Directeur de publication / Agence", minAge: 42, salary: [70000, 120000], reqDiplome: "bac+5", req: { management: 70, creativite: 65, relationnel: 65 }, stress: 80, satisfaction: 70 }
    ],
    events: ["scoop_majeur", "pression_politique", "plan_social", "transition_numerique", "fake_news"]
  },

  // 9. SPORT PROFESSIONNEL
  sport_pro: {
    id: "sport_pro", name: "Sport professionnel", icon: "⚽",
    levels: [
      { name: "Espoir / Centre formation", minAge: 16, salary: [5000, 15000], reqDiplome: "aucun", req: { physique: 80, mental: 60 }, stress: 60, satisfaction: 80 },
      { name: "Professionnel confirmé", minAge: 20, salary: [30000, 100000], reqDiplome: "aucun", req: { physique: 90, mental: 70 }, stress: 75, satisfaction: 85 },
      { name: "Star / Captain", minAge: 25, salary: [100000, 500000], reqDiplome: "aucun", req: { physique: 95, mental: 80, relationnel: 50 }, stress: 80, satisfaction: 90 },
      { name: "Entraîneur / Reconversion", minAge: 32, salary: [35000, 80000], reqDiplome: "bac+2_3", req: { management: 50, relationnel: 60, technique: 50 }, stress: 65, satisfaction: 75 }
    ],
    events: ["blessure_grave", "transfert_record", "titre_champion", "dopage_soupcon", "fin_carriere"]
  },

  // 10. DROIT / JUSTICE
  droit: {
    id: "droit", name: "Droit / Justice", icon: "⚖️",
    levels: [
      { name: "Clerc / Assistant juridique", minAge: 22, salary: [24000, 30000], reqDiplome: "bac+2_3", req: { rigueur: 60, technique: 40 }, stress: 55, satisfaction: 60 },
      { name: "Avocat collaborateur", minAge: 25, salary: [35000, 55000], reqDiplome: "bac+5", req: { rigueur: 70, relationnel: 45, technique: 55 }, stress: 75, satisfaction: 70 },
      { name: "Avocat associé / Juge", minAge: 35, salary: [60000, 130000], reqDiplome: "bac+5", req: { rigueur: 80, relationnel: 60, management: 40 }, stress: 80, satisfaction: 75 },
      { name: "Bâtonnier / Magistrat suprême", minAge: 50, salary: [100000, 200000], reqDiplome: "bac+5", req: { management: 75, rigueur: 85, relationnel: 65 }, stress: 85, satisfaction: 70 }
    ],
    events: ["proces_mediatique", "erreur_judiciaire", "grande_affaire", "greve_avocats", "reforme_justice"]
  },

  // 11. FINANCE / BANQUE
  finance: {
    id: "finance", name: "Finance / Banque", icon: "🏦",
    levels: [
      { name: "Chargé clientèle / Analyste junior", minAge: 22, salary: [28000, 40000], reqDiplome: "bac+2_3", req: { rigueur: 50, technique: 45, relationnel: 35 }, stress: 65, satisfaction: 60 },
      { name: "Chargé affaires / Trader junior", minAge: 26, salary: [45000, 80000], reqDiplome: "bac+5", req: { technique: 70, rigueur: 60, relationnel: 40 }, stress: 80, satisfaction: 65 },
      { name: "Directeur d'agence / Senior", minAge: 35, salary: [70000, 130000], reqDiplome: "bac+5", req: { management: 60, technique: 70, relationnel: 55 }, stress: 85, satisfaction: 65 },
      { name: "Directeur régional / Partner", minAge: 45, salary: [130000, 300000], reqDiplome: "bac+5", req: { management: 80, technique: 75, relationnel: 70 }, stress: 90, satisfaction: 60 }
    ],
    events: ["krach_boursier", "blanchiment_soupcon", "fusion_banques", "prime_record", "burnout_finance"]
  },

  // 12. FONCTION PUBLIQUE / ADMINISTRATION
  fonction_publique: {
    id: "fonction_publique", name: "Fonction publique / Administration", icon: "🏛️",
    levels: [
      { name: "Agent administratif (C)", minAge: 18, salary: [20000, 26000], reqDiplome: "brevet", req: { rigueur: 40 }, stress: 35, satisfaction: 55 },
      { name: "Cadre administratif (B)", minAge: 23, salary: [28000, 38000], reqDiplome: "bac+2_3", req: { rigueur: 55, management: 30 }, stress: 45, satisfaction: 60 },
      { name: "Attaché / Administrateur (A)", minAge: 26, salary: [35000, 55000], reqDiplome: "bac+5", req: { rigueur: 70, management: 45, relationnel: 40 }, stress: 55, satisfaction: 65 },
      { name: "Directeur / Préfet / Haut fonctionnaire", minAge: 42, salary: [60000, 110000], reqDiplome: "bac+5", req: { management: 80, rigueur: 75, relationnel: 55 }, stress: 70, satisfaction: 65 }
    ],
    events: ["reforme_administrative", "mutation_imposee", "scandale_administratif", "decorations", "greve_fonctionnaires"]
  },

  // 13. POLICE / ARMÉE / POMPIERS
  securite: {
    id: "securite", name: "Police / Armée / Pompiers", icon: "🚔",
    levels: [
      { name: "Gardien de la paix / Soldat / Sapeur", minAge: 18, salary: [22000, 28000], reqDiplome: "bac", req: { physique: 60, rigueur: 45, mental: 50 }, stress: 70, satisfaction: 70 },
      { name: "Brigadier / Caporal-chef / Caporal", minAge: 24, salary: [28000, 38000], reqDiplome: "bac", req: { physique: 70, management: 30, rigueur: 55 }, stress: 75, satisfaction: 75 },
      { name: "Officier / Lieutenant / Capitaine", minAge: 28, salary: [38000, 55000], reqDiplome: "bac+2_3", req: { management: 55, physique: 65, rigueur: 65 }, stress: 80, satisfaction: 75 },
      { name: "Commandant / Colonel / Commissaire", minAge: 38, salary: [55000, 85000], reqDiplome: "bac+5", req: { management: 75, rigueur: 75, relationnel: 50 }, stress: 85, satisfaction: 70 }
    ],
    events: ["intervention_dangereuse", "decorations", "affaire_mediatique", "blessure_service", "mutation_outremer"]
  },

  // 14. AGRICULTURE
  agriculture: {
    id: "agriculture", name: "Agriculture", icon: "🌾",
    levels: [
      { name: "Ouvrier agricole / Apprenti", minAge: 16, salary: [16000, 22000], reqDiplome: "aucun", req: { manuel: 40, physique: 50 }, stress: 45, satisfaction: 60 },
      { name: "Exploitant / Chef de culture", minAge: 24, salary: [18000, 35000], reqDiplome: "CAP_BEP", req: { technique: 55, manuel: 55, management: 30 }, stress: 65, satisfaction: 70 },
      { name: "Éleveur / Viticulteur / Céréalier", minAge: 30, salary: [25000, 60000], reqDiplome: "bac", req: { technique: 70, management: 50, rigueur: 50 }, stress: 75, satisfaction: 75 },
      { name: "Directeur de grosse exploitation / Coopérative", minAge: 45, salary: [50000, 120000], reqDiplome: "bac+5", req: { management: 70, technique: 75, relationnel: 55 }, stress: 80, satisfaction: 70 }
    ],
    events: ["secheresse", "prix_effondres", "bio_conversion", "heritage_familial", "manifestation_agriculteurs"]
  },

  // 15. TRANSPORT / LOGISTIQUE
  transport: {
    id: "transport", name: "Transport / Logistique", icon: "🚚",
    levels: [
      { name: "Conducteur / Préparateur commandes", minAge: 18, salary: [22000, 28000], reqDiplome: "CAP_BEP", req: { physique: 40, rigueur: 35 }, stress: 55, satisfaction: 55 },
      { name: "Agent de transit / Dispatcher", minAge: 22, salary: [26000, 35000], reqDiplome: "bac", req: { rigueur: 50, relationnel: 40, technique: 35 }, stress: 60, satisfaction: 60 },
      { name: "Responsable logistique / Fleet manager", minAge: 30, salary: [35000, 55000], reqDiplome: "bac+2_3", req: { management: 55, rigueur: 60, technique: 45 }, stress: 70, satisfaction: 65 },
      { name: "Directeur supply chain / Transport", minAge: 42, salary: [60000, 110000], reqDiplome: "bac+5", req: { management: 75, rigueur: 70, technique: 55 }, stress: 80, satisfaction: 65 }
    ],
    events: ["greve_transport", "accident_routier", "nouvelle_regulation", "automatisation_entrepot", "penurie_carburant"]
  },

  // 16. RECHERCHE / SCIENCES
  recherche: {
    id: "recherche", name: "Recherche / Sciences", icon: "🔬",
    levels: [
      { name: "Doctorant / Assistant", minAge: 24, salary: [18000, 24000], reqDiplome: "bac+5", req: { technique: 60, rigueur: 55, creativite: 40 }, stress: 60, satisfaction: 75 },
      { name: "Chercheur / Post-doc", minAge: 28, salary: [30000, 42000], reqDiplome: "doctorat", req: { technique: 80, rigueur: 70, creativite: 60 }, stress: 65, satisfaction: 80 },
      { name: "Chargé de recherche / Maître conf.", minAge: 32, salary: [40000, 55000], reqDiplome: "doctorat", req: { technique: 85, management: 40, creativite: 65 }, stress: 70, satisfaction: 80 },
      { name: "Directeur de recherche / Professeur", minAge: 42, salary: [55000, 85000], reqDiplome: "doctorat", req: { management: 65, technique: 90, creativite: 70 }, stress: 75, satisfaction: 80 }
    ],
    events: ["publication_nature", "financement_coupe", "prix_nobel_espoir", "plagiat_soupcon", "collaboration_internationale"]
  },

  // 17. HUMANITAIRE / ASSOCIATIF
  humanitaire: {
    id: "humanitaire", name: "Humanitaire / Associatif", icon: "🤝",
    levels: [
      { name: "Bénévole / Volontaire VSI", minAge: 18, salary: [0, 12000], reqDiplome: "aucun", req: { relationnel: 40, altruiste: 1 }, stress: 50, satisfaction: 80 },
      { name: "Chargé de mission / Coordinateur terrain", minAge: 24, salary: [22000, 32000], reqDiplome: "bac+2_3", req: { management: 40, relationnel: 55, rigueur: 40 }, stress: 70, satisfaction: 80 },
      { name: "Directeur pays / Chef de mission", minAge: 32, salary: [35000, 55000], reqDiplome: "bac+5", req: { management: 65, relationnel: 70, rigueur: 55 }, stress: 80, satisfaction: 75 },
      { name: "Directeur général ONG internationale", minAge: 45, salary: [60000, 100000], reqDiplome: "bac+5", req: { management: 80, relationnel: 80, rigueur: 60 }, stress: 85, satisfaction: 70 }
    ],
    events: ["crise_humanitaire", "evacuation_urgence", "financement_gagne", "securite_menacee", "burnout_humanitaire"]
  },

  // 18. CRÉATEUR DE CONTENU / FREELANCE
  freelance: {
    id: "freelance", name: "Créateur de contenu / Freelance", icon: "🎬",
    levels: [
      { name: "Auto-entrepreneur débutant", minAge: 18, salary: [5000, 20000], reqDiplome: "aucun", req: { creativite: 50, relationnel: 30, rigueur: 20 }, stress: 55, satisfaction: 70 },
      { name: "Freelance confirmé / Influenceur", minAge: 24, salary: [20000, 60000], reqDiplome: "aucun", req: { creativite: 70, relationnel: 50, technique: 40 }, stress: 65, satisfaction: 80 },
      { name: "Entrepreneur média / Studio", minAge: 30, salary: [50000, 200000], reqDiplome: "aucun", req: { management: 55, creativite: 75, relationnel: 60 }, stress: 75, satisfaction: 80 },
      { name: "Média d'envergure / Holding", minAge: 38, salary: [150000, 500000], reqDiplome: "aucun", req: { management: 75, creativite: 70, relationnel: 70 }, stress: 80, satisfaction: 75 }
    ],
    events: ["buzz_viral", "demonetisation", "partenariat_majeur", "harcelement_en_ligne", "equipe_qui_grandit"]
  },

  // 19. ENTREPRENEURIAT (multi-secteurs)
  entrepreneuriat: {
    id: "entrepreneuriat", name: "Entrepreneuriat", icon: "🚀",
    sectors: ["tech", "commerce", "services", "industrie", "restauration", "sante", "education", "artisanat"],
    levels: [
      { name: "Auto-entrepreneur / Solo", minAge: 18, salary: [0, 30000], reqDiplome: "aucun", req: { creativite: 40, relationnel: 35, rigueur: 30 }, stress: 70, satisfaction: 70 },
      { name: "Fondateur / CEO startup", minAge: 24, salary: [10000, 80000], reqDiplome: "aucun", req: { creativite: 60, management: 40, relationnel: 50 }, stress: 85, satisfaction: 80 },
      { name: "Dirigeant PME / Scale-up", minAge: 32, salary: [60000, 200000], reqDiplome: "aucun", req: { management: 70, relationnel: 60, rigueur: 55 }, stress: 85, satisfaction: 75 },
      { name: "Serial entrepreneur / Investisseur", minAge: 40, salary: [100000, 500000], reqDiplome: "aucun", req: { management: 80, relationnel: 75, creativite: 65 }, stress: 80, satisfaction: 80 }
    ],
    events: ["levée_fonds", "faillite_proche", "exit_reussi", "conflit_associes", "pivot_strategique"]
  },

  // 20. POLITIQUE (accessible via destin "Voix politique")
  politique: {
    id: "politique", name: "Politique", icon: "🏛️",
    levels: [
      { name: "Militant / Attaché parlementaire", minAge: 22, salary: [18000, 28000], reqDiplome: "bac+2_3", req: { relationnel: 60, relationnel: 50, rigueur: 35 }, stress: 65, satisfaction: 65 },
      { name: "Conseiller municipal / Député suppléant", minAge: 28, salary: [25000, 40000], reqDiplome: "bac+5", req: { relationnel: 70, relationnel: 60, management: 40 }, stress: 75, satisfaction: 70 },
      { name: "Député / Maire / Ministre junior", minAge: 35, salary: [55000, 90000], reqDiplome: "bac+5", req: { relationnel: 80, management: 60, relationnel: 65 }, stress: 85, satisfaction: 70 },
      { name: "Ministre / Premier ministre / Président", minAge: 45, salary: [100000, 250000], reqDiplome: "bac+5", req: { relationnel: 90, management: 85, relationnel: 80 }, stress: 95, satisfaction: 60 }
    ],
    events: ["scandale_politique", "loi_majeure_votée", "election_gagnee", "motion_censure", "retraite_politique"]
  }
};

// Helper : liste tous les IDs
function getAllCareerIds() { return Object.keys(CAREER_TRACKS); }

// Résout aussi les IDs legacy v0.4 ("etudes", "travail", "entreprise")
function getCareerTrack(id) {
  if (!id) return undefined;
  if (CAREER_TRACKS[id]) return CAREER_TRACKS[id];
  var mapped = LEGACY_CAREER_MAP[id];
  return mapped ? CAREER_TRACKS[mapped] : undefined;
}

// Helpers pour compatibilité v0.4 (anciens 3 tracks)
var LEGACY_CAREER_MAP = {
  etudes: "education",
  travail: "fonction_publique",
  entreprise: "entrepreneuriat"
};

function mapLegacyCareer(oldId) { return LEGACY_CAREER_MAP[oldId] || oldId; }

window.VIE = window.VIE || {};
window.VIE.data = window.VIE.data || {};
window.VIE.data.careers = CAREER_TRACKS;
window.VIE.data.competences = COMPETENCES_DEFS;
window.VIE.data.diplomes = DIPLOMES;
window.VIE.getCareerTrack = getCareerTrack;
window.VIE.getAllCareerIds = getAllCareerIds;
window.VIE.mapLegacyCareer = mapLegacyCareer;
window.VIE.getDiplome = getDiplome;
window.VIE.diplomeLevel = diplomeLevel;