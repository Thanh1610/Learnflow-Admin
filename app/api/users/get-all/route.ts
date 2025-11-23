import { hasura } from '@/lib/hasura';
import { User } from '@/types/user.type';
import { NextResponse } from 'next/server';

export async function GET() {
  const users = await hasura<{
    user: Array<User>;
  }>(`
      query GetAllUser {
      user(where: {deletedAt: {_is_null: true}}) {
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
    data: users.user ?? [],
    message: 'Get all users successfully',
  });
}
