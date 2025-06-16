'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Crown, Award, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// Типы
export interface BusinessFormData {
  name: string;
  category: string;
  description: string;
  address: string;
  city: string;
  phone: string;
  website: string;
  languages: string[];
  features: string[];
  hours: Record<string, any>;
  photos: string[];
}

// Импортируем компоненты
import { BenefitsCard } from '@/components/add-business/BenefitsCard';
import { ProgressBar } from '@/components/add-business/ProgressBar';
import { BasicInfoStep } from '@/components/add-business/BasicInfoStep';
import { AddressStep } from '@/components/add-business/AddressStep';
import { PhotosStep } from '@/components/add-business/PhotosStep';
import { ReviewStep } from '@/components/add-business/ReviewStep';
import { SuccessScreen } from '@/components/add-business/SuccessScreen';
import { NavigationButtons } from '@/components/add-business/NavigationButtons';

function AddBusinessContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get('type') || 'community'; // 'owner' | 'community'
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<BusinessFormData>({
    name: '',
    category: '',
    description: '',
    address: '',
    city: '',
    phone: '',
    website: '',
    languages: ['ru'],
    features: [],
    hours: {},
    photos: []
  });

  const isOwnerType = type === 'owner';
  const totalSteps = 4;

  // React Query mutation для отправки формы
  const createBusinessMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/businesses/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...data, type }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка при создании заведения');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setStep(5); // Переход к success экрану
    },
    onError: (error: Error) => {
      alert(`Ошибка: ${error.message}`);
    }
  });

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    createBusinessMutation.mutate(formData);
  };

  const resetForm = () => {
    setStep(1);
    setFormData({
      name: '',
      category: '',
      description: '',
      address: '',
      city: '',
      phone: '',
      website: '',
      languages: ['ru'],
      features: [],
      hours: {},
      photos: []
    });
  };

  // Проверка возможности перехода к следующему шагу
  const canProceed = (): boolean => {
    switch (step) {
      case 1:
        return !!(formData.name && formData.category);
      case 2:
        return !!(formData.address && formData.city);
      case 3:
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Link href="/tg/my-business">
          <Button variant="ghost" size="sm" className="mr-3">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        
        <div>
          <div className="flex items-center gap-3 mb-2">
            {isOwnerType ? (
              <div className="flex items-center gap-2">
                <Crown className="w-6 h-6 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">Добавить мой бизнес</h1>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Award className="w-6 h-6 text-green-600" />
                <h1 className="text-2xl font-bold text-gray-900">Добавить в каталог</h1>
              </div>
            )}
          </div>
          
          <p className="text-gray-600 text-sm">
            {isOwnerType 
              ? 'Зарегистрируйте свое заведение и получите доступ к премиум функциям'
              : 'Помогите сообществу - добавьте место, которое вы знаете'
            }
          </p>
        </div>
      </div>

      {/* Success Screen */}
      {step === 5 && (
        <SuccessScreen
          isOwnerType={isOwnerType}
          mutationData={createBusinessMutation.data}
          onAddAnother={resetForm}
        />
      )}

      {/* Main Form - показываем только если не success */}
      {step <= totalSteps && (
        <>
          <BenefitsCard isOwnerType={isOwnerType} />
          <ProgressBar currentStep={step} totalSteps={totalSteps} />

          {/* Form Steps */}
          {step === 1 && (
            <BasicInfoStep
              formData={formData}
              setFormData={setFormData}
              isOwnerType={isOwnerType}
            />
          )}

          {step === 2 && (
            <AddressStep
              formData={formData}
              setFormData={setFormData}
            />
          )}

          {step === 3 && (
            <PhotosStep
              formData={formData}
              setFormData={setFormData}
              isOwnerType={isOwnerType}
            />
          )}

          {step === 4 && (
            <ReviewStep
              formData={formData}
              isOwnerType={isOwnerType}
            />
          )}

          {/* Navigation */}
          <NavigationButtons
            step={step}
            totalSteps={totalSteps}
            isSubmitStep={step === totalSteps}
            isOwnerType={isOwnerType}
            isPending={createBusinessMutation.isPending}
            canProceed={canProceed()}
            onPrevious={handlePrev}
            onNext={handleNext}
            onSubmit={handleSubmit}
          />
        </>
      )}
    </div>
  );
}

export default function AddBusinessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    }>
      <AddBusinessContent />
    </Suspense>
  );
}