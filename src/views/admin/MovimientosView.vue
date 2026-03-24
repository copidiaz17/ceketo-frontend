<template>
  <div class="p-8">
    <div class="mb-8">
      <h1 class="font-display text-3xl font-bold text-gray-900">Movimientos de Stock</h1>
      <p class="font-body text-gray-500 mt-1">Historial unificado de entradas (producción) y salidas (ventas)</p>
    </div>

    <!-- Filtros -->
    <div class="bg-white border border-gray-200 rounded-2xl p-5 mb-6 flex flex-wrap gap-4 items-end">
      <div class="flex-1 min-w-48">
        <label class="block font-body text-xs text-gray-400 mb-2">Producto (opcional)</label>
        <ProductSelect v-model="filtroProductoId" :grupos="categoriasConProductos" placeholder="— Todos los productos —" />
      </div>
      <div>
        <label class="block font-body text-xs text-gray-400 mb-2">Tipo</label>
        <div class="flex gap-2">
          <button
            v-for="t in tiposFiltro"
            :key="t.val"
            @click="filtroTipo = t.val"
            class="px-4 py-2.5 rounded-xl font-body text-sm border transition-all"
            :class="filtroTipo === t.val ? 'bg-teal border-teal text-gray-900' : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-teal/50'"
          >{{ t.label }}</button>
        </div>
      </div>
      <button
        @click="cargarMovimientos"
        class="px-5 py-2.5 bg-teal text-gray-900 rounded-xl font-body text-sm hover:bg-teal/80 transition-colors"
      >Filtrar</button>
      <button
        @click="exportarCSV"
        class="px-5 py-2.5 bg-gray-50 border border-gray-200 text-gray-500 rounded-xl font-body text-sm hover:bg-gray-100 transition-colors"
      >⬇ CSV</button>
    </div>

    <!-- Tabla -->
    <div class="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full font-body text-sm">
          <thead>
            <tr class="text-gray-400 border-b border-gray-200 bg-gray-50">
              <th class="text-left px-5 py-4">Fecha</th>
              <th class="text-left px-5 py-4">Tipo</th>
              <th class="text-left px-5 py-4">Producto</th>
              <th class="text-left px-5 py-4">Referencia</th>
              <th class="text-right px-5 py-4">Cantidad</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="5" class="text-center py-10 text-gray-400 font-body">Cargando...</td>
            </tr>
            <tr v-else-if="movimientosFiltrados.length === 0">
              <td colspan="5" class="text-center py-10 text-gray-400 font-body">Sin movimientos</td>
            </tr>
            <tr
              v-for="(m, i) in movimientosFiltrados"
              :key="i"
              class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <td class="px-5 py-3 text-gray-500 text-xs">{{ formatFecha(m.fecha) }}</td>
              <td class="px-5 py-3">
                <span
                  class="px-2 py-0.5 rounded-full text-xs font-medium"
                  :class="m.tipo === 'entrada' ? 'bg-teal/20 text-teal' : 'bg-keto-orange/20 text-keto-orange'"
                >
                  {{ m.tipo === 'entrada' ? '▲ Entrada' : '▼ Salida' }}
                </span>
              </td>
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
import ProductSelect from '@/components/admin/ProductSelect.vue'

const movimientos       = ref([])
const productos         = ref([])
const filtroProductoId  = ref(null)
const filtroTipo        = ref('todos')
const loading           = ref(false)

const tiposFiltro = [
  { val: 'todos',   label: 'Todos' },
  { val: 'entrada', label: 'Entradas' },
  { val: 'salida',  label: 'Salidas' },
]

const categoriasConProductos = computed(() => {
  const mapa = {}
  for (const p of productos.value) {
    const key = p.categoria?.codigo || 'SIN'
    if (!mapa[key]) mapa[key] = { codigo: key, nombre: p.categoria?.nombre || 'Sin categoría', productos: [] }
    mapa[key].productos.push(p)
  }
  return Object.values(mapa)
})

const movimientosFiltrados = computed(() =>
  movimientos.value.filter(m => filtroTipo.value === 'todos' || m.tipo === filtroTipo.value)
)

function formatFecha(f) {
  if (!f) return '—'
  return new Date(f).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })
}

async function cargarMovimientos() {
  loading.value = true
  try {
    const params = filtroProductoId.value ? `?producto_id=${filtroProductoId.value}` : ''
    const { data } = await axios.get(`/api/admin/movimientos${params}`)
    movimientos.value = data
  } catch { movimientos.value = [] }
  finally { loading.value = false }
}

function exportarCSV() {
  const headers = ['Fecha', 'Tipo', 'Código', 'Producto', 'Referencia', 'Cantidad']
  const rows = movimientosFiltrados.value.map(m => [
    formatFecha(m.fecha),
    m.tipo,
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
  const { data } = await axios.get('/api/productos?limit=500')
  productos.value = data
  await cargarMovimientos()
})
</script>
