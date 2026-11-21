const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
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

let featureSchemaPromise;
async function ensureFeatureSchema() {
  if (!featureSchemaPromise) {
    featureSchemaPromise = (async () => {
      const masterSql = fs.readFileSync(path.join(__dirname, '..', 'my_kandang.sql'), 'utf8');
      const startMarker = '-- BEGIN APP FEATURE SCHEMA';
      const endMarker = '-- END APP FEATURE SCHEMA';
      const start = masterSql.indexOf(startMarker);
      const end = masterSql.indexOf(endMarker, start + startMarker.length);
      if (start < 0 || end < 0) throw new Error('Bagian skema fitur tidak ditemukan di my_kandang.sql.');
      const sql = masterSql.slice(start + startMarker.length, end).trim();
      const client = await db.connect();
      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    })().catch(error => {
      featureSchemaPromise = null;
      throw error;
    });
  }
  return featureSchemaPromise;
}

async function createNotification(queryable, userId, title, message, type='info', data={}) {
  if (!userId) return;
  await queryable.query(
    'INSERT INTO notifikasi(id_pengguna,judul,pesan,jenis,data) VALUES ($1,$2,$3,$4,$5::jsonb)',
    [userId,title,message,type,JSON.stringify(data)]
  );
}

async function createOptionalNotification(queryable, userId, title, message, type='info', data={}) {
  await queryable.query('SAVEPOINT optional_notification');
  try {
    await createNotification(queryable,userId,title,message,type,data);
    await queryable.query('RELEASE SAVEPOINT optional_notification');
  } catch (error) {
    await queryable.query('ROLLBACK TO SAVEPOINT optional_notification');
    await queryable.query('RELEASE SAVEPOINT optional_notification');
    console.error('Notifikasi tambahan gagal disimpan:',error.message);
  }
}

