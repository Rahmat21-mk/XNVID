import React, { useState } from 'react';
import {
  Users,
  Search,
  KeyRound,
  Eye,
  Clock,
  Award,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  X
} from 'lucide-react';
import { User } from '../../types';
import { useApp } from '../../context/AppContext';

export const ParticipantManagement: React.FC = () => {
  const { allUsers, watchLogs, videos, resetParticipantId } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrainee, setSelectedTrainee] = useState<User | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetTargetUser, setResetTargetUser] = useState<User | null>(null);
  const [newIdInput, setNewIdInput] = useState('');
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);

  const trainees = allUsers.filter(u => u.role === 'trainee').filter(u =>
    u.id.includes(searchQuery) ||
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}m ${s.toString().padStart(2, '0')}d`;
  };

  const handleOpenReset = (user: User) => {
    setResetTargetUser(user);
    setNewIdInput(user.id);
    setResetError(null);
    setResetSuccess(null);
    setIsResetModalOpen(true);
  };

  const handleExecuteReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTargetUser) return;
    setResetError(null);
    setResetSuccess(null);

    const res = await resetParticipantId(
      resetTargetUser.id,
      newIdInput.trim()
    );

    if (!res.success) {
      setResetError(res.error || 'Gagal mengubah ID peserta');
    } else {
      setResetSuccess(`Nomor ID peserta berhasil diperbarui menjadi #${newIdInput.trim()}!`);
      setTimeout(() => {
        setIsResetModalOpen(false);
        setResetSuccess(null);
      }, 1200);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Halaman */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Data Peserta & Pemantauan Durasi Tonton Tersembunyi
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Pantau judul video dan durasi tonton aktif peserta untuk penilaian kompetensi praktikum; atur ulang ID 6-digit.
        </p>
      </div>

      {/* Pemberitahuan Pemantauan Tersembunyi */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start space-x-2.5 text-xs text-amber-900">
        <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block">Pemantauan Durasi Video Secara Tersembunyi Aktif</span>
          <p className="mt-0.5 text-amber-800 text-[11px] leading-relaxed">
            Sistem merekam durasi tonton aktif tiap video secara otomatis tanpa memberitahukan peserta bahwa durasi tonton merupakan bagian dari penilaian.
          </p>
        </div>
      </div>

      {/* Kolom Pencarian */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari berdasarkan ID 6-digit, nama, atau email peserta..."
          className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
        />
      </div>

      {/* Tabel Data Peserta */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">ID 6-Digit</th>
                <th className="px-4 py-3">Nama Peserta & Email</th>
                <th className="px-4 py-3">Modul Ditonton</th>
                <th className="px-4 py-3">Total Durasi Terpantau</th>
                <th className="px-4 py-3">Tingkat Ketekunan</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {trainees.map((t) => {
                const logs = watchLogs[t.id] || [];
                const totalSeconds = logs.reduce((acc, l) => acc + l.watchedSeconds, 0);
                const avgPercentage = logs.length > 0
                  ? Math.round(logs.reduce((acc, l) => acc + l.watchPercentage, 0) / logs.length)
                  : 0;

                return (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-4 py-2.5">
                      <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        #{t.id}
                      </span>
                    </td>

                    <td className="px-4 py-2.5">
                      <div className="flex items-center space-x-2">
                        <img
                          src={t.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${t.name}`}
                          alt={t.name}
                          className="w-7 h-7 rounded-full border border-slate-200 object-cover"
                        />
                        <div>
                          <span className="font-bold text-slate-900 block">{t.name}</span>
                          <span className="text-[10px] text-slate-400">{t.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-2.5 font-mono font-bold text-slate-900">
                      {logs.length} / {videos.length} Modul
                    </td>

                    <td className="px-4 py-2.5">
                      <div className="flex items-center space-x-1 font-mono text-slate-800 font-bold">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>{formatSeconds(totalSeconds)}</span>
                      </div>
                    </td>

                    <td className="px-4 py-2.5">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full ${
                              avgPercentage >= 80 ? 'bg-emerald-500' : avgPercentage >= 50 ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${avgPercentage}%` }}
                          />
                        </div>
                        <span className="font-mono font-bold text-[11px]">{avgPercentage}%</span>
                      </div>
                    </td>

                    <td className="px-4 py-2.5 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => setSelectedTrainee(t)}
                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] rounded-lg transition flex items-center"
                          title="Lihat riwayat video & durasi tonton"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          <span>Pantau</span>
                        </button>

                        <button
                          onClick={() => handleOpenReset(t)}
                          className="px-2.5 py-1 border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-[11px] rounded-lg transition flex items-center"
                          title="Reset ID 6-digit peserta"
                        >
                          <KeyRound className="w-3 h-3 mr-1 text-slate-500" />
                          <span>Reset ID</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL PEMANTAUAN DURASI TONTON PESERTA (PARTICIPANT DASHBOARD) */}
      {selectedTrainee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="bg-[#0A192F] px-5 py-3.5 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <Award className="w-4 h-4 text-blue-400" />
                <div>
                  <h3 className="font-bold text-sm">
                    Data Durasi Tonton: {selectedTrainee.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    ID Peserta: #{selectedTrainee.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTrainee(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* Ringkasan Statistik */}
              {(() => {
                const logs = watchLogs[selectedTrainee.id] || [];
                const totalWatched = logs.reduce((a, b) => a + b.watchedSeconds, 0);
                const avgPercent = logs.length > 0
                  ? Math.round(logs.reduce((a, b) => a + b.watchPercentage, 0) / logs.length)
                  : 0;

                return (
                  <div className="grid grid-cols-3 gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Waktu Terpantau</span>
                      <span className="font-mono font-bold text-slate-900 text-sm mt-0.5 block">
                        {formatSeconds(totalWatched)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Modul Selesai</span>
                      <span className="font-mono font-bold text-blue-700 text-sm mt-0.5 block">
                        {logs.length} / {videos.length}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Rata-Rata Tonton</span>
                      <span className="font-mono font-bold text-emerald-700 text-sm mt-0.5 block">
                        {avgPercent}%
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Rincian Judul Video dan Durasi Tonton */}
              <div className="space-y-2">
                <span className="font-bold text-xs text-slate-800 uppercase tracking-wider block">
                  Judul Video & Durasi Waktu Tonton Aktual:
                </span>

                {(watchLogs[selectedTrainee.id] || []).length === 0 ? (
                  <div className="p-6 text-center bg-slate-50 border border-slate-200 rounded-xl text-slate-500 text-xs">
                    Belum ada rekaman durasi tonton untuk peserta ini.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                    {(watchLogs[selectedTrainee.id] || []).map((log) => {
                      const isComplete = log.watchPercentage >= 85;

                      return (
                        <div key={log.videoId} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50/50">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-slate-900 text-xs">
                                {log.videoTitle}
                              </span>
                              {isComplete && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">
                                  Lengkap
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">
                              Ref: {log.videoId} • Terakhir: {new Date(log.lastWatchedAt).toLocaleDateString('id-ID')}
                            </span>
                          </div>

                          <div className="text-right font-mono shrink-0 ml-4">
                            <span className="font-bold text-slate-900 text-xs block">
                              {formatSeconds(log.watchedSeconds)} / {formatSeconds(log.durationSeconds)}
                            </span>
                            <span className={`text-[10px] font-bold ${isComplete ? 'text-emerald-700' : 'text-amber-700'}`}>
                              {log.watchPercentage}% Ditonton
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs">
              <span className="text-slate-400 italic text-[11px]">
                Data penilaian internal. Tidak ditampilkan kepada peserta.
              </span>
              <button
                onClick={() => setSelectedTrainee(null)}
                className="px-3.5 py-1.5 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL RESET ID 6-DIGIT PESERTA */}
      {isResetModalOpen && resetTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-[#0A192F] px-5 py-3.5 text-white flex items-center justify-between border-b border-slate-800">
              <h3 className="font-bold text-sm">Reset ID Peserta (6 Digit)</h3>
              <button onClick={() => setIsResetModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleExecuteReset} className="p-5 space-y-3.5 text-xs">
              {resetError && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center space-x-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                  <span>{resetError}</span>
                </div>
              )}

              {resetSuccess && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{resetSuccess}</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Nama Peserta
                </label>
                <input
                  type="text"
                  disabled
                  value={resetTargetUser.name}
                  className="w-full px-2.5 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-600 font-semibold cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Nomor ID 6-Digit Baru <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={newIdInput}
                  onChange={(e) => setNewIdInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="Contoh: 504812"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono text-sm tracking-widest text-center font-bold"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block text-center">
                  Harus terdiri dari tepat 6 digit angka.
                </span>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsResetModalOpen(false)}
                  className="px-3.5 py-1.5 border border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-sm"
                >
                  Simpan ID Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
