import { createClient, SupabaseClient } from "@supabase/supabase-js";
import {
  UserProfile,
  RegisteredUser,
  ChatMessage,
  AdminGameEarning,
  AppNotification,
  RechargeRequest,
  WithdrawRequest,
  WonGameRecord,
  HistoryRecord,
  WinnerAnnouncement,
} from "./types";
import { DEFAULT_COMMUNITY_USERS, isBotAccount } from "./data/communityUsers";

// Clean and validate Supabase URL and Key (strip accidental surrounding quotes and whitespace)
function cleanUrl(raw?: string): string {
  const fallback = "https://ifvbswcynljhggqvwqtr.supabase.co";
  if (!raw || typeof raw !== "string") return fallback;
  const sanitized = raw.trim().replace(/^["']|["']$/g, "").trim();
  try {
    const parsed = new URL(sanitized);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return sanitized;
    }
  } catch {}
  return fallback;
}

function cleanKey(raw?: string): string {
  const fallback = "sb_publishable_K9RqWARmSB7l2g6UuGto4w_O7ZNnvv7";
  if (!raw || typeof raw !== "string") return fallback;
  const sanitized = raw.trim().replace(/^["']|["']$/g, "").trim();
  return sanitized || fallback;
}

export const SUPABASE_URL = cleanUrl(import.meta.env.VITE_SUPABASE_URL);
export const SUPABASE_ANON_KEY = cleanKey(import.meta.env.VITE_SUPABASE_ANON_KEY);

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL &&
    SUPABASE_ANON_KEY &&
    !SUPABASE_URL.includes("your-project") &&
    !SUPABASE_ANON_KEY.includes("your-anon-key")
);

// WebView-safe storage adapter (prevents SecurityError if localStorage is restricted in FreeWebToApk/WebView)
const memoryFallbackStorage = new Map<string, string>();
const safeWebViewStorage = {
  getItem: (key: string): string | null => {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return memoryFallbackStorage.get(key) ?? null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      memoryFallbackStorage.set(key, value);
    }
  },
  removeItem: (key: string): void => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      memoryFallbackStorage.delete(key);
    }
  },
};

// Safe initialization of Supabase client to prevent any blank screen crash
function initSupabase(): SupabaseClient {
  try {
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        storage: safeWebViewStorage,
        // Bypass navigator.locks which can throw or hang on file:// or older Android WebViews
        lock: async <R,>(_name: string, _acquireTimeout: number, fn: () => Promise<R>): Promise<R> => {
          return await fn();
        },
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
  } catch (err) {
    console.warn("Error creando cliente Supabase principal, iniciando cliente fallback:", err);
    return createClient("https://ifvbswcynljhggqvwqtr.supabase.co", "sb_publishable_K9RqWARmSB7l2g6UuGto4w_O7ZNnvv7", {
      auth: {
        persistSession: false,
        storage: safeWebViewStorage,
      },
    });
  }
}

export const supabase: SupabaseClient = initSupabase();

console.log("⚡ Conexión exclusiva con Supabase inicializada:", SUPABASE_URL);

// =========================================================================
// 0. AUTENTICACIÓN Y PERFILES SUPABASE
// =========================================================================

export async function signUpWithSupabase(
  email: string,
  pass: string,
  metadata?: {
    name?: string;
    pagoMovilPhone?: string;
    pagoMovilBank?: string;
    pagoMovilId?: string;
    gender?: string;
    avatar?: string;
  }
): Promise<{ success: boolean; error?: string; user?: any }> {
  if (!isSupabaseConfigured) {
    return { success: true };
  }
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: metadata || {},
      },
    });
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, user: data.user };
  } catch (err: any) {
    return { success: false, error: err?.message || "Error al conectar con Supabase" };
  }
}

export async function signInWithSupabase(
  email: string,
  pass: string
): Promise<{ success: boolean; error?: string; user?: any }> {
  if (!isSupabaseConfigured) {
    return { success: true };
  }
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, user: data.user };
  } catch (err: any) {
    return { success: false, error: err?.message || "Error al conectar con Supabase" };
  }
}

