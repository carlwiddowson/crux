import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import companies from '../helpers/data.js';
import siteHeader from '../helpers/site-header.js';
import addXrplLogo from '../helpers/render-xrpl-logo.js';
import siteMenu from '../helpers/site-menu.js';

siteHeader();
addXrplLogo();
siteMenu();

const appDiv = document.getElementById('app');
const mapDiv = document.getElementById('map');

const map = L.map(mapDiv);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Create markers but don’t add them to the map yet
const markers = companies.map(company => {
  const marker = L.marker([company.lat, company.lng])
    .bindPopup(`<strong>${company.name}</strong><br>
        Barrels: ${company.barrels}<br>
        (Rating: ${company.rating})`);
  marker.on('click', () => {
    map.setView([company.lat, company.lng], 10);
  });
  return marker;
});

// Create a container for filters and message
const filterContainer = document.createElement('div');
filterContainer.className = 'filter-container';

// Category filter dropdown
const categorySelect = document.createElement('select');
categorySelect.innerHTML = `
  <option value="all">Grade</option>
  <option value="Light">Light</option>
  <option value="Medium">Medium</option>
  <option value="Heavy">Heavy</option>
`;

// Star rating container
const ratingContainer = document.createElement('div');
ratingContainer.className = 'star-rating';
let selectedRating = 'all'; // Track selected rating

// Create 5 star icons
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
    document.querySelectorAll('.star').forEach(s => {
      s.classList.toggle('active', Number(s.dataset.rating) <= Number(selectedRating));
    });
    updateMap(categorySelect.value, selectedRating, barrelsSlider.value);
  });
  ratingContainer.appendChild(star);
}

// Barrels filter slider with label
const barrelsLabel = document.createElement('label');
barrelsLabel.textContent = 'Barrels: ';
const barrelsSlider = document.createElement('input');
barrelsSlider.type = 'range';
barrelsSlider.min = '0';
barrelsSlider.max = '1000000'; // 1 million
barrelsSlider.value = '1000000'; // Default to max
barrelsSlider.step = '50000'; // 50,000 increments
barrelsSlider.style.width = '200px';

// Barrels value display
const barrelsValue = document.createElement('span');
barrelsValue.textContent = '1.0M';
barrelsValue.style.marginLeft = '10px';

// No results message element
const noResultsMessage = document.createElement('span');
noResultsMessage.className = 'no-results';
noResultsMessage.textContent = '';

// Append filters and message to the container
filterContainer.appendChild(categorySelect);
filterContainer.appendChild(ratingContainer);
filterContainer.appendChild(barrelsLabel);
filterContainer.appendChild(barrelsSlider);
filterContainer.appendChild(barrelsValue);
filterContainer.appendChild(noResultsMessage);

// Add the container to #app before the map
appDiv.insertBefore(filterContainer, mapDiv);

function updateMap(category, rating, barrels) {
  // Clear previous message
  noResultsMessage.textContent = '';

  // Remove all markers from the map
  markers.forEach(marker => marker.remove());

  // Filter companies based on category, rating, and barrels
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

  // Add only filtered markers to the map
  const visibleMarkers = [];
  filtered.forEach((company, index) => {
    const marker = markers[companies.indexOf(company)];
    marker.addTo(map);
    visibleMarkers.push(marker);
  });

  // Handle map view based on filtered results
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
  updateMap(e.target.value, selectedRating, barrelsSlider.value);
});
barrelsSlider.addEventListener('input', (e) => {
  const value = Number(e.target.value);
  barrelsValue.textContent = `${(value / 1000000).toFixed(1)}M`;
  updateMap(categorySelect.value, selectedRating, e.target.value);
});

// Initial load: Show all markers and fit bounds
markers.forEach(marker => marker.addTo(map));
const initialBounds = L.latLngBounds(companies.map(c => [c.lat, c.lng]));
map.fitBounds(initialBounds, { padding: [50, 50] });