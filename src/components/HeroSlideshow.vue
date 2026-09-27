<template>
  <section class="hero relative overflow-hidden">
    <BrandBackdrop variante="hero" />

    <div class="relative z-10 max-w-7xl mx-auto px-5 md:px-6 grid lg:grid-cols-[1.08fr_.92fr] gap-12 lg:gap-8 items-center">

      <!-- Texto -->
      <div class="order-2 lg:order-1 text-center lg:text-left">
        <p class="hero-entra font-etiqueta text-[13px] md:text-sm tracking-[0.3em] mb-5 inline-flex items-center gap-3" style="--d: 0ms">
          <span class="hidden sm:inline-block h-[2px] w-8 rounded-full bg-ck-tinta/30"></span>
          <span class="text-ck-naranja">VIVI</span>
          <span class="text-ck-verde">SENTI</span>
          <span class="text-ck-violeta">COME</span>
        </p>

        <!-- Texto pedido por Celia (27/09): "Tu estilo de vida saludable comienza acá" -->
        <h1 class="hero-titulo font-marca text-ck-tinta">
          <span class="hero-linea"><span class="hero-palabra" style="--d: 120ms">Tu estilo</span> <span class="hero-palabra" style="--d: 200ms">de vida</span></span>
          <span class="hero-linea">
            <span class="hero-palabra hero-destacada text-ck-naranja" style="--d: 320ms">
              saludable
              <svg class="hero-subrayado" viewBox="0 0 220 24" preserveAspectRatio="none" aria-hidden="true">
                <path d="M4 16 C 60 4, 120 4, 216 14" />
              </svg>
            </span>
          </span>
          <span class="hero-linea"><span class="hero-palabra" style="--d: 440ms">comienza acá</span></span>
        </h1>

        <p class="hero-entra font-texto text-ck-tinta/70 text-lg md:text-xl leading-relaxed max-w-md mx-auto lg:mx-0 mt-6" style="--d: 620ms">
          Alimentos cetogénicos artesanales. Sin azúcar, sin culpas, con todo el sabor.
        </p>

        <div class="hero-entra flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mt-9" style="--d: 760ms">
          <RouterLink to="/tienda" class="ck-btn-naranja text-base !px-8 !py-4 group">
            Explorar tienda
            <span class="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </RouterLink>
          <RouterLink to="/#keto" class="ck-btn-borde text-base !px-8 !py-4">
            ¿Qué es keto?
          </RouterLink>
        </div>

        <ul class="hero-entra flex flex-wrap gap-x-6 gap-y-3 justify-center lg:justify-start mt-9 font-texto text-sm text-ck-tinta/70" style="--d: 900ms">
          <li v-for="s in sellos" :key="s.texto" class="flex items-center gap-2">
            <span class="w-6 h-6"><BrandIcon :nombre="s.icono" /></span>{{ s.texto }}
          </li>
        </ul>
      </div>

      <!-- Visual: arco con fotos reales + sello + moneda, con profundidad 3D -->
      <div class="order-1 lg:order-2 flex justify-center hero-visual-entrada">
        <div class="hero-visual" v-tilt="7">
          <div class="hero-arco-fondo"></div>
          <div class="hero-arco">
            <TransitionGroup name="hero-foto">
              <img
                v-for="(slide, index) in slides"
                v-show="actual === index"
                :key="slide.image"
                :src="slide.image"
                :alt="slide.alt"
                class="hero-img"
                :loading="index === 0 ? 'eager' : 'lazy'"
                :fetchpriority="index === 0 ? 'high' : 'auto'"
                draggable="false"
              />
            </TransitionGroup>
            <div class="hero-velo"></div>
            <Transition name="hero-cap" mode="out-in">
              <p :key="actual" class="hero-caption">{{ slides[actual].alt }}</p>
            </Transition>
          </div>

          <img :src="publico('/marca/sello-cuchara.svg')" alt="" class="hero-sello" draggable="false" />
          <div class="hero-moneda"><MonedaIsotipo tam="100%" frente="naranja" dorso="violeta" auto /></div>

          <div class="hero-puntos">
            <button
              v-for="(s, index) in slides"
              :key="index"
              class="hero-punto"
              :class="{ activo: actual === index }"
              :aria-label="`Ver ${s.alt}`"
              @click="irA(index)"
            ></button>
          </div>
        </div>
      </div>
    </div>

    <a href="#categorias" class="hero-scroll hidden md:flex" aria-label="Bajar a las categorías">
      <span class="hero-mouse"><span></span></span>
      <span class="font-etiqueta text-[11px] tracking-[0.3em] text-ck-tinta/50">BAJA</span>
    </a>
  </section>
