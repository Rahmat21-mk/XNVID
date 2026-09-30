import React, { useState } from 'react';
import {
  CreditCard,
  QrCode,
  DollarSign,
  FileText,
  Upload,
  CheckCircle2,
  Plus,
  Trash2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { VirtualAccountBank } from '../../types';

export const PaymentSettingsView: React.FC = () => {
  const { paymentSettings, updatePaymentSettings, syncMasterStateToServer, refreshServerState } = useApp();

  const [adminFee, setAdminFee] = useState<number>(paymentSettings.adminFee);
  const [serviceFee, setServiceFee] = useState<number>(paymentSettings.serviceFee);
  const [banks, setBanks] = useState<VirtualAccountBank[]>(paymentSettings.virtualAccountBanks);

  const [qrisMerchantName, setQrisMerchantName] = useState(paymentSettings.qrisMerchantName);
  const [qrisNmid, setQrisNmid] = useState(paymentSettings.qrisNmid);
  const [qrisCustomImageUrl, setQrisCustomImageUrl] = useState(paymentSettings.qrisCustomImageUrl || '');

  const [invoicePrefix, setInvoicePrefix] = useState(paymentSettings.invoicePrefix);
  const [receiptPrefix, setReceiptPrefix] = useState(paymentSettings.receiptPrefix);
  const [warehouseSlipPrefix, setWarehouseSlipPrefix] = useState(paymentSettings.warehouseSlipPrefix);

  const [manualBankName, setManualBankName] = useState(paymentSettings.manualBankName);
  const [manualBankAccount, setManualBankAccount] = useState(paymentSettings.manualBankAccount);
  const [manualBankHolder, setManualBankHolder] = useState(paymentSettings.manualBankHolder);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleToggleBank = (id: string) => {
    setBanks(banks.map(b => b.id === id ? { ...b, active: !b.active } : b));
  };

  const handleUpdateBankPrefix = (id: string, prefix: string) => {
    setBanks(banks.map(b => b.id === id ? { ...b, accountPrefix: prefix } : b));
  };

  const handleAddBank = () => {
    const newBank: VirtualAccountBank = {
      id: `bank-${Date.now()}`,
      bankName: 'CIMB Niaga Virtual Account',
      bankCode: '022',
      accountPrefix: '78291',
      active: true
    };
    setBanks([...banks, newBank]);
  };

  const handleDeleteBank = (id: string) => {
    setBanks(banks.filter(b => b.id !== id));
  };

  const handleQRISFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = async (uploadEvent) => {
        if (uploadEvent.target?.result) {
          const base64 = uploadEvent.target.result as string;
          setQrisCustomImageUrl(base64);
          try {
            const resp = await fetch('/api/upload/image', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ dataUrl: base64 })
            });
            const data = await resp.json();
            if (data.success && data.imageUrl) {
              setQrisCustomImageUrl(data.imageUrl);
            }
          } catch (err) {
            console.warn('Fallback base64 QRIS:', err);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      adminFee: Number(adminFee),
      serviceFee: Number(serviceFee),
      virtualAccountBanks: banks,
      qrisMerchantName: qrisMerchantName.trim(),
      qrisNmid: qrisNmid.trim(),
      qrisCustomImageUrl: qrisCustomImageUrl.trim(),
      invoicePrefix: invoicePrefix.trim(),
      receiptPrefix: receiptPrefix.trim(),
      warehouseSlipPrefix: warehouseSlipPrefix.trim(),
      manualBankName: manualBankName.trim(),
      manualBankAccount: manualBankAccount.trim(),
      manualBankHolder: manualBankHolder.trim()
    };

    await updatePaymentSettings(updated);
    await syncMasterStateToServer({
      paymentSettings: { ...paymentSettings, ...updated }
    });
    await refreshServerState();

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <form onSubmit={handleSaveAll} className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Pengaturan Pembayaran & Format Nomor Dokumen
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Konfigurasi Virtual Account bank, gambar QRIS, tarif biaya admin & layanan, dan format penomoran dokumen.
          </p>
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center transition shrink-0"
        >
          <CheckCircle2 className="w-4 h-4 mr-1.5" />
          <span>Simpan Pengaturan</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-800 font-semibold flex items-center">
          <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600" />
          Pengaturan pembayaran dan format dokumen berhasil disimpan!
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* BAGIAN 1: VIRTUAL ACCOUNT */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center space-x-2">
              <CreditCard className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-xs text-slate-900">Pengaturan Virtual Account Bank</h3>
            </div>
            <button
              type="button"
              onClick={handleAddBank}
              className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center"
            >
              <Plus className="w-3 h-3 mr-0.5" /> Tambah Bank
            </button>
          </div>

          <div className="space-y-2.5">
            {banks.map((b) => (
              <div
                key={b.id}
                className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
              >
                <div className="flex items-center space-x-2.5">
                  <input
                    type="checkbox"
                    checked={b.active}
                    onChange={() => handleToggleBank(b.id)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <div>
                    <span className="font-bold text-slate-900 block">{b.bankName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">Kode: {b.bankCode}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Prefix VA</span>
                    <input
                      type="text"
                      value={b.accountPrefix}
                      onChange={(e) => handleUpdateBankPrefix(b.id, e.target.value)}
                      className="w-16 px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono font-bold text-xs"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteBank(b.id)}
                    className="p-1 text-slate-400 hover:text-red-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BAGIAN 2: PENGATURAN QRIS */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3.5">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-2.5">
            <QrCode className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-xs text-slate-900">Pengaturan QRIS & Gambar Barcode</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Nama Merchant QRIS</label>
              <input
                type="text"
                required
                value={qrisMerchantName}
                onChange={(e) => setQrisMerchantName(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">NMID (National Merchant ID)</label>
              <input
                type="text"
                required
                value={qrisNmid}
                onChange={(e) => setQrisNmid(e.target.value)}
                className="w-full px-2.5 py-1.5 font-mono bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Upload Gambar QRIS Kustom</label>
              <div className="flex items-center space-x-3">
                <label className="flex-1 px-3 py-2 border border-dashed border-slate-300 rounded-xl text-center cursor-pointer hover:bg-slate-50">
                  <Upload className="w-4 h-4 mx-auto text-slate-400 mb-0.5" />
                  <span className="text-[11px] text-slate-600">Pilih berkas gambar QRIS</span>
                  <input type="file" accept="image/*" onChange={handleQRISFileUpload} className="hidden" />
                </label>

                {qrisCustomImageUrl ? (
                  <div className="w-14 h-14 rounded-lg border border-slate-200 overflow-hidden bg-white p-1">
                    <img src={qrisCustomImageUrl} alt="QRIS" className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-slate-900 text-white flex flex-col items-center justify-center text-[8px] font-mono">
                    <QrCode className="w-6 h-6" />
                    <span>DEFAULT</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* BAGIAN 3: BIAYA ADMIN & LAYANAN */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3.5">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-2.5">
            <DollarSign className="w-4 h-4 text-amber-600" />
            <h3 className="font-bold text-xs text-slate-900">Biaya Admin & Biaya Layanan</h3>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Biaya Admin ($)</label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={adminFee}
                onChange={(e) => setAdminFee(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 font-mono font-bold bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Biaya Layanan ($)</label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={serviceFee}
                onChange={(e) => setServiceFee(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 font-mono font-bold bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>

            <div className="col-span-2 pt-1">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Rekening Transfer Manual</label>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Nama Bank"
                  value={manualBankName}
                  onChange={(e) => setManualBankName(e.target.value)}
                  className="px-2 py-1 bg-slate-50 border border-slate-300 rounded text-xs"
                />
                <input
                  type="text"
                  placeholder="Nomor Rekening"
                  value={manualBankAccount}
                  onChange={(e) => setManualBankAccount(e.target.value)}
                  className="px-2 py-1 bg-slate-50 border border-slate-300 rounded text-xs font-mono"
                />
                <input
                  type="text"
                  placeholder="Atas Nama"
                  value={manualBankHolder}
                  onChange={(e) => setManualBankHolder(e.target.value)}
                  className="px-2 py-1 bg-slate-50 border border-slate-300 rounded text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* BAGIAN 4: FORMAT PENOMORAN DOKUMEN */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3.5">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-2.5">
            <FileText className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-xs text-slate-900">Format Awalan Dokumen Resmi</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Awalan Faktur / Invoice</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={invoicePrefix}
                  onChange={(e) => setInvoicePrefix(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 font-mono font-bold bg-slate-50 border border-slate-300 rounded-lg"
                />
                <span className="text-slate-400 font-mono text-xs">/0082</span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Awalan Kwitansi Pembayaran</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={receiptPrefix}
                  onChange={(e) => setReceiptPrefix(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 font-mono font-bold bg-slate-50 border border-slate-300 rounded-lg"
                />
                <span className="text-slate-400 font-mono text-xs">/0082</span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Awalan Surat Jalan Gudang</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={warehouseSlipPrefix}
                  onChange={(e) => setWarehouseSlipPrefix(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 font-mono font-bold bg-slate-50 border border-slate-300 rounded-lg"
                />
                <span className="text-slate-400 font-mono text-xs">/0082</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
