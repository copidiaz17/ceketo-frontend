<template>
  <main class="min-h-screen bg-transparent pt-28">
    <div class="max-w-7xl mx-auto px-6 py-10">

      <!-- Header -->
      <div class="mb-10">
        <h1 class="section-title mb-2">Tienda</h1>
        <p class="section-subtitle">Todos nuestros productos cetogénicos artesanales</p>
      </div>

      <!-- Filters row -->
      <div class="flex flex-wrap gap-3 mb-10">
        <button
          @click="activeCategory = ''"
          class="badge py-2 px-5 text-sm font-medium border-2 transition-all duration-300 cursor-pointer hover:scale-105"
          :class="activeCategory === ''
            ? 'bg-brand-orange border-brand-orange text-white shadow-md'
            : 'bg-white border-gray-200 text-gray-600 hover:border-brand-orange hover:text-brand-orange'"
        >
          Todos
        </button>
        <button
          v-for="cat in categories"
          :key="cat.codigo"
          @click="activeCategory = cat.codigo"
          class="badge py-2 px-5 text-sm font-medium border-2 transition-all duration-300 cursor-pointer hover:scale-105"
          :class="activeCategory === cat.codigo
            ? 'bg-brand-orange border-brand-orange text-white shadow-md'
            : 'bg-white border-gray-200 text-gray-600 hover:border-brand-orange hover:text-brand-orange'"
        >
          {{ cat.nombre }}
        </button>

        <!-- Search -->
        <div class="w-full sm:w-auto sm:ml-auto relative">
          <input
            v-model="search"
            type="text"
            placeholder="Buscar productos..."
            class="w-full pl-10 pr-4 py-2 rounded-full border-2 border-gray-200 focus:border-brand-orange focus:outline-none font-body text-sm transition-all duration-300 bg-white text-gray-800 placeholder-gray-400"
          />
          <svg class="absolute left-3 top-2.5 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div v-for="i in 8" :key="i" class="rounded-2xl bg-gray-200 aspect-[3/4] animate-pulse"></div>
      </div>

      <!-- Grid -->
      <TransitionGroup
        v-else
        name="product-list"
        tag="div"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        <ProductCard
          v-for="product in filteredProducts"
          :key="product.id"
          :product="adaptProduct(product)"
        />
      </TransitionGroup>

      <!-- Empty state -->
      <div v-if="!loading && filteredProducts.length === 0" class="text-center py-20">
        <span class="text-6xl mb-4 block">🔍</span>
        <p class="font-display text-2xl text-gray-400">No encontramos productos</p>
        <p class="font-body text-gray-400 mt-2">Probá con otra búsqueda o categoría</p>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import ProductCard from '@/components/ProductCard.vue'
import axios from 'axios'

const route = useRoute()
const activeCategory = ref(route.query.categoria || '')
const search = ref('')
const allProducts = ref([])
const loading = ref(true)

const categories = [
  { codigo: 'BYM', nombre: 'Budines y Muffins' },
  { codigo: 'CHC', nombre: 'Chocolates' },
  { codigo: 'DUL', nombre: 'Dulces' },
  { codigo: 'PY0', nombre: 'Panes y Otros' },
  { codigo: 'PAS', nombre: 'Pastas' },
  { codigo: 'PYT', nombre: 'Postres y Tartas' },
]

// Imagen de fallback por categoría
const CATEGORIA_IMG = {
  'BYM': '/images/prod1.jpg',  // Budines y Muffins
  'CHC': '/images/prod2.jpg',  // Chocolates
  'DUL': '/images/prod3.jpg',  // Dulces
  'PY0': '/images/prod4.jpg',  // Panes y Otros
  'PAS': '/images/prod5.png',  // Pastas
  'PYT': '/images/prod6.jpg',  // Postres y Tartas
}

// Adaptar producto de MySQL al formato que espera ProductCard
function adaptProduct(p) {
  const cat     = p.categoria?.codigo || ''
  const fallback = CATEGORIA_IMG[cat] || '/images/prod1.jpg'
  return {
    id:          p.id,
    name:        p.nombre,
    description: p.categoria?.nombre || '',
    price:       parseFloat(p.precio),
    category:    cat,
    stock:       p.stock,
    image:       p.imagen || fallback,
  }
}

const filteredProducts = computed(() => {
  return allProducts.value.filter(p => {
    const matchCat = !activeCategory.value || p.categoria?.codigo === activeCategory.value
    const matchSearch = !search.value ||
      p.nombre.toLowerCase().includes(search.value.toLowerCase()) ||
      p.codigo.toLowerCase().includes(search.value.toLowerCase())
    return matchCat && matchSearch
  })
})

// Reaccionar al cambio de query param (desde Categories.vue)
watch(() => route.query.categoria, (val) => {
  activeCategory.value = val || ''
})

onMounted(async () => {
  try {
    const { data } = await axios.get('/api/productos')
    allProducts.value = data
  } catch {
    allProducts.value = []
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.product-list-enter-active,
.product-list-leave-active {
  transition: all 0.4s ease;
}
.product-list-enter-from,
.product-list-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
.product-list-move {
  transition: transform 0.4s ease;
}
</style>
