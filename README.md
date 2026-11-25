# MyKandang

Web katalog dan pemesanan ternak dengan HTML, CSS, JavaScript, Express, dan PostgreSQL. Tampilan menyesuaikan layar laptop maupun ponsel.

## Menjalankan situs

### Lokal (`localhost`)

1. Buat database PostgreSQL bernama `my_kandang`, lalu jalankan [`my_kandang.sql`](my_kandang.sql) satu kali pada database kosong. File tunggal ini membuat semua tabel aplikasi dan memasukkan data contoh.
2. Siapkan `backend/.env` memakai `backend/.env.example` sebagai acuan. Pastikan `DB_NAME=my_kandang` dan isi kredensial PostgreSQL milikmu.
3. Dari folder `backend`, jalankan `npm install`, lalu `npm start`.
4. Buka `http://localhost:3000`.

### Publik (Vercel)

Untuk membuat situs yang bisa dibuka orang lain melalui internet:

1. Pastikan kode proyek sudah ada di GitHub, lalu di [Vercel](https://vercel.com/new) pilih **Add New → Project** dan impor repository `MyKandang`. Gunakan folder utama repository sebagai **Root Directory**.
2. Siapkan PostgreSQL yang dapat diakses dari internet. Jalankan [`my_kandang.sql`](my_kandang.sql) pada database tersebut. Database `localhost` milik komputer sendiri tidak dapat dipakai oleh deployment publik.
3. Sebelum deploy, tambahkan variabel berikut di **Project Settings → Environment Variables**:
   - `DATABASE_URL`: connection string PostgreSQL yang dapat diakses Vercel.
   - `AUTH_SECRET`: string acak yang panjang untuk menandatangani sesi login.
   - `SUPABASE_URL` dan `SUPABASE_SECRET_KEY`: untuk upload foto; siapkan bucket publik `hewan` terlebih dahulu sesuai bagian [Penyimpanan foto di Supabase](#penyimpanan-foto-di-supabase).
4. Pilih **Deploy**. Setelah deployment berhasil, buka **Overview** atau **Deployments** di Vercel lalu klik **Visit** untuk melihat situs publik.
5. Salin URL yang diberikan Vercel (biasanya berbentuk `https://nama-proyek.vercel.app`) ke bagian ini agar pengunjung mudah menemukannya:

   **Link publik:** https://mykandang-app.vercel.app/

Perubahan pada branch GitHub yang terhubung dapat memicu deployment baru secara otomatis. Variabel yang baru ditambahkan atau diubah berlaku setelah deployment baru dibuat.

## Penyimpanan foto di Supabase

Endpoint upload foto hewan menyimpan berkas ke Supabase Storage, bukan ke filesystem aplikasi.

1. Buat bucket bernama `hewan` di Supabase Storage dan aktifkan **Public bucket** agar foto katalog dapat dibuka lewat URL.
2. Atur batas ukuran bucket menjadi 5 MB dan izinkan MIME type `image/jpeg`, `image/png`, dan `image/webp`.
3. Isi `SUPABASE_URL` dan `SUPABASE_SECRET_KEY` di `backend/.env` untuk lokal dan di Vercel **Project Settings → Environment Variables** untuk publik. Kode juga mendukung nama lama `SUPABASE_SERVICE_ROLE_KEY`.
4. Simpan secret key hanya di environment backend. Jangan masukkan key asli ke frontend atau commit ke Git.

## Fitur yang terhubung ke tabel

- Kategori, katalog, foto, detail, pencarian, filter, pengurutan, dan perbandingan: `kategori_hewan`, `hewan`, `gambar_hewan`.
- Daftar, login, profil, dan role akun: `pengguna`.
- Wishlist: `wishlist`.
- Keranjang dan checkout dengan validasi stok: `keranjang`, `detail_keranjang`.
- Pesanan, item pesanan, pembatalan, dan stok: `pesanan`, `detail_pesanan`.
- Pembayaran otomatis: pesanan langsung ditandai berhasil tanpa membuat Virtual Account atau mengirim transaksi ke bank.
- Ulasan rating dan komentar: `ulasan`. Ulasan hanya dapat dikirim untuk item pada pesanan selesai.
- Pesan pengguna dan balasan admin, termasuk status baca: `chat`, `pesan_chat`.
- CRUD kategori (`kategori_hewan`) dan katalog hewan (`hewan`), termasuk foto utama. Penghapusan kategori diblokir saat masih dipakai; hewan yang sudah punya transaksi atau ulasan dipertahankan agar riwayat tetap utuh.
- Item keranjang (`detail_keranjang`) dapat ditambahkan, dibaca, diubah jumlahnya, dan dihapus oleh pengguna.
- Panel `staff_admin`: mengelola kategori/hewan, transaksi, dan percakapan; akun pelanggan serta seluruh data terkaitnya dapat dihapus dengan konfirmasi. Akun admin dilindungi dari penghapusan.

Skema tambahan untuk alamat, jadwal serah-terima, dan notifikasi tersedia di bagian `APP FEATURE SCHEMA` pada `my_kandang.sql`; backend mengambil bagian tersebut saat memerlukan migrasi fitur. Biaya kurir tidak termasuk dalam total pesanan. Kolom umur pada SQL hanya bertipe angka; aplikasi menganggap nilainya dalam bulan sesuai data contoh proyek.

## Akun awal

Password pada SQL contoh berupa nilai placeholder (`hash_password_1`, `hash_admin`), jadi akun contoh belum bisa dipakai untuk login. Daftar akun melalui web. Untuk menjadikannya admin, ubah role akun tersebut di PostgreSQL setelah registrasi:

```sql
UPDATE pengguna
SET role = 'staff_admin'
WHERE email = 'email-akun-yang-didaftarkan@example.com';
```

Keluar lalu masuk kembali agar role baru dimuat, kemudian buka **Admin**.
