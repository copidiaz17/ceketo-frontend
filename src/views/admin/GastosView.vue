<template>
  <div class="p-8">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8 flex-wrap gap-4">
      <div>
        <h1 class="font-display text-3xl font-bold text-gray-900">Gastos</h1>
        <p class="font-body text-gray-500 mt-1">Registro de costos operativos</p>
      </div>
      <button
        @click="abrirModal()"
        class="flex items-center gap-2 bg-teal text-gray-900 px-5 py-2.5 rounded-xl font-body font-medium text-sm hover:bg-teal-dark transition-colors"
      >
        + Registrar gasto
      </button>
    </div>

    <!-- Resumen cards -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
      <div
        v-for="cat in resumenCards"
        :key="cat.nombre"
        class="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col gap-1"
      >
        <span class="text-xl">{{ cat.icon }}</span>
        <p class="font-body text-xs text-gray-400 uppercase tracking-wider leading-tight">{{ cat.nombre }}</p>
        <p class="font-display text-lg font-bold text-teal">${{ formatNum(cat.total) }}</p>
      </div>
    </div>

    <!-- Total del mes -->
    <div class="bg-white border border-teal/20 rounded-2xl p-5 mb-8 flex items-center justify-between flex-wrap gap-3">
      <div>
        <p class="font-body text-xs text-gray-400 uppercase tracking-wider">Total gastos — {{ mesLabel }}</p>
        <p class="font-display text-3xl font-bold text-gray-900 mt-1">${{ formatNum(totalMes) }}</p>
      </div>
      <!-- Filtros -->
      <div class="flex gap-3 flex-wrap">
        <input
          v-model="filtroMes"
          type="month"
          class="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl px-4 py-2 font-body focus:outline-none focus:border-teal"
          @change="cargarDatos"
        />
        <select
          v-model="filtroCategoria"
          class="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl px-4 py-2 font-body focus:outline-none focus:border-teal"
          @change="cargarGastos"
        >
          <option value="">Todas las categorías</option>
          <option v-for="c in categorias" :key="c" :value="c">{{ c }}</option>
        </select>
      </div>
    </div>

    <!-- Tabla -->
    <div class="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div v-if="loading" class="text-center py-16 text-gray-400 font-body">Cargando...</div>
      <div v-else-if="!gastos.length" class="text-center py-16 text-gray-400 font-body">
        No hay gastos registrados para este período.
      </div>
      <table v-else class="w-full">
        <thead>
          <tr class="border-b border-gray-200">
            <th class="text-left px-6 py-4 font-body text-xs text-gray-400 uppercase tracking-wider">Fecha</th>
            <th class="text-left px-6 py-4 font-body text-xs text-gray-400 uppercase tracking-wider">Categoría</th>
            <th class="text-left px-6 py-4 font-body text-xs text-gray-400 uppercase tracking-wider">Descripción</th>
            <th class="text-left px-6 py-4 font-body text-xs text-gray-400 uppercase tracking-wider">Proveedor</th>
            <th class="text-right px-6 py-4 font-body text-xs text-gray-400 uppercase tracking-wider">Monto</th>
            <th class="text-right px-6 py-4 font-body text-xs text-gray-400 uppercase tracking-wider hidden lg:table-cell">IVA</th>
            <th class="text-center px-6 py-4 font-body text-xs text-gray-400 uppercase tracking-wider">Comprobante</th>
            <th class="text-center px-6 py-4 font-body text-xs text-gray-400 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="g in gastos"
            :key="g.id"
            class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
          >
            <td class="px-6 py-4 font-body text-sm text-gray-600 whitespace-nowrap">{{ formatFecha(g.fecha) }}</td>
            <td class="px-6 py-4">
              <span :class="['badge', badgeClass(g.categoria)]">{{ g.categoria }}</span>
            </td>
            <td class="px-6 py-4 font-body text-sm text-gray-900 max-w-xs">{{ g.descripcion }}</td>
            <td class="px-6 py-4 font-body text-sm text-gray-500">{{ g.proveedor || '—' }}</td>
            <td class="px-6 py-4 font-display text-sm font-bold text-teal text-right whitespace-nowrap">
              ${{ formatNum(g.monto) }}
            </td>
            <td class="px-6 py-4 text-right hidden lg:table-cell">
              <span v-if="g.es_factura && g.iva_monto" class="font-body text-xs text-amber-600 font-medium">
                ${{ formatNum(g.iva_monto) }}<br>
                <span class="text-gray-400">({{ g.alicuota_iva }}%)</span>
              </span>
              <span v-else class="text-gray-300 text-xs">—</span>
            </td>
            <td class="px-6 py-4 text-center">
              <a
                v-if="g.comprobante"
                :href="g.comprobante"
                target="_blank"
                class="inline-flex items-center gap-1 text-xs text-teal hover:underline font-body"
                :title="g.comprobante.endsWith('.pdf') ? 'Ver PDF' : 'Ver imagen'"
              >
                <span>{{ g.comprobante.endsWith('.pdf') ? '📄' : '🖼️' }}</span> Ver
              </a>
              <span v-else class="text-gray-300 text-xs font-body">—</span>
            </td>
            <td class="px-6 py-4 text-center">
              <div class="flex items-center justify-center gap-2">
                <button
                  @click="abrirModal(g)"
                  class="text-gray-400 hover:text-gray-900 transition-colors text-sm px-2 py-1 rounded-lg hover:bg-gray-100"
                  title="Editar"
                >✏️</button>
                <button
                  @click="eliminar(g)"
                  class="text-gray-400 hover:text-red-400 transition-colors text-sm px-2 py-1 rounded-lg hover:bg-red-400/10"
                  title="Eliminar"
                >🗑️</button>
              </div>
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="border-t border-gray-200 bg-gray-50">
            <td colspan="4" class="px-6 py-4 font-body text-sm text-gray-500 font-medium">
              {{ gastos.length }} gasto(s) — {{ gastosConFactura }} con factura
            </td>
            <td class="px-6 py-4 font-display text-base font-bold text-teal text-right whitespace-nowrap">
              ${{ formatNum(totalFiltrado) }}
            </td>
            <td class="px-6 py-4 text-right hidden lg:table-cell">
              <span v-if="totalIVA > 0" class="font-body text-xs text-amber-600 font-medium">
                IVA: ${{ formatNum(totalIVA) }}
              </span>
            </td>
            <td colspan="1"></td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- ── MODAL ──────────────────────────────────────────────── -->
    <Transition name="modal">
      <div
        v-if="modal.visible"
        class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        @click.self="cerrarModal"
      >
        <div class="bg-white border border-gray-200 rounded-3xl p-8 w-full max-w-lg shadow-2xl">
          <h2 class="font-display text-xl font-bold text-gray-900 mb-6">
            {{ modal.id ? 'Editar gasto' : 'Registrar gasto' }}
          </h2>

          <div class="space-y-4">
            <!-- Fecha + Categoría -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block font-body text-xs text-gray-500 uppercase tracking-wider mb-2">Fecha *</label>
                <input
                  v-model="modal.fecha"
                  type="date"
                  class="input-field w-full"
                />
              </div>
              <div>
                <label class="block font-body text-xs text-gray-500 uppercase tracking-wider mb-2">Categoría *</label>
                <select v-model="modal.categoria" class="input-field w-full">
                  <option value="">Seleccionar...</option>
                  <option v-for="c in categorias" :key="c" :value="c">{{ c }}</option>
                </select>
              </div>
            </div>

            <!-- Descripción -->
            <div>
              <label class="block font-body text-xs text-gray-500 uppercase tracking-wider mb-2">Descripción *</label>
              <input
                v-model="modal.descripcion"
                type="text"
                placeholder="Ej: Harina de almendra — Proveedor X"
                class="input-field w-full"
              />
            </div>

            <!-- Monto + Proveedor -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block font-body text-xs text-gray-500 uppercase tracking-wider mb-2">Monto $ *</label>
                <input
                  v-model="modal.monto"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  class="input-field w-full"
                />
              </div>
              <div>
                <label class="block font-body text-xs text-gray-500 uppercase tracking-wider mb-2">Proveedor</label>
                <input
                  v-model="modal.proveedor"
                  type="text"
                  placeholder="Opcional"
                  class="input-field w-full"
                />
              </div>
            </div>

            <!-- Comprobante -->
            <div>
              <label class="block font-body text-xs text-gray-500 uppercase tracking-wider mb-2">
                Comprobante <span class="text-gray-400 normal-case">(JPG, PNG, PDF — máx. 10MB)</span>
              </label>
              <!-- Preview del comprobante existente -->
              <div v-if="modal.comprobante_actual && !modal.archivo" class="mb-2 flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                <span>{{ modal.comprobante_actual.endsWith('.pdf') ? '📄' : '🖼️' }}</span>
                <a :href="modal.comprobante_actual" target="_blank" class="text-teal text-sm hover:underline font-body truncate">
                  Ver comprobante actual
                </a>
                <button @click="modal.comprobante_actual = null" class="ml-auto text-gray-400 hover:text-red-400 text-xs">✕</button>
              </div>
              <div
                class="border-2 border-dashed border-gray-200 rounded-xl p-5 text-center cursor-pointer hover:border-teal/50 transition-colors"
                @click="$refs.fileInput.click()"
                @dragover.prevent
                @drop.prevent="onDrop"
              >
                <div v-if="modal.archivo">
                  <p class="text-teal text-sm font-body">✓ {{ modal.archivo.name }}</p>
                  <p class="text-gray-400 text-xs mt-1 font-body">{{ (modal.archivo.size / 1024).toFixed(0) }} KB</p>
                </div>
                <div v-else>
                  <p class="text-gray-400 text-sm font-body">Arrastrá o hacé click para subir</p>
                </div>
              </div>
              <input
                ref="fileInput"
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.pdf"
                class="hidden"
                @change="onFileChange"
              />
            </div>

            <!-- Factura + IVA -->
            <div class="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <label class="flex items-center gap-3 cursor-pointer mb-3">
                <input
                  v-model="modal.es_factura"
                  type="checkbox"
                  class="w-4 h-4 accent-teal rounded"
                />
                <span class="font-body text-sm font-medium text-gray-800">El comprobante es una <strong>factura</strong> (tiene IVA)</span>
              </label>
              <div v-if="modal.es_factura" class="grid grid-cols-2 gap-3 mt-2">
                <div>
                  <label class="block font-body text-xs text-gray-500 uppercase tracking-wider mb-2">Alícuota IVA</label>
                  <select v-model="modal.alicuota_iva" class="input-field w-full">
                    <option value="">Seleccionar...</option>
                    <option value="21">21%</option>
                    <option value="10.5">10.5%</option>
                    <option value="27">27%</option>
                  </select>
                </div>
                <div>
                  <label class="block font-body text-xs text-gray-500 uppercase tracking-wider mb-2">IVA incluido en el monto</label>
                  <div class="input-field bg-gray-100 text-teal font-bold">
                    ${{ modal.alicuota_iva && modal.monto ? formatNum(calcularIVA(modal.monto, modal.alicuota_iva)) : '0,00' }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Botones -->
          <div class="flex gap-3 mt-8">
            <button
              @click="guardar"
              :disabled="modal.guardando || !modal.fecha || !modal.categoria || !modal.descripcion || !modal.monto"
              class="flex-1 bg-teal text-gray-900 py-3 rounded-xl font-body font-medium text-sm hover:bg-teal-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {{ modal.guardando ? 'Guardando...' : (modal.id ? 'Guardar cambios' : 'Registrar gasto') }}
            </button>
            <button
              @click="cerrarModal"
              class="px-6 py-3 rounded-xl border border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50 font-body text-sm transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ── MODAL COMPROBANTE (ver imagen) ─────────────────────── -->
    <Transition name="modal">
      <div
        v-if="visorSrc"
        class="fixed inset-0 bg-black/90 flex items-center justify-center z-[60] p-4"
        @click="visorSrc = null"
      >
        <img :src="visorSrc" class="max-w-full max-h-full rounded-2xl shadow-2xl" @click.stop />
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const gastos         = ref([])
const categorias     = ref([])
const resumen        = ref({})
const totalMes       = ref(0)
const loading        = ref(true)
const filtroMes      = ref(new Date().toISOString().slice(0, 7))
const filtroCategoria = ref('')
const visorSrc       = ref(null)

const modal = ref({
  visible: false, id: null, guardando: false,
  fecha: '', categoria: '', descripcion: '', monto: '', proveedor: '',
  archivo: null, comprobante_actual: null,
})

// ── Computed ────────────────────────────────────────────────────
const mesLabel = computed(() => {
  const [y, m] = filtroMes.value.split('-')
  return new Date(y, m - 1).toLocaleString('es-AR', { month: 'long', year: 'numeric' })
})

const totalFiltrado = computed(() =>
  gastos.value.reduce((s, g) => s + Number(g.monto), 0)
)
const totalIVA = computed(() =>
  gastos.value.reduce((s, g) => s + Number(g.iva_monto || 0), 0)
)
const gastosConFactura = computed(() =>
  gastos.value.filter(g => g.es_factura).length
)

function calcularIVA(monto, alicuota) {
  if (!monto || !alicuota) return 0
  return (Number(monto) * Number(alicuota) / (100 + Number(alicuota)))
}

const ICONOS = {
  'Materia Prima': '🌾', 'Alquiler': '🏠', 'Servicios': '💡',
  'Sueldos': '👥', 'Mantenimiento': '🔧', 'Packaging': '📦', 'Otros': '📌',
}

const resumenCards = computed(() =>
  categorias.value.map(c => ({
    nombre: c,
    icon: ICONOS[c] || '📌',
    total: resumen.value[c] || 0,
  })).filter(c => c.total > 0)
)

// ── Helpers ─────────────────────────────────────────────────────
function formatNum(n) {
  return Number(n || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })
}
function formatFecha(f) {
  if (!f) return '—'
  const [y, m, d] = f.split('-')
  return `${d}/${m}/${y}`
}
function badgeClass(cat) {
  const map = {
    'Materia Prima': 'bg-teal/15 text-teal border border-teal/20',
    'Alquiler':      'bg-purple-500/15 text-purple-300 border border-purple-500/20',
    'Servicios':     'bg-yellow-500/15 text-yellow-300 border border-yellow-500/20',
    'Sueldos':       'bg-blue-500/15 text-blue-300 border border-blue-500/20',
    'Mantenimiento': 'bg-orange-500/15 text-orange-300 border border-orange-500/20',
    'Packaging':     'bg-pink-500/15 text-pink-300 border border-pink-500/20',
    'Otros':         'bg-gray-100 text-gray-500',
  }
  return map[cat] || 'bg-gray-100 text-gray-500'
}

