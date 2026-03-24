<template>
  <nav
    class="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
    :class="scrolled ? 'nav-solid py-3 shadow-lg' : 'nav-glass py-5'"
  >
    <div class="max-w-7xl mx-auto px-6 flex items-center justify-between">

      <!-- Brand text (sin logo para no repetir el del hero) -->
      <RouterLink to="/" class="flex items-center gap-2 group">
        <span class="text-brand-orange text-xl transition-all duration-300 group-hover:rotate-12 inline-block">🫒</span>
        <div class="flex flex-col leading-none gap-0.5">
          <span class="font-display font-bold text-gray-900 text-2xl tracking-[0.15em] transition-colors duration-300 group-hover:text-brand-orange">
            CEKETO
          </span>
          <span class="font-body text-brand-orange font-semibold text-[11px] tracking-[0.2em] uppercase">
            Viví · Sentí · Comé
          </span>
        </div>
      </RouterLink>

      <!-- Links desktop -->
      <div class="hidden md:flex items-center gap-10">
        <RouterLink
          v-for="link in navLinks"
          :key="link.path"
          :to="link.path"
          class="relative text-sm font-medium tracking-wide text-gray-700 transition-colors duration-300 hover:text-brand-orange after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-brand-orange after:transition-all after:duration-300 hover:after:w-full"
        >
          {{ link.label }}
        </RouterLink>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-4">
        <!-- Cart -->
        <RouterLink to="/carrito" class="relative group">
          <div class="p-2 rounded-full text-gray-700 transition-all duration-300 group-hover:bg-brand-orange/15">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <span
            v-if="cartStore.totalItems > 0"
            class="absolute -top-1 -right-1 bg-keto-orange text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium animate-bounce"
          >
            {{ cartStore.totalItems }}
          </span>
        </RouterLink>

        <!-- Admin -->
        <RouterLink
          to="/admin/login"
          class="hidden md:flex items-center gap-1.5 text-gray-400 hover:text-brand-orange transition-colors duration-300 text-xs font-body"
          title="Panel administrativo"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Admin
        </RouterLink>

        <!-- CTA Button -->
        <RouterLink to="/tienda" class="hidden md:block btn-primary text-sm py-2 px-5">
          Ver Tienda
        </RouterLink>

        <!-- Hamburger mobile -->
        <button
          class="md:hidden text-gray-700 p-2 rounded-lg hover:bg-brand-orange/10 transition-colors"
          @click="mobileOpen = !mobileOpen"
        >
          <svg v-if="!mobileOpen" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Mobile menu -->
    <Transition name="slide-down">
      <div
        v-if="mobileOpen"
        class="md:hidden bg-brand-cream/97 backdrop-blur-md border-t border-brand-orange/15 px-6 py-4"
      >
        <div class="flex flex-col gap-4">
          <RouterLink
            v-for="link in navLinks"
            :key="link.path"
            :to="link.path"
            class="text-gray-800 text-base font-medium py-2 border-b border-gray-200 hover:text-brand-orange transition-colors"
            @click="mobileOpen = false"
          >
            {{ link.label }}
          </RouterLink>
          <RouterLink
            to="/tienda"
            class="btn-primary text-center mt-2"
            @click="mobileOpen = false"
          >
            Ver Tienda
          </RouterLink>
        </div>
      </div>
    </Transition>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useCartStore } from '@/stores/cart'

const cartStore = useCartStore()
const scrolled = ref(false)
const mobileOpen = ref(false)

const navLinks = [
  { label: 'Inicio', path: '/' },
  { label: 'Tienda', path: '/tienda' },
  { label: 'Nosotros', path: '/nosotros' },
  { label: 'Contacto', path: '/#contacto' },
]

function handleScroll() {
  scrolled.value = window.scrollY > 80
}

onMounted(() => window.addEventListener('scroll', handleScroll))
onUnmounted(() => window.removeEventListener('scroll', handleScroll))
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
