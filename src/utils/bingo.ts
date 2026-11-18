import { BingoCard, BingoCell } from "../types";
import { WINNING_PATTERNS } from "../constants/patterns";

// Seeded pseudorandom generator for deterministic 200 cards so cards stay consistent
function pseudoRandom(seed: number) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

function shuffleWithSeed<T>(array: T[], seed: number): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(pseudoRandom(seed + i) * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function generateAllCartons(count: number = 200): BingoCard[] {
  const cards: BingoCard[] = [];

  const bPool = Array.from({ length: 15 }, (_, i) => i + 1); // 1-15
  const iPool = Array.from({ length: 15 }, (_, i) => i + 16); // 16-30
  const nPool = Array.from({ length: 15 }, (_, i) => i + 31); // 31-45
  const gPool = Array.from({ length: 15 }, (_, i) => i + 46); // 46-60
  const oPool = Array.from({ length: 15 }, (_, i) => i + 61); // 61-75

  for (let id = 1; id <= count; id++) {
    const seed = id * 7919;
    const colB = shuffleWithSeed(bPool, seed + 1).slice(0, 5);
    const colI = shuffleWithSeed(iPool, seed + 2).slice(0, 5);
    const colN = shuffleWithSeed(nPool, seed + 3).slice(0, 5);
    const colG = shuffleWithSeed(gPool, seed + 4).slice(0, 5);
    const colO = shuffleWithSeed(oPool, seed + 5).slice(0, 5);

    const matrix: BingoCell[][] = [];

    for (let r = 0; r < 5; r++) {
      const row: BingoCell[] = [];
      for (let c = 0; c < 5; c++) {
        if (r === 2 && c === 2) {
          row.push({ num: "FREE", marcado: true });
        } else {
          let num: number;
          if (c === 0) num = colB[r];
          else if (c === 1) num = colI[r];
          else if (c === 2) num = colN[r];
          else if (c === 3) num = colG[r];
          else num = colO[r];

          row.push({ num, marcado: false });
        }
      }
      matrix.push(row);
    }

    cards.push({ id, numeros: matrix });
  }

  return cards;
}

export function evaluateCardFigure(
  card: BingoCard,
  drawnBalls: number[]
): {
  isWinner: boolean;
  patternName?: string;
  matchedCells: number;
  patternId?: string;
  winningCells?: [number, number][];
} {
  let matchedCells = 0;

  // Build 5x5 boolean matrix of whether cell is marked or drawn
  const hitMatrix: boolean[][] = [];
  for (let r = 0; r < 5; r++) {
    const hitRow: boolean[] = [];
    for (let c = 0; c < 5; c++) {
      const cell = card.numeros[r][c];
      const isHit =
        cell.num === "FREE" ||
        cell.marcado ||
        drawnBalls.includes(cell.num as number);
      if (isHit) matchedCells++;
      hitRow.push(isHit);
    }
    hitMatrix.push(hitRow);
  }

  // 1. Cuadrito Pequeño en Cualquier Lugar (Cualquier bloque 2x2 en el cartón - 16 posiciones)
  const colNames = ["B", "I", "N", "G", "O"];
  for (let r = 0; r <= 3; r++) {
    for (let c = 0; c <= 3; c++) {
      if (
        hitMatrix[r][c] &&
        hitMatrix[r + 1][c] &&
        hitMatrix[r][c + 1] &&
        hitMatrix[r + 1][c + 1]
      ) {
        const touchesFree = r <= 2 && r + 1 >= 2 && c <= 2 && c + 1 >= 2;
        const winningCells: [number, number][] = [
          [r, c],
          [r, c + 1],
          [r + 1, c],
          [r + 1, c + 1],
        ];
        return {
          isWinner: true,
          patternName: `Cuadrito Pequeño 2x2 (Cols ${colNames[c]}-${colNames[c + 1]}, Filas ${r + 1}-${r + 2}${touchesFree ? " • con FREE ⭐" : ""})`,
          patternId: "cuadrito_cualquier_lugar",
          matchedCells,
          winningCells,
        };
      }
    }
  }

  // 2. 4 Esquinas (B1, B5, O1, O5)
  if (
    hitMatrix[0][0] &&
    hitMatrix[0][4] &&
    hitMatrix[4][0] &&
    hitMatrix[4][4]
  ) {
    return {
      isWinner: true,
      patternName: "4 Esquinas",
      patternId: "cuatro_esquinas",
      matchedCells,
      winningCells: [
        [0, 0],
        [0, 4],
        [4, 0],
        [4, 4],
      ],
    };
  }

  // 3. Líneas de Esquina a Esquina (Diagonales con FREE ⭐)
  const diagDescFull =
    hitMatrix[0][0] &&
    hitMatrix[1][1] &&
    hitMatrix[2][2] &&
    hitMatrix[3][3] &&
    hitMatrix[4][4];

  const diagAscFull =
    hitMatrix[0][4] &&
    hitMatrix[1][3] &&
    hitMatrix[2][2] &&
    hitMatrix[3][1] &&
    hitMatrix[4][0];

  if (diagDescFull) {
    const winningCells: [number, number][] = [
      [0, 0], [1, 1], [2, 2], [3, 3], [4, 4],
    ];
    return {
      isWinner: true,
      patternName: "Línea Diagonal de Esquina a Esquina (B1 a O5 por FREE ⭐)",
      patternId: "linea_diagonal",
      matchedCells,
      winningCells,
    };
  } else if (diagAscFull) {
    const winningCells: [number, number][] = [
      [0, 4], [1, 3], [2, 2], [3, 1], [4, 0],
    ];
    return {
      isWinner: true,
      patternName: "Línea Diagonal de Esquina a Esquina (B5 a O1 por FREE ⭐)",
      patternId: "linea_diagonal",
      matchedCells,
      winningCells,
    };
  }

  // 4. Líneas Horizontales (Cualquiera de las 5 filas completas o Doble Línea)
  const fullRows: number[] = [];
  for (let r = 0; r < 5; r++) {
    let rowFull = true;
    for (let c = 0; c < 5; c++) {
      if (!hitMatrix[r][c]) {
        rowFull = false;
        break;
      }
    }
    if (rowFull) fullRows.push(r);
  }

  if (fullRows.length >= 2) {
    const winningCells: [number, number][] = [];
    fullRows.forEach((r) => {
      for (let c = 0; c < 5; c++) winningCells.push([r, c]);
    });
    return {
      isWinner: true,
      patternName: `Doble Línea Horizontal (${fullRows.length} Filas Completas)`,
      patternId: "doble_linea",
      matchedCells,
      winningCells,
    };
  } else if (fullRows.length === 1) {
    const r = fullRows[0];
    const rowLabels = [
      "Fila 1 (Superior)",
      "Fila 2",
      "Fila 3 (Central con FREE ⭐)",
      "Fila 4",
      "Fila 5 (Inferior)",
    ];
    const winningCells: [number, number][] = [
      [r, 0], [r, 1], [r, 2], [r, 3], [r, 4],
    ];
    return {
      isWinner: true,
      patternName: `Línea Horizontal (${rowLabels[r]})`,
      patternId: "linea_horizontal",
      matchedCells,
      winningCells,
    };
  }

  // 6. Líneas Verticales (Cualquiera de las 5 columnas completas o Doble Columna)
  const fullCols: number[] = [];
  for (let c = 0; c < 5; c++) {
    let colFull = true;
    for (let r = 0; r < 5; r++) {
      if (!hitMatrix[r][c]) {
        colFull = false;
        break;
      }
    }
    if (colFull) fullCols.push(c);
  }

  if (fullCols.length >= 2) {
    const winningCells: [number, number][] = [];
    fullCols.forEach((c) => {
      for (let r = 0; r < 5; r++) winningCells.push([r, c]);
    });
    return {
      isWinner: true,
      patternName: `Doble Línea Vertical (${fullCols.length} Columnas Completas)`,
      patternId: "doble_linea",
      matchedCells,
      winningCells,
    };
  } else if (fullCols.length === 1) {
    const c = fullCols[0];
    const colLabels = [
      "Columna B",
      "Columna I",
      "Columna N (Central con FREE ⭐)",
      "Columna G",
      "Columna O",
    ];
    const winningCells: [number, number][] = [
      [0, c], [1, c], [2, c], [3, c], [4, c],
    ];
    return {
      isWinner: true,
      patternName: `Línea Vertical (${colLabels[c]})`,
      patternId: "linea_vertical",
      matchedCells,
      winningCells,
    };
  }

  // Fallback a patrones estáticos de WINNING_PATTERNS
  for (const pattern of WINNING_PATTERNS) {
    let patternSatisfied = true;
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        if (pattern.grid[r][c] === 1 && !hitMatrix[r][c]) {
          patternSatisfied = false;
          break;
        }
      }
      if (!patternSatisfied) break;
    }

    if (patternSatisfied) {
      const winningCells: [number, number][] = [];
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
          if (pattern.grid[r][c] === 1) {
            winningCells.push([r, c]);
          }
        }
      }
      return {
        isWinner: true,
        patternName: pattern.name,
        patternId: pattern.id,
        matchedCells,
        winningCells,
      };
    }
  }

  return { isWinner: false, matchedCells };
}