</template>

<script setup>
import { publico } from '@/brand/publico'
import { ref, onMounted, onUnmounted } from 'vue'
import BrandBackdrop from '@/components/brand/BrandBackdrop.vue'
import BrandIcon from '@/components/brand/BrandIcon.vue'
import MonedaIsotipo from '@/components/brand/MonedaIsotipo.vue'

// Fotos reales de productos (Cloudinary), recortadas inteligentemente para llenar el arco
const CLD = 'https://res.cloudinary.com/de3y7ybrg/image/upload/c_fill,g_auto,w_880,h_1100,q_auto,f_auto'
const slides = [
  { image: `${CLD}/ceketo/productos/prod_74.png`, alt: 'Cheesecake keto de frutos rojos' },
  { image: `${CLD}/ceketo/productos/prod_72.png`, alt: 'Cheesecake keto de chocolate' },
  { image: `${CLD}/ceketo/productos/prod_39.png`, alt: 'Carrot cake keto' },
  { image: `${CLD}/ceketo/productos/prod_35.jpg`, alt: 'Alfajor chocotorta low carb' },
  { image: `${CLD}/ceketo/productos/prod_21.jpg`, alt: 'Cookies keto' },
]

const sellos = [
  { icono: 'gotas', texto: 'Sin azúcar' },
  { icono: 'cuchara', texto: 'Artesanal' },
  { icono: 'rama', texto: 'Envío o retiro en el local' },
]

const actual = ref(0)
let timer = null

function siguiente() { actual.value = (actual.value + 1) % slides.length }
function irA(i) { actual.value = i; reiniciar() }
function reiniciar() { clearInterval(timer); timer = setInterval(siguiente, 5000) }

onMounted(() => { timer = setInterval(siguiente, 5000) })
onUnmounted(() => clearInterval(timer))
</script>

<style scoped>
.hero {
  padding: 8.5rem 0 5rem;
  background:
    radial-gradient(60rem 36rem at 88% 20%, rgba(156, 204, 102, .20), transparent 60%),
    radial-gradient(40rem 30rem at 5% 90%, rgba(246, 82, 29, .10), transparent 60%),
    #F7F1E6;
}
@media (min-width: 1024px) {
  .hero { min-height: 100svh; display: flex; align-items: center; padding: 7rem 0 4rem; }
  .hero > div:nth-child(2) { width: 100%; }
}

/* ── Título: cada línea sube desde abajo (máscara) ── */
.hero-titulo {
  font-size: clamp(2.6rem, 4.4vw, 4.1rem);
  line-height: 1;
  letter-spacing: .005em;
}
@media (max-width: 1023px) { .hero-titulo { font-size: clamp(2.5rem, 9.5vw, 4.2rem); } }
.hero-linea { display: block; overflow: hidden; padding-bottom: .08em; }
.hero-palabra {
  display: inline-block;
  transform: translateY(105%);
  animation: hero-subir .9s cubic-bezier(.2,.8,.2,1) forwards;
  animation-delay: var(--d);
}
.hero-destacada { position: relative; }
.hero-subrayado {
  position: absolute;
  left: -2%; bottom: -.12em;
  width: 104%; height: .32em;
  overflow: visible;
}
.hero-subrayado path {
  fill: none;
  stroke: #9CCC66;
  stroke-width: 7;
  stroke-linecap: round;
  stroke-dasharray: 240;
  stroke-dashoffset: 240;
  animation: hero-trazo .9s .95s cubic-bezier(.6,0,.2,1) forwards;
}
.hero-entra {
  opacity: 0;
  transform: translateY(18px);
  animation: hero-aparecer .8s cubic-bezier(.2,.8,.2,1) forwards;
  animation-delay: var(--d);
}
@keyframes hero-subir { to { transform: translateY(0); } }
@keyframes hero-trazo { to { stroke-dashoffset: 0; } }
@keyframes hero-aparecer { to { opacity: 1; transform: none; } }