function parseHandoffSchedule(value) {
  if (!value) return null;
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) throw Object.assign(new Error('Jadwal serah-terima tidak valid.'), { status: 400 });
  if (date.getTime() < Date.now() + 60 * 60 * 1000) throw Object.assign(new Error('Jadwal serah-terima harus minimal satu jam dari sekarang.'), { status: 400 });
  return date.toISOString();
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
    id_penjual: row.id_penjual || null,
    nama_penjual: row.nama_penjual || null,
    lokasi: row.lokasi_penjual || null,
    location: row.lokasi_penjual || null,
    rating_penjual: row.rating_penjual == null ? null : Number(row.rating_penjual),
    estimasi_biaya_transportasi: row.estimasi_biaya_transportasi == null ? null : Number(row.estimasi_biaya_transportasi),
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
    (SELECT COUNT(*) FROM ulasan u WHERE u.id_hewan = h.id_hewan) AS review_count,
    s.nama_toko AS nama_penjual,s.alamat AS lokasi_penjual,s.estimasi_biaya_transportasi,
    (SELECT AVG(u.rating)::numeric(3,2) FROM ulasan u JOIN hewan hs ON hs.id_hewan=u.id_hewan WHERE hs.id_penjual=s.id_penjual) AS rating_penjual
  FROM hewan h JOIN kategori_hewan k ON k.id_kategori = h.id_kategori
  LEFT JOIN penjual s ON s.id_penjual = h.id_penjual`;

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
  const identifier=String(req.body?.identifier||req.body?.email||'').trim();
  const password=req.body?.password;
  if (!identifier || !password) return fail(res, 400, 'Email atau nomor HP dan kata sandi wajib diisi.');
  const phoneDigits=identifier.replace(/\D/g,'');
  const result = await db.query("SELECT * FROM pengguna WHERE lower(email)=lower($1) OR ($2<>'' AND regexp_replace(COALESCE(no_telepon,''),'[^0-9]','','g')=$2) ORDER BY id_pengguna LIMIT 1", [identifier,phoneDigits]);
  const row = result.rows[0];
  if (!row || !row.password_hash.startsWith('scrypt:')) return fail(res, 401, 'Email/nomor HP atau kata sandi tidak sesuai.');
  const [, salt, expectedHex] = row.password_hash.split(':');
  const actual = await scrypt(password, salt, 64);
  const expected = Buffer.from(expectedHex, 'hex');
  if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) return fail(res, 401, 'Email/nomor HP atau kata sandi tidak sesuai.');
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

app.post('/api/admin/kategori', requireUser, requireAdmin, asyncRoute(async (req, res) => {
  const nama = req.body?.nama_kategori?.trim();
  const deskripsi = req.body?.deskripsi?.trim() || null;
  if (!nama) return fail(res,400,'Nama kategori wajib diisi.');
  const result = await db.query(
    'INSERT INTO kategori_hewan (nama_kategori,deskripsi) VALUES ($1,$2) RETURNING id_kategori,nama_kategori,deskripsi',
    [nama,deskripsi]
  );
  res.status(201).json(result.rows[0]);
}));

app.patch('/api/admin/kategori/:id', requireUser, requireAdmin, asyncRoute(async (req, res) => {
  const nama = req.body?.nama_kategori?.trim();
  const deskripsi = req.body?.deskripsi?.trim() || null;
  if (!nama) return fail(res,400,'Nama kategori wajib diisi.');
  const result = await db.query(
    'UPDATE kategori_hewan SET nama_kategori=$1,deskripsi=$2 WHERE id_kategori=$3 RETURNING id_kategori,nama_kategori,deskripsi',
    [nama,deskripsi,req.params.id]
  );
  if (!result.rows[0]) return fail(res,404,'Kategori tidak ditemukan.');
  res.json(result.rows[0]);
}));

app.delete('/api/admin/kategori/:id', requireUser, requireAdmin, asyncRoute(async (req, res) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const category = await client.query('SELECT id_kategori FROM kategori_hewan WHERE id_kategori=$1 FOR UPDATE',[req.params.id]);
    if (!category.rows[0]) { await client.query('ROLLBACK'); return fail(res,404,'Kategori tidak ditemukan.'); }
    const animalsInCategory = await client.query('SELECT 1 FROM hewan WHERE id_kategori=$1 LIMIT 1',[req.params.id]);
    if (animalsInCategory.rowCount) { await client.query('ROLLBACK'); return fail(res,409,'Kategori masih dipakai oleh data hewan. Pindahkan atau hapus hewannya terlebih dahulu.'); }
    await client.query('DELETE FROM kategori_hewan WHERE id_kategori=$1',[req.params.id]);
    await client.query('COMMIT');
    res.status(204).end();
  } catch (error) { await client.query('ROLLBACK'); throw error; }
  finally { client.release(); }
}));

app.get('/api/hewan', asyncRoute(async (req, res) => {
  await ensureFeatureSchema();
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
  await ensureFeatureSchema();
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

app.patch('/api/profil/password', requireUser, asyncRoute(async (req, res) => {
  const currentPassword=String(req.body?.current_password||'');
  const newPassword=String(req.body?.new_password||'');
  if(newPassword.length<8)return fail(res,400,'Kata sandi baru minimal 8 karakter.');
  const result=await db.query('SELECT password_hash FROM pengguna WHERE id_pengguna=$1',[req.user.id_pengguna]);
  const saved=result.rows[0]?.password_hash||'';
  if(!saved.startsWith('scrypt:'))return fail(res,409,'Kata sandi akun ini belum dapat diubah dari web.');
  const [,salt,expectedHex]=saved.split(':');
  const actual=await scrypt(currentPassword,salt,64);
  const expected=Buffer.from(expectedHex,'hex');
  if(actual.length!==expected.length||!crypto.timingSafeEqual(actual,expected))return fail(res,401,'Kata sandi saat ini tidak sesuai.');
  const nextSalt=crypto.randomBytes(16).toString('hex');
  const nextHash=await scrypt(newPassword,nextSalt,64);
  await db.query('UPDATE pengguna SET password_hash=$1 WHERE id_pengguna=$2',[`scrypt:${nextSalt}:${nextHash.toString('hex')}`,req.user.id_pengguna]);
  res.json({message:'Kata sandi berhasil diperbarui.'});
}));

app.get('/api/alamat', requireUser, asyncRoute(async (req, res) => {
  await ensureFeatureSchema();
  const result = await db.query(
    'SELECT id_alamat,label,nama_penerima,no_telepon,alamat,utama,dibuat FROM alamat_pengguna WHERE id_pengguna=$1 ORDER BY utama DESC,dibuat DESC,id_alamat DESC',
    [req.user.id_pengguna]
  );
  res.json(result.rows);
}));

app.post('/api/alamat', requireUser, asyncRoute(async (req, res) => {
  await ensureFeatureSchema();
  const label=req.body?.label?.trim()||'Alamat rumah';
  const nama=req.body?.nama_penerima?.trim()||'';
  const phone=req.body?.no_telepon?.trim()||null;
  const address=req.body?.alamat?.trim()||'';
  if(!nama||!address)return fail(res,400,'Nama penerima dan alamat wajib diisi.');
  if(nama.length>100||address.length>255||String(phone||'').length>20||label.length>60)return fail(res,400,'Label, kontak, atau alamat melebihi batas karakter.');
  const client=await db.connect();
  try{
    await client.query('BEGIN');
    const count=await client.query('SELECT COUNT(*)::int AS jumlah FROM alamat_pengguna WHERE id_pengguna=$1',[req.user.id_pengguna]);
    const isDefault=req.body?.utama===true||count.rows[0].jumlah===0;
    if(isDefault)await client.query('UPDATE alamat_pengguna SET utama=FALSE WHERE id_pengguna=$1',[req.user.id_pengguna]);
    const result=await client.query(
      'INSERT INTO alamat_pengguna(id_pengguna,label,nama_penerima,no_telepon,alamat,utama) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id_alamat,label,nama_penerima,no_telepon,alamat,utama,dibuat',
      [req.user.id_pengguna,label,nama,phone,address,isDefault]
    );
    if(isDefault)await client.query('UPDATE pengguna SET alamat=$1,no_telepon=COALESCE($2,no_telepon) WHERE id_pengguna=$3',[address,phone,req.user.id_pengguna]);
    await client.query('COMMIT');
    res.status(201).json(result.rows[0]);
  }catch(error){await client.query('ROLLBACK');throw error;}finally{client.release();}
}));

app.patch('/api/alamat/:id', requireUser, asyncRoute(async (req, res) => {
  await ensureFeatureSchema();
  const client=await db.connect();
  try{
    await client.query('BEGIN');
    const existing=await client.query('SELECT * FROM alamat_pengguna WHERE id_alamat=$1 AND id_pengguna=$2 FOR UPDATE',[req.params.id,req.user.id_pengguna]);
    if(!existing.rows[0]){await client.query('ROLLBACK');return fail(res,404,'Alamat tidak ditemukan.');}
    const current=existing.rows[0];
    const label=req.body?.label===undefined?current.label:(req.body.label.trim()||'Alamat rumah');
    const nama=req.body?.nama_penerima===undefined?current.nama_penerima:req.body.nama_penerima.trim();
    const phone=req.body?.no_telepon===undefined?current.no_telepon:(req.body.no_telepon.trim()||null);
    const address=req.body?.alamat===undefined?current.alamat:req.body.alamat.trim();
    const isDefault=req.body?.utama===undefined?current.utama:req.body.utama===true||req.body.utama==='true';
    if(!nama||!address){await client.query('ROLLBACK');return fail(res,400,'Nama penerima dan alamat wajib diisi.');}
    if(nama.length>100||address.length>255||String(phone||'').length>20||label.length>60){await client.query('ROLLBACK');return fail(res,400,'Label, kontak, atau alamat melebihi batas karakter.');}
    if(isDefault)await client.query('UPDATE alamat_pengguna SET utama=FALSE WHERE id_pengguna=$1',[req.user.id_pengguna]);
    const result=await client.query(
      'UPDATE alamat_pengguna SET label=$1,nama_penerima=$2,no_telepon=$3,alamat=$4,utama=$5 WHERE id_alamat=$6 AND id_pengguna=$7 RETURNING id_alamat,label,nama_penerima,no_telepon,alamat,utama,dibuat',
      [label,nama,phone,address,isDefault,req.params.id,req.user.id_pengguna]
    );
    if(isDefault)await client.query('UPDATE pengguna SET alamat=$1,no_telepon=COALESCE($2,no_telepon) WHERE id_pengguna=$3',[address,phone,req.user.id_pengguna]);
    await client.query('COMMIT');
    res.json(result.rows[0]);
  }catch(error){await client.query('ROLLBACK');throw error;}finally{client.release();}
}));

app.patch('/api/alamat/:id/utama', requireUser, asyncRoute(async (req, res) => {
  await ensureFeatureSchema();
  const client=await db.connect();
  try{
    await client.query('BEGIN');
    const address=await client.query('SELECT * FROM alamat_pengguna WHERE id_alamat=$1 AND id_pengguna=$2 FOR UPDATE',[req.params.id,req.user.id_pengguna]);
    if(!address.rows[0]){await client.query('ROLLBACK');return fail(res,404,'Alamat tidak ditemukan.');}
    await client.query('UPDATE alamat_pengguna SET utama=FALSE WHERE id_pengguna=$1',[req.user.id_pengguna]);
    const result=await client.query('UPDATE alamat_pengguna SET utama=TRUE WHERE id_alamat=$1 RETURNING id_alamat,label,nama_penerima,no_telepon,alamat,utama,dibuat',[req.params.id]);
    await client.query('UPDATE pengguna SET alamat=$1,no_telepon=COALESCE($2,no_telepon) WHERE id_pengguna=$3',[address.rows[0].alamat,address.rows[0].no_telepon,req.user.id_pengguna]);
    await client.query('COMMIT');
    res.json(result.rows[0]);
  }catch(error){await client.query('ROLLBACK');throw error;}finally{client.release();}
}));

app.delete('/api/alamat/:id', requireUser, asyncRoute(async (req, res) => {
  await ensureFeatureSchema();
  const client=await db.connect();
  try{
    await client.query('BEGIN');
    const address=await client.query('SELECT * FROM alamat_pengguna WHERE id_alamat=$1 AND id_pengguna=$2 FOR UPDATE',[req.params.id,req.user.id_pengguna]);
    if(!address.rows[0]){await client.query('ROLLBACK');return fail(res,404,'Alamat tidak ditemukan.');}
    await client.query('DELETE FROM alamat_pengguna WHERE id_alamat=$1',[req.params.id]);
    if(address.rows[0].utama){
      const next=await client.query('SELECT * FROM alamat_pengguna WHERE id_pengguna=$1 ORDER BY dibuat DESC,id_alamat DESC LIMIT 1 FOR UPDATE',[req.user.id_pengguna]);
      if(next.rows[0]){
        await client.query('UPDATE alamat_pengguna SET utama=TRUE WHERE id_alamat=$1',[next.rows[0].id_alamat]);
        await client.query('UPDATE pengguna SET alamat=$1,no_telepon=COALESCE($2,no_telepon) WHERE id_pengguna=$3',[next.rows[0].alamat,next.rows[0].no_telepon,req.user.id_pengguna]);
      }else await client.query("UPDATE pengguna SET alamat=NULL WHERE id_pengguna=$1",[req.user.id_pengguna]);
    }
    await client.query('COMMIT');
    res.status(204).end();
  }catch(error){await client.query('ROLLBACK');throw error;}finally{client.release();}
}));

app.get('/api/penjual', asyncRoute(async (_req, res) => {
  await ensureFeatureSchema();
  const result=await db.query(
    `SELECT s.id_penjual,s.nama_toko,s.deskripsi,s.alamat,s.foto_url,s.status,
      (SELECT COUNT(*)::int FROM hewan h WHERE h.id_penjual=s.id_penjual AND h.status='Tersedia' AND h.stok>0) AS jumlah_hewan,
      (SELECT ROUND(AVG(u.rating)::numeric,1) FROM ulasan u JOIN hewan h ON h.id_hewan=u.id_hewan WHERE h.id_penjual=s.id_penjual) AS rating
     FROM penjual s WHERE s.status='Aktif' ORDER BY s.nama_toko`
  );
  res.json(result.rows);
}));

app.get('/api/penjual/saya', requireUser, asyncRoute(async (req, res) => {
  await ensureFeatureSchema();
  const result=await db.query(
    'SELECT id_penjual,id_pengguna,nama_toko,deskripsi,no_telepon,alamat,foto_url,estimasi_biaya_transportasi,status,dibuat FROM penjual WHERE id_pengguna=$1',
    [req.user.id_pengguna]
  );
  res.json(result.rows[0]||null);
}));

app.post('/api/penjual/saya', requireUser, asyncRoute(async (req, res) => {
  await ensureFeatureSchema();
  const nama=req.body?.nama_toko?.trim();
  const description=req.body?.deskripsi?.trim()||null;
  const phone=req.body?.no_telepon?.trim()||null;
  const address=req.body?.alamat?.trim()||null;
  const photo=req.body?.foto_url?.trim()||null;
  const transportCost=req.body?.estimasi_biaya_transportasi==null||req.body.estimasi_biaya_transportasi===''?null:parseNumber(req.body.estimasi_biaya_transportasi,'Estimasi biaya transportasi',{min:0,integer:true});
  if(!nama)return fail(res,400,'Nama usaha wajib diisi.');
  if(photo){try{const url=new URL(photo);if(!['http:','https:'].includes(url.protocol))throw new Error();}catch{return fail(res,400,'URL foto profil tidak valid.');}}
  const result=await db.query(
    `INSERT INTO penjual(id_pengguna,nama_toko,deskripsi,no_telepon,alamat,foto_url,estimasi_biaya_transportasi,status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,'Menunggu')
     ON CONFLICT (id_pengguna) DO UPDATE SET nama_toko=EXCLUDED.nama_toko,deskripsi=EXCLUDED.deskripsi,
       no_telepon=EXCLUDED.no_telepon,alamat=EXCLUDED.alamat,foto_url=EXCLUDED.foto_url,estimasi_biaya_transportasi=EXCLUDED.estimasi_biaya_transportasi,
       status=CASE WHEN penjual.status='Aktif' THEN 'Aktif' ELSE 'Menunggu' END
     RETURNING id_penjual,id_pengguna,nama_toko,deskripsi,no_telepon,alamat,foto_url,estimasi_biaya_transportasi,status,dibuat`,
    [req.user.id_pengguna,nama,description,phone,address,photo,transportCost]
  );
  res.status(201).json(result.rows[0]);
}));

app.get('/api/penjual/:id', asyncRoute(async (req, res) => {
  await ensureFeatureSchema();
  const result=await db.query(
    `SELECT s.id_penjual,s.nama_toko,s.deskripsi,s.no_telepon,s.alamat,s.foto_url,s.dibuat,u.nama AS nama_pemilik,
      (SELECT COUNT(*)::int FROM hewan h WHERE h.id_penjual=s.id_penjual AND h.status='Tersedia' AND h.stok>0) AS jumlah_hewan,
      (SELECT ROUND(AVG(ul.rating)::numeric,1) FROM ulasan ul JOIN hewan h ON h.id_hewan=ul.id_hewan WHERE h.id_penjual=s.id_penjual) AS rating
     FROM penjual s JOIN pengguna u ON u.id_pengguna=s.id_pengguna WHERE s.id_penjual=$1 AND s.status='Aktif'`,
    [req.params.id]
  );
  if(!result.rows[0])return fail(res,404,'Profil penjual tidak ditemukan.');
  const animals=await db.query(`${animalSelect} WHERE h.id_penjual=$1 AND h.stok>0 AND h.status='Tersedia' ORDER BY h.id_hewan DESC`,[req.params.id]);
  const reviews=await db.query(
    `SELECT u.id_ulasan,u.rating,u.komentar,u.tanggal,p.nama AS nama_pengguna,h.nama AS nama_hewan
     FROM ulasan u JOIN hewan h ON h.id_hewan=u.id_hewan JOIN pengguna p ON p.id_pengguna=u.id_pengguna
     WHERE h.id_penjual=$1 ORDER BY u.tanggal DESC,u.id_ulasan DESC LIMIT 20`,[req.params.id]
  );
  res.json({...result.rows[0],animals:animals.rows.map(publicAnimal),reviews:reviews.rows});
}));

app.get('/api/hewan/:id/penjual', asyncRoute(async (req, res) => {
  await ensureFeatureSchema();
  const result=await db.query(
    `SELECT s.id_penjual,s.nama_toko,s.deskripsi,s.no_telepon,s.alamat,s.foto_url,s.status,
      (SELECT COUNT(*)::int FROM hewan h WHERE h.id_penjual=s.id_penjual AND h.status='Tersedia' AND h.stok>0) AS jumlah_hewan,
      (SELECT ROUND(AVG(u.rating)::numeric,1) FROM ulasan u JOIN hewan h ON h.id_hewan=u.id_hewan WHERE h.id_penjual=s.id_penjual) AS rating
     FROM hewan h JOIN penjual s ON s.id_penjual=h.id_penjual WHERE h.id_hewan=$1 AND s.status='Aktif'`,
    [req.params.id]
  );
  res.json(result.rows[0]||null);
}));

app.get('/api/admin/penjual', requireUser, requireAdmin, asyncRoute(async (_req, res) => {
  await ensureFeatureSchema();
  const result=await db.query(
    `SELECT s.id_penjual,s.id_pengguna,s.nama_toko,s.deskripsi,s.no_telepon,s.alamat,s.foto_url,s.status,s.dibuat,u.nama,u.email,
      (SELECT COUNT(*)::int FROM hewan h WHERE h.id_penjual=s.id_penjual) AS jumlah_hewan
     FROM penjual s JOIN pengguna u ON u.id_pengguna=s.id_pengguna ORDER BY CASE s.status WHEN 'Menunggu' THEN 0 ELSE 1 END,s.dibuat DESC`
  );
  res.json(result.rows);
}));

app.patch('/api/admin/penjual/:id', requireUser, requireAdmin, asyncRoute(async (req, res) => {
  await ensureFeatureSchema();
  const status=req.body?.status;
  if(!['Aktif','Ditolak','Nonaktif'].includes(status))return fail(res,400,'Status penjual tidak valid.');
  const result=await db.query(
    'UPDATE penjual SET status=$1 WHERE id_penjual=$2 RETURNING id_penjual,id_pengguna,nama_toko,status',
    [status,req.params.id]
  );
  if(!result.rows[0])return fail(res,404,'Pengajuan penjual tidak ditemukan.');
  try{
    await createNotification(db,result.rows[0].id_pengguna,
      status==='Aktif'?'Profil penjual disetujui':'Status pengajuan penjual diperbarui',
      status==='Aktif'?'Profil tokomu sudah aktif dan dapat dilihat pelanggan.':`Status profil tokomu: ${status}.`,
      'seller',{id_penjual:result.rows[0].id_penjual});
  }catch(error){console.error('Notifikasi status penjual gagal disimpan:',error.message);}
  res.json(result.rows[0]);
}));

app.get('/api/notifikasi', requireUser, asyncRoute(async (req, res) => {
  await ensureFeatureSchema();
  const result=await db.query(
    'SELECT id_notifikasi,judul,pesan,jenis,data,dibaca,dibuat FROM notifikasi WHERE id_pengguna=$1 ORDER BY dibuat DESC,id_notifikasi DESC LIMIT 100',
    [req.user.id_pengguna]
  );
  res.json({items:result.rows,unread:result.rows.filter(item=>!item.dibaca).length});
}));

app.patch('/api/notifikasi/semua/dibaca', requireUser, asyncRoute(async (req, res) => {
  await ensureFeatureSchema();
  await db.query('UPDATE notifikasi SET dibaca=TRUE WHERE id_pengguna=$1 AND dibaca=FALSE',[req.user.id_pengguna]);
  res.json({dibaca:true});
}));

app.patch('/api/notifikasi/:id', requireUser, asyncRoute(async (req, res) => {
  await ensureFeatureSchema();
  const result=await db.query(
    'UPDATE notifikasi SET dibaca=TRUE WHERE id_notifikasi=$1 AND id_pengguna=$2 RETURNING id_notifikasi,dibaca',
    [req.params.id,req.user.id_pengguna]
  );
  if(!result.rows[0])return fail(res,404,'Notifikasi tidak ditemukan.');
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

app.delete('/api/admin/pengguna/:id', requireUser, requireAdmin, asyncRoute(async (req, res) => {
  const userId = parseNumber(req.params.id,'Akun',{min:1,integer:true});
  if (userId === req.user.id_pengguna) return fail(res,409,'Akun admin yang sedang digunakan tidak dapat dihapus.');
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const user = await client.query('SELECT id_pengguna,role FROM pengguna WHERE id_pengguna=$1 FOR UPDATE',[userId]);
    if (!user.rows[0]) { await client.query('ROLLBACK'); return fail(res,404,'Akun tidak ditemukan.'); }
    if (user.rows[0].role === 'staff_admin') { await client.query('ROLLBACK'); return fail(res,409,'Akun staff admin dilindungi dan tidak dapat dihapus.'); }
    await client.query(
      'DELETE FROM ulasan WHERE id_pengguna=$1 OR id_pesanan IN (SELECT id_pesanan FROM pesanan WHERE id_pengguna=$1)',
      [userId]
    );
    await client.query('DELETE FROM pesan_chat WHERE id_pengirim=$1',[userId]);
    await client.query('DELETE FROM chat WHERE id_pengguna=$1',[userId]);
    await client.query('DELETE FROM pesanan WHERE id_pengguna=$1',[userId]);
    await client.query('DELETE FROM wishlist WHERE id_pengguna=$1',[userId]);
    await client.query('DELETE FROM keranjang WHERE id_pengguna=$1',[userId]);
    await client.query('DELETE FROM pengguna WHERE id_pengguna=$1',[userId]);
    await client.query('COMMIT');
    res.status(204).end();
  } catch (error) { await client.query('ROLLBACK'); throw error; }
  finally { client.release(); }
}));

app.get('/api/admin/pesanan', requireUser, requireAdmin, asyncRoute(async (_req, res) => {
  const result = await db.query(
    `SELECT p.*,u.nama AS nama_pelanggan,u.email,
      COALESCE(json_agg(json_build_object('id_hewan',h.id_hewan,'nama',h.nama,'kuantitas',dp.kuantitas,'harga_satuan',dp.harga_satuan,'subtotal',dp.subtotal)) FILTER (WHERE h.id_hewan IS NOT NULL),'[]') AS details,
      pb.status AS status_pembayaran,pb.metode AS metode_pembayaran,pb.jumlah AS jumlah_pembayaran
     FROM pesanan p JOIN pengguna u ON u.id_pengguna=p.id_pengguna
     LEFT JOIN detail_pesanan dp ON dp.id_pesanan=p.id_pesanan LEFT JOIN hewan h ON h.id_hewan=dp.id_hewan
     LEFT JOIN pembayaran pb ON pb.id_pesanan=p.id_pesanan
     GROUP BY p.id_pesanan,u.id_pengguna,pb.status,pb.metode,pb.jumlah ORDER BY p.tgl_pesanan DESC`
  );
  res.json(result.rows);
}));

app.post('/api/admin/hewan', requireUser, requireAdmin, asyncRoute(async (req, res) => {
  const data = req.body || {};
  const hasSellerField=Object.prototype.hasOwnProperty.call(data,'id_penjual');
  if(hasSellerField)await ensureFeatureSchema();
  const idKategori = parseNumber(data.id_kategori,'Kategori',{min:1,integer:true});
  const nama = data.nama?.trim();
  const harga = parseNumber(data.harga,'Harga');
  const stok = parseNumber(data.stok,'Stok',{min:0,integer:true});
  if (!nama) return fail(res,400,'Nama hewan wajib diisi.');
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    let result;
    const values=[idKategori,nama,data.jenis||null,data.ras||null,data.jenis_kelamin||null,
      parseNumber(data.berat,'Berat',{min:0,optional:true}),parseNumber(data.umur,'Umur',{min:0,integer:true,optional:true}),
      data.kondisi_kesehatan||null,harga,stok,data.deskripsi||null,stok===0?(data.status==='Terjual'?'Terjual':'Habis'):(data.status||'Tersedia')];
    if(hasSellerField){
      const sellerId=data.id_penjual?parseNumber(data.id_penjual,'Penjual',{min:1,integer:true}):null;
      if(sellerId){const seller=await client.query("SELECT id_penjual FROM penjual WHERE id_penjual=$1 AND status='Aktif'",[sellerId]);if(!seller.rows[0]){await client.query('ROLLBACK');return fail(res,400,'Pilih profil penjual yang sudah aktif.');}}
      result=await client.query(
        `INSERT INTO hewan (id_kategori,nama,jenis,ras,jenis_kelamin,berat,umur,kondisi_kesehatan,harga,stok,deskripsi,status,id_penjual)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING id_hewan`,[...values,sellerId]
      );
    }else{
      result=await client.query(
        `INSERT INTO hewan (id_kategori,nama,jenis,ras,jenis_kelamin,berat,umur,kondisi_kesehatan,harga,stok,deskripsi,status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id_hewan`,values
      );
    }
    if (data.gambar_url?.trim()) await client.query('INSERT INTO gambar_hewan (id_hewan,url,gambar_utama) VALUES ($1,$2,TRUE)',[result.rows[0].id_hewan,data.gambar_url.trim()]);
    await client.query('COMMIT');
    res.status(201).json({ id_hewan:result.rows[0].id_hewan });
  } catch (error) { await client.query('ROLLBACK'); throw error; }
  finally { client.release(); }
}));

app.patch('/api/admin/hewan/:id', requireUser, requireAdmin, asyncRoute(async (req, res) => {
  const data = req.body || {};
  const hasSellerField=Object.prototype.hasOwnProperty.call(data,'id_penjual');
  if(hasSellerField)await ensureFeatureSchema();
  const idKategori = parseNumber(data.id_kategori,'Kategori',{min:1,integer:true});
  const nama = data.nama?.trim();
  const harga = parseNumber(data.harga,'Harga');
  const stok = parseNumber(data.stok,'Stok',{min:0,integer:true});
  if (!nama) return fail(res,400,'Nama hewan wajib diisi.');
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    let result;
    const values=[idKategori,nama,data.jenis||null,data.ras||null,data.jenis_kelamin||null,
      parseNumber(data.berat,'Berat',{min:0,optional:true}),parseNumber(data.umur,'Umur',{min:0,integer:true,optional:true}),
      data.kondisi_kesehatan||null,harga,stok,data.deskripsi||null,stok===0?(data.status==='Terjual'?'Terjual':'Habis'):(data.status||'Tersedia')];
    if(hasSellerField){
      const sellerId=data.id_penjual?parseNumber(data.id_penjual,'Penjual',{min:1,integer:true}):null;
      if(sellerId){const seller=await client.query("SELECT id_penjual FROM penjual WHERE id_penjual=$1 AND status='Aktif'",[sellerId]);if(!seller.rows[0]){await client.query('ROLLBACK');return fail(res,400,'Pilih profil penjual yang sudah aktif.');}}
      result=await client.query(
        `UPDATE hewan SET id_kategori=$1,nama=$2,jenis=$3,ras=$4,jenis_kelamin=$5,berat=$6,umur=$7,
         kondisi_kesehatan=$8,harga=$9,stok=$10,deskripsi=$11,status=$12,id_penjual=$13 WHERE id_hewan=$14 RETURNING id_hewan`,
        [...values,sellerId,req.params.id]
      );
    }else{
      result=await client.query(
        `UPDATE hewan SET id_kategori=$1,nama=$2,jenis=$3,ras=$4,jenis_kelamin=$5,berat=$6,umur=$7,
         kondisi_kesehatan=$8,harga=$9,stok=$10,deskripsi=$11,status=$12 WHERE id_hewan=$13 RETURNING id_hewan`,
        [...values,req.params.id]
      );
    }
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

app.delete('/api/admin/hewan/:id', requireUser, requireAdmin, asyncRoute(async (req, res) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const animal = await client.query('SELECT id_hewan FROM hewan WHERE id_hewan=$1 FOR UPDATE',[req.params.id]);
    if (!animal.rows[0]) { await client.query('ROLLBACK'); return fail(res,404,'Hewan tidak ditemukan.'); }
    const history = await client.query(
      `SELECT EXISTS(SELECT 1 FROM detail_pesanan WHERE id_hewan=$1)
           OR EXISTS(SELECT 1 FROM ulasan WHERE id_hewan=$1) AS has_history`,
      [req.params.id]
    );
    if (history.rows[0].has_history) {
      await client.query('ROLLBACK');
      return fail(res,409,'Hewan memiliki riwayat pesanan atau ulasan, sehingga tidak dapat dihapus. Ubah stok/statusnya menjadi Habis atau Terjual.');
    }
    await client.query('DELETE FROM detail_keranjang WHERE id_hewan=$1',[req.params.id]);
    await client.query('DELETE FROM wishlist WHERE id_hewan=$1',[req.params.id]);
    await client.query('DELETE FROM gambar_hewan WHERE id_hewan=$1',[req.params.id]);
    await client.query('DELETE FROM hewan WHERE id_hewan=$1',[req.params.id]);
    await client.query('COMMIT');
    res.status(204).end();
  } catch (error) { await client.query('ROLLBACK'); throw error; }
  finally { client.release(); }
}));

app.patch('/api/admin/pesanan/:id', requireUser, requireAdmin, asyncRoute(async (req, res) => {
  const { status_pesanan, status_pembayaran } = req.body || {};
  let featureSchemaReady=false;
  try{await ensureFeatureSchema();featureSchemaReady=true;}catch(error){console.error('Notifikasi belum tersedia:',error.message);}
  const validOrderStates = ['Pending','Diproses','Selesai','Dibatalkan'];
  const validPaymentStates = ['Belum Dibayar','Berhasil'];
  if (!validOrderStates.includes(status_pesanan) || !validPaymentStates.includes(status_pembayaran)) return fail(res,400,'Status pesanan atau pembayaran tidak valid.');
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const order = await client.query('SELECT p.id_pesanan,p.id_pengguna,p.status_pesanan,pb.status AS status_pembayaran FROM pesanan p LEFT JOIN pembayaran pb ON pb.id_pesanan=p.id_pesanan WHERE p.id_pesanan=$1 FOR UPDATE OF p',[req.params.id]);
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
    if(featureSchemaReady&&(status_pesanan!==order.rows[0].status_pesanan||status_pembayaran!==order.rows[0].status_pembayaran)){
      try{
        const title=status_pembayaran!==order.rows[0].status_pembayaran?'Status pembayaran diperbarui':'Status pesanan diperbarui';
        const message=status_pembayaran!==order.rows[0].status_pembayaran?`Pembayaran pesanan #${order.rows[0].id_pesanan}: ${status_pembayaran}.`:`Pesanan #${order.rows[0].id_pesanan}: ${status_pesanan}.`;
        await createOptionalNotification(client,order.rows[0].id_pengguna,title,message,'order',{id_pesanan:order.rows[0].id_pesanan});
      }catch(error){console.error('Notifikasi status pesanan gagal:',error.message);}
    }
    await client.query('COMMIT');
    res.json({ status_pesanan,status_pembayaran });
  } catch (error) { await client.query('ROLLBACK'); throw error; }
  finally { client.release(); }
}));

