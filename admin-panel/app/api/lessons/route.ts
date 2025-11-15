import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Lesson from '@/lib/db/models/Lesson';

// GET /api/lessons?courseId=xxx - Fetch lessons for a course
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const aiCourseId = searchParams.get('aiCourseId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = {};
    if (courseId) query.courseId = courseId;
    if (aiCourseId) query.aiCourseId = aiCourseId;

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
          totalPages: Math.ceil(total / limit),
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
    const { courseId, aiCourseId, title, content, media, photos, order, isInteractive, questions, canRead, canListen } = body;

    if ((!courseId && !aiCourseId) || !title || !content) {
      return NextResponse.json(
        { success: false, error: 'Either courseId or aiCourseId, title, and content are required' },
        { status: 400 }
      );
    }

    // Build lesson object - only include fields that are provided
    const lessonData: Record<string, unknown> = {
      title,
      content,
      media: media || [],
      photos: photos || [], // Base64 encoded images (optional)
      order: order || 0,
      isInteractive: isInteractive || false,
      questions: questions || [],
      canRead: canRead !== undefined ? canRead : true,
      canListen: canListen !== undefined ? canListen : false,
    };

    // Only include courseId or aiCourseId if provided (don't include undefined/null)
    if (courseId && courseId.trim() !== '') {
      lessonData.courseId = courseId;
    }
    if (aiCourseId && aiCourseId.trim() !== '') {
      lessonData.aiCourseId = aiCourseId;
    }

    console.log('Creating lesson with data:', JSON.stringify(lessonData, null, 2));
    console.log('Has courseId:', !!lessonData.courseId, 'Has aiCourseId:', !!lessonData.aiCourseId);
    
    const lesson = await Lesson.create(lessonData);

    return NextResponse.json(
      { success: true, data: lesson },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error creating lesson:', error);
    // Log full error details for debugging
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
      if ('errors' in error) {
        console.error('Validation errors:', JSON.stringify(error.errors, null, 2));
      }
    }
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

