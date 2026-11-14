import { obtenerPaises } from './API/countries.js';
import { getFavorites } from './almacen/storage.js';
import { toggleFavorite } from './almacen/favorites.js';

const grid = document.getElementById('destinations-grid');
const search = document.getElementById('q');
const region = document.getElementById('category');
const status = document.getElementById('explore-status');
const form = document.getElementById('explore-form');
let countries = [];

function showStatus(message, isError = false) {
  if (!status) return;
  status.textContent = message;
  status.classList.toggle('status-error', isError);
}
function makeCard(country) {
  const id = country.cca2.toLowerCase();
  const favorite = getFavorites().some(item => item.id === id);
  const capital = country.capital?.[0] || 'Sin capital registrada';
  const card = document.createElement('article');
  card.className = 'destination-card';
  const image = document.createElement('img');
  image.className = 'destination-card__image country-flag';
  image.src = country.flags?.svg || country.flags?.png || '';
  image.alt = `Bandera de ${country.name.common}`;
  image.loading = 'lazy';
  const body = document.createElement('div');
  body.className = 'destination-card__body';
  const heading = document.createElement('div');
  heading.className = 'card-row';
  const title = document.createElement('h3');
  title.textContent = country.name.common;
  const badge = document.createElement('span');
  badge.className = 'heart';
  badge.textContent = favorite ? '♥' : '♡';
  badge.setAttribute('aria-label', favorite ? 'Guardado en favoritos' : 'No está en favoritos');
  heading.append(title, badge);
  const meta = document.createElement('p');
  meta.className = 'destination-card__meta';
  meta.textContent = `${capital} · ${country.region || 'Región no disponible'} · ${Number(country.population || 0).toLocaleString('es-CO')} habitantes`;
  const actions = document.createElement('div');
  actions.className = 'card-row';
  const view = document.createElement('a');
  view.className = 'btn btn--primary btn--small';
  view.href = `destino.html?id=${encodeURIComponent(id)}`;
  view.textContent = 'Ver detalles →';
  const fav = document.createElement('button');
  fav.type = 'button';
  fav.className = 'btn btn--outline btn--small';
  fav.textContent = favorite ? 'Quitar favorito' : '♡ Favorito';
  fav.addEventListener('click', () => {
    toggleFavorite({ id, title: country.name.common, image: image.src, description: `${capital} · ${country.region || 'Destino'}` });
    const nowFavorite = getFavorites().some(item => item.id === id);
    fav.textContent = nowFavorite ? 'Quitar favorito' : '♡ Favorito';
    badge.textContent = nowFavorite ? '♥' : '♡';
    showStatus(nowFavorite ? `${country.name.common} se agregó a tus favoritos.` : `${country.name.common} se quitó de tus favoritos.`);
  });
  actions.append(view, fav);
  body.append(heading, meta, actions);
  card.append(image, body);
  return card;
}
function render() {
  const term = (search?.value || '').trim().toLocaleLowerCase('es');
  const selectedRegion = region?.value || '';
  const filtered = countries.filter(country => {
    const name = country.name.common.toLocaleLowerCase('es');
    const capital = (country.capital || []).join(' ').toLocaleLowerCase('es');
    return (!term || name.includes(term) || capital.includes(term)) && (!selectedRegion || country.region === selectedRegion);
  });
  grid.replaceChildren();
  filtered.forEach(country => grid.appendChild(makeCard(country)));
  showStatus(`${filtered.length} destino(s) encontrado(s).`);
  if (!filtered.length) showStatus('No encontramos destinos con esos criterios. Prueba otra búsqueda.', true);
}

async function init() {
  showStatus('Cargando destinos desde REST Countries…');
  if (grid) grid.setAttribute('aria-busy', 'true');
  try {
    countries = await obtenerPaises();
    render();
    const params = new URLSearchParams(location.search);
    if (search && params.get('destino')) search.value = params.get('destino');
    if (search && params.get('id')) {
      const legacy = params.get('id');
      const legacyNames = { madrid: 'Spain', cartagena: 'Colombia', paris: 'France', roma: 'Italy', 'ciudad-de-mexico': 'Mexico', tokio: 'Japan' };
      search.value = legacyNames[legacy] || legacy;
    }
    render();
  } catch (error) {
    showStatus(`${error.message} Comprueba tu conexión e inténtalo de nuevo.`, true);
    grid.innerHTML = '<p class="notice">No se pudieron cargar los destinos. Recarga la página para intentarlo nuevamente.</p>';
  } finally {
    if (grid) grid.setAttribute('aria-busy', 'false');
  }
}
search?.addEventListener('input', render);
region?.addEventListener('change', render);
form?.addEventListener('submit', event => { event.preventDefault(); render(); });
init();