export async function upsertSupabaseProfile(profile: Partial<UserProfile>): Promise<void> {
  if (!profile.email) return;
  try {
    if (isSupabaseConfigured) {
      await supabase.from("profiles").upsert(
        {
          email: profile.email.toLowerCase().trim(),
          name: profile.name,
          role: profile.role || "PLAYER",
          balance: profile.balance || 0,
          avatar: profile.avatar || "🤠",
          gender: profile.gender || "MALE",
          pago_movil_phone: profile.pagoMovilPhone || null,
          pago_movil_bank: profile.pagoMovilBank || null,
          pago_movil_id: profile.pagoMovilId || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "email" }
      );
    }
  } catch {}
}

// =========================================================================
// 1. USUARIOS REGISTRADOS (Cero Bots, solo personas reales)
// =========================================================================

export function subscribeToUsers(
  callback: (users: RegisteredUser[]) => void
): () => void {
  // Read initial from localStorage
  const loadLocal = (): RegisteredUser[] => {
    try {
      const stored = localStorage.getItem("chamo_registered_users_v1");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter((u) => u && u.email && !isBotAccount(u.email, u.id));
        }
      }
    } catch {}
    return DEFAULT_COMMUNITY_USERS;
  };

  callback(loadLocal());

  if (!isSupabaseConfigured) {
    return () => {};
  }

  // Fetch initial users from Supabase table 'users'
  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("registered_at", { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        const mappedUsers: RegisteredUser[] = data.map((d: any) => ({
          id: d.id || d.email,
          name: d.name || d.email?.split("@")[0] || "Jugador",
          email: d.email,
          balance: Number(d.balance) || 0,
          gender: d.gender === "FEMALE" ? "FEMALE" : "MALE",
          avatar: d.avatar || "👤",
          isBanned: Boolean(d.is_banned),
          bannedReason: d.banned_reason,
          registeredAt: d.registered_at || new Date().toISOString(),
          isOnline: d.is_online !== false,
          pagoMovilPhone: d.pago_movil_phone,
          pagoMovilBank: d.pago_movil_bank,
          pagoMovilId: d.pago_movil_id,
          stats: {
            cartones: Number(d.stats_cartones) || 0,
            bingos: Number(d.stats_bingos) || 0,
            victorias: Number(d.stats_victorias) || Number(d.stats_bingos) || 0,
          },
        }));

        const clean = mappedUsers.filter((u) => u && u.email && !isBotAccount(u.email, u.id));
        if (clean.length > 0) {
          try {
            localStorage.setItem("chamo_registered_users_v1", JSON.stringify(clean));
          } catch {}
          callback(clean);
        }
      }
    } catch (err) {
      console.warn("Supabase fetch users notice:", err);
    }
  };

  fetchUsers();

  // Real-time channel subscription on 'users' table with unique channel instance
  const channelName = `realtime-users-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  let channel: any = null;
  try {
    channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "users" },
        () => {
          fetchUsers();
        }
      )
      .subscribe();
  } catch (chanErr) {
    console.warn("Notice subscribing to users channel:", chanErr);
  }

  const intervalId = setInterval(fetchUsers, 10000);

  return () => {
    clearInterval(intervalId);
    if (channel) {
      try {
        supabase.removeChannel(channel);
      } catch {}
    }
  };
}

export async function saveUserToSupabase(user: RegisteredUser): Promise<void> {
  if (!user || !user.email) return;

  // Always update local cache
  try {
    const stored = localStorage.getItem("chamo_registered_users_v1");
    let currentUsers: RegisteredUser[] = stored ? JSON.parse(stored) : [...DEFAULT_COMMUNITY_USERS];
    const idx = currentUsers.findIndex((u) => u.email.toLowerCase() === user.email.toLowerCase());
    if (idx >= 0) {
      currentUsers[idx] = { ...currentUsers[idx], ...user };
    } else {
      currentUsers.push(user);
    }
    localStorage.setItem("chamo_registered_users_v1", JSON.stringify(currentUsers));
  } catch {}

  if (!isSupabaseConfigured) return;

  try {
    const payload = {
      id: user.id || user.email,
      email: user.email.toLowerCase().trim(),
      name: user.name || user.email.split("@")[0] || "Jugador",
      balance: Number(user.balance) || 0,
      gender: user.gender || "MALE",
      avatar: user.avatar || "👤",
      is_banned: Boolean(user.isBanned),
      banned_reason: user.bannedReason || null,
      registered_at: user.registeredAt || new Date().toISOString(),
      is_online: user.isOnline !== false,
      pago_movil_phone: user.pagoMovilPhone || null,
      pago_movil_bank: user.pagoMovilBank || null,
      pago_movil_id: user.pagoMovilId || null,
      stats_cartones: Number(user.stats?.cartones) || 0,
      stats_bingos: Number(user.stats?.bingos) || 0,
      stats_victorias: Number(user.stats?.victorias) || Number(user.stats?.bingos) || 0,
      updated_at: new Date().toISOString(),
    };

    await supabase.from("users").upsert(payload, { onConflict: "email" });
  } catch (err) {
    console.warn("Supabase upsert user notice:", err);
  }
}

// =========================================================================
// 2. CHAT DE JUGADORES EN VIVO (Supabase Realtime)
// =========================================================================

export function getLatestSundayMidnight(now: Date = new Date()): number {
  const d = new Date(now);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function subscribeToChatMessages(
  callback: (messages: ChatMessage[]) => void
): () => void {
  const loadLocal = (): ChatMessage[] => {
    try {
      const stored = localStorage.getItem("chamo_chat_messages_v1");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [
      {
        id: "welcome-supa-1",
        senderEmail: "admin@bingoelchamo.com",
        senderName: "Administrador Chamo",
        senderAvatar: "🤠",
        role: "ADMIN",
        text: "¡Bienvenidos al Chat de Jugadores! Los mensajes están conectados en tiempo real con Supabase.",
        timestamp: "En Vivo",
        createdAt: Date.now() - 3600000,
      },
    ];
  };

  callback(loadLocal());

  if (!isSupabaseConfigured) {
    return () => {};
  }

  const fetchMessages = async () => {
    try {
      const sundayCutoff = getLatestSundayMidnight();
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .gte("created_at", sundayCutoff)
        .order("created_at", { ascending: true })
        .limit(100);

      if (!error && Array.isArray(data) && data.length > 0) {
        const mapped: ChatMessage[] = data.map((d: any) => ({
          id: d.id || `msg-${d.created_at}`,
          senderEmail: d.sender_email,
          senderName: d.sender_name,
          senderAvatar: d.sender_avatar,
          role: d.role || "PLAYER",
          text: d.text,
          timestamp: d.timestamp || new Date(d.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          createdAt: Number(d.created_at) || Date.now(),
        }));
        try {
          localStorage.setItem("chamo_chat_messages_v1", JSON.stringify(mapped));
        } catch {}
        callback(mapped);
      }
    } catch (err) {
      console.warn("Supabase fetch messages notice:", err);
    }
  };

  fetchMessages();

  const channelName = `realtime-chat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  let channel: any = null;
  try {
    channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages" },
        () => {
          fetchMessages();
        }
      )
      .subscribe();
  } catch (chanErr) {
    console.warn("Notice subscribing to chat channel:", chanErr);
  }

  const intervalId = setInterval(fetchMessages, 6000);

  return () => {
    clearInterval(intervalId);
    if (channel) {
      try {
        supabase.removeChannel(channel);
      } catch {}
    }
  };
}

