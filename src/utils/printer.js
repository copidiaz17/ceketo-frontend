// WebUSB + ESC/POS para Xprinter XP-58 (58mm)
// Se conecta directo al puerto USB sin diálogo de Windows

const ESC = 0x1B
const GS  = 0x1D
const LF  = 0x0A

let device   = null
let endpoint = null

// Normaliza caracteres especiales del español al code page de la impresora
function normalizar(str) {
  return String(str)
    .replace(/á/g, 'a').replace(/Á/g, 'A')
    .replace(/é/g, 'e').replace(/É/g, 'E')
    .replace(/í/g, 'i').replace(/Í/g, 'I')
    .replace(/ó/g, 'o').replace(/Ó/g, 'O')
    .replace(/ú/g, 'u').replace(/Ú/g, 'U')
    .replace(/ü/g, 'u').replace(/Ü/g, 'U')
    .replace(/ñ/g, 'n').replace(/Ñ/g, 'N')
    .replace(/¡/g, '!').replace(/¿/g, '?')
}

function txt(str) {
  const s = normalizar(str)
  return new TextEncoder().encode(s)
}

function bytes(...args) {
  return new Uint8Array(args)
}

function concat(...arrays) {
  const total = arrays.reduce((n, a) => n + a.length, 0)
  const out   = new Uint8Array(total)
  let offset  = 0
  for (const a of arrays) {
    out.set(a, offset)
    offset += a.length
  }
  return out
}

// Línea de texto con padding derecho para alinear precios
// col1: texto izquierda, col2: texto derecha, width: 32 chars
function lineaCols(col1, col2, width = 32) {
  const c1 = normalizar(String(col1))
  const c2 = normalizar(String(col2))
  const spaces = Math.max(1, width - c1.length - c2.length)
  return txt(c1 + ' '.repeat(spaces) + c2 + '\n')
}

function linea(str) {
  return txt(normalizar(str) + '\n')
}

function separador(char = '-', width = 32) {
  return txt(char.repeat(width) + '\n')
}

export async function conectarImpresora() {
  if (!navigator.usb) throw new Error('WebUSB no soportado en este navegador. Usá Chrome o Edge.')

  // Si ya hay un dispositivo conectado intentar reconectar
  const devices = await navigator.usb.getDevices()
  const saved   = devices.find(d => d.opened || true)
  device = saved || await navigator.usb.requestDevice({ filters: [] })

  await device.open()
  if (device.configuration === null) await device.selectConfiguration(1)

  // Buscar interfaz de impresora (clase 7) o la primera disponible
  let iface = null
  for (const cfg of device.configurations) {
    for (const i of cfg.interfaces) {
      for (const alt of i.alternates) {
        if (alt.interfaceClass === 7 || alt.interfaceClass === 0xFF) {
          iface = i
          break
        }
      }
      if (iface) break
    }
    if (iface) break
  }
  if (!iface) iface = device.configuration.interfaces[0]

  await device.claimInterface(iface.interfaceNumber)

  // Buscar endpoint bulk OUT
  const alt = iface.alternates[0]
  for (const ep of alt.endpoints) {
    if (ep.direction === 'out' && ep.type === 'bulk') {
      endpoint = ep.endpointNumber
      break
    }
  }
  if (endpoint === null) throw new Error('No se encontró endpoint de impresión')

  return true
}

async function enviar(data) {
  if (!device || !device.opened) await conectarImpresora()
  await device.transferOut(endpoint, data)
}

export async function imprimirTicketESCPOS({ id, items, total, descuento, metodo_pago, fecha }) {
  const metodoLabel = {
    efectivo: 'Efectivo', transferencia: 'Transferencia',
    debito: 'Debito', credito: 'Credito', qr: 'QR',
  }[metodo_pago] || metodo_pago || '-'

  const fechaStr = new Date(fecha).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' })
  const horaStr  = new Date(fecha).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })

  // Agrupar items por categoría
  const grupos = {}
  for (const item of (items || [])) {
    const cat = item.categoria || item.producto?.categoria?.nombre || 'Otros'
    if (!grupos[cat]) grupos[cat] = []
    grupos[cat].push(item)
  }

  let partes = [
    // Inicializar impresora
    bytes(ESC, 0x40),
    // Centrar
    bytes(ESC, 0x61, 0x01),
    // Doble tamaño
    bytes(ESC, 0x21, 0x30),
    linea('CEKETO'),
    // Normal
    bytes(ESC, 0x21, 0x00),
    linea('Independencia 663'),
    linea('Santiago del Estero'),
    separador('-'),
    // Alinear izquierda
    bytes(ESC, 0x61, 0x00),
    linea(`Pedido #${id}`),
    linea(`Fecha: ${fechaStr} ${horaStr} hs`),
    linea(`Pago: ${metodoLabel}`),
    separador('-'),
  ]

  for (const [cat, catItems] of Object.entries(grupos)) {
    partes.push(bytes(ESC, 0x45, 0x01)) // bold on
    partes.push(linea(normalizar(cat.toUpperCase())))
    partes.push(bytes(ESC, 0x45, 0x00)) // bold off
    for (const item of catItems) {
      const nombre   = item.nombre || item.producto?.nombre || '-'
      const precio   = parseFloat(item.precio || item.precio_unit || 0)
      const cantidad = item.cantidad || 1
      const subtotal = precio * cantidad
      // Nombre del producto (truncar si es muy largo)
      const nombreCorto = normalizar(nombre).substring(0, 28)
      partes.push(linea(nombreCorto))
      partes.push(lineaCols(`  ${cantidad}x $${precio.toLocaleString('es-AR')}`, `$${subtotal.toLocaleString('es-AR')}`))
    }
  }

  partes.push(separador('-'))

  if (descuento > 0) {
    partes.push(lineaCols(`Descuento (${descuento}%)`, 'aplicado'))
  }

  // Total en doble tamaño
  partes.push(bytes(ESC, 0x21, 0x30))
  partes.push(lineaCols('TOTAL', `$${Number(total).toLocaleString('es-AR')}`))
  partes.push(bytes(ESC, 0x21, 0x00))

  partes.push(separador('-'))
  partes.push(bytes(ESC, 0x61, 0x01)) // centrar
  partes.push(linea('Gracias por tu compra!'))
  partes.push(linea(''))
  partes.push(linea(''))
  partes.push(linea(''))

  // Cortar papel
  partes.push(bytes(GS, 0x56, 0x01))

  const data = concat(...partes)
  await enviar(data)
}
