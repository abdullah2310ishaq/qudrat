import { NextRequest, NextResponse } from 'next/server';

// Dummy SPay API: Initiate Payment
// POST /api/payment/spay/init-pay
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
    const { msisdn, serviceCode } = body;

    if (!msisdn || !serviceCode) {
      return NextResponse.json(
        {
          responseMessage: 'MSISDN and serviceCode are required',
          status: false,
          responseCode: 104,
        },
        { status: 400 }
      );
    }

    // Validate MSISDN format (basic check)
    if (!/^\d{10,15}$/.test(msisdn)) {
      return NextResponse.json(
        {
          responseMessage: 'Please Check Your MSISDN Number',
          status: false,
          responseCode: 106,
        },
        { status: 400 }
      );
    }

    // Generate dummy request ID
    const requestId = Math.floor(Math.random() * 100000) + 1;

    return NextResponse.json({
      requestId,
      isSent: true,
      responseMessage: 'Payment request created successfully.',
      status: true,
      responseCode: 1,
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

