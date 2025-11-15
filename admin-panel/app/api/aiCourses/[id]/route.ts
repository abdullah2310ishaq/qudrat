import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import AICourse from '@/lib/db/models/AICourse';
import AILesson from '@/lib/db/models/AILesson'; // Import to ensure model is registered for populate
import Prompt from '@/lib/db/models/Prompt'; // Import to ensure model is registered for populate
import Certificate from '@/lib/db/models/Certificate'; // Import to ensure model is registered for populate

// Ensure models are registered before use (production fix)
if (typeof AILesson !== 'undefined') {
  // Model is registered
}
if (typeof Prompt !== 'undefined') {
  // Model is registered
}
if (typeof Certificate !== 'undefined') {
  // Model is registered
}

// GET /api/aiCourses/:id - Fetch single AI mastery course
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    console.log(`🔍 Fetching AI Course with ID: ${id}`);

    // Ensure AILesson model is registered before populate (production fix)
    // Access modelName to force registration
    const ailessonModelName = AILesson.modelName || 'AILesson';
    const promptModelName = Prompt.modelName || 'Prompt';
    
    console.log(`📋 Using models: AILesson=${ailessonModelName}, Prompt=${promptModelName}`);

    const aiCourse = await AICourse.findById(id)
      .populate({
        path: 'tree.lessons',
        model: ailessonModelName, // Use model name string for production compatibility
      })
      .populate({
        path: 'tree.promptIds',
        model: promptModelName, // Use model name string for production compatibility
      })
      .populate('certificateId');

    if (!aiCourse) {
      console.log(`❌ AI Course not found: ${id}`);
      return NextResponse.json(
        { success: false, error: 'AI Course not found' },
        { status: 404 }
      );
    }

    console.log(`✅ AI Course found: ${aiCourse.title}`);
    return NextResponse.json(
      { success: true, data: aiCourse },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Error fetching AI course:', error);
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

// PUT /api/aiCourses/:id - Update AI mastery course
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const body = await request.json();
    
    console.log('📝 Updating AI Course:', id);
    console.log('📦 Raw update data:', JSON.stringify(body, null, 2));
    
    // Find the course first
    const existingCourse = await AICourse.findById(id);
    if (!existingCourse) {
      return NextResponse.json(
        { success: false, error: 'AI Course not found' },
        { status: 404 }
      );
    }

    // Clean up empty strings for optional ObjectId fields
    const updateData: Record<string, unknown> = {};
    
    // Update basic fields
    if (body.title !== undefined) updateData.title = body.title;
    if (body.heading !== undefined) updateData.heading = body.heading;
    if (body.subHeading !== undefined && body.subHeading !== '') updateData.subHeading = body.subHeading;
    if (body.subHeading === '') updateData.subHeading = undefined;
    if (body.aiTool !== undefined) updateData.aiTool = body.aiTool;
    if (body.category !== undefined && body.category !== '') updateData.category = body.category;
    if (body.category === '') updateData.category = undefined;
    if (body.coverImage !== undefined && body.coverImage !== '') updateData.coverImage = body.coverImage;
    if (body.coverImage === '') updateData.coverImage = undefined;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    
    // Handle certificateId
    if (body.certificateId === '' || body.certificateId === null) {
      updateData.certificateId = undefined;
    } else if (body.certificateId !== undefined) {
      updateData.certificateId = body.certificateId;
    }
    
    // IMPORTANT: Process tree structure with proper ObjectId conversion
    if (body.tree && Array.isArray(body.tree)) {
      const mongoose = (await import('mongoose')).default;
      
      updateData.tree = body.tree.map((level: { 
        level: number; 
        topic: string; 
        lessons?: string[]; 
        canRead?: boolean; 
        canListen?: boolean; 
        promptIds?: string[];
        [key: string]: unknown;
      }) => {
        const processedLevel: Record<string, unknown> = {
          level: level.level,
          topic: level.topic,
          canRead: level.canRead !== undefined ? level.canRead : true,
          canListen: level.canListen !== undefined ? level.canListen : false,
        };

        // Convert lesson IDs to ObjectIds
        if (level.lessons && Array.isArray(level.lessons)) {
          processedLevel.lessons = level.lessons
            .filter((lessonId: string) => lessonId && lessonId.trim() !== '')
            .map((lessonId: string) => {
              // Convert to ObjectId if valid
              if (mongoose.Types.ObjectId.isValid(lessonId)) {
                return new mongoose.Types.ObjectId(lessonId);
              }
              console.warn(`⚠️ Invalid lesson ID: ${lessonId}`);
              return null;
            })
            .filter((id: mongoose.Types.ObjectId | null) => id !== null);
          console.log(`📚 Level ${level.level} (${level.topic}): ${processedLevel.lessons.length} valid lesson(s)`);
        } else {
          processedLevel.lessons = [];
        }

        // Convert prompt IDs to ObjectIds
        if (level.promptIds && Array.isArray(level.promptIds)) {
          processedLevel.promptIds = level.promptIds
            .filter((promptId: string) => promptId && promptId.trim() !== '')
            .map((promptId: string) => {
              if (mongoose.Types.ObjectId.isValid(promptId)) {
                return new mongoose.Types.ObjectId(promptId);
              }
              return null;
            })
            .filter((id: mongoose.Types.ObjectId | null) => id !== null);
        } else {
          processedLevel.promptIds = [];
        }

        return processedLevel;
      });
      
      console.log('🌳 Processed tree structure:', JSON.stringify(updateData.tree, null, 2));
    }
    
    // Use $set to explicitly update the tree structure
    const aiCourse = await AICourse.findByIdAndUpdate(
      id,
      { $set: updateData },
      {
        new: true,
        runValidators: true,
      }
    )
      .populate({
        path: 'tree.lessons',
        model: AILesson.modelName || 'AILesson',
      })
      .populate({
        path: 'tree.promptIds',
        model: Prompt.modelName || 'Prompt',
      })
      .populate('certificateId');

    if (!aiCourse) {
      return NextResponse.json(
        { success: false, error: 'AI Course not found' },
        { status: 404 }
      );
    }

    console.log('✅ AI Course updated successfully');
    console.log('📊 Updated course tree:', JSON.stringify(aiCourse.tree.map((l: { level: number; topic: string; lessons: unknown[] }) => ({
      level: l.level,
      topic: l.topic,
      lessonsCount: l.lessons.length
    })), null, 2));
    
    return NextResponse.json(
      { success: true, data: aiCourse },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Error updating AI course:', error);
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

// DELETE /api/aiCourses/:id - Delete AI mastery course
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const aiCourse = await AICourse.findByIdAndDelete(id);

    if (!aiCourse) {
      return NextResponse.json(
        { success: false, error: 'AI Course not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'AI Course deleted successfully' },
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

