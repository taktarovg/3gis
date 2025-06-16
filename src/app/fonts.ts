// app/fonts.ts
import { Inter } from 'next/font/google';

// Шрифт для 3GIS - Inter как современный системный шрифт
export const inter = Inter({
  weight: ['400', '500', '600', '700'], // Необходимые веса для 3GIS
  subsets: ['latin', 'cyrillic'], // Поддержка кириллицы и латиницы
  variable: '--font-inter',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'Arial', 'sans-serif'],
});