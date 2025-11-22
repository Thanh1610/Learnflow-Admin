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
    // Query users that are IN this department
    // Strategy: Get userIds from userDepartments, then query users
    const userDepartmentsQuery = `
      query GetUserIdsInDepartment($departmentId: Int32!) {
        userDepartments(where: { b: { _eq: $departmentId } }) {
          a
        }
      }
    `;

    const userDepartmentsResult = await hasura<{
      userDepartments: Array<{ a: number }>;
    }>(userDepartmentsQuery, {
      departmentId: numericId,
    });

    const userIds =
      userDepartmentsResult.userDepartments?.map(ud => ud.a) ?? [];

    if (userIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    // Query users by their IDs
    const usersQuery = `
      query GetUsersByIds($userIds: [Int32!]!) {
        user(where: { id: { _in: $userIds }, deletedAt: { _is_null: true } }) {
          id
          email
          name
          role
        }
      }
    `;

    const usersResult = await hasura<{ user: User[] }>(usersQuery, {
      userIds,
    });

    const users = usersResult.user ?? [];

    return NextResponse.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error('Failed to get users in department:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get users in department',
        details: error,
      },
      { status: 500 }
    );
  }
}
