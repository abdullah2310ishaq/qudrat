import { NextRequest, NextResponse } from 'next/server';

// Dummy SPay API: Execute Payment
// POST /api/payment/spay/payment
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('token');
    
    if (!token) {
      return NextResponse.json(
        {
          responseMessage: 'Token not found, please login',
          status: false,
          responseCode: 103,
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { pin, requestId } = body;

    if (!pin || !requestId) {
      return NextResponse.json(
        {
          responseMessage: 'PIN and requestId are required',
          status: false,
          responseCode: 104,
        },
        { status: 400 }
      );
    }

    // Validate PIN (4 digits)
    if (!/^\d{4}$/.test(pin)) {
      return NextResponse.json(
        {
          responseMessage: 'Pin code is invalid, enter a valid pin code.',
          status: false,
          responseCode: 105,
        },
        { status: 400 }
      );
    }

    // Dummy payment execution
    // In real scenario, this would validate PIN and charge the user
    const isSuccess = Math.random() > 0.1; // 90% success rate for demo

    return NextResponse.json({
      isSent: true,
      responseMessage: isSuccess ? 'Successful' : 'Insufficient balance',
      status: isSuccess,
      responseCode: isSuccess ? 1 : 111,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        responseMessage: message,
        status: false,
        responseCode: 0,
      },
      { status: 500 }
    );
  }
}

