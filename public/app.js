const iconPaths = {
  leaf: '<path d="M20.8 3.2C11.5 3.1 5.3 5.3 4 11c-.9 4 2.4 6.5 5.8 5.7 5.7-1.3 8-7.4 8-10.4-2.7 4.3-6.6 7.4-11.2 9.4M12 20v-4"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  heart: '<path d="M20.8 8.8c0 4.2-8.8 10.2-8.8 10.2S3.2 13 3.2 8.8A4.8 4.8 0 0 1 12 6.2a4.8 4.8 0 0 1 8.8 2.6Z"/>',
  home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  package: '<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="M3 8v9l9 5 9-5V8M12 13v9"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/>',
  chevron: '<path d="m9 18 6-6-6-6"/>',
  arrow: '<path d="M19 12H5m7 7-7-7 7-7"/>',
  arrowRight: '<path d="M5 12h14m-7-7 7 7-7 7"/>',
  close: '<path d="m18 6-12 12M6 6l12 12"/>',
  sliders: '<path d="M4 21v-7m0-4V3m8 18v-9m0-4V3m8 18v-5m0-4V3M2 14h4m4-6h4m4 8h4"/>',
  star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z"/>',
  pin: '<path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  shield: '<path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="m9 12 2 2 4-4"/>',
  message: '<path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8A8.5 8.5 0 0 1 8.7 3.9a8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z"/>',
  edit: '<path d="m16 4 4 4M4 20l4-.8L19 8a2.8 2.8 0 0 0-4-4L4 15l-.8 5Z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
  eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
};
const icon = (name, size = 18) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconPaths[name] || iconPaths.leaf}</svg>`;

let animals = [];
let adminAnimals = [];
let categories = [];
const catalogOrder = [
  'Ayam Broiler', 'Ayam Kampung', 'Sapi Bali', 'Domba Batur', 'Bebek Mojosari',
  'Bebek Tegal', 'Kambing Etawa', 'Domba Garut', 'Kambing Kacang', 'Sapi Limousin',
];
const catalogOrderIndex = new Map(catalogOrder.map((name, index) => [name.toLocaleLowerCase('id'), index]));
const orderCatalog = rows => [...rows].sort((a, b) => {
  const first = catalogOrderIndex.get(a.name.toLocaleLowerCase('id')) ?? Number.MAX_SAFE_INTEGER;
  const second = catalogOrderIndex.get(b.name.toLocaleLowerCase('id')) ?? Number.MAX_SAFE_INTEGER;
  return first - second || a.name.localeCompare(b.name, 'id');
});

const state = {
  page: 'home',
  fromPage: 'catalog',
  query: '',
  sort: 'Terbaru',
  category: 'Semua',
  filters: { kinds: [], health: [], min: '', max: '', age: '' },
  saved: new Set(),
  compare: [],
  savedTab: 'Semua',
  currentAnimalId: null,
  currentOrderId: null,
  currentOrder: null,
  currentReviewAnimalId: null,
  animalReviews: [],
  orders: [],
  cart: [],
  checkoutItems: [],
  token: sessionStorage.getItem('mykandang-token') || '',
  user: null,
  authMode: 'login',
  pendingAuthAction: null,
  checkout: { method: 'Kirim Kurir', address: '', paymentMethod: 'Transfer Bank', proof: '' },
  profile: null,
  adminSummary: null,
  adminOrders: [],
  adminUsers: [],
  adminChats: [],
  reviewRating: 5,
  profileTab: 'akun',
};

const formatPrice = value => Number(value) > 0 ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value).replace('IDR', 'Rp').replace(/\u00a0/g, '') : 'Harga belum diatur';
const isGoogleDriveLink = value => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname === 'drive.google.com' && !url.port && !url.username && !url.password && url.pathname !== '/';
  } catch { return false; }
};
const animalById = id => animals.find(item => String(item.id) === String(id));
const isSaved = id => state.saved.has(id);
const animalClass = item => item.category === 'Unggas' || item.kind === 'Ayam' || item.kind === 'Bebek' ? 'unggas' : item.kind === 'Kambing' ? 'kambing' : item.kind === 'Domba' ? 'domba' : '';
const animalEmoji = item => ({ Sapi: '🐄', Kambing: '🐐', Domba: '🐑', Ayam: '🐓', Bebek: '🦆' }[item.kind] || '🐾');
const currentOrder = () => state.currentOrder || state.orders.find(order => Number(order.id_pesanan) === Number(state.currentOrderId));
const API_BASE = location.hostname === 'localhost' && location.port !== '3000' ? 'http://localhost:3000' : '';
const api = async (path, options = {}) => {
  const headers = { 'Content-Type': 'application/json', ...(state.token ? { Authorization: `Bearer ${state.token}` } : {}), ...(options.headers || {}) };
  const response = await fetch(`${API_BASE}/api${path}`, { ...options, headers });
  if (!response.ok) { const payload = await response.json().catch(() => ({})); throw new Error(payload.error || 'Tidak dapat menghubungi server MyKandang.'); }
  return response.status === 204 ? null : response.json();
};
const navItems = [
  { id: 'home', label: 'Beranda', icon: 'home' },
  { id: 'saved', label: 'Tersimpan', icon: 'heart' },
  { id: 'orders', label: 'Pesanan', icon: 'package' },
  { id: 'profile', label: 'Profil', icon: 'user' },
];

function setPage(page, opts = {}, { scrollTarget = '' } = {}) {
  if (state.page === 'catalog' && page === 'detail') state.fromPage = 'catalog';
  if (page === 'detail' && state.page === 'home') state.fromPage = 'home';
  if (page === 'detail' && state.page === 'saved') state.fromPage = 'saved';
  if (opts.animalId) state.currentAnimalId = opts.animalId;
  if (opts.orderId) state.currentOrderId = opts.orderId;
  state.page = page;
  render();
  if (scrollTarget) document.getElementById(scrollTarget)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  else window.scrollTo({ top: 0, behavior: 'smooth' });
}

function navActive(page) {
  if (page === 'catalog') return 'catalog';
  if (['detail','compare'].includes(page)) return 'home';
  if (page === 'checkout' || page === 'order-detail' || page === 'review') return 'orders';
  return page;
}

function renderShell() {
  const topbar = document.getElementById('topbar');
  const desktopItems = [navItems[0], { id: 'catalog', label: 'Daftar hewan' }, ...navItems.slice(1), ...(state.user?.role==='staff_admin'?[{id:'admin',label:'Admin'}]:[])];
  topbar.innerHTML = `<div class="topbar-inner">
    <a class="brand" href="#" data-page="home" aria-label="MyKandang Beranda"><span class="brand-mark"><img src="assets/mykandang-logo-clean.png?v=2" alt="" /></span><span class="brand-word">My<span>Kandang</span></span></a>
    <nav class="main-nav" aria-label="Navigasi utama">${desktopItems.map(item => `<button class="nav-link ${(item.id==='catalog' ? state.page==='catalog' : navActive(state.page)===item.id) ? 'active' : ''}" data-page="${item.id}">${item.label}</button>`).join('')}</nav>
    <div class="top-actions">
      <button class="icon-button" aria-label="Cari hewan" data-action="open-search">${icon('search')}</button>
      <button class="icon-button" aria-label="Bandingkan hewan" data-page="compare">${icon('grid')}${state.compare.length ? `<span class="bag-count">${state.compare.length}</span>` : ''}</button>
      <button class="icon-button" aria-label="Keranjang" data-page="cart">${icon('package')}${state.cart.length ? `<span class="bag-count">${state.cart.length}</span>` : ''}</button>
      <button class="icon-button" aria-label="Chat MyKandang" title="Chat MyKandang" data-action="chat">${icon('message')}</button>
      ${state.user ? `<button class="avatar-button" aria-label="Buka profil" data-page="profile">${escapeHtml(state.user.nama.split(/\s+/).map(part=>part[0]).slice(0,2).join('').toUpperCase())}</button>` : `<button class="button button-secondary button-small" data-action="auth">Masuk</button>`}
    </div>
  </div>`;
  const mobileNav = document.getElementById('mobile-nav');
  mobileNav.innerHTML = navItems.map(item => `<button class="${navActive(state.page) === item.id ? 'active' : ''}" data-page="${item.id}" aria-label="${item.label}">${icon(item.icon)}<span>${item.label}</span></button>`).join('');
}

function render() {
  renderShell();
  const main = document.getElementById('app-main');
  const pages = {
    home: renderHome,
    catalog: renderCatalog,
    cart: renderCart,
    saved: renderSaved,
    orders: renderOrders,
    profile: renderProfile,
    detail: renderDetail,
    compare: renderCompare,
    checkout: renderCheckout,
    'order-detail': renderOrderDetail,
    review: renderReview,
    admin: renderAdmin,
  };
  main.innerHTML = (pages[state.page] || renderHome)();
  renderCompareBar();
}

function renderHome() {
  const latest = [...animals].slice(0, 4);
  return `<section class="page">
    <div class="hero">
      <div class="hero-copy">
        <span class="eyebrow">Pasar Ternak Pilihan Keluarga Indonesia</span>
        <h1>Temukan ternak sehat,<br /><em>pilihan yang lebih yakin.</em></h1>
        <p>Jelajahi ternak berdasarkan kategori, kondisi, umur, stok, dan harga yang tercatat.</p>
        <form class="searchbar" data-form="search"><span>${icon('search')}</span><input name="query" placeholder="Cari sapi, kambing, domba…" aria-label="Cari hewan" /><button class="button" type="submit">Cari hewan</button></form>
      <div class="hero-notes"><span>${icon('shield',14)} Data hewan tersimpan</span><span>${icon('check',14)} Info kesehatan jelas</span><span>${icon('eye',14)} Ulasan pembeli</span></div>
      </div>
    </div>
    <section class="section">
      <div class="section-heading"><div><span class="eyebrow">Temukan Kebutuhanmu</span><h2>Jelajahi kategori</h2></div><button class="text-link" data-page="catalog">Lihat semua hewan ${icon('chevron',13)}</button></div>
      <div class="category-grid">
        ${categories.map(category => `<button class="category-card" data-category="${escapeHtml(category.nama_kategori)}"><span class="category-icon">${animalEmoji({kind:category.nama_kategori})}</span><span><strong>${escapeHtml(category.nama_kategori)}</strong><small>${escapeHtml(category.deskripsi || 'Lihat hewan tersedia')}</small></span>${icon('chevron',15)}</button>`).join('')}
      </div>
    </section>
    <section class="section">
      <div class="section-heading"><div><span class="eyebrow">Pilihan Terbaru</span><h2>Hewan terbaru</h2><p class="subtle small" style="margin:5px 0 0">Temukan ternak sehat yang baru bergabung.</p></div><button class="text-link" data-page="catalog">Lihat semua ${icon('chevron',13)}</button></div>
      <div class="animal-grid">${latest.map(item => animalCard(item)).join('')}</div>
    </section>
    <div class="trust-strip">
      <div class="trust-item"><span class="trust-icon">${icon('shield')}</span><span><strong>Informasi terstruktur</strong><small>Umur, stok, harga, dan kondisi tersimpan.</small></span></div>
      <div class="trust-item"><span class="trust-icon">${icon('grid')}</span><span><strong>Bandingkan dengan mudah</strong><small>Pilih hingga 3 ternak berdampingan.</small></span></div>
      <div class="trust-item"><span class="trust-icon">${icon('message')}</span><span><strong>Riwayat chat</strong><small>Percakapan tersimpan pada akun pengguna.</small></span></div>
    </div>
  </section>`;
}

function animalCard(item) {
  const typeClass = animalClass(item);
  return `<article class="animal-card">
    <div class="animal-image ${typeClass}" data-action="detail" data-id="${item.id}" role="button" tabindex="0" aria-label="Lihat ${escapeHtml(item.name)}">
      <span class="image-badge"><span class="pill ${item.stock==='Tersedia'?'white':'red'}"><i class="pill-dot"></i> ${escapeHtml(item.stock)}</span></span>
      ${item.images?.length ? `<img class="animal-emoji-photo" src="${escapeHtml(item.images.find(image=>image.utama)?.url || item.images[0].url)}" alt="${escapeHtml(item.name)}" onerror="this.hidden=true;this.nextElementSibling.hidden=false" /><span class="animal-emoji" aria-hidden="true" hidden>${animalEmoji(item)}</span>` : `<span class="animal-emoji" aria-hidden="true">${animalEmoji(item)}</span>`}
      <button class="save-button ${isSaved(item.id) ? 'saved' : ''}" data-action="save" data-id="${item.id}" aria-label="${isSaved(item.id) ? 'Hapus dari tersimpan' : 'Simpan hewan'}">${icon('heart')}</button>
    </div>
    <div class="animal-info">
      <div class="animal-title-row"><button class="animal-title" data-action="detail" data-id="${item.id}">${escapeHtml(item.name)}</button><span class="pill ${item.health === 'Divaksin' ? '' : 'gray'}">${escapeHtml(item.health)}</span></div>
      <div class="animal-price">${formatPrice(item.price)}</div>
      <div class="animal-meta"><span>${escapeHtml(item.age)}</span><i class="divider"></i><span>${escapeHtml(item.gender || 'Jenis kelamin belum dicantumkan')}</span></div>
      <div class="seller-rating"><span>${escapeHtml(item.kind)} · ${escapeHtml(item.breed || item.category)}</span><span class="stars">${item.rating ? `★ ${item.rating.toFixed(1)} · ${item.reviews}` : 'Belum ada ulasan'}</span></div>
      <div class="card-bottom"><label class="compare-toggle"><input type="checkbox" data-action="compare-toggle" data-id="${item.id}" ${state.compare.some(id=>String(id)===String(item.id)) ? 'checked' : ''} /> Bandingkan</label><button class="card-detail-link" data-action="detail" data-id="${item.id}">Lihat detail ${icon('chevron',12)}</button></div>
    </div>
  </article>`;
}

function getFilteredAnimals() {
  const f = state.filters;
  let list = animals.filter(item => {
    const q = state.query.trim().toLocaleLowerCase('id');
    if (q && ![item.name,item.kind,item.category,item.breed,item.description].join(' ').toLocaleLowerCase('id').includes(q)) return false;
    if (state.category !== 'Semua' && item.category !== state.category) return false;
    if (f.kinds.length && !f.kinds.includes(item.kind)) return false;
    if (f.health.length && !f.health.includes(item.health)) return false;
    if (f.min && item.price < Number(f.min)) return false;
    if (f.max && item.price > Number(f.max)) return false;
    if (f.age && item.ageMonths == null) return false;
    if (f.age === 'under1' && item.ageMonths >= 12) return false;
    if (f.age === '1to2' && !(item.ageMonths >= 12 && item.ageMonths <= 24)) return false;
    if (f.age === 'over2' && item.ageMonths <= 24) return false;
    return true;
  });
  if (state.sort === 'Termurah') list.sort((a,b) => a.price-b.price);
  if (state.sort === 'Termahal') list.sort((a,b) => b.price-a.price);
  if (state.sort === 'Rating tertinggi') list.sort((a,b) => (b.rating || 0)-(a.rating || 0));
  return list;
}

function renderFilterChips() {
  const f = state.filters;
  const chips = [];
  if (state.category !== 'Semua') chips.push([state.category, () => { state.category='Semua'; render(); }]);
  f.kinds.forEach(kind => chips.push([kind, () => { f.kinds=f.kinds.filter(v=>v!==kind); render(); }]));
  f.health.forEach(v => chips.push([v, () => { f.health=f.health.filter(x=>x!==v); render(); }]));
  if (f.min || f.max) chips.push([`${f.min ? formatPrice(Number(f.min)) : 'Rp0'} – ${f.max ? formatPrice(Number(f.max)) : 'bebas'}`, () => { f.min='';f.max='';render(); }]);
  if (!chips.length) return '';
  return `<div class="filter-chips">${chips.map(([label]) => `<button class="filter-chip" data-action="clear-chip" data-label="${escapeHtml(label)}">${escapeHtml(label)} ×</button>`).join('')}<button class="text-link" data-action="reset-filters">Hapus semua</button></div>`;
}

function renderCatalog() {
  const list = getFilteredAnimals();
  const activeCount = state.filters.kinds.length + state.filters.health.length + (state.filters.min||state.filters.max ? 1 : 0) + (state.filters.age ? 1 : 0);
  return `<section class="page">
    <div class="page-header"><div><span class="eyebrow">Pasar Hewan</span><h1>Daftar hewan</h1><p>Bandingkan kategori, kondisi kesehatan, umur, stok, dan harga.</p></div>
      <div class="catalog-controls">
        <form class="catalog-search" data-form="search">${icon('search')}<input name="query" value="${escapeHtml(state.query)}" placeholder="Cari hewan atau kata kunci…" aria-label="Cari hewan" /></form>
        <button class="button button-secondary button-small" data-action="filters">${icon('sliders')} Filter ${activeCount ? `<span class="pill">${activeCount}</span>` : ''}</button>
        <select class="select-control" data-change="sort" aria-label="Urutkan hewan"><option ${state.sort==='Terbaru'?'selected':''}>Terbaru</option><option ${state.sort==='Termurah'?'selected':''}>Termurah</option><option ${state.sort==='Termahal'?'selected':''}>Termahal</option><option ${state.sort==='Rating tertinggi'?'selected':''}>Rating tertinggi</option></select>
      </div>
    </div>
    ${renderFilterChips()}
    <div class="catalog-meta"><span><strong>${list.length} hewan</strong> ditemukan</span><span>${categories.map(category=>escapeHtml(category.nama_kategori)).join(' · ')}</span></div>
    ${list.length ? `<div class="animal-grid">${list.map(animalCard).join('')}</div>` : `<div class="empty-state"><div class="empty-illustration">🔎</div><h3>Belum ada hewan yang cocok</h3><p>Coba ubah kata pencarian atau atur ulang filter.</p><button class="button button-secondary" data-action="reset-filters">Hapus filter</button></div>`}
  </section>`;
}

function renderSaved() {
  if (!state.user) return `<section class="page">${authRequired('Masuk untuk melihat wishlist')}</section>`;
  const savedList = [...state.saved].map(animalById).filter(Boolean);
  const visible = state.savedTab === 'Tersedia' ? savedList.filter(item => item.stock === 'Tersedia') : state.savedTab === 'Sudah terjual' ? savedList.filter(item => item.stock !== 'Tersedia') : savedList;
  return `<section class="page">
    <div class="saved-head"><div><span class="eyebrow">Koleksi Pilihanmu</span><h1>Hewan tersimpan</h1><p class="subtle" style="margin:5px 0 0">Simpan ternak menarik dan lihat lagi kapan saja.</p></div>
      <div class="tabs">${['Semua','Tersedia','Sudah terjual'].map(tab => `<button class="tab ${state.savedTab===tab?'active':''}" data-action="saved-tab" data-value="${tab}">${tab}${tab==='Semua' ? ` · ${savedList.length}` : ''}</button>`).join('')}</div>
    </div>
    ${visible.length ? `<div class="animal-grid">${visible.map(animalCard).join('')}</div>` : `<div class="empty-state"><div class="empty-illustration">♡</div><h3>${state.savedTab==='Sudah terjual'?'Belum ada hewan terjual':'Belum ada hewan tersimpan'}</h3><p>Jelajahi daftar hewan dan simpan pilihan yang menarik bagimu.</p><button class="button" data-page="catalog">Jelajahi hewan ${icon('arrowRight',15)}</button></div>`}
  </section>`;
}

function renderOrders() {
  if (!state.user) return `<section class="page">${authRequired('Masuk untuk melihat pesanan')}</section>`;
  const orders = [...state.orders].reverse();
  return `<section class="page">
    <div class="page-header"><div><span class="eyebrow">Transaksi Kamu</span><h1>Pesanan</h1><p>Pantau status pesanan, item, dan pembayaran.</p></div></div>
    ${orders.length ? `<div class="order-list">${orders.map(order => {
      const first = order.details?.[0];
      return `<article class="order-card"><div class="order-thumb">${first ? animalEmoji({kind:animalById(first.id_hewan)?.kind}) : '📦'}</div><div class="order-main"><span class="pill ${order.status_pesanan==='Dibatalkan'?'red':''}">${order.status_pesanan}</span><h3>${first?.nama || 'Pesanan hewan'}${order.details?.length>1?` + ${order.details.length-1} hewan`:''}</h3><p>No. Pesanan ${order.id_pesanan} · ${new Date(order.tgl_pesanan).toLocaleDateString('id-ID')}</p><p>${order.metode_serah_terima}</p></div><div class="order-actions"><div><div class="order-price">${formatPrice(order.total_harga)}</div><button class="button button-secondary button-small" data-action="order-detail" data-id="${order.id_pesanan}">Lihat pesanan</button></div></div></article>`;
    }).join('')}</div>` : `<div class="empty-state"><div class="empty-illustration">📦</div><h3>Belum ada pesanan</h3><p>Pesanan yang kamu konfirmasi akan muncul di sini.</p><button class="button" data-page="catalog">Cari hewan ${icon('arrowRight',15)}</button></div>`}
  </section>`;
}

function renderCart() {
  if (!state.user) return `<section class="page">${authRequired('Masuk untuk menggunakan keranjang')}</section>`;
  const total = state.cart.reduce((sum,item)=>sum+item.price*item.jumlah,0);
  return `<section class="page"><div class="page-header"><div><span class="eyebrow">Keranjang Belanja</span><h1>Keranjang</h1><p>Periksa hewan dan jumlah sebelum membuat pesanan.</p></div></div>
    ${state.cart.length ? `<div class="checkout-layout"><div class="order-list">${state.cart.map(item=>`<article class="order-card"><div class="order-thumb">${animalEmoji(item)}</div><div class="order-main"><h3>${escapeHtml(item.name)}</h3><p>${item.kind} · ${item.age} · ${item.stock}</p><div class="order-price">${formatPrice(item.price)}</div></div><div class="order-actions"><label class="small">Jumlah <input class="field" type="number" min="1" max="${item.stockCount}" value="${item.jumlah}" data-cart-quantity="${item.id}" style="width:70px;min-height:34px;padding:5px" /></label><button class="button-ghost" data-action="remove-cart" data-id="${item.id}">Hapus</button></div></article>`).join('')}</div><aside class="panel"><div class="panel-head"><h3>Ringkasan</h3></div><div class="summary-line"><span>${state.cart.length} jenis hewan</span><strong>${formatPrice(total)}</strong></div><div class="detail-divider"></div><button class="button button-block" data-action="checkout-cart">Lanjut ke pesanan ${icon('arrowRight',14)}</button></aside></div>` : `<div class="empty-state"><div class="empty-illustration">🛒</div><h3>Keranjang masih kosong</h3><p>Tambahkan hewan yang ingin kamu pesan.</p><button class="button" data-page="catalog">Cari hewan</button></div>`}
  </section>`;
}

function renderDetail() {
  const item=animalById(state.currentAnimalId);
  if (!item) return renderCatalog();
  const from=state.fromPage==='saved'?'saved':state.fromPage==='home'?'home':'catalog';
  const image=item.images?.find(image=>image.utama)?.url || item.images?.[0]?.url;
  return `<section class="page"><button class="back-link" data-page="${from}">${icon('arrow')} Kembali ke ${from==='saved'?'wishlist':from==='home'?'beranda':'daftar hewan'}</button><div class="detail-layout">
    <div><div class="detail-photo ${animalClass(item)}"><span class="photo-tag pill ${item.stock==='Tersedia'?'white':'red'}"><i class="pill-dot"></i> ${escapeHtml(item.stock)}</span>${image?`<img class="detail-image" src="${escapeHtml(image)}" alt="${escapeHtml(item.name)}" onerror="this.hidden=true;this.nextElementSibling.hidden=false" /><span class="animal-emoji" hidden>${animalEmoji(item)}</span>`:`<span class="animal-emoji">${animalEmoji(item)}</span>`}</div>
      <div class="section" style="margin-top:22px"><div class="section-heading"><div><span class="eyebrow">Tabel Data Hewan</span><h2>Data hewan</h2></div></div><div class="spec-grid"><div class="spec-card"><span>Jenis</span><strong>${escapeHtml(item.kind||'—')}</strong></div><div class="spec-card"><span>Ras</span><strong>${escapeHtml(item.breed||'—')}</strong></div><div class="spec-card"><span>Umur</span><strong>${escapeHtml(item.age)}</strong></div><div class="spec-card"><span>Berat</span><strong>${item.weight==null?'—':`${item.weight} kg`}</strong></div><div class="spec-card"><span>Jenis kelamin</span><strong>${escapeHtml(item.gender||'—')}</strong></div><div class="spec-card"><span>Stok</span><strong>${item.stockCount} ekor</strong></div></div><div class="health-note"><strong>${icon('shield',14)} Kondisi kesehatan</strong>${escapeHtml(item.health)}${item.description?`<br />${escapeHtml(item.description)}`:''}</div></div>
    </div><div class="detail-summary"><span class="pill">${escapeHtml(item.category)}</span><h1>${escapeHtml(item.name)} ${escapeHtml(item.gender||'')}</h1><div class="detail-meta">${item.rating?`<span class="compare-rating">★</span><strong>${item.rating.toFixed(1)}</strong><span class="muted">${item.reviews} ulasan</span>`:'<span class="muted">Belum ada ulasan</span>'}</div><div class="detail-price">${formatPrice(item.price)} <small class="muted" style="font:500 11px 'DM Sans'">/ ekor</small></div><p class="subtle small">Detail hewan, kondisi kesehatan, dan ulasan pembeli.</p><div class="detail-divider"></div><div class="detail-actions"><button class="button" data-action="checkout" data-id="${item.id}" ${item.stock==='Tersedia'?'':'disabled'}>${item.stock==='Tersedia'?'Pesan hewan':item.stock==='Terjual'?'Sudah terjual':'Stok habis'} ${icon('arrowRight',15)}</button><button class="button button-secondary" data-action="add-cart" data-id="${item.id}" ${item.stock==='Tersedia'?'':'disabled'}>${icon('package')} Keranjang</button><button class="icon-button ${isSaved(item.id)?'saved':''}" data-action="save" data-id="${item.id}" aria-label="Simpan ke wishlist">${icon('heart')}</button></div>${state.user?.role==='staff_admin'?'':`<button class="text-link" data-action="chat">Chat MyKandang ${icon('chevron',12)}</button>`}</div>
    </div><section class="section"><div class="section-heading"><div><span class="eyebrow">Tabel Ulasan</span><h2>Ulasan pembeli</h2></div><span class="muted small">${state.animalReviews.length} ulasan</span></div>${state.animalReviews.length ? `<div class="review-list">${state.animalReviews.map(review=>`<article class="panel review-entry"><div class="panel-head"><strong>${escapeHtml(review.nama_pengguna)}</strong><span class="stars">${'★'.repeat(Number(review.rating))}${'☆'.repeat(5-Number(review.rating))}</span></div><p>${escapeHtml(review.komentar||'Tanpa komentar')}</p><small class="muted">${new Date(review.tanggal).toLocaleDateString('id-ID')}</small></article>`).join('')}</div>` : '<p class="subtle">Belum ada ulasan untuk hewan ini.</p>'}</section><section class="section"><div class="section-heading"><div><span class="eyebrow">Data Katalog</span><h2>Hewan lainnya</h2></div><button class="text-link" data-page="catalog">Lihat katalog</button></div><div class="animal-grid">${animals.filter(a=>a.id!==item.id).slice(0,4).map(animalCard).join('')}</div></section></section>`;
}

function renderCompare() {
  const items=state.compare.map(animalById).filter(Boolean);
  if (!items.length) return `<section class="page"><div class="page-header"><div><span class="eyebrow">Perbandingan</span><h1>Bandingkan hewan</h1><p>Pilih sampai 3 hewan dari katalog.</p></div></div><div class="empty-state"><div class="empty-illustration">⚖️</div><h3>Belum ada hewan dipilih</h3><button class="button" data-page="catalog">Pilih hewan</button></div></section>`;
  const rows=[['Harga',item=>formatPrice(item.price)],['Kategori',item=>item.category],['Jenis',item=>item.kind||'—'],['Ras',item=>item.breed||'—'],['Umur',item=>item.age],['Berat',item=>item.weight==null?'—':`${item.weight} kg`],['Jenis kelamin',item=>item.gender||'—'],['Kesehatan',item=>item.health],['Stok',item=>`${item.stockCount} ekor`],['Rating ulasan',item=>item.rating?`★ ${item.rating.toFixed(1)} (${item.reviews})`:'Belum ada ulasan']];
  return `<section class="page"><button class="back-link" data-page="catalog">${icon('arrow')} Kembali ke katalog</button><div class="page-header"><div><span class="eyebrow">Perbandingan Data Hewan</span><h1>Bandingkan hewan</h1><p>Bandingkan harga, kondisi kesehatan, dan ulasan secara berdampingan.</p></div></div><div class="compare-wrap"><table class="compare-table"><tbody><tr><th>Hewan</th>${items.map(item=>`<td><div class="compare-animal"><div class="compare-emoji">${animalEmoji(item)}</div><strong>${escapeHtml(item.name)}</strong><button class="button-ghost" data-action="remove-compare" data-id="${item.id}">Hapus</button></div></td>`).join('')}</tr>${rows.map(([label,fn])=>`<tr><th>${label}</th>${items.map(item=>`<td class="compare-value ${label==='Harga'?'price':''}">${escapeHtml(fn(item))}</td>`).join('')}</tr>`).join('')}</tbody></table></div></section>`;
}

function renderCheckout() {
  if (!state.user) return `<section class="page">${authRequired('Masuk untuk membuat pesanan')}</section>`;
  const items = state.checkoutItems.map(line=>({ ...animalById(line.id_hewan), jumlah:line.kuantitas })).filter(item=>item.id);
  if (!items.length) return renderCart();
  const total = items.reduce((sum,item)=>sum+item.price*item.jumlah,0);
  const method = state.checkout.method || 'Kirim Kurir';
  return `<section class="page"><button class="back-link" data-page="cart">${icon('arrow')} Kembali ke keranjang</button><div class="page-header"><div><span class="eyebrow">Tabel Pesanan</span><h1>Konfirmasi pesanan</h1><p>Periksa detail pesanan sebelum melanjutkan.</p></div></div>
  <div class="checkout-layout"><div class="checkout-stack"><section class="panel"><div class="panel-head"><h3>Metode serah terima</h3></div><div class="radio-list">
    <label class="choice-card ${method==='Kirim Kurir'?'selected':''}"><input type="radio" name="method" value="Kirim Kurir" data-change="method" ${method==='Kirim Kurir'?'checked':''}/><span class="choice-icon">🚚</span><span class="choice-copy"><strong>Kirim kurir</strong><small>Alamat diambil dari data pengguna.</small></span></label>
    <label class="choice-card ${method==='Ambil di Kandang'?'selected':''}"><input type="radio" name="method" value="Ambil di Kandang" data-change="method" ${method==='Ambil di Kandang'?'checked':''}/><span class="choice-icon">📍</span><span class="choice-copy"><strong>Ambil di kandang</strong><small>Atur pengambilan langsung.</small></span></label></div>
    ${method==='Kirim Kurir'?`<div class="field-group"><label class="form-label">Alamat pengiriman</label><textarea class="field" id="order-address" required>${escapeHtml(state.checkout.address||state.profile?.alamat||'')}</textarea></div>`:''}
  </section><section class="panel"><div class="panel-head"><h3>Pembayaran</h3></div><label class="form-label" for="payment-method">Metode pembayaran</label><select class="field" id="payment-method">${['Transfer Bank','E-Wallet','Tunai'].map(option=>`<option ${state.checkout.paymentMethod===option?'selected':''}>${option}</option>`).join('')}</select><label class="form-label" for="payment-proof" style="margin-top:12px">Tautan Google Drive bukti pembayaran <span class="muted">(opsional)</span></label><input class="field" id="payment-proof" type="url" maxlength="255" pattern="https://drive[.]google[.]com/.+" title="Gunakan tautan berbagi Google Drive" value="${escapeHtml(state.checkout.proof||'')}" placeholder="Tempel link berbagi Google Drive" /><p class="subtle small" style="margin:10px 0 0">Tempel tautan berbagi Google Drive dan pastikan aksesnya dapat dibuka admin.</p></section></div>
  <aside class="panel"><div class="panel-head"><h3>Ringkasan pesanan</h3></div>${items.map(item=>`<div class="summary-product"><div class="summary-thumb">${animalEmoji(item)}</div><span><strong>${escapeHtml(item.name)}</strong><small>${item.jumlah} ekor × ${formatPrice(item.price)}</small></span></div>`).join('')}<div class="summary-lines"><div class="summary-line"><span>Subtotal</span><strong>${formatPrice(total)}</strong></div></div><div class="summary-total"><span>Total</span><strong>${formatPrice(total)}</strong></div><button class="button button-block" style="margin-top:16px" data-action="place-order">Simpan pesanan ${icon('arrowRight',14)}</button></aside></div></section>`;
}

function renderOrderDetail() {
  const order = currentOrder();
  if (!order) return renderOrders();
  const cancelled = order.status_pesanan === 'Dibatalkan';
  const details = order.details || [];
  const status = order.status_pesanan || 'Pending';
  const canReview = status === 'Selesai';
  return `<section class="page"><button class="back-link" data-page="orders">${icon('arrow')} Kembali ke pesanan</button><div class="page-header"><div><span class="eyebrow">Pesanan #${order.id_pesanan}</span><h1>Status pesanan</h1><p>${new Date(order.tgl_pesanan).toLocaleString('id-ID')}</p></div><span class="pill ${cancelled?'red':''}">${escapeHtml(status)}</span></div><div class="status-layout"><div class="checkout-stack"><div class="status-banner"><span class="status-icon">${cancelled?'↩':'✓'}</span><span><strong>${cancelled?'Pesanan dibatalkan':`Status ${escapeHtml(status)}`}</strong><p>Status pesanan terbaru ditampilkan di sini.</p></span></div><section class="panel"><div class="panel-head"><h3>Detail pesanan</h3></div>${details.map(line=>`<div class="summary-product"><div class="summary-thumb">${animalEmoji({kind:animalById(line.id_hewan)?.kind})}</div><span><strong>${escapeHtml(line.nama)}</strong><small>${line.kuantitas} ekor × ${formatPrice(line.harga_satuan)}</small><small>Subtotal ${formatPrice(line.subtotal)}</small>${canReview?(line.sudah_diulas?'<small class="muted">Ulasan sudah dikirim</small>':`<button class="text-link" data-action="write-review" data-id="${order.id_pesanan}" data-animal="${line.id_hewan}">Beri ulasan</button>`):''}</span></div>`).join('')}${status==='Pending'?`<div class="info-callout">Pesanan menunggu proses berikutnya.</div><button class="button button-danger button-small" data-action="cancel-order" data-id="${order.id_pesanan}">Batalkan pesanan</button>`:''}</section></div>
  <aside class="panel"><div class="panel-head"><h3>Pembayaran</h3></div><div class="receipt-row"><span>Status</span><strong>${escapeHtml(order.status_pembayaran||'Belum Dibayar')}</strong></div><div class="receipt-row"><span>Metode</span><strong>${escapeHtml(order.metode_pembayaran||'Belum dipilih')}</strong></div><div class="receipt-row total"><span>Total</span><strong>${formatPrice(order.total_harga)}</strong></div>${order.bukti?`<div class="receipt-row"><span>Bukti pembayaran</span>${isGoogleDriveLink(order.bukti)?`<a class="text-link small" href="${escapeHtml(order.bukti)}" target="_blank" rel="noopener noreferrer">Buka Google Drive</a>`:`<small class="small muted">Tautan lama bukan link Google Drive.</small>`}</div>`:''}${order.status_pembayaran==='Belum Dibayar'?`<label class="form-label" for="payment-method">Pilih metode</label><select class="field" id="payment-method"><option>Transfer Bank</option><option>E-Wallet</option><option>Tunai</option></select><label class="form-label" for="payment-proof" style="margin-top:10px">Tautan Google Drive bukti pembayaran <span class="muted">(opsional)</span></label><input class="field" id="payment-proof" type="url" maxlength="255" pattern="https://drive[.]google[.]com/.+" title="Gunakan tautan berbagi Google Drive" value="${escapeHtml(order.bukti||'')}" placeholder="Tempel link berbagi Google Drive" /><button class="button button-block" style="margin-top:10px" data-action="payment" data-id="${order.id_pesanan}">Simpan pembayaran</button>`:''}<p class="small muted" style="margin-top:12px">Pembayaran tercatat di aplikasi; konfirmasi transaksi berlangsung di luar web.</p></aside></div></section>`;
}

function renderReview() {
  const order=currentOrder();
  const detail=order?.details?.find(item=>Number(item.id_hewan)===Number(state.currentReviewAnimalId)) || order?.details?.find(item=>!item.sudah_diulas);
  if (!order || order.status_pesanan!=='Selesai') return renderOrders();
  return `<section class="page"><button class="back-link" data-page="order-detail" data-id="${order.id_pesanan}">${icon('arrow')} Kembali ke pesanan</button><div class="page-header"><div><span class="eyebrow">Tabel Ulasan</span><h1>Ulasan hewan</h1><p>Ulasan ini terkait dengan hewan yang sudah kamu pesan.</p></div></div><div class="panel" style="max-width:650px"><div class="summary-product"><div class="summary-thumb">${animalEmoji({kind:animalById(detail?.id_hewan)?.kind})}</div><span><strong>${escapeHtml(detail?.nama||'Hewan')}</strong><small>Pesanan #${order.id_pesanan}</small></span></div><div class="detail-divider"></div><label class="form-label">Rating</label><div class="review-stars">${[1,2,3,4,5].map(i=>`<button class="star-button ${i<=state.reviewRating?'active':''}" data-action="rating" data-value="${i}" aria-label="${i} bintang">★</button>`).join('')}</div><label class="form-label" for="review-copy">Komentar <span class="muted">(maksimal 500 karakter)</span></label><textarea class="field" id="review-copy" maxlength="500" placeholder="Bagikan pengalamanmu tentang hewan ini." style="min-height:110px"></textarea><button class="button button-block" style="margin-top:17px" data-action="submit-review" data-id="${order.id_pesanan}" data-animal="${detail?.id_hewan}">Kirim ulasan ${icon('arrowRight',14)}</button></div></section>`;
}

