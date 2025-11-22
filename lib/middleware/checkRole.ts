import { verifyAuth } from '@/lib/auth';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function checkRole(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl;
  const isApiRoute = pathname.startsWith('/api');
  const isExcludedApiRoute = pathname.startsWith('/api/auth');

  if (!isApiRoute || isExcludedApiRoute) {
    return null;
  }

  const authResult = verifyAuth(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  if (authResult.payload.role === 'USER') {
    return NextResponse.json(
      { success: false, error: 'Insufficient permissions' },
      { status: 403 }
    );
  }

  return null;
}
