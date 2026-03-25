<template>
  <section class="relative h-screen w-full overflow-hidden">

    <!-- Slides -->
    <div class="absolute inset-0">
      <TransitionGroup name="crossfade">
        <div
          v-for="(slide, index) in slides"
          v-show="currentSlide === index"
          :key="index"
          class="absolute inset-0"
        >
          <img
            :src="slide.image"
            :alt="slide.alt"
            class="w-full h-full object-cover scale-105 transition-transform duration-[8000ms] ease-linear"
            :class="currentSlide === index ? 'scale-100' : 'scale-105'"
          />
        </div>
      </TransitionGroup>
    </div>

    <!-- Overlay -->
    <div class="absolute inset-0 hero-overlay z-10"></div>

    <!-- Elementos decorativos flotantes de fondo -->
    <div class="absolute inset-0 z-10 pointer-events-none overflow-hidden">
      <!-- Círculo top-right -->
      <div class="absolute -top-20 -right-20 w-96 h-96 rounded-full border border-white/10 animate-spin-slow"></div>
      <div class="absolute -top-10 -right-10 w-64 h-64 rounded-full border border-brand-orange/20"></div>
      <!-- Círculo bottom-left -->
      <div class="absolute -bottom-16 -left-16 w-80 h-80 rounded-full border border-white/10"></div>
      <!-- Línea vertical izquierda -->
      <div class="absolute left-10 top-1/4 bottom-1/4 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent hidden md:block"></div>
      <!-- Línea vertical derecha -->
      <div class="absolute right-10 top-1/4 bottom-1/4 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent hidden md:block"></div>
      <!-- Caption slide actual — esquina inferior izquierda -->
      <Transition name="caption">
        <div class="absolute bottom-16 left-10 hidden md:block">
          <p class="text-white/40 text-xs tracking-[0.2em] uppercase mb-1">Ahora mostrando</p>
          <p class="text-white/80 text-sm font-medium font-body">{{ slides[currentSlide].alt }}</p>
          <div class="mt-2 h-px w-24 bg-brand-orange/60"></div>
        </div>
      </Transition>
      <!-- Número de slide — esquina superior derecha -->
      <div class="absolute top-28 right-10 hidden md:flex flex-col items-end gap-1">
        <span class="font-display text-5xl font-bold text-white/10 leading-none">0{{ currentSlide + 1 }}</span>
        <span class="text-white/30 text-xs tracking-widest">/ 0{{ slides.length }}</span>
      </div>
    </div>

    <!-- Content -->
    <div class="relative z-20 h-full flex flex-col items-center justify-center text-center px-6 pt-24">

      <!-- Logo grande en hero -->
      <div class="mb-6 animate-fade-in">
        <span
          class="font-display font-bold tracking-widest select-none"
          style="font-size: clamp(5rem, 18vw, 14rem); color: rgba(246,82,29,0.18); letter-spacing: 0.15em; line-height: 1; text-shadow: none;"
        >CEKETO</span>
      </div>

      <!-- Tagline -->
      <p
        class="text-teal-light font-body text-sm md:text-base tracking-[0.3em] uppercase mb-4 opacity-0"
        style="animation: fadeInUp 0.8s 0.3s ease forwards"
      >
        Viví &bull; Sentí &bull; Comé
      </p>

      <!-- Headline -->
      <h1
        class="font-display text-5xl md:text-7xl lg:text-8xl text-white font-bold leading-tight mb-6 max-w-4xl opacity-0"
        style="animation: fadeInUp 0.8s 0.6s ease forwards"
      >
        Tu estilo de vida
        <span class="text-brand-orange italic">keto</span>
        empieza acá
      </h1>

      <!-- Subtitle -->
      <p
        class="font-body text-white/80 text-lg md:text-xl max-w-xl mb-10 leading-relaxed opacity-0"
        style="animation: fadeInUp 0.8s 0.9s ease forwards"
      >
        Alimentos cetogénicos artesanales. Sin azúcar, sin culpas, con todo el sabor.
      </p>

      <!-- CTAs -->
      <div
        class="flex flex-col sm:flex-row gap-4 opacity-0"
        style="animation: fadeInUp 0.8s 1.1s ease forwards"
      >
        <RouterLink to="/tienda" class="btn-primary text-base px-10 py-4 shadow-2xl">
          Explorar tienda
        </RouterLink>
        <RouterLink to="/#keto" class="btn-outline text-base px-10 py-4 border-white text-white hover:bg-white hover:text-keto-dark">
          ¿Qué es keto?
        </RouterLink>
      </div>
    </div>

    <!-- Slide indicators -->
    <div class="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex gap-3">
      <button
        v-for="(_, index) in slides"
        :key="index"
        class="transition-all duration-300 rounded-full"
        :class="currentSlide === index
          ? 'w-8 h-2 bg-brand-orange'
          : 'w-2 h-2 bg-white/50 hover:bg-white/80'"
        @click="goToSlide(index)"
      />
    </div>

    <!-- Scroll indicator -->
    <div class="absolute bottom-10 right-10 z-20 hidden md:flex flex-col items-center gap-2">
      <span class="text-white/60 text-xs tracking-widest uppercase">Scroll</span>
      <div class="w-px h-12 bg-gradient-to-b from-white/60 to-transparent animate-pulse mt-2"></div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

import hero1 from '@/assets/images/hero1.jpg'
import hero2 from '@/assets/images/hero2.jpg'
import hero3 from '@/assets/images/hero3.jpg'
import hero4 from '@/assets/images/hero4.jpg'
import muffins from '@/assets/images/prod4.jpg'

const slides = [
  { image: hero1, alt: 'Pan keto de naranja artesanal' },
  { image: hero2, alt: 'Café keto cremoso' },
  { image: hero3, alt: 'Tostadas de aguacate keto' },
  { image: hero4, alt: 'Lifestyle cetogénico' },
  { image: muffins, alt: 'Muffins proteicos sin azúcar' },
]

const currentSlide = ref(0)
let timer = null

function nextSlide() {
  currentSlide.value = (currentSlide.value + 1) % slides.length
}

function goToSlide(index) {
  currentSlide.value = index
  resetTimer()
}

function resetTimer() {
  clearInterval(timer)
  timer = setInterval(nextSlide, 5000)
}

onMounted(() => {
  timer = setInterval(nextSlide, 5000)
})

onUnmounted(() => clearInterval(timer))
</script>

<style scoped>
.crossfade-enter-active,
.crossfade-leave-active {
  transition: opacity 1.2s ease;
  position: absolute;
  inset: 0;
}
.crossfade-enter-from { opacity: 0; }
.crossfade-leave-to { opacity: 0; }

.caption-enter-active,
.caption-leave-active {
  transition: all 0.6s ease;
}
.caption-enter-from,
.caption-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(40px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

.animate-spin-slow {
  animation: spin-slow 30s linear infinite;
}
</style>
