import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/lib/models/User'
import Prediction from '@/lib/models/Prediction'
import Streamer from '@/lib/models/Streamer'
import { startOfDay, endOfDay } from 'date-fns'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const anonymousId = searchParams.get('anonymousId')

    await connectDB()

    const today = new Date()
    const startOfToday = startOfDay(today)
    const endOfToday = endOfDay(today)

    const streamers = await Streamer.find({})

    const allPredictions = await Prediction.find({
      date: {
        $gte: startOfToday,
        $lte: endOfToday,
      },
    })

    const communityStats = streamers.map((streamer) => {
      const count = allPredictions.filter(
        (p) => p.predictions.winnerId.toString() === streamer._id.toString()
      ).length

      const percentage = allPredictions.length > 0
        ? Math.round((count / allPredictions.length) * 100)
        : 0

      return {
        streamerId: streamer._id,
        streamerName: streamer.name,
        color: streamer.color,
        count,
        percentage,
      }
    }).sort((a, b) => b.count - a.count)

    let userPrediction = null

    if (anonymousId) {
      const user = await User.findOne({ anonymousId })

      if (user) {
        userPrediction = await Prediction.findOne({
          userId: user._id,
          date: {
            $gte: startOfToday,
            $lte: endOfToday,
          },
        }).populate('predictions.winnerId')
      }
    }

    return NextResponse.json({
      success: true,
      userPrediction,
      communityStats,
      totalPredictions: allPredictions.length,
    })
  } catch (error) {
    console.error('Get today predictions error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
