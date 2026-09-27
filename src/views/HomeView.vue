<template>
  <main>
    <HeroSlideshow />
    <SloganMarquee fondo="verde" inclinado />
    <Categories />
    <FeaturedProducts />
    <MosaicoBanda />
    <AboutKeto />
    <Newsletter />
  </main>
</template>

<script setup>
import HeroSlideshow from '@/components/HeroSlideshow.vue'
import Categories from '@/components/Categories.vue'
import FeaturedProducts from '@/components/FeaturedProducts.vue'
import AboutKeto from '@/components/AboutKeto.vue'
import Newsletter from '@/components/Newsletter.vue'
import SloganMarquee from '@/components/brand/SloganMarquee.vue'
import MosaicoBanda from '@/components/brand/MosaicoBanda.vue'
</script>
