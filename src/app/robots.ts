import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/tg/test-s3/',
        '/tg/auth-test/',
        '/test-upload/',
      ],
    },
    sitemap: 'https://3gis.vercel.app/sitemap.xml',
  };
}
