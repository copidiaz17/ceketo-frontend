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
            <span class="text-4xl md:text-5xl transition-transform duration-300 group-hover:scale-125 group-hover:-translate-y-1">
              {{ cat.icon }}
            </span>
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
import { ref } from 'vue'
import { useScrollReveal } from '@/composables/useScrollReveal'

const headerRef = ref(null)
useScrollReveal([headerRef])

const categories = [
  { codigo: 'BYM', nombre: 'Budines y Muffins', icon: '🧁', bg: 'bg-purple-600/40 group-hover:bg-purple-600/60' },
  { codigo: 'CHC', nombre: 'Chocolates',         icon: '🍫', bg: 'bg-amber-800/40 group-hover:bg-amber-800/60' },
  { codigo: 'DUL', nombre: 'Dulces',              icon: '🍯', bg: 'bg-amber-500/40 group-hover:bg-amber-500/60' },
  { codigo: 'PY0', nombre: 'Panes y Otros',       icon: '🍞', bg: 'bg-teal/40 group-hover:bg-teal/60' },
  { codigo: 'PAS', nombre: 'Pastas',              icon: '🍝', bg: 'bg-orange-500/40 group-hover:bg-orange-500/60' },
  { codigo: 'PYT', nombre: 'Postres y Tartas',    icon: '🥧', bg: 'bg-pink-700/40 group-hover:bg-pink-700/60' },
]
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
