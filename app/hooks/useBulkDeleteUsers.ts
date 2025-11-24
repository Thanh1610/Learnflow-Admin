import { fetcher } from '@/lib/fetcher';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import useSWRMutation from 'swr/mutation';
import { errorMessage } from './errorMessage';

export type BulkDeleteUsersPayload = {
  userIds: number[];
};

export type BulkDeleteUsersResponse = {
  success: boolean;
  message?: string;
  deletedCount?: number;
  error?: string;
};

export function useBulkDeleteUsers() {
  const t = useTranslations('UserPage');
  const {
    trigger,
    isMutating,
    error: swrError,
  } = useSWRMutation<
    BulkDeleteUsersResponse,
    Error,
    string,
    BulkDeleteUsersPayload
  >('/api/users/bulk-delete', async (_key, { arg }) => {
    return fetcher<BulkDeleteUsersResponse, BulkDeleteUsersPayload>(
      '/api/users/bulk-delete',
      {
        method: 'POST',
        body: arg,
      }
    );
  });

  /**
   * Hàm xóa nhiều users (soft delete - set deletedAt)
   * @param payload - userIds array
   * @returns Response từ server hoặc undefined nếu có lỗi
   */
  const bulkDeleteUsers = async (
    payload: BulkDeleteUsersPayload
  ): Promise<BulkDeleteUsersResponse | undefined> => {
    try {
      const response = await trigger(payload);
      if (response?.success) {
        const count = response.deletedCount || payload.userIds.length;
        toast.success(t('deleteUserSuccess', { count }));
      } else {
        toast.error(t('deleteUserFailed'));
      }
      return response;
    } catch (error) {
      console.error('Bulk delete users error:', error);
      toast.error(t('deleteUserFailed'));
      return undefined;
    }
  };

  const error = swrError ? errorMessage(swrError) : null;

  return {
    bulkDeleteUsers,
    isLoading: isMutating,
    error,
  };
}
