'use client';
import DataTable from '@/app/components/molecules/ui/DataTable';
import { getAvatarProps } from '@/lib/avatar';
import { formatDateTimeByLocale } from '@/lib/date';
import { User } from '@/types/user.type';
import { Avatar, Chip } from '@heroui/react';
import { useTranslations } from 'next-intl';

export default function UsersListForm({ users }: { users: User[] }) {
  const t = useTranslations('UserPage.gender');
  const columns = [
    { name: 'ID', uid: 'id', sortable: true },
    { name: 'Name', uid: 'name', sortable: true },
    { name: 'Avatar', uid: 'avatar', sortable: true },
    { name: 'Phone', uid: 'phone', sortable: true },
    { name: 'Provider', uid: 'provider', sortable: true },
    { name: 'Gender', uid: 'gender', sortable: true },
    { name: 'Address', uid: 'address', sortable: true },
    { name: 'Email', uid: 'email', sortable: true },
    { name: 'Role', uid: 'role', sortable: true },
    { name: 'Created At', uid: 'createdAt', sortable: true },
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
  return <DataTable columns={columns} data={users} renderCell={renderCell} />;
}
