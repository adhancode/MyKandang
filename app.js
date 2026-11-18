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

const animals = [
  { id: 'limousin', name: 'Sapi Limousin', kind: 'Sapi', category: 'Ruminansia', emoji: '🐄', price: 25000000, age: '2 tahun', weight: '± 450 kg', location: 'Bogor, Jawa Barat', health: 'Sehat', vaccine: 'PMK & Anthrax · Mar 2026', seller: 'Budi Farm', initials: 'BF', rating: 4.9, reviews: 128, note: 'Nafsu makan baik, aktif, dan dirawat langsung di kandang sendiri.', stock: 'Tersedia', gender: 'Jantan' },
  { id: 'etawa', name: 'Kambing Etawa', kind: 'Kambing', category: 'Ruminansia', emoji: '🐐', price: 3750000, age: '1,5 tahun', weight: '± 52 kg', location: 'Purworejo, Jawa Tengah', health: 'Divaksin', vaccine: 'PMK · Feb 2026', seller: 'Tani Makmur', initials: 'TM', rating: 4.8, reviews: 86, note: 'Sehat, sudah divaksin, cocok untuk bibit maupun ternak perah.', stock: 'Tersedia', gender: 'Betina' },
  { id: 'bali', name: 'Sapi Bali', kind: 'Sapi', category: 'Ruminansia', emoji: '🐂', price: 19800000, age: '3 tahun', weight: '± 320 kg', location: 'Semarang, Jawa Tengah', health: 'Sehat', vaccine: 'PMK · Apr 2026', seller: 'Kandang Jaya', initials: 'KJ', rating: 4.8, reviews: 94, note: 'Pemeliharaan teratur dengan pakan hijauan pilihan setiap hari.', stock: 'Tersedia', gender: 'Jantan' },
  { id: 'garut', name: 'Domba Garut', kind: 'Domba', category: 'Ruminansia', emoji: '🐑', price: 4200000, age: '1 tahun', weight: '± 36 kg', location: 'Garut, Jawa Barat', health: 'Sehat', vaccine: 'Cacingan · Mar 2026', seller: 'Pak Asep', initials: 'PA', rating: 5.0, reviews: 63, note: 'Kondisi prima dan terbiasa dengan lingkungan kandang terbuka.', stock: 'Tersedia', gender: 'Jantan' },
  { id: 'bebek', name: 'Bebek Tegal', kind: 'Bebek', category: 'Unggas', emoji: '🦆', price: 50000, age: '5 bulan', weight: '± 1,8 kg', location: 'Boyolali, Jawa Tengah', health: 'Divaksin', vaccine: 'Flu burung · Mei 2026', seller: 'Bumi Unggas', initials: 'BU', rating: 4.9, reviews: 51, note: 'Siap produksi, sudah mendapat vaksin rutin dari peternak.', stock: 'Tersedia', gender: 'Betina' },
  { id: 'kacang', name: 'Kambing Kacang', kind: 'Kambing', category: 'Ruminansia', emoji: '🐐', price: 3100000, age: '1 tahun', weight: '± 29 kg', location: 'Malang, Jawa Timur', health: 'Sehat', vaccine: 'PMK · Apr 2026', seller: 'Pak Rahmat', initials: 'PR', rating: 4.6, reviews: 37, note: 'Lincah, sehat, cocok untuk dibesarkan maupun kebutuhan keluarga.', stock: 'Tersedia', gender: 'Jantan' },
  { id: 'simental', name: 'Sapi Simental', kind: 'Sapi', category: 'Ruminansia', emoji: '🐄', price: 32500000, age: '2,5 tahun', weight: '± 510 kg', location: 'Boyolali, Jawa Tengah', health: 'Divaksin', vaccine: 'PMK & Anthrax · Apr 2026', seller: 'Tani Makmur', initials: 'TM', rating: 4.9, reviews: 72, note: 'Pertumbuhan terpantau baik dengan riwayat vaksin lengkap.', stock: 'Tersedia', gender: 'Jantan' },
  { id: 'ayam', name: 'Ayam Kampung', kind: 'Ayam', category: 'Unggas', emoji: '🐓', price: 88000, age: '6 bulan', weight: '± 1,4 kg', location: 'Wonosobo, Jawa Tengah', health: 'Sehat', vaccine: 'ND · Mei 2026', seller: 'Bumi Unggas', initials: 'BU', rating: 4.7, reviews: 29, note: 'Dipelihara secara semi-umbaran dan aktif bergerak.', stock: 'Tersedia', gender: 'Betina' },
  { id: 'batur', name: 'Domba Batur', kind: 'Domba', category: 'Ruminansia', emoji: '🐑', price: 6800000, age: '1 tahun', weight: '± 49 kg', location: 'Kendal, Jawa Tengah', health: 'Sehat', vaccine: 'PMK · Mar 2026', seller: 'Kandang Jaya', initials: 'KJ', rating: 4.5, reviews: 22, note: 'Sehat dan jinak, tersedia untuk kunjungan sebelum transaksi.', stock: 'Tersedia', gender: 'Jantan' },
  { id: 'boer', name: 'Kambing Boer', kind: 'Kambing', category: 'Ruminansia', emoji: '🐐', price: 6200000, age: '1,5 tahun', weight: '± 61 kg', location: 'Blora, Jawa Tengah', health: 'Divaksin', vaccine: 'PMK · Apr 2026', seller: 'Budi Farm', initials: 'BF', rating: 4.9, reviews: 128, note: 'Postur besar, perawatan dan riwayat kesehatan tercatat.', stock: 'Tersedia', gender: 'Jantan' },
  { id: 'simental2', name: 'Sapi PO', kind: 'Sapi', category: 'Ruminansia', emoji: '🐂', price: 18200000, age: '2,5 tahun', weight: '± 365 kg', location: 'Pekalongan, Jawa Tengah', health: 'Sehat', vaccine: 'PMK · Feb 2026', seller: 'Pak Rahmat', initials: 'PR', rating: 4.6, reviews: 37, note: 'Dipelihara di kandang sendiri, pakan hijauan setiap hari.', stock: 'Tersedia', gender: 'Jantan' },
  { id: 'mojosari', name: 'Bebek Mojosari', kind: 'Bebek', category: 'Unggas', emoji: '🦆', price: 98000, age: '6 bulan', weight: '± 2 kg', location: 'Sumenep, Jawa Timur', health: 'Divaksin', vaccine: 'Flu burung · Mei 2026', seller: 'Bumi Unggas', initials: 'BU', rating: 4.8, reviews: 40, note: 'Bebek siap bertelur, kesehatan dipantau berkala.', stock: 'Tersedia', gender: 'Betina' },
  { id: 'merino', name: 'Domba Merino', kind: 'Domba', category: 'Ruminansia', emoji: '🐑', price: 5100000, age: '1 tahun', weight: '± 42 kg', location: 'Wonosobo, Jawa Tengah', health: 'Sehat', vaccine: 'PMK · Mar 2026', seller: 'Pak Asep', initials: 'PA', rating: 4.8, reviews: 63, note: 'Bulu terawat dan kondisi tubuh proporsional.', stock: 'Sudah terjual', gender: 'Betina' },
];

const addresses = [
  { id: 'home', label: 'Rumah', recipient: 'Fardhan Al Biansya · 0812-3456-7890', address: 'Jl. Melati No. 12, RT 03/RW 05, Kel. Sukamaju, Cibinong, Bogor, Jawa Barat 16914', primary: true },
  { id: 'farm', label: 'Kandang', recipient: 'Pak Rahmat · 0857-1122-3344', address: 'Dusun Krajan, Desa Cibeber, Kec. Cibeber, Kab. Cianjur, Jawa Barat 43262', primary: false },
];

