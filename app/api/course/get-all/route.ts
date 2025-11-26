import { verifyAuth } from '@/lib/auth';
import { hasura } from '@/lib/hasura';
import { Course } from '@/types/course.type';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const authResult = verifyAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { payload } = authResult;
    const isDeptAdmin = payload.role === 'DEPT_ADMIN';

    const query = isDeptAdmin
      ? `
      query GetCoursesForDeptAdmin($userId: Int!) {
        course(
          where: {
            _and: [
              { deleted_at: { _is_null: true } }
              { created_by: { _eq: $userId } }
            ]
          }
        ) {
          id
          name
          description
          created_at
          updated_at
        }
      }
    `
      : `
      query GetAllCourses {
        course(where: { deleted_at: { _is_null: true } }) {
          id
          name
          description
          created_at
          updated_at
        }
      }
    `;

    const result = await hasura<{ course: Course[] }>(
      query,
      isDeptAdmin ? { userId: payload.sub } : undefined,
      {
        role: payload.role,
      }
    );

    return NextResponse.json({
      success: true,
      data: result.course ?? [],
    });
  } catch (error) {
    console.error({
      success: false,
      error: 'Failed to get all courses',
      details: error,
    });
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get all courses',
        details: error,
      },
      { status: 500 }
    );
  }
}
