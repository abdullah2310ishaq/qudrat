import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Course from '@/lib/db/models/Course';
import Lesson from '@/lib/db/models/Lesson'; // Import to ensure model is registered for populate

// Ensure models are registered before use (production fix)
if (typeof Lesson !== 'undefined') {
  // Model is registered
}

// GET /api/courses/:id - Fetch single course
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    console.log(`🔍 Fetching course with ID: ${id}`);

    // Ensure Lesson model is registered before populate (production fix)
    // Access modelName to force registration
    const lessonModelName = Lesson.modelName || 'Lesson';
    console.log(`📋 Using model: Lesson=${lessonModelName}`);

    const course = await Course.findById(id).populate({
      path: 'lessons',
      model: lessonModelName, // Use model name string for production compatibility
    });

    if (!course) {
      console.log(`❌ Course not found: ${id}`);
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }

    console.log(`✅ Course found: ${course.title}`);
    return NextResponse.json({ success: true, data: course }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Error fetching course:', error);
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
    }
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

// PUT /api/courses/:id - Update course
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const body = await request.json();
    const updateData: Record<string, unknown> = {};

    // Process title and heading
    if (body.title !== undefined) {
      updateData.title = typeof body.title === 'string' ? body.title.trim() : body.title;
    }
    if (body.heading !== undefined) {
      updateData.heading = typeof body.heading === 'string' ? body.heading.trim() : body.heading;
    }
    if (body.subHeading !== undefined) {
      updateData.subHeading = body.subHeading ? (typeof body.subHeading === 'string' ? body.subHeading.trim() : body.subHeading) : undefined;
    }

    // Validate and process photo
    if (body.photo !== undefined) {
      if (body.photo === null || body.photo === '') {
        updateData.photo = undefined;
      } else if (isValidBase64Image(body.photo)) {
        updateData.photo = body.photo;
      } else {
        return NextResponse.json(
          { success: false, error: 'Invalid photo format. Must be a base64 encoded image.' },
          { status: 400 }
        );
      }
    }

    // Process other fields
    if (body.type !== undefined) updateData.type = body.type;
    if (body.category !== undefined) updateData.category = body.category ? body.category.trim() : 'General';
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.lessons !== undefined) {
      if (Array.isArray(body.lessons)) {
        updateData.lessons = body.lessons.filter((lessonId: any) => {
          return lessonId && (typeof lessonId === 'string' || typeof lessonId === 'object');
        });
      } else {
        updateData.lessons = [];
      }
    }

    const course = await Course.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: course }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

// DELETE /api/courses/:id - Delete course and associated lessons
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    // Find the course first
    const course = await Course.findById(id);
    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }

    // Delete all lessons associated with this course
    await Lesson.deleteMany({ courseId: id });

    // Delete the course
    await Course.findByIdAndDelete(id);

    return NextResponse.json(
      { success: true, message: 'Course and associated lessons deleted successfully' },
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

