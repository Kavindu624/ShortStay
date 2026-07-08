export function showAlert(message) {
  window.dispatchEvent(new CustomEvent('GLOBAL_ALERT', { detail: message }));
}
