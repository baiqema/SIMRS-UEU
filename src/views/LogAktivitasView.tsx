import React from 'react';
import { useApp } from '../context/AppContext';

export const LogAktivitasView: React.FC = () => {
  const { auditTrail } = useApp();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Log Aktivitas Pengguna</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kronologi riwayat navigasi dan interaksi pengguna di dalam aplikasi SIMRS.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider font-bold">
                <th className="p-3.5">Waktu</th>
                <th className="p-3.5">Pengguna</th>
                <th className="p-3.5">Aktivitas</th>
                <th className="p-3.5">Modul Layanan</th>
                <th className="p-3.5">Perangkat & User Agent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {auditTrail.map(log => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString('id-ID')}
                  </td>
                  <td className="p-3.5 font-bold text-slate-800">{log.userName}</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-800">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3.5 font-bold text-blue-600">{log.module || log.entity}</td>
                  <td className="p-3.5 max-w-md truncate text-slate-400 font-mono text-[10px]">
                    {log.device}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
