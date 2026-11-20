const express = require('express');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');
const { promisify } = require('util');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const scrypt = promisify(crypto.scrypt);
const authSecret = process.env.AUTH_SECRET || (process.env.VERCEL ? '' : 'mykandang-local-development-secret');
const publicDir = path.join(__dirname, '..', 'public');

if (process.env.VERCEL && !authSecret) throw new Error('AUTH_SECRET wajib diatur pada Vercel.');

app.use(cors());
app.use(express.json({ limit: '1mb' }));

function fail(res, status, message) {
  return res.status(status).json({ error: message });
}

function asyncRoute(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

function requireUser(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  const user = token && readAuthToken(token);
  if (!user) return fail(res, 401, 'Silakan masuk untuk melanjutkan.');
  req.user = user;
  next();
}

function createAuthToken(user) {
  const payload = Buffer.from(JSON.stringify({
    id_pengguna: user.id_pengguna,
    nama: user.nama,
    email: user.email,
    role: user.role,
    exp: Date.now() + 24 * 60 * 60 * 1000,
  })).toString('base64url');
  const signature = crypto.createHmac('sha256', authSecret).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

function readAuthToken(token) {
  const [payload, signature, extra] = String(token).split('.');
  if (!payload || !signature || extra) return null;
  const expected = crypto.createHmac('sha256', authSecret).update(payload).digest();
  let received;
  try { received = Buffer.from(signature, 'base64url'); } catch { return null; }
  if (received.length !== expected.length || !crypto.timingSafeEqual(received, expected)) return null;
  try {
    const user = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!Number.isInteger(Number(user.id_pengguna)) || !user.exp || user.exp < Date.now()) return null;
    return { ...user, id_pengguna: Number(user.id_pengguna) };
  } catch { return null; }
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'staff_admin') return fail(res, 403, 'Fitur ini hanya untuk staff admin.');
  next();
}

function parseNumber(value, label, { min = 0, optional = false, integer = false } = {}) {
  if ((value === undefined || value === null || value === '') && optional) return null;
  const number = Number(value);
  if (!Number.isFinite(number) || number < min || (integer && !Number.isInteger(number))) throw new Error(`${label} tidak valid.`);
  return number;
}

function publicAnimal(row) {
  return {
    id: row.id_hewan,
    id_kategori: row.id_kategori,
    name: row.nama,
    kind: row.jenis || row.nama_kategori,
    category: row.nama_kategori,
    breed: row.ras,
    gender: row.jenis_kelamin,
    weight: row.berat,
    ageMonths: row.umur,
    age: row.umur == null ? 'Umur tidak dicantumkan' : `${row.umur} bulan`,
    health: row.kondisi_kesehatan || 'Belum dicantumkan',
    price: Number(row.harga),
    stockCount: Number(row.stok),
    stock: row.stok > 0 && !['Terjual', 'Habis'].includes(row.status) ? 'Tersedia' : row.status === 'Terjual' ? 'Terjual' : 'Habis',
    description: row.deskripsi || '',
    status: row.status,
    images: row.images || [],
    rating: row.rating == null ? null : Number(row.rating),
    reviews: Number(row.review_count || 0),
  };
}

const animalSelect = `
  SELECT h.*, k.nama_kategori,
    COALESCE((SELECT json_agg(json_build_object('url', g.url, 'utama', g.gambar_utama) ORDER BY g.gambar_utama DESC, g.id_gambar)
      FROM gambar_hewan g WHERE g.id_hewan = h.id_hewan), '[]'::json) AS images,
    (SELECT AVG(u.rating)::numeric(3,2) FROM ulasan u WHERE u.id_hewan = h.id_hewan) AS rating,
    (SELECT COUNT(*) FROM ulasan u WHERE u.id_hewan = h.id_hewan) AS review_count
  FROM hewan h JOIN kategori_hewan k ON k.id_kategori = h.id_kategori`;

app.get('/api/db-test', asyncRoute(async (_req, res) => {
  const result = await db.query('SELECT current_database() AS database, NOW() AS waktu');
  res.json({ status: 'Berhasil', message: 'MyKandang terhubung ke PostgreSQL', data: result.rows[0] });
}));

app.post('/api/auth/register', asyncRoute(async (req, res) => {
  const { nama, email, password, no_telepon = null, alamat = null } = req.body || {};
  if (!nama?.trim() || !email?.trim() || !password || password.length < 8) return fail(res, 400, 'Nama, email, dan kata sandi minimal 8 karakter wajib diisi.');
  const existingEmail = await db.query('SELECT 1 FROM pengguna WHERE lower(email)=lower($1)', [email.trim()]);
  if (existingEmail.rowCount) return fail(res, 409, 'Email sudah terdaftar. Gunakan email lain untuk membuat akun.');
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = await scrypt(password, salt, 64);
  const passwordHash = `scrypt:${salt}:${hash.toString('hex')}`;
  const result = await db.query(
    `INSERT INTO pengguna (nama,email,password_hash,no_telepon,alamat) VALUES ($1,$2,$3,$4,$5)
     RETURNING id_pengguna,nama,email,no_telepon,alamat,role`,
    [nama.trim(), email.trim().toLowerCase(), passwordHash, no_telepon, alamat]
  );
  const user = result.rows[0];
  const token = createAuthToken(user);
  res.status(201).json({ token, user });
}));

