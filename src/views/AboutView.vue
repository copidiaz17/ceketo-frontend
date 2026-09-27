<template>
  <main class="bg-ck-crema">
    <!-- Historia: logo SIN fondo negro, con los íconos de la marca orbitando -->
    <section class="relative pt-32 md:pt-36 pb-20 overflow-hidden">
      <div class="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div class="nos-halo"></div>
      </div>

      <div class="relative max-w-4xl mx-auto px-5 md:px-6 text-center">
        <div class="nos-logo-zona">
          <BrandBackdrop variante="nosotros" :recortar="false" />
          <img :src="publico('/marca/logo-verde.svg')" alt="CEKETO · Viví, Sentí, Comé" class="nos-logo" />
        </div>

        <div class="relative z-10">
          <span v-reveal class="ck-eyebrow text-ck-violeta mt-4 mb-4">Quiénes somos</span>
          <h1 v-reveal="100" class="ck-titulo mb-6">Nuestra historia</h1>

          <p v-reveal="160" class="font-texto text-xl md:text-2xl text-ck-tinta/80 leading-relaxed max-w-2xl mx-auto">
            CEKETO nació de la pasión por la alimentación consciente y el bienestar.
            Creemos que <span class="nos-resaltado">comer rico y cuidarse no son cosas opuestas.</span>
          </p>
          <p v-reveal="220" class="font-texto text-ck-tinta/65 text-lg leading-relaxed max-w-2xl mx-auto mt-6">
            Cada producto que elaboramos lleva horas de dedicación, ingredientes de calidad
            y el compromiso de ofrecerte lo mejor sin azúcar, sin harinas refinadas,
            sin comprometer el sabor. Viví, Sentí, Comé.
          </p>
        </div>
      </div>
    </section>

    <SloganMarquee fondo="crema" :duracion="34" />

    <!-- Valores de la marca (del manual) -->
    <section class="relative py-24 bg-ck-profundo overflow-hidden">
      <BrandBackdrop variante="keto" />
      <div class="relative z-10 max-w-7xl mx-auto px-5 md:px-6">
        <div class="text-center mb-14">
          <span v-reveal class="ck-eyebrow text-ck-lima mb-4">Lo que nos define</span>
          <h2 v-reveal="100" class="ck-titulo !text-ck-blanco">Nuestros valores</h2>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-5">
          <div
            v-for="(v, i) in valores"
            :key="v.nombre"
            v-reveal:giro="i * 100"
            :class="{ 'col-span-2 md:col-span-1': i === valores.length - 1 }"
          >
            <div class="nv" v-tilt="12" :style="{ '--c': v.color, '--ct': v.texto }">
              <div class="nv-icono"><BrandIcon :nombre="v.icono" /></div>
              <span class="nv-nombre">{{ v.nombre }}</span>
              <div class="ck-brillo absolute inset-0 rounded-[inherit]"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Cierre -->
    <section class="relative py-24 overflow-hidden">
      <div class="max-w-5xl mx-auto px-5 md:px-6 grid md:grid-cols-[.8fr_1.2fr] gap-12 items-center">
        <div v-reveal:izq class="flex justify-center">
          <img :src="publico('/marca/logo-vertical.svg')" alt="" aria-hidden="true" class="nos-vertical" />
        </div>
        <div v-reveal:der class="text-center md:text-left">
          <h2 class="ck-titulo mb-5">Viví, sentí, <span class="text-ck-naranja">comé</span></h2>
          <p class="font-texto text-ck-tinta/70 text-lg leading-relaxed mb-8 max-w-md mx-auto md:mx-0">
            Panes, budines, dulces y pastas keto hechos de forma artesanal, para disfrutar sin azúcar y sin culpas.
          </p>
          <div class="flex items-center gap-5 justify-center md:justify-start">
            <RouterLink to="/tienda" class="ck-btn-naranja text-base !px-8 !py-4">Ver nuestros productos</RouterLink>
            <div class="nos-sellos hidden sm:flex">
              <img v-for="s in sellos" :key="s" :src="publico(`/marca/${s}.svg`)" alt="" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { publico } from '@/brand/publico'
import BrandBackdrop from '@/components/brand/BrandBackdrop.vue'
import BrandIcon from '@/components/brand/BrandIcon.vue'
import SloganMarquee from '@/components/brand/SloganMarquee.vue'

// Valores de la "Definición de la marca" del manual de Serif Estudio
const valores = [
  { nombre: 'Bienestar', icono: 'hojas',   color: '#058D76', texto: '#FFFDF8' },
  { nombre: 'Calidad',   icono: 'diana',   color: '#F6521D', texto: '#0F2420' },
  { nombre: 'Integridad', icono: 'rama',   color: '#885784', texto: '#FFFDF8' },
  { nombre: 'Salud',     icono: 'palta',   color: '#9CCC66', texto: '#17302B' },
  { nombre: 'Variedad',  icono: 'gotas',   color: '#5AB282', texto: '#17302B' },
]
const sellos = ['sello-cuchara', 'sello-hojas', 'sello-palta']
</script>

<style scoped>
.nos-halo {
  position: absolute;
  left: 50%; top: 22%;
  width: 60rem; height: 34rem;
  transform: translateX(-50%);
  background: radial-gradient(closest-side, rgba(156,204,102,.32), transparent);
}
.nos-logo-zona {
  position: relative;
  width: min(460px, 76vw);
  aspect-ratio: 1.3;
  margin: 0 auto 1.5rem;
  display: grid;
  place-items: center;
}
.nos-logo {
  position: relative;
  z-index: 2;
  width: 100%;
  animation: nos-flotar 6s ease-in-out infinite;
  filter: drop-shadow(0 20px 26px rgba(5,141,118,.18));
}
@keyframes nos-flotar { 50% { transform: translateY(-10px); } }

.nos-resaltado {
  background: linear-gradient(transparent 60%, rgba(156,204,102,.55) 60%);
  color: #17302B;
}

.nv {
  position: relative;
  aspect-ratio: 1;
  border-radius: 28px;
  background: var(--c);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: .9rem;
  overflow: hidden;
  box-shadow: 0 26px 40px -26px rgba(0,0,0,.6);
}
.nv-icono {
  width: 46%;
  aspect-ratio: 1;
  padding: 12%;
  border-radius: 999px 999px 18px 18px;
  background: #FFFDF8;
  transition: transform .5s cubic-bezier(.3,1.5,.5,1);
}
.nv:hover .nv-icono { transform: translateY(-6px) rotate(-6deg) scale(1.06); }
.nv-nombre {
  font-family: 'CK Cherione', 'Poppins', sans-serif;
  font-size: clamp(1.3rem, 2.2vw, 1.7rem);
  color: var(--ct);
  line-height: 1;
}
.nos-vertical {
  width: min(250px, 55vw);
  animation: nos-flotar 7s ease-in-out infinite;
}
.nos-sellos img {
  width: 58px;
  margin-left: -14px;
  border-radius: 50%;
  transition: transform .5s cubic-bezier(.3,1.5,.5,1);
  animation: nos-girar 18s linear infinite;
}
.nos-sellos img:nth-child(2) { animation-duration: 22s; animation-direction: reverse; }
.nos-sellos img:hover { transform: translateY(-8px) scale(1.15); }
@keyframes nos-girar { to { transform: rotate(360deg); } }
</style>
