import mongoose, { Schema, Document } from 'mongoose';

export interface IJoinedChallenge {
  challengeId?: mongoose.Types.ObjectId;
  currentDay?: number;
  completedDays?: number[];
  joinedAt?: Date;
}

export interface IMasteryProgress {
  [key: string]: {
    completedLessons?: mongoose.Types.ObjectId[];
    currentLevel?: number;
  };
}

export interface IUser extends Document {
  name: string; // Required
  email?: string;
  streak?: number;
  completedLessons?: mongoose.Types.ObjectId[];
  joinedChallenges?: IJoinedChallenge[];
  masteryProgress?: IMasteryProgress;
  certificates?: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: false,
      unique: false,
    },
    streak: {
      type: Number,
      default: 0,
    },
    completedLessons: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Lesson',
      },
    ],
    joinedChallenges: [
      {
        challengeId: {
          type: Schema.Types.ObjectId,
          ref: 'Challenge',
          required: false,
        },
        currentDay: {
          type: Number,
          default: 1,
        },
        completedDays: [
          {
            type: Number,
          },
        ],
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    masteryProgress: {
      type: Map,
      of: {
        completedLessons: [
          {
            type: Schema.Types.ObjectId,
            ref: 'Lesson',
          },
        ],
        currentLevel: {
          type: Number,
          default: 1,
        },
      },
      default: {},
    },
    certificates: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Certificate',
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

