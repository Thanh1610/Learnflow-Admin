'use client';
import DataTable from '@/app/components/molecules/ui/DataTable';
import { PAGE_ROUTES } from '@/config/pageRoutes';
import { useRouter } from 'next/navigation';
import { Column } from '@/app/components/molecules/ui/DataTable';
import DepartmentAction from '@/app/components/molecules/ui/DepartmentAction';
import { Department } from '@/app/generated/prisma/client';
import CustomModal from '@/app/components/molecules/ui/CustomModal';
import { useTranslations } from 'next-intl';
import { useDisclosure } from '@heroui/react';
import { useState } from 'react';
import { useCreateDepartment } from '@/app/hooks/useDepartment';
import { toast } from 'react-hot-toast';

interface DepartmentTableWrapperProps {
  columns: Column[];
  data: Department[];
}

export default function DepartmentTableWrapper({
  columns,
  data,
}: DepartmentTableWrapperProps) {
  const router = useRouter();
  const t = useTranslations('DepartmentPage');
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [pendingDeleteIds, setPendingDeleteIds] = useState<number[]>([]);
  const {
    deleteDepartment,
    isDeleting,
    bulkDeleteDepartments,
    isBulkDeleting,
  } = useCreateDepartment();

  // Handle action
  const handleAction = (action: string, item: Department) => {
    if (action === 'delete') {
      setPendingDeleteIds([item.id]);
      onOpen();
    }
  };

  // Handle confirm
  const handleConfirm = async () => {
    if (!pendingDeleteIds.length) {
      return;
    }
    try {
      const isBulk = pendingDeleteIds.length > 1;
      const response = isBulk
        ? await bulkDeleteDepartments({ ids: pendingDeleteIds })
        : await deleteDepartment({ id: pendingDeleteIds[0] });
      if (response?.success) {
        toast.success(t('deleteSuccess'));
        setPendingDeleteIds([]);
        onClose();
        router.refresh();
      } else {
        toast.error(t('deleteFailed'));
        onClose();
      }
    } catch (error) {
      console.error('Error deleting department', error);
      toast.error(t('deleteFailed'));
      onClose();
    }
  };

  const handleBulkDeleteRequest = (items: Department[]) => {
    if (!items.length) return;
    setPendingDeleteIds(items.map(item => item.id));
    onOpen();
  };

  const confirmDescription =
    pendingDeleteIds.length > 1
      ? t('confirmBulkDelete', { count: pendingDeleteIds.length })
      : t('confirmDelete');

  const confirmLoadingState =
    pendingDeleteIds.length > 1 ? isBulkDeleting : isDeleting;

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        onAddNew={() => {
          router.push(PAGE_ROUTES.CREATE_DEPARTMENT);
        }}
        renderActions={item => (
          <DepartmentAction item={item} onAction={handleAction} />
        )}
        onRowClick={item => {
          router.push(
            PAGE_ROUTES.EDIT_DEPARTMENT.replace('[id]', item.id.toString())
          );
        }}
        onBulkDelete={handleBulkDeleteRequest}
      />
      <CustomModal
        title={t('delete')}
        description={confirmDescription}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onConfirm={handleConfirm}
        isLoading={confirmLoadingState}
      />
    </>
  );
}
