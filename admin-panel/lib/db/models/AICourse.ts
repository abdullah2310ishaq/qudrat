import mongoose, { Schema, Document } from 'mongoose';

export interface ITreeLevel {
  level: number;
  topic: string;
  lessons: mongoose.Types.ObjectId[];
  canRead: boolean;
  canListen: boolean;
  promptIds?: mongoose.Types.ObjectId[]; // Linked prompts for this level
}

export interface IAICourse extends Document {
  title: string;
  heading: string;
  subHeading?: string;
  type: 'mastery';
  aiTool: string; // ChatGPT, MidJourney, DALL-E, Jasper AI, etc.
  category?: string; // Optional category/tags
  coverImage?: string; // Base64 encoded cover image/icon (optional)
  tree: ITreeLevel[];
  certificateId?: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AICourseSchema = new Schema<IAICourse>(
  {
    title: {
      type: String,
      required: true,
    },
    heading: {
      type: String,
      required: true,
    },
    subHeading: {
      type: String,
    },
    type: {
      type: String,
      enum: ['mastery'],
      default: 'mastery',
    },
    aiTool: {
      type: String,
      required: true,
    },
    category: {
      type: String,
    },
    coverImage: {
      type: String, // Base64 encoded image data (optional)
    },
    tree: [
      {
        level: {
          type: Number,
          required: true,
        },
        topic: {
          type: String,
          required: true,
        },
        lessons: [
          {
            type: Schema.Types.ObjectId,
            ref: 'AILesson',
          },
        ],
        canRead: {
          type: Boolean,
          default: true,
        },
        canListen: {
          type: Boolean,
          default: true,
        },
        promptIds: [
          {
            type: Schema.Types.ObjectId,
            ref: 'Prompt',
          },
        ],
      },
    ],
    certificateId: {
      type: Schema.Types.ObjectId,
      ref: 'Certificate',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.AICourse || mongoose.model<IAICourse>('AICourse', AICourseSchema);

