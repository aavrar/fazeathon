import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/lib/models/User'
import Prediction from '@/lib/models/Prediction'
import { startOfDay, endOfDay } from 'date-fns'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { anonymousId, winnerId, userStreamerSubCount, totalCombinedSubs } = body

    if (!anonymousId || !winnerId || !userStreamerSubCount || !totalCombinedSubs) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    await connectDB()

    const user = await User.findOne({ anonymousId })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (!user.teamId) {
      return NextResponse.json(
        { error: 'Must select a team before making predictions' },
        { status: 400 }
      )
    }

    const today = new Date()
    const startOfToday = startOfDay(today)
    const endOfToday = endOfDay(today)

    const existingPrediction = await Prediction.findOne({
      userId: user._id,
      date: {
        $gte: startOfToday,
        $lte: endOfToday,
      },
    })

    if (existingPrediction) {
      return NextResponse.json(
        { error: 'You have already made a prediction for today' },
        { status: 400 }
      )
    }

    const prediction = new Prediction({
      userId: user._id,
      date: startOfToday,
      predictions: {
        winnerId,
        userStreamerSubCount,
        totalCombinedSubs,
      },
      locked: true,
    })

    await prediction.save()

    user.coins += 10
    user.lastActive = new Date()
    await user.save()

    return NextResponse.json({
      success: true,
      prediction,
      coinsEarned: 10,
    })
  } catch (error) {
    console.error('Submit prediction error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
