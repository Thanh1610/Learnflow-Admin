import { verifyAuth } from '@/lib/auth';
import { hasura } from '@/lib/hasura';
import { Course } from '@/types/course.type';
import { NextRequest, NextResponse } from 'next/server';

type UpdateCourseResponse = {
  update_course: {
    affected_rows: number;
    returning: Course[];
  };
};

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let numericId: number | null = null;

  try {
    const authResult = verifyAuth(req);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { id } = await params;
    numericId = Number(id);

    if (!Number.isInteger(numericId) || numericId <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid course id' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    const description =
      typeof body?.description === 'string' && body.description.trim().length
        ? body.description.trim()
        : null;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      );
    }

    const mutation = `
      mutation UpdateCourseById(
        $id: Int!
        $name: String!
        $description: String
      ) {
        update_course(
          where: {
            _and: [{ id: { _eq: $id } }, { deleted_at: { _is_null: true } }]
          }
          _set: {
            name: $name
            description: $description
          }
        ) {
          affected_rows
          returning {
            id
            name
            description
            created_at
            updated_at
          }
        }
      }
    `;

    const { payload } = authResult;

    const result = await hasura<UpdateCourseResponse>(
      mutation,
      {
        id: numericId,
        name,
        description,
      },
      {
        role: payload.role,
      }
    );

    if (result.update_course.affected_rows === 0) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }

    const updatedCourse = result.update_course.returning[0];

    if (!updatedCourse) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedCourse,
    });
  } catch (error) {
    console.error('Failed to update course', {
      id: numericId ?? 'unknown',
      error,
    });
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update course',
      },
      { status: 500 }
    );
  }
}
