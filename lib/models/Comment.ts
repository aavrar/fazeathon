import mongoose, { Schema, Document } from 'mongoose'

export interface IComment extends Document {
  userId: mongoose.Types.ObjectId
  streamerId: mongoose.Types.ObjectId
  text: string
  likes: number
  reported: boolean
  createdAt: Date
}

const CommentSchema = new Schema<IComment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    streamerId: {
      type: Schema.Types.ObjectId,
      ref: 'Streamer',
      required: true,
      index: true,
    },
    text: {
      type: String,
      required: true,
      maxlength: 500,
    },
    likes: {
      type: Number,
      default: 0,
    },
    reported: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
)

CommentSchema.index({ streamerId: 1, createdAt: -1 })
CommentSchema.index({ createdAt: -1 })

export default mongoose.models.Comment || mongoose.model<IComment>('Comment', CommentSchema)
