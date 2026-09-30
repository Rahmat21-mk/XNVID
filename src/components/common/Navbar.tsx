import React, { useState } from 'react';
import {
  Search,
  ShoppingCart,
  Menu,
  X,
  RefreshCw,
  CheckCircle2
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
  onToggleMobileMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  openCartModal,
  searchQuery,
  setSearchQuery,
  onToggleMobileMenu
}) => {
  const { currentUser, cart, syncMasterStateToServer, refreshServerState } = useApp();
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);

  const handleSyncAllDevices = async () => {
    setIsSyncing(true);
    const res = await syncMasterStateToServer();
    await refreshServerState();
    setIsSyncing(false);
    if (res?.success) {
      setSyncToast('Sinkron ke seluruh HP & Laptop berhasil!');
      setTimeout(() => setSyncToast(null), 3000);
    }
  };

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
        return { title: 'Dashboard Utama Admin', subtitle: 'Ringkasan aktivitas peserta, stok peralatan, dan pengiriman' };
      case 'admin-videos':
        return { title: 'Manajemen Video Pelatihan', subtitle: 'Daftar 20 video, filter pencegahan duplikasi & upload' };
      case 'admin-products':
        return { title: 'Manajemen Produk & Stok', subtitle: 'Kelola harga asli, persentase diskon, dan stok bahan' };
      case 'admin-participants':
        return { title: 'Data Peserta & Pemantauan', subtitle: 'Pantau durasi tonton peserta secara tersembunyi & reset ID' };
      case 'admin-payments':
        return { title: 'Pengaturan Pembayaran', subtitle: 'Konfigurasi Virtual Account, QRIS, biaya admin, dan format nomor' };
      case 'admin-delivery':
        return { title: 'Pengaturan Layanan Pengiriman', subtitle: 'Atur kurir manual dan pantau pembaruan status resi' };
      case 'admin-settings':
        return { title: 'Pengaturan Aplikasi & TTD', subtitle: 'Branding aplikasi dan tanda tangan resmi administrator' };
      default:
        return { title: 'Elearning XNVD', subtitle: 'Portal Pelatihan Teknis' };
    }
  };

  const { title, subtitle } = getPageTitle();

  const isSearchablePage = (
    activeTab === 'trainee-videos' ||
    activeTab === 'trainee-store' ||
    activeTab === 'admin-videos' ||
    activeTab === 'admin-products'
  );

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-2xs">
      {/* Baris Utama Navbar */}
      <div className="px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2">
        {/* Tombol Hamburger (Mobile & Tablet) + Judul Halaman */}
        <div className="flex items-center min-w-0 flex-1">
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 -ml-1 mr-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition shrink-0 focus:outline-none"
            title="Buka Menu Navigasi"
            aria-label="Buka Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0 flex-1">
            <h2 className="text-sm sm:text-base md:text-lg font-bold text-slate-900 tracking-tight leading-tight truncate">
              {title}
            </h2>
            <p className="text-[10px] sm:text-xs text-slate-500 truncate hidden md:block">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Kontrol Kanan */}
        <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
          {/* Kolom Pencarian Desktop & Tablet */}
          {isSearchablePage && (
            <>
              {/* Tombol Search Mobile */}
              <button
                type="button"
                onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                className="sm:hidden p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition"
                title="Cari"
                aria-label="Cari"
              >
                {isMobileSearchOpen ? <X className="w-4 h-4 text-red-500" /> : <Search className="w-4 h-4" />}
              </button>

              {/* Input Search Desktop */}
              <div className="relative w-44 md:w-56 hidden sm:block">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-100 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>
            </>
          )}

          {/* Tombol Sinkronisasi Multi-Perangkat untuk Admin */}
          {currentUser?.role === 'admin' && (
            <button
              onClick={handleSyncAllDevices}
              disabled={isSyncing}
              className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white px-2.5 sm:px-3 py-1.5 rounded-xl font-bold text-xs shadow-xs transition shrink-0 cursor-pointer disabled:opacity-70"
              title="Sinkronkan seluruh data video, produk, dan pengaturan ke semua perangkat HP/Laptop"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden xs:inline">{isSyncing ? 'Menyinkronkan...' : 'Sinkron ke HP'}</span>
            </button>
          )}

          {/* Keranjang Belanja Peserta */}
          {currentUser?.role === 'trainee' && (
            <button
              onClick={openCartModal}
              className="relative flex items-center space-x-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 px-2.5 sm:px-3 py-1.5 rounded-lg border border-blue-200 font-medium text-xs transition shrink-0"
              title="Keranjang Belanja"
            >
              <ShoppingCart className="w-4 h-4 text-blue-600" />
              <span className="font-semibold hidden xs:inline">Keranjang</span>
              {cartCount > 0 && (
                <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold">
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {/* Info Profil Singkat Pengguna */}
          {currentUser && (
            <div className="flex items-center pl-1 sm:pl-2 border-l border-slate-200 space-x-2">
              <div className="text-right hidden sm:block">
                <span className="block text-xs font-bold text-slate-800 leading-none truncate max-w-[120px]">
                  {currentUser.name}
                </span>
                <span className="block text-[10px] text-slate-500 font-mono mt-0.5">
                  {currentUser.role === 'trainee' ? `ID: ${currentUser.id}` : 'Admin'}
                </span>
              </div>
              <img
                src={currentUser.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser.name}`}
                alt={currentUser.name}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-slate-200 object-cover bg-slate-100"
              />
            </div>
          )}
        </div>
      </div>

      {/* Baris Pencarian Mobile (Jika aktif) */}
      {isSearchablePage && isMobileSearchOpen && (
        <div className="sm:hidden px-3 pb-2.5 pt-0.5 border-t border-slate-100 bg-slate-50/80 animate-in slide-in-from-top-2 duration-200">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ketik kata kunci untuk mencari..."
              className="w-full pl-8 pr-8 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
      {/* Notifikasi Sinkronisasi Berhasil */}
      {syncToast && (
        <div className="bg-emerald-600 text-white text-xs font-semibold py-1.5 px-4 text-center flex items-center justify-center space-x-2 animate-in fade-in slide-in-from-top-1 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-100" />
          <span>{syncToast}</span>
        </div>
      )}
    </header>
  );
};
