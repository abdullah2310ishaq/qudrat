import { NextRequest, NextResponse } from 'next/server';

// Dummy SPay API: Login
// POST /api/payment/spay/login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { login, password } = body;

    if (!login || !password) {
      return NextResponse.json(
        {
          responseMessage: 'Login and password are required',
          status: false,
          responseCode: 104,
        },
        { status: 400 }
      );
    }

    // Dummy token generation
    const dummyToken = `dummy_token_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const expireDate = new Date();
    expireDate.setHours(expireDate.getHours() + 24);

    return NextResponse.json({
      expireDate: expireDate.toISOString().replace('T', ' ').substring(0, 19),
      responseMessage: 'OK',
      token: dummyToken,
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

