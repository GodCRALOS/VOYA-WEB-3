import { getItinerary, saveItinerary } from './almacen/storage.js';
const list = document.getElementById('itinerary-list');
const empty = document.getElementById('itinerary-empty');
const form = document.getElementById('trip-form');
const feedback = document.getElementById('trip-feedback');
const tripsKey = 'voya_trip_plans';
function getTrips() { try { const value = JSON.parse(localStorage.getItem(tripsKey) || '[]'); return Array.isArray(value) ? value : []; } catch { return []; } }
function render() {
  if (!list) return;
  const items = getItinerary();
  if (empty) empty.hidden = items.length > 0;
  list.replaceChildren();
  items.forEach(item => {
    const card = document.createElement('article'); card.className = 'destination-card';
    const body = document.createElement('div'); body.className = 'destination-card__body';
    const title = document.createElement('h3'); title.textContent = item.title;
    const meta = document.createElement('p'); meta.className = 'destination-card__meta'; meta.textContent = `Capital: ${item.capital || 'No disponible'}`;
    const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'btn btn--outline btn--small'; remove.textContent = 'Quitar del itinerario';
    remove.addEventListener('click', () => { saveItinerary(getItinerary().filter(entry => entry.id !== item.id)); render(); });
    body.append(title, meta, remove); card.appendChild(body); list.appendChild(card);
  });
}
form?.addEventListener('submit', event => {
  event.preventDefault();
  const data = new FormData(form);
  const start = data.get('start'); const end = data.get('end');
  if (end < start) { feedback.textContent = 'La fecha de finalización no puede ser anterior a la fecha de inicio.'; feedback.classList.add('status-error'); return; }
  const plan = { id: Date.now(), name: String(data.get('name')).trim(), destination: String(data.get('destination')).trim(), start, end, travelers: Number(data.get('travelers')), budget: Number(data.get('budget') || 0), notes: String(data.get('notes') || '').trim() };
  const trips = getTrips(); trips.push(plan); localStorage.setItem(tripsKey, JSON.stringify(trips));
  feedback.textContent = '¡Tu plan de viaje se guardó en este navegador!'; feedback.classList.remove('status-error'); form.reset(); renderPlans();
});
function renderPlans() {
  const container = document.getElementById('saved-plans'); if (!container) return;
  container.replaceChildren();
  getTrips().forEach(plan => {
    const card = document.createElement('article'); card.className = 'info-card';
    const heading = document.createElement('h3'); heading.textContent = plan.name;
    const detail = document.createElement('p'); detail.textContent = `${plan.destination} · ${plan.start} al ${plan.end} · ${plan.travelers} viajero(s) · Presupuesto: ${plan.budget ? `${plan.budget.toLocaleString('es-CO')} COP` : 'No definido'}`;
    const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'btn btn--outline btn--small'; remove.textContent = 'Eliminar plan';
    remove.addEventListener('click', () => { localStorage.setItem(tripsKey, JSON.stringify(getTrips().filter(item => item.id !== plan.id))); renderPlans(); });
    card.append(heading, detail); if (plan.notes) { const note = document.createElement('p'); note.textContent = `Notas: ${plan.notes}`; card.appendChild(note); } card.appendChild(remove); container.appendChild(card);
  });
}
render(); renderPlans();
