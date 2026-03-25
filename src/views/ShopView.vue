<template>
  <main class="min-h-screen bg-[#FCDFD2] relative pt-28 overflow-hidden">

    <!-- Logo difuminado de fondo -->
    <div class="pointer-events-none fixed inset-0 flex items-center justify-center z-0 select-none">
      <span class="font-display font-bold text-brand-green/10 select-none"
            style="font-size: clamp(8rem, 30vw, 22rem); letter-spacing: 0.15em; white-space: nowrap;">
        CEKETO
      </span>
    </div>

    <div class="relative z-10 max-w-7xl mx-auto px-6 py-10">

      <!-- Header -->
      <div class="mb-10">
        <h1 class="font-display text-3xl font-bold text-gray-900 mb-1">Tienda</h1>
        <p class="font-body text-gray-500">Todos nuestros productos cetogénicos artesanales</p>
      </div>

      <!-- Filtros -->
      <div class="flex flex-wrap gap-3 mb-10">
        <button
          @click="activeCategory = ''"
          class="py-2 px-5 rounded-full text-sm font-body font-medium border-2 transition-all duration-200"
          :class="activeCategory === ''
            ? 'bg-brand-green border-brand-green text-white shadow-md'
            : 'bg-white/70 border-gray-200 text-gray-600 hover:border-brand-green hover:text-brand-green'"
        >Todos</button>
        <button
          v-for="cat in categories"
          :key="cat.codigo"
          @click="activeCategory = cat.codigo"
          class="py-2 px-5 rounded-full text-sm font-body font-medium border-2 transition-all duration-200"
          :class="activeCategory === cat.codigo
            ? 'bg-brand-green border-brand-green text-white shadow-md'
            : 'bg-white/70 border-gray-200 text-gray-600 hover:border-brand-green hover:text-brand-green'"
        >{{ cat.nombre }}</button>

        <!-- Búsqueda -->
        <div class="w-full sm:w-auto sm:ml-auto relative">
          <input
            v-model="search"
            type="text"
            placeholder="Buscar productos..."
            class="w-full pl-10 pr-4 py-2 rounded-full border-2 border-gray-200 bg-white/70
                   focus:border-brand-green focus:outline-none font-body text-sm transition-all
                   text-gray-800 placeholder-gray-400"
          />
          <svg class="absolute left-3 top-2.5 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div v-for="i in 8" :key="i" class="rounded-2xl bg-white/50 aspect-[3/4] animate-pulse"></div>
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
        <p class="font-display text-2xl text-gray-500">No encontramos productos</p>
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

const route          = useRoute()
const activeCategory = ref(route.query.categoria || '')
const search         = ref('')
const allProducts    = ref([])
const categories     = ref([])
const loading        = ref(true)

const CATEGORIA_IMG = {
  'BYM': '/images/prod1.jpg',
  'CHY': '/images/prod2.jpg',
  'DUK': '/images/prod3.jpg',
  'PY0': '/images/prod4.jpg',
  'PYE': '/images/prod5.png',
  'PYT': '/images/prod6.jpg',
}

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

const filteredProducts = computed(() =>
  allProducts.value.filter(p => {
    const matchCat    = !activeCategory.value || p.categoria?.codigo === activeCategory.value
    const matchSearch = !search.value ||
      p.nombre.toLowerCase().includes(search.value.toLowerCase()) ||
      p.codigo.toLowerCase().includes(search.value.toLowerCase())
    return matchCat && matchSearch && p.activo !== false
  })
)

watch(() => route.query.categoria, (val) => {
  activeCategory.value = val || ''
})

onMounted(async () => {
  try {
    const [{ data: prods }, { data: cats }] = await Promise.all([
      axios.get('/api/productos?limit=500'),
      axios.get('/api/categorias'),
    ])
    allProducts.value = prods
    categories.value  = cats
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
  transition: all 0.3s ease;
}
.product-list-enter-from,
.product-list-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
.product-list-move {
  transition: transform 0.3s ease;
}
</style>
