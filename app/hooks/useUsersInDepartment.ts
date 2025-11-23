import { fetcher } from '@/lib/fetcher';
import { User } from '@/types/user.type';
import useSWR from 'swr';

export type { User };

type UsersInDepartmentResponse = {
  success: boolean;
  data: User[];
  error?: string;
};

export function useUsersInDepartment(departmentId: number | null | undefined) {
  const { data, error, isLoading } = useSWR<UsersInDepartmentResponse>(
    departmentId ? `/api/department/${departmentId}/users` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  return {
    users: data?.data ?? [],
    isLoading,
    error,
  };
}
