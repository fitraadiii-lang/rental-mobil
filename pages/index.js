import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Home() {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [cars, setCars] = useState([]);
  const [bookings, setBookings] = useState({});
  const [expenses, setExpenses] = useState([]);
  const [serviceHistory, setServiceHistory] = useState([]);
  const [invoiceCounter, setInvoiceCounter] = useState(420);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showAddCarModal, setShowAddCarModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  
  const [selectedCell, setSelectedCell] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [formData, setFormData] = useState({ renterName: '', amount: '', phone: '', address: '', status: 'lunas', leaseDate: '', returnDate: '', duration: 1 });
  const [expenseData, setExpenseData] = useState({ description: '', amount: '', date: '', category: 'operasional' });
  const [serviceData, setServiceData] = useState({ carId: '', description: '', cost: '', date: '', vendor: '' });
  const [newCarData, setNewCarData] = useState({ name: '', plate: '', pricePerDay: '' });
  const [activeTab, setActiveTab] = useState('calendar');

  const [companyInfo, setCompanyInfo] = useState({
    name: 'CV. PRAYOGO KIRANA GROUP',
    brand: 'MOBILLO',
    tagline: 'THE BEST CAR FOR YOU',
    address: 'Sapta Prasetya Raya No. 20 Semarang',
    phone: '+6283838535153',
    bankAccount: 'BCA (0091852411-Fitra Adi Prayogo)'
  });

  const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  useEffect(() => { loadAllData(); }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const { data: carsData } = await supabase.from('cars').select('*').order('id');
      if (carsData && carsData.length > 0) {
        setCars(carsData);
      } else {
        const defaultCars = [
          { name: 'Toyota Avanza', plate: 'H 1234 AB', price_per_day: 350000 },
          { name: 'Honda Jazz', plate: 'H 5678 CD', price_per_day: 300000 },
          { name: 'Agya Matic', plate: 'H 9012 EF', price_per_day: 250000 },
        ];
        const { data: insertedCars } = await supabase.from('cars').insert(defaultCars).select();
        if (insertedCars) setCars(insertedCars);
      }

      const { data: bookingsData } = await supabase.from('bookings').select('*');
      if (bookingsData) {
        const bookingsMap = {};
        bookingsData.forEach(b => {
          const key = `${b.car_id}-${b.year}-${b.month}-${b.day}`;
          bookingsMap[key] = { ...b, carId: b.car_id, carName: b.car_name, carPlate: b.car_plate, renterName: b.renter_name, invoiceNo: b.invoice_no, leaseDate: b.lease_date, returnDate: b.return_date };
        });
        setBookings(bookingsMap);
      }

      const { data: expensesData } = await supabase.from('expenses').select('*').order('date', { ascending: false });
      if (expensesData) setExpenses(expensesData);

      const { data: servicesData } = await supabase.from('services').select('*').order('date', { ascending: false });
      if (servicesData) setServiceHistory(servicesData.map(s => ({ ...s, carId: s.car_id, carName: s.car_name, carPlate: s.car_plate })));

      const { data: settingsData } = await supabase.from('settings').select('*').single();
      if (settingsData) {
        setCompanyInfo({ name: settingsData.company_name, brand: settingsData.brand, tagline: settingsData.tagline, address: settingsData.address, phone: settingsData.phone, bankAccount: settingsData.bank_account });
        setInvoiceCounter(settingsData.invoice_counter || 420);
      }
    } catch (error) { console.error('Error loading data:', error); }
    setLoading(false);
  };

  const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const getDayOfWeek = (day, month, year) => new Date(year, month, day).getDay();
  const daysInCurrentMonth = getDaysInMonth(currentMonth, currentYear);

  const handleCellClick = (carId, day) => {
    const key = `${carId}-${currentYear}-${currentMonth}-${day}`;
    const car = cars.find(c => c.id === carId);
    setSelectedCell({ carId, day, key });
    const existing = bookings[key];
    if (existing) {
      setFormData({ renterName: existing.renterName || existing.renter_name, amount: existing.amount, phone: existing.phone || '', address: existing.address || '', status: existing.status || 'lunas', leaseDate: existing.leaseDate || existing.lease_date || '', returnDate: existing.returnDate || existing.return_date || '', duration: existing.duration || 1 });
    } else {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      setFormData({ renterName: '', amount: car?.price_per_day || car?.pricePerDay || '', phone: '', address: '', status: 'lunas', leaseDate: dateStr, returnDate: dateStr, duration: 1 });
    }
    setShowModal(true);
  };

  const generateInvoiceNo = async () => {
    const newNo = invoiceCounter;
    const newCounter = invoiceCounter + 1;
    setInvoiceCounter(newCounter);
    await supabase.from('settings').update({ invoice_counter: newCounter }).eq('id', 1);
    return `INV${String(newNo).padStart(6, '0')}`;
  };

  const saveBooking = async () => {
    if (formData.renterName && formData.amount) {
      const car = cars.find(c => c.id === selectedCell.carId);
      const isNew = !bookings[selectedCell.key];
      const invoiceNo = isNew ? await generateInvoiceNo() : (bookings[selectedCell.key]?.invoiceNo || bookings[selectedCell.key]?.invoice_no);
      
      const bookingData = { car_id: selectedCell.carId, car_name: car?.name, car_plate: car?.plate, day: selectedCell.day, month: currentMonth, year: currentYear, renter_name: formData.renterName, address: formData.address, phone: formData.phone, amount: Number(formData.amount), status: formData.status, lease_date: formData.leaseDate, return_date: formData.returnDate, duration: formData.duration, invoice_no: invoiceNo };

      if (isNew) {
        const { data } = await supabase.from('bookings').insert(bookingData).select().single();
        if (data) setBookings(prev => ({ ...prev, [selectedCell.key]: { ...data, carId: data.car_id, carName: data.car_name, carPlate: data.car_plate, renterName: data.renter_name, invoiceNo: data.invoice_no, leaseDate: data.lease_date, returnDate: data.return_date } }));
      } else {
        const existingId = bookings[selectedCell.key]?.id;
        const { data } = await supabase.from('bookings').update(bookingData).eq('id', existingId).select().single();
        if (data) setBookings(prev => ({ ...prev, [selectedCell.key]: { ...data, carId: data.car_id, carName: data.car_name, carPlate: data.car_plate, renterName: data.renter_name, invoiceNo: data.invoice_no, leaseDate: data.lease_date, returnDate: data.return_date } }));
      }
    }
    setShowModal(false);
    setFormData({ renterName: '', amount: '', phone: '', address: '', status: 'lunas', leaseDate: '', returnDate: '', duration: 1 });
  };

  const deleteBooking = async () => {
    const existingId = bookings[selectedCell.key]?.id;
    if (existingId) await supabase.from('bookings').delete().eq('id', existingId);
    setBookings(prev => { const n = { ...prev }; delete n[selectedCell.key]; return n; });
    setShowModal(false);
    setFormData({ renterName: '', amount: '', phone: '', address: '', status: 'lunas', leaseDate: '', returnDate: '', duration: 1 });
  };

  const saveExpense = async () => {
    if (expenseData.description && expenseData.amount && expenseData.date) {
      const { data } = await supabase.from('expenses').insert({ description: expenseData.description, amount: Number(expenseData.amount), date: expenseData.date, category: expenseData.category }).select().single();
      if (data) setExpenses(prev => [data, ...prev]);
      setExpenseData({ description: '', amount: '', date: '', category: 'operasional' });
      setShowExpenseModal(false);
    }
  };

  const deleteExpense = async (id) => {
    await supabase.from('expenses').delete().eq('id', id);
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const saveService = async () => {
    if (serviceData.carId && serviceData.description && serviceData.cost && serviceData.date) {
      const car = cars.find(c => c.id === Number(serviceData.carId));
      const { data: serviceResult } = await supabase.from('services').insert({ car_id: Number(serviceData.carId), car_name: car?.name, car_plate: car?.plate, description: serviceData.description, cost: Number(serviceData.cost), date: serviceData.date, vendor: serviceData.vendor }).select().single();
      if (serviceResult) {
        setServiceHistory(prev => [{ ...serviceResult, carId: serviceResult.car_id, carName: serviceResult.car_name, carPlate: serviceResult.car_plate }, ...prev]);
        const { data: expenseResult } = await supabase.from('expenses').insert({ description: `Servis ${car?.name} (${car?.plate}) - ${serviceData.description}`, amount: Number(serviceData.cost), date: serviceData.date, category: 'servis', service_id: serviceResult.id }).select().single();
        if (expenseResult) setExpenses(prev => [expenseResult, ...prev]);
      }
      setServiceData({ carId: '', description: '', cost: '', date: '', vendor: '' });
      setShowServiceModal(false);
    }
  };

  const deleteService = async (id) => {
    await supabase.from('services').delete().eq('id', id);
    await supabase.from('expenses').delete().eq('service_id', id);
    setServiceHistory(prev => prev.filter(s => s.id !== id));
    setExpenses(prev => prev.filter(e => e.service_id !== id));
  };

  const addNewCar = async () => {
    if (newCarData.name && newCarData.plate) {
      const { data } = await supabase.from('cars').insert({ name: newCarData.name, plate: newCarData.plate, price_per_day: Number(newCarData.pricePerDay) || 300000 }).select().single();
      if (data) setCars(prev => [...prev, data]);
      setNewCarData({ name: '', plate: '', pricePerDay: '' });
      setShowAddCarModal(false);
    }
  };

  const deleteCar = async (carId) => {
    if (confirm('Yakin ingin menghapus mobil ini?')) {
      await supabase.from('cars').delete().eq('id', carId);
      await supabase.from('bookings').delete().eq('car_id', carId);
      setCars(prev => prev.filter(c => c.id !== carId));
      setBookings(prev => { const n = { ...prev }; Object.keys(n).forEach(key => { if (n[key].car_id === carId || n[key].carId === carId) delete n[key]; }); return n; });
    }
  };

  const saveSettings = async () => {
    await supabase.from('settings').upsert({ id: 1, company_name: companyInfo.name, brand: companyInfo.brand, tagline: companyInfo.tagline, address: companyInfo.address, phone: companyInfo.phone, bank_account: companyInfo.bankAccount, invoice_counter: invoiceCounter });
    setShowSettingsModal(false);
  };

  const openInvoice = (booking) => { setSelectedInvoice(booking); setShowInvoiceModal(true); };

  const formatDateIndo = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  const printInvoice = () => {
    const printContent = document.getElementById('invoice-content');
    const WinPrint = window.open('', '', 'width=900,height=700');
    WinPrint.document.write(`<html><head><title>Invoice ${selectedInvoice?.invoiceNo || selectedInvoice?.invoice_no}</title><style>* { margin: 0; padding: 0; box-sizing: border-box; } body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a1a; } @media print { body { padding: 0; } @page { margin: 10mm; } }</style></head><body>${printContent.innerHTML}</body></html>`);
    WinPrint.document.close();
    WinPrint.focus();
    setTimeout(() => { WinPrint.print(); WinPrint.close(); }, 250);
  };

  const exportToExcel = () => {
    const monthBookings = Object.values(bookings).filter(b => b.month === currentMonth && b.year === currentYear).sort((a, b) => a.day - b.day);
    const monthExpenses = expenses.filter(e => { const d = new Date(e.date); return d.getMonth() === currentMonth && d.getFullYear() === currentYear; });
    let csvContent = '\ufeff';
    csvContent += `LAPORAN RENTAL MOBIL - ${monthNames[currentMonth]} ${currentYear}\n${companyInfo.name}\n\nDAFTAR BOOKING\nNo,No Invoice,Tanggal Sewa,Tanggal Kembali,Mobil,Plat,Penyewa,Alamat,Telepon,Jumlah,Status\n`;
    monthBookings.forEach((b, idx) => { csvContent += `${idx + 1},${b.invoiceNo || b.invoice_no},${formatDateIndo(b.leaseDate || b.lease_date)},${formatDateIndo(b.returnDate || b.return_date)},${b.carName || b.car_name},${b.carPlate || b.car_plate},${b.renterName || b.renter_name},"${b.address || '-'}",${b.phone || '-'},${b.amount},${b.status === 'lunas' ? 'Lunas' : 'Belum Lunas'}\n`; });
    const totalIncome = monthBookings.reduce((sum, b) => sum + Number(b.amount), 0);
    csvContent += `\n,,,,,,,,,TOTAL,${totalIncome}\n\n\nDAFTAR PENGELUARAN\nNo,Tanggal,Kategori,Deskripsi,Jumlah\n`;
    monthExpenses.forEach((e, idx) => { csvContent += `${idx + 1},${formatDateIndo(e.date)},${e.category},"${e.description}",${e.amount}\n`; });
    const totalExpense = monthExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
    csvContent += `\n,,,TOTAL,${totalExpense}\n\n\nPROFIT,${totalIncome - totalExpense}\n`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Laporan_${monthNames[currentMonth]}_${currentYear}.csv`;
    link.click();
  };

  const currentMonthBookings = Object.values(bookings).filter(b => b.month === currentMonth && b.year === currentYear);
  const currentMonthIncome = currentMonthBookings.reduce((sum, b) => sum + Number(b.amount), 0);
  const currentMonthLunas = currentMonthBookings.filter(b => b.status === 'lunas').reduce((sum, b) => sum + Number(b.amount), 0);
  const currentMonthBelumLunas = currentMonthBookings.filter(b => b.status !== 'lunas').reduce((sum, b) => sum + Number(b.amount), 0);
  const currentMonthExpenses = expenses.filter(e => { const d = new Date(e.date); return d.getMonth() === currentMonth && d.getFullYear() === currentYear; }).reduce((sum, e) => sum + Number(e.amount), 0);

  const formatCurrency = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
  const formatCurrencySimple = (num) => `IDR ${new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2 }).format(num)}`;

  const navigateMonth = (direction) => {
    if (direction === 'prev') { if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); } else { setCurrentMonth(currentMonth - 1); } }
    else { if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); } else { setCurrentMonth(currentMonth + 1); } }
  };

  const inputStyle = { width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: '#f1f5f9', fontFamily: 'inherit', fontSize: '1rem', boxSizing: 'border-box' };
  const labelStyle = { display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '0.9rem' };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Segoe UI', sans-serif", color: '#fff' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🚗</div>
          <div style={{ fontSize: '1.2rem' }}>Memuat data...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)', fontFamily: "'Segoe UI', sans-serif", color: '#e2e8f0', padding: '20px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '30px', padding: '30px', background: 'linear-gradient(135deg, rgba(30, 58, 95, 0.5) 0%, rgba(245, 158, 11, 0.2) 100%)', borderRadius: '20px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
        <img src="/logo.png" alt="MOBILLO" style={{ maxWidth: '250px', height: 'auto', marginBottom: '15px' }} />
        <h1 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#f1f5f9', margin: '0 0 5px 0' }}>{companyInfo.name}</h1>
        <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.9rem' }}>{companyInfo.address}</p>
        <button onClick={() => setShowSettingsModal(true)} style={{ marginTop: '15px', padding: '8px 16px', borderRadius: '8px', border: 'none', background: 'rgba(255,255,255,0.1)', color: '#94a3b8', cursor: 'pointer', fontSize: '0.85rem' }}>⚙️ Pengaturan</button>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', justifyContent: 'center', flexWrap: 'wrap' }}>
        {[{ id: 'calendar', label: '📅 Kalender' }, { id: 'stats', label: '📊 Statistik' }, { id: 'expenses', label: '💸 Pengeluaran' }, { id: 'service', label: '🔧 Servis' }, { id: 'cars', label: '🚗 Mobil' }].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ padding: '12px 20px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.9rem', fontWeight: '500', background: activeTab === tab.id ? 'linear-gradient(135deg, #1e3a5f 0%, #f59e0b 100%)' : 'rgba(255,255,255,0.05)', color: activeTab === tab.id ? '#fff' : '#94a3b8', boxShadow: activeTab === tab.id ? '0 4px 15px rgba(245, 158, 11, 0.3)' : 'none' }}>{tab.label}</button>
        ))}
      </div>

      {/* Calendar View */}
      {activeTab === 'calendar' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', padding: '15px 25px', background: 'rgba(255,255,255,0.05)', borderRadius: '15px', flexWrap: 'wrap', gap: '15px' }}>
            <button onClick={() => navigateMonth('prev')} style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', background: 'rgba(245, 158, 11, 0.3)', color: '#f59e0b', cursor: 'pointer', fontFamily: 'inherit' }}>← Sebelumnya</button>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600', color: '#f1f5f9' }}>{monthNames[currentMonth]} {currentYear}</h2>
            <button onClick={() => navigateMonth('next')} style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', background: 'rgba(245, 158, 11, 0.3)', color: '#f59e0b', cursor: 'pointer', fontFamily: 'inherit' }}>Selanjutnya →</button>
          </div>

          <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={exportToExcel} style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '500' }}>📥 Download Laporan</button>
          </div>

          <div style={{ marginBottom: '20px', display: 'flex', gap: '25px', justifyContent: 'center', flexWrap: 'wrap', padding: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '20px', height: '20px', borderRadius: '6px', background: 'rgba(51, 65, 85, 0.4)' }}></div><span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Tersedia</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '20px', height: '20px', borderRadius: '6px', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.5) 0%, rgba(5, 150, 105, 0.5) 100%)' }}></div><span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Lunas</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '20px', height: '20px', borderRadius: '6px', background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.5) 0%, rgba(220, 38, 38, 0.5) 100%)' }}></div><span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Belum Lunas</span></div>
          </div>

          <div style={{ overflowX: 'auto', borderRadius: '20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '5px' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '3px', minWidth: '1000px' }}>
              <thead>
                <tr>
                  <th style={{ padding: '10px', background: 'transparent', minWidth: '140px' }}></th>
                  {[...Array(daysInCurrentMonth)].map((_, i) => {
                    const dayOfWeek = getDayOfWeek(i + 1, currentMonth, currentYear);
                    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                    return <th key={`day-${i}`} style={{ padding: '6px 3px', background: isWeekend ? 'rgba(239, 68, 68, 0.2)' : 'rgba(30, 58, 95, 0.3)', borderRadius: '6px 6px 0 0', fontWeight: '500', fontSize: '0.7rem', color: isWeekend ? '#f87171' : '#94a3b8', minWidth: '40px' }}>{dayNames[dayOfWeek]}</th>;
                  })}
                </tr>
                <tr>
                  <th style={{ padding: '12px 10px', background: 'linear-gradient(135deg, #1e3a5f 0%, #2d4a6f 100%)', borderRadius: '10px', fontWeight: '600', fontSize: '0.85rem', minWidth: '140px' }}>Jenis Mobil</th>
                  {[...Array(daysInCurrentMonth)].map((_, i) => {
                    const dayOfWeek = getDayOfWeek(i + 1, currentMonth, currentYear);
                    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                    return <th key={i} style={{ padding: '10px 3px', background: isWeekend ? 'rgba(239, 68, 68, 0.3)' : 'rgba(30, 58, 95, 0.5)', borderRadius: '0 0 6px 6px', fontWeight: '600', fontSize: '0.85rem', color: isWeekend ? '#fca5a5' : '#93c5fd' }}>{i + 1}</th>;
                  })}
                </tr>
              </thead>
              <tbody>
                {cars.map(car => (
                  <tr key={car.id}>
                    <td style={{ padding: '10px', background: 'rgba(30, 41, 59, 0.8)', borderRadius: '10px', fontWeight: '500' }}>
                      <div style={{ fontSize: '0.85rem' }}>{car.name}</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{car.plate}</div>
                    </td>
                    {[...Array(daysInCurrentMonth)].map((_, i) => {
                      const day = i + 1;
                      const key = `${car.id}-${currentYear}-${currentMonth}-${day}`;
                      const booking = bookings[key];
                      const isBooked = !!booking;
                      const isLunas = booking?.status === 'lunas';
                      return (
                        <td key={i} onClick={() => handleCellClick(car.id, day)} style={{ padding: '6px 3px', background: isBooked ? isLunas ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.5) 0%, rgba(5, 150, 105, 0.5) 100%)' : 'linear-gradient(135deg, rgba(239, 68, 68, 0.5) 0%, rgba(220, 38, 38, 0.5) 100%)' : 'rgba(51, 65, 85, 0.4)', borderRadius: '6px', cursor: 'pointer', textAlign: 'center', verticalAlign: 'top', transition: 'transform 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}>
                          {isBooked && (
                            <div style={{ fontSize: '0.6rem' }}>
                              <div style={{ fontWeight: '600', color: isLunas ? '#10b981' : '#ef4444', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '38px' }}>{(booking.renterName || booking.renter_name || '').split(' ')[0]}</div>
                              <div style={{ color: isLunas ? '#6ee7b7' : '#fca5a5', marginTop: '1px' }}>{(Number(booking.amount) / 1000).toFixed(0)}k</div>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Statistics View */}
      {activeTab === 'stats' && (
        <div>
          <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={exportToExcel} style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '500' }}>📥 Download Laporan</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', marginBottom: '30px' }}>
            {[{ label: '💰 Total Sewa', value: currentMonthIncome, color: '#10b981' }, { label: '✅ Lunas', value: currentMonthLunas, color: '#22c55e' }, { label: '⏳ Belum Lunas', value: currentMonthBelumLunas, color: '#f97316' }, { label: '💸 Pengeluaran', value: currentMonthExpenses, color: '#ef4444' }, { label: '📊 Profit', value: currentMonthLunas - currentMonthExpenses, color: '#3b82f6' }].map((stat, idx) => (
              <div key={idx} style={{ padding: '20px', borderRadius: '15px', background: `${stat.color}15`, border: `1px solid ${stat.color}30` }}>
                <div style={{ color: `${stat.color}99`, fontSize: '0.8rem', marginBottom: '8px' }}>{stat.label}</div>
                <div style={{ fontSize: '1.3rem', fontWeight: '700', color: stat.color }}>{formatCurrency(stat.value)}</div>
              </div>
            ))}
          </div>
          <div style={{ padding: '25px', borderRadius: '20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem' }}>📋 Booking {monthNames[currentMonth]}</h3>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {currentMonthBookings.sort((a, b) => a.day - b.day).map((booking, idx) => (
                <div key={idx} style={{ padding: '12px', borderRadius: '10px', marginBottom: '8px', background: booking.status === 'lunas' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', border: `1px solid ${booking.status === 'lunas' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <div style={{ fontWeight: '600', color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: '8px' }}>{booking.renterName || booking.renter_name}<span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '0.6rem', background: booking.status === 'lunas' ? '#166534' : '#991b1b', color: '#fff' }}>{booking.status === 'lunas' ? 'LUNAS' : 'BELUM'}</span></div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{booking.invoiceNo || booking.invoice_no} • {booking.carName || booking.car_name} • Tgl {booking.day}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontWeight: '600', color: booking.status === 'lunas' ? '#10b981' : '#ef4444' }}>{formatCurrency(booking.amount)}</span>
                    <button onClick={() => openInvoice(booking)} style={{ padding: '5px 10px', borderRadius: '6px', border: 'none', background: 'linear-gradient(135deg, #1e3a5f 0%, #f59e0b 100%)', color: '#fff', cursor: 'pointer', fontSize: '0.75rem' }}>Invoice</button>
                  </div>
                </div>
              ))}
              {currentMonthBookings.length === 0 && <div style={{ textAlign: 'center', color: '#64748b', padding: '40px' }}>Belum ada booking</div>}
            </div>
          </div>
        </div>
      )}

      {/* Expenses View */}
      {activeTab === 'expenses' && (
        <div>
          <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={() => setShowExpenseModal(true)} style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '500' }}>+ Tambah Pengeluaran</button>
          </div>
          <div style={{ padding: '25px', borderRadius: '20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ margin: '0 0 20px 0' }}>💸 Pengeluaran</h3>
            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {expenses.map(expense => (
                <div key={expense.id} style={{ padding: '12px', borderRadius: '10px', marginBottom: '8px', background: expense.category === 'servis' ? 'rgba(251, 146, 60, 0.1)' : 'rgba(239, 68, 68, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <div style={{ fontWeight: '600', color: '#f1f5f9' }}>{expense.description}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{formatDateIndo(expense.date)} • {expense.category === 'servis' ? '🔧 Servis' : '📦 Operasional'}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontWeight: '600', color: '#ef4444' }}>-{formatCurrency(expense.amount)}</span>
                    {expense.category !== 'servis' && <button onClick={() => deleteExpense(expense.id)} style={{ background: 'rgba(239, 68, 68, 0.3)', border: 'none', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', color: '#f87171', fontSize: '0.75rem' }}>Hapus</button>}
                  </div>
                </div>
              ))}
              {expenses.length === 0 && <div style={{ textAlign: 'center', color: '#64748b', padding: '40px' }}>Belum ada pengeluaran</div>}
            </div>
          </div>
        </div>
      )}

      {/* Service View */}
      {activeTab === 'service' && (
        <div>
          <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={() => setShowServiceModal(true)} style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '500' }}>+ Tambah Servis</button>
          </div>
          <div style={{ padding: '25px', borderRadius: '20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ margin: '0 0 20px 0' }}>🔧 Riwayat Servis</h3>
            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {serviceHistory.map(service => (
                <div key={service.id} style={{ padding: '15px', borderRadius: '12px', marginBottom: '10px', background: 'rgba(251, 146, 60, 0.1)', border: '1px solid rgba(251, 146, 60, 0.3)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <div style={{ fontWeight: '600', color: '#f1f5f9' }}>🚗 {service.carName || service.car_name} ({service.carPlate || service.car_plate})</div>
                      <div style={{ color: '#fdba74', marginTop: '5px' }}>{service.description}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '5px' }}>{formatDateIndo(service.date)} {service.vendor && `• ${service.vendor}`}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontWeight: '700', color: '#f97316', fontSize: '1.1rem' }}>{formatCurrency(service.cost)}</span>
                      <button onClick={() => deleteService(service.id)} style={{ background: 'rgba(239, 68, 68, 0.3)', border: 'none', borderRadius: '6px', padding: '5px 10px', cursor: 'pointer', color: '#f87171', fontSize: '0.8rem' }}>Hapus</button>
                    </div>
                  </div>
                </div>
              ))}
              {serviceHistory.length === 0 && <div style={{ textAlign: 'center', color: '#64748b', padding: '40px' }}>Belum ada servis</div>}
            </div>
          </div>
        </div>
      )}

      {/* Cars View */}
      {activeTab === 'cars' && (
        <div>
          <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={() => setShowAddCarModal(true)} style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '500' }}>+ Tambah Mobil</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            {cars.map(car => {
              const carBookings = Object.values(bookings).filter(b => (b.carId || b.car_id) === car.id);
              const carIncome = carBookings.reduce((sum, b) => sum + Number(b.amount), 0);
              const carServiceCost = serviceHistory.filter(s => (s.carId || s.car_id) === car.id).reduce((sum, s) => sum + Number(s.cost), 0);
              return (
                <div key={car.id} style={{ padding: '20px', borderRadius: '20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                    <div>
                      <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#f1f5f9' }}>🚗 {car.name}</div>
                      <div style={{ color: '#64748b', fontSize: '0.9rem' }}>{car.plate}</div>
                      <div style={{ color: '#f59e0b', fontSize: '0.85rem', marginTop: '5px' }}>{formatCurrency(car.price_per_day || car.pricePerDay)}/hari</div>
                    </div>
                    <button onClick={() => deleteCar(car.id)} style={{ background: 'rgba(239, 68, 68, 0.3)', border: 'none', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', color: '#f87171', height: 'fit-content' }}>🗑️</button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '12px', borderRadius: '10px' }}><div style={{ fontSize: '0.7rem', color: '#6ee7b7' }}>Pemasukan</div><div style={{ fontWeight: '600', color: '#10b981', fontSize: '0.9rem' }}>{formatCurrency(carIncome)}</div></div>
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '10px' }}><div style={{ fontSize: '0.7rem', color: '#fca5a5' }}>Servis</div><div style={{ fontWeight: '600', color: '#ef4444', fontSize: '0.9rem' }}>{formatCurrency(carServiceCost)}</div></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modals */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderRadius: '20px', padding: '25px', width: '100%', maxWidth: '400px', border: '1px solid rgba(255,255,255,0.1)', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem' }}>📝 {bookings[selectedCell?.key] ? 'Edit' : 'Tambah'} Booking</h3>
            <div style={{ marginBottom: '12px' }}><label style={labelStyle}>Nama Penyewa *</label><input type="text" value={formData.renterName} onChange={(e) => setFormData({ ...formData, renterName: e.target.value })} placeholder="Mr./Mrs. Nama" style={inputStyle} /></div>
            <div style={{ marginBottom: '12px' }}><label style={labelStyle}>Alamat</label><input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Alamat" style={inputStyle} /></div>
            <div style={{ marginBottom: '12px' }}><label style={labelStyle}>No. Telepon</label><input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="08xx" style={inputStyle} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}><div><label style={labelStyle}>Tgl Sewa</label><input type="date" value={formData.leaseDate} onChange={(e) => setFormData({ ...formData, leaseDate: e.target.value })} style={inputStyle} /></div><div><label style={labelStyle}>Tgl Kembali</label><input type="date" value={formData.returnDate} onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })} style={inputStyle} /></div></div>
            <div style={{ marginBottom: '12px' }}><label style={labelStyle}>Jumlah Sewa (Rp) *</label><input type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} placeholder="250000" style={inputStyle} /></div>
            <div style={{ marginBottom: '15px' }}><label style={labelStyle}>Status</label><div style={{ display: 'flex', gap: '10px' }}><button type="button" onClick={() => setFormData({ ...formData, status: 'lunas' })} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: formData.status === 'lunas' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'rgba(255,255,255,0.05)', color: formData.status === 'lunas' ? '#fff' : '#94a3b8', fontFamily: 'inherit' }}>✓ Lunas</button><button type="button" onClick={() => setFormData({ ...formData, status: 'belum' })} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: formData.status === 'belum' ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : 'rgba(255,255,255,0.05)', color: formData.status === 'belum' ? '#fff' : '#94a3b8', fontFamily: 'inherit' }}>⏳ Belum</button></div></div>
            <div style={{ display: 'flex', gap: '10px' }}><button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontFamily: 'inherit' }}>Batal</button>{bookings[selectedCell?.key] && <button onClick={deleteBooking} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: '#ef4444', color: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>Hapus</button>}<button onClick={saveBooking} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #1e3a5f 0%, #f59e0b 100%)', color: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>Simpan</button></div>
          </div>
        </div>
      )}

      {showExpenseModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderRadius: '20px', padding: '25px', width: '100%', maxWidth: '350px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ margin: '0 0 20px 0' }}>💸 Tambah Pengeluaran</h3>
            <div style={{ marginBottom: '12px' }}><label style={labelStyle}>Deskripsi</label><input type="text" value={expenseData.description} onChange={(e) => setExpenseData({ ...expenseData, description: e.target.value })} placeholder="BBM, Parkir" style={inputStyle} /></div>
            <div style={{ marginBottom: '12px' }}><label style={labelStyle}>Jumlah (Rp)</label><input type="number" value={expenseData.amount} onChange={(e) => setExpenseData({ ...expenseData, amount: e.target.value })} style={inputStyle} /></div>
            <div style={{ marginBottom: '15px' }}><label style={labelStyle}>Tanggal</label><input type="date" value={expenseData.date} onChange={(e) => setExpenseData({ ...expenseData, date: e.target.value })} style={inputStyle} /></div>
            <div style={{ display: 'flex', gap: '10px' }}><button onClick={() => setShowExpenseModal(false)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#94a3b8', cursor: 'pointer' }}>Batal</button><button onClick={saveExpense} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: '#ef4444', color: '#fff', cursor: 'pointer' }}>Simpan</button></div>
          </div>
        </div>
      )}

      {showServiceModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderRadius: '20px', padding: '25px', width: '100%', maxWidth: '350px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ margin: '0 0 20px 0' }}>🔧 Tambah Servis</h3>
            <div style={{ marginBottom: '12px' }}><label style={labelStyle}>Mobil</label><select value={serviceData.carId} onChange={(e) => setServiceData({ ...serviceData, carId: e.target.value })} style={inputStyle}><option value="">-- Pilih --</option>{cars.map(car => <option key={car.id} value={car.id}>{car.name}</option>)}</select></div>
            <div style={{ marginBottom: '12px' }}><label style={labelStyle}>Jenis Servis</label><input type="text" value={serviceData.description} onChange={(e) => setServiceData({ ...serviceData, description: e.target.value })} placeholder="Ganti oli" style={inputStyle} /></div>
            <div style={{ marginBottom: '12px' }}><label style={labelStyle}>Biaya (Rp)</label><input type="number" value={serviceData.cost} onChange={(e) => setServiceData({ ...serviceData, cost: e.target.value })} style={inputStyle} /></div>
            <div style={{ marginBottom: '12px' }}><label style={labelStyle}>Tanggal</label><input type="date" value={serviceData.date} onChange={(e) => setServiceData({ ...serviceData, date: e.target.value })} style={inputStyle} /></div>
            <div style={{ marginBottom: '15px' }}><label style={labelStyle}>Bengkel</label><input type="text" value={serviceData.vendor} onChange={(e) => setServiceData({ ...serviceData, vendor: e.target.value })} style={inputStyle} /></div>
            <div style={{ display: 'flex', gap: '10px' }}><button onClick={() => setShowServiceModal(false)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#94a3b8', cursor: 'pointer' }}>Batal</button><button onClick={saveService} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: '#f97316', color: '#fff', cursor: 'pointer' }}>Simpan</button></div>
          </div>
        </div>
      )}

      {showAddCarModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderRadius: '20px', padding: '25px', width: '100%', maxWidth: '350px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ margin: '0 0 20px 0' }}>🚗 Tambah Mobil</h3>
            <div style={{ marginBottom: '12px' }}><label style={labelStyle}>Nama Mobil</label><input type="text" value={newCarData.name} onChange={(e) => setNewCarData({ ...newCarData, name: e.target.value })} placeholder="Toyota Avanza" style={inputStyle} /></div>
            <div style={{ marginBottom: '12px' }}><label style={labelStyle}>Plat Nomor</label><input type="text" value={newCarData.plate} onChange={(e) => setNewCarData({ ...newCarData, plate: e.target.value })} placeholder="H 1234 AB" style={inputStyle} /></div>
            <div style={{ marginBottom: '15px' }}><label style={labelStyle}>Harga/Hari (Rp)</label><input type="number" value={newCarData.pricePerDay} onChange={(e) => setNewCarData({ ...newCarData, pricePerDay: e.target.value })} placeholder="300000" style={inputStyle} /></div>
            <div style={{ display: 'flex', gap: '10px' }}><button onClick={() => setShowAddCarModal(false)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#94a3b8', cursor: 'pointer' }}>Batal</button><button onClick={addNewCar} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: '#10b981', color: '#fff', cursor: 'pointer' }}>Tambah</button></div>
          </div>
        </div>
      )}

      {showSettingsModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderRadius: '20px', padding: '25px', width: '100%', maxWidth: '400px', border: '1px solid rgba(255,255,255,0.1)', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 20px 0' }}>⚙️ Pengaturan</h3>
            <div style={{ marginBottom: '12px' }}><label style={labelStyle}>Nama Perusahaan</label><input type="text" value={companyInfo.name} onChange={(e) => setCompanyInfo({ ...companyInfo, name: e.target.value })} style={inputStyle} /></div>
            <div style={{ marginBottom: '12px' }}><label style={labelStyle}>Alamat</label><input type="text" value={companyInfo.address} onChange={(e) => setCompanyInfo({ ...companyInfo, address: e.target.value })} style={inputStyle} /></div>
            <div style={{ marginBottom: '12px' }}><label style={labelStyle}>Telepon</label><input type="text" value={companyInfo.phone} onChange={(e) => setCompanyInfo({ ...companyInfo, phone: e.target.value })} style={inputStyle} /></div>
            <div style={{ marginBottom: '15px' }}><label style={labelStyle}>Info Rekening</label><input type="text" value={companyInfo.bankAccount} onChange={(e) => setCompanyInfo({ ...companyInfo, bankAccount: e.target.value })} style={inputStyle} /></div>
            <button onClick={saveSettings} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #1e3a5f 0%, #f59e0b 100%)', color: '#fff', cursor: 'pointer' }}>Simpan</button>
          </div>
        </div>
      )}

      {/* Invoice Modal - dengan gambar asli */}
      {showInvoiceModal && selectedInvoice && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px', overflowY: 'auto' }}>
          <div style={{ background: '#fff', borderRadius: '15px', width: '100%', maxWidth: '700px', maxHeight: '95vh', overflowY: 'auto' }}>
            <div id="invoice-content" style={{ fontFamily: "'Segoe UI', Arial", color: '#1a1a1a' }}>
              {/* Header INVOICE */}
              <div style={{ background: '#1e3a5f', padding: '12px 30px', textAlign: 'center' }}>
                <h1 style={{ margin: 0, color: '#fff', fontSize: '1.8rem', letterSpacing: '2px' }}>INVOICE</h1>
              </div>
              
              {/* Logo MOBILLO Asli */}
              <div style={{ textAlign: 'center', padding: '20px 30px 10px' }}>
                <img src="/logo.png" alt="MOBILLO" style={{ maxWidth: '220px', height: 'auto' }} />
              </div>
              
              {/* Company Info */}
              <div style={{ textAlign: 'center', padding: '0 30px 20px' }}>
                <h2 style={{ margin: '0 0 3px 0', fontSize: '1rem', color: '#1e3a5f' }}>Group of {companyInfo.name}</h2>
                <p style={{ margin: 0, color: '#666', fontSize: '0.85rem' }}>{companyInfo.address}, Phone {companyInfo.phone}</p>
              </div>
              
              {/* Invoice Details */}
              <div style={{ padding: '0 30px 15px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px' }}>
                <table style={{ borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <tbody>
                    <tr><td style={{ padding: '2px 10px 2px 0', fontWeight: '600', color: '#1e3a5f' }}>No Invoice</td><td>: {selectedInvoice.invoiceNo || selectedInvoice.invoice_no}</td></tr>
                    <tr><td style={{ padding: '2px 10px 2px 0', fontWeight: '600', color: '#1e3a5f' }}>Bill to</td><td>: {selectedInvoice.renterName || selectedInvoice.renter_name}</td></tr>
                    <tr><td style={{ padding: '2px 10px 2px 0', fontWeight: '600', color: '#1e3a5f' }}>Address</td><td>: {selectedInvoice.address || '-'}</td></tr>
                  </tbody>
                </table>
                <table style={{ borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <tbody>
                    <tr><td style={{ padding: '2px 10px 2px 0', fontWeight: '600', color: '#1e3a5f' }}>Lease Date</td><td>: {formatDateIndo(selectedInvoice.leaseDate || selectedInvoice.lease_date)}</td></tr>
                    <tr><td style={{ padding: '2px 10px 2px 0', fontWeight: '600', color: '#1e3a5f' }}>Return Date</td><td>: {formatDateIndo(selectedInvoice.returnDate || selectedInvoice.return_date)}</td></tr>
                  </tbody>
                </table>
              </div>
              
              {/* Items Table */}
              <div style={{ padding: '0 30px 15px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ background: '#1e3a5f' }}>
                      <th style={{ padding: '10px', textAlign: 'left', color: '#fff' }}>Description</th>
                      <th style={{ padding: '10px', textAlign: 'center', color: '#fff' }}>Quantity</th>
                      <th style={{ padding: '10px', textAlign: 'right', color: '#fff' }}>Price</th>
                      <th style={{ padding: '10px', textAlign: 'right', color: '#f59e0b' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{selectedInvoice.carName || selectedInvoice.car_name}</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #eee', textAlign: 'center' }}>1 day</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #eee', textAlign: 'right' }}>{formatCurrencySimple(selectedInvoice.amount)}</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #eee', textAlign: 'right' }}>{formatCurrencySimple(selectedInvoice.amount)}</td>
                    </tr>
                  </tbody>
                </table>
                <div style={{ textAlign: 'right', marginTop: '15px' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: '700', color: '#1e3a5f' }}>TOTAL </span>
                  <span style={{ fontSize: '1.2rem', fontWeight: '700', color: '#f59e0b' }}>{formatCurrencySimple(selectedInvoice.amount)}</span>
                </div>
              </div>
              
              {/* Footer dengan Cap dan Tanda Tangan Asli */}
              <div style={{ padding: '20px 30px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div style={{ color: '#666', fontSize: '0.85rem' }}>{companyInfo.bankAccount}</div>
                <div style={{ textAlign: 'center', position: 'relative', width: '180px', height: '120px' }}>
                  {/* Cap/Stempel */}
                  <img src="/cap.png" alt="Cap" style={{ position: 'absolute', left: '0', top: '0', width: '90px', height: 'auto', opacity: '0.9', transform: 'rotate(-10deg)' }} />
                  {/* Tanda Tangan */}
                  <img src="/ttd.png" alt="Tanda Tangan" style={{ position: 'absolute', right: '0', top: '10px', width: '80px', height: 'auto' }} />
                  <div style={{ position: 'absolute', bottom: '0', right: '0', fontWeight: '600', color: '#f59e0b' }}>Management</div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div style={{ padding: '12px 30px 20px', background: '#f8f9fa', borderTop: '1px solid #eee', display: 'flex', gap: '10px', justifyContent: 'flex-end', borderRadius: '0 0 15px 15px' }}>
              <button onClick={() => setShowInvoiceModal(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #ddd', background: '#fff', color: '#666', cursor: 'pointer' }}>Tutup</button>
              <button onClick={printInvoice} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #1e3a5f 0%, #f59e0b 100%)', color: '#fff', cursor: 'pointer' }}>🖨️ Cetak</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
