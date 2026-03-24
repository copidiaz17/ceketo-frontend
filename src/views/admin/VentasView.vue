<template>
  <div class="p-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="font-display text-3xl font-bold text-white">Registrar Venta</h1>
      <p class="font-body text-white/50 mt-1">Venta en el local mediante código de barras o selector</p>
    </div>

    <div class="grid lg:grid-cols-2 gap-8">
      <!-- Panel izquierdo: agregar producto -->
      <div class="space-y-4">

        <!-- Scanner de código de barras -->
        <div class="bg-[#162421] border border-white/10 rounded-2xl p-6">
          <h2 class="font-display text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span>🔫</span> Lector de código de barras
          </h2>
          <p class="font-body text-xs text-white/40 mb-3">
            Hacé click en el campo y pasá el producto por el lector
          </p>
          <div class="flex gap-3">
            <input
              ref="barcodeInput"
              v-model="barcodeRaw"
              @keydown.enter.prevent="buscarPorBarcode"
              type="text"
              placeholder="*BYM-001*"
              class="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-sm
                     focus:outline-none focus:border-teal transition-colors"
              autofocus
            />
            <button
              @click="buscarPorBarcode"
              class="px-5 py-3 bg-teal text-white rounded-xl font-body text-sm hover:bg-teal/80 transition-colors"
            >Buscar</button>
          </div>
          <p v-if="barcodeError" class="text-red-400 text-xs mt-2 font-body">{{ barcodeError }}</p>
        </div>

        <!-- Selector manual -->
        <div class="bg-[#162421] border border-white/10 rounded-2xl p-6">
          <h2 class="font-display text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span>📋</span> Seleccionar producto
          </h2>
          <div class="mb-4">
            <ProductSelect
              v-model="selectedId"
              :grupos="categoriasConProductos"
            />
          </div>

          <div class="flex gap-3 items-end">
            <div class="flex-1">
              <label class="block font-body text-xs text-white/40 mb-1">Cantidad</label>
              <input
                v-model.number="cantidadVenta"
                type="number"
                min="1"
                class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-body
                       focus:outline-none focus:border-teal transition-colors"
              />
            </div>
            <button
              @click="agregarDesdeSelector"
              :disabled="!selectedId"
              class="px-5 py-3 bg-teal/20 border border-teal text-teal rounded-xl font-body text-sm
                     hover:bg-teal hover:text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              + Agregar
            </button>
          </div>
        </div>

        <!-- Tipo de venta -->
        <div class="bg-[#162421] border border-white/10 rounded-2xl p-6">
          <h2 class="font-display text-base font-semibold text-white mb-3">Tipo de venta</h2>
          <div class="flex gap-3">
            <button
              @click="tipoVenta = 'local'"
              class="flex-1 py-2 rounded-xl font-body text-sm border-2 transition-all duration-200"
              :class="tipoVenta === 'local' ? 'bg-teal border-teal text-white' : 'border-white/10 text-white/50 hover:border-teal/50'"
            >Local</button>
            <button
              @click="tipoVenta = 'online'"
              class="flex-1 py-2 rounded-xl font-body text-sm border-2 transition-all duration-200"
              :class="tipoVenta === 'online' ? 'bg-teal border-teal text-white' : 'border-white/10 text-white/50 hover:border-teal/50'"
            >Online</button>
          </div>
        </div>
      </div>

      <!-- Panel derecho: carrito de venta -->
      <div class="bg-[#162421] border border-white/10 rounded-2xl p-6 flex flex-col">
        <h2 class="font-display text-lg font-semibold text-white mb-5">Ticket de venta</h2>

        <div v-if="carrito.length === 0" class="flex-1 flex items-center justify-center text-white/30 font-body text-sm">
          Sin productos en la venta
        </div>

        <div v-else class="flex-1 space-y-3 overflow-y-auto pr-1 max-h-80 mb-6">
          <div
            v-for="(item, i) in carrito"
            :key="i"
            class="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3"
          >
            <div class="flex-1">
              <p class="font-body text-sm text-white leading-tight">{{ item.nombre }}</p>
              <p class="font-body text-xs text-white/40 font-mono">{{ item.codigo }}</p>
            </div>
            <div class="flex items-center gap-2 ml-4">
              <button @click="item.cantidad > 1 ? item.cantidad-- : carrito.splice(i,1)"
                class="w-7 h-7 rounded-full bg-white/10 text-white/60 hover:bg-white/20 flex items-center justify-center text-sm transition-colors">−</button>
              <span class="font-body text-white w-6 text-center">{{ item.cantidad }}</span>
              <button @click="item.cantidad++"
                class="w-7 h-7 rounded-full bg-white/10 text-white/60 hover:bg-white/20 flex items-center justify-center text-sm transition-colors">+</button>
              <span class="font-body text-teal text-sm font-bold w-20 text-right">
                ${{ (item.precio * item.cantidad).toLocaleString('es-AR') }}
              </span>
              <button @click="carrito.splice(i,1)" class="text-white/20 hover:text-red-400 transition-colors ml-1">✕</button>
            </div>
          </div>
        </div>

        <div v-if="carrito.length > 0" class="border-t border-white/10 pt-4">
          <div class="flex justify-between items-center mb-4">
            <span class="font-body text-white/60">Total</span>
            <span class="font-display text-2xl font-bold text-teal">
              ${{ totalCarrito.toLocaleString('es-AR') }}
            </span>
          </div>

          <button
            @click="abrirModalPago"
            :disabled="enviandoVenta"
            class="w-full py-4 bg-keto-orange text-white font-body font-semibold rounded-xl
                   hover:bg-keto-orange/80 transition-all duration-300 text-lg
                   disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ enviandoVenta ? 'Procesando...' : '✓ Confirmar venta' }}
          </button>

          <p v-if="ventaOk" class="text-teal text-sm text-center mt-3 font-body">{{ ventaOk }}</p>
          <p v-if="ventaErr" class="text-red-400 text-sm text-center mt-3 font-body">{{ ventaErr }}</p>
        </div>
      </div>
    </div>

    <!-- Modal método de pago -->
    <div v-if="modalPago" class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div class="bg-[#162421] border border-white/10 rounded-2xl p-8 w-full max-w-md">
        <h2 class="font-display text-xl font-bold text-white mb-2">Método de pago</h2>
        <p class="font-body text-white/50 text-sm mb-6">
          Total: <span class="text-teal font-bold text-lg">${{ totalCarrito.toLocaleString('es-AR') }}</span>
        </p>
        <div class="grid grid-cols-2 gap-3 mb-6">
          <button
            v-for="metodo in metodosPago"
            :key="metodo.value"
            @click="metodoPagoSeleccionado = metodo.value"
            class="flex flex-col items-center gap-2 p-4 rounded-xl border-2 font-body text-sm transition-all duration-200"
            :class="metodoPagoSeleccionado === metodo.value
              ? 'bg-teal border-teal text-white'
              : 'border-white/10 text-white/50 hover:border-teal/50 hover:text-white'"
          >
            <span class="text-2xl">{{ metodo.icon }}</span>
            {{ metodo.label }}
          </button>
        </div>
        <div class="flex gap-3">
          <button
            @click="modalPago = false"
            class="flex-1 py-3 rounded-xl border border-white/20 text-white/60 font-body text-sm hover:border-white/40 transition-colors"
          >Cancelar</button>
          <button
            @click="confirmarVenta"
            :disabled="!metodoPagoSeleccionado || enviandoVenta"
            class="flex-1 py-3 bg-keto-orange text-white font-body font-semibold rounded-xl
                   hover:bg-keto-orange/80 transition-all duration-200
                   disabled:opacity-40 disabled:cursor-not-allowed"
          >{{ enviandoVenta ? 'Procesando...' : 'Confirmar' }}</button>
        </div>
      </div>
    </div>

    <!-- Historial de ventas del día -->
    <div class="mt-8 bg-[#162421] border border-white/10 rounded-2xl p-6">
      <h2 class="font-display text-lg font-semibold text-white mb-5">Ventas del día</h2>
      <div v-if="historialVentas.length === 0" class="text-white/30 font-body text-sm">Sin ventas registradas hoy</div>
      <div v-else class="overflow-x-auto">
        <table class="w-full font-body text-sm">
          <thead>
            <tr class="text-white/40 border-b border-white/10">
              <th class="text-left pb-3 pr-4">#</th>
              <th class="text-left pb-3 pr-4">Hora</th>
              <th class="text-left pb-3 pr-4">Tipo</th>
              <th class="text-left pb-3 pr-4">Items</th>
              <th class="text-left pb-3 pr-4">Pago</th>
              <th class="text-right pb-3">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="v in historialVentas"
              :key="v.id"
              class="border-b border-white/5 text-white/70 hover:text-white transition-colors"
            >
              <td class="py-3 pr-4 text-white/30">#{{ v.id }}</td>
              <td class="py-3 pr-4">{{ formatHora(v.fecha) }}</td>
              <td class="py-3 pr-4">
                <span class="px-2 py-0.5 rounded-full text-xs"
                  :class="v.tipo === 'online' ? 'bg-purple-500/20 text-purple-300' : 'bg-teal/20 text-teal'">
                  {{ v.tipo }}
                </span>
              </td>
              <td class="py-3 pr-4">{{ v.items?.length || 0 }} item(s)</td>
              <td class="py-3 pr-4">
                <span v-if="v.metodo_pago" class="px-2 py-0.5 rounded-full text-xs bg-white/10 text-white/70">
                  {{ metodosPago.find(m => m.value === v.metodo_pago)?.label || v.metodo_pago }}
                </span>
                <span v-else class="text-white/20">—</span>
              </td>
              <td class="py-3 text-right font-bold text-teal">${{ parseFloat(v.total).toLocaleString('es-AR') }}</td>
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

