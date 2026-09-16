import React, { useState } from "react";
import { X, Upload, Sparkles, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { transactionId: string; monto: number; ref: string; bank: string; voucherImage?: string }) => void;
}

export const RechargeModal: React.FC<Props> = ({ isOpen, onClose, onSubmit }) => {
  const [transactionId] = useState<string>(() => `TRX-REC-${Math.floor(100000 + Math.random() * 900000)}`);
  const [monto, setMonto] = useState("");
  const [ref, setRef] = useState("");
  const [bank, setBank] = useState("Banesco");
  const [voucherImage, setVoucherImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  if (!isOpen) return null;

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
          if (data.amount) setMonto(String(data.amount));
          if (data.reference) setRef(data.reference);
          if (data.bank) setBank(data.bank);
          setScanMessage(`¡Datos detectados con éxito! (${data.bank || "Banco"} - Ref: ${data.reference || "N/A"})`);
        } else {
          setScanMessage("Comprobante subido. Puedes completar los campos manualmente.");
        }
      } catch (err) {
        console.error("AI receipt scan error:", err);
        setScanMessage("Comprobante subido. Ingresa los datos manualmente.");
      } finally {
        setIsScanning(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(monto);
    if (isNaN(num) || num <= 0 || !ref.trim()) {
      alert("Por favor ingresa un monto válido y el número de referencia.");
      return;
    }

    onSubmit({
      transactionId,
      monto: num,
      ref: ref.trim(),
      bank,
      voucherImage: voucherImage || undefined,
    });
    setMonto("");
    setRef("");
    setVoucherImage(null);
    setScanMessage(null);
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

        <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs text-slate-300 flex flex-col gap-1">
          <div className="font-bold text-yellow-300">Datos para Pago Móvil Oficial:</div>
          <div className="text-[11px] font-mono text-slate-300">
            • Banco: Banesco (0134) o Mercantil (0105)<br />
            • Teléfono: 0414-0001234<br />
            • Cédula: V-12.345.678
          </div>
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
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-300 mb-1 block">
              Monto a Recargar en VES *
            </label>
            <input
              type="number"
              step="0.01"
              min="1"
              required
              placeholder="Ej. 60.00"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-amber-300 w-full outline-none focus:border-amber-500 font-mono"
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

          <button
            type="submit"
            className="mt-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-fredoka font-bold py-3 rounded-2xl shadow-lg transition active:scale-95 cursor-pointer text-xs"
          >
            Enviar Solicitud con Referencia
          </button>
        </form>
      </div>
    </div>
  );
};
