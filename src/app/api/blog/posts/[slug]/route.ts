import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;

    // Моковые данные для блога (пока нет полной интеграции с Supabase)
    const mockPosts: Record<string, any> = {
      '10-luchshih-russkih-restoranov-v-nyu-yorke': {
        id: 1,
        title: '10 лучших русских ресторанов в Нью-Йорке',
        slug: '10-luchshih-russkih-restoranov-v-nyu-yorke',
        excerpt: 'Подробный обзор самых популярных русскоязычных ресторанов Большого Яблока',
        content: `# 10 лучших русских ресторанов в Нью-Йорке

Нью-Йорк — это город, где можно найти кухню любой страны мира. Для русскоговорящих жителей особенно важно найти места, где подают настоящую домашнюю еду и говорят на родном языке.

## 1. Русский Самовар (Manhattan)
Легендарный ресторан в самом сердце Театрального района...

## 2. Cafe Pushkin (Brooklyn)
Уютное кафе с атмосферой старой Москвы...

## 3. Беседка (Queens)
Семейный ресторан с домашней кухней...

*Читайте полный обзор в нашем приложении 3GIS!*`,
        status: 'PUBLISHED',
        publishedAt: '2024-12-01T10:00:00Z',
        viewCount: 523,
        category: {
          id: 2,
          name: 'Обзоры заведений',
          slug: 'reviews',
          color: '#3B82F6'
        },
        author: {
          id: 1,
          name: '3GIS Team'
        },
        readingTime: 5,
        keywords: ['рестораны', 'русская кухня', 'Нью-Йорк', 'Manhattan', 'Brooklyn'],
        metaTitle: '10 лучших русских ресторанов в Нью-Йорке | 3GIS',
        metaDescription: 'Где поесть настоящую русскую еду в NYC? Обзор проверенных ресторанов с русскоговорящим персоналом.',
        featuredImage: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&h=400&fit=crop',
        featuredImageAlt: 'Русский ресторан в Нью-Йорке'
      },
      'kak-najti-russkogovoryashchego-vracha-v-ssha': {
        id: 2,
        title: 'Как найти русскоговорящего врача в США',
        slug: 'kak-najti-russkogovoryashchego-vracha-v-ssha',
        excerpt: 'Пошаговое руководство по поиску медицинской помощи на родном языке',
        content: `# Как найти русскоговорящего врача в США

Поиск врача, который говорит на вашем родном языке, — это не просто вопрос комфорта, а важная составляющая качественного медицинского обслуживания.

## Почему важно найти русскоговорящего врача?

1. **Точное описание симптомов**
2. **Понимание медицинской терминологии**
3. **Комфортное общение в стрессовых ситуациях**

## Где искать?

### 1. Справочник 3GIS
Самый простой способ — использовать наш справочник русскоязычных врачей...

### 2. Рекомендации сообщества
Спросите в русскоязычных группах...

### 3. Медицинские центры
Многие клиники специализируются на обслуживании русскоговорящих пациентов...`,
        status: 'PUBLISHED',
        publishedAt: '2024-11-25T14:00:00Z',
        viewCount: 892,
        category: {
          id: 1,
          name: 'Гайды',
          slug: 'guides',
          color: '#10B981'
        },
        author: {
          id: 1,
          name: '3GIS Team'
        },
        readingTime: 7,
        keywords: ['врачи', 'медицина', 'русскоговорящие', 'здравоохранение', 'страховка'],
        metaTitle: 'Как найти русскоговорящего врача в США | Гайд 3GIS',
        metaDescription: 'Полное руководство по поиску русскоговорящих врачей в Америке. Советы по выбору, страховке и записи на прием.',
        featuredImage: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=400&fit=crop',
        featuredImageAlt: 'Русскоговорящий врач консультирует пациента'
      }
    };

    const post = mockPosts[slug];

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Увеличиваем счетчик просмотров
    post.viewCount += 1;

    return NextResponse.json(post, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Blog post API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}