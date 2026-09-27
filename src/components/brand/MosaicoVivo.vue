<template>
  <div ref="raiz" class="mv-escena" :class="{ 'mv-visible': visible }">
    <div class="mv-grilla" v-tilt="10">
      <div
        v-for="(c, k) in CELDAS"
        :key="c.id"
        class="mv-celda"
        :class="[c.clase, { 'mv-gira': girando === k }]"
        :style="{
          backgroundPosition: c.pos,
          '--prof': `${c.prof}px`,
          '--orden': k,
        }"
      ></div>
    </div>
    <div class="mv-sombra"></div>
  </div>
</template>

<script setup>
// El mosaico de la marca armado con sus 8 azulejos (un solo SVG recortado por celda).
// Entra girando en 3D, se inclina con el mouse (capas a distinta profundidad)
// y cada tanto un azulejo da una vuelta: "mosaico vivo".
import { ref, onMounted, onUnmounted } from 'vue'

const CELDAS = [
  { id: 'diana',   pos: '0% 0%',     prof: 30, clase: '' },
  { id: 'arco',    pos: '50% 0%',    prof: 64, clase: 'mv-arco' },
  { id: 'hojas',   pos: '100% 0%',   prof: 22, clase: '' },
  { id: 'gotas',   pos: '0% 50%',    prof: 44, clase: '' },
  { id: 'melones', pos: '100% 50%',  prof: 38, clase: '' },
  { id: 'rama',    pos: '0% 100%',   prof: 18, clase: '' },
  { id: 'cuchara', pos: '50% 100%',  prof: 50, clase: '' },
  { id: 'kiwi',    pos: '100% 100%', prof: 26, clase: '' },
]

const raiz = ref(null)
const visible = ref(false)
const girando = ref(-1)
let io = null
let timer = 0

function girarUna() {
  // no repetir la misma dos veces seguidas
  let k
  do { k = Math.floor(Math.random() * CELDAS.length) } while (k === girando.value)
  girando.value = k
  setTimeout(() => { if (girando.value === k) girando.value = -1 }, 1300)
}

onMounted(() => {
  io = new IntersectionObserver(([e]) => {
    if (e.isIntersecting) {
      visible.value = true
      if (!timer && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        timer = setInterval(girarUna, 3200)
      }
    } else if (timer) {
      clearInterval(timer); timer = 0
    }
  }, { threshold: 0.25 })
  io.observe(raiz.value)
})

onUnmounted(() => { io?.disconnect(); clearInterval(timer) })
</script>

<style scoped>
.mv-escena {
  position: relative;
  width: 100%;
  max-width: 460px;
  margin: 0 auto;
  perspective: 1200px;
}
.mv-grilla {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: 7px;
  aspect-ratio: 1;
  transform-style: preserve-3d;
  transition: gap .5s ease;
}
.mv-grilla:hover { gap: 12px; }

.mv-celda {
  border-radius: 14px;
  background-image: url('/marca/mosaico.svg');
  background-size: 300% 300%;
  background-repeat: no-repeat;
  box-shadow: 0 10px 22px -12px rgba(11, 59, 52, .55);
  /* entrada: cada azulejo gira desde el costado, uno detrás de otro */
  transform: translateZ(0) rotateY(-95deg) scale(.8);
  opacity: 0;
  transition:
    transform .9s cubic-bezier(.2,.8,.2,1) calc(var(--orden) * 90ms),
    opacity .6s ease calc(var(--orden) * 90ms);
}
.mv-visible .mv-celda {
  transform: translateZ(calc(var(--prof) * .2)) rotateY(0deg) scale(1);
  opacity: 1;
}
/* con el mouse encima, los azulejos se separan en capas (profundidad real) */
.mv-grilla.inclinando .mv-celda {
  transform: translateZ(var(--prof)) rotateY(0deg) scale(1);
}
.mv-arco {
  grid-column: 2;
  grid-row: 1 / span 2;
  background-size: 300% 150%;
}
/* vueltita periódica */
.mv-visible .mv-celda.mv-gira {
  animation: mv-vuelta 1.2s cubic-bezier(.5,0,.3,1);
}
@keyframes mv-vuelta {
  0%   { transform: translateZ(calc(var(--prof) * .2)) rotateY(0deg); }
  50%  { transform: translateZ(calc(var(--prof) * .2 + 40px)) rotateY(180deg) scale(1.06); }
  100% { transform: translateZ(calc(var(--prof) * .2)) rotateY(360deg); }
}

.mv-sombra {
  position: absolute;
  left: 8%; right: 8%; bottom: -26px;
  height: 30px;
  border-radius: 50%;
  background: radial-gradient(ellipse at center, rgba(0,0,0,.35), transparent 70%);
  filter: blur(6px);
  z-index: -1;
}
</style>
