import React, { useState, useRef, useEffect } from 'react';
import {
  Settings,
  PenTool,
  Upload,
  CheckCircle2,
  RotateCcw,
  ShieldCheck,
  KeyRound,
  AlertCircle,
  QrCode,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AppSettingsView: React.FC = () => {
  const { appSettings, updateAppSettings, currentUser, updateAdminCredentials, syncMasterStateToServer, refreshServerState } = useApp();

  const [appName, setAppName] = useState(appSettings.appName);
  const [appLogoUrl, setAppLogoUrl] = useState(appSettings.appLogoUrl || '');
  const [adminSignerName, setAdminSignerName] = useState(appSettings.adminSignerName);
  const [adminSignerTitle, setAdminSignerTitle] = useState(appSettings.adminSignerTitle);
  const [supportEmail, setSupportEmail] = useState(appSettings.supportEmail);
  const [companyAddress, setCompanyAddress] = useState(appSettings.companyAddress);

  // Pilihan Tanda Tangan: QR Code atau TTD Manual
  const [signatureType, setSignatureType] = useState<'qrcode' | 'manual'>(
    appSettings.adminSignatureType === 'qrcode' ? 'qrcode' : 'manual'
  );
  const [manualInputMode, setManualInputMode] = useState<'drawn' | 'uploaded'>('drawn');
  const [signatureDataUrl, setSignatureDataUrl] = useState(appSettings.adminSignatureDataUrl);

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form Ganti Kata Sandi & ID Admin
  const [newAdminId, setNewAdminId] = useState(currentUser?.id || 'admin');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [credError, setCredError] = useState<string | null>(null);
  const [credSuccess, setCredSuccess] = useState<string | null>(null);

  // Canvas untuk tanda tangan elektronik
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    if (signatureType === 'manual' && manualInputMode === 'drawn' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#0F172A';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (signatureDataUrl && signatureDataUrl.startsWith('data:image')) {
          const img = new window.Image();
          img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          };
          img.src = signatureDataUrl;
        }
      }
    }
  }, [signatureType, manualInputMode]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (canvasRef.current) {
      setSignatureDataUrl(canvasRef.current.toDataURL('image/png'));
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureDataUrl('');
  };

  const handleManualSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setSignatureDataUrl(uploadEvent.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = async (uploadEvent) => {
        if (uploadEvent.target?.result) {
          const base64 = uploadEvent.target.result as string;
          setAppLogoUrl(base64);
          try {
            const resp = await fetch('/api/upload/image', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ dataUrl: base64 })
            });
            const data = await resp.json();
            if (data.success && data.imageUrl) {
              setAppLogoUrl(data.imageUrl);
            }
          } catch (err) {
            console.warn('Fallback to base64 for logo:', err);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      appName: appName.trim(),
      appLogoUrl: appLogoUrl.trim(),
      adminSignerName: adminSignerName.trim(),
      adminSignerTitle: adminSignerTitle.trim(),
      supportEmail: supportEmail.trim(),
      companyAddress: companyAddress.trim(),
      adminSignatureType: signatureType,
      adminSignatureDataUrl: signatureDataUrl
    };

    await updateAppSettings(updated);
    await syncMasterStateToServer({
      appSettings: { ...appSettings, ...updated }
    });
    await refreshServerState();

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleUpdateAdminPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setCredError(null);
    setCredSuccess(null);

    if (!currentPassword) {
      setCredError('Kata sandi saat ini wajib diisi untuk verifikasi keamanan.');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setCredError('Kata sandi baru dan konfirmasi kata sandi tidak cocok.');
      return;
    }

    const res = await updateAdminCredentials({
      currentPassword,
      newId: newAdminId.trim(),
      newPassword: newPassword.trim() || undefined
    });

    if (!res.success) {
      setCredError(res.error || 'Gagal memperbarui kredensial.');
    } else {
      setCredSuccess('Kredensial administrator berhasil diperbarui dan tersimpan permanen!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Pengaturan Sistem & Pengesahan Dokumen
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Atur identitas lembaga, pilih metode pengesahan pejabat (QR Code / TTD Manual), dan amankan akun admin.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Pengaturan Berhasil Disimpan!</span>
          </div>
        )}
      </div>

      {/* Formulir Pengaturan Umum & Tanda Tangan */}
      <form onSubmit={handleSaveGeneral} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* BAGIAN 1: IDENTITAS LEMBAGA */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Settings className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-xs text-slate-900">Identitas Portal Pelatihan</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Nama Aplikasi / Lembaga
              </label>
              <input
                type="text"
                required
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Logo Lembaga Pelatihan
              </label>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center font-bold text-xs text-slate-400 shrink-0">
                  {appLogoUrl ? (
                    <img src={appLogoUrl} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    'LOGO'
                  )}
                </div>
                <div className="flex-1">
                  <label className="cursor-pointer inline-flex items-center px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition">
                    <Upload className="w-3.5 h-3.5 mr-1.5" />
                    Pilih File Gambar Logo
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </label>
                  <p className="text-[10px] text-slate-400 mt-1">PNG atau JPG maks 2MB.</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Email Layanan Bantuan
              </label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Alamat Lembaga Pelatihan
              </label>
              <textarea
                rows={2}
                value={companyAddress}
                onChange={(e) => setCompanyAddress(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>

            <button
              type="submit"
              className="mt-2 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
            >
              Simpan Identitas & Pilihan Pengesahan
            </button>
          </div>
        </div>

        {/* BAGIAN 2: PILIHAN PENGESAHAN DOKUMEN: QR CODE vs TTD MANUAL */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <PenTool className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-xs text-slate-900">Tanda Tangan Pejabat Pengesah Dokumen</h3>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Nama Pejabat Penandatangan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={adminSignerName}
                  onChange={(e) => setAdminSignerName(e.target.value)}
                  className="w-full px-3 py-2 font-bold bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Jabatan Resmi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={adminSignerTitle}
                  onChange={(e) => setAdminSignerTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            {/* TAB UTAMA: PILIHAN QR CODE ATAU TTD MANUAL */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                Pilih Format Tanda Tangan Dokumen:
              </label>
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl font-bold text-xs">
                <button
                  type="button"
                  onClick={() => setSignatureType('qrcode')}
                  className={`py-2 px-3 rounded-lg transition flex items-center justify-center space-x-1.5 ${
                    signatureType === 'qrcode'
                      ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <QrCode className="w-4 h-4 text-indigo-600" />
                  <span>QR Code Verifikasi</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSignatureType('manual')}
                  className={`py-2 px-3 rounded-lg transition flex items-center justify-center space-x-1.5 ${
                    signatureType === 'manual'
                      ? 'bg-white text-blue-700 shadow-sm border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <PenTool className="w-4 h-4 text-blue-600" />
                  <span>TTD Manual</span>
                </button>
              </div>
            </div>

            {/* TAMPILAN JIKA PILIH QR CODE */}
            {signatureType === 'qrcode' && (
              <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-200/80 space-y-3 animate-in fade-in">
                <div className="flex items-start space-x-3">
                  {/* Visual QR Code SVG Elearning XNVD */}
                  <div className="w-20 h-20 bg-white border border-indigo-200 rounded-xl p-1.5 flex flex-col items-center justify-center shrink-0 shadow-2xs">
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
                      {/* Center dots / Pattern */}
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

                  <div className="flex-1 space-y-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                      <Check className="w-3 h-3 mr-1" />
                      Tanda Tangan Digital Terverifikasi
                    </span>
                    <p className="font-bold text-slate-900 text-xs">
                      Dokumen disahkan dengan QR Code Resmi
                    </p>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Dokumen faktur, kwitansi, dan surat jalan akan mencantumkan kode QR verifikasi elektronik yang terhubung dengan identitas pejabat pengesah: <strong className="text-slate-800">{adminSignerName}</strong>.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAMPILAN JIKA PILIH TTD MANUAL */}
            {signatureType === 'manual' && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 animate-in fade-in">
                {/* Sub-mode TTD Manual */}
                <div className="flex bg-white border border-slate-200 p-0.5 rounded-lg text-[11px] font-semibold">
                  <button
                    type="button"
                    onClick={() => setManualInputMode('drawn')}
                    className={`flex-1 py-1 rounded transition text-center ${
                      manualInputMode === 'drawn' ? 'bg-blue-600 text-white shadow-2xs font-bold' : 'text-slate-600'
                    }`}
                  >
                    Gores Elektronik
                  </button>
                  <button
                    type="button"
                    onClick={() => setManualInputMode('uploaded')}
                    className={`flex-1 py-1 rounded transition text-center ${
                      manualInputMode === 'uploaded' ? 'bg-blue-600 text-white shadow-2xs font-bold' : 'text-slate-600'
                    }`}
                  >
                    Unggah Gambar Tanda Tangan
                  </button>
                </div>

                {manualInputMode === 'drawn' ? (
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-bold text-slate-600">Goreskan tanda tangan Anda pada bidang berikut:</span>
                      <button
                        type="button"
                        onClick={clearCanvas}
                        className="text-red-600 hover:underline flex items-center font-bold"
                      >
                        <RotateCcw className="w-3 h-3 mr-0.5" /> Bersihkan
                      </button>
                    </div>

                    <div className="border border-slate-300 rounded-xl bg-white p-1 overflow-hidden shadow-inner">
                      <canvas
                        ref={canvasRef}
                        width={360}
                        height={100}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        className="w-full h-24 bg-white cursor-crosshair rounded-lg touch-none"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-700">
                      Ambil File Gambar Tanda Tangan (PNG / JPG)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleManualSignatureUpload}
                      className="w-full text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-blue-50 file:text-blue-700"
                    />
                  </div>
                )}

                {/* Pratinjau TTD Manual */}
                <div className="pt-2 border-t border-slate-200 text-center">
                  <span className="text-[10px] text-slate-400 font-mono block mb-1">
                    Pratinjau Hasil Tanda Tangan Dokumen:
                  </span>
                  <div className="h-12 flex items-center justify-center">
                    {signatureDataUrl ? (
                      <img src={signatureDataUrl} alt="TTD" className="max-h-12 object-contain mx-auto" />
                    ) : (
                      <span className="font-serif italic text-slate-400 text-sm">
                        (Belum ada goresan/gambar, akan memakai garis TTD fisik)
                      </span>
                    )}
                  </div>
                  <p className="font-bold text-slate-900 border-t border-slate-300 pt-1 font-mono text-xs">
                    {adminSignerName}
                  </p>
                  <p className="text-[10px] text-slate-500">{adminSignerTitle}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </form>

      {/* BAGIAN 3: KEAMANAN KREDENSIAL ADMINISTRATOR */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-amber-600" />
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Keamanan & Kata Sandi Akun Administrator
              </h3>
              <p className="text-[11px] text-slate-500">
                Akun administrator ini permanen di server. Anda dapat mengubah ID dan kata sandi agar hanya Anda yang memiliki hak akses saat aplikasi dipublikasikan.
              </p>
            </div>
          </div>
        </div>

        {credError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{credError}</span>
          </div>
        )}

        {credSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-800 font-semibold flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{credSuccess}</span>
          </div>
        )}

        <form onSubmit={handleUpdateAdminPassword} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              ID Administrator
            </label>
            <div className="relative">
              <KeyRound className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={newAdminId}
                onChange={(e) => setNewAdminId(e.target.value)}
                placeholder="admin"
                className="w-full pl-8 pr-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Kata Sandi Saat Ini <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Masukkan password saat ini"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Kata Sandi Baru
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Kosongkan bila tidak diubah"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Konfirmasi Sandi Baru
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ulangi kata sandi baru"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-xs transition"
            >
              Perbarui Kredensial Administrator
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
