// API chỉ chạy trên server side
import fetcher from '@/lib/fetcher';
import { getServerCookieHeader } from '@/lib/server-cookies';
import { User } from '@/types/user.type';

const ADMIN_URL = process.env.ADMIN_URL;

export const getAllUsers = async () => {
  try {
    if (!ADMIN_URL) {
      throw new Error('ADMIN_URL is not configured');
    }
    const cookieHeader = await getServerCookieHeader();
    const response = await fetcher<{
      success: boolean;
      data: User[];
    }>(`${ADMIN_URL}/api/users/get-all`, {
      headers: {
        cookie: cookieHeader,
      },
    });
    return response.data ?? [];
  } catch (error) {
    console.error({
      success: false,
      error: 'Failed to get all users',
      details: error,
    });
  }
  return [];
};

export const getUserById = async (id: string) => {
  try {
    if (!id) {
      return null;
    }
    const cookieHeader = await getServerCookieHeader();
    const response = await fetcher<{
      success: boolean;
      data: User;
    }>(`${ADMIN_URL}/api/users/get-user?id=${id}`, {
      headers: {
        cookie: cookieHeader,
      },
    });
    return response.data ?? null;
  } catch (error) {
    console.error({
      success: false,
      error: 'Failed to get user by id',
      details: error,
    });
  }
  return null;
};
