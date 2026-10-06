<template>
  <div class="p-6 lg:p-8">
    <div class="flex items-center justify-between mb-6 flex-wrap gap-4">
      <div>
        <h1 class="font-display text-3xl font-bold text-gray-900">Insumos</h1>
        <p class="font-body text-gray-500 mt-1">
          {{ esAdmin ? 'Stock de materia prima y envases. Sube con las compras y baja con lo que se usa en producción.'
                     : 'Lo que hay disponible de cada insumo. Baja solo cuando cargan los insumos de cada lote en Producción.' }}
        </p>
      </div>
      <div class="flex gap-2">
        <RouterLink v-if="esAdmin" to="/admin/compras"
          class="px-5 py-2.5 rounded-xl border border-teal/40 text-teal font-body text-sm font-medium hover:bg-teal/5">🧾 Cargar compra</RouterLink>
        <button @click="abrirModal()"
          class="bg-keto-orange text-gray-900 px-5 py-2.5 rounded-xl font-body font-medium text-sm hover:bg-keto-orange/80 transition-colors">+ Nuevo insumo</button>
      </div>
    </div>

    <!-- Resumen -->
    <div class="grid grid-cols-2 gap-4 mb-6" :class="esAdmin ? 'lg:grid-cols-4' : 'lg:grid-cols-3'">
      <div class="bg-white border border-gray-200 rounded-2xl p-5">
        <p class="font-body text-xs text-gray-500 mb-1">Insumos activos</p>
        <p class="font-display text-2xl font-bold text-gray-900">{{ activos.length }}</p>
      </div>
      <button @click="soloReponer = !soloReponer" class="text-left bg-white border rounded-2xl p-5 transition-colors"
        :class="soloReponer ? 'border-amber-400 ring-2 ring-amber-200' : 'border-gray-200 hover:border-amber-300'">
        <p class="font-body text-xs text-gray-500 mb-1">Por reponer</p>
        <p class="font-display text-2xl font-bold" :class="porReponer.length ? 'text-amber-600' : 'text-gray-900'">{{ porReponer.length }}</p>
        <p class="font-body text-xs text-gray-400 mt-1">{{ soloReponer ? 'Mostrando solo estos · tocá para ver todos' : 'En el mínimo o debajo · tocá para filtrar' }}</p>
      </button>
      <div class="bg-white border border-gray-200 rounded-2xl p-5">
        <p class="font-body text-xs text-gray-500 mb-1">Sin stock</p>
        <p class="font-display text-2xl font-bold" :class="sinStock ? 'text-red-500' : 'text-gray-900'">{{ sinStock }}</p>
      </div>
      <div v-if="esAdmin" class="bg-white border border-gray-200 rounded-2xl p-5">
        <p class="font-body text-xs text-gray-500 mb-1">Valor del stock</p>
        <p class="font-display text-2xl font-bold text-teal">${{ fmt0(valorStock) }}</p>
        <p class="font-body text-xs text-gray-400 mt-1">Al costo de la última compra</p>
      </div>
    </div>

    <!-- Lista -->
    <div class="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div v-if="cargando" class="text-center py-16 text-gray-400 font-body">Cargando...</div>
      <div v-else-if="!lista.length" class="text-center py-16 text-gray-400 font-body">
        {{ soloReponer ? 'No hay insumos por reponer. 👍' : 'No hay insumos cargados todavía.' }}
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-200 bg-gray-50">
              <th class="th text-left">Insumo</th>
              <th class="th text-right">Stock</th>
              <th class="th text-right">Mínimo</th>
              <th v-if="esAdmin" class="th text-right">Costo (última compra)</th>
              <th v-if="esAdmin" class="th text-right">Valor en stock</th>
              <th class="th text-center">Estado</th>
              <th class="th text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ins in lista" :key="ins.id" class="border-b border-gray-100 hover:bg-gray-50 transition-colors" :class="!ins.activo ? 'opacity-50' : ''">
              <td class="px-5 py-3.5 font-body text-sm font-semibold text-gray-900">{{ ins.nombre }}</td>
              <td class="px-5 py-3.5 text-right font-body text-sm font-bold whitespace-nowrap" :class="colorStock(ins)">
                {{ fmtCant(ins.stock) }} <span class="font-normal text-gray-400">{{ ins.unidad }}</span>
              </td>
              <td class="px-5 py-3.5 text-right font-body text-sm text-gray-500 whitespace-nowrap">
                {{ Number(ins.stock_minimo) > 0 ? fmtCant(ins.stock_minimo) + ' ' + ins.unidad : '—' }}
              </td>
              <td v-if="esAdmin" class="px-5 py-3.5 text-right font-body text-sm text-gray-700 whitespace-nowrap">${{ fmt(ins.costo_unitario) }} <span class="text-gray-400">/{{ ins.unidad }}</span></td>
              <td v-if="esAdmin" class="px-5 py-3.5 text-right font-body text-sm text-gray-700">${{ fmt0(Math.max(Number(ins.stock), 0) * Number(ins.costo_unitario)) }}</td>
              <td class="px-5 py-3.5 text-center">
                <span v-if="!ins.activo" class="pill bg-gray-100 text-gray-400">Inactivo</span>
                <span v-else-if="Number(ins.stock) <= 0" class="pill bg-red-100 text-red-600">Sin stock</span>
                <span v-else-if="bajo(ins)" class="pill bg-amber-100 text-amber-700">Reponer</span>
                <span v-else class="pill bg-teal/10 text-teal">OK</span>
              </td>
              <td class="px-5 py-3.5 text-center whitespace-nowrap">
                <button v-if="esAdmin" @click="abrirAjuste(ins)" class="accion" title="Ajustar stock (conteo)">📦</button>
                <button @click="verMovimientos(ins)" class="accion" title="Historial de movimientos">📜</button>
                <button v-if="esAdmin" @click="abrirModal(ins)" class="accion" title="Editar">✏️</button>
                <button v-if="esAdmin" @click="toggleActivo(ins)" class="accion" :title="ins.activo ? 'Desactivar' : 'Activar'">{{ ins.activo ? '🔒' : '🔓' }}</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <p v-if="esAdmin" class="font-body text-xs text-gray-400 mt-3">
      📦 Ajustar stock: cuando cuenten lo que hay en la fábrica, cargan lo que contaron y queda registrada la diferencia.
      En Producción, los insumos que se cargan en cada lote se descuentan solos.
    </p>
    <p v-else class="font-body text-xs text-gray-400 mt-3">
      📜 Tocá el historial para ver qué entró (compras) y qué se usó en cada lote.
      Si al contar no coincide con lo que hay en la fábrica, avisale a la administración para que lo ajuste.
    </p>
  </div>

  <!-- Modal nuevo/editar -->
  <div v-if="modal" class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
    <div class="bg-white border border-gray-200 rounded-2xl p-6 w-full max-w-md">
      <div class="flex justify-between items-center mb-5">
        <h2 class="font-display text-lg font-bold text-gray-900">{{ editando ? 'Editar insumo' : 'Nuevo insumo' }}</h2>
        <button @click="cerrarModal" class="text-gray-400 hover:text-gray-700 text-xl">✕</button>
      </div>
      <div class="space-y-4">
        <div>
          <label class="lbl">Nombre *</label>
          <input v-model="form.nombre" type="text" placeholder="Ej: Harina de almendras" class="campo" />
        </div>
        <div class="grid gap-3" :class="esAdmin ? 'grid-cols-2' : 'grid-cols-1'">
          <div>
            <label class="lbl">Unidad (en qué se mide)</label>
            <input v-model="form.unidad" type="text" list="unidades-insumo" placeholder="kg, litro, unidad..." class="campo" />
            <datalist id="unidades-insumo">
              <option value="kg" /><option value="g" /><option value="litro" /><option value="ml" /><option value="unidad" /><option value="paquete" />
            </datalist>
          </div>
          <div v-if="esAdmin">
            <label class="lbl">Costo por {{ form.unidad || 'unidad' }} ($)</label>
            <input v-model.number="form.costo_unitario" type="number" min="0" step="0.01" class="campo" />
          </div>
        </div>
        <div>
          <label class="lbl">Stock mínimo ({{ form.unidad || 'unidad' }}) — avisa cuando hay que reponer</label>
          <input v-model.number="form.stock_minimo" type="number" min="0" step="0.001" placeholder="0 = sin aviso" class="campo" />
        </div>
        <p v-if="esAdmin" class="font-body text-xs text-gray-400">El costo se actualiza solo con cada compra. El stock se mueve con compras, producción o "Ajustar stock".</p>
        <p v-else class="font-body text-xs text-gray-400">Arranca con stock 0. Sube cuando la administración carga la compra y baja cuando lo usan en un lote.</p>
      </div>
      <p v-if="error" class="text-red-500 text-sm font-body mt-3">{{ error }}</p>
      <div class="flex gap-3 mt-6">
        <button @click="cerrarModal" class="flex-1 py-3 rounded-xl border border-gray-200 text-gray-500 font-body text-sm">Cancelar</button>
        <button @click="guardar" :disabled="guardando"
          class="flex-1 py-3 bg-keto-orange text-gray-900 font-body text-sm font-semibold rounded-xl hover:bg-keto-orange/80 disabled:opacity-50">
          {{ guardando ? 'Guardando...' : (editando ? 'Actualizar' : 'Crear') }}
        </button>
      </div>
    </div>
  </div>

  <!-- Modal ajuste de stock -->
  <div v-if="ajuste" class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
    <div class="bg-white border border-gray-200 rounded-2xl p-6 w-full max-w-md">
      <h2 class="font-display text-lg font-bold text-gray-900 mb-1">Ajustar stock — {{ ajuste.insumo.nombre }}</h2>
      <p class="font-body text-sm text-gray-500 mb-4">El sistema dice que hay <b>{{ fmtCant(ajuste.insumo.stock) }} {{ ajuste.insumo.unidad }}</b>. ¿Cuánto contaron?</p>
      <label class="lbl">Cantidad contada ({{ ajuste.insumo.unidad }})</label>
      <input v-model.number="ajuste.stock_nuevo" type="number" min="0" step="0.001" class="campo mb-1" />
      <p v-if="ajuste.stock_nuevo !== '' && ajuste.stock_nuevo !== null" class="font-body text-xs mb-3"
        :class="difAjuste < 0 ? 'text-red-500' : difAjuste > 0 ? 'text-teal' : 'text-gray-400'">
        Diferencia: {{ difAjuste > 0 ? '+' : '' }}{{ fmtCant(difAjuste) }} {{ ajuste.insumo.unidad }}
      </p>
      <label class="lbl">Motivo</label>
      <input v-model="ajuste.motivo" class="campo" placeholder="Ej: conteo de fin de mes, se rompió una bolsa..." />
      <p v-if="error" class="text-red-500 text-sm font-body mt-3">{{ error }}</p>
      <div class="flex gap-3 mt-6">
        <button @click="ajuste = null" class="flex-1 py-3 rounded-xl border border-gray-200 text-gray-500 font-body text-sm">Cancelar</button>
        <button @click="guardarAjuste" :disabled="guardando"
          class="flex-1 py-3 bg-teal text-white font-body text-sm font-semibold rounded-xl hover:bg-teal/85 disabled:opacity-50">
          {{ guardando ? 'Guardando...' : 'Guardar conteo' }}
        </button>
      </div>
    </div>
  </div>

  <!-- Modal movimientos -->
  <div v-if="movs" class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" @click.self="movs = null">
    <div class="bg-white border border-gray-200 rounded-2xl p-6 w-full max-w-2xl max-h-[88vh] overflow-y-auto">
      <div class="flex justify-between items-center mb-4">
        <h2 class="font-display text-lg font-bold text-gray-900">Movimientos — {{ movs.insumo.nombre }}</h2>
        <button @click="movs = null" class="text-gray-400 hover:text-gray-700 text-xl">✕</button>
      </div>
      <div v-if="!movs.lista" class="text-center py-10 text-gray-400 font-body">Cargando...</div>
      <div v-else-if="!movs.lista.length" class="text-center py-10 text-gray-400 font-body">Todavía no tiene movimientos.</div>
      <table v-else class="w-full font-body text-sm">
        <thead>
          <tr class="text-gray-500 text-xs border-b border-gray-200">
            <th class="text-left py-2">Fecha</th><th class="text-left py-2">Tipo</th><th class="text-left py-2">Detalle</th>
            <th class="text-right py-2">Cantidad</th><th class="text-right py-2">Queda</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="m in movs.lista" :key="m.id" class="border-b border-gray-100">
            <td class="py-2 text-gray-500 whitespace-nowrap">{{ fechaHora(m.fecha) }}</td>
            <td class="py-2"><span class="pill" :class="TIPOS[m.tipo].clase">{{ TIPOS[m.tipo].txt }}</span></td>
            <td class="py-2 text-gray-600">{{ m.referencia }}<span v-if="m.usuario" class="text-gray-400"> · {{ m.usuario }}</span></td>
            <td class="py-2 text-right font-semibold whitespace-nowrap" :class="Number(m.cantidad) < 0 ? 'text-red-500' : 'text-teal'">
              {{ Number(m.cantidad) > 0 ? '+' : '' }}{{ fmtCant(m.cantidad) }}
            </td>
            <td class="py-2 text-right text-gray-700 whitespace-nowrap">{{ fmtCant(m.stock_resultante) }} {{ movs.insumo.unidad }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

// Admin: todo. Fábrica: solo mirar el stock y el historial (sin costos, sin editar ni ajustar)
const esAdmin   = localStorage.getItem('ceketo_rol') === 'admin'
const insumos   = ref([])
const cargando  = ref(false)
const modal     = ref(false)
const editando  = ref(null)
const guardando = ref(false)
const error     = ref('')
const soloReponer = ref(false)
const ajuste    = ref(null)
const movs      = ref(null)
const form = ref({ nombre: '', unidad: 'kg', costo_unitario: 0, stock_minimo: 0 })

const TIPOS = {
  compra:     { txt: 'Compra',     clase: 'bg-teal/10 text-teal' },
  produccion: { txt: 'Producción', clase: 'bg-brand-purple/10 text-brand-purple' },
  ajuste:     { txt: 'Ajuste',     clase: 'bg-amber-100 text-amber-700' },
  anulacion:  { txt: 'Anulación',  clase: 'bg-red-100 text-red-600' },
}

const fmt  = n => Number(n || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fmt0 = n => Math.round(Number(n) || 0).toLocaleString('es-AR')
const fmtCant = n => (Math.round((Number(n) || 0) * 1000) / 1000).toLocaleString('es-AR')
const fechaHora = f => new Date(f).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/Argentina/Buenos_Aires' })

const activos    = computed(() => insumos.value.filter(i => i.activo))
const bajo       = i => Number(i.stock_minimo) > 0 && Number(i.stock) <= Number(i.stock_minimo)
const porReponer = computed(() => activos.value.filter(bajo))
const sinStock   = computed(() => activos.value.filter(i => Number(i.stock) <= 0).length)
const valorStock = computed(() => activos.value.reduce((a, i) => a + Math.max(Number(i.stock), 0) * Number(i.costo_unitario), 0))
const lista      = computed(() => soloReponer.value ? porReponer.value : insumos.value)
const colorStock = i => Number(i.stock) <= 0 ? 'text-red-500' : bajo(i) ? 'text-amber-600' : 'text-gray-900'
const difAjuste  = computed(() => ajuste.value ? Math.round(((Number(ajuste.value.stock_nuevo) || 0) - Number(ajuste.value.insumo.stock)) * 1000) / 1000 : 0)

async function cargar() {
  cargando.value = true
  try {
    const { data } = await axios.get(esAdmin ? '/api/insumos/todos' : '/api/insumos')
    insumos.value = data
  } finally { cargando.value = false }
}

function abrirModal(ins = null) {
  editando.value = ins
  error.value = ''
  form.value = ins
    ? { nombre: ins.nombre, unidad: ins.unidad, costo_unitario: Number(ins.costo_unitario), stock_minimo: Number(ins.stock_minimo) }
    : { nombre: '', unidad: 'kg', costo_unitario: 0, stock_minimo: 0 }
  modal.value = true
}
function cerrarModal() { modal.value = false; editando.value = null }

async function guardar() {
  error.value = ''
  if (!form.value.nombre.trim()) { error.value = 'El nombre es obligatorio'; return }
  guardando.value = true
  try {
    const datos = esAdmin ? form.value : { nombre: form.value.nombre, unidad: form.value.unidad, stock_minimo: form.value.stock_minimo }
    if (editando.value) await axios.put(`/api/insumos/${editando.value.id}`, datos)
    else await axios.post('/api/insumos', datos)
    cerrarModal()
    await cargar()
  } catch (err) {
    error.value = err.response?.data?.error || 'Error al guardar'
  } finally { guardando.value = false }
}

async function toggleActivo(ins) {
  try {
    await axios.put(`/api/insumos/${ins.id}`, { activo: !ins.activo })
    await cargar()
  } catch { /* ignore */ }
}

function abrirAjuste(ins) {
  error.value = ''
  ajuste.value = { insumo: ins, stock_nuevo: Number(ins.stock), motivo: '' }
}
async function guardarAjuste() {
  error.value = ''
  guardando.value = true
  try {
    await axios.post(`/api/insumos/${ajuste.value.insumo.id}/ajuste`, { stock_nuevo: ajuste.value.stock_nuevo, motivo: ajuste.value.motivo || 'Ajuste por conteo' })
    ajuste.value = null
    await cargar()
  } catch (err) {
    error.value = err.response?.data?.error || 'No se pudo guardar'
  } finally { guardando.value = false }
}

async function verMovimientos(ins) {
  movs.value = { insumo: ins, lista: null }
  try {
    const { data } = await axios.get(`/api/insumos/${ins.id}/movimientos`)
    movs.value.lista = data
  } catch { movs.value.lista = [] }
}

onMounted(cargar)
</script>

<style scoped>
.th { @apply px-5 py-3.5 font-body text-xs text-gray-500 uppercase tracking-wider; }
.lbl { @apply block font-body text-sm text-gray-500 mb-1; }
.campo { @apply w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 font-body text-sm focus:outline-none focus:border-teal transition-colors; }
.pill { @apply inline-block px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap; }
.accion { @apply text-gray-400 hover:text-gray-900 transition-colors text-sm px-1.5 py-1 rounded-lg hover:bg-gray-100; }
</style>
