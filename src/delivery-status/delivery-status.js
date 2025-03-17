import { setPageTitle } from '/index.js';
import { deliveries } from '../helpers/data.js';

setPageTitle('Delivery Status');

function initDeliveryStatus() {
  const tableBody = document.getElementById('delivery-table-body');
  const keywordSearch = document.getElementById('keyword-search');
  const fromDate = document.getElementById('from-date');
  const toDate = document.getElementById('to-date');
  const statusSelect = document.getElementById('status-select');
  const prevPageBtn = document.getElementById('prev-page');
  const nextPageBtn = document.getElementById('next-page');
  const pageInfo = document.getElementById('page-info');

  if (!tableBody || !keywordSearch || !fromDate || !toDate || !statusSelect || !prevPageBtn || !nextPageBtn || !pageInfo) {
    console.error('Required DOM elements not found');
    return;
  }

  let currentPage = 1;
  const recordsPerPage = 10;
  let sortColumn = null;
  let sortDirection = 'asc'; // 'asc' or 'desc'

  function filterDeliveries() {
    let filtered = [...deliveries];

    // Keyword search
    const keyword = keywordSearch.value.trim().toLowerCase();
    if (keyword) {
      filtered = filtered.filter(d => d.company.toLowerCase().includes(keyword));
    }

    // Date filters
    const from = fromDate.value ? new Date(fromDate.value) : null;
    const to = toDate.value ? new Date(toDate.value) : null;
    if (from) {
      filtered = filtered.filter(d => new Date(d.deliveryDate) >= from);
    }
    if (to) {
      filtered = filtered.filter(d => new Date(d.deliveryDate) <= to);
    }

    // Status filter
    const status = statusSelect.value;
    if (status) {
      filtered = filtered.filter(d => d.status === status);
    }

    return filtered;
  }

  function sortDeliveries(data, column) {
    return data.sort((a, b) => {
      let valA, valB;
      switch (column) {
        case 'company':
          valA = a.company.toLowerCase();
          valB = b.company.toLowerCase();
          break;
        case 'from':
          valA = a.from.toLowerCase();
          valB = b.from.toLowerCase();
          break;
        case 'to':
          valA = a.to.toLowerCase();
          valB = b.to.toLowerCase();
          break;
        case 'progress':
          valA = a.completion;
          valB = b.completion;
          break;
        case 'status':
          valA = a.status.toLowerCase();
          valB = b.status.toLowerCase();
          break;
        case 'deliveryDate':
          valA = new Date(a.deliveryDate);
          valB = new Date(b.deliveryDate);
          break;
        default:
          return 0;
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  function renderTable(page) {
    let filteredDeliveries = filterDeliveries();
    if (sortColumn) {
      filteredDeliveries = sortDeliveries(filteredDeliveries, sortColumn);
    }

    const totalRecords = filteredDeliveries.length;
    const totalPages = Math.ceil(totalRecords / recordsPerPage);
    currentPage = Math.min(Math.max(page, 1), totalPages || 1);

    const start = (currentPage - 1) * recordsPerPage;
    const end = Math.min(start + recordsPerPage, totalRecords);
    const paginated = filteredDeliveries.slice(start, end);

    tableBody.innerHTML = '';
    paginated.forEach(delivery => {
      const row = document.createElement('tr');
      const statusColor = {
        'In-transit': 'blue',
        'Cancelled': 'red',
        'Pending': 'orange',
        'Delivered': 'green'
      }[delivery.status] || 'gray';

      // Extract city names from "from" and "to" (e.g., "Houston, TX" -> "Houston")
      const fromCity = delivery.from.split(',')[0].trim();
      const toCity = delivery.to.split(',')[0].trim();

      // Create weather search links for start and end locations
      const weatherStartLink = `https://www.google.com/search?q=weather+${encodeURIComponent(fromCity)}`;
      const weatherEndLink = `https://www.google.com/search?q=weather+${encodeURIComponent(toCity)}`;

      row.innerHTML = `
        <td>${delivery.company}</td>
        <td>${delivery.from}</td>
        <td>${delivery.to}</td>
        <td>
          <div class="progress-bar">
            <div class="progress" style="width: ${delivery.completion}%; background-color: ${statusColor};"></div>
          </div>
        </td>
        <td><span class="status" style="color: ${statusColor};">${delivery.status}</span></td>
        <td class="weather-links">
          <a href="${weatherStartLink}" target="_blank" class="weather-link">Start</a>
          <a href="${weatherEndLink}" target="_blank" class="weather-link">End</a>
        </td>
        <td>${delivery.deliveryDate}</td>
        <td>
          <div class="action-dropdown">
            <button class="more-btn">...</button>
            <div class="dropdown-content" style="display: none;">
              <!-- Placeholder for future actions -->
            </div>
          </div>
        </td>
      `;

      const moreBtn = row.querySelector('.more-btn');
      const dropdown = row.querySelector('.dropdown-content');
      moreBtn.addEventListener('click', () => {
        const isVisible = dropdown.style.display === 'block';
        dropdown.style.display = isVisible ? 'none' : 'block';
      });

      tableBody.appendChild(row);
    });

    // Update pagination
    pageInfo.textContent = `Page ${currentPage} of ${totalPages || 1}`;
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages || totalRecords === 0;

    // Update sort indicators
    document.querySelectorAll('.delivery-table th').forEach(th => {
      th.classList.remove('sort-asc', 'sort-desc');
      if (th.dataset.column === sortColumn) {
        th.classList.add(sortDirection === 'asc' ? 'sort-asc' : 'sort-desc');
      }
    });
  }

  // Add sort functionality to column headers
  document.querySelectorAll('.delivery-table th').forEach(th => {
    if (th.dataset.column) {
      th.style.cursor = 'pointer';
      th.addEventListener('click', () => {
        const column = th.dataset.column;
        if (sortColumn === column) {
          sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
          sortColumn = column;
          sortDirection = 'asc';
        }
        renderTable(currentPage);
      });
    }
  });

  // Event listeners
  keywordSearch.addEventListener('input', () => renderTable(1));
  fromDate.addEventListener('change', () => renderTable(1));
  toDate.addEventListener('change', () => renderTable(1));
  statusSelect.addEventListener('change', () => renderTable(1));
  prevPageBtn.addEventListener('click', () => renderTable(currentPage - 1));
  nextPageBtn.addEventListener('click', () => renderTable(currentPage + 1));

  // Initial render
  renderTable(1);

  // Close dropdowns when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.classList.contains('more-btn')) {
      document.querySelectorAll('.dropdown-content').forEach(d => d.style.display = 'none');
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDeliveryStatus);
} else {
  initDeliveryStatus();
}