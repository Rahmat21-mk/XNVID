import React, { useState } from 'react';
import {
  Truck,
  Plus,
  Trash2,
  Package,
  FileCheck,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DeliveryServiceConfig, Order, OrderStatus } from '../../types';
import { formatRupiah } from '../../utils/format';

interface DeliveryManagementViewProps {
  onOpenDocument: (order: Order, docType: 'invoice' | 'receipt' | 'warehouse_slip') => void;
}

export const DeliveryManagementView: React.FC<DeliveryManagementViewProps> = ({ onOpenDocument }) => {
  const { deliveryServices, updateDeliveryServices, orders, updateOrderStatus } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'couriers' | 'shipments'>('couriers');

  // Modal Kurir Baru
  const [isAddCourierModalOpen, setIsAddCourierModalOpen] = useState(false);
  const [courierName, setCourierName] = useState('');
  const [courierCode, setCourierCode] = useState('');
  const [baseFee, setBaseFee] = useState<number>(15);
  const [estimatedDays, setEstimatedDays] = useState('2 - 3 Hari Kerja');

  // Modal Update Resi
  const [selectedOrderForStatus, setSelectedOrderForStatus] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>('in_transit');
  const [trackingNumberInput, setTrackingNumberInput] = useState('');
  const [checkpointNote, setCheckpointNote] = useState('');

  const handleToggleCourier = (id: string) => {
    updateDeliveryServices(
      deliveryServices.map(d => d.id === id ? { ...d, active: !d.active } : d)
    );
  };

  const handleDeleteCourier = (id: string) => {
    if (deliveryServices.length <= 1) {
      alert('Minimal harus ada satu layanan kurir aktif.');
      return;
    }
    updateDeliveryServices(deliveryServices.filter(d => d.id !== id));
  };

  const handleAddCourier = (e: React.FormEvent) => {
    e.preventDefault();
    const newService: DeliveryServiceConfig = {
      id: `DEL-${Date.now().toString().slice(-4)}`,
      name: courierName.trim(),
      code: courierCode.trim().toUpperCase() || `KURIR-${Date.now().toString().slice(-3)}`,
      baseFee: Number(baseFee),
      estimatedDays: estimatedDays.trim(),
      active: true,
      securityInspectionIncluded: true
    };

    updateDeliveryServices([...deliveryServices, newService]);
    setIsAddCourierModalOpen(false);
    setCourierName('');
    setCourierCode('');
  };

  const handleUpdateOrderStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForStatus) return;

    updateOrderStatus(
      selectedOrderForStatus.id,
      newStatus,
      checkpointNote.trim() || undefined,
      trackingNumberInput.trim() || undefined
    );

    setSelectedOrderForStatus(null);
    setCheckpointNote('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Pengaturan Layanan Pengiriman & Resi
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Konfigurasi tarif kurir manual dan pembaruan status pelacakan pengiriman peralatan.
          </p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveSubTab('couriers')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeSubTab === 'couriers'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Layanan Kurir ({deliveryServices.length})
          </button>
          <button
            onClick={() => setActiveSubTab('shipments')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeSubTab === 'shipments'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Antrean Pengiriman ({orders.length})
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: KONFIGURASI KURIR */}
      {activeSubTab === 'couriers' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Daftar Ekspedisi Kurir Aktif
            </span>
            <button
              onClick={() => setIsAddCourierModalOpen(true)}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center transition"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Tambah Kurir Baru</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {deliveryServices.map((d) => (
              <div
                key={d.id}
                className={`bg-white rounded-xl border p-4 shadow-2xs flex flex-col justify-between transition ${
                  d.active ? 'border-slate-200' : 'border-slate-200 opacity-60 bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
                      {d.code}
                    </span>
                    <label className="flex items-center space-x-1.5 cursor-pointer text-xs">
                      <input
                        type="checkbox"
                        checked={d.active}
                        onChange={() => handleToggleCourier(d.id)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="text-[11px] font-semibold text-slate-600">
                        {d.active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </label>
                  </div>

                  <h3 className="font-bold text-xs text-slate-900 leading-snug">
                    {d.name}
                  </h3>

                  <div className="mt-3 space-y-1 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span>Tarif Dasar:</span>
                      <span className="font-mono font-bold text-slate-900">{formatRupiah(d.baseFee)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Estimasi:</span>
                      <span className="font-semibold text-slate-800">{d.estimatedDays}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-2.5 border-t border-slate-100 flex justify-between items-center text-[10px]">
                  <span className="text-slate-400 font-mono">ID: {d.id}</span>
                  <button
                    onClick={() => handleDeleteCourier(d.id)}
                    className="p-1 text-slate-400 hover:text-red-600"
                    title="Hapus Kurir"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: ANTREAN RESI PENGIRIMAN */}
      {activeSubTab === 'shipments' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
            <span className="font-bold text-xs text-slate-800 uppercase tracking-wider">
              Daftar Resi & Pengiriman Gudang
            </span>
            <span className="text-xs text-slate-500">
              Total: <strong>{orders.length}</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">No. Pesanan / Peserta</th>
                  <th className="px-4 py-3">Kurir & Nomor Resi</th>
                  <th className="px-4 py-3">Tujuan Pengiriman</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-4 py-2.5">
                      <span className="font-bold text-slate-900 font-mono block">
                        {ord.orderNumber}
                      </span>
                      <span className="text-slate-500 text-[10px]">
                        Peserta #{ord.traineeId} • {ord.traineeName}
                      </span>
                    </td>

                    <td className="px-4 py-2.5">
                      <span className="font-semibold text-slate-800 block text-xs">
                        {ord.deliveryService.name}
                      </span>
                      <span className="font-mono text-blue-700 font-bold text-[11px]">
                        {ord.trackingNumber}
                      </span>
                    </td>

                    <td className="px-4 py-2.5 text-slate-600 max-w-xs truncate">
                      {ord.shippingAddress.city} • {ord.shippingAddress.addressLine}
                    </td>

                    <td className="px-4 py-2.5 font-mono font-bold text-slate-900">
                      {formatRupiah(ord.grandTotal)}
                    </td>

                    <td className="px-4 py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        ord.status === 'delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ord.status === 'in_transit'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {ord.status.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="px-4 py-2.5 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => {
                            setSelectedOrderForStatus(ord);
                            setNewStatus(ord.status);
                            setTrackingNumberInput(ord.trackingNumber);
                            setCheckpointNote('');
                          }}
                          className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg text-[11px]"
                        >
                          Ubah Status
                        </button>

                        <button
                          onClick={() => onOpenDocument(ord, 'warehouse_slip')}
                          className="px-2 py-1 border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold rounded-lg text-[11px] flex items-center"
                          title="Cetak Surat Jalan"
                        >
                          <FileCheck className="w-3.5 h-3.5 mr-0.5 text-slate-500" />
                          <span>Surat Jalan</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH KURIR */}
      {isAddCourierModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-[#0A192F] px-5 py-3.5 text-white flex items-center justify-between border-b border-slate-800">
              <h3 className="font-bold text-sm">Tambah Layanan Kurir</h3>
              <button onClick={() => setIsAddCourierModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCourier} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Nama Ekspedisi / Kurir <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  placeholder="Contoh: JNE Reguler Terpantau"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Kode Layanan
                </label>
                <input
                  type="text"
                  value={courierCode}
                  onChange={(e) => setCourierCode(e.target.value)}
                  placeholder="JNE-REG"
                  className="w-full px-2.5 py-1.5 font-mono uppercase bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Tarif Dasar (Rp) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="1000"
                    min="0"
                    required
                    value={baseFee}
                    onChange={(e) => setBaseFee(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 font-mono font-bold bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Estimasi Waktu
                  </label>
                  <input
                    type="text"
                    required
                    value={estimatedDays}
                    onChange={(e) => setEstimatedDays(e.target.value)}
                    placeholder="2 - 3 Hari"
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddCourierModalOpen(false)}
                  className="px-3.5 py-1.5 border border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm"
                >
                  Simpan Kurir
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL UPDATE STATUS RESI */}
      {selectedOrderForStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-[#0A192F] px-5 py-3.5 text-white flex items-center justify-between border-b border-slate-800">
              <h3 className="font-bold text-sm">Pembaruan Status Pengiriman</h3>
              <button onClick={() => setSelectedOrderForStatus(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateOrderStatus} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Status Pengiriman
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-semibold"
                >
                  <option value="paid_packing">Pengemasan & Pemeriksaan Keamanan Gudang</option>
                  <option value="in_transit">Dalam Pengiriman (Transit Kurir)</option>
                  <option value="delivered">Paket Berhasil Diterima Peserta</option>
                  <option value="pending_payment">Menunggu Pembayaran</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Nomor Resi Pelacakan
                </label>
                <input
                  type="text"
                  value={trackingNumberInput}
                  onChange={(e) => setTrackingNumberInput(e.target.value)}
                  className="w-full px-2.5 py-1.5 font-mono font-bold bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Catatan Posisi / Checkpoint
                </label>
                <textarea
                  rows={2}
                  value={checkpointNote}
                  onChange={(e) => setCheckpointNote(e.target.value)}
                  placeholder="Contoh: Paket tiba di Hub Sortir Jakarta Timur."
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrderForStatus(null)}
                  className="px-3.5 py-1.5 border border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm"
                >
                  Perbarui Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
