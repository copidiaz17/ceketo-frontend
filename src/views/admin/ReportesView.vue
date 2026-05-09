<template>
  <div class="p-6 lg:p-8">
    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="font-display text-3xl font-bold text-gray-900">Reportes</h1>
        <p class="font-body text-gray-500 mt-1">Ventas + Pedidos online unificados</p>
      </div>
      <div class="flex gap-2">
        <button @click="exportarExcel" :disabled="exportando"
          class="px-4 py-2 bg-green-50 border border-green-200 text-green-700 rounded-xl font-body text-sm hover:bg-green-100 transition-colors disabled:opacity-50">
          {{ exportando ? 'Generando...' : '⬇ Excel' }}
        </button>
        <button @click="exportarPDF"
          class="px-4 py-2 bg-red-50 border border-red-200 text-red-600 rounded-xl font-body text-sm hover:bg-red-100 transition-colors">
          ⬇ PDF
        </button>
      </div>
    </div>

    <!-- Filtros -->
    <div class="bg-white border border-gray-200 rounded-2xl p-5 mb-6">
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div>
          <label class="block font-body text-xs text-gray-400 mb-1.5">Desde</label>
          <input type="date" v-model="filtroDesde"
            class="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 font-body text-sm focus:outline-none focus:border-teal" />
        </div>
        <div>
          <label class="block font-body text-xs text-gray-400 mb-1.5">Hasta</label>
          <input type="date" v-model="filtroHasta"
            class="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 font-body text-sm focus:outline-none focus:border-teal" />
        </div>
        <div>
          <label class="block font-body text-xs text-gray-400 mb-1.5">Categoría</label>
          <select v-model="filtroCategoriaId" @change="filtroProductoId = null"
            class="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 font-body text-sm focus:outline-none focus:border-teal">
            <option :value="null">— Todas —</option>
            <option v-for="c in categorias" :key="c.id" :value="c.id">{{ c.nombre }}</option>
          </select>
        </div>
        <div>
          <label class="block font-body text-xs text-gray-400 mb-1.5">Producto</label>
          <select v-model="filtroProductoId"
            class="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 font-body text-sm focus:outline-none focus:border-teal">
            <option :value="null">— Todos —</option>
            <option v-for="p in productosFiltrados" :key="p.id" :value="p.id">{{ p.nombre }}</option>
          </select>
        </div>
      </div>
      <div class="flex gap-3">
        <button @click="cargar"
          class="px-5 py-2 bg-teal text-gray-900 rounded-xl font-body text-sm hover:bg-teal/80 transition-colors">
          Filtrar
        </button>
        <button @click="limpiar"
          class="px-5 py-2 bg-gray-50 border border-gray-200 text-gray-500 rounded-xl font-body text-sm hover:bg-gray-100 transition-colors">
          Limpiar
        </button>
      </div>
    </div>

    <div v-if="loading" class="text-center py-16 text-gray-400 font-body">Cargando reporte...</div>

    <template v-else>
      <!-- KPI Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div class="bg-white border border-gray-200 rounded-2xl p-5">
          <p class="font-body text-xs text-gray-400 mb-1">Total facturado</p>
          <p class="font-display text-2xl font-bold text-teal">${{ fmt(kpis.total) }}</p>
        </div>
        <div class="bg-white border border-gray-200 rounded-2xl p-5">
          <p class="font-body text-xs text-gray-400 mb-1">Operaciones</p>
          <p class="font-display text-2xl font-bold text-gray-900">{{ kpis.n_operaciones }}</p>
        </div>
        <div class="bg-white border border-gray-200 rounded-2xl p-5">
          <p class="font-body text-xs text-gray-400 mb-1">Ticket promedio</p>
          <p class="font-display text-2xl font-bold text-gray-900">${{ fmt(kpis.ticket_promedio) }}</p>
        </div>
        <div class="bg-white border border-gray-200 rounded-2xl p-5">
          <p class="font-body text-xs text-gray-400 mb-1">Unidades vendidas</p>
          <p class="font-display text-2xl font-bold text-gray-900">{{ kpis.unidades }}</p>
        </div>
      </div>

      <!-- Tabs -->
      <div class="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div class="flex border-b border-gray-200 overflow-x-auto">
          <button v-for="t in tabs" :key="t.id" @click="cambiarTab(t.id)"
            class="px-6 py-4 font-body text-sm whitespace-nowrap border-b-2 transition-all"
            :class="tabActivo === t.id
              ? 'border-teal text-teal font-semibold'
              : 'border-transparent text-gray-500 hover:text-gray-700'">
            {{ t.label }}
          </button>
        </div>

        <!-- Ventas -->
        <div v-if="tabActivo === 'ventas'" ref="tablaRef" class="overflow-x-auto">
          <table class="w-full font-body text-sm">
            <thead>
              <tr class="bg-gray-50 text-gray-400 text-xs border-b border-gray-200">
                <th class="text-left px-4 py-3">#</th>
                <th class="text-left px-4 py-3">Fecha</th>
                <th class="text-left px-4 py-3">Origen</th>
                <th class="text-left px-4 py-3">Cliente</th>
                <th class="text-left px-4 py-3">Pago</th>
                <th class="text-left px-4 py-3">Entrega</th>
                <th class="text-left px-4 py-3">Observación</th>
                <th class="text-right px-4 py-3">Desc.</th>
                <th class="text-right px-4 py-3">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="operaciones.length === 0"><td colspan="9" class="text-center py-12 text-gray-400">Sin datos</td></tr>
              <tr v-for="op in operaciones" :key="op.id" class="border-b border-gray-100 hover:bg-gray-50"
                :class="op.descuento > 0 ? 'bg-orange-50/30' : ''">
                <td class="px-4 py-3 font-mono text-xs text-gray-400">{{ op.id }}</td>
                <td class="px-4 py-3 text-xs text-gray-500">{{ formatFecha(op.fecha) }}</td>
                <td class="px-4 py-3">
                  <span class="px-2 py-0.5 rounded-full text-xs font-medium"
                    :class="op.origen === 'Online' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-600'">
                    {{ op.origen }}
                  </span>
                </td>
                <td class="px-4 py-3 text-gray-700">{{ op.cliente }}</td>
                <td class="px-4 py-3 text-xs text-gray-500 capitalize">{{ op.metodo_pago }}</td>
                <td class="px-4 py-3">
                  <span class="px-2 py-0.5 rounded-full text-xs font-medium"
                    :class="op.entrega === 'Delivery' ? 'bg-purple-50 text-purple-600' : 'bg-gray-100 text-gray-600'">
                    {{ op.entrega }}
                  </span>
                </td>
                <td class="px-4 py-3 text-xs text-gray-500 max-w-[180px] truncate" :title="op.nota">{{ op.nota || '—' }}</td>
                <td class="px-4 py-3 text-right">
                  <span v-if="op.descuento > 0" class="px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-600">
                    -{{ op.descuento }}%
                  </span>
                  <span v-else class="text-gray-300 text-xs">—</span>
                </td>
                <td class="px-4 py-3 text-right font-bold text-teal">${{ fmt(op.total) }}</td>
              </tr>
            </tbody>
            <tfoot v-if="operaciones.length > 0">
              <tr class="bg-teal/10 border-t-2 border-teal/30">
                <td colspan="8" class="px-4 py-3 font-semibold text-gray-700 text-sm">TOTAL</td>
                <td class="px-4 py-3 text-right font-display font-bold text-teal text-base">${{ fmt(kpis.total) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- Detalle -->
        <div v-if="tabActivo === 'detalle'" ref="tablaRef" class="overflow-x-auto">
          <table class="w-full font-body text-sm">
            <thead>
              <tr class="bg-gray-50 text-gray-400 text-xs border-b border-gray-200">
                <th class="text-left px-4 py-3">Operación</th>
                <th class="text-left px-4 py-3">Fecha</th>
                <th class="text-left px-4 py-3">Categoría</th>
                <th class="text-left px-4 py-3">Producto</th>
                <th class="text-left px-4 py-3">Código</th>
                <th class="text-right px-4 py-3">Cant.</th>
                <th class="text-right px-4 py-3">P. Unit.</th>
                <th class="text-right px-4 py-3">Desc.</th>
                <th class="text-right px-4 py-3">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="detalle.length === 0"><td colspan="9" class="text-center py-12 text-gray-400">Sin datos</td></tr>
              <tr v-for="(d, i) in detalle" :key="i" class="border-b border-gray-100 hover:bg-gray-50"
                :class="d.descuento_pct > 0 ? 'bg-orange-50/30' : ''">
                <td class="px-4 py-2.5 font-mono text-xs text-gray-400">{{ d.operacion_id }}</td>
                <td class="px-4 py-2.5 text-xs text-gray-500">{{ formatFecha(d.fecha) }}</td>
                <td class="px-4 py-2.5 text-xs text-gray-500">{{ d.categoria }}</td>
                <td class="px-4 py-2.5 text-gray-800">
                  {{ d.producto }}
                  <span v-if="d.nota" class="ml-1 text-xs text-gray-400 italic" :title="d.nota">· {{ d.nota.length > 20 ? d.nota.slice(0,20)+'…' : d.nota }}</span>
                </td>
                <td class="px-4 py-2.5 font-mono text-xs text-gray-400">{{ d.codigo }}</td>
                <td class="px-4 py-2.5 text-right font-bold text-gray-700">{{ d.cantidad }}</td>
                <td class="px-4 py-2.5 text-right text-gray-500">
                  <span v-if="d.descuento_pct > 0" class="line-through text-gray-300 text-xs mr-1">${{ fmt(d.subtotal_original / d.cantidad) }}</span>
                  ${{ fmt(d.precio_unit) }}
                </td>
                <td class="px-4 py-2.5 text-right">
                  <span v-if="d.descuento_pct > 0" class="px-1.5 py-0.5 rounded text-xs font-semibold bg-orange-100 text-orange-600">
                    -{{ d.descuento_pct }}%
                  </span>
                  <span v-else class="text-gray-300 text-xs">—</span>
                </td>
                <td class="px-4 py-2.5 text-right font-bold text-teal">${{ fmt(d.subtotal) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Resumen -->
        <div v-if="tabActivo === 'resumen'" ref="tablaRef" class="overflow-x-auto">
          <table class="w-full font-body text-sm">
            <thead>
              <tr class="bg-gray-50 text-gray-400 text-xs border-b border-gray-200">
                <th class="text-left px-4 py-3">Categoría</th>
                <th class="text-left px-4 py-3">Producto</th>
                <th class="text-left px-4 py-3">Código</th>
                <th class="text-right px-4 py-3">Unidades</th>
                <th class="text-right px-4 py-3">P. Unit.</th>
                <th class="text-right px-4 py-3">Total</th>
                <th class="text-right px-4 py-3 w-40">% Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="resumen.length === 0"><td colspan="7" class="text-center py-12 text-gray-400">Sin datos</td></tr>
              <tr v-for="(r, i) in resumen" :key="i" class="border-b border-gray-100 hover:bg-gray-50">
                <td class="px-4 py-2.5 text-xs text-gray-500">{{ r.categoria }}</td>
                <td class="px-4 py-2.5 text-gray-800 font-medium">{{ r.producto }}</td>
                <td class="px-4 py-2.5 font-mono text-xs text-gray-400">{{ r.codigo }}</td>
                <td class="px-4 py-2.5 text-right font-bold text-gray-700">{{ r.cantidad }}</td>
                <td class="px-4 py-2.5 text-right text-gray-500">${{ fmt(r.precio_unit) }}</td>
                <td class="px-4 py-2.5 text-right font-bold text-teal">${{ fmt(r.total) }}</td>
                <td class="px-4 py-2.5 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <div class="w-20 bg-gray-100 rounded-full h-1.5">
                      <div class="bg-teal h-1.5 rounded-full" :style="{ width: Math.min(r.pct, 100) + '%' }"></div>
                    </div>
                    <span class="text-xs text-gray-500 w-10 text-right">{{ r.pct }}%</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Gráficos -->
        <div v-if="tabActivo === 'graficos'" class="p-6">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div class="bg-gray-50 rounded-2xl p-4">
              <h3 class="font-body text-sm font-semibold text-gray-600 mb-4">Ventas por día</h3>
              <div class="relative" style="height:260px">
                <canvas ref="chartBarRef"></canvas>
              </div>
            </div>
            <div class="bg-gray-50 rounded-2xl p-4">
              <h3 class="font-body text-sm font-semibold text-gray-600 mb-4">Distribución por categoría</h3>
              <div class="relative" style="height:260px">
                <canvas ref="chartDoughnutRef"></canvas>
              </div>
            </div>
            <div class="bg-gray-50 rounded-2xl p-4 lg:col-span-2">
              <h3 class="font-body text-sm font-semibold text-gray-600 mb-4">Top 10 productos</h3>
              <div class="relative" style="height:300px">
                <canvas ref="chartTopRef"></canvas>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import axios from 'axios'
import ExcelJS from 'exceljs'
import html2pdf from 'html2pdf.js'
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

// ── Estado ────────────────────────────────────────────────────────────────────
const loading           = ref(false)
const exportando        = ref(false)
const categorias        = ref([])
const productos         = ref([])
const filtroDesde       = ref('')
const filtroHasta       = ref('')
const filtroCategoriaId = ref(null)
const filtroProductoId  = ref(null)
const tabActivo         = ref('ventas')
const tablaRef          = ref(null)

const kpis          = ref({ total: 0, n_operaciones: 0, ticket_promedio: 0, unidades: 0 })
const operaciones   = ref([])
const detalle       = ref([])
const resumen       = ref([])
const por_categoria = ref([])
const por_dia       = ref([])

const chartBarRef      = ref(null)
const chartDoughnutRef = ref(null)
const chartTopRef      = ref(null)
let chartBar = null, chartDoughnut = null, chartTop = null

const tabs = [
  { id: 'ventas',   label: 'Ventas' },
  { id: 'detalle',  label: 'Detalle de productos' },
  { id: 'resumen',  label: 'Resumen por producto' },
  { id: 'graficos', label: 'Gráficos' },
]

const COLORES = ['2DD4BF','F97316','6366F1','EC4899','EAB308','10B981','3B82F6','A855F7','EF4444','14B8A6']

// ── Computeds ─────────────────────────────────────────────────────────────────
const productosFiltrados = computed(() =>
  filtroCategoriaId.value
    ? productos.value.filter(p => p.categoria?.id === filtroCategoriaId.value)
    : productos.value
)

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = n => Math.round(n || 0).toLocaleString('es-AR')

function formatFecha(f) {
  if (!f) return '—'
  return new Date(f).toLocaleString('es-AR', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
    timeZone: 'America/Argentina/Buenos_Aires',
  })
}

function formatFechaCorta(f) {
  if (!f) return '—'
  return new Date(f).toLocaleDateString('es-AR', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    timeZone: 'America/Argentina/Buenos_Aires',
  })
}

// ── Carga ─────────────────────────────────────────────────────────────────────
async function cargar() {
  loading.value = true
  try {
    const params = new URLSearchParams()
    if (filtroDesde.value)       params.set('fecha_desde',  filtroDesde.value)
    if (filtroHasta.value)       params.set('fecha_hasta',  filtroHasta.value)
    if (filtroCategoriaId.value) params.set('categoria_id', filtroCategoriaId.value)
    if (filtroProductoId.value)  params.set('producto_id',  filtroProductoId.value)
    const { data } = await axios.get(`/api/admin/reportes?${params}`)
    kpis.value          = data.kpis
    operaciones.value   = data.operaciones
    detalle.value       = data.detalle
    resumen.value       = data.resumen
    por_categoria.value = data.por_categoria
    por_dia.value       = data.por_dia
    if (tabActivo.value === 'graficos') setTimeout(crearGraficos, 100)
  } catch { }
  finally { loading.value = false }
}

function limpiar() {
  filtroDesde.value = ''; filtroHasta.value = ''
  filtroCategoriaId.value = null; filtroProductoId.value = null
  cargar()
}

function cambiarTab(id) {
  tabActivo.value = id
  if (id === 'graficos') setTimeout(crearGraficos, 150)
}

// ── Gráficos en pantalla ──────────────────────────────────────────────────────
function crearGraficos() {
  if (chartBarRef.value) {
    if (chartBar) chartBar.destroy()
    chartBar = new Chart(chartBarRef.value, {
      type: 'bar',
      data: {
        labels: por_dia.value.map(d => { const [,m,day] = d.dia.split('-'); return `${day}/${m}` }),
        datasets: [{ label: 'Total $', data: por_dia.value.map(d => d.total), backgroundColor: '#2DD4BF', borderRadius: 6 }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { ticks: { callback: v => '$' + Math.round(v/1000) + 'K' }, grid: { color: '#F3F4F6' } },
          x: { grid: { display: false } },
        },
      },
    })
  }
  if (chartDoughnutRef.value) {
    if (chartDoughnut) chartDoughnut.destroy()
    chartDoughnut = new Chart(chartDoughnutRef.value, {
      type: 'doughnut',
      data: {
        labels: por_categoria.value.map(c => c.categoria),
        datasets: [{ data: por_categoria.value.map(c => c.total), backgroundColor: COLORES.map(c => '#' + c), borderWidth: 2, borderColor: '#fff' }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right', labels: { font: { size: 11 }, boxWidth: 12 } },
          tooltip: { callbacks: { label: ctx => ` $${Math.round(ctx.raw).toLocaleString('es-AR')} (${por_categoria.value[ctx.dataIndex]?.pct}%)` } },
        },
      },
    })
  }
  if (chartTopRef.value) {
    if (chartTop) chartTop.destroy()
    const top10 = resumen.value.slice(0, 10)
    chartTop = new Chart(chartTopRef.value, {
      type: 'bar',
      data: {
        labels: top10.map(r => r.producto.length > 32 ? r.producto.slice(0, 32) + '…' : r.producto),
        datasets: [{ label: 'Total $', data: top10.map(r => r.total), backgroundColor: COLORES.map(c => '#' + c), borderRadius: 6 }],
      },
      options: {
        indexAxis: 'y', responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { callback: v => '$' + Math.round(v/1000) + 'K' }, grid: { color: '#F3F4F6' } },
          y: { grid: { display: false }, ticks: { font: { size: 11 } } },
        },
      },
    })
  }
}

