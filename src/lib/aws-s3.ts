/**
 * AWS S3 Client для 3GIS
 * Автоматическая конвертация всех изображений в WebP формат
 * Оптимизация размеров и качества
 */

import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';

// Конфигурация S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || '3gis-photos';
const S3_BASE_URL = process.env.NEXT_PUBLIC_S3_BASE_URL || `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com`;

/**
 * Конфигурации обработки изображений
 */
export const IMAGE_CONFIGS = {
  USER_AVATAR: {
    width: 200,
    height: 200,
    quality: 80,
    format: 'webp' as const,
    fit: 'cover' as const
  },
  BUSINESS_PHOTO: {
    width: 800,
    height: 600,
    quality: 85,
    format: 'webp' as const,
    fit: 'cover' as const
  },
  BUSINESS_THUMBNAIL: {
    width: 300,
    height: 200,
    quality: 75,
    format: 'webp' as const,
    fit: 'cover' as const
  }
};

/**
 * Универсальная функция обработки изображения в WebP
 */
async function processImageToWebP(
  buffer: Buffer,
  config: typeof IMAGE_CONFIGS.USER_AVATAR
): Promise<Buffer> {
  console.log(`🔄 Обрабатываем изображение: ${config.width}x${config.height}, качество ${config.quality}%`);
  
  return await sharp(buffer)
    .resize({
      width: config.width,
      height: config.height,
      fit: config.fit,
      withoutEnlargement: true,
      background: { r: 255, g: 255, b: 255, alpha: 1 } // Белый фон для прозрачных изображений
    })
    .webp({ 
      quality: config.quality,
      effort: 6, // Максимальное сжатие
      smartSubsample: true
    })
    .toBuffer();
}

/**
 * Загрузка аватара пользователя из Telegram в S3 (автоматически WebP)
 */
export async function uploadUserAvatar(
  imageUrl: string,
  telegramId: string
): Promise<string> {
  try {
    console.log(`🔄 Загружаем аватар для пользователя ${telegramId} из ${imageUrl}`);
    
    // Загружаем изображение по URL из Telegram
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Не удалось загрузить изображение: ${response.status}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Конвертируем в WebP с оптимизацией
    const webpBuffer = await processImageToWebP(buffer, IMAGE_CONFIGS.USER_AVATAR);
    
    const fileName = `${telegramId}.webp`;
    const key = `user-avatars/${fileName}`;
    
    // Загружаем в S3
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: webpBuffer,
      ContentType: 'image/webp',
      CacheControl: 'public, max-age=31536000', // Кэш на год
      Metadata: {
        'telegram-id': telegramId,
        'upload-date': new Date().toISOString(),
        'source': 'telegram-avatar',
        'format': 'webp',
        'processed': 'true'
      }
    });
    
    await s3Client.send(command);
    const avatarUrl = `${S3_BASE_URL}/${key}`;
    
    console.log(`✅ Аватар успешно загружен в WebP: ${avatarUrl}`);
    return avatarUrl;
    
  } catch (error) {
    console.error('❌ Ошибка при загрузке аватара в S3:', error);
    // Возвращаем дефолтный аватар при ошибке
    return `${S3_BASE_URL}/defaults/default-avatar.webp`;
  }
}

/**
 * Загрузка фотографии заведения в S3 (автоматически WebP)
 */
export async function uploadBusinessPhoto(
  buffer: Buffer,
  category: string,
  businessId: number,
  originalName?: string
): Promise<string> {
  try {
    console.log(`🔄 Загружаем фото заведения ${businessId} в категорию ${category}`);
    
    // Конвертируем в WebP с оптимизацией
    const webpBuffer = await processImageToWebP(buffer, IMAGE_CONFIGS.BUSINESS_PHOTO);
    
    const fileName = `${uuidv4()}.webp`;
    const key = `business-photos/${category}/${businessId}/${fileName}`;
    
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: webpBuffer,
      ContentType: 'image/webp',
      CacheControl: 'public, max-age=31536000', // Кэш на год
      Metadata: {
        'business-id': businessId.toString(),
        'category': category,
        'original-name': originalName || 'unknown',
        'upload-date': new Date().toISOString(),
        'format': 'webp',
        'processed': 'true'
      }
    });
    
    await s3Client.send(command);
    const photoUrl = `${S3_BASE_URL}/${key}`;
    
    console.log(`✅ Фото заведения успешно загружено в WebP: ${photoUrl}`);
    return photoUrl;
    
  } catch (error) {
    console.error('❌ Ошибка при загрузке фото заведения в S3:', error);
    throw new Error('Не удалось загрузить фотографию заведения');
  }
}

/**
 * Загрузка аватара из Buffer (для формы загрузки) в WebP
 */