app.post('/api/auth/login', asyncRoute(async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return fail(res, 400, 'Email dan kata sandi wajib diisi.');
  const result = await db.query('SELECT * FROM pengguna WHERE lower(email)=lower($1)', [email.trim()]);
  const row = result.rows[0];
  if (!row || !row.password_hash.startsWith('scrypt:')) return fail(res, 401, 'Email atau kata sandi tidak sesuai.');
  const [, salt, expectedHex] = row.password_hash.split(':');
  const actual = await scrypt(password, salt, 64);
  const expected = Buffer.from(expectedHex, 'hex');
  if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) return fail(res, 401, 'Email atau kata sandi tidak sesuai.');
  const user = { id_pengguna: row.id_pengguna, nama: row.nama, email: row.email, no_telepon: row.no_telepon, alamat: row.alamat, role: row.role };
  const token = createAuthToken(user);
  res.json({ token, user });
}));

app.post('/api/auth/logout', requireUser, (_req, res) => {
  res.status(204).end();
});

app.get('/api/kategori', asyncRoute(async (_req, res) => {
  const result = await db.query('SELECT id_kategori,nama_kategori,deskripsi FROM kategori_hewan ORDER BY nama_kategori');
  res.json(result.rows);
}));

app.get('/api/hewan', asyncRoute(async (req, res) => {
  const values = [];
  const where = [];
  if (req.query.q) {
    values.push(`%${String(req.query.q).trim()}%`);
    where.push(`(h.nama ILIKE $${values.length} OR h.jenis ILIKE $${values.length} OR h.ras ILIKE $${values.length} OR h.deskripsi ILIKE $${values.length})`);
  }
  if (req.query.kategori) { values.push(req.query.kategori); where.push(`k.nama_kategori = $${values.length}`); }
  if (req.query.status) { values.push(req.query.status); where.push(`h.status = $${values.length}`); }
  let orderBy = 'h.id_hewan DESC';
  if (req.query.urut === 'termurah') orderBy = 'h.harga ASC';
  if (req.query.urut === 'termahal') orderBy = 'h.harga DESC';
  if (req.query.urut === 'rating') orderBy = 'rating DESC NULLS LAST, h.id_hewan DESC';
  const result = await db.query(`${animalSelect} ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY ${orderBy}`, values);
  res.json(result.rows.map(publicAnimal));
}));

app.get('/api/hewan/:id', asyncRoute(async (req, res) => {
  const result = await db.query(`${animalSelect} WHERE h.id_hewan=$1`, [req.params.id]);
  if (!result.rows[0]) return fail(res, 404, 'Hewan tidak ditemukan.');
  res.json(publicAnimal(result.rows[0]));
}));

app.get('/api/hewan/:id/ulasan', asyncRoute(async (req, res) => {
  const result = await db.query(
    `SELECT u.id_ulasan,u.rating,u.komentar,u.tanggal,p.nama AS nama_pengguna
     FROM ulasan u JOIN pengguna p ON p.id_pengguna=u.id_pengguna
     WHERE u.id_hewan=$1 ORDER BY u.tanggal DESC,u.id_ulasan DESC`, [req.params.id]
  );
  res.json(result.rows);
}));

app.get('/api/profil', requireUser, asyncRoute(async (req, res) => {
  const result = await db.query('SELECT id_pengguna,nama,email,no_telepon,alamat,role FROM pengguna WHERE id_pengguna=$1', [req.user.id_pengguna]);
  res.json(result.rows[0]);
}));

app.patch('/api/profil', requireUser, asyncRoute(async (req, res) => {
  const { nama, no_telepon, alamat } = req.body || {};
  const result = await db.query(
    `UPDATE pengguna SET nama=COALESCE($1,nama), no_telepon=COALESCE($2,no_telepon), alamat=COALESCE($3,alamat)
     WHERE id_pengguna=$4 RETURNING id_pengguna,nama,email,no_telepon,alamat,role`,
    [nama?.trim() || null, no_telepon ?? null, alamat ?? null, req.user.id_pengguna]
  );
  Object.assign(req.user, result.rows[0]);
  res.json(result.rows[0]);
}));

app.get('/api/admin/ringkasan', requireUser, requireAdmin, asyncRoute(async (_req, res) => {
  const result = await db.query(
    `SELECT
      (SELECT COUNT(*) FROM pengguna WHERE role='customer') AS jumlah_pengguna,
      (SELECT COUNT(*) FROM hewan) AS jumlah_hewan,
      (SELECT COUNT(*) FROM pesanan WHERE status_pesanan='Pending') AS pesanan_pending,
      (SELECT COUNT(*) FROM pembayaran WHERE status='Belum Dibayar') AS pembayaran_pending`
  );
  res.json(result.rows[0]);
}));

app.get('/api/admin/pengguna', requireUser, requireAdmin, asyncRoute(async (_req, res) => {
  const result = await db.query('SELECT id_pengguna,nama,email,no_telepon,role FROM pengguna ORDER BY id_pengguna');
  res.json(result.rows);
}));

