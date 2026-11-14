// Geocodificación pública de Open-Meteo. No requiere clave y complementa REST Countries.
const API_GEOCODIFICACION = 'https://geocoding-api.open-meteo.com/v1/search';

async function buscarCoordenadas(ciudad, pais = '') {
  const consulta = [ciudad, pais].filter(Boolean).join(', ');
  const url = `${API_GEOCODIFICACION}?name=${encodeURIComponent(ciudad)}&count=10&language=es&format=json`;
  const respuesta = await fetch(url);
  if (!respuesta.ok) throw new Error(`Error de geocodificación (${respuesta.status}).`);
  const datos = await respuesta.json();
  const resultados = datos.results || [];
  const resultado = resultados.find(item => !pais || item.country?.toLowerCase() === pais.toLowerCase()) || resultados[0];
  if (!resultado) throw new Error(`No se encontraron coordenadas para ${consulta}.`);
  return {
    lat: Number(resultado.latitude),
    lon: Number(resultado.longitude),
    nombre: [resultado.name, resultado.admin1, resultado.country].filter(Boolean).join(', ')
  };
}

export { buscarCoordenadas };
