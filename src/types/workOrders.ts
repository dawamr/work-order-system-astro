import type { Operator, ProductionManager } from './user';

export interface WorkOrder {
  id: number;
  work_order_number: string;
  product_name: string;
  quantity: number;
  target_quantity: number;
  production_deadline: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | string;
  operator: Operator;
  production_manager: ProductionManager;
}

export interface StatusConfig {
  [key: string]: {
    title: string;
    color: string | undefined;
    borderColor: string | undefined;
    headerColor: string | undefined;
    textColor: string | undefined;
  };
}

export const statusConfig: StatusConfig = {
  pending: {
    title: 'Pending',
    color: 'bg-yellow-50 dark:bg-yellow-900/20',
    borderColor: 'border-yellow-200 dark:border-yellow-900/50',
    headerColor: 'bg-yellow-100 dark:bg-yellow-900/40',
    textColor: 'text-yellow-800 dark:text-yellow-300',
  },
  in_progress: {
    title: 'In Progress',
    color: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-900/50',
    headerColor: 'bg-blue-100 dark:bg-blue-900/40',
    textColor: 'text-blue-800 dark:text-blue-300',
  },
  completed: {
    title: 'Completed',
    color: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-200 dark:border-green-900/50',
    headerColor: 'bg-green-100 dark:bg-green-900/40',
    textColor: 'text-green-800 dark:text-green-300',
  },
  cancelled: {
    title: 'Cancelled',
    color: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-900/50',
    headerColor: 'bg-red-100 dark:bg-red-900/40',
    textColor: 'text-red-800 dark:text-red-300',
  },
};

export const statusLabels: Record<string, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

