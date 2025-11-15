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
    const application = searchParams.get('application');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = {};
    if (tool) query.tool = tool;
    if (category) query.category = category;
    if (application) query.application = application;

    // Add search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { subHeading: { $regex: search, $options: 'i' } },
        { application: { $regex: search, $options: 'i' } },
        { prompt: { $regex: search, $options: 'i' } },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const total = await Prompt.countDocuments(query);

    const prompts = await Prompt.find(query)
      .populate('relatedCourseId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
//hello
    return NextResponse.json(
      {
        success: true,
        data: prompts,
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

// POST /api/prompts - Add prompt
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { category, application, prompt, tool, title, subHeading, tags, relatedCourseId } = body;

    if (!category || !prompt || !tool || !title || !subHeading) {
      return NextResponse.json(
        { success: false, error: 'Category, prompt, tool, title, and subHeading are required' },
        { status: 400 }
      );
    }

    const newPrompt = await Prompt.create({
      category,
      application: application || undefined,
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

