import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Course from '@/lib/db/models/Course';

// GET /api/courses - Fetch all courses
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const isActive = searchParams.get('isActive');

    const query: Record<string, string | boolean> = {};
    if (type) query.type = type;
    if (isActive !== null) query.isActive = isActive === 'true';

    const courses = await Course.find(query)
      .populate('lessons')
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: courses }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

// POST /api/courses - Add a new course
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { title, heading, subHeading, type, category, lessons, photo, isActive } = body;

    if (!title || !heading || !type) {
      return NextResponse.json(
        { success: false, error: 'Title, heading, and type are required' },
        { status: 400 }
      );
    }

    const course = await Course.create({
      title,
      heading,
      subHeading,
      type,
      category: category || 'General',
      lessons: lessons || [],
      photo: photo || undefined, // Base64 encoded photo (optional)
      isActive: isActive !== undefined ? isActive : true,
    });

    return NextResponse.json(
      { success: true, data: course },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

