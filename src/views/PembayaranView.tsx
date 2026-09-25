import React from 'react';
import { useApp } from '../context/AppContext';
import Swal from 'sweetalert2';
import { Banknote, CheckCircle2, DollarSign } from 'lucide-react';

export const PembayaranView: React.FC = () => {
  const { billing, processPayment, getReg, getPatient, canEditPage } = useApp();
  const isEditable = canEditPage('pembayaran');

  const formatCurrency = (n: number) => {
    return 'Rp ' + new Intl.NumberFormat('id-ID').format(n);
  };

  const handleProcessPayment = (billingId: string, patientName: string, total: number) => {
    if (!isEditable) {
      Swal.fire({
        icon: 'warning',
        title: 'Akses Terbatas (Mode Lihat)',
        text: 'Anda berada dalam Mode Lihat (Read-Only) untuk transaksi Kasir. Silakan login dengan akun Kasir / Keuangan.',
        confirmButtonColor: '#d97706'
      });
      return;
    }
    Swal.fire({
      title: 'Proses Pembayaran Kasir?',
      html: `
        <div class="text-left text-xs space-y-2 p-2 bg-slate-50 rounded-xl">
          <div>Pasien: <strong>${patientName}</strong></div>
          <div>Total Tagihan: <strong class="text-blue-600 font-bold">${formatCurrency(total)}</strong></div>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Terima Pembayaran Lunas',
      cancelButtonText: 'Batal'
    }).then(result => {
      if (result.isConfirmed) {
        processPayment(billingId);
        Swal.fire({
          icon: 'success',
          title: 'Pembayaran Lunas',
          text: `Tagihan ${billingId} telah dilunasi dan status diubah menjadi Paid. Kuitansi diterbitkan.`,
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  };

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
                Anda dapat melihat status transaksi kasir. Pelunasan dan pemprosesan pembayaran kuitansi khusus untuk **Petugas Kasir & Keuangan**.
              </p>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Kasir & Pembayaran Pasien</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Proses pelunasan tagihan billing rumah sakit dan penerbitan bukti pembayaran / kuitansi.
          </p>
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
                <th className="p-3.5">Total Tagihan</th>
                <th className="p-3.5">Jumlah Dibayar</th>
                <th className="p-3.5">Status Pelunasan</th>
                <th className="p-3.5 text-center">Aksi Kasir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {billing.map(b => {
                const r = getReg(b.regId);
                const p = r ? getPatient(r.patientId) : null;
                const isPaid = b.status === 'Paid';
                return (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-bold text-blue-600">{b.id}</td>
                    <td className="p-3.5 font-bold text-slate-800">{p?.name || '-'}</td>
                    <td className="p-3.5 text-slate-600">{r?.type || '-'}</td>
                    <td className="p-3.5 font-black text-slate-900">{formatCurrency(b.total)}</td>
                    <td className="p-3.5 font-bold text-emerald-600">{formatCurrency(b.paid)}</td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      {!isPaid ? (
                        <button
                          onClick={() => handleProcessPayment(b.id, p?.name || 'Pasien', b.total)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <DollarSign className="w-3.5 h-3.5" /> Proses Pelunasan
                        </button>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-600 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Lunas & Kuitansi terbit
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
