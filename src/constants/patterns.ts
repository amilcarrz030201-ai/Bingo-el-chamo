import { WinningPattern } from "../types";

export const WINNING_PATTERNS: WinningPattern[] = [
  {
    id: "cruz_x",
    name: "Cruz / X",
    description: "Diagonales cruzadas completas",
    grid: [
      [1, 0, 0, 0, 1],
      [0, 1, 0, 1, 0],
      [0, 0, 1, 0, 0],
      [0, 1, 0, 1, 0],
      [1, 0, 0, 0, 1],
    ],
  },
  {
    id: "linea_superior",
    name: "Línea Superior",
    description: "Primera fila completa",
    grid: [
      [1, 1, 1, 1, 1],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
    ],
  },
  {
    id: "columna_central",
    name: "Columna Central",
    description: "Columna N + Corona Central",
    grid: [
      [0, 0, 1, 0, 0],
      [0, 0, 1, 0, 0],
      [0, 0, 1, 0, 0],
      [0, 0, 1, 0, 0],
      [0, 0, 1, 0, 0],
    ],
  },
  {
    id: "linea_inferior",
    name: "Línea Inferior",
    description: "Última fila completa",
    grid: [
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [1, 1, 1, 1, 1],
    ],
  },
  {
    id: "esquinas_l",
    name: "Esquinas + L",
    description: "Cuatro esquinas y lateral",
    grid: [
      [1, 1, 0, 1, 1],
      [1, 0, 0, 0, 1],
      [0, 0, 0, 0, 0],
      [1, 0, 0, 0, 1],
      [1, 1, 1, 1, 1],
    ],
  },
  {
    id: "cruz_central",
    name: "Cruz Central",
    description: "Fila y columna del centro",
    grid: [
      [0, 0, 1, 0, 0],
      [0, 0, 1, 0, 0],
      [1, 1, 1, 1, 1],
      [0, 0, 1, 0, 0],
      [0, 0, 1, 0, 0],
    ],
  },
  {
    id: "cuadrado_central",
    name: "Cuadrado Central",
    description: "Bloque interior de 3x3",
    grid: [
      [0, 0, 0, 0, 0],
      [0, 1, 1, 1, 0],
      [0, 1, 1, 1, 0],
      [0, 1, 1, 1, 0],
      [0, 0, 0, 0, 0],
    ],
  },
  {
    id: "marco_exterior",
    name: "Marco Exterior",
    description: "Bordes perimetrales completos",
    grid: [
      [1, 1, 1, 1, 1],
      [1, 0, 0, 0, 1],
      [1, 0, 0, 0, 1],
      [1, 0, 0, 0, 1],
      [1, 1, 1, 1, 1],
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
