import { verifyAuth } from '@/lib/auth';
import { hasura } from '@/lib/hasura';
import { NextRequest, NextResponse } from 'next/server';

type SoftDeleteDepartmentResponse = {
  updateDepartmentById: {
    affectedRows: number;
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
      mutation SoftDeleteDepartment($id: Int32!, $timestamp: Timestamp!) {
        updateDepartmentById(
          keyId: $id
          preCheck: { deletedAt: { _is_null: true } }
          updateColumns: {
            deletedAt: { set: $timestamp }
            updatedAt: { set: $timestamp }
          }
        ) {
          affectedRows
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

    if (result.updateDepartmentById.affectedRows === 0) {
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
        id: result.updateDepartmentById.returning[0]?.id ?? numericId,
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
