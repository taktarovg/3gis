import { Metadata } from 'next';

// Метаданные для SEO
export const metadata: Metadata = {
  title: 'Блог 3GIS - Полезные статьи для русскоговорящих в США',
  description: 'Читайте наш блог о жизни в Америке, обзоры русскоязычных заведений, гайды по адаптации и полезные советы для иммигрантов.',
  keywords: ['блог 3gis', 'русские в америке', 'иммиграция сша', 'русскоязычные услуги', 'жизнь в америке'],
  openGraph: {
    title: 'Блог 3GIS - Твой помощник в Америке',
    description: 'Полезные статьи, обзоры заведений и гайды для русскоговорящих американцев',
    images: ['/og-blog.jpg'],
    type: 'website'
  }
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
