/* ============================================================
   UNE VIE — Moteur de jeu v0.8 (orchestrateur)
   Combine : données legacy (data.js) + moteur v0.5 (engine/*, ui/*)
   ============================================================ */

(function () {
  "use strict";

  var state = null;
  var usedEvents = {};
  var usedOpp = {};
  var usedWorldEvents = {};
  var recentEvents = [];
  var narrativeMemory = {};
  var _lastStats = {};
  var _lastEventWasPassive = false;
  var gameOver = false;
  var gameOverReason = null;
  var currentAccount = null;
  var useCloud = false;

  var STAT_KEYS = ["sante", "energie", "argent", "intelligence", "social", "bonheur", "stress", "apparence", "reputation", "confiance"];
  var STAT_LABELS = {
    sante: "Santé", energie: "Énergie", argent: "Argent",
    intelligence: "Intelligence", social: "Social", bonheur: "Bonheur",
    stress: "Stress", apparence: "Apparence", reputation: "Réputation", confiance: "Confiance"
  };

  var _statsBefore = {};
  var _pendingDeltas = [];  // {stat, delta} à afficher au prochain render
  var _impactQueue = [];    // file des impacts à afficher (stats, relations, passions, etc.)
  var _showingImpact = false;
  var _passiveBefore = null; // snapshot avant un événement passif
  var _wishesPhase = false; // true pendant l'écran de vœux de fin d'année
  var _impactTimer = null;

  function $(sel) { return document.querySelector(sel); }
  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
  function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function uniqueId(prefix) {
    return (prefix || "id") + "_" + Date.now().toString(36) + "_" + Math.random().toString(36).substr(2, 9);
  }

  function show(screenId) {
    var screens = document.querySelectorAll(".screen");
    for (var i = 0; i < screens.length; i++) screens[i].classList.add("hidden");
    var target = $("#" + screenId);
    if (target) target.classList.remove("hidden");
    window.scrollTo(0, 0);
  }

  /* ---------- Helpers legacy (data.js) ---------- */
  function syncArgent() {
    if (!state) return;
    var net = window.VIE.engine.finance ? window.VIE.engine.finance.getNetWorth(state) : state.money;
    state.stats.argent = clamp(Math.round(50 + 30 * Math.tanh((net / 50000 - 1) * 1.2)), 5, 100);
  }

  function addHistory(entry) {
    if (!state) return;
    state.history = state.history || [];
    var e = entry || {};
    if (e.type === undefined || e.type === null) e.type = "vie";
    if (e.year === undefined || e.year === null) e.year = state.year;
    if (e.age === undefined || e.age === null) e.age = state.age;
    if (e.title === undefined || e.title === null) e.title = "";
    if (e.result === undefined || e.result === null) e.result = "";
    state.history.push(e);
    if (state.history.length > 500) state.history.shift();
  }

  function findRelation(type) {
    if (!state) return null;
    var people = state.people || {};
    for (var id in people) {
      var p = people[id];
      var lien = (p.liens || []).find(function (l) { return l.type === type || l.role === type; });
      if (lien) return { person: p, lien: lien };
    }
    return null;
  }

  function relationStatus(rel) {
    if (!rel) return "inconnu";
    if (rel.type === "amour" || rel.role === "amour") {
      if (rel.bond >= 80) return "Passionné(e)";
      if (rel.bond >= 60) return "Amoureux(se)";
      if (rel.bond >= 40) return "Couple";
      if (rel.bond >= 20) return "Complice";
      return "Lointain";
    }
    if (rel.bond >= 80) return "Très proche";
    if (rel.bond >= 60) return "Proche";
    if (rel.bond >= 40) return "Correct";
    if (rel.bond >= 20) return "Tiède";
    return "Éloigné";
  }

  function eventTypeLabel(event) {
    var labels = {
      vie: "Chapitre de vie", carriere: "Vie professionnelle", relation: "Relation",
      aleatoire: "Événement du hasard", crise: "Crise", passion: "Passion",
      sante: "Santé", famille: "Famille", argent: "Argent", social: "Social",
      societe: "Société", business_mgmt: "Direction", passif: "Tranche de vie",
      vices: "Habitudes", redemption: "Rédemption"
    };
    return labels[event.type] || "Chapitre de vie";
  }

  /* ---------- Écran titre ---------- */
  function initTitle() {
    var btnStart = $("#btn-start");
    var btnReplay = $("#btn-replay");
    function onStart() {
      if (window.VIE && window.VIE.supabase && window.VIE.supabase.isConfigured && window.VIE.supabase.isConfigured() && !window.VIE.supabase.isLoggedIn()) {
        showAuth();
      } else {
        showCreation();
      }
    }
    if (btnStart) btnStart.addEventListener("click", onStart);
    if (btnReplay) btnReplay.addEventListener("click", onStart);
  }

  function showAuth() {
    show("screen-auth");
    if (window.VIE && window.VIE.supabase && window.VIE.supabase.init) {
      window.VIE.supabase.init();
    }
    var form = document.getElementById("auth-form");
    var submit = document.getElementById("btn-auth-submit");
    var errorEl = document.getElementById("auth-error");
    var modeLogin = document.getElementById("btn-mode-login");
    var modeSignup = document.getElementById("btn-mode-signup");
    var btnGuest = document.getElementById("btn-guest-mode");
    var isSignup = false;

    if (btnGuest) {
      btnGuest.onclick = function() {
        showCreation();
      };
    }

    if (modeLogin && modeSignup && submit) {
      modeLogin.onclick = function() {
        isSignup = false;
        modeLogin.classList.add("btn-primary");
        modeLogin.classList.remove("btn-secondary");
        modeSignup.classList.add("btn-secondary");
        modeSignup.classList.remove("btn-primary");
        submit.textContent = "Se connecter";
      };

      modeSignup.onclick = function() {
        isSignup = true;
        modeSignup.classList.add("btn-primary");
        modeSignup.classList.remove("btn-secondary");
        modeLogin.classList.add("btn-secondary");
        modeLogin.classList.remove("btn-primary");
        submit.textContent = "Créer mon compte";
      };
    }

    if (form) {
      form.onsubmit = async function(e) {
        e.preventDefault();
        var username = document.getElementById("auth-username").value.trim();
        var password = document.getElementById("auth-password").value.trim();
        if (errorEl) errorEl.textContent = "";
        try {
          if (!window.VIE.supabase) throw new Error("Module Supabase non disponible");
          if (isSignup) {
            await window.VIE.supabase.signup(username, password);
          } else {
            await window.VIE.supabase.login(username, password);
          }
          showCreation();
        } catch (err) {
          if (errorEl) errorEl.textContent = err.message || "Erreur inconnue";
        }
      };
    }
  }

  function showCreation() {
    try {
        show("screen-creation");
        renderTraits();
        renderSexes();
        renderBirthYears();
        renderOrigins();
        if (window.VIE.ui.tabs && window.VIE.ui.tabs.init) window.VIE.ui.tabs.init();
    } catch (e) {
        console.error("Erreur showCreation:", e);
        alert("Erreur lors de l'ouverture de la création : " + e.message);
    }
  }

  /* ---------- Création ---------- */
  var selectedTrait = null;
  var selectedOrigin = null;
  var selectedSexe = "homme";
  var selectedBirthYear = null;

  function refreshCreateBtn() {
    var btn = $("#btn-create");
    if (!btn) return;
    btn.disabled = !($("#input-name").value.trim() && selectedTrait && selectedOrigin && selectedSexe && selectedBirthYear !== null);
  }

  function renderTraits() {
    var list = $("#trait-list");
    if (!list) return;
    list.innerHTML = "";
    selectedTrait = null;

    var traits = window.VIE.data?.traits?.archetypes || TRAITS || [];
    traits.forEach(function (trait) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "trait-option";
      btn.innerHTML = "<strong>" + (trait.name || trait.label || trait.id) + "</strong><small>" + (trait.desc || "") + "</small>";
      btn.addEventListener("click", function () {
        var opts = list.querySelectorAll(".trait-option");
        for (var i = 0; i < opts.length; i++) opts[i].classList.remove("selected");
        btn.classList.add("selected");
        selectedTrait = trait;
        refreshCreateBtn();
      });
      list.appendChild(btn);
    });
  }

  function renderSexes() {
    var list = $("#sex-list");
    if (!list) return;
    list.innerHTML = "";
    selectedSexe = "homme";
    [
      { id: "homme", label: "Homme", desc: "Sexe masculin" },
      { id: "femme", label: "Femme", desc: "Sexe féminin" }
    ].forEach(function (sex) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "trait-option";
      btn.innerHTML = "<strong>" + sex.label + "</strong><small>" + sex.desc + "</small>";
      btn.addEventListener("click", function () {
        var opts = list.querySelectorAll(".trait-option");
        for (var i = 0; i < opts.length; i++) opts[i].classList.remove("selected");
        btn.classList.add("selected");
        selectedSexe = sex.id;
        refreshCreateBtn();
      });
      list.appendChild(btn);
    });
  }

  function renderBirthYears() {
    var list = $("#birth-year-list");
    if (!list) return;
    list.innerHTML = "";
    selectedBirthYear = null;
    var ctx = document.getElementById("era-context");
    var cfg = window.VIE && window.VIE.config ? window.VIE.config : {};
    var timeCfg = cfg.time || {};
    var minY = timeCfg.startYearMin || 1970;
    var maxY = timeCfg.startYearMax || 2010;

    for (var y = minY; y <= maxY; y++) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "trait-option birth-year-option";
      btn.textContent = y;
      (function (yr) {
        btn.addEventListener("click", function () {
          var opts = list.querySelectorAll(".birth-year-option");
          for (var i = 0; i < opts.length; i++) opts[i].classList.remove("selected");
          btn.classList.add("selected");
          selectedBirthYear = yr;
          refreshCreateBtn();
          var ec = cfg.eraContext && cfg.eraContext[yr];
          if (ec && ctx) {
            ctx.innerHTML = '<strong>' + ec.title + ' (' + ec.label + ')</strong> · ' + ec.desc;
          } else if (ctx) {
            ctx.textContent = "";
          }
        });
      })(y);
      list.appendChild(btn);
    }

    if (list.children.length > 0) {
      var mid = Math.floor(list.children.length / 2);
      if (list.children[mid]) list.children[mid].click();
    }
  }

  function renderOrigins() {
    var list = $("#origin-list");
    if (!list) return;
    var origins = window.VIE.data?.origins || ORIGINS || [];
    var shuffled = origins.slice().sort(function () { return Math.random() - 0.5; }).slice(0, 3);
    list.innerHTML = "";
    selectedOrigin = null;

    shuffled.forEach(function (origin) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "origin-option";
      btn.innerHTML = '<strong>' + origin.name + '</strong><small class="origin-tag">' + (origin.tagline || "") + '</small><span class="origin-desc">' + (origin.desc || "") + '</span>';
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
    var btnCreate = $("#btn-create");
    if (btnCreate) btnCreate.addEventListener("click", async function () {
      try {
        var name = $("#input-name").value.trim();
        if (!name || !selectedTrait || !selectedOrigin || !selectedSexe || selectedBirthYear === null) return;
        await startGame(name, selectedTrait, selectedOrigin, selectedSexe, selectedBirthYear);
      } catch (e) {
        console.error("Erreur startGame:", e);
        alert("Erreur lors du démarrage de la partie : " + e.message);
      }
    });
    var btnReroll = $("#btn-reroll-origin");
    if (btnReroll) btnReroll.addEventListener("click", function () { renderOrigins(); });
  }

  /* ---------- Nouvelle partie ---------- */
  async function startGame(name, trait, origin, sexe, birthYear) {
    var engine = window.VIE.engine;
    var base = engine.state ? engine.state.create() : {};
    var seed = Math.floor(Math.random() * 0x100000000);
    if (window.VIE.rng) window.VIE.rng.init(seed);

    // RESET COMPLET de toutes les variables globales
    gameOver = false;
    usedEvents = {};
    usedOpp = {};
    usedWorldEvents = {};
    recentEvents = [];
    narrativeMemory = {};
    _lastEventWasPassive = false;
    if (window.VIE.supabase) {
      window.VIE.supabase.init();
    }

    state = base;
    // Enregistrer l'état dans le state manager (pour les modules UI)
    if (engine.state && engine.state.set) engine.state.set(state);
    state.name = name;
    state.sexe = sexe;
    state.origin = origin;
    state.trait = trait;
    state.archetypeBias = trait.bias || {};
    state.rngSeed = seed;
    state.birthYear = birthYear || state.year;
    state.year = state.birthYear;

    // NE PAS charger de sauvegarde cloud lors d'une nouvelle partie
    // Le chargement se fait uniquement via le bouton "Charger"

    if (engine.state && engine.state.set) engine.state.set(state);
    state.world = engine.world ? engine.world.create() : worldStart();
    state.stats = state.stats || { sante: 85, energie: 80, argent: 42, intelligence: 20, social: 20, bonheur: 60, stress: 10, apparence: 50, reputation: 50, confiance: 50 };
    state.habitudes = state.habitudes || { alcool: 0, tabac: 0, cannabis: 0, jeu: 0, sport: 0, alimentation: 50, sommeil: 50, ecrans: 0, soirees: 0, voyages: 0 };
    state.dependances = state.dependances || {};
    state.people = state.people || {};
    state.history = state.history || [];
    state.yearLog = state.yearLog || [];
    state.narrativeMemory = state.narrativeMemory || {};
    state.flags = state.flags || [];
    state.passions = state.passions || {};
    state.relations = state.relations || [];
    state.wishes = state.wishes || []; // vœux de fin d'année actifs
    state.investments = state.investments || { stocks: 0, realEstate: 0, business: 0 };

    // Appliquer effets trait + origine
    var effects = trait.effects || {};
    Object.keys(effects).forEach(function (k) {
      if (state.stats[k] !== undefined) state.stats[k] = clamp(state.stats[k] + effects[k], 0, 100);
    });
    var oEffects = origin.effects || origin.stats || {};
    Object.keys(oEffects).forEach(function (k) {
      if (state.stats[k] !== undefined) state.stats[k] = clamp(state.stats[k] + oEffects[k], 0, 100);
    });
    if (origin.money !== undefined) state.money = origin.money;
    Object.keys(origin.passions || {}).forEach(function (p) { state.passions[p] = origin.passions[p]; });
    if (origin.flag && state.flags.indexOf(origin.flag) === -1) state.flags.push(origin.flag);

    // Personnalité (Big Five) si dispo
    if (engine.personality) {
      var res = engine.personality.generateAtBirth({
        parents: [],
        origin: origin.id,
        archetype: trait.id
      });
      if (res) {
        state.personality = res.personality;
        state.traits = res.traits || [];
      }
    }

    // Famille
    createFamily();

    usedEvents = {};
    usedOpp = {};
    usedWorldEvents = {};
    recentEvents = [];
    narrativeMemory = {};
    _lastStats = {};

    show("screen-game");
    if (window.VIE.ui.tabs && window.VIE.ui.tabs.init) window.VIE.ui.tabs.init();
    renderAll();
    renderTimeline();

    // Premier événement
    var naissance = null;
    var allEvents = (window.VIE.engine.events && window.VIE.engine.events.getAll) ? window.VIE.engine.events.getAll() : EVENTS;
    for (var i = 0; i < allEvents.length; i++) {
      if (allEvents[i].id === "naissance") { naissance = allEvents[i]; break; }
    }
    if (!naissance) {
      // Événement de secours si "naissance" absent
      naissance = {
        id: "fallback_naissance", stage: "bebe", type: "vie",
        title: "Naissance", text: "Vous ouvrez les yeux. Le monde commence.",
        choices: [{ text: "Vivre.", effects: { bonheur: 2 }, result: "La vie commence." }]
      };
    }
    playEvent(naissance);
  }

  function createFamily() {
    var surname = randomSurname();
    state.surname = surname;
    state.people = state.people || {};

    var pereId = uniqueId("p");
    var pere = makePerson(pereId, randomParentName("m"), surname, "homme", state.year - (30 + Math.floor(Math.random() * 20)), "pere");
    var mereId = uniqueId("p");
    var mere = makePerson(mereId, randomParentName("f"), surname, "femme", state.year - (30 + Math.floor(Math.random() * 20)), "mere");

    state.people[pereId] = pere;
    state.people[mereId] = mere;

    pere.famille.push({ id: mereId, relation: "conjoint" });
    mere.famille.push({ id: pereId, relation: "conjoint" });
    pere.famille.push({ id: "self", relation: "enfant" });
    mere.famille.push({ id: "self", relation: "enfant" });

    // Frères et sœurs
    var nbSiblings = Math.random() < 0.4 ? 0 : (Math.random() < 0.55 ? 1 : (Math.random() < 0.8 ? 2 : 3));
    var used = [];
    for (var i = 0; i < nbSiblings; i++) {
      var sibName = randomName();
      var guard = 0;
      while ((used.indexOf(sibName) !== -1 || sibName === state.name) && guard < 20) { sibName = randomName(); guard++; }
      used.push(sibName);

      var sibId = uniqueId("p");
      var sibSexe = Math.random() < 0.5 ? "homme" : "femme";
      var sibling = makePerson(sibId, sibName, surname, sibSexe, state.year - Math.floor(Math.random() * 5), "frere_soeur");
      state.people[sibId] = sibling;

      sibling.famille.push({ id: pereId, relation: "pere" });
      sibling.famille.push({ id: mereId, relation: "mere" });
      sibling.famille.push({ id: "self", relation: sibSexe === "femme" ? "soeur" : "frere" });
      pere.famille.push({ id: sibId, relation: "enfant" });
      mere.famille.push({ id: sibId, relation: "enfant" });

      state.people["self"] = state.people["self"] || makePlayer();
      state.people["self"].liens.push({
        id: sibId, role: "frere_soeur", relation: sibSexe === "femme" ? "soeur" : "frere", statut: "proche",
        affection: 40 + Math.floor(Math.random() * 30), confiance: 55 + Math.floor(Math.random() * 35), respect: 50,
        attirance: 0, tension: 0, connaissance: 70, depuis: state.year, dernierContact: state.year, contactsParAn: 6
      });
      state.people["self"].famille.push({ id: sibId, relation: sibSexe === "femme" ? "soeur" : "frere" });
    }

    state.people["self"] = state.people["self"] || makePlayer();
    state.people["self"].liens.push({
      id: pereId, role: "parent", relation: "pere", statut: "proche", affection: 62, confiance: 70, respect: 70,
      attirance: 0, tension: 0, connaissance: 80, depuis: state.year, dernierContact: state.year, contactsParAn: 12
    });
    state.people["self"].liens.push({
      id: mereId, role: "parent", relation: "mere", statut: "proche", affection: 68, confiance: 75, respect: 75,
      attirance: 0, tension: 0, connaissance: 85, depuis: state.year, dernierContact: state.year, contactsParAn: 12
    });
    state.people["self"].famille.push({ id: pereId, relation: "pere" });
    state.people["self"].famille.push({ id: mereId, relation: "mere" });

    state.fatherId = pereId;
    state.motherId = mereId;

    addHistory({ age: 0, title: "Naissance", result: "Vous êtes né(e) dans la " + originName(state.origin) + ", chez les " + surname + "." });
  }

  function originName(origin) {
    return (origin && origin.name ? origin.name : "famille").toLowerCase();
  }

  function makePerson(id, nom, surname, sexe, naissance, role) {
    return {
      id: id, prenom: nom, nom: surname, sexe: sexe,
      orientation: "hetero", naissance: naissance,
      vivant: true, deces: null,
      personnalite: { O: 50, C: 50, E: 50, A: 50, N: 50 },
      traits: [],
      valeurs: { famille: 70, carriere: 50, aventure: 30, argent: 50, fidelite: 60, creativite: 40, stabilite: 60, spiritualite: 40 },
      desirEnfants: "veut",
      apparence: 50, sante: 75, metier: "", niveauVie: 50, ville: "",
      passions: {}, habitudes: {}, humeur: 50, conditions: [],
      liens: [{
        id: "self", role: role, statut: "proche", affection: role === "mere" ? 68 : 62,
        confiance: 70, respect: 70, attirance: 0, tension: 0, connaissance: 80,
        depuis: state.year, dernierContact: state.year, contactsParAn: 12
      }],
      famille: [], histoire: [], secrets: [], memoire: {}, niveauDetail: "proche"
    };
  }

  function makePlayer() {
    return {
      id: "self", prenom: state.name, nom: state.surname || "", sexe: state.sexe,
      orientation: null, naissance: state.birthYear || state.year,
      vivant: true, deces: null,
      personnalite: state.personality || { O: 50, C: 50, E: 50, A: 50, N: 50 },
      traits: state.traits || [],
      valeurs: { famille: 50, carriere: 50, aventure: 50, argent: 50, fidelite: 50, creativite: 50, stabilite: 50, spiritualite: 50 },
      desirEnfants: "indecis",
      apparence: 50, sante: 85, metier: "", niveauVie: 50, ville: "",
      passions: state.passions || {}, habitudes: state.habitudes || {}, humeur: 50, conditions: [],
      liens: [], famille: [], histoire: [], secrets: [], memoire: {}, niveauDetail: "proche"
    };
  }

  /* ---------- Rendu ---------- */
  function renderAll(deltas) {
    renderHeader();
    renderStats();
    renderFamilyCard();
    renderCareerCard();
    renderFinancesCard();
    renderWorldCard();
    renderPassionsCard();
    renderRelationsCard();
    if (window.VIE.ui.tabs && window.VIE.ui.tabs.getActive) {
      window.VIE.ui.tabs.renderActive(window.VIE.ui.tabs.getActive());
    }
    renderTimeline();
    // Afficher les impacts (deltas) des choix
    if (deltas && deltas.length) showImpactPanel(deltas);
    _pendingDeltas = [];
  }

  function renderHeader() {
    var n = $("#char-name"); if (n) n.textContent = state.name || "—";
    var a = $("#char-age"); if (a) a.textContent = "Âge " + state.age + " · " + state.year;
    var t = $("#char-trait"); if (t) t.textContent = (state.trait && (state.trait.name || state.trait.label)) || "";
    var b = $("#life-badge"); if (b) b.textContent = state.life ? "Destin" : "Vie";
  }

  function renderStats() {
    var grid = $("#stats-grid");
    if (!grid) return;
    var keys = ["sante", "energie", "argent", "intelligence", "social", "bonheur", "stress", "apparence", "reputation", "confiance"];
    grid.innerHTML = keys.map(function (k) {
      var val = state.stats[k] || 0;
      var cls = val >= 70 ? "good" : (val >= 40 ? "mid" : "low");
      return '<div class="stat"><div class="stat-top"><span>' + (STAT_LABELS[k] || k) + '</span><b>' + val + '</b></div><div class="stat-bar"><div class="stat-fill ' + cls + '" style="width:' + val + '%"></div></div></div>';
    }).join("");
  }

  function renderFamilyCard() {
    var card = $("#family-card");
    if (!card) return;
    var html = "<h4>Famille</h4>";
    if (state.origin) {
      html += '<p class="fam-origin">' + (state.origin.name || "") + (state.surname ? ' · Famille ' + state.surname : '') + '</p>';
      if (state.origin.tagline) html += '<p class="fam-tagline">' + state.origin.tagline + '</p>';
    }

    var people = Object.values(state.people || {}).filter(function (p) { return p.id !== "self" && p.vivant; });
    var parents = people.filter(function (p) { return p.famille.some(function (f) { return f.relation === "enfant" && f.id === "self"; }); });
    var sibs = people.filter(function (p) { return p.famille.some(function (f) { return f.relation === "frere" || f.relation === "soeur"; }); });

    if (parents.length) {
      var pDetails = parents.map(function (p) {
        var lien = (p.liens || []).find(function (l) { return l.id === "self"; }) || {};
        var aff = Math.round(lien.affection || 0);
        return '<strong>' + p.prenom + '</strong> <small>(' + (lien.relation || "parent") + ' · ' + aff + '%)</small>';
      }).join(' · ');
      html += '<div class="fam-item"><span class="fam-label">Parents :</span> ' + pDetails + '</div>';
    }

    if (sibs.length) {
      var sDetails = sibs.map(function (s) {
        var lien = (s.liens || []).find(function (l) { return l.id === "self"; }) || {};
        var aff = Math.round(lien.affection || 0);
        return '<strong>' + s.prenom + '</strong> <small>(' + aff + '%)</small>';
      }).join(' · ');
      html += '<div class="fam-item"><span class="fam-label">Fratrie (' + sibs.length + ') :</span> ' + sDetails + '</div>';
    }

    if (!parents.length && !sibs.length) html += '<p class="info-empty">Seul(e) pour l\'instant.</p>';
    card.innerHTML = html;
  }

  function renderCareerCard() {
    var card = $("#career-card");
    if (!card) return;
    if (!state.career) { card.innerHTML = '<h4>Carrière</h4><p class="info-empty">Aucune carrière pour l\'instant.</p>'; return; }
    var track = window.VIE.getCareerTrack ? window.VIE.getCareerTrack(state.career.track) : null;
    if (!track) { card.innerHTML = '<h4>Carrière</h4><p class="info-empty">Carrière inconnue.</p>'; return; }
    var lvl = track.levels[state.career.level];
    var html = '<h4>Carrière</h4>';
    html += '<p class="career-role">' + lvl.name + "</p>";
    html += '<p class="career-track">' + track.name + " · Niveau " + (state.career.level + 1) + "/" + track.levels.length + "</p>";
    if (window.VIE.engine.finance) {
      var income = window.VIE.engine.finance.computeAnnualIncome(state).brutTotal;
      html += '<p class="career-salary">Revenus ~' + window.VIE.util.formatMoney(income) + "/an (brut)</p>";
    }
    var next = track.levels[state.career.level + 1];
    if (next) html += '<p class="career-progress">Prochain : ' + next.name + "</p>";
    card.innerHTML = html;
  }

  function renderFinancesCard() {
    var card = $("#finances-card");
    if (!card) return;
    if (!window.VIE.engine.finance) { card.innerHTML = '<h4>Finances</h4><p class="info-empty">—</p>'; return; }
    var f = window.VIE.engine.finance.computeAnnualBalance(state);
    var html = "<h4>Finances</h4>";
    var epargne = Math.max(0, state.finance.compte || 0);

    if (state.age < 16) {
      html += '<p class="fin-line"><span>Statut</span><b>Mineur (à charge)</b></p>';
      html += '<p class="fin-line"><span>Tirelire</span><b>' + window.VIE.util.formatMoney(epargne) + "</b></p>";
      html += '<p class="fin-line"><span>Frais de vie</span><b>Pris en charge</b></p>';
      if (state.age >= 12 && f.income.total > 0) {
        html += '<p class="fin-line pos"><span>Argent de poche</span><b>+' + window.VIE.util.formatMoney(f.income.total) + "/an</b></p>";
      }
    } else {
      html += '<p class="fin-line"><span>Épargne</span><b>' + window.VIE.util.formatMoney(state.finance.compte || 0) + "</b></p>";
      html += '<p class="fin-line"><span>Revenus/an</span><b>~' + window.VIE.util.formatMoney(f.income.total) + "</b></p>";
      html += '<p class="fin-line"><span>Charges/an</span><b>~' + window.VIE.util.formatMoney(f.expenses) + "</b></p>";
      html += '<p class="fin-line ' + (f.balance >= 0 ? "pos" : "neg") + '"><span>Solde</span><b>' + (f.balance >= 0 ? "+" : "") + window.VIE.util.formatMoney(f.balance) + "</b></p>";
    }
    card.innerHTML = html;
  }

  function renderWorldCard() {
    var card = $("#world-card");
    if (!card || !state.world) return;
    var econ = window.VIE.config.world.economyStates[state.world.economy];
    var html = "<h4>Monde</h4>";
    html += '<p>Économie : <b>' + (econ ? econ.label : state.world.economy) + "</b></p>";
    html += '<p>Inflation : <b>' + (state.world.inflation || 0).toFixed(1) + "%</b></p>";
    html += "<p>Année : <b>" + state.year + "</b></p>";
    if (state.world.techEra) html += "<p>Époque : <b>" + state.world.techEra.label + "</b></p>";
    card.innerHTML = html;
  }

  function renderPassionsCard() {
    var card = $("#passions-card");
    if (!card) return;
    var passions = state.passions || {};
    var keys = Object.keys(passions);
    if (!keys.length) { card.innerHTML = '<h4>Passions</h4><p class="info-empty">Aucune passion pour l\'instant.</p>'; return; }
    var icons = { peinture: "🎨", musique: "🎵", ecriture: "✒️", sport: "🏃", cuisine: "🍳", technologie: "💻", nature: "🌲", theatre: "🎭", lecture: "📖", photo: "📸", voyage: "✈️" };
    var html = "<h4>Passions</h4>";
    keys.forEach(function (k) {
      html += '<div class="passion-item"><span>' + (icons[k] || "⭐") + " " + k + '</span><span class="passion-level">Niv. ' + passions[k] + "</span></div>";
    });
    card.innerHTML = html;
  }

  function renderRelationsCard() {
    var card = $("#relations-card");
    if (!card) return;
    var people = Object.values(state.people || {}).filter(function (p) {
      return p.id !== "self" && p.vivant && (p.liens || []).some(function (l) { return l.affection > 0; });
    });
    if (!people.length) { card.innerHTML = '<h4>Relations</h4><p class="info-empty">Aucune relation significative.</p>'; return; }
    var html = "<h4>Relations (" + people.length + ")</h4>";
    people.slice(0, 6).forEach(function (p) {
      var lien = p.liens.find(function (l) { return l.affection > 0; });
      if (!lien) return;
      html += '<div class="relation-item"><span class="rel-name">' + p.prenom + '</span>';
      html += '<span class="rel-status">' + (lien.role || "") + " · " + (lien.statut || "") + "</span>";
      html += '<div class="rel-bar"><div class="rel-fill ' + (lien.affection >= 70 ? "strong" : "") + '" style="width:' + lien.affection + '%"></div></div>';
      html += "</div>";
    });
    if (people.length > 6) html += '<p class="info-empty">… et ' + (people.length - 6) + " autres</p>";
    card.innerHTML = html;
  }

  function renderTimeline(stateArg) {
    var tl = $("#timeline");
    if (!tl) return;
    var s = stateArg || state;
    var entries = (s.history || []).slice(-20).reverse();
    var icons = { vie: "📖", carriere: "💼", relation: "🤝", aleatoire: "🎲", crise: "⚡", passion: "🔥", sante: "🩺", famille: "👨‍👩‍👧‍👦", argent: "💰", social: "🎉", societe: "🌍", deuil: "🕯️", formation: "📚", monde: "🌍" };
    tl.innerHTML = entries.map(function (e) {
      return '<li><span class="tl-age">' + e.age + " ans (" + e.year + ')</span> <span class="tl-icon">' + (icons[e.type] || "📝") + '</span> ' + (e.title || "") + '<span class="tl-result">' + (e.result || "") + "</span></li>";
    }).join("");
  }

  // ── AFFICHAGE DES IMPACTS (DELTAS) DES CHOIX ─────────────
  function showStatDeltas(deltas) {
    var container = document.getElementById("delta-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "delta-container";
      container.className = "delta-container";
      var statsGrid = document.getElementById("stats-grid");
      if (statsGrid) statsGrid.parentNode.insertBefore(container, statsGrid.nextSibling);
    }
    container.innerHTML = "";

    var labels = STAT_LABELS;
    deltas.forEach(function (d) {
      var el = document.createElement("div");
      el.className = "delta-indicator " + (d.delta > 0 ? "delta-up" : "delta-down");
      el.textContent = (d.delta > 0 ? "+" : "") + d.delta + " " + (labels[d.stat] || d.stat);
      container.appendChild(el);
      // Auto-suppression après l'animation
      setTimeout(function () { el.classList.add("delta-fade"); }, 700);
      setTimeout(function () { if (el.parentNode === container) container.removeChild(el); }, 1400);
    });
  }

  /* ---------- Boucle de jeu ---------- */
  function playEvent(event) {
    if (!event) return;
    if (event.once !== false) usedEvents[event.id] = true;
    recentEvents.push(event.id);
    if (recentEvents.length > 12) recentEvents.shift();

    _lastEventWasPassive = event.passive || !event.choices || event.choices.length === 0;

    // Snapshot avant pour les événements passifs (afin d'afficher les impacts après)
    if (_lastEventWasPassive) {
      _passiveBefore = captureImpactSnapshot();
    }

    // Les événements passifs ne passent pas par resolveChoice :
    // on les enregistre auprès du moteur pour éviter les répétitions.
    if (_lastEventWasPassive && window.VIE.engine.events && window.VIE.engine.events.markPlayed) {
      window.VIE.engine.events.markPlayed(event);
    }

    var theme = themeOf(event);
    var th = THEMES[theme] || THEMES.vie || { icon: "📖", label: "Vie" };
    var stage = $("#story-stage");
    if (stage) stage.textContent = (th.icon || "📖") + " " + eventTypeLabel(event) + " · " + stageName(state.age);
    var title = $("#story-title"); if (title) title.textContent = event.title;
    var text = $("#story-text"); if (text) text.innerHTML = renderEventText(event.text);
    var card = document.querySelector(".story-card");
    if (card) card.setAttribute("data-theme", theme);

    state.yearLog.push(event.title);

    var choices = $("#choices");
    if (!choices) return;
    choices.innerHTML = "";

    if (_lastEventWasPassive) {
      // Panneau d'impact dédié pour les interludes (plus visible)
      var after = captureImpactSnapshot();
      var deltas = computeImpactDeltas(_passiveBefore || {}, after);
      if (deltas && deltas.length) showImpactPanel(deltas);

      var cont = document.createElement("button");
      cont.type = "button";
      cont.className = "choice-btn next-btn passive-continue";
      cont.textContent = "Continuer";
      cont.addEventListener("click", function () { nextAction(); });
      choices.appendChild(cont);
    } else {
      event.choices.forEach(function (choice, idx) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "choice-btn";
        
        // Afficher le nom de la personne ciblée si la choix a un personId
        var displayText = choice.text;
        if (choice.personId && state.people && state.people[choice.personId]) {
          var targetName = state.people[choice.personId].prenom;
          displayText = choice.text + " <span class=\"choice-target\">— " + targetName + "</span>";
        }
        
        btn.innerHTML = displayText;
        
        if (choice.note) {
          var note = document.createElement("span");
          note.className = "choice-note";
          note.textContent = choice.note;
          btn.appendChild(note);
        }
        btn.addEventListener("click", function () { resolveChoice(event, choice, idx); });
        choices.appendChild(btn);
      });
    }

    renderAll();

    // Marquer visuellement les événements passifs (interludes sans choix)
    if (_lastEventWasPassive) {
      var card = document.querySelector(".story-card");
      if (card) {
        card.classList.add("event-passive");
        var badge = document.createElement("div");
        badge.className = "passive-badge";
        badge.textContent = "INTERLUDE — Tranche de vie";
        card.insertBefore(badge, card.firstChild);
      }
      // Ajouter un petit délai avant de permettre le clic (lisibilité)
      choices.style.opacity = "0";
      choices.style.transition = "opacity 0.4s ease";
      setTimeout(function () { choices.style.opacity = "1"; }, 400);
    }

    var sc = document.querySelector(".story-card");
    if (sc && sc.scrollIntoView) sc.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /* ── RENDRE LES NOMS DE PERSONNES CLIQUABLES DANS LE TEXTE ────────── */
  function renderEventText(text) {
    if (!text || !state.people) return text;
    
    var html = text;
    // Remplacer chaque prénom de personne connue par un lien cliquable
    // On trie par longueur décroissante pour éviter les remplacements partiels
    var people = Object.values(state.people).filter(function(p) { return p.id !== "self" && p.vivant; });
    
    // Trier par longueur de prénom décroissante
    people.sort(function(a, b) { return (b.prenom || "").length - (a.prenom || "").length; });
    
    people.forEach(function(p) {
      if (!p.prenom) return;
      var prenom = p.prenom;
      var regex = new RegExp("\\b" + prenom.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "g");
      html = html.replace(regex, '<span class="person-link" data-person-id="' + p.id + '">' + prenom + '</span>');
    });
    
    return html;
  }

  function resolveChoice(event, choice, idx) {
    var engine = window.VIE.engine;
    var resultText = "";

    // ── 1. Snapshot avant (stats, argent, relations, passions, traits) ──
    var before = captureImpactSnapshot();

    // Construire boundPeople si le choix cible une personne spécifique
    var boundPeople = null;
    if (choice.personId && state.people && state.people[choice.personId]) {
      boundPeople = { p1: state.people[choice.personId] };
    }

    if (engine.events && engine.events.resolveChoice) {
      var res = engine.events.resolveChoice(state, event, choice, idx, boundPeople);
      resultText = res && (res.resultText || res.result) ? (res.resultText || res.result) : (choice.result || "");
    } else {
      // Fallback minimal
      var fx = choice.effects || {};
      Object.keys(fx).forEach(function (k) {
        if (state.stats[k] !== undefined) state.stats[k] = clamp(state.stats[k] + fx[k], 0, 100);
      });
      resultText = choice.result || "";
    }

    // ── 2. Calculer les deltas d'impact ──
    var after = captureImpactSnapshot();
    var deltas = computeImpactDeltas(before, after);
    _impactQueue = deltas;

    // ── 3. Afficher résultat + bouton suivant ──
    var choices = $("#choices");
    choices.innerHTML = "";
    var resEl = document.createElement("div");
    resEl.className = "story-result";
    resEl.textContent = resultText;
    choices.appendChild(resEl);

    var next = document.createElement("button");
    next.type = "button";
    next.className = "choice-btn next-btn";
    next.textContent = "Continuer";
    next.addEventListener("click", function () { nextAction(); });
    choices.appendChild(next);

    renderAll(_impactQueue);
    _impactQueue = [];
  }

  // ── Capture un instantané des valeurs suivies ──────────────────
  function captureImpactSnapshot() {
    var s = {};
    STAT_KEYS.forEach(function (k) { s[k] = state.stats[k] || 0; });
    s.money = state.finance && state.finance.compte !== undefined ? state.finance.compte : (state.money || 0);
    s.passions = {};
    Object.keys(state.passions || {}).forEach(function (k) { s.passions[k] = state.passions[k]; });
    s.relations = {};
    Object.keys(state.people || {}).forEach(function (pid) {
      var p = state.people[pid];
      (p.liens || []).forEach(function (l) {
        if (l.id === "self") s.relations[p.id] = { affection: l.affection || 0, role: l.role || "", statut: l.statut || "" };
      });
    });
    s.traits = (state.traits || []).slice();
    s.flags = (state.flags || []).slice();
    return s;
  }

  // ── Calculer les deltas entre deux instantanés ─────────────────
  function computeImpactDeltas(before, after) {
    var deltas = [];

    // Stats
    STAT_KEYS.forEach(function (k) {
      var d = (after[k] || 0) - (before[k] || 0);
      if (d !== 0) deltas.push({ type: "stat", stat: k, delta: d, label: STAT_LABELS[k] || k });
    });

    // Argent
    var moneyD = (after.money || 0) - (before.money || 0);
    if (moneyD !== 0) deltas.push({ type: "money", stat: "money", delta: moneyD, label: "Argent" });

    // Passions (nouvelle ou modifiée)
    var afterPassions = after.passions || {};
    var beforePassions = before.passions || {};
    Object.keys(afterPassions).forEach(function (k) {
      var prev = beforePassions[k] || 0;
      var curr = afterPassions[k] || 0;
      if (curr !== prev) {
        deltas.push({ type: "passion", stat: k, delta: curr - prev, label: k, newPassion: prev === 0 });
      }
    });

    // Relations (nouvelle ou affection modifiée)
    var afterRel = after.relations || {};
    var beforeRel = before.relations || {};
    Object.keys(afterRel).forEach(function (pid) {
      var prev = beforeRel[pid];
      var curr = afterRel[pid];
      if (!prev) {
        deltas.push({ type: "relation", stat: pid, delta: curr.affection, label: curr.affection > 0 ? "Nouvelle rencontre" : "", newRelation: true, personId: pid, personName: (state.people && state.people[pid] ? state.people[pid].prenom : pid) });
      } else if (curr.affection !== prev.affection) {
        deltas.push({ type: "relation", stat: pid, delta: curr.affection - prev.affection, label: "Lien avec " + (state.people && state.people[pid] ? state.people[pid].prenom : pid), personId: pid });
      }
    });

    // Traits (nouveau trait acquis)
    after.traits.forEach(function (t) {
      if (before.traits.indexOf(t) < 0) {
        deltas.push({ type: "trait", stat: t, delta: 1, label: "Nouveau trait : " + t, newTrait: true });
      }
    });

    // Flags (nouveau flag)
    after.flags.forEach(function (f) {
      if (before.flags.indexOf(f) < 0) {
        deltas.push({ type: "flag", stat: f, delta: 1, label: "Nouveau statut : " + f, newFlag: true });
      }
    });

    return deltas;
  }

  // ── Panneau d'impact détaillé (affiché après chaque choix) ─────
  function showImpactPanel(deltas) {
    if (!deltas || deltas.length === 0) return;

    var container = document.getElementById("impact-panel");
    if (!container) {
      container = document.createElement("div");
      container.id = "impact-panel";
      container.className = "impact-panel";
      var storyCard = document.querySelector(".story-card");
      if (storyCard && storyCard.parentNode) storyCard.parentNode.insertBefore(container, storyCard.nextSibling);
    }

    var html = '<div class="impact-header"><h4>▲ Impact de votre choix</h4></div>';
    deltas.forEach(function (d) {
      var sign = d.delta > 0 ? "+" : "";
      var cls = d.delta > 0 ? "impact-up" : (d.delta < 0 ? "impact-down" : "impact-neutral");
      var icon = "";
      if (d.type === "money") icon = "💰";
      else if (d.type === "passion") icon = "❤️";
      else if (d.type === "relation") icon = "🤝";
      else if (d.type === "trait") icon = "✨";
      else if (d.type === "flag") icon = "🏷️";
      else if (d.stat === "sante") icon = "❤️‍🩹";
      else if (d.stat === "energie") icon = "⚡";
      else if (d.stat === "argent") icon = "💵";
      else if (d.stat === "bonheur") icon = "😊";
      else if (d.stat === "social") icon = "👥";
      else if (d.stat === "intelligence") icon = "🧠";
      else if (d.stat === "stress") icon = "😰";
      else if (d.stat === "apparence") icon = "🪞";
      else if (d.stat === "reputation") icon = "🏆";
      else if (d.stat === "confiance") icon = "🤗";

      html += '<div class="impact-row ' + cls + '"><span class="impact-icon">' + icon + '</span><span class="impact-label">' + d.label + '</span><span class="impact-value">' + sign + d.delta + '</span></div>';
    });

    container.innerHTML = html;
    container.classList.add("impact-show");

    // Auto-masque après 2.5s
    if (_impactTimer) clearTimeout(_impactTimer);
    _impactTimer = setTimeout(function () {
      container.classList.remove("impact-show");
      setTimeout(function () { if (container.parentNode) container.innerHTML = ""; }, 400);
    }, 2500);
  }

  function nextAction() {
    if (!state) return;
    if ((state.stats.sante || 0) <= 0) { endGame("maladie"); return; }

    var slots = slotsForAge(state.age);
    if (!_lastEventWasPassive) {
      if (state.slot >= slots - 1) advanceYear();
      else state.slot++;
    }
    _lastEventWasPassive = false;

    if (state.age >= 85) {
      var chance = Math.min(0.45, (state.age - 85) * 0.06);
      if (Math.random() < chance) { endGame("vieux"); return; }
    }
    if (state.age >= 100) { endGame("vieux"); return; }

    var engine = window.VIE.engine;

    // Interlude passif (sans choix) : joue avant l'événement principal
    if (state.pendingPassive && state.pendingPassive.length) {
      var passif = state.pendingPassive.shift();
      if (state.pendingPassive.length === 0) state.pendingPassive = null;
      if (passif) { playEvent(passif); return; }
    }

    var ev = null;
    if (engine.events && engine.events.chooseForAction) {
      ev = engine.events.chooseForAction(state);
    }
    if (ev) playEvent(ev);
    else endGame("vieux");
  }

  function advanceYear() {
    state.year++;
    state.age++;
    state.slot = 0;

    // Vieillissement : la santé physique et l'énergie baissent avec l'âge
    if (state.age > 45) {
      var wear = (state.age - 45) * 0.06;
      state.stats.sante = clamp(state.stats.sante - wear, 0, 100);
      state.stats.energie = clamp(state.stats.energie - wear * 0.8, 0, 100);
    }

    // Jalons d'âge : joués par le moteur (events.pickMilestone).
    // Ne jamais recaler l'âge ici (cela créait une boucle infinie au jalon 18).

    // Temps social
    if (window.VIE.engine.relations && window.VIE.engine.relations.calculateSocialTime) {
      state.tempsSocial = window.VIE.engine.relations.calculateSocialTime(state);
    }

    // Monde
    if (window.VIE.engine.world && window.VIE.engine.world.tick) {
      window.VIE.engine.world.tick(state);
    }

    // Finances
    if (window.VIE.engine.finance && window.VIE.engine.finance.applyAnnual) {
      window.VIE.engine.finance.applyAnnual(state);
    } else {
      state.money = clamp((state.money || 0) + 1000, -30, 600);
    }

    // Destins extraordinaires
    if (window.VIE.engine.events && window.VIE.engine.events.checkOpportunities) {
      window.VIE.engine.events.checkOpportunities(state);
    }

    // Interludes passifs (scènes sans choix, tirées au début de l'année)
    if (window.VIE.engine.events && window.VIE.engine.events.pickPassive) {
      var passifs = window.VIE.engine.events.pickPassive(state, 1);
      state.pendingPassive = (passifs && passifs.length) ? passifs : null;
    }

    // PNJ
    if (window.VIE.engine.people && window.VIE.engine.people.ageAll) {
      window.VIE.engine.people.ageAll(state);
    }

    // Nouvelles rencontres (école, travail, voisinage, amour)
    if (window.VIE.engine.encounters && window.VIE.engine.encounters.annual) {
      window.VIE.engine.encounters.annual(state);
    }

    // Relations
    if (window.VIE.engine.relations) {
      if (window.VIE.engine.relations.accumulateTension) window.VIE.engine.relations.accumulateTension(state);
      if (window.VIE.engine.relations.spontaneousContacts) window.VIE.engine.relations.spontaneousContacts(state);
      if (window.VIE.engine.relations.updateLinks) window.VIE.engine.relations.updateLinks(state);
      if (window.VIE.engine.relations.erodeAll) window.VIE.engine.relations.erodeAll(state);
      if (window.VIE.engine.relations.progressHabits) window.VIE.engine.relations.progressHabits(state);
      if (window.VIE.engine.relations.progressRedemption) window.VIE.engine.relations.progressRedemption(state);
      if (window.VIE.engine.relations.checkSecrets) window.VIE.engine.relations.checkSecrets(state);
    }

    // Carrière
    if (window.VIE.engine.career) {
      if (window.VIE.engine.career.checkPromotion) window.VIE.engine.career.checkPromotion(state);
      if (state.etudes && state.etudes.enCours && window.VIE.engine.career.advanceEducation) {
        window.VIE.engine.career.advanceEducation(state);
      }
    }

    // Santé (mortalité joueur)
    // La santé physique du joueur suit la stat « santé » : c'est elle qui
    // pilote le multiplicateur de mortalité.
    var me = state.people && state.people["self"];
    if (me) {
      me.sante = clamp(state.stats.sante, 0, 100);
      if (window.VIE.engine.health && window.VIE.engine.health.shouldDie) {
        if (window.VIE.engine.health.shouldDie(me, state)) { endGame("maladie"); return; }
      }
    }

    renderAll();
    
    // Séquence de fin d'année : transition → bilan → voeux
    runYearEndSequence();

    // Sauvegarde automatique (en fin d'année, une fois tout à jour)
    if (window.VIE.engine.save && window.VIE.engine.save.save) {
      try { window.VIE.engine.save.save("auto"); } catch (e) { /* sauvegarde non bloquante */ }
    }

    // Sauvegarde cloud si connecté
    if (window.VIE.supabase && window.VIE.supabase.isLoggedIn()) {
      window.VIE.supabase.saveGame(state).catch(function(e) {
        console.warn("Sauvegarde cloud échouée:", e);
      });
    }
  }

  // ════════════════════════════════════════════════════════════════════
  // SÉQUENCE DE FIN D'ANNÉE : Transition → Bilan → Vœux
  // ═══════════════════════════════════════════════════════════════════

  function runYearEndSequence() {
    // 1. Transition d'année (fade avec résumé)
    showYearChange();
    
    // 2. Après le fade, afficher le bilan (à partir de 10 ans)
    setTimeout(function() {
      if (gameOver) return;
      if (state.age >= 10) {
        showYearSummary();
      } else {
        // Même avant 10 ans, on peut avancer sans bilan détaillé
        renderAll();
      }
    }, 2500); // attendre la fin du fade
  }

  // ════════════════════════════════════════════════════════════════════
  // BILAN DE L'ANNÉE
  // ═══════════════════════════════════════════════════════════════════

  function showYearSummary() {
    // Calculer les stats du bilan
    var summary = computeYearSummary();
    
    var overlay = document.createElement("div");
    overlay.id = "summary-overlay";
    overlay.className = "summary-overlay";
    overlay.innerHTML = 
      '<div class="summary-card">' +
        '<div class="summary-header">' +
          '<h2>📊 Bilan de l\'année ' + (state.year - 1) + '</h2>' +
          '<p class="summary-subtitle">Âge : ' + (state.age - 1) + ' ans | Année ' + (state.year - 1) + '</p>' +
        '</div>' +
        '<div class="summary-stats">' +
          '<div class="summary-stat"><span class="sum-label">Santé</span><span class="sum-value ' + (state.stats.sante >= 70 ? 'good' : state.stats.sante >= 40 ? 'mid' : 'low') + '">' + (state.stats.sante || 0) + '/100</span></div>' +
          '<div class="summary-stat"><span class="sum-label">Bonheur</span><span class="sum-value ' + (state.stats.bonheur >= 70 ? 'good' : state.stats.bonheur >= 40 ? 'mid' : 'low') + '">' + (state.stats.bonheur || 0) + '/100</span></div>' +
          '<div class="summary-stat"><span class="sum-label">Argent</span><span class="sum-value ' + (state.stats.argent >= 70 ? 'good' : state.stats.argent >= 40 ? 'mid' : 'low') + '">' + (state.stats.argent || 0) + '/100</span></div>' +
          '<div class="summary-stat"><span class="sum-label">Relations</span><span class="sum-value ' + (state.stats.social >= 70 ? 'good' : state.stats.social >= 40 ? 'mid' : 'low') + '">' + (state.stats.social || 0) + '/100</span></div>' +
        '</div>' +
        '<div class="summary-section">' +
          '<h4>📅 Événements marquants</h4>' +
          '<ul class="year-events">' + getYearEventsHtml() + '</ul>' +
        '</div>' +
        '<div class="summary-section">' +
          '<h4>👥 Relations</h4>' +
          '<div class="relation-summary">' + getRelationsHtml() + '</div>' +
        '</div>' +
        '<div class="summary-section">' +
          '<h4>💼 Carrière & Finances</h4>' +
          '<div class="career-fin-summary">' + getCareerFinanceHtml() + '</div>' +
        '</div>' +
        '<div class="summary-actions">' +
          '<button id="btn-continue-to-wishes" class="btn btn-primary">Continuer vers les vœux →</button>' +
          '<button id="btn-skip-wishes" class="btn btn-ghost btn-small">Ignorer les vœux</button>' +
        '</div>' +
      '</div>';
    
    document.body.appendChild(overlay);
    
    // Événements
    overlay.querySelector("#btn-continue-to-wishes").addEventListener("click", function() {
      document.getElementById("summary-overlay").remove();
      makeWishes(state);
    });
    overlay.querySelector("#btn-skip-wishes").addEventListener("click", function() {
      document.getElementById("summary-overlay").remove();
      _wishesPhase = false;
      renderAll();
    });
  }

  function getYearEventsHtml() {
    var entries = (state.yearLog || []).slice(-8);
    if (!entries.length) return '<li class="empty">Une année calme.</li>';
    return entries.map(function(e) {
      return '<li><span class="event-age">[' + e.age + ' ans]</span> ' + e + '</li>';
    }).join('');
  }

  function getRelationsHtml() {
    var people = Object.values(state.people || {}).filter(function(p) { return p.id !== "self" && p.vivant; });
    var links = [];
    people.forEach(function(p) {
      var lien = p.liens.find(function(l) { return l.id === "self"; });
      if (lien && lien.affection > 0) {
        var roleLabel = {
          "amour": "❤️ Amour", "ami": "🤝 Ami", "ami_proche": "🤝 Ami proche",
          "meilleur_ami": "💎 Meilleur ami", "conjoint": "💍 Conjoint",
          "pere": "👨 Père", "mere": "👩 Mère", "frere": "👨 Frère", "soeur": "👩 Sœur",
          "enfant": "👶 Enfant", "conjoint": "💍 Conjoint", "ex": "💔 Ex"
        }[p.liens.find(function(l) { return l.id === "self"; })?.role] || "👤";
        return '<span class="relation-item"><span class="rel-name">' + p.prenom + '</span> <span class="rel-role">' + roleLabel + '</span> <span class="rel-affection">' + (lien.affection || 0) + '%</span></span>';
      }
      return null;
    }).filter(Boolean);
    return links.length ? links.join('') : '<span class="empty">Aucune relation significative.</span>';
  }

  function getCareerFinanceHtml() {
    var parts = [];
    if (state.career) {
      var track = window.VIE.getCareerTrack ? window.VIE.getCareerTrack(state.career.track) : null;
      if (track) {
        var lvl = track.levels[state.career.level];
        parts.push('💼 ' + lvl.name + ' (' + track.name + ' niv.' + (state.career.level + 1) + ')');
      }
    } else {
      parts.push('💼 Sans emploi');
    }
    if (state.finance) {
      parts.push('💰 Épargne : ' + (window.VIE.util ? window.VIE.util.formatMoney(state.finance.compte || 0) : (state.finance.compte || 0) + '€'));
    }
    return parts.join(' | ') || '—';
  }

  // ── VŒUX DE FIN D'ANNÉE ──────────────────────────────────────
  // À chaque nouvelle année, le joueur choisit un vœu qui influencera
  // les événements de l'année à venir.
  var WISH_CATALOG = [
    { id: "sante", label: "Bonne santé", desc: "Moins de risques de maladie, + événements santé.", icon: "❤️‍🩹", stat: "sante", bonus: 0.25 },
    { id: "amour", label: "Rencontrer l'amour", desc: "+ chances de rencontre amoureuse.", icon: "💘", stat: "amour", bonus: 0.30 },
    { id: "carriere", label: "Réussite professionnelle", desc: "+ chances de promotion/événements carrière.", icon: "💼", stat: "carriere", bonus: 0.25 },
    { id: "argent", label: "Prospérité financière", desc: "+ chances d'événements financiers positifs.", icon: "💰", stat: "argent", bonus: 0.25 },
    { id: "amitie", label: "Nouvelle amitié", desc: "+ chances de rencontre amicale.", icon: "🤝", stat: "amitie", bonus: 0.30 },
    { id: "passion", label: "Découvrir une passion", desc: "+ chances de découvrir une nouvelle passion.", icon: "✨", stat: "passion", bonus: 0.30 },
    { id: "tranquillite", label: "Tranquillité d'esprit", desc: "- Moins d'événements de crise.", icon: "🍃", stat: "tranquillite", bonus: 0.20 },
    { id: "famille", label: "Lien familial", desc: "+ événements familiaux, liens renforcés.", icon: "👨‍👩‍👧‍👦", stat: "famille", bonus: 0.25 },
    { id: "creativite", label: "Épanouissement créatif", desc: "+ événements artistiques et créatifs.", icon: "🎨", stat: "creativite", bonus: 0.25 },
    { id: "voyage", label: "Voyages et découvertes", desc: "+ événements de voyage et de monde.", icon: "✈️", stat: "voyage", bonus: 0.25 }
  ];

  function makeWishes(state) {
    _wishesPhase = true;

    // Mélanger et prendre 3 vœux
    var pool = WISH_CATALOG.slice().sort(function () { return Math.random() - 0.5; }).slice(0, 3);

    // Créer l'écran de vœux (overlay)
    var overlay = document.createElement("div");
    overlay.id = "wish-overlay";
    overlay.className = "wish-overlay";
    overlay.innerHTML = '<div class="wish-card"><div class="wish-header"><h2>🎯 Vœu de l’année ' + state.year + '</h2><p>Choisissez un vœu qui guidera votre prochaine année :</p></div><div class="wish-options" id="wish-options"></div><div class="wish-footer"><button id="wish-skip" class="btn btn-ghost btn-small">Passer</button></div></div>';
    document.body.appendChild(overlay);

    var optionsContainer = overlay.querySelector("#wish-options");
    pool.forEach(function (w) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "wish-option";
      btn.innerHTML = '<span class="wish-icon">' + w.icon + '</span><div class="wish-info"><div class="wish-title">' + w.label + '</div><div class="wish-desc">' + w.desc + '</div></div>';
      btn.addEventListener("click", function () {
        applyWish(state, w);
        overlay.remove();
        _wishesPhase = false;
        renderAll();
      });
      optionsContainer.appendChild(btn);
    });

    // Bouton passer
    overlay.querySelector("#wish-skip").addEventListener("click", function () {
      overlay.remove();
      _wishesPhase = false;
      renderAll();
    });

    // Empêcher les clics en arrière-plan
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) overlay.querySelector("#wish-skip").click();
    });
  }

  function applyWish(state, wish) {
    // Supprimer les vœux expirés
    state.wishes = (state.wishes || []).filter(function (w) {
      return w.yearStart + w.duration > state.year;
    });

    // Ajouter le nouveau vœu
    state.wishes.push({
      id: wish.id,
      label: wish.label,
      stat: wish.stat,
      bonus: wish.bonus,
      yearStart: state.year,
      duration: 1
    });

    // Afficher une confirmation toast
    flash("Vœu enregistré : " + wish.label);
  }

  function showYearChange() {
    var fade = $("#year-fade");
    if (!fade) return;
    var num = $("#year-fade-num"); if (num) num.textContent = state.year;
    var recap = $("#year-fade-recap");
    if (recap) {
      var items = (state.yearLog || []).slice(-4);
      recap.innerHTML = items.length ? items.map(function (t) { return "<li>" + t + "</li>"; }).join("") : "<li>Une année calme.</li>";
    }
    state.yearLog = [];
    fade.classList.remove("show");
    void fade.offsetWidth;
    fade.classList.add("show");
    clearTimeout(state._yearFadeTimer);
    state._yearFadeTimer = setTimeout(function () { fade.classList.remove("show"); }, 2500);
  }

  function stageName(age) {
    if (typeof STAGES !== "undefined") {
      for (var i = 0; i < STAGES.length; i++) {
        if (age >= STAGES[i].min && age <= STAGES[i].max) return STAGES[i].name;
      }
    }
    return "Vieillesse";
  }

  /* ---------- Fin de vie ---------- */
  function endGame(reason) {
    if (gameOver) return;
    gameOver = true;
    gameOverReason = reason || "inconnu";
    var ending = (typeof ENDINGS !== "undefined" && ENDINGS[reason]) || { kicker: "La fin", epitaph: "Chaque vie est un voyage." };
    var title = state.life ? state.life : lifeTitle(state);

    var kicker = $("#end-kicker"); if (kicker) kicker.textContent = ending.kicker + (state.life ? " · " + state.life : "");
    var t = $("#end-title"); if (t) t.textContent = title;
    var epi = $("#end-epitaph"); if (epi) epi.textContent = ending.epitaph;

    var statsDiv = $("#end-stats");
    if (statsDiv) {
      statsDiv.innerHTML = "";
      STAT_KEYS.forEach(function (k) {
        var row = document.createElement("div");
        row.className = "end-stat";
        row.innerHTML = '<span>' + STAT_LABELS[k] + '</span><b>' + (state.stats[k] || 0) + "</b>";
        statsDiv.appendChild(row);
      });
    }

    var careerBox = $("#end-career");
    if (careerBox) {
      var careerHtml = "<h4>Carrière & finances</h4>";
      if (state.career) {
        var track = window.VIE.getCareerTrack ? window.VIE.getCareerTrack(state.career.track) : null;
        if (track) careerHtml += "<p>" + track.levels[state.career.level].name + " — " + track.name + "</p>";
      } else {
        careerHtml += "<p>Aucune carrière définie.</p>";
      }
      careerHtml += "<p>Épargne finale : " + window.VIE.util.formatMoney(state.finance.compte || 0) + "</p>";
      careerBox.innerHTML = careerHtml;
    }

    var relBox = $("#end-relations");
    if (relBox) {
      var relHtml = "<h4>Entourage</h4>";
      var people = Object.values(state.people || {}).filter(function (p) { return p.id !== "self"; });
      if (people.length) {
        people.slice(0, 12).forEach(function (p) {
          var lien = (p.liens || []).find(function (l) { return l.id === "self"; }) || {};
          relHtml += "<p>" + p.prenom + " — " + relationStatus(lien) + " (" + (lien.affection || 0) + "%)</p>";
        });
      } else {
        relHtml += "<p>Une vie solitaire, mais digne.</p>";
      }
      relBox.innerHTML = relHtml;
    }

    var pasBox = $("#end-passions");
    if (pasBox) {
      var pas = Object.keys(state.passions || {}).filter(function (k) { return state.passions[k] >= 3; });
      var pasHtml = "<h4>Passions</h4>";
      pasHtml += "<p>" + (pas.length ? pas.join(" · ") : "Peu de passions déclarées, mais une vie vécue pleinement.") + "</p>";
      pasBox.innerHTML = pasHtml;
    }

    var scoreEl = $("#end-score");
    if (scoreEl) {
      var score = 0;
      score += (state.stats.bonheur || 0) * 2;
      score += (state.stats.sante || 0);
      score += (state.stats.intelligence || 0);
      score += (state.stats.social || 0);
      score += (state.history || []).length * 2;
      score += state.age;
      if (state.career) score += (state.career.level + 1) * 4;
      if (state.life) score += 40;
      scoreEl.textContent = score;
    }

    var syn = $("#end-synopsis");
    if (syn) syn.textContent = buildSynopsis();

    show("screen-end");
  }

  function buildSynopsis() {
    var s = state.name + " est né(e) en " + (state.birthYear || state.year) + " dans une " + originName(state.origin) + ".";
    if (state.career) {
      var track = window.VIE.getCareerTrack ? window.VIE.getCareerTrack(state.career.track) : null;
      if (track) s += " Il/elle a fait carrière dans " + track.name + ".";
    }
    if (state.life) s += " Son destin : " + state.life + ".";
    var people = Object.values(state.people || {}).filter(function (p) { return p.id !== "self" && p.vivant; });
    if (people.length) s += " " + people.length + " proches l'ont accompagné(e).";
    s += " À " + state.age + " ans, " + (state.stats.bonheur >= 70 ? "il/elle s'en va apaisé(e)." : "il/elle s'en va, la tête pleine de tout ce qui a été vécu.");
    return s;
  }

  /* ---------- Sauvegarde / Chargement ---------- */
  function saveGame(slot) {
    if (!state) return { ok: false, reason: "Aucune partie en cours" };
    var engine = window.VIE.engine;
    if (!engine.save || !engine.save.save) return { ok: false, reason: "Sauvegarde indisponible" };
    // L'état du jeu est la référence partagée avec le state manager
    if (engine.state && engine.state.set) engine.state.set(state);
    var res = engine.save.save(slot || "auto");
    if (res.ok) flash("Partie sauvegardée.");
    return res;
  }

  function loadGame(slot) {
    var engine = window.VIE.engine;
    if (!engine.save || !engine.save.load) return { ok: false, reason: "Chargement indisponible" };
    var res = engine.save.load(slot || "auto");
    if (!res.ok) return res;
    state = engine.state.get();
    gameOver = false;
    usedEvents = {};
    usedOpp = {};
    usedWorldEvents = {};
    recentEvents = [];
    _lastEventWasPassive = false;
    show("screen-game");
    renderAll();
    flash("Partie chargée.");
    return res;
  }

  function flash(msg) {
    var el = document.getElementById("toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.remove("hidden");
    if (window.setTimeout) {
      window.setTimeout(function () { el.classList.add("hidden"); }, 2200);
    }
  }

  function initGameActions() {
    var saveBtn = document.getElementById("btn-save");
    if (saveBtn) saveBtn.addEventListener("click", function () { saveGame("auto"); });
    var loadBtn = document.getElementById("btn-load");
    if (loadBtn) loadBtn.addEventListener("click", function () {
      var res = loadGame("auto");
      if (!res.ok) flash("Aucune sauvegarde à charger.");
    });
    var menuBtn = document.getElementById("btn-menu");
    if (menuBtn) menuBtn.addEventListener("click", function () { showCreation(); });
  }

  /* ---------- Styles et gestion des liens de personnes ---------- */
  function initPersonLinkStyles() {
    // Injecter le CSS pour les liens de personnes
    var style = document.createElement("style");
    style.textContent = `
      .person-link {
        color: var(--gold);
        text-decoration: underline;
        cursor: pointer;
        font-weight: bold;
        padding: 1px 4px;
        border-radius: 3px;
        background: rgba(184, 134, 11, 0.15);
        transition: all 0.2s ease;
      }
      .person-link:hover {
        background: rgba(184, 134, 11, 0.35);
        transform: scale(1.05);
      }
      .choice-target {
        color: var(--gold);
        text-decoration: underline;
        cursor: pointer;
        font-weight: bold;
        padding: 1px 6px;
        border-radius: 6px;
        background: rgba(184, 134, 11, 0.2);
        transition: all 0.2s ease;
        margin-left: 4px;
        display: inline-block;
        vertical-align: middle;
      }
      .choice-target:hover {
        background: rgba(184, 134, 11, 0.4);
        transform: scale(1.1);
      }
    `;
    document.head.appendChild(style);

    // Déléguer les clics sur les liens de personnes
    document.addEventListener("click", function(e) {
      var link = e.target.closest(".person-link, .choice-target");
      if (link) {
        e.preventDefault();
        e.stopPropagation();
        var personId = link.getAttribute("data-person-id");
        if (personId && window.VIE.ui.personCard) {
          window.VIE.ui.personCard.open(personId);
        }
      }
    });
  }

  /* ---------- Init ---------- */
  function init() {
    initTitle();
    initCreation();
    initGameActions();
    initPersonLinkStyles();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  /* ---------- Exports ---------- */
  window.VIE = window.VIE || {};
  window.VIE.engine = window.VIE.engine || {};
  // NE PAS écraser engine.state (géré par engine/state.js)
  window.VIE.game = {
    getState: function () { return state; },
    getStats: function () { return state ? state.stats : null; },
    isOver: function () { return gameOver; },
    getEndReason: function () { return gameOverReason; },
    saveGame: saveGame,
    loadGame: loadGame,
    renderAll: renderAll,
    renderTimeline: renderTimeline,
    advanceYear: advanceYear,
    nextAction: nextAction,
    playEvent: playEvent,
    startGame: startGame,
    showCreation: showCreation,
    createFamily: createFamily,
    getPlayerId: function () { return "self"; }
  };
  // L'état canonique est celui du state manager (il peut être remplacé
  // par un chargement de sauvegarde) : on délègue à celui-ci.
  window.VIE.engine.getState = function () {
    return (window.VIE.engine.state && window.VIE.engine.state.get) ? window.VIE.engine.state.get() : state;
  };
  window.VIE.engine.getStats = function () {
    var s = window.VIE.engine.getState();
    return s ? s.stats : null;
  };
  window.VIE.engine.renderAll = renderAll;
  window.VIE.engine.renderTimeline = renderTimeline;
  window.VIE.engine.advanceYear = advanceYear;
  window.VIE.engine.nextAction = nextAction;
  window.VIE.engine.playEvent = playEvent;
  window.VIE.engine.startGame = startGame;
  window.VIE.engine.showCreation = showCreation;
  window.VIE.engine.createFamily = createFamily;
  window.VIE.engine.getPlayerId = window.VIE.game.getPlayerId;
})();