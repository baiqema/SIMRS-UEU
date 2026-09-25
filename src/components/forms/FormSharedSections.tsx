import React, { useState } from 'react';
import { Patient, User as UserType } from '../../types';
import { User, ShieldCheck, CreditCard, FileCheck, CheckCircle2, XCircle, Printer } from 'lucide-react';
import { SequentialHospitalLogos } from '../Logos';
import { CetakGeneralConsentModal } from '../CetakGeneralConsentModal';

export interface GeneralConsentState {
  tanggal: string;
  jam: string;
  ketentuanPembayaran: 'Setuju' | 'Tidak Setuju';
  hakKewajiban: 'Setuju' | 'Tidak Setuju';
  tataTertib: 'Setuju' | 'Tidak Setuju';
  penterjemah: 'Ya' | 'Tidak';
  rohaniawan: 'Ya' | 'Tidak';
  pelepasanInformasi: 'Setuju' | 'Tidak Setuju';
  penunjangPenjamin: 'Setuju' | 'Tidak Setuju';
  penunjangPesertaDidik: 'Setuju' | 'Tidak Setuju';
  keluargaInformasi: 'Setuju' | 'Tidak Setuju';
  fasyankesRujukan: 'Setuju' | 'Tidak Setuju';
  namaPJ: string;
  hubunganPJ: string;
  namaPetugas: string;
}

export const initialGeneralConsentState: GeneralConsentState = {
  tanggal: new Date().toISOString().substring(0, 10),
  jam: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
  ketentuanPembayaran: 'Setuju',
  hakKewajiban: 'Setuju',
  tataTertib: 'Setuju',
  penterjemah: 'Tidak',
  rohaniawan: 'Tidak',
  pelepasanInformasi: 'Setuju',
  penunjangPenjamin: 'Setuju',
  penunjangPesertaDidik: 'Setuju',
  keluargaInformasi: 'Setuju',
  fasyankesRujukan: 'Setuju',
  namaPJ: 'Keluarga Pasien',
  hubunganPJ: 'Keluarga / Penanggung Jawab',
  namaPetugas: 'Petugas Admisi RMIK'
};

// 28 Standard Physical Exam Body Parts according to KMK 1423 Metadata
export const BODY_PARTS_28 = [
  'Kepala', 'Mata', 'Telinga', 'Hidung', 'Rambut', 'Bibir',
  'Gigi geligi', 'Lidah', 'Langit-langit', 'Leher', 'Tenggorokan', 'Tonsil',
  'Dada', 'Payudara', 'Punggung', 'Perut', 'Genital', 'Anus/Dubur',
  'Lengan atas', 'Lengan bawah', 'Jari tangan', 'Kuku tangan', 'Persendian tangan',
  'Tungkai atas', 'Tungkai bawah', 'Jari kaki', 'Kuku kaki', 'Persendian kaki'
];

/**
 * BAGIAN I: LEMBAR IDENTITAS PASIEN
 * Sesuai metadata KMK 1423 (34 Variabel Berurutan)
 */
