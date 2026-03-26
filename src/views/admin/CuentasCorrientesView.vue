<template>
  <div class="p-8">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8 flex-wrap gap-4">
      <div>
        <h1 class="font-display text-3xl font-bold text-gray-900">Cuentas Corrientes</h1>
        <p class="font-body text-gray-500 mt-1">Clientes y proveedores que operan en cuenta</p>
      </div>
      <button @click="abrirModalCuenta()" class="flex items-center gap-2 bg-teal text-gray-900 px-5 py-2.5 rounded-xl font-body font-medium text-sm hover:bg-teal/80 transition-colors">
        + Nueva cuenta
      </button>
    </div>

    <!-- Tabs cliente / proveedor -->
    <div class="flex gap-2 mb-6">
      <button
        v-for="tab in tabs" :key="tab.value"
        @click="tabActual = tab.value"
        class="px-5 py-2 rounded-xl font-body text-sm font-medium transition-all"
        :class="tabActual === tab.value ? 'bg-teal text-gray-900' : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-400'"
      >{{ tab.label }} ({{ cuentasFiltradas(tab.value).length }})</button>
    </div>

    <!-- Resumen saldos -->
    <div class="grid sm:grid-cols-2 gap-4 mb-6">
      <div class="bg-white border border-gray-200 rounded-2xl p-5">
        <p class="font-body text-xs text-gray-400 uppercase tracking-wider mb-1">Total que te deben (clientes)</p>
        <p class="font-display text-2xl font-bold" :class="totalClientes >= 0 ? 'text-teal' : 'text-red-400'">${{ formatNum(totalClientes) }}</p>
      </div>
      <div class="bg-white border border-gray-200 rounded-2xl p-5">
        <p class="font-body text-xs text-gray-400 uppercase tracking-wider mb-1">Total que debés (proveedores)</p>
        <p class="font-display text-2xl font-bold" :class="totalProveedores <= 0 ? 'text-teal' : 'text-red-400'">${{ formatNum(totalProveedores) }}</p>
      </div>
    </div>

    <!-- Lista de cuentas -->
    <div class="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div v-if="loading" class="text-center py-16 text-gray-400 font-body">Cargando...</div>
      <div v-else-if="!cuentasFiltradas(tabActual).length" class="text-center py-16 text-gray-400 font-body">
        No hay {{ tabActual === 'cliente' ? 'clientes' : 'proveedores' }} registrados.
      </div>
      <table v-else class="w-full">
        <thead>
          <tr class="border-b border-gray-200">
            <th class="text-left px-6 py-4 font-body text-xs text-gray-400 uppercase tracking-wider">Nombre</th>
            <th class="text-left px-6 py-4 font-body text-xs text-gray-400 uppercase tracking-wider hidden md:table-cell">Teléfono</th>
            <th class="text-right px-6 py-4 font-body text-xs text-gray-400 uppercase tracking-wider">Saldo</th>
            <th class="text-center px-6 py-4 font-body text-xs text-gray-400 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="c in cuentasFiltradas(tabActual)"
            :key="c.id"
            class="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
            @click="abrirDetalle(c)"
          >
            <td class="px-6 py-4">
              <p class="font-body text-sm font-medium text-gray-900">{{ c.nombre }}</p>
              <p v-if="c.notas" class="font-body text-xs text-gray-400 mt-0.5 truncate max-w-xs">{{ c.notas }}</p>
            </td>
            <td class="px-6 py-4 font-body text-sm text-gray-500 hidden md:table-cell">{{ c.telefono || '—' }}</td>
            <td class="px-6 py-4 text-right">
              <span class="font-display text-base font-bold" :class="saldoClass(c)">
                ${{ formatNum(Math.abs(c.saldo)) }}
              </span>
              <p class="font-body text-xs mt-0.5 text-right" :class="saldoClass(c)">{{ saldoLabel(c) }}</p>
            </td>
            <td class="px-6 py-4 text-center" @click.stop>
              <div class="flex items-center justify-center gap-2">
                <button @click="abrirModalCuenta(c)" class="text-gray-400 hover:text-gray-900 text-sm px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors" title="Editar">✏️</button>
                <button @click="eliminarCuenta(c)" class="text-gray-400 hover:text-red-400 text-sm px-2 py-1 rounded-lg hover:bg-red-50 transition-colors" title="Eliminar">🗑️</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- ── MODAL NUEVA/EDITAR CUENTA ─────────────────────────── -->
  <Transition name="modal">
    <div v-if="modalCuenta.visible" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click.self="modalCuenta.visible = false">
      <div class="bg-white border border-gray-200 rounded-3xl p-8 w-full max-w-md shadow-2xl">
        <h2 class="font-display text-xl font-bold text-gray-900 mb-6">{{ modalCuenta.id ? 'Editar cuenta' : 'Nueva cuenta' }}</h2>
        <div class="space-y-4">
          <div>
            <label class="block font-body text-xs text-gray-500 uppercase tracking-wider mb-2">Tipo *</label>
            <div class="flex gap-3">
              <button
                v-for="t in tabs" :key="t.value"
                @click="modalCuenta.tipo = t.value"
                class="flex-1 py-2 rounded-xl border font-body text-sm font-medium transition-all"
                :class="modalCuenta.tipo === t.value ? 'bg-teal border-teal text-gray-900' : 'border-gray-200 text-gray-500'"
              >{{ t.label }}</button>
            </div>
          </div>
          <div>
            <label class="block font-body text-xs text-gray-500 uppercase tracking-wider mb-2">Nombre *</label>
            <input v-model="modalCuenta.nombre" type="text" placeholder="Nombre o razón social" class="input-cc w-full" />
          </div>
          <div>
            <label class="block font-body text-xs text-gray-500 uppercase tracking-wider mb-2">Teléfono</label>
            <input v-model="modalCuenta.telefono" type="text" placeholder="Opcional" class="input-cc w-full" />
          </div>
          <div>
            <label class="block font-body text-xs text-gray-500 uppercase tracking-wider mb-2">Notas</label>
            <textarea v-model="modalCuenta.notas" rows="2" placeholder="Observaciones..." class="input-cc w-full resize-none"></textarea>
          </div>
        </div>
        <div class="flex gap-3 mt-6">
          <button @click="guardarCuenta" :disabled="!modalCuenta.nombre || !modalCuenta.tipo" class="flex-1 bg-teal text-gray-900 py-3 rounded-xl font-body font-medium text-sm hover:bg-teal/80 transition-colors disabled:opacity-40">
            {{ modalCuenta.id ? 'Guardar cambios' : 'Crear cuenta' }}
          </button>
          <button @click="modalCuenta.visible = false" class="px-6 py-3 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 font-body text-sm transition-colors">Cancelar</button>
        </div>
      </div>
    </div>
  </Transition>

  <!-- ── PANEL DETALLE / MOVIMIENTOS ───────────────────────── -->
  <Transition name="slide-right">
    <div v-if="detalle" class="fixed inset-0 z-50 flex">
      <!-- Overlay -->
      <div class="flex-1 bg-black/50" @click="detalle = null"></div>
      <!-- Panel -->
      <div class="w-full max-w-xl bg-white shadow-2xl flex flex-col overflow-hidden">
        <!-- Header del panel -->
        <div class="px-6 py-5 border-b border-gray-200 flex items-start justify-between">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="text-xs font-body font-medium px-2 py-0.5 rounded-full" :class="detalle.cuenta.tipo === 'cliente' ? 'bg-teal/15 text-teal' : 'bg-orange-100 text-orange-600'">
                {{ detalle.cuenta.tipo === 'cliente' ? 'Cliente' : 'Proveedor' }}
              </span>
            </div>
            <h2 class="font-display text-xl font-bold text-gray-900">{{ detalle.cuenta.nombre }}</h2>
            <p v-if="detalle.cuenta.telefono" class="font-body text-sm text-gray-400 mt-0.5">📞 {{ detalle.cuenta.telefono }}</p>
          </div>
          <button @click="detalle = null" class="text-gray-400 hover:text-gray-700 text-xl p-1">✕</button>
        </div>

        <!-- Saldo actual -->
        <div class="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <span class="font-body text-sm text-gray-500">Saldo actual</span>
          <div class="text-right">
            <p class="font-display text-2xl font-bold" :class="detalle.saldo >= 0 && detalle.cuenta.tipo === 'cliente' ? 'text-red-500' : detalle.saldo > 0 && detalle.cuenta.tipo === 'proveedor' ? 'text-red-500' : 'text-teal'">
              ${{ formatNum(Math.abs(detalle.saldo)) }}
            </p>
            <p class="font-body text-xs text-gray-400">{{ saldoLabelDetalle }}</p>
          </div>
        </div>

        <!-- Botón nuevo movimiento -->
        <div class="px-6 py-3 border-b border-gray-200 flex gap-2">
          <button @click="abrirModalMov('cargo')" class="flex-1 py-2 bg-red-50 border border-red-200 text-red-500 font-body text-sm rounded-xl hover:bg-red-100 transition-colors">
            {{ detalle.cuenta.tipo === 'cliente' ? '+ Cargo (venta)' : '+ Cargo (compra)' }}
          </button>
          <button @click="abrirModalMov('pago')" class="flex-1 py-2 bg-teal/10 border border-teal/30 text-teal font-body text-sm rounded-xl hover:bg-teal/20 transition-colors">
            ✓ Registrar pago
          </button>
        </div>

        <!-- Lista movimientos -->
        <div class="flex-1 overflow-y-auto px-6 py-4">
          <div v-if="!detalle.movimientos.length" class="text-center py-10 text-gray-400 font-body text-sm">Sin movimientos registrados</div>
          <div v-else class="space-y-2">
            <div
              v-for="m in detalle.movimientos"
              :key="m.id"
              class="flex items-start justify-between bg-gray-50 rounded-xl px-4 py-3 group"
            >
              <div class="flex items-start gap-3">
                <span class="text-lg mt-0.5">{{ m.tipo === 'cargo' ? '📤' : '💰' }}</span>
                <div>
                  <p class="font-body text-sm text-gray-900">{{ m.concepto }}</p>
                  <p class="font-body text-xs text-gray-400 mt-0.5">{{ formatFecha(m.fecha) }}</p>
                  <p v-if="m.gasto_creado || m.gasto_id" class="font-body text-xs text-teal mt-0.5">✓ Gasto registrado automáticamente</p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <div class="text-right">
                  <p class="font-display font-bold text-sm" :class="m.tipo === 'cargo' ? 'text-red-400' : 'text-teal'">
                    {{ m.tipo === 'cargo' ? '+' : '-' }}${{ formatNum(m.monto) }}
                  </p>
                  <p class="font-body text-xs text-gray-400">Saldo: ${{ formatNum(m.saldo_acum) }}</p>
                </div>
                <button @click="eliminarMovimiento(m)" class="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all text-sm">🗑️</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>

  <!-- ── MODAL NUEVO MOVIMIENTO ─────────────────────────────── -->
  <Transition name="modal">
    <div v-if="modalMov.visible" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] p-4" @click.self="modalMov.visible = false">
      <div class="bg-white border border-gray-200 rounded-3xl p-8 w-full max-w-md shadow-2xl">
        <h2 class="font-display text-xl font-bold text-gray-900 mb-1">
          {{ modalMov.tipo === 'cargo' ? (detalle?.cuenta.tipo === 'cliente' ? 'Nueva venta a cuenta' : 'Nueva compra a cuenta') : 'Registrar pago' }}
        </h2>
        <p v-if="detalle?.cuenta.tipo === 'proveedor' && modalMov.tipo === 'pago'" class="font-body text-xs text-teal mb-4">
          ✓ Se creará un gasto automáticamente en la sección Gastos
        </p>
        <div class="space-y-4 mt-4">
          <div>
            <label class="block font-body text-xs text-gray-500 uppercase tracking-wider mb-2">Fecha *</label>
            <input v-model="modalMov.fecha" type="date" class="input-cc w-full" />
          </div>
          <div>
            <label class="block font-body text-xs text-gray-500 uppercase tracking-wider mb-2">Concepto *</label>
            <input v-model="modalMov.concepto" type="text" :placeholder="modalMov.tipo === 'cargo' ? 'Ej: Productos varios, Pan keto...' : 'Ej: Abono parcial, Pago total...'" class="input-cc w-full" />
          </div>
          <div>
            <label class="block font-body text-xs text-gray-500 uppercase tracking-wider mb-2">Monto $ *</label>
            <input v-model="modalMov.monto" type="number" min="0" step="0.01" placeholder="0.00" class="input-cc w-full" />
          </div>
        </div>
        <div class="flex gap-3 mt-6">
          <button @click="guardarMovimiento" :disabled="!modalMov.fecha || !modalMov.concepto || !modalMov.monto || guardandoMov" class="flex-1 bg-teal text-gray-900 py-3 rounded-xl font-body font-medium text-sm hover:bg-teal/80 transition-colors disabled:opacity-40">
            {{ guardandoMov ? 'Guardando...' : 'Guardar' }}
          </button>
          <button @click="modalMov.visible = false" class="px-6 py-3 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 font-body text-sm transition-colors">Cancelar</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const cuentas     = ref([])
