<template>
  <div ref="raiz" class="bd" :class="{ 'bd-activo': activo, 'bd-libre': !recortar }" aria-hidden="true">
    <div
      v-for="(it, k) in items"
      :key="k"
      class="bd-item"
      :class="{ 'bd-solo-desktop': it.m === false, 'bd-orbita': esOrbita(it) }"
      :style="{
        left: it.x, top: it.y,
        width: `calc(${it.s}px * var(--bd-escala))`,
        '--z': it.z ?? 10,
        opacity: it.o ?? 1,
        ...(esOrbita(it) ? tiemposOrbita(it, 'y') : {}),
      }"
    >
      <div
        class="bd-anim"
        :class="`bd-${it.a || 'flotar'}`"
        :style="{
          '--r': `${it.r || 0}deg`,
          '--radio': it.radio ? `calc(${it.radio}px * var(--bd-escala))` : null,
          '--caida': it.caida ? `${it.caida}px` : null,
          ...(esOrbita(it) ? tiemposOrbita(it, 'x') : {
            animationDuration: `${it.d || 8}s`,
            animationDelay: `${it.dl || 0}s`,
          }),
        }"
      >
        <!-- 2da capa: en las órbitas hace el movimiento vertical (elipse con profundidad) -->
        <div class="bd-anim2" :style="esOrbita(it) ? tiemposOrbita(it, 'y') : null">
          <BrandIcon :nombre="it.i" :color="it.c || null" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Íconos sueltos de la marca flotando de fondo, con animaciones y formas distintas por sección.
// Se mueven con el mouse (parallax en capas) y con el scroll; se pausan fuera de pantalla.
import { ref, computed, onMounted, onUnmounted } from 'vue'
import BrandIcon from './BrandIcon.vue'

const props = defineProps({
  variante: { type: String, required: true },
  recortar: { type: Boolean, default: true },   // false = los íconos pueden salir del contenedor
})

