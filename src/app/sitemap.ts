import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const baseUrl = 'https://3gis.us';

    // Статические страницы
    const staticPages = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1,
      },
      {
        url: `${baseUrl}/tg`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.9,
      },
      {
        url: `${baseUrl}/blog`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.8,
      },
    ];

    // Получение опубликованных статей блога
    const blogPosts = await prisma.blogPost.findMany({
      where: {
        status: 'PUBLISHED'
      },
      select: {
        slug: true,
        updatedAt: true,
        publishedAt: true
      },
      orderBy: {
        publishedAt: 'desc'
      }
    });

    const blogPostPages = blogPosts.map(post => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    // Получение категорий блога
    const blogCategories = await prisma.blogCategory.findMany({
      select: {
        slug: true
      }
    });

    const blogCategoryPages = blogCategories.map(category => ({
      url: `${baseUrl}/blog/category/${category.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

    // Получение заведений для публичных страниц (если они есть)
    const businesses = await prisma.business.findMany({
      where: {
        status: 'ACTIVE'
      },
      select: {
        id: true,
        updatedAt: true
      },
      take: 1000 // Ограничение для sitemap
    });

    const businessPages = businesses.map(business => ({
      url: `${baseUrl}/business/${business.id}`,
      lastModified: business.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }));

    // Получение категорий заведений
    const businessCategories = await prisma.businessCategory.findMany({
      select: {
        slug: true
      }
    });

    const businessCategoryPages = businessCategories.map(category => ({
      url: `${baseUrl}/businesses/${category.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    }));

    // Получение городов (используем name вместо slug)
    const cities = await prisma.city.findMany({
      where: {
        businesses: {
          some: {
            status: 'ACTIVE'
          }
        }
      },
      select: {
        name: true,
        stateId: true
      }
    });

    const cityPages = cities.map(city => ({
      url: `${baseUrl}/city/${encodeURIComponent(city.name.toLowerCase().replace(/\s+/g, '-'))}-${city.stateId.toLowerCase()}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.4,
    }));

    // Объединение всех страниц
    return [
      ...staticPages,
      ...blogPostPages,
      ...blogCategoryPages,
      ...businessPages.slice(0, 500), // Ограничение для больших каталогов
      ...businessCategoryPages,
      ...cityPages
    ];

  } catch (error) {
    console.error('Sitemap generation error:', error);
    
    // Fallback к минимальному sitemap при ошибке
    return [
      {
        url: 'https://3gis.us',
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      {
        url: 'https://3gis.us/blog',
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      },
      {
        url: 'https://3gis.us/tg',
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
    ];
  }
}