app.get('/api/wishlist', requireUser, asyncRoute(async (req, res) => {
  await ensureFeatureSchema();
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
  await ensureFeatureSchema();
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
  let address = req.body?.alamat_pengiriman || null;
  let addressId=req.body?.id_alamat?parseNumber(req.body.id_alamat,'Alamat',{min:1,integer:true}):null;
  const wantsFeatureFields=Boolean(addressId||req.body?.jadwal_serah_terima);
  let featureSchemaReady=false;
  if(wantsFeatureFields){
    try{await ensureFeatureSchema();featureSchemaReady=true;}
    catch(error){console.error('Fitur alamat/jadwal belum tersedia; pesanan tetap memakai alur lama:',error.message);addressId=null;}
  }
  const featureFields=wantsFeatureFields&&featureSchemaReady;
  const handoffSchedule=parseHandoffSchedule(req.body?.jadwal_serah_terima);
  const items = Array.isArray(req.body?.items) ? req.body.items : [];
  if (!['Kirim Kurir','Ambil di Kandang'].includes(method)) return fail(res, 400, 'Metode serah terima tidak valid.');
  if (method === 'Kirim Kurir' && !address && !addressId) return fail(res, 400, 'Alamat pengiriman wajib diisi.');
  if (address && address.length>255) return fail(res,400,'Alamat pengiriman maksimal 255 karakter.');
  if (!items.length) return fail(res, 400, 'Keranjang pesanan kosong.');
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    if(addressId){
      const selected=await client.query('SELECT alamat FROM alamat_pengguna WHERE id_alamat=$1 AND id_pengguna=$2',[addressId,req.user.id_pengguna]);
      if(!selected.rows[0]){await client.query('ROLLBACK');return fail(res,404,'Alamat pengiriman tidak ditemukan.');}
      address=selected.rows[0].alamat;
    }
    const animalIds = items.map(item => item.id_hewan);
    const locked = featureFields
      ? await client.query('SELECT h.id_hewan,h.harga,h.stok,h.status,h.id_penjual,s.estimasi_biaya_transportasi FROM hewan h LEFT JOIN penjual s ON s.id_penjual=h.id_penjual WHERE h.id_hewan=ANY($1::int[]) FOR UPDATE OF h', [animalIds])
      : await client.query('SELECT id_hewan,harga,stok,status FROM hewan WHERE id_hewan=ANY($1::int[]) FOR UPDATE', [animalIds]);
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
      return { id: animal.id_hewan, price, quantity, stock: animal.stok, sellerId: animal.id_penjual, transportEstimate: animal.estimasi_biaya_transportasi==null?null:Number(animal.estimasi_biaya_transportasi) };
    });
    const distinctSellerRates=new Map();
    for(const item of normalized)if(item.sellerId)distinctSellerRates.set(Number(item.sellerId),item.transportEstimate);
    const transportNeedsConfirmation=method==='Kirim Kurir'&&(!normalized.length||normalized.some(item=>!item.sellerId||item.transportEstimate==null));
    const transportEstimate=method==='Ambil di Kandang'?0:transportNeedsConfirmation?null:[...distinctSellerRates.values()].reduce((sum,value)=>sum+value,0);
    if(featureFields&&transportEstimate!=null)total+=transportEstimate;
    const order = featureFields ? await client.query(
      `INSERT INTO pesanan (id_pengguna,total_harga,metode_serah_terima,alamat_pengiriman,jadwal_serah_terima,estimasi_biaya_transportasi,status_pesanan)
       VALUES ($1,$2,$3,$4,$5,$6,'Pending') RETURNING *`,
      [req.user.id_pengguna,total,method,address,handoffSchedule,transportEstimate]
    ) : await client.query(
      `INSERT INTO pesanan (id_pengguna,total_harga,metode_serah_terima,alamat_pengiriman,status_pesanan)
       VALUES ($1,$2,$3,$4,'Pending') RETURNING *`,
      [req.user.id_pengguna,total,method,address]
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
    try{
      await ensureFeatureSchema();
      await createNotification(db,req.user.id_pengguna,'Pesanan berhasil dibuat',`Pesanan MK-${String(order.rows[0].id_pesanan).padStart(6,'0')} sedang menunggu konfirmasi.`,'order',{id_pesanan:order.rows[0].id_pesanan});
      const sellers=await db.query('SELECT DISTINCT s.id_pengguna,s.nama_toko FROM detail_pesanan d JOIN hewan h ON h.id_hewan=d.id_hewan JOIN penjual s ON s.id_penjual=h.id_penjual WHERE d.id_pesanan=$1 AND s.status=\'Aktif\'',[order.rows[0].id_pesanan]);
      for(const seller of sellers.rows)await createNotification(db,seller.id_pengguna,'Pesanan baru',`Ada pesanan baru untuk produk dari ${seller.nama_toko}.`,'order',{id_pesanan:order.rows[0].id_pesanan});
    }catch(error){console.error('Notifikasi pesanan gagal disimpan:',error.message);}
    res.status(201).json({ ...order.rows[0], details: normalized, pembayaran: { status: 'Belum Dibayar', jumlah: total } });
  } catch (error) { await client.query('ROLLBACK'); throw error; }
  finally { client.release(); }
}));

