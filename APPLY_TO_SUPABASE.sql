-- КРИТИЧНЫЕ ИСПРАВЛЕНИЯ ДЛЯ 3GIS
-- Применить в Supabase Dashboard > SQL Editor

-- 1. Добавляем недостающие колонки share_count
ALTER TABLE telegram_chats ADD COLUMN IF NOT EXISTS share_count INTEGER DEFAULT 0;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS share_count INTEGER DEFAULT 0;

-- 2. Обновляем NULL значения в существующих записях
UPDATE telegram_chats SET share_count = 0 WHERE share_count IS NULL;
UPDATE businesses SET share_count = 0 WHERE share_count IS NULL;

-- 3. Добавляем SEO колонки если их нет
ALTER TABLE telegram_chats ADD COLUMN IF NOT EXISTS slug VARCHAR UNIQUE;
ALTER TABLE telegram_chats ADD COLUMN IF NOT EXISTS og_title VARCHAR;
ALTER TABLE telegram_chats ADD COLUMN IF NOT EXISTS og_description VARCHAR;
ALTER TABLE telegram_chats ADD COLUMN IF NOT EXISTS og_image VARCHAR;

ALTER TABLE businesses ADD COLUMN IF NOT EXISTS slug VARCHAR UNIQUE;  
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS og_title VARCHAR;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS og_description VARCHAR;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS og_image VARCHAR;

-- 4. Добавляем индексы для производительности
CREATE INDEX IF NOT EXISTS idx_telegram_chats_share_count ON telegram_chats(share_count);
CREATE INDEX IF NOT EXISTS idx_businesses_share_count ON businesses(share_count);
CREATE INDEX IF NOT EXISTS idx_telegram_chats_slug ON telegram_chats(slug);
CREATE INDEX IF NOT EXISTS idx_businesses_slug ON businesses(slug);

-- 5. Проверяем результат
SELECT 'telegram_chats' as table_name, 
       COUNT(*) as total_rows, 
       COUNT(share_count) as share_count_not_null,
       AVG(share_count) as avg_share_count 
FROM telegram_chats;

SELECT 'businesses' as table_name, 
       COUNT(*) as total_rows, 
       COUNT(share_count) as share_count_not_null,
       AVG(share_count) as avg_share_count 
FROM businesses;

-- 6. Показываем структуру таблиц для проверки
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'telegram_chats' 
  AND column_name IN ('share_count', 'slug', 'og_title', 'og_description', 'og_image')
ORDER BY column_name;

SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'businesses' 
  AND column_name IN ('share_count', 'slug', 'og_title', 'og_description', 'og_image')
ORDER BY column_name;
