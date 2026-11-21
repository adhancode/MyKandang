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
const paymentMethodGroups = [
  { title: 'Transfer Bank', methods: [
    { label: 'BCA (Bank Central Asia)', logo: 'bca' },
    { label: 'BRI (Bank Rakyat Indonesia)', logo: 'bri' },
    { label: 'BNI (Bank Negara Indonesia)', logo: 'bni' },
    { label: 'Bank Mandiri', logo: 'mandiri' },
    { label: 'BSI (Bank Syariah Indonesia)', logo: 'bsi' },
  ] },
  { title: 'E-Wallet', methods: [
    { label: 'GoPay', logo: 'gopay' },
    { label: 'DANA', logo: 'dana' },
    { label: 'OVO', logo: 'ovo' },
    { label: 'ShopeePay', logo: 'shopeepay' },
    { label: 'LinkAja', logo: 'linkaja' },
  ] },
];
const paymentMethods = paymentMethodGroups.flatMap(group => group.methods.map(method => method.label));

const state = {
  page: 'home',
  fromPage: 'catalog',
  query: '',
  sort: 'Terbaru',
  category: 'Semua',
  filters: { kinds: [], health: [], min: '', max: '', age: '', location: '', gender: '', availability: '' },
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
  addresses: [],
  notifications: [],
  unreadNotifications: 0,
  sellerProfile: null,
  currentAnimalSeller: null,
  currentSellerProfile: null,
  sellerChats: [],
  sellerInbox: [],
  currentAddressReturnPage: 'addresses',
  onboardingStep: 0,
  token: sessionStorage.getItem('mykandang-token') || '',
  user: null,
  authMode: 'login',
  pendingAuthAction: null,
  checkout: { method: 'Kirim Kurir', address: '', paymentMethod: 'BCA (Bank Central Asia)' },
  profile: null,
  adminSummary: null,
  adminOrders: [],
  adminUsers: [],
  adminChats: [],
  adminSellers: [],
  sellerSchemaAvailable: false,
  reviewRating: 5,
  profileTab: 'akun',
};

