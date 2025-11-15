import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import CertificateTemplate from '@/lib/db/models/CertificateTemplate';

// GET /api/certificate-templates - Fetch all certificate templates
export async function GET() {
  try {
    await connectDB();

    const templates = await CertificateTemplate.find()
      .sort({ createdAt: -1 });

    return NextResponse.json(
      { success: true, data: templates },
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

// POST /api/certificate-templates - Create certificate template
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { name, icon, title, description, design, isActive } = body;

    if (!name || !icon || !title) {
      return NextResponse.json(
        { success: false, error: 'Name, icon, and title are required' },
        { status: 400 }
      );
    }

    const template = await CertificateTemplate.create({
      name,
      icon,
      title,
      description,
      design: design || {
        backgroundColor: '#1a1a1a',
        textColor: '#ffffff',
        borderColor: '#ffffff',
        borderStyle: 'solid',
      },
      isActive: isActive !== undefined ? isActive : true,
    });

    return NextResponse.json(
      { success: true, data: template },
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

