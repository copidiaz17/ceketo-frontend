<template>
  <main class="min-h-screen bg-transparent pt-28">
    <div class="max-w-5xl mx-auto px-6 py-10">

      <!-- Éxito -->
      <div v-if="pedidoConfirmado" class="text-center py-24">
        <div class="text-8xl mb-6">🎉</div>
        <h1 class="font-display text-4xl font-bold text-gray-900 mb-4">¡Pedido confirmado!</h1>
        <p class="font-body text-gray-600 text-lg mb-2">
          Tu pedido #{{ pedidoConfirmado }} fue recibido correctamente.
        </p>
        <p class="font-body text-gray-400 mb-10">
          Nos vamos a comunicar con vos por WhatsApp para coordinar la entrega.
        </p>
        <RouterLink to="/tienda" class="btn-primary inline-block">Seguir comprando</RouterLink>
      </div>

      <template v-else>
        <div class="mb-10">
          <h1 class="section-title mb-2">Finalizar compra</h1>
          <p class="section-subtitle">Completá tus datos para confirmar el pedido</p>
        </div>

        <div class="grid lg:grid-cols-3 gap-8">
          <!-- Formulario -->
          <div class="lg:col-span-2 space-y-5">

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
                    class="input-dark w-full" placeholder="+54 9 11 0000-0000" />
                  <p v-if="errores.telefono" class="text-red-400 text-xs mt-1">{{ errores.telefono }}</p>
                </div>
                <div class="sm:col-span-2">
                  <label class="block font-body text-sm text-gray-600 mb-2">Email (opcional)</label>
                  <input v-model="form.email" type="email"
                    class="input-dark w-full" placeholder="juan@email.com" />
                </div>
              </div>
            </div>

            <div class="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h2 class="font-display text-lg font-semibold text-gray-900 mb-5">Entrega</h2>
              <div class="grid sm:grid-cols-2 gap-4">
                <div class="sm:col-span-2">
                  <label class="block font-body text-sm text-gray-600 mb-2">Dirección</label>
                  <input v-model="form.direccion" type="text"
                    class="input-dark w-full" placeholder="Av. Corrientes 1234, Piso 3" />
                </div>
                <div>
                  <label class="block font-body text-sm text-gray-600 mb-2">Localidad</label>
                  <input v-model="form.localidad" type="text"
                    class="input-dark w-full" placeholder="Buenos Aires" />
                </div>
              </div>
            </div>

            <div class="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h2 class="font-display text-lg font-semibold text-gray-900 mb-5">Método de pago</h2>
              <div class="grid sm:grid-cols-3 gap-3">
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
                  <span class="text-brand-orange font-semibold">CBU:</span> 0000 0000 0000 0000 0000 — <span class="text-brand-orange font-semibold">Alias:</span> CEKETO.PAGO
                </p>
                <p class="font-body text-xs text-gray-400 mt-1">Envianos el comprobante por WhatsApp una vez realizada la transferencia.</p>
              </div>
            </div>

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
                class="w-full py-4 bg-brand-orange text-white font-body font-semibold rounded-xl text-lg
                       hover:bg-orange-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ enviando ? 'Procesando...' : 'Confirmar pedido' }}
              </button>

              <p class="font-body text-xs text-gray-400 text-center mt-3">
                Al confirmar aceptás nuestros términos y condiciones
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

const cartStore        = useCartStore()
const enviando         = ref(false)
const pedidoConfirmado = ref(null)
const errorGeneral     = ref('')

const form = reactive({
  nombre:      '',
  telefono:    '',
  email:       '',
  direccion:   '',
  localidad:   '',
  metodo_pago: 'transferencia',
  nota:        '',
})

const errores = reactive({ nombre: '', telefono: '' })

const metodosPago = [
  { val: 'transferencia', icon: '🏦', label: 'Transferencia' },
  { val: 'efectivo',      icon: '💵', label: 'Efectivo' },
  { val: 'mercadopago',   icon: '💳', label: 'MercadoPago' },
]

function validar() {
  errores.nombre   = form.nombre.trim()   ? '' : 'El nombre es requerido'
  errores.telefono = form.telefono.trim() ? '' : 'El teléfono es requerido'
  return !errores.nombre && !errores.telefono
}

async function confirmarPedido() {
  if (!validar()) return
  enviando.value   = true
  errorGeneral.value = ''
  try {
    const items = cartStore.items.map(i => ({
      producto_id: i.id,
      cantidad:    i.quantity,
      precio_unit: i.price,
    }))
    const { data } = await axios.post('/api/pedidos', { ...form, items })
    pedidoConfirmado.value = data.pedido_id
    cartStore.clearCart()
  } catch (err) {
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
