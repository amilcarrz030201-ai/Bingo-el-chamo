import React, { useState, useMemo } from "react";
import { BingoCard } from "../types";
import {
  X,
  ShoppingCart,
  CheckCircle2,
  Search,
  Wallet,
  Sparkles,
  Ticket,
  PlusCircle,
  Eye,
  Filter,
  Star,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  LayoutGrid,
  Grid,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  allCards: BingoCard[];
  purchasedCardIds: number[];
  favoriteCardIds?: number[];
  userBalance: number;
  cartonPrice?: number;
  onBuyCarton: (cartonId: number) => void;
  onToggleFavorite?: (cartonId: number) => void;
  onSelectCartonId: (id: number) => void;
  onOpenRecharge: () => void;
  onEnterTableWithCarton?: (id: number) => void;
  initialFilter?: "all" | "favorites" | "available" | "purchased";
}

type ViewMode = "detailed" | "mosaic" | "board";
type RangeFilter = "all" | "1-50" | "51-100" | "101-150" | "151-200";

export const CartonCatalogModal: React.FC<Props> = ({
  isOpen,
  onClose,
  allCards,
  purchasedCardIds,
  favoriteCardIds = [],
  userBalance,
  cartonPrice = 60,
  onBuyCarton,
  onToggleFavorite,
  onSelectCartonId,
  onOpenRecharge,
  onEnterTableWithCarton,
  initialFilter = "all",
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "favorites" | "available" | "purchased">(initialFilter);
  const [viewMode, setViewMode] = useState<ViewMode>("detailed");
  const [rangeFilter, setRangeFilter] = useState<RangeFilter>("all");
  const [inspectedCartonId, setInspectedCartonId] = useState<number>(() => {
    // Default to first purchased card or first card
    return purchasedCardIds[0] || (allCards[0]?.id ?? 1);
  });

  // Sync initialFilter when opened
  React.useEffect(() => {
    if (initialFilter) setFilterType(initialFilter);
  }, [initialFilter, isOpen]);

  // Keep inspected card valid
  const inspectedCard = useMemo(() => {
    return allCards.find((c) => c.id === inspectedCartonId) || allCards[0];
  }, [allCards, inspectedCartonId]);

  const columnHeaders = [
    { label: "B", bg: "bg-gradient-to-b from-red-600 to-red-800 text-white border-red-500" },
    { label: "I", bg: "bg-gradient-to-b from-amber-500 to-amber-700 text-slate-950 border-amber-400 font-black" },
    { label: "N", bg: "bg-gradient-to-b from-emerald-600 to-emerald-800 text-white border-emerald-500" },
    { label: "G", bg: "bg-gradient-to-b from-blue-600 to-blue-800 text-white border-blue-500" },
    { label: "O", bg: "bg-gradient-to-b from-purple-600 to-purple-800 text-white border-purple-500" },
  ];

  // Filter cards based on search, status, and range
  const filteredCards = useMemo(() => {
    return allCards.filter((card) => {
      // 1. Search filter
      if (searchTerm.trim()) {
        const termNum = parseInt(searchTerm.trim(), 10);
        if (!isNaN(termNum) && card.id !== termNum) {
          return false;
        }
      }

      // 2. Status filter
      const isPurchased = purchasedCardIds.includes(card.id);
      const isFavorite = favoriteCardIds.includes(card.id);

      if (filterType === "favorites" && !isFavorite) return false;
      if (filterType === "available" && isPurchased) return false;
      if (filterType === "purchased" && !isPurchased) return false;

      // 3. Range filter (only in mosaic or board when no specific search is active)
      if (!searchTerm.trim()) {
        if (rangeFilter === "1-50" && (card.id < 1 || card.id > 50)) return false;
        if (rangeFilter === "51-100" && (card.id < 51 || card.id > 100)) return false;
        if (rangeFilter === "101-150" && (card.id < 101 || card.id > 150)) return false;
        if (rangeFilter === "151-200" && (card.id < 151 || card.id > 200)) return false;
      }

      return true;
    });
  }, [allCards, searchTerm, filterType, rangeFilter, purchasedCardIds, favoriteCardIds]);

  const handlePrevCard = () => {
    setInspectedCartonId((prev) => {
      const currentIdx = allCards.findIndex((c) => c.id === prev);
      if (currentIdx <= 0) return allCards[allCards.length - 1]?.id ?? 1;
      return allCards[currentIdx - 1]?.id ?? 1;
    });
  };

  const handleNextCard = () => {
    setInspectedCartonId((prev) => {
      const currentIdx = allCards.findIndex((c) => c.id === prev);
      if (currentIdx >= allCards.length - 1 || currentIdx === -1) return allCards[0]?.id ?? 1;
      return allCards[currentIdx + 1]?.id ?? 1;
    });
  };

  if (!isOpen) return null;

  const isInspectedPurchased = purchasedCardIds.includes(inspectedCartonId);
  const isInspectedFavorite = favoriteCardIds.includes(inspectedCartonId);

  return (
    <div
      id="carton-catalog-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-200"
    >
      <div className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-5xl w-full h-[94vh] flex flex-col shadow-2xl overflow-hidden relative">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/40 px-4 sm:px-6 py-3 border-b border-amber-500/30 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-yellow-400 shadow">
              <ShoppingCart size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-fredoka text-base sm:text-lg font-bold text-yellow-300">
                  Tienda de Cartones Oficiales
                </h2>
                <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-mono">
                  {allCards.length} Disponibles
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-300">
                Elige y revisa los números de cada cartón con comodidad y espacio antes de adquirirlo.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Cartons count badge */}
            <div
              className={`px-2.5 py-1 rounded-xl border text-xs font-fredoka font-bold flex items-center gap-1.5 shadow ${
                purchasedCardIds.length >= 4
                  ? "bg-purple-950 border-purple-500/50 text-purple-300"
                  : "bg-slate-950 border-amber-500/40 text-yellow-300"
              }`}
            >
              <Ticket size={13} className="text-amber-400" />
              <span>{purchasedCardIds.length}/4 Cartones</span>
            </div>

            {/* User Balance Badge */}
            <div className="bg-slate-950 border border-amber-500/40 rounded-xl px-2.5 py-1 flex items-center gap-2 shadow">
              <Wallet size={13} className="text-amber-400" />
              <div className="flex flex-col text-left">
                <span className="text-[8px] uppercase font-bold text-slate-400">Saldo</span>
                <span className="font-fredoka text-xs font-bold text-yellow-300 font-mono">
                  {userBalance.toFixed(2)} VES
                </span>
              </div>
            </div>

            {/* Recargar Button */}
            <button
              onClick={onOpenRecharge}
              className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-fredoka font-bold px-2.5 py-1.5 rounded-xl shadow flex items-center gap-1 transition cursor-pointer"
              title="Recargar saldo por Pago Móvil"
            >
              <PlusCircle size={13} />
              <span className="hidden sm:inline">Recargar</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white p-1.5 rounded-xl border border-slate-700 transition cursor-pointer"
              title="Cerrar tienda"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* View Mode Switcher & Filter Toolbar */}
        <div className="bg-slate-950/90 px-4 sm:px-6 py-2 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
          {/* Left: View Mode Pills */}
          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => setViewMode("detailed")}
              className={`px-3 py-1 rounded-xl text-xs font-fredoka font-bold transition cursor-pointer flex items-center gap-1.5 ${
                viewMode === "detailed"
                  ? "bg-amber-400 text-slate-950 shadow font-black"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <Maximize2 size={13} />
              <span>Vista Grande y Cómoda</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode("mosaic")}
              className={`px-3 py-1 rounded-xl text-xs font-fredoka font-bold transition cursor-pointer flex items-center gap-1.5 ${
                viewMode === "mosaic"
                  ? "bg-amber-400 text-slate-950 shadow font-black"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <LayoutGrid size={13} />
              <span>Vitrina (Mosaico)</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode("board")}
              className={`px-3 py-1 rounded-xl text-xs font-fredoka font-bold transition cursor-pointer flex items-center gap-1.5 ${
                viewMode === "board"
                  ? "bg-amber-400 text-slate-950 shadow font-black"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <Grid size={13} />
              <span>Tablero 1 al 200</span>
            </button>
          </div>

          {/* Right: Search box */}
          <div className="flex items-center gap-2">
            <div className="relative w-40 sm:w-48">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="number"
                min={1}
                max={200}
                placeholder="Cartón (#1 al 200)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-8 pr-2.5 py-1 text-xs text-yellow-300 font-mono outline-none focus:border-amber-400 transition"
              />
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="text-[11px] text-slate-400 hover:text-white px-2 py-1 bg-slate-800 rounded-lg"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>

        {/* Secondary Filter Bar: Status & Ranges */}
        <div className="bg-slate-950/60 px-4 sm:px-6 py-2 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2 shrink-0">
          {/* Status Filters */}
          <div className="flex items-center gap-1 flex-wrap">
            <button
              onClick={() => setFilterType("all")}
              className={`px-2.5 py-1 rounded-lg text-xs font-fredoka font-bold transition cursor-pointer ${
                filterType === "all"
                  ? "bg-slate-800 text-amber-300 border border-amber-500/50"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Todos ({allCards.length})
            </button>
            <button
              onClick={() => setFilterType("favorites")}
              className={`px-2.5 py-1 rounded-lg text-xs font-fredoka font-bold transition cursor-pointer flex items-center gap-1 ${
                filterType === "favorites"
                  ? "bg-yellow-400 text-slate-950 shadow font-black"
                  : "text-yellow-300/80 hover:text-yellow-200"
              }`}
            >
              <Star
                size={11}
                className={filterType === "favorites" ? "fill-slate-950 text-slate-950" : "fill-yellow-400 text-yellow-400"}
              />
              <span>Favoritos ({favoriteCardIds.length})</span>
            </button>
            <button
              onClick={() => setFilterType("available")}
              className={`px-2.5 py-1 rounded-lg text-xs font-fredoka font-bold transition cursor-pointer ${
                filterType === "available"
                  ? "bg-slate-800 text-emerald-300 border border-emerald-500/50"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Disponibles ({allCards.length - purchasedCardIds.length})
            </button>
            <button
              onClick={() => setFilterType("purchased")}
              className={`px-2.5 py-1 rounded-lg text-xs font-fredoka font-bold transition cursor-pointer ${
                filterType === "purchased"
                  ? "bg-purple-900 text-purple-200 border border-purple-500/50 font-black"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Comprados ({purchasedCardIds.length}/4)
            </button>
          </div>

          {/* Quick Range Segments (only in mosaic or board) */}
          {(viewMode === "mosaic" || viewMode === "board") && (
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
              <span className="text-[10px] text-slate-500 font-mono uppercase mr-1">Rango:</span>
              {(["all", "1-50", "51-100", "101-150", "151-200"] as RangeFilter[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setRangeFilter(r)}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-mono transition cursor-pointer ${
                    rangeFilter === r
                      ? "bg-amber-500/20 text-yellow-300 border border-amber-500/60 font-bold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {r === "all" ? "1-200" : r}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Modal Main Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5">
          {/* ========================================================================= */}
          {/* MODO 1: VISTA GRANDE Y CÓMODA (ESPACIOSA, DETALLADA Y PERFECTA PARA ELEGIR) */}
          {/* ========================================================================= */}
          {viewMode === "detailed" && inspectedCard && (
            <div className="flex flex-col gap-4 max-w-3xl mx-auto w-full animate-in fade-in duration-200">
              {/* Notice Tip */}
              <div className="text-xs text-amber-200/90 bg-amber-500/10 border border-amber-500/20 px-3.5 py-2 rounded-2xl flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-yellow-400 shrink-0" />
                  <span>
                    Vista cómoda con números grandes. Usa las flechas <strong>« Anterior</strong> y <strong>Siguiente »</strong> para ver los 200 cartones con calma.
                  </span>
                </div>
                <span className="text-[11px] font-mono text-amber-300 font-bold hidden sm:inline shrink-0">
                  {cartonPrice.toFixed(2)} VES c/u
                </span>
              </div>

              {/* Navigation Bar for Inspection */}
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center justify-between gap-3 shadow-md">
                <button
                  type="button"
                  onClick={handlePrevCard}
                  className="bg-slate-900 hover:bg-slate-800 text-yellow-300 font-fredoka text-xs sm:text-sm font-bold px-3 py-2 rounded-xl border border-slate-700 flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow"
                >
                  <ChevronLeft size={16} />
                  <span>Anterior</span>
                </button>

                <div className="flex items-center gap-2">
                  <span className="font-fredoka text-base sm:text-lg font-black text-yellow-300">
                    Cartón #{inspectedCard.id} de 200
                  </span>

                  {/* Favorite Toggle Button */}
                  <button
                    type="button"
                    onClick={() => onToggleFavorite && onToggleFavorite(inspectedCard.id)}
                    className={`p-1.5 rounded-xl border text-xs transition cursor-pointer flex items-center gap-1 ${
                      isInspectedFavorite
                        ? "bg-amber-500/20 text-yellow-300 border-yellow-400 shadow"
                        : "bg-slate-900 text-slate-400 hover:text-yellow-300 border-slate-700"
                    }`}
                    title={isInspectedFavorite ? "Quitar de favoritos" : "Guardar como favorito ⭐"}
                  >
                    <Star
                      size={16}
                      className={isInspectedFavorite ? "fill-yellow-400 text-yellow-400" : ""}
                    />
                    <span className="text-[11px] font-fredoka hidden sm:inline">
                      {isInspectedFavorite ? "Favorito" : "Marcar Favorito"}
                    </span>
                  </button>

                  {isInspectedPurchased && (
                    <span className="text-xs font-bold bg-purple-950 text-purple-300 border border-purple-800 px-2.5 py-1 rounded-xl flex items-center gap-1 shadow">
                      <CheckCircle2 size={13} /> Adquirido
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleNextCard}
                  className="bg-slate-900 hover:bg-slate-800 text-yellow-300 font-fredoka text-xs sm:text-sm font-bold px-3 py-2 rounded-xl border border-slate-700 flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow"
                >
                  <span>Siguiente</span>
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* The Spacious Full-Size Bingo Card Display */}
              <div className="bg-slate-950 p-4 sm:p-6 rounded-3xl border-2 border-amber-500/40 shadow-2xl flex flex-col gap-3">
                {/* Classic Colorful B I N G O Header */}
                <div className="grid grid-cols-5 gap-2 text-center font-fredoka font-black text-base sm:text-xl md:text-2xl tracking-wider select-none">
                  {columnHeaders.map((h) => (
                    <div
                      key={h.label}
                      className={`py-2 rounded-2xl border-2 shadow-md flex items-center justify-center ${h.bg}`}
                    >
                      <span className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">{h.label}</span>
                    </div>
                  ))}
                </div>

                {/* 5x5 Big Readable Numbers Grid */}
                <div className="grid grid-cols-5 gap-2 sm:gap-3 text-center">
                  {inspectedCard.numeros.map((row, rIdx) =>
                    row.map((cell, cIdx) => {
                      const isFree = cell.num === "FREE";
                      return (
                        <div
                          key={`inspected-${inspectedCard.id}-${rIdx}-${cIdx}`}
                          className={`aspect-square rounded-2xl flex flex-col items-center justify-center font-fredoka font-bold select-none shadow border transition ${
                            isFree
                              ? "bg-gradient-to-tr from-amber-300 via-yellow-400 to-amber-500 text-slate-950 border-2 border-white shadow-lg"
                              : "bg-slate-900 text-slate-100 hover:bg-slate-800 border-slate-700 hover:border-amber-400"
                          }`}
                        >
                          {isFree ? (
                            <>
                              <span className="text-xs sm:text-sm md:text-base font-black text-slate-950 leading-tight">
                                FREE
                              </span>
                              <span className="text-[10px] sm:text-xs text-slate-900">★</span>
                            </>
                          ) : (
                            <span className="text-base sm:text-xl md:text-2xl font-black text-white">
                              {cell.num}
                            </span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Purchase Action Footer for this Card */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
                  <div className="text-left">
                    <span className="text-xs text-slate-400">Precio de compra para esta partida:</span>
                    <p className="font-fredoka text-lg font-black text-emerald-400 font-mono">
                      {cartonPrice.toFixed(2)} VES
                    </p>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {isInspectedPurchased ? (
                      <button
                        type="button"
                        onClick={() => {
                          onSelectCartonId(inspectedCard.id);
                          if (onEnterTableWithCarton) {
                            onEnterTableWithCarton(inspectedCard.id);
                          }
                          onClose();
                        }}
                        className="w-full sm:w-auto bg-purple-700 hover:bg-purple-600 text-white font-fredoka font-black text-sm px-6 py-3 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
                      >
                        <Eye size={16} />
                        <span>Ver y Jugar en la Mesa</span>
                      </button>
                    ) : purchasedCardIds.length >= 4 ? (
                      <button
                        disabled
                        className="w-full sm:w-auto bg-slate-800 text-slate-500 font-fredoka font-bold text-sm px-6 py-3 rounded-2xl border border-slate-700 cursor-not-allowed"
                      >
                        Límite Máximo Alcanzado (4/4)
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          onBuyCarton(inspectedCard.id);
                        }}
                        className="w-full sm:w-auto bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 font-fredoka font-black text-sm sm:text-base px-8 py-3 rounded-2xl shadow-xl flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer border border-yellow-200"
                      >
                        <ShoppingCart size={18} />
                        <span>Comprar Cartón #{inspectedCard.id} ({cartonPrice.toFixed(2)} VES)</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Horizontal Strip of Surrounding Cartons */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                  Toca cualquier cartón cercano para revisarlo en grande:
                </span>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {allCards.slice(
                    Math.max(0, inspectedCard.id - 6),
                    Math.min(allCards.length, inspectedCard.id + 6)
                  ).map((c) => {
                    const isSelected = c.id === inspectedCard.id;
                    const isPur = purchasedCardIds.includes(c.id);
                    const isFav = favoriteCardIds.includes(c.id);

                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setInspectedCartonId(c.id)}
                        className={`px-3 py-2 rounded-xl text-xs font-fredoka font-bold shrink-0 transition cursor-pointer flex items-center gap-1.5 border shadow ${
                          isSelected
                            ? "bg-amber-400 text-slate-950 border-white ring-2 ring-yellow-300 font-black scale-105"
                            : isPur
                            ? "bg-purple-950/80 text-purple-300 border-purple-700 hover:bg-purple-900"
                            : isFav
                            ? "bg-slate-900 text-yellow-300 border-amber-500/50 hover:bg-slate-800"
                            : "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-800"
                        }`}
                      >
                        {isFav && <Star size={11} className="fill-yellow-400 text-yellow-400" />}
                        <span>Cartón #{c.id}</span>
                        {isPur && <CheckCircle2 size={11} className="text-purple-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* MODO 2: VITRINA / MOSAICO CON TARJETAS VISUALES ESPACIOSAS */}
          {/* ========================================================================= */}
          {viewMode === "mosaic" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>
                  Mostrando <strong className="text-yellow-300 font-mono">{filteredCards.length}</strong> cartones
                </span>
                <span>Toca cualquier cartón para verlo en tamaño grande.</span>
              </div>

              {filteredCards.length === 0 ? (
                <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
                  <Ticket size={36} className="text-slate-600" />
                  <p className="font-fredoka text-sm">No se encontraron cartones con los filtros activos.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCards.map((card) => {
                    const isPurchased = purchasedCardIds.includes(card.id);
                    const isFavorite = favoriteCardIds.includes(card.id);

                    return (
                      <div
                        key={card.id}
                        id={`carton-card-${card.id}`}
                        onClick={() => {
                          setInspectedCartonId(card.id);
                          setViewMode("detailed");
                        }}
                        className={`bg-slate-950 rounded-2xl border transition-all duration-200 flex flex-col p-3.5 gap-2.5 shadow-md cursor-pointer hover:border-amber-400 hover:shadow-lg ${
                          isPurchased
                            ? "border-purple-600/50 ring-1 ring-purple-500/30"
                            : isFavorite
                            ? "border-yellow-500/50 ring-1 ring-yellow-500/20"
                            : "border-slate-800"
                        }`}
                      >
                        {/* Card Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-fredoka font-bold text-yellow-300 text-sm bg-slate-900 border border-slate-700/80 px-2.5 py-0.5 rounded-xl">
                              Cartón #{card.id}
                            </span>

                            {/* Favorite Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onToggleFavorite) onToggleFavorite(card.id);
                              }}
                              className={`p-1 rounded-lg border text-xs transition cursor-pointer ${
                                isFavorite
                                  ? "bg-amber-500/25 text-yellow-300 border-amber-400"
                                  : "bg-slate-900 text-slate-400 hover:text-yellow-300 border-slate-800"
                              }`}
                              title={isFavorite ? "Quitar de favoritos" : "Guardar favorito"}
                            >
                              <Star
                                size={13}
                                className={isFavorite ? "fill-yellow-400 text-yellow-400" : ""}
                              />
                            </button>

                            {isPurchased && (
                              <span className="text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <CheckCircle2 size={11} /> Comprado
                              </span>
                            )}
                          </div>

                          <span className="text-xs font-mono font-bold text-emerald-400">
                            {cartonPrice.toFixed(2)} VES
                          </span>
                        </div>

                        {/* 5x5 Mini Matrix Display */}
                        <div className="bg-slate-900/90 rounded-xl p-2 border border-slate-800/80 flex flex-col gap-1">
                          {/* Headers B I N G O */}
                          <div className="grid grid-cols-5 gap-1 text-center font-fredoka font-bold text-[10px]">
                            {columnHeaders.map((h) => (
                              <div key={h.label} className={`py-0.5 rounded border text-[9px] ${h.bg}`}>
                                {h.label}
                              </div>
                            ))}
                          </div>

                          {/* Numbers */}
                          <div className="grid grid-cols-5 gap-1 text-center">
                            {card.numeros.map((row, rIdx) =>
                              row.map((cell, cIdx) => {
                                const isFree = cell.num === "FREE";
                                return (
                                  <div
                                    key={`${card.id}-${rIdx}-${cIdx}`}
                                    className={`h-6 rounded flex items-center justify-center font-fredoka text-[11px] font-bold border select-none ${
                                      isFree
                                        ? "bg-amber-500 text-slate-950 border-amber-300 text-[8px]"
                                        : "bg-slate-950 text-slate-200 border-slate-800/80"
                                    }`}
                                  >
                                    {isFree ? "⭐" : cell.num}
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                          {isPurchased ? (
                            <button
                              type="button"
                              onClick={() => {
                                onSelectCartonId(card.id);
                                if (onEnterTableWithCarton) {
                                  onEnterTableWithCarton(card.id);
                                }
                                onClose();
                              }}
                              className="flex-1 bg-purple-900/80 hover:bg-purple-800 text-purple-200 font-fredoka text-xs font-bold py-2 rounded-xl border border-purple-700/60 flex items-center justify-center gap-1.5 transition cursor-pointer"
                            >
                              <Eye size={13} /> Jugar en Mesa
                            </button>
                          ) : purchasedCardIds.length >= 4 ? (
                            <button
                              disabled
                              className="flex-1 bg-slate-800 text-slate-500 font-fredoka text-xs font-bold py-2 rounded-xl border border-slate-700 cursor-not-allowed text-center"
                            >
                              Límite 4/4 Alcanzado
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onBuyCarton(card.id)}
                              className="flex-1 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-950 font-fredoka text-xs font-black py-2 rounded-xl shadow flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                            >
                              <ShoppingCart size={13} /> Comprar ({cartonPrice.toFixed(2)} VES)
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* MODO 3: TABLERO RÁPIDO DEL 1 AL 200 (INSPECCIÓN DIRECTA POR NÚMERO) */}
          {/* ========================================================================= */}
          {viewMode === "board" && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-200">
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="text-slate-300">
                  Toca cualquier número del <strong>1 al 200</strong> para abrir instantáneamente su vista detallada:
                </span>
                <div className="flex items-center gap-3 text-[11px] font-mono">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block" /> Comprado ({purchasedCardIds.length})
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" /> Favorito ({favoriteCardIds.length})
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-700 inline-block" /> Disponible
                  </span>
                </div>
              </div>

              {/* 200 Numbers Interactive Matrix */}
              <div className="grid grid-cols-5 sm:grid-cols-10 md:grid-cols-20 gap-1.5 sm:gap-2 bg-slate-950 p-3 sm:p-4 rounded-3xl border border-slate-800">
                {allCards.map((c) => {
                  const isPur = purchasedCardIds.includes(c.id);
                  const isFav = favoriteCardIds.includes(c.id);
                  const isCur = c.id === inspectedCartonId;

                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setInspectedCartonId(c.id);
                        setViewMode("detailed");
                      }}
                      className={`h-9 rounded-xl font-fredoka font-bold text-xs flex flex-col items-center justify-center transition cursor-pointer relative shadow ${
                        isCur
                          ? "bg-amber-400 text-slate-950 ring-2 ring-yellow-200 font-black scale-110 z-10"
                          : isPur
                          ? "bg-purple-900 text-purple-200 border border-purple-600 hover:bg-purple-800"
                          : isFav
                          ? "bg-amber-950/90 text-yellow-300 border border-amber-500/70 hover:bg-amber-900"
                          : "bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800 hover:text-white"
                      }`}
                      title={`Cartón #${c.id}${isPur ? " (Comprado)" : isFav ? " (Favorito ⭐)" : " (Disponible)"}`}
                    >
                      <span>#{c.id}</span>
                      {isFav && !isCur && (
                        <span className="text-[7px] leading-none text-yellow-400">★</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 px-4 sm:px-6 py-2.5 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 shrink-0 gap-2">
          <span>
            Saldo en cuenta: <strong className="text-yellow-300 font-mono">{userBalance.toFixed(2)} VES</strong>
          </span>
          <span>
            Cartones activos: <strong className="text-purple-300 font-mono">{purchasedCardIds.length} de 4 máx</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
