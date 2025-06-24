import { PrismaClient, ChatType, ChatStatus } from '@prisma/client';

const prisma = new PrismaClient();

// Тестовые данные чатов
const chatsData = [
  // Нью-Йорк
  {
    title: "NYC Russian Community",
    description: "Главное русскоязычное сообщество Нью-Йорка. Общение, новости, помощь новичкам.",
    username: "nyc_russian_community",
    type: ChatType.GROUP,
    cityName: "New York",
    stateId: "NY",
    topic: "Общение",
    memberCount: 15420,
    isVerified: true,
    status: ChatStatus.ACTIVE
  },
  {
    title: "Brooklyn Russians",
    description: "Русские в Бруклине - работа, жилье, общение",
    username: "brooklyn_russians",
    type: ChatType.GROUP,
    cityName: "New York",
    stateId: "NY", 
    topic: "Район",
    memberCount: 8930,
    isVerified: true,
    status: ChatStatus.ACTIVE
  },
  {
    title: "NYC Работа для русских",
    description: "Поиск работы в Нью-Йорке для русскоговорящих. Вакансии, резюме, советы.",
    inviteLink: "https://t.me/+abc123_nyc_jobs",
    type: ChatType.GROUP,
    cityName: "New York",
    stateId: "NY",
    topic: "Работа",
    memberCount: 12340,
    isVerified: false,
    status: ChatStatus.ACTIVE
  },
  {
    title: "Недвижимость NYC Russians",
    description: "Аренда, покупка, продажа недвижимости в Нью-Йорке",
    username: "nyc_real_estate_ru", 
    type: ChatType.CHANNEL,
    cityName: "New York",
    stateId: "NY",
    topic: "Недвижимость",
    memberCount: 6780,
    isVerified: false,
    status: ChatStatus.ACTIVE
  },
  {
    title: "Queens Russian Moms",
    description: "Мамочки русскоговорящие в Квинсе - дети, школы, развитие",
    inviteLink: "https://t.me/+def456_queens_moms",
    type: ChatType.GROUP,
    cityName: "New York",
    stateId: "NY",
    topic: "Семья",
    memberCount: 4560,
    isVerified: false,
    status: ChatStatus.ACTIVE
  },

  // Лос-Анджелес
  {
    title: "LA Russian Community",
    description: "Русскоязычное сообщество Лос-Анджелеса. West Hollywood, Beverly Hills, Santa Monica.",
    username: "la_russian_community",
    type: ChatType.GROUP,
    cityName: "Los Angeles",
    stateId: "CA",
    topic: "Общение",
    memberCount: 13280,
    isVerified: true,
    status: ChatStatus.ACTIVE
  },
  {
    title: "Hollywood Russians",
    description: "Русские в Голливуде - кино, творчество, нетворкинг",
    username: "hollywood_russians",
    type: ChatType.GROUP,
    cityName: "Los Angeles", 
    stateId: "CA",
    topic: "Творчество",
    memberCount: 7890,
    isVerified: false,
    status: ChatStatus.ACTIVE
  },
  {
    title: "LA Работа IT",
    description: "IT вакансии и возможности в Лос-Анджелесе для русскоговорящих",
    inviteLink: "https://t.me/+ghi789_la_it_jobs",
    type: ChatType.CHANNEL,
    cityName: "Los Angeles",
    stateId: "CA",
    topic: "IT",
    memberCount: 5420,
    isVerified: false,
    status: ChatStatus.ACTIVE
  },

  // Чикаго
  {
    title: "Chicago Russians",
    description: "Русскоязычное сообщество Чикаго. Devon Avenue, Ukrainian Village.",
    username: "chicago_russians",
    type: ChatType.GROUP,
    cityName: "Chicago",
    stateId: "IL",
    topic: "Общение",
    memberCount: 8760,
    isVerified: true,
    status: ChatStatus.ACTIVE
  },
  {
    title: "Чикаго Барахолка",
    description: "Покупка-продажа для русских в Чикаго",
    inviteLink: "https://t.me/+jkl012_chicago_marketplace",
    type: ChatType.GROUP,
    cityName: "Chicago",
    stateId: "IL",
    topic: "Торговля",
    memberCount: 3450,
    isVerified: false,
    status: ChatStatus.ACTIVE
  },

  // Майами
  {
    title: "Miami Russian Beach",
    description: "Русские в Майами - солнце, море, пляж, бизнес",
    username: "miami_russian_beach",
    type: ChatType.GROUP,
    cityName: "Miami",
    stateId: "FL",
    topic: "Общение",
    memberCount: 9340,
    isVerified: true,
    status: ChatStatus.ACTIVE
  },
  {
    title: "Miami Бизнес",
    description: "Предпринимательство и инвестиции в Майами",
    inviteLink: "https://t.me/+mno345_miami_business",
    type: ChatType.GROUP,
    cityName: "Miami",
    stateId: "FL",
    topic: "Бизнес",
    memberCount: 4680,
    isVerified: false,
    status: ChatStatus.ACTIVE
  },

  // Сан-Франциско
  {
    title: "SF Bay Area Russians",
    description: "Русские в области залива Сан-Франциско. Кремниевая долина, Пало-Альто.",
    username: "sf_bay_russians",
    type: ChatType.GROUP,
    cityName: "San Francisco",
    stateId: "CA",
    topic: "Общение",
    memberCount: 6890,
    isVerified: true,
    status: ChatStatus.ACTIVE
  },
  {
    title: "Silicon Valley Русские",
    description: "IT специалисты в Кремниевой долине - Google, Apple, Meta, стартапы",
    username: "silicon_valley_ru",
    type: ChatType.GROUP,
    cityName: "San Francisco",
    stateId: "CA",
    topic: "IT",
    memberCount: 11240,
    isVerified: true,
    status: ChatStatus.ACTIVE
  },

  // Бостон
  {
    title: "Boston Russian Hub",
    description: "Русскоязычное сообщество Бостона. Кембридж, MIT, Гарвард.",
    inviteLink: "https://t.me/+pqr678_boston_hub",
    type: ChatType.GROUP,
    cityName: "Boston",
    stateId: "MA",
    topic: "Образование",
    memberCount: 4320,
    isVerified: false,
    status: ChatStatus.ACTIVE
  },

  // Сиэтл
  {
    title: "Seattle Russian Tech",
    description: "IT и технологии в Сиэтле - Amazon, Microsoft, стартапы",
    username: "seattle_russian_tech",
    type: ChatType.GROUP,
    cityName: "Seattle",
    stateId: "WA",
    topic: "IT",
    memberCount: 5670,
    isVerified: false,
    status: ChatStatus.ACTIVE
  },

  // Тестовые чаты для модерации
  {
    title: "Test Pending Chat",
    description: "Тестовый чат для проверки модерации",
    username: "test_pending",
    type: ChatType.GROUP,
    cityName: "New York",
    stateId: "NY",
    topic: "Тест",
    memberCount: 10,
    isVerified: false,
    status: ChatStatus.PENDING
  },
  {
    title: "Rejected Chat Example",
    description: "Пример отклоненного чата",
    inviteLink: "https://t.me/+rejected_example",
    type: ChatType.GROUP,
    cityName: "Los Angeles",
    stateId: "CA",
    topic: "Тест",
    memberCount: 5,
    isVerified: false,
    status: ChatStatus.REJECTED
  }
];

