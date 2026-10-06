// Informes de Cuentas Corrientes: listado general y estado de cuenta de un cliente/proveedor,
// en Excel (ExcelJS) y en PDF (jsPDF + autotable: texto real, sirve para cualquier cantidad de filas).
import ExcelJS from 'exceljs'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

const TZ = 'America/Argentina/Buenos_Aires'
const VERDE = '058D76', VERDE_OSC = '0E4F45', VERDE_SUAVE = 'E3F2EE', CREMA = 'F7F1E6', ROJO = 'B42318', GRIS = '6B7280', BORDE = 'E2E0DA'
const rgb = hex => [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)]
const n = v => Number(v) || 0
const METODOS = { efectivo: 'Efectivo', transferencia: 'Transferencia', debito: 'Débito', credito: 'Crédito', qr: 'QR' }

export const hoyAR = () => new Date().toLocaleDateString('en-CA', { timeZone: TZ })
const fechaAR = ymd => (ymd ? String(ymd).slice(0, 10).split('-').reverse().join('/') : '')
const fechaXL = ymd => { if (!ymd) return null; const [y, m, d] = String(ymd).slice(0, 10).split('-').map(Number); return new Date(Date.UTC(y, m - 1, d)) }
const generado = () => new Date().toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false, timeZone: TZ }).replace(',', '') + ' hs'
const pesos = v => (n(v) < 0 ? '-' : '') + '$' + Math.abs(n(v)).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
const diasEntre = (a, b) => Math.round((new Date(b + 'T12:00:00Z') - new Date(a + 'T12:00:00Z')) / 86400000)

export function estadoSaldo(tipo, saldo) {
  if (Math.abs(saldo) < 0.005) return 'Sin deuda'
  if (tipo === 'cliente') return saldo > 0 ? 'Nos debe' : 'Saldo a su favor'
  return saldo > 0 ? 'Le debemos' : 'Saldo a nuestro favor'
}

// ── Cálculos ────────────────────────────────────────────────────────────────
function resumenCuenta(c) {
  const movs = c.movimientos || []
  const cargos = movs.filter(m => m.tipo === 'cargo').reduce((a, m) => a + n(m.monto), 0)
  const pagos = movs.filter(m => m.tipo === 'pago').reduce((a, m) => a + n(m.monto), 0)
  const ultimo = movs.length ? String(movs[movs.length - 1].fecha).slice(0, 10) : null
  const saldo = cargos - pagos
  return { ...c, cargos, pagos, saldo, ultimo, dias: ultimo ? diasEntre(ultimo, hoyAR()) : null, cantidad: movs.length, estado: estadoSaldo(c.tipo, saldo) }
}

// Movimientos de una cuenta en el período, con saldo anterior y saldo acumulado
function prepararEstado(movimientos, desde, hasta) {
  const orden = [...movimientos].sort((a, b) => String(a.fecha).localeCompare(String(b.fecha)) || a.id - b.id)
  const f = m => String(m.fecha).slice(0, 10)
  const signo = m => (m.tipo === 'cargo' ? 1 : -1) * n(m.monto)
  const anterior = orden.filter(m => desde && f(m) < desde).reduce((a, m) => a + signo(m), 0)
  let saldo = anterior
  const filas = orden.filter(m => (!desde || f(m) >= desde) && (!hasta || f(m) <= hasta)).map(m => {
    saldo += signo(m)
    return { fecha: f(m), concepto: m.concepto, metodo: m.metodo_pago ? METODOS[m.metodo_pago] || m.metodo_pago : '', cargo: m.tipo === 'cargo' ? n(m.monto) : null, pago: m.tipo === 'pago' ? n(m.monto) : null, saldo }
  })
  const cargos = filas.reduce((a, x) => a + (x.cargo || 0), 0)
  const pagos = filas.reduce((a, x) => a + (x.pago || 0), 0)
  return { anterior, filas, cargos, pagos, final: anterior + cargos - pagos }
}
const textoPeriodo = (desde, hasta) => desde && hasta ? `Del ${fechaAR(desde)} al ${fechaAR(hasta)}` : desde ? `Desde el ${fechaAR(desde)}` : hasta ? `Hasta el ${fechaAR(hasta)}` : 'Todos los movimientos'

