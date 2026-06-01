<template>
  <div class="p-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="font-display text-3xl font-bold text-gray-900">Carga de Producción</h1>
      <p class="font-body text-gray-500 mt-1">Registrá los productos que llegan de fábrica al negocio</p>
    </div>

    <div class="grid lg:grid-cols-2 gap-8">
      <!-- Formulario de carga -->
      <div class="bg-white border border-gray-200 rounded-2xl p-6">
        <h2 class="font-display text-lg font-semibold text-gray-900 mb-5">Agregar ítem</h2>

        <!-- Selector de producto -->
        <div class="mb-4">
          <label class="block font-body text-sm text-gray-500 mb-2">Producto</label>
          <ProductSelect
            v-model="selectedId"
            :grupos="categoriasConProductos"
          />
        </div>

        <!-- Cantidad -->
        <div class="mb-4">
          <label class="block font-body text-sm text-gray-500 mb-2">Cantidad</label>
          <input
            v-model.number="cantidad"
            type="number"
            min="1"
            placeholder="0"
            class="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 font-body
                   focus:outline-none focus:border-teal transition-colors"
          />
        </div>

        <button
          @click="agregarItem"
          :disabled="!selectedId || !cantidad"
          class="w-full py-3 bg-teal text-gray-800 font-body font-medium rounded-xl
                 hover:bg-teal/80 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          + Agregar al lote
        </button>
      </div>

      <!-- Lote actual -->
      <div class="bg-white border border-gray-200 rounded-2xl p-6">
        <h2 class="font-display text-lg font-semibold text-gray-900 mb-5">
          Lote del día
          <span class="ml-2 text-sm font-body text-gray-400">{{ hoy }}</span>
        </h2>

        <div v-if="lote.length === 0" class="text-center py-10 text-gray-400 font-body">
          Sin productos agregados todavía
        </div>

        <div v-else class="space-y-3 mb-6 max-h-72 overflow-y-auto pr-1">
          <div
            v-for="(item, i) in lote"
            :key="i"
            class="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3"
          >
            <div>
              <p class="font-body text-sm text-gray-900">{{ item.nombre }}</p>
              <p class="font-body text-xs text-gray-400">{{ item.codigo }}</p>
            </div>
            <div class="flex items-center gap-4">
              <span class="font-display text-xl font-bold text-teal">×{{ item.cantidad }}</span>
              <button
                @click="lote.splice(i, 1)"
                class="text-gray-400 hover:text-red-400 transition-colors text-lg"
              >✕</button>
            </div>
          </div>
        </div>

        <div v-if="lote.length > 0">
          <!-- Nota opcional -->
          <textarea
            v-model="nota"
            rows="2"
            placeholder="Nota opcional..."
            class="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 font-body text-sm
                   focus:outline-none focus:border-teal transition-colors mb-4 resize-none placeholder-gray-400"
          ></textarea>

          <!-- Horas de trabajo -->
          <div class="bg-gray-50 rounded-xl p-4 mb-4">
            <p class="font-body text-sm font-semibold text-gray-700 mb-3">⏱ Mano de obra</p>
            <div class="flex gap-3">
              <div class="flex-1">
                <label class="block font-body text-xs text-gray-400 mb-1">Horas trabajadas</label>
                <input
                  v-model.number="costos.horas"
                  type="number" min="0" step="0.5" placeholder="0"
                  class="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-800 font-body text-sm focus:outline-none focus:border-teal transition-colors"
                />
              </div>
              <div class="flex-1">
                <label class="block font-body text-xs text-gray-400 mb-1">Costo por hora ($)</label>
                <input
                  v-model.number="costos.costo_hora"
                  type="number" min="0" step="100" placeholder="0"
                  class="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-800 font-body text-sm focus:outline-none focus:border-teal transition-colors"
                />
              </div>
            </div>
          </div>

          <!-- Insumos -->
          <div class="bg-gray-50 rounded-xl p-4 mb-4">
            <p class="font-body text-sm font-semibold text-gray-700 mb-3">🧪 Insumos utilizados</p>
            <div class="flex gap-2 mb-3">
              <select
                v-model="insumoSel"
                class="flex-1 px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-800 font-body text-sm focus:outline-none focus:border-teal transition-colors"
              >
                <option value="">— Seleccionar insumo —</option>
                <option v-for="ins in catalogoInsumos" :key="ins.id" :value="ins.id">
                  {{ ins.nombre }}
                </option>
              </select>
              <div class="flex items-center gap-1">
                <input
                  v-model.number="insumoQty"
                  type="number" min="0.001"
                  :step="insumoSelObj?.unidad === 'unidad' ? 1 : 0.001"
                  placeholder="0"
                  class="w-24 px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-800 font-body text-sm focus:outline-none focus:border-teal transition-colors"
                />
                <span class="font-body text-xs text-gray-400 w-10 text-left">{{ insumoSelObj?.unidad || '' }}</span>
              </div>
              <button
                @click="agregarInsumo"
                :disabled="!insumoSel || !insumoQty"
                class="px-4 py-2 bg-teal text-gray-900 rounded-lg font-body text-sm font-medium hover:bg-teal/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >+ Agregar</button>
            </div>
            <div v-if="costos.insumos.length === 0" class="text-center py-2 text-gray-400 font-body text-xs">Sin insumos cargados</div>
            <div v-else class="space-y-2">
              <div
                v-for="(ins, i) in costos.insumos"
                :key="i"
                class="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-gray-100"
              >
                <div class="flex-1 min-w-0">
                  <p class="font-body text-sm text-gray-900 truncate">{{ ins.nombre }}</p>
                  <p class="font-body text-xs text-gray-400">{{ ins.cantidad }} {{ ins.unidad }} × ${{ formatNum(ins.costo_unitario) }}</p>
                </div>
                <span class="font-body text-sm font-semibold text-gray-700 mx-3">${{ formatNum(ins.cantidad * ins.costo_unitario) }}</span>
                <button @click="costos.insumos.splice(i, 1)" class="text-gray-300 hover:text-red-400 transition-colors text-lg leading-none">✕</button>
              </div>
            </div>
            <!-- Total costos -->
            <div v-if="costoTotal > 0" class="flex justify-between items-center mt-3 pt-3 border-t border-gray-200">
              <span class="font-body text-xs text-gray-500">Costo total del lote</span>
              <span class="font-body text-sm font-bold text-gray-900">${{ formatNum(costoTotal) }}</span>
            </div>
          </div>

          <button
            @click="confirmarProduccion"
            :disabled="enviando"
            class="w-full py-3 bg-keto-orange text-gray-800 font-body font-semibold rounded-xl
                   hover:bg-keto-orange/80 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ enviando ? 'Guardando...' : '✓ Confirmar producción' }}
          </button>

          <div class="flex gap-2 mt-3">
            <button
              @click="exportarPDF"
              class="flex-1 py-3 border border-gray-200 text-gray-600 font-body text-sm font-medium rounded-xl
                     hover:border-gray-400 hover:text-gray-900 transition-colors"
            >🖨️ Imprimir</button>
            <button
              @click="descargarPDF"
              class="flex-1 py-3 border border-brand-green text-brand-green font-body text-sm font-medium rounded-xl
                     hover:bg-brand-green hover:text-white transition-colors"
            >⬇️ PDF</button>
            <button
              @click="descargarExcel()"
              class="flex-1 py-3 bg-green-600 text-white font-body text-sm font-medium rounded-xl
                     hover:bg-green-700 transition-colors"
            >📊 Excel</button>
          </div>

          <p v-if="mensajeOk" class="text-teal text-sm text-center mt-3 font-body">{{ mensajeOk }}</p>
          <p v-if="mensajeErr" class="text-red-400 text-sm text-center mt-3 font-body">{{ mensajeErr }}</p>
        </div>
      </div>
    </div>

    <!-- Historial de lotes -->
    <div class="mt-8 bg-white border border-gray-200 rounded-2xl p-6">
      <h2 class="font-display text-lg font-semibold text-gray-900 mb-5">Historial de lotes</h2>
      <div v-if="lotes.length === 0" class="text-gray-400 font-body text-sm">Sin registros</div>
      <div v-else class="space-y-3">
        <div
          v-for="lote in lotes"
          :key="lote.lote_id"
          class="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3"
        >
          <div>
            <p class="font-body text-sm font-semibold text-gray-900">
              Producción del {{ formatFecha(lote.fecha) }}
            </p>
            <p class="font-body text-xs text-gray-400">
              {{ lote.items.length }} producto(s) · {{ lote.total_unidades }} unidades totales
              <span v-if="lote.nota"> · {{ lote.nota }}</span>
            </p>
          </div>
          <div class="flex gap-2">
            <button
              @click="abrirDetalleLote(lote)"
              class="px-3 py-1 rounded-lg border border-gray-200 text-gray-500 text-xs font-body hover:border-teal hover:text-teal transition-colors"
            >Ver</button>
            <button
              @click="confirmarEliminarLote(lote)"
              class="px-3 py-1 rounded-lg border border-red-200 text-red-400 text-xs font-body hover:bg-red-50 transition-colors"
            >Eliminar</button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal detalle de lote -->
  <div v-if="loteDetalle" class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
    <div class="bg-white border border-gray-200 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <div class="flex justify-between items-start mb-4">
        <div>
          <h2 class="font-display text-xl font-bold text-gray-900">Producción {{ formatFecha(loteDetalle.fecha) }}</h2>
          <p class="font-body text-sm text-gray-400">{{ loteDetalle.items.length }} productos · {{ loteDetalle.total_unidades }} unidades</p>
        </div>
        <button @click="loteDetalle = null" class="text-gray-400 hover:text-gray-700 text-xl">✕</button>
      </div>

      <!-- Tabs -->
      <div class="flex gap-1 mb-5 bg-gray-100 rounded-xl p-1">
        <button
          @click="tabDetalle = 'productos'"
          class="flex-1 py-2 rounded-lg font-body text-sm font-medium transition-colors"
          :class="tabDetalle === 'productos' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
        >📦 Productos</button>
        <button
          @click="tabDetalle = 'costos'"
          class="flex-1 py-2 rounded-lg font-body text-sm font-medium transition-colors"
          :class="tabDetalle === 'costos' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
        >💰 Costos</button>
      </div>

      <!-- Tab Productos -->
      <div v-if="tabDetalle === 'productos'">
        <div class="space-y-2 mb-4">
          <div
            v-for="item in loteDetalle.items"
            :key="item.id"
            class="flex justify-between items-center bg-gray-50 rounded-xl px-4 py-2"
          >
            <div>
              <p class="font-body text-sm text-gray-900">{{ item.producto?.nombre }}</p>
              <p class="font-body text-xs text-gray-400 font-mono">{{ item.producto?.codigo }}</p>
            </div>
            <span class="font-display text-lg font-bold text-teal">×{{ item.cantidad }}</span>
          </div>
        </div>
        <div class="flex gap-2 mt-4">
          <button @click="descargarPDFLote(loteDetalle)" class="flex-1 py-2 border border-brand-green text-brand-green font-body text-sm rounded-xl hover:bg-brand-green hover:text-white transition-colors">⬇️ PDF</button>
          <button @click="descargarExcelLote(loteDetalle)" class="flex-1 py-2 bg-green-600 text-white font-body text-sm rounded-xl hover:bg-green-700 transition-colors">📊 Excel</button>
          <button @click="confirmarEliminarLote(loteDetalle); loteDetalle = null" class="flex-1 py-2 border border-red-200 text-red-400 font-body text-sm rounded-xl hover:bg-red-50 transition-colors">Eliminar lote</button>
        </div>
      </div>

      <!-- Tab Costos -->
      <div v-if="tabDetalle === 'costos'">
        <!-- Horas -->
        <div class="bg-gray-50 rounded-xl p-4 mb-4">
          <h3 class="font-body text-sm font-semibold text-gray-700 mb-3">⏱ Mano de obra</h3>
          <div class="flex gap-3">
            <div class="flex-1">
              <label class="block font-body text-xs text-gray-400 mb-1">Horas trabajadas</label>
              <input
                v-model.number="costos.horas"
                type="number" min="0" step="0.5" placeholder="0"
                class="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-800 font-body text-sm focus:outline-none focus:border-teal transition-colors"
              />
            </div>
            <div class="flex-1">
              <label class="block font-body text-xs text-gray-400 mb-1">Costo por hora ($)</label>
              <input
                v-model.number="costos.costo_hora"
                type="number" min="0" step="100" placeholder="0"
                class="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-800 font-body text-sm focus:outline-none focus:border-teal transition-colors"
              />
            </div>
            <div class="flex-1">
              <label class="block font-body text-xs text-gray-400 mb-1">Subtotal mano de obra</label>
              <div class="px-3 py-2 rounded-lg bg-teal/10 border border-teal/20 font-body text-sm font-semibold text-teal">
                ${{ formatNum((costos.horas || 0) * (costos.costo_hora || 0)) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Insumos -->
        <div class="bg-gray-50 rounded-xl p-4 mb-4">
          <h3 class="font-body text-sm font-semibold text-gray-700 mb-3">🧪 Insumos utilizados</h3>

          <!-- Agregar insumo -->
          <div class="flex gap-2 mb-3">
            <select
              v-model="insumoSel"
              class="flex-1 px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-800 font-body text-sm focus:outline-none focus:border-teal transition-colors"
              @change="insumoSel && (insumoQty = 1)"
            >
              <option value="">— Seleccionar insumo —</option>
              <option v-for="ins in catalogoInsumos" :key="ins.id" :value="ins.id">
                {{ ins.nombre }}
              </option>
            </select>
            <div class="flex items-center gap-1">
              <input
                v-model.number="insumoQty"
                type="number" min="0.001"
                :step="insumoSelObj?.unidad === 'unidad' ? 1 : 0.001"
                placeholder="0"
                class="w-24 px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-800 font-body text-sm focus:outline-none focus:border-teal transition-colors"
              />
              <span class="font-body text-xs text-gray-400 w-10 text-left">{{ insumoSelObj?.unidad || '' }}</span>
            </div>
            <button
              @click="agregarInsumo"
              :disabled="!insumoSel || !insumoQty"
              class="px-4 py-2 bg-teal text-gray-900 rounded-lg font-body text-sm font-medium hover:bg-teal/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >+ Agregar</button>
          </div>

          <!-- Lista de insumos cargados -->
          <div v-if="costos.insumos.length === 0" class="text-center py-4 text-gray-400 font-body text-sm">
            Sin insumos cargados todavía
          </div>
          <div v-else class="space-y-2">
            <div
              v-for="(ins, i) in costos.insumos"
              :key="i"
              class="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-gray-100"
            >
              <div class="flex-1 min-w-0">
                <p class="font-body text-sm text-gray-900 truncate">{{ ins.nombre }}</p>
                <p class="font-body text-xs text-gray-400">{{ ins.cantidad }} {{ ins.unidad }} × ${{ formatNum(ins.costo_unitario) }}</p>
              </div>
              <span class="font-body text-sm font-semibold text-gray-700 mx-3">
                ${{ formatNum(ins.cantidad * ins.costo_unitario) }}
              </span>
              <button @click="costos.insumos.splice(i, 1)" class="text-gray-300 hover:text-red-400 transition-colors text-lg leading-none">✕</button>
            </div>
          </div>
        </div>

        <!-- Resumen total -->
        <div class="bg-gray-900 rounded-xl px-5 py-4 mb-4 flex justify-between items-center">
          <span class="font-body text-sm text-gray-300">Costo total del lote</span>
          <span class="font-display text-xl font-bold text-teal">${{ formatNum(costoTotal) }}</span>
        </div>

        <p v-if="costosMensaje" class="text-teal text-sm font-body text-center mb-3">{{ costosMensaje }}</p>
        <p v-if="costosError" class="text-red-400 text-sm font-body text-center mb-3">{{ costosError }}</p>

        <button
          @click="guardarCostos"
          :disabled="guardandoCostos"
          class="w-full py-3 bg-keto-orange text-gray-900 font-body font-semibold rounded-xl hover:bg-keto-orange/80 transition-colors disabled:opacity-50"
        >{{ guardandoCostos ? 'Guardando...' : '💾 Guardar costos' }}</button>
      </div>
    </div>
  </div>

  <!-- Modal confirmar eliminación de lote -->
  <div v-if="loteAEliminar" class="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4">
    <div class="bg-white border border-gray-200 rounded-2xl p-6 w-full max-w-sm">
      <h2 class="font-display text-lg font-bold text-gray-900 mb-2">Eliminar lote</h2>
      <p class="font-body text-sm text-gray-600 mb-1">Producción del <strong>{{ formatFecha(loteAEliminar.fecha) }}</strong></p>
      <p class="font-body text-sm text-red-400 mb-6">
        Se revertirán <strong>{{ loteAEliminar.total_unidades }}</strong> unidades del stock de {{ loteAEliminar.items.length }} producto(s). Esta acción no se puede deshacer.
      </p>
      <div class="flex gap-3">
        <button @click="loteAEliminar = null" class="flex-1 py-3 rounded-xl border border-gray-200 text-gray-500 font-body text-sm hover:border-gray-400 transition-colors">Cancelar</button>
        <button @click="eliminarLote" :disabled="eliminando" class="flex-1 py-3 bg-red-500 text-white font-body text-sm font-semibold rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50">
          {{ eliminando ? 'Eliminando...' : 'Confirmar' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import html2pdf from 'html2pdf.js'
import * as XLSX from 'xlsx'
import ProductSelect from '@/components/admin/ProductSelect.vue'

const productos        = ref([])
const selectedId       = ref('')
const cantidad         = ref(1)
const nota             = ref('')
const lote             = ref([])
const lotes            = ref([])
const enviando         = ref(false)
const mensajeOk        = ref('')
const mensajeErr       = ref('')
const loteDetalle      = ref(null)
const loteAEliminar    = ref(null)
const eliminando       = ref(false)

// Costos
const tabDetalle       = ref('productos')
const catalogoInsumos  = ref([])
const insumoSel        = ref('')
const insumoQty        = ref(1)
const costos           = ref({ horas: 0, costo_hora: 0, insumos: [] })
const guardandoCostos  = ref(false)
const costosMensaje    = ref('')
const costosError      = ref('')

const costoTotal = computed(() => {
  const manoObra = (costos.value.horas || 0) * (costos.value.costo_hora || 0)
  const insumosCosto = costos.value.insumos.reduce((sum, i) => sum + i.cantidad * i.costo_unitario, 0)
  return manoObra + insumosCosto
})

const insumoSelObj = computed(() =>
  catalogoInsumos.value.find(i => i.id === insumoSel.value) || null
)

const hoy = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })

function formatNum(n) {
  return Number(n || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatFecha(f) {
  return new Date(f + 'T12:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })
}

// Agrupar por categoría para el select
const categoriasConProductos = computed(() => {
  const mapa = {}
  for (const p of productos.value) {
    const key = p.categoria?.codigo || 'SIN'
    if (!mapa[key]) mapa[key] = { codigo: key, nombre: p.categoria?.nombre || 'Sin categoría', productos: [] }
    mapa[key].productos.push(p)
  }
  return Object.values(mapa)
})

function agregarItem() {
  if (!selectedId.value || !cantidad.value) return
  const prod = productos.value.find(p => p.id === selectedId.value)
  if (!prod) return
  const existente = lote.value.find(i => i.producto_id === selectedId.value)
  if (existente) {
    existente.cantidad += cantidad.value
  } else {
    lote.value.push({
      producto_id: selectedId.value,
      nombre:      prod.nombre,
      codigo:      prod.codigo,
      cantidad:    cantidad.value,
    })
  }
  selectedId.value = ''
  cantidad.value   = 1
}

async function confirmarProduccion() {
  if (!lote.value.length) return
  enviando.value  = true
  mensajeOk.value = ''
  mensajeErr.value = ''
  try {
    const token   = localStorage.getItem('ceketo_token')
    const headers = { Authorization: `Bearer ${token}` }
    const lote_id = crypto.randomUUID()
    const fechaLocal = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' })

    await axios.post('/api/produccion', {
      lote_id,
      fecha: fechaLocal,
      items: lote.value.map(i => ({ producto_id: i.producto_id, cantidad: i.cantidad })),
      nota: nota.value || undefined,
    }, { headers })

    // Guardar costos si se cargaron horas o insumos
    const tieneCostos = (costos.value.horas > 0 && costos.value.costo_hora > 0) || costos.value.insumos.length > 0
    if (tieneCostos) {
      await axios.post(`/api/lote-costos/${lote_id}`, {
        horas:      costos.value.horas,
        costo_hora: costos.value.costo_hora,
        insumos:    costos.value.insumos.map(i => ({
          insumo_id:      i.insumo_id,
          cantidad:       i.cantidad,
          costo_unitario: i.costo_unitario,
        })),
      }, { headers })
    }

    mensajeOk.value = `✓ ${lote.value.length} producto(s) registrado(s) correctamente`
    lote.value  = []
    nota.value  = ''
    costos.value = { horas: 0, costo_hora: 0, insumos: [] }
    insumoSel.value = ''
    cargarLotes()
    cargarProductos()
  } catch (err) {
    mensajeErr.value = err.response?.data?.error || 'Error al guardar'
  } finally {
    enviando.value = false
    setTimeout(() => { mensajeOk.value = ''; mensajeErr.value = '' }, 5000)
  }
}

function generarRemitoHTML() {
  const ITEMS_POR_PAGINA = 10
  const totalUnidades = lote.value.reduce((acc, i) => acc + i.cantidad, 0)

  // Lista plana de items con número de fila global
  const todosItems = lote.value.map((item, idx) => ({ ...item, n: idx + 1 }))

  // Dividir en páginas de 10
  const paginas = []
  for (let i = 0; i < todosItems.length; i += ITEMS_POR_PAGINA) {
    paginas.push(todosItems.slice(i, i + ITEMS_POR_PAGINA))
  }
  if (paginas.length === 0) paginas.push([])
  const totalPaginas = paginas.length

  function mitadHTML(titulo, items, pIdx) {
    const esUltima = pIdx === totalPaginas - 1
    const paginaLabel = totalPaginas > 1 ? ` (${pIdx + 1}/${totalPaginas})` : ''
    let rows = items.map(item => `
      <tr>
        <td class="num">${item.n}</td>
        <td class="cod">${item.codigo}</td>
        <td>${item.nombre}</td>
        <td class="cant">${item.cantidad}</td>
      </tr>`).join('')

    return `
    <div class="mitad">
      <div class="header">
        <div class="hleft">
          <div class="empresa">CEKETO</div>
          <div class="sub">Independencia 663, Santiago del Estero</div>
        </div>
        <div class="hright">
          <div class="titulo">${titulo}</div>
          <div class="fecha">Fecha: ${hoy}${paginaLabel}</div>
        </div>
      </div>
      <div class="subtitulo">REMITO DE PRODUCCIÓN</div>
      <table>
        <thead><tr>
          <th class="num">#</th>
          <th class="cod">Código</th>
          <th>Producto</th>
          <th class="cant">Cant.</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="spacer"></div>
      ${esUltima ? `
      <div class="footer">
        <div class="total">Total de unidades: <strong>${totalUnidades}</strong></div>
        ${nota.value ? `<div class="nota">Nota: ${nota.value}</div>` : ''}
        <div class="firmas">
          <div class="firma"><div class="linea"></div><div>Entregado por</div></div>
          <div class="firma"><div class="linea"></div><div>Recibido por</div></div>
        </div>
      </div>` : `<div class="continua">Continúa en hoja ${pIdx + 2}...</div>`}
    </div>`
  }

  let body = ''
  for (let p = 0; p < totalPaginas; p++) {
    const breakClass = p < totalPaginas - 1 ? ' page-break' : ''
    body += `
    <div class="pagina${breakClass}">
      ${mitadHTML('ORIGINAL', paginas[p], p)}
      <div class="corte"><span class="tijera">✂</span></div>
      ${mitadHTML('DUPLICADO', paginas[p], p)}
    </div>`
  }

  const estilos = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, sans-serif; font-size: 11px; color: #000; background: #fff; }

  .pagina { width: 210mm; height: 297mm; display: flex; flex-direction: column; overflow: hidden; }
  .page-break { page-break-after: always; }

  .mitad { height: 148.5mm; padding: 8mm 15mm; display: flex; flex-direction: column; overflow: hidden; }

  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 7px; border-bottom: 2px solid #058D76; padding-bottom: 7px; }
  .empresa { font-size: 22px; font-weight: bold; color: #058D76; letter-spacing: 3px; }
  .sub { font-size: 9px; color: #666; margin-top: 2px; }
  .titulo { font-size: 11px; font-weight: bold; background: #058D76; color: white; padding: 3px 10px; border-radius: 3px; text-align: center; }
  .fecha { font-size: 10px; color: #666; margin-top: 4px; text-align: right; }

  .subtitulo { font-size: 11px; font-weight: bold; text-align: center; margin: 6px 0; letter-spacing: 2px; color: #333; }

  table { width: 100%; border-collapse: collapse; }
  th { background: #f0f9f7; border: 1px solid #ddd; padding: 4px 6px; text-align: left; font-size: 10px; }
  td { border: 1px solid #eee; padding: 3px 6px; font-size: 10px; }
  .num { width: 26px; text-align: center; }
  .cod { width: 80px; font-family: monospace; font-size: 9px; }
  .cant { width: 42px; text-align: center; font-weight: bold; }

  .spacer { flex: 1; }

  .footer { }
  .total { font-size: 11px; font-weight: bold; text-align: right; margin-bottom: 6px; }
  .nota { font-size: 10px; color: #555; border-top: 1px dashed #ccc; padding: 5px 0; margin-bottom: 6px; }
  .firmas { display: flex; justify-content: space-around; margin-top: 12px; }
  .firma { text-align: center; font-size: 10px; color: #555; }
  .linea { border-top: 1px solid #000; width: 110px; margin-bottom: 4px; }
  .continua { font-size: 9px; color: #aaa; text-align: right; font-style: italic; }

  .corte { height: 4px; border-top: 1.5px dashed #bbb; margin: 0; position: relative; display: flex; align-items: center; justify-content: flex-start; padding-left: 8mm; }
  .tijera { font-size: 13px; color: #bbb; line-height: 1; }

  @media print {
    @page { margin: 0; size: A4 portrait; }
    .page-break { page-break-after: always; }
  }`

  return { estilos, body }
}

function exportarPDF() {
  if (!lote.value.length) return
  const { estilos, body } = generarRemitoHTML()
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${estilos}</style></head><body>${body}<script>window.onload=function(){window.print()}<\/script></body></html>`
  const win = window.open('', '_blank', 'width=800,height=900')
  win.document.write(html)
  win.document.close()
}

async function descargarPDF() {
  if (!lote.value.length) return
  const { estilos, body } = generarRemitoHTML()
  const el = document.createElement('div')
  el.innerHTML = `<style>${estilos}</style>${body}`
  el.style.width = '210mm'
  document.body.appendChild(el)
  await html2pdf().set({
    margin: 0,
    filename: `remito-produccion-${hoy}.pdf`,
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  }).from(el).save()
  document.body.removeChild(el)
}

async function abrirDetalleLote(l) {
  loteDetalle.value = l
  tabDetalle.value = 'productos'
  costosMensaje.value = ''
  costosError.value = ''
  insumoSel.value = ''
  insumoQty.value = 1

  // Cargar catálogo de insumos y costos existentes del lote
  try {
    const token = localStorage.getItem('ceketo_token')
    const headers = { Authorization: `Bearer ${token}` }
    const [catRes, costosRes] = await Promise.all([
      axios.get('/api/insumos', { headers }),
      axios.get(`/api/lote-costos/${l.lote_id}`, { headers }),
    ])
    catalogoInsumos.value = catRes.data
    const data = costosRes.data
    costos.value = {
      horas:     data.horas ? Number(data.horas.horas) : 0,
      costo_hora: data.horas ? Number(data.horas.costo_hora) : 0,
      insumos:   (data.insumos || []).map(i => ({
        insumo_id:     i.insumo_id,
        nombre:        i.insumo?.nombre || '',
        unidad:        i.insumo?.unidad || '',
        cantidad:      Number(i.cantidad),
        costo_unitario: Number(i.costo_unitario),
      })),
    }
  } catch { /* si falla, empezar vacío */ }
}

function agregarInsumo() {
  if (!insumoSel.value || !insumoQty.value) return
  const ins = catalogoInsumos.value.find(i => i.id === insumoSel.value)
  if (!ins) return
  const existente = costos.value.insumos.find(i => i.insumo_id === ins.id)
  if (existente) {
    existente.cantidad += Number(insumoQty.value)
  } else {
    costos.value.insumos.push({
      insumo_id:     ins.id,
      nombre:        ins.nombre,
      unidad:        ins.unidad,
      cantidad:      Number(insumoQty.value),
      costo_unitario: Number(ins.costo_unitario),
    })
  }
  insumoSel.value = ''
  insumoQty.value = 1
}

async function guardarCostos() {
  guardandoCostos.value = true
  costosMensaje.value = ''
  costosError.value = ''
  try {
    const token = localStorage.getItem('ceketo_token')
    await axios.post(`/api/lote-costos/${loteDetalle.value.lote_id}`, {
      horas:      costos.value.horas,
      costo_hora: costos.value.costo_hora,
      insumos:    costos.value.insumos.map(i => ({
        insumo_id:     i.insumo_id,
        cantidad:      i.cantidad,
        costo_unitario: i.costo_unitario,
      })),
    }, { headers: { Authorization: `Bearer ${token}` } })
    costosMensaje.value = '✓ Costos guardados correctamente'
    setTimeout(() => { costosMensaje.value = '' }, 3000)
  } catch (err) {
    costosError.value = err.response?.data?.error || 'Error al guardar costos'
  } finally {
    guardandoCostos.value = false
  }
}
function confirmarEliminarLote(l) { loteAEliminar.value = l }

async function eliminarLote() {
  if (!loteAEliminar.value) return
  eliminando.value = true
  try {
    const token = localStorage.getItem('ceketo_token')
    await axios.delete(`/api/produccion/lote/${loteAEliminar.value.lote_id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    loteAEliminar.value = null
    await cargarLotes()
    await cargarProductos()
    mensajeOk.value = '✓ Lote eliminado y stock revertido'
    setTimeout(() => { mensajeOk.value = '' }, 4000)
  } catch (err) {
    mensajeErr.value = err.response?.data?.error || 'Error al eliminar'
    setTimeout(() => { mensajeErr.value = '' }, 4000)
  } finally {
    eliminando.value = false
  }
}

function descargarPDFLote(l) {
  // Simular lote temporal para reutilizar generarRemitoHTML
  const loteBackup = lote.value
  lote.value = l.items.map(i => ({
    producto_id: i.producto_id,
    nombre: i.producto?.nombre,
    codigo: i.producto?.codigo,
    cantidad: i.cantidad,
  }))
  const notaBackup = nota.value
  nota.value = l.nota || ''
  descargarPDF()
  lote.value = loteBackup
  nota.value = notaBackup
}

function _buildExcelFilas(items) {
  const totalUnidades = items.reduce((acc, i) => acc + i.cantidad, 0)
  const filas = items.map((item, idx) => ({
    '#':        idx + 1,
    'Código':   item.codigo || item.producto?.codigo || '',
    'Producto': item.nombre || item.producto?.nombre || '',
    'Cantidad': item.cantidad,
  }))
  filas.push({ '#': '', 'Código': '', 'Producto': 'TOTAL', 'Cantidad': totalUnidades })
  return filas
}

function descargarExcel() {
  if (!lote.value.length) return
  const filas = _buildExcelFilas(lote.value)
  const ws = XLSX.utils.json_to_sheet(filas)
  ws['!cols'] = [{ wch: 4 }, { wch: 12 }, { wch: 35 }, { wch: 10 }]
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Producción')
  const fechaStr = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' })
  XLSX.writeFile(wb, `remito-produccion-${fechaStr}.xlsx`)
}

function descargarExcelLote(l) {
  const items = l.items.map(i => ({
    codigo:   i.producto?.codigo || '',
    nombre:   i.producto?.nombre || '',
    cantidad: i.cantidad,
  }))
  const filas = _buildExcelFilas(items)
  const ws = XLSX.utils.json_to_sheet(filas)
  ws['!cols'] = [{ wch: 4 }, { wch: 12 }, { wch: 35 }, { wch: 10 }]
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Producción')
  XLSX.writeFile(wb, `remito-produccion-${l.fecha}.xlsx`)
}

async function cargarProductos() {
  const { data } = await axios.get('/api/productos?limit=500')
  productos.value = data
}

async function cargarLotes() {
  try {
    const { data } = await axios.get('/api/produccion/lotes')
    lotes.value = data
  } catch { lotes.value = [] }
}

async function cargarCatalogoInsumos() {
  try {
    const { data } = await axios.get('/api/insumos', { headers: { Authorization: `Bearer ${localStorage.getItem('ceketo_token')}` } })
    catalogoInsumos.value = data
  } catch { /* si no hay insumos cargados aún, no es error crítico */ }
}

onMounted(async () => {
  await Promise.all([cargarProductos(), cargarLotes(), cargarCatalogoInsumos()])
})
</script>
