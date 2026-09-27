<template>
  <!-- Pedido de Celia (27/09): franja VIVI SENTI COME en verde oscuro, datos de contacto en el verde claro de la marca -->
  <footer id="contacto" class="relative bg-ck-verde text-white overflow-hidden">
    <SloganMarquee fondo="noche" :duracion="46" reversa />

    <div class="relative max-w-7xl mx-auto px-5 md:px-6 py-16 md:py-20">
      <div class="grid md:grid-cols-12 gap-12">

        <!-- Marca -->
        <div class="md:col-span-5">
          <img :src="publico('/marca/logo-crema.svg')" alt="CEKETO · Viví, Sentí, Comé" class="w-48 md:w-56 mb-6" />
          <p class="font-texto text-white text-[15px] leading-relaxed max-w-xs mb-7">
            Alimentos cetogénicos artesanales para quienes eligen vivir mejor.
            Viví, Sentí, Comé — sin azúcar, sin culpas.
          </p>
          <div class="flex gap-3">
            <a
              v-for="social in socials"
              :key="social.name"
              :href="social.url"
              target="_blank"
              rel="noopener"
              class="ft-social"
              :style="{ '--c': social.color }"
              :aria-label="social.name"
            >
              <svg viewBox="0 0 24 24" class="w-5 h-5" fill="currentColor" aria-hidden="true"><path :d="social.icon" /></svg>
            </a>
          </div>
        </div>

        <!-- Navegación -->
        <div class="md:col-span-3">
          <h4 class="ft-titulo">Navegación</h4>
          <ul class="space-y-3">
            <li v-for="link in footerLinks" :key="link.label">
              <RouterLink :to="link.path" class="ft-link">{{ link.label }}</RouterLink>
            </li>
          </ul>
        </div>

        <!-- Contacto -->
        <div class="md:col-span-4">
          <h4 class="ft-titulo">Contacto</h4>
          <ul class="space-y-5">
            <li v-for="c in contacts" :key="c.label" class="flex items-start gap-3">
              <span class="ft-contacto-icono"><BrandIcon :nombre="c.icono" /></span>
              <div>
                <p class="font-texto font-semibold uppercase text-[11px] tracking-[0.18em] text-white/85 mb-1">{{ c.label }}</p>
                <a :href="c.href" :target="c.externo ? '_blank' : null" rel="noopener" class="ft-link !text-[15px]">{{ c.value }}</a>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div class="border-t border-white/20">
      <div class="max-w-7xl mx-auto px-5 md:px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-3">
        <p class="font-texto text-white/85 text-xs">© {{ anio }} CEKETO. Todos los derechos reservados.</p>
        <div class="flex gap-6 items-center">
          <a href="#" class="font-texto text-white/85 text-xs hover:text-white transition-colors">Términos y condiciones</a>
          <a href="#" class="font-texto text-white/85 text-xs hover:text-white transition-colors">Política de privacidad</a>
          <RouterLink
            v-if="!esDemo"
            to="/admin/login"
            class="font-texto text-white/55 text-xs hover:text-white transition-colors"
            title="Panel administrativo"
          >⚙ Admin</RouterLink>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { publico } from '@/brand/publico'
import BrandIcon from '@/components/brand/BrandIcon.vue'
import SloganMarquee from '@/components/brand/SloganMarquee.vue'

const anio = new Date().getFullYear()
const esDemo = !!import.meta.env.VITE_DEMO

