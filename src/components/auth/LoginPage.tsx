import React, { useState } from 'react';
import {
  GraduationCap,
  Lock,
  User as UserIcon,
  Mail,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const LoginPage: React.FC = () => {
  const {
    appSettings,
    loginAsTrainee,
    registerTrainee,
    loginAsAdmin,
    allUsers
  } = useApp();

  const [activeTab, setActiveTab] = useState<'trainee-login' | 'trainee-register' | 'admin-login' | 'forgot-id'>('trainee-login');

  // Login Peserta (Hanya ID 6-Digit)
  const [traineeId, setTraineeId] = useState('');

  // Pendaftaran Peserta (Hanya Nama & Email - ID 6-digit dibuat otomatis)
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [generatedNewId, setGeneratedNewId] = useState<string | null>(null);

  // Login Admin (ID & Password - Hanya 1 Akun Tunggal)
  const [adminUser, setAdminUser] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // Cari ID 6-Digit (Lupa ID)
  const [lookupEmail, setLookupEmail] = useState('');
  const [foundTraineeId, setFoundTraineeId] = useState<string | null>(null);

  // Notifikasi status
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Handle Login Peserta (Hanya perlu 6-digit ID)
  const handleTraineeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const res = await loginAsTrainee(traineeId);
    if (!res.success) {
      setErrorMsg(res.error || 'Gagal masuk');
    }
  };

  // Handle Daftar Peserta (Nama & Email saja, ID dibuat otomatis)
  const handleTraineeRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const res = await registerTrainee({
      name: regName,
      email: regEmail
    });

    if (!res.success) {
      setErrorMsg(res.error || 'Pendaftaran gagal');
    } else if (res.generatedId) {
      setGeneratedNewId(res.generatedId);
      setSuccessMsg(`Pendaftaran berhasil! ID 6-digit Anda adalah #${res.generatedId}`);
    }
  };

  // Handle Login Admin (ID & Password)
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const res = await loginAsAdmin(adminUser, adminPassword);
    if (!res.success) {
      setErrorMsg(res.error || 'Otentikasi admin gagal');
    }
  };

  // Handle Lupa ID
  const handleForgotLookup = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const match = allUsers.find(
      u => u.email.toLowerCase() === lookupEmail.trim().toLowerCase() && u.role === 'trainee'
    );
    if (match) {
      setFoundTraineeId(match.id);
    } else {
      setErrorMsg('Email tersebut belum terdaftar sebagai peserta.');
      setFoundTraineeId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Kartu Utama */}
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[560px]">
        {/* KOLOM KIRI: Navy Blue Branding (5 kolom) */}
        <div className="lg:col-span-5 bg-[#0A192F] text-white p-8 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            {/* Logo & Judul */}
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/30">
                {appSettings.appLogoUrl ? (
                  <img src={appSettings.appLogoUrl} alt="Logo" className="w-7 h-7 object-contain" />
                ) : (
                  <GraduationCap className="w-6 h-6" />
                )}
              </div>
              <div>
                <h1 className="font-extrabold text-xl tracking-tight text-white">
                  {appSettings.appName}
                </h1>
                <p className="text-[11px] font-medium text-blue-300">
                  Portal Pelatihan & Sertifikasi
                </p>
              </div>
            </div>

            <h2 className="text-xl font-bold text-slate-100 leading-snug">
              Pelatihan Praktik & Pembelian Alat Praktikum
            </h2>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Akses modul pembelajaran interaktif, toko resmi pengadaan peralatan bersertifikat, dan pelacakan pengiriman aman.
            </p>

            {/* Poin Utama Singkat & Padat */}
            <div className="mt-6 space-y-2.5 text-xs text-slate-300">
              <div className="flex items-center space-x-2.5">
                <div className="w-2 h-2 rounded-full bg-blue-400" />
                <span>20 Video Modul Praktik Industri</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Toko Bahan Praktik & Diskon Khusus</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                <span>Pengiriman Terpantau & Dokumen Resmi</span>
              </div>
            </div>
          </div>

          {/* Jaminan Keamanan Sistem */}
          <div className="mt-8 pt-4 border-t border-slate-800 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              Keamanan Data & Privasi
            </span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Data peserta dan akun administrator tersimpan aman di server terpusat. Setiap sesi peserta terverifikasi melalui nomor ID unik 6-digit.
            </p>
          </div>
        </div>

        {/* KOLOM KANAN: Formulir Masuk & Daftar (7 kolom) */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between bg-white">
          <div>
            {/* Navigasi Tab */}
            <div className="flex border-b border-slate-200 pb-2 mb-6 space-x-3 sm:space-x-4 text-xs font-semibold overflow-x-auto scrollbar-none">
              <button
                onClick={() => {
                  setActiveTab('trainee-login');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`pb-2 transition ${
                  activeTab === 'trainee-login'
                    ? 'border-b-2 border-blue-600 text-blue-700 font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Masuk Peserta
              </button>

              <button
                onClick={() => {
                  setActiveTab('trainee-register');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                  setGeneratedNewId(null);
                }}
                className={`pb-2 transition ${
                  activeTab === 'trainee-register'
                    ? 'border-b-2 border-blue-600 text-blue-700 font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Daftar Akun Baru
              </button>

              <button
                onClick={() => {
                  setActiveTab('admin-login');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`pb-2 transition ${
                  activeTab === 'admin-login'
                    ? 'border-b-2 border-amber-600 text-amber-700 font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Masuk Admin
              </button>
            </div>

            {/* Pesan Kesalahan / Sukses */}
            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* 1. FORM LOGIN PESERTA (HANYA BUTUH ID 6-DIGIT, TANPA PASSWORD) */}
            {activeTab === 'trainee-login' && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Masuk Peserta
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Masukkan nomor ID 6-digit Anda untuk langsung membuka modul pelatihan.
                  </p>
                </div>

                <form onSubmit={handleTraineeLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Nomor ID Peserta (6 Digit) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={traineeId}
                        onChange={(e) => setTraineeId(e.target.value.replace(/\D/g, ''))}
                        placeholder="Contoh: 104821"
                        className="w-full pl-10 pr-4 py-2.5 text-sm font-mono tracking-widest bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                      />
                    </div>
                    <div className="flex justify-between items-center mt-1 text-xs">
                      <span className="text-[11px] text-slate-400">
                        Cukup masukkan 6 digit ID (tanpa password).
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('forgot-id');
                          setErrorMsg(null);
                        }}
                        className="text-[11px] text-blue-600 hover:underline font-semibold"
                      >
                        Lupa ID?
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center justify-center space-x-1.5 active:scale-98"
                  >
                    <span>Masuk ke Dashboard Peserta</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={async () => {
                        setTraineeId('104821');
                        setErrorMsg(null);
                        await loginAsTrainee('104821');
                      }}
                      className="w-full py-2 px-3 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 transition flex items-center justify-center space-x-2"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      <span>Masuk Cepat Peserta (ID: 104821)</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 2. FORM PENDAFTARAN PESERTA (ID 6-DIGIT OTOMATIS, TANPA PASSWORD & DEPARTEMEN) */}
            {activeTab === 'trainee-register' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Pendaftaran Akun Peserta Baru
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    ID 6-digit akan dibuatkan secara otomatis oleh sistem. Tidak perlu kata sandi.
                  </p>
                </div>

                {!generatedNewId ? (
                  <form onSubmit={handleTraineeRegister} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Nama Lengkap <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          placeholder="Masukkan nama lengkap peserta"
                          className="w-full pl-10 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Alamat Email <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="nama@email.com"
                          className="w-full pl-10 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-[11px] text-blue-800 space-y-1">
                      <p className="font-bold flex items-center">
                        <Sparkles className="w-3.5 h-3.5 mr-1 text-blue-600" />
                        ID 6-Digit Otomatis:
                      </p>
                      <p className="text-slate-600">
                        Setelah menekan tombol daftar, sistem akan langsung membuatkan 6-digit ID unik untuk Anda masuk ke pelatihan kapan saja.
                      </p>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition"
                    >
                      Daftar & Buat ID 6-Digit Otomatis
                    </button>
                  </form>
                ) : (
                  <div className="p-5 bg-emerald-50 border border-emerald-300 rounded-2xl text-center space-y-3">
                    <p className="text-xs text-emerald-800 font-semibold">
                      Akun berhasil terdaftar! Berikut adalah ID 6-digit Anda:
                    </p>
                    <div className="py-2 px-4 bg-white border border-emerald-300 rounded-xl inline-block shadow-xs">
                      <span className="text-3xl font-mono font-extrabold text-emerald-700 tracking-widest">
                        {generatedNewId}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Simpan nomor ID ini untuk masuk ke akun Anda.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        loginAsTrainee(generatedNewId);
                      }}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition"
                    >
                      Lanjut Masuk ke Dashboard →
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 3. FORM LOGIN ADMIN (HANYA 1 AKUN TUNGGAL DENGAN ID & PASSWORD) */}
            {activeTab === 'admin-login' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center">
                    <ShieldCheck className="w-5 h-5 mr-1.5 text-amber-600" />
                    Portal Administrator
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Akses satu akun admin tunggal untuk mengelola seluruh data sistem.
                  </p>
                </div>

                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      ID Administrator
                    </label>
                    <input
                      type="text"
                      required
                      value={adminUser}
                      onChange={(e) => setAdminUser(e.target.value)}
                      placeholder="Masukkan ID admin"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Kata Sandi
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center justify-center space-x-1.5"
                  >
                    <span>Masuk Administrator</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

            {/* 4. CARI NOMOR ID (LUPA ID) */}
            {activeTab === 'forgot-id' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Cari Nomor ID Peserta
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Masukkan email terdaftar untuk melihat kembali 6-digit ID Anda.
                  </p>
                </div>

                <form onSubmit={handleForgotLookup} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Email Terdaftar
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={lookupEmail}
                        onChange={(e) => setLookupEmail(e.target.value)}
                        placeholder="contoh: siti.rahmawati@gmail.com"
                        className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition"
                  >
                    Temukan ID Saya
                  </button>
                </form>

                {foundTraineeId && (
                  <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-center space-y-2">
                    <p className="text-xs text-emerald-800 font-semibold">Nomor ID 6-Digit Anda Adalah:</p>
                    <p className="text-2xl font-mono font-extrabold text-emerald-700 tracking-widest">
                      {foundTraineeId}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setTraineeId(foundTraineeId);
                        setActiveTab('trainee-login');
                      }}
                      className="text-xs font-bold text-emerald-800 underline hover:text-emerald-950 block mx-auto"
                    >
                      Gunakan ID untuk Masuk →
                    </button>
                  </div>
                )}

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => setActiveTab('trainee-login')}
                    className="text-xs text-slate-500 hover:text-slate-800"
                  >
                    ← Kembali ke Halaman Masuk
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Catatan Kaki */}
          <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>© 2026 Elearning XNVD</span>
            <span className="font-mono">Sistem Siap Digunakan</span>
          </div>
        </div>
      </div>
    </div>
  );
};