function renderProfile() {
  if (!state.user) return `<section class="page"><div class="empty-state"><div class="empty-illustration">👤</div><h3>Masuk untuk melihat akun</h3><p>Kelola profil dan alamat, pantau pesanan, serta lihat hewan favorit yang kamu simpan.</p><button class="button" data-action="auth">Masuk atau daftar</button></div></section>`;
  const p = state.profile;
  return `<section class="page"><div class="page-header"><div><span class="eyebrow">Tabel Pengguna</span><h1>Profil</h1><p>Kelola informasi kontak yang digunakan di akun MyKandang.</p></div></div><section class="panel" style="max-width:760px"><div class="panel-head"><div class="seller-person"><span class="profile-large-avatar">${escapeHtml(p.nama.split(/\s+/).map(part=>part[0]).slice(0,2).join('').toUpperCase())}</span><span><h3>${escapeHtml(p.nama)}</h3><span class="muted small">${escapeHtml(p.email)} · ${escapeHtml(p.role)}</span></span></div><button class="button button-secondary button-small" data-action="edit-profile">${icon('edit',14)} Ubah</button></div><div class="profile-data"><div class="data-item"><span>Nomor handphone</span><strong>${escapeHtml(p.no_telepon || 'Belum dicantumkan')}</strong></div><div class="data-item"><span>Alamat</span><strong>${escapeHtml(p.alamat || 'Belum dicantumkan')}</strong></div></div>${p.role==='staff_admin'?`<div class="detail-divider"></div><button class="button button-secondary button-small" data-page="admin">Buka panel admin ${icon('arrowRight',14)}</button>`:''}<div class="detail-divider"></div><button class="button button-danger button-small" data-action="logout">Keluar dari akun</button></section></section>`;
}

