import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import AICourse from '@/lib/db/models/AICourse';
import AILesson from '@/lib/db/models/AILesson'; // Import to ensure model is registered for populate
import Prompt from '@/lib/db/models/Prompt'; // Import to ensure model is registered for populate
import Certificate from '@/lib/db/models/Certificate'; // Import to ensure model is registered for populate

// Ensure models are registered before use (production fix)
// This forces the models to be registered with Mongoose
if (typeof AILesson !== 'undefined') {
  // Model is registered
}
if (typeof Prompt !== 'undefined') {
  // Model is registered
}
if (typeof Certificate !== 'undefined') {
  // Model is registered
}

// GET /api/aiCourses - Fetch all AI mastery courses
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');
    const aiTool = searchParams.get('aiTool');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = {};
    if (isActive !== null) query.isActive = isActive === 'true';
    if (aiTool) query.aiTool = aiTool;
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
    const total = await AICourse.countDocuments(query);

    console.log(`🔍 Fetching AI Courses with query:`, JSON.stringify(query));
    console.log(`📊 Total AI Courses found: ${total}`);

    // Ensure AILesson model is registered before populate (production fix)
    // Access modelName to force registration
    const ailessonModelName = AILesson.modelName || 'AILesson';
    const promptModelName = Prompt.modelName || 'Prompt';
    
    console.log(`📋 Using models: AILesson=${ailessonModelName}, Prompt=${promptModelName}`);

    const aiCourses = await AICourse.find(query)
      .populate({
        path: 'tree.lessons',
        model: ailessonModelName, // Use model name string for production compatibility
      })
      .populate({
        path: 'tree.promptIds',
        model: promptModelName, // Use model name string for production compatibility
      })
      .populate('certificateId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    console.log(`✅ Found ${aiCourses.length} AI courses`);

    return NextResponse.json(
      {
        success: true,
        data: aiCourses,
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
    console.error('❌ Error fetching AI courses:', error);
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

// POST /api/aiCourses - Add AI mastery course
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { title, heading, subHeading, aiTool, category, coverImage, tree, certificateId, isActive } = body;

    if (!title || !heading || !aiTool || !tree) {
      return NextResponse.json(
        { success: false, error: 'Title, heading, AI tool, and tree are required' },
        { status: 400 }
      );
    }

    // Clean up empty strings for optional fields
    const aiCourse = await AICourse.create({
      title,
      heading,
      subHeading: subHeading && subHeading.trim() !== '' ? subHeading : undefined,
      aiTool,
      category: category && category.trim() !== '' ? category : undefined,
      coverImage: coverImage && coverImage.trim() !== '' ? coverImage : undefined,
      tree,
      certificateId: certificateId && certificateId.trim() !== '' ? certificateId : undefined,
      isActive: isActive !== undefined ? isActive : true,
    });

    return NextResponse.json(
      { success: true, data: aiCourse },
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

