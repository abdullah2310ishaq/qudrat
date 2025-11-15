import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Course from '@/lib/db/models/Course';
import Lesson from '@/lib/db/models/Lesson'; // Import to ensure model is registered for populate

// GET /api/courses/:id - Fetch single course
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    console.log(`🔍 Fetching course with ID: ${id}`);

    const course = await Course.findById(id).populate('lessons');

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

// PUT /api/courses/:id - Update course
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const body = await request.json();
    const course = await Course.findByIdAndUpdate(id, body, {
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

// DELETE /api/courses/:id - Delete course
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const course = await Course.findByIdAndDelete(id);

    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Course deleted successfully' },
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

