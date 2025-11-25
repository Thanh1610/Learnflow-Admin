import { hasura } from '@/lib/hasura';
import { User } from '@/types/user.type';
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

  try {
    // Query users that are NOT in this department
    // Strategy: Get all active users, then get users in department, filter in code
    const allUsersQuery = `
      query GetAllActiveUsers {
        User(where: { deletedAt: { _is_null: true } }) {
          id
          email
          name
          role
        }
      }
    `;

    const usersInDepartmentQuery = `
      query GetUsersInDepartment($departmentId: Int!) {
        _UserDepartments(where: { B: { _eq: $departmentId } }) {
          A
        }
      }
    `;

    const [allUsersResult, usersInDeptResult] = await Promise.all([
      hasura<{ User: User[] }>(allUsersQuery),
      hasura<{ _UserDepartments: Array<{ A: number }> }>(
        usersInDepartmentQuery,
        { departmentId: numericId }
      ),
    ]);

    const userIdsInDepartment = new Set(
      usersInDeptResult._UserDepartments?.map(ud => ud.A) ?? []
    );

    const usersNotInDepartment =
      allUsersResult.User?.filter(user => !userIdsInDepartment.has(user.id)) ??
      [];

    return NextResponse.json({
      success: true,
      data: usersNotInDepartment,
    });
  } catch (error) {
    console.error('Failed to get users not in department:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get users not in department',
        details: error,
      },
      { status: 500 }
    );
  }
}
