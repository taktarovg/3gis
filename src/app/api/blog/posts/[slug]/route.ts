import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    // Получение поста по slug
    const post = await prisma.blogPost.findUnique({
      where: {
        slug,
        status: 'PUBLISHED' // Только опубликованные статьи
      },
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
        mentionedBusinesses: {
          include: {
            business: {
              select: {
                id: true,
                name: true,
                category: {
                  select: {
                    name: true
                  }
                },
                city: {
                  select: {
                    name: true,
                    state: true
                  }
                }
              }
            }
          }
        },
        mentionedChats: {
          include: {
            chat: {
              select: {
                id: true,
                title: true,
                description: true,
                memberCount: true,
                telegramLink: true
              }
            }
          }
        }
      }
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Статья не найдена' },
        { status: 404 }
      );
    }

    // Увеличение счетчика просмотров
    await prisma.blogPost.update({
      where: { id: post.id },
      data: {
        viewCount: {
          increment: 1
        }
      }
    });

    // Получение похожих статей из той же категории
    const relatedPosts = await prisma.blogPost.findMany({
      where: {
        categoryId: post.categoryId,
        id: {
          not: post.id
        },
        status: 'PUBLISHED'
      },
      include: {
        category: {
          select: {
            name: true,
            color: true
          }
        },
        author: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: {
        publishedAt: 'desc'
      },
      take: 3
    });

    // Форматирование данных
    const formattedPost = {
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      metaTitle: post.metaTitle,
      metaDescription: post.metaDescription,
      keywords: post.keywords,
      featuredImage: post.featuredImage,
      featuredImageAlt: post.featuredImageAlt,
      viewCount: post.viewCount + 1, // Обновленный счетчик
      readingTime: post.readingTime,
      publishedAt: post.publishedAt,
      updatedAt: post.updatedAt,
      category: post.category,
      author: {
        name: `${post.author.firstName} ${post.author.lastName}`.trim(),
        avatar: post.author.avatar
      },
      mentionedBusinesses: post.mentionedBusinesses.map(mb => ({
        id: mb.business.id,
        name: mb.business.name,
        category: mb.business.category.name,
        city: `${mb.business.city.name}, ${mb.business.city.state}`
      })),
      mentionedChats: post.mentionedChats.map(mc => ({
        id: mc.chat.id,
        title: mc.chat.title,
        description: mc.chat.description,
        memberCount: mc.chat.memberCount,
        telegramLink: mc.chat.telegramLink
      })),
      relatedPosts: relatedPosts.map(rp => ({
        id: rp.id,
        title: rp.title,
        slug: rp.slug,
        excerpt: rp.excerpt,
        featuredImage: rp.featuredImage,
        readingTime: rp.readingTime,
        publishedAt: rp.publishedAt,
        category: rp.category,
        author: {
          name: `${rp.author.firstName} ${rp.author.lastName}`.trim()
        }
      }))
    };

    return NextResponse.json({
      post: formattedPost
    });

  } catch (error) {
    console.error('Get blog post error:', error);
    return NextResponse.json(
      { 
        error: 'Ошибка при получении статьи',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}

// PUT - обновление поста (только для админов)
export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Проверка авторизации
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Требуется авторизация' },
        { status: 401 }
      );
    }

    const { slug } = params;
    const body = await request.json();

    // Поиск поста для обновления
    const existingPost = await prisma.blogPost.findUnique({
      where: { slug }
    });

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Статья не найдена' },
        { status: 404 }
      );
    }

    // Подготовка данных для обновления
    const updateData: any = {};

    if (body.title) updateData.title = body.title;
    if (body.excerpt !== undefined) updateData.excerpt = body.excerpt;
    if (body.content) updateData.content = body.content;
    if (body.categoryId) updateData.categoryId = parseInt(body.categoryId);
    if (body.metaTitle !== undefined) updateData.metaTitle = body.metaTitle;
    if (body.metaDescription !== undefined) updateData.metaDescription = body.metaDescription;
    if (body.keywords !== undefined) updateData.keywords = body.keywords;
    if (body.featuredImage !== undefined) updateData.featuredImage = body.featuredImage;
    if (body.featuredImageAlt !== undefined) updateData.featuredImageAlt = body.featuredImageAlt;

    // Обновление времени чтения при изменении контента
    if (body.content) {
      updateData.readingTime = Math.max(1, Math.ceil(body.content.split(' ').length / 200));
    }

    // Обновление статуса и времени публикации
    if (body.status) {
      updateData.status = body.status;
      if (body.status === 'PUBLISHED' && existingPost.status !== 'PUBLISHED') {
        updateData.publishedAt = new Date();
      }
    }

    // Обновление поста
    const updatedPost = await prisma.blogPost.update({
      where: { slug },
      data: updateData,
      include: {
        category: true,
        author: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    // Обновление связей с заведениями
    if (body.mentionedBusinesses !== undefined) {
      // Удаление старых связей
      await prisma.blogPostBusiness.deleteMany({
        where: { blogPostId: updatedPost.id }
      });

      // Создание новых связей
      if (body.mentionedBusinesses.length > 0) {
        await prisma.blogPostBusiness.createMany({
          data: body.mentionedBusinesses.map((businessId: number) => ({
            blogPostId: updatedPost.id,
            businessId
          }))
        });
      }
    }

    // Обновление связей с чатами
    if (body.mentionedChats !== undefined) {
      // Удаление старых связей
      await prisma.blogPostChat.deleteMany({
        where: { blogPostId: updatedPost.id }
      });

      // Создание новых связей
      if (body.mentionedChats.length > 0) {
        await prisma.blogPostChat.createMany({
          data: body.mentionedChats.map((chatId: number) => ({
            blogPostId: updatedPost.id,
            chatId
          }))
        });
      }
    }

    return NextResponse.json({
      success: true,
      post: {
        id: updatedPost.id,
        slug: updatedPost.slug,
        status: updatedPost.status,
        updatedAt: updatedPost.updatedAt
      }
    });

  } catch (error) {
    console.error('Update blog post error:', error);
    return NextResponse.json(
      { 
        error: 'Ошибка при обновлении статьи',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}

// DELETE - удаление поста (только для админов)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Проверка авторизации
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Требуется авторизация' },
        { status: 401 }
      );
    }

    const { slug } = params;

    // Поиск поста для удаления
    const existingPost = await prisma.blogPost.findUnique({
      where: { slug }
    });

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Статья не найдена' },
        { status: 404 }
      );
    }

    // Удаление связанных данных
    await Promise.all([
      prisma.blogPostBusiness.deleteMany({
        where: { blogPostId: existingPost.id }
      }),
      prisma.blogPostChat.deleteMany({
        where: { blogPostId: existingPost.id }
      })
    ]);

    // Удаление поста
    await prisma.blogPost.delete({
      where: { id: existingPost.id }
    });

    return NextResponse.json({
      success: true,
      message: 'Статья успешно удалена'
    });

  } catch (error) {
    console.error('Delete blog post error:', error);
    return NextResponse.json(
      { 
        error: 'Ошибка при удалении статьи',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}