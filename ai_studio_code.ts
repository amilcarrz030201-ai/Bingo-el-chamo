// ======================================================================
// === FILE: .env
// ======================================================================
VITE_SUPABASE_URL=https://ifvbswcynljhggqvwqtr.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_K9RqWARmSB7l2g6UuGto4w_O7ZNnvv7

// ======================================================================
// === FILE: package.json
// ======================================================================
{
  "name": "react-example",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx server.ts",
    "build": "vite build && esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs",
    "start": "node dist/server.cjs",
    "clean": "rm -rf dist server.js",
    "lint": "tsc --noEmit"
  },
  "dependencies": {
    "@google/genai": "^2.4.0",
    "@supabase/supabase-js": "^2.118.0",
    "@tailwindcss/vite": "^4.1.14",
    "@types/three": "^0.186.0",
    "@vitejs/plugin-react": "^5.0.4",
    "canvas-confetti": "^1.9.4",
    "dotenv": "^17.2.3",
    "express": "^4.21.2",
    "lucide-react": "^0.546.0",
    "motion": "^12.23.24",
    "react": "^19.0.1",
    "react-dom": "^19.0.1",
    "recharts": "^3.10.1",
    "three": "^0.186.1",
    "vite": "^6.2.3"
  },
  "devDependencies": {
    "@types/canvas-confetti": "^1.9.0",
    "@types/express": "^4.17.21",
    "@types/node": "^22.14.0",
    "autoprefixer": "^10.4.21",
    "esbuild": "^0.25.0",
    "tailwindcss": "^4.1.14",
    "tsx": "^4.21.0",
    "typescript": "~5.8.2",
    "vite": "^6.2.3"
  }
}

// ======================================================================
// === FILE: src/main.tsx
// ======================================================================
import React, { StrictMode, Component, ReactNode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("ErrorBoundary caught an error:", error);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl">
            <div className="text-4xl mb-3">🤠</div>
            <h1 className="font-fredoka text-xl font-bold text-amber-300 mb-2">
              Bingo el Chamo
            </h1>
            <p className="text-sm text-slate-300 mb-6">
              Hubo una pequeña interrupción al cargar. Pulsa el botón abajo para reiniciar rápidamente la aplicación.
            </p>
            <button
              onClick={this.handleReload}
              className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-950 font-fredoka font-bold py-3 px-6 rounded-2xl shadow-lg transition active:scale-95 cursor-pointer"
            >
              Reiniciar Bingo
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);

// ======================================================================
// === FILE: src/types.ts
// ======================================================================
export type UserRole = "PLAYER" | "ADMIN";

export interface UserStats {
  cartones: number;
  bingos: number;
  victorias?: number;
}

export interface UserProfile {
  id?: string;
  email: string;
  name: string;
  role: UserRole;
  balance: number;
  avatar: string;
  gender: "MALE" | "FEMALE";
  pagoMovilPhone?: string;
  pagoMovilBank?: string;
  pagoMovilId?: string;
  stats?: UserStats;
  isBanned?: boolean;
  bannedReason?: string;
  bannedAt?: number;
}

export interface RegisteredUser {
  id: string;
  name: string;
  email: string;
  balance?: number;
  gender: "MALE" | "FEMALE";
  avatar: string;
  registeredAt: string;
  lastActiveAt?: number;
  isOnline?: boolean;
  isBanned?: boolean;
  bannedReason?: string;
  pagoMovilPhone?: string;
  pagoMovilBank?: string;
  pagoMovilId?: string;
  stats?: UserStats;
}

export interface ChatMessage {
  id: string;
  senderEmail: string;
  senderName: string;
  senderAvatar?: string;
  role: UserRole;
  text: string;
  timestamp: string;
  createdAt: number;
  badge?: string;
}

export interface AdminGameEarning {
  id: string;
  gameId: string;
  gameType: "JUEGO_NORMAL" | "TORNEO";
  date: string;
  timestamp: number;
  grossPot: number;
  netPlataEnJuego: number; // 80% visible a jugadores
  winnerPrize: number;
  winnerEmail: string;
  winnerName: string;
  winnerAvatar?: string;
  adminEarnings20: number; // 20% retenido para el admin
  cartonId?: number;
  patternName?: string;
  isDuoWin?: boolean;
  duoPartnerEmail?: string;
  duoPartnerName?: string;
}

export interface AppNotification {
  id: string;
  recipientEmail: string;
  senderEmail?: string;
  senderName?: string;
  senderAvatar?: string;
  type: "INVITATION" | "PAYMENT" | "FRIEND_REQUEST" | "SYSTEM";
  title: string;
  message: string;
  createdAt: number;
  read: boolean;
  data?: Record<string, any>;
}

// ======================================================================
// === FILE: src/supabase.ts (Conexión Exclusiva Supabase y Realtime)
// ======================================================================
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

