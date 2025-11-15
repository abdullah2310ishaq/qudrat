import mongoose, { Schema, Document } from 'mongoose';

export interface ICertificate extends Document {
  userId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  icon: string; // AI tool icon filename
  title: string;
  dateIssued: Date;
  createdAt: Date;
}

const CertificateSchema = new Schema<ICertificate>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    icon: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    dateIssued: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export default mongoose.models.Certificate || mongoose.model<ICertificate>('Certificate', CertificateSchema);

