/* ============================================================
   UNE VIE v0.8 — SUPABASE AUTH & SAVE (cloud)
   ============================================================ */

(function () {
  "use strict";

  // ═══════════════════════════════════════════════════════════════════
  // TES CLÉS SUPABASE
  // ═══════════════════════════════════════════════════════════════════
  const SUPABASE_URL = "https://une-vie.supabase.co";
  const SUPABASE_ANON_KEY = "sb_publishable_SLl8li_eSJ6LArKNo7uQmQ_TC27MJCS";
  // ═══════════════════════════════════════════════════════════════════

  let client = null;
  let initialized = false;

  function init() {
    if (initialized) return;
    if (typeof window.supabase === "undefined") {
      console.warn("Supabase JS non chargé. Ajoute le script CDN dans index.html.");
      return;
    }
    client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    initialized = true;
  }

  function isLoggedIn() {
    return client ? !!client.auth.user() : false;
  }

  function getUser() {
    return client ? client.auth.user() : null;
  }

  async function signup(username, password) {
    if (!client) throw new Error("Supabase non initialisé");
    const email = username + "@une-vie.local";
    const { data, error } = await client.auth.signUp({
      email: email,
      password: password,
      options: { data: { username: username } }
    });
    if (error) throw error;
    return data;
  }

  async function login(username, password) {
    if (!client) throw new Error("Supabase non initialisé");
    const email = username + "@une-vie.local";
    const { data, error } = await client.auth.signInWithPassword({
      email: email,
      password: password
    });
    if (error) throw error;
    return data;
  }

  async function logout() {
    if (!client) return;
    await client.auth.signOut();
  }

  async function saveGame(state) {
    if (!client) throw new Error("Supabase non initialisé");
    const user = client.auth.user();
    if (!user) throw new Error("Non connecté");

    const payload = {
      user_id: user.id,
      slot_name: "partie_principale",
      state: state,
      updated_at: new Date().toISOString()
    };

    const { error } = await client
      .from("saves")
      .upsert(payload, { onConflict: ["user_id", "slot_name"] });

    if (error) throw error;
    return { ok: true };
  }

  async function loadGame() {
    if (!client) throw new Error("Supabase non initialisé");
    const user = client.auth.user();
    if (!user) throw new Error("Non connecté");

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
    isLoggedIn: isLoggedIn,
    getUser: getUser,
    signup: signup,
    login: login,
    logout: logout,
    saveGame: saveGame,
    loadGame: loadGame
  };
})();