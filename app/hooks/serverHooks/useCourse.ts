import fetcher from '@/lib/fetcher';
import { getServerCookieHeader } from '@/lib/server-cookies';
import { Course } from '@/types/course.type';

const ADMIN_URL = process.env.ADMIN_URL;

export const getAllCourse = async () => {
  try {
    if (!ADMIN_URL) {
      throw new Error('ADMIN_URL is not configured');
    }

    const cookieHeader = await getServerCookieHeader();
    const response = await fetcher<{
      success: boolean;
      data: Course[];
    }>(`${ADMIN_URL}/api/course/get-all`, {
      headers: {
        cookie: cookieHeader,
      },
    });
    return response.data ?? [];
  } catch (error) {
    console.error({
      success: false,
      error: 'Failed to get all course',
      details: error,
    });
  }
  return [];
};

export const getCourseById = async (id: string) => {
  try {
    if (!ADMIN_URL) {
      throw new Error('ADMIN_URL is not configured');
    }

    const cookieHeader = await getServerCookieHeader();
    const response = await fetcher<{
      success: boolean;
      data: Course | null;
    }>(`${ADMIN_URL}/api/course/${id}/getById`, {
      headers: {
        cookie: cookieHeader,
      },
    });
    return response.data ?? null;
  } catch (error) {
    console.error({
      success: false,
      error: 'Failed to get course by id',
      details: error,
    });
  }
  return null;
};
