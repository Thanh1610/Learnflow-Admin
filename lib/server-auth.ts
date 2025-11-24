'use server';

import { cookies } from 'next/headers';
import { ACCESS_TOKEN_COOKIE, getTokenFromCookie } from './auth';
import { JWTPayload, verifyToken } from './jwt';

/**
 * Lấy user role từ cookies trong server component
 * @returns User role hoặc null nếu không có token hoặc token invalid
 */
export async function getServerUserRole(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = getTokenFromCookie(cookieStore.get(ACCESS_TOKEN_COOKIE)?.value);

  if (!token) {
    return null;
  }

  const payload = verifyToken(token);
  if (!payload) {
    return null;
  }

  return payload.role;
}

/**
 * Lấy full user payload từ cookies trong server component
 * @returns JWTPayload hoặc null nếu không có token hoặc token invalid
 */
export async function getServerUser(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = getTokenFromCookie(cookieStore.get(ACCESS_TOKEN_COOKIE)?.value);

  if (!token) {
    return null;
  }

  const payload = verifyToken(token);
  return payload;
}
