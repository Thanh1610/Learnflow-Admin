// API chỉ chạy trên server side
import fetcher from '@/lib/fetcher';
import { getServerCookieHeader } from '@/lib/server-cookies';
import { Department } from '@/types/department.type';

const ADMIN_URL = process.env.ADMIN_URL;

export const getAllDepartments = async () => {
  try {
    if (!ADMIN_URL) {
      throw new Error('ADMIN_URL is not configured');
    }

    const cookieHeader = await getServerCookieHeader();
    const response = await fetcher<{
      success: boolean;
      data: Department[];
    }>(`${ADMIN_URL}/api/department/get-all`, {
      headers: {
        cookie: cookieHeader,
      },
    });
    return response.data ?? [];
  } catch (error) {
    console.error({
      success: false,
      error: 'Failed to get all departments',
      details: error,
    });
  }
  return [];
};

export const getDepartmentById = async (id: string) => {
  try {
    if (!ADMIN_URL) {
      throw new Error('ADMIN_URL is not configured');
    }
    const cookieHeader = await getServerCookieHeader();
    const response = await fetcher<{
      success: boolean;
      data: Department;
    }>(`${ADMIN_URL}/api/department/${id}/getDepartmentById`, {
      headers: {
        cookie: cookieHeader,
      },
    });
    return response.data ?? null;
  } catch (error) {
    console.error({
      success: false,
      error: 'Failed to get department by id',
      details: error,
    });
  }
  return null;
};
