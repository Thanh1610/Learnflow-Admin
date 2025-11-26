'use client';

import CustomModal from '@/app/components/molecules/ui/CustomModal';
import DataTable from '@/app/components/molecules/ui/DataTable';
import CourseAction from '@/app/components/molecules/ui/CourseAction';
import { useBulkDeleteCourses } from '@/app/hooks/useBulkDeleteCourses';
import { PAGE_ROUTES } from '@/config/pageRoutes';
import { formatDateTimeByLocale } from '@/lib/date';
import { Course } from '@/types/course.type';
import { useDisclosure } from '@heroui/react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { ReactNode, useState } from 'react';

interface CourseTableProps {
  data: Course[];
  role?: string;
}

export default function CourseTable({ data, role }: CourseTableProps) {
  const tDataTable = useTranslations('DataTable');
  const tCourse = useTranslations('CoursePage');
  const router = useRouter();
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [pendingDeleteIds, setPendingDeleteIds] = useState<number[]>([]);
  const { bulkDeleteCourses, isLoading: isDeleting } = useBulkDeleteCourses();

  const columns = [
    { name: tDataTable('columns.id'), uid: 'id', sortable: true },
    { name: tDataTable('columns.name'), uid: 'name', sortable: true },
    { name: tDataTable('columns.description'), uid: 'description' },
    {
      name: tDataTable('columns.createdAt'),
      uid: 'created_at',
      sortable: true,
    },
    {
      name: tDataTable('columns.updatedAt'),
      uid: 'updated_at',
      sortable: true,
    },
    {
      name: tDataTable('columns.actions'),
      uid: 'actions',
    },
  ];

  const renderCell = (item: Course, columnKey: string): ReactNode => {
    if (columnKey === 'created_at') {
      return formatDateTimeByLocale(item.created_at);
    }
    if (columnKey === 'updated_at') {
      return formatDateTimeByLocale(item.updated_at);
    }
    if (columnKey === 'actions') {
      return <CourseAction item={item} onAction={handleAction} />;
    }
    return item[columnKey as keyof Course] as ReactNode;
  };

  const handleAction = (
    action: 'edit' | 'duplicate' | 'delete',
    item: Course
  ) => {
    if (action === 'edit') {
      router.push(PAGE_ROUTES.COURSE_EDIT.replace('[id]', item.id.toString()));
      return;
    }
    if (action === 'duplicate') {
      router.push(
        `${PAGE_ROUTES.COURSE_CREATE}?duplicateId=${item.id.toString()}`
      );
      return;
    }
    if (action === 'delete') {
      // Open confirm modal for single delete
      setPendingDeleteIds([item.id]);
      onOpen();
    }
  };

  const handleBulkDeleteRequest = (items: Course[]) => {
    if (!items.length) return;
    setPendingDeleteIds(items.map(item => item.id));
    onOpen();
  };

  const handleConfirmDelete = async () => {
    if (!pendingDeleteIds.length) return;
    try {
      await bulkDeleteCourses({ ids: pendingDeleteIds });
      setPendingDeleteIds([]);
      onClose();
      router.refresh();
    } catch (error) {
      console.error('Delete course failed', error);
    }
  };

  const confirmDescription =
    pendingDeleteIds.length > 1
      ? tCourse('courseList.confirmBulkDelete', {
          count: pendingDeleteIds.length,
        })
      : tCourse('courseList.confirmDelete');

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        renderCell={renderCell}
        onAddNew={
          role === 'SYSTEM_ADMIN'
            ? () => router.push(PAGE_ROUTES.COURSE_CREATE)
            : undefined
        }
        onBulkDelete={
          role === 'SYSTEM_ADMIN' ? handleBulkDeleteRequest : undefined
        }
        showSearch={role === 'SYSTEM_ADMIN'}
        showCheckBox={role === 'SYSTEM_ADMIN'}
      />
      <CustomModal
        title={tDataTable('bulkDelete')}
        description={confirmDescription}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </>
  );
}