const formatPrice = value => Number(value) > 0 ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value).replace('IDR', 'Rp').replace(/\u00a0/g, '') : 'Harga belum diatur';
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
const uploadAnimalPhoto = async file => {
  const response = await fetch(`${API_BASE}/api/admin/hewan/foto`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${state.token}`,
      'Content-Type': 'application/octet-stream',
      'X-Image-Type': file.type,
    },
    body: file,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || 'Foto hewan gagal diunggah.');
  return payload.url;
};
const navItems = [
  { id: 'home', label: 'Beranda', icon: 'home' },
  { id: 'saved', label: 'Tersimpan', icon: 'heart' },
  { id: 'orders', label: 'Pesanan', icon: 'package' },
  { id: 'profile', label: 'Profil', icon: 'user' },
];
const primaryNavOrder = ['home', 'catalog', 'saved', 'orders', 'profile'];

function primaryNavSlideDirection(fromPage, toPage) {
  const pageAliases = {
    addresses: 'profile', notifications: 'profile', messages: 'profile', admin: 'profile',
    cart: 'orders', checkout: 'orders', 'order-detail': 'orders', review: 'orders',
    compare: 'home', detail: 'home', onboarding: 'home',
  };
  const fromNavPage = pageAliases[fromPage] || navActive(fromPage);
  const fromIndex = primaryNavOrder.indexOf(fromNavPage);
  const toIndex = primaryNavOrder.indexOf(toPage);
  if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return 0;
  return toIndex > fromIndex ? 1 : -1;
}

function setPage(page, opts = {}, { scrollTarget = '', slideDirection = 0 } = {}) {
  if (state.page === 'catalog' && page === 'detail') state.fromPage = 'catalog';
  if (page === 'detail' && state.page === 'home') state.fromPage = 'home';
  if (page === 'detail' && state.page === 'saved') state.fromPage = 'saved';
  if (opts.animalId) state.currentAnimalId = opts.animalId;
  if (opts.orderId) state.currentOrderId = opts.orderId;
  state.page = page;
  render({ slideDirection });
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
    <nav class="main-nav" aria-label="Navigasi utama">${desktopItems.map(item => `<button class="nav-link ${(item.id==='catalog' ? state.page==='catalog' : navActive(state.page)===item.id) ? 'active' : ''}" data-page="${item.id}" data-nav-slide="true">${item.label}</button>`).join('')}</nav>
    <div class="top-actions">
      <button class="icon-button" aria-label="Cari hewan" data-action="open-search">${icon('search')}</button>
      <button class="icon-button" aria-label="Bandingkan hewan" data-page="compare">${icon('grid')}${state.compare.length ? `<span class="bag-count">${state.compare.length}</span>` : ''}</button>
      <button class="icon-button" aria-label="Keranjang" data-page="cart">${icon('package')}${state.cart.length ? `<span class="bag-count">${state.cart.length}</span>` : ''}</button>
      <button class="icon-button" aria-label="Chat MyKandang" title="Chat MyKandang" data-action="chat">${icon('message')}</button>
      ${state.user ? `<button class="icon-button" aria-label="Notifikasi" title="Notifikasi" data-page="notifications">${icon('bell')}${state.unreadNotifications ? `<span class="bag-count">${state.unreadNotifications}</span>` : ''}</button>` : ''}
      ${state.user ? `<button class="avatar-button" aria-label="Buka profil" data-page="profile">${escapeHtml(state.user.nama.split(/\s+/).map(part=>part[0]).slice(0,2).join('').toUpperCase())}</button>` : `<button class="button button-secondary button-small" data-action="auth">Masuk</button>`}
    </div>
  </div>`;
  const mobileNav = document.getElementById('mobile-nav');
  mobileNav.innerHTML = navItems.map(item => `<button class="${navActive(state.page) === item.id ? 'active' : ''}" data-page="${item.id}" data-nav-slide="true" aria-label="${item.label}">${icon(item.icon)}<span>${item.label}</span></button>`).join('');
}

function render({ slideDirection = 0 } = {}) {
  renderShell();
  const main = document.getElementById('app-main');
  const pages = {
    onboarding: renderOnboarding,
    home: renderHome,
    catalog: renderCatalog,
    cart: renderCart,
    saved: renderSaved,
    orders: renderOrders,
    profile: renderProfile,
    'seller-profile': renderSellerProfile,
    security: renderSecurity,
    help: renderHelpPrivacy,
    addresses: renderAddresses,
    notifications: renderNotifications,
    messages: renderMessages,
    detail: renderDetail,
    compare: renderCompare,
    checkout: renderCheckout,
    'order-detail': renderOrderDetail,
    review: renderReview,
    admin: renderAdmin,
  };
  main.innerHTML = (pages[state.page] || renderHome)();
  const pageElement = slideDirection ? main.querySelector('.page') : null;
  if (pageElement) pageElement.classList.add(slideDirection > 0 ? 'page-slide-from-right' : 'page-slide-from-left');
  renderCompareBar();
}

function renderOnboarding() {
  const slides = [
    { icon: '🐓', title: 'Temukan ternak pilihan', copy: 'Jelajahi berbagai ternak sehat dari katalog MyKandang dan bandingkan detailnya sebelum membeli.' },
    { icon: '🛡️', title: 'Informasi lebih jelas', copy: 'Lihat harga, kondisi, stok, ulasan pembeli, dan profil penjual dalam satu tempat.' },
    { icon: '🤝', title: 'Pesan dengan nyaman', copy: 'Atur alamat dan jadwal serah-terima, lalu pantau status pesananmu di aplikasi.' },
  ];
  const slide = slides[state.onboardingStep] || slides[0];
  return `<section class="page onboarding-page"><div class="onboarding-card panel"><div class="onboarding-illustration">${slide.icon}</div><span class="eyebrow">MyKandang · ${state.onboardingStep + 1} dari ${slides.length}</span><h1>${slide.title}</h1><p>${slide.copy}</p><div class="onboarding-dots">${slides.map((_,index)=>`<span class="${index===state.onboardingStep?'active':''}"></span>`).join('')}</div><div class="onboarding-actions"><button class="button-ghost" data-action="onboarding-skip">Lewati</button><button class="button" data-action="onboarding-next">${state.onboardingStep===slides.length-1?'Mulai sekarang':'Lanjut'} ${icon('arrowRight',14)}</button></div></div></section>`;
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
    if (q && ![item.name,item.kind,item.category,item.breed,item.description,item.location,item.nama_penjual].join(' ').toLocaleLowerCase('id').includes(q)) return false;
    if (state.category !== 'Semua' && item.category !== state.category) return false;
    if (f.kinds.length && !f.kinds.includes(item.kind)) return false;
    if (f.health.length && !f.health.includes(item.health)) return false;
    if (f.location && !String(item.location||'').toLocaleLowerCase('id').includes(f.location.trim().toLocaleLowerCase('id'))) return false;
    if (f.gender && item.gender !== f.gender) return false;
    if (f.availability && item.stock !== f.availability) return false;
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
  if (f.age) chips.push([`Umur: ${f.age==='under1'?'< 1 tahun':f.age==='1to2'?'1–2 tahun':'> 2 tahun'}`, () => { f.age=''; render(); }]);
  if (f.location) chips.push([`Lokasi: ${f.location}`, () => { f.location=''; render(); }]);
  if (f.gender) chips.push([`Jenis kelamin: ${f.gender}`, () => { f.gender=''; render(); }]);
  if (f.availability) chips.push([`Ketersediaan: ${f.availability}`, () => { f.availability=''; render(); }]);
  if (f.min || f.max) chips.push([`${f.min ? formatPrice(Number(f.min)) : 'Rp0'} – ${f.max ? formatPrice(Number(f.max)) : 'bebas'}`, () => { f.min='';f.max='';render(); }]);
  if (!chips.length) return '';
  return `<div class="filter-chips">${chips.map(([label]) => `<button class="filter-chip" data-action="clear-chip" data-label="${escapeHtml(label)}">${escapeHtml(label)} ×</button>`).join('')}<button class="text-link" data-action="reset-filters">Hapus semua</button></div>`;
}

function renderCatalog() {
  const list = getFilteredAnimals();
  const activeCount = state.filters.kinds.length + state.filters.health.length + (state.filters.min||state.filters.max ? 1 : 0) + ['age','location','gender','availability'].filter(key=>state.filters[key]).length;
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
  const savedIds=new Set(savedList.map(item=>Number(item.id)));
  const reference=savedList.find(item=>item.stock==='Tersedia')||savedList[0];
  const similarAnimals=animals.filter(item=>!savedIds.has(Number(item.id))&&item.stock==='Tersedia').sort((a,b)=>{
    const score=item=>(reference?Number(item.category===reference.category)*2+Number(item.kind===reference.kind):0);
    return score(b)-score(a);
  }).slice(0,4);
  return `<section class="page">
    <div class="saved-head"><div><span class="eyebrow">Koleksi Pilihanmu</span><h1>Hewan tersimpan</h1><p class="subtle" style="margin:5px 0 0">Simpan ternak menarik dan lihat lagi kapan saja.</p></div>
      <div class="tabs">${['Semua','Tersedia','Sudah terjual'].map(tab => `<button class="tab ${state.savedTab===tab?'active':''}" data-action="saved-tab" data-value="${tab}">${tab}${tab==='Semua' ? ` · ${savedList.length}` : ''}</button>`).join('')}</div>
    </div>
    ${visible.length ? `<div class="animal-grid">${visible.map(animalCard).join('')}</div>` : `<div class="empty-state"><div class="empty-illustration">♡</div><h3>${state.savedTab==='Sudah terjual'?'Belum ada hewan terjual':'Belum ada hewan tersimpan'}</h3><p>Jelajahi daftar hewan dan simpan pilihan yang menarik bagimu.</p><button class="button" data-page="catalog">Jelajahi hewan ${icon('arrowRight',15)}</button></div>`}
    ${similarAnimals.length?`<section class="section"><div class="section-heading"><div><span class="eyebrow">Rekomendasi</span><h2>Cari hewan serupa</h2><p class="subtle small">${reference?`Pilihan lain yang mirip dengan ${escapeHtml(reference.name)}.`:'Hewan tersedia yang mungkin menarik untukmu.'}</p></div><button class="text-link" data-page="catalog">Lihat katalog</button></div><div class="animal-grid">${similarAnimals.map(animalCard).join('')}</div></section>`:''}
  </section>`;
}

function renderOrders() {
  if (!state.user) return `<section class="page">${authRequired('Masuk untuk melihat pesanan')}</section>`;
  const orders = [...state.orders].reverse();
  return `<section class="page">
    <div class="page-header"><div><span class="eyebrow">Transaksi Kamu</span><h1>Pesanan</h1><p>Pantau status pesanan, item, dan pembayaran.</p></div></div>
    ${orders.length ? `<div class="order-list">${orders.map(order => {
      const first = order.details?.[0];
      return `<article class="order-card order-history-card"><div class="order-thumb">${first ? animalEmoji({kind:animalById(first.id_hewan)?.kind}) : '📦'}</div><div class="order-main"><span class="pill ${order.status_pesanan==='Dibatalkan'?'red':''}">${order.status_pesanan}</span><h3>${first?.nama || 'Pesanan hewan'}${order.details?.length>1?` + ${order.details.length-1} hewan`:''}</h3><p>No. Pesanan ${order.id_pesanan} · ${new Date(order.tgl_pesanan).toLocaleDateString('id-ID')}</p><p>${order.metode_serah_terima}</p></div><div class="order-actions"><div><div class="order-price">${formatPrice(order.total_harga)}</div><button class="button button-secondary button-small" data-page="order-detail" data-id="${order.id_pesanan}">Lihat pesanan</button></div></div></article>`;
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
  const from=state.fromPage==='seller-profile'?'seller-profile':state.fromPage==='saved'?'saved':state.fromPage==='home'?'home':'catalog';
  const image=item.images?.find(image=>image.utama)?.url || item.images?.[0]?.url;
  return `<section class="page"><button class="back-link" data-page="${from}" ${from==='seller-profile'?`data-id="${state.currentSellerProfile?.id_penjual||''}"`:''}>${icon('arrow')} Kembali ke ${from==='saved'?'wishlist':from==='home'?'beranda':from==='seller-profile'?'profil penjual':'daftar hewan'}</button><div class="detail-layout">
    <div><div class="detail-photo ${animalClass(item)}"><span class="photo-tag pill ${item.stock==='Tersedia'?'white':'red'}"><i class="pill-dot"></i> ${escapeHtml(item.stock)}</span>${image?`<img class="detail-image" src="${escapeHtml(image)}" alt="${escapeHtml(item.name)}" onerror="this.hidden=true;this.nextElementSibling.hidden=false" /><span class="animal-emoji" hidden>${animalEmoji(item)}</span>`:`<span class="animal-emoji">${animalEmoji(item)}</span>`}</div>
      <div class="section" style="margin-top:22px"><div class="section-heading"><div><span class="eyebrow">Tabel Data Hewan</span><h2>Data hewan</h2></div></div><div class="spec-grid"><div class="spec-card"><span>Jenis</span><strong>${escapeHtml(item.kind||'—')}</strong></div><div class="spec-card"><span>Ras</span><strong>${escapeHtml(item.breed||'—')}</strong></div><div class="spec-card"><span>Umur</span><strong>${escapeHtml(item.age)}</strong></div><div class="spec-card"><span>Berat</span><strong>${item.weight==null?'—':`${item.weight} kg`}</strong></div><div class="spec-card"><span>Jenis kelamin</span><strong>${escapeHtml(item.gender||'—')}</strong></div><div class="spec-card"><span>Stok</span><strong>${item.stockCount} ekor</strong></div></div><div class="health-note"><strong>${icon('shield',14)} Kondisi kesehatan</strong>${escapeHtml(item.health)}${item.description?`<br />${escapeHtml(item.description)}`:''}</div></div>
    </div><div class="detail-summary"><span class="pill">${escapeHtml(item.category)}</span><h1>${escapeHtml(item.name)} ${escapeHtml(item.gender||'')}</h1><div class="detail-meta">${item.rating?`<span class="compare-rating">★</span><strong>${item.rating.toFixed(1)}</strong><span class="muted">${item.reviews} ulasan</span>`:'<span class="muted">Belum ada ulasan</span>'}</div><div class="detail-price">${formatPrice(item.price)} <small class="muted" style="font:500 11px 'DM Sans'">/ ekor</small></div><p class="subtle small">Detail hewan, kondisi kesehatan, dan ulasan pembeli.</p><div class="detail-divider"></div><div class="detail-actions"><button class="button" data-action="checkout" data-id="${item.id}" ${item.stock==='Tersedia'?'':'disabled'}>${item.stock==='Tersedia'?'Pesan hewan':item.stock==='Terjual'?'Sudah terjual':'Stok habis'} ${icon('arrowRight',15)}</button><button class="button button-secondary" data-action="add-cart" data-id="${item.id}" ${item.stock==='Tersedia'?'':'disabled'}>${icon('package')} Keranjang</button><button class="icon-button ${isSaved(item.id)?'saved':''}" data-action="save" data-id="${item.id}" aria-label="Simpan ke wishlist">${icon('heart')}</button></div>${state.currentAnimalSeller?`<button class="seller-profile-card" data-page="seller-profile" data-id="${state.currentAnimalSeller.id_penjual}"><span class="seller-profile-avatar">${state.currentAnimalSeller.foto_url?`<img src="${escapeHtml(state.currentAnimalSeller.foto_url)}" alt="" />`:'🏪'}</span><span class="seller-profile-copy"><strong>${escapeHtml(state.currentAnimalSeller.nama_toko)}</strong><small>${state.currentAnimalSeller.rating?`★ ${Number(state.currentAnimalSeller.rating).toFixed(1)} · `:''}${Number(state.currentAnimalSeller.jumlah_hewan||0)} hewan tersedia</small><small>${escapeHtml(state.currentAnimalSeller.alamat||'Lokasi belum dicantumkan')}</small></span><span>${icon('chevron',14)}</span></button>`:''}${state.user?.role==='staff_admin'?'':`${state.currentAnimalSeller?`<button class="text-link" data-action="seller-chat-open" data-id="${state.currentAnimalSeller.id_penjual}">Chat Penjual ${icon('chevron',12)}</button>`:''}<button class="text-link" data-action="chat" data-chat-context="animal">Chat MyKandang ${icon('chevron',12)}</button>`}</div>
    </div><section class="section"><div class="section-heading"><div><span class="eyebrow">Tabel Ulasan</span><h2>Ulasan pembeli</h2></div><span class="muted small">${state.animalReviews.length} ulasan</span></div>${state.animalReviews.length ? `<div class="review-list">${state.animalReviews.map(review=>`<article class="panel review-entry"><div class="panel-head"><strong>${escapeHtml(review.nama_pengguna)}</strong><span class="stars">${'★'.repeat(Number(review.rating))}${'☆'.repeat(5-Number(review.rating))}</span></div><p>${escapeHtml(review.komentar||'Tanpa komentar')}</p><small class="muted">${new Date(review.tanggal).toLocaleDateString('id-ID')}</small></article>`).join('')}</div>` : '<p class="subtle">Belum ada ulasan untuk hewan ini.</p>'}</section><section class="section"><div class="section-heading"><div><span class="eyebrow">Data Katalog</span><h2>Hewan lainnya</h2></div><button class="text-link" data-page="catalog">Lihat katalog</button></div><div class="animal-grid">${animals.filter(a=>a.id!==item.id).slice(0,4).map(animalCard).join('')}</div></section></section>`;
}

function renderSellerProfile() {
  const seller=state.currentSellerProfile;
  if(!seller)return `<section class="page"><div class="empty-state"><h3>Profil penjual tidak ditemukan</h3><button class="button" data-page="catalog">Kembali ke katalog</button></div></section>`;
  return `<section class="page"><button class="back-link" data-page="detail" data-id="${state.currentAnimalId}">${icon('arrow')} Kembali ke detail hewan</button><div class="seller-profile-hero panel"><span class="seller-profile-avatar large">${seller.foto_url?`<img src="${escapeHtml(seller.foto_url)}" alt="" />`:'🏪'}</span><div class="seller-profile-copy"><span class="eyebrow">Profil Penjual</span><h1>${escapeHtml(seller.nama_toko)}</h1><p>${escapeHtml(seller.deskripsi||'Informasi toko dan hewan ternak tersedia di sini.')}</p><div class="seller-profile-meta"><span>${seller.rating?`★ ${Number(seller.rating).toFixed(1)} dari ulasan pembeli`:'Belum ada rating'}</span><span>${Number(seller.jumlah_hewan||0)} hewan tersedia</span><span>${escapeHtml(seller.alamat||'Lokasi belum dicantumkan')}</span></div></div><button class="button" data-action="seller-chat-open" data-id="${seller.id_penjual}">${icon('message')} Chat penjual</button></div>${seller.reviews?.length?`<section class="section"><div class="section-heading"><div><span class="eyebrow">Ulasan Penjual</span><h2>Pengalaman pembeli</h2></div></div><div class="review-list">${seller.reviews.map(review=>`<article class="panel review-entry"><div class="panel-head"><strong>${escapeHtml(review.nama_pengguna)}</strong><span class="stars">${'★'.repeat(Number(review.rating))}${'☆'.repeat(5-Number(review.rating))}</span></div><p>${escapeHtml(review.komentar||'Tanpa komentar')} <span class="muted">· ${escapeHtml(review.nama_hewan)}</span></p><small class="muted">${new Date(review.tanggal).toLocaleDateString('id-ID')}</small></article>`).join('')}</div></section>`:''}<section class="section"><div class="section-heading"><div><span class="eyebrow">Katalog Toko</span><h2>Hewan dari ${escapeHtml(seller.nama_toko)}</h2></div></div>${seller.animals?.length?`<div class="animal-grid">${seller.animals.map(animalCard).join('')}</div>`:'<div class="empty-state"><p class="subtle">Belum ada hewan tersedia dari toko ini.</p></div>'}</section></section>`;
}

function renderCompare() {
  const items=state.compare.map(animalById).filter(Boolean);
  if (!items.length) return `<section class="page"><div class="page-header"><div><span class="eyebrow">Perbandingan</span><h1>Bandingkan hewan</h1><p>Pilih sampai 3 hewan dari katalog.</p></div></div><div class="empty-state"><div class="empty-illustration">⚖️</div><h3>Belum ada hewan dipilih</h3><button class="button" data-page="catalog">Pilih hewan</button></div></section>`;
  const rows=[['Harga',item=>formatPrice(item.price)],['Kategori',item=>item.category],['Jenis',item=>item.kind||'—'],['Ras',item=>item.breed||'—'],['Umur',item=>item.age],['Berat',item=>item.weight==null?'—':`${item.weight} kg`],['Lokasi penjual',item=>item.lokasi||'Belum dicantumkan'],['Jenis kelamin',item=>item.gender||'—'],['Kesehatan',item=>item.health],['Ketersediaan',item=>`${item.stock} · ${item.stockCount} ekor`],['Rating penjual',item=>item.rating_penjual?`★ ${item.rating_penjual.toFixed(1)}`:'Belum ada rating']];
  return `<section class="page"><button class="back-link" data-page="catalog">${icon('arrow')} Kembali ke katalog</button><div class="page-header"><div><span class="eyebrow">Perbandingan Data Hewan</span><h1>Bandingkan hewan</h1><p>Bandingkan harga, kondisi kesehatan, dan ulasan secara berdampingan.</p></div></div><div class="compare-wrap"><table class="compare-table"><tbody><tr><th>Hewan</th>${items.map(item=>`<td><div class="compare-animal"><div class="compare-emoji">${animalEmoji(item)}</div><strong>${escapeHtml(item.name)}</strong><button class="button-ghost" data-action="remove-compare" data-id="${item.id}">Hapus</button></div></td>`).join('')}</tr>${rows.map(([label,fn])=>`<tr><th>${label}</th>${items.map(item=>`<td class="compare-value ${label==='Harga'?'price':''}">${escapeHtml(fn(item))}</td>`).join('')}</tr>`).join('')}</tbody></table></div></section>`;
}

function renderCheckout() {
  if (!state.user) return `<section class="page">${authRequired('Masuk untuk membuat pesanan')}</section>`;
  const items = state.checkoutItems.map(line=>({ ...animalById(line.id_hewan), jumlah:line.kuantitas })).filter(item=>item.id);
  if (!items.length) return renderCart();
  const method = state.checkout.method || 'Kirim Kurir';
  const subtotal=items.reduce((sum,item)=>sum+item.price*item.jumlah,0);
  const sellerRates=new Map();
  for(const item of items)if(item.id_penjual)sellerRates.set(Number(item.id_penjual),item.estimasi_biaya_transportasi==null?null:Number(item.estimasi_biaya_transportasi));
  const transportNeedsConfirmation=method==='Kirim Kurir'&&(!items.length||items.some(item=>!item.id_penjual||item.estimasi_biaya_transportasi==null));
  const transportEstimate=method==='Ambil di Kandang'?0:transportNeedsConfirmation?null:[...sellerRates.values()].reduce((sum,fee)=>sum+fee,0);
  const total=subtotal+(transportEstimate||0);
  const selectedPaymentMethod=paymentMethods.includes(state.checkout.paymentMethod)?state.checkout.paymentMethod:paymentMethods[0];
  const paymentOptions=paymentMethodGroups.map(group=>`<div class="payment-method-group"><h4>${group.title}</h4><div class="payment-method-grid">${group.methods.map(paymentMethod=>`<label class="choice-card payment-method-card ${selectedPaymentMethod===paymentMethod.label?'selected':''}"><input type="radio" name="paymentMethod" value="${escapeHtml(paymentMethod.label)}" data-change="payment-method" ${selectedPaymentMethod===paymentMethod.label?'checked':''}/><span class="payment-method-logo"><img src="/assets/payments/${paymentMethod.logo}.svg" alt="" loading="lazy" decoding="async" /></span><span class="choice-copy"><strong>${escapeHtml(paymentMethod.label)}</strong></span></label>`).join('')}</div></div>`).join('');
  const addressId=String(state.checkout.id_alamat||'');
  const selectedAddress=state.addresses.find(address=>String(address.id_alamat)===addressId);
  return `<section class="page"><button class="back-link" data-page="cart">${icon('arrow')} Kembali ke keranjang</button><div class="page-header"><div><span class="eyebrow">Tabel Pesanan</span><h1>Konfirmasi pesanan</h1><p>Periksa detail pesanan sebelum melanjutkan.</p></div></div>
  <div class="checkout-layout"><div class="checkout-stack"><section class="panel"><div class="panel-head"><h3>Metode serah terima</h3></div><div class="radio-list">
    <label class="choice-card ${method==='Kirim Kurir'?'selected':''}"><input type="radio" name="method" value="Kirim Kurir" data-change="method" ${method==='Kirim Kurir'?'checked':''}/><span class="choice-icon">🚚</span><span class="choice-copy"><strong>Kirim kurir</strong><small>Alamat diambil dari data pengguna.</small></span></label>
    <label class="choice-card ${method==='Ambil di Kandang'?'selected':''}"><input type="radio" name="method" value="Ambil di Kandang" data-change="method" ${method==='Ambil di Kandang'?'checked':''}/><span class="choice-icon">📍</span><span class="choice-copy"><strong>Ambil di kandang</strong><small>Atur pengambilan langsung.</small></span></label></div>
    ${method==='Kirim Kurir'?`<div class="field-group"><label class="form-label" for="checkout-address">Alamat pengiriman</label>${state.addresses.length?`<select class="field" id="checkout-address" data-change="checkout-address"><option value="">Masukkan alamat lain</option>${state.addresses.map(address=>`<option value="${address.id_alamat}" ${addressId===String(address.id_alamat)?'selected':''}>${escapeHtml(address.label)}${address.utama?' · Utama':''}</option>`).join('')}</select>${selectedAddress?`<div class="selected-address"><strong>${escapeHtml(selectedAddress.nama_penerima)}${selectedAddress.no_telepon?` · ${escapeHtml(selectedAddress.no_telepon)}`:''}</strong><p>${escapeHtml(selectedAddress.alamat)}</p></div>`:`<textarea class="field" id="order-address" maxlength="255" required placeholder="Alamat lengkap penerima">${escapeHtml(state.checkout.address||'')}</textarea>`}<button class="text-link" type="button" data-action="address-add-checkout">Tambah alamat tersimpan ${icon('chevron',12)}</button>`:`<textarea class="field" id="order-address" maxlength="255" required>${escapeHtml(state.checkout.address||state.profile?.alamat||'')}</textarea><button class="text-link" type="button" data-action="address-add-checkout">Simpan alamat untuk berikutnya ${icon('chevron',12)}</button>`}</div>`:''}
    <div class="field-group"><label class="form-label" for="handoff-schedule">Jadwal serah-terima</label><input class="field" id="handoff-schedule" type="datetime-local" min="${minimumHandoffLocal()}" value="${escapeHtml(state.checkout.schedule||suggestedHandoffLocal())}" required /><small class="muted">Pilih waktu minimal satu jam dari sekarang.</small></div>
  </section><section class="panel"><div class="panel-head"><h3>Pembayaran</h3></div><div class="payment-method-groups">${paymentOptions}</div><p class="subtle small" style="margin:12px 0 0">Status pembayaran terdeteksi otomatis setelah pesanan dibuat.</p></section></div>
  <aside class="panel"><div class="panel-head"><h3>Ringkasan pesanan</h3></div>${items.map(item=>`<div class="summary-product"><div class="summary-thumb">${animalEmoji(item)}</div><span><strong>${escapeHtml(item.name)}</strong><small>${item.jumlah} ekor × ${formatPrice(item.price)}</small></span></div>`).join('')}<div class="summary-lines"><div class="summary-line"><span>Subtotal</span><strong>${formatPrice(subtotal)}</strong></div><div class="summary-line"><span>Estimasi biaya transportasi</span><strong>${transportEstimate==null?'Dikonfirmasi penjual':formatPrice(transportEstimate)}</strong></div></div><div class="summary-total"><span>${transportEstimate==null?'Total sementara':'Total'}</span><strong>${formatPrice(total)}</strong></div>${items.some(item=>item.id_penjual)?`<div class="info-callout">Konfirmasi jadwal serah-terima${method==='Kirim Kurir'?' dan biaya pengiriman':''} dengan penjual sebelum serah-terima.${[...new Map(items.filter(item=>item.id_penjual).map(item=>[Number(item.id_penjual),item])).values()].map(item=>`<br /><button class="text-link" type="button" data-action="seller-chat-open" data-id="${item.id_penjual}">Chat ${escapeHtml(item.nama_penjual||'penjual')}</button>`).join('')}</div>`:''}<button class="button button-block" style="margin-top:16px" data-action="place-order">Buat pesanan &amp; deteksi bayar ${icon('arrowRight',14)}</button></aside></div></section>`;
}

function suggestedHandoffLocal() {
  const date=new Date(Date.now()+24*60*60*1000);
  date.setMinutes(0,0,0);
  return new Date(date.getTime()-date.getTimezoneOffset()*60000).toISOString().slice(0,16);
}

function minimumHandoffLocal() {
  const date=new Date(Date.now()+60*60*1000);
  return new Date(date.getTime()-date.getTimezoneOffset()*60000).toISOString().slice(0,16);
}

function renderOrderDetail() {
  const order = currentOrder();
  if (!order) return renderOrders();
  const cancelled = order.status_pesanan === 'Dibatalkan';
  const details = order.details || [];
  const status = order.status_pesanan || 'Pending';
  const canReview = status === 'Selesai';
  const paid=order.status_pembayaran==='Berhasil';
  return `<section class="page"><button class="back-link" data-page="orders">${icon('arrow')} Kembali ke pesanan</button><div class="page-header"><div><span class="eyebrow">Pesanan #${order.id_pesanan}</span><h1>Status pesanan</h1><p>${new Date(order.tgl_pesanan).toLocaleString('id-ID')}</p></div><span class="pill ${cancelled?'red':''}">${escapeHtml(status)}</span></div><div class="status-layout"><div class="checkout-stack"><div class="status-banner"><span class="status-icon">${cancelled?'↩':paid?'✓':'…'}</span><span><strong>${cancelled?'Pesanan dibatalkan':paid?'Pembayaran berhasil':`Status ${escapeHtml(status)}`}</strong><p>${order.jadwal_serah_terima?`Jadwal serah-terima: ${new Date(order.jadwal_serah_terima).toLocaleString('id-ID')} · konfirmasi jadwal melalui chat penjual.`:'Status pesanan terbaru ditampilkan di sini.'}</p></span></div><section class="panel"><div class="panel-head"><h3>Detail pesanan</h3></div>${order.alasan_pembatalan?`<div class="info-callout"><strong>Alasan pembatalan:</strong> ${escapeHtml(order.alasan_pembatalan)}</div>`:''}${order.alamat_pengiriman?`<div class="order-address-summary"><strong>Alamat serah-terima</strong><p>${escapeHtml(order.alamat_pengiriman)}</p></div>`:''}${details.map(line=>`<div class="summary-product"><div class="summary-thumb">${animalEmoji({kind:animalById(line.id_hewan)?.kind})}</div><span><strong>${escapeHtml(line.nama)}</strong><small>${line.kuantitas} ekor × ${formatPrice(line.harga_satuan)}</small><small>Subtotal ${formatPrice(line.subtotal)}</small>${line.id_penjual?`<button class="text-link" data-action="seller-chat-open" data-id="${line.id_penjual}">Chat ${escapeHtml(line.nama_penjual||'penjual')}</button>`:''}${canReview?(line.sudah_diulas?'<small class="muted">Ulasan sudah dikirim</small>':`<button class="text-link" data-action="write-review" data-id="${order.id_pesanan}" data-animal="${line.id_hewan}">Beri ulasan</button>`):''}</span></div>`).join('')}${status==='Pending'&&!paid?`<div class="info-callout">Pesanan menunggu proses berikutnya.</div><button class="button button-danger button-small" data-action="cancel-order" data-id="${order.id_pesanan}">Batalkan pesanan</button>`:''}</section></div>
  <aside class="panel"><div class="panel-head"><h3>Pembayaran</h3></div><div class="receipt-row"><span>Status</span><strong>${escapeHtml(order.status_pembayaran||'Belum Dibayar')}</strong></div><div class="receipt-row"><span>Metode</span><strong>${escapeHtml(order.metode_pembayaran||'BCA (Bank Central Asia)')}</strong></div><div class="receipt-row"><span>Estimasi transportasi</span><strong>${order.metode_serah_terima==='Ambil di Kandang'?formatPrice(0):order.estimasi_biaya_transportasi==null?'Dikonfirmasi penjual':formatPrice(order.estimasi_biaya_transportasi)}</strong></div><div class="receipt-row total"><span>Total</span><strong>${formatPrice(order.total_harga)}</strong></div>${paid?'<p class="payment-success-note">Pembayaran terdeteksi otomatis.</p>':!cancelled?`<button class="button button-block" style="margin-top:12px" data-action="payment" data-id="${order.id_pesanan}">Deteksi pembayaran ${icon('arrowRight',14)}</button>`:''}</aside></div></section>`;
}

function renderReview() {
  const order=currentOrder();
  const detail=order?.details?.find(item=>Number(item.id_hewan)===Number(state.currentReviewAnimalId)) || order?.details?.find(item=>!item.sudah_diulas);
  if (!order || order.status_pesanan!=='Selesai') return renderOrders();
  return `<section class="page"><button class="back-link" data-page="order-detail" data-id="${order.id_pesanan}">${icon('arrow')} Kembali ke pesanan</button><div class="page-header"><div><span class="eyebrow">Tabel Ulasan</span><h1>Ulasan hewan</h1><p>Ulasan ini terkait dengan hewan yang sudah kamu pesan.</p></div></div><div class="panel" style="max-width:650px"><div class="summary-product"><div class="summary-thumb">${animalEmoji({kind:animalById(detail?.id_hewan)?.kind})}</div><span><strong>${escapeHtml(detail?.nama||'Hewan')}</strong><small>Pesanan #${order.id_pesanan}</small></span></div><div class="detail-divider"></div><label class="form-label">Rating</label><div class="review-stars">${[1,2,3,4,5].map(i=>`<button class="star-button ${i<=state.reviewRating?'active':''}" data-action="rating" data-value="${i}" aria-label="${i} bintang">★</button>`).join('')}</div><label class="form-label" for="review-copy">Komentar <span class="muted">(maksimal 500 karakter)</span></label><textarea class="field" id="review-copy" maxlength="500" placeholder="Bagikan pengalamanmu tentang hewan ini." style="min-height:110px"></textarea><button class="button button-block" style="margin-top:17px" data-action="submit-review" data-id="${order.id_pesanan}" data-animal="${detail?.id_hewan}">Kirim ulasan ${icon('arrowRight',14)}</button></div></section>`;
}

function renderProfile() {
  if (!state.user) return `<section class="page"><div class="empty-state"><div class="empty-illustration">👤</div><h3>Masuk untuk melihat akun</h3><p>Kelola profil dan alamat, pantau pesanan, serta lihat hewan favorit yang kamu simpan.</p><button class="button" data-action="auth">Masuk atau daftar</button></div></section>`;
  const p = state.profile || state.user;
  const sellerAction=state.sellerProfile?.status==='Aktif'?`<div class="profile-seller-status"><strong>Toko ${escapeHtml(state.sellerProfile.nama_toko)} aktif</strong><small>${escapeHtml(state.sellerProfile.alamat||'Lokasi belum dicantumkan')} · estimasi kirim ${state.sellerProfile.estimasi_biaya_transportasi==null?'belum diatur':formatPrice(state.sellerProfile.estimasi_biaya_transportasi)}</small><button class="button button-secondary button-small" data-action="seller-apply">Kelola profil toko</button></div>`:state.sellerProfile?.status==='Menunggu'?`<div class="profile-seller-status"><strong>Pengajuan toko sedang ditinjau</strong><small>Kamu akan mendapat notifikasi setelah admin memeriksa profil toko.</small><button class="button button-secondary button-small" data-action="seller-apply">Edit pengajuan</button></div>`:'';
  return `<section class="page"><div class="page-header"><div><span class="eyebrow">Tabel Pengguna</span><h1>Profil</h1><p>Kelola informasi kontak yang digunakan di akun MyKandang.</p></div></div><section class="panel" style="max-width:760px"><div class="panel-head"><div class="seller-person"><span class="profile-large-avatar">${escapeHtml((p.nama||'MK').split(/\s+/).map(part=>part[0]).slice(0,2).join('').toUpperCase())}</span><span><h3>${escapeHtml(p.nama||'')}</h3><span class="muted small">${escapeHtml(p.email||'')} · ${escapeHtml(p.role||'customer')}</span></span></div><button class="button button-secondary button-small" data-action="edit-profile">${icon('edit',14)} Ubah</button></div><div class="profile-data"><div class="data-item"><span>Nomor handphone</span><strong>${escapeHtml(p.no_telepon || 'Belum dicantumkan')}</strong></div><div class="data-item"><span>Alamat</span><strong>${escapeHtml(state.addresses.find(address=>address.utama)?.alamat || p.alamat || 'Belum dicantumkan')}</strong></div></div><div class="detail-divider"></div><div class="profile-shortcuts"><button class="profile-shortcut" data-page="addresses"><span>${icon('pin')}</span><strong>Alamat tersimpan</strong><small>${state.addresses.length} alamat</small></button><button class="profile-shortcut" data-page="notifications"><span>${icon('bell')}</span><strong>Notifikasi</strong><small>${state.unreadNotifications} belum dibaca</small></button><button class="profile-shortcut" data-page="security"><span>🔒</span><strong>Keamanan akun</strong><small>Ubah kata sandi</small></button>${sellerAction}</div>${p.role==='staff_admin'?`<div class="detail-divider"></div><button class="button button-secondary button-small" data-page="admin">Buka panel admin ${icon('arrowRight',14)}</button>`:''}<div class="detail-divider"></div><button class="button button-danger button-small" data-action="logout">Keluar dari akun</button></section></section>`;
}

function renderSecurity() {
  if(!state.user)return `<section class="page">${authRequired('Masuk untuk mengelola keamanan akun')}</section>`;
  return `<section class="page"><button class="back-link" data-page="profile">${icon('arrow')} Kembali ke profil</button><div class="page-header"><div><span class="eyebrow">Keamanan</span><h1>Keamanan akun</h1><p>Ganti kata sandi untuk menjaga akunmu tetap aman.</p></div></div><section class="panel" style="max-width:620px"><form data-form="change-password"><label class="field-group"><span class="form-label">Kata sandi saat ini</span><input class="field" name="current_password" type="password" autocomplete="current-password" required /></label><label class="field-group"><span class="form-label">Kata sandi baru</span><input class="field" name="new_password" type="password" minlength="8" autocomplete="new-password" required /></label><label class="field-group"><span class="form-label">Ulangi kata sandi baru</span><input class="field" name="confirm_password" type="password" minlength="8" autocomplete="new-password" required /></label><button class="button" type="submit">Simpan kata sandi</button></form></section></section>`;
}

function renderHelpPrivacy() {
  return `<section class="page"><button class="back-link" data-page="profile">${icon('arrow')} Kembali ke profil</button><div class="page-header"><div><span class="eyebrow">Pusat Bantuan</span><h1>Bantuan & privasi</h1><p>Panduan menggunakan MyKandang dan ringkasan pengelolaan data.</p></div></div><div class="checkout-stack" style="max-width:760px"><section class="panel"><h3>Cara menggunakan MyKandang</h3><div class="help-entry"><strong>Mencari dan membandingkan hewan</strong><p class="subtle small">Gunakan kategori, pencarian, dan filter. Tambahkan maksimal tiga hewan ke perbandingan untuk melihat datanya berdampingan.</p></div><div class="help-entry"><strong>Pemesanan dan serah-terima</strong><p class="subtle small">Pilih kurir atau ambil di kandang, atur jadwal, dan hubungi penjual untuk mengonfirmasi biaya serta waktu serah-terima.</p></div><div class="help-entry"><strong>Privasi dan data akun</strong><p class="subtle small">Data profil dan alamat digunakan untuk mengelola pesanan. Kamu dapat mengubah alamat dan informasi kontak dari halaman Profil.</p></div><button class="button button-secondary" data-action="chat">Hubungi bantuan MyKandang ${icon('message',14)}</button></section></div></section>`;
}

function renderSellerApplicationModal() {
  const seller=state.sellerProfile||{};
  openModal(seller.status==='Aktif'?'Kelola profil toko':'Mulai berjualan','Informasi toko akan ditinjau sebelum ditampilkan kepada pembeli.',`<form data-form="seller-application"><label class="field-group"><span class="form-label">Nama toko</span><input class="field" name="nama_toko" maxlength="120" value="${escapeHtml(seller.nama_toko||'')}" required /></label><label class="field-group"><span class="form-label">Deskripsi toko</span><textarea class="field" name="deskripsi" maxlength="1000">${escapeHtml(seller.deskripsi||'')}</textarea></label><label class="field-group"><span class="form-label">Nomor telepon toko</span><input class="field" name="no_telepon" type="tel" value="${escapeHtml(seller.no_telepon||state.user?.no_telepon||'')}" /></label><label class="field-group"><span class="form-label">Lokasi toko</span><textarea class="field" name="alamat" maxlength="255" required>${escapeHtml(seller.alamat||'')}</textarea></label><label class="field-group"><span class="form-label">Estimasi ongkos kirim (Rp)</span><input class="field" name="estimasi_biaya_transportasi" type="number" min="0" step="1000" value="${seller.estimasi_biaya_transportasi??''}" placeholder="Kosongkan jika perlu dikonfirmasi" /></label><label class="field-group"><span class="form-label">URL foto toko <small>(opsional)</small></span><input class="field" name="foto_url" type="url" value="${escapeHtml(seller.foto_url||'')}" /></label><div class="modal-footer"><button type="button" class="button button-secondary" data-action="close-modal">Batal</button><button class="button" type="submit">${seller.status==='Aktif'?'Simpan profil toko':'Kirim pengajuan'}</button></div></form>`);
}

function renderAddresses() {
  if(!state.user)return `<section class="page">${authRequired('Masuk untuk mengelola alamat')}</section>`;
  return `<section class="page"><button class="back-link" data-page="profile">${icon('arrow')} Kembali ke profil</button><div class="page-header"><div><span class="eyebrow">Alamat Pengiriman</span><h1>Alamat tersimpan</h1><p>Simpan beberapa alamat dan pilih alamat utama untuk pesanan berikutnya.</p></div><button class="button" data-action="address-add">${icon('plus')} Tambah alamat</button></div>${state.addresses.length?`<div class="address-list">${state.addresses.map(address=>`<article class="panel address-entry"><div><div class="address-label-row"><strong>${escapeHtml(address.label)}</strong>${address.utama?'<span class="pill green">Utama</span>':''}</div><p><strong>${escapeHtml(address.nama_penerima)}</strong>${address.no_telepon?` · ${escapeHtml(address.no_telepon)}`:''}<br />${escapeHtml(address.alamat)}</p></div><div class="address-entry-actions">${!address.utama?`<button class="button button-secondary button-small" data-action="address-default" data-id="${address.id_alamat}">Jadikan utama</button>`:''}<button class="button-ghost" data-action="address-edit" data-id="${address.id_alamat}">Ubah</button><button class="button-ghost" data-action="address-delete" data-id="${address.id_alamat}">Hapus</button></div></article>`).join('')}</div>`:`<div class="empty-state"><div class="empty-illustration">📍</div><h3>Belum ada alamat tersimpan</h3><p>Tambahkan alamat untuk mempercepat proses pemesanan.</p><button class="button" data-action="address-add">Tambah alamat</button></div>`}</section>`;
}

function renderNotifications() {
  if(!state.user)return `<section class="page">${authRequired('Masuk untuk melihat notifikasi')}</section>`;
  return `<section class="page"><div class="page-header"><div><span class="eyebrow">Pembaruan Akun</span><h1>Notifikasi</h1><p>${state.unreadNotifications} notifikasi belum dibaca.</p></div>${state.unreadNotifications?`<button class="button button-secondary button-small" data-action="notifications-read-all">Tandai semua dibaca</button>`:''}</div>${state.notifications.length?`<div class="notification-list">${state.notifications.map(item=>`<button class="panel notification-entry ${item.dibaca?'':'unread'}" data-action="notification-open" data-id="${item.id_notifikasi}"><span class="notification-icon">${item.jenis==='order'?'📦':item.jenis==='chat'?'💬':item.jenis==='seller'?'🏪':'🔔'}</span><span class="notification-copy"><strong>${escapeHtml(item.judul)}</strong><small>${escapeHtml(item.pesan)}</small><time>${new Date(item.dibuat).toLocaleString('id-ID')}</time></span>${item.dibaca?'':`<i class="notification-dot"></i>`}</button>`).join('')}</div>`:`<div class="empty-state"><div class="empty-illustration">🔔</div><h3>Belum ada notifikasi</h3><p>Pembaruan pesanan dan percakapan akan muncul di sini.</p></div>`}</section>`;
}

function renderMessages() {
  if(!state.user)return `<section class="page">${authRequired('Masuk untuk melihat pesan')}</section>`;
  const seller=state.sellerProfile?.status==='Aktif';
  return `<section class="page"><div class="page-header"><div><span class="eyebrow">Percakapan</span><h1>Pesan</h1><p>Hubungi penjual atau balas pelanggan dari kotak masuk toko.</p></div><button class="button button-secondary button-small" data-action="chat">Chat MyKandang</button></div><section class="section"><div class="section-heading"><div><h2>Penjual</h2><p class="subtle small">Percakapan tentang hewan yang kamu lihat.</p></div></div>${state.sellerChats.length?`<div class="admin-list">${state.sellerChats.map(chat=>{const last=chat.messages.at(-1);return `<article class="panel admin-row"><div class="summary-thumb">🏪</div><div><strong>${escapeHtml(chat.nama_toko)}</strong><small>${escapeHtml(last?.isi_pesan||'Mulai percakapan')}</small>${last?`<small>${new Date(last.waktu_kirim).toLocaleString('id-ID')}</small>`:''}</div><button class="button button-secondary button-small" data-action="seller-chat-open" data-id="${chat.id_penjual}">Buka chat</button></article>`}).join('')}</div>`:'<p class="subtle">Belum ada percakapan dengan penjual.</p>'}</section>${seller?`<section class="section"><div class="section-heading"><div><h2>Kotak masuk toko</h2><p class="subtle small">Pesan pelanggan ke ${escapeHtml(state.sellerProfile.nama_toko)}.</p></div></div>${state.sellerInbox.length?`<div class="admin-list">${state.sellerInbox.map(chat=>{const last=chat.messages.at(-1);return `<article class="panel admin-row"><div class="summary-thumb">${escapeHtml((chat.nama||'P').slice(0,1))}</div><div><strong>${escapeHtml(chat.nama)}</strong><small>${escapeHtml(chat.email)}</small><small>${escapeHtml(last?.isi_pesan||'Belum ada pesan')}</small></div><button class="button button-secondary button-small" data-action="seller-inbox-open" data-id="${chat.id_chat}">Balas</button></article>`}).join('')}</div>`:'<p class="subtle">Belum ada pesan pelanggan.</p>'}</section>`:''}</section>`;
}

async function loadAdmin() {
  try{state.adminSellers=await api('/admin/penjual');state.sellerSchemaAvailable=true;}catch{state.adminSellers=[];state.sellerSchemaAvailable=false;}
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
    <section class="section"><div class="section-heading"><div><span class="eyebrow">Kemitraan</span><h2>Pengajuan penjual</h2></div></div>${state.adminSellers.length?`<div class="admin-list">${state.adminSellers.map(seller=>`<article class="panel admin-row"><div class="summary-thumb">🏪</div><div><strong>${escapeHtml(seller.nama_toko)}</strong><small>${escapeHtml(seller.nama)} · ${escapeHtml(seller.email)}</small><small>${escapeHtml(seller.deskripsi||seller.alamat||'Tanpa deskripsi')}</small></div><div class="admin-actions"><span class="pill ${seller.status==='Aktif'?'green':seller.status==='Ditolak'?'red':''}">${escapeHtml(seller.status)}</span>${seller.status==='Menunggu'?`<button class="button button-small" data-action="admin-seller-status" data-id="${seller.id_penjual}" data-value="Aktif">Setujui</button><button class="button button-danger button-small" data-action="admin-seller-status" data-id="${seller.id_penjual}" data-value="Ditolak">Tolak</button>`:seller.status==='Aktif'?`<button class="button button-secondary button-small" data-action="admin-seller-status" data-id="${seller.id_penjual}" data-value="Nonaktif">Nonaktifkan</button>`:`<button class="button button-secondary button-small" data-action="admin-seller-status" data-id="${seller.id_penjual}" data-value="Aktif">Aktifkan</button>`}</div></article>`).join('')}</div>`:'<p class="subtle">Belum ada pengajuan penjual.</p>'}</section>
    <section class="section"><div class="section-heading"><div><span class="eyebrow">Tabel Kategori Hewan</span><h2>Kategori</h2></div><button class="button button-secondary button-small" data-action="admin-new-category">${icon('plus',14)} Tambah kategori</button></div>${categories.length?`<div class="admin-list">${categories.map(category=>{const used=adminAnimals.filter(item=>Number(item.id_kategori)===Number(category.id_kategori)).length;return `<article class="panel admin-row"><div class="summary-thumb">${icon('grid')}</div><div><strong>${escapeHtml(category.nama_kategori)}</strong><small>${escapeHtml(category.deskripsi||'Tanpa deskripsi')}</small><small>${used} data hewan menggunakan kategori ini</small></div><div class="admin-actions"><button class="button button-secondary button-small" data-action="admin-edit-category" data-id="${category.id_kategori}">${icon('edit',14)} Ubah</button><button class="button button-danger button-small" data-action="admin-delete-category" data-id="${category.id_kategori}">Hapus</button></div></article>`}).join('')}</div>`:'<p class="subtle">Belum ada kategori.</p>'}</section>
    <section class="section"><div class="section-heading"><div><span class="eyebrow">Tabel Data Hewan</span><h2>Katalog</h2></div></div>${adminAnimals.length?`<div class="admin-list">${adminAnimals.map(item=>`<article class="panel admin-row"><div class="summary-thumb">${animalEmoji(item)}</div><div><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.category)} · ${item.stockCount} ekor · ${escapeHtml(item.stock)}</small><small>${formatPrice(item.price)} · ${escapeHtml(item.health)}</small></div><div class="admin-actions"><button class="button button-secondary button-small" data-action="admin-edit-animal" data-id="${item.id}">${icon('edit',14)} Ubah</button><button class="button button-danger button-small" data-action="admin-delete-animal" data-id="${item.id}">Hapus</button></div></article>`).join('')}</div>`:'<p class="subtle">Belum ada data hewan.</p>'}</section>
    <section class="section"><div class="section-heading"><div><span class="eyebrow">Tabel Pesanan & Pembayaran</span><h2>Transaksi</h2></div></div>${state.adminOrders.length?`<div class="admin-list">${state.adminOrders.map(order=>`<article class="panel admin-order"><div class="panel-head"><span><strong>Pesanan #${order.id_pesanan}</strong><small>${escapeHtml(order.nama_pelanggan)} · ${escapeHtml(order.email)}</small></span><strong>${formatPrice(order.total_harga)}</strong></div><p>${order.details.map(line=>`${escapeHtml(line.nama)} × ${line.kuantitas}`).join(' · ')} · ${escapeHtml(order.metode_serah_terima)}</p><div class="admin-order-controls"><label class="small">Pesanan<select class="field" data-admin-order-status="${order.id_pesanan}">${['Pending','Diproses','Selesai','Dibatalkan'].map(status=>`<option ${order.status_pesanan===status?'selected':''}>${status}</option>`).join('')}</select></label><label class="small">Pembayaran<select class="field" data-admin-payment-status="${order.id_pesanan}">${['Belum Dibayar','Berhasil'].map(status=>`<option ${order.status_pembayaran===status?'selected':''}>${status}</option>`).join('')}</select></label><button class="button button-secondary button-small" data-action="admin-save-order" data-id="${order.id_pesanan}">Simpan</button></div></article>`).join('')}</div>`:'<p class="subtle">Belum ada pesanan.</p>'}</section>
    <section class="section" id="admin-conversations"><div class="section-heading"><div><span class="eyebrow">Tabel Percakapan</span><h2>Percakapan</h2></div></div>${state.adminChats.length?`<div class="admin-list">${state.adminChats.map(chat=>{const last=chat.messages.at(-1);return `<article class="panel admin-row"><div class="admin-main"><strong>${escapeHtml(chat.nama)}</strong><small>${escapeHtml(chat.email)}</small><small>${escapeHtml(last?.isi_pesan||'Belum ada pesan')}</small></div><div class="admin-actions"><button class="button button-secondary button-small" data-action="admin-chat" data-id="${chat.id_chat}">Buka chat</button><button class="button button-danger button-small" data-action="admin-delete-chat" data-id="${chat.id_chat}">Hapus</button></div></article>`}).join('')}</div>`:'<p class="subtle">Belum ada percakapan.</p>'}</section>
    <section class="section"><div class="section-heading"><div><span class="eyebrow">Tabel Pengguna</span><h2>Akun pengguna</h2></div></div><div class="admin-list">${state.adminUsers.map(user=>`<article class="panel admin-row"><div class="profile-large-avatar">${escapeHtml(user.nama.split(/\s+/).map(part=>part[0]).slice(0,2).join('').toUpperCase())}</div><div><strong>${escapeHtml(user.nama)}</strong><small>${escapeHtml(user.email)} · ${escapeHtml(user.role)}</small></div><div class="admin-actions"><span class="muted small">${escapeHtml(user.no_telepon||'')}</span>${user.role==='customer'?`<button class="button button-danger button-small" data-action="admin-delete-user" data-id="${user.id_pengguna}">Hapus akun</button>`:`<span class="muted small">Admin dilindungi</span>`}</div></article>`).join('')}</div></section>
  </section>`;
}

function renderAdminAnimalModal(item=null) {
  const editing=Boolean(item);
  const currentImage=item?.images?.find(image=>image.utama)?.url||'';
  openModal(editing?'Ubah data hewan':'Tambah hewan','Perbarui detail dan foto utama hewan.',`<div class="admin-animal-scroll"><form data-form="admin-animal" data-id="${item?.id||''}"><div class="admin-form-grid">
    <label class="field-group">Kategori<select class="field" name="id_kategori" required>${categories.map(category=>`<option value="${category.id_kategori}" ${Number(category.id_kategori)===Number(item?.id_kategori)?'selected':''}>${escapeHtml(category.nama_kategori)}</option>`).join('')}</select></label>
    ${state.sellerSchemaAvailable?`<label class="field-group">Penjual<select class="field" name="id_penjual"><option value="">Tanpa penjual langsung</option>${state.adminSellers.filter(seller=>seller.status==='Aktif').map(seller=>`<option value="${seller.id_penjual}" ${String(item?.id_penjual||'')===String(seller.id_penjual)?'selected':''}>${escapeHtml(seller.nama_toko)}</option>`).join('')}</select></label>`:''}
    <label class="field-group">Nama<input class="field" name="nama" value="${escapeHtml(item?.name||'')}" required /></label>
    <label class="field-group">Jenis<input class="field" name="jenis" value="${escapeHtml(item?.kind||'')}" /></label><label class="field-group">Ras<input class="field" name="ras" value="${escapeHtml(item?.breed||'')}" /></label>
    <label class="field-group">Jenis kelamin<select class="field" name="jenis_kelamin"><option value="">Belum dicantumkan</option><option ${item?.gender==='Jantan'?'selected':''}>Jantan</option><option ${item?.gender==='Betina'?'selected':''}>Betina</option></select></label>
    <label class="field-group">Umur (bulan)<input class="field" name="umur" type="number" min="0" value="${item?.ageMonths??''}" /></label><label class="field-group">Berat (kg)<input class="field" name="berat" type="number" min="0" step="0.01" value="${item?.weight??''}" /></label><label class="field-group">Kondisi kesehatan<input class="field" name="kondisi_kesehatan" value="${escapeHtml(item?.health||'')}" /></label>
    <label class="field-group">Harga (Rp)<input class="field" name="harga" type="number" min="0" step="1" value="${item?.price??''}" required /></label><label class="field-group">Stok<input class="field" name="stok" type="number" min="0" step="1" value="${item?.stockCount??0}" required /></label>
    <label class="field-group">Status<select class="field" name="status">${['Tersedia','Habis','Terjual'].map(status=>`<option ${item?.status===status?'selected':''}>${status}</option>`).join('')}</select></label>
    <div class="admin-animal-photo-editor"><label class="field-group"><span class="form-label">Upload foto hewan</span><input class="field" name="gambar_file" type="file" accept="image/jpeg,image/png,image/webp" data-action="animal-photo-file" /></label><div class="animal-photo-preview" data-animal-photo-preview>${currentImage?`<img src="${escapeHtml(currentImage)}" alt="Foto utama ${escapeHtml(item?.name||'hewan')}" style="width:auto;height:auto;max-width:100%;object-fit:contain" />`:'<span>Pratinjau foto akan muncul di sini</span>'}</div><small>JPG, PNG, atau WebP</small><input type="hidden" name="gambar_url" value="${escapeHtml(currentImage)}" /></div>
    <label class="field-group admin-description">Deskripsi<textarea class="field" name="deskripsi">${escapeHtml(item?.description||'')}</textarea></label></div><div class="modal-footer"><button type="button" class="button button-secondary" data-action="close-modal">Batal</button><div class="right"><button class="button" type="submit">Simpan</button></div></div></form></div>`,'',true,'admin-animal-modal');
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
    <div class="filter-section"><h3>Lokasi penjual</h3><input class="field" type="search" placeholder="Kota atau kabupaten" value="${escapeHtml(f.location)}" data-filter-input="location" /></div>
    <div class="form-row"><div class="filter-section"><label class="form-label" for="filter-gender">Jenis kelamin</label><select class="field" id="filter-gender" data-filter-input="gender"><option value="">Semua</option>${['Jantan','Betina'].map(value=>`<option value="${value}" ${f.gender===value?'selected':''}>${value}</option>`).join('')}</select></div><div class="filter-section"><label class="form-label" for="filter-availability">Ketersediaan</label><select class="field" id="filter-availability" data-filter-input="availability"><option value="">Semua</option>${['Tersedia','Habis','Terjual'].map(value=>`<option value="${value}" ${f.availability===value?'selected':''}>${value}</option>`).join('')}</select></div></div>
    <div class="filter-section"><h3>Kesehatan</h3><div class="chip-options">${healthOptions.map(x=>filterChip(x,f.health.includes(x),'health')).join('')}</div></div>`, `<button class="button-ghost" data-action="reset-filters">Reset semua</button><div class="right"><button class="button button-secondary" data-action="close-modal">Batal</button><button class="button" data-action="apply-filters">Tampilkan ${getFilteredAnimals().length} hewan</button></div>`, true);
}

function filterChip(label, selected, type, value = label) {
  return `<button class="option-chip ${selected?'selected':''}" data-action="filter-option" data-type="${escapeHtml(type)}" data-value="${escapeHtml(value)}">${escapeHtml(label)}${selected?' ✓':''}</button>`;
}

function openModal(title, subtitle, body, footer = '', wide = false, className = '') {
  const root = document.getElementById('modal-root');
  root.innerHTML = `<div class="modal-backdrop" data-action="backdrop"><section class="modal ${wide?'wide':''} ${className}" role="dialog" aria-modal="true" aria-label="${escapeHtml(title)}"><div class="modal-head"><span><h2>${title}</h2>${subtitle?`<p>${subtitle}</p>`:''}</span><button class="modal-close" data-action="close-modal" aria-label="Tutup">${icon('close')}</button></div><div class="modal-body">${body}</div>${footer?`<div class="modal-footer">${footer}</div>`:''}</section></div>`;
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
    <label class="auth-field"><span>${register?'Email':'Email atau nomor HP'}</span><input class="field" name="email" type="${register?'email':'text'}" value="${escapeHtml(email)}" autocomplete="${register?'email':'username'}" placeholder="${register?'contoh: budi@email.com':'Email atau 08xxxxxxxxxx'}" required /></label>
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
  const [addresses,notifications,sellerProfile,sellerChats]=await Promise.allSettled([
    api('/alamat'),api('/notifikasi'),api('/penjual/saya'),api('/chat/penjual'),
  ]);
  state.addresses=addresses.status==='fulfilled'?addresses.value:[];
  state.notifications=notifications.status==='fulfilled'?(notifications.value.items||[]):[];
  state.unreadNotifications=notifications.status==='fulfilled'?Number(notifications.value.unread||0):0;
  state.sellerProfile=sellerProfile.status==='fulfilled'?sellerProfile.value:null;
  state.sellerChats=sellerChats.status==='fulfilled'?sellerChats.value:[];
  if(state.sellerProfile?.status==='Aktif'){
    try{state.sellerInbox=await api('/penjual/saya/chat');}catch{state.sellerInbox=[];}
  }else state.sellerInbox=[];
}

async function loadApp() {
  try {
    [categories, animals] = await Promise.all([api('/kategori'), api('/hewan')]);
    animals = orderCatalog(animals);
    if (state.token) {
      try { await refreshPrivateData(); }
      catch { state.token=''; state.user=null; state.profile=null; sessionStorage.removeItem('mykandang-token'); }
    }
    if(!state.token&&!localStorage.getItem('mykandang-onboarding-complete'))state.page='onboarding';
    render();
    if (!state.token && state.page!=='onboarding' && !document.querySelector('#modal-root .auth-backdrop')) openAuthModal();
  } catch (error) {
    if(!state.token&&!localStorage.getItem('mykandang-onboarding-complete'))state.page='onboarding';
    render();
    if (!state.token && state.page!=='onboarding' && !document.querySelector('#modal-root .auth-backdrop')) openAuthModal();
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
  state.filters = { kinds: [], health: [], min: '', max: '', age: '', location: '', gender: '', availability: '' };
  state.category = 'Semua';
  state.query = '';
  if (state.page === 'catalog') render();
  else renderFiltersModal();
}

function clearFilterChip(label) {
  const f = state.filters;
  f.kinds = f.kinds.filter(x=>x!==label);
  f.health = f.health.filter(x=>x!==label);
  if(label.startsWith('Lokasi: '))f.location='';
  if(label.startsWith('Jenis kelamin: '))f.gender='';
  if(label.startsWith('Ketersediaan: '))f.availability='';
  if(label.startsWith('Umur: '))f.age='';
  if (label.includes(' – ')) { f.min='';f.max=''; }
  if (label==='Ruminansia'||label==='Unggas') state.category='Semua';
  render();
}

function renderChatModal(chat=null,isAdmin=false,options={}) {
  const messages=chat?.messages||[];
  const sellerChat=Boolean(options.sellerId||options.sellerInbox);
  const title=isAdmin?`Chat · ${escapeHtml(chat?.nama||'Pengguna')}`:sellerChat?`Chat · ${escapeHtml(options.title||chat?.nama_toko||chat?.nama||'Penjual')}`:'Chat MyKandang';
  const subtitle=isAdmin?`Percakapan #${chat?.id_chat}.`:sellerChat?'Pesan langsung tersimpan pada akunmu.':'Riwayat pesan tersimpan pada akunmu.';
  const animal=chat?.hewan;
  const image=animal?.foto_url?`<img src="${escapeHtml(animal.foto_url)}" alt="${escapeHtml(animal.nama)}" />`:`<span class="chat-animal-fallback">🐄</span>`;
  const context=animal?`<article class="chat-animal-context">${image}<div><strong>${escapeHtml(animal.nama)}</strong><small>${animal.harga==null?'':formatPrice(Number(animal.harga))}</small><p>${escapeHtml(animal.deskripsi||'Deskripsi hewan belum tersedia.')}</p></div></article>`:'';
  openModal(title,subtitle,`${context}<div class="chat-window"><div class="chat-day">Riwayat pesan</div>${messages.map(msg=>`<div class="chat-bubble ${Number(msg.id_pengirim)===Number(state.user?.id_pengguna)?'mine':''}">${escapeHtml(msg.isi_pesan)}<small>${new Date(msg.waktu_kirim).toLocaleString('id-ID')}</small></div>`).join('')}${messages.length?'':'<p class="small muted">Belum ada pesan.</p>'}</div><form class="chat-form" data-form="chat" data-chat-id="${chat?.id_chat||''}" data-admin="${isAdmin?'true':'false'}" data-seller-id="${options.sellerId||''}" data-seller-inbox="${options.sellerInbox?'true':'false'}"><input class="field" name="message" placeholder="Tulis pesan…" autocomplete="off" required /><button class="button" type="submit" aria-label="Kirim pesan">${icon('arrowRight',17)}</button></form>`,'',false,'chat-modal');
  const chatWindow=document.querySelector('.chat-modal .chat-window');
  if(chatWindow)chatWindow.scrollTop=chatWindow.scrollHeight;
}

function renderAddressModal(address=null,returnPage='addresses') {
  state.currentAddressReturnPage=returnPage;
  openModal(address?'Ubah alamat':'Tambah alamat','Alamat tersimpan bisa dipilih saat konfirmasi pesanan.',`<form data-form="address" data-id="${address?.id_alamat||''}"><label class="field-group"><span class="form-label">Label alamat</span><input class="field" name="label" maxlength="60" value="${escapeHtml(address?.label||'Alamat rumah')}" required /></label><label class="field-group"><span class="form-label">Nama penerima</span><input class="field" name="nama_penerima" maxlength="100" value="${escapeHtml(address?.nama_penerima||state.profile?.nama||'')}" required /></label><label class="field-group"><span class="form-label">Nomor telepon</span><input class="field" name="no_telepon" maxlength="20" value="${escapeHtml(address?.no_telepon||state.profile?.no_telepon||'')}" /></label><label class="field-group"><span class="form-label">Alamat lengkap</span><textarea class="field" name="alamat" maxlength="255" required>${escapeHtml(address?.alamat||'')}</textarea></label><label class="check-row"><input type="checkbox" name="utama" ${address?.utama||!address?'checked':''} /> Jadikan alamat utama</label><div class="modal-footer" style="padding:17px 0 0;margin-top:17px"><button type="button" class="button button-secondary" data-action="close-modal">Batal</button><div class="right"><button class="button" type="submit">Simpan alamat</button></div></div></form>`);
}

function renderProfileEditModal() {
  const p=state.profile;
  openModal('Ubah profil','Perbarui nama dan informasi kontak akunmu. Kelola alamat di menu Alamat tersimpan.',`<form data-form="profile"><div class="field-group" style="margin:0"><label class="form-label">Nama</label><input class="field" name="nama" value="${escapeHtml(p.nama)}" required /></div><div class="field-group"><label class="form-label">Email</label><input class="field" value="${escapeHtml(p.email)}" disabled /></div><div class="field-group"><label class="form-label">Nomor telepon</label><input class="field" name="no_telepon" value="${escapeHtml(p.no_telepon||'')}" /></div><div class="modal-footer" style="padding:17px 0 0;margin-top:17px"><span></span><div class="right"><button type="button" class="button button-secondary" data-action="close-modal">Batal</button><button class="button" type="submit">Simpan</button></div></div></form>`);
}

function startCheckout(id) {
  if (!state.user) { state.pendingAuthAction={type:'checkout',id:Number(id)};openAuthModal();return; }
  state.checkoutItems=[{id_hewan:Number(id),kuantitas:1}];
  const primary=state.addresses.find(address=>address.utama)||state.addresses[0];
  state.checkout={method:'Kirim Kurir',address:primary?.alamat||state.profile?.alamat||'',id_alamat:primary?.id_alamat||'',schedule:suggestedHandoffLocal(),paymentMethod:paymentMethods[0]};
  setPage('checkout');
}

function checkoutCart() {
  if (!state.user) { state.pendingAuthAction={type:'checkout-cart'};openAuthModal();return; }
  state.checkoutItems=state.cart.map(item=>({id_hewan:Number(item.id),kuantitas:Number(item.jumlah)}));
  const primary=state.addresses.find(address=>address.utama)||state.addresses[0];
  state.checkout={method:'Kirim Kurir',address:primary?.alamat||state.profile?.alamat||'',id_alamat:primary?.id_alamat||'',schedule:suggestedHandoffLocal(),paymentMethod:paymentMethods[0]};
  setPage('checkout');
}

async function placeOrder() {
  let createdOrderId=null;
  try {
    const method=state.checkout.method || 'Kirim Kurir';
    const selectedAddressId=method==='Kirim Kurir'?(document.getElementById('checkout-address')?.value||''):'';
    const address=method==='Kirim Kurir' ? (document.getElementById('order-address')?.value.trim() || state.addresses.find(item=>String(item.id_alamat)===String(selectedAddressId))?.alamat || '') : null;
    const scheduleValue=document.getElementById('handoff-schedule')?.value||state.checkout.schedule||'';
    const items=state.checkoutItems;
    if(!scheduleValue){showToast('Pilih jadwal serah-terima terlebih dahulu.');document.getElementById('handoff-schedule')?.focus();return;}
    const schedule=new Date(scheduleValue);
    if(!Number.isFinite(schedule.getTime())){showToast('Jadwal serah-terima tidak valid.');return;}
    if(method==='Kirim Kurir'&&!address){showToast('Alamat pengiriman wajib diisi.');document.getElementById('order-address')?.focus();return;}
    const order=await api('/pesanan',{method:'POST',body:JSON.stringify({metode_serah_terima:method,alamat_pengiriman:address,id_alamat:selectedAddressId||undefined,jadwal_serah_terima:schedule.toISOString(),items})});
    createdOrderId=order.id_pesanan;
    await api(`/pesanan/${order.id_pesanan}/pembayaran`,{method:'POST',body:JSON.stringify({metode:state.checkout.paymentMethod||paymentMethods[0]})});
    await refreshPrivateData();
    state.currentOrder=await api(`/pesanan/${order.id_pesanan}`);
    state.currentOrderId=order.id_pesanan;
    setPage('order-detail');
    showToast('Pesanan dibuat. Pembayaran otomatis terdeteksi.');
  } catch(error) {
    if(createdOrderId){
      try{await refreshPrivateData();state.currentOrder=await api(`/pesanan/${createdOrderId}`);state.currentOrderId=createdOrderId;setPage('order-detail');showToast(`Pesanan tersimpan, tetapi pembayaran belum terdeteksi. ${error.message}`);return;}
      catch{}
    }
    showToast(error.message);
  }
}

async function cancelOrder(id, reason='') {
  try {
    await api(`/pesanan/${id}/batal`,{method:'PATCH',body:JSON.stringify({alasan_pembatalan:reason})});
    await refreshPrivateData();
    state.currentOrder=await api(`/pesanan/${id}`);
    render();
    showToast('Pesanan dibatalkan.');
  } catch(error) { showToast(error.message); }
}

async function savePayment(id) {
  try {
    const savedMethod=paymentMethods.includes(state.currentOrder?.metode_pembayaran)?state.currentOrder.metode_pembayaran:paymentMethods[0];
    await api(`/pesanan/${id}/pembayaran`,{method:'POST',body:JSON.stringify({metode:savedMethod})});
    state.currentOrder=await api(`/pesanan/${id}`);
    state.orders=await api('/pesanan'); render(); showToast('Pembayaran berhasil terdeteksi.');
  } catch(error) { showToast(error.message); }
}

async function sendChat(text, chatId=null, options={}) {
  if (!state.user) { openAuthModal(); return; }
  try {
    if (state.user.role==='staff_admin' && chatId) { await api(`/admin/chat/${chatId}/pesan`,{method:'POST',body:JSON.stringify({isi_pesan:text})}); const chat=await api(`/admin/chat/${chatId}`); renderChatModal(chat,true); }
    else if(options.sellerInbox){await api(`/penjual/saya/chat/${chatId}/pesan`,{method:'POST',body:JSON.stringify({isi_pesan:text})});const chat=await api(`/penjual/saya/chat/${chatId}`);renderChatModal(chat,false,{sellerInbox:true,title:chat.nama});}
    else if(options.sellerId){await api(`/chat/penjual/${options.sellerId}/pesan`,{method:'POST',body:JSON.stringify({isi_pesan:text})});const chat=await api(`/chat/penjual/${options.sellerId}`);renderChatModal(chat,false,{sellerId:options.sellerId,title:chat.nama_toko});}
    else { await api('/chat/pesan',{method:'POST',body:JSON.stringify({isi_pesan:text,id_chat:chatId||undefined})}); const chat=await api(chatId?`/chat?id_chat=${encodeURIComponent(chatId)}`:'/chat'); renderChatModal(chat); }
  }
  catch(error) { showToast(error.message); }
}

async function continuePendingAuthAction(pending) {
  if (!pending) return;
  if (pending.type==='save') return toggleSaved(pending.id);
  if (pending.type==='cart') return addToCart(pending.id,pending.jumlah);
  if (pending.type==='checkout') return startCheckout(pending.id);
  if (pending.type==='checkout-cart') return checkoutCart();
  if (pending.type==='seller-chat') {
    try { const chat=await api(`/chat/penjual/${pending.id}`);renderChatModal(chat,false,{sellerId:pending.id,title:chat.nama_toko}); }
    catch(error) { showToast(error.message); }
    return;
  }
  if (pending.type==='chat') {
    try { const chat=pending.animalId?await api('/chat/context',{method:'POST',body:JSON.stringify({id_hewan:pending.animalId})}):await api('/chat');renderChatModal(chat); }
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
    if (page==='detail') {
      if(state.page!=='seller-profile')state.fromPage=state.page==='saved'?'saved':state.page==='home'?'home':'catalog';
      if(id){try{[state.animalReviews,state.currentAnimalSeller]=await Promise.all([api(`/hewan/${id}/ulasan`),api(`/hewan/${id}/penjual`)]);}catch{state.animalReviews=[];state.currentAnimalSeller=null;}}
    }
    if(page==='seller-profile'&&id){try{state.currentSellerProfile=await api(`/penjual/${id}`);}catch(error){showToast(error.message);return;}}
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
    if(page==='addresses'&&state.user){try{state.addresses=await api('/alamat');}catch(error){showToast(error.message);return;}}
    if(page==='notifications'&&state.user){try{const result=await api('/notifikasi');state.notifications=result.items||[];state.unreadNotifications=Number(result.unread||0);}catch(error){showToast(error.message);return;}}
    if(page==='messages'&&state.user){
      try{state.sellerChats=await api('/chat/penjual');if(state.sellerProfile?.status==='Aktif')state.sellerInbox=await api('/penjual/saya/chat');}
      catch(error){showToast(error.message);return;}
    }
    const slideDirection=pageTarget.hasAttribute('data-nav-slide')?primaryNavSlideDirection(state.page,page):0;
    setPage(page,id&&page==='detail'?{animalId:Number(id)}:{},{slideDirection});
    return;
  }
  const target=event.target.closest('[data-action]');
  if (!target) return;
  const {action,id,value}=target.dataset;
  if (action==='backdrop' && event.target===target) { closeModal(); return; }
  if (action==='close-modal') { closeModal(); return; }
  if (action==='auth') { openAuthModal(); return; }
  if(action==='onboarding-next'||action==='onboarding-skip'){
    if(action==='onboarding-skip'||state.onboardingStep>=2){localStorage.setItem('mykandang-onboarding-complete','true');state.page='home';render();openAuthModal();}
    else{state.onboardingStep+=1;render();}
    return;
  }
  if(action==='address-add'){renderAddressModal(null,'addresses');return;}
  if(action==='address-add-checkout'){renderAddressModal(null,'checkout');return;}
  if(action==='address-edit'){renderAddressModal(state.addresses.find(address=>String(address.id_alamat)===String(id)),'addresses');return;}
  if(action==='address-default'){
    try{await api(`/alamat/${id}/utama`,{method:'PATCH',body:JSON.stringify({})});state.addresses=await api('/alamat');state.profile=await api('/profil');render();showToast('Alamat utama diperbarui.');}
    catch(error){showToast(error.message);}return;
  }
  if(action==='address-delete'){
    openModal('Hapus alamat?','Alamat ini akan dihapus dari daftar alamat tersimpan.',`<p class="confirm-copy">Pesanan sebelumnya tetap menyimpan alamat yang digunakan saat transaksi.</p><div class="modal-footer" style="padding:17px 0 0;margin-top:17px"><button class="button button-secondary" data-action="close-modal">Batal</button><div class="right"><button class="button button-danger" data-action="address-delete-confirm" data-id="${id}">Hapus alamat</button></div></div>`);return;
  }
  if(action==='address-delete-confirm'){
    try{await api(`/alamat/${id}`,{method:'DELETE'});state.addresses=await api('/alamat');state.profile=await api('/profil');closeModal();render();showToast('Alamat dihapus.');}
    catch(error){closeModal();showToast(error.message);}return;
  }
  if(action==='notifications-read-all'){
    try{await api('/notifikasi/semua/dibaca',{method:'PATCH',body:JSON.stringify({})});state.notifications=state.notifications.map(item=>({...item,dibaca:true}));state.unreadNotifications=0;render();}
    catch(error){showToast(error.message);}return;
  }
  if(action==='notification-open'){
    const item=state.notifications.find(notification=>String(notification.id_notifikasi)===String(id));
    try{await api(`/notifikasi/${id}`,{method:'PATCH',body:JSON.stringify({})});if(item&&!item.dibaca){item.dibaca=true;state.unreadNotifications=Math.max(0,state.unreadNotifications-1);}}
    catch(error){showToast(error.message);return;}
    let data=item?.data||{};if(typeof data==='string'){try{data=JSON.parse(data);}catch{data={};}}
    if(data.id_pesanan){try{state.currentOrderId=Number(data.id_pesanan);state.currentOrder=await api(`/pesanan/${data.id_pesanan}`);setPage('order-detail');return;}catch(error){showToast(error.message);}}
    if(data.id_chat){
      try{
        if(state.user?.role==='staff_admin'){
          await loadAdmin();const chat=await api(`/admin/chat/${data.id_chat}`);setPage('admin',{}, {scrollTarget:'admin-conversations'});renderChatModal(chat,true);return;
        }
        if(state.sellerProfile?.status==='Aktif'){
          try{const chat=await api(`/penjual/saya/chat/${data.id_chat}`);renderChatModal(chat,false,{sellerInbox:true,title:chat.nama});return;}catch{}
        }
        const chats=await api('/chat/penjual');const sellerChat=chats.find(chat=>Number(chat.id_chat)===Number(data.id_chat));
        if(sellerChat){const chat=await api(`/chat/penjual/${sellerChat.id_penjual}`);renderChatModal(chat,false,{sellerId:sellerChat.id_penjual,title:chat.nama_toko});return;}
        renderChatModal(await api('/chat'));return;
      }catch(error){showToast(error.message);}
    }
    if(data.id_penjual){setPage('profile');return;}
    render();return;
  }
  if(action==='seller-chat-open'){
    if(!state.user){state.pendingAuthAction={type:'seller-chat',id:Number(id)};openAuthModal();return;}
    try{const chat=await api(`/chat/penjual/${id}`);renderChatModal(chat,false,{sellerId:id,title:chat.nama_toko});}
    catch(error){showToast(error.message);}return;
  }
  if(action==='seller-inbox-open'){
    try{const chat=await api(`/penjual/saya/chat/${id}`);renderChatModal(chat,false,{sellerInbox:true,title:chat.nama});}
    catch(error){showToast(error.message);}return;
  }
  if(action==='admin-seller-status'){
    try{await api(`/admin/penjual/${id}`,{method:'PATCH',body:JSON.stringify({status:value})});await loadAdmin();render();showToast(`Status penjual: ${value}.`);}
    catch(error){showToast(error.message);}return;
  }
  if (action==='auth-mode') { switchAuthMode(value); return; }
  if (action==='toggle-auth-password') {
    const input=document.getElementById('auth-password');
    if (input) { const visible=input.type==='password';input.type=visible?'text':'password';target.textContent=visible?'Sembunyikan':'Tampilkan'; }
    return;
  }
  if (action==='forgot-password') { showToast('Fitur lupa kata sandi belum dikonfigurasi.'); return; }
  if (action==='detail') { state.fromPage=state.page==='seller-profile'?'seller-profile':state.page;state.currentAnimalSeller=null; try { [state.animalReviews,state.currentAnimalSeller]=await Promise.all([api(`/hewan/${id}/ulasan`),api(`/hewan/${id}/penjual`)]); } catch(error) { state.animalReviews=[];state.currentAnimalSeller=null; } setPage('detail',{animalId:Number(id)}); return; }
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
    const animalId=target.hasAttribute('data-chat-context')?Number(state.currentAnimalId)||null:null;
    if (!state.user) { state.pendingAuthAction={type:'chat',animalId};openAuthModal();return; }
    if (state.user.role==='staff_admin') {
      try { await loadAdmin();setPage('admin',{}, {scrollTarget:'admin-conversations'}); }
      catch(error) { showToast(error.message); }
      return;
    }
    try { const chat=animalId?await api('/chat/context',{method:'POST',body:JSON.stringify({id_hewan:animalId})}):await api('/chat');renderChatModal(chat); } catch(error) { showToast(error.message); }
    return;
  }
  if (action==='place-order') { await placeOrder(); return; }
  if (action==='cancel-order') { openModal('Batalkan pesanan?','Pilih alasan agar penjual memahami pembatalan ini.',`<label class="field-group"><span class="form-label">Alasan pembatalan</span><select class="field" id="cancel-reason" required><option value="">Pilih alasan</option><option>Berubah pikiran</option><option>Jadwal serah-terima tidak cocok</option><option>Alamat atau metode serah-terima keliru</option><option>Penjual belum mengonfirmasi</option><option>Menemukan pilihan lain</option><option>Lainnya</option></select></label><label class="field-group"><span class="form-label">Catatan tambahan <small>(opsional)</small></span><textarea class="field" id="cancel-reason-detail" maxlength="400" placeholder="Tambahkan keterangan"></textarea></label><div class="modal-footer" style="padding:17px 0 0;margin-top:17px"><button class="button button-secondary" data-action="close-modal">Kembali</button><div class="right"><button class="button button-danger" data-action="confirm-cancel" data-id="${id}">Batalkan</button></div></div>`); return; }
  if (action==='confirm-cancel') { const reason=document.getElementById('cancel-reason')?.value||''; if(!reason){showToast('Pilih alasan pembatalan terlebih dahulu.');return;}const detail=document.getElementById('cancel-reason-detail')?.value.trim();closeModal();await cancelOrder(id,detail?`${reason}: ${detail}`:reason);return; }
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
  if (action==='seller-apply') { renderSellerApplicationModal(); return; }
  if (action==='logout') {
    try { await api('/auth/logout',{method:'POST'}); } catch {}
    state.token='';state.user=null;state.profile=null;state.saved.clear();state.cart=[];state.orders=[];state.addresses=[];state.notifications=[];state.unreadNotifications=0;state.sellerProfile=null;state.sellerChats=[];state.sellerInbox=[];state.currentOrder=null;sessionStorage.removeItem('mykandang-token');render();showToast('Kamu sudah keluar.');return;
  }
  if (action==='open-search') { setPage('catalog'); document.querySelector('.catalog-search input')?.focus(); return; }
});

document.addEventListener('change', event => {
  const target=event.target;
  if (target.matches('[data-action="animal-photo-file"]')) {
    const file=target.files?.[0];
    if(!file)return;
    if(!['image/jpeg','image/png','image/webp'].includes(file.type)){target.value='';showToast('Pilih foto JPG, PNG, atau WebP.');return;}
    const preview=target.form?.querySelector('[data-animal-photo-preview]');
    if(!preview)return;
    if(preview.dataset.previewUrl)URL.revokeObjectURL(preview.dataset.previewUrl);
    const previewUrl=URL.createObjectURL(file);
    const image=document.createElement('img');
    image.src=previewUrl;
    image.alt=`Pratinjau foto ${file.name}`;
    image.style.width='auto';
    image.style.height='auto';
    image.style.maxWidth='100%';
    image.style.objectFit='contain';
    preview.dataset.previewUrl=previewUrl;
    preview.replaceChildren(image);
    return;
  }
  if (target.matches('[data-action="compare-toggle"]')) { toggleCompare(target.dataset.id,target.checked); return; }
  if (target.matches('[data-change="sort"]')) { state.sort=target.value; render(); return; }
  if (target.matches('[data-change="method"]')) {
    state.checkout.address=document.getElementById('order-address')?.value||state.checkout.address;
    state.checkout.id_alamat=document.getElementById('checkout-address')?.value||state.checkout.id_alamat;
    state.checkout.schedule=document.getElementById('handoff-schedule')?.value||state.checkout.schedule;
    state.checkout.method=target.value;render();return;
  }
  if(target.matches('[data-change="payment-method"]')){
    state.checkout.paymentMethod=target.value;
    document.querySelectorAll('.payment-method-card').forEach(card=>card.classList.toggle('selected',card.contains(target)));
    return;
  }
  if(target.matches('[data-change="checkout-address"]')){state.checkout.id_alamat=target.value;state.checkout.address=state.addresses.find(address=>String(address.id_alamat)===String(target.value))?.alamat||'';render();return;}
  if(target.matches('#handoff-schedule')){state.checkout.schedule=target.value;return;}
  if (target.matches('[data-filter-input]')) { state.filters[target.dataset.filterInput]=target.value; const button=document.querySelector('[data-action="apply-filters"]'); if(button) button.textContent=`Tampilkan ${getFilteredAnimals().length} hewan`; return; }
  if (target.matches('[data-cart-quantity]')) { updateCartQuantity(target.dataset.cartQuantity,target.value); return; }
});

document.addEventListener('submit', async event => {
  const form=event.target;
  if (form.matches('[data-form="search"]')) { event.preventDefault(); submitSearch(form); return; }
  if (form.matches('[data-form="change-password"]')) {
    event.preventDefault();
    const data=Object.fromEntries(new FormData(form).entries());
    if(data.new_password!==data.confirm_password){showToast('Konfirmasi kata sandi baru belum sama.');return;}
    try{await api('/profil/password',{method:'PATCH',body:JSON.stringify(data)});form.reset();showToast('Kata sandi berhasil diperbarui.');}
    catch(error){showToast(error.message);}
    return;
  }
  if (form.matches('[data-form="seller-application"]')) {
    event.preventDefault();
    const data=Object.fromEntries(new FormData(form).entries());
    try{state.sellerProfile=await api('/penjual/saya',{method:'POST',body:JSON.stringify(data)});closeModal();render();showToast(state.sellerProfile.status==='Aktif'?'Profil toko diperbarui.':'Pengajuan toko dikirim untuk ditinjau.');}
    catch(error){showToast(error.message);}
    return;
  }
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
  if (form.matches('[data-form="chat"]')) { event.preventDefault(); const text=form.message.value.trim(); if(text) await sendChat(text,form.dataset.chatId||null,{sellerId:form.dataset.sellerId||'',sellerInbox:form.dataset.sellerInbox==='true'}); return; }
  if(form.matches('[data-form="address"]')){
    event.preventDefault();const data=Object.fromEntries(new FormData(form).entries());data.utama=form.elements.utama.checked;
    const id=form.dataset.id;
    try{
      const address=await api(id?`/alamat/${id}`:'/alamat',{method:id?'PATCH':'POST',body:JSON.stringify(data)});
      state.addresses=await api('/alamat');state.profile=await api('/profil');
      closeModal();
      if(state.currentAddressReturnPage==='checkout'){state.checkout.id_alamat=address.id_alamat;state.checkout.address=address.alamat;setPage('checkout');}
      else setPage('addresses');
      showToast(id?'Alamat diperbarui.':'Alamat tersimpan.');
    }catch(error){showToast(error.message);}return;
  }
  if (form.matches('[data-form="profile"]')) {
    event.preventDefault();const data=Object.fromEntries(new FormData(form).entries());
    try { state.profile=await api('/profil',{method:'PATCH',body:JSON.stringify(data)});state.user=state.profile;closeModal();render();showToast('Profil tersimpan.'); }
    catch(error) { showToast(error.message); }
    return;
  }
  if (form.matches('[data-form="admin-animal"]')) {
    event.preventDefault();
    const data=Object.fromEntries(new FormData(form).entries());
    const photoFile=data.gambar_file;
    delete data.gambar_file;
    const id=form.dataset.id;
    try {
      if(photoFile?.size)data.gambar_url=await uploadAnimalPhoto(photoFile);
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


if(!state.token&&!localStorage.getItem('mykandang-onboarding-complete'))state.page='onboarding';
render();
if (!state.token && state.page!=='onboarding') openAuthModal();
loadApp();
