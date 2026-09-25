import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Modal } from '../components/Modal';
import { Receipt, Eye, Calculator } from 'lucide-react';

export const BillingView: React.FC = () => {
  const { billing, getReg, getPatient, canEditPage } = useApp();
  const isEditable = canEditPage('billing');

  const [detailBillingId, setDetailBillingId] = useState<string | null>(null);

  const formatCurrency = (n: number) => {
    return 'Rp ' + new Intl.NumberFormat('id-ID').format(n);
  };

  const detailBilling = detailBillingId ? billing.find(b => b.id === detailBillingId) : null;
  const detailReg = detailBilling ? getReg(detailBilling.regId) : null;
  const detailPatient = detailReg ? getPatient(detailReg.patientId) : null;

  return (
    <div className="space-y-6">
      {/* Read-Only Mode Banner */}
      {!isEditable && (
        <div className="p-3.5 bg-amber-50 border border-amber-200/90 rounded-2xl flex items-center justify-between text-xs text-amber-900 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
              🔒
            </div>
            <div>
              <p className="font-extrabold text-amber-950 flex items-center gap-2">
                <span>Mode Lihat (Read-Only)</span>
                <span className="text-[10px] px-2 py-0.5 bg-amber-200/80 text-amber-900 rounded-full font-bold">Akses Terbatas</span>
              </p>
              <p className="text-[11px] text-amber-800">
                Anda dapat melihat rincian billing pelayanan pasien. Pengelolaan & penyesuaian billing khusus untuk **Petugas Keuangan / Kasir**.
              </p>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Billing & Rincian Pelayanan</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Perhitungan otomatis seluruh tagihan jasa medis, kamar, laboratorium, dan resep farmasi.
          </p>
        </div>
      </div>

      <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-900 flex items-center gap-3">
        <Calculator className="w-5 h-5 text-blue-600 shrink-0" />
        <div>
          <strong>Sistem Perhitungan Otomatis:</strong> Billing menghitung seluruh item pelayanan (Konsultasi, Tindakan, Obat, Hasil Lab, Radiologi) secara konsisten dan real-time.
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider font-bold">
                <th className="p-3.5">ID Billing</th>
                <th className="p-3.5">Nama Pasien</th>
                <th className="p-3.5">Jenis Rawat</th>
                <th className="p-3.5">Jumlah Item Pelayanan</th>
                <th className="p-3.5">Total Tagihan</th>
                <th className="p-3.5">Sudah Dibayar</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {[...billing].sort((a, b) => {
                const rA = getReg(a.regId);
                const pA = rA ? getPatient(rA.patientId) : null;
                const numA = parseInt((pA?.noRM || '').replace(/\D/g, '') || '0', 10);

                const rB = getReg(b.regId);
                const pB = rB ? getPatient(rB.patientId) : null;
                const numB = parseInt((pB?.noRM || '').replace(/\D/g, '') || '0', 10);

                return numA - numB;
              }).map(b => {
                const r = getReg(b.regId);
                const p = r ? getPatient(r.patientId) : null;
                return (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-bold text-blue-600">{b.id}</td>
                    <td className="p-3.5 font-bold text-slate-800">{p?.name || '-'}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                        {r?.type || '-'}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-600">{b.services.length} item Rincian</td>
                    <td className="p-3.5 font-black text-slate-800">{formatCurrency(b.total)}</td>
                    <td className="p-3.5 font-semibold text-emerald-600">{formatCurrency(b.paid)}</td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        b.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => setDetailBillingId(b.id)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" /> Detail Rincian
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail Rincian Billing */}
      <Modal
        isOpen={!!detailBillingId}
        onClose={() => setDetailBillingId(null)}
        title={`Rincian Tagihan Billing ${detailBilling?.id}`}
      >
        {detailBilling && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div>Pasien: <strong>{detailPatient?.name}</strong></div>
              <div>No. RM: <strong>{detailPatient?.noRM}</strong></div>
              <div>Jenis Rawat: <strong>{detailReg?.type}</strong></div>
              <div>Penjamin: <strong>{detailPatient?.insuranceType}</strong></div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold">
                    <th className="p-2.5">Item Pelayanan</th>
                    <th className="p-2.5 text-center">Qty</th>
                    <th className="p-2.5 text-right">Harga Satuan</th>
                    <th className="p-2.5 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {detailBilling.services.map((item, idx) => (
                    <tr key={idx}>
                      <td className="p-2.5 font-medium">{item.name}</td>
                      <td className="p-2.5 text-center">{item.qty}</td>
                      <td className="p-2.5 text-right font-mono">{formatCurrency(item.price)}</td>
                      <td className="p-2.5 text-right font-bold font-mono">{formatCurrency(item.qty * item.price)}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 font-black text-slate-900 border-t border-slate-200">
                    <td colSpan={3} className="p-3 text-right">TOTAL HAK TAGIHAN:</td>
                    <td className="p-3 text-right text-blue-600 font-extrabold text-sm font-mono">
                      {formatCurrency(detailBilling.total)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setDetailBillingId(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
