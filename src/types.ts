export type UserRole = "PLAYER" | "ADMIN";

export interface UserProfile {
  email: string;
  name?: string;
  role: UserRole;
  balance: number | null; // null for ADMIN, strictly 0.00 initially for PLAYER
  avatar?: string;
  gender?: "MALE" | "FEMALE";
  pagoMovilPhone?: string; // Teléfono registrado de Pago Móvil (ej: 04121234567)
  pagoMovilBank?: string; // Banco asociado de Pago Móvil (ej: Banesco 0134)
  pagoMovilId?: string; // Cédula de Identidad de Pago Móvil (ej: V-12345678)
  isBanned?: boolean; // Si el administrador ha suspendido / baneado esta cuenta
  bannedReason?: string; // Motivo de la suspensión
  bannedAt?: string; // Fecha en que se aplicó el baneo
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
  category: "GLOBAL" | "REGIONAL" | "COMPETIDOR" | "ASPIRANTE"; // >=20 GLOBAL, 10-19 REGIONAL, 1-9 COMPETIDOR, 0 ASPIRANTE
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
  userName?: string;
  titular?: string;
  refRetiro?: string;
  monto: number;
  datos?: string;
  bank?: string;
  phone?: string;
  cedula?: string;
  estado: "PENDIENTE" | "APROBADO" | "RECHAZADO";
  fecha: string;
  notes?: string;
  saldoRestado?: boolean;
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
  userName?: string;
  userEmail?: string;
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

export interface RegisteredUser {
  id: string;
  name: string;
  email: string;
  balance: number;
  gender: "MALE" | "FEMALE";
  pagoMovilPhone?: string; // Número de teléfono de Pago Móvil
  pagoMovilBank?: string; // Banco asociado de Pago Móvil
  pagoMovilId?: string; // Cédula de Identidad de Pago Móvil
  isBanned?: boolean; // Estado de baneo
  bannedReason?: string; // Motivo del baneo
  bannedAt?: string; // Fecha de baneo
  registeredAt: string;
  avatar?: string;
  lastActiveAt?: string | number;
  isOnline?: boolean;
  status?: string;
  stats?: {
    cartones: number;
    bingos: number;
    victorias: number;
  };
}

export interface ChatMessage {
  id: string;
  senderEmail: string;
  senderName: string;
  senderAvatar?: string;
  role?: UserRole;
  text: string;
  timestamp: string | number;
  createdAt?: number;
  badge?: string;
}

export interface WinningPattern {
  id: string;
  name: string;
  description: string;
  grid: number[][]; // 5x5 binary matrix where 1 is required
  category?: "Cuadros" | "Cruces" | "Líneas" | "Especiales";
  badge?: string;
  details?: string;
  variationsCount?: number;
  alternateGrids?: { title: string; grid: number[][] }[];
}

export type MissedWinRule = "WARNING_ALLOW" | "STRICT_FORFEIT";

export interface ToastMessage {
  id: string;
  type: "ball" | "bingo_claim" | "game_won" | "missed_win" | "info" | "warning";
  title: string;
  message: string;
  ballNumber?: number;
  ballLetter?: string;
  playerName?: string;
  duration?: number;
  timestamp: number;
}

export interface WonGameRecord {
  id: string;
  gameId: string;
  winnerName: string;
  winnerEmail: string;
  winnerAvatar?: string;
  cartonId: number;
  patternName: string;
  winningBall: number;
  winningBallLetter: string;
  missedBalls: number;
  wonAt: string;
  timestamp: number;
  prizeAmountVES: number;
  plataEnJuego?: number;
  status: "PENDING_AMOUNT" | "PAID" | "REJECTED";
  adminPaymentRef?: string;
  paidAt?: string;
  adminNotes?: string;
  isDuoWin?: boolean;
  duoPartnerEmail?: string;
  duoPartnerName?: string;
  duoPartnerAvatar?: string;
  winnerPrizeVES?: number;
  duoPartnerPrizeVES?: number;
}

export interface WinnerAnnouncement {
  id: string;
  gameId?: string;
  winnerName: string;
  winnerEmail: string;
  avatar?: string;
  winnerAvatar?: string;
  cartonId: number;
  patternName: string;
  winningBall: number;
  winningBallLetter: string;
  prizeAmount: number;
  plataEnJuego?: number;
  prizeStatus?: "PENDING_AMOUNT" | "PAID" | "REJECTED";
  paymentRef?: string;
  missedBalls: number; // 0 if claimed on exact ball, > 0 if missed balls
  claimedAt: string;
  isSelf: boolean;
  isDuoWin?: boolean;
  duoPartnerEmail?: string;
  duoPartnerName?: string;
  duoPartnerAvatar?: string;
  winnerPrizeVES?: number;
  duoPartnerPrizeVES?: number;
  isSelfPartner?: boolean;
}

export interface DuoTeam {
  id: string;
  player1Email: string;
  player1Name: string;
  player1Avatar?: string;
  player2Email: string;
  player2Name: string;
  player2Avatar?: string;
  createdAt: number;
  status: "ACTIVE";
}

export interface DuoInvitation {
  id: string;
  fromEmail: string;
  fromName: string;
  fromAvatar?: string;
  toEmail: string;
  toName: string;
  status?: "PENDING" | "ACCEPTED" | "DECLINED";
  timestamp: number;
}

export type NotificationType = "INVITATION" | "PAYMENT" | "FRIEND_REQUEST" | "SYSTEM";

export interface AppNotification {
  id: string;
  recipientEmail: string;
  senderEmail?: string;
  senderName?: string;
  senderAvatar?: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: number;
  read: boolean;
  data?: {
    inviteId?: string;
    gameId?: string;
    amount?: number;
    transactionId?: string;
    ref?: string;
    friendEmail?: string;
    friendName?: string;
    friendAvatar?: string;
    status?: "PENDING" | "ACCEPTED" | "REJECTED";
  };
}

export interface TorneoBilletalConfig {
  isEnabled: boolean; // Si el administrador lo tiene habilitado o deshabilitado
  title: string;
  prizeVES: number; // Pozo acumulado o premio mayor en VES
  entryFeeVES: number; // Costo de entrada / inscripción
  scheduledTime: string; // ej: "Hoy 8:00 PM (Hora de Venezuela)"
  rulesDescription: string;
  minPlayers: number;
  maxPlayers: number;
  registeredCount: number;
  registeredUsers?: string[]; // lista de emails inscritos
  lastUpdated?: number;
  adminNote?: string;
}

export interface AdminGameEarning {
  id: string;
  gameId: string;
  gameType: "JUEGO_NORMAL" | "TORNEO_BILLETAL";
  date: string;
  timestamp: number;
  grossPot: number; // e.g. 1000 VES total
  netPlataEnJuego: number; // e.g. 800 VES (80% prize shown to players)
  winnerPrize: number; // e.g. 800 VES accredited to winner
  winnerEmail: string;
  winnerName: string;
  winnerAvatar?: string;
  adminEarnings20: number; // e.g. 200 VES (20% for admin "Dinero por Partida")
  cartonId?: number;
  patternName?: string;
  isDuoWin?: boolean;
  duoPartnerEmail?: string;
  duoPartnerName?: string;
}
