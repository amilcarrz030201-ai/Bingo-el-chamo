export type UserRole = "PLAYER" | "ADMIN";

export interface UserProfile {
  email: string;
  name?: string;
  role: UserRole;
  balance: number | null; // null for ADMIN, strictly 0.00 initially for PLAYER
  avatar?: string;
  gender?: "MALE" | "FEMALE";
  selectedCharacterId?: string;
  unlockedCharacterIds?: string[];
  friends?: string[]; // email or user IDs
  stats: {
    cartones: number;
    bingos: number;
    victorias?: number;
  };
}

export interface CharacterModel {
  id: string;
  name: string;
  gender: "MALE" | "FEMALE";
  tier: "DEFAULT" | "VIP" | "REGIONAL" | "CHAMPION";
  archetype?: "millionaire" | "military" | "doctor" | "champion" | "vip" | "urban" | "glam";
  price: number; // in VES, 0 for default
  requiredWins?: number; // can be unlocked by winning N bingos
  description: string;
  outfitColor: string;
  skinTone: string;
  hairColor: string;
  specialBadge?: string;
}

export interface TopPlayer {
  rank: number;
  category: "GLOBAL" | "REGIONAL" | "FUTURO"; // 1-3 GLOBAL, 4-6 REGIONAL, 7+ FUTURO
  name: string;
  email: string;
  weeklyEarnings: number; // in VES
  weeklyWins: number;
  region: string;
  avatar: string;
  characterId: string;
}

export interface BingoCell {
  num: number | "FREE";
  marcado: boolean;
}

export interface BingoCard {
  id: number;
  numeros: BingoCell[][];
}

export interface RechargeRequest {
  id: string;
  transactionId: string; // e.g. TRX-REC-84920
  email: string;
  monto: number;
  ref: string;
  bank?: string;
  voucherImage?: string;
  estado: "PENDIENTE" | "APROBADO" | "RECHAZADO";
  fecha: string;
  notes?: string;
}

export interface WithdrawRequest {
  id: string;
  transactionId: string; // e.g. TRX-RET-30918
  email: string;
  monto: number;
  datos?: string;
  bank?: string;
  phone?: string;
  cedula?: string;
  estado: "PENDIENTE" | "APROBADO" | "RECHAZADO";
  fecha: string;
  notes?: string;
}

export interface HistoryRecord {
  id: string;
  transactionId?: string;
  tipo: "COMPRA" | "BINGO" | "RECARGA" | "RETIRO";
  monto?: number;
  estado?: "PENDIENTE" | "APROBADO" | "COMPLETADO" | "RECHAZADO";
  requestId?: string; // Links to recharge/withdrawal request
  detalles: string;
  fecha: string;
}

export interface OnlinePlayer {
  id: string;
  name: string;
  email: string;
  avatar: string;
  isOnline: boolean;
  status: string;
  cartonesCount: number;
  isFriend?: boolean;
}

export interface WinningPattern {
  id: string;
  name: string;
  description: string;
  grid: number[][]; // 5x5 binary matrix where 1 is required
}
