import { fetcher } from '@/lib/fetcher';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import useSWRMutation from 'swr/mutation';
import { errorMessage } from './errorMessage';

export type RevokeAccessPayload = {
  userId: number;
};

export type RevokeAccessResponse = {
  success: boolean;
  message?: string;
  error?: string;
};

export function useRevokeAccess() {
  const t = useTranslations('UserPage');
  const {
    trigger,
    isMutating,
    error: swrError,
  } = useSWRMutation<RevokeAccessResponse, Error, string, RevokeAccessPayload>(
    '/api/users/revoke-access',
    async (_key, { arg }) => {
      return fetcher<RevokeAccessResponse, RevokeAccessPayload>(
        '/api/users/revoke-access',
        {
          method: 'POST',
          body: arg,
        }
      );
    }
  );

  /**
   * Hàm thu hồi quyền truy cập của user (set clientRefreshToken về null)
   * @param payload - userId
   * @returns Response từ server hoặc undefined nếu có lỗi
   */
  const revokeAccess = async (
    payload: RevokeAccessPayload
  ): Promise<RevokeAccessResponse | undefined> => {
    try {
      const response = await trigger(payload);
      if (response?.success) {
        toast.success(t('revokeAccessSuccess'));
      } else {
        toast.error(response?.error || t('revokeAccessFailed'));
      }
      return response;
    } catch (error) {
      console.error('Revoke access error:', error);
      toast.error(t('revokeAccessFailed'));
      return undefined;
    }
  };

  const error = swrError ? errorMessage(swrError) : null;

  return {
    revokeAccess,
    isLoading: isMutating,
    error,
  };
}
