<template>
  <section id="productos" class="relative py-24 md:py-28 overflow-hidden bg-ck-lima-suave">
    <BrandBackdrop variante="destacados" />

    <div class="relative z-10 max-w-7xl mx-auto px-5 md:px-6">

      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
        <div>
          <span v-reveal class="ck-eyebrow text-ck-violeta mb-3">Nuestros productos</span>
          <h2 v-reveal="100" class="ck-titulo">
            Lo más <span class="text-ck-violeta">elegido</span>
          </h2>
          <p v-reveal="180" class="font-texto text-ck-tinta/60 mt-3 max-w-md">
            Los que más se llevan nuestros clientes, según las ventas reales.
          </p>
        </div>
        <RouterLink v-reveal="200" to="/tienda" class="ck-btn-borde self-start md:self-auto group">
          Ver todo el catálogo
          <span class="transition-transform duration-300 group-hover:translate-x-1">→</span>
        </RouterLink>
      </div>

      <!-- Esqueleto claro mientras carga -->
      <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
        <div v-for="i in 6" :key="i" class="rounded-[26px] bg-ck-blanco p-2.5 animate-pulse">
          <div class="h-60 rounded-[20px] bg-ck-tinta/[.06]"></div>
          <div class="p-4 space-y-3">
            <div class="h-4 bg-ck-tinta/[.07] rounded-full w-3/4"></div>
            <div class="h-4 bg-ck-tinta/[.07] rounded-full w-1/2"></div>
            <div class="h-7 bg-ck-tinta/[.07] rounded-full w-1/3 mt-5"></div>
          </div>
        </div>
      </div>

      <!-- Grilla -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
        <div v-for="(product, i) in products" :key="product.id" v-reveal="(i % 3) * 110">
          <ProductCard :product="product" />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { publico } from '@/brand/publico'
import { ref, onMounted } from 'vue'
import axios from 'axios'
import ProductCard from './ProductCard.vue'
import BrandBackdrop from '@/components/brand/BrandBackdrop.vue'

const products = ref([])
const loading = ref(true)

// Categorías que NO se muestran en la web (sí siguen en el admin)
const CATEGORIAS_OCULTAS = ['MKT']

function adaptProduct(p) {
  return {
    id:          p.id,
    name:        p.nombre,
    description: p.categoria?.nombre || '',
    price:       parseFloat(p.precio),
    category:    p.categoria?.codigo || '',
    stock:       p.stock,
    image:       p.imagen || publico('/images/sin-imagen.svg'),
  }
}

onMounted(async () => {
  try {
    // Best-sellers reales (suma de ventas, excluye Market)
    const { data } = await axios.get('/api/productos/mas-vendidos?limit=6')
    products.value = data.map(adaptProduct)
  } catch {
    // Fallback: primeros 6 del catálogo (por si el endpoint falla)
    try {
      const { data } = await axios.get('/api/productos?limit=500')
      products.value = data
        .filter(p => !CATEGORIAS_OCULTAS.includes(p.categoria?.codigo))
        .slice(0, 6)
        .map(adaptProduct)
    } catch {
      products.value = []
    }
  } finally {
    loading.value = false
  }
})
</script>
