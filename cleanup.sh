#!/bin/bash

# 🧹 Принудительная очистка проекта 3GIS

echo "🧹 Очистка проекта 3GIS..."

# Переходим в директорию проекта
cd "D:\dev\3gis" || exit 1

# 1. Удаляем кэш Next.js
echo "🗑️ Удаляем кэш Next.js..."
rm -rf .next
rm -rf .swc

# 2. Удаляем кэш node_modules
echo "🗑️ Очищаем кэш пакетов..."
rm -rf node_modules/.cache
rm -rf .npm

# 3. Очищаем TypeScript кэш
echo "🗑️ Очищаем TypeScript кэш..."
rm -rf tsconfig.tsbuildinfo
rm -rf src/**/*.tsbuildinfo

# 4. Перегенерируем Prisma клиент
echo "🔄 Перегенерируем Prisma клиент..."
npx prisma generate --force

# 5. Проверяем TypeScript
echo "🔍 Проверяем TypeScript..."
npx tsc --noEmit --skipLibCheck

# 6. Тестовая сборка
echo "🏗️ Тестовая сборка..."
npm run build

echo "✅ Очистка завершена!"
