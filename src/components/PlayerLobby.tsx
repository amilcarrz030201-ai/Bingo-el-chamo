import React, { useState } from "react";
import { UserProfile, BingoCard, HistoryRecord, OnlinePlayer, CharacterModel, RechargeRequest, WithdrawRequest } from "../types";
import { ALL_CHARACTERS } from "../data/characters";
import { MasterBoard } from "./MasterBoard";
import { WinningFiguresCard } from "./WinningFiguresCard";
import { CartonView } from "./CartonView";
import { BingoMascot } from "./BingoMascot";
import { SocialPlayersPanel } from "./SocialPlayersPanel";
import { CharacterSelectModal } from "./CharacterSelectModal";
import { TopRankingsModal } from "./TopRankingsModal";
import { TransactionHistoryCard } from "./TransactionHistoryCard";
import {
  Wallet,
  Ticket,
  PlusCircle,
  ArrowDownRight,
  Music2,
  BarChart3,
  HelpCircle,
  LogOut,
  Sparkles,
  BellRing,
  Users,
  Grid,
  ArrowLeft,
  Receipt,
  ShoppingCart,
  Trophy,
  Shirt,
} from "lucide-react";

interface Props {
  user: UserProfile;
  activeCarton: BingoCard;
  purchasedCardIds: number[];
  drawnBalls: number[];
  history: HistoryRecord[];
  allCards: BingoCard[];
  roomCountdown: string;
  onlinePlayers: OnlinePlayer[];
  friendEmails: string[];
  rechargeRequests?: RechargeRequest[];
  withdrawRequests?: WithdrawRequest[];
  onToggleCell: (row: number, col: number) => void;
  onAutoDaub: () => void;
  onCheckBingo: () => void;
  onBuyCarton: (cartonId: number) => void;
  onSelectCartonId: (id: number) => void;
  onOpenRecharge: () => void;
  onOpenWithdraw: () => void;
  onOpenMyCartons: () => void;
  onOpenMusic: () => void;
  onOpenStats: () => void;
  onOpenHelp: () => void;
  onLogout: () => void;
  onAddFriend: (email: string) => void;
  onRemoveFriend: (email: string) => void;
  onSelectCharacter?: (id: string) => void;
  onBuyCharacter?: (char: CharacterModel) => void;
  onUnlockByWins?: (char: CharacterModel) => void;
}

