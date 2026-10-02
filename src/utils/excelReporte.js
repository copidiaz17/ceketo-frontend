// Excel del módulo Reportes: un libro completo, ordenado y desglosado.
// Una hoja por tema, cada una con título, período, tablas con encabezado, subtotales y totales.
// Uso: await generarExcelReporte(datos)  (datos = lo que ya cargó ReportesView)
import ExcelJS from 'exceljs'
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

const TZ = 'America/Argentina/Buenos_Aires'

// ── Paleta (manual de marca) ────────────────────────────────────────────────
const C = {
  verde: '058D76', verdeOsc: '0E4F45', verdeSuave: 'E3F2EE', verdeBanda: 'C9E6DE',
  naranja: 'C44117', naranjaSuave: 'FDE9E1', naranjaBanda: 'F9D3C3',
  violeta: '885784', violetaSuave: 'F3ECF2', violetaBanda: 'E7D9E5',
  rojo: 'B42318', rojoSuave: 'FDECEA', rojoBanda: 'F8D3CE',
  azul: '1D4E89', azulSuave: 'E8EEF6', azulBanda: 'CFDCEC',
  tinta: '17302B', gris: '6B7280', crema: 'F7F1E6', borde: 'E2E0DA', alt: 'FAF9F6',
}
const PALETA_GRAF = ['#058D76', '#F6521D', '#885784', '#9CCC66', '#5AB282', '#C44117', '#0E4F45', '#D4A5CF', '#F59E0B', '#64748B']
const TEMAS = {
  verde:   { color: C.verde,   suave: C.verdeSuave,   banda: C.verdeBanda },
  osc:     { color: C.verdeOsc, suave: C.verdeSuave,  banda: C.verdeBanda },
  rojo:    { color: C.rojo,    suave: C.rojoSuave,    banda: C.rojoBanda },
  violeta: { color: C.violeta, suave: C.violetaSuave, banda: C.violetaBanda },
  naranja: { color: C.naranja, suave: C.naranjaSuave, banda: C.naranjaBanda },
  azul:    { color: C.azul,    suave: C.azulSuave,    banda: C.azulBanda },
}

// ── Formatos ────────────────────────────────────────────────────────────────
const F = {
  pesos: '"$"#,##0;[Red]-"$"#,##0',
  u:     '#,##0',
  pct:   '0.0%',
  dec:   '#,##0.0',
  fecha: 'dd/mm/yyyy',
  hora:  'hh:mm',
}
const DERECHA = new Set(['pesos', 'dec'])
const CENTRO  = new Set(['u', 'pct', 'fecha', 'hora', 'centro'])

// ── Fechas y textos ─────────────────────────────────────────────────────────
const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const esYMD = v => /^\d{4}-\d{2}-\d{2}$/.test(String(v))
const enAR = f => new Date(f).toLocaleString('sv-SE', { timeZone: TZ })          // 'YYYY-MM-DD HH:mm:ss'
const ymdAR = f => esYMD(f) ? String(f) : enAR(f).slice(0, 10)
const horaAR = f => esYMD(f) ? '' : enAR(f).slice(11, 16)
const diaSemana = ymd => DIAS[new Date(ymd + 'T12:00:00Z').getUTCDay()]
const fechaAR = ymd => ymd.split('-').reverse().join('/')
const fechaLarga = ymd => new Date(ymd + 'T12:00:00Z')
  .toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
// Fecha para Excel: se guarda con la hora de Argentina para que se vea igual que en el sistema
function fechaXL(f) {
  if (!f) return null
  const s = esYMD(f) ? `${f} 00:00:00` : enAR(f)
  const [y, m, d] = s.slice(0, 10).split('-').map(Number)
  const [hh, mi, ss] = s.slice(11, 19).split(':').map(Number)
  return new Date(Date.UTC(y, m - 1, d, hh || 0, mi || 0, ss || 0))
}
const n = v => Number(v) || 0
const div = (a, b) => (b ? a / b : 0)

const METODOS = {
  efectivo: 'Efectivo', transferencia: 'Transferencia', debito: 'Débito', credito: 'Crédito',
  qr: 'QR', cuenta_corriente: 'Cuenta corriente', sin_metodo: 'Sin especificar', '—': 'Sin especificar',
}
const labelMetodo = m => METODOS[m] || m || 'Sin especificar'
const DIGITALES = ['transferencia', 'debito', 'credito', 'qr']
const grupoMetodo = m => m === 'efectivo' ? 'Efectivo'
  : DIGITALES.includes(m) ? 'Digital (billetera)'
  : m === 'cuenta_corriente' ? 'Cuenta corriente' : 'Otros'

// ── Bloques de construcción de las hojas ────────────────────────────────────
const BORDE = { style: 'thin', color: { argb: 'FF' + C.borde } }
const CAJA = { top: BORDE, bottom: BORDE, left: BORDE, right: BORDE }
const relleno = hex => ({ type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + hex } })

function crearHoja(wb, ctx, nombre, { titulo, tema = 'verde', anchos, apaisada = true }) {
  const t = TEMAS[tema]
  const ws = wb.addWorksheet(nombre, {
    views: [{ showGridLines: false }],
    properties: { tabColor: { argb: 'FF' + t.color } },
  })
  ws.columns = anchos.map(w => ({ width: w }))
  const nc = anchos.length
  ws.mergeCells(1, 1, 1, nc)
  const ti = ws.getCell(1, 1)
  ti.value = titulo
  ti.font = { bold: true, size: 16, color: { argb: 'FFFFFFFF' } }
  ti.fill = relleno(t.color)
  ti.alignment = { vertical: 'middle', indent: 1 }
  ws.getRow(1).height = 34
  ws.mergeCells(2, 1, 2, nc)
  const su = ws.getCell(2, 1)
  su.value = `CEKETO  ·  ${ctx.periodoTxt}${ctx.filtroTxt ? '  ·  ' + ctx.filtroTxt : ''}  ·  Generado el ${ctx.generado}`
  su.font = { size: 9, italic: true, color: { argb: 'FF' + C.gris } }
  su.fill = relleno(C.crema)
  su.alignment = { vertical: 'middle', indent: 1 }
  ws.getRow(2).height = 18
  ws.addRow([]).height = 6
  ws.pageSetup = {
    paperSize: 9, orientation: apaisada ? 'landscape' : 'portrait',
    fitToPage: true, fitToWidth: 1, fitToHeight: 0,
    margins: { left: 0.4, right: 0.4, top: 0.5, bottom: 0.6, header: 0.2, footer: 0.3 },
  }
  ws.headerFooter = { oddFooter: `&L&8CEKETO · Reporte de gestión&C&8${nombre}&R&8Página &P de &N` }
  Object.assign(ws, { _nc: nc, _t: t })
  return ws
}

// Subtítulo dentro de una hoja (con nota opcional debajo; sin texto = solo la nota)
function seccion(ws, texto, nota) {
  ws.addRow([]).height = 8
  if (texto) {
    const r = ws.addRow([texto])
    ws.mergeCells(r.number, 1, r.number, ws._nc)
    const c = r.getCell(1)
    c.font = { bold: true, size: 12, color: { argb: 'FF' + ws._t.color } }
    c.border = { bottom: { style: 'medium', color: { argb: 'FF' + ws._t.color } } }
    c.alignment = { vertical: 'middle' }
    r.height = 22
  }
  if (nota) {
    const r2 = ws.addRow([nota])
    ws.mergeCells(r2.number, 1, r2.number, ws._nc)
    r2.getCell(1).font = { size: 9, italic: true, color: { argb: 'FF' + C.gris } }
    r2.getCell(1).alignment = { vertical: 'top', wrapText: true }
    const anchoTotal = ws.columns.reduce((a, c) => a + (c.width || 10), 0)
    r2.height = 14 * Math.ceil(nota.length / (anchoTotal * 1.15)) + 4
  }
}

function encabezado(ws, titulos) {
  const r = ws.addRow(titulos)
  titulos.forEach((_, i) => {
    const c = r.getCell(i + 1)
    c.fill = relleno(ws._t.color)
    c.font = { bold: true, size: 10, color: { argb: 'FFFFFFFF' } }
    c.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
    c.border = CAJA
  })
  r.height = 30
  return r
}

// fmts: un formato por columna → 'pesos' | 'u' | 'pct' | 'dec' | 'fecha' | 'hora' | 'centro' | null (texto)
function fila(ws, valores, fmts = [], { alt = false, fondo = null, negrita = false, color = null, alto = 19 } = {}) {
  const r = ws.addRow(valores)
  for (let i = 1; i <= valores.length; i++) {
    const c = r.getCell(i)
    const f = fmts[i - 1]
    c.border = CAJA
    c.fill = relleno(fondo || (alt ? C.alt : 'FFFFFF'))
    c.font = { size: 10, bold: negrita, ...(color ? { color: { argb: 'FF' + color } } : {}) }
    if (F[f]) c.numFmt = F[f]
    c.alignment = {
      vertical: 'middle',
      horizontal: DERECHA.has(f) ? 'right' : CENTRO.has(f) ? 'center' : 'left',
      indent: f ? 0 : 1,
    }
  }
  r.height = alto
  return r
}
const totalFila = (ws, valores, fmts, fondo) => fila(ws, valores, fmts, { fondo: fondo || ws._t.suave, negrita: true, alto: 22 })

