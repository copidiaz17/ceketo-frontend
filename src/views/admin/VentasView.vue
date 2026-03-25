<template>
  <div class="p-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="font-display text-3xl font-bold text-gray-900">Registrar Venta</h1>
      <p class="font-body text-gray-500 mt-1">Venta en el local mediante código de barras o selector</p>
    </div>

    <div class="grid lg:grid-cols-2 gap-8">
      <!-- Panel izquierdo: agregar producto -->
      <div class="space-y-4">

        <!-- Scanner de código de barras -->
        <div class="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 class="font-display text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span>🔫</span> Lector de código de barras
          </h2>
          <p class="font-body text-xs text-gray-400 mb-3">
            Hacé click en el campo y pasá el producto por el lector
          </p>
          <div class="flex gap-3">
            <input
              ref="barcodeInput"
              v-model="barcodeRaw"
              @input="onBarcodeInput"
              @keydown.enter.prevent="buscarPorBarcode"
              type="text"
              placeholder="*BYM-001*"
              class="flex-1 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 font-mono text-sm
                     focus:outline-none focus:border-teal transition-colors"
              autofocus
            />
            <button
              @click="buscarPorBarcode"
              class="px-5 py-3 bg-teal text-gray-900 rounded-xl font-body text-sm hover:bg-teal/80 transition-colors"
            >Buscar</button>
          </div>
          <p v-if="barcodeError" class="text-red-400 text-xs mt-2 font-body">{{ barcodeError }}</p>
        </div>

        <!-- Selector manual -->
        <div class="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 class="font-display text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
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
              <label class="block font-body text-xs text-gray-400 mb-1">Cantidad</label>
              <input
                v-model.number="cantidadVenta"
                type="number"
                min="1"
                class="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 font-body
                       focus:outline-none focus:border-teal transition-colors"
              />
            </div>
            <button
              @click="agregarDesdeSelector"
              :disabled="!selectedId"
              class="px-5 py-3 bg-teal/20 border border-teal text-teal rounded-xl font-body text-sm
                     hover:bg-teal hover:text-gray-900 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              + Agregar
            </button>
          </div>
        </div>

        <!-- Tipo de venta -->
        <div class="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 class="font-display text-base font-semibold text-gray-900 mb-3">Tipo de venta</h2>
          <div class="flex gap-3">
            <button
              @click="tipoVenta = 'local'"
              class="flex-1 py-2 rounded-xl font-body text-sm border-2 transition-all duration-200"
              :class="tipoVenta === 'local' ? 'bg-teal border-teal text-gray-900' : 'border-gray-200 text-gray-500 hover:border-teal/50'"
            >Local</button>
            <button
              @click="tipoVenta = 'online'"
              class="flex-1 py-2 rounded-xl font-body text-sm border-2 transition-all duration-200"
              :class="tipoVenta === 'online' ? 'bg-teal border-teal text-gray-900' : 'border-gray-200 text-gray-500 hover:border-teal/50'"
            >Online</button>
          </div>
        </div>
      </div>

      <!-- Panel derecho: carrito de venta -->
      <div class="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col">
        <h2 class="font-display text-lg font-semibold text-gray-900 mb-5">Ticket de venta</h2>

        <div v-if="carrito.length === 0" class="flex-1 flex items-center justify-center text-gray-400 font-body text-sm">
          Sin productos en la venta
        </div>

        <div v-else class="flex-1 space-y-3 overflow-y-auto pr-1 max-h-80 mb-6">
          <div
            v-for="(item, i) in carrito"
            :key="i"
            class="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3"
          >
            <div class="flex-1">
              <p class="font-body text-sm text-gray-900 leading-tight">{{ item.nombre }}</p>
              <p class="font-body text-xs text-gray-400 font-mono">{{ item.codigo }}</p>
            </div>
            <div class="flex items-center gap-2 ml-4">
              <button @click="item.cantidad > 1 ? item.cantidad-- : carrito.splice(i,1)"
                class="w-7 h-7 rounded-full bg-gray-100 text-gray-500 hover:bg-white/20 flex items-center justify-center text-sm transition-colors">−</button>
              <span class="font-body text-gray-900 w-6 text-center">{{ item.cantidad }}</span>
              <button @click="item.cantidad++"
                class="w-7 h-7 rounded-full bg-gray-100 text-gray-500 hover:bg-white/20 flex items-center justify-center text-sm transition-colors">+</button>
              <span class="font-body text-teal text-sm font-bold w-20 text-right">
                ${{ (item.precio * item.cantidad).toLocaleString('es-AR') }}
              </span>
              <button @click="carrito.splice(i,1)" class="text-gray-300 hover:text-red-400 transition-colors ml-1">✕</button>
            </div>
          </div>
        </div>

        <div v-if="carrito.length > 0" class="border-t border-gray-200 pt-4">
          <div class="flex justify-between items-center mb-4">
            <span class="font-body text-gray-500">Total</span>
            <span class="font-display text-2xl font-bold text-teal">
              ${{ totalCarrito.toLocaleString('es-AR') }}
            </span>
          </div>

          <button
            @click="abrirModalPago"
            :disabled="enviandoVenta"
            class="w-full py-4 bg-keto-orange text-gray-800 font-body font-semibold rounded-xl
                   hover:bg-keto-orange/80 transition-all duration-300 text-lg
                   disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ enviandoVenta ? 'Procesando...' : '✓ Confirmar venta' }}
          </button>

          <p v-if="ventaOk" class="text-teal text-sm text-center mt-3 font-body">{{ ventaOk }}</p>
          <p v-if="ventaErr" class="text-red-400 text-sm text-center mt-3 font-body">{{ ventaErr }}</p>
          <button
            v-if="ultimaVenta && ventaOk"
            @click="imprimirTicket"
            class="w-full mt-2 py-2 border border-gray-200 text-gray-600 font-body text-sm rounded-xl
                   hover:border-gray-400 hover:text-gray-900 transition-colors"
          >🖨️ Imprimir ticket</button>
        </div>
      </div>
    </div>

    <!-- Modal método de pago -->
    <div v-if="modalPago" class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div class="bg-white border border-gray-200 rounded-2xl p-8 w-full max-w-md">
        <h2 class="font-display text-xl font-bold text-gray-900 mb-6">Método de pago</h2>

        <div class="grid grid-cols-2 gap-3 mb-6">
          <button
            v-for="metodo in metodosPago"
            :key="metodo.value"
            @click="metodoPagoSeleccionado = metodo.value"
            class="flex flex-col items-center gap-2 p-4 rounded-xl border-2 font-body text-sm transition-all duration-200"
            :class="metodoPagoSeleccionado === metodo.value
              ? 'bg-teal border-teal text-gray-900'
              : 'border-gray-200 text-gray-500 hover:border-teal/50 hover:text-gray-900'"
          >
            <span class="text-2xl">{{ metodo.icon }}</span>
            {{ metodo.label }}
          </button>
        </div>

        <!-- Descuento -->
        <div class="mb-4">
          <label class="block font-body text-sm text-gray-500 mb-2">Descuento (%)</label>
          <input
            v-model.number="descuentoPct"
            type="number"
            min="0"
            max="100"
            placeholder="0"
            class="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 font-body
                   focus:outline-none focus:border-teal transition-colors"
          />
        </div>

        <!-- Resumen de montos -->
        <div class="bg-gray-50 rounded-xl px-4 py-3 mb-6 space-y-2">
          <div class="flex justify-between font-body text-sm text-gray-500">
            <span>Subtotal</span>
            <span>${{ totalCarrito.toLocaleString('es-AR') }}</span>
          </div>
          <div v-if="descuentoPct > 0" class="flex justify-between font-body text-sm text-red-400">
            <span>Descuento ({{ descuentoPct }}%)</span>
            <span>− ${{ montoDescuento.toLocaleString('es-AR') }}</span>
          </div>
          <div class="flex justify-between font-body font-bold text-gray-900 border-t border-gray-200 pt-2">
            <span>Total a cobrar</span>
            <span class="text-teal text-lg">${{ totalFinal.toLocaleString('es-AR') }}</span>
          </div>
        </div>

        <div class="flex gap-3">
          <button
            @click="modalPago = false"
            class="flex-1 py-3 rounded-xl border border-gray-200 text-gray-500 font-body text-sm hover:border-gray-400 transition-colors"
          >Cancelar</button>
          <button
            @click="confirmarVenta"
            :disabled="!metodoPagoSeleccionado || enviandoVenta"
            class="flex-1 py-3 bg-keto-orange text-gray-800 font-body font-semibold rounded-xl
                   hover:bg-keto-orange/80 transition-all duration-200
                   disabled:opacity-40 disabled:cursor-not-allowed"
          >{{ enviandoVenta ? 'Procesando...' : 'Confirmar' }}</button>
        </div>
      </div>
    </div>

    <!-- Historial de ventas del día -->
    <div class="mt-8 bg-white border border-gray-200 rounded-2xl p-6">
      <h2 class="font-display text-lg font-semibold text-gray-900 mb-5">Ventas del día</h2>
      <div v-if="historialVentas.length === 0" class="text-gray-400 font-body text-sm">Sin ventas registradas hoy</div>
      <div v-else class="overflow-x-auto">
        <table class="w-full font-body text-sm">
          <thead>
            <tr class="text-gray-400 border-b border-gray-200">
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
              class="border-b border-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <td class="py-3 pr-4 text-gray-400">#{{ v.id }}</td>
              <td class="py-3 pr-4">{{ formatHora(v.fecha) }}</td>
              <td class="py-3 pr-4">
                <span class="px-2 py-0.5 rounded-full text-xs"
                  :class="v.tipo === 'online' ? 'bg-purple-500/20 text-purple-300' : 'bg-teal/20 text-teal'">
                  {{ v.tipo }}
                </span>
              </td>
              <td class="py-3 pr-4">{{ v.items?.length || 0 }} item(s)</td>
              <td class="py-3 pr-4">
                <span v-if="v.metodo_pago" class="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">
                  {{ metodosPago.find(m => m.value === v.metodo_pago)?.label || v.metodo_pago }}
                </span>
                <span v-else class="text-gray-300">—</span>
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
const barcodeTimer          = ref(null)
const modalPago             = ref(false)
const ultimaVenta           = ref(null)
const metodoPagoSeleccionado = ref('')
const descuentoPct           = ref(0)

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

