import { verifyAuth } from '@/lib/auth';
import { hasura } from '@/lib/hasura';
import { User } from '@/types/user.type';
import { NextRequest, NextResponse } from 'next/server';

/**
 * API endpoint để xóa nhiều users khỏi department
 * POST /api/department/[id]/remove-users
 * Body: { userIds: number[] }
 * Trả về: { success: true, data: { removed, failed, usersInDepartment, usersNotInDepartment } }
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

    // Kiểm tra department ID hợp lệ
    if (!Number.isInteger(departmentId) || departmentId <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid department id',
        },
        { status: 400 }
      );
    }

    // Lấy danh sách user IDs cần xóa từ request body
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

    const validUserIds = userIds
      .map((id: unknown) => Number(id))
      .filter((id: number) => Number.isInteger(id) && id > 0);

    if (validUserIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid user IDs',
        },
        { status: 400 }
      );
    }

    // Tối ưu hóa: Sử dụng deleteUserDepartmentsByAAndB để xóa từng record
    // Gọi song song tất cả mutations bằng Promise.all để tối ưu performance
    const deleteMutation = `
      mutation DeleteUserDepartment($userId: Int!, $departmentId: Int!) {
        delete__UserDepartments(
          where: { _and: [{ A: { _eq: $userId } }, { B: { _eq: $departmentId } }] }
        ) {
          affected_rows
        }
      }
    `;

    let totalRemoved = 0;
    try {
      const deleteResults = await Promise.all(
        validUserIds.map((userId: number) =>
          hasura<{
            delete__UserDepartments: {
              affected_rows: number;
            };
          }>(deleteMutation, {
            userId,
            departmentId,
          })
        )
      );

      totalRemoved = deleteResults.reduce(
        (sum, result) =>
          sum + (result.delete__UserDepartments?.affected_rows ?? 0),
        0
      );
    } catch (deleteError) {
      console.error('Delete users failed:', deleteError);
      throw new Error(
        `Failed to delete users: ${
          deleteError instanceof Error ? deleteError.message : 'Unknown error'
        }`
      );
    }

    if (totalRemoved === 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            'No users were removed. They may not exist in this department.',
        },
        { status: 400 }
      );
    }

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
    // - removed: số lượng users đã xóa thành công
    // - failed: số lượng users xóa thất bại (với batch deletion, nếu thành công thì failed = 0)
    // - usersInDepartment: danh sách users còn lại trong department
    // - usersNotInDepartment: danh sách users không thuộc department
    return NextResponse.json(
      {
        success: true,
        data: {
          removed: totalRemoved,
          failed: 0,
          usersInDepartment,
          usersNotInDepartment,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    // Xử lý lỗi và trả về response lỗi
    console.error('Remove users from department failed:', err);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to remove users from department',
        details: err instanceof Error ? err.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
