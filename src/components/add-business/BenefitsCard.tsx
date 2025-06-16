import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Award, Star, Building, Users, Camera } from 'lucide-react';

interface BenefitsCardProps {
  isOwnerType: boolean;
}

export function BenefitsCard({ isOwnerType }: BenefitsCardProps) {
  return (
    <Card className={`mb-6 ${isOwnerType ? 'border-blue-200 bg-blue-50' : 'border-green-200 bg-green-50'}`}>
      <CardContent className="p-6">
        <h3 className="font-semibold mb-3 flex items-center">
          {isOwnerType ? (
            <>
              <Crown className="w-5 h-5 mr-2 text-blue-600" />
              Преимущества владельца
            </>
          ) : (
            <>
              <Award className="w-5 h-5 mr-2 text-green-600" />
              За вашу помощь
            </>
          )}
        </h3>
        
        <div className="grid grid-cols-1 gap-3">
          {isOwnerType ? (
            <>
              <div className="flex items-center text-sm">
                <Star className="w-4 h-4 mr-2 text-blue-500" />
                <span>Верификация заведения с зеленой галочкой</span>
              </div>
              <div className="flex items-center text-sm">
                <Building className="w-4 h-4 mr-2 text-blue-500" />
                <span>Приоритет в результатах поиска</span>
              </div>
              <div className="flex items-center text-sm">
                <Users className="w-4 h-4 mr-2 text-blue-500" />
                <span>Ответы на отзывы клиентов</span>
              </div>
              <div className="flex items-center text-sm">
                <Crown className="w-4 h-4 mr-2 text-blue-500" />
                <span>Аналитика просмотров и звонков</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center text-sm">
                <Award className="w-4 h-4 mr-2 text-green-500" />
                <span>+5 баллов за каждое добавленное место</span>
              </div>
              <div className="flex items-center text-sm">
                <Camera className="w-4 h-4 mr-2 text-green-500" />
                <span>+2 балла за каждое загруженное фото</span>
              </div>
              <div className="flex items-center text-sm">
                <Star className="w-4 h-4 mr-2 text-green-500" />
                <span>Значки достижений в профиле</span>
              </div>
              <div className="flex items-center text-sm">
                <Users className="w-4 h-4 mr-2 text-green-500" />
                <span>Позиция в лидерборде сообщества</span>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}