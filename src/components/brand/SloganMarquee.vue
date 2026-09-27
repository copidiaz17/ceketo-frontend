<template>
  <!-- el marco recorta los bordes de la banda inclinada (evita scroll horizontal en celular) -->
  <div class="sm-marco" :class="{ 'sm-marco-inclinado': inclinado }" aria-hidden="true">
    <div class="sm" :class="[`sm-${fondo}`, { 'sm-inclinado': inclinado }]">
      <div class="sm-pista" :class="{ 'sm-reversa': reversa }" :style="{ animationDuration: `${duracion}s` }">
        <template v-for="n in 2" :key="n">
          <span v-for="(item, k) in secuencia" :key="`${n}-${k}`" class="sm-item">
            <span class="sm-palabra" :style="{ color: item.color }">{{ item.palabra }}</span>
            <span class="sm-icono"><BrandIcon :nombre="item.icono" :color="colorIcono" /></span>
          </span>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
// Banda "VIVI SENTI COME" que corre de costado (como en el manual de marca).
import { computed } from 'vue'
import BrandIcon from './BrandIcon.vue'

const props = defineProps({
  fondo: { type: String, default: 'verde' },     // verde | noche | crema | naranja | violeta
  reversa: { type: Boolean, default: false },
  inclinado: { type: Boolean, default: false },
  duracion: { type: Number, default: 38 },
})

const PALABRAS = ['VIVI', 'SENTI', 'COME']
// en un solo color se usan íconos que se leen como silueta (kiwi/diana quedarían como un círculo)
const ICONOS = ['palta', 'hojas', 'rama', 'melon', 'cuchara', 'gota']

// Colores de las palabras según el fondo (siempre de la paleta)
const COLORES = {
  verde:   ['#FFFDF8', '#9CCC66', '#FFFDF8'],
  noche:   ['#FFFDF8', '#9CCC66', '#FFFDF8'],
  crema:   ['#F6521D', '#058D76', '#885784'],
  naranja: ['#FFFDF8', '#17302B', '#FFFDF8'],
  violeta: ['#FFFDF8', '#9CCC66', '#FFFDF8'],
}

const colorIcono = computed(() => (props.fondo === 'crema' ? null : 'rgba(255,253,248,.9)'))

const secuencia = computed(() => {
  const cols = COLORES[props.fondo] || COLORES.verde
  const out = []
  for (let v = 0; v < 2; v++) {
    PALABRAS.forEach((p, i) => out.push({ palabra: p, color: cols[i], icono: ICONOS[(v * 3 + i) % ICONOS.length] }))
  }
  return out
})
</script>

<style scoped>
.sm-marco { overflow: hidden; }
.sm-marco-inclinado { padding: 1.4rem 0; margin: -1.4rem 0; position: relative; z-index: 2; pointer-events: none; }
.sm-marco-inclinado .sm { pointer-events: auto; }
.sm {
  position: relative;
  overflow: hidden;
  padding: 1.1rem 0;
  user-select: none;
}
.sm-verde   { background: #058D76; }
.sm-noche   { background: #0B3B34; }
.sm-crema   { background: #F7F1E6; }
.sm-naranja { background: #F6521D; }
.sm-violeta { background: #885784; }
.sm-inclinado { transform: rotate(-1.6deg) scale(1.03); box-shadow: 0 18px 40px -24px rgba(23,48,43,.55); }

.sm-pista {
  display: flex;
  width: max-content;
  animation: sm-correr linear infinite;
}
.sm-reversa { animation-direction: reverse; }
.sm:hover .sm-pista { animation-play-state: paused; }

.sm-item { display: inline-flex; align-items: center; }
.sm-palabra {
  font-family: 'CK Comodo', 'Poppins', sans-serif;
  font-size: clamp(1.7rem, 4.2vw, 3.3rem);
  letter-spacing: .08em;
  line-height: 1;
  padding: 0 .55em;
}
.sm-icono {
  display: inline-block;
  width: clamp(1.6rem, 3.4vw, 2.6rem);
  height: clamp(1.6rem, 3.4vw, 2.6rem);
  animation: sm-rotar 9s linear infinite;
}

@keyframes sm-correr {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
@keyframes sm-rotar {
  to { transform: rotate(360deg); }
}
</style>