function banda(ws, texto) {
  const r = ws.addRow([texto])
  ws.mergeCells(r.number, 1, r.number, ws._nc)
  const c = r.getCell(1)
  c.font = { bold: true, size: 10.5, color: { argb: 'FF' + ws._t.color } }
  c.fill = relleno(ws._t.banda)
  c.alignment = { vertical: 'middle', indent: 1 }
  r.height = 22
  return r
}

function sinDatos(ws, texto = 'Sin datos en el período') {
  const r = ws.addRow([texto])
  ws.mergeCells(r.number, 1, r.number, ws._nc)
  r.getCell(1).font = { italic: true, color: { argb: 'FF' + C.gris } }
  r.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' }
  r.height = 26
}

// Tarjetas de indicadores: [{ etiqueta, valor, fmt, color, detalle }]
function tarjetas(ws, items, porFila = 4, ancho = 2) {
  for (let i = 0; i < items.length; i += porFila) {
    const grupo = items.slice(i, i + porFila)
    const rE = ws.addRow([]), rV = ws.addRow([]), rD = ws.addRow([])
    grupo.forEach((it, j) => {
      const c1 = 1 + j * ancho, c2 = c1 + ancho - 1
      for (const r of [rE, rV, rD]) if (c2 > c1) ws.mergeCells(r.number, c1, r.number, c2)
      const lado = { left: { style: 'thick', color: { argb: 'FF' + (it.color || C.verde) } } }
      const e = rE.getCell(c1)
      e.value = it.etiqueta.toUpperCase()
      e.font = { size: 8, bold: true, color: { argb: 'FF' + C.gris } }
      const v = rV.getCell(c1)
      v.value = it.valor
      if (F[it.fmt]) v.numFmt = F[it.fmt]
      v.font = { size: 17, bold: true, color: { argb: 'FF' + (it.color || C.tinta) } }
      const d = rD.getCell(c1)
      d.value = it.detalle || ''
      d.font = { size: 8.5, color: { argb: 'FF' + C.gris } }
      for (const c of [e, v, d]) { c.fill = relleno(C.crema); c.border = lado; c.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 } }
    })
    rE.height = 18; rV.height = 30; rD.height = 16
    ws.addRow([]).height = 6
  }
}

function filtro(ws, filaEnc, desde, hasta, ncols) {
  if (hasta > desde) ws.autoFilter = { from: { row: filaEnc, column: 1 }, to: { row: hasta, column: ncols } }
}
// Congela el encabezado (y columnas) y lo repite en cada hoja impresa
function congelar(ws, filaEnc, columnas = 0) {
  ws.views = [{ state: 'frozen', ySplit: filaEnc, xSplit: columnas, showGridLines: false }]
  ws.pageSetup.printTitlesRow = `${filaEnc}:${filaEnc}`
  if (columnas) ws.pageSetup.printTitlesColumn = `A:${String.fromCharCode(64 + columnas)}`
}

// ── Gráficos (se dibujan con Chart.js y se pegan como imagen) ──────────────
function grafico(type, labels, datasets, options = {}, w = 1000, h = 420) {
  return new Promise(resolve => {
    const canvas = document.createElement('canvas')
    canvas.width = w; canvas.height = h
    canvas.style.cssText = 'position:absolute;left:-9999px'
    document.body.appendChild(canvas)
    const ch = new Chart(canvas, {
      type, data: { labels, datasets },
      options: {
        ...options, animation: false, responsive: false,
        plugins: { legend: { labels: { font: { family: 'Calibri, Arial', size: 13 } } }, ...(options.plugins || {}) },
      },
      plugins: [{ id: 'fondo', beforeDraw: c => { const x = c.ctx; x.save(); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.restore() } }],
    })
    setTimeout(() => {
      const img = canvas.toDataURL('image/png').split(',')[1]
      ch.destroy(); document.body.removeChild(canvas)
      resolve(img)
    }, 150)
  })
}
const pesosK = v => '$' + Math.round(v / 1000).toLocaleString('es-AR') + 'K'
function pegarImagen(wb, ws, base64, filaInicio, col = 0, w = 900, h = 380) {
  ws.addImage(wb.addImage({ base64, extension: 'png' }), { tl: { col, row: filaInicio }, ext: { width: w, height: h } })
  const filas = Math.ceil(h / 20) + 1
  for (let i = 0; i < filas; i++) ws.addRow([])
}

// ── Cálculos ────────────────────────────────────────────────────────────────
function preparar(d, ctx) {
  // Operaciones en orden cronológico, con día y hora de Argentina
  const ops = [...(d.operaciones || [])]
    .map(op => {
      const m2 = !ctx.filtrado && op.metodo_pago2 && op.monto_pago2 ? n(op.monto_pago2) : 0
      return {
        ...op,
        ymd: ymdAR(op.fecha), hora: horaAR(op.fecha),
        unidades: (op.items || []).reduce((a, i) => a + n(i.cantidad), 0),
        pagos: [[op.metodo_pago || 'sin_metodo', n(op.total) - m2], ...(m2 ? [[op.metodo_pago2, m2]] : [])],
      }
    })
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))

  const metodosUsados = [...new Set(ops.flatMap(o => o.pagos.map(p => p[0])))]
  const ORDEN_M = ['efectivo', 'transferencia', 'debito', 'credito', 'qr', 'cuenta_corriente']
  metodosUsados.sort((a, b) => (ORDEN_M.indexOf(a) + 1 || 99) - (ORDEN_M.indexOf(b) + 1 || 99))

  // Ventas por día
  const porDia = {}
  for (const o of ops) {
    const x = porDia[o.ymd] ||= { ymd: o.ymd, ops: 0, unidades: 0, local: 0, online: 0, envio: 0, total: 0, metodos: {} }
    x.ops++; x.unidades += o.unidades; x.envio += n(o.costo_envio); x.total += n(o.total)
    if (o.origen === 'Online') x.online += n(o.total); else x.local += n(o.total)
    for (const [m, v] of o.pagos) x.metodos[m] = (x.metodos[m] || 0) + v
  }
  const dias = Object.values(porDia).sort((a, b) => a.ymd.localeCompare(b.ymd))

  // Por franja horaria y por día de la semana
  const porHora = {}
  for (const o of ops) {
    if (!o.hora) continue
    const h = Number(o.hora.slice(0, 2))
    const x = porHora[h] ||= { h, ops: 0, total: 0 }
    x.ops++; x.total += n(o.total)
  }
  const horas = Object.values(porHora).sort((a, b) => a.h - b.h)
  const porDow = {}
  for (const x of dias) {
    const dow = new Date(x.ymd + 'T12:00:00Z').getUTCDay()
    const y = porDow[dow] ||= { dow, dias: 0, ops: 0, total: 0 }
    y.dias++; y.ops += x.ops; y.total += x.total
  }
  const dows = [1, 2, 3, 4, 5, 6, 0].map(i => porDow[i]).filter(Boolean)

  // Métodos de pago: monto y cantidad de operaciones (un pago dividido cuenta en los dos métodos)
  const metodos = {}
  for (const o of ops) for (const [m, v] of o.pagos) {
    const x = metodos[m] ||= { metodo: m, ops: 0, total: 0 }
    x.ops++; x.total += v
  }

  // Productos vendidos por categoría
  const cats = {}
  for (const r of d.resumen || []) {
    const c = cats[r.categoria] ||= { categoria: r.categoria, productos: [], unidades: 0, total: 0 }
    c.productos.push(r); c.unidades += n(r.cantidad); c.total += n(r.total)
  }
  const categorias = Object.values(cats).sort((a, b) => b.total - a.total)
  categorias.forEach(c => c.productos.sort((a, b) => n(b.total) - n(a.total)))

  // Libro de movimientos: ventas + gastos + movimientos manuales de caja
  const libro = [
    ...ops.map(o => ({ fecha: o.fecha, tipo: 'Venta', origen: o.origen, concepto: `Venta ${o.id}${o.cliente && o.cliente !== '—' ? ' — ' + o.cliente : ''}`, medio: o.pagos.map(p => labelMetodo(p[0])).join(' + '), ingreso: n(o.total), egreso: 0 })),
    ...(d.gastos || []).map(g => ({ fecha: g.fecha, tipo: 'Gasto', origen: g.categoria || '', concepto: g.descripcion || g.categoria || 'Gasto', medio: labelMetodo(g.metodo_pago), ingreso: 0, egreso: n(g.monto) })),
    ...((d.resumenMovimientos || {}).detalle || []).map(m => ({ fecha: m.fecha, tipo: 'Movimiento de caja', origen: m.medio === 'billetera' ? 'Billetera' : 'Efectivo', concepto: m.concepto || 'Movimiento de caja', medio: m.medio === 'billetera' ? 'Billetera' : 'Efectivo', ingreso: m.tipo === 'ingreso' ? n(m.monto) : 0, egreso: m.tipo === 'egreso' ? n(m.monto) : 0 })),
  ].sort((a, b) => fechaXL(a.fecha) - fechaXL(b.fecha))

  return { ops, dias, horas, dows, metodos, metodosUsados, categorias, libro }
}

