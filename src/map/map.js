// src/map/map.js
import { setPageTitle } from '/index.js';
import L from 'leaflet';
import { companies } from '../helpers/data.js';

setPageTitle('Map');

let map;
let markers = [];

function initMap() {
  console.log('[map.js] Initializing map');
  const mapContainer = document.getElementById('map');
  if (!mapContainer) {
    console.error('[map.js] Map container not found');
    return;
  }

  map = L.map(mapContainer).setView([39.8283, -98.5795], 2);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 18,
  }).addTo(map);

  renderMap(companies);
  setupFilters();
}

function renderMap(filteredCompanies) {
  markers.forEach(marker => marker.remove());
  markers = [];

  console.log('[map.js] Rendering map with companies:', filteredCompanies);

  if (filteredCompanies.length === 0) {
    document.getElementById('no-results').textContent = 'No companies match the filters.';
    return;
  } else {
    document.getElementById('no-results').textContent = '';
  }

  filteredCompanies.forEach(company => {
    if (company.lat && company.lng) {
      const marker = L.marker([company.lat, company.lng])
        .addTo(map)
        .bindPopup(`
          <b>${company.name}</b><br>
          Barrels: ${company.barrels.toLocaleString()}<br>
          Category: ${company.category}<br>
          Rating: ${company.rating}<br>
          Price/Barrel: $${company.pricePerBarrel}
        `);
      markers.push(marker);
    } else {
      console.warn('[map.js] Missing coordinates for company:', company.name);
    }
  });
  console.log('[map.js] Pins added to map:', markers.length);
}

function setupFilters() {
  const categorySelect = document.getElementById('category-select');
  const starRating = document.getElementById('star-rating');
  const clearStarsBtn = document.getElementById('clear-stars');
  const barrelsSlider = document.getElementById('barrels-slider');
  const barrelsValue = document.getElementById('barrels-value');
  const priceSlider = document.getElementById('price-slider');
  const priceValue = document.getElementById('price-value');
  const clearFiltersBtn = document.getElementById('clear-filters');

  let selectedRating = 0;

  // Star rating setup
  for (let i = 1; i <= 5; i++) {
    const star = document.createElement('span');
    star.textContent = '★';
    star.dataset.rating = i;
    star.addEventListener('click', () => {
      selectedRating = i;
      updateStarRating(i);
      filterCompanies();
    });
    starRating.appendChild(star);
  }

  function updateStarRating(rating) {
    const stars = starRating.querySelectorAll('span');
    stars.forEach(star => {
      star.style.color = parseInt(star.dataset.rating) <= rating ? '#f1c40f' : '#ccc';
    });
    document.getElementById('rating-value').textContent = rating === 0 ? 'All' : rating;
  }

  // Clear stars button
  clearStarsBtn.addEventListener('click', () => {
    selectedRating = 0;
    updateStarRating(0);
    filterCompanies();
  });

  // Slider value updates
  barrelsSlider.addEventListener('input', () => {
    const value = barrelsSlider.value;
    barrelsValue.textContent = `${(value / 1000000).toFixed(1)}M`;
    filterCompanies();
  });

  priceSlider.addEventListener('input', () => {
    const value = priceSlider.value;
    priceValue.textContent = `$${value}`;
    filterCompanies();
  });

  // Filter events
  categorySelect.addEventListener('change', filterCompanies);

  // Clear all filters
  clearFiltersBtn.addEventListener('click', () => {
    categorySelect.value = 'all';
    selectedRating = 0;
    updateStarRating(0);
    barrelsSlider.value = 1000000;
    barrelsValue.textContent = '1.0M';
    priceSlider.value = 92;
    priceValue.textContent = '$92';
    renderMap(companies);
  });

  function filterCompanies() {
    const category = categorySelect.value;
    const barrels = parseInt(barrelsSlider.value);
    const price = parseInt(priceSlider.value);

    const filteredCompanies = companies.filter(company => {
      const matchesCategory = category === 'all' || company.category === category;
      const matchesRating = selectedRating === 0 || company.rating === selectedRating;
      const matchesBarrels = company.barrels <= barrels;
      const matchesPrice = company.pricePerBarrel <= price;

      return matchesCategory && matchesRating && matchesBarrels && matchesPrice;
    });

    renderMap(filteredCompanies);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMap);
} else {
  initMap();
}