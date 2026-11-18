import React, { useState, useMemo } from "react";
import {
  HistoryRecord,
  RechargeRequest,
  WithdrawRequest,
  RegisteredUser,
  WonGameRecord,
} from "../types";
import {
  History,
  Filter,
  Search,
  Calendar,
  X,
  ArrowDownRight,
  PlusCircle,
  Ticket,
  Trophy,
  CheckCircle2,
  Clock,
  XCircle,
  RotateCcw,
  Copy,
  Check,
  Coins,
  TrendingUp,
  TrendingDown,
  User,
  ShieldCheck,
  Maximize2,
  Minimize2,
  Table as TableIcon,
  LayoutGrid,
  Users,
  Eye,
  FileText,
  ChevronRight,
  ChevronDown,
  BarChart3,
} from "lucide-react";
import { AdminFinancialTrendsChart } from "./AdminFinancialTrendsChart";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryRecord[];
  rechargeRequests?: RechargeRequest[];
  withdrawRequests?: WithdrawRequest[];
  registeredUsers?: RegisteredUser[];
  wonGamesHistory?: WonGameRecord[];
}

export type TransactionTypeFilter = "TODOS" | "COMPRA" | "RETIRO" | "BINGO" | "RECARGA";
export type TransactionStatusFilter = "TODOS" | "APROBADO" | "PENDIENTE" | "RECHAZADO";
export type ViewLayoutMode = "TABLA" | "JUGADOR" | "TARJETAS" | "TENDENCIAS";

interface UnifiedTransactionItem extends HistoryRecord {
  resolvedStatus: "APROBADO" | "PENDIENTE" | "RECHAZADO" | "COMPLETADO";
  resolvedUserEmail: string;
  resolvedUserName: string;
  resolvedUserAvatar?: string;
  dateObj: Date;
  voucherImage?: string;
  bankName?: string;
  refNumber?: string;
}