async function loadAdmin() {
  const [summary, productRows, orders, users, chats, categoryRows] = await Promise.all([
    api('/admin/ringkasan'), api('/hewan'), api('/admin/pesanan'), api('/admin/pengguna'), api('/admin/chat'), api('/kategori'),
  ]);
  state.adminSummary=summary;adminAnimals=productRows;animals=orderCatalog(productRows);state.adminOrders=orders;state.adminUsers=users;state.adminChats=chats;categories=categoryRows;
}

function renderAdmin() {
  if (state.user?.role!=='staff_admin') return `<section class="page">${authRequired('Panel admin hanya tersedia untuk staff admin')}</section>`;
  const s=state.adminSummary||{};
  return `<section class="page"><div class="page-header"><div><span class="eyebrow">Kelola Data MyKandang</span><h1>Panel admin</h1><p>Kelola katalog, pesanan, akun, dan percakapan.</p></div><button class="button" data-action="admin-new-animal">${icon('plus')} Tambah hewan</button></div>
    <div class="admin-stats"><article class="panel"><small>Pengguna</small><strong>${s.jumlah_pengguna||0}</strong></article><article class="panel"><small>Hewan</small><strong>${s.jumlah_hewan||0}</strong></article><article class="panel"><small>Pesanan Pending</small><strong>${s.pesanan_pending||0}</strong></article><article class="panel"><small>Belum dibayar</small><strong>${s.pembayaran_pending||0}</strong></article></div>
    <section class="section"><div class="section-heading"><div><span class="eyebrow">Tabel Kategori Hewan</span><h2>Kategori</h2></div><button class="button button-secondary button-small" data-action="admin-new-category">${icon('plus',14)} Tambah kategori</button></div>${categories.length?`<div class="admin-list">${categories.map(category=>{const used=adminAnimals.filter(item=>Number(item.id_kategori)===Number(category.id_kategori)).length;return `<article class="panel admin-row"><div class="summary-thumb">${icon('grid')}</div><div><strong>${escapeHtml(category.nama_kategori)}</strong><small>${escapeHtml(category.deskripsi||'Tanpa deskripsi')}</small><small>${used} data hewan menggunakan kategori ini</small></div><div class="admin-actions"><button class="button button-secondary button-small" data-action="admin-edit-category" data-id="${category.id_kategori}">${icon('edit',14)} Ubah</button><button class="button button-danger button-small" data-action="admin-delete-category" data-id="${category.id_kategori}">Hapus</button></div></article>`}).join('')}</div>`:'<p class="subtle">Belum ada kategori.</p>'}</section>
    <section class="section"><div class="section-heading"><div><span class="eyebrow">Tabel Data Hewan</span><h2>Katalog</h2></div></div>${adminAnimals.length?`<div class="admin-list">${adminAnimals.map(item=>`<article class="panel admin-row"><div class="summary-thumb">${animalEmoji(item)}</div><div><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.category)} · ${item.stockCount} ekor · ${escapeHtml(item.stock)}</small><small>${formatPrice(item.price)} · ${escapeHtml(item.health)}</small></div><div class="admin-actions"><button class="button button-secondary button-small" data-action="admin-edit-animal" data-id="${item.id}">${icon('edit',14)} Ubah</button><button class="button button-danger button-small" data-action="admin-delete-animal" data-id="${item.id}">Hapus</button></div></article>`).join('')}</div>`:'<p class="subtle">Belum ada data hewan.</p>'}</section>
    <section class="section"><div class="section-heading"><div><span class="eyebrow">Tabel Pesanan & Pembayaran</span><h2>Transaksi</h2></div></div>${state.adminOrders.length?`<div class="admin-list">${state.adminOrders.map(order=>`<article class="panel admin-order"><div class="panel-head"><span><strong>Pesanan #${order.id_pesanan}</strong><small>${escapeHtml(order.nama_pelanggan)} · ${escapeHtml(order.email)}</small></span><strong>${formatPrice(order.total_harga)}</strong></div><p>${order.details.map(line=>`${escapeHtml(line.nama)} × ${line.kuantitas}`).join(' · ')} · ${escapeHtml(order.metode_serah_terima)}</p>${order.bukti?(isGoogleDriveLink(order.bukti)?`<a class="text-link small" href="${escapeHtml(order.bukti)}" target="_blank" rel="noopener noreferrer">Buka bukti pembayaran di Google Drive</a>`:`<small class="muted">Tautan bukti bukan link Google Drive.</small>`):''}<div class="admin-order-controls"><label class="small">Pesanan<select class="field" data-admin-order-status="${order.id_pesanan}">${['Pending','Diproses','Selesai','Dibatalkan'].map(status=>`<option ${order.status_pesanan===status?'selected':''}>${status}</option>`).join('')}</select></label><label class="small">Pembayaran<select class="field" data-admin-payment-status="${order.id_pesanan}">${['Belum Dibayar','Berhasil'].map(status=>`<option ${order.status_pembayaran===status?'selected':''}>${status}</option>`).join('')}</select></label><button class="button button-secondary button-small" data-action="admin-save-order" data-id="${order.id_pesanan}">Simpan</button></div></article>`).join('')}</div>`:'<p class="subtle">Belum ada pesanan.</p>'}</section>
    <section class="section" id="admin-conversations"><div class="section-heading"><div><span class="eyebrow">Tabel Percakapan</span><h2>Percakapan</h2></div></div>${state.adminChats.length?`<div class="admin-list">${state.adminChats.map(chat=>{const last=chat.messages.at(-1);return `<article class="panel admin-row"><div class="admin-main"><strong>${escapeHtml(chat.nama)}</strong><small>${escapeHtml(chat.email)}</small><small>${escapeHtml(last?.isi_pesan||'Belum ada pesan')}</small></div><div class="admin-actions"><button class="button button-secondary button-small" data-action="admin-chat" data-id="${chat.id_chat}">Buka chat</button><button class="button button-danger button-small" data-action="admin-delete-chat" data-id="${chat.id_chat}">Hapus</button></div></article>`}).join('')}</div>`:'<p class="subtle">Belum ada percakapan.</p>'}</section>
    <section class="section"><div class="section-heading"><div><span class="eyebrow">Tabel Pengguna</span><h2>Akun pengguna</h2></div></div><div class="admin-list">${state.adminUsers.map(user=>`<article class="panel admin-row"><div class="profile-large-avatar">${escapeHtml(user.nama.split(/\s+/).map(part=>part[0]).slice(0,2).join('').toUpperCase())}</div><div><strong>${escapeHtml(user.nama)}</strong><small>${escapeHtml(user.email)} · ${escapeHtml(user.role)}</small></div><div class="admin-actions"><span class="muted small">${escapeHtml(user.no_telepon||'')}</span>${user.role==='customer'?`<button class="button button-danger button-small" data-action="admin-delete-user" data-id="${user.id_pengguna}">Hapus akun</button>`:`<span class="muted small">Admin dilindungi</span>`}</div></article>`).join('')}</div></section>
  </section>`;
}

