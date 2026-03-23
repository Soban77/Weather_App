const API_BASE = '/api';

let token = null;
let currentUser = null;
let currentWeather = null;

// DOM elements
const authSection = document.getElementById('auth-section');
const appSection = document.getElementById('app-section');
const usernameDisplay = document.getElementById('username-display');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const logoutBtn = document.getElementById('logout-btn');
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-weather');
const weatherResult = document.getElementById('weather-result');
const saveWeatherBtn = document.getElementById('save-weather-btn');
const savedList = document.getElementById('saved-list');

// Helper: save token & user to localStorage
function setAuth(tokenValue, user) {
  token = tokenValue;
  currentUser = user;
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

// Helper: clear auth
function clearAuth() {
  token = null;
  currentUser = null;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

// Check if already logged in
function loadStoredAuth() {
  const storedToken = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');
  if (storedToken && storedUser) {
    token = storedToken;
    currentUser = JSON.parse(storedUser);
    showApp();
    fetchSavedWeather();
  }
}

// Show main app, hide auth
function showApp() {
  authSection.classList.add('hidden');
  appSection.classList.remove('hidden');
  usernameDisplay.textContent = currentUser.username;
}

// Show auth, hide app
function showAuth() {
  authSection.classList.remove('hidden');
  appSection.classList.add('hidden');
  clearAuth();
  currentWeather = null;
  weatherResult.classList.add('hidden');
  saveWeatherBtn.classList.add('hidden');
}

// Fetch saved weather from server
async function fetchSavedWeather() {
  try {
    const res = await fetch(`${API_BASE}/saved`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch saved weather');
    const data = await res.json();
    renderSavedWeather(data);
  } catch (err) {
    console.error(err);
    showToast('Could not load saved weather', 'error');
  }
}

// Render saved weather cards
function renderSavedWeather(entries) {
  if (entries.length === 0) {
    savedList.innerHTML = '<div class="col-span-full text-center text-white/70">No saved weather yet. Search and save some!</div>';
    return;
  }

  savedList.innerHTML = entries.map(entry => `
    <div class="bg-white/20 rounded-xl p-4 backdrop-blur-sm border border-white/30 hover:scale-105 transition-transform">
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-xl font-bold text-white">${escapeHtml(entry.city)}</h3>
        <button data-id="${entry.id}" class="delete-saved text-red-300 hover:text-red-500">✕</button>
      </div>
      <div class="flex items-center gap-3">
        <img src="https://openweathermap.org/img/wn/${entry.icon}@2x.png" alt="weather icon" class="w-12 h-12">
        <div>
          <p class="text-white text-2xl font-semibold">${entry.temperature}°C</p>
          <p class="text-white/80 capitalize">${entry.condition}</p>
        </div>
      </div>
      <p class="text-white/60 text-sm mt-2">Saved: ${new Date(entry.saved_at).toLocaleString()}</p>
    </div>
  `).join('');

  // Add delete listeners
  document.querySelectorAll('.delete-saved').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = btn.dataset.id;
      await deleteSavedWeather(id);
    });
  });
}

// Delete a saved weather entry
async function deleteSavedWeather(id) {
  try {
    const res = await fetch(`${API_BASE}/saved/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Delete failed');
    fetchSavedWeather(); // refresh list
    showToast('Entry deleted', 'success');
  } catch (err) {
    console.error(err);
    showToast('Could not delete', 'error');
  }
}

// Search weather
async function searchWeather(city) {
  try {
    const res = await fetch(`${API_BASE}/weather?city=${encodeURIComponent(city)}`);
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Weather fetch failed');
    }
    const data = await res.json();
    currentWeather = data;
    displayWeather(data);
    saveWeatherBtn.classList.remove('hidden');
  } catch (err) {
    showToast(err.message, 'error');
    weatherResult.classList.add('hidden');
    saveWeatherBtn.classList.add('hidden');
  }
}

// Display weather in UI
function displayWeather(weather) {
  weatherResult.innerHTML = `
    <div class="flex items-center justify-between bg-white/20 rounded-xl p-4">
      <div>
        <h3 class="text-2xl font-bold text-white">${escapeHtml(weather.city)}</h3>
        <p class="text-white text-4xl font-bold mt-2">${weather.temperature}°C</p>
        <p class="text-white/80 capitalize">${weather.condition}</p>
        <div class="mt-2 text-white/70 text-sm">
          <p>Humidity: ${weather.humidity}%</p>
          <p>Wind: ${weather.windSpeed} m/s</p>
        </div>
      </div>
      <img src="https://openweathermap.org/img/wn/${weather.icon}@4x.png" alt="weather icon" class="w-24 h-24">
    </div>
  `;
  weatherResult.classList.remove('hidden');
}

// Save current weather to DB
async function saveCurrentWeather() {
  if (!currentWeather) return;
  try {
    const res = await fetch(`${API_BASE}/saved`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        city: currentWeather.city,
        temperature: currentWeather.temperature,
        condition: currentWeather.condition,
        icon: currentWeather.icon
      })
    });
    if (!res.ok) throw new Error('Save failed');
    const saved = await res.json();
    showToast(`Weather for ${saved.city} saved!`, 'success');
    fetchSavedWeather(); // refresh list
  } catch (err) {
    console.error(err);
    showToast('Could not save weather', 'error');
  }
}

// Helper: simple toast notification
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white ${
    type === 'error' ? 'bg-red-600' : type === 'success' ? 'bg-green-600' : 'bg-blue-600'
  } z-50 transition-all duration-300`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// Auth handlers
async function handleLogin() {
  const username = usernameInput.value.trim();
  const password = passwordInput.value;
  if (!username || !password) {
    showToast('Please enter username and password', 'error');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Login failed');
    }
    const data = await res.json();
    setAuth(data.token, data.user);
    showApp();
    fetchSavedWeather();
    usernameInput.value = '';
    passwordInput.value = '';
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function handleSignup() {
  const username = usernameInput.value.trim();
  const password = passwordInput.value;
  if (!username || !password) {
    showToast('Please enter username and password', 'error');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Signup failed');
    }
    const data = await res.json();
    setAuth(data.token, data.user);
    showApp();
    fetchSavedWeather();
    usernameInput.value = '';
    passwordInput.value = '';
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function handleLogout() {
  showAuth();
}

// Simple escape to prevent XSS
function escapeHtml(str) {
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}

// Event listeners
loginBtn.addEventListener('click', handleLogin);
signupBtn.addEventListener('click', handleSignup);
logoutBtn.addEventListener('click', handleLogout);
searchBtn.addEventListener('click', () => {
  const city = cityInput.value.trim();
  if (city) searchWeather(city);
});
saveWeatherBtn.addEventListener('click', saveCurrentWeather);
cityInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') searchBtn.click();
});

// Initial load
loadStoredAuth();