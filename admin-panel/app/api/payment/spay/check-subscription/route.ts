import { NextRequest, NextResponse } from 'next/server';

// Dummy SPay API: Check Subscription
// POST /api/payment/spay/check-subscription
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

    // Dummy subscription check
    const isSubscribed = Math.random() > 0.5; // 50% chance of being subscribed

    if (isSubscribed) {
      const expireDate = new Date();
      expireDate.setDate(expireDate.getDate() + 30); // 30 days from now

      return NextResponse.json({
        responseMessage: 'the subscriber is active',
        responseCode: 1,
        status: true,
        endSubDate: expireDate.toISOString().replace('T', ' ').substring(0, 19),
      });
    } else {
      return NextResponse.json({
        responseMessage: 'this MSISDN is not subscribed to the service',
        responseCode: 117,
        status: false,
        endSubDate: null,
      });
    }
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