function renderAdminAnimalModal(item=null) {
  const editing=Boolean(item);
  openModal(editing?'Ubah data hewan':'Tambah hewan','Perbarui detail dan foto utama hewan.',`<form data-form="admin-animal" data-id="${item?.id||''}"><div class="admin-form-grid">
    <label class="field-group">Kategori<select class="field" name="id_kategori" required>${categories.map(category=>`<option value="${category.id_kategori}" ${Number(category.id_kategori)===Number(item?.id_kategori)?'selected':''}>${escapeHtml(category.nama_kategori)}</option>`).join('')}</select></label>
    <label class="field-group">Nama<input class="field" name="nama" value="${escapeHtml(item?.name||'')}" required /></label>
    <label class="field-group">Jenis<input class="field" name="jenis" value="${escapeHtml(item?.kind||'')}" /></label><label class="field-group">Ras<input class="field" name="ras" value="${escapeHtml(item?.breed||'')}" /></label>
    <label class="field-group">Jenis kelamin<select class="field" name="jenis_kelamin"><option value="">Belum dicantumkan</option><option ${item?.gender==='Jantan'?'selected':''}>Jantan</option><option ${item?.gender==='Betina'?'selected':''}>Betina</option></select></label>
    <label class="field-group">Umur (bulan)<input class="field" name="umur" type="number" min="0" value="${item?.ageMonths??''}" /></label><label class="field-group">Berat (kg)<input class="field" name="berat" type="number" min="0" step="0.01" value="${item?.weight??''}" /></label><label class="field-group">Kondisi kesehatan<input class="field" name="kondisi_kesehatan" value="${escapeHtml(item?.health||'')}" /></label>
    <label class="field-group">Harga (Rp)<input class="field" name="harga" type="number" min="0" step="1" value="${item?.price??''}" required /></label><label class="field-group">Stok<input class="field" name="stok" type="number" min="0" step="1" value="${item?.stockCount??0}" required /></label>
    <label class="field-group">Status<select class="field" name="status">${['Tersedia','Habis','Terjual'].map(status=>`<option ${item?.status===status?'selected':''}>${status}</option>`).join('')}</select></label><label class="field-group">URL foto utama<input class="field" name="gambar_url" type="url" value="${escapeHtml(item?.images?.find(image=>image.utama)?.url||'')}" /></label>
    <label class="field-group admin-description">Deskripsi<textarea class="field" name="deskripsi">${escapeHtml(item?.description||'')}</textarea></label></div><div class="modal-footer"><button type="button" class="button button-secondary" data-action="close-modal">Batal</button><div class="right"><button class="button" type="submit">Simpan</button></div></div></form>`,'',true);
}

