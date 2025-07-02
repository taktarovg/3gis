'use client';

import React, { useCallback, useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { Button } from './button';

interface ImageUploadProps {
  onImageUpload: (url: string) => void;
  onImageRemove: () => void;
  currentImage?: string;
  maxSize?: number; // в MB
  accept?: string;
  className?: string;
}

export function ImageUpload({
  onImageUpload,
  onImageRemove,
  currentImage,
  maxSize = 5,
  accept = "image/*",
  className = ""
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Симуляция загрузки для демонстрации (заменить на реальную Cloudinary интеграцию)
  const uploadToCloudinary = useCallback(async (file: File): Promise<string> => {
    // Симуляция загрузки для демонстрации
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Создаем URL для локального файла для предварительного просмотра
    const fileUrl = URL.createObjectURL(file);
    
    // В реальности здесь будет загрузка на Cloudinary:
    // const formData = new FormData();
    // formData.append('file', file);
    // formData.append('upload_preset', 'your_preset');
    // 
    // const response = await fetch(
    //   `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
    //   { method: 'POST', body: formData }
    // );
    // 
    // const data = await response.json();
    // return data.secure_url;
    
    // Для демо возвращаем placeholder изображение с уникальным ID
    const imageId = Math.random().toString(36).substr(2, 9);
    return `https://images.unsplash.com/photo-1516085216930-c93a002a8b01?w=800&h=400&fit=crop&auto=format&q=80&id=${imageId}`;
  }, []);

  const handleFileUpload = useCallback(async (file: File) => {
    // Проверка размера файла
    if (file.size > maxSize * 1024 * 1024) {
      alert(`Файл слишком большой. Максимальный размер: ${maxSize}MB`);
      return;
    }

    // Проверка типа файла
    if (!file.type.startsWith('image/')) {
      alert('Можно загружать только изображения');
      return;
    }

    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      onImageUpload(url);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Ошибка загрузки файла. Попробуйте еще раз.');
    } finally {
      setUploading(false);
    }
  }, [maxSize, onImageUpload, uploadToCloudinary]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files[0]) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files[0]) {
      handleFileUpload(files[0]);
    }
    // Очищаем input для возможности повторной загрузки того же файла
    e.target.value = '';
  }, [handleFileUpload]);

  return (
    <div className={`relative ${className}`}>
      {currentImage ? (
        <div className="relative">
          <img
            src={currentImage}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg border border-gray-300"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2 shadow-lg"
            onClick={onImageRemove}
            disabled={uploading}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
            dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
          } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            if (!uploading) setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onClick={() => {
            if (!uploading) {
              document.getElementById('image-upload-input')?.click();
            }
          }}
        >
          {uploading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-2" />
              <p className="text-sm text-gray-600">Загрузка изображения...</p>
              <p className="text-xs text-gray-500 mt-1">Это может занять несколько секунд</p>
            </div>
          ) : (
            <>
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-2">
                Перетащите изображение или нажмите для выбора
              </p>
              <p className="text-xs text-gray-500">
                Поддерживаются: JPG, PNG, GIF (макс. {maxSize}MB)
              </p>
              <input
                id="image-upload-input"
                type="file"
                accept={accept}
                onChange={handleInputChange}
                className="hidden"
                disabled={uploading}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}