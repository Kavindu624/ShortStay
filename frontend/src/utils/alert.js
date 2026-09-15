export function showAlert(message, type = 'error') {
  window.dispatchEvent(new CustomEvent('GLOBAL_ALERT', { detail: { message, type } }));
}
