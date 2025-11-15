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

// PUT /api/lessons/:id - Update lesson
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const body = await request.json();
    const lesson = await Lesson.findByIdAndUpdate(id, body, {
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

