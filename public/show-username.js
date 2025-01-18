const urlParams = new URLSearchParams(window.location.search);
const username = urlParams.get('username');
document.getElementById('username-display').textContent = username || 'Guest';