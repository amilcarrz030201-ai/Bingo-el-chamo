import { RegisteredUser } from "../types";

/**
 * Known mock bot accounts to purge completely across all app storage and views.
 * Only genuine real registered users are permitted to appear in the app.
 */
export const KNOWN_BOT_EMAILS = new Set([
  "carlos.martinez.bingo@gmail.com",
  "mariana.gomez.ccs@gmail.com",
  "jose.maracay@gmail.com",
  "andrea.valentina.bingo@gmail.com",
  "daniel.rojas.bingo@gmail.com",
  "elena.torres.bingo@gmail.com",
  "roberto.sanchez.bingo@gmail.com",
  "gabriela.mendoza.bingo@gmail.com",
  "laninita.bingo@gmail.com",
  "carlos.elchamo@gmail.com",
  "mariagomez.ccs@gmail.com",
  "jose.francisco.maracay@gmail.com",
  "andreavalentina.bingo@gmail.com",
  "jugador.chamo@gmail.com",
  "carlos.soloq@gmail.com",
  "mariana.perez@gmail.com",
]);

export function isBotAccount(email?: string, id?: string): boolean {
  if (!email) return false;
  const cleanEmail = email.toLowerCase().trim();
  if (KNOWN_BOT_EMAILS.has(cleanEmail)) return true;
  if (id && /^reg-(carlos|mariana|jose|andrea|daniel|elena|roberto|gabriela)/.test(id)) return true;
  return false;
}

/**
 * Real registered community user accounts.
 * ZERO BOTS: All mock users have been permanently removed.
 * Real users who register in the app appear dynamically here and via Firestore.
 */
export const DEFAULT_COMMUNITY_USERS: RegisteredUser[] = [
  {
    id: "reg-amilcar-official",
    name: "Amilcar (El Chamo)",
    email: "amilcarrz030201@gmail.com",
    balance: 350.0,
    gender: "MALE",
    pagoMovilPhone: "04120000000",
    pagoMovilBank: "Banco de Venezuela (0102)",
    pagoMovilId: "V-29000000",
    registeredAt: "01 Nov 2026",
    avatar: "🤠",
    lastActiveAt: Date.now(),
    isOnline: true,
    stats: {
      cartones: 12,
      bingos: 3,
      victorias: 3,
    },
  },
];

/**
 * Loads and merges all real accounts ensuring every genuine active player is accounted for,
 * purging any legacy mock bot entries from localStorage.
 */
export function getMergedCommunityUsers(): RegisteredUser[] {
  const map = new Map<string, RegisteredUser>();

  // 1. Base real accounts
  DEFAULT_COMMUNITY_USERS.forEach((user) => {
    map.set(user.email.toLowerCase().trim(), { ...user });
  });

  // 2. Saved in localStorage (purging bots)
  try {
    const raw = localStorage.getItem("chamo_registered_users_v2");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        parsed.forEach((u) => {
          if (u && u.email && !isBotAccount(u.email, u.id)) {
            const key = u.email.toLowerCase().trim();
            const existing = map.get(key);
            map.set(key, {
              ...existing,
              ...u,
              id: u.id || existing?.id || `user-${key}`,
            });
          }
        });
      }
    }
  } catch {}

  // 3. Sync individual ban records
  const result: RegisteredUser[] = [];
  map.forEach((player) => {
    const cleanEmail = player.email.toLowerCase().trim();

    // Do not ban the admin
    if (
      cleanEmail === "amilcarrz030201@gmail.com" ||
      cleanEmail === "admin@bingoelchamo.com" ||
      (player as any).role === "ADMIN"
    ) {
      return;
    }

    let isBanned = player.isBanned ?? false;
    let bannedReason = player.bannedReason;
    let bannedAt = player.bannedAt;

    try {
      const banData = localStorage.getItem(`chamo_banned_${cleanEmail}`);
      if (banData) {
        const parsed = JSON.parse(banData);
        if (parsed.isBanned) {
          isBanned = true;
          bannedReason = parsed.bannedReason || bannedReason;
          bannedAt = parsed.bannedAt || bannedAt;
        }
      }
    } catch {}

    result.push({
      ...player,
      isBanned,
      bannedReason,
      bannedAt,
    });
  });

  return result;
}