const state = {
  page: 'home',
  fromPage: 'catalog',
  query: '',
  sort: 'Terbaru',
  category: 'Semua',
  filters: { kinds: [], health: [], locations: [], min: '', max: '', age: '' },
  saved: new Set(['garut', 'bali', 'merino']),
  compare: [],
  savedTab: 'Semua',
  currentAnimalId: null,
  currentOrderId: null,
  orders: [],
  addresses,
  selectedAddress: 'home',
  checkout: { method: 'delivery', date: '', time: '08.00–10.00', note: '' },
  profile: { name: 'Fardhan Al Biansya', email: 'fardhanalbiansya17@gmail.com', phone: '0812-3456-7890' },
  reviewRating: 5,
  profileTab: 'akun',
};

const formatPrice = value => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value).replace('IDR', 'Rp').replace(/\u00a0/g, '');
const animalById = id => animals.find(item => item.id === id);
const isSaved = id => state.saved.has(id);
const animalClass = item => item.category === 'Unggas' ? 'unggas' : item.kind === 'Kambing' ? 'kambing' : item.kind === 'Domba' ? 'domba' : '';
const currentOrder = () => state.orders.find(order => order.id === state.currentOrderId);
const navItems = [
  { id: 'home', label: 'Beranda', icon: 'home' },
  { id: 'saved', label: 'Tersimpan', icon: 'heart' },
  { id: 'orders', label: 'Pesanan', icon: 'package' },
  { id: 'profile', label: 'Profil', icon: 'user' },
];