export interface DetailedBingoEvaluation {
  isWinner: boolean;
  patternName?: string;
  patternId?: string;
  matchedCells: number;
  winningCells?: [number, number][];
  completedAtBallIndex?: number;
  completedAtBall?: number;
  missedBalls: number;
  didMissOpportunity: boolean;
}

export function evaluateCardFigureDetailed(
  card: BingoCard,
  drawnBalls: number[]
): DetailedBingoEvaluation {
  const currentEval = evaluateCardFigure(card, drawnBalls);
  if (!currentEval.isWinner || drawnBalls.length === 0) {
    return {
      isWinner: false,
      matchedCells: currentEval.matchedCells,
      missedBalls: 0,
      didMissOpportunity: false,
    };
  }

  // Determine earliest ball in drawnBalls sequence that completed the pattern
  let completedIndex = drawnBalls.length - 1;
  for (let i = 1; i <= drawnBalls.length; i++) {
    const subBalls = drawnBalls.slice(0, i);
    const subEval = evaluateCardFigure(card, subBalls);
    if (subEval.isWinner) {
      completedIndex = i - 1;
      break;
    }
  }

  const completedAtBall = drawnBalls[completedIndex];
  const missedBalls = Math.max(0, drawnBalls.length - 1 - completedIndex);

  return {
    isWinner: true,
    patternName: currentEval.patternName,
    patternId: currentEval.patternId,
    matchedCells: currentEval.matchedCells,
    winningCells: currentEval.winningCells,
    completedAtBallIndex: completedIndex,
    completedAtBall,
    missedBalls,
    didMissOpportunity: missedBalls > 0,
  };
}

