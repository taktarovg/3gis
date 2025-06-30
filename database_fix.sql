-- Добавление недостающих колонок для системы шеринга
ALTER TABLE telegram_chats ADD COLUMN IF NOT EXISTS share_count INTEGER DEFAULT 0;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS share_count INTEGER DEFAULT 0;

-- Обновляем существующие записи
UPDATE telegram_chats SET share_count = 0 WHERE share_count IS NULL;
UPDATE businesses SET share_count = 0 WHERE share_count IS NULL;

-- Добавляем индексы для производительности
CREATE INDEX IF NOT EXISTS idx_telegram_chats_share_count ON telegram_chats(share_count);
CREATE INDEX IF NOT EXISTS idx_businesses_share_count ON businesses(share_count);

-- Добавляем недостающие колонки для SEO если их нет
ALTER TABLE telegram_chats ADD COLUMN IF NOT EXISTS slug VARCHAR UNIQUE;
ALTER TABLE telegram_chats ADD COLUMN IF NOT EXISTS og_title VARCHAR;
ALTER TABLE telegram_chats ADD COLUMN IF NOT EXISTS og_description VARCHAR;
ALTER TABLE telegram_chats ADD COLUMN IF NOT EXISTS og_image VARCHAR;

ALTER TABLE businesses ADD COLUMN IF NOT EXISTS slug VARCHAR UNIQUE;  
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS og_title VARCHAR;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS og_description VARCHAR;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS og_image VARCHAR;
