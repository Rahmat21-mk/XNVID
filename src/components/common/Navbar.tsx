import React from 'react';
import {
  Search,
  ShoppingCart
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ActiveTab } from './Sidebar';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  openCartModal: () => void;
  openAuthModal: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  openCartModal,
  searchQuery,
  setSearchQuery
}) => {
  const { currentUser, cart } = useApp();

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const getPageTitle = () => {
    switch (activeTab) {
      case 'trainee-videos':
        return { title: 'Modul Video Pelatihan', subtitle: 'Pilih modul instruksional untuk mulai belajar praktik' };
      case 'trainee-store':
        return { title: 'Toko Bahan & Alat Praktik', subtitle: 'Pengadaan peralatan sertifikasi resmi dengan subsidi diskon' };
      case 'trainee-orders':
        return { title: 'Pesanan & Pelacakan Pengiriman', subtitle: 'Pantau status resi kurir dan cetak dokumen resmi' };
      case 'admin-dashboard':
        return { title: 'Dashboard Utama Administrator', subtitle: 'Ringkasan aktivitas peserta, stok peralatan, dan pengiriman' };
      case 'admin-videos':
        return { title: 'Manajemen Video Pelatihan', subtitle: 'Daftar 20 video, filter pencegahan duplikasi & upload' };
      case 'admin-products':
        return { title: 'Manajemen Produk & Stok Toko', subtitle: 'Kelola harga asli, persentase diskon, dan stok bahan' };
      case 'admin-participants':
        return { title: 'Data Peserta & Pemantauan Durasi', subtitle: 'Pantau durasi tonton peserta secara tersembunyi & reset ID' };
      case 'admin-payments':
        return { title: 'Pengaturan Pembayaran & Dokumen', subtitle: 'Konfigurasi Virtual Account, QRIS, biaya admin, dan format nomor' };
      case 'admin-delivery':
        return { title: 'Pengaturan Layanan Pengiriman', subtitle: 'Atur kurir manual dan pantau pembaruan status resi' };
      case 'admin-settings':
        return { title: 'Pengaturan Aplikasi & Tanda Tangan', subtitle: 'Branding aplikasi dan tanda tangan resmi administrator' };
      default:
        return { title: 'Elearning XNVD', subtitle: 'Portal Pelatihan Teknis' };
    }
  };

  const { title, subtitle } = getPageTitle();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20 px-6 py-3 flex items-center justify-between shadow-2xs">
      {/* Judul Halaman */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">{title}</h2>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>

      {/* Kontrol Kanan */}
      <div className="flex items-center space-x-3">
        {/* Kolom Pencarian */}
        {(activeTab === 'trainee-videos' || activeTab === 'trainee-store' || activeTab === 'admin-videos' || activeTab === 'admin-products') && (
          <div className="relative w-56 hidden sm:block">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-100 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
          </div>
        )}

        {/* Keranjang Belanja Peserta */}
        {currentUser?.role === 'trainee' && (
          <button
            onClick={openCartModal}
            className="relative flex items-center space-x-2 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-200 font-medium text-xs transition"
          >
            <ShoppingCart className="w-4 h-4 text-blue-600" />
            <span className="font-semibold">Keranjang</span>
            {cartCount > 0 && (
              <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold">
                {cartCount}
              </span>
            )}
          </button>
        )}

        {/* Info Pengguna */}
        {currentUser && (
          <div className="flex items-center pl-2 border-l border-slate-200 space-x-2">
            <div className="text-right hidden sm:block">
              <span className="block text-xs font-bold text-slate-800 leading-none">{currentUser.name}</span>
              <span className="block text-[10px] text-slate-500 font-mono mt-0.5">
                {currentUser.role === 'trainee' ? `ID: ${currentUser.id}` : 'Admin'}
              </span>
            </div>
            <img
              src={currentUser.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser.name}`}
              alt={currentUser.name}
              className="w-7 h-7 rounded-full border border-slate-200 object-cover"
            />
          </div>
        )}
      </div>
    </header>
  );
};
