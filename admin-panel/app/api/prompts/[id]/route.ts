import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Prompt from '@/lib/db/models/Prompt';
import Course from '@/lib/db/models/Course'; // Import to ensure model is registered for populate

// Ensure models are registered before use (production fix)
if (typeof Course !== 'undefined') {
  // Model is registered
}

// GET /api/prompts/:id - Fetch single prompt
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    // Ensure Course model is registered before populate (production fix)
    const courseModelName = Course.modelName || 'Course';
    
    const prompt = await Prompt.findById(id).populate({
      path: 'relatedCourseId',
      model: courseModelName, // Use model name string for production compatibility
    });

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: 'Prompt not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: prompt }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

// PUT /api/prompts/:id - Update prompt
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const body = await request.json();
    const prompt = await Prompt.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: 'Prompt not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: prompt }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

// DELETE /api/prompts/:id - Delete prompt
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const prompt = await Prompt.findByIdAndDelete(id);

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: 'Prompt not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Prompt deleted successfully' },
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

