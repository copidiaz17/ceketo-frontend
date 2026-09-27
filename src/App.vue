<template>
  <div :class="{ tienda: !isAdmin }">
    <Navbar v-if="!isAdmin" />
    <RouterView v-slot="{ Component }">
      <Transition name="page" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>
    <AppFooter v-if="!isAdmin" />

    <!-- Aviso de demo (solo en `npm run demo`) -->
    <div v-if="esDemo && !isAdmin && avisoDemo" class="aviso-demo">
      <span>Demo de diseño · los pedidos no se envían</span>
      <button aria-label="Cerrar aviso" @click="avisoDemo = false">×</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import Navbar from '@/components/Navbar.vue'
import AppFooter from '@/components/AppFooter.vue'

const route = useRoute()
const isAdmin = computed(() => route.path.startsWith('/admin'))
const esDemo = !!import.meta.env.VITE_DEMO
const avisoDemo = ref(true)
</script>

<style>
.page-enter-active,
.page-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}

.aviso-demo {
  position: fixed;
  right: 16px;
  bottom: 16px;
  z-index: 60;
  display: flex;
  align-items: center;
  gap: .6rem;
  padding: .45rem .5rem .45rem .9rem;
  border-radius: 999px;
  background: #17302B;
  color: #FFFDF8;
  font: 500 12px/1 'Poppins', sans-serif;
  box-shadow: 0 10px 30px -12px rgba(0,0,0,.5);
}
.aviso-demo button {
  width: 22px; height: 22px;
  border-radius: 50%;
  background: rgba(255,255,255,.15);
  line-height: 1;
}
</style>
