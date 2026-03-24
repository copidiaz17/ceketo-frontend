<template>
  <main class="min-h-screen bg-transparent pt-28">
    <div class="max-w-6xl mx-auto px-6 py-10">

      <div v-if="product" class="grid md:grid-cols-2 gap-12">
        <!-- Image -->
        <div class="relative rounded-3xl overflow-hidden shadow-xl group bg-white">
          <img
            v-if="product.imagen"
            :src="product.imagen"
            :alt="product.nombre"
            class="w-full h-[500px] object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div v-else class="w-full h-[500px] flex items-center justify-center text-8xl">
            {{ categoriaIcon(product.categoria?.codigo) }}
          </div>
          <span class="absolute top-5 left-5 badge bg-white/90 backdrop-blur-sm text-teal font-medium shadow-sm text-sm">
            {{ product.categoria?.nombre }}
          </span>
        </div>

        <!-- Info -->
        <div class="flex flex-col justify-center">
          <span class="badge bg-teal/10 text-teal mb-3 inline-block w-fit border border-teal/20">
            {{ product.categoria?.nombre }}
          </span>
          <h1 class="font-display text-4xl font-bold text-gray-900 mb-2">{{ product.nombre }}</h1>
          <p class="font-body text-xs text-gray-400 font-mono mb-4">{{ product.codigo_barras }}</p>

          <!-- Stock -->
          <div class="flex items-center gap-2 mb-5">
            <span
              class="w-2 h-2 rounded-full"
              :class="product.stock > 0 ? 'bg-teal' : 'bg-red-400'"
            ></span>
            <span class="font-body text-sm" :class="product.stock > 0 ? 'text-teal' : 'text-red-400'">
              {{ product.stock > 0 ? `${product.stock} en stock` : 'Sin stock' }}
            </span>
          </div>

          <!-- Price -->
          <div class="flex items-baseline gap-3 mb-8">
            <span class="font-display text-4xl font-bold text-teal">
              ${{ parseFloat(product.precio).toLocaleString('es-AR') }}
            </span>
          </div>

          <!-- Add to cart -->
          <div class="flex gap-4 mb-4">
            <div class="flex items-center gap-3 bg-gray-100 border border-gray-200 rounded-full px-4 py-2">
              <button @click="qty > 1 && qty--" class="text-gray-400 hover:text-brand-orange font-bold text-lg w-6">−</button>
              <span class="font-body font-medium w-8 text-center text-gray-800">{{ qty }}</span>
              <button @click="qty++" class="text-gray-400 hover:text-brand-orange font-bold text-lg w-6">+</button>
            </div>
            <button
              @click="addToCart"
              :disabled="product.stock === 0"
              class="flex-1 btn-primary text-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ product.stock === 0 ? 'Sin stock' : 'Agregar al carrito' }}
            </button>
          </div>

          <!-- WhatsApp -->
          <a
            :href="whatsappLink"
            target="_blank"
            rel="noopener"
            class="flex items-center justify-center gap-2 w-full py-3 rounded-full border-2 border-white/10
                   text-gray-500 hover:border-brand-orange hover:text-brand-orange transition-all duration-300 font-body text-sm mb-6"
          >
            💬 Consultar por WhatsApp
          </a>

          <!-- Tags -->
          <div class="flex flex-wrap gap-2">
            <span
              v-for="tag in ['Sin azúcar', 'Bajo en carbos', 'Artesanal', 'Sin TACC']"
              :key="tag"
              class="badge bg-gray-100 border border-gray-200 text-gray-600 text-xs"
            >
              ✓ {{ tag }}
            </span>
          </div>
        </div>
      </div>

      <!-- Not found -->
      <div v-else-if="loaded" class="text-center py-20">
        <span class="text-6xl block mb-4">🔍</span>
        <h2 class="font-display text-2xl text-gray-400">Producto no encontrado</h2>
        <RouterLink to="/tienda" class="btn-primary inline-block mt-6">Volver a la tienda</RouterLink>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import axios from 'axios'

const route     = useRoute()
const cartStore = useCartStore()
const product   = ref(null)
const loaded    = ref(false)
const qty       = ref(1)

const iconMap = { BYM: '🧁', CHC: '🍫', DUL: '🍯', PY0: '🍞', PAS: '🍝', PYT: '🥧' }
function categoriaIcon(codigo) { return iconMap[codigo] || '🥑' }

const whatsappLink = computed(() => {
  if (!product.value) return '#'
  const msg = `Hola CEKETO! Quiero consultar sobre *${product.value.nombre}* ($${parseFloat(product.value.precio).toLocaleString('es-AR')})`
  return `https://wa.me/543854133969?text=${encodeURIComponent(msg)}`
})

function addToCart() {
  if (!product.value || product.value.stock === 0) return
  const item = {
    id:       product.value.id,
    name:     product.value.nombre,
    price:    parseFloat(product.value.precio),
    category: product.value.categoria?.nombre || '',
    image:    product.value.imagen || '',
    stock:    product.value.stock,
  }
  for (let i = 0; i < qty.value; i++) cartStore.addItem(item)
}

onMounted(async () => {
  try {
    const { data } = await axios.get(`/api/productos/${route.params.id}`)
    product.value = data
  } catch {
    product.value = null
  } finally {
    loaded.value = true
  }
})
</script>
