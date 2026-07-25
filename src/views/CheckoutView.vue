<template>
  <main class="min-h-screen bg-transparent pt-28">
    <div class="max-w-5xl mx-auto px-6 py-10">

      <!-- Éxito -->
      <div v-if="pedidoConfirmado" class="text-center py-20">
        <div class="text-8xl mb-6">🎉</div>
        <h1 class="font-display text-4xl font-bold text-gray-900 mb-4">¡Pedido enviado!</h1>
        <p class="font-body text-gray-600 text-lg mb-2">
          Tu pedido #{{ pedidoConfirmado }} quedó registrado.
        </p>
        <p class="font-body text-gray-400 mb-8 max-w-md mx-auto">
          Terminá de enviarlo por WhatsApp para que Ceketo lo confirme. Si no se abrió solo, tocá el botón:
        </p>
        <a
          :href="waUrl"
          target="_blank"
          rel="noopener"
          class="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#25D366] text-white font-body font-semibold rounded-xl text-lg hover:brightness-95 transition-all duration-300 mb-6"
        >
          💬 Enviar pedido por WhatsApp
        </a>
        <div>
          <RouterLink to="/tienda" class="font-body text-sm text-gray-400 hover:text-gray-600 transition-colors">
            Seguir comprando
          </RouterLink>
        </div>
      </div>

      <template v-else>
        <div class="mb-10">
          <h1 class="section-title mb-2">Finalizar compra</h1>
          <p class="section-subtitle">Completá tus datos y enviá el pedido por WhatsApp</p>
        </div>

        <div class="grid lg:grid-cols-3 gap-8">
          <!-- Formulario -->
          <div class="lg:col-span-2 space-y-5">

            <!-- Datos de contacto -->
            <div class="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h2 class="font-display text-lg font-semibold text-gray-900 mb-5">Datos de contacto</h2>
              <div class="grid sm:grid-cols-2 gap-4">
                <div>
                  <label class="block font-body text-sm text-gray-600 mb-2">Nombre completo *</label>
                  <input v-model="form.nombre" type="text" required
                    class="input-dark w-full" placeholder="Juan García" />
                  <p v-if="errores.nombre" class="text-red-400 text-xs mt-1">{{ errores.nombre }}</p>
                </div>
                <div>
                  <label class="block font-body text-sm text-gray-600 mb-2">WhatsApp *</label>
                  <input v-model="form.telefono" type="tel" required
                    class="input-dark w-full" placeholder="385 412 3456" />
                  <p class="font-body text-xs text-gray-400 mt-1">Con característica, sin el 0 ni el 15. Ej: 385 412 3456</p>
                  <p v-if="errores.telefono" class="text-red-400 text-xs mt-1">{{ errores.telefono }}</p>
                </div>
                <div class="sm:col-span-2">
                  <label class="block font-body text-sm text-gray-600 mb-2">Email (opcional)</label>
                  <input v-model="form.email" type="email"
                    class="input-dark w-full" placeholder="juan@email.com" />
                </div>
              </div>
            </div>

            <!-- Entrega: envío o retiro -->
            <div class="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h2 class="font-display text-lg font-semibold text-gray-900 mb-5">¿Cómo lo recibís?</h2>
              <div class="grid sm:grid-cols-2 gap-3">
                <button
                  v-for="te in tiposEntrega"
                  :key="te.val"
                  type="button"
                  @click="form.tipo_entrega = te.val"
                  class="p-4 rounded-xl border-2 text-center transition-all duration-200 font-body text-sm"
                  :class="form.tipo_entrega === te.val
                    ? 'border-brand-orange bg-brand-orange/10 text-brand-orange'
                    : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300'"
                >
                  <span class="text-2xl block mb-1">{{ te.icon }}</span>
                  {{ te.label }}
                </button>
              </div>

              <!-- Retiro en el local -->
              <div v-if="form.tipo_entrega === 'retiro'" class="mt-4 p-4 bg-brand-green/5 border border-brand-green/20 rounded-xl">
                <p class="font-body text-sm text-gray-700">
                  📍 Retirás tu pedido en <span class="font-semibold">Independencia 663</span>, Santiago del Estero.
                </p>
              </div>

              <!-- Envío a domicilio -->
              <div v-else class="mt-4 grid sm:grid-cols-2 gap-4">
                <div class="sm:col-span-2">
                  <label class="block font-body text-sm text-gray-600 mb-2">Dirección *</label>
                  <input v-model="form.direccion" type="text"
                    class="input-dark w-full" placeholder="Av. Belgrano 1234" />
                  <p v-if="errores.direccion" class="text-red-400 text-xs mt-1">{{ errores.direccion }}</p>
                </div>
                <div class="sm:col-span-2">
                  <label class="block font-body text-sm text-gray-600 mb-2">Barrio / Localidad</label>
                  <input v-model="form.localidad" type="text"
                    class="input-dark w-full" placeholder="Centro" />
                </div>
                <p class="sm:col-span-2 font-body text-xs text-gray-400">
                  El costo de envío lo coordinás con Ceketo por WhatsApp.
                </p>
              </div>
            </div>

            <!-- Método de pago -->
            <div class="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h2 class="font-display text-lg font-semibold text-gray-900 mb-5">Método de pago</h2>
              <div class="grid sm:grid-cols-2 gap-3">
                <button
                  v-for="mp in metodosPago"
                  :key="mp.val"
                  type="button"
                  @click="form.metodo_pago = mp.val"
                  class="p-4 rounded-xl border-2 text-center transition-all duration-200 font-body text-sm"
                  :class="form.metodo_pago === mp.val
                    ? 'border-brand-orange bg-brand-orange/10 text-brand-orange'
                    : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300'"
                >
                  <span class="text-2xl block mb-1">{{ mp.icon }}</span>
                  {{ mp.label }}
                </button>
              </div>
              <div v-if="form.metodo_pago === 'transferencia'" class="mt-4 p-4 bg-brand-orange/10 border border-brand-orange/20 rounded-xl">
                <p class="font-body text-sm text-gray-700">
                  <span class="text-brand-orange font-semibold">Alias:</span> ceketo11
                </p>
                <p class="font-body text-xs text-gray-400 mt-1">Enviá el comprobante por WhatsApp una vez realizada la transferencia.</p>
              </div>
            </div>

            <!-- Nota -->
            <div class="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <label class="block font-body text-sm text-gray-600 mb-2">Nota para el pedido (opcional)</label>
              <textarea v-model="form.nota" rows="3" placeholder="Ej: Sin maní, entregar en portería..."
                class="input-dark w-full resize-none"></textarea>
            </div>
          </div>

          <!-- Resumen del pedido -->
          <div class="lg:col-span-1">
            <div class="bg-white border border-gray-100 rounded-2xl p-6 sticky top-28 shadow-sm">
              <h2 class="font-display text-lg font-semibold text-gray-900 mb-5">Tu pedido</h2>

              <div class="space-y-3 mb-5 max-h-72 overflow-y-auto">
                <div
                  v-for="item in cartStore.items"
                  :key="item.id"
                  class="flex justify-between items-start gap-2"
                >
                  <div class="flex-1">
                    <p class="font-body text-sm text-gray-800 leading-tight">{{ item.name }}</p>
                    <p class="font-body text-xs text-gray-400">×{{ item.quantity }}</p>
                  </div>
                  <span class="font-body text-sm text-gray-600 flex-shrink-0">
                    ${{ (item.price * item.quantity).toLocaleString('es-AR') }}
                  </span>
                </div>
              </div>

              <div class="border-t border-gray-200 pt-4 mb-5">
                <div class="flex justify-between items-center">
                  <span class="font-body text-gray-500">Total</span>
                  <span class="font-display text-2xl font-bold text-brand-orange">
                    ${{ cartStore.totalPrice.toLocaleString('es-AR') }}
                  </span>
                </div>
              </div>

              <p v-if="errorGeneral" class="text-red-400 text-sm font-body mb-3">{{ errorGeneral }}</p>

              <button
                @click="confirmarPedido"
                :disabled="enviando || cartStore.items.length === 0"
                class="w-full flex items-center justify-center gap-2 py-4 bg-[#25D366] text-white font-body font-semibold rounded-xl text-lg
                       hover:brightness-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="!enviando">💬</span>
                {{ enviando ? 'Procesando...' : 'Enviar pedido por WhatsApp' }}
              </button>

              <p class="font-body text-xs text-gray-400 text-center mt-3">
                Se abre WhatsApp con tu pedido listo para enviar a Ceketo.
              </p>
            </div>
          </div>
        </div>
      </template>
    </div>
  </main>
