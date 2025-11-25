import { hasura } from '@/lib/hasura';
import { User } from '@/types/user.type';
import { NextResponse } from 'next/server';

const USER_FIELDS = `
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
`;

type CreateUserBody = {
  name?: string | null;
  email: string;
  phone?: string | null;
  address?: string | null;
  dateOfBirth?: string | null;
  gender?: '1' | '2' | null;
  avatar?: string | null;
};

function validateEmail(email: unknown): string | NextResponse {
  if (!email || typeof email !== 'string' || !email.trim()) {
    return NextResponse.json(
      { success: false, error: 'Email is required' },
      { status: 400 }
    );
  }
  return email.trim();
}

function validateGender(gender: unknown): '1' | '2' | null | NextResponse {
  if (gender === '1' || gender === '2') {
    return gender;
  }
  if (gender === null || gender === undefined || gender === '') {
    return null;
  }
  return NextResponse.json(
    {
      success: false,
      error: 'Invalid gender value. Must be "1", "2", or null',
    },
    { status: 400 }
  );
}

function mapUserResponse(
  user: Omit<User, 'dateOfBirth'> & { dateofbirth: string | null }
): User {
  return {
    ...user,
    dateOfBirth: user.dateofbirth,
  };
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CreateUserBody;
    const { name, phone, address, dateOfBirth, gender, avatar } = body;

    // Validate email
    const emailValidation = validateEmail(body.email);
    if (emailValidation instanceof NextResponse) {
      return emailValidation;
    }
    const email = emailValidation;

    // Validate gender
    const genderValidation = validateGender(gender);
    if (genderValidation instanceof NextResponse) {
      return genderValidation;
    }
    const genderValue = genderValidation;

    // Check if email already exists
    const emailString = email.trim().toLowerCase();
    const escapedEmail = JSON.stringify(emailString);
    const checkEmailQuery = `
      query CheckEmail {
        User(where: { _and: [{ email: { _eq: ${escapedEmail} } }, { deletedAt: { _is_null: true } }] }) {
          id
        }
      }
    `;

    const emailCheckResult = await hasura<{
      User: Array<{ id: number }>;
    }>(checkEmailQuery);

    if (emailCheckResult.User && emailCheckResult.User.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email already exists',
        },
        { status: 400 }
      );
    }

    // Build mutation
    const now = new Date().toISOString();
    const mutation = `
      mutation CreateUser($objects: [User_insert_input!]!) {
        insert_User(objects: $objects) {
          returning {
            ${USER_FIELDS}
          }
        }
      }
    `;

    // Execute mutation
    const result = await hasura<{
      insert_User: {
        returning: Array<
          Omit<User, 'dateOfBirth'> & { dateofbirth: string | null }
        >;
      };
    }>(mutation, {
      objects: [
        {
          name: name?.trim() || null,
          email,
          phone: phone?.trim() || null,
          address: address?.trim() || null,
          dateofbirth: dateOfBirth || null,
          avatar: avatar?.trim() || null,
          gender: genderValue || null,
          role: 'USER',
          provider: 'EMAIL_PASSWORD',
          createdAt: now,
          updatedAt: now,
        },
      ],
    });

    const createdUser = result.insert_User.returning[0];
    if (!createdUser) {
      return NextResponse.json(
        { success: false, error: 'Failed to create user' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: mapUserResponse(createdUser),
    });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create user',
      },
      { status: 500 }
    );
  }
}
