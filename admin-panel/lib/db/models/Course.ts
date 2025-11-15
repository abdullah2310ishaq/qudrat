import mongoose, { Schema, Document } from 'mongoose';

export interface ICourse extends Document {
  title: string;
  heading: string;
  subHeading?: string;
  type: 'simple' | 'challenge';
  lessons: mongoose.Types.ObjectId[];
  category: string;
  photo?: string; // Base64 encoded cover photo (optional)
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema = new Schema<ICourse>(
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
      enum: ['simple', 'challenge'],
      required: true,
    },
    lessons: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Lesson',
      },
    ],
    category: {
      type: String,
      default: 'General',
    },
    photo: {
      type: String, // Base64 encoded image data (optional)
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

export default mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema);

