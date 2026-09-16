import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "25mb" }));

let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Analyze Pago Móvil Receipt / Voucher
app.post("/api/receipt/analyze", async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType = "image/jpeg" } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: "Missing imageBase64" });
    }

    const ai = getAI();
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");

    const promptText = `
You are an expert banking receipt OCR validator for Venezuelan banking transactions (Pago Móvil, transferencias bancarias como Banesco, Mercantil, BDV, Bancamiga, Provincial, etc.).
Carefully inspect this payment voucher/capture image.
Extract:
- amount: The monetary amount transferred in VES (number only). If not clear, default to 0.
- reference: The transaction reference number / comprobante (string of digits).
- bank: The name of the bank (e.g. "Banesco", "Banco de Venezuela", "Mercantil", "Bancamiga").
- date: Date or timestamp on receipt if visible.
- phoneOrId: Recipient or sender phone or national ID (Cédula) if visible.
- isValidReceipt: boolean indicating if this looks like a genuine bank receipt or transfer capture.
- notes: short summary in Spanish.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: cleanBase64,
            },
          },
          {
            text: promptText,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            amount: { type: Type.NUMBER },
            reference: { type: Type.STRING },
            bank: { type: Type.STRING },
            date: { type: Type.STRING },
            phoneOrId: { type: Type.STRING },
            isValidReceipt: { type: Type.BOOLEAN },
            notes: { type: Type.STRING },
          },
          required: ["amount", "reference", "bank", "isValidReceipt", "notes"],
        },
      },
    });

    const responseText = response.text || "{}";
    const data = JSON.parse(responseText);
    res.json(data);
  } catch (error: any) {
    console.error("Error analyzing receipt:", error);
    res.status(500).json({
      error: "Failed to analyze receipt",
      details: error?.message || String(error),
    });
  }
});

// Vite Middleware integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Bingo el Chamo & Culinary Assistant Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
