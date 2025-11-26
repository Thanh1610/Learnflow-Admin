import { verifyAuth } from '@/lib/auth';
import { hasura } from '@/lib/hasura';
import { Department } from '@/types/department.type';
import { NextRequest, NextResponse } from 'next/server';

type InsertDepartmentResponse = {
  insert_Department: {
    returning: Array<
      Pick<Department, 'id' | 'name' | 'description' | 'image' | 'isPublic'>
    >;
  };
};

export async function POST(req: NextRequest) {
  try {
    const authResult = verifyAuth(req);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const { role: userRole } = authResult.payload;

    if (userRole !== 'SYSTEM_ADMIN') {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden',
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    const description =
      typeof body?.description === 'string' && body.description.trim().length
        ? body.description.trim()
        : null;
    const image =
      typeof body?.image === 'string' && body.image.trim().length
        ? body.image.trim()
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

    const duplicateCheckQuery = `
      query CheckDepartmentDuplicate($name: String!) {
        Department(where: { name: { _eq: $name } }, limit: 1) {
          id
          deletedAt
        }
      }
    `;

    const duplicateCheck = await hasura<{
      Department: Array<{ id: number; deletedAt: string | null }>;
    }>(duplicateCheckQuery, { name }, { role: userRole });

    const existingDepartment = duplicateCheck.Department.at(0);

    const now = new Date().toISOString();

    if (existingDepartment) {
      if (!existingDepartment.deletedAt) {
        return NextResponse.json(
          {
            success: false,
            error: 'Department name already exists',
          },
          { status: 409 }
        );
      }

      const clearDepartmentUsersMutation = `
        mutation ClearDepartmentUsers($departmentId: Int!) {
          delete__UserDepartments(where: { B: { _eq: $departmentId } }) {
            affected_rows
          }
        }
      `;

      await hasura(
        clearDepartmentUsersMutation,
        {
          departmentId: existingDepartment.id,
        },
        { role: userRole }
      );

      const restoreMutation = `
        mutation RestoreDepartment(
          $id: Int!
          $name: String!
          $description: String
          $image: String
          $isPublic: Boolean
          $timestamp: timestamp!
        ) {
          update_Department_by_pk(
            pk_columns: { id: $id }
            _set: {
              name: $name
              description: $description
              image: $image
              isPublic: $isPublic
              deletedAt: null
              createdAt: $timestamp
              updatedAt: $timestamp
            }
          ) {
            id
            name
            description
            image
            isPublic
            createdAt
            updatedAt
          }
        }
      `;

      const restored = await hasura<{
        update_Department_by_pk: Pick<
          Department,
          'id' | 'name' | 'description' | 'image' | 'isPublic'
        > | null;
      }>(
        restoreMutation,
        {
          id: existingDepartment.id,
          name,
          description,
          image,
          isPublic: body?.isPublic,
          timestamp: now,
        },
        { role: userRole }
      );

      if (!restored.update_Department_by_pk) {
        throw new Error('Failed to restore department');
      }

      return NextResponse.json(
        {
          success: true,
          data: restored.update_Department_by_pk,
        },
        { status: 200 }
      );
    }

    const mutation = `
      mutation CreateDepartment($objects: [Department_insert_input!]!) {
        insert_Department(objects: $objects) {
          returning {
            id
            name
            description
            image
            isPublic
          }
        }
      }
    `;

    const result = await hasura<InsertDepartmentResponse>(
      mutation,
      {
        objects: [
          {
            name,
            description,
            image,
            createdAt: now,
            updatedAt: now,
            isPublic: body?.isPublic,
          },
        ],
      },
      { role: userRole }
    );

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