export const LembarIdentitasSection: React.FC<{ patient: Patient }> = ({ patient }) => {
  const genderMap: Record<string, string> = {
    '1': '1. Laki-laki',
    '2': '2. Perempuan',
    '0': '0. Tidak diketahui',
    '3': '3. Tidak dapat ditentukan',
    '4': '4. Tidak mengisi',
    'M': '1. Laki-laki',
    'F': '2. Perempuan'
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
      <div className="border-b border-slate-200 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm">
            I
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide">
              BAGIAN I — LEMBAR IDENTITAS PASIEN
            </h4>
            <p className="text-[11px] text-slate-500 font-medium">
              Data Identitas Umum Pasien Terintegrasi Master Data Pasien & Metadata KMK 1423
            </p>
          </div>
        </div>
        <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-mono font-bold text-xs rounded-lg border border-blue-200 self-start sm:self-auto">
          NO. RM: {patient?.noRM || '000001'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
        {/* 1. Nama Lengkap */}
        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">1. Nama Lengkap</span>
          <span className="font-bold text-slate-900 text-sm">{patient?.name || '-'}</span>
        </div>

        {/* 2. Nomor Rekam Medis */}
        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">2. Nomor Rekam Medis</span>
          <span className="font-mono font-bold text-blue-800">{patient?.noRM || '-'}</span>
        </div>

        {/* 3. NIK */}
        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">3. Nomor Induk Kependudukan (NIK)</span>
          <span className="font-mono font-bold text-slate-800">{patient?.nik || '-'}</span>
        </div>

        {/* 4. Nomor Identitas Lain WNA / Paspor / KITAS */}
        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">4. No. Identitas Lain WNA / Paspor / KITAS</span>
          <span className="font-mono text-slate-700">-</span>
        </div>

        {/* 5. Nama Ibu Kandung */}
        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">5. Nama Ibu Kandung</span>
          <span className="font-bold text-slate-800">{patient?.namaIbuKandung || 'Siti Aminah'}</span>
        </div>

        {/* 6. Tempat Lahir */}
        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">6. Tempat Lahir</span>
          <span className="font-bold text-slate-800">{patient?.pob || 'Jakarta'}</span>
        </div>

        {/* 7. Tanggal Lahir */}
        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">7. Tanggal Lahir</span>
          <span className="font-bold text-slate-800">{patient?.dob || '-'}</span>
        </div>

        {/* 8. Jenis Kelamin */}
        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">8. Jenis Kelamin</span>
          <span className="font-bold text-blue-700">{genderMap[patient?.gender || '1'] || '1. Laki-laki'}</span>
        </div>

        {/* 9. Agama */}
        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">9. Agama</span>
          <span className="font-bold text-slate-800">{patient?.religion || 'Islam'}</span>
        </div>

        {/* 10. Suku */}
        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">10. Suku</span>
          <span className="font-medium text-slate-800">{patient?.suku || 'Jawa / Betawi'}</span>
        </div>

        {/* 11. Bahasa yang Dikuasai */}
        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">11. Bahasa yang Dikuasai</span>
          <span className="font-medium text-slate-800">{patient?.language || 'Indonesia'}</span>
        </div>

        {/* 12. Alamat Lengkap */}
        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 md:col-span-2">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">12. Alamat Lengkap KTP</span>
          <span className="font-medium text-slate-800">{patient?.address || 'Jl. Arjuna Utara No. 9, Kebon Jeruk'}</span>
        </div>

        {/* 13 - 20: Wilayah KTP */}
        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">13 - 14. RT / RW</span>
          <span className="font-medium text-slate-800">RT 003 / RW 002</span>
        </div>
        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">15 - 16. Kelurahan / Kecamatan</span>
          <span className="font-medium text-slate-800">Duri Kepa / Kebon Jeruk</span>
        </div>
        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">17 - 20. Kota / Pos / Prov / Negara</span>
          <span className="font-medium text-slate-800">Jakarta Barat, 11510, DKI Jakarta, ID</span>
        </div>

        {/* 21 - 29: Alamat Domisili */}
        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 md:col-span-3">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">21 - 29. Alamat Domisili Lengkap & Wilayah</span>
          <span className="font-medium text-slate-800">{patient?.address || 'Jl. Arjuna Utara No. 9, RT 003/002, Duri Kepa, Kebon Jeruk, Jakarta Barat, 11510, DKI Jakarta, Indonesia'}</span>
        </div>

        {/* 30 - 31: Nomor Telepon */}
        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">30. No. Telepon Rumah</span>
          <span className="font-mono text-slate-700">021-5678901</span>
        </div>
        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">31. No. Telepon Selular Pasien</span>
          <span className="font-mono font-bold text-blue-700">{patient?.phone || '081289123456'}</span>
        </div>

        {/* 32 - 34: Pendidikan, Pekerjaan, Status Nikah */}
        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">32. Pendidikan</span>
          <span className="font-medium text-slate-800">{patient?.education || 'SMA / Sederajat'}</span>
        </div>
        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">33. Pekerjaan</span>
          <span className="font-medium text-slate-800">{patient?.job || 'Karyawan Swasta'}</span>
        </div>
        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">34. Status Pernikahan</span>
          <span className="font-medium text-slate-800">{patient?.maritalStatus || 'Menikah'}</span>
        </div>
      </div>
    </div>
  );
};

/**
 * BAGIAN II: CARA PEMBAYARAN
 */
export const CaraPembayaranSection: React.FC<{
  caraBayar: 'JKN' | 'Mandiri' | 'Asuransi lainnya';
  setCaraBayar: (val: 'JKN' | 'Mandiri' | 'Asuransi lainnya') => void;
  noKartu?: string;
  setNoKartu?: (val: string) => void;
}> = ({ caraBayar, setCaraBayar, noKartu = '0001234567890', setNoKartu }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
      <div className="border-b border-slate-200 pb-3 flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm">
          II
        </div>
        <div>
          <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide">
            BAGIAN II — CARA PEMBAYARAN
          </h4>
          <p className="text-[11px] text-slate-500 font-medium">
            Penetapan Skema Penjaminan & Pembiayaan Pelayanan Kesehatan Pasien
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { id: 'JKN', label: '1. JKN (BPJS Kesehatan / KIS)', desc: 'Penjaminan BPJS Kesehatan (PBI / Non-PBI)', color: 'border-emerald-500 bg-emerald-50/60 text-emerald-950' },
          { id: 'Mandiri', label: '2. Mandiri (Umum / Tunai)', desc: 'Pembayaran Pribadi / Out-of-pocket', color: 'border-blue-500 bg-blue-50/60 text-blue-950' },
          { id: 'Asuransi lainnya', label: '3. Asuransi Lainnya / Perusahaan', desc: 'Prudential, Allianz, Inhealth, Corporate', color: 'border-purple-500 bg-purple-50/60 text-purple-950' }
        ].map(item => {
          const isSelected = caraBayar === item.id;
          return (
            <label
              key={item.id}
              onClick={() => setCaraBayar(item.id as any)}
              className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-2 ${
                isSelected ? item.color + ' ring-2 ring-blue-400/30 font-bold' : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black">{item.label}</span>
                <input
                  type="radio"
                  name="caraPembayaran"
                  value={item.id}
                  checked={isSelected}
                  onChange={() => setCaraBayar(item.id as any)}
                  className="w-4 h-4 text-blue-600 cursor-pointer"
                />
              </div>
              <p className="text-[11px] text-slate-500 font-medium">{item.desc}</p>
            </label>
          );
        })}
      </div>

      {caraBayar === 'JKN' && (
        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-[10px] font-bold uppercase text-emerald-800">Nomor Kartu BPJS / NIK Terhubung:</span>
            <div className="font-mono font-bold text-emerald-900 text-sm">{noKartu}</div>
          </div>
          <span className="px-2.5 py-1 bg-emerald-600 text-white font-bold rounded-lg text-[11px]">
            E-Klaim INA-CBG Siap
          </span>
        </div>
      )}
    </div>
  );
};