// ── Data ─────────────────────────────────────────────────────────
async function cargarDatos() {
  await Promise.all([cargarGastos(), cargarResumen()])
}

async function cargarGastos() {
  loading.value = true
  try {
    const params = { mes: filtroMes.value }
    if (filtroCategoria.value) params.categoria = filtroCategoria.value
    const { data } = await axios.get('/api/gastos', { params })
    gastos.value = data
  } catch {}
  finally { loading.value = false }
}

async function cargarResumen() {
  try {
    const { data } = await axios.get('/api/gastos/resumen', { params: { mes: filtroMes.value } })
    resumen.value  = data.totales
    totalMes.value = data.totalMes
  } catch {}
}

// ── Modal ─────────────────────────────────────────────────────────
function abrirModal(g = null) {
  if (g) {
    modal.value = {
      visible: true, id: g.id, guardando: false,
      fecha: g.fecha, categoria: g.categoria,
      descripcion: g.descripcion, monto: g.monto,
      proveedor: g.proveedor || '',
      archivo: null, comprobante_actual: g.comprobante || null,
      es_factura: g.es_factura || false,
      alicuota_iva: g.alicuota_iva ? String(g.alicuota_iva) : '',
    }
  } else {
    const hoy = new Date().toISOString().split('T')[0]
    modal.value = {
      visible: true, id: null, guardando: false,
      fecha: hoy, categoria: '', descripcion: '', monto: '', proveedor: '',
      archivo: null, comprobante_actual: null,
      es_factura: false, alicuota_iva: '',
    }
  }
}
function cerrarModal() { modal.value.visible = false }

