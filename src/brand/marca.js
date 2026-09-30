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

// Categorías que se hacen A PEDIDO: no se compran por el carrito, se encargan por WhatsApp o teléfono.
// Para sumar otra categoría, agregar su código acá.
export const CATEGORIAS_A_PEDIDO = ['PYT']   // Postres y tartas dulces
export const esAPedido = codigo => CATEGORIAS_A_PEDIDO.includes(codigo)

// Encargos: se piden con DIAS_ANTICIPACION de anticipación (sin domingos) y se reservan con una seña ≥ 50 %.
// El backend valida lo mismo en routes/pedidos.js.
export const DIAS_ANTICIPACION = 2
export const SENA_MINIMA = 0.5
const TZ = 'America/Argentina/Buenos_Aires'
export const hoyAR = () => new Date().toLocaleDateString('en-CA', { timeZone: TZ })   // YYYY-MM-DD
export function sumarDias(ymd, dias) {
  const d = new Date(`${ymd}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + dias)
  return d.toISOString().slice(0, 10)
}
export const esDomingo = ymd => new Date(`${ymd}T12:00:00Z`).getUTCDay() === 0
// Primer día que se puede elegir: hoy + 2 días; si cae domingo, el lunes
export function fechaMinimaEncargo() {
  let f = sumarDias(hoyAR(), DIAS_ANTICIPACION)
  if (esDomingo(f)) f = sumarDias(f, 1)
  return f
}
// "viernes 2 de octubre"
export const fechaLarga = ymd => ymd
  ? new Date(`${ymd}T12:00:00Z`).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' })
  : ''

export const TELEFONO_CEKETO = '543854133969'           // WhatsApp y llamadas
export const TELEFONO_VISIBLE = '385 413-3969'
export function linkEncargo(nombreProducto) {
  const msg = `Hola CEKETO! Quiero encargar *${nombreProducto}*. ¿Para cuándo lo podrían tener?`
  return `https://wa.me/${TELEFONO_CEKETO}?text=${encodeURIComponent(msg)}`
}

// Estilo de una categoría (si aparece una nueva, toma uno del ciclo)
export function estiloCategoria(codigo, indice = 0) {
  const e = ESTILO_CATEGORIA[codigo] || CICLO[indice % CICLO.length]
  return { ...e, hex: COLORES[e.color], texto: TEXTO_SOBRE[e.color] }
}
