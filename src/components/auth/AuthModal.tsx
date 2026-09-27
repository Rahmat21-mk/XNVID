import React, { useState } from 'react';
import {
  X,
  Lock,
  User as UserIcon,
  Mail,
  KeyRound,
  ShieldCheck,
  GraduationCap,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'trainee-login' | 'trainee-register' | 'admin-login' | 'forgot-id';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'trainee-login'
}) => {
  const { loginAsTrainee, registerTrainee, loginAsAdmin, allUsers } = useApp();

  const [activeTab, setActiveTab] = useState<'trainee-login' | 'trainee-register' | 'admin-login' | 'forgot-id'>(initialTab);

  // Login Peserta (Hanya ID 6-Digit)
  const [traineeId, setTraineeId] = useState('');

  // Pendaftaran Peserta (Nama & Email, ID otomatis, tanpa password & departemen)
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [generatedNewId, setGeneratedNewId] = useState<string | null>(null);

  // Login Admin (Hanya 1 akun tunggal)
  const [adminUser, setAdminUser] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // Lupa ID Peserta
  const [lookupEmail, setLookupEmail] = useState('');
  const [foundTraineeId, setFoundTraineeId] = useState<string | null>(null);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTraineeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const res = await loginAsTrainee(traineeId);
    if (!res.success) {
      setErrorMsg(res.error || 'Gagal masuk');
    } else {
      onClose();
    }
  };

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

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const res = await loginAsAdmin(adminUser, adminPassword);
    if (!res.success) {
      setErrorMsg(res.error || 'Otentikasi admin gagal');
    } else {
      onClose();
    }
  };

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header Modal */}
        <div className="bg-[#0A192F] px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm leading-tight">Elearning XNVD</h3>
              <p className="text-[11px] text-slate-400">Masuk Akun atau Pendaftaran Baru</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Pilihan */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold">
          <button
            onClick={() => {
              setActiveTab('trainee-login');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 py-2.5 text-center transition ${
              activeTab === 'trainee-login'
                ? 'bg-white text-blue-700 border-b-2 border-blue-600 font-bold'
                : 'text-slate-600 hover:text-slate-900'
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
            className={`flex-1 py-2.5 text-center transition ${
              activeTab === 'trainee-register'
                ? 'bg-white text-blue-700 border-b-2 border-blue-600 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Daftar Peserta
          </button>
          <button
            onClick={() => {
              setActiveTab('admin-login');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 py-2.5 text-center transition ${
              activeTab === 'admin-login'
                ? 'bg-white text-amber-700 border-b-2 border-amber-600 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Admin
          </button>
        </div>

        {/* Notifikasi Status */}
        {errorMsg && (
          <div className="mx-5 mt-4 p-2.5 bg-red-50 border border-red-200 rounded-lg flex items-center text-xs text-red-700">
            <AlertCircle className="w-4 h-4 mr-2 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mx-5 mt-4 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center text-xs text-emerald-700">
            <CheckCircle2 className="w-4 h-4 mr-2 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form Container */}
        <div className="p-5">
          {/* TAB 1: LOGIN PESERTA */}
          {activeTab === 'trainee-login' && (
            <form onSubmit={handleTraineeLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nomor ID Peserta (6 Digit)
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={traineeId}
                    onChange={(e) => setTraineeId(e.target.value.replace(/\D/g, ''))}
                    placeholder="Contoh: 104821"
                    className="w-full pl-9 pr-3 py-2 text-xs font-mono tracking-widest bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                  />
                </div>
                <div className="flex justify-between items-center mt-1 text-[11px]">
                  <span className="text-slate-400">Masuk hanya dengan 6 digit ID</span>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('forgot-id');
                      setErrorMsg(null);
                    }}
                    className="text-blue-600 hover:underline font-semibold"
                  >
                    Lupa ID?
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
              >
                Masuk ke Modul Pelatihan
              </button>
            </form>
          )}

          {/* TAB 2: DAFTAR PESERTA (OTOMATIS 6 DIGIT ID) */}
          {activeTab === 'trainee-register' && (
            <div className="space-y-3.5">
              {!generatedNewId ? (
                <form onSubmit={handleTraineeRegister} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nama Lengkap
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="Nama lengkap peserta"
                        className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Alamat Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="nama@email.com"
                        className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-[11px] text-blue-900">
                    <span className="font-bold flex items-center mb-0.5">
                      <Sparkles className="w-3.5 h-3.5 mr-1 text-blue-600" />
                      ID 6-Digit Dibuat Otomatis
                    </span>
                    <p className="text-slate-600">
                      Sistem akan membuatkan nomor ID 6-digit unik tanpa perlu password.
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
                  >
                    Daftar Sekarang
                  </button>
                </form>
              ) : (
                <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-center space-y-2">
                  <p className="text-xs text-emerald-800 font-semibold">
                    Akun Anda Berhasil Dibuat!
                  </p>
                  <p className="text-2xl font-mono font-extrabold text-emerald-700 tracking-widest">
                    #{generatedNewId}
                  </p>
                  <p className="text-[11px] text-slate-600">
                    Simpan ID 6-digit di atas untuk masuk ke sistem kapan saja.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      loginAsTrainee(generatedNewId);
                      onClose();
                    }}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition"
                  >
                    Lanjut ke Aplikasi →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: LOGIN ADMIN */}
          {activeTab === 'admin-login' && (
            <form onSubmit={handleAdminLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ID Administrator
                </label>
                <div className="relative">
                  <ShieldCheck className="w-4 h-4 text-amber-600 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={adminUser}
                    onChange={(e) => setAdminUser(e.target.value)}
                    placeholder="admin"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
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
                className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center space-x-1"
              >
                <span>Masuk Administrator</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          {/* TAB 4: LUPA ID */}
          {activeTab === 'forgot-id' && (
            <div className="space-y-3.5">
              <form onSubmit={handleForgotLookup} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Terdaftar
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={lookupEmail}
                      onChange={(e) => setLookupEmail(e.target.value)}
                      placeholder="nama@email.com"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition"
                >
                  Cari ID Saya
                </button>
              </form>

              {foundTraineeId && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-center space-y-1.5">
                  <p className="text-[11px] text-emerald-800 font-semibold">Nomor ID Anda:</p>
                  <p className="text-xl font-mono font-extrabold text-emerald-700 tracking-wider">
                    #{foundTraineeId}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setTraineeId(foundTraineeId);
                      setActiveTab('trainee-login');
                    }}
                    className="text-xs font-bold text-emerald-800 underline hover:text-emerald-950 block mx-auto"
                  >
                    Gunakan untuk Masuk
                  </button>
                </div>
              )}

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('trainee-login')}
                  className="text-xs text-slate-500 hover:text-slate-800"
                >
                  ← Kembali
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
