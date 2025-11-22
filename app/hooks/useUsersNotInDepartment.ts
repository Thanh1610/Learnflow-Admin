import { fetcher } from '@/lib/fetcher';
import { User } from '@/types/user.type';
import useSWR from 'swr';

type UsersNotInDepartmentResponse = {
  success: boolean;
  data: User[];
  error?: string;
};

export function useUsersNotInDepartment(
  departmentId: number | null | undefined
) {
  const { data, error, isLoading } = useSWR<UsersNotInDepartmentResponse>(
    departmentId
      ? `/api/department/${departmentId}/users-not-in-department`
      : null,
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
