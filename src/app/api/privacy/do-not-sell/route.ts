// src/app/api/privacy/do-not-sell/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Валидация входящих данных
const DoNotSellRequestSchema = z.object({
  email: z.string().email('Неверный формат email'),
  firstName: z.string().min(1, 'Имя обязательно'),
  lastName: z.string().min(1, 'Фамилия обязательна'),
  requestType: z.enum(['opt-out-sale', 'opt-out-sharing', 'limit-sensitive', 'opt-out-all']),
  additionalInfo: z.string().optional(),
});

type DoNotSellRequest = z.infer<typeof DoNotSellRequestSchema>;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Валидация данных
    const validationResult = DoNotSellRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Неверные данные', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { email, firstName, lastName, requestType, additionalInfo } = validationResult.data;

    // Получение IP адреса из заголовков (Next.js 15 совместимо)
    const getClientIP = (req: NextRequest): string => {
      const forwarded = req.headers.get('x-forwarded-for');
      const realIP = req.headers.get('x-real-ip');
      const clientIP = req.headers.get('x-client-ip');
      
      if (forwarded) {
        return forwarded.split(',')[0].trim();
      }
      
      return realIP || clientIP || 'unknown';
    };

    // Здесь в реальном проекте нужно:
    // 1. Сохранить запрос в базе данных
    // 2. Отправить email подтверждение
    // 3. Уведомить команду privacy для обработки
    // 4. Записать в audit log

    const clientIP = getClientIP(request);
    
    console.log('CCPA Do Not Sell Request:', {
      email,
      firstName,
      lastName,
      requestType,
      additionalInfo,
      timestamp: new Date().toISOString(),
      ip: clientIP,
      userAgent: request.headers.get('user-agent') || 'unknown'
    });

    // В реальной реализации здесь должна быть логика:
    // await prisma.privacyRequest.create({
    //   data: {
    //     type: 'DO_NOT_SELL',
    //     email,
    //     firstName,
    //     lastName,
    //     requestType,
    //     additionalInfo,
    //     status: 'PENDING',
    //     ipAddress: request.ip,
    //     userAgent: request.headers.get('user-agent'),
    //   }
    // });

    // Отправка email подтверждения (в реальной реализации)
    // await sendEmailConfirmation(email, firstName, requestType);

    // Уведомление команды privacy
    // await notifyPrivacyTeam({
    //   type: 'DO_NOT_SELL',
    //   email,
    //   firstName,
    //   lastName,
    //   requestType
    // });

    return NextResponse.json({
      success: true,
      message: 'Запрос на отказ от продажи данных принят к обработке',
      requestId: `DNS-${Date.now()}`, // В реальности - UUID из БД
      estimatedProcessingTime: '15 рабочих дней'
    });

  } catch (error) {
    console.error('Error processing do-not-sell request:', error);
    
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера. Попробуйте позже.' },
      { status: 500 }
    );
  }
}

// Для отладки - GET endpoint (убрать в продакшене)
export async function GET() {
  return NextResponse.json({
    message: 'Do Not Sell API endpoint is working',
    requiredFields: ['email', 'firstName', 'lastName', 'requestType'],
    requestTypes: ['opt-out-sale', 'opt-out-sharing', 'limit-sensitive', 'opt-out-all']
  });
}