// Workorder hint descriptions
export const hintProgressDesc: Record<string, string[]> = {
  pending: [
    'The work order is pending and has not yet been assigned.',
    'Awaiting processing: this work order has not been started yet.',
    'Pending approval or scheduling before work begins.',
    'This work order is in the queue and will be addressed soon.',
    'No action taken yet. Work is still awaiting initiation.',
    'Work order is pending and awaiting further instructions.',
    'The work order is registered but not yet scheduled for execution.',
    'Waiting for material availability before starting the work order.',
    'Approval is required before this work order can proceed.',
    'Work order request received, but it has not been processed yet.',
    'Work order masih tertunda dan belum ditugaskan.',
    'Menunggu proses: work order ini belum dimulai.',
    'Menunggu persetujuan atau penjadwalan sebelum pekerjaan dimulai.',
    'Work order ini sedang dalam antrean dan akan segera ditangani.',
    'Belum ada tindakan yang diambil. Masih menunggu inisiasi.',
    'Work order masih tertunda dan menunggu instruksi lebih lanjut.',
    'Work order telah terdaftar tetapi belum dijadwalkan untuk dikerjakan.',
    'Menunggu ketersediaan material sebelum work order dapat dimulai.',
    'Diperlukan persetujuan sebelum work order ini dapat diproses.',
    'Permintaan work order telah diterima, tetapi belum diproses.',
  ],
  in_progress: [
    'The work order is currently being worked on by the assigned team.',
    'Work is actively in progress and expected to be completed soon.',
    'Technicians are working on this task at the moment.',
    'The assigned team is handling the work order as planned.',
    'Work is ongoing. Check for updates on progress.',
    'Task execution is in progress and being monitored.',
    'Components are being assembled as part of the work order.',
    'Initial testing and validation of components are in progress.',
    'Quality checks are being performed to ensure compliance.',
    'Minor adjustments and corrections are being applied if necessary.',
    'Packaging and final touches are currently underway.',
    'Preparing for shipment and logistics coordination.',
    'Finalizing all necessary production documents.',
    'Conducting final inspection before marking as complete.',
    'Work order sedang dikerjakan oleh tim yang ditugaskan.',
    '15% Progress is done',
    '25% Progress is done',
    '35% Progress is done',
    '45% Progress is done',
    '55% Progress is done',
    '65% Progress is done',
    '75% Progress is done',
    '85% Progress is done',
    '95% Progress is done',
    'Pekerjaan sedang berlangsung dan diharapkan selesai dalam waktu dekat.',
    'Teknisi sedang mengerjakan tugas ini saat ini.',
    'Tim yang bertanggung jawab sedang menangani work order sesuai rencana.',
    'Pekerjaan sedang berjalan. Periksa pembaruan untuk mengetahui perkembangan terbaru.',
    'Pelaksanaan tugas sedang berlangsung dan dalam pemantauan.',
    'Komponen sedang dirakit sebagai bagian dari work order.',
    'Pengujian awal dan validasi komponen sedang dilakukan.',
    'Pemeriksaan kualitas sedang dilakukan untuk memastikan kepatuhan.',
    'Penyesuaian dan perbaikan minor sedang diterapkan jika diperlukan.',
    'Pengemasan dan tahap akhir produksi sedang dilakukan.',
    'Persiapan pengiriman dan koordinasi logistik sedang berlangsung.',
    'Dokumentasi produksi akhir sedang diselesaikan.',
    'Inspeksi akhir sedang dilakukan sebelum work order ditandai sebagai selesai.',
  ],
  completed: [
    '100% Progress is done',
    'The work order has been successfully completed.',
    'All tasks related to this work order are finished.',
    'This work order is marked as completed with all necessary steps done.',
    'No further action required: the work is fully completed.',
    'The assigned team has finished this task successfully.',
    'Final checks are done, and the work order is now closed.',
    'Product has been handed over to the QA team for final verification.',
    'All production and testing phases have been successfully completed.',
    'Work order completion report has been generated.',
    'The finished product is ready for delivery or distribution.',
    'Work order telah berhasil diselesaikan.',
    'Semua tugas yang terkait dengan work order ini telah selesai.',
    'Work order ini telah ditandai sebagai selesai dengan semua langkah yang diperlukan telah dilakukan.',
    'Tidak diperlukan tindakan lebih lanjut: pekerjaan telah sepenuhnya selesai.',
    'Tim yang ditugaskan telah menyelesaikan tugas ini dengan sukses.',
    'Pemeriksaan akhir telah dilakukan, dan work order sekarang ditutup.',
    'Produk telah diserahkan ke tim QA untuk verifikasi akhir.',
    'Semua tahap produksi dan pengujian telah berhasil diselesaikan.',
    'Laporan penyelesaian work order telah dibuat.',
    'Produk akhir siap untuk dikirim atau didistribusikan.',
  ],
  cancelled: [
    'This work order has been cancelled and will not be processed.',
    'Cancelled: No further action will be taken on this work order.',
    'The request was withdrawn, and the work order is now void.',
    'Work order has been cancelled due to changes or other reasons.',
    'No work will be done on this order as it has been deactivated.',
    'The cancellation request has been processed, and the order is now inactive.',
    'The work order was cancelled before production could begin.',
    'Material shortages led to the cancellation of this work order.',
    'This order was superseded by a revised work order.',
    'The project requirements changed, making this order unnecessary.',
    'Work order ini telah dibatalkan dan tidak akan diproses.',
    'Dibatalkan: Tidak ada tindakan lebih lanjut yang akan dilakukan pada work order ini.',
    'Permintaan telah ditarik, dan work order sekarang tidak berlaku.',
    'Work order telah dibatalkan karena perubahan atau alasan lainnya.',
    'Tidak ada pekerjaan yang akan dilakukan pada work order ini karena telah dinonaktifkan.',
    'Permintaan pembatalan telah diproses, dan work order sekarang tidak aktif.',
    'Work order dibatalkan sebelum produksi dapat dimulai.',
    'Kekurangan material menyebabkan pembatalan work order ini.',
    'Work order ini telah digantikan oleh work order yang telah direvisi.',
    'Persyaratan proyek berubah sehingga work order ini tidak lagi diperlukan.',
  ],
};
