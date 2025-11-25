import { hasura } from '@/lib/hasura';
import { Department } from '@/types/department.type';
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
        error: 'Invalid department id',
      },
      { status: 400 }
    );
  }

  const query = `
    query GetDepartmentById($id: Int!) {
      Department(
        where: {
          _and: [
            { id: { _eq: $id } }
            { deletedAt: { _is_null: true } }
          ]
        }
      ) {
    id
    name
    description
    isPublic
    }
    }
  `;
  const data = await hasura<{ Department: Department[] }>(query, {
    id: numericId,
  });
  return NextResponse.json({
    success: true,
    data: data.Department?.[0] ?? null,
  });
}
