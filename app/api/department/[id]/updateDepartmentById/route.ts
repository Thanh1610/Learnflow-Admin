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
      image: string | null;
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
      typeof body?.description === 'string' && body.description.trim().length
        ? body.description.trim()
        : null;
    const image =
      typeof body?.image === 'string' && body.image.trim().length
        ? body.image.trim()
        : null;
    const isPublic = typeof body?.isPublic === 'boolean' ? body.isPublic : null;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      );
    }

    if (isPublic === null) {
      return NextResponse.json(
        { success: false, error: 'isPublic is required' },
        { status: 400 }
      );
    }

    const duplicateCheckQuery = `
      query CheckDepartmentDuplicate($name: String!, $id: Int!) {
        Department(
          where: {
            _and: [
              { name: { _eq: $name } }
              { id: { _neq: $id } }
            ]
          }
          limit: 1
        ) {
          id
          deletedAt
        }
      }
    `;

    const duplicateCheck = await hasura<{
      Department: Array<{ id: number; deletedAt: string | null }>;
    }>(duplicateCheckQuery, { name, id: numericId });

    const existingDepartment = duplicateCheck.Department.at(0);

    if (existingDepartment && existingDepartment.id !== numericId) {
      if (!existingDepartment.deletedAt) {
        return NextResponse.json(
          { success: false, error: 'Department name already exists' },
          { status: 409 }
        );
      }

      const timestamp = new Date().toISOString();

      const currentUsersQuery = `
        query GetDepartmentUsers($departmentId: Int!) {
          _UserDepartments(where: { B: { _eq: $departmentId } }) {
            A
          }
        }
      `;

      const currentUsersResult = await hasura<{
        _UserDepartments: Array<{ A: number }>;
      }>(currentUsersQuery, { departmentId: numericId });

      const currentUserIds =
        currentUsersResult._UserDepartments?.map(user => user.A) ?? [];

      const deleteCurrentDepartmentMutation = `
        mutation SoftDeleteDepartment($id: Int!, $timestamp: timestamp!) {
          update_Department(
            where: { _and: [{ id: { _eq: $id } }, { deletedAt: { _is_null: true } }] }
            _set: { deletedAt: $timestamp, updatedAt: $timestamp }
          ) {
            affected_rows
          }
        }
      `;

      await hasura(deleteCurrentDepartmentMutation, {
        id: numericId,
        timestamp,
      });

      const clearUsersMutation = `
        mutation ClearUsers($departmentId: Int!) {
          delete__UserDepartments(where: { B: { _eq: $departmentId } }) {
            affected_rows
          }
        }
      `;

      await hasura(clearUsersMutation, { departmentId: existingDepartment.id });

      if (currentUserIds.length > 0) {
        const transferUsersMutation = `
          mutation TransferUsers($objects: [_UserDepartments_insert_input!]!) {
            insert__UserDepartments(objects: $objects) {
              affected_rows
            }
          }
        `;

        const transferObjects = currentUserIds.map(userId => ({
          A: userId,
          B: existingDepartment.id,
        }));

        await hasura(transferUsersMutation, { objects: transferObjects });
      }

      const restoreMutation = `
        mutation RestoreDepartment(
          $id: Int!
          $name: String!
          $description: String
          $image: String
          $isPublic: Boolean!
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
        update_Department_by_pk: {
          id: number;
          name: string;
          description: string | null;
          image: string | null;
          isPublic: boolean;
          createdAt: string;
          updatedAt: string;
        } | null;
      }>(restoreMutation, {
        id: existingDepartment.id,
        name,
        description,
        image,
        isPublic,
        timestamp,
      });

      if (!restored.update_Department_by_pk) {
        return NextResponse.json(
          { success: false, error: 'Failed to update department' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: restored.update_Department_by_pk,
      });
    }

    const mutation = `
      mutation UpdateDepartmentById(
        $id: Int!
        $name: String!
        $description: String
        $image: String
        $isPublic: Boolean!
      ) {
        update_Department(
          where: {
            _and: [{ id: { _eq: $id } }, { deletedAt: { _is_null: true } }]
          }
          _set: {
            name: $name
            description: $description
            image: $image
            isPublic: $isPublic
          }
        ) {
          affected_rows
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

    const result = await hasura<UpdateDepartmentResponse>(mutation, {
      id: numericId,
      name,
      description,
      image,
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
