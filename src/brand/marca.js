// Identidad visual de CEKETO (manual de marca de Serif Estudio)

export const COLORES = {
  verde:   '#058D76',
  naranja: '#F6521D',
  violeta: '#885784',
  lima:    '#9CCC66',
  salvia:  '#5AB282',
  crema:   '#F7F1E6',
  blanco:  '#FFFDF8',
  tinta:   '#17302B',
  profundo: '#0E4F45',
}

// Color de texto legible encima de cada color de la paleta
export const TEXTO_SOBRE = {
  verde: '#FFFDF8', naranja: '#0F2420', violeta: '#FFFDF8', lima: '#17302B', salvia: '#17302B',
}

// Cada categoría tiene SU color y SU ícono de marca en toda la tienda
// (mosaico de la portada, filtros de la tienda y etiqueta de cada producto).
// Colores alternados para que no queden dos iguales pegados en la grilla de 4 ni en la de 2.
export const ESTILO_CATEGORIA = {
  BYM: { color: 'naranja', icono: 'hojas' },    // Budines y muffins
  CHY: { color: 'verde',   icono: 'gotas' },    // Chocolates y yogures
  CON: { color: 'violeta', icono: 'kiwi' },     // Congelados
  DUK: { color: 'lima',    icono: 'diana' },    // Dulces keto
  MKT: { color: 'verde',   icono: 'palta' },    // Market Ceketo
  PAK: { color: 'naranja', icono: 'rama' },     // Panes keto y otros
  PYE: { color: 'lima',    icono: 'melon' },    // Pastas
  PYT: { color: 'violeta', icono: 'cuchara' },  // Postres y tartas dulces
}

const CICLO = [
  { color: 'naranja', icono: 'hojas' }, { color: 'verde', icono: 'gotas' },
  { color: 'violeta', icono: 'kiwi' },  { color: 'lima', icono: 'diana' },
]

// Estilo de una categoría (si aparece una nueva, toma uno del ciclo)
export function estiloCategoria(codigo, indice = 0) {
  const e = ESTILO_CATEGORIA[codigo] || CICLO[indice % CICLO.length]
  return { ...e, hex: COLORES[e.color], texto: TEXTO_SOBRE[e.color] }
}
