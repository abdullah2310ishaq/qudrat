import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface ILesson extends Document {
  courseId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  media?: string[]; // External URLs (optional)
  photos?: string[]; // Base64 encoded images stored in MongoDB (optional)
  order: number;
  isInteractive: boolean;
  questions?: IQuestion[];
  canRead?: boolean; // For mastery path lessons
  canListen?: boolean; // For mastery path lessons
  createdAt: Date;
}

const LessonSchema = new Schema<ILesson>(
  {
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    media: [
      {
        type: String,
      },
    ],
    photos: [
      {
        type: String, // Base64 encoded image data
      },
    ],
    order: {
      type: Number,
      required: true,
      default: 0,
    },
    isInteractive: {
      type: Boolean,
      default: false,
    },
    questions: [
      {
        question: {
          type: String,
        },
        options: [
          {
            type: String,
          },
        ],
        correctAnswer: {
          type: Number,
        },
      },
    ],
    canRead: {
      type: Boolean,
      default: true,
    },
    canListen: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export default mongoose.models.Lesson || mongoose.model<ILesson>('Lesson', LessonSchema);

