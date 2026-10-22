/* ============================================================
   UNE VIE v0.6 — FINANCE MANAGER (Refonte réaliste)
   Patrimoine, dettes, revenus, marchés, retraite, budget
   ============================================================ */

(function () {
  "use strict";

  // ── CALCUL REVENUS ANNUELS ───────────────────────────────
  function computeAnnualIncome(state) {
    var cfg = window.VIE.config.finance;
    var income = 0;
    var econMult = getEconomyMultiplier(state);

    // 1. Salaire carrière (brut)
    var salaryBrut = 0;
    if (state.career) {
      var track = window.VIE.getCareerTrack(state.career.track);
      if (track && track.levels[state.career.level]) {
        var lvl = track.levels[state.career.level];
        salaryBrut = (lvl.salary[0] + lvl.salary[1]) / 2;
      }
    }

    // Revenu conjoint
    var conjointIncome = 0;
    var conjoint = Object.values(state.people).find(function (p) {
      return p.liens.some(function (l) { return l.role === "amour" && (l.statut === "marie" || l.statut === "pacs" || l.statut === "couple_installe"); });
    });
    if (conjoint && conjoint.metier && conjoint.niveauVie > 30) {
      conjointIncome = Math.round(conjoint.niveauVie * 1000 * 0.8); // estimation
    }

    // Brut total
    var brutTotal = salaryBrut + conjointIncome;

    // Cotisations sociales (part salariale)
    var cotisations = brutTotal * cfg.socialContributionsRate;

    // Net avant impôt
    var netAvantImpot = brutTotal - cotisations;

    // Parts fiscales
    var parts = computeFiscalParts(state);
    var revenuImposable = Math.max(0, netAvantImpot / parts);

    // IRPP
    var irpp = computeIRPP(revenuImposable) * parts;

    // Net après impôt
    var netApresImpot = netAvantImpot - irpp;

    // 2. Revenus du capital
    var capitalIncome = computeCapitalIncome(state, getEconomyMultiplier(state));

    // 3. Allocations / aides
    var aides = computeAides(state);

    // 4. Revenus héritages/donnations (traité via événements)

    var totalIncome = Math.round(netApresImpot + capitalIncome + aides);

    return {
      brutTotal: Math.round(brutTotal),
      cotisations: Math.round(cotisations),
      netAvantImpot: Math.round(netAvantImpot),
      irpp: Math.round(irpp),
      netSalaire: Math.round(netApresImpot),
      capitalIncome: Math.round(capitalIncome),
      aides: Math.round(aides),
      total: totalIncome,
      parts: parts,
      revenuImposable: Math.round(revenuImposable)
    };
  }

  function computeFiscalParts(state) {
    var cfg = window.VIE.config.finance;
    var parts = cfg.fiscalShares.adulte; // joueur
    // Conjoint
    var conjoint = Object.values(state.people).find(function (p) {
      return p.liens.some(function (l) { return l.role === "amour" && (l.statut === "marie" || l.statut === "pacs" || l.statut === "couple_installe"); });
    });
    if (conjoint) parts += cfg.fiscalShares.adulte;
    // Enfants
    var nbEnfants = Object.values(state.people).filter(function (p) {
      return p.liens.some(function (l) { return l.role === "enfant" && l.affection > 0; });
    }).length;
    parts += nbEnfants * cfg.fiscalShares.enfant;
    return parts;
  }

  function computeIRPP(revenuParPart) {
    var cfg = window.VIE.config.finance;
    var irpp = 0;
    var previousMax = 0;
    for (var i = 0; i < cfg.irppBrackets.length; i++) {
      var bracket = cfg.irppBrackets[i];
      var taxable = Math.min(revenuParPart, bracket.max) - previousMax;
      if (taxable > 0) irpp += taxable * bracket.rate;
      previousMax = bracket.max;
      if (revenuParPart <= bracket.max) break;
    }
    return irpp;
  }

  function computeCapitalIncome(state, econMult) {
    var cfg = window.VIE.config.finance.markets;
    var inv = state.finance.placements;
    var total = 0;

    Object.keys(inv).forEach(function (k) {
      var amount = inv[k];
      if (amount <= 0) return;
      var market = cfg[k];
      if (!market) return;
      // Rendement stochastique corrélé à l'économie
      var rendement = market.rendement + (Math.random() - 0.5) * 2 * market.volatilite;
      var correlatedRendement = rendement * (0.5 + 0.5 * econMult);
      total += amount * correlatedRendement;
    });

    // Résidence principale : plus-value latente (non réalisée)
    // Loyer perçu si investissement locatif
    if (inv.immobilier_locatif > 0) {
      total += inv.immobilier_locatif * 0.035 * econMult; // 3.5% rendement locatif net
    }

    return Math.round(total);
  }

  function computeAides(state) {
    var cfg = window.VIE.config.finance;
    var total = 0;
    // Allocations familiales
    var nbEnfants = countEnfants(state);
    total += nbEnfants * cfg.allocations.enfant * 12;
    // APL (simplifié)
    if (state.finance.residence.type === "location" && state.finance.compte < 30000) {
      total += cfg.aplMax * 12;
    }
    // Chômage
    if (state.flags.includes("au_chomage")) {
      var lastSalary = state.narrativeMemory?.lastSalary || 25000;
      total += Math.min(cfg.chomage.plafond, Math.max(cfg.chomage.plancher, lastSalary * cfg.chomage.taux)) * 12;
    }
    // Soutien familial : un mineur (_ou_ un adulte encore chez ses parents) reçoit de l'argent de poche
    var livingWithParents = state.finance.residence && state.finance.residence.type === "parents";
    if (state.age < 18 && livingWithParents) {
      total += (cfg.familySupportPerMonth || 0) * 12;
    }
    return Math.round(total);
  }

  // ── ENFANTS DU JOUEUR ─────────────────────────────────────
  // On passe par les liens du joueur (role "enfant") : la liste `famille`
  // est bidirectionnelle et contient aussi { id:"self", relation:"enfant" }
  // chez les parents, ce qui compterait les parents comme enfants.
  function getChildren(state) {
    var self = state.people && state.people["self"];
    if (!self || !self.liens) return [];
    return self.liens
      .filter(function (l) { return l.role === "enfant"; })
      .map(function (l) { return state.people[l.id]; })
      .filter(Boolean);
  }

  function countEnfants(state) {
    return getChildren(state).length;
  }

  // ── CALCUL DÉPENSES ANNUELLES ────────────────────────────
  function computeAnnualExpenses(state) {
    var cfg = window.VIE.config.finance;
    var expenses = 0;

    // 1. Logement
    expenses += computeHousingCost(state);

    // 2. Vie courante (base + enfants)
    // Le coût de vie de base dépend de l'âge : l'enfance est couverte par la famille.
    var baseLifeBracket = (cfg.baseLifeByAge || []).find(function (b) { return state.age <= b.ageMax; });
    var baseLife = baseLifeBracket
      ? baseLifeBracket.cost
      : ((cfg.baseLifeByAge || []).length ? cfg.baseLifeByAge[cfg.baseLifeByAge.length - 1].cost : 12000);
    var nbEnfants = countEnfants(state);
    var enfantCost = 0;
    getChildren(state).forEach(function (enfant) {
      var age = state.year - enfant.naissance;
      var bracket = cfg.enfantCost.find(function (b) { return age <= b.ageMax; });
      enfantCost += bracket ? bracket.cost : cfg.enfantCost[cfg.enfantCost.length - 1].cost;
    });
    expenses += baseLife + enfantCost;

    // 3. Habitudes (coût annuel)
    expenses += computeHabitsCost(state);

    // 4. Impôts (déjà déduit du net, mais on peut afficher)
    // Déjà inclus dans netApresImpot

    // 5. Remboursement dettes
    expenses += computeDebtPayments(state);

    // 6. Inflation
    var inflation = state.world?.inflation || cfg.baseInflation;
    expenses = Math.round(expenses * (1 + inflation / 100));

    // 7. Modificateurs monde
    expenses += state.worldMods?.expenses || 0;

    // 8. Santé critique
    if (state.stats.sante < 30) expenses += 3000;

    return Math.round(expenses);
  }

  function computeHousingCost(state) {
    var cfg = window.VIE.config.finance.housing;
    var h = state.finance.residence;
    var type = h.type || "parents";

    if (type === "parents") return 0;
    if (type === "colocation") return (cfg.colocation.loyer + cfg.colocation.charges) * 12;
    if (type === "location") return (cfg.location.loyer + cfg.location.charges) * 12;

    // Propriétaire : mensualités crédit + charges + taxe foncière
    var prop = cfg[type];
    if (!prop) return 0;
    var mensualite = h.capitalRestantDu > 0 ? calculateMortgagePayment(h.capitalRestantDu, prop.tauxDefaut, prop.duree * 12) : 0;
    return mensualite * 12 + (prop.charges || 0) * 12 + (prop.taxeFonciere || 0);
  }

  function calculateMortgagePayment(capital, tauxAnnuel, dureeMois) {
    if (capital <= 0 || dureeMois <= 0) return 0;
    var tauxMensuel = tauxAnnuel / 12;
    return capital * tauxMensuel / (1 - Math.pow(1 + tauxMensuel, -dureeMois));
  }

  function computeHabitsCost(state) {
    var h = state.habitudes || {};
    var cost = 0;
    cost += h.alcool * 50;        // 0-100 -> 0-5000€/an
    cost += h.tabac * 80;         // 0-100 -> 0-8000€/an
    cost += h.cannabis * 60;
    cost += h.jeu * 200;          // jeu peut coûter très cher
    cost += h.soirees * 30;
    cost += h.voyages * 100;
    cost += (100 - h.alimentation) * 20; // mauvaise alimentation = resto
    cost += (100 - h.sport) * 10;
    return Math.round(cost);
  }

  function computeDebtPayments(state) {
    return (state.finance.dettes || []).reduce(function (sum, d) {
      return sum + (d.mensualite || 0) * 12;
    }, 0);
  }

  // ── BILAN ANNUEL ─────────────────────────────────────────
  function computeAnnualBalance(state) {
    var income = computeAnnualIncome(state);
    var expenses = computeAnnualExpenses(state);
    var balance = income.total - expenses;
    return { income: income, expenses: expenses, balance: balance };
  }

  function applyAnnualFinances(state) {
    var bal = computeAnnualBalance(state);
    state.finance.compte += bal.balance;
    state.finance.historiquePatrimoine.push({ annee: state.year, net: getNetWorth(state) });
    // Mise à jour capital restant dû immobilier
    updateMortgagePrincipal(state);
    // Score crédit
    updateCreditScore(state);
    // Sync stat "argent" (niveau de vie)
    syncArgentStat(state);
  }

  function updateMortgagePrincipal(state) {
    var h = state.finance.residence;
    if (h.type && h.type.startsWith("proprio") && h.capitalRestantDu > 0) {
      var cfg = window.VIE.config.finance.housing[h.type];
      if (cfg) {
        var mensualite = calculateMortgagePayment(h.capitalRestantDu, cfg.tauxDefaut, cfg.duree * 12);
        var interets = h.capitalRestantDu * (cfg.tauxDefaut / 12);
        var principal = mensualite - interets;
        h.capitalRestantDu = Math.max(0, h.capitalRestantDu - principal * 12);
      }
    }
  }

  function updateCreditScore(state) {
    var cfg = window.VIE.config.finance.creditScore;
    var score = cfg.base;
    var revenu = computeAnnualIncome(state).total;
    var patrimoine = getNetWorth(state);
    var dettes = (state.finance.dettes || []).reduce(function (s, d) { return s + d.capital; }, 0);
    score += Math.min(30, revenu / 50000) * cfg.revenuFactor * 100;
    score += Math.min(20, patrimoine / 200000) * cfg.patrimoineFactor * 100;
    score -= Math.min(30, dettes / 100000) * Math.abs(cfg.dettesFactor) * 100;
    state.finance.scoreCredit = clamp(score, 0, 100);
  }

  function syncArgentStat(state) {
    // Niveau de vie relatif (percentile approximatif)
    var net = getNetWorth(state);
    var age = state.age;
    var reference = [
      { age: 25, p50: 5000 }, { age: 30, p50: 25000 }, { age: 35, p50: 60000 },
      { age: 40, p50: 110000 }, { age: 45, p50: 170000 }, { age: 50, p50: 220000 },
      { age: 55, p50: 260000 }, { age: 60, p50: 280000 }, { age: 65, p50: 270000 },
      { age: 70, p50: 250000 }, { age: 80, p50: 200000 }
    ];
    var ref = reference.find(function (r) { return age <= r.age; }) || reference[reference.length - 1];
    var ratio = net / ref.p50;
    var stat = 50 + Math.round(30 * Math.tanh((ratio - 1) * 1.5)); // sigmoïde centrée sur 1
    state.stats.argent = clamp(stat, 5, 100);
  }

  function getNetWorth(state) {
    var f = state.finance;
    var assets = f.compte +
      (f.epargne.livret || 0) + (f.epargne.assuranceVie || 0) + (f.epargne.plan_retraite || 0) +
      f.placements.actions_etf + f.placements.crypto + f.placements.immobilier_locatif + f.placements.entreprise +
      (f.residence.valeur || 0);
    var liabilities = f.residence.capitalRestantDu + (f.dettes || []).reduce(function (s, d) { return s + d.capital; }, 0);
    return assets - liabilities;
  }

  // ── ACHAT / VENTE LOGEMENT ───────────────────────────────
  function canBuyHousing(state, housingId) {
    var cfg = window.VIE.config.finance.housing[housingId];
    if (!cfg) return { ok: false, reason: "Type inconnu" };
    if (state.finance.compte < cfg.prix * cfg.apportMin) {
      return { ok: false, reason: "Apport insuffisant (min " + Math.round(cfg.prix * cfg.apportMin) + "€)" };
    }
    if (state.finance.scoreCredit < 40) {
      return { ok: false, reason: "Score crédit trop faible" };
    }
    return { ok: true };
  }

  function buyHousing(state, housingId) {
    var check = canBuyHousing(state, housingId);
    if (!check.ok) return { success: false, reason: check.reason };
    var cfg = window.VIE.config.finance.housing[housingId];
    var apport = Math.max(cfg.prix * cfg.apportMin, state.finance.compte * 0.3);
    var emprunt = cfg.prix - apport;
    state.finance.compte -= apport;
    state.finance.residence = {
      type: housingId,
      valeur: cfg.prix,
      capitalRestantDu: emprunt,
      loyer: 0
    };
    if (emprunt > 0) {
      state.finance.dettes.push({
        type: "immo",
        capital: emprunt,
        taux: cfg.tauxDefaut,
        mensualite: calculateMortgagePayment(emprunt, cfg.tauxDefaut, cfg.duree * 12),
        finAnnee: state.year + cfg.duree
      });
    }
    state.housing = housingId;
    return { success: true, apport: apport, emprunt: emprunt };
  }

  function sellHousing(state) {
    var h = state.finance.residence;
    if (!h || h.type === "parents" || h.type === "colocation" || h.type === "location") {
      return { success: false, reason: "Pas de bien à vendre" };
    }
    // Prix de vente = valeur actuelle ± marché
    var econMult = getEconomyMultiplier(state);
    var prixVente = Math.round(h.valeur * (0.9 + Math.random() * 0.2) * econMult);
    var net = prixVente - h.capitalRestantDu;
    state.finance.compte += net;
    // Rembourser dette immo
    state.finance.dettes = state.finance.dettes.filter(function (d) { return d.type !== "immo"; });
    state.finance.residence = { type: "location", valeur: 0, capitalRestantDu: 0, loyer: 800 };
    state.housing = "location";
    return { success: true, prixVente: prixVente, net: net };
  }

  // ── INVESTISSEMENTS ──────────────────────────────────────
  function invest(state, assetClass, amount) {
    var cfg = window.VIE.config.finance.markets[assetClass];
    if (!cfg) return { ok: false, reason: "Classe d'actif inconnue" };
    if (state.finance.compte < amount) return { ok: false, reason: "Fonds insuffisants" };
    state.finance.compte -= amount;
    state.finance.placements[assetClass] += amount;
    return { ok: true };
  }

  function withdrawInvestment(state, assetClass, amount) {
    var current = state.finance.placements[assetClass] || 0;
    if (current < amount) return { ok: false, reason: "Montant indisponible" };
    var cfg = window.VIE.config.finance.markets[assetClass];
    var gain = amount * (cfg.rendement * (state.year - (state.narrativeMemory?.[assetClass + "_since"] || state.year)));
    state.finance.placements[assetClass] -= amount;
    state.finance.compte += amount + gain;
    return { ok: true, gain: Math.round(gain) };
  }

  // ── RETRAITE ─────────────────────────────────────────────
  function computeRetirementPension(state) {
    var cfg = window.VIE.config.finance.retraite;
    if (!state.career) return Math.round(cfg.plafondMensuel * 0.4 * 12); // minimum vieillesse
    var track = window.VIE.getCareerTrack(state.career.track);
    if (!track) return Math.round(cfg.plafondMensuel * 0.5 * 12);
    var lvl = track.levels[state.career.level];
    var lastSalary = (lvl.salary[0] + lvl.salary[1]) / 2;
    var pension = Math.min(cfg.plafondMensuel, lastSalary * cfg.tauxRemplacement) * 12;
    // Complément épargne retraite
    pension += state.finance.epargne.plan_retraite * 0.04; // 4% retrait
    return Math.round(pension);
  }

  // ── PRODUCTIVITÉ / ÉCONOMIE ──────────────────────────────
  function productivity(state) {
    var cfg = window.VIE.config.stats.productivity;
    var b = state.stats.bonheur || 50;
    var e = state.stats.energie || 50;
    if (b >= cfg.high.bonheurMin && e >= cfg.high.energieMin) return cfg.high.mult;
    if (b >= cfg.normal.bonheurMin && e >= cfg.normal.energieMin) return cfg.normal.mult;
    if (b <= cfg.low.bonheurMax || e <= cfg.low.energieMax) return cfg.low.mult;
    return cfg.base;
  }

  function getEconomyMultiplier(state) {
    var econ = state.world?.economy || "normal";
    var cfg = window.VIE.config.world.economyStates[econ];
    return cfg ? cfg.mult : 1.0;
  }

  // ── BUDGET MENSUEL (pour UI) ─────────────────────────────
  function getMonthlyBudget(state) {
    var annual = computeAnnualBalance(state);
    var income = computeAnnualIncome(state);
    var expenses = computeAnnualExpenses(state);
    return {
      revenusMensuels: Math.round(annual.income / 12),
      chargesMensuelles: Math.round(annual.expenses / 12),
      soldeMensuel: Math.round(annual.balance / 12),
      detail: {
        salaire: Math.round(getSalaireMensuel(state)),
        capital: Math.round(computeCapitalIncome(state, getEconomyMultiplier(state)) / 12),
        aides: Math.round(computeAides(state) / 12),
        logement: Math.round(computeHousingCost(state) / 12),
        vie: Math.round((12000 + countEnfants(state) * 4000) / 12),
        habitudes: Math.round(computeHabitsCost(state) / 12),
        impots: Math.round(computeIRPP(computeAnnualIncome(state).revenuImposable) * computeFiscalParts(state) / 12),
        dettes: Math.round(computeDebtPayments(state) / 12)
      }
    };
  }

  function getSalaireMensuel(state) {
    if (!state.career) return 0;
    var track = window.VIE.getCareerTrack(state.career.track);
    if (!track) return 0;
    var lvl = track.levels[state.career.level];
    return ((lvl.salary[0] + lvl.salary[1]) / 2) / 12;
  }

  // Helpers
  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  // Export
  window.VIE = window.VIE || {};
  window.VIE.engine = window.VIE.engine || {};
  window.VIE.engine.finance = {
    computeAnnualIncome: computeAnnualIncome,
    computeAnnualExpenses: computeAnnualExpenses,
    computeAnnualBalance: computeAnnualBalance,
    applyAnnual: applyAnnualFinances,
    getMonthlyBudget: getMonthlyBudget,
    getNetWorth: getNetWorth,
    canBuyHousing: canBuyHousing,
    buyHousing: buyHousing,
    sellHousing: sellHousing,
    invest: invest,
    withdraw: withdrawInvestment,
    computePension: computeRetirementPension,
    productivity: productivity,
    syncArgentStat: syncArgentStat
  };
})();