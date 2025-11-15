import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Payment from '@/lib/db/models/Payment';
import User from '@/lib/db/models/User'; // Import to ensure model is registered for populate
import Course from '@/lib/db/models/Course'; // Import to ensure model is registered for populate

// GET /api/payments - Fetch all payments with filters
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const courseId = searchParams.get('courseId');
    const status = searchParams.get('status');
    const paymentMethod = searchParams.get('paymentMethod');
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');

    const query: Record<string, unknown> = {};
    if (userId) query.userId = userId;
    if (courseId) query.courseId = courseId;
    if (status) query.status = status;
    if (paymentMethod) query.paymentMethod = paymentMethod;

    const skip = (page - 1) * limit;

    const payments = await Payment.find(query)
      .populate('userId', 'name email')
      .populate('courseId', 'title heading')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Payment.countDocuments(query);

    return NextResponse.json(
      {
        success: true,
        data: payments,
        pagination: {
          total,
          page,
          limit,
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

// POST /api/payments - Create payment record (for tracking)
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { userId, courseId, amount, currency, paymentMethod, status, transactionId, msisdn, requestId, metadata } = body;

    if (!userId || !amount || !paymentMethod) {
      return NextResponse.json(
        { success: false, error: 'UserId, amount, and paymentMethod are required' },
        { status: 400 }
      );
    }

    const payment = await Payment.create({
      userId,
      courseId,
      amount,
      currency: currency || 'USD',
      paymentMethod,
      status: status || 'pending',
      transactionId,
      msisdn,
      requestId,
      metadata,
    });

    return NextResponse.json(
      { success: true, data: payment },
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

