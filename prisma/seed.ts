// Updated seed.ts - Полный справочник США для 3GIS
import { PrismaClient } from '@prisma/client';
import { US_STATES } from './us-states';
import { RUSSIAN_SPEAKING_CITIES } from './russian-speaking-cities';
import { OTHER_MAJOR_CITIES } from './other-major-cities';

const prisma = new PrismaClient();

// Категории для 3GIS
const categories = [
  { name: "Рестораны и кафе", nameEn: "Restaurants", slug: "restaurants", icon: "🍽️", order: 1 },
  { name: "Медицина", nameEn: "Healthcare", slug: "healthcare", icon: "⚕️", order: 2 },
  { name: "Юридические услуги", nameEn: "Legal Services", slug: "legal", icon: "⚖️", order: 3 },
  { name: "Красота и здоровье", nameEn: "Beauty & Health", slug: "beauty", icon: "💄", order: 4 },
  { name: "Автосервисы", nameEn: "Auto Services", slug: "auto", icon: "🔧", order: 5 },
  { name: "Финансовые услуги", nameEn: "Financial Services", slug: "finance", icon: "🏦", order: 6 },
  { name: "Образование", nameEn: "Education", slug: "education", icon: "🎓", order: 7 },
  { name: "Недвижимость", nameEn: "Real Estate", slug: "realestate", icon: "🏠", order: 8 }
];

// Объединяем все города
const ALL_CITIES = [
  ...RUSSIAN_SPEAKING_CITIES,
  ...OTHER_MAJOR_CITIES
];

