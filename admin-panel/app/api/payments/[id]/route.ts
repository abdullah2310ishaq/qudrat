import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Payment from '@/lib/db/models/Payment';
import User from '@/lib/db/models/User'; // Import to ensure model is registered for populate
import Course from '@/lib/db/models/Course'; // Import to ensure model is registered for populate

// GET /api/payments/:id - Fetch single payment
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const payment = await Payment.findById(id)
      .populate('userId', 'name email')
      .populate('courseId', 'title heading');

    if (!payment) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: payment },
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

// PUT /api/payments/:id - Update payment status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const body = await request.json();
    const payment = await Payment.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    })
      .populate('userId', 'name email')
      .populate('courseId', 'title heading');

    if (!payment) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: payment },
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

