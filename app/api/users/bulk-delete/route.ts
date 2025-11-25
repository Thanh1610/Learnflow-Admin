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

    const { userIds } = await req.json();

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'User IDs array is required' },
        { status: 400 }
      );
    }

    // Validate all user IDs are valid numbers
    const userIdNumbers = userIds.map(id => Number(id));
    const invalidIds = userIdNumbers.filter(
      id => !Number.isInteger(id) || id <= 0
    );

    if (invalidIds.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid user IDs' },
        { status: 400 }
      );
    }

    // Set deletedAt cho tất cả users (soft delete)
    const timestamp = new Date().toISOString();
    const mutation = `
      mutation SoftDeleteUser($id: Int!, $timestamp: timestamp!) {
        update_User(
          where: { _and: [{ id: { _eq: $id } }, { deletedAt: { _is_null: true } }] }
          _set: { deletedAt: $timestamp, updatedAt: $timestamp }
        ) {
          affected_rows
          returning {
            id
          }
        }
      }
    `;

    try {
      const results = await Promise.all(
        userIdNumbers.map(id =>
          hasura<{
            update_User: {
              affected_rows: number;
              returning: Array<{ id: number }>;
            };
          }>(mutation, { id, timestamp })
        )
      );

      const affectedRows = results.reduce(
        (sum, res) => sum + res.update_User.affected_rows,
        0
      );
      const deletedIds = results.flatMap(res =>
        res.update_User.returning.map(item => item.id)
      );

      return NextResponse.json({
        success: true,
        message: `Successfully deleted ${affectedRows} user(s)`,
        deletedCount: affectedRows,
        deletedIds,
      });
    } catch (updateError) {
      console.error('Failed to delete users:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to delete users' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Bulk delete users error:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to delete users',
      },
      { status: 500 }
    );
  }
}
