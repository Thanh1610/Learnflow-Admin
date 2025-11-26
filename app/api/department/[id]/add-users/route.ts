import { verifyAuth } from '@/lib/auth';
import { hasura } from '@/lib/hasura';
import { User } from '@/types/user.type';
import { NextRequest, NextResponse } from 'next/server';

type InsertUserDepartmentsResponse = {
  insert__UserDepartments: {
    returning: Array<{ A: number; B: number }>;
  };
};

/**
 * API endpoint để thêm nhiều users vào department
 * POST /api/department/[id]/add-users
 * Body: { userIds: number[] }
 * Trả về: { success: true, data: { added, skipped, usersInDepartment, usersNotInDepartment } }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Xác thực người dùng
    const authResult = verifyAuth(req);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { id } = await params;
    const departmentId = Number(id);

    if (!Number.isInteger(departmentId) || departmentId <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid department id',
        },
        { status: 400 }
      );
    }

    // Lấy danh sách user IDs cần thêm từ request body
    const body = await req.json();
    const userIds = Array.isArray(body?.userIds) ? body.userIds : [];

    // Kiểm tra có user IDs không
    if (userIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'User IDs are required',
        },
        { status: 400 }
      );
    }

    // Validate và chuyển đổi tất cả user IDs thành số nguyên hợp lệ
    const validUserIds = userIds
      .map((id: unknown) => Number(id))
      .filter((id: number) => Number.isInteger(id) && id > 0);

    // Kiểm tra có user IDs hợp lệ không
    if (validUserIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid user IDs',
        },
        { status: 400 }
      );
    }

    // Kiểm tra users đã có trong department chưa
    const checkExistingQuery = `
      query CheckExistingUsers($departmentId: Int!, $userIds: [Int!]!) {
        _UserDepartments(
          where: {
            _and: [
              { B: { _eq: $departmentId } },
              { A: { _in: $userIds } }
            ]
          }
        ) {
          A
        }
      }
    `;

    const existingResult = await hasura<{
      _UserDepartments: Array<{ A: number }>;
    }>(checkExistingQuery, {
      departmentId,
      userIds: validUserIds,
    });

    const existingUserIds = new Set(
      existingResult._UserDepartments?.map(ud => ud.A) ?? []
    );

    // Lọc ra những users chưa có trong department
    const newUserIds = validUserIds.filter(
      (id: number) => !existingUserIds.has(id)
    );

    // Nếu tất cả users đã có trong department, trả về lỗi
    if (newUserIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'All users are already in this department',
        },
        { status: 400 }
      );
    }

    // Thêm users vào department
    const mutation = `
      mutation AddUsersToDepartment($objects: [_UserDepartments_insert_input!]!) {
        insert__UserDepartments(objects: $objects) {
          returning {
            A
            B
          }
        }
      }
    `;

    const objects = newUserIds.map((userId: number) => ({
      A: userId,
      B: departmentId,
    }));

    const result = await hasura<InsertUserDepartmentsResponse>(mutation, {
      objects,
    });

    const departmentUsersQuery = `
      query GetDepartmentUserIds($departmentId: Int!) {
        _UserDepartments(where: { B: { _eq: $departmentId } }) {
          A
          }
        }
    `;

    const allActiveUsersQuery = `
      query GetAllActiveUsers {
        User(where: { deletedAt: { _is_null: true } }) {
          id
          email
          name
          role
        }
      }
    `;

    const [departmentUsersResult, allActiveUsersResult] = await Promise.all([
      hasura<{ _UserDepartments: Array<{ A: number }> }>(departmentUsersQuery, {
        departmentId,
      }),
      hasura<{ User: User[] }>(allActiveUsersQuery),
    ]);

    const userIdsInDepartment = new Set(
      departmentUsersResult._UserDepartments?.map(ud => ud.A) ?? []
    );

    const allActiveUsers = allActiveUsersResult.User ?? [];

    const usersInDepartment = allActiveUsers.filter(user =>
      userIdsInDepartment.has(user.id)
    );

    const usersNotInDepartment = allActiveUsers.filter(
      user => !userIdsInDepartment.has(user.id)
    );

    // Trả về kết quả bao gồm:
    // - added: số lượng users đã thêm thành công
    // - skipped: số lượng users đã có trong department (bỏ qua)
    // - usersInDepartment: danh sách users hiện tại trong department
    // - usersNotInDepartment: danh sách users không thuộc department
    return NextResponse.json(
      {
        success: true,
        data: {
          added: result.insert__UserDepartments.returning.length,
          skipped: existingUserIds.size,
          usersInDepartment,
          usersNotInDepartment,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    // Xử lý lỗi và trả về response lỗi
    console.error('Add users to department failed:', err);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to add users to department',
        details: err instanceof Error ? err.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
