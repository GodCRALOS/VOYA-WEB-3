const form = document.getElementById('support-form');
form?.addEventListener('submit', event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const subject = encodeURIComponent(`Consulta VOYA: ${data.get('tema')}`);
  const body = encodeURIComponent(`Nombre: ${data.get('nombre')}\nCorreo: ${data.get('correo')}\nTema: ${data.get('tema')}\n\n${data.get('mensaje')}`);
  const feedback = document.getElementById('support-feedback');
  feedback.textContent = 'Se abrirá tu aplicación de correo para que puedas enviar la consulta.';
  location.href = `mailto:contacto@voya.co?subject=${subject}&body=${body}`;
});
