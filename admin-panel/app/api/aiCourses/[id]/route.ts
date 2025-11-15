import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import AICourse from '@/lib/db/models/AICourse';
import AILesson from '@/lib/db/models/AILesson'; // Import to ensure model is registered for populate
import Prompt from '@/lib/db/models/Prompt'; // Import to ensure model is registered for populate
import Certificate from '@/lib/db/models/Certificate'; // Import to ensure model is registered for populate

// Ensure models are registered before use (production fix)
if (typeof AILesson !== 'undefined') {
  // Model is registered
}
if (typeof Prompt !== 'undefined') {
  // Model is registered
}
if (typeof Certificate !== 'undefined') {
  // Model is registered
}

// GET /api/aiCourses/:id - Fetch single AI mastery course
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    console.log(`🔍 Fetching AI Course with ID: ${id}`);

    // Ensure AILesson model is registered before populate (production fix)
    // Access modelName to force registration
    const ailessonModelName = AILesson.modelName || 'AILesson';
    const promptModelName = Prompt.modelName || 'Prompt';
    
    console.log(`📋 Using models: AILesson=${ailessonModelName}, Prompt=${promptModelName}`);

    const aiCourse = await AICourse.findById(id)
      .populate({
        path: 'tree.lessons',
        model: ailessonModelName, // Use model name string for production compatibility
      })
      .populate({
        path: 'tree.promptIds',
        model: promptModelName, // Use model name string for production compatibility
      })
      .populate('certificateId');

    if (!aiCourse) {
      console.log(`❌ AI Course not found: ${id}`);
      return NextResponse.json(
        { success: false, error: 'AI Course not found' },
        { status: 404 }
      );
    }

    console.log(`✅ AI Course found: ${aiCourse.title}`);
    return NextResponse.json(
      { success: true, data: aiCourse },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Error fetching AI course:', error);
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
    }
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

