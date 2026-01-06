const productList = [
  { id: 'pilsen', nome: 'Pilsen', preco: 11.0, marca: 'Rota 65' },
  { id: 'puro-malte', nome: 'Puro Malte', preco: 12.9, marca: 'Rota 65' },
  { id: 'vinho', nome: 'Vinho', preco: 14.9, marca: 'Rota 65' },
  { id: 'ipa', nome: 'IPA', preco: 16.9, marca: 'Rota 65' },
  { id: 'black', nome: 'Black', preco: 12.9, marca: 'Rota 65' },
  { id: 'heineken', nome: 'Heineken', preco: 20.7, marca: 'Heineken' },
  { id: 'brahma', nome: 'Brahma', preco: 18.8, marca: 'Brahma' }
];

const catalogCards = [
  {
    id: 'heineken',
    nome: 'Hineken',
    categoria: 'Chope',
    imagem: 'cards/chope_hineken.png',
    descricao: 'Chope premium com amargor leve e final limpo, indicado para quem quer um sabor mais marcante.',
    tags: ['Premium', 'Equilibrado', 'Lager']
  },
  {
    id: 'vinho',
    nome: 'Vinho',
    categoria: 'Chope',
    imagem: 'cards/chope_vinho.png',
    descricao: 'Chope de vinho com aroma frutado e cor rubi, ideal para eventos e brindes especiais.',
    tags: ['Aroma frutado', 'Suave', 'Diferente']
  },
  {
    id: 'pilsen',
    nome: 'Pilsen',
    categoria: 'Chope',
    imagem: 'cards/chope_pilsen.png',
    descricao: 'Clara, leve e refrescante, combina com churrasco e encontros.',
    tags: ['Leve', 'Refrescante', 'Classico']
  },
  {
    id: 'puro-malte',
    nome: 'Puro Malte',
    categoria: 'Chope',
    imagem: 'cards/chope_pilsen.png',
    descricao: 'Feito apenas com malte, corpo medio e espuma cremosa, com mais sabor.',
    tags: ['Malte', 'Corpo medio', 'Cremoso']
  },
  {
    id: 'ipa',
    nome: 'IPA',
    categoria: 'Chope',
    imagem: 'cards/chope_pilsen.png',
    descricao: 'Mais lupulada, aroma citrico e amargor mais presente.',
    tags: ['Lupulo', 'Aromatico', 'Amargor']
  },
  {
    id: 'black',
    nome: 'Black',
    categoria: 'Chope',
    imagem: 'cards/chope_black.png',
    descricao: 'Escura, com notas de malte tostado e corpo intenso.',
    tags: ['Malte tostado', 'Corpo intenso', 'Escura']
  },
  {
    id: 'brahma',
    nome: 'Brahma',
    categoria: 'Chope',
    imagem: 'cards/chope_brahma.png',
    descricao: 'Classico brasileiro, leve e facil de beber, ideal para grandes pedidos.',
    tags: ['Classico', 'Leve', 'Brasil']
  }
];

const barrelSizes = [10, 15, 20, 30, 50];
const SPLASH_DURATION = 3500;

const defaultStock = {
  pilsen: { 10: 4, 15: 4, 20: 3, 30: 3, 50: 2 },
  'puro-malte': { 10: 4, 15: 4, 20: 3, 30: 3, 50: 2 },
  vinho: { 10: 3, 15: 3, 20: 2, 30: 2, 50: 1 },
  ipa: { 10: 3, 15: 3, 20: 2, 30: 2, 50: 1 },
  black: { 10: 3, 15: 3, 20: 2, 30: 2, 50: 1 },
  heineken: { 10: 3, 15: 3, 20: 2, 30: 2, 50: 1 },
  brahma: { 10: 3, 15: 3, 20: 2, 30: 2, 50: 1 }
};

let cart = [];
let orders = loadOrders();
let stock = loadStock();
let isAdmin = false;
let activeProductFilter = null;
let keepProductFilter = false;

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function loadOrders() {
  const saved = localStorage.getItem('chopp-orders');
  return saved ? JSON.parse(saved) : [];
}
function saveOrders() {
  localStorage.setItem('chopp-orders', JSON.stringify(orders));
}

