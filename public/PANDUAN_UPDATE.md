# 📋 Panduan Update Logo dan Cap Invoice - MOBILLO Rental

## 📁 File yang Diupdate

Anda mendapatkan 3 file baru:
1. **logo.png** - Logo MOBILLO untuk header invoice
2. **cap.png** - Logo MOBILLO untuk cap/stempel (versi 1 warna)
3. **ttd.png** - Tanda tangan

---

## 🔧 Cara Update ke Aplikasi

### Opsi A: Update via GitHub (Jika sudah deploy di Vercel/Netlify)

1. **Buka repository GitHub Anda**

2. **Update folder `/public`:**
   - Upload file `logo.png` ke folder `public/`
   - Upload file `cap.png` ke folder `public/`
   - Upload file `ttd.png` ke folder `public/`
   - Timpa file lama jika ada

3. **Commit dan Push**
   - Commit message: "Update logo dan cap invoice"
   - Push ke branch main/master

4. **Otomatis Deploy**
   - Vercel/Netlify akan auto-deploy perubahan

---

### Opsi B: Update Langsung di React App (Local)

1. **Copy file ke folder public:**
   ```bash
   # Di terminal, masuk ke folder project Anda
   cd nama-folder-project-anda
   
   # Copy file gambar ke folder public
   cp path/ke/logo.png public/
   cp path/ke/cap.png public/
   cp path/ke/ttd.png public/
   ```

2. **Jalankan ulang aplikasi:**
   ```bash
   npm run dev
   # atau
   npm start
   ```

---

## ⚙️ Penyesuaian Ukuran di Kode (Jika Perlu)

Jika ukuran masih kurang pas, cari bagian ini di file React Anda dan sesuaikan:

### Untuk Logo Header (lebih kecil):
```javascript
// Cari kode seperti ini dan sesuaikan width/height
<img src="/logo.png" style={{ width: '150px', height: 'auto' }} />
// atau
drawImage(logo, x, y, 150, 50)  // width: 150, height: 50
```

### Untuk Cap/Stempel (lebih besar):
```javascript
// Cari kode cap dan perbesar
<img src="/cap.png" style={{ width: '120px', height: 'auto' }} />
// atau
drawImage(cap, x, y, 120, 40)  // width: 120, height: 40
```

---

## 📐 Ukuran yang Direkomendasikan

| Elemen | Width | Height | Catatan |
|--------|-------|--------|---------|
| Logo Header | 120-150px | auto | Proporsional |
| Logo Footer | 100-120px | auto | Lebih kecil dari header |
| Cap/Stempel | 100-120px | auto | Cukup besar agar terbaca |
| Tanda Tangan | 80-100px | auto | Proporsional |

---

## 🆘 Jika Ada Masalah

1. **Logo tidak muncul:**
   - Pastikan path file benar (`/logo.png` atau `./logo.png`)
   - Cek nama file sama persis (case-sensitive)

2. **Ukuran tidak sesuai:**
   - Sesuaikan nilai width/height di kode
   - Gunakan CSS `max-width` untuk responsive

3. **Butuh bantuan lebih lanjut:**
   - Kirim screenshot error
   - Kirim kode bagian invoice
   - Saya bantu perbaiki!

---

## ✅ Checklist Update

- [ ] Upload logo.png ke folder public
- [ ] Upload cap.png ke folder public
- [ ] Upload ttd.png ke folder public
- [ ] Test generate invoice
- [ ] Cek ukuran logo di header (tidak terlalu panjang)
- [ ] Cek ukuran cap (cukup besar)
- [ ] Deploy perubahan

---

Selamat! Logo dan cap Anda sudah terupdate! 🎉
