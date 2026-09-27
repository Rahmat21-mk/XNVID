import React from 'react';
import {
  GraduationCap,
  PlaySquare,
  ShoppingBag,
  PackageCheck,
  LayoutDashboard,
  Film,
  Boxes,
  Users,
  CreditCard,
  Truck,
  Settings,
  LogOut,
  ShieldCheck,
  UserCheck,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export type ActiveTab =
  | 'trainee-videos'
  | 'trainee-store'
  | 'trainee-orders'
  | 'admin-dashboard'
  | 'admin-videos'
  | 'admin-products'
  | 'admin-participants'
  | 'admin-payments'
  | 'admin-delivery'
  | 'admin-settings';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  openAuthModal: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isMobileOpen = false,
  onCloseMobile
}) => {
  const { currentUser, appSettings, logout, cart } = useApp();

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleTabClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const handleLogout = () => {
    if (onCloseMobile) {
      onCloseMobile();
    }
    logout();
  };

  const renderSidebarContent = (isMobileView: boolean) => (
    <div className="flex flex-col h-full">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 font-bold shrink-0">
            {appSettings.appLogoUrl ? (
              <img src={appSettings.appLogoUrl} alt="Logo" className="w-7 h-7 rounded-lg object-contain" />
            ) : (
              <GraduationCap className="w-5 h-5" />
            )}
          </div>
          <div className="min-w-0">
            <h1 className="font-extrabold text-base tracking-tight text-white leading-none truncate">
              {appSettings.appName}
            </h1>
            <p className="text-[11px] font-medium text-slate-400 mt-1 truncate">
              {currentUser?.role === 'admin' ? 'Portal Administrator' : 'Portal Peserta'}
            </p>
          </div>
        </div>

        {/* Tombol Tutup Khusus Mobile */}
        {isMobileView && (
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Tutup Menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Indikator Status Akun */}
      <div className="px-3 pt-3 pb-1">
        <div className="bg-slate-800/60 rounded-xl p-2.5 border border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs truncate">
            {currentUser?.role === 'admin' ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 truncate">
                <ShieldCheck className="w-3 h-3 mr-1 shrink-0" /> ADMINISTRATOR
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 truncate">
                <UserCheck className="w-3 h-3 mr-1 shrink-0" /> PESERTA #{currentUser?.id || 'GUEST'}
              </span>
            )}
          </div>
          <span className="text-[10px] text-emerald-400 font-medium shrink-0 ml-1">Terverifikasi</span>
        </div>
      </div>

      {/* Menu Navigasi */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1 scrollbar-thin scrollbar-thumb-slate-700">
        {currentUser?.role === 'admin' ? (
          <>
            <div className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Menu Utama Admin
            </div>

            <button
              onClick={() => handleTabClick('admin-dashboard')}
              className={`w-full flex items-center px-3 py-2 rounded-lg text-xs font-medium transition ${
                activeTab === 'admin-dashboard'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 mr-2.5 text-blue-400 shrink-0" />
              <span>Dashboard Admin</span>
            </button>

            <button
              onClick={() => handleTabClick('admin-videos')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition ${
                activeTab === 'admin-videos'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center truncate">
                <Film className="w-4 h-4 mr-2.5 text-indigo-400 shrink-0" />
                <span className="truncate">Kelola Video</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono shrink-0 ml-2">
                20
              </span>
            </button>

            <button
              onClick={() => handleTabClick('admin-products')}
              className={`w-full flex items-center px-3 py-2 rounded-lg text-xs font-medium transition ${
                activeTab === 'admin-products'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <Boxes className="w-4 h-4 mr-2.5 text-emerald-400 shrink-0" />
              <span>Kelola Produk</span>
            </button>

            <button
              onClick={() => handleTabClick('admin-participants')}
              className={`w-full flex items-center px-3 py-2 rounded-lg text-xs font-medium transition ${
                activeTab === 'admin-participants'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4 mr-2.5 text-amber-400 shrink-0" />
              <span>Data & Pantau Peserta</span>
            </button>

            <div className="px-3 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Operasional & Dokumen
            </div>

            <button
              onClick={() => handleTabClick('admin-payments')}
              className={`w-full flex items-center px-3 py-2 rounded-lg text-xs font-medium transition ${
                activeTab === 'admin-payments'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <CreditCard className="w-4 h-4 mr-2.5 text-sky-400 shrink-0" />
              <span>Pengaturan Pembayaran</span>
            </button>

            <button
              onClick={() => handleTabClick('admin-delivery')}
              className={`w-full flex items-center px-3 py-2 rounded-lg text-xs font-medium transition ${
                activeTab === 'admin-delivery'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <Truck className="w-4 h-4 mr-2.5 text-violet-400 shrink-0" />
              <span>Pengaturan Pengiriman</span>
            </button>

            <button
              onClick={() => handleTabClick('admin-settings')}
              className={`w-full flex items-center px-3 py-2 rounded-lg text-xs font-medium transition ${
                activeTab === 'admin-settings'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4 mr-2.5 text-slate-400 shrink-0" />
              <span>Pengaturan Aplikasi</span>
            </button>
          </>
        ) : (
          <>
            <div className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Menu Peserta
            </div>

            <button
              onClick={() => handleTabClick('trainee-videos')}
              className={`w-full flex items-center px-3 py-2.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'trainee-videos'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <PlaySquare className="w-4 h-4 mr-2.5 text-blue-400 shrink-0" />
              <span>Video Pelatihan</span>
            </button>

            <button
              onClick={() => handleTabClick('trainee-store')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'trainee-store'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center">
                <ShoppingBag className="w-4 h-4 mr-2.5 text-emerald-400 shrink-0" />
                <span>Toko Praktik</span>
              </div>
              {totalCartCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500 text-white font-bold">
                  {totalCartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => handleTabClick('trainee-orders')}
              className={`w-full flex items-center px-3 py-2.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'trainee-orders'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <PackageCheck className="w-4 h-4 mr-2.5 text-amber-400 shrink-0" />
              <span>Pesanan & Pengiriman</span>
            </button>
          </>
        )}
      </nav>

      {/* Profil & Tombol Keluar */}
      <div className="p-3 border-t border-slate-800 bg-[#071324] flex items-center justify-between">
        {currentUser && (
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <img
              src={currentUser.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser.name}`}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full bg-slate-800 object-cover border border-slate-700 shrink-0"
            />
            <div className="truncate">
              <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
              <p className="text-[10px] text-slate-400 font-mono">
                {currentUser.role === 'trainee' ? `ID: ${currentUser.id}` : 'Admin'}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          title="Keluar dari Akun"
          className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop Static Sidebar (Visible on lg screens and up) */}
      <aside className="hidden lg:flex w-64 bg-[#0A192F] text-slate-200 flex-col h-screen sticky top-0 border-r border-slate-800 shadow-xl select-none z-30 shrink-0">
        {renderSidebarContent(false)}
      </aside>

      {/* 2. Mobile Drawer Overlay & Drawer (Visible on small screens when triggered) */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 z-50 backdrop-blur-xs lg:hidden transition-opacity duration-300 animate-in fade-in"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-[#0A192F] text-slate-200 z-50 flex flex-col h-full border-r border-slate-800 shadow-2xl lg:hidden select-none transform transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full pointer-events-none'
        }`}
      >
        {renderSidebarContent(true)}
      </aside>
    </>
  );
};
