import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Certificate from '@/lib/db/models/Certificate';

// GET /api/certificates?userId=xxx - Fetch certificates of a user
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const courseId = searchParams.get('courseId');

    const query: Record<string, string> = {};
    if (userId) query.userId = userId;
    if (courseId) query.courseId = courseId;

    const certificates = await Certificate.find(query)
      .populate('userId')
      .populate('courseId')
      .sort({ dateIssued: -1 });

    return NextResponse.json(
      { success: true, data: certificates },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

// POST /api/certificates - Issue certificate
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { userId, courseId, icon, title } = body;

    if (!userId || !courseId || !icon || !title) {
      return NextResponse.json(
        { success: false, error: 'UserId, courseId, icon, and title are required' },
        { status: 400 }
      );
    }

    const certificate = await Certificate.create({
      userId,
      courseId,
      icon,
      title,
    });

    return NextResponse.json(
      { success: true, data: certificate },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