export async function sendMessageToSupabase(msg: ChatMessage): Promise<void> {
  // Update local cache
  try {
    const stored = localStorage.getItem("chamo_chat_messages_v1");
    const current: ChatMessage[] = stored ? JSON.parse(stored) : [];
    current.push(msg);
    localStorage.setItem("chamo_chat_messages_v1", JSON.stringify(current));
  } catch {}

  if (!isSupabaseConfigured) return;

  try {
    const payload = {
      id: msg.id,
      sender_email: msg.senderEmail,
      sender_name: msg.senderName,
      sender_avatar: msg.senderAvatar || "👤",
      role: msg.role || "PLAYER",
      text: msg.text,
      timestamp: msg.timestamp,
      created_at: Number(msg.createdAt) || Date.now(),
    };

    await supabase.from("chat_messages").insert([payload]);
  } catch (err) {
    console.warn("Supabase send message notice:", err);
  }
}

export async function purgeSundayHistoryFromSupabase(): Promise<number> {
  const sundayCutoff = getLatestSundayMidnight();
  // Clean local
  try {
    const stored = localStorage.getItem("chamo_chat_messages_v1");
    if (stored) {
      const parsed: ChatMessage[] = JSON.parse(stored);
      const filtered = parsed.filter((m) => Number(m.createdAt || 0) >= sundayCutoff);
      localStorage.setItem("chamo_chat_messages_v1", JSON.stringify(filtered));
    }
  } catch {}

  if (!isSupabaseConfigured) return 0;

  try {
    const { error } = await supabase
      .from("chat_messages")
      .delete()
      .lt("created_at", sundayCutoff);
    return error ? 0 : 1;
  } catch {
    return 0;
  }
}