app.get('/api/admin/pesanan', requireUser, requireAdmin, asyncRoute(async (_req, res) => {
  const result = await db.query(
    `SELECT p.*,u.nama AS nama_pelanggan,u.email,
      COALESCE(json_agg(json_build_object('id_hewan',h.id_hewan,'nama',h.nama,'kuantitas',dp.kuantitas,'harga_satuan',dp.harga_satuan,'subtotal',dp.subtotal)) FILTER (WHERE h.id_hewan IS NOT NULL),'[]') AS details,
      pb.status AS status_pembayaran,pb.metode AS metode_pembayaran,pb.jumlah AS jumlah_pembayaran,pb.bukti
     FROM pesanan p JOIN pengguna u ON u.id_pengguna=p.id_pengguna
     LEFT JOIN detail_pesanan dp ON dp.id_pesanan=p.id_pesanan LEFT JOIN hewan h ON h.id_hewan=dp.id_hewan
     LEFT JOIN pembayaran pb ON pb.id_pesanan=p.id_pesanan
     GROUP BY p.id_pesanan,u.id_pengguna,pb.status,pb.metode,pb.jumlah,pb.bukti ORDER BY p.tgl_pesanan DESC`
  );
  res.json(result.rows);
}));

app.post('/api/admin/hewan', requireUser, requireAdmin, asyncRoute(async (req, res) => {
  const data = req.body || {};
  const idKategori = parseNumber(data.id_kategori,'Kategori',{min:1,integer:true});
  const nama = data.nama?.trim();
  const harga = parseNumber(data.harga,'Harga');
  const stok = parseNumber(data.stok,'Stok',{min:0,integer:true});
  if (!nama) return fail(res,400,'Nama hewan wajib diisi.');
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query(
      `INSERT INTO hewan (id_kategori,nama,jenis,ras,jenis_kelamin,berat,umur,kondisi_kesehatan,harga,stok,deskripsi,status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id_hewan`,
      [idKategori,nama,data.jenis||null,data.ras||null,data.jenis_kelamin||null,
        parseNumber(data.berat,'Berat',{min:0,optional:true}),parseNumber(data.umur,'Umur',{min:0,integer:true,optional:true}),
        data.kondisi_kesehatan||null,harga,stok,data.deskripsi||null,stok===0?(data.status==='Terjual'?'Terjual':'Habis'):(data.status||'Tersedia')]
    );
    if (data.gambar_url?.trim()) await client.query('INSERT INTO gambar_hewan (id_hewan,url,gambar_utama) VALUES ($1,$2,TRUE)',[result.rows[0].id_hewan,data.gambar_url.trim()]);
    await client.query('COMMIT');
    res.status(201).json({ id_hewan:result.rows[0].id_hewan });
  } catch (error) { await client.query('ROLLBACK'); throw error; }
  finally { client.release(); }
}));

app.patch('/api/admin/hewan/:id', requireUser, requireAdmin, asyncRoute(async (req, res) => {
  const data = req.body || {};
  const idKategori = parseNumber(data.id_kategori,'Kategori',{min:1,integer:true});
  const nama = data.nama?.trim();
  const harga = parseNumber(data.harga,'Harga');
  const stok = parseNumber(data.stok,'Stok',{min:0,integer:true});
  if (!nama) return fail(res,400,'Nama hewan wajib diisi.');
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query(
      `UPDATE hewan SET id_kategori=$1,nama=$2,jenis=$3,ras=$4,jenis_kelamin=$5,berat=$6,umur=$7,
       kondisi_kesehatan=$8,harga=$9,stok=$10,deskripsi=$11,status=$12 WHERE id_hewan=$13 RETURNING id_hewan`,
      [idKategori,nama,data.jenis||null,data.ras||null,data.jenis_kelamin||null,
        parseNumber(data.berat,'Berat',{min:0,optional:true}),parseNumber(data.umur,'Umur',{min:0,integer:true,optional:true}),
        data.kondisi_kesehatan||null,harga,stok,data.deskripsi||null,stok===0?(data.status==='Terjual'?'Terjual':'Habis'):(data.status||'Tersedia'),req.params.id]
    );
    if (!result.rows[0]) { await client.query('ROLLBACK'); return fail(res,404,'Hewan tidak ditemukan.'); }
    if (data.gambar_url?.trim()) {
      await client.query('DELETE FROM gambar_hewan WHERE id_hewan=$1 AND gambar_utama=TRUE',[req.params.id]);
      await client.query('INSERT INTO gambar_hewan (id_hewan,url,gambar_utama) VALUES ($1,$2,TRUE)',[req.params.id,data.gambar_url.trim()]);
    }
    await client.query('COMMIT');
    res.json({ id_hewan:result.rows[0].id_hewan });
  } catch (error) { await client.query('ROLLBACK'); throw error; }
  finally { client.release(); }
}));

