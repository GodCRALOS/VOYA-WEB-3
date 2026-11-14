// Pronóstico de Open-Meteo. Servicio gratuito para uso no comercial y sin API Key.
const API_CLIMA = 'https://api.open-meteo.com/v1/forecast';

async function obtenerClima(lat, lon) {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current: 'temperature_2m,wind_speed_10m,weather_code',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    timezone: 'auto',
    forecast_days: '5'
  });
  const respuesta = await fetch(`${API_CLIMA}?${params}`);
  if (!respuesta.ok) throw new Error(`No fue posible consultar el clima (${respuesta.status}).`);
  const datos = await respuesta.json();
  const dias = (datos.daily?.time || []).map((fecha, i) => ({
    fecha,
    codigo: datos.daily.weather_code[i],
    max: Math.round(datos.daily.temperature_2m_max[i]),
    min: Math.round(datos.daily.temperature_2m_min[i]),
    lluvia: datos.daily.precipitation_probability_max?.[i] ?? null
  }));
  return {
    temperatura: Math.round(datos.current.temperature_2m),
    viento: Math.round(datos.current.wind_speed_10m),
    codigo: datos.current.weather_code,
    lluviaHoy: dias[0]?.lluvia ?? null,
    dias
  };
}

export { obtenerClima };