// Тестовые заведения для Нью-Йорка (существующие данные)
const sampleBusinesses = [
  // Рестораны
  {
    name: "Ресторан Русский дом",
    nameEn: "Russian House Restaurant",
    description: "Традиционная русская кухня в сердце Брайтон-Бич. Борщ, пельмени, блины и другие любимые блюда.",
    categorySlug: "restaurants",
    cityName: "New York City",
    stateId: "NY",
    address: "1273 Brighton Beach Ave",
    zipCode: "11235",
    phone: "(718) 555-0123",
    website: "https://russianhouseny.com",
    latitude: 40.5776,
    longitude: -73.9614,
    languages: ["ru", "en"],
    businessHours: {
      mon: "12:00-23:00",
      tue: "12:00-23:00", 
      wed: "12:00-23:00",
      thu: "12:00-23:00",
      fri: "12:00-00:00",
      sat: "12:00-00:00",
      sun: "12:00-23:00"
    },
    hasParking: true,
    rating: 4.8,
    reviewCount: 127
  },
  {
    name: "Кафе Золотой петушок",
    nameEn: "Golden Rooster Cafe",
    description: "Домашняя еда, как у бабушки. Котлеты, супы, свежая выпечка каждый день.",
    categorySlug: "restaurants",
    cityName: "New York City", 
    stateId: "NY",
    address: "1075 Brighton Beach Ave",
    zipCode: "11235",
    phone: "(718) 555-0456",
    latitude: 40.5781,
    longitude: -73.9583,
    languages: ["ru", "en"],
    businessHours: {
      mon: "08:00-22:00",
      tue: "08:00-22:00",
      wed: "08:00-22:00", 
      thu: "08:00-22:00",
      fri: "08:00-22:00",
      sat: "08:00-22:00",
      sun: "09:00-21:00"
    },
    rating: 4.6,
    reviewCount: 89
  },
  {
    name: "Пекарня У тещи",
    nameEn: "Mother-in-Law's Bakery",
    description: "Свежий хлеб, торты на заказ, русские сладости и пирожки с разными начинками.",
    categorySlug: "restaurants",
    cityName: "New York City",
    stateId: "NY",
    address: "1018 Brighton Beach Ave", 
    zipCode: "11235",
    phone: "(718) 555-0789",
    latitude: 40.5785,
    longitude: -73.9577,
    languages: ["ru", "en"],
    businessHours: {
      mon: "07:00-20:00",
      tue: "07:00-20:00",
      wed: "07:00-20:00",
      thu: "07:00-20:00", 
      fri: "07:00-20:00",
      sat: "07:00-20:00",
      sun: "08:00-19:00"
    },
    rating: 4.7,
    reviewCount: 156
  },

  // Медицина
  {
    name: "Доктор Иванов - Семейная медицина",
    nameEn: "Dr. Ivanov Family Medicine",
    description: "Семейный врач с 15-летним опытом. Ведет прием на русском языке, принимает большинство страховок.",
    categorySlug: "healthcare",
    cityName: "New York City",
    stateId: "NY",
    address: "3131 Ocean Pkwy, Suite 2A",
    zipCode: "11235",
    phone: "(718) 555-1234",
    website: "https://drivanov.com",
    latitude: 40.5694,
    longitude: -73.9611,
    languages: ["ru", "en"],
    businessHours: {
      mon: "09:00-18:00",
      tue: "09:00-18:00",
      wed: "09:00-18:00",
      thu: "09:00-18:00",
      fri: "09:00-16:00",
      sat: "10:00-14:00",
      sun: "Закрыто"
    },
    acceptsCrypto: false,
    rating: 4.9,
    reviewCount: 234
  },
  {
    name: "Клиника Здоровье",
    nameEn: "Health Clinic",
    description: "Многопрофильная клиника с русскоговорящими специалистами. Терапия, кардиология, неврология.",
    categorySlug: "healthcare",
    cityName: "New York City",
    stateId: "NY",
    address: "2632 E 14th St",
    zipCode: "11235", 
    phone: "(718) 555-5678",
    website: "https://healthclinicny.com",
    latitude: 40.5889,
    longitude: -73.9606,
    languages: ["ru", "en", "uk"],
    businessHours: {
      mon: "08:00-19:00",
      tue: "08:00-19:00",
      wed: "08:00-19:00",
      thu: "08:00-19:00",
      fri: "08:00-17:00",
      sat: "09:00-15:00",
      sun: "Закрыто"
    },
    hasParking: true,
    rating: 4.5,
    reviewCount: 167
  },

  // Юристы
  {
    name: "Петров и партнеры",
    nameEn: "Petrov & Associates",
    description: "Иммиграционное право, семейное право, создание бизнеса. Бесплатная консультация.",
    categorySlug: "legal",
    cityName: "New York City",
    stateId: "NY",
    address: "1600 Sheepshead Bay Rd, Suite 1",
    zipCode: "11235",
    phone: "(718) 555-9999",
    website: "https://petrovlaw.com",
    latitude: 40.5861,
    longitude: -73.9444,
    languages: ["ru", "en"],
    businessHours: {
      mon: "09:00-18:00",
      tue: "09:00-18:00", 
      wed: "09:00-18:00",
      thu: "09:00-18:00",
      fri: "09:00-17:00",
      sat: "10:00-15:00",
      sun: "Закрыто"
    },
    rating: 4.8,
    reviewCount: 92
  },

  // Красота
  {
    name: "Салон красоты Анна",
    nameEn: "Anna Beauty Salon",
    description: "Стрижки, окрашивание, маникюр, педикюр. Работаем с последними трендами.",
    categorySlug: "beauty",
    cityName: "New York City",
    stateId: "NY",
    address: "1904 86th St",
    zipCode: "11214",
    phone: "(718) 555-3333",
    latitude: 40.5944,
    longitude: -73.9861,
    languages: ["ru", "en"],
    businessHours: {
      mon: "Закрыто",
      tue: "10:00-19:00",
      wed: "10:00-19:00",
      thu: "10:00-19:00",
      fri: "10:00-19:00",
      sat: "09:00-18:00",
      sun: "10:00-16:00"
    },
    rating: 4.7,
    reviewCount: 145
  },

  // Автосервисы
  {
    name: "Русский механик",
    nameEn: "Russian Mechanic",
    description: "Ремонт всех марок авто, диагностика, замена масла. Честные цены, качественная работа.",
    categorySlug: "auto",
    cityName: "New York City",
    stateId: "NY", 
    address: "1879 Coney Island Ave",
    zipCode: "11230",
    phone: "(718) 555-4444",
    latitude: 40.6131,
    longitude: -73.9619,
    languages: ["ru", "en"],
    businessHours: {
      mon: "08:00-18:00",
      tue: "08:00-18:00",
      wed: "08:00-18:00",
      thu: "08:00-18:00",
      fri: "08:00-18:00",
      sat: "09:00-16:00",
      sun: "Закрыто"
    },
    hasParking: true,
    rating: 4.4,
    reviewCount: 89
  }
];

