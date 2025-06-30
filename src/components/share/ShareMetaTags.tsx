import { Metadata } from 'next';

interface ShareMetaTagsProps {
  title: string;
  description: string;
  image?: string;
  url: string;
  type: 'business' | 'chat';
}

/**
 * Генерация метаданных для share страниц
 */
export function generateShareMetadata({
  title,
  description,
  image,
  url,
  type
}: ShareMetaTagsProps): Metadata {
  const defaultImage = 'https://3gis.biz/images/3gis-og-image.jpg';
  const siteName = '3GIS - Русскоязычный справочник в США';
  
  return {
    title: `${title} | 3GIS`,
    description,
    
    // Open Graph для социальных сетей
    openGraph: {
      title: title,
      description,
      url,
      siteName,
      images: [
        {
          url: image || defaultImage,
          width: 1200,
          height: 630,
          alt: title,
        }
      ],
      locale: 'ru_RU',
      type: 'website',
    },
    
    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title: title,
      description,
      images: [image || defaultImage],
      site: '@3gis_usa',
      creator: '@3gis_usa',
    },
    
    // Дополнительные мета-теги
    other: {
      // Telegram specific - добавляем только если это чат
      ...(type === 'chat' && { 'telegram:channel': url }),
      
      // Schema.org structured data
      'application/ld+json': JSON.stringify({
        '@context': 'https://schema.org',
        '@type': type === 'business' ? 'LocalBusiness' : 'Organization',
        name: title,
        description,
        url,
        image: image || defaultImage,
        ...(type === 'business' && {
          '@type': 'LocalBusiness',
          address: {
            '@type': 'PostalAddress',
            addressCountry: 'US'
          }
        })
      })
    },
    
    // Canonical URL
    alternates: {
      canonical: url,
    },
    
    // Robots
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

/**
 * Компонент для дополнительных meta тегов в head
 */
export function ShareMetaHead({ title, description, image, url, type }: ShareMetaTagsProps) {
  return (
    <>
      {/* Дополнительные теги для лучшей совместимости */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image || 'https://3gis.biz/images/3gis-og-image.jpg'} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="3GIS - Русскоязычный справочник в США" />
      
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image || 'https://3gis.biz/images/3gis-og-image.jpg'} />
      
      {/* Telegram specific */}
      {type === 'chat' && (
        <meta property="telegram:channel" content={url} />
      )}
      
      {/* Яндекс и VK */}
      <meta property="vk:title" content={title} />
      <meta property="vk:description" content={description} />
      <meta property="vk:image" content={image || 'https://3gis.biz/images/3gis-og-image.jpg'} />
      
      {/* Дополнительные SEO теги */}
      <meta name="theme-color" content="#3B82F6" />
      <meta name="msapplication-TileColor" content="#3B82F6" />
      
      {/* Prefetch DNS for performance */}
      <link rel="dns-prefetch" href="//res.cloudinary.com" />
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
    </>
  );
}