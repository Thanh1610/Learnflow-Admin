'use client';

import CustomSelect from '@/app/components/atoms/CustomSelect';
import DepartmentUserGroup from '@/app/components/molecules/ui/DepartmentUserGroup';
import { useAddUsersToDepartment } from '@/app/hooks/useAddUsersToDepartment';
import { useRemoveUsersFromDepartment } from '@/app/hooks/useRemoveUsersFromDepartment';
import { useUsersInDepartment } from '@/app/hooks/useUsersInDepartment';
import { useUsersNotInDepartment } from '@/app/hooks/useUsersNotInDepartment';
import { Department } from '@/types/department.type';
import type { Selection } from '@heroui/react';
import { Button, Card, CardBody, Spacer } from '@heroui/react';
import { UserPlus, UsersIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { mutate } from 'swr';

export default function DepartmentUsersForm({
  department,
}: {
  department: Department;
}) {
  const t = useTranslations('DepartmentPage');
  const { users: usersNotInDepartment, isLoading: isLoadingUsers } =
    useUsersNotInDepartment(department.id);
  const { users: usersInDepartment } = useUsersInDepartment(department.id);
  const [selectedUsers, setSelectedUsers] = useState<Selection>(new Set());
  const [removingUserId, setRemovingUserId] = useState<number | null>(null);
  const {
    addUsersToDepartment,
    isLoading: isAdding,
    error,
  } = useAddUsersToDepartment();
  const { removeUsersFromDepartment, error: removeError } =
    useRemoveUsersFromDepartment();

  const isSelectionEmpty = selectedUsers === 'all' || selectedUsers.size === 0;

  const selectOptions = useMemo(
    () =>
      usersNotInDepartment.map(user => ({
        key: user.id,
        label: user.name || user.email,
      })),
    [usersNotInDepartment]
  );

  const updateCache = (
    usersInDepartment?: unknown,
    usersNotInDepartment?: unknown
  ) => {
    if (usersInDepartment !== undefined) {
      mutate(
        `/api/department/${department.id}/users`,
        { success: true, data: usersInDepartment },
        { revalidate: false }
      );
    }
    if (usersNotInDepartment !== undefined) {
      mutate(
        `/api/department/${department.id}/users-not-in-department`,
        { success: true, data: usersNotInDepartment },
        { revalidate: false }
      );
    }
  };

  const handleAddUsers = async () => {
    if (isSelectionEmpty) return;

    const userIds = Array.from(selectedUsers).map(id => Number(id));
    const result = await addUsersToDepartment({
      departmentId: department.id,
      userIds,
    });

    if (result?.success) {
      toast.success(
        t('addUsersSuccess', {
          count: result.data?.added ?? 0,
          skipped: result.data?.skipped ?? 0,
        })
      );
      setSelectedUsers(new Set());
      updateCache(
        result.data?.usersInDepartment,
        result.data?.usersNotInDepartment
      );
    } else {
      toast.error(result?.error || error || t('addUsersFailed'));
    }
  };

  const handleRemoveUser = async (userId: number) => {
    setRemovingUserId(userId);
    try {
      const result = await removeUsersFromDepartment({
        departmentId: department.id,
        userIds: [userId],
      });

      if (result?.success) {
        toast.success(
          t('removeUserSuccess', { count: result.data?.removed ?? 0 })
        );
        updateCache(
          result.data?.usersInDepartment,
          result.data?.usersNotInDepartment
        );
      } else {
        toast.error(result?.error || removeError || t('removeUserFailed'));
      }
    } finally {
      setRemovingUserId(null);
    }
  };

  if (department.isPublic) {
    return (
      <Card className="w-full">
        <CardBody className="px-4">
          <p className="text-default-500 py-8 text-center">
            {t('editDepartment.publicDepartmentMessage')}
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardBody className="px-4">
        <div className="mt-4 gap-0">
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <CustomSelect
              options={selectOptions}
              label={t('usersNotInDepartment')}
              placeholder={
                isLoadingUsers
                  ? t('loading')
                  : t('usersNotInDepartmentPlaceholder')
              }
              selectionMode="multiple"
              onSelectionChange={setSelectedUsers}
              endContent={<UsersIcon className="text-primary-500" size={18} />}
              className="max-w-xl"
            />
            <Button
              color="primary"
              onPress={handleAddUsers}
              isLoading={isAdding}
              isDisabled={isSelectionEmpty}
              className="w-full sm:w-auto"
              startContent={
                !isAdding ? <UserPlus className="h-4 w-4" /> : undefined
              }
            >
              {t('addUsers')}
            </Button>
          </div>
          <Spacer y={6} />
          <DepartmentUserGroup
            users={usersInDepartment}
            onRemoveUser={handleRemoveUser}
            removingUserId={removingUserId}
          />
        </div>
      </CardBody>
    </Card>
  );
}
