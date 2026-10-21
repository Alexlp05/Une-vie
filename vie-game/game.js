/* ============================================================
   UNE VIE — Moteur de jeu v0.3
   Monde parallèle (économie, climat, société), finances liées,
   années multi-actions, passions, destins extraordinaires.
   ============================================================ */

(function () {
  "use strict";

  var state = null;
  var usedEvents = {};
  var usedOpp = {};
  var usedWorldEvents = {};
  var recentEvents = []; // track last N event IDs for deduplication
  var narrativeMemory = {}; // key-value store for long-term consequences

  var STAT_KEYS = ["sante", "energie", "argent", "intelligence", "social", "bonheur"];
  var STAT_LABELS = {
    sante: "Santé",
    energie: "Énergie",
    argent: "Argent",
    intelligence: "Intelligence",
    social: "Social",
    bonheur: "Bonheur"
  };

  function $(sel) { return document.querySelector(sel); }
  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
  function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function show(screenId) {
    var screens = document.querySelectorAll(".screen");
    for (var i = 0; i < screens.length; i++) screens[i].classList.add("hidden");
    $("#" + screenId).classList.remove("hidden");
    window.scrollTo(0, 0);
  }

  /* ---------- Écran titre ---------- */
  function initTitle() {
    $("#btn-start").addEventListener("click", function () { showCreation(); });
    $("#btn-replay").addEventListener("click", function () { showCreation(); });
  }

  function showCreation() {
    show("screen-creation");
    renderTraits();
    renderOrigins();
  }

  /* ---------- Création ---------- */
  var selectedTrait = null;
  var selectedOrigin = null;

  function refreshCreateBtn() {
    $("#btn-create").disabled = !($("#input-name").value.trim() && selectedTrait && selectedOrigin);
  }

  function renderTraits() {
    var list = $("#trait-list");
    list.innerHTML = "";
    selectedTrait = null;
    $("#btn-create").disabled = true;

    TRAITS.forEach(function (trait) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "trait-option";
      btn.innerHTML = "<strong>" + trait.name + "</strong><small>" + trait.desc + "</small>";
      btn.addEventListener("click", function () {
        var opts = list.querySelectorAll(".trait-option");
        for (var i = 0; i < opts.length; i++) opts[i].classList.remove("selected");
        btn.classList.add("selected");
        selectedTrait = trait;
        refreshCreateBtn();
      });
      list.appendChild(btn);
    });

    $("#input-name").addEventListener("input", function () {
      refreshCreateBtn();
    });
  }

  function renderOrigins() {
    var list = $("#origin-list");
    var draw = randomOrigins(3);
    list.innerHTML = "";
    selectedOrigin = null;
    $("#btn-create").disabled = true;

    draw.forEach(function (origin) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "origin-option";
      btn.innerHTML = '<strong>' + origin.name + '</strong><small class="origin-tag">' + origin.tagline + '</small><span class="origin-desc">' + origin.desc + '</span>';
      btn.addEventListener("click", function () {
        var opts = list.querySelectorAll(".origin-option");
        for (var i = 0; i < opts.length; i++) opts[i].classList.remove("selected");
        btn.classList.add("selected");
        selectedOrigin = origin;
        refreshCreateBtn();
      });
      list.appendChild(btn);
    });
  }

  function initCreation() {
    $("#btn-create").addEventListener("click", function () {
      var name = $("#input-name").value.trim();
      if (!name || !selectedTrait || !selectedOrigin) return;
      startGame(name, selectedTrait, selectedOrigin);
    });
    $("#btn-reroll-origin").addEventListener("click", function () {
      renderOrigins();
    });
  }

  /* ---------- Nouvelle partie ---------- */
  function startGame(name, trait, origin) {
    state = {
      name: name,
      trait: trait,
      origin: origin,
      age: 0,
      year: 1990 + Math.floor(Math.random() * 20),
      slot: 0,
      stats: { sante: 85, energie: 80, argent: 42, intelligence: 20, social: 20, bonheur: 60 },
      money: 8,
      career: null,
      housing: "parents",
      relations: [],
      passions: {},
      flags: [],
      life: null,
      lastCrisisAge: -10,
      history: [],
      yearLog: [],
      world: worldStart(),
      worldMods: { incomeMult: 1, expenses: 0, title: null, kind: null, text: null },
      investments: { stocks: 0, realEstate: 0, business: 0 },
      businessLevel: 0,
      businessEmployees: 0,
      businessReputation: 50
    };

    for (var k in trait.effects) {
      if (state.stats[k] !== undefined) state.stats[k] = clamp(state.stats[k] + trait.effects[k], 0, 100);
    }
    for (var o in (origin.effects || {})) {
      if (state.stats[o] !== undefined) state.stats[o] = clamp(state.stats[o] + origin.effects[o], 0, 100);
    }
    state.money = origin.money;
    if (state.money > 600) state.money = 600;
    for (var p in (origin.passions || {})) state.passions[p] = origin.passions[p];
    state.flags.push(origin.flag);

    // La famille : les parents et, parfois, une fratrie
    createFamily();

    syncArgent();

    usedEvents = {};
    usedOpp = {};
    usedWorldEvents = {};
    recentEvents = [];
    narrativeMemory = {};
    // Clear recentEvents is already done by reassignment above
    show("screen-game");
    renderAll();
    renderTimeline();

    var birth = null;
    for (var i = 0; i < EVENTS.length; i++) {
      if (EVENTS[i].id === "naissance") { birth = EVENTS[i]; break; }
    }
    playEvent(birth);
  }

  function createFamily() {
    var surname = randomSurname();
    var pere = {
      id: "rel_pere",
      name: randomParentName("m"),
      surname: surname,
      type: "parent",
      role: "Père",
      trait: randomTrait("ami"),
      bond: 62,
      compat: 60 + Math.floor(Math.random() * 25),
      sinceAge: 0
    };
    var mere = {
      id: "rel_mere",
      name: randomParentName("f"),
      surname: surname,
      type: "parent",
      role: "Mère",
      trait: randomTrait("ami"),
      bond: 68,
      compat: 60 + Math.floor(Math.random() * 25),
      sinceAge: 0
    };
    state.relations.push(pere, mere);

    var nbSiblings = Math.random() < 0.4 ? 0 : (Math.random() < 0.55 ? 1 : (Math.random() < 0.8 ? 2 : 3));
    var siblingNames = [];
    for (var i = 0; i < nbSiblings; i++) {
      var sibName = randomName();
      var guard = 0;
      while ((siblingNames.indexOf(sibName) !== -1 || sibName === state.name) && guard < 20) {
        sibName = randomName();
        guard++;
      }
      siblingNames.push(sibName);
      state.relations.push({
        id: "rel_frat_" + i,
        name: sibName,
        surname: surname,
        type: "fratrie",
        role: (i === 0 ? "Aîné(e)" : i === nbSiblings - 1 ? "Cadet(te)" : "Milieu") + (i === 0 && nbSiblings === 1 ? "" : ""),
        trait: randomTrait("ami"),
        bond: 40 + Math.floor(Math.random() * 30),
        compat: 55 + Math.floor(Math.random() * 35),
        sinceAge: 0
      });
    }

    state.surname = surname;
    addHistory({ age: 0, title: "Naissance", result: "Vous êtes né(e) dans la " + state.origin.name.toLowerCase() + ", chez les " + surname + "." });
  }

  function renderAll() {
    renderHeader();
    renderStats();
    renderCareer();
    renderFinances();
    renderWorld();
    renderPassions();
    renderRelations();
    renderFamily();
  }

  /* ---------- Header & stats ---------- */
  function renderHeader() {
    $("#char-name").textContent = state.name;
    $("#char-age").textContent = "Âge " + state.age + " · " + state.year;
    $("#char-trait").textContent = state.trait.name + " · " + stageName(state.age);
    $("#life-badge").textContent = state.life ? "Destin" : (stageForAge(state.age) === "vieillesse" ? "Crépuscule" : "Vie");
  }

  function stageName(age) {
    for (var i = 0; i < STAGES.length; i++) {
      if (age >= STAGES[i].min && age <= STAGES[i].max) return STAGES[i].name;
    }
    return "Vieillesse";
  }

  function renderStats() {
    var grid = $("#stats-grid");
    grid.innerHTML = "";
    STAT_KEYS.forEach(function (key) {
      var val = state.stats[key];
      var cls = val >= 60 ? "good" : (val >= 30 ? "mid" : "low");
      var cell = document.createElement("div");
      cell.className = "stat";
      cell.innerHTML =
        '<div class="stat-top"><span>' + STAT_LABELS[key] + '</span><b>' + val + '</b></div>' +
        '<div class="stat-bar"><div class="stat-fill ' + cls + '" style="width:' + val + '%"></div></div>';
      grid.appendChild(cell);
    });
  }

  /* ---------- Carrière ---------- */
  function careerLevel(state) {
    if (!state.career) return null;
    var track = CAREER_TRACKS[state.career.track];
    if (!track || !track.levels[state.career.level]) return null;
    return track.levels[state.career.level];
  }

  function careerIncome(state) {
    var lvl = careerLevel(state);
    if (!lvl) return 0;
    var income = lvl.salary[0] + Math.random() * (lvl.salary[1] - lvl.salary[0]);
    var mood = 0.85 + (state.stats.bonheur / 100) * 0.3;
    return Math.max(0, Math.round(income * mood));
  }

  function setCareer(trackId) {
    state.career = { track: trackId, level: 0, sinceAge: state.age };
  }

  function renderCareer() {
    var card = $("#career-card");
    card.innerHTML = "<h4>Carrière</h4>";
    if (!state.career) {
      card.innerHTML += '<p class="info-empty">Le grand choix, à 18 ans, tracera votre route.</p>';
      return;
    }
    var track = CAREER_TRACKS[state.career.track];
    var lvl = track.levels[state.career.level];
    var income = careerIncome(state);
    var next = careerNext(state);
    var html = '<p class="career-role">' + lvl.name + '</p>';
    html += '<p class="career-track">' + track.name + ' · Niveau ' + (state.career.level + 1) + '/' + track.levels.length + '</p>';
    html += '<p class="career-salary">Revenus ~' + income + ' k€/an (brut)' +
      (next ? ' <span class="career-progress">· prochain : ' + next.name + '</span>' : '') + '</p>';
    if (next) {
      html += '<p class="career-progress">' + (careerCanAdvance(state) ? "Éligible à la promotion" : "En cours de progression") + '</p>';
    }
    card.innerHTML += html;
  }

  /* ---------- Finances ---------- */
  function argentStat() { return clamp(40 + state.money / 3, 5, 100); }
  function syncArgent() { state.stats.argent = argentStat(); }

  function productivity() {
    var m = 1;
    var morale = state.stats.bonheur, en = state.stats.energie;
    if (morale < 40) m -= (40 - morale) * 0.008;
    if (en < 35) m -= (35 - en) * 0.008;
    if (morale > 70) m += (morale - 70) * 0.004;
    if (en > 75) m += (en - 75) * 0.004;
    return Math.max(0.5, Math.min(1.3, m));
  }

  function childrenCount() {
    return state.relations.filter(function (r) { return r.type === "enfant"; }).length;
  }

  function computeFinances() {
    var econMult = ECONOMY_STATES[state.world.economy].mult;
    var prod = productivity();
    var income = 0;
    if (state.career) income += careerIncome(state) * econMult * prod * state.worldMods.incomeMult;
    // Investment income
    var stockReturn = state.investments.stocks * (0.05 + (Math.random() - 0.5) * 0.15) * econMult;
    var realEstateReturn = state.investments.realEstate * 0.03 * econMult;
    var businessReturn = state.investments.business * (0.08 + (Math.random() - 0.5) * 0.2) * econMult;
    income += stockReturn + realEstateReturn + businessReturn;
    var housing = HOUSING[state.housing] || HOUSING.parents;
    var baseCost = housing.cost;
    if (state.housing === "parents") {
      baseCost = 0;
    }
    var expenses = baseCost + (state.housing === "parents" ? 0 : 8) + childrenCount() * 5;
    expenses *= (1 + state.world.inflation / 100);
    expenses += state.worldMods.expenses;
    if (state.stats.sante < 40) expenses += 3;
    if (state.money > 150) expenses += Math.round(state.money * 0.05);
    return { income: Math.round(income), expenses: Math.round(expenses), balance: Math.round(income - expenses) };
  }

  function applyAnnualFinances() {
    var f = computeFinances();
    state.money += f.balance;
    if (state.money > 600) state.money = 600;
    syncArgent();
  }

  function applyHousing(id) {
    var tier = HOUSING[id];
    if (!tier) return null;
    if (state.housing === id) return null;
    var prev = HOUSING[state.housing];
    if (prev && prev.buy < 0 && tier.buy === 0) state.money += Math.round(-prev.buy * 0.6);
    if (tier.buy < 0) state.money += tier.buy;
    state.housing = id;
    syncArgent();
    return "Nouveau logement : " + tier.name;
  }

  function renderFinances() {
    var card = $("#finances-card");
    var f = computeFinances();
    var housing = HOUSING[state.housing] || HOUSING.parents;
    var html = "<h4>Finances</h4>";
    html += '<p class="fin-line"><span>Épargne</span><b>' + (state.money >= 0 ? "+" : "") + state.money + ' k€</b></p>';
    if (state.investments.stocks || state.investments.realEstate || state.investments.business) {
      html += '<p class="fin-line"><span>Investissements</span><b>' +
        (state.investments.stocks ? 'Actions: ' + state.investments.stocks + 'k€ ' : '') +
        (state.investments.realEstate ? 'Immo: ' + state.investments.realEstate + 'k€ ' : '') +
        (state.investments.business ? 'Entreprise: ' + state.investments.business + 'k€' : '') +
        '</b></p>';
    }
    html += '<p class="fin-line"><span>Revenus/an</span><b>~' + f.income + ' k€</b></p>';
    html += '<p class="fin-line"><span>Charges/an</span><b>~' + f.expenses + ' k€</b></p>';
    html += '<p class="fin-line ' + (f.balance >= 0 ? "pos" : "neg") + '"><span>Solde</span><b>' + (f.balance >= 0 ? "+" : "") + f.balance + ' k€</b></p>';
    html += '<p class="fin-sub">Logement : ' + housing.name + (state.relations.length ? " · " + childrenCount() + " enfant(s)" : "") + "</p>";
    card.innerHTML = html;
  }

  /* ---------- Le monde ---------- */
  function worldTick() {
    economyEvolve(state.world);
    state.worldMods = { incomeMult: 1, expenses: 0, title: null, kind: null, text: null };

    if (Math.random() < 0.4) {
      var pool = WORLD_EVENTS.filter(function (e) {
        if (e.once && usedWorldEvents[e.id]) return false;
        if (e.minAge !== undefined && state.age < e.minAge) return false;
        return true;
      });
      if (pool.length) {
        var total = 0;
        pool.forEach(function (e) { total += e.weight; });
        var r = Math.random() * total;
        var chosen = pool[pool.length - 1];
        for (var i = 0; i < pool.length; i++) {
          r -= pool[i].weight;
          if (r <= 0) { chosen = pool[i]; break; }
        }
        usedWorldEvents[chosen.id] = true;
        if (chosen.effects) applyEffects(chosen.effects, { silent: true });
        state.worldMods.incomeMult = chosen.incomeMult || 1;
        state.worldMods.expenses = chosen.expenses || 0;
        state.worldMods.title = chosen.title;
        state.worldMods.kind = chosen.kind;
        state.worldMods.text = chosen.text;
        addHistory({ age: state.age, title: "Monde : " + chosen.title, result: chosen.text });
      }
    }
  }

  function renderWorld() {
    var card = $("#world-card");
    var econ = ECONOMY_STATES[state.world.economy];
    var html = "<h4>Le monde</h4>";
    html += '<p class="career-track">Économie : ' + econ.name + ' · Inflation ' + state.world.inflation + '%</p>';
    if (state.worldMods.title) {
      html += '<p class="world-event">' + state.worldMods.kind + ' : ' + state.worldMods.title + '</p>';
    } else {
      html += '<p class="info-empty">Une année sans grand bouleversement.</p>';
    }
    card.innerHTML = html;
  }

  /* ---------- Passions ---------- */
  function addPassion(id, d) {
    if (!PASSION_DEFS[id]) return null;
    state.passions[id] = clamp((state.passions[id] || 0) + d, 0, 10);
    state.stats.bonheur = clamp(state.stats.bonheur + d, 0, 100);
    return "Passion : " + PASSION_DEFS[id].name + " +" + d;
  }

  function renderPassions() {
    var card = $("#passions-card");
    card.innerHTML = "<h4>Passions</h4>";
    var entries = Object.keys(state.passions).map(function (k) { return { id: k, lvl: state.passions[k] }; });
    entries.sort(function (a, b) { return b.lvl - a.lvl; });
    if (!entries.length) {
      card.innerHTML += '<p class="info-empty">Aucune passion encore. Le hasard vous fera découvrir des vocations.</p>';
      return;
    }
    entries.slice(0, 4).forEach(function (e) {
      var def = PASSION_DEFS[e.id];
      var item = document.createElement("div");
      item.className = "relation-item";
      item.innerHTML =
        '<span class="rel-name">' + def.icon + " " + def.name + '</span>' +
        '<span class="rel-bar"><span class="rel-fill ' + (e.lvl >= 6 ? "strong" : "") + '" style="width:' + (e.lvl * 10) + '%"></span></span>' +
        '<span class="rel-trait">' + e.lvl + '/10</span>';
      card.appendChild(item);
    });
  }

  /* ---------- Relations ---------- */
  function findRelation(type) {
    var best = null;
    for (var i = 0; i < state.relations.length; i++) {
      var r = state.relations[i];
      if (r.type === type && (!best || r.bond > best.bond)) best = r;
    }
    return best;
  }

  function createRelation(type) {
    var name = randomName();
    var guard = 0;
    while (state.relations.some(function (r) { return r.name === name; }) && guard < 20) {
      name = randomName();
      guard++;
    }
    var rel = {
      id: "rel_" + Date.now() + "_" + Math.floor(Math.random() * 1e6),
      name: name,
      type: type,
      trait: randomTrait(type),
      bond: 15,
      compat: 55 + Math.floor(Math.random() * 40),
      sinceAge: state.age
    };
    state.relations.push(rel);
    addHistory({ age: state.age, title: "Rencontre", result: "Vous avez rencontré " + rel.name + " (" + rel.trait + ")." });
    return rel;
  }

  function relationStatus(rel) {
    if (rel.type === "enfant") return "enfant";
    if (rel.type === "parent") return "parent";
    if (rel.type === "fratrie") return rel.bond >= 55 ? "proche" : "fratrie";
    if (rel.type === "amour") {
      if (state.flags.indexOf("marie") !== -1) return "conjoint(e)";
      if (rel.bond >= 45) return "partenaire";
      if (rel.bond >= 15) return "amoureux(se)";
      return "flirt";
    }
    if (rel.bond >= 55) return "ami(e) proche";
    if (rel.bond >= 25) return "ami(e)";
    return "connaissance";
  }

  function applyRelation(relSpec) {
    if (!relSpec) return;
    var rel = findRelation(relSpec.type);
    if (!rel && relSpec.create) rel = createRelation(relSpec.type);
    if (!rel) return;
    if (relSpec.delta) rel.bond = clamp(rel.bond + relSpec.delta, 0, 100);
    if (rel.bond <= 0) {
      var idx = state.relations.indexOf(rel);
      if (idx !== -1) {
        state.relations.splice(idx, 1);
        addHistory({ age: state.age, title: "Rupture", result: "Votre lien avec " + rel.name + " s'est définitivement rompu." });
      }
    }
  }

  function relationPasses(relReq) {
    if (!relReq) return true;
    var rel = findRelation(relReq.type);
    if (!rel) return false;
    if (relReq.minBond !== undefined && rel.bond < relReq.minBond) return false;
    return true;
  }

  function renderRelations() {
    var card = $("#relations-card");
    card.innerHTML = "<h4>Entourage</h4>";
    if (!state.relations.length) {
      card.innerHTML += '<p class="info-empty">Personne pour le moment. La vie réserve des rencontres.</p>';
      return;
    }
    state.relations.slice().sort(function (a, b) { return b.bond - a.bond; }).forEach(function (rel) {
      var item = document.createElement("div");
      item.className = "relation-item";
      var cls = rel.bond >= 55 ? "strong" : "";
      item.innerHTML =
        '<span class="rel-name">' + rel.name + '</span>' +
        '<span class="rel-status">' + relationStatus(rel) + '</span>' +
        '<span class="rel-bar"><span class="rel-fill ' + cls + '" style="width:' + rel.bond + '%"></span></span>' +
        '<span class="rel-trait">' + rel.trait + '</span>';
      card.appendChild(item);
    });
  }

  /* ---------- Famille (panneau) ---------- */
  function renderFamily() {
    var card = $("#family-card");
    var html = "<h4>Famille d'origine</h4>";
    if (state.origin) {
      html += '<p class="fam-origin">' + state.origin.name + (state.surname ? " · les " + state.surname : "") + '</p>';
      html += '<p class="fam-tagline">' + state.origin.tagline + '</p>';
    } else {
      html += '<p class="info-empty">Aucune origine définie.</p>';
    }
    var fam = state.relations.filter(function (r) { return r.type === "parent" || r.type === "fratrie"; });
    fam.slice().sort(function (a, b) { return (a.type === "parent" ? 0 : 1) - (b.type === "parent" ? 0 : 1); }).forEach(function (rel) {
      var role = rel.role ? rel.role + " " : "";
      html += '<div class="relation-item fam-item">' +
        '<span class="rel-name">' + rel.name + '</span>' +
        '<span class="rel-status">' + role + '</span>' +
        '<span class="rel-bar"><span class="rel-fill ' + (rel.bond >= 55 ? "strong" : "") + '" style="width:' + rel.bond + '%"></span></span>' +
        '<span class="rel-trait">' + rel.bond + '</span></div>';
    });
    card.innerHTML = html;
  }

  /* ---------- Timeline ---------- */
  function addHistory(entry) {
    state.history.unshift(entry);
    if (state.history.length > 80) state.history.pop();
    renderTimeline();
  }

  function renderTimeline() {
    var ul = $("#timeline");
    ul.innerHTML = "";
    state.history.forEach(function (entry) {
      var li = document.createElement("li");
      li.innerHTML = '<span class="tl-age">' + entry.age + ' ans</span>' + entry.title +
        '<span class="tl-result">' + entry.result + '</span>';
      ul.appendChild(li);
    });
  }

  /* ---------- Filtres d'événement ---------- */
  function passionPasses(req) {
    if (!req) return true;
    for (var k in req) {
      if ((state.passions[k] || 0) < req[k]) return false;
    }
    return true;
  }

  function baseFilters(e) {
    if (e.requiresFlag && state.flags.indexOf(e.requiresFlag) === -1) return false;
    if (e.notFlag && state.flags.indexOf(e.notFlag) !== -1) return false;
    if (e.minAge !== null && state.age < e.minAge) return false;
    if (e.maxAge !== null && state.age > e.maxAge) return false;
    if (e.requiresCareer && !state.career) return false;
    if (e.requiresLife && state.life !== e.requiresLife) return false;
    if (e.requiresWorld && state.world.economy !== e.requiresWorld) return false;
    if (e.requiresRelation && !relationPasses(e.requiresRelation)) return false;
    if (e.notRelation && findRelation(e.notRelation.type)) return false;
    if (e.requiresPassion && !passionPasses(e.requiresPassion)) return false;
    if (e.requiresFamily && (!state.origin || state.origin.flag !== e.requiresFamily)) return false;
    if (e.minStat) {
      for (var s in e.minStat) if (state.stats[s] < e.minStat[s]) return false;
    }
    return true;
  }

  function stageMatches(e) {
    return e.stage === stageForAge(state.age);
  }

  function wasRecent(eid) {
    return recentEvents.indexOf(eid) !== -1;
  }

  function setMemory(key, value) {
    narrativeMemory[key] = value;
  }

  function getMemory(key) {
    return narrativeMemory[key];
  }

  function hasMemory(key) {
    return narrativeMemory.hasOwnProperty(key);
  }

  function pickEvent() {
    var milestone = pendingMilestone();
    if (milestone) return milestone;

    var stageKey = stageForAge(state.age);
    var pool = EVENTS.filter(function (e) {
      if (e.type === "aleatoire" || e.type === "crise") return false;
      if (usedEvents[e.id] && e.once !== false) return false;
      if (wasRecent(e.id)) return false;
      if (e.stage !== stageKey) return false;
      return baseFilters(e);
    });
    if (!pool.length) return null;
    return rand(pool);
  }

  function pendingMilestone() {
    for (var m in MILESTONES) {
      if (state.age >= parseInt(m, 10) && !usedEvents[MILESTONES[m].id]) return MILESTONES[m];
    }
    return null;
  }

  function rollRandomEvent() {
    var pool = EVENTS.filter(function (e) {
      if (e.type !== "aleatoire") return false;
      if (usedEvents[e.id] && e.once !== false) return false;
      if (wasRecent(e.id)) return false;
      if (!stageMatches(e)) return false;
      return baseFilters(e);
    });
    if (!pool.length) return null;
    var total = 0;
    pool.forEach(function (e) { total += e.weight; });
    var r = Math.random() * total;
    for (var i = 0; i < pool.length; i++) {
      r -= pool[i].weight;
      if (r <= 0) return pool[i];
    }
    return pool[pool.length - 1];
  }

  function crisisEvent() {
    var triggered = null;
    for (var i = 0; i < EVENTS.length; i++) {
      var e = EVENTS[i];
      if (e.type !== "crise") continue;
      if (e.crisisCond && e.crisisCond(state)) { triggered = e; break; }
    }
    if (!triggered) return null;
    if (state.age - state.lastCrisisAge < 3) return null;
    if (wasRecent(triggered.id)) return null;
    return triggered;
  }

  function genericEvent() {
    var pool = EVENTS.filter(function (e) {
      if (e.type !== "vie") return false;
      if (e.once !== false) return false;
      if (usedEvents[e.id] && e.once !== false) return false;
      if (wasRecent(e.id)) return false;
      if (e.stage !== stageForAge(state.age)) return false;
      return baseFilters(e);
    });
    if (pool.length) return rand(pool);
    // filet de sécurité : tout événement répétable
    var any = EVENTS.filter(function (e) {
      if (e.type === "aleatoire" || e.type === "crise") return false;
      if (e.once !== false) return false;
      if (wasRecent(e.id)) return false;
      return baseFilters(e);
    });
    return any.length ? rand(any) : null;
  }

  /* ---------- Destins extraordinaires ---------- */
  function findBusinessEvent() {
    if (state.career.level < 2) return null;
    var pool = EVENTS.filter(function (e) {
      if (e.type !== "business_mgmt") return false;
      if (usedEvents[e.id] && e.once !== false) return false;
      if (wasRecent(e.id)) return false;
      if (e.requiresCareerLevel && state.career.level < e.requiresCareerLevel) return false;
      return baseFilters(e);
    });
    return pool.length ? rand(pool) : null;
  }

  function checkOpportunity() {
    if (state.life || state.pendingOpp) return;
    for (var i = 0; i < OPPORTUNITIES.length; i++) {
      var opp = OPPORTUNITIES[i];
      if (usedOpp[opp.id]) continue;
      if (state.age < opp.ageMin) continue;
      if (opp.ageMax && state.age > opp.ageMax) continue;
      if (opp.cond(state) && Math.random() < 0.10) {
        state.pendingOpp = opp;
        usedOpp[opp.id] = true;
        return;
      }
    }
  }

  function opportunityEvent() {
    var opp = state.pendingOpp;
    if (!opp) return null;
    state.pendingOpp = null;
    return {
      id: "opp_" + opp.id,
      stage: stageForAge(state.age),
      title: "Une grande opportunité",
      text: opp.intro + "\n\n[Chemin : " + opp.path + "]",
      choices: opp.choices,
      isOpportunity: true,
      oppPath: opp.path,
      type: "vie"
    };
  }

  /* ---------- Sélection de l'événement du tour ---------- */
  function chooseEventForAction() {
    var ms = pendingMilestone();
    if (ms) return ms;

    var opp = opportunityEvent();
    if (opp) return opp;

    if (Math.random() < 0.25) {
      var rnd = rollRandomEvent();
      if (rnd) return rnd;
    }

    var cr = crisisEvent();
    if (cr) {
      state.lastCrisisAge = state.age;
      return cr;
    }

    var e = pickEvent();
    if (e) return e;

    return genericEvent();
  }

  /* ---------- Affichage d'un événement ---------- */
  function playEvent(event) {
    if (event.once !== false) usedEvents[event.id] = true;
    recentEvents.push(event.id);
    if (recentEvents.length > 12) recentEvents.shift();

    var theme = themeOf(event);
    var th = THEMES[theme] || THEMES.vie;
    $("#story-stage").textContent = th.icon + " " + eventTypeLabel(event) + " · " + stageName(state.age);
    $("#story-title").textContent = event.title;
    $("#story-text").textContent = event.text;
    document.querySelector(".story-card").setAttribute("data-theme", theme);

    state.yearLog.push(event.title);

    var choices = $("#choices");
    choices.innerHTML = "";

    event.choices.forEach(function (choice, idx) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "choice-btn";
      btn.textContent = choice.text;
      if (choice.note) {
        var note = document.createElement("span");
        note.className = "choice-note";
        note.textContent = choice.note;
        btn.appendChild(note);
      }
      btn.addEventListener("click", function () {
        resolveChoice(event, choice, idx);
      });
      choices.appendChild(btn);
    });

    renderAll();
    document.querySelector(".story-card").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function eventTypeLabel(event) {
    var labels = {
      vie: "Chapitre de vie",
      carriere: "Vie professionnelle",
      relation: "Relation",
      aleatoire: "Événement du hasard",
      crise: "Crise",
      passion: "Passion",
      sante: "Santé",
      famille: "Famille",
      argent: "Argent",
      social: "Social",
      societe: "Société"
    };
    return labels[event.type] || "Chapitre de vie";
  }

  /* ---------- Résolution d'un choix ---------- */
  function resolveChoice(event, choice, idx) {
    var effective = choice;

    if (typeof choice.chance === "number") {
      if (Math.random() < choice.chance) {
        effective = { effects: choice.goodEffects || {}, result: choice.goodResult || choice.result, flag: choice.flag, unflag: choice.unflag, relation: choice.relation, housing: choice.housing, passion: choice.passion, passionDelta: choice.passionDelta, career: choice.career, retire: choice.retire, careerAdvance: choice.careerAdvance, careerBoost: choice.careerBoost };
      } else {
        effective = { effects: choice.badEffects || {}, result: choice.badResult || choice.result, flag: choice.flag, unflag: choice.unflag, relation: choice.relation, housing: choice.housing, passion: choice.passion, passionDelta: choice.passionDelta, career: choice.career, retire: choice.retire, careerAdvance: choice.careerAdvance, careerBoost: choice.careerBoost };
      }
    }

    var notes = [];

    var deltas = applyEffects(effective.effects);
    notes = notes.concat(deltas);

    if (effective.flag) state.flags.push(effective.flag);
    if (effective.unflag) {
      var fi = state.flags.indexOf(effective.unflag);
      if (fi !== -1) state.flags.splice(fi, 1);
    }
    if (effective.relation) applyRelation(effective.relation);

    if (effective.passion && effective.passionDelta) {
      var pMsg = addPassion(effective.passion, effective.passionDelta);
      if (pMsg) notes.push(pMsg);
    }

    if (effective.housing) {
      var hMsg = applyHousing(effective.housing);
      if (hMsg) notes.push(hMsg);
    }

    var mainResult = effective.result || "La vie continue.";
    var careerMsg = null;

    if (effective.career) {
      setCareer(effective.career);
      careerMsg = "Vous commencez " + CAREER_TRACKS[effective.career].name.toLowerCase() + ".";
    }
    if (effective.retire) {
      setCareer("retraite");
      careerMsg = "Vous faites valoir vos droits à la retraite.";
    }
    if (effective.careerBoost && careerCanAdvance(state)) {
      state.career.level++;
      careerMsg = "Vos efforts sont récompensés : promotion !";
    }
    if (effective.careerAdvance) {
      if (careerCanAdvance(state)) {
        state.career.level++;
        careerMsg = "La direction tranche : promotion accordée !";
        mainResult = effective.goodResult || "Promotion !";
      } else {
        careerMsg = "Pas encore : les conditions manquent.";
        mainResult = effective.badResult || "Promotion refusée.";
      }
    }

    // Opportunité extraordinaire
    if (event.isOpportunity && idx === 0) {
      state.life = event.oppPath;
      careerMsg = "Votre destin bascule : vous devenez " + event.oppPath.toLowerCase() + ".";
      addHistory({ age: state.age, title: "Destin", result: "Vous avez saisi l'opportunité : " + event.oppPath + "." });
    } else if (event.isOpportunity && idx === 1) {
      addHistory({ age: state.age, title: "Opportunité déclinée", result: "Vous avez préféré votre voie actuelle." });
    }

    addHistory({
      age: state.age,
      title: event.title,
      result: mainResult
    });

    // Affichage du résultat
    var choicesWrap = $("#choices");
    choicesWrap.innerHTML = "";
    var resultP = document.createElement("p");
    resultP.className = "story-result";
    resultP.textContent = mainResult;
    choicesWrap.appendChild(resultP);

    if (careerMsg) {
      var cMsg = document.createElement("p");
      cMsg.className = "story-delta career-msg";
      cMsg.textContent = careerMsg;
      choicesWrap.appendChild(cMsg);
    }

    if (notes.length) {
      var noteP = document.createElement("p");
      noteP.className = "story-delta";
      noteP.textContent = notes.join(" · ");
      choicesWrap.appendChild(noteP);
    }

    var nextBtn = document.createElement("button");
    nextBtn.type = "button";
    nextBtn.className = "btn btn-primary next-btn";
    nextBtn.textContent = "Continuer...";
    nextBtn.addEventListener("click", function () { nextAction(); });
    choicesWrap.appendChild(nextBtn);

    renderAll();
  }

  function applyEffects(fx, opts) {
    opts = opts || {};
    var deltas = [];
    for (var k in (fx || {})) {
      if (k === "argent") {
        var av = fx.argent;
        if (Array.isArray(av)) av = Math.round(av[0] + Math.random() * (av[1] - av[0]));
        var moneyDelta = Math.round(av / 2);
        state.money += moneyDelta;
        syncArgent();
        if (!opts.silent) deltas.push((moneyDelta >= 0 ? "+" : "") + moneyDelta + " k€");
        continue;
      }
      if (k === "invest_stocks") {
        var delta = Math.round(fx.invest_stocks / 2);
        state.investments.stocks += delta;
        state.money -= delta;
        syncArgent();
        if (!opts.silent) deltas.push(delta + " k€ en actions");
        continue;
      }
      if (k === "invest_realestate") {
        var delta = Math.round(fx.invest_realestate / 2);
        state.investments.realEstate += delta;
        state.money -= delta;
        syncArgent();
        if (!opts.silent) deltas.push(delta + " k€ en immobilier");
        continue;
      }
      if (k === "invest_business") {
        var delta = Math.round(fx.invest_business / 2);
        state.investments.business += delta;
        state.money -= delta;
        syncArgent();
        if (!opts.silent) deltas.push(delta + " k€ dans l'entreprise");
        continue;
      }
      if (state.stats[k] === undefined) continue;
      var delta = fx[k];
      if (Array.isArray(delta)) delta = Math.round(delta[0] + Math.random() * (delta[1] - delta[0]));
      var oldVal = state.stats[k];
      state.stats[k] = clamp(state.stats[k] + delta, 0, 100);
      if (!opts.silent && state.stats[k] !== oldVal) {
        deltas.push((delta > 0 ? "+" : "") + delta + " " + STAT_LABELS[k]);
      }
    }
    return deltas;
  }

  /* ---------- Déroulement : années multi-actions ---------- */
  function nextAction() {
    if (state.stats.sante <= 0) { endGame("maladie"); return; }

    var slots = slotsForAge(state.age);
    if (state.slot >= slots - 1) {
      advanceYear();
    } else {
      state.slot++;
    }

    if (state.age >= 85) {
      var chance = Math.min(0.45, (state.age - 85) * 0.06);
      if (Math.random() < chance) { endGame("vieux"); return; }
    }
    if (state.age >= 100) { endGame("vieux"); return; }

    var ev = chooseEventForAction();
    if (ev) {
      playEvent(ev);
    } else {
      endGame("vieux");
    }
  }

  function advanceYear() {
    state.year++;
    state.age++;
    state.slot = 0;

    for (var m in MILESTONES) {
      if (state.age >= parseInt(m, 10) && !usedEvents[MILESTONES[m].id]) {
        state.age = parseInt(m, 10);
        break;
      }
    }

    worldTick();
    applyAnnualFinances();
    checkOpportunity();

    // Annual business management for high-level entrepreneurs
    if (state.career && state.career.track === "entreprise" && state.career.level >= 2) {
      if (Math.random() < 0.3) {
        var bizEvent = findBusinessEvent();
        if (bizEvent) {
          playEvent(bizEvent);
        }
      }
    }

    var amour = findRelation("amour");
    if (amour && Math.random() < 0.18) {
      var drift = Math.random() < (0.5 + ((amour.compat || 70) - 55) / 150) ? 3 : -2;
      amour.bond = clamp(amour.bond + drift, 0, 100);
    }

    // Endettement critique
    if (state.money < -30) {
      state.money = clamp(state.money + 8, -30, 600);
      addHistory({ age: state.age, title: "Finances sous pression", result: "Le découvert se creuse ; vous serrez le budget de toutes vos forces." });
    }

    renderAll();
    showYearChange();
  }

  /* ---------- Transition d'année + récapitulatif ---------- */
  function showYearChange() {
    var recap = state.yearLog.slice(-6);
    state.yearLog = [];
    var fade = $("#year-fade");
    $("#year-fade-num").textContent = state.year;
    var recapEl = $("#year-fade-recap");
    if (recap.length) {
      recapEl.innerHTML = recap.map(function (t) { return "<li>" + t + "</li>"; }).join("");
    } else {
      recapEl.innerHTML = "<li>Une année calme.</li>";
    }
    fade.classList.remove("show");
    // forcer le reflow pour relancer l'animation
    void fade.offsetWidth;
    fade.classList.add("show");
    clearTimeout(state._yearFadeTimer);
    state._yearFadeTimer = setTimeout(function () {
      fade.classList.remove("show");
    }, 2200);
  }

  /* ---------- Fin de vie ---------- */
  function endGame(reason) {
    var ending = ENDINGS[reason];
    var title = state.life ? state.life : lifeTitle(state);

    $("#end-kicker").textContent = ending.kicker + (state.life ? " · " + state.life : "");
    $("#end-title").textContent = title;
    $("#end-epitaph").textContent = ending.epitaph;

    var statsDiv = $("#end-stats");
    statsDiv.innerHTML = "";
    STAT_KEYS.forEach(function (key) {
      var row = document.createElement("div");
      row.className = "end-stat";
      row.innerHTML = '<span>' + STAT_LABELS[key] + '</span><b>' + state.stats[key] + '</b>';
      statsDiv.appendChild(row);
    });

    var careerBox = $("#end-career");
    var careerHtml = "<h4>Carrière & finances</h4>";
    if (state.career) {
      var track = CAREER_TRACKS[state.career.track];
      var lvl = track.levels[state.career.level];
      careerHtml += "<p>" + lvl.name + " — " + track.name + "</p>";
    } else {
      careerHtml += "<p>Aucune carrière définie.</p>";
    }
    careerHtml += "<p>Épargne finale : " + (state.money >= 0 ? "+" : "") + state.money + " k€ · Logement : " + (HOUSING[state.housing] ? HOUSING[state.housing].name : "?") + "</p>";
    if (state.investments.stocks || state.investments.realEstate || state.investments.business) {
      careerHtml += "<p>Investissements : " +
        (state.investments.stocks ? 'Actions ' + state.investments.stocks + 'k€ ' : '') +
        (state.investments.realEstate ? 'Immo ' + state.investments.realEstate + 'k€ ' : '') +
        (state.investments.business ? 'Entreprise ' + state.investments.business + 'k€' : '') +
        "</p>";
    }
    careerBox.innerHTML = careerHtml;

    var relBox = $("#end-relations");
    var relHtml = "<h4>Entourage</h4>";
    if (state.origin) {
      relHtml += '<p class="end-family">Issue : ' + state.origin.name + ' · les ' + (state.surname || "") + '</p>';
    }
    if (state.relations.length) {
      state.relations.slice().sort(function (a, b) { return b.bond - a.bond; }).forEach(function (rel) {
        relHtml += "<p>" + rel.name + " — " + relationStatus(rel) + " (" + rel.bond + ")</p>";
      });
    } else {
      relHtml += "<p>Une vie solitaire, mais digne.</p>";
    }
    relBox.innerHTML = relHtml;

    var pasBox = $("#end-passions");
    var pasHtml = "<h4>Passions</h4>";
    var pas = Object.keys(state.passions).filter(function (k) { return state.passions[k] >= 3; });
    if (pas.length) {
      pasHtml += "<p>" + pas.map(function (k) { return PASSION_DEFS[k].name + " (" + state.passions[k] + ")"; }).join(" · ") + "</p>";
    } else {
      pasHtml += "<p>Peu de passions déclarées, mais une vie vécue pleinement.</p>";
    }
    pasBox.innerHTML = pasHtml;

    var score = 0;
    score += state.stats.bonheur * 2;
    score += state.stats.sante;
    score += Math.round(state.stats.argent);
    score += state.stats.intelligence;
    score += state.stats.social;
    score += state.history.length * 2;
    score += state.age;
    if (state.career) score += (state.career.level + 1) * 4;
    score += state.relations.length * 4;
    score += Object.keys(state.passions).length * 3;
    if (state.life) score += 40;
    score += Math.max(0, Math.round(state.money));
    $("#end-score").textContent = score;

    $("#end-synopsis").textContent = synopsis();
    show("screen-end");
  }

  /* ---------- Synopsis généré ---------- */
  function synopsis() {
    var s = "";
    var stats = state.stats;
    var first = state.history.length > 0 ? state.history[state.history.length - 1] : null;

    s += state.name + " est né(e) en " + (state.year - state.age) + ", avec un tempérament de " + state.trait.name.toLowerCase() + ". ";
    if (state.origin) {
      s += "Il/elle a grandi dans une " + state.origin.name.toLowerCase() + ", " + state.origin.tagline.toLowerCase() + ". ";
    }
    s += "Il/elle a grandi dans un monde " + (state.world.economy === "boom" ? "prospère" : state.world.economy === "crisis" ? "marqué par la crise" : "stable") + ". ";

    var parents = state.relations.filter(function (r) { return r.type === "parent"; });
    var fratrie = state.relations.filter(function (r) { return r.type === "fratrie"; });
    if (parents.length && state.origin) {
      var noms = parents.map(function (p) { return p.role + " " + p.name; });
      s += "Ses origines chez les " + (state.surname || "") + " ont été portées par " + noms.join(" et ") + ". ";
    }

    if (first && first.age <= 5) s += "Son tout premier souvenir reste « " + first.title.toLowerCase() + " ». ";

    var moments = state.history.slice(0, 3);
    if (moments.length) {
      s += "Sa vie a été marquée par « " + moments[0].title.toLowerCase() + " », puis « " +
        moments[1].title.toLowerCase() + " » et enfin « " + moments[2].title.toLowerCase() + " ». ";
    }

    if (state.career) {
      var track = CAREER_TRACKS[state.career.track];
      var lvl = track.levels[state.career.level];
      if (track.name === "Retraite") s += "Après une longue route professionnelle, il/elle a savouré sa retraite. ";
      else s += "Sur le plan professionnel, il/elle est devenu(e) « " + lvl.name + " » dans la " + track.name.toLowerCase() + ". ";
    }

    var amour = findRelation("amour");
    var enfants = state.relations.filter(function (r) { return r.type === "enfant"; });
    if (state.flags.indexOf("marie") !== -1 && amour) {
      s += "Il/elle a partagé sa vie avec " + amour.name + ". ";
      if (enfants.length) s += enfants.length + " enfant(s) sont venus illuminer ses jours. ";
    } else if (amour) {
      s += "Une histoire d'amour a marqué sa route : " + amour.name + ". ";
    }

    var pas = Object.keys(state.passions).filter(function (k) { return state.passions[k] >= 4; });
    if (pas.length) {
      s += "Ses passions l'ont porté(e) : " + pas.map(function (k) { return PASSION_DEFS[k].name; }).join(", ") + ". ";
    }

    if (state.life) {
      s += "Son destin a pris un tour extraordinaire : " + state.life.toLowerCase() + ". ";
    }

    var dominant = null;
    var maxVal = -1;
    STAT_KEYS.forEach(function (k) {
      if (stats[k] > maxVal) { maxVal = stats[k]; dominant = k; }
    });
    if (maxVal >= 70) {
      var phrases = {
        bonheur: "Une joie contagieuse l'a accompagné(e), préférant les rires aux regrets.",
        sante: "Son corps a été un fidèle compagnon, entretenu comme un jardin précieux.",
        argent: "La prospérité a fini par lui sourire, fruit d'un travail patient.",
        intelligence: "Son esprit insatiable a toujours cherché à comprendre le monde.",
        social: "Il/elle a tissé des liens durables, et sa maison n'a jamais manqué de visages aimés.",
        energie: "Sa vitalité a étonné jusqu'à la fin, toujours en mouvement."
      };
      s += phrases[dominant] + " ";
    } else {
      s += "La route a parfois été rude, mais chaque épreuve a laissé une cicatrice et une leçon. ";
    }

    if (stats.bonheur >= 70) s += "Il/elle s'est éteint(e) apaisé(e), le cœur rempli de ce qu'il/elle a aimé.";
    else if (stats.bonheur < 35) s += "Il/elle s'est éteint(e) en se demandant si tout cela avait un sens.";
    else s += "Il/elle s'est éteint(e) avec le sentiment d'avoir vécu sa vie, ni plus, ni moins.";

    return s;
  }

  /* ---------- Init ---------- */
  function init() {
    initTitle();
    initCreation();
  }

  document.addEventListener("DOMContentLoaded", init);
})();