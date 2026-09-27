import React, { useState } from 'react';
import {
  Play,
  Clock,
  CheckCircle,
  BookOpen,
  ChevronRight,
  Video
} from 'lucide-react';
import { VideoItem } from '../../types';
import { useApp } from '../../context/AppContext';
import { VideoPlayerModal } from './VideoPlayerModal';

interface TraineeDashboardProps {
  searchQuery: string;
}

export const TraineeDashboard: React.FC<TraineeDashboardProps> = ({ searchQuery }) => {
  const { videos, currentUser, watchLogs } = useApp();

  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);

  // Filter video berdasarkan pencarian judul / deskripsi (tanpa kategori)
  const filteredVideos = videos.filter(v => {
    const q = searchQuery.toLowerCase();
    return (
      v.title.toLowerCase().includes(q) ||
      v.description.toLowerCase().includes(q) ||
      v.id.toLowerCase().includes(q)
    );
  });

  const userLogs = (currentUser && watchLogs[currentUser.id]) || [];
  const completedCount = userLogs.filter(l => l.watchPercentage >= 80).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Kartu Sambutan Ringkas */}
      <div className="bg-gradient-to-r from-[#0A192F] to-[#1E293B] rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="max-w-xl z-10 relative">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 block mb-1">
            Modul Pelatihan Praktik Industri
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Selamat Datang, {currentUser ? currentUser.name : 'Peserta'}
          </h2>
          <p className="text-slate-300 text-xs mt-1.5 leading-relaxed">
            Silakan pilih modul pembelajaran di bawah untuk memulai sesi pelatihan praktik teknis Anda.
          </p>

          <div className="mt-4 flex flex-wrap gap-3 text-xs">
            <div className="bg-white/10 px-3 py-1.5 rounded-lg flex items-center space-x-2 border border-white/10">
              <BookOpen className="w-3.5 h-3.5 text-blue-400" />
              <span>Total Modul: <strong className="text-white font-mono">{videos.length}</strong></span>
            </div>
            <div className="bg-white/10 px-3 py-1.5 rounded-lg flex items-center space-x-2 border border-white/10">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Selesai Dipelajari: <strong className="text-white font-mono">{completedCount}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Daftar Kartu Video (Kategori Dihilangkan) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredVideos.map((video) => {
          const userLog = userLogs.find(l => l.videoId === video.id);
          const isWatched = userLog && userLog.watchPercentage >= 80;

          return (
            <div
              key={video.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition flex flex-col justify-between group"
            >
              {/* Gambar Cuplikan (Thumbnail) */}
              <div
                className="relative aspect-video bg-slate-900 overflow-hidden cursor-pointer"
                onClick={() => setActiveVideo(video)}
              >
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/25 group-hover:bg-black/10 transition flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-white/90 group-hover:bg-blue-600 group-hover:text-white text-slate-900 flex items-center justify-center shadow transition group-hover:scale-110">
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </div>
                </div>

                {/* Durasi Badge */}
                <div className="absolute bottom-2 right-2 bg-black/80 text-white font-mono text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center">
                  <Clock className="w-3 h-3 mr-1 text-slate-300" />
                  {video.durationFormatted}
                </div>

                {isWatched && (
                  <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs flex items-center">
                    <CheckCircle className="w-3 h-3 mr-1" /> Selesai
                  </div>
                )}
              </div>

              {/* Rincian Video */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3
                    onClick={() => setActiveVideo(video)}
                    className="font-bold text-xs text-slate-900 line-clamp-2 hover:text-blue-600 cursor-pointer transition leading-snug"
                  >
                    {video.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                    {video.description}
                  </p>
                </div>

                <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono">
                    Ref: {video.id}
                  </span>
                  <button
                    onClick={() => setActiveVideo(video)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    Buka Video <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredVideos.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center shadow-2xs">
          <Video className="w-12 h-12 text-slate-300 mx-auto mb-3 stroke-1" />
          <h4 className="text-sm font-bold text-slate-800">
            {videos.length === 0 ? 'Belum Ada Video Pelatihan' : 'Video Tidak Ditemukan'}
          </h4>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
            {videos.length === 0
              ? 'Administrator sedang mempersiapkan modul video pelatihan baru. Video pembelajaran akan segera muncul di sini begitu diunggah.'
              : 'Tidak ada modul video yang sesuai dengan kata kunci pencarian Anda. Coba kata kunci yang lain.'}
          </p>
        </div>
      )}

      {/* Modal Pemutar Video */}
      {activeVideo && (
        <VideoPlayerModal
          video={activeVideo}
          onClose={() => setActiveVideo(null)}
        />
      )}
    </div>
  );
};
