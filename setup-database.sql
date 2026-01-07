-- =====================================================
-- PANDUAN SETUP DATABASE SUPABASE
-- =====================================================
-- 
-- CARA MENGGUNAKAN FILE INI:
-- 1. Login ke Supabase (https://supabase.com)
-- 2. Buka project Anda
-- 3. Klik menu "SQL Editor" di sidebar kiri
-- 4. Klik "New Query"
-- 5. Copy-paste SEMUA isi file ini
-- 6. Klik tombol "Run" (warna hijau)
-- 7. Selesai! Database Anda siap digunakan
--
-- =====================================================

-- Tabel untuk menyimpan data mobil
CREATE TABLE IF NOT EXISTS cars (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  plate VARCHAR(50) NOT NULL,
  price_per_day INTEGER DEFAULT 300000,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabel untuk menyimpan data booking/sewa
CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  car_id INTEGER REFERENCES cars(id),
  car_name VARCHAR(255),
  car_plate VARCHAR(50),
  day INTEGER NOT NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  renter_name VARCHAR(255) NOT NULL,
  address TEXT,
  phone VARCHAR(50),
  amount INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'lunas',
  lease_date DATE,
  return_date DATE,
  duration INTEGER DEFAULT 1,
  invoice_no VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabel untuk menyimpan pengeluaran
CREATE TABLE IF NOT EXISTS expenses (
  id SERIAL PRIMARY KEY,
  description TEXT NOT NULL,
  amount INTEGER NOT NULL,
  date DATE NOT NULL,
  category VARCHAR(50) DEFAULT 'operasional',
  service_id INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabel untuk menyimpan riwayat servis
CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  car_id INTEGER REFERENCES cars(id),
  car_name VARCHAR(255),
  car_plate VARCHAR(50),
  description TEXT NOT NULL,
  cost INTEGER NOT NULL,
  date DATE NOT NULL,
  vendor VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabel untuk menyimpan pengaturan perusahaan
CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  company_name VARCHAR(255) DEFAULT 'CV. PRAYOGO KIRANA GROUP',
  brand VARCHAR(100) DEFAULT 'MOBILLO',
  tagline VARCHAR(255) DEFAULT 'THE BEST CAR FOR YOU',
  address TEXT DEFAULT 'Sapta Prasetya Raya No. 20 Semarang',
  phone VARCHAR(50) DEFAULT '+6283838535153',
  bank_account VARCHAR(255) DEFAULT 'BCA (0091852411-Fitra Adi Prayogo)',
  invoice_counter INTEGER DEFAULT 420,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert data pengaturan default
INSERT INTO settings (id, company_name, brand, tagline, address, phone, bank_account, invoice_counter)
VALUES (1, 'CV. PRAYOGO KIRANA GROUP', 'MOBILLO', 'THE BEST CAR FOR YOU', 'Sapta Prasetya Raya No. 20 Semarang', '+6283838535153', 'BCA (0091852411-Fitra Adi Prayogo)', 420)
ON CONFLICT (id) DO NOTHING;

-- Aktifkan Row Level Security (opsional tapi direkomendasikan)
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Buat policy untuk akses publik (untuk kemudahan, bisa diperketat nanti)
CREATE POLICY "Allow all access to cars" ON cars FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to bookings" ON bookings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to expenses" ON expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to services" ON services FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to settings" ON settings FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- SELESAI! Database Anda sudah siap digunakan
-- =====================================================
