import { fetcher } from '@/lib/fetcher';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import useSWRMutation from 'swr/mutation';
import { errorMessage } from './errorMessage';

export type BulkDeleteCoursesPayload = {
  ids: number[];
};

export type BulkDeleteCoursesResponse = {
  success: boolean;
  data?: {
    count: number;
    ids: number[];
  };
  error?: string;
};

export function useBulkDeleteCourses() {
  const t = useTranslations('CoursePage.courseList');

  const {
    trigger,
    isMutating,
    error: swrError,
  } = useSWRMutation<
    BulkDeleteCoursesResponse,
    Error,
    string,
    BulkDeleteCoursesPayload
  >('/api/course/bulk-delete', async (_key, { arg }) => {
    return fetcher<BulkDeleteCoursesResponse, BulkDeleteCoursesPayload>(
      '/api/course/bulk-delete',
      {
        method: 'POST',
        body: arg,
      }
    );
  });

  const bulkDeleteCourses = async (
    payload: BulkDeleteCoursesPayload
  ): Promise<BulkDeleteCoursesResponse | undefined> => {
    try {
      const response = await trigger(payload);
      if (response?.success) {
        const count = response.data?.count ?? payload.ids.length;
        toast.success(
          count > 1 ? t('bulkDeleteSuccess', { count }) : t('deleteSuccess')
        );
      } else {
        toast.error(t('bulkDeleteFailed'));
      }
      return response;
    } catch (err) {
      console.error('Bulk delete courses error:', err);
      toast.error(t('bulkDeleteFailed'));
      return undefined;
    }
  };

  const error = swrError ? errorMessage(swrError) : null;

  return {
    bulkDeleteCourses,
    isLoading: isMutating,
    error,
  };
}
