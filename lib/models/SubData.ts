import mongoose, { Schema, Document } from 'mongoose'

export interface ISubData extends Document {
  streamerId: mongoose.Types.ObjectId
  timestamp: Date
  totalSubs: number
  paidSubs: number
  giftedSubs: number
  primeSubs?: number
  tier1Subs?: number
  tier2Subs?: number
  tier3Subs?: number
  growth: number
  createdAt: Date
}

const SubDataSchema = new Schema<ISubData>(
  {
    streamerId: {
      type: Schema.Types.ObjectId,
      ref: 'Streamer',
      required: true,
      index: true,
    },
    timestamp: {
      type: Date,
      required: true,
      index: true,
    },
    totalSubs: {
      type: Number,
      required: true,
    },
    paidSubs: {
      type: Number,
      required: true,
      default: 0,
    },
    giftedSubs: {
      type: Number,
      required: true,
      default: 0,
    },
    primeSubs: {
      type: Number,
      default: 0,
    },
    tier1Subs: {
      type: Number,
      default: 0,
    },
    tier2Subs: {
      type: Number,
      default: 0,
    },
    tier3Subs: {
      type: Number,
      default: 0,
    },
    growth: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
)

SubDataSchema.index({ streamerId: 1, timestamp: -1 })
SubDataSchema.index({ timestamp: -1 })

export default mongoose.models.SubData || mongoose.model<ISubData>('SubData', SubDataSchema)