// ── Excel: piezas comunes ───────────────────────────────────────────────────
const relleno = hex => ({ type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + hex } })
const CAJA = { top: { style: 'thin', color: { argb: 'FF' + BORDE } }, bottom: { style: 'thin', color: { argb: 'FF' + BORDE } }, left: { style: 'thin', color: { argb: 'FF' + BORDE } }, right: { style: 'thin', color: { argb: 'FF' + BORDE } } }
const FMT = { pesos: '"$"#,##0;[Red]-"$"#,##0', u: '#,##0', fecha: 'dd/mm/yyyy' }

function hojaXL(wb, nombre, titulo, subtitulo, anchos) {
  const ws = wb.addWorksheet(nombre, { views: [{ showGridLines: false }] })
  ws.columns = anchos.map(w => ({ width: w }))
  const nc = anchos.length
  ws.mergeCells(1, 1, 1, nc)
  Object.assign(ws.getCell(1, 1), { value: titulo })
  ws.getCell(1, 1).font = { bold: true, size: 16, color: { argb: 'FFFFFFFF' } }
  ws.getCell(1, 1).fill = relleno(VERDE)
  ws.getCell(1, 1).alignment = { vertical: 'middle', indent: 1 }
  ws.getRow(1).height = 34
  ws.mergeCells(2, 1, 2, nc)
  ws.getCell(2, 1).value = subtitulo
  ws.getCell(2, 1).font = { size: 9, italic: true, color: { argb: 'FF' + GRIS } }
  ws.getCell(2, 1).fill = relleno(CREMA)
  ws.getCell(2, 1).alignment = { vertical: 'middle', indent: 1 }
  ws.getRow(2).height = 18
  ws.addRow([]).height = 6
  ws.pageSetup = { paperSize: 9, orientation: 'portrait', fitToPage: true, fitToWidth: 1, fitToHeight: 0, margins: { left: 0.4, right: 0.4, top: 0.5, bottom: 0.6, header: 0.2, footer: 0.3 } }
  ws.headerFooter = { oddFooter: '&L&8CEKETO · Cuentas corrientes&R&8Página &P de &N' }
  ws._nc = nc
  return ws
}
function encXL(ws, titulos, color = VERDE) {
  const r = ws.addRow(titulos)
  titulos.forEach((_, i) => { const c = r.getCell(i + 1); c.fill = relleno(color); c.font = { bold: true, size: 10, color: { argb: 'FFFFFFFF' } }; c.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }; c.border = CAJA })
  r.height = 28
  return r
}
function filaXL(ws, valores, fmts, { alt = false, fondo = null, negrita = false } = {}) {
  const r = ws.addRow(valores)
  valores.forEach((_, i) => {
    const c = r.getCell(i + 1), f = fmts[i]
    c.border = CAJA
    c.fill = relleno(fondo || (alt ? 'FAF9F6' : 'FFFFFF'))
    c.font = { size: 10, bold: negrita }
    if (FMT[f]) c.numFmt = FMT[f]
    c.alignment = { vertical: 'middle', horizontal: f === 'pesos' ? 'right' : f ? 'center' : 'left', indent: f ? 0 : 1, wrapText: !f }
  })
  r.height = 19
  return r
}
function seccionXL(ws, texto) {
  ws.addRow([]).height = 8
  const r = ws.addRow([texto])
  ws.mergeCells(r.number, 1, r.number, ws._nc)
  r.getCell(1).font = { bold: true, size: 12, color: { argb: 'FF' + VERDE_OSC } }
  r.getCell(1).border = { bottom: { style: 'medium', color: { argb: 'FF' + VERDE } } }
  r.height = 22
}
async function descargarXL(wb, archivo) {
  const buf = await wb.xlsx.writeBuffer()
  const url = URL.createObjectURL(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }))
  const a = document.createElement('a'); a.href = url; a.download = archivo; a.click()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}

