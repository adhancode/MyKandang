# MyKandang

Web katalog dan pemesanan ternak dengan HTML, CSS, JavaScript, Express, dan PostgreSQL. Tampilan menyesuaikan layar laptop maupun ponsel.

## Menjalankan aplikasi

1. Buat database PostgreSQL bernama `my_kandang`, lalu jalankan [`my_kandang.sql`](my_kandang.sql) satu kali pada database kosong. File tunggal ini membuat semua tabel aplikasi dan memasukkan data contoh.
2. Siapkan `backend/.env` memakai `backend/.env.example` sebagai acuan. Pastikan `DB_NAME=my_kandang` dan isi kredensial PostgreSQL milikmu.
3. Dari folder `backend`, jalankan `npm install`, lalu `npm start`.
4. Buka `http://localhost:3000`.

## Penyimpanan foto di Supabase

Endpoint upload foto hewan menyimpan berkas ke Supabase Storage, sehingga tidak menulis ke filesystem aplikasi saat deploy ke Vercel.

1. Buat bucket bernama `hewan` di Supabase Storage dan aktifkan **Public bucket** agar foto katalog dapat dibuka lewat URL.
2. Atur batas bucket menjadi 5 MB dan izinkan MIME type `image/jpeg`, `image/png`, dan `image/webp`.
3. Isi `SUPABASE_URL` dan `SUPABASE_SECRET_KEY` di `backend/.env` untuk lokal. Di Vercel, tambahkan variabel yang sama pada **Project Settings → Environment Variables**. Kode juga menerima nama lama `SUPABASE_SERVICE_ROLE_KEY` sebagai pengganti `SUPABASE_SECRET_KEY`.
4. Gunakan secret key hanya di environment backend. Jangan masukkan key asli ke frontend atau commit ke Git.

SDK Supabase sudah tercantum pada `package.json` root dan backend; jalankan `npm install` dari folder backend sebelum menjalankan backend lokal.

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