app.patch('/api/admin/pesanan/:id', requireUser, requireAdmin, asyncRoute(async (req, res) => {
  const { status_pesanan, status_pembayaran } = req.body || {};
  const validOrderStates = ['Pending','Diproses','Selesai','Dibatalkan'];
  const validPaymentStates = ['Belum Dibayar','Berhasil'];
  if (!validOrderStates.includes(status_pesanan) || !validPaymentStates.includes(status_pembayaran)) return fail(res,400,'Status pesanan atau pembayaran tidak valid.');
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const order = await client.query('SELECT p.id_pesanan,p.status_pesanan,pb.status AS status_pembayaran FROM pesanan p LEFT JOIN pembayaran pb ON pb.id_pesanan=p.id_pesanan WHERE p.id_pesanan=$1 FOR UPDATE OF p',[req.params.id]);
    if (!order.rows[0]) { await client.query('ROLLBACK'); return fail(res,404,'Pesanan tidak ditemukan.'); }
    if (order.rows[0].status_pesanan==='Dibatalkan' && status_pesanan!=='Dibatalkan') { await client.query('ROLLBACK'); return fail(res,409,'Pesanan yang sudah dibatalkan tidak dapat dibuka kembali.'); }
    if (order.rows[0].status_pesanan==='Selesai' && status_pesanan!=='Selesai') { await client.query('ROLLBACK'); return fail(res,409,'Pesanan selesai tidak dapat diubah kembali.'); }
    if (status_pesanan==='Dibatalkan' && order.rows[0].status_pembayaran==='Berhasil' && status_pembayaran!=='Belum Dibayar') { await client.query('ROLLBACK'); return fail(res,409,'Ubah status pembayaran setelah penyelesaian/refund manual sebelum membatalkan pesanan.'); }
    if (status_pesanan==='Dibatalkan' && status_pembayaran==='Berhasil') { await client.query('ROLLBACK'); return fail(res,409,'Pesanan batal tidak dapat ditandai sudah dibayar.'); }
    if (status_pesanan==='Dibatalkan' && order.rows[0].status_pesanan!=='Dibatalkan') {
      const items=await client.query('SELECT id_hewan,kuantitas FROM detail_pesanan WHERE id_pesanan=$1',[req.params.id]);
      for (const item of items.rows) await client.query("UPDATE hewan SET stok=stok+$1,status=CASE WHEN status IN ('Habis','Terjual') THEN 'Tersedia' ELSE status END WHERE id_hewan=$2",[item.kuantitas,item.id_hewan]);
    }
    await client.query('UPDATE pesanan SET status_pesanan=$1 WHERE id_pesanan=$2',[status_pesanan,req.params.id]);
    await client.query("UPDATE pembayaran SET status=$1,tanggal_bayar=CASE WHEN $1='Berhasil' THEN COALESCE(tanggal_bayar,CURRENT_TIMESTAMP) ELSE NULL END WHERE id_pesanan=$2",[status_pembayaran,req.params.id]);
    await client.query('COMMIT');
    res.json({ status_pesanan,status_pembayaran });
  } catch (error) { await client.query('ROLLBACK'); throw error; }
  finally { client.release(); }
}));

app.get('/api/wishlist', requireUser, asyncRoute(async (req, res) => {
  const result = await db.query(
    `${animalSelect} JOIN wishlist w ON w.id_hewan=h.id_hewan WHERE w.id_pengguna=$1 ORDER BY w.tanggal_ditambahkan DESC`,
    [req.user.id_pengguna]
  );
  res.json(result.rows.map(publicAnimal));
}));

app.put('/api/wishlist/:id', requireUser, asyncRoute(async (req, res) => {
  await db.query(
    `INSERT INTO wishlist (id_pengguna,id_hewan) VALUES ($1,$2) ON CONFLICT (id_pengguna,id_hewan) DO NOTHING`,
    [req.user.id_pengguna, req.params.id]
  );
  res.status(204).end();
}));

app.delete('/api/wishlist/:id', requireUser, asyncRoute(async (req, res) => {
  await db.query('DELETE FROM wishlist WHERE id_pengguna=$1 AND id_hewan=$2', [req.user.id_pengguna, req.params.id]);
  res.status(204).end();
}));

async function getOrCreateCart(client, userId) {
  const found = await client.query("SELECT id_keranjang FROM keranjang WHERE id_pengguna=$1 AND COALESCE(status,'Aktif')='Aktif' ORDER BY id_keranjang DESC LIMIT 1", [userId]);
  if (found.rows[0]) return found.rows[0].id_keranjang;
  const created = await client.query("INSERT INTO keranjang (id_pengguna,status) VALUES ($1,'Aktif') RETURNING id_keranjang", [userId]);
  return created.rows[0].id_keranjang;
}

app.get('/api/keranjang', requireUser, asyncRoute(async (req, res) => {
  const client = await db.connect();
  try {
    const cartId = await getOrCreateCart(client, req.user.id_pengguna);
    const result = await client.query(
      `SELECT animal.*,dc.jumlah FROM (${animalSelect}) animal
       JOIN detail_keranjang dc ON dc.id_hewan=animal.id_hewan
       WHERE dc.id_keranjang=$1 ORDER BY dc.id_detail_keranjang`, [cartId]
    );
    res.json(result.rows.map(row => ({ ...publicAnimal(row), jumlah: Number(row.jumlah || 1) })));
  } finally { client.release(); }
}));

