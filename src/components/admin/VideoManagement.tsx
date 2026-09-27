import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  Trash2,
  Play,
  AlertTriangle,
  CheckCircle2,
  Search,
  X,
  Loader2,
  FileVideo,
  Sparkles,
  Layers,
  Check
} from 'lucide-react';
import { VideoItem } from '../../types';
import { useApp } from '../../context/AppContext';
import { VideoPlayerModal } from '../trainee/VideoPlayerModal';

interface StagedVideo {
  file: File;
  title: string;
  durationSeconds: number;
  durationFormatted: string;
  fileSizeMb: number;
  description: string;
  thumbnail: string;
  videoUrl?: string;
  status: 'ready' | 'uploading' | 'done' | 'duplicate';
}

const INDUSTRIAL_THUMBNAILS = [
  'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f9?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=600&q=80'
];

export const VideoManagement: React.FC = () => {
  const { videos, addVideosBatch, deleteVideo } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [previewVideo, setPreviewVideo] = useState<VideoItem | null>(null);

  // Staged files for batch upload (minimal 4 video)
  const [stagedVideos, setStagedVideos] = useState<StagedVideo[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Target repositori 200 video
  const REPOSITORY_TARGET = 200;

  // Filter video berdasarkan pencarian nama atau ID (tanpa kategori)
  const filteredVideos = videos.filter(v => {
    const q = searchQuery.toLowerCase();
    return (
      v.title.toLowerCase().includes(q) ||
      v.id.toLowerCase().includes(q) ||
      v.description.toLowerCase().includes(q)
    );
  });

  // Ekstrak nama judul otomatis dan bersihkan
  const formatAutoTitle = (fileName: string, indexOffset: number): string => {
    const raw = fileName.replace(/\.[^/.]+$/, ''); // Hapus ekstensi (.mp4, .mkv, dll)
    const cleaned = raw
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Huruf kapital awal setiap kata
    const titled = cleaned
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');

    // Bila judul tidak mengandung modul, berikan penomoran rapi
    if (!/modul/i.test(titled)) {
      const nextNum = videos.length + indexOffset + 1;
      return `Modul ${String(nextNum).padStart(2, '0')}: ${titled}`;
    }
    return titled;
  };

  // Parsing durasi dari file video asli secara otomatis
  const parseVideoMetadata = (file: File, indexOffset: number): Promise<StagedVideo> => {
    return new Promise((resolve) => {
      const videoElement = document.createElement('video');
      videoElement.preload = 'metadata';
      const objectUrl = URL.createObjectURL(file);
      videoElement.src = objectUrl;

      const fallbackDuration = 300 + Math.floor(Math.random() * 600); // 5 - 15 menit (standar)
      const sizeMb = Number((file.size / (1024 * 1024)).toFixed(1));
      const autoTitle = formatAutoTitle(file.name, indexOffset);
      const thumb = INDUSTRIAL_THUMBNAILS[(videos.length + indexOffset) % INDUSTRIAL_THUMBNAILS.length];

      // Cek apakah judul sudah pernah terdaftar di sistem
      const isDuplicate = videos.some(v => v.title.trim().toLowerCase() === autoTitle.toLowerCase());

      const finalize = (durationSecs: number) => {
        // Normalisasi batas durasi jika file demo/uji coba terlalu singkat/panjang
        const safeDuration = durationSecs >= 60 ? Math.round(durationSecs) : fallbackDuration;
        const m = Math.floor(safeDuration / 60);
        const s = safeDuration % 60;
        const durFormatted = `${m}m ${String(s).padStart(2, '0')}d`;

        resolve({
          file,
          title: autoTitle,
          durationSeconds: safeDuration,
          durationFormatted: durFormatted,
          fileSizeMb: sizeMb > 0 ? sizeMb : Math.round(safeDuration * 0.35),
          description: `Modul pelatihan materi praktikum teknik industri: ${autoTitle}.`,
          thumbnail: thumb,
          videoUrl: objectUrl,
          status: isDuplicate ? 'duplicate' : 'ready'
        });
      };

      videoElement.onloadedmetadata = () => {
        const dur = videoElement.duration;
        if (!isNaN(dur) && isFinite(dur) && dur > 0) {
          finalize(dur);
        } else {
          finalize(fallbackDuration);
        }
      };

      videoElement.onerror = () => {
        finalize(fallbackDuration);
      };

      // Timeout proteksi jika browser tidak mendukung decoding codec tertentu
      setTimeout(() => {
        finalize(fallbackDuration);
      }, 1200);
    });
  };

  // Handler pemilihan berkas video (multi-select / batch)
  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormError(null);
    setFormSuccess(null);

    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);

    // Proses semua file secara otomatis
    const parsedList: StagedVideo[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const staged = await parseVideoMetadata(fileList[i], stagedVideos.length + i);
      parsedList.push(staged);
    }

    const combined = [...stagedVideos, ...parsedList];
    setStagedVideos(combined);

    // Reset input agar bisa pilih berkas lagi jika ingin menambah
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    if (combined.length < 4) {
      setFormError(`Perhatian: Anda baru memilih ${combined.length} video. Disarankan memilih minimal 4 video sekali upload agar proses pemenuhan 200 video cepat selesai.`);
    }
  };

  // Hapus salah satu berkas dari antrean upload
  const removeStagedVideo = (index: number) => {
    const updated = stagedVideos.filter((_, idx) => idx !== index);
    setStagedVideos(updated);
    if (updated.length > 0 && updated.length < 4) {
      setFormError(`Perhatian: Jumlah video saat ini ${updated.length}. Minimal 4 video dalam sekali unggah.`);
    } else {
      setFormError(null);
    }
  };

  // Eksekusi Unggah Batch ke Sistem
  const handleExecuteBatchUpload = async () => {
    setFormError(null);
    setFormSuccess(null);

    if (stagedVideos.length === 0) {
      setFormError('Silakan pilih berkas video terlebih dahulu.');
      return;
    }

    if (stagedVideos.length < 4) {
      setFormError(`Syarat Unggah Batch: Minimal 4 video sekaligus dalam sekali proses (Saat ini: ${stagedVideos.length} video). Tambahkan minimal ${4 - stagedVideos.length} video lagi.`);
      return;
    }

    const validVideos = stagedVideos.filter(v => v.status !== 'duplicate');
    if (validVideos.length === 0) {
      setFormError('Semua video yang dipilih terdeteksi sudah pernah diunggah (duplikat).');
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    // Animasi progress bar dinamis
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) return 90;
        return prev + 20;
      });
    }, 400);

    try {
      const payload = validVideos.map(v => ({
        title: v.title,
        description: v.description,
        durationSeconds: v.durationSeconds,
        thumbnail: v.thumbnail,
        fileSizeMb: v.fileSizeMb,
        videoUrl: v.videoUrl
      }));

      const res = await addVideosBatch(payload);

      clearInterval(interval);
      setUploadProgress(100);

      if (res.success) {
        setFormSuccess(`Berhasil mengunggah ${res.count} video pelatihan baru! Judul, durasi, dan spesifikasi telah terisi otomatis.`);
        setTimeout(() => {
          setIsUploading(false);
          setIsUploadModalOpen(false);
          setStagedVideos([]);
          setFormSuccess(null);
          setUploadProgress(0);
        }, 1500);
      } else {
        setIsUploading(false);
        setFormError(res.error || 'Gagal menyimpan data video.');
      }
    } catch {
      clearInterval(interval);
      setIsUploading(false);
      setFormError('Terjadi kesalahan saat mengunggah video.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Repositori Video Pelatihan
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Unggah video batch (minimal 4 video sekaligus) dengan pengisian judul dan durasi otomatis. Kapasitas repositori: 200 video.
          </p>
        </div>

        <button
          onClick={() => {
            setFormError(null);
            setFormSuccess(null);
            setStagedVideos([]);
            setIsUploadModalOpen(true);
          }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center transition shrink-0"
        >
          <UploadCloud className="w-4 h-4 mr-2" />
          <span>Upload Video Baru (Batch)</span>
        </button>
      </div>

      {/* Bar Status Kapasitas 200 Video */}
      <div className="bg-[#0A192F] text-white rounded-2xl p-5 shadow-sm border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-600/30 text-blue-400 flex items-center justify-center font-extrabold text-lg border border-blue-500/40 shrink-0">
              {videos.length}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="font-bold text-sm text-slate-100">
                  Kapasitas Repositori Video ({videos.length} / {REPOSITORY_TARGET})
                </h4>
                {videos.length >= REPOSITORY_TARGET && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Target 200 Lengkap
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {videos.length >= REPOSITORY_TARGET
                  ? 'Kapasitas 200 video pelatihan telah terpenuhi secara penuh.'
                  : `Tersedia slot untuk ${REPOSITORY_TARGET - videos.length} video lagi menuju batas 200 video.`}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-[11px] font-mono shrink-0">
            <span className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 flex items-center">
              <Layers className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
              Batch Min. 4 Video
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 flex items-center">
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
              Judul Otomatis
            </span>
          </div>
        </div>

        {/* Progress Bar Kapasitas */}
        <div className="mt-4 pt-3 border-t border-slate-800/80">
          <div className="flex justify-between text-[11px] text-slate-400 font-mono mb-1.5">
            <span>Penyimpanan Terpakai: {videos.length} Video</span>
            <span>{Math.round((videos.length / REPOSITORY_TARGET) * 100)}% Kapasitas</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (videos.length / REPOSITORY_TARGET) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Pencarian (Kategori telah dihapus) */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari modul video berdasarkan judul atau nomor referensi..."
          className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        />
      </div>

      {/* Tabel Daftar Video */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3 w-12 text-center">No</th>
                <th className="px-4 py-3">Modul & Judul Video</th>
                <th className="px-4 py-3">Durasi</th>
                <th className="px-4 py-3">Ukuran File</th>
                <th className="px-4 py-3">Tanggal Unggah</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredVideos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400 text-xs">
                    Tidak ada video yang sesuai dengan pencarian.
                  </td>
                </tr>
              ) : (
                filteredVideos.map((video, idx) => (
                  <tr key={video.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-4 py-2.5 text-center font-mono text-slate-400 text-[11px]">
                      {idx + 1}
                    </td>

                    <td className="px-4 py-2.5">
                      <div className="flex items-center space-x-3">
                        <div
                          onClick={() => setPreviewVideo(video)}
                          className="relative w-14 h-9 rounded-lg overflow-hidden bg-slate-900 shrink-0 cursor-pointer shadow-2xs group"
                        >
                          <img
                            src={video.thumbnail}
                            alt={video.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition"
                          />
                          <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                            <Play className="w-3.5 h-3.5 text-white fill-current" />
                          </div>
                        </div>
                        <div>
                          <span
                            onClick={() => setPreviewVideo(video)}
                            className="font-bold text-slate-900 hover:text-blue-600 cursor-pointer block max-w-md truncate"
                          >
                            {video.title}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Ref: {video.id} • {video.viewsCount || 0}x ditonton
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-2.5 font-mono font-bold text-slate-900">
                      {video.durationFormatted}
                    </td>

                    <td className="px-4 py-2.5 font-mono text-slate-600">
                      {video.fileSizeMb.toFixed(1)} MB
                    </td>

                    <td className="px-4 py-2.5 font-mono text-slate-500">
                      {video.uploadDate ? new Date(video.uploadDate).toLocaleDateString('id-ID') : '-'}
                    </td>

                    <td className="px-4 py-2.5 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => setPreviewVideo(video)}
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                          title="Tonton Preview"
                        >
                          <Play className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Hapus video "${video.title}" dari repositori?`)) {
                              deleteVideo(video.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                          title="Hapus Video"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Upload Video Baru (Multi-upload otomatis, Min 4 video, Tanpa Kategori) */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            {/* Header Modal */}
            <div className="bg-[#0A192F] px-5 py-4 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <UploadCloud className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="font-bold text-sm">Upload Video Pelatihan Baru (Batch)</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Hanya upload videonya saja — Judul, durasi, dan spesifikasi terisi otomatis.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (!isUploading) setIsUploadModalOpen(false);
                }}
                disabled={isUploading}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              {formError && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 flex items-start space-x-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{formError}</span>
                </div>
              )}

              {formSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold">{formSuccess}</span>
                </div>
              )}

              {/* Box Drop & Picker Berkas Video */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-blue-300 hover:border-blue-500 bg-blue-50/40 hover:bg-blue-50/70 rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-2 group"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition">
                  <FileVideo className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">
                    Klik untuk Memilih Berkas Video Pelatihan
                  </p>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Pilih <strong className="text-blue-700">minimal 4 video sekaligus</strong> untuk mempercepat pengisian target 200 video.
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Mendukung format MP4, WebM, MKV, AVI. Judul & durasi akan dianalisis secara instan.
                  </p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  multiple
                  onChange={handleFilesSelected}
                  className="hidden"
                />
              </div>

              {/* Daftar Berkas yang Terpilih & Otomatis Terisi */}
              {stagedVideos.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span>
                      Video Terpilih ({stagedVideos.length} Video)
                      {stagedVideos.length < 4 ? (
                        <span className="ml-2 text-amber-600 font-normal text-[11px]">
                          (Kurang {4 - stagedVideos.length} video lagi)
                        </span>
                      ) : (
                        <span className="ml-2 text-emerald-600 font-normal text-[11px] flex-inline items-center">
                          <Check className="w-3.5 h-3.5 inline mr-0.5" />
                          Syarat minimal 4 video terpenuhi
                        </span>
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-blue-600 hover:text-blue-700 text-[11px] font-bold"
                    >
                      + Tambah Video Lainnya
                    </button>
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1 border border-slate-200 rounded-xl p-2 bg-slate-50">
                    {stagedVideos.map((staged, idx) => (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-lg border flex items-center justify-between text-xs transition ${
                          staged.status === 'duplicate'
                            ? 'bg-red-50 border-red-200 text-red-800'
                            : 'bg-white border-slate-200 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 min-w-0 flex-1 mr-3">
                          <div className="w-7 h-7 rounded bg-blue-100 text-blue-700 flex items-center justify-center font-mono font-bold text-[11px] shrink-0">
                            {idx + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-bold truncate text-slate-900">{staged.title}</p>
                            <p className="text-[10px] text-slate-500 font-mono">
                              File: {staged.file.name} • {staged.durationFormatted} • {staged.fileSizeMb} MB
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0">
                          {staged.status === 'duplicate' ? (
                            <span className="px-2 py-0.5 bg-red-200 text-red-800 rounded text-[10px] font-bold">
                              Duplikat
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-bold">
                              Siap
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => removeStagedVideo(idx)}
                            disabled={isUploading}
                            className="p-1 text-slate-400 hover:text-red-600 rounded transition"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Progress Bar Unggah */}
              {isUploading && (
                <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                  <div className="flex justify-between font-bold text-blue-900">
                    <span className="flex items-center">
                      <Loader2 className="w-4 h-4 mr-2 animate-spin text-blue-600" />
                      Sedang memproses dan menyimpan {stagedVideos.length} video ke server...
                    </span>
                    <span className="font-mono">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-blue-700">
                    Menyimpan metadata otomatis dan mendaftarkan ID video ke repositori.
                  </p>
                </div>
              )}
            </div>

            {/* Tombol Aksi Bawah */}
            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs">
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                disabled={isUploading}
                className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-100 font-semibold"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleExecuteBatchUpload}
                disabled={isUploading || stagedVideos.length === 0}
                className={`px-5 py-2 rounded-xl text-white font-bold flex items-center space-x-1.5 shadow-sm transition ${
                  isUploading || stagedVideos.length === 0
                    ? 'bg-slate-300 cursor-not-allowed'
                    : stagedVideos.length < 4
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sedang Mengunggah...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" />
                    <span>
                      Unggah {stagedVideos.length > 0 ? `${stagedVideos.length} Video Sekaligus` : 'Video'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Preview Video */}
      {previewVideo && (
        <VideoPlayerModal
          video={previewVideo}
          onClose={() => setPreviewVideo(null)}
        />
      )}
    </div>
  );
};
