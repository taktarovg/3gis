@echo off
echo Installing blog system dependencies...

:: Markdown editor
npm install @uiw/react-md-editor@^4.0.7
npm install use-debounce
npm install react-hook-form @hookform/resolvers

:: shadcn/ui components for admin panel
call npx shadcn@latest add card
call npx shadcn@latest add textarea  
call npx shadcn@latest add select
call npx shadcn@latest add dialog
call npx shadcn@latest add tabs
call npx shadcn@latest add separator
call npx shadcn@latest add scroll-area
call npx shadcn@latest add skeleton
call npx shadcn@latest add alert
call npx shadcn@latest add progress

echo Blog dependencies installed successfully!
pause