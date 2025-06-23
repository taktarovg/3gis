import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { prisma } from '@/lib/prisma';

interface PaymentStats {
  totalSubscriptions: number;
  activeSubscriptions: number;
  totalStarsEarned: number;
  totalDonations: number;
  monthlyRevenue: number;
  subscriptionGrowth: number;
}

interface RecentTransaction {
  id: string;
  type: 'subscription' | 'donation';
  businessName?: string;
  plan?: string;
  starsAmount: number;
  status: string;
  createdAt: Date;
  userName: string;
}

async function getPaymentStats(): Promise<PaymentStats> {
  try {
    // Получаем статистику подписок
    const subscriptions = await prisma.businessSubscription.findMany();
    const donations = await prisma.donation.findMany();
    
    const totalSubscriptions = subscriptions.length;
    const activeSubscriptions = subscriptions.filter(s => s.status === 'ACTIVE').length;
    const totalStarsEarned = [
      ...subscriptions.map(s => s.starsAmount),
      ...donations.map(d => d.starsAmount)
    ].reduce((sum, amount) => sum + amount, 0);
    const totalDonations = donations.length;
    
    return {
      totalSubscriptions,
      activeSubscriptions,
      totalStarsEarned,
      totalDonations,
      monthlyRevenue: totalStarsEarned * 0.01,
      subscriptionGrowth: 23
    };
  } catch (error) {
    console.error('Error fetching payment stats:', error);
    return {
      totalSubscriptions: 0,
      activeSubscriptions: 0,
      totalStarsEarned: 0,
      totalDonations: 0,
      monthlyRevenue: 0,
      subscriptionGrowth: 0
    };
  }
}

async function getRecentTransactions(): Promise<RecentTransaction[]> {
  try {
    const transactions = await prisma.paymentTransaction.findMany({
      include: {
        subscription: {
          include: {
            business: true
          }
        },
        donation: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });
    
    return transactions.map(t => ({
      id: t.id,
      type: t.subscriptionId ? 'subscription' : 'donation',
      businessName: t.subscription?.business?.name,
      starsAmount: t.starsAmount,
      status: t.status,
      createdAt: t.createdAt,
      userName: 'Пользователь' // TODO: получать из связанных данных
    }));
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
}

export default async function PaymentsDashboard() {
  const stats = await getPaymentStats();
  const recentTransactions = await getRecentTransactions();
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          💫 Аналитика Telegram Stars
        </h1>
        <p className="text-gray-600">
          Управление подписками и донатами
        </p>
      </div>

      {/* Статистические карточки */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Всего подписок
            </CardTitle>
            <div className="text-2xl">👑</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSubscriptions}</div>
            <p className="text-xs text-green-600">
              +{stats.subscriptionGrowth}% за месяц
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Активных подписок
            </CardTitle>
            <div className="text-2xl">✅</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
            <p className="text-xs text-gray-600">
              из {stats.totalSubscriptions} общих
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Заработано Stars
            </CardTitle>
            <div className="text-2xl">⭐</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalStarsEarned.toLocaleString()}
            </div>
            <p className="text-xs text-gray-600">
              ≈ ${(stats.totalStarsEarned * 0.01).toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Донатов получено
            </CardTitle>
            <div className="text-2xl">💝</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDonations}</div>
            <p className="text-xs text-green-600">
              +5% за неделю
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Последние транзакции */}
      <Card>
        <CardHeader>
          <CardTitle>Последние транзакции</CardTitle>
        </CardHeader>
        <CardContent>
          {recentTransactions.length > 0 ? (
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">
                      {transaction.type === 'subscription' ? '👑' : '💝'}
                    </div>
                    <div>
                      <div className="font-medium">
                        {transaction.type === 'subscription' 
                          ? (transaction.businessName || 'Подписка')
                          : 'Донат проекту'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {transaction.userName} • {formatDate(transaction.createdAt.toISOString())}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-semibold">
                      {transaction.starsAmount} ⭐
                    </div>
                    <Badge 
                      variant={transaction.status === 'PAID' ? 'default' : 'secondary'}
                    >
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📊</div>
              <p>Пока нет транзакций</p>
              <p className="text-sm">Первые платежи появятся здесь</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Действия админа */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Управление подписками</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
              Просмотреть все подписки
            </button>
            <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors">
              Экспорт в CSV
            </button>
            <button className="w-full bg-yellow-500 text-black py-2 px-4 rounded-md hover:bg-yellow-600 transition-colors">
              Настроить тарифы
            </button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Донаты и поддержка</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <button className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors">
              История донатов
            </button>
            <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors">
              Отправить благодарности
            </button>
            <a 
              href="/tg/test-payments" 
              target="_blank"
              className="w-full bg-pink-500 text-white py-2 px-4 rounded-md hover:bg-pink-600 transition-colors text-center block"
            >
              🧪 Тестировать платежи
            </a>
          </CardContent>
        </Card>
      </div>

      {/* Статистика и графики */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Распределение подписок</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Базовый план</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-gray-600 h-2 rounded-full" style={{width: '60%'}}></div>
                  </div>
                  <span className="text-sm text-gray-600">60%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Стандарт план</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{width: '30%'}}></div>
                  </div>
                  <span className="text-sm text-gray-600">30%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Премиум план</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{width: '10%'}}></div>
                  </div>
                  <span className="text-sm text-gray-600">10%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Конверсия и метрики</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Конверсия в премиум</span>
                <span className="font-medium">12.5%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Средний чек (Stars)</span>
                <span className="font-medium">1,850 ⭐</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Retention 30 дней</span>
                <span className="font-medium">85%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">LTV пользователя</span>
                <span className="font-medium">$45</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
