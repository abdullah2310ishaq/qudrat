import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Course from '@/lib/db/models/Course';
import Lesson from '@/lib/db/models/Lesson'; // Import to ensure model is registered for populate

// Force model registration at module load (production fix for serverless)
// Accessing modelName forces Mongoose to register the model
void Lesson.modelName;
void Course.modelName;

// GET /api/courses - Fetch all courses
export async function GET(request: NextRequest) {
  try {
    // Ensure DB connection and models are ready
    await connectDB();
    
    // Double-check model registration after connection
    if (!Lesson.modelName) {
      console.error('❌ Lesson model not registered!');
      return NextResponse.json(
        { success: false, error: 'Model registration failed' },
        { status: 500 }
      );
    }
    
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

    // Ensure Lesson model is registered before populate (production fix)
    const lessonModelName = Lesson.modelName || 'Lesson';
    console.log(`📋 Using model: Lesson=${lessonModelName}, Total courses: ${total}`);

    const courses = await Course.find(query)
      .populate({
        path: 'lessons',
        model: lessonModelName, // Use model name string for production compatibility
      })
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
      // Check if it's a model registration error
      if (message.includes('Schema hasn\'t been registered') || message.includes('model')) {
        console.error('🔴 Model registration error detected!');
      }
    }
    // Return 500 instead of 404 for server errors
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

    // Validate photo if provided
    let processedPhoto: string | undefined = undefined;
    if (photo) {
      if (isValidBase64Image(photo)) {
        processedPhoto = photo;
      } else {
        return NextResponse.json(
          { success: false, error: 'Invalid photo format. Must be a base64 encoded image.' },
          { status: 400 }
        );
      }
    }

    // Validate lessons array
    let processedLessons: string[] = [];
    if (lessons && Array.isArray(lessons)) {
      processedLessons = lessons.filter((lessonId: any) => {
        return lessonId && (typeof lessonId === 'string' || typeof lessonId === 'object');
      });
    }

    const course = await Course.create({
      title: title.trim(),
      heading: heading.trim(),
      subHeading: subHeading ? subHeading.trim() : undefined,
      type,
      category: category ? category.trim() : 'General',
      lessons: processedLessons,
      photo: processedPhoto,
      isActive: isActive !== undefined ? isActive : true,
    });

    return NextResponse.json(
      { 
        success: true, 
        data: course,
        message: 'Course created successfully'
      },
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