const productos        = ref([])
const barcodeRaw       = ref('')
const barcodeError     = ref('')
const selectedId       = ref('')
const cantidadVenta    = ref(1)
const tipoVenta        = ref('local')
const carrito          = ref([])
const enviandoVenta    = ref(false)
const ventaOk          = ref('')
const ventaErr         = ref('')
const historialVentas       = ref([])
const barcodeInput          = ref(null)
const modalPago             = ref(false)
const metodoPagoSeleccionado = ref('')

const metodosPago = [
  { value: 'efectivo',      label: 'Efectivo',      icon: '💵' },
  { value: 'transferencia', label: 'Transferencia',  icon: '🏦' },
  { value: 'debito',        label: 'Débito',         icon: '💳' },
  { value: 'credito',       label: 'Crédito',        icon: '💳' },
  { value: 'qr',           label: 'QR',             icon: '📱' },
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

const totalCarrito = computed(() =>
  carrito.value.reduce((acc, i) => acc + i.precio * i.cantidad, 0)
)

function formatHora(fecha) {
  return new Date(fecha).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
}

async function buscarPorBarcode() {
  barcodeError.value = ''
  const codigo = barcodeRaw.value.replace(/\*/g, '').trim()
  if (!codigo) return
  try {
    const { data } = await axios.get(`/api/productos/barcode/${codigo}`)
    agregarAlCarrito(data, 1)
    barcodeRaw.value = ''
    barcodeInput.value?.focus()
  } catch {
    barcodeError.value = `Código "${codigo}" no encontrado`
    setTimeout(() => { barcodeError.value = '' }, 3000)
  }
}

function agregarDesdeSelector() {
  if (!selectedId.value) return
  const prod = productos.value.find(p => p.id === selectedId.value)
  if (!prod) return
  agregarAlCarrito(prod, cantidadVenta.value)
  selectedId.value   = ''
  cantidadVenta.value = 1
}

function agregarAlCarrito(prod, cant) {
  const existente = carrito.value.find(i => i.producto_id === prod.id)
  if (existente) {
    existente.cantidad += cant
  } else {
    carrito.value.push({
      producto_id: prod.id,
      nombre:      prod.nombre,
      codigo:      prod.codigo,
      precio:      parseFloat(prod.precio),
      cantidad:    cant,
    })
  }
}

function abrirModalPago() {
  if (!carrito.value.length) return
  metodoPagoSeleccionado.value = ''
  modalPago.value = true
}

async function confirmarVenta() {
  if (!carrito.value.length || !metodoPagoSeleccionado.value) return
  enviandoVenta.value = true
  ventaOk.value  = ''
  ventaErr.value = ''
  try {
    const token = localStorage.getItem('ceketo_token')
    const { data } = await axios.post('/api/ventas', {
      tipo:        tipoVenta.value,
      metodo_pago: metodoPagoSeleccionado.value,
      items: carrito.value.map(i => ({
        producto_id: i.producto_id,
        cantidad:    i.cantidad,
        precio_unit: i.precio,
      })),
    }, { headers: { Authorization: `Bearer ${token}` } })
    modalPago.value = false
    ventaOk.value = `✓ Venta #${data.venta_id} registrada — Total $${data.total.toLocaleString('es-AR')}`
    carrito.value = []
    cargarHistorial()
    cargarProductos()
    setTimeout(() => { ventaOk.value = '' }, 6000)
  } catch (err) {
    ventaErr.value = err.response?.data?.error || 'Error al registrar venta'
    setTimeout(() => { ventaErr.value = '' }, 5000)
  } finally {
    enviandoVenta.value = false
  }
}

async function cargarProductos() {
  const { data } = await axios.get('/api/productos?limit=500')
  productos.value = data
}

async function cargarHistorial() {
  try {
    const { data } = await axios.get('/api/ventas')
    const hoy = new Date().toDateString()
    historialVentas.value = data.filter(v => new Date(v.fecha).toDateString() === hoy).slice(0, 20)
  } catch { historialVentas.value = [] }
}

onMounted(async () => {
  await cargarProductos()
  await cargarHistorial()
})
</script>
