import { cookies } from 'next/headers';

/**
 * Retrieves the serialized cookie header on the server.
 * This avoids duplicating cookieStore logic within server-only hooks.
 */
export const getServerCookieHeader = async () => {
  const cookieStore = await cookies();
  return cookieStore
    .getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join('; ');
};
