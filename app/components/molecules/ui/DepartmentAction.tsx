'use client';
import { Department } from '@/types/department.type';
import { Button, Tooltip } from '@heroui/react';
import { CircleSlash, Trash2Icon, UsersIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface DepartmentActionProps {
  item: Department;
  onAction: (action: string, item: Department) => void;
}

export default function DepartmentAction({
  item,
  onAction,
}: DepartmentActionProps) {
  const t = useTranslations('DepartmentPage');

  return (
    <div className="relative flex items-center justify-center gap-3">
      {item.isPublic === false ? (
        <Tooltip content={t('usersTooltip')}>
          <Button
            isIconOnly
            size="sm"
            variant="light"
            className="min-w-unit-6 w-unit-6 h-unit-6"
            onPress={() => onAction('users', item)}
          >
            <UsersIcon className="text-primary-500" size={18} />
          </Button>
        </Tooltip>
      ) : (
        <Tooltip content={t('usersTooltip')}>
          <Button
            isIconOnly
            size="sm"
            variant="light"
            className="min-w-unit-6 w-unit-6 h-unit-6"
            isDisabled
          >
            <CircleSlash className="text-gray-400" size={18} />
          </Button>
        </Tooltip>
      )}
      <Tooltip content={t('delete')}>
        <Button
          isIconOnly
          size="sm"
          variant="light"
          className="min-w-unit-6 w-unit-6 h-unit-6"
          onPress={() => onAction('delete', item)}
        >
          <Trash2Icon className="text-red-500" size={18} />
        </Button>
      </Tooltip>
    </div>
  );
}
