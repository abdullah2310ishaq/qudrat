import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Lesson from '@/lib/db/models/Lesson';
import Course from '@/lib/db/models/Course'; // Import to ensure model is registered for populate

// Ensure models are registered before use (production fix)
if (typeof Course !== 'undefined') {
  // Model is registered
}

// GET /api/lessons/:id - Get single lesson
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    // Ensure Course model is registered before populate (production fix)
    const courseModelName = Course.modelName || 'Course';
    
    const lesson = await Lesson.findById(id).populate({
      path: 'courseId',
      model: courseModelName, // Use model name string for production compatibility
    });

    if (!lesson) {
      return NextResponse.json(
        { success: false, error: 'Lesson not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: lesson }, { status: 200 });
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
  const imageRegex = /^data:image\/(jpeg|jpg|png|gif|webp|svg\+xml);base64,/i;
  return imageRegex.test(base64);
}

// Helper function to validate base64 audio
function isValidBase64Audio(base64: string): boolean {
  if (!base64 || typeof base64 !== 'string') return false;
  const audioRegex = /^data:audio\/(mp3|wav|ogg|m4a|aac|webm);base64,/i;
  const urlRegex = /^https?:\/\//i;
  return audioRegex.test(base64) || urlRegex.test(base64);
}

// PUT /api/lessons/:id - Update lesson
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const body = await request.json();
    const updateData: Record<string, unknown> = {};

    // Process title and content
    if (body.title !== undefined) {
      updateData.title = typeof body.title === 'string' ? body.title.trim() : body.title;
    }
    if (body.content !== undefined) {
      updateData.content = typeof body.content === 'string' ? body.content.trim() : body.content;
    }

    // Process photos (base64 images)
    if (body.photos !== undefined) {
      if (Array.isArray(body.photos)) {
        updateData.photos = body.photos.filter((photo: string) => isValidBase64Image(photo));
      } else {
        updateData.photos = [];
      }
    }

    // Process media (base64 audio or URLs)
    if (body.media !== undefined) {
      if (Array.isArray(body.media)) {
        updateData.media = body.media.filter((item: string) => {
          return isValidBase64Audio(item) || /^https?:\/\//i.test(item);
        });
      } else {
        updateData.media = [];
      }
    }

    // Process questions if interactive
    if (body.isInteractive && body.questions !== undefined && Array.isArray(body.questions)) {
      updateData.questions = body.questions.filter((q: any) => {
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

    // Process other fields
    if (body.order !== undefined) updateData.order = body.order;
    if (body.isInteractive !== undefined) updateData.isInteractive = body.isInteractive;
    if (body.canRead !== undefined) updateData.canRead = body.canRead;
    if (body.canListen !== undefined) updateData.canListen = body.canListen;
    if (body.courseId !== undefined) updateData.courseId = body.courseId;
    if (body.aiCourseId !== undefined) updateData.aiCourseId = body.aiCourseId;

    const lesson = await Lesson.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!lesson) {
      return NextResponse.json(
        { success: false, error: 'Lesson not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: lesson }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

// DELETE /api/lessons/:id - Delete lesson
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const lesson = await Lesson.findByIdAndDelete(id);

    if (!lesson) {
      return NextResponse.json(
        { success: false, error: 'Lesson not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Lesson deleted successfully' },
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

