<template>
  <div class="p-8">
    <div class="mb-8">
      <h1 class="font-display text-3xl font-bold text-gray-900">Movimientos de Stock</h1>
      <p class="font-body text-gray-500 mt-1">Historial unificado de entradas (producción) y salidas (ventas)</p>
    </div>

    <!-- Filtros -->
    <div class="bg-white border border-gray-200 rounded-2xl p-5 mb-6">
      <!-- Fila de campos -->
      <div class="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
        <div>
          <label class="block font-body text-xs text-gray-400 mb-1.5">Categoría</label>
          <select v-model="filtroCategoriaId" @change="filtroProductoId = null"
            class="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 font-body text-sm text-gray-700 focus:outline-none focus:border-teal">
            <option :value="null">— Todas —</option>
            <option v-for="c in categorias" :key="c.id" :value="c.id">{{ c.nombre }}</option>
          </select>
        </div>
        <div class="lg:col-span-2">
          <label class="block font-body text-xs text-gray-400 mb-1.5">Producto</label>
          <ProductSelect v-model="filtroProductoId" :grupos="gruposFiltrados" placeholder="— Todos —" />
        </div>
        <div>
          <label class="block font-body text-xs text-gray-400 mb-1.5">Desde</label>
          <input type="date" v-model="filtroDesde"
            class="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 font-body text-sm text-gray-700 focus:outline-none focus:border-teal" />
        </div>
        <div>
          <label class="block font-body text-xs text-gray-400 mb-1.5">Hasta</label>
          <input type="date" v-model="filtroHasta"
            class="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 font-body text-sm text-gray-700 focus:outline-none focus:border-teal" />
        </div>
      </div>

      <!-- Fila de acciones -->
      <div class="flex flex-wrap items-center gap-3">
        <!-- Tipo -->
        <div class="flex gap-2">
          <button v-for="t in tiposFiltro" :key="t.val" @click="filtroTipo = t.val"
            class="px-4 py-2 rounded-xl font-body text-sm border transition-all"
            :class="filtroTipo === t.val ? 'bg-teal border-teal text-gray-900' : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-teal/50'">
            {{ t.label }}
          </button>
        </div>
        <div class="flex-1"></div>
        <button @click="cargarMovimientos"
          class="px-5 py-2 bg-teal text-gray-900 rounded-xl font-body text-sm hover:bg-teal/80 transition-colors">
          Filtrar
        </button>
        <button @click="limpiarFiltros"
          class="px-5 py-2 bg-gray-50 border border-gray-200 text-gray-500 rounded-xl font-body text-sm hover:bg-gray-100 transition-colors">
          Limpiar
        </button>
        <button @click="exportarExcel"
          class="px-5 py-2 bg-green-50 border border-green-200 text-green-700 rounded-xl font-body text-sm hover:bg-green-100 transition-colors">
          ⬇ Excel
        </button>
        <button @click="exportarPDF"
          class="px-5 py-2 bg-red-50 border border-red-200 text-red-600 rounded-xl font-body text-sm hover:bg-red-100 transition-colors">
          ⬇ PDF
        </button>
      </div>
    </div>

    <!-- Tabla -->
    <div ref="tablaRef" class="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full font-body text-sm">
          <thead>
            <tr class="text-gray-400 border-b border-gray-200 bg-gray-50">
              <th class="text-left px-5 py-4">Fecha</th>
              <th class="text-left px-5 py-4">Tipo</th>
              <th class="text-left px-5 py-4">Categoría</th>
              <th class="text-left px-5 py-4">Producto</th>
              <th class="text-left px-5 py-4">Referencia</th>
              <th class="text-right px-5 py-4">Cantidad</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="6" class="text-center py-10 text-gray-400 font-body">Cargando...</td>
            </tr>
            <tr v-else-if="movimientosFiltrados.length === 0">
              <td colspan="6" class="text-center py-10 text-gray-400 font-body">Sin movimientos</td>
            </tr>
            <tr
              v-for="(m, i) in movimientosFiltrados"
              :key="i"
              class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <td class="px-5 py-3 text-gray-500 text-xs">{{ formatFecha(m) }}</td>
              <td class="px-5 py-3">
                <span
                  class="px-2 py-0.5 rounded-full text-xs font-medium"
                  :class="m.tipo === 'entrada' ? 'bg-teal/20 text-teal' : 'bg-keto-orange/20 text-keto-orange'"
                >
                  {{ m.tipo === 'entrada' ? '▲ Entrada' : '▼ Salida' }}
                </span>
              </td>
              <td class="px-5 py-3 text-gray-500 text-xs">{{ m.producto?.categoria?.nombre || '—' }}</td>
              <td class="px-5 py-3">
                <p class="text-gray-900">{{ m.producto?.nombre }}</p>
                <p class="text-gray-400 font-mono text-xs">{{ m.producto?.codigo }}</p>
              </td>
              <td class="px-5 py-3 text-gray-500 text-xs">{{ m.referencia }}</td>
              <td class="px-5 py-3 text-right font-bold"
                :class="m.tipo === 'entrada' ? 'text-teal' : 'text-keto-orange'">
                {{ m.tipo === 'entrada' ? '+' : '-' }}{{ m.cantidad }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import * as XLSX from 'xlsx'
import html2pdf from 'html2pdf.js'
import ProductSelect from '@/components/admin/ProductSelect.vue'

const tablaRef          = ref(null)
const movimientos       = ref([])
const productos         = ref([])
const categorias        = ref([])
const filtroProductoId  = ref(null)
const filtroCategoriaId = ref(null)
const filtroTipo        = ref('todos')
const filtroDesde       = ref('')
const filtroHasta       = ref('')
const loading           = ref(false)

const tiposFiltro = [
  { val: 'todos',   label: 'Todos' },
  { val: 'entrada', label: 'Entradas' },
  { val: 'salida',  label: 'Salidas' },
]

// Grupos para ProductSelect, filtrados por categoría seleccionada
const gruposFiltrados = computed(() => {
  const mapa = {}
  for (const p of productos.value) {
    if (filtroCategoriaId.value && p.categoria?.id !== filtroCategoriaId.value) continue
    const key = p.categoria?.codigo || 'SIN'
    if (!mapa[key]) mapa[key] = { codigo: key, nombre: p.categoria?.nombre || 'Sin categoría', productos: [] }
    mapa[key].productos.push(p)
  }
  return Object.values(mapa)
})

// Filtro local por tipo
const movimientosFiltrados = computed(() =>
  movimientos.value.filter(m => filtroTipo.value === 'todos' || m.tipo === filtroTipo.value)
)

function formatFecha(m) {
  if (!m.fecha) return '—'
  const f = String(m.fecha)
  if (/^\d{4}-\d{2}-\d{2}$/.test(f) || m.solo_fecha) {
    const [y, mo, d] = f.slice(0, 10).split('-')
    return `${d}/${mo}/${y.slice(2)}`
  }
  return new Date(f).toLocaleString('es-AR', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
    timeZone: 'America/Argentina/Buenos_Aires',
  })
}