// ── PDF: piezas comunes ─────────────────────────────────────────────────────
function pdfBase(titulo, subtitulo) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const W = doc.internal.pageSize.getWidth()
  doc.setFillColor(...rgb(VERDE)); doc.rect(0, 0, W, 24, 'F')
  doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(16)
  doc.text(titulo, 12, 11)
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9)
  doc.text(subtitulo, 12, 18)
  doc.setFontSize(8); doc.text('CEKETO', W - 12, 11, { align: 'right' })
  doc.setTextColor(0, 0, 0)
  return doc
}
function pdfPies(doc) {
  const total = doc.internal.getNumberOfPages()
  const W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight()
  for (let i = 1; i <= total; i++) {
    doc.setPage(i); doc.setFontSize(8); doc.setTextColor(...rgb(GRIS))
    doc.text(`CEKETO · Cuentas corrientes · Generado el ${generado()}`, 12, H - 7)
    doc.text(`Página ${i} de ${total}`, W - 12, H - 7, { align: 'right' })
  }
}
const ESTILO_TABLA = {
  theme: 'grid',
  styles: { font: 'helvetica', fontSize: 8.5, cellPadding: 1.8, lineColor: rgb(BORDE), lineWidth: 0.1, textColor: [23, 48, 43] },
  headStyles: { fillColor: rgb(VERDE), textColor: 255, fontStyle: 'bold', halign: 'center' },
  footStyles: { fillColor: rgb(VERDE_SUAVE), textColor: [14, 79, 69], fontStyle: 'bold' },
  alternateRowStyles: { fillColor: [250, 249, 246] },
  margin: { left: 12, right: 12, bottom: 14 },
}
// Recuadros de resumen arriba de la tabla: [[etiqueta, valor], ...]
function pdfResumen(doc, y, items) {
  const W = doc.internal.pageSize.getWidth()
  const ancho = (W - 24 - (items.length - 1) * 3) / items.length
  items.forEach(([et, val, color], i) => {
    const x = 12 + i * (ancho + 3)
    doc.setFillColor(...rgb(CREMA)); doc.rect(x, y, ancho, 16, 'F')
    doc.setFillColor(...rgb(color || VERDE)); doc.rect(x, y, 1.2, 16, 'F')
    doc.setFontSize(7); doc.setTextColor(...rgb(GRIS)); doc.setFont('helvetica', 'bold')
    doc.text(et.toUpperCase(), x + 4, y + 5.5)
    doc.setFontSize(12); doc.setTextColor(...rgb(color || '17302B'))
    doc.text(val, x + 4, y + 12.5)
  })
  doc.setFont('helvetica', 'normal'); doc.setTextColor(0, 0, 0)
  return y + 21
}

// ═══ 1) INFORME GENERAL ══════════════════════════════════════════════════════
function datosGeneral(cuentas) {
  const todas = cuentas.map(resumenCuenta)
  // Las cuentas sin ningún movimiento (muchos proveedores son solo nombres para Gastos) no se listan: se cuentan aparte
  const porTipo = t => todas.filter(c => c.tipo === t && c.cantidad > 0).sort((a, b) => b.saldo - a.saldo || a.nombre.localeCompare(b.nombre))
  const vacias = t => todas.filter(c => c.tipo === t && c.cantidad === 0).length
  const clientes = porTipo('cliente'), proveedores = porTipo('proveedor')
  const suma = (l, k) => l.reduce((a, c) => a + c[k], 0)
  return {
    clientes, proveedores, vacias,
    nosDeben: suma(clientes.filter(c => c.saldo > 0), 'saldo'),
    debemos: suma(proveedores.filter(c => c.saldo > 0), 'saldo'),
    conDeuda: clientes.filter(c => c.saldo > 0.005).length,
    suma,
  }
}

