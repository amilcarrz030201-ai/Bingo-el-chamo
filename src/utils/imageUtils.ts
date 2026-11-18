// Image compression and avatar presets utility for Bingo el Chamo

export interface PresetAvatar {
  id: string;
  name: string;
  emoji: string;
  bgGradient: string;
  textColor: string;
}

export const PRESET_AVATARS: PresetAvatar[] = [
  { id: "conejito-chamo", name: "Conejito Chamo", emoji: "🐰", bgGradient: "from-amber-400 via-yellow-500 to-amber-600", textColor: "text-slate-950" },
  { id: "ve-tricolor", name: "Venezuela Tricolor", emoji: "🇻🇪", bgGradient: "from-yellow-500 via-blue-600 to-red-600", textColor: "text-white" },
  { id: "chamo-gorra", name: "Chamo Urbano", emoji: "🧢", bgGradient: "from-blue-600 to-indigo-800", textColor: "text-blue-100" },
  { id: "chama-reina", name: "Chama Reina", emoji: "👑", bgGradient: "from-amber-400 to-yellow-600", textColor: "text-slate-950" },
  { id: "guacamaya", name: "Guacamaya Criolla", emoji: "🦜", bgGradient: "from-red-600 via-yellow-500 to-blue-600", textColor: "text-white" },
  { id: "arepa-power", name: "Arepa Criolla", emoji: "🫓", bgGradient: "from-amber-500 to-yellow-700", textColor: "text-amber-100" },
  { id: "diamante-vip", name: "Diamante VIP", emoji: "💎", bgGradient: "from-cyan-400 to-blue-600", textColor: "text-slate-950" },
  { id: "trofeo-oro", name: "Trofeo Campeón", emoji: "🏆", bgGradient: "from-yellow-400 to-amber-600", textColor: "text-slate-950" },
  { id: "dados-suerte", name: "Dados de Oro", emoji: "🎲", bgGradient: "from-red-600 to-rose-800", textColor: "text-white" },
  { id: "plata-bolsa", name: "Plata en Juego", emoji: "💰", bgGradient: "from-emerald-500 to-teal-800", textColor: "text-emerald-100" },
  { id: "estrella-oro", name: "Estrella de la Suerte", emoji: "⭐", bgGradient: "from-yellow-300 to-amber-500", textColor: "text-slate-950" },
  { id: "musico-cuatro", name: "Cuatro y Maraca", emoji: "🪗", bgGradient: "from-orange-500 to-amber-700", textColor: "text-white" },
  { id: "leon-bravo", name: "León Caraqueño", emoji: "🦁", bgGradient: "from-amber-600 to-red-800", textColor: "text-amber-100" },
];

/**
 * Compresses an uploaded image file into a compact, lightweight base64 string
 * suitable for localStorage and instant rendering everywhere.
 */
export async function compressImageFile(
  file: File,
  maxDimension = 280,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    // If not an image, reject
    if (!file.type.startsWith("image/")) {
      reject(new Error("El archivo seleccionado no es una imagen válida."));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("No se pudo leer el archivo de imagen."));

    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Error al procesar la imagen seleccionada."));

      img.onload = () => {
        try {
          // Calculate proportional scale
          let { width, height } = img;
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            // Fallback to raw result if canvas context unavailable
            resolve(event.target?.result as string);
            return;
          }

          // Smooth rendering
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, 0, 0, width, height);

          // Export as JPEG with controlled quality
          const dataUrl = canvas.toDataURL("image/jpeg", quality);
          resolve(dataUrl);
        } catch (err) {
          // Fallback
          resolve(event.target?.result as string);
        }
      };

      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}
