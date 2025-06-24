'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, User } from 'lucide-react';

/**
 * Простая авторизация для админки 3GIS
 * Логин: charlotte, Пароль: 13Vbkkbjyjd
 */
export function AdminAuth({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Проверяем сессию в localStorage
    if (typeof window !== 'undefined') {
      return localStorage.getItem('admin-session') === 'charlotte-authenticated';
    }
    return false;
  });

  const [credentials, setCredentials] = useState({ login: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Простая проверка логина-пароля
    if (credentials.login === 'charlotte' && credentials.password === '13Vbkkbjyjd') {
      localStorage.setItem('admin-session', 'charlotte-authenticated');
      setIsAuthenticated(true);
    } else {
      setError('Неверный логин или пароль');
    }

    setIsLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin-session');
    setIsAuthenticated(false);
    setCredentials({ login: '', password: '' });
  };

  if (isAuthenticated) {
    return children;
  }

  // Форма авторизации
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">3GIS Admin</CardTitle>
          <CardDescription>
            Панель администратора русскоязычного справочника
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div>
              <label htmlFor="login" className="block text-sm font-medium text-gray-700 mb-1">
                Логин
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="login"
                  type="text"
                  value={credentials.login}
                  onChange={(e) => setCredentials(prev => ({ ...prev, login: e.target.value }))}
                  placeholder="Введите логин"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Пароль
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Введите пароль"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? 'Вход...' : 'Войти в админку'}
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-gray-500">
            Доступ только для администраторов 3GIS
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
