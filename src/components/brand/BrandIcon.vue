<template>
  <svg
    :viewBox="icono.viewBox"
    class="brand-icon"
    :class="`bi-${nombre}`"
    aria-hidden="true"
    focusable="false"
  >
    <path
      v-for="(p, i) in icono.paths"
      :key="i"
      :d="p.d"
      :fill="pintar(p.fill)"
      :fill-rule="p.rule || null"
      :style="{ '--i': i }"
    />
  </svg>
</template>

<script setup>
// Ícono suelto de la marca en SVG (vectores sacados del .ai del manual).
// color: pinta todo de un solo color (ej. 'currentColor' o '#fff')
// cambiar: reemplaza colores puntuales, ej. { '#058d77': '#fff' }
import { computed } from 'vue'
import { ICONS } from '@/assets/brand/icons.js'

const props = defineProps({
  nombre: { type: String, required: true },
  color: { type: String, default: null },
  cambiar: { type: Object, default: null },
})

const icono = computed(() => ICONS[props.nombre] || ICONS.palta)

function pintar(fill) {
  if (fill === 'none') return 'none'
  if (props.color) return props.color
  if (props.cambiar && props.cambiar[fill]) return props.cambiar[fill]
  return fill
}
</script>

<style scoped>
.brand-icon { display: block; width: 100%; height: 100%; overflow: visible; }
</style>
