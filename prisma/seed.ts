// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

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

// Американские города с русскоязычными общинами
const cities = [
  { name: "New York", state: "NY", latitude: 40.7128, longitude: -74.0060, population: 8336817 },
  { name: "Los Angeles", state: "CA", latitude: 34.0522, longitude: -118.2437, population: 3898747 },
  { name: "Chicago", state: "IL", latitude: 41.8781, longitude: -87.6298, population: 2693976 },
  { name: "Brooklyn", state: "NY", latitude: 40.6782, longitude: -73.9442, population: 2736074 },
  { name: "San Francisco", state: "CA", latitude: 37.7749, longitude: -122.4194, population: 881549 },
  { name: "Miami", state: "FL", latitude: 25.7617, longitude: -80.1918, population: 467963 },
  { name: "Seattle", state: "WA", latitude: 47.6062, longitude: -122.3321, population: 753675 },
  { name: "Boston", state: "MA", latitude: 42.3601, longitude: -71.0589, population: 685094 }
];

// Тестовые заведения (50 для Нью-Йорка)
const sampleBusinesses = [
  // Рестораны
  {
    name: "Ресторан Русский дом",
    nameEn: "Russian House Restaurant",
    description: "Традиционная русская кухня в сердце Брайтон-Бич. Борщ, пельмени, блины и другие любимые блюда.",
    categorySlug: "restaurants",
    cityName: "New York",
    address: "1273 Brighton Beach Ave",
    state: "NY",
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
    cityName: "New York", 
    address: "1075 Brighton Beach Ave",
    state: "NY",
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
    cityName: "New York",
    address: "1018 Brighton Beach Ave", 
    state: "NY",
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
    cityName: "New York",
    address: "3131 Ocean Pkwy, Suite 2A",
    state: "NY", 
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
    cityName: "New York",
    address: "2632 E 14th St",
    state: "NY",
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
    cityName: "New York",
    address: "1600 Sheepshead Bay Rd, Suite 1",
    state: "NY",
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
  {
    name: "Юридическая группа Новиков",
    nameEn: "Novikov Legal Group",
    description: "Недвижимость, корпоративное право, налоговое планирование. 20 лет опыта.",
    categorySlug: "legal",
    cityName: "New York", 
    address: "2110 Ocean Ave, Suite 3B",
    state: "NY",
    zipCode: "11229",
    phone: "(718) 555-7777",
    website: "https://novikovlegal.com",
    latitude: 40.5972,
    longitude: -73.9525,
    languages: ["ru", "en"],
    businessHours: {
      mon: "09:00-18:00",
      tue: "09:00-18:00",
      wed: "09:00-18:00", 
      thu: "09:00-18:00",
      fri: "09:00-16:00",
      sat: "По записи",
      sun: "Закрыто"
    },
    rating: 4.6,
    reviewCount: 78
  },

  // Красота
  {
    name: "Салон красоты Анна",
    nameEn: "Anna Beauty Salon",
    description: "Стрижки, окрашивание, маникюр, педикюр. Работаем с последними трендами.",
    categorySlug: "beauty",
    cityName: "New York",
    address: "1904 86th St",
    state: "NY",
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
    cityName: "New York",
    address: "1879 Coney Island Ave",
    state: "NY", 
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
  console.log('🌱 Starting seed...');

  // 1. Создаем категории
  console.log('📋 Creating categories...');
  for (const category of categories) {
    await prisma.businessCategory.upsert({
      where: { slug: category.slug },
      update: {},
      create: category
    });
  }

  // 2. Создаем города
  console.log('🏙️ Creating cities...');
  for (const city of cities) {
    await prisma.city.upsert({
      where: { name: city.name },
      update: {},
      create: city
    });
  }

  // 3. Создаем тестового пользователя
  console.log('👤 Creating test user...');
  const user = await prisma.user.upsert({
    where: { telegramId: testUser.telegramId },
    update: {},
    create: testUser
  });

  // 4. Создаем заведения
  console.log('🏢 Creating businesses...');
  for (const business of sampleBusinesses) {
    const category = await prisma.businessCategory.findUnique({
      where: { slug: business.categorySlug }
    });
    
    const city = await prisma.city.findUnique({
      where: { name: business.cityName }
    });

    if (category && city) {
      await prisma.business.create({
        data: {
          name: business.name,
          nameEn: business.nameEn,
          description: business.description,
          categoryId: category.id,
          cityId: city.id,
          address: business.address,
          state: business.state,
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

  console.log('✅ Seed completed!');
  console.log(`📊 Created:`);
  console.log(`  - ${categories.length} categories`);
  console.log(`  - ${cities.length} cities`);
  console.log(`  - ${sampleBusinesses.length} businesses`);
  console.log(`  - 1 test user`);
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