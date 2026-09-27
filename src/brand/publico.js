// Ruta a un archivo de /public respetando la base del sitio
// (en producción es "/", en la demo de GitHub Pages es "/ceketo-frontend/").
export const publico = ruta => import.meta.env.BASE_URL + ruta.replace(/^\//, '')
