import React, { useRef } from 'react';
import { Modal } from './Modal';
import { InformedConsent, Patient, Registration, CPPT, MedicalRecord, User } from '../types';
import { Printer, CheckCircle2, ShieldCheck, QrCode, FileText, UserCheck } from 'lucide-react';
import esaUnggulEmblem from '../assets/logo-esa-unggul-emblem.png';
import { RmikLogo } from './Logos';

interface CetakInformedConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  consent: InformedConsent | null;
  patient: Patient | null;
  registration: Registration | null;
  cpptItem?: CPPT | null;
  mrItem?: MedicalRecord | null;
  doctor?: User | null;
}

export const CetakInformedConsentModal: React.FC<CetakInformedConsentModalProps> = ({
  isOpen,
  onClose,
  consent,
  patient,
  registration,
  cpptItem,
  mrItem,
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
  const doctorName = doctor?.name || 'dr. Spesialis Penanggung Jawab';
  const diagnosisText = mrItem?.diagnosis || cpptItem?.assessment || 'Diagnosis Klinis Terkonfirmasi';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cetak Formulir Informed Consent (Persetujuan Tindakan Medis)"
      maxWidth="max-w-4xl"
    >
      <div className="space-y-4">
        {/* Printable Paper Document (A4 Styling) */}
        <div
          ref={printContentRef}
          id="printable-informed-consent"
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
              <span className="text-xs font-mono font-black text-blue-900 block">RM.07 / IC-UEU</span>
              <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-mono font-bold text-slate-700 inline-block mt-0.5">
                Ref: {consent.cpptId}
              </span>
            </div>
          </div>

          {/* JUDUL FORMULIR */}
          <div className="text-center my-3 pb-2 border-b border-slate-200">
            <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-slate-900">
              PERSETUJUAN TINDAKAN KEDOKTERAN / MEDIS
            </h2>
            <p className="text-[11px] font-semibold text-slate-600 italic">
              (INFORMED CONSENT FOR MEDICAL / SURGICAL PROCEDURE)
            </p>
            <div className="text-[10px] font-mono text-slate-500 mt-1">
              Nomor Registrasi Informed Consent: <strong className="text-blue-900 font-mono">{consent.id}</strong>
            </div>
          </div>

          {/* IDENTITAS PASIEN */}
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 mb-4 text-xs">
            <div className="text-[11px] font-black uppercase text-blue-900 mb-2 flex items-center gap-1.5 border-b border-slate-200/80 pb-1">
              <UserCheck className="w-3.5 h-3.5" />
              IDENTITAS PASIEN
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
                <span className="text-[10px] text-slate-500 block uppercase font-semibold">Tgl Lahir / Usia:</span>
                <span className="font-medium text-slate-800">{patient.birthDate} ({patient.age} Th)</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-semibold">Jenis Kelamin:</span>
                <span className="font-medium text-slate-800">{patient.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-[10px] text-slate-500 block uppercase font-semibold">Unit / Ruang Pelayanan:</span>
                <span className="font-medium text-slate-800">{registration?.poli || registration?.type || 'Poliklinik Rawat Jalan'}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-[10px] text-slate-500 block uppercase font-semibold">Dokter Penanggung Jawab (DPJP):</span>
                <span className="font-bold text-slate-900">{doctorName}</span>
              </div>
            </div>
          </div>

          {/* TABEL PEMBERIAN INFORMASI TINDAKAN (SESUAI PERMENKES & KARS) */}
          <div className="mb-4">
            <div className="text-[11px] font-black uppercase text-slate-900 mb-1.5 flex items-center justify-between">
              <span>I. PEMBERIAN INFORMASI TINDAKAN KEDOKTERAN</span>
              <span className="text-[10px] font-normal text-slate-500 italic">Standar Permenkes No. 290/2008 & KARS</span>
            </div>

            <table className="w-full text-left text-xs border border-slate-300 border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-800 border-b border-slate-300 font-bold text-[11px]">
                  <th className="p-2 border-r border-slate-300 w-8 text-center">NO</th>
                  <th className="p-2 border-r border-slate-300 w-48">JENIS INFORMASI</th>
                  <th className="p-2 border-r border-slate-300">ISI INFORMASI YANG DIJELASKAN</th>
                  <th className="p-2 w-20 text-center">TANDA (✓)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-[11.5px]">
                <tr>
                  <td className="p-2 border-r border-slate-300 text-center font-bold">1</td>
                  <td className="p-2 border-r border-slate-300 font-semibold">Diagnosis (WD & DD)</td>
                  <td className="p-2 border-r border-slate-300">{diagnosisText}</td>
                  <td className="p-2 text-center text-emerald-700 font-bold">✓</td>
                </tr>
                <tr>
                  <td className="p-2 border-r border-slate-300 text-center font-bold">2</td>
                  <td className="p-2 border-r border-slate-300 font-semibold">Dasar Diagnosis</td>
                  <td className="p-2 border-r border-slate-300">Anamnesis klinis, pemeriksaan fisik, dan pemeriksaan penunjang</td>
                  <td className="p-2 text-center text-emerald-700 font-bold">✓</td>
                </tr>
                <tr className="bg-blue-50/40">
                  <td className="p-2 border-r border-slate-300 text-center font-bold text-blue-900">3</td>
                  <td className="p-2 border-r border-slate-300 font-bold text-blue-900">Tindakan Kedokteran</td>
                  <td className="p-2 border-r border-slate-300 font-bold text-slate-900">{consent.action}</td>
                  <td className="p-2 text-center text-emerald-700 font-bold">✓</td>
                </tr>
                <tr>
                  <td className="p-2 border-r border-slate-300 text-center font-bold">4</td>
                  <td className="p-2 border-r border-slate-300 font-semibold">Indikasi Tindakan</td>
                  <td className="p-2 border-r border-slate-300">Penegakan diagnosis pasti, intervensi terapeutik & penatalaksanaan klinis</td>
                  <td className="p-2 text-center text-emerald-700 font-bold">✓</td>
                </tr>
                <tr>
                  <td className="p-2 border-r border-slate-300 text-center font-bold">5</td>
                  <td className="p-2 border-r border-slate-300 font-semibold">Tata Cara / Prosedur</td>
                  <td className="p-2 border-r border-slate-300">Dilakukan sesuai Standar Prosedur Operasional (SPO) RS dengan anestesi/sedasi sesuai indikasi</td>
                  <td className="p-2 text-center text-emerald-700 font-bold">✓</td>
                </tr>
                <tr>
                  <td className="p-2 border-r border-slate-300 text-center font-bold">6</td>
                  <td className="p-2 border-r border-slate-300 font-semibold">Tujuan Tindakan</td>
                  <td className="p-2 border-r border-slate-300">Optimalisasi kondisi kesehatan, evaluasi patologi, serta pemulihan fungsi organ</td>
                  <td className="p-2 text-center text-emerald-700 font-bold">✓</td>
                </tr>
                <tr className="bg-amber-50/40">
                  <td className="p-2 border-r border-slate-300 text-center font-bold text-amber-900">7</td>
                  <td className="p-2 border-r border-slate-300 font-bold text-amber-900">Risiko yang Dijelaskan</td>
                  <td className="p-2 border-r border-slate-300 text-slate-800">{consent.risk || 'Risiko umum prosedur invasif, nyeri, perdarahan minimal'}</td>
                  <td className="p-2 text-center text-emerald-700 font-bold">✓</td>
                </tr>
                <tr className="bg-amber-50/40">
                  <td className="p-2 border-r border-slate-300 text-center font-bold text-amber-900">8</td>
                  <td className="p-2 border-r border-slate-300 font-bold text-amber-900">Komplikasi yang Mungkin Timbul</td>
                  <td className="p-2 border-r border-slate-300 text-slate-800">{consent.complication || 'Infeksi sekunder, hematoma, reaksi alergi obat/zat kontras'}</td>
                  <td className="p-2 text-center text-emerald-700 font-bold">✓</td>
                </tr>
                <tr>
                  <td className="p-2 border-r border-slate-300 text-center font-bold">9</td>
                  <td className="p-2 border-r border-slate-300 font-semibold">Prognosis</td>
                  <td className="p-2 border-r border-slate-300">Dubia ad Bonam (Tergantung respons klinis dan kondisi fisiologis pasien)</td>
                  <td className="p-2 text-center text-emerald-700 font-bold">✓</td>
                </tr>
                <tr>
                  <td className="p-2 border-r border-slate-300 text-center font-bold">10</td>
                  <td className="p-2 border-r border-slate-300 font-semibold">Alternatif & Risiko Bila Ditolak</td>
                  <td className="p-2 border-r border-slate-300">Terapi medikamentosa konservatif; risiko perburukan kondisi jika tindakan tidak dilakukan</td>
                  <td className="p-2 text-center text-emerald-700 font-bold">✓</td>
                </tr>
              </tbody>
            </table>

            <div className="mt-2 text-[10px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-200">
              Dengan ini menyatakan bahwa dokter pelaksana telah menerangkan hal-hal di atas secara benar dan jelas serta memberikan kesempatan untuk bertanya, dan pasien/keluarga telah memahaminya.
            </div>
          </div>

          {/* KLAUSUL HUKUM PERSETUJUAN (LEGAL CONSENT STATEMENT) */}
          <div className="border border-slate-300 rounded-xl p-3.5 mb-4 text-xs bg-white space-y-2">
            <div className="font-black text-slate-900 uppercase text-[11px] flex items-center gap-1.5 border-b border-slate-200 pb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              II. PERNYATAAN PERSETUJUAN TINDAKAN KEDOKTERAN
            </div>
            <p className="text-[11.5px] leading-relaxed text-slate-700">
              Yang bertanda tangan di bawah ini, saya menyatakan bahwa saya telah memahami penjelasan yang diberikan oleh dokter sebagaimana tercantum pada tabel di atas. Saya menyetujui dilakukannya tindakan medis berupa <strong>{consent.action}</strong> terhadap diri saya / pasien bernama <strong>{patient.name}</strong> (No. RM: <strong>{patient.noRM}</strong>).
            </p>
            <p className="text-[11px] leading-relaxed text-slate-600 italic">
              Persetujuan ini diberikan secara sadar, tanpa paksaan dari pihak manapun, dengan memahami sepenuhnya segala manfaat, risiko, serta kemungkinan komplikasi yang dapat terjadi selama atau sesudah tindakan medis dilakukan.
            </p>
          </div>

          {/* TANDA TANGAN 4 PIHAK */}
          <div className="mt-4 pt-3 border-t border-slate-300">
            <div className="text-right text-[11px] text-slate-600 mb-3">
              Jakarta Barat, {formattedDate} &bull; Pukul {currentTime} WIB
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
              {/* Dokter DPJP */}
              <div className="flex flex-col justify-between border border-slate-200 p-2.5 rounded-xl bg-slate-50/50">
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Dokter Penanggung Jawab (DPJP)
                </span>
                <div className="my-2 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
                    <QrCode className="w-9 h-9" />
                  </div>
                  <span className="text-[9px] font-mono text-emerald-700 font-bold mt-1">✓ Terverifikasi RME</span>
                </div>
                <div className="border-t border-slate-300 pt-1">
                  <strong className="text-[11px] text-slate-900 block font-bold">{doctorName}</strong>
                  <span className="text-[9.5px] text-slate-500 block">SIP. 446.1/1092/Dinkes</span>
                </div>
              </div>

              {/* Pasien / Wali */}
              <div className="flex flex-col justify-between border border-slate-200 p-2.5 rounded-xl bg-slate-50/50">
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Pasien / Keluarga Pemberi Persetujuan
                </span>
                <div className="my-2 flex flex-col items-center justify-center h-12">
                  <span className="text-xs italic text-slate-400 font-serif">[ Tanda Tangan Sah ]</span>
                </div>
                <div className="border-t border-slate-300 pt-1">
                  <strong className="text-[11px] text-slate-900 block font-bold">{patient.name}</strong>
                  <span className="text-[9.5px] text-slate-500 block">( Pasien Sendiri / Wali Sah )</span>
                </div>
              </div>

              {/* Saksi 1 (Perawat RS) */}
              <div className="flex flex-col justify-between border border-slate-200 p-2.5 rounded-xl bg-slate-50/50">
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Saksi I (Tenaga Medis / Perawat)
                </span>
                <div className="my-2 flex flex-col items-center justify-center h-12">
                  <span className="text-xs italic text-slate-400 font-serif">[ Tanda Tangan ]</span>
                </div>
                <div className="border-t border-slate-300 pt-1">
                  <strong className="text-[11px] text-slate-900 block font-bold">Ns. Ratna Dewi, S.Kep</strong>
                  <span className="text-[9.5px] text-slate-500 block">NIP. 19890412201503</span>
                </div>
              </div>

              {/* Saksi 2 (Keluarga) */}
              <div className="flex flex-col justify-between border border-slate-200 p-2.5 rounded-xl bg-slate-50/50">
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Saksi II (Keluarga Pasien)
                </span>
                <div className="my-2 flex flex-col items-center justify-center h-12">
                  <span className="text-xs italic text-slate-400 font-serif">[ Tanda Tangan ]</span>
                </div>
                <div className="border-t border-slate-300 pt-1">
                  <strong className="text-[11px] text-slate-900 block font-bold">( Keluarga Pasien )</strong>
                  <span className="text-[9.5px] text-slate-500 block">Saksi Pihak Keluarga</span>
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER CATATAN HUKUM REKAM MEDIS */}
          <div className="mt-4 pt-2 border-t border-dashed border-slate-300 flex flex-col sm:flex-row items-center justify-between text-[9.5px] text-slate-400">
            <span>Sistem Informasi Manajemen Rumah Sakit (SIMRS Esa Unggul) &bull; Dokumen Sah Rekam Medis Elektronik</span>
            <span className="font-mono">ID Consent: {consent.id} &bull; Status: {consent.status}</span>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
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
              <span>Cetak Formulir Informed Consent</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