async function seedChats() {
  try {
    console.log('🌱 Начинаем заполнение тестовых чатов...');

    // Получаем список городов и штатов для связи
    const cities = await prisma.city.findMany({
      select: { id: true, name: true, stateId: true }
    });

    const states = await prisma.state.findMany({
      select: { id: true, name: true }
    });

    console.log(`📍 Найдено городов: ${cities.length}, штатов: ${states.length}`);

    // Создаем чаты
    let createdCount = 0;
    
    for (const chatData of chatsData) {
      try {
        // Находим ID города
        const city = cities.find(c => 
          c.name.toLowerCase() === chatData.cityName.toLowerCase() && 
          c.stateId === chatData.stateId
        );

        if (!city) {
          console.log(`⚠️  Город не найден: ${chatData.cityName}, ${chatData.stateId}`);
          continue;
        }

        // Проверяем, существует ли уже чат с таким username или title
        const existingChat = await prisma.telegramChat.findFirst({
          where: {
            OR: [
              { username: chatData.username },
              { title: chatData.title }
            ]
          }
        });

        if (existingChat) {
          console.log(`⏭️  Чат уже существует: ${chatData.title}`);
          continue;
        }

        // Создаем чат
        const { cityName, ...createData } = chatData;
        const chat = await prisma.telegramChat.create({
          data: {
            ...createData,
            cityId: city.id,
            viewCount: Math.floor(Math.random() * 1000), // Случайные просмотры
            joinCount: Math.floor(Math.random() * 100),   // Случайные переходы
          }
        });

        console.log(`✅ Создан чат: ${chat.title} (ID: ${chat.id})`);
        createdCount++;

      } catch (error) {
        console.error(`❌ Ошибка создания чата "${chatData.title}":`, error);
      }
    }

    console.log(`🎉 Создано чатов: ${createdCount}/${chatsData.length}`);

    // Статистика по типам
    const stats = await prisma.telegramChat.groupBy({
      by: ['type', 'status'],
      _count: true
    });

    console.log('📊 Статистика чатов:');
    stats.forEach(stat => {
      console.log(`   ${stat.type} (${stat.status}): ${stat._count} шт.`);
    });

    return { success: true, created: createdCount };

  } catch (error) {
    console.error('❌ Ошибка при заполнении чатов:', error);
    throw error;
  }
}

// Экспорт для использования в основном seed файле
export { seedChats };

// Прямой запуск если файл вызывается напрямую
if (require.main === module) {
  seedChats()
    .then((result) => {
      console.log('✅ Заполнение завершено:', result);
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Ошибка заполнения:', error);
      process.exit(1);
    })
    .finally(() => {
      prisma.$disconnect();
    });
}