const loading     = ref(true)
const tabActual   = ref('cliente')
const detalle     = ref(null)
const guardandoMov = ref(false)

const tabs = [
  { value: 'cliente',    label: 'Clientes' },
  { value: 'proveedor',  label: 'Proveedores' },
]

const modalCuenta = ref({ visible: false, id: null, tipo: 'cliente', nombre: '', telefono: '', notas: '' })
const modalMov    = ref({ visible: false, tipo: 'cargo', fecha: '', concepto: '', monto: '' })

function formatNum(n) { return Number(n || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 }) }
function formatFecha(f) {
  if (!f) return '—'
  const [y, m, d] = f.split('-')
  return `${d}/${m}/${y}`
}

const cuentasFiltradas = (tipo) => cuentas.value.filter(c => c.tipo === tipo)

const totalClientes   = computed(() => cuentasFiltradas('cliente').reduce((a, c) => a + Number(c.saldo), 0))
const totalProveedores = computed(() => cuentasFiltradas('proveedor').reduce((a, c) => a + Number(c.saldo), 0))

function saldoClass(c) {
  if (c.tipo === 'cliente') return c.saldo > 0 ? 'text-red-500' : c.saldo < 0 ? 'text-teal' : 'text-gray-400'
  return c.saldo > 0 ? 'text-red-500' : c.saldo < 0 ? 'text-teal' : 'text-gray-400'
}
function saldoLabel(c) {
  if (c.saldo === 0) return 'Sin deuda'
  if (c.tipo === 'cliente') return c.saldo > 0 ? 'te debe' : 'a favor'
  return c.saldo > 0 ? 'le debés' : 'a favor'
}

