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
  Check,
  CheckSquare,
  Square
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
  middleTimestampFormatted?: string;
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
  const { videos, addVideosBatch, deleteVideo, deleteVideosBatch, refreshServerState } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [previewVideo, setPreviewVideo] = useState<VideoItem | null>(null);

  // Seleksi video massal untuk penghapusan
  const [selectedVideoIds, setSelectedVideoIds] = useState<string[]>([]);
  const [isDeletingBatch, setIsDeletingBatch] = useState(false);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    isOpen: boolean;
    mode: 'selected' | 'all';
    count: number;
  }>({ isOpen: false, mode: 'selected', count: 0 });
  const [actionAlert, setActionAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

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

  // Logika seleksi video
  const isAllFilteredSelected =
    filteredVideos.length > 0 && filteredVideos.every(v => selectedVideoIds.includes(v.id));
  const isSomeFilteredSelected =
    filteredVideos.some(v => selectedVideoIds.includes(v.id)) && !isAllFilteredSelected;

  const handleToggleSelectAllFiltered = () => {
    if (isAllFilteredSelected) {
      const filteredIdSet = new Set(filteredVideos.map(v => v.id));
      setSelectedVideoIds(prev => prev.filter(id => !filteredIdSet.has(id)));
    } else {
      const combined = Array.from(new Set([...selectedVideoIds, ...filteredVideos.map(v => v.id)]));
      setSelectedVideoIds(combined);
    }
  };

  const handleSelectAllVideos = () => {
    setSelectedVideoIds(videos.map(v => v.id));
  };

  const handleClearSelection = () => {
    setSelectedVideoIds([]);
  };

  const handleToggleSelectOne = (id: string, e?: React.MouseEvent | React.ChangeEvent) => {
    if (e) e.stopPropagation();
    setSelectedVideoIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleConfirmBatchDelete = async () => {
    setIsDeletingBatch(true);
    try {
      if (deleteConfirmModal.mode === 'all') {
        const total = videos.length;
        await deleteVideosBatch([], true);
        setSelectedVideoIds([]);
        setDeleteConfirmModal({ isOpen: false, mode: 'all', count: 0 });
        setActionAlert({
          type: 'success',
          message: `Berhasil menghapus seluruh ${total} video pelatihan dari repositori!`
        });
      } else {
        const count = selectedVideoIds.length;
        await deleteVideosBatch(selectedVideoIds);
        setSelectedVideoIds([]);
        setDeleteConfirmModal({ isOpen: false, mode: 'selected', count: 0 });
        setActionAlert({
          type: 'success',
          message: `Berhasil menghapus ${count} video yang dipilih dari repositori!`
        });
      }
    } catch {
      setActionAlert({
        type: 'error',
        message: 'Terjadi kesalahan saat menghapus video.'
      });
    } finally {
      setIsDeletingBatch(false);
      setTimeout(() => setActionAlert(null), 4000);
    }
  };

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

  // Parsing durasi dan ekstrak cuplikan menit pertengahan secara otomatis dari video asli
  const parseVideoMetadata = (file: File, indexOffset: number): Promise<StagedVideo> => {
    return new Promise((resolve) => {
      const videoElement = document.createElement('video');
      videoElement.preload = 'metadata';
      videoElement.muted = true;
      videoElement.playsInline = true;
      const objectUrl = URL.createObjectURL(file);
      videoElement.src = objectUrl;

      const fallbackDuration = 300 + Math.floor(Math.random() * 600); // 5 - 15 menit
      const sizeMb = Number((file.size / (1024 * 1024)).toFixed(1));
      const autoTitle = formatAutoTitle(file.name, indexOffset);
      const fallbackThumb = INDUSTRIAL_THUMBNAILS[(videos.length + indexOffset) % INDUSTRIAL_THUMBNAILS.length];

      // Cek apakah judul sudah pernah terdaftar di sistem
      const isDuplicate = videos.some(v => v.title.trim().toLowerCase() === autoTitle.toLowerCase());

      let capturedThumbnail = '';
      let middleTimeFormatted = '';
      let isFinalized = false;

      const finalize = (durationSecs: number) => {
        if (isFinalized) return;
        isFinalized = true;

        const safeDuration = durationSecs >= 5 ? Math.round(durationSecs) : fallbackDuration;
        const m = Math.floor(safeDuration / 60);
        const s = safeDuration % 60;
        const durFormatted = `${m}m ${String(s).padStart(2, '0')}d`;

        if (!middleTimeFormatted) {
          const midSec = Math.floor(safeDuration / 2);
          const mm = Math.floor(midSec / 60);
          const ss = midSec % 60;
          middleTimeFormatted = `${mm}:${String(ss).padStart(2, '0')}`;
        }

        resolve({
          file,
          title: autoTitle,
          durationSeconds: safeDuration,
          durationFormatted: durFormatted,
          fileSizeMb: sizeMb > 0 ? sizeMb : Math.round(safeDuration * 0.35),
          description: `Modul pelatihan materi praktikum teknik industri: ${autoTitle}.`,
          thumbnail: capturedThumbnail || fallbackThumb,
          middleTimestampFormatted: middleTimeFormatted,
          videoUrl: objectUrl,
          status: isDuplicate ? 'duplicate' : 'ready'
        });
      };

      videoElement.onloadedmetadata = () => {
        const dur = videoElement.duration;
        const validDuration = !isNaN(dur) && isFinite(dur) && dur > 0 ? dur : fallbackDuration;

        // Ambil menit / detik pertengahan video (exact halfway mark)
        const middleSecs = validDuration / 2;
        const mm = Math.floor(middleSecs / 60);
        const ss = Math.floor(middleSecs % 60);
        middleTimeFormatted = `${mm}:${String(ss).padStart(2, '0')}`;

        // Pindahkan pemutaran ke menit pertengahan untuk capture frame
        try {
          videoElement.currentTime = middleSecs;
        } catch {
          finalize(validDuration);
        }
      };

      videoElement.onseeked = () => {
        try {
          const canvas = document.createElement('canvas');
          const width = videoElement.videoWidth || 640;
          const height = videoElement.videoHeight || 360;
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(videoElement, 0, 0, width, height);
            capturedThumbnail = canvas.toDataURL('image/jpeg', 0.85);
          }
        } catch (err) {
          console.warn('Gagal menangkap frame thumbnail dari video:', err);
        }
        finalize(videoElement.duration || fallbackDuration);
      };

      videoElement.onerror = () => {
        finalize(fallbackDuration);
      };

      // Timeout pengaman bila browser lambat render video
      setTimeout(() => {
        finalize(fallbackDuration);
      }, 3500);
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
  };

  // Hapus salah satu berkas dari antrean upload
  const removeStagedVideo = (index: number) => {
    const updated = stagedVideos.filter((_, idx) => idx !== index);
    setStagedVideos(updated);
    setFormError(null);
  };

  // Eksekusi Unggah Batch ke Sistem (Unggah file fisik & simpan thumbnail ke server)
  const handleExecuteBatchUpload = async () => {
    setFormError(null);
    setFormSuccess(null);

    if (stagedVideos.length === 0) {
      setFormError('Silakan pilih berkas video terlebih dahulu.');
      return;
    }

    const validVideos = stagedVideos.filter(v => v.status !== 'duplicate');
    if (validVideos.length === 0) {
      setFormError('Semua video yang dipilih terdeteksi sudah pernah diunggah (duplikat).');
      return;
    }

    setIsUploading(true);
    setUploadProgress(5);

    try {
      const uploadedPayload: Array<{
        title: string;
        description: string;
        durationSeconds: number;
        thumbnail: string;
        fileSizeMb: number;
        videoUrl: string;
      }> = [];

      for (let i = 0; i < validVideos.length; i++) {
        const v = validVideos[i];

        // 1. Unggah file video fisik ke server
        let persistentVideoUrl = v.videoUrl || '';
        try {
          const formData = new FormData();
          formData.append('video', v.file);

          const upRes = await fetch('/api/upload/video', {
            method: 'POST',
            body: formData
          });
          const upData = await upRes.json();
          if (upData.success && upData.videoUrl) {
            persistentVideoUrl = upData.videoUrl;
          }
        } catch (err) {
          console.warn('Gagal unggah berkas video fisik, gunakan fallback URL:', err);
        }

        // 2. Simpan gambar thumbnail dari menit pertengahan ke server
        let persistentThumbUrl = v.thumbnail;
        if (v.thumbnail && v.thumbnail.startsWith('data:image/')) {
          try {
            const thumbRes = await fetch('/api/upload/thumbnail', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ dataUrl: v.thumbnail })
            });
            const thumbData = await thumbRes.json();
            if (thumbData.success && thumbData.thumbnailUrl) {
              persistentThumbUrl = thumbData.thumbnailUrl;
            }
          } catch (err) {
            console.warn('Gagal unggah thumbnail ke server, fallback dataUrl:', err);
          }
        }

        uploadedPayload.push({
          title: v.title,
          description: v.description,
          durationSeconds: v.durationSeconds,
          thumbnail: persistentThumbUrl,
          fileSizeMb: v.fileSizeMb,
          videoUrl: persistentVideoUrl
        });

        const percent = Math.min(95, Math.round(((i + 1) / validVideos.length) * 90) + 5);
        setUploadProgress(percent);
      }

      // 3. Simpan seluruh video ke repositori sistem
      const res = await addVideosBatch(uploadedPayload);
      setUploadProgress(100);

      if (res.success) {
        setFormSuccess(`Berhasil mengunggah ${res.count} video pelatihan! Gambar cuplikan diambil otomatis dari menit pertengahan video.`);
        await refreshServerState();
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
              Upload Fleksibel (1 - 200 Video)
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

      {/* Notifikasi Tindakan */}
      {actionAlert && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between shadow-2xs animate-in fade-in duration-200 ${
            actionAlert.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center space-x-2">
            {actionAlert.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span className="font-medium">{actionAlert.message}</span>
          </div>
          <button
            onClick={() => setActionAlert(null)}
            className="p-1 hover:bg-black/5 rounded-md transition text-slate-500"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Pencarian */}
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

      {/* Toolbar Seleksi & Hapus Massal */}
      {videos.length > 0 && (
        <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleToggleSelectAllFiltered}
              className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition shadow-2xs ${
                isAllFilteredSelected
                  ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {isAllFilteredSelected ? (
                <CheckSquare className="w-4 h-4 text-white" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
              <span>{isAllFilteredSelected ? 'Batal Pilih Semua' : 'Pilih Semua Video'}</span>
            </button>

            {selectedVideoIds.length > 0 && (
              <button
                type="button"
                onClick={handleClearSelection}
                className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium transition"
              >
                Reset Pilihan
              </button>
            )}

            <span className="text-xs font-mono text-slate-600 px-2.5 py-1 bg-white border border-slate-200 rounded-lg">
              <strong className="text-blue-700 font-bold">{selectedVideoIds.length}</strong> dari {videos.length} video dipilih
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 justify-end">
            {selectedVideoIds.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setDeleteConfirmModal({
                    isOpen: true,
                    mode: 'selected',
                    count: selectedVideoIds.length
                  });
                }}
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm transition active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
                <span>Hapus {selectedVideoIds.length} Video Terpilih</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setDeleteConfirmModal({
                  isOpen: true,
                  mode: 'all',
                  count: videos.length
                });
              }}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold transition"
              title="Hapus seluruh video sekaligus dari awal"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-500" />
              <span>Hapus Semua Video ({videos.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* Tabel Daftar Video */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-3 py-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllFilteredSelected}
                    ref={el => {
                      if (el) el.indeterminate = isSomeFilteredSelected;
                    }}
                    onChange={handleToggleSelectAllFiltered}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    title={isAllFilteredSelected ? "Batal pilih semua" : "Pilih semua video"}
                  />
                </th>
                <th className="px-3 py-3 w-12 text-center">No</th>
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
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400 text-xs">
                    {videos.length === 0 ? (
                      <div className="py-4 flex flex-col items-center justify-center">
                        <FileVideo className="w-10 h-10 text-slate-300 mb-2 stroke-1" />
                        <p className="font-bold text-slate-700 text-sm">Repositori Video Masih Kosong</p>
                        <p className="text-slate-400 text-xs mt-1 max-w-sm mx-auto">
                          Anda sedang memulai dari awal. Silakan pilih dan unggah video pelatihan praktikum Anda untuk mulai mengisi repositori.
                        </p>
                        <button
                          onClick={() => setIsUploadModalOpen(true)}
                          className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-xs transition inline-flex items-center"
                        >
                          <UploadCloud className="w-4 h-4 mr-1.5" />
                          Upload Video Sekarang
                        </button>
                      </div>
                    ) : (
                      "Tidak ada video yang sesuai dengan pencarian."
                    )}
                  </td>
                </tr>
              ) : (
                filteredVideos.map((video, idx) => {
                  const isSelected = selectedVideoIds.includes(video.id);
                  return (
                    <tr
                      key={video.id}
                      className={`transition ${
                        isSelected
                          ? 'bg-blue-50/70 border-l-4 border-blue-600'
                          : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <td className="px-3 py-2.5 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleToggleSelectOne(video.id, e)}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>

                      <td className="px-3 py-2.5 text-center font-mono text-slate-400 text-[11px]">
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
                                setSelectedVideoIds(prev => prev.filter(id => id !== video.id));
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                            title="Hapus Video Ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
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
                          {staged.thumbnail ? (
                            <div className="relative w-16 h-10 rounded-md overflow-hidden bg-slate-900 shrink-0 border border-slate-200">
                              <img
                                src={staged.thumbnail}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                              <span className="absolute bottom-0 inset-x-0 bg-black/75 text-[8px] text-white font-mono text-center py-0.5 font-bold">
                                {staged.middleTimestampFormatted || 'Mid'}
                              </span>
                            </div>
                          ) : (
                            <div className="w-7 h-7 rounded bg-blue-100 text-blue-700 flex items-center justify-center font-mono font-bold text-[11px] shrink-0">
                              {idx + 1}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="font-bold truncate text-slate-900">{staged.title}</p>
                            <p className="text-[10px] text-slate-500 font-mono">
                              File: {staged.file.name} • {staged.durationFormatted} • {staged.fileSizeMb} MB
                            </p>
                            <span className="inline-block mt-0.5 text-[9px] bg-blue-50 text-blue-700 font-medium px-1.5 py-0.2 rounded border border-blue-100">
                              Cuplikan: Menit Pertengahan ({staged.middleTimestampFormatted || '00:00'})
                            </span>
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

      {/* Modal Konfirmasi Hapus Video Massal */}
      {deleteConfirmModal.isOpen && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-start space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-base text-slate-900">
                  {deleteConfirmModal.mode === 'all'
                    ? `Hapus Seluruh Video (${deleteConfirmModal.count} Video)?`
                    : `Hapus ${deleteConfirmModal.count} Video Terpilih?`}
                </h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  {deleteConfirmModal.mode === 'all'
                    ? 'Perhatian: Seluruh video pelatihan akan dibersihkan secara permanen dari server dan daftar putar akun peserta. Anda dapat memulai upload dari awal.'
                    : `Sebanyak ${deleteConfirmModal.count} video yang telah Anda centang akan dihapus secara permanen dari server dan akun peserta.`}
                </p>
                <div className="mt-3 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800">
                  Video yang dihapus tidak dapat dipulihkan. Anda perlu mengunggahnya kembali jika ingin menampilkannya lagi.
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                disabled={isDeletingBatch}
                onClick={() => setDeleteConfirmModal({ isOpen: false, mode: 'selected', count: 0 })}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isDeletingBatch}
                onClick={handleConfirmBatchDelete}
                className="px-4 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-xs transition flex items-center space-x-1.5"
              >
                {isDeletingBatch ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    <span>
                      {deleteConfirmModal.mode === 'all'
                        ? 'Ya, Hapus Semua Video'
                        : `Ya, Hapus ${deleteConfirmModal.count} Video`}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
