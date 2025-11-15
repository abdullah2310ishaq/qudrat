import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import User from '@/lib/db/models/User';

// GET /api/users - List all users
export async function GET() {
  try {
    await connectDB();

    const users = await User.find()
      .populate('completedLessons')
      .populate('certificates')
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: users }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

// POST /api/users - Create user
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { name, email, streak, completedLessons, joinedChallenges, masteryProgress, certificates } = body;

    // Only name is required
    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      );
    }

    const user = await User.create({
      name,
      email: email || undefined,
      streak: streak || 0,
      completedLessons: completedLessons || [],
      joinedChallenges: joinedChallenges || [],
      masteryProgress: masteryProgress || {},
      certificates: certificates || [],
    });

    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

