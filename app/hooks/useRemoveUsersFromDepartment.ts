import { fetcher } from '@/lib/fetcher';
import { User } from '@/types/user.type';
import useSWRMutation from 'swr/mutation';
import { errorMessage } from './errorMessage';

export type RemoveUsersFromDepartmentPayload = {
  departmentId: number;
  userIds: number[];
};

export type RemoveUsersFromDepartmentResponse = {
  success: boolean;
  data?: {
    removed: number;
    failed?: number;
    usersInDepartment?: User[];
    usersNotInDepartment?: User[];
  };
  error?: string;
};

export function useRemoveUsersFromDepartment() {
  const {
    trigger,
    isMutating,
    error: swrError,
  } = useSWRMutation<
    RemoveUsersFromDepartmentResponse,
    Error,
    string,
    RemoveUsersFromDepartmentPayload
  >('/api/department/remove-users', async (_key, { arg }) => {
    return fetcher<RemoveUsersFromDepartmentResponse>(
      `/api/department/${arg.departmentId}/remove-users`,
      {
        method: 'POST',
        body: {
          userIds: arg.userIds,
        },
      }
    );
  });

  /**
   * Hàm xóa users khỏi department
   * @param payload - Thông tin departmentId và danh sách userIds
   * @returns Response từ server hoặc undefined nếu có lỗi
   */
  const removeUsersFromDepartment = async (
    payload: RemoveUsersFromDepartmentPayload
  ): Promise<RemoveUsersFromDepartmentResponse | undefined> => {
    try {
      return await trigger(payload);
    } catch (error) {
      console.error('Remove users from department error:', error);
      return undefined;
    }
  };

  const error = swrError ? errorMessage(swrError) : null;

  return {
    removeUsersFromDepartment,
    isLoading: isMutating,
    error,
  };
}
