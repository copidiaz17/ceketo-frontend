// Animación "vuela al carrito": una copia redonda de la foto del producto
// sale de la tarjeta y cae en el ícono del carrito del header.
export function volarAlCarrito(imgEl) {
  const destino = document.getElementById('carrito-icono')
  if (!imgEl || !destino || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const a = imgEl.getBoundingClientRect()
  const b = destino.getBoundingClientRect()
  const tam = Math.min(a.width, a.height, 160)

  const clon = document.createElement('img')
  clon.src = imgEl.currentSrc || imgEl.src
  Object.assign(clon.style, {
    position: 'fixed',
    zIndex: 9999,
    left: `${a.left + a.width / 2 - tam / 2}px`,
    top: `${a.top + a.height / 2 - tam / 2}px`,
    width: `${tam}px`,
    height: `${tam}px`,
    objectFit: 'cover',
    borderRadius: '50%',
    border: '4px solid #FFFDF8',
    boxShadow: '0 18px 40px -12px rgba(23,48,43,.55)',
    pointerEvents: 'none',
  })
  document.body.appendChild(clon)

  const dx = b.left + b.width / 2 - (a.left + a.width / 2)
  const dy = b.top + b.height / 2 - (a.top + a.height / 2)

  const anim = clon.animate([
    { transform: 'translate(0, 0) scale(1)', opacity: 1 },
    { transform: `translate(${dx * 0.45}px, ${dy * 0.45 - 90}px) scale(.62) rotate(-12deg)`, opacity: 1, offset: 0.55 },
    { transform: `translate(${dx}px, ${dy}px) scale(.12) rotate(8deg)`, opacity: .6 },
  ], { duration: 820, easing: 'cubic-bezier(.5,0,.3,1)' })
  anim.onfinish = () => clon.remove()
}
