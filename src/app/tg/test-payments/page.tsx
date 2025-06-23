'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Star, 
  Crown, 
  Heart, 
  CheckCircle,
  XCircle,
  Loader2,
  Coffee,
  Utensils,
  Rocket,
  AlertTriangle
} from 'lucide-react';
import { useTelegramStars } from '@/hooks/use-telegram-stars';
import { PremiumPlansModal } from '@/components/premium/PremiumPlansModal';
import { DonationWidget } from '@/components/donations/DonationWidget';
import { SubscriptionStatus } from '@/components/premium/SubscriptionStatus';
import { PREMIUM_PLANS, DONATION_OPTIONS } from '@/lib/telegram-stars/plans';

export default function TestPaymentsPage() {
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [testResults, setTestResults] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
    timestamp: Date;
  }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const { 
    openBusinessSubscription, 
    openDonation, 
    isAuthenticated, 
    userId, 
    user,
    rawInitData 
  } = useTelegramStars();

  const addTestResult = (type: 'success' | 'error' | 'info', message: string) => {
    setTestResults(prev => [...prev, { type, message, timestamp: new Date() }]);
  };

  const testBusinessSubscription = async (plan: 'basic' | 'standard' | 'premium') => {
    setIsLoading(true);
    addTestResult('info', `Начинаем тест подписки: ${plan}`);
    
    try {
      const result = await openBusinessSubscription({
        businessId: 1, // Тестовое заведение
        plan
      });
      
      addTestResult('success', `Подписка ${plan} - Статус: ${result.status}`);
      if (result.status === 'paid') {
        addTestResult('success', `✅ Подписка успешно активирована!`);
      }
    } catch (error) {
      addTestResult('error', `Ошибка подписки ${plan}: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testDonation = async (type: 'coffee' | 'lunch' | 'support', customAmount?: number) => {
    setIsLoading(true);
    addTestResult('info', `Начинаем тест доната: ${type}`);
    
    try {
      const donationConfig = DONATION_OPTIONS[type];
      const result = await openDonation({
        type,
        starsAmount: customAmount || donationConfig.starsAmount || 100,
        message: `Тест доната: ${donationConfig.name}`
      });
      
      addTestResult('success', `Донат ${type} - Статус: ${result.status}`);
      if (result.status === 'paid') {
        addTestResult('success', `💝 Донат успешно отправлен!`);
      }
    } catch (error) {
      addTestResult('error', `Ошибка доната ${type}: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Заголовок */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="w-6 h-6 text-yellow-500 mr-2 fill-current" />
              Тестирование Telegram Stars
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {Object.keys(PREMIUM_PLANS).length}
                </div>
                <div className="text-sm text-gray-600">Премиум планов</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Object.keys(DONATION_OPTIONS).length - 1}
                </div>
                <div className="text-sm text-gray-600">Типов донатов</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${isAuthenticated ? 'text-green-600' : 'text-red-600'}`}>
                  {isAuthenticated ? '✅' : '❌'}
                </div>
                <div className="text-sm text-gray-600">Авторизация</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Статус пользователя */}
        <Card>
          <CardHeader>
            <CardTitle>Информация о пользователе</CardTitle>
          </CardHeader>
          <CardContent>
            {isAuthenticated ? (
              <div className="space-y-2">
                <div className="flex items-center">
                  <Badge variant="default" className="mr-2">Авторизован</Badge>
                  <span>{user?.first_name} {user?.last_name}</span>
                </div>
                <div className="text-sm text-gray-600">
                  User ID: {userId}
                </div>
                <div className="text-sm text-gray-600">
                  Username: @{user?.username || 'не указан'}
                </div>
                <div className="text-sm text-gray-500">
                  Init Data: {rawInitData ? '✅ Загружены' : '❌ Отсутствуют'}
                </div>
              </div>
            ) : (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Для тестирования платежей необходима авторизация через Telegram.
                  Откройте это приложение в Telegram Mini App.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Тестирование подписок */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Crown className="w-5 h-5 text-yellow-500 mr-2" />
              Тестирование премиум подписок
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {Object.entries(PREMIUM_PLANS).map(([key, plan]) => (
                <div key={key} className="border rounded-lg p-4">
                  <div className="text-center mb-3">
                    <h3 className="font-semibold">{plan.name}</h3>
                    <div className="text-2xl font-bold text-blue-600 my-2">
                      {plan.starsAmount} ⭐
                    </div>
                    <div className="text-sm text-gray-500">
                      ~${plan.dollarPrice}
                    </div>
                  </div>
                  <button
                    onClick={() => testBusinessSubscription(key as any)}
                    disabled={!isAuthenticated || isLoading}
                    className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                    ) : (
                      `Тест ${plan.name}`
                    )}
                  </button>
                </div>
              ))}
            </div>
            
            <button
              onClick={() => setShowPremiumModal(true)}
              disabled={!isAuthenticated}
              className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-black py-3 px-4 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Открыть модал премиум планов
            </button>
          </CardContent>
        </Card>

        {/* Тестирование донатов */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Heart className="w-5 h-5 text-red-500 mr-2" />
              Тестирование донатов
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {[
                { type: 'coffee', icon: Coffee, color: 'from-yellow-600 to-orange-600' },
                { type: 'lunch', icon: Utensils, color: 'from-green-500 to-green-600' },
                { type: 'support', icon: Rocket, color: 'from-purple-500 to-purple-600' }
              ].map(({ type, icon: Icon, color }) => {
                const config = DONATION_OPTIONS[type as keyof typeof DONATION_OPTIONS];
                return (
                  <div key={type} className={`bg-gradient-to-r ${color} rounded-lg p-4 text-white`}>
                    <div className="text-center mb-3">
                      <Icon className="w-8 h-8 mx-auto mb-2" />
                      <h3 className="font-semibold">{config.name}</h3>
                      <div className="text-lg font-bold my-1">
                        {config.starsAmount} ⭐
                      </div>
                    </div>
                    <button
                      onClick={() => testDonation(type as any)}
                      disabled={!isAuthenticated || isLoading}
                      className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Тест доната
                    </button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Виджет донатов (компонент) */}
        <Card>
          <CardHeader>
            <CardTitle>Компонент виджета донатов</CardTitle>
          </CardHeader>
          <CardContent>
            <DonationWidget />
          </CardContent>
        </Card>

        {/* Статус подписки (тестовое заведение) */}
        {isAuthenticated && (
          <Card>
            <CardHeader>
              <CardTitle>Статус подписки (тестовое заведение)</CardTitle>
            </CardHeader>
            <CardContent>
              <SubscriptionStatus businessId={1} />
            </CardContent>
          </Card>
        )}

        {/* Результаты тестов */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Результаты тестов</span>
              <button
                onClick={clearResults}
                className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded"
              >
                Очистить
              </button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {testResults.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <Star className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Результаты тестов появятся здесь</p>
                <p className="text-sm">Выполните любой тест выше</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {testResults.map((result, index) => (
                  <div
                    key={index}
                    className={`flex items-start p-3 rounded-lg ${
                      result.type === 'success' ? 'bg-green-50 border-green-200' :
                      result.type === 'error' ? 'bg-red-50 border-red-200' :
                      'bg-blue-50 border-blue-200'
                    } border`}
                  >
                    <div className="mr-3 mt-0.5">
                      {result.type === 'success' ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : result.type === 'error' ? (
                        <XCircle className="w-4 h-4 text-red-600" />
                      ) : (
                        <Star className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className={`text-sm ${
                        result.type === 'success' ? 'text-green-800' :
                        result.type === 'error' ? 'text-red-800' :
                        'text-blue-800'
                      }`}>
                        {result.message}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {result.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Модал премиум планов */}
        <PremiumPlansModal
          businessId={1}
          isOpen={showPremiumModal}
          onClose={() => setShowPremiumModal(false)}
          onSuccess={() => {
            setShowPremiumModal(false);
            addTestResult('success', '🎉 Подписка успешно активирована через модал!');
          }}
        />
      </div>
    </div>
  );
}
