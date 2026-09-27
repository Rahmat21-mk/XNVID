import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar, ActiveTab } from './components/common/Sidebar';
import { Navbar } from './components/common/Navbar';
import { AuthModal } from './components/auth/AuthModal';
import { LoginPage } from './components/auth/LoginPage';
import { TraineeDashboard } from './components/trainee/TraineeDashboard';
import { StoreView } from './components/trainee/StoreView';
import { TraineeOrdersView } from './components/trainee/TraineeOrdersView';
import { TraineeBottomNav } from './components/trainee/TraineeBottomNav';
import { CartCheckoutModal } from './components/trainee/CartCheckoutModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { VideoManagement } from './components/admin/VideoManagement';
import { ProductManagement } from './components/admin/ProductManagement';
import { ParticipantManagement } from './components/admin/ParticipantManagement';
import { PaymentSettingsView } from './components/admin/PaymentSettingsView';
import { DeliveryManagementView } from './components/admin/DeliveryManagementView';
import { AppSettingsView } from './components/admin/AppSettingsView';
import { DocumentModal } from './components/documents/DocumentModal';
import { Order } from './types';

const MainAppContent: React.FC = () => {
  const { currentUser } = useApp();

  const [activeTab, setActiveTab] = useState<ActiveTab>('trainee-videos');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);

  // Document modal
  const [selectedDocumentOrder, setSelectedDocumentOrder] = useState<Order | null>(null);
  const [selectedDocType, setSelectedDocType] = useState<'invoice' | 'receipt' | 'warehouse_slip'>('invoice');

  // Sync active tab to user role when authenticated
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'admin' && activeTab.startsWith('trainee-')) {
        setActiveTab('admin-dashboard');
      } else if (currentUser.role === 'trainee' && activeTab.startsWith('admin-')) {
        setActiveTab('trainee-videos');
      }
    }
  }, [currentUser]);

  // Open Document handler
  const handleOpenDocument = (order: Order, type: 'invoice' | 'receipt' | 'warehouse_slip') => {
    setSelectedDocumentOrder(order);
    setSelectedDocType(type);
  };

  // If user is not logged in, display the initial Login / Registration Page
  if (!currentUser) {
    return <LoginPage />;
  }

  return (
    <div className="flex h-screen bg-slate-50 font-['Plus_Jakarta_Sans',sans-serif] overflow-hidden">
      {/* 1. Navy Blue Sidebar (Desktop static & Mobile slide-over drawer) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSearchQuery('');
          setIsMobileMenuOpen(false);
        }}
        openAuthModal={() => setIsAuthModalOpen(true)}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50 relative">
        {/* Top Navbar */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          openCartModal={() => setIsCartModalOpen(true)}
          openAuthModal={() => setIsAuthModalOpen(true)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onToggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)}
        />

        {/* Dynamic Main Workspace with safe-bottom padding so nothing is covered by the bottom menu */}
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-6 lg:p-8 pb-28 lg:pb-8 scrollbar-thin scrollbar-thumb-slate-300">
          <div className="max-w-7xl mx-auto">
            {/* Trainee Views */}
            {activeTab === 'trainee-videos' && (
              <TraineeDashboard searchQuery={searchQuery} />
            )}

            {activeTab === 'trainee-store' && (
              <StoreView
                searchQuery={searchQuery}
                openCheckout={() => setIsCartModalOpen(true)}
              />
            )}

            {activeTab === 'trainee-orders' && (
              <TraineeOrdersView onOpenDocument={handleOpenDocument} />
            )}

            {/* Admin Views */}
            {activeTab === 'admin-dashboard' && (
              <AdminDashboard setActiveTab={setActiveTab} />
            )}

            {activeTab === 'admin-videos' && (
              <VideoManagement />
            )}

            {activeTab === 'admin-products' && (
              <ProductManagement />
            )}

            {activeTab === 'admin-participants' && (
              <ParticipantManagement />
            )}

            {activeTab === 'admin-payments' && (
              <PaymentSettingsView />
            )}

            {activeTab === 'admin-delivery' && (
              <DeliveryManagementView onOpenDocument={handleOpenDocument} />
            )}

            {activeTab === 'admin-settings' && (
              <AppSettingsView />
            )}
          </div>
        </main>

        {/* Trainee Mobile Bottom Navigation Bar (Ultra-convenient for smartphones & tablets) */}
        {currentUser.role === 'trainee' && (
          <TraineeBottomNav
            activeTab={activeTab}
            setActiveTab={(tab) => {
              setActiveTab(tab);
              setSearchQuery('');
            }}
            openCartModal={() => setIsCartModalOpen(true)}
            onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          />
        )}
      </div>

      {/* Auth Modal (Switching/Account modal if triggered from navbar) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Cart & Checkout Modal */}
      <CartCheckoutModal
        isOpen={isCartModalOpen}
        onClose={() => setIsCartModalOpen(false)}
        onViewOrderDocuments={(order) => handleOpenDocument(order, 'invoice')}
      />

      {/* Official Document Viewer (Invoice, Receipt, Warehouse Slip with Admin Signature) */}
      {selectedDocumentOrder && (
        <DocumentModal
          order={selectedDocumentOrder}
          initialDocType={selectedDocType}
          onClose={() => setSelectedDocumentOrder(null)}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