</template>

<script setup>
import { ref, reactive } from 'vue'
import axios from 'axios'
import { useCartStore } from '@/stores/cart'

const WHATSAPP_CEKETO = '543854133969'

const cartStore        = useCartStore()
const enviando         = ref(false)
const pedidoConfirmado = ref(null)
const waUrl            = ref('')
const errorGeneral     = ref('')

const form = reactive({
  nombre:       '',
  telefono:     '',
  email:        '',
  tipo_entrega: 'retiro',
  direccion:    '',
  localidad:    '',
  metodo_pago:  'transferencia',
  nota:         '',
})

const errores = reactive({ nombre: '', telefono: '', direccion: '' })

const tiposEntrega = [
  { val: 'retiro', icon: '🏪', label: 'Retiro en el local' },
  { val: 'envio',  icon: '🛵', label: 'Envío a domicilio' },
]

const metodosPago = [
  { val: 'transferencia', icon: '🏦', label: 'Transferencia' },
  { val: 'efectivo',      icon: '💵', label: 'Efectivo' },
]

function validar() {
  errores.nombre    = form.nombre.trim()   ? '' : 'El nombre es requerido'
  errores.telefono  = form.telefono.trim() ? '' : 'El teléfono es requerido'
  errores.direccion = (form.tipo_entrega === 'envio' && !form.direccion.trim())
    ? 'La dirección es requerida para el envío' : ''
  return !errores.nombre && !errores.telefono && !errores.direccion
}

