<template>
  <div class="p-8">
    <div class="mb-8">
      <h1 class="font-display text-3xl font-bold text-gray-900">Pedidos Online</h1>
      <p class="font-body text-gray-500 mt-1">Gestión de pedidos del ecommerce</p>
    </div>

    <!-- Filtros -->
    <div class="bg-white border border-gray-200 rounded-2xl p-5 mb-6 flex flex-wrap gap-4 items-end">

      <!-- Estado -->
      <div>
        <label class="block font-body text-xs text-gray-400 mb-2">Estado</label>
        <select v-model="filtroEstado"
          class="px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 font-body text-sm text-gray-700 focus:outline-none focus:border-teal">
          <option v-for="e in estados" :key="e.val" :value="e.val">{{ e.label }}</option>
        </select>
      </div>

      <!-- Categoría -->
      <div class="min-w-44">
        <label class="block font-body text-xs text-gray-400 mb-2">Categoría</label>
        <select v-model="filtroCategoriaId" @change="filtroProductoId = null"
          class="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 font-body text-sm text-gray-700 focus:outline-none focus:border-teal">
          <option :value="null">— Todas —</option>
          <option v-for="c in categorias" :key="c.id" :value="c.id">{{ c.nombre }}</option>
        </select>
      </div>

      <!-- Producto -->
      <div class="min-w-44">
        <label class="block font-body text-xs text-gray-400 mb-2">Producto</label>
        <select v-model="filtroProductoId"
          class="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 font-body text-sm text-gray-700 focus:outline-none focus:border-teal">
          <option :value="null">— Todos —</option>
          <option v-for="p in productosFiltrados" :key="p.id" :value="p.id">{{ p.nombre }}</option>
        </select>
      </div>

      <!-- Fechas -->
      <div>
        <label class="block font-body text-xs text-gray-400 mb-2">Desde</label>
        <input type="date" v-model="filtroDesde"
          class="px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 font-body text-sm text-gray-700 focus:outline-none focus:border-teal" />
      </div>
      <div>
        <label class="block font-body text-xs text-gray-400 mb-2">Hasta</label>
        <input type="date" v-model="filtroHasta"
          class="px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 font-body text-sm text-gray-700 focus:outline-none focus:border-teal" />
      </div>

      <button @click="cargarPedidos"
        class="px-5 py-2.5 bg-teal text-gray-900 rounded-xl font-body text-sm hover:bg-teal/80 transition-colors">
        Filtrar
      </button>
      <button @click="limpiarFiltros"
        class="px-5 py-2.5 bg-gray-50 border border-gray-200 text-gray-500 rounded-xl font-body text-sm hover:bg-gray-100 transition-colors">
        Limpiar
      </button>
      <button @click="exportarExcel"
        class="px-5 py-2.5 bg-green-50 border border-green-200 text-green-700 rounded-xl font-body text-sm hover:bg-green-100 transition-colors">
        ⬇ Excel
      </button>
      <button @click="exportarCSV"
        class="px-5 py-2.5 bg-gray-50 border border-gray-200 text-gray-500 rounded-xl font-body text-sm hover:bg-gray-100 transition-colors">
        ⬇ CSV
      </button>
    </div>

    <!-- Lista de pedidos -->
    <div class="space-y-4">
      <div v-if="loading" class="text-center py-16 text-gray-400 font-body">Cargando...</div>
      <div v-else-if="pedidos.length === 0" class="text-center py-16 text-gray-400 font-body">
        Sin pedidos con los filtros aplicados
      </div>

      <div
        v-for="p in pedidos"
        :key="p.id"
        class="bg-white border border-gray-200 rounded-2xl p-5"
      >
        <div class="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div>
            <div class="flex items-center gap-3 mb-1">
              <span class="font-display text-gray-900 font-semibold">Pedido #{{ p.id }}</span>
              <span
                class="px-2 py-0.5 rounded-full text-xs font-body"
                :class="colorEstado(p.estado)"
              >{{ p.estado }}</span>
            </div>
            <p class="font-body text-sm text-gray-500">
              {{ p.nombre }} · {{ p.telefono }}
              <span v-if="p.email"> · {{ p.email }}</span>
            </p>
            <p v-if="p.direccion" class="font-body text-xs text-gray-400 mt-0.5">
              {{ p.direccion }}, {{ p.localidad }}
            </p>
            <p class="font-body text-xs text-gray-400 mt-0.5">{{ formatFecha(p.fecha) }} · {{ p.metodo_pago }}</p>
          </div>
          <div class="text-right">
            <p class="font-display text-2xl font-bold text-teal">${{ parseFloat(p.total).toLocaleString('es-AR') }}</p>
            <!-- Cambiar estado -->
            <select
              :value="p.estado"
              @change="cambiarEstado(p, $event.target.value)"
              class="mt-2 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-600 font-body text-xs focus:outline-none focus:border-teal"
            >
              <option v-for="e in estadosSelect" :key="e" :value="e">{{ e }}</option>
            </select>
          </div>
        </div>

        <!-- Items -->
        <div class="border-t border-gray-200 pt-3 flex flex-wrap gap-2">
          <span
            v-for="item in p.items"
            :key="item.id"
            class="bg-gray-50 rounded-lg px-3 py-1.5 font-body text-xs text-gray-500"
          >
            {{ item.producto?.nombre }} ×{{ item.cantidad }}
          </span>
        </div>

        <p v-if="p.nota" class="font-body text-xs text-gray-400 mt-3 italic">Nota: {{ p.nota }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import * as XLSX from 'xlsx'

const pedidos          = ref([])
const productos        = ref([])
const filtroEstado     = ref('todos')
const filtroCategoriaId = ref(null)
const filtroProductoId = ref(null)
const filtroDesde      = ref('')
const filtroHasta      = ref('')
const loading          = ref(false)

const estados = [
  { val: 'todos',          label: 'Todos' },
  { val: 'pendiente',      label: 'Pendiente' },
  { val: 'en_preparacion', label: 'En preparación' },
  { val: 'listo',          label: 'Listo' },
  { val: 'enviado',        label: 'Enviado' },
  { val: 'entregado',      label: 'Entregado' },
  { val: 'cancelado',      label: 'Cancelado' },
]
const estadosSelect = ['pendiente', 'en_preparacion', 'listo', 'enviado', 'entregado', 'cancelado']

// Categorías únicas extraídas de los productos
const categorias = computed(() => {
  const mapa = {}
  for (const p of productos.value) {
    if (p.categoria && !mapa[p.categoria.id]) {
      mapa[p.categoria.id] = { id: p.categoria.id, nombre: p.categoria.nombre }
    }
  }
  return Object.values(mapa).sort((a, b) => a.nombre.localeCompare(b.nombre))
})

// Productos filtrados por categoría seleccionada
const productosFiltrados = computed(() =>
  filtroCategoriaId.value
    ? productos.value.filter(p => p.categoria?.id === filtroCategoriaId.value)
    : productos.value
)

function colorEstado(estado) {
  const map = {
    pendiente:      'bg-yellow-500/20 text-yellow-300',
    en_preparacion: 'bg-blue-500/20 text-blue-300',
    listo:          'bg-teal/20 text-teal',
    enviado:        'bg-purple-500/20 text-purple-300',
    entregado:      'bg-green-600/20 text-green-400',
    cancelado:      'bg-red-500/20 text-red-400',
  }
  return map[estado] || 'bg-gray-100 text-gray-500'
}

function formatFecha(f) {
  return new Date(f).toLocaleString('es-AR', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
    timeZone: 'America/Argentina/Buenos_Aires',
  })
}

