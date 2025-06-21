import { NextRequest, NextResponse } from 'next/server';
import { 
  uploadBusinessPhoto, 
  uploadUserAvatarFromBuffer, 
  validateImageFile,
  uploadMultipleBusinessPhotos,
  createBusinessThumbnail 
} from '@/lib/aws-s3';
import { prisma } from '@/lib/prisma';
import sharp from 'sharp';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const type = formData.get('type') as string; // 'business' | 'avatar' | 'multiple'
    
    if (type === 'multiple') {
      return await handleMultipleUpload(formData);
    } else {
      return await handleSingleUpload(formData);
    }
    
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Ошибка загрузки' },
      { status: 500 }
    );
  }
}

/**
 * Обработка одиночной загрузки
 */
async function handleSingleUpload(formData: FormData) {
  const file = formData.get('file') as File;
  const type = formData.get('type') as string;
  const businessId = formData.get('businessId') as string;
  const category = formData.get('category') as string;
  const telegramId = formData.get('telegramId') as string;
  const caption = formData.get('caption') as string;
  
  if (!file) {
    return NextResponse.json(
      { error: 'Файл не найден' },
      { status: 400 }
    );
  }
  
  // Валидация файла
  validateImageFile(file);
  
  // Конвертируем в Buffer
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  // Получаем метаданные изображения
  const metadata = await sharp(buffer).metadata();
  
  let imageUrl: string;
  let photoRecord = null;
  
  if (type === 'business' && businessId && category) {
    // Загружаем фото заведения
    imageUrl = await uploadBusinessPhoto(buffer, category, parseInt(businessId), file.name);
    
    // Создаем запись в базе данных
    const nextOrder = await getNextPhotoOrder(parseInt(businessId));
    
    photoRecord = await prisma.businessPhoto.create({
      data: {
        url: imageUrl,
        caption: caption || null,
        order: nextOrder,
        businessId: parseInt(businessId),
        s3Key: extractS3Key(imageUrl),
        fileSize: file.size,
        format: 'webp',
        width: metadata.width || null,
        height: metadata.height || null
      }
    });
    
  } else if (type === 'avatar' && telegramId) {
    imageUrl = await uploadUserAvatarFromBuffer(buffer, telegramId);
    
    // Обновляем аватар пользователя в БД
    await prisma.user.update({
      where: { telegramId },
      data: { avatar: imageUrl }
    });
    
  } else if (type === 'business' && category === 'admin') {
    // Специальный случай для админки - загружаем без businessId
    imageUrl = await uploadBusinessPhoto(buffer, 'admin', 0, file.name);
    // Не сохраняем в БД, только возвращаем URL
    
  } else {
    return NextResponse.json(
      { error: 'Неверные параметры загрузки' },
      { status: 400 }
    );
  }
  
  return NextResponse.json({ 
    success: true, 
    imageUrl,
    photo: photoRecord,
    message: 'Изображение успешно загружено в WebP формате',
    metadata: {
      originalSize: file.size,
      originalFormat: file.type,
      processedFormat: 'webp',
      width: metadata.width,
      height: metadata.height
    }
  });
}

/**
 * Обработка множественной загрузки
 */
async function handleMultipleUpload(formData: FormData) {
  const files = formData.getAll('files') as File[];
  const businessId = formData.get('businessId') as string;
  const category = formData.get('category') as string;
  
  if (!files.length) {
    return NextResponse.json(
      { error: 'Файлы не найдены' },
      { status: 400 }
    );
  }
  
  if (!businessId || !category) {
    return NextResponse.json(
      { error: 'businessId и category обязательны для множественной загрузки' },
      { status: 400 }
    );
  }
  
  // Валидируем все файлы
  files.forEach(file => validateImageFile(file));
  
  // Загружаем все файлы
  const { urls, thumbnails } = await uploadMultipleBusinessPhotos(files, category, parseInt(businessId));
  
  // Создаем записи в БД
  const nextOrder = await getNextPhotoOrder(parseInt(businessId));
  
  const photoRecords = await Promise.all(
    urls.map(async (url, index) => {
      const file = files[index];
      const bytes = await file.arrayBuffer();
      const metadata = await sharp(Buffer.from(bytes)).metadata();
      
      return await prisma.businessPhoto.create({
        data: {
          url,
          caption: null,
          order: nextOrder + index,
          businessId: parseInt(businessId),
          s3Key: extractS3Key(url),
          fileSize: file.size,
          format: 'webp',
          width: metadata.width || null,
          height: metadata.height || null
        }
      });
    })
  );
  
  return NextResponse.json({
    success: true,
    imageUrls: urls,
    thumbnails,
    photos: photoRecords,
    message: `${urls.length} изображений успешно загружено в WebP формате`
  });
}

/**
 * Получение следующего порядкового номера для фото
 */
async function getNextPhotoOrder(businessId: number): Promise<number> {
  const lastPhoto = await prisma.businessPhoto.findFirst({
    where: { businessId },
    orderBy: { order: 'desc' }
  });
  
  return (lastPhoto?.order || 0) + 1;
}

/**
 * Извлечение S3 ключа из URL
 */
function extractS3Key(imageUrl: string): string {
  const urlParts = imageUrl.split('/');
  const bucketIndex = urlParts.findIndex(part => part.includes('3gis-photos'));
  return urlParts.slice(bucketIndex + 1).join('/');
}