function onFileChange(e) { modal.value.archivo = e.target.files[0] || null }
function onDrop(e)       { modal.value.archivo = e.dataTransfer.files[0] || null }

async function guardar() {
  const m = modal.value
  if (!m.fecha || !m.categoria || !m.descripcion || !m.monto) return
  m.guardando = true
  try {
    const fd = new FormData()
    fd.append('fecha',        m.fecha)
    fd.append('categoria',    m.categoria)
    fd.append('descripcion',  m.descripcion)
    fd.append('monto',        m.monto)
    fd.append('proveedor',    m.proveedor || '')
    fd.append('es_factura',   m.es_factura ? 'true' : 'false')
    fd.append('alicuota_iva', m.es_factura && m.alicuota_iva ? m.alicuota_iva : '')
    if (m.archivo) fd.append('comprobante', m.archivo)

    if (m.id) {
      await axios.put(`/api/gastos/${m.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    } else {
      await axios.post('/api/gastos', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    }
    cerrarModal()
    await cargarDatos()
  } catch (err) {
    alert(err.response?.data?.error || 'Error al guardar')
  } finally { m.guardando = false }
}

async function eliminar(g) {
  if (!confirm(`¿Eliminar el gasto "${g.descripcion}" ($${formatNum(g.monto)})?`)) return
  try {
    await axios.delete(`/api/gastos/${g.id}`)
    await cargarDatos()
  } catch {
    alert('Error al eliminar')
  }
}

// ── Init ─────────────────────────────────────────────────────────
onMounted(async () => {
  const { data } = await axios.get('/api/gastos/categorias')
  categorias.value = data
  await cargarDatos()
})
</script>

<style scoped>
.input-field {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 0.625rem 1rem;
  color: #111827;
  font-size: 0.875rem;
  font-family: Inter, sans-serif;
  transition: border-color 0.2s;
  width: 100%;
}
.input-field:focus { outline: none; border-color: #2A9D8F; }
.input-field option { background: #ffffff; color: #111827; }

.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
