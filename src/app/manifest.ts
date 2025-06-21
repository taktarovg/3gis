import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '3GIS - Russian Business Directory',
    short_name: '3GIS',
    description: 'Find Russian-speaking businesses in USA',
    start_url: '/tg',
    display: 'standalone',
    background_color: '#1e40af',
    theme_color: '#3b82f6',
    orientation: 'portrait',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'any'
      }
    ],
    categories: ['business', 'lifestyle', 'travel'],
    lang: 'ru',
    dir: 'ltr'
  };
}