async function cargarPedidos() {
  loading.value = true
  try {
    const params = new URLSearchParams()
    if (filtroEstado.value && filtroEstado.value !== 'todos') params.set('estado', filtroEstado.value)
    if (filtroCategoriaId.value) params.set('categoria_id', filtroCategoriaId.value)
    if (filtroProductoId.value)  params.set('producto_id',  filtroProductoId.value)
    if (filtroDesde.value)       params.set('fecha_desde',  filtroDesde.value)
    if (filtroHasta.value)       params.set('fecha_hasta',  filtroHasta.value)
    const { data } = await axios.get(`/api/pedidos?${params.toString()}`)
    pedidos.value = data
  } catch { pedidos.value = [] }
  finally { loading.value = false }
}

function limpiarFiltros() {
  filtroEstado.value      = 'todos'
  filtroCategoriaId.value = null
  filtroProductoId.value  = null
  filtroDesde.value       = ''
  filtroHasta.value       = ''
  cargarPedidos()
}

async function cambiarEstado(pedido, nuevoEstado) {
  try {
    const token = localStorage.getItem('ceketo_token')
    await axios.patch(`/api/pedidos/${pedido.id}/estado`, { estado: nuevoEstado }, {
      headers: { Authorization: `Bearer ${token}` },
    })
    pedido.estado = nuevoEstado
  } catch { alert('Error al actualizar estado') }
}