// Тестовый пользователь
const testUser = {
  telegramId: "123456789",
  username: "testuser",
  firstName: "Тест",
  lastName: "Пользователь",
  role: "USER" as const
};

async function main() {
  console.log('🌱 Starting comprehensive seed for 3GIS...');

  // 1. Создаем штаты
  console.log('🏛️ Creating states...');
  for (const state of US_STATES) {
    await prisma.state.upsert({
      where: { id: state.id },
      update: {},
      create: state
    });
  }
  console.log(`✅ Created ${US_STATES.length} states`);

  // 2. Создаем категории
  console.log('📋 Creating categories...');
  for (const category of categories) {
    await prisma.businessCategory.upsert({
      where: { slug: category.slug },
      update: {},
      create: category
    });
  }
  console.log(`✅ Created ${categories.length} categories`);

  // 3. Создаем города
  console.log('🏙️ Creating cities...');
  let cityCount = 0;
  for (const city of ALL_CITIES) {
    await prisma.city.upsert({
      where: { 
        name_stateId: {
          name: city.name,
          stateId: city.stateId
        }
      },
      update: {},
      create: city
    });
    cityCount++;
    
    // Показываем прогресс каждые 50 городов
    if (cityCount % 50 === 0) {
      console.log(`   📍 Processed ${cityCount} cities...`);
    }
  }
  console.log(`✅ Created ${ALL_CITIES.length} cities`);

  // 4. Создаем тестового пользователя
  console.log('👤 Creating test user...');
  const user = await prisma.user.upsert({
    where: { telegramId: testUser.telegramId },
    update: {},
    create: testUser
  });

  // 5. Создаем заведения
  console.log('🏢 Creating businesses...');
  for (const business of sampleBusinesses) {
    const category = await prisma.businessCategory.findUnique({
      where: { slug: business.categorySlug }
    });
    
    const city = await prisma.city.findUnique({
      where: { 
        name_stateId: {
          name: business.cityName,
          stateId: business.stateId
        }
      }
    });

    if (category && city) {
      await prisma.business.create({
        data: {
          name: business.name,
          nameEn: business.nameEn,
          description: business.description,
          categoryId: category.id,
          cityId: city.id,
          stateId: business.stateId,
          address: business.address,
          zipCode: business.zipCode,
          phone: business.phone,
          website: business.website,
          latitude: business.latitude,
          longitude: business.longitude,
          languages: business.languages,
          businessHours: business.businessHours,
          hasParking: business.hasParking || false,
          acceptsCrypto: business.acceptsCrypto || false,
          rating: business.rating || 0,
          reviewCount: business.reviewCount || 0,
          status: 'ACTIVE',
          ownerId: user.id
        }
      });
    }
  }

  console.log('✅ Seed completed successfully!');
  console.log(`📊 Final stats:`);
  console.log(`  - ${US_STATES.length} states (51 total)`);
  console.log(`  - ${categories.length} business categories`);
  console.log(`  - ${ALL_CITIES.length} cities (covering all major US cities)`);
  console.log(`  - ${RUSSIAN_SPEAKING_CITIES.length} Russian-speaking priority cities`);
  console.log(`  - ${OTHER_MAJOR_CITIES.length} other major cities`);
  console.log(`  - ${sampleBusinesses.length} sample businesses`);
  console.log(`  - 1 test user`);
  console.log('🎯 Database ready for 3GIS production!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
