// REST Countries v5: información de países (capital, región, idiomas...).
// Documentación: https://restcountries.com/docs
// Respuesta: { data: { objects: [ {...país} ], meta: {...} } }
const API_PAISES = 'https://api.restcountries.com/countries/v5';

// Datos de referencia por si la API no está disponible (sin clave, sin red, límite superado).
// La población no se incluye a propósito: cambia cada año y mejor no mostrar un dato viejo.
const PAISES_RESPALDO = {
  es: { capital: 'Madrid', region: 'Europa', subregion: 'Europa meridional', idiomas: 'Español', moneda: 'Euro (€)' },
  co: { capital: 'Bogotá', region: 'América', subregion: 'Sudamérica', idiomas: 'Español', moneda: 'Peso colombiano ($)' },
  fr: { capital: 'París', region: 'Europa', subregion: 'Europa occidental', idiomas: 'Francés', moneda: 'Euro (€)' },
  it: { capital: 'Roma', region: 'Europa', subregion: 'Europa meridional', idiomas: 'Italiano', moneda: 'Euro (€)' },
  mx: { capital: 'Ciudad de México', region: 'América', subregion: 'Norteamérica', idiomas: 'Español', moneda: 'Peso mexicano ($)' },
  jp: { capital: 'Tokio', region: 'Asia', subregion: 'Asia oriental', idiomas: 'Japonés', moneda: 'Yen japonés (¥)' }
};

// Coordenadas de cada destino: último recurso si Nominatim falla (clave = id de DESTINOS).
const COORDENADAS_RESPALDO = {
  'madrid': { lat: 40.4168, lon: -3.7038 },
  'cartagena': { lat: 10.391, lon: -75.4794 },
  'paris': { lat: 48.8566, lon: 2.3522 },
  'roma': { lat: 41.9028, lon: 12.4964 },
  'ciudad-de-mexico': { lat: 19.4326, lon: -99.1332 },
  'tokio': { lat: 35.6762, lon: 139.6503 }
};

// La API devuelve región y subregión en inglés; traducimos las más comunes.
const TRADUCCION_REGIONES = {
  'Europe': 'Europa', 'Americas': 'América', 'Asia': 'Asia', 'Africa': 'África', 'Oceania': 'Oceanía',
  'Southern Europe': 'Europa meridional', 'Western Europe': 'Europa occidental',
  'Northern Europe': 'Europa septentrional', 'Eastern Europe': 'Europa oriental',
  'South America': 'Sudamérica', 'North America': 'Norteamérica',
  'Central America': 'Centroamérica', 'Caribbean': 'Caribe', 'Eastern Asia': 'Asia oriental'
};

function capitalizar(texto) {
  return texto ? texto.charAt(0).toUpperCase() + texto.slice(1) : texto;
}

// Intl.DisplayNames (del navegador) traduce idiomas y monedas al español sin librerías.
function nombreIdioma(idioma) {
  try {
    if (idioma.iso639_1) return capitalizar(new Intl.DisplayNames(['es'], { type: 'language' }).of(idioma.iso639_1));
  } catch (e) { /* si el navegador no lo soporta, usamos el nombre de la API */ }
  return idioma.native_name || idioma.name;
}

function nombreMoneda(moneda) {
  let nombre = moneda.name;
  try {
    nombre = capitalizar(new Intl.DisplayNames(['es'], { type: 'currency' }).of(moneda.code));
  } catch (e) { /* idem */ }
  return moneda.symbol ? nombre + ' (' + moneda.symbol + ')' : nombre;
}

async function obtenerPais(cca2) {
  // Sin clave ni siquiera intentamos la petición.
  if (typeof RESTCOUNTRIES_API_KEY === 'undefined' || !RESTCOUNTRIES_API_KEY) {
    throw new Error('SIN_CLAVE');
  }

  // /codes.alpha_2/{código}: busca por el código de 2 letras (es, co, fr...).
  // response_fields: pide solo lo que usamos (respuestas más pequeñas y rápidas).
  const url = API_PAISES + '/codes.alpha_2/' + encodeURIComponent(cca2) +
    '?response_fields=capitals,region,subregion,population,languages,currencies,coordinates';

  const respuesta = await fetch(url, {
    headers: { Authorization: 'Bearer ' + RESTCOUNTRIES_API_KEY }
  });
  if (!respuesta.ok) throw new Error('REST Countries respondió ' + respuesta.status);

  const json = await respuesta.json();
  const pais = json.data && json.data.objects && json.data.objects[0];
  if (!pais) {
    const detalle = json.errors && json.errors[0] ? json.errors[0].message : 'sin resultados';
    throw new Error('REST Countries: ' + detalle);
  }

  const capital = pais.capitals && pais.capitals[0];
  const coordenadas = capital && capital.coordinates ? capital.coordinates : pais.coordinates;

  return {
    capital: capital ? capital.name : null,
    region: TRADUCCION_REGIONES[pais.region] || pais.region,
    subregion: TRADUCCION_REGIONES[pais.subregion] || pais.subregion,
    poblacion: typeof pais.population === 'number' ? pais.population : null,
    idiomas: (pais.languages || []).map(nombreIdioma).join(', '),
    moneda: (pais.currencies || []).map(nombreMoneda).join(', '),
    lat: coordenadas ? coordenadas.lat : null,
    lon: coordenadas ? coordenadas.lng : null
  };
}
