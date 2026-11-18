import express, { Request, Response } from "express";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import JSZip from "jszip";
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

// Helper to collect all project source & config files with relative paths
const EXCLUDED_DIRS = new Set(["node_modules", "dist", ".git", ".vite", ".expo"]);
const EXCLUDED_FILES = new Set([
  "CONSOLIDATED_CODEBASE.txt",
  "BingoElChamo_ProyectoCompleto.zip",
  ".env",
  ".env.local",
]);

function collectProjectFiles(rootDir: string, currentDir: string = rootDir): string[] {
  const results: string[] = [];
  const entries = fs.readdirSync(currentDir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(currentDir, entry.name);
    const relPath = path.relative(rootDir, fullPath).replace(/\\/g, "/");
    if (entry.isDirectory()) {
      if (EXCLUDED_DIRS.has(entry.name) || relPath === "public/assets/aistudio") continue;
      results.push(...collectProjectFiles(rootDir, fullPath));
    } else if (entry.isFile()) {
      if (EXCLUDED_FILES.has(entry.name) || entry.name.endsWith(".log")) continue;
      results.push(relPath);
    }
  }
  return results.sort();
}

// Download Complete Codebase endpoint (Single text file)
app.get("/api/download/codebase", (_req: Request, res: Response) => {
  const filePath = path.join(process.cwd(), "CONSOLIDATED_CODEBASE.txt");
  res.download(filePath, "BingoElChamo_CodigoCompleto.txt");
});

app.get("/CONSOLIDATED_CODEBASE.txt", (_req: Request, res: Response) => {
  const filePath = path.join(process.cwd(), "CONSOLIDATED_CODEBASE.txt");
  res.sendFile(filePath);
});

// Cached in-memory ZIP buffer for instant responses
let cachedZipBuffer: Buffer | null = null;
let zipBuildPromise: Promise<Buffer> | null = null;

async function getProjectZipBuffer(forceRebuild = false): Promise<Buffer> {
  if (cachedZipBuffer && !forceRebuild) {
    return cachedZipBuffer;
  }
  if (zipBuildPromise && !forceRebuild) {
    return zipBuildPromise;
  }
  zipBuildPromise = (async () => {
    const rootDir = process.cwd();
    const files = collectProjectFiles(rootDir);
    const zip = new JSZip();

    for (const relPath of files) {
      const fullPath = path.join(rootDir, relPath);
      const content = fs.readFileSync(fullPath);
      zip.file(relPath, content);
    }

    const buffer = await zip.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE",
      compressionOptions: { level: 1 },
    });
    cachedZipBuffer = buffer;
    zipBuildPromise = null;
    return buffer;
  })();
  return zipBuildPromise;
}

// Download ALL updated project files in a ZIP preserving exact filenames & folders
const handleZipDownload = async (req: Request, res: Response) => {
  try {
    const force = req.query.refresh === "1";
    const zipBuffer = await getProjectZipBuffer(force);

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", 'attachment; filename="BingoElChamo_ProyectoCompleto.zip"');
    res.setHeader("Content-Length", String(zipBuffer.length));
    res.send(zipBuffer);
  } catch (err: any) {
    zipBuildPromise = null;
    console.error("Error generating ZIP:", err);
    res.status(500).json({ error: "No se pudo generar el archivo ZIP", details: err?.message });
  }
};

app.get("/api/download/zip", handleZipDownload);
app.get("/BingoElChamo_ProyectoCompleto.zip", handleZipDownload);

// List all project files with sizes
app.get("/api/files", (_req: Request, res: Response) => {
  try {
    const rootDir = process.cwd();
    const files = collectProjectFiles(rootDir).map((relPath) => {
      const stat = fs.statSync(path.join(rootDir, relPath));
      return { path: relPath, size: stat.size };
    });
    res.json({ count: files.length, files });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Error listing files" });
  }
});