const saldoLabelDetalle = computed(() => {
  if (!detalle.value) return ''
  const s = detalle.value.saldo
  if (s === 0) return 'Sin deuda'
  if (detalle.value.cuenta.tipo === 'cliente') return s > 0 ? 'te debe' : 'pagó de más'
  return s > 0 ? 'le debés' : 'pagaste de más'
})

async function cargarCuentas() {
  loading.value = true
  try {
    const { data } = await axios.get('/api/cuentas')
    cuentas.value = data
  } catch {}
  finally { loading.value = false }
}

function abrirModalCuenta(c = null) {
  if (c) {
    modalCuenta.value = { visible: true, id: c.id, tipo: c.tipo, nombre: c.nombre, telefono: c.telefono || '', notas: c.notas || '' }
  } else {
    modalCuenta.value = { visible: true, id: null, tipo: tabActual.value, nombre: '', telefono: '', notas: '' }
  }
}

async function guardarCuenta() {
  const m = modalCuenta.value
  try {
    if (m.id) {
      await axios.put(`/api/cuentas/${m.id}`, m)
    } else {
      await axios.post('/api/cuentas', m)
    }
    modalCuenta.value.visible = false
    await cargarCuentas()
  } catch (err) {
    alert(err.response?.data?.error || 'Error al guardar')
  }
}

