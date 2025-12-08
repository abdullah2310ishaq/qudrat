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

// Helper function to validate base64 image
function isValidBase64Image(base64: string): boolean {
  if (!base64 || typeof base64 !== 'string') return false;
  // Check if it's a valid base64 image data URI
  const imageRegex = /^data:image\/(jpeg|jpg|png|gif|webp|svg\+xml);base64,/i;
  return imageRegex.test(base64);
}

// Helper function to validate base64 audio
function isValidBase64Audio(base64: string): boolean {
  if (!base64 || typeof base64 !== 'string') return false;
  // Check if it's a valid base64 audio data URI or URL
  const audioRegex = /^data:audio\/(mp3|wav|ogg|m4a|aac|webm);base64,/i;
  const urlRegex = /^https?:\/\//i;
  return audioRegex.test(base64) || urlRegex.test(base64);
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

    // Validate and process photos (base64 images)
    let processedPhotos: string[] = [];
    if (photos && Array.isArray(photos)) {
      processedPhotos = photos.filter((photo: string) => {
        if (!photo || typeof photo !== 'string') return false;
        // Allow base64 images or empty strings (will be filtered)
        return isValidBase64Image(photo);
      });
    }

    // Validate and process media (base64 audio or URLs)
    let processedMedia: string[] = [];
    if (media && Array.isArray(media)) {
      processedMedia = media.filter((item: string) => {
        if (!item || typeof item !== 'string') return false;
        // Allow base64 audio or URLs
        return isValidBase64Audio(item) || /^https?:\/\//i.test(item);
      });
    }

    // Validate questions if interactive
    let processedQuestions: Array<{
      question: string;
      options: string[];
      correctAnswer: number;
      explanation?: string;
    }> = [];
    if (isInteractive && questions && Array.isArray(questions)) {
      processedQuestions = questions.filter((q: any) => {
        return (
          q &&
          typeof q.question === 'string' &&
          q.question.trim() !== '' &&
          Array.isArray(q.options) &&
          q.options.length >= 2 &&
          typeof q.correctAnswer === 'number' &&
          q.correctAnswer >= 0 &&
          q.correctAnswer < q.options.length
        );
      });
    }

    // Build lesson object
    const lessonData: Record<string, unknown> = {
      title: title.trim(),
      content: content.trim(),
      media: processedMedia,
      photos: processedPhotos,
      order: order || 0,
      isInteractive: isInteractive || false,
      questions: processedQuestions,
      canRead: canRead !== undefined ? canRead : true,
      canListen: canListen !== undefined ? canListen : false,
    };

    // Only include courseId or aiCourseId if provided
    if (courseId && courseId.trim() !== '') {
      lessonData.courseId = courseId;
    }
    if (aiCourseId && aiCourseId.trim() !== '') {
      lessonData.aiCourseId = aiCourseId;
    }

    const lesson = await Lesson.create(lessonData);

    return NextResponse.json(
      { 
        success: true, 
        data: lesson,
        message: `Lesson created successfully with ${processedPhotos.length} image(s) and ${processedMedia.length} media file(s)`
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error creating lesson:', error);
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

