import { fetcher } from '@/lib/fetcher';
import { DepartmentFormValues } from '@/schema/department.schema';
import useSWRMutation from 'swr/mutation';

export type DepartmentResponse = {
  success: boolean;
  data: {
    id: string;
    name: string;
    description: string;
  };
};
export type CreateDepartmentPayload = {
  name: string;
  description: string;
};
export const useCreateDepartment = () => {
  const {
    trigger,
    isMutating,
    error: swrError,
  } = useSWRMutation<DepartmentResponse, Error, string, DepartmentFormValues>(
    '/api/department/create',
    async (_key, { arg }) => {
      return fetcher<DepartmentResponse, DepartmentFormValues>(
        '/api/department/create',
        {
          method: 'POST',
          body: arg,
        }
      );
    }
  );
  return {
    createDepartment: trigger,
    isCreating: isMutating,
    error: swrError,
  };
};
