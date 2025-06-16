'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BusinessPhoto {
  id: number;
  url: string;
  caption?: string;
  order: number;
}

interface BusinessPhotoGalleryProps {
  photos: BusinessPhoto[];
  businessName: string;
  className?: string;
}

export function BusinessPhotoGallery({ 
  photos, 
  businessName, 
  className 
}: BusinessPhotoGalleryProps) {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  
  if (!photos.length) {
    return (
      <div className={cn(
        "w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center",
        className
      )}>
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-2">📷</div>
          <p className="text-sm">Фотографии не загружены</p>
        </div>
      </div>
    );
  }

  const mainPhoto = photos[0];
  const additionalPhotos = photos.slice(1, 4); // Показываем до 3 дополнительных фото

  const openLightbox = (index: number) => {
    setSelectedPhotoIndex(index);
  };

  const closeLightbox = () => {
    setSelectedPhotoIndex(null);
  };

  const goToPrevious = () => {
    if (selectedPhotoIndex !== null) {
      setSelectedPhotoIndex(selectedPhotoIndex > 0 ? selectedPhotoIndex - 1 : photos.length - 1);
    }
  };

  const goToNext = () => {
    if (selectedPhotoIndex !== null) {
      setSelectedPhotoIndex(selectedPhotoIndex < photos.length - 1 ? selectedPhotoIndex + 1 : 0);
    }
  };

  return (
    <>
      {/* Основная галерея */}
      <div className={cn("space-y-2", className)}>
        {/* Главное фото */}
        <div className="relative">
          <Image
            src={mainPhoto.url}
            alt={mainPhoto.caption || `${businessName} - главное фото`}
            width={800}
            height={400}
            className="w-full h-48 md:h-64 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => openLightbox(0)}
            priority
          />
          {photos.length > 1 && (
            <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
              +{photos.length - 1}
            </div>
          )}
        </div>

        {/* Дополнительные фото (если есть) */}
        {additionalPhotos.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {additionalPhotos.map((photo, index) => (
              <div key={photo.id} className="relative">
                <Image
                  src={photo.url}
                  alt={photo.caption || `${businessName} - фото ${index + 2}`}
                  width={200}
                  height={150}
                  className="w-full h-20 md:h-24 object-cover rounded cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => openLightbox(index + 1)}
                />
                {index === 2 && photos.length > 4 && (
                  <div 
                    className="absolute inset-0 bg-black/50 flex items-center justify-center rounded cursor-pointer"
                    onClick={() => openLightbox(index + 1)}
                  >
                    <span className="text-white text-sm font-semibold">
                      +{photos.length - 4}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {selectedPhotoIndex !== null && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          {/* Кнопка закрытия */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
          >
            <X className="w-8 h-8" />
          </button>

          {/* Навигация влево */}
          {photos.length > 1 && (
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}

          {/* Навигация вправо */}
          {photos.length > 1 && (
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          )}

          {/* Главное изображение */}
          <div className="relative max-w-4xl max-h-full">
            <Image
              src={photos[selectedPhotoIndex].url}
              alt={photos[selectedPhotoIndex].caption || `${businessName} - фото ${selectedPhotoIndex + 1}`}
              width={1200}
              height={800}
              className="max-w-full max-h-[80vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            
            {/* Подпись к фото */}
            {photos[selectedPhotoIndex].caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-4 text-center">
                {photos[selectedPhotoIndex].caption}
              </div>
            )}
          </div>

          {/* Индикаторы фотографий */}
          {photos.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
              {photos.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedPhotoIndex(index)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors",
                    index === selectedPhotoIndex ? "bg-white" : "bg-white/50"
                  )}
                />
              ))}
            </div>
          )}

          {/* Счетчик фотографий */}
          <div className="absolute bottom-4 right-4 text-white text-sm">
            {selectedPhotoIndex + 1} / {photos.length}
          </div>

          {/* Клик по фону для закрытия */}
          <div 
            className="absolute inset-0" 
            onClick={closeLightbox}
          />
        </div>
      )}
    </>
  );
}