// Producción: filas por producto y lote, agregadas por día, producto y categoría
function prepararProduccion(lotes, stock) {
  const precioDe = Object.fromEntries((stock || []).map(p => [p.codigo, n(p.precio)]))
  const filas = (lotes || []).flatMap(l => (l.items || []).map(it => ({
    fecha: String(l.fecha).slice(0, 10),
    lote: String(l.lote_id || '').startsWith('fecha-') ? '' : String(l.lote_id || '').slice(0, 8),
    nota: l.nota || '',
    categoria: it.categoria || 'Sin categoría',
    codigo: it.codigo || '',
    producto: it.producto || '—',
    cantidad: n(it.cantidad),
    precio: it.precio != null ? n(it.precio) : (precioDe[it.codigo] ?? 0),
  })))
  const totU = filas.reduce((a, f) => a + f.cantidad, 0)
  const totV = filas.reduce((a, f) => a + f.cantidad * f.precio, 0)
  const fechas = [...new Set(filas.map(f => f.fecha))].sort()
  const porDia = {}, porProd = {}
  for (const f of filas) {
    const d = porDia[f.fecha] ||= { fecha: f.fecha, lotes: new Set(), notas: new Set(), productos: {}, unidades: 0, valor: 0 }
    if (f.lote) d.lotes.add(f.lote)
    if (f.nota) d.notas.add(f.nota)
    const k = f.codigo + '|' + f.producto
    const p = d.productos[k] ||= { categoria: f.categoria, codigo: f.codigo, producto: f.producto, precio: f.precio, cantidad: 0 }
    p.cantidad += f.cantidad; d.unidades += f.cantidad; d.valor += f.cantidad * f.precio
    const q = porProd[k] ||= { categoria: f.categoria, codigo: f.codigo, producto: f.producto, precio: f.precio, cantidad: 0, dias: {} }
    q.cantidad += f.cantidad
    q.dias[f.fecha] = (q.dias[f.fecha] || 0) + f.cantidad
  }
  const productos = Object.values(porProd)
  const cats = {}
  for (const p of productos) {
    const c = cats[p.categoria] ||= { categoria: p.categoria, productos: [], cantidad: 0, valor: 0 }
    c.productos.push(p); c.cantidad += p.cantidad; c.valor += p.cantidad * p.precio
  }
  const categorias = Object.values(cats).sort((a, b) => b.cantidad - a.cantidad)
  return { filas, totU, totV, fechas, porDia, productos, categorias, nLotes: (lotes || []).length }
}

