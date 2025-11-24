'use client';
import CustomModal from '@/app/components/molecules/ui/CustomModal';
import DataTable from '@/app/components/molecules/ui/DataTable';
import UserRenderAction from '@/app/components/molecules/user/userRenderAction';
import { useBulkDeleteUsers } from '@/app/hooks/useBulkDeleteUsers';
import { PAGE_ROUTES } from '@/config/pageRoutes';
import { getAvatarProps } from '@/lib/avatar';
import { formatDateTimeByLocale } from '@/lib/date';
import { User } from '@/types/user.type';
import { Avatar, Chip } from '@heroui/react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function UsersListForm({ users }: { users: User[] }) {
  const t = useTranslations('UserPage.gender');
  const tUserPage = useTranslations('UserPage');
  const tDataTable = useTranslations('UserPage.dataTable.columns');
  const router = useRouter();
  const { bulkDeleteUsers, isLoading: isDeletingUsers } = useBulkDeleteUsers();
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [selectedUsersForDelete, setSelectedUsersForDelete] = useState<User[]>(
    []
  );
  const columns = [
    { name: tDataTable('id'), uid: 'id', sortable: true },
    { name: tDataTable('name'), uid: 'name', sortable: true },
    { name: tDataTable('avatar'), uid: 'avatar', sortable: true },
    { name: tDataTable('phone'), uid: 'phone', sortable: true },
    { name: tDataTable('provider'), uid: 'provider', sortable: true },
    { name: tDataTable('gender'), uid: 'gender', sortable: true },
    { name: tDataTable('address'), uid: 'address', sortable: true },
    { name: tDataTable('email'), uid: 'email', sortable: true },
    { name: tDataTable('role'), uid: 'role', sortable: true },
    { name: tDataTable('createdAt'), uid: 'createdAt', sortable: true },
    { name: tDataTable('actions.title'), uid: 'actions', sortable: true },
  ];

  const renderCell = (item: User, columnKey: string) => {
    if (columnKey === 'avatar') {
      return (
        <Avatar
          {...getAvatarProps(item.id, item.name, item.email, 'md', item.avatar)}
          size="md"
          radius="md"
        />
      );
    }
    if (columnKey === 'actions') {
      return <UserRenderAction user={item} />;
    }
    if (columnKey === 'createdAt') {
      return formatDateTimeByLocale(item.createdAt);
    }
    if (columnKey === 'gender') {
      return item.gender === '1' ? (
        <Chip color="success" variant="solid">
          {t('male')}
        </Chip>
      ) : item.gender === '2' ? (
        <Chip color="secondary" variant="solid">
          {t('female')}
        </Chip>
      ) : (
        <Chip color="warning" variant="solid">
          {t('unknown')}
        </Chip>
      );
    }
    return item[columnKey as keyof User];
  };

  const handleBulkDelete = async () => {
    if (selectedUsersForDelete.length === 0) return;

    const userIds = selectedUsersForDelete.map(user => user.id);
    const response = await bulkDeleteUsers({ userIds });

    if (response?.success) {
      setIsBulkDeleteModalOpen(false);
      setSelectedUsersForDelete([]);
      router.refresh();
    }
  };

  const handleBulkDeleteClick = (selectedItems: User[]) => {
    setSelectedUsersForDelete(selectedItems);
    setIsBulkDeleteModalOpen(true);
  };

  return (
    <>
      <DataTable
        columns={columns}
        data={users}
        renderCell={renderCell}
        onBulkDelete={handleBulkDeleteClick}
        onAddNew={() => {
          router.push(PAGE_ROUTES.CREATE_USER);
        }}
        onRowClick={item => {
          router.push(
            PAGE_ROUTES.EDIT_USER.replace('[id]', item.id.toString())
          );
        }}
      />
      <CustomModal
        title={tUserPage('actions.deleteUser')}
        description={tUserPage('confirmBulkDeleteUser', {
          count: selectedUsersForDelete.length,
        })}
        isOpen={isBulkDeleteModalOpen}
        onOpenChange={setIsBulkDeleteModalOpen}
        onConfirm={handleBulkDelete}
        isLoading={isDeletingUsers}
      />
    </>
  );
}