export function getBallLetter(num: number): string {
  if (num <= 15) return "B";
  if (num <= 30) return "I";
  if (num <= 45) return "N";
  if (num <= 60) return "G";
  return "O";
}

export interface LuckMeterInfo {
  percentage: number; // 0 to 100
  missingCount: number; // minimum missing numbers to complete any figure
  bestCardId: number | null;
  patternName: string | null;
  patternId: string | null;
  neededNumbers: number[]; // exact balls needed to complete that figure
  temperatureLabel: string;
  statusBadge: string;
  temperatureDegrees: number;
  colorTheme: "fire" | "hot" | "warm" | "cool" | "cold";
  activeCardsCount: number;
}

export function calculateLuckMeter(
  cards: BingoCard[],
  drawnBalls: number[]
): LuckMeterInfo {
  if (!cards || cards.length === 0) {
    return {
      percentage: 0,
      missingCount: -1,
      bestCardId: null,
      patternName: null,
      patternId: null,
      neededNumbers: [],
      temperatureLabel: "Inactivo (Sin cartones)",
      statusBadge: "❄️ Sin Cartones Activos",
      temperatureDegrees: 0,
      colorTheme: "cold",
      activeCardsCount: 0,
    };
  }

  let bestMissing = 999;
  let bestCardId: number | null = null;
  let bestPatternName: string | null = null;
  let bestPatternId: string | null = null;
  let bestNeededNumbers: number[] = [];

  for (const card of cards) {
    // 1. Cuadritos en Cualquier Lugar (16 positions of 2x2)
    for (let r = 0; r <= 3; r++) {
      for (let c = 0; c <= 3; c++) {
        const positions = [
          [r, c],
          [r + 1, c],
          [r, c + 1],
          [r + 1, c + 1],
        ];
        const unhit: number[] = [];
        for (const [pr, pc] of positions) {
          const cell = card.numeros[pr][pc];
          const isHit =
            cell.num === "FREE" ||
            cell.marcado ||
            drawnBalls.includes(cell.num as number);
          if (!isHit && typeof cell.num === "number") {
            unhit.push(cell.num);
          }
        }
        if (unhit.length < bestMissing) {
          bestMissing = unhit.length;
          bestCardId = card.id;
          bestPatternName = `Cuadrito (Fila ${r + 1}-${r + 2}, Col ${c + 1}-${c + 2})`;
          bestPatternId = "cuadrito_cualquier_lugar";
          bestNeededNumbers = unhit;
        }
      }
    }

    // 2. 4 Esquinas
    const cornerPositions = [
      [0, 0],
      [0, 4],
      [4, 0],
      [4, 4],
    ];
    const unhitCorners: number[] = [];
    for (const [cr, cc] of cornerPositions) {
      const cell = card.numeros[cr][cc];
      const isHit =
        cell.num === "FREE" ||
        cell.marcado ||
        drawnBalls.includes(cell.num as number);
      if (!isHit && typeof cell.num === "number") {
        unhitCorners.push(cell.num);
      }
    }
    if (unhitCorners.length < bestMissing) {
      bestMissing = unhitCorners.length;
      bestCardId = card.id;
      bestPatternName = "4 Esquinas";
      bestPatternId = "cuatro_esquinas";
      bestNeededNumbers = unhitCorners;
    }

    // 3. Líneas Horizontales (5 rows)
    const rowLabels = [
      "Fila 1 (Superior)",
      "Fila 2",
      "Fila 3 (Central)",
      "Fila 4",
      "Fila 5 (Inferior)",
    ];
    for (let r = 0; r < 5; r++) {
      const unhitRow: number[] = [];
      for (let c = 0; c < 5; c++) {
        const cell = card.numeros[r][c];
        const isHit =
          cell.num === "FREE" ||
          cell.marcado ||
          drawnBalls.includes(cell.num as number);
        if (!isHit && typeof cell.num === "number") {
          unhitRow.push(cell.num);
        }
      }
      if (unhitRow.length < bestMissing) {
        bestMissing = unhitRow.length;
        bestCardId = card.id;
        bestPatternName = `Línea Horizontal (${rowLabels[r]})`;
        bestPatternId = "linea_horizontal";
        bestNeededNumbers = unhitRow;
      }
    }

    // 4. Líneas Verticales (5 columns)
    const colLabels = [
      "Columna B",
      "Columna I",
      "Columna N",
      "Columna G",
      "Columna O",
    ];
    for (let c = 0; c < 5; c++) {
      const unhitCol: number[] = [];
      for (let r = 0; r < 5; r++) {
        const cell = card.numeros[r][c];
        const isHit =
          cell.num === "FREE" ||
          cell.marcado ||
          drawnBalls.includes(cell.num as number);
        if (!isHit && typeof cell.num === "number") {
          unhitCol.push(cell.num);
        }
      }
      if (unhitCol.length < bestMissing) {
        bestMissing = unhitCol.length;
        bestCardId = card.id;
        bestPatternName = `Línea Vertical (${colLabels[c]})`;
        bestPatternId = "linea_vertical";
        bestNeededNumbers = unhitCol;
      }
    }

    // 5. Diagonales de Esquina a Esquina (Descendente y Ascendente)
    const diagDescPos = [[0, 0], [1, 1], [2, 2], [3, 3], [4, 4]];
    const unhitDiag1: number[] = [];
    for (const [dr, dc] of diagDescPos) {
      const cell = card.numeros[dr][dc];
      const isHit =
        cell.num === "FREE" ||
        cell.marcado ||
        drawnBalls.includes(cell.num as number);
      if (!isHit && typeof cell.num === "number") unhitDiag1.push(cell.num);
    }
    if (unhitDiag1.length < bestMissing) {
      bestMissing = unhitDiag1.length;
      bestCardId = card.id;
      bestPatternName = "Línea Diagonal (B1 a O5)";
      bestPatternId = "linea_diagonal";
      bestNeededNumbers = unhitDiag1;
    }

    const diagAscPos = [[0, 4], [1, 3], [2, 2], [3, 1], [4, 0]];
    const unhitDiag2: number[] = [];
    for (const [dr, dc] of diagAscPos) {
      const cell = card.numeros[dr][dc];
      const isHit =
        cell.num === "FREE" ||
        cell.marcado ||
        drawnBalls.includes(cell.num as number);
      if (!isHit && typeof cell.num === "number") unhitDiag2.push(cell.num);
    }
    if (unhitDiag2.length < bestMissing) {
      bestMissing = unhitDiag2.length;
      bestCardId = card.id;
      bestPatternName = "Línea Diagonal (B5 a O1)";
      bestPatternId = "linea_diagonal";
      bestNeededNumbers = unhitDiag2;
    }

    // 6. Otras Figuras de WINNING_PATTERNS
    for (const pat of WINNING_PATTERNS) {
      if (
        pat.id === "cuadrito_cualquier_lugar" ||
        pat.id === "cuatro_esquinas" ||
        pat.id === "linea_diagonal"
      ) {
        continue;
      }
      const unhitPat: number[] = [];
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
          if (pat.grid[r][c] === 1) {
            const cell = card.numeros[r][c];
            const isHit =
              cell.num === "FREE" ||
              cell.marcado ||
              drawnBalls.includes(cell.num as number);
            if (!isHit && typeof cell.num === "number") {
              unhitPat.push(cell.num);
            }
          }
        }
      }
      if (unhitPat.length < bestMissing) {
        bestMissing = unhitPat.length;
        bestCardId = card.id;
        bestPatternName = pat.name;
        bestPatternId = pat.id;
        bestNeededNumbers = unhitPat;
      }
    }
  }

  // Calculate percentage, degrees, and theme according to missing count
  let percentage = 0;
  let temperatureDegrees = 15;
  let temperatureLabel = "Fresco";
  let statusBadge = "❄️ Esperando";
  let colorTheme: "fire" | "hot" | "warm" | "cool" | "cold" = "cold";

  if (bestMissing === 0) {
    percentage = 100;
    temperatureDegrees = 100;
    temperatureLabel = "¡HIRVIENDO! ¡BINGO!";
    statusBadge = "🏆 ¡BINGO COMPLETO!";
    colorTheme = "fire";
  } else if (bestMissing === 1) {
    percentage = 95;
    temperatureDegrees = 95;
    temperatureLabel = "¡Al Rojo Vivo!";
    statusBadge = "🔥 ¡A 1 SOLO NÚMERO!";
    colorTheme = "fire";
  } else if (bestMissing === 2) {
    percentage = 78;
    temperatureDegrees = 78;
    temperatureLabel = "¡Muy Caliente!";
    statusBadge = "⚡ A 2 NÚMEROS";
    colorTheme = "hot";
  } else if (bestMissing === 3) {
    percentage = 58;
    temperatureDegrees = 58;
    temperatureLabel = "Tibio / En Racha";
    statusBadge = "✨ A 3 NÚMEROS";
    colorTheme = "warm";
  } else if (bestMissing === 4) {
    percentage = 38;
    temperatureDegrees = 38;
    temperatureLabel = "Comenzando a Calentar";
    statusBadge = "🎯 A 4 NÚMEROS";
    colorTheme = "cool";
  } else {
    // 5 or more missing
    percentage = Math.max(15, 30 - bestMissing * 2);
    temperatureDegrees = 20;
    temperatureLabel = "Fresco";
    statusBadge = `❄️ A ${bestMissing} números`;
    colorTheme = "cold";
  }

  return {
    percentage,
    missingCount: bestMissing,
    bestCardId,
    patternName: bestPatternName,
    patternId: bestPatternId,
    neededNumbers: bestNeededNumbers,
    temperatureLabel,
    statusBadge,
    temperatureDegrees,
    colorTheme,
    activeCardsCount: cards.length,
  };
}