// Download a single project file keeping its exact filename
app.get("/api/files/download", (req: Request, res: Response) => {
  const requested = typeof req.query.path === "string" ? req.query.path : "";
  if (!requested) {
    return res.status(400).json({ error: "Missing path parameter" });
  }
  const rootDir = path.resolve(process.cwd());
  const normalizedRel = requested.replace(/\\/g, "/").replace(/^\/+/, "");
  const allowedFiles = new Set(collectProjectFiles(rootDir));
  if (!allowedFiles.has(normalizedRel)) {
    return res.status(404).json({ error: "File not found or not accessible" });
  }
  const fullPath = path.resolve(rootDir, normalizedRel);
  if (!fullPath.startsWith(rootDir + path.sep)) {
    return res.status(403).json({ error: "Forbidden path" });
  }
  const fileName = path.basename(fullPath);
  res.download(fullPath, fileName);
});

// HTML portal to download ZIP or individual files with their exact names
app.get("/descargar", (_req: Request, res: Response) => {
  const rootDir = process.cwd();
  const files = collectProjectFiles(rootDir);
  const rowsHtml = files
    .map((relPath) => {
      const stat = fs.statSync(path.join(rootDir, relPath));
      const kb = (stat.size / 1024).toFixed(1);
      const encoded = encodeURIComponent(relPath);
      return `<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 14px;border-bottom:1px solid #1e293b;">
        <div style="min-width:0;">
          <div style="font-family:monospace;font-size:13px;color:#f8fafc;word-break:break-all;">${relPath}</div>
          <div style="font-size:11px;color:#94a3b8;">${kb} KB</div>
        </div>
        <a href="/api/files/download?path=${encoded}" style="flex-shrink:0;background:#1e293b;border:1px solid #334155;color:#fde047;text-decoration:none;padding:6px 12px;border-radius:8px;font-size:12px;font-weight:700;">Descargar</a>
      </div>`;
    })
    .join("");

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(`<!doctype html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Descargar Archivos — Bingo el Chamo Navideño</title>
</head>
<body style="margin:0;background:#020617;color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;padding:24px;">
  <div style="max-width:860px;margin:0 auto;">
    <h1 style="margin:0 0 8px;color:#fde047;font-size:24px;">Bingo el Chamo Navideño — Descarga de Archivos</h1>
    <p style="margin:0 0 20px;color:#cbd5e1;font-size:14px;">Total de archivos actualizados: <strong>${files.length}</strong>. Cada archivo conserva su nombre y ruta exacta.</p>
    <div style="display:flex;flex-wrap:wrap;gap:12px;margin-bottom:24px;">
      <a href="/api/download/zip" style="background:#f59e0b;color:#020617;text-decoration:none;padding:12px 18px;border-radius:12px;font-weight:800;font-size:14px;">⬇ Descargar TODOS en .ZIP (con carpetas y nombres)</a>
      <a href="/api/download/apk-html" style="background:#10b981;color:#022c22;text-decoration:none;padding:12px 18px;border-radius:12px;font-weight:800;font-size:14px;">📱 Descargar index.html único (FreeWebToApk)</a>
      <a href="/api/download/codebase" style="background:#1e293b;color:#e2e8f0;border:1px solid #334155;text-decoration:none;padding:12px 18px;border-radius:12px;font-weight:700;font-size:14px;">📄 Descargar .TXT unificado</a>
    </div>
    <div style="background:#0f172a;border:1px solid #1e293b;border-radius:16px;overflow:hidden;">
      ${rowsHtml}
    </div>
  </div>
</body>
</html>`);
});

// Download standalone single-file HTML for FreeWebToApk
app.get("/api/download/apk-html", (_req: Request, res: Response) => {
  const filePath = path.join(process.cwd(), "dist", "index.html");
  res.download(filePath, "index.html");
});

// Presence in-memory storage
interface ServerPresence {
  email: string;
  name: string;
  avatar?: string;
  lastActiveAt: number;
  isOnline: boolean;
  role?: string;
}

const presenceStore = new Map<string, ServerPresence>();

// Presence Endpoints
app.get("/api/presence", (_req: Request, res: Response) => {
  res.json(Array.from(presenceStore.values()));
});