function initSupabase(): SupabaseClient {
  try {
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true },
      realtime: { params: { eventsPerSecond: 10 } },
    });
  } catch (err) {
    console.warn("Fallback client Supabase:", err);
    return createClient("https://ifvbswcynljhggqvwqtr.supabase.co", "sb_publishable_K9RqWARmSB7l2g6UuGto4w_O7ZNnvv7", {
      auth: { persistSession: false },
    });
  }
}

export const supabase: SupabaseClient = initSupabase();

export function subscribeToUsers(callback: (users: RegisteredUser[]) => void): () => void {
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
    return DEFAULT_COMMUNITY_USERS.filter((u) => !isBotAccount(u.email, u.id));
  };

  callback(loadLocal());

  const fetchUsers = async () => {
    if (!isSupabaseConfigured) return;
    try {
      const { data, error } = await supabase.from("users").select("*");
      if (!error && Array.isArray(data) && data.length > 0) {
        const clean = data.map((d: any) => ({
          id: d.id || d.email,
          name: d.name,
          email: d.email,
          balance: Number(d.balance) || 0,
          gender: d.gender || "MALE",
          avatar: d.avatar || "👤",
          registeredAt: d.registered_at || new Date().toISOString(),
          isOnline: d.is_online !== false,
          isBanned: Boolean(d.is_banned),
          bannedReason: d.banned_reason,
          pagoMovilPhone: d.pago_movil_phone,
          pagoMovilBank: d.pago_movil_bank,
          pagoMovilId: d.pago_movil_id,
          stats: {
            cartones: Number(d.stats_cartones) || 0,
            bingos: Number(d.stats_bingos) || 0,
            victorias: Number(d.stats_victorias) || Number(d.stats_bingos) || 0,
          },
        })).filter((u) => !isBotAccount(u.email, u.id));
        if (clean.length > 0) callback(clean);
      }
    } catch (err) {
      console.warn("Supabase fetch users notice:", err);
    }
  };

  fetchUsers();

  const channelName = `realtime-users-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  let channel: any = null;
  try {
    channel = supabase
      .channel(channelName)
      .on("postgres_changes", { event: "*", schema: "public", table: "users" }, () => {
        fetchUsers();
      })
      .subscribe();
  } catch {}

  const intervalId = setInterval(fetchUsers, 10000);

  return () => {
    clearInterval(intervalId);
    if (channel) {
      try { supabase.removeChannel(channel); } catch {}
    }
  };
}

export function subscribeToChatMessages(callback: (messages: ChatMessage[]) => void): () => void {
  const fetchMessages = async () => {
    if (!isSupabaseConfigured) return;
    try {
      const cutoff = getLatestSundayMidnight();
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .gte("created_at", cutoff)
        .order("created_at", { ascending: true });

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
        callback(mapped);
      }
    } catch {}
  };

  fetchMessages();

  const channelName = `realtime-chat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  let channel: any = null;
  try {
    channel = supabase
      .channel(channelName)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, () => {
        fetchMessages();
      })
      .subscribe();
  } catch {}

  const intervalId = setInterval(fetchMessages, 6000);

  return () => {
    clearInterval(intervalId);
    if (channel) {
      try { supabase.removeChannel(channel); } catch {}
    }
  };
}

export function subscribeToAdminEarnings(callback: (earnings: AdminGameEarning[]) => void): () => void {
  const fetchEarnings = async () => {
    if (!isSupabaseConfigured) return;
    try {
      const { data, error } = await supabase
        .from("admin_earnings")
        .select("*")
        .order("timestamp", { ascending: false });

      if (!error && Array.isArray(data)) {
        const mapped: AdminGameEarning[] = data.map((d: any) => ({
          id: d.id,
          gameId: d.game_id,
          gameType: d.game_type || "JUEGO_NORMAL",
          date: d.date,
          timestamp: Number(d.timestamp) || Date.now(),
          grossPot: Number(d.gross_pot) || 0,
          netPlataEnJuego: Number(d.net_plata_en_juego) || 0,
          winnerPrize: Number(d.winner_prize) || 0,
          winnerEmail: d.winner_email,
          winnerName: d.winner_name,
          winnerAvatar: d.winner_avatar,
          adminEarnings20: Number(d.admin_earnings_20) || 0,
          cartonId: d.carton_id,
          patternName: d.pattern_name,
        }));
        callback(mapped);
      }
    } catch {}
  };

  fetchEarnings();

  const channelName = `realtime-earnings-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  let channel: any = null;
  try {
    channel = supabase
      .channel(channelName)
      .on("postgres_changes", { event: "*", schema: "public", table: "admin_earnings" }, () => {
        fetchEarnings();
      })
      .subscribe();
  } catch {}

  const intervalId = setInterval(fetchEarnings, 10000);

  return () => {
    clearInterval(intervalId);
    if (channel) {
      try { supabase.removeChannel(channel); } catch {}
    }
  };
}