function setPage(page, opts = {}) {
  if (state.page === 'catalog' && page === 'detail') state.fromPage = 'catalog';
  if (page === 'detail' && state.page === 'home') state.fromPage = 'home';
  if (page === 'detail' && state.page === 'saved') state.fromPage = 'saved';
  if (opts.animalId) state.currentAnimalId = opts.animalId;
  if (opts.orderId) state.currentOrderId = opts.orderId;
  state.page = page;
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function navActive(page) {
  if (['catalog','detail','compare'].includes(page)) return 'home';
  if (page === 'checkout' || page === 'order-detail' || page === 'review') return 'orders';
  return page;
}

function renderShell() {
  const topbar = document.getElementById('topbar');
  const desktopItems = [navItems[0], { id: 'catalog', label: 'Daftar hewan' }, ...navItems.slice(1)];
  topbar.innerHTML = `<div class="topbar-inner">
    <a class="brand" href="#" data-page="home" aria-label="MyKandang Beranda"><span class="brand-mark"><img src="assets/mykandang-logo-clean.png?v=2" alt="" /></span><span class="brand-word">My<span>Kandang</span></span></a>
    <nav class="main-nav" aria-label="Navigasi utama">${desktopItems.map(item => `<button class="nav-link ${(item.id==='catalog' ? state.page==='catalog' : navActive(state.page)===item.id) ? 'active' : ''}" data-page="${item.id}">${item.label}</button>`).join('')}</nav>
    <div class="top-actions">
      <button class="icon-button" aria-label="Cari hewan" data-action="open-search">${icon('search')}</button>
      <button class="icon-button" aria-label="Bandingkan hewan" data-page="compare">${icon('grid')}${state.compare.length ? `<span class="bag-count">${state.compare.length}</span>` : ''}</button>
      <button class="avatar-button" aria-label="Buka profil" data-page="profile">FB</button>
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
    saved: renderSaved,
    orders: renderOrders,
    profile: renderProfile,
    detail: renderDetail,
    compare: renderCompare,
    checkout: renderCheckout,
    'order-detail': renderOrderDetail,
    review: renderReview,
  };
  main.innerHTML = (pages[state.page] || renderHome)();
  renderCompareBar();
}

function renderHome() {
  const latest = [...animals].slice(0, 4);
  return `<section class="page">
    <div class="hero">
      <div class="hero-copy">
        <span class="eyebrow">Pasar ternak pilihan keluarga Indonesia</span>
        <h1>Temukan ternak sehat,<br /><em>langsung dari peternak.</em></h1>
        <p>Jelajahi sapi, kambing, domba, dan unggas dari peternak terpercaya. Informasi jelas, pilihan lebih yakin.</p>
        <form class="searchbar" data-form="search"><span>${icon('search')}</span><input name="query" placeholder="Cari sapi, kambing, domba…" aria-label="Cari hewan" /><button class="button" type="submit">Cari hewan</button></form>
        <div class="hero-notes"><span>${icon('shield',14)} Peternak terkurasi</span><span>${icon('check',14)} Info kesehatan jelas</span><span>${icon('eye',14)} Lihat sebelum memilih</span></div>
      </div>
    </div>
    <section class="section">
      <div class="section-heading"><div><span class="eyebrow">Temukan kebutuhanmu</span><h2>Jelajahi kategori</h2></div><button class="text-link" data-page="catalog">Lihat semua hewan ${icon('chevron',13)}</button></div>
      <div class="category-grid">
        ${[['Sapi','🐄','Daging & bibit','Ruminansia'],['Kambing','🐐','Perah & ternak','Ruminansia'],['Domba','🐑','Pilihan peternak','Ruminansia'],['Unggas','🦆','Ayam & bebek','Unggas']].map(([name,emoji,sub,category]) => `<button class="category-card" data-category="${category}" data-kind="${name}"><span class="category-icon">${emoji}</span><span><strong>${name}</strong><small>${sub}</small></span>${icon('chevron',15)}</button>`).join('')}
      </div>
    </section>
    <section class="section">
      <div class="section-heading"><div><span class="eyebrow">Pilihan terbaru</span><h2>Hewan terbaru</h2><p class="subtle small" style="margin:5px 0 0">Temukan ternak sehat yang baru bergabung.</p></div><button class="text-link" data-page="catalog">Lihat semua ${icon('chevron',13)}</button></div>
      <div class="animal-grid">${latest.map(item => animalCard(item)).join('')}</div>
    </section>
    <div class="trust-strip">
      <div class="trust-item"><span class="trust-icon">${icon('shield')}</span><span><strong>Informasi transparan</strong><small>Umur dan kesehatan dijelaskan penjual.</small></span></div>
      <div class="trust-item"><span class="trust-icon">${icon('grid')}</span><span><strong>Bandingkan dengan mudah</strong><small>Pilih hingga 3 ternak berdampingan.</small></span></div>
      <div class="trust-item"><span class="trust-icon">${icon('message')}</span><span><strong>Terhubung langsung</strong><small>Tanyakan detail pada peternak.</small></span></div>
    </div>
  </section>`;
}

function animalCard(item) {
  const typeClass = animalClass(item);
  return `<article class="animal-card">
    <div class="animal-image ${typeClass}" data-action="detail" data-id="${item.id}" role="button" tabindex="0" aria-label="Lihat ${item.name}">
      <span class="image-badge"><span class="pill ${item.stock==='Tersedia'?'white':'red'}"><i class="pill-dot"></i> ${item.stock}</span></span>
      <span class="animal-emoji" aria-hidden="true">${item.emoji}</span>
      <button class="save-button ${isSaved(item.id) ? 'saved' : ''}" data-action="save" data-id="${item.id}" aria-label="${isSaved(item.id) ? 'Hapus dari tersimpan' : 'Simpan hewan'}">${icon('heart')}</button>
    </div>
    <div class="animal-info">
      <div class="animal-title-row"><button class="animal-title" data-action="detail" data-id="${item.id}">${item.name}</button><span class="pill ${item.health === 'Divaksin' ? '' : 'gray'}">${item.health}</span></div>
      <div class="animal-price">${formatPrice(item.price)}</div>
      <div class="animal-meta"><span>${item.age}</span><i class="divider"></i><span>${item.location.split(',')[0]}</span></div>
      <div class="seller-rating"><span>${icon('user',12)} ${item.seller}</span><span class="stars">★ ${item.rating.toFixed(1)}</span></div>
      <div class="card-bottom"><label class="compare-toggle"><input type="checkbox" data-action="compare-toggle" data-id="${item.id}" ${state.compare.includes(item.id) ? 'checked' : ''} /> Bandingkan</label><button class="card-detail-link" data-action="detail" data-id="${item.id}">Lihat detail ${icon('chevron',12)}</button></div>
    </div>
  </article>`;
}

function getFilteredAnimals() {
  const f = state.filters;
  let list = animals.filter(item => {
    const q = state.query.trim().toLocaleLowerCase('id');
    if (q && ![item.name,item.kind,item.category,item.seller,item.location].join(' ').toLocaleLowerCase('id').includes(q)) return false;
    if (state.category !== 'Semua' && item.category !== state.category) return false;
    if (f.kinds.length && !f.kinds.includes(item.kind)) return false;
    if (f.health.length && !f.health.includes(item.health)) return false;
    if (f.locations.length && !f.locations.some(loc => item.location.includes(loc))) return false;
    if (f.min && item.price < Number(f.min)) return false;
    if (f.max && item.price > Number(f.max)) return false;
    if (f.age === 'under1' && parseFloat(item.age) >= 1) return false;
    if (f.age === '1to2' && !(parseFloat(item.age) >= 1 && parseFloat(item.age) <= 2)) return false;
    if (f.age === 'over2' && parseFloat(item.age) <= 2) return false;
    return true;
  });
  if (state.sort === 'Termurah') list.sort((a,b) => a.price-b.price);
  if (state.sort === 'Termahal') list.sort((a,b) => b.price-a.price);
  if (state.sort === 'Rating tertinggi') list.sort((a,b) => b.rating-a.rating);
  return list;
}

function renderFilterChips() {
  const f = state.filters;
  const chips = [];
  if (state.category !== 'Semua') chips.push([state.category, () => { state.category='Semua'; render(); }]);
  f.kinds.forEach(kind => chips.push([kind, () => { f.kinds=f.kinds.filter(v=>v!==kind); render(); }]));
  f.health.forEach(v => chips.push([v, () => { f.health=f.health.filter(x=>x!==v); render(); }]));
  f.locations.forEach(v => chips.push([v, () => { f.locations=f.locations.filter(x=>x!==v); render(); }]));
  if (f.min || f.max) chips.push([`${f.min ? formatPrice(Number(f.min)) : 'Rp0'} – ${f.max ? formatPrice(Number(f.max)) : 'bebas'}`, () => { f.min='';f.max='';render(); }]);
  if (!chips.length) return '';
  return `<div class="filter-chips">${chips.map(([label]) => `<button class="filter-chip" data-action="clear-chip" data-label="${label}">${label} ×</button>`).join('')}<button class="text-link" data-action="reset-filters">Hapus semua</button></div>`;
}

function renderCatalog() {
  const list = getFilteredAnimals();
  const activeCount = state.filters.kinds.length + state.filters.health.length + state.filters.locations.length + (state.filters.min||state.filters.max ? 1 : 0) + (state.filters.age ? 1 : 0);
  return `<section class="page">
    <div class="page-header"><div><span class="eyebrow">Pasar hewan</span><h1>Daftar hewan</h1><p>Pilih ternak sehat langsung dari peternak terpercaya.</p></div>
      <div class="catalog-controls">
        <form class="catalog-search" data-form="search">${icon('search')}<input name="query" value="${escapeHtml(state.query)}" placeholder="Cari hewan atau kata kunci…" aria-label="Cari hewan" /></form>
        <button class="button button-secondary button-small" data-action="filters">${icon('sliders')} Filter ${activeCount ? `<span class="pill">${activeCount}</span>` : ''}</button>
        <select class="select-control" data-change="sort" aria-label="Urutkan hewan"><option ${state.sort==='Terbaru'?'selected':''}>Terbaru</option><option ${state.sort==='Termurah'?'selected':''}>Termurah</option><option ${state.sort==='Termahal'?'selected':''}>Termahal</option><option ${state.sort==='Rating tertinggi'?'selected':''}>Rating tertinggi</option></select>
      </div>
    </div>
    ${renderFilterChips()}
    <div class="catalog-meta"><span><strong>${list.length} hewan</strong> ditemukan</span><span>Ruminansia · Unggas</span></div>
    ${list.length ? `<div class="animal-grid">${list.map(animalCard).join('')}</div>` : `<div class="empty-state"><div class="empty-illustration">🔎</div><h3>Belum ada hewan yang cocok</h3><p>Coba ubah kata pencarian atau atur ulang filter.</p><button class="button button-secondary" data-action="reset-filters">Hapus filter</button></div>`}
  </section>`;
}

function renderSaved() {
  const savedList = [...state.saved].map(animalById).filter(Boolean);
  const visible = state.savedTab === 'Tersedia' ? savedList.filter(item => item.stock === 'Tersedia') : state.savedTab === 'Sudah terjual' ? savedList.filter(item => item.stock !== 'Tersedia') : savedList;
  return `<section class="page">
    <div class="saved-head"><div><span class="eyebrow">Koleksi pilihanmu</span><h1>Hewan tersimpan</h1><p class="subtle" style="margin:5px 0 0">Simpan ternak menarik dan lihat lagi kapan saja.</p></div>
      <div class="tabs">${['Semua','Tersedia','Sudah terjual'].map(tab => `<button class="tab ${state.savedTab===tab?'active':''}" data-action="saved-tab" data-value="${tab}">${tab}${tab==='Semua' ? ` · ${savedList.length}` : ''}</button>`).join('')}</div>
    </div>
    ${visible.length ? `<div class="animal-grid">${visible.map(animalCard).join('')}</div>` : `<div class="empty-state"><div class="empty-illustration">♡</div><h3>${state.savedTab==='Sudah terjual'?'Belum ada hewan terjual':'Belum ada hewan tersimpan'}</h3><p>Jelajahi daftar hewan dan simpan pilihan yang menarik bagimu.</p><button class="button" data-page="catalog">Jelajahi hewan ${icon('arrowRight',15)}</button></div>`}
  </section>`;
}

function renderOrders() {
  const orders = [...state.orders].reverse();
  return `<section class="page">
    <div class="page-header"><div><span class="eyebrow">Transaksi kamu</span><h1>Pesanan</h1><p>Pantau konfirmasi dan jadwal serah terima ternak.</p></div></div>
    ${orders.length ? `<div class="order-list">${orders.map(order => {
      const item = animalById(order.animalId);
      return `<article class="order-card"><div class="order-thumb">${item?.emoji || '🐄'}</div><div class="order-main"><span class="pill ${order.status==='Dibatalkan'?'red':''}">${order.status}</span><h3>${item?.name || 'Hewan ternak'}</h3><p>No. Pesanan ${order.id} · ${order.created}</p><p>${order.quantity} ekor · ${order.method==='delivery'?'Antar ke lokasi pembeli':'Ambil di peternakan'}</p></div><div class="order-actions"><div><div class="order-price">${formatPrice(order.total)}</div><button class="button button-secondary button-small" data-action="order-detail" data-id="${order.id}">Lihat pesanan</button></div></div></article>`;
    }).join('')}</div>` : `<div class="empty-state"><div class="empty-illustration">📦</div><h3>Belum ada pesanan</h3><p>Pesanan yang kamu konfirmasi akan muncul di sini.</p><button class="button" data-page="catalog">Cari hewan ${icon('arrowRight',15)}</button></div>`}
  </section>`;
}

function renderDetail() {
  const item = animalById(state.currentAnimalId) || animals[0];
  const from = state.fromPage === 'saved' ? 'saved' : state.fromPage === 'home' ? 'home' : 'catalog';
  return `<section class="page">
    <button class="back-link" data-page="${from}">${icon('arrow')} Kembali ke ${from==='saved'?'tersimpan':from==='home'?'beranda':'daftar hewan'}</button>
    <div class="detail-layout">
      <div><div class="detail-photo ${animalClass(item)}"><span class="photo-tag pill ${item.stock==='Tersedia'?'white':'red'}"><i class="pill-dot"></i> ${item.stock}</span><span class="animal-emoji">${item.emoji}</span></div>
        <div class="section" style="margin-top:22px"><div class="section-heading"><div><span class="eyebrow">Informasi ternak</span><h2>Detail hewan</h2></div></div>
          <div class="spec-grid"><div class="spec-card"><span>Umur</span><strong>${item.age}</strong></div><div class="spec-card"><span>Berat perkiraan</span><strong>${item.weight}</strong></div><div class="spec-card"><span>Jenis kelamin</span><strong>${item.gender}</strong></div><div class="spec-card"><span>Lokasi ternak</span><strong>${item.location}</strong></div></div>
          <div class="health-note"><strong>${icon('shield',14)} Kondisi dan kesehatan</strong>${item.note} Vaksinasi: ${item.vaccine}. <span class="muted">Informasi kesehatan berasal dari penjual.</span></div>
        </div>
      </div>
      <div class="detail-summary">
        <span class="pill">${item.kind} · ${item.category}</span><h1>${item.name} ${item.gender}</h1>
        <div class="detail-meta"><span>${icon('pin',14)} ${item.location}</span><span class="compare-rating">★</span><strong>${item.rating.toFixed(1)}</strong><span class="muted">(${item.reviews} ulasan penjual)</span></div>
        <div class="detail-price">${formatPrice(item.price)} <small class="muted" style="font:500 11px 'DM Sans'">/ ekor</small></div>
        <p class="subtle small">Harga dan kondisi hewan dapat dikonfirmasi langsung kepada penjual sebelum serah terima.</p>
        <div class="detail-divider"></div>
        <div class="seller-box"><div class="seller-box-head"><div class="seller-person"><span class="seller-avatar">${item.initials}</span><span><strong>${item.seller}</strong><small>${icon('pin',11)} ${item.location.split(',')[0]} · Aktif hari ini</small></span></div><button class="button-ghost" data-action="seller-profile">Profil ${icon('chevron',12)}</button></div>
          <div class="seller-stats"><span><strong>★ ${item.rating.toFixed(1)}</strong>${item.reviews} ulasan</span><span><strong>96%</strong>Puas dengan penjual</span><span><strong>&lt; 1 jam</strong>Waktu balas rata-rata</span></div>
        </div>
        <div class="detail-actions"><button class="button" data-action="checkout" data-id="${item.id}" ${item.stock==='Tersedia'?'':'disabled'}>${item.stock==='Tersedia'?'Pesan hewan':'Sudah terjual'} ${icon('arrowRight',15)}</button><button class="button button-secondary" data-action="chat" data-id="${item.id}">${icon('message')} Chat</button><button class="icon-button ${isSaved(item.id)?'saved':''}" data-action="save" data-id="${item.id}" aria-label="Simpan hewan">${icon('heart')}</button></div>
        <p class="small muted" style="margin-top:12px">${icon('shield',12)} Pembayaran dan jadwal dibicarakan setelah penjual mengonfirmasi.</p>
      </div>
    </div>
    <section class="section"><div class="section-heading"><div><span class="eyebrow">Mungkin cocok untukmu</span><h2>Hewan serupa</h2></div><button class="text-link" data-page="catalog">Lihat semua</button></div><div class="animal-grid">${animals.filter(a=>a.id!==item.id).slice(0,4).map(animalCard).join('')}</div></section>
  </section>`;
}

function renderCompare() {
  const items = state.compare.map(animalById).filter(Boolean);
  if (!items.length) return `<section class="page"><button class="back-link" data-page="catalog">${icon('arrow')} Kembali ke daftar hewan</button><div class="page-header"><div><span class="eyebrow">Pilih dengan yakin</span><h1>Bandingkan hewan</h1><p>Pilih hingga 3 ternak untuk melihat informasi berdampingan.</p></div></div><div class="empty-state"><div class="empty-illustration">⚖️</div><h3>Belum ada hewan untuk dibandingkan</h3><p>Pilih kotak “Bandingkan” pada kartu hewan. Kamu bisa memilih maksimal 3.</p><button class="button" data-page="catalog">Pilih hewan</button></div></section>`;
  const rows = [['Harga', item=>formatPrice(item.price)],['Umur',item=>item.age],['Berat',item=>item.weight],['Jenis kelamin',item=>item.gender],['Kesehatan',item=>item.health],['Vaksinasi',item=>item.vaccine],['Lokasi',item=>item.location],['Rating penjual',item=>`<span class="compare-rating">★</span> ${item.rating.toFixed(1)} · ${item.reviews} ulasan`],['Ketersediaan',item=>item.stock]];
  return `<section class="page"><button class="back-link" data-page="catalog">${icon('arrow')} Kembali ke daftar hewan</button>
    <div class="page-header"><div><span class="eyebrow">Pilih dengan yakin</span><h1>Bandingkan hewan</h1><p>Bandingkan maksimal 3 ternak berdasarkan harga, umur, kesehatan, dan penjual.</p></div><button class="button button-secondary button-small" data-page="catalog">Tambah hewan ${icon('plus',14)}</button></div>
    <div class="compare-wrap"><table class="compare-table"><tbody>
      <tr><th>Hewan pilihan</th>${items.map(item=>`<td><div class="compare-animal"><div class="compare-emoji">${item.emoji}</div><strong>${item.name}</strong><button class="card-detail-link" data-action="detail" data-id="${item.id}">Lihat detail ${icon('chevron',12)}</button><button class="button-ghost" data-action="remove-compare" data-id="${item.id}">Hapus dari perbandingan</button></div></td>`).join('')}${items.length<3?'<td><button class="button button-secondary button-small" data-page="catalog">+ Tambah hewan</button></td>':''}</tr>
      ${rows.map(([label,fn])=>`<tr><th>${label}</th>${items.map(item=>`<td class="compare-value ${label==='Harga'?'price':''}">${fn(item)}</td>`).join('')}${items.length<3?'<td class="compare-value muted">Pilih hewan</td>':''}</tr>`).join('')}
    </tbody></table></div><p class="compare-note">ⓘ Umur dan kesehatan merupakan informasi dari penjual. Rating menampilkan ulasan pembeli setelah transaksi.</p>
  </section>`;
}

function getSelectedAddress() { return state.addresses.find(item=>item.id===state.selectedAddress) || state.addresses[0]; }
function getShippingCost() { return state.checkout.method === 'delivery' ? 750000 : 0; }

function renderCheckout() {
  const item = animalById(state.currentAnimalId) || animals[0];
  const ship = getShippingCost();
  const total = item.price + ship;
  const address = getSelectedAddress();
  return `<section class="page"><button class="back-link" data-page="detail">${icon('arrow')} Kembali ke detail hewan</button><div class="page-header"><div><span class="eyebrow">Langkah terakhir sebelum pesanan</span><h1>Ringkasan pesanan</h1><p>Atur serah terima dan konfirmasi detail pesananmu.</p></div></div>
    <div class="checkout-layout"><div class="checkout-stack">
      <section class="panel"><div class="panel-head"><div class="panel-label"><span class="step-number">1</span><h3>Lokasi serah terima</h3></div><button class="button-ghost" data-action="manage-addresses">Ubah alamat</button></div>
        <div class="address-card selected"><input type="radio" checked aria-label="Alamat terpilih" /><div><strong>${address.label} · ${address.recipient}</strong><p>${address.address}</p></div></div>
        <div class="info-callout">Alamat ini digunakan sebagai tujuan pengantaran. Penjual akan mengonfirmasi biaya dan jadwal secara langsung.</div>
      </section>
      <section class="panel"><div class="panel-head"><div class="panel-label"><span class="step-number">2</span><h3>Pilih metode serah terima</h3></div></div>
        <div class="radio-list">
          <label class="choice-card ${state.checkout.method==='delivery'?'selected':''}"><input type="radio" name="method" value="delivery" data-change="method" ${state.checkout.method==='delivery'?'checked':''}/><span class="choice-icon">🚚</span><span class="choice-copy"><strong>Antar ke lokasi pembeli</strong><small>Penjual mengantar hewan ke alamat pilihanmu. Jadwal dan biaya akan dikonfirmasi.</small></span><span class="choice-price">Estimasi Rp750.000</span></label>
          <label class="choice-card ${state.checkout.method==='pickup'?'selected':''}"><input type="radio" name="method" value="pickup" data-change="method" ${state.checkout.method==='pickup'?'checked':''}/><span class="choice-icon">📍</span><span class="choice-copy"><strong>Ambil di lokasi peternak</strong><small>Atur waktu kunjungan dan pengambilan dengan penjual.</small></span><span class="choice-price">Rp0</span></label>
        </div>
        <div class="form-row"><div class="field-group"><label class="form-label" for="delivery-date">Tanggal yang diinginkan</label><input class="field" type="date" id="delivery-date" data-checkout="date" value="${state.checkout.date}" /></div><div class="field-group"><label class="form-label" for="delivery-time">Waktu</label><select class="field" id="delivery-time" data-checkout="time"><option>08.00–10.00</option><option>10.00–12.00</option><option>13.00–15.00</option><option>15.00–17.00</option></select></div></div>
        <div class="field-group"><label class="form-label" for="order-note">Catatan untuk penjual <span class="muted">(opsional)</span></label><textarea class="field" id="order-note" data-checkout="note" placeholder="Contoh: kabari saya 1 jam sebelum berangkat">${escapeHtml(state.checkout.note)}</textarea></div>
      </section>
      <section class="panel"><div class="panel-head"><div class="panel-label"><span class="step-number">3</span><h3>Konfirmasi pesanan</h3></div></div><p class="subtle small" style="margin:0">Pesanan ini akan dikirim ke <strong>${item.seller}</strong>. Penjual akan mengonfirmasi ketersediaan, biaya transportasi, dan waktu serah terima.</p></section>
    </div>
    <aside class="panel"><div class="panel-head"><h3>Detail pesanan</h3></div><div class="summary-product"><div class="summary-thumb">${item.emoji}</div><span><strong>${item.name} ${item.gender}</strong><small>${item.age} · ${item.location}</small><small>Penjual: ${item.seller}</small></span></div><div class="summary-lines"><div class="summary-line"><span>Jumlah</span><strong>1 ekor</strong></div><div class="summary-line"><span>Harga hewan</span><strong>${formatPrice(item.price)}</strong></div><div class="summary-line"><span>Ongkir <small>(estimasi)</small></span><strong>${formatPrice(ship)}</strong></div></div><div class="summary-total"><span>Total estimasi</span><strong>${formatPrice(total)}</strong></div><div class="info-callout">Biaya transportasi masih berupa estimasi dan perlu dikonfirmasi oleh penjual.</div><button class="button button-block" data-action="place-order">Kirim permintaan pesanan ${icon('arrowRight',15)}</button><p class="small muted" style="text-align:center;line-height:1.5;margin:11px 0 0">Belum ada pembayaran. Detail akhir dibicarakan dengan penjual.</p></aside>
    </div>
  </section>`;
}

const orderStages = [
  ['Menunggu konfirmasi','Pesanan dikirim ke penjual. Tunggu konfirmasi ketersediaan dan jadwal.'],
  ['Dikonfirmasi','Penjual menyetujui pesanan dan mengonfirmasi biaya serta jadwal.'],
  ['Sedang diantar','Hewan sedang menuju lokasi serah terima.'],
  ['Selesai','Hewan sudah diterima dan pesanan selesai.'],
];

function renderOrderDetail() {
  const order = currentOrder();
  if (!order) return renderOrders();
  const item = animalById(order.animalId) || animals[0];
  const cancelled = order.status === 'Dibatalkan';
  const stage = order.stage;
  const statusText = cancelled ? 'Pesanan dibatalkan' : order.status;
  const statusMessage = cancelled ? 'Pesanan ini sudah dibatalkan dan penjual telah diberi tahu.' : orderStages[stage][1];
  const stepButton = stage===0 ? 'Simulasikan konfirmasi penjual' : stage===1 ? 'Simulasikan hewan diantar' : stage===2 ? 'Tandai pesanan selesai' : '';
  return `<section class="page"><button class="back-link" data-page="orders">${icon('arrow')} Kembali ke pesanan</button><div class="page-header"><div><span class="eyebrow">No. pesanan ${order.id}</span><h1>Status pesanan</h1><p>Dipesan ${order.created}</p></div><span class="pill ${cancelled?'red':''}">${statusText}</span></div>
    <div class="status-layout"><div><div class="status-banner"><span class="status-icon">${cancelled?'↩':'✓'}</span><span><strong>${statusText}</strong><p>${statusMessage}</p></span></div>
      <section class="panel"><div class="panel-head"><h3>Progres pesanan</h3><span class="small muted">${cancelled?'Dibatalkan':`${Math.min(stage+1,4)} dari 4 tahap`}</span></div>
        ${cancelled ? `<p class="subtle small">Alasan: ${escapeHtml(order.cancelReason || 'Berubah pikiran')}</p>` : `<div class="timeline">${orderStages.map(([title,desc],i)=>`<div class="timeline-step ${i<stage?'done':''} ${i===stage?'current':''}"><span class="timeline-node">${i<stage?'✓':i+1}</span><span class="timeline-copy"><strong>${title}</strong><p>${desc}</p>${i===0&&i<=stage?`<time>${order.created}</time>`:''}</span></div>`).join('')}</div>`}
        ${!cancelled && stage<3 ? `<div class="demo-note">Ini prototipe alur MyKandang. Tombol langkah berikutnya hanya untuk mencoba tahapan yang biasanya diperbarui penjual.</div><div class="status-actions"><button class="button" data-action="advance-order" data-id="${order.id}">${stepButton} ${icon('arrowRight',14)}</button>${stage===0?`<button class="button button-danger" data-action="cancel-order" data-id="${order.id}">Batalkan pesanan</button>`:''}</div>` : ''}
        ${!cancelled && stage===3 ? `<div class="status-actions"><button class="button" data-action="write-review" data-id="${order.id}">Beri ulasan ${icon('star',14)}</button><button class="button button-secondary" data-action="chat" data-id="${item.id}">Chat penjual</button></div>`:''}
        ${cancelled ? `<div class="status-actions"><button class="button button-secondary" data-page="catalog">Cari hewan serupa</button></div>`:''}
      </section>
    </div><aside class="panel"><div class="panel-head"><h3>Rincian hewan</h3></div><div class="summary-product"><div class="summary-thumb">${item.emoji}</div><span><strong>${item.name} ${item.gender}</strong><small>${order.quantity} ekor · ${formatPrice(item.price)}</small><small>Penjual: ${item.seller}</small></span></div><div class="detail-divider"></div><div class="receipt-row"><span>Metode</span><strong>${order.method==='delivery'?'Antar ke lokasi pembeli':'Ambil di peternakan'}</strong></div><div class="receipt-row"><span>Lokasi</span><strong style="text-align:right;max-width:60%">${escapeHtml(order.address)}</strong></div><div class="receipt-row"><span>Jadwal diajukan</span><strong>${order.dateLabel} · ${order.time}</strong></div><div class="receipt-row"><span>Harga hewan</span><strong>${formatPrice(item.price)}</strong></div><div class="receipt-row"><span>Ongkir (estimasi)</span><strong>${formatPrice(order.shipping)}</strong></div><div class="receipt-row total"><span>Total estimasi</span><strong>${formatPrice(order.total)}</strong></div>${order.note?`<div class="info-callout">Catatan: ${escapeHtml(order.note)}</div>`:''}</aside></div>
  </section>`;
}

function renderReview() {
  const order = currentOrder();
  const item = order ? animalById(order.animalId) : animals[0];
  if (!order || order.stage < 3) return renderOrders();
  if (order.reviewed) return `<section class="page"><button class="back-link" data-page="order-detail" data-id="${order.id}">${icon('arrow')} Kembali ke status pesanan</button><div class="empty-state"><div class="empty-illustration">⭐</div><h3>Ulasanmu sudah terkirim</h3><p>Terima kasih sudah berbagi pengalaman dengan pembeli lain.</p><button class="button" data-page="orders">Kembali ke pesanan</button></div></section>`;
  return `<section class="page"><button class="back-link" data-page="order-detail" data-id="${order.id}">${icon('arrow')} Kembali ke status pesanan</button><div class="page-header"><div><span class="eyebrow">Transaksi selesai</span><h1>Bagaimana pengalamanmu?</h1><p>Bantu pembeli lain mengenal ${item?.seller || 'penjual'} lebih baik.</p></div></div><div class="panel" style="max-width:650px"><div class="summary-product"><div class="summary-thumb">${item?.emoji || '🐄'}</div><span><strong>${item?.name || 'Hewan ternak'}</strong><small>Penjual: ${item?.seller || 'Peternak'}</small><small>Serah terima selesai</small></span></div><div class="detail-divider"></div><label class="form-label">Berikan rating untuk penjual</label><div class="review-stars">${[1,2,3,4,5].map(i=>`<button class="star-button ${i<=state.reviewRating?'active':''}" data-action="rating" data-value="${i}" aria-label="${i} bintang">★</button>`).join('')}</div><label class="form-label" for="review-copy">Ceritakan pengalamanmu</label><textarea class="field" id="review-copy" placeholder="Bagaimana kondisi hewan dan proses serah terimanya?" style="min-height:110px"></textarea><div class="field-group"><label class="form-label" for="review-photos">Tambah foto <span class="muted">(opsional)</span></label><input class="field" id="review-photos" type="file" accept="image/*" multiple /></div><button class="button button-block" style="margin-top:17px" data-action="submit-review" data-id="${order.id}">Kirim ulasan ${icon('arrowRight',14)}</button></div></section>`;
}

function renderProfile() {
  const p = state.profile;
  const menu = [['akun','Profil & akun','user'],['alamat','Alamat saya','pin'],['notifications','Notifikasi','bell'],['security','Keamanan akun','shield']];
  let content = '';
  if (state.profileTab === 'akun') content = `<section class="panel"><div class="panel-head"><h3>Informasi pribadi</h3><button class="button-ghost" data-action="edit-profile">${icon('edit',14)} Ubah</button></div><div class="profile-data"><div class="data-item"><span>Nama lengkap</span><strong>${escapeHtml(p.name)}</strong></div><div class="data-item"><span>Email</span><strong>${escapeHtml(p.email)}</strong></div><div class="data-item"><span>Nomor handphone</span><strong>${escapeHtml(p.phone)}</strong></div><div class="data-item"><span>Member sejak</span><strong>2026</strong></div></div></section>
    <section class="panel"><div class="panel-head"><h3>Alamat serah terima</h3><button class="button-ghost" data-action="manage-addresses">Kelola alamat ${icon('chevron',12)}</button></div><div class="address-list">${state.addresses.slice(0,2).map(addressEntry).join('')}</div></section>
    <section class="panel"><div class="panel-head"><h3>Mulai berjualan</h3></div><p class="subtle small">Jual hewan ternakmu di MyKandang dan temukan pembeli baru.</p><button class="button button-secondary button-small" data-action="toast" data-message="Fitur berjualan akan segera hadir.">Pelajari cara berjualan ${icon('arrowRight',13)}</button></section>`;
  else if (state.profileTab === 'alamat') content = `<section class="panel"><div class="panel-head"><h3>Alamat saya</h3><button class="button button-secondary button-small" data-action="add-address">${icon('plus',14)} Tambah alamat</button></div><div class="address-list">${state.addresses.map(addressEntry).join('')}</div></section>`;
  else if (state.profileTab === 'notifications') content = `<section class="panel"><div class="panel-head"><h3>Notifikasi</h3></div><div class="address-list">${[['Status pesanan','Pembaruan konfirmasi dan serah terima'],['Pesan penjual','Balasan chat dan informasi hewan'],['Hewan tersimpan','Perubahan ketersediaan hewan']].map(([a,b])=>`<label class="address-entry"><span><strong>${a}</strong><p>${b}</p></span><input type="checkbox" checked /></label>`).join('')}</div></section>`;
  else content = `<section class="panel"><div class="panel-head"><h3>Keamanan akun</h3></div><div class="address-entry"><span><strong>Kata sandi</strong><p>Perbarui kata sandi untuk menjaga akun tetap aman.</p></span><button class="button button-secondary button-small" data-action="toast" data-message="Tautan ubah kata sandi sudah dikirim ke emailmu.">Ubah</button></div><div class="address-entry" style="margin-top:10px"><span><strong>Keluar dari akun</strong><p>Keluar dari akun MyKandang pada perangkat ini.</p></span><button class="button button-danger button-small" data-action="logout">Keluar</button></div></section>`;
  return `<section class="page"><div class="page-header"><div><span class="eyebrow">Pengaturan akun</span><h1>Profil</h1><p>Kelola akun dan informasi serah terimamu.</p></div></div><div class="profile-layout"><aside class="panel profile-card"><span class="profile-large-avatar">FB</span><span class="profile-intro"><h3>${escapeHtml(p.name)}</h3><p>${escapeHtml(p.email)}</p></span><button class="button button-secondary button-small" data-action="edit-profile">Ubah profil</button><nav class="profile-menu">${menu.map(([id,label,ico])=>`<button class="${state.profileTab===id?'active':''}" data-action="profile-tab" data-value="${id}">${icon(ico,15)} ${label}</button>`).join('')}</nav></aside><div class="profile-content">${content}</div></div></section>`;
}

function addressEntry(address) {
  return `<article class="address-entry"><div><strong>${address.label} ${address.primary?'<span class="pill">Alamat utama</span>':''}</strong><p>${escapeHtml(address.recipient)}<br />${escapeHtml(address.address)}</p></div><div class="address-entry-actions"><button class="button-ghost" data-action="edit-address" data-id="${address.id}">Ubah</button>${!address.primary?`<button class="button-ghost" data-action="remove-address" data-id="${address.id}">Hapus</button>`:''}</div></article>`;
}

function renderCompareBar() {
  const old = document.getElementById('compare-bar');
  old?.remove();
  if (!state.compare.length || !['home','catalog','saved'].includes(state.page)) return;
  const selected = state.compare.map(animalById).filter(Boolean);
  const bar = document.createElement('div');
  bar.id = 'compare-bar';
  bar.className = 'compare-bar';
  bar.innerHTML = `<div class="selected-mini"><span class="compare-mini-icons">${selected.map(item=>`<span>${item.emoji}</span>`).join('')}</span><strong>${selected.length} dari 3 dipilih</strong></div><div class="compare-bar-actions"><button class="button button-secondary" data-action="clear-compare">Reset</button><button class="button button-soft" data-page="compare">Bandingkan ${icon('arrowRight',13)}</button></div>`;
  document.body.appendChild(bar);
}

function renderFiltersModal() {
  const f = state.filters;
  openModal('Filter hewan', 'Atur preferensi agar lebih mudah menemukan ternak.', `<div class="filter-section"><h3>Jenis hewan</h3><div class="chip-options">${['Sapi','Kambing','Domba','Bebek','Ayam'].map(x=>filterChip(x,f.kinds.includes(x),'kind')).join('')}</div></div>
    <div class="filter-section"><h3>Rentang harga</h3><div class="form-row"><div><label class="form-label" for="price-min">Minimum</label><input class="field" id="price-min" type="number" min="0" placeholder="Rp 0" value="${f.min}" data-filter-input="min" /></div><div><label class="form-label" for="price-max">Maksimum</label><input class="field" id="price-max" type="number" min="0" placeholder="Bebas" value="${f.max}" data-filter-input="max" /></div></div></div>
    <div class="filter-section"><h3>Umur</h3><div class="chip-options">${[['under1','< 1 tahun'],['1to2','1–2 tahun'],['over2','> 2 tahun']].map(([v,l])=>filterChip(l,f.age===v,'age',v)).join('')}</div></div>
    <div class="filter-section"><h3>Lokasi</h3><div class="chip-options">${['Jawa Barat','Jawa Tengah','Jawa Timur'].map(x=>filterChip(x,f.locations.includes(x),'location')).join('')}</div></div>
    <div class="filter-section"><h3>Kesehatan</h3><div class="chip-options">${['Sehat','Divaksin'].map(x=>filterChip(x,f.health.includes(x),'health')).join('')}</div></div>`, `<button class="button-ghost" data-action="reset-filters">Reset semua</button><div class="right"><button class="button button-secondary" data-action="close-modal">Batal</button><button class="button" data-action="apply-filters">Tampilkan ${getFilteredAnimals().length} hewan</button></div>`, true);
}

function filterChip(label, selected, type, value = label) {
  return `<button class="option-chip ${selected?'selected':''}" data-action="filter-option" data-type="${type}" data-value="${value}">${label}${selected?' ✓':''}</button>`;
}

function openModal(title, subtitle, body, footer = '', wide = false) {
  const root = document.getElementById('modal-root');
  root.innerHTML = `<div class="modal-backdrop" data-action="backdrop"><section class="modal ${wide?'wide':''}" role="dialog" aria-modal="true" aria-label="${escapeHtml(title)}"><div class="modal-head"><span><h2>${title}</h2>${subtitle?`<p>${subtitle}</p>`:''}</span><button class="modal-close" data-action="close-modal" aria-label="Tutup">${icon('close')}</button></div><div class="modal-body">${body}</div>${footer?`<div class="modal-footer">${footer}</div>`:''}</section></div>`;
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modal-root').innerHTML = '';
  document.body.style.overflow = '';
}

function showToast(message) {
  const region = document.getElementById('toast-region');
  const item = document.createElement('div');
  item.className = 'toast';
  item.textContent = message;
  region.appendChild(item);
  window.setTimeout(() => item.remove(), 2800);
}

function toggleSaved(id) {
  if (state.saved.has(id)) { state.saved.delete(id); showToast('Dihapus dari hewan tersimpan.'); }
  else { state.saved.add(id); showToast('Hewan disimpan untuk dilihat lagi.'); }
  render();
}

function toggleCompare(id, checked) {
  if (checked && !state.compare.includes(id)) {
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
  if (type === 'location') state.filters.locations = toggle(state.filters.locations,value);
  if (type === 'age') state.filters.age = state.filters.age===value?'':value;
  renderFiltersModal();
}

function resetFilters() {
  state.filters = { kinds: [], health: [], locations: [], min: '', max: '', age: '' };
  state.category = 'Semua';
  state.query = '';
  if (state.page === 'catalog') render();
  else renderFiltersModal();
}

function clearFilterChip(label) {
  const f = state.filters;
  f.kinds = f.kinds.filter(x=>x!==label);
  f.health = f.health.filter(x=>x!==label);
  f.locations = f.locations.filter(x=>x!==label);
  if (label.includes(' – ')) { f.min='';f.max=''; }
  if (label==='Ruminansia'||label==='Unggas') state.category='Semua';
  render();
}

function renderChatModal(animalId, thread = []) {
  const item = animalById(animalId) || animals[0];
  const messages = thread.length ? thread : [{mine:false,text:`Halo! Ada yang ingin kamu tanyakan tentang ${item.name}?`},{mine:true,text:`Halo ${item.seller}, apakah ${item.name} masih tersedia?`}];
  openModal(`Chat dengan ${item.seller}`, `Tanya detail ${item.name} langsung kepada penjual.`, `<div class="chat-window"><div class="chat-day">Hari ini</div>${messages.map(msg=>`<div class="chat-bubble ${msg.mine?'mine':''}">${escapeHtml(msg.text)}<small>${msg.mine?'Kamu':'Penjual'} · 10.24</small></div>`).join('')}</div><form class="chat-form" data-form="chat" data-id="${item.id}"><input class="field" name="message" placeholder="Tulis pesan…" autocomplete="off" required /><button class="button" type="submit" aria-label="Kirim pesan">${icon('arrowRight',17)}</button></form>`);
}

function renderProfileEditModal() {
  const p = state.profile;
  openModal('Ubah profil', 'Perbarui informasi akunmu.', `<form data-form="profile"><div class="field-group" style="margin:0"><label class="form-label" for="profile-name">Nama lengkap</label><input class="field" id="profile-name" name="name" value="${escapeHtml(p.name)}" required /></div><div class="field-group"><label class="form-label" for="profile-email">Email</label><input class="field" id="profile-email" name="email" type="email" value="${escapeHtml(p.email)}" required /></div><div class="field-group"><label class="form-label" for="profile-phone">Nomor handphone</label><input class="field" id="profile-phone" name="phone" type="tel" value="${escapeHtml(p.phone)}" required /></div><div class="modal-footer" style="padding:17px 0 0;margin-top:17px"><span></span><div class="right"><button type="button" class="button button-secondary" data-action="close-modal">Batal</button><button class="button" type="submit">Simpan</button></div></div></form>`);
}

function renderAddressModal(addressId = '') {
  const existing = state.addresses.find(a=>a.id===addressId);
  const data = existing || { label:'', recipient:'', address:'', primary:false };
  openModal(existing?'Ubah alamat':'Tambah alamat', 'Simpan alamat untuk memudahkan serah terima.', `<form data-form="address" data-id="${existing?.id||''}"><div class="field-group" style="margin:0"><label class="form-label">Label alamat</label><input class="field" name="label" value="${escapeHtml(data.label)}" placeholder="Rumah, Kandang, …" required /></div><div class="field-group"><label class="form-label">Nama penerima dan nomor HP</label><input class="field" name="recipient" value="${escapeHtml(data.recipient)}" placeholder="Nama · 0812…" required /></div><div class="field-group"><label class="form-label">Alamat lengkap</label><textarea class="field" name="address" placeholder="Jalan, kelurahan, kecamatan, kota, provinsi, kode pos" required>${escapeHtml(data.address)}</textarea></div><label class="compare-toggle" style="margin-top:12px"><input type="checkbox" name="primary" ${data.primary?'checked':''}/> Jadikan alamat utama</label><div class="modal-footer" style="padding:17px 0 0;margin-top:17px"><span></span><div class="right"><button type="button" class="button button-secondary" data-action="close-modal">Batal</button><button class="button" type="submit">Simpan alamat</button></div></div></form>`);
}

function startCheckout(id) {
  state.currentAnimalId = id;
  state.checkout = { method: 'delivery', date: '', time: '08.00–10.00', note: '' };
  setPage('checkout');
}

function placeOrder() {
  const item = animalById(state.currentAnimalId) || animals[0];
  const selected = getSelectedAddress();
  const ship = getShippingCost();
  const dateInput = document.getElementById('delivery-date')?.value || '';
  state.checkout.date = dateInput;
  state.checkout.time = document.getElementById('delivery-time')?.value || state.checkout.time;
  state.checkout.note = document.getElementById('order-note')?.value || state.checkout.note;
  const dateLabel = dateInput ? new Intl.DateTimeFormat('id-ID',{weekday:'short',day:'numeric',month:'short',year:'numeric'}).format(new Date(`${dateInput}T12:00:00`)) : 'Jadwal dibicarakan';
  const order = { id: `MK-${String(new Date().getFullYear()).slice(-2)}${String(new Date().getMonth()+1).padStart(2,'0')}${String(new Date().getDate()).padStart(2,'0')}-${String(Math.floor(Math.random()*8999)+1000)}`, animalId:item.id, quantity:1, status:'Menunggu konfirmasi', stage:0, method:state.checkout.method, address:state.checkout.method==='delivery'?selected.address:item.location, dateLabel, time:state.checkout.time, note:state.checkout.note, shipping:ship, total:item.price+ship, created:new Intl.DateTimeFormat('id-ID',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date()), reviewed:false };
  state.orders.push(order);
  state.currentOrderId = order.id;
  setPage('order-detail');
  showToast('Permintaan pesanan berhasil dikirim.');
}

function advanceOrder(id) {
  const order = state.orders.find(item=>item.id===id);
  if (!order || order.stage>=3) return;
  order.stage += 1;
  order.status = orderStages[order.stage][0];
  render();
  showToast(order.stage===3?'Pesanan selesai. Semoga ternaknya bermanfaat!':'Status pesanan diperbarui.');
}

function cancelOrder(id) {
  const order = state.orders.find(item=>item.id===id);
  if (!order) return;
  openModal('Batalkan pesanan?', 'Pesanan akan dibatalkan dan penjual akan diberi tahu.', `<p class="confirm-copy">Pilih alasan pembatalan untuk ${order.id}.</p><div class="chip-options" style="margin:12px 0 17px">${['Berubah pikiran','Jadwal serah terima tidak sesuai','Ongkir terlalu mahal','Hewan tidak lagi tersedia'].map((x,i)=>`<button class="option-chip ${i===0?'selected':''}" data-action="cancel-reason" data-value="${x}">${x}</button>`).join('')}</div><label class="form-label">Catatan (opsional)</label><textarea class="field" id="cancel-note" placeholder="Tambahkan alasan pembatalan…"></textarea><div class="modal-footer" style="padding:17px 0 0;margin-top:17px"><span></span><div class="right"><button class="button button-secondary" data-action="close-modal">Kembali</button><button class="button button-danger" data-action="confirm-cancel" data-id="${id}">Ya, batalkan pesanan</button></div></div>`);
}

let selectedCancelReason = 'Berubah pikiran';

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}

document.addEventListener('click', event => {
  const pageTarget = event.target.closest('[data-page]');
  if (pageTarget) {
    event.preventDefault();
    const page = pageTarget.dataset.page;
    const id = pageTarget.dataset.id;
    if (page === 'detail') state.fromPage = state.page === 'saved' ? 'saved' : state.page === 'home' ? 'home' : 'catalog';
    if (page === 'order-detail' && id) state.currentOrderId = id;
    setPage(page, id && page === 'detail' ? { animalId:id } : {});
    return;
  }
  const actionTarget = event.target.closest('[data-action]');
  if (!actionTarget) return;
  const { action, id, value } = actionTarget.dataset;
  if (action === 'backdrop' && event.target === actionTarget) { closeModal(); return; }
  if (action === 'close-modal') { closeModal(); return; }
  if (action === 'detail') { state.fromPage=state.page; setPage('detail',{animalId:id}); return; }
  if (action === 'save') { event.stopPropagation(); toggleSaved(id); return; }
  if (action === 'compare-toggle') return;
  if (action === 'filters') { renderFiltersModal(); return; }
  if (action === 'filter-option') { applyFilterOption(actionTarget); return; }
  if (action === 'apply-filters') { closeModal(); render(); return; }
  if (action === 'reset-filters') { resetFilters(); return; }
  if (action === 'clear-chip') { clearFilterChip(actionTarget.dataset.label); return; }
  if (action === 'saved-tab') { state.savedTab=value; render(); return; }
  if (action === 'clear-compare') { state.compare=[]; render(); return; }
  if (action === 'remove-compare') { state.compare=state.compare.filter(x=>x!==id); render(); return; }
  if (action === 'checkout') { startCheckout(id); return; }
  if (action === 'chat') { renderChatModal(id); return; }
  if (action === 'seller-profile') { showToast('Profil penjual ditampilkan pada halaman ini.'); return; }
  if (action === 'place-order') { placeOrder(); return; }
  if (action === 'order-detail') { setPage('order-detail',{orderId:id}); return; }
  if (action === 'advance-order') { advanceOrder(id); return; }
  if (action === 'cancel-order') { selectedCancelReason='Berubah pikiran'; cancelOrder(id); return; }
  if (action === 'cancel-reason') { selectedCancelReason=value; document.querySelectorAll('[data-action="cancel-reason"]').forEach(el=>el.classList.toggle('selected',el===actionTarget)); return; }
  if (action === 'confirm-cancel') { const order=state.orders.find(o=>o.id===id); if(order){order.status='Dibatalkan';order.cancelReason=selectedCancelReason;order.note=document.getElementById('cancel-note')?.value||order.note;} closeModal(); render(); showToast('Pesanan berhasil dibatalkan.'); return; }
  if (action === 'write-review') { setPage('review',{orderId:id}); return; }
  if (action === 'rating') { state.reviewRating=Number(value); render(); return; }
  if (action === 'submit-review') { const order=state.orders.find(o=>o.id===id); if(order) order.reviewed=true; setPage('order-detail',{orderId:id}); showToast('Ulasan terkirim. Terima kasih!'); return; }
  if (action === 'profile-tab') { state.profileTab=value; render(); return; }
  if (action === 'edit-profile') { renderProfileEditModal(); return; }
  if (action === 'manage-addresses') { setPage('profile'); state.profileTab='alamat'; render(); return; }
  if (action === 'edit-address') { renderAddressModal(id); return; }
  if (action === 'remove-address') { state.addresses=state.addresses.filter(a=>a.id!==id); render(); showToast('Alamat dihapus.'); return; }
  if (action === 'add-address') { renderAddressModal(); return; }
  if (action === 'logout') { openModal('Keluar dari akun?', 'Apakah kamu yakin ingin keluar dari akun MyKandang?', '<p class="confirm-copy">Kamu bisa masuk lagi kapan saja untuk melihat pesanan dan hewan tersimpan.</p>', '<button class="button-ghost" data-action="close-modal">Batal</button><div class="right"><button class="button" data-action="close-modal">Ya, keluar</button></div>'); return; }
  if (action === 'toast') { showToast(actionTarget.dataset.message || ''); return; }
  if (action === 'open-search') { setPage('catalog'); document.querySelector('.catalog-search input')?.focus(); return; }
});

document.addEventListener('change', event => {
  const target = event.target;
  if (target.matches('[data-action="compare-toggle"]')) { toggleCompare(target.dataset.id,target.checked); return; }
  if (target.matches('[data-change="sort"]')) { state.sort=target.value; render(); return; }
  if (target.matches('[data-change="method"]')) { state.checkout.method=target.value; render(); return; }
  if (target.matches('[data-filter-input]')) { state.filters[target.dataset.filterInput]=target.value; const button=document.querySelector('[data-action="apply-filters"]'); if(button) button.textContent=`Tampilkan ${getFilteredAnimals().length} hewan`; return; }
  if (target.matches('[data-checkout]')) { state.checkout[target.dataset.checkout]=target.value; if(target.dataset.checkout==='date') state.checkout.date=target.value; return; }
});

document.addEventListener('input', event => {
  const target = event.target;
  if (target.matches('[data-checkout]')) state.checkout[target.dataset.checkout] = target.value;
});

document.addEventListener('submit', event => {
  const form = event.target;
  if (form.matches('[data-form="search"]')) { event.preventDefault(); submitSearch(form); return; }
  if (form.matches('[data-form="chat"]')) { event.preventDefault(); const text=form.message.value.trim(); if(!text)return; const id=form.dataset.id; renderChatModal(id,[{mine:false,text:`Halo! Ada yang ingin kamu tanyakan tentang ${(animalById(id)||animals[0]).name}?`},{mine:true,text}]); showToast('Pesan terkirim ke penjual.'); return; }
  if (form.matches('[data-form="profile"]')) { event.preventDefault(); const data=new FormData(form); state.profile={name:data.get('name'),email:data.get('email'),phone:data.get('phone')}; closeModal(); render(); showToast('Profil berhasil diperbarui.'); return; }
  if (form.matches('[data-form="address"]')) { event.preventDefault(); const data=new FormData(form); const id=form.dataset.id; const address={id:id||`address-${Date.now()}`,label:data.get('label'),recipient:data.get('recipient'),address:data.get('address'),primary:data.has('primary')}; if(address.primary) state.addresses.forEach(x=>x.primary=false); const index=state.addresses.findIndex(x=>x.id===id); if(index>=0) state.addresses[index]=address; else state.addresses.push(address); if(address.primary) state.selectedAddress=address.id; closeModal(); render(); showToast('Alamat berhasil disimpan.'); return; }
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeModal();
  if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('.animal-image[role="button"]')) { event.preventDefault(); event.target.click(); }
});

document.addEventListener('click', event => {
  const category = event.target.closest('[data-category]');
  if (category) { state.category=category.dataset.category; state.filters.kinds=category.dataset.kind==='Sapi'||category.dataset.kind==='Kambing'||category.dataset.kind==='Domba'?[category.dataset.kind]:[]; setPage('catalog'); return; }
});

render();
