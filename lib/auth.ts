import { NextRequest, NextResponse } from 'next/server';
import { JWTPayload, verifyToken } from './jwt';

/**
 * Lấy JWT token từ request (từ cookie hoặc Authorization header)
 */
export function getTokenFromRequest(request: NextRequest): string | null {
  // Ưu tiên lấy từ cookie
  const cookieToken = request.cookies.get('auth_token')?.value;
  if (cookieToken) {
    return cookieToken;
  }

  return null;
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