// x/y: posición · s: tamaño (px) · a: animación · d: duración · dl: retardo · z: profundidad (parallax)
// o: opacidad · c: color único (si no, colores originales) · r: rotación base · m:false = solo compu
const TINTA_CREMA = '#E7DCC8'
const PRESETS = {
  // Portada: íconos a color alrededor, destellos del mosaico
  hero: [
    { i: 'estrella', x: '57%', y: '17%', s: 22, a: 'titilar', d: 3.2, z: 14 },
    { i: 'estrella', x: '93%', y: '30%', s: 16, a: 'titilar', d: 2.6, dl: 1.1, z: 20 },
    { i: 'estrella', x: '61%', y: '80%', s: 14, a: 'titilar', d: 3.8, dl: .6, z: 8 },
    { i: 'palta',   x: '88%', y: '9%',  s: 84, a: 'flotar', d: 7,  z: 34, r: 12, m: false },
    { i: 'kiwi',    x: '51%', y: '64%', s: 74, a: 'girar',  d: 38, z: 26, m: false },
    { i: 'hojas',   x: '44%', y: '8%',  s: 62, a: 'mecer',  d: 6,  z: 16, o: .45, m: false },
    { i: 'melon',   x: '92%', y: '74%', s: 70, a: 'deriva', d: 11, z: 30, r: -20, m: false },
  ],
  // Categorías: formas grandes y lentas en tono crema (textura suave)
  // (en un solo color se usan siluetas: kiwi/diana quedarían como un círculo liso)
  categorias: [
    { i: 'melon', x: '-7%', y: '-6%', s: 300, a: 'girar',  d: 60, z: 6, c: TINTA_CREMA },
    { i: 'hojas', x: '84%', y: '60%', s: 250, a: 'girar-inv', d: 80, z: 10, c: TINTA_CREMA },
    { i: 'palta', x: '82%', y: '-3%', s: 140, a: 'flotar', d: 9, z: 12, c: TINTA_CREMA, r: 14, m: false },
    { i: 'rama',  x: '2%',  y: '62%', s: 150, a: 'mecer',  d: 8, dl: 1, z: 14, c: TINTA_CREMA, m: false },
  ],
  // Lo más elegido: lluvia de gotas (lima) + palta grande
  destacados: [
    ...[6, 14, 23, 31, 44, 52, 63, 71, 82, 91].map((x, k) => ({
      i: 'gota', x: `${x}%`, y: '-6%', s: 16 + (k % 3) * 8, a: 'caer',
      d: 9 + (k % 4) * 2.5, dl: -k * 1.7, caida: 1400, z: 4, c: '#9CCC66', o: .55,
    })),
    { i: 'palta', x: '88%', y: '8%', s: 150, a: 'flotar', d: 9, z: 20, c: '#9CCC66', o: .35, r: 14, m: false },
    { i: 'cuchara', x: '-3%', y: '40%', s: 150, a: 'mecer', d: 7, z: 16, c: '#9CCC66', o: .3, r: -8, m: false },
  ],
  // ¿Por qué keto? (fondo verde profundo): siluetas claras que respiran
  keto: [
    { i: 'rama',    x: '-2%', y: '6%',  s: 220, a: 'mecer',  d: 8,  z: 10, c: '#FFFDF8', o: .07 },
    { i: 'hojas',   x: '82%', y: '4%',  s: 200, a: 'latir',  d: 7,  z: 16, c: '#9CCC66', o: .12 },
    { i: 'cuchara', x: '88%', y: '62%', s: 210, a: 'mecer',  d: 9,  dl: 1, z: 12, c: '#FFFDF8', o: .07 },
    { i: 'melon',   x: '6%',  y: '74%', s: 170, a: 'girar',  d: 60, z: 8,  c: '#9CCC66', o: .1 },
    { i: 'estrella', x: '46%', y: '10%', s: 18, a: 'titilar', d: 3, z: 20, c: '#9CCC66' },
    { i: 'estrella', x: '30%', y: '88%', s: 12, a: 'titilar', d: 2.4, dl: 1, z: 20, c: '#FFFDF8', o: .7 },
  ],
  // Newsletter (fondo naranja): hojas que caen balanceándose
  newsletter: [
    ...[4, 17, 29, 41, 58, 70, 83, 94].map((x, k) => ({
      i: 'hoja', x: `${x}%`, y: '-12%', s: 26 + (k % 3) * 10, a: 'caer-hoja',
      d: 10 + (k % 4) * 2, dl: -k * 1.9, caida: 700, z: 6, c: '#FFFDF8', o: .45,
    })),
  ],
  // Nosotros: íconos a color orbitando alrededor del logo
  nosotros: [
    { i: 'palta',   x: '50%', y: '50%', s: 64, a: 'orbitar',     d: 26, radio: 215, z: 10 },
    { i: 'kiwi',    x: '50%', y: '50%', s: 54, a: 'orbitar',     d: 26, dl: -8.7, radio: 215, z: 10 },
    { i: 'diana',   x: '50%', y: '50%', s: 46, a: 'orbitar',     d: 26, dl: -17.4, radio: 215, z: 10 },
    { i: 'hojas',   x: '50%', y: '50%', s: 50, a: 'orbitar-inv', d: 34, radio: 300, z: 18, m: false },
    { i: 'gotas',   x: '50%', y: '50%', s: 44, a: 'orbitar-inv', d: 34, dl: -11.3, radio: 300, z: 18, m: false },
    { i: 'melon',   x: '50%', y: '50%', s: 52, a: 'orbitar-inv', d: 34, dl: -22.6, radio: 300, z: 18, m: false },
    { i: 'estrella', x: '22%', y: '20%', s: 18, a: 'titilar', d: 3, z: 20 },
    { i: 'estrella', x: '78%', y: '78%', s: 14, a: 'titilar', d: 2.5, dl: 1, z: 20 },
  ],
  // Tienda: pocos íconos claros que flotan lento (no distraen del catálogo)
  tienda: [
    { i: 'palta', x: '90%', y: '2%',  s: 130, a: 'flotar', d: 10, z: 10, c: TINTA_CREMA, r: 14 },
    { i: 'rama',  x: '-2%', y: '18%', s: 140, a: 'mecer',  d: 8,  z: 8,  c: TINTA_CREMA, m: false },
    { i: 'melon', x: '93%', y: '46%', s: 110, a: 'girar',  d: 60, z: 6,  c: TINTA_CREMA, m: false },
    { i: 'hojas', x: '4%',  y: '70%', s: 120, a: 'latir',  d: 7,  z: 6,  c: TINTA_CREMA, m: false },
  ],
}