function renderAdminCategoryModal(category=null) {
  const editing=Boolean(category);
  openModal(editing?'Ubah kategori':'Tambah kategori','Kategori dipakai untuk mengelompokkan hewan di katalog.',`<form data-form="admin-category" data-id="${category?.id_kategori||''}">
    <label class="field-group"><span class="form-label">Nama kategori</span><input class="field" name="nama_kategori" value="${escapeHtml(category?.nama_kategori||'')}" maxlength="100" required /></label>
    <label class="field-group"><span class="form-label">Deskripsi <small>(opsional)</small></span><textarea class="field" name="deskripsi" maxlength="500">${escapeHtml(category?.deskripsi||'')}</textarea></label>
    <div class="modal-footer"><button type="button" class="button button-secondary" data-action="close-modal">Batal</button><div class="right"><button class="button" type="submit">Simpan kategori</button></div></div>
  </form>`);
}

function renderCompareBar() {
  const old = document.getElementById('compare-bar');
  old?.remove();
  if (!state.compare.length || !['home','catalog','saved'].includes(state.page)) return;
  const selected = state.compare.map(animalById).filter(Boolean);
  const bar = document.createElement('div');
  bar.id = 'compare-bar';
  bar.className = 'compare-bar';
  bar.innerHTML = `<div class="selected-mini"><span class="compare-mini-icons">${selected.map(item=>`<span>${animalEmoji(item)}</span>`).join('')}</span><strong>${selected.length} dari 3 dipilih</strong></div><div class="compare-bar-actions"><button class="button button-secondary" data-action="clear-compare">Reset</button><button class="button button-soft" data-page="compare">Bandingkan ${icon('arrowRight',13)}</button></div>`;
  document.body.appendChild(bar);
}

function renderFiltersModal() {
  const f = state.filters;
  const kinds=[...new Set(animals.map(item=>item.kind).filter(Boolean))];
  const healthOptions=[...new Set(animals.map(item=>item.health).filter(Boolean))];
  openModal('Filter hewan', 'Atur preferensi berdasarkan data hewan.', `<div class="filter-section"><h3>Jenis hewan</h3><div class="chip-options">${kinds.map(x=>filterChip(x,f.kinds.includes(x),'kind')).join('')}</div></div>
    <div class="filter-section"><h3>Rentang harga</h3><div class="form-row"><div><label class="form-label" for="price-min">Minimum</label><input class="field" id="price-min" type="number" min="0" placeholder="Rp 0" value="${f.min}" data-filter-input="min" /></div><div><label class="form-label" for="price-max">Maksimum</label><input class="field" id="price-max" type="number" min="0" placeholder="Bebas" value="${f.max}" data-filter-input="max" /></div></div></div>
    <div class="filter-section"><h3>Umur</h3><div class="chip-options">${[['under1','< 1 tahun'],['1to2','1–2 tahun'],['over2','> 2 tahun']].map(([v,l])=>filterChip(l,f.age===v,'age',v)).join('')}</div></div>
    <div class="filter-section"><h3>Kesehatan</h3><div class="chip-options">${healthOptions.map(x=>filterChip(x,f.health.includes(x),'health')).join('')}</div></div>`, `<button class="button-ghost" data-action="reset-filters">Reset semua</button><div class="right"><button class="button button-secondary" data-action="close-modal">Batal</button><button class="button" data-action="apply-filters">Tampilkan ${getFilteredAnimals().length} hewan</button></div>`, true);
}

