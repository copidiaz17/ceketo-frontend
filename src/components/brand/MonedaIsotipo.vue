<template>
  <span class="mi" :style="{ width: tam, height: tam }" aria-hidden="true">
    <span class="mi-moneda" :class="{ 'mi-auto': auto }">
      <img class="mi-cara" :src="publico(`/marca/isotipo-${frente}.svg`)" alt="" draggable="false" />
      <img class="mi-cara mi-dorso" :src="publico(`/marca/isotipo-${dorso}.svg`)" alt="" draggable="false" />
      <span class="mi-canto"></span>
    </span>
  </span>
</template>

<script setup>
import { publico } from '@/brand/publico'
// Isotipo "CK" como moneda 3D: de un lado un color, del otro otro; gira al pasar el mouse
// (o solo, cada tanto, con auto).
defineProps({
  tam: { type: String, default: '44px' },
  frente: { type: String, default: 'verde' },
  dorso: { type: String, default: 'naranja' },
  auto: { type: Boolean, default: false },
})
</script>

<style scoped>
.mi { display: inline-block; perspective: 600px; flex-shrink: 0; }
.mi-moneda {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform .8s cubic-bezier(.3,1.4,.5,1);
}
.mi:hover .mi-moneda,
a:hover .mi-moneda,
button:hover .mi-moneda { transform: rotateY(180deg); }
.mi-auto { animation: mi-girar 7s cubic-bezier(.6,0,.3,1) infinite; }
@keyframes mi-girar {
  0%, 40%  { transform: rotateY(0deg); }
  50%, 90% { transform: rotateY(180deg); }
  100%     { transform: rotateY(360deg); }
}
.mi-cara {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  transform: translateZ(2px);
  filter: drop-shadow(0 4px 8px rgba(23,48,43,.18));
}
.mi-dorso { transform: rotateY(180deg) translateZ(2px); }
/* canto: da grosor a la moneda */
.mi-canto {
  position: absolute;
  inset: 3%;
  border-radius: 50%;
  background: #0b5a4c;
  transform: translateZ(0);
}
</style>
