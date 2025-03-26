// src/delivery-status/delivery-status.js
import { setPageTitle } from '/index.js';

setPageTitle('Delivery Status');

async function fetchDeliveries() {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('No auth token found. Please log in.');

    console.log('[delivery-status.js] Fetching deliveries with token:', token);
    const response = await fetch('http://localhost:5001/api/deliveries', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    console.log('[delivery-status.js] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('[delivery-status.js] Response not OK:', response.statusText, errorText);
      throw new Error('Failed to fetch deliveries');
    }

    const data = await response.json();
    console.log('[delivery-status.js] Deliveries fetched:', data);
    return data;
  } catch (error) {
    console.error('[delivery-status.js] Error fetching deliveries:', error);
    throw error;
  }
}

async function filterDeliveries(deliveries, searchTerm = '', statusFilter = '', sortColumn = '', sortDirection = 'asc') {
  let filtered = [...deliveries];

  if (searchTerm) {
    const lowerSearch = searchTerm.toLowerCase();
    filtered = filtered.filter(delivery =>
      (delivery.company && delivery.company.toLowerCase().includes(lowerSearch)) ||
      (delivery.from_location && delivery.from_location.toLowerCase().includes(lowerSearch)) ||
      (delivery.to_location && delivery.to_location.toLowerCase().includes(lowerSearch))
    );
  }

  if (statusFilter) {
    filtered = filtered.filter(delivery => 
      delivery.status && delivery.status.toLowerCase() === statusFilter.toLowerCase()
    );
  }

  if (sortColumn) {
    filtered.sort((a, b) => {
      const aValue = a[sortColumn] || '';
      const bValue = b[sortColumn] || '';
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }

  console.log('[delivery-status.js] Filtered deliveries:', filtered);
  return filtered;
}

function updateProgressBar(progressBar, completion) {
  const progress = progressBar.querySelector('.progress');
  progress.style.width = `${completion}%`;
  progress.style.backgroundColor = completion === 100 ? '#27ae60' : '#3498db';
}

async function renderTable(page = 1) {
  const tableBody = document.querySelector('#delivery-table tbody');
  const paginationContainer = document.querySelector('#pagination');
  if (!tableBody || !paginationContainer) {
    console.error('[delivery-status.js] Table body or pagination container not found');
    return;
  }

  try {
    const deliveries = await fetchDeliveries();
    const searchInput = document.querySelector('.search-input');
    const statusSelect = document.querySelector('.status-select');
    let searchTerm = searchInput ? searchInput.value : '';
    let statusFilter = statusSelect ? statusSelect.value : '';
    let sortColumn = '';
    let sortDirection = 'asc';

    const filteredDeliveries = await filterDeliveries(deliveries, searchTerm, statusFilter, sortColumn, sortDirection);
    tableBody.innerHTML = '';

    // Pagination logic
    const itemsPerPage = 10;
    const totalPages = Math.ceil(filteredDeliveries.length / itemsPerPage);
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedDeliveries = filteredDeliveries.slice(startIndex, endIndex);

    if (paginatedDeliveries.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="7">No deliveries found</td></tr>';
      paginationContainer.innerHTML = '';
      return;
    }

    paginatedDeliveries.forEach(delivery => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${delivery.company || 'N/A'}</td>
        <td>${delivery.from_location || 'N/A'}</td>
        <td>${delivery.to_location || 'N/A'}</td>
        <td class="status">${delivery.status || 'N/A'}</td>
        <td>${delivery.delivery_date || 'N/A'}</td>
        <td>
          <div class="progress-bar">
            <div class="progress" style="width: ${delivery.completion || 0}%"></div>
          </div>
        </td>
        <td>${delivery.completion !== undefined ? delivery.completion + '%' : 'N/A'}</td>
      `;
      tableBody.appendChild(row);
      updateProgressBar(row.querySelector('.progress-bar'), delivery.completion || 0);
    });

    // Render pagination controls
    renderPagination(totalPages, page);

    // Add sort listeners
    document.querySelectorAll('#delivery-table th[data-column]').forEach(th => {
      th.addEventListener('click', () => {
        sortColumn = th.dataset.column;
        sortDirection = th.classList.contains('sort-asc') ? 'desc' : 'asc';
        document.querySelectorAll('#delivery-table th').forEach(t => t.classList.remove('sort-asc', 'sort-desc'));
        th.classList.add(sortDirection === 'asc' ? 'sort-asc' : 'sort-desc');
        renderTable(page);
      });
    });
  } catch (error) {
    tableBody.innerHTML = `<tr><td colspan="7">Error: ${error.message}</td></tr>`;
    paginationContainer.innerHTML = '';
  }
}

function renderPagination(totalPages, currentPage) {
  const paginationContainer = document.querySelector('#pagination');
  paginationContainer.innerHTML = '';

  // Previous button
  const prevButton = document.createElement('button');
  prevButton.textContent = 'Previous';
  prevButton.disabled = currentPage === 1;
  prevButton.addEventListener('click', () => renderTable(currentPage - 1));
  paginationContainer.appendChild(prevButton);

  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement('button');
    pageButton.textContent = i;
    pageButton.className = i === currentPage ? 'active' : '';
    pageButton.addEventListener('click', () => renderTable(i));
    paginationContainer.appendChild(pageButton);
  }

  // Next button
  const nextButton = document.createElement('button');
  nextButton.textContent = 'Next';
  nextButton.disabled = currentPage === totalPages;
  nextButton.addEventListener('click', () => renderTable(currentPage + 1));
  paginationContainer.appendChild(nextButton);

  console.log('[delivery-status.js] Pagination rendered: Page', currentPage, 'of', totalPages);
}

function initDeliveryStatus() {
  console.log('[delivery-status.js] Initializing');
  const searchInput = document.querySelector('.search-input');
  const statusSelect = document.querySelector('.status-select');

  if (searchInput) {
    searchInput.addEventListener('input', () => renderTable(1));
  }
  if (statusSelect) {
    statusSelect.addEventListener('change', () => renderTable(1));
  }

  renderTable(1); // Start on page 1
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDeliveryStatus);
} else {
  initDeliveryStatus();
}