function filterChip(label, selected, type, value = label) {
  return `<button class="option-chip ${selected?'selected':''}" data-action="filter-option" data-type="${escapeHtml(type)}" data-value="${escapeHtml(value)}">${escapeHtml(label)}${selected?' ✓':''}</button>`;
}

function openModal(title, subtitle, body, footer = '', wide = false) {
  const root = document.getElementById('modal-root');
  root.innerHTML = `<div class="modal-backdrop" data-action="backdrop"><section class="modal ${wide?'wide':''}" role="dialog" aria-modal="true" aria-label="${escapeHtml(title)}"><div class="modal-head"><span><h2>${title}</h2>${subtitle?`<p>${subtitle}</p>`:''}</span><button class="modal-close" data-action="close-modal" aria-label="Tutup">${icon('close')}</button></div><div class="modal-body">${body}</div>${footer?`<div class="modal-footer">${footer}</div>`:''}</section></div>`;
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const root=document.getElementById('modal-root');
  if (root.querySelector('.auth-backdrop')) state.pendingAuthAction=null;
  root.innerHTML = '';
  document.body.style.overflow = '';
}

function renderAuthFields(register,email='') {
  return `${register?`<label class="auth-field"><span>Nama lengkap</span><input class="field" name="nama" autocomplete="name" placeholder="contoh: Fardhan Al Biansya" required /></label>`:''}
    <label class="auth-field"><span>Email</span><input class="field" name="email" type="email" value="${escapeHtml(email)}" autocomplete="email" placeholder="contoh: budi@email.com" required /></label>
    ${register?`<label class="auth-field"><span>Nomor HP <small>(opsional)</small></span><input class="field" name="no_telepon" type="tel" autocomplete="tel" placeholder="08xxxxxxxxxx" /></label>`:''}
    <label class="auth-field"><span>Kata sandi</span><span class="auth-password"><input class="field" name="password" id="auth-password" type="password" minlength="8" autocomplete="${register?'new-password':'current-password'}" placeholder="Masukkan kata sandi" required /> <button type="button" data-action="toggle-auth-password">Tampilkan</button></span></label>
    ${register?`<label class="auth-field"><span>Alamat <small>(opsional)</small></span><input class="field" name="alamat" autocomplete="street-address" placeholder="Kota atau alamat" /></label>`:`<div class="auth-forgot"><button type="button" class="auth-link" data-action="forgot-password">Lupa kata sandi?</button></div>`}
    <p class="auth-error" role="alert" aria-live="polite"></p>
    <button class="button button-block auth-submit" type="submit">${register?'Daftar':'Masuk'}</button>`;
}

function switchAuthMode(mode) {
  const root=document.getElementById('modal-root');
  const form=root.querySelector('[data-form="auth"]');
  if (!form) return openAuthModal(mode);
  if (state.authMode===mode) return;
  const register=mode==='register';
  const email=form.querySelector('[name="email"]')?.value||'';
  state.authMode=mode;
  const tabs=root.querySelector('.auth-tabs');
  tabs.dataset.mode=mode;
  tabs.querySelectorAll('[role="tab"]').forEach((tab,index)=>{
    const active=index===(register?1:0);
    tab.classList.toggle('active',active);
    tab.setAttribute('aria-selected',String(active));
  });
  root.querySelector('.auth-intro p').textContent=register?'Daftar untuk mulai memesan ternak dan chat dengan MyKandang.':'Masuk untuk memesan ternak dan chat dengan MyKandang.';
  root.querySelector('.auth-card').setAttribute('aria-label',`${register?'Daftar':'Masuk'} MyKandang`);
  root.querySelector('.auth-bottom').innerHTML=`${register?'Sudah punya akun?':'Belum punya akun?'} <button type="button" class="auth-link" data-action="auth-mode" data-value="${register?'login':'register'}">${register?'Masuk':'Daftar'}</button>`;
  form.dataset.mode=mode;
  form.innerHTML=renderAuthFields(register,email);
  root.querySelector('[name="email"]')?.focus();
}

function openAuthModal(mode = 'login') {
  const root=document.getElementById('modal-root');
  const previousEmail=root.querySelector('[name="email"]')?.value||'';
  state.authMode = mode;
  const register = mode === 'register';
  root.innerHTML=`<div class="auth-backdrop" data-action="backdrop"><section class="auth-card" role="dialog" aria-modal="true" aria-label="${register?'Daftar':'Masuk'} MyKandang">
    <button class="auth-close" data-action="close-modal" aria-label="Tutup">${icon('close',18)}</button>
    <div class="auth-intro"><div><div class="auth-brand">My<span>Kandang</span></div><h1>Selamat datang!</h1><p>${register?'Daftar untuk mulai memesan ternak dan chat dengan MyKandang.':'Masuk untuk memesan ternak dan chat dengan MyKandang.'}</p></div></div>
    <div class="auth-tabs" data-mode="${register?'register':'login'}" role="tablist" aria-label="Pilih masuk atau daftar"><span class="auth-tab-indicator" aria-hidden="true"></span><button type="button" role="tab" aria-selected="${!register}" class="${!register?'active':''}" data-action="auth-mode" data-value="login">Masuk</button><button type="button" role="tab" aria-selected="${register}" class="${register?'active':''}" data-action="auth-mode" data-value="register">Daftar</button></div>
    <form class="auth-form" data-form="auth" data-mode="${register?'register':'login'}">${renderAuthFields(register,previousEmail)}</form>
    <div class="auth-divider"><span></span><small>atau</small><span></span></div>
    <button type="button" class="auth-google" data-action="google-auth"><span class="google-mark">G</span>Lanjut dengan Google</button>
    <p class="auth-bottom">${register?'Sudah punya akun?':'Belum punya akun?'} <button type="button" class="auth-link" data-action="auth-mode" data-value="${register?'login':'register'}">${register?'Masuk':'Daftar'}</button></p>
  </section></div>`;
  document.body.style.overflow='hidden';
  requestAnimationFrame(()=>root.querySelector('[name="email"]')?.focus());
}

async function refreshPrivateData() {
  if (!state.token) return;
  const [profile, wishlist, cart, orders] = await Promise.all([
    api('/profil'), api('/wishlist'), api('/keranjang'), api('/pesanan'),
  ]);
  state.user = profile;
  state.profile = profile;
  state.saved = new Set(wishlist.map(item=>Number(item.id)));
  state.cart = cart;
  state.orders = orders;
}

async function loadApp() {
  try {
    [categories, animals] = await Promise.all([api('/kategori'), api('/hewan')]);
    animals = orderCatalog(animals);
    if (state.token) {
      try { await refreshPrivateData(); }
      catch { state.token=''; state.user=null; state.profile=null; sessionStorage.removeItem('mykandang-token'); }
    }
    render();
    if (!state.token && !document.querySelector('#modal-root .auth-backdrop')) openAuthModal();
  } catch (error) {
    render();
    if (!state.token && !document.querySelector('#modal-root .auth-backdrop')) openAuthModal();
    showToast(`${error.message} Jalankan backend PostgreSQL terlebih dahulu.`);
  }
}

function showToast(message) {
  const region = document.getElementById('toast-region');
  const item = document.createElement('div');
  item.className = 'toast';
  item.textContent = message;
  region.appendChild(item);
  window.setTimeout(() => item.remove(), 2800);
}

function authRequired(message) { return `<div class="empty-state"><div class="empty-illustration">🔐</div><h3>${message}</h3><p>Masuk atau daftar untuk menyimpan pesanan, keranjang, dan hewan pilihanmu.</p><button class="button" data-action="auth">Masuk atau daftar</button></div>`; }

async function toggleSaved(id) {
  if (!state.user) { state.pendingAuthAction={type:'save',id:Number(id)};openAuthModal();return; }
  try {
    if (state.saved.has(Number(id))) { await api(`/wishlist/${id}`,{method:'DELETE'}); state.saved.delete(Number(id)); showToast('Dihapus dari wishlist.'); }
    else { await api(`/wishlist/${id}`,{method:'PUT'}); state.saved.add(Number(id)); showToast('Disimpan ke wishlist.'); }
    render();
  } catch(error) { showToast(error.message); }
}

async function addToCart(id, jumlah=1) {
  if (!state.user) { state.pendingAuthAction={type:'cart',id:Number(id),jumlah:Number(jumlah)};openAuthModal();return; }
  try { await api('/keranjang',{method:'POST',body:JSON.stringify({id_hewan:Number(id),jumlah:Number(jumlah)})}); state.cart=await api('/keranjang'); renderShell(); showToast('Hewan ditambahkan ke keranjang.'); }
  catch(error) { showToast(error.message); }
}

async function removeFromCart(id) {
  try { await api(`/keranjang/${id}`,{method:'DELETE'}); state.cart=await api('/keranjang'); render(); }
  catch(error) { showToast(error.message); }
}

async function updateCartQuantity(id,jumlah) {
  try { await api(`/keranjang/${id}`,{method:'PATCH',body:JSON.stringify({jumlah:Number(jumlah)})}); state.cart=await api('/keranjang'); render(); }
  catch(error) { showToast(error.message); await refreshPrivateData(); render(); }
}

function toggleCompare(id, checked) {
  id=Number(id);
  if (checked && !state.compare.some(selected=>Number(selected)===id)) {
    if (state.compare.length >= 3) { showToast('Kamu bisa membandingkan maksimal 3 hewan.'); render(); return; }
    state.compare.push(id);
  } else if (!checked) state.compare = state.compare.filter(item=>item!==id);
  render();
}

function submitSearch(form) {
  state.query = form.querySelector('[name="query"]')?.value?.trim() || '';
  state.category = 'Semua';
  setPage('catalog');
}

function applyFilterOption(button) {
  const { type, value } = button.dataset;
  const toggle = (list, item) => list.includes(item) ? list.filter(x=>x!==item) : [...list,item];
  if (type === 'kind') state.filters.kinds = toggle(state.filters.kinds,value);
  if (type === 'health') state.filters.health = toggle(state.filters.health,value);
  if (type === 'age') state.filters.age = state.filters.age===value?'':value;
  renderFiltersModal();
}

function resetFilters() {
  state.filters = { kinds: [], health: [], min: '', max: '', age: '' };
  state.category = 'Semua';
  state.query = '';
  if (state.page === 'catalog') render();
  else renderFiltersModal();
}

function clearFilterChip(label) {
  const f = state.filters;
  f.kinds = f.kinds.filter(x=>x!==label);
  f.health = f.health.filter(x=>x!==label);
  if (label.includes(' – ')) { f.min='';f.max=''; }
  if (label==='Ruminansia'||label==='Unggas') state.category='Semua';
  render();
}

