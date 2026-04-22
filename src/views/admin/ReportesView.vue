<template>
  <div class="p-6 lg:p-8">
    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="font-display text-3xl font-bold text-gray-900">Reportes</h1>
        <p class="font-body text-gray-500 mt-1">Ventas + Pedidos online unificados</p>
      </div>
      <div class="flex gap-2">
        <button @click="exportarExcel"
          class="px-4 py-2 bg-green-50 border border-green-200 text-green-700 rounded-xl font-body text-sm hover:bg-green-100 transition-colors">
          ⬇ Excel
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

    <!-- Loading -->
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
        <!-- Tab bar -->
        <div class="flex border-b border-gray-200 overflow-x-auto">
          <button v-for="t in tabs" :key="t.id" @click="tabActivo = t.id"
            class="px-6 py-4 font-body text-sm whitespace-nowrap border-b-2 transition-all"
            :class="tabActivo === t.id
              ? 'border-teal text-teal font-semibold'
              : 'border-transparent text-gray-500 hover:text-gray-700'">
            {{ t.label }}
          </button>
        </div>

        <!-- Tab: Ventas -->
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
                <th class="text-right px-4 py-3">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="operaciones.length === 0">
                <td colspan="7" class="text-center py-12 text-gray-400">Sin datos</td>
              </tr>
              <tr v-for="op in operaciones" :key="op.id"
                class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
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
                <td class="px-4 py-3 text-right font-bold text-teal">${{ fmt(op.total) }}</td>
              </tr>
            </tbody>
            <tfoot v-if="operaciones.length > 0">
              <tr class="bg-gray-50 border-t-2 border-gray-200">
                <td colspan="6" class="px-4 py-3 font-body text-sm font-semibold text-gray-700">Total</td>
                <td class="px-4 py-3 text-right font-display font-bold text-teal">${{ fmt(kpis.total) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- Tab: Detalle -->
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
                <th class="text-right px-4 py-3">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="detalle.length === 0">
                <td colspan="8" class="text-center py-12 text-gray-400">Sin datos</td>
              </tr>
              <tr v-for="(d, i) in detalle" :key="i"
                class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td class="px-4 py-2.5 font-mono text-xs text-gray-400">{{ d.operacion_id }}</td>
                <td class="px-4 py-2.5 text-xs text-gray-500">{{ formatFecha(d.fecha) }}</td>
                <td class="px-4 py-2.5 text-xs text-gray-500">{{ d.categoria }}</td>
                <td class="px-4 py-2.5 text-gray-800">{{ d.producto }}</td>
                <td class="px-4 py-2.5 font-mono text-xs text-gray-400">{{ d.codigo }}</td>
                <td class="px-4 py-2.5 text-right font-bold text-gray-700">{{ d.cantidad }}</td>
                <td class="px-4 py-2.5 text-right text-gray-500">${{ fmt(d.precio_unit) }}</td>
                <td class="px-4 py-2.5 text-right font-bold text-teal">${{ fmt(d.subtotal) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Tab: Resumen -->
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
                <th class="text-right px-4 py-3">% Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="resumen.length === 0">
                <td colspan="7" class="text-center py-12 text-gray-400">Sin datos</td>
              </tr>
              <tr v-for="(r, i) in resumen" :key="i"
                class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td class="px-4 py-2.5 text-xs text-gray-500">{{ r.categoria }}</td>
                <td class="px-4 py-2.5 text-gray-800 font-medium">{{ r.producto }}</td>
                <td class="px-4 py-2.5 font-mono text-xs text-gray-400">{{ r.codigo }}</td>
                <td class="px-4 py-2.5 text-right font-bold text-gray-700">{{ r.cantidad }}</td>
                <td class="px-4 py-2.5 text-right text-gray-500">${{ fmt(r.precio_unit) }}</td>
                <td class="px-4 py-2.5 text-right font-bold text-teal">${{ fmt(r.total) }}</td>
                <td class="px-4 py-2.5 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <div class="w-16 bg-gray-100 rounded-full h-1.5">
                      <div class="bg-teal h-1.5 rounded-full" :style="{ width: r.pct + '%' }"></div>
                    </div>
                    <span class="text-xs text-gray-500 w-10 text-right">{{ r.pct }}%</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Tab: Gráficos -->
        <div v-if="tabActivo === 'graficos'" class="p-6">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Ventas por día -->
            <div>
              <h3 class="font-body text-sm font-semibold text-gray-600 mb-4">Ventas por día</h3>
              <div class="relative h-64">
                <canvas ref="chartBarRef"></canvas>
              </div>
            </div>
            <!-- Ventas por categoría -->
            <div>
              <h3 class="font-body text-sm font-semibold text-gray-600 mb-4">Distribución por categoría</h3>
              <div class="relative h-64">
                <canvas ref="chartDoughnutRef"></canvas>
              </div>
            </div>
            <!-- Top 10 productos -->
            <div class="lg:col-span-2">
              <h3 class="font-body text-sm font-semibold text-gray-600 mb-4">Top 10 productos</h3>
              <div class="relative h-72">
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
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import axios from 'axios'
import * as XLSX from 'xlsx'
import html2pdf from 'html2pdf.js'
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

// ── Estado ────────────────────────────────────────────────────────────────────
const loading          = ref(false)
const categorias       = ref([])
const productos        = ref([])
const filtroDesde      = ref('')
const filtroHasta      = ref('')
const filtroCategoriaId = ref(null)
const filtroProductoId  = ref(null)
const tabActivo        = ref('ventas')
const tablaRef         = ref(null)

// Datos del reporte
const kpis             = ref({ total: 0, n_operaciones: 0, ticket_promedio: 0, unidades: 0 })
const operaciones      = ref([])
const detalle          = ref([])
const resumen          = ref([])
const por_categoria    = ref([])
const por_dia          = ref([])

// Canvas refs
const chartBarRef      = ref(null)
const chartDoughnutRef = ref(null)
const chartTopRef      = ref(null)
let   chartBar         = null
let   chartDoughnut    = null
let   chartTop         = null

const tabs = [
  { id: 'ventas',    label: 'Ventas' },
  { id: 'detalle',   label: 'Detalle de productos' },
  { id: 'resumen',   label: 'Resumen por producto' },
  { id: 'graficos',  label: 'Gráficos' },
]

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

// ── Carga de datos ────────────────────────────────────────────────────────────
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
  } catch { }
  finally { loading.value = false }
}

function limpiar() {
  filtroDesde.value       = ''
  filtroHasta.value       = ''
  filtroCategoriaId.value = null
  filtroProductoId.value  = null
  cargar()
}

// ── Gráficos ──────────────────────────────────────────────────────────────────
const COLORES = [
  '#2DD4BF','#F97316','#6366F1','#EC4899','#EAB308',
  '#10B981','#3B82F6','#A855F7','#EF4444','#14B8A6',
]

function crearGraficos() {
  nextTick(() => {
    // Bar: por día
    if (chartBarRef.value) {
      if (chartBar) chartBar.destroy()
      chartBar = new Chart(chartBarRef.value, {
        type: 'bar',
        data: {
          labels: por_dia.value.map(d => {
            const [y, m, day] = d.dia.split('-')
            return `${day}/${m}`
          }),
          datasets: [{
            label: 'Total $',
            data: por_dia.value.map(d => d.total),
            backgroundColor: '#2DD4BF',
            borderRadius: 6,
          }],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { ticks: { callback: v => '$' + Math.round(v / 1000) + 'K' }, grid: { color: '#F3F4F6' } },
            x: { grid: { display: false } },
          },
        },
      })
    }
    // Doughnut: por categoría
    if (chartDoughnutRef.value) {
      if (chartDoughnut) chartDoughnut.destroy()
      chartDoughnut = new Chart(chartDoughnutRef.value, {
        type: 'doughnut',
        data: {
          labels: por_categoria.value.map(c => c.categoria),
          datasets: [{
            data: por_categoria.value.map(c => c.total),
            backgroundColor: COLORES,
            borderWidth: 2,
            borderColor: '#fff',
          }],
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
    // Bar horizontal: top 10 productos
    if (chartTopRef.value) {
      if (chartTop) chartTop.destroy()
      const top10 = resumen.value.slice(0, 10)
      chartTop = new Chart(chartTopRef.value, {
        type: 'bar',
        data: {
          labels: top10.map(r => r.producto.length > 30 ? r.producto.slice(0, 30) + '…' : r.producto),
          datasets: [{
            label: 'Total $',
            data: top10.map(r => r.total),
            backgroundColor: COLORES,
            borderRadius: 6,
          }],
        },
        options: {
          indexAxis: 'y',
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { callback: v => '$' + Math.round(v / 1000) + 'K' }, grid: { color: '#F3F4F6' } },
            y: { grid: { display: false }, ticks: { font: { size: 11 } } },
          },
        },
      })
    }
  })
}

// Crear gráficos cuando se cambia a la pestaña gráficos o cuando se cargan datos
watch(tabActivo, val => { if (val === 'graficos') crearGraficos() })
watch(por_dia,   ()  => { if (tabActivo.value === 'graficos') crearGraficos() })

// ── Exportar Excel ────────────────────────────────────────────────────────────
function exportarExcel() {
  const wb  = XLSX.utils.book_new()

  // Hoja 1: Ventas
  const h1 = ['#', 'Fecha', 'Origen', 'Cliente', 'Método pago', 'Entrega', 'Total']
  const r1  = operaciones.value.map(op => [op.id, formatFecha(op.fecha), op.origen, op.cliente, op.metodo_pago, op.entrega, op.total])
  const ws1 = XLSX.utils.aoa_to_sheet([h1, ...r1])
  ws1['!cols'] = [8, 16, 8, 22, 14, 10, 12].map(w => ({ wch: w }))
  XLSX.utils.book_append_sheet(wb, ws1, 'Ventas')

  // Hoja 2: Detalle de productos
  const h2 = ['Operación', 'Fecha', 'Origen', 'Categoría', 'Producto', 'Código', 'Cantidad', 'P. Unit.', 'Subtotal']
  const r2  = detalle.value.map(d => [d.operacion_id, formatFecha(d.fecha), d.origen, d.categoria, d.producto, d.codigo, d.cantidad, d.precio_unit, d.subtotal])
  const ws2 = XLSX.utils.aoa_to_sheet([h2, ...r2])
  ws2['!cols'] = [8, 16, 8, 22, 30, 10, 8, 10, 12].map(w => ({ wch: w }))
  XLSX.utils.book_append_sheet(wb, ws2, 'Detalle de productos')

  // Hoja 3: Resumen por producto
  const h3 = ['Categoría', 'Producto', 'Código', 'Unidades', 'P. Unit.', 'Total', '% del total']
  const r3  = resumen.value.map(r => [r.categoria, r.producto, r.codigo, r.cantidad, r.precio_unit, r.total, r.pct + '%'])
  const ws3 = XLSX.utils.aoa_to_sheet([h3, ...r3])
  ws3['!cols'] = [22, 30, 10, 9, 10, 12, 9].map(w => ({ wch: w }))
  XLSX.utils.book_append_sheet(wb, ws3, 'Resumen por producto')

  // Hoja 4: Resumen por categoría
  const h4 = ['Categoría', 'Total', '% del total']
  const r4  = por_categoria.value.map(c => [c.categoria, c.total, c.pct + '%'])
  const ws4 = XLSX.utils.aoa_to_sheet([h4, ...r4])
  ws4['!cols'] = [30, 14, 10].map(w => ({ wch: w }))
  XLSX.utils.book_append_sheet(wb, ws4, 'Por categoría')

  const hoy = new Date().toLocaleDateString('es-AR').replace(/\//g, '-')
  XLSX.writeFile(wb, `ceketo_reporte_${hoy}.xlsx`)
}

// ── Exportar PDF ──────────────────────────────────────────────────────────────
function exportarPDF() {
  const hoy = new Date().toLocaleDateString('es-AR')
  const nombreTab = tabs.find(t => t.id === tabActivo.value)?.label || tabActivo.value
  const opt = {
    margin:      [10, 8, 10, 8],
    filename:    `ceketo_reporte_${hoy.replace(/\//g, '-')}.pdf`,
    image:       { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF:       { unit: 'mm', format: 'a4', orientation: 'landscape' },
  }
  const clone = tablaRef.value?.cloneNode(true)
  if (!clone) return alert('Cambiá a una pestaña de tabla para exportar PDF')
  const wrap  = document.createElement('div')
  wrap.style.cssText = 'font-family: sans-serif; font-size: 10px;'
  const titulo = document.createElement('h2')
  titulo.textContent = `Reporte Ceketo — ${nombreTab} — ${hoy}`
  titulo.style.cssText = 'font-size: 13px; margin-bottom: 8px;'
  wrap.appendChild(titulo)
  wrap.appendChild(clone)
  html2pdf().set(opt).from(wrap).save()
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
