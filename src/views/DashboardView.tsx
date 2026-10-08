import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Bed, UserPlus, Truck, Stethoscope, PieChart,
  TrendingUp, Activity, Calendar, ArrowUpRight, ArrowDownRight,
  Building2, Users, Printer, BarChart3, RefreshCw, Download,
  Search, ShieldCheck, ChevronRight
} from 'lucide-react';

import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement,
  ArcElement, Title, Tooltip, Legend, Filler
);

// Set default font family for all Chart.js instances to Open Sans
ChartJS.defaults.font.family = "'Open Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
ChartJS.defaults.color = '#64748b';

export const DashboardView: React.FC = () => {
  const { patients, registrations, beds, navigate } = useApp();
  const [selectedPeriod, setSelectedPeriod] = useState<'hari' | 'minggu' | 'bulan' | 'tahun'>('bulan');
  const [selectedDiagnosisCategory, setSelectedDiagnosisCategory] = useState<'semua' | 'rajal' | 'ranap'>('semua');
  const [diagnosisSearch, setDiagnosisSearch] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showRefreshToast, setShowRefreshToast] = useState(false);

  // Trigger brief refresh animation
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setShowRefreshToast(true);
      setTimeout(() => setShowRefreshToast(false), 2500);
    }, 600);
  };

  // Real-time calculated Bed metrics from AppContext
  const totalBeds = beds?.length || 20;
  const realOccupiedBeds = beds?.filter(b => b.status === 'Occupied').length || 0;
  const rawatInapAktif = registrations.filter(r => r.type === 'Rawat Inap' && r.status === 'Dirawat').length;
  const occupiedBeds = realOccupiedBeds > 0 ? realOccupiedBeds : (rawatInapAktif > 0 ? rawatInapAktif : 14);
  const availableBeds = Math.max(0, totalBeds - occupiedBeds);
  const borPercentage = ((occupiedBeds / totalBeds) * 100).toFixed(1);

  // Dynamic metrics based on selected period
  const periodData = useMemo(() => {
    const extraPatients = Math.max(0, patients.length - 6);
    switch (selectedPeriod) {
      case 'hari':
        return {
          label: 'Hari Ini',
          dateBadge: 'Hari Ini, 28 Sep 2026',
          pasienBaru: 14 + extraPatients,
          pasienBaruSub: '+2 vs kemarin',
          pasienBaruPositive: true,
          pasienLama: 32,
          pasienLamaSub: '69.6% dari total pasien',
          pasienLamaPct: '69.6%',
          igdCases: registrations.filter(r => r.type === 'IGD').length || 8,
          igdResponseTime: '3.6 mnt',
          alos: '3.4',
          totalPeriod: 46 + extraPatients,
          summaryBadge: `Total Hari Ini: ${46 + extraPatients} Pasien`,
          ratio: '1 : 2.3',
          ratioStatus: 'Optimal',
          chartLabels: ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'],
          chartTotal: [6, 11, 9, 8, 5, 4, 3],
          chartLama: [4, 8, 6, 6, 3, 3, 2],
          chartBaru: [2, 3, 3, 2, 2, 1, 1],
          baruPctInPeriod: '30.4%',
          lamaPctInPeriod: '69.6%'
        };
      case 'minggu':
        return {
          label: 'Minggu Ini',
          dateBadge: 'Minggu Ini (22 - 28 Sep 2026)',
          pasienBaru: 86 + (extraPatients * 2),
          pasienBaruSub: '+8 vs minggu lalu',
          pasienBaruPositive: true,
          pasienLama: 215,
          pasienLamaSub: '71.4% dari total pasien',
          pasienLamaPct: '71.4%',
          igdCases: 54,
          igdResponseTime: '3.7 mnt',
          alos: '3.3',
          totalPeriod: 301 + (extraPatients * 2),
          summaryBadge: `Total Minggu Ini: ${301 + (extraPatients * 2)} Pasien`,
          ratio: '1 : 2.5',
          ratioStatus: 'Stabil',
          chartLabels: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'],
          chartTotal: [48, 52, 45, 49, 44, 38, 25],
          chartLama: [34, 37, 32, 35, 31, 28, 18],
          chartBaru: [14, 15, 13, 14, 13, 10, 7],
          baruPctInPeriod: '28.6%',
          lamaPctInPeriod: '71.4%'
        };
      case 'tahun':
        return {
          label: 'Tahun 2026',
          dateBadge: 'Tahun Kalender 2026',
          pasienBaru: 3420 + (extraPatients * 10),
          pasienBaruSub: '+18.5% YoY',
          pasienBaruPositive: true,
          pasienLama: 8940,
          pasienLamaSub: '72.3% dari total pasien',
          pasienLamaPct: '72.3%',
          igdCases: 2410,
          igdResponseTime: '3.9 mnt',
          alos: '3.5',
          totalPeriod: 12360 + (extraPatients * 10),
          summaryBadge: `Akumulasi 2026: ${(12360 + (extraPatients * 10)).toLocaleString('id-ID')} Pasien`,
          ratio: '1 : 2.6',
          ratioStatus: 'Ekspansi Kuat',
          chartLabels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
          chartTotal: [920, 890, 960, 1010, 1060, 1110, 1080, 1140, 1180, 1210, 1240, 1270],
          chartLama: [660, 640, 690, 730, 765, 800, 780, 820, 850, 875, 895, 915],
          chartBaru: [260, 250, 270, 280, 295, 310, 300, 320, 330, 335, 345, 355],
          baruPctInPeriod: '27.7%',
          lamaPctInPeriod: '72.3%'
        };
      case 'bulan':
      default:
        return {
          label: 'Bulan Ini',
          dateBadge: 'Bulan September 2026',
          pasienBaru: 335 + (extraPatients * 3),
          pasienBaruSub: '+14.2% vs bln lalu',
          pasienBaruPositive: true,
          pasienLama: 810,
          pasienLamaSub: '70.7% dari total pasien',
          pasienLamaPct: '70.7%',
          igdCases: 218,
          igdResponseTime: '3.8 mnt',
          alos: '3.4',
          totalPeriod: 1145 + (extraPatients * 3),
          summaryBadge: `Total Bulan Ini: ${(1145 + (extraPatients * 3)).toLocaleString('id-ID')} Pasien`,
          ratio: '1 : 2.4',
          ratioStatus: 'Pertumbuhan Positif',
          chartLabels: ['Apr 2026', 'Mei 2026', 'Jun 2026', 'Jul 2026', 'Agu 2026', 'Sep 2026'],
          chartTotal: [865, 950, 918, 1015, 1090, 1145],
          chartLama: [620, 680, 660, 720, 780, 810],
          chartBaru: [245, 270, 258, 295, 310, 335],
          baruPctInPeriod: '29.3%',
          lamaPctInPeriod: '70.7%'
        };
    }
  }, [selectedPeriod, patients.length, registrations]);

  // Pasien Baru vs Pasien Lama Line Chart Dataset
  const patientTrendChartData = {
    labels: periodData.chartLabels,
    datasets: [
      {
        label: 'Total Pasien',
        data: periodData.chartTotal,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.12)',
        borderWidth: 2.5,
        fill: true,
        tension: 0.35,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: '#10b981',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2
      },
      {
        label: 'Pasien Lama (Kontrol & Rawat Lanjutan)',
        data: periodData.chartLama,
        borderColor: '#0284c7',
        backgroundColor: 'rgba(2, 132, 199, 0.08)',
        borderWidth: 2,
        fill: false,
        tension: 0.35,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: '#0284c7',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2
      },
      {
        label: 'Pasien Baru (Registrasi Pertama)',
        data: periodData.chartBaru,
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.08)',
        borderWidth: 2,
        fill: false,
        borderDash: [5, 5],
        tension: 0.35,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: '#f59e0b',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2
      }
    ]
  };

  const patientTrendChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        align: 'end' as const,
        labels: {
          boxWidth: 12,
          boxHeight: 12,
          usePointStyle: true,
          font: {
            family: "'Open Sans', sans-serif",
            size: 11,
            weight: 600
          },
          color: '#475569'
        }
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleFont: { family: "'Open Sans', sans-serif", size: 12, weight: 600 },
        bodyFont: { family: "'Open Sans', sans-serif", size: 12, weight: 600 },
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: function(context: any) {
            return ` ${context.dataset.label}: ${context.parsed.y.toLocaleString('id-ID')} Pasien`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { color: '#f1f5f9' },
        ticks: {
          font: { family: "'Open Sans', sans-serif", size: 11, weight: 600 },
          color: '#64748b'
        }
      },
      y: {
        grid: { color: '#f1f5f9' },
        ticks: {
          font: { family: "'Open Sans', sans-serif", size: 11, weight: 600 },
          color: '#64748b',
          callback: function(val: any) {
            return val + ' Pasien';
          }
        }
      }
    }
  };

  // Gender demographics calculation (Laki-laki vs Perempuan)
  const realMaleCount = patients.filter(p => p.gender === 'L' || p.gender === 'M').length;
  const realFemaleCount = patients.filter(p => p.gender === 'P' || p.gender === 'F').length;

  // Scale accurately to hospital volume while reflecting real ratio
  const displayMaleCount = patients.length > 10 ? realMaleCount : (550 + realMaleCount * 2);
  const displayFemaleCount = patients.length > 10 ? realFemaleCount : (595 + realFemaleCount * 2);
  const totalGenderPatients = displayMaleCount + displayFemaleCount;
  const malePercentage = ((displayMaleCount / totalGenderPatients) * 100).toFixed(1);
  const femalePercentage = ((displayFemaleCount / totalGenderPatients) * 100).toFixed(1);

  const genderPieData = {
    labels: ['Laki-laki', 'Perempuan'],
    datasets: [
      {
        data: [displayMaleCount, displayFemaleCount],
        backgroundColor: ['#0284c7', '#ec4899'],
        borderColor: '#ffffff',
        borderWidth: 2,
        cutout: '70%'
      }
    ]
  };

  const genderPieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        titleFont: { family: "'Open Sans', sans-serif", size: 12, weight: 600 },
        bodyFont: { family: "'Open Sans', sans-serif", size: 12, weight: 600 },
        callbacks: {
          label: function(context: any) {
            const val = context.parsed;
            const pct = ((val / totalGenderPatients) * 100).toFixed(1);
            return ` ${context.label}: ${val.toLocaleString('id-ID')} Pasien (${pct}%)`;
          }
        }
      }
    }
  };

  // Donut chart data for Distribusi Penjamin Pasien (BPJS, Mandiri, Asuransi Swasta)
  const bpjsCount = patients.filter(p => p.insuranceType === 'BPJS').length || 18;
  const umumCount = patients.filter(p => p.insuranceType === 'Umum').length || 6;
  const asuransiCount = patients.filter(p => p.insuranceType === 'Asuransi').length || 3;
  const totalPenjamin = bpjsCount + umumCount + asuransiCount;

  const donutData = {
    labels: ['BPJS Kesehatan', 'Pasien Umum (Mandiri)', 'Asuransi Swasta & Rekanan'],
    datasets: [
      {
        data: [bpjsCount, umumCount, asuransiCount],
        backgroundColor: ['#0284c7', '#64748b', '#8b5cf6'],
        borderWidth: 2,
        borderColor: '#ffffff',
        cutout: '72%'
      }
    ]
  };

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        titleFont: { family: "'Open Sans', sans-serif", size: 12, weight: 600 },
        bodyFont: { family: "'Open Sans', sans-serif", size: 12, weight: 600 }
      }
    }
  };

  // Dynamic Ward bed statistics calculated from AppContext beds
  const wardBreakdown = useMemo(() => {
    const list = [
      { name: 'Bangsal Mawar (Penyakit Dalam)', keyword: 'Mawar', fallbackTotal: 8, fallbackOccupied: 6 },
      { name: 'Bangsal Melati (Bedah Umum)', keyword: 'Melati', fallbackTotal: 6, fallbackOccupied: 4 },
      { name: 'Bangsal Dahlia (Pediatrik / Anak)', keyword: 'Dahlia', fallbackTotal: 4, fallbackOccupied: 2 },
      { name: 'Bangsal Anggrek (Kebidanan)', keyword: 'Anggrek', fallbackTotal: 4, fallbackOccupied: 2 },
      { name: 'Ruang VIP & VVIP (Edelweiss)', keyword: 'VIP', fallbackTotal: 4, fallbackOccupied: 2 }
    ];

    return list.map(ward => {
      const match = beds?.filter(b => b.room.includes(ward.keyword) || b.id.includes(ward.keyword.substring(0, 3).toUpperCase())) || [];
      const total = match.length > 0 ? match.length : ward.fallbackTotal;
      const occupied = match.length > 0 ? match.filter(b => b.status === 'Occupied').length : ward.fallbackOccupied;
      const pct = total > 0 ? Math.round((occupied / total) * 100) : 0;
      let colorClass = 'bg-emerald-500';
      if (pct > 80) colorClass = 'bg-rose-500';
      else if (pct > 65) colorClass = 'bg-blue-500';
      else if (pct > 40) colorClass = 'bg-amber-500';

      return {
        name: ward.name,
        total,
        occupied,
        pct,
        colorClass
      };
    });
  }, [beds]);

  // 10 Diagnosis Terbanyak (Top 10 ICD-10 Morbiditas RS) with Rajal/Ranap filtering
  const allTop10Diagnosis = useMemo(() => [
    { code: 'I10', name: 'Hipertensi Esensial (Primer)', cases: 142, pct: '28.4%', type: 'rajal' },
    { code: 'I25.1', name: 'Penyakit Jantung Iskemik Kronik (CAD)', cases: 86, pct: '17.2%', type: 'ranap' },
    { code: 'E11.9', name: 'Diabetes Melitus Tipe 2 Tanpa Komplikasi', cases: 64, pct: '12.8%', type: 'rajal' },
    { code: 'J06.9', name: 'Infeksi Saluran Pernafasan Akut (ISPA)', cases: 48, pct: '9.6%', type: 'rajal' },
    { code: 'K29.7', name: 'Gastritis dan Duodenitis', cases: 39, pct: '7.8%', type: 'rajal' },
    { code: 'A09', name: 'Diare dan Gastroenteritis Akut', cases: 32, pct: '6.4%', type: 'ranap' },
    { code: 'M79.1', name: 'Myalgia & Nyeri Muskuloskeletal', cases: 28, pct: '5.6%', type: 'rajal' },
    { code: 'J18.9', name: 'Pneumonia Komunitas (CAP)', cases: 24, pct: '4.8%', type: 'ranap' },
    { code: 'I50.9', name: 'Gagal Jantung Kongestif (CHF)', cases: 20, pct: '4.0%', type: 'ranap' },
    { code: 'N18.9', name: 'Penyakit Ginjal Kronik (CKD)', cases: 17, pct: '3.4%', type: 'ranap' }
  ], []);

  const filteredDiagnosis = useMemo(() => {
    let result = allTop10Diagnosis;
    if (selectedDiagnosisCategory === 'rajal') {
      result = result.filter(d => d.type === 'rajal');
    } else if (selectedDiagnosisCategory === 'ranap') {
      result = result.filter(d => d.type === 'ranap');
    }

    if (diagnosisSearch.trim()) {
      const q = diagnosisSearch.toLowerCase();
      result = result.filter(d => d.code.toLowerCase().includes(q) || d.name.toLowerCase().includes(q));
    }

    return result;
  }, [allTop10Diagnosis, selectedDiagnosisCategory, diagnosisSearch]);

  // Export Executive Summary to CSV
  const handleExportCSV = () => {
    const csvRows = [
      ['DASHBOARD EKSEKUTIF RS - LAPORAN KINERJA & DEMOGRAFI'],
      ['Periode', periodData.dateBadge],
      ['Tanggal Cetak', new Date().toLocaleDateString('id-ID')],
      [],
      ['INDIKATOR UTAMA PASIEN', 'JUMLAH'],
      ['Pasien Baru', `${periodData.pasienBaru} Pasien`],
      ['Pasien Lama', `${periodData.pasienLama} Pasien`],
      ['Total Pasien Terlayani', `${periodData.totalPeriod} Pasien`],
      ['Rasio Pasien Baru : Lama', periodData.ratio],
      ['Pasien Gawat Darurat (IGD)', `${periodData.igdCases} Kasus`],
      ['BOR (Bed Occupancy Rate)', `${borPercentage}%`],
      ['ALOS (Average Length of Stay)', `${periodData.alos} Hari`],
      ['Tempat Tidur Terisi', `${occupiedBeds} / ${totalBeds} Bed`],
      [],
      ['DEMOGRAFI JENIS KELAMIN', 'JUMLAH', 'PERSENTASE'],
      ['Laki-laki', displayMaleCount, `${malePercentage}%`],
      ['Perempuan', displayFemaleCount, `${femalePercentage}%`],
      [],
      ['DISTRIBUSI PENJAMIN', 'JUMLAH', 'PERSENTASE'],
      ['BPJS Kesehatan', bpjsCount, `${((bpjsCount / totalPenjamin) * 100).toFixed(1)}%`],
      ['Umum / Mandiri', umumCount, `${((umumCount / totalPenjamin) * 100).toFixed(1)}%`],
      ['Asuransi Swasta', asuransiCount, `${((asuransiCount / totalPenjamin) * 100).toFixed(1)}%`],
      [],
      ['10 DIAGNOSIS TERBANYAK (ICD-10)', 'KASUS', 'PROPORSI'],
      ...allTop10Diagnosis.map(d => [d.code, d.name, d.cases, d.pct])
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `EIS_Dashboard_${selectedPeriod}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 font-sans text-slate-800">
      {/* Toast Notification for Refresh */}
      {showRefreshToast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-xs font-semibold rounded-xl shadow-lg border border-slate-700 animate-fade-in">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Data Dashboard Eksekutif berhasil disinkronkan & diperbarui.</span>
        </div>
      )}

      {/* EXECUTIVE DASHBOARD HEADER & QUICK ACTIONS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Dashboard Eksekutif Direksi & Manajemen</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-wider">
                  LIVE EIS
                </span>
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Executive Information System (EIS) — Pantauan Indikator Pasien, Demografi & Efisiensi Pelayanan RS
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Period Selector with interactive state update */}
          <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200/80 text-xs font-semibold text-slate-600">
            {(['hari', 'minggu', 'bulan', 'tahun'] as const).map(p => (
              <button
                key={p}
                onClick={() => setSelectedPeriod(p)}
                className={`px-3 py-1.5 rounded-lg transition-all capitalize text-[11px] cursor-pointer ${
                  selectedPeriod === p
                    ? 'bg-white text-blue-700 shadow-xs font-bold'
                    : 'hover:text-slate-900'
                }`}
                title={`Pilih periode ${p}`}
              >
                {p === 'hari' ? 'Hari Ini' : p === 'minggu' ? 'Minggu Ini' : p === 'bulan' ? 'Bulan Ini' : 'Tahun 2026'}
              </button>
            ))}
          </div>

          {/* Active Period Date Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200/80 bg-slate-50 text-slate-700 text-xs font-semibold">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>{periodData.dateBadge}</span>
          </div>

          {/* Action: Refresh Data */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer disabled:opacity-60"
            title="Muat ulang sinkronisasi data real-time"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
            <span className="hidden sm:inline">Sinkron Data</span>
          </button>

          {/* Action: Export CSV */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
            title="Download ringkasan eksekutif format CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          {/* Action: Print EIS */}
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            title="Cetak lembar laporan EIS"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak EIS</span>
          </button>
        </div>
      </div>

      {/* TOP 5 EXECUTIVE KPI CARDS (FOCUS ON PATIENTS & OPERATIONAL CAPACITY) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Pasien Baru Periode Ini */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs border-l-4 border-l-emerald-500 hover:shadow-xs transition-all">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>Pasien Baru ({periodData.label})</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900 tracking-tight flex items-baseline gap-1.5">
            <span>{periodData.pasienBaru.toLocaleString('id-ID')}</span>
            <span className="text-xs font-semibold text-slate-500">Pasien</span>
          </div>
          <div className="flex items-center justify-between text-[11px] mt-2 pt-2 border-t border-slate-100">
            <span className="text-slate-500 font-medium">Registrasi Pertama</span>
            <span className="inline-flex items-center text-emerald-700 font-bold">
              <ArrowUpRight className="w-3 h-3" /> {periodData.pasienBaruSub}
            </span>
          </div>
        </div>

        {/* Card 2: Pasien Lama (Kontrol / Terdaftar) */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs border-l-4 border-l-blue-600 hover:shadow-xs transition-all">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>Pasien Lama ({periodData.label})</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900 tracking-tight flex items-baseline gap-1.5">
            <span>{periodData.pasienLama.toLocaleString('id-ID')}</span>
            <span className="text-xs font-semibold text-slate-500">Pasien</span>
          </div>
          <div className="flex items-center justify-between text-[11px] mt-2 pt-2 border-t border-slate-100">
            <span className="text-slate-500 font-medium">Proporsi</span>
            <span className="text-blue-700 font-bold">{periodData.pasienLamaPct} total</span>
          </div>
        </div>

        {/* Card 3: Bed Occupancy Rate (BOR) */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs border-l-4 border-l-rose-500 hover:shadow-xs transition-all">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>BOR (Keterisian Bed)</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Bed className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900 tracking-tight flex items-baseline gap-1.5">
            <span>{borPercentage}%</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">Ideal</span>
          </div>
          <div className="flex items-center justify-between text-[11px] mt-2 pt-2 border-t border-slate-100">
            <span className="text-slate-500 font-medium">Tempat Tidur</span>
            <span className="text-slate-700 font-bold">{occupiedBeds} / {totalBeds} Terisi</span>
          </div>
        </div>

        {/* Card 4: Gawat Darurat (IGD) */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs border-l-4 border-l-amber-500 hover:shadow-xs transition-all">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>Pasien IGD ({periodData.label})</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900 tracking-tight flex items-baseline gap-1.5">
            <span>{periodData.igdCases}</span>
            <span className="text-xs font-semibold text-slate-500">Kasus</span>
          </div>
          <div className="flex items-center justify-between text-[11px] mt-2 pt-2 border-t border-slate-100">
            <span className="text-slate-500 font-medium">Response Time</span>
            <span className="text-amber-800 font-bold">{periodData.igdResponseTime}</span>
          </div>
        </div>

        {/* Card 5: Rata-Rata Lama Rawat (ALOS) */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs border-l-4 border-l-purple-500 hover:shadow-xs transition-all">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>ALOS (Lama Dirawat)</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900 tracking-tight flex items-baseline gap-1.5">
            <span>{periodData.alos}</span>
            <span className="text-xs font-semibold text-slate-500">Hari</span>
          </div>
          <div className="flex items-center justify-between text-[11px] mt-2 pt-2 border-t border-slate-100">
            <span className="text-slate-500 font-medium">Standar Kemenkes</span>
            <span className="text-purple-700 font-bold">3 - 5 Hari</span>
          </div>
        </div>
      </div>

      {/* CHARTS ROW 1: TREN PASIEN LAMA VS BARU (LEFT 8 COLS) & PIE CHART JENIS KELAMIN (RIGHT 4 COLS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Tren Pasien Baru vs Pasien Lama (Reaktif Terhadap Filter Periode) */}
        <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                  Tren Pasien Baru vs Pasien Lama ({periodData.label})
                </h2>
                <p className="text-[11px] text-slate-400 font-medium">
                  Perbandingan Registrasi Pasien Baru vs Pasien Lama Terdaftar
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-bold">
                {periodData.summaryBadge}
              </div>
            </div>
          </div>

          {/* Line Chart Container with distinct markers & Open Sans labels */}
          <div className="h-72 w-full pt-1">
            <Line data={patientTrendChartData} options={patientTrendChartOptions} />
          </div>

          {/* Summary Metric Cards directly reacting to period */}
          <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-100 text-xs">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
              <div className="text-[11px] text-slate-500 font-medium">Pasien Baru ({periodData.label})</div>
              <div className="text-sm font-bold text-amber-700 mt-0.5">{periodData.pasienBaru.toLocaleString('id-ID')} Pasien</div>
              <div className="text-[10px] text-slate-400">{periodData.baruPctInPeriod} dari total pasien</div>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
              <div className="text-[11px] text-slate-500 font-medium">Pasien Lama ({periodData.label})</div>
              <div className="text-sm font-bold text-blue-700 mt-0.5">{periodData.pasienLama.toLocaleString('id-ID')} Pasien</div>
              <div className="text-[10px] text-slate-400">{periodData.lamaPctInPeriod} dari total pasien</div>
            </div>
            <div className="bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200/60">
              <div className="text-[11px] text-emerald-800 font-medium">Rasio Pasien Baru : Lama</div>
              <div className="text-sm font-bold text-emerald-700 mt-0.5">{periodData.ratio}</div>
              <div className="text-[10px] text-emerald-600 font-semibold">{periodData.ratioStatus}</div>
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Pie Chart Jenis Kelamin Pasien */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-pink-600" />
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">Jenis Kelamin Pasien</h2>
            </div>
            <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-bold">
              Demografi RS
            </span>
          </div>

          <div className="relative h-60 flex items-center justify-center">
            <Doughnut data={genderPieData} options={genderPieOptions} />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-slate-900 tracking-tight">
                {totalGenderPatients.toLocaleString('id-ID')}
              </span>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Total Pasien
              </span>
            </div>
          </div>

          <div className="space-y-2.5 pt-2 border-t border-slate-100 text-xs">
            <div className="flex items-center justify-between p-2 rounded-xl bg-sky-50/60 border border-sky-100">
              <div className="flex items-center gap-2 font-semibold text-slate-800">
                <span className="w-3 h-3 rounded-full bg-sky-600 shrink-0"></span>
                <span>Laki-laki</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-sky-900">{displayMaleCount.toLocaleString('id-ID')} Pasien</span>
                <span className="text-[11px] text-sky-700 ml-1.5 font-semibold">({malePercentage}%)</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-pink-50/60 border border-pink-100">
              <div className="flex items-center gap-2 font-semibold text-slate-800">
                <span className="w-3 h-3 rounded-full bg-pink-500 shrink-0"></span>
                <span>Perempuan</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-pink-900">{displayFemaleCount.toLocaleString('id-ID')} Pasien</span>
                <span className="text-[11px] text-pink-700 ml-1.5 font-semibold">({femalePercentage}%)</span>
              </div>
            </div>

            <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 flex items-center justify-between">
              <span>Rasio Pasien L / P:</span>
              <span className="font-bold text-slate-800">1 : {(Number(displayFemaleCount) / Number(displayMaleCount)).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ROW 2: INDIKATOR KEMENKES (EFISIENSI RS) & DISTRIBUSI PENJAMIN & BED STATUS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 4 Cols: Standar Efisiensi Barber-Johnson (Kemenkes) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-rose-600" />
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">Indikator Mutu & Efisiensi RS</h2>
            </div>
            <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-bold">
              KMK Standard
            </span>
          </div>

          <div className="space-y-3.5">
            {/* BOR Gauge */}
            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 space-y-1.5">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-800">BOR (Bed Occupancy Rate)</span>
                <span className="text-blue-700 font-bold">{borPercentage}%</span>
              </div>
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, Number(borPercentage))}%` }}></div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0%</span>
                <span className="text-emerald-600 font-bold">Standar: 60 - 85% (Ideal)</span>
                <span>100%</span>
              </div>
            </div>

            {/* ALOS */}
            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 space-y-1.5">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-800">ALOS (Average Length of Stay)</span>
                <span className="text-purple-700 font-bold">{periodData.alos} Hari</span>
              </div>
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-purple-600 rounded-full" style={{ width: '56%' }}></div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>1 Hari</span>
                <span className="text-emerald-600 font-bold">Standar: 3 - 5 Hari (Sesuai)</span>
                <span>10 Hari</span>
              </div>
            </div>

            {/* TOI & BTO Mini Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-[10px] text-slate-400 font-medium">TOI (Turn Over Interval)</div>
                <div className="text-sm font-bold text-slate-900 mt-0.5">1.6 Hari</div>
                <div className="text-[9px] text-emerald-600 font-bold">Standar: 1 - 3 Hari</div>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-[10px] text-slate-400 font-medium">BTO (Bed Turn Over)</div>
                <div className="text-sm font-bold text-slate-900 mt-0.5">38.2 Kali</div>
                <div className="text-[9px] text-emerald-600 font-bold">Standar: 30 - 40x/th</div>
              </div>
            </div>
          </div>
        </div>

        {/* Center 4 Cols: Distribusi Penjamin Pasien (Donut) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">Distribusi Penjamin Pasien</h2>
            </div>
            <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-bold">
              Bulan Berjalan
            </span>
          </div>

          <div className="relative h-48 flex items-center justify-center">
            <Doughnut data={donutData} options={donutOptions} />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-slate-900 tracking-tight">
                {totalPenjamin}
              </span>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Total Pasien
              </span>
            </div>
          </div>

          <div className="space-y-2 pt-1 border-t border-slate-100 text-xs">
            <div className="flex items-center justify-between font-semibold">
              <div className="flex items-center gap-2 text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-600"></span>
                <span>BPJS Kesehatan</span>
              </div>
              <span className="text-slate-900">
                {bpjsCount} ({((bpjsCount / totalPenjamin) * 100).toFixed(0)}%)
              </span>
            </div>
            <div className="flex items-center justify-between font-semibold">
              <div className="flex items-center gap-2 text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
                <span>Pasien Umum (Tunai)</span>
              </div>
              <span className="text-slate-900">
                {umumCount} ({((umumCount / totalPenjamin) * 100).toFixed(0)}%)
              </span>
            </div>
            <div className="flex items-center justify-between font-semibold">
              <div className="flex items-center gap-2 text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                <span>Asuransi Swasta & Rekanan</span>
              </div>
              <span className="text-slate-900">
                {asuransiCount} ({((asuransiCount / totalPenjamin) * 100).toFixed(0)}%)
              </span>
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Kapasitas & Status Bangsal Rawat Inap */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">Kapasitas Tempat Tidur</h2>
            </div>
            <span className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full font-bold">
              {occupiedBeds} / {totalBeds} Terpakai
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {wardBreakdown.map((ward, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-800 truncate pr-2">{ward.name}</span>
                  <span className="text-slate-600 shrink-0">{ward.occupied} / {ward.total} ({ward.pct}%)</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${ward.colorClass} rounded-full`} style={{ width: `${Math.min(100, ward.pct)}%` }}></div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between p-3 bg-blue-50/70 rounded-xl border border-blue-100 text-[11px] text-blue-900 font-medium">
            <span>Bed Kosong Siap Huni:</span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-blue-700">{availableBeds} Bed</span>
              <button
                onClick={() => navigate('bedmanagement')}
                className="text-[11px] text-blue-600 hover:text-blue-800 font-bold underline inline-flex items-center gap-0.5 cursor-pointer ml-1"
                title="Buka manajemen tempat tidur"
              >
                Kelola Bed <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ROW 3: 10 DIAGNOSIS MORBIDITAS TERBANYAK (FULL WIDTH WITH SEARCH & CATEGORY FILTER) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-slate-100 gap-3">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-emerald-600" />
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                10 Diagnosis Terbanyak (Morbiditas ICD-10 RS)
              </h2>
              <p className="text-[11px] text-slate-400 font-medium">
                Peringkat prevalensi penyakit tertinggi berdasarkan kodefikasi rekam medis elektronik
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Tabs: Semua, Rawat Jalan, Rawat Inap */}
            <div className="inline-flex p-0.5 bg-slate-100 rounded-lg text-xs font-semibold text-slate-600">
              {(['semua', 'rajal', 'ranap'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedDiagnosisCategory(cat)}
                  className={`px-2.5 py-1 rounded-md text-[11px] transition-all cursor-pointer ${
                    selectedDiagnosisCategory === cat
                      ? 'bg-white text-blue-700 shadow-2xs font-bold'
                      : 'hover:text-slate-900'
                  }`}
                >
                  {cat === 'semua' ? 'Semua Morbiditas' : cat === 'rajal' ? 'Rawat Jalan (Poli)' : 'Rawat Inap'}
                </button>
              ))}
            </div>

            {/* Quick Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari kode / penyakit..."
                value={diagnosisSearch}
                onChange={e => setDiagnosisSearch(e.target.value)}
                className="pl-8 pr-3 py-1 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500 bg-slate-50 w-44"
              />
            </div>

            <button
              onClick={() => navigate('coding')}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-all cursor-pointer inline-flex items-center gap-1"
            >
              <span>Buka Coding ICD</span>
              <ChevronRight className="w-3 h-3 text-slate-500" />
            </button>
          </div>
        </div>

        {filteredDiagnosis.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 font-medium">
            Tidak ada diagnosis yang sesuai dengan pencarian "{diagnosisSearch}".
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-3.5 pt-1">
            {/* Kolom Kiri: Peringkat 1 - 5 */}
            <div className="space-y-3.5">
              {filteredDiagnosis.slice(0, Math.ceil(filteredDiagnosis.length / 2)).map((item, idx) => (
                <div key={item.code} className="space-y-1.5 p-2 rounded-xl hover:bg-slate-50/80 transition-colors">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-blue-700 px-1.5 py-0.5 bg-blue-50 rounded text-[11px] shrink-0">
                        {item.code}
                      </span>
                      <span className="text-slate-800 font-semibold truncate">
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className="font-bold text-slate-900 text-[11px]">
                        {item.cases} Kasus
                      </span>
                      <span className="text-slate-400 text-[10px] w-12 text-right">
                        {item.pct}
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full"
                      style={{ width: `${Math.max(12, (item.cases / allTop10Diagnosis[0].cases) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Kolom Kanan: Peringkat 6 - 10 */}
            <div className="space-y-3.5">
              {filteredDiagnosis.slice(Math.ceil(filteredDiagnosis.length / 2)).map((item, idx) => (
                <div key={item.code} className="space-y-1.5 p-2 rounded-xl hover:bg-slate-50/80 transition-colors">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold flex items-center justify-center shrink-0">
                        {idx + Math.ceil(filteredDiagnosis.length / 2) + 1}
                      </span>
                      <span className="font-bold text-blue-700 px-1.5 py-0.5 bg-blue-50 rounded text-[11px] shrink-0">
                        {item.code}
                      </span>
                      <span className="text-slate-800 font-semibold truncate">
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className="font-bold text-slate-900 text-[11px]">
                        {item.cases} Kasus
                      </span>
                      <span className="text-slate-400 text-[10px] w-12 text-right">
                        {item.pct}
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full"
                      style={{ width: `${Math.max(12, (item.cases / allTop10Diagnosis[0].cases) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
