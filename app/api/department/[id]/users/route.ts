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
      query GetUserIdsInDepartment($departmentId: Int!) {
        _UserDepartments(where: { B: { _eq: $departmentId } }) {
          A
        }
      }
    `;

    const userDepartmentsResult = await hasura<{
      _UserDepartments: Array<{ A: number }>;
    }>(userDepartmentsQuery, {
      departmentId: numericId,
    });

    const userIds =
      userDepartmentsResult._UserDepartments?.map(ud => ud.A) ?? [];

    if (userIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    // Query users by their IDs
    const usersQuery = `
      query GetUsersByIds($userIds: [Int!]!) {
        User(where: { id: { _in: $userIds }, deletedAt: { _is_null: true } }) {
          id
          email
          name
          role
        }
      }
    `;

    const usersResult = await hasura<{ User: User[] }>(usersQuery, {
      userIds,
    });

    const users = usersResult.User ?? [];

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
