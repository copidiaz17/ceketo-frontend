<template>
  <footer id="contacto" class="bg-keto-dark text-white">
    <!-- Main footer -->
    <div class="max-w-7xl mx-auto px-6 py-16">
      <div class="grid md:grid-cols-4 gap-12">

        <!-- Brand column -->
        <div class="md:col-span-2">
          <img
            src="@/assets/images/logo.png"
            alt="CEKETO"
            class="h-20 w-auto mb-6 brightness-0 invert opacity-90"
          />
          <p class="font-body text-white/60 text-sm leading-relaxed max-w-xs mb-6">
            Alimentos cetogénicos artesanales para quienes eligen vivir mejor.
            Viví, Sentí, Comé — sin azúcar, sin culpas.
          </p>
          <!-- Social -->
          <div class="flex gap-4">
            <a
              v-for="social in socials"
              :key="social.name"
              :href="social.url"
              target="_blank"
              rel="noopener"
              class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center
                     hover:bg-teal transition-all duration-300 hover:scale-110"
              :title="social.name"
            >
              <span class="text-lg">{{ social.icon }}</span>
            </a>
          </div>
        </div>

        <!-- Links -->
        <div>
          <h4 class="font-display text-lg font-semibold mb-6">Navegación</h4>
          <ul class="space-y-3">
            <li v-for="link in footerLinks" :key="link.label">
              <RouterLink
                :to="link.path"
                class="font-body text-white/60 text-sm hover:text-teal-light transition-colors duration-300 hover:pl-2"
              >
                {{ link.label }}
              </RouterLink>
            </li>
          </ul>
        </div>

        <!-- Contact -->
        <div>
          <h4 class="font-display text-lg font-semibold mb-6">Contacto</h4>
          <ul class="space-y-4">
            <li
              v-for="contact in contacts"
              :key="contact.label"
              class="flex items-start gap-3"
            >
              <span class="text-teal text-xl flex-shrink-0">{{ contact.icon }}</span>
              <div>
                <p class="font-body text-xs text-white/40 mb-0.5">{{ contact.label }}</p>
                <a
                  :href="contact.href"
                  class="font-body text-sm text-white/70 hover:text-teal-light transition-colors"
                >
                  {{ contact.value }}
                </a>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Bottom bar -->
    <div class="border-t border-white/10">
      <div class="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-3">
        <p class="font-body text-white/40 text-xs">
          © 2025 CEKETO. Todos los derechos reservados.
        </p>
        <div class="flex gap-6 items-center">
          <a href="#" class="font-body text-white/40 text-xs hover:text-white/70 transition-colors">
            Términos y condiciones
          </a>
          <a href="#" class="font-body text-white/40 text-xs hover:text-white/70 transition-colors">
            Política de privacidad
          </a>
          <RouterLink
            to="/admin/login"
            class="font-body text-white/20 text-xs hover:text-white/50 transition-colors"
            title="Panel administrativo"
          >
            ⚙ Admin
          </RouterLink>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
const socials = [
  { name: 'Instagram', icon: '📷', url: 'https://instagram.com' },
  { name: 'Facebook', icon: '👥', url: 'https://facebook.com' },
  { name: 'WhatsApp', icon: '💬', url: 'https://wa.me' },
]

const footerLinks = [
  { label: 'Inicio', path: '/' },
  { label: 'Tienda', path: '/tienda' },
  { label: 'Nosotros', path: '/nosotros' },
  { label: 'Carrito', path: '/carrito' },
]

const contacts = [
  { icon: '📍', label: 'Dirección', value: 'Buenos Aires, Argentina', href: '#' },
  { icon: '📱', label: 'WhatsApp', value: '+54 385 413-3969', href: 'https://wa.me/543854133969' },
  { icon: '✉️', label: 'Email', value: 'hola@ceketo.com.ar', href: 'mailto:hola@ceketo.com.ar' },
]
</script>
