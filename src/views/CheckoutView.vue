<template>
  <main class="min-h-screen bg-ck-crema pt-28">
    <div class="max-w-5xl mx-auto px-6 py-10">

      <!-- Éxito -->
      <div v-if="pedidoConfirmado" class="text-center py-20">
        <!-- El pedido se confirma recién cuando a Ceketo le llega el WhatsApp (no antes) -->
        <div class="text-8xl mb-6">📲</div>
        <h1 class="font-marca text-4xl font-bold text-ck-tinta mb-4">¡Último paso!</h1>
        <p class="font-texto text-gray-600 text-lg mb-2 max-w-md mx-auto">
          Enviá el mensaje de WhatsApp para confirmar tu pedido #{{ pedidoConfirmado }}.
        </p>
        <p class="font-texto text-gray-400 mb-4 max-w-md mx-auto">
          Ceketo lo recibe y lo prepara cuando le llega tu mensaje. Si WhatsApp no se abrió solo, tocá el botón:
        </p>
        <!-- Encargo: cómo pagar la seña -->
        <div v-if="encargoConfirmado" class="max-w-md mx-auto mb-8 p-4 rounded-2xl bg-ck-violeta-suave text-left font-texto text-sm text-ck-tinta/80">
          🎂 Encargo para el <b class="text-ck-tinta">{{ fechaLarga(encargoConfirmado.fecha) }}</b>.
          <template v-if="encargoConfirmado.metodo === 'transferencia'">
            Para reservarlo, transferí la seña de <b class="text-ck-tinta">${{ encargoConfirmado.sena.toLocaleString('es-AR') }}</b>
            al alias <b class="text-ck-tinta">ceketo11</b> y mandá el comprobante por WhatsApp.
          </template>
          <template v-else>
            Para reservarlo, acercate al local (Independencia 663) a pagar la seña de
            <b class="text-ck-tinta">${{ encargoConfirmado.sena.toLocaleString('es-AR') }}</b> en efectivo.
          </template>
          El resto (<b class="text-ck-tinta">${{ encargoConfirmado.saldo.toLocaleString('es-AR') }}</b>) se paga al retirar.
        </div>
        <a
          :href="waUrl"
          target="_blank"
          rel="noopener"
          class="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#25D366] text-white font-texto font-semibold rounded-xl text-lg hover:brightness-95 transition-all duration-300 mb-6"
        >
          💬 Enviar pedido por WhatsApp
        </a>
        <div>
          <RouterLink to="/tienda" class="font-texto text-sm text-gray-400 hover:text-gray-600 transition-colors">
            Seguir comprando
          </RouterLink>
        </div>
      </div>

      <template v-else>
        <div class="mb-10">
          <h1 class="ck-titulo mb-2">Finalizar compra</h1>
          <p class="font-texto text-ck-tinta/60 text-lg">Completá tus datos y enviá el pedido por WhatsApp</p>
        </div>

        <!-- Carrito mixto: los postres a pedido van en un pedido aparte -->
        <div v-if="esMixto" class="mb-8 p-5 rounded-2xl bg-ck-violeta-suave shadow-[inset_0_0_0_2px_rgba(136,87,132,.25)]">
          <p class="font-texto text-[15px] text-ck-tinta/80 mb-4">
            <b class="text-ck-tinta">🎂 Los postres a pedido se encargan aparte</b> (con fecha de entrega y seña).
            Tu carrito tiene postres y otros productos: hacemos dos pedidos. ¿Cuál finalizás ahora?
            El otro queda en el carrito.
          </p>
          <div class="flex flex-col sm:flex-row gap-3">
            <button type="button" class="ck-btn" :class="grupo === 'apedido' ? 'bg-ck-violeta text-white' : 'bg-ck-blanco text-ck-tinta shadow-[inset_0_0_0_2px_rgba(136,87,132,.35)]'" @click="grupo = 'apedido'">
              🎂 Encargo de postres ({{ itemsAPedido.length }})
            </button>
            <button type="button" class="ck-btn" :class="grupo === 'resto' ? 'bg-ck-verde-t text-white' : 'bg-ck-blanco text-ck-tinta shadow-[inset_0_0_0_2px_rgba(4,119,100,.3)]'" @click="grupo = 'resto'">
              🛒 Resto de los productos ({{ itemsResto.length }})
            </button>
          </div>
        </div>

        <div class="grid lg:grid-cols-3 gap-8">
          <!-- Formulario -->
          <div class="lg:col-span-2 space-y-5">

            <!-- Encargo: día de entrega (calendario) -->
            <div v-if="esEncargo" class="bg-ck-blanco border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h2 class="font-marca text-lg font-semibold text-ck-tinta mb-1">¿Para qué día lo querés?</h2>
              <p class="font-texto text-sm text-gray-500 mb-5">Los postres se hacen a pedido: se encargan con {{ DIAS_ANTICIPACION }} días de anticipación como mínimo.</p>
              <CalendarioEncargo v-model="form.fecha_entrega" :min="fechaMin" />
              <p v-if="form.fecha_entrega" class="font-texto text-sm text-ck-violeta font-semibold mt-3">
                📅 Entrega: {{ fechaLarga(form.fecha_entrega) }}
              </p>
              <p v-if="errores.fecha_entrega" class="text-red-400 text-xs mt-2">{{ errores.fecha_entrega }}</p>
            </div>

            <!-- Datos de contacto -->
            <div class="bg-ck-blanco border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h2 class="font-marca text-lg font-semibold text-ck-tinta mb-5">Datos de contacto</h2>
              <div class="grid sm:grid-cols-2 gap-4">
                <div>
                  <label class="block font-texto text-sm text-gray-600 mb-2">Nombre completo *</label>
                  <input v-model="form.nombre" type="text" required
                    class="input-dark w-full" placeholder="Juan García" />
                  <p v-if="errores.nombre" class="text-red-400 text-xs mt-1">{{ errores.nombre }}</p>
                </div>
                <div>
                  <label class="block font-texto text-sm text-gray-600 mb-2">WhatsApp *</label>
                  <input v-model="form.telefono" type="tel" required
                    class="input-dark w-full" placeholder="385 412 3456" />
                  <p class="font-texto text-xs text-gray-400 mt-1">Con característica, sin el 0 ni el 15. Ej: 385 412 3456</p>
                  <p v-if="errores.telefono" class="text-red-400 text-xs mt-1">{{ errores.telefono }}</p>
                </div>
                <div class="sm:col-span-2">
                  <label class="block font-texto text-sm text-gray-600 mb-2">Email *</label>
                  <input v-model="form.email" type="email" required
                    class="input-dark w-full" placeholder="juan@email.com" />
                  <p v-if="errores.email" class="text-red-400 text-xs mt-1">{{ errores.email }}</p>
                </div>
              </div>
            </div>

            <!-- Entrega: envío o retiro -->
            <div class="bg-ck-blanco border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h2 class="font-marca text-lg font-semibold text-ck-tinta mb-5">¿Cómo lo recibís?</h2>
              <div class="grid sm:grid-cols-2 gap-3">
                <button
                  v-for="te in tiposEntrega"
                  :key="te.val"
                  type="button"
                  @click="form.tipo_entrega = te.val"
                  class="p-4 rounded-xl border-2 text-center transition-all duration-200 font-texto text-sm"
                  :class="form.tipo_entrega === te.val
                    ? 'border-brand-orange bg-brand-orange/10 text-ck-naranja-t'
                    : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300'"
                >
                  <span class="text-2xl block mb-1">{{ te.icon }}</span>
                  {{ te.label }}
                </button>
              </div>
              <p v-if="errores.tipo_entrega" class="text-red-400 text-xs mt-2">{{ errores.tipo_entrega }}</p>

              <!-- Retiro en el local -->
              <div v-if="form.tipo_entrega === 'retiro'" class="mt-4 p-4 bg-brand-green/5 border border-brand-green/20 rounded-xl">
                <p class="font-texto text-sm text-gray-700">
                  📍 Retirás tu pedido en <span class="font-semibold">Independencia 663</span>, Santiago del Estero.
                </p>
              </div>

              <!-- Envío a domicilio -->
              <div v-else-if="form.tipo_entrega === 'envio'" class="mt-4 grid sm:grid-cols-2 gap-4">
                <div class="sm:col-span-2">
                  <label class="block font-texto text-sm text-gray-600 mb-2">Dirección *</label>
                  <input v-model="form.direccion" type="text"
                    class="input-dark w-full" placeholder="Av. Belgrano 1234" />
                  <p v-if="errores.direccion" class="text-red-400 text-xs mt-1">{{ errores.direccion }}</p>
                </div>
                <div class="sm:col-span-2">
                  <label class="block font-texto text-sm text-gray-600 mb-2">Barrio / Localidad *</label>
                  <input v-model="form.localidad" type="text"
                    class="input-dark w-full" placeholder="Centro" />
                  <p v-if="errores.localidad" class="text-red-400 text-xs mt-1">{{ errores.localidad }}</p>
                </div>
                <p class="sm:col-span-2 font-texto text-xs text-gray-400">
                  El costo de envío lo coordinás con Ceketo por WhatsApp.
                </p>
              </div>
            </div>

            <!-- Método de pago -->
            <div class="bg-ck-blanco border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h2 class="font-marca text-lg font-semibold text-ck-tinta mb-1">{{ esEncargo ? 'Seña para reservar' : 'Método de pago' }}</h2>
              <template v-if="esEncargo">
                <p class="font-texto text-sm text-gray-500 mb-4">
                  El encargo se reserva con una seña de al menos el {{ SENA_MINIMA * 100 }}%. El resto se paga al retirar.
                </p>
                <div class="flex flex-wrap items-center gap-2 mb-2">
                  <button type="button" class="px-4 py-2 rounded-xl border-2 font-texto text-sm transition-all"
                    :class="form.sena === senaMinima ? 'border-ck-violeta bg-ck-violeta-suave text-ck-violeta font-semibold' : 'border-gray-200 bg-gray-50 text-gray-500'"
                    @click="form.sena = senaMinima">{{ SENA_MINIMA * 100 }}% · ${{ senaMinima.toLocaleString('es-AR') }}</button>
                  <button type="button" class="px-4 py-2 rounded-xl border-2 font-texto text-sm transition-all"
                    :class="form.sena === totalPedido ? 'border-ck-violeta bg-ck-violeta-suave text-ck-violeta font-semibold' : 'border-gray-200 bg-gray-50 text-gray-500'"
                    @click="form.sena = totalPedido">Todo · ${{ totalPedido.toLocaleString('es-AR') }}</button>
                  <label class="flex items-center gap-2 font-texto text-sm text-gray-500">
                    u otro monto: $
                    <input v-model.number="form.sena" type="number" :min="senaMinima" :max="totalPedido" step="100" class="input-dark !py-2 w-32" />
                  </label>
                </div>
                <p v-if="errores.sena" class="text-red-400 text-xs mb-2">{{ errores.sena }}</p>
                <p class="font-texto text-sm text-ck-tinta/70 mb-5">
                  Seña <b class="text-ck-tinta">${{ (Number(form.sena) || 0).toLocaleString('es-AR') }}</b> ·
                  Saldo al retirar <b class="text-ck-tinta">${{ Math.max(totalPedido - (Number(form.sena) || 0), 0).toLocaleString('es-AR') }}</b>
                </p>
                <p class="font-texto text-sm text-gray-600 mb-3">¿Cómo pagás la seña?</p>
              </template>
              <div v-else class="mb-4"></div>
              <div class="grid sm:grid-cols-2 gap-3">
                <button
                  v-for="mp in metodosPago"
                  :key="mp.val"
                  type="button"
                  @click="form.metodo_pago = mp.val"
                  class="p-4 rounded-xl border-2 text-center transition-all duration-200 font-texto text-sm"
                  :class="form.metodo_pago === mp.val
                    ? 'border-brand-orange bg-brand-orange/10 text-ck-naranja-t'
                    : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300'"
                >
                  <span class="text-2xl block mb-1">{{ mp.icon }}</span>
                  {{ esEncargo && mp.val === 'efectivo' ? 'Efectivo en el local' : mp.label }}
                </button>
              </div>
              <p v-if="errores.metodo_pago" class="text-red-400 text-xs mt-2">{{ errores.metodo_pago }}</p>
              <div v-if="form.metodo_pago === 'transferencia'" class="mt-4 p-4 bg-brand-orange/10 border border-brand-orange/20 rounded-xl">
                <p class="font-texto text-sm text-gray-700">
                  <span class="text-ck-naranja-t font-semibold">Alias:</span> ceketo11
                </p>
                <p class="font-texto text-xs text-gray-400 mt-1">Enviá el comprobante por WhatsApp una vez realizada la transferencia.</p>
              </div>
              <div v-else-if="esEncargo && form.metodo_pago === 'efectivo'" class="mt-4 p-4 bg-brand-green/5 border border-brand-green/20 rounded-xl">
                <p class="font-texto text-sm text-gray-700">📍 Pagás la seña en el local, Independencia 663. El encargo queda reservado cuando la pagás.</p>
              </div>
            </div>

            <!-- Nota -->
            <div class="bg-ck-blanco border border-gray-100 rounded-2xl p-6 shadow-sm">
              <label class="block font-texto text-sm text-gray-600 mb-2">Nota para el pedido (opcional)</label>
              <textarea v-model="form.nota" rows="3" placeholder="Ej: Sin maní, entregar en portería..."
                class="input-dark w-full resize-none"></textarea>
            </div>
          </div>

          <!-- Resumen del pedido -->
          <div class="lg:col-span-1">
            <div class="bg-ck-blanco border border-gray-100 rounded-2xl p-6 sticky top-28 shadow-sm">
              <h2 class="font-marca text-lg font-semibold text-ck-tinta mb-5">Tu pedido</h2>

              <div class="space-y-3 mb-5 max-h-72 overflow-y-auto">
                <div
                  v-for="item in itemsPedido"
                  :key="item.id"
                  class="flex justify-between items-start gap-2"
                >
                  <div class="flex-1">
                    <p class="font-texto text-sm text-gray-800 leading-tight">{{ item.name }}</p>
                    <p class="font-texto text-xs text-gray-400">×{{ item.quantity }}</p>
                  </div>
                  <span class="font-texto text-sm text-gray-600 flex-shrink-0">
                    ${{ (item.price * item.quantity).toLocaleString('es-AR') }}
                  </span>
                </div>
              </div>

              <div class="border-t border-gray-200 pt-4 mb-5">
                <div class="flex justify-between items-center">
                  <span class="font-texto text-gray-500">Total</span>
                  <span class="font-marca text-2xl font-bold text-ck-naranja-t">
                    ${{ totalPedido.toLocaleString('es-AR') }}
                  </span>
                </div>
                <template v-if="esEncargo">
                  <div class="flex justify-between font-texto text-sm text-ck-violeta mt-2">
                    <span>Seña para reservar</span><span>${{ (Number(form.sena) || 0).toLocaleString('es-AR') }}</span>
                  </div>
                  <div class="flex justify-between font-texto text-sm text-gray-500">
                    <span>Saldo al retirar</span><span>${{ Math.max(totalPedido - (Number(form.sena) || 0), 0).toLocaleString('es-AR') }}</span>
                  </div>
                  <p v-if="form.fecha_entrega" class="font-texto text-xs text-gray-400 mt-2">📅 {{ fechaLarga(form.fecha_entrega) }}</p>
                </template>
              </div>

              <p v-if="errorGeneral" class="text-red-400 text-sm font-texto mb-3">{{ errorGeneral }}</p>

              <button
                @click="confirmarPedido"
                :disabled="enviando || itemsPedido.length === 0"
                class="w-full flex items-center justify-center gap-2 py-4 bg-[#25D366] text-white font-texto font-semibold rounded-xl text-lg
                       hover:brightness-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="!enviando">💬</span>
                {{ enviando ? 'Procesando...' : (esEncargo ? 'Enviar encargo por WhatsApp' : 'Enviar pedido por WhatsApp') }}
              </button>

              <p class="font-texto text-xs text-gray-400 text-center mt-3">
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
import { ref, reactive, computed, watch } from 'vue'
import axios from 'axios'
import { useCartStore } from '@/stores/cart'
import CalendarioEncargo from '@/components/CalendarioEncargo.vue'
import { DIAS_ANTICIPACION, SENA_MINIMA, fechaMinimaEncargo, fechaLarga, esDomingo } from '@/brand/marca'

