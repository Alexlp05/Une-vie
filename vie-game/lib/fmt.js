/* ============================================================
   UNE VIE v0.5 — FORMATAGE TEXTE AVEC ACCORDS GRAMMATICAUX
   Jetons : {il|elle}, {né|née}, {p1.prenom}, {p1.il}, {p1.son|sa}, {p1|le|la}...
   ============================================================ */

(function () {
  "use strict";

  // Résout un jeton unique selon le contexte
  function resolveToken(token, ctx) {
    // 1. Pronoms relatifs au joueur : {il|elle}, {mon|ma}, {le|la}, {un|une}, {ne|né|née}...
    var playerSexe = ctx.player && ctx.player.sexe || "homme";
    var isF = playerSexe === "femme";

    // Jetons simples joueur
    var simple = {
      "il|elle": isF ? "elle" : "il",
      "ils|elles": isF ? "elles" : "ils",
      "le|la": isF ? "la" : "le",
      "un|une": isF ? "une" : "un",
      "mon|ma": isF ? "ma" : "mon",
      "ton|ta": isF ? "ta" : "ton",
      "son|sa": isF ? "sa" : "son",
      "notre|notre": "notre",
      "votre|votre": "votre",
      "leur|leur": "leur",
      "celui|celle": isF ? "celle" : "celui",
      "ceux|celles": isF ? "celles" : "ceux",
      "mien|mienne": isF ? "mienne" : "mien",
      "tien|tienne": isF ? "tienne" : "tien",
      "sien|sienne": isF ? "sienne" : "sien",
      "né|née": isF ? "née" : "né",
      "mort|morte": isF ? "morte" : "mort",
      "venu|venue": isF ? "venue" : "venu",
      "parti|partie": isF ? "partie" : "parti",
      "content|contente": isF ? "contente" : "content",
      "heureux|heureuse": isF ? "heureuse" : "heureux",
      "triste|triste": "triste",
      "fier|fière": isF ? "fière" : "fier",
      "jaloux|jalouse": isF ? "jalouse" : "jaloux",
      "amoureux|amoureuse": isF ? "amoureuse" : "amoureux",
      "seul|seule": isF ? "seule" : "seul",
      "perdu|perdue": isF ? "perdue" : "perdu",
      "retrouvé|retrouvée": isF ? "retrouvée" : "retrouvé"
    };

    if (simple[token]) return simple[token];

    // 2. Jetons personne : {p1.prenom}, {p1.il}, {p1.son|sa}, {p1.age}, {p1.metier}...
    var m = token.match(/^p(\d+)\.(.+)$/);
    if (m) {
      var idx = parseInt(m[1], 10);
      var field = m[2];
      var person = ctx.people && ctx.people[idx];
      if (!person) return "[p" + idx + "]";

      var pSexe = person.sexe || "homme";
      var pIsF = pSexe === "femme";

      switch (field) {
        case "prenom": return person.prenom || "";
        case "nom": return person.nom || "";
        case "nomComplet": return (person.prenom || "") + " " + (person.nom || "");
        case "age": return String(ctx.year - person.naissance);
        case "naissance": return String(person.naissance);
        case "metier": return person.metier || "";
        case "ville": return person.ville || "";
        case "sexe": return pSexe;
        case "il|elle": return pIsF ? "elle" : "il";
        case "ils|elles": return pIsF ? "elles" : "ils";
        case "le|la": return pIsF ? "la" : "le";
        case "un|une": return pIsF ? "une" : "un";
        case "son|sa": return pIsF ? "sa" : "son";
        case "mon|ma": return pIsF ? "ma" : "mon";
        case "né|née": return pIsF ? "née" : "né";
        case "mort|morte": return pIsF ? "morte" : "mort";
        case "venu|venue": return pIsF ? "venue" : "venu";
        case "content|contente": return pIsF ? "contente" : "content";
        case "heureux|heureuse": return pIsF ? "heureuse" : "heureux";
        case "fier|fière": return pIsF ? "fière" : "fier";
        case "jaloux|jalouse": return pIsF ? "jalouse" : "jaloux";
        case "amoureux|amoureuse": return pIsF ? "amoureuse" : "amoureux";
        case "seul|seule": return pIsF ? "seule" : "seul";
        default: return person[field] !== undefined ? String(person[field]) : "";
      }
    }

    // 3. Variables globales : {year}, {age}, {money}, {nomFamille}...
    if (ctx[token] !== undefined) return String(ctx[token]);

    return "{" + token + "}";
  }

  // Point d'entrée principal
  function fmt(text, ctx) {
    if (!text) return "";
    ctx = ctx || {};
    // S'assurer que player et year sont dispo
    if (ctx.player && !ctx.year) ctx.year = ctx.player.year || 2020;
    if (ctx.state) {
      ctx.player = ctx.player || ctx.state;
      ctx.year = ctx.year || ctx.state.year;
      ctx.people = ctx.people || (ctx.state.people ? Object.values(ctx.state.people) : []);
    }

    return text.replace(/\{([^}]+)\}/g, function (_, token) {
      return resolveToken(token.trim(), ctx);
    });
  }

  // Version qui prend state directement
  function fmtState(text, state) {
    return fmt(text, { state: state, player: state, year: state.year, people: state.people ? Object.values(state.people) : [] });
  }

  window.VIE = window.VIE || {};
  window.VIE.fmt = { fmt: fmt, fmtState: fmtState };
})();