app.post('/api/keranjang', requireUser, asyncRoute(async (req, res) => {
  const quantity = parseNumber(req.body?.jumlah ?? 1, 'Jumlah', { min: 1, integer: true });
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const cartId = await getOrCreateCart(client, req.user.id_pengguna);
    const animal = await client.query('SELECT id_hewan,harga,stok,status FROM hewan WHERE id_hewan=$1 FOR UPDATE', [req.body?.id_hewan]);
    if (!animal.rows[0]) { await client.query('ROLLBACK'); return fail(res, 404, 'Hewan tidak ditemukan.'); }
    if (Number(animal.rows[0].harga) <= 0) { await client.query('ROLLBACK'); return fail(res, 409, 'Harga hewan belum diatur oleh admin.'); }
    const current = await client.query(
      `SELECT COALESCE(dc.jumlah,0) AS jumlah FROM detail_keranjang dc WHERE dc.id_keranjang=$1 AND dc.id_hewan=$2`,
      [cartId, req.body.id_hewan]
    );
    if (['Terjual','Habis'].includes(animal.rows[0].status) || Number(animal.rows[0].stok) < Number(current.rows[0]?.jumlah || 0) + quantity) { await client.query('ROLLBACK'); return fail(res, 409, 'Stok hewan tidak mencukupi.'); }
    await client.query(
      `INSERT INTO detail_keranjang (id_keranjang,id_hewan,jumlah) VALUES ($1,$2,$3)
       ON CONFLICT (id_keranjang,id_hewan) DO UPDATE SET jumlah=detail_keranjang.jumlah+EXCLUDED.jumlah`,
      [cartId, req.body.id_hewan, quantity]
    );
    await client.query('COMMIT');
    res.status(201).json({ message: 'Hewan dimasukkan ke keranjang.' });
  } catch (error) { await client.query('ROLLBACK'); throw error; }
  finally { client.release(); }
}));

app.patch('/api/keranjang/:id', requireUser, asyncRoute(async (req, res) => {
  const quantity = parseNumber(req.body?.jumlah, 'Jumlah', { min: 1, integer: true });
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const cartId = await getOrCreateCart(client, req.user.id_pengguna);
    const result = await client.query(
      `UPDATE detail_keranjang dc SET jumlah=$1 FROM hewan h
       WHERE dc.id_keranjang=$2 AND dc.id_hewan=$3 AND h.id_hewan=dc.id_hewan
         AND h.stok >= $1 AND COALESCE(h.status,'') NOT IN ('Terjual','Habis')
       RETURNING dc.id_hewan,dc.jumlah`,
      [quantity, cartId, req.params.id]
    );
    if (!result.rows[0]) {
      await client.query('ROLLBACK');
      const exists = await client.query(
        `SELECT dc.id_hewan FROM detail_keranjang dc WHERE dc.id_keranjang=$1 AND dc.id_hewan=$2`,
        [cartId, req.params.id]
      );
      return fail(res, exists.rowCount ? 409 : 404, exists.rowCount ? 'Jumlah melebihi stok tersedia.' : 'Item keranjang tidak ditemukan.');
    }
    await client.query('COMMIT');
    res.json(result.rows[0]);
  } catch (error) { await client.query('ROLLBACK'); throw error; }
  finally { client.release(); }
}));

app.delete('/api/keranjang/:id', requireUser, asyncRoute(async (req, res) => {
  await db.query('DELETE FROM detail_keranjang dc USING keranjang k WHERE dc.id_keranjang=k.id_keranjang AND k.id_pengguna=$1 AND dc.id_hewan=$2', [req.user.id_pengguna, req.params.id]);
  res.status(204).end();
}));

app.post('/api/pesanan', requireUser, asyncRoute(async (req, res) => {
  const method = req.body?.metode_serah_terima;
  const address = req.body?.alamat_pengiriman || null;
  const items = Array.isArray(req.body?.items) ? req.body.items : [];
  if (!['Kirim Kurir','Ambil di Kandang'].includes(method)) return fail(res, 400, 'Metode serah terima tidak valid.');
  if (method === 'Kirim Kurir' && !address) return fail(res, 400, 'Alamat pengiriman wajib diisi.');
  if (!items.length) return fail(res, 400, 'Keranjang pesanan kosong.');
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const animalIds = items.map(item => item.id_hewan);
    const locked = await client.query('SELECT id_hewan,harga,stok,status FROM hewan WHERE id_hewan=ANY($1::int[]) FOR UPDATE', [animalIds]);
    const byId = new Map(locked.rows.map(row => [String(row.id_hewan), row]));
    if (byId.size !== new Set(animalIds.map(String)).size) { await client.query('ROLLBACK'); return fail(res, 404, 'Salah satu hewan tidak ditemukan.'); }
    let total = 0;
    const normalized = items.map(item => {
      const animal = byId.get(String(item.id_hewan));
      const quantity = parseNumber(item.kuantitas, 'Kuantitas', { min: 1, integer: true });
      if (['Terjual','Habis'].includes(animal.status) || animal.stok < quantity) throw Object.assign(new Error('Stok hewan tidak mencukupi.'), { status: 409 });
      const price = Number(animal.harga);
      if (price <= 0) throw Object.assign(new Error('Harga hewan belum diatur oleh admin.'), { status: 409 });
      total += price * quantity;
      return { id: animal.id_hewan, price, quantity, stock: animal.stok };
    });
    const order = await client.query(
      `INSERT INTO pesanan (id_pengguna,total_harga,metode_serah_terima,alamat_pengiriman,status_pesanan)
       VALUES ($1,$2,$3,$4,'Pending') RETURNING *`,
      [req.user.id_pengguna, total, method, address]
    );
    for (const item of normalized) {
      await client.query('INSERT INTO detail_pesanan (id_pesanan,id_hewan,harga_satuan,kuantitas) VALUES ($1,$2,$3,$4)', [order.rows[0].id_pesanan,item.id,item.price,item.quantity]);
    }
    await client.query("INSERT INTO pembayaran (id_pesanan,jumlah,status) VALUES ($1,$2,'Belum Dibayar')", [order.rows[0].id_pesanan,total]);
    for (const item of normalized) {
      const nextStock = item.stock - item.quantity;
      await client.query('UPDATE hewan SET stok=$1,status=CASE WHEN $1=0 THEN \'Habis\' ELSE status END WHERE id_hewan=$2', [nextStock,item.id]);
    }
    await client.query("UPDATE keranjang SET status='Checkout' WHERE id_pengguna=$1 AND COALESCE(status,'Aktif')='Aktif'", [req.user.id_pengguna]);
    await client.query('COMMIT');
    res.status(201).json({ ...order.rows[0], details: normalized, pembayaran: { status: 'Belum Dibayar', jumlah: total } });
  } catch (error) { await client.query('ROLLBACK'); throw error; }
  finally { client.release(); }
}));

