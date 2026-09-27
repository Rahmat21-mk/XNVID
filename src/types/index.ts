export type UserRole = 'trainee' | 'admin';

export interface User {
  id: string; // 6-digit ID for trainees (e.g. "104821"), or "ADMIN-01"
  name: string;
  email: string;
  role: UserRole;
  password?: string;
  department?: string;
  registeredAt: string;
  avatar?: string;
}

export interface VideoWatchLog {
  videoId: string;
  videoTitle: string;
  durationSeconds: number; // total video length
  watchedSeconds: number; // discreetly tracked time
  watchPercentage: number;
  lastWatchedAt: string;
  completionCount: number;
  seekSkipsDetected: number; // helps calculate diligence score
}

export interface VideoItem {
  id: string;
  title: string;
  description: string;
  category?: string;
  durationSeconds: number; // 5 to 20 minutes (300 to 1200 seconds)
  durationFormatted: string;
  thumbnail: string;
  videoUrl?: string;
  uploadDate: string;
  fileSizeMb: number;
  uploadedBy: string;
  viewsCount: number;
  checksum?: string; // used for duplicate prevention
}

export interface ProductItem {
  id: string;
  name: string;
  category?: string;
  originalPrice: number; // in IDR (Rupiah)
  discountPercentage: number; // e.g. 15 for 15%
  finalPrice: number;
  quantity: number; // stock
  description: string;
  image: string;
  sku: string;
  weightKg: number;
}

export interface CartItem {
  product: ProductItem;
  quantity: number;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  postalCode: string;
  deliveryNotes?: string;
}

export interface DeliveryServiceConfig {
  id: string;
  name: string;
  code: string; // e.g. "JNE-EXP", "SICEPAT-BEST", "DHL-EXPRESS"
  baseFee: number;
  estimatedDays: string;
  active: boolean;
  securityInspectionIncluded: boolean;
}

export type PaymentMethodType = 'virtual_account' | 'qris' | 'manual_transfer';

export interface VirtualAccountBank {
  id: string;
  bankName: string;
  bankCode: string;
  accountPrefix: string;
  active: boolean;
}

export interface PaymentSettings {
  adminFee: number;
  serviceFee: number;
  virtualAccountBanks: VirtualAccountBank[];
  qrisMerchantName: string;
  qrisNmid: string;
  qrisCustomImageUrl?: string;
  manualBankName: string;
  manualBankAccount: string;
  manualBankHolder: string;
  invoicePrefix: string;
  receiptPrefix: string;
  warehouseSlipPrefix: string;
  taxPercentage: number;
}

export interface Voucher {
  code: string;
  discountPercentage: number;
  minPurchase: number;
  description: string;
  expiresAt: string;
}

export type OrderStatus = 'pending_payment' | 'paid_packing' | 'in_transit' | 'delivered' | 'cancelled';

export interface OrderTrackingStep {
  status: string;
  title: string;
  description: string;
  timestamp: string;
  location?: string;
  completed: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  invoiceNumber: string;
  receiptNumber: string;
  warehouseSlipNumber: string;
  traineeId: string;
  traineeName: string;
  traineeEmail: string;
  items: CartItem[];
  subtotal: number;
  productDiscountTotal: number;
  voucherDiscountTotal: number;
  voucherCodeApplied?: string;
  adminFee: number;
  serviceFee: number;
  deliveryFee: number;
  grandTotal: number;
  shippingAddress: ShippingAddress;
  deliveryService: DeliveryServiceConfig;
  trackingNumber: string;
  paymentMethod: PaymentMethodType;
  selectedBank?: string;
  virtualAccountNumber?: string;
  status: OrderStatus;
  createdAt: string;
  paidAt?: string;
  trackingSteps: OrderTrackingStep[];
  adminSignatureUrl?: string;
  adminSignerName?: string;
}

export interface AppSettings {
  appName: string;
  appLogoUrl: string;
  adminSignerName: string;
  adminSignerTitle: string;
  adminSignatureDataUrl: string; // drawn signature or uploaded
  adminSignatureType: 'qrcode' | 'manual' | 'drawn' | 'uploaded';
  supportEmail: string;
  companyAddress: string;
}
