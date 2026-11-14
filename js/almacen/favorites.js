import { getFavorites, saveFavorites } from './storage.js';

export function isFavorite(id) {
  return getFavorites().some(item => item.id === id);
}
export function addFavorite(item) {
  if (!item?.id || isFavorite(item.id)) return false;
  return saveFavorites([...getFavorites(), item]);
}
export function removeFavorite(id) {
  return saveFavorites(getFavorites().filter(item => item.id !== id));
}
export function toggleFavorite(item) {
  if (isFavorite(item.id)) {
    removeFavorite(item.id);
    return false;
  }
  addFavorite(item);
  return true;
}

export function renderFavorites() {
  const container = document.getElementById('favorites-container');
  if (!container) return;
  const favorites = getFavorites();
  const empty = document.getElementById('favorites-empty');
  if (empty) empty.hidden = favorites.length > 0;
  container.replaceChildren();

  favorites.forEach(item => {
    const card = document.createElement('article');
    card.className = 'destination-card';
    if (item.image) {
      const image = document.createElement('img');
      image.className = 'destination-card__image';
      image.src = item.image;
      image.alt = item.title || 'Destino favorito';
      image.loading = 'lazy';
      card.appendChild(image);
    }
    const body = document.createElement('div');
    body.className = 'destination-card__body';
    const title = document.createElement('h3');
    title.textContent = item.title || 'Destino';
    const description = document.createElement('p');
    description.className = 'destination-card__meta';
    description.textContent = item.description || 'Guardado en tus favoritos.';
    const actions = document.createElement('div');
    actions.className = 'card-row';
    const view = document.createElement('a');
    view.className = 'btn btn--primary btn--small';
    view.href = `destino.html?id=${encodeURIComponent(item.id)}`;
    view.textContent = 'Ver detalle →';
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'btn btn--outline btn--small';
    remove.textContent = 'Quitar';
    remove.addEventListener('click', () => {
      removeFavorite(item.id);
      renderFavorites();
    });
    actions.append(view, remove);
    body.append(title, description, actions);
    card.appendChild(body);
    container.appendChild(card);
  });
}
