'use client';

import CustomModal from '@/app/components/molecules/ui/CustomModal';
import ResetPasswordModal from '@/app/components/molecules/user/ResetPasswordModal';
import { useBulkDeleteUsers } from '@/app/hooks/useBulkDeleteUsers';
import { useResetPasswordForUser } from '@/app/hooks/useResetPasswordForUser';
import { useRevokeAccess } from '@/app/hooks/useRevokeAccess';
import { User } from '@/types/user.type';
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from '@heroui/react';
import {
  EllipsisVertical,
  ListRestart,
  LockIcon,
  TrashIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type UserRenderActionProps = {
  user: User;
};

export default function UserRenderAction({ user }: UserRenderActionProps) {
  const t = useTranslations('UserPage');
  const router = useRouter();
  const { resetPasswordForUser } = useResetPasswordForUser();
  const { revokeAccess, isLoading: isRevokingAccess } = useRevokeAccess();
  const { bulkDeleteUsers, isLoading: isDeletingUser } = useBulkDeleteUsers();

  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] =
    useState(false);
  const [isRevokeAccessModalOpen, setIsRevokeAccessModalOpen] = useState(false);
  const [isDeleteUserModalOpen, setIsDeleteUserModalOpen] = useState(false);
  const [resetLink, setResetLink] = useState<string>('');

  const handleResetPassword = async () => {
    const response = await resetPasswordForUser({ userId: user.id });
    if (response?.success && response.resetLink) {
      setResetLink(response.resetLink);
      setIsResetPasswordModalOpen(true);
    }
  };

  const handleRevokeAccess = async () => {
    const response = await revokeAccess({ userId: user.id });
    if (response?.success) {
      setIsRevokeAccessModalOpen(false);
      router.refresh();
    }
  };

  const handleDeleteUser = async () => {
    const response = await bulkDeleteUsers({ userIds: [user.id] });
    if (response?.success) {
      setIsDeleteUserModalOpen(false);
      router.refresh();
    }
  };

  return (
    <>
      <div className="flex items-center gap-4">
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <EllipsisVertical />
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Profile Actions"
            variant="flat"
            onAction={key => {
              if (key === 'resetPassword') {
                handleResetPassword();
              } else if (key === 'revokeAccess') {
                setIsRevokeAccessModalOpen(true);
              } else if (key === 'deleteUser') {
                setIsDeleteUserModalOpen(true);
              }
            }}
          >
            <DropdownItem
              key="resetPassword"
              startContent={<ListRestart className="mr-2 h-4 w-4" />}
            >
              {t('actions.resetPassword')}
            </DropdownItem>
            <DropdownItem
              key="revokeAccess"
              showDivider
              startContent={<LockIcon className="mr-2 h-4 w-4" />}
            >
              {t('actions.revokeAccess')}
            </DropdownItem>
            <DropdownItem
              key="deleteUser"
              color="danger"
              startContent={<TrashIcon className="mr-2 h-4 w-4" />}
            >
              {t('actions.deleteUser')}
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
      <ResetPasswordModal
        isOpen={isResetPasswordModalOpen}
        onOpenChange={setIsResetPasswordModalOpen}
        resetLink={resetLink}
      />
      <CustomModal
        title={t('actions.revokeAccess')}
        description={t('confirmRevokeAccess')}
        isOpen={isRevokeAccessModalOpen}
        onOpenChange={setIsRevokeAccessModalOpen}
        onConfirm={handleRevokeAccess}
        isLoading={isRevokingAccess}
      />
      <CustomModal
        title={t('actions.deleteUser')}
        description={t('confirmDeleteUser')}
        isOpen={isDeleteUserModalOpen}
        onOpenChange={setIsDeleteUserModalOpen}
        onConfirm={handleDeleteUser}
        isLoading={isDeletingUser}
      />
    </>
  );
}
