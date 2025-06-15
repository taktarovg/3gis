import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.length < 2) {
    return NextResponse.json([]);
  }

  try {
    // Ищем уникальные адреса в нашей БД заведений
    const addresses = await prisma.business.findMany({
      where: {
        status: 'ACTIVE',
        OR: [
          { address: { contains: query, mode: 'insensitive' } },
          { city: { name: { contains: query, mode: 'insensitive' } } },
          // Можно добавить поиск по району, если будет такое поле
          // { neighborhood: { contains: query, mode: 'insensitive' } }
        ]
      },
      select: {
        address: true,
        city: {
          select: { 
            name: true, 
            state: true 
          }
        }
      },
      take: 10,
      distinct: ['address'] // Убираем дубликаты адресов
    });

    // Форматируем результаты
    const formattedAddresses = addresses.map(business => ({
      address: business.address,
      city: business.city.name,
      state: business.city.state
    }));

    // Убираем дубликаты на уровне полного адреса
    const uniqueAddresses = formattedAddresses.filter((addr, index, self) => 
      index === self.findIndex(a => 
        a.address === addr.address && a.city === addr.city && a.state === addr.state
      )
    );

    return NextResponse.json(uniqueAddresses);
  } catch (error) {
    console.error('Address search error:', error);
    return NextResponse.json({ error: 'Ошибка поиска адресов' }, { status: 500 });
  }
}