export const PlayerLobby: React.FC<Props> = ({
  user,
  activeCarton,
  purchasedCardIds,
  drawnBalls,
  history,
  allCards,
  roomCountdown,
  onlinePlayers,
  friendEmails,
  rechargeRequests = [],
  withdrawRequests = [],
  onToggleCell,
  onAutoDaub,
  onCheckBingo,
  onBuyCarton,
  onSelectCartonId,
  onOpenRecharge,
  onOpenWithdraw,
  onOpenMyCartons,
  onOpenMusic,
  onOpenStats,
  onOpenHelp,
  onLogout,
  onAddFriend,
  onRemoveFriend,
  onSelectCharacter,
  onBuyCharacter,
  onUnlockByWins,
}) => {
  const [viewMode, setViewMode] = useState<"lobby" | "table">("lobby");
  const [quickCartonPick, setQuickCartonPick] = useState<number>(activeCarton.id);
  const [characterSelectOpen, setCharacterSelectOpen] = useState(false);
  const [topRankingsOpen, setTopRankingsOpen] = useState(false);

  const isPurchased = purchasedCardIds.includes(activeCarton.id);
  const userBalance = user.balance ?? 0.0;
  const userWins = user.stats?.victorias ?? user.stats?.bingos ?? 0;

  // Active character resolution
  const defaultCharId = user.gender === "FEMALE" ? "chama-glam" : "chamo-urbano";
  const activeCharId = user.selectedCharacterId || defaultCharId;
  const activeCharacter = ALL_CHARACTERS.find((c) => c.id === activeCharId) || ALL_CHARACTERS[0];
  const unlockedCharIds = user.unlockedCharacterIds || ["chamo-urbano", "chama-glam"];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-red-950/40 text-slate-100">
      {/* Top Navigation Bar */}
      <header className="bg-slate-900/95 border-b border-amber-500/30 sticky top-0 z-30 backdrop-blur-md px-4 py-3 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Brand & Player Identity */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-yellow-400 to-amber-600 flex items-center justify-center font-black text-slate-950 text-xl shadow-lg border-2 border-amber-300 overflow-hidden">
              {user.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                "👤"
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-fredoka text-base sm:text-lg font-bold text-yellow-300">
                  Bingo el Chamo
                </h1>
                <span className="text-[10px] bg-emerald-700 text-emerald-100 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-sans border border-emerald-500/50">
                  Sala de Juego
                </span>
              </div>
              <p className="text-xs text-slate-300 flex items-center gap-1.5 truncate max-w-[220px] font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {user.email}
              </p>
            </div>
          </div>

          {/* View Switcher: Lobby Principal vs Mesa de Cartones */}
          <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 shadow-inner">
            <button
              onClick={() => setViewMode("lobby")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-fredoka font-bold flex items-center gap-1.5 transition cursor-pointer ${
                viewMode === "lobby"
                  ? "bg-amber-500 text-slate-950 shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Users size={14} /> Lobby Principal
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-fredoka font-bold flex items-center gap-1.5 transition cursor-pointer ${
                viewMode === "table"
                  ? "bg-gradient-to-r from-red-600 to-amber-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Grid size={14} /> Mesa de Juego
              {purchasedCardIds.length > 0 && (
                <span className="ml-1 bg-yellow-400 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                  {purchasedCardIds.length}
                </span>
              )}
            </button>
          </div>

          {/* Financial & Action Controls */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {/* Balance Badge - strictly 0.00 VES initially */}
            <div className="bg-slate-950 border border-amber-500/40 rounded-2xl px-3 py-1.5 flex items-center gap-2 shadow">
              <Wallet size={15} className="text-amber-400" />
              <div className="flex flex-col text-left">
                <span className="text-[9px] uppercase font-bold text-slate-400">Saldo Disponible</span>
                <span className="font-fredoka text-xs font-bold text-yellow-300 font-mono">
                  {userBalance.toFixed(2)} VES
                </span>
              </div>
            </div>

            {/* Recargar Pago Móvil Button */}
            <button
              onClick={onOpenRecharge}
              className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-fredoka font-bold px-3 py-2 rounded-xl shadow flex items-center gap-1.5 transition cursor-pointer"
              title="Recarga tu saldo vía Pago Móvil con ID de transacción"
            >
              <PlusCircle size={14} /> Recargar Pago Móvil
            </button>

            {/* Retirar Button */}
            <button
              onClick={onOpenWithdraw}
              className="bg-blue-800/80 hover:bg-blue-700 text-white text-xs font-fredoka font-bold px-3 py-2 rounded-xl shadow border border-blue-700/60 flex items-center gap-1.5 transition cursor-pointer"
              title="Retirar saldo acumulado"
            >
              <ArrowDownRight size={14} /> Retirar
            </button>

            {/* Cartones Comprados */}
            <button
              onClick={onOpenMyCartons}
              className="bg-purple-900/70 hover:bg-purple-800 text-purple-200 text-xs font-fredoka font-bold px-3 py-2 rounded-xl shadow border border-purple-700/60 flex items-center gap-1.5 transition cursor-pointer"
            >
              <Ticket size={14} /> Cartones ({purchasedCardIds.length})
            </button>

            {/* Tops de la Semana Button (Globales, Regionales, Futuros) */}
            <button
              onClick={() => setTopRankingsOpen(true)}
              className="bg-amber-500/20 hover:bg-amber-500/30 text-yellow-300 text-xs font-fredoka font-bold px-3 py-2 rounded-xl border border-amber-500/40 flex items-center gap-1.5 transition cursor-pointer shadow"
              title="Tabla de Clasificación Semanal (Tops Globales, Regionales y Futuros)"
            >
              <Trophy size={14} className="text-yellow-400 animate-bounce" />
              <span>Tops</span>
            </button>

            {/* Elegir / Vestidor Muñeco Button */}
            <button
              onClick={() => setCharacterSelectOpen(true)}
              className="bg-slate-900 hover:bg-slate-800 text-yellow-300 text-xs font-fredoka font-bold px-3 py-2 rounded-xl border border-amber-500/40 flex items-center gap-1.5 transition cursor-pointer shadow"
              title="Elige tu muñeco (Varón o Hembra), compra trajes o desbloquéalos por victorias"
            >
              <Shirt size={14} className="text-amber-400" />
              <span>{activeCharacter.gender === "MALE" ? "Muñeco 🧢" : "Muñeca 👗"}</span>
            </button>

            {/* Utility buttons */}
            <button
              onClick={onOpenMusic}
              className="bg-amber-500/20 hover:bg-amber-500/30 text-yellow-300 p-2 rounded-xl border border-amber-500/40 transition cursor-pointer flex items-center gap-1.5"
              title="Reproductor de Músicas (Gaitas, Salsa, Llanera, Casino Lounge, Tambores)"
            >
              <Music2 size={16} className="text-yellow-400" />
              <span className="text-[11px] font-fredoka font-bold hidden sm:inline">Música</span>
            </button>

            <button
              onClick={onOpenStats}
              className="bg-slate-900 hover:bg-slate-800 text-yellow-400 p-2 rounded-xl border border-slate-800 transition"
              title="Estadísticas de Juego"
            >
              <BarChart3 size={16} />
            </button>

            <button
              onClick={onOpenHelp}
              className="bg-slate-900 hover:bg-slate-800 text-slate-300 p-2 rounded-xl border border-slate-800 transition"
              title="Reglas del Juego"
            >
              <HelpCircle size={16} />
            </button>

            <button
              onClick={onLogout}
              className="bg-red-950 hover:bg-red-900 text-red-200 p-2 rounded-xl border border-red-800/80 transition cursor-pointer"
              title="Cerrar Sesión"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
        {viewMode === "lobby" ? (
          /* ==================== LOBBY PRINCIPAL ==================== */
          <div className="flex flex-col gap-6">
            {/* Mascot Greeting Area (Muñequito con Cartón en Mano - Varón o Hembra Animado) */}
            <BingoMascot
              character={activeCharacter}
              userName={user.name || user.email.split("@")[0]}
              cartonesCount={purchasedCardIds.length}
              userBalance={userBalance}
              roomCountdown={roomCountdown}
              onOpenCharacterSelect={() => setCharacterSelectOpen(true)}
              onOpenRecharge={onOpenRecharge}
              onEnterGame={() => setViewMode("table")}
            />

            {/* Middle Section: Quick Carton Buying & Social Players */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Pre-game Carton Shop & Transaction History */}
              <div className="lg:col-span-6 flex flex-col gap-5">
                {/* Buy Cartons Box */}
                <div className="bg-slate-900/90 border border-amber-500/30 rounded-3xl p-5 shadow-2xl flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Ticket size={18} className="text-amber-400" />
                      <h3 className="font-fredoka text-sm sm:text-base font-bold text-yellow-300 uppercase tracking-wide">
                        Adquirir Cartones para la Partida
                      </h3>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2.5 py-1 rounded-xl">
                      60.00 VES / Cartón
                    </span>
                  </div>

                  <p className="text-xs text-slate-300">
                    Elige el número de tu cartón de la suerte (1 al 200). Cada cartón tiene su matriz única oficial de 5x5.
                  </p>

                  <div className="flex items-center gap-2">
                    <select
                      value={quickCartonPick}
                      onChange={(e) => {
                        const id = Number(e.target.value);
                        setQuickCartonPick(id);
                        onSelectCartonId(id);
                      }}
                      className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-amber-300 outline-none focus:border-amber-500 font-fredoka flex-1"
                    >
                      {allCards.map((c) => (
                        <option key={c.id} value={c.id}>
                          Cartón #{c.id} {purchasedCardIds.includes(c.id) ? "★ (Ya Comprado)" : ""}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => onBuyCarton(quickCartonPick)}
                      disabled={purchasedCardIds.includes(quickCartonPick)}
                      className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-fredoka font-black px-4 py-2 rounded-xl text-xs shadow transition active:scale-95 cursor-pointer flex items-center gap-1.5 shrink-0"
                    >
                      <ShoppingCart size={13} />
                      {purchasedCardIds.includes(quickCartonPick) ? "Adquirido" : "Comprar (60 VES)"}
                    </button>
                  </div>

                  {/* Purchased Quick Preview */}
                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Tus cartones activos para jugar:</span>
                      <span className="font-bold text-amber-300 font-mono">
                        {purchasedCardIds.length} comprados
                      </span>
                    </div>

                    {purchasedCardIds.length === 0 ? (
                      <span className="text-[11px] text-slate-500 italic">
                        No tienes cartones aún. Si tu saldo es 0.00 VES, realiza una recarga por Pago Móvil.
                      </span>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {purchasedCardIds.map((id) => (
                          <button
                            key={id}
                            onClick={() => {
                              onSelectCartonId(id);
                              setViewMode("table");
                            }}
                            className="bg-purple-950 hover:bg-purple-900 border border-purple-700/60 text-purple-200 text-xs font-fredoka font-bold px-2.5 py-1 rounded-xl transition cursor-pointer"
                            title="Ir a jugar este cartón"
                          >
                            #{id}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Transaction History with Categories: Historial Transacción, Pagado, Retiro, and status En espera, Aprobado, Rechazado */}
                <TransactionHistoryCard
                  history={history}
                  rechargeRequests={rechargeRequests}
                  withdrawRequests={withdrawRequests}
                  userEmail={user.email}
                />
              </div>

              {/* Right Column: Social Lobby with Players in the Room & Friends System */}
              <div className="lg:col-span-6 flex flex-col gap-5">
                <SocialPlayersPanel
                  currentUserEmail={user.email}
                  onlinePlayers={onlinePlayers}
                  friendEmails={friendEmails}
                  onAddFriend={onAddFriend}
                  onRemoveFriend={onRemoveFriend}
                />
              </div>
            </div>
          </div>
        ) : (
          /* ==================== MESA DE JUEGO / CARTONES ==================== */
          <div className="flex flex-col gap-6">
            {/* Top Bar for Table */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 border border-amber-500/30 rounded-3xl p-4 shadow-xl">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setViewMode("lobby")}
                  className="bg-slate-950 hover:bg-slate-800 text-amber-300 border border-slate-800 px-3 py-2 rounded-xl text-xs font-fredoka font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <ArrowLeft size={14} /> Volver al Lobby
                </button>
                <div>
                  <h2 className="font-fredoka text-base font-bold text-yellow-300">
                    Mesa Oficial de Juego • Cartón #{activeCarton.id}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {isPurchased
                      ? "Cartón activo listo para marcar aciertos."
                      : "Este cartón aún no ha sido comprado (60.00 VES)."}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-yellow-300 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                  Próxima Cantada: {roomCountdown}
                </span>
                <button
                  onClick={() => onSelectCartonId(activeCarton.id === 200 ? 1 : activeCarton.id + 1)}
                  className="bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-fredoka px-2.5 py-1.5 rounded-xl transition"
                >
                  Siguiente Cartón →
                </button>
              </div>
            </div>

            {/* Game Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: 8 Winning Patterns & Masterboard */}
              <div className="lg:col-span-5 flex flex-col gap-5">
                <WinningFiguresCard />
                <MasterBoard drawnBalls={drawnBalls} />
              </div>

              {/* Right Column: Interactive Carton View */}
              <div className="lg:col-span-7 flex flex-col gap-5">
                <CartonView
                  carton={activeCarton}
                  isPurchased={isPurchased}
                  drawnBalls={drawnBalls}
                  userBalance={userBalance}
                  onToggleCell={onToggleCell}
                  onAutoDaub={onAutoDaub}
                  onCheckBingo={onCheckBingo}
                  onBuyCarton={onBuyCarton}
                  onSelectCartonId={onSelectCartonId}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Vestidor & Tienda de Muñecos Modal */}
      <CharacterSelectModal
        isOpen={characterSelectOpen}
        onClose={() => setCharacterSelectOpen(false)}
        selectedCharacterId={activeCharacter.id}
        unlockedCharacterIds={unlockedCharIds}
        userBalance={userBalance}
        userWins={userWins}
        onSelectCharacter={(id) => {
          if (onSelectCharacter) onSelectCharacter(id);
        }}
        onBuyCharacter={(char) => {
          if (onBuyCharacter) onBuyCharacter(char);
        }}
        onUnlockByWins={(char) => {
          if (onUnlockByWins) onUnlockByWins(char);
        }}
      />

      {/* Top Rankings Modal (Globales 1-3, Regionales 4-6, Futuros 7+) */}
      <TopRankingsModal
        isOpen={topRankingsOpen}
        onClose={() => setTopRankingsOpen(false)}
        currentUserEmail={user.email}
      />
    </div>
  );
};
