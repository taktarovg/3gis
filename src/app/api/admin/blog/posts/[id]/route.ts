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
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true
          }
        },
        author: {
          select: { 
            id: true, 
            firstName: true, 
            lastName: true, 
            avatar: true 
          }
        },
        // Explicit many-to-many для businesses
        mentionedBusinesses: {
          select: {
            business: {
              select: {
                id: true,
                name: true,
                slug: true,
                category: { 
                  select: { 
                    name: true 
                  } 
                },
                city: { 
                  select: { 
                    name: true 
                  } 
                }
              }
            }
          }
        },
        // Explicit many-to-many для chats
        mentionedChats: {
          select: {
            chat: {
              select: {
                id: true,
                title: true,
                slug: true,
                type: true,
                memberCount: true
              }
            }
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

    // Форматируем данные для фронтенда
    const formattedPost = {
      ...post,
      // Упрощаем структуру mentioned entities
      mentionedBusinesses: post.mentionedBusinesses.map(mb => mb.business),
      mentionedChats: post.mentionedChats.map(mc => mc.chat)
    };

    return NextResponse.json(formattedPost);
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

    // Обновление поста в транзакции
    const post = await prisma.$transaction(async (tx) => {
      // 1. Обновляем основной пост
      const updatedPost = await tx.blogPost.update({
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
          publishedAt: status === 'PUBLISHED' ? (publishedAt ? new Date(publishedAt) : new Date()) : null,
          updatedAt: new Date(),
        },
      });

      // 2. Удаляем старые связи с businesses
      await tx.blogPostBusiness.deleteMany({
        where: { blogPostId: postId }
      });

      // 3. Создаем новые связи с businesses
      if (mentionedBusinessIds.length > 0) {
        await tx.blogPostBusiness.createMany({
          data: mentionedBusinessIds.map((businessId: number) => ({
            blogPostId: postId,
            businessId: businessId
          }))
        });
      }

      // 4. Удаляем старые связи с chats
      await tx.blogPostChat.deleteMany({
        where: { blogPostId: postId }
      });

      // 5. Создаем новые связи с chats
      if (mentionedChatIds.length > 0) {
        await tx.blogPostChat.createMany({
          data: mentionedChatIds.map((chatId: number) => ({
            blogPostId: postId,
            chatId: chatId
          }))
        });
      }

      return updatedPost;
    });

    // Получаем обновленный пост с включениями
    const fullPost = await prisma.blogPost.findUnique({
      where: { id: postId },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        author: {
          select: { 
            id: true, 
            firstName: true, 
            lastName: true 
          }
        },
        mentionedBusinesses: {
          select: {
            business: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        mentionedChats: {
          select: {
            chat: {
              select: {
                id: true,
                title: true
              }
            }
          }
        }
      },
    });

    // Форматируем данные для ответа
    const formattedPost = {
      ...fullPost,
      mentionedBusinesses: fullPost?.mentionedBusinesses.map(mb => mb.business) || [],
      mentionedChats: fullPost?.mentionedChats.map(mc => mc.chat) || []
    };

    return NextResponse.json(formattedPost);
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

    // Удаление в транзакции (каскадное удаление связей)
    await prisma.$transaction(async (tx) => {
      // Удаляем связи
      await tx.blogPostBusiness.deleteMany({
        where: { blogPostId: postId }
      });
      
      await tx.blogPostChat.deleteMany({
        where: { blogPostId: postId }
      });

      // Удаляем сам пост
      await tx.blogPost.delete({
        where: { id: postId },
      });
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
