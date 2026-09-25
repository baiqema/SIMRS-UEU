import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Modal } from '../components/Modal';
import { ReadOnlyBanner } from '../components/ReadOnlyBanner';
import { TracerIgdModal } from '../components/TracerIgdModal';
import { AsuhanKeperawatanIgdModal } from '../components/AsuhanKeperawatanIgdModal';
import { VClaimSepModal } from '../components/VClaimSepModal';
import { ProfilPasienKomprehensifModal } from '../components/ProfilPasienKomprehensifModal';
import { CetakStrukKunjunganModal } from '../components/CetakStrukKunjunganModal';
import { CetakGeneralConsentModal } from '../components/CetakGeneralConsentModal';
import { EditKunjunganModal } from '../components/EditKunjunganModal';
import { ModalCekBpjs } from '../components/ModalCekBpjs';
import { BedManagementView } from '../components/bed/BedManagementView';
import Swal from 'sweetalert2';
import {
  ClipboardList, User, ShieldCheck, Stethoscope, RefreshCw,
  Plus, Eye, FileText, ArrowRight, CheckCircle2, Building2,
  Phone, Mail, Calendar, UserPlus, HeartPulse, ShieldAlert,
  Search, Check, Printer, FileCheck, Layers, MapPin, UserCheck, CheckSquare, Square, Bed,
  Download, Edit3, XCircle, AlertTriangle, Filter, BarChart3, Hash, Tag, Baby, FileSignature, X
} from 'lucide-react';
import { RegistrationType, Patient, Registration } from '../types';
import { IndonesianAddressSelector } from '../components/common/IndonesianAddressSelector';

