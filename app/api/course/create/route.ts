import { hasura } from '@/lib/hasura';
import { NextRequest, NextResponse } from 'next/server';

type InsertCourseResponse = {
  insert_Course_one: {
    id: number;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
    created_by: number;
  };
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    const description =
      typeof body?.description === 'string' ? body.description.trim() : '';
    const createdBy =
      typeof body?.userId === 'number'
        ? body.userId
        : Number.parseInt(body?.userId, 10);
    const departmentIds = Array.isArray(body?.departmentIds)
      ? body.departmentIds
          .map((id: unknown) =>
            typeof id === 'number' ? id : Number.parseInt(String(id), 10)
          )
          .filter((id: number) => Number.isFinite(id))
      : [];

    if (!name || !Number.isFinite(createdBy)) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const mutation = `
      mutation CreateCourse($object: course_insert_input!) {
        insert_course_one(object: $object) {
          id
          name
          description
          created_at
          updated_at
          created_by
        }
      }
    `;

    const courseObject: Record<string, unknown> = {
      name,
      description,
      created_by: createdBy,
    };

    if (departmentIds.length) {
      courseObject.CourseDepartments = {
        data: departmentIds.map((departmentId: number) => ({
          department_id: departmentId,
        })),
      };
    }

    const result = await hasura<InsertCourseResponse>(mutation, {
      object: courseObject,
    });

    return NextResponse.json(
      { success: true, data: result.insert_Course_one },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create course failed:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create course' },
      { status: 500 }
    );
  }
}