app.get('/api/pesanan', requireUser, asyncRoute(async (req, res) => {
  const result = await db.query(
    `SELECT p.*, COALESCE(json_agg(json_build_object('id_hewan',h.id_hewan,'nama',h.nama,'harga_satuan',dp.harga_satuan,'kuantitas',dp.kuantitas,'subtotal',dp.subtotal,'sudah_diulas',EXISTS(SELECT 1 FROM ulasan u WHERE u.id_pesanan=p.id_pesanan AND u.id_hewan=h.id_hewan AND u.id_pengguna=p.id_pengguna))) FILTER (WHERE h.id_hewan IS NOT NULL),'[]') AS details,
      pb.status AS status_pembayaran,pb.metode AS metode_pembayaran,pb.jumlah AS jumlah_pembayaran
     FROM pesanan p LEFT JOIN detail_pesanan dp ON dp.id_pesanan=p.id_pesanan LEFT JOIN hewan h ON h.id_hewan=dp.id_hewan
     LEFT JOIN pembayaran pb ON pb.id_pesanan=p.id_pesanan WHERE p.id_pengguna=$1
     GROUP BY p.id_pesanan,pb.status,pb.metode,pb.jumlah ORDER BY p.tgl_pesanan DESC`, [req.user.id_pengguna]
  );
  res.json(result.rows);
}));

app.get('/api/pesanan/:id', requireUser, asyncRoute(async (req, res) => {
  const result = await db.query(
    `SELECT p.*, COALESCE(json_agg(json_build_object('id_hewan',h.id_hewan,'nama',h.nama,'harga_satuan',dp.harga_satuan,'kuantitas',dp.kuantitas,'subtotal',dp.subtotal,'sudah_diulas',EXISTS(SELECT 1 FROM ulasan u WHERE u.id_pesanan=p.id_pesanan AND u.id_hewan=h.id_hewan AND u.id_pengguna=p.id_pengguna))) FILTER (WHERE h.id_hewan IS NOT NULL),'[]') AS details,
      pb.id_pembayaran,pb.status AS status_pembayaran,pb.metode AS metode_pembayaran,pb.jumlah AS jumlah_pembayaran,pb.tanggal_bayar,pb.bukti
     FROM pesanan p LEFT JOIN detail_pesanan dp ON dp.id_pesanan=p.id_pesanan LEFT JOIN hewan h ON h.id_hewan=dp.id_hewan
     LEFT JOIN pembayaran pb ON pb.id_pesanan=p.id_pesanan WHERE p.id_pengguna=$1 AND p.id_pesanan=$2
     GROUP BY p.id_pesanan,pb.id_pembayaran`, [req.user.id_pengguna,req.params.id]
  );
  if (!result.rows[0]) return fail(res, 404, 'Pesanan tidak ditemukan.');
  res.json(result.rows[0]);
}));

app.patch('/api/pesanan/:id/batal', requireUser, asyncRoute(async (req, res) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const found = await client.query("SELECT p.id_pesanan,p.status_pesanan,pb.status AS status_pembayaran FROM pesanan p LEFT JOIN pembayaran pb ON pb.id_pesanan=p.id_pesanan WHERE p.id_pesanan=$1 AND p.id_pengguna=$2 FOR UPDATE OF p", [req.params.id,req.user.id_pengguna]);
    if (!found.rows[0]) { await client.query('ROLLBACK'); return fail(res,404,'Pesanan tidak ditemukan.'); }
    if (found.rows[0].status_pesanan !== 'Pending') { await client.query('ROLLBACK'); return fail(res,409,'Pesanan yang sudah diproses tidak dapat dibatalkan dari web.'); }
    if (found.rows[0].status_pembayaran === 'Berhasil') { await client.query('ROLLBACK'); return fail(res,409,'Pesanan yang sudah dibayar perlu ditangani langsung oleh staff.'); }
    await client.query("UPDATE pesanan SET status_pesanan='Dibatalkan' WHERE id_pesanan=$1", [req.params.id]);
    const items = await client.query('SELECT id_hewan,kuantitas FROM detail_pesanan WHERE id_pesanan=$1', [req.params.id]);
    for (const item of items.rows) await client.query("UPDATE hewan SET stok=stok+$1,status=CASE WHEN status IN ('Habis','Terjual') THEN 'Tersedia' ELSE status END WHERE id_hewan=$2", [item.kuantitas,item.id_hewan]);
    await client.query('COMMIT');
    res.json({ status_pesanan:'Dibatalkan' });
  } catch (error) { await client.query('ROLLBACK'); throw error; }
  finally { client.release(); }
}));