// ── Render gráfico a imagen base64 (para Excel) ───────────────────────────────
function renderChartImage(type, labels, datasets, options = {}, w = 900, h = 400) {
  return new Promise(resolve => {
    const canvas = document.createElement('canvas')
    canvas.width = w; canvas.height = h
    canvas.style.position = 'absolute'; canvas.style.left = '-9999px'
    document.body.appendChild(canvas)
    const ch = new Chart(canvas, {
      type,
      data: { labels, datasets },
      options: { ...options, animation: false, responsive: false },
    })
    setTimeout(() => {
      const img = canvas.toDataURL('image/png').split(',')[1]
      ch.destroy(); document.body.removeChild(canvas)
      resolve(img)
    }, 200)
  })
}

// ── Exportar Excel profesional ────────────────────────────────────────────────
async function exportarExcel() {
  exportando.value = true
  try {
    const wb = new ExcelJS.Workbook()
    wb.creator = 'Ceketo'
    wb.created = new Date()

    const VERDE_OSC  = '1A5F5A'
    const VERDE_TEAL = '2DD4BF'
    const VERDE_LIGHT = 'E6FFFE'
    const GRIS_ALT   = 'F9FAFB'
    const BORDE = { style: 'thin', color: { argb: 'FFE5E7EB' } }
    const BORDE_H = { style: 'medium', color: { argb: 'FF' + VERDE_TEAL } }

    const rango = [filtroDesde.value, filtroHasta.value].filter(Boolean).join(' al ') || 'Período completo'
    const fechaGen = new Date().toLocaleDateString('es-AR')

    function addTitle(ws, titulo, ncols) {
      ws.mergeCells(1, 1, 1, ncols)
      const t = ws.getRow(1).getCell(1)
      t.value = titulo
      t.font = { bold: true, size: 15, color: { argb: 'FF' + VERDE_OSC } }
      t.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + VERDE_LIGHT } }
      t.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
      ws.getRow(1).height = 36

      ws.mergeCells(2, 1, 2, ncols)
      const s = ws.getRow(2).getCell(1)
      s.value = `Período: ${rango}   |   Generado: ${fechaGen}   |   Total: $${fmt(kpis.value.total)}`
      s.font = { size: 9, color: { argb: 'FF6B7280' }, italic: true }
      s.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } }
      s.alignment = { vertical: 'middle', indent: 1 }
      ws.getRow(2).height = 18
    }

    function styleHeader(row, ncols) {
      for (let c = 1; c <= ncols; c++) {
        const cell = row.getCell(c)
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + VERDE_OSC } }
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 }
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: false }
        cell.border = { top: BORDE_H, bottom: BORDE_H, left: BORDE, right: BORDE }
      }
      row.height = 28
    }

    function styleData(row, ncols, alt = false, isTotal = false) {
      const bg = isTotal ? 'FF' + VERDE_LIGHT : alt ? 'FFF9FAFB' : 'FFFFFFFF'
      for (let c = 1; c <= ncols; c++) {
        const cell = row.getCell(c)
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } }
        cell.font = { size: 10, bold: isTotal }
        cell.alignment = { vertical: 'middle' }
        cell.border = { top: BORDE, bottom: BORDE, left: BORDE, right: BORDE }
      }
      row.height = isTotal ? 24 : 20
    }

    function numFmt(row, cols, format = '"$"#,##0') {
      cols.forEach(c => { row.getCell(c).numFmt = format; row.getCell(c).alignment = { horizontal: 'right', vertical: 'middle' } })
    }

    // ── Hoja 1: Ventas ────────────────────────────────────────────────────────
    const ws1 = wb.addWorksheet('Ventas', { views: [{ state: 'frozen', ySplit: 3 }] })
    ws1.columns = [
      { key: 'id',       width: 10 }, { key: 'fecha',     width: 18 },
      { key: 'origen',   width: 10 }, { key: 'cliente',   width: 26 },
      { key: 'metodo',   width: 16 }, { key: 'entrega',   width: 12 },
      { key: 'nota',     width: 28 }, { key: 'descuento', width: 12 },
      { key: 'total',    width: 16 },
    ]
    addTitle(ws1, 'VENTAS', 9)
    const h1 = ws1.getRow(3)
    h1.values = ['#', 'Fecha', 'Origen', 'Cliente', 'Método de pago', 'Entrega', 'Observación', 'Desc. %', 'Total']
    styleHeader(h1, 9)
    operaciones.value.forEach((op, i) => {
      const r = ws1.addRow([op.id, formatFechaCorta(op.fecha), op.origen, op.cliente, op.metodo_pago, op.entrega, op.nota || '', op.descuento > 0 ? `-${op.descuento}%` : '', op.total])
      styleData(r, 9, i % 2 === 1)
      numFmt(r, [9])
      if (op.descuento > 0) {
        r.getCell(8).font = { bold: true, color: { argb: 'FFEA580C' }, size: 10 }
        r.getCell(8).alignment = { horizontal: 'center', vertical: 'middle' }
      }
    })
    const tot1 = ws1.addRow(['', '', '', '', '', '', '', 'TOTAL', kpis.value.total])
    styleData(tot1, 9, false, true)
    numFmt(tot1, [9])

    // ── Hoja 2: Detalle de productos ──────────────────────────────────────────
    const ws2 = wb.addWorksheet('Detalle de productos', { views: [{ state: 'frozen', ySplit: 3 }] })
    ws2.columns = [
      { key: 'op',       width: 10 }, { key: 'fecha',    width: 16 },
      { key: 'origen',   width: 9  }, { key: 'cat',      width: 24 },
      { key: 'prod',     width: 32 }, { key: 'cod',      width: 11 },
      { key: 'cant',     width: 9  }, { key: 'precio',   width: 14 },
      { key: 'desc',     width: 10 }, { key: 'sub',      width: 14 },
    ]
    addTitle(ws2, 'DETALLE DE PRODUCTOS', 10)
    const h2 = ws2.getRow(3)
    h2.values = ['Operación', 'Fecha', 'Origen', 'Categoría', 'Producto', 'Código', 'Cant.', 'P. Unit.', 'Desc. %', 'Subtotal']
    styleHeader(h2, 10)
    // Agrupar detalle por operación y agregar fila de subtotal al final de cada grupo
    let curOpId = null, opTotal = 0, opCant = 0, altIdx = 0
    const flushOpTotal = () => {
      if (curOpId === null) return
      const tr = ws2.addRow(['', '', '', '', `TOTAL ${curOpId}`, '', opCant, '', '', opTotal])
      for (let c = 1; c <= 10; c++) {
        const cell = tr.getCell(c)
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1FAE5' } }
        cell.font = { bold: true, size: 10 }
        cell.border = { top: { style: 'medium', color: { argb: 'FF2DD4BF' } }, bottom: BORDE, left: BORDE, right: BORDE }
        cell.alignment = { vertical: 'middle' }
      }
      tr.getCell(5).alignment = { horizontal: 'right', vertical: 'middle' }
      tr.getCell(7).alignment = { horizontal: 'center', vertical: 'middle' }
      tr.getCell(10).numFmt = '"$"#,##0'; tr.getCell(10).alignment = { horizontal: 'right', vertical: 'middle' }
      tr.height = 22
      altIdx = 0
    }
    detalle.value.forEach(d => {
      if (d.operacion_id !== curOpId) {
        flushOpTotal()
        curOpId = d.operacion_id; opTotal = 0; opCant = 0
      }
      const descLabel = d.descuento_pct > 0 ? `-${d.descuento_pct}%` : ''
      const r = ws2.addRow([d.operacion_id, formatFechaCorta(d.fecha), d.origen, d.categoria, d.producto, d.codigo, d.cantidad, d.precio_unit, descLabel, d.subtotal])
      styleData(r, 10, altIdx % 2 === 1)
      numFmt(r, [8, 10])
      r.getCell(7).alignment = { horizontal: 'center', vertical: 'middle' }
      if (d.descuento_pct > 0) {
        r.getCell(9).font = { bold: true, color: { argb: 'FFEA580C' }, size: 10 }
        r.getCell(9).alignment = { horizontal: 'center', vertical: 'middle' }
      }
      opTotal += d.subtotal; opCant += d.cantidad; altIdx++
    })
    flushOpTotal()

    // ── Hoja 3: Resumen por producto ──────────────────────────────────────────
    const ws3 = wb.addWorksheet('Resumen por producto', { views: [{ state: 'frozen', ySplit: 3 }] })
    ws3.columns = [
      { key: 'cat',    width: 26 }, { key: 'prod',     width: 34 },
      { key: 'cod',    width: 11 }, { key: 'cant',     width: 10 },
      { key: 'precio', width: 14 }, { key: 'total',    width: 16 },
      { key: 'pct',    width: 11 },
    ]
    addTitle(ws3, 'RESUMEN POR PRODUCTO', 7)
    const h3 = ws3.getRow(3)
    h3.values = ['Categoría', 'Producto', 'Código', 'Unidades', 'P. Unit.', 'Total', '% Total']
    styleHeader(h3, 7)
    resumen.value.forEach((r, i) => {
      const row = ws3.addRow([r.categoria, r.producto, r.codigo, r.cantidad, r.precio_unit, r.total, r.pct / 100])
      styleData(row, 7, i % 2 === 1)
      numFmt(row, [5, 6])
      row.getCell(4).alignment = { horizontal: 'center', vertical: 'middle' }
      row.getCell(7).numFmt = '0.0%'
      row.getCell(7).alignment = { horizontal: 'center', vertical: 'middle' }
    })
    const tot3 = ws3.addRow(['', 'TOTAL', '', resumen.value.reduce((s, r) => s + r.cantidad, 0), '', kpis.value.total, 1])
    styleData(tot3, 7, false, true)
    numFmt(tot3, [6]); tot3.getCell(7).numFmt = '0.0%'

    // ── Hoja 4: Por categoría + gráfico ───────────────────────────────────────
    const ws4 = wb.addWorksheet('Por categoría', { views: [{ state: 'frozen', ySplit: 3 }] })
    ws4.columns = [{ key: 'cat', width: 36 }, { key: 'total', width: 16 }, { key: 'pct', width: 11 }]
    addTitle(ws4, 'VENTAS POR CATEGORÍA', 3)
    const h4 = ws4.getRow(3)
    h4.values = ['Categoría', 'Total $', '% del total']
    styleHeader(h4, 3)
    por_categoria.value.forEach((c, i) => {
      const row = ws4.addRow([c.categoria, c.total, c.pct / 100])
      styleData(row, 3, i % 2 === 1)
      numFmt(row, [2]); row.getCell(3).numFmt = '0.0%'; row.getCell(3).alignment = { horizontal: 'center', vertical: 'middle' }
    })

    // ── Gráficos como imágenes ─────────────────────────────────────────────────
    // Torta categorías → hoja 4
    const imgDonut = await renderChartImage(
      'doughnut',
      por_categoria.value.map(c => c.categoria),
      [{ data: por_categoria.value.map(c => c.total), backgroundColor: COLORES.map(c => '#' + c), borderWidth: 2, borderColor: '#fff' }],
      { plugins: { legend: { position: 'right' } } }
    )
    const idDonut = wb.addImage({ base64: imgDonut, extension: 'png' })
    ws4.addImage(idDonut, { tl: { col: 4, row: 2 }, ext: { width: 480, height: 320 } })

    // Barras por día → hoja 1
    const imgBar = await renderChartImage(
      'bar',
      por_dia.value.map(d => { const [,m,day] = d.dia.split('-'); return `${day}/${m}` }),
      [{ label: 'Total', data: por_dia.value.map(d => d.total), backgroundColor: '#2DD4BF', borderRadius: 4 }],
      { plugins: { legend: { display: false } }, scales: { y: { ticks: { callback: v => '$' + Math.round(v/1000) + 'K' } } } }
    )
    const idBar = wb.addImage({ base64: imgBar, extension: 'png' })
    ws1.addImage(idBar, { tl: { col: 8, row: 2 }, ext: { width: 600, height: 320 } })

    // Top 10 horizontal → hoja 3
    const top10 = resumen.value.slice(0, 10)
    const imgTop = await renderChartImage(
      'bar',
      top10.map(r => r.producto.length > 30 ? r.producto.slice(0, 30) + '…' : r.producto),
      [{ label: 'Total', data: top10.map(r => r.total), backgroundColor: COLORES.map(c => '#' + c), borderRadius: 4 }],
      { indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { ticks: { callback: v => '$' + Math.round(v/1000) + 'K' } } } },
      900, 440
    )
    const idTop = wb.addImage({ base64: imgTop, extension: 'png' })
    ws3.addImage(idTop, { tl: { col: 8, row: 2 }, ext: { width: 600, height: 380 } })

    // ── Descargar ──────────────────────────────────────────────────────────────
    const buffer = await wb.xlsx.writeBuffer()
    const blob   = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url    = URL.createObjectURL(blob)
    const a      = document.createElement('a')
    a.href = url
    a.download = `ceketo_reporte_${fechaGen.replace(/\//g, '-')}.xlsx`
    a.click()
    URL.revokeObjectURL(url)
  } catch (err) {
    console.error(err)
    alert('Error al generar Excel: ' + err.message)
  } finally {
    exportando.value = false
  }
}