function construirMensaje() {
  const lineas = cartStore.items
    .map(i => `• ${i.quantity}x ${i.name} — $${(i.price * i.quantity).toLocaleString('es-AR')}`)
    .join('\n')

  const entrega = form.tipo_entrega === 'retiro'
    ? 'Retiro en el local (Independencia 663)'
    : `Envío a domicilio — ${form.direccion}${form.localidad ? ', ' + form.localidad : ''}`

  const pago = form.metodo_pago === 'transferencia'
    ? 'Transferencia (alias: ceketo11)'
    : 'Efectivo'

  const partes = [
    '¡Hola Ceketo! 🥑 Te paso mi pedido:',
    '',
    '🛒 *PEDIDO*',
    lineas,
    '',
    `💰 *Total: $${cartStore.totalPrice.toLocaleString('es-AR')}*`,
    '',
    `👤 *Nombre:* ${form.nombre}`,
    `📱 *Tel:* ${form.telefono}`,
    `💳 *Pago:* ${pago}`,
    `📦 *Entrega:* ${entrega}`,
  ]
  if (form.nota.trim()) partes.push(`📝 *Nota:* ${form.nota.trim()}`)
  partes.push('', '¡Quedo a la espera de la confirmación! 🙌')

  return partes.join('\n')
}

async function confirmarPedido() {
  if (!validar()) return
  enviando.value     = true
  errorGeneral.value = ''

  // Reservamos la ventana dentro del gesto del usuario (evita el bloqueo de popups)
  const waWin = window.open('about:blank', '_blank')

  try {
    const items = cartStore.items.map(i => ({
      producto_id: i.id,
      cantidad:    i.quantity,
      precio_unit: i.price,
    }))
    const payload = {
      nombre:       form.nombre,
      telefono:     form.telefono,
      email:        form.email,
      tipo_entrega: form.tipo_entrega,
      direccion:    form.tipo_entrega === 'envio' ? form.direccion : '',
      localidad:    form.tipo_entrega === 'envio' ? form.localidad : 'Retiro en el local',
      metodo_pago:  form.metodo_pago,
      nota:         form.nota,
      items,
    }
    const { data } = await axios.post('/api/pedidos', payload)

    const url = `https://wa.me/${WHATSAPP_CEKETO}?text=${encodeURIComponent(construirMensaje())}`
    waUrl.value = url
    if (waWin) waWin.location.href = url
    else window.location.href = url   // fallback si el popup fue bloqueado

    pedidoConfirmado.value = data.pedido_id
    cartStore.clearCart()
  } catch (err) {
    if (waWin) waWin.close()
    errorGeneral.value = err.response?.data?.error || 'Error al procesar el pedido'
  } finally {
    enviando.value = false
  }
}
</script>

<style scoped>
.input-dark {
  @apply px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 font-body text-sm
         focus:outline-none focus:border-brand-orange transition-colors placeholder-gray-400;
}
</style>
