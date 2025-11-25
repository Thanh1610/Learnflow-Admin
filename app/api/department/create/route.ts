import { verifyAuth } from '@/lib/auth';
import { hasura } from '@/lib/hasura';
import { Department } from '@/types/department.type';
import { NextRequest, NextResponse } from 'next/server';

type InsertDepartmentResponse = {
  insert_Department: {
    returning: Array<
      Pick<Department, 'id' | 'name' | 'description' | 'isPublic'>
    >;
  };
};

export async function POST(req: NextRequest) {
  try {
    const authResult = verifyAuth(req);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body = await req.json();
    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    const description =
      typeof body?.description === 'string' && body.description.trim().length
        ? body.description.trim()
        : null;

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          error: 'Name is required',
        },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const mutation = `
      mutation CreateDepartment($objects: [Department_insert_input!]!) {
        insert_Department(objects: $objects) {
          returning {
            id
            name
            description
            isPublic
          }
        }
      }
    `;

    const result = await hasura<InsertDepartmentResponse>(mutation, {
      objects: [
        {
          name,
          description,
          createdAt: now,
          updatedAt: now,
          isPublic: body?.isPublic,
        },
      ],
    });

    const createdDepartment = result.insert_Department.returning[0];

    if (!createdDepartment) {
      throw new Error('Department was not created');
    }

    return NextResponse.json(
      {
        success: true,
        data: createdDepartment,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('Create department failed:', err);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create department',
      },
      { status: 500 }
    );
  }
}
