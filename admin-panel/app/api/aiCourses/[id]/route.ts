import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import AICourse from '@/lib/db/models/AICourse';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import AILesson from '@/lib/db/models/AILesson'; // Import to ensure model is registered for populate
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Prompt from '@/lib/db/models/Prompt'; // Import to ensure model is registered for populate
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Certificate from '@/lib/db/models/Certificate'; // Import to ensure model is registered for populate

// GET /api/aiCourses/:id - Fetch single AI mastery course
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const aiCourse = await AICourse.findById(id)
      .populate('tree.lessons')
      .populate('tree.promptIds')
      .populate('certificateId');

    if (!aiCourse) {
      return NextResponse.json(
        { success: false, error: 'AI Course not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: aiCourse },
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

// PUT /api/aiCourses/:id - Update AI mastery course
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const body = await request.json();
    
    // Clean up empty strings for optional ObjectId fields
    const updateData: Record<string, unknown> = { ...body };
    if (updateData.certificateId === '' || updateData.certificateId === null) {
      updateData.certificateId = undefined;
    }
    if (updateData.category === '') {
      updateData.category = undefined;
    }
    if (updateData.subHeading === '') {
      updateData.subHeading = undefined;
    }
    if (updateData.coverImage === '') {
      updateData.coverImage = undefined;
    }
    
    const aiCourse = await AICourse.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!aiCourse) {
      return NextResponse.json(
        { success: false, error: 'AI Course not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: aiCourse },
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

// DELETE /api/aiCourses/:id - Delete AI mastery course
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const aiCourse = await AICourse.findByIdAndDelete(id);

    if (!aiCourse) {
      return NextResponse.json(
        { success: false, error: 'AI Course not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'AI Course deleted successfully' },
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

