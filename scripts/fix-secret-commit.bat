@echo off
echo Fixing secret commit by removing sensitive data...

REM Reset последний коммит (но сохранить изменения в рабочей директории)
git reset --soft HEAD~1

echo Commit has been reset. Now removing sensitive files...

REM Удалить файл с секретами из индекса
git reset HEAD VERCEL_ENV_VARS.md

echo Creating safe version of VERCEL_ENV_VARS.md...
