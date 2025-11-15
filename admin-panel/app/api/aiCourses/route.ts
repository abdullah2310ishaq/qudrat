import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import AICourse from '@/lib/db/models/AICourse';
import Lesson from '@/lib/db/models/Lesson'; // Import to ensure model is registered for populate
import Prompt from '@/lib/db/models/Prompt'; // Import to ensure model is registered for populate
import Certificate from '@/lib/db/models/Certificate'; // Import to ensure model is registered for populate

// GET /api/aiCourses - Fetch all AI mastery courses
export async function GET() {
  try {
    await connectDB();

    const aiCourses = await AICourse.find()
      .populate('tree.lessons')
      .populate('tree.promptIds')
      .populate('certificateId')
      .sort({ createdAt: -1 });

    return NextResponse.json(
      { success: true, data: aiCourses },
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

    const aiCourse = await AICourse.create({
      title,
      heading,
      subHeading,
      aiTool,
      category: category || undefined,
      coverImage: coverImage || undefined,
      tree,
      certificateId: certificateId || undefined,
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

