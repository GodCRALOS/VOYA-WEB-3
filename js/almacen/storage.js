// Acceso centralizado y validado a LocalStorage.
const FAVORITES_KEY = 'voya_favorites';
const ITINERARY_KEY = 'voya_itinerary';

function readList(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(value) ? value : [];
  } catch (error) {
    console.error(`No se pudo leer ${key}:`, error);
    return [];
  }
}
function writeList(key, items) {
  try {
    localStorage.setItem(key, JSON.stringify(items));
    return true;
  } catch (error) {
    console.error(`No se pudo guardar ${key}:`, error);
    return false;
  }
}
export const getFavorites = () => readList(FAVORITES_KEY);
export const saveFavorites = items => writeList(FAVORITES_KEY, items);
export const getItinerary = () => readList(ITINERARY_KEY);
export const saveItinerary = items => writeList(ITINERARY_KEY, items);