// ── Exportar PDF ──────────────────────────────────────────────────────────────
function exportarPDF() {
  const hoy       = new Date().toLocaleDateString('es-AR')
  const nombreTab = tabs.find(t => t.id === tabActivo.value)?.label || tabActivo.value
  if (!tablaRef.value) return alert('Cambiá a una pestaña de tabla para exportar PDF')
  const clone = tablaRef.value.cloneNode(true)
  const wrap  = document.createElement('div')
  wrap.style.cssText = 'font-family: sans-serif; font-size: 10px;'
  const titulo = document.createElement('h2')
  titulo.textContent = `Reporte Ceketo — ${nombreTab} — ${hoy}`
  titulo.style.cssText = 'font-size: 13px; margin-bottom: 8px; color: #1A5F5A;'
  wrap.appendChild(titulo); wrap.appendChild(clone)
  html2pdf().set({
    margin: [10, 8, 10, 8], filename: `ceketo_reporte_${hoy.replace(/\//g, '-')}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
  }).from(wrap).save()
}

// ── Init ──────────────────────────────────────────────────────────────────────
onMounted(async () => {
  const [catRes, prodRes] = await Promise.all([
    axios.get('/api/categorias'),
    axios.get('/api/productos?limit=500'),
  ])
  categorias.value = catRes.data
  productos.value  = prodRes.data
  await cargar()
})
</script>