const montoDescuento = computed(() =>
  Math.round(totalCarrito.value * (descuentoPct.value || 0) / 100)
)

const totalFinal = computed(() =>
  totalCarrito.value - montoDescuento.value
)

function formatHora(fecha) {
  return new Date(fecha).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
}

function onBarcodeInput() {
  clearTimeout(barcodeTimer.value)
  if (!barcodeRaw.value.trim()) return
  barcodeTimer.value = setTimeout(() => {
    buscarPorBarcode()
  }, 300)
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
      categoria:   prod.categoria?.nombre || 'Otros',
    })
  }
}

function abrirModalPago() {
  if (!carrito.value.length) return
  metodoPagoSeleccionado.value = ''
  descuentoPct.value = 0
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
      descuento:   descuentoPct.value || 0,
      items: carrito.value.map(i => ({
        producto_id: i.producto_id,
        cantidad:    i.cantidad,
        precio_unit: i.precio,
      })),
    }, { headers: { Authorization: `Bearer ${token}` } })
    ultimaVenta.value = {
      id:          data.venta_id,
      items:       [...carrito.value],
      total:       data.total,
      descuento:   descuentoPct.value,
      metodo_pago: metodoPagoSeleccionado.value,
      fecha:       new Date(),
    }
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

function imprimirTicket() {
  const v = ultimaVenta.value
  if (!v) return

  const metodoLabel = metodosPago.find(m => m.value === v.metodo_pago)?.label || v.metodo_pago
  const fecha = v.fecha.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' })
  const hora  = v.fecha.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })

  // Agrupar items por categoría
  const grupos = {}
  for (const item of v.items) {
    const cat = item.categoria || 'Otros'
    if (!grupos[cat]) grupos[cat] = []
    grupos[cat].push(item)
  }

  const subtotalOriginal = v.items.reduce((acc, i) => acc + i.precio * i.cantidad, 0)

  let itemsHtml = ''
  for (const [cat, items] of Object.entries(grupos)) {
    itemsHtml += `<tr><td colspan="2" class="cat">${cat.toUpperCase()}</td></tr>`
    for (const item of items) {
      const subtotal = item.precio * item.cantidad
      itemsHtml += `
        <tr>
          <td class="prod-nombre">${item.nombre}</td>
          <td class="prod-precio">$${subtotal.toLocaleString('es-AR')}</td>
        </tr>
        <tr>
          <td class="prod-detalle">${item.cantidad}x $${item.precio.toLocaleString('es-AR')}</td>
          <td></td>
        </tr>`
    }
  }

  const descuentoHtml = v.descuento > 0 ? `
    <tr class="descuento-row">
      <td>Descuento (${v.descuento}%)</td>
      <td>- $${(subtotalOriginal * v.descuento / 100).toLocaleString('es-AR')}</td>
    </tr>` : ''

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Courier New', monospace;
    font-size: 10px;
    width: 48mm;
    padding: 2mm 1mm;
    color: #000;
  }
  .header { text-align: center; margin-bottom: 6px; }
  .header .nombre { font-size: 16px; font-weight: bold; letter-spacing: 1px; }
  .header .dir { font-size: 10px; margin-top: 2px; }
  .divider { border-top: 1px dashed #000; margin: 5px 0; }
  .info { font-size: 10px; margin-bottom: 2px; }
  .info span { font-weight: bold; }
  table { width: 100%; border-collapse: collapse; margin-top: 4px; }
  td { padding: 1px 0; vertical-align: top; }
  .cat { font-weight: bold; font-size: 10px; padding-top: 6px; padding-bottom: 2px; text-decoration: underline; }
  .prod-nombre { font-size: 10px; width: 65%; }
  .prod-precio { text-align: right; font-size: 10px; font-weight: bold; }
  .prod-detalle { font-size: 9px; color: #444; padding-left: 4px; }
  .descuento-row td { font-size: 10px; }
  .descuento-row td:last-child { text-align: right; }
  .total-row td { font-size: 13px; font-weight: bold; padding-top: 4px; }
  .total-row td:last-child { text-align: right; }
  .footer { text-align: center; font-size: 10px; margin-top: 8px; }
  @media print {
    body { width: 48mm; }
    @page { margin: 0; size: 58mm auto; }
  }
</style>
</head>
<body>
  <div class="header">
    <div class="nombre">CEKETO</div>
    <div class="dir">Independencia 663, Santiago del Estero</div>
    <div class="dir">Santiago del Estero, Argentina</div>
  </div>
  <div class="divider"></div>
  <div class="info">Pedido #${v.id}</div>
  <div class="info">Fecha: ${fecha} - ${hora} hs</div>
  <div class="info">Forma de pago: <span>${metodoLabel}</span></div>
  <div class="divider"></div>
  <table>
    ${itemsHtml}
    <tr><td colspan="2"><div class="divider"></div></td></tr>
    ${descuentoHtml}
    <tr class="total-row">
      <td>TOTAL</td>
      <td>$${Number(v.total).toLocaleString('es-AR')}</td>
    </tr>
  </table>
  <div class="divider"></div>
  <div class="footer">¡Gracias por tu compra!</div>
</body>
</html>`

  const win = window.open('', '_blank', 'width=350,height=600')
  win.document.write(html)
  win.document.close()
  win.focus()
  setTimeout(() => { win.print(); win.close() }, 400)
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