app.get('/api/pesanan', requireUser, asyncRoute(async (req, res) => {
  await ensureFeatureSchema();
  const result = await db.query(
    `SELECT p.*, COALESCE(json_agg(json_build_object('id_hewan',h.id_hewan,'nama',h.nama,'id_penjual',h.id_penjual,'nama_penjual',s.nama_toko,'harga_satuan',dp.harga_satuan,'kuantitas',dp.kuantitas,'subtotal',dp.subtotal,'sudah_diulas',EXISTS(SELECT 1 FROM ulasan u WHERE u.id_pesanan=p.id_pesanan AND u.id_hewan=h.id_hewan AND u.id_pengguna=p.id_pengguna))) FILTER (WHERE h.id_hewan IS NOT NULL),'[]') AS details,
      pb.status AS status_pembayaran,pb.metode AS metode_pembayaran,pb.jumlah AS jumlah_pembayaran
     FROM pesanan p LEFT JOIN detail_pesanan dp ON dp.id_pesanan=p.id_pesanan LEFT JOIN hewan h ON h.id_hewan=dp.id_hewan LEFT JOIN penjual s ON s.id_penjual=h.id_penjual
     LEFT JOIN pembayaran pb ON pb.id_pesanan=p.id_pesanan WHERE p.id_pengguna=$1
     GROUP BY p.id_pesanan,pb.status,pb.metode,pb.jumlah ORDER BY p.tgl_pesanan DESC`, [req.user.id_pengguna]
  );
  res.json(result.rows);
}));

