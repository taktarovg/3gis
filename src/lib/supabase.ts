import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Типы для TypeScript
export type Database = {
  public: {
    Tables: {
      blog_posts: {
        Row: {
          id: number;
          title: string;
          slug: string;
          excerpt: string;
          content: string;
          status: 'DRAFT' | 'PUBLISHED';
          categoryId: number;
          authorId: number;
          viewCount: number;
          publishedAt: string | null;
          createdAt: string;
          updatedAt: string;
          metaTitle: string | null;
          metaDescription: string | null;
          keywords: string[];
          featuredImage: string | null;
          featuredImageAlt: string | null;
          readingTime: number | null;
        };
        Insert: {
          title: string;
          slug: string;
          excerpt: string;
          content: string;
          status?: 'DRAFT' | 'PUBLISHED';
          categoryId: number;
          authorId: number;
          metaTitle?: string | null;
          metaDescription?: string | null;
          keywords?: string[];
          featuredImage?: string | null;
          featuredImageAlt?: string | null;
        };
        Update: {
          title?: string;
          slug?: string;
          excerpt?: string;
          content?: string;
          status?: 'DRAFT' | 'PUBLISHED';
          categoryId?: number;
          metaTitle?: string | null;
          metaDescription?: string | null;
          keywords?: string[];
          featuredImage?: string | null;
          featuredImageAlt?: string | null;
          updatedAt?: string;
        };
      };
      blog_categories: {
        Row: {
          id: number;
          name: string;
          slug: string;
          description: string | null;
          color: string;
          created_at: string;
        };
        Insert: {
          name: string;
          slug: string;
          description?: string | null;
          color?: string;
        };
        Update: {
          name?: string;
          slug?: string;
          description?: string | null;
          color?: string;
        };
      };
    };
  };
};