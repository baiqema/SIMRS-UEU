import React, { useState } from 'react';
import { Patient, Registration, User as UserType } from '../../types';
import {
  LembarIdentitasSection,
  CaraPembayaranSection,
  GeneralConsentSection,
  initialGeneralConsentState,
  GeneralConsentState,
  BODY_PARTS_28
} from './FormSharedSections';
import {
  ShieldAlert, Stethoscope, Activity, HeartPulse, ShieldCheck, Printer,
  Save, CheckCircle2, AlertTriangle, Plus, Trash2, FileText,
  Ambulance, Thermometer, UserCheck, Flame, Scale, CheckSquare
} from 'lucide-react';
import Swal from 'sweetalert2';
import { SequentialHospitalLogos } from '../Logos';

interface FormIgdProps {
  patient: Patient;
  registration?: Registration;
  user?: UserType | null;
  onSaveSuccess?: () => void;
}

export const FormIgd: React.FC<FormIgdProps> = ({
  patient,
  registration,
  user,
  onSaveSuccess
}) => {
  const [caraBayar, setCaraBayar] = useState<'JKN' | 'Mandiri' | 'Asuransi lainnya'>('JKN');
  const [gcState, setGcState] = useState<GeneralConsentState>(initialGeneralConsentState);

  // TRIASE PMK 47/2018
  const [tanggalMasuk, setTanggalMasuk] = useState(new Date().toISOString().substring(0, 10));
  const [jamMasuk, setJamMasuk] = useState(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
  const [transportasi, setTransportasi] = useState<'Ambulans' | 'Mobil' | 'Motor' | 'Lain-lain'>('Ambulans');
  const [suratRujukan, setSuratRujukan] = useState<'Ada' | 'Tidak Ada'>('Tidak Ada');
  const [kondisiTiba, setKondisiTiba] = useState<
    'Resusitasi' | 'Emergency' | 'Urgent' | 'Less Urgent' | 'Non Urgent' | 'Death on Arrival'
  >('Emergency');
  const [namaPengantar, setNamaPengantar] = useState('Bambang S.');
  const [noTelpPengantar, setNoTelpPengantar] = useState('081398765432');

  // ANAMNESIS
  const [keluhanUtama, setKeluhanUtama] = useState('Nyeri dada kiri menjalar ke punggung dan sesak napas mendadak sejak 1 jam SMRS saat beraktivitas.');
  const [riwayatPenyakit, setRiwayatPenyakit] = useState('Hipertensi tidak terkontrol sejak 3 tahun lalu. Perokok aktif.');
  const [alergiObat, setAlergiObat] = useState('Tidak Ada (Disangkal)');
  const [alergiMakanan, setAlergiMakanan] = useState('Tidak Ada');
  const [alergiUdara, setAlergiUdara] = useState('Tidak Ada');
  const [alergiLain, setAlergiLain] = useState('Tidak Ada');
  const [riwayatPengobatan, setRiwayatPengobatan] = useState('Amlodipine 10mg diminum tidak teratur.');

  // ASESMEN AWAL IGD - NYERI
  const [adaNyeri, setAdaNyeri] = useState<'Ada' | 'Tidak Ada'>('Ada');
  const [skalaNyeri, setSkalaNyeri] = useState(7);
  const [lokasiNyeri, setLokasiNyeri] = useState('Dada substernal kiri menjalar ke lengan & punggung');
  const [penyebabNyeri, setPenyebabNyeri] = useState('Iskemia Miokard / Oksigenasi jaringan turun');
  const [durasiNyeri, setDurasiNyeri] = useState('> 30 menit menetap');
  const [frekuensiNyeri, setFrekuensiNyeri] = useState('Terus menerus / Menekan');
  const [metodeNyeri, setMetodeNyeri] = useState<'NRS' | 'BPS' | 'NIPS' | 'VAS'>('NRS');

  // ASESMEN RISIKO JATUH
  const [metodeRisikoJatuh, setMetodeRisikoJatuh] = useState<'Morse Fall Scale' | 'Humpty Dumpty Scale' | 'Edmonson Psychiatric Fall Risk Assessment'>('Morse Fall Scale');
  const [skorJatuh, setSkorJatuh] = useState('Tinggi (Skor: 55)');

  // PEMERIKSAAN FISIK
  const [tingkatKesadaran, setTingkatKesadaran] = useState('Sadar Baik / Alert');
  const [vitalSign, setVitalSign] = useState({
    denyutJantung: '108',
    pernapasan: '26',
    sistole: '150',
    diastole: '95',
    suhuTubuh: '36.8'
  });

  // SCREENING
  const [risikoDecubitus, setRisikoDecubitus] = useState<'Tidak' | 'Ya'>('Tidak');
  const [skalaNorton, setSkalaNorton] = useState('18 (Risiko Rendah)');
  const [screenCovidTb, setScreenCovidTb] = useState({
    demam: false,
    keringatMalam: false,
    bepergianWabah: false,
    obatJangkaPanjang: false,
    bbTurun: false
  });
  const [screenGizi, setScreenGizi] = useState({
    bbTurun6Bln: false,
    penurunanAsupan: true,
    gejalaGastro: false,
    faktorKomorbid: true,
    penurunanKapasitas: true
  });

  // PSIKOLOGIS, SOSIAL, SPIRITUAL
  const [statusPsikologis, setStatusPsikologis] = useState('Cemas');
  const [sosialEkonomi, setSosialEkonomi] = useState('Keluarga mendampingi penuh di IGD, penjaminan BPJS JKN aktif.');
  const [spiritual, setSpiritual] = useState('Membutuhkan doa dan bimbingan rohani saat penanganan gawat darurat.');

  // OBAT SAAT INI
  const [obatList, setObatList] = useState<{ nama: string; dosis: string; waktu: string }[]>([
    { nama: 'ISDN (Isosorbide Dinitrate)', dosis: '5 mg Sublingual', waktu: 'Segera di IGD (Menit 0)' },
    { nama: 'Aspilet (Asam Asetilsalisilat)', dosis: '160 mg Kunyah', waktu: 'Loading dose IGD' },
    { nama: 'Clopidogrel', dosis: '300 mg Oral', waktu: 'Loading dose IGD' }
  ]);

  // DISCHARGE PLANNING
  const [dischargePlanning, setDischargePlanning] = useState({
    lansia: false,
    anggotaGerak: false,
    perawatanPanjang: true,
    bantuanAdl: true,
    tidakMasukKriteria: false
  });

  // RENCANA RAWAT & INSTRUKSI
  const [rencanaRawat, setRencanaRawat] = useState('Konsul DPJP Jantung Sp.JP, rawat intensif ICCU / CVCU untuk monitoring hemodinamik dan persiapan angiografi koroner.');
  const [instruksiMedik, setInstruksiMedik] = useState('Oksigen kanul nasal 3 lpm, pasang IV line 2 jalur, tirah baring total, rekam EKG serial per 30 menit, periksa enzim jantung Trop-I / CKMB.');

  // PEMERIKSAAN PENUNJANG
  const [penunjangLab, setPenunjangLab] = useState('Troponin I kuantitatif, CKMB, Darah Lengkap, Elektrolit (Na, K, Cl), GDS, Ureum, Kreatinin');
  const [penunjangRad, setPenunjangRad] = useState('EKG 12 Lead Cito (Hasil: ST Elevasi di Lead V1-V4), Foto Thorax AP Cito');

  // DIAGNOSIS
  const [diagnosisMasuk, setDiagnosisMasuk] = useState('Sindrom Koroner Akut (STEMI Anterior Ekstensif) Killip I-II');
  const [diagnosisBanding, setDiagnosisBanding] = useState('NSTEMI / Diseksi Aorta Akut');
  const [icd10, setIcd10] = useState('I21.0 - Acute transmural myocardial infarction of anterior wall');
  const [icd9, setIcd9] = useState('89.52 - Electrocardiogram (EKG 12-Lead)');

  // INFORMED CONSENT TINDAKAN IGD
  const [informedConsent, setInformedConsent] = useState({
    namaDokter: 'dr. Hendra Setiawan, Sp.JP / dr. Jaga IGD',
    namaPetugas: 'Ns. Ratna Dewi, S.Kep',
    namaKeluarga: 'Bambang S. (Anak Kandung)',
    tindakan: 'Pemasangan Akses Vena Sentral / Terapi Trombolitik & Penanganan Kegawatdaruratan Jantung',
    konsekuensi: 'Telah dijelaskan indikasi, risiko perdarahan, aritmia, serta manfaat penyelamatan miokard.',
    status: 'Setuju' as 'Setuju' | 'Menolak'
  });

  const handleSaveForm = (isFinal = false) => {
    Swal.fire({
      icon: 'success',
      title: isFinal ? 'Asesmen & Triase IGD Terverifikasi!' : 'Draft Asesmen IGD Tersimpan',
      html: `
        <div class="text-left text-xs space-y-1 text-slate-600">
          <p><strong>Pasien:</strong> ${patient.name} (${patient.noRM})</p>
          <p><strong>Triase:</strong> <span class="text-rose-700 font-bold">${kondisiTiba}</span></p>
          <p><strong>Diagnosis:</strong> ${diagnosisMasuk}</p>
          <p><strong>Status:</strong> ${isFinal ? 'Final Tervalidasi DPJP' : 'Draft Tersimpan'}</p>
        </div>
      `,
      confirmButtonText: 'Tutup',
      confirmButtonColor: '#dc2626'
    });
    if (onSaveSuccess) onSaveSuccess();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 font-sans text-slate-800">
      {/* HEADER KOP RESMI FORMULIR TRIASE & IGD */}
      <div className="bg-white border-2 border-slate-300 rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <SequentialHospitalLogos size="md" showSubtitle={true} />
        <div className="text-right shrink-0">
          <div className="inline-block px-3 py-1 bg-rose-600 text-white font-mono font-black text-xs rounded-xl uppercase tracking-wider">
            FORMULIR TRIASE & GAWAT DARURAT (IGD)
          </div>
          <div className="text-xs font-bold text-rose-700 mt-1">
            Standar PMK No. 47 Tahun 2018 & KMK 1423
          </div>
        </div>
      </div>

      {/* BAGIAN I — LEMBAR IDENTITAS PASIEN */}
      <LembarIdentitasSection patient={patient} />

      {/* BAGIAN II — CARA PEMBAYARAN */}
      <CaraPembayaranSection
        caraBayar={caraBayar}
        setCaraBayar={setCaraBayar}
        noKartu={patient?.nik || '3173012345670001'}
      />

      {/* BAGIAN III — GENERAL CONSENT */}
      <GeneralConsentSection
        gcState={gcState}
        setGcState={setGcState}
        patient={patient}
      />

      {/* BAGIAN IV — FORMULIR TRIASE DAN GAWAT DARURAT */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-6 shadow-xs">
        <div className="border-b border-slate-200 pb-3 flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center font-black text-sm">
            IV
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide">
              BAGIAN IV — FORMULIR TRIASE DAN GAWAT DARURAT
            </h4>
            <p className="text-[11px] text-slate-500 font-medium">
              Triase Kedatangan, Anamnesis, Nyeri, Fisik 28 Regio, Screening, Terapi & Informed Consent
            </p>
          </div>
        </div>

        {/* 1. TRIASE KEDATANGAN PMK 47/2018 */}
        <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-200 space-y-4 text-xs">
          <div className="flex items-center gap-2 border-b border-rose-200 pb-2 text-rose-950 font-black uppercase text-xs">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span>KONDISI KEDATANGAN & TRIASE (PMK NO. 47 TAHUN 2018)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Tanggal & Jam Masuk:</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <input
                  type="date"
                  value={tanggalMasuk}
                  onChange={e => setTanggalMasuk(e.target.value)}
                  className="w-full p-1.5 bg-white rounded-lg border border-slate-300 font-semibold"
                />
                <input
                  type="text"
                  value={jamMasuk}
                  onChange={e => setJamMasuk(e.target.value)}
                  className="w-20 p-1.5 bg-white rounded-lg border border-slate-300 font-mono font-bold text-center"
                />
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Sarana Transportasi:</span>
              <select
                value={transportasi}
                onChange={e => setTransportasi(e.target.value as any)}
                className="w-full p-1.5 bg-white rounded-lg border border-slate-300 font-bold mt-0.5"
              >
                <option value="Ambulans">Ambulans</option>
                <option value="Mobil">Mobil Pribadi / Taksi</option>
                <option value="Motor">Sepeda Motor</option>
                <option value="Lain-lain">Lain-lain / Berjalan Kaki</option>
              </select>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Surat Pengantar Rujukan:</span>
              <select
                value={suratRujukan}
                onChange={e => setSuratRujukan(e.target.value as any)}
                className="w-full p-1.5 bg-white rounded-lg border border-slate-300 font-bold mt-0.5"
              >
                <option value="Tidak Ada">Tidak Ada (Datang Sendiri)</option>
                <option value="Ada">Ada (Dari Puskesmas/Klinik/RS Lain)</option>
              </select>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Identitas Pengantar & No. HP:</span>
              <input
                type="text"
                value={`${namaPengantar} (${noTelpPengantar})`}
                onChange={e => setNamaPengantar(e.target.value)}
                className="w-full p-1.5 bg-white rounded-lg border border-slate-300 font-semibold mt-0.5"
              />
            </div>
          </div>

          {/* Kategori Triase Buttons */}
          <div>
            <span className="text-[11px] font-black uppercase text-slate-800 block mb-2">
              Kategori Triase Saat Tiba:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {[
                { id: 'Resusitasi', label: 'Resusitasi (Merah)', desc: 'Ancaman nyawa segera (0 mnt)', color: 'bg-red-600 text-white' },
                { id: 'Emergency', label: 'Emergency (Merah)', desc: 'Gawat Darurat (< 10 mnt)', color: 'bg-rose-500 text-white' },
                { id: 'Urgent', label: 'Urgent (Kuning)', desc: 'Darurat (< 30 mnt)', color: 'bg-amber-500 text-white' },
                { id: 'Less Urgent', label: 'Less Urgent (Hijau)', desc: 'Semi Darurat (< 60 mnt)', color: 'bg-emerald-600 text-white' },
                { id: 'Non Urgent', label: 'Non Urgent (Hijau)', desc: 'Bukan Darurat (< 120 mnt)', color: 'bg-teal-600 text-white' },
                { id: 'Death on Arrival', label: 'DOA (Hitam)', desc: 'Meninggal saat tiba', color: 'bg-slate-900 text-white' },
              ].map(tr => {
                const isSelected = kondisiTiba === tr.id;
                return (
                  <button
                    key={tr.id}
                    type="button"
                    onClick={() => setKondisiTiba(tr.id as any)}
                    className={`p-2 rounded-xl text-left transition-all border cursor-pointer ${
                      isSelected ? `${tr.color} ring-2 ring-rose-400 font-bold scale-[1.02] shadow-sm` : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-[11px] font-black">{tr.label}</div>
                    <div className="text-[9px] opacity-85 leading-tight mt-0.5">{tr.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 2. ANAMNESIS */}
        <div className="space-y-3 text-xs">
          <div className="font-black uppercase text-slate-800 border-b border-slate-200 pb-1 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-slate-600" />
            <span>ANAMNESIS GAWAT DARURAT</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Keluhan Utama:</span>
              <textarea
                rows={2}
                value={keluhanUtama}
                onChange={e => setKeluhanUtama(e.target.value)}
                className="w-full p-2 bg-slate-50 rounded-xl border border-slate-200 font-medium"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Riwayat Penyakit:</span>
                <textarea
                  rows={2}
                  value={riwayatPenyakit}
                  onChange={e => setRiwayatPenyakit(e.target.value)}
                  className="w-full p-2 bg-slate-50 rounded-xl border border-slate-200 font-medium"
                />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Riwayat Pengobatan:</span>
                <textarea
                  rows={2}
                  value={riwayatPengobatan}
                  onChange={e => setRiwayatPengobatan(e.target.value)}
                  className="w-full p-2 bg-slate-50 rounded-xl border border-slate-200 font-medium"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 3. ASESMEN NYERI & RISIKO JATUH */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
          {/* Asesmen Nyeri */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
              <span className="font-bold text-slate-900 uppercase text-[11px] flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-rose-600" />
                <span>Asesmen Nyeri Komprehensif</span>
              </span>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1 cursor-pointer font-bold">
                  <input type="radio" name="adaNyeri" value="Ada" checked={adaNyeri === 'Ada'} onChange={() => setAdaNyeri('Ada')} />
                  <span>Ada Nyeri</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer font-bold">
                  <input type="radio" name="adaNyeri" value="Tidak Ada" checked={adaNyeri === 'Tidak Ada'} onChange={() => setAdaNyeri('Tidak Ada')} />
                  <span>Tidak Ada</span>
                </label>
              </div>
            </div>

            {adaNyeri === 'Ada' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">Skala Nyeri (0-10):</span>
                  <span className="font-mono font-black text-sm px-2 py-0.5 bg-rose-600 text-white rounded-lg">
                    {skalaNyeri} / 10 ({skalaNyeri >= 7 ? 'Nyeri Berat' : skalaNyeri >= 4 ? 'Nyeri Sedang' : 'Nyeri Ringan'})
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={skalaNyeri}
                  onChange={e => setSkalaNyeri(Number(e.target.value))}
                  className="w-full accent-rose-600 cursor-pointer"
                />

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Lokasi:</span>
                    <input type="text" value={lokasiNyeri} onChange={e => setLokasiNyeri(e.target.value)} className="w-full p-1.5 bg-white rounded border border-slate-300 font-semibold" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Metode Asesmen:</span>
                    <select value={metodeNyeri} onChange={e => setMetodeNyeri(e.target.value as any)} className="w-full p-1.5 bg-white rounded border border-slate-300 font-bold">
                      <option value="NRS">NRS (Numeric Rating Scale)</option>
                      <option value="VAS">VAS (Visual Analog Scale)</option>
                      <option value="BPS">BPS (Behavioral Pain Scale)</option>
                      <option value="NIPS">NIPS (Neonatal Infant Pain Scale)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Kajian Risiko Jatuh & Screening */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
              <span className="font-bold text-slate-900 uppercase text-[11px] flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-amber-600" />
                <span>Kajian Risiko Jatuh & Decubitus</span>
              </span>
            </div>

            <div className="space-y-2">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Skala Pengukuran Risiko Jatuh:</span>
                <select value={metodeRisikoJatuh} onChange={e => setMetodeRisikoJatuh(e.target.value as any)} className="w-full p-1.5 bg-white rounded border border-slate-300 font-bold mt-0.5">
                  <option value="Morse Fall Scale">Morse Fall Scale (Dewasa)</option>
                  <option value="Humpty Dumpty Scale">Humpty Dumpty Scale (Pediatrik / Anak)</option>
                  <option value="Edmonson Psychiatric Fall Risk Assessment">Edmonson Psychiatric Fall Risk Assessment (Psikiatri)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-amber-50 rounded-lg border border-amber-200">
                  <span className="text-[9px] font-bold text-amber-800 uppercase">Kategori Jatuh:</span>
                  <div className="font-bold text-amber-950">{skorJatuh}</div>
                </div>
                <div className="p-2 bg-white rounded-lg border border-slate-300">
                  <span className="text-[9px] font-bold text-slate-500 uppercase">Skala Norton (Decubitus):</span>
                  <div className="font-bold text-slate-800">{skalaNorton}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. PEMERIKSAAN FISIK 28 BAGIAN TUBUH */}
        <div className="space-y-3 text-xs pt-2">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1">
            <span className="font-black uppercase text-slate-800 flex items-center gap-1.5">
              <Stethoscope className="w-4 h-4 text-blue-600" />
              <span>PEMERIKSAAN FISIK & 28 BAGIAN TUBUH (KMK 1423)</span>
            </span>
            <div className="flex items-center gap-2 text-[11px] font-mono font-bold text-slate-700">
              <span>HR: {vitalSign.denyutJantung} bpm</span> &bull; <span>BP: {vitalSign.sistole}/{vitalSign.diastole} mmHg</span> &bull; <span>RR: {vitalSign.pernapasan} x/m</span> &bull; <span>T: {vitalSign.suhuTubuh}°C</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5">
            {BODY_PARTS_28.map((part, idx) => (
              <div key={part} className="p-1.5 bg-slate-50 rounded-lg border border-slate-200 text-center">
                <div className="text-[9px] text-slate-500 font-bold">{idx + 1}. {part}</div>
                <div className="text-[10px] font-black text-emerald-700">TAK</div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. DIAGNOSIS & INFORMED CONSENT */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs pt-2">
          {/* Diagnosis & Coding */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <span className="font-bold text-slate-900 uppercase text-[11px] block">Diagnosis & Koding Medis (ICD-10 / ICD-9-CM):</span>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Diagnosis Masuk / Kerja:</span>
              <input type="text" value={diagnosisMasuk} onChange={e => setDiagnosisMasuk(e.target.value)} className="w-full p-1.5 bg-white rounded border border-slate-300 font-bold text-blue-900" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Koding ICD-10 Utama:</span>
              <input type="text" value={icd10} onChange={e => setIcd10(e.target.value)} className="w-full p-1.5 bg-white rounded border border-slate-300 font-mono font-bold text-emerald-800" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Koding Prosedur ICD-9-CM:</span>
              <input type="text" value={icd9} onChange={e => setIcd9(e.target.value)} className="w-full p-1.5 bg-white rounded border border-slate-300 font-mono font-bold text-cyan-800" />
            </div>
          </div>

          {/* Persetujuan Tindakan Kedaruratan */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <span className="font-bold text-slate-900 uppercase text-[11px] block">Persetujuan Tindakan Gawat Darurat (Informed Consent):</span>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Tindakan Medik:</span>
              <input type="text" value={informedConsent.tindakan} onChange={e => setInformedConsent({ ...informedConsent, tindakan: e.target.value })} className="w-full p-1.5 bg-white rounded border border-slate-300 font-medium" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Pemberi Persetujuan:</span>
                <input type="text" value={informedConsent.namaKeluarga} onChange={e => setInformedConsent({ ...informedConsent, namaKeluarga: e.target.value })} className="w-full p-1.5 bg-white rounded border border-slate-300 font-medium" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Status Pernyataan:</span>
                <select value={informedConsent.status} onChange={e => setInformedConsent({ ...informedConsent, status: e.target.value as any })} className="w-full p-1.5 bg-white rounded border border-slate-300 font-bold text-emerald-700">
                  <option value="Setuju">SETUJU DILAKUKAN TINDAKAN</option>
                  <option value="Menolak">MENOLAK TINDAKAN</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 font-medium">
            Dokter DPJP / Jaga IGD: <strong className="text-slate-800">{user?.name || 'dr. Hendra Setiawan, Sp.JP'}</strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Form IGD</span>
            </button>
            <button
              type="button"
              onClick={() => handleSaveForm(false)}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Draft</span>
            </button>
            <button
              type="button"
              onClick={() => handleSaveForm(true)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Verifikasi & TTE IGD</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
