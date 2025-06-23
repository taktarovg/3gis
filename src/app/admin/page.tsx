import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  Building2, 
  Star, 
  Heart, 
  Clock, 
  CheckCircle, 
  TrendingUp,
  MapPin,
  RefreshCw,
  CreditCard
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminStats {
  overview: {
    totalUsers: number;
    totalBusinesses: number;
    totalReviews: number;
    totalFavorites: number;
    pendingBusinesses: number;
    activeBusinesses: number;
    recentUsers: number;
    recentBusinesses: number;
  };
  categories: Array<{
    name: string;
    slug: string;
    icon: string;
    count: number;
  }>;
  cities: Array<{
    name: string;
    state: string;
    count: number;
  }>;
  lastUpdated: string;
}

/**
 * Dashboard админки 3GIS
 */
export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': 'Bearer charlotte-admin'
        }
      });

      if (!response.ok) {
        throw new Error('Ошибка загрузки данных');
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Загрузка данных...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertDescription>
          {error}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchStats}
            className="ml-4"
          >
            Повторить
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!stats) {
    return <div>Нет данных</div>;
  }

  const { overview, categories, cities } = stats;

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Обзор русскоязычного справочника 3GIS
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            Обновлено: {new Date(stats.lastUpdated).toLocaleString('ru-RU')}
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchStats}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Обновить
          </Button>
        </div>
      </div>

      {/* Основная статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Пользователи</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{overview.recentUsers} за неделю
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Заведения</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalBusinesses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{overview.recentBusinesses} за неделю
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Отзывы</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalReviews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Всего отзывов
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Избранное</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalFavorites.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Добавлений в избранное
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Статус заведений */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2 text-orange-500" />
              Требуют модерации
            </CardTitle>
            <CardDescription>
              Заведения ожидающие проверки
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {overview.pendingBusinesses}
            </div>
            {overview.pendingBusinesses > 0 && (
              <Badge variant="outline" className="mt-2 text-orange-600">
                Требует внимания
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
              Активные заведения
            </CardTitle>
            <CardDescription>
              Одобренные и активные
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {overview.activeBusinesses}
            </div>
            <Badge variant="outline" className="mt-2 text-green-600">
              Работают в справочнике
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Категории и города */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Категории */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Популярные категории
            </CardTitle>
            <CardDescription>
              Заведения по категориям
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categories.slice(0, 8).map((category) => (
                <div key={category.slug} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-lg mr-2">{category.icon}</span>
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <Badge variant="secondary">
                    {category.count}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Города */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Топ городов
            </CardTitle>
            <CardDescription>
              По количеству заведений
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {cities.slice(0, 8).map((city) => (
                <div key={`${city.name}-${city.state}`} className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">{city.name}</span>
                    <span className="text-sm text-gray-500 ml-2">{city.state}</span>
                  </div>
                  <Badge variant="secondary">
                    {city.count}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Быстрые действия */}
      <Card>
        <CardHeader>
          <CardTitle>Быстрые действия</CardTitle>
          <CardDescription>
            Часто используемые функции
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/admin/businesses">
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center w-full">
                <Clock className="w-6 h-6 mb-2" />
                Модерация заведений
                {overview.pendingBusinesses > 0 && (
                  <Badge className="mt-1" variant="destructive">
                    {overview.pendingBusinesses}
                  </Badge>
                )}
              </Button>
            </Link>
            
            <Link href="/admin/users">
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center w-full">
                <Users className="w-6 h-6 mb-2" />
                Управление пользователями
              </Button>
            </Link>
            
            <Link href="/admin/payments">
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center w-full">
                <CreditCard className="w-6 h-6 mb-2" />
                Telegram Stars
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