function loadStock() {
  const saved = localStorage.getItem('chopp-stock');
  return saved ? JSON.parse(saved) : structuredClone(defaultStock);
}
function saveStock() {
  localStorage.setItem('chopp-stock', JSON.stringify(stock));
}

function renderProducts() {
  const container = document.getElementById('products');
  container.innerHTML = '';
  const visibleProducts = activeProductFilter
    ? productList.filter((p) => p.id === activeProductFilter)
    : productList;

  if (!visibleProducts.length) {
    container.innerHTML = '<p class="muted">Nenhum produto encontrado.</p>';
    return;
  }

  visibleProducts.forEach((p) => {
    const available = stock[p.id] || {};
    const out = barrelSizes.every((size) => (available[size] ?? 0) <= 0);
    const priceLabel = currency.format(p.preco);
    const productImage = activeProductFilter ? getProductImage(p.id) : null;
    const imageBlock = productImage
      ? `
      <div class="product-media">
        <img src="${productImage}" alt="${p.nome} - chope" loading="lazy">
      </div>
    `
      : '';
    const options = barrelSizes
      .map((s) => {
        const qty = available[s] ?? 0;
        const label = `${s} L - ${priceLabel}/L - ${qty} Barril`;
        const disabled = qty <= 0 ? 'disabled' : '';
        return `<option value="${s}" ${disabled}>${label}</option>`;
      })
      .join('');

    const card = document.createElement('div');
    card.className = 'card product';
    card.dataset.product = p.id;
    card.innerHTML = `
      ${imageBlock}
      <p class="eyebrow">${p.marca}</p>
      <h3>${p.nome}</h3>
      <div class="litro">Preco por litro (referencia)</div>
      <div class="price">${priceLabel}</div>
      <div class="actions size-row">
        <label class="size-label">
          Barril
          <select data-size="${p.id}">
            ${options}
          </select>
        </label>
        <div class="qty-control" data-id="${p.id}">
          <button type="button" data-action="minus">-</button>
          <input type="number" min="1" step="1" value="1" data-barrels>
          <button type="button" data-action="plus">+</button>
        </div>
        <button class="btn primary small" data-add="${p.id}" ${out ? 'disabled' : ''}>${out ? 'Sem estoque' : 'Adicionar'}</button>
      </div>
    `;
    container.appendChild(card);
  });

  container.querySelectorAll('.qty-control').forEach((control) => {
    const input = control.querySelector('[data-barrels]');
    control.querySelectorAll('button').forEach((btn) => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        let value = Number(input.value) || 1;
        if (action === 'minus') value = Math.max(1, value - 1);
        if (action === 'plus') value = value + 1;
        input.value = value;
      });
    });
  });

  container.querySelectorAll('[data-add]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.add;
      const card = btn.closest('.product');
      const sizeSel = card.querySelector(`[data-size="${id}"]`);
      const qtyInput = card.querySelector('[data-barrels]');
      const size = Number(sizeSel?.value) || barrelSizes[0];
      const barrels = Number(qtyInput?.value) || 1;
      addToCart(id, size, barrels);
    });
  });
}

function renderCatalog() {
  const container = document.getElementById('catalog-grid');
  if (!container) return;
  container.innerHTML = '';

  catalogCards.forEach((item) => {
    const tags = (item.tags || []).map((tag) => `<span class="chip">${tag}</span>`).join('');
    const card = document.createElement('article');
    card.className = 'card catalog-card';
    card.dataset.order = item.id;
    card.innerHTML = `
      <div class="catalog-media">
        <img src="${item.imagem}" alt="${item.nome} - chope" loading="lazy">
      </div>
      <div class="catalog-body">
        <p class="eyebrow">${item.categoria}</p>
        <h3>${item.nome}</h3>
        <p class="catalog-text">${item.descricao}</p>
        ${tags ? `<div class="catalog-tags">${tags}</div>` : ''}
        <button class="btn primary small catalog-cta" type="button" data-order="${item.id}">Pedir este chope</button>
      </div>
    `;
    card.addEventListener('click', (event) => {
      if (event.target.closest('button')) return;
      openOrderFromCatalog(item.id);
    });
    container.appendChild(card);
  });

  container.querySelectorAll('[data-order]').forEach((btn) => {
    btn.addEventListener('click', () => {
      openOrderFromCatalog(btn.dataset.order);
    });
  });
}