// =========================================================================
// 3. DINERO POR PARTIDA DEL ADMINISTRADOR (Comisión del 20%)
// =========================================================================

export function subscribeToAdminEarnings(
  callback: (earnings: AdminGameEarning[]) => void
): () => void {
  const loadLocal = (): AdminGameEarning[] => {
    try {
      const stored = localStorage.getItem("chamo_admin_dinero_por_partida_v1");
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  };

  callback(loadLocal());

  if (!isSupabaseConfigured) {
    return () => {};
  }

  const fetchEarnings = async () => {
    try {
      const { data, error } = await supabase
        .from("admin_earnings")
        .select("*")
        .order("timestamp", { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        const mapped: AdminGameEarning[] = data.map((d: any) => ({
          id: d.id,
          gameId: d.game_id || d.id,
          gameType: d.game_type === "TORNEO_BILLETAL" ? "TORNEO_BILLETAL" : "JUEGO_NORMAL",
          date: d.date || new Date(d.timestamp).toLocaleDateString("es-VE"),
          timestamp: Number(d.timestamp) || Date.now(),
          grossPot: Number(d.gross_pot) || 0,
          netPlataEnJuego: Number(d.net_plata_en_juego) || 0,
          winnerPrize: Number(d.winner_prize) || 0,
          winnerEmail: d.winner_email || "",
          winnerName: d.winner_name || "Ganador",
          winnerAvatar: d.winner_avatar || "👤",
          adminEarnings20: Number(d.admin_earnings_20) || 0,
          cartonId: Number(d.carton_id) || 1,
          patternName: d.pattern_name || "Línea",
          isDuoWin: Boolean(d.is_duo_win),
          duoPartnerEmail: d.duo_partner_email || undefined,
          duoPartnerName: d.duo_partner_name || undefined,
        }));

        try {
          localStorage.setItem("chamo_admin_dinero_por_partida_v1", JSON.stringify(mapped));
        } catch {}
        callback(mapped);
      }
    } catch (err) {
      console.warn("Supabase fetch earnings notice:", err);
    }
  };

  fetchEarnings();

  const channelName = `realtime-earnings-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  let channel: any = null;
  try {
    channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "admin_earnings" },
        () => {
          fetchEarnings();
        }
      )
      .subscribe();
  } catch (chanErr) {
    console.warn("Notice subscribing to earnings channel:", chanErr);
  }

  const intervalId = setInterval(fetchEarnings, 10000);

  return () => {
    clearInterval(intervalId);
    if (channel) {
      try {
        supabase.removeChannel(channel);
      } catch {}
    }
  };
}

export async function saveAdminEarningToSupabase(
  earning: AdminGameEarning
): Promise<void> {
  try {
    const stored = localStorage.getItem("chamo_admin_dinero_por_partida_v1");
    const current: AdminGameEarning[] = stored ? JSON.parse(stored) : [];
    const updated = [earning, ...current.filter((e) => e.id !== earning.id)];
    localStorage.setItem("chamo_admin_dinero_por_partida_v1", JSON.stringify(updated));
  } catch {}

  if (!isSupabaseConfigured) return;

  try {
    const payload = {
      id: earning.id,
      game_id: earning.gameId,
      game_type: earning.gameType,
      date: earning.date,
      timestamp: earning.timestamp,
      gross_pot: earning.grossPot,
      net_plata_en_juego: earning.netPlataEnJuego,
      winner_prize: earning.winnerPrize,
      winner_email: earning.winnerEmail,
      winner_name: earning.winnerName,
      winner_avatar: earning.winnerAvatar || "👤",
      admin_earnings_20: earning.adminEarnings20,
      carton_id: earning.cartonId,
      pattern_name: earning.patternName,
      is_duo_win: Boolean(earning.isDuoWin),
      duo_partner_email: earning.duoPartnerEmail || null,
      duo_partner_name: earning.duoPartnerName || null,
    };

    await supabase.from("admin_earnings").upsert(payload, { onConflict: "id" });
  } catch (err) {
    console.warn("Supabase save earning notice:", err);
  }
}

// =========================================================================
// 4. NOTIFICACIONES EN VIVO
// =========================================================================

export async function sendNotificationToSupabase(
  notif: AppNotification
): Promise<void> {
  try {
    const stored = localStorage.getItem("chamo_notifications_v1");
    const current: AppNotification[] = stored ? JSON.parse(stored) : [];
    const updated = [notif, ...current.filter((n) => n.id !== notif.id)];
    localStorage.setItem("chamo_notifications_v1", JSON.stringify(updated));
  } catch {}

  if (!isSupabaseConfigured) return;

  try {
    const payload = {
      id: notif.id,
      user_email: notif.recipientEmail.toLowerCase().trim(),
      type: notif.type,
      title: notif.title,
      message: notif.message,
      read: Boolean(notif.read),
      timestamp: notif.createdAt || Date.now(),
      from_email: notif.senderEmail || null,
      from_name: notif.senderName || null,
      from_avatar: notif.senderAvatar || null,
      data: notif.data ? JSON.stringify(notif.data) : null,
    };

    await supabase.from("notifications").upsert(payload, { onConflict: "id" });
  } catch (err) {
    console.warn("Supabase save notification notice:", err);
  }
}

export function subscribeToUserNotifications(
  userEmail: string,
  callback: (notifications: AppNotification[]) => void
): () => void {
  const cleanEmail = userEmail.toLowerCase().trim();

  const loadLocal = (): AppNotification[] => {
    try {
      const stored = localStorage.getItem("chamo_notifications_v1");
      if (stored) {
        const parsed: AppNotification[] = JSON.parse(stored);
        return parsed.filter(
          (n) =>
            n &&
            ((n.recipientEmail && n.recipientEmail.toLowerCase().trim() === cleanEmail) ||
              n.recipientEmail === "ALL")
        );
      }
    } catch {}
    return [];
  };

  callback(loadLocal());

  if (!isSupabaseConfigured) return () => {};

  const fetchNotifs = async () => {
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .or(`user_email.eq.${cleanEmail},user_email.eq.ALL`)
        .order("timestamp", { ascending: false });

      if (!error && Array.isArray(data)) {
        const mapped: AppNotification[] = data.map((d: any) => ({
          id: d.id,
          recipientEmail: d.user_email,
          type: d.type || "INFO",
          title: d.title,
          message: d.message,
          read: Boolean(d.read),
          createdAt: Number(d.timestamp) || Date.now(),
          senderEmail: d.from_email,
          senderName: d.from_name,
          senderAvatar: d.from_avatar,
          data: d.data ? (typeof d.data === "string" ? JSON.parse(d.data) : d.data) : undefined,
        }));
        callback(mapped);
      }
    } catch (err) {
      console.warn("Supabase fetch notifications notice:", err);
    }
  };

  fetchNotifs();

  const channelName = `realtime-notifs-${cleanEmail.replace(/[^a-zA-Z0-9]/g, "_")}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  let channel: any = null;
  try {
    channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications" },
        () => {
          fetchNotifs();
        }
      )
      .subscribe();
  } catch (chanErr) {
    console.warn("Notice subscribing to notifications channel:", chanErr);
  }

  const intervalId = setInterval(fetchNotifs, 8000);

  return () => {
    clearInterval(intervalId);
    if (channel) {
      try {
        supabase.removeChannel(channel);
      } catch {}
    }
  };
}

export async function markNotificationAsReadInSupabase(
  notifId: string
): Promise<void> {
  try {
    const stored = localStorage.getItem("chamo_notifications_v1");
    if (stored) {
      const current: AppNotification[] = JSON.parse(stored);
      const updated = current.map((n) =>
        n.id === notifId ? { ...n, read: true } : n
      );
      localStorage.setItem("chamo_notifications_v1", JSON.stringify(updated));
    }
  } catch {}

  if (!isSupabaseConfigured) return;

  try {
    await supabase.from("notifications").update({ read: true }).eq("id", notifId);
  } catch {}
}

export async function markAllNotificationsAsReadInSupabase(
  userEmail: string
): Promise<void> {
  const cleanEmail = userEmail.toLowerCase().trim();
  try {
    const stored = localStorage.getItem("chamo_notifications_v1");
    if (stored) {
      const current: AppNotification[] = JSON.parse(stored);
      const updated = current.map((n) =>
        n && n.recipientEmail && n.recipientEmail.toLowerCase().trim() === cleanEmail ? { ...n, read: true } : n
      );
      localStorage.setItem("chamo_notifications_v1", JSON.stringify(updated));
    }
  } catch {}

  if (!isSupabaseConfigured) return;

  try {
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_email", cleanEmail);
  } catch {}
}

export async function deleteNotificationFromSupabase(
  notifId: string
): Promise<void> {
  try {
    const stored = localStorage.getItem("chamo_notifications_v1");
    if (stored) {
      const current: AppNotification[] = JSON.parse(stored);
      const updated = current.filter((n) => n.id !== notifId);
      localStorage.setItem("chamo_notifications_v1", JSON.stringify(updated));
    }
  } catch {}

  if (!isSupabaseConfigured) return;

  try {
    await supabase.from("notifications").delete().eq("id", notifId);
  } catch {}
}

// =========================================================================
// 5. SOLICITUDES Y JUEGO
// =========================================================================

export async function saveRechargeRequestToSupabase(
  req: RechargeRequest
): Promise<void> {
  try {
    const stored = localStorage.getItem("chamo_recharges_v1");
    const current: RechargeRequest[] = stored ? JSON.parse(stored) : [];
    const updated = [req, ...current.filter((r) => r.id !== req.id)];
    localStorage.setItem("chamo_recharges_v1", JSON.stringify(updated));
  } catch {}

  if (!isSupabaseConfigured) return;

  try {
    await supabase.from("recharge_requests").upsert({
      id: req.id,
      email: req.email.toLowerCase().trim(),
      monto: Number(req.monto) || 0,
      ref: req.ref,
      bank: req.bank || null,
      estado: req.estado,
      fecha: req.fecha,
      created_at: Date.now(),
    });
  } catch {}
}

export async function saveWithdrawRequestToSupabase(
  req: WithdrawRequest
): Promise<void> {
  try {
    const stored = localStorage.getItem("chamo_withdraws_v1");
    const current: WithdrawRequest[] = stored ? JSON.parse(stored) : [];
    const updated = [req, ...current.filter((w) => w.id !== req.id)];
    localStorage.setItem("chamo_withdraws_v1", JSON.stringify(updated));
  } catch {}

  if (!isSupabaseConfigured) return;

  try {
    await supabase.from("withdraw_requests").upsert({
      id: req.id,
      email: req.email.toLowerCase().trim(),
      user_name: req.userName || req.email.split("@")[0],
      monto: Number(req.monto) || 0,
      datos: req.datos,
      estado: req.estado,
      fecha: req.fecha,
      created_at: Date.now(),
    });
  } catch {}
}

export async function savePurchasedCartonsToSupabase(
  cardIds: number[]
): Promise<void> {
  try {
    localStorage.setItem("chamo_purchased_cartons_v1", JSON.stringify(cardIds));
  } catch {}
}

export async function saveWonGameToSupabase(game: WonGameRecord): Promise<void> {
  try {
    const stored = localStorage.getItem("chamo_won_games_v1");
    const current: WonGameRecord[] = stored ? JSON.parse(stored) : [];
    const updated = [game, ...current.filter((g) => g.id !== game.id)];
    localStorage.setItem("chamo_won_games_v1", JSON.stringify(updated.slice(0, 50)));
  } catch {}
}

export async function saveHistoryRecordToSupabase(rec: HistoryRecord): Promise<void> {
  try {
    const stored = localStorage.getItem("chamo_history_v1");
    const current: HistoryRecord[] = stored ? JSON.parse(stored) : [];
    const updated = [rec, ...current.filter((h) => h.id !== rec.id)];
    localStorage.setItem("chamo_history_v1", JSON.stringify(updated.slice(0, 50)));
  } catch {}
}

export async function broadcastWinnerToSupabase(announcement: WinnerAnnouncement): Promise<void> {
  try {
    localStorage.setItem("chamo_winner_announcement_v1", JSON.stringify(announcement));
  } catch {}
}

export async function clearWinnerInSupabase(): Promise<void> {
  try {
    localStorage.removeItem("chamo_winner_announcement_v1");
  } catch {}
}
