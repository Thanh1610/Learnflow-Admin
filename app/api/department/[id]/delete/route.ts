import { verifyAuth } from '@/lib/auth';
import { hasura } from '@/lib/hasura';
import { NextRequest, NextResponse } from 'next/server';

type SoftDeleteDepartmentResponse = {
  update_Department: {
    affected_rows: number;
    returning: Array<{ id: number }>;
  };
};

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let numericId: number | null = null;
  try {
    const authResult = verifyAuth(req);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { id } = await params;
    numericId = Number(id);

    if (!Number.isInteger(numericId) || numericId <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid department id',
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

    const result = await hasura<SoftDeleteDepartmentResponse>(mutation, {
      id: numericId,
      timestamp,
    });

    if (result.update_Department.affected_rows === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Department not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: result.update_Department.returning[0]?.id ?? numericId,
      },
    });
  } catch (error) {
    console.error(
      `Failed to delete department ${numericId ?? 'unknown'}`,
      error
    );
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete department',
      },
      { status: 500 }
    );
  }
}
