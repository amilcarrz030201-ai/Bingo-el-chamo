import React, { useState, useMemo } from "react";
import { HistoryRecord, RechargeRequest, WithdrawRequest } from "../types";
import {
  Receipt,
  ArrowDownRight,
  PlusCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Filter,
  Search,
  ChevronDown,
  ShieldCheck,
  AlertTriangle,
  FileText,
  BadgeCheck,
} from "lucide-react";

interface Props {
  history: HistoryRecord[];
  rechargeRequests?: RechargeRequest[];
  withdrawRequests?: WithdrawRequest[];
  userEmail: string;
}

export type FilterCategory = "TODOS" | "RECARGAS" | "PAGADOS" | "RETIROS";
export type FilterStatus = "TODOS" | "APROBADO" | "PENDIENTE" | "RECHAZADO";

export const TransactionHistoryCard: React.FC<Props> = ({
  history,
  rechargeRequests = [],
  withdrawRequests = [],
  userEmail,
}) => {
  const [activeTab, setActiveTab] = useState<FilterCategory>("TODOS");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("TODOS");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Harmonize history items with real-time status from requests
  const unifiedTransactions = useMemo(() => {
    // Map of recharge request status by transactionId or id
    const rechargeStatusMap = new Map<string, { estado: "PENDIENTE" | "APROBADO" | "RECHAZADO"; notes?: string }>();
    rechargeRequests.forEach((req) => {
      if (req.transactionId) rechargeStatusMap.set(req.transactionId, { estado: req.estado, notes: req.notes });
      rechargeStatusMap.set(req.id, { estado: req.estado, notes: req.notes });
    });

    // Map of withdraw request status by transactionId or id
    const withdrawStatusMap = new Map<string, { estado: "PENDIENTE" | "APROBADO" | "RECHAZADO"; notes?: string }>();
    withdrawRequests.forEach((req) => {
      if (req.transactionId) withdrawStatusMap.set(req.transactionId, { estado: req.estado, notes: req.notes });
      withdrawStatusMap.set(req.id, { estado: req.estado, notes: req.notes });
    });

    return history.map((record) => {
      let resolvedStatus: "PENDIENTE" | "APROBADO" | "RECHAZADO" | "COMPLETADO" = record.estado || "COMPLETADO";
      let adminNote: string | undefined = undefined;

      if (record.tipo === "RECARGA") {
        const match =
          (record.transactionId && rechargeStatusMap.get(record.transactionId)) ||
          (record.requestId && rechargeStatusMap.get(record.requestId));
        if (match) {
          resolvedStatus = match.estado;
          adminNote = match.notes;
        } else if (!record.estado) {
          resolvedStatus = "PENDIENTE";
        }
      } else if (record.tipo === "RETIRO") {
        const match =
          (record.transactionId && withdrawStatusMap.get(record.transactionId)) ||
          (record.requestId && withdrawStatusMap.get(record.requestId));
        if (match) {
          resolvedStatus = match.estado;
          adminNote = match.notes;
        } else if (!record.estado) {
          resolvedStatus = "PENDIENTE";
        }
      } else {
        // Purchases and Bingo prizes are completed immediately
        resolvedStatus = "APROBADO";
      }

      return {
        ...record,
        resolvedStatus,
        adminNote,
      };
    });
  }, [history, rechargeRequests, withdrawRequests]);

  // Filter based on Tab, Status and Search query
  const filteredRecords = useMemo(() => {
    return unifiedTransactions.filter((item) => {
      // Tab filter
      if (activeTab === "RECARGAS" && item.tipo !== "RECARGA") return false;
      if (activeTab === "RETIROS" && item.tipo !== "RETIRO") return false;
      if (activeTab === "PAGADOS" && item.resolvedStatus !== "APROBADO" && item.resolvedStatus !== "COMPLETADO")
        return false;

      // Status filter
      if (statusFilter !== "TODOS") {
        if (statusFilter === "APROBADO" && item.resolvedStatus !== "APROBADO" && item.resolvedStatus !== "COMPLETADO")
          return false;
        if (statusFilter === "PENDIENTE" && item.resolvedStatus !== "PENDIENTE") return false;
        if (statusFilter === "RECHAZADO" && item.resolvedStatus !== "RECHAZADO") return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = item.transactionId?.toLowerCase().includes(q) || false;
        const matchDet = item.detalles.toLowerCase().includes(q);
        const matchTipo = item.tipo.toLowerCase().includes(q);
        if (!matchId && !matchDet && !matchTipo) return false;
      }

      return true;
    });
  }, [unifiedTransactions, activeTab, statusFilter, searchQuery]);

  // Counts for summary pills
  const counts = useMemo(() => {
    const recargas = unifiedTransactions.filter((t) => t.tipo === "RECARGA").length;
    const retiros = unifiedTransactions.filter((t) => t.tipo === "RETIRO").length;
    const pagados = unifiedTransactions.filter((t) => t.resolvedStatus === "APROBADO" || t.resolvedStatus === "COMPLETADO").length;
    const rechazados = unifiedTransactions.filter((t) => t.resolvedStatus === "RECHAZADO").length;
    const pendientes = unifiedTransactions.filter((t) => t.resolvedStatus === "PENDIENTE").length;

    return { recargas, retiros, pagados, rechazados, pendientes, total: unifiedTransactions.length };
  }, [unifiedTransactions]);

  const getStatusBadge = (status: "PENDIENTE" | "APROBADO" | "RECHAZADO" | "COMPLETADO") => {
    switch (status) {
      case "APROBADO":
      case "COMPLETADO":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-emerald-950/90 text-emerald-300 border border-emerald-700/80 shadow-sm">
            <CheckCircle2 size={11} className="text-emerald-400" />
            Pagado / Aprobado
          </span>
        );
      case "RECHAZADO":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-red-950/90 text-red-300 border border-red-700/80 shadow-sm">
            <XCircle size={11} className="text-red-400" />
            Rechazado
          </span>
        );
      case "PENDIENTE":
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-amber-950/90 text-yellow-300 border border-amber-600/80 shadow-sm animate-pulse">
            <Clock size={11} className="text-yellow-400" />
            En Espera (Pendiente)
          </span>
        );
    }
  };

  const getTypeBadge = (tipo: "COMPRA" | "BINGO" | "RECARGA" | "RETIRO") => {
    switch (tipo) {
      case "RECARGA":
        return (
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase bg-amber-500/20 text-yellow-300 border border-amber-500/40">
            Recarga
          </span>
        );
      case "RETIRO":
        return (
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase bg-blue-500/20 text-blue-300 border border-blue-500/40">
            Retiro
          </span>
        );
      case "BINGO":
        return (
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            Premio Bingo
          </span>
        );
      case "COMPRA":
      default:
        return (
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase bg-purple-500/20 text-purple-300 border border-purple-500/40">
            Compra Cartón
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-900/95 border border-amber-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col gap-4">
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-amber-500/20 text-yellow-300 border border-amber-500/40 shadow-sm">
            <Receipt size={18} />
          </div>
          <div>
            <h3 className="font-fredoka text-base sm:text-lg font-bold text-yellow-300 flex items-center gap-2">
              Historial de Transacciones
              <span className="text-[10px] bg-slate-950 text-slate-300 font-mono px-2 py-0.5 rounded-full border border-slate-800">
                {counts.total} en total
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Control transparente de tus recargas, pagos, retiros y resolución del Administrador
            </p>
          </div>
        </div>

        {/* Quick Search */}
        <div className="relative w-full sm:w-48">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar ID o detalle..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 outline-none focus:border-amber-500 transition font-mono placeholder:font-sans placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Categories Bar: Historial Transacción, Pagado, Retiro & Status filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {/* Navigation Tabs */}
        <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 shadow-inner flex-wrap">
          <button
            id="tab-history-all"
            onClick={() => setActiveTab("TODOS")}
            className={`px-3 py-1.5 rounded-xl text-xs font-fredoka font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "TODOS"
                ? "bg-amber-500 text-slate-950 shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span>Historial Transacción</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-900/60">
              {counts.total}
            </span>
          </button>

          <button
            id="tab-history-recharges"
            onClick={() => setActiveTab("RECARGAS")}
            className={`px-3 py-1.5 rounded-xl text-xs font-fredoka font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "RECARGAS"
                ? "bg-yellow-500 text-slate-950 shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <PlusCircle size={12} />
            <span>Recargas</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-900/60">
              {counts.recargas}
            </span>
          </button>

          <button
            id="tab-history-paid"
            onClick={() => setActiveTab("PAGADOS")}
            className={`px-3 py-1.5 rounded-xl text-xs font-fredoka font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "PAGADOS"
                ? "bg-emerald-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <BadgeCheck size={12} />
            <span>Pagado</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-900/60">
              {counts.pagados}
            </span>
          </button>

          <button
            id="tab-history-withdrawals"
            onClick={() => setActiveTab("RETIROS")}
            className={`px-3 py-1.5 rounded-xl text-xs font-fredoka font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "RETIROS"
                ? "bg-blue-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <ArrowDownRight size={12} />
            <span>Retiro</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-900/60">
              {counts.retiros}
            </span>
          </button>
        </div>

        {/* State Filter Selector (Aprobado / En Espera / Rechazado) */}
        <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-2xl border border-slate-800 text-xs">
          <Filter size={12} className="text-amber-400 shrink-0" />
          <span className="text-[11px] text-slate-400 font-bold hidden sm:inline">Estado:</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setStatusFilter("TODOS")}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold font-fredoka transition cursor-pointer ${
                statusFilter === "TODOS"
                  ? "bg-slate-800 text-yellow-300"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setStatusFilter("APROBADO")}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold font-fredoka transition cursor-pointer ${
                statusFilter === "APROBADO"
                  ? "bg-emerald-950 text-emerald-300 border border-emerald-700"
                  : "text-slate-400 hover:text-emerald-300"
              }`}
              title="Aprobados y Pagados"
            >
              Aprobado
            </button>
            <button
              onClick={() => setStatusFilter("PENDIENTE")}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold font-fredoka transition cursor-pointer ${
                statusFilter === "PENDIENTE"
                  ? "bg-amber-950 text-yellow-300 border border-amber-700"
                  : "text-slate-400 hover:text-yellow-300"
              }`}
              title="En Espera de respuesta del Administrador"
            >
              En Espera
            </button>
            <button
              onClick={() => setStatusFilter("RECHAZADO")}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold font-fredoka transition cursor-pointer ${
                statusFilter === "RECHAZADO"
                  ? "bg-red-950 text-red-300 border border-red-700"
                  : "text-slate-400 hover:text-red-300"
              }`}
              title="Rechazados por el Administrador"
            >
              Rechazado
            </button>
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="flex flex-col gap-2.5 max-h-[300px] overflow-y-auto pr-1">
        {filteredRecords.length === 0 ? (
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-center flex flex-col items-center justify-center gap-2 text-slate-400">
            <FileText size={28} className="text-slate-600" />
            <span className="text-xs font-medium">
              No se encontraron transacciones para los filtros seleccionados.
            </span>
            <span className="text-[11px] text-slate-500">
              Tus solicitudes de recarga o retiro aparecerán aquí con su estado en vivo (En espera, Aprobado o Rechazado por el Administrador).
            </span>
          </div>
        ) : (
          filteredRecords.map((record) => (
            <div
              key={record.id}
              className={`p-3.5 rounded-2xl border transition flex flex-col gap-2 ${
                record.resolvedStatus === "RECHAZADO"
                  ? "bg-red-950/20 border-red-900/60"
                  : record.resolvedStatus === "APROBADO" || record.resolvedStatus === "COMPLETADO"
                  ? "bg-emerald-950/20 border-emerald-900/60"
                  : "bg-slate-950 border-slate-800/90 hover:border-amber-500/40"
              }`}
            >
              {/* Row 1: Details & Badges */}
              <div className="flex items-start sm:items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  {getTypeBadge(record.tipo)}
                  <span className="font-bold text-slate-200 text-xs sm:text-sm">
                    {record.detalles}
                  </span>
                </div>
                <div>{getStatusBadge(record.resolvedStatus)}</div>
              </div>

              {/* Row 2: Metadata & IDs */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono border-t border-slate-800/60 pt-2 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Clock size={11} className="text-slate-500" />
                  <span>{record.fecha}</span>
                </div>

                <div className="flex items-center gap-3">
                  {record.monto !== undefined && (
                    <span className="text-yellow-300 font-bold">
                      {record.tipo === "RETIRO" ? "-" : "+"}
                      {record.monto.toFixed(2)} VES
                    </span>
                  )}

                  {record.transactionId && (
                    <span className="bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-800 text-amber-300 font-bold text-[10px]">
                      TRX: {record.transactionId}
                    </span>
                  )}
                </div>
              </div>

              {/* Status explanation depending on administrator action */}
              <div className="text-[10px] rounded-xl px-2.5 py-1.5 mt-0.5 flex items-center justify-between gap-2 border bg-slate-900/60 border-slate-800/80 text-slate-300">
                {record.resolvedStatus === "PENDIENTE" && (
                  <span className="flex items-center gap-1.5 text-yellow-300/90 font-medium">
                    <Clock size={12} className="text-yellow-400 animate-spin" />
                    <strong>En espera del Administrador:</strong> Esta solicitud está siendo verificada en el panel maestro.
                  </span>
                )}
                {record.resolvedStatus === "APROBADO" && (
                  <span className="flex items-center gap-1.5 text-emerald-300 font-medium">
                    <CheckCircle2 size={12} className="text-emerald-400" />
                    <strong>Aprobado & Pagado:</strong> El administrador verificó los fondos y se procesó con éxito.
                  </span>
                )}
                {record.resolvedStatus === "RECHAZADO" && (
                  <span className="flex items-center gap-1.5 text-red-300 font-medium">
                    <XCircle size={12} className="text-red-400" />
                    <strong>Rechazado por el Administrador:</strong> {record.adminNote || "Los datos de pago o comprobante no pudieron ser validados."}
                  </span>
                )}
                {record.resolvedStatus === "COMPLETADO" && (
                  <span className="flex items-center gap-1.5 text-emerald-300 font-medium">
                    <ShieldCheck size={12} className="text-emerald-400" />
                    <strong>Operación Exitosa:</strong> Registrada en tu cuenta.
                  </span>
                )}

                <span className="text-[9px] text-slate-500 font-mono hidden sm:inline">
                  Ref: {record.id.slice(0, 10)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Information Banner */}
      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between flex-wrap gap-2">
        <span className="flex items-center gap-1.5">
          <ShieldCheck size={13} className="text-amber-400" />
          Tus operaciones se sincronizan en tiempo real con las resoluciones del Administrador.
        </span>
        <div className="flex items-center gap-3 text-[10px] font-mono">
          <span className="text-emerald-400">● {counts.pagados} Pagados</span>
          <span className="text-yellow-400">● {counts.pendientes} En espera</span>
          <span className="text-red-400">● {counts.rechazados} Rechazados</span>
        </div>
      </div>
    </div>
  );
};
