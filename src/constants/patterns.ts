import { WinningPattern } from "../types";

export const WINNING_PATTERNS: WinningPattern[] = [
  {
    id: "cuadrito_cualquier_lugar",
    name: "Cuadrito Pequeño (En Cualquier Lugar)",
    description: "Bloque de 2x2 casillas en cualquier sector del cartón (16 formas de ganar)",
    category: "Cuadros",
    badge: "16 Formas Válidas",
    variationsCount: 16,
    details: "En Bingo el Chamo puedes ganar con Cuadrito Pequeño (bloque de 2x2 casillas) en CUALQUIER lugar del cartón (16 combinaciones posibles: esquinas, bordes o centro). Si el cuadrito abarca la casilla central (FREE ⭐), ¡solo necesitas 3 números marcados para cantar Bingo!",
    grid: [
      [1, 1, 0, 0, 0],
      [1, 1, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
    ],
    alternateGrids: [
      {
        title: "1. Esquina Superior Izquierda (B1, B2, I1, I2)",
        grid: [
          [1, 1, 0, 0, 0],
          [1, 1, 0, 0, 0],
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
        ],
      },
      {
        title: "2. Superior Centro-Izquierda (I1, I2, N1, N2)",
        grid: [
          [0, 1, 1, 0, 0],
          [0, 1, 1, 0, 0],
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
        ],
      },
      {
        title: "3. Superior Centro-Derecha (N1, N2, G1, G2)",
        grid: [
          [0, 0, 1, 1, 0],
          [0, 0, 1, 1, 0],
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
        ],
      },
      {
        title: "4. Esquina Superior Derecha (G1, G2, O1, O2)",
        grid: [
          [0, 0, 0, 1, 1],
          [0, 0, 0, 1, 1],
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
        ],
      },
      {
        title: "5. Lateral Izquierdo Superior (B2, B3, I2, I3)",
        grid: [
          [0, 0, 0, 0, 0],
          [1, 1, 0, 0, 0],
          [1, 1, 0, 0, 0],
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
        ],
      },
      {
        title: "6. Central Superior-Izquierda (I2, I3, N2, N3) ⭐ Incluye FREE",
        grid: [
          [0, 0, 0, 0, 0],
          [0, 1, 1, 0, 0],
          [0, 1, 1, 0, 0],
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
        ],
      },
      {
        title: "7. Central Superior-Derecha (N2, N3, G2, G3) ⭐ Incluye FREE",
        grid: [
          [0, 0, 0, 0, 0],
          [0, 0, 1, 1, 0],
          [0, 0, 1, 1, 0],
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
        ],
      },
      {
        title: "8. Lateral Derecho Superior (G2, G3, O2, O3)",
        grid: [
          [0, 0, 0, 0, 0],
          [0, 0, 0, 1, 1],
          [0, 0, 0, 1, 1],
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
        ],
      },
      {
        title: "9. Lateral Izquierdo Inferior (B3, B4, I3, I4)",
        grid: [
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
          [1, 1, 0, 0, 0],
          [1, 1, 0, 0, 0],
          [0, 0, 0, 0, 0],
        ],
      },
      {
        title: "10. Central Inferior-Izquierda (I3, I4, N3, N4) ⭐ Incluye FREE",
        grid: [
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
          [0, 1, 1, 0, 0],
          [0, 1, 1, 0, 0],
          [0, 0, 0, 0, 0],
        ],
      },
      {
        title: "11. Central Inferior-Derecha (N3, N4, G3, G4) ⭐ Incluye FREE",
        grid: [
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
          [0, 0, 1, 1, 0],
          [0, 0, 1, 1, 0],
          [0, 0, 0, 0, 0],
        ],
      },
      {
        title: "12. Lateral Derecho Inferior (G3, G4, O3, O4)",
        grid: [
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
          [0, 0, 0, 1, 1],
          [0, 0, 0, 1, 1],
          [0, 0, 0, 0, 0],
        ],
      },
      {
        title: "13. Esquina Inferior Izquierda (B4, B5, I4, I5)",
        grid: [
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
          [1, 1, 0, 0, 0],
          [1, 1, 0, 0, 0],
        ],
      },
      {
        title: "14. Inferior Centro-Izquierda (I4, I5, N4, N5)",
        grid: [
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
          [0, 1, 1, 0, 0],
          [0, 1, 1, 0, 0],
        ],
      },
      {
        title: "15. Inferior Centro-Derecha (N4, N5, G4, G5)",
        grid: [
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
          [0, 0, 1, 1, 0],
          [0, 0, 1, 1, 0],
        ],
      },
      {
        title: "16. Esquina Inferior Derecha (G4, G5, O4, O5)",
        grid: [
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
          [0, 0, 0, 1, 1],
          [0, 0, 0, 1, 1],
        ],
      },
    ],
  },
  {
    id: "cuatro_esquinas",
    name: "4 Esquinas",
    description: "Las cuatro puntas exteriores del cartón (B1, B5, O1, O5)",
    category: "Especiales",
    badge: "4 Casillas",
    details: "Marca las 4 casillas de las esquinas del cartón: arriba a la izquierda, arriba a la derecha, abajo a la izquierda y abajo a la derecha.",
    grid: [
      [1, 0, 0, 0, 1],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [1, 0, 0, 0, 1],
    ],
  },
  {
    id: "linea_diagonal",
    name: "Línea Diagonal (De Esquina a Esquina)",
    description: "Cualquiera de las 2 diagonales completas que van de esquina a esquina pasando por FREE ⭐",
    category: "Líneas",
    badge: "2 Diagonales (Con FREE ⭐)",
    variationsCount: 2,
    details: "Completa cualquier línea diagonal de esquina a esquina del cartón. Al pasar por la estrella central (FREE ⭐), ¡solo necesitas 4 números marcados para ganar!",
    grid: [
      [1, 0, 0, 0, 0],
      [0, 1, 0, 0, 0],
      [0, 0, 1, 0, 0],
      [0, 0, 0, 1, 0],
      [0, 0, 0, 0, 1],
    ],
    alternateGrids: [
      {
        title: "1. Diagonal Descendente (B1 a O5 por FREE ⭐)",
        grid: [
          [1, 0, 0, 0, 0],
          [0, 1, 0, 0, 0],
          [0, 0, 1, 0, 0],
          [0, 0, 0, 1, 0],
          [0, 0, 0, 0, 1],
        ],
      },
      {
        title: "2. Diagonal Ascendente (B5 a O1 por FREE ⭐)",
        grid: [
          [0, 0, 0, 0, 1],
          [0, 0, 0, 1, 0],
          [0, 0, 1, 0, 0],
          [0, 1, 0, 0, 0],
          [1, 0, 0, 0, 0],
        ],
      },
    ],
  },
  {
    id: "linea_horizontal",
    name: "Línea Horizontal (Cualquier Fila)",
    description: "Cualquiera de las 5 filas horizontales completas de izquierda a derecha (Filas 1 a 5)",
    category: "Líneas",
    badge: "5 Filas Posibles",
    variationsCount: 5,
    details: "Completa cualquier fila de 5 casillas en línea recta horizontal (Fila 1, 2, 3 central con FREE ⭐, 4 o 5). Si es la fila 3, ¡solo necesitas 4 números!",
    grid: [
      [1, 1, 1, 1, 1],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
    ],
    alternateGrids: [
      {
        title: "1. Fila 1 (Superior: B1, I1, N1, G1, O1)",
        grid: [
          [1, 1, 1, 1, 1],
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
        ],
      },
      {
        title: "2. Fila 2 (Segunda fila: B2, I2, N2, G2, O2)",
        grid: [
          [0, 0, 0, 0, 0],
          [1, 1, 1, 1, 1],
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
        ],
      },
      {
        title: "3. Fila 3 (Central con FREE ⭐: ¡Solo 4 números!)",
        grid: [
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
          [1, 1, 1, 1, 1],
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
        ],
      },
      {
        title: "4. Fila 4 (Cuarta fila: B4, I4, N4, G4, O4)",
        grid: [
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
          [1, 1, 1, 1, 1],
          [0, 0, 0, 0, 0],
        ],
      },
      {
        title: "5. Fila 5 (Inferior: B5, I5, N5, G5, O5)",
        grid: [
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
          [1, 1, 1, 1, 1],
        ],
      },
    ],
  },
  {
    id: "linea_vertical",
    name: "Línea Vertical (Cualquier Columna)",
    description: "Cualquiera de las 5 columnas verticales de arriba a abajo (B, I, N, G u O)",
    category: "Líneas",
    badge: "5 Columnas Posibles",
    variationsCount: 5,
    details: "Completa cualquier columna vertical de arriba hacia abajo (Columna B, Columna I, Columna N con estrella FREE ⭐, Columna G o Columna O). Si es la Columna N, ¡solo necesitas 4 números!",
    grid: [
      [1, 0, 0, 0, 0],
      [1, 0, 0, 0, 0],
      [1, 0, 0, 0, 0],
      [1, 0, 0, 0, 0],
      [1, 0, 0, 0, 0],
    ],
    alternateGrids: [
      {
        title: "1. Columna B (Primera columna vertical)",
        grid: [
          [1, 0, 0, 0, 0],
          [1, 0, 0, 0, 0],
          [1, 0, 0, 0, 0],
          [1, 0, 0, 0, 0],
          [1, 0, 0, 0, 0],
        ],
      },
      {
        title: "2. Columna I (Segunda columna vertical)",
        grid: [
          [0, 1, 0, 0, 0],
          [0, 1, 0, 0, 0],
          [0, 1, 0, 0, 0],
          [0, 1, 0, 0, 0],
          [0, 1, 0, 0, 0],
        ],
      },
      {
        title: "3. Columna N (Central con FREE ⭐: ¡Solo 4 números!)",
        grid: [
          [0, 0, 1, 0, 0],
          [0, 0, 1, 0, 0],
          [0, 0, 1, 0, 0],
          [0, 0, 1, 0, 0],
          [0, 0, 1, 0, 0],
        ],
      },
      {
        title: "4. Columna G (Cuarta columna vertical)",
        grid: [
          [0, 0, 0, 1, 0],
          [0, 0, 0, 1, 0],
          [0, 0, 0, 1, 0],
          [0, 0, 0, 1, 0],
          [0, 0, 0, 1, 0],
        ],
      },
      {
        title: "5. Columna O (Quinta columna vertical)",
        grid: [
          [0, 0, 0, 0, 1],
          [0, 0, 0, 0, 1],
          [0, 0, 0, 0, 1],
          [0, 0, 0, 0, 1],
          [0, 0, 0, 0, 1],
        ],
      },
    ],
  },
  {
    id: "doble_linea",
    name: "Doble Línea (2 Filas o 2 Columnas)",
    description: "Dos líneas completas simultáneas (2 horizontales o 2 verticales)",
    category: "Líneas",
    badge: "2 Líneas Completas",
    variationsCount: 4,
    details: "Completa dos líneas completas en el mismo cartón: ya sean dos filas horizontales o dos columnas verticales cualesquiera.",
    grid: [
      [1, 1, 1, 1, 1],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [1, 1, 1, 1, 1],
    ],
    alternateGrids: [
      {
        title: "Doble Horizontal: Fila 1 y Fila 5",
        grid: [
          [1, 1, 1, 1, 1],
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
          [1, 1, 1, 1, 1],
        ],
      },
      {
        title: "Doble Horizontal: Fila 1 y Fila 3 (con FREE ⭐)",
        grid: [
          [1, 1, 1, 1, 1],
          [0, 0, 0, 0, 0],
          [1, 1, 1, 1, 1],
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
        ],
      },
      {
        title: "Doble Vertical: Columna B y Columna O",
        grid: [
          [1, 0, 0, 0, 1],
          [1, 0, 0, 0, 1],
          [1, 0, 0, 0, 1],
          [1, 0, 0, 0, 1],
          [1, 0, 0, 0, 1],
        ],
      },
      {
        title: "Doble Vertical: Columna B y Columna N (con FREE ⭐)",
        grid: [
          [1, 0, 1, 0, 0],
          [1, 0, 1, 0, 0],
          [1, 0, 1, 0, 0],
          [1, 0, 1, 0, 0],
          [1, 0, 1, 0, 0],
        ],
      },
    ],
  },
];

export const CORREO_ADMIN_OFICIAL = "amilcarrz030201@gmail.com";
export const CLAVE_ADMIN_OFICIAL = "Powersu01$$";

export const VILLANCICOS = [
  { id: 1, title: "¡A Mí Me Gusta La Navidad!", artist: "Gaita Navideña", year: "2026" },
  { id: 2, title: "Fuego Lento", artist: "Gaita Zuliana", year: "Clásico" },
  { id: 3, title: "Sin Rencor", artist: "Súper Saladillo", year: "Gaita Tradicional" },
  { id: 4, title: "Corre Caballito", artist: "Parranda Venezolana", year: "Navidad" },
  { id: 5, title: "Año Nuevo, Vida Nueva", artist: "Billo's Caracas Boys", year: "Cañonazo" },
];
