
document addEvent Listener'DOMContentLoaded'(() => {
  // Example: update healthLine status
  const healthLine = document.getElementById('healthLine');
  if (healthLine) {
    healthLine.textContent = 'API: online';
  }
});

