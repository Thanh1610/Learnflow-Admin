import { NextRequest, NextResponse } from 'next/server';
import { JWTPayload, verifyToken } from './jwt';

export const ACCESS_TOKEN_COOKIE = 'auth_token';

/**
 * Lấy JWT token từ cookie
 * @param cookieValue Giá trị cookie hoặc cookie object
 * @returns Token string hoặc null
 */
export function getTokenFromCookie(
  cookieValue: string | undefined | null
): string | null {
  return cookieValue || null;
}

/**
 * Lấy JWT token từ request (từ cookie hoặc Authorization header)
 */
export function getTokenFromRequest(request: NextRequest): string | null {
  // Ưu tiên lấy từ cookie
  const cookieToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  return getTokenFromCookie(cookieToken);
}

/**
 * Verify token và trả về payload hoặc error response
 * @param request NextRequest object
 * @returns Object chứa payload nếu valid, hoặc NextResponse error nếu invalid
 */
export function verifyAuth(
  request: NextRequest
): { payload: JWTPayload } | NextResponse {
  const token = getTokenFromRequest(request);

  if (!token) {
    return NextResponse.json(
      { success: false, error: 'Authentication required' },
      { status: 401 }
    );
  }

  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json(
      { success: false, error: 'Invalid or expired token' },
      { status: 401 }
    );
  }

  return { payload };
}
