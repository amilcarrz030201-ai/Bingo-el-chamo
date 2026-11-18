import React, { useState } from "react";
import { X, Upload, Sparkles, CheckCircle2, AlertCircle, Loader2, MessageCircle, Copy, Check } from "lucide-react";
import { OFFICIAL_PAGO_MOVIL, OFFICIAL_WHATSAPP } from "../constants/contact";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { transactionId: string; monto: number; ref: string; bank: string; voucherImage?: string }) => void;
}

export const RechargeModal: React.FC<Props> = ({ isOpen, onClose, onSubmit }) => {
  const [transactionId] = useState<string>(() => `TRX-REC-${Math.floor(100000 + Math.random() * 900000)}`);
  const [monto, setMonto] = useState("");
  const [ref, setRef] = useState("");
  const [bank, setBank] = useState("Banco de Venezuela");
  const [voucherImage, setVoucherImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const [detectedAiAmount, setDetectedAiAmount] = useState<number | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (!isOpen) return null;

  const quickAmounts = [60, 120, 300, 500, 1000];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setVoucherImage(base64);

      // Trigger Gemini AI scan of the receipt!
      setIsScanning(true);
      setScanMessage("Escaneando comprobante bancario con Gemini AI...");
      try {
        const res = await fetch("/api/receipt/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: base64, mimeType: file.type }),
        });
        const data = await res.json();
        if (data && !data.error) {
          if (data.reference && !ref) setRef(data.reference);
          if (data.bank) setBank(data.bank);

          // CRITICAL: NEVER overwrite what the user already typed or selected
          if (data.amount && Number(data.amount) > 0) {
            const aiAmt = Number(Number(data.amount).toFixed(2));
            setDetectedAiAmount(aiAmt);
            if (!monto || monto.trim() === "" || monto === "0") {
              setMonto(String(aiAmt));
              setScanMessage(`¡Monto ${aiAmt} VES y Ref ${data.reference || "N/A"} detectados del comprobante!`);
            } else {
              setScanMessage(`Comprobante analizado (Ref: ${data.reference || "N/A"}). Puedes conservar tu monto o pulsar la sugerencia.`);
            }
          } else {
            setScanMessage(`Comprobante verificado (${data.bank || "Banco"} - Ref: ${data.reference || "N/A"}).`);
          }
        } else {
          setScanMessage("Comprobante subido. Por favor indica el monto exacto a recargar.");
        }
      } catch (err) {
        console.error("AI receipt scan error:", err);
        setScanMessage("Comprobante adjuntado. Ingresa el monto a recargar.");
      } finally {
        setIsScanning(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSelectQuickAmount = (val: number) => {
    setMonto(val.toString());
  };

  const parsedMonto = parseFloat(monto.replace(/\s+/g, "").replace(/,/g, "."));
  const validMonto = !isNaN(parsedMonto) && parsedMonto > 0 ? Number(parsedMonto.toFixed(2)) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validMonto <= 0 || !ref.trim()) {
      alert("Por favor ingresa un monto válido (ej. 500.00 VES) y el número de referencia bancaria.");
      return;
    }

    onSubmit({
      transactionId,
      monto: validMonto,
      ref: ref.trim(),
      bank,
      voucherImage: voucherImage || undefined,
    });
    setMonto("");
    setRef("");
    setVoucherImage(null);
    setScanMessage(null);
    setDetectedAiAmount(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl max-w-md w-full p-6 flex flex-col gap-4 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex flex-col">
            <h3 className="font-fredoka text-base sm:text-lg font-bold text-emerald-300 flex items-center gap-2">
              <span className="p-1 rounded-lg bg-emerald-950 text-emerald-400">💳</span>
              Recarga por Pago Móvil
            </h3>
            <div className="text-[10px] text-amber-300 font-mono mt-0.5">
              ID de Transacción: <strong className="bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">{transactionId}</strong>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-xl transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Datos Oficiales de Pago Móvil */}
        <div className="bg-slate-950 p-3.5 rounded-2xl border border-emerald-500/30 text-xs text-slate-300 flex flex-col gap-2 shadow-inner">
          <div className="flex items-center justify-between">
            <span className="font-fredoka font-bold text-yellow-300 text-xs uppercase tracking-wide flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Datos Oficiales para Pago Móvil
            </span>
            <span className="text-[10px] bg-emerald-950/80 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-800/80 font-bold">
              BDV 0102
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-mono">
            {/* Banco */}
            <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800 flex flex-col justify-between">
              <span className="text-[10px] text-slate-400 font-sans">Banco:</span>
              <div className="flex items-center justify-between mt-0.5">
                <span className="font-bold text-white">0102 BDV</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(OFFICIAL_PAGO_MOVIL.bankCode, "banco")}
                  className="text-slate-400 hover:text-yellow-300 p-0.5 rounded transition"
                  title="Copiar código de banco"
                >
                  {copiedField === "banco" ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                </button>
              </div>
            </div>

            {/* Teléfono */}
            <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800 flex flex-col justify-between">
              <span className="text-[10px] text-slate-400 font-sans">Teléfono:</span>
              <div className="flex items-center justify-between mt-0.5">
                <span className="font-bold text-emerald-300">{OFFICIAL_PAGO_MOVIL.phone}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(OFFICIAL_PAGO_MOVIL.phone, "telefono")}
                  className="text-slate-400 hover:text-yellow-300 p-0.5 rounded transition"
                  title="Copiar teléfono"
                >
                  {copiedField === "telefono" ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                </button>
              </div>
            </div>

            {/* Cédula */}
            <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800 flex flex-col justify-between">
              <span className="text-[10px] text-slate-400 font-sans">Cédula:</span>
              <div className="flex items-center justify-between mt-0.5">
                <span className="font-bold text-yellow-300">{OFFICIAL_PAGO_MOVIL.idCard}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(OFFICIAL_PAGO_MOVIL.idCard, "cedula")}
                  className="text-slate-400 hover:text-yellow-300 p-0.5 rounded transition"
                  title="Copiar cédula"
                >
                  {copiedField === "cedula" ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                </button>
              </div>
            </div>
          </div>

          {/* Banner de WhatsApp */}
          <a
            href={OFFICIAL_WHATSAPP.link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-0.5 bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-950 hover:from-emerald-900 hover:to-teal-900 p-2 rounded-xl border border-emerald-500/50 flex items-center justify-between gap-2 text-white transition active:scale-98 group cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-xs shadow">
                <MessageCircle size={14} className="fill-slate-950" />
              </div>
              <span className="text-xs font-fredoka font-bold text-emerald-300 group-hover:text-emerald-200">
                {OFFICIAL_WHATSAPP.displayText}
              </span>
            </div>
            <span className="text-[10px] bg-emerald-500 text-slate-950 font-bold px-2 py-0.5 rounded-lg shadow font-mono">
              Escribir ahora →
            </span>
          </a>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {/* Voucher upload with AI */}
          <div className="bg-slate-950/80 p-3 rounded-2xl border border-dashed border-slate-700 flex flex-col items-center gap-2 text-center">
            {voucherImage ? (
              <div className="relative w-full h-24 rounded-xl overflow-hidden border border-slate-700">
                <img src={voucherImage} alt="Comprobante" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setVoucherImage(null);
                    setScanMessage(null);
                  }}
                  className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full text-xs"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <label className="cursor-pointer flex flex-col items-center gap-1 py-1 w-full">
                <Upload size={22} className="text-emerald-400" />
                <span className="text-xs font-bold text-slate-200">
                  Subir Captura de Pago (Opcional)
                </span>
                <span className="text-[10px] text-amber-300 flex items-center gap-1">
                  <Sparkles size={11} /> Escaneo automático con Gemini AI
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            )}

            {isScanning && (
              <div className="text-xs text-amber-300 flex items-center gap-2 font-fredoka animate-pulse">
                <Loader2 size={13} className="animate-spin" /> {scanMessage}
              </div>
            )}

            {scanMessage && !isScanning && (
              <div className="text-[11px] text-emerald-400 font-bold bg-emerald-950/60 py-1 px-2.5 rounded-xl border border-emerald-800">
                {scanMessage}
              </div>
            )}

            {detectedAiAmount && (
              <div className="flex items-center justify-between bg-slate-900 border border-amber-500/40 p-2 rounded-xl text-xs">
                <span className="text-amber-300">
                  Monto detectado en captura: <strong>{detectedAiAmount.toFixed(2)} VES</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setMonto(String(detectedAiAmount))}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-2 py-0.5 rounded-lg text-[10px] transition"
                >
                  Usar este monto
                </button>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold text-slate-300">
                Monto Exacto a Recargar en VES *
              </label>
              <span className="text-[10px] text-amber-400 font-mono">
                {validMonto > 0 ? `${validMonto.toFixed(2)} VES` : "Indica el monto"}
              </span>
            </div>

            {/* Quick Amount Pickers */}
            <div className="grid grid-cols-5 gap-1.5 mb-2">
              {quickAmounts.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => handleSelectQuickAmount(q)}
                  className={`py-1.5 rounded-xl text-xs font-mono font-bold transition border ${
                    monto === q.toString()
                      ? "bg-amber-500 text-slate-950 border-yellow-300 shadow-md"
                      : "bg-slate-950 text-slate-300 border-slate-800 hover:border-amber-500/50 hover:text-white"
                  }`}
                >
                  {q} Bs
                </button>
              ))}
            </div>

            <input
              type="number"
              step="0.01"
              min="1"
              required
              placeholder="Ej. 500.00"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-amber-300 w-full outline-none focus:border-amber-500 font-mono font-bold"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-300 mb-1 block">
              Número de Referencia Bancaria (Obligatorio) *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. 12345678"
              value={ref}
              onChange={(e) => setRef(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-amber-300 w-full outline-none focus:border-amber-500 font-mono"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-300 mb-1 block">
              Banco Emisor
            </label>
            <select
              value={bank}
              onChange={(e) => setBank(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 w-full outline-none focus:border-amber-500"
            >
              <option value="Banesco">Banesco</option>
              <option value="Banco de Venezuela">Banco de Venezuela (BDV)</option>
              <option value="Mercantil">Banco Mercantil</option>
              <option value="Bancamiga">Bancamiga</option>
              <option value="BBVA Provincial">BBVA Provincial</option>
              <option value="Bancaribe">Bancaribe</option>
              <option value="Otro">Otro Banco</option>
            </select>
          </div>

          {/* Explicit Verification Box */}
          <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-3 flex flex-col gap-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-bold">Monto a Acreditar:</span>
              <span className="font-fredoka text-sm font-black text-emerald-400 font-mono">
                {validMonto.toFixed(2)} VES
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              Este es el monto exacto en Bolívares que se enviará al Administrador. Solo se acreditará lo que sea aprobado.
            </p>
          </div>

          <button
            type="submit"
            className="mt-1 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-fredoka font-bold py-3 rounded-2xl shadow-lg transition active:scale-95 cursor-pointer text-xs flex items-center justify-center gap-1.5"
          >
            <span>Enviar Solicitud ({validMonto > 0 ? `${validMonto.toFixed(2)} VES` : "Completar monto"})</span>
          </button>
        </form>
      </div>
    </div>
  );
};
