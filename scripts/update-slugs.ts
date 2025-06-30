// scripts/update-slugs.ts
import { updateExistingSlugs } from '../src/lib/slug-generator';

async function main() {
  console.log('🚀 Начинаем обновление slug\'ов для существующих записей...');
  
  try {
    await updateExistingSlugs();
    console.log('✅ Обновление slug\'ов завершено успешно!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка при обновлении slug\'ов:', error);
    process.exit(1);
  }
}

main();