/**
 * BAGIAN III: GENERAL CONSENT / PERSETUJUAN UMUM
 */
export const GeneralConsentSection: React.FC<{
  gcState: GeneralConsentState;
  setGcState: React.Dispatch<React.SetStateAction<GeneralConsentState>>;
  patient: Patient;
}> = ({ gcState, setGcState, patient }) => {
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const updateField = (key: keyof GeneralConsentState, value: any) => {
    setGcState(prev => ({ ...prev, [key]: value }));
  };

  const agreementList: { key: keyof GeneralConsentState; label: string; options: ('Setuju' | 'Tidak Setuju')[] | ('Ya' | 'Tidak')[] }[] = [
    { key: 'ketentuanPembayaran', label: '1. Informasi Ketentuan Pembayaran & Tarif Rumah Sakit', options: ['Setuju', 'Tidak Setuju'] },
    { key: 'hakKewajiban', label: '2. Informasi Hak dan Kewajiban Pasien Sesuai UU Kesehatan', options: ['Setuju', 'Tidak Setuju'] },
    { key: 'tataTertib', label: '3. Informasi Tata Tertib Rumah Sakit & Jam Kunjungan', options: ['Setuju', 'Tidak Setuju'] },
    { key: 'penterjemah', label: '4. Kebutuhan Penterjemah Bahasa Khusus / Bahasa Isyarat', options: ['Ya', 'Tidak'] },
    { key: 'rohaniawan', label: '5. Kebutuhan Bimbingan Rohaniawan / Pelayanan Rohani', options: ['Ya', 'Tidak'] },
    { key: 'pelepasanInformasi', label: '6. Pelepasan Informasi / Kerahasiaan Informasi Medis Pasien', options: ['Setuju', 'Tidak Setuju'] },
    { key: 'penunjangPenjamin', label: '7. Hasil Pemeriksaan Penunjang dapat diberikan kepada pihak penjamin', options: ['Setuju', 'Tidak Setuju'] },
    { key: 'penunjangPesertaDidik', label: '8. Hasil Pemeriksaan Penunjang dapat diakses oleh peserta didik / klinisi', options: ['Setuju', 'Tidak Setuju'] },
    { key: 'keluargaInformasi', label: '9. Anggota keluarga lain yang dapat diberikan informasi data pasien', options: ['Setuju', 'Tidak Setuju'] },
    { key: 'fasyankesRujukan', label: '10. Fasyankes tertentu dalam rangka rujukan & transfer perawatan', options: ['Setuju', 'Tidak Setuju'] },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
      <div className="border-b border-slate-200 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-sm">
            III
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide">
              BAGIAN III — GENERAL CONSENT / PERSETUJUAN UMUM
            </h4>
            <p className="text-[11px] text-slate-500 font-medium">
              Persetujuan Perawatan Umum, Hak Kewajiban, & Pelepasan Informasi Medis
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs font-mono font-bold text-slate-600">
            <span>Tgl: {gcState.tanggal}</span> &bull; <span>Jam: {gcState.jam} WIB</span>
          </div>
          <button
            type="button"
            onClick={() => setIsPrintModalOpen(true)}
            className="px-3 py-1.5 bg-purple-50 hover:bg-purple-600 text-purple-700 hover:text-white border border-purple-200 hover:border-purple-600 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Cetak Formulir General Consent (PDF / Print)"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Formulir</span>
          </button>
        </div>
      </div>

      {/* Identitas Ringkas Pasien */}
      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div>
          <span className="text-[10px] text-slate-400 font-bold uppercase">Nama Pasien:</span>
          <div className="font-bold text-slate-800 truncate">{patient?.name || '-'}</div>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 font-bold uppercase">No. RM:</span>
          <div className="font-mono font-bold text-blue-700">{patient?.noRM || '-'}</div>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 font-bold uppercase">Tanggal Lahir:</span>
          <div className="font-bold text-slate-800">{patient?.dob || '-'}</div>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 font-bold uppercase">Jenis Kelamin:</span>
          <div className="font-bold text-slate-800">{patient?.gender === 'M' || patient?.gender === '1' ? 'Laki-laki' : 'Perempuan'}</div>
        </div>
      </div>

      {/* 10 Butir Persetujuan Pasien */}
      <div className="space-y-2 text-xs divide-y divide-slate-100">
        <div className="text-[11px] font-black text-purple-900 uppercase tracking-wider pb-1">
          Klausul Pernyataan & Persetujuan Pasien:
        </div>
        {agreementList.map(item => (
          <div key={item.key} className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="font-semibold text-slate-800 max-w-xl">{item.label}</span>
            <div className="flex items-center gap-3 shrink-0">
              {item.options.map(opt => (
                <label key={opt} className="flex items-center gap-1.5 cursor-pointer text-xs font-bold">
                  <input
                    type="radio"
                    name={`gc_${item.key}`}
                    value={opt}
                    checked={gcState[item.key] === opt}
                    onChange={() => updateField(item.key, opt)}
                    className="w-3.5 h-3.5 text-purple-600"
                  />
                  <span className={gcState[item.key] === opt ? (opt === 'Setuju' || opt === 'Ya' ? 'text-emerald-700' : 'text-rose-700') : 'text-slate-500'}>
                    {opt}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Yang Membuat Pernyataan */}
      <div className="pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase block">Yang Membuat Pernyataan / Penanggung Jawab:</label>
          <input
            type="text"
            value={gcState.namaPJ}
            onChange={e => updateField('namaPJ', e.target.value)}
            className="w-full p-2 bg-white rounded-lg border border-slate-300 font-bold text-slate-800 focus:outline-none focus:border-purple-500"
            placeholder="Nama Penanggung Jawab..."
          />
        </div>
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase block">Petugas yang Memberi Penjelasan:</label>
          <input
            type="text"
            value={gcState.namaPetugas}
            onChange={e => updateField('namaPetugas', e.target.value)}
            className="w-full p-2 bg-white rounded-lg border border-slate-300 font-bold text-slate-800 focus:outline-none focus:border-purple-500"
            placeholder="Nama Petugas RMIK..."
          />
        </div>
      </div>

      {/* Modal Cetak Dokumen General Consent */}
      <CetakGeneralConsentModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        consent={{
          id: `GC-${patient?.noRM || 'REG'}`,
          regId: `REG-${patient?.noRM || '001'}`,
          date: gcState.tanggal,
          patientSign: gcState.namaPJ || patient?.name || 'Pasien / Wali',
          witnessSign: gcState.namaPetugas || 'Petugas Admisi RMIK',
          status: 'Signed'
        }}
        patient={patient}
        registration={null}
      />
    </div>
  );
};
