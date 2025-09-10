import { useState, useRef } from 'react';
import { Camera, Upload, X, Check, User, Crop } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ImageUploaderProps {
  currentImage?: string;
  onImageChange: (imageUrl: string) => void;
  className?: string;
}

export default function ImageUploader({ currentImage, onImageChange, className = '' }: ImageUploaderProps) {
  const { darkMode } = useTheme();
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processImage(file);
    }
  };

  const processImage = (file: File) => {
    setIsUploading(true);
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите изображение');
      setIsUploading(false);
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Размер файла не должен превышать 5MB');
      setIsUploading(false);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      setPreviewUrl(imageUrl);
      setShowCropModal(true);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleCropConfirm = () => {
    if (previewUrl) {
      // In a real app, you would crop the image here
      // For now, we'll just use the preview URL
      onImageChange(previewUrl);
      localStorage.setItem('userAvatar', previewUrl);
      setShowCropModal(false);
      setPreviewUrl(null);
    }
  };

  const handleCropCancel = () => {
    setShowCropModal(false);
    setPreviewUrl(null);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const triggerCameraInput = () => {
    cameraInputRef.current?.click();
  };

  return (
    <div className={`relative ${className}`}>
      {/* Avatar Display */}
      <div className="relative group">
        <div className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 transition-all duration-300 ${
          darkMode 
            ? 'border-slate-600 group-hover:border-blue-500' 
            : 'border-gray-200 group-hover:border-blue-400'
        } shadow-xl group-hover:shadow-2xl group-hover:shadow-blue-500/25`}>
          {currentImage ? (
            <img 
              src={currentImage} 
              alt="Profile" 
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
          ) : (
            <div className={`w-full h-full flex items-center justify-center ${
              darkMode ? 'bg-slate-700' : 'bg-gray-100'
            }`}>
              <User size={32} className={darkMode ? 'text-slate-400' : 'text-gray-400'} />
            </div>
          )}
        </div>

        {/* Upload Overlay */}
        <div className={`absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 ${
          darkMode ? 'bg-black/60' : 'bg-white/80'
        } backdrop-blur-sm`}>
          <div className="flex space-x-2">
            <button
              onClick={triggerFileInput}
              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-all duration-200 transform hover:scale-110 shadow-lg"
              title="Загрузить с устройства"
            >
              <Upload size={16} />
            </button>
            <button
              onClick={triggerCameraInput}
              className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-full transition-all duration-200 transform hover:scale-110 shadow-lg"
              title="Сделать фото"
            >
              <Camera size={16} />
            </button>
          </div>
        </div>

        {/* Loading Indicator */}
        {isUploading && (
          <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="user"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Crop Modal */}
      {showCropModal && previewUrl && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`max-w-md w-full rounded-3xl overflow-hidden shadow-2xl ${
            darkMode 
              ? 'bg-gradient-to-br from-slate-800 to-slate-900' 
              : 'bg-white'
          }`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Предварительный просмотр
                </h3>
                <button
                  onClick={handleCropCancel}
                  className={`p-2 rounded-full transition-colors ${
                    darkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <X size={20} className={darkMode ? 'text-slate-400' : 'text-gray-500'} />
                </button>
              </div>

              <div className="flex justify-center mb-6">
                <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-blue-500 shadow-xl">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleCropCancel}
                  className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-colors ${
                    darkMode 
                      ? 'bg-slate-700 hover:bg-slate-600 text-white' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                  }`}
                >
                  Отмена
                </button>
                <button
                  onClick={handleCropConfirm}
                  className="flex-1 flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
                >
                  <Check size={20} className="mr-2" />
                  Сохранить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}