app.get('/api/pesanan/:id', requireUser, asyncRoute(async (req, res) => {
  await ensureFeatureSchema();
  const result = await db.query(
    `SELECT p.*, COALESCE(json_agg(json_build_object('id_hewan',h.id_hewan,'nama',h.nama,'harga_satuan',dp.harga_satuan,'kuantitas',dp.kuantitas,'subtotal',dp.subtotal,'sudah_diulas',EXISTS(SELECT 1 FROM ulasan u WHERE u.id_pesanan=p.id_pesanan AND u.id_hewan=h.id_hewan AND u.id_pengguna=p.id_pengguna))) FILTER (WHERE h.id_hewan IS NOT NULL),'[]') AS details,
      pb.id_pembayaran,pb.status AS status_pembayaran,pb.metode AS metode_pembayaran,pb.jumlah AS jumlah_pembayaran,
      pb.tanggal_bayar
     FROM pesanan p LEFT JOIN detail_pesanan dp ON dp.id_pesanan=p.id_pesanan LEFT JOIN hewan h ON h.id_hewan=dp.id_hewan
     LEFT JOIN pembayaran pb ON pb.id_pesanan=p.id_pesanan WHERE p.id_pengguna=$1 AND p.id_pesanan=$2
     GROUP BY p.id_pesanan,pb.id_pembayaran`, [req.user.id_pengguna,req.params.id]
  );
  if (!result.rows[0]) return fail(res, 404, 'Pesanan tidak ditemukan.');
  res.json(result.rows[0]);
}));

