// Directivas de efectos de la tienda:
//   v-reveal            → aparece al entrar en pantalla   (v-reveal="120" = retardo en ms)
//   v-reveal:izq / :der / :giro → variantes de entrada
//   v-tilt              → inclinación 3D siguiendo el mouse (solo con mouse; en celular no hace nada)
//   v-tilt="12"         → grados máximos

const reveals = new WeakMap()
let observer = null

function getObserver() {
  if (observer) return observer
  observer = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add('visible')
        observer.unobserve(e.target)
      }
    }
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' })
  return observer
}

export const reveal = {
  mounted(el, binding) {
    el.setAttribute('data-reveal', binding.arg || '')
    if (binding.value != null) el.style.setProperty('--reveal-delay', `${binding.value}ms`)
    if (!('IntersectionObserver' in window)) { el.classList.add('visible'); return }
    getObserver().observe(el)
    reveals.set(el, true)
  },
  unmounted(el) {
    if (reveals.has(el)) getObserver().unobserve(el)
  },
}

const puedeInclinar = () =>
  window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const tilt = {
  mounted(el, binding) {
    if (!puedeInclinar()) return
    const max = Number(binding.value) || 8
    el.classList.add('ck-tilt')
    let raf = 0
    const mover = (ev) => {
      const r = el.getBoundingClientRect()
      const x = (ev.clientX - r.left) / r.width    // 0..1
      const y = (ev.clientY - r.top) / r.height
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        el.classList.add('inclinando')
        el.style.setProperty('--ry', `${((x - 0.5) * 2 * max).toFixed(2)}deg`)
        el.style.setProperty('--rx', `${((0.5 - y) * 2 * max).toFixed(2)}deg`)
        el.style.setProperty('--gx', `${(x * 100).toFixed(1)}%`)
        el.style.setProperty('--gy', `${(y * 100).toFixed(1)}%`)
      })
    }
    const salir = () => {
      cancelAnimationFrame(raf)
      el.classList.remove('inclinando')
      el.style.setProperty('--rx', '0deg')
      el.style.setProperty('--ry', '0deg')
    }
    el.addEventListener('pointermove', mover)
    el.addEventListener('pointerleave', salir)
    el._ckTilt = { mover, salir }
  },
  unmounted(el) {
    if (!el._ckTilt) return
    el.removeEventListener('pointermove', el._ckTilt.mover)
    el.removeEventListener('pointerleave', el._ckTilt.salir)
  },
}
