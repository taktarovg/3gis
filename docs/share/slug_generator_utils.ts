// src/lib/slug-generator.ts
import { prisma } from '@/lib/prisma';

/**
 * Генерация SEO-friendly slug из текста
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Удаляем спецсимволы
    .replace(/\s+/g, '-')     // Пробелы в дефисы
    .replace(/--+/g, '-')     // Множественные дефисы в одинарные
    .replace(/^-+|-+$/g, '')  // Удаляем дефисы в начале и конце
    .trim();
}

/**
 * Транслитерация русского текста в латиницу
 */
export function transliterate(text: string): string {
  const translitMap: { [key: string]: string } = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
    'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
    'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
    'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
    // Заглавные буквы
    'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo',
    'Ж': 'Zh', 'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M',
    'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U',
    'Ф': 'F', 'Х': 'H', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Sch',
    'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya'
  };
  
  return text
    .split('')
    .map(char => translitMap[char] || char)
    .join('');
}

/**
 * Генерация уникального slug с проверкой в базе данных
 */
export async function generateUniqueSlug(
  text: string, 
  type: 'business' | 'chat',
  excludeId?: number
): Promise<string> {
  // Сначала транслитерируем, затем создаем slug
  const transliterated = transliterate(text);
  let baseSlug = generateSlug(transliterated);
  
  // Если получился пустой slug, создаем fallback
  if (!baseSlug) {
    baseSlug = type === 'business' ? 'business' : 'chat';
  }
  
  // Ограничиваем длину slug
  if (baseSlug.length > 50) {
    baseSlug = baseSlug.substring(0, 50);
  }
  
  let finalSlug = baseSlug;
  let counter = 1;
  
  // Проверяем уникальность
  while (true) {
    const existing = type === 'business' 
      ? await prisma.business.findFirst({ 
          where: { 
            slug: finalSlug,
            ...(excludeId && { id: { not: excludeId } })
          } 
        })
      : await prisma.telegramChat.findFirst({ 
          where: { 
            slug: finalSlug,
            ...(excludeId && { id: { not: excludeId } })
          } 
        });
    
    if (!existing) break;
    
    finalSlug = `${baseSlug}-${counter}`;
    counter++;
    
    // Предотвращаем бесконечный цикл
    if (counter > 1000) {
      finalSlug = `${baseSlug}-${Date.now()}`;
      break;
    }
  }
  
  return finalSlug;
}

/**
 * Получение сущности по slug
 */
export async function getBusinessBySlug(slug: string) {
  // Сначала пытаемся найти по slug
  let business = await prisma.business.findFirst({
    where: { slug },
    include: {
      category: true,
      city: true,
      photos: { orderBy: { order: 'asc' } },
      owner: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          username: true
        }
      }
    }
  });
  
  // Если не найден по slug, пытаемся найти по ID (для backward compatibility)
  if (!business && !isNaN(parseInt(slug))) {
    business = await prisma.business.findFirst({
      where: { id: parseInt(slug) },
      include: {
        category: true,
        city: true,
        photos: { orderBy: { order: 'asc' } },
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true
          }
        }
      }
    });
  }
  
  return business;
}

export async function getChatBySlug(slug: string) {
  // Сначала пытаемся найти по slug
  let chat = await prisma.telegramChat.findFirst({
    where: { slug },
    include: {
      city: true
    }
  });
  
  // Если не найден по slug, пытаемся найти по ID
  if (!chat && !isNaN(parseInt(slug))) {
    chat = await prisma.telegramChat.findFirst({
      where: { id: parseInt(slug) },
      include: {
        city: true
      }
    });
  }
  
  return chat;
}

/**
 * Массовое обновление существующих записей с slug'ами
 */
export async function updateExistingSlugs() {
  console.log('Updating existing businesses without slugs...');
  
  // Обновляем бизнесы
  const businessesWithoutSlugs = await prisma.business.findMany({
    where: { slug: null },
    select: { id: true, name: true }
  });
  
  for (const business of businessesWithoutSlugs) {
    const slug = await generateUniqueSlug(business.name, 'business', business.id);
    await prisma.business.update({
      where: { id: business.id },
      data: { slug }
    });
    console.log(`Updated business ${business.id}: ${business.name} -> ${slug}`);
  }
  
  // Обновляем чаты
  const chatsWithoutSlugs = await prisma.telegramChat.findMany({
    where: { slug: null },
    select: { id: true, title: true }
  });
  
  for (const chat of chatsWithoutSlugs) {
    const slug = await generateUniqueSlug(chat.title, 'chat', chat.id);
    await prisma.telegramChat.update({
      where: { id: chat.id },
      data: { slug }
    });
    console.log(`Updated chat ${chat.id}: ${chat.title} -> ${slug}`);
  }
  
  console.log('Slug update completed!');
}

/**
 * Утилиты для валидации slug'ов
 */
export const SlugUtils = {
  /**
   * Проверка валидности slug
   */
  isValidSlug(slug: string): boolean {
    // Slug должен содержать только буквы, цифры и дефисы
    const slugRegex = /^[a-z0-9-]+$/;
    return slugRegex.test(slug) && slug.length >= 1 && slug.length <= 50;
  },

  /**
   * Очистка slug от недопустимых символов
   */
  sanitizeSlug(slug: string): string {
    return generateSlug(slug);
  },

  /**
   * Получение предпросмотра slug из названия
   */
  previewSlug(text: string): string {
    const transliterated = transliterate(text);
    return generateSlug(transliterated);
  }
};

// Экспорт для использования в других модулях
export default {
  generateSlug,
  transliterate,
  generateUniqueSlug,
  getBusinessBySlug,
  getChatBySlug,
  updateExistingSlugs,
  SlugUtils
};