import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, RotateCcw, FastForward } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface AudioPlayerProps {
  src: string;
  title?: string;
  autoPlay?: boolean;
  className?: string;
}

export default function AudioPlayer({ src, title, autoPlay = false, className = '' }: AudioPlayerProps) {
  const { darkMode } = useTheme();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
      if (autoPlay) {
        audio.play().catch(() => setError('Не удалось воспроизвести аудио'));
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = () => {
      setError('Аудиофайл недоступен или поврежден');
      setIsLoading(false);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [autoPlay]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        audio.pause();
      } else {
        await audio.play();
      }
    } catch (e) {
      setError('Не удалось воспроизвести аудио');
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newVolume = parseFloat(e.target.value);
    audio.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.volume = volume;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const skipTime = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (error) {
    return (
      <div className={`p-4 rounded-xl border ${
        darkMode 
          ? 'bg-red-900/20 border-red-800 text-red-400' 
          : 'bg-red-50 border-red-200 text-red-600'
      } ${className}`}>
        <div className="flex items-center">
          <VolumeX size={20} className="mr-2" />
          <div>
            <div className="text-sm font-medium">{error}</div>
            <div className="text-xs mt-1 opacity-75">
              Попробуйте обновить страницу или обратитесь к раввину
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-xl border transition-all duration-200 ${
      darkMode 
        ? 'bg-gradient-to-r from-slate-800 to-slate-900 border-slate-600' 
        : 'bg-gradient-to-r from-gray-50 to-blue-50 border-gray-200'
    } ${className}`}>
      <audio ref={audioRef} src={src} preload="metadata" />
      
      {title && (
        <div className={`text-sm font-medium mb-3 ${
          darkMode ? 'text-slate-300' : 'text-gray-700'
        }`}>
          {title}
        </div>
      )}

      <div className="flex items-center space-x-3">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          disabled={isLoading}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg ${
            isLoading
              ? darkMode 
                ? 'bg-slate-600 cursor-not-allowed' 
                : 'bg-gray-300 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 hover:shadow-blue-500/25 transform hover:scale-105'
          }`}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : isPlaying ? (
            <Pause size={20} className="text-white ml-0.5" />
          ) : (
            <Play size={20} className="text-white ml-1" />
          )}
        </button>

        {/* Skip Backward */}
        <button
          onClick={() => skipTime(-10)}
          disabled={isLoading}
          className={`p-2 rounded-full transition-colors ${
            darkMode 
              ? 'hover:bg-slate-700 text-slate-400 hover:text-white' 
              : 'hover:bg-gray-200 text-gray-500 hover:text-gray-700'
          }`}
        >
          <RotateCcw size={18} />
        </button>

        {/* Progress Bar */}
        <div className="flex-1 space-y-1">
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            disabled={isLoading}
            className={`w-full h-2 rounded-full appearance-none cursor-pointer ${
              darkMode 
                ? 'bg-slate-600 slider-thumb-blue-dark' 
                : 'bg-gray-300 slider-thumb-blue'
            }`}
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(currentTime / duration) * 100}%, ${
                darkMode ? '#475569' : '#d1d5db'
              } ${(currentTime / duration) * 100}%, ${darkMode ? '#475569' : '#d1d5db'} 100%)`
            }}
          />
          <div className={`flex justify-between text-xs ${
            darkMode ? 'text-slate-400' : 'text-gray-500'
          }`}>
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Skip Forward */}
        <button
          onClick={() => skipTime(10)}
          disabled={isLoading}
          className={`p-2 rounded-full transition-colors ${
            darkMode 
              ? 'hover:bg-slate-700 text-slate-400 hover:text-white' 
              : 'hover:bg-gray-200 text-gray-500 hover:text-gray-700'
          }`}
        >
          <FastForward size={18} />
        </button>

        {/* Volume Control */}
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleMute}
            className={`p-2 rounded-full transition-colors ${
              darkMode 
                ? 'hover:bg-slate-700 text-slate-400 hover:text-white' 
                : 'hover:bg-gray-200 text-gray-500 hover:text-gray-700'
            }`}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className={`w-16 h-2 rounded-full appearance-none cursor-pointer ${
              darkMode 
                ? 'bg-slate-600 slider-thumb-blue-dark' 
                : 'bg-gray-300 slider-thumb-blue'
            }`}
          />
        </div>
      </div>
    </div>
  );
}