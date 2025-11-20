import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type BulkDeleteRequest = {
  ids?: Array<number | string>;
};

const parseIds = (ids?: Array<number | string>): number[] => {
  if (!Array.isArray(ids)) return [];

  const uniqueIds = new Set<number>();

  for (const rawId of ids) {
    const numericId = Number(rawId);
    if (Number.isInteger(numericId) && numericId > 0) {
      uniqueIds.add(numericId);
    }
  }

  return Array.from(uniqueIds);
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as BulkDeleteRequest;
    const ids = parseIds(body.ids);

    if (ids.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid department ids',
        },
        { status: 400 }
      );
    }

    const result = await prisma.department.updateMany({
      where: {
        id: {
          in: ids,
        },
      },
      data: {
        deletedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        count: result.count,
        ids,
      },
    });
  } catch (error) {
    console.error('Bulk delete departments failed', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete departments',
      },
      { status: 500 }
    );
  }
}
