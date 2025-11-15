import mongoose, { Schema, Document } from 'mongoose';

export interface ICertificateTemplate extends Document {
  name: string;
  icon: string; // Icon/emoji for the certificate
  title: string; // Default title template
  description?: string;
  design: {
    backgroundColor: string;
    textColor: string;
    borderColor: string;
    borderStyle: 'solid' | 'dashed' | 'dotted';
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CertificateTemplateSchema = new Schema<ICertificateTemplate>(
  {
    name: {
      type: String,
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
    description: {
      type: String,
    },
    design: {
      backgroundColor: {
        type: String,
        default: '#1a1a1a',
      },
      textColor: {
        type: String,
        default: '#ffffff',
      },
      borderColor: {
        type: String,
        default: '#ffffff',
      },
      borderStyle: {
        type: String,
        enum: ['solid', 'dashed', 'dotted'],
        default: 'solid',
      },
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

export default mongoose.models.CertificateTemplate || mongoose.model<ICertificateTemplate>('CertificateTemplate', CertificateTemplateSchema);

