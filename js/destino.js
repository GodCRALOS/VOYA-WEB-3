import { obtenerPaisPorCodigo, textoIdiomas, textoMonedas } from './API/countries.js';
import { buscarCoordenadas } from './API/Geolocalizador.js';
import { obtenerClima } from './API/weather.js';
import { getFavorites, saveItinerary, getItinerary } from './almacen/storage.js';
import { toggleFavorite } from './almacen/favorites.js';

const aliases = { madrid: 'es', cartagena: 'co', paris: 'fr', roma: 'it', 'ciudad-de-mexico': 'mx', tokio: 'jp' };
const params = new URLSearchParams(location.search);
const requestedId = (params.get('id') || 'es').toLowerCase();
const code = aliases[requestedId] || requestedId;
const $ = id => document.getElementById(id);
const put = (id, value) => { const element = $(id); if (element) element.textContent = value; };
let currentCountry = null;
let currentCapital = '';

function describeWeather(code) {
  if (code === 0) return ['☀️', 'Despejado'];
  if ([1, 2].includes(code)) return ['🌤️', 'Parcialmente nublado'];
  if (code === 3) return ['☁️', 'Nublado'];
  if ([45, 48].includes(code)) return ['🌫️', 'Niebla'];
  if (code >= 51 && code <= 57) return ['🌦️', 'Llovizna'];
  if (code >= 61 && code <= 67) return ['🌧️', 'Lluvia'];
  if (code >= 71 && code <= 77) return ['❄️', 'Nieve'];
  if (code >= 80 && code <= 82) return ['🌦️', 'Chubascos'];
  if (code >= 95) return ['⛈️', 'Tormenta'];
  return ['🌡️', 'Sin datos'];
}
function paintForecast(weather) {
  put('weather-temp', `${weather.temperatura} °C`);
  put('weather-wind', `${weather.viento} km/h`);
  put('weather-rain', weather.lluviaHoy === null ? 'No disponible' : `${weather.lluviaHoy} %`);
  const forecast = $('weather-forecast');
  if (!forecast) return;
  forecast.replaceChildren();
  weather.dias.forEach((day, index) => {
    const [icon, label] = describeWeather(day.codigo);
    const item = document.createElement('div');
    item.className = 'forecast__day';
    const name = document.createElement('span'); name.className = 'forecast__name';
    name.textContent = index === 0 ? 'Hoy' : new Date(`${day.fecha}T00:00:00`).toLocaleDateString('es', { weekday: 'short' });
    const symbol = document.createElement('span'); symbol.className = 'forecast__icon'; symbol.textContent = icon; symbol.title = label;
    const max = document.createElement('strong'); max.className = 'forecast__max'; max.textContent = `${day.max}°`;
    const min = document.createElement('span'); min.className = 'forecast__min'; min.textContent = `${day.min}°`;
    item.append(name, symbol, max, min); forecast.appendChild(item);
  });
}
function favoriteItem() {
  return { id: code, title: currentCountry.name.common, image: currentCountry.flags?.svg || '', description: `${currentCapital || 'Capital no disponible'} · ${currentCountry.region || 'Destino'}` };
}
function updateFavoriteButton() {
  const button = $('btn-fav');
  if (!button || !currentCountry) return;
  const saved = getFavorites().some(item => item.id === code);
  button.textContent = saved ? '♥ Quitar de favoritos' : '♡ Añadir a favoritos';
  button.setAttribute('aria-pressed', String(saved));
}
async function init() {
  put('weather-temp', 'Cargando…');
  put('weather-wind', 'Cargando…');
  put('weather-rain', 'Cargando…');
  try {
    currentCountry = await obtenerPaisPorCodigo(code);
    const country = currentCountry;
    currentCapital = country.capital?.[0] || '';
    const countryName = country.name.common;
    document.title = `VOYA — ${countryName}`;
    put('crumb-name', countryName);
    put('dest-name', countryName);
    put('dest-intro', `${countryName}: explora información geográfica y consulta el clima de su capital.`);
    put('dest-about', country.name.official || countryName);
    put('dest-capital', currentCapital || 'No disponible');
    put('dest-region', country.region || 'No disponible');
    put('dest-subregion', country.subregion || 'No disponible');
    put('dest-population', Number(country.population || 0).toLocaleString('es-CO'));
    put('dest-languages', textoIdiomas(country.languages));
    put('dest-currency', textoMonedas(country.currencies));
    const flag = $('dest-flag');
    if (flag) { flag.src = country.flags?.svg || country.flags?.png || ''; flag.alt = `Bandera de ${countryName}`; }
    const photo = $('dest-image');
    if (photo) { photo.src = `https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80`; photo.alt = `Imagen ilustrativa de ${countryName}`; }
    const favButton = $('btn-fav');
    favButton?.addEventListener('click', () => { toggleFavorite(favoriteItem()); updateFavoriteButton(); });
    updateFavoriteButton();
    $('btn-itinerary')?.addEventListener('click', () => {
      const itinerary = getItinerary();
      if (!itinerary.some(item => item.id === code)) {
        itinerary.push({ id: code, title: countryName, capital: currentCapital, addedAt: new Date().toISOString() });
        saveItinerary(itinerary);
        alert(`${countryName} se agregó a tu itinerario.`);
      } else alert(`${countryName} ya está en tu itinerario.`);
    });

    if (currentCapital) {
      try {
        const coords = await buscarCoordenadas(currentCapital, countryName);
        put('map-place', coords.nombre);
        put('map-coords', `${coords.lat.toFixed(4)}, ${coords.lon.toFixed(4)}`);
        const map = $('dest-map');
        if (map) {
          const iframe = document.createElement('iframe');
          iframe.title = `Mapa de ${coords.nombre}`;
          iframe.loading = 'lazy';
          iframe.src = `https://www.openstreetmap.org/export/embed.html?bbox=${coords.lon - 0.08}%2C${coords.lat - 0.05}%2C${coords.lon + 0.08}%2C${coords.lat + 0.05}&layer=mapnik&marker=${coords.lat}%2C${coords.lon}`;
          map.replaceChildren(iframe);
        }
        try { paintForecast(await obtenerClima(coords.lat, coords.lon)); }
        catch (error) { put('weather-temp', 'No disponible'); put('weather-wind', 'No disponible'); put('weather-rain', 'No disponible'); console.error(error); }
      } catch (error) { put('map-coords', 'No se pudieron obtener las coordenadas.'); put('weather-temp', 'No disponible'); put('weather-wind', 'No disponible'); put('weather-rain', 'No disponible'); console.error(error); }
    } else { put('weather-temp', 'Capital no disponible'); put('weather-wind', 'No disponible'); put('weather-rain', 'No disponible'); }
  } catch (error) {
    put('dest-name', 'Destino no disponible');
    put('dest-intro', `${error.message} Regresa al explorador y selecciona otro país.`);
    console.error(error);
  }
}
init();