async function cargarMovimientos() {
  loading.value = true
  try {
    const params = new URLSearchParams()
    if (filtroProductoId.value)  params.set('producto_id',  filtroProductoId.value)
    if (filtroCategoriaId.value) params.set('categoria_id', filtroCategoriaId.value)
    if (filtroDesde.value)       params.set('fecha_desde',  filtroDesde.value)
    if (filtroHasta.value)       params.set('fecha_hasta',  filtroHasta.value)
    const { data } = await axios.get(`/api/admin/movimientos?${params.toString()}`)
    movimientos.value = data
  } catch { movimientos.value = [] }
  finally { loading.value = false }
}

function limpiarFiltros() {
  filtroCategoriaId.value = null
  filtroProductoId.value  = null
  filtroDesde.value       = ''
  filtroHasta.value       = ''
  filtroTipo.value        = 'todos'
  cargarMovimientos()
}

function exportarExcel() {
  const wb  = XLSX.utils.book_new()
  const h   = ['Fecha', 'Tipo', 'Categoría', 'Código', 'Producto', 'Referencia', 'Cantidad']
  const rows = movimientosFiltrados.value.map(m => [
    formatFecha(m),
    m.tipo === 'entrada' ? 'Entrada' : 'Salida',
    m.producto?.categoria?.nombre || '',
    m.producto?.codigo || '',
    m.producto?.nombre || '',
    m.referencia,
    (m.tipo === 'entrada' ? '+' : '-') + m.cantidad,
  ])
  const ws = XLSX.utils.aoa_to_sheet([h, ...rows])
  ws['!cols'] = [14, 9, 22, 10, 28, 16, 9].map(w => ({ wch: w }))
  XLSX.utils.book_append_sheet(wb, ws, 'Movimientos')
  const hoy = new Date().toLocaleDateString('es-AR').replace(/\//g, '-')
  XLSX.writeFile(wb, `ceketo_movimientos_${hoy}.xlsx`)
}

function exportarPDF() {
  const hoy = new Date().toLocaleDateString('es-AR')
  const opt = {
    margin:      [10, 8, 10, 8],
    filename:    `ceketo_movimientos_${hoy.replace(/\//g, '-')}.pdf`,
    image:       { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF:       { unit: 'mm', format: 'a4', orientation: 'landscape' },
  }
  // Clonar tabla para agregar título sin modificar el DOM
  const clone = tablaRef.value.cloneNode(true)
  const wrap  = document.createElement('div')
  wrap.style.cssText = 'font-family: sans-serif; font-size: 11px; padding: 4px;'
  const titulo = document.createElement('h2')
  titulo.textContent = `Movimientos de Stock — ${hoy}`
  titulo.style.cssText = 'font-size: 14px; margin-bottom: 8px; color: #111;'
  wrap.appendChild(titulo)
  wrap.appendChild(clone)
  html2pdf().set(opt).from(wrap).save()
}

function exportarCSV() {
  const headers = ['Fecha', 'Tipo', 'Categoría', 'Código', 'Producto', 'Referencia', 'Cantidad']
  const rows = movimientosFiltrados.value.map(m => [
    formatFecha(m),
    m.tipo,
    m.producto?.categoria?.nombre || '',
    m.producto?.codigo || '',
    m.producto?.nombre || '',
    m.referencia,
    (m.tipo === 'entrada' ? '+' : '-') + m.cantidad,
  ])
  const csv  = [headers, ...rows].map(r => r.join(';')).join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url; a.download = 'ceketo_movimientos.csv'; a.click()
  URL.revokeObjectURL(url)
}

onMounted(async () => {
  const [prodRes, catRes] = await Promise.all([
    axios.get('/api/productos?limit=500'),
    axios.get('/api/categorias'),
  ])
  productos.value  = prodRes.data
  categorias.value = catRes.data
  await cargarMovimientos()
})
</script>