const items = computed(() => PRESETS[props.variante] || [])

// Órbita elíptica: X e Y van y vuelven desfasados 1/4 de vuelta (= elipse).
// Arriba (atrás) el ícono se achica y pasa detrás del logo; abajo (adelante) se agranda.
const esOrbita = it => it.a === 'orbitar' || it.a === 'orbitar-inv'
function tiemposOrbita(it, eje) {
  const medio = (it.d || 20) / 2
  const dl = it.dl || 0
  return {
    animationDuration: `${medio}s`,
    animationDelay: `${eje === 'x' ? dl : dl - medio / 2}s`,
  }
}

const raiz = ref(null)
const activo = ref(false)
let io = null
let raf = 0
const mouseFino = typeof window !== 'undefined' &&
  window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches

function actualizarScroll() {
  const el = raiz.value
  if (!el) return
  const r = el.getBoundingClientRect()
  const centro = r.top + r.height / 2
  const vh = window.innerHeight
  const p = Math.max(-1, Math.min(1, (centro - vh / 2) / vh))  // -1 arriba … 1 abajo
  el.style.setProperty('--sp', p.toFixed(3))
}

let rafMouse = 0
function alMover(ev) {
  if (!activo.value) return
  cancelAnimationFrame(rafMouse)
  rafMouse = requestAnimationFrame(() => {
    const el = raiz.value
    if (!el) return
    el.style.setProperty('--px', ((ev.clientX / window.innerWidth) * 2 - 1).toFixed(3))
    el.style.setProperty('--py', ((ev.clientY / window.innerHeight) * 2 - 1).toFixed(3))
  })
}

function alScroll() {
  if (!activo.value) return
  cancelAnimationFrame(raf)
  raf = requestAnimationFrame(actualizarScroll)
}

onMounted(() => {
  io = new IntersectionObserver(([e]) => { activo.value = e.isIntersecting; if (e.isIntersecting) actualizarScroll() }, { rootMargin: '120px' })
  io.observe(raiz.value)
  if (mouseFino) window.addEventListener('pointermove', alMover, { passive: true })
  window.addEventListener('scroll', alScroll, { passive: true })
})

onUnmounted(() => {
  io?.disconnect()
  cancelAnimationFrame(raf)
  cancelAnimationFrame(rafMouse)
  window.removeEventListener('pointermove', alMover)
  window.removeEventListener('scroll', alScroll)
})
</script>

<style>
.bd {
  --bd-escala: .62;
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}
@media (min-width: 768px) { .bd { --bd-escala: 1; } }
.bd-libre { overflow: visible; }

.bd-item {
  position: absolute;
  aspect-ratio: 1;
  /* capa de parallax: mouse (--px/--py) y scroll (--sp), multiplicado por la profundidad */
  transform: translate3d(
    calc(var(--px, 0) * var(--z) * -1px),
    calc(var(--py, 0) * var(--z) * -1px + var(--sp, 0) * var(--z) * -3px),
    0);
  transition: transform .6s cubic-bezier(.2,.7,.2,1);
  will-change: transform;
}
.bd-solo-desktop { display: none; }
@media (min-width: 768px) { .bd-solo-desktop { display: block; } }

.bd-anim {
  width: 100%;
  height: 100%;
  transform: rotate(var(--r));
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
  animation-play-state: paused;
}
.bd-activo .bd-anim { animation-play-state: running; }

