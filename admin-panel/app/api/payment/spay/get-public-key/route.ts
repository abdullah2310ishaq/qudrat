import { NextRequest, NextResponse } from 'next/server';

// Dummy SPay API: Get Public Key
// POST /api/payment/spay/get-public-key
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { providerKey } = body;

    if (!providerKey) {
      return NextResponse.json(
        {
          responseMessage: 'Provider key is required',
          status: false,
          responseCode: 104,
        },
        { status: 400 }
      );
    }

    // Dummy public key (Base64 encoded)
    const dummyPublicKey = Buffer.from('DUMMY_PUBLIC_KEY_FOR_TESTING').toString('base64');

    return NextResponse.json({
      publicKey: dummyPublicKey,
      responseMessage: 'Successful',
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

