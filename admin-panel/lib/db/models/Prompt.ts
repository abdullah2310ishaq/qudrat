import mongoose, { Schema, Document } from 'mongoose';

export interface IPrompt extends Document {
  category: 'basic_applications' | 'productivity' | 'sales' | 'ecommerce' | 'investing' | 'web_dev' | 'customer_support' | 'cro' | 'daily_life' | 'tech' | 'education';
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
      enum: [
        'basic_applications',
        'productivity',
        'sales',
        'ecommerce',
        'investing',
        'web_dev',
        'customer_support',
        'cro',
        'daily_life',
        'tech',
        'education',
      ],
      required: true,
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

