import { fetcher } from '@/lib/fetcher';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import useSWRMutation from 'swr/mutation';
import { errorMessage } from './errorMessage';

export type ResetPasswordForUserPayload = {
  userId: number;
};

export type ResetPasswordForUserResponse = {
  success: boolean;
  resetLink?: string;
  message?: string;
  error?: string;
};

export function useResetPasswordForUser() {
  const t = useTranslations('UserPage');
  const {
    trigger,
    isMutating,
    error: swrError,
  } = useSWRMutation<
    ResetPasswordForUserResponse,
    Error,
    string,
    ResetPasswordForUserPayload
  >('/api/users/reset-password', async (_key, { arg }) => {
    return fetcher<ResetPasswordForUserResponse, ResetPasswordForUserPayload>(
      '/api/users/reset-password',
      {
        method: 'POST',
        body: arg,
      }
    );
  });

  /**
   * Hàm tạo reset password link cho user
   * @param payload - userId
   * @returns Response từ server hoặc undefined nếu có lỗi
   */
  const resetPasswordForUser = async (
    payload: ResetPasswordForUserPayload
  ): Promise<ResetPasswordForUserResponse | undefined> => {
    try {
      const response = await trigger(payload);
      if (response?.success) {
        toast.success(t('resetPasswordSuccess'));
      } else {
        toast.error(response?.error || t('resetPasswordFailed'));
      }
      return response;
    } catch (error) {
      console.error('Reset password for user error:', error);
      toast.error(t('resetPasswordFailed'));
      return undefined;
    }
  };

  const error = swrError ? errorMessage(swrError) : null;

  return {
    resetPasswordForUser,
    isLoading: isMutating,
    error,
  };
}
