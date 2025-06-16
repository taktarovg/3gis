import { Button } from '@/components/ui/button';
import { Crown, Award, Loader2 } from 'lucide-react';

interface NavigationButtonsProps {
  step: number;
  totalSteps: number;
  isSubmitStep: boolean;
  isOwnerType: boolean;
  isPending: boolean;
  canProceed: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

export function NavigationButtons({
  step,
  totalSteps,
  isSubmitStep,
  isOwnerType,
  isPending,
  canProceed,
  onPrevious,
  onNext,
  onSubmit
}: NavigationButtonsProps) {
  return (
    <div className="flex gap-3 mt-6 pb-20">
      {step > 1 && (
        <Button
          variant="outline"
          onClick={onPrevious}
          className="flex-1"
          disabled={isPending}
        >
          Назад
        </Button>
      )}
      
      {!isSubmitStep ? (
        <Button
          onClick={onNext}
          className="flex-1"
          disabled={!canProceed}
        >
          Далее
        </Button>
      ) : (
        <Button
          onClick={onSubmit}
          className="flex-1 bg-green-600 hover:bg-green-700"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Отправляем...
            </>
          ) : isOwnerType ? (
            <>
              <Crown className="w-4 h-4 mr-2" />
              Зарегистрировать бизнес
            </>
          ) : (
            <>
              <Award className="w-4 h-4 mr-2" />
              Добавить в каталог
            </>
          )}
        </Button>
      )}
    </div>
  );
}