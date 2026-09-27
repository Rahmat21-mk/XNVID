import React, { useState } from 'react';
import {
  X,
  Printer,
  FileText,
  Receipt,
  Truck,
  QrCode,
  PenTool,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import { Order } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatRupiah } from '../../utils/format';

interface DocumentModalProps {
  order: Order | null;
  initialDocType?: 'invoice' | 'receipt' | 'warehouse_slip';
  onClose: () => void;
}

export const DocumentModal: React.FC<DocumentModalProps> = ({
  order,
  initialDocType = 'invoice',
  onClose
}) => {
  const { appSettings } = useApp();
  const [docType, setDocType] = useState<'invoice' | 'receipt' | 'warehouse_slip'>(initialDocType);

  // Pilihan Pengesahan: QR Code atau TTD Manual
  const [signatureChoice, setSignatureChoice] = useState<'qrcode' | 'manual'>(
    appSettings.adminSignatureType === 'qrcode' ? 'qrcode' : 'manual'
  );

  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  // Komponen Pengesahan Pejabat: QR Code atau TTD Manual
  const renderSignatureSection = (labelRole: string = 'Pejabat Penanggung Jawab') => {
    if (signatureChoice === 'qrcode') {
      return (
        <div className="flex flex-col items-center text-center p-2.5 bg-slate-50 border border-slate-200 rounded-xl w-60">
          <div className="flex items-center space-x-1 text-[10px] font-bold text-indigo-700 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>Pengesahan QR Code Digital</span>
          </div>

          {/* SVG QR Code Resmi Elearning XNVD */}
          <div className="w-20 h-20 bg-white border border-slate-300 rounded-lg p-1 my-1 shadow-2xs">
            <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900">
              <rect width="100" height="100" fill="white" />
              {/* Corner 1 */}
              <rect x="10" y="10" width="26" height="26" fill="#0A192F" rx="3" />
              <rect x="15" y="15" width="16" height="16" fill="white" rx="2" />
              <rect x="19" y="19" width="8" height="8" fill="#0A192F" />
              {/* Corner 2 */}
              <rect x="64" y="10" width="26" height="26" fill="#0A192F" rx="3" />
              <rect x="69" y="15" width="16" height="16" fill="white" rx="2" />
              <rect x="73" y="19" width="8" height="8" fill="#0A192F" />
              {/* Corner 3 */}
              <rect x="10" y="64" width="26" height="26" fill="#0A192F" rx="3" />
              <rect x="15" y="69" width="16" height="16" fill="white" rx="2" />
              <rect x="19" y="73" width="8" height="8" fill="#0A192F" />
              {/* Center & Matrix Pattern */}
              <rect x="42" y="12" width="6" height="6" fill="#2563EB" />
              <rect x="52" y="20" width="6" height="6" fill="#0A192F" />
              <rect x="42" y="32" width="6" height="6" fill="#0A192F" />
              <rect x="25" y="44" width="6" height="6" fill="#0A192F" />
              <rect x="36" y="44" width="14" height="14" fill="#2563EB" rx="2" />
              <rect x="56" y="44" width="6" height="6" fill="#0A192F" />
              <rect x="70" y="44" width="6" height="6" fill="#2563EB" />
              <rect x="44" y="64" width="6" height="6" fill="#0A192F" />
              <rect x="56" y="64" width="12" height="6" fill="#2563EB" />
              <rect x="44" y="76" width="6" height="6" fill="#2563EB" />
              <rect x="58" y="78" width="8" height="8" fill="#0A192F" />
              <rect x="76" y="70" width="8" height="8" fill="#0A192F" />
            </svg>
          </div>

          <div className="w-full border-t border-slate-200 pt-1 mt-1">
            <span className="text-[9px] font-extrabold text-emerald-700 uppercase tracking-tight block">
              DIVERIFIKASI SECARA ELEKTRONIK
            </span>
            <p className="font-bold text-slate-900 text-xs font-mono">
              {appSettings.adminSignerName}
            </p>
            <p className="text-[10px] text-slate-500 truncate max-w-full">
              {appSettings.adminSignerTitle}
            </p>
            <span className="text-[8px] text-slate-400 font-mono block mt-0.5">
              Ref: {order.orderNumber}
            </span>
          </div>
        </div>
      );
    }

    // TTD MANUAL
    return (
      <div className="text-center w-56">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
          {labelRole}
        </p>
        <div className="h-14 flex items-center justify-center py-1">
          {appSettings.adminSignatureDataUrl ? (
            <img
              src={appSettings.adminSignatureDataUrl}
              alt="Tanda Tangan Manual"
              className="max-h-14 object-contain mx-auto"
            />
          ) : (
            <div className="h-full flex items-end justify-center pb-1">
              <span className="font-serif italic text-slate-400 text-xs">
                (Tanda Tangan Basah)
              </span>
            </div>
          )}
        </div>
        <p className="font-bold text-slate-900 text-xs border-t border-slate-300 pt-1 font-mono">
          {appSettings.adminSignerName}
        </p>
        <p className="text-[10px] text-slate-500">{appSettings.adminSignerTitle}</p>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-2.5 sm:p-6 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94dvh] sm:max-h-[94vh]">
        {/* Bar Pilihan Dokumen */}
        <div className="bg-[#0A192F] px-4 sm:px-6 py-3 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-800 print:hidden shrink-0">
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setDocType('invoice')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center shrink-0 ${
                docType === 'invoice'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5 mr-1.5" />
              <span>Faktur Penjualan</span>
            </button>

            <button
              onClick={() => setDocType('receipt')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center shrink-0 ${
                docType === 'receipt'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Receipt className="w-3.5 h-3.5 mr-1.5" />
              <span>Kwitansi Pembayaran</span>
            </button>

            <button
              onClick={() => setDocType('warehouse_slip')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center shrink-0 ${
                docType === 'warehouse_slip'
                  ? 'bg-amber-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Truck className="w-3.5 h-3.5 mr-1.5" />
              <span>Surat Jalan Gudang</span>
            </button>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg transition flex items-center border border-slate-700"
            >
              <Printer className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
              <span>Cetak / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub-bar Pilihan Format Tanda Tangan Pejabat (QR Code vs TTD Manual) */}
        <div className="bg-slate-100 px-4 sm:px-6 py-2 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs print:hidden shrink-0">
          <span className="text-slate-600 font-medium flex items-center">
            <span className="font-bold text-slate-800 mr-2">Metode Pengesahan Dokumen:</span>
          </span>

          <div className="flex items-center space-x-1.5 bg-white border border-slate-300 p-0.5 rounded-lg">
            <button
              type="button"
              onClick={() => setSignatureChoice('qrcode')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold flex items-center space-x-1 transition ${
                signatureChoice === 'qrcode'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>QR Code Verifikasi</span>
            </button>

            <button
              type="button"
              onClick={() => setSignatureChoice('manual')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold flex items-center space-x-1 transition ${
                signatureChoice === 'manual'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>TTD Manual</span>
            </button>
          </div>
        </div>

        {/* Tampilan Dokumen Siap Cetak */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-slate-200/70 flex justify-center">
          <div className="bg-white max-w-3xl w-full p-8 sm:p-10 rounded-xl shadow-md border border-slate-300 text-slate-800 text-xs relative font-sans print:shadow-none print:border-none print:p-0">
            {/* DOKUMEN 1: FAKTUR PENJUALAN RESMI */}
            {docType === 'invoice' && (
              <div className="space-y-6">
                {/* Kop Surat Faktur */}
                <div className="flex justify-between items-start border-b-2 border-slate-900 pb-5">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-[#0A192F] text-white rounded-xl flex items-center justify-center font-bold text-lg">
                      XNVD
                    </div>
                    <div>
                      <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                        {appSettings.appName}
                      </h1>
                      <p className="text-[11px] text-slate-500 font-medium">Pusat Pelatihan & Pengadaan Bahan Praktik</p>
                      <p className="text-[10px] text-slate-400 max-w-xs">{appSettings.companyAddress}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="inline-block px-3 py-1 rounded bg-slate-900 text-white font-extrabold text-sm tracking-wider uppercase mb-1">
                      FAKTUR PENJUALAN
                    </span>
                    <p className="font-mono font-bold text-xs text-slate-900">{order.invoiceNumber}</p>
                    <p className="text-[10px] text-slate-500">Tanggal: {new Date(order.createdAt).toLocaleDateString('id-ID')}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      STATUS: LUNAS / TERVERIFIKASI
                    </span>
                  </div>
                </div>

                {/* Data Penerima & Pengiriman */}
                <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Ditagihkan Kepada:</span>
                    <p className="font-bold text-slate-900">{order.shippingAddress.fullName}</p>
                    <p className="text-slate-600 font-mono">ID Peserta: #{order.traineeId}</p>
                    <p className="text-slate-600">{order.shippingAddress.addressLine}, {order.shippingAddress.city} {order.shippingAddress.postalCode}</p>
                    <p className="text-slate-600">No. HP: {order.shippingAddress.phone}</p>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Pengiriman & Pembayaran:</span>
                    <p><strong className="text-slate-700">No. Pesanan:</strong> <span className="font-mono">{order.orderNumber}</span></p>
                    <p><strong className="text-slate-700">Layanan Kurir:</strong> {order.deliveryService.name}</p>
                    <p><strong className="text-slate-700">Nomor Resi:</strong> <span className="font-mono text-blue-700 font-bold">{order.trackingNumber}</span></p>
                    <p><strong className="text-slate-700">Metode Bayar:</strong> {order.paymentMethod.replace('_', ' ').toUpperCase()} {order.selectedBank ? `(${order.selectedBank})` : ''}</p>
                    {order.virtualAccountNumber && (
                      <p><strong className="text-slate-700">Kode VA:</strong> <span className="font-mono font-bold">{order.virtualAccountNumber}</span></p>
                    )}
                  </div>
                </div>

                {/* Tabel Barang (Harga Rupiah) */}
                <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                  <thead className="bg-slate-900 text-white text-[10px] uppercase tracking-wider font-bold">
                    <tr>
                      <th className="p-2.5">Nama Peralatan</th>
                      <th className="p-2.5">Kode SKU</th>
                      <th className="p-2.5 text-center">Jumlah</th>
                      <th className="p-2.5 text-right">Harga Asli</th>
                      <th className="p-2.5 text-right">Diskon</th>
                      <th className="p-2.5 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium">
                    {order.items.map((it) => (
                      <tr key={it.product.id}>
                        <td className="p-2.5 font-bold text-slate-900">{it.product.name}</td>
                        <td className="p-2.5 font-mono text-slate-500 text-[10px]">{it.product.sku}</td>
                        <td className="p-2.5 text-center font-mono">{it.quantity}</td>
                        <td className="p-2.5 text-right font-mono">{formatRupiah(it.product.originalPrice)}</td>
                        <td className="p-2.5 text-right font-mono text-emerald-700">-{it.product.discountPercentage}%</td>
                        <td className="p-2.5 text-right font-mono font-bold">{formatRupiah(it.product.finalPrice * it.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Rincian Total Rupiah */}
                <div className="flex justify-end">
                  <div className="w-72 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Total Harga Normal:</span>
                      <span className="font-mono">{formatRupiah(order.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Potongan Diskon Produk:</span>
                      <span className="font-mono">-{formatRupiah(order.productDiscountTotal)}</span>
                    </div>
                    {order.voucherDiscountTotal > 0 && (
                      <div className="flex justify-between text-emerald-700 font-semibold">
                        <span>Voucher ({order.voucherCodeApplied}):</span>
                        <span className="font-mono">-{formatRupiah(order.voucherDiscountTotal)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-600">
                      <span>Ongkos Kirim:</span>
                      <span className="font-mono">{formatRupiah(order.deliveryFee)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Biaya Administrasi:</span>
                      <span className="font-mono">{formatRupiah(order.adminFee)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Biaya Layanan:</span>
                      <span className="font-mono">{formatRupiah(order.serviceFee)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t-2 border-slate-900">
                      <span>Total Pembayaran:</span>
                      <span className="font-mono text-blue-700">{formatRupiah(order.grandTotal)}</span>
                    </div>
                  </div>
                </div>

                {/* Tanda Tangan Pejabat (QR Code / TTD Manual) */}
                <div className="pt-6 border-t border-slate-200 flex justify-between items-end">
                  <div className="text-[10px] text-slate-400 font-mono space-y-0.5">
                    <p>FAKTUR ELEKTRONIK SAH</p>
                    <p>VALIDASI SISTEM: {order.trackingNumber}</p>
                    <p>STANDAR LOGISTIK {appSettings.appName}</p>
                  </div>

                  {renderSignatureSection('Pejabat Penanggung Jawab')}
                </div>
              </div>
            )}

            {/* DOKUMEN 2: KWITANSI PEMBAYARAN RESMI */}
            {docType === 'receipt' && (
              <div className="space-y-6">
                <div className="border-4 border-double border-slate-800 p-6 rounded-xl space-y-6">
                  {/* Header Kwitansi */}
                  <div className="flex justify-between items-center border-b-2 border-slate-800 pb-4">
                    <div>
                      <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                        {appSettings.appName}
                      </h1>
                      <p className="text-xs text-slate-600 font-bold tracking-wider uppercase">
                        KWITANSI PEMBAYARAN RESMI
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-extrabold text-sm text-slate-900 block">
                        {order.receiptNumber}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Tanggal: {new Date(order.createdAt).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                  </div>

                  {/* Isi Kwitansi */}
                  <div className="space-y-4 text-xs">
                    <div className="grid grid-cols-4 gap-2 items-center">
                      <span className="text-slate-500 font-semibold">Telah Diterima Dari</span>
                      <span className="col-span-3 font-bold text-slate-900 text-sm border-b border-dotted border-slate-400 pb-1">
                        {order.shippingAddress.fullName} (Peserta #{order.traineeId})
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 items-center">
                      <span className="text-slate-500 font-semibold">Uang Sejumlah</span>
                      <span className="col-span-3 font-bold text-slate-900 text-sm border-b border-dotted border-slate-400 pb-1 font-mono text-emerald-800">
                        {formatRupiah(order.grandTotal)}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 items-start">
                      <span className="text-slate-500 font-semibold">Untuk Pembayaran</span>
                      <div className="col-span-3 border-b border-dotted border-slate-400 pb-1 text-slate-700">
                        Pelunasan Paket Peralatan & Bahan Praktikum ({order.items.length} jenis item) sesuai pesanan #{order.orderNumber}.
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2 items-center">
                      <span className="text-slate-500 font-semibold">Metode Pembayaran</span>
                      <span className="col-span-3 font-semibold text-slate-800 border-b border-dotted border-slate-400 pb-1 uppercase font-mono">
                        {order.paymentMethod.replace('_', ' ')} {order.selectedBank ? `(${order.selectedBank})` : ''} - LUNAS
                      </span>
                    </div>
                  </div>

                  {/* Cap & Tanda Tangan */}
                  <div className="flex justify-between items-end pt-4">
                    <div className="border-2 border-emerald-600 text-emerald-700 px-5 py-2.5 rounded-lg font-mono font-extrabold text-base inline-block rotate-[-2deg] shadow-xs">
                      TERBILANG: {formatRupiah(order.grandTotal)} [LUNAS]
                    </div>

                    {renderSignatureSection('Pejabat Keuangan & Pengesah')}
                  </div>
                </div>
              </div>
            )}

            {/* DOKUMEN 3: SURAT JALAN PENGIRIMAN GUDANG */}
            {docType === 'warehouse_slip' && (
              <div className="space-y-6">
                <div className="border-2 border-slate-900 p-6 rounded-xl space-y-6">
                  {/* Header Surat Jalan */}
                  <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
                    <div>
                      <div className="flex items-center space-x-2">
                        <Truck className="w-6 h-6 text-slate-900" />
                        <h1 className="text-lg font-extrabold text-slate-900 tracking-tight uppercase">
                          SURAT JALAN PENGIRIMAN GUDANG
                        </h1>
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">Depo Logistik Pusat {appSettings.appName}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-extrabold text-sm text-slate-900 block">
                        {order.warehouseSlipNumber}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        Tanggal Kirim: {new Date(order.createdAt).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                  </div>

                  {/* Info Tujuan & Ekspedisi */}
                  <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-300 text-xs font-mono">
                    <div>
                      <span className="text-[10px] font-sans font-bold text-slate-500 uppercase block mb-1">
                        Alamat Tujuan Penerima:
                      </span>
                      <p className="font-bold text-slate-900 text-sm">{order.shippingAddress.fullName}</p>
                      <p className="text-slate-600 font-sans">ID Peserta: #{order.traineeId}</p>
                      <p className="text-slate-600">{order.shippingAddress.addressLine}</p>
                      <p className="text-slate-600">{order.shippingAddress.city} {order.shippingAddress.postalCode}</p>
                      <p className="text-slate-600 font-sans">No. HP: {order.shippingAddress.phone}</p>
                    </div>

                    <div>
                      <span className="text-[10px] font-sans font-bold text-slate-500 uppercase block mb-1">
                        Rincian Logistik & Kurir:
                      </span>
                      <p><span className="text-slate-500 font-sans">Ekspedisi:</span> <strong>{order.deliveryService.name}</strong></p>
                      <p><span className="text-slate-500 font-sans">Nomor Resi:</span> <strong className="text-blue-700">{order.trackingNumber}</strong></p>
                      <p><span className="text-slate-500 font-sans">No. Pesanan:</span> {order.orderNumber}</p>
                      <p><span className="text-slate-500 font-sans">Segel Keamanan:</span> <span className="text-emerald-700 font-bold">SEGEL-XNVD-PASS</span></p>
                      {order.shippingAddress.deliveryNotes && (
                        <p className="text-[11px] text-amber-700 font-sans mt-1">
                          Catatan: {order.shippingAddress.deliveryNotes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Daftar Item Fisik */}
                  <div className="border border-slate-300 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-800 text-white text-[10px] uppercase font-bold">
                        <tr>
                          <th className="p-2 w-8 text-center">No</th>
                          <th className="p-2">Nama Barang / Komponen</th>
                          <th className="p-2">Kode SKU</th>
                          <th className="p-2 text-center">Kuantitas</th>
                          <th className="p-2 text-center">Kondisi</th>
                          <th className="p-2 text-center">Inspeksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-300">
                        {order.items.map((it, idx) => (
                          <tr key={it.product.id}>
                            <td className="p-2 border-r border-slate-300 font-mono text-center">{idx + 1}</td>
                            <td className="p-2 border-r border-slate-300 font-bold text-slate-900">{it.product.name}</td>
                            <td className="p-2 border-r border-slate-300 font-mono text-[10px]">{it.product.sku}</td>
                            <td className="p-2 border-r border-slate-300 text-center font-mono font-bold">{it.quantity} Unit</td>
                            <td className="p-2 border-r border-slate-300 text-center text-emerald-700 font-bold">Baru & Bersegel</td>
                            <td className="p-2 text-center text-blue-700 font-mono font-bold">LULUS QA [✓]</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Kolom Tanda Tangan */}
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t-2 border-slate-900 text-center text-xs">
                    <div className="flex flex-col items-center">
                      <p className="font-bold text-slate-700 mb-1">Pengesah Depo Gudang</p>
                      {renderSignatureSection('Petugas Gudang')}
                    </div>

                    <div>
                      <p className="font-bold text-slate-700 mb-2">Petugas Kurir</p>
                      <div className="h-12 flex items-center justify-center">
                        <span className="font-mono text-slate-400 italic text-[11px]">(Tanda Tangan Kurir)</span>
                      </div>
                      <p className="font-bold text-slate-900 border-t border-slate-300 pt-1 font-mono">
                        {order.deliveryService.name}
                      </p>
                      <span className="text-[10px] text-slate-500">Petugas Pengantar</span>
                    </div>

                    <div>
                      <p className="font-bold text-slate-700 mb-2">Penerima (Peserta)</p>
                      <div className="h-12 flex items-center justify-center">
                        <span className="font-mono text-slate-400 italic text-[11px]">(Tanda Tangan & Nama)</span>
                      </div>
                      <p className="font-bold text-slate-900 border-t border-slate-300 pt-1 font-mono">
                        {order.shippingAddress.fullName}
                      </p>
                      <span className="text-[10px] text-slate-500">ID #{order.traineeId}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
