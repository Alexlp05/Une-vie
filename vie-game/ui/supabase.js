/* ============================================================
   UNE VIE v0.8 — SUPABASE AUTH & SAVE (cloud)
   Compatible Supabase JS v2
   ============================================================ */

(function () {
  "use strict";

  // ═══════════════════════════════════════════════════════════════════
  // CONFIGURATION SUPABASE OFFICIELLE
  // ═══════════════════════════════════════════════════════════════════
  const SUPABASE_URL = "https://dutlvhxdnvaolyeprcnh.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1dGx2aHhkbnZhb2x5ZXByY25oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI2NzExMjksImV4cCI6MjEwODI0NzEyOX0.3basjxaQA04qR8uqilIF0JBUfb1iV0bC3Y-T1Ne4Tpg";
  // ═══════════════════════════════════════════════════════════════════

  let client = null;
  let initialized = false;
  let currentSession = null;
  let currentUser = null;

  function isConfigured() {
    return !!(SUPABASE_URL && SUPABASE_ANON_KEY);
  }

  function init() {
    if (initialized) return;
    if (typeof window.supabase === "undefined") {
      console.warn("Supabase JS non chargé (CDN inaccessible ou hors-ligne).");
      return;
    }
    try {
      client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      initialized = true;

      // Récupérer la session persistée
      client.auth.getSession().then(({ data }) => {
        currentSession = data ? data.session : null;
        currentUser = currentSession ? currentSession.user : null;
      }).catch(err => {
        console.warn("Session Supabase introuvable ou expirée:", err);
      });

      // Écouter les changements d'authentification
      client.auth.onAuthStateChange((_event, session) => {
        currentSession = session;
        currentUser = session ? session.user : null;
      });
    } catch (e) {
      console.error("Erreur d'initialisation Supabase:", e);
    }
  }

  function isLoggedIn() {
    return !!currentUser;
  }

  function getUser() {
    return currentUser;
  }

  async function signup(username, password) {
    if (!client) init();
    if (!client) {
      throw new Error("Supabase n'a pas pu être initialisé. Vérifie ta connexion.");
    }
    const cleanUser = username.trim().toLowerCase();
    // Utiliser un format d'email valide accepté par les validateurs Supabase
    const email = cleanUser.includes("@") ? cleanUser : (cleanUser + "@unevie.com");
    const { data, error } = await client.auth.signUp({
      email: email,
      password: password,
      options: { data: { username: username } }
    });
    if (error) {
      if (error.message && (error.message.includes("rate limit") || error.message.includes("over_email_send_rate_limit"))) {
        throw new Error("Limite d'envoi d'emails Supabase atteinte. Pour supprimer cette limite, désactive 'Confirm email' dans ton dashboard Supabase (Authentication > Providers > Email). En attendant, tu peux cliquer sur 'Jouer sans compte' !");
      }
      throw error;
    }
    if (data && data.user) {
      currentUser = data.user;
      currentSession = data.session;
    }
    if (!data.session) {
      // Si "Confirm email" est actif sur Supabase
      throw new Error("Compte créé ! Attention : 'Confirm email' est actif dans ton projet Supabase. Désactive-le dans Authentication > Providers > Email pour une connexion immédiate sans email.");
    }
    return data;
  }

  async function login(username, password) {
    if (!client) init();
    if (!client) {
      throw new Error("Supabase n'a pas pu être initialisé. Vérifie ta connexion.");
    }
    const cleanUser = username.trim().toLowerCase();
    const email = cleanUser.includes("@") ? cleanUser : (cleanUser + "@unevie.com");
    const { data, error } = await client.auth.signInWithPassword({
      email: email,
      password: password
    });
    if (error) {
      if (error.message && error.message.includes("Email not confirmed")) {
        throw new Error("Email non confirmé. Pense à désactiver 'Confirm email' dans ton dashboard Supabase (Authentication > Providers > Email) pour te connecter par pseudo.");
      }
      throw error;
    }
    if (data && data.user) {
      currentUser = data.user;
      currentSession = data.session;
    }
    return data;
  }

  async function logout() {
    if (!client) return;
    await client.auth.signOut();
    currentUser = null;
    currentSession = null;
  }

  async function saveGame(state) {
    if (!client) return { ok: false, reason: "Supabase non connecté" };
    const user = currentUser || ((await client.auth.getUser()).data || {}).user;
    if (!user) throw new Error("Non connecté à Supabase");

    const payload = {
      user_id: user.id,
      slot_name: "partie_principale",
      state: state,
      updated_at: new Date().toISOString()
    };

    const { error } = await client
      .from("saves")
      .upsert(payload, { onConflict: "user_id,slot_name" });

    if (error) throw error;
    return { ok: true };
  }

  async function loadGame() {
    if (!client) return { ok: false, reason: "Supabase non connecté" };
    const user = currentUser || ((await client.auth.getUser()).data || {}).user;
    if (!user) throw new Error("Non connecté à Supabase");

    const { data, error } = await client
      .from("saves")
      .select("*")
      .eq("user_id", user.id)
      .eq("slot_name", "partie_principale")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return { ok: true, state: data ? data.state : null };
  }

  window.VIE = window.VIE || {};
  window.VIE.supabase = {
    init: init,
    isConfigured: isConfigured,
    isLoggedIn: isLoggedIn,
    getUser: getUser,
    signup: signup,
    login: login,
    logout: logout,
    saveGame: saveGame,
    loadGame: loadGame
  };
})();