function getProductImage(id) {
  const match = catalogCards.find((card) => card.id === id);
  return match ? match.imagem : null;
}

function setProductFilter(id) {
  activeProductFilter = id;
  keepProductFilter = true;
  renderProducts();
}

function clearProductFilter() {
  activeProductFilter = null;
  renderProducts();
}

function handlePedidoTabOpen() {
  if (keepProductFilter) {
    keepProductFilter = false;
    return;
  }
  if (activeProductFilter) {
    clearProductFilter();
  }
}

function openOrderFromCatalog(id) {
  setProductFilter(id);
  activateTab('pedido');
  window.setTimeout(() => {
    focusProductCard(id);
  }, 80);
}

function focusProductCard(id) {
  const target = document.querySelector(`.product[data-product="${id}"]`);
  if (!target) return;
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  target.classList.add('product-focus');
  window.setTimeout(() => {
    target.classList.remove('product-focus');
  }, 1200);
}

function barrelsInCartFor(id, size) {
  return cart
    .filter((item) => item.id === id && item.size === size)
    .reduce((sum, item) => sum + item.barrels, 0);
}

function addToCart(id, size, barrels) {
  const available = stock[id]?.[size] ?? 0;
  const existing = barrelsInCartFor(id, size);
  if (barrels > 0 && existing + barrels > available) {
    alert('Quantidade solicitada acima do estoque de barris disponivel.');
    return;
  }
  const existingLine = cart.find((line) => line.id === id && line.size === size);
  if (existingLine) {
    existingLine.barrels += barrels;
  } else {
    cart.push({ id, size, barrels });
  }
  renderCart();
}

function renderCart() {
  const container = document.getElementById('cart-items');
  container.innerHTML = '';
  if (!cart.length) {
    container.innerHTML = '<p class="muted">Nenhum item no carrinho.</p>';
  }

  let total = 0;
  cart.forEach((line, index) => {
    const product = productList.find((p) => p.id === line.id);
    const litros = line.size * line.barrels;
    const lineTotal = product.preco * litros;
    total += lineTotal;
    const row = document.createElement('div');
    row.className = 'cart-line';
    row.innerHTML = `
      <div>
        <strong>${product.nome}</strong>
        <div class="meta">${line.barrels} Barril de ${line.size} L | ${litros} L | ${currency.format(product.preco)} / L</div>
      </div>
      <div>
        <div>${currency.format(lineTotal)}</div>
        <button class="btn ghost small" data-remove-index="${index}">Remover</button>
      </div>
    `;
    container.appendChild(row);
  });

  document.getElementById('cart-total').textContent = currency.format(total);
  const continueBtn = document.getElementById('cart-continue');
  if (continueBtn) continueBtn.disabled = !cart.length;
  updateCartBadge();

  container.querySelectorAll('[data-remove-index]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.removeIndex);
      cart.splice(idx, 1);
      renderCart();
    });
  });
}

function getCartCount() {
  return cart.reduce((sum, item) => sum + (item.barrels || 0), 0);
}

function updateCartBadge() {
  const badge = document.getElementById('cart-count');
  if (!badge) return;
  const count = getCartCount();
  badge.textContent = count > 0 ? String(count) : '';
  badge.classList.toggle('show', count > 0);
}

function openCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  if (!drawer) return;
  renderCart();
  drawer.classList.remove('hidden');
  drawer.classList.add('open');
  drawer.setAttribute('aria-hidden', 'false');
  document.body.classList.add('cart-open');
}

function closeCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  if (!drawer) return;
  drawer.classList.remove('open');
  drawer.classList.add('hidden');
  drawer.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('cart-open');
}

function clearCart() {
  cart = [];
  renderCart();
}

