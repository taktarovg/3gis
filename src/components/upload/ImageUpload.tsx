/**
 * Компонент для загрузки изображений в AWS S3
 * Поддерживает drag & drop и обычную загрузку
 * Автоматическая конвертация в WebP формат
 */

'use client';

import { useState, useRef } from 'react';
import { Upload, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import Image from 'next/image';

interface ImageUploadProps {
  onUpload: (imageUrl: string) => void;
  type: 'business' | 'avatar';
  businessId?: number;
  category?: string;
  telegramId?: string;
  maxFiles?: number;
  currentImages?: string[];
  className?: string;
}

export function ImageUpload({
  onUpload,
  type,
  businessId,
  category,
  telegramId,
  maxFiles = 5,
  currentImages = [],
  className = ""
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [uploadResult, setUploadResult] = useState<{
    imageUrl?: string;
    thumbnailUrl?: string;
    format?: string;
    size?: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canUploadMore = currentImages.length < maxFiles;

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || !canUploadMore) return;

    const file = files[0];
    if (!file) return;

    setUploading(true);
    setUploadStatus('idle');
    setErrorMessage('');

    try {
      console.log('🔄 Начинаем загрузку файла:', file.name);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      
      if (businessId) formData.append('businessId', businessId.toString());
      if (category) formData.append('category', category);
      if (telegramId) formData.append('telegramId', telegramId);
      if (type === 'business') formData.append('createThumbnail', 'true'); // Создавать миниатюры для бизнеса

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success && result.imageUrl) {
        console.log('✅ Изображение успешно загружено в WebP:', result.imageUrl);
        setUploadStatus('success');
        setUploadResult({
          imageUrl: result.imageUrl,
          thumbnailUrl: result.thumbnailUrl,
          format: result.format || 'webp',
          size: result.size
        });
        onUpload(result.imageUrl);
        
        // Сбрасываем статус через 3 секунды
        setTimeout(() => {
          setUploadStatus('idle');
          setUploadResult(null);
        }, 3000);
      } else {
        throw new Error(result.error || 'Ошибка при загрузке изображения');
      }
    } catch (error) {
      console.error('❌ Ошибка загрузки:', error);
      const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
      setErrorMessage(message);
      setUploadStatus('error');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removeImage = (index: number) => {
    // Здесь можно добавить логику удаления изображения
    console.log('Удаление изображения:', index);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Текущие изображения */}
      {currentImages.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {currentImages.map((imageUrl, index) => (
            <div key={index} className="relative group">
              <Image
                src={imageUrl}
                alt={`Изображение ${index + 1}`}
                width={150}
                height={150}
                className="w-full h-32 object-cover rounded-lg border border-gray-200"
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Зона загрузки */}
      {canUploadMore && (
        <div
          className={`
            border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer
            ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
            ${uploading ? 'opacity-50 pointer-events-none' : 'hover:border-blue-400 hover:bg-gray-50'}
            ${uploadStatus === 'success' ? 'border-green-500 bg-green-50' : ''}
            ${uploadStatus === 'error' ? 'border-red-500 bg-red-50' : ''}
          `}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !uploading && fileInputRef.current?.click()}
        >
          {uploading ? (
            <div className="flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500 mr-3" />
              <div>
                <p className="text-gray-700 font-medium">Загружаем изображение...</p>
                <p className="text-sm text-gray-500 mt-1">Пожалуйста, подождите</p>
              </div>
            </div>
          ) : uploadStatus === 'success' ? (
            <div className="flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
              <div>
                <p className="text-green-700 font-medium">Успешно загружено в WebP!</p>
                <div className="text-sm text-green-600 mt-1">
                  {uploadResult?.thumbnailUrl && (
                    <div>Создана миниатюра • </div>
                  )}
                  <span>Размер: {uploadResult?.size ? Math.round(uploadResult.size / 1024) : '?'} KB</span>
                </div>
              </div>
            </div>
          ) : uploadStatus === 'error' ? (
            <div className="flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-500 mr-3" />
              <div>
                <p className="text-red-700 font-medium">Ошибка загрузки</p>
                <p className="text-sm text-red-600 mt-1">{errorMessage}</p>
              </div>
            </div>
          ) : (
            <div>
              <Upload className="w-8 h-8 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-700 font-medium mb-1">
                Перетащите изображение сюда или нажмите для выбора
              </p>
              <p className="text-sm text-gray-500">
                Поддерживаются: JPEG, PNG, WebP (до 10MB)
              </p>
              <p className="text-xs text-gray-400 mt-2">
                {currentImages.length}/{maxFiles} изображений
              </p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
            disabled={uploading}
          />
        </div>
      )}

      {!canUploadMore && (
        <div className="text-center py-4 text-gray-500">
          <p>Достигнут лимит изображений ({maxFiles})</p>
        </div>
      )}
    </div>
  );
}
