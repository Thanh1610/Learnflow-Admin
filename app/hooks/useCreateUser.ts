import { fetcher } from '@/lib/fetcher';
import { User } from '@/types/user.type';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import useSWRMutation from 'swr/mutation';
import { errorMessage } from './errorMessage';

export type CreateUserPayload = {
  name?: string | null;
  email: string;
  phone?: string | null;
  address?: string | null;
  dateOfBirth?: string | null;
  gender?: '1' | '2' | null;
  avatar?: string | null;
};

export type CreateUserResponse = {
  success: boolean;
  data?: User;
  error?: string;
};

export function useCreateUser() {
  const t = useTranslations('UserPage');
  const {
    trigger,
    isMutating,
    error: swrError,
  } = useSWRMutation<CreateUserResponse, Error, string, CreateUserPayload>(
    '/api/users/create',
    async (_key, { arg }) => {
      return fetcher<CreateUserResponse>('/api/users/create', {
        method: 'POST',
        body: arg,
      });
    }
  );

  const createUser = async (
    payload: CreateUserPayload
  ): Promise<CreateUserResponse | undefined> => {
    try {
      const response = await trigger(payload);
      if (response?.success) {
        toast.success(t('createUserSuccess'));
      } else {
        toast.error(t('createUserFailed'));
      }
      return response;
    } catch (error) {
      console.error('Create user error:', error);
      toast.error(t('createUserFailed'));
      return undefined;
    }
  };

  const error = swrError ? errorMessage(swrError) : null;

  return {
    createUser,
    isLoading: isMutating,
    error,
  };
}
