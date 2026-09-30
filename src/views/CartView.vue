<template>
  <main class="min-h-screen bg-ck-crema pt-28">
    <div class="max-w-5xl mx-auto px-6 py-10">

      <h1 class="ck-titulo mb-2">Tu carrito</h1>
      <p class="font-texto text-ck-tinta/60 text-lg mb-10">{{ cartStore.totalItems }} producto{{ cartStore.totalItems !== 1 ? 's' : '' }}</p>

      <!-- Empty cart -->
      <div v-if="cartStore.items.length === 0" class="text-center py-20">
        <span class="text-7xl block mb-6">🛒</span>
        <h2 class="font-marca text-2xl text-gray-400 mb-3">Tu carrito está vacío</h2>
        <p class="font-texto text-gray-400 mb-8">¡Agregá productos y empezá tu estilo de vida keto!</p>
        <RouterLink to="/tienda" class="ck-btn-naranja">Ver tienda</RouterLink>
      </div>

      <!-- Cart items -->
      <div v-else class="grid lg:grid-cols-3 gap-8">

        <!-- Postres a pedido: van en un pedido aparte, con fecha y seña -->
        <div v-if="cartStore.items.some(i => i.a_pedido)" class="lg:col-span-3 p-4 rounded-2xl bg-ck-violeta-suave font-texto text-sm text-ck-tinta/80">
          🎂 <b class="text-ck-tinta">Tenés postres a pedido.</b> Se encargan en un pedido aparte: al finalizar elegís el día
          (con 2 días de anticipación) y la seña del 50% para reservarlos.
        </div>

        <!-- Items list -->
        <div class="lg:col-span-2 space-y-4">
          <TransitionGroup name="cart-item">
            <div
              v-for="item in cartStore.items"
              :key="item.id"
              class="bg-ck-blanco border border-gray-100 rounded-2xl p-4 flex gap-4 hover:border-brand-orange/30 shadow-sm transition-all duration-300"
            >
              <img
                :src="item.image"
                :alt="item.name"
                class="w-24 h-24 object-cover rounded-xl flex-shrink-0"
              />
              <div class="flex-1 min-w-0">
                <h3 class="font-marca font-semibold text-ck-tinta mb-1 truncate">{{ item.name }}</h3>
                <p class="font-texto text-gray-400 text-sm mb-3">{{ item.category }}<span v-if="item.a_pedido" class="ml-2 px-2 py-0.5 rounded-full bg-ck-violeta text-white text-[11px] font-semibold">A pedido</span></p>
                <div class="flex items-center justify-between">
                  <!-- Quantity -->
                  <div class="flex items-center gap-2 bg-gray-100 border border-gray-200 rounded-full px-3 py-1">
                    <button
                      @click="cartStore.updateQuantity(item.id, item.quantity - 1)"
                      class="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-ck-naranja-t transition-colors font-bold"
                    >−</button>
                    <span class="font-texto font-medium w-6 text-center text-sm text-gray-800">{{ item.quantity }}</span>
                    <button
                      @click="cartStore.updateQuantity(item.id, item.quantity + 1)"
                      :disabled="enStockMaximo(item)"
                      class="w-6 h-6 flex items-center justify-center transition-colors font-bold"
                      :class="enStockMaximo(item) ? 'text-gray-200 cursor-not-allowed' : 'text-gray-400 hover:text-ck-naranja-t'"
                    >+</button>
                  </div>
                  <!-- Price + Delete -->
                  <div class="flex items-center gap-4">
                    <span class="font-marca font-bold text-ck-naranja-t text-lg">
                      ${{ (item.price * item.quantity).toLocaleString('es-AR') }}
                    </span>
                    <button
                      @click="cartStore.removeItem(item.id)"
                      class="text-gray-300 hover:text-red-400 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </TransitionGroup>
        </div>

        <!-- Order summary -->
        <div class="lg:col-span-1">
          <div class="bg-ck-blanco border border-gray-100 rounded-2xl p-6 sticky top-28 shadow-sm">
            <h3 class="font-marca text-xl font-semibold text-ck-tinta mb-6">Resumen del pedido</h3>

            <div class="space-y-3 mb-6">
              <div class="flex justify-between font-texto text-sm text-gray-500">
                <span>Subtotal ({{ cartStore.totalItems }} items)</span>
                <span>${{ cartStore.totalPrice.toLocaleString('es-AR') }}</span>
              </div>
              <div class="flex justify-between font-texto text-sm text-gray-500">
                <span>Envío</span>
                <span class="text-gray-400">A coordinar</span>
              </div>
              <div class="border-t border-gray-200 pt-3 flex justify-between font-marca text-xl font-bold text-ck-tinta">
                <span>Total productos</span>
                <span class="text-ck-naranja-t">${{ cartStore.totalPrice.toLocaleString('es-AR') }}</span>
              </div>
              <p class="font-texto text-xs text-gray-400 leading-snug">
                Si elegís envío a domicilio, el costo se coordina por WhatsApp y no está incluido en este total.
                Retirando en el local no tiene costo.
              </p>
            </div>

            <RouterLink to="/checkout" class="w-full ck-btn-naranja justify-center text-base py-4 mb-3 text-center block">
              Finalizar compra
            </RouterLink>
            <RouterLink to="/tienda" class="w-full text-center block font-texto text-sm text-gray-400 hover:text-gray-600 transition-colors py-2">
              Seguir comprando
            </RouterLink>

            <p class="text-center text-gray-400 text-xs mt-4">
              🔒 Pago seguro. Datos protegidos.
            </p>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { useCartStore } from '@/stores/cart'
const cartStore = useCartStore()

function enStockMaximo(item) {
  return Number.isFinite(item.stock) && item.quantity >= item.stock
}
</script>

<style scoped>
.cart-item-enter-active,
.cart-item-leave-active {
  transition: all 0.3s ease;
}
.cart-item-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}
.cart-item-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
