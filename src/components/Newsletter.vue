<template>
  <section class="relative overflow-hidden bg-ck-naranja">
    <!-- patrón "VIVI SENTI COME" de fondo, como en el manual -->
    <div class="nl-patron" aria-hidden="true">
      <div v-for="f in 5" :key="f" class="nl-fila" :class="{ 'nl-fila-inv': f % 2 === 0 }">
        <span v-for="n in 8" :key="n">VIVI&nbsp;&nbsp;SENTI&nbsp;&nbsp;COME&nbsp;&nbsp;</span>
      </div>
    </div>
    <BrandBackdrop variante="newsletter" />

    <img :src="publico('/marca/sello-palta.svg')" alt="" class="nl-sello hidden md:block" aria-hidden="true" />

    <div class="relative z-10 max-w-3xl mx-auto px-5 md:px-6 py-24 md:py-28 text-center">
      <span v-reveal class="nl-chip">Newsletter</span>
      <h2 v-reveal="100" class="font-marca text-white text-[2.5rem] md:text-6xl leading-[1.02] mt-5 mb-5">
        Recibí recetas keto<br />y descuentos exclusivos
      </h2>
      <p v-reveal="180" class="font-texto font-bold text-white text-xl max-w-lg mx-auto mb-10">
        Unite a más de 500 personas que ya transformaron su alimentación con CEKETO.
      </p>

      <form v-reveal="240" @submit.prevent="subscribe" class="nl-form">
        <input
          v-model="email"
          type="email"
          placeholder="tu@email.com"
          required
          aria-label="Tu email"
          class="nl-input"
        />
        <button type="submit" :disabled="subscribed" class="nl-boton">
          {{ subscribed ? '¡Suscripto! ✓' : 'Suscribirme' }}
        </button>
      </form>

      <p class="nl-chica">Sin spam. Podés darte de baja cuando quieras.</p>
    </div>
  </section>
</template>

<script setup>
import { publico } from '@/brand/publico'
import { ref } from 'vue'
import BrandBackdrop from '@/components/brand/BrandBackdrop.vue'

const email = ref('')
const subscribed = ref(false)

function subscribe() {
  if (!email.value) return
  subscribed.value = true
  email.value = ''
  setTimeout(() => { subscribed.value = false }, 4000)
}
</script>

<style scoped>
.nl-patron {
  position: absolute;
  inset: -10% -5%;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  transform: rotate(-6deg);
  pointer-events: none;
}
.nl-fila {
  display: flex;
  width: max-content;
  white-space: nowrap;
  font-family: 'CK Comodo', 'Poppins', sans-serif;
  font-size: clamp(2.5rem, 7vw, 5.5rem);
  letter-spacing: .06em;
  line-height: 1;
  color: rgba(255,253,248,.09);
  animation: nl-correr 60s linear infinite;
}
.nl-fila-inv { animation-direction: reverse; animation-duration: 75s; }
@keyframes nl-correr { from { transform: translateX(0); } to { transform: translateX(-50%); } }

.nl-sello {
  position: absolute;
  width: 170px;
  right: 6%;
  top: 14%;
  animation: nl-girar 30s linear infinite;
  filter: drop-shadow(0 18px 24px rgba(0,0,0,.25));
  z-index: 5;
}
@keyframes nl-girar { to { transform: rotate(360deg); } }

.nl-chip {
  display: inline-block;
  padding: .45rem 1rem;
  border-radius: 999px;
  background: #FFFDF8;
  color: #C44117;
  font-family: 'CK Comodo', 'Poppins', sans-serif;
  font-size: 13px;
  letter-spacing: .2em;
  text-transform: uppercase;
}

.nl-form {
  display: flex;
  flex-direction: column;
  gap: .7rem;
  max-width: 470px;
  margin: 0 auto;
  padding: .45rem;
  border-radius: 999px;
  background: #FFFDF8;
  box-shadow: 0 24px 50px -24px rgba(0,0,0,.45);
}
@media (max-width: 639px) { .nl-form { border-radius: 26px; } }
@media (min-width: 640px) { .nl-form { flex-direction: row; } }
.nl-input {
  flex: 1;
  min-width: 0;
  padding: .9rem 1.2rem;
  border-radius: 999px;
  background: transparent;
  color: #17302B;
  font: 400 16px/1 'Poppins', sans-serif;
  outline: none;
}
.nl-input::placeholder { color: rgba(23,48,43,.45); }
.nl-boton {
  padding: .95rem 1.7rem;
  border-radius: 999px;
  background: #047764;
  color: #fff;
  font: 600 15px/1 'Poppins', sans-serif;
  letter-spacing: .02em;
  white-space: nowrap;
  transition: transform .3s cubic-bezier(.3,1.6,.5,1), background .3s;
}
.nl-boton:hover:not(:disabled) { transform: scale(1.04); background: #0E4F45; }
.nl-boton:disabled { opacity: .8; }

.nl-chica {
  display: inline-block;
  margin-top: 1.1rem;
  padding: .35rem .85rem;
  border-radius: 999px;
  background: rgba(15,36,32,.3);
  color: #FFFDF8;
  font: 500 12.5px/1.3 'Poppins', sans-serif;
}
</style>
