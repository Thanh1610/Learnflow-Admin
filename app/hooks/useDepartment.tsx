import { fetcher } from '@/lib/fetcher';
import { DepartmentFormValues } from '@/schema/department.schema';
import useSWRMutation from 'swr/mutation';
import { mutate } from 'swr';

const DEPARTMENT_LIST_KEY = '/api/department/list';

export type DepartmentResponse = {
  success: boolean;
  data: {
    id: string;
    name: string;
    description: string;
  };
};

export type BulkDeleteResponse = {
  success: boolean;
  data: {
    count: number;
    ids: number[];
  };
};

export type BulkDeletePayload = {
  ids: number[];
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
      const response = await fetcher<DepartmentResponse, DepartmentFormValues>(
        '/api/department/create',
        {
          method: 'POST',
          body: arg,
        }
      );
      mutate(DEPARTMENT_LIST_KEY);
      return response;
    }
  );

  const {
    trigger: deleteDepartment,
    isMutating: isDeleting,
    error: deleteError,
  } = useSWRMutation<DepartmentResponse, Error, string, { id: number }>(
    '/api/department/[id]/delete',
    async (_key, { arg }) => {
      const response = await fetcher<DepartmentResponse, { id: number }>(
        `/api/department/${arg.id}/delete`,
        { method: 'DELETE' }
      );
      mutate(DEPARTMENT_LIST_KEY);
      return response;
    }
  );

  const {
    trigger: bulkDeleteDepartments,
    isMutating: isBulkDeleting,
    error: bulkDeleteError,
  } = useSWRMutation<BulkDeleteResponse, Error, string, BulkDeletePayload>(
    '/api/department/bulk-delete',
    async (_key, { arg }) => {
      const response = await fetcher<BulkDeleteResponse, BulkDeletePayload>(
        '/api/department/bulk-delete',
        {
          method: 'POST',
          body: arg,
        }
      );
      mutate(DEPARTMENT_LIST_KEY);
      return response;
    }
  );
  return {
    //create
    createDepartment: trigger,
    isCreating: isMutating,
    error: swrError,
    //delete
    deleteDepartment,
    isDeleting,
    deleteError,
    // bulk delete
    bulkDeleteDepartments,
    isBulkDeleting,
    bulkDeleteError,
  };
};
