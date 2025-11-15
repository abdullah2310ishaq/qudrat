import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import AILesson from '@/lib/db/models/AILesson';

// GET /api/aiLessons/:id - Get single AI lesson
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const lesson = await AILesson.findById(id).populate('aiCourseId');

    if (!lesson) {
      return NextResponse.json(
        { success: false, error: 'AI Lesson not found' },
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

// PUT /api/aiLessons/:id - Update AI lesson
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const body = await request.json();
    const lesson = await AILesson.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!lesson) {
      return NextResponse.json(
        { success: false, error: 'AI Lesson not found' },
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

// DELETE /api/aiLessons/:id - Delete AI lesson
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const lesson = await AILesson.findByIdAndDelete(id);

    if (!lesson) {
      return NextResponse.json(
        { success: false, error: 'AI Lesson not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'AI Lesson deleted successfully' },
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