app.post("/api/presence/heartbeat", (req: Request, res: Response) => {
  const { email, name, avatar, isOnline = true, role = "PLAYER" } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Missing email" });
  }
  const cleanEmail = email.toLowerCase().trim();
  const existing = presenceStore.get(cleanEmail);
  const updated: ServerPresence = {
    email: cleanEmail,
    name: name || existing?.name || cleanEmail.split("@")[0],
    avatar: avatar || existing?.avatar || "👤",
    lastActiveAt: Date.now(),
    isOnline: isOnline === true,
    role: role || existing?.role || "PLAYER",
  };
  presenceStore.set(cleanEmail, updated);
  res.json({ success: true, presence: updated });
});

app.post("/api/presence/disconnect", (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Missing email" });
  }
  const cleanEmail = email.toLowerCase().trim();
  const existing = presenceStore.get(cleanEmail);
  if (existing) {
    existing.isOnline = false;
    existing.lastActiveAt = Date.now();
    presenceStore.set(cleanEmail, existing);
  }
  res.json({ success: true });
});

// Chat in-memory storage
interface ServerChatMessage {
  id: string;
  senderEmail: string;
  senderName: string;
  senderAvatar?: string;
  role?: string;
  text: string;
  timestamp: string | number;
  badge?: string;
}

const chatStore: ServerChatMessage[] = [
  {
    id: "msg-welcome-1",
    senderEmail: "admin@bingoelchamo.com",
    senderName: "Bingo el Chamo Oficial",
    senderAvatar: "👑",
    role: "ADMIN",
    text: "¡Bienvenidos al Chat en Vivo de jugadores! Que disfruten las partidas y canten muchos Bingos.",
    timestamp: new Date().toISOString(),
    badge: "Administrador",
  },
];

