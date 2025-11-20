'use client';
import { Button, Tooltip } from '@heroui/react';
import { useTranslations } from 'next-intl';
import { Department } from '@/app/generated/prisma/client';
import { Trash2Icon } from 'lucide-react';

interface DepartmentActionProps {
  item: Department;
  onAction: (action: string, item: Department) => void;
}

export default function DepartmentAction({
  item,
  onAction,
}: DepartmentActionProps) {
  const t = useTranslations('DepartmentPage');

  const actions = [
    {
      key: 'delete',
      icon: Trash2Icon,
      label: t('delete'),
      iconClassName: 'text-red-500',
    },
  ];

  return (
    <div className="relative flex justify-center items-center gap-3">
      {actions.map(action => {
        const Icon = action.icon;
        return (
          <Tooltip key={action.key} content={action.label}>
            <Button
              isIconOnly
              size="sm"
              variant="light"
              className="min-w-unit-6 w-unit-6 h-unit-6"
              onPress={() => onAction(action.key, item)}
            >
              <Icon className={action.iconClassName} size={18} />
            </Button>
          </Tooltip>
        );
      })}
    </div>
  );
}