const WHATSAPP_CEKETO = '543854133969'

const cartStore        = useCartStore()
const enviando         = ref(false)
const pedidoConfirmado = ref(null)
const waUrl            = ref('')
const errorGeneral     = ref('')
const encargoConfirmado = ref(null)   // { fecha, sena, saldo, metodo } para la pantalla final

// ── Encargos (postres a pedido): van en un pedido aparte del resto ──
const itemsAPedido = computed(() => cartStore.items.filter(i => i.a_pedido))
const itemsResto   = computed(() => cartStore.items.filter(i => !i.a_pedido))
const esMixto      = computed(() => itemsAPedido.value.length > 0 && itemsResto.value.length > 0)
const grupo        = ref('apedido')    // en carrito mixto: qué pedido se finaliza ahora
const itemsPedido  = computed(() => {
  if (!esMixto.value) return cartStore.items
  return grupo.value === 'apedido' ? itemsAPedido.value : itemsResto.value
})
const esEncargo    = computed(() => itemsPedido.value.length > 0 && itemsPedido.value.every(i => i.a_pedido))
const totalPedido  = computed(() => itemsPedido.value.reduce((s, i) => s + i.price * i.quantity, 0))
const senaMinima   = computed(() => Math.ceil(totalPedido.value * SENA_MINIMA))
const fechaMin     = fechaMinimaEncargo()

