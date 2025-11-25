import { verifyAuth } from '@/lib/auth';
import { hasura } from '@/lib/hasura';
import { NextRequest, NextResponse } from 'next/server';

type UpdateDepartmentResponse = {
  update_Department: {
    affected_rows: number;
    returning: Array<{
      id: number;
      name: string;
      description: string;
      isPublic: boolean;
    }>;
  };
};

export async function PUT(
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
        { success: false, error: 'Invalid department id' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    const description =
      typeof body?.description === 'string' ? body.description.trim() : '';
    const isPublic = typeof body?.isPublic === 'boolean' ? body.isPublic : null;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      );
    }

    if (!description) {
      return NextResponse.json(
        { success: false, error: 'Description is required' },
        { status: 400 }
      );
    }

    if (isPublic === null) {
      return NextResponse.json(
        { success: false, error: 'isPublic is required' },
        { status: 400 }
      );
    }

    const mutation = `
      mutation UpdateDepartmentById(
        $id: Int!
        $name: String!
        $description: String!
        $isPublic: Boolean!
      ) {
        update_Department(
          where: {
            _and: [{ id: { _eq: $id } }, { deletedAt: { _is_null: true } }]
          }
          _set: { name: $name, description: $description, isPublic: $isPublic }
        ) {
          affected_rows
          returning {
            id
            name
            description
            isPublic
          }
        }
      }
    `;

    const result = await hasura<UpdateDepartmentResponse>(mutation, {
      id: numericId,
      name,
      description,
      isPublic,
    });

    if (result.update_Department.affected_rows === 0) {
      return NextResponse.json(
        { success: false, error: 'Department not found' },
        { status: 404 }
      );
    }

    const updatedDepartment = result.update_Department.returning[0];

    if (!updatedDepartment) {
      return NextResponse.json(
        { success: false, error: 'Department not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedDepartment,
    });
  } catch (error) {
    console.error('Failed to update department', {
      id: numericId ?? 'unknown',
      error,
    });
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update department',
      },
      { status: 500 }
    );
  }
}