app.post('/api/pesanan/:id/pembayaran', requireUser, asyncRoute(async (req, res) => {
  const metode = req.body?.metode;
  if (!metode?.trim()) return fail(res,400,'Metode pembayaran wajib dipilih.');
  const bukti = req.body?.bukti?.trim() || null;
  if (bukti && bukti.length>255) return fail(res,400,'Link atau lokasi bukti maksimal 255 karakter.');
  const result = await db.query(
    `UPDATE pembayaran pb SET metode=$1,bukti=COALESCE($2,pb.bukti),status='Belum Dibayar'
     FROM pesanan p WHERE pb.id_pesanan=p.id_pesanan AND p.id_pengguna=$3 AND p.id_pesanan=$4
       AND pb.status='Belum Dibayar' AND p.status_pesanan<>'Dibatalkan'
     RETURNING pb.id_pembayaran,pb.id_pesanan,pb.jumlah,pb.metode,pb.status,pb.tanggal_bayar,pb.bukti`,
    [metode.trim(),bukti,req.user.id_pengguna,req.params.id]
  );
  if (!result.rows[0]) return fail(res,404,'Pembayaran untuk pesanan ini tidak ditemukan.');
  res.json(result.rows[0]);
}));

app.post('/api/ulasan', requireUser, asyncRoute(async (req, res) => {
  const { id_hewan, id_pesanan, rating, komentar = null } = req.body || {};
  const score = parseNumber(rating,'Rating',{min:1,integer:true});
  const animalId = parseNumber(id_hewan,'Hewan',{min:1,integer:true});
  const orderId = parseNumber(id_pesanan,'Pesanan',{min:1,integer:true});
  if (score > 5) return fail(res,400,'Data ulasan tidak lengkap.');
  const eligible = await db.query(
    `SELECT 1 FROM pesanan p JOIN detail_pesanan d ON d.id_pesanan=p.id_pesanan
     WHERE p.id_pesanan=$1 AND p.id_pengguna=$2 AND p.status_pesanan='Selesai' AND d.id_hewan=$3`,
    [orderId,req.user.id_pengguna,animalId]
  );
  if (!eligible.rowCount) return fail(res,409,'Ulasan hanya dapat diberikan untuk hewan dari pesanan selesai.');
  const duplicate = await db.query('SELECT 1 FROM ulasan WHERE id_pengguna=$1 AND id_pesanan=$2 AND id_hewan=$3', [req.user.id_pengguna,orderId,animalId]);
  if (duplicate.rowCount) return fail(res,409,'Ulasan untuk hewan di pesanan ini sudah pernah dikirim.');
  const result = await db.query(
    'INSERT INTO ulasan (id_pengguna,id_hewan,id_pesanan,rating,komentar) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [req.user.id_pengguna,animalId,orderId,score,komentar?.slice(0,500) || null]
  );
  res.status(201).json(result.rows[0]);
}));

app.get('/api/chat', requireUser, asyncRoute(async (req, res) => {
  await db.query(
    `UPDATE pesan_chat SET status_baca='Sudah Dibaca' WHERE id_chat IN (SELECT id_chat FROM chat WHERE id_pengguna=$1)
     AND id_pengirim<>$1 AND status_baca='Belum Dibaca'`, [req.user.id_pengguna]
  );
  const result = await db.query(
    `SELECT c.id_chat,c.status,COALESCE(json_agg(json_build_object('id_pesan',m.id_pesan,'id_pengirim',m.id_pengirim,'isi_pesan',m.isi_pesan,'waktu_kirim',m.waktu_kirim,'status_baca',m.status_baca) ORDER BY m.waktu_kirim) FILTER (WHERE m.id_pesan IS NOT NULL),'[]') AS messages
     FROM chat c LEFT JOIN pesan_chat m ON m.id_chat=c.id_chat WHERE c.id_pengguna=$1 GROUP BY c.id_chat ORDER BY c.id_chat DESC LIMIT 1`,
    [req.user.id_pengguna]
  );
  res.json(result.rows[0] || null);
}));

app.get('/api/admin/chat', requireUser, requireAdmin, asyncRoute(async (_req, res) => {
  const result = await db.query(
    `SELECT c.id_chat,c.id_pengguna,c.status,u.nama,u.email,
      COALESCE(json_agg(json_build_object('id_pesan',m.id_pesan,'id_pengirim',m.id_pengirim,'isi_pesan',m.isi_pesan,'waktu_kirim',m.waktu_kirim,'status_baca',m.status_baca) ORDER BY m.waktu_kirim) FILTER (WHERE m.id_pesan IS NOT NULL),'[]') AS messages
     FROM chat c JOIN pengguna u ON u.id_pengguna=c.id_pengguna LEFT JOIN pesan_chat m ON m.id_chat=c.id_chat
     GROUP BY c.id_chat,u.id_pengguna ORDER BY MAX(m.waktu_kirim) DESC NULLS LAST,c.id_chat DESC`
  );
  res.json(result.rows);
}));