// Entrega y pago arrancan vacíos a propósito: el cliente tiene que elegir.
// Con un valor por defecto, alguien que quería envío terminaba pidiendo retiro sin darse cuenta.
const form = reactive({
  nombre:       '',
  telefono:     '',
  email:        '',
  tipo_entrega: '',
  direccion:    '',
  localidad:    '',
  metodo_pago:  '',
  nota:         '',
  fecha_entrega: '',   // encargos
  sena:          0,    // encargos
})

// La seña arranca en el mínimo y se acomoda si cambia el total
watch(senaMinima, v => { if (!form.sena || form.sena < v || form.sena > totalPedido.value) form.sena = v }, { immediate: true })

const errores = reactive({
  nombre: '', telefono: '', email: '',
  tipo_entrega: '', direccion: '', localidad: '', metodo_pago: '',
  fecha_entrega: '', sena: '',
})

const tiposEntrega = [
  { val: 'retiro', icon: '🏪', label: 'Retiro en el local' },
  { val: 'envio',  icon: '🛵', label: 'Envío a domicilio' },
]

const metodosPago = [
  { val: 'transferencia', icon: '🏦', label: 'Transferencia' },
  { val: 'efectivo',      icon: '💵', label: 'Efectivo' },
]

function validar() {
  const esEnvio = form.tipo_entrega === 'envio'
  errores.nombre       = form.nombre.trim()   ? '' : 'El nombre es requerido'
  errores.telefono     = form.telefono.trim() ? '' : 'El teléfono es requerido'
  errores.email        = !form.email.trim()
    ? 'El email es requerido'
    : (/^\S+@\S+\.\S+$/.test(form.email.trim()) ? '' : 'Revisá el email, no parece válido')
  errores.tipo_entrega = form.tipo_entrega ? '' : 'Elegí si retirás en el local o querés envío'
  errores.direccion    = (esEnvio && !form.direccion.trim())  ? 'La dirección es requerida para el envío' : ''
  errores.localidad    = (esEnvio && !form.localidad.trim())  ? 'El barrio o localidad es requerido' : ''
  errores.metodo_pago  = form.metodo_pago ? '' : (esEncargo.value ? 'Elegí cómo pagás la seña' : 'Elegí una forma de pago')
  if (esEncargo.value) {
    const f = form.fecha_entrega
    errores.fecha_entrega = !f ? 'Elegí el día de entrega'
      : (f < fechaMin ? `El primer día posible es el ${fechaLarga(fechaMin)}` : (esDomingo(f) ? 'Los domingos estamos cerrados' : ''))
    const s = Number(form.sena) || 0
    errores.sena = s < senaMinima.value ? `La seña mínima es $${senaMinima.value.toLocaleString('es-AR')}`
      : (s > totalPedido.value ? 'La seña no puede ser mayor que el total' : '')
  } else {
    errores.fecha_entrega = ''
    errores.sena = ''
  }
  return !Object.values(errores).some(Boolean)
}

