import { hasura } from '@/lib/hasura';
import { Department } from '@/types/department.type';
import { NextResponse } from 'next/server';
export async function GET() {
  try {
    const departments = await hasura<{
      Department: Array<Department>;
    }>(`
      query GetAllDepartments {
        Department(where: { deletedAt: { _is_null: true } }) {
          id
          name
          description
          isPublic
          createdAt
          updatedAt
        }
      }
    `);
    return NextResponse.json({
      success: true,
      data: departments.Department ?? [],
    });
  } catch (error) {
    console.error({
      success: false,
      error: 'Failed to get all departments',
      details: error,
    });
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get all departments',
        details: error,
      },
      { status: 500 }
    );
  }
}