app.patch('/api/pesanan/:id/batal', requireUser, asyncRoute(async (req, res) => {
  const reason=String(req.body?.alasan_pembatalan||'').trim();
  if(reason.length>500)return fail(res,400,'Alasan pembatalan maksimal 500 karakter.');
  let featureSchemaReady=false;
  try{await ensureFeatureSchema();featureSchemaReady=true;}
  catch(error){console.error('Alasan pembatalan belum tersedia; pesanan tetap memakai alur lama:',error.message);}
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const found = await client.query('SELECT p.id_pesanan,p.status_pesanan,pb.status AS status_pembayaran FROM pesanan p LEFT JOIN pembayaran pb ON pb.id_pesanan=p.id_pesanan WHERE p.id_pesanan=$1 AND p.id_pengguna=$2 FOR UPDATE OF p', [req.params.id,req.user.id_pengguna]);
    if (!found.rows[0]) { await client.query('ROLLBACK'); return fail(res,404,'Pesanan tidak ditemukan.'); }
    if (found.rows[0].status_pesanan !== 'Pending') { await client.query('ROLLBACK'); return fail(res,409,'Pesanan yang sudah diproses tidak dapat dibatalkan dari web.'); }
    if(featureSchemaReady)await client.query("UPDATE pesanan SET status_pesanan='Dibatalkan',alasan_pembatalan=$2 WHERE id_pesanan=$1", [req.params.id,reason||null]);
    else await client.query("UPDATE pesanan SET status_pesanan='Dibatalkan' WHERE id_pesanan=$1", [req.params.id]);
    // Pembayaran di aplikasi ini hanya status simulasi otomatis, jadi batalkan statusnya tanpa refund transaksi nyata.
    if(found.rows[0].status_pembayaran==='Berhasil')await client.query("UPDATE pembayaran SET status='Belum Dibayar',tanggal_bayar=NULL WHERE id_pesanan=$1",[req.params.id]);
    const items = await client.query('SELECT id_hewan,kuantitas FROM detail_pesanan WHERE id_pesanan=$1', [req.params.id]);
    for (const item of items.rows) await client.query("UPDATE hewan SET stok=stok+$1,status=CASE WHEN status IN ('Habis','Terjual') THEN 'Tersedia' ELSE status END WHERE id_hewan=$2", [item.kuantitas,item.id_hewan]);
    await client.query('COMMIT');
    try{
      if(!featureSchemaReady)await ensureFeatureSchema();
      const sellers=await db.query('SELECT DISTINCT s.id_pengguna,s.nama_toko FROM detail_pesanan d JOIN hewan h ON h.id_hewan=d.id_hewan JOIN penjual s ON s.id_penjual=h.id_penjual WHERE d.id_pesanan=$1 AND s.status=\'Aktif\'',[req.params.id]);
      for(const seller of sellers.rows)await createNotification(db,seller.id_pengguna,'Pesanan dibatalkan',`Pesanan #${req.params.id} dibatalkan pembeli${reason?`: ${reason}`:''}.`,'order',{id_pesanan:Number(req.params.id)});
    }catch(error){console.error('Notifikasi pembatalan pesanan gagal disimpan:',error.message);}
    res.json({ status_pesanan:'Dibatalkan' });
  } catch (error) { await client.query('ROLLBACK'); throw error; }
  finally { client.release(); }
}));