export async function excelGeneral(cuentas) {
  const D = datosGeneral(cuentas)
  const wb = new ExcelJS.Workbook(); wb.creator = 'CEKETO'
  const ws = hojaXL(wb, 'Cuentas corrientes', 'CUENTAS CORRIENTES — INFORME GENERAL', `CEKETO  ·  Saldos al ${fechaAR(hoyAR())}  ·  Generado el ${generado()}`, [32, 16, 12, 15, 15, 16, 20, 14, 12])
  const fm = [null, null, 'u', 'pesos', 'pesos', 'pesos', null, 'fecha', 'u']
  const resumen = [
    ['Clientes: nos deben', D.nosDeben, `${D.conDeuda} cliente(s) con deuda`],
    ['Proveedores: les debemos', D.debemos, `${D.proveedores.filter(c => c.saldo > 0.005).length} proveedor(es) con deuda`],
  ]
  encXL(ws, ['Resumen', 'Monto', 'Detalle', '', '', '', '', '', ''])
  ws.mergeCells(ws.rowCount, 3, ws.rowCount, 9)
  resumen.forEach(([a, b, c], i) => { const r = filaXL(ws, [a, b, c, '', '', '', '', '', ''], [null, 'pesos'], { alt: i % 2 === 1, negrita: true }); ws.mergeCells(r.number, 3, r.number, 9) })
  for (const [titulo, lista, color, t] of [['CLIENTES', D.clientes, VERDE, 'cliente'], ['PROVEEDORES', D.proveedores, 'C44117', 'proveedor']]) {
    seccionXL(ws, `${titulo} CON MOVIMIENTOS (${lista.length})${D.vacias(t) ? `  ·  ${D.vacias(t)} sin movimientos (no se listan)` : ''}`)
    encXL(ws, ['Nombre', 'Teléfono', 'Movimientos', 'Cargos', 'Pagos', 'Saldo', 'Estado', 'Último mov.', 'Días sin mov.'], color)
    if (!lista.length) { const r = ws.addRow(['Sin cuentas con movimientos']); ws.mergeCells(r.number, 1, r.number, 9); continue }
    lista.forEach((c, i) => {
      const r = filaXL(ws, [c.nombre, c.telefono || '', c.cantidad, c.cargos, c.pagos, c.saldo, c.estado, fechaXL(c.ultimo), c.dias], fm, { alt: i % 2 === 1 })
      if (c.saldo > 0.005) r.getCell(6).font = r.getCell(7).font = { size: 10, bold: true, color: { argb: 'FF' + ROJO } }
    })
    filaXL(ws, ['TOTAL', '', D.suma(lista, 'cantidad'), D.suma(lista, 'cargos'), D.suma(lista, 'pagos'), D.suma(lista, 'saldo'), '', null, null], fm, { fondo: VERDE_SUAVE, negrita: true })
  }
  ws.addRow([]); const nota = ws.addRow(['Saldo = cargos menos pagos. Cliente con saldo positivo: nos debe. Proveedor con saldo positivo: le debemos. Ordenado de mayor a menor deuda.'])
  ws.mergeCells(nota.number, 1, nota.number, 9); nota.getCell(1).font = { size: 9, italic: true, color: { argb: 'FF' + GRIS } }
  await descargarXL(wb, `CEKETO_cuentas_corrientes_${hoyAR()}.xlsx`)
}

