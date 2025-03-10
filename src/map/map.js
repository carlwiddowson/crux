// src/maps/maps.js
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { companies } from '../helpers/data.js';
import { setPageTitle } from '/index.js';

setPageTitle('Map');

function formatNumberWithCommas(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function initMap() {
  const mapDiv = document.getElementById('map');
  const filterContainer = document.querySelector('.filter-container');
  const contentDiv = document.getElementById('page-content') || document.body; // Fallback to body
  const categorySelect = document.getElementById('category-select');
  const ratingContainer = document.getElementById('star-rating');
  const ratingValue = document.getElementById('rating-value');
  const barrelsSlider = document.getElementById('barrels-slider');
  const barrelsValue = document.getElementById('barrels-value');
  const priceSlider = document.getElementById('price-slider');
  const priceValue = document.getElementById('price-value');
  const noResultsMessage = document.getElementById('no-results');
  const clearFiltersBtn = document.getElementById('clear-filters');

  // Check if required elements exist
  if (!mapDiv || !filterContainer || !categorySelect || !ratingContainer || !barrelsSlider || !priceSlider || !clearFiltersBtn || !ratingValue) {
    // console.error('Required DOM elements not found');
    return;
  }

  // Ensure filterContainer is before mapDiv within #page-content
  if (filterContainer.nextSibling !== mapDiv && contentDiv.contains(filterContainer)) {
    contentDiv.insertBefore(filterContainer, mapDiv);
  }

  // Initialize Leaflet map
  const map = L.map(mapDiv);
  const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  });
  tileLayer.on('tileerror', (error) => {
    // console.warn('Tile load error suppressed:', error);
  });
  tileLayer.addTo(map);

  // Create markers
  const markers = companies.map(company => {
    const marker = L.marker([company.lat, company.lng], { title: company.name })
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
      ratingValue.textContent = selectedRating === 'all' ? 'All' : `${selectedRating} Stars`;
      updateMap(categorySelect.value, selectedRating, barrelsSlider.value, priceSlider.value);
    });
    ratingContainer.appendChild(star);
  }

  function updateMap(category, rating, barrels, price) {
    noResultsMessage.textContent = '';
    markers.forEach(marker => marker.remove());

    let filtered = companies;
    if (category !== 'all') {
      filtered = filtered.filter(company => {
        const matches = company.category === category;
        // console.log(`Category filter: ${company.name}, category: ${company.category}, matches: ${matches}`);
        return matches;
      });
    }
    if (rating !== 'all') {
      filtered = filtered.filter(company => {
        const matches = company.rating >= Number(rating);
        // console.log(`Rating filter: ${company.name}, rating: ${company.rating}, required: ${rating}, matches: ${matches}`);
        return matches;
      });
    }
    if (barrels !== 'all') {
      filtered = filtered.filter(company => {
        const matches = company.barrels <= Number(barrels);
        // console.log(`Barrels filter: ${company.name}, barrels: ${company.barrels}, max: ${barrels}, matches: ${matches}`);
        return matches;
      });
    }
    if (price !== 'all') {
      filtered = filtered.filter(company => {
        const matches = company.pricePerBarrel <= Number(price);
        // console.log(`Price filter: ${company.name}, pricePerBarrel: ${company.pricePerBarrel}, max: ${price}, matches: ${matches}`);
        return matches;
      });
    }

    const visibleMarkers = [];
    filtered.forEach((company, index) => {
      const marker = markers[companies.indexOf(company)];
      if (marker) {
        marker.addTo(map);
        visibleMarkers.push(marker);
      }
    });
    // console.log('Filtered markers added:', visibleMarkers.length);

    if (filtered.length > 0) {
      const filteredBounds = L.latLngBounds(filtered.map(c => [c.lat, c.lng]));
      if (filteredBounds.isValid()) {
        map.fitBounds(filteredBounds, { padding: [50, 50] });
        // console.log('Map centered on filtered bounds:', filteredBounds);
      } else {
        // console.warn('Filtered bounds invalid, using default view');
        map.setView([37.7749, -122.4194], 5);
      }
    } else {
      noResultsMessage.textContent = 'No Results Found';
      map.setView([37.7749, -122.4194], 5);
    }
  }

  // Event listeners for filters
  categorySelect.addEventListener('change', (e) => {
    // console.log('Category selected:', e.target.value);
    updateMap(e.target.value, selectedRating, barrelsSlider.value, priceSlider.value);
  });

  barrelsSlider.addEventListener('input', (e) => {
    const value = Number(e.target.value);
    barrelsValue.textContent = `${(value / 1000000).toFixed(1)}M`;
    // console.log('Barrels slider value:', value);
    updateMap(categorySelect.value, selectedRating, value, priceSlider.value);
  });

  priceSlider.addEventListener('input', (e) => {
    const value = Number(e.target.value);
    priceValue.textContent = `$${value}`;
    // console.log('Price slider value:', value);
    updateMap(categorySelect.value, selectedRating, barrelsSlider.value, value);
  });

  clearFiltersBtn.addEventListener('click', () => {
    // console.log('Clearing filters');
    categorySelect.value = 'all';
    selectedRating = 'all';
    ratingContainer.querySelectorAll('.star').forEach(s => s.classList.remove('active'));
    ratingValue.textContent = 'All';
    barrelsSlider.value = 1000000;
    barrelsValue.textContent = '1.0M';
    priceSlider.value = 92;
    priceValue.textContent = '$92';
    updateMap('all', 'all', 1000000, 92);
  });

  // Initial load
  markers.forEach(marker => marker.addTo(map));
  const initialBounds = L.latLngBounds(companies.map(c => [c.lat, c.lng]));
  if (initialBounds.isValid()) {
    map.fitBounds(initialBounds, { padding: [50, 50] });
  } else {
    // console.warn('Initial bounds invalid, using default view');
    map.setView([37.7749, -122.4194], 5);
  }
}

// Ensure DOM is ready before initializing
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMap);
} else {
  initMap();
}