app.get('/api/admin/chat/:id', requireUser, requireAdmin, asyncRoute(async (req, res) => {
  await db.query(
    `UPDATE pesan_chat SET status_baca='Sudah Dibaca' WHERE id_chat=$1 AND id_pengirim=(SELECT id_pengguna FROM chat WHERE id_chat=$1)
     AND status_baca='Belum Dibaca'`, [req.params.id]
  );
  const result = await db.query(
    `SELECT c.id_chat,c.id_pengguna,c.status,u.nama,u.email,
      COALESCE(json_agg(json_build_object('id_pesan',m.id_pesan,'id_pengirim',m.id_pengirim,'isi_pesan',m.isi_pesan,'waktu_kirim',m.waktu_kirim,'status_baca',m.status_baca) ORDER BY m.waktu_kirim) FILTER (WHERE m.id_pesan IS NOT NULL),'[]') AS messages
     FROM chat c JOIN pengguna u ON u.id_pengguna=c.id_pengguna LEFT JOIN pesan_chat m ON m.id_chat=c.id_chat
     WHERE c.id_chat=$1 GROUP BY c.id_chat,u.id_pengguna`, [req.params.id]
  );
  if (!result.rows[0]) return fail(res,404,'Percakapan tidak ditemukan.');
  res.json(result.rows[0]);
}));

app.post('/api/admin/chat/:id/pesan', requireUser, requireAdmin, asyncRoute(async (req, res) => {
  const text = req.body?.isi_pesan?.trim();
  if (!text) return fail(res,400,'Pesan tidak boleh kosong.');
  const result = await db.query(
    `INSERT INTO pesan_chat (id_chat,id_pengirim,isi_pesan)
     SELECT c.id_chat,$1,$3 FROM chat c WHERE c.id_chat=$2 RETURNING *`,
    [req.user.id_pengguna,req.params.id,text]
  );
  if (!result.rows[0]) return fail(res,404,'Percakapan tidak ditemukan.');
  res.status(201).json(result.rows[0]);
}));

app.post('/api/chat/pesan', requireUser, asyncRoute(async (req, res) => {
  const text = req.body?.isi_pesan?.trim();
  if (!text) return fail(res,400,'Pesan tidak boleh kosong.');
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const existing = await client.query('SELECT id_chat FROM chat WHERE id_pengguna=$1 ORDER BY id_chat DESC LIMIT 1 FOR UPDATE', [req.user.id_pengguna]);
    const chatId = existing.rows[0]?.id_chat ?? (await client.query("INSERT INTO chat (id_pengguna,status) VALUES ($1,'Aktif') RETURNING id_chat", [req.user.id_pengguna])).rows[0].id_chat;
    const result = await client.query('INSERT INTO pesan_chat (id_chat,id_pengirim,isi_pesan) VALUES ($1,$2,$3) RETURNING *', [chatId,req.user.id_pengguna,text]);
    await client.query('COMMIT');
    res.status(201).json(result.rows[0]);
  } catch (error) { await client.query('ROLLBACK'); throw error; }
  finally { client.release(); }
}));

app.use('/backend', (_req, res) => res.sendStatus(404));
app.get('/', (_req, res) => res.sendFile(path.join(publicDir, 'index.html')));
app.use(express.static(publicDir));
app.use((error, req, res, _next) => {
  console.error('API error:', req.method, req.originalUrl, error.code || '-', error.constraint || '-', error.message);
  if (['EACCES','ECONNREFUSED','ETIMEDOUT'].includes(error.code)) return fail(res,503,'Koneksi PostgreSQL gagal. Pastikan PostgreSQL aktif dan pengaturan backend/.env benar.');
  if (error.code === '28P01') return fail(res,503,'Login PostgreSQL gagal. Periksa DB_USER dan DB_PASSWORD di backend/.env.');
  if (error.code === '3D000') return fail(res,503,'Database MyKandang belum dibuat. Periksa DB_NAME di backend/.env.');
  if (error.code === '42P01') return fail(res,503,'Tabel database belum tersedia. Jalankan SQL MyKandang pada database yang dipakai backend.');
  if (error.code === '42703') return fail(res,503,'Kolom database belum sesuai. Perbarui skema SQL MyKandang.');
  if (error.code === '23505') {
    if (error.constraint?.toLowerCase().includes('email')) return fail(res,409,'Email sudah terdaftar. Gunakan email lain untuk membuat akun.');
    return fail(res,409,'Relasi data sudah tercatat.');
  }
  if (error.code === '23503') return fail(res,400,'Data terkait tidak ditemukan.');
  if (['22001','22P02','23502','23514'].includes(error.code)) return fail(res,400,'Nilai data tidak sesuai dengan aturan database.');
  if (error.status) return fail(res,error.status,error.message);
  if (error.message?.endsWith('tidak valid.')) return fail(res,400,error.message);
  res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
});

if (require.main === module) app.listen(PORT, () => console.log(`MyKandang siap di http://localhost:${PORT}`));

module.exports = app;
