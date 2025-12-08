import mongoose, { Schema, Document } from 'mongoose';

// Ensure we always use the latest schema (avoid stale enum caches)
if (mongoose.models.Prompt) {
  delete mongoose.models.Prompt;
}

export interface IPrompt extends Document {
  category: string; // Admin-defined, free text
  application?: string; // Optional sub-category/application name (e.g., "Leveraging Customer Data Analytics")
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
      required: true,
      trim: true,
    },
    application: {
      type: String,
      // Optional sub-category/application name (e.g., "Leveraging Customer Data Analytics")
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
      ref: 'Course',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Prompt || mongoose.model<IPrompt>('Prompt', PromptSchema);

