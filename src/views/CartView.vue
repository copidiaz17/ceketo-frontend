<template>
  <main class="min-h-screen bg-transparent pt-28">
    <div class="max-w-5xl mx-auto px-6 py-10">

      <h1 class="section-title mb-2">Tu carrito</h1>
      <p class="section-subtitle mb-10">{{ cartStore.totalItems }} producto{{ cartStore.totalItems !== 1 ? 's' : '' }}</p>

      <!-- Empty cart -->
      <div v-if="cartStore.items.length === 0" class="text-center py-20">
        <span class="text-7xl block mb-6">🛒</span>
        <h2 class="font-display text-2xl text-gray-400 mb-3">Tu carrito está vacío</h2>
        <p class="font-body text-gray-400 mb-8">¡Agregá productos y empezá tu estilo de vida keto!</p>
        <RouterLink to="/tienda" class="btn-primary">Ver tienda</RouterLink>
      </div>

      <!-- Cart items -->
      <div v-else class="grid lg:grid-cols-3 gap-8">

        <!-- Items list -->
        <div class="lg:col-span-2 space-y-4">
          <TransitionGroup name="cart-item">
            <div
              v-for="item in cartStore.items"
              :key="item.id"
              class="bg-white border border-gray-100 rounded-2xl p-4 flex gap-4 hover:border-brand-orange/30 shadow-sm transition-all duration-300"
            >
              <img
                :src="item.image"
                :alt="item.name"
                class="w-24 h-24 object-cover rounded-xl flex-shrink-0"
              />
              <div class="flex-1 min-w-0">
                <h3 class="font-display font-semibold text-gray-900 mb-1 truncate">{{ item.name }}</h3>
                <p class="font-body text-gray-400 text-sm mb-3">{{ item.category }}</p>
                <div class="flex items-center justify-between">
                  <!-- Quantity -->
                  <div class="flex items-center gap-2 bg-gray-100 border border-gray-200 rounded-full px-3 py-1">
                    <button
                      @click="cartStore.updateQuantity(item.id, item.quantity - 1)"
                      class="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-brand-orange transition-colors font-bold"
                    >−</button>
                    <span class="font-body font-medium w-6 text-center text-sm text-gray-800">{{ item.quantity }}</span>
                    <button
                      @click="cartStore.updateQuantity(item.id, item.quantity + 1)"
                      class="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-brand-orange transition-colors font-bold"
                    >+</button>
                  </div>
                  <!-- Price + Delete -->
                  <div class="flex items-center gap-4">
                    <span class="font-display font-bold text-teal text-lg">
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
          <div class="bg-white border border-gray-100 rounded-2xl p-6 sticky top-28 shadow-sm">
            <h3 class="font-display text-xl font-semibold text-gray-900 mb-6">Resumen del pedido</h3>

            <div class="space-y-3 mb-6">
              <div class="flex justify-between font-body text-sm text-gray-500">
                <span>Subtotal ({{ cartStore.totalItems }} items)</span>
                <span>${{ cartStore.totalPrice.toLocaleString('es-AR') }}</span>
              </div>
              <div class="flex justify-between font-body text-sm text-gray-500">
                <span>Envío</span>
                <span class="text-brand-green font-medium">Gratis</span>
              </div>
              <div class="border-t border-gray-200 pt-3 flex justify-between font-display text-xl font-bold text-gray-900">
                <span>Total</span>
                <span class="text-brand-orange">${{ cartStore.totalPrice.toLocaleString('es-AR') }}</span>
              </div>
            </div>

            <RouterLink to="/checkout" class="w-full btn-primary justify-center text-base py-4 mb-3 text-center block">
              Finalizar compra
            </RouterLink>
            <a
              :href="whatsappLink"
              target="_blank"
              rel="noopener"
              class="w-full flex items-center justify-center gap-2 py-3 rounded-full border-2 border-gray-200 text-gray-500 hover:border-brand-orange hover:text-brand-orange transition-all duration-300 font-body text-sm mb-3"
            >
              💬 Pedir por WhatsApp
            </a>
            <RouterLink to="/tienda" class="w-full text-center block font-body text-sm text-gray-400 hover:text-gray-600 transition-colors py-2">
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
import { computed } from 'vue'
import { useCartStore } from '@/stores/cart'
const cartStore = useCartStore()

const whatsappLink = computed(() => {
  const lineas = cartStore.items.map(i => `• ${i.name} x${i.quantity} = $${(i.price * i.quantity).toLocaleString('es-AR')}`).join('\n')
  const msg = `Hola CEKETO! Quiero hacer el siguiente pedido:\n\n${lineas}\n\n*Total: $${cartStore.totalPrice.toLocaleString('es-AR')}*`
  return `https://wa.me/543854133969?text=${encodeURIComponent(msg)}`
})
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
