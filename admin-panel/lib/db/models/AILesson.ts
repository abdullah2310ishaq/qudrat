import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface IAILesson extends Document {
  aiCourseId: mongoose.Types.ObjectId; // For AI mastery courses only
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
  updatedAt: Date;
}

const AILessonSchema = new Schema<IAILesson>(
  {
    aiCourseId: {
      type: Schema.Types.ObjectId,
      ref: 'AICourse',
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
        explanation: {
          type: String,
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
    timestamps: true,
  }
);

export default mongoose.models.AILesson || mongoose.model<IAILesson>('AILesson', AILessonSchema);

