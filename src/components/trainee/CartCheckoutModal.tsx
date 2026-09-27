import React, { useState } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  MapPin,
  Truck,
  CreditCard,
  QrCode,
  Tag,
  CheckCircle,
  FileText,
  Receipt,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ShippingAddress, PaymentMethodType, Order } from '../../types';
import { formatRupiah } from '../../utils/format';

interface CartCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewOrderDocuments?: (order: Order) => void;
}

export const CartCheckoutModal: React.FC<CartCheckoutModalProps> = ({
  isOpen,
  onClose,
  onViewOrderDocuments
}) => {
  const {
    cart,
    removeFromCart,
    updateCartQuantity,
    currentUser,
    deliveryServices,
    paymentSettings,
    vouchers,
    createOrder
  } = useApp();

  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>('cart');

  // Formulir Alamat
  const [address, setAddress] = useState<ShippingAddress>({
    fullName: currentUser?.name || 'Siti Rahmawati',
    phone: '0812-4910-3819',
    addressLine: 'Kampus Pelatihan Teknis, Asrama Blok B No. 4',
    city: 'Jakarta Timur',
    postalCode: '13420',
    deliveryNotes: 'Titipkan di pos keamanan jika sedang praktik di lab.'
  });

  // Pilihan Kurir
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string>(
    deliveryServices[0]?.id || ''
  );

  // Metode Pembayaran
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('virtual_account');
  const [selectedBank, setSelectedBank] = useState<string>(
    paymentSettings.virtualAccountBanks[0]?.bankName || 'Bank Central Asia (BCA)'
  );

  // Voucher
  const [voucherCodeInput, setVoucherCodeInput] = useState<string>('XNVD20');
  const [appliedVoucher, setAppliedVoucher] = useState<{ code: string; percent: number } | null>(null);
  const [voucherError, setVoucherError] = useState<string | null>(null);

  // Order yang baru saja dibuat
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  if (!isOpen) return null;

  const selectedDelivery = deliveryServices.find(d => d.id === selectedDeliveryId) || deliveryServices[0];

  // Perhitungan Keuangan
  const subtotalOriginal = cart.reduce((acc, i) => acc + (i.product.originalPrice * i.quantity), 0);
  const subtotalDiscounted = cart.reduce((acc, i) => acc + (i.product.finalPrice * i.quantity), 0);
  const productDiscountTotal = subtotalOriginal - subtotalDiscounted;

  let voucherDiscountAmount = 0;
  if (appliedVoucher) {
    voucherDiscountAmount = Number((subtotalDiscounted * (appliedVoucher.percent / 100)).toFixed(2));
  }

  const adminFee = paymentSettings.adminFee;
  const serviceFee = paymentSettings.serviceFee;
  const deliveryFee = selectedDelivery ? selectedDelivery.baseFee : 0;

  const grandTotal = Math.max(0, subtotalDiscounted - voucherDiscountAmount + adminFee + serviceFee + deliveryFee);

  const handleApplyVoucher = () => {
    setVoucherError(null);
    const code = voucherCodeInput.trim().toUpperCase();
    const found = vouchers.find(v => v.code.toUpperCase() === code);
    if (!found) {
      setVoucherError('Kode voucher tidak valid. Coba "XNVD20" atau "TRAINEE50".');
      return;
    }
    if (subtotalDiscounted < found.minPurchase) {
      setVoucherError(`Minimal pembelian ${formatRupiah(found.minPurchase)} untuk voucher ${found.code}.`);
      return;
    }
    setAppliedVoucher({ code: found.code, percent: found.discountPercentage });
  };

  const handlePlaceOrder = () => {
    if (!selectedDelivery) return;
    const res = createOrder({
      shippingAddress: address,
      deliveryService: selectedDelivery,
      paymentMethod,
      selectedBank: paymentMethod === 'virtual_account' ? selectedBank : undefined,
      voucherCode: appliedVoucher?.code
    });

    if (res.success && res.order) {
      setCreatedOrder(res.order);
      setStep('success');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Modal */}
        <div className="bg-[#0A192F] px-6 py-4 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base leading-none">
                {step === 'cart' && 'Keranjang Belanja Peralatan'}
                {step === 'checkout' && 'Pengiriman & Pembayaran'}
                {step === 'success' && 'Pembayaran Berhasil Diverifikasi'}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                {step === 'cart' && `${cart.length} jenis barang dipilih`}
                {step === 'checkout' && 'Lengkapi alamat dan pilih metode pembayaran'}
                {step === 'success' && `No. Pesanan: ${createdOrder?.orderNumber}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Isi Modal Berdasarkan Tahap */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {/* TAHAP 1: KERANJANG */}
          {step === 'cart' && (
            <div className="space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-2 text-slate-400">
                    <Truck className="w-7 h-7" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">Keranjang masih kosong</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Silakan pilih peralatan dari toko praktik terlebih dahulu.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl"
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-14 h-14 object-cover rounded-lg border border-slate-200"
                        />
                        <div>
                          <h4 className="font-bold text-xs text-slate-900 line-clamp-1 max-w-xs">
                            {item.product.name}
                          </h4>
                          <div className="flex items-baseline space-x-2 mt-0.5">
                            <span className="text-xs font-extrabold text-slate-900 font-mono">
                              {formatRupiah(item.product.finalPrice)}
                            </span>
                            {item.product.discountPercentage > 0 && (
                              <span className="text-[10px] text-slate-400 line-through font-mono">
                                {formatRupiah(item.product.originalPrice)}
                              </span>
                            )}
                            <span className="text-[10px] font-bold text-emerald-600">
                              (-{item.product.discountPercentage}%)
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Tombol Kuantitas */}
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1 bg-white border border-slate-300 rounded-lg p-0.5">
                          <button
                            onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                            className="p-1 text-slate-600 hover:text-slate-900"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-mono text-xs font-bold px-1.5">{item.quantity}</span>
                          <button
                            onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                            className="p-1 text-slate-600 hover:text-slate-900"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="font-mono font-bold text-xs text-slate-900 w-24 text-right">
                          {formatRupiah(item.product.finalPrice * item.quantity)}
                        </span>

                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="p-1 text-slate-400 hover:text-red-600 transition"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Ringkasan Diskon */}
                  <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Total Harga Asli:</span>
                      <span className="font-mono line-through">{formatRupiah(subtotalOriginal)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-emerald-700">
                      <span>Total Subsidi Diskon:</span>
                      <span className="font-mono">-{formatRupiah(productDiscountTotal)}</span>
                    </div>
                    <div className="flex justify-between font-extrabold text-sm text-slate-900 pt-1.5 border-t border-blue-200">
                      <span>Subtotal Bersih:</span>
                      <span className="font-mono text-blue-700">{formatRupiah(subtotalDiscounted)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAHAP 2: CHECKOUT (ALAMAT, KURIR, PEMBAYARAN, VOUCHER) */}
          {step === 'checkout' && (
            <div className="space-y-5">
              {/* Alamat Pengiriman */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <span className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center">
                  <MapPin className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                  1. Alamat Pengiriman
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Nama Penerima</label>
                    <input
                      type="text"
                      value={address.fullName}
                      onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Nomor Telepon</label>
                    <input
                      type="text"
                      value={address.phone}
                      onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Alamat Lengkap</label>
                    <input
                      type="text"
                      value={address.addressLine}
                      onChange={(e) => setAddress({ ...address, addressLine: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Kota / Kabupaten</label>
                    <input
                      type="text"
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Kode Pos</label>
                    <input
                      type="text"
                      value={address.postalCode}
                      onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Pilihan Kurir Pengiriman */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
                <span className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center">
                  <Truck className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
                  2. Pilih Layanan Kurir Pengiriman
                </span>

                <div className="space-y-2">
                  {deliveryServices.filter(d => d.active).map(service => (
                    <label
                      key={service.id}
                      className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition ${
                        selectedDeliveryId === service.id
                          ? 'bg-blue-50/70 border-blue-500'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <input
                          type="radio"
                          name="deliveryService"
                          checked={selectedDeliveryId === service.id}
                          onChange={() => setSelectedDeliveryId(service.id)}
                          className="text-blue-600"
                        />
                        <div>
                          <span className="font-bold text-xs text-slate-900 block">{service.name}</span>
                          <span className="text-[11px] text-slate-500">Estimasi: {service.estimatedDays}</span>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-xs text-slate-900">
                        {formatRupiah(service.baseFee)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Pilihan Pembayaran & Voucher */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <span className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center">
                  <CreditCard className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                  3. Metode Pembayaran & Voucher Diskon
                </span>

                {/* Input Kode Voucher */}
                <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-700">Kode Voucher Diskon</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={voucherCodeInput}
                      onChange={(e) => setVoucherCodeInput(e.target.value)}
                      placeholder="Contoh: XNVD20"
                      className="flex-1 uppercase font-mono px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={handleApplyVoucher}
                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition"
                    >
                      Gunakan
                    </button>
                  </div>
                  {appliedVoucher && (
                    <p className="text-[11px] text-emerald-700 font-semibold flex items-center">
                      <CheckCircle className="w-3.5 h-3.5 mr-1" />
                      Voucher "{appliedVoucher.code}" aktif (Potongan {appliedVoucher.percent}%)
                    </p>
                  )}
                  {voucherError && (
                    <p className="text-[11px] text-red-600">{voucherError}</p>
                  )}
                </div>

                {/* Pilihan Tab Metode Pembayaran */}
                <div className="grid grid-cols-3 gap-2 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('virtual_account')}
                    className={`py-2 px-2 rounded-lg border text-center transition ${
                      paymentMethod === 'virtual_account'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    Virtual Account (VA)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('qris')}
                    className={`py-2 px-2 rounded-lg border text-center transition ${
                      paymentMethod === 'qris'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    QRIS Instan
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('manual_transfer')}
                    className={`py-2 px-2 rounded-lg border text-center transition ${
                      paymentMethod === 'manual_transfer'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    Transfer Bank
                  </button>
                </div>

                {paymentMethod === 'virtual_account' && (
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5 text-xs">
                    <label className="block text-[11px] font-bold text-slate-700">Pilih Bank Virtual Account:</label>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                    >
                      {paymentSettings.virtualAccountBanks.filter(b => b.active).map(b => (
                        <option key={b.id} value={b.bankName}>
                          {b.bankName}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {paymentMethod === 'qris' && (
                  <div className="p-3 bg-white rounded-xl border border-slate-200 text-center space-y-1.5 text-xs">
                    <div className="w-24 h-24 bg-slate-900 text-white mx-auto rounded-lg flex flex-col items-center justify-center p-2">
                      <QrCode className="w-14 h-14" />
                      <span className="text-[8px] font-mono mt-0.5">QRIS STANDAR</span>
                    </div>
                    <p className="font-bold text-slate-800">{paymentSettings.qrisMerchantName}</p>
                    <p className="font-mono text-slate-400 text-[10px]">NMID: {paymentSettings.qrisNmid}</p>
                  </div>
                )}

                {paymentMethod === 'manual_transfer' && (
                  <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
                    <p className="text-slate-600">Bank: <strong className="text-slate-900">{paymentSettings.manualBankName}</strong></p>
                    <p className="text-slate-600">No. Rekening: <strong className="font-mono text-blue-700">{paymentSettings.manualBankAccount}</strong></p>
                    <p className="text-slate-600">Atas Nama: <strong className="text-slate-900">{paymentSettings.manualBankHolder}</strong></p>
                  </div>
                )}
              </div>

              {/* Rincian Total Biaya */}
              <div className="p-3.5 bg-slate-100 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal Peralatan:</span>
                  <span className="font-mono">{formatRupiah(subtotalOriginal)}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Diskon Subsidi Peserta:</span>
                  <span className="font-mono">-{formatRupiah(productDiscountTotal)}</span>
                </div>
                {appliedVoucher && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Diskon Voucher ({appliedVoucher.code}):</span>
                    <span className="font-mono">-{formatRupiah(voucherDiscountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Ongkos Kirim ({selectedDelivery?.name}):</span>
                  <span className="font-mono">{formatRupiah(deliveryFee)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Biaya Admin & Layanan:</span>
                  <span className="font-mono">{formatRupiah(adminFee + serviceFee)}</span>
                </div>
                <div className="flex justify-between font-extrabold text-sm text-slate-900 pt-2 border-t border-slate-300">
                  <span>Total Tagihan:</span>
                  <span className="font-mono text-blue-700">{formatRupiah(grandTotal)}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAHAP 3: SUKSES & CETAK DOKUMEN */}
          {step === 'success' && createdOrder && (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-lg font-bold text-slate-900">
                  Pesanan Berhasil Diselesaikan!
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Paket Anda telah masuk ke sistem antrean pengemasan gudang logistik.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 max-w-sm mx-auto text-left text-xs space-y-1 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Nomor Pesanan:</span>
                  <span className="font-bold text-slate-900">{createdOrder.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Nomor Resi:</span>
                  <span className="font-bold text-blue-700">{createdOrder.trackingNumber}</span>
                </div>
                {createdOrder.virtualAccountNumber && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Virtual Account:</span>
                    <span className="font-bold text-emerald-700">{createdOrder.virtualAccountNumber}</span>
                  </div>
                )}
                <div className="flex justify-between pt-1 border-t border-slate-200">
                  <span className="text-slate-500">Total Dibayar:</span>
                  <span className="font-bold text-slate-900">{formatRupiah(createdOrder.grandTotal)}</span>
                </div>
              </div>

              {/* Tombol Dokumen Resmi */}
              <div className="space-y-1.5 max-w-sm mx-auto text-left pt-2">
                <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
                  Buka Dokumen Resmi:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      if (onViewOrderDocuments) onViewOrderDocuments(createdOrder);
                      onClose();
                    }}
                    className="p-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center justify-center text-center transition"
                  >
                    <FileText className="w-4 h-4 text-blue-600 mb-1" />
                    <span className="text-xs font-bold text-slate-900">Faktur</span>
                  </button>

                  <button
                    onClick={() => {
                      if (onViewOrderDocuments) onViewOrderDocuments(createdOrder);
                      onClose();
                    }}
                    className="p-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center justify-center text-center transition"
                  >
                    <Receipt className="w-4 h-4 text-emerald-600 mb-1" />
                    <span className="text-xs font-bold text-slate-900">Kwitansi</span>
                  </button>

                  <button
                    onClick={() => {
                      if (onViewOrderDocuments) onViewOrderDocuments(createdOrder);
                      onClose();
                    }}
                    className="p-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center justify-center text-center transition"
                  >
                    <Truck className="w-4 h-4 text-amber-600 mb-1" />
                    <span className="text-xs font-bold text-slate-900">Surat Jalan</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Kontrol Bawah Modal */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          {step === 'cart' && (
            <>
              <button
                onClick={onClose}
                className="px-3.5 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Lanjut Belanja
              </button>
              {cart.length > 0 && (
                <button
                  onClick={() => setStep('checkout')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm transition flex items-center space-x-1"
                >
                  <span>Lanjut Pembayaran</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </>
          )}

          {step === 'checkout' && (
            <>
              <button
                onClick={() => setStep('cart')}
                className="px-3.5 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                ← Kembali ke Keranjang
              </button>
              <button
                onClick={handlePlaceOrder}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition flex items-center space-x-1.5"
              >
                <span>Bayar Sekarang ({formatRupiah(grandTotal)})</span>
                <CheckCircle className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {step === 'success' && (
            <div className="w-full flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition"
              >
                Selesai
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