export function pdfGeneral(cuentas) {
  const D = datosGeneral(cuentas)
  const doc = pdfBase('Cuentas corrientes — Informe general', `Saldos al ${fechaAR(hoyAR())}`)
  let y = pdfResumen(doc, 30, [
    ['Clientes: nos deben', pesos(D.nosDeben), ROJO],
    ['Proveedores: les debemos', pesos(D.debemos), 'C44117'],
    ['Clientes con deuda', String(D.conDeuda), VERDE],
  ])
  for (const [titulo, lista, color, t] of [['Clientes', D.clientes, VERDE, 'cliente'], ['Proveedores', D.proveedores, 'C44117', 'proveedor']]) {
    if (y > doc.internal.pageSize.getHeight() - 40) { doc.addPage(); y = 16 }
    doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(...rgb(color))
    doc.text(`${titulo} con movimientos (${lista.length})`, 12, y + 2)
    if (D.vacias(t)) { doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(...rgb(GRIS)); doc.text(`${D.vacias(t)} sin movimientos (no se listan)`, doc.internal.pageSize.getWidth() - 12, y + 2, { align: 'right' }) }
    doc.setTextColor(0, 0, 0)
    autoTable(doc, {
      ...ESTILO_TABLA, startY: y + 4,
      headStyles: { ...ESTILO_TABLA.headStyles, fillColor: rgb(color) },
      head: [['Nombre', 'Teléfono', 'Mov.', 'Cargos', 'Pagos', 'Saldo', 'Estado', 'Último mov.']],
      body: lista.length ? lista.map(c => [c.nombre, c.telefono || '', c.cantidad, pesos(c.cargos), pesos(c.pagos), pesos(c.saldo), c.estado, fechaAR(c.ultimo) + (c.dias != null ? ` (${c.dias} d)` : '')]) : [['Sin cuentas con movimientos', '', '', '', '', '', '', '']],
      foot: lista.length ? [['TOTAL', '', D.suma(lista, 'cantidad'), pesos(D.suma(lista, 'cargos')), pesos(D.suma(lista, 'pagos')), pesos(D.suma(lista, 'saldo')), '', '']] : undefined,
      columnStyles: { 2: { halign: 'center' }, 3: { halign: 'right' }, 4: { halign: 'right' }, 5: { halign: 'right', fontStyle: 'bold' }, 7: { halign: 'center' } },
      didParseCell: h => {
        if (h.section === 'foot') h.cell.styles.halign = h.column.index === 2 ? 'center' : h.column.index >= 3 && h.column.index <= 5 ? 'right' : 'left'
        if (h.section === 'body' && h.column.index >= 5 && h.column.index <= 6 && lista[h.row.index]?.saldo > 0.005) h.cell.styles.textColor = rgb(ROJO)
      },
    })
    y = doc.lastAutoTable.finalY + 10
  }
  if (y > doc.internal.pageSize.getHeight() - 24) { doc.addPage(); y = 16 }
  doc.setFontSize(7.5); doc.setTextColor(...rgb(GRIS))
  const nota = 'Saldo = cargos menos pagos. Cliente con saldo positivo: nos debe. Proveedor con saldo positivo: le debemos. Ordenado de mayor a menor deuda.'
  doc.text(doc.splitTextToSize(nota, doc.internal.pageSize.getWidth() - 24), 12, y)
  pdfPies(doc)
  doc.save(`CEKETO_cuentas_corrientes_${hoyAR()}.pdf`)
}

// ═══ 2) ESTADO DE CUENTA (un cliente o proveedor) ════════════════════════════
const nombreArchivo = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9]+/g, '_').replace(/^_|_$/g, '')

export async function excelEstado(cuenta, movimientos, desde, hasta) {
  const E = prepararEstado(movimientos, desde, hasta)
  const tipo = cuenta.tipo === 'cliente' ? 'Cliente' : 'Proveedor'
  const wb = new ExcelJS.Workbook(); wb.creator = 'CEKETO'
  const ws = hojaXL(wb, 'Estado de cuenta', `ESTADO DE CUENTA — ${cuenta.nombre.toUpperCase()}`, `CEKETO  ·  ${tipo}${cuenta.telefono ? ' · Tel. ' + cuenta.telefono : ''}  ·  ${textoPeriodo(desde, hasta)}  ·  Generado el ${generado()}`, [13, 46, 16, 15, 15, 16])
  const fmR = [null, null, null, 'pesos', null, null]
  encXL(ws, ['Resumen', '', '', 'Monto', '', ''])
  ws.mergeCells(ws.rowCount, 1, ws.rowCount, 3); ws.mergeCells(ws.rowCount, 4, ws.rowCount, 6)
  const res = [
    ...(desde ? [[`Saldo anterior al ${fechaAR(desde)}`, E.anterior]] : []),
    ['Cargos del período', E.cargos], ['Pagos del período', E.pagos],
    [`Saldo ${hasta ? 'al ' + fechaAR(hasta) : 'final'} — ${estadoSaldo(cuenta.tipo, E.final)}`, E.final],
  ]
  res.forEach(([a, b], i) => {
    const r = filaXL(ws, [a, '', '', b, '', ''], fmR, { alt: i % 2 === 1, negrita: i === res.length - 1, fondo: i === res.length - 1 ? VERDE_SUAVE : null })
    ws.mergeCells(r.number, 1, r.number, 3); ws.mergeCells(r.number, 4, r.number, 6)
    r.getCell(1).alignment = { vertical: 'middle', indent: 1 }
    r.getCell(4).alignment = { horizontal: 'left', vertical: 'middle', indent: 1 }
  })
  seccionXL(ws, `Movimientos (${E.filas.length})`)
  const fm = ['fecha', null, null, 'pesos', 'pesos', 'pesos']
  const enc = encXL(ws, ['Fecha', 'Concepto', 'Forma de pago', 'Cargo', 'Pago', 'Saldo'])
  ws.views = [{ state: 'frozen', ySplit: enc.number, showGridLines: false }]
  ws.pageSetup.printTitlesRow = `${enc.number}:${enc.number}`
  if (desde) filaXL(ws, [fechaXL(desde), 'Saldo anterior', '', null, null, E.anterior], fm, { fondo: CREMA })
  E.filas.forEach((x, i) => filaXL(ws, [fechaXL(x.fecha), x.concepto, x.metodo, x.cargo, x.pago, x.saldo], fm, { alt: i % 2 === 1 }))
  if (!E.filas.length) { const r = ws.addRow(['Sin movimientos en el período']); ws.mergeCells(r.number, 1, r.number, 6) }
  filaXL(ws, ['', 'TOTALES DEL PERÍODO', '', E.cargos, E.pagos, E.final], fm, { fondo: VERDE_SUAVE, negrita: true })
  await descargarXL(wb, `CEKETO_estado_de_cuenta_${nombreArchivo(cuenta.nombre)}_${hasta || hoyAR()}.xlsx`)
}

