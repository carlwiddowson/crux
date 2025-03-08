// src/map/map.js
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import companies from '../helpers/data.js';
import { setPageTitle } from '/index.js';

// Set the page title
setPageTitle('Map');

function formatNumberWithCommas(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function initMap() {
  const mapDiv = document.getElementById('map');
  const filterContainer = document.querySelector('.filter-container');
  const categorySelect = document.getElementById('category-select');
  const ratingContainer = document.getElementById('star-rating');
  const barrelsSlider = document.getElementById('barrels-slider');
  const barrelsValue = document.getElementById('barrels-value');
  const priceSlider = document.getElementById('price-slider');
  const priceValue = document.getElementById('price-value');
  const noResultsMessage = document.getElementById('no-results');

  if (!mapDiv || !filterContainer || !categorySelect || !ratingContainer || !barrelsSlider || !priceSlider) {
    console.error('Required DOM elements not found');
    return;
  }

  // Initialize Leaflet map
  const map = L.map(mapDiv);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  // Create markers
  const markers = companies.map(company => {
    const marker = L.marker([company.lat, company.lng])
      .bindPopup(`<strong>${company.name}</strong><br>
        Barrels: ${formatNumberWithCommas(company.barrels)}<br>
        Price/Barrel: $${company.pricePerBarrel}<br>
        Rating: ${company.rating}`);
    marker.on('click', () => {
      map.setView([company.lat, company.lng], 10);
    });
    return marker;
  });

  // Star rating setup
  let selectedRating = 'all';
  for (let i = 1; i <= 5; i++) {
    const star = document.createElement('span');
    star.className = 'star';
    star.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26"/>
      </svg>
    `;
    star.dataset.rating = i;
    star.addEventListener('click', () => {
      selectedRating = star.dataset.rating;
      ratingContainer.querySelectorAll('.star').forEach(s => {
        s.classList.toggle('active', Number(s.dataset.rating) <= Number(selectedRating));
      });
      updateMap(categorySelect.value, selectedRating, barrelsSlider.value, priceSlider.value);
    });
    ratingContainer.appendChild(star);
  }

  function updateMap(category, rating, barrels, price) {
    noResultsMessage.textContent = '';
    markers.forEach(marker => marker.remove());

    let filtered = companies;
    if (category !== 'all') {
      filtered = filtered.filter(company => company.category === category);
    }
    if (rating !== 'all') {
      filtered = filtered.filter(company => company.rating === Number(rating));
    }
    if (barrels !== 'all') {
      filtered = filtered.filter(company => company.barrels <= Number(barrels));
    }
    if (price !== 'all') {
      filtered = filtered.filter(company => company.pricePerBarrel <= Number(price));
    }

    const visibleMarkers = [];
    filtered.forEach((company, index) => {
      const marker = markers[companies.indexOf(company)];
      marker.addTo(map);
      visibleMarkers.push(marker);
    });

    if (filtered.length > 0) {
      const filteredBounds = L.latLngBounds(filtered.map(c => [c.lat, c.lng]));
      map.fitBounds(filteredBounds, { padding: [50, 50] });
    } else {
      noResultsMessage.textContent = 'No Results Found';
      map.setView([37.7749, -122.4194], 5);
    }
  }

  // Event listeners for filters
  categorySelect.addEventListener('change', (e) => {
    updateMap(e.target.value, selectedRating, barrelsSlider.value, priceSlider.value);
  });

  barrelsSlider.addEventListener('input', (e) => {
    const value = Number(e.target.value);
    barrelsValue.textContent = `${(value / 1000000).toFixed(1)}M`;
    updateMap(categorySelect.value, selectedRating, e.target.value, priceSlider.value);
  });

  priceSlider.addEventListener('input', (e) => {
    const value = Number(e.target.value);
    priceValue.textContent = `$${value}`;
    updateMap(categorySelect.value, selectedRating, barrelsSlider.value, e.target.value);
  });

  // Initial load
  markers.forEach(marker => marker.addTo(map));
  const initialBounds = L.latLngBounds(companies.map(c => [c.lat, c.lng]));
  map.fitBounds(initialBounds, { padding: [50, 50] });

  // Move filter container before map (ensures proper stacking)
  const appDiv = document.getElementById('app');
  if (appDiv) {
    appDiv.insertBefore(filterContainer, mapDiv);
  }
}

// Ensure DOM is ready before initializing
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMap);
} else {
  initMap();
}