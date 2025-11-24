'use client';
import CustomModal from '@/app/components/molecules/ui/CustomModal';
import DataTable from '@/app/components/molecules/ui/DataTable';
import DepartmentAction from '@/app/components/molecules/ui/DepartmentAction';
import { useCreateDepartment } from '@/app/hooks/useDepartment';
import { PAGE_ROUTES } from '@/config/pageRoutes';
import { formatDateTimeByLocale } from '@/lib/date';
import { Department } from '@/types/department.type';
import { Chip, useDisclosure } from '@heroui/react';
import { Check, XIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { ReactNode, useState } from 'react';
import { toast } from 'react-hot-toast';
interface DepartmentTableWrapperProps {
  data: Department[];
}

export default function DepartmentTableWrapper({
  data,
}: DepartmentTableWrapperProps) {
  const router = useRouter();
  const t = useTranslations('DepartmentPage');
  const tDataTable = useTranslations('DataTable');

  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [pendingDeleteIds, setPendingDeleteIds] = useState<number[]>([]);
  const {
    deleteDepartment,
    isDeleting,
    bulkDeleteDepartments,
    isBulkDeleting,
  } = useCreateDepartment();

  const columns = [
    { name: tDataTable('columns.id'), uid: 'id', sortable: true },
    {
      name: tDataTable('columns.name'),
      uid: 'name',
      sortable: true,
      width: 240,
    },
    {
      name: tDataTable('columns.isPublic'),
      uid: 'isPublic',
    },
    { name: tDataTable('columns.description'), uid: 'description' },
    { name: tDataTable('columns.createdAt'), uid: 'createdAt' },
    { name: tDataTable('columns.updatedAt'), uid: 'updatedAt' },
    { name: tDataTable('columns.actions'), uid: 'actions' },
  ];

  // Handle action
  const handleAction = (action: string, item: Department) => {
    if (action === 'delete') {
      setPendingDeleteIds([item.id]);
      onOpen();
    }
    if (action === 'users') {
      router.push(
        PAGE_ROUTES.DEPARTMENT_USER.replace('[id]', item.id.toString())
      );
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

  const renderCell = (item: Department, columnKey: string): ReactNode => {
    if (columnKey === 'isPublic') {
      return item.isPublic ? (
        <Chip color="success" variant="solid">
          <Check size={18} />
        </Chip>
      ) : (
        <Chip color="danger" variant="solid">
          <XIcon size={18} />
        </Chip>
      );
    }

    if (columnKey === 'actions') {
      return <DepartmentAction item={item} onAction={handleAction} />;
    }

    if (columnKey === 'createdAt' || columnKey === 'updatedAt') {
      return formatDateTimeByLocale(item[columnKey]);
    }

    return item[columnKey as keyof Department];
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
        renderCell={renderCell}
        onAddNew={() => {
          router.push(PAGE_ROUTES.CREATE_DEPARTMENT);
        }}
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
