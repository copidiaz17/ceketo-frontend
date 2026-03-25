<template>
  <section id="productos" class="py-24 bg-white/60">
    <div class="max-w-7xl mx-auto px-6">

      <div class="flex flex-col md:flex-row md:items-end justify-between mb-16 reveal" ref="headerRef">
        <div>
          <span class="badge bg-brand-orange/15 text-brand-orange mb-3 inline-block border border-brand-orange/20">Nuestros productos</span>
          <h2 class="section-title">
            Lo más <span class="text-brand-orange italic">elegido</span>
          </h2>
        </div>
        <RouterLink to="/tienda" class="btn-outline mt-6 md:mt-0 self-start md:self-auto">
          Ver todo el catálogo →
        </RouterLink>
      </div>

      <!-- Skeleton loader -->
      <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <div
          v-for="i in 6"
          :key="i"
          class="bg-[#1A2E2A] rounded-3xl overflow-hidden animate-pulse"
        >
          <div class="h-64 bg-white/5"></div>
          <div class="p-5 space-y-3">
            <div class="h-5 bg-white/5 rounded-full w-3/4"></div>
            <div class="h-4 bg-white/5 rounded-full w-full"></div>
            <div class="h-4 bg-white/5 rounded-full w-2/3"></div>
            <div class="h-7 bg-white/5 rounded-full w-1/3 mt-4"></div>
          </div>
        </div>
      </div>

      <!-- Products grid -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <div
          v-for="(product, i) in products"
          :key="product.id"
          class="reveal"
          :ref="el => cardRefs[i] = el"
          :style="`transition-delay: ${i * 100}ms`"
        >
          <ProductCard :product="product" />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useScrollReveal } from '@/composables/useScrollReveal'
import ProductCard from './ProductCard.vue'
import axios from 'axios'

const products = ref([])
const loading = ref(true)
const headerRef = ref(null)
const cardRefs = ref([])

useScrollReveal([headerRef])

const CATEGORIA_IMG = {
  'BYM': new URL('@/assets/images/prod1.jpg', import.meta.url).href,
  'CHY': new URL('@/assets/images/prod2.jpg', import.meta.url).href,
  'DUK': new URL('@/assets/images/prod3.jpg', import.meta.url).href,
  'PY0': new URL('@/assets/images/prod4.jpg', import.meta.url).href,
  'PYE': new URL('@/assets/images/prod5.png', import.meta.url).href,
  'PYT': new URL('@/assets/images/prod6.jpg', import.meta.url).href,
}

function adaptProduct(p) {
  const cat = p.categoria?.codigo || ''
  return {
    id:          p.id,
    name:        p.nombre,
    description: p.categoria?.nombre || '',
    price:       parseFloat(p.precio),
    category:    cat,
    stock:       p.stock,
    image:       p.imagen || CATEGORIA_IMG[cat] || new URL('@/assets/images/prod1.jpg', import.meta.url).href,
  }
}

onMounted(async () => {
  try {
    const { data } = await axios.get('/api/productos?limit=6')
    products.value = data.map(adaptProduct)
  } catch {
    products.value = featuredFallback
  } finally {
    loading.value = false
    setTimeout(() => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            observer.unobserve(entry.target)
          }
        })
      }, { threshold: 0.1 })
      cardRefs.value.forEach(el => { if (el) observer.observe(el) })
    }, 100)
  }
})

const featuredFallback = [
  { id: 1, name: 'Pan Keto de Semillas', description: 'Pan artesanal bajo en carbohidratos, rico en fibra y proteínas. Sin gluten.', price: 1800, originalPrice: 2200, category: 'Panadería', image: new URL('@/assets/images/prod2.jpg', import.meta.url).href, stock: 10 },
  { id: 2, name: 'Cloud Bread', description: 'El pan de nube, suave, sin harinas y con alto contenido proteico. Ideal para sándwiches.', price: 1500, category: 'Panadería', image: new URL('@/assets/images/prod1.jpg', import.meta.url).href, stock: 8 },
  { id: 3, name: 'Tostadas de Aguacate Keto', description: 'Combinación perfecta de pan keto con aguacate fresco y especias naturales.', price: 1200, category: 'Snacks', image: new URL('@/assets/images/prod3.jpg', import.meta.url).href, stock: 5 },
  { id: 4, name: 'Muffins Proteicos', description: 'Muffins esponjosos sin azúcar, endulzados con eritritol. Pack x 4 unidades.', price: 1400, category: 'Pastelería', image: new URL('@/assets/images/prod4.jpg', import.meta.url).href, stock: 12 },
  { id: 5, name: 'Untable Keto', description: 'Crema artesanal de frutos secos y coco. Sin azúcar agregada, ideal para untar.', price: 950, category: 'Untables', image: new URL('@/assets/images/prod5.png', import.meta.url).href, stock: 20 },
  { id: 6, name: 'Galletas de Almendras', description: 'Crujientes galletitas de harina de almendras con semillas de chía. Pack x 8.', price: 1100, category: 'Galletería', image: new URL('@/assets/images/prod6.jpg', import.meta.url).href, stock: 3 },
]
</script>