function renderChatModal(chat=null,isAdmin=false) {
  const messages=chat?.messages||[];
  openModal(isAdmin?`Chat · ${escapeHtml(chat?.nama||'Pengguna')}`:'Chat MyKandang',isAdmin?`Percakapan #${chat?.id_chat}.`:'Riwayat pesan tersimpan pada akunmu.',`<div class="chat-window"><div class="chat-day">Riwayat pesan</div>${messages.map(msg=>`<div class="chat-bubble ${Number(msg.id_pengirim)===Number(state.user?.id_pengguna)?'mine':''}">${escapeHtml(msg.isi_pesan)}<small>${new Date(msg.waktu_kirim).toLocaleString('id-ID')}</small></div>`).join('')}${messages.length?'':'<p class="small muted">Belum ada pesan.</p>'}</div><form class="chat-form" data-form="chat" data-chat-id="${chat?.id_chat||''}" data-admin="${isAdmin?'true':'false'}"><input class="field" name="message" placeholder="Tulis pesan…" autocomplete="off" required /><button class="button" type="submit" aria-label="Kirim pesan">${icon('arrowRight',17)}</button></form>`);
}

function renderProfileEditModal() {
  const p=state.profile;
  openModal('Ubah profil','Perbarui nama dan informasi kontak akunmu.',`<form data-form="profile"><div class="field-group" style="margin:0"><label class="form-label">Nama</label><input class="field" name="nama" value="${escapeHtml(p.nama)}" required /></div><div class="field-group"><label class="form-label">Email</label><input class="field" value="${escapeHtml(p.email)}" disabled /></div><div class="field-group"><label class="form-label">Nomor telepon</label><input class="field" name="no_telepon" value="${escapeHtml(p.no_telepon||'')}" /></div><div class="field-group"><label class="form-label">Alamat</label><textarea class="field" name="alamat">${escapeHtml(p.alamat||'')}</textarea></div><div class="modal-footer" style="padding:17px 0 0;margin-top:17px"><span></span><div class="right"><button type="button" class="button button-secondary" data-action="close-modal">Batal</button><button class="button" type="submit">Simpan</button></div></div></form>`);
}

function startCheckout(id) {
  if (!state.user) { state.pendingAuthAction={type:'checkout',id:Number(id)};openAuthModal();return; }
  state.checkoutItems=[{id_hewan:Number(id),kuantitas:1}];
  state.checkout={method:'Kirim Kurir',address:state.profile?.alamat||'',paymentMethod:'Transfer Bank',proof:''};
  setPage('checkout');
}

function checkoutCart() {
  if (!state.user) { state.pendingAuthAction={type:'checkout-cart'};openAuthModal();return; }
  state.checkoutItems=state.cart.map(item=>({id_hewan:Number(item.id),kuantitas:Number(item.jumlah)}));
  state.checkout={method:'Kirim Kurir',address:state.profile?.alamat||'',paymentMethod:'Transfer Bank',proof:''};
  setPage('checkout');
}

async function placeOrder() {
  try {
    const method=state.checkout.method || 'Kirim Kurir';
    const address=method==='Kirim Kurir' ? (document.getElementById('order-address')?.value.trim() || '') : null;
    const items=state.checkoutItems;
    const paymentMethod=document.getElementById('payment-method')?.value;
    const paymentProof=document.getElementById('payment-proof')?.value.trim()||null;
    if (paymentProof && !isGoogleDriveLink(paymentProof)) { showToast('Tempel tautan berbagi Google Drive yang valid.');document.getElementById('payment-proof')?.focus();return; }
    const order=await api('/pesanan',{method:'POST',body:JSON.stringify({metode_serah_terima:method,alamat_pengiriman:address,items})});
    if (paymentMethod) await api(`/pesanan/${order.id_pesanan}/pembayaran`,{method:'POST',body:JSON.stringify({metode:paymentMethod,bukti:paymentProof})});
    await refreshPrivateData();
    state.currentOrder=await api(`/pesanan/${order.id_pesanan}`);
    state.currentOrderId=order.id_pesanan;
    setPage('order-detail');
    showToast('Pesanan berhasil disimpan.');
  } catch(error) { showToast(error.message); }
}

async function cancelOrder(id) {
  try {
    await api(`/pesanan/${id}/batal`,{method:'PATCH',body:JSON.stringify({})});
    await refreshPrivateData();
    state.currentOrder=await api(`/pesanan/${id}`);
    render();
    showToast('Pesanan dibatalkan.');
  } catch(error) { showToast(error.message); }
}

async function savePayment(id) {
  try {
    const metode=document.getElementById('payment-method')?.value;
    const bukti=document.getElementById('payment-proof')?.value.trim()||null;
    if (bukti && !isGoogleDriveLink(bukti)) { showToast('Tempel tautan berbagi Google Drive yang valid.');document.getElementById('payment-proof')?.focus();return; }
    await api(`/pesanan/${id}/pembayaran`,{method:'POST',body:JSON.stringify({metode,bukti})});
    state.currentOrder=await api(`/pesanan/${id}`);
    state.orders=await api('/pesanan'); render(); showToast('Metode pembayaran tersimpan.');
  } catch(error) { showToast(error.message); }
}

async function sendChat(text, chatId=null) {
  if (!state.user) { openAuthModal(); return; }
  try {
    if (state.user.role==='staff_admin' && chatId) { await api(`/admin/chat/${chatId}/pesan`,{method:'POST',body:JSON.stringify({isi_pesan:text})}); const chat=await api(`/admin/chat/${chatId}`); renderChatModal(chat,true); }
    else { await api('/chat/pesan',{method:'POST',body:JSON.stringify({isi_pesan:text})}); const chat=await api('/chat'); renderChatModal(chat); }
  }
  catch(error) { showToast(error.message); }
}

async function continuePendingAuthAction(pending) {
  if (!pending) return;
  if (pending.type==='save') return toggleSaved(pending.id);
  if (pending.type==='cart') return addToCart(pending.id,pending.jumlah);
  if (pending.type==='checkout') return startCheckout(pending.id);
  if (pending.type==='checkout-cart') return checkoutCart();
  if (pending.type==='chat') {
    try { renderChatModal(await api('/chat')); }
    catch(error) { showToast(error.message); }
  }
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}

