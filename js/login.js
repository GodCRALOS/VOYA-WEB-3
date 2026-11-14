const form = document.getElementById('login-form');
form?.addEventListener('submit', event => {
  event.preventDefault();
  alert('El inicio de sesión todavía no está conectado a un sistema de cuentas. Esta versión académica funciona sin registro.');
});
