// dashboard.js
// Add your JavaScript code for dashboard functionality here.
// Example: DOMContentLoaded event handler

document.addEventListener('DOMContentLoaded', function() {
  // Example: update healthLine status
  const healthLine = document.getElementById('healthLine');
  if (healthLine) {
    healthLine.textContent = 'API: online';
  }

  // Add more dashboard logic here as needed
});

