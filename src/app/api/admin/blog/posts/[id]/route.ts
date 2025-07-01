import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateReadingTime } from '@/lib/utils';

// GET /api/admin/blog/posts/[id] - получение поста по ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const postId = parseInt(params.id);

    const post = await prisma.blogPost.findUnique({
      where: { id: postId },
      include: {
        category: true,
        author: {
          select: { id: true, firstName: true, lastName: true, avatar: true }
        },
        mentionedBusinesses: {
          select: { 
            id: true, 
            name: true, 
            slug: true,
            category: { select: { name: true } },
            city: { select: { name: true } }
          }
        },
        mentionedChats: {
          select: { 
            id: true, 
            title: true, 
            slug: true,
            type: true,
            memberCount: true
          }
        }
      },
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog post' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/blog/posts/[id] - обновление поста
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const postId = parseInt(params.id);
    const body = await request.json();
    const {
      title,
      slug,
      excerpt,
      content,
      metaTitle,
      metaDescription,
      keywords = [],
      featuredImage,
      featuredImageAlt,
      categoryId,
      status,
      publishedAt,
      mentionedBusinessIds = [],
      mentionedChatIds = [],
    } = body;

    // Автоматический расчет времени чтения
    const readingTime = calculateReadingTime(content);

    // Обновление поста
    const post = await prisma.blogPost.update({
      where: { id: postId },
      data: {
        title,
        slug,
        excerpt,
        content,
        metaTitle,
        metaDescription,
        keywords,
        readingTime,
        featuredImage,
        featuredImageAlt,
        categoryId: parseInt(categoryId),
        status,
        publishedAt: status === 'PUBLISHED' ? publishedAt || new Date() : null,
        mentionedBusinesses: {
          set: [], // Сначала очищаем все связи
          connect: mentionedBusinessIds.map((id: number) => ({ id })),
        },
        mentionedChats: {
          set: [], // Сначала очищаем все связи
          connect: mentionedChatIds.map((id: number) => ({ id })),
        },
      },
      include: {
        category: true,
        author: {
          select: { id: true, firstName: true, lastName: true }
        },
        mentionedBusinesses: {
          select: { id: true, name: true }
        },
        mentionedChats: {
          select: { id: true, title: true }
        }
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error updating blog post:', error);
    return NextResponse.json(
      { error: 'Failed to update blog post' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/blog/posts/[id] - удаление поста
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const postId = parseInt(params.id);

    await prisma.blogPost.delete({
      where: { id: postId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    return NextResponse.json(
      { error: 'Failed to delete blog post' },
      { status: 500 }
    );
  }
}