// Íconos de redes en SVG (antes eran emojis)
const socials = [
  { name: 'Instagram', color: '#885784', url: 'https://instagram.com',
    icon: 'M12 7.2A4.8 4.8 0 1 0 12 16.8 4.8 4.8 0 0 0 12 7.2zm0 7.9a3.1 3.1 0 1 1 0-6.2 3.1 3.1 0 0 1 0 6.2zM17 5.8a1.1 1.1 0 1 0 0 2.3 1.1 1.1 0 0 0 0-2.3zM21.9 7.9c-.1-1.6-.4-3-1.6-4.2S17.7 2.1 16.1 2c-1.6-.1-6.6-.1-8.2 0-1.6.1-3 .4-4.2 1.6S2.1 6.3 2 7.9c-.1 1.6-.1 6.6 0 8.2.1 1.6.4 3 1.6 4.2S6.3 21.9 7.9 22c1.6.1 6.6.1 8.2 0 1.6-.1 3-.4 4.2-1.6s1.5-2.6 1.6-4.2c.1-1.6.1-6.6 0-8.2zm-2.2 10.1a3.3 3.3 0 0 1-1.9 1.9c-1.3.5-4.4.4-5.8.4s-4.5.1-5.8-.4a3.3 3.3 0 0 1-1.9-1.9c-.5-1.3-.4-4.4-.4-5.8s-.1-4.5.4-5.8a3.3 3.3 0 0 1 1.9-1.9C7.5 4 10.6 4.1 12 4.1s4.5-.1 5.8.4a3.3 3.3 0 0 1 1.9 1.9c.5 1.3.4 4.4.4 5.8s.1 4.5-.4 5.8z' },
  { name: 'Facebook', color: '#0B3B34', url: 'https://facebook.com',
    icon: 'M13.5 21.9v-7.4H16l.4-2.9h-2.9V9.8c0-.8.2-1.4 1.4-1.4h1.5V5.8a20 20 0 0 0-2.2-.1c-2.2 0-3.7 1.3-3.7 3.8v2.1H8v2.9h2.5v7.4a10 10 0 1 1 3 0z' },
  { name: 'WhatsApp', color: '#F6521D', url: 'https://wa.me/543854133969',
    icon: 'M17.5 14.4c-.3-.1-1.8-.9-2-1s-.5-.1-.7.1-.8 1-.9 1.2-.3.2-.6.1a8.2 8.2 0 0 1-2.4-1.5 9 9 0 0 1-1.7-2.1c-.2-.3 0-.5.1-.6l.4-.5.3-.5a.6.6 0 0 0 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6a1.1 1.1 0 0 0-.8.4 3.4 3.4 0 0 0-1.1 2.5 5.9 5.9 0 0 0 1.2 3.1 13.5 13.5 0 0 0 5.2 4.6c1.9.8 2.7.9 3.6.7a3.1 3.1 0 0 0 2.1-1.4 2.5 2.5 0 0 0 .2-1.4c-.1-.2-.3-.2-.6-.4zM12 21.8a9.8 9.8 0 0 1-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4A9.8 9.8 0 1 1 12 21.8zm8.4-18.2A11.8 11.8 0 0 0 1.8 17.8L.1 24l6.4-1.7a11.8 11.8 0 0 0 5.6 1.4A11.8 11.8 0 0 0 20.4 3.6z' },
]

const footerLinks = [
  { label: 'Inicio', path: '/' },
  { label: 'Tienda', path: '/tienda' },
  { label: 'Nosotros', path: '/nosotros' },
  { label: 'Carrito', path: '/carrito' },
]

// Dirección: la misma del checkout (antes decía "Buenos Aires, Argentina").
// Mail real de Ceketo (el anterior, hola@ceketo.com.ar, era de un dominio que no existe).
const contacts = [
  { icono: 'palta', label: 'Dirección', value: 'Independencia 663, Santiago del Estero', href: 'https://maps.google.com/?q=Independencia+663,+Santiago+del+Estero', externo: true },
  { icono: 'kiwi',  label: 'WhatsApp', value: '+54 385 413-3969', href: 'https://wa.me/543854133969', externo: true },
  { icono: 'gotas', label: 'Email', value: 'ceketosgo@gmail.com', href: 'mailto:ceketosgo@gmail.com' },
]
</script>

<style scoped>
.ft-titulo {
  font-family: 'CK Cherione', 'Poppins', sans-serif !important;
  font-size: 1.5rem;
  color: #FFFFFF;
  margin-bottom: 1.4rem;
}
/* sobre el verde de la marca el texto va blanco pleno (el lima no se lee) */
.ft-link {
  font: 500 15px/1.4 'Poppins', sans-serif;
  color: #FFFFFF;
  transition: color .3s, padding .3s;
  text-underline-offset: 4px;
}
.ft-link:hover { padding-left: 4px; text-decoration: underline; text-decoration-color: #9CCC66; text-decoration-thickness: 2px; }
.ft-social {
  width: 44px; height: 44px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: rgba(255,255,255,.16);
  color: #FFFFFF;
  transition: all .35s cubic-bezier(.3,1.5,.5,1);
}
.ft-social:hover { background: var(--c); transform: translateY(-4px) rotate(-6deg); }
.ft-contacto-icono {
  flex-shrink: 0;
  width: 40px; height: 40px;
  padding: 7px;
  border-radius: 12px;
  background: #FFFDF8;
}
</style>
