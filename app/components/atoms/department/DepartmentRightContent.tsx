'use client';
import { PAGE_ROUTES } from '@/config/pageRoutes';
import { Button } from '@heroui/react';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

export default function DepartmentRightContent() {
  const t = useTranslations('DepartmentPage');
  const router = useRouter();
  return (
    <div>
      <Button
        color="primary"
        variant="flat"
        startContent={<Plus />}
        onClick={() => router.push(PAGE_ROUTES.CREATE_DEPARTMENT)}
      >
        {t('create')}
      </Button>
    </div>
  );
}
