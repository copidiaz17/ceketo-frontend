<template>
  <section class="py-24 bg-transparent overflow-hidden">
    <div class="max-w-7xl mx-auto px-6">
      <div
        class="relative rounded-3xl overflow-hidden gradient-animated p-12 md:p-20 text-center reveal"
        ref="sectionRef"
      >
        <!-- Decorative circles -->
        <div class="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div class="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3"></div>
        <div class="absolute top-1/2 left-1/4 w-32 h-32 bg-white/5 rounded-full"></div>

        <div class="relative z-10">
          <span class="badge bg-white/20 text-white mb-4 inline-block backdrop-blur-sm">
            Newsletter
          </span>
          <h2 class="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            Recibí recetas keto<br />y descuentos exclusivos
          </h2>
          <p class="font-body text-white/80 text-lg mb-10 max-w-lg mx-auto">
            Unite a más de 500 personas que ya transformaron su alimentación con CEKETO.
          </p>

          <!-- Form -->
          <form @submit.prevent="subscribe" class="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              v-model="email"
              type="email"
              placeholder="tu@email.com"
              required
              class="flex-1 px-6 py-4 rounded-full font-body text-keto-dark bg-white/95 backdrop-blur-sm
                     placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white
                     transition-all duration-300 shadow-lg"
            />
            <button
              type="submit"
              :disabled="subscribed"
              class="px-8 py-4 bg-keto-dark text-white rounded-full font-body font-medium tracking-wide
                     transition-all duration-300 hover:bg-keto-dark/80 hover:scale-105 active:scale-95
                     shadow-lg disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {{ subscribed ? '¡Suscripto! ✓' : 'Suscribirme' }}
            </button>
          </form>

          <p class="text-white/50 text-xs mt-4">
            Sin spam. Podés darte de baja cuando quieras.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { useScrollReveal } from '@/composables/useScrollReveal'

const sectionRef = ref(null)
const email = ref('')
const subscribed = ref(false)

useScrollReveal([sectionRef])

function subscribe() {
  if (!email.value) return
  subscribed.value = true
  email.value = ''
  setTimeout(() => { subscribed.value = false }, 4000)
}
</script>
