import { hasura } from '@/lib/hasura';
import { Course } from '@/types/course.type';
import { NextResponse } from 'next/server';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numericId = Number(id);

  if (!Number.isInteger(numericId) || numericId <= 0) {
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid course id',
      },
      { status: 400 }
    );
  }

  const query = `
    query GetCourseById($id: Int!) {
      course(where: { id: { _eq: $id }, deleted_at: { _is_null: true } }) {
        id
        name
        description
        created_at
        updated_at
      }
    }
  `;

  const data = await hasura<{ course: Course[] }>(query, {
    id: numericId,
  });

  return NextResponse.json({
    success: true,
    data: data.course?.[0] ?? null,
  });
}
