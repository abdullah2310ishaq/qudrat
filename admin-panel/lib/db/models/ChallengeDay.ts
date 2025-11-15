import mongoose, { Schema, Document } from 'mongoose';

export interface IInteractiveQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface IChallengeDay extends Document {
  challengeId: mongoose.Types.ObjectId;
  day: number;
  content: string; // Paragraph or any text content for the day
  photos?: string[]; // Base64 encoded images (optional)
  media?: string[]; // External URLs (optional)
  questions?: IInteractiveQuestion[]; // Optional quiz questions for the day
  createdAt: Date;
  updatedAt: Date;
}

const ChallengeDaySchema = new Schema<IChallengeDay>(
  {
    challengeId: {
      type: Schema.Types.ObjectId,
      ref: 'Challenge',
      required: true,
    },
    day: {
      type: Number,
      required: true,
    },
    content: {
      type: String,
      default: '', // Allow empty content
    },
    photos: [
      {
        type: String, // Base64 encoded image data
      },
    ],
    media: [
      {
        type: String, // External URLs
      },
    ],
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
        explanation: {
          type: String,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Ensure unique day per challenge
ChallengeDaySchema.index({ challengeId: 1, day: 1 }, { unique: true });

export default mongoose.models.ChallengeDay || mongoose.model<IChallengeDay>('ChallengeDay', ChallengeDaySchema);

