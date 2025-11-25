import { verifyAuth } from '@/lib/auth';
import { hasura } from '@/lib/hasura';
import { NextRequest, NextResponse } from 'next/server';

type BulkDeleteRequest = {
  ids?: Array<number | string>;
};

type SoftDeleteDepartmentResponse = {
  update_Department: {
    affected_rows: number;
    returning: Array<{ id: number }>;
  };
};

const parseIds = (ids?: Array<number | string>): number[] => {
  if (!Array.isArray(ids)) return [];

  const uniqueIds = new Set<number>();

  for (const rawId of ids) {
    const numericId = Number(rawId);
    if (Number.isInteger(numericId) && numericId > 0) {
      uniqueIds.add(numericId);
    }
  }

  return Array.from(uniqueIds);
};

export async function POST(request: NextRequest) {
  try {
    const authResult = verifyAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body = (await request.json()) as BulkDeleteRequest;
    const ids = parseIds(body.ids);

    if (ids.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid department ids',
        },
        { status: 400 }
      );
    }

    const timestamp = new Date().toISOString();
    const mutation = `
      mutation SoftDeleteDepartment($id: Int!, $timestamp: timestamp!) {
        update_Department(
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

    const results = await Promise.all(
      ids.map(id =>
        hasura<SoftDeleteDepartmentResponse>(mutation, { id, timestamp })
      )
    );

    const affectedRows = results.reduce(
      (sum, res) => sum + res.update_Department.affected_rows,
      0
    );
    const deletedIds = results.flatMap(res =>
      res.update_Department.returning.map(item => item.id)
    );

    return NextResponse.json({
      success: true,
      data: {
        count: affectedRows,
        ids: deletedIds,
      },
    });
  } catch (error) {
    console.error('Bulk delete departments failed', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete departments',
      },
      { status: 500 }
    );
  }
}