app.post('/api/pesanan/:id/pembayaran', requireUser, asyncRoute(async (req, res) => {
  const metode=req.body?.metode;
  const supportedMethods=[
    'BCA (Bank Central Asia)',
    'BRI (Bank Rakyat Indonesia)',
    'BNI (Bank Negara Indonesia)',
    'Bank Mandiri',
    'BSI (Bank Syariah Indonesia)',
    'GoPay','DANA','OVO','ShopeePay','LinkAja',
  ];
  if(!supportedMethods.includes(metode))return fail(res,400,'Metode pembayaran tidak valid.');
  const client=await db.connect();
  try{
    await client.query('BEGIN');
    const result=await client.query(
      `SELECT p.id_pesanan,p.status_pesanan,pb.status AS status_pembayaran
       FROM pesanan p JOIN pembayaran pb ON pb.id_pesanan=p.id_pesanan
       WHERE p.id_pesanan=$1 AND p.id_pengguna=$2 FOR UPDATE OF p,pb`,
      [req.params.id,req.user.id_pengguna]
    );
    const order=result.rows[0];
    if(!order){await client.query('ROLLBACK');return fail(res,404,'Pesanan tidak ditemukan.');}
    if(order.status_pesanan==='Dibatalkan'){await client.query('ROLLBACK');return fail(res,409,'Pesanan yang dibatalkan tidak dapat dibayar.');}
    const saved=await client.query(
      `UPDATE pembayaran SET metode=$1,status='Berhasil',bukti=NULL,
        tanggal_bayar=COALESCE(tanggal_bayar,CURRENT_TIMESTAMP)
       WHERE id_pesanan=$2 RETURNING id_pesanan,status,metode,tanggal_bayar`,
      [metode,order.id_pesanan]
    );
    await client.query('COMMIT');
    res.json(saved.rows[0]);
  }catch(error){await client.query('ROLLBACK');throw error;}
  finally{client.release();}
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
  await ensureFeatureSchema();
  await db.query(
    `UPDATE pesan_chat SET status_baca='Sudah Dibaca' WHERE id_chat IN (SELECT id_chat FROM chat WHERE id_pengguna=$1 AND id_penjual IS NULL)
     AND id_pengirim<>$1 AND status_baca='Belum Dibaca'`, [req.user.id_pengguna]
  );
  const result = await db.query(
    `SELECT c.id_chat,c.status,COALESCE(json_agg(json_build_object('id_pesan',m.id_pesan,'id_pengirim',m.id_pengirim,'isi_pesan',m.isi_pesan,'waktu_kirim',m.waktu_kirim,'status_baca',m.status_baca) ORDER BY m.waktu_kirim) FILTER (WHERE m.id_pesan IS NOT NULL),'[]') AS messages
     FROM chat c LEFT JOIN pesan_chat m ON m.id_chat=c.id_chat WHERE c.id_pengguna=$1 AND c.id_penjual IS NULL GROUP BY c.id_chat ORDER BY c.id_chat DESC LIMIT 1`,
    [req.user.id_pengguna]
  );
  res.json(result.rows[0] || null);
}));

app.get('/api/chat/penjual', requireUser, asyncRoute(async (req, res) => {
  await ensureFeatureSchema();
  const result=await db.query(
    `SELECT c.id_chat,c.id_penjual,c.status,s.nama_toko,s.foto_url,
      COALESCE(json_agg(json_build_object('id_pesan',m.id_pesan,'id_pengirim',m.id_pengirim,'isi_pesan',m.isi_pesan,'waktu_kirim',m.waktu_kirim,'status_baca',m.status_baca) ORDER BY m.waktu_kirim) FILTER (WHERE m.id_pesan IS NOT NULL),'[]') AS messages
     FROM chat c JOIN penjual s ON s.id_penjual=c.id_penjual LEFT JOIN pesan_chat m ON m.id_chat=c.id_chat
     WHERE c.id_pengguna=$1 AND c.id_penjual IS NOT NULL GROUP BY c.id_chat,s.id_penjual ORDER BY MAX(m.waktu_kirim) DESC NULLS LAST,c.id_chat DESC`,
    [req.user.id_pengguna]
  );
  res.json(result.rows);
}));

app.get('/api/chat/penjual/:sellerId', requireUser, asyncRoute(async (req, res) => {
  await ensureFeatureSchema();
  const result=await db.query(
    `SELECT c.id_chat,c.id_pengguna,c.id_penjual,c.status,s.nama_toko,s.foto_url,
      COALESCE(json_agg(json_build_object('id_pesan',m.id_pesan,'id_pengirim',m.id_pengirim,'isi_pesan',m.isi_pesan,'waktu_kirim',m.waktu_kirim,'status_baca',m.status_baca) ORDER BY m.waktu_kirim) FILTER (WHERE m.id_pesan IS NOT NULL),'[]') AS messages
     FROM penjual s LEFT JOIN chat c ON c.id_penjual=s.id_penjual AND c.id_pengguna=$1 LEFT JOIN pesan_chat m ON m.id_chat=c.id_chat
     WHERE s.id_penjual=$2 AND s.status='Aktif' GROUP BY c.id_chat,c.id_pengguna,c.id_penjual,c.status,s.id_penjual`,
    [req.user.id_pengguna,req.params.sellerId]
  );
  if(!result.rows[0])return fail(res,404,'Profil penjual tidak tersedia.');
  if(result.rows[0].id_chat)await db.query("UPDATE pesan_chat SET status_baca='Sudah Dibaca' WHERE id_chat=$1 AND id_pengirim<>$2 AND status_baca='Belum Dibaca'",[result.rows[0].id_chat,req.user.id_pengguna]);
  res.json(result.rows[0]);
}));

app.post('/api/chat/penjual/:sellerId/pesan', requireUser, asyncRoute(async (req, res) => {
  await ensureFeatureSchema();
  const text=req.body?.isi_pesan?.trim();
  if(!text)return fail(res,400,'Pesan tidak boleh kosong.');
  const client=await db.connect();
  try{
    await client.query('BEGIN');
    const seller=await client.query("SELECT id_penjual,id_pengguna,nama_toko FROM penjual WHERE id_penjual=$1 AND status='Aktif'",[req.params.sellerId]);
    if(!seller.rows[0]){await client.query('ROLLBACK');return fail(res,404,'Profil penjual tidak tersedia.');}
    if(Number(seller.rows[0].id_pengguna)===Number(req.user.id_pengguna)){await client.query('ROLLBACK');return fail(res,409,'Kamu tidak dapat mengirim pesan ke tokomu sendiri.');}
    const chat=await client.query(
      `INSERT INTO chat(id_pengguna,id_penjual,status) VALUES ($1,$2,'Aktif')
       ON CONFLICT (id_pengguna,id_penjual) WHERE id_penjual IS NOT NULL DO UPDATE SET status='Aktif' RETURNING id_chat`,
      [req.user.id_pengguna,seller.rows[0].id_penjual]
    );
    const message=await client.query('INSERT INTO pesan_chat(id_chat,id_pengirim,isi_pesan) VALUES ($1,$2,$3) RETURNING *',[chat.rows[0].id_chat,req.user.id_pengguna,text]);
    await createOptionalNotification(client,seller.rows[0].id_pengguna,'Pesan baru',`Pesan baru tentang ${seller.rows[0].nama_toko}.`,'chat',{id_chat:chat.rows[0].id_chat});
    await client.query('COMMIT');
    res.status(201).json(message.rows[0]);
  }catch(error){await client.query('ROLLBACK');throw error;}finally{client.release();}
}));

