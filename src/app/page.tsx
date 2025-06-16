// src/app/page.tsx - главная страница сайта
import { redirect } from 'next/navigation';

export default function HomePage() {
  // Редирект на Telegram Mini App версию
  redirect('/tg');
}