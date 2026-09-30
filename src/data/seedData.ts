import {
  User,
  VideoItem,
  ProductItem,
  DeliveryServiceConfig,
  PaymentSettings,
  AppSettings,
  Voucher,
  Order,
  VideoWatchLog
} from '../types';

export const INITIAL_APP_SETTINGS: AppSettings = {
  appName: 'Elearning XNVD',
  appLogoUrl: '',
  adminSignerName: 'Capt. Hendra Wijaya, M.Sc.',
  adminSignerTitle: 'Kepala Pusat Pelatihan & Logistik Sertifikasi',
  adminSignatureType: 'qrcode',
  adminSignatureDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="220" height="70" viewBox="0 0 220 70"><path d="M 20 45 Q 40 10, 60 40 T 100 20 T 140 45 Q 160 55, 180 30 T 200 45" fill="none" stroke="%230F172A" stroke-width="2.5" stroke-linecap="round"/></svg>',
  supportEmail: 'bantuan@xnvd.id',
  companyAddress: 'Pusat Pelatihan Teknis XNVD, Menara Industri Lt. 8, Jakarta',
};

// Akun resmi tunggal admin dan akun peserta bawaan siap uji
export const INITIAL_USERS: User[] = [
  {
    id: 'admin',
    name: 'Administrator Utama XNVD',
    email: 'admin@xnvd.id',
    role: 'admin',
    password: 'admin',
    registeredAt: '2026-01-01T08:00:00Z',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: '104821',
    name: 'Budi Pratama - Peserta Sertifikasi',
    email: 'peserta@xnvd.id',
    role: 'trainee',
    registeredAt: '2026-02-15T09:30:00Z',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
  }
];

// Repositori video pelatihan (kosong - murni diisi oleh video yang diunggah admin)
export const INITIAL_VIDEOS: VideoItem[] = [];

// Bahan dan peralatan praktik toko (kosong - murni diisi oleh produk yang dibuat admin)
export const INITIAL_PRODUCTS: ProductItem[] = [];

export const INITIAL_DELIVERY_SERVICES: DeliveryServiceConfig[] = [
  {
    id: 'DEL-01',
    name: 'Logistik Terpantau XNVD (Standar Aman)',
    code: 'XNVD-MONITOR-STD',
    baseFee: 15000,
    estimatedDays: '2 - 3 Hari Kerja',
    active: true,
    securityInspectionIncluded: true,
  },
  {
    id: 'DEL-02',
    name: 'Kurir Prioritas Segel Keamanan (Express)',
    code: 'PRIORITY-SECURE-EXP',
    baseFee: 25000,
    estimatedDays: '1 Hari Kerja (Besok Sampai)',
    active: true,
    securityInspectionIncluded: true,
  },
  {
    id: 'DEL-03',
    name: 'Kargo Khusus Peralatan Berat Nasional',
    code: 'CARGO-HEAVY-NAT',
    baseFee: 40000,
    estimatedDays: '3 - 5 Hari Kerja',
    active: true,
    securityInspectionIncluded: true,
  }
];

export const INITIAL_PAYMENT_SETTINGS: PaymentSettings = {
  adminFee: 2500,
  serviceFee: 1500,
  taxPercentage: 0,
  virtualAccountBanks: [
    { id: 'bca', bankName: 'Bank Central Asia (BCA)', bankCode: '014', accountPrefix: '80922', active: true },
    { id: 'mandiri', bankName: 'Bank Mandiri', bankCode: '008', accountPrefix: '89104', active: true },
    { id: 'bni', bankName: 'Bank Negara Indonesia (BNI)', bankCode: '009', accountPrefix: '98821', active: true },
    { id: 'bri', bankName: 'Bank Rakyat Indonesia (BRI)', bankCode: '002', accountPrefix: '12890', active: true },
  ],
  qrisMerchantName: 'TOKO PRAKTIK ELEARNING XNVD',
  qrisNmid: 'ID1020304050607',
  qrisCustomImageUrl: '',
  manualBankName: 'Bank Central Asia (BCA)',
  manualBankAccount: '528-900-2411',
  manualBankHolder: 'PT XNVD PENDIDIKAN DAN LOGISTIK',
  invoicePrefix: 'INV/2026/XNVD',
  receiptPrefix: 'KWT/2026/XNVD',
  warehouseSlipPrefix: 'SJ/2026/GUDANG',
};

export const INITIAL_VOUCHERS: Voucher[] = [
  {
    code: 'XNVD20',
    discountPercentage: 20,
    minPurchase: 500000,
    description: 'Diskon 20% untuk pembelian peralatan di atas Rp 500.000',
    expiresAt: '2026-12-31'
  },
  {
    code: 'TRAINEE50',
    discountPercentage: 50,
    minPurchase: 1000000,
    description: 'Subsidi 50% untuk pengadaan kit laboratorium di atas Rp 1.000.000',
    expiresAt: '2026-12-31'
  },
  {
    code: 'WELCOME10',
    discountPercentage: 10,
    minPurchase: 200000,
    description: 'Diskon selamat datang 10% untuk transaksi di atas Rp 200.000',
    expiresAt: '2026-12-31'
  }
];

// Data pemantauan durasi video peserta (tercatat otomatis secara tersembunyi saat peserta menonton)
export const INITIAL_WATCH_LOGS: Record<string, VideoWatchLog[]> = {};

// Data pesanan peserta (tercatat otomatis saat peserta bertransaksi di toko)
export const INITIAL_ORDERS: Order[] = [];