function renderStock() {
  const container = document.getElementById('stock-list');
  container.innerHTML = '';
  productList.forEach((p) => {
    const productStock = stock[p.id] || {};
    const row = document.createElement('div');
    row.className = 'stock-line';
    const sizeRows = barrelSizes
      .map((size) => {
        const qty = productStock[size] ?? 0;
        return `
          <div class="stock-size">
            <div class="meta">${size} L</div>
            <div class="stock-actions">
              <button class="btn ghost small" data-stock-decr="${p.id}:${size}">-1</button>
              <button class="btn ghost small" data-stock-incr="${p.id}:${size}">+1</button>
              <input type="number" min="0" step="1" value="${qty}" placeholder="0">
              <button class="btn primary small" data-stock-set="${p.id}:${size}">Salvar</button>
            </div>
            <div class="meta">Barris: ${qty}</div>
          </div>
        `;
      })
      .join('');

    row.innerHTML = `
      <h4>${p.nome} <span class="meta">(${p.marca})</span></h4>
      ${sizeRows}
    `;
    container.appendChild(row);
  });

  container.querySelectorAll('[data-stock-set]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const [id, size] = btn.dataset.stockSet.split(':');
      const input = btn.parentElement.querySelector('input');
      const value = Math.max(0, Number(input.value) || 0);
      stock[id] = stock[id] || {};
      stock[id][size] = value;
      saveStock();
      renderProducts();
      renderStock();
    });
  });

  container.querySelectorAll('[data-stock-decr]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const [id, size] = btn.dataset.stockDecr.split(':');
      adjustStock(id, size, -1);
    });
  });
  container.querySelectorAll('[data-stock-incr]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const [id, size] = btn.dataset.stockIncr.split(':');
      adjustStock(id, size, 1);
    });
  });
}

function adjustStock(id, size, delta) {
  stock[id] = stock[id] || {};
  const current = stock[id][size] ?? 0;
  const next = Math.max(0, current + delta);
  stock[id][size] = next;
  saveStock();
  renderProducts();
  renderStock();
}

function renderOrders() {
  const container = document.getElementById('orders-list');
  container.innerHTML = '';
  const statusFilter = document.getElementById('filter-status').value;
  const dateFilter = document.getElementById('filter-date').value;

  const filtered = orders.filter((order) => {
    const matchStatus = statusFilter === 'todos' || order.status === statusFilter;
    const matchDate = !dateFilter || (order.quando || '').startsWith(dateFilter);
    return matchStatus && matchDate;
  });

  if (!filtered.length) {
    container.innerHTML = '<p class="muted">Nenhum pedido.</p>';
    return;
  }

  filtered.forEach((order) => {
    const card = document.createElement('div');
    card.className = 'order-card';
    const items = order.items
      .map((i) => {
        const litros = i.litros ?? 0;
        if (i.barris && i.tamanho) {
          return `${i.barris}x${i.tamanho}L ${i.nome} (${litros}L)`;
        }
        return `${litros}L ${i.nome}`;
      })
      .join(' | ');
    card.innerHTML = `
      <h4>${order.cliente} <span class="pill status-${order.status}">${order.status}</span></h4>
      <div class="order-meta">
        <span>Telefone: ${order.telefone}</span>
        <span>${order.tipo === 'delivery' ? 'Delivery' : 'Retirada'}</span>
        <span>Quando: ${formatDate(order.quando)}</span>
        <span>Total: ${currency.format(order.total)}</span>
      </div>
      <div>${items}</div>
      ${order.endereco ? `<div class="order-meta">Endereco: ${order.endereco}</div>` : ''}
      ${order.obs ? `<div class="order-meta">Obs: ${order.obs}</div>` : ''}
      <div class="order-actions">
        <button class="btn ghost small" data-status="${order.id}:pendente">Pendente</button>
        <button class="btn ghost small" data-status="${order.id}:preparando">Preparando</button>
        <button class="btn primary small" data-status="${order.id}:pronto">Pronto</button>
      </div>
    `;
    container.appendChild(card);
  });

  container.querySelectorAll('[data-status]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const [id, status] = btn.dataset.status.split(':');
      updateStatus(id, status);
    });
  });
}

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  return date.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

function updateStatus(id, status) {
  const order = orders.find((o) => o.id === id);
  if (!order) return;
  order.status = status;
  saveOrders();
  renderOrders();
}

