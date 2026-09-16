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
): { isWinner: boolean; patternName?: string; matchedCells: number } {
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

  // Check against all 8 official patterns
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
      return { isWinner: true, patternName: pattern.name, matchedCells };
    }
  }

  return { isWinner: false, matchedCells };
}

export function getBallLetter(num: number): string {
  if (num <= 15) return "B";
  if (num <= 30) return "I";
  if (num <= 45) return "N";
  if (num <= 60) return "G";
  return "O";
}
