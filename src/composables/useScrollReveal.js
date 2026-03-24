import { onMounted, onUnmounted } from 'vue'

export function useScrollReveal(refs) {
  let observer = null

  onMounted(() => {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    )

    refs.forEach((r) => {
      if (r.value) observer.observe(r.value)
    })
  })

  onUnmounted(() => {
    if (observer) observer.disconnect()
  })
}
