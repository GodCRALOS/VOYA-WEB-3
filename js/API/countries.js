// REST Countries: información pública de países, sin API Key.
const API_COUNTRIES = 'https://restcountries.com/v3.1';
let countriesCache = null;

export async function obtenerPaises() {
  if (countriesCache) return countriesCache;
  const fields = 'name,cca2,capital,region,subregion,population,flags,languages,currencies,latlng';
  const response = await fetch(`${API_COUNTRIES}/all?fields=${fields}`);
  if (!response.ok) throw new Error(`No fue posible cargar los países (${response.status}).`);
  const data = await response.json();
  countriesCache = data.filter(country => country.name?.common && country.cca2)
    .sort((a, b) => a.name.common.localeCompare(b.name.common, 'es'));
  return countriesCache;
}

export async function obtenerPaisPorCodigo(code) {
  const response = await fetch(`${API_COUNTRIES}/alpha/${encodeURIComponent(code)}?fields=name,cca2,capital,region,subregion,population,flags,languages,currencies,latlng,maps`);
  if (!response.ok) throw new Error('No se encontró información para este país.');
  const data = await response.json();
  return Array.isArray(data) ? data[0] : data;
}

export function textoIdiomas(languages = {}) {
  return Object.values(languages).join(', ') || 'No disponible';
}

export function textoMonedas(currencies = {}) {
  const values = Object.values(currencies).map(currency => `${currency.name}${currency.symbol ? ` (${currency.symbol})` : ''}`);
  return values.join(', ') || 'No disponible';
}