.bd-flotar   { animation-name: bd-flotar; }
.bd-girar    { animation-name: bd-girar; animation-timing-function: linear; }
.bd-girar-inv{ animation-name: bd-girar; animation-timing-function: linear; animation-direction: reverse; }
.bd-mecer    { animation-name: bd-mecer; transform-origin: 50% 100%; }
.bd-latir    { animation-name: bd-latir; }
.bd-deriva   { animation-name: bd-deriva; }
.bd-titilar  { animation-name: bd-titilar; }
.bd-caer     { animation-name: bd-caer; animation-timing-function: cubic-bezier(.45,.05,.8,.6); }
.bd-caer-hoja{ animation-name: bd-caer-hoja; animation-timing-function: linear; }
.bd-anim2 { width: 100%; height: 100%; }
/* órbita elíptica (ver tiemposOrbita en el script) */
.bd-orbitar, .bd-orbitar-inv {
  animation-name: bd-orb-x;
  animation-timing-function: cubic-bezier(.37,0,.63,1);
  animation-direction: alternate;
  margin: -50% 0 0 -50%;
}
.bd-orbitar-inv { animation-direction: alternate-reverse; }
.bd-orbita .bd-anim2 {
  animation: bd-orb-y cubic-bezier(.37,0,.63,1) infinite alternate;
  animation-play-state: paused;
}
.bd-orbita { animation: bd-orb-z linear infinite alternate; animation-play-state: paused; }
.bd-activo .bd-orbita,
.bd-activo .bd-orbita .bd-anim2 { animation-play-state: running; }
.bd-libre { z-index: auto; }

@keyframes bd-flotar {
  0%, 100% { transform: translateY(0) rotate(var(--r)); }
  50%      { transform: translateY(-18px) rotate(calc(var(--r) + 5deg)); }
}
@keyframes bd-girar {
  from { transform: rotate(var(--r)); }
  to   { transform: rotate(calc(var(--r) + 360deg)); }
}
@keyframes bd-mecer {
  0%, 100% { transform: rotate(calc(var(--r) - 7deg)); }
  50%      { transform: rotate(calc(var(--r) + 7deg)); }
}
@keyframes bd-latir {
  0%, 100% { transform: scale(1) rotate(var(--r)); }
  50%      { transform: scale(1.1) rotate(var(--r)); }
}
@keyframes bd-deriva {
  0%, 100% { transform: translate(0, 0) rotate(var(--r)); }
  33%      { transform: translate(22px, -16px) rotate(calc(var(--r) + 8deg)); }
  66%      { transform: translate(-10px, 12px) rotate(calc(var(--r) - 6deg)); }
}
@keyframes bd-titilar {
  0%, 100% { transform: scale(.55) rotate(0deg); opacity: .35; }
  50%      { transform: scale(1.1) rotate(45deg); opacity: 1; }
}
@keyframes bd-caer {
  0%   { transform: translateY(0); opacity: 0; }
  8%   { opacity: 1; }
  88%  { opacity: 1; }
  100% { transform: translateY(var(--caida, 900px)); opacity: 0; }
}
@keyframes bd-caer-hoja {
  0%   { transform: translate(0, 0) rotate(-30deg); opacity: 0; }
  10%  { opacity: 1; }
  25%  { transform: translate(28px, calc(var(--caida, 700px) * .25)) rotate(20deg); }
  50%  { transform: translate(-18px, calc(var(--caida, 700px) * .5)) rotate(-25deg); }
  75%  { transform: translate(24px, calc(var(--caida, 700px) * .75)) rotate(30deg); }
  90%  { opacity: 1; }
  100% { transform: translate(0, var(--caida, 700px)) rotate(-10deg); opacity: 0; }
}
@keyframes bd-orb-x {
  from { transform: translateX(calc(var(--radio, 200px) * -1)); }
  to   { transform: translateX(var(--radio, 200px)); }
}
@keyframes bd-orb-y {
  from { transform: translateY(calc(var(--radio, 200px) * -.4)) scale(.7); }
  to   { transform: translateY(calc(var(--radio, 200px) * .4)) scale(1.12); }
}
@keyframes bd-orb-z {
  0%, 49%   { z-index: 1; }
  50%, 100% { z-index: 3; }
}
</style>
