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

function setLoading(form, loading) {
  const btn = form.querySelector('button[type="submit"]');
  if (!btn) return;
  if (loading) {
    btn.dataset.originalText = btn.innerHTML;
    btn.innerHTML = '<span class="spinner"></span> Cargando...';
    btn.disabled = true;
  } else {
    btn.innerHTML = btn.dataset.originalText || btn.innerHTML;
    btn.disabled = false;
  }
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
  div.innerHTML = '<input type="url" name="imagenesUrl" placeholder="https://ejemplo.com/imagen.jpg">' +
    '<button type="button" class="btn btn-sm btn-danger" onclick="this.parentElement.remove()">×</button>';
  container.appendChild(div);
}

document.addEventListener('DOMContentLoaded', function () {
  const decreaseForm = document.getElementById('decreaseForm');
  if (decreaseForm) {
    decreaseForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      setLoading(this, true);
      const sku = document.getElementById('dec-sku').value;
      const cantidad = parseInt(document.getElementById('dec-cantidad').value, 10);
      const result = await apiRequest(API_BASE + '/stock/decrease', {
        method: 'PATCH',
        body: JSON.stringify({ sku, cantidad }),
      });
      setLoading(this, false);
      const msg = result.ok ? 'Stock descontado exitosamente' : (result.data.message || 'Error al descontar stock');
      showResult('decreaseResult', result.ok, msg, result.data);
    });
  }

  const increaseForm = document.getElementById('increaseForm');
  if (increaseForm) {
    increaseForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      setLoading(this, true);
      const sku = document.getElementById('inc-sku').value;
      const cantidad = parseInt(document.getElementById('inc-cantidad').value, 10);
      const result = await apiRequest(API_BASE + '/stock/increase', {
        method: 'PATCH',
        body: JSON.stringify({ sku, cantidad }),
      });
      setLoading(this, false);
      const msg = result.ok ? 'Stock incrementado exitosamente' : (result.data.message || 'Error al incrementar stock');
      showResult('increaseResult', result.ok, msg, result.data);
    });
  }

  const stockForm = document.getElementById('stockForm');
  if (stockForm) {
    stockForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      setLoading(this, true);
      const sku = document.getElementById('chk-sku').value;
      const result = await apiRequest(API_BASE + '/stock/' + encodeURIComponent(sku));
      setLoading(this, false);
      const msg = result.ok ? 'Stock consultado' : (result.data.message || 'Error al consultar stock');
      showResult('stockResult', result.ok, msg, result.data);
    });
  }

  const existsForm = document.getElementById('existsForm');
  if (existsForm) {
    existsForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      setLoading(this, true);
      const sku = document.getElementById('ex-sku').value;
      const result = await apiRequest(API_BASE + '/exists/' + encodeURIComponent(sku));
      setLoading(this, false);
      const msg = result.ok ? 'Verificación completada' : (result.data.message || 'Error al verificar existencia');
      showResult('existsResult', result.ok, msg, result.data);
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeModal();
  });
});
