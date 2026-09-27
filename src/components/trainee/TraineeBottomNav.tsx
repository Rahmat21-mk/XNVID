import React from 'react';
import {
  PlaySquare,
  ShoppingBag,
  ShoppingCart,
  PackageCheck,
  Menu
} from 'lucide-react';
import { ActiveTab } from '../common/Sidebar';
import { useApp } from '../../context/AppContext';

interface TraineeBottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  openCartModal: () => void;
  onOpenMobileMenu: () => void;
}

export const TraineeBottomNav: React.FC<TraineeBottomNavProps> = ({
  activeTab,
  setActiveTab,
  openCartModal,
  onOpenMobileMenu
}) => {
  const { cart } = useApp();

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-2 py-1.5 flex items-center justify-around safe-bottom"
      aria-label="Navigasi Menu Peserta Mobile"
    >
      {/* 1. Modul Video Pelatihan */}
      <button
        type="button"
        onClick={() => setActiveTab('trainee-videos')}
        className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition duration-150 ${
          activeTab === 'trainee-videos'
            ? 'text-blue-600 font-bold bg-blue-50/80 shadow-2xs'
            : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <PlaySquare className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] leading-tight font-medium">Modul</span>
      </button>

      {/* 2. Toko Bahan & Alat Praktik */}
      <button
        type="button"
        onClick={() => setActiveTab('trainee-store')}
        className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition duration-150 ${
          activeTab === 'trainee-store'
            ? 'text-blue-600 font-bold bg-blue-50/80 shadow-2xs'
            : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <ShoppingBag className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] leading-tight font-medium">Toko</span>
      </button>

      {/* 3. Keranjang Belanja & Checkout */}
      <button
        type="button"
        onClick={openCartModal}
        className="flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-slate-500 hover:text-blue-600 transition duration-150"
      >
        <div className="relative">
          <ShoppingCart className="w-5 h-5 mb-0.5" />
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-blue-600 text-white rounded-full min-w-4 h-4 px-1 flex items-center justify-center text-[9px] font-extrabold shadow-xs">
              {cartCount > 99 ? '99+' : cartCount}
            </span>
          )}
        </div>
        <span className="text-[10px] leading-tight font-medium">Keranjang</span>
      </button>

      {/* 4. Pesanan & Pelacakan Pengiriman */}
      <button
        type="button"
        onClick={() => setActiveTab('trainee-orders')}
        className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition duration-150 ${
          activeTab === 'trainee-orders'
            ? 'text-blue-600 font-bold bg-blue-50/80 shadow-2xs'
            : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <PackageCheck className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] leading-tight font-medium">Pesanan</span>
      </button>

      {/* 5. Menu Lengkap / Pengaturan / Profil Akun */}
      <button
        type="button"
        onClick={onOpenMobileMenu}
        className="flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-slate-500 hover:text-slate-900 transition duration-150"
        title="Buka Menu Akun & Navigasi"
      >
        <Menu className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] leading-tight font-medium">Menu</span>
      </button>
    </nav>
  );
};
