import mongoose, { Schema, Document } from 'mongoose';

export interface IInteractiveQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface IDailyQuestion {
  day: number;
  lessonId: mongoose.Types.ObjectId;
  questions: IInteractiveQuestion[];
}

export interface IChallenge extends Document {
  title: string;
  description: string;
  duration: number; // days
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  lessons: mongoose.Types.ObjectId[];
  interactiveQuestions: IDailyQuestion[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ChallengeSchema = new Schema<IChallenge>(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      required: true,
    },
    lessons: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Lesson',
      },
    ],
    interactiveQuestions: [
      {
        day: {
          type: Number,
          required: true,
        },
        lessonId: {
          type: Schema.Types.ObjectId,
          ref: 'Lesson',
          required: true,
        },
        questions: [
          {
            question: {
              type: String,
              required: true,
            },
            options: [
              {
                type: String,
              },
            ],
            correctAnswer: {
              type: Number,
              required: true,
            },
          },
        ],
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Challenge || mongoose.model<IChallenge>('Challenge', ChallengeSchema);

