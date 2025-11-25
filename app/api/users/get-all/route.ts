import { hasura } from '@/lib/hasura';
import { User } from '@/types/user.type';
import { NextResponse } from 'next/server';

export async function GET() {
  const users = await hasura<{
    User: Array<User>;
  }>(`
      query GetAllUser {
      User(where: {deletedAt: {_is_null: true}}) {
        id
        name
        phone
        provider
        role
        createdAt
        avatar
        address
        email
        gender
      }
    }
  `);
  return NextResponse.json({
    success: true,
    data: users.User ?? [],
    message: 'Get all users successfully',
  });
}