async function eliminarCuenta(c) {
  if (!confirm(`¿Eliminar la cuenta de "${c.nombre}"? Se eliminarán todos sus movimientos.`)) return
  try {
    await axios.delete(`/api/cuentas/${c.id}`)
    await cargarCuentas()
  } catch { alert('Error al eliminar') }
}

async function abrirDetalle(c) {
  try {
    const { data } = await axios.get(`/api/cuentas/${c.id}/movimientos`)
    detalle.value = { cuenta: data.cuenta, movimientos: data.movimientos, saldo: data.saldo }
  } catch { alert('Error al cargar movimientos') }
}

function abrirModalMov(tipo) {
  const hoy = new Date().toISOString().split('T')[0]
  modalMov.value = { visible: true, tipo, fecha: hoy, concepto: '', monto: '' }
}

async function guardarMovimiento() {
  if (!detalle.value) return
  guardandoMov.value = true
  try {
    await axios.post(`/api/cuentas/${detalle.value.cuenta.id}/movimientos`, modalMov.value)
    modalMov.value.visible = false
    await abrirDetalle(detalle.value.cuenta)
    await cargarCuentas()
  } catch (err) {
    alert(err.response?.data?.error || 'Error al guardar')
  } finally { guardandoMov.value = false }
}

async function eliminarMovimiento(m) {
  if (!confirm('¿Eliminar este movimiento?')) return
  try {
    await axios.delete(`/api/cuentas/${detalle.value.cuenta.id}/movimientos/${m.id}`)
    await abrirDetalle(detalle.value.cuenta)
    await cargarCuentas()
  } catch { alert('Error al eliminar') }
}

onMounted(cargarCuentas)
</script>

<style scoped>
.input-cc {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 0.625rem 1rem;
  color: #111827;
  font-size: 0.875rem;
  font-family: Inter, sans-serif;
  transition: border-color 0.2s;
}
.input-cc:focus { outline: none; border-color: #2A9D8F; }

.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }

.slide-right-enter-active, .slide-right-leave-active { transition: all 0.3s ease; }
.slide-right-enter-from, .slide-right-leave-to { opacity: 0; }
.slide-right-enter-from .w-full, .slide-right-leave-to .w-full { transform: translateX(100%); }
</style>
