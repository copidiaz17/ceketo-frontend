<template>
  <div class="min-h-screen bg-[#FCDFD2] flex">

    <!-- Overlay mobile -->
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 z-30 bg-black/60 lg:hidden"
      @click="sidebarOpen = false"
    ></div>

    <!-- Sidebar -->
    <aside
      class="fixed top-0 left-0 bottom-0 z-40 w-64 bg-brand-green border-r border-white/20 flex flex-col
             transform transition-transform duration-300 ease-in-out
             lg:relative lg:top-auto lg:bottom-auto lg:z-auto lg:translate-x-0"
      :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
    >
      <!-- Brand -->
      <div class="p-6 border-b border-white/20">
        <span class="font-display text-2xl font-bold text-white tracking-widest">CEKETO</span>
        <p class="font-body text-xs text-white/80 mt-1 uppercase tracking-wider">
          {{ rolLabel }}
        </p>
        <p class="font-body text-xs text-white/50 mt-0.5">{{ usuarioActual }}</p>
      </div>

      <!-- Nav -->
      <nav class="flex-1 p-4 space-y-1 overflow-y-auto">
        <RouterLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="flex items-center gap-3 px-4 py-3 rounded-xl font-body text-sm transition-all duration-200"
          :class="isActive(link.to) ? 'bg-white/20 text-white font-semibold' : 'text-white/80 hover:bg-white/15 hover:text-white'"
          @click="sidebarOpen = false"
        >
          <span class="text-lg flex-shrink-0">{{ link.icon }}</span>
          <span class="flex-1">{{ link.label }}</span>
          <!-- Badge stock bajo -->
          <span
            v-if="link.badge && stockBajoCount > 0"
            class="bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold"
          >{{ stockBajoCount }}</span>
        </RouterLink>
      </nav>

      <!-- Footer -->
      <div class="p-4 border-t border-white/20 space-y-1">
        <RouterLink
          to="/"
          class="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-body text-sm text-white/60 hover:text-white hover:bg-white/15 transition-all duration-200"
        >
          <span class="text-lg">🌐</span>
          Ver tienda
        </RouterLink>
        <button
          @click="logout"
          class="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-body text-sm text-white/60 hover:text-red-300 hover:bg-red-400/20 transition-all duration-200"
        >
          <span class="text-lg">🚪</span>
          Cerrar sesión
        </button>
      </div>
    </aside>

    <!-- Content -->
    <main class="flex-1 overflow-y-auto min-w-0">
      <!-- Barra superior mobile con hamburger -->
      <div class="lg:hidden flex items-center gap-3 px-4 py-3 bg-brand-green border-b border-white/20 sticky top-0 z-20">
        <button
          @click="sidebarOpen = true"
          class="text-white/60 hover:text-white p-1 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span class="font-display text-white font-bold tracking-widest text-lg">CEKETO</span>
        <span class="font-body text-xs text-teal uppercase tracking-wider">{{ rolLabel }}</span>
      </div>
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route  = useRoute()
const router = useRouter()
const stockBajoCount = ref(0)
const sidebarOpen    = ref(false)

const usuarioActual = localStorage.getItem('ceketo_admin') || ''
const rolActual     = localStorage.getItem('ceketo_rol') || 'admin'

const rolLabel = rolActual === 'fabrica' ? 'Fábrica' : 'Admin'

const ALL_LINKS = [
  { to: '/admin/dashboard',  icon: '📊', label: 'Dashboard',      roles: ['admin'] },
  { to: '/admin/produccion', icon: '📦', label: 'Producción',     roles: ['admin', 'fabrica'] },
  { to: '/admin/ventas',     icon: '🛒', label: 'Ventas',         roles: ['admin'] },
  { to: '/admin/pedidos',    icon: '📋', label: 'Pedidos online',  roles: ['admin'] },
  { to: '/admin/productos',  icon: '🥑', label: 'Productos',      roles: ['admin'], badge: true },
  { to: '/admin/movimientos',icon: '↕️', label: 'Movimientos',    roles: ['admin'] },
  { to: '/admin/stock',      icon: '🗃️', label: 'Stock',          roles: ['admin', 'fabrica'], badge: true },
  { to: '/admin/gastos',     icon: '💸', label: 'Gastos',         roles: ['admin'] },
  { to: '/admin/cuentas',    icon: '🤝', label: 'Cta. Corriente',  roles: ['admin'] },
  { to: '/admin/categorias', icon: '🏷️', label: 'Categorías',     roles: ['admin'] },
]

const navLinks = computed(() => ALL_LINKS.filter(l => l.roles.includes(rolActual)))

function isActive(path) {
  return route.path.startsWith(path)
}

function logout() {
  localStorage.removeItem('ceketo_token')
  localStorage.removeItem('ceketo_admin')
  localStorage.removeItem('ceketo_rol')
  router.push('/admin/login')
}

onMounted(async () => {
  try {
    const { data } = await axios.get('/api/admin/stock-bajo/count')
    stockBajoCount.value = data.count
  } catch {}
})
</script>
