import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import CertificateTemplate from '@/lib/db/models/CertificateTemplate';

// POST /api/certificate-templates/seed - Create default Qudrat Academy certificates
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Check if Qudrat Academy templates already exist
    const existing = await CertificateTemplate.find({ 
      name: { $regex: /Qudrat Academy/i } 
    });
    
    if (existing.length > 0) {
      // Delete existing Qudrat Academy templates first
      await CertificateTemplate.deleteMany({ 
        name: { $regex: /Qudrat Academy/i } 
      });
    }

    // Create 4 beautiful Qudrat Academy certificate templates
    const templates = [
      {
        name: 'Qudrat Academy - Gold Excellence',
        icon: '🏆',
        title: 'Certificate of Excellence',
        description: 'Awarded for outstanding achievement and mastery in AI courses',
        design: {
          backgroundColor: '#0a0a0a',
          textColor: '#FFD700',
          borderColor: '#FFD700',
          borderStyle: 'solid',
        },
        isActive: true,
      },
      {
        name: 'Qudrat Academy - Blue Mastery',
        icon: '🎓',
        title: 'Mastery Certificate',
        description: 'Recognizing complete mastery and expertise in AI tools',
        design: {
          backgroundColor: '#0a1929',
          textColor: '#64b5f6',
          borderColor: '#64b5f6',
          borderStyle: 'dashed',
        },
        isActive: true,
      },
      {
        name: 'Qudrat Academy - Purple Achievement',
        icon: '⭐',
        title: 'Achievement Certificate',
        description: 'Celebrating successful completion of AI mastery path',
        design: {
          backgroundColor: '#1a0a2e',
          textColor: '#b794f6',
          borderColor: '#b794f6',
          borderStyle: 'dotted',
        },
        isActive: true,
      },
      {
        name: 'Qudrat Academy - Green Success',
        icon: '✨',
        title: 'Certificate of Completion',
        description: 'Acknowledging successful completion of course challenges',
        design: {
          backgroundColor: '#0a1a0a',
          textColor: '#4ade80',
          borderColor: '#4ade80',
          borderStyle: 'solid',
        },
        isActive: true,
      },
    ];

    const created = await CertificateTemplate.insertMany(templates);

    return NextResponse.json(
      { 
        success: true, 
        message: `Created ${created.length} certificate templates`,
        data: created 
      },
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

