# 🚗 Aplikasi Rental Mobil - MOBILLO

Aplikasi manajemen rental mobil dengan fitur:
- ✅ Kalender booking (seperti habit tracker)
- ✅ Status Lunas / Belum Lunas (hijau/merah)
- ✅ Invoice otomatis (format profesional)
- ✅ Riwayat servis mobil
- ✅ Laporan keuangan (bisa download Excel)
- ✅ Multi-user (bisa diakses bareng karyawan)

---

## 📋 PANDUAN SETUP LENGKAP (Untuk Pemula)

### TAHAP 1: Buat Database di Supabase (5 menit)

1. **Buka** https://supabase.com
2. **Klik** "Start your project" → Login dengan Google
3. **Klik** "New Project"
4. **Isi:**
   - Organization: pilih yang ada atau buat baru
   - Name: `rental-mobil`
   - Database Password: buat password (CATAT DI KERTAS!)
   - Region: `Southeast Asia (Singapore)`
5. **Klik** "Create new project"
6. **Tunggu** 2 menit sampai selesai

#### Setup Tabel Database:
7. Di sidebar kiri, **klik** "SQL Editor"
8. **Klik** "New Query"
9. **Buka file** `setup-database.sql` di folder ini (buka pakai Notepad)
10. **Copy semua isinya**, paste ke SQL Editor di Supabase
11. **Klik** tombol "Run" (warna hijau)
12. Jika muncul "Success", database sudah siap!

#### Catat 2 Info Penting:
13. Di sidebar, **klik** "Settings" → "API"
14. **CATAT** di kertas:
    - `Project URL` → contoh: https://abcdefgh.supabase.co
    - `anon public` key → kode panjang di bawah "Project API keys"

---

### TAHAP 2: Upload Kode ke GitHub (5 menit)

1. **Buka** https://github.com
2. **Daftar** akun baru (atau login kalau sudah punya)
3. **Klik** tombol "+" di pojok kanan atas → "New repository"
4. **Isi:**
   - Repository name: `rental-mobil`
   - Pilih: **Public**
   - Centang: **Add a README file**
5. **Klik** "Create repository"

#### Upload Semua File:
6. Di halaman repository, **klik** "Add file" → "Upload files"
7. **Buka folder** yang berisi file-file ini di komputer Anda
8. **Pilih semua file dan folder**, drag ke halaman GitHub:
   - package.json
   - next.config.js
   - folder `pages`
   - folder `lib`
   - folder `styles`
9. Scroll ke bawah, **klik** "Commit changes"

---

### TAHAP 3: Deploy ke Vercel (5 menit)

1. **Buka** https://vercel.com
2. **Klik** "Sign Up" → "Continue with GitHub"
3. **Izinkan** Vercel mengakses GitHub Anda
4. Setelah masuk, **klik** "Add New..." → "Project"
5. **Cari** repository bernama `rental-mobil`
6. **Klik** tombol "Import"

#### Tambah Konfigurasi Penting:
7. Cari bagian **"Environment Variables"**
8. **Tambahkan** 2 variabel (klik "+ Add"):

   **Variabel 1:**
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: (paste Project URL yang dicatat tadi)

   **Variabel 2:**
   - Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Value: (paste anon key yang dicatat tadi)

9. **Klik** tombol "Deploy"
10. **Tunggu** 2-3 menit sampai selesai

#### 🎉 SELESAI!
11. Anda akan dapat alamat website, contoh: `https://rental-mobil-abc123.vercel.app`
12. **Simpan/Bookmark** alamat ini
13. Coba buka dari HP untuk memastikan berfungsi
14. **Bagikan** alamat ke karyawan

---

## 🎯 CARA MENGGUNAKAN APLIKASI

### Membuka Aplikasi
- Ketik alamat website di browser HP/laptop
- Bookmark atau "Add to Home Screen" di HP supaya mudah dibuka

### Menu Utama

| Menu | Fungsi |
|------|--------|
| 📅 Kalender | Lihat & tambah booking per tanggal |
| 📊 Statistik | Lihat pemasukan, pengeluaran, profit |
| 💸 Pengeluaran | Catat pengeluaran harian |
| 🔧 Servis | Catat riwayat servis mobil |
| 🚗 Mobil | Kelola daftar mobil |

### Kode Warna di Kalender
- **Hijau** = Booking LUNAS
- **Merah** = Booking BELUM LUNAS
- **Abu-abu** = Tersedia/Kosong

### Cetak Invoice
1. Buka menu **Statistik**
2. Klik tombol **Invoice** di samping nama penyewa
3. Klik **Cetak**

### Download Laporan Bulanan
1. Klik tombol **Download Laporan**
2. File akan terdownload dalam format CSV
3. Buka dengan Excel atau Google Sheets

---

## 💰 BIAYA

| Komponen | Biaya |
|----------|-------|
| Supabase (database) | GRATIS |
| GitHub (penyimpanan kode) | GRATIS |
| Vercel (hosting) | GRATIS |
| **TOTAL** | **Rp 0** |

*Gratis untuk penggunaan normal. Baru perlu bayar jika sudah sangat besar.*

---

## ❓ PERTANYAAN UMUM

**T: Data tersimpan dimana?**
J: Di cloud (Supabase), jadi aman dan tidak hilang meski HP rusak.

**T: Bisa diakses berapa orang?**
J: Tidak terbatas. Siapapun yang tahu alamat website bisa akses.

**T: Perlu internet?**
J: Ya, harus ada koneksi internet untuk menyimpan dan mengambil data.

**T: Bisa pakai di HP?**
J: Bisa! Buka lewat browser HP (Chrome/Safari).

**T: Bagaimana backup data?**
J: Otomatis di-backup oleh Supabase.

---

## 🆘 BANTUAN

Jika ada masalah:
1. Screenshot pesan error
2. Hubungi pembuat aplikasi

---

Dibuat untuk **CV. PRAYOGO KIRANA GROUP** - MOBILLO
