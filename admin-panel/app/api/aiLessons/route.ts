import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import AILesson from '@/lib/db/models/AILesson';

// GET /api/aiLessons?aiCourseId=xxx - Fetch lessons for an AI course
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const aiCourseId = searchParams.get('aiCourseId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100'); // Increased limit to show all lessons

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = {};
    if (aiCourseId) {
      // Convert string ID to ObjectId for proper querying
      const mongoose = (await import('mongoose')).default;
      if (mongoose.Types.ObjectId.isValid(aiCourseId)) {
        query.aiCourseId = new mongoose.Types.ObjectId(aiCourseId);
      } else {
        query.aiCourseId = aiCourseId; // Fallback to string if invalid
      }
      console.log('🔍 Fetching AILessons for aiCourseId:', aiCourseId);
    }

    const skip = (page - 1) * limit;

    const lessons = await AILesson.find(query)
      .populate('aiCourseId')
      .sort({ order: 1 })
      .skip(skip)
      .limit(limit);

    const total = await AILesson.countDocuments(query);

    console.log(`✅ Found ${lessons.length} AI lesson(s) (total: ${total}) for course: ${aiCourseId}`);

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
    console.error('❌ Error fetching AI lessons:', error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

// POST /api/aiLessons - Add a lesson for AI course
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { aiCourseId, title, content, media, photos, order, isInteractive, questions, canRead, canListen } = body;

    if (!aiCourseId || !title || !content) {
      return NextResponse.json(
        { success: false, error: 'aiCourseId, title, and content are required' },
        { status: 400 }
      );
    }

    // Convert aiCourseId to ObjectId if it's a string
    const mongoose = (await import('mongoose')).default;
    let courseObjectId;
    if (mongoose.Types.ObjectId.isValid(aiCourseId)) {
      courseObjectId = new mongoose.Types.ObjectId(aiCourseId);
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid aiCourseId format' },
        { status: 400 }
      );
    }

    console.log('📝 Creating AI lesson for course:', aiCourseId);
    console.log('📚 Lesson title:', title);

    const lesson = await AILesson.create({
      aiCourseId: courseObjectId,
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

    console.log('✅ AI lesson created successfully:', lesson._id);

    return NextResponse.json(
      { success: true, data: lesson },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Error creating AI lesson:', error);
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

