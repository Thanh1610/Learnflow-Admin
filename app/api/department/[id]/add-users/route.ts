import { verifyAuth } from '@/lib/auth';
import { hasura } from '@/lib/hasura';
import { User } from '@/types/user.type';
import { NextRequest, NextResponse } from 'next/server';

type InsertUserDepartmentsResponse = {
  insertUserDepartments: {
    returning: Array<{ a: number; b: number }>;
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
      query CheckExistingUsers($departmentId: Int32!, $userIds: [Int32!]!) {
        userDepartments(
          where: {
            _and: [
              { b: { _eq: $departmentId } },
              { a: { _in: $userIds } }
            ]
          }
        ) {
          a
        }
      }
    `;

    const existingResult = await hasura<{
      userDepartments: Array<{ a: number }>;
    }>(checkExistingQuery, {
      departmentId,
      userIds: validUserIds,
    });

    const existingUserIds = new Set(
      existingResult.userDepartments?.map(ud => ud.a) ?? []
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
      mutation AddUsersToDepartment($objects: [InsertUserDepartmentsObjectInput!]!) {
        insertUserDepartments(objects: $objects) {
          returning {
            a
            b
          }
        }
      }
    `;

    const objects = newUserIds.map((userId: number) => ({
      a: userId,
      b: departmentId,
    }));

    const result = await hasura<InsertUserDepartmentsResponse>(mutation, {
      objects,
    });

    // Tối ưu hóa: Lấy tất cả data cần thiết trong 1 query duy nhất
    // Query này lấy cả users trong department (với nested user) và tất cả active users
    const finalDataQuery = `
      query GetFinalDepartmentData($departmentId: Int32!) {
        # Lấy thông tin chi tiết của Users còn lại trong Department (với nested user)
        departmentUsers: userDepartments(where: { b: { _eq: $departmentId } }) {
          user {
            id
            email
            name
            role
          }
        }
        
        # Lấy TẤT CẢ Users đang Active
        allActiveUsers: user(where: { deletedAt: { _is_null: true } }) {
          id
          email
          name
          role
        }
      }
    `;

    const finalDataResult = await hasura<{
      departmentUsers: Array<{ user: User | null }>;
      allActiveUsers: User[];
    }>(finalDataQuery, {
      departmentId,
    });

    // Extract users trong department từ nested structure
    const usersInDepartment =
      finalDataResult.departmentUsers
        ?.map(ud => ud.user)
        .filter((user): user is User => user !== null) ?? [];

    // Lọc users không thuộc department
    const userIdsInDepartment = new Set(usersInDepartment.map(u => u.id));
    const usersNotInDepartment =
      finalDataResult.allActiveUsers?.filter(
        user => !userIdsInDepartment.has(user.id)
      ) ?? [];

    // Trả về kết quả bao gồm:
    // - added: số lượng users đã thêm thành công
    // - skipped: số lượng users đã có trong department (bỏ qua)
    // - usersInDepartment: danh sách users hiện tại trong department
    // - usersNotInDepartment: danh sách users không thuộc department
    return NextResponse.json(
      {
        success: true,
        data: {
          added: result.insertUserDepartments.returning.length,
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