export async function uploadUserAvatarFromBuffer(
  buffer: Buffer,
  telegramId: string
): Promise<string> {
  try {
    console.log(`🔄 Загружаем аватар для пользователя ${telegramId} из файла`);
    
    // Конвертируем в WebP с оптимизацией
    const webpBuffer = await processImageToWebP(buffer, IMAGE_CONFIGS.USER_AVATAR);
    
    const fileName = `${telegramId}.webp`;
    const key = `user-avatars/${fileName}`;
    
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: webpBuffer,
      ContentType: 'image/webp',
      CacheControl: 'public, max-age=31536000',
      Metadata: {
        'telegram-id': telegramId,
        'upload-date': new Date().toISOString(),
        'source': 'user-upload',
        'format': 'webp',
        'processed': 'true'
      }
    });
    
    await s3Client.send(command);
    const avatarUrl = `${S3_BASE_URL}/${key}`;
    
    console.log(`✅ Аватар пользователя успешно загружен в WebP: ${avatarUrl}`);
    return avatarUrl;
    
  } catch (error) {
    console.error('❌ Ошибка при загрузке аватара пользователя в S3:', error);
    throw new Error('Не удалось загрузить аватар пользователя');
  }
}

/**
 * Создание миниатюры для заведения в WebP
 */
export async function createBusinessThumbnail(
  originalBuffer: Buffer,
  category: string,
  businessId: number
): Promise<string> {
  try {
    console.log(`🔄 Создаем миниатюру для заведения ${businessId}`);
    
    // Конвертируем в WebP миниатюру
    const thumbnailBuffer = await processImageToWebP(originalBuffer, IMAGE_CONFIGS.BUSINESS_THUMBNAIL);
    
    const fileName = `${uuidv4()}_thumb.webp`;
    const key = `business-photos/${category}/${businessId}/thumbnails/${fileName}`;
    
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: thumbnailBuffer,
      ContentType: 'image/webp',
      CacheControl: 'public, max-age=31536000',
      Metadata: {
        'business-id': businessId.toString(),
        'category': category,
        'type': 'thumbnail',
        'upload-date': new Date().toISOString(),
        'format': 'webp',
        'processed': 'true'
      }
    });
    
    await s3Client.send(command);
    const thumbnailUrl = `${S3_BASE_URL}/${key}`;
    
    console.log(`✅ Миниатюра успешно создана в WebP: ${thumbnailUrl}`);
    return thumbnailUrl;
    
  } catch (error) {
    console.error('❌ Ошибка при создании миниатюры:', error);
    throw new Error('Не удалось создать миниатюру');
  }
}

/**
 * Удаление изображения из S3
 */
export async function deleteImageFromS3(imageUrl: string): Promise<boolean> {
  try {
    // Извлекаем key из URL
    const key = imageUrl.replace(`${S3_BASE_URL}/`, '');
    
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });
    
    await s3Client.send(command);
    console.log(`✅ Изображение удалено из S3: ${key}`);
    return true;
    
  } catch (error) {
    console.error('❌ Ошибка при удалении изображения из S3:', error);
    return false;
  }
}

/**
 * Валидация типов файлов
 */
export function validateImageFile(file: File): boolean {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Неподдерживаемый тип файла. Разрешены: JPEG, PNG, WebP');
  }
  
  if (file.size > maxSize) {
    throw new Error('Файл слишком большой. Максимальный размер: 10MB');
  }
  
  return true;
}

/**
 * Дефолтные изображения
 */
export const DEFAULT_IMAGES = {
  BUSINESS: `${S3_BASE_URL}/defaults/default-business.webp`,
  AVATAR: `${S3_BASE_URL}/defaults/default-avatar.webp`
};

/**
 * Утилита для пакетной загрузки фотографий заведения
 */
export async function uploadMultipleBusinessPhotos(
  files: File[],
  category: string,
  businessId: number
): Promise<{ urls: string[]; thumbnails: string[] }> {
  const uploadPromises = files.map(async (file) => {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Загружаем основное фото
    const photoUrl = await uploadBusinessPhoto(buffer, category, businessId, file.name);
    
    // Создаем миниатюру
    const thumbnailUrl = await createBusinessThumbnail(buffer, category, businessId);
    
    return { photoUrl, thumbnailUrl };
  });
  
  const results = await Promise.all(uploadPromises);
  
  return {
    urls: results.map(r => r.photoUrl),
    thumbnails: results.map(r => r.thumbnailUrl)
  };
}

/**
 * Получение информации о загруженном изображении
 */
export function getImageInfo(imageUrl: string): {
  key: string;
  type: 'avatar' | 'business' | 'thumbnail' | 'unknown';
  category?: string;
  businessId?: number;
  telegramId?: string;
} {
  const key = imageUrl.replace(`${S3_BASE_URL}/`, '');
  const parts = key.split('/');
  
  if (parts[0] === 'user-avatars') {
    return {
      key,
      type: 'avatar',
      telegramId: parts[1]?.replace('.webp', '')
    };
  }
  
  if (parts[0] === 'business-photos') {
    const category = parts[1];
    const businessId = parseInt(parts[2]);
    const isThumb = parts[3] === 'thumbnails';
    
    return {
      key,
      type: isThumb ? 'thumbnail' : 'business',
      category,
      businessId
    };
  }
  
  return { key, type: 'unknown' };
}

/**
 * Экспорт S3 клиента для расширенного использования
 */
export { s3Client, BUCKET_NAME, S3_BASE_URL };
