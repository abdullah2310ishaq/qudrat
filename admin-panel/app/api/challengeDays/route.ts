import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import ChallengeDay from '@/lib/db/models/ChallengeDay';

// GET /api/challengeDays - Fetch all challenge days (with optional challengeId filter)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const challengeId = searchParams.get('challengeId');
    const day = searchParams.get('day');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = {};
    if (challengeId) query.challengeId = challengeId;
    if (day) query.day = parseInt(day, 10);

    const challengeDays = await ChallengeDay.find(query)
      .populate('challengeId')
      .sort({ challengeId: 1, day: 1 });

    return NextResponse.json(
      { success: true, data: challengeDays },
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

// POST /api/challengeDays - Create a new challenge day
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { challengeId, day, content, photos, media, questions } = body;

    if (!challengeId || !day || !content) {
      return NextResponse.json(
        { success: false, error: 'challengeId, day, and content are required' },
        { status: 400 }
      );
    }

    const challengeDay = await ChallengeDay.create({
      challengeId,
      day: parseInt(day, 10),
      content,
      photos: photos || [],
      media: media || [],
      questions: questions || [],
    });

    return NextResponse.json(
      { success: true, data: challengeDay },
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

