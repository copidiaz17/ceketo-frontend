<template>
  <section class="py-24 bg-transparent relative">
    <div class="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-orange/30 to-transparent"></div>

    <div class="max-w-7xl mx-auto px-6">
      <div class="text-center mb-16 reveal" ref="headerRef">
        <span class="badge bg-brand-orange/15 text-brand-orange mb-4 inline-block border border-brand-orange/20">Explorá por categoría</span>
        <h2 class="section-title">
          Encontrá lo que <span class="text-brand-orange italic">necesitás</span>
        </h2>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <RouterLink
          v-for="(cat, i) in categories"
          :key="cat.codigo"
          :to="`/tienda?categoria=${cat.codigo}`"
          class="group relative overflow-hidden rounded-2xl aspect-square cat-card"
          :style="`animation-delay: ${i * 80}ms`"
        >
          <div
            class="absolute inset-0 transition-all duration-500 group-hover:scale-110"
            :class="cat.bg"
          ></div>
          <div class="absolute inset-0 bg-keto-dark/30 group-hover:bg-keto-dark/10 transition-all duration-300"></div>

          <div class="relative z-10 h-full flex flex-col items-center justify-center gap-3 p-4">
            <!-- Miniatura de un producto real de la categoría -->
            <img
              v-if="cat.imagen"
              :src="thumb(cat.imagen)"
              :alt="cat.nombre"
              loading="lazy"
              class="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover ring-2 ring-white/70 shadow-lg
                     transition-transform duration-300 group-hover:scale-125 group-hover:-translate-y-1"
            />
            <!-- Respaldo: emoji si la categoría no tiene ningún producto con foto -->
            <span
              v-else
              class="text-4xl md:text-5xl transition-transform duration-300 group-hover:scale-125 group-hover:-translate-y-1"
            >{{ cat.emoji }}</span>

            <span class="font-body font-semibold text-xs md:text-sm text-center text-white leading-tight transition-all duration-300">
              {{ cat.nombre }}
            </span>
          </div>

          <div class="absolute inset-0 rounded-2xl ring-0 group-hover:ring-2 ring-teal transition-all duration-300"></div>
        </RouterLink>
      </div>
    </div>

    <div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useScrollReveal } from '@/composables/useScrollReveal'

const headerRef = ref(null)
useScrollReveal([headerRef])

// Categorías que NO se muestran en la web (sí siguen en el admin)
const OCULTAS = ['MKT']

// Paleta de fondos (se asigna por posición)
const BGS = [
  'bg-purple-600/40 group-hover:bg-purple-600/60',
  'bg-amber-800/40 group-hover:bg-amber-800/60',
  'bg-amber-500/40 group-hover:bg-amber-500/60',
  'bg-teal/40 group-hover:bg-teal/60',
  'bg-orange-500/40 group-hover:bg-orange-500/60',
  'bg-pink-700/40 group-hover:bg-pink-700/60',
  'bg-emerald-600/40 group-hover:bg-emerald-600/60',
  'bg-rose-600/40 group-hover:bg-rose-600/60',
]

// Emoji de respaldo por código (si la categoría no tiene ningún producto con foto)
const EMOJI = { BYM: '🧁', CHY: '🍫', CON: '🍬', DUK: '🍯', PAK: '🍞', PYE: '🥟', PYT: '🥧' }

const categories = ref([])

// Miniatura optimizada de Cloudinary (recorte cuadrado chico)
function thumb(url) {
  if (!url || !url.includes('cloudinary.com')) return url
  return url.replace('/upload/', '/upload/c_fill,w_200,h_200,q_auto,f_auto/')
}

onMounted(async () => {
  try {
    const [{ data: cats }, { data: prods }] = await Promise.all([
      axios.get('/api/categorias'),
      axios.get('/api/productos?limit=500'),
    ])
    categories.value = cats
      .filter(c => !OCULTAS.includes(c.codigo))
      .map((c, i) => {
        // Primer producto de esa categoría que tenga imagen → se usa de miniatura
        const prod = prods.find(p => p.categoria?.codigo === c.codigo && p.imagen)
        return {
          codigo: c.codigo,
          nombre: c.nombre,
          imagen: prod?.imagen || null,
          emoji:  EMOJI[c.codigo] || '🥑',
          bg:     BGS[i % BGS.length],
        }
      })
  } catch {
    categories.value = []
  }
})
</script>

<style scoped>
.cat-card {
  opacity: 0;
  transform: translateY(16px);
  animation: catFadeIn 0.5s ease forwards;
}
@keyframes catFadeIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