// ═══════════════════════════════════════════════════════════════════════════
export async function generarExcelReporte(d) {
  const ahora = new Date()
  const ctx = {
    filtrado: !!(d.filtros?.categoria || d.filtros?.producto),
    generado: ahora.toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false, timeZone: TZ }).replace(',', '') + ' hs',
    periodoTxt: d.filtros?.desde && d.filtros?.hasta ? `Del ${fechaLarga(d.filtros.desde)} al ${fechaLarga(d.filtros.hasta)}`
      : d.filtros?.desde ? `Desde el ${fechaLarga(d.filtros.desde)}`
      : d.filtros?.hasta ? `Hasta el ${fechaLarga(d.filtros.hasta)}` : 'Todo el historial',
    filtroTxt: [d.filtros?.categoria && `Categoría: ${d.filtros.categoria}`, d.filtros?.producto && `Producto: ${d.filtros.producto}`].filter(Boolean).join(' · '),
  }
  const k = d.kpis || {}
  const P = preparar(d, ctx)
  const PR = prepararProduccion(d.lotes, d.stock)
  const ingresos = n(k.total_con_envios)
  const gastosTot = n(d.totalGastos)
  const neto = ingresos - gastosTot

  const wb = new ExcelJS.Workbook()
  wb.creator = 'CEKETO'; wb.created = ahora
  wb.calcProperties.fullCalcOnLoad = true

  // Índice de hojas (se completa en la portada)
  const INDICE = [
    ['Estado de resultados', 'Ingresos por categoría, gastos por rubro, resultado y margen'],
    ['Ventas por día', 'Cada día: operaciones, unidades, local/online, formas de pago y total. Días de la semana y horarios'],
    ['Ventas', 'Todas las operaciones, una por fila, con filtros'],
    ['Detalle de ventas', 'Cada producto vendido en cada operación, con filtros'],
    ['Productos vendidos', 'Ranking por categoría y por producto, con participación'],
    ['Formas de pago', 'Montos y operaciones por forma de pago, origen y entrega'],
    ['Gastos', 'Gastos por rubro, forma de pago, proveedor y detalle'],
    ['Producción - resumen', 'Indicadores de producción, por categoría y por día de la semana'],
    ['Producción por día', 'Cada día con los productos elaborados, uno por fila'],
    ['Producción por producto', 'Unidades, días producido, promedio y máximo de cada producto'],
    ['Producto x día', 'Cuadro de producción: un producto por fila y un día por columna'],
    ['Stock', 'Stock actual por categoría, con estado y valor a precio de venta'],
    ['Caja', 'Efectivo y billetera, cajas abiertas y cerradas, movimientos manuales'],
    ['Libro de movimientos', 'Todos los ingresos y egresos en orden, con saldo acumulado'],
  ]

  // ── PORTADA ───────────────────────────────────────────────────────────────
  {
    const ws = crearHoja(wb, ctx, 'Portada', { titulo: 'CEKETO — REPORTE DE GESTIÓN', tema: 'verde', anchos: [16, 16, 16, 16, 16, 16, 16, 16], apaisada: false })
    const r = ws.addRow([ctx.periodoTxt])
    ws.mergeCells(r.number, 1, r.number, 8)
    r.getCell(1).font = { bold: true, size: 13, color: { argb: 'FF' + C.tinta } }
    r.height = 22
    seccion(ws, 'Indicadores principales')
    const unidadesVend = n(k.unidades)
    tarjetas(ws, [
      { etiqueta: 'Ingresos totales', valor: ingresos, fmt: 'pesos', color: C.verde, detalle: `Productos $${Math.round(n(k.total)).toLocaleString('es-AR')} · Envíos $${Math.round(n(k.total_envios)).toLocaleString('es-AR')}` },
      { etiqueta: 'Gastos', valor: gastosTot, fmt: 'pesos', color: C.rojo, detalle: `${(d.gastos || []).length} comprobantes` },
      { etiqueta: 'Resultado neto', valor: neto, fmt: 'pesos', color: neto >= 0 ? C.verde : C.rojo, detalle: neto >= 0 ? 'Ganancia del período' : 'Pérdida del período' },
      { etiqueta: 'Margen neto', valor: div(neto, ingresos), fmt: 'pct', color: neto >= 0 ? C.verde : C.rojo, detalle: 'Resultado sobre ingresos' },
      { etiqueta: 'Operaciones', valor: n(k.n_operaciones), fmt: 'u', color: C.verdeOsc, detalle: `${P.dias.length} días con ventas` },
      { etiqueta: 'Ticket promedio', valor: n(k.ticket_promedio), fmt: 'pesos', color: C.verdeOsc, detalle: 'Ingreso por operación' },
      { etiqueta: 'Unidades vendidas', valor: unidadesVend, fmt: 'u', color: C.naranja, detalle: `${(d.resumen || []).length} productos distintos` },
      { etiqueta: 'Unidades producidas', valor: PR.totU, fmt: 'u', color: C.violeta, detalle: `${PR.fechas.length} días de producción` },
    ])

    seccion(ws, 'Lo más destacado del período')
    const mejorDia = [...P.dias].sort((a, b) => b.total - a.total)[0]
    const mejorDow = [...P.dows].sort((a, b) => div(b.total, b.dias) - div(a.total, a.dias))[0]
    const pico = [...P.horas].sort((a, b) => b.ops - a.ops)[0]
    const topPesos = (d.resumen || [])[0]
    const topU = [...(d.resumen || [])].sort((a, b) => n(b.cantidad) - n(a.cantidad))[0]
    const topCat = (d.por_categoria || [])[0]
    const topMetodo = Object.values(P.metodos).sort((a, b) => b.total - a.total)[0]
    const topGasto = [...(d.gastos || [])].sort((a, b) => n(b.monto) - n(a.monto))[0]
    const destacados = [
      ['Mejor día de ventas', mejorDia ? `${diaSemana(mejorDia.ymd)} ${fechaAR(mejorDia.ymd)}` : '—', mejorDia ? mejorDia.total : null],
      ['Día de la semana más fuerte (promedio)', mejorDow ? DIAS[mejorDow.dow] : '—', mejorDow ? div(mejorDow.total, mejorDow.dias) : null],
      ['Franja horaria con más ventas', pico ? `${String(pico.h).padStart(2, '0')}:00 a ${String(pico.h + 1).padStart(2, '0')}:00 hs (${pico.ops} ventas)` : '—', pico ? pico.total : null],
      ['Producto que más facturó', topPesos ? topPesos.producto : '—', topPesos ? n(topPesos.total) : null],
      ['Producto más vendido en unidades', topU ? `${topU.producto} (${topU.cantidad} u.)` : '—', topU ? n(topU.total) : null],
      ['Categoría líder', topCat ? `${topCat.categoria} (${topCat.pct}% de las ventas)` : '—', topCat ? n(topCat.total) : null],
      ['Forma de pago principal', topMetodo ? `${labelMetodo(topMetodo.metodo)} (${Math.round(div(topMetodo.total, ingresos) * 100)}%)` : '—', topMetodo ? topMetodo.total : null],
      ['Gasto más grande', topGasto ? `${topGasto.descripcion || topGasto.categoria} (${fechaAR(ymdAR(topGasto.fecha))})` : '—', topGasto ? n(topGasto.monto) : null],
    ]
    const hD = encabezado(ws, ['Indicador', '', '', 'Detalle', '', '', 'Monto', ''])
    ws.mergeCells(hD.number, 1, hD.number, 3); ws.mergeCells(hD.number, 4, hD.number, 6); ws.mergeCells(hD.number, 7, hD.number, 8)
    destacados.forEach(([a, b, c], i) => {
      const rr = fila(ws, [a, '', '', b, '', '', c, ''], [null, null, null, null, null, null, 'pesos', 'pesos'], { alt: i % 2 === 1 })
      ws.mergeCells(rr.number, 1, rr.number, 3); ws.mergeCells(rr.number, 4, rr.number, 6); ws.mergeCells(rr.number, 7, rr.number, 8)
      rr.getCell(1).font = { size: 10, bold: true }
    })

    seccion(ws, 'Contenido del reporte', 'Hacé clic en el nombre de una hoja para ir directo.')
    const hI = encabezado(ws, ['N°', 'Hoja', '', 'Qué contiene', '', '', '', ''])
    ws.mergeCells(hI.number, 2, hI.number, 3); ws.mergeCells(hI.number, 4, hI.number, 8)
    INDICE.forEach(([hoja, desc], i) => {
      const rr = fila(ws, [i + 1, '', '', desc, '', '', '', ''], ['centro'], { alt: i % 2 === 1 })
      ws.mergeCells(rr.number, 2, rr.number, 3); ws.mergeCells(rr.number, 4, rr.number, 8)
      const c = rr.getCell(2)
      c.value = { text: hoja, hyperlink: `#'${hoja}'!A1` }
      c.font = { size: 10, bold: true, underline: true, color: { argb: 'FF' + C.verde } }
      rr.getCell(4).alignment = { vertical: 'middle', wrapText: true, indent: 1 }
      rr.height = desc.length > 80 ? 30 : 21
    })
  }

  // ── ESTADO DE RESULTADOS ──────────────────────────────────────────────────
  {
    const ws = crearHoja(wb, ctx, 'Estado de resultados', { titulo: 'ESTADO DE RESULTADOS', tema: 'osc', anchos: [46, 16, 18, 16], apaisada: false })
    encabezado(ws, ['Concepto', 'Cantidad', 'Monto', '% s/ ingresos'])
    const fm = [null, 'u', 'pesos', 'pct']
    banda(ws, 'INGRESOS')
    const unidadesCat = {}
    for (const c of P.categorias) unidadesCat[c.categoria] = c.unidades
    ;(d.por_categoria || []).forEach((c, i) => fila(ws, [`   Ventas — ${c.categoria}`, unidadesCat[c.categoria] ?? null, n(c.total), div(n(c.total), ingresos)], fm, { alt: i % 2 === 1 }))
    fila(ws, ['   Envíos cobrados', null, n(k.total_envios), div(n(k.total_envios), ingresos)], fm)
    const otros = ingresos - n(k.total) - n(k.total_envios)
    if (Math.abs(otros) >= 1) fila(ws, ['   Señas de encargos y ajustes', null, otros, div(otros, ingresos)], fm)
    totalFila(ws, ['TOTAL INGRESOS', n(k.unidades), ingresos, ingresos ? 1 : 0], fm, C.verdeBanda)

    ws.addRow([]).height = 8
    banda(ws, 'GASTOS')
    const gc = Object.entries(d.gastosPorCategoria || {}).sort((a, b) => b[1].total - a[1].total)
    if (!gc.length) sinDatos(ws, 'Sin gastos cargados en el período')
    gc.forEach(([cat, g], i) => fila(ws, [`   ${cat}`, g.cantidad, -n(g.total), div(-n(g.total), ingresos)], fm, { alt: i % 2 === 1 }))
    totalFila(ws, ['TOTAL GASTOS', (d.gastos || []).length, -gastosTot, div(-gastosTot, ingresos)], fm, C.rojoBanda)

    ws.addRow([]).height = 8
    const rN = totalFila(ws, ['RESULTADO NETO', null, neto, div(neto, ingresos)], fm, neto >= 0 ? C.verdeBanda : C.rojoBanda)
    rN.height = 28
    rN.getCell(1).font = rN.getCell(3).font = { bold: true, size: 13, color: { argb: 'FF' + (neto >= 0 ? C.verdeOsc : C.rojo) } }
    if (n(d.ivaTotal) > 0) {
      ws.addRow([])
      fila(ws, ['IVA discriminado en facturas de gastos (crédito fiscal)', null, n(d.ivaTotal), null], fm, { color: C.gris })
    }
    seccion(ws, 'Notas', 'Los gastos se muestran en negativo. El margen neto es el resultado dividido los ingresos. La cantidad de ingresos son unidades vendidas; la de gastos, comprobantes.')
  }

  // ── VENTAS POR DÍA ────────────────────────────────────────────────────────
  {
    const met = P.metodosUsados
    const titulos = ['Fecha', 'Día', 'Operaciones', 'Unidades', 'Local', 'Online', ...met.map(labelMetodo), 'Envíos', 'Total del día', 'Ticket promedio']
    const anchos = [12, 12, 12, 11, 14, 14, ...met.map(() => 14), 12, 16, 14]
    const ws = crearHoja(wb, ctx, 'Ventas por día', { titulo: 'VENTAS POR DÍA', tema: 'verde', anchos })
    const fm = ['fecha', null, 'u', 'u', 'pesos', 'pesos', ...met.map(() => 'pesos'), 'pesos', 'pesos', 'pesos']
    const hR = encabezado(ws, titulos)
    congelar(ws, hR.number, 2)
    if (!P.dias.length) sinDatos(ws)
    const ini = ws.rowCount + 1
    P.dias.forEach((x, i) => fila(ws, [
      fechaXL(x.ymd), diaSemana(x.ymd), x.ops, x.unidades, x.local || null, x.online || null,
      ...met.map(m => x.metodos[m] || null), x.envio || null, x.total, div(x.total, x.ops),
    ], fm, { alt: i % 2 === 1 }))
    const fin = ws.rowCount
    filtro(ws, hR.number, ini, fin, titulos.length)
    if (P.dias.length) {
      const sum = key => P.dias.reduce((a, x) => a + (typeof key === 'function' ? key(x) : x[key]), 0)
      const tOps = sum('ops'), tTot = sum('total')
      totalFila(ws, ['TOTAL', '', tOps, sum('unidades'), sum('local'), sum('online'), ...met.map(m => sum(x => x.metodos[m] || 0)), sum('envio'), tTot, div(tTot, tOps)], fm)
      const nd = P.dias.length
      fila(ws, ['PROMEDIO DIARIO', '', Math.round(tOps / nd), Math.round(sum('unidades') / nd), sum('local') / nd, sum('online') / nd, ...met.map(m => sum(x => x.metodos[m] || 0) / nd), sum('envio') / nd, tTot / nd, null], fm, { negrita: true, color: C.gris })
      ws.getCell(ws.rowCount - 1, 1).numFmt = 'General'
      ws.getCell(ws.rowCount, 1).numFmt = 'General'
    }

    seccion(ws, 'Por día de la semana', 'Promedio de lo vendido cada día de la semana en el período.')
    const fm2 = [null, 'u', 'u', 'pesos', 'pesos', 'pct']
    encabezado(ws, ['Día', 'Días con ventas', 'Operaciones', 'Total', 'Promedio por día', '% del total'])
    const totDows = P.dows.reduce((a, x) => a + x.total, 0)
    P.dows.forEach((x, i) => fila(ws, [DIAS[x.dow], x.dias, x.ops, x.total, div(x.total, x.dias), div(x.total, totDows)], fm2, { alt: i % 2 === 1 }))

    seccion(ws, 'Por franja horaria', 'Cuántas ventas entran en cada hora del día (hora de Argentina).')
    const fm3 = [null, 'u', 'pesos', 'pct', 'pesos']
    encabezado(ws, ['Franja', 'Operaciones', 'Total', '% de las operaciones', 'Ticket promedio'])
    const totOpsH = P.horas.reduce((a, x) => a + x.ops, 0)
    P.horas.forEach((x, i) => fila(ws, [`${String(x.h).padStart(2, '0')}:00 a ${String(x.h + 1).padStart(2, '0')}:00`, x.ops, x.total, div(x.ops, totOpsH), div(x.total, x.ops)], fm3, { alt: i % 2 === 1 }))

    if (P.dias.length) {
      seccion(ws, 'Gráfico: ingresos y gastos por día')
      const gPorDia = Object.fromEntries((d.gastosPorDia || []).map(g => [g.dia, n(g.total)]))
      const img = await grafico('bar', P.dias.map(x => fechaAR(x.ymd).slice(0, 5)), [
        { label: 'Ingresos', data: P.dias.map(x => x.total), backgroundColor: '#058D76', borderRadius: 3 },
        { label: 'Gastos', data: P.dias.map(x => gPorDia[x.ymd] || 0), backgroundColor: '#F6521D', borderRadius: 3 },
      ], { plugins: { legend: { position: 'top' } }, scales: { y: { ticks: { callback: pesosK } } } })
      pegarImagen(wb, ws, img, ws.rowCount, 0, 1000, 400)
    }
  }

  // ── VENTAS (una operación por fila) ──────────────────────────────────────
  {
    const titulos = ['Fecha', 'Hora', 'Día', 'N° operación', 'Origen', 'Cliente', 'Entrega', 'Forma de pago', 'Monto', '2ª forma de pago', 'Monto 2', 'Unidades', 'Desc. %', 'Envío', 'Total', 'Observación']
    const ws = crearHoja(wb, ctx, 'Ventas', { titulo: 'VENTAS — UNA OPERACIÓN POR FILA', tema: 'verde', anchos: [12, 8, 11, 13, 10, 22, 11, 16, 13, 16, 13, 10, 9, 11, 14, 34] })
    const fm = ['fecha', 'hora', null, 'centro', 'centro', null, 'centro', null, 'pesos', null, 'pesos', 'u', 'centro', 'pesos', 'pesos', null]
    const hR = encabezado(ws, titulos)
    congelar(ws, hR.number, 0)
    if (!P.ops.length) sinDatos(ws)
    const ini = ws.rowCount + 1
    P.ops.forEach((o, i) => {
      const [p1, p2] = o.pagos
      fila(ws, [
        fechaXL(o.ymd), fechaXL(o.fecha), diaSemana(o.ymd), o.id, o.origen, o.cliente && o.cliente !== '—' ? o.cliente : '',
        o.entrega, labelMetodo(p1[0]), p1[1], p2 ? labelMetodo(p2[0]) : '', p2 ? p2[1] : null,
        o.unidades, n(o.descuento) > 0 ? `${n(o.descuento)}%` : '', n(o.costo_envio) || null, n(o.total), o.nota || '',
      ], fm, { alt: i % 2 === 1 })
    })
    const fin = ws.rowCount
    filtro(ws, hR.number, ini, fin, titulos.length)
    if (P.ops.length) {
      ws.addRow([]).height = 6
      totalFila(ws, ['TOTAL', '', '', `${P.ops.length} oper.`, '', '', '', '', null, '', null, P.ops.reduce((a, o) => a + o.unidades, 0), '', n(k.total_envios), ingresos, ''], fm)
      seccion(ws, 'Cómo usar esta hoja', 'Usá las flechas de los encabezados para filtrar por fecha, origen, forma de pago, etc. El total de abajo es el del período completo (no cambia al filtrar).')
    }
  }

  // ── DETALLE DE VENTAS (un producto por fila) ─────────────────────────────
  {
    const titulos = ['Fecha', 'Hora', 'N° operación', 'Origen', 'Categoría', 'Código', 'Producto', 'Cantidad', 'Precio unit.', 'Desc. %', 'Subtotal']
    const ws = crearHoja(wb, ctx, 'Detalle de ventas', { titulo: 'DETALLE DE VENTAS — UN PRODUCTO POR FILA', tema: 'verde', anchos: [12, 8, 13, 10, 22, 14, 42, 10, 13, 9, 14] })
    const fm = ['fecha', 'hora', 'centro', 'centro', null, 'centro', null, 'u', 'pesos', 'centro', 'pesos']
    const hR = encabezado(ws, titulos)
    congelar(ws, hR.number, 0)
    const det = [...(d.detalle || [])].sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
    if (!det.length) sinDatos(ws)
    const ini = ws.rowCount + 1
    det.forEach((x, i) => fila(ws, [
      fechaXL(ymdAR(x.fecha)), fechaXL(x.fecha), x.operacion_id, x.origen, x.categoria, x.codigo, x.producto,
      n(x.cantidad), n(x.precio_unit), n(x.descuento_pct) > 0 ? `${n(x.descuento_pct)}%` : '', n(x.subtotal),
    ], fm, { alt: i % 2 === 1 }))
    filtro(ws, hR.number, ini, ws.rowCount, titulos.length)
    if (det.length) {
      ws.addRow([]).height = 6
      totalFila(ws, ['TOTAL', '', `${det.length} líneas`, '', '', '', '', det.reduce((a, x) => a + n(x.cantidad), 0), null, '', det.reduce((a, x) => a + n(x.subtotal), 0)], fm)
    }
  }

  // ── PRODUCTOS VENDIDOS ────────────────────────────────────────────────────
  {
    const ws = crearHoja(wb, ctx, 'Productos vendidos', { titulo: 'PRODUCTOS VENDIDOS', tema: 'naranja', anchos: [8, 14, 44, 11, 14, 16, 13, 13] })
    const totProd = P.categorias.reduce((a, c) => a + c.total, 0)
    seccion(ws, 'Resumen por categoría')
    const fmC = [null, null, null, 'u', 'u', 'pesos', 'pct', 'pesos']
    const hC = encabezado(ws, ['Categoría', '', '', 'Unidades', 'Productos', 'Total', '% ventas', 'Precio prom.'])
    ws.mergeCells(hC.number, 1, hC.number, 3)
    P.categorias.forEach((c, i) => {
      const rr = fila(ws, [c.categoria, '', '', c.unidades, c.productos.length, c.total, div(c.total, totProd), div(c.total, c.unidades)], fmC, { alt: i % 2 === 1 })
      ws.mergeCells(rr.number, 1, rr.number, 3)
    })
    if (P.categorias.length) {
      const rt = totalFila(ws, ['TOTAL', '', '', P.categorias.reduce((a, c) => a + c.unidades, 0), (d.resumen || []).length, totProd, 1, null], fmC)
      ws.mergeCells(rt.number, 1, rt.number, 3)
    } else sinDatos(ws)

    seccion(ws, 'Detalle por producto', 'Ordenado de mayor a menor facturación dentro de cada categoría. "Puesto" es el lugar del producto dentro de su categoría.')
    const fm = ['centro', 'centro', null, 'u', 'pesos', 'pesos', 'pct', 'pct']
    encabezado(ws, ['Puesto', 'Código', 'Producto', 'Unidades', 'Precio prom.', 'Total', '% categoría', '% ventas'])
    P.categorias.forEach(c => {
      banda(ws, `${c.categoria.toUpperCase()}   ·   ${c.productos.length} productos · ${c.unidades.toLocaleString('es-AR')} unidades · $${Math.round(c.total).toLocaleString('es-AR')}`)
      c.productos.forEach((p, i) => fila(ws, [
        i + 1, p.codigo, p.producto, n(p.cantidad), div(n(p.total), n(p.cantidad)), n(p.total), div(n(p.total), c.total), div(n(p.total), totProd),
      ], fm, { alt: i % 2 === 1 }))
      const rt = totalFila(ws, ['', '', `Subtotal ${c.categoria}`, c.unidades, null, c.total, 1, div(c.total, totProd)], fm)
      rt.getCell(3).alignment = { horizontal: 'right', vertical: 'middle' }
    })
    if (P.categorias.length) {
      ws.addRow([]).height = 6
      const rt = totalFila(ws, ['', '', 'TOTAL VENDIDO', P.categorias.reduce((a, c) => a + c.unidades, 0), null, totProd, null, 1], fm, C.naranjaBanda)
      rt.getCell(3).alignment = { horizontal: 'right', vertical: 'middle' }

      seccion(ws, 'Gráficos')
      const ini = ws.rowCount
      const top = (d.resumen || []).slice(0, 10)
      const imgTop = await grafico('bar', top.map(r => r.producto.length > 34 ? r.producto.slice(0, 34) + '…' : r.producto),
        [{ data: top.map(r => n(r.total)), backgroundColor: PALETA_GRAF, borderRadius: 3 }],
        { indexAxis: 'y', plugins: { legend: { display: false }, title: { display: true, text: 'Top 10 productos por facturación', font: { size: 16 } } }, scales: { x: { ticks: { callback: pesosK } } } }, 900, 460)
      const imgCat = await grafico('doughnut', (d.por_categoria || []).map(c => c.categoria),
        [{ data: (d.por_categoria || []).map(c => n(c.total)), backgroundColor: PALETA_GRAF, borderColor: '#fff', borderWidth: 2 }],
        { plugins: { legend: { position: 'right' }, title: { display: true, text: 'Ventas por categoría', font: { size: 16 } } } }, 760, 460)
      ws.addImage(wb.addImage({ base64: imgTop, extension: 'png' }), { tl: { col: 0, row: ini }, ext: { width: 620, height: 317 } })
      ws.addImage(wb.addImage({ base64: imgCat, extension: 'png' }), { tl: { col: 0, row: ini + 17 }, ext: { width: 520, height: 315 } })
      for (let i = 0; i < 34; i++) ws.addRow([])
    }
  }

  // ── FORMAS DE PAGO ────────────────────────────────────────────────────────
  {
    const ws = crearHoja(wb, ctx, 'Formas de pago', { titulo: 'FORMAS DE PAGO', tema: 'azul', anchos: [26, 22, 14, 18, 13, 16], apaisada: false })
    const fm = [null, null, 'u', 'pesos', 'pct', 'pesos']
    encabezado(ws, ['Grupo', 'Forma de pago', 'Operaciones', 'Monto', '% del total', 'Ticket promedio'])
    const grupos = {}
    for (const m of Object.values(P.metodos)) (grupos[grupoMetodo(m.metodo)] ||= []).push(m)
    const totM = Object.values(P.metodos).reduce((a, m) => a + m.total, 0)
    for (const g of ['Efectivo', 'Digital (billetera)', 'Cuenta corriente', 'Otros']) {
      const lista = (grupos[g] || []).sort((a, b) => b.total - a.total)
      if (!lista.length) continue
      lista.forEach((m, i) => fila(ws, [i === 0 ? g : '', labelMetodo(m.metodo), m.ops, m.total, div(m.total, totM), div(m.total, m.ops)], fm, { alt: i % 2 === 1 }))
      if (lista.length > 1) {
        const ops = lista.reduce((a, m) => a + m.ops, 0), tot = lista.reduce((a, m) => a + m.total, 0)
        totalFila(ws, ['', `Subtotal ${g.toLowerCase()}`, ops, tot, div(tot, totM), div(tot, ops)], fm)
      }
    }
    if (totM) totalFila(ws, ['TOTAL COBRADO', '', P.ops.length, totM, 1, div(totM, P.ops.length)], fm, C.azulBanda)
    else sinDatos(ws)
    seccion(ws, null, 'Una venta con pago dividido cuenta como operación en las dos formas de pago, con el monto que se cobró en cada una.')

    seccion(ws, 'Por origen de la venta')
    const juntar12 = fx => ws.mergeCells(fx.number, 1, fx.number, 2)
    juntar12(encabezado(ws, ['Origen', '', 'Operaciones', 'Monto', '% del total', 'Ticket promedio']))
    for (const [i, o] of ['Local', 'Online'].entries()) {
      const l = P.ops.filter(x => x.origen === o)
      const t = l.reduce((a, x) => a + n(x.total), 0)
      juntar12(fila(ws, [o === 'Local' ? 'En el local (caja)' : 'Online (web)', '', l.length, t, div(t, ingresos), div(t, l.length)], fm, { alt: i % 2 === 1 }))
    }

    seccion(ws, 'Por tipo de entrega')
    juntar12(encabezado(ws, ['Entrega', '', 'Operaciones', 'Monto', '% del total', 'Ticket promedio']))
    ;[...new Set(P.ops.map(x => x.entrega))].forEach((e, i) => {
      const l = P.ops.filter(x => x.entrega === e)
      const t = l.reduce((a, x) => a + n(x.total), 0)
      juntar12(fila(ws, [e, '', l.length, t, div(t, ingresos), div(t, l.length)], fm, { alt: i % 2 === 1 }))
    })
  }

  // ── GASTOS ────────────────────────────────────────────────────────────────
  {
    const ws = crearHoja(wb, ctx, 'Gastos', { titulo: 'GASTOS', tema: 'rojo', anchos: [12, 40, 24, 16, 12, 13, 15] })
    const gastos = [...(d.gastos || [])].sort((a, b) => String(a.fecha).localeCompare(String(b.fecha)))
    if (!gastos.length) {
      sinDatos(ws, 'No hay gastos cargados en el período')
    } else {
      seccion(ws, 'Por rubro')
      const fmR = [null, null, 'u', 'pesos', 'pesos', 'pct', 'pesos']
      const hR = encabezado(ws, ['Rubro', '', 'Comprobantes', 'IVA', 'Total', '% gastos', 'Promedio'])
      ws.mergeCells(hR.number, 1, hR.number, 2)
      const porCat = Object.entries(d.gastosPorCategoria || {}).sort((a, b) => b[1].total - a[1].total)
      porCat.forEach(([c, g], i) => {
        const rr = fila(ws, [c, '', g.cantidad, n(g.iva) || null, n(g.total), div(n(g.total), gastosTot), div(n(g.total), g.cantidad)], fmR, { alt: i % 2 === 1 })
        ws.mergeCells(rr.number, 1, rr.number, 2)
      })
      const rt = totalFila(ws, ['TOTAL', '', gastos.length, n(d.ivaTotal) || null, gastosTot, 1, div(gastosTot, gastos.length)], fmR)
      ws.mergeCells(rt.number, 1, rt.number, 2)

      seccion(ws, 'Por forma de pago')
      const hM = encabezado(ws, ['Forma de pago', '', 'Comprobantes', '', 'Total', '% gastos'])
      ws.mergeCells(hM.number, 1, hM.number, 2); ws.mergeCells(hM.number, 3, hM.number, 4)
      const porM = {}
      for (const g of gastos) { const m = labelMetodo(g.metodo_pago); const x = porM[m] ||= { n: 0, t: 0 }; x.n++; x.t += n(g.monto) }
      Object.entries(porM).sort((a, b) => b[1].t - a[1].t).forEach(([m, x], i) => {
        const rr = fila(ws, [m, '', x.n, null, x.t, div(x.t, gastosTot)], fmR, { alt: i % 2 === 1 })
        ws.mergeCells(rr.number, 1, rr.number, 2); ws.mergeCells(rr.number, 3, rr.number, 4)
      })

      seccion(ws, 'Principales proveedores')
      const hP = encabezado(ws, ['Proveedor', '', 'Comprobantes', '', 'Total', '% gastos', 'Último gasto'])
      ws.mergeCells(hP.number, 1, hP.number, 2); ws.mergeCells(hP.number, 3, hP.number, 4)
      const porP = {}
      for (const g of gastos) { const p = (g.proveedor || '').trim() || 'Sin proveedor'; const x = porP[p] ||= { n: 0, t: 0, ult: '' }; x.n++; x.t += n(g.monto); x.ult = String(g.fecha) > x.ult ? String(g.fecha) : x.ult }
      Object.entries(porP).sort((a, b) => b[1].t - a[1].t).slice(0, 15).forEach(([p, x], i) => {
        const rr = fila(ws, [p, '', x.n, null, x.t, div(x.t, gastosTot), fechaXL(ymdAR(x.ult))], [...fmR.slice(0, 6), 'fecha'], { alt: i % 2 === 1 })
        ws.mergeCells(rr.number, 1, rr.number, 2); ws.mergeCells(rr.number, 3, rr.number, 4)
      })

      seccion(ws, 'Detalle de gastos por rubro')
      const fm = ['fecha', null, null, null, 'centro', 'pesos', 'pesos']
      encabezado(ws, ['Fecha', 'Descripción', 'Proveedor', 'Forma de pago', 'Factura', 'IVA', 'Monto'])
      for (const [c] of porCat) {
        const lista = gastos.filter(g => (g.categoria || 'Otros') === c)
        const tot = lista.reduce((a, g) => a + n(g.monto), 0)
        banda(ws, `${c.toUpperCase()}   ·   ${lista.length} comprobantes · $${Math.round(tot).toLocaleString('es-AR')}`)
        lista.forEach((g, i) => fila(ws, [
          fechaXL(ymdAR(g.fecha)), g.descripcion || '', g.proveedor || '', labelMetodo(g.metodo_pago),
          g.es_factura ? `A ${g.alicuota_iva}%` : '', n(g.iva_monto) || null, n(g.monto),
        ], fm, { alt: i % 2 === 1 }))
        totalFila(ws, ['', `Subtotal ${c}`, '', '', '', lista.reduce((a, g) => a + n(g.iva_monto), 0) || null, tot], fm)
      }
      ws.addRow([]).height = 6
      totalFila(ws, ['', 'TOTAL GASTOS', '', '', '', n(d.ivaTotal) || null, gastosTot], fm, C.rojoBanda)

      if (porCat.length) {
        seccion(ws, 'Gráfico')
        const img = await grafico('doughnut', porCat.map(([c]) => c),
          [{ data: porCat.map(([, g]) => n(g.total)), backgroundColor: PALETA_GRAF, borderColor: '#fff', borderWidth: 2 }],
          { plugins: { legend: { position: 'right' }, title: { display: true, text: 'Gastos por rubro', font: { size: 16 } } } }, 760, 420)
        pegarImagen(wb, ws, img, ws.rowCount, 0, 560, 310)
      }
    }
  }

  // ── PRODUCCIÓN (4 hojas) ──────────────────────────────────────────────────
  {
    const { totU, totV, fechas, porDia, categorias, productos } = PR
    const ordenProd = (a, b) => a.categoria.localeCompare(b.categoria) || a.producto.localeCompare(b.producto)

    // Resumen
    const ws0 = crearHoja(wb, ctx, 'Producción - resumen', { titulo: 'PRODUCCIÓN — RESUMEN', tema: 'violeta', anchos: [30, 16, 16, 18, 16, 16], apaisada: false })
    if (!PR.filas.length) sinDatos(ws0, 'No hay producción cargada en el período')
    else {
      const diaMax = Object.values(porDia).sort((a, b) => b.unidades - a.unidades)[0]
      tarjetas(ws0, [
        { etiqueta: 'Unidades producidas', valor: totU, fmt: 'u', color: C.violeta, detalle: `${productos.length} productos distintos` },
        { etiqueta: 'Días de producción', valor: fechas.length, fmt: 'u', color: C.violeta, detalle: `${PR.nLotes} lotes cargados` },
        { etiqueta: 'Promedio por día', valor: Math.round(div(totU, fechas.length)), fmt: 'u', color: C.violeta, detalle: diaMax ? `Máximo: ${diaSemana(diaMax.fecha).toLowerCase()} ${fechaAR(diaMax.fecha)} (${diaMax.unidades} u.)` : '' },
      ], 3, 2)
      tarjetas(ws0, [{ etiqueta: 'Valor de lo producido', valor: totV, fmt: 'pesos', color: C.verde, detalle: 'A precio de venta actual' }], 3, 2)

      seccion(ws0, 'Por categoría')
      const fm = [null, 'u', 'pct', 'pesos', 'u', 'pct']
      encabezado(ws0, ['Categoría', 'Unidades', '% del total', 'Valor a precio de venta', 'Productos', '% del valor'])
      categorias.forEach((c, i) => fila(ws0, [c.categoria, c.cantidad, div(c.cantidad, totU), c.valor, c.productos.length, div(c.valor, totV)], fm, { alt: i % 2 === 1 }))
      totalFila(ws0, ['TOTAL', totU, 1, totV, productos.length, 1], fm)

      seccion(ws0, 'Por día de la semana')
      const fm2 = [null, 'u', 'u', 'u', 'pct']
      encabezado(ws0, ['Día', 'Días producidos', 'Unidades', 'Promedio por día', '% del total'])
      ;[1, 2, 3, 4, 5, 6, 0].forEach((dow, i) => {
        const ds = Object.values(porDia).filter(x => new Date(x.fecha + 'T12:00:00Z').getUTCDay() === dow)
        if (!ds.length) return
        const u = ds.reduce((a, x) => a + x.unidades, 0)
        fila(ws0, [DIAS[dow], ds.length, u, Math.round(u / ds.length), div(u, totU)], fm2, { alt: i % 2 === 1 })
      })
      seccion(ws0, null, 'El valor se calcula con el precio de venta actual de cada producto (el sistema no guarda costos ni precios históricos).')
    }

    // Por día
    const ws1 = crearHoja(wb, ctx, 'Producción por día', { titulo: 'PRODUCCIÓN POR DÍA', tema: 'violeta', anchos: [24, 12, 44, 11, 13, 15, 11] })
    const h1 = encabezado(ws1, ['Categoría', 'Código', 'Producto', 'Cantidad', 'Precio venta', 'Valor', '% del día'])
    congelar(ws1, h1.number)
    if (!fechas.length) sinDatos(ws1)
    const fm1 = [null, 'centro', null, 'u', 'pesos', 'pesos', 'pct']
    fechas.forEach(fecha => {
      const x = porDia[fecha]
      const items = Object.values(x.productos).sort(ordenProd)
      const extra = (x.lotes.size > 1 ? ` · ${x.lotes.size} lotes` : '') + (x.notas.size ? ` · Nota: ${[...x.notas].join(' / ')}` : '')
      banda(ws1, `${diaSemana(fecha).toUpperCase()} ${fechaAR(fecha)}   ·   ${items.length} productos · ${x.unidades} unidades${extra}`)
      items.forEach((it, i) => fila(ws1, [it.categoria, it.codigo, it.producto, it.cantidad, it.precio, it.cantidad * it.precio, div(it.cantidad, x.unidades)], fm1, { alt: i % 2 === 1 }))
      const t = totalFila(ws1, ['', '', `Total del ${diaSemana(fecha).toLowerCase()} ${fechaAR(fecha)}`, x.unidades, null, x.valor, 1], fm1)
      t.getCell(3).alignment = { horizontal: 'right', vertical: 'middle' }
      ws1.addRow([]).height = 6
    })
    if (fechas.length) {
      const t = totalFila(ws1, ['', '', 'TOTAL DEL PERÍODO', totU, null, totV, null], fm1, C.violetaBanda)
      t.getCell(3).alignment = { horizontal: 'right', vertical: 'middle' }
    }

    // Por producto
    const ws2 = crearHoja(wb, ctx, 'Producción por producto', { titulo: 'PRODUCCIÓN POR PRODUCTO', tema: 'violeta', anchos: [12, 44, 11, 12, 12, 12, 14, 11, 13, 15] })
    const h2 = encabezado(ws2, ['Código', 'Producto', 'Unidades', 'Días producido', 'Promedio por día', 'Máximo en un día', 'Última producción', '% del total', 'Precio venta', 'Valor'])
    congelar(ws2, h2.number)
    if (!categorias.length) sinDatos(ws2)
    const fm2 = ['centro', null, 'u', 'u', 'dec', 'u', 'fecha', 'pct', 'pesos', 'pesos']
    categorias.forEach(c => {
      banda(ws2, `${c.categoria.toUpperCase()}   ·   ${c.productos.length} productos · ${c.cantidad} unidades`)
      c.productos.sort((a, b) => b.cantidad - a.cantidad).forEach((p, i) => {
        const ds = Object.keys(p.dias).sort()
        fila(ws2, [p.codigo, p.producto, p.cantidad, ds.length, div(p.cantidad, ds.length), Math.max(...Object.values(p.dias)), fechaXL(ds[ds.length - 1]), div(p.cantidad, totU), p.precio, p.cantidad * p.precio], fm2, { alt: i % 2 === 1 })
      })
      const t = totalFila(ws2, ['', `Subtotal ${c.categoria}`, c.cantidad, null, null, null, null, div(c.cantidad, totU), null, c.valor], fm2)
      t.getCell(2).alignment = { horizontal: 'right', vertical: 'middle' }
      ws2.addRow([]).height = 6
    })
    if (categorias.length) {
      const t = totalFila(ws2, ['', 'TOTAL DEL PERÍODO', totU, null, null, null, null, 1, null, totV], fm2, C.violetaBanda)
      t.getCell(2).alignment = { horizontal: 'right', vertical: 'middle' }
    }

    // Producto × día
    const ncol = 2 + fechas.length + 1
    const ws3 = crearHoja(wb, ctx, 'Producto x día', { titulo: 'PRODUCCIÓN — PRODUCTO × DÍA', tema: 'violeta', anchos: [20, 42, ...fechas.map(() => 7.5), 10] })
    const h3 = encabezado(ws3, ['Categoría', 'Producto', ...fechas.map(f => `${diaSemana(f).slice(0, 3)}\n${fechaAR(f).slice(0, 5)}`), 'Total'])
    h3.height = 34
    congelar(ws3, h3.number, 2)
    Object.assign(ws3.pageSetup, { fitToPage: false, scale: 75 })
    if (!fechas.length) sinDatos(ws3)
    const fmM = [null, null, ...fechas.map(() => 'u'), 'u']
    let iM = 0
    categorias.forEach(c => {
      c.productos.slice().sort((a, b) => a.producto.localeCompare(b.producto)).forEach(p => {
        const r = fila(ws3, [c.categoria, p.producto, ...fechas.map(f => p.dias[f] || null), p.cantidad], fmM, { alt: iM++ % 2 === 1 })
        for (let col = 3; col < ncol; col++) {
          const cell = r.getCell(col)
          if (cell.value) { cell.fill = relleno(C.violetaSuave); cell.font = { size: 10, bold: true, color: { argb: 'FF' + C.violeta } } }
        }
        r.getCell(ncol).font = { size: 10, bold: true }
      })
    })
    if (fechas.length) totalFila(ws3, ['', 'TOTAL POR DÍA', ...fechas.map(f => porDia[f].unidades), totU], fmM, C.violetaBanda)
  }

  // ── STOCK ─────────────────────────────────────────────────────────────────
  {
    const ws = crearHoja(wb, ctx, 'Stock', { titulo: 'STOCK ACTUAL', tema: 'naranja', anchos: [14, 46, 10, 14, 14, 16] })
    const stock = d.stock || []
    if (!stock.length) sinDatos(ws, 'No se pudo obtener el stock')
    else {
      const sin = stock.filter(p => n(p.stock) <= 0).length
      const bajo = stock.filter(p => n(p.stock) > 0 && n(p.stock) <= 3).length
      const valor = stock.reduce((a, p) => a + Math.max(n(p.stock), 0) * n(p.precio), 0)
      tarjetas(ws, [
        { etiqueta: 'Productos activos', valor: stock.length, fmt: 'u', color: C.naranja },
        { etiqueta: 'Unidades en stock', valor: stock.reduce((a, p) => a + Math.max(n(p.stock), 0), 0), fmt: 'u', color: C.naranja },
        { etiqueta: 'Sin stock', valor: sin, fmt: 'u', color: C.rojo, detalle: `${bajo} con stock bajo (1 a 3)` },
      ], 3, 2)
      tarjetas(ws, [{ etiqueta: 'Valor a precio de venta', valor: valor, fmt: 'pesos', color: C.verde, detalle: 'Stock actual × precio de venta' }], 3, 2)
      seccion(ws, 'Detalle por categoría', 'Es el stock de HOY (no depende del período elegido). Los productos sin stock aparecen primero en cada categoría.')
      const fm = ['centro', null, 'u', 'centro', 'pesos', 'pesos']
      const hR = encabezado(ws, ['Código', 'Producto', 'Stock', 'Estado', 'Precio venta', 'Valor'])
      congelar(ws, hR.number)
      const porCat = {}
      for (const p of stock) (porCat[p.categoria?.nombre || 'Sin categoría'] ||= []).push(p)
      Object.entries(porCat).sort((a, b) => a[0].localeCompare(b[0])).forEach(([c, lista]) => {
        lista.sort((a, b) => n(a.stock) - n(b.stock) || a.nombre.localeCompare(b.nombre))
        const u = lista.reduce((a, p) => a + Math.max(n(p.stock), 0), 0)
        const v = lista.reduce((a, p) => a + Math.max(n(p.stock), 0) * n(p.precio), 0)
        banda(ws, `${c.toUpperCase()}   ·   ${lista.length} productos · ${u} unidades · ${lista.filter(p => n(p.stock) <= 0).length} sin stock`)
        lista.forEach((p, i) => {
          const s = n(p.stock)
          const estado = s <= 0 ? 'Sin stock' : s <= 3 ? 'Bajo' : 'OK'
          const r = fila(ws, [p.codigo, p.nombre, s, estado, n(p.precio), Math.max(s, 0) * n(p.precio)], fm, { alt: i % 2 === 1 })
          const col = s <= 0 ? C.rojo : s <= 3 ? C.naranja : C.verde
          r.getCell(4).font = { size: 10, bold: true, color: { argb: 'FF' + col } }
          if (s <= 0) r.getCell(3).font = { size: 10, bold: true, color: { argb: 'FF' + C.rojo } }
        })
        totalFila(ws, ['', `Subtotal ${c}`, u, '', null, v], fm)
        ws.addRow([]).height = 6
      })
      totalFila(ws, ['', 'TOTAL', stock.reduce((a, p) => a + Math.max(n(p.stock), 0), 0), '', null, valor], fm, C.naranjaBanda)
    }
  }

  // ── CAJA ──────────────────────────────────────────────────────────────────
  {
    const ws = crearHoja(wb, ctx, 'Caja', { titulo: 'CAJA', tema: 'osc', anchos: [27, 17, 17, 18, 18, 18, 16, 14] })
    const mv = d.resumenMovimientos || {}
    const vm = d.ventasPorMetodo || {}
    const ventasEf = n(vm.efectivo)
    const ventasBi = DIGITALES.reduce((a, m) => a + n(vm[m]), 0)
    const gm = d.gastosPorMedio || {}
    seccion(ws, 'Resumen por medio', 'Ventas y gastos del período más los movimientos manuales de caja, separados en efectivo y billetera (transferencia, QR, débito y crédito).')
    const fm = [null, 'pesos', 'pesos', 'pesos', 'pesos', 'pesos']
    encabezado(ws, ['Medio', 'Ventas', 'Gastos', 'Ingresos manuales', 'Egresos manuales', 'Neto'])
    const filaMedio = (nom, v, g, i, e, alt) => fila(ws, [nom, v, -g, i, -e, v - g + i - e], fm, { alt })
    filaMedio('Efectivo', ventasEf, n(gm.efectivo), n(mv.ingresos_efectivo), n(mv.egresos_efectivo), false)
    filaMedio('Billetera', ventasBi, n(gm.digital), n(mv.ingresos_billetera), n(mv.egresos_billetera), true)
    const tv = ventasEf + ventasBi, tg = n(gm.efectivo) + n(gm.digital), ti = n(mv.ingresos_efectivo) + n(mv.ingresos_billetera), te = n(mv.egresos_efectivo) + n(mv.egresos_billetera)
    totalFila(ws, ['TOTAL', tv, -tg, ti, -te, tv - tg + ti - te], fm)
    if (n(vm.cuenta_corriente)) fila(ws, ['Cuenta corriente (a cobrar)', n(vm.cuenta_corriente), null, null, null, null], fm, { color: C.gris })

    seccion(ws, 'Cajas del período')
    const cajas = [...(d.cajas || [])].sort((a, b) => new Date(a.fecha_apertura) - new Date(b.fecha_apertura))
    const fmC = ['centro', 'fecha', 'hora', 'fecha', 'hora', null, 'pesos', 'pesos']
    encabezado(ws, ['Caja N°', 'Apertura', 'Hora', 'Cierre', 'Hora', 'Usuario', 'Saldo inicial', 'Estado'])
    if (!cajas.length) sinDatos(ws, 'Sin cajas en el período')
    cajas.forEach((c, i) => {
      const r = fila(ws, [c.id, fechaXL(ymdAR(c.fecha_apertura)), fechaXL(c.fecha_apertura), c.fecha_cierre ? fechaXL(ymdAR(c.fecha_cierre)) : 'Abierta', c.fecha_cierre ? fechaXL(c.fecha_cierre) : '', c.usuario || '—', n(c.saldo_inicial), c.estado === 'abierta' ? 'Abierta' : 'Cerrada'], fmC, { alt: i % 2 === 1 })
      r.getCell(8).alignment = { horizontal: 'center', vertical: 'middle' }
      r.getCell(8).font = { size: 10, bold: true, color: { argb: 'FF' + (c.estado === 'abierta' ? C.verde : C.gris) } }
    })
    if (cajas.some(c => c.arqueo_efectivo != null || c.arqueo_billetera != null)) {
      seccion(ws, 'Arqueos al cierre')
      const fmA = ['centro', 'fecha', 'pesos', 'pesos', 'pesos']
      encabezado(ws, ['Caja N°', 'Cierre', 'Arqueo efectivo', 'Arqueo billetera', 'Total arqueado'])
      cajas.filter(c => c.arqueo_efectivo != null || c.arqueo_billetera != null).forEach((c, i) =>
        fila(ws, [c.id, c.fecha_cierre ? fechaXL(ymdAR(c.fecha_cierre)) : '', c.arqueo_efectivo != null ? n(c.arqueo_efectivo) : null, c.arqueo_billetera != null ? n(c.arqueo_billetera) : null, n(c.arqueo_efectivo) + n(c.arqueo_billetera)], fmA, { alt: i % 2 === 1 }))
    }

    seccion(ws, 'Movimientos manuales de caja')
    const movs = [...(mv.detalle || [])].sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
    const fmV = ['fecha', 'hora', 'centro', null, 'centro', 'centro', 'pesos', 'pesos']
    encabezado(ws, ['Fecha', 'Hora', 'Caja N°', 'Concepto', 'Medio', 'Tipo', 'Ingreso', 'Egreso'])
    if (!movs.length) sinDatos(ws, 'Sin movimientos manuales en el período')
    movs.forEach((m, i) => fila(ws, [fechaXL(ymdAR(m.fecha)), fechaXL(m.fecha), m.caja_id, m.concepto, m.medio === 'billetera' ? 'Billetera' : 'Efectivo', m.tipo === 'ingreso' ? 'Ingreso' : 'Egreso', m.tipo === 'ingreso' ? n(m.monto) : null, m.tipo === 'egreso' ? n(m.monto) : null], fmV, { alt: i % 2 === 1 }))
    if (movs.length) totalFila(ws, ['TOTAL', '', '', '', '', '', ti, te], fmV)
  }

  // ── LIBRO DE MOVIMIENTOS ──────────────────────────────────────────────────
  {
    const titulos = ['Fecha', 'Hora', 'Tipo', 'Origen / rubro', 'Concepto', 'Medio', 'Ingreso', 'Egreso', 'Saldo acumulado']
    const ws = crearHoja(wb, ctx, 'Libro de movimientos', { titulo: 'LIBRO DE MOVIMIENTOS', tema: 'osc', anchos: [12, 8, 18, 18, 44, 22, 14, 14, 16] })
    const fm = ['fecha', 'hora', null, null, null, null, 'pesos', 'pesos', 'pesos']
    const hR = encabezado(ws, titulos)
    congelar(ws, hR.number)
    if (!P.libro.length) sinDatos(ws)
    const ini = ws.rowCount + 1
    let saldo = 0, ti = 0, te = 0
    P.libro.forEach((m, i) => {
      saldo += m.ingreso - m.egreso; ti += m.ingreso; te += m.egreso
      const r = fila(ws, [fechaXL(ymdAR(m.fecha)), esYMD(m.fecha) ? '' : fechaXL(m.fecha), m.tipo, m.origen, m.concepto, m.medio, m.ingreso || null, m.egreso || null, saldo], fm, { alt: i % 2 === 1 })
      if (m.egreso) r.getCell(8).font = { size: 10, color: { argb: 'FF' + C.rojo } }
    })
    filtro(ws, hR.number, ini, ws.rowCount, titulos.length)
    if (P.libro.length) {
      ws.addRow([]).height = 6
      totalFila(ws, ['TOTALES', '', `${P.libro.length} mov.`, '', '', '', ti, te, ti - te], fm)
      seccion(ws, null, 'Los gastos sin hora se ubican al principio de su día. El saldo acumulado es ingresos menos egresos desde el inicio del período (no incluye el saldo inicial de las cajas).')
    }
  }

  // ── Descargar ─────────────────────────────────────────────────────────────
  const buffer = await wb.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const hoy = ymdAR(ahora)
  a.href = url
  a.download = `CEKETO_reporte_${d.filtros?.desde || 'inicio'}_al_${d.filtros?.hasta || hoy}.xlsx`
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}
