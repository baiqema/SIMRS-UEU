import Swal from 'sweetalert2';

const toast = Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 4500, timerProgressBar: true });

export function notifySaveError(err: unknown): void {
  const msg = err instanceof Error ? err.message : String((err as { message?: string })?.message ?? err);
  const denied = /row-level security|42501|permission/i.test(msg);
  void toast.fire({
    icon: 'error',
    title: denied ? 'Peran Anda tidak memiliki izin mengubah modul ini.' : 'Gagal menyimpan ke server. Data dikembalikan.',
  });
}

export function notifyInfo(message: string): void {
  void toast.fire({ icon: 'info', title: message });
}
