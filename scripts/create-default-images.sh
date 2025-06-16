#!/bin/bash

# Скрипт для создания дефолтных изображений в S3 bucket
# Запускать из корневой папки проекта 3GIS

echo "🎨 Создаем дефолтные изображения для S3 bucket..."

# Создаем папку для временных файлов
mkdir -p temp-images

# Дефолтный аватар (200x200 WebP)
echo "👤 Создаем дефолтный аватар..."
magick -size 200x200 xc:"#f3f4f6" \
  -gravity center \
  -font Arial-Bold \
  -pointsize 60 \
  -fill "#9ca3af" \
  -annotate +0+0 "?" \
  temp-images/default-avatar.webp

# Дефолтное изображение заведения (800x600 WebP)
echo "🏢 Создаем дефолтное изображение заведения..."
magick -size 800x600 xc:"#f9fafb" \
  -gravity center \
  -font Arial-Bold \
  -pointsize 48 \
  -fill "#6b7280" \
  -annotate +0-50 "3GIS" \
  -pointsize 24 \
  -annotate +0+50 "Фото заведения" \
  temp-images/default-business.webp

# Логотип 3GIS (512x512 для иконки бота)
echo "🎯 Создаем логотип 3GIS..."
magick -size 512x512 xc:"#3b82f6" \
  -gravity center \
  -font Arial-Bold \
  -pointsize 120 \
  -fill "white" \
  -annotate +0-30 "3GIS" \
  -pointsize 32 \
  -annotate +0+80 "Russian Business Directory" \
  temp-images/3gis-logo.webp

echo "✅ Дефолтные изображения созданы в папке temp-images/"
echo ""
echo "📦 Теперь загрузите их в S3 bucket вручную:"
echo "1. Откройте AWS S3 Console"
echo "2. Перейдите в bucket: 3gis-photos"
echo "3. Создайте папку 'defaults'"
echo "4. Загрузите файлы:"
echo "   - temp-images/default-avatar.webp → defaults/default-avatar.webp"
echo "   - temp-images/default-business.webp → defaults/default-business.webp"
echo "   - temp-images/3gis-logo.webp → defaults/3gis-logo.webp"
echo ""
echo "🔗 Или используйте AWS CLI:"
echo "aws s3 cp temp-images/default-avatar.webp s3://3gis-photos/defaults/"
echo "aws s3 cp temp-images/default-business.webp s3://3gis-photos/defaults/"
echo "aws s3 cp temp-images/3gis-logo.webp s3://3gis-photos/defaults/"
echo ""
echo "🧹 После загрузки удалите временную папку:"
echo "rm -rf temp-images"
