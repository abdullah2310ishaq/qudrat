import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Lesson from '@/lib/db/models/Lesson';

// GET /api/lessons?courseId=xxx - Fetch lessons for a course
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const query: Record<string, string> = {};
    if (courseId) query.courseId = courseId;

    const skip = (page - 1) * limit;

    const lessons = await Lesson.find(query)
      .sort({ order: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Lesson.countDocuments(query);

    return NextResponse.json(
      {
        success: true,
        data: lessons,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
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

// POST /api/lessons - Add a lesson
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { courseId, title, content, media, photos, order, isInteractive, questions, canRead, canListen } = body;

    if (!courseId || !title || !content) {
      return NextResponse.json(
        { success: false, error: 'CourseId, title, and content are required' },
        { status: 400 }
      );
    }

    const lesson = await Lesson.create({
      courseId,
      title,
      content,
      media: media || [],
      photos: photos || [], // Base64 encoded images (optional)
      order: order || 0,
      isInteractive: isInteractive || false,
      questions: questions || [],
      canRead: canRead !== undefined ? canRead : true,
      canListen: canListen !== undefined ? canListen : false,
    });

    return NextResponse.json(
      { success: true, data: lesson },
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