document.addEventListener('click', async event => {
  const pageTarget=event.target.closest('[data-page]');
  if (pageTarget) {
    event.preventDefault();
    const page=pageTarget.dataset.page, id=pageTarget.dataset.id;
    if (page==='detail') state.fromPage=state.page==='saved'?'saved':state.page==='home'?'home':'catalog';
    if (page==='order-detail' && id) {
      try { state.currentOrderId=Number(id); state.currentOrder=await api(`/pesanan/${id}`); }
      catch(error) { showToast(error.message); return; }
    }
    if (page==='review' && id) {
      try { state.currentOrderId=Number(id); state.currentOrder=await api(`/pesanan/${id}`); }
      catch(error) { showToast(error.message); return; }
    }
    if (page==='admin') {
      try { await loadAdmin(); }
      catch(error) { showToast(error.message); return; }
    }
    setPage(page,id&&page==='detail'?{animalId:Number(id)}:{});
    return;
  }
  const target=event.target.closest('[data-action]');
  if (!target) return;
  const {action,id,value}=target.dataset;
  if (action==='backdrop' && event.target===target) { closeModal(); return; }
  if (action==='close-modal') { closeModal(); return; }
  if (action==='auth') { openAuthModal(); return; }
  if (action==='auth-mode') { switchAuthMode(value); return; }
  if (action==='toggle-auth-password') {
    const input=document.getElementById('auth-password');
    if (input) { const visible=input.type==='password';input.type=visible?'text':'password';target.textContent=visible?'Sembunyikan':'Tampilkan'; }
    return;
  }
  if (action==='forgot-password') { showToast('Fitur lupa kata sandi belum dikonfigurasi.'); return; }
  if (action==='google-auth') { showToast('Login Google belum dikonfigurasi.'); return; }
  if (action==='detail') { state.fromPage=state.page; try { state.animalReviews=await api(`/hewan/${id}/ulasan`); } catch { state.animalReviews=[]; } setPage('detail',{animalId:Number(id)}); return; }
  if (action==='save') { event.stopPropagation(); await toggleSaved(id); return; }
  if (action==='compare-toggle') return;
  if (action==='filters') { renderFiltersModal(); return; }
  if (action==='admin-new-animal') { renderAdminAnimalModal(); return; }
  if (action==='admin-edit-animal') { renderAdminAnimalModal(adminAnimals.find(item=>String(item.id)===String(id))); return; }
  if (action==='admin-delete-animal') {
    const item=adminAnimals.find(animal=>String(animal.id)===String(id));
    openModal('Hapus data hewan?',`Data ${item?.name||'hewan ini'} akan dihapus jika belum memiliki riwayat pesanan atau ulasan.`,
      `<p class="confirm-copy">Hewan yang sudah muncul di transaksi atau ulasan akan dipertahankan agar riwayat tetap utuh.</p><div class="modal-footer" style="padding:17px 0 0;margin-top:17px"><button class="button button-secondary" data-action="close-modal">Batal</button><div class="right"><button class="button button-danger" data-action="confirm-delete-animal" data-id="${id}">Hapus hewan</button></div></div>`);
    return;
  }
  if (action==='admin-new-category') { renderAdminCategoryModal(); return; }
  if (action==='admin-edit-category') { renderAdminCategoryModal(categories.find(category=>String(category.id_kategori)===String(id))); return; }
  if (action==='admin-delete-category') {
    const category=categories.find(item=>String(item.id_kategori)===String(id));
    openModal('Hapus kategori?',`Kategori ${category?.nama_kategori||'ini'} hanya bisa dihapus jika belum dipakai hewan.`,
      `<p class="confirm-copy">Jika masih digunakan, data kategori akan tetap dipertahankan.</p><div class="modal-footer" style="padding:17px 0 0;margin-top:17px"><button class="button button-secondary" data-action="close-modal">Batal</button><div class="right"><button class="button button-danger" data-action="confirm-delete-category" data-id="${id}">Hapus kategori</button></div></div>`);
    return;
  }
  if (action==='confirm-delete-animal') {
    try { await api(`/admin/hewan/${id}`,{method:'DELETE'});await loadAdmin();closeModal();render();showToast('Data hewan dihapus.'); }
    catch(error) { closeModal();showToast(error.message); }
    return;
  }
  if (action==='confirm-delete-category') {
    try { await api(`/admin/kategori/${id}`,{method:'DELETE'});await loadAdmin();closeModal();render();showToast('Kategori dihapus.'); }
    catch(error) { closeModal();showToast(error.message); }
    return;
  }
  if (action==='admin-save-order') {
    const status_pesanan=document.querySelector(`[data-admin-order-status="${id}"]`)?.value;
    const status_pembayaran=document.querySelector(`[data-admin-payment-status="${id}"]`)?.value;
    try { await api(`/admin/pesanan/${id}`,{method:'PATCH',body:JSON.stringify({status_pesanan,status_pembayaran})});await loadAdmin();render();showToast('Status transaksi diperbarui.'); }
    catch(error) { showToast(error.message); }
    return;
  }
  if (action==='admin-chat') {
    try { const chat=await api(`/admin/chat/${id}`);renderChatModal(chat,true); }
    catch(error) { showToast(error.message); }
    return;
  }
  if (action==='admin-delete-chat') {
    const chat=state.adminChats.find(item=>String(item.id_chat)===String(id));
    openModal('Hapus percakapan?',`Percakapan dengan ${chat?.nama||'pelanggan ini'} akan dihapus permanen.`,
      `<p class="confirm-copy">Semua pesan di percakapan ini ikut terhapus. Akun pelanggan tetap tersimpan.</p><div class="modal-footer" style="padding:17px 0 0;margin-top:17px"><button class="button button-secondary" data-action="close-modal">Batal</button><div class="right"><button class="button button-danger" data-action="confirm-delete-chat" data-id="${id}">Hapus percakapan</button></div></div>`);
    return;
  }
  if (action==='confirm-delete-chat') {
    try { await api(`/admin/chat/${id}`,{method:'DELETE'});await loadAdmin();closeModal();render();showToast('Percakapan dihapus.'); }
    catch(error) { closeModal();showToast(error.message); }
    return;
  }
  if (action==='admin-delete-user') {
    const user=state.adminUsers.find(item=>String(item.id_pengguna)===String(id));
    openModal('Hapus akun pelanggan?',`Akun ${user?.nama||'pelanggan ini'} beserta data terkaitnya akan dihapus permanen.`,
      `<p class="confirm-copy">Riwayat pesanan, pembayaran, ulasan, percakapan, keranjang, dan wishlist akun ini ikut terhapus. Akun admin tidak dapat dihapus.</p><div class="modal-footer" style="padding:17px 0 0;margin-top:17px"><button class="button button-secondary" data-action="close-modal">Batal</button><div class="right"><button class="button button-danger" data-action="confirm-delete-user" data-id="${id}">Hapus akun</button></div></div>`);
    return;
  }
  if (action==='confirm-delete-user') {
    try { await api(`/admin/pengguna/${id}`,{method:'DELETE'});await loadAdmin();closeModal();render();showToast('Akun dan data terkait dihapus.'); }
    catch(error) { closeModal();showToast(error.message); }
    return;
  }
  if (action==='filter-option') { applyFilterOption(target); return; }
  if (action==='apply-filters') { closeModal(); render(); return; }
  if (action==='reset-filters') { resetFilters(); return; }
  if (action==='clear-chip') { clearFilterChip(target.dataset.label); return; }
  if (action==='saved-tab') { state.savedTab=value; render(); return; }
  if (action==='clear-compare') { state.compare=[]; render(); return; }
  if (action==='remove-compare') { state.compare=state.compare.filter(x=>Number(x)!==Number(id)); render(); return; }
  if (action==='checkout') { startCheckout(id); return; }
  if (action==='checkout-cart') { checkoutCart(); return; }
  if (action==='add-cart') { await addToCart(id); return; }
  if (action==='remove-cart') { await removeFromCart(id); return; }
  if (action==='chat') {
    if (!state.user) { state.pendingAuthAction={type:'chat'};openAuthModal();return; }
    if (state.user.role==='staff_admin') {
      try { await loadAdmin();setPage('admin',{}, {scrollTarget:'admin-conversations'}); }
      catch(error) { showToast(error.message); }
      return;
    }
    try { renderChatModal(await api('/chat')); } catch(error) { showToast(error.message); }
    return;
  }
  if (action==='place-order') { await placeOrder(); return; }
  if (action==='cancel-order') { openModal('Batalkan pesanan?','Status Pending akan diubah menjadi Dibatalkan. Stok akan dikembalikan.',`<p class="confirm-copy">Pembatalan akan tercatat pada riwayat pesanan.</p><div class="modal-footer" style="padding:17px 0 0;margin-top:17px"><button class="button button-secondary" data-action="close-modal">Kembali</button><div class="right"><button class="button button-danger" data-action="confirm-cancel" data-id="${id}">Batalkan</button></div></div>`); return; }
  if (action==='confirm-cancel') { closeModal(); await cancelOrder(id); return; }
  if (action==='payment') { await savePayment(id); return; }
  if (action==='submit-review') {
    try {
      const id_hewan=Number(target.dataset.animal);
      const komentar=document.getElementById('review-copy')?.value.trim()||null;
      await api('/ulasan',{method:'POST',body:JSON.stringify({id_hewan,id_pesanan:Number(id),rating:state.reviewRating,komentar})});
      state.currentOrder=await api(`/pesanan/${id}`);state.orders=await api('/pesanan');setPage('order-detail');showToast('Ulasan tersimpan.');
    } catch(error) { showToast(error.message); }
    return;
  }
  if (action==='write-review') {
    try { state.currentOrderId=Number(id); state.currentReviewAnimalId=Number(target.dataset.animal); state.currentOrder=await api(`/pesanan/${id}`); setPage('review'); }
    catch(error) { showToast(error.message); }
    return;
  }
  if (action==='rating') { state.reviewRating=Number(value);document.querySelectorAll('.star-button').forEach((button,index)=>button.classList.toggle('active',index<state.reviewRating));return; }
  if (action==='profile-tab') { state.profileTab=value; render(); return; }
  if (action==='edit-profile') { renderProfileEditModal(); return; }
  if (action==='logout') {
    try { await api('/auth/logout',{method:'POST'}); } catch {}
    state.token='';state.user=null;state.profile=null;state.saved.clear();state.cart=[];state.orders=[];state.currentOrder=null;sessionStorage.removeItem('mykandang-token');render();showToast('Kamu sudah keluar.');return;
  }
  if (action==='open-search') { setPage('catalog'); document.querySelector('.catalog-search input')?.focus(); return; }
});

document.addEventListener('change', event => {
  const target=event.target;
  if (target.matches('[data-action="compare-toggle"]')) { toggleCompare(target.dataset.id,target.checked); return; }
  if (target.matches('[data-change="sort"]')) { state.sort=target.value; render(); return; }
  if (target.matches('[data-change="method"]')) {
    state.checkout.address=document.getElementById('order-address')?.value||state.checkout.address;
    state.checkout.paymentMethod=document.getElementById('payment-method')?.value||state.checkout.paymentMethod;
    state.checkout.proof=document.getElementById('payment-proof')?.value||'';
    state.checkout.method=target.value;render();return;
  }
  if (target.matches('[data-filter-input]')) { state.filters[target.dataset.filterInput]=target.value; const button=document.querySelector('[data-action="apply-filters"]'); if(button) button.textContent=`Tampilkan ${getFilteredAnimals().length} hewan`; return; }
  if (target.matches('[data-cart-quantity]')) { updateCartQuantity(target.dataset.cartQuantity,target.value); return; }
});

document.addEventListener('submit', async event => {
  const form=event.target;
  if (form.matches('[data-form="search"]')) { event.preventDefault(); submitSearch(form); return; }
  if (form.matches('[data-form="auth"]')) {
    event.preventDefault();
    const data=Object.fromEntries(new FormData(form).entries());
    const register=form.dataset.mode==='register';
    try {
      const result=await api(register?'/auth/register':'/auth/login',{method:'POST',body:JSON.stringify(data)});
      state.token=result.token;sessionStorage.setItem('mykandang-token',result.token);
      try { await refreshPrivateData(); }
      catch(error) {
        state.token='';sessionStorage.removeItem('mykandang-token');state.user=null;state.profile=null;
        if(register) {
          const errorNode=form.querySelector('.auth-error');
          if(errorNode) errorNode.textContent='Akun berhasil dibuat, tetapi data akun gagal dimuat. Coba masuk menggunakan email dan kata sandi ini.';
          return;
        }
        throw error;
      }
      const pending=state.pendingAuthAction;
      state.pendingAuthAction=null;
      closeModal();render();
      if (pending) await continuePendingAuthAction(pending);
      else showToast(register?'Akun berhasil dibuat.':'Berhasil masuk.');
    } catch(error) {
      const message=register&&/data dengan email atau relasi tersebut sudah ada|relasi data sudah tercatat|email sudah terdaftar/i.test(error.message)
        ? 'Email sudah terdaftar. Gunakan email lain untuk membuat akun.'
        : error.message;
      const errorNode=form.querySelector('.auth-error');if(errorNode)errorNode.textContent=message;else showToast(message);
    }
    return;
  }
  if (form.matches('[data-form="chat"]')) { event.preventDefault(); const text=form.message.value.trim(); if(text) await sendChat(text,form.dataset.admin==='true'?form.dataset.chatId:null); return; }
  if (form.matches('[data-form="profile"]')) {
    event.preventDefault();const data=Object.fromEntries(new FormData(form).entries());
    try { state.profile=await api('/profil',{method:'PATCH',body:JSON.stringify(data)});state.user=state.profile;closeModal();render();showToast('Profil tersimpan.'); }
    catch(error) { showToast(error.message); }
    return;
  }
  if (form.matches('[data-form="admin-animal"]')) {
    event.preventDefault();
    const data=Object.fromEntries(new FormData(form).entries());
    const id=form.dataset.id;
    try {
      await api(id?`/admin/hewan/${id}`:'/admin/hewan',{method:id?'PATCH':'POST',body:JSON.stringify(data)});
      await loadAdmin();closeModal();render();showToast(id?'Data hewan diperbarui.':'Hewan ditambahkan.');
    } catch(error) { showToast(error.message); }
    return;
  }
  if (form.matches('[data-form="admin-category"]')) {
    event.preventDefault();
    const data=Object.fromEntries(new FormData(form).entries());
    const id=form.dataset.id;
    try {
      await api(id?`/admin/kategori/${id}`:'/admin/kategori',{method:id?'PATCH':'POST',body:JSON.stringify(data)});
      await loadAdmin();closeModal();render();showToast(id?'Kategori diperbarui.':'Kategori ditambahkan.');
    } catch(error) { showToast(error.message); }
    return;
  }
  if (form.matches('[data-action="submit-review"]')) return;
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeModal();
  if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('.animal-image[role="button"]')) { event.preventDefault(); event.target.click(); }
});

document.addEventListener('click', event => {
  const category=event.target.closest('[data-category]');
  if (category) { state.category=category.dataset.category; state.filters.kinds=[]; setPage('catalog'); }
});


render();
if (!state.token) openAuthModal();
loadApp();
