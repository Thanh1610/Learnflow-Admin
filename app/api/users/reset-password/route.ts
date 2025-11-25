import { verifyAuth } from '@/lib/auth';
import { hasura } from '@/lib/hasura';
import { randomBytes } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

const OOB_CODE_EXPIRES_IN_HOURS = 1; // 1 hour

export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const authResult = verifyAuth(req);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const userIdNumber = Number(userId);
    if (!Number.isInteger(userIdNumber) || userIdNumber <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // Tìm user theo ID (chỉ user chưa bị xóa)
    const findUserQuery = `
      query FindUserById {
        User(where: { _and: [{ id: { _eq: ${userIdNumber} } }, { deletedAt: { _is_null: true } }] }) {
          id
          email
        }
      }
    `;

    const userResult = await hasura<{
      User: Array<{
        id: number;
        email: string;
      }>;
    }>(findUserQuery);

    if (!userResult.User || userResult.User.length === 0) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Tạo oobCode (out-of-band code)
    const oobCode = randomBytes(32).toString('hex');
    const oobCodeExpiresAt = new Date(
      Date.now() + OOB_CODE_EXPIRES_IN_HOURS * 60 * 60 * 1000
    ).toISOString();

    // Cập nhật oobCode vào database
    const updateUserMutation = `
      mutation UpdateUserOobCode(
        $id: Int!
        $oobCode: String!
        $expiresAt: timestamp!
      ) {
        update_User_by_pk(
          pk_columns: { id: $id }
          _set: { oobCode: $oobCode, oobCodeExpiresAt: $expiresAt }
        ) {
          id
        }
      }
    `;

    try {
      await hasura(updateUserMutation, {
        id: userIdNumber,
        oobCode,
        expiresAt: oobCodeExpiresAt,
      });
    } catch (updateError) {
      console.error('Failed to update oobCode:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to generate reset code' },
        { status: 500 }
      );
    }

    // Tạo reset link (sử dụng CLIENT_URL từ env)
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:4001';
    const resetLink = `${clientUrl}/auth/reset-password?oobCode=${oobCode}`;

    return NextResponse.json({
      success: true,
      resetLink,
      message: 'Reset password link generated successfully',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to generate reset password link',
      },
      { status: 500 }
    );
  }
}