function exportarExcel() {
  const data = pedidos.value
  const wb   = XLSX.utils.book_new()

  // ── HOJA 1: Pedidos ──────────────────────────────────────────────────────
  const h1 = ['Pedido', 'Fecha', 'Estado', 'Cliente', 'Teléfono', 'Email',
               'Método de pago', 'Forma de entrega', 'Dirección', 'Localidad',
               'Subtotal', 'Total']
  const r1 = data.map(p => {
    const subtotal = (p.items || []).reduce((s, i) => s + parseFloat(i.subtotal || 0), 0)
    return [
      `#${p.id}`,
      formatFecha(p.fecha),
      p.estado,
      p.nombre,
      p.telefono,
      p.email || '',
      p.metodo_pago,
      p.direccion ? 'Envío a domicilio' : 'Retiro en persona',
      p.direccion || '',
      p.localidad || '',
      subtotal,
      parseFloat(p.total),
    ]
  })
  const ws1 = XLSX.utils.aoa_to_sheet([h1, ...r1])
  ws1['!cols'] = [8,16,14,22,14,22,14,18,30,16,12,12].map(w => ({ wch: w }))
  XLSX.utils.book_append_sheet(wb, ws1, 'Pedidos')

  // ── HOJA 2: Detalle de productos ─────────────────────────────────────────
  const h2 = ['Pedido', 'Fecha', 'Cliente', 'Categoría', 'Producto', 'Código (SKU)', 'Cantidad', 'Precio unit.', 'Total ítem']
  const r2 = []
  for (const p of data) {
    for (const item of p.items || []) {
      r2.push([
        `#${p.id}`,
        formatFecha(p.fecha),
        p.nombre,
        item.producto?.categoria?.nombre || '',
        item.producto?.nombre || '',
        item.producto?.codigo || '',
        item.cantidad,
        parseFloat(item.precio_unit || 0),
        parseFloat(item.subtotal || 0),
      ])
    }
  }
  const ws2 = XLSX.utils.aoa_to_sheet([h2, ...r2])
  ws2['!cols'] = [8,16,22,20,28,12,9,12,12].map(w => ({ wch: w }))
  XLSX.utils.book_append_sheet(wb, ws2, 'Detalle de productos')

  // ── HOJA 3: Pedidos y productos (vista combinada) ─────────────────────────
  const h3 = ['Pedido', 'Fecha', 'Estado', 'Cliente', 'Teléfono', 'Método pago',
               'Entrega', 'Categoría', 'Producto', 'Cantidad', 'Subtotal ítem', 'Total pedido']
  const r3 = []
  for (const p of data) {
    for (const item of p.items || []) {
      r3.push([
        `#${p.id}`,
        formatFecha(p.fecha),
        p.estado,
        p.nombre,
        p.telefono,
        p.metodo_pago,
        p.direccion ? 'Delivery' : 'Retiro',
        item.producto?.categoria?.nombre || '',
        item.producto?.nombre || '',
        item.cantidad,
        parseFloat(item.subtotal || 0),
        parseFloat(p.total),
      ])
    }
  }
  const ws3 = XLSX.utils.aoa_to_sheet([h3, ...r3])
  ws3['!cols'] = [8,16,14,22,14,14,8,20,28,9,12,12].map(w => ({ wch: w }))
  XLSX.utils.book_append_sheet(wb, ws3, 'Pedidos y productos')

  // ── HOJA 4: Resumen por producto ─────────────────────────────────────────
  const resumen = {}
  let totalGlobal = 0
  for (const p of data) {
    for (const item of p.items || []) {
      const key = item.producto?.id || item.producto?.nombre
      if (!resumen[key]) {
        resumen[key] = {
          categoria:    item.producto?.categoria?.nombre || '',
          producto:     item.producto?.nombre || '',
          codigo:       item.producto?.codigo || '',
          cantidad:     0,
          total:        0,
          precio_unit:  parseFloat(item.precio_unit || 0),
        }
      }
      resumen[key].cantidad += item.cantidad
      resumen[key].total    += parseFloat(item.subtotal || 0)
      totalGlobal           += parseFloat(item.subtotal || 0)
    }
  }
  const h4 = ['Categoría', 'Producto', 'Código (SKU)', 'Cantidad', 'Total $', 'Precio unitario', '% del total']
  const r4 = Object.values(resumen)
    .sort((a, b) => a.categoria.localeCompare(b.categoria) || a.producto.localeCompare(b.producto))
    .map(r => [
      r.categoria,
      r.producto,
      r.codigo,
      r.cantidad,
      r.total,
      r.precio_unit,
      totalGlobal > 0 ? parseFloat((r.total / totalGlobal * 100).toFixed(2)) : 0,
    ])
  const ws4 = XLSX.utils.aoa_to_sheet([h4, ...r4])
  ws4['!cols'] = [20,28,12,9,12,14,10].map(w => ({ wch: w }))
  XLSX.utils.book_append_sheet(wb, ws4, 'Resumen por producto')

  // Generar nombre con fecha
  const hoy = new Date().toLocaleDateString('es-AR').replace(/\//g, '-')
  XLSX.writeFile(wb, `ceketo_pedidos_${hoy}.xlsx`)
}

function exportarCSV() {
  const rows = []
  rows.push(['Pedido', 'Fecha', 'Cliente', 'Teléfono', 'Estado', 'Método pago', 'Entrega', 'Categoría', 'Producto', 'Cantidad', 'Subtotal', 'Total pedido'])
  for (const p of pedidos.value) {
    for (const item of p.items || []) {
      rows.push([
        `#${p.id}`,
        formatFecha(p.fecha),
        p.nombre,
        p.telefono,
        p.estado,
        p.metodo_pago,
        p.direccion ? `Delivery - ${p.direccion}` : 'Retiro',
        item.producto?.categoria?.nombre || '',
        item.producto?.nombre || '',
        item.cantidad,
        item.subtotal,
        parseFloat(p.total),
      ])
    }
  }
  const csv  = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(';')).join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url; a.download = 'ceketo_pedidos.csv'; a.click()
  URL.revokeObjectURL(url)
}

onMounted(async () => {
  const { data } = await axios.get('/api/productos?limit=500')
  productos.value = data
  await cargarPedidos()
})
</script>