function submitOrder(event) {
  event.preventDefault();
  if (!cart.length) {
    alert('Adicione itens ao carrinho.');
    return;
  }

  const formData = new FormData(event.target);
  const pedido = {
    id: `PED-${Date.now().toString().slice(-6)}`,
    cliente: (formData.get('nome') || '').trim(),
    telefone: (formData.get('telefone') || '').trim(),
    tipo: formData.get('tipo'),
    quando: formData.get('quando'),
    endereco: (formData.get('endereco') || '').trim(),
    pagamento: formData.get('pagamento'),
    obs: (formData.get('obs') || '').trim(),
    status: 'pendente',
    criadoEm: new Date().toISOString()
  };

  const items = cart.map((line) => {
    const product = productList.find((p) => p.id === line.id);
    const litros = line.size * line.barrels;
    return { id: line.id, nome: product.nome, preco: product.preco, litros, barris: line.barrels, tamanho: line.size };
  });
  const total = items.reduce((sum, i) => sum + i.preco * i.litros, 0);
  pedido.items = items;
  pedido.total = total;

  if (pedido.tipo === 'delivery' && !pedido.endereco) {
    alert('Informe o endereco para delivery.');
    return;
  }

  items.forEach((item) => {
    if (stock[item.id]?.[item.tamanho] !== undefined) {
      stock[item.id][item.tamanho] = Math.max(0, (stock[item.id][item.tamanho] || 0) - item.barris);
    }
  });
  saveStock();

  orders.unshift(pedido);
  saveOrders();
  clearCart();
  renderOrders();
  renderProducts();
  renderStock();
  event.target.reset();
  event.target.quando.value = getDefaultDateTime();
  alert('Pedido registrado com sucesso!');
}

function setDefaultDateTime() {
  const input = document.querySelector('input[name="quando"]');
  if (input) input.value = getDefaultDateTime();
}

function getDefaultDateTime() {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 60);
  const iso = now.toISOString();
  return iso.slice(0, 16);
}

function setupTabs() {
  const tabs = document.querySelectorAll('[data-tab]');
  tabs.forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      if (target === 'painel' && !isAdmin) {
        openAdminLock();
        return;
      }
      if (target === 'pedido') {
        handlePedidoTabOpen();
      }
      activateTab(target);
    });
  });
}

function activateTab(target) {
  document.querySelectorAll('.tab-btn').forEach((t) => t.classList.toggle('active', t.dataset.tab === target));
  document.querySelectorAll('.tab-content').forEach((section) =>
    section.classList.toggle('active', section.id === target)
  );
}

function setupFilters() {
  document.getElementById('filter-status').addEventListener('change', renderOrders);
  document.getElementById('filter-date').addEventListener('change', renderOrders);
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
}

function openAdminLock() {
  document.getElementById('admin-lock').classList.remove('hidden');
}

function closeAdminLock() {
  document.getElementById('admin-lock').classList.add('hidden');
}

function setupAdminLogin() {
  const form = document.getElementById('admin-login');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const senha = (new FormData(form).get('senha') || '').trim();
    if (senha === 'galanteAdmin') {
      isAdmin = true;
      closeAdminLock();
      activateTab('painel');
    } else {
      alert('Senha invalida.');
    }
  });
  document.getElementById('close-lock').addEventListener('click', closeAdminLock);
}

function startSplash() {
  const splash = document.getElementById('splash');
  if (!splash) {
    document.body.classList.remove('splashing');
    activateTab('como-funciona');
    return;
  }
  document.body.classList.add('splashing');
  window.setTimeout(() => {
    splash.classList.add('hidden');
    document.body.classList.remove('splashing');
    activateTab('como-funciona');
  }, SPLASH_DURATION);
}

function init() {
  renderCatalog();
  renderProducts();
  renderCart();
  renderStock();
  renderOrders();
  setDefaultDateTime();
  setupTabs();
  setupFilters();
  setupAdminLogin();
  const cartButton = document.getElementById('cart-button');
  if (cartButton) {
    cartButton.addEventListener('click', () => {
      if (cart.length) {
        openCartDrawer();
      } else {
        activateTab('catalogo');
      }
    });
  }
  const cartContinue = document.getElementById('cart-continue');
  if (cartContinue) {
    cartContinue.addEventListener('click', () => {
      if (!cart.length) return;
      closeCartDrawer();
      activateTab('checkout');
    });
  }
  const closeCart = document.getElementById('close-cart');
  if (closeCart) closeCart.addEventListener('click', closeCartDrawer);
  document.querySelectorAll('[data-cart-close]').forEach((btn) => {
    btn.addEventListener('click', closeCartDrawer);
  });
  document.getElementById('order-form').addEventListener('submit', submitOrder);
  document.getElementById('clear-cart').addEventListener('click', clearCart);
  registerServiceWorker();
  startSplash();
}

document.addEventListener('DOMContentLoaded', init);
