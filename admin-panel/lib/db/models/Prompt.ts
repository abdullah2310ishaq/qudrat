import mongoose, { Schema, Document } from 'mongoose';

export interface IPrompt extends Document {
  category: 'Life' | 'Business' | 'Creativity' | 'Work';
  prompt: string;
  tool: string; // ChatGPT, MidJourney, DALL-E, Jasper AI, etc.
  title: string;
  subHeading: string;
  tags: string[];
  relatedCourseId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PromptSchema = new Schema<IPrompt>(
  {
    category: {
      type: String,
      enum: ['Life', 'Business', 'Creativity', 'Work'],
      required: true,
    },
    prompt: {
      type: String,
      required: true,
    },
    tool: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    subHeading: {
      type: String,
      required: true,
    },
    tags: [
      {
        type: String,
      },
    ],
    relatedCourseId: {
      type: Schema.Types.ObjectId,
      ref: 'AICourse',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Prompt || mongoose.model<IPrompt>('Prompt', PromptSchema);