export const AdminTransactionHistoryModal: React.FC<Props> = ({
  isOpen,
  onClose,
  history = [],
  rechargeRequests = [],
  withdrawRequests = [],
  registeredUsers = [],
  wonGamesHistory = [],
}) => {
  // Maximize / Fullscreen state
  const [isMaximized, setIsMaximized] = useState(false);
  // View Layout Mode: TABLA (Master Table), JUGADOR (Player Ledger), TARJETAS (Cards)
  const [viewMode, setViewMode] = useState<ViewLayoutMode>("TABLA");
  
  // Filter states
  const [selectedType, setSelectedType] = useState<TransactionTypeFilter>("TODOS");
  const [selectedStatus, setSelectedStatus] = useState<TransactionStatusFilter>("TODOS");
  const [userQuery, setUserQuery] = useState("");
  const [dateFilter, setDateFilter] = useState(""); // YYYY-MM-DD
  const [datePreset, setDatePreset] = useState<"ALL" | "TODAY" | "7DAYS" | "MONTH">("ALL");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Selected Player for "Por Jugador" mode
  const [selectedPlayerEmail, setSelectedPlayerEmail] = useState<string | null>(null);

  // Inspector Modal for full single transaction details
  const [inspectedTransaction, setInspectedTransaction] = useState<UnifiedTransactionItem | null>(null);
  const [inspectedVoucherModal, setInspectedVoucherModal] = useState<string | null>(null);

  // Quick user map for name, avatar & balance lookups
  const userMap = useMemo(() => {
    const map = new Map<string, RegisteredUser>();
    registeredUsers.forEach((u) => {
      if (u.email) {
        map.set(u.email.toLowerCase().trim(), u);
      }
    });
    return map;
  }, [registeredUsers]);

  // Combine and harmonize all financial transactions across the platform
  const allUnifiedTransactions = useMemo(() => {
    const records: UnifiedTransactionItem[] = [];

    const rechargeMap = new Map<string, RechargeRequest>();
    rechargeRequests.forEach((r) => {
      if (r.id) rechargeMap.set(r.id, r);
      if (r.transactionId) rechargeMap.set(r.transactionId, r);
    });

    const withdrawMap = new Map<string, WithdrawRequest>();
    withdrawRequests.forEach((w) => {
      if (w.id) withdrawMap.set(w.id, w);
      if (w.transactionId) withdrawMap.set(w.transactionId, w);
    });

    // 1. Process items from `history`
    history.forEach((item) => {
      let email = (item.userEmail || "").toLowerCase().trim();
      let name = item.userName || "";
      let voucherImage: string | undefined = undefined;
      let bankName: string | undefined = undefined;
      let refNumber: string | undefined = undefined;

      // Try to resolve user from map or details if missing
      if (!email && item.detalles) {
        for (const [e, u] of userMap.entries()) {
          if (
            item.detalles.toLowerCase().includes(e) ||
            (u.name && item.detalles.toLowerCase().includes(u.name.toLowerCase()))
          ) {
            email = e;
            name = u.name;
            break;
          }
        }
      }

      const matchedUser = email ? userMap.get(email) : undefined;
      if (matchedUser) {
        name = matchedUser.name || name;
      }
      if (!name && email) {
        name = email.split("@")[0];
      }
      if (!name) {
        name = item.tipo === "BINGO" ? "Ganador Bingo" : "Jugador";
      }

      // Resolve status
      let resolvedStatus: "APROBADO" | "PENDIENTE" | "RECHAZADO" | "COMPLETADO" =
        item.estado || "COMPLETADO";

      if (item.tipo === "RECARGA") {
        const req = (item.requestId && rechargeMap.get(item.requestId)) ||
          (item.transactionId && rechargeMap.get(item.transactionId));
        if (req) {
          resolvedStatus = req.estado;
          if (req.email) email = req.email.toLowerCase().trim();
          voucherImage = req.voucherImage;
          bankName = req.bank;
          refNumber = req.ref;
        }
      } else if (item.tipo === "RETIRO") {
        const req = (item.requestId && withdrawMap.get(item.requestId)) ||
          (item.transactionId && withdrawMap.get(item.transactionId));
        if (req) {
          resolvedStatus = req.estado;
          if (req.email) email = req.email.toLowerCase().trim();
          const fallbackName = req.userName || req.titular;
          if (fallbackName && !name) name = fallbackName;
          bankName = req.bank;
          refNumber = req.refRetiro || req.transactionId;
        }
      }

      // Safe date parse
      let dateObj = new Date(item.fecha);
      if (isNaN(dateObj.getTime())) {
        dateObj = new Date();
      }

      records.push({
        ...item,
        resolvedStatus,
        resolvedUserEmail: email,
        resolvedUserName: name,
        resolvedUserAvatar: matchedUser?.avatar,
        dateObj,
        voucherImage,
        bankName,
        refNumber,
      });
    });

    // 2. Ensure rechargeRequests are included if not already in history
    rechargeRequests.forEach((req) => {
      const exists = records.some(
        (r) => r.requestId === req.id || (req.transactionId && r.transactionId === req.transactionId)
      );
      if (!exists) {
        const email = req.email.toLowerCase().trim();
        const user = userMap.get(email);
        let dateObj = new Date(req.fecha);
        if (isNaN(dateObj.getTime())) dateObj = new Date();

        records.push({
          id: `rec-fallback-${req.id}`,
          transactionId: req.transactionId || req.ref,
          tipo: "RECARGA",
          monto: req.montoAprobado ?? req.monto,
          estado: req.estado,
          detalles: `Recarga Pago Móvil Ref: ${req.ref} (${req.bank || "Banco"})`,
          fecha: req.fecha,
          resolvedStatus: req.estado,
          resolvedUserEmail: email,
          resolvedUserName: user?.name || email.split("@")[0],
          resolvedUserAvatar: user?.avatar,
          dateObj,
          voucherImage: req.voucherImage,
          bankName: req.bank,
          refNumber: req.ref,
        });
      }
    });

    // 3. Ensure withdrawRequests are included if not already in history
    withdrawRequests.forEach((req) => {
      const exists = records.some(
        (r) => r.requestId === req.id || (req.transactionId && r.transactionId === req.transactionId)
      );
      if (!exists) {
        const email = req.email.toLowerCase().trim();
        const user = userMap.get(email);
        let dateObj = new Date(req.fecha);
        if (isNaN(dateObj.getTime())) dateObj = new Date();

        const withRef = req.refRetiro || req.transactionId || "Pago Móvil";
        const withName = req.userName || req.titular || user?.name || email.split("@")[0];

        records.push({
          id: `with-fallback-${req.id}`,
          transactionId: req.transactionId || req.refRetiro,
          tipo: "RETIRO",
          monto: req.monto,
          estado: req.estado,
          detalles: `Retiro Pago Móvil Ref: ${withRef} a ${withName} (${req.bank || "Banco"})`,
          fecha: req.fecha,
          resolvedStatus: req.estado,
          resolvedUserEmail: email,
          resolvedUserName: withName,
          resolvedUserAvatar: user?.avatar,
          dateObj,
          bankName: req.bank,
          refNumber: withRef,
        });
      }
    });

    // Sort descending by date (newest first)
    return records.sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());
  }, [history, rechargeRequests, withdrawRequests, userMap]);

  // Distinct list of players who have financial transactions (for "Por Jugador" mode)
  const playersWithTransactions = useMemo(() => {
    const map = new Map<
      string,
      {
        email: string;
        name: string;
        avatar?: string;
        txCount: number;
        totalCompras: number;
        totalBingos: number;
        totalRecargas: number;
        totalRetiros: number;
        balance: number;
      }
    >();

    allUnifiedTransactions.forEach((tx) => {
      const email = tx.resolvedUserEmail || "desconocido@bingo.com";
      if (!map.has(email)) {
        const registered = userMap.get(email);
        map.set(email, {
          email,
          name: tx.resolvedUserName || registered?.name || email.split("@")[0],
          avatar: tx.resolvedUserAvatar || registered?.avatar,
          txCount: 0,
          totalCompras: 0,
          totalBingos: 0,
          totalRecargas: 0,
          totalRetiros: 0,
          balance: registered?.balance ?? 0,
        });
      }

      const p = map.get(email)!;
      p.txCount++;
      const amount = tx.monto || 0;
      if (tx.tipo === "COMPRA") p.totalCompras += amount;
      else if (tx.tipo === "BINGO") p.totalBingos += amount;
      else if (tx.tipo === "RECARGA" && (tx.resolvedStatus === "APROBADO" || tx.resolvedStatus === "COMPLETADO")) {
        p.totalRecargas += amount;
      } else if (tx.tipo === "RETIRO" && (tx.resolvedStatus === "APROBADO" || tx.resolvedStatus === "COMPLETADO")) {
        p.totalRetiros += amount;
      }
    });

    return Array.from(map.values()).sort((a, b) => b.txCount - a.txCount);
  }, [allUnifiedTransactions, userMap]);

  // Set default selected player for "Por Jugador" mode
  const activePlayer = useMemo(() => {
    if (!selectedPlayerEmail && playersWithTransactions.length > 0) {
      return playersWithTransactions[0];
    }
    return playersWithTransactions.find((p) => p.email.toLowerCase() === selectedPlayerEmail?.toLowerCase()) || null;
  }, [selectedPlayerEmail, playersWithTransactions]);

  // Filter based on Type, Status, User/Search, and Date
  const filteredRecords = useMemo(() => {
    const cleanUserQuery = userQuery.trim().toLowerCase();
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const sevenDaysAgo = startOfToday - 7 * 24 * 60 * 60 * 1000;
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    return allUnifiedTransactions.filter((item) => {
      // If we are in "JUGADOR" view mode and a player is selected, filter strictly by that player
      if (viewMode === "JUGADOR" && activePlayer) {
        if (item.resolvedUserEmail.toLowerCase() !== activePlayer.email.toLowerCase()) {
          return false;
        }
      }

      // 1. Tipo Filter: Compra / Retiro / Bingo / Recarga
      if (selectedType !== "TODOS" && item.tipo !== selectedType) {
        return false;
      }

      // 2. Estado Filter
      if (selectedStatus !== "TODOS") {
        if (selectedStatus === "APROBADO" && item.resolvedStatus !== "APROBADO" && item.resolvedStatus !== "COMPLETADO") {
          return false;
        }
        if (selectedStatus === "PENDIENTE" && item.resolvedStatus !== "PENDIENTE") {
          return false;
        }
        if (selectedStatus === "RECHAZADO" && item.resolvedStatus !== "RECHAZADO") {
          return false;
        }
      }

      // 3. User Filter: Search by name, email, or transaction ID
      if (cleanUserQuery) {
        const matchName = item.resolvedUserName.toLowerCase().includes(cleanUserQuery);
        const matchEmail = item.resolvedUserEmail.toLowerCase().includes(cleanUserQuery);
        const matchTxId = (item.transactionId || "").toLowerCase().includes(cleanUserQuery);
        const matchDetalles = item.detalles.toLowerCase().includes(cleanUserQuery);
        const matchRef = (item.refNumber || "").toLowerCase().includes(cleanUserQuery);

        if (!matchName && !matchEmail && !matchTxId && !matchDetalles && !matchRef) {
          return false;
        }
      }

      // 4. Date Filter
      const itemTime = item.dateObj.getTime();

      // Check specific date input (YYYY-MM-DD)
      if (dateFilter) {
        const itemDateStr = item.dateObj.toISOString().slice(0, 10);
        const year = item.dateObj.getFullYear();
        const month = String(item.dateObj.getMonth() + 1).padStart(2, "0");
        const day = String(item.dateObj.getDate()).padStart(2, "0");
        const localDateStr = `${year}-${month}-${day}`;

        if (itemDateStr !== dateFilter && localDateStr !== dateFilter) {
          return false;
        }
      }

      // Check date presets
      if (datePreset === "TODAY") {
        if (itemTime < startOfToday) return false;
      } else if (datePreset === "7DAYS") {
        if (itemTime < sevenDaysAgo) return false;
      } else if (datePreset === "MONTH") {
        if (itemTime < startOfMonth) return false;
      }

      return true;
    });
  }, [
    allUnifiedTransactions,
    viewMode,
    activePlayer,
    selectedType,
    selectedStatus,
    userQuery,
    dateFilter,
    datePreset,
  ]);

  // Financial KPI totals calculation
  const financialTotals = useMemo(() => {
    let totalCompras = 0;
    let totalRetiros = 0;
    let totalBingos = 0;
    let totalRecargas = 0;

    filteredRecords.forEach((item) => {
      const amount = item.monto || 0;
      if (item.tipo === "COMPRA") {
        totalCompras += amount;
      } else if (item.tipo === "RETIRO") {
        if (item.resolvedStatus === "APROBADO" || item.resolvedStatus === "COMPLETADO") {
          totalRetiros += amount;
        }
      } else if (item.tipo === "BINGO") {
        totalBingos += amount;
      } else if (item.tipo === "RECARGA") {
        if (item.resolvedStatus === "APROBADO" || item.resolvedStatus === "COMPLETADO") {
          totalRecargas += amount;
        }
      }
    });

    return { totalCompras, totalRetiros, totalBingos, totalRecargas };
  }, [filteredRecords]);

  const handleCopyId = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      navigator.clipboard.writeText(id);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {}
  };

  const handleResetFilters = () => {
    setSelectedType("TODOS");
    setSelectedStatus("TODOS");
    setUserQuery("");
    setDateFilter("");
    setDatePreset("ALL");
    setSelectedPlayerEmail(null);
  };

  const handleFilterByUser = (email: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setUserQuery(email);
    setSelectedPlayerEmail(email);
  };

  const hasActiveFilters =
    selectedType !== "TODOS" ||
    selectedStatus !== "TODOS" ||
    userQuery !== "" ||
    dateFilter !== "" ||
    datePreset !== "ALL" ||
    (viewMode === "JUGADOR" && selectedPlayerEmail !== null);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex ${
        isMaximized
          ? "p-0"
          : "items-center justify-center p-2 sm:p-4 md:p-6"
      } bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200`}
    >
      <div
        className={`bg-slate-900 border ${
          isMaximized
            ? "w-screen h-screen max-w-none max-h-none rounded-none border-0"
            : "border-amber-500/50 rounded-3xl w-full max-w-7xl h-[95vh] max-h-[920px]"
        } flex flex-col shadow-2xl overflow-hidden relative transition-all duration-200`}
      >
        {/* ================================================================= */}
        {/* 1. Top Header with Title, View Layout Switcher & Maximize / Close */}
        {/* ================================================================= */}
        <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-indigo-950 p-3 sm:p-4 border-b border-amber-500/30 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-amber-500/20 border border-amber-400/60 flex items-center justify-center text-yellow-300 shadow shrink-0">
              <History size={22} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-fredoka text-base sm:text-lg md:text-xl font-bold text-yellow-300 truncate">
                  Historial de Transacciones Financieras
                </h2>
                <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold shrink-0">
                  {filteredRecords.length} Registros
                </span>
                {isMaximized && (
                  <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold shrink-0">
                    ⛶ Pantalla Completa
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-slate-300 truncate">
                Supervisión detallada de compras, retiros, premios de bingo y recargas por jugador
              </p>
            </div>
          </div>

          {/* Right Action Controls: View Modes + Maximize + Close */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* View Mode Toggle: Tabla vs Por Jugador vs Tarjetas */}
            <div className="bg-slate-950/80 border border-slate-700/80 p-1 rounded-2xl hidden md:flex items-center gap-1">
              <button
                type="button"
                onClick={() => setViewMode("TABLA")}
                className={`px-3 py-1.5 rounded-xl font-fredoka font-bold text-xs flex items-center gap-1.5 transition cursor-pointer ${
                  viewMode === "TABLA"
                    ? "bg-amber-500 text-slate-950 shadow"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Vista en Tabla Completa de Auditoría"
              >
                <TableIcon size={14} />
                <span>Tabla Maestra</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode("JUGADOR")}
                className={`px-3 py-1.5 rounded-xl font-fredoka font-bold text-xs flex items-center gap-1.5 transition cursor-pointer ${
                  viewMode === "JUGADOR"
                    ? "bg-indigo-600 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Vista detallada desglosada por cada Jugador individual"
              >
                <Users size={14} />
                <span>Por Jugador ({playersWithTransactions.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode("TARJETAS")}
                className={`px-3 py-1.5 rounded-xl font-fredoka font-bold text-xs flex items-center gap-1.5 transition cursor-pointer ${
                  viewMode === "TARJETAS"
                    ? "bg-amber-500 text-slate-950 shadow"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Vista en Tarjetas"
              >
                <LayoutGrid size={14} />
                <span>Tarjetas</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode("TENDENCIAS")}
                className={`px-3 py-1.5 rounded-xl font-fredoka font-bold text-xs flex items-center gap-1.5 transition cursor-pointer ${
                  viewMode === "TENDENCIAS"
                    ? "bg-emerald-600 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Gráfico de Barras con Tendencias Financieras de la Última Semana"
              >
                <BarChart3 size={14} />
                <span>Tendencias</span>
              </button>
            </div>

            {/* BOTÓN MAXIMIZAR / PANTALLA COMPLETA */}
            <button
              type="button"
              onClick={() => setIsMaximized(!isMaximized)}
              className="bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-yellow-200 border border-amber-500/40 p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-fredoka font-bold flex items-center gap-1.5 transition cursor-pointer shadow hover:scale-105 active:scale-95"
              title={
                isMaximized
                  ? "Restaurar tamaño normal de ventana"
                  : "Maximizar a pantalla completa para ver todos los detalles de los jugadores"
              }
            >
              {isMaximized ? (
                <>
                  <Minimize2 size={16} />
                  <span className="hidden sm:inline">Restaurar</span>
                </>
              ) : (
                <>
                  <Maximize2 size={16} />
                  <span className="hidden sm:inline">Maximizar</span>
                </>
              )}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 transition cursor-pointer"
              title="Cerrar ventana"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* View Mode Selector for Mobile */}
        <div className="flex md:hidden items-center justify-between p-2 bg-slate-950/80 border-b border-slate-800">
          <span className="text-[11px] font-bold text-slate-400">Modo de vista:</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setViewMode("TABLA")}
              className={`px-2.5 py-1 rounded-lg text-xs font-fredoka font-bold ${
                viewMode === "TABLA"
                  ? "bg-amber-500 text-slate-950"
                  : "bg-slate-900 text-slate-300"
              }`}
            >
              Tabla
            </button>
            <button
              type="button"
              onClick={() => setViewMode("JUGADOR")}
              className={`px-2.5 py-1 rounded-lg text-xs font-fredoka font-bold ${
                viewMode === "JUGADOR"
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-900 text-slate-300"
              }`}
            >
              Por Jugador
            </button>
            <button
              type="button"
              onClick={() => setViewMode("TARJETAS")}
              className={`px-2.5 py-1 rounded-lg text-xs font-fredoka font-bold ${
                viewMode === "TARJETAS"
                  ? "bg-amber-500 text-slate-950"
                  : "bg-slate-900 text-slate-300"
              }`}
            >
              Tarjetas
            </button>
            <button
              type="button"
              onClick={() => setViewMode("TENDENCIAS")}
              className={`px-2.5 py-1 rounded-lg text-xs font-fredoka font-bold ${
                viewMode === "TENDENCIAS"
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-900 text-slate-300"
              }`}
            >
              Tendencias
            </button>
          </div>
        </div>

        {/* ================================================================= */}
        {/* 2. Financial KPI Summary Cards */}
        {/* ================================================================= */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2.5 sm:p-3 bg-slate-950/95 border-b border-slate-800 shrink-0">
          {/* Total Compras */}
          <div className="bg-slate-900/90 border border-sky-500/40 rounded-2xl p-2 sm:p-2.5 flex flex-col gap-0.5">
            <div className="flex items-center justify-between text-[11px] text-sky-300 font-bold">
              <span className="flex items-center gap-1">
                <Ticket size={12} /> Compras Cartones
              </span>
              <TrendingUp size={12} className="text-sky-400" />
            </div>
            <span className="text-sm sm:text-base font-black font-mono text-white">
              {financialTotals.totalCompras.toFixed(2)} VES
            </span>
          </div>

          {/* Total Retiros */}
          <div className="bg-slate-900/90 border border-rose-500/40 rounded-2xl p-2 sm:p-2.5 flex flex-col gap-0.5">
            <div className="flex items-center justify-between text-[11px] text-rose-300 font-bold">
              <span className="flex items-center gap-1">
                <ArrowDownRight size={12} /> Retiros Aprobados
              </span>
              <TrendingDown size={12} className="text-rose-400" />
            </div>
            <span className="text-sm sm:text-base font-black font-mono text-rose-200">
              {financialTotals.totalRetiros.toFixed(2)} VES
            </span>
          </div>

          {/* Total Bingos */}
          <div className="bg-slate-900/90 border border-amber-500/40 rounded-2xl p-2 sm:p-2.5 flex flex-col gap-0.5">
            <div className="flex items-center justify-between text-[11px] text-yellow-300 font-bold">
              <span className="flex items-center gap-1">
                <Trophy size={12} /> Premios Bingo
              </span>
              <Coins size={12} className="text-yellow-400" />
            </div>
            <span className="text-sm sm:text-base font-black font-mono text-yellow-300">
              {financialTotals.totalBingos.toFixed(2)} VES
            </span>
          </div>

          {/* Total Recargas */}
          <div className="bg-slate-900/90 border border-emerald-500/40 rounded-2xl p-2 sm:p-2.5 flex flex-col gap-0.5">
            <div className="flex items-center justify-between text-[11px] text-emerald-300 font-bold">
              <span className="flex items-center gap-1">
                <ShieldCheck size={12} /> Recargas Acreditadas
              </span>
              <TrendingUp size={12} className="text-emerald-400" />
            </div>
            <span className="text-sm sm:text-base font-black font-mono text-emerald-300">
              {financialTotals.totalRecargas.toFixed(2)} VES
            </span>
          </div>
        </div>

        {/* ================================================================= */}
        {/* 3. Filters Toolbar (Tipo, Estado, Nombre de Usuario, Fecha) */}
        {/* ================================================================= */}
        <div className="p-2.5 sm:p-3 bg-slate-900/90 border-b border-slate-800 flex flex-col gap-2 shrink-0">
          {/* Row 1: Tipo Filter Tabs + Estado Filter + Reset */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            <span className="text-[11px] uppercase font-bold text-slate-400 shrink-0 pr-1 flex items-center gap-1">
              <Filter size={12} /> Tipo:
            </span>

            <button
              type="button"
              onClick={() => setSelectedType("TODOS")}
              className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl font-fredoka font-bold text-xs transition cursor-pointer whitespace-nowrap ${
                selectedType === "TODOS"
                  ? "bg-amber-500 text-slate-950 shadow"
                  : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              Todos ({allUnifiedTransactions.length})
            </button>

            <button
              type="button"
              onClick={() => setSelectedType("COMPRA")}
              className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl font-fredoka font-bold text-xs flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
                selectedType === "COMPRA"
                  ? "bg-sky-500 text-slate-950 shadow"
                  : "bg-slate-950 text-sky-400 hover:text-sky-300 border border-slate-800"
              }`}
            >
              <Ticket size={13} />
              <span>Compra</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedType("RETIRO")}
              className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl font-fredoka font-bold text-xs flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
                selectedType === "RETIRO"
                  ? "bg-rose-500 text-slate-950 shadow"
                  : "bg-slate-950 text-rose-400 hover:text-rose-300 border border-slate-800"
              }`}
            >
              <ArrowDownRight size={13} />
              <span>Retiro</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedType("BINGO")}
              className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl font-fredoka font-bold text-xs flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
                selectedType === "BINGO"
                  ? "bg-yellow-400 text-slate-950 shadow"
                  : "bg-slate-950 text-yellow-400 hover:text-yellow-300 border border-slate-800"
              }`}
            >
              <Trophy size={13} />
              <span>Bingo</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedType("RECARGA")}
              className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl font-fredoka font-bold text-xs flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
                selectedType === "RECARGA"
                  ? "bg-emerald-500 text-slate-950 shadow"
                  : "bg-slate-950 text-emerald-400 hover:text-emerald-300 border border-slate-800"
              }`}
            >
              <PlusCircle size={13} />
              <span>Recarga</span>
            </button>

            {/* Estado filter select */}
            <div className="flex items-center gap-1 pl-2 border-l border-slate-800 ml-1">
              <span className="text-[11px] uppercase font-bold text-slate-400 shrink-0">
                Estado:
              </span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as TransactionStatusFilter)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-amber-300 font-fredoka focus:outline-none focus:border-amber-400"
              >
                <option value="TODOS">Todos</option>
                <option value="APROBADO">Aprobado / Completado</option>
                <option value="PENDIENTE">Pendiente</option>
                <option value="RECHAZADO">Rechazado</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="ml-auto text-amber-400 hover:text-amber-300 text-xs font-fredoka flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-xl transition cursor-pointer shrink-0"
                title="Limpiar todos los filtros"
              >
                <RotateCcw size={12} />
                <span>Limpiar Filtros</span>
              </button>
            )}
          </div>

          {/* Row 2: Nombre de Usuario + Fecha Picker + Presets */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
            {/* Filter by Username / Email */}
            <div className="md:col-span-5 relative">
              <Search
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Buscar por Nombre de Jugador, Gmail, Referencia o ID..."
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
              />
              {userQuery && (
                <button
                  onClick={() => setUserQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  title="Borrar búsqueda"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Filter by Date Input */}
            <div className="md:col-span-4 relative flex items-center">
              <Calendar
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value);
                  if (e.target.value) setDatePreset("ALL");
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-7 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400 transition"
                title="Selecciona una fecha específica"
              />
              {dateFilter && (
                <button
                  type="button"
                  onClick={() => setDateFilter("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                  title="Borrar fecha"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Date Presets Quick Chips */}
            <div className="md:col-span-3 flex items-center gap-1 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => {
                  setDatePreset("TODAY");
                  setDateFilter("");
                }}
                className={`px-2 py-1.5 rounded-lg text-[11px] font-fredoka font-bold transition cursor-pointer shrink-0 ${
                  datePreset === "TODAY"
                    ? "bg-amber-500 text-slate-950"
                    : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                Hoy
              </button>
              <button
                type="button"
                onClick={() => {
                  setDatePreset("7DAYS");
                  setDateFilter("");
                }}
                className={`px-2 py-1.5 rounded-lg text-[11px] font-fredoka font-bold transition cursor-pointer shrink-0 ${
                  datePreset === "7DAYS"
                    ? "bg-amber-500 text-slate-950"
                    : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                7 días
              </button>
              <button
                type="button"
                onClick={() => {
                  setDatePreset("MONTH");
                  setDateFilter("");
                }}
                className={`px-2 py-1.5 rounded-lg text-[11px] font-fredoka font-bold transition cursor-pointer shrink-0 ${
                  datePreset === "MONTH"
                    ? "bg-amber-500 text-slate-950"
                    : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                Este mes
              </button>
            </div>
          </div>
        </div>

        {/* Active Player Filter banner if set */}
        {userQuery && (
          <div className="bg-amber-500/10 border-b border-amber-500/30 px-3 py-1.5 flex items-center justify-between text-xs text-amber-300">
            <span className="flex items-center gap-1.5">
              <span>🔍</span> Filtrando resultados para: <strong className="text-white">{userQuery}</strong>
            </span>
            <button
              onClick={() => setUserQuery("")}
              className="text-amber-400 hover:text-white underline font-bold"
            >
              Ver todos los jugadores
            </button>
          </div>
        )}

        {/* ================================================================= */}
        {/* 4. MAIN CONTENT AREA (TABLA MAESTRA / VISTA POR JUGADOR / TARJETAS) */}
        {/* ================================================================= */}
        <div className="flex-1 overflow-hidden flex flex-col bg-slate-950/60 relative">
          {/* =============================================================== */}
          {/* MODE 1: TABLA MAESTRA DETALLADA (Columnas legibles, espacio amplio) */}
          {/* =============================================================== */}
          {viewMode === "TABLA" && (
            <div className="flex-1 overflow-auto">
              {filteredRecords.length === 0 ? (
                <EmptyState onReset={handleResetFilters} hasFilters={hasActiveFilters} />
              ) : (
                <table className="w-full text-left text-xs border-collapse min-w-[900px]">
                  <thead className="bg-slate-900/90 sticky top-0 z-10 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-3.5">Fecha y Hora</th>
                      <th className="py-3 px-3.5">Jugador</th>
                      <th className="py-3 px-3.5">Tipo</th>
                      <th className="py-3 px-3.5">ID / Referencia</th>
                      <th className="py-3 px-3.5">Detalle Completo</th>
                      <th className="py-3 px-3.5 text-right">Monto (VES)</th>
                      <th className="py-3 px-3.5 text-center">Estado</th>
                      <th className="py-3 px-3.5 text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {filteredRecords.map((item) => {
                      const typeConfig = getTypeBadge(item.tipo);
                      const statusBadge = getStatusBadge(item.resolvedStatus);

                      return (
                        <tr
                          key={item.id}
                          onClick={() => setInspectedTransaction(item)}
                          className="hover:bg-slate-900/80 transition cursor-pointer group"
                        >
                          {/* Fecha */}
                          <td className="py-3 px-3.5 font-mono text-slate-400 whitespace-nowrap">
                            <span className="text-slate-200 font-bold block">
                              {item.dateObj.toLocaleDateString()}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              {item.dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </td>

                          {/* Jugador con Avatar y Email */}
                          <td className="py-3 px-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-slate-950 border border-slate-700 flex items-center justify-center shrink-0 overflow-hidden text-sm">
                                {item.resolvedUserAvatar &&
                                (item.resolvedUserAvatar.startsWith("data:") ||
                                  item.resolvedUserAvatar.startsWith("http")) ? (
                                  <img
                                    src={item.resolvedUserAvatar}
                                    alt={item.resolvedUserName}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span>{item.resolvedUserAvatar || "👤"}</span>
                                )}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="font-fredoka font-bold text-white group-hover:text-yellow-300 transition truncate">
                                  {item.resolvedUserName}
                                </span>
                                <span className="text-[11px] text-slate-400 font-mono truncate">
                                  {item.resolvedUserEmail}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Tipo */}
                          <td className="py-3 px-3.5 whitespace-nowrap">
                            <span
                              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg border inline-flex items-center gap-1 ${typeConfig.bg}`}
                            >
                              {typeConfig.icon}
                              {typeConfig.label}
                            </span>
                          </td>

                          {/* ID / Ref */}
                          <td className="py-3 px-3.5 font-mono whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              <span className="text-slate-300 font-bold">
                                {item.transactionId || item.refNumber || "—"}
                              </span>
                              {item.transactionId && (
                                <button
                                  type="button"
                                  onClick={(e) => handleCopyId(item.transactionId!, e)}
                                  className="text-slate-500 hover:text-amber-300 p-1"
                                  title="Copiar ID"
                                >
                                  {copiedId === item.transactionId ? (
                                    <Check size={11} className="text-emerald-400" />
                                  ) : (
                                    <Copy size={11} />
                                  )}
                                </button>
                              )}
                            </div>
                            {item.bankName && (
                              <span className="text-[10px] text-slate-500 block">
                                {item.bankName}
                              </span>
                            )}
                          </td>

                          {/* Detalle Completo */}
                          <td className="py-3 px-3.5 text-slate-300 max-w-md">
                            <p className="leading-snug break-words">
                              {item.detalles}
                            </p>
                          </td>

                          {/* Monto */}
                          <td className="py-3 px-3.5 text-right whitespace-nowrap font-mono">
                            <span
                              className={`text-sm sm:text-base font-black ${typeConfig.amountColor}`}
                            >
                              {typeConfig.sign}
                              {(item.monto ?? 0).toFixed(2)} VES
                            </span>
                          </td>

                          {/* Estado */}
                          <td className="py-3 px-3.5 text-center whitespace-nowrap">
                            <span
                              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg border uppercase ${statusBadge}`}
                            >
                              {item.resolvedStatus}
                            </span>
                          </td>

                          {/* Acción: Ver Ficha */}
                          <td className="py-3 px-3.5 text-center whitespace-nowrap">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setInspectedTransaction(item);
                              }}
                              className="bg-slate-800 hover:bg-slate-700 text-yellow-300 px-2 py-1 rounded-lg text-xs font-fredoka flex items-center gap-1 mx-auto transition"
                              title="Ver ficha completa de la transacción"
                            >
                              <Eye size={12} />
                              <span>Ver</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* =============================================================== */}
          {/* MODE 2: VISTA DETALLADA POR JUGADOR (Perfil Financiero Individual) */}
          {/* =============================================================== */}
          {viewMode === "JUGADOR" && (
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              {/* Left sidebar: Players list */}
              <div className="w-full md:w-80 bg-slate-900/90 border-r border-slate-800 flex flex-col shrink-0 h-48 md:h-full">
                <div className="p-3 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
                  <span className="font-fredoka text-xs font-bold text-slate-300 uppercase">
                    Seleccionar Jugador ({playersWithTransactions.length})
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    Con movimientos
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
                  {playersWithTransactions.map((player) => {
                    const isSelected = activePlayer?.email.toLowerCase() === player.email.toLowerCase();

                    return (
                      <button
                        key={player.email}
                        type="button"
                        onClick={() => setSelectedPlayerEmail(player.email)}
                        className={`w-full p-2.5 sm:p-3 text-left flex items-center justify-between gap-2.5 transition cursor-pointer ${
                          isSelected
                            ? "bg-indigo-950/80 border-l-4 border-indigo-400 text-white"
                            : "hover:bg-slate-800/50 text-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-slate-950 border border-slate-700 flex items-center justify-center shrink-0 overflow-hidden text-sm">
                            {player.avatar &&
                            (player.avatar.startsWith("data:") || player.avatar.startsWith("http")) ? (
                              <img src={player.avatar} alt={player.name} className="w-full h-full object-cover" />
                            ) : (
                              <span>{player.avatar || "👤"}</span>
                            )}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-fredoka font-bold text-xs truncate">
                              {player.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono truncate">
                              {player.email}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end shrink-0">
                          <span className="text-[10px] font-mono bg-slate-950 px-1.5 py-0.5 rounded text-amber-300 font-bold">
                            {player.txCount} tx
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {player.balance.toFixed(2)} VES
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right main area: Selected player's ledger & breakdown */}
              <div className="flex-1 flex flex-col overflow-y-auto bg-slate-950/70 p-3 sm:p-5">
                {activePlayer ? (
                  <div className="flex flex-col gap-4">
                    {/* Player Info Card Header */}
                    <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 border border-indigo-500/40 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
                      <div className="flex items-center gap-3.5">
                        <div className="w-14 h-14 rounded-2xl bg-slate-950 border-2 border-indigo-400 flex items-center justify-center text-2xl overflow-hidden shadow-lg">
                          {activePlayer.avatar &&
                          (activePlayer.avatar.startsWith("data:") || activePlayer.avatar.startsWith("http")) ? (
                            <img src={activePlayer.avatar} alt={activePlayer.name} className="w-full h-full object-cover" />
                          ) : (
                            <span>{activePlayer.avatar || "👤"}</span>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <h3 className="font-fredoka text-lg sm:text-xl font-bold text-white">
                            {activePlayer.name}
                          </h3>
                          <span className="text-xs text-indigo-300 font-mono">
                            {activePlayer.email}
                          </span>
                          <span className="text-[11px] text-slate-400 mt-1">
                            Saldo Actual en Plataforma: <strong className="text-emerald-400 font-mono font-bold">{activePlayer.balance.toFixed(2)} VES</strong>
                          </span>
                        </div>
                      </div>

                      {/* Player KPI Quick Stats */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full sm:w-auto">
                        <div className="bg-slate-950/80 border border-sky-500/30 rounded-xl p-2 text-center">
                          <span className="text-[9px] uppercase font-bold text-sky-400 block">Compras</span>
                          <span className="text-xs font-mono font-bold text-white">
                            {activePlayer.totalCompras.toFixed(2)} VES
                          </span>
                        </div>
                        <div className="bg-slate-950/80 border border-yellow-500/30 rounded-xl p-2 text-center">
                          <span className="text-[9px] uppercase font-bold text-yellow-400 block">Bingos</span>
                          <span className="text-xs font-mono font-bold text-yellow-300">
                            {activePlayer.totalBingos.toFixed(2)} VES
                          </span>
                        </div>
                        <div className="bg-slate-950/80 border border-emerald-500/30 rounded-xl p-2 text-center">
                          <span className="text-[9px] uppercase font-bold text-emerald-400 block">Recargas</span>
                          <span className="text-xs font-mono font-bold text-emerald-300">
                            {activePlayer.totalRecargas.toFixed(2)} VES
                          </span>
                        </div>
                        <div className="bg-slate-950/80 border border-rose-500/30 rounded-xl p-2 text-center">
                          <span className="text-[9px] uppercase font-bold text-rose-400 block">Retiros</span>
                          <span className="text-xs font-mono font-bold text-rose-300">
                            {activePlayer.totalRetiros.toFixed(2)} VES
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Timeline of transactions for this player */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-fredoka text-sm font-bold text-slate-200">
                          Historial Detallado de Movimientos ({filteredRecords.length})
                        </h4>
                        <span className="text-[11px] text-slate-400">
                          Ordenado cronológicamente (más recientes primero)
                        </span>
                      </div>

                      {filteredRecords.length === 0 ? (
                        <div className="p-8 text-center text-xs text-slate-500 italic bg-slate-900/60 rounded-2xl border border-slate-800">
                          No hay transacciones registradas para este jugador con los filtros seleccionados.
                        </div>
                      ) : (
                        filteredRecords.map((item) => {
                          const typeConfig = getTypeBadge(item.tipo);
                          const statusBadge = getStatusBadge(item.resolvedStatus);

                          return (
                            <div
                              key={item.id}
                              onClick={() => setInspectedTransaction(item)}
                              className="bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition cursor-pointer shadow hover:bg-slate-850"
                            >
                              <div className="flex items-start gap-3 min-w-0">
                                <div className="mt-0.5">
                                  <span
                                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg border flex items-center gap-1 ${typeConfig.bg}`}
                                  >
                                    {typeConfig.icon}
                                    {typeConfig.label}
                                  </span>
                                </div>

                                <div className="flex flex-col gap-0.5 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-mono text-xs text-slate-400">
                                      📅 {item.dateObj.toLocaleString()}
                                    </span>
                                    <span
                                      className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border uppercase ${statusBadge}`}
                                    >
                                      {item.resolvedStatus}
                                    </span>
                                    {item.transactionId && (
                                      <span className="text-[10px] font-mono bg-slate-950 text-slate-400 border border-slate-800 px-1.5 py-0.2 rounded">
                                        ID: {item.transactionId}
                                      </span>
                                    )}
                                  </div>

                                  <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                                    {item.detalles}
                                  </p>

                                  {item.bankName && (
                                    <span className="text-[11px] text-amber-400/90 font-mono mt-0.5">
                                      🏦 Banco: {item.bankName} {item.refNumber ? `| Ref: ${item.refNumber}` : ""}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto shrink-0 border-t sm:border-t-0 border-slate-800 pt-2 sm:pt-0">
                                <span className="text-[10px] text-slate-400 uppercase font-bold sm:hidden">
                                  Monto:
                                </span>
                                <span className={`text-base font-mono font-black ${typeConfig.amountColor}`}>
                                  {typeConfig.sign}
                                  {(item.monto ?? 0).toFixed(2)} VES
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="m-auto text-center p-8 text-slate-500">
                    Selecciona un jugador para ver su estado de cuenta detallado.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* MODE 3: VISTA TARJETAS EXPANDIDAS */}
          {/* =============================================================== */}
          {viewMode === "TARJETAS" && (
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 flex flex-col gap-2.5">
              {filteredRecords.length === 0 ? (
                <EmptyState onReset={handleResetFilters} hasFilters={hasActiveFilters} />
              ) : (
                filteredRecords.map((item) => {
                  const typeConfig = getTypeBadge(item.tipo);
                  const statusBadge = getStatusBadge(item.resolvedStatus);

                  return (
                    <div
                      key={item.id}
                      onClick={() => setInspectedTransaction(item)}
                      className="bg-slate-900/95 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition cursor-pointer shadow-md"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        {/* User Avatar */}
                        <div className="w-10 h-10 rounded-2xl bg-slate-950 border border-slate-700 flex items-center justify-center shrink-0 text-base overflow-hidden shadow">
                          {item.resolvedUserAvatar &&
                          (item.resolvedUserAvatar.startsWith("data:") ||
                            item.resolvedUserAvatar.startsWith("http")) ? (
                            <img
                              src={item.resolvedUserAvatar}
                              alt={item.resolvedUserName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span>{item.resolvedUserAvatar || "👤"}</span>
                          )}
                        </div>

                        <div className="flex flex-col gap-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg border flex items-center gap-1 ${typeConfig.bg}`}
                            >
                              {typeConfig.icon}
                              {typeConfig.label}
                            </span>

                            <span
                              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg border uppercase ${statusBadge}`}
                            >
                              {item.resolvedStatus}
                            </span>

                            {item.transactionId && (
                              <button
                                type="button"
                                onClick={(e) => handleCopyId(item.transactionId!, e)}
                                className="text-[10px] font-mono bg-slate-950 text-slate-400 hover:text-amber-300 border border-slate-800 px-1.5 py-0.5 rounded flex items-center gap-1 transition"
                                title="Copiar ID"
                              >
                                {copiedId === item.transactionId ? (
                                  <Check size={10} className="text-emerald-400" />
                                ) : (
                                  <Copy size={10} />
                                )}
                                <span>{item.transactionId}</span>
                              </button>
                            )}
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-fredoka font-bold text-sm text-white">
                              {item.resolvedUserName}
                            </span>
                            <span className="text-xs text-slate-400 font-mono">
                              ({item.resolvedUserEmail})
                            </span>
                          </div>

                          {/* Details without truncation for full visibility */}
                          <p className="text-xs text-slate-300 leading-relaxed font-sans">
                            {item.detalles}
                          </p>

                          <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono mt-0.5">
                            <span>📅 {item.dateObj.toLocaleString()}</span>
                            {item.bankName && <span>🏦 {item.bankName}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto shrink-0 border-t sm:border-t-0 border-slate-800 pt-2 sm:pt-0">
                        <span className="text-[10px] text-slate-400 uppercase font-bold sm:hidden">
                          Monto:
                        </span>
                        <span className={`text-base sm:text-lg font-mono font-black ${typeConfig.amountColor}`}>
                          {typeConfig.sign}
                          {(item.monto ?? 0).toFixed(2)} VES
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* =============================================================== */}
          {/* MODE 4: VISTA GRÁFICO DE TENDENCIAS FINANCIERAS (RECHARTS)      */}
          {/* =============================================================== */}
          {viewMode === "TENDENCIAS" && (
            <div className="flex-1 overflow-y-auto p-3 sm:p-5">
              <AdminFinancialTrendsChart
                rechargeRequests={rechargeRequests}
                withdrawRequests={withdrawRequests}
                history={history}
              />
            </div>
          )}
        </div>

        {/* ================================================================= */}
        {/* 5. Footer with stats and close action */}
        {/* ================================================================= */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <span>
              Mostrando <strong className="text-white">{filteredRecords.length}</strong> de{" "}
              <strong className="text-white">{allUnifiedTransactions.length}</strong> registros
            </span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="hidden sm:inline">
              Modo: <strong className="text-amber-300">{viewMode}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMaximized(!isMaximized)}
              className="text-amber-400 hover:text-white px-2 py-1 rounded transition text-xs font-bold"
            >
              {isMaximized ? "Reducir" : "Maximizar"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-700 text-white font-fredoka font-bold px-4 py-1.5 rounded-xl transition cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* 6. INSPECTOR DRAWER / MODAL (Single Transaction Deep Dive) */}
      {/* ================================================================= */}
      {inspectedTransaction && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border-2 border-amber-500/70 rounded-3xl w-full max-w-xl p-5 shadow-2xl flex flex-col gap-4 relative">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-yellow-400" />
                <h3 className="font-fredoka text-base font-bold text-white">
                  Ficha Detallada de Transacción
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectedTransaction(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex flex-col gap-3 text-xs">
              {/* User row */}
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-xl overflow-hidden shrink-0">
                  {inspectedTransaction.resolvedUserAvatar &&
                  (inspectedTransaction.resolvedUserAvatar.startsWith("data:") ||
                    inspectedTransaction.resolvedUserAvatar.startsWith("http")) ? (
                    <img
                      src={inspectedTransaction.resolvedUserAvatar}
                      alt={inspectedTransaction.resolvedUserName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{inspectedTransaction.resolvedUserAvatar || "👤"}</span>
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-fredoka font-bold text-sm text-white">
                    {inspectedTransaction.resolvedUserName}
                  </span>
                  <span className="text-slate-400 font-mono">
                    {inspectedTransaction.resolvedUserEmail}
                  </span>
                </div>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">
                    ID Transacción
                  </span>
                  <span className="font-mono text-amber-300 font-bold">
                    {inspectedTransaction.transactionId || inspectedTransaction.id}
                  </span>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">
                    Tipo de Movimiento
                  </span>
                  <span className="font-mono text-white font-bold">
                    {inspectedTransaction.tipo}
                  </span>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">
                    Monto
                  </span>
                  <span className="font-mono text-base font-black text-emerald-400">
                    {(inspectedTransaction.monto ?? 0).toFixed(2)} VES
                  </span>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">
                    Estado Actual
                  </span>
                  <span className="font-mono text-yellow-300 font-bold uppercase">
                    {inspectedTransaction.resolvedStatus}
                  </span>
                </div>
              </div>

              {/* Detalle */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-col gap-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold">
                  Descripción y Notas
                </span>
                <p className="text-slate-200 leading-relaxed font-sans">
                  {inspectedTransaction.detalles}
                </p>
              </div>

              {/* Bank & Ref */}
              {(inspectedTransaction.bankName || inspectedTransaction.refNumber) && (
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between font-mono">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block font-bold">
                      Banco
                    </span>
                    <span className="text-white font-bold">
                      {inspectedTransaction.bankName || "Pago Móvil"}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 uppercase block font-bold">
                      Referencia
                    </span>
                    <span className="text-amber-400 font-bold">
                      {inspectedTransaction.refNumber || "—"}
                    </span>
                  </div>
                </div>
              )}

              {/* Voucher Preview if available */}
              {inspectedTransaction.voucherImage && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">
                    Captura del Comprobante:
                  </span>
                  <div
                    onClick={() => setInspectedVoucherModal(inspectedTransaction.voucherImage!)}
                    className="h-32 bg-slate-950 border border-amber-500/40 rounded-xl overflow-hidden relative cursor-pointer group"
                  >
                    <img
                      src={inspectedTransaction.voucherImage}
                      alt="Comprobante"
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-amber-300 font-bold text-xs">
                      <Eye size={14} className="mr-1" /> Ver Imagen Completa
                    </div>
                  </div>
                </div>
              )}

              {/* Date */}
              <div className="text-[11px] text-slate-500 font-mono text-center pt-1">
                Registrado: {inspectedTransaction.dateObj.toLocaleString()}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between border-t border-slate-800 pt-3">
              <button
                type="button"
                onClick={() => {
                  handleFilterByUser(inspectedTransaction.resolvedUserEmail);
                  setInspectedTransaction(null);
                }}
                className="bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/50 px-3 py-1.5 rounded-xl font-fredoka font-bold text-xs transition"
              >
                Filtrar solo este jugador
              </button>

              <button
                type="button"
                onClick={() => setInspectedTransaction(null)}
                className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-1.5 rounded-xl font-fredoka font-bold text-xs transition"
              >
                Cerrar Ficha
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Voucher Modal */}
      {inspectedVoucherModal && (
        <div
          onClick={() => setInspectedVoucherModal(null)}
          className="fixed inset-0 z-70 bg-black/90 flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="max-w-2xl max-h-[85vh] relative">
            <img
              src={inspectedVoucherModal}
              alt="Voucher"
              className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl border-2 border-amber-500"
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Helpers for badges
function getTypeBadge(tipo: string) {
  switch (tipo) {
    case "COMPRA":
      return {
        label: "COMPRA",
        icon: <Ticket size={13} />,
        bg: "bg-sky-500/20 text-sky-300 border-sky-500/40",
        amountColor: "text-sky-300",
        sign: "-",
      };
    case "RETIRO":
      return {
        label: "RETIRO",
        icon: <ArrowDownRight size={13} />,
        bg: "bg-rose-500/20 text-rose-300 border-rose-500/40",
        amountColor: "text-rose-300",
        sign: "-",
      };
    case "BINGO":
      return {
        label: "BINGO",
        icon: <Trophy size={13} />,
        bg: "bg-amber-500/20 text-yellow-300 border-amber-500/40",
        amountColor: "text-yellow-300 font-black",
        sign: "+",
      };
    case "RECARGA":
      return {
        label: "RECARGA",
        icon: <PlusCircle size={13} />,
        bg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
        amountColor: "text-emerald-300 font-bold",
        sign: "+",
      };
    default:
      return {
        label: tipo,
        icon: <Coins size={13} />,
        bg: "bg-slate-800 text-slate-300 border-slate-700",
        amountColor: "text-white",
        sign: "",
      };
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "APROBADO":
    case "COMPLETADO":
      return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
    case "PENDIENTE":
      return "bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse";
    case "RECHAZADO":
      return "bg-rose-500/20 text-rose-300 border-rose-500/40";
    default:
      return "bg-slate-800 text-slate-300 border-slate-700";
  }
}

function EmptyState({ onReset, hasFilters }: { onReset: () => void; hasFilters: boolean }) {
  return (
    <div className="m-auto flex flex-col items-center justify-center p-8 text-center max-w-md">
      <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-500 mb-3">
        <Search size={26} />
      </div>
      <h4 className="font-fredoka text-base font-bold text-white mb-1">
        No se encontraron transacciones
      </h4>
      <p className="text-xs text-slate-400 mb-4 leading-relaxed">
        {hasFilters
          ? "No hay registros financieros que coincidan con los filtros de tipo, fecha o usuario seleccionados."
          : "Aún no se han registrado transacciones en la plataforma."}
      </p>
      {hasFilters && (
        <button
          type="button"
          onClick={onReset}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-fredoka font-bold text-xs px-4 py-2 rounded-xl transition cursor-pointer shadow"
        >
          Restablecer Filtros
        </button>
      )}
    </div>
  );
}
