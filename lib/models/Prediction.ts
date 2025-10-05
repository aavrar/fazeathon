import mongoose, { Schema, Document } from 'mongoose'

export interface IPrediction extends Document {
  userId: mongoose.Types.ObjectId
  date: Date
  predictions: {
    winnerId: mongoose.Types.ObjectId
    userStreamerSubCount: number
    totalCombinedSubs: number
  }
  locked: boolean
  scored: boolean
  pointsAwarded: number
  coinsAwarded: number
  accuracy: {
    winnerCorrect: boolean
    subCountAccuracy: number
    totalSubsAccuracy: number
  }
  createdAt: Date
  updatedAt: Date
}

const PredictionSchema = new Schema<IPrediction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    predictions: {
      winnerId: {
        type: Schema.Types.ObjectId,
        ref: 'Streamer',
        required: true,
      },
      userStreamerSubCount: {
        type: Number,
        required: true,
      },
      totalCombinedSubs: {
        type: Number,
        required: true,
      },
    },
    locked: {
      type: Boolean,
      default: false,
    },
    scored: {
      type: Boolean,
      default: false,
      index: true,
    },
    pointsAwarded: {
      type: Number,
      default: 0,
    },
    coinsAwarded: {
      type: Number,
      default: 0,
    },
    accuracy: {
      winnerCorrect: {
        type: Boolean,
        default: false,
      },
      subCountAccuracy: {
        type: Number,
        default: 0,
      },
      totalSubsAccuracy: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
)

PredictionSchema.index({ userId: 1, date: -1 })
PredictionSchema.index({ date: -1, scored: 1 })

export default mongoose.models.Prediction || mongoose.model<IPrediction>('Prediction', PredictionSchema)
