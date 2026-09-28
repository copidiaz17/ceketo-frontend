<template>
  <nav
    class="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
    :class="scrolled ? 'nav-ck-solid py-2' : 'nav-ck py-4'"
  >
    <!-- barra de progreso de lectura con los 4 colores -->
    <div class="nav-progreso" :style="{ transform: `scaleX(${progreso})` }"></div>

    <div class="max-w-7xl mx-auto px-5 md:px-6 flex items-center justify-between gap-4">

      <!-- Logo: isotipo (moneda 3D) + "ceketo" en naranja + slogan en tres colores -->
      <RouterLink to="/" class="nav-logo flex items-center gap-3" aria-label="CEKETO, ir al inicio">
        <MonedaIsotipo :tam="scrolled ? '40px' : '48px'" frente="verde" dorso="naranja" />
        <span class="flex flex-col leading-none">
          <span class="nav-ceketo font-marca text-ck-naranja transition-all duration-500" :class="scrolled ? 'text-[1.7rem]' : 'text-[2rem]'">ceketo</span>
          <span class="nav-slogan font-etiqueta text-[10.5px] tracking-[0.24em] mt-1">
            <!-- colores puros de la paleta: es parte del logo -->
            <span class="text-ck-naranja">VIVI</span>
            <span class="text-ck-verde">SENTI</span>
            <span class="text-ck-violeta">COME</span>
          </span>
        </span>
      </RouterLink>

      <!-- Links desktop -->
      <div class="hidden md:flex items-center gap-9">
        <RouterLink
          v-for="link in navLinks"
          :key="link.path"
          :to="link.path"
          :exact-active-class="link.path.includes('#') ? '' : 'nav-activo'"
          active-class=""
          class="nav-link font-texto text-[15px] font-medium text-ck-tinta/80 hover:text-ck-tinta"
          :style="{ '--subrayado': link.color }"
        >
          {{ link.label }}
        </RouterLink>
      </div>

      <!-- Acciones -->
      <div class="flex items-center gap-3 md:gap-4">
        <RouterLink id="carrito-icono" to="/carrito" class="relative group" aria-label="Ver carrito">
          <div class="p-2.5 rounded-full text-ck-tinta transition-all duration-300 group-hover:bg-ck-verde/10" :class="{ 'nav-bump': bump }">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <span
            v-if="cartStore.totalItems > 0"
            class="absolute -top-0.5 -right-0.5 bg-ck-violeta text-white text-[11px] min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center font-semibold font-texto shadow"
            :class="{ 'nav-bump': bump }"
          >
            {{ cartStore.totalItems }}
          </span>
        </RouterLink>

        <RouterLink
          v-if="!esDemo"
          to="/admin/login"
          class="hidden lg:flex items-center gap-1.5 text-ck-tinta/40 hover:text-ck-verde-t transition-colors duration-300 text-xs font-texto"
          title="Panel administrativo"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Admin
        </RouterLink>

        <RouterLink to="/tienda" class="hidden md:inline-flex ck-btn-naranja !py-2.5 !px-5 text-sm">
          Ver tienda
        </RouterLink>

        <!-- Menú celular -->
        <button
          class="md:hidden text-ck-tinta p-2 rounded-xl hover:bg-ck-verde/10 transition-colors"
          :aria-expanded="mobileOpen"
          aria-label="Abrir menú"
          @click="mobileOpen = !mobileOpen"
        >
          <svg v-if="!mobileOpen" xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-width="2" d="M4 7h16M4 12h11M4 17h16" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Menú celular: panel crema con links grandes y el color de cada sección -->
    <Transition name="menu-cel">
      <div v-if="mobileOpen" class="md:hidden nav-menu-cel">
        <RouterLink
          v-for="(link, k) in navLinks"
          :key="link.path"
          :to="link.path"
          class="flex items-center justify-between py-4 border-b border-ck-tinta/10"
          :style="{ '--k': k }"
          @click="mobileOpen = false"
        >
          <span class="font-marca text-3xl" :style="{ color: link.colorTexto }">{{ link.label }}</span>
          <span class="w-9 h-9"><BrandIcon :nombre="link.icono" /></span>
        </RouterLink>
        <RouterLink to="/tienda" class="ck-btn-naranja w-full mt-6" @click="mobileOpen = false">
          Ver tienda
        </RouterLink>
        <!-- Acceso al panel desde el celular (se había perdido en el rediseño) -->
        <RouterLink
          v-if="!esDemo"
          to="/admin/login"
          class="flex items-center justify-center gap-2 w-full mt-3 py-3 rounded-full border border-ck-tinta/15 text-ck-tinta/60 font-texto text-sm font-medium"
          @click="mobileOpen = false"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Panel admin
        </RouterLink>
      </div>
    </Transition>
  </nav>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import MonedaIsotipo from '@/components/brand/MonedaIsotipo.vue'
