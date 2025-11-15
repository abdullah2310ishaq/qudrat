import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Prompt from '@/lib/db/models/Prompt';

// GET /api/prompts - Fetch all prompts
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const tool = searchParams.get('tool');
    const category = searchParams.get('category');

    const query: Record<string, string> = {};
    if (tool) query.tool = tool;
    if (category) query.category = category;

    const prompts = await Prompt.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: prompts }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

// POST /api/prompts - Add prompt
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { category, prompt, tool, title, subHeading, tags, relatedCourseId } = body;

    if (!category || !prompt || !tool || !title || !subHeading) {
      return NextResponse.json(
        { success: false, error: 'Category, prompt, tool, title, and subHeading are required' },
        { status: 400 }
      );
    }

    const newPrompt = await Prompt.create({
      category,
      prompt,
      tool,
      title,
      subHeading,
      tags: tags || [],
      relatedCourseId,
    });

    return NextResponse.json(
      { success: true, data: newPrompt },
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

