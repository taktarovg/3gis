@echo off
echo 🔧 3GIS Build Check started...
echo ================================

echo 📋 Checking Node.js version...
node -v

echo 📋 Checking npm version...
npm -v

echo.
echo 📦 Installing dependencies...
call npm install --no-fund --no-audit
if %errorlevel% neq 0 (
    echo ❌ npm install failed
    pause
    exit /b 1
)

echo.
echo 🗄️ Generating Prisma client...
call npx prisma generate
if %errorlevel% neq 0 (
    echo ❌ Prisma generate failed
    pause
    exit /b 1
)

echo.
echo 🔍 Type checking...
call npm run type-check
if %errorlevel% neq 0 (
    echo ❌ TypeScript check failed
    pause
    exit /b 1
)

echo.
echo 🧹 Linting code...
call npm run lint
if %errorlevel% neq 0 (
    echo ❌ ESLint check failed
    pause
    exit /b 1
)

echo.
echo 🏗️ Building project...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed
    pause
    exit /b 1
)

echo.
echo ✅ All checks passed!
echo 🚀 Project is ready for deployment to Vercel
echo ================================

echo.
echo 📊 Build info:
if exist .next echo Build directory: .next created successfully

echo.
echo 🔗 Next steps:
echo 1. git add . ^&^& git commit -m "Fix critters dependency and optimizeCss issue"
echo 2. git push origin main  
echo 3. Deploy on Vercel will start automatically

pause