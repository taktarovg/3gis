'use client';

import Script from 'next/script';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  publishedAt: string;
  updatedAt: string;
  readingTime: number;
  viewCount: number;
  keywords: string[];
  category: {
    name: string;
  };
  author: {
    name: string;
    avatar?: string;
  };
}

interface BlogPostSchemaProps {
  post: BlogPost;
  baseUrl?: string;
}

export function BlogPostSchema({ post, baseUrl = 'https://3gis.us' }: BlogPostSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.excerpt,
    "image": post.featuredImage ? [post.featuredImage] : [`${baseUrl}/og-blog-default.jpg`],
    "datePublished": post.publishedAt,
    "dateModified": post.updatedAt,
    "author": {
      "@type": "Person",
      "name": post.author.name,
      ...(post.author.avatar && {
        "image": post.author.avatar
      })
    },
    "publisher": {
      "@type": "Organization",
      "name": "3GIS",
      "url": baseUrl,
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/logos/3gis-logo.png`,
        "width": 180,
        "height": 54
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${baseUrl}/blog/${post.slug}`
    },
    "url": `${baseUrl}/blog/${post.slug}`,
    "keywords": post.keywords.join(', '),
    "articleSection": post.category.name,
    "timeRequired": `PT${post.readingTime}M`,
    "interactionStatistic": {
      "@type": "InteractionCounter",
      "interactionType": "https://schema.org/ReadAction",
      "userInteractionCount": post.viewCount
    },
    "about": {
      "@type": "Thing",
      "name": "Русскоязычные услуги в США",
      "description": "Справочник русскоязычных организаций и услуг в Америке"
    },
    "audience": {
      "@type": "Audience",
      "audienceType": "Russian-speaking Americans"
    },
    "inLanguage": "ru-RU"
  };

  return (
    <Script
      id={`blog-post-schema-${post.id}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema, null, 2)
      }}
    />
  );
}

// Схема для главной страницы блога
interface BlogSchema {
  posts: Array<{
    title: string;
    slug: string;
    excerpt: string;
    publishedAt: string;
    author: { name: string };
  }>;
  baseUrl?: string;
}

export function BlogSchema({ posts, baseUrl = 'https://3gis.us' }: BlogSchema) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "3GIS Блог",
    "description": "Полезные статьи о жизни русскоговорящих в США, обзоры заведений и гайды по адаптации",
    "url": `${baseUrl}/blog`,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${baseUrl}/blog`
    },
    "publisher": {
      "@type": "Organization",
      "name": "3GIS",
      "url": baseUrl,
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/logos/3gis-logo.png`,
        "width": 180,
        "height": 54
      }
    },
    "blogPost": posts.slice(0, 10).map(post => ({
      "@type": "BlogPosting",
      "headline": post.title,
      "description": post.excerpt,
      "url": `${baseUrl}/blog/${post.slug}`,
      "datePublished": post.publishedAt,
      "author": {
        "@type": "Person",
        "name": post.author.name
      }
    })),
    "about": {
      "@type": "Thing",
      "name": "Русскоязычные услуги в США",
      "description": "Информация и советы для русскоговорящих жителей Америки"
    },
    "audience": {
      "@type": "Audience",
      "audienceType": "Russian-speaking Americans"
    },
    "inLanguage": "ru-RU"
  };

  return (
    <Script
      id="blog-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema, null, 2)
      }}
    />
  );
}

// Схема для категории блога
interface BlogCategorySchemaProps {
  category: {
    name: string;
    slug: string;
    description?: string;
  };
  posts: Array<{
    title: string;
    slug: string;
    publishedAt: string;
  }>;
  baseUrl?: string;
}

export function BlogCategorySchema({ 
  category, 
  posts, 
  baseUrl = 'https://3gis.us' 
}: BlogCategorySchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `${category.name} - 3GIS Блог`,
    "description": category.description || `Статьи в категории ${category.name}`,
    "url": `${baseUrl}/blog/category/${category.slug}`,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${baseUrl}/blog/category/${category.slug}`
    },
    "publisher": {
      "@type": "Organization",
      "name": "3GIS",
      "url": baseUrl
    },
    "mainEntity": {
      "@type": "ItemList",
      "name": `Статьи: ${category.name}`,
      "numberOfItems": posts.length,
      "itemListElement": posts.map((post, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "url": `${baseUrl}/blog/${post.slug}`,
        "name": post.title
      }))
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Главная",
          "item": baseUrl
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Блог",
          "item": `${baseUrl}/blog`
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": category.name,
          "item": `${baseUrl}/blog/category/${category.slug}`
        }
      ]
    },
    "about": {
      "@type": "Thing",
      "name": category.name,
      "description": category.description
    },
    "inLanguage": "ru-RU"
  };

  return (
    <Script
      id={`blog-category-schema-${category.slug}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema, null, 2)
      }}
    />
  );
}

// Схема для организации (3GIS)
export function OrganizationSchema({ baseUrl = 'https://3gis.us' }: { baseUrl?: string }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "3GIS",
    "alternateName": "3GIS - Русскоязычный справочник США",
    "description": "Справочник русскоязычных организаций и услуг в США",
    "url": baseUrl,
    "logo": {
      "@type": "ImageObject",
      "url": `${baseUrl}/logos/3gis-logo.png`,
      "width": 180,
      "height": 54
    },
    "foundingDate": "2024",
    "founder": {
      "@type": "Person",
      "name": "3GIS Team"
    },
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "US"
    },
    "areaServed": {
      "@type": "Country",
      "name": "United States"
    },
    "audience": {
      "@type": "Audience",
      "audienceType": "Russian-speaking Americans",
      "geographicArea": {
        "@type": "Country",
        "name": "United States"
      }
    },
    "knowsAbout": [
      "Russian businesses in USA",
      "Russian restaurants",
      "Russian medical services",
      "Immigration services",
      "Russian speaking services",
      "Russian community USA"
    ],
    "sameAs": [
      "https://t.me/ThreeGIS_bot",
      "https://t.me/threegis_news"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "availableLanguage": ["Russian", "English"]
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": baseUrl
    }
  };

  return (
    <Script
      id="organization-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema, null, 2)
      }}
    />
  );
}

// FAQ схема для часто задаваемых вопросов
interface FAQSchemaProps {
  faqs: Array<{
    question: string;
    answer: string;
  }>;
}

export function FAQSchema({ faqs }: FAQSchemaProps) {
  if (!faqs || faqs.length === 0) {
    return null;
  }

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <Script
      id="faq-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema, null, 2)
      }}
    />
  );
}