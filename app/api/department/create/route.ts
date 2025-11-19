import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { name, description } = await req.json();
  try {
    if (!name) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing fields',
        },
        { status: 400 }
      );
    }

    const existing = await prisma.department.findUnique({ where: { name } });
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: 'Name already in use',
        },
        { status: 409 }
      );
    }

    const department = await prisma.department.create({
      data: { name, description },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: department.id,
          name: department.name,
          description: department.description,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      {
        success: false,
        error: 'Server error',
      },
      { status: 500 }
    );
  }
}
