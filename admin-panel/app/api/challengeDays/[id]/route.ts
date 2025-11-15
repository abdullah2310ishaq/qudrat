import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import ChallengeDay from '@/lib/db/models/ChallengeDay';

// GET /api/challengeDays/:id - Fetch single challenge day
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const challengeDay = await ChallengeDay.findById(id).populate('challengeId');

    if (!challengeDay) {
      return NextResponse.json(
        { success: false, error: 'Challenge day not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: challengeDay },
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

// PUT /api/challengeDays/:id - Update challenge day
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const body = await request.json();
    
    // Content is optional - allow empty string or undefined
    // Always convert to string if provided, default to empty string
    const contentValue = body.content !== undefined && body.content !== null
      ? String(body.content)
      : '';
    
    // Build update data - content is ALWAYS included
    const updateData: Record<string, unknown> = {
      content: contentValue, // ALWAYS include content first
    };
    
    // Add other fields if present
    if (body.day !== undefined) {
      updateData.day = parseInt(String(body.day), 10);
    }
    if ('photos' in body && Array.isArray(body.photos)) {
      updateData.photos = body.photos;
    }
    if ('media' in body && Array.isArray(body.media)) {
      updateData.media = body.media;
    }
    if ('questions' in body && Array.isArray(body.questions)) {
      updateData.questions = body.questions;
    }

    const challengeDay = await ChallengeDay.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate('challengeId');

    if (!challengeDay) {
      return NextResponse.json(
        { success: false, error: 'Challenge day not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: challengeDay },
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

// DELETE /api/challengeDays/:id - Delete challenge day
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const challengeDay = await ChallengeDay.findByIdAndDelete(id);

    if (!challengeDay) {
      return NextResponse.json(
        { success: false, error: 'Challenge day not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Challenge day deleted successfully' },
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

