import React, { useState } from 'react';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  FileText,
  Receipt,
  FileCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Order } from '../../types';
import { formatRupiah } from '../../utils/format';

interface TraineeOrdersViewProps {
  onOpenDocument: (order: Order, docType: 'invoice' | 'receipt' | 'warehouse_slip') => void;
}

export const TraineeOrdersView: React.FC<TraineeOrdersViewProps> = ({ onOpenDocument }) => {
  const { orders, currentUser } = useApp();

  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(
    orders[0]?.id || null
  );

  const traineeOrders = orders.filter(
    o => o.traineeId === currentUser?.id || currentUser?.role === 'admin'
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" /> Diterima
          </span>
        );
      case 'in_transit':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
            <Truck className="w-3 h-3 mr-1 text-blue-600" /> Dalam Pengiriman
          </span>
        );
      case 'paid_packing':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
            <Package className="w-3 h-3 mr-1 text-amber-600" /> Pengemasan & Segel
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800">
            <Clock className="w-3 h-3 mr-1" /> Menunggu Pembayaran
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Pesanan & Pengiriman Peralatan Praktik
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Pantau proses pengiriman dan unduh dokumen resmi faktur, kwitansi, serta surat jalan gudang.
        </p>
      </div>

      {traineeOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
          <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-slate-800">Belum Ada Pesanan</h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Anda belum melakukan pembelian alat praktik. Kunjungi toko praktik untuk memesan peralatan.
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {traineeOrders.map((order) => {
            const isExpanded = expandedOrderId === order.id;

            return (
              <div
                key={order.id}
                className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden"
              >
                {/* Bar Atas Pesanan */}
                <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-xs text-slate-900 font-mono">
                          {order.orderNumber}
                        </span>
                        {getStatusBadge(order.status)}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString('id-ID')} • Kurir: {order.deliveryService.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 justify-between md:justify-end">
                    <div className="text-right">
                      <span className="block text-[10px] text-slate-400 font-medium">Total Tagihan</span>
                      <span className="text-sm font-extrabold text-slate-900 font-mono">
                        {formatRupiah(order.grandTotal)}
                      </span>
                    </div>

                    <button
                      onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                      className="p-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-600 text-xs font-semibold flex items-center"
                    >
                      <span className="mr-1">{isExpanded ? 'Tutup' : 'Rincian & Resi'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Rincian Tambahan */}
                {isExpanded && (
                  <div className="p-4 bg-slate-50/60 space-y-4">
                    {/* Tombol Akses Dokumen Resmi */}
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                      <span className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Dokumen Resmi (Siap Cetak & Unduh)
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <button
                          onClick={() => onOpenDocument(order, 'invoice')}
                          className="flex items-center space-x-2.5 p-2.5 bg-slate-50 hover:bg-blue-50/60 border border-slate-200 rounded-lg text-left transition"
                        >
                          <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                          <div>
                            <span className="block text-xs font-bold text-slate-900">Faktur / Invoice</span>
                            <span className="text-[10px] text-slate-400 font-mono">{order.invoiceNumber}</span>
                          </div>
                        </button>

                        <button
                          onClick={() => onOpenDocument(order, 'receipt')}
                          className="flex items-center space-x-2.5 p-2.5 bg-slate-50 hover:bg-emerald-50/60 border border-slate-200 rounded-lg text-left transition"
                        >
                          <Receipt className="w-4 h-4 text-emerald-600 shrink-0" />
                          <div>
                            <span className="block text-xs font-bold text-slate-900">Kwitansi Pembayaran</span>
                            <span className="text-[10px] text-slate-400 font-mono">{order.receiptNumber}</span>
                          </div>
                        </button>

                        <button
                          onClick={() => onOpenDocument(order, 'warehouse_slip')}
                          className="flex items-center space-x-2.5 p-2.5 bg-slate-50 hover:bg-amber-50/60 border border-slate-200 rounded-lg text-left transition"
                        >
                          <FileCheck className="w-4 h-4 text-amber-600 shrink-0" />
                          <div>
                            <span className="block text-xs font-bold text-slate-900">Surat Jalan Gudang</span>
                            <span className="text-[10px] text-slate-400 font-mono">{order.warehouseSlipNumber}</span>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Timeline Pelacakan Pengiriman */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 mb-3">
                        <span className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center">
                          <Truck className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                          Riwayat Pelacakan Pengiriman
                        </span>
                        <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          Resi: {order.trackingNumber}
                        </span>
                      </div>

                      <div className="relative pl-5 space-y-4 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                        {order.trackingSteps.map((step, idx) => (
                          <div key={idx} className="relative">
                            <div
                              className={`absolute -left-[23px] top-0.5 w-3.5 h-3.5 rounded-full border-2 ${
                                step.completed
                                  ? 'bg-blue-600 border-white ring-2 ring-blue-500'
                                  : 'bg-white border-slate-300'
                              }`}
                            />
                            <div>
                              <div className="flex items-baseline space-x-2">
                                <h4 className={`text-xs font-bold ${step.completed ? 'text-slate-900' : 'text-slate-400'}`}>
                                  {step.title}
                                </h4>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {step.timestamp}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                {step.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Barang yang Dipesan */}
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                      <span className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Peralatan yang Dipesan:
                      </span>
                      <div className="divide-y divide-slate-100 text-xs">
                        {order.items.map((it) => (
                          <div key={it.product.id} className="py-1.5 flex items-center justify-between">
                            <div className="flex items-center space-x-2.5">
                              <img
                                src={it.product.image}
                                alt={it.product.name}
                                className="w-8 h-8 object-cover rounded-md border border-slate-200"
                              />
                              <div>
                                <span className="font-semibold text-slate-800 text-xs">{it.product.name}</span>
                                <span className="block text-[10px] text-slate-400 font-mono">SKU: {it.product.sku} • Jumlah: {it.quantity}</span>
                              </div>
                            </div>
                            <span className="font-mono font-bold text-slate-900">
                              {formatRupiah(it.product.finalPrice * it.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