function construirMensaje(pedidoId) {
  const esEnvio = form.tipo_entrega === 'envio'

  const lineas = itemsPedido.value
    .map(i => `• ${i.quantity}x ${i.name} — $${(i.price * i.quantity).toLocaleString('es-AR')}`)
    .join('\n')

  const entrega = esEnvio
    ? `Envío a domicilio — ${form.direccion}${form.localidad ? ', ' + form.localidad : ''}`
    : 'Retiro en el local (Independencia 663)'

  const pago = form.metodo_pago === 'transferencia'
    ? 'Transferencia (alias: ceketo11)'
    : (esEncargo.value ? 'Efectivo en el local' : 'Efectivo')

  const sena  = Number(form.sena) || 0
  const partes = [
    esEncargo.value ? '¡Hola Ceketo! 🎂 Te paso mi encargo:' : '¡Hola Ceketo! 🥑 Te paso mi pedido:',
    '',
    `🧾 *${esEncargo.value ? 'Encargo' : 'Pedido'} N° ${pedidoId}*`,
  ]
  if (esEncargo.value) partes.push(`📅 *Para el ${fechaLarga(form.fecha_entrega)}*`)
  partes.push(
    '',
    '🛒 *PEDIDO*',
    lineas,
    '',
    `💰 *Total productos: $${totalPedido.value.toLocaleString('es-AR')}*`,
  )
  if (esEncargo.value) {
    partes.push(
      `💵 *Seña: $${sena.toLocaleString('es-AR')}* (${form.metodo_pago === 'transferencia' ? 'te mando el comprobante' : 'la pago en el local'})`,
      `🧮 Saldo al retirar: $${Math.max(totalPedido.value - sena, 0).toLocaleString('es-AR')}`,
    )
  }
  // El costo del envío no está en el total: se coordina por WhatsApp.
  if (esEnvio) partes.push('🛵 _El costo del envío lo coordinamos por acá._')
  partes.push(
    '',
    `👤 *Nombre:* ${form.nombre}`,
    `📱 *Tel:* ${form.telefono}`,
    `✉️ *Email:* ${form.email}`,
    `💳 *${esEncargo.value ? 'Seña' : 'Pago'}:* ${pago}`,
    `📦 *Entrega:* ${entrega}`,
  )
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
    const encargo = esEncargo.value
    const items = itemsPedido.value.map(i => ({
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
      ...(encargo ? { fecha_entrega: form.fecha_entrega, sena_monto: Number(form.sena) } : {}),
    }
    const { data } = await axios.post('/api/pedidos', payload)

    const url = `https://wa.me/${WHATSAPP_CEKETO}?text=${encodeURIComponent(construirMensaje(data.pedido_id))}`
    waUrl.value = url
    if (waWin) waWin.location.href = url
    else window.location.href = url   // fallback si el popup fue bloqueado

    pedidoConfirmado.value = data.pedido_id
    encargoConfirmado.value = encargo
      ? { fecha: form.fecha_entrega, sena: Number(form.sena), saldo: Math.max(totalPedido.value - Number(form.sena), 0), metodo: form.metodo_pago }
      : null
    // Se sacan del carrito solo los productos de este pedido (en un carrito mixto, el otro queda)
    const enviados = new Set(itemsPedido.value.map(i => i.id))
    for (const id of enviados) cartStore.removeItem(id)
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
  @apply px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 font-texto text-sm
         focus:outline-none focus:border-brand-orange transition-colors placeholder-gray-400;
}
</style>
