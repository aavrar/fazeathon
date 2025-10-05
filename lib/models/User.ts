import mongoose, { Schema, Document } from 'mongoose'

export interface IUser extends Document {
  anonymousId: string
  username: string
  teamId?: mongoose.Types.ObjectId
  coins: number
  points: number
  level: number
  achievements: string[]
  currentStreak: number
  longestStreak: number
  lastPredictionDate?: Date
  totalPredictions: number
  correctPredictions: number
  referralCode: string
  referredBy?: string
  createdAt: Date
  updatedAt: Date
  lastActive: Date
}

const UserSchema = new Schema<IUser>(
  {
    anonymousId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    username: {
      type: String,
      required: true,
      index: true,
    },
    teamId: {
      type: Schema.Types.ObjectId,
      ref: 'Streamer',
      index: true,
    },
    coins: {
      type: Number,
      default: 100,
    },
    points: {
      type: Number,
      default: 0,
      index: true,
    },
    level: {
      type: Number,
      default: 1,
    },
    achievements: {
      type: [String],
      default: [],
    },
    currentStreak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
    lastPredictionDate: {
      type: Date,
    },
    totalPredictions: {
      type: Number,
      default: 0,
    },
    correctPredictions: {
      type: Number,
      default: 0,
    },
    referralCode: {
      type: String,
      unique: true,
      index: true,
    },
    referredBy: {
      type: String,
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
)

UserSchema.index({ points: -1 })
UserSchema.index({ teamId: 1, points: -1 })
UserSchema.index({ lastActive: 1 })

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
