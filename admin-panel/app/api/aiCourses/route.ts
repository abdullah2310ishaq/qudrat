import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import AICourse from '@/lib/db/models/AICourse';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import AILesson from '@/lib/db/models/AILesson'; // Import to ensure model is registered for populate
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Prompt from '@/lib/db/models/Prompt'; // Import to ensure model is registered for populate
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Certificate from '@/lib/db/models/Certificate'; // Import to ensure model is registered for populate

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

    const aiCourses = await AICourse.find(query)
      .populate('tree.lessons')
      .populate('tree.promptIds')
      .populate('certificateId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

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

