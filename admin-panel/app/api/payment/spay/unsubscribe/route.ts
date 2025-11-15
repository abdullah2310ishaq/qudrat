import { NextRequest, NextResponse } from 'next/server';

// Dummy SPay API: Unsubscribe
// POST /api/payment/spay/unsubscribe
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

    return NextResponse.json({
      status: true,
      responseCode: 1,
      isSent: true,
      responseMessage: 'Your Are UnSubscribe Successfully',
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