import BrandIcon from '@/components/brand/BrandIcon.vue'

const cartStore = useCartStore()
const route = useRoute()
const scrolled = ref(false)
const mobileOpen = ref(false)
const progreso = ref(0)
const bump = ref(false)
const esDemo = !!import.meta.env.VITE_DEMO

const navLinks = [
  { label: 'Inicio',   path: '/',          color: '#F6521D', colorTexto: '#C44117', icono: 'palta' },
  { label: 'Tienda',   path: '/tienda',    color: '#058D76', colorTexto: '#047764', icono: 'kiwi' },
  { label: 'Nosotros', path: '/nosotros',  color: '#885784', colorTexto: '#885784', icono: 'hojas' },
  { label: 'Contacto', path: '/#contacto', color: '#9CCC66', colorTexto: '#557038', icono: 'gotas' },
]

// El número del carrito "salta" cada vez que se agrega algo
watch(() => cartStore.totalItems, (nuevo, viejo) => {
  if (nuevo > viejo) {
    bump.value = false
    requestAnimationFrame(() => { bump.value = true; setTimeout(() => (bump.value = false), 600) })
  }
})

watch(() => route.fullPath, () => { mobileOpen.value = false })

function handleScroll() {
  scrolled.value = window.scrollY > 40
  const h = document.documentElement.scrollHeight - window.innerHeight
  progreso.value = h > 0 ? Math.min(1, window.scrollY / h) : 0
}

onMounted(() => { window.addEventListener('scroll', handleScroll, { passive: true }); handleScroll() })
onUnmounted(() => window.removeEventListener('scroll', handleScroll))
</script>

<style scoped>
.nav-ck {
  background: linear-gradient(to bottom, rgba(247,241,230,.92), rgba(247,241,230,.6));
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
.nav-ck-solid {
  background: rgba(255,253,248,.94);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 8px 30px -18px rgba(23,48,43,.45);
}
.nav-progreso {
  position: absolute;
  left: 0; right: 0; bottom: 0;
  height: 3px;
  transform-origin: 0 50%;
  background: linear-gradient(90deg, #F6521D 0 25%, #058D76 25% 50%, #885784 50% 75%, #9CCC66 75% 100%);
  transition: transform .15s linear;
}

.nav-ceketo { letter-spacing: .01em; line-height: .8; }
.nav-slogan span + span { margin-left: .5em; }
.nav-logo:hover .nav-ceketo { animation: nav-ola .6s ease; }
@keyframes nav-ola {
  30% { transform: translateY(-3px) rotate(-2deg); }
  60% { transform: translateY(1px) rotate(1deg); }
}

.nav-link { position: relative; padding: 6px 0; transition: color .3s; }
.nav-link::after {
  content: '';
  position: absolute;
  left: 0; bottom: -2px;
  width: 100%; height: 3px;
  border-radius: 3px;
  background: var(--subrayado);
  transform: scaleX(0);
  transform-origin: 0 50%;
  transition: transform .35s cubic-bezier(.2,.8,.2,1);
}
.nav-link:hover::after,
.nav-link.nav-activo::after { transform: scaleX(1); }
.nav-link.nav-activo { color: #17302B; }

.nav-bump { animation: nav-bump .6s cubic-bezier(.3,1.6,.5,1); }
@keyframes nav-bump {
  0% { transform: scale(1); }
  35% { transform: scale(1.35) rotate(-8deg); }
  70% { transform: scale(.92); }
  100% { transform: scale(1); }
}

.nav-menu-cel {
  background: #FFFDF8;
  border-top: 1px solid rgba(23,48,43,.08);
  padding: .5rem 1.5rem 1.75rem;
  box-shadow: 0 30px 40px -30px rgba(23,48,43,.5);
}
.nav-menu-cel a:not(.ck-btn-naranja) {
  animation: menu-item .45s cubic-bezier(.2,.8,.2,1) both;
  animation-delay: calc(var(--k) * 60ms);
}
@keyframes menu-item { from { opacity: 0; transform: translateX(-18px); } }
.menu-cel-enter-active, .menu-cel-leave-active { transition: opacity .3s ease, transform .3s ease; }
.menu-cel-enter-from, .menu-cel-leave-to { opacity: 0; transform: translateY(-10px); }
</style>