function getLatestSundayMidnight(now: Date = new Date()): number {
  const d = new Date(now);
  const day = d.getDay(); // 0 is Sunday
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function getNextSundayMidnight(now: Date = new Date()): number {
  const d = new Date(now);
  const day = d.getDay();
  const daysUntilNextSunday = day === 0 ? 7 : 7 - day;
  d.setDate(d.getDate() + daysUntilNextSunday);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function purgeSundayChatMessages(): void {
  const cutoff = getLatestSundayMidnight();
  // Filter out any user messages sent before the most recent Sunday 00:00:00 AM
  const filtered = chatStore.filter((msg) => {
    if (msg.role === "ADMIN" && msg.id.startsWith("msg-welcome")) {
      return true;
    }
    const msgTime = new Date(msg.timestamp).getTime();
    return !isNaN(msgTime) && msgTime >= cutoff;
  });

  if (filtered.length !== chatStore.length) {
    chatStore.length = 0;
    if (filtered.length === 0) {
      chatStore.push({
        id: `msg-welcome-${Date.now()}`,
        senderEmail: "admin@bingoelchamo.com",
        senderName: "Bingo el Chamo Oficial",
        senderAvatar: "👑",
        role: "ADMIN",
        text: "¡Chat semanal reiniciado! Los mensajes de los usuarios se borran automáticamente los domingos a las 00:00 AM en tiempo real.",
        timestamp: new Date().toISOString(),
        badge: "Administrador",
      });
    } else {
      chatStore.push(...filtered);
    }
  }
}

// Initial purge at startup
purgeSundayChatMessages();

// Real-time check every 2 seconds to purge immediately when Sunday 00:00:00 AM arrives
setInterval(purgeSundayChatMessages, 2000);

app.get("/api/chat", (_req: Request, res: Response) => {
  purgeSundayChatMessages();
  res.json(chatStore);
});

app.post("/api/chat", (req: Request, res: Response) => {
  purgeSundayChatMessages();
  const { senderEmail, senderName, senderAvatar, role = "PLAYER", text, badge } = req.body;
  if (!text || typeof text !== "string" || !text.trim()) {
    return res.status(400).json({ error: "Message text cannot be empty" });
  }

  const cleanEmail = (senderEmail || "anonimo@bingo.com").toLowerCase().trim();
  const newMsg: ServerChatMessage = {
    id: `msg-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    senderEmail: cleanEmail,
    senderName: senderName || cleanEmail.split("@")[0],
    senderAvatar: senderAvatar || "👤",
    role,
    text: text.trim().slice(0, 300), // Max 300 chars per message
    timestamp: new Date().toISOString(),
    badge: badge || undefined,
  };

  chatStore.push(newMsg);
  // Keep last 150 messages
  if (chatStore.length > 150) {
    chatStore.splice(0, chatStore.length - 150);
  }

  // Also update sender presence as active right now
  presenceStore.set(cleanEmail, {
    email: cleanEmail,
    name: senderName || cleanEmail.split("@")[0],
    avatar: senderAvatar || "👤",
    lastActiveAt: Date.now(),
    isOnline: true,
    role,
  });

  res.json({ success: true, message: newMsg, messages: chatStore });
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
- amount: The monetary amount transferred in VES (number only). CRITICAL: In Venezuelan bank receipts, decimals use comma (e.g. "Bs. 500,00" = 500 VES, "Bs. 75,00" = 75 VES). Do NOT confuse phone numbers (e.g. 0414-75...), dates, or transaction reference numbers with the amount. If the amount is ambiguous, default to 0.
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

// Global Game Winner Synchronization Endpoints
let activeWinnerAnnouncement: any = null;

app.get("/api/game/winner", (_req: Request, res: Response) => {
  res.json({ announcement: activeWinnerAnnouncement });
});

app.post("/api/game/winner", (req: Request, res: Response) => {
  activeWinnerAnnouncement = req.body;
  res.json({ success: true, announcement: activeWinnerAnnouncement });
});

app.delete("/api/game/winner", (_req: Request, res: Response) => {
  activeWinnerAnnouncement = null;
  res.json({ success: true });
});

// Global Next Game Timer Synchronization Endpoints
interface GameTimerState {
  remainingSeconds: number;
  configuredDuration: number;
  isPaused: boolean;
  targetTimestamp: number;
  lastUpdated: number;
  gameRound: number;
}

let gameTimerState: GameTimerState = {
  remainingSeconds: 1800,
  configuredDuration: 1800,
  isPaused: false,
  targetTimestamp: Date.now() + 1800 * 1000,
  lastUpdated: Date.now(),
  gameRound: 1,
};

// Global Tombola State Synchronization
interface TombolaState {
  drawnBalls: number[];
  currentBall: number | null;
  autoMode: boolean;
  isGameCompleted: boolean;
  drawIntervalSeconds: number;
  lastUpdated: number;
  gameId: string;
}

let tombolaState: TombolaState = {
  drawnBalls: [],
  currentBall: null,
  autoMode: false,
  isGameCompleted: false,
  drawIntervalSeconds: 4,
  lastUpdated: Date.now(),
  gameId: `game-${Date.now()}`,
};

app.get("/api/game/timer", (_req: Request, res: Response) => {
  const now = Date.now();
  if (!gameTimerState.isPaused && gameTimerState.targetTimestamp) {
    const diff = Math.max(0, Math.ceil((gameTimerState.targetTimestamp - now) / 1000));
    gameTimerState.remainingSeconds = diff;
  }
  res.json({
    ...gameTimerState,
    serverTime: now,
  });
});

app.post("/api/game/timer", (req: Request, res: Response) => {
  const { remainingSeconds, configuredDuration, isPaused, gameRound } = req.body || {};
  const now = Date.now();

  if (typeof configuredDuration === "number" && configuredDuration > 0) {
    gameTimerState.configuredDuration = Math.min(86400, Math.max(5, Math.round(configuredDuration)));
  }

  if (typeof isPaused === "boolean") {
    gameTimerState.isPaused = isPaused;
    if (isPaused) {
      // Freeze remaining seconds at current point
      if (gameTimerState.targetTimestamp) {
        const diff = Math.max(0, Math.ceil((gameTimerState.targetTimestamp - now) / 1000));
        gameTimerState.remainingSeconds = diff;
      }
    } else {
      // Resume target timestamp from current remaining seconds
      gameTimerState.targetTimestamp = now + gameTimerState.remainingSeconds * 1000;
    }
  }

  if (typeof remainingSeconds === "number") {
    const safeRemaining = Math.max(0, Math.round(remainingSeconds));
    gameTimerState.remainingSeconds = safeRemaining;
    if (!gameTimerState.isPaused) {
      gameTimerState.targetTimestamp = now + safeRemaining * 1000;
    }
  } else if (!gameTimerState.isPaused && !isPaused) {
    gameTimerState.targetTimestamp = now + gameTimerState.remainingSeconds * 1000;
  }

  if (typeof gameRound === "number") {
    gameTimerState.gameRound = gameRound;
  }

  gameTimerState.lastUpdated = now;
  res.json({ success: true, timer: { ...gameTimerState, serverTime: now } });
});

// Global Tombola Endpoints
app.get("/api/game/tombola", (_req: Request, res: Response) => {
  res.json(tombolaState);
});

app.post("/api/game/tombola", (req: Request, res: Response) => {
  const { drawnBalls, currentBall, autoMode, isGameCompleted, drawIntervalSeconds, gameId } = req.body || {};
  if (Array.isArray(drawnBalls)) {
    tombolaState.drawnBalls = drawnBalls;
  }
  if (currentBall !== undefined) {
    tombolaState.currentBall = currentBall;
  }
  if (typeof autoMode === "boolean") {
    tombolaState.autoMode = autoMode;
  }
  if (typeof isGameCompleted === "boolean") {
    tombolaState.isGameCompleted = isGameCompleted;
  }
  if (typeof drawIntervalSeconds === "number") {
    tombolaState.drawIntervalSeconds = drawIntervalSeconds;
  }
  if (typeof gameId === "string" && gameId) {
    tombolaState.gameId = gameId;
  }
  tombolaState.lastUpdated = Date.now();
  res.json({ success: true, tombola: tombolaState });
});

app.delete("/api/game/tombola", (_req: Request, res: Response) => {
  tombolaState = {
    drawnBalls: [],
    currentBall: null,
    autoMode: false,
    isGameCompleted: false,
    drawIntervalSeconds: tombolaState.drawIntervalSeconds,
    lastUpdated: Date.now(),
    gameId: `game-${Date.now()}`,
  };
  res.json({ success: true, tombola: tombolaState });
});

// Global Torneo Billetal State Synchronization
interface TorneoBilletalState {
  isEnabled: boolean;
  title: string;
  prizeVES: number;
  entryFeeVES: number;
  scheduledTime: string;
  rulesDescription: string;
  minPlayers: number;
  maxPlayers: number;
  registeredCount: number;
  registeredUsers?: string[];
  lastUpdated: number;
  adminNote?: string;
}

let torneoBilletalState: TorneoBilletalState = {
  isEnabled: false, // Default cerrado para usuarios hasta que el administrador lo active
  title: "Gran Torneo Billetal - Bingo el Chamo",
  prizeVES: 15000,
  entryFeeVES: 100,
  scheduledTime: "Sábado Especial 8:00 PM (Hora VE)",
  rulesDescription: "Modalidad Cartón Lleno de Alta Premiación. Pozo garantizado en Bolívares. Solo jugadores con saldo verificado.",
  minPlayers: 5,
  maxPlayers: 100,
  registeredCount: 0,
  registeredUsers: [],
  lastUpdated: Date.now(),
  adminNote: "Inscripciones y acceso gestionados directamente por el Administrador Oficial.",
};

app.get("/api/torneo", (_req: Request, res: Response) => {
  res.json(torneoBilletalState);
});

app.post("/api/torneo", (req: Request, res: Response) => {
  torneoBilletalState = {
    ...torneoBilletalState,
    ...req.body,
    lastUpdated: Date.now(),
  };
  res.json({ success: true, torneo: torneoBilletalState });
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
    console.log(`Bingo el Chamo Server running on http://0.0.0.0:${PORT}`);
    // Pre-warm ZIP archive in background so /api/download/zip responds instantaneously
    getProjectZipBuffer().catch((err) => {
      console.warn("ZIP pre-warm notice:", err);
    });
  });
}

startServer();