export const PendaftaranView: React.FC = () => {
  const {
    registrations, patients, users, beds, generalConsents,
    addRegistration, addPatient, updatePatient, getPatient, getUser, params, navigate, canEditPage,
    generateNoRM, cancelRegistration, updateRegistration, activePage
  } = useApp();

  const isEditable = canEditPage('pendaftaran');

  // Active view mode: 'form' (Form Registrasi) | 'laporan' (Kunjungan Pasien) | 'list' (Monitoring & Antrean) | 'bedmanagement' (Bed Management Rawat Inap)
  const [viewMode, setViewMode] = useState<'form' | 'laporan' | 'list' | 'bedmanagement'>(() => {
    if (params?.viewMode === 'bedmanagement' || activePage === 'bedmanagement') return 'bedmanagement';
    if (params?.tab === 'kunjungan' || params?.viewMode === 'laporan' || activePage === 'kunjungan') return 'laporan';
    return 'form';
  });

  useEffect(() => {
    if (params?.viewMode === 'bedmanagement' || activePage === 'bedmanagement') {
      setViewMode('bedmanagement');
    } else if (params?.tab === 'kunjungan' || params?.viewMode === 'laporan' || activePage === 'kunjungan') {
      setViewMode('laporan');
    }

    if (params?.regType === 'Rawat Inap') {
      setViewMode('form');
      setServiceType('Rawat Inap');
    }
    if (params?.room) {
      setRuangRawatBangsal(params.room);
    }
    if (params?.bedId) {
      setSelectedBedId(params.bedId);
      const bObj = beds.find(b => b.id === params.bedId);
      if (bObj) {
        setNoKamarBed(`${bObj.roomName || bObj.room} - ${bObj.bedNumber || bObj.id}`);
        setKelasRawatInap(bObj.class);
      }
    }
    if (params?.kelas) {
      setKelasRawatInap(params.kelas);
    }
  }, [params, beds]);

  const [profilModalRegId, setProfilModalRegId] = useState<string | null>(null);

  // Laporan Kunjungan Search & Filter States
  const [laporanSearchTerm, setLaporanSearchTerm] = useState('');
  const [laporanTahun, setLaporanTahun] = useState('all');
  const [laporanBulan, setLaporanBulan] = useState('all');
  const [laporanTanggal, setLaporanTanggal] = useState('');
  const [laporanCaraBayar, setLaporanCaraBayar] = useState('all');
  const [laporanTipeLayanan, setLaporanTipeLayanan] = useState('all');
  const [laporanStatus, setLaporanStatus] = useState('all');

  // Action Modals State
  const [printStrukRegId, setPrintStrukRegId] = useState<string | null>(null);
  const [printGcRegId, setPrintGcRegId] = useState<string | null>(null);
  const [editRegId, setEditRegId] = useState<string | null>(null);
  const [editPoli, setEditPoli] = useState('');
  const [editDpjp, setEditDpjp] = useState('');
  const [editStatus, setEditStatus] = useState<Registration['status']>('Selesai');
  const [editRoom, setEditRoom] = useState('');

  // Filter for list mode
  const [typeFilter, setTypeFilter] = useState<string>(params?.filterType || '');
  const [detailRegId, setDetailRegId] = useState<string | null>(null);
  const [tracerModalRegId, setTracerModalRegId] = useState<string | null>(null);
  const [aksepIgdRegId, setAksepIgdRegId] = useState<string | null>(null);
  const [sepModalRegId, setSepModalRegId] = useState<string | null>(null);
  const [isBedPickerModalOpen, setIsBedPickerModalOpen] = useState(false);

  // UNIT SERVICE TYPE (4 DISTINCT FORMS ACCORDING TO KMK 1423 METADATA)
  // 'IGD' | 'Rawat Jalan' | 'Rawat Inap' | 'Bayi Baru Lahir'
  const [serviceType, setServiceType] = useState<RegistrationType>(() => {
    if (params?.regType) return params.regType as RegistrationType;
    if (params?.filterType === 'Rawat Inap' || params?.filterType === 'IGD' || params?.filterType === 'Bayi Baru Lahir') {
      return params.filterType as RegistrationType;
    }
    return 'Rawat Jalan';
  });

  // SECTION I: DATA PRIBADI PASIEN STATE
  const [jenisPasien, setJenisPasien] = useState<'baru' | 'lama'>('baru');
  const [selectedPasienLamaId, setSelectedPasienLamaId] = useState<string>('');

  // Auto-fill Search Inputs
  const [searchNoRM, setSearchNoRM] = useState('');
  const [searchName, setSearchName] = useState('');
  const [searchDob, setSearchDob] = useState('');

  // Filter Pasien Lama by Nama & Tanggal Lahir (Mencegah scroll panjang ke bawah)
  const matchingPasienLama = useMemo(() => {
    const qName = searchName.trim().toLowerCase();
    const qDob = searchDob.trim();
    if (!qName && !qDob) return [];
    
    return patients.filter(p => {
      const matchName = !qName || 
        p.name.toLowerCase().includes(qName) || 
        p.noRM.toLowerCase().includes(qName) || 
        (p.nik && p.nik.includes(qName));
      const matchDob = !qDob || (p.dob && p.dob.includes(qDob));
      return matchName && matchDob;
    });
  }, [patients, searchName, searchDob]);

  const [noRM, setNoRM] = useState<string>(() => generateNoRM());

  // Keep No. RM updated when in "baru" mode
  useEffect(() => {
    if (jenisPasien === 'baru' && !selectedPasienLamaId) {
      setNoRM(generateNoRM());
    }
  }, [jenisPasien, patients.length]);

  const [kewarganegaraan, setKewarganegaraan] = useState('INDONESIA');
  const [wniWna, setWniWna] = useState<'WNI' | 'WNA'>('WNI');
  const [nik, setNik] = useState('');
  const [noIdentitasLain, setNoIdentitasLain] = useState('');
  const [namaIbuKandung, setNamaIbuKandung] = useState('Siti Aminah');
  const [satuSehatId, setSatuSehatId] = useState('');
  const [satuSehatSyncing, setSatuSehatSyncing] = useState(false);
  const [namaLengkap, setNamaLengkap] = useState('');

  // 5 GENDER OPTIONS ACCORDING TO KMK 1423 / STANDAR KEMENKES RI:
  // 1: Laki-laki, 2: Perempuan, 0: Tidak diketahui, 3: Tidak dapat ditentukan, 4: Tidak mengisi
  const [jenisKelamin, setJenisKelamin] = useState<string>('1');
  const [tempatLahir, setTempatLahir] = useState('Jakarta');
  const [tanggalLahir, setTanggalLahir] = useState('1992-05-15');
  const [statusPernikahan, setStatusPernikahan] = useState('Menikah');
  const [agama, setAgama] = useState('Islam');
  const [pendidikan, setPendidikan] = useState('SMA / Sederajat');
  const [pekerjaan, setPekerjaan] = useState('Karyawan Swasta');
  const [golonganDarah, setGolonganDarah] = useState('O');
  const [riwayatAlergi, setRiwayatAlergi] = useState('Tidak Ada Alergi');

  // Structured Patient Address State (KMK 1423 Berjenjang)
  const [negaraPasien, setNegaraPasien] = useState('INDONESIA');
  const [provinsi, setProvinsi] = useState('DKI JAKARTA');
  const [kabupaten, setKabupaten] = useState('KOTA JAKARTA BARAT');
  const [kecamatan, setKecamatan] = useState('KEBON JERUK');
  const [kelurahan, setKelurahan] = useState('DURI KEPA');
  const [alamatJalanKtp, setAlamatJalanKtp] = useState('Jl. Arjuna Utara No. 9, RT 003 / RW 002');
  const [alamatDomisili, setAlamatDomisili] = useState('Jl. Arjuna Utara No. 9, RT 003 / RW 002');
  const [noTelp, setNoTelp] = useState('081289123456');
  const [email, setEmail] = useState('pasien@esauggul.ac.id');

  // SECTION II: PENANGGUNG JAWAB (GUARANTOR) STATE
  const [namaPenanggungJawab, setNamaPenanggungJawab] = useState('Hendra Wijaya');
  const [noHpPenanggungJawab, setNoHpPenanggungJawab] = useState('081398765432');
  const [hubunganPenanggungJawab, setHubunganPenanggungJawab] = useState('Suami');
  const [negaraPJ, setNegaraPJ] = useState('INDONESIA');
  const [provinsiPJ, setProvinsiPJ] = useState('DKI JAKARTA');
  const [kabupatenPJ, setKabupatenPJ] = useState('KOTA JAKARTA BARAT');
  const [kecamatanPJ, setKecamatanPJ] = useState('KEBON JERUK');
  const [kelurahanPJ, setKelurahanPJ] = useState('DURI KEPA');
  const [alamatJalanPJ, setAlamatJalanPJ] = useState('Jl. Arjuna Utara No. 9, RT 003 / RW 002');
  const [pjSamaDenganPasien, setPjSamaDenganPasien] = useState(false);

  // SECTION III: DATA KUNJUNGAN UMUM
  const [kodeBooking, setKodeBooking] = useState(() => 'JKN-' + Math.floor(100000 + Math.random() * 900000));
  const [tglKunjungan, setTglKunjungan] = useState(() => new Date().toISOString().split('T')[0]);
  const [jamKunjungan, setJamKunjungan] = useState(() => new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
  const [jenisKunjungan, setJenisKunjungan] = useState('Kunjungan Baru');

  // SECTION SPECIFIC: 1. IGD (INSTALASI GAWAT DARURAT)
  const [igdTriage, setIgdTriage] = useState<'Merah (Resusitasi)' | 'Kuning (Emergensi)' | 'Hijau (Non-Emergensi)' | 'Hitam (Meninggal)'>('Kuning (Emergensi)');
  const [igdCaraDatang, setIgdCaraDatang] = useState('Datang Sendiri (Mandiri)');
  const [igdSebabMasuk, setIgdSebabMasuk] = useState('Non Trauma (Penyakit Akut)');
  const [igdGcs, setIgdGcs] = useState('E4M6V5 (Compos Mentis - GCS 15)');
  const [igdKeluhanUtama, setIgdKeluhanUtama] = useState('Sesak napas mendadak disertai nyeri dada dan keringat dingin sejak 2 jam lalu');
  const [igdDokterJaga, setIgdDokterJaga] = useState('U002');

  // SECTION SPECIFIC: 2. RAWAT JALAN (POLIKLINIK)
  const [poliklinikTujuan, setPoliklinikTujuan] = useState('Poliklinik Penyakit Dalam');
  const [dokterSpesialis, setDokterSpesialis] = useState('');
  const [jadwalDokter, setJadwalDokter] = useState('Pagi (08:00 - 12:00 WIB)');
  const [ralanCaraMasuk, setRalanCaraMasuk] = useState('Rujukan FKTP (Puskesmas / Klinik)');
  const [noRujukanFktp, setNoRujukanFktp] = useState('RUK-0112-2026-004812');

  // SECTION SPECIFIC: 3. RAWAT INAP (ADMISI BANGSAL)
  const [ruangRawatBangsal, setRuangRawatBangsal] = useState('Bangsal Mawar - Penyakit Dalam');
  const [kelasRawatInap, setKelasRawatInap] = useState('Kelas 1');
  const [noKamarBed, setNoKamarBed] = useState('Kamar 102 - Bed A');
  const [selectedBedId, setSelectedBedId] = useState<string>('MWR-102-A');
  const [isNaikKelas, setIsNaikKelas] = useState<boolean>(false);
  const [naikKelasDari, setNaikKelasDari] = useState<string>('Kelas 2');
  const [naikKelasKe, setNaikKelasKe] = useState<string>('Kelas 1');
  const [ranapAsalPasien, setRanapAsalPasien] = useState('Rujukan IGD (Emergency Admission)');
  const [ranapDiagnosisAwal, setRanapDiagnosisAwal] = useState('Hipertensi Urgensi dengan decompensasi cordis NYHA II');
  const [ranapDpjpUtama, setRanapDpjpUtama] = useState('');

  // SECTION SPECIFIC: 4. BAYI BARU LAHIR (NEONATUS / BBL)
  const [bblNamaIbu, setBblNamaIbu] = useState('Ny. Siti Rahmawati');
  const [bblNoRMIbu, setBblNoRMIbu] = useState('000003');
  const [bblNikIbu, setBblNikIbu] = useState('3173055406930002');
  const [bblUmurIbu, setBblUmurIbu] = useState('29 Tahun');
  const [bblParitas, setBblParitas] = useState('G2P1A0 (Gestasi 39 Minggu)');
  const [bblJenisKelahiran, setBblJenisKelahiran] = useState('Tunggal (Single)');
  const [bblCaraPersalinan, setBblCaraPersalinan] = useState('Spontan Pervaginam (Normal)');
  const [bblJamLahir, setBblJamLahir] = useState('06:45 WIB');
  const [bblApgar1, setBblApgar1] = useState('8');
  const [bblApgar5, setBblApgar5] = useState('9');
  const [bblApgar10, setBblApgar10] = useState('10');
  const [bblBeratLahir, setBblBeratLahir] = useState('3200'); // gram
  const [bblPanjangBadan, setBblPanjangBadan] = useState('50'); // cm
  const [bblLingkarKepala, setBblLingkarKepala] = useState('34'); // cm
  const [bblLingkarDada, setBblLingkarDada] = useState('33'); // cm
  const [bblPenolongPersalinan, setBblPenolongPersalinan] = useState('dr. Maya Indriani, Sp.A & Bidan RS');
  const [bblRuangPerawatan, setBblRuangPerawatan] = useState('Ruang Rawat Gabung Ibu-Anak (Rooming-In)');
  const [bblKelainanBawaan, setBblKelainanBawaan] = useState('Tidak Ada Kelainan (Normal / Bugar)');

  // SECTION IV: CARA PEMBAYARAN & JAMINAN
  const [caraPembayaran, setCaraPembayaran] = useState('BPJS KESEHATAN');
  const [noAsuransi, setNoAsuransi] = useState('0001829384912');
  const [catatanKunjungan, setCatatanKunjungan] = useState('');

  // VClaim Bridging & Real-Time Sync State
  const [vclaimChecking, setVclaimChecking] = useState(false);
  const [generatedSepDummy, setGeneratedSepDummy] = useState<string>('');
  const [showQuickCheckModal, setShowQuickCheckModal] = useState(false);

  // Status VClaim & Database Lokal Synchronizer
  const [currentVclaimStatus, setCurrentVclaimStatus] = useState<{
    checked: boolean;
    status: 'Aktif' | 'Tidak Aktif';
    statusDesc: string;
    hakKelas: string;
    faskes1: string;
    lastChecked: string;
    responseCode: string;
    dbSynced: boolean;
  }>({
    checked: true,
    status: 'Aktif',
    statusDesc: 'Peserta Mandiri / PBI Terdaftar Aktif',
    hakKelas: 'Kelas 1',
    faskes1: 'Puskesmas Kebon Jeruk (0112001)',
    lastChecked: 'Terverifikasi',
    responseCode: '200 OK',
    dbSynced: true
  });

  // Log Pemantauan Sinkronisasi VClaim (tersimpan di localStorage agar selalu stabil dan muncul)
  const [vclaimSyncLogs, setVclaimSyncLogs] = useState<Array<{
    id: string;
    timestamp: string;
    noBPJS: string;
    nik: string;
    patientName: string;
    noRM: string;
    status: 'Aktif' | 'Tidak Aktif';
    statusDesc: string;
    hakKelas: string;
    faskes1: string;
    sepNo?: string;
    responseCode: string;
    dbSynced: boolean;
  }>>(() => {
    try {
      const stored = localStorage.getItem('simrs_vclaim_sync_logs');
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return [
      {
        id: 'VC-001',
        timestamp: '2026-09-23 09:15:22',
        noBPJS: '0001234567891',
        nik: '3174011505920001',
        patientName: 'Tn. Ahmad Fauzi',
        noRM: '000001',
        status: 'Aktif',
        statusDesc: 'Peserta Mandiri Kelas 1 (Iuran Lunas)',
        hakKelas: 'Kelas 1',
        faskes1: 'Puskesmas Kebon Jeruk (0112001)',
        sepNo: '0012R0010826V000881',
        responseCode: '200 OK',
        dbSynced: true
      },
      {
        id: 'VC-002',
        timestamp: '2026-09-23 10:02:40',
        noBPJS: '0001234567892',
        nik: '3174022408850002',
        patientName: 'Ny. Siti Rahma',
        noRM: '000002',
        status: 'Aktif',
        statusDesc: 'Peserta PBI APBN (Pemerintah)',
        hakKelas: 'Kelas 2',
        faskes1: 'Puskesmas Palmerah (0112002)',
        sepNo: '0012R0010826V000912',
        responseCode: '200 OK',
        dbSynced: true
      },
      {
        id: 'VC-003',
        timestamp: '2026-09-23 11:30:15',
        noBPJS: '0001234567894',
        nik: '3174041812180004',
        patientName: 'An. Rizky Pratama',
        noRM: '000004',
        status: 'Tidak Aktif',
        statusDesc: 'Tunggakan Iuran 2 Bulan (Non-Aktif sejak 01/08/2026)',
        hakKelas: 'Kelas 3',
        faskes1: 'Puskesmas Kebon Jeruk (0112001)',
        sepNo: '-',
        responseCode: '201 Not Active',
        dbSynced: true
      }
    ];
  });

  const [vclaimLogFilter, setVclaimLogFilter] = useState<'all' | 'Aktif' | 'Tidak Aktif'>('all');
  const [showVclaimLogPanel, setShowVclaimLogPanel] = useState(true);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('simrs_vclaim_sync_logs', JSON.stringify(vclaimSyncLogs));
    } catch {
      // ignore
    }
  }, [vclaimSyncLogs]);

  // Handler input No BPJS: Hanya angka, maksimal 13 digit
  const handleNoBpjsChange = (val: string) => {
    const digitsOnly = val.replace(/\D/g, '').slice(0, 13);
    setNoAsuransi(digitsOnly);

    // Otomatis sinkronkan status jika nomor terdaftar pada database pasien
    const matched = patients.find(p => p.noBPJS === digitsOnly);
    if (matched) {
      const isAktif = matched.bpjsStatus !== 'Tidak Aktif';
      setCurrentVclaimStatus({
        checked: true,
        status: isAktif ? 'Aktif' : 'Tidak Aktif',
        statusDesc: matched.bpjsNotes || (isAktif ? 'Peserta Terdaftar & Iuran Lunas' : 'Tunggakan Iuran 2 Bulan (Non-Aktif)'),
        hakKelas: matched.bpjsClass || 'Kelas 1',
        faskes1: 'Puskesmas Kebon Jeruk (0112001)',
        lastChecked: new Date().toLocaleTimeString('id-ID'),
        responseCode: isAktif ? '200 OK' : '201 Not Active',
        dbSynced: true
      });
    }
  };

  const doctors = users.filter(u => u.roleId === 'R05');

  // Initialize doctor default
  useEffect(() => {
    if (doctors.length > 0) {
      if (!dokterSpesialis) setDokterSpesialis(doctors[0].id);
      if (!ranapDpjpUtama) setRanapDpjpUtama(doctors[0].id);
      if (!igdDokterJaga) setIgdDokterJaga(doctors[0].id);
    }
  }, [doctors]);

  // Sync PJ Address if checkbox checked
  useEffect(() => {
    if (pjSamaDenganPasien) {
      setNegaraPJ(negaraPasien);
      setProvinsiPJ(provinsi);
      setKabupatenPJ(kabupaten);
      setKecamatanPJ(kecamatan);
      setKelurahanPJ(kelurahan);
      setAlamatJalanPJ(alamatJalanKtp);
    }
  }, [pjSamaDenganPasien, negaraPasien, provinsi, kabupaten, kecamatan, kelurahan, alamatJalanKtp]);

  // Handle service type change
  const handleServiceTypeChange = (type: RegistrationType) => {
    setServiceType(type);
    if (type === 'IGD') {
      setPoliklinikTujuan('Instalasi Gawat Darurat (IGD)');
    } else if (type === 'Rawat Inap') {
      setPoliklinikTujuan('Rawat Inap VVIP / VIP / Bangsal');
    } else if (type === 'Bayi Baru Lahir') {
      setPoliklinikTujuan('Ruang Perinatologi / Rawat Gabung Neonatus');
      if (!namaLengkap || namaLengkap === 'Budi Santoso') {
        setNamaLengkap(`By. Ny. ${bblNamaIbu}`);
      }
    } else {
      setPoliklinikTujuan('Poliklinik Penyakit Dalam');
    }
  };

  const handleCheckVclaim = () => {
    // Validasi digit BPJS (Harus angka dan 13 digit)
    if (noAsuransi && noAsuransi.length !== 13) {
      Swal.fire({
        icon: 'warning',
        title: 'Validasi Digit No. BPJS',
        text: `Nomor Kartu BPJS Kesehatan harus tepat 13 digit angka (saat ini ${noAsuransi.length} digit). Harap periksa kembali.`,
        confirmButtonColor: '#2563eb'
      });
      return;
    }

    setVclaimChecking(true);
    setTimeout(() => {
      setVclaimChecking(false);
      // Resolve patient from current input or selection
      const matchedPatient = patients.find(p =>
        (selectedPasienLamaId && p.id === selectedPasienLamaId) ||
        (noAsuransi && p.noBPJS === noAsuransi) ||
        (nik && p.nik === nik) ||
        (namaLengkap && p.name.toLowerCase() === namaLengkap.toLowerCase())
      );

      const resolvedName = namaLengkap || matchedPatient?.name || 'Peserta BPJS Terdaftar';
      const resolvedBpjs = noAsuransi || matchedPatient?.noBPJS || '0001829384912';
      const resolvedNik = nik || matchedPatient?.nik || '3173012903840001';
      const resolvedRM = noRM || matchedPatient?.noRM || '000001';

      // Cek apakah aktif atau tidak aktif
      const isCardActive = matchedPatient
        ? matchedPatient.bpjsStatus !== 'Tidak Aktif'
        : currentVclaimStatus.status === 'Aktif';

      const statusDesc = !isCardActive
        ? (matchedPatient?.bpjsNotes || 'Tunggakan Iuran 2 Bulan (Non-Aktif sejak 01/08/2026)')
        : 'Peserta Mandiri / PBI Aktif (Iuran Terbayar)';

      const hakKelas = matchedPatient?.bpjsClass || currentVclaimStatus.hakKelas || 'Kelas 1';
      const faskes1 = 'Puskesmas Kebon Jeruk (0112001)';
      const respCode = isCardActive ? '200 OK' : '201 Not Active';
      const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
      const newSep = isCardActive ? `0012R0010826V${Math.floor(100000 + Math.random() * 900000)}` : '-';

      if (isCardActive) {
        setGeneratedSepDummy(newSep);
      }
      if (!noAsuransi) setNoAsuransi(resolvedBpjs);

      // Perbarui status VClaim aktif saat ini
      setCurrentVclaimStatus({
        checked: true,
        status: isCardActive ? 'Aktif' : 'Tidak Aktif',
        statusDesc,
        hakKelas,
        faskes1,
        lastChecked: new Date().toLocaleTimeString('id-ID'),
        responseCode: respCode,
        dbSynced: true
      });

      // Sinkronkan ke database pasien lokal bila pasien terdaftar
      if (matchedPatient) {
        updatePatient(matchedPatient.id, {
          noBPJS: resolvedBpjs,
          bpjsStatus: isCardActive ? 'Aktif' : 'Tidak Aktif',
          bpjsClass: hakKelas
        });
      }

      // Tambahkan ke log pemantauan sinkronisasi
      const newLogItem = {
        id: `VC-${Date.now().toString().slice(-4)}`,
        timestamp: nowStr,
        noBPJS: resolvedBpjs,
        nik: resolvedNik,
        patientName: resolvedName,
        noRM: resolvedRM,
        status: isCardActive ? ('Aktif' as const) : ('Tidak Aktif' as const),
        statusDesc,
        hakKelas,
        faskes1,
        sepNo: newSep,
        responseCode: respCode,
        dbSynced: true
      };

      setVclaimSyncLogs(prev => [newLogItem, ...prev]);

      Swal.fire({
        icon: isCardActive ? 'success' : 'error',
        title: isCardActive
          ? 'Bridging VClaim BPJS - STATUS AKTIF (200 OK)'
          : 'Bridging VClaim BPJS - STATUS TIDAK AKTIF (201)',
        html: `
          <div class="text-left text-xs space-y-2 p-3.5 rounded-xl border mt-2 ${
            isCardActive ? 'bg-emerald-50 border-emerald-300 text-emerald-950' : 'bg-rose-50 border-rose-300 text-rose-950'
          }">
            <div class="flex items-center justify-between pb-1.5 border-b ${isCardActive ? 'border-emerald-200' : 'border-rose-200'}">
              <span class="font-bold">Status Sinkronisasi DB Lokal:</span>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold ${
                isCardActive ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'
              }">
                ${isCardActive ? '✓ TERSINKRONISASI (AKTIF)' : '⚠ TERSINKRONISASI (TIDAK AKTIF)'}
              </span>
            </div>
            <div><strong>Nomor SEP:</strong> <span class="font-mono font-bold">${newSep}</span></div>
            <div><strong>Nama Peserta:</strong> ${resolvedName} (No. RM: ${resolvedRM})</div>
            <div><strong>No. Kartu BPJS:</strong> <span class="font-mono font-bold">${resolvedBpjs}</span> (13 Digit Angka)</div>
            <div><strong>NIK KTP:</strong> <span class="font-mono">${resolvedNik}</span></div>
            <div><strong>Status Kepesertaan:</strong> <span class="font-bold ${isCardActive ? 'text-emerald-700' : 'text-rose-700'}">${isCardActive ? 'AKTIF (PBI APBN / NON-PBI)' : 'TIDAK AKTIF (Tunggakan Premi / Non-Aktif)'}</span></div>
            <div><strong>Keterangan Respon:</strong> ${statusDesc} (Kode ${respCode})</div>
            <div><strong>Hak Kelas:</strong> ${hakKelas}</div>
            <div><strong>Faskes Rujukan 1:</strong> ${faskes1}</div>
            ${!isCardActive ? '<div class="p-2.5 bg-white rounded-lg border border-rose-200 text-rose-700 font-semibold mt-1">Peringatan Admisi: Status kartu BPJS TIDAK AKTIF. Pelayanan tidak dijamin oleh BPJS Kesehatan. Pasien disarankan menyelesaikan tunggakan iuran atau dialihkan ke pembayaran UMUM / Mandiri.</div>' : ''}
          </div>
        `,
        confirmButtonColor: isCardActive ? '#059669' : '#e11d48',
        confirmButtonText: isCardActive ? 'Gunakan SEP & Lanjutkan' : 'Pahami Status Tidak Aktif'
      });
    }, 600);
  };

  // Auto fill patient when selected
  const autoFillPatient = (p: Patient) => {
    setSelectedPasienLamaId(p.id);
    setJenisPasien('lama');
    setNoRM(p.noRM);
    setNik(p.nik);
    setNamaLengkap(p.name);
    setJenisKelamin(p.gender === 'M' || p.gender === '1' || p.gender === 'L' ? '1' : p.gender === 'F' || p.gender === '2' || p.gender === 'P' ? '2' : p.gender || '1');
    setTanggalLahir(p.dob);
    setNoTelp(p.phone);
    setCaraPembayaran(p.insuranceType === 'BPJS' ? 'BPJS KESEHATAN' : p.insuranceType === 'Umum' ? 'UMUM / CASH / DEBIT' : 'ASURANSI SWASTA');
    setNoAsuransi(p.noBPJS !== '-' ? p.noBPJS : '');
    setSatuSehatId('P-' + Math.floor(10000000 + Math.random() * 90000000));

    // Sinkronisasi status VClaim & DB Pasien Lokal
    if (p.insuranceType === 'BPJS' || (p.noBPJS && p.noBPJS !== '-')) {
      const isAktif = p.bpjsStatus !== 'Tidak Aktif';
      setCurrentVclaimStatus({
        checked: true,
        status: isAktif ? 'Aktif' : 'Tidak Aktif',
        statusDesc: p.bpjsNotes || (isAktif ? 'Peserta Terdaftar & Iuran Lunas' : 'Tunggakan Iuran 2 Bulan (Non-Aktif sejak 01/08/2026)'),
        hakKelas: p.bpjsClass || 'Kelas 1',
        faskes1: 'Puskesmas Kebon Jeruk (0112001)',
        lastChecked: new Date().toLocaleTimeString('id-ID'),
        responseCode: isAktif ? '200 OK' : '201 Not Active',
        dbSynced: true
      });
    }
    
    if (p.country) setNegaraPasien(p.country);
    if (p.province) setProvinsi(p.province);
    if (p.regency) setKabupaten(p.regency);
    if (p.district) setKecamatan(p.district);
    if (p.subDistrict) setKelurahan(p.subDistrict);
    if (p.addressStreet) setAlamatJalanKtp(p.addressStreet);
    else setAlamatJalanKtp(p.address || '');

    if (p.guarantor) {
      setNamaPenanggungJawab(p.guarantor.name || '');
      setNoHpPenanggungJawab(p.guarantor.phone || '');
      setHubunganPenanggungJawab(p.guarantor.relation || 'Suami');
      if (p.guarantor.country) setNegaraPJ(p.guarantor.country);
      if (p.guarantor.province) setProvinsiPJ(p.guarantor.province);
      if (p.guarantor.regency) setKabupatenPJ(p.guarantor.regency);
      if (p.guarantor.district) setKecamatanPJ(p.guarantor.district);
      if (p.guarantor.subDistrict) setKelurahanPJ(p.guarantor.subDistrict);
      if (p.guarantor.addressStreet) setAlamatJalanPJ(p.guarantor.addressStreet);
    }

    Swal.fire({
      icon: 'success',
      title: 'Data Pasien Otomatis Diterapkan!',
      text: `Pasien ${p.name} (${p.noRM}) berhasil dimuat untuk Pendaftaran ${serviceType}.`,
      timer: 1600,
      showConfirmButton: false
    });
  };

  const handleSyncSatuSehat = () => {
    if (!nik || nik.length < 10) {
      Swal.fire({
        icon: 'warning',
        title: 'Validasi NIK',
        text: 'Masukkan 16 Digit NIK KTP Pasien terlebih dahulu',
        confirmButtonColor: '#2563eb'
      });
      return;
    }
    setSatuSehatSyncing(true);
    setTimeout(() => {
      setSatuSehatSyncing(false);
      const generatedSatuSehat = 'P-' + Math.floor(10000000 + Math.random() * 90000000);
      setSatuSehatId(generatedSatuSehat);
      Swal.fire({
        icon: 'success',
        title: 'Terhubung SatuSehat Kemenkes',
        text: `Identitas pasien berhasil disinkronisasi. SatuSehat ID: ${generatedSatuSehat}`,
        timer: 1800,
        showConfirmButton: false
      });
    }, 900);
  };

  const calculateAgeStr = (dobStr: string) => {
    if (!dobStr) return '0 Tahun';
    const birth = new Date(dobStr);
    const now = new Date();
    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    if (months < 0 || (months === 0 && now.getDate() < birth.getDate())) {
      years--;
      months += 12;
    }
    return `${years} Tahun ${months} Bulan`;
  };

  const searchedPatients = useMemo(() => {
    const list = (!searchNoRM && !searchName && !searchDob) ? patients.slice(0, 10) : patients.filter(p => {
      const matchRM = searchNoRM ? p.noRM.toLowerCase().includes(searchNoRM.toLowerCase()) : true;
      const matchName = searchName ? p.name.toLowerCase().includes(searchName.toLowerCase()) : true;
      const matchDob = searchDob ? p.dob === searchDob : true;
      return matchRM && matchName && matchDob;
    });
    return [...list].sort((a, b) => {
      const numA = parseInt(a.noRM.replace(/\D/g, '') || '0', 10);
      const numB = parseInt(b.noRM.replace(/\D/g, '') || '0', 10);
      return numA - numB;
    });
  }, [patients, searchNoRM, searchName, searchDob]);

  // Form Submission
  const handleSubmitRegistration = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEditable) {
      Swal.fire({
        icon: 'warning',
        title: 'Akses Terbatas (Mode Lihat)',
        text: 'Akun Anda berada dalam Mode Lihat (Read-Only) untuk modul Pendaftaran.',
        confirmButtonColor: '#d97706'
      });
      return;
    }

    const finalPatientName = serviceType === 'Bayi Baru Lahir'
      ? (namaLengkap || `By. Ny. ${bblNamaIbu}`)
      : namaLengkap;

    if (!finalPatientName.trim()) {
      Swal.fire({ icon: 'warning', title: 'Validasi Data', text: 'Nama Lengkap Pasien wajib diisi', confirmButtonColor: '#2563eb' });
      return;
    }

    // Validasi No. BPJS: Harus angka dan 13 digit
    if (caraPembayaran.includes('BPJS') && noAsuransi && noAsuransi.length !== 13) {
      Swal.fire({
        icon: 'warning',
        title: 'Validasi No. Kartu BPJS',
        text: `Nomor Kartu BPJS Kesehatan harus tepat 13 digit angka (saat ini ${noAsuransi.length} digit). Harap periksa kembali.`,
        confirmButtonColor: '#2563eb'
      });
      return;
    }

    let effectiveDoctor = dokterSpesialis;
    if (serviceType === 'IGD') effectiveDoctor = igdDokterJaga || 'U002';
    if (serviceType === 'Rawat Inap') effectiveDoctor = ranapDpjpUtama || 'U002';
    if (serviceType === 'Bayi Baru Lahir') effectiveDoctor = 'U002';
    if (!effectiveDoctor && doctors.length > 0) effectiveDoctor = doctors[0].id;

    let targetPatientId = selectedPasienLamaId;

    // 1. Create or resolve Patient
    if (jenisPasien === 'baru' || !targetPatientId) {
      const fullAddr = `${alamatJalanKtp || 'Jl. Raya No. 12'}, Kel. ${kelurahan}, Kec. ${kecamatan}, ${kabupaten}, ${provinsi}, ${negaraPasien}`;
      const newPatient = addPatient({
        noRM,
        nik: nik || (serviceType === 'Bayi Baru Lahir' ? bblNikIbu : '3173' + Math.floor(100000000000 + Math.random() * 900000000000)),
        name: finalPatientName,
        dob: tanggalLahir,
        gender: jenisKelamin,
        address: fullAddr,
        phone: noTelp || '081234567890',
        bloodType: golonganDarah || 'O',
        allergy: riwayatAlergi || '-',
        insuranceType: caraPembayaran.includes('BPJS') ? 'BPJS' : caraPembayaran.includes('ASURANSI') ? 'Asuransi' : 'Umum',
        noBPJS: noAsuransi || '-',
        bpjsStatus: caraPembayaran.includes('BPJS') ? currentVclaimStatus.status : undefined,
        bpjsClass: caraPembayaran.includes('BPJS') ? currentVclaimStatus.hakKelas : undefined,
        bpjsNotes: caraPembayaran.includes('BPJS') ? currentVclaimStatus.statusDesc : undefined,
        country: negaraPasien,
        province: provinsi,
        regency: kabupaten,
        district: kecamatan,
        subDistrict: kelurahan,
        addressStreet: alamatJalanKtp,
        guarantor: {
          name: namaPenanggungJawab,
          phone: noHpPenanggungJawab,
          relation: hubunganPenanggungJawab,
          country: negaraPJ,
          province: provinsiPJ,
          regency: kabupatenPJ,
          district: kecamatanPJ,
          subDistrict: kelurahanPJ,
          addressStreet: alamatJalanPJ
        },
        motherNoRM: serviceType === 'Bayi Baru Lahir' ? bblNoRMIbu : undefined,
        motherName: serviceType === 'Bayi Baru Lahir' ? bblNamaIbu : undefined,
        birthWeight: serviceType === 'Bayi Baru Lahir' ? bblBeratLahir : undefined,
        birthLength: serviceType === 'Bayi Baru Lahir' ? bblPanjangBadan : undefined,
        headCircumference: serviceType === 'Bayi Baru Lahir' ? bblLingkarKepala : undefined,
        apgarScore: serviceType === 'Bayi Baru Lahir' ? `${bblApgar1}-${bblApgar5}-${bblApgar10}` : undefined,
        deliveryMethod: serviceType === 'Bayi Baru Lahir' ? bblCaraPersalinan : undefined
      });
      targetPatientId = newPatient.id;
    } else if (targetPatientId && caraPembayaran.includes('BPJS')) {
      // Sinkronkan update status BPJS ke database pasien lama
      updatePatient(targetPatientId, {
        noBPJS: noAsuransi || '-',
        bpjsStatus: currentVclaimStatus.status,
        bpjsClass: currentVclaimStatus.hakKelas,
        bpjsNotes: currentVclaimStatus.statusDesc
      });
    }

    // 2. Resolve Active Unit / Poli & Room
    let activePoli = poliklinikTujuan;
    let activeRoom: string | undefined = undefined;

    if (serviceType === 'IGD') {
      activePoli = 'Instalasi Gawat Darurat (IGD)';
    } else if (serviceType === 'Rawat Inap') {
      activePoli = poliklinikTujuan || 'Rawat Inap Bangsal';
      activeRoom = `${ruangRawatBangsal} (${kelasRawatInap}) - ${noKamarBed}`;
    } else if (serviceType === 'Bayi Baru Lahir') {
      activePoli = 'Perinatologi & Rawat Gabung Neonatus';
      activeRoom = `${bblRuangPerawatan} - Boks Bayi 01`;
    }

    const activeSep = caraPembayaran.includes('BPJS')
      ? (generatedSepDummy || `0012R0010826V${Math.floor(100000 + Math.random() * 900000)}`)
      : undefined;

    const newReg = addRegistration({
      patientId: targetPatientId,
      type: serviceType,
      poli: activePoli,
      dpjp: effectiveDoctor,
      sepNo: activeSep,
      room: activeRoom,
      bedId: serviceType === 'Rawat Inap' ? selectedBedId : undefined,
      naikKelas: (serviceType === 'Rawat Inap' && isNaikKelas) ? { isNaik: true, dari: naikKelasDari, ke: naikKelasKe } : undefined
    });

    const docObj = getUser(effectiveDoctor);

    // 3. SweetAlert Confirmation
    Swal.fire({
      icon: 'success',
      title: `Pendaftaran ${serviceType} Berhasil!`,
      html: `
        <div class="text-left text-xs space-y-2 mt-2 bg-blue-50 p-3.5 rounded-xl border border-blue-200 text-slate-800">
          <div><strong>No. Rekam Medis (RM):</strong> <span class="font-mono text-blue-700 font-bold">${noRM}</span></div>
          <div><strong>No. Registrasi:</strong> <span class="font-mono font-bold">${newReg.id}</span></div>
          <div><strong>Nama Pasien:</strong> <strong>${finalPatientName}</strong></div>
          <div><strong>Unit Pelayanan:</strong> ${serviceType} (${activePoli})</div>
          ${serviceType === 'Rawat Inap' ? `<div><strong>Ruang & Tempat Tidur:</strong> ${activeRoom}</div>` : ''}
          ${serviceType === 'Rawat Inap' && isNaikKelas ? `<div class="text-amber-800 font-medium"><strong>Status Naik Kelas:</strong> Ya (${naikKelasDari} → ${naikKelasKe})</div>` : ''}
          <div><strong>DPJP Dokter:</strong> ${docObj?.name || 'dr. Sari Dewi, Sp.PD'}</div>
          <div><strong>Penanggung Jawab:</strong> ${namaPenanggungJawab || '-'} (${hubunganPenanggungJawab})</div>
          <div class="text-emerald-700 font-bold pt-1 border-t border-blue-200 flex items-center gap-1">
            <span>✓ Rekam Medis Elektronik (RME) KMK 1423 & General Consent Diterbitkan</span>
          </div>
        </div>
      `,
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: 'Buka Rekam Medis (RME)',
      denyButtonText: '🖨️ Cetak Tracer IGD',
      cancelButtonText: 'Daftar Registrasi',
      confirmButtonColor: '#2563eb',
      denyButtonColor: '#e11d48',
      cancelButtonColor: '#64748b'
    }).then((result) => {
      if (result.isConfirmed) {
        navigate('rekammedis', { patientId: targetPatientId, regId: newReg.id, initialTab: 'identitas' });
      } else if (result.isDenied) {
        setTracerModalRegId(newReg.id);
        setViewMode('list');
      } else {
        setViewMode('list');
      }
    });
  };

  // Filtered registrations for Laporan Kunjungan
  const laporanKunjunganFiltered = useMemo(() => {
    return registrations.filter(r => {
      const p = getPatient(r.patientId);
      if (!p) return false;

      if (laporanSearchTerm.trim()) {
        const q = laporanSearchTerm.toLowerCase();
        const matchNik = p.nik ? p.nik.toLowerCase().includes(q) : false;
        const matchBpjs = p.noBPJS ? p.noBPJS.toLowerCase().includes(q) : false;
        const matchRM = p.noRM ? p.noRM.toLowerCase().includes(q) : false;
        const matchName = p.name ? p.name.toLowerCase().includes(q) : false;
        const matchRegId = r.id.toLowerCase().includes(q);
        if (!matchNik && !matchBpjs && !matchRM && !matchName && !matchRegId) {
          return false;
        }
      }

      if (laporanTahun !== 'all' && r.date && !r.date.startsWith(laporanTahun)) return false;
      if (laporanBulan !== 'all' && r.date && r.date.split('-')[1] !== laporanBulan) return false;
      if (laporanTanggal && r.date && r.date !== laporanTanggal) return false;

      if (laporanCaraBayar !== 'all') {
        const isBpjs = p.insuranceType === 'BPJS' || (r.sepNo && r.sepNo !== '-');
        const isAsuransi = p.insuranceType === 'Asuransi';
        if (laporanCaraBayar === 'BPJS' && !isBpjs) return false;
        if (laporanCaraBayar === 'Umum' && (isBpjs || isAsuransi)) return false;
        if (laporanCaraBayar === 'Asuransi' && !isAsuransi) return false;
      }

      if (laporanTipeLayanan !== 'all' && r.type !== laporanTipeLayanan) return false;
      if (laporanStatus !== 'all' && r.status !== laporanStatus) return false;

      return true;
    }).sort((a, b) => {
      const patA = getPatient(a.patientId);
      const patB = getPatient(b.patientId);
      const numA = parseInt((patA?.noRM || '').replace(/\D/g, '') || '0', 10);
      const numB = parseInt((patB?.noRM || '').replace(/\D/g, '') || '0', 10);
      return numA - numB;
    });
  }, [registrations, patients, laporanSearchTerm, laporanTahun, laporanBulan, laporanTanggal, laporanCaraBayar, laporanTipeLayanan, laporanStatus]);

  // Statistics KPI
  const statsKunjungan = useMemo(() => {
    const total = laporanKunjunganFiltered.length;
    const rawatJalan = laporanKunjunganFiltered.filter(r => r.type === 'Rawat Jalan').length;
    const rawatInap = laporanKunjunganFiltered.filter(r => r.type === 'Rawat Inap').length;
    const igd = laporanKunjunganFiltered.filter(r => r.type === 'IGD').length;
    const bbl = laporanKunjunganFiltered.filter(r => r.type === 'Bayi Baru Lahir').length;
    const bpjs = laporanKunjunganFiltered.filter(r => {
      const p = getPatient(r.patientId);
      return p?.insuranceType === 'BPJS' || (r.sepNo && r.sepNo !== '-');
    }).length;
    const umum = total - bpjs;
    const batal = laporanKunjunganFiltered.filter(r => r.status === 'Batal').length;
    return { total, rawatJalan, rawatInap, igd, bbl, bpjs, umum, batal };
  }, [laporanKunjunganFiltered, patients]);

  const handleCancelRegistration = (regId: string) => {
    if (!isEditable) {
      Swal.fire({
        icon: 'warning',
        title: 'Akses Terbatas',
        text: 'Anda tidak memiliki hak akses untuk membatalkan pendaftaran.',
        confirmButtonColor: '#d97706'
      });
      return;
    }

    Swal.fire({
      title: 'Batalkan Registrasi?',
      text: `Apakah Anda yakin ingin membatalkan status registrasi ${regId}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Batalkan Registrasi',
      cancelButtonText: 'Tutup',
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b'
    }).then((result) => {
      if (result.isConfirmed) {
        cancelRegistration(regId);
        Swal.fire({
          icon: 'success',
          title: 'Registrasi Dibatalkan',
          text: `Status kunjungan ${regId} berhasil diubah menjadi Batal.`,
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
  };

  const handleOpenEditModal = (r: Registration) => {
    setEditRegId(r.id);
    setEditPoli(r.poli);
    setEditDpjp(r.dpjp);
    setEditStatus(r.status || 'Selesai');
    setEditRoom(r.room || '');
  };

  const handleSaveEdit = () => {
    if (!editRegId) return;
    updateRegistration(editRegId, {
      poli: editPoli,
      dpjp: editDpjp,
      status: editStatus,
      room: editRoom || null
    });
    setEditRegId(null);
    Swal.fire({
      icon: 'success',
      title: 'Perubahan Disimpan',
      text: 'Data kunjungan pasien berhasil diperbarui.',
      timer: 1500,
      showConfirmButton: false
    });
  };

  const handleExportCsv = () => {
    const headers = ['No. Reg', 'Tanggal', 'No. RM', 'NIK', 'Nama Pasien', 'Layanan', 'Poli / Ruang', 'DPJP', 'Penjamin', 'No. BPJS/SEP', 'Status'];
    const rows = laporanKunjunganFiltered.map(r => {
      const p = getPatient(r.patientId);
      const doc = getUser(r.dpjp);
      return [
        `"${r.id}"`,
        `"${r.date}"`,
        `"${p?.noRM || '-'}"`,
        `"${p?.nik || '-'}"`,
        `"${p?.name || '-'}"`,
        `"${r.type}"`,
        `"${r.poli} ${r.room ? `(${r.room})` : ''}"`,
        `"${doc?.name || '-'}"`,
        `"${p?.insuranceType || 'Umum'}"`,
        `"${r.sepNo || '-'}"`,
        `"${r.status || 'Selesai'}"`
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Kunjungan_Pasien_SIMRS_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredRegs = typeFilter
    ? registrations.filter(r => r.type === typeFilter)
    : registrations;

  const detailReg = detailRegId ? registrations.find(r => r.id === detailRegId) : null;
  const detailPatient = detailReg ? getPatient(detailReg.patientId) : null;
  const detailDoctor = detailReg ? getUser(detailReg.dpjp) : null;

  return (
    <div className="space-y-6">
      {/* Read-Only Mode Banner */}
      {!isEditable && <ReadOnlyBanner moduleName="Pendaftaran Pasien & Admisi" />}

      {/* Top Header with Module Title & Mode Switcher */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
              Pendaftaran & Admisi Pasien
            </h1>
            <p className="text-xs text-slate-500">
              Registrasi Pasien Baru, Kunjungan Poliklinik & Rawat Inap
            </p>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl shrink-0 flex-wrap">
          <button
            onClick={() => setViewMode('form')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'form'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ClipboardList className="w-4 h-4" /> Form Registrasi
          </button>
          <button
            onClick={() => setViewMode('laporan')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'laporan'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4 text-emerald-300" /> Kunjungan Pasien
          </button>
          <button
            onClick={() => setViewMode('bedmanagement')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'bedmanagement'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bed className="w-4 h-4 text-amber-300" /> Bed Management (Ranap)
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'list'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" /> Riwayat & Monitoring
          </button>
        </div>
      </div>

      {/* VIEW MODE 1: FORMULIR REGISTRASI LANGSUNG */}
      {viewMode === 'form' && (
        <div className="space-y-6">
          <form onSubmit={handleSubmitRegistration} className="space-y-6">
          
          {/* SERVICE TYPE SELECTION BAR: 4 DISTINCT UNIT FORMS */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <span>Pilih Unit Pelayanan Pendaftaran Pasien Sesuai Metadata KMK 1423:</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Formulir akan menyesuaikan variabel isian klinis dan admisi berdasarkan unit yang dipilih.
                </p>
              </div>

              {/* Status Pasien (Baru / Lama) */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-slate-500 font-bold">Status:</span>
                <div className="inline-flex rounded-xl p-0.5 bg-slate-100 border border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      setJenisPasien('baru');
                      setNoRM(generateNoRM());
                      setSelectedPasienLamaId('');
                    }}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      jenisPasien === 'baru' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Pasien Baru
                  </button>
                  <button
                    type="button"
                    onClick={() => setJenisPasien('lama')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      jenisPasien === 'lama' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Pasien Lama / Cari RM
                  </button>
                </div>
              </div>
            </div>

            {/* 4 Large Unit Form Switcher Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* Form 1: IGD */}
              <button
                type="button"
                onClick={() => handleServiceTypeChange('IGD')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                  serviceType === 'IGD'
                    ? 'bg-rose-50 border-rose-500 ring-2 ring-rose-500/20 text-rose-950 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-rose-300 text-slate-700'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  serviceType === 'IGD' ? 'bg-rose-600 text-white' : 'bg-rose-100 text-rose-600'
                }`}>
                  <HeartPulse className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-black text-xs">1. IGD</div>
                  <div className="text-[10px] text-slate-500 font-medium leading-none">Gawat Darurat & Triase</div>
                </div>
              </button>

              {/* Form 2: Rawat Jalan */}
              <button
                type="button"
                onClick={() => handleServiceTypeChange('Rawat Jalan')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                  serviceType === 'Rawat Jalan'
                    ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20 text-blue-950 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-blue-300 text-slate-700'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  serviceType === 'Rawat Jalan' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600'
                }`}>
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-black text-xs">2. Rawat Jalan</div>
                  <div className="text-[10px] text-slate-500 font-medium leading-none">Poliklinik Spesialis</div>
                </div>
              </button>

              {/* Form 3: Rawat Inap */}
              <button
                type="button"
                onClick={() => handleServiceTypeChange('Rawat Inap')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                  serviceType === 'Rawat Inap'
                    ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-500/20 text-amber-950 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-amber-300 text-slate-700'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  serviceType === 'Rawat Inap' ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-700'
                }`}>
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-black text-xs">3. Rawat Inap</div>
                  <div className="text-[10px] text-slate-500 font-medium leading-none">Admisi Bangsal & Kamar</div>
                </div>
              </button>

              {/* Form 4: Bayi Baru Lahir */}
              <button
                type="button"
                onClick={() => handleServiceTypeChange('Bayi Baru Lahir')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                  serviceType === 'Bayi Baru Lahir'
                    ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-950 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-emerald-300 text-slate-700'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  serviceType === 'Bayi Baru Lahir' ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  <Baby className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-black text-xs">4. Bayi Baru Lahir</div>
                  <div className="text-[10px] text-slate-500 font-medium leading-none">Neonatus & Perinatologi</div>
                </div>
              </button>
            </div>
          </div>

          {/* AUTO-FILL LOOKUP PANEL (Pencarian Cepat Pasien Lama Berdasarkan Nama & Tanggal Lahir) */}
          {(jenisPasien === 'lama' || serviceType === 'Rawat Inap') && (
            <div className="bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 border-2 border-sky-300 p-4 rounded-2xl shadow-xs space-y-3">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sky-200/70 pb-2.5">
                <div className="flex items-center gap-2.5 text-sky-950 font-bold text-xs">
                  <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-xs">
                    <Search className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-black text-slate-900 block text-xs">Pencarian Pasien Terdaftar (Nama & Tgl Lahir)</span>
                    <span className="text-[10px] text-sky-700 font-normal">Ketik nama dan tanggal lahir untuk menampilkan pilihan pasien yang sesuai (tanpa perlu scroll ke bawah)</span>
                  </div>
                </div>

                {selectedPasienLamaId && (
                  <div className="flex items-center gap-1.5 self-start sm:self-auto">
                    <span className="text-[11px] text-emerald-800 font-bold px-2.5 py-1 bg-emerald-100 border border-emerald-300 rounded-lg flex items-center gap-1 shadow-2xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Data Pasien Terpilih & Terisi</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPasienLamaId('');
                        setSearchName('');
                        setSearchDob('');
                      }}
                      className="text-[11px] text-slate-600 hover:text-rose-600 underline font-semibold px-1.5 py-1 cursor-pointer transition-colors"
                    >
                      Reset / Ganti
                    </button>
                  </div>
                )}
              </div>

              {/* Dual Search Input: Nama Pasien & Tanggal Lahir */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                {/* Search by Name / RM / NIK */}
                <div className="sm:col-span-7 space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-sky-600" />
                    <span>Cari Nama Pasien / No. RM / NIK:</span>
                  </label>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={searchName}
                      onChange={e => setSearchName(e.target.value)}
                      placeholder="Ketik nama pasien (contoh: Siti / Ahmad) atau No. RM..."
                      className="w-full pl-9 pr-8 py-2 bg-white border border-sky-300 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 shadow-2xs"
                    />
                    {searchName && (
                      <button
                        type="button"
                        onClick={() => setSearchName('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        title="Hapus pencarian nama"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Search by Tanggal Lahir */}
                <div className="sm:col-span-5 space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-sky-600" />
                    <span>Filter Tanggal Lahir Pasien:</span>
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="date"
                      value={searchDob}
                      onChange={e => setSearchDob(e.target.value)}
                      className="flex-1 px-3 py-2 bg-white border border-sky-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-400 shadow-2xs cursor-pointer"
                    />
                    {searchDob && (
                      <button
                        type="button"
                        onClick={() => setSearchDob('')}
                        className="px-2.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                        title="Hapus filter tanggal lahir"
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Suggestions / Matching Patients Section ("Awalnya pilihan dulu kalau sesuai baru klik") */}
              {(searchName.trim() || searchDob.trim()) ? (
                <div className="space-y-2 pt-1 animate-fade-in">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-slate-700 flex items-center gap-1.5">
                      <span>Daftar Pilihan Pasien yang Sesuai:</span>
                      <span className="px-2 py-0.5 rounded-full bg-sky-200 text-sky-900 font-bold">
                        {matchingPasienLama.length} Pasien
                      </span>
                    </span>
                    <span className="text-slate-500 font-normal italic">
                      *Silakan periksa data, klik pasien yang sesuai untuk memilih
                    </span>
                  </div>

                  {matchingPasienLama.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                      {matchingPasienLama.map(p => {
                        const isSelected = selectedPasienLamaId === p.id;
                        return (
                          <div
                            key={p.id}
                            onClick={() => autoFillPatient(p)}
                            className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between gap-3 shadow-2xs hover:shadow-xs ${
                              isSelected
                                ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-300/50'
                                : 'bg-white border-slate-200 hover:border-sky-400 hover:bg-sky-50/50'
                            }`}
                          >
                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-black text-xs text-slate-900 truncate">
                                  {p.name}
                                </span>
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-100 text-blue-800">
                                  RM: {p.noRM}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-600 flex flex-wrap items-center gap-x-2.5 gap-y-0.5">
                                <span className="flex items-center gap-1 font-semibold text-slate-800">
                                  <Calendar className="w-3 h-3 text-sky-600" />
                                  <span>Lahir: {p.dob}</span>
                                </span>
                                <span className="text-slate-300">•</span>
                                <span>{p.gender === 'M' || p.gender === 'L' || p.gender === '1' ? 'Laki-laki' : 'Perempuan'}</span>
                                <span className="text-slate-300">•</span>
                                <span className="font-semibold text-sky-700">{p.insuranceType || 'Umum'}</span>
                              </div>
                              {p.address && (
                                <p className="text-[10px] text-slate-500 truncate">
                                  {p.address}
                                </p>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                autoFillPatient(p);
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 flex items-center gap-1 transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'bg-sky-600 hover:bg-sky-700 text-white shadow-xs'
                              }`}
                            >
                              {isSelected ? (
                                <>
                                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                  <span>Terpilih</span>
                                </>
                              ) : (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Pilih Pasien</span>
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl text-center space-y-2">
                      <p className="text-xs text-amber-900 font-medium">
                        Tidak ditemukan pasien terdaftar dengan nama <strong>"{searchName}"</strong> {searchDob ? <>dan tanggal lahir <strong>"{searchDob}"</strong></> : null}.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setJenisPasien('baru');
                          if (searchName) setNamaLengkap(searchName);
                          if (searchDob) setTanggalLahir(searchDob);
                          setNoRM(generateNoRM());
                          setSelectedPasienLamaId('');
                        }}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Daftarkan Sebagai Pasien Baru</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : !selectedPasienLamaId ? (
                /* Hint & Quick Sample Patients when no search query yet */
                <div className="pt-1 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                  <span className="italic flex items-center gap-1">
                    <span>💡 Masukkan nama atau pilih tanggal lahir di atas untuk melihat pilihan data pasien.</span>
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-semibold text-slate-600">Pilihan Cepat:</span>
                    {patients.slice(0, 3).map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => autoFillPatient(p)}
                        className="px-2 py-0.5 bg-white border border-sky-200 hover:border-sky-400 hover:bg-sky-50 rounded-md text-[10px] font-medium text-slate-700 transition-all cursor-pointer"
                      >
                        {p.name} ({p.dob})
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* MAIN 2-COLUMN ORDERED METADATA GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT COLUMN: SECTION I (IDENTITAS PASIEN) & SECTION II (PENANGGUNG JAWAB) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* SECTION I: IDENTITAS PASIEN (KMK 1423) */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    <h2 className="font-bold text-sm text-blue-900 tracking-wide">
                      I. LEMBAR IDENTITAS PASIEN
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-2xs">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      No. RM: <strong className="text-emerald-700 text-xs tracking-wider">{noRM}</strong>
                      <span className="text-[10px] bg-emerald-200/70 text-emerald-900 px-1.5 py-0.5 rounded font-sans font-bold">6 Digit</span>
                    </span>
                  </div>
                </div>

                {/* Kewarganegaraan & NIK */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Kewarganegaraan</label>
                    <select
                      value={kewarganegaraan}
                      onChange={e => setKewarganegaraan(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                    >
                      <option value="INDONESIA">INDONESIA</option>
                      <option value="MALAYSIA">MALAYSIA</option>
                      <option value="SINGAPURA">SINGAPURA</option>
                      <option value="WNA LAINNYA">WNA LAINNYA</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Status WNI / WNA</label>
                    <select
                      value={wniWna}
                      onChange={e => setWniWna(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                    >
                      <option value="WNI">WNI (Warga Negara Indonesia)</option>
                      <option value="WNA">WNA (Warga Negara Asing)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">NIK KTP (16 Digit) *</label>
                    <input
                      type="text"
                      value={nik}
                      onChange={e => setNik(e.target.value)}
                      placeholder="16 Digit NIK Pasien"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium focus:bg-white focus:outline-none focus:border-blue-500"
                      maxLength={16}
                    />
                  </div>
                </div>

                {/* Nama Ibu Kandung */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Ibu Kandung *</label>
                  <input
                    type="text"
                    value={namaIbuKandung}
                    onChange={e => setNamaIbuKandung(e.target.value)}
                    placeholder="Nama lengkap ibu kandung"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                    required
                  />
                </div>

                {/* SatuSehat Sync Bar */}
                <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-blue-950 font-medium">
                    <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>SatuSehat Kemenkes ID: </span>
                    <strong className="font-mono text-blue-700">{satuSehatId || 'Belum Terhubung'}</strong>
                  </div>
                  <button
                    type="button"
                    onClick={handleSyncSatuSehat}
                    disabled={satuSehatSyncing}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-[11px] shadow-2xs transition-all flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <RefreshCw className={`w-3 h-3 ${satuSehatSyncing ? 'animate-spin' : ''}`} />
                    {satuSehatSyncing ? 'SatuSehat...' : 'Cek SatuSehat'}
                  </button>
                </div>

                {/* Nama Lengkap Pasien */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap Pasien *</label>
                  <input
                    type="text"
                    value={namaLengkap}
                    onChange={e => setNamaLengkap(e.target.value)}
                    placeholder="Masukkan nama lengkap sesuai identitas"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                {/* 5 GENDER OPTIONS (KMK 1423 METADATA COMPLIANT) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Jenis Kelamin (5 Kategori KMK 1423) *
                    </label>
                    <select
                      value={jenisKelamin}
                      onChange={e => setJenisKelamin(e.target.value)}
                      className="w-full px-3 py-2 bg-blue-50/60 border border-blue-300 rounded-xl text-xs font-bold text-blue-950 focus:bg-white focus:outline-none focus:border-blue-600"
                      required
                    >
                      <option value="1">1: Laki-laki (L / Male)</option>
                      <option value="2">2: Perempuan (P / Female)</option>
                      <option value="0">0: Tidak diketahui (Unknown)</option>
                      <option value="3">3: Tidak dapat ditentukan (Indeterminate / Ambigu)</option>
                      <option value="4">4: Tidak mengisi (Not Stated)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tempat Lahir</label>
                    <input
                      type="text"
                      value={tempatLahir}
                      onChange={e => setTempatLahir(e.target.value)}
                      placeholder="Cth: Jakarta"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                    />
                  </div>
                </div>

                {/* Tanggal Lahir & Usia */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Lahir *</label>
                    <input
                      type="date"
                      value={tanggalLahir}
                      onChange={e => setTanggalLahir(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Usia Pasien (Hitung Otomatis)</label>
                    <input
                      type="text"
                      value={calculateAgeStr(tanggalLahir)}
                      disabled
                      className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Status Pernikahan & Agama & Golongan Darah */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Status Pernikahan</label>
                    <select
                      value={statusPernikahan}
                      onChange={e => setStatusPernikahan(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                    >
                      <option value="Belum Menikah">1: Belum Menikah</option>
                      <option value="Menikah">2: Menikah</option>
                      <option value="Cerai Hidup">3: Cerai Hidup</option>
                      <option value="Cerai Mati">4: Cerai Mati</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Agama</label>
                    <select
                      value={agama}
                      onChange={e => setAgama(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                    >
                      <option value="Islam">1: Islam</option>
                      <option value="Protestan">2: Kristen Protestan</option>
                      <option value="Katolik">3: Katolik</option>
                      <option value="Hindu">4: Hindu</option>
                      <option value="Buddha">5: Buddha</option>
                      <option value="Khonghucu">6: Khonghucu</option>
                      <option value="Penghayat">7: Penghayat Kepercayaan</option>
                      <option value="Lain-lain">8: Lain-lain</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Golongan Darah</label>
                    <select
                      value={golonganDarah}
                      onChange={e => setGolonganDarah(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-rose-700"
                    >
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="AB">AB</option>
                      <option value="O">O</option>
                      <option value="Tidak Tahu">Tidak Tahu</option>
                    </select>
                  </div>
                </div>

                {/* Structured Address (KMK 1423) */}
                <div className="space-y-2.5 pt-2 border-t border-slate-100">
                  <IndonesianAddressSelector
                    provinsi={provinsi}
                    kabupaten={kabupaten}
                    kecamatan={kecamatan}
                    kelurahan={kelurahan}
                    onChangeProvinsi={setProvinsi}
                    onChangeKabupaten={setKabupaten}
                    onChangeKecamatan={setKecamatan}
                    onChangeKelurahan={setKelurahan}
                    label="ALAMAT LENGKAP BERJENJANG (KTP & DOMISILI)"
                  />

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Nama Jalan / RT / RW / No Rumah</label>
                    <input
                      type="text"
                      value={alamatJalanKtp}
                      onChange={e => setAlamatJalanKtp(e.target.value)}
                      placeholder="Contoh: Jl. Arjuna Utara No. 9, RT 03 / RW 02"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">No. HP / Telepon *</label>
                      <input
                        type="text"
                        value={noTelp}
                        onChange={e => setNoTelp(e.target.value)}
                        placeholder="Contoh: 081289123456"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Email Pasien</label>
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="pasien@gmail.com"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION II: PENANGGUNG JAWAB (GUARANTOR) */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h2 className="font-bold text-sm text-blue-900 flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-blue-600" />
                    II. PENANGGUNG JAWAB PASIEN
                  </h2>
                  <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer font-medium">
                    <input
                      type="checkbox"
                      checked={pjSamaDenganPasien}
                      onChange={e => setPjSamaDenganPasien(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span>Alamat sama dengan pasien</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nama Penanggung Jawab *</label>
                    <input
                      type="text"
                      value={namaPenanggungJawab}
                      onChange={e => setNamaPenanggungJawab(e.target.value)}
                      placeholder="Nama keluarga / penjamin"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Hubungan dengan Pasien *</label>
                    <select
                      value={hubunganPenanggungJawab}
                      onChange={e => setHubunganPenanggungJawab(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                      required
                    >
                      <option value="Suami">Suami</option>
                      <option value="Istri">Istri</option>
                      <option value="Ayah Kandung">Ayah Kandung</option>
                      <option value="Ibu Kandung">Ibu Kandung</option>
                      <option value="Anak">Anak</option>
                      <option value="Kakak / Adik">Kakak / Adik</option>
                      <option value="Wali / Kerabat">Wali / Kerabat</option>
                      <option value="Diri Sendiri">Diri Sendiri</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">No. HP Penanggung Jawab *</label>
                    <input
                      type="text"
                      value={noHpPenanggungJawab}
                      onChange={e => setNoHpPenanggungJawab(e.target.value)}
                      placeholder="0813xxxxxxxx"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: SECTION III (FORMULIR SPESIFIK UNIT) & SECTION IV (CARA BAYAR & BRIDGING) */}
            <div className="lg:col-span-5 space-y-6">

              {/* ========================================================= */}
              {/* SUB-FORM 1: KHUSUS INSTALASI GAWAT DARURAT (IGD)         */}
              {/* ========================================================= */}
              {serviceType === 'IGD' && (
                <div className="bg-rose-50/60 rounded-2xl border-2 border-rose-300 p-5 space-y-4 shadow-xs">
                  <div className="border-b border-rose-200 pb-2.5 flex items-center justify-between">
                    <h2 className="font-bold text-sm text-rose-950 flex items-center gap-2">
                      <HeartPulse className="w-5 h-5 text-rose-600" />
                      III. FORMULIR MASUK IGD & TRIASE
                    </h2>
                    <span className="text-[10px] font-black bg-rose-200 text-rose-900 px-2 py-0.5 rounded-full uppercase">
                      Emergency Room
                    </span>
                  </div>

                  {/* Kategori Triase */}
                  <div>
                    <label className="block text-xs font-bold text-rose-950 mb-1">
                      Kategori Triase IGD (KMK 1423) *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setIgdTriage('Merah (Resusitasi)')}
                        className={`p-2 rounded-xl text-xs font-black border transition-all ${
                          igdTriage === 'Merah (Resusitasi)'
                            ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
                            : 'bg-white text-rose-700 border-rose-300 hover:bg-rose-100'
                        }`}
                      >
                        🔴 Merah (Resusitasi)
                      </button>
                      <button
                        type="button"
                        onClick={() => setIgdTriage('Kuning (Emergensi)')}
                        className={`p-2 rounded-xl text-xs font-black border transition-all ${
                          igdTriage === 'Kuning (Emergensi)'
                            ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                            : 'bg-white text-amber-700 border-amber-300 hover:bg-amber-100'
                        }`}
                      >
                        🟡 Kuning (Emergensi)
                      </button>
                      <button
                        type="button"
                        onClick={() => setIgdTriage('Hijau (Non-Emergensi)')}
                        className={`p-2 rounded-xl text-xs font-black border transition-all ${
                          igdTriage === 'Hijau (Non-Emergensi)'
                            ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                            : 'bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                        }`}
                      >
                        🟢 Hijau (Non-Emergensi)
                      </button>
                      <button
                        type="button"
                        onClick={() => setIgdTriage('Hitam (Meninggal)')}
                        className={`p-2 rounded-xl text-xs font-black border transition-all ${
                          igdTriage === 'Hitam (Meninggal)'
                            ? 'bg-slate-900 text-white border-slate-950 shadow-xs'
                            : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        ⚫ Hitam (DOA)
                      </button>
                    </div>
                  </div>

                  {/* Cara Datang & Sebab Masuk */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Cara Datang ke IGD</label>
                      <select
                        value={igdCaraDatang}
                        onChange={e => setIgdCaraDatang(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-rose-300 rounded-xl text-xs font-medium"
                      >
                        <option value="Datang Sendiri (Mandiri)">1: Datang Sendiri (Mandiri)</option>
                        <option value="Rujukan FKTP (Puskesmas/Klinik)">2: Rujukan FKTP</option>
                        <option value="Rujukan RS Lain">3: Rujukan RS Lain</option>
                        <option value="Polisi / Kecelakaan">4: Diantar Polisi / KLL</option>
                        <option value="Ambulans 119">5: Ambulans 119 / AGD</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Sebab Masuk IGD</label>
                      <select
                        value={igdSebabMasuk}
                        onChange={e => setIgdSebabMasuk(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-rose-300 rounded-xl text-xs font-medium"
                      >
                        <option value="Non Trauma (Penyakit Akut)">1: Non-Trauma (Penyakit)</option>
                        <option value="Trauma / Cedera Fisik">2: Trauma / Cedera</option>
                        <option value="Kecelakaan Lalu Lintas (KLL)">3: Kecelakaan Lalu Lintas</option>
                        <option value="Keracunan / Intoksikasi">4: Keracunan / Intoksikasi</option>
                        <option value="Gigitan Hewan / Bencana">5: Gigitan Hewan / Bencana</option>
                      </select>
                    </div>
                  </div>

                  {/* Kesadaran / GCS */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tingkat Kesadaran (GCS)</label>
                    <input
                      type="text"
                      value={igdGcs}
                      onChange={e => setIgdGcs(e.target.value)}
                      placeholder="E4M6V5 (Compos Mentis)"
                      className="w-full px-3 py-2 bg-white border border-rose-300 rounded-xl text-xs font-medium"
                    />
                  </div>

                  {/* Keluhan Utama Masuk */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Keluhan Utama Masuk IGD *</label>
                    <textarea
                      value={igdKeluhanUtama}
                      onChange={e => setIgdKeluhanUtama(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 bg-white border border-rose-300 rounded-xl text-xs font-medium"
                      required
                    />
                  </div>

                  {/* Dokter Jaga IGD */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Dokter Jaga IGD *</label>
                    <select
                      value={igdDokterJaga}
                      onChange={e => setIgdDokterJaga(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-rose-300 rounded-xl text-xs font-bold text-slate-800"
                    >
                      {doctors.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* SUB-FORM 2: KHUSUS RAWAT JALAN (POLIKLINIK)              */}
              {/* ========================================================= */}
              {serviceType === 'Rawat Jalan' && (
                <div className="bg-blue-50/60 rounded-2xl border-2 border-blue-300 p-5 space-y-4 shadow-xs">
                  <div className="border-b border-blue-200 pb-2.5 flex items-center justify-between">
                    <h2 className="font-bold text-sm text-blue-950 flex items-center gap-2">
                      <Stethoscope className="w-5 h-5 text-blue-600" />
                      III. FORMULIR RAWAT JALAN (POLIKLINIK)
                    </h2>
                    <span className="text-[10px] font-black bg-blue-200 text-blue-900 px-2 py-0.5 rounded-full uppercase">
                      Polyclinic
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Poliklinik Tujuan *</label>
                    <select
                      value={poliklinikTujuan}
                      onChange={e => setPoliklinikTujuan(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-blue-300 rounded-xl text-xs font-bold text-blue-900"
                      required
                    >
                      <option value="Poliklinik Penyakit Dalam">Poliklinik Penyakit Dalam</option>
                      <option value="Poliklinik Anak">Poliklinik Anak</option>
                      <option value="Poliklinik Kebidanan & Kandungan (Obgyn)">Poliklinik Kebidanan & Kandungan</option>
                      <option value="Poliklinik Bedah Umum">Poliklinik Bedah Umum</option>
                      <option value="Poliklinik Jantung & Pembuluh Darah">Poliklinik Jantung</option>
                      <option value="Poliklinik Paru">Poliklinik Paru</option>
                      <option value="Poliklinik Saraf">Poliklinik Saraf</option>
                      <option value="Poliklinik Mata">Poliklinik Mata</option>
                      <option value="Poliklinik THT-KL">Poliklinik THT-KL</option>
                      <option value="Poliklinik Kulit & Kelamin">Poliklinik Kulit & Kelamin</option>
                      <option value="Poliklinik Gigi & Mulut">Poliklinik Gigi & Mulut</option>
                      <option value="Poliklinik Jiwa / Psikiatri">Poliklinik Jiwa</option>
                      <option value="Poliklinik Rehabilitasi Medis">Poliklinik Rehabilitasi Medis</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Dokter Spesialis DPJP *</label>
                      <select
                        value={dokterSpesialis}
                        onChange={e => setDokterSpesialis(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-blue-300 rounded-xl text-xs font-bold text-slate-800"
                        required
                      >
                        {doctors.map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Jadwal Sesi Dokter</label>
                      <select
                        value={jadwalDokter}
                        onChange={e => setJadwalDokter(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-blue-300 rounded-xl text-xs font-medium"
                      >
                        <option value="Pagi (08:00 - 12:00 WIB)">Pagi (08:00 - 12:00 WIB)</option>
                        <option value="Siang (13:00 - 16:00 WIB)">Siang (13:00 - 16:00 WIB)</option>
                        <option value="Sore/Malam (17:00 - 20:00 WIB)">Sore/Malam (17:00 - 20:00 WIB)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Cara Masuk Rawat Jalan</label>
                    <select
                      value={ralanCaraMasuk}
                      onChange={e => setRalanCaraMasuk(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-blue-300 rounded-xl text-xs font-medium"
                    >
                      <option value="Rujukan FKTP (Puskesmas / Klinik)">1: Rujukan FKTP (Puskesmas/Klinik)</option>
                      <option value="Datang Sendiri (Mandiri)">2: Datang Sendiri (Mandiri)</option>
                      <option value="Kontrol Post Rawat Inap">3: Kontrol Pasca Rawat Inap</option>
                      <option value="Rujukan Dokter Spesialis Internal">4: Rujukan Spesialis Internal</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">No. Rujukan FKTP / Surat Kontrol</label>
                    <input
                      type="text"
                      value={noRujukanFktp}
                      onChange={e => setNoRujukanFktp(e.target.value)}
                      placeholder="Nomor rujukan BPJS / FKTP"
                      className="w-full px-3 py-2 bg-white border border-blue-300 rounded-xl text-xs font-mono font-bold"
                    />
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* SUB-FORM 3: KHUSUS RAWAT INAP (ADMISI BANGSAL)           */}
              {/* ========================================================= */}
              {serviceType === 'Rawat Inap' && (
                <div className="bg-amber-50/60 rounded-2xl border-2 border-amber-300 p-5 space-y-4 shadow-xs">
                  <div className="border-b border-amber-200 pb-2.5 flex items-center justify-between">
                    <h2 className="font-bold text-sm text-amber-950 flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-amber-600" />
                      III. FORMULIR ADMISI RAWAT INAP
                    </h2>
                    <span className="text-[10px] font-black bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full uppercase">
                      Inpatient Ward
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Ruang / Bangsal Rawat Inap *</label>
                    <select
                      value={ruangRawatBangsal}
                      onChange={e => setRuangRawatBangsal(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-bold text-amber-900"
                      required
                    >
                      <option value="Bangsal Mawar - Penyakit Dalam">Bangsal Mawar - Spesialis Penyakit Dalam</option>
                      <option value="Bangsal Melati - Bedah Umum">Bangsal Melati - Bedah Umum</option>
                      <option value="Bangsal Anggrek - Kebidanan & Kandungan">Bangsal Anggrek - Kebidanan & Obgyn</option>
                      <option value="Bangsal Dahlia - Anak (Pediatrik)">Bangsal Dahlia - Spesialis Anak</option>
                      <option value="Bangsal Cempaka - Saraf & Jantung">Bangsal Cempaka - Saraf & Kardiovaskular</option>
                      <option value="Ruang VIP Edelweiss">Ruang VIP Edelweiss</option>
                      <option value="Ruang VVIP Wijayakusuma">Ruang VVIP Wijayakusuma</option>
                      <option value="Ruang Perawatan Intensif (ICU)">Ruang Perawatan Intensif (ICU)</option>
                      <option value="Ruang Isolasi Tekanan Negatif">Ruang Isolasi Tekanan Negatif</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Kelas Perawatan *</label>
                      <select
                        value={kelasRawatInap}
                        onChange={e => setKelasRawatInap(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-medium text-slate-800"
                      >
                        <option value="Kelas 1">Kelas 1</option>
                        <option value="Kelas 2">Kelas 2</option>
                        <option value="Kelas 3">Kelas 3</option>
                        <option value="VIP">VIP</option>
                        <option value="VVIP">VVIP</option>
                      </select>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-700">Kamar & No. Bed Terpilih *</label>
                        <button
                          type="button"
                          onClick={() => setIsBedPickerModalOpen(true)}
                          className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Bed className="w-3.5 h-3.5" />
                          <span>Buka Denah Bed</span>
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={noKamarBed}
                          onChange={e => setNoKamarBed(e.target.value)}
                          placeholder="Cth: Kamar 102 - Bed A"
                          className="flex-1 px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-medium"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setIsBedPickerModalOpen(true)}
                          className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer shrink-0"
                          title="Buka Denah Bed untuk memilih kamar & tempat tidur"
                        >
                          <Bed className="w-4 h-4" />
                          <span>Pilih Bed</span>
                        </button>
                      </div>
                      {selectedBedId && (
                        <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-emerald-800 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Bed Terpilih: <strong>{noKamarBed}</strong> ({kelasRawatInap})</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* CHECKLIST PASIEN NAIK KELAS */}
                  <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <label className="text-xs font-medium text-amber-950 flex items-center gap-1.5">
                        <Tag className="w-4 h-4 text-amber-600" />
                        <span>Apakah Pasien Menghendaki Naik Kelas Perawatan?</span>
                      </label>
                      <div className="flex items-center gap-3">
                        <label className="inline-flex items-center gap-1 text-xs cursor-pointer">
                          <input
                            type="radio"
                            name="naikKelasOption"
                            checked={!isNaikKelas}
                            onChange={() => setIsNaikKelas(false)}
                            className="text-amber-600 focus:ring-amber-500"
                          />
                          <span>Tidak (Sesuai Hak Kelas)</span>
                        </label>
                        <label className="inline-flex items-center gap-1 text-xs cursor-pointer">
                          <input
                            type="radio"
                            name="naikKelasOption"
                            checked={isNaikKelas}
                            onChange={() => setIsNaikKelas(true)}
                            className="text-amber-600 focus:ring-amber-500"
                          />
                          <span className="font-medium text-amber-900">Ya (Naik Kelas)</span>
                        </label>
                      </div>
                    </div>

                    {isNaikKelas && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-amber-200/80">
                        <div>
                          <label className="block text-[11px] font-medium text-amber-900 mb-1">Dari Hak Kelas Kepesertaan BPJS</label>
                          <select
                            value={naikKelasDari}
                            onChange={e => setNaikKelasDari(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-medium"
                          >
                            <option value="Kelas 3">Kelas 3</option>
                            <option value="Kelas 2">Kelas 2</option>
                            <option value="Kelas 1">Kelas 1</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-amber-900 mb-1">Naik ke Kelas Perawatan Diminta</label>
                          <select
                            value={naikKelasKe}
                            onChange={e => setNaikKelasKe(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-medium"
                          >
                            <option value="Kelas 2">Kelas 2</option>
                            <option value="Kelas 1">Kelas 1</option>
                            <option value="VIP">VIP</option>
                            <option value="VVIP">VVIP</option>
                          </select>
                        </div>
                        <div className="col-span-full text-[10px] text-amber-800 italic">
                          * Selisih biaya naik kelas dihitung otomatis sesuai Permenkes No. 3/2023 pada modul E-Klaim & Kasir.
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Dokter Spesialis DPJP Utama *</label>
                    <select
                      value={ranapDpjpUtama}
                      onChange={e => setRanapDpjpUtama(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-bold text-slate-800"
                      required
                    >
                      {doctors.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Asal Rujukan Pasien Masuk</label>
                    <select
                      value={ranapAsalPasien}
                      onChange={e => setRanapAsalPasien(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-medium"
                    >
                      <option value="Rujukan IGD (Emergency Admission)">1: Rujukan IGD (Emergency)</option>
                      <option value="Rujukan Poliklinik (Elective Admission)">2: Rujukan Poliklinik (Elektif)</option>
                      <option value="Rujukan Rumah Sakit Luar">3: Rujukan Rumah Sakit Luar</option>
                      <option value="Rujukan Dokter Spesialis Langsung">4: Rujukan Spesialis Langsung</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Diagnosis Awal Admisi (Indikasi Ranap)</label>
                    <textarea
                      value={ranapDiagnosisAwal}
                      onChange={e => setRanapDiagnosisAwal(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-medium"
                    />
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* SUB-FORM 4: KHUSUS BAYI BARU LAHIR (NEONATUS / BBL)      */}
              {/* ========================================================= */}
              {serviceType === 'Bayi Baru Lahir' && (
                <div className="bg-emerald-50/60 rounded-2xl border-2 border-emerald-300 p-5 space-y-4 shadow-xs">
                  <div className="border-b border-emerald-200 pb-2.5 flex items-center justify-between">
                    <h2 className="font-bold text-sm text-emerald-950 flex items-center gap-2">
                      <Baby className="w-5 h-5 text-emerald-600" />
                      III. FORMULIR REGISTRASI BAYI BARU LAHIR
                    </h2>
                    <span className="text-[10px] font-black bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full uppercase">
                      Neonatal Care
                    </span>
                  </div>

                  {/* Data Ibu Kandung */}
                  <div className="p-3 bg-white border border-emerald-200 rounded-xl space-y-2">
                    <div className="text-[11px] font-black text-emerald-900 uppercase">Data Ibu Kandung Bayi</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500">Nama Ibu Kandung *</label>
                        <input
                          type="text"
                          value={bblNamaIbu}
                          onChange={e => setBblNamaIbu(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500">No. RM Ibu Kandung *</label>
                        <input
                          type="text"
                          value={bblNoRMIbu}
                          onChange={e => setBblNoRMIbu(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Persalinan & Jam Kelahiran */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Cara Persalinan *</label>
                      <select
                        value={bblCaraPersalinan}
                        onChange={e => setBblCaraPersalinan(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl text-xs font-bold"
                      >
                        <option value="Spontan Pervaginam (Normal)">1: Spontan Pervaginam (Normal)</option>
                        <option value="Sectio Caesarea (SC)">2: Sectio Caesarea (SC)</option>
                        <option value="Vakum Ekstraksi">3: Vakum Ekstraksi</option>
                        <option value="Forceps">4: Forceps</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Jam Kelahiran *</label>
                      <input
                        type="text"
                        value={bblJamLahir}
                        onChange={e => setBblJamLahir(e.target.value)}
                        placeholder="Contoh: 06:45 WIB"
                        className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl text-xs font-bold"
                        required
                      />
                    </div>
                  </div>

                  {/* APGAR Score (1', 5', 10') */}
                  <div className="p-3 bg-white border border-emerald-200 rounded-xl space-y-2">
                    <div className="text-[11px] font-black text-emerald-900 uppercase">APGAR Score Bayi Baru Lahir</div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500">1 Menit</label>
                        <input
                          type="number"
                          value={bblApgar1}
                          onChange={e => setBblApgar1(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-center"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500">5 Menit</label>
                        <input
                          type="number"
                          value={bblApgar5}
                          onChange={e => setBblApgar5(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-center"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500">10 Menit</label>
                        <input
                          type="number"
                          value={bblApgar10}
                          onChange={e => setBblApgar10(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-center"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Parameter Antropometri Bayi */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500">Berat (gram) *</label>
                      <input
                        type="number"
                        value={bblBeratLahir}
                        onChange={e => setBblBeratLahir(e.target.value)}
                        className="w-full px-2 py-1.5 bg-white border border-emerald-300 rounded-xl text-xs font-bold"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500">Panjang (cm) *</label>
                      <input
                        type="number"
                        value={bblPanjangBadan}
                        onChange={e => setBblPanjangBadan(e.target.value)}
                        className="w-full px-2 py-1.5 bg-white border border-emerald-300 rounded-xl text-xs font-bold"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500">L. Kepala (cm)</label>
                      <input
                        type="number"
                        value={bblLingkarKepala}
                        onChange={e => setBblLingkarKepala(e.target.value)}
                        className="w-full px-2 py-1.5 bg-white border border-emerald-300 rounded-xl text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500">L. Dada (cm)</label>
                      <input
                        type="number"
                        value={bblLingkarDada}
                        onChange={e => setBblLingkarDada(e.target.value)}
                        className="w-full px-2 py-1.5 bg-white border border-emerald-300 rounded-xl text-xs font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Ruang Perawatan Neonatus</label>
                    <select
                      value={bblRuangPerawatan}
                      onChange={e => setBblRuangPerawatan(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl text-xs font-bold text-emerald-900"
                    >
                      <option value="Ruang Rawat Gabung Ibu-Anak (Rooming-In)">1: Rawat Gabung Ibu-Anak (Rooming-In)</option>
                      <option value="Ruang Perinatologi (Observasi Neonatus)">2: Ruang Perinatologi</option>
                      <option value="Ruang NICU (Perawatan Intensif Bayi)">3: Ruang NICU</option>
                    </select>
                  </div>
                </div>
              )}

              {/* SECTION IV: CARA PEMBAYARAN & JAMINAN (BPJS / UMUM / ASURANSI) */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
                <div className="border-b border-slate-100 pb-2.5 flex items-center justify-between">
                  <h2 className="font-bold text-sm text-blue-900 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-blue-600" />
                    IV. PENJAMIN & CARA PEMBAYARAN
                  </h2>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Cara Pembayaran *</label>
                  <select
                    value={caraPembayaran}
                    onChange={e => setCaraPembayaran(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                    required
                  >
                    <option value="BPJS KESEHATAN">BPJS KESEHATAN (JKN-KIS PBI / NON-PBI)</option>
                    <option value="UMUM / CASH / DEBIT">UMUM / CASH / PEMBAYARAN MANDIRI</option>
                    <option value="ASURANSI SWASTA">ASURANSI SWASTA / CORPORATE</option>
                  </select>
                </div>

                {caraPembayaran.includes('BPJS') && (
                  <div className="p-4 bg-gradient-to-br from-emerald-50/90 to-teal-50/60 border border-emerald-300 rounded-2xl space-y-3.5 shadow-2xs">
                    {/* Header VClaim Bridging */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-emerald-950 block">Bridging VClaim BPJS Health</span>
                          <span className="text-[10px] text-emerald-700">Tersinkronisasi Otomatis dengan DB Pasien Lokal</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setShowQuickCheckModal(true)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5 transition-all"
                          title="Buka form cek cepat kartu BPJS (+ Cek BPJS)"
                        >
                          <Plus className="w-4 h-4 stroke-[2.5]" />
                          <span>+ Cek BPJS</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleCheckVclaim}
                          disabled={vclaimChecking}
                          className="px-3 py-1.5 bg-white border border-emerald-300 hover:bg-emerald-50 text-emerald-800 active:scale-95 rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5 transition-all"
                          title="Klik untuk mengecek keabsahan kartu dan status keaktifan ke server VClaim BPJS"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${vclaimChecking ? 'animate-spin' : ''}`} />
                          <span>{vclaimChecking ? 'Memvalidasi...' : 'Cek VClaim & SEP'}</span>
                        </button>
                      </div>
                    </div>

                    {/* No BPJS Input with 13-digit strictly-numeric validation */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-emerald-950">
                          Nomor Kartu BPJS Kesehatan (13 Digit Angka) *
                        </label>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                          noAsuransi.length === 13
                            ? 'bg-emerald-200 text-emerald-900 border border-emerald-300'
                            : noAsuransi.length > 0
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {noAsuransi.length === 13 ? (
                            <span>✓ 13 / 13 Digit (Sesuai Standar BPJS)</span>
                          ) : noAsuransi.length > 0 ? (
                            <span>{noAsuransi.length} / 13 Digit (Kurang {13 - noAsuransi.length} Angka)</span>
                          ) : (
                            <span>Wajib 13 Digit Angka</span>
                          )}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={13}
                            value={noAsuransi}
                            onChange={e => handleNoBpjsChange(e.target.value)}
                            onKeyDown={e => {
                              // Block alphabet and special characters, allow only navigation/backspace and numbers
                              if (
                                !/[0-9]/.test(e.key) &&
                                !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'].includes(e.key) &&
                                !e.ctrlKey && !e.metaKey
                              ) {
                                e.preventDefault();
                              }
                            }}
                            placeholder="Masukkan 13 digit angka (Contoh: 0001234567891)"
                            className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-xs font-mono font-bold tracking-wider text-slate-900 transition-all ${
                              noAsuransi.length === 13
                                ? 'border-emerald-400 ring-2 ring-emerald-100 focus:border-emerald-600'
                                : 'border-slate-300 focus:border-blue-500'
                            }`}
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                            {noAsuransi.length === 13 ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <span className="text-[10px] text-slate-400 font-mono">Hanya Angka</span>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowQuickCheckModal(true)}
                          className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5 shrink-0 transition-all"
                          title="Buka form cek cepat kartu BPJS (+ Cek BPJS)"
                        >
                          <Plus className="w-4 h-4 stroke-[2.5]" />
                          <span>+ Cek BPJS</span>
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-500 italic">
                        * Format nomor kartu BPJS Kesehatan selalu berupa 13 digit angka dan tidak dapat memuat karakter huruf.
                      </p>
                    </div>
                  </div>
                )}

                {/* SUBMIT BUTTON */}
                <div className="pt-3 border-t border-slate-100">
                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>SIMPAN & DAFTARKAN PASIEN ({serviceType.toUpperCase()})</span>
                  </button>
                  <p className="text-[10px] text-slate-400 text-center mt-2">
                    Data otomatis sinkron ke Modul Rekam Medis (RME), General Consent, Tracer, dan CPPT.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
        </div>
      )}

      {/* VIEW MODE 2: LAPORAN KUNJUNGAN PASIEN & STATISTIK */}
      {viewMode === 'laporan' && (
        <div className="space-y-6">
          {/* KPI Statistics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Total Kunjungan</div>
              <div className="text-xl font-black text-slate-900 mt-1">{statsKunjungan.total}</div>
            </div>
            <div className="bg-white p-3.5 rounded-2xl border border-blue-200 shadow-xs">
              <div className="text-[10px] font-bold text-blue-600 uppercase">Rawat Jalan</div>
              <div className="text-xl font-black text-blue-900 mt-1">{statsKunjungan.rawatJalan}</div>
            </div>
            <div className="bg-white p-3.5 rounded-2xl border border-amber-200 shadow-xs">
              <div className="text-[10px] font-bold text-amber-600 uppercase">Rawat Inap</div>
              <div className="text-xl font-black text-amber-900 mt-1">{statsKunjungan.rawatInap}</div>
            </div>
            <div className="bg-white p-3.5 rounded-2xl border border-rose-200 shadow-xs">
              <div className="text-[10px] font-bold text-rose-600 uppercase">IGD</div>
              <div className="text-xl font-black text-rose-900 mt-1">{statsKunjungan.igd}</div>
            </div>
            <div className="bg-white p-3.5 rounded-2xl border border-emerald-200 shadow-xs">
              <div className="text-[10px] font-bold text-emerald-600 uppercase">Bayi Baru Lahir</div>
              <div className="text-xl font-black text-emerald-900 mt-1">{statsKunjungan.bbl}</div>
            </div>
            <div className="bg-white p-3.5 rounded-2xl border border-teal-200 shadow-xs">
              <div className="text-[10px] font-bold text-teal-600 uppercase">BPJS JKN</div>
              <div className="text-xl font-black text-teal-900 mt-1">{statsKunjungan.bpjs}</div>
            </div>
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-[10px] font-bold text-slate-500 uppercase">Umum / Tunai</div>
              <div className="text-xl font-black text-slate-700 mt-1">{statsKunjungan.umum}</div>
            </div>
          </div>

          {/* Search & Export Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={laporanSearchTerm}
                  onChange={e => setLaporanSearchTerm(e.target.value)}
                  placeholder="Cari Nama, No RM, NIK, No Reg..."
                  className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs w-60 focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <select
                value={laporanTipeLayanan}
                onChange={e => setLaporanTipeLayanan(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
              >
                <option value="all">Semua Layanan</option>
                <option value="Rawat Jalan">Rawat Jalan</option>
                <option value="Rawat Inap">Rawat Inap</option>
                <option value="IGD">IGD</option>
                <option value="Bayi Baru Lahir">Bayi Baru Lahir</option>
              </select>

              <select
                value={laporanCaraBayar}
                onChange={e => setLaporanCaraBayar(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
              >
                <option value="all">Semua Cara Bayar</option>
                <option value="BPJS">BPJS Kesehatan</option>
                <option value="Umum">Umum / Cash</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCsv}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={() => window.print()}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Rekap</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-4 py-2.5 bg-blue-50/80 border-b border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-blue-900">
              <span className="flex items-center gap-1.5 font-medium">
                <Eye className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  <strong>Fitur Kunjungan Terintegrasi:</strong> Klik 2x (double-click) pada baris pasien untuk membuka <strong>Profil Pasien Komprehensif</strong> (CPPT, TTV, Riwayat Pelayanan, Billing).
                </span>
              </span>
              <span className="text-[11px] text-blue-700 font-mono font-bold shrink-0">
                {laporanKunjunganFiltered.length} Data Kunjungan
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 uppercase font-black tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-3">No. Reg</th>
                    <th className="p-3">Tanggal</th>
                    <th className="p-3">No. RM</th>
                    <th className="p-3">Nama Pasien</th>
                    <th className="p-3">Unit Layanan</th>
                    <th className="p-3">Poli / Kamar</th>
                    <th className="p-3">DPJP Dokter</th>
                    <th className="p-3">Cara Bayar</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {laporanKunjunganFiltered.map(r => {
                    const p = getPatient(r.patientId);
                    const doc = getUser(r.dpjp);
                    return (
                      <tr
                        key={r.id}
                        onDoubleClick={() => setProfilModalRegId(r.id)}
                        className="hover:bg-blue-50/60 transition-colors cursor-pointer select-none"
                        title="Klik 2x untuk membuka Profil Pasien Komprehensif"
                      >
                        <td className="p-3 font-mono font-bold text-blue-700">{r.id}</td>
                        <td className="p-3 text-slate-600">{r.date}</td>
                        <td className="p-3 font-mono font-bold text-slate-800">{p?.noRM || '-'}</td>
                        <td className="p-3 font-bold text-slate-900">{p?.name || '-'}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                            r.type === 'IGD' ? 'bg-rose-100 text-rose-800' :
                            r.type === 'Rawat Inap' ? 'bg-amber-100 text-amber-800' :
                            r.type === 'Bayi Baru Lahir' ? 'bg-emerald-100 text-emerald-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {r.type}
                          </span>
                        </td>
                        <td className="p-3 text-slate-700">{r.room || r.poli}</td>
                        <td className="p-3 text-slate-700">{doc?.name || '-'}</td>
                        <td className="p-3">
                          <span className="font-medium text-slate-700">{p?.insuranceType || 'Umum'}</span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            r.status === 'Batal' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {r.status || 'Selesai'}
                          </span>
                        </td>
                        <td className="p-3 text-right" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            {/* 1. Ikon Mata - Profil Komprehensif */}
                            <button
                              onClick={() => setProfilModalRegId(r.id)}
                              className="p-1.5 bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-700 rounded-lg transition-colors cursor-pointer"
                              title="Lihat Profil Pasien Komprehensif (CPPT & Riwayat)"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* 2. Cetak Struk Registrasi */}
                            <button
                              onClick={() => setPrintStrukRegId(r.id)}
                              className="p-1.5 bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-700 rounded-lg transition-colors cursor-pointer"
                              title="Cetak Struk Kunjungan / Registrasi"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>

                            {/* 2.5 Cetak Formulir General Consent */}
                            <button
                              onClick={() => setPrintGcRegId(r.id)}
                              className="p-1.5 bg-slate-100 hover:bg-purple-100 text-slate-700 hover:text-purple-700 rounded-lg transition-colors cursor-pointer"
                              title="Cetak Formulir General Consent (Persetujuan Umum)"
                            >
                              <FileSignature className="w-3.5 h-3.5" />
                            </button>

                            {/* 3. Edit Kunjungan */}
                            <button
                              onClick={() => handleOpenEditModal(r)}
                              className="p-1.5 bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-700 rounded-lg transition-colors cursor-pointer"
                              title="Edit Kunjungan (Poli, Dokter, Ruangan, Status)"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {/* 4. Batal Daftar */}
                            {r.status !== 'Batal' && (
                              <button
                                onClick={() => handleCancelRegistration(r.id)}
                                className="p-1.5 bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-rose-700 rounded-lg transition-colors cursor-pointer"
                                title="Batalkan Pendaftaran"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* 5. Buka RME */}
                            <button
                              onClick={() => navigate('rekammedis', { patientId: r.patientId, regId: r.id })}
                              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold cursor-pointer transition-colors shadow-2xs ml-0.5"
                              title="Buka Lembar Rekam Medis Elektronik"
                            >
                              Buka RME
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE: BED MANAGEMENT (MANAJEMEN TEMPAT TIDUR RAWAT INAP) */}
      {viewMode === 'bedmanagement' && (
        <BedManagementView
          onSelectBed={(bed) => {
            setViewMode('form');
            setServiceType('Rawat Inap');
            setSelectedBedId(bed.id);
            setRuangRawatBangsal(bed.room);
            setNoKamarBed(`${bed.roomName || bed.room} - ${bed.bedNumber || bed.id}`);
            setKelasRawatInap(bed.class);
            Swal.fire({
              icon: 'success',
              title: 'Tempat Tidur Terpilih',
              text: `Membuka formulir pendaftaran Rawat Inap untuk ${bed.room} - ${bed.bedNumber || bed.id}.`,
              timer: 1600,
              showConfirmButton: false
            });
          }}
        />
      )}

      {/* VIEW MODE 3: RIWAYAT & KAMAR */}
      {viewMode === 'list' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              Monitoring Pendaftaran & Tempat Tidur RS
            </h3>
            <div className="flex items-center gap-2">
              {['', 'Rawat Jalan', 'IGD', 'Rawat Inap', 'Bayi Baru Lahir'].map(tabType => (
                <button
                  key={tabType}
                  onClick={() => setTypeFilter(tabType)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    typeFilter === tabType
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {tabType || 'Semua Unit'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRegs.map(reg => {
              const p = getPatient(reg.patientId);
              const doc = getUser(reg.dpjp);
              return (
                <div key={reg.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="font-mono font-black text-blue-700 text-xs">{reg.id}</span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                      reg.type === 'IGD' ? 'bg-rose-100 text-rose-800' :
                      reg.type === 'Rawat Inap' ? 'bg-amber-100 text-amber-800' :
                      reg.type === 'Bayi Baru Lahir' ? 'bg-emerald-100 text-emerald-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {reg.type}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="font-bold text-slate-900 text-sm">{p?.name || '-'}</div>
                    <div className="text-slate-500 font-mono">No. RM: <strong>{p?.noRM}</strong> &bull; NIK: {p?.nik}</div>
                    <div className="text-slate-700">{reg.room || reg.poli}</div>
                    <div className="text-slate-500 text-[11px]">DPJP: {doc?.name || '-'}</div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setTracerModalRegId(reg.id)}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold cursor-pointer"
                        title="Tracer Berkas"
                      >
                        Tracer
                      </button>
                      <button
                        onClick={() => setPrintGcRegId(reg.id)}
                        className="px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-[11px] font-bold cursor-pointer inline-flex items-center gap-1"
                        title="Cetak General Consent"
                      >
                        <FileSignature className="w-3 h-3" />
                        GC
                      </button>
                    </div>
                    <button
                      onClick={() => navigate('rekammedis', { patientId: reg.patientId, regId: reg.id })}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold cursor-pointer"
                    >
                      Buka RME &rarr;
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TRACER MODAL */}
      {tracerModalRegId && (
        <TracerIgdModal
          isOpen={!!tracerModalRegId}
          onClose={() => setTracerModalRegId(null)}
          patient={getPatient(registrations.find(r => r.id === tracerModalRegId)?.patientId || '') || null}
          registration={registrations.find(r => r.id === tracerModalRegId) || null}
          doctor={getUser(registrations.find(r => r.id === tracerModalRegId)?.dpjp || '') || null}
        />
      )}

      {/* PROFIL PASIEN KOMPREHENSIF MODAL (DOUBLE CLICK / DETAIL) */}
      {profilModalRegId && (
        <ProfilPasienKomprehensifModal
          isOpen={!!profilModalRegId}
          onClose={() => setProfilModalRegId(null)}
          registration={registrations.find(r => r.id === profilModalRegId) || null}
          patient={getPatient(registrations.find(r => r.id === profilModalRegId)?.patientId || '') || null}
        />
      )}

      {/* CETAK STRUK KUNJUNGAN MODAL */}
      {printStrukRegId && (
        <CetakStrukKunjunganModal
          isOpen={!!printStrukRegId}
          onClose={() => setPrintStrukRegId(null)}
          patient={getPatient(registrations.find(r => r.id === printStrukRegId)?.patientId || '') || null}
          registration={registrations.find(r => r.id === printStrukRegId) || null}
          doctor={getUser(registrations.find(r => r.id === printStrukRegId)?.dpjp || '') || null}
        />
      )}

      {/* CETAK GENERAL CONSENT MODAL */}
      {printGcRegId && (
        <CetakGeneralConsentModal
          isOpen={!!printGcRegId}
          onClose={() => setPrintGcRegId(null)}
          consent={
            generalConsents.find(gc => gc.regId === printGcRegId) || {
              id: `GC-${printGcRegId}`,
              regId: printGcRegId,
              date: new Date().toISOString().substring(0, 10),
              patientSign: getPatient(registrations.find(r => r.id === printGcRegId)?.patientId || '')?.name || 'Pasien / Wali',
              witnessSign: 'Petugas Admisi RMIK',
              status: 'Signed'
            }
          }
          patient={getPatient(registrations.find(r => r.id === printGcRegId)?.patientId || '') || null}
          registration={registrations.find(r => r.id === printGcRegId) || null}
          doctor={getUser(registrations.find(r => r.id === printGcRegId)?.dpjp || '') || null}
        />
      )}

      {/* EDIT KUNJUNGAN MODAL */}
      {editRegId && (
        <EditKunjunganModal
          isOpen={!!editRegId}
          onClose={() => setEditRegId(null)}
          registration={registrations.find(r => r.id === editRegId) || null}
          patientName={getPatient(registrations.find(r => r.id === editRegId)?.patientId || '')?.name}
          doctors={users.filter(u => u.roleId === 'R05' || u.roleId === 'R01' || u.roleId === 'R03')}
          onSave={(regId, updates) => {
            updateRegistration(regId, updates);
            Swal.fire({
              icon: 'success',
              title: 'Perubahan Kunjungan Disimpan',
              text: `Data kunjungan ${regId} berhasil diperbarui.`,
              timer: 1500,
              showConfirmButton: false
            });
          }}
        />
      )}

      {/* MODAL CEK VALIDASI & KEPESERTAAN BPJS (+ CEK BPJS) */}
      {showQuickCheckModal && (
        <ModalCekBpjs
          isOpen={showQuickCheckModal}
          onClose={() => setShowQuickCheckModal(false)}
          patients={patients}
          initialNoBpjs={noAsuransi}
          initialNik={nik}
          onApplyToForm={(data) => {
            setNoAsuransi(data.noBPJS);
            setNik(data.nik);
            setNamaLengkap(data.name);
            setCaraPembayaran('BPJS KESEHATAN');
            if (data.sepNo && data.sepNo !== '-') {
              setGeneratedSepDummy(data.sepNo);
            }
            setCurrentVclaimStatus({
              checked: true,
              status: data.status,
              statusDesc: data.statusDesc,
              hakKelas: data.hakKelas,
              faskes1: 'Puskesmas Kebon Jeruk (0112001)',
              lastChecked: new Date().toLocaleTimeString('id-ID'),
              responseCode: data.status === 'Aktif' ? '200 OK' : '201 Not Active',
              dbSynced: true
            });
          }}
          onAddToLog={(logItem) => {
            setVclaimSyncLogs(prev => [logItem, ...prev]);
          }}
        />
      )}

      {/* MODAL PILIH BED RAWAT INAP */}
      {isBedPickerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] overflow-y-auto border border-slate-200 shadow-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  <Bed className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900 leading-tight">
                    Pilih Tempat Tidur (Bed Management)
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Klik kartu ruangan untuk melihat denah & pilih bed berwarna Hijau (Tersedia) untuk formulir pasien ini.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBedPickerModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <BedManagementView
              selectedBedId={selectedBedId}
              onSelectBed={(bed) => {
                setSelectedBedId(bed.id);
                setRuangRawatBangsal(bed.room);
                setNoKamarBed(`${bed.roomName || bed.room} - ${bed.bedNumber || bed.id}`);
                setKelasRawatInap(bed.class);
                setIsBedPickerModalOpen(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
