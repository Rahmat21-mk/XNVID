import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2
} from 'lucide-react';
import { VideoItem } from '../../types';
import { useApp } from '../../context/AppContext';

interface VideoPlayerModalProps {
  video: VideoItem | null;
  onClose: () => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({ video, onClose }) => {
  const { recordDiscreetWatchProgress } = useApp();

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'notes'>('overview');

  const prevTimeRef = useRef<number>(0);

  // Pemantauan durasi tonton aktif secara tersembunyi (discreet)
  useEffect(() => {
    if (!video || !isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        if (prev >= video.durationSeconds) {
          setIsPlaying(false);
          return video.durationSeconds;
        }

        const nextTime = Math.min(video.durationSeconds, prev + 1 * playbackSpeed);
        const isSkip = Math.abs(nextTime - prevTimeRef.current) > 4;
        prevTimeRef.current = nextTime;

        // Catat penambahan durasi tonton secara tersembunyi untuk penilaian
        recordDiscreetWatchProgress(video.id, 1 * playbackSpeed, nextTime, isSkip);

        return nextTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, video, playbackSpeed, recordDiscreetWatchProgress]);

  if (!video) return null;

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = Number(e.target.value);
    recordDiscreetWatchProgress(video.id, 0, target, true);
    setCurrentTime(target);
    prevTimeRef.current = target;
  };

  const progressPercent = Math.min(100, (currentTime / video.durationSeconds) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Modal */}
        <div className="bg-[#0A192F] px-5 py-3 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white shrink-0">
              {video.category}
            </span>
            <h3 className="font-bold text-sm truncate text-slate-100">
              {video.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Layar Simulasi Video */}
        <div className="relative bg-slate-950 aspect-video w-full flex items-center justify-center overflow-hidden group">
          <img
            src={video.thumbnail}
            alt={video.title}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              isPlaying ? 'opacity-40' : 'opacity-70'
            }`}
          />

          {/* Overlay Kontrol Video */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none flex flex-col justify-between p-4">
            <div className="flex justify-between items-start text-[11px] font-mono text-slate-300">
              <span className="bg-black/60 px-2 py-0.5 rounded backdrop-blur-xs flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse mr-1.5" />
                STREAM HD 1080P
              </span>
              <span className="bg-black/60 px-2 py-0.5 rounded backdrop-blur-xs">
                {video.id}
              </span>
            </div>

            {/* Tombol Play/Pause Tengah */}
            <div className="flex flex-col items-center justify-center my-auto pointer-events-auto">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-14 h-14 rounded-full bg-blue-600/90 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg transition active:scale-95"
              >
                {isPlaying ? (
                  <Pause className="w-7 h-7 fill-current" />
                ) : (
                  <Play className="w-7 h-7 fill-current ml-1" />
                )}
              </button>
            </div>

            <div className="text-right text-xs text-slate-300 font-mono">
              {formatSeconds(currentTime)} / {video.durationFormatted}
            </div>
          </div>

          {/* Bar Kontrol Bawah */}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent p-3 pt-5 flex flex-col space-y-1.5">
            <input
              type="range"
              min={0}
              max={video.durationSeconds}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:h-2 transition-all"
            />

            <div className="flex items-center justify-between text-white text-xs">
              <div className="flex items-center space-x-2.5">
                <button onClick={() => setIsPlaying(!isPlaying)} className="p-1 hover:text-blue-400">
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => {
                    setCurrentTime(0);
                    prevTimeRef.current = 0;
                  }}
                  className="p-1 hover:text-blue-400"
                  title="Ulangi"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setIsMuted(!isMuted)} className="p-1 hover:text-blue-400">
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <span className="font-mono text-[11px] text-slate-300">
                  {formatSeconds(currentTime)} / {video.durationFormatted}
                </span>
              </div>

              <div className="flex items-center space-x-2.5">
                <select
                  value={playbackSpeed}
                  onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                  className="bg-slate-800 border border-slate-700 text-slate-200 text-[11px] rounded px-1.5 py-0.5 focus:outline-none"
                >
                  <option value={0.75}>0.75x</option>
                  <option value={1}>1.0x Normal</option>
                  <option value={1.25}>1.25x</option>
                  <option value={1.5}>1.5x</option>
                </select>

                <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-blue-500 h-full" style={{ width: `${progressPercent}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Penjelasan Modul */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-white text-xs text-slate-700">
          <div className="flex border-b border-slate-200 space-x-5 text-xs font-semibold pb-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-1.5 transition ${
                activeTab === 'overview'
                  ? 'border-b-2 border-blue-600 text-blue-600 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Deskripsi Modul
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`pb-1.5 transition ${
                activeTab === 'notes'
                  ? 'border-b-2 border-blue-600 text-blue-600 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Petunjuk Keselamatan
            </button>
          </div>

          <div className="pt-3">
            {activeTab === 'overview' && (
              <div className="space-y-3">
                <p className="text-slate-800 text-xs leading-relaxed">{video.description}</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Durasi Total</span>
                    <span className="font-mono font-bold text-slate-900">{video.durationFormatted}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Kategori</span>
                    <span className="font-bold text-blue-700">{video.category}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Standar Mutu</span>
                    <span className="font-bold text-emerald-700">ISO 9001</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notes' && (
              <ul className="list-disc list-inside space-y-1.5 text-slate-600 leading-relaxed">
                <li>Gunakan selalu Alat Pelindung Diri (APD) sebelum mengoperasikan mesin atau peralatan listrik.</li>
                <li>Lakukan verifikasi tegangan nol menggunakan multimeter sebelum menyentuh terminal uji.</li>
                <li>Pastikan saklar utama telah dikunci (Lockout) dan diberi label (Tagout) selama perbaikan.</li>
              </ul>
            )}
          </div>
        </div>

        {/* Footer Modal */}
        <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs">
          <span className="text-slate-400 font-mono text-[11px]">Sesi Pembelajaran Aktif</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
