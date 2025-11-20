import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const department = await prisma.department.update({
      where: { id: Number(id) },
      data: { deletedAt: new Date() },
    });
    return NextResponse.json({
      success: true,
      data: {
        id: department.id,
        name: department.name,
        description: department.description,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete department',
      },
      { status: 500 }
    );
  }
}
