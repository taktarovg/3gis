# 🖼️ Дефолтные изображения для 3GIS

## 📦 Файлы для загрузки в S3

После настройки AWS S3 bucket, загрузите эти дефолтные изображения:

### 1. default-business.webp
- **Размер:** 800×600px  
- **Формат:** WebP
- **Качество:** 85%
- **Назначение:** Заведения без фотографий
- **S3 путь:** `defaults/default-business.webp`

### 2. default-avatar.webp  
- **Размер:** 200×200px
- **Формат:** WebP
- **Качество:** 80%
- **Назначение:** Пользователи без аватара
- **S3 путь:** `defaults/default-avatar.webp`

## 🔧 Команды для создания WebP изображений

Если у вас есть исходные PNG/JPG изображения, конвертируйте их:

```bash
# Установите imagemagick или используйте онлайн конвертеры
# Для business (800x600)
convert input-business.jpg -resize 800x600^ -gravity center -extent 800x600 -quality 85 default-business.webp

# Для avatar (200x200) 
convert input-avatar.jpg -resize 200x200^ -gravity center -extent 200x200 -quality 80 default-avatar.webp
```

## 📤 Загрузка в S3

### Через AWS CLI:
```bash
aws s3 cp default-business.webp s3://3gis-photos/defaults/default-business.webp --content-type image/webp
aws s3 cp default-avatar.webp s3://3gis-photos/defaults/default-avatar.webp --content-type image/webp
```

### Через AWS Console:
1. Откройте S3 bucket `3gis-photos`
2. Создайте папку `defaults/`
3. Загрузите файлы с правильными именами
4. Установите **Content-Type:** `image/webp`
5. Сделайте файлы публично доступными

## 🎨 Рекомендации по дизайну

### default-business.webp:
- Нейтральный фон (серый/белый)
- Иконка здания или логотип 3GIS
- Минималистичный дизайн
- Текст "Фото отсутствует" (опционально)

### default-avatar.webp:
- Круглая иконка пользователя
- Нейтральные цвета
- Градиент или solid цвет
- Соответствие brand colors 3GIS

## 🔗 Использование в коде

Дефолтные изображения уже интегрированы в AWS S3 клиент:

```typescript
// src/lib/aws-s3.ts
export const DEFAULT_IMAGES = {
  BUSINESS: `${S3_BASE_URL}/defaults/default-business.webp`,
  AVATAR: `${S3_BASE_URL}/defaults/default-avatar.webp`
};

// Автоматическое использование при ошибках загрузки
catch (error) {
  return `${S3_BASE_URL}/defaults/default-avatar.webp`;
}
```

## ✅ Проверка работоспособности

После загрузки дефолтных изображений:
1. Откройте: `https://3gis-photos.s3.us-east-1.amazonaws.com/defaults/default-business.webp`
2. Откройте: `https://3gis-photos.s3.us-east-1.amazonaws.com/defaults/default-avatar.webp`
3. Убедитесь что изображения загружаются без ошибок
4. Протестируйте в приложении создание заведения без фотографий

---

**💡 Совет:** Используйте сервисы типа [Canva](https://canva.com) или [Figma](https://figma.com) для создания качественных дефолтных изображений в brand стиле 3GIS.
