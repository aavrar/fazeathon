import mongoose, { Schema, Document } from 'mongoose'

export interface IStreamer extends Document {
  name: string
  twitchUsername: string
  color: string
  logoUrl?: string
  description?: string
  createdAt: Date
  updatedAt: Date
}

const StreamerSchema = new Schema<IStreamer>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    twitchUsername: {
      type: String,
      required: true,
      unique: true,
    },
    color: {
      type: String,
      required: true,
    },
    logoUrl: {
      type: String,
    },
    description: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.models.Streamer || mongoose.model<IStreamer>('Streamer', StreamerSchema)
