import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { Upload, RefreshCw, Download, School, UserPlus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getSupabase } from '../../lib/supabaseClient';
import { buildRosterCsv } from './rosterCsv';
import { parseRoster } from '../../../supabase/functions/import-roster/validate';

type AccountStatus = 'created' | 'existing' | 'skipped' | 'failed';
interface Account { username: string; name: string; status: AccountStatus; tempPassword: string | null; message?: string }

const STATUS_LABEL: Record<AccountStatus, string> = {
  created: 'Akun baru', existing: 'Sudah ada', skipped: 'Dilewati', failed: 'Gagal',
};

const escapeHtml = (v: string) =>
  v.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export const KelasRosterPanel: React.FC = () => {
  const { activeClass, users, user, resetActiveClass, accountType, setMemberActive } = useApp();
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Account[]>([]);
  const [newClassName, setNewClassName] = useState('');
  const [creating, setCreating] = useState(false);
  const [dosenUsername, setDosenUsername] = useState('');
  const [dosenName, setDosenName] = useState('');
  const [creatingDosen, setCreatingDosen] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);
  useEffect(() => { setResult([]); }, [activeClass?.id]);
  const parsed = parseRoster(text);
  const members: { id: string; username: string; name: string; roleId: string; active: boolean }[] =
    users.filter((u: { id: string }) => /^[0-9a-f-]{36}$/.test(u.id));
  const isAdmin = accountType === 'admin';

  const functionError = async (error: { message: string }) => {
    let msg = error.message;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const body = await (error as any).context?.json?.();
      if (body && typeof body.error === 'string') msg = body.error;
    } catch { /* keep default message */ }
    return msg;
  };

  const createDosen = async () => {
    if (!dosenUsername.trim() || !dosenName.trim() || creatingDosen) return;
    setCreatingDosen(true);
    const { data, error } = await getSupabase().functions.invoke('import-roster', {
      body: { action: 'create_dosen', username: dosenUsername.trim(), name: dosenName.trim() },
    });
    setCreatingDosen(false);
    if (error) { void Swal.fire({ icon: 'error', title: 'Gagal membuat akun dosen', text: await functionError(error) }); return; }
    const acc = Array.isArray(data?.accounts) ? (data.accounts[0] as Account | undefined) : undefined;
    if (!acc) { void Swal.fire({ icon: 'error', title: 'Gagal membuat akun dosen', text: 'Respons server tidak valid.' }); return; }
    setDosenUsername('');
    setDosenName('');
    void Swal.fire({
      icon: 'success',
      title: acc.tempPassword ? 'Akun dosen dibuat' : 'Akun sudah ada',
      html: acc.tempPassword
        ? `Username <b>${escapeHtml(acc.username)}</b><br/>Password sementara: <b style="font-family:monospace">${escapeHtml(acc.tempPassword)}</b><br/><span style="font-size:11px">Hanya ditampilkan sekali. Dosen wajib menggantinya saat login pertama.</span>`
        : `Username <b>${escapeHtml(acc.username)}</b> sudah terdaftar; password tidak diubah.`,
      confirmButtonColor: '#2563eb',
    });
  };

  const toggleMember = async (m: { id: string; name: string; active: boolean }) => {
    setToggling(m.id);
    const res = await setMemberActive(m.id, !m.active);
    setToggling(null);
    if (!res.success) void Swal.fire({ icon: 'error', title: 'Gagal mengubah status anggota', text: res.error });
  };

  const importRoster = async () => {
    if (!activeClass || parsed.rows.length === 0) return;
    setBusy(true);
    const { data, error } = await getSupabase().functions.invoke('import-roster', {
      body: { action: 'import_roster', classId: activeClass.id, rows: parsed.rows },
    });
    setBusy(false);
    if (error) {
      void Swal.fire({ icon: 'error', title: 'Impor gagal', text: await functionError(error) });
      return;
    }
    if (!data || !Array.isArray(data.accounts)) {
      void Swal.fire({ icon: 'error', title: 'Impor gagal', text: 'Respons server tidak valid.' });
      return;
    }
    const accounts = data.accounts as Account[];
    setResult(accounts);
    setText('');
    const skipped = accounts.filter(a => a.status === 'skipped').length;
    const failed = accounts.filter(a => a.status === 'failed').length;
    if (skipped > 0 || failed > 0) {
      void Swal.fire({
        icon: 'warning', title: 'Impor selesai dengan catatan',
        text: `${skipped} baris dilewati dan ${failed} baris gagal. Periksa kolom Status pada tabel hasil.`,
      });
    }
  };

  const downloadCsv = () => {
    const csv = buildRosterCsv(result.map(a => ({ username: a.username, name: a.name, statusLabel: STATUS_LABEL[a.status], message: a.message, tempPassword: a.tempPassword })));
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `akun-${activeClass?.name ?? 'kelas'}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const reset = async () => {
    const ok = await Swal.fire({
      icon: 'warning', title: 'Reset rumah sakit kelas?',
      text: 'Semua data pasien kelas ini dikembalikan ke data awal. Riwayat audit tetap disimpan.',
      showCancelButton: true, confirmButtonText: 'Ya, reset', cancelButtonText: 'Batal',
    });
    if (!ok.isConfirmed) return;
    const res = await resetActiveClass();
    void Swal.fire({ icon: res.success ? 'success' : 'error', title: res.success ? 'Kelas direset' : 'Reset gagal', text: res.error });
  };

  const createClass = async () => {
    if (!newClassName.trim() || creating) return;
    setCreating(true);
    const { error } = await getSupabase().rpc('create_class', { p_name: newClassName.trim() });
    setCreating(false);
    if (error) { void Swal.fire({ icon: 'error', title: 'Gagal membuat kelas', text: error.message }); return; }
    setNewClassName('');
    void Swal.fire({ icon: 'success', title: 'Kelas dibuat', text: 'Keluar lalu masuk kembali untuk memilih kelas baru.' });
  };

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 text-xs">
          <School className="w-5 h-5 text-blue-600" />
          <div>
            <div className="font-black text-slate-800">{activeClass?.name}</div>
            <div className="text-slate-500">{members.length} anggota kelas</div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <input value={newClassName} onChange={e => setNewClassName(e.target.value)} placeholder="Nama kelas baru"
            className="px-3 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500" />
          <button type="button" onClick={createClass} disabled={creating} className="px-3 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold cursor-pointer disabled:opacity-60">Buat Kelas</button>
          <button type="button" onClick={reset} className="px-3 py-2 bg-amber-100 text-amber-900 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer">
            <RefreshCw className="w-4 h-4" /> Reset Data Kelas
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="text-xs font-black text-slate-800">Impor Daftar Mahasiswa</div>
        <p className="text-[11px] text-slate-500">Tempel satu mahasiswa per baris: <span className="font-mono">NIM, Nama</span>. Pemisah boleh koma, titik koma, atau tab (salin langsung dari Excel).</p>
        <textarea value={text} onChange={e => setText(e.target.value)} rows={6}
          className="w-full p-3 border border-slate-300 rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={'20240306044, Budi Santoso\n20240306045, Siti Aminah'} />
        {parsed.errors.length > 0 && (
          <ul className="text-[11px] text-rose-600 font-semibold list-disc pl-4">{parsed.errors.map(e => <li key={e}>{e}</li>)}</ul>
        )}
        <button type="button" disabled={busy || parsed.rows.length === 0} onClick={importRoster}
          className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer disabled:opacity-60">
          <Upload className="w-4 h-4" /> Impor {parsed.rows.length} Mahasiswa
        </button>
      </div>

      {result.length > 0 && (
        <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-black text-emerald-900">Hasil Impor: bagikan password sementara ke mahasiswa</div>
            <button type="button" onClick={downloadCsv} className="px-3 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer">
              <Download className="w-4 h-4" /> Unduh CSV
            </button>
          </div>
          <table className="w-full text-[11px]">
            <thead><tr className="text-left text-slate-500"><th>NIM</th><th>Nama</th><th>Status</th><th>Password Sementara</th></tr></thead>
            <tbody>
              {result.map(a => (
                <tr key={a.username} className="border-t border-slate-100 align-top">
                  <td className="font-mono py-1">{a.username}</td><td>{a.name}</td>
                  <td>
                    {STATUS_LABEL[a.status]}
                    {a.message && <div className="text-[10px] text-slate-500">{a.message}</div>}
                  </td>
                  <td className="font-mono font-bold">{a.tempPassword ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-[10px] text-slate-500">Password sementara hanya ditampilkan sekali. Mahasiswa wajib menggantinya saat login pertama.</p>
        </div>
      )}

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="text-xs font-black text-slate-800">Anggota Kelas</div>
        <p className="text-[11px] text-slate-500">Anggota nonaktif tidak dapat masuk ke kelas ini. Status dosen hanya dapat diubah oleh admin.</p>
        <table className="w-full text-[11px]">
          <thead><tr className="text-left text-slate-500"><th>Username</th><th>Nama</th><th>Peran</th><th>Status</th></tr></thead>
          <tbody>
            {members.map(m => {
              const isDosen = m.roleId === 'R03';
              const locked = m.id === user?.id || (isDosen && !isAdmin);
              return (
                <tr key={m.id} className="border-t border-slate-100">
                  <td className="font-mono py-1">{m.username}</td>
                  <td>{m.name}</td>
                  <td>{isDosen ? 'Dosen' : 'Mahasiswa'}</td>
                  <td>
                    <button type="button" disabled={locked || toggling === m.id} onClick={() => toggleMember(m)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${m.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                      {m.active ? 'Aktif' : 'Nonaktif'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isAdmin && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="text-xs font-black text-slate-800">Buat Akun Dosen</div>
          <p className="text-[11px] text-slate-500">Khusus admin. Password sementara ditampilkan sekali setelah akun dibuat.</p>
          <div className="flex flex-wrap gap-2">
            <input value={dosenUsername} onChange={e => setDosenUsername(e.target.value)} placeholder="Username (mis. dsn.budi)"
              className="px-3 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500" />
            <input value={dosenName} onChange={e => setDosenName(e.target.value)} placeholder="Nama lengkap"
              className="px-3 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500" />
            <button type="button" onClick={createDosen} disabled={creatingDosen || !dosenUsername.trim() || !dosenName.trim()}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer disabled:opacity-60">
              <UserPlus className="w-4 h-4" /> Buat Akun Dosen
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
