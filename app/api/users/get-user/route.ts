import { hasura } from '@/lib/hasura';
import { User } from '@/types/user.type';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const idParam = searchParams.get('id');

  if (!idParam) {
    return NextResponse.json(
      { success: false, error: 'Missing id parameter' },
      { status: 400 }
    );
  }

  const id = Number(idParam);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json(
      { success: false, error: 'Invalid id parameter' },
      { status: 400 }
    );
  }

  const userResult = await hasura<{
    User: Array<Omit<User, 'dateOfBirth'> & { dateofbirth: string | null }>;
  }>(
    `
    query GetUser($id: Int!) {
      User(where: { id: { _eq: $id } }) {
        id
        name
        email
        phone
        gender
        avatar
        address
        dateofbirth
        githubId
        googleId
        createdAt
        provider
        role
        updatedAt
        deletedAt
      }
    }
    `,
    { id }
  );

  // Map dateofbirth from GraphQL to dateOfBirth for TypeScript type
  const user = userResult.User?.[0];
  const mappedUser: User | null = user
    ? {
        ...user,
        dateOfBirth: user.dateofbirth,
      }
    : null;

  return NextResponse.json({
    success: true,
    data: mappedUser,
  });
}
