'use client';

import { useState, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminImageUploadProps {
  onUpload: (imageUrl: string) => void;
  maxFiles?: number;
  currentImages?: string[];
}

/**
 * Компонент загрузки изображений для админки
 */
export function AdminImageUpload({ 
  onUpload, 
  maxFiles = 10,
  currentImages = [] 
}: AdminImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canUploadMore = currentImages.length < maxFiles;

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || !canUploadMore) return;

    const file = files[0];
    if (!file) return;

    // Простая валидация
    if (!file.type.startsWith('image/')) {
      alert('Можно загружать только изображения');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
      alert('Файл слишком большой. Максимум 10MB');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'business');
      formData.append('category', 'admin');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        onUpload(result.imageUrl);
      } else {
        throw new Error(result.error || 'Ошибка загрузки');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(error instanceof Error ? error.message : 'Ошибка загрузки файла');
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

  if (!canUploadMore) {
    return (
      <div className="text-center text-gray-500">
        Достигнут лимит изображений ({maxFiles})
      </div>
    );
  }

  return (
    <div
      className={`
        border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
        ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
        ${uploading ? 'opacity-50 pointer-events-none' : 'hover:border-blue-400'}
      `}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => fileInputRef.current?.click()}
    >
      {uploading ? (
        <div className="flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Загружаем...</span>
        </div>
      ) : (
        <div>
          <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-gray-600">
            Перетащите изображение сюда или нажмите для выбора
          </p>
          <p className="text-sm text-gray-500 mt-1">
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
      />
    </div>
  );
}
