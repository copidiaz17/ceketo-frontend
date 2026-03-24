<template>
  <article class="group relative bg-white border border-gray-100 rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-brand-orange/15 transition-all duration-500 hover:-translate-y-2">

    <!-- Image container -->
    <div class="relative overflow-hidden h-64">
      <img
        :src="product.image || '/images/prod1.jpg'"
        :alt="product.name"
        class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        @error="$event.target.src = '/images/prod1.jpg'"
      />

      <span class="absolute top-4 left-4 badge bg-white/90 backdrop-blur-sm text-gray-700 font-medium border border-gray-200/60">
        {{ product.category }}
      </span>

      <span
        v-if="product.stock <= 5 && product.stock > 0"
        class="absolute top-4 right-4 badge bg-brand-orange text-white"
      >
        Últimas unidades
      </span>

      <!-- Overlay hover -->
      <div class="absolute inset-0 bg-white/85 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-400 flex flex-col items-center justify-center gap-3 px-6">
        <button
          @click.prevent="addToCart"
          class="w-full bg-brand-orange text-white py-3 rounded-full font-medium text-sm tracking-wide
                 transform translate-y-4 group-hover:translate-y-0 transition-all duration-400
                 hover:bg-orange-600 active:scale-95 shadow-lg"
        >
          + Agregar al carrito
        </button>
        <RouterLink
          :to="`/producto/${product.id}`"
          class="w-full text-center text-gray-600 py-2 rounded-full text-sm border border-gray-300
                 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500
                 hover:bg-gray-100"
          style="transition-delay: 50ms"
        >
          Ver detalle
        </RouterLink>
      </div>
    </div>

    <!-- Info -->
    <div class="p-5">
      <h3 class="font-display text-lg font-semibold text-gray-900 mb-1 line-clamp-1 group-hover:text-brand-orange transition-colors duration-300">
        {{ product.name }}
      </h3>
      <p class="font-body text-gray-500 text-sm mb-4 line-clamp-2 leading-relaxed">
        {{ product.description }}
      </p>
      <div class="flex items-center justify-between">
        <div class="flex items-baseline gap-1">
          <span class="font-display text-2xl font-bold text-brand-orange">
            ${{ product.price.toLocaleString('es-AR') }}
          </span>
          <span v-if="product.originalPrice" class="text-sm text-gray-400 line-through">
            ${{ product.originalPrice.toLocaleString('es-AR') }}
          </span>
        </div>
        <button
          @click="addToCart"
          class="w-10 h-10 rounded-full bg-brand-orange/15 text-brand-orange border border-brand-orange/20 flex items-center justify-center
                 hover:bg-brand-orange hover:text-white transition-all duration-300 hover:scale-110 active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Added to cart feedback -->
    <Transition name="added-flash">
      <div
        v-if="showAdded"
        class="absolute inset-0 bg-brand-orange/10 pointer-events-none rounded-3xl border-2 border-brand-orange flex items-center justify-center"
      >
        <div class="bg-brand-orange text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
          ✓ Agregado al carrito
        </div>
      </div>
    </Transition>
  </article>
</template>

<script setup>
import { ref } from 'vue'
import { useCartStore } from '@/stores/cart'

const props = defineProps({
  product: { type: Object, required: true },
})

const cartStore = useCartStore()
const showAdded = ref(false)

function addToCart() {
  cartStore.addItem(props.product)
  showAdded.value = true
  setTimeout(() => { showAdded.value = false }, 1500)
}
</script>

<style scoped>
.added-flash-enter-active,
.added-flash-leave-active { transition: opacity 0.3s ease; }
.added-flash-enter-from,
.added-flash-leave-to { opacity: 0; }
</style>
