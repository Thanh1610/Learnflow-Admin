'use client';

import { Course } from '@/types/course.type';
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from '@heroui/react';
import { Copy, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface CourseActionProps {
  item: Course;
  onAction: (action: 'edit' | 'duplicate' | 'delete', item: Course) => void;
}

export default function CourseAction({ item, onAction }: CourseActionProps) {
  const tApp = useTranslations('app');

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button
          isIconOnly
          size="sm"
          variant="light"
          className="min-w-unit-6 w-unit-6 h-unit-6"
        >
          <MoreVertical size={18} />
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Course actions"
        onAction={key => onAction(key as 'edit' | 'duplicate' | 'delete', item)}
      >
        <DropdownItem
          key="edit"
          startContent={<Pencil size={16} />}
          textValue={tApp('edit')}
        >
          {tApp('edit')}
        </DropdownItem>
        <DropdownItem
          key="duplicate"
          startContent={<Copy size={16} />}
          textValue={tApp('duplicate')}
        >
          {tApp('duplicate')}
        </DropdownItem>
        <DropdownItem
          key="delete"
          className="text-danger"
          color="danger"
          startContent={<Trash2 size={16} />}
          textValue={tApp('delete')}
        >
          {tApp('delete')}
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