export function pdfEstado(cuenta, movimientos, desde, hasta) {
  const E = prepararEstado(movimientos, desde, hasta)
  const tipo = cuenta.tipo === 'cliente' ? 'Cliente' : 'Proveedor'
  const doc = pdfBase(`Estado de cuenta — ${cuenta.nombre}`, `${tipo}${cuenta.telefono ? ' · Tel. ' + cuenta.telefono : ''} · ${textoPeriodo(desde, hasta)}`)
  const colorFinal = E.final > 0.005 ? ROJO : VERDE
  const y = pdfResumen(doc, 30, [
    ...(desde ? [['Saldo anterior', pesos(E.anterior), GRIS]] : []),
    ['Cargos', pesos(E.cargos), 'C44117'],
    ['Pagos', pesos(E.pagos), VERDE],
    [`Saldo · ${estadoSaldo(cuenta.tipo, E.final)}`, pesos(E.final), colorFinal],
  ])
  const body = [
    ...(desde ? [[fechaAR(desde), 'Saldo anterior', '', '', '', pesos(E.anterior)]] : []),
    ...E.filas.map(x => [fechaAR(x.fecha), x.concepto, x.metodo, x.cargo != null ? pesos(x.cargo) : '', x.pago != null ? pesos(x.pago) : '', pesos(x.saldo)]),
  ]
  autoTable(doc, {
    ...ESTILO_TABLA, startY: y,
    head: [['Fecha', 'Concepto', 'Forma de pago', 'Cargo', 'Pago', 'Saldo']],
    body: body.length ? body : [['', 'Sin movimientos en el período', '', '', '', '']],
    foot: [['', 'Totales del período', '', pesos(E.cargos), pesos(E.pagos), pesos(E.final)]],
    columnStyles: { 0: { halign: 'center', cellWidth: 20 }, 2: { cellWidth: 26 }, 3: { halign: 'right', cellWidth: 24 }, 4: { halign: 'right', cellWidth: 24 }, 5: { halign: 'right', cellWidth: 26, fontStyle: 'bold' } },
    didParseCell: h => {
      if (h.section === 'foot' && h.column.index >= 3) h.cell.styles.halign = 'right'
      if (h.section !== 'body') return
      if (desde && h.row.index === 0) { h.cell.styles.fillColor = rgb(CREMA); h.cell.styles.fontStyle = 'italic' }
      if (h.column.index === 3 && h.cell.raw) h.cell.styles.textColor = rgb(ROJO)
      if (h.column.index === 4 && h.cell.raw) h.cell.styles.textColor = rgb(VERDE)
    },
  })
  pdfPies(doc)
  doc.save(`CEKETO_estado_de_cuenta_${nombreArchivo(cuenta.nombre)}_${hasta || hoyAR()}.pdf`)
}
