/* ============================================================
   UNE VIE v0.5 — ARBRE GÉNÉALOGIQUE
   SVG interactif, ascendants/descendants, cliquable
   ============================================================ */

(function () {
  "use strict";

  function render(state) {
    var panel = document.getElementById("panel-arbre");
    if (!panel) return;

    var playerId = Object.keys(state.people || {}).find(function (k) {
      var p = state.people[k];
      return p && (p.liens || []).some(function (l) { return l.role === "self"; });
    });
    if (!playerId) {
      // Créer lien self si absent
      Object.values(state.people || {}).forEach(function (p) {
        if (p && p.prenom === state.name && p.nom === state.surname) {
          p.liens = p.liens || [];
          p.liens.push({ role: "self", statut: "moi", affection: 100, confiance: 100, respect: 100, attirance: 0, tension: 0, connaissance: 100, depuis: state.year, dernierContact: state.year, contactsParAn: 0 });
          playerId = p.id;
        }
      });
    }
    if (!playerId) { panel.innerHTML = '<p class="empty">Arbre non disponible.</p>'; return; }

    var maxDepth = window.VIE.config.ui.familyTreeMaxDepth || 5;
    var nodes = collectFamily(state, playerId, maxDepth);
    var layout = layoutTree(nodes, playerId);

    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", layout.height + 100);
    svg.setAttribute("viewBox", "0 0 " + (layout.width + 100) + " " + (layout.height + 100));
    svg.style.maxWidth = "100%";
    svg.style.height = "auto";

    // Lignes
    layout.links.forEach(function (link) {
      var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", link.source.x);
      line.setAttribute("y1", link.source.y);
      line.setAttribute("x2", link.target.x);
      line.setAttribute("y2", link.target.y);
      line.setAttribute("stroke", link.type === "parent" ? "#888" : "#b3547a");
      line.setAttribute("stroke-width", link.type === "parent" ? "1.5" : "1");
      line.setAttribute("stroke-dasharray", link.type === "conjoint" ? "5,5" : "none");
      svg.appendChild(line);
    });

    // Nœuds
    layout.nodes.forEach(function (node) {
      var g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.setAttribute("transform", "translate(" + node.x + "," + node.y + ")");
      g.style.cursor = "pointer";

      var circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("r", node.id === playerId ? 22 : 18);
      circle.setAttribute("fill", node.id === playerId ? "url(#playerGrad)" : (node.sexe === "femme" ? "#f7e3ec" : "#e0ebf2"));
      circle.setAttribute("stroke", node.vivant ? (node.id === playerId ? "var(--gold)" : "#ccc") : "#999");
      circle.setAttribute("stroke-width", node.id === playerId ? 3 : 1.5);
      if (!node.vivant) circle.setAttribute("opacity", 0.5);
      g.appendChild(circle);

      // Initiale
      var text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("dy", "0.35em");
      text.setAttribute("font-size", node.id === playerId ? "14" : "11");
      text.setAttribute("fill", node.vivant ? "var(--ink)" : "#999");
      text.setAttribute("font-weight", node.id === playerId ? "bold" : "normal");
      text.textContent = (node.prenom || "?")[0].toUpperCase();
      g.appendChild(text);

      // Nom + âge (tooltip-like on hover)
      var title = document.createElementNS("http://www.w3.org/2000/svg", "title");
      var age = state.year - node.naissance;
      title.textContent = node.prenom + " " + node.nom + " · " + age + " ans · " + (node.metier || "—") + (node.vivant ? "" : " †" + (node.deces?.annee || ""));
      g.appendChild(title);

      // Click handler
      g.addEventListener("click", function () { window.VIE.ui.personCard.open(node.id); });

      svg.appendChild(g);
    });

    // Définition gradient joueur
    var defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    var grad = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
    grad.setAttribute("id", "playerGrad");
    grad.setAttribute("x1", "0%"); grad.setAttribute("y1", "0%");
    grad.setAttribute("x2", "100%"); grad.setAttribute("y2", "100%");
    var stop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop"); stop1.setAttribute("offset", "0%"); stop1.setAttribute("stop-color", "#fff8e6");
    var stop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop"); stop2.setAttribute("offset", "100%"); stop2.setAttribute("stop-color", "#ffe8b3");
    grad.appendChild(stop1); grad.appendChild(stop2);
    defs.appendChild(grad);
    svg.insertBefore(defs, svg.firstChild);

    panel.innerHTML = '<div class="tree-legend">🟢 Vivant · ⚪ Décédé · 🟡 Vous · Ligne continue = parenté · Ligne pointillée = couple</div>';
    panel.appendChild(svg);
  }

  // ── COLLECTE FAMILLE ─────────────────────────────────────
  function collectFamily(state, rootId, maxDepth) {
    var visited = new Set();
    var nodes = [];

    function dfs(id, depth, relation) {
      if (depth > maxDepth || visited.has(id)) return;
      visited.add(id);
      var p = state.people[id];
      if (!p) return;
      var fam = p.famille || [];
      nodes.push({ id: p.id, prenom: p.prenom, nom: p.nom, sexe: p.sexe, naissance: p.naissance, metier: p.metier, vivant: p.vivant, deces: p.deces, relation: relation, depth: depth, famille: fam });
      // Parents
      if (depth < maxDepth) {
        fam.filter(function (f) { return f.relation === "pere" || f.relation === "mere"; }).forEach(function (f) { dfs(f.id, depth + 1, "parent"); });
        // Conjoint
        fam.filter(function (f) { return f.relation === "conjoint"; }).forEach(function (f) { dfs(f.id, depth, "conjoint"); });
        // Enfants
        fam.filter(function (f) { return f.relation === "enfant"; }).forEach(function (f) { dfs(f.id, depth + 1, "enfant"); });
        // Fratrie (via parents)
        fam.filter(function (f) { return f.relation === "pere" || f.relation === "mere"; }).forEach(function (par) {
          var parent = state.people[par.id];
          if (parent) (parent.famille || []).filter(function (f) { return f.relation === "enfant" && f.id !== p.id; }).forEach(function (sib) { dfs(sib.id, depth, "frere_soeur"); });
        });
      }
    }

    dfs(rootId, 0, "self");
    return nodes;
  }

  // ── LAYOUT (Reingold-Tilford simplifié) ──────────────────
  function layoutTree(nodes, rootId) {
    var nodeMap = {};
    nodes.forEach(function (n) { nodeMap[n.id] = { ...n, children: [], x: 0, y: 0 }; });

    // Construire arbre parent→enfants (ignorer conjoint/frères pour layout principal)
    nodes.forEach(function (n) {
      if (n.relation === "enfant") {
        var parentId = (n.famille || []).find(function (f) { return f.relation === "pere" || f.relation === "mere"; })?.id;
        if (parentId && nodeMap[parentId]) nodeMap[parentId].children.push(nodeMap[n.id]);
      }
    });

    var root = nodeMap[rootId];
    var NODE_W = 140, NODE_H = 100;
    var maxDepth = Math.max(...nodes.map(function (n) { return n.depth; }));

    // Position Y par profondeur
    nodes.forEach(function (n) { n.y = 50 + n.depth * NODE_H; });

    // Position X (centré sur racine)
    function position(node, depth, left, right) {
      if (!node) return;
      var childCount = node.children.length;
      if (childCount === 0) {
        node.x = (left + right) / 2;
        return node.x;
      }
      var childWidth = NODE_W * childCount;
      var startX = (left + right - childWidth) / 2;
      node.children.forEach(function (c, i) {
        c.x = startX + i * NODE_W + NODE_W / 2;
        position(c, depth + 1, startX + i * NODE_W, startX + (i + 1) * NODE_W);
      });
      node.x = node.children.reduce(function (s, c) { return s + c.x; }, 0) / childCount;
    }
    position(root, 0, 0, 2000);

    // Liens
    var links = [];
    nodes.forEach(function (n) {
      var fam = n.famille || [];
      if (n.relation === "enfant") {
        var parentId = fam.find(function (f) { return f.relation === "pere" || f.relation === "mere"; })?.id;
        if (parentId && nodeMap[parentId]) links.push({ source: nodeMap[parentId], target: n, type: "parent" });
      }
      // Conjoint
      var conjoint = fam.find(function (f) { return f.relation === "conjoint"; });
      if (conjoint && nodeMap[conjoint.id] && n.id < conjoint.id) { // éviter doublons
        links.push({ source: n, target: nodeMap[conjoint.id], type: "conjoint" });
      }
    });

    var width = nodes.reduce(function (m, n) { return Math.max(m, n.x); }, 0) + 100;
    var height = (maxDepth + 1) * NODE_H + 50;

    return { nodes: nodes, links: links, width: width, height: height };
  }

  window.VIE = window.VIE || {};
  window.VIE.ui = window.VIE.ui || {};
  window.VIE.ui.familyTree = { render: render };
})();