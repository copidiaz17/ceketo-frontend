<template>
  <main class="min-h-screen bg-ck-crema relative pt-28 overflow-hidden">
    <BrandBackdrop variante="tienda" />

    <div class="relative z-10 max-w-7xl mx-auto px-5 md:px-6 py-10">

      <!-- Encabezado -->
      <div class="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span class="ck-eyebrow text-ck-naranja-t mb-3">Tienda online</span>
          <h1 class="ck-titulo">Tienda</h1>
          <p class="font-texto text-ck-tinta/60 mt-2">Todos nuestros productos cetogénicos artesanales</p>
        </div>

        <!-- Búsqueda -->
        <label class="tienda-buscar">
          <svg class="h-5 w-5 text-ck-tinta/40" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input v-model="search" type="text" placeholder="Buscar productos..." aria-label="Buscar productos" />
        </label>
      </div>

      <!-- Filtros: cada categoría con su color y su ícono -->
      <div class="flex flex-wrap gap-2.5 mb-10">
        <button
          @click="activeCategory = ''"
          class="chip"
          :class="{ activo: activeCategory === '' }"
          style="--c: #17302B; --ct: #FFFDF8"
        >Todos</button>
        <button
          v-for="(cat, i) in categories"
          :key="cat.codigo"
          @click="activeCategory = cat.codigo"
          class="chip"
          :class="{ activo: activeCategory === cat.codigo }"
          :style="{ '--c': estiloCategoria(cat.codigo, i).hex, '--ct': estiloCategoria(cat.codigo, i).texto }"
        >
          <span class="chip-icono"><BrandIcon :nombre="estiloCategoria(cat.codigo, i).icono" /></span>
          {{ cat.nombre }}
        </button>
      </div>

      <!-- Aviso: categoría a pedido -->
      <div v-if="esAPedido(activeCategory)" class="tienda-apedido mb-8">
        <span class="text-2xl">🎂</span>
        <p class="font-texto text-[15px] text-ck-tinta/80 leading-relaxed">
          <b class="text-ck-tinta">Los postres y tartas se hacen a pedido.</b>
          Se encargan con 2 días de anticipación y se reservan con una seña del 50% (transferencia o efectivo en el local).
          Agregalos al carrito y al finalizar elegís el día en el calendario. Van en un pedido aparte del resto de los productos.
        </p>
      </div>

      <!-- Cargando -->
      <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div v-for="i in 8" :key="i" class="rounded-[26px] bg-ck-blanco p-2.5 animate-pulse">
          <div class="h-56 rounded-[20px] bg-ck-tinta/[.06]"></div>
          <div class="p-4 space-y-3">
            <div class="h-4 bg-ck-tinta/[.07] rounded-full w-3/4"></div>
            <div class="h-7 bg-ck-tinta/[.07] rounded-full w-1/3 mt-4"></div>
          </div>
        </div>
      </div>

      <!-- Grilla -->
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

      <!-- Sin resultados -->
      <div v-if="!loading && filteredProducts.length === 0" class="text-center py-20">
        <div class="w-24 h-24 mx-auto mb-5 opacity-80"><BrandIcon nombre="palta" /></div>
        <p class="font-marca text-3xl text-ck-tinta/70">No encontramos productos</p>
        <p class="font-texto text-ck-tinta/50 mt-2">Probá con otra búsqueda o categoría</p>
      </div>

    </div>
  </main>
</template>

<script setup>
import { publico } from '@/brand/publico'
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import ProductCard from '@/components/ProductCard.vue'
import BrandBackdrop from '@/components/brand/BrandBackdrop.vue'
import BrandIcon from '@/components/brand/BrandIcon.vue'
import { estiloCategoria, esAPedido } from '@/brand/marca'

const route          = useRoute()
const activeCategory = ref(route.query.categoria || '')
const search         = ref('')
const allProducts    = ref([])
const categories     = ref([])
const loading        = ref(true)

// Categorías que NO se muestran en la tienda online (sí siguen en el admin).
// Market (MKT) se volvió a mostrar el 18/09/2026.
const CATEGORIAS_OCULTAS = []

const SIN_IMAGEN = publico('/images/sin-imagen.svg')

function adaptProduct(p) {
  return {
    id:          p.id,
    name:        p.nombre,
    description: p.categoria?.nombre || '',
    price:       parseFloat(p.precio),
    category:    p.categoria?.codigo || '',
    stock:       p.stock,
    image:       p.imagen || SIN_IMAGEN,
  }
}

const filteredProducts = computed(() =>
  allProducts.value.filter(p => {
    const cat = p.categoria?.codigo || ''
    if (CATEGORIAS_OCULTAS.includes(cat)) return false
    const matchCat    = !activeCategory.value || cat === activeCategory.value
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
    categories.value  = cats.filter(c => !CATEGORIAS_OCULTAS.includes(c.codigo))
  } catch {
    allProducts.value = []
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.tienda-buscar {
  display: flex;
  align-items: center;
  gap: .6rem;
  width: 100%;
  max-width: 340px;
  padding: .8rem 1.1rem;
  border-radius: 999px;
  background: #FFFDF8;
  box-shadow: inset 0 0 0 2px rgba(23,48,43,.08);
  transition: box-shadow .3s;
}
.tienda-buscar:focus-within { box-shadow: inset 0 0 0 2px #058D76, 0 10px 30px -18px rgba(5,141,118,.8); }
.tienda-buscar input {
  flex: 1;
  min-width: 0;
  background: transparent;
  outline: none;
  font: 400 15px/1 'Poppins', sans-serif;
  color: #17302B;
}
.tienda-buscar input::placeholder { color: rgba(23,48,43,.4); }

.chip {
  display: inline-flex;
  align-items: center;
  gap: .5rem;
  padding: .55rem 1rem .55rem .6rem;
  border-radius: 999px;
  background: #FFFDF8;
  color: #17302B;
  font: 600 12.5px/1 'Poppins', sans-serif;
  letter-spacing: .06em;
  text-transform: uppercase;   /* unifica los nombres de la base ("CONGELADOS ", "Dulces KETO"…) */
  box-shadow: inset 0 0 0 2px color-mix(in srgb, var(--c) 35%, transparent);
  transition: all .3s cubic-bezier(.3,1.4,.5,1);
}
.chip:first-child { padding-left: 1rem; }
.chip:hover { transform: translateY(-2px); box-shadow: inset 0 0 0 2px var(--c); }
.chip.activo { background: var(--c); color: var(--ct); box-shadow: 0 10px 22px -12px var(--c); }
.chip-icono {
  width: 26px; height: 26px;
  padding: 3px;
  border-radius: 50%;
  background: #FFFDF8;
  flex-shrink: 0;
}

.tienda-apedido {
  display: flex;
  align-items: flex-start;
  gap: .9rem;
  padding: 1rem 1.25rem;
  border-radius: 20px;
  background: #F3ECF2;
  box-shadow: inset 0 0 0 2px rgba(136,87,132,.25);
}

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
