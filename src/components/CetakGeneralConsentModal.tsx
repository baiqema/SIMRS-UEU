import React, { useRef } from 'react';
import { Modal } from './Modal';
import { GeneralConsent, Patient, Registration, User } from '../types';
import { Printer, CheckCircle2, ShieldCheck, QrCode, FileSignature, UserCheck, HeartHandshake } from 'lucide-react';
import esaUnggulEmblem from '../assets/logo-esa-unggul-emblem.png';
import { RmikLogo } from './Logos';

interface CetakGeneralConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  consent: GeneralConsent | null;
  patient: Patient | null;
  registration: Registration | null;
  doctor?: User | null;
}

export const CetakGeneralConsentModal: React.FC<CetakGeneralConsentModalProps> = ({
  isOpen,
  onClose,
  consent,
  patient,
  registration,
  doctor
}) => {
  const printContentRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !consent || !patient) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = consent.date
    ? new Date(consent.date).toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    : new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

  const currentTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  const caraBayarText = registration?.caraBayar || patient.paymentType || 'Umum';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cetak Dokumen General Consent (Persetujuan Umum Pelayanan)"
      maxWidth="max-w-4xl"
    >
      <div className="space-y-4">
        {/* Printable Paper Document (A4 Styling) */}
        <div
          ref={printContentRef}
          id="printable-general-consent"
          className="bg-white p-6 sm:p-8 rounded-xl border border-slate-300 shadow-xs text-slate-800 font-sans print:border-none print:p-0 print:shadow-none"
        >
          {/* KOP RUMAH SAKIT */}
          <div className="border-b-2 border-slate-900 pb-3 mb-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Dual Logo: Esa Unggul & RMIK */}
              <div className="flex items-center gap-2 shrink-0">
                <img
                  src={esaUnggulEmblem}
                  alt="Logo Universitas Esa Unggul"
                  className="w-12 h-12 object-contain"
                  referrerPolicy="no-referrer"
                />
                <div className="w-px h-10 bg-slate-300"></div>
                <RmikLogo size="md" showText={false} className="w-11 h-11" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-tight uppercase">
                  RS UNIVERSITAS ESA UNGGUL JAKARTA
                </h1>
                <p className="text-[11px] text-slate-600 leading-tight">
                  Pelayanan Medis Terintegrasi &bull; Akreditasi Paripurna KARS &bull; Rekam Medis Elektronik
                </p>
                <p className="text-[10px] text-slate-500 leading-tight">
                  Jl. Arjuna Utara No.9, Kebon Jeruk, Jakarta Barat 11510 &bull; Telp: (021) 5678-9999 &bull; Fax: (021) 5678-9998
                </p>
              </div>
            </div>

            <div className="text-right shrink-0 border-l border-slate-200 pl-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">FORMULIR REKAM MEDIS</span>
              <span className="text-xs font-mono font-black text-blue-900 block">RM.01 / GC-UEU</span>
              <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-mono font-bold text-slate-700 inline-block mt-0.5">
                Reg: {consent.regId}
              </span>
            </div>
          </div>

          {/* JUDUL FORMULIR */}
          <div className="text-center my-3 pb-2 border-b border-slate-200">
            <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-slate-900">
              PERSETUJUAN UMUM PELAYANAN KESEHATAN (GENERAL CONSENT)
            </h2>
            <p className="text-[11px] font-semibold text-slate-600 italic">
              Standardized General Consent for Healthcare & Hospital Admission (Permenkes & STARKES)
            </p>
            <div className="text-[10px] font-mono text-slate-500 mt-1 flex items-center justify-center gap-3">
              <span>ID Consent: <strong className="text-blue-900 font-mono">{consent.id}</strong></span>
              <span>&bull;</span>
              <span>No. Registrasi: <strong className="text-slate-800 font-mono">{consent.regId}</strong></span>
              <span>&bull;</span>
              <span>Status: <strong className="text-emerald-700 uppercase font-bold">{consent.status}</strong></span>
            </div>
          </div>

          {/* IDENTITAS PASIEN & PENANGGUNG JAWAB */}
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 mb-4 text-xs">
            <div className="text-[11px] font-black uppercase text-blue-900 mb-2 flex items-center gap-1.5 border-b border-slate-200/80 pb-1">
              <UserCheck className="w-3.5 h-3.5" />
              IDENTITAS PASIEN & PENANGGUNG JAWAB
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-semibold">Nama Pasien:</span>
                <span className="font-bold text-slate-900">{patient.name}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-semibold">Nomor RM:</span>
                <span className="font-mono font-black text-blue-900">{patient.noRM}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-semibold">NIK Pasien:</span>
                <span className="font-mono font-medium text-slate-800">{patient.nik || '-'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-semibold">Tgl Lahir / Usia:</span>
                <span className="font-medium text-slate-800">{patient.birthDate} ({patient.age} Th)</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-semibold">Jenis Kelamin:</span>
                <span className="font-medium text-slate-800">{patient.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-semibold">Penjamin / Cara Bayar:</span>
                <span className="font-bold text-slate-800">
                  {caraBayarText} {patient.bpjsNumber ? `(${patient.bpjsNumber})` : ''}
                </span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-[10px] text-slate-500 block uppercase font-semibold">Unit Pelayanan:</span>
                <span className="font-medium text-slate-800">
                  {registration?.poli || registration?.type || 'Poliklinik Rawat Jalan'}
                  {doctor?.name ? ` &bull; DPJP: ${doctor.name}` : ''}
                </span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-[10px] text-slate-500 block uppercase font-semibold">Nama Penanggung Jawab / Wali:</span>
                <span className="font-bold text-slate-900">{consent.patientSign || patient.name} (Pasien / Wali)</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-[10px] text-slate-500 block uppercase font-semibold">Alamat Domisili Pasien:</span>
                <span className="font-medium text-slate-800 truncate block">{patient.address || 'Jakarta'}</span>
              </div>
            </div>
          </div>

          {/* 7 BUTIR PERSETUJUAN UMUM (GENERAL CONSENT KARS / STARKES) */}
          <div className="space-y-3 mb-4 text-xs">
            <div className="text-[11px] font-black uppercase text-slate-900 flex items-center justify-between border-b border-slate-200 pb-1">
              <span>BUTIR-BUTIR PERNYATAAN & PERSETUJUAN UMUM (GENERAL CONSENT)</span>
              <span className="text-[10px] font-normal text-slate-500 italic">Sesuai Standar Akreditasi KARS / STARKES</span>
            </div>

            {/* Poin 1 */}
            <div className="p-2.5 rounded-lg border border-slate-200 bg-white space-y-1">
              <div className="font-bold text-slate-900 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px] flex items-center justify-center shrink-0">1</span>
                <span>HAK DAN KEWAJIBAN PASIEN</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-600 pl-7">
                Saya menyatakan telah membaca, menerima informasi leaflet/penjelasan tertulis, dan memahami seluruh hak serta kewajiban pasien sesuai ketentuan Undang-Undang Republik Indonesia No. 17 Tahun 2023 tentang Kesehatan dan peraturan menteri terkait.
              </p>
            </div>

            {/* Poin 2 */}
            <div className="p-2.5 rounded-lg border border-slate-200 bg-white space-y-1">
              <div className="font-bold text-slate-900 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px] flex items-center justify-center shrink-0">2</span>
                <span>PERSETUJUAN PELAYANAN KESEHATAN UMUM & DIAGNOSTIK NON-INVASIF</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-600 pl-7">
                Saya menyetujui untuk mendapatkan pemeriksaan klinis, asuhan keperawatan rutin, monitoring tanda vital (TTV), pemasangan infus intravena, pemberian obat oral maupun injeksi sesuai resep DPJP, serta pemeriksaan laboratorium darah/urin dan radiologi diagnostik dasar (Rontgen/EKG). <em>(Tindakan bedah dan intervensi medis berisiko tinggi wajib dilengkapi dengan Informed Consent tersendiri).</em>
              </p>
            </div>

            {/* Poin 3 */}
            <div className="p-2.5 rounded-lg border border-slate-200 bg-white space-y-1">
              <div className="font-bold text-slate-900 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px] flex items-center justify-center shrink-0">3</span>
                <span>KERAHASIAAN INFORMASI MEDIS & PELEPASAN REKAM MEDIS</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-600 pl-7">
                Saya memberikan wewenang kepada RS Universitas Esa Unggul untuk membuka data rekam medis saya sebatas yang diperlukan kepada pihak penjamin pembiayaan (BPJS Kesehatan / Asuransi Swasta), faskes rujukan rujukan transfer pelayanan, serta tenaga medis yang terlibat langsung demi kesinambungan perawatan saya.
              </p>
            </div>

            {/* Poin 4 */}
            <div className="p-2.5 rounded-lg border border-slate-200 bg-white space-y-1">
              <div className="font-bold text-slate-900 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px] flex items-center justify-center shrink-0">4</span>
                <span>KETENTUAN PEMBAYARAN & TANGGUNG JAWAB FINANSIAL</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-600 pl-7">
                Saya memahami ketentuan tarif pelayanan rumah sakit dan tata cara klaim pembiayaan ({caraBayarText}). Saya bersedia menyelesaikan seluruh kewajiban administrasi keuangan atas pelayanan yang diberikan, termasuk selisih biaya tarif (iur biaya/co-payment) apabila terjadi kenaikan kelas rawat inap atau pelayanan di luar pertanggungan penjamin.
              </p>
            </div>

            {/* Poin 5 */}
            <div className="p-2.5 rounded-lg border border-slate-200 bg-white space-y-1">
              <div className="font-bold text-slate-900 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px] flex items-center justify-center shrink-0">5</span>
                <span>TATA TERTIB RUMAH SAKIT & PENYIMPANAN BARANG PRIBADI</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-600 pl-7">
                Saya dan keluarga bersedia mematuhi tata tertib rumah sakit (jadwal jam besuk, larangan merokok di seluruh lingkungan RS, larangan mengambil foto/video privasi tanpa izin). Saya memahami rumah sakit tidak bertanggung jawab atas kehilangan barang berharga pribadi yang tidak dititipkan secara resmi pada fasilitas loker penyimpanan rumah sakit.
              </p>
            </div>

            {/* Poin 6 */}
            <div className="p-2.5 rounded-lg border border-slate-200 bg-white space-y-1">
              <div className="font-bold text-slate-900 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px] flex items-center justify-center shrink-0">6</span>
                <span>KEINGINAN KHUSUS (PRIVASI, ROHANIAWAN & PENERJEMAH)</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-600 pl-7">
                Pasien berhak meminta perlindungan privasi khusus selama masa perawatan, mendapatkan fasilitasi pelayanan bimbingan kerohanian sesuai keyakinan, atau bantuan penerjemah bahasa bila dibutuhkan.
              </p>
            </div>
          </div>

          {/* KLAUSUL PERNYATAAN KESEPAKATAN */}
          <div className="border border-slate-300 rounded-xl p-3 mb-4 text-xs bg-slate-50 space-y-1">
            <div className="font-black text-slate-900 uppercase text-[11px] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              PERNYATAAN PERSETUJUAN PASIEN / PENANGGUNG JAWAB
            </div>
            <p className="text-[11px] leading-relaxed text-slate-700">
              Dengan menandatangani dokumen ini, saya menyatakan telah membaca, memahami, dan menyetujui seluruh ketentuan dalam General Consent ini secara sadar tanpa paksaan dari pihak manapun untuk dipergunakan sebagaimana mestinya.
            </p>
          </div>

          {/* TANDA TANGAN 3 PIHAK */}
          <div className="mt-4 pt-3 border-t border-slate-300">
            <div className="text-right text-[11px] text-slate-600 mb-3">
              Jakarta Barat, {formattedDate} &bull; Pukul {currentTime} WIB
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center text-xs">
              {/* Pasien / Wali */}
              <div className="flex flex-col justify-between border border-slate-200 p-2.5 rounded-xl bg-slate-50/50">
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Pasien / Penanggung Jawab Pasien
                </span>
                <div className="my-2 flex flex-col items-center justify-center h-12">
                  <span className="text-xs italic text-slate-400 font-serif">[ Tanda Tangan ]</span>
                </div>
                <div className="border-t border-slate-300 pt-1">
                  <strong className="text-[11px] text-slate-900 block font-bold">{consent.patientSign || patient.name}</strong>
                  <span className="text-[9.5px] text-slate-500 block">( Pasien / Wali Sah )</span>
                </div>
              </div>

              {/* Saksi Petugas RS */}
              <div className="flex flex-col justify-between border border-slate-200 p-2.5 rounded-xl bg-slate-50/50">
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Petugas Admisi / Pendaftaran (Saksi RS)
                </span>
                <div className="my-2 flex flex-col items-center">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
                    <QrCode className="w-7 h-7" />
                  </div>
                  <span className="text-[9px] font-mono text-emerald-700 font-bold mt-0.5">✓ Terverifikasi RME</span>
                </div>
                <div className="border-t border-slate-300 pt-1">
                  <strong className="text-[11px] text-slate-900 block font-bold">{consent.witnessSign || 'Petugas Admisi RMIK'}</strong>
                  <span className="text-[9.5px] text-slate-500 block">Bagian Pendaftaran & RME RS</span>
                </div>
              </div>

              {/* Saksi Keluarga */}
              <div className="flex flex-col justify-between border border-slate-200 p-2.5 rounded-xl bg-slate-50/50">
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Saksi Pihak Keluarga Pasien
                </span>
                <div className="my-2 flex flex-col items-center justify-center h-12">
                  <span className="text-xs italic text-slate-400 font-serif">[ Tanda Tangan ]</span>
                </div>
                <div className="border-t border-slate-300 pt-1">
                  <strong className="text-[11px] text-slate-900 block font-bold">( Keluarga / Kerabat )</strong>
                  <span className="text-[9.5px] text-slate-500 block">Saksi Pihak Keluarga</span>
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER CATATAN HUKUM REKAM MEDIS */}
          <div className="mt-4 pt-2 border-t border-dashed border-slate-300 flex flex-col sm:flex-row items-center justify-between text-[9.5px] text-slate-400">
            <span>Sistem Informasi Manajemen Rumah Sakit (SIMRS Esa Unggul) &bull; Dokumen Sah Rekam Medis Elektronik</span>
            <span className="font-mono">ID Consent: {consent.id} &bull; No. Reg: {consent.regId}</span>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Tutup
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Dokumen General Consent</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
