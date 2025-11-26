import { fetcher } from '@/lib/fetcher';
import { Course } from '@/types/course.type';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export type CourseFormPayload = {
  name: string;
  description?: string | null;
  userId?: number;
};

export type CourseMutationResponse = {
  success: boolean;
  data?: Course;
  error?: string;
};

type Mode = 'create' | 'edit';

export const useCreateNewEditCourse = (mode: Mode, id?: number) => {
  const t = useTranslations('CoursePage');
  const router = useRouter();

  const mutate = async (payload: CourseFormPayload) => {
    try {
      if (mode === 'create') {
        await fetcher<CourseMutationResponse, CourseFormPayload>(
          '/api/course/create',
          {
            method: 'POST',
            body: payload,
          }
        );
        toast.success(t('courseForm.createSuccess'));
      } else if (mode === 'edit' && id) {
        await fetcher<CourseMutationResponse, CourseFormPayload>(
          `/api/course/${id}/updateCourseById`,
          {
            method: 'PUT',
            body: payload,
          }
        );
        toast.success(t('courseForm.editSuccess'));
      }
      // Điều hướng sau khi thành công; list sẽ tự refetch qua server component
      router.push('/course/list');
    } catch (error) {
      console.error('Create/Edit course failed', error);
      toast.error(t('courseForm.submitFailed'));
      throw error;
    }
  };

  return {
    mutate,
  };
};
