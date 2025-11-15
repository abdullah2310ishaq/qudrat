import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Challenge from '@/lib/db/models/Challenge';

// GET /api/challenges - Fetch all challenges
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');
    const level = searchParams.get('level');

    const query: Record<string, string | boolean> = {};
    if (isActive !== null) query.isActive = isActive === 'true';
    if (level) query.level = level;

    const challenges = await Challenge.find(query)
      .populate('lessons')
      .sort({ createdAt: -1 });

    return NextResponse.json(
      { success: true, data: challenges },
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

// POST /api/challenges - Add challenge
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      title,
      description,
      duration,
      level,
      lessons,
      interactiveQuestions,
      isActive,
    } = body;

    if (!title || !description || !duration || !level) {
      return NextResponse.json(
        { success: false, error: 'Title, description, duration, and level are required' },
        { status: 400 }
      );
    }

    const challenge = await Challenge.create({
      title,
      description,
      duration,
      level,
      lessons: lessons || [],
      interactiveQuestions: interactiveQuestions || [],
      isActive: isActive !== undefined ? isActive : true,
    });

    return NextResponse.json(
      { success: true, data: challenge },
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

