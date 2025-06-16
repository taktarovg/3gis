import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Award } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SuccessScreenProps {
  isOwnerType: boolean;
  mutationData: any;
  onAddAnother: () => void;
}

export function SuccessScreen({ isOwnerType, mutationData, onAddAnother }: SuccessScreenProps) {
  const router = useRouter();

  return (
    <Card>
      <CardContent className="p-8 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        
        <h3 className="text-xl font-semibold text-gray-900 mb-3">
          {isOwnerType ? 'Бизнес отправлен на модерацию!' : 'Место добавлено!'}
        </h3>
        
        <p className="text-gray-600 mb-6">
          {mutationData?.message}
        </p>

        {/* Баллы для community contribution */}
        {mutationData?.points && (
          <div className="bg-green-50 p-4 rounded-lg mb-6">
            <div className="flex items-center justify-center">
              <Award className="w-5 h-5 text-green-600 mr-2" />
              <span className="font-semibold text-green-800">
                +{mutationData.points.points} баллов!
              </span>
            </div>
            <p className="text-green-700 text-sm mt-2">
              Спасибо за помощь сообществу!
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Button 
            onClick={() => router.push('/tg/my-business')}
            className="w-full"
          >
            Мои заведения
          </Button>
          
          <Button 
            variant="outline" 
            onClick={onAddAnother}
            className="w-full"
          >
            Добавить еще одно
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}