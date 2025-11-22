import { fetcher } from '@/lib/fetcher';
import { User } from '@/types/user.type';
import useSWRMutation from 'swr/mutation';
import { errorMessage } from './errorMessage';

export type AddUsersToDepartmentPayload = {
  departmentId: number;
  userIds: number[];
};

export type AddUsersToDepartmentResponse = {
  success: boolean;
  data?: {
    added: number;
    skipped: number;
    usersInDepartment?: User[];
    usersNotInDepartment?: User[];
  };
  error?: string;
};

export function useAddUsersToDepartment() {
  const {
    trigger,
    isMutating,
    error: swrError,
  } = useSWRMutation<
    AddUsersToDepartmentResponse,
    Error,
    string,
    AddUsersToDepartmentPayload
  >('/api/department/add-users', async (_key, { arg }) => {
    return fetcher<AddUsersToDepartmentResponse>(
      `/api/department/${arg.departmentId}/add-users`,
      {
        method: 'POST',
        body: {
          userIds: arg.userIds,
        },
      }
    );
  });

  /**
   * Hàm thêm users vào department
   * @param payload - Thông tin departmentId và danh sách userIds
   * @returns Response từ server hoặc undefined nếu có lỗi
   */
  const addUsersToDepartment = async (
    payload: AddUsersToDepartmentPayload
  ): Promise<AddUsersToDepartmentResponse | undefined> => {
    try {
      return await trigger(payload);
    } catch (error) {
      console.error('Add users to department error:', error);
      return undefined;
    }
  };

  const error = swrError ? errorMessage(swrError) : null;

  return {
    addUsersToDepartment,
    isLoading: isMutating,
    error,
  };
}