/* ── Visual 3D ── */
.hero-visual-entrada {
  opacity: 0;
  transform: translateY(18px);
  animation: hero-aparecer 1s .2s cubic-bezier(.2,.8,.2,1) forwards;
}
.hero-visual {
  position: relative;
  width: min(430px, 66vw);
  aspect-ratio: 4 / 5;
  transform-style: preserve-3d;
}
@media (min-width: 1024px) { .hero-visual { width: min(430px, 34vw); } }
.hero-arco,
.hero-arco-fondo {
  position: absolute;
  inset: 0;
  border-radius: 999px 999px 34px 34px;
}
.hero-arco-fondo {
  background: #058D76;
  transform: translate3d(22px, 22px, -60px);
}
.hero-arco {
  overflow: hidden;
  background: #F6521D;
  box-shadow: 0 40px 70px -35px rgba(23,48,43,.6);
  transform: translateZ(0);
}
.hero-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  animation: hero-zoom 9s ease-out both;
}
@keyframes hero-zoom { from { transform: scale(1.12); } to { transform: scale(1); } }
.hero-velo {
  position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(23,48,43,.55), transparent 38%);
}
.hero-caption {
  position: absolute;
  left: 50%; bottom: 22px;
  transform: translateX(-50%);
  white-space: nowrap;
  padding: .55rem 1rem;
  border-radius: 999px;
  background: rgba(255,253,248,.95);
  color: #17302B;
  font: 600 13px/1 'Poppins', sans-serif;
  box-shadow: 0 8px 20px -10px rgba(0,0,0,.4);
}
.hero-sello {
  position: absolute;
  width: 34%;
  left: -12%;
  top: 6%;
  transform: translateZ(70px);
  animation: hero-girar 28s linear infinite;
  filter: drop-shadow(0 14px 18px rgba(23,48,43,.3));
}
@keyframes hero-girar { from { transform: translateZ(70px) rotate(0); } to { transform: translateZ(70px) rotate(360deg); } }
.hero-moneda {
  position: absolute;
  width: 21%;
  aspect-ratio: 1;
  right: -7%;
  bottom: 14%;
  transform: translateZ(90px);
}
.hero-puntos {
  position: absolute;
  left: 0; right: 0; bottom: -34px;
  display: flex;
  justify-content: center;
  gap: 8px;
}
.hero-punto {
  width: 8px; height: 8px;
  border-radius: 999px;
  background: rgba(23,48,43,.25);
  transition: all .35s ease;
}
.hero-punto.activo { width: 28px; background: #F6521D; }

.hero-foto-enter-active, .hero-foto-leave-active { transition: opacity 1.1s ease; }
.hero-foto-enter-from, .hero-foto-leave-to { opacity: 0; }
.hero-cap-enter-active, .hero-cap-leave-active { transition: all .4s ease; }
.hero-cap-enter-from { opacity: 0; transform: translate(-50%, 10px); }
.hero-cap-leave-to { opacity: 0; transform: translate(-50%, -6px); }

/* ── Indicador para bajar ── */
.hero-scroll {
  position: absolute;
  left: 50%; bottom: 22px;
  transform: translateX(-50%);
  flex-direction: column;
  align-items: center;
  gap: 8px;
  z-index: 10;
}
.hero-mouse {
  width: 22px; height: 34px;
  border: 2px solid rgba(23,48,43,.35);
  border-radius: 12px;
  display: flex;
  justify-content: center;
  padding-top: 6px;
}
.hero-mouse span {
  width: 4px; height: 7px;
  border-radius: 2px;
  background: #F6521D;
  animation: hero-rueda 1.6s ease-in-out infinite;
}
@keyframes hero-rueda { 0% { transform: translateY(0); opacity: 1; } 80% { transform: translateY(10px); opacity: 0; } 100% { opacity: 0; } }
</style>
