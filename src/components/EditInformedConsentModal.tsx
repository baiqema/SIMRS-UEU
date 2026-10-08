import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { DigitalSignaturePad } from './DigitalSignaturePad';
import { useApp } from '../context/AppContext';
import { InformedConsent, Patient, Registration, User, CPPT } from '../types';
import Swal from 'sweetalert2';
import {
  Handshake, CheckCircle2, ShieldAlert, Printer, Save,
  Calendar, User as UserIcon, Stethoscope, AlertTriangle, FileText
} from 'lucide-react';

interface EditInformedConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  consent: InformedConsent | null;
  patient: Patient | null;
  registration?: Registration | null;
  doctor?: User | null;
  cpptItem?: CPPT | null;
  onOpenPrint?: (ic: InformedConsent) => void;
}

export const EditInformedConsentModal: React.FC<EditInformedConsentModalProps> = ({
  isOpen,
  onClose,
  consent,
  patient,
  registration,
  doctor,
  cpptItem,
  onOpenPrint
}) => {
  const { updateInformedConsent, user } = useApp();

  const [date, setDate] = useState('');
  const [consentType, setConsentType] = useState<'Persetujuan' | 'Penolakan'>('Persetujuan');
  const [action, setAction] = useState('');
  const [diagnosisInfo, setDiagnosisInfo] = useState('');
  const [tataCaraTindakan, setTataCaraTindakan] = useState('');
  const [tujuanTindakan, setTujuanTindakan] = useState('');
  const [risk, setRisk] = useState('');
  const [complication, setComplication] = useState('');
  const [prognosis, setPrognosis] = useState('');
  const [alternatifRisiko, setAlternatifRisiko] = useState('');
  const [status, setStatus] = useState<'Approved' | 'Pending'>('Approved');

  // Parties
  const [patientSignName, setPatientSignName] = useState('');
  const [patientRelation, setPatientRelation] = useState('Pasien Sendiri');
  const [doctorName, setDoctorName] = useState('');
  const [witnessName, setWitnessName] = useState('Ns. Ratna Dewi, S.Kep');

  // Signatures
  const [doctorSignatureImage, setDoctorSignatureImage] = useState('');
  const [patientSignatureImage, setPatientSignatureImage] = useState('');
  const [witnessSignatureImage, setWitnessSignatureImage] = useState('');

  useEffect(() => {
    if (consent && isOpen) {
      setDate(consent.date || new Date().toISOString().split('T')[0]);
      setConsentType(consent.informedConsentType || 'Persetujuan');
      setAction(consent.action || '');
      setDiagnosisInfo(consent.diagnosisInfo || (cpptItem?.assessment ? `Diagnosis: ${cpptItem.assessment}` : 'Diagnosis medis sesuai indikasi klinis'));
      setTataCaraTindakan(consent.tataCaraTindakan || 'Dilakukan sesuai Standar Prosedur Operasional (SPO) RS dengan anestesi/sedasi sesuai indikasi');
      setTujuanTindakan(consent.tujuanTindakan || 'Optimalisasi kondisi kesehatan, evaluasi patologi, serta pemulihan fungsi organ');
      setRisk(consent.risk || 'Risiko umum prosedur invasif, nyeri, perdarahan minimal');
      setComplication(consent.complication || 'Infeksi sekunder, hematoma, reaksi alergi obat/zat kontras');
      setPrognosis(consent.prognosis || 'Dubia ad Bonam (Tergantung respons klinis dan kondisi fisiologis pasien)');
      setAlternatifRisiko(consent.alternatifRisiko || 'Terapi medikamentosa konservatif; risiko perburukan kondisi jika tindakan tidak dilakukan');
      setStatus(consent.status || 'Approved');

      setPatientSignName(consent.patientSignName || patient?.name || '');
      setPatientRelation(consent.patientRelation || 'Pasien Sendiri');
      setDoctorName(doctor?.name || user?.name || 'Dr. Budi Santoso, Sp.PD');
      setWitnessName(consent.witnessName || 'Ns. Ratna Dewi, S.Kep');

      setDoctorSignatureImage(consent.doctorSignatureImage || '');
      setPatientSignatureImage(consent.patientSignatureImage || '');
      setWitnessSignatureImage(consent.witnessSignatureImage || '');
    }
  }, [consent, isOpen, patient, doctor, user, cpptItem]);

  if (!consent || !patient) return null;

  const handleSave = (andPrint: boolean = false) => {
    if (!action.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Tindakan Medis Kosong',
        text: 'Harap sebutkan nama tindakan medis yang direncanakan.',
        confirmButtonColor: '#2563eb'
      });
      return;
    }

    const updatedData: Partial<InformedConsent> = {
      date,
      informedConsentType: consentType,
      action,
      diagnosisInfo,
      tataCaraTindakan,
      tujuanTindakan,
      risk,
      complication,
      prognosis,
      alternatifRisiko,
      status: patientSignatureImage ? 'Approved' : status,
      patientSignName,
      patientRelation,
      witnessName,
      doctorSignatureImage,
      patientSignatureImage,
      witnessSignatureImage
    };

    updateInformedConsent(consent.id, updatedData);

    const mergedConsent: InformedConsent = {
      ...consent,
      ...updatedData
    };

    Swal.fire({
      icon: 'success',
      title: 'Informed Consent Disimpan',
      text: 'Rincian informed consent dan tanda tangan elektronik berhasil diperbarui.',
      timer: 1600,
      showConfirmButton: false
    });

    onClose();

    if (andPrint && onOpenPrint) {
      setTimeout(() => {
        onOpenPrint(mergedConsent);
      }, 250);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit & Tanda Tangan Elektronik Informed Consent"
      size="2xl"
    >
      <div className="space-y-5 text-slate-800">
        {/* Info Banner Pasien */}
        <div className="p-4 bg-amber-50/70 border border-amber-200/90 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
              <Handshake className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">{patient.name}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-amber-100 text-amber-900 rounded-md font-bold">
                  {patient.noRM}
                </span>
                <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full font-bold">
                  {consentType === 'Persetujuan' ? 'Persetujuan Tindakan' : 'Penolakan Tindakan'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Ref. CPPT: <span className="font-mono font-medium text-slate-700">{consent.cpptId}</span> &bull; 
                Dokter DPJP: <span className="font-medium text-slate-800">{doctorName}</span> &bull; 
                Layanan: <span className="font-medium text-blue-700">{registration?.type || 'Rawat Jalan'}</span>
              </p>
            </div>
          </div>
          <div className="text-right sm:border-l sm:border-amber-200 sm:pl-3">
            <span className="text-[10px] text-slate-500 block uppercase font-bold">ID Consent</span>
            <span className="font-mono font-bold text-amber-800">{consent.id}</span>
          </div>
        </div>

        {/* Jenis Dokumen Selector */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl">
          <button
            type="button"
            onClick={() => setConsentType('Persetujuan')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              consentType === 'Persetujuan'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" /> Pernyataan PERSETUJUAN Tindakan
          </button>
          <button
            type="button"
            onClick={() => setConsentType('Penolakan')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              consentType === 'Penolakan'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <AlertTriangle className="w-4 h-4" /> Pernyataan PENOLAKAN Tindakan
          </button>
        </div>

        {/* Form Inputs Grid: Butir Informasi Medis & Tindakan */}
        <div className="space-y-3.5 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Tanggal Persetujuan <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Dokter Penanggung Jawab (DPJP) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Stethoscope className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={doctorName}
                  onChange={e => setDoctorName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Rencana Tindakan Medis / Operatif <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={action}
              onChange={e => setAction(e.target.value)}
              placeholder="Contoh: Endoskopi Saluran Cerna / Pemasangan Kateter Vena Sentral / Laparotomi Eksplorasi"
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold text-blue-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Diagnosis & Indikasi Tindakan
              </label>
              <input
                type="text"
                value={diagnosisInfo}
                onChange={e => setDiagnosisInfo(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Tata Cara / Prosedur Tindakan
              </label>
              <input
                type="text"
                value={tataCaraTindakan}
                onChange={e => setTataCaraTindakan(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Potensi Risiko yang Dijelaskan <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={risk}
                onChange={e => setRisk(e.target.value)}
                placeholder="Contoh: Nyeri pasca tindakan, perdarahan ringan, mual"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Komplikasi yang Mungkin Timbul <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={complication}
                onChange={e => setComplication(e.target.value)}
                placeholder="Contoh: Perforasi, syok anafilaksis, infeksi nosokomial sekunder"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Prognosis Pasca Tindakan
              </label>
              <input
                type="text"
                value={prognosis}
                onChange={e => setPrognosis(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Alternatif & Risiko Bila Tindakan Ditolak
              </label>
              <input
                type="text"
                value={alternatifRisiko}
                onChange={e => setAlternatifRisiko(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2 border-t border-slate-200">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Nama Pemberi Persetujuan (Pasien / Wali) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={patientSignName}
                onChange={e => setPatientSignName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Hubungan dengan Pasien
              </label>
              <select
                value={patientRelation}
                onChange={e => {
                  setPatientRelation(e.target.value);
                  if (e.target.value === 'Pasien Sendiri') setPatientSignName(patient.name);
                }}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="Pasien Sendiri">Pasien Sendiri</option>
                <option value="Suami / Istri">Suami / Istri</option>
                <option value="Orang Tua">Orang Tua</option>
                <option value="Anak Kandung">Anak Kandung</option>
                <option value="Wali Sah">Wali Sah</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Saksi I Tenaga Medis / Perawat
              </label>
              <input
                type="text"
                value={witnessName}
                onChange={e => setWitnessName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
              />
            </div>
          </div>
        </div>

        {/* TANDA TANGAN ELEKTRONIK (CANVAS SIGNATURE PAD) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Handshake className="w-4 h-4 text-blue-600" />
                Tanda Tangan Elektronik Pihak Terkait (3 Pihak)
              </h2>
              <p className="text-[11px] text-slate-500">
                Goreskan tanda tangan langsung pada kanvas menggunakan mouse atau layar sentuh.
              </p>
            </div>
            {patientSignatureImage && (
              <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full flex items-center gap-1 border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> TTD Tersimpan
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* TTD Dokter DPJP */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
              <DigitalSignaturePad
                title="Tanda Tangan Dokter DPJP"
                roleLabel="Dokter DPJP"
                personName={doctorName}
                onNameChange={setDoctorName}
                identifierNumber="SIP. 446.1/1092/Dinkes"
                signatureValue={doctorSignatureImage}
                onSignatureChange={setDoctorSignatureImage}
                signedDate={date}
              />
            </div>

            {/* TTD Pasien / Keluarga */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
              <DigitalSignaturePad
                title="Tanda Tangan Pasien / Wali"
                roleLabel="Pasien / Keluarga"
                personName={patientSignName || patient.name}
                onNameChange={setPatientSignName}
                signatureValue={patientSignatureImage}
                onSignatureChange={setPatientSignatureImage}
                signedDate={date}
              />
            </div>

            {/* TTD Saksi Tenaga Medis */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
              <DigitalSignaturePad
                title="Tanda Tangan Saksi I (Perawat)"
                roleLabel="Perawat"
                personName={witnessName}
                onNameChange={setWitnessName}
                identifierNumber="NIP. 19890412201503"
                signatureValue={witnessSignatureImage}
                onSignatureChange={setWitnessSignatureImage}
                signedDate={date}
              />
            </div>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Batal
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSave(true)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Simpan dan Buka Formulir Cetak Informed Consent"
            >
              <Printer className="w-4 h-4 text-blue-400" />
              <span>Simpan & Cetak</span>
            </button>

            <button
              type="button"
              onClick={() => handleSave(false)}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-blue-600/20"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
