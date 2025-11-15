import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Course from '@/lib/db/models/Course';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Lesson from '@/lib/db/models/Lesson'; // Import to ensure model is registered for populate

// GET /api/courses - Fetch all courses
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const isActive = searchParams.get('isActive');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = {};
    if (type) query.type = type;
    if (isActive !== null) query.isActive = isActive === 'true';
    if (category) query.category = category;

    // Add search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { heading: { $regex: search, $options: 'i' } },
        { subHeading: { $regex: search, $options: 'i' } },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const total = await Course.countDocuments(query);

    const courses = await Course.find(query)
      .populate('lessons')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    console.log(`✅ Found ${courses.length} courses (total: ${total})`);

    return NextResponse.json(
      {
        success: true,
        data: courses,
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
    console.error('❌ Error fetching courses:', error);
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
    }
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

