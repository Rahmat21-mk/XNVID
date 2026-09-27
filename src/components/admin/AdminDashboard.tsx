import React from 'react';
import {
  Users,
  Film,
  Truck,
  DollarSign,
  Clock,
  ShieldCheck,
  ChevronRight,
  Boxes,
  FileCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ActiveTab } from '../common/Sidebar';
import { formatRupiah } from '../../utils/format';

interface AdminDashboardProps {
  setActiveTab: (tab: ActiveTab) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ setActiveTab }) => {
  const { allUsers, videos, orders, watchLogs } = useApp();

  const trainees = allUsers.filter(u => u.role === 'trainee');
  const totalRevenue = orders.reduce((sum, o) => sum + o.grandTotal, 0);
  const activeDeliveries = orders.filter(o => o.status === 'in_transit' || o.status === 'paid_packing').length;

  // Hitung total detik yang terpantau secara tersembunyi
  let totalDiscreetSeconds = 0;
  Object.values(watchLogs).forEach(logs => {
    logs.forEach(l => {
      totalDiscreetSeconds += l.watchedSeconds;
    });
  });
  const totalHours = (totalDiscreetSeconds / 3600).toFixed(1);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Banner Admin Ringkas */}
      <div className="bg-gradient-to-r from-[#0A192F] via-[#1E293B] to-slate-900 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-semibold mb-2 border border-amber-500/30">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" />
            Panel Administrator Tunggal
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Pusat Pengelolaan Pelatihan & Logistik XNVD
          </h2>
          <p className="text-slate-300 text-xs mt-1 leading-relaxed max-w-xl">
            Pantau durasi belajar peserta secara tersembunyi, kelola repositori video dan produk, serta atur nomor surat jalan dan faktur resmi.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('admin-videos')}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center"
          >
            <Film className="w-4 h-4 mr-1.5" />
            Upload Video
          </button>
          <button
            onClick={() => setActiveTab('admin-participants')}
            className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center"
          >
            <Users className="w-4 h-4 mr-1.5" />
            Pantau Peserta
          </button>
        </div>
      </div>

      {/* Baris Metrik Angka */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>Peserta</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-xl font-extrabold text-slate-900 font-mono mt-1.5">{trainees.length}</p>
          <span className="text-[10px] text-blue-600">ID 6-digit terdaftar</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>Video Aktif</span>
            <Film className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-xl font-extrabold text-slate-900 font-mono mt-1.5">{videos.length} / 200</p>
          <span className="text-[10px] text-indigo-600">Target 200 modul</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>Waktu Tonton</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-xl font-extrabold text-slate-900 font-mono mt-1.5">{totalHours} Jam</p>
          <span className="text-[10px] text-amber-700">Terpantau otomatis</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>Pendapatan</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl font-extrabold text-slate-900 font-mono mt-1.5">{formatRupiah(totalRevenue)}</p>
          <span className="text-[10px] text-emerald-600">{orders.length} pesanan</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>Pengiriman</span>
            <Truck className="w-4 h-4 text-violet-600" />
          </div>
          <p className="text-xl font-extrabold text-slate-900 font-mono mt-1.5">{activeDeliveries}</p>
          <span className="text-[10px] text-violet-600">Resi dalam proses</span>
        </div>
      </div>

      {/* Kartu Pintasan Cepat */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => setActiveTab('admin-participants')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-blue-400 cursor-pointer transition group"
        >
          <h3 className="font-bold text-sm text-slate-900">
            Pemantauan Durasi Tonton Peserta
          </h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Periksa data durasi tonton peserta secara tersembunyi dan atur ulang nomor ID 6-digit.
          </p>
          <div className="mt-3 flex items-center text-xs font-bold text-blue-600">
            <span>Buka Pantauan Peserta</span>
            <ChevronRight className="w-3.5 h-3.5 ml-0.5 group-hover:translate-x-0.5 transition" />
          </div>
        </div>

        <div
          onClick={() => setActiveTab('admin-videos')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-indigo-400 cursor-pointer transition group"
        >
          <h3 className="font-bold text-sm text-slate-900">
            Manajemen Video & Filter Duplikat
          </h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Upload modul video pelatihan, filter judul ganda, dan kelola repositori.
          </p>
          <div className="mt-3 flex items-center text-xs font-bold text-indigo-600">
            <span>Kelola Repositori Video</span>
            <ChevronRight className="w-3.5 h-3.5 ml-0.5 group-hover:translate-x-0.5 transition" />
          </div>
        </div>

        <div
          onClick={() => setActiveTab('admin-payments')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-emerald-400 cursor-pointer transition group"
        >
          <h3 className="font-bold text-sm text-slate-900">
            Metode Pembayaran & Tanda Tangan
          </h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Atur Virtual Account bank, upload QRIS, biaya admin, serta stempel tanda tangan resmi.
          </p>
          <div className="mt-3 flex items-center text-xs font-bold text-emerald-600">
            <span>Atur Pembayaran</span>
            <ChevronRight className="w-3.5 h-3.5 ml-0.5 group-hover:translate-x-0.5 transition" />
          </div>
        </div>
      </div>

      {/* Ringkasan Pesanan Terbaru */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="font-bold text-xs text-slate-800 uppercase tracking-wider">
            Pesanan Alat Praktik Terbaru
          </span>
          <button
            onClick={() => setActiveTab('admin-delivery')}
            className="text-xs font-bold text-blue-600 hover:text-blue-800"
          >
            Lihat Semua Pesanan →
          </button>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {orders.slice(0, 5).map((order) => (
            <div key={order.id} className="p-3.5 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 font-mono mr-2">{order.orderNumber}</span>
                <span className="text-slate-600">Peserta: {order.traineeName} (#{order.traineeId})</span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {order.items.length} item • Pembayaran: {order.paymentMethod.replace('_', ' ').toUpperCase()} • Kurir: {order.deliveryService.name}
                </p>
              </div>

              <div className="text-right">
                <span className="font-mono font-bold text-slate-900 text-xs block">
                  ${order.grandTotal.toFixed(2)}
                </span>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded uppercase">
                  {order.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
