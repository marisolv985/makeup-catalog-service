const API_BASE = '/api/v1/cosmetics';

function getToken() {
  return localStorage.getItem('gf_token') || '';
}

function setToken(token) {
  localStorage.setItem('gf_token', token);
}

function authHeaders() {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = 'Bearer ' + token;
  }
  return headers;
}

async function apiRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: { ...authHeaders(), ...options.headers },
    });
    const data = await response.json();
    return { ok: response.ok, data };
  } catch (error) {
    return { ok: false, data: { success: false, message: error.message } };
  }
}

function showResult(elementId, success, message, data) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.style.display = 'block';
  el.className = 'inventory-result ' + (success ? 'success' : 'error');

  let html = '<strong>' + message + '</strong>';
  if (data) {
    if (data.sku !== undefined && data.stockDisponible !== undefined) {
      html += '<br>SKU: ' + data.sku + ' | Stock: ' + data.stockDisponible;
    } else if (data.exists !== undefined) {
      html += '<br>Existe: ' + (data.exists ? 'Sí' : 'No');
    } else if (data.estado) {
      html += '<br>Estado: ' + data.estado + ' | Stock: ' + data.stockDisponible;
    }
  }
  el.innerHTML = html;
}

function confirmDelete(productId, productName) {
  const modal = document.getElementById('deleteModal');
  const nameEl = document.getElementById('deleteProductName');
  const form = document.getElementById('deleteForm');

  nameEl.textContent = productName;
  form.action = '/products/' + productId + '/delete';
  modal.style.display = 'flex';
}

function closeModal() {
  document.getElementById('deleteModal').style.display = 'none';
}

function changeMainImage(src) {
  const mainImg = document.querySelector('.main-image img');
  if (mainImg) mainImg.src = src;
}

function addImageField() {
  const container = document.getElementById('imagenesContainer');
  if (!container) return;
  const div = document.createElement('div');
  div.className = 'input-with-button';
  div.innerHTML = '<input type="url" name="imagenes" placeholder="https://ejemplo.com/imagen.jpg">' +
    '<button type="button" class="btn btn-sm btn-danger" onclick="this.parentElement.remove()">×</button>';
  container.appendChild(div);
}

document.addEventListener('DOMContentLoaded', function () {
  const decreaseForm = document.getElementById('decreaseForm');
  if (decreaseForm) {
    decreaseForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const sku = document.getElementById('dec-sku').value;
      const cantidad = parseInt(document.getElementById('dec-cantidad').value, 10);
      const result = await apiRequest(API_BASE + '/stock/decrease', {
        method: 'PATCH',
        body: JSON.stringify({ sku, cantidad }),
      });
      showResult('decreaseResult', result.ok, result.data.message, result.data.data);
    });
  }

  const increaseForm = document.getElementById('increaseForm');
  if (increaseForm) {
    increaseForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const sku = document.getElementById('inc-sku').value;
      const cantidad = parseInt(document.getElementById('inc-cantidad').value, 10);
      const result = await apiRequest(API_BASE + '/stock/increase', {
        method: 'PATCH',
        body: JSON.stringify({ sku, cantidad }),
      });
      showResult('increaseResult', result.ok, result.data.message, result.data.data);
    });
  }

  const stockForm = document.getElementById('stockForm');
  if (stockForm) {
    stockForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const sku = document.getElementById('chk-sku').value;
      const result = await apiRequest(API_BASE + '/stock/' + encodeURIComponent(sku));
      showResult('stockResult', result.ok, result.data.message, result.data.data);
    });
  }

  const existsForm = document.getElementById('existsForm');
  if (existsForm) {
    existsForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const sku = document.getElementById('ex-sku').value;
      const result = await apiRequest(API_BASE + '/exists/' + encodeURIComponent(sku));
      showResult('existsResult', result.ok, result.data.message, result.data.data);
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeModal();
  });
});
