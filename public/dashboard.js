
document.addEvent Listener'DOMContentLoaded'(() => {
  const healthLine = document.getElementById('healthLine');
  if (healthLine) {
    healthLine.textContent = 'API: online';
  }
});

