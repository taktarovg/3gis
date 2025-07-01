import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Конфигурация Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    // Проверка авторизации
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Требуется авторизация' },
        { status: 401 }
      );
    }

    // Получение файла из формы
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'blog';
    const postId = formData.get('postId') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'Файл не найден' },
        { status: 400 }
      );
    }

    // Проверка типа файла
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Недопустимый тип файла. Разрешены: JPEG, PNG, WebP' },
        { status: 400 }
      );
    }

    // Проверка размера файла (максимум 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Файл слишком большой. Максимальный размер: 5MB' },
        { status: 400 }
      );
    }

    // Конвертация файла в base64 для загрузки в Cloudinary
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64File = `data:${file.type};base64,${buffer.toString('base64')}`;

    // Генерация уникального имени файла
    const timestamp = Date.now();
    const filename = file.name.replace(/\.[^/.]+$/, ''); // Убираем расширение
    const publicId = `${folder}/${timestamp}-${filename}`;

    // Загрузка в Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(base64File, {
      public_id: publicId,
      folder: `3gis/${folder}`,
      transformation: [
        { quality: 'auto', fetch_format: 'auto' },
        { width: 1200, height: 630, crop: 'limit' }, // Оптимизация для OpenGraph
      ],
      tags: ['blog', '3gis', ...(postId ? [`post-${postId}`] : [])],
    });

    // Генерация разных размеров изображения
    const variants = {
      original: uploadResponse.secure_url,
      large: cloudinary.url(uploadResponse.public_id, {
        width: 1200,
        height: 630,
        crop: 'fill',
        gravity: 'center',
        quality: 'auto',
        fetch_format: 'auto'
      }),
      medium: cloudinary.url(uploadResponse.public_id, {
        width: 800,
        height: 450,
        crop: 'fill',
        gravity: 'center',
        quality: 'auto',
        fetch_format: 'auto'
      }),
      small: cloudinary.url(uploadResponse.public_id, {
        width: 400,
        height: 225,
        crop: 'fill',
        gravity: 'center',
        quality: 'auto',
        fetch_format: 'auto'
      }),
      thumbnail: cloudinary.url(uploadResponse.public_id, {
        width: 150,
        height: 150,
        crop: 'fill',
        gravity: 'center',
        quality: 'auto',
        fetch_format: 'auto'
      })
    };

    // Если указан postId, обновляем пост с новым изображением
    if (postId) {
      try {
        // Импорт Prisma только при необходимости
        const { prisma } = await import('@/lib/prisma');
        
        await prisma.blogPost.update({
          where: { id: parseInt(postId) },
          data: {
            featuredImage: variants.large
          }
        });
      } catch (dbError) {
        console.error('Error updating post with image:', dbError);
        // Продолжаем выполнение, так как изображение уже загружено
      }
    }

    return NextResponse.json({
      success: true,
      image: {
        publicId: uploadResponse.public_id,
        originalFilename: file.name,
        size: uploadResponse.bytes,
        format: uploadResponse.format,
        width: uploadResponse.width,
        height: uploadResponse.height,
        variants
      }
    });

  } catch (error) {
    console.error('Image upload error:', error);
    
    // Специальная обработка ошибок Cloudinary
    if (error instanceof Error && error.message.includes('Invalid image file')) {
      return NextResponse.json(
        { error: 'Недопустимый формат изображения' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Ошибка при загрузке изображения',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}

// GET - получение информации о загруженных изображениях
export async function GET(request: NextRequest) {
  try {
    // Проверка авторизации
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Требуется авторизация' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder') || 'blog';
    const limit = parseInt(searchParams.get('limit') || '20');

    // Получение списка изображений из Cloudinary
    const result = await cloudinary.search
      .expression(`folder:3gis/${folder}`)
      .sort_by([['created_at', 'desc']])
      .max_results(limit)
      .execute();

    const images = result.resources.map((image: any) => ({
      publicId: image.public_id,
      url: image.secure_url,
      width: image.width,
      height: image.height,
      size: image.bytes,
      format: image.format,
      createdAt: image.created_at,
      tags: image.tags || [],
      variants: {
        original: image.secure_url,
        large: cloudinary.url(image.public_id, {
          width: 1200,
          height: 630,
          crop: 'fill',
          gravity: 'center',
          quality: 'auto',
          fetch_format: 'auto'
        }),
        medium: cloudinary.url(image.public_id, {
          width: 800,
          height: 450,
          crop: 'fill',
          gravity: 'center',
          quality: 'auto',
          fetch_format: 'auto'
        }),
        small: cloudinary.url(image.public_id, {
          width: 400,
          height: 225,
          crop: 'fill',
          gravity: 'center',
          quality: 'auto',
          fetch_format: 'auto'
        }),
        thumbnail: cloudinary.url(image.public_id, {
          width: 150,
          height: 150,
          crop: 'fill',
          gravity: 'center',
          quality: 'auto',
          fetch_format: 'auto'
        })
      }
    }));

    return NextResponse.json({
      images,
      total: result.total_count,
      hasMore: result.resources.length === limit
    });

  } catch (error) {
    console.error('Get images error:', error);
    return NextResponse.json(
      { 
        error: 'Ошибка при получении изображений',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}

// DELETE - удаление изображения
export async function DELETE(request: NextRequest) {
  try {
    // Проверка авторизации
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Требуется авторизация' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get('publicId');

    if (!publicId) {
      return NextResponse.json(
        { error: 'Public ID не указан' },
        { status: 400 }
      );
    }

    // Удаление из Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === 'ok') {
      return NextResponse.json({
        success: true,
        message: 'Изображение успешно удалено'
      });
    } else {
      return NextResponse.json(
        { error: 'Не удалось удалить изображение' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Delete image error:', error);
    return NextResponse.json(
      { 
        error: 'Ошибка при удалении изображения',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}