app.get('/api/penjual/saya/chat', requireUser, asyncRoute(async (req, res) => {
  await ensureFeatureSchema();
  const seller=await db.query("SELECT id_penjual FROM penjual WHERE id_pengguna=$1 AND status='Aktif'",[req.user.id_pengguna]);
  if(!seller.rows[0])return fail(res,403,'Profil penjual aktif diperlukan untuk membuka kotak masuk.');
  const result=await db.query(
    `SELECT c.id_chat,c.id_pengguna,u.nama,u.email,c.status,
      COALESCE(json_agg(json_build_object('id_pesan',m.id_pesan,'id_pengirim',m.id_pengirim,'isi_pesan',m.isi_pesan,'waktu_kirim',m.waktu_kirim,'status_baca',m.status_baca) ORDER BY m.waktu_kirim) FILTER (WHERE m.id_pesan IS NOT NULL),'[]') AS messages
     FROM chat c JOIN pengguna u ON u.id_pengguna=c.id_pengguna LEFT JOIN pesan_chat m ON m.id_chat=c.id_chat
     WHERE c.id_penjual=$1 GROUP BY c.id_chat,u.id_pengguna ORDER BY MAX(m.waktu_kirim) DESC NULLS LAST,c.id_chat DESC`,
    [seller.rows[0].id_penjual]
  );
  res.json(result.rows);
}));

app.get('/api/penjual/saya/chat/:chatId', requireUser, asyncRoute(async (req, res) => {
  await ensureFeatureSchema();
  const result=await db.query(
    `SELECT c.id_chat,c.id_pengguna,c.id_penjual,c.status,u.nama,u.email,
      COALESCE(json_agg(json_build_object('id_pesan',m.id_pesan,'id_pengirim',m.id_pengirim,'isi_pesan',m.isi_pesan,'waktu_kirim',m.waktu_kirim,'status_baca',m.status_baca) ORDER BY m.waktu_kirim) FILTER (WHERE m.id_pesan IS NOT NULL),'[]') AS messages
     FROM chat c JOIN penjual s ON s.id_penjual=c.id_penjual JOIN pengguna u ON u.id_pengguna=c.id_pengguna LEFT JOIN pesan_chat m ON m.id_chat=c.id_chat
     WHERE c.id_chat=$1 AND s.id_pengguna=$2 GROUP BY c.id_chat,u.id_pengguna`,
    [req.params.chatId,req.user.id_pengguna]
  );
  if(!result.rows[0])return fail(res,404,'Percakapan tidak ditemukan.');
  await db.query("UPDATE pesan_chat SET status_baca='Sudah Dibaca' WHERE id_chat=$1 AND id_pengirim<>$2 AND status_baca='Belum Dibaca'",[req.params.chatId,req.user.id_pengguna]);
  res.json(result.rows[0]);
}));

app.post('/api/penjual/saya/chat/:chatId/pesan', requireUser, asyncRoute(async (req, res) => {
  await ensureFeatureSchema();
  const text=req.body?.isi_pesan?.trim();
  if(!text)return fail(res,400,'Pesan tidak boleh kosong.');
  const result=await db.query(
    `INSERT INTO pesan_chat(id_chat,id_pengirim,isi_pesan)
     SELECT c.id_chat,$1,$3 FROM chat c JOIN penjual s ON s.id_penjual=c.id_penjual
     WHERE c.id_chat=$2 AND s.id_pengguna=$1 RETURNING *`,
    [req.user.id_pengguna,req.params.chatId,text]
  );
  if(!result.rows[0])return fail(res,404,'Percakapan tidak ditemukan.');
  const owner=await db.query('SELECT id_pengguna FROM chat WHERE id_chat=$1',[req.params.chatId]);
  if(owner.rows[0]){
    try{await createNotification(db,owner.rows[0].id_pengguna,'Balasan dari penjual','Penjual membalas pesanmu.','chat',{id_chat:req.params.chatId});}
    catch(error){console.error('Notifikasi balasan penjual gagal disimpan:',error.message);}
  }
  res.status(201).json(result.rows[0]);
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

app.delete('/api/admin/chat/:id', requireUser, requireAdmin, asyncRoute(async (req, res) => {
  const chatId = parseNumber(req.params.id,'Percakapan',{min:1,integer:true});
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const chat = await client.query('SELECT id_chat FROM chat WHERE id_chat=$1 FOR UPDATE',[chatId]);
    if (!chat.rows[0]) { await client.query('ROLLBACK'); return fail(res,404,'Percakapan tidak ditemukan.'); }
    await client.query('DELETE FROM pesan_chat WHERE id_chat=$1',[chatId]);
    await client.query('DELETE FROM chat WHERE id_chat=$1',[chatId]);
    await client.query('COMMIT');
    res.status(204).end();
  } catch (error) { await client.query('ROLLBACK'); throw error; }
  finally { client.release(); }
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
  await ensureFeatureSchema();
  const text = req.body?.isi_pesan?.trim();
  if (!text) return fail(res,400,'Pesan tidak boleh kosong.');
  const result = await db.query(
    `INSERT INTO pesan_chat (id_chat,id_pengirim,isi_pesan)
     SELECT c.id_chat,$1,$3 FROM chat c WHERE c.id_chat=$2 RETURNING *`,
    [req.user.id_pengguna,req.params.id,text]
  );
  if (!result.rows[0]) return fail(res,404,'Percakapan tidak ditemukan.');
  const owner=await db.query('SELECT id_pengguna FROM chat WHERE id_chat=$1',[req.params.id]);
  if(owner.rows[0]){
    try{await createNotification(db,owner.rows[0].id_pengguna,'Balasan dari MyKandang','Tim MyKandang membalas pesanmu.','chat',{id_chat:req.params.id});}
    catch(error){console.error('Notifikasi chat gagal disimpan:',error.message);}
  }
  res.status(201).json(result.rows[0]);
}));

app.post('/api/chat/pesan', requireUser, asyncRoute(async (req, res) => {
  await ensureFeatureSchema();
  const text = req.body?.isi_pesan?.trim();
  if (!text) return fail(res,400,'Pesan tidak boleh kosong.');
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const existing = await client.query('SELECT id_chat FROM chat WHERE id_pengguna=$1 AND id_penjual IS NULL ORDER BY id_chat DESC LIMIT 1 FOR UPDATE', [req.user.id_pengguna]);
    const chatId = existing.rows[0]?.id_chat ?? (await client.query("INSERT INTO chat (id_pengguna,id_penjual,status) VALUES ($1,NULL,'Aktif') RETURNING id_chat", [req.user.id_pengguna])).rows[0].id_chat;
    const result = await client.query('INSERT INTO pesan_chat (id_chat,id_pengirim,isi_pesan) VALUES ($1,$2,$3) RETURNING *', [chatId,req.user.id_pengguna,text]);
    const admins=await client.query("SELECT id_pengguna FROM pengguna WHERE role='staff_admin'");
    for(const admin of admins.rows){
      try{await createOptionalNotification(client,admin.id_pengguna,'Pesan pelanggan baru',`Ada pesan baru dari ${req.user.nama}.`,'chat',{id_chat:chatId});}
      catch(error){console.error('Notifikasi chat admin gagal disimpan:',error.message);}
    }
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
