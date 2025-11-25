import { verifyAuth } from '@/lib/auth';
import { hasura } from '@/lib/hasura';
import { NextRequest, NextResponse } from 'next/server';

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

    // Set clientRefreshToken và clientRefreshTokenExpiresAt về null
    const updateUserMutation = `
      mutation RevokeUserAccess($id: Int!) {
        update_User_by_pk(
          pk_columns: { id: $id }
          _set: { clientRefreshToken: null, clientRefreshTokenExpiresAt: null }
        ) {
            id
        }
      }
    `;

    try {
      await hasura(updateUserMutation, { id: userIdNumber });
    } catch (updateError) {
      console.error('Failed to revoke access:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to revoke access' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Access revoked successfully',
    });
  } catch (error) {
    console.error('Revoke access error:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to revoke access',
      },
      { status: 500 }
